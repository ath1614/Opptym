const express = require('express');
const { signup, login, updateProfile, changePassword, getProfile, exportUserData, deleteAccount, directLogin, directSignup } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Direct auth routes (bypass OTP for testing)
router.post('/direct-signup', directSignup);
router.post('/direct-login', directLogin);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.get('/export', protect, exportUserData);
router.delete('/account', protect, deleteAccount);

module.exports = router;
