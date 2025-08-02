const User = require('../models/userModel');
const Team = require('../models/teamModel');

// Check if user can access a feature based on subscription
exports.checkFeatureAccess = async (req, res) => {
  try {
    const { feature } = req.params;
    const userId = req.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasAccess = await checkUserFeatureAccess(user, feature);
    
    res.json({
      hasAccess,
      user: {
        subscription: user.subscription,
        role: user.role,
        currentUsage: user.currentUsage
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's subscription details and limits
exports.getSubscriptionDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const limits = user.subscriptionLimits;
    const currentUsage = user.currentUsage || {};
    
    res.json({
      subscription: user.subscription,
      status: user.subscriptionStatus,
      limits,
      currentUsage,
      canUpgrade: user.subscription !== 'enterprise',
      nextBillingDate: user.subscriptionEndDate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Track usage for a specific feature
exports.trackUsage = async (req, res) => {
  try {
    const { feature, amount = 1 } = req.body;
    const userId = req.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has permission to use this feature
    if (!user.hasPermission(`canUse${feature.charAt(0).toUpperCase() + feature.slice(1)}`)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Check usage limits
    if (!user.checkUsageLimit(feature)) {
      return res.status(429).json({ 
        error: 'Usage limit exceeded',
        limit: user.subscriptionLimits[feature],
        current: user.currentUsage[`${feature}Used`] || 0
      });
    }

    // Increment usage
    await user.incrementUsage(feature, amount);
    
    res.json({
      success: true,
      newUsage: user.currentUsage,
      remaining: user.subscriptionLimits[feature] - (user.currentUsage[`${feature}Used`] || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get team management features
exports.getTeamManagement = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user can manage team
    if (!user.hasPermission('canManageTeamMembers')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const team = await Team.findOne({ ownerId: userId });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Get team members
    const teamMembers = await User.find({ teamId: team._id });
    
    res.json({
      team,
      members: teamMembers.map(member => ({
        id: member._id,
        username: member.username,
        email: member.email,
        role: member.role,
        status: member.status,
        lastLogin: member.lastLogin,
        permissions: member.customPermissions
      })),
      canAddMembers: team.canAddMember(),
      usage: team.getUsage()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Invite team member
exports.inviteTeamMember = async (req, res) => {
  try {
    const { email, role, permissions } = req.body;
    const userId = req.userId;
    
    const user = await User.findById(userId);
    if (!user || !user.hasPermission('canManageTeamMembers')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const team = await Team.findOne({ ownerId: userId });
    if (!team || !team.canAddMember()) {
      return res.status(400).json({ error: 'Cannot add more team members' });
    }

    // Check if user already exists
    let invitedUser = await User.findOne({ email });
    
    if (!invitedUser) {
      // Create new user account
      const tempPassword = Math.random().toString(36).slice(-8);
      invitedUser = await User.create({
        email,
        username: email.split('@')[0],
        password: tempPassword, // Will be hashed by pre-save middleware
        isEmployee: true,
        role: role || 'employee',
        status: 'pending',
        teamId: team._id,
        invitedBy: userId,
        customPermissions: permissions || {}
      });
    } else {
      // Update existing user
      invitedUser.teamId = team._id;
      invitedUser.role = role || 'employee';
      invitedUser.customPermissions = permissions || {};
      invitedUser.invitedBy = userId;
      await invitedUser.save();
    }

    // TODO: Send invitation email
    
    res.json({
      success: true,
      message: 'Team member invited successfully',
      user: {
        id: invitedUser._id,
        email: invitedUser.email,
        role: invitedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update team member permissions
exports.updateTeamMemberPermissions = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role, permissions } = req.body;
    const userId = req.userId;
    
    const user = await User.findById(userId);
    if (!user || !user.hasPermission('canManageTeamMembers')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const member = await User.findById(memberId);
    if (!member || member.teamId.toString() !== user.teamId.toString()) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    member.role = role;
    member.customPermissions = permissions;
    await member.save();

    res.json({
      success: true,
      message: 'Team member permissions updated',
      member: {
        id: member._id,
        email: member.email,
        role: member.role,
        permissions: member.customPermissions
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove team member
exports.removeTeamMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = req.userId;
    
    const user = await User.findById(userId);
    if (!user || !user.hasPermission('canManageTeamMembers')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const member = await User.findById(memberId);
    if (!member || member.teamId.toString() !== user.teamId.toString()) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Remove from team
    member.teamId = null;
    member.role = 'viewer';
    member.customPermissions = {};
    member.status = 'inactive';
    await member.save();

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to check feature access
async function checkUserFeatureAccess(user, feature) {
  const featurePermissions = {
    'seoTools': 'canUseSeoTools',
    'advancedTools': 'canUseAdvancedTools',
    'projects': 'canCreateProjects',
    'submissions': 'canSubmitToDirectories',
    'reports': 'canViewSubmissionReports',
    'admin': 'canAccessAdminPanel',
    'api': 'canUseAPI'
  };

  const permission = featurePermissions[feature];
  if (!permission) return false;

  return user.hasPermission(permission);
}

// Middleware to check subscription limits
exports.checkSubscriptionLimit = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { feature } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.checkUsageLimit(feature)) {
      return res.status(429).json({
        error: 'Subscription limit exceeded',
        feature,
        limit: user.subscriptionLimits[feature],
        current: user.currentUsage[`${feature}Used`] || 0
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 