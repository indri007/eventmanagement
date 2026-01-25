import jwt from 'jsonwebtoken';
import { prisma } from '../../../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Verify JWT token
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'Token tidak ditemukan' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      const { eventId, quantity, pointsUsed } = req.body;

      // Validate input
      if (!eventId || !quantity || quantity < 1) {
        return res.status(400).json({ message: 'Data tidak valid' });
      }

      // Get event details
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      });

      if (!event) {
        return res.status(404).json({ message: 'Event tidak ditemukan' });
      }

      if (event.availableSeats < quantity) {
        return res.status(400).json({ message: 'Kursi tidak mencukupi' });
      }

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      // Validate points usage
      const maxPointsUsage = Math.min(pointsUsed || 0, user.points, event.price * quantity);
      const originalPrice = event.price * quantity;
      const finalPrice = originalPrice - maxPointsUsage;

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          eventId,
          quantity,
          originalPrice,
          pointsUsed: maxPointsUsage,
          finalPrice,
          status: 'WAITING_PAYMENT',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });

      // Update event available seats
      await prisma.event.update({
        where: { id: eventId },
        data: {
          availableSeats: { decrement: quantity }
        }
      });

      // Update user points if used
      if (maxPointsUsage > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            points: { decrement: maxPointsUsage }
          }
        });
      }

      res.status(201).json({
        success: true,
        message: 'Transaksi berhasil dibuat',
        data: transaction
      });

    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  } else if (req.method === 'GET') {
    try {
      // Get user transactions
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'Token tidak ditemukan' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      const transactions = await prisma.transaction.findMany({
        where: { userId },
        include: {
          event: {
            select: {
              title: true,
              date: true,
              time: true,
              location: true,
              icon: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json({
        success: true,
        data: transactions
      });

    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}