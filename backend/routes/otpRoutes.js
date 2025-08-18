const express = require('express');
const router = express.Router();
const {
  generateSignupOTP,
  verifySignupOTP,
  generateLoginOTP,
  verifyLoginOTP
} = require('../controllers/otpController');

// Generate OTP for signup
router.post('/signup/generate', generateSignupOTP);

// Verify OTP for signup
router.post('/signup/verify', verifySignupOTP);

// Generate OTP for login
router.post('/login/generate', generateLoginOTP);

// Verify OTP for login
router.post('/login/verify', verifyLoginOTP);

module.exports = router;
