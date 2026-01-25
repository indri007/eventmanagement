// prisma/seed.mjs
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.event.deleteMany();
  await prisma.organizer.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing data');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('demo123', 10);

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin EventKu',
      email: 'admin@eventku.com',
      password: adminPassword,
      role: 'ORGANIZER',
      referralCode: 'ADMIN001',
      points: 0,
      totalReferrals: 5,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: 'Customer Demo',
      email: 'customer@demo.com',
      password: customerPassword,
      role: 'CUSTOMER',
      referralCode: 'CUST001',
      points: 75000,
      totalReferrals: 2,
    },
  });

  console.log('👥 Created users');

  // Create organizer profile
  await prisma.organizer.create({
    data: {
      userId: adminUser.id,
      companyName: 'EventKu Productions',
      phone: '+62812345678',
      address: 'Jakarta, Indonesia',
      totalEvents: 6,
      averageRating: 4.5,
      totalReviews: 120,
    },
  });

  console.log('🏢 Created organizer profile');

  // Create events
  const events = [
    {
      title: 'Konser Musik Jazz Malam',
      description: 'Nikmati malam yang penuh dengan alunan musik jazz dari musisi terbaik Indonesia dan internasional.',
      date: new Date('2025-12-15'),
      time: '19:00',
      location: 'Jakarta Convention Center',
      category: 'MUSIK',
      price: 250000,
      availableSeats: 500,
      totalSeats: 500,
      icon: '🎵',
    },
    {
      title: 'Workshop Web Development',
      description: 'Belajar membuat website modern dengan teknologi terkini. Cocok untuk pemula hingga menengah.',
      date: new Date('2025-12-10'),
      time: '09:00',
      location: 'Tech Hub Bandung',
      category: 'TEKNOLOGI',
      price: 150000,
      availableSeats: 50,
      totalSeats: 50,
      icon: '💻',
    },
    {
      title: 'Marathon Jakarta 2025',
      description: 'Ikuti marathon tahunan terbesar di Jakarta. Tersedia kategori 5K, 10K, dan 21K.',
      date: new Date('2025-12-20'),
      time: '05:00',
      location: 'Bundaran HI, Jakarta',
      category: 'OLAHRAGA',
      price: 100000,
      availableSeats: 1000,
      totalSeats: 1000,
      icon: '🏃',
    },
    {
      title: 'Pameran Seni Kontemporer',
      description: 'Pameran karya seni kontemporer dari seniman lokal dan internasional.',
      date: new Date('2025-12-08'),
      time: '10:00',
      location: 'Galeri Nasional Indonesia',
      category: 'SENI',
      price: 50000,
      availableSeats: 200,
      totalSeats: 200,
      icon: '🎨',
    },
    {
      title: 'Startup Pitch Competition',
      description: 'Kompetisi pitch untuk startup. Hadiah total 500 juta rupiah!',
      date: new Date('2025-12-18'),
      time: '13:00',
      location: 'Surabaya Business Center',
      category: 'BISNIS',
      price: 0,
      availableSeats: 300,
      totalSeats: 300,
      icon: '💼',
    },
    {
      title: 'Festival Kuliner Nusantara',
      description: 'Jelajahi kekayaan kuliner Indonesia dari Sabang sampai Merauke.',
      date: new Date('2025-12-25'),
      time: '11:00',
      location: 'Lapangan Banteng, Jakarta',
      category: 'MAKANAN',
      price: 0,
      availableSeats: 2000,
      totalSeats: 2000,
      icon: '🍜',
    },
  ];

  const createdEvents = [];
  for (const eventData of events) {
    const event = await prisma.event.create({
      data: {
        ...eventData,
        organizerId: adminUser.id,
      },
    });
    createdEvents.push(event);
  }

  console.log('🎪 Created events');

  // Create sample reviews
  const reviews = [
    {
      userId: customerUser.id,
      eventId: createdEvents[0].id,
      rating: 5,
      comment: 'Event yang luar biasa! Musiknya sangat bagus dan suasananya sangat menyenangkan. Pasti akan datang lagi tahun depan!',
    },
    {
      userId: customerUser.id,
      eventId: createdEvents[1].id,
      rating: 5,
      comment: 'Workshop yang sangat bermanfaat! Materinya up-to-date dan instrukturnya sangat kompeten. Highly recommended!',
    },
    {
      userId: customerUser.id,
      eventId: createdEvents[2].id,
      rating: 4,
      comment: 'Marathon yang well-organized. Rute bagus dan support station lengkap. Cuma cuacanya agak panas.',
    },
  ];

  for (const reviewData of reviews) {
    await prisma.review.create({
      data: reviewData,
    });
  }

  console.log('⭐ Created reviews');

  // Update event ratings
  for (const event of createdEvents) {
    const eventReviews = await prisma.review.findMany({
      where: { eventId: event.id },
    });

    if (eventReviews.length > 0) {
      const averageRating = eventReviews.reduce((sum, review) => sum + review.rating, 0) / eventReviews.length;
      
      await prisma.event.update({
        where: { id: event.id },
        data: {
          averageRating,
          totalReviews: eventReviews.length,
        },
      });
    }
  }

  // Create sample transaction
  await prisma.transaction.create({
    data: {
      userId: customerUser.id,
      eventId: createdEvents[0].id,
      quantity: 1,
      originalPrice: 250000,
      pointsUsed: 0,
      finalPrice: 250000,
      status: 'DONE',
      paymentProof: 'sample_proof.jpg',
    },
  });

  console.log('💳 Created sample transaction');

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: customerUser.id,
      title: 'Pembayaran Diterima',
      message: 'Pembayaran Anda untuk event "Konser Musik Jazz Malam" telah diterima!',
      type: 'PAYMENT_APPROVED',
    },
  });

  console.log('🔔 Created notifications');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });