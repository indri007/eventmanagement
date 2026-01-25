import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis;

// Setup Pool Koneksi PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter, // WAJIB di Prisma 7 untuk koneksi database langsung
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test database connection
async function testConnection() {
  try {
    // Di Prisma 7, koneksi divalidasi melalui adapter
    await prisma.$connect();
    console.log('✅ Connected to database via Prisma (v7 Adapter)');
    return true;
  } catch (error) {
    console.error('⚠️  Database not available:', error.message);
    return false;
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end(); // Tutup pool koneksi pg
});

export { prisma, testConnection };
