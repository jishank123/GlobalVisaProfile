const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const leadController = require('../controllers/leadController');
const { body } = require('express-validator');

// Validation middleware
const validateLeadCreation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isLength({ min: 10 }).withMessage('Valid phone number is required'),
  body('source').optional().isIn(['website', 'referral', 'social_media', 'advertisement', 'event']).withMessage('Invalid source'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
];

const validateLeadUpdate = [
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isLength({ min: 10 }).withMessage('Valid phone number is required')
];

// @route   GET /api/leads
// @desc    Get all leads with filters
// @access  Private (Admin, Lead Manager)
router.get('/', auth(['admin', 'lead_manager']), leadController.getLeads);

// @route   GET /api/leads/stats/summary
// @desc    Get lead statistics
// @access  Private (Admin, Lead Manager)
router.get('/stats/summary', auth(['admin', 'lead_manager']), leadController.getLeadStats);

// @route   GET /api/leads/:id
// @desc    Get single lead
// @access  Private (Admin, Assigned Lead Manager)
router.get('/:id', auth(['admin', 'lead_manager']), leadController.getLead);

// @route   POST /api/leads
// @desc    Create new lead (Admin only)
// @access  Private (Admin only)
router.post('/', auth(['admin']), validateLeadCreation, leadController.createLead);

// @route   POST /api/leads/bulk/assign
// @desc    Bulk assign leads to manager
// @access  Private (Admin only)
router.post('/bulk/assign', auth(['admin']), leadController.bulkAssignLeads);

// @route   POST /api/leads/from-form
// @desc    Create lead from form submission
// @access  Private (Admin only) or Internal system
router.post('/from-form', auth(['admin']), leadController.createLeadFromForm);

// @route   PATCH /api/leads/:id/assign
// @desc    Assign lead to manager
// @access  Private (Admin, Lead Manager)
router.patch('/:id/assign', auth(['admin', 'lead_manager']), leadController.assignLead);

// @route   PATCH /api/leads/:id
// @desc    Update lead
// @access  Private (Admin, Assigned Lead Manager)
router.patch('/:id', auth(['admin', 'lead_manager']), validateLeadUpdate, leadController.updateLead);

// @route   POST /api/leads/:id/convert
// @desc    Convert lead to client
// @access  Private (Admin, Assigned Lead Manager)
router.post('/:id/convert', auth(['admin', 'lead_manager']), leadController.convertLead);

// @route   DELETE /api/leads/:id
// @desc    Delete lead (soft delete)
// @access  Private (Admin only)
router.delete('/:id', auth(['admin']), leadController.deleteLead);

module.exports = router;
