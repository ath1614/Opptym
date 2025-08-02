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
    // Check subscription limits
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user can submit to directories
    if (!user.hasPermission('canSubmitToDirectories')) {
      return res.status(403).json({ error: 'You do not have permission to submit to directories' });
    }

    // Check submission limit
    if (!user.checkUsageLimit('submissions')) {
      const limits = user.subscriptionLimits;
      return res.status(403).json({ 
        error: 'Submission limit exceeded',
        limit: limits.submissions,
        current: user.currentUsage.submissionsMade,
        subscription: user.subscription
      });
    }

    const { projectId, siteName, submissionType, status = 'pending' } = req.body;

    const submission = await Submission.create({
      userId: req.userId,
      projectId,
      siteName,
      submissionType,
      status,
      submittedAt: new Date()
    });

    // Increment usage
    await user.incrementUsage('submissions');

    res.status(201).json(submission);
  } catch (err) {
    console.error('❌ createSubmission error:', err);
    res.status(400).json({ error: 'Submission creation failed' });
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

module.exports = {
  getSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission
};
