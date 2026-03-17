const User = require('../models/User');
const Client = require('../models/Client');
const emailService = require('./emailService');
const EncryptionManager = require('../utils/encryptionManager');
const crypto = require('crypto');

class ClientService {
  /**
   * Find user by email, handling both encrypted and plain text emails
   * OPTIMIZED: Uses indexed search first, falls back to encrypted search only if needed
   * @param {string} email - Email to search for
   * @returns {Object|null} - User document or null
   */
  async findUserByEmail(email) {
    const normalizedEmail = email.toLowerCase();
    
    // First try plain text search (faster, uses index)
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return user;
    }
    
    // If not found and encryption is enabled, try encrypted search
    // This is slower but necessary for finding encrypted records
    // OPTIMIZATION: Only do this if we have encrypted data
    if (!global.ENCRYPTION_DISABLED) {
      const encryption = require('../middleware/encryptionMiddleware');
      
      // Get users created recently (likely to be encrypted)
      // Limit search to last 1000 users to avoid performance issues
      const recentUsers = await User.find({})
        .sort({ createdAt: -1 })
        .limit(1000);
      
      for (const u of recentUsers) {
        try {
          const decryptedUser = encryption.decryptDocument(u.toObject());
          if (decryptedUser.email && decryptedUser.email.toLowerCase() === normalizedEmail) {
            return u;
          }
        } catch (decryptError) {
          // Skip users that can't be decrypted
          continue;
        }
      }
    }
    
    return null;
  }

  /**
   * Create or get existing client from form submission
   * @param {Object} formData - Form submission data
   * @param {string} source - Source of registration (profile_assessment, contact_form, appointment)
   * @returns {Object} - { user, client, isNewUser, isNewClient }
   */
  async createOrGetClient(formData, source = 'form_submission') {
    const { name, email, phone, field_of_expertise, current_location, company } = formData;
    
    console.log('👤 === CREATE OR GET CLIENT ===');
    console.log('👤 Source:', source);
    console.log('👤 Email:', email);
    console.log('👤 Name:', name);
    
    try {
      // Normalize email to prevent duplicates
      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if user already exists (handles both encrypted and plain text)
      let user = await this.findUserByEmail(normalizedEmail);
      let client = null;
      let isNewUser = false;
      let isNewClient = false;

      if (user) {
        console.log('👤 Existing user found:', user._id, user.email);
        // Find associated client record by user_id (most reliable)
        client = await Client.findOne({ user_id: user._id });
        
        if (!client) {
          console.log('👤 No client record found for user_id, searching by email...');
          // Fallback: search by email (in case user_id wasn't set)
          const allClients = await Client.find({});
          for (const c of allClients) {
            try {
              const decryptedEmail = c.email.includes(':') 
                ? require('../middleware/encryptionMiddleware').decrypt(c.email)
                : c.email;
              if (decryptedEmail.toLowerCase() === normalizedEmail) {
                client = c;
                // Update client with user_id if missing
                if (!client.user_id) {
                  client.user_id = user._id;
                  await client.save();
                  console.log('✅ Updated client record with user_id:', user._id);
                }
                break;
              }
            } catch (err) {
              continue;
            }
          }
        }
        
        if (!client) {
          console.log('👤 No client record found, creating new client for existing user...');
          client = await this.createClientRecord(user, formData, source);
          isNewClient = true;
          console.log('✅ New client record created:', client._id);
        } else {
          console.log('👤 Existing client record found:', client._id);
        }
      } else {
        console.log('👤 No existing user found, creating new user and client...');
        isNewUser = true;
        isNewClient = true;
        
        // Parse name
        const nameParts = name.trim().split(' ');
        const first_name = nameParts[0];
        const last_name = nameParts.slice(1).join(' ') || first_name;
        
        // Generate temporary password
        const tempPassword = crypto.randomBytes(8).toString('hex');
        
        console.log('👤 Creating user account...');
        // Create user account (without encryption - will be encrypted later by deferred system)
        user = await User.create({
          first_name,
          last_name,
          email: normalizedEmail,
          password: tempPassword,
          role: 'client',
          phone: phone || '',
          company: company || '',
          country: current_location || '',
          is_temp_password: true,
          email_verified: false
        });
        console.log('✅ User created:', user._id, user.email);
        
        console.log('👤 Creating client record...');
        // Create client record (without encryption - will be encrypted later by deferred system)
        client = await this.createClientRecord(user, formData, source);
        console.log('✅ Client created:', client._id);
        
        // Generate email verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();
        console.log('✅ Email verification token generated');
        
        // Send verification email
        try {
          await emailService.sendPasswordSetup(user, verificationToken);
          console.log('✅ Password setup email sent');
        } catch (emailError) {
          console.error('❌ Failed to send email:', emailError.message);
        }
      }
      
      console.log('✅ createOrGetClient completed successfully');
      console.log('👤 Result:', { isNewUser, isNewClient, userId: user._id, clientId: client._id });
      
      return { user, client, isNewUser, isNewClient };
      
    } catch (error) {
      console.error('❌ Client auto-registration failed:', error);
      console.error('❌ Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Create client record linked to user (without encryption - will be encrypted later by deferred system)
   */
  async createClientRecord(user, formData, source) {
    const { field_of_expertise, current_location, company } = formData;
    
    console.log('👤 === CREATE CLIENT RECORD ===');
    console.log('👤 User ID:', user._id);
    console.log('👤 User Email:', user.email);
    console.log('👤 User Name:', user.first_name, user.last_name);
    
    const clientData = {
      user_id: user._id,
      name: `${user.first_name} ${user.last_name}`.trim(),
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
    
    console.log('👤 Client data to create:', {
      user_id: clientData.user_id,
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone
    });
    
    const client = await Client.create(clientData);
    
    console.log('✅ Client record created:', {
      clientId: client._id,
      userId: client.user_id,
      email: client.email,
      name: client.name
    });
    
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
      const { 
        first_name, 
        last_name, 
        phone, 
        company, 
        country, 
        university,
        profile_picture, 
        linkedin_url,
        portfolio_url,
        website_url,
        bio
      } = profileData;
      
      // Validate field lengths BEFORE encryption
      if (first_name && first_name.length > 50) {
        throw new Error('First name cannot exceed 50 characters');
      }
      if (last_name && last_name.length > 50) {
        throw new Error('Last name cannot exceed 50 characters');
      }
      if (bio && bio.length > 1000) {
        throw new Error('Bio cannot exceed 1000 characters');
      }
      
      // Build update object with only provided fields
      const userUpdate = {
        first_name,
        last_name
      };
      
      // Add optional fields if provided
      if (phone !== undefined) userUpdate.phone = phone;
      if (company !== undefined) userUpdate.company = company;
      if (country !== undefined) userUpdate.country = country;
      if (university !== undefined) userUpdate.university = university;
      if (profile_picture !== undefined && profile_picture !== null) userUpdate.profile_picture = profile_picture;
      if (linkedin_url !== undefined) userUpdate.linkedin_url = linkedin_url;
      if (portfolio_url !== undefined) userUpdate.portfolio_url = portfolio_url;
      if (website_url !== undefined) userUpdate.website_url = website_url;
      if (bio !== undefined) userUpdate.bio = bio;
      
      // Update user record - use find and save to ensure pre-save hooks fire
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Decrypt role and status if they were encrypted (fix for legacy data)
      const encryption = require('../middleware/encryptionMiddleware');
      if (user.role && typeof user.role === 'string' && user.role.includes(':')) {
        console.log('🔧 Fixing encrypted role field...');
        user.role = encryption.decrypt(user.role) || 'client';
      }
      if (user.status && typeof user.status === 'string' && user.status.includes(':')) {
        console.log('🔧 Fixing encrypted status field...');
        user.status = encryption.decrypt(user.status) || 'active';
      }
      
      // Update fields
      user.first_name = first_name;
      user.last_name = last_name;
      if (phone !== undefined) user.phone = phone;
      if (company !== undefined) user.company = company;
      if (country !== undefined) user.country = country;
      
      // Handle university field - clear if empty string, otherwise update
      if (university !== undefined) {
        user.university = university.trim() === '' ? '' : university;
      }
      
      if (profile_picture !== undefined && profile_picture !== null) user.profile_picture = profile_picture;
      if (linkedin_url !== undefined) user.linkedin_url = linkedin_url;
      if (portfolio_url !== undefined) user.portfolio_url = portfolio_url;
      if (website_url !== undefined) user.website_url = website_url;
      if (bio !== undefined) user.bio = bio;
      
      // Save with encryption
      await user.save();
      
      // Update client record if it exists
      let client = await Client.findOne({ user_id: userId });
      
      if (client) {
        client.name = `${first_name} ${last_name}`;
        if (phone !== undefined) client.phone = phone;
        if (university !== undefined) client.university = university;
        
        await client.save();
      }
      
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
      // Use findUserByEmail to handle encrypted emails
      const user = await this.findUserByEmail(email);
      
      if (!user) {
        // Don't reveal if email exists
        console.log('⚠️ User not found, but returning success message for security');
        return { success: true, message: 'If the email exists, a reset link has been sent' };
      }
      
      console.log(`✅ User found: ${user.first_name} ${user.last_name}`);
      
      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();
      console.log(`✅ Reset token generated (expires in 1 hour)`);
      
      // Send reset email
      try {
        await emailService.sendPasswordReset(user, resetToken);
        console.log('✅ Password reset email sent successfully');
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
    console.log(`🔑 Token: ${token.substring(0, 20)}...`);
    
    try {
      // First find user by email (handles encryption)
      const userByEmail = await this.findUserByEmail(email);
      
      if (!userByEmail) {
        console.log('❌ User not found');
        throw new Error('Invalid or expired reset token');
      }
      
      // Then verify the token and expiration
      if (userByEmail.password_reset_token !== token) {
        console.log('❌ Token mismatch');
        throw new Error('Invalid or expired reset token');
      }
      
      if (!userByEmail.password_reset_expires || userByEmail.password_reset_expires < Date.now()) {
        console.log('❌ Token expired');
        throw new Error('Invalid or expired reset token');
      }
      
      console.log(`✅ Token valid for user: ${userByEmail.first_name} ${userByEmail.last_name}`);
      
      // Update password
      userByEmail.password = newPassword;
      userByEmail.is_temp_password = false;
      userByEmail.password_reset_token = undefined;
      userByEmail.password_reset_expires = undefined;
      
      await userByEmail.save();
      
      console.log('✅ Password reset successfully');
      return userByEmail;
      
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      throw error;
    }
  }
}

module.exports = new ClientService();