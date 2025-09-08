const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3 // Maximum reset attempts
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
passwordResetTokenSchema.index({ token: 1 });
passwordResetTokenSchema.index({ userId: 1 });
passwordResetTokenSchema.index({ email: 1 });
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static method to generate reset token
passwordResetTokenSchema.statics.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

// Static method to create reset token for user
passwordResetTokenSchema.statics.createForUser = async function(userId, email, ipAddress = null, userAgent = null) {
  // Remove any existing tokens for this user
  await this.deleteMany({ userId, isUsed: false });
  
  const token = this.generateToken();
  const resetToken = new this({
    userId,
    email,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    ipAddress,
    userAgent
  });
  
  return await resetToken.save();
};

// Instance method to verify token
passwordResetTokenSchema.methods.verify = async function() {
  if (this.isUsed) {
    throw new Error('Token has already been used');
  }
  
  if (this.expiresAt < new Date()) {
    throw new Error('Token has expired');
  }
  
  if (this.attempts >= 3) {
    throw new Error('Too many reset attempts');
  }
  
  this.isUsed = true;
  this.usedAt = new Date();
  return await this.save();
};

// Instance method to increment attempts
passwordResetTokenSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  return await this.save();
};

// Static method to check if user has recent reset requests
passwordResetTokenSchema.statics.hasRecentRequest = async function(email, minutes = 15) {
  const recentTime = new Date(Date.now() - minutes * 60 * 1000);
  const recentRequest = await this.findOne({
    email,
    createdAt: { $gte: recentTime },
    isUsed: false
  });
  
  return !!recentRequest;
};

// Clean up expired tokens (runs automatically due to TTL index)
passwordResetTokenSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isUsed: true, usedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Clean up used tokens older than 24 hours
    ]
  });
  
  console.log(`🧹 Cleaned up ${result.deletedCount} expired password reset tokens`);
  return result;
};

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
