const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const invoiceController = require('../controllers/invoiceController');
const { body } = require('express-validator');

// Validation middleware
const validateInvoiceCreation = [
  body('client_id').notEmpty().withMessage('Client ID is required'),
  body('service_name').notEmpty().withMessage('Service name is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('due_date').isISO8601().withMessage('Valid due date is required')
];

// @route   GET /api/invoices
// @desc    Get all invoices with filters
// @access  Private (Admin, Lead Manager, CRM Manager, Client)
router.get('/', auth(['admin', 'lead_manager', 'crm_manager', 'client']), invoiceController.getInvoices);

// @route   GET /api/invoices/stats/summary
// @desc    Get invoice statistics
// @access  Private (Admin, Lead Manager, CRM Manager)
router.get('/stats/summary', auth(['admin', 'lead_manager', 'crm_manager']), invoiceController.getInvoiceStats);

// @route   GET /api/invoices/:id
// @desc    Get single invoice
// @access  Private (Admin, Lead Manager, CRM Manager, Client)
router.get('/:id', auth(['admin', 'lead_manager', 'crm_manager', 'client']), invoiceController.getInvoice);

// @route   GET /api/invoices/:id/view
// @desc    View invoice as HTML (for printing/viewing)
// @access  Private (Admin, Lead Manager, CRM Manager, Client)
router.get('/:id/view', auth(['admin', 'lead_manager', 'crm_manager', 'client']), invoiceController.viewInvoice);

// @route   POST /api/invoices/:id/download
// @desc    Download invoice as HTML (with token in body)
// @access  Private (Admin, Lead Manager, CRM Manager, Client)
router.post('/:id/download', auth(['admin', 'lead_manager', 'crm_manager', 'client']), invoiceController.downloadInvoice);

// @route   POST /api/invoices
// @desc    Create new invoice
// @access  Private (Admin, Lead Manager)
router.post('/', auth(['admin', 'lead_manager']), validateInvoiceCreation, invoiceController.createInvoice);

// @route   PATCH /api/invoices/:id/status
// @desc    Update invoice status
// @access  Private (Admin, Lead Manager)
router.patch('/:id/status', auth(['admin', 'lead_manager']), invoiceController.updateInvoiceStatus);

module.exports = router;