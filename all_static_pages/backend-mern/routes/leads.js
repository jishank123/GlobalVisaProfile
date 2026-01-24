const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const leadController = require('../controllers/leadController');
const { body } = require('express-validator');

// Validation middleware
const validateLeadCreation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('source').optional().isIn(['website', 'referral', 'social', 'advertisement', 'other']).withMessage('Invalid source'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
];

const validateLeadUpdate = [
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('qualification_score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100')
];

// @route   GET /api/leads
// @desc    Get all leads with filters
// @access  Private (Admin, Lead Manager)
router.get('/', protect, restrictTo('admin', 'lead_manager'), leadController.getLeads);

// @route   GET /api/leads/stats/summary
// @desc    Get lead statistics
// @access  Private (Admin, Lead Manager)
router.get('/stats/summary', protect, restrictTo('admin', 'lead_manager'), leadController.getLeadStats);

// @route   GET /api/leads/:id
// @desc    Get single lead
// @access  Private (Admin, Assigned Lead Manager)
router.get('/:id', protect, restrictTo('admin', 'lead_manager'), leadController.getLead);

// @route   POST /api/leads
// @desc    Create new lead
// @access  Private (Admin, Lead Manager) or Public (website forms)
router.post('/', validateLeadCreation, leadController.createLead);

// @route   PATCH /api/leads/:id
// @desc    Update lead
// @access  Private (Admin, Assigned Lead Manager)
router.patch('/:id', protect, restrictTo('admin', 'lead_manager'), validateLeadUpdate, leadController.updateLead);

// @route   POST /api/leads/:id/convert
// @desc    Convert lead to client
// @access  Private (Admin, Assigned Lead Manager)
router.post('/:id/convert', protect, restrictTo('admin', 'lead_manager'), leadController.convertLead);

// @route   PATCH /api/leads/:id/assign
// @desc    Assign lead to manager
// @access  Private (Admin only)
router.patch('/:id/assign', protect, restrictTo('admin'), leadController.assignLead);

// @route   DELETE /api/leads/:id
// @desc    Delete lead (soft delete)
// @access  Private (Admin only)
router.delete('/:id', protect, restrictTo('admin'), leadController.deleteLead);

module.exports = router;
