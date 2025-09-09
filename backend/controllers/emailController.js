const User = require('../models/userModel');
const EmailVerificationToken = require('../models/emailVerificationTokenModel');
const PasswordResetToken = require('../models/passwordResetTokenModel');
const emailService = require('../services/emailService');

// Send email verification
const sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        error: 'INVALID_EMAIL',
        message: 'Please enter a valid email address'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'No account found with this email address'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        error: 'ALREADY_VERIFIED',
        message: 'Email address is already verified'
      });
    }

    // Create verification token
    const verificationToken = await EmailVerificationToken.createForUser(user._id, user.email);

    // Send verification email
    await emailService.sendVerificationEmail(
      user.email,
      user.username,
      verificationToken.token
    );

    console.log(`📧 Verification email sent to ${user.email}`);

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({
      error: 'EMAIL_SEND_FAILED',
      message: 'Failed to send verification email. Please try again.'
    });
  }
};

// Verify email with token
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        error: 'MISSING_TOKEN',
        message: 'Verification token is required'
      });
    }

    // Find verification token
    const verificationToken = await EmailVerificationToken.findOne({ token });
    if (!verificationToken) {
      return res.status(400).json({
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired verification token'
      });
    }

    // Verify token
    try {
      await verificationToken.verify();
    } catch (error) {
      if (error.message === 'Token has already been used') {
        return res.status(400).json({
          error: 'TOKEN_USED',
          message: 'This verification link has already been used'
        });
      }
      if (error.message === 'Token has expired') {
        return res.status(400).json({
          error: 'TOKEN_EXPIRED',
          message: 'Verification link has expired. Please request a new one.'
        });
      }
      if (error.message === 'Too many verification attempts') {
        return res.status(400).json({
          error: 'TOO_MANY_ATTEMPTS',
          message: 'Too many verification attempts. Please request a new verification email.'
        });
      }
      throw error;
    }

    // Update user verification status
    const user = await User.findById(verificationToken.userId);
    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    user.isEmailVerified = true;
    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.username);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the verification if welcome email fails
    }

    console.log(`✅ Email verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({
      error: 'VERIFICATION_FAILED',
      message: 'Email verification failed. Please try again.'
    });
  }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        error: 'INVALID_EMAIL',
        message: 'Please enter a valid email address'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'No account found with this email address'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        error: 'ALREADY_VERIFIED',
        message: 'Email address is already verified'
      });
    }

    // Check for recent verification email (rate limiting)
    const recentToken = await EmailVerificationToken.findOne({
      userId: user._id,
      createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) }, // 2 minutes
      isUsed: false
    });

    if (recentToken) {
      return res.status(429).json({
        error: 'RATE_LIMITED',
        message: 'Please wait 2 minutes before requesting another verification email'
      });
    }

    // Create new verification token
    const verificationToken = await EmailVerificationToken.createForUser(user._id, user.email);

    // Send verification email
    try {
      await emailService.sendVerificationEmail(
        user.email,
        user.username,
        verificationToken.token
      );

      console.log(`📧 Verification email resent to ${user.email}`);
      console.log(`🔗 Verification token: ${verificationToken.token}`);

      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      
      // Delete the token if email sending failed
      await EmailVerificationToken.findByIdAndDelete(verificationToken._id);
      
      return res.status(500).json({
        error: 'EMAIL_SEND_FAILED',
        message: 'Failed to send verification email. Please check your email configuration.'
      });
    }
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({
      error: 'EMAIL_SEND_FAILED',
      message: 'Failed to send verification email. Please try again.'
    });
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        error: 'INVALID_EMAIL',
        message: 'Please enter a valid email address'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Check for recent reset requests (rate limiting)
    const hasRecentRequest = await PasswordResetToken.hasRecentRequest(email, 15); // 15 minutes
    if (hasRecentRequest) {
      return res.status(429).json({
        error: 'RATE_LIMITED',
        message: 'Please wait 15 minutes before requesting another password reset'
      });
    }

    // Create reset token
    const resetToken = await PasswordResetToken.createForUser(
      user._id,
      user.email,
      ipAddress,
      userAgent
    );

    // Send reset email
    await emailService.sendPasswordResetEmail(
      user.email,
      user.username,
      resetToken.token
    );

    console.log(`📧 Password reset email sent to ${user.email}`);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({
      error: 'RESET_REQUEST_FAILED',
      message: 'Failed to process password reset request. Please try again.'
    });
  }
};

// Verify password reset token
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        error: 'MISSING_TOKEN',
        message: 'Reset token is required'
      });
    }

    // Find reset token
    const resetToken = await PasswordResetToken.findOne({ token });
    if (!resetToken) {
      return res.status(400).json({
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired reset token'
      });
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      return res.status(400).json({
        error: 'TOKEN_EXPIRED',
        message: 'Reset token has expired. Please request a new one.'
      });
    }

    // Check if token is already used
    if (resetToken.isUsed) {
      return res.status(400).json({
        error: 'TOKEN_USED',
        message: 'This reset link has already been used'
      });
    }

    // Check if too many attempts
    if (resetToken.attempts >= 3) {
      return res.status(400).json({
        error: 'TOO_MANY_ATTEMPTS',
        message: 'Too many reset attempts. Please request a new reset link.'
      });
    }

    res.json({
      success: true,
      message: 'Reset token is valid',
      email: resetToken.email
    });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    res.status(500).json({
      error: 'TOKEN_VERIFICATION_FAILED',
      message: 'Failed to verify reset token. Please try again.'
    });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Token and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'WEAK_PASSWORD',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find reset token
    const resetToken = await PasswordResetToken.findOne({ token });
    if (!resetToken) {
      return res.status(400).json({
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired reset token'
      });
    }

    // Verify token
    try {
      await resetToken.verify();
    } catch (error) {
      if (error.message === 'Token has already been used') {
        return res.status(400).json({
          error: 'TOKEN_USED',
          message: 'This reset link has already been used'
        });
      }
      if (error.message === 'Token has expired') {
        return res.status(400).json({
          error: 'TOKEN_EXPIRED',
          message: 'Reset token has expired. Please request a new one.'
        });
      }
      if (error.message === 'Too many reset attempts') {
        return res.status(400).json({
          error: 'TOO_MANY_ATTEMPTS',
          message: 'Too many reset attempts. Please request a new reset link.'
        });
      }
      throw error;
    }

    // Update user password
    const user = await User.findById(resetToken.userId);
    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    user.password = newPassword;
    await user.save();

    console.log(`✅ Password reset successful for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      error: 'PASSWORD_RESET_FAILED',
      message: 'Password reset failed. Please try again.'
    });
  }
};

module.exports = {
  sendVerificationEmail,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  verifyResetToken,
  resetPassword
};
