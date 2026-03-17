const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { auth, authenticateClient } = require('../middleware/auth');
const {
  submitProfileAssessment,
  getProfileAssessment,
  getAllProfileAssessments,
  getClientAssessments,
  getAssessmentByEmail,
  updateAssessmentStatus,
  convertAssessmentToLead,
  deleteProfileAssessment
} = require('../controllers/profileAssessmentController');

const router = express.Router();

// Rate limiting for public endpoints
const publicRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour instead of 15 minutes
  max: 10, // Limit each IP to 10 requests per hour instead of 3
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many profile assessment submissions. Please try again later.'
    }
  }
});

// Validation middleware for profile assessment submission
const validateProfileAssessment = [
  body('client_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-\.\']+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, dots, and apostrophes'),
  
  body('client_email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('client_phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters')
    .matches(/^[\+]?[1-9][\d\s\-\(\)\.]{7,18}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('field_of_expertise')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Field of expertise must be between 2 and 200 characters'),
  
  body('years_of_experience')
    .custom((value) => {
      // Handle both numeric values and string ranges
      if (typeof value === 'number') {
        return value >= 0 && value <= 100;
      }
      if (typeof value === 'string') {
        // Accept string ranges like "0-2", "3-5", "6-10", "11-15", "16+"
        const validRanges = ['0-2', '3-5', '6-10', '11-15', '16+'];
        return validRanges.includes(value);
      }
      return false;
    })
    .withMessage('Years of experience must be between 0 and 100 or a valid range (0-2, 3-5, 6-10, 11-15, 16+)'),
  
  body('current_location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Current location must be between 2 and 100 characters'),
  
  // Validate all 10 EB-1A criteria scores (0-3 scale)
  body('criterion_1_awards')
    .isInt({ min: 0, max: 3 })
    .withMessage('Awards criterion score must be between 0 and 3'),
  
  body('criterion_2_memberships')
    .isInt({ min: 0, max: 3 })
    .withMessage('Memberships criterion score must be between 0 and 3'),
  
  body('criterion_3_media')
    .isInt({ min: 0, max: 3 })
    .withMessage('Media criterion score must be between 0 and 3'),
  
  body('criterion_4_judging')
    .isInt({ min: 0, max: 3 })
    .withMessage('Judging criterion score must be between 0 and 3'),
  
  body('criterion_5_contributions')
    .isInt({ min: 0, max: 3 })
    .withMessage('Contributions criterion score must be between 0 and 3'),
  
  body('criterion_6_publications')
    .isInt({ min: 0, max: 3 })
    .withMessage('Publications criterion score must be between 0 and 3'),
  
  body('criterion_7_exhibitions')
    .isInt({ min: 0, max: 3 })
    .withMessage('Exhibitions criterion score must be between 0 and 3'),
  
  body('criterion_8_leadership')
    .isInt({ min: 0, max: 3 })
    .withMessage('Leadership criterion score must be between 0 and 3'),
  
  body('criterion_9_salary')
    .isInt({ min: 0, max: 3 })
    .withMessage('Salary criterion score must be between 0 and 3'),
  
  body('criterion_10_commercial')
    .isInt({ min: 0, max: 3 })
    .withMessage('Commercial criterion score must be between 0 and 3')
];

// Validation for status updates
const validateStatusUpdate = [
  body('status')
    .isIn(['New', 'Reviewed', 'Contacted', 'Converted', 'Archived'])
    .withMessage('Invalid status value'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  body('assigned_to')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID for assignment')
];

// Public Routes (with rate limiting)

// @route   POST /api/profile-assessments
// @desc    Submit profile assessment form
// @access  Public
router.post('/', 
  publicRateLimit,
  validateProfileAssessment,
  submitProfileAssessment
);

// @route   POST /api/profile-assessments/by-email
// @desc    Get assessment by email and ID (for download button)
// @access  Public
router.post('/by-email',
  getAssessmentByEmail
);

// Private Routes (require authentication)

// @route   GET /api/profile-assessments/client
// @desc    Get profile assessments for current logged-in client
// @access  Private (Client)
router.get('/client', 
  authenticateClient,
  getClientAssessments
);

// @route   GET /api/profile-assessments
// @desc    Get all profile assessments with pagination and filtering
// @access  Private (Admin/Manager)
router.get('/', 
  auth(['admin', 'lead_manager', 'crm_manager']),
  getAllProfileAssessments
);

// @route   GET /api/profile-assessments/:id
// @desc    Get single profile assessment by ID
// @access  Private (Admin/Manager)
router.get('/:id', 
  auth(['admin', 'lead_manager', 'crm_manager']),
  getProfileAssessment
);

// @route   PUT /api/profile-assessments/:id/status
// @desc    Update profile assessment status and assignment
// @access  Private (Admin/Manager)
router.put('/:id/status', 
  auth(['admin', 'lead_manager', 'crm_manager']),
  validateStatusUpdate,
  updateAssessmentStatus
);

// @route   POST /api/profile-assessments/:id/convert-to-lead
// @desc    Convert profile assessment to lead
// @access  Private (Admin/Manager)
router.post('/:id/convert-to-lead', 
  auth(['admin', 'lead_manager']),
  convertAssessmentToLead
);

// @route   DELETE /api/profile-assessments/:id
// @desc    Delete profile assessment
// @access  Private (Admin only)
router.delete('/:id', 
  auth(['admin']),
  deleteProfileAssessment
);

module.exports = router;