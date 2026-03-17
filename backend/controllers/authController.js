const jwt = require('jsonwebtoken');
const User = require('../models/User');
const clientService = require('../services/clientService');

// Credential strength verification utility
const verifyCredentialStrength = (credential, emailAddr, givenName, familyName) => {
  // Enforce minimum length requirement
  if (credential.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  // Require uppercase character presence
  if (!/[A-Z]/.test(credential)) {
    return { isValid: false, message: 'Password must contain at least 1 uppercase letter' };
  }

  // Require lowercase character presence
  if (!/[a-z]/.test(credential)) {
    return { isValid: false, message: 'Password must contain at least 1 lowercase letter' };
  }

  // Require numeric character presence
  if (!/\d/.test(credential)) {
    return { isValid: false, message: 'Password must contain at least 1 number' };
  }

  // Require special character presence (@#$%!)
  if (!/[@#$%!]/.test(credential)) {
    return { isValid: false, message: 'Password must contain at least 1 special character (@#$%!)' };
  }

  // Prohibit whitespace characters
  if (/\s/.test(credential)) {
    return { isValid: false, message: 'Password cannot contain spaces' };
  }

  // Prevent personal information inclusion
  const normalizedCredential = credential.toLowerCase();
  const normalizedEmail = emailAddr.toLowerCase();
  const normalizedGivenName = givenName ? givenName.toLowerCase() : '';
  const normalizedFamilyName = familyName ? familyName.toLowerCase() : '';

  if (normalizedCredential.includes(normalizedEmail.split('@')[0]) || 
      (normalizedGivenName && normalizedCredential.includes(normalizedGivenName)) ||
      (normalizedFamilyName && normalizedCredential.includes(normalizedFamilyName))) {
    return { isValid: false, message: 'Password cannot contain your email or name' };
  }

  return { isValid: true, message: 'Password is valid' };
};

// Create authentication token
const createAuthToken = (accountId, accountRole) => {
  return jwt.sign(
    { user_id: accountId, role: accountRole },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// @desc    Register new client user (public registration)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone, company, country, terms_accepted } = req.body;

    // Verify mandatory input fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'First name, last name, email, and password are required'
        }
      });
    }

    // Confirm terms agreement
    if (!terms_accepted) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TERMS_NOT_ACCEPTED',
          message: 'You must accept the terms and conditions to register'
        }
      });
    }

    // Verify name format - prohibit numeric characters
    if (/\d/.test(first_name)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_NAME',
          message: 'First name cannot contain numbers'
        }
      });
    }

    if (/\d/.test(last_name)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_NAME',
          message: 'Last name cannot contain numbers'
        }
      });
    }

    // Verify organization format - prohibit numeric characters
    if (company && /\d/.test(company)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_COMPANY',
          message: 'Company/Organization name cannot contain numbers'
        }
      });
    }

    // Verify email address format
    const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address'
        }
      });
    }

    // Verify credential strength requirements
    const credentialCheck = verifyCredentialStrength(password, email, first_name, last_name);
    if (!credentialCheck.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: credentialCheck.message
        }
      });
    }

    // Verify account uniqueness
    const duplicateAccount = await clientService.findUserByEmail(email);
    if (duplicateAccount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }

    // Initialize client account with restricted permissions
    const newAccount = await User.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'client', // Enforce client role for public registration
      phone: phone?.trim(),
      company: company?.trim(),
      country: country?.trim(),
      terms_accepted: true,
      terms_accepted_at: new Date()
    });

    // Initialize corresponding CRM customer record
    try {
      const Client = require('../models/Client');
      const customerRecord = await Client.create({
        name: `${first_name.trim()} ${last_name.trim()}`,
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        university: company?.trim(),
        status: 'active',
        user_id: newAccount._id,
        tags: ['self_registered'],
        created_at: new Date()
      });
      
      console.log(`✅ Customer record initialized: ${email} (ID: ${customerRecord._id})`);
    } catch (customerError) {
      console.error('⚠️ Customer record initialization failed:', customerError);
    }

    // Issue authentication token
    const authToken = createAuthToken(newAccount._id, newAccount.role);

    res.status(201).json({
      success: true,
      message: 'Client account registered successfully',
      data: newAccount.toAuthJSON(),
      token: authToken,
      expires_in: 86400
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Login client user (public login) - Step 2: Password entry/setup
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, isPasswordSetup } = req.body;

    // Verify input presence
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Please provide email and password'
        }
      });
    }

    // Verify email format structure
    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address'
        }
      });
    }

    // Locate account by email address
    const foundAccount = await clientService.findUserByEmail(email);
    
    if (!foundAccount) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email address'
        }
      });
    }
    
    // Retrieve credentials separately
    const accountWithCredentials = await User.findById(foundAccount._id).select('+password');

    // Log raw database information
    console.log('🔐 Client authentication - Raw account data from DB:');
    console.log('  - role:', accountWithCredentials.role);
    console.log('  - email:', accountWithCredentials.email);
    console.log('  - first_name:', accountWithCredentials.first_name);
    
    // Decrypt complete account object
    const encryption = require('../middleware/encryptionMiddleware');
    const decryptedAccount = encryption.decryptDocument(accountWithCredentials.toObject());
    
    // Extract role and state from decrypted information
    const accountRole = decryptedAccount.role;
    const accountState = decryptedAccount.status;
    
    console.log('🔐 Client authentication - After decryption:');
    console.log('  - role:', accountRole, 'Type:', typeof accountRole);
    console.log('  - status:', accountState);
    console.log('  - email:', decryptedAccount.email);
    console.log('  - first_name:', decryptedAccount.first_name);
    
    // Restrict access to client accounts only
    if (accountRole !== 'client') {
      console.log('🔐 Client authentication - Access denied for role:', accountRole);
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'This login is for clients only. Managers should use the manager login.'
        }
      });
    }

    // Verify account is in active state
    if (accountState !== 'active') {
      console.log('🔐 Client authentication - Account inactive, status:', accountState);
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Your account is inactive. Please contact support.'
        }
      });
    }

    // Handle credential initialization requirement
    if (accountWithCredentials.is_temp_password || !accountWithCredentials.password) {
      if (!isPasswordSetup) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PASSWORD_SETUP_REQUIRED',
            message: 'Password setup is required for this account'
          }
        });
      }

      // Retrieve decrypted account information for validation
      const encryption = require('../middleware/encryptionMiddleware');
      const decryptedAccount = encryption.decryptDocument(accountWithCredentials.toObject());
      
      console.log('🔐 Credential setup - Decrypted first_name:', decryptedAccount.first_name);
      console.log('🔐 Credential setup - Decrypted last_name:', decryptedAccount.last_name);
      
      // Verify new credential strength
      const credentialCheck = verifyCredentialStrength(
        password, 
        email, 
        decryptedAccount.first_name, 
        decryptedAccount.last_name
      );
      
      if (!credentialCheck.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: credentialCheck.message
          }
        });
      }

      // Initialize new credential
      accountWithCredentials.password = password;
      accountWithCredentials.is_temp_password = false;
      accountWithCredentials.email_verified = true;
      accountWithCredentials.last_login = new Date();
      
      // Save without modifying encrypted fields (role and status remain encrypted)
      await accountWithCredentials.save();

      // Issue authentication token
      const authToken = createAuthToken(accountWithCredentials._id, decryptedAccount.role);

      return res.json({
        success: true,
        message: 'Password set successfully and logged in',
        isNewPassword: true,
        data: {
          ...accountWithCredentials.toAuthJSON(),
          redirectTo: '/dashboard/client'
        },
        token: authToken,
        expires_in: 86400
      });
    }

    // Verify existing credential
    const credentialMatches = await accountWithCredentials.comparePassword(password);
    
    if (!credentialMatches) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Update last authentication timestamp
    accountWithCredentials.last_login = new Date();
    
    // Save without modifying encrypted fields (role and status remain encrypted)
    await accountWithCredentials.save();

    // Issue authentication token
    const authToken = createAuthToken(accountWithCredentials._id, decryptedAccount.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        ...accountWithCredentials.toAuthJSON(),
        redirectTo: '/dashboard/client'
      },
      token: authToken,
      expires_in: 86400
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Login manager user (admin/CRM/lead managers)
// @route   POST /api/auth/manager
// @access  Public (but restricted to manager roles)
exports.managerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verify input presence
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Please provide email and password'
        }
      });
    }

    // Verify email format structure
    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address'
        }
      });
    }

    // Locate account with credentials
    const allAccounts = await User.find({}).select('+password');
    const foundAccount = allAccounts.find(acc => acc.email === email.toLowerCase());
    
    if (!foundAccount) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Restrict to supervisor roles only
    const supervisorRoles = ['admin', 'lead_manager', 'crm_manager', 'project_manager', 'employee'];
    if (!supervisorRoles.includes(foundAccount.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'This login is for managers only. Clients should use the regular login.'
        }
      });
    }

    // Verify account is in active state
    if (foundAccount.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Your account is inactive. Please contact support.'
        }
      });
    }

    // Verify credential match
    const credentialMatches = await foundAccount.comparePassword(password);
    
    if (!credentialMatches) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Update last authentication timestamp
    foundAccount.last_login = new Date();
    await foundAccount.save();

    // Issue authentication token
    const authToken = createAuthToken(foundAccount._id, foundAccount.role);

    // Retrieve decrypted account information
    const accountPayload = foundAccount.toAuthJSON();
    const accountRole = accountPayload.role;
    console.log('🔐 Backend - Decrypted account role:', accountRole);
    console.log('🔐 Backend - account role type:', typeof accountRole);
    
    // Determine navigation path based on role
    let navigationPath = '/';
    switch (accountRole) {
      case 'admin':
        console.log('🔐 Backend - Matched admin case');
        navigationPath = '/dashboard/admin';
        break;
      case 'lead_manager':
        console.log('🔐 Backend - Matched lead_manager case');
        navigationPath = '/dashboard/lead-manager';
        break;
      case 'crm_manager':
        console.log('🔐 Backend - Matched crm_manager case');
        navigationPath = '/dashboard/crm-manager';
        break;
      case 'project_manager':
        console.log('🔐 Backend - Matched project_manager case');
        navigationPath = '/dashboard/project-manager';
        break;
      case 'employee':
        console.log('🔐 Backend - Matched employee case');
        navigationPath = '/dashboard/employee';
        break;
      default:
        console.log('🔐 Backend - No match, using default redirect');
        navigationPath = '/';
    }
    console.log('🔐 Backend - Final redirect path:', navigationPath);

    const responsePayload = {
      ...accountPayload,
      redirectTo: navigationPath
    };
    console.log('🔐 Backend - Response data redirectTo:', responsePayload.redirectTo);

    res.json({
      success: true,
      message: `${accountRole.replace('_', ' ')} login successful`,
      data: responsePayload,
      token: authToken,
      expires_in: 86400
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'MANAGER_LOGIN_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const accountRecord = await User.findById(req.user.user_id);
    
    if (!accountRecord) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: accountRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    // Locate account with credentials
    const accountRecord = await User.findById(req.user.user_id).select('+password');
    
    if (!accountRecord) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Verify current credential
    const credentialMatches = await accountRecord.comparePassword(current_password);
    
    if (!credentialMatches) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password is incorrect'
        }
      });
    }

    // Update credential
    accountRecord.password = new_password;
    await accountRecord.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'PASSWORD_CHANGE_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Verify email and setup password
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmailAndSetupPassword = async (req, res) => {
  try {
    const { email, token, password, confirm_password } = req.body;

    // Validate input
    if (!email || !token || !password || !confirm_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'All fields are required'
        }
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_MISMATCH',
          message: 'Passwords do not match'
        }
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password, email, '', '');
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: passwordValidation.message
        }
      });
    }

    // Verify email and setup password
    const user = await clientService.verifyEmailAndSetupPassword(email, token, password);

    // Generate token for immediate login
    const authToken = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Email verified and password set successfully',
      data: user.toAuthJSON(),
      token: authToken,
      expires_in: 86400
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VERIFICATION_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'Email is required'
        }
      });
    }

    const result = await clientService.requestPasswordReset(email);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'RESET_REQUEST_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, password, confirm_password } = req.body;

    // Validate input
    if (!email || !token || !password || !confirm_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'All fields are required'
        }
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_MISMATCH',
          message: 'Passwords do not match'
        }
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password, email, '', '');
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: passwordValidation.message
        }
      });
    }

    // Reset password
    const user = await clientService.resetPassword(email, token, password);

    // Generate token for immediate login
    const authToken = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: user.toAuthJSON(),
      token: authToken,
      expires_in: 86400
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'RESET_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { 
      first_name, 
      last_name, 
      phone, 
      company, 
      country, 
      university,
      linkedin_url,
      portfolio_url,
      website_url,
      bio
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'First name and last name are required'
        }
      });
    }

    // Handle profile picture from file upload
    let profile_picture = null;
    if (req.file) {
      // File was uploaded via multer
      profile_picture = `/uploads/profile-pictures/${req.file.filename}`;
    }

    // Update profile with all fields
    const { user, client } = await clientService.updateProfile(req.user.user_id, {
      first_name,
      last_name,
      phone,
      company,
      country,
      university,
      profile_picture,
      linkedin_url,
      portfolio_url,
      website_url,
      bio
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toAuthJSON(),
        client
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_UPDATE_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Check if email already exists (for profile assessment)
// @route   POST /api/auth/check-email
// @access  Public
exports.checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'Email is required'
        }
      });
    }

    // Verify email format structure
    const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailPattern.test(email)) {
      return res.json({
        success: true,
        exists: false,
        hasAssessment: false
      });
    }

    const foundAccount = await clientService.findUserByEmail(email);
    
    if (!foundAccount) {
      return res.json({
        success: true,
        exists: false,
        hasAssessment: false
      });
    }

    // Check if user has any profile assessments
    const ProfileAssessment = require('../models/ProfileAssessment');
    
    console.log('🔍 Searching for assessments for user:', foundAccount._id, 'email:', email);
    
    // Try to find by user_id first, then fallback to email
    let assessments = await ProfileAssessment.find({ 
      user_id: foundAccount._id 
    })
    .sort({ createdAt: -1 })
    .limit(1)
    .select('_id client_name client_email client_phone overall_score profile_strength criteria_met createdAt');

    console.log('📊 Assessments found by user_id:', assessments.length);

    // If no assessment found by user_id, try searching by email (for assessments created before user linking)
    if (assessments.length === 0) {
      console.log('🔍 Trying to find by email...');
      // Get all assessments and check email after decryption
      const allAssessments = await ProfileAssessment.find({})
        .sort({ createdAt: -1 })
        .select('_id client_name client_email client_phone overall_score profile_strength criteria_met createdAt user_id');
      
      const encryption = require('../middleware/encryptionMiddleware');
      
      // Find assessment with matching email
      for (const assessment of allAssessments) {
        const decrypted = encryption.decryptDocument(assessment.toObject());
        if (decrypted.client_email && decrypted.client_email.toLowerCase() === email.toLowerCase()) {
          assessments = [assessment];
          console.log('✅ Found assessment by email:', assessment._id);
          break;
        }
      }
    }

    const hasAssessment = assessments.length > 0;
    const latestAssessment = hasAssessment ? assessments[0] : null;
    
    console.log('📊 Final result - hasAssessment:', hasAssessment);
    
    // Decrypt the assessment data if found
    let assessmentData = null;
    if (latestAssessment) {
      const encryption = require('../middleware/encryptionMiddleware');
      const decryptedAssessment = encryption.decryptDocument(latestAssessment.toObject());
      
      assessmentData = {
        id: decryptedAssessment._id,
        client_name: decryptedAssessment.client_name,
        client_email: decryptedAssessment.client_email,
        client_phone: decryptedAssessment.client_phone,
        overall_score: decryptedAssessment.overall_score,
        profile_strength: decryptedAssessment.profile_strength,
        criteria_met: decryptedAssessment.criteria_met,
        createdAt: decryptedAssessment.createdAt
      };
      
      console.log('✅ Returning assessment data:', assessmentData);
    }
    
    res.json({
      success: true,
      exists: true,
      hasAssessment,
      assessment: assessmentData
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CHECK_EMAIL_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Check if user exists and has password
// @route   POST /api/auth/check-user
// @access  Public
exports.checkUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'Email is required'
        }
      });
    }

    // Verify email format structure
    const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address'
        }
      });
    }

    const foundAccount = await clientService.findUserByEmail(email);
    
    if (!foundAccount) {
      return res.json({
        success: true,
        exists: false,
        hasPassword: false,
        needsPasswordSetup: false,
        role: null
      });
    }

    // Retrieve credential status separately
    const accountWithCredentials = await User.findById(foundAccount._id).select('+password');

    // Decrypt account information before returning
    const encryption = require('../middleware/encryptionMiddleware');
    const decryptedAccount = encryption.decryptDocument(accountWithCredentials.toObject());
    
    console.log('🔐 checkUser - Decrypted first_name:', decryptedAccount.first_name);
    console.log('🔐 checkUser - Decrypted last_name:', decryptedAccount.last_name);
    console.log('🔐 checkUser - Role:', decryptedAccount.role);

    // Verify credential status
    const hasRealCredential = accountWithCredentials.password && !accountWithCredentials.is_temp_password;
    
    res.json({
      success: true,
      exists: true,
      hasPassword: hasRealCredential,
      needsPasswordSetup: accountWithCredentials.is_temp_password || !accountWithCredentials.password,
      role: decryptedAccount.role,
      first_name: decryptedAccount.first_name,
      last_name: decryptedAccount.last_name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CHECK_USER_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Setup password for new or existing user without password
// @route   POST /api/auth/setup-password
// @access  Public
exports.setupPassword = async (req, res) => {
  try {
    const { email, password, isNewUser } = req.body;

    // Verify input presence
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email and password are required'
        }
      });
    }

    // Verify email format structure
    const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address'
        }
      });
    }

    let accountRecord;

    if (isNewUser) {
      // Initialize new account
      const emailUsername = email.split('@')[0];
      const nameParts = emailUsername.split(/[._-]/);
      const givenName = nameParts[0] || 'User';
      const familyName = nameParts[1] || '';

      // Verify credential strength
      const credentialCheck = verifyCredentialStrength(password, email, givenName, familyName);
      if (!credentialCheck.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: credentialCheck.message
          }
        });
      }

      // Verify account uniqueness
      const duplicateAccount = await clientService.findUserByEmail(email);
      if (duplicateAccount) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists'
          }
        });
      }

      // Initialize new account
      accountRecord = await User.create({
        first_name: givenName,
        last_name: familyName,
        email: email.toLowerCase().trim(),
        password,
        role: 'client',
        is_temp_password: false,
        status: 'active'
      });
    } else {
      // Update existing account credential
      accountRecord = await clientService.findUserByEmail(email);
      
      if (!accountRecord) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Verify credential strength
      const credentialCheck = verifyCredentialStrength(password, email, accountRecord.first_name, accountRecord.last_name);
      if (!credentialCheck.isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: credentialCheck.message
          }
        });
      }

      // Update credential
      accountRecord.password = password;
      accountRecord.is_temp_password = false;
      await accountRecord.save();
    }

    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Password set successfully',
      data: {
        user: accountRecord.toAuthJSON(),
        isNewUser
      }
    });
  } catch (error) {
    console.error('Setup password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SETUP_PASSWORD_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Email-only login/account creation for form submissions
// @route   POST /api/auth/email-login
// @access  Public
exports.emailLogin = async (req, res) => {
  try {
    const { email, formData, source } = req.body;

    // Verify input presence
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'Email is required'
        }
      });
    }

    // Verify email format structure
    const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address'
        }
      });
    }

    // Initialize or retrieve customer record
    const operationResult = await clientService.createOrGetClient(formData, source);
    const { user, client, isNewUser } = operationResult;

    // Issue authentication token for immediate access
    const authToken = createAuthToken(user._id, user.role);

    // Update last authentication timestamp
    user.last_login = new Date();
    await user.save();

    res.json({
      success: true,
      message: isNewUser ? 'Account created and logged in successfully' : 'Logged in successfully',
      data: {
        user: user.toAuthJSON(),
        client,
        isNewUser,
        needsPasswordSetup: user.is_temp_password,
        redirectTo: '/dashboard/client'
      },
      token: authToken,
      expires_in: 86400
    });
  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_LOGIN_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: user.toAuthJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_PROFILE_FAILED',
        message: error.message
      }
    });
  }
};

// Duplicate updateProfile removed - using the comprehensive one above at line 751

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Update last logout time
    const user = await User.findById(req.user.user_id);
    if (user) {
      user.last_logout = new Date();
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Change password (enhanced version)
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePasswordEnhanced = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    // Validate input
    if (!new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'New password and confirmation are required'
        }
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_MISMATCH',
          message: 'New passwords do not match'
        }
      });
    }

    // Validate password strength - get user email for validation
    const user = await User.findById(req.user.user_id);
    const passwordValidation = verifyCredentialStrength(new_password, user.email, user.first_name, user.last_name);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: passwordValidation.message
        }
      });
    }

    // Change password
    await clientService.changePassword(req.user.user_id, current_password, new_password);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'PASSWORD_CHANGE_FAILED',
        message: error.message
      }
    });
  }
};