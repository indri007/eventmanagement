// API route for getting pending transactions (admin)
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // For demo purposes, return mock data
    // In production, this would query the database for pending transactions
    const mockTransactions = [
      {
        id: 1,
        eventTitle: 'Konser Musik Jazz',
        quantity: 2,
        finalPrice: 300000,
        pointsUsed: 0,
        createdAt: new Date().toISOString(),
        paymentProof: 'payment-proof-1.jpg',
        status: 'waiting_confirmation'
      },
      {
        id: 2,
        eventTitle: 'Workshop Web Development',
        quantity: 1,
        finalPrice: 150000,
        pointsUsed: 50000,
        createdAt: new Date().toISOString(),
        paymentProof: 'payment-proof-2.jpg',
        status: 'waiting_confirmation'
      }
    ]

    res.status(200).json(mockTransactions)
  } catch (error) {
    console.error('Get pending transactions error:', error)
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data transaksi'
    })
  }
}