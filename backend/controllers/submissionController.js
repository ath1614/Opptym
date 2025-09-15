const Submission = require('../models/submissionModel');
const User = require('../models/userModel');

// @desc    Get all submissions for user
// @route   GET /api/submissions
// @access  Private
const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.userId })
      .populate('projectId', 'title url')
      .sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (err) {
    console.error('❌ getSubmissions error:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

// @desc    Create a new submission
// @route   POST /api/submissions
// @access  Private
const createSubmission = async (req, res) => {
  try {
    console.log('🔍 createSubmission called with:', req.body);
    console.log('🔍 userId:', req.userId);
    
    // Check subscription limits
    const user = await User.findById(req.userId);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure usage object is initialized
    if (!user.usage) {
      user.usage = {
        submissionsUsed: 0,
        projectsUsed: 0,
        seoToolsUsed: 0,
        apiCallsUsed: 0
      };
    }

    console.log('🔍 User found:', user.email);
    console.log('🔍 User subscription:', user.subscription);
    console.log('🔍 User features:', user.features);

    // Check if user can submit to directories
    const canSubmit = user.hasFeatureAccess('submissions');
    console.log('🔍 Can submit to directories:', canSubmit);
    
    if (!canSubmit) {
      console.log('❌ No permission to submit to directories');
      return res.status(403).json({ error: 'You do not have permission to submit to directories' });
    }

    // Check submission limit
    const withinLimit = user.checkUsageLimit('submissions');
    console.log('🔍 Within submission limit:', withinLimit);
    
    if (!withinLimit) {
      const limits = user.planLimits;
      console.log('❌ Submission limit exceeded');
      return res.status(403).json({ 
        error: 'Submission limit exceeded',
        limit: limits.submissions,
        current: user.usage.submissionsUsed,
        subscription: user.subscription
      });
    }

    const { projectId, siteName, submissionType, status = 'pending' } = req.body;
    console.log('🔍 Creating submission with:', { projectId, siteName, submissionType, status });

    // Verify project belongs to user
    const Project = require('../models/projectModel');
    const project = await Project.findOne({ _id: projectId, userId: req.userId });
    if (!project) {
      console.log('❌ Project not found or does not belong to user');
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    const submission = await Submission.create({
      userId: req.userId,
      projectId,
      siteName,
      submissionType,
      status,
      submittedAt: new Date()
    });

    console.log('✅ Submission created:', submission._id);

    // Increment usage (temporarily commented out to debug)
    try {
      await user.incrementUsage('submissions');
      console.log('✅ Usage incremented');
    } catch (usageError) {
      console.error('❌ Usage increment failed:', usageError);
      // Continue anyway, don't fail the submission
    }

    res.status(201).json(submission);
  } catch (err) {
    console.error('❌ createSubmission error:', err);
    console.error('❌ Error details:', err.message);
    console.error('❌ Error stack:', err.stack);
    res.status(400).json({ error: 'Submission creation failed', details: err.message });
  }
};

const logSubmission = async (req, res) => {
  const { projectId } = req.params;
  const { siteName, submissionType } = req.body;

  const submission = await Submission.create({
    userId: req.userId,
    projectId,
    siteName,
    submissionType,
  });

  res.status(201).json(submission);
};

// @desc    Get a single submission by ID
// @route   GET /api/submissions/:id
// @access  Private
const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('projectId', 'title url');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.status(200).json(submission);
  } catch (err) {
    console.error('❌ getSubmissionById error:', err);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
};

// @desc    Update a submission
// @route   PUT /api/submissions/:id
// @access  Private
const updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.status(200).json(submission);
  } catch (err) {
    console.error('❌ updateSubmission error:', err);
    res.status(400).json({ error: 'Update failed' });
  }
};

// @desc    Delete a submission
// @route   DELETE /api/submissions/:id
// @access  Private
const deleteSubmission = async (req, res) => {
  try {
    const result = await Submission.deleteOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Submission not found or already deleted' });
    }

    res.status(204).end();
  } catch (err) {
    console.error('❌ deleteSubmission error:', err);
    res.status(400).json({ error: 'Delete failed' });
  }
};

// @desc    Create a submission from bookmarklet
// @route   POST /api/submissions/bookmarklet
// @access  Public (no authentication required)
const createBookmarkletSubmission = async (req, res) => {
  try {
    console.log('🔍 createBookmarkletSubmission called with:', req.body);
    
    const { token, url, fieldsFilled, filledFields, timestamp } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    // Extract user ID and check usage limits from token
    // The token format is: opptym_timestamp_userId_randomString
    const tokenParts = token.split('_');
    if (tokenParts.length < 4 || tokenParts[0] !== 'opptym') {
      return res.status(400).json({ error: 'Invalid token format' });
    }
    
    const userId = tokenParts[2];
    const tokenTimestamp = parseInt(tokenParts[1]);
    
    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - tokenTimestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (tokenAge > maxAge) {
      return res.status(400).json({ error: 'Bookmarklet token has expired' });
    }
    
    // Get user to check subscription and usage limits
    const User = require('../models/userModel');
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    const user = await User.findById(userObjectId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    // Check usage limits based on subscription
    const userPlan = user.subscription || 'free';
    const maxUses = userPlan === 'free' ? 1 : 5;
    
    // Count existing bookmarklet submissions for this token
    const existingSubmissions = await Submission.countDocuments({
      userId: userObjectId,
      submissionType: 'bookmarklet',
      'metadata.token': token,
      submittedAt: { $gte: new Date(tokenTimestamp) }
    });
    
    if (existingSubmissions >= maxUses) {
      return res.status(403).json({ 
        error: 'Bookmarklet usage limit exceeded',
        limit: maxUses,
        used: existingSubmissions,
        plan: userPlan
      });
    }
    
    // Create a simple submission record for tracking
    const submission = await Submission.create({
      userId: userObjectId,
      siteName: new URL(url).hostname,
      submissionType: 'bookmarklet',
      status: 'completed',
      submittedAt: new Date(),
      metadata: {
        token: token,
        url: url,
        fieldsFilled: fieldsFilled,
        filledFields: filledFields,
        timestamp: tokenTimestamp,
        source: 'bookmarklet',
        userPlan: userPlan,
        usageCount: existingSubmissions + 1
      }
    });
    
    // Increment user's submission usage counter
    try {
      await user.incrementUsage('submissions');
      console.log('✅ User submission usage incremented');
    } catch (usageError) {
      console.error('❌ Usage increment failed:', usageError);
      // Continue anyway, don't fail the submission
    }
    
    console.log('✅ Bookmarklet submission tracked:', submission._id);
    
    res.status(201).json({
      success: true,
      submissionId: submission._id,
      message: 'Submission tracked successfully'
    });
  } catch (err) {
    console.error('❌ createBookmarkletSubmission error:', err);
    res.status(400).json({ error: 'Failed to track submission', details: err.message });
  }
};

// @desc    Get submission statistics for dashboard
// @route   GET /api/submissions/stats
// @access  Private
const getSubmissionStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Convert userId to ObjectId for MongoDB queries
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Get overall submission counts by status
    let overallStats = [];
    try {
      overallStats = await Submission.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
    } catch (aggregationError) {
      console.error('❌ Overall stats aggregation error:', aggregationError);
      // Fallback to simple count
      const totalCount = await Submission.countDocuments({ userId: userObjectId });
      overallStats = [{ _id: 'completed', count: totalCount }];
    }
    
    // Get submission counts by classification type and status
    const classificationStats = await Submission.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: {
            submissionType: '$submissionType',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get total submissions
    const totalSubmissions = await Submission.countDocuments({ userId: userObjectId });
    
    // Get recent submissions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSubmissions = await Submission.countDocuments({
      userId: userObjectId,
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Format overall stats
    const overallStatusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0
    };
    
    overallStats.forEach(stat => {
      overallStatusCounts[stat._id] = stat.count;
    });
    
    // Format classification stats
    const classificationBreakdown = {};
    classificationStats.forEach(stat => {
      const type = stat._id.submissionType;
      const status = stat._id.status;
      
      if (!classificationBreakdown[type]) {
        classificationBreakdown[type] = {
          pending: 0,
          approved: 0,
          rejected: 0,
          completed: 0,
          total: 0
        };
      }
      
      classificationBreakdown[type][status] = stat.count;
      classificationBreakdown[type].total += stat.count;
    });
    
    // Calculate success rates for each classification
    Object.keys(classificationBreakdown).forEach(type => {
      const typeStats = classificationBreakdown[type];
      typeStats.successRate = typeStats.total > 0 ? 
        Math.round((typeStats.approved / typeStats.total) * 100) : 0;
    });
    
    res.status(200).json({
      overall: {
        total: totalSubmissions,
        recent: recentSubmissions,
        byStatus: overallStatusCounts,
        successRate: totalSubmissions > 0 ? Math.round((overallStatusCounts.approved / totalSubmissions) * 100) : 0
      },
      byClassification: classificationBreakdown
    });
  } catch (err) {
    console.error('❌ getSubmissionStats error:', err);
    res.status(500).json({ error: 'Failed to fetch submission statistics' });
  }
};

// @desc    Get submission statistics for a specific classification type
// @route   GET /api/submissions/stats/:type
// @access  Private
const getSubmissionStatsByType = async (req, res) => {
  try {
    const userId = req.userId;
    const { type } = req.params;
    
    // Convert userId to ObjectId for MongoDB queries
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Validate submission type
    const validTypes = ['directory', 'article', 'bookmark', 'classified', 'forum', 'social', 'local', 'citation', 'web2', 'qa', 'bookmarklet'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid submission type' });
    }
    
    // Get submission counts by status for this type
    const stats = await Submission.aggregate([
      { $match: { userId: userObjectId, submissionType: type } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get total submissions for this type
    const totalSubmissions = await Submission.countDocuments({ 
      userId: userObjectId, 
      submissionType: type 
    });
    
    // Get recent submissions for this type (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSubmissions = await Submission.countDocuments({
      userId: userObjectId,
      submissionType: type,
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Format stats
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0
    };
    
    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });
    
    res.status(200).json({
      type: type,
      total: totalSubmissions,
      recent: recentSubmissions,
      byStatus: statusCounts,
      successRate: totalSubmissions > 0 ? Math.round((statusCounts.approved / totalSubmissions) * 100) : 0
    });
  } catch (err) {
    console.error('❌ getSubmissionStatsByType error:', err);
    res.status(500).json({ error: 'Failed to fetch submission statistics for type' });
  }
};

// @desc    Update submission status (for admin or automated systems)
// @route   PUT /api/submissions/:id/status
// @access  Private
const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const submission = await Submission.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { 
        status: status,
        statusUpdatedAt: new Date(),
        statusNotes: notes
      },
      { new: true, runValidators: true }
    );
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    res.status(200).json({
      success: true,
      submission: submission,
      message: `Submission status updated to ${status}`
    });
  } catch (err) {
    console.error('❌ updateSubmissionStatus error:', err);
    res.status(400).json({ error: 'Failed to update submission status' });
  }
};

module.exports = {
  getSubmissions,
  getSubmissionById,
  createSubmission,
  createBookmarkletSubmission,
  updateSubmission,
  deleteSubmission,
  getSubmissionStats,
  getSubmissionStatsByType,
  updateSubmissionStatus
};
