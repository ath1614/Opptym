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
    // Check if nodemailer is available
    let nodemailer;
    try {
      nodemailer = require('nodemailer');
      console.log('✅ Nodemailer loaded successfully');
    } catch (error) {
      res.status(500).json({ 
        error: 'Nodemailer not available',
        message: `Nodemailer package is not installed. Error: ${error.message}. Please check package.json and redeploy.`,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Check if createTransport method exists (correct method name)
    if (typeof nodemailer.createTransport !== 'function') {
      res.status(500).json({ 
        error: 'Nodemailer method not available',
        message: 'nodemailer.createTransport is not a function. This indicates a package installation issue.',
        nodemailerType: typeof nodemailer,
        nodemailerKeys: Object.keys(nodemailer || {}),
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Test different SMTP configurations
    const configs = [
      {
        name: 'Hostinger SSL (Port 465)',
        config: {
          host: 'smtp.hostinger.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        }
      },
      {
        name: 'Hostinger TLS (Port 587)',
        config: {
          host: 'smtp.hostinger.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        }
      }
    ];
    
    const results = [];
    
    for (const config of configs) {
      try {
        console.log(`Testing ${config.name}...`);
        const transporter = nodemailer.createTransport(config.config);
        const verifyResult = await transporter.verify();
        results.push({
          config: config.name,
          success: true,
          result: verifyResult
        });
        console.log(`✅ ${config.name} - Success`);
      } catch (error) {
        results.push({
          config: config.name,
          success: false,
          error: error.message
        });
        console.log(`❌ ${config.name} - Failed: ${error.message}`);
      }
    }
    
    res.status(200).json({ 
      message: 'SMTP configuration test results',
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'SMTP test failed',
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

// Test JWT configuration endpoint
app.get('/api/test-jwt', (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'opptym-secret-key-2024-fallback';
    
    // Test token generation
    const testToken = jwt.sign(
      { userId: 'test', email: 'test@example.com' },
      jwtSecret,
      { expiresIn: '1h' }
    );
    
    // Test token verification
    const decoded = jwt.verify(testToken, jwtSecret);
    
    res.status(200).json({
      message: 'JWT configuration test',
      jwtSecretExists: !!process.env.JWT_SECRET,
      jwtSecretLength: jwtSecret.length,
      testTokenGenerated: !!testToken,
      testTokenLength: testToken.length,
      testTokenVerified: !!decoded,
      decodedPayload: decoded,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'JWT test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test package installation endpoint
app.get('/api/test-packages', (req, res) => {
  try {
    const packageTests = {};
    
    // Test nodemailer
    try {
      const nodemailer = require('nodemailer');
      packageTests.nodemailer = {
        available: true,
        type: typeof nodemailer,
        hasCreateTransport: typeof nodemailer.createTransport === 'function',
        keys: Object.keys(nodemailer || {}).slice(0, 10) // First 10 keys
      };
    } catch (error) {
      packageTests.nodemailer = {
        available: false,
        error: error.message
      };
    }
    
    // Test other packages
    const packages = ['express', 'mongoose', 'bcryptjs', 'jsonwebtoken'];
    for (const pkg of packages) {
      try {
        const module = require(pkg);
        packageTests[pkg] = {
          available: true,
          type: typeof module
        };
      } catch (error) {
        packageTests[pkg] = {
          available: false,
          error: error.message
        };
      }
    }
    
    res.status(200).json({
      message: 'Package installation test',
      packageTests,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Package test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Simple test endpoint
app.get('/api/test-simple', (req, res) => {
  res.status(200).json({
    message: 'Simple test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Direct User model test endpoint
app.get('/api/test-user-direct', async (req, res) => {
  try {
    console.log('🔍 Testing User model directly...');
    const User = require('./models/userModel');
    console.log('✅ User model loaded');
    
    // Test creating a simple user
    const testUser = new User({
      email: 'test@example.com',
      signupOTP: '123456',
      signupOTPExpires: new Date(),
      isSignupOTPVerified: false,
      status: 'pending'
    });
    
    console.log('✅ Test user object created');
    console.log('🔍 User object:', testUser);
    
    res.status(200).json({
      message: 'User model direct test',
      success: true,
      userCreated: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Direct User model test failed:', error);
    res.status(500).json({
      error: 'Direct User model test failed',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

// Test User model endpoint
app.get('/api/test-user-model', async (req, res) => {
  try {
    const User = require('./models/userModel');
    console.log('✅ User model loaded successfully');
    
    // Try to create a test user
    const testUser = new User({
      email: 'test@example.com',
      username: 'testuser',
      password: 'testpass'
    });
    
    console.log('✅ Test user created successfully');
    console.log('✅ User schema fields:', Object.keys(testUser.schema.paths));
    
    res.status(200).json({
      message: 'User model test',
      userModelLoaded: true,
      testUserCreated: true,
      schemaFields: Object.keys(testUser.schema.paths),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ User model test failed:', error);
    res.status(500).json({
      error: 'User model test failed',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

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