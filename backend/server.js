const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

console.log('🚀 Starting OPPTYM Backend...');
console.log('📧 Email config will be loaded after basic setup');

const app = express();

// Trust proxy for rate limiting behind load balancers
app.set('trust proxy', 1);

// CORS configuration - production ready with bookmarklet support
const allowedOrigins = [
  'https://opptym.com', 
  'https://www.opptym.com', 
  'http://localhost:5173', 
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Origin', 
    'Accept',
    'Cache-Control',
    'x-test-mode'
  ]
}));

console.log('🌐 CORS configured for origins:', allowedOrigins);

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept, Cache-Control, x-test-mode');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
app.use(compression());

// Rate limiting - production ready
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs (increased for testing)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and test scenarios
    return req.path === '/api/health' || 
           req.headers['x-test-mode'] === 'true' ||
           req.headers['x-test-mode'] === true;
  }
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 auth requests per windowMs (increased for email verification)
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks, email verification, and test scenarios
    return req.path === '/api/health' || 
           req.path === '/api/test-cors' ||
           req.path === '/api/auth/resend-verification' ||
           req.path === '/api/auth/send-verification' ||
           req.path === '/api/auth/forgot-password' ||
           req.path === '/api/auth/reset-password' ||
           req.headers['x-test-mode'] === 'true' ||
           req.headers['x-test-mode'] === true;
  }
});

// Enable rate limiting for production
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection with error handling
const connectDB = async () => {
  try {
    // Use environment variable for MongoDB URI, with properly encoded fallback
    let mongoURI = process.env.MONGODB_URI;
    
    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('🔍 Environment MONGODB_URI exists:', !!process.env.MONGODB_URI);
    
    // Validate MongoDB URI
    if (!mongoURI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.log('⚠️ Server will start without database connection');
      return false;
    }
    
    // Validate URI format
    if (!mongoURI.includes('mongodb+srv://') || !mongoURI.includes('mongodb.net/')) {
      console.error('❌ Invalid MongoDB URI format');
      console.log('⚠️ Server will start without database connection');
      return false;
    }
    
    console.log('📍 URI preview:', mongoURI.substring(0, 50) + '...');
    console.log('🔍 Full URI length:', mongoURI.length);
    
    // Test connection with timeout
    const connectionPromise = mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // 15 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    });
    
    await connectionPromise;
    console.log('✅ MongoDB connected successfully');
    
    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('🔍 Error name:', err.name);
    console.error('🔍 Error code:', err.code);
    console.log('⚠️ Server will start without database connection');
    console.log('⚠️ Some features may not work properly');
    return false;
  }
};

// Connect to database
connectDB();

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

// Health check endpoint for deployment
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    uptime: formatUptime(process.uptime()),
    message: 'OPPTYM Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '3.0.0',
    commit: (process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || 'dev').substring(0, 7),
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || 'unknown',
      port: mongoose.connection.port || 'unknown',
      name: mongoose.connection.name || 'unknown'
    },
    services: {
      cors: 'enabled',
      rateLimit: 'enabled',
      compression: 'enabled',
      helmet: 'enabled'
    }
  };
  
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      healthCheck.status = 'WARNING';
      healthCheck.message = 'Server running but database disconnected';
    }
    
    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.status = 'ERROR';
    healthCheck.message = error.message;
    res.status(503).json(healthCheck);
  }
});

// Simple health check for load balancers
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: formatUptime(process.uptime())
  });
});

// Test endpoint to check email URL generation
app.get('/api/test-email-url', (req, res) => {
  const testToken = 'test-token-123';
  const resetUrl = `${process.env.API_BASE_URL || 'https://api.opptym.com'}/api/auth/verify-reset-token/${testToken}`;
  const verificationUrl = `${process.env.API_BASE_URL || 'https://api.opptym.com'}/api/auth/verify-email/${testToken}`;
  
  res.json({
    resetUrl,
    verificationUrl,
    apiBaseUrl: process.env.API_BASE_URL,
    frontendUrl: process.env.FRONTEND_URL,
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to refresh email service configuration
app.post('/api/debug/refresh-email-service', async (req, res) => {
  try {
    const emailService = require('./services/emailService');
    await emailService.refreshConfiguration();
    res.json({
      success: true,
      message: 'Email service configuration refreshed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error refreshing email service:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Version endpoint for deployment verification
app.get('/api/health/version', (req, res) => {
  const version = {
    name: 'OPPTYM Backend API',
    commit: process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || 'development',
    commitShort: (process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || 'dev').substring(0, 7),
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    deployTime: new Date().toISOString(),
    version: process.env.npm_package_version || '3.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    uptimeFormatted: formatUptime(process.uptime()),
    timestamp: Date.now(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    branch: process.env.VERCEL_GIT_COMMIT_REF || process.env.GIT_BRANCH || 'main'
  };
  
  res.json(version);
});

// API Routes (load with error handling)
try {
  app.use('/api/auth', require('./routes/authroutes'));
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Error loading auth routes:', error);
}

try {
  app.use('/api/projects', require('./routes/projectRoutes'));
  console.log('✅ Project routes loaded');
} catch (error) {
  console.error('❌ Error loading project routes:', error);
}

try {
  app.use('/api/submissions', require('./routes/submissionRoutes'));
  console.log('✅ Submission routes loaded');
} catch (error) {
  console.error('❌ Error loading submission routes:', error);
}

try {
  app.use('/api/admin', require('./routes/adminRoutes'));
  console.log('✅ Admin routes loaded');
} catch (error) {
  console.error('❌ Error loading admin routes:', error);
}

try {
  app.use('/api/directories', require('./routes/directoryRoutes'));
  console.log('✅ Directory routes loaded');
} catch (error) {
  console.error('❌ Error loading directory routes:', error);
}

try {
  app.use('/api/tools', require('./routes/toolRoutes'));
  console.log('✅ Tool routes loaded');
} catch (error) {
  console.error('❌ Error loading tool routes:', error);
}

try {
  app.use('/api/ultra-smart', require('./routes/ultraSmartRoutes'));
  console.log('✅ Ultra-smart routes loaded');
} catch (error) {
  console.error('❌ Error loading ultra-smart routes:', error);
}

try {
  app.use('/api/universal-form', require('./routes/universalFormRoutes'));
  console.log('✅ Universal form routes loaded');
} catch (error) {
  console.error('❌ Error loading universal form routes:', error);
}

try {
  app.use('/api/subscription', require('./routes/subscriptionRoutes'));
  console.log('✅ Subscription routes loaded');
} catch (error) {
  console.error('❌ Error loading subscription routes:', error);
}

try {
  app.use('/api/payment', require('./routes/paymentRoutes'));
  console.log('✅ Payment routes loaded');
} catch (error) {
  console.error('❌ Error loading payment routes:', error);
}

// Load pricing routes
try {
  app.use('/api/pricing', require('./routes/pricingRoutes'));
  console.log('✅ Pricing routes loaded');
} catch (error) {
  console.error('❌ Error loading pricing routes:', error);
}

// Load plan routes
try {
  app.use('/api/plans', require('./routes/planRoutes'));
  console.log('✅ Plan routes loaded');
} catch (error) {
  console.error('❌ Error loading plan routes:', error);
}

// Load bookmarklet routes
try {
  app.use('/api/bookmarklet', require('./routes/bookmarkletRoutes'));
  console.log('✅ Bookmarklet routes loaded');
} catch (error) {
  console.error('❌ Error loading bookmarklet routes:', error);
}

// Load analytics routes
try {
  app.use('/api/analytics', require('./routes/analyticsRoutes'));
  console.log('✅ Analytics routes loaded');
} catch (error) {
  console.error('❌ Error loading analytics routes:', error);
}

// Load health routes
try {
  app.use('/api/health', require('./routes/healthRoutes'));
  console.log('✅ Health routes loaded');
} catch (error) {
  console.error('❌ Error loading health routes:', error);
}

// Load email verification routes after basic setup
try {
  app.use('/api/email-verification', require('./routes/emailVerificationRoutes'));
  console.log('✅ Email verification routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading email verification routes:', error);
  console.log('⚠️ Email verification will be disabled');
}



console.log('✅ Payment routes mounted at /api/payment');



// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 OPPTYM Backend is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// Process error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('🔍 Stack:', err.stack);
  // Don't exit immediately, log and continue
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately, log and continue
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server with proper error handling
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Process ID: ${process.pid}`);
  console.log(`✅ Node Version: ${process.version}`);
  console.log(`✅ Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
});

// Server error handling
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server failed to start:', err.message);
    process.exit(1);
  }
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('🛑 Received shutdown signal, closing server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// DEPLOYMENT TRIGGER - Tue Sep  9 10:11:28 IST 2025
// This comment forces a rebuild


// FORCE RESTART - Tue Sep  9 10:43:46 IST 2025
// This change forces the server to restart and reload email service

