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

    // Get organizer's events
    const events = await prisma.event.findMany({
      where: { organizerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            transactions: {
              where: { status: 'DONE' }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: events
    });

  } catch (error) {
    console.error('Get organizer events error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}