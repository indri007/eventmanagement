import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
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

    console.log('Payment proof request for transaction:', id, 'by user:', userId);

    // Get transaction details
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        event: {
          select: {
            organizerId: true
          }
        }
      }
    });

    if (!transaction) {
      console.log('Transaction not found:', id);
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    // Check if user owns this transaction OR is the organizer
    const isOwner = transaction.userId === userId;
    const isOrganizer = transaction.event.organizerId === userId;
    
    if (!isOwner && !isOrganizer) {
      console.log('Access denied for user:', userId);
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    // Check if payment proof exists
    if (!transaction.paymentProofData) {
      console.log('No payment proof data found for transaction:', id);
      return res.status(404).json({ message: 'Bukti pembayaran tidak ditemukan' });
    }

    console.log('Payment proof found, serving Base64 image');

    // Set appropriate headers for image response
    const mimeType = transaction.paymentProofType || 'image/jpeg';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Convert Base64 to buffer and send as image
    const imageBuffer = Buffer.from(transaction.paymentProofData, 'base64');
    res.status(200).send(imageBuffer);

  } catch (error) {
    console.error('Get payment proof error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server: ' + error.message });
  }
}