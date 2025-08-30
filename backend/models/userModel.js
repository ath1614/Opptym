const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscription: {
    type: String,
    enum: ['free', 'starter', 'pro', 'business', 'enterprise'],
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'past_due'],
    default: 'active'
  },
  subscriptionExpiresAt: {
    type: Date,
    default: null
  },
  // Trial management
  trialStartDate: {
    type: Date,
    default: null
  },
  trialEndDate: {
    type: Date,
    default: null
  },
  // Usage tracking
  usage: {
    submissionsUsed: { type: Number, default: 0 },
    projectsUsed: { type: Number, default: 0 },
    seoToolsUsed: { type: Number, default: 0 },
    apiCallsUsed: { type: Number, default: 0 }
  },
  // Plan limits (cached for performance)
  planLimits: {
    submissions: { type: Number, default: 5 },
    projects: { type: Number, default: 2 },
    tools: { type: Number, default: 10 },
    apiCalls: { type: Number, default: 20 }
  },
  // Feature flags
  features: {
    canCreateProjects: { type: Boolean, default: true },
    canSubmitDirectories: { type: Boolean, default: true },
    canUseSeoTools: { type: Boolean, default: true },
    canAccessAnalytics: { type: Boolean, default: false },
    canAccessAdmin: { type: Boolean, default: false }
  },
  // Stripe integration
  stripeCustomerId: {
    type: String,
    default: null
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  // Metadata
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    language: { type: String, default: 'en' },
    notifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ subscription: 1 });
userSchema.index({ 'trialEndDate': 1 });

// Pre-save middleware to set trial dates for free users
userSchema.pre('save', function(next) {
  if (this.isNew && this.subscription === 'free') {
    if (!this.trialStartDate) {
      this.trialStartDate = new Date();
    }
    if (!this.trialEndDate) {
      this.trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
    }
  }
  
  // Update plan limits based on subscription
  this.updatePlanLimits();
  
  next();
});

// Instance methods
userSchema.methods.updatePlanLimits = function() {
  const limits = {
    free: { submissions: 5, projects: 2, tools: 10, apiCalls: 20 },
    starter: { submissions: 150, projects: 5, tools: 100, apiCalls: 500 },
    pro: { submissions: 750, projects: 15, tools: 500, apiCalls: 2000 },
    business: { submissions: 1500, projects: 50, tools: 1000, apiCalls: 5000 },
    enterprise: { submissions: -1, projects: -1, tools: -1, apiCalls: -1 } // Unlimited
  };
  
  this.planLimits = limits[this.subscription] || limits.free;
};

userSchema.methods.isInTrialPeriod = function() {
  if (this.subscription !== 'free') return false;
  
  if (!this.trialEndDate) {
    this.trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    this.save();
  }
  
  return new Date() < this.trialEndDate;
};

userSchema.methods.getTrialDaysLeft = function() {
  if (!this.isInTrialPeriod()) return 0;
  
  const now = new Date();
  const end = new Date(this.trialEndDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

userSchema.methods.hasFeatureAccess = function(feature) {
  // Admin has access to everything
  if (this.role === 'admin') return true;
  
  // Check if trial is expired
  if (this.subscription === 'free' && !this.isInTrialPeriod()) {
    return false;
  }
  
  // Check feature flags
  return this.features[feature] || false;
};

userSchema.methods.checkUsageLimit = function(feature) {
  // Admin has unlimited access
  if (this.role === 'admin') return true;
  
  // Check if trial is expired
  if (this.subscription === 'free' && !this.isInTrialPeriod()) {
    return false;
  }
  
  const limits = {
    submissions: this.planLimits.submissions,
    projects: this.planLimits.projects,
    seoTools: this.planLimits.tools,
    apiCalls: this.planLimits.apiCalls
  };
  
  const usage = {
    submissions: this.usage.submissionsUsed,
    projects: this.usage.projectsUsed,
    seoTools: this.usage.seoToolsUsed,
    apiCalls: this.usage.apiCallsUsed
  };
  
  const limit = limits[feature];
  const used = usage[feature];
  
  // Unlimited (-1) or within limits
  return limit === -1 || used < limit;
};

userSchema.methods.incrementUsage = function(feature) {
  const usageMap = {
    submissions: 'submissionsUsed',
    projects: 'projectsUsed',
    seoTools: 'seoToolsUsed',
    apiCalls: 'apiCallsUsed'
  };
  
  const field = usageMap[feature];
  if (field) {
    this.usage[field] += 1;
  }
  
  return this.save();
};

userSchema.methods.getSubscriptionDetails = function() {
  const isInTrial = this.isInTrialPeriod();
  const trialDaysLeft = this.getTrialDaysLeft();
  
  return {
    subscription: this.subscription,
    status: this.subscriptionStatus,
    isInTrial,
    trialDaysLeft,
    trialEndDate: this.trialEndDate,
    trialExpired: this.subscription === 'free' && !isInTrial,
    nextBillingDate: this.subscriptionExpiresAt,
    currentUsage: this.usage,
    limits: this.planLimits,
    features: this.features
  };
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase() });
};

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
