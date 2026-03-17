const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const userController = require('../controllers/userController');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');

// Admin authentication middleware (same as dashboard)
const adminAuth = async (req, res, next) => {
  console.log('\n🔐 === ADMIN AUTH FOR USER MANAGEMENT ===');
  
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Access denied. No authentication token provided.'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminUser = await User.findById(decoded.user_id);
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ADMIN_ACCESS_REQUIRED',
          message: 'Admin access required.'
        }
      });
    }

    req.user = {
      user_id: adminUser._id,
      _id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role,
      account: adminUser
    };

    console.log('✅ Admin authenticated for user management');
    next();

  } catch (error) {
    console.error('🔐 Admin auth error:', error);
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token.'
      }
    });
  }
};

// Validation middleware
const validateUserCreation = [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['admin', 'lead_manager', 'crm_manager', 'project_manager', 'employee', 'client']).withMessage('Invalid role')
];

const validateUserUpdate = [
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().notEmpty().withMessage('Last name cannot be empty')
];

// @route   GET /api/users
// @desc    Get all users with filters
// @access  Private (Admin, Lead Manager, CRM Manager, Project Manager)
router.get('/', auth(['admin', 'lead_manager', 'crm_manager', 'project_manager']), userController.getUsers);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private (Admin only)
router.get('/stats', adminAuth, userController.getUserStats);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (Admin only)
router.get('/:id', adminAuth, userController.getUser);

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/', adminAuth, validateUserCreation, userController.createUser);

// @route   PATCH /api/users/:id
// @desc    Update user (assign role)
// @access  Private (Admin only)
router.patch('/:id', adminAuth, validateUserUpdate, userController.updateUser);

// @route   PATCH /api/users/:id/assign-manager
// @desc    Assign manager to user
// @access  Private (Admin only)
router.patch('/:id/assign-manager', adminAuth, userController.assignManager);

// @route   PATCH /api/users/:id/restore
// @desc    Restore deleted user
// @access  Private (Admin only)
router.patch('/:id/restore', adminAuth, userController.restoreUser);

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin only)
router.delete('/:id', adminAuth, userController.deleteUser);

// @route   DELETE /api/users/:id/permanent
// @desc    Permanently delete user (hard delete)
// @access  Private (Admin only)
router.delete('/:id/permanent', adminAuth, userController.permanentDeleteUser);

module.exports = router;
