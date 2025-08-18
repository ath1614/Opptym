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

// CORS configuration - allow all origins temporarily for debugging
app.use(cors({
  origin: true, // Allow all origins
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
    'X-File-Name'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));

console.log('🌐 CORS configured to allow all origins');

// Handle preflight requests
app.options('*', cors());

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
app.use(compression());

// Rate limiting - reduced for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased limit for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

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
    
    // Check if environment variable is truncated or invalid
    if (!mongoURI || 
        !mongoURI.includes('opptym.tkcz5nx.mongodb.net') || 
        mongoURI.length < 100) {
      
      console.log('⚠️ Environment MONGODB_URI is truncated or invalid, using fallback');
      mongoURI = 'mongodb+srv://lowlife9366:x6TX9HuAvESb3DJD@opptym.tkcz5nx.mongodb.net/?retryWrites=true&w=majority&appName=opptym';
    }
    
    console.log('📍 URI preview:', mongoURI.substring(0, 50) + '...');
    console.log('🔍 Full URI length:', mongoURI.length);
    console.log('🔍 Using fallback URI:', mongoURI === 'mongodb+srv://lowlife9366:x6TX9HuAvESb3DJD@opptym.tkcz5nx.mongodb.net/?retryWrites=true&w=majority&appName=opptym');
    
    // Validate URI format
    if (!mongoURI.includes('mongodb+srv://') || !mongoURI.includes('@opptym.tkcz5nx.mongodb.net/')) {
      throw new Error('Invalid MongoDB URI format');
    }
    
    // Test connection with timeout
    const connectionPromise = mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
    });
    
    await connectionPromise;
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('🔍 Full error:', err);
    console.error('🔍 Error name:', err.name);
    console.error('🔍 Error code:', err.code);
    console.log('⚠️ Server will start without database connection');
    console.log('⚠️ Some features may not work properly');
  }
};

// Connect to database
connectDB();

// Health check endpoint for deployment
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'OPPTYM Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled'
  });
});

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  res.status(200).json({ 
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Test signup endpoint (for debugging)
app.post('/api/test-signup', (req, res) => {
  res.status(200).json({ 
    message: 'Signup endpoint is accessible',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Test email configuration endpoint
app.get('/api/test-email-config', (req, res) => {
  try {
    const emailConfig = require('./config/emailConfig');
    const status = emailConfig.getEmailConfigStatus();
    
    res.status(200).json({ 
      message: 'Email configuration test',
      ...status,
      allEnvVars: Object.keys(process.env).filter(key => key.toLowerCase().includes('email')),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to test email config',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test SMTP connection endpoint
app.get('/api/test-smtp', async (req, res) => {
  try {
    const emailConfig = require('./config/emailConfig');
    const { transporter } = emailConfig;
    
    // Check if transporter is mock
    if (!transporter.verify) {
      res.status(400).json({ 
        error: 'Mock transporter detected',
        message: 'Email configuration is using mock transporter. Real SMTP not configured properly.',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Test SMTP connection
    const testResult = await transporter.verify();
    
    res.status(200).json({ 
      message: 'SMTP connection test',
      success: true,
      testResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'SMTP connection failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});