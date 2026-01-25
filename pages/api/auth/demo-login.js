import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Demo accounts for testing
    const demoAccounts = [
      {
        id: 999,
        name: 'Demo Admin',
        email: 'admin@eventku.com',
        password: 'admin123',
        role: 'ORGANIZER',
        points: 0,
        referralCode: 'ADMIN999',
        totalReferrals: 0
      },
      {
        id: 998,
        name: 'Demo Customer',
        email: 'customer@demo.com',
        password: 'demo123',
        role: 'CUSTOMER',
        points: 75000,
        referralCode: 'CUST998',
        totalReferrals: 0
      }
    ];

    const user = demoAccounts.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ message: 'Demo account not found' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userData } = user;

    res.status(200).json({
      success: true,
      message: 'Demo login berhasil',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server: ' + error.message });
  }
}