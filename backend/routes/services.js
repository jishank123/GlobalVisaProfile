const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const serviceController = require('../controllers/serviceController');
const { body } = require('express-validator');
const { authenticateClient } = require('../middleware/auth');

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

// @route   GET /api/services/public
// @desc    Get all active services for clients
// @access  Private (Client)
router.get('/public', authenticateClient, async (req, res) => {
  try {
    console.log('🔍 Client requesting public services...');
    
    // For demo purposes, return hardcoded services
    // In production, this would query the Service model for active services
    const services = [
      {
        id: 'eb1a-consultation',
        name: 'EB-1A Consultation',
        description: 'Comprehensive consultation for EB-1A extraordinary ability visa application',
        price: 500,
        category: 'Consulting',
        features: [
          'Initial eligibility assessment',
          'Strategy development',
          'Document review',
          '1-hour consultation call',
          'Written recommendation report'
        ],
        status: 'active',
        duration: '1-2 weeks',
        deliverables: ['Consultation Report', 'Strategy Document']
      },
      {
        id: 'eb1a-premium',
        name: 'EB-1A Premium Package',
        description: 'Complete EB-1A application preparation and filing service',
        price: 5000,
        category: 'Research',
        features: [
          'Complete petition preparation',
          'Evidence collection guidance',
          'Legal brief writing',
          'Form I-140 filing',
          'Response to RFEs',
          'Priority processing'
        ],
        status: 'active',
        duration: '3-6 months',
        deliverables: ['Complete I-140 Petition', 'Evidence Portfolio', 'Legal Brief']
      },
      {
        id: 'eb2-niw',
        name: 'EB-2 NIW Application',
        description: 'National Interest Waiver application for advanced degree professionals',
        price: 4000,
        category: 'Research',
        features: [
          'NIW petition preparation',
          'Business plan development',
          'Evidence compilation',
          'Legal arguments',
          'Form I-140 filing'
        ],
        status: 'active',
        duration: '2-4 months',
        deliverables: ['I-140 Petition', 'Business Plan', 'Evidence Package']
      },
      {
        id: 'o1-visa',
        name: 'O-1 Visa Application',
        description: 'O-1 visa for individuals with extraordinary ability',
        price: 3500,
        category: 'Research',
        features: [
          'O-1 petition preparation',
          'Advisory opinion letters',
          'Evidence portfolio',
          'Form I-129 filing',
          'Consultation support'
        ],
        status: 'active',
        duration: '2-3 months',
        deliverables: ['I-129 Petition', 'Advisory Letters', 'Evidence Portfolio']
      },
      {
        id: 'profile-building',
        name: 'Profile Building Service',
        description: 'Comprehensive profile enhancement for immigration applications',
        price: 2000,
        category: 'Consulting',
        features: [
          'Profile gap analysis',
          'Publication strategy',
          'Media coverage plan',
          'Award nomination guidance',
          'Network building advice'
        ],
        status: 'active',
        duration: '1-3 months',
        deliverables: ['Profile Analysis Report', 'Enhancement Strategy', 'Action Plan']
      }
    ];
    
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

// @route   DELETE /api/services/:id
// @desc    Delete service (soft delete)
// @access  Private (Admin only)
router.delete('/:id', adminAuth, serviceController.deleteService);

module.exports = router;
