const jwt = require('jsonwebtoken');
const User = require('../models/User');
const clientService = require('../services/clientService');

// Password validation function according to documentation
const validatePassword = (password, email, firstName, lastName) => {
  // Minimum 8 characters
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  // At least 1 uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 uppercase letter' };
  }

  // At least 1 lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 lowercase letter' };
  }

  // At least 1 number
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 number' };
  }

  // At least 1 special character (@#$%!)
  if (!/[@#$%!]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 special character (@#$%!)' };
  }

  // No spaces
  if (/\s/.test(password)) {
    return { isValid: false, message: 'Password cannot contain spaces' };
  }

  // Cannot contain email or username
  const lowerPassword = password.toLowerCase();
  const lowerEmail = email.toLowerCase();
  const lowerFirstName = firstName ? firstName.toLowerCase() : '';
  const lowerLastName = lastName ? lastName.toLowerCase() : '';

  if (lowerPassword.includes(lowerEmail.split('@')[0]) || 
      (lowerFirstName && lowerPassword.includes(lowerFirstName)) ||
      (lowerLastName && lowerPassword.includes(lowerLastName))) {
    return { isValid: false, message: 'Password cannot contain your email or name' };
  }

  return { isValid: true, message: 'Password is valid' };
};

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { user_id: userId, role: role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// @desc    Register new client user (public registration)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone, company, country, terms_accepted } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'First name, last name, email, and password are required'
        }
      });
    }

    // Validate terms acceptance
    if (!terms_accepted) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TERMS_NOT_ACCEPTED',
          message: 'You must accept the terms and conditions to register'
        }
      });
    }

    // Validate names - no numerics allowed
    if (/\d/.test(first_name)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_NAME',
          message: 'First name cannot contain numbers'
        }
      });
    }

    if (/\d/.test(last_name)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_NAME',
          message: 'Last name cannot contain numbers'
        }
      });
    }

    // Validate organization/company - no numerics allowed
    if (company && /\d/.test(company)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_COMPANY',
          message: 'Company/Organization name cannot contain numbers'
        }
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address'
        }
      });
    }

    // Validate password strength - must meet documentation requirements
    const passwordValidation = validatePassword(password, email, first_name, last_name);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: passwordValidation.message
        }
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }

    // Create client user only (no role parameter accepted)
    const user = await User.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'client', // Force client role for public registration
      phone: phone?.trim(),
      company: company?.trim(),
      country: country?.trim(),
      terms_accepted: true,
      terms_accepted_at: new Date()
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Client account registered successfully',
      data: user.toAuthJSON(),
      token,
      expires_in: 86400
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Login client user (public login) - Step 2: Password entry/setup
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, isPasswordSetup } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Please provide email and password'
        }
      });
    }

    // Validate email format
    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address'
        }
      });
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email address'
        }
      });
    }

    // Only allow client login through this endpoint
    if (user.role !== 'client') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'This login is for clients only. Managers should use the manager login.'
        }
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Your account is inactive. Please contact support.'
        }
      });
    }

    // Check if user needs to set password
    if (user.is_temp_password || !user.password) {
      if (!isPasswordSetup) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PASSWORD_SETUP_REQUIRED',
            message: 'Password setup is required for this account'
          }
        });
      }

      // Validate password strength for new password
      const passwordValidation = validatePassword(password, email, user.first_name, user.last_name);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: passwordValidation.message
          }
        });
      }

      // Set the new password
      user.password = password;
      user.is_temp_password = false;
      user.email_verified = true;
      user.last_login = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id, user.role);

      return res.json({
        success: true,
        message: 'Password set successfully and logged in',
        isNewPassword: true,
        data: {
          ...user.toAuthJSON(),
          redirectTo: '/dashboard/client'
        },
        token,
        expires_in: 86400
      });
    }

    // User has existing password - validate it
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        ...user.toAuthJSON(),
        redirectTo: '/dashboard/client'
      },
      token,
      expires_in: 86400
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Login manager user (admin/CRM/lead managers)
// @route   POST /api/auth/manager
// @access  Public (but restricted to manager roles)
exports.managerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Please provide email and password'
        }
      });
    }

    // Validate email format
    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address'
        }
      });
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Only allow manager roles through this endpoint
    const managerRoles = ['admin', 'lead_manager', 'crm_manager'];
    if (!managerRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'This login is for managers only. Clients should use the regular login.'
        }
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Your account is inactive. Please contact support.'
        }
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Determine redirect URL based on role
    let redirectTo = '/dashboard/admin'; // default
    switch (user.role) {
      case 'admin':
        redirectTo = '/dashboard/admin';
        break;
      case 'lead_manager':
        redirectTo = '/dashboard/lead-manager';
        break;
      case 'crm_manager':
        redirectTo = '/dashboard/crm-manager';
        break;
      default:
        redirectTo = '/dashboard/admin';
    }

    res.json({
      success: true,
      message: `${user.role.replace('_', ' ')} login successful`,
      data: {
        ...user.toAuthJSON(),
        redirectTo: redirectTo
      },
      token,
      expires_in: 86400
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'MANAGER_LOGIN_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    // Find user with password
    const user = await User.findById(req.user.user_id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(current_password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password is incorrect'
        }
      });
    }

    // Update password
    user.password = new_password;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'PASSWORD_CHANGE_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Verify email and setup password
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmailAndSetupPassword = async (req, res) => {
  try {
    const { email, token, password, confirm_password } = req.body;

    // Validate input
    if (!email || !token || !password || !confirm_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'All fields are required'
        }
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_MISMATCH',
          message: 'Passwords do not match'
        }
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password, email, '', '');
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: passwordValidation.message
        }
      });
    }

    // Verify email and setup password
    const user = await clientService.verifyEmailAndSetupPassword(email, token, password);

    // Generate token for immediate login
    const authToken = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Email verified and password set successfully',
      data: user.toAuthJSON(),
      token: authToken,
      expires_in: 86400
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VERIFICATION_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'Email is required'
        }
      });
    }

    const result = await clientService.requestPasswordReset(email);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'RESET_REQUEST_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, password, confirm_password } = req.body;

    // Validate input
    if (!email || !token || !password || !confirm_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'All fields are required'
        }
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_MISMATCH',
          message: 'Passwords do not match'
        }
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password, email, '', '');
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: passwordValidation.message
        }
      });
    }

    // Reset password
    const user = await clientService.resetPassword(email, token, password);

    // Generate token for immediate login
    const authToken = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: user.toAuthJSON(),
      token: authToken,
      expires_in: 86400
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'RESET_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone, company, country, profile_picture, linkedin_url } = req.body;

    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'First name and last name are required'
        }
      });
    }

    // Update profile
    const { user, client } = await clientService.updateProfile(req.user.user_id, {
      first_name,
      last_name,
      phone,
      company,
      country,
      profile_picture,
      linkedin_url
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toAuthJSON(),
        client
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_UPDATE_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Check if user exists and has password
// @route   POST /api/auth/check-user
// @access  Public
exports.checkUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'Email is required'
        }
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address'
        }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.json({
        success: true,
        exists: false,
        hasPassword: false,
        needsPasswordSetup: false,
        role: null
      });
    }

    // Check if user has a real password (not temporary)
    const hasRealPassword = user.password && !user.is_temp_password;
    
    res.json({
      success: true,
      exists: true,
      hasPassword: hasRealPassword,
      needsPasswordSetup: user.is_temp_password || !user.password,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CHECK_USER_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Setup password for new or existing user without password
// @route   POST /api/auth/setup-password
// @access  Public
exports.setupPassword = async (req, res) => {
  try {
    const { email, password, isNewUser } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email and password are required'
        }
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address'
        }
      });
    }

    let user;

    if (isNewUser) {
      // Create new user
      // Extract first and last name from email if not provided
      const emailUsername = email.split('@')[0];
      const nameParts = emailUsername.split(/[._-]/);
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts[1] || '';

      // Validate password strength
      const passwordValidation = validatePassword(password, email, firstName, lastName);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: passwordValidation.message
          }
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists'
          }
        });
      }

      // Create new user
      user = await User.create({
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase().trim(),
        password,
        role: 'client',
        is_temp_password: false,
        status: 'active'
      });
    } else {
      // Update existing user's password
      user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Validate password strength
      const passwordValidation = validatePassword(password, email, user.first_name, user.last_name);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: passwordValidation.message
          }
        });
      }

      // Update password
      user.password = password;
      user.is_temp_password = false;
      await user.save();
    }

    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Password set successfully',
      data: {
        user: user.toAuthJSON(),
        isNewUser
      }
    });
  } catch (error) {
    console.error('Setup password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SETUP_PASSWORD_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Email-only login/account creation for form submissions
// @route   POST /api/auth/email-login
// @access  Public
exports.emailLogin = async (req, res) => {
  try {
    const { email, formData, source } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'Email is required'
        }
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address'
        }
      });
    }

    // Use clientService to create or get existing client
    const result = await clientService.createOrGetClient(formData, source);
    const { user, client, isNewUser } = result;

    // Generate token for immediate login
    const token = generateToken(user._id, user.role);

    // Update last login
    user.last_login = new Date();
    await user.save();

    res.json({
      success: true,
      message: isNewUser ? 'Account created and logged in successfully' : 'Logged in successfully',
      data: {
        user: user.toAuthJSON(),
        client,
        isNewUser,
        needsPasswordSetup: user.is_temp_password,
        redirectTo: '/dashboard/client'
      },
      token,
      expires_in: 86400
    });
  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_LOGIN_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Change password (enhanced version)
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePasswordEnhanced = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    // Validate input
    if (!new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'New password and confirmation are required'
        }
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_MISMATCH',
          message: 'New passwords do not match'
        }
      });
    }

    // Validate password strength - get user email for validation
    const user = await User.findById(req.user.user_id);
    const passwordValidation = validatePassword(new_password, user.email, user.first_name, user.last_name);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: passwordValidation.message
        }
      });
    }

    // Change password
    await clientService.changePassword(req.user.user_id, current_password, new_password);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'PASSWORD_CHANGE_FAILED',
        message: error.message
      }
    });
  }
};