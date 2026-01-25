import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/payment-proofs';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('File harus berupa gambar'));
    }
  }
});

// Disable Next.js body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

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

    // Handle file upload
    upload.single('paymentProof')(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'File bukti pembayaran harus diupload' });
      }

      try {
        // Update transaction with payment proof
        await prisma.transaction.update({
          where: { id: parseInt(id) },
          data: {
            paymentProof: req.file.filename,
            status: 'WAITING_CONFIRMATION'
          }
        });

        res.status(200).json({
          success: true,
          message: 'Bukti pembayaran berhasil diupload'
        });

      } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
      }
    });

  } catch (error) {
    console.error('Upload proof error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}