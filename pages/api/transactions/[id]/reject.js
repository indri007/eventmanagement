import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'POST') {
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

    const { reason } = req.body;

    console.log('Reject transaction attempt:', id, 'by user:', userId, 'reason:', reason);

    // Get transaction details with event info
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        event: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!transaction) {
      console.log('Transaction not found:', id);
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    // Check if user is the organizer of this event
    if (transaction.event.organizerId !== userId) {
      console.log('Access denied for user:', userId, 'event organizer:', transaction.event.organizerId);
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    // Check if transaction is in correct status
    if (transaction.status !== 'WAITING_CONFIRMATION') {
      console.log('Invalid transaction status:', transaction.status);
      return res.status(400).json({ message: 'Transaksi tidak dapat ditolak' });
    }

    console.log('Rejecting transaction:', id);

    // Start transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Update transaction status to REJECTED
      await tx.transaction.update({
        where: { id: parseInt(id) },
        data: {
          status: 'REJECTED'
        }
      });

      // Return seats to event availability
      await tx.event.update({
        where: { id: transaction.eventId },
        data: {
          availableSeats: { increment: transaction.quantity }
        }
      });
    });

    console.log('Transaction rejected successfully:', id, 'seats returned:', transaction.quantity);

    res.status(200).json({
      success: true,
      message: 'Transaksi berhasil ditolak dan kursi dikembalikan'
    });

  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server: ' + error.message });
  }
}