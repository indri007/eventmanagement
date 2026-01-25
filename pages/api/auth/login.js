import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email dan password harus diisi' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizer: true
      }
    });

    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Check password
    console.log('Checking password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

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

    console.log('Token generated successfully');

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

    console.log('Login successful for user:', email);

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server: ' + error.message });
  }
}