const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const userController = require('../controllers/userController');
const { body } = require('express-validator');

// Validation middleware
const validateUserCreation = [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['admin', 'lead_manager', 'crm_manager', 'client']).withMessage('Invalid role')
];

const validateUserUpdate = [
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().notEmpty().withMessage('Last name cannot be empty')
];

// @route   GET /api/users
// @desc    Get all users with filters
// @access  Private (Admin, Lead Manager)
router.get('/', protect, restrictTo('admin', 'lead_manager'), userController.getUsers);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private (Admin, Lead Manager)
router.get('/stats', protect, restrictTo('admin', 'lead_manager'), userController.getUserStats);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (Admin, Lead Manager, Own Profile)
router.get('/:id', protect, userController.getUser);

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/', protect, restrictTo('admin'), validateUserCreation, userController.createUser);

// @route   PATCH /api/users/:id
// @desc    Update user
// @access  Private (Admin, Own Profile)
router.patch('/:id', protect, validateUserUpdate, userController.updateUser);

// @route   PATCH /api/users/:id/assign-manager
// @desc    Assign manager to user
// @access  Private (Admin, Lead Manager)
router.patch('/:id/assign-manager', protect, restrictTo('admin', 'lead_manager'), userController.assignManager);

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin only)
router.delete('/:id', protect, restrictTo('admin'), userController.deleteUser);

module.exports = router;
