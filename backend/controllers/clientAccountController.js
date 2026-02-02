const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Client = require('../models/Client');

// Helper function to generate JWT token
const generateToken = (userId, role) => {
  console.log('🔑 Generating JWT token for user ID:', userId, 'Role:', role);
  console.log('🔑 JWT_SECRET available:', process.env.JWT_SECRET ? 'YES' : 'NO');
  
  const token = jwt.sign(
    { user_id: userId, role: role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
  
  console.log('🔑 Token generated successfully:', token ? 'YES' : 'NO');
  return token;
};

// Helper function to send response with token
const sendTokenResponse = (user, statusCode, res) => {
  console.log('🎫 === GENERATING TOKEN RESPONSE ===');
  console.log('🎫 User ID:', user._id, 'Role:', user.role);
  console.log('🎫 Status Code:', statusCode);
  
  const token = generateToken(user._id, user.role);
  console.log('🎫 JWT Token generated:', token ? 'YES' : 'NO');
  
  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Determine redirect URL based on role
  let redirectTo = '/client-profile'; // default
  switch (user.role) {
    case 'admin':
      redirectTo = '/admin';
      break;
    case 'lead_manager':
      redirectTo = '/lead-manager';
      break;
    case 'crm_manager':
      redirectTo = '/crm-manager';
      break;
    case 'client':
      redirectTo = '/client-profile';
      break;
    default:
      redirectTo = '/client-profile';
  }

  const responseData = {
    success: true,
    data: {
      token,
      client: {
        _id: user._id,
        email: user.email,
        full_name: user.full_name || `${user.first_name} ${user.last_name}`,
        role: user.role,
        account_status: user.status || 'active'
      },
      redirectTo: redirectTo
    }
  };

  res.status(statusCode)
     .cookie('client_token', token, cookieOptions)
     .json(responseData);
     
  console.log('✅ Token response sent successfully');
  console.log('🎫 === TOKEN RESPONSE COMPLETED ===');
};

// @desc    Register new client account
// @route   POST /api/client-accounts/register
// @access  Public
exports.registerClient = async (req, res) => {
  console.log('\n🔐 === CLIENT REGISTRATION ATTEMPT ===');
  console.log('📝 Request body received:', {
    full_name: req.body.full_name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password ? '[PROVIDED]' : '[MISSING]'
  });
  console.log('🌐 Request IP:', req.ip || req.connection.remoteAddress);
  console.log('🖥️ User Agent:', req.get('User-Agent'));
  
  try {
    // Check for validation errors
    console.log('✅ Checking validation errors...');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check your input data',
          details: errors.array()
        }
      });
    }
    console.log('✅ Validation passed');

    const { full_name, email, phone, password } = req.body;

    // Check if user already exists
    console.log('🔍 Checking if user already exists with email:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', existingUser._id);
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'An account with this email already exists'
        }
      });
    }
    console.log('✅ Email is available');

    // Split full name into first and last name
    const nameParts = full_name.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ') || nameParts[0];

    // Create user account with role 'client'
    console.log('💾 Creating new user account with role client...');
    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
      role: 'client',
      phone,
      status: 'active'
    });
    console.log('✅ User account created successfully:', user._id);

    // Create corresponding client profile
    console.log('💾 Creating client profile...');
    const client = await Client.create({
      name: full_name,
      email: email,
      phone: phone || '',
      status: 'active',
      // We'll assign a CRM manager later or leave it for admin to assign
      crm_manager: null,
      notes: `Client registered on ${new Date().toLocaleDateString()}`
    });
    console.log('✅ Client profile created successfully:', client._id);

    // Send token response
    console.log('🎫 Generating JWT token and sending response...');
    sendTokenResponse(user, 201, res);
    console.log('✅ Registration completed successfully');

  } catch (error) {
    console.error('💥 REGISTRATION ERROR:');
    console.error('💥 Error message:', error.message);
    console.error('💥 Error stack:', error.stack);
    console.error('💥 Full error object:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: 'Error creating account. Please try again.'
      }
    });
  }
  console.log('🔐 === REGISTRATION ATTEMPT COMPLETED ===\n');
};

// @desc    Login client
// @route   POST /api/client-accounts/login
// @access  Public
exports.loginClient = async (req, res) => {
  console.log('\n🔐 === CLIENT LOGIN ATTEMPT ===');
  console.log('📝 Request body received:', {
    email: req.body.email,
    password: req.body.password ? '[PROVIDED]' : '[MISSING]'
  });
  console.log('🌐 Request IP:', req.ip || req.connection.remoteAddress);
  console.log('🖥️ User Agent:', req.get('User-Agent'));
  
  try {
    // Check for validation errors
    console.log('✅ Checking validation errors...');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check your input data',
          details: errors.array()
        }
      });
    }
    console.log('✅ Validation passed');

    const { email, password } = req.body;

    // Find user by email and include password
    console.log('🔍 Searching for user with email:', email);
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ USER NOT FOUND in database for email:', email);
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    console.log('✅ User found in database:', {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status
    });

    // Check if account is active
    if (user.status !== 'active') {
      console.log('❌ Account is not active. Status:', user.status);
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: `Account is ${user.status}. Please contact support.`
        }
      });
    }

    // Check password
    console.log('🔐 Verifying password...');
    const isPasswordCorrect = await user.comparePassword(password);
    console.log('🔐 Password verification result:', isPasswordCorrect);
    
    if (!isPasswordCorrect) {
      console.log('❌ Password is incorrect');
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    console.log('✅ Password is correct');

    // Update last login
    console.log('📊 Updating last login...');
    user.last_login = new Date();
    await user.save();
    console.log('✅ Last login updated');

    // Send token response
    console.log('🎫 Generating JWT token and sending response...');
    sendTokenResponse(user, 200, res);
    console.log('✅ Login completed successfully');

  } catch (error) {
    console.error('💥 LOGIN ERROR:');
    console.error('💥 Error message:', error.message);
    console.error('💥 Error stack:', error.stack);
    console.error('💥 Full error object:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: 'Error logging in. Please try again.'
      }
    });
  }
  console.log('🔐 === LOGIN ATTEMPT COMPLETED ===\n');
};

// @desc    Get client profile
// @route   GET /api/client-accounts/profile
// @access  Private (Client)
exports.getClientProfile = async (req, res) => {
  console.log('\n👤 === GET CLIENT PROFILE ===');
  console.log('👤 User ID from auth middleware:', req.user?.id || req.client?.id);
  
  try {
    // Get user ID from auth middleware (could be req.user or req.client depending on middleware)
    const userId = req.user?.id || req.client?.id;
    
    if (!userId) {
      console.log('❌ No user ID found in request');
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    // Find user account
    console.log('🔍 Finding user account...');
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account not found'
        }
      });
    }

    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Find corresponding client profile if user is a client
    let clientProfile = null;
    if (user.role === 'client') {
      console.log('🔍 Finding client profile...');
      clientProfile = await Client.findOne({ email: user.email }).populate('crm_manager', 'first_name last_name email');
      console.log('👤 Client profile found:', clientProfile ? 'YES' : 'NO');
    }

    const responseData = {
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        country: user.country,
        linkedin_url: user.linkedin_url,
        portfolio_url: user.portfolio_url,
        website_url: user.website_url,
        bio: user.bio,
        profile_picture: user.profile_picture,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        last_login: user.last_login,
        createdAt: user.createdAt
      }
    };

    // Add client profile data if available
    if (clientProfile) {
      responseData.client_profile = {
        _id: clientProfile._id,
        name: clientProfile.name,
        email: clientProfile.email,
        phone: clientProfile.phone,
        university: clientProfile.university,
        status: clientProfile.status,
        crm_manager: clientProfile.crm_manager,
        satisfaction_rating: clientProfile.satisfaction_rating,
        tags: clientProfile.tags,
        notes: clientProfile.notes,
        createdAt: clientProfile.createdAt
      };
    }

    res.status(200).json({
      success: true,
      data: responseData
    });

    console.log('✅ Profile data sent successfully');

  } catch (error) {
    console.error('💥 Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_ERROR',
        message: 'Error retrieving profile. Please try again.'
      }
    });
  }
  console.log('👤 === GET CLIENT PROFILE COMPLETED ===\n');
};

// @desc    Update client profile
// @route   PUT /api/client-accounts/profile
// @access  Private (Client)
exports.updateClientProfile = async (req, res) => {
  console.log('\n✏️ === UPDATE CLIENT PROFILE ===');
  console.log('✏️ User ID from auth middleware:', req.user?.id || req.client?.id);
  console.log('✏️ Update data (body):', req.body);
  console.log('✏️ File uploaded:', req.file ? 'YES' : 'NO');
  if (req.file) {
    console.log('✏️ File details:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  }
  
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check your input data',
          details: errors.array()
        }
      });
    }

    // Get user ID from auth middleware
    const userId = req.user?.id || req.client?.id;
    
    if (!userId) {
      console.log('❌ No user ID found in request');
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    // Define allowed updates for User model
    const allowedUserUpdates = [
      'first_name', 'last_name', 'phone', 'company', 'country', 'university',
      'linkedin_url', 'portfolio_url', 'website_url', 'bio'
    ];
    const userUpdates = {};
    
    // Filter allowed updates for User model
    Object.keys(req.body).forEach(key => {
      if (allowedUserUpdates.includes(key) && req.body[key] !== undefined && req.body[key] !== '') {
        userUpdates[key] = req.body[key];
      }
    });

    // Handle profile picture upload
    if (req.file) {
      userUpdates.profile_picture = `/uploads/profile-pictures/${req.file.filename}`;
      console.log('✏️ Profile picture path set:', userUpdates.profile_picture);
    }

    // Handle full_name update by splitting into first_name and last_name
    if (req.body.full_name) {
      const nameParts = req.body.full_name.trim().split(' ');
      userUpdates.first_name = nameParts[0];
      userUpdates.last_name = nameParts.slice(1).join(' ') || nameParts[0];
    }

    console.log('📝 Filtered updates for User:', userUpdates);

    // Update user account
    const user = await User.findByIdAndUpdate(
      userId,
      userUpdates,
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account not found'
        }
      });
    }

    console.log('✅ User updated successfully');

    // If user is a client, also update the client profile
    let clientProfile = null;
    if (user.role === 'client') {
      console.log('👤 Updating client profile...');
      const clientUpdates = {};
      
      // Map user updates to client profile fields
      if (userUpdates.first_name || userUpdates.last_name) {
        clientUpdates.name = `${user.first_name} ${user.last_name}`;
      }
      if (userUpdates.phone !== undefined) {
        clientUpdates.phone = userUpdates.phone;
      }
      if (userUpdates.university !== undefined) {
        clientUpdates.university = userUpdates.university;
      }

      if (Object.keys(clientUpdates).length > 0) {
        clientProfile = await Client.findOneAndUpdate(
          { email: user.email },
          clientUpdates,
          { new: true, runValidators: true }
        ).populate('crm_manager', 'first_name last_name email');
        console.log('✅ Client profile updated successfully');
      } else {
        // Still fetch the client profile for response
        clientProfile = await Client.findOne({ email: user.email })
          .populate('crm_manager', 'first_name last_name email');
      }
    }

    // Prepare response data
    const responseData = {
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        country: user.country,
        university: user.university,
        linkedin_url: user.linkedin_url,
        portfolio_url: user.portfolio_url,
        website_url: user.website_url,
        bio: user.bio,
        profile_picture: user.profile_picture,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    };

    // Add client profile data if available
    if (clientProfile) {
      responseData.client_profile = {
        _id: clientProfile._id,
        name: clientProfile.name,
        email: clientProfile.email,
        phone: clientProfile.phone,
        university: clientProfile.university,
        status: clientProfile.status,
        crm_manager: clientProfile.crm_manager,
        satisfaction_rating: clientProfile.satisfaction_rating,
        tags: clientProfile.tags,
        notes: clientProfile.notes,
        createdAt: clientProfile.createdAt
      };
    }

    res.status(200).json({
      success: true,
      data: responseData,
      message: 'Profile updated successfully'
    });

    console.log('✅ Profile update completed successfully');

  } catch (error) {
    console.error('💥 Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Error updating profile. Please try again.'
      }
    });
  }
  console.log('✏️ === UPDATE CLIENT PROFILE COMPLETED ===\n');
};

// @desc    Change client password
// @route   PUT /api/client-accounts/change-password
// @access  Private (Client)
exports.changePassword = async (req, res) => {
  console.log('\n🔐 === CHANGE PASSWORD ===');
  console.log('🔐 User ID from auth middleware:', req.user?.id || req.client?.id);
  
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check your input data',
          details: errors.array()
        }
      });
    }

    const { current_password, new_password } = req.body;

    // Get user ID from auth middleware
    const userId = req.user?.id || req.client?.id;
    
    if (!userId) {
      console.log('❌ No user ID found in request');
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    // Get user with password
    console.log('🔍 Finding user with password...');
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account not found'
        }
      });
    }

    // Check current password
    console.log('🔐 Verifying current password...');
    const isCurrentPasswordCorrect = await user.comparePassword(current_password);
    
    if (!isCurrentPasswordCorrect) {
      console.log('❌ Current password is incorrect');
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password is incorrect'
        }
      });
    }

    console.log('✅ Current password verified');

    // Update password
    console.log('🔐 Updating password...');
    user.password = new_password; // Will be hashed by pre-save middleware
    await user.save();

    console.log('✅ Password updated successfully');

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('💥 Change password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PASSWORD_CHANGE_ERROR',
        message: 'Error changing password. Please try again.'
      }
    });
  }
  console.log('🔐 === CHANGE PASSWORD COMPLETED ===\n');
};

// @desc    Forgot password
// @route   POST /api/client-accounts/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  console.log('\n🔐 === FORGOT PASSWORD ===');
  console.log('📝 Request email:', req.body.email);
  
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check your input data',
          details: errors.array()
        }
      });
    }

    const { email } = req.body;

    console.log('🔍 Finding user with email:', email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found, but returning success for security');
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    console.log('✅ User found, generating reset token');

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    user.password_reset_token = hashedToken;
    user.password_reset_expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    console.log('✅ Reset token generated and saved');

    // TODO: Send email with reset token
    // For now, we'll just log it
    console.log('🔑 Password reset token (for development):', resetToken);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

    console.log('✅ Forgot password request processed');

  } catch (error) {
    console.error('💥 Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FORGOT_PASSWORD_ERROR',
        message: 'Error processing request. Please try again.'
      }
    });
  }
  console.log('🔐 === FORGOT PASSWORD COMPLETED ===\n');
};

// @desc    Reset password
// @route   POST /api/client-accounts/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  console.log('\n🔐 === RESET PASSWORD ===');
  console.log('📝 Request token provided:', req.body.token ? 'YES' : 'NO');
  
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check your input data',
          details: errors.array()
        }
      });
    }

    const { token, password } = req.body;

    // Hash token and find user
    console.log('🔍 Hashing token and finding user...');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      password_reset_token: hashedToken,
      password_reset_expires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ Invalid or expired token');
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Password reset token is invalid or has expired'
        }
      });
    }

    console.log('✅ Valid token found, resetting password');

    // Set new password
    user.password = password; // Will be hashed by pre-save middleware
    user.password_reset_token = undefined;
    user.password_reset_expires = undefined;
    
    await user.save();

    console.log('✅ Password reset successfully');

    // Send token response to log user in
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('💥 Reset password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESET_PASSWORD_ERROR',
        message: 'Error resetting password. Please try again.'
      }
    });
  }
  console.log('🔐 === RESET PASSWORD COMPLETED ===\n');
};

// @desc    Verify email
// @route   GET /api/client-accounts/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  console.log('\n📧 === VERIFY EMAIL ===');
  console.log('📧 Token provided:', req.params.token ? 'YES' : 'NO');
  
  try {
    const { token } = req.params;

    console.log('🔍 Finding user with verification token...');
    const user = await User.findOne({
      email_verification_token: token
    });

    if (!user) {
      console.log('❌ Invalid verification token');
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Email verification token is invalid or has expired'
        }
      });
    }

    console.log('✅ Valid token found, verifying email');

    // Verify email
    user.email_verified = true;
    user.email_verification_token = undefined;
    
    await user.save();

    console.log('✅ Email verified successfully');

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('💥 Verify email error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_VERIFICATION_ERROR',
        message: 'Error verifying email. Please try again.'
      }
    });
  }
  console.log('📧 === VERIFY EMAIL COMPLETED ===\n');
};

// @desc    Check if user exists by email
// @route   POST /api/client-accounts/check-user
// @access  Public
exports.checkUserExists = async (req, res) => {
  console.log('\n🔍 === CHECK USER EXISTS ===');
  console.log('📝 Request body:', { email: req.body.email });
  
  try {
    const { email } = req.body;
    
    if (!email) {
      console.log('❌ Email not provided');
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'Email is required'
        }
      });
    }
    
    console.log('🔍 Checking if user exists with email:', email);
    const user = await User.findOne({ email });
    
    const exists = !!user;
    console.log('🔍 User exists:', exists);
    
    if (exists) {
      console.log('✅ User found:', {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status
      });
    } else {
      console.log('❌ User not found');
    }
    
    res.status(200).json({
      success: true,
      data: {
        exists,
        email,
        ...(exists && {
          user: {
            id: user._id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            status: user.status
          }
        })
      }
    });
    
  } catch (error) {
    console.error('💥 CHECK USER ERROR:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CHECK_USER_ERROR',
        message: 'Error checking user existence'
      }
    });
  }
  
  console.log('🔍 === CHECK USER EXISTS COMPLETED ===\n');
};

// @desc    Resend email verification
// @route   POST /api/client-accounts/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  console.log('\n📧 === RESEND VERIFICATION ===');
  console.log('📧 Request email:', req.body.email);
  
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check your input data',
          details: errors.array()
        }
      });
    }

    const { email } = req.body;

    console.log('🔍 Finding user with email:', email);
    const user = await User.findOne({ email });
    
    if (!user || user.email_verified) {
      console.log('❌ User not found or already verified, but returning success for security');
      return res.status(200).json({
        success: true,
        message: 'If an unverified account with that email exists, a verification email has been sent.'
      });
    }

    console.log('✅ User found, generating verification token');

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.email_verification_token = verificationToken;
    
    await user.save();

    console.log('✅ Verification token generated and saved');

    // TODO: Send verification email
    console.log('📧 Email verification token (for development):', verificationToken);

    res.status(200).json({
      success: true,
      message: 'If an unverified account with that email exists, a verification email has been sent.'
    });

    console.log('✅ Verification email resend processed');

  } catch (error) {
    console.error('💥 Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESEND_VERIFICATION_ERROR',
        message: 'Error sending verification email. Please try again.'
      }
    });
  }
  console.log('📧 === RESEND VERIFICATION COMPLETED ===\n');
};

// @desc    Get All Client Accounts (for admin/manager dashboards)
// @route   GET /api/client-accounts/all
// @access  Private (Admin/Manager only)
exports.getAllClientAccounts = async (req, res) => {
  try {
    console.log('👥 === GET ALL CLIENT ACCOUNTS ===');
    console.log('👥 Request from admin/manager dashboard');
    
    // Get all users with role 'client' (excluding sensitive data)
    const clientUsers = await User.find({ role: 'client' })
      .sort({ createdAt: -1 })
      .select('-password -password_reset_token -password_reset_expires -email_verification_token')
      .lean();

    console.log('👥 Found client users:', clientUsers.length);

    // Get corresponding client profiles
    const clientProfiles = await Client.find({})
      .populate('crm_manager', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .lean();

    console.log('👥 Found client profiles:', clientProfiles.length);

    // Merge user data with client profile data
    const mergedClients = clientUsers.map(user => {
      const profile = clientProfiles.find(p => p.email === user.email);
      return {
        // User data
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        last_login: user.last_login,
        createdAt: user.createdAt,
        // Client profile data (if available)
        ...(profile && {
          client_profile: {
            _id: profile._id,
            name: profile.name,
            university: profile.university,
            crm_manager: profile.crm_manager,
            satisfaction_rating: profile.satisfaction_rating,
            tags: profile.tags,
            notes: profile.notes,
            profile_created: profile.createdAt
          }
        })
      };
    });

    // Log access for audit (if ActivityLog is available)
    try {
      const ActivityLog = require('../models/ActivityLog');
      await ActivityLog.create({
        user: req.user ? req.user._id : null,
        action: 'view',
        resourceType: 'ClientAccount',
        description: `All client accounts viewed from admin dashboard`,
        metadata: { 
          total_clients: mergedClients.length,
          request_source: 'admin_dashboard'
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    } catch (logError) {
      console.log('⚠️ Activity log creation failed (non-critical):', logError.message);
    }

    res.json({
      success: true,
      data: mergedClients,
      count: mergedClients.length
    });

    console.log('✅ Client accounts retrieved successfully for admin dashboard');

  } catch (error) {
    console.error('❌ Get All Client Accounts Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to retrieve client accounts'
      }
    });
  }
};