const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  // General Settings
  siteName: {
    type: String,
    default: 'OPPTYM - SEO Automation Platform'
  },
  supportEmail: {
    type: String,
    default: 'support@opptym.com'
  },
  defaultUserRole: {
    type: String,
    enum: ['free', 'starter', 'pro', 'business', 'enterprise'],
    default: 'free'
  },
  
  // Security Settings
  requireEmailVerification: {
    type: Boolean,
    default: true
  },
  enableRateLimiting: {
    type: Boolean,
    default: true
  },
  enableTwoFactorAuth: {
    type: Boolean,
    default: false
  },
  
  // Plan Management
  plans: [{
    id: String,
    name: String,
    projects: Number,
    submissions: Number,
    price: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Payment Settings
  stripePublishableKey: {
    type: String,
    default: ''
  },
  stripeSecretKey: {
    type: String,
    default: ''
  },
  webhookSecret: {
    type: String,
    default: ''
  },
  
  // AI Configuration
  aiProvider: {
    type: String,
    enum: ['huggingface', 'openai', 'ollama'],
    default: 'huggingface'
  },
  aiApiKey: {
    type: String,
    default: ''
  },
  enableAiFormDetection: {
    type: Boolean,
    default: true
  },
  
  // System metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
systemSettingsSchema.index({}, { unique: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
