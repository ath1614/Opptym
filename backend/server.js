const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
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

// CORS configuration - more permissive for development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://opptym.vercel.app',
        'https://opptym-frontend.vercel.app',
        'https://opptym-git-main.vercel.app',
        'https://opptym-git-develop.vercel.app'
      ]
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/opptym';
    
    // Handle base64 encoded URI
    if (mongoURI.startsWith('bW9uZ29kYy')) {
      try {
        mongoURI = Buffer.from(mongoURI, 'base64').toString('utf-8');
        console.log('🔓 Decoded base64 MongoDB URI');
        console.log('📍 Decoded URI preview:', mongoURI.substring(0, 50) + '...');
      } catch (err) {
        console.log('❌ Failed to decode base64 URI, using as-is');
      }
    }
    
    // Handle case where Railway might split the URI across multiple lines
    if (mongoURI.includes('\n') || (mongoURI.includes('mongodb+srv://') && !mongoURI.includes('mongodb.net'))) {
      console.log('⚠️  Detected split URI, attempting to reconstruct...');
      
      // Try to get the full URI from environment variables
      const envVars = process.env;
      const mongoKeys = Object.keys(envVars).filter(key => 
        key.startsWith('MONGODB_URI') && key !== 'MONGODB_URI'
      );
      
      if (mongoKeys.length > 0) {
        console.log('🔍 Found additional MongoDB URI parts:', mongoKeys);
        const parts = [mongoURI];
        mongoKeys.forEach(key => {
          parts.push(envVars[key]);
        });
        mongoURI = parts.join('');
        console.log('🔗 Reconstructed URI length:', mongoURI.length);
      }
    }
    
    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('📍 Final URI preview:', mongoURI.substring(0, 50) + '...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('🔍 Full error:', err);
    process.exit(1);
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
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', require('./routes/authroutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/directories', require('./routes/directoryRoutes'));
app.use('/api/tools', require('./routes/toolRoutes'));
app.use('/api/ultra-smart', require('./routes/ultraSmartRoutes'));
app.use('/api/universal-form', require('./routes/universalFormRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));

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
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});