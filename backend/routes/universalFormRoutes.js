const express = require('express');
const router = express.Router();
const universalFormController = require('../controllers/universalFormController');
const { protect } = require('../middleware/authMiddleware');

// Universal form automation execution route
router.post('/automate', protect, universalFormController.executeUniversalForm);

module.exports = router; 