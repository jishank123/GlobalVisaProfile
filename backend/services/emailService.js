const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates (common with cPanel)
      },
      requireTLS: false,
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,
      socketTimeout: 30000
    });
  }

  async sendEmailVerification(user, verificationToken) {
    // Get decrypted user data
    const userData = user.toAuthJSON ? user.toAuthJSON() : user;
    const userEmail = userData.email;
    const userFirstName = userData.first_name;
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${userEmail}`;
    
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Immigration Services'}" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${userFirstName}!</h2>
          <p>Thank you for registering with us. Please verify your email address to complete your account setup.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Click the button below to verify your email:</strong></p>
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          
          <p><strong>This link will expire in 24 hours.</strong></p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            If you didn't create an account with us, please ignore this email.
          </p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordSetup(user, setupToken) {
    // Get decrypted user data
    const userData = user.toAuthJSON ? user.toAuthJSON() : user;
    const userEmail = userData.email;
    const userFirstName = userData.first_name;
    
    const setupUrl = `${process.env.FRONTEND_URL}/setup-password?token=${setupToken}&email=${userEmail}`;
    
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Immigration Services'}" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Set Up Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${userFirstName}!</h2>
          <p>Your account has been created. Please set up your password to access your dashboard.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Click the button below to set up your password:</strong></p>
            <a href="${setupUrl}" 
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Set Up Password
            </a>
          </div>
          
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${setupUrl}</p>
          
          <p><strong>This link will expire in 24 hours.</strong></p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            If you didn't request this account, please contact our support team.
          </p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordReset(user, resetToken) {
    // Get decrypted user data
    const userData = user.toAuthJSON ? user.toAuthJSON() : user;
    const userEmail = userData.email;
    const userFirstName = userData.first_name;
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${userEmail}`;
    
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Immigration Services'}" <${process.env.SMTP_USER}>`,
      replyTo: process.env.SUPPORT_EMAIL || process.env.SMTP_USER,
      to: userEmail,
      subject: 'Reset Your Password',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${userFirstName},</p>
          <p>You requested to reset your password. Click the button below to create a new password.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          
          <p><strong>This link will expire in 1 hour.</strong></p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            If you didn't request this password reset, please ignore this email.
          </p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(user) {
    // Get decrypted user data
    const userData = user.toAuthJSON ? user.toAuthJSON() : user;
    const userEmail = userData.email;
    const userFirstName = userData.first_name;
    
    const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;
    
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Immigration Services'}" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Welcome to Your Immigration Journey!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${userFirstName}!</h2>
          <p>Your account is now fully set up and ready to use.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>What's Next?</h3>
            <ul>
              <li>Complete your profile information</li>
              <li>Upload your profile picture</li>
              <li>Schedule a consultation</li>
              <li>Track your immigration progress</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            Need help? Contact our support team at ${process.env.SUPPORT_EMAIL || 'support@example.com'}
          </p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();