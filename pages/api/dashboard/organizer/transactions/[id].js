import jwt from 'jsonwebtoken';
import { prisma } from '../../../../../lib/prisma.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify JWT token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Verify user is organizer
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== 'ORGANIZER') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const { action } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action tidak valid' });
    }

    // Get transaction details
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        event: true,
        user: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    // Verify organizer owns this event
    if (transaction.event.organizerId !== userId) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    if (transaction.status !== 'WAITING_CONFIRMATION') {
      return res.status(400).json({ message: 'Transaksi tidak dapat diproses' });
    }

    if (action === 'approve') {
      // Approve transaction
      await prisma.transaction.update({
        where: { id: parseInt(id) },
        data: { status: 'DONE' }
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: transaction.userId,
          title: 'Pembayaran Disetujui',
          message: `Pembayaran Anda untuk event "${transaction.event.title}" telah disetujui!`,
          type: 'PAYMENT_APPROVED'
        }
      });

    } else if (action === 'reject') {
      // Reject transaction
      await prisma.transaction.update({
        where: { id: parseInt(id) },
        data: { status: 'REJECTED' }
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
          title: 'Pembayaran Ditolak',
          message: `Pembayaran Anda untuk event "${transaction.event.title}" ditolak. Silakan hubungi organizer untuk informasi lebih lanjut.`,
          type: 'PAYMENT_REJECTED'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Transaksi berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}`
    });

  } catch (error) {
    console.error('Transaction action error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}