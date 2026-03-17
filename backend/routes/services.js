const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const serviceController = require('../controllers/serviceController');
const { body } = require('express-validator');
const { auth, authenticateClient } = require('../middleware/auth');

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
  body('category').isIn(['EB-1A Eligibility', 'Profile Building', 'EB-2 NIW', 'O-1 Visa', 'Career Coaching', 'Other']).withMessage('Invalid category'),
  body('pricing.minPrice').isNumeric().withMessage('Minimum price must be a number'),
  body('pricing.maxPrice').isNumeric().withMessage('Maximum price must be a number')
];

const validateServiceUpdate = [
  body('name').optional().notEmpty().withMessage('Service name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Service description cannot be empty'),
  body('category').optional().isIn(['EB-1A Eligibility', 'Profile Building', 'EB-2 NIW', 'O-1 Visa', 'Career Coaching', 'Other']).withMessage('Invalid category')
];

// @route   GET /api/services
// @desc    Get all services with filters
// @access  Private (Admin, Lead Manager, CRM Manager)
router.get('/', auth(['admin', 'lead_manager', 'crm_manager']), serviceController.getServices);

// @route   GET /api/services/public
// @desc    Get all active services for clients
// @access  Private (Client)
router.get('/public', authenticateClient, async (req, res) => {
  try {
    console.log('🔍 Client requesting public services...');
    
    // Get active services from database
    const Service = require('../models/Service');
    
    // Get active, non-deleted services with robust query that handles edge cases
    const services = await Service.find({ 
      $and: [
        // Not deleted: false, null, undefined, or missing field
        { $or: [
          { isDeleted: false },
          { isDeleted: { $exists: false } },
          { isDeleted: null }
        ]},
        // Active: true, null, undefined, or missing field (default should be active)
        { $or: [
          { isActive: true },
          { isActive: { $exists: false } },
          { isActive: null }
        ]}
      ]
    }).sort({ createdAt: -1 });
    
    console.log('✅ Returning public services:', services.length);
    
    res.json({
      success: true,
      count: services.length,
      data: services
    });
    
  } catch (error) {
    console.error('❌ Error fetching public services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
});

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

// @route   PATCH /api/services/:id/restore
// @desc    Restore deleted service
// @access  Private (Admin only)
router.patch('/:id/restore', adminAuth, serviceController.restoreService);

// @route   DELETE /api/services/:id
// @desc    Delete service (soft delete)
// @access  Private (Admin only)
router.delete('/:id', adminAuth, serviceController.deleteService);

// @route   DELETE /api/services/:id/permanent
// @desc    Permanently delete service (hard delete)
// @access  Private (Admin only)
router.delete('/:id/permanent', adminAuth, serviceController.permanentDeleteService);

module.exports = router;
