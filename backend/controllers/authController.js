const jwt = require('jsonwebtoken');
const User = require('../models/User');
const clientService = require('../services/clientService');

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
    const { first_name, last_name, email, password, phone, company, country } = req.body;

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

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'Password must be at least 6 characters long'
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
      country: country?.trim()
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

// @desc    Login client user (public login)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
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

    res.json({
      success: true,
      message: 'Client login successful',
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

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_TOO_SHORT',
          message: 'Password must be at least 6 characters long'
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

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_TOO_SHORT',
          message: 'Password must be at least 6 characters long'
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

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_TOO_SHORT',
          message: 'Password must be at least 6 characters long'
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