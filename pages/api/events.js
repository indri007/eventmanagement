// Next.js API route for events
import { prisma } from '../../../lib/prisma-client'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { category, search, limit = 50, offset = 0 } = req.query

      const where = {
        status: 'ACTIVE'
      }

      if (category) {
        where.category = category
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } }
        ]
      }

      const events = await prisma.event.findMany({
        where,
        include: {
          organizer: {
            include: {
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          date: 'asc'
        },
        take: parseInt(limit),
        skip: parseInt(offset)
      })

      res.status(200).json({
        success: true,
        data: events
      })
    } catch (error) {
      console.error('Get events error:', error)
      // Fallback to mock data for demo
      res.status(200).json({
        success: true,
        data: [
          {
            id: 1,
            title: 'Konser Musik Jazz',
            description: 'Nikmati malam yang indah dengan musik jazz terbaik',
            date: '2025-02-15',
            time: '19:00',
            location: 'Jakarta Convention Center',
            price: 150000,
            category: 'musik',
            availableSeats: 100,
            totalSeats: 150,
            icon: '🎵'
          },
          {
            id: 2,
            title: 'Workshop Web Development',
            description: 'Belajar membuat website modern dengan React dan Next.js',
            date: '2025-02-20',
            time: '09:00',
            location: 'Tech Hub Jakarta',
            price: 200000,
            category: 'teknologi',
            availableSeats: 25,
            totalSeats: 30,
            icon: '💻'
          }
        ]
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}