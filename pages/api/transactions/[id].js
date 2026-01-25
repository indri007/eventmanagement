import jwt from 'jsonwebtoken';
import { prisma } from '../../../lib/prisma.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
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
        where: { id: parseInt(id) },
        include: {
          event: {
            select: {
              title: true,
              date: true,
              time: true,
              location: true,
              icon: true
            }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      if (!transaction) {
        return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
      }

      // Check if user owns this transaction
      if (transaction.userId !== userId) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }

      res.status(200).json({
        success: true,
        data: transaction
      });

    } catch (error) {
      console.error('Get transaction detail error:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}