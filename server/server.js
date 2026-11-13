require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { connectDB } = require('./config/db');
const { initSocket } = require('./services/socketService');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const User = require('./models/User');
const { seedData } = require('./seeds/seed');

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
initSocket(server);

// Security & Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder for locally uploaded media
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API v1 Routes
app.use('/api/v1', apiRoutes);

// Root Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'CivicFix API',
    version: '1.0.0',
    description: 'Local Civic Issue Reporting System REST & WebSocket API',
    documentation: '/api/v1/health',
  });
});

// 404 & Central Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server after connecting to database
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database has no users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[CivicFix Server] Empty database detected. Running initial seed...');
      await seedData(false);
    }

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ [CivicFix Server] Port ${PORT} is already in use!`);
        console.error(`👉 Reason: Another process (or Docker container) is already using port ${PORT}.`);
        console.error(`👉 Fix: Stop the existing process or run:`);
        console.error(`   PowerShell: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
        console.error(`   Docker:     docker compose down\n`);
      } else {
        console.error('[CivicFix Server] Error:', err.message);
      }
      process.exit(1);
    });

    server.listen(PORT, () => {
      console.log(`[CivicFix Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[CivicFix Server] API Base URL: http://localhost:${PORT}/api/v1`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
