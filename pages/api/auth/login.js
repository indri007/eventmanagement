import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password harus diisi' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizer: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
      referralCode: user.referralCode,
      totalReferrals: user.totalReferrals,
      organizer: user.organizer
    };

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}