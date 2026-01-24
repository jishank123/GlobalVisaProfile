const ContactForm = require('../models/ContactForm');
const Lead = require('../models/Lead');
const ActivityLog = require('../models/ActivityLog');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Rate limiting for contact form submissions
const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per 15 minutes
  message: {
    error: 'Too many contact form submissions. Please try again in 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validation rules for contact form
const validateContactForm = [
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
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('visa_type')
    .isIn(['eb1a', 'eb2-niw', 'o1', 'profile', 'other'])
    .withMessage('Please select a valid visa category'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
];

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public (with rate limiting)
const submitContactForm = async (req, res) => {
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

    // Extract UTM parameters and referrer
    const utmSource = req.body.utm_source || req.query.utm_source;
    const utmMedium = req.body.utm_medium || req.query.utm_medium;
    const utmCampaign = req.body.utm_campaign || req.query.utm_campaign;
    const referrerUrl = req.get('Referer');

    // Check for duplicate submissions (same email and similar message within 1 hour)
    const existingSubmission = await ContactForm.findOne({
      email: req.body.email,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
      status: { $in: ['new', 'reviewed', 'in_progress'] }
    });

    if (existingSubmission) {
      // Check if message is very similar (simple check)
      const similarity = calculateSimilarity(existingSubmission.message, req.body.message);
      if (similarity > 0.8) {
        return res.status(409).json({
          success: false,
          message: 'You have already submitted a similar inquiry recently. We will respond to your previous message shortly.',
          code: 'DUPLICATE_SUBMISSION'
        });
      }
    }

    // Create contact form record
    const contactData = {
      ...req.body,
      ip_address: clientIP,
      user_agent: userAgent,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      referrer_url: referrerUrl,
      source: 'website_contact'
    };

    const contact = new ContactForm(contactData);
    await contact.save();

    // Log the activity
    await ActivityLog.create({
      user: null, // Public submission
      action: 'contact_form_submitted',
      resource: 'ContactForm',
      resourceId: contact._id,
      details: {
        email: contact.email,
        visa_type: contact.visa_type,
        inquiry_type: contact.inquiry_type,
        priority: contact.priority,
        ip_address: clientIP
      },
      ip_address: clientIP,
      user_agent: userAgent
    });

    // Return success response (without sensitive data)
    res.status(201).json({
      success: true,
      message: 'Thank you for your inquiry! We will respond within 24-48 hours.',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        visa_type: contact.visa_type_display,
        inquiry_type: contact.inquiry_type,
        priority: contact.priority,
        response_deadline: contact.response_deadline,
        submission_date: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    // Log the error
    await ActivityLog.create({
      user: null,
      action: 'contact_form_error',
      resource: 'ContactForm',
      details: {
        error: error.message,
        email: req.body.email,
        ip_address: req.ip
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    }).catch(console.error);

    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your inquiry. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Simple similarity calculation function
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// @desc    Get all contact forms (Admin only)
// @route   GET /api/contact
// @access  Private (Admin)
const getContactForms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.visa_type) filter.visa_type = req.query.visa_type;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.inquiry_type) filter.inquiry_type = req.query.inquiry_type;
    if (req.query.assigned_to) filter.assigned_to = req.query.assigned_to;
    
    // Date range filter
    if (req.query.date_from || req.query.date_to) {
      filter.createdAt = {};
      if (req.query.date_from) filter.createdAt.$gte = new Date(req.query.date_from);
      if (req.query.date_to) filter.createdAt.$lte = new Date(req.query.date_to);
    }
    
    // Response status filter
    if (req.query.response_status) {
      if (req.query.response_status === 'overdue') {
        filter.responded_at = { $exists: false };
        filter.response_deadline = { $lt: new Date() };
      } else if (req.query.response_status === 'pending') {
        filter.responded_at = { $exists: false };
        filter.response_deadline = { $gte: new Date() };
      } else if (req.query.response_status === 'responded') {
        filter.responded_at = { $exists: true };
      }
    }
    
    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    // Build sort
    const sort = {};
    if (req.query.sort_by) {
      const sortField = req.query.sort_by;
      const sortOrder = req.query.sort_order === 'asc' ? 1 : -1;
      sort[sortField] = sortOrder;
    } else {
      sort.createdAt = -1; // Default: newest first
    }

    const contacts = await ContactForm.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('assigned_to', 'name email')
      .populate('converted_to_lead', 'name email status')
      .populate('converted_to_client', 'name email status')
      .select('-ip_address -user_agent'); // Exclude sensitive data

    const total = await ContactForm.countDocuments(filter);

    // Log the access
    await ActivityLog.create({
      user: req.user._id,
      action: 'contact_forms_viewed',
      resource: 'ContactForm',
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
      data: contacts,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_records: total,
        per_page: limit
      }
    });

  } catch (error) {
    console.error('Get contact forms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving contact forms'
    });
  }
};

// @desc    Get single contact form (Admin only)
// @route   GET /api/contact/:id
// @access  Private (Admin)
const getContactForm = async (req, res) => {
  try {
    const contact = await ContactForm.findById(req.params.id)
      .populate('assigned_to', 'name email role')
      .populate('converted_to_lead', 'name email status service_interest')
      .populate('converted_to_client', 'name email status')
      .populate('communications.user', 'name email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    // Log the access
    await ActivityLog.create({
      user: req.user._id,
      action: 'contact_form_viewed',
      resource: 'ContactForm',
      resourceId: contact._id,
      details: {
        email: contact.email,
        visa_type: contact.visa_type
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Get contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving contact form'
    });
  }
};

// @desc    Update contact form (Admin only)
// @route   PUT /api/contact/:id
// @access  Private (Admin)
const updateContactForm = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      assigned_to, 
      inquiry_type,
      internal_notes,
      tags,
      response_required,
      response_deadline
    } = req.body;
    
    const contact = await ContactForm.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    // Update fields
    if (status) contact.status = status;
    if (priority) contact.priority = priority;
    if (assigned_to) contact.assigned_to = assigned_to;
    if (inquiry_type) contact.inquiry_type = inquiry_type;
    if (internal_notes) contact.internal_notes = internal_notes;
    if (tags) contact.tags = tags;
    if (response_required !== undefined) contact.response_required = response_required;
    if (response_deadline) contact.response_deadline = response_deadline;

    await contact.save();

    // Log the update
    await ActivityLog.create({
      user: req.user._id,
      action: 'contact_form_updated',
      resource: 'ContactForm',
      resourceId: contact._id,
      details: {
        updated_fields: { status, priority, assigned_to, inquiry_type },
        email: contact.email
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Contact form updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Update contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact form'
    });
  }
};

// @desc    Respond to contact form (Admin only)
// @route   POST /api/contact/:id/respond
// @access  Private (Admin)
const respondToContactForm = async (req, res) => {
  try {
    const { response_message } = req.body;
    
    if (!response_message || response_message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }
    
    const contact = await ContactForm.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    // Use the model method to respond
    await contact.respond(response_message, req.user._id);

    // Log the response
    await ActivityLog.create({
      user: req.user._id,
      action: 'contact_form_responded',
      resource: 'ContactForm',
      resourceId: contact._id,
      details: {
        email: contact.email,
        response_length: response_message.length
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: contact
    });

  } catch (error) {
    console.error('Respond to contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending response'
    });
  }
};

// @desc    Convert contact to lead (Admin only)
// @route   POST /api/contact/:id/convert-to-lead
// @access  Private (Admin)
const convertToLead = async (req, res) => {
  try {
    const contact = await ContactForm.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    if (contact.converted_to_lead) {
      return res.status(400).json({
        success: false,
        message: 'Contact form has already been converted to a lead'
      });
    }

    // Create lead from contact form
    const leadData = {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      service_interest: contact.visa_type_display,
      status: 'new',
      priority: contact.priority,
      source: 'website',
      assigned_to: contact.assigned_to || req.user._id,
      notes: `Converted from contact form. Original message: ${contact.message}`
    };

    const lead = new Lead(leadData);
    await lead.save();

    // Update contact form
    await contact.convertToLead(lead);

    // Log the conversion
    await ActivityLog.create({
      user: req.user._id,
      action: 'contact_converted_to_lead',
      resource: 'ContactForm',
      resourceId: contact._id,
      details: {
        email: contact.email,
        lead_id: lead._id
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Contact form converted to lead successfully',
      data: {
        contact: contact,
        lead: lead
      }
    });

  } catch (error) {
    console.error('Convert to lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Error converting contact to lead'
    });
  }
};

// @desc    Add communication to contact form (Admin only)
// @route   POST /api/contact/:id/communications
// @access  Private (Admin)
const addCommunication = async (req, res) => {
  try {
    const { type, message, direction } = req.body;
    
    const contact = await ContactForm.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    await contact.addCommunication(type, message, req.user._id, direction);

    // Log the communication
    await ActivityLog.create({
      user: req.user._id,
      action: 'contact_communication_added',
      resource: 'ContactForm',
      resourceId: contact._id,
      details: {
        communication_type: type,
        direction,
        email: contact.email
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Communication added successfully',
      data: contact
    });

  } catch (error) {
    console.error('Add communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding communication'
    });
  }
};

// @desc    Delete contact form (Admin only)
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
const deleteContactForm = async (req, res) => {
  try {
    const contact = await ContactForm.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    await contact.deleteOne();

    // Log the deletion
    await ActivityLog.create({
      user: req.user._id,
      action: 'contact_form_deleted',
      resource: 'ContactForm',
      resourceId: req.params.id,
      details: {
        email: contact.email,
        visa_type: contact.visa_type
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Contact form deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact form'
    });
  }
};

// @desc    Get contact form statistics (Admin only)
// @route   GET /api/contact/stats
// @access  Private (Admin)
const getContactStats = async (req, res) => {
  try {
    const stats = await ContactForm.aggregate([
      {
        $group: {
          _id: null,
          total_inquiries: { $sum: 1 },
          new_inquiries: {
            $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
          },
          responded: {
            $sum: { $cond: [{ $ne: ['$responded_at', null] }, 1, 0] }
          },
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
          },
          converted_to_leads: {
            $sum: { $cond: [{ $ne: ['$converted_to_lead', null] }, 1, 0] }
          }
        }
      }
    ]);

    const visaTypeDistribution = await ContactForm.aggregate([
      {
        $group: {
          _id: '$visa_type',
          count: { $sum: 1 }
        }
      }
    ]);

    const inquiryTypeDistribution = await ContactForm.aggregate([
      {
        $group: {
          _id: '$inquiry_type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        visa_type_distribution: visaTypeDistribution,
        inquiry_type_distribution: inquiryTypeDistribution
      }
    });

  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving contact statistics'
    });
  }
};

module.exports = {
  submitContactForm: [contactRateLimit, validateContactForm, submitContactForm],
  getContactForms,
  getContactForm,
  updateContactForm,
  respondToContactForm,
  convertToLead,
  addCommunication,
  deleteContactForm,
  getContactStats
};