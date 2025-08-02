const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  // Team Info
  name: { type: String, required: true },
  description: { type: String },
  company: { type: String },
  industry: { type: String },
  website: { type: String },
  logo: { type: String },
  
  // Team Owner
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Team Settings
  maxMembers: { type: Number, default: 10 },
  allowInvites: { type: Boolean, default: true },
  requireApproval: { type: Boolean, default: true },
  autoAssignRole: { type: String, default: 'employee' },
  
  // Team Status
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active' 
  },
  
  // Billing & Subscription
  subscriptionPlan: { 
    type: String, 
    enum: ['free', 'starter', 'pro', 'business', 'enterprise'], 
    default: 'free' 
  },
  billingCycle: { 
    type: String, 
    enum: ['monthly', 'yearly'], 
    default: 'monthly' 
  },
  nextBillingDate: { type: Date },
  
  // Team Statistics
  totalProjects: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },
  totalSeoToolsUsed: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware
teamSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Method to check if team can add more members
teamSchema.methods.canAddMember = function() {
  const limits = {
    free: 0,
    starter: 0,
    pro: 3,
    business: 10,
    enterprise: -1
  };
  
  const limit = limits[this.subscriptionPlan] || 0;
  return limit === -1 || this.memberCount < limit;
};

// Method to get team usage
teamSchema.methods.getUsage = function() {
  return {
    projects: this.totalProjects,
    submissions: this.totalSubmissions,
    seoTools: this.totalSeoToolsUsed,
    members: this.memberCount
  };
};

module.exports = mongoose.model('Team', teamSchema); 