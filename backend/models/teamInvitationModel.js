const mongoose = require('mongoose');

const teamInvitationSchema = new mongoose.Schema({
  // Email of the person being invited
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // User who sent the invitation
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Team/Organization ID (optional for now)
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  
  // Role for the invited user
  role: {
    type: String,
    enum: ['employee', 'manager', 'viewer', 'admin'],
    default: 'employee'
  },
  
  // Permissions for the invited user
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
  
  // Invitation status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Invitation token for email verification
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Expiration date
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    index: { expireAfterSeconds: 0 }
  },
  
  // When invitation was accepted
  acceptedAt: {
    type: Date,
    default: null
  },
  
  // User ID after acceptance (if user was created)
  acceptedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better performance
teamInvitationSchema.index({ email: 1, status: 1 });
teamInvitationSchema.index({ invitedBy: 1, status: 1 });
teamInvitationSchema.index({ token: 1 });
teamInvitationSchema.index({ expiresAt: 1 });

// Static methods
teamInvitationSchema.statics.createInvitation = async function(invitationData) {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  const invitation = new this({
    ...invitationData,
    token
  });
  
  return await invitation.save();
};

teamInvitationSchema.statics.findByToken = async function(token) {
  return await this.findOne({ 
    token, 
    status: 'pending',
    expiresAt: { $gt: new Date() }
  }).populate('invitedBy', 'username email firstName lastName');
};

teamInvitationSchema.statics.findByEmail = async function(email, status = 'pending') {
  return await this.find({ 
    email: email.toLowerCase(), 
    status 
  }).populate('invitedBy', 'username email firstName lastName');
};

teamInvitationSchema.statics.getInvitationsByUser = async function(userId) {
  return await this.find({ 
    invitedBy: userId 
  }).sort({ createdAt: -1 });
};

// Instance methods
teamInvitationSchema.methods.accept = async function(userId = null) {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  if (userId) {
    this.acceptedUserId = userId;
  }
  return await this.save();
};

teamInvitationSchema.methods.decline = async function() {
  this.status = 'declined';
  return await this.save();
};

teamInvitationSchema.methods.cancel = async function() {
  this.status = 'cancelled';
  return await this.save();
};

teamInvitationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

teamInvitationSchema.methods.generateInviteUrl = function(baseUrl = '') {
  return `${baseUrl}/accept-invitation?token=${this.token}`;
};

// Pre-save middleware
teamInvitationSchema.pre('save', function(next) {
  // Auto-expire if past expiration date
  if (this.isExpired() && this.status === 'pending') {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('TeamInvitation', teamInvitationSchema);
