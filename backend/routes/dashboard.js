const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dashboardController = require('../controllers/dashboardController');

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  console.log('\n🔐 === ADMIN AUTHENTICATION MIDDLEWARE ===');
  console.log('🔐 Request URL:', req.originalUrl);
  
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔐 Token found in Authorization header');
    }

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Access denied. No authentication token provided.'
        }
      });
    }

    // Verify token
    console.log('🔐 Verifying JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Token decoded successfully, user ID:', decoded.id);

    // Find admin user in Users collection
    console.log('🔍 Looking up admin user...');
    const adminUser = await User.findById(decoded.id);
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return res.status(401).json({
        success: false,
        error: {
          code: 'ADMIN_NOT_FOUND',
          message: 'Admin user not found. Please login again.'
        }
      });
    }

    // Check if user is admin
    if (adminUser.role !== 'admin') {
      console.log('❌ User is not admin, role:', adminUser.role);
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Admin access required.'
        }
      });
    }

    console.log('✅ Admin authenticated:', adminUser.email);

    // Add admin to request object
    req.admin = {
      id: adminUser._id,
      email: adminUser.email,
      full_name: adminUser.full_name,
      role: adminUser.role,
      user: adminUser
    };

    console.log('🔐 === ADMIN AUTHENTICATION SUCCESSFUL ===\n');
    next();

  } catch (error) {
    console.error('🔐 Admin authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token.'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Authentication token has expired. Please login again.'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error. Please try again.'
      }
    });
  }
};

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/stats', adminAuth, dashboardController.getDashboardStats);

// @route   GET /api/dashboard/financial
// @desc    Get financial overview data
// @access  Private (Admin only)
router.get('/financial', adminAuth, dashboardController.getFinancialOverview);

// @route   GET /api/dashboard/activity
// @desc    Get recent activity
// @access  Private (Admin only)
router.get('/activity', adminAuth, dashboardController.getRecentActivity);

module.exports = router;