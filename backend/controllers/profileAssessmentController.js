const ProfileAssessment = require('../models/ProfileAssessment');
const ActivityLog = require('../models/ActivityLog');
const clientService = require('../services/clientService');
const EncryptionManager = require('../utils/encryptionManager');
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
      service_interest,
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

    // Block duplicate profile assessments — one per email
    console.log('📊 === PROFILE ASSESSMENT DUPLICATE CHECK ===');
    console.log('📊 Checking for existing user with email:', client_email);
    const existingUser = await clientService.findUserByEmail(client_email.toLowerCase().trim());
    if (existingUser) {
      console.log('📊 ✅ Found existing user:', existingUser._id);
      const existingAssessment = await ProfileAssessment.findOne({ user_id: existingUser._id });
      if (existingAssessment) {
        console.log('📊 ❌ BLOCKING: Assessment already exists for this user');
        return res.status(409).json({
          success: false,
          error: {
            code: 'ASSESSMENT_EXISTS',
            message: 'A profile assessment already exists for this email address.'
          }
        });
      } else {
        console.log('📊 ✅ User exists but no assessment found - allowing submission');
      }
    } else {
      console.log('📊 ❌ No existing user found - will create new user');
    }

    // Use deferred encryption for the entire process
    const result = await EncryptionManager.bulkOperationWithDeferredEncryption(async () => {
      // Convert years_of_experience string ranges to numeric values
      let experienceYears = years_of_experience;
      if (typeof years_of_experience === 'string') {
        const experienceMap = {
          '0-2': 1,
          '3-5': 4,
          '6-10': 8,
          '11-15': 13,
          '16+': 20
        };
        experienceYears = experienceMap[years_of_experience] || years_of_experience;
      }

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
      const overallScore = Math.round((totalScore / 30) * 100);

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

      // Create assessment record (without encryption)
      const assessmentData = {
        client_name,
        client_email,
        client_phone,
        service_interest,
        field_of_expertise,
        years_of_experience: experienceYears,
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

      const assessment = new ProfileAssessment(assessmentData);
      const savedAssessment = await assessment.save();

      const documentsToEncrypt = [savedAssessment];

      // Auto-register client account (without encryption)
      let user = null;
      let client = null;
      try {
        const autoRegResult = await clientService.createOrGetClient({
          name: client_name,
          email: client_email,
          phone: client_phone,
          field_of_expertise,
          current_location
        }, 'profile_assessment');

        user = autoRegResult.user;
        client = autoRegResult.client;

        // Add to documents to encrypt - only newly created ones
        if (autoRegResult.isNewUser) {
          documentsToEncrypt.push(user);
        }
        if (autoRegResult.isNewClient) {
          documentsToEncrypt.push(client);
        }

        // Link assessment to user (without encryption)
        savedAssessment.user_id = user._id;
        savedAssessment.client_id = client._id;
        await savedAssessment.save();
        
      } catch (autoRegError) {
        console.error('⚠️ Auto-registration failed (non-critical):', autoRegError.message);
      }

      // Create activity log (without encryption)
      try {
        const activityLog = await ActivityLog.create({
          user: null,
          action: 'create',
          resourceType: 'ProfileAssessment',
          resourceId: savedAssessment._id,
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
        
        documentsToEncrypt.push(activityLog);
      } catch (logError) {
        console.log('⚠️ Activity log creation failed (non-critical):', logError.message);
      }

      return {
        assessment: savedAssessment,
        user,
        client,
        overallScore,
        profileStrength,
        criteriaMet,
        strongCount,
        moderateCount,
        documents: documentsToEncrypt
      };
    });

    // Return assessment results immediately (encryption happens in background)
    const responseData = {
      success: true,
      message: 'Profile assessment submitted successfully',
      data: {
        assessment_id: result.assessment._id,
        overall_score: result.overallScore,
        profile_strength: result.profileStrength,
        criteria_met: result.criteriaMet,
        strong_criteria_count: result.strongCount,
        moderate_criteria_count: result.moderateCount,
        eligibility_recommendation: result.assessment.eligibility_recommendation,
        submission_date: result.assessment.createdAt
      }
    };

    res.status(201).json(responseData);

  } catch (error) {
    console.error('💥 Profile Assessment Error:', error.message);
    
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
      } catch (logError) {
        console.error('💥 Failed to log error:', logError.message);
      }
    }

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
    
    // Find assessments by user_id (more reliable than encrypted email field)
    const assessments = await ProfileAssessment.find({ 
      user_id: req.client.id 
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
  console.log('\n🔄 ========== CONVERT ASSESSMENT TO LEAD START ==========');
  console.log('⏰ Start Time:', new Date().toISOString());
  console.log('👤 User:', req.user?.email, 'Role:', req.user?.role);
  console.log('🆔 Assessment ID:', req.params.id);
  
  try {
    console.log('🔍 Step 1: Finding assessment...');
    const startFind = Date.now();
    // Find the profile assessment
    const assessment = await ProfileAssessment.findById(req.params.id);
    console.log(`✅ Step 1 completed in ${Date.now() - startFind}ms`);
    
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
    
    console.log('🔍 Step 1.5: Decrypting assessment data...');
    const startDecrypt = Date.now();
    // Decrypt the assessment data before using it
    const encryption = require('../middleware/encryptionMiddleware');
    
    // Decrypt individual fields
    assessment.client_name = encryption.decrypt(assessment.client_name);
    assessment.client_email = encryption.decrypt(assessment.client_email);
    if (assessment.client_phone) {
      assessment.client_phone = encryption.decrypt(assessment.client_phone);
    }
    if (assessment.field_of_expertise) {
      assessment.field_of_expertise = encryption.decrypt(assessment.field_of_expertise);
    }
    if (assessment.current_location) {
      assessment.current_location = encryption.decrypt(assessment.current_location);
    }
    
    console.log(`✅ Step 1.5 completed in ${Date.now() - startDecrypt}ms`);
    console.log('✅ Assessment found (decrypted):', assessment.client_name, assessment.client_email);
    
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
    
    console.log('🔍 Step 2: Loading Lead model...');
    const startLoadModel = Date.now();
    // Import Lead model
    const Lead = require('../models/Lead');
    console.log(`✅ Step 2 completed in ${Date.now() - startLoadModel}ms`);
    
    console.log('🔍 Step 3: Checking for existing lead...');
    const startCheck = Date.now();
    // Check if lead already exists with this email
    const existingLead = await Lead.findOne({ email: assessment.client_email });
    console.log(`✅ Step 3 completed in ${Date.now() - startCheck}ms`);
    
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
    
    console.log('🔍 Step 4: Calculating priority...');
    const startCalc = Date.now();
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
    console.log(`✅ Step 4 completed in ${Date.now() - startCalc}ms`);
    console.log('📊 Assessment Score:', overallScore + '%', 'Priority:', priority);
    
    console.log('🔍 Step 5: Preparing lead data...');
    const startPrepare = Date.now();
    // Create new lead from assessment data
    const nameParts = assessment.client_name.trim().split(' ');
    const firstName = nameParts[0] || assessment.client_name;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown';
    
    const leadData = {
      firstName: firstName,
      lastName: lastName,
      email: assessment.client_email,
      phone: assessment.client_phone || '',
      source: 'assessment',
      priority: req.body.priority || priority,
      status: 'new',
      fieldOfExpertise: assessment.field_of_expertise,
      yearsOfExperience: assessment.years_of_experience,
      currentLocation: assessment.current_location,
      assessmentScore: overallScore,
      assessmentId: assessment._id,
      notes: req.body.notes || '',
      created_at: new Date(),
      updated_at: new Date()
    };
    console.log(`✅ Step 5 completed in ${Date.now() - startPrepare}ms`);
    
    console.log('🔍 Step 6: Creating lead...');
    const startCreate = Date.now();
    // Create the lead
    const newLead = await Lead.create(leadData);
    console.log(`✅ Step 6 completed in ${Date.now() - startCreate}ms`);
    console.log('✅ Lead created:', newLead._id);
    
    console.log('🔍 Step 7: Updating assessment...');
    const startUpdateAssessment = Date.now();
    // Update assessment status
    assessment.status = 'Converted';
    assessment.converted_to_lead_id = newLead._id;
    assessment.converted_at = new Date();
    assessment.converted_by = req.user._id;
    // Save with validation disabled to avoid enum validation on encrypted fields
    await assessment.save({ validateBeforeSave: false });
    console.log(`✅ Step 7 completed in ${Date.now() - startUpdateAssessment}ms`);
    console.log('✅ Assessment updated to Converted status');
    
    console.log('🔍 Step 8: Logging activity...');
    const startLog = Date.now();
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
    console.log(`✅ Step 8 completed in ${Date.now() - startLog}ms`);
    console.log('✅ Activity logged');
    
    console.log('🎉 ========== CONVERT ASSESSMENT TO LEAD SUCCESS ==========');
    console.log('⏰ Total Time:', Date.now() - startFind, 'ms');
    
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
    console.error('❌ ========== CONVERT ASSESSMENT TO LEAD ERROR ==========');
    console.error('❌ Error Type:', error.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Error Stack:', error.stack);
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

// @desc    Get Profile Assessment by Email (Public - for download button)
// @route   POST /api/profile-assessments/by-email
// @access  Public
const getAssessmentByEmail = async (req, res) => {
  try {
    const { email, assessmentId } = req.body;
    
    console.log('📋 === GET ASSESSMENT BY EMAIL ===');
    console.log('📋 Email:', email);
    console.log('📋 Assessment ID:', assessmentId);
    
    if (!email || !assessmentId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email and assessment ID are required'
        }
      });
    }

    // Find the assessment by ID only (email is encrypted, so we can't query by it reliably)
    const assessment = await ProfileAssessment.findById(assessmentId)
      .select('-ip_address -user_agent');

    if (!assessment) {
      console.log('❌ Assessment not found');
      return res.status(404).json({
        success: false,
        error: {
          code: 'ASSESSMENT_NOT_FOUND',
          message: 'Assessment not found'
        }
      });
    }

    console.log('✅ Assessment found:', assessment._id);

    res.json({
      success: true,
      data: assessment
    });

  } catch (error) {
    console.error('❌ Get Assessment By Email Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to retrieve assessment'
      }
    });
  }
};

module.exports = {
  submitProfileAssessment,
  getProfileAssessment,
  getAllProfileAssessments,
  getClientAssessments,
  getAssessmentByEmail,
  updateAssessmentStatus,
  convertAssessmentToLead,
  deleteProfileAssessment
};