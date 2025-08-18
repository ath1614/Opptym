const nodemailer = require('nodemailer');

// Email configuration for Hostinger SMTP - Try multiple configurations
const getEmailConfig = () => {
  const baseConfig = {
    auth: {
      user: process.env.EMAIL_USER || 'your-email@opptym.com',
      pass: process.env.EMAIL_PASSWORD || 'your-email-password'
    }
  };

  // Try different configurations
  const configs = [
    {
      name: 'SSL Port 465',
      config: {
        ...baseConfig,
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        tls: { rejectUnauthorized: false }
      }
    },
    {
      name: 'TLS Port 587',
      config: {
        ...baseConfig,
        host: 'smtp.hostinger.com',
        port: 587,
        secure: false,
        requireTLS: true,
        tls: { rejectUnauthorized: false }
      }
    }
  ];

  return configs[0]; // Start with SSL configuration
};

const emailConfig = getEmailConfig();

// Check if email credentials are properly configured
const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && 
                         process.env.EMAIL_USER !== 'your-email@opptym.com' && 
                         process.env.EMAIL_PASSWORD !== 'your-email-password';

console.log('📧 Email configuration status:', isEmailConfigured ? '✅ Configured' : '⚠️ Not configured');
console.log('📧 EMAIL_USER exists:', !!process.env.EMAIL_USER);
console.log('📧 EMAIL_PASSWORD exists:', !!process.env.EMAIL_PASSWORD);
console.log('📧 EMAIL_USER value:', process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 10) + '...' : 'NOT SET');
console.log('📧 EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 'NOT SET');

// For debugging - show all environment variables that contain 'EMAIL'
console.log('📧 All EMAIL-related env vars:');
Object.keys(process.env).forEach(key => {
  if (key.toLowerCase().includes('email')) {
    console.log(`📧 ${key}: ${process.env[key] ? 'SET' : 'NOT SET'}`);
  }
});

// Create transporter with error handling
let transporter;

function createRealTransporter() {
  try {
    console.log('📧 Creating real SMTP transporter with config:', {
      host: emailConfig.config.host,
      port: emailConfig.config.port,
      secure: emailConfig.config.secure,
      user: emailConfig.config.auth.user,
      passLength: emailConfig.config.auth.pass ? emailConfig.config.auth.pass.length : 0
    });
    
    const realTransporter = nodemailer.createTransport(emailConfig.config);
    console.log('✅ Email transporter created successfully');
    return realTransporter;
  } catch (error) {
    console.error('❌ Error creating email transporter:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    return null;
  }
}

function createMockTransporter() {
  console.log('⚠️ Using mock email transporter (no real emails will be sent)');
  return {
    sendMail: async (mailOptions) => {
      console.log('📧 Mock email sent:', mailOptions.to);
      console.log('📧 Subject:', mailOptions.subject);
      console.log('📧 Email content preview:', mailOptions.html ? mailOptions.html.substring(0, 100) + '...' : 'No HTML content');
      return { messageId: 'mock-message-id-' + Date.now() };
    }
  };
}

// Initialize transporter
if (isEmailConfigured) {
  console.log('📧 Attempting to create real SMTP transporter...');
  transporter = createRealTransporter();
  if (!transporter) {
    console.log('❌ Real transporter creation failed, falling back to mock');
    transporter = createMockTransporter();
  } else {
    console.log('✅ Real SMTP transporter created successfully');
  }
} else {
  console.log('⚠️ Email not configured, using mock transporter');
  transporter = createMockTransporter();
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
    from: `"Opptym" <${emailConfig.config.auth.user}>`,
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
    from: `"Opptym" <${emailConfig.config.auth.user}>`,
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

// Function to get current email configuration status
function getEmailConfigStatus() {
  return {
    isConfigured: isEmailConfigured,
    emailUserExists: !!process.env.EMAIL_USER,
    emailPasswordExists: !!process.env.EMAIL_PASSWORD,
    emailUserValue: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 10) + '...' : 'NOT SET',
    emailPasswordLength: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 'NOT SET',
    transporterType: transporter && transporter.sendMail ? 'real' : 'mock'
  };
}

module.exports = {
  transporter,
  emailTemplates,
  getEmailConfigStatus
};
