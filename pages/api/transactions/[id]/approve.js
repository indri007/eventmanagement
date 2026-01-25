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

    console.log('Approve transaction attempt:', id, 'by user:', userId);

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
      return res.status(400).json({ message: 'Transaksi tidak dapat disetujui' });
    }

    // Check if payment proof exists
    if (!transaction.paymentProof) {
      console.log('No payment proof found');
      return res.status(400).json({ message: 'Bukti pembayaran tidak ditemukan' });
    }

    console.log('Approving transaction:', id);

    // Update transaction status to DONE
    await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: {
        status: 'DONE'
      }
    });

    console.log('Transaction approved successfully:', id);

    res.status(200).json({
      success: true,
      message: 'Transaksi berhasil disetujui'
    });

  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server: ' + error.message });
  }
}