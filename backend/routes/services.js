const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const serviceController = require('../controllers/serviceController');
const { body } = require('express-validator');

// Admin authentication middleware (same as other admin routes)
const adminAuth = async (req, res, next) => {
  console.log('\n🔐 === ADMIN AUTH FOR SERVICE MANAGEMENT ===');
  
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
    const adminUser = await User.findById(decoded.id);
    
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

    console.log('✅ Admin authenticated for service management');
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
const validateServiceCreation = [
  body('name').notEmpty().withMessage('Service name is required'),
  body('description').notEmpty().withMessage('Service description is required'),
  body('category').isIn(['Research', 'Writing', 'Editing', 'Consulting', 'Other']).withMessage('Invalid category'),
  body('pricing.minPrice').isNumeric().withMessage('Minimum price must be a number'),
  body('pricing.maxPrice').isNumeric().withMessage('Maximum price must be a number')
];

const validateServiceUpdate = [
  body('name').optional().notEmpty().withMessage('Service name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Service description cannot be empty'),
  body('category').optional().isIn(['Research', 'Writing', 'Editing', 'Consulting', 'Other']).withMessage('Invalid category')
];

// @route   GET /api/services
// @desc    Get all services with filters
// @access  Private (Admin only)
router.get('/', adminAuth, serviceController.getServices);

// @route   GET /api/services/stats
// @desc    Get service statistics
// @access  Private (Admin only)
router.get('/stats', adminAuth, serviceController.getServiceStats);

// @route   GET /api/services/:id
// @desc    Get single service
// @access  Private (Admin only)
router.get('/:id', adminAuth, serviceController.getService);

// @route   POST /api/services
// @desc    Create new service
// @access  Private (Admin only)
router.post('/', adminAuth, validateServiceCreation, serviceController.createService);

// @route   PATCH /api/services/:id
// @desc    Update service
// @access  Private (Admin only)
router.patch('/:id', adminAuth, validateServiceUpdate, serviceController.updateService);

// @route   PATCH /api/services/:id/toggle-status
// @desc    Toggle service status (activate/deactivate)
// @access  Private (Admin only)
router.patch('/:id/toggle-status', adminAuth, serviceController.toggleServiceStatus);

// @route   DELETE /api/services/:id
// @desc    Delete service (soft delete)
// @access  Private (Admin only)
router.delete('/:id', adminAuth, serviceController.deleteService);

module.exports = router;
