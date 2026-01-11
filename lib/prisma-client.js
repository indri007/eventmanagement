import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Test database connection
export async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Connected to database via Prisma')
    return true
  } catch (error) {
    console.log('⚠️  Database not available:', error.message)
    console.log('   Using fallback mode')
    return false
  }
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}