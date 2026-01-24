const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const {
  submitAppointmentRequest,
  getAppointmentRequest,
  getAllAppointmentRequests,
  updateAppointmentStatus,
  scheduleAppointment,
  addCommunication,
  deleteAppointmentRequest
} = require('../controllers/appointmentController');

const router = express.Router();

// Rate limiting for public endpoints
const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2, // Limit each IP to 2 appointment requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many appointment requests. Please try again later.'
    }
  }
});

// Validation middleware for appointment submission
const validateAppointmentRequest = [
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
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Phone number must be between 7 and 20 characters')
    .matches(/^[\+]?[1-9][\d\s\-\(\)\.]{6,18}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('visa_category')
    .isIn(['eb1a', 'eb2-niw', 'o1', 'multiple', 'other'])
    .withMessage('Invalid visa category'),
  
  body('timezone')
    .isIn(['EST', 'CST', 'MST', 'PST', 'GMT', 'CET', 'IST', 'CST-China', 'JST', 'AEST', 'other'])
    .withMessage('Invalid timezone'),
  
  body('preferred_date')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Preferred date cannot exceed 20 characters'),
  
  body('preferred_time')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Preferred time cannot exceed 20 characters'),
  
  body('consultation_type')
    .optional()
    .isIn(['video', 'phone', 'in-person'])
    .withMessage('Invalid consultation type'),
  
  body('details')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Details cannot exceed 2000 characters')
];

// Validation for status updates
const validateStatusUpdate = [
  body('status')
    .isIn(['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'])
    .withMessage('Invalid status value'),
  
  body('assigned_to')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID for assignment'),
  
  body('consultation_notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Consultation notes cannot exceed 2000 characters'),
  
  body('follow_up_required')
    .optional()
    .isBoolean()
    .withMessage('Follow up required must be a boolean'),
  
  body('follow_up_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid follow up date format')
];

// Validation for scheduling
const validateScheduling = [
  body('scheduled_date')
    .isISO8601()
    .withMessage('Invalid scheduled date format'),
  
  body('scheduled_time')
    .trim()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (use HH:MM)'),
  
  body('duration_minutes')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes'),
  
  body('meeting_link')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid meeting link URL'),
  
  body('meeting_id')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Meeting ID cannot exceed 100 characters')
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

// Public Routes (with rate limiting)

// @route   POST /api/appointments
// @desc    Submit appointment request
// @access  Public
router.post('/', 
  publicRateLimit,
  validateAppointmentRequest,
  submitAppointmentRequest
);

// Private Routes (require authentication)

// @route   GET /api/appointments
// @desc    Get all appointment requests with pagination and filtering
// @access  Private (Admin/Manager)
router.get('/', 
  ...auth(['admin', 'lead_manager', 'crm_manager']),
  getAllAppointmentRequests
);

// @route   GET /api/appointments/:id
// @desc    Get single appointment request by ID
// @access  Private (Admin/Manager)
router.get('/:id', 
  ...auth(['admin', 'lead_manager', 'crm_manager']),
  getAppointmentRequest
);

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment request status and assignment
// @access  Private (Admin/Manager)
router.put('/:id/status', 
  ...auth(['admin', 'lead_manager', 'crm_manager']),
  validateStatusUpdate,
  updateAppointmentStatus
);

// @route   PUT /api/appointments/:id/schedule
// @desc    Schedule appointment with date, time, and meeting details
// @access  Private (Admin/Manager)
router.put('/:id/schedule', 
  ...auth(['admin', 'lead_manager', 'crm_manager']),
  validateScheduling,
  scheduleAppointment
);

// @route   POST /api/appointments/:id/communications
// @desc    Add communication to appointment request
// @access  Private (Admin/Manager)
router.post('/:id/communications', 
  ...auth(['admin', 'lead_manager', 'crm_manager']),
  validateCommunication,
  addCommunication
);

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment request
// @access  Private (Admin only)
router.delete('/:id', 
  ...auth(['admin']),
  deleteAppointmentRequest
);

module.exports = router;