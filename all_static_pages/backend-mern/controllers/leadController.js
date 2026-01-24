const Lead = require('../models/Lead');
const Client = require('../models/Client');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { validationResult } = require('express-validator');

// Helper function to log activities
const logActivity = async (userId, action, details, ipAddress) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      details,
      ipAddress,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// @desc    Get all leads with role-based filtering
// @route   GET /api/leads
// @access  Private (Admin, Lead Manager)
exports.getLeads = async (req, res) => {
  try {
    const { search, status, source, assignedTo, page = 1, limit = 20 } = req.query;
    
    // Build query with security filters
    let query = {};
    
    // Role-based access control
    if (req.user.role === 'lead_manager') {
      // Lead managers can only see their assigned leads
      query.assignedTo = req.user.user_id;
    } else if (req.user.role === 'crm_manager') {
      // CRM managers cannot access leads
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'CRM managers cannot access leads'
        }
      });
    }
    
    // Apply filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (source) query.source = source;
    if (assignedTo && req.user.role === 'admin') query.assignedTo = assignedTo;
    
    const leads = await Lead.find(query)
      .populate('assignedTo', 'first_name last_name email')
      .populate('convertedToClient', 'name email')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Lead.countDocuments(query);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'VIEW_LEADS',
      `Viewed leads list. Role: ${req.user.role}, Filters: ${JSON.stringify(req.query)}`,
      req.ip
    );
    
    res.json({
      success: true,
      count: leads.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: leads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_LEADS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Private (Admin, Assigned Lead Manager)
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'first_name last_name email phone')
      .populate('convertedToClient', 'name email company')
      .populate('created_by', 'first_name last_name email');
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LEAD_NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }
    
    // Security check - role-based access control
    if (req.user.role === 'lead_manager' && 
        (!lead.assignedTo || lead.assignedTo._id.toString() !== req.user.user_id)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only view your assigned leads'
        }
      });
    }
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'VIEW_LEAD',
      `Viewed lead: ${lead.name} (${lead.email})`,
      req.ip
    );
    
    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_LEAD_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private (Admin, Lead Manager) or Public (from website forms)
exports.createLead = async (req, res) => {
  try {
    // Check validation errors
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
    
    const { name, email, phone, company, source, notes, priority } = req.body;
    
    // Check if lead already exists
    const existingLead = await Lead.findOne({ email });
    if (existingLead) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'LEAD_EXISTS',
          message: 'Lead with this email already exists'
        }
      });
    }
    
    const leadData = {
      name,
      email,
      phone,
      company,
      source: source || 'website',
      notes,
      priority: priority || 'medium',
      status: 'new',
      created_by: req.user ? req.user.user_id : null
    };
    
    // Auto-assign to a lead manager if not specified
    if (!leadData.assignedTo && req.user && req.user.role === 'admin') {
      // Find available lead manager with least leads
      const leadManagers = await User.find({ role: 'lead_manager', status: 'active' });
      if (leadManagers.length > 0) {
        const leadCounts = await Promise.all(
          leadManagers.map(async (manager) => ({
            manager: manager._id,
            count: await Lead.countDocuments({ assignedTo: manager._id, status: { $ne: 'converted' } })
          }))
        );
        
        const leastBusyManager = leadCounts.reduce((min, current) => 
          current.count < min.count ? current : min
        );
        
        leadData.assignedTo = leastBusyManager.manager;
      }
    }
    
    const lead = await Lead.create(leadData);
    
    // Populate the created lead
    await lead.populate('assignedTo', 'first_name last_name email');
    
    // Log activity
    if (req.user) {
      await logActivity(
        req.user.user_id,
        'CREATE_LEAD',
        `Created new lead: ${lead.name} (${lead.email})`,
        req.ip
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_LEAD_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Update lead
// @route   PATCH /api/leads/:id
// @access  Private (Admin, Assigned Lead Manager)
exports.updateLead = async (req, res) => {
  try {
    // Check validation errors
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
    
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LEAD_NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }
    
    // Security check - role-based access control
    if (req.user.role === 'lead_manager' && 
        (!lead.assignedTo || lead.assignedTo.toString() !== req.user.user_id)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your assigned leads'
        }
      });
    }
    
    // Define allowed fields based on role
    let allowedFields = ['name', 'phone', 'company', 'status', 'priority', 'notes', 'qualification_score'];
    
    if (req.user.role === 'admin') {
      allowedFields.push('assignedTo', 'source');
    }
    
    // Update only allowed fields
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    // Validate qualification score
    if (updateData.qualification_score !== undefined) {
      if (updateData.qualification_score < 0 || updateData.qualification_score > 100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SCORE',
            message: 'Qualification score must be between 0 and 100'
          }
        });
      }
    }
    
    Object.assign(lead, updateData);
    lead.updated_at = new Date();
    await lead.save();
    
    // Populate updated lead
    await lead.populate('assignedTo', 'first_name last_name email');
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'UPDATE_LEAD',
      `Updated lead: ${lead.name}. Fields: ${Object.keys(updateData).join(', ')}`,
      req.ip
    );
    
    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_LEAD_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Convert lead to client
// @route   POST /api/leads/:id/convert
// @access  Private (Admin, Assigned Lead Manager)
exports.convertLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LEAD_NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }
    
    // Security check
    if (req.user.role === 'lead_manager' && 
        (!lead.assignedTo || lead.assignedTo.toString() !== req.user.user_id)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only convert your assigned leads'
        }
      });
    }
    
    // Check if already converted
    if (lead.status === 'converted') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_CONVERTED',
          message: 'Lead has already been converted'
        }
      });
    }
    
    const { assignedManager } = req.body;
    
    // Verify assigned manager exists and has correct role
    if (assignedManager) {
      const manager = await User.findById(assignedManager);
      if (!manager || manager.role !== 'crm_manager') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MANAGER',
            message: 'Invalid manager ID or user is not a CRM manager'
          }
        });
      }
    }
    
    // Create client record
    const clientData = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      country: lead.country || 'Unknown',
      status: 'active',
      assignedManager: assignedManager || null,
      created_by: req.user.user_id,
      converted_from_lead: lead._id
    };
    
    const client = await Client.create(clientData);
    
    // Update lead status
    lead.status = 'converted';
    lead.convertedToClient = client._id;
    lead.converted_at = new Date();
    lead.converted_by = req.user.user_id;
    await lead.save();
    
    // Populate client data
    await client.populate('assignedManager', 'first_name last_name email');
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'CONVERT_LEAD',
      `Converted lead ${lead.name} to client. Assigned to: ${client.assignedManager ? client.assignedManager.email : 'Unassigned'}`,
      req.ip
    );
    
    res.json({
      success: true,
      message: 'Lead converted to client successfully',
      data: {
        lead,
        client
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERT_LEAD_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Delete lead (soft delete)
// @route   DELETE /api/leads/:id
// @access  Private (Admin only)
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LEAD_NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }
    
    // Soft delete - change status instead of actual deletion
    lead.status = 'deleted';
    lead.deleted_at = new Date();
    lead.deleted_by = req.user.user_id;
    await lead.save();
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'DELETE_LEAD',
      `Deleted lead: ${lead.name} (${lead.email})`,
      req.ip
    );
    
    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_LEAD_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get lead statistics
// @route   GET /api/leads/stats/summary
// @access  Private (Admin, Lead Manager)
exports.getLeadStats = async (req, res) => {
  try {
    let query = { status: { $ne: 'deleted' } };
    
    // Filter by assigned leads for lead managers
    if (req.user.role === 'lead_manager') {
      query.assignedTo = req.user.user_id;
    }
    
    const total = await Lead.countDocuments(query);
    
    const byStatus = await Lead.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const bySource = await Lead.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const conversionRate = await Lead.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          converted: {
            $sum: {
              $cond: [{ $eq: ['$status', 'converted'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          conversionRate: {
            $multiply: [
              { $divide: ['$converted', '$total'] },
              100
            ]
          }
        }
      }
    ]);
    
    const recentLeads = await Lead.find(query)
      .populate('assignedTo', 'first_name last_name')
      .sort({ created_at: -1 })
      .limit(5);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'VIEW_LEAD_STATS',
      `Viewed lead statistics. Role: ${req.user.role}`,
      req.ip
    );
    
    res.json({
      success: true,
      data: {
        total,
        byStatus,
        bySource,
        conversionRate: conversionRate[0]?.conversionRate || 0,
        recentLeads
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_LEAD_STATS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Assign lead to manager
// @route   PATCH /api/leads/:id/assign
// @access  Private (Admin only)
exports.assignLead = async (req, res) => {
  try {
    const { managerId } = req.body;
    
    if (!managerId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_MANAGER_ID',
          message: 'Manager ID is required'
        }
      });
    }
    
    // Verify manager exists and has correct role
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== 'lead_manager') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MANAGER',
          message: 'Invalid manager ID or user is not a lead manager'
        }
      });
    }
    
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo: managerId,
        updated_at: new Date()
      },
      { new: true }
    ).populate('assignedTo', 'first_name last_name email');
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LEAD_NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'ASSIGN_LEAD',
      `Assigned lead ${lead.name} to manager ${manager.email}`,
      req.ip
    );
    
    res.json({
      success: true,
      message: 'Lead assigned successfully',
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'ASSIGN_LEAD_FAILED',
        message: error.message
      }
    });
  }
};