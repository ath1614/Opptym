const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Trust proxy for rate limiting behind load balancers
app.set('trust proxy', 1);

// CORS configuration - allow all origins for now (MOVE TO TOP)
// RESTART: Force backend restart to apply CORS fixes
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}));

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

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
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
app.use('/api/payment', require('./routes/paymentRoutes'));

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