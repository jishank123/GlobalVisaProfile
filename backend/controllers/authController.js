const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { user_id: userId, role: role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role, phone, company, country } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }

    // Create user
    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
      role: role || 'client',
      phone,
      company,
      country
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
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

// @desc    Login user
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

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
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

    res.json({
      success: true,
      message: 'Login successful',
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
        code: 'LOGIN_FAILED',
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
