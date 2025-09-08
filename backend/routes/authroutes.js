const express = require('express');
const { signup, login, updateProfile, changePassword, getProfile, exportUserData, deleteAccount, uploadProfilePhoto } = require('../controllers/authController');
const { sendVerificationEmail, verifyEmail, resendVerificationEmail, requestPasswordReset, verifyResetToken, resetPassword } = require('../controllers/emailController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Email verification routes
router.post('/send-verification', sendVerificationEmail);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Password reset routes
router.post('/forgot-password', requestPasswordReset);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.put('/photo', protect, uploadProfilePhoto);
router.get('/export', protect, exportUserData);
router.delete('/account', protect, deleteAccount);

module.exports = router;
