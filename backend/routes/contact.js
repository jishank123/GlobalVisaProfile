const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { auth } = require('../middleware/auth');
const {
  submitContactForm,
  getContactForm,
  getAllContactForms,
  updateContactFormStatus,
  respondToContactForm,
  addCommunication,
  convertToLead,
  deleteContactForm
} = require('../controllers/contactFormController');

const router = express.Router();

// Rate limiting for public endpoints
const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 contact form submissions per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many contact form submissions. Please try again later.'
    }
  }
});

// Validation middleware for contact form submission
const validateContactForm = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-\.\']+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, dots, and apostrophes'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters')
    .matches(/^[\+]?[\(\d][\d\s\-\(\)\.]{5,18}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('visa_type')
    .isIn(['eb1a', 'eb2-niw', 'o1', 'profile', 'other'])
    .withMessage('Invalid visa category'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  
  // Optional UTM and tracking parameters
  body('utm_source')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('UTM source cannot exceed 100 characters'),
  
  body('utm_medium')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('UTM medium cannot exceed 100 characters'),
  
  body('utm_campaign')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('UTM campaign cannot exceed 100 characters'),
  
  body('referrer_url')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Referrer URL cannot exceed 500 characters')
];

// Validation for status updates
const validateStatusUpdate = [
  body('status')
    .isIn(['new', 'reviewed', 'responded', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status value'),
  
  body('assigned_to')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID for assignment'),
  
  body('internal_notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Internal notes cannot exceed 1000 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority value')
];

// Validation for responses
const validateResponse = [
  body('response_message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Response message must be between 10 and 2000 characters')
];

// Validation for communications
const validateCommunication = [
  body('type')
    .isIn(['email', 'phone', 'sms', 'meeting', 'note'])
    .withMessage('Invalid communication type'),
  
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  
  body('direction')
    .optional()
    .isIn(['inbound', 'outbound'])
    .withMessage('Invalid communication direction')
];

// Validation for lead conversion
const validateLeadConversion = [
  body('service_interest')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Service interest must be between 2 and 200 characters'),
  
  body('priority')
    .optional()
    .isIn(['high', 'medium', 'low'])
    .withMessage('Invalid priority value'),
  
  body('assigned_to')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID for assignment'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Public Routes (with rate limiting)

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', 
  publicRateLimit,
  validateContactForm,
  submitContactForm
);

// Private Routes (require authentication)

// @route   GET /api/contact
// @desc    Get all contact forms with pagination and filtering
// @access  Private (Admin/Manager)
router.get('/', 
  auth(['admin', 'lead_manager', 'crm_manager']),
  getAllContactForms
);

// @route   GET /api/contact/:id
// @desc    Get single contact form by ID
// @access  Private (Admin/Manager)
router.get('/:id', 
  auth(['admin', 'lead_manager', 'crm_manager']),
  getContactForm
);

// @route   PUT /api/contact/:id/status
// @desc    Update contact form status and assignment
// @access  Private (Admin/Manager)
router.put('/:id/status', 
  auth(['admin', 'lead_manager', 'crm_manager']),
  validateStatusUpdate,
  updateContactFormStatus
);

// @route   POST /api/contact/:id/respond
// @desc    Send response to contact form inquiry
// @access  Private (Admin/Manager)
router.post('/:id/respond', 
  auth(['admin', 'lead_manager', 'crm_manager']),
  validateResponse,
  respondToContactForm
);

// @route   POST /api/contact/:id/communications
// @desc    Add communication to contact form
// @access  Private (Admin/Manager)
router.post('/:id/communications', 
  auth(['admin', 'lead_manager', 'crm_manager']),
  validateCommunication,
  addCommunication
);

// @route   POST /api/contact/:id/convert-to-lead
// @desc    Convert contact form to lead
// @access  Private (Admin/Manager)
router.post('/:id/convert-to-lead', 
  auth(['admin', 'lead_manager', 'crm_manager']),
  validateLeadConversion,
  convertToLead
);

// @route   DELETE /api/contact/:id
// @desc    Delete contact form
// @access  Private (Admin only)
router.delete('/:id', 
  auth(['admin']),
  deleteContactForm
);

module.exports = router;