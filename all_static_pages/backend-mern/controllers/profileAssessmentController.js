const ProfileAssessment = require('../models/ProfileAssessment');
const ActivityLog = require('../models/ActivityLog');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Rate limiting for profile assessment submissions
const assessmentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    error: 'Too many assessment submissions. Please try again in 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validation rules for profile assessment
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
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('field_of_expertise')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Field of expertise must be between 2 and 200 characters'),
  
  body('years_of_experience')
    .isInt({ min: 0, max: 100 })
    .withMessage('Years of experience must be between 0 and 100'),
  
  body('current_location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Current location must be between 2 and 100 characters'),
  
  // Validate all 10 criteria scores
  ...Array.from({ length: 10 }, (_, i) => 
    body(`criterion_${i + 1}_${getCriterionName(i + 1)}`)
      .isInt({ min: 0, max: 3 })
      .withMessage(`Criterion ${i + 1} score must be between 0 and 3`)
  ),
  
  body('overall_score')
    .isInt({ min: 0, max: 100 })
    .withMessage('Overall score must be between 0 and 100'),
  
  body('profile_strength')
    .isIn(['Needs Development', 'Moderate Profile Strength', 'Good Profile Strength', 'Excellent Profile Strength'])
    .withMessage('Invalid profile strength value')
];

function getCriterionName(num) {
  const names = {
    1: 'awards', 2: 'memberships', 3: 'media', 4: 'judging', 5: 'contributions',
    6: 'publications', 7: 'exhibitions', 8: 'leadership', 9: 'salary', 10: 'commercial'
  };
  return names[num];
}

// @desc    Submit profile assessment
// @route   POST /api/profile-assessments
// @access  Public (with rate limiting)
const submitProfileAssessment = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Extract client IP and user agent for security
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    // Check for duplicate submissions (same email within 24 hours)
    const existingAssessment = await ProfileAssessment.findOne({
      client_email: req.body.client_email,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (existingAssessment) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an assessment in the last 24 hours. Please contact us directly for additional assessments.',
        code: 'DUPLICATE_SUBMISSION'
      });
    }

    // Create assessment record
    const assessmentData = {
      ...req.body,
      ip_address: clientIP,
      user_agent: userAgent,
      status: 'New',
      follow_up_status: 'Pending'
    };

    const assessment = new ProfileAssessment(assessmentData);
    await assessment.save();

    // Log the activity
    await ActivityLog.create({
      user: null, // Public submission
      action: 'profile_assessment_submitted',
      resource: 'ProfileAssessment',
      resourceId: assessment._id,
      details: {
        client_email: assessment.client_email,
        overall_score: assessment.overall_score,
        profile_strength: assessment.profile_strength,
        criteria_met: assessment.criteria_met,
        ip_address: clientIP
      },
      ip_address: clientIP,
      user_agent: userAgent
    });

    // Return success response (without sensitive data)
    res.status(201).json({
      success: true,
      message: 'Profile assessment submitted successfully',
      data: {
        id: assessment._id,
        overall_score: assessment.overall_score,
        profile_strength: assessment.profile_strength,
        criteria_met: assessment.criteria_met,
        eligibility_recommendation: assessment.eligibility_recommendation,
        submission_date: assessment.createdAt
      }
    });

  } catch (error) {
    console.error('Profile assessment submission error:', error);
    
    // Log the error
    await ActivityLog.create({
      user: null,
      action: 'profile_assessment_error',
      resource: 'ProfileAssessment',
      details: {
        error: error.message,
        client_email: req.body.client_email,
        ip_address: req.ip
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    }).catch(console.error);

    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your assessment. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// @desc    Get all profile assessments (Admin only)
// @route   GET /api/profile-assessments
// @access  Private (Admin)
const getProfileAssessments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.profile_strength) filter.profile_strength = req.query.profile_strength;
    if (req.query.min_score) filter.overall_score = { $gte: parseInt(req.query.min_score) };
    
    // Build sort
    const sort = {};
    if (req.query.sort_by) {
      const sortField = req.query.sort_by;
      const sortOrder = req.query.sort_order === 'asc' ? 1 : -1;
      sort[sortField] = sortOrder;
    } else {
      sort.createdAt = -1; // Default: newest first
    }

    const assessments = await ProfileAssessment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('assigned_to', 'name email')
      .select('-ip_address -user_agent'); // Exclude sensitive data

    const total = await ProfileAssessment.countDocuments(filter);

    // Log the access
    await ActivityLog.create({
      user: req.user._id,
      action: 'profile_assessments_viewed',
      resource: 'ProfileAssessment',
      details: {
        page,
        limit,
        total_results: total,
        filter
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: assessments,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_records: total,
        per_page: limit
      }
    });

  } catch (error) {
    console.error('Get profile assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile assessments'
    });
  }
};

// @desc    Get single profile assessment (Admin only)
// @route   GET /api/profile-assessments/:id
// @access  Private (Admin)
const getProfileAssessment = async (req, res) => {
  try {
    const assessment = await ProfileAssessment.findById(req.params.id)
      .populate('assigned_to', 'name email role');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Profile assessment not found'
      });
    }

    // Log the access
    await ActivityLog.create({
      user: req.user._id,
      action: 'profile_assessment_viewed',
      resource: 'ProfileAssessment',
      resourceId: assessment._id,
      details: {
        client_email: assessment.client_email,
        overall_score: assessment.overall_score
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: assessment
    });

  } catch (error) {
    console.error('Get profile assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile assessment'
    });
  }
};

// @desc    Update profile assessment status (Admin only)
// @route   PUT /api/profile-assessments/:id
// @access  Private (Admin)
const updateProfileAssessment = async (req, res) => {
  try {
    const { status, follow_up_status, assigned_to, notes } = req.body;
    
    const assessment = await ProfileAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Profile assessment not found'
      });
    }

    // Update fields
    if (status) assessment.status = status;
    if (follow_up_status) assessment.follow_up_status = follow_up_status;
    if (assigned_to) assessment.assigned_to = assigned_to;
    if (notes) assessment.notes = notes;

    await assessment.save();

    // Log the update
    await ActivityLog.create({
      user: req.user._id,
      action: 'profile_assessment_updated',
      resource: 'ProfileAssessment',
      resourceId: assessment._id,
      details: {
        updated_fields: { status, follow_up_status, assigned_to, notes },
        client_email: assessment.client_email
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Profile assessment updated successfully',
      data: assessment
    });

  } catch (error) {
    console.error('Update profile assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile assessment'
    });
  }
};

// @desc    Delete profile assessment (Admin only)
// @route   DELETE /api/profile-assessments/:id
// @access  Private (Admin)
const deleteProfileAssessment = async (req, res) => {
  try {
    const assessment = await ProfileAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Profile assessment not found'
      });
    }

    await assessment.deleteOne();

    // Log the deletion
    await ActivityLog.create({
      user: req.user._id,
      action: 'profile_assessment_deleted',
      resource: 'ProfileAssessment',
      resourceId: req.params.id,
      details: {
        client_email: assessment.client_email,
        overall_score: assessment.overall_score
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Profile assessment deleted successfully'
    });

  } catch (error) {
    console.error('Delete profile assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting profile assessment'
    });
  }
};

// @desc    Get assessment statistics (Admin only)
// @route   GET /api/profile-assessments/stats
// @access  Private (Admin)
const getAssessmentStats = async (req, res) => {
  try {
    const stats = await ProfileAssessment.aggregate([
      {
        $group: {
          _id: null,
          total_assessments: { $sum: 1 },
          avg_score: { $avg: '$overall_score' },
          high_potential: {
            $sum: {
              $cond: [{ $gte: ['$criteria_met', 3] }, 1, 0]
            }
          },
          by_strength: {
            $push: '$profile_strength'
          }
        }
      }
    ]);

    const strengthDistribution = await ProfileAssessment.aggregate([
      {
        $group: {
          _id: '$profile_strength',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        strength_distribution: strengthDistribution
      }
    });

  } catch (error) {
    console.error('Get assessment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving assessment statistics'
    });
  }
};

module.exports = {
  submitProfileAssessment: [assessmentRateLimit, validateProfileAssessment, submitProfileAssessment],
  getProfileAssessments,
  getProfileAssessment,
  updateProfileAssessment,
  deleteProfileAssessment,
  getAssessmentStats
};