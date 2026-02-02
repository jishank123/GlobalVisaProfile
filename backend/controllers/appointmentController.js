const AppointmentRequest = require('../models/AppointmentRequest');
const ActivityLog = require('../models/ActivityLog');
const clientService = require('../services/clientService');
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
    console.log('📅 === APPOINTMENT SUBMISSION REQUEST ===');
    console.log('📅 User:', req.user?.email || 'Anonymous', 'Role:', req.user?.role || 'Public');
    console.log('📅 Request body:', JSON.stringify(req.body, null, 2));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
          validationErrors: errors.array().map(err => `${err.param}: ${err.msg}`)
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
      details,
      status,
      priority,
      assigned_to,
      created_by,
      scheduled_date,
      scheduled_time,
      duration_minutes,
      meeting_link,
      consultation_notes
    } = req.body;

    // Determine if this is created by an authenticated user (lead manager)
    const isCreatedByLeadManager = req.user && req.user.role === 'lead_manager';
    const isCreatedByCrmManager = req.user && req.user.role === 'crm_manager';
    const isCreatedByStaff = isCreatedByLeadManager || isCreatedByCrmManager || (req.user && req.user.role === 'admin');

    console.log('🔍 Appointment creation context:', {
      hasUser: !!req.user,
      userRole: req.user?.role,
      userEmail: req.user?.email,
      isCreatedByLeadManager,
      isCreatedByStaff
    });

    // Check for duplicate recent submissions (prevent spam) - only for public submissions
    if (!isCreatedByStaff) {
      const recentSubmission = await AppointmentRequest.findOne({
        email: email.toLowerCase(),
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });

      if (recentSubmission) {
        console.log('❌ Duplicate submission detected for:', email);
        return res.status(429).json({
          success: false,
          error: {
            code: 'DUPLICATE_SUBMISSION',
            message: 'You have already submitted an appointment request in the last 24 hours. Please check your email or contact us directly.'
          }
        });
      }
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
      status: status || 'pending',
      priority: priority || 'medium',
      assigned_to: assigned_to || null,
      created_by: isCreatedByStaff ? (created_by || req.user._id) : null, // Only set for staff-created appointments
      scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
      scheduled_time: scheduled_time || null,
      duration_minutes: duration_minutes || 30,
      meeting_link: meeting_link || null,
      consultation_notes: consultation_notes || null,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      source: isCreatedByStaff ? 'staff' : 'website' // Distinguish between staff and public submissions
    });

    console.log('🔍 Appointment data before save:', {
      name: appointment.name,
      email: appointment.email,
      created_by: appointment.created_by,
      source: appointment.source,
      status: appointment.status,
      isCreatedByStaff
    });

    await appointment.save();
    console.log('✅ Appointment saved successfully with ID:', appointment._id);

    // Auto-register client account - only for public submissions
    if (!isCreatedByStaff) {
      console.log('🔄 Auto-registering client account...');
      try {
        const { user, client, isNewUser } = await clientService.createOrGetClient({
          name,
          email,
          phone,
          company: '',
          current_location: ''
        }, 'appointment_request');

        console.log(`✅ Client ${isNewUser ? 'created' : 'found'}:`, user.email);
        
        // Link appointment to user
        appointment.user_id = user._id;
        appointment.client_id = client._id;
        await appointment.save();
        
      } catch (autoRegError) {
        console.error('⚠️ Auto-registration failed (non-critical):', autoRegError.message);
        // Continue with appointment submission even if auto-registration fails
      }
    }

    // Log activity for security audit
    await ActivityLog.create({
      user: req.user?._id || null, // Use authenticated user ID if available
      action: 'create',
      resourceType: 'AppointmentRequest',
      resourceId: appointment._id,
      description: `Appointment request ${isCreatedByStaff ? 'created by staff' : 'submitted'} for ${email}`,
      metadata: {
        email,
        visa_category,
        consultation_type,
        timezone,
        preferred_date,
        preferred_time,
        created_by_staff: isCreatedByStaff,
        staff_role: req.user?.role
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Return success response (excluding sensitive data)
    res.status(201).json({
      success: true,
      message: isCreatedByStaff 
        ? 'Appointment created successfully by staff member.' 
        : 'Appointment request submitted successfully. We will contact you within 24 hours to confirm your consultation.',
      data: {
        appointment_id: appointment._id,
        name: appointment.name,
        email: appointment.email,
        visa_category: appointment.visa_category_display,
        status: appointment.status_display,
        submission_date: appointment.createdAt,
        reference_number: `APT-${appointment._id.toString().slice(-8).toUpperCase()}`,
        created_by_staff: isCreatedByStaff,
        created_by: appointment.created_by,
        source: appointment.source
      }
    });

  } catch (error) {
    console.error('❌ Appointment Request Submission Error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Log error for monitoring
    if (req.body?.email) {
      await ActivityLog.create({
        user: req.user?._id || null,
        action: 'other',
        resourceType: 'System',
        description: `Appointment request submission failed for ${req.body.email}`,
        metadata: { 
          error: error.message,
          errorStack: error.stack,
          created_by_staff: !!(req.user && ['lead_manager', 'crm_manager', 'admin'].includes(req.user.role)),
          requestBody: req.body
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }).catch(() => {}); // Silent fail for logging
    }

    // Return detailed error for debugging
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBMISSION_ERROR',
        message: process.env.NODE_ENV === 'development' 
          ? `Appointment submission failed: ${error.message}` 
          : 'Failed to submit appointment request. Please try again or contact us directly.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
// @access  Private (Admin/Manager/Client)
const getAllAppointmentRequests = async (req, res) => {
  try {
    console.log('📅 === GET ALL APPOINTMENTS REQUEST ===');
    console.log('📅 User:', req.user?.email, 'Role:', req.user?.role);
    console.log('📅 User ID:', req.user?._id);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.visa_category) filter.visa_category = req.query.visa_category;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assigned_to) filter.assigned_to = req.query.assigned_to;

    // Role-based filtering
    if (req.user.role === 'lead_manager') {
      // Lead managers can only see appointments they created
      filter.created_by = req.user._id;
    } else if (req.user.role === 'client') {
      // Clients can only see appointments with their email
      filter.email = req.user.email.toLowerCase();
      console.log('📅 Client filter applied:', { email: req.user.email });
    }

    // Date range filter
    if (req.query.start_date || req.query.end_date) {
      filter.createdAt = {};
      if (req.query.start_date) filter.createdAt.$gte = new Date(req.query.start_date);
      if (req.query.end_date) filter.createdAt.$lte = new Date(req.query.end_date);
    }

    console.log('📅 Final filter:', filter);

    // Get appointments with pagination
    const appointments = await AppointmentRequest.find(filter)
      .populate('assigned_to', 'first_name last_name email')
      .populate('converted_to_client', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-ip_address -user_agent'); // Exclude sensitive data

    const total = await AppointmentRequest.countDocuments(filter);

    console.log('📅 Found appointments:', appointments.length, 'Total:', total);
    console.log('📅 Sample appointment:', appointments.length > 0 ? {
      id: appointments[0]._id,
      email: appointments[0].email,
      status: appointments[0].status,
      name: appointments[0].name
    } : 'No appointments found');

    // Log access
    await ActivityLog.create({
      user: req.user._id,
      action: 'view',
      resourceType: 'AppointmentRequest',
      description: `Appointment requests list viewed by ${req.user.email} (${req.user.role})`,
      metadata: { 
        page, 
        limit, 
        total, 
        filter,
        user_role: req.user.role,
        appointments_count: appointments.length
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: appointments,
      count: appointments.length,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_records: total,
        per_page: limit
      }
    });

  } catch (error) {
    console.error('❌ Get All Appointment Requests Error:', error);
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

// @desc    Get appointments created by current CRM manager
// @route   GET /api/appointments/my-appointments
// @access  Private (CRM Manager only)
const getMyAppointments = async (req, res) => {
  try {
    console.log('📅 === GET MY APPOINTMENTS REQUEST ===');
    console.log('📅 User:', req.user?.email, 'Role:', req.user?.role);
    console.log('📅 User ID:', req.user?._id);
    
    if (req.user.role !== 'crm_manager') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only CRM managers can access this endpoint'
        }
      });
    }
    
    const { status, page = 1, limit = 20 } = req.query;
    
    // Build query for appointments created by this CRM manager
    let query = {
      created_by: req.user._id  // Get appointments created by this CRM manager
    };
    
    if (status) query.status = status;
    
    console.log('📅 Query for CRM appointments:', query);
    
    const appointments = await AppointmentRequest.find(query)
      .populate('assigned_to', 'first_name last_name email')
      .sort({ scheduled_date: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-ip_address -user_agent'); // Exclude sensitive data
    
    const count = await AppointmentRequest.countDocuments(query);
    
    console.log('📅 Found CRM created appointments:', appointments.length, 'Total:', count);
    console.log('📅 Sample appointment:', appointments.length > 0 ? {
      id: appointments[0]._id,
      name: appointments[0].name,
      email: appointments[0].email,
      status: appointments[0].status,
      created_by: appointments[0].created_by,
      scheduled_date: appointments[0].scheduled_date
    } : 'No appointments found');
    
    res.json({
      success: true,
      count: appointments.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: appointments
    });
  } catch (error) {
    console.error('❌ Get CRM appointments error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CRM_APPOINTMENTS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get appointments for a specific client by email
// @route   GET /api/appointments/client/:email
// @access  Private (Client/Admin/Manager)
const getClientAppointments = async (req, res) => {
  try {
    console.log('📅 === GET CLIENT APPOINTMENTS REQUEST ===');
    console.log('📅 Client Email:', req.params.email);
    console.log('📅 Requested by:', req.user?.email, 'Role:', req.user?.role);
    console.log('📅 User ID:', req.user?._id || req.user?.id);
    
    const clientEmail = req.params.email;
    
    // Security check: clients can only access their own appointments
    if (req.user.role === 'client' && req.user.email !== clientEmail) {
      console.log('❌ Security check failed: client trying to access other client\'s appointments');
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own appointments'
        }
      });
    }
    
    const { status, page = 1, limit = 20 } = req.query;
    
    // Build query for appointments for this client
    let query = {
      email: clientEmail.toLowerCase()
    };
    
    if (status) query.status = status;
    
    console.log('📅 Query for appointments:', query);
    
    const appointments = await AppointmentRequest.find(query)
      .populate('assigned_to', 'first_name last_name email')
      .sort({ scheduled_date: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-ip_address -user_agent'); // Exclude sensitive data
    
    const count = await AppointmentRequest.countDocuments(query);
    
    console.log('📅 Found client appointments:', appointments.length, 'Total:', count);
    console.log('📅 Sample appointment data:', appointments.length > 0 ? {
      id: appointments[0]._id,
      email: appointments[0].email,
      status: appointments[0].status,
      scheduled_date: appointments[0].scheduled_date
    } : 'No appointments found');
    
    // Log access for audit
    await ActivityLog.create({
      user: req.user._id || req.user.id,
      action: 'view',
      resourceType: 'AppointmentRequest',
      description: `Client appointments viewed for ${clientEmail}`,
      metadata: { 
        client_email: clientEmail,
        appointments_count: appointments.length,
        requested_by: req.user.email,
        user_role: req.user.role
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      count: appointments.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: appointments
    });
    
  } catch (error) {
    console.error('❌ Get client appointments error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CLIENT_APPOINTMENTS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get appointments created by current lead manager
// @route   GET /api/appointments/my-created-appointments
// @access  Private (Lead Manager only)
const getMyCreatedAppointments = async (req, res) => {
  try {
    console.log('📅 === GET MY CREATED APPOINTMENTS REQUEST ===');
    console.log('📅 User:', req.user?.email, 'Role:', req.user?.role);
    
    if (req.user.role !== 'lead_manager') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only lead managers can access this endpoint'
        }
      });
    }
    
    const { status, page = 1, limit = 20 } = req.query;
    
    // Build query for appointments created by this lead manager
    let query = {
      created_by: req.user._id
    };
    
    if (status) query.status = status;
    
    const appointments = await AppointmentRequest.find(query)
      .populate('assigned_to', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-ip_address -user_agent'); // Exclude sensitive data
    
    const count = await AppointmentRequest.countDocuments(query);
    
    console.log('📅 Found lead manager created appointments:', appointments.length, 'Total:', count);
    
    res.json({
      success: true,
      count: appointments.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: appointments
    });
  } catch (error) {
    console.error('❌ Get lead manager created appointments error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_LEAD_MANAGER_APPOINTMENTS_FAILED',
        message: error.message
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
  deleteAppointmentRequest,
  getMyAppointments,
  getClientAppointments,
  getMyCreatedAppointments
};