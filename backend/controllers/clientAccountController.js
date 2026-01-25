const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ClientAccount = require('../models/ClientAccount');

// Helper function to generate JWT token
const generateToken = (id) => {
  console.log('🔑 Generating JWT token for client ID:', id);
  console.log('🔑 JWT_SECRET available:', process.env.JWT_SECRET ? 'YES' : 'NO');
  console.log('🔑 JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || '24h');
  
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
  
  console.log('🔑 Token generated successfully:', token ? 'YES' : 'NO');
  return token;
};

// Helper function to send response with token
const sendTokenResponse = (clientAccount, statusCode, res) => {
  console.log('🎫 === GENERATING TOKEN RESPONSE ===');
  console.log('🎫 Client ID:', clientAccount._id);
  console.log('🎫 Status Code:', statusCode);
  
  const token = generateToken(clientAccount._id);
  console.log('🎫 JWT Token generated:', token ? 'YES' : 'NO');
  
  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  console.log('🍪 Cookie options:', cookieOptions);

  const responseData = {
    success: true,
    data: {
      token,
      client: clientAccount
    }
  };
  console.log('📤 Response data prepared:', {
    success: responseData.success,
    token: responseData.data.token ? 'PRESENT' : 'MISSING',
    client: {
      id: responseData.data.client._id,
      email: responseData.data.client.email,
      full_name: responseData.data.client.full_name
    }
  });

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

    // Check if client already exists
    console.log('🔍 Checking if client already exists with email:', email);
    const existingClient = await ClientAccount.findOne({ email });
    if (existingClient) {
      console.log('❌ Client already exists:', existingClient._id);
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'An account with this email already exists'
        }
      });
    }
    console.log('✅ Email is available');

    // Get client IP and user agent
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');
    console.log('📊 Client metadata:', { ip_address, user_agent });

    // Create client account
    console.log('💾 Creating new client account...');
    const clientAccount = await ClientAccount.create({
      full_name,
      email,
      phone,
      password_hash: password, // Will be hashed by pre-save middleware
      ip_address,
      user_agent,
      source: 'website'
    });
    console.log('✅ Client account created successfully:', clientAccount._id);

    // Generate email verification token (if email verification is enabled)
    // For now, we'll set email as verified
    console.log('📧 Setting email as verified...');
    clientAccount.email_verified = true;
    await clientAccount.save();
    console.log('✅ Email verification status updated');

    // Send token response
    console.log('🎫 Generating JWT token and sending response...');
    sendTokenResponse(clientAccount, 201, res);
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

    // 🔑 CHECK FOR USER LOGIN IN USERS COLLECTION (ALL ROLES)
    console.log('🔑 === CHECKING USER LOGIN IN USERS COLLECTION ===');
    console.log('🔑 Checking user credentials for all roles...');
    
    try {
      const User = require('../models/User');
      const user = await User.findOne({ email }).select('+password');
      
      if (user) {
        console.log('🔑 User found in database:', user._id, 'Role:', user.role);
        
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        console.log('🔑 Password verification result:', isPasswordValid);
        
        if (isPasswordValid) {
          console.log('✅ User login successful, generating token...');
          
          const userToken = generateToken(user._id);
          
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

          console.log(`✅ ${user.role} login successful, redirecting to: ${redirectTo}`);
          
          return res.status(200)
            .cookie('client_token', userToken, cookieOptions)
            .json({
              success: true,
              isAdmin: user.role === 'admin',
              data: {
                token: userToken,
                client: {
                  _id: user._id,
                  email: user.email,
                  full_name: user.full_name || `${user.first_name} ${user.last_name}`,
                  role: user.role,
                  account_status: 'active'
                },
                redirectTo: redirectTo
              }
            });
        } else {
          console.log('❌ User password incorrect');
        }
      } else {
        console.log('❌ User not found in Users collection');
      }
    } catch (error) {
      console.error('💥 Error checking user login:', error);
    }
    
    // If user login failed, continue to regular client login check
    console.log('🔑 User login failed, checking as regular client account...');

    // Find client by email and include password
    console.log('🔍 Searching for client with email:', email);
    const clientAccount = await ClientAccount.findOne({ email }).select('+password_hash');
    
    if (!clientAccount) {
      console.log('❌ CLIENT NOT FOUND in database for email:', email);
      console.log('💡 This means the user needs to register first');
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    console.log('✅ Client found in database:', {
      id: clientAccount._id,
      email: clientAccount.email,
      full_name: clientAccount.full_name,
      account_status: clientAccount.account_status,
      email_verified: clientAccount.email_verified,
      failed_login_attempts: clientAccount.failed_login_attempts,
      is_locked: clientAccount.is_locked
    });

    // Check if account is locked
    if (clientAccount.is_locked) {
      console.log('❌ Account is locked until:', clientAccount.account_locked_until);
      return res.status(423).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: 'Account is temporarily locked due to too many failed login attempts'
        }
      });
    }

    // Check if account is active
    if (clientAccount.account_status !== 'active') {
      console.log('❌ Account is not active. Status:', clientAccount.account_status);
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: `Account is ${clientAccount.account_status}. Please contact support.`
        }
      });
    }

    // Check password
    console.log('🔐 Verifying password...');
    const isPasswordCorrect = await clientAccount.correctPassword(password);
    console.log('🔐 Password verification result:', isPasswordCorrect);
    
    if (!isPasswordCorrect) {
      console.log('❌ Password is incorrect');
      // Handle failed login
      console.log('📊 Updating failed login attempts...');
      await clientAccount.handleFailedLogin();
      
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    console.log('✅ Password is correct');

    // Update login info
    console.log('📊 Updating login information...');
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');
    await clientAccount.updateLoginInfo(ip_address, user_agent);
    console.log('✅ Login info updated');

    // Send token response
    console.log('🎫 Generating JWT token and sending response...');
    sendTokenResponse(clientAccount, 200, res);
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
  try {
    // Client ID should be available from auth middleware
    const clientAccount = await ClientAccount.findById(req.client.id);
    
    if (!clientAccount) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client account not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        client: clientAccount
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_ERROR',
        message: 'Error retrieving profile. Please try again.'
      }
    });
  }
};

// @desc    Update client profile
// @route   PUT /api/client-accounts/profile
// @access  Private (Client)
exports.updateClientProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check your input data',
          details: errors.array()
        }
      });
    }

    const allowedUpdates = ['full_name', 'phone', 'communication_preferences'];
    const updates = {};
    
    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const clientAccount = await ClientAccount.findByIdAndUpdate(
      req.client.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!clientAccount) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client account not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        client: clientAccount
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Error updating profile. Please try again.'
      }
    });
  }
};

// @desc    Change client password
// @route   PUT /api/client-accounts/change-password
// @access  Private (Client)
exports.changePassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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

    // Get client with password
    const clientAccount = await ClientAccount.findById(req.client.id).select('+password_hash');
    
    if (!clientAccount) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client account not found'
        }
      });
    }

    // Check current password
    const isCurrentPasswordCorrect = await clientAccount.correctPassword(current_password);
    
    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password is incorrect'
        }
      });
    }

    // Update password
    clientAccount.password_hash = new_password; // Will be hashed by pre-save middleware
    await clientAccount.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PASSWORD_CHANGE_ERROR',
        message: 'Error changing password. Please try again.'
      }
    });
  }
};

// @desc    Forgot password
// @route   POST /api/client-accounts/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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

    const clientAccount = await ClientAccount.findOne({ email });
    
    if (!clientAccount) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = clientAccount.createPasswordResetToken();
    await clientAccount.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    // For now, we'll just return success
    console.log('Password reset token:', resetToken);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FORGOT_PASSWORD_ERROR',
        message: 'Error processing request. Please try again.'
      }
    });
  }
};

// @desc    Reset password
// @route   POST /api/client-accounts/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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

    // Hash token and find client
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const clientAccount = await ClientAccount.findOne({
      password_reset_token: hashedToken,
      password_reset_expires: { $gt: Date.now() }
    });

    if (!clientAccount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Password reset token is invalid or has expired'
        }
      });
    }

    // Set new password
    clientAccount.password_hash = password; // Will be hashed by pre-save middleware
    clientAccount.password_reset_token = undefined;
    clientAccount.password_reset_expires = undefined;
    clientAccount.failed_login_attempts = 0;
    clientAccount.account_locked_until = undefined;
    
    await clientAccount.save();

    // Send token response
    sendTokenResponse(clientAccount, 200, res);

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESET_PASSWORD_ERROR',
        message: 'Error resetting password. Please try again.'
      }
    });
  }
};

// @desc    Verify email
// @route   GET /api/client-accounts/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const clientAccount = await ClientAccount.findOne({
      email_verification_token: token,
      email_verification_expires: { $gt: Date.now() }
    });

    if (!clientAccount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Email verification token is invalid or has expired'
        }
      });
    }

    // Verify email
    clientAccount.email_verified = true;
    clientAccount.email_verification_token = undefined;
    clientAccount.email_verification_expires = undefined;
    
    await clientAccount.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_VERIFICATION_ERROR',
        message: 'Error verifying email. Please try again.'
      }
    });
  }
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
    const user = await ClientAccount.findOne({ email });
    
    const exists = !!user;
    console.log('🔍 User exists:', exists);
    
    if (exists) {
      console.log('✅ User found:', {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        account_status: user.account_status
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
            account_status: user.account_status
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
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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

    const clientAccount = await ClientAccount.findOne({ email });
    
    if (!clientAccount || clientAccount.email_verified) {
      return res.status(200).json({
        success: true,
        message: 'If an unverified account with that email exists, a verification email has been sent.'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    clientAccount.email_verification_token = verificationToken;
    clientAccount.email_verification_expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    await clientAccount.save();

    // TODO: Send verification email
    console.log('Email verification token:', verificationToken);

    res.status(200).json({
      success: true,
      message: 'If an unverified account with that email exists, a verification email has been sent.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESEND_VERIFICATION_ERROR',
        message: 'Error sending verification email. Please try again.'
      }
    });
  }
};

// @desc    Get All Client Accounts (for admin/manager dashboards)
// @route   GET /api/client-accounts/all
// @access  Private (Admin/Manager only)
exports.getAllClientAccounts = async (req, res) => {
  try {
    console.log('👥 === GET ALL CLIENT ACCOUNTS ===');
    console.log('👥 Request from admin/manager dashboard');
    
    // Get all client accounts (excluding sensitive data)
    const clients = await ClientAccount.find({})
      .sort({ createdAt: -1 })
      .select('-password -reset_password_token -reset_password_expires -email_verification_token -email_verification_expires')
      .lean();

    console.log('👥 Found client accounts:', clients.length);

    // Log access for audit (if ActivityLog is available)
    try {
      const ActivityLog = require('../models/ActivityLog');
      await ActivityLog.create({
        user: req.user ? req.user._id : null,
        action: 'view',
        resourceType: 'ClientAccount',
        description: `All client accounts viewed from admin dashboard`,
        metadata: { 
          total_clients: clients.length,
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
      data: clients,
      count: clients.length
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