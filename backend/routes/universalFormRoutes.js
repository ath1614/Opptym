const express = require('express');
const router = express.Router();
const universalFormController = require('../controllers/universalFormController');
const { protect } = require('../middleware/authMiddleware');

// Universal form analysis routes
router.get('/:projectId', protect, universalFormController.runUniversalFormAnalysis);

// Automation execution routes
router.post('/:projectId/execute', protect, universalFormController.executeAutomation);

module.exports = router; 