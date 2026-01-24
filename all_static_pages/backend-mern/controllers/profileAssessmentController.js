const ProfileAssessment = require('../models/ProfileAssessment');
const ActivityLog = require('../models/ActivityLog');
const { validationResult } = require('express-validator');

/**
 * Profile Assessment Controller
 * Handles EB-1A profile assessment form submissions with comprehensive security
 */

// @desc    Submit Profile Assessment
// @route   POST /api/profile-assessments
// @access  Public (with rate limiting and validation)
const submitProfileAssessment = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const {
      client_name,
      client_email,
      client_phone,
      field_of_expertise,
      years_of_experience,
      current_location,
      criterion_1_awards,
      criterion_2_memberships,
      criterion_3_media,
      criterion_4_judging,
      criterion_5_contributions,
      criterion_6_publications,
      criterion_7_exhibitions,
      criterion_8_leadership,
      criterion_9_salary,
      criterion_10_commercial
    } = req.body;

    // Calculate assessment results
    const criteriaScores = [
      criterion_1_awards, criterion_2_memberships, criterion_3_media,
      criterion_4_judging, criterion_5_contributions, criterion_6_publications,
      criterion_7_exhibitions, criterion_8_leadership, criterion_9_salary,
      criterion_10_commercial
    ];

    const strongCount = criteriaScores.filter(score => score === 3).length;
    const moderateCount = criteriaScores.filter(score => score === 2).length;
    const weakCount = criteriaScores.filter(score => score === 1).length;
    const noneCount = criteriaScores.filter(score => score === 0).length;
    
    const criteriaMet = strongCount + moderateCount;
    const totalScore = criteriaScores.reduce((sum, score) => sum + score, 0);
    const overallScore = Math.round((totalScore / 30) * 100); // Convert to percentage

    // Determine profile strength
    let profileStrength;
    if (overallScore >= 80 && strongCount >= 3) {
      profileStrength = 'Excellent Profile Strength';
    } else if (overallScore >= 60 && criteriaMet >= 3) {
      profileStrength = 'Good Profile Strength';
    } else if (overallScore >= 40 && criteriaMet >= 2) {
      profileStrength = 'Moderate Profile Strength';
    } else {
      profileStrength = 'Needs Development';
    }

    // Create assessment record
    const assessment = new ProfileAssessment({
      client_name,
      client_email,
      client_phone,
      field_of_expertise,
      years_of_experience,
      current_location,
      criterion_1_awards,
      criterion_2_memberships,
      criterion_3_media,
      criterion_4_judging,
      criterion_5_contributions,
      criterion_6_publications,
      criterion_7_exhibitions,
      criterion_8_leadership,
      criterion_9_salary,
      criterion_10_commercial,
      overall_score: overallScore,
      profile_strength: profileStrength,
      strong_criteria_count: strongCount,
      moderate_criteria_count: moderateCount,
      weak_criteria_count: weakCount + noneCount,
      criteria_met: criteriaMet,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    await assessment.save();

    // Log activity for security audit
    await ActivityLog.create({
      user: null, // Anonymous submission
      action: 'create',
      resourceType: 'ProfileAssessment',
      resourceId: assessment._id,
      description: `Profile assessment submitted by ${client_email}`,
      metadata: {
        email: client_email,
        overall_score: overallScore,
        profile_strength: profileStrength,
        criteria_met: criteriaMet
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Return assessment results (excluding sensitive data)
    res.status(201).json({
      success: true,
      message: 'Profile assessment submitted successfully',
      data: {
        assessment_id: assessment._id,
        overall_score: overallScore,
        profile_strength: profileStrength,
        criteria_met: criteriaMet,
        strong_criteria_count: strongCount,
        moderate_criteria_count: moderateCount,
        eligibility_recommendation: assessment.eligibility_recommendation,
        submission_date: assessment.createdAt
      }
    });

  } catch (error) {
    console.error('Profile Assessment Submission Error:', error);
    
    // Log error for monitoring
    if (req.body?.client_email) {
      await ActivityLog.create({
        user: null,
        action: 'other',
        resourceType: 'System',
        description: `Profile assessment submission failed for ${req.body.client_email}`,
        metadata: { error: error.message },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }).catch(() => {}); // Silent fail for logging
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SUBMISSION_ERROR',
        message: 'Failed to submit profile assessment. Please try again.'
      }
    });
  }
};

// @desc    Get Profile Assessment by ID
// @route   GET /api/profile-assessments/:id
// @access  Private (Admin/Manager only)
const getProfileAssessment = async (req, res) => {
  try {
    const assessment = await ProfileAssessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Profile assessment not found'
        }
      });
    }

    // Log access for audit
    await ActivityLog.create({
      user: req.user._id,
      action: 'view',
      resourceType: 'ProfileAssessment',
      resourceId: assessment._id,
      description: `Profile assessment viewed by ${req.user.email}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: assessment
    });

  } catch (error) {
    console.error('Get Profile Assessment Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to retrieve profile assessment'
      }
    });
  }
};

// @desc    Get All Profile Assessments (with pagination and filtering)
// @route   GET /api/profile-assessments
// @access  Private (Admin/Manager only)
const getAllProfileAssessments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.profile_strength) filter.profile_strength = req.query.profile_strength;
    if (req.query.min_score) filter.overall_score = { $gte: parseInt(req.query.min_score) };

    // Get assessments with pagination
    const assessments = await ProfileAssessment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-ip_address -user_agent'); // Exclude sensitive data

    const total = await ProfileAssessment.countDocuments(filter);

    // Log access
    await ActivityLog.create({
      user: req.user._id,
      action: 'view',
      resourceType: 'ProfileAssessment',
      description: `Profile assessments list viewed by ${req.user.email}`,
      metadata: { page, limit, total, filter },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        assessments,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_records: total,
          per_page: limit
        }
      }
    });

  } catch (error) {
    console.error('Get All Profile Assessments Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to retrieve profile assessments'
      }
    });
  }
};

// @desc    Update Profile Assessment Status
// @route   PUT /api/profile-assessments/:id/status
// @access  Private (Admin/Manager only)
const updateAssessmentStatus = async (req, res) => {
  try {
    const { status, notes, assigned_to } = req.body;
    
    const assessment = await ProfileAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Profile assessment not found'
        }
      });
    }

    const oldStatus = assessment.status;
    assessment.status = status;
    if (notes) assessment.notes = notes;
    if (assigned_to) assessment.assigned_to = assigned_to;

    await assessment.save();

    // Log status change
    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      resourceType: 'ProfileAssessment',
      resourceId: assessment._id,
      description: `Profile assessment status changed from ${oldStatus} to ${status}`,
      metadata: { old_status: oldStatus, new_status: status, notes },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Assessment status updated successfully',
      data: assessment
    });

  } catch (error) {
    console.error('Update Assessment Status Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update assessment status'
      }
    });
  }
};

// @desc    Delete Profile Assessment
// @route   DELETE /api/profile-assessments/:id
// @access  Private (Admin only)
const deleteProfileAssessment = async (req, res) => {
  try {
    const assessment = await ProfileAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Profile assessment not found'
        }
      });
    }

    await ProfileAssessment.findByIdAndDelete(req.params.id);

    // Log deletion
    await ActivityLog.create({
      user: req.user._id,
      action: 'delete',
      resourceType: 'ProfileAssessment',
      resourceId: req.params.id,
      description: `Profile assessment deleted by ${req.user.email}`,
      metadata: { 
        client_email: assessment.client_email,
        overall_score: assessment.overall_score 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Profile assessment deleted successfully'
    });

  } catch (error) {
    console.error('Delete Profile Assessment Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete profile assessment'
      }
    });
  }
};

module.exports = {
  submitProfileAssessment,
  getProfileAssessment,
  getAllProfileAssessments,
  updateAssessmentStatus,
  deleteProfileAssessment
};