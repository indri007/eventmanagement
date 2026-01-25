import { prisma } from '../../../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Find expired transactions
    const expiredTransactions = await prisma.transaction.findMany({
      where: {
        status: 'WAITING_PAYMENT',
        expiresAt: {
          lt: new Date()
        }
      },
      include: {
        event: true,
        user: true
      }
    });

    console.log(`Found ${expiredTransactions.length} expired transactions`);

    for (const transaction of expiredTransactions) {
      // Update transaction status to EXPIRED
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'EXPIRED' }
      });

      // Return seats to event
      await prisma.event.update({
        where: { id: transaction.eventId },
        data: {
          availableSeats: { increment: transaction.quantity }
        }
      });

      // Return points to user if used
      if (transaction.pointsUsed > 0) {
        await prisma.user.update({
          where: { id: transaction.userId },
          data: {
            points: { increment: transaction.pointsUsed }
          }
        });
      }

      // Create notification
      await prisma.notification.create({
        data: {
          userId: transaction.userId,
          title: 'Transaksi Kedaluwarsa',
          message: `Transaksi untuk event "${transaction.event.title}" telah kedaluwarsa karena tidak ada pembayaran dalam batas waktu yang ditentukan.`,
          type: 'SYSTEM'
        }
      });

      console.log(`Expired transaction ${transaction.id} for event ${transaction.event.title}`);
    }

    res.status(200).json({
      success: true,
      message: `Processed ${expiredTransactions.length} expired transactions`
    });

  } catch (error) {
    console.error('Expire transactions error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}