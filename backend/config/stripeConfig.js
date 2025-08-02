const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_XXXXXXXXXXXXXXXXXXXXXXXX',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
}; 