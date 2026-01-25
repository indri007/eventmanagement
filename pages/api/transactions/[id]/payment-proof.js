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
    if (!transaction.paymentProof) {
      console.log('No payment proof found for transaction:', id);
      return res.status(404).json({ message: 'Bukti pembayaran tidak ditemukan' });
    }

    console.log('Payment proof found:', transaction.paymentProof);

    // For demo purposes, return a placeholder image with transaction info
    // In production, you would retrieve the actual image from cloud storage
    const placeholderSvg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0" stroke="#ddd" stroke-width="2"/>
        <text x="200" y="50" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold">Bukti Pembayaran</text>
        <text x="200" y="80" text-anchor="middle" font-family="Arial" font-size="14">Transaksi ID: ${id}</text>
        <text x="200" y="110" text-anchor="middle" font-family="Arial" font-size="14">File: ${transaction.paymentProof}</text>
        <text x="200" y="140" text-anchor="middle" font-family="Arial" font-size="14">Status: ${transaction.status}</text>
        <text x="200" y="170" text-anchor="middle" font-family="Arial" font-size="14">Upload: ${new Date(transaction.updatedAt).toLocaleDateString('id-ID')}</text>
        <text x="200" y="220" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">Demo Mode: Bukti pembayaran berhasil diupload</text>
        <text x="200" y="240" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">Dalam produksi, gambar asli akan ditampilkan</text>
        <rect x="150" y="260" width="100" height="30" fill="#4CAF50" rx="5"/>
        <text x="200" y="280" text-anchor="middle" font-family="Arial" font-size="12" fill="white">✓ Verified</text>
      </svg>
    `;

    // Set appropriate headers for SVG response
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache');
    
    res.status(200).send(placeholderSvg);

  } catch (error) {
    console.error('Get payment proof error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server: ' + error.message });
  }
}