import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { category, search, limit = 50, offset = 0 } = req.query
      
      // Build where clause for filtering
      const where = {}
      
      // Filter by category (case insensitive)
      if (category) {
        where.category = category
      }
      
      // Filter by search term (search in title, description, location)
      if (search) {
        const searchLower = search.toLowerCase()
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } }
        ]
      }
      
      // Get events from database
      const events = await prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          date: 'asc'
        },
        skip: parseInt(offset),
        take: parseInt(limit)
      })
      
      // Get total count for pagination
      const total = await prisma.event.count({ where })
      
      // Format events for frontend
      const formattedEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        price: event.price,
        category: event.category,
        availableSeats: event.availableSeats,
        totalSeats: event.totalSeats,
        icon: event.icon,
        averageRating: event.averageRating,
        totalReviews: event.totalReviews,
        organizer: event.organizer
      }))

      res.status(200).json({
        success: true,
        data: formattedEvents,
        total
      })
    } catch (error) {
      console.error('Get events error:', error)
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data event'
      })
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

      // Verify user is organizer
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.role !== 'ORGANIZER') {
        return res.status(403).json({ message: 'Hanya organizer yang dapat membuat event' });
      }

      const { title, description, date, time, location, category, price, totalSeats, icon } = req.body;

      // Validate input
      if (!title || !description || !date || !time || !location || !category || !totalSeats) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
      }

      // Create event
      const event = await prisma.event.create({
        data: {
          title,
          description,
          date: new Date(date),
          time,
          location,
          category,
          price: parseInt(price) || 0,
          totalSeats: parseInt(totalSeats),
          availableSeats: parseInt(totalSeats),
          organizerId: userId,
          icon: icon || '🎉'
        }
      });

      // Update organizer total events
      await prisma.organizer.update({
        where: { userId },
        data: {
          totalEvents: { increment: 1 }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Event berhasil dibuat',
        data: event
      });

    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}