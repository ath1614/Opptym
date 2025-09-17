const User = require('../models/userModel');
const Team = require('../models/teamModel');
const TeamInvitation = require('../models/teamInvitationModel');
const emailService = require('../services/emailService');

// Create team invitation
const createInvitation = async (req, res) => {
  try {
    const { email, role, permissions, teamId } = req.body;
    const invitedBy = req.userId;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await TeamInvitation.findOne({
      email: email.toLowerCase(),
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return res.status(400).json({ error: 'An invitation has already been sent to this email' });
    }

    // Get inviter details
    const inviter = await User.findById(invitedBy);
    if (!inviter) {
      return res.status(404).json({ error: 'Inviter not found' });
    }

    // Create invitation
    const invitation = await TeamInvitation.createInvitation({
      email: email.toLowerCase(),
      invitedBy,
      teamId: teamId || null,
      role: role || 'employee',
      permissions: permissions || {
        canUseSeoTools: true,
        canCreateProjects: true,
        canEditProjects: false,
        canDeleteProjects: false,
        canSubmitToDirectories: true,
        canViewSubmissionReports: true,
        canManageTeamMembers: false,
        canAccessAdminPanel: false
      }
    });

    // Send invitation email
    try {
      const inviteUrl = invitation.generateInviteUrl(process.env.FRONTEND_URL || 'http://localhost:3000');
      
      await emailService.sendEmail({
        to: email,
        subject: `You're invited to join ${inviter.username || inviter.firstName}'s team on OPPTYM`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
            </div>
            <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hello!
              </p>
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                <strong>${inviter.username || inviter.firstName}</strong> has invited you to join their team on OPPTYM, the powerful SEO automation platform.
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 10px 0; color: #333;">Your Role: ${role || 'Employee'}</h3>
                <p style="margin: 0; color: #666; font-size: 14px;">
                  You'll have access to SEO tools, project management, and directory submissions.
                </p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold; 
                          display: inline-block;
                          font-size: 16px;">
                  Accept Invitation
                </a>
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                This invitation will expire in 7 days. If you don't want to join, you can simply ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 12px; color: #999; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${inviteUrl}" style="color: #667eea;">${inviteUrl}</a>
              </p>
            </div>
          </div>
        `
      });

      console.log('✅ Invitation email sent to:', email);
    } catch (emailError) {
      console.error('❌ Failed to send invitation email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    res.status(201).json({
      success: true,
      message: 'Team member invitation sent successfully',
      invitation: {
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    console.error('❌ Create invitation error:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
};

// Get invitations sent by user
const getInvitations = async (req, res) => {
  try {
    const invitations = await TeamInvitation.getInvitationsByUser(req.userId);
    
    res.json({
      success: true,
      invitations
    });
  } catch (error) {
    console.error('❌ Get invitations error:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
};

// Accept invitation
const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Invitation token is required' });
    }

    // Find invitation
    const invitation = await TeamInvitation.findByToken(token);
    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    // Check if user is already logged in
    const currentUser = req.userId ? await User.findById(req.userId) : null;
    
    if (currentUser) {
      // User is logged in, accept invitation directly
      await invitation.accept(currentUser._id);
      
      // Add user to team if teamId exists
      if (invitation.teamId) {
        const team = await Team.findById(invitation.teamId);
        if (team) {
          await team.addMember(currentUser._id, invitation.role, invitation.permissions);
        }
      }

      res.json({
        success: true,
        message: 'Invitation accepted successfully',
        user: {
          id: currentUser._id,
          email: currentUser.email,
          username: currentUser.username
        }
      });
    } else {
      // User is not logged in, redirect to signup/login
      res.json({
        success: true,
        message: 'Please sign up or log in to accept the invitation',
        requiresAuth: true,
        invitation: {
          email: invitation.email,
          role: invitation.role,
          invitedBy: invitation.invitedBy
        }
      });
    }
  } catch (error) {
    console.error('❌ Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
};

// Decline invitation
const declineInvitation = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Invitation token is required' });
    }

    const invitation = await TeamInvitation.findByToken(token);
    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    await invitation.decline();

    res.json({
      success: true,
      message: 'Invitation declined'
    });
  } catch (error) {
    console.error('❌ Decline invitation error:', error);
    res.status(500).json({ error: 'Failed to decline invitation' });
  }
};

// Cancel invitation
const cancelInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await TeamInvitation.findOne({
      _id: invitationId,
      invitedBy: req.userId,
      status: 'pending'
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    await invitation.cancel();

    res.json({
      success: true,
      message: 'Invitation cancelled successfully'
    });
  } catch (error) {
    console.error('❌ Cancel invitation error:', error);
    res.status(500).json({ error: 'Failed to cancel invitation' });
  }
};

// Get invitation by token (for email links)
const getInvitationByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await TeamInvitation.findByToken(token);
    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    res.json({
      success: true,
      invitation: {
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        permissions: invitation.permissions,
        invitedBy: invitation.invitedBy,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    console.error('❌ Get invitation error:', error);
    res.status(500).json({ error: 'Failed to fetch invitation' });
  }
};

// Create team
const createTeam = async (req, res) => {
  try {
    const { name, description, settings } = req.body;
    const ownerId = req.userId;

    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    // Check if user already has a team
    const existingTeam = await Team.findOne({ owner: ownerId });
    if (existingTeam) {
      return res.status(400).json({ error: 'You already have a team' });
    }

    const team = await Team.createTeam({
      name,
      description,
      owner: ownerId,
      settings: settings || {}
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    console.error('❌ Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
};

// Get team details
const getTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ owner: req.userId })
      .populate('members.user', 'username email firstName lastName')
      .populate('owner', 'username email firstName lastName');

    if (!team) {
      // Return default team structure for admin users to invite VIP customers
      const user = await User.findById(req.userId);
      if (user && user.role === 'admin') {
        return res.json({
          success: true,
          team: {
            _id: 'default',
            name: 'Admin Team',
            description: 'Invite VIP customers and team members',
            owner: req.userId,
            members: [],
            memberCount: 0,
            subscriptionPlan: 'admin',
            maxMembers: 100,
            totalProjects: 0,
            totalSubmissions: 0
          }
        });
      }
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({
      success: true,
      team
    });
  } catch (error) {
    console.error('❌ Get team error:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
};

module.exports = {
  createInvitation,
  getInvitations,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
  getInvitationByToken,
  createTeam,
  getTeam
};
