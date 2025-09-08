const mongoose = require('mongoose');
const crypto = require('crypto');

const emailVerificationTokenSchema = new mongoose.Schema({
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
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
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
    max: 5 // Maximum verification attempts
  }
}, {
  timestamps: true
});

// Indexes for performance
emailVerificationTokenSchema.index({ token: 1 });
emailVerificationTokenSchema.index({ userId: 1 });
emailVerificationTokenSchema.index({ email: 1 });
emailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static method to generate verification token
emailVerificationTokenSchema.statics.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

// Static method to create verification token for user
emailVerificationTokenSchema.statics.createForUser = async function(userId, email) {
  // Remove any existing tokens for this user
  await this.deleteMany({ userId, isUsed: false });
  
  const token = this.generateToken();
  const verificationToken = new this({
    userId,
    email,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  });
  
  return await verificationToken.save();
};

// Instance method to verify token
emailVerificationTokenSchema.methods.verify = async function() {
  if (this.isUsed) {
    throw new Error('Token has already been used');
  }
  
  if (this.expiresAt < new Date()) {
    throw new Error('Token has expired');
  }
  
  if (this.attempts >= 5) {
    throw new Error('Too many verification attempts');
  }
  
  this.isUsed = true;
  this.usedAt = new Date();
  return await this.save();
};

// Instance method to increment attempts
emailVerificationTokenSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  return await this.save();
};

// Clean up expired tokens (runs automatically due to TTL index)
emailVerificationTokenSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isUsed: true, usedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Clean up used tokens older than 7 days
    ]
  });
  
  console.log(`🧹 Cleaned up ${result.deletedCount} expired email verification tokens`);
  return result;
};

module.exports = mongoose.model('EmailVerificationToken', emailVerificationTokenSchema);
