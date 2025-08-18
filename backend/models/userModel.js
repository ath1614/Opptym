const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Role-based permissions schema
const permissionSchema = new mongoose.Schema({
  // SEO Tools Access
  canUseSeoTools: { type: Boolean, default: false },
  canUseAdvancedTools: { type: Boolean, default: false },
  canExportReports: { type: Boolean, default: false },
  
  // Project Management
  canCreateProjects: { type: Boolean, default: false },
  canEditProjects: { type: Boolean, default: false },
  canDeleteProjects: { type: Boolean, default: false },
  canViewAllProjects: { type: Boolean, default: false },
  
  // Directory Submissions
  canSubmitToDirectories: { type: Boolean, default: false },
  canViewSubmissionReports: { type: Boolean, default: false },
  canManageSubmissions: { type: Boolean, default: false },
  
  // User Management (for team leads)
  canManageTeamMembers: { type: Boolean, default: false },
  canViewTeamReports: { type: Boolean, default: false },
  canAssignTasks: { type: Boolean, default: false },
  
  // Admin Features
  canAccessAdminPanel: { type: Boolean, default: false },
  canManageUsers: { type: Boolean, default: false },
  canViewAnalytics: { type: Boolean, default: false },
  canManageBilling: { type: Boolean, default: false },
  
  // API Access
  canUseAPI: { type: Boolean, default: false },
  apiCallLimit: { type: Number, default: 0 },
  
  // Custom Limits
  maxProjects: { type: Number, default: 0 },
  maxSubmissionsPerMonth: { type: Number, default: 0 },
  maxTeamMembers: { type: Number, default: 0 }
});

// Employee role schema
const employeeRoleSchema = new mongoose.Schema({
  roleId: { type: String, required: true },
  roleName: { type: String, required: true },
  description: { type: String },
  permissions: { type: permissionSchema, default: () => ({}) },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Team member schema
const teamMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, required: true },
  permissions: { type: permissionSchema, default: () => ({}) },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Subscription usage tracking
const usageSchema = new mongoose.Schema({
  month: { type: String }, // YYYY-MM format, made optional
  projectsCreated: { type: Number, default: 0 },
  submissionsMade: { type: Number, default: 0 },
  apiCallsUsed: { type: Number, default: 0 },
  seoToolsUsed: { type: Number, default: 0 },
  lastReset: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  // Basic Info
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending'
  },
  subscription: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  subscriptionExpiresAt: {
    type: Date
  },
  // Email verification fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  emailVerifiedAt: {
    type: Date
  },
  // OTP verification fields for signup
  signupOTP: {
    type: String
  },
  signupOTPExpires: {
    type: Date
  },
  isSignupOTPVerified: {
    type: Boolean,
    default: false
  },
  // OTP verification fields for login
  loginOTP: {
    type: String
  },
  loginOTPExpires: {
    type: Date
  },
  isLoginOTPVerified: {
    type: Boolean,
    default: false
  },
  // OTP settings
  otpEnabled: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate OTP
userSchema.methods.generateOTP = function(type = 'signup') {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  if (type === 'signup') {
    this.signupOTP = otp;
    this.signupOTPExpires = expiresAt;
    this.isSignupOTPVerified = false;
  } else if (type === 'login') {
    this.loginOTP = otp;
    this.loginOTPExpires = expiresAt;
    this.isLoginOTPVerified = false;
  }
  
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(otp, type = 'signup') {
  const now = new Date();
  
  if (type === 'signup') {
    if (this.signupOTP !== otp) return false;
    if (this.signupOTPExpires < now) return false;
    this.isSignupOTPVerified = true;
    this.signupOTP = undefined;
    this.signupOTPExpires = undefined;
  } else if (type === 'login') {
    if (this.loginOTP !== otp) return false;
    if (this.loginOTPExpires < now) return false;
    this.isLoginOTPVerified = true;
    this.loginOTP = undefined;
    this.loginOTPExpires = undefined;
  }
  
  return true;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username;
});

// Virtual for subscription limits
userSchema.virtual('subscriptionLimits').get(function() {
  const limits = {
    free: { projects: 10, submissions: 50, tools: true, teamMembers: 0, trialDays: 3 },
    starter: { projects: 1, submissions: 150, tools: true, teamMembers: 0 }, // 999 package
    pro: { projects: 5, submissions: 750, tools: true, teamMembers: 3 }, // 3999 package
    business: { projects: 10, submissions: 1500, tools: true, teamMembers: 10 }, // 8999 package
    enterprise: { projects: -1, submissions: -1, tools: true, teamMembers: -1 }
  };
  return limits[this.subscription] || limits.free;
});

// Method to check if user has permission
userSchema.methods.hasPermission = function(permission) {
  // Admin and owner have all permissions
  if (this.isAdmin || this.isOwner) return true;
  
  // Check custom permissions first
  if (this.customPermissions && this.customPermissions[permission]) return true;
  
  // Basic permissions for all authenticated users
  const basicPermissions = ['canCreateProjects', 'canUseSeoTools', 'canSubmitToDirectories'];
  if (basicPermissions.includes(permission)) return true;
  
  // Check role-based permissions
  const rolePermissions = {
    manager: ['canUseSeoTools', 'canCreateProjects', 'canEditProjects', 'canSubmitToDirectories', 'canViewSubmissionReports', 'canManageTeamMembers', 'canViewTeamReports'],
    analyst: ['canUseSeoTools', 'canCreateProjects', 'canEditProjects', 'canSubmitToDirectories', 'canViewSubmissionReports'],
    viewer: ['canUseSeoTools', 'canViewSubmissionReports'],
    employee: ['canUseSeoTools', 'canCreateProjects', 'canSubmitToDirectories']
  };
  
  return rolePermissions[this.role]?.includes(permission) || false;
};

// Method to check if user is in trial period
userSchema.methods.isInTrialPeriod = function() {
  if (this.subscription !== 'free') return false;
  
  // Set trial start date if not set
  if (!this.trialStartDate) {
    this.trialStartDate = this.createdAt;
    this.trialEndDate = new Date(this.createdAt.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days
  }
  
  return new Date() <= this.trialEndDate;
};

// Method to check usage limits
userSchema.methods.checkUsageLimit = function(feature) {
  const limits = this.subscriptionLimits;
  const currentUsage = this.currentUsage;
  
  // If user is in trial period, use trial limits
  if (this.isInTrialPeriod()) {
    const trialLimits = {
      projects: 10,
      submissions: 50,
      apiCalls: 100,
      seoTools: 50
    };
    
    switch(feature) {
      case 'projects':
        return trialLimits.projects === -1 || currentUsage.projectsCreated < trialLimits.projects;
      case 'submissions':
        return trialLimits.submissions === -1 || currentUsage.submissionsMade < trialLimits.submissions;
      case 'apiCalls':
        return trialLimits.apiCalls === -1 || currentUsage.apiCallsUsed < trialLimits.apiCalls;
      case 'seoTools':
        return trialLimits.seoTools === -1 || currentUsage.seoToolsUsed < trialLimits.seoTools;
      default:
        return true;
    }
  }
  
  // Regular subscription limits
  switch(feature) {
    case 'projects':
      return limits.projects === -1 || currentUsage.projectsCreated < limits.projects;
    case 'submissions':
      return limits.submissions === -1 || currentUsage.submissionsMade < limits.submissions;
    case 'apiCalls':
      return this.customPermissions.apiCallLimit === -1 || currentUsage.apiCallsUsed < this.customPermissions.apiCallLimit;
    case 'seoTools':
      return true; // Allow unlimited SEO tools usage for now
    default:
      return true;
  }
};

// Method to increment usage
userSchema.methods.incrementUsage = function(feature, amount = 1) {
  if (!this.currentUsage) {
    this.currentUsage = {};
  }
  
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  if (this.currentUsage.month !== currentMonth) {
    // Reset usage for new month
    this.currentUsage = {
      month: currentMonth,
      projectsCreated: 0,
      submissionsMade: 0,
      apiCallsUsed: 0,
      seoToolsUsed: 0,
      lastReset: new Date()
    };
  }
  
  switch(feature) {
    case 'projects':
      this.currentUsage.projectsCreated += amount;
      break;
    case 'submissions':
      this.currentUsage.submissionsMade += amount;
      break;
    case 'apiCalls':
      this.currentUsage.apiCallsUsed += amount;
      break;
    case 'seoTools':
      this.currentUsage.seoToolsUsed += amount;
      break;
  }
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
