const AppointmentRequest = require('../models/AppointmentRequest');
const ActivityLog = require('../models/ActivityLog');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Rate limiting for appointment requests
const appointmentRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  message: {
    error: 'Too many appointment requests. Please try again in 1 hour.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validation rules for appointment request
const validateAppointmentRequest = [
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
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('visa_category')
    .isIn(['eb1a', 'eb2-niw', 'o1', 'multiple', 'other'])
    .withMessage('Please select a valid visa category'),
  
  body('timezone')
    .isIn(['EST', 'CST', 'MST', 'PST', 'GMT', 'CET', 'IST', 'CST-China', 'JST', 'AEST', 'other'])
    .withMessage('Please select a valid timezone'),
  
  body('preferred_date')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Preferred date cannot exceed 20 characters'),
  
  body('preferred_time')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Preferred time cannot exceed 20 characters'),
  
  body('consultation_type')
    .optional()
    .isIn(['video', 'phone', 'in-person'])
    .withMessage('Invalid consultation type'),
  
  body('details')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Details cannot exceed 2000 characters')
];

// @desc    Submit appointment request
// @route   POST /api/appointments
// @access  Public (with rate limiting)
const submitAppointmentRequest = async (req, res) => {
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

    // Check for duplicate requests (same email within 24 hours)
    const existingRequest = await AppointmentRequest.findOne({
      email: req.body.email,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending appointment request. Please contact us directly for additional appointments.',
        code: 'DUPLICATE_REQUEST'
      });
    }

    // Create appointment request
    const appointmentData = {
      ...req.body,
      ip_address: clientIP,
      user_agent: userAgent,
      source: 'website',
      submission_date: new Date()
    };

    const appointment = new AppointmentRequest(appointmentData);
    await appointment.save();

    // Log the activity
    await ActivityLog.create({
      user: null, // Public submission
      action: 'appointment_request_submitted',
      resource: 'AppointmentRequest',
      resourceId: appointment._id,
      details: {
        email: appointment.email,
        visa_category: appointment.visa_category,
        consultation_type: appointment.consultation_type,
        ip_address: clientIP
      },
      ip_address: clientIP,
      user_agent: userAgent
    });

    // Return success response (without sensitive data)
    res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully. We will contact you within 24 hours to confirm your appointment.',
      data: {
        id: appointment._id,
        name: appointment.name,
        email: appointment.email,
        visa_category: appointment.visa_category_display,
        status: appointment.status_display,
        submission_date: appointment.submission_date
      }
    });

  } catch (error) {
    console.error('Appointment request submission error:', error);
    
    // Log the error
    await ActivityLog.create({
      user: null,
      action: 'appointment_request_error',
      resource: 'AppointmentRequest',
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
      message: 'An error occurred while processing your appointment request. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// @desc    Get all appointment requests (Admin only)
// @route   GET /api/appointments
// @access  Private (Admin)
const getAppointmentRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.visa_category) filter.visa_category = req.query.visa_category;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assigned_to) filter.assigned_to = req.query.assigned_to;
    
    // Date range filter
    if (req.query.date_from || req.query.date_to) {
      filter.createdAt = {};
      if (req.query.date_from) filter.createdAt.$gte = new Date(req.query.date_from);
      if (req.query.date_to) filter.createdAt.$lte = new Date(req.query.date_to);
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

    const appointments = await AppointmentRequest.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('assigned_to', 'name email')
      .populate('converted_to_client', 'name email')
      .select('-ip_address -user_agent'); // Exclude sensitive data

    const total = await AppointmentRequest.countDocuments(filter);

    // Log the access
    await ActivityLog.create({
      user: req.user._id,
      action: 'appointment_requests_viewed',
      resource: 'AppointmentRequest',
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
      data: appointments,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_records: total,
        per_page: limit
      }
    });

  } catch (error) {
    console.error('Get appointment requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving appointment requests'
    });
  }
};

// @desc    Get single appointment request (Admin only)
// @route   GET /api/appointments/:id
// @access  Private (Admin)
const getAppointmentRequest = async (req, res) => {
  try {
    const appointment = await AppointmentRequest.findById(req.params.id)
      .populate('assigned_to', 'name email role')
      .populate('converted_to_client', 'name email status')
      .populate('communications.user', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment request not found'
      });
    }

    // Log the access
    await ActivityLog.create({
      user: req.user._id,
      action: 'appointment_request_viewed',
      resource: 'AppointmentRequest',
      resourceId: appointment._id,
      details: {
        email: appointment.email,
        visa_category: appointment.visa_category
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error('Get appointment request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving appointment request'
    });
  }
};

// @desc    Update appointment request (Admin only)
// @route   PUT /api/appointments/:id
// @access  Private (Admin)
const updateAppointmentRequest = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      assigned_to, 
      scheduled_date, 
      scheduled_time, 
      meeting_link, 
      consultation_notes,
      follow_up_required,
      follow_up_date
    } = req.body;
    
    const appointment = await AppointmentRequest.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment request not found'
      });
    }

    // Update fields
    if (status) appointment.status = status;
    if (priority) appointment.priority = priority;
    if (assigned_to) appointment.assigned_to = assigned_to;
    if (scheduled_date) appointment.scheduled_date = scheduled_date;
    if (scheduled_time) appointment.scheduled_time = scheduled_time;
    if (meeting_link) appointment.meeting_link = meeting_link;
    if (consultation_notes) appointment.consultation_notes = consultation_notes;
    if (follow_up_required !== undefined) appointment.follow_up_required = follow_up_required;
    if (follow_up_date) appointment.follow_up_date = follow_up_date;

    await appointment.save();

    // Log the update
    await ActivityLog.create({
      user: req.user._id,
      action: 'appointment_request_updated',
      resource: 'AppointmentRequest',
      resourceId: appointment._id,
      details: {
        updated_fields: { status, priority, assigned_to, scheduled_date, scheduled_time },
        email: appointment.email
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Appointment request updated successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Update appointment request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment request'
    });
  }
};

// @desc    Schedule appointment (Admin only)
// @route   POST /api/appointments/:id/schedule
// @access  Private (Admin)
const scheduleAppointment = async (req, res) => {
  try {
    const { scheduled_date, scheduled_time, meeting_link, duration_minutes } = req.body;
    
    const appointment = await AppointmentRequest.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment request not found'
      });
    }

    // Use the model method to schedule
    await appointment.scheduleAppointment(
      scheduled_date, 
      scheduled_time, 
      meeting_link, 
      req.user._id
    );

    if (duration_minutes) {
      appointment.duration_minutes = duration_minutes;
      await appointment.save();
    }

    // Add communication record
    await appointment.addCommunication(
      'email',
      `Appointment scheduled for ${scheduled_date} at ${scheduled_time}. Meeting link: ${meeting_link}`,
      req.user._id,
      'outbound'
    );

    // Log the scheduling
    await ActivityLog.create({
      user: req.user._id,
      action: 'appointment_scheduled',
      resource: 'AppointmentRequest',
      resourceId: appointment._id,
      details: {
        scheduled_date,
        scheduled_time,
        meeting_link,
        email: appointment.email
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Appointment scheduled successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Schedule appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling appointment'
    });
  }
};

// @desc    Add communication to appointment (Admin only)
// @route   POST /api/appointments/:id/communications
// @access  Private (Admin)
const addCommunication = async (req, res) => {
  try {
    const { type, message, direction } = req.body;
    
    const appointment = await AppointmentRequest.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment request not found'
      });
    }

    await appointment.addCommunication(type, message, req.user._id, direction);

    // Log the communication
    await ActivityLog.create({
      user: req.user._id,
      action: 'appointment_communication_added',
      resource: 'AppointmentRequest',
      resourceId: appointment._id,
      details: {
        communication_type: type,
        direction,
        email: appointment.email
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Communication added successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Add communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding communication'
    });
  }
};

// @desc    Delete appointment request (Admin only)
// @route   DELETE /api/appointments/:id
// @access  Private (Admin)
const deleteAppointmentRequest = async (req, res) => {
  try {
    const appointment = await AppointmentRequest.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment request not found'
      });
    }

    await appointment.deleteOne();

    // Log the deletion
    await ActivityLog.create({
      user: req.user._id,
      action: 'appointment_request_deleted',
      resource: 'AppointmentRequest',
      resourceId: req.params.id,
      details: {
        email: appointment.email,
        visa_category: appointment.visa_category
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Appointment request deleted successfully'
    });

  } catch (error) {
    console.error('Delete appointment request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting appointment request'
    });
  }
};

// @desc    Get appointment statistics (Admin only)
// @route   GET /api/appointments/stats
// @access  Private (Admin)
const getAppointmentStats = async (req, res) => {
  try {
    const stats = await AppointmentRequest.aggregate([
      {
        $group: {
          _id: null,
          total_requests: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          by_visa_category: {
            $push: '$visa_category'
          }
        }
      }
    ]);

    const categoryDistribution = await AppointmentRequest.aggregate([
      {
        $group: {
          _id: '$visa_category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        category_distribution: categoryDistribution
      }
    });

  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving appointment statistics'
    });
  }
};

module.exports = {
  submitAppointmentRequest: [appointmentRateLimit, validateAppointmentRequest, submitAppointmentRequest],
  getAppointmentRequests,
  getAppointmentRequest,
  updateAppointmentRequest,
  scheduleAppointment,
  addCommunication,
  deleteAppointmentRequest,
  getAppointmentStats
};