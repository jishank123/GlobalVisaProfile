const User = require('../models/User');
const Client = require('../models/Client');
const emailService = require('./emailService');
const crypto = require('crypto');

class ClientService {
  /**
   * Create or get existing client from form submission
   * @param {Object} formData - Form submission data
   * @param {string} source - Source of registration (profile_assessment, contact_form, appointment)
   * @returns {Object} - { user, client, isNewUser }
   */
  async createOrGetClient(formData, source = 'form_submission') {
    const { name, email, phone, field_of_expertise, current_location, company } = formData;
    
    console.log(`\n🔄 === CLIENT AUTO-REGISTRATION STARTED ===`);
    console.log(`📧 Email: ${email}`);
    console.log(`📝 Source: ${source}`);
    
    try {
      // Check if user already exists
      let user = await User.findOne({ email: email.toLowerCase() });
      let client = null;
      let isNewUser = false;

      if (user) {
        console.log('✅ Existing user found');
        // Find associated client record
        client = await Client.findOne({ user_id: user._id });
        
        if (!client) {
          console.log('📝 Creating client record for existing user');
          client = await this.createClientRecord(user, formData, source);
        }
      } else {
        console.log('🆕 Creating new user account');
        isNewUser = true;
        
        // Parse name
        const nameParts = name.trim().split(' ');
        const first_name = nameParts[0];
        const last_name = nameParts.slice(1).join(' ') || first_name;
        
        // Generate temporary password
        const tempPassword = crypto.randomBytes(8).toString('hex');
        
        // Create user account
        user = await User.create({
          first_name,
          last_name,
          email: email.toLowerCase(),
          password: tempPassword,
          role: 'client',
          phone: phone || '',
          company: company || '',
          country: current_location || '',
          is_temp_password: true,
          email_verified: false
        });
        
        console.log('✅ User account created');
        
        // Create client record
        client = await this.createClientRecord(user, formData, source);
        
        // Generate email verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();
        
        // Send verification email
        try {
          await emailService.sendPasswordSetup(user, verificationToken);
          console.log('📧 Password setup email sent');
        } catch (emailError) {
          console.error('❌ Failed to send email:', emailError.message);
          // Don't fail the registration if email fails
        }
      }
      
      console.log('✅ Client auto-registration completed');
      return { user, client, isNewUser };
      
    } catch (error) {
      console.error('❌ Client auto-registration failed:', error);
      throw error;
    }
  }

  /**
   * Create client record linked to user
   */
  async createClientRecord(user, formData, source) {
    const { field_of_expertise, current_location, company } = formData;
    
    const clientData = {
      user_id: user._id,
      name: user.full_name,
      email: user.email,
      phone: user.phone,
      university: company || '',
      status: 'active',
      tags: [source, 'auto_registered'],
      notes: `Auto-registered from ${source} on ${new Date().toISOString()}`
    };
    
    // Add field-specific data
    if (field_of_expertise) {
      clientData.tags.push('profile_assessment');
      clientData.notes += `\nField of expertise: ${field_of_expertise}`;
    }
    
    if (current_location) {
      clientData.notes += `\nLocation: ${current_location}`;
    }
    
    const client = await Client.create(clientData);
    console.log('✅ Client record created');
    
    return client;
  }

  /**
   * Verify email and allow password setup
   */
  async verifyEmailAndSetupPassword(email, token, newPassword) {
    console.log(`\n🔐 === EMAIL VERIFICATION & PASSWORD SETUP ===`);
    console.log(`📧 Email: ${email}`);
    
    try {
      const user = await User.findOne({
        email: email.toLowerCase(),
        email_verification_token: token,
        email_verification_expires: { $gt: Date.now() }
      });
      
      if (!user) {
        throw new Error('Invalid or expired verification token');
      }
      
      // Update user
      user.email_verified = true;
      user.is_temp_password = false;
      user.password = newPassword; // Will be hashed by pre-save middleware
      user.email_verification_token = undefined;
      user.email_verification_expires = undefined;
      
      await user.save();
      
      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(user);
        console.log('📧 Welcome email sent');
      } catch (emailError) {
        console.error('❌ Failed to send welcome email:', emailError.message);
      }
      
      console.log('✅ Email verified and password set');
      return user;
      
    } catch (error) {
      console.error('❌ Email verification failed:', error);
      throw error;
    }
  }

  /**
   * Update client profile
   */
  async updateProfile(userId, profileData) {
    console.log(`\n📝 === PROFILE UPDATE ===`);
    console.log(`👤 User ID: ${userId}`);
    
    try {
      const { first_name, last_name, phone, company, country, profile_picture, linkedin_url } = profileData;
      
      // Update user record
      const user = await User.findByIdAndUpdate(
        userId,
        {
          first_name,
          last_name,
          phone,
          company,
          country,
          profile_picture,
          linkedin_url
        },
        { new: true, runValidators: true }
      );
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update client record
      const client = await Client.findOneAndUpdate(
        { user_id: userId },
        {
          name: `${first_name} ${last_name}`,
          phone,
          university: company
        },
        { new: true }
      );
      
      console.log('✅ Profile updated successfully');
      return { user, client };
      
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    console.log(`\n🔐 === PASSWORD CHANGE ===`);
    console.log(`👤 User ID: ${userId}`);
    
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check current password (skip if temp password)
      if (!user.is_temp_password) {
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
          throw new Error('Current password is incorrect');
        }
      }
      
      // Update password
      user.password = newPassword;
      user.is_temp_password = false;
      await user.save();
      
      console.log('✅ Password changed successfully');
      return user;
      
    } catch (error) {
      console.error('❌ Password change failed:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    console.log(`\n🔐 === PASSWORD RESET REQUEST ===`);
    console.log(`📧 Email: ${email}`);
    
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        // Don't reveal if email exists
        return { success: true, message: 'If the email exists, a reset link has been sent' };
      }
      
      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();
      
      // Send reset email
      try {
        await emailService.sendPasswordReset(user, resetToken);
        console.log('📧 Password reset email sent');
      } catch (emailError) {
        console.error('❌ Failed to send reset email:', emailError.message);
        throw new Error('Failed to send reset email');
      }
      
      return { success: true, message: 'Password reset email sent' };
      
    } catch (error) {
      console.error('❌ Password reset request failed:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(email, token, newPassword) {
    console.log(`\n🔐 === PASSWORD RESET ===`);
    console.log(`📧 Email: ${email}`);
    
    try {
      const user = await User.findOne({
        email: email.toLowerCase(),
        password_reset_token: token,
        password_reset_expires: { $gt: Date.now() }
      });
      
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }
      
      // Update password
      user.password = newPassword;
      user.is_temp_password = false;
      user.password_reset_token = undefined;
      user.password_reset_expires = undefined;
      
      await user.save();
      
      console.log('✅ Password reset successfully');
      return user;
      
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      throw error;
    }
  }
}

module.exports = new ClientService();