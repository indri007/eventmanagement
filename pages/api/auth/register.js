// Generate referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { name, email, password, role, referralCode } = req.body

    // Mock user storage (in production, this would be database)
    const existingUsers = [
      { email: 'admin@eventku.com' },
      { email: 'customer@demo.com' }
    ]

    // Check if user already exists
    const existingUser = existingUsers.find(u => u.email === email)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar!'
      })
    }

    // Validate referral code if provided
    const validReferralCodes = ['ADMIN001', 'CUST001', 'WELCOME2025']
    if (referralCode && !validReferralCodes.includes(referralCode)) {
      return res.status(400).json({
        success: false,
        message: 'Kode referral tidak valid!'
      })
    }

    // Generate new referral code
    const newReferralCode = generateReferralCode()

    // Create new user (mock)
    const newUser = {
      id: Date.now(), // Mock ID
      name,
      email,
      role: role.toUpperCase(),
      points: role === 'customer' ? 50000 : 0,
      referralCode: newReferralCode
    }

    // Generate mock JWT token
    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`

    res.status(201).json({
      success: true,
      message: 'Akun berhasil dibuat!',
      data: {
        user: newUser,
        token
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mendaftar'
    })
  }
}