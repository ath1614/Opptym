const express = require("express");
const router = express.Router();
const emailVerificationController = require("../controllers/emailVerificationController");

// Send verification email
router.post("/send-verification", emailVerificationController.sendVerificationEmail);

// Verify email with token
router.get("/verify/:token", emailVerificationController.verifyEmail);

// Resend verification email
router.post("/resend-verification", emailVerificationController.resendVerificationEmail);

// Check verification status
router.get("/status/:email", emailVerificationController.checkVerificationStatus);

module.exports = router;
