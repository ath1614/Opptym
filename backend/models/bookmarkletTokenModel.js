const mongoose = require('mongoose');

const bookmarkletTokenSchema = new mongoose.Schema({
  // Unique token identifier
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // User who created this bookmarklet
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Project data associated with this bookmarklet
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  
  // Project data snapshot (for offline validation)
  projectData: {
    name: String,
    email: String,
    phone: String,
    companyName: String,
    url: String,
    description: String,
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String
  },
  
  // Usage tracking
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Maximum allowed uses
  maxUsage: {
    type: Number,
    default: 10,
    min: 1
  },
  
  // Token expiration
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  
  // Token status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // IP addresses that have used this token
  usedIPs: [{
    ip: String,
    timestamp: Date,
    userAgent: String
  }],
  
  // Rate limiting
  lastUsedAt: {
    type: Date,
    default: Date.now
  },
  
  // Minimum time between uses (in seconds)
  rateLimitSeconds: {
    type: Number,
    default: 1
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Last validation attempt
  lastValidatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
bookmarkletTokenSchema.index({ token: 1, isActive: 1, expiresAt: 1 });
bookmarkletTokenSchema.index({ userId: 1, createdAt: -1 });
bookmarkletTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Pre-save middleware to ensure token is unique
bookmarkletTokenSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingToken = await this.constructor.findOne({ token: this.token });
    if (existingToken) {
      return next(new Error('Token already exists'));
    }
  }
  next();
});

// Method to check if token is valid
bookmarkletTokenSchema.methods.isValid = function() {
  return this.isActive && 
         this.usageCount < this.maxUsage && 
         this.expiresAt > new Date();
};

// Method to increment usage
bookmarkletTokenSchema.methods.incrementUsage = function(ip, userAgent) {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  this.lastValidatedAt = new Date();
  
  // Track IP usage
  this.usedIPs.push({
    ip: ip,
    timestamp: new Date(),
    userAgent: userAgent
  });
  
  // Keep only last 10 IP entries
  if (this.usedIPs.length > 10) {
    this.usedIPs = this.usedIPs.slice(-10);
  }
  
  return this.save();
};

// Method to check rate limiting
bookmarkletTokenSchema.methods.isRateLimited = function() {
  const now = new Date();
  const timeSinceLastUse = (now - this.lastUsedAt) / 1000; // seconds
  return timeSinceLastUse < this.rateLimitSeconds;
};

// Static method to generate unique token
bookmarkletTokenSchema.statics.generateToken = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Static method to create token with default expiration
bookmarkletTokenSchema.statics.createToken = function(userId, projectId, projectData, options = {}) {
  const token = this.generateToken();
  const expiresAt = new Date(Date.now() + (options.expiresInHours || 24) * 60 * 60 * 1000);
  
  return new this({
    token,
    userId,
    projectId,
    projectData,
    maxUsage: options.maxUsage || 10,
    expiresAt,
    rateLimitSeconds: options.rateLimitSeconds || 5
  });
};

module.exports = mongoose.model('BookmarkletToken', bookmarkletTokenSchema);
