import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (optional - for production)
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
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
        console.error('Upload error:', err);
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'File bukti pembayaran harus diupload' });
      }

      try {
        let fileUrl = null;
        let fileName = `proof-${Date.now()}-${Math.round(Math.random() * 1E9)}`;

        // Try to upload to Cloudinary if configured
        if (process.env.CLOUDINARY_CLOUD_NAME) {
          try {
            const uploadResult = await new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                {
                  resource_type: 'image',
                  folder: 'eventku/payment-proofs',
                  public_id: fileName,
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              ).end(req.file.buffer);
            });

            fileUrl = uploadResult.secure_url;
            fileName = uploadResult.public_id;
            console.log('File uploaded to Cloudinary:', fileUrl);
          } catch (cloudinaryError) {
            console.error('Cloudinary upload failed:', cloudinaryError);
            // Fallback to just saving filename
          }
        }

        // Update transaction with payment proof
        await prisma.transaction.update({
          where: { id: parseInt(id) },
          data: {
            paymentProof: fileUrl || fileName,
            status: 'WAITING_CONFIRMATION'
          }
        });

        res.status(200).json({
          success: true,
          message: 'Bukti pembayaran berhasil diupload',
          fileUrl: fileUrl || null
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