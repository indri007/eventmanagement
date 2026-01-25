import bcrypt from 'bcrypt';
import { prisma } from '../../../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, password, role, referralCode } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password harus diisi' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique referral code
    const generateReferralCode = () => {
      const prefix = role === 'ORGANIZER' ? 'ORG' : 'USR';
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `${prefix}${random}`;
    };

    let newReferralCode = generateReferralCode();
    
    // Ensure referral code is unique
    let existingReferral = await prisma.user.findUnique({
      where: { referralCode: newReferralCode }
    });
    
    while (existingReferral) {
      newReferralCode = generateReferralCode();
      existingReferral = await prisma.user.findUnique({
        where: { referralCode: newReferralCode }
      });
    }

    // Handle referral if provided
    let referrerUser = null;
    if (referralCode) {
      referrerUser = await prisma.user.findUnique({
        where: { referralCode }
      });
    }

    // Create user
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || 'CUSTOMER',
      referralCode: newReferralCode,
      points: referrerUser ? 10000 : 0, // Bonus 10k points if using referral
      referredBy: referrerUser?.id || null
    };

    const newUser = await prisma.user.create({
      data: userData
    });

    // Update referrer's points and referral count
    if (referrerUser) {
      await prisma.user.update({
        where: { id: referrerUser.id },
        data: {
          points: { increment: 10000 }, // Referrer gets 10k points
          totalReferrals: { increment: 1 }
        }
      });
    }

    // Create organizer profile if role is ORGANIZER
    if (role === 'ORGANIZER') {
      await prisma.organizer.create({
        data: {
          userId: newUser.id,
          companyName: name, // Default to user name
          totalEvents: 0,
          averageRating: 0,
          totalReviews: 0
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Silakan login.',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        referralCode: newUser.referralCode,
        points: newUser.points
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}