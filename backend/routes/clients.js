const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const clientController = require('../controllers/clientController');
const { body } = require('express-validator');

// Validation middleware
const validateClientCreation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('country').notEmpty().withMessage('Country is required')
];

const validateClientUpdate = [
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required')
];

// @route   GET /api/clients
// @desc    Get all clients with filters
// @access  Private (Admin, Managers)
router.get('/', ...auth(['admin', 'lead_manager', 'crm_manager']), clientController.getClients);

// @route   GET /api/clients/stats/summary
// @desc    Get client statistics
// @access  Private (Admin, Managers)
router.get('/stats/summary', ...auth(['admin', 'lead_manager', 'crm_manager']), clientController.getClientStats);

// @route   GET /api/clients/my-clients
// @desc    Get clients assigned to current manager
// @access  Private (CRM Manager only)
router.get('/my-clients', ...auth(['crm_manager']), clientController.getMyClients);

// @route   GET /api/clients/:id
// @desc    Get single client
// @access  Private
router.get('/:id', ...auth(), clientController.getClient);

// @route   POST /api/clients
// @desc    Create new client
// @access  Private (Admin, Lead Manager)
router.post('/', ...auth(['admin', 'lead_manager']), validateClientCreation, clientController.createClient);

// @route   PATCH /api/clients/:id
// @desc    Update client
// @access  Private (Admin, Assigned Manager, Own Profile)
router.patch('/:id', ...auth(), validateClientUpdate, clientController.updateClient);

// @route   PATCH /api/clients/:id/assign
// @desc    Assign client to manager
// @access  Private (Admin, Lead Manager)
router.patch('/:id/assign', ...auth(['admin', 'lead_manager']), clientController.assignClient);

// @route   DELETE /api/clients/:id
// @desc    Delete client (soft delete)
// @access  Private (Admin only)
router.delete('/:id', ...auth(['admin']), clientController.deleteClient);

module.exports = router;
