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
    
    // For bookmarklet submissions, we'll use a generic user ID since the token doesn't contain user info
    // The token format is: opptym_timestamp_randomString
    const tokenParts = token.split('_');
    if (tokenParts.length < 3 || tokenParts[0] !== 'opptym') {
      return res.status(400).json({ error: 'Invalid token format' });
    }
    
    // Use a default user ID for bookmarklet submissions
    // In a real implementation, you might want to store token-to-user mappings
    const userId = '688f1268f4921cd9020bcc96'; // Default user ID for bookmarklet submissions
    
    // Create a simple submission record for tracking
    const submission = await Submission.create({
      userId: userId,
      siteName: new URL(url).hostname,
      submissionType: 'bookmarklet',
      status: 'completed',
      submittedAt: new Date(),
      metadata: {
        url: url,
        fieldsFilled: fieldsFilled,
        filledFields: filledFields,
        timestamp: timestamp,
        source: 'bookmarklet'
      }
    });
    
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

module.exports = {
  getSubmissions,
  getSubmissionById,
  createSubmission,
  createBookmarkletSubmission,
  updateSubmission,
  deleteSubmission
};
