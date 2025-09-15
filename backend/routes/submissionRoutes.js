const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkTrialStatus, checkUsageLimit } = require('../middleware/trialMiddleware');
const submissionController = require('../controllers/submissionController');

// Get all submissions for the authenticated user
router.get('/', protect, submissionController.getSubmissions);

// Get a specific submission by ID
router.get('/:id', protect, submissionController.getSubmissionById);

// Create a new submission - requires trial check and usage limit check
router.post('/', protect, checkTrialStatus, checkUsageLimit('submissions'), submissionController.createSubmission);

// Create a submission from bookmarklet - no authentication required
router.post('/bookmarklet', submissionController.createBookmarkletSubmission);

// Get submission statistics
router.get('/stats', protect, submissionController.getSubmissionStats);

// Get submission statistics for specific type
router.get('/stats/:type', protect, submissionController.getSubmissionStatsByType);

// Update a submission - requires trial check
router.put('/:id', protect, checkTrialStatus, submissionController.updateSubmission);

// Update submission status
router.put('/:id/status', protect, submissionController.updateSubmissionStatus);

// Delete a submission - requires trial check
router.delete('/:id', protect, checkTrialStatus, submissionController.deleteSubmission);

module.exports = router;
