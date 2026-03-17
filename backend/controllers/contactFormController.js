const ContactForm = require('../models/ContactForm');
const ActivityLog = require('../models/ActivityLog');
const clientService = require('../services/clientService');
const EncryptionManager = require('../utils/encryptionManager');
const { validationResult } = require('express-validator');

/**
 * Contact Form Controller
 * Handles contact form submissions with comprehensive security and lead management
 */

// @desc    Submit Contact Form
// @route   POST /api/contact
// @access  Public (with rate limiting and validation)
const submitContactForm = async (req, res) => {
  console.log('\n📧 === CONTACT FORM SUBMISSION STARTED ===');
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
      name,
      email,
      phone,
      visa_type,
      message,
      utm_source,
      utm_medium,
      utm_campaign,
      referrer_url
    } = req.body;

    console.log('📊 Step 2: Processing form data...');
    console.log('📊 Contact Info:', {
      name: name,
      email: email,
      phone: phone || 'Not provided',
      visa_type: visa_type,
      message_length: message ? message.length : 0,
      utm_source: utm_source || 'Not provided',
      utm_medium: utm_medium || 'Not provided'
    });

    // Use deferred encryption for the entire process
    const result = await EncryptionManager.bulkOperationWithDeferredEncryption(async () => {
      // Check for duplicate recent submissions (prevent spam)
      console.log('🔍 Step 3: Checking for duplicate submissions...');
      const recentSubmission = await ContactForm.findOne({
        email: email.toLowerCase(),
        createdAt: { $gte: new Date(Date.now() - 1 * 60 * 1000) } // Last 1 minute (for testing)
      });

      if (recentSubmission) {
        console.log('⚠️ DUPLICATE SUBMISSION DETECTED:');
        console.log('⚠️ Recent submission found for email:', email);
        console.log('⚠️ Previous submission time:', recentSubmission.createdAt);
        return { error: 'DUPLICATE_SUBMISSION' };
      }
      console.log('✅ No duplicate submissions found');

      // Create contact form submission (without encryption)
      console.log('💾 Step 4: Creating database record...');
      const contactSubmissionData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        visa_type,
        message: message.trim(),
        utm_source: utm_source?.trim(),
        utm_medium: utm_medium?.trim(),
        utm_campaign: utm_campaign?.trim(),
        referrer_url: referrer_url?.trim(),
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        source: 'website_contact'
      };

      const contactSubmission = new ContactForm(contactSubmissionData);
      const savedContactSubmission = await contactSubmission.save();
      console.log('✅ DATABASE SAVE SUCCESSFUL!');
      console.log('✅ Contact Submission ID:', savedContactSubmission._id);

      const documentsToEncrypt = [savedContactSubmission];

      // Auto-register client account (without encryption)
      console.log('🔄 Step 5: Auto-registering client account...');
      try {
        const autoRegResult = await clientService.createOrGetClient({
          name,
          email,
          phone,
          company: '',
          current_location: ''
        }, 'contact_form');

        const { user, client, isNewUser, isNewClient } = autoRegResult;
        console.log(`✅ Client ${isNewUser ? 'created' : 'found'}:`, user.email);
        
        // Add to documents to encrypt - only newly created ones
        if (isNewUser) {
          documentsToEncrypt.push(user);
        }
        if (isNewClient) {
          documentsToEncrypt.push(client);
        }
        
        // Link contact form to user (without encryption)
        savedContactSubmission.user_id = user._id;
        savedContactSubmission.client_id = client._id;
        await savedContactSubmission.save();
        
      } catch (autoRegError) {
        console.error('⚠️ Auto-registration failed (non-critical):', autoRegError.message);
      }

      // Log activity for security audit (without encryption)
      console.log('📝 Step 7: Creating activity log...');
      try {
        const activityLog = await ActivityLog.create({
          user: null, // Anonymous submission
          action: 'create',
          resourceType: 'ContactForm',
          resourceId: savedContactSubmission._id,
          description: `Contact form submitted by ${email}`,
          metadata: {
            email,
            visa_type,
            inquiry_type: savedContactSubmission.inquiry_type,
            priority: savedContactSubmission.priority,
            message_length: message.length,
            utm_source,
            utm_medium
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        documentsToEncrypt.push(activityLog);
        console.log('✅ Activity log created successfully');
      } catch (logError) {
        console.log('⚠️ Activity log creation failed (non-critical):', logError.message);
      }

      return {
        contactSubmission: savedContactSubmission,
        documents: documentsToEncrypt
      };
    });

    // Handle duplicate submission error
    if (result.error === 'DUPLICATE_SUBMISSION') {
      return res.status(429).json({
        success: false,
        error: {
          code: 'DUPLICATE_SUBMISSION',
          message: 'You have already submitted a contact form in the last 6 hours. We will respond to your inquiry soon.'
        }
      });
    }

    // Verify the save by counting documents
    console.log('🔍 Step 6: Verifying database storage...');
    const totalContactForms = await ContactForm.countDocuments();
    console.log('📊 Total contact forms in database:', totalContactForms);

    // Return success response (excluding sensitive data) - encryption happens in background
    console.log('📤 Step 8: Sending response to client...');
    const responseData = {
      success: true,
      message: 'Thank you for contacting us! We will respond to your inquiry within 24-48 hours.',
      data: {
        submission_id: result.contactSubmission._id,
        name: result.contactSubmission.name,
        email: result.contactSubmission.email,
        visa_type: result.contactSubmission.visa_type_display,
        inquiry_type: result.contactSubmission.inquiry_type,
        priority: result.contactSubmission.priority,
        status: result.contactSubmission.status,
        submission_date: result.contactSubmission.createdAt,
        reference_number: `CNT-${result.contactSubmission._id.toString().slice(-8).toUpperCase()}`,
        response_deadline: result.contactSubmission.response_deadline
      }
    };

    console.log('📤 Response data:', responseData);
    res.status(201).json(responseData);

    console.log('🎉 === CONTACT FORM SUBMISSION COMPLETED SUCCESSFULLY ===');
    console.log('🎉 Summary:');
    console.log('  - Client:', name, '(' + email + ')');
    console.log('  - Visa Type:', visa_type);
    console.log('  - Inquiry Type:', result.contactSubmission.inquiry_type);
    console.log('  - Priority:', result.contactSubmission.priority);
    console.log('  - Database ID:', result.contactSubmission._id);
    console.log('  - Reference:', `CNT-${result.contactSubmission._id.toString().slice(-8).toUpperCase()}`);
    console.log('  - Total Contact Forms:', totalContactForms);
    console.log('🎉 ===============================================\n');

  } catch (error) {
    console.error('💥 === CONTACT FORM SUBMISSION ERROR ===');
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
    if (req.body?.email) {
      try {
        await ActivityLog.create({
          user: null,
          action: 'other',
          resourceType: 'System',
          description: `Contact form submission failed for ${req.body.email}`,
          metadata: { 
            error: error.message,
            errorType: error.name,
            clientEmail: req.body.email
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
        message: 'Failed to submit contact form. Please try again or contact us directly.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

// @desc    Get Contact Form by ID
// @route   GET /api/contact/:id
// @access  Private (Admin/Manager only)
const getContactForm = async (req, res) => {
  try {
    const contactForm = await ContactForm.findById(req.params.id)
      .populate('assigned_to', 'first_name last_name email')
      .populate('converted_to_lead', 'name email status')
      .populate('converted_to_client', 'name email status');
    
    if (!contactForm) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact form submission not found'
        }
      });
    }

    // Log access for audit
    await ActivityLog.create({
      user: req.user._id,
      action: 'view',
      resourceType: 'ContactForm',
      resourceId: contactForm._id,
      description: `Contact form viewed by ${req.user.email}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: contactForm
    });

  } catch (error) {
    console.error('Get Contact Form Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to retrieve contact form'
      }
    });
  }
};

// @desc    Get All Contact Forms (with pagination and filtering)
// @route   GET /api/contact
// @access  Private (Admin/Manager only)
const getAllContactForms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.visa_type) filter.visa_type = req.query.visa_type;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.inquiry_type) filter.inquiry_type = req.query.inquiry_type;
    if (req.query.assigned_to) filter.assigned_to = req.query.assigned_to;
    if (req.query.response_required) filter.response_required = req.query.response_required === 'true';

    // Date range filter
    if (req.query.start_date || req.query.end_date) {
      filter.createdAt = {};
      if (req.query.start_date) filter.createdAt.$gte = new Date(req.query.start_date);
      if (req.query.end_date) filter.createdAt.$lte = new Date(req.query.end_date);
    }

    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Get contact forms with pagination
    const contactForms = await ContactForm.find(filter)
      .populate('assigned_to', 'first_name last_name email')
      .populate('converted_to_lead', 'name email status')
      .populate('converted_to_client', 'name email status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-ip_address -user_agent'); // Exclude sensitive data

    const total = await ContactForm.countDocuments(filter);

    // Get statistics
    const stats = await ContactForm.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          in_progress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          overdue: { 
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $eq: ['$responded_at', null] },
                    { $lt: ['$response_deadline', new Date()] }
                  ]
                }, 
                1, 
                0
              ] 
            } 
          }
        }
      }
    ]);

    // Log access
    await ActivityLog.create({
      user: req.user._id,
      action: 'view',
      resourceType: 'ContactForm',
      description: `Contact forms list viewed by ${req.user.email}`,
      metadata: { page, limit, total, filter },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        contact_forms: contactForms,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_records: total,
          per_page: limit
        },
        statistics: stats[0] || {
          total: 0,
          new: 0,
          in_progress: 0,
          resolved: 0,
          overdue: 0
        }
      }
    });

  } catch (error) {
    console.error('Get All Contact Forms Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to retrieve contact forms'
      }
    });
  }
};

// @desc    Update Contact Form Status
// @route   PUT /api/contact/:id/status
// @access  Private (Admin/Manager only)
const updateContactFormStatus = async (req, res) => {
  try {
    const { status, assigned_to, internal_notes, priority } = req.body;
    
    const contactForm = await ContactForm.findById(req.params.id);
    if (!contactForm) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact form submission not found'
        }
      });
    }

    const oldStatus = contactForm.status;
    contactForm.status = status;
    if (assigned_to) contactForm.assigned_to = assigned_to;
    if (internal_notes) contactForm.internal_notes = internal_notes;
    if (priority) contactForm.priority = priority;

    await contactForm.save();

    // Log status change
    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      resourceType: 'ContactForm',
      resourceId: contactForm._id,
      description: `Contact form status changed from ${oldStatus} to ${status}`,
      metadata: { 
        old_status: oldStatus, 
        new_status: status, 
        assigned_to,
        priority 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Contact form status updated successfully',
      data: contactForm
    });

  } catch (error) {
    console.error('Update Contact Form Status Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update contact form status'
      }
    });
  }
};

// @desc    Respond to Contact Form
// @route   POST /api/contact/:id/respond
// @access  Private (Admin/Manager only)
const respondToContactForm = async (req, res) => {
  try {
    const { response_message } = req.body;
    
    if (!response_message || response_message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Response message is required'
        }
      });
    }

    const contactForm = await ContactForm.findById(req.params.id);
    if (!contactForm) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact form submission not found'
        }
      });
    }

    // Use the model method to respond
    await contactForm.respond(response_message.trim(), req.user._id);

    // Log response
    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      resourceType: 'ContactForm',
      resourceId: contactForm._id,
      description: `Response sent to contact form inquiry`,
      metadata: { 
        response_length: response_message.length,
        client_email: contactForm.email
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: contactForm
    });

  } catch (error) {
    console.error('Respond to Contact Form Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESPONSE_ERROR',
        message: 'Failed to send response'
      }
    });
  }
};

// @desc    Add Communication to Contact Form
// @route   POST /api/contact/:id/communications
// @access  Private (Admin/Manager only)
const addCommunication = async (req, res) => {
  try {
    const { type, message, direction } = req.body;
    
    const contactForm = await ContactForm.findById(req.params.id);
    if (!contactForm) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact form submission not found'
        }
      });
    }

    // Use the model method to add communication
    await contactForm.addCommunication(type, message, req.user._id, direction);

    // Log communication
    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      resourceType: 'ContactForm',
      resourceId: contactForm._id,
      description: `Communication added: ${type} - ${direction}`,
      metadata: { type, direction, message_length: message.length },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Communication added successfully',
      data: contactForm
    });

  } catch (error) {
    console.error('Add Communication Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMUNICATION_ERROR',
        message: 'Failed to add communication'
      }
    });
  }
};

// @desc    Convert Contact Form to Lead
// @route   POST /api/contact/:id/convert-to-lead
// @access  Private (Admin/Manager only)
const convertToLead = async (req, res) => {
  console.log('\n🔄 ========== CONVERT CONTACT TO LEAD START ==========');
  console.log('⏰ Start Time:', new Date().toISOString());
  console.log('👤 User:', req.user?.email, 'Role:', req.user?.role);
  console.log('🆔 Contact ID:', req.params.id);
  console.log('📝 Request Body:', req.body);
  
  try {
    const { service_interest, priority, assigned_to, notes } = req.body;
    
    console.log('🔍 Step 1: Finding contact form...');
    const startFind = Date.now();
    const contactForm = await ContactForm.findById(req.params.id);
    console.log(`✅ Step 1 completed in ${Date.now() - startFind}ms`);
    
    if (!contactForm) {
      console.log('❌ Contact form not found');
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact form submission not found'
        }
      });
    }
    
    console.log('🔍 Step 1.5: Decrypting contact form data...');
    const startDecrypt = Date.now();
    // Decrypt the contact form data before using it
    const encryption = require('../middleware/encryptionMiddleware');
    
    // Decrypt individual fields
    contactForm.name = encryption.decrypt(contactForm.name);
    contactForm.email = encryption.decrypt(contactForm.email);
    if (contactForm.phone) {
      contactForm.phone = encryption.decrypt(contactForm.phone);
    }
    if (contactForm.message) {
      contactForm.message = encryption.decrypt(contactForm.message);
    }
    // Decrypt enum fields to avoid validation errors
    if (contactForm.visa_type) {
      contactForm.visa_type = encryption.decrypt(contactForm.visa_type);
    }
    if (contactForm.inquiry_type) {
      contactForm.inquiry_type = encryption.decrypt(contactForm.inquiry_type);
    }
    if (contactForm.source) {
      contactForm.source = encryption.decrypt(contactForm.source);
    }
    if (contactForm.priority) {
      contactForm.priority = encryption.decrypt(contactForm.priority);
    }
    
    console.log(`✅ Step 1.5 completed in ${Date.now() - startDecrypt}ms`);
    console.log('✅ Contact form found (decrypted):', contactForm.name, contactForm.email);

    if (contactForm.converted_to_lead) {
      console.log('⚠️ Already converted to lead:', contactForm.converted_to_lead);
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_CONVERTED',
          message: 'This contact form has already been converted to a lead'
        }
      });
    }

    console.log('🔍 Step 2: Loading Lead model...');
    const startLoadModel = Date.now();
    const Lead = require('../models/Lead');
    const User = require('../models/User');
    console.log(`✅ Step 2 completed in ${Date.now() - startLoadModel}ms`);
    
    console.log('🔍 Step 3: Preparing lead data...');
    const startPrepare = Date.now();
    // Prepare lead data
    const nameParts = contactForm.name.trim().split(' ');
    const firstName = nameParts[0] || contactForm.name;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown';
    
    const leadData = {
      firstName: firstName,
      lastName: lastName,
      email: contactForm.email,
      phone: contactForm.phone,
      university: 'Unknown',
      country: 'Unknown',
      source: 'contact_us',
      notes: notes || '',
      priority: priority || contactForm.priority || 'medium',
      estimatedValue: 0,
      status: 'new'
    };
    console.log(`✅ Step 3 completed in ${Date.now() - startPrepare}ms`);
    console.log('📊 Lead data prepared:', { firstName, lastName, email: contactForm.email, priority: leadData.priority });
    
    console.log('🔍 Step 4: Creating lead in database...');
    const startCreate = Date.now();
    const lead = new Lead(leadData);
    await lead.save();
    console.log(`✅ Step 4 completed in ${Date.now() - startCreate}ms`);
    console.log('✅ Lead created with ID:', lead._id);
    
    console.log('🔍 Step 5: Populating lead data...');
    const startPopulate = Date.now();
    // Populate the created lead
    await lead.populate('assignedTo', 'first_name last_name email');
    console.log(`✅ Step 5 completed in ${Date.now() - startPopulate}ms`);

    console.log('🔍 Step 6: Updating contact form...');
    const startUpdate = Date.now();
    // Update contact form with conversion - direct update to avoid potential method issues
    contactForm.converted_to_lead = lead._id;
    contactForm.conversion_date = new Date();
    contactForm.status = 'resolved';
    // Save with validation disabled to avoid enum validation on encrypted fields
    await contactForm.save({ validateBeforeSave: false });
    console.log(`✅ Step 6 completed in ${Date.now() - startUpdate}ms`);

    console.log('🔍 Step 7: Logging activity...');
    const startLog = Date.now();
    // Log conversion
    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      resourceType: 'Lead',
      resourceId: lead._id,
      description: `Lead created from contact form submission`,
      metadata: { 
        contact_form_id: contactForm._id,
        email: contactForm.email,
        service_interest: service_interest || 'Not specified'
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    console.log(`✅ Step 7 completed in ${Date.now() - startLog}ms`);

    console.log('🎉 ========== CONVERT CONTACT TO LEAD SUCCESS ==========');
    console.log('⏰ Total Time:', Date.now() - startFind, 'ms');
    
    res.json({
      success: true,
      message: 'Contact form converted to lead successfully',
      data: {
        lead,
        contact_form: contactForm
      }
    });

  } catch (error) {
    console.error('❌ ========== CONVERT CONTACT TO LEAD ERROR ==========');
    console.error('❌ Error Type:', error.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Error Stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSION_ERROR',
        message: 'Failed to convert contact form to lead',
        details: error.message
      }
    });
  }
};

// @desc    Delete Contact Form
// @route   DELETE /api/contact/:id
// @access  Private (Admin only)
const deleteContactForm = async (req, res) => {
  try {
    const contactForm = await ContactForm.findById(req.params.id);
    if (!contactForm) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact form submission not found'
        }
      });
    }

    await ContactForm.findByIdAndDelete(req.params.id);

    // Log deletion
    await ActivityLog.create({
      user: req.user._id,
      action: 'delete',
      resourceType: 'ContactForm',
      resourceId: req.params.id,
      description: `Contact form deleted by ${req.user.email}`,
      metadata: { 
        client_email: contactForm.email,
        visa_type: contactForm.visa_type,
        status: contactForm.status
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Contact form deleted successfully'
    });

  } catch (error) {
    console.error('Delete Contact Form Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete contact form'
      }
    });
  }
};

// @desc    Convert Multiple Contact Forms to Leads (Bulk)
// @route   POST /api/contact/convert-to-leads
// @access  Private (Admin/Manager only)
const convertContactsToLeads = async (req, res) => {
  try {
    const { contactIds, priority = 'medium', assignedTo, notes } = req.body;
    
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Please provide an array of contact IDs to convert'
        }
      });
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PRIORITY',
          message: 'Priority must be low, medium, or high'
        }
      });
    }

    const Lead = require('../models/Lead');
    const User = require('../models/User');
    const convertedLeads = [];
    const errors = [];

    // Process each contact form
    for (const contactId of contactIds) {
      try {
        const contactForm = await ContactForm.findById(contactId);
        if (!contactForm) {
          errors.push(`Contact form ${contactId} not found`);
          continue;
        }

        // Check if already converted
        if (contactForm.converted_to_lead) {
          errors.push(`Contact form ${contactId} already converted to lead`);
          continue;
        }

        // Prepare lead data
        const nameParts = contactForm.name.trim().split(' ');
        const firstName = nameParts[0] || contactForm.name;
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
        const leadData = {
          firstName: firstName,
          lastName: lastName,
          email: contactForm.email,
          phone: contactForm.phone,
          priority: priority,
          source: 'contact_form',
          status: 'new',
          notes: notes || `Converted from contact form submission. Original message: ${contactForm.message}`,
          assignmentNotes: notes,
          visa_interest: contactForm.visa_type
        };

        // Only assign if explicitly specified (no auto-assignment)
        if (assignedTo) {
          leadData.assignedTo = assignedTo;
        }
        // Removed auto-assignment logic - leads should be manually assigned after qualification

        const newLead = await Lead.create(leadData);
        await newLead.populate('assignedTo', 'first_name last_name email');
        convertedLeads.push(newLead);

        // Update contact form with conversion
        await contactForm.convertToLead(newLead);

        // Log conversion activity
        await ActivityLog.create({
          user: req.user._id,
          action: 'convert',
          resourceType: 'ContactForm',
          resourceId: contactForm._id,
          description: `Contact form converted to lead with ${priority} priority`,
          metadata: { 
            lead_id: newLead._id,
            priority: priority,
            assigned_to: leadData.assignedTo 
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });

      } catch (error) {
        console.error(`Error converting contact ${contactId}:`, error);
        errors.push(`Failed to convert contact ${contactId}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Successfully converted ${convertedLeads.length} contact(s) to lead(s) with ${priority} priority`,
      data: {
        converted_leads: convertedLeads,
        conversion_count: convertedLeads.length,
        errors: errors,
        priority: priority
      }
    });

  } catch (error) {
    console.error('Convert Contacts to Leads Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSION_ERROR',
        message: 'Failed to convert contacts to leads'
      }
    });
  }
};

module.exports = {
  submitContactForm,
  getContactForm,
  getAllContactForms,
  updateContactFormStatus,
  respondToContactForm,
  addCommunication,
  convertToLead,
  convertContactsToLeads,
  deleteContactForm
};