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
    // Use environment variable for MongoDB URI
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://ishitasingh01:Dps%40220068@cluster0.bsdlfyb.mongodb.net/opptym?retryWrites=true&w=majority';
    
    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('📍 URI preview:', mongoURI.substring(0, 50) + '...');
    
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