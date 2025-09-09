const emailService = require('../services/emailService');
require('dotenv').config();

const testEmail = async () => {
  try {
    console.log('🧪 Testing email service...');
    console.log('📧 Email User:', process.env.EMAIL_USER);
    console.log('🔑 Email Password:', process.env.EMAIL_PASSWORD ? '[SET]' : '[NOT SET]');
    
    // Test email sending
    const testEmail = process.env.EMAIL_USER; // Send to yourself for testing
    
    if (!testEmail) {
      console.error('❌ EMAIL_USER not set in environment variables');
      return;
    }
    
    console.log('📤 Sending test email to:', testEmail);
    
    await emailService.sendVerificationEmail(
      testEmail,
      'Test User',
      'test-token-12345'
    );
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Check your inbox for the verification email');
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.error('🔍 Error details:', error.message);
  }
};

testEmail();
