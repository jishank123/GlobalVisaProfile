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
  console.log('\n🧪 === PROFILE ASSESSMENT SUBMISSION STARTED ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Request IP:', req.ip);
  console.log('🖥️ User Agent:', req.get('User-Agent'));
  console.log('📊 Request Body Keys:', Object.keys(req.body));
  
  try {
    // Check for validation errors
    console.log('✅ Step 1: Checking validation errors...');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ VALIDATION FAILED:');
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }
    console.log('✅ Validation passed successfully');

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

    console.log('📊 Step 2: Processing form data...');
    console.log('📊 Client Info:', {
      name: client_name,
      email: client_email,
      phone: client_phone || 'Not provided',
      field: field_of_expertise,
      experience: years_of_experience,
      location: current_location
    });

    // Calculate assessment results
    console.log('🧮 Step 3: Calculating assessment results...');
    const criteriaScores = [
      criterion_1_awards, criterion_2_memberships, criterion_3_media,
      criterion_4_judging, criterion_5_contributions, criterion_6_publications,
      criterion_7_exhibitions, criterion_8_leadership, criterion_9_salary,
      criterion_10_commercial
    ];

    console.log('📊 Criteria Scores:', criteriaScores);

    const strongCount = criteriaScores.filter(score => score === 3).length;
    const moderateCount = criteriaScores.filter(score => score === 2).length;
    const weakCount = criteriaScores.filter(score => score === 1).length;
    const noneCount = criteriaScores.filter(score => score === 0).length;
    
    const criteriaMet = strongCount + moderateCount;
    const totalScore = criteriaScores.reduce((sum, score) => sum + score, 0);
    const overallScore = Math.round((totalScore / 30) * 100); // Convert to percentage

    console.log('🧮 Calculated Results:');
    console.log('  - Total Score:', totalScore, '/ 30');
    console.log('  - Overall Percentage:', overallScore + '%');
    console.log('  - Strong Criteria:', strongCount);
    console.log('  - Moderate Criteria:', moderateCount);
    console.log('  - Weak Criteria:', weakCount);
    console.log('  - None Criteria:', noneCount);
    console.log('  - Criteria Met:', criteriaMet);

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

    console.log('🎯 Profile Strength Determined:', profileStrength);

    // Create assessment record
    console.log('💾 Step 4: Creating database record...');
    const assessmentData = {
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
    };

    console.log('💾 Assessment data prepared for database:', {
      ...assessmentData,
      user_agent: '[TRUNCATED]' // Don't log full user agent
    });

    const assessment = new ProfileAssessment(assessmentData);

    console.log('💾 Attempting to save to database...');
    const savedAssessment = await assessment.save();
    console.log('✅ DATABASE SAVE SUCCESSFUL!');
    console.log('✅ Assessment ID:', savedAssessment._id);
    console.log('✅ Created At:', savedAssessment.createdAt);

    // Verify the save by counting documents
    console.log('🔍 Step 5: Verifying database storage...');
    const totalAssessments = await ProfileAssessment.countDocuments();
    console.log('📊 Total assessments in database:', totalAssessments);

    // Double-check by finding the just-saved record
    const verifyRecord = await ProfileAssessment.findById(savedAssessment._id);
    if (verifyRecord) {
      console.log('✅ VERIFICATION SUCCESSFUL: Record found in database');
      console.log('✅ Verified data:', {
        id: verifyRecord._id,
        name: verifyRecord.client_name,
        email: verifyRecord.client_email,
        score: verifyRecord.overall_score
      });
    } else {
      console.log('❌ VERIFICATION FAILED: Record not found in database');
    }

    // Log activity for security audit
    console.log('📝 Step 6: Creating activity log...');
    try {
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
      console.log('✅ Activity log created successfully');
    } catch (logError) {
      console.log('⚠️ Activity log creation failed (non-critical):', logError.message);
    }

    // Return assessment results (excluding sensitive data)
    console.log('📤 Step 7: Sending response to client...');
    const responseData = {
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
    };

    console.log('📤 Response data:', responseData);
    res.status(201).json(responseData);

    console.log('🎉 === PROFILE ASSESSMENT SUBMISSION COMPLETED SUCCESSFULLY ===');
    console.log('🎉 Summary:');
    console.log('  - Client:', client_name, '(' + client_email + ')');
    console.log('  - Score:', overallScore + '%');
    console.log('  - Strength:', profileStrength);
    console.log('  - Database ID:', savedAssessment._id);
    console.log('  - Total Assessments:', totalAssessments);
    console.log('🎉 ===============================================\n');

  } catch (error) {
    console.error('💥 === PROFILE ASSESSMENT SUBMISSION ERROR ===');
    console.error('💥 Error Type:', error.name);
    console.error('💥 Error Message:', error.message);
    console.error('💥 Error Stack:', error.stack);
    console.error('💥 Full Error Object:', error);
    
    // Check if it's a database connection error
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      console.error('💥 DATABASE ERROR DETECTED:');
      console.error('💥 - Check MongoDB connection');
      console.error('💥 - Verify database is running');
      console.error('💥 - Check connection string');
    }

    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      console.error('💥 MONGOOSE VALIDATION ERROR:');
      console.error('💥 Validation Details:', error.errors);
    }
    
    // Log error for monitoring
    if (req.body?.client_email) {
      try {
        await ActivityLog.create({
          user: null,
          action: 'other',
          resourceType: 'System',
          description: `Profile assessment submission failed for ${req.body.client_email}`,
          metadata: { 
            error: error.message,
            errorType: error.name,
            clientEmail: req.body.client_email
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
        console.log('📝 Error logged to activity log');
      } catch (logError) {
        console.error('💥 Failed to log error to activity log:', logError.message);
      }
    }

    console.error('💥 === ERROR HANDLING COMPLETED ===\n');

    res.status(500).json({
      success: false,
      error: {
        code: 'SUBMISSION_ERROR',
        message: 'Failed to submit profile assessment. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// @desc    Get Profile Assessments for Current Client
// @route   GET /api/profile-assessments/client
// @access  Private (Client only)
const getClientAssessments = async (req, res) => {
  try {
    console.log('📋 === GET CLIENT ASSESSMENTS ===');
    console.log('📋 Client ID:', req.client.id);
    console.log('📋 Client Email:', req.client.email);
    
    // Find assessments by client email (since assessments might exist before account creation)
    const assessments = await ProfileAssessment.find({ 
      client_email: req.client.email 
    })
    .sort({ createdAt: -1 })
    .select('-ip_address -user_agent'); // Exclude sensitive data

    console.log('📋 Found assessments:', assessments.length);

    // Log access
    try {
      await ActivityLog.create({
        user: req.client.id,
        action: 'view',
        resourceType: 'ProfileAssessment',
        description: `Client viewed their profile assessments`,
        metadata: { 
          client_email: req.client.email,
          assessments_count: assessments.length 
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    } catch (logError) {
      console.log('⚠️ Activity log creation failed (non-critical):', logError.message);
    }

    res.json({
      success: true,
      data: assessments,
      count: assessments.length
    });

    console.log('✅ Client assessments retrieved successfully');

  } catch (error) {
    console.error('❌ Get Client Assessments Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to retrieve your profile assessments'
      }
    });
  }
};

module.exports = {
  submitProfileAssessment,
  getProfileAssessment,
  getAllProfileAssessments,
  getClientAssessments,
  updateAssessmentStatus,
  deleteProfileAssessment
};