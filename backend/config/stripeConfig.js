const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  // Production Stripe credentials
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_XXXXXXXXXXXXXXXXXXXXXXXX',
  
  // Environment detection
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST_MODE: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'),
  
  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Currency settings
  DEFAULT_CURRENCY: process.env.STRIPE_CURRENCY || 'inr',
  
  // Webhook settings
  WEBHOOK_TOLERANCE: 300, // 5 minutes
}; 