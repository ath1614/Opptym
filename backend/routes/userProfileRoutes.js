const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getProfileCompletion } = require('../controllers/userProfileController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get user profile
router.get('/profile', getUserProfile);

// Update user profile
router.put('/profile', updateUserProfile);

// Get profile completion percentage
router.get('/profile/completion', getProfileCompletion);

module.exports = router;
