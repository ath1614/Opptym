const express = require('express');
const router = express.Router();
const bookmarkletController = require('../controllers/bookmarkletController');
const { protect } = require('../middleware/authMiddleware');

// Generate new bookmarklet token
router.post('/generate', protect, bookmarkletController.generateBookmarkletToken);

// Validate bookmarklet token (no auth required - used by bookmarklet)
router.post('/validate', bookmarkletController.validateBookmarkletToken);

// Get user's bookmarklet tokens
router.get('/tokens', protect, bookmarkletController.getUserBookmarkletTokens);

// Deactivate bookmarklet token
router.delete('/tokens/:tokenId', protect, bookmarkletController.deactivateBookmarkletToken);

// Get bookmarklet analytics
router.get('/analytics', protect, bookmarkletController.getBookmarkletAnalytics);

module.exports = router;
