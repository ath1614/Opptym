const nodemailer = require('nodemailer');

// Email configuration for Hostinger SMTP
const emailConfig = {
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER || 'your-email@opptym.com', // Replace with actual email
    pass: process.env.EMAIL_PASSWORD || 'your-email-password' // Replace with actual password
  }
};

// Check if email credentials are properly configured
const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && 
                         process.env.EMAIL_USER !== 'your-email@opptym.com' && 
                         process.env.EMAIL_PASSWORD !== 'your-email-password';

console.log('📧 Email configuration status:', isEmailConfigured ? '✅ Configured' : '⚠️ Not configured');
console.log('📧 EMAIL_USER exists:', !!process.env.EMAIL_USER);
console.log('📧 EMAIL_PASSWORD exists:', !!process.env.EMAIL_PASSWORD);
console.log('📧 EMAIL_USER value:', process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 10) + '...' : 'NOT SET');
console.log('📧 EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 'NOT SET');

// Create transporter with error handling
let transporter;
if (isEmailConfigured) {
  try {
    transporter = nodemailer.createTransporter(emailConfig);
    console.log('✅ Email transporter created successfully');
  } catch (error) {
    console.error('❌ Error creating email transporter:', error);
    createMockTransporter();
  }
} else {
  console.log('⚠️ Using mock email transporter (no real emails will be sent)');
  createMockTransporter();
}

function createMockTransporter() {
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('📧 Mock email sent:', mailOptions.to);
      console.log('📧 Subject:', mailOptions.subject);
      console.log('📧 Email content preview:', mailOptions.html ? mailOptions.html.substring(0, 100) + '...' : 'No HTML content');
      return { messageId: 'mock-message-id-' + Date.now() };
    }
  };
}

// Email templates
const emailTemplates = {
  verificationEmail: (token, userEmail) => ({
    from: `"Opptym" <${emailConfig.auth.user}>`,
    to: userEmail,
    subject: 'Verify Your Opptym Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Opptym</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Account Verification</p>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to Opptym!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for signing up! To complete your registration and start using Opptym's powerful automation features, please verify your email address.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://opptym.com'}/verify-email?token=${token}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${process.env.FRONTEND_URL || 'https://opptym.com'}/verify-email?token=${token}" style="color: #667eea;">
              ${process.env.FRONTEND_URL || 'https://opptym.com'}/verify-email?token=${token}
            </a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      </div>
    `
  }),

  welcomeEmail: (userEmail, userName) => ({
    from: `"Opptym" <${emailConfig.auth.user}>`,
    to: userEmail,
    subject: 'Welcome to Opptym - Your Account is Verified!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Opptym</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome aboard!</p>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome, ${userName}!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Your email has been successfully verified! You now have full access to all of Opptym's powerful automation features.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://opptym.com'}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            Start automating your form submissions and boost your productivity today!
          </p>
        </div>
      </div>
    `
  })
};

module.exports = {
  transporter,
  emailTemplates
};
