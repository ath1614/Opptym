const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  // Team name
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  // Team description
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Team owner (admin who created the team)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Team members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['employee', 'manager', 'viewer', 'admin'],
      default: 'employee'
    },
    permissions: {
      canUseSeoTools: { type: Boolean, default: true },
      canCreateProjects: { type: Boolean, default: true },
      canEditProjects: { type: Boolean, default: false },
      canDeleteProjects: { type: Boolean, default: false },
      canSubmitToDirectories: { type: Boolean, default: true },
      canViewSubmissionReports: { type: Boolean, default: true },
      canManageTeamMembers: { type: Boolean, default: false },
      canAccessAdminPanel: { type: Boolean, default: false }
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    }
  }],
  
  // Team settings
  settings: {
    allowMemberInvites: { type: Boolean, default: true },
    requireApprovalForJoins: { type: Boolean, default: false },
    maxMembers: { type: Number, default: 10 },
    defaultRole: { type: String, default: 'employee' }
  },
  
  // Team status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  // Subscription plan for the team
  subscriptionPlan: {
    type: String,
    enum: ['business', 'enterprise', 'custom'],
    default: 'business'
  }
}, {
  timestamps: true
});

// Indexes
teamSchema.index({ owner: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ status: 1 });

// Static methods
teamSchema.statics.createTeam = async function(teamData) {
  const team = new this(teamData);
  return await team.save();
};

teamSchema.statics.findByOwner = async function(ownerId) {
  return await this.find({ owner: ownerId }).populate('members.user', 'username email firstName lastName');
};

teamSchema.statics.findByMember = async function(userId) {
  return await this.find({ 
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ]
  }).populate('members.user', 'username email firstName lastName');
};

// Instance methods
teamSchema.methods.addMember = async function(userId, role = 'employee', permissions = {}) {
  // Check if user is already a member
  const existingMember = this.members.find(member => member.user.toString() === userId.toString());
  if (existingMember) {
    throw new Error('User is already a member of this team');
  }
  
  // Check member limit
  if (this.members.length >= this.settings.maxMembers) {
    throw new Error('Team has reached maximum member limit');
  }
  
  this.members.push({
    user: userId,
    role,
    permissions: {
      canUseSeoTools: true,
      canCreateProjects: true,
      canEditProjects: false,
      canDeleteProjects: false,
      canSubmitToDirectories: true,
      canViewSubmissionReports: true,
      canManageTeamMembers: false,
      canAccessAdminPanel: false,
      ...permissions
    },
    joinedAt: new Date(),
    status: 'active'
  });
  
  return await this.save();
};

teamSchema.methods.removeMember = async function(userId) {
  this.members = this.members.filter(member => member.user.toString() !== userId.toString());
  return await this.save();
};

teamSchema.methods.updateMemberRole = async function(userId, role, permissions = {}) {
  const member = this.members.find(member => member.user.toString() === userId.toString());
  if (!member) {
    throw new Error('Member not found');
  }
  
  member.role = role;
  member.permissions = { ...member.permissions, ...permissions };
  
  return await this.save();
};

teamSchema.methods.getMemberCount = function() {
  return this.members.length + 1; // +1 for owner
};

teamSchema.methods.isOwner = function(userId) {
  return this.owner.toString() === userId.toString();
};

teamSchema.methods.isMember = function(userId) {
  return this.isOwner(userId) || this.members.some(member => member.user.toString() === userId.toString());
};

teamSchema.methods.getMemberRole = function(userId) {
  if (this.isOwner(userId)) {
    return 'owner';
  }
  
  const member = this.members.find(member => member.user.toString() === userId.toString());
  return member ? member.role : null;
};

teamSchema.methods.getMemberPermissions = function(userId) {
  if (this.isOwner(userId)) {
    // Owner has all permissions
    return {
      canUseSeoTools: true,
      canCreateProjects: true,
      canEditProjects: true,
      canDeleteProjects: true,
      canSubmitToDirectories: true,
      canViewSubmissionReports: true,
      canManageTeamMembers: true,
      canAccessAdminPanel: true
    };
  }
  
  const member = this.members.find(member => member.user.toString() === userId.toString());
  return member ? member.permissions : {};
};

module.exports = mongoose.model('Team', teamSchema);