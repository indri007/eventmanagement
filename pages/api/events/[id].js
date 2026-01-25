import { prisma } from '../../../lib/prisma.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const event = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        include: {
          organizer: {
            select: {
              name: true,
              email: true,
              organizer: {
                select: {
                  companyName: true,
                  phone: true,
                  address: true,
                  totalEvents: true,
                  averageRating: true,
                  totalReviews: true
                }
              }
            }
          }
        }
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event tidak ditemukan'
        });
      }

      res.status(200).json({
        success: true,
        data: event
      });

    } catch (error) {
      console.error('Get event detail error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil detail event'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}