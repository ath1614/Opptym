const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const submissionController = require('../controllers/submissionController');

// Get all submissions for the authenticated user
router.get('/', protect, submissionController.getSubmissions);

// Get a specific submission by ID
router.get('/:id', protect, submissionController.getSubmissionById);

// Create a new submission
router.post('/', protect, submissionController.createSubmission);

// Update a submission
router.put('/:id', protect, submissionController.updateSubmission);

// Delete a submission
router.delete('/:id', protect, submissionController.deleteSubmission);

module.exports = router;
