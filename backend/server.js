import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import connectMureedDB from './config/mureedDatabase.js';
import cloudinary from './config/cloudinary.js';
import { configureMureedCloudinary } from './config/mureedCloudinary.js';
import errorHandler from './middleware/errorHandler.js';

// Import Routes
import courseRoutes from './routes/courseRoutes.js';
import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import productRoutes from './routes/productRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import updateRoutes from './routes/updateRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import heroSlideRoutes from './routes/heroSlideRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import lmsRoutes from './routes/lmsRoutes.js';
import lmsFeeRoutes from './routes/lmsFeeRoutes.js';
import mureedRoutes from './routes/mureedRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import donationPageRoutes from './routes/donationPageRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Trust proxy for Render/Railway/etc (fixes X-Forwarded-For issues)
app.set('trust proxy', 1);

// Connect to MongoDB (Main Database)
connectDB();

// Connect to Mureed MongoDB (Separate Database)
connectMureedDB();

// Configure Mureed Cloudinary (Separate Account)
configureMureedCloudinary();

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// 🛡️ Security Middleware
// Helmet - Sets various HTTP headers for security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Rate Limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Rate limit for auth routes (login, register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 attempts per 15 minutes
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// MongoDB injection sanitization
app.use(mongoSanitize());

// CORS Configuration - Allow all origins to fix CORS issues
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

// Health Check Route
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStates[dbState] || 'unknown',
      readyState: dbState,
      host: mongoose.connection.host || 'not connected',
      name: mongoose.connection.name || 'not connected',
    },
    environment: process.env.NODE_ENV,
    mongoUriSet: !!process.env.MONGODB_URI,
    mureedUriSet: !!process.env.MUREED_MONGODB_URI,
  });
});

// DB Debug Route - check database connectivity
app.get('/api/db-status', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    let pingResult = null;
    if (dbState === 1) {
      try {
        pingResult = await mongoose.connection.db.admin().ping();
      } catch (pingErr) {
        pingResult = { error: pingErr.message };
      }
    }

    res.status(200).json({
      success: true,
      database: {
        status: dbStates[dbState] || 'unknown',
        readyState: dbState,
        host: mongoose.connection.host || 'not connected',
        name: mongoose.connection.name || 'not connected',
        ping: pingResult,
      },
      mongoUriSet: !!process.env.MONGODB_URI,
      mureedUriSet: !!process.env.MUREED_MONGODB_URI,
      env: process.env.NODE_ENV,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database status check failed',
      error: error.message,
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/hero-slides', heroSlideRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/fee', feeRoutes);
app.use('/api/lms', lmsRoutes);
app.use('/api/lms/fees', lmsFeeRoutes);
app.use('/api/mureeds', mureedRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/donation-pages', donationPageRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/sessions', sessionRoutes);

// Error Handler Middleware (must be last)
app.use(errorHandler);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('⚠️  UNHANDLED REJECTION:');
  console.error(err);
  console.log('Server will continue running...');
});
