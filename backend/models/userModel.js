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
    required: false,
    trim: true,
    maxlength: 50,
    default: ''
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscription: {
    type: String,
    enum: ['free', 'test', 'starter', 'pro', 'business', 'enterprise', 'custom'],
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
  // Trial usage tracking for progressive lockout
  trialUsage: {
    seoToolsUsed: { type: Number, default: 0 },
    projectsUsed: { type: Number, default: 0 },
    submissionsUsed: { type: Number, default: 0 }
  },
  // Plan limits (cached for performance)
  planLimits: {
    submissions: { type: Number, default: 5 },
    projects: { type: Number, default: 3 },
    tools: { type: Number, default: 5 },
    apiCalls: { type: Number, default: 50 }
  },
  // Custom plan details (for custom subscriptions)
  customPlan: {
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    price: { type: Number, default: 0 },
    billingCycle: { type: String, enum: ['monthly', 'yearly', 'lifetime'], default: 'monthly' },
    limits: {
      submissions: { type: Number, default: 5 },
      projects: { type: Number, default: 3 },
      tools: { type: Number, default: 5 },
      apiCalls: { type: Number, default: 50 }
    },
    features: {
      canCreateProjects: { type: Boolean, default: true },
      canSubmitDirectories: { type: Boolean, default: true },
      canUseSeoTools: { type: Boolean, default: true },
      canAccessAnalytics: { type: Boolean, default: false },
      canAccessAdmin: { type: Boolean, default: false }
    }
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
  // Profile fields
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20,
    default: ''
  },
  company: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  website: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  profilePhoto: {
    type: String,
    trim: true,
    default: ''
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    language: { type: String, default: 'en' },
    notifications: { type: Boolean, default: true }
  },
  // Enhanced profile for form pre-filling
  profile: {
    businessName: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    zipCode: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: '' },
    socialMedia: {
      facebook: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
      instagram: { type: String, trim: true, default: '' },
      youtube: { type: String, trim: true, default: '' }
    },
    preferences: {
      autoFill: { type: Boolean, default: true },
      showInstructions: { type: Boolean, default: true },
      defaultCategory: { type: String, default: 'Business' }
    },
    lastUpdated: { type: Date, default: Date.now }
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
userSchema.pre('save', async function(next) {
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

// Post-save middleware to create notifications
userSchema.post('save', async function(doc) {
  try {
    const NotificationHelper = require('../utils/notificationHelper');
    
    // Create trial started notification for new free users
    if (doc.isNew && doc.subscription === 'free') {
      await NotificationHelper.createSubscriptionNotification(doc._id, 'trial_started');
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
});

// Instance methods
userSchema.methods.updatePlanLimits = function() {
  const limits = {
    free: { submissions: 5, projects: 3, tools: 5, apiCalls: 50 },
    starter: { submissions: 150, projects: 5, tools: 100, apiCalls: 500 },
    pro: { submissions: 750, projects: 15, tools: 500, apiCalls: 2000 },
    business: { submissions: 1500, projects: 50, tools: 1000, apiCalls: 5000 },
    enterprise: { submissions: -1, projects: -1, tools: -1, apiCalls: -1 } // Unlimited
  };
  
  this.planLimits = limits[this.subscription] || limits.free;
};

userSchema.methods.isInTrialPeriod = function() {
  if (this.subscription !== 'free') return false;
  
  // If no trial end date, calculate it but don't save (avoid async issues)
  if (!this.trialEndDate) {
    const trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    return new Date() < trialEndDate;
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

// Progressive lockout methods for free trial users
userSchema.methods.canUseSeoTools = function() {
  if (this.subscription !== 'free') return true;
  if (!this.isInTrialPeriod()) return false;
  return this.trialUsage.seoToolsUsed < 5; // 5 SEO tool uses in trial
};

userSchema.methods.canCreateProjects = function() {
  if (this.subscription !== 'free') return true;
  if (!this.isInTrialPeriod()) return false;
  return this.trialUsage.projectsUsed < 3; // 3 projects in trial
};

userSchema.methods.canMakeSubmissions = function() {
  if (this.subscription !== 'free') return true;
  if (!this.isInTrialPeriod()) return false;
  return this.trialUsage.submissionsUsed < 5; // 5 submissions in trial
};

userSchema.methods.incrementTrialUsage = function(type) {
  if (this.subscription !== 'free' || !this.isInTrialPeriod()) return;
  
  switch (type) {
    case 'seoTools':
      this.trialUsage.seoToolsUsed += 1;
      break;
    case 'projects':
      this.trialUsage.projectsUsed += 1;
      break;
    case 'submissions':
      this.trialUsage.submissionsUsed += 1;
      break;
  }
  
  return this.save();
};

userSchema.methods.getTrialLockoutStatus = function() {
  if (this.subscription !== 'free') {
    return { locked: false, reason: null };
  }
  
  if (!this.isInTrialPeriod()) {
    return { 
      locked: true, 
      reason: 'trial_expired',
      message: 'Your 3-day trial has expired. Upgrade to continue using OPPTYM.'
    };
  }
  
  const status = {
    locked: false,
    reason: null,
    seoToolsLocked: !this.canUseSeoTools(),
    projectsLocked: !this.canCreateProjects(),
    submissionsLocked: !this.canMakeSubmissions()
  };
  
  // Check if any feature is locked
  if (status.seoToolsLocked || status.projectsLocked || status.submissionsLocked) {
    status.locked = true;
    status.reason = 'trial_limits_reached';
    status.message = 'You\'ve reached your trial limits. Upgrade to unlock all features.';
  }
  
  return status;
};

userSchema.methods.hasFeatureAccess = function(feature) {
  // Check if trial is expired (applies to all users including admins)
  if (this.subscription === 'free' && !this.isInTrialPeriod()) {
    return false;
  }
  
  // Admin has access to admin panel regardless of trial status
  if (this.role === 'admin' && feature === 'admin') return true;
  
  // Map feature names to feature flags
  const featureMap = {
    'projects': 'canCreateProjects',
    'submissions': 'canSubmitDirectories',
    'seoTools': 'canUseSeoTools',
    'analytics': 'canAccessAnalytics',
    'admin': 'canAccessAdmin'
  };
  
  const featureFlag = featureMap[feature] || feature;
  
  // Ensure features object is properly initialized
  if (!this.features) {
    this.setPlanLimitsSync();
  }
  
  // Return the actual feature flag value, not a fallback
  return this.features[featureFlag] === true;
};

userSchema.methods.hasPermission = function(permission) {
  // Check if trial is expired (applies to all users including admins)
  if (this.subscription === 'free' && !this.isInTrialPeriod()) {
    return false;
  }
  
  // Admin has access to admin panel regardless of trial status
  if (this.role === 'admin' && permission === 'canAccessAdmin') return true;
  
  // Map permissions to features
  const permissionMap = {
    'canCreateProjects': 'canCreateProjects',
    'canSubmitToDirectories': 'canSubmitDirectories',
    'canUseSeoTools': 'canUseSeoTools',
    'canAccessAnalytics': 'canAccessAnalytics',
    'canAccessAdmin': 'canAccessAdmin'
  };
  
  const feature = permissionMap[permission];
  return feature ? this.features[feature] : false;
};

userSchema.methods.checkUsageLimit = function(feature) {
  // Check if trial is expired (applies to all users including admins)
  if (this.subscription === 'free' && !this.isInTrialPeriod()) {
    return false;
  }
  
  // Admin has unlimited access to admin features only
  if (this.role === 'admin' && feature === 'admin') return true;
  
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
  // Ensure usage object is initialized
  if (!this.usage) {
    this.usage = {
      submissionsUsed: 0,
      projectsUsed: 0,
      seoToolsUsed: 0,
      apiCallsUsed: 0
    };
  }
  
  const usageMap = {
    submissions: 'submissionsUsed',
    projects: 'projectsUsed',
    seoTools: 'seoToolsUsed',
    apiCalls: 'apiCallsUsed'
  };
  
  const field = usageMap[feature];
  if (field) {
    this.usage[field] = (this.usage[field] || 0) + 1;
  }
  
  return this.save();
};

userSchema.methods.setPlanLimits = function() {
  const planLimits = {
    free: {
      submissions: 5, // 5 submissions in trial
      projects: 3, // 3 projects in trial
      tools: 5, // 5 SEO tool uses in trial
      apiCalls: 50 // 50 API calls in trial
    },
    test: {
      submissions: 10,
      projects: 1,
      tools: 10,
      apiCalls: 20
    },
    starter: {
      submissions: 150,
      projects: 5,
      tools: 100,
      apiCalls: 500
    },
    pro: {
      submissions: 750,
      projects: 15,
      tools: 500,
      apiCalls: 2000
    },
    business: {
      submissions: 1500,
      projects: 50,
      tools: 1000,
      apiCalls: 5000
    },
    enterprise: {
      submissions: -1, // unlimited
      projects: -1, // unlimited
      tools: -1, // unlimited
      apiCalls: -1 // unlimited
    },
    custom: {
      submissions: this.customPlan?.limits?.submissions || 5,
      projects: this.customPlan?.limits?.projects || 3,
      tools: this.customPlan?.limits?.tools || 5,
      apiCalls: this.customPlan?.limits?.apiCalls || 50
    }
  };

  const limits = planLimits[this.subscription] || planLimits.free;
  this.planLimits = limits;
  
  // Set feature flags based on subscription
  if (this.subscription === 'custom') {
    this.features = {
      canCreateProjects: this.customPlan?.features?.canCreateProjects || true,
      canSubmitDirectories: this.customPlan?.features?.canSubmitDirectories || true,
      canUseSeoTools: this.customPlan?.features?.canUseSeoTools || true,
      canAccessAnalytics: this.customPlan?.features?.canAccessAnalytics || false,
      canAccessAdmin: this.role === 'admin'
    };
  } else {
    this.features = {
      canCreateProjects: this.canCreateProjects(),
      canSubmitDirectories: this.canMakeSubmissions(),
      canUseSeoTools: this.canUseSeoTools(),
      canAccessAnalytics: ['test', 'pro', 'business', 'enterprise'].includes(this.subscription),
      canAccessAdmin: this.role === 'admin'
    };
  }
  
  return this.save();
};

// Synchronous version for getSubscriptionDetails
userSchema.methods.setPlanLimitsSync = function() {
  const planLimits = {
    free: {
      submissions: 5, // 5 submissions in trial
      projects: 3, // 3 projects in trial
      tools: 5, // 5 SEO tool uses in trial
      apiCalls: 50 // 50 API calls in trial
    },
    test: {
      submissions: 10,
      projects: 1,
      tools: 10,
      apiCalls: 20
    },
    starter: {
      submissions: 150,
      projects: 5,
      tools: 100,
      apiCalls: 500
    },
    pro: {
      submissions: 750,
      projects: 15,
      tools: 500,
      apiCalls: 2000
    },
    business: {
      submissions: 1500,
      projects: 50,
      tools: 1000,
      apiCalls: 5000
    },
    enterprise: {
      submissions: -1, // unlimited
      projects: -1, // unlimited
      tools: -1, // unlimited
      apiCalls: -1 // unlimited
    },
    custom: {
      submissions: this.customPlan?.limits?.submissions || 5,
      projects: this.customPlan?.limits?.projects || 3,
      tools: this.customPlan?.limits?.tools || 5,
      apiCalls: this.customPlan?.limits?.apiCalls || 50
    }
  };

  const limits = planLimits[this.subscription] || planLimits.free;
  this.planLimits = limits;
  
  // Set feature flags based on subscription
  if (this.subscription === 'custom') {
    this.features = {
      canCreateProjects: this.customPlan?.features?.canCreateProjects || true,
      canSubmitDirectories: this.customPlan?.features?.canSubmitDirectories || true,
      canUseSeoTools: this.customPlan?.features?.canUseSeoTools || true,
      canAccessAnalytics: this.customPlan?.features?.canAccessAnalytics || false,
      canAccessAdmin: this.role === 'admin'
    };
  } else {
    this.features = {
      canCreateProjects: this.canCreateProjects(),
      canSubmitDirectories: this.canMakeSubmissions(),
      canUseSeoTools: this.canUseSeoTools(),
      canAccessAnalytics: ['test', 'pro', 'business', 'enterprise'].includes(this.subscription),
      canAccessAdmin: this.role === 'admin'
    };
  }
  
  // Don't save, just update the object
  return this;
};

userSchema.methods.getSubscriptionDetails = function() {
  const isInTrial = this.isInTrialPeriod();
  const trialDaysLeft = this.getTrialDaysLeft();
  
  // Ensure plan limits are set correctly (without saving)
  if (!this.planLimits.submissions || this.planLimits.submissions === 5) {
    this.setPlanLimitsSync();
  }
  
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

// Getter methods for backward compatibility
userSchema.virtual('subscriptionLimits').get(function() {
  return this.planLimits;
});

userSchema.virtual('currentUsage').get(function() {
  return {
    submissionsMade: this.usage.submissionsUsed,
    projectsCreated: this.usage.projectsUsed,
    seoToolsUsed: this.usage.seoToolsUsed,
    apiCallsUsed: this.usage.apiCallsUsed
  };
});

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase() });
};

// User data validation and cleanup middleware
userSchema.pre('save', async function(next) {
  // Ensure firstName and lastName are set
  if (!this.firstName || this.firstName.trim() === '') {
    this.firstName = this.username || 'User';
  }
  if (!this.lastName || this.lastName.trim() === '') {
    this.lastName = this.username || 'User';
  }
  
  // Ensure role is valid - handle any invalid role values
  if (!this.role || !['user', 'admin'].includes(this.role)) {
    console.log(`⚠️ Invalid role detected: ${this.role}, setting to 'user' for user: ${this.username || this.email}`);
    this.role = 'user';
  }
  
  // Ensure trial end date is set for free users
  if (this.subscription === 'free' && !this.trialEndDate) {
    this.trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    console.log(`📅 Set trial end date for user ${this.username || this.email}: ${this.trialEndDate}`);
  }
  
  // Hash password if modified
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for isAdmin (for backward compatibility)
userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
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
