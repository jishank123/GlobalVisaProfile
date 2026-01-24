const ContactForm = require('../models/ContactForm');
const ActivityLog = require('../models/ActivityLog');
const { validationResult } = require('express-validator');

/**
 * Contact Form Controller
 * Handles contact form submissions with comprehensive security and lead management
 */

// @desc    Submit Contact Form
// @route   POST /api/contact
// @access  Public (with rate limiting and validation)
const submitContactForm = async (req, res) => {
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

    // Check for duplicate recent submissions (prevent spam)
    const recentSubmission = await ContactForm.findOne({
      email: email.toLowerCase(),
      createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) } // Last 6 hours
    });

    if (recentSubmission) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'DUPLICATE_SUBMISSION',
          message: 'You have already submitted a contact form in the last 6 hours. We will respond to your inquiry soon.'
        }
      });
    }

    // Create contact form submission
    const contactSubmission = new ContactForm({
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
    });

    await contactSubmission.save();

    // Log activity for security audit
    await ActivityLog.create({
      user: null, // Anonymous submission
      action: 'create',
      resourceType: 'ContactForm',
      resourceId: contactSubmission._id,
      description: `Contact form submitted by ${email}`,
      metadata: {
        email,
        visa_type,
        inquiry_type: contactSubmission.inquiry_type,
        priority: contactSubmission.priority,
        message_length: message.length,
        utm_source,
        utm_medium
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Return success response (excluding sensitive data)
    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will respond to your inquiry within 24-48 hours.',
      data: {
        submission_id: contactSubmission._id,
        name: contactSubmission.name,
        email: contactSubmission.email,
        visa_type: contactSubmission.visa_type_display,
        inquiry_type: contactSubmission.inquiry_type,
        priority: contactSubmission.priority,
        status: contactSubmission.status,
        submission_date: contactSubmission.createdAt,
        reference_number: `CNT-${contactSubmission._id.toString().slice(-8).toUpperCase()}`,
        response_deadline: contactSubmission.response_deadline
      }
    });

  } catch (error) {
    console.error('Contact Form Submission Error:', error);
    
    // Log error for monitoring
    if (req.body?.email) {
      await ActivityLog.create({
        user: null,
        action: 'other',
        resourceType: 'System',
        description: `Contact form submission failed for ${req.body.email}`,
        metadata: { error: error.message },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }).catch(() => {}); // Silent fail for logging
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SUBMISSION_ERROR',
        message: 'Failed to submit contact form. Please try again or contact us directly.'
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
  try {
    const { service_interest, priority, assigned_to, notes } = req.body;
    
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

    if (contactForm.converted_to_lead) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_CONVERTED',
          message: 'This contact form has already been converted to a lead'
        }
      });
    }

    // Create lead from contact form
    const Lead = require('../models/Lead');
    const lead = new Lead({
      name: contactForm.name,
      email: contactForm.email,
      phone: contactForm.phone,
      service_interest: service_interest || contactForm.visa_type_display,
      priority: priority || contactForm.priority,
      assigned_to: assigned_to,
      notes: notes || contactForm.message,
      source: 'website'
    });

    await lead.save();

    // Update contact form with conversion
    await contactForm.convertToLead(lead);

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
        service_interest
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Contact form converted to lead successfully',
      data: {
        lead,
        contact_form: contactForm
      }
    });

  } catch (error) {
    console.error('Convert to Lead Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSION_ERROR',
        message: 'Failed to convert contact form to lead'
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

module.exports = {
  submitContactForm,
  getContactForm,
  getAllContactForms,
  updateContactFormStatus,
  respondToContactForm,
  addCommunication,
  convertToLead,
  deleteContactForm
};