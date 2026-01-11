export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    // Mock authentication for demo
    // In production, this would check against database
    const mockUsers = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@eventku.com',
        password: 'admin123', // In real app, this would be hashed
        role: 'ORGANIZER',
        points: 0,
        referralCode: 'ADMIN001'
      },
      {
        id: 2,
        name: 'Customer Demo',
        email: 'customer@demo.com',
        password: 'demo123',
        role: 'CUSTOMER',
        points: 75000,
        referralCode: 'CUST001'
      }
    ]

    const user = mockUsers.find(u => u.email === email && u.password === password)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah!'
      })
    }

    // Generate mock JWT token (in production, use proper JWT)
    const token = `mock-jwt-token-${user.id}-${Date.now()}`

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      message: `Selamat datang, ${user.name}!`,
      data: {
        user: userWithoutPassword,
        token
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat login'
    })
  }
}