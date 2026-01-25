import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma.js';

export default async function handler(req, res) {
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

    // Verify user is organizer
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== 'ORGANIZER') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    // Get transactions for organizer's events
    const transactions = await prisma.transaction.findMany({
      where: {
        event: {
          organizerId: userId
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        event: {
          select: {
            title: true,
            date: true,
            time: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('Get organizer transactions error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}