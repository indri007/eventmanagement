import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../lib/prisma-client'

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar!'
      })
    }

    // Validate referral code if provided
    let referrer = null
    if (referralCode) {
      referrer = await prisma.user.findUnique({
        where: { referralCode }
      })

      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: 'Kode referral tidak valid!'
        })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate unique referral code
    let newReferralCode
    let isUnique = false
    while (!isUnique) {
      newReferralCode = generateReferralCode()
      const codeCheck = await prisma.user.findUnique({
        where: { referralCode: newReferralCode }
      })
      isUnique = !codeCheck
    }

    // Create user with transaction
    const newUser = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role.toUpperCase(),
          referralCode: newReferralCode,
          referredBy: referrer?.id,
          points: role === 'customer' ? 50000 : 0,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          points: true,
          referralCode: true
        }
      })

      // Give bonus points to referrer
      if (referrer) {
        await tx.user.update({
          where: { id: referrer.id },
          data: {
            points: { increment: 25000 },
            totalReferrals: { increment: 1 }
          }
        })
      }

      // Create organizer profile if role is organizer
      if (role.toUpperCase() === 'ORGANIZER') {
        await tx.organizer.create({
          data: {
            userId: user.id,
            companyName: name
          }
        })
      }

      return user
    })

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

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