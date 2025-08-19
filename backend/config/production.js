module.exports = {
  // Server Configuration
  port: process.env.PORT || 5050,
  nodeEnv: process.env.NODE_ENV || 'production',
  
  // Database Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://lowlife9366:x6TX9HuAvESb3DJD@opptym.tkcz5nx.mongodb.net/?retryWrites=true&w=majority&appName=opptym',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    }
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'opptym-super-secret-jwt-key-2024-production-ready',
    expiresIn: '7d',
    refreshExpiresIn: '30d'
  },
  
  // CORS Configuration
  cors: {
    origin: [
      'https://opptym.com',
      'https://www.opptym.com',
      'https://opptym.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean),
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
    ]
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  
  // Email Configuration
  email: {
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: { 
      rejectUnauthorized: false 
    }
  },
  
  // Security Configuration
  security: {
    helmet: {
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.opptym.com"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      }
    },
    compression: {
      level: 6,
      threshold: 1024
    }
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'combined',
    file: process.env.LOG_FILE || 'logs/app.log'
  },
  
  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://api.opptym.com',
    version: 'v1',
    prefix: '/api'
  },
  
  // OTP Configuration
  otp: {
    length: 6,
    expiresIn: 10 * 60 * 1000, // 10 minutes
    maxAttempts: 3,
    cooldownPeriod: 60 * 1000 // 1 minute
  },
  
  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'opptym-session-secret-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }
};
