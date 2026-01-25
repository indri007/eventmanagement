import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const reviews = await prisma.review.findMany({
        where: { eventId: parseInt(id) },
        include: {
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json({
        success: true,
        data: reviews
      });

    } catch (error) {
      console.error('Get reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil review'
      });
    }
  } else if (req.method === 'POST') {
    try {
      // Verify JWT token
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'Token tidak ditemukan' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      const { rating, comment } = req.body;

      // Validate input
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating harus antara 1-5' });
      }

      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({ message: 'Komentar harus diisi' });
      }

      // Check if user has completed transaction for this event
      const completedTransaction = await prisma.transaction.findFirst({
        where: {
          userId,
          eventId: parseInt(id),
          status: 'DONE'
        }
      });

      if (!completedTransaction) {
        return res.status(403).json({ message: 'Anda harus menyelesaikan transaksi untuk event ini terlebih dahulu' });
      }

      // Check if user already reviewed this event
      const existingReview = await prisma.review.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId: parseInt(id)
          }
        }
      });

      if (existingReview) {
        return res.status(400).json({ message: 'Anda sudah memberikan review untuk event ini' });
      }

      // Create review
      const review = await prisma.review.create({
        data: {
          userId,
          eventId: parseInt(id),
          rating: parseInt(rating),
          comment: comment.trim()
        },
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      });

      // Update event average rating
      const allReviews = await prisma.review.findMany({
        where: { eventId: parseInt(id) }
      });

      const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await prisma.event.update({
        where: { id: parseInt(id) },
        data: {
          averageRating,
          totalReviews: allReviews.length
        }
      });

      res.status(201).json({
        success: true,
        message: 'Review berhasil ditambahkan',
        data: review
      });

    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}