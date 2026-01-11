const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./lib/prisma');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname)));

// Initialize database connection
testConnection().then((connected) => {
  if (connected) {
    // Load API routes only if database is connected
    const authRoutes = require('./routes/auth');
    const eventRoutes = require('./routes/events');
    const transactionRoutes = require('./routes/transactions');
    const reviewRoutes = require('./routes/reviews');
    const dashboardRoutes = require('./routes/dashboard');
    const userRoutes = require('./routes/users');

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/events', eventRoutes);
    app.use('/api/transactions', transactionRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/users', userRoutes);
    
    console.log('📊 API endpoints loaded successfully');
  } else {
    console.log('📱 Running in frontend-only mode with localStorage');
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { prisma } = require('./lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
      mode: 'full-stack',
      orm: 'prisma'
    });
  } catch (error) {
    res.json({
      status: 'ok',
      database: 'disconnected',
      mode: 'frontend-only',
      orm: 'prisma'
    });
  }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 EventKu server running on http://localhost:${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
  console.log(`📊 API health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Database: Prisma ORM with PostgreSQL`);
});