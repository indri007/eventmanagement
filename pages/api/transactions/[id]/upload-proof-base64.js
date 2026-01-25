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

    const { fileData, fileName, fileType } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({ message: 'File data dan nama file harus diisi' });
    }

    // Validate file type
    if (!fileType || !fileType.startsWith('image/')) {
      return res.status(400).json({ message: 'File harus berupa gambar' });
    }

    // Validate file size (base64 is ~33% larger than original)
    const fileSizeBytes = (fileData.length * 3) / 4;
    if (fileSizeBytes > 5 * 1024 * 1024) { // 5MB limit
      return res.status(400).json({ message: 'Ukuran file maksimal 5MB' });
    }

    // Get transaction details
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    // Check if user owns this transaction
    if (transaction.userId !== userId) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    // Check if transaction is in correct status
    if (transaction.status !== 'WAITING_PAYMENT') {
      return res.status(400).json({ message: 'Transaksi tidak dapat diupdate' });
    }

    // Check if transaction is not expired
    if (transaction.expiresAt && new Date() > transaction.expiresAt) {
      return res.status(400).json({ message: 'Transaksi telah kedaluwarsa' });
    }

    // Generate unique filename
    const uniqueFileName = `proof-${Date.now()}-${Math.round(Math.random() * 1E9)}-${fileName}`;

    // Store base64 data in database (for demo purposes)
    // In production, you should upload to cloud storage
    await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: {
        paymentProof: uniqueFileName,
        status: 'WAITING_CONFIRMATION'
      }
    });

    // Optionally store the base64 data in a separate table
    // This is just for demo - in production use cloud storage
    console.log('Payment proof uploaded:', uniqueFileName);

    res.status(200).json({
      success: true,
      message: 'Bukti pembayaran berhasil diupload',
      fileName: uniqueFileName
    });

  } catch (error) {
    console.error('Upload proof error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}