const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'employee'],
      default: 'employee'
    },
    permissions: {
      type: Map,
      of: Boolean,
      default: {}
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxMembers: {
    type: Number,
    default: 5
  },
  subscription: {
    type: String,
    enum: ['free', 'basic', 'pro', 'enterprise'],
    default: 'free'
  },
  settings: {
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    autoAssignProjects: {
      type: Boolean,
      default: false
    }
  },
  usage: {
    projectsCreated: {
      type: Number,
      default: 0
    },
    submissionsMade: {
      type: Number,
      default: 0
    },
    automationsRun: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
teamSchema.index({ ownerId: 1 });
teamSchema.index({ 'members.userId': 1 });

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for available slots
teamSchema.virtual('availableSlots').get(function() {
  return Math.max(0, this.maxMembers - this.members.length);
});

// Method to check if team can add more members
teamSchema.methods.canAddMember = function() {
  return this.members.length < this.maxMembers;
};

// Method to add a member to the team
teamSchema.methods.addMember = function(userId, role = 'employee', permissions = {}) {
  if (!this.canAddMember()) {
    throw new Error('Team is at maximum capacity');
  }

  // Check if user is already a member
  const existingMember = this.members.find(member => member.userId.toString() === userId.toString());
  if (existingMember) {
    throw new Error('User is already a member of this team');
  }

  this.members.push({
    userId,
    role,
    permissions,
    joinedAt: new Date()
  });

  return this.save();
};

// Method to remove a member from the team
teamSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => member.userId.toString() !== userId.toString());
  return this.save();
};

// Method to update member role
teamSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(member => member.userId.toString() === userId.toString());
  if (!member) {
    throw new Error('Member not found');
  }

  member.role = newRole;
  return this.save();
};

// Method to get team usage
teamSchema.methods.getUsage = function() {
  return {
    projects: this.usage.projectsCreated,
    submissions: this.usage.submissionsMade,
    automations: this.usage.automationsRun,
    members: this.members.length,
    maxMembers: this.maxMembers
  };
};

// Method to increment usage
teamSchema.methods.incrementUsage = function(type, amount = 1) {
  if (this.usage[type] !== undefined) {
    this.usage[type] += amount;
    return this.save();
  }
  throw new Error(`Invalid usage type: ${type}`);
};

// Static method to create team for user
teamSchema.statics.createForUser = function(userId, teamName = 'My Team') {
  return this.create({
    name: teamName,
    ownerId: userId,
    members: [{
      userId,
      role: 'admin',
      permissions: { canManageTeam: true, canInviteMembers: true },
      joinedAt: new Date()
    }]
  });
};

// Static method to get team by owner
teamSchema.statics.getByOwner = function(ownerId) {
  return this.findOne({ ownerId }).populate('members.userId', 'username email role');
};

// Static method to get team by member
teamSchema.statics.getByMember = function(userId) {
  return this.findOne({ 'members.userId': userId }).populate('members.userId', 'username email role');
};

// Pre-save middleware to ensure owner is always a member
teamSchema.pre('save', function(next) {
  const ownerIsMember = this.members.some(member => 
    member.userId.toString() === this.ownerId.toString()
  );
  
  if (!ownerIsMember) {
    this.members.push({
      userId: this.ownerId,
      role: 'admin',
      permissions: { canManageTeam: true, canInviteMembers: true },
      joinedAt: new Date()
    });
  }
  
  next();
});

module.exports = mongoose.model('Team', teamSchema); 