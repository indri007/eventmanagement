// Next.js API route for events
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // For now, return mock data since Prisma might not be configured
      const mockEvents = [
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
        },
        {
          id: 3,
          title: 'Festival Makanan Nusantara',
          description: 'Jelajahi cita rasa kuliner tradisional Indonesia',
          date: '2025-02-25',
          time: '10:00',
          location: 'Taman Mini Indonesia Indah',
          price: 75000,
          category: 'makanan',
          availableSeats: 200,
          totalSeats: 300,
          icon: '🍜'
        },
        {
          id: 4,
          title: 'Turnamen E-Sports Mobile Legends',
          description: 'Kompetisi gaming terbesar tahun ini',
          date: '2025-03-01',
          time: '13:00',
          location: 'Jakarta International Expo',
          price: 50000,
          category: 'olahraga',
          availableSeats: 500,
          totalSeats: 1000,
          icon: '🎮'
        }
      ]

      const { category, search, limit = 50, offset = 0 } = req.query
      let filteredEvents = mockEvents

      // Filter by category
      if (category) {
        filteredEvents = filteredEvents.filter(event => event.category === category)
      }

      // Filter by search term
      if (search) {
        const searchLower = search.toLowerCase()
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower)
        )
      }

      // Apply pagination
      const startIndex = parseInt(offset)
      const endIndex = startIndex + parseInt(limit)
      const paginatedEvents = filteredEvents.slice(startIndex, endIndex)

      res.status(200).json({
        success: true,
        data: paginatedEvents,
        total: filteredEvents.length
      })
    } catch (error) {
      console.error('Get events error:', error)
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data event'
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}