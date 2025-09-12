const mongoose = require('mongoose');

/**
 * Shared database connection utility
 * Provides consistent database connection logic across the application
 */
const connectDB = async (options = {}) => {
  try {
    // Use environment variable for MongoDB URI
    let mongoURI = process.env.MONGODB_URI;
    
    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('🔍 Environment MONGODB_URI exists:', !!process.env.MONGODB_URI);
    
    // Validate MongoDB URI
    if (!mongoURI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      if (options.required !== false) {
        console.log('⚠️ Database connection is required, exiting...');
        process.exit(1);
      } else {
        console.log('⚠️ Database connection is optional, continuing without connection');
        return false;
      }
    }
    
    // Default connection options
    const defaultOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // 15 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    };
    
    // Merge with provided options
    const connectionOptions = { ...defaultOptions, ...options.connectionOptions };
    
    // Validate URI format - be more flexible for development
    if (!mongoURI || typeof mongoURI !== 'string') {
      console.error('❌ MongoDB URI is not a valid string');
      if (options.required !== false) {
        process.exit(1);
      } else {
        return false;
      }
    }
    
    // Only validate format for production
    if (process.env.NODE_ENV === 'production' && !mongoURI.includes('mongodb://') && !mongoURI.includes('mongodb+srv://')) {
      console.error('❌ Invalid MongoDB URI format for production - must start with mongodb:// or mongodb+srv://');
      if (options.required !== false) {
        process.exit(1);
      } else {
        return false;
      }
    }
    
    console.log('📍 URI preview:', mongoURI.substring(0, 50) + '...');
    console.log('🔍 Full URI length:', mongoURI.length);
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI, connectionOptions);
    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events
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
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (options.required !== false) {
      console.log('💥 Exiting due to database connection failure');
      process.exit(1);
    } else {
      console.log('⚠️ Continuing without database connection');
      return false;
    }
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
  }
};

/**
 * Check if database is connected
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = {
  connectDB,
  disconnectDB,
  isConnected
};
