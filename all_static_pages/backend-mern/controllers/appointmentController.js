const AppointmentRequest = require('../models/AppointmentRequest');
const ActivityLog = require('../models/ActivityLog');
const { validationResult } = require('express-validator');

/**
 * Appointment Controller
 * Handles consultation appointment booking with comprehensive security
 */

// @desc    Submit Appointment Request
// @route   POST /api/appointments
// @access  Public (with rate limiting and validation)
const submitAppointmentRequest = async (req, res) => {
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
      visa_category,
      timezone,
      preferred_date,
      preferred_time,
      consultation_type,
      details
    } = req.body;

    // Check for duplicate recent submissions (prevent spam)
    const recentSubmission = await AppointmentRequest.findOne({
      email: email.toLowerCase(),
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    if (recentSubmission) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'DUPLICATE_SUBMISSION',
          message: 'You have already submitted an appointment request in the last 24 hours. Please check your email or contact us directly.'
        }
      });
    }

    // Create appointment request
    const appointment = new AppointmentRequest({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      visa_category,
      timezone,
      preferred_date: preferred_date?.trim(),
      preferred_time: preferred_time?.trim(),
      consultation_type: consultation_type || 'video',
      details: details?.trim(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      source: 'website'
    });

    await appointment.save();

    // Log activity for security audit
    await ActivityLog.create({
      user: null, // Anonymous submission
      action: 'create',
      resourceType: 'AppointmentRequest',
      resourceId: appointment._id,
      description: `Appointment request submitted by ${email}`,
      metadata: {
        email,
        visa_category,
        consultation_type,
        timezone,
        preferred_date,
        preferred_time
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Return success response (excluding sensitive data)
    res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully. We will contact you within 24 hours to confirm your consultation.',
      data: {
        appointment_id: appointment._id,
        name: appointment.name,
        email: appointment.email,
        visa_category: appointment.visa_category_display,
        status: appointment.status_display,
        submission_date: appointment.createdAt,
        reference_number: `APT-${appointment._id.toString().slice(-8).toUpperCase()}`
      }
    });

  } catch (error) {
    console.error('Appointment Request Submission Error:', error);
    
    // Log error for monitoring
    if (req.body?.email) {
      await ActivityLog.create({
        user: null,
        action: 'other',
        resourceType: 'System',
        description: `Appointment request submission failed for ${req.body.email}`,
        metadata: { error: error.message },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }).catch(() => {}); // Silent fail for logging
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SUBMISSION_ERROR',
        message: 'Failed to submit appointment request. Please try again or contact us directly.'
      }
    });
  }
};

// @desc    Get Appointment Request by ID
// @route   GET /api/appointments/:id
// @access  Private (Admin/Manager only)
const getAppointmentRequest = async (req, res) => {
  try {
    const appointment = await AppointmentRequest.findById(req.params.id)
      .populate('assigned_to', 'first_name last_name email')
      .populate('converted_to_client', 'name email');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment request not found'
        }
      });
    }

    // Log access for audit
    await ActivityLog.create({
      user: req.user._id,
      action: 'view',
      resourceType: 'AppointmentRequest',
      resourceId: appointment._id,
      description: `Appointment request viewed by ${req.user.email}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error('Get Appointment Request Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to retrieve appointment request'
      }
    });
  }
};

// @desc    Get All Appointment Requests (with pagination and filtering)
// @route   GET /api/appointments
// @access  Private (Admin/Manager only)
const getAllAppointmentRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.visa_category) filter.visa_category = req.query.visa_category;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assigned_to) filter.assigned_to = req.query.assigned_to;

    // Date range filter
    if (req.query.start_date || req.query.end_date) {
      filter.createdAt = {};
      if (req.query.start_date) filter.createdAt.$gte = new Date(req.query.start_date);
      if (req.query.end_date) filter.createdAt.$lte = new Date(req.query.end_date);
    }

    // Get appointments with pagination
    const appointments = await AppointmentRequest.find(filter)
      .populate('assigned_to', 'first_name last_name email')
      .populate('converted_to_client', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-ip_address -user_agent'); // Exclude sensitive data

    const total = await AppointmentRequest.countDocuments(filter);

    // Log access
    await ActivityLog.create({
      user: req.user._id,
      action: 'view',
      resourceType: 'AppointmentRequest',
      description: `Appointment requests list viewed by ${req.user.email}`,
      metadata: { page, limit, total, filter },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_records: total,
          per_page: limit
        }
      }
    });

  } catch (error) {
    console.error('Get All Appointment Requests Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to retrieve appointment requests'
      }
    });
  }
};

// @desc    Update Appointment Request Status
// @route   PUT /api/appointments/:id/status
// @access  Private (Admin/Manager only)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, assigned_to, consultation_notes, follow_up_required, follow_up_date } = req.body;
    
    const appointment = await AppointmentRequest.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment request not found'
        }
      });
    }

    const oldStatus = appointment.status;
    appointment.status = status;
    if (assigned_to) appointment.assigned_to = assigned_to;
    if (consultation_notes) appointment.consultation_notes = consultation_notes;
    if (follow_up_required !== undefined) appointment.follow_up_required = follow_up_required;
    if (follow_up_date) appointment.follow_up_date = new Date(follow_up_date);

    await appointment.save();

    // Log status change
    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      resourceType: 'AppointmentRequest',
      resourceId: appointment._id,
      description: `Appointment status changed from ${oldStatus} to ${status}`,
      metadata: { 
        old_status: oldStatus, 
        new_status: status, 
        assigned_to,
        follow_up_required 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Update Appointment Status Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update appointment status'
      }
    });
  }
};

// @desc    Schedule Appointment
// @route   PUT /api/appointments/:id/schedule
// @access  Private (Admin/Manager only)
const scheduleAppointment = async (req, res) => {
  try {
    const { scheduled_date, scheduled_time, duration_minutes, meeting_link, meeting_id } = req.body;
    
    const appointment = await AppointmentRequest.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment request not found'
        }
      });
    }

    // Use the model method to schedule
    await appointment.scheduleAppointment(
      new Date(scheduled_date),
      scheduled_time,
      meeting_link,
      req.user._id
    );

    if (duration_minutes) appointment.duration_minutes = duration_minutes;
    if (meeting_id) appointment.meeting_id = meeting_id;
    
    await appointment.save();

    // Log scheduling
    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      resourceType: 'AppointmentRequest',
      resourceId: appointment._id,
      description: `Appointment scheduled for ${scheduled_date} at ${scheduled_time}`,
      metadata: { 
        scheduled_date, 
        scheduled_time, 
        duration_minutes,
        meeting_link: meeting_link ? 'provided' : 'not_provided'
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Appointment scheduled successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Schedule Appointment Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SCHEDULE_ERROR',
        message: 'Failed to schedule appointment'
      }
    });
  }
};

// @desc    Add Communication to Appointment
// @route   POST /api/appointments/:id/communications
// @access  Private (Admin/Manager only)
const addCommunication = async (req, res) => {
  try {
    const { type, message, direction } = req.body;
    
    const appointment = await AppointmentRequest.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment request not found'
        }
      });
    }

    // Use the model method to add communication
    await appointment.addCommunication(type, message, req.user._id, direction);

    // Log communication
    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      resourceType: 'AppointmentRequest',
      resourceId: appointment._id,
      description: `Communication added: ${type} - ${direction}`,
      metadata: { type, direction, message_length: message.length },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Communication added successfully',
      data: appointment
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

// @desc    Delete Appointment Request
// @route   DELETE /api/appointments/:id
// @access  Private (Admin only)
const deleteAppointmentRequest = async (req, res) => {
  try {
    const appointment = await AppointmentRequest.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment request not found'
        }
      });
    }

    await AppointmentRequest.findByIdAndDelete(req.params.id);

    // Log deletion
    await ActivityLog.create({
      user: req.user._id,
      action: 'delete',
      resourceType: 'AppointmentRequest',
      resourceId: req.params.id,
      description: `Appointment request deleted by ${req.user.email}`,
      metadata: { 
        client_email: appointment.email,
        visa_category: appointment.visa_category,
        status: appointment.status
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Appointment request deleted successfully'
    });

  } catch (error) {
    console.error('Delete Appointment Request Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete appointment request'
      }
    });
  }
};

module.exports = {
  submitAppointmentRequest,
  getAppointmentRequest,
  getAllAppointmentRequests,
  updateAppointmentStatus,
  scheduleAppointment,
  addCommunication,
  deleteAppointmentRequest
};