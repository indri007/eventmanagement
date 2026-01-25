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
      where: { id: userId },
      include: { organizer: true }
    });

    if (!user || user.role !== 'ORGANIZER') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    // Get organizer stats
    const totalEvents = await prisma.event.count({
      where: { organizerId: userId }
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        event: {
          organizerId: userId
        },
        status: 'DONE'
      }
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + t.finalPrice, 0);
    const totalTicketsSold = transactions.reduce((sum, t) => sum + t.quantity, 0);

    const pendingTransactions = await prisma.transaction.count({
      where: {
        event: {
          organizerId: userId
        },
        status: 'WAITING_CONFIRMATION'
      }
    });

    const stats = {
      totalEvents,
      totalRevenue,
      totalTicketsSold,
      pendingTransactions
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get organizer stats error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}