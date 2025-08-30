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
    
    // Calculate trial information for free users
    let trialInfo = {};
    if (user.subscription === 'free') {
      // Ensure trial dates are set
      if (!user.trialStartDate) {
        user.trialStartDate = user.createdAt || new Date();
      }
      
      if (!user.trialEndDate) {
        user.trialEndDate = new Date(user.trialStartDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days
        await user.save();
      }
      
      const isInTrial = user.isInTrialPeriod();
      const trialEndDate = user.trialEndDate;
      const trialDaysLeft = isInTrial && trialEndDate ? Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;
      
      trialInfo = {
        isInTrial,
        trialEndDate: trialEndDate ? trialEndDate.toISOString() : null,
        trialDaysLeft: Math.max(0, trialDaysLeft),
        trialExpired: !isInTrial
      };
      
      console.log('🔍 Trial info for user:', user.email, trialInfo);
    }
    
    // Calculate next billing date for paid users
    let nextBillingDate = null;
    if (user.subscription !== 'free' && user.subscriptionExpiresAt) {
      nextBillingDate = user.subscriptionExpiresAt.toISOString();
    }
    
    const response = {
      subscription: user.subscription,
      status: user.subscriptionStatus || 'active',
      limits,
      currentUsage,
      canUpgrade: user.subscription !== 'enterprise',
      nextBillingDate,
      ...trialInfo
    };
    
    console.log('📊 Subscription details for user:', user.email, {
      subscription: response.subscription,
      isInTrial: response.isInTrial,
      trialDaysLeft: response.trialDaysLeft,
      trialExpired: response.trialExpired
    });
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error in getSubscriptionDetails:', error);
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
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        subscription: user.subscription,
        trialExpired: user.subscription === 'free' && !user.isInTrialPeriod()
      });
    }

    // Check usage limits
    if (!user.checkUsageLimit(feature)) {
      const limits = user.subscriptionLimits;
      const currentUsage = user.currentUsage || {};
      
      return res.status(429).json({ 
        error: 'Usage limit exceeded',
        subscription: user.subscription,
        limit: limits[feature] || 0,
        current: currentUsage[`${feature}Used`] || 0,
        trialExpired: user.subscription === 'free' && !user.isInTrialPeriod(),
        upgradeRequired: user.subscription === 'free'
      });
    }

    // Increment usage
    await user.incrementUsage(feature, amount);
    
    res.json({
      success: true,
      message: 'Usage tracked successfully',
      currentUsage: user.currentUsage,
      remaining: user.subscriptionLimits[feature] - (user.currentUsage[`${feature}Used`] || 0)
    });
    
  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json({ error: error.message });
  }
};

// Verify bookmarklet usage and track it
exports.verifyBookmarkletUsage = async (req, res) => {
  try {
    const userId = req.userId;
    const { action, bookmarkletToken, timestamp, currentUrl } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user is in trial period
    const isInTrial = user.subscription === 'free' && user.trialEndDate && new Date() < new Date(user.trialEndDate);
    const trialDaysLeft = isInTrial ? Math.ceil((new Date(user.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    // Check if trial has expired
    if (user.subscription === 'free' && user.trialEndDate && new Date() > new Date(user.trialEndDate)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Free trial has expired. Please upgrade to continue using Opptym features.' 
      });
    }

    // Check bookmarklet usage limits based on subscription
    let limit;
    if (user.subscription === 'free') {
      limit = 3; // Free trial users get 3 uses
    } else if (user.subscription === 'starter') {
      limit = 20;
    } else if (user.subscription === 'pro') {
      limit = 100;
    } else if (user.subscription === 'business') {
      limit = 500;
    } else {
      limit = 3; // Default for free users
    }

    const currentUsage = user.currentUsage?.bookmarkletUsage || 0;

    if (currentUsage >= limit) {
      const message = user.subscription === 'free' 
        ? `Free trial limit reached (${currentUsage}/${limit} uses). Please upgrade to continue.`
        : `Bookmarklet usage limit exceeded. You've used ${currentUsage}/${limit} times this month.`;
      
      return res.status(429).json({ 
        success: false, 
        message: message,
        requiresUpgrade: true
      });
    }

    // Track unique bookmarklet token to prevent copying
    if (!user.bookmarkletTokens) user.bookmarkletTokens = [];
    
    // Check if this token was already used
    if (user.bookmarkletTokens.includes(bookmarkletToken)) {
      return res.status(403).json({ 
        success: false, 
        message: 'This bookmarklet has already been used. Please create a new one.' 
      });
    }

    // Add token to used list (keep only last 100 tokens)
    user.bookmarkletTokens.push(bookmarkletToken);
    if (user.bookmarkletTokens.length > 100) {
      user.bookmarkletTokens = user.bookmarkletTokens.slice(-100);
    }

    // Increment bookmarklet usage
    if (!user.currentUsage) user.currentUsage = {};
    user.currentUsage.bookmarkletUsage = (user.currentUsage.bookmarkletUsage || 0) + 1;
    await user.save();

    // Log the usage
    console.log(`📊 Bookmarklet usage tracked for user ${userId}: ${user.currentUsage.bookmarkletUsage}/${limit} (Token: ${bookmarkletToken})`);

    res.json({
      success: true,
      message: 'Usage verified successfully',
      usage: {
        current: user.currentUsage.bookmarkletUsage,
        limit: limit,
        remaining: limit - user.currentUsage.bookmarkletUsage
      },
      trialInfo: isInTrial ? {
        isInTrial: true,
        daysLeft: trialDaysLeft,
        trialEndDate: user.trialEndDate
      } : null
    });

  } catch (error) {
    console.error('Bookmarklet usage verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
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

    // Check if user has team management permissions
    if (!user.isAdmin && user.subscription === 'free') {
      return res.status(403).json({ error: 'Team management requires a paid subscription' });
    }

    // Get or create team for user
    let team = await Team.findOne({ ownerId: userId });
    if (!team) {
      // Create team for user
      team = await Team.createForUser(userId, `${user.username || user.email}'s Team`);
    }

    // Get team members with populated user data
    const populatedTeam = await Team.findById(team._id).populate('members.userId', 'username email role status lastLogin');
    
    res.json({
      team: {
        id: populatedTeam._id,
        name: populatedTeam.name,
        ownerId: populatedTeam.ownerId,
        maxMembers: populatedTeam.maxMembers,
        memberCount: populatedTeam.members.length,
        subscription: populatedTeam.subscription,
        settings: populatedTeam.settings,
        usage: populatedTeam.getUsage()
      },
      members: populatedTeam.members.map(member => ({
        id: member.userId._id,
        username: member.userId.username,
        email: member.userId.email,
        role: member.role,
        status: member.userId.status,
        lastLogin: member.userId.lastLogin,
        permissions: member.permissions,
        joinedAt: member.joinedAt
      })),
      canAddMembers: populatedTeam.canAddMember(),
      availableSlots: populatedTeam.availableSlots
    });
  } catch (error) {
    console.error('Get team management error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Invite team member
exports.inviteTeamMember = async (req, res) => {
  try {
    const { email, role, permissions } = req.body;
    const userId = req.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has team management permissions
    if (!user.isAdmin && user.subscription === 'free') {
      return res.status(403).json({ error: 'Team management requires a paid subscription' });
    }

    // Get or create team for user
    let team = await Team.findOne({ ownerId: userId });
    if (!team) {
      // Create team for user
      team = await Team.createForUser(userId, `${user.username || user.email}'s Team`);
    }

    // Check if team can add more members
    if (!team.canAddMember()) {
      return res.status(400).json({ 
        error: 'Cannot add more team members',
        currentMembers: team.members.length,
        maxMembers: team.maxMembers
      });
    }

    // Check if user already exists
    let invitedUser = await User.findOne({ email });
    
    if (!invitedUser) {
      // Create new user account
      const tempPassword = Math.random().toString(36).slice(-8);
      invitedUser = await User.create({
        email,
        username: email.split('@')[0],
        password: tempPassword,
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

    // Add user to team
    await team.addMember(invitedUser._id, role || 'employee', permissions || {});
    
    res.json({
      success: true,
      message: 'Team member invited successfully',
      user: {
        id: invitedUser._id,
        email: invitedUser.email,
        role: invitedUser.role
      },
      team: {
        id: team._id,
        name: team.name,
        memberCount: team.members.length,
        maxMembers: team.maxMembers
      }
    });
  } catch (error) {
    console.error('Team invitation error:', error);
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