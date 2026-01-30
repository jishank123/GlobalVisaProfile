const ProfileAssessment = require('../models/ProfileAssessment');
const ActivityLog = require('../models/ActivityLog');
const clientService = require('../services/clientService');
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

    // Auto-register client account
    console.log('🔄 Step 5: Auto-registering client account...');
    try {
      const { user, client, isNewUser } = await clientService.createOrGetClient({
        name: client_name,
        email: client_email,
        phone: client_phone,
        field_of_expertise,
        current_location
      }, 'profile_assessment');

      console.log(`✅ Client ${isNewUser ? 'created' : 'found'}:`, user.email);
      
      // Link assessment to user
      savedAssessment.user_id = user._id;
      savedAssessment.client_id = client._id;
      await savedAssessment.save();
      
    } catch (autoRegError) {
      console.error('⚠️ Auto-registration failed (non-critical):', autoRegError.message);
      // Continue with assessment submission even if auto-registration fails
    }

    // Verify the save by counting documents
    console.log('🔍 Step 6: Verifying database storage...');
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
    console.log('📝 Step 7: Creating activity log...');
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
    console.log('📤 Step 8: Sending response to client...');
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

    // Get assessments with pagination and populate conversion data
    const assessments = await ProfileAssessment.find(filter)
      .populate('converted_to_lead_id', 'firstName lastName email status')
      .populate('converted_by', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-ip_address -user_agent'); // Exclude sensitive data

    const total = await ProfileAssessment.countDocuments(filter);

    // Check for leads created from assessments (for assessments without converted_to_lead_id)
    const Lead = require('../models/Lead');
    const assessmentsWithConversionStatus = await Promise.all(
      assessments.map(async (assessment) => {
        const assessmentObj = assessment.toObject();
        
        // If not already marked as converted, check if a lead exists with same email and source
        if (!assessmentObj.converted_to_lead_id && assessmentObj.status !== 'Converted') {
          const existingLead = await Lead.findOne({
            email: assessment.client_email,
            source: 'profile_assessment'
          });
          
          if (existingLead) {
            // Mark as converted (but don't save to DB here, just for display)
            assessmentObj.converted_to_lead = existingLead;
            assessmentObj.status = 'Converted';
          }
        }
        
        return assessmentObj;
      })
    );

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
        assessments: assessmentsWithConversionStatus,
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

// @desc    Convert Profile Assessment to Lead
// @route   POST /api/profile-assessments/:id/convert-to-lead
// @access  Private (Admin/Manager only)
const convertAssessmentToLead = async (req, res) => {
  console.log('\n🔄 === CONVERT ASSESSMENT TO LEAD ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('👤 User:', req.user?.email, 'Role:', req.user?.role);
  console.log('🆔 Assessment ID:', req.params.id);
  
  try {
    // Find the profile assessment
    const assessment = await ProfileAssessment.findById(req.params.id);
    
    if (!assessment) {
      console.log('❌ Assessment not found');
      return res.status(404).json({
        success: false,
        error: {
          code: 'ASSESSMENT_NOT_FOUND',
          message: 'Profile assessment not found'
        }
      });
    }
    
    console.log('✅ Assessment found:', assessment.client_name, assessment.client_email);
    
    // Check if already converted
    if (assessment.status === 'Converted') {
      console.log('⚠️ Assessment already converted');
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_CONVERTED',
          message: 'This assessment has already been converted to a lead'
        }
      });
    }
    
    // Import Lead model
    const Lead = require('../models/Lead');
    
    // Check if lead already exists with this email
    const existingLead = await Lead.findOne({ email: assessment.client_email });
    if (existingLead) {
      console.log('⚠️ Lead already exists with this email');
      return res.status(400).json({
        success: false,
        error: {
          code: 'LEAD_EXISTS',
          message: 'A lead already exists with this email address'
        }
      });
    }
    
    // Calculate lead priority based on assessment score
    const totalScore = assessment.criterion_1_awards + assessment.criterion_2_memberships + 
                      assessment.criterion_3_media + assessment.criterion_4_judging + 
                      assessment.criterion_5_contributions + assessment.criterion_6_publications + 
                      assessment.criterion_7_exhibitions + assessment.criterion_8_leadership + 
                      assessment.criterion_9_salary + assessment.criterion_10_commercial;
    
    const overallScore = Math.round((totalScore / 30) * 100);
    
    let priority = 'low';
    if (overallScore >= 80) {
      priority = 'high';
    } else if (overallScore >= 60) {
      priority = 'medium';
    }
    
    console.log('📊 Assessment Score:', overallScore + '%', 'Priority:', priority);
    
    // Create new lead from assessment data
    const nameParts = assessment.client_name.trim().split(' ');
    const firstName = nameParts[0] || assessment.client_name;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown';
    
    const leadData = {
      firstName: firstName,
      lastName: lastName,
      email: assessment.client_email,
      phone: assessment.client_phone || '',
      source: 'profile_assessment',
      priority: priority,
      status: 'new',
      fieldOfExpertise: assessment.field_of_expertise,
      yearsOfExperience: assessment.years_of_experience,
      currentLocation: assessment.current_location,
      assessmentScore: overallScore,
      assessmentId: assessment._id,
      notes: `Converted from profile assessment. Score: ${overallScore}%. Strong criteria: ${assessment.strong_criteria_count || 0}`,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Create the lead
    const newLead = await Lead.create(leadData);
    console.log('✅ Lead created:', newLead._id);
    
    // Update assessment status
    assessment.status = 'Converted';
    assessment.converted_to_lead_id = newLead._id;
    assessment.converted_at = new Date();
    assessment.converted_by = req.user._id;
    await assessment.save();
    
    console.log('✅ Assessment updated to Converted status');
    
    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      resourceType: 'Lead',
      resourceId: newLead._id,
      description: `Converted assessment ${assessment._id} to lead ${newLead._id} for ${assessment.client_name}`,
      ipAddress: req.ip,
      timestamp: new Date()
    });
    
    console.log('✅ Activity logged');
    
    res.json({
      success: true,
      message: 'Profile assessment successfully converted to lead',
      data: {
        lead: newLead,
        assessment: assessment,
        conversion_details: {
          assessment_score: overallScore,
          priority_assigned: priority,
          converted_at: new Date(),
          converted_by: req.user.email
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Convert assessment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSION_FAILED',
        message: error.message
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
  convertAssessmentToLead,
  deleteProfileAssessment
};