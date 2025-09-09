const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Hostinger SMTP Configuration
      this.transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: false // For development, remove in production if you have proper SSL
        }
      });

      // Verify connection configuration
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully with Hostinger SMTP');
      console.log('🔗 Reset URL format:', `${process.env.API_BASE_URL || 'https://api.opptym.com'}/api/auth/verify-reset-token/{token}`);
      console.log('🔗 Verification URL format:', `${process.env.API_BASE_URL || 'https://api.opptym.com'}/api/auth/verify-email/{token}`);
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
      throw new Error('Email service configuration failed');
    }
  }

  // Method to refresh configuration (useful for debugging)
  async refreshConfiguration() {
    console.log('🔄 Refreshing email service configuration...');
    await this.initializeTransporter();
  }

  async sendEmail({ to, subject, html, text, attachments = [] }) {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Opptym',
          address: process.env.EMAIL_USER
        },
        to,
        subject,
        html,
        text,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent successfully to ${to}:`, result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(userEmail, userName, verificationToken) {
    const verificationUrl = `${process.env.API_BASE_URL || 'https://api.opptym.com'}/api/auth/verify-email/${verificationToken}`;
    
    const subject = 'Verify Your Email - Opptym';
    const html = await this.getEmailTemplate('verification', {
      userName,
      verificationUrl,
      userEmail
    });
    const text = `Hello ${userName},\n\nPlease verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account with Opptym, please ignore this email.\n\nBest regards,\nThe Opptym Team`;

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
      text
    });
  }

  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    const resetUrl = `${process.env.API_BASE_URL || 'https://api.opptym.com'}/api/auth/verify-reset-token/${resetToken}`;
    
    const subject = 'Reset Your Password - Opptym';
    const html = await this.getEmailTemplate('password-reset', {
      userName,
      resetUrl,
      userEmail
    });
    const text = `Hello ${userName},\n\nYou requested to reset your password. Click the link below to reset it:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this password reset, please ignore this email.\n\nBest regards,\nThe Opptym Team`;

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
      text
    });
  }

  async sendWelcomeEmail(userEmail, userName) {
    const subject = 'Welcome to Opptym! 🎉';
    const html = await this.getEmailTemplate('welcome', {
      userName,
      userEmail
    });
    const text = `Hello ${userName},\n\nWelcome to Opptym! Your email has been verified and your account is now active.\n\nYou can now access all our SEO tools and features.\n\nBest regards,\nThe Opptym Team`;

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
      text
    });
  }

  async getEmailTemplate(templateName, variables = {}) {
    try {
      const templatePath = path.join(__dirname, '../templates/email', `${templateName}.html`);
      let template = await fs.readFile(templatePath, 'utf8');
      
      // Replace variables in template
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, variables[key] || '');
      });
      
      return template;
    } catch (error) {
      console.error(`❌ Failed to load email template ${templateName}:`, error);
      // Return a simple fallback template
      return this.getFallbackTemplate(templateName, variables);
    }
  }

  getFallbackTemplate(templateName, variables = {}) {
    const { userName = 'User', verificationUrl = '', resetUrl = '' } = variables;
    
    switch (templateName) {
      case 'verification':
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Verify Your Email Address</h2>
            <p>Hello ${userName},</p>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with Opptym, please ignore this email.</p>
            <p>Best regards,<br>The Opptym Team</p>
          </div>
        `;
      
      case 'password-reset':
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Reset Your Password</h2>
            <p>Hello ${userName},</p>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>The Opptym Team</p>
          </div>
        `;
      
      case 'welcome':
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #16a34a;">Welcome to Opptym! 🎉</h2>
            <p>Hello ${userName},</p>
            <p>Welcome to Opptym! Your email has been verified and your account is now active.</p>
            <p>You can now access all our SEO tools and features.</p>
            <p>Best regards,<br>The Opptym Team</p>
          </div>
        `;
      
      default:
        return `<p>Hello ${userName},</p><p>Thank you for using Opptym!</p>`;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
