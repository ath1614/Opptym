const mongoose = require('mongoose');

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
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Profile Info
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  company: { type: String },
  position: { type: String },
  avatar: { type: String },
  
  // Account Status
  isAdmin: { type: Boolean, default: false },
  isOwner: { type: Boolean, default: false }, // Business owner
  isEmployee: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended', 'banned', 'pending'], 
    default: 'active' 
  },
  
  // Subscription & Billing
  subscription: { 
    type: String, 
    enum: ['free', 'starter', 'pro', 'business', 'enterprise'], 
    default: 'free' 
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'trial'],
    default: 'active'
  },
  subscriptionStartDate: { type: Date },
  subscriptionEndDate: { type: Date },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  
  // Role & Permissions
  role: { 
    type: String, 
    enum: ['owner', 'admin', 'manager', 'analyst', 'viewer', 'employee'],
    default: 'viewer'
  },
  customPermissions: { type: permissionSchema, default: () => ({}) },
  
  // Team Management
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  teamRole: { type: String },
  teamMembers: [teamMemberSchema],
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Usage Tracking
  currentUsage: { 
    type: usageSchema, 
    default: () => {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return {
        month: currentMonth,
        projectsCreated: 0,
        submissionsMade: 0,
        apiCallsUsed: 0,
        seoToolsUsed: 0,
        lastReset: now
      };
    }
  },
  usageHistory: [usageSchema],
  
  // Security & Access
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username;
});

// Virtual for subscription limits
userSchema.virtual('subscriptionLimits').get(function() {
  const limits = {
    free: { projects: 1, submissions: 10, tools: false, teamMembers: 0 },
    starter: { projects: 1, submissions: 100, tools: true, teamMembers: 0 },
    pro: { projects: 5, submissions: 500, tools: true, teamMembers: 3 },
    business: { projects: 10, submissions: 1000, tools: true, teamMembers: 10 },
    enterprise: { projects: -1, submissions: -1, tools: true, teamMembers: -1 }
  };
  return limits[this.subscription] || limits.free;
});

// Method to check if user has permission
userSchema.methods.hasPermission = function(permission) {
  // Admin and owner have all permissions
  if (this.isAdmin || this.isOwner) return true;
  
  // Check custom permissions first
  if (this.customPermissions[permission]) return true;
  
  // Check role-based permissions
  const rolePermissions = {
    manager: ['canUseSeoTools', 'canCreateProjects', 'canEditProjects', 'canSubmitToDirectories', 'canViewSubmissionReports', 'canManageTeamMembers', 'canViewTeamReports'],
    analyst: ['canUseSeoTools', 'canCreateProjects', 'canEditProjects', 'canSubmitToDirectories', 'canViewSubmissionReports'],
    viewer: ['canUseSeoTools', 'canViewSubmissionReports'],
    employee: ['canUseSeoTools', 'canCreateProjects', 'canSubmitToDirectories']
  };
  
  return rolePermissions[this.role]?.includes(permission) || false;
};

// Method to check usage limits
userSchema.methods.checkUsageLimit = function(feature) {
  const limits = this.subscriptionLimits;
  const currentUsage = this.currentUsage;
  
  switch(feature) {
    case 'projects':
      return limits.projects === -1 || currentUsage.projectsCreated < limits.projects;
    case 'submissions':
      return limits.submissions === -1 || currentUsage.submissionsMade < limits.submissions;
    case 'apiCalls':
      return this.customPermissions.apiCallLimit === -1 || currentUsage.apiCallsUsed < this.customPermissions.apiCallLimit;
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
