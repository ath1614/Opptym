const User = require('../models/userModel');
const { transporter, emailTemplates } = require('../config/emailConfig');

// Generate and send OTP for signup
const generateSignupOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login instead.'
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create or update user with OTP
    let user = existingUser;
    if (!user) {
      user = new User({
        email,
        signupOTP: otp,
        signupOTPExpires: expiresAt,
        isSignupOTPVerified: false,
        status: 'pending'
      });
    } else {
      user.signupOTP = otp;
      user.signupOTPExpires = expiresAt;
      user.isSignupOTPVerified = false;
    }

    await user.save();

    // Send OTP email
    if (transporter && emailTemplates) {
      try {
        const mailOptions = {
          from: `"Opptym" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Your Opptym Signup OTP',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">Opptym</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Signup Verification</p>
              </div>
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-bottom: 20px;">Your Signup OTP</h2>
                <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                  Use this OTP to complete your signup process:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <div style="background: #fff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; display: inline-block;">
                    <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
                  </div>
                </div>
                <p style="color: #666; font-size: 14px; margin-top: 25px;">
                  This OTP will expire in 10 minutes. If you didn't request this OTP, please ignore this email.
                </p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Signup OTP email sent successfully to:', email);
      } catch (emailError) {
        console.error('❌ Error sending signup OTP email:', emailError);
        // Don't fail if email fails, but log it
      }
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      email: email
    });

  } catch (error) {
    console.error('❌ Error generating signup OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate OTP. Please try again.'
    });
  }
};

// Verify signup OTP and complete registration
const verifySignupOTP = async (req, res) => {
  try {
    const { email, otp, username, password } = req.body;

    if (!email || !otp || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, username, and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (user.signupOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check your email and try again.'
      });
    }

    if (user.signupOTPExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Complete registration
    user.username = username;
    user.password = password; // Password will be hashed by the pre-save middleware
    user.isSignupOTPVerified = true;
    user.isEmailVerified = true;
    user.status = 'active';
    user.signupOTP = undefined;
    user.signupOTPExpires = undefined;

    await user.save();

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'opptym-secret-key-2024-fallback';
    
    console.log('🔐 Generating JWT token for signup user:', user._id);
    console.log('🔐 JWT Secret available:', !!process.env.JWT_SECRET);
    console.log('🔐 Using JWT Secret:', jwtSecret.substring(0, 10) + '...');
    
    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username || '',
      isAdmin: user.isAdmin || false,
      subscription: user.subscription || 'free',
      email: user.email
    };
    
    console.log('🔐 Token payload:', tokenPayload);
    
    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });
    
    console.log('🔐 Token generated successfully, length:', token.length);
    console.log('🔐 Token preview:', token.substring(0, 50) + '...');

    res.status(200).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('❌ Error verifying signup OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
};

// Generate and send OTP for login
const generateLoginOTP = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user and verify password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.loginOTP = otp;
    user.loginOTPExpires = expiresAt;
    user.isLoginOTPVerified = false;
    await user.save();

    // Send OTP email
    if (transporter && emailTemplates) {
      try {
        const mailOptions = {
          from: `"Opptym" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Your Opptym Login OTP',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">Opptym</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Login Verification</p>
              </div>
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-bottom: 20px;">Your Login OTP</h2>
                <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                  Use this OTP to complete your login:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <div style="background: #fff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; display: inline-block;">
                    <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
                  </div>
                </div>
                <p style="color: #666; font-size: 14px; margin-top: 25px;">
                  This OTP will expire in 10 minutes. If you didn't request this OTP, please ignore this email.
                </p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Login OTP email sent successfully to:', email);
      } catch (emailError) {
        console.error('❌ Error sending login OTP email:', emailError);
        // Don't fail if email fails, but log it
      }
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      email: email
    });

  } catch (error) {
    console.error('❌ Error generating login OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate OTP. Please try again.'
    });
  }
};

// Verify login OTP and complete login
const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    if (user.loginOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check your email and try again.'
      });
    }

    if (user.loginOTPExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Complete login
    user.isLoginOTPVerified = true;
    user.loginOTP = undefined;
    user.loginOTPExpires = undefined;
    await user.save();

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'opptym-secret-key-2024-fallback';
    
    console.log('🔐 Generating JWT token for login user:', user._id);
    console.log('🔐 JWT Secret available:', !!process.env.JWT_SECRET);
    console.log('🔐 Using JWT Secret:', jwtSecret.substring(0, 10) + '...');
    
    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username || '',
      isAdmin: user.isAdmin || false,
      subscription: user.subscription || 'free',
      email: user.email
    };
    
    console.log('🔐 Token payload:', tokenPayload);
    
    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });
    
    console.log('🔐 Token generated successfully, length:', token.length);
    console.log('🔐 Token preview:', token.substring(0, 50) + '...');

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('❌ Error verifying login OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
};

module.exports = {
  generateSignupOTP,
  verifySignupOTP,
  generateLoginOTP,
  verifyLoginOTP
};
