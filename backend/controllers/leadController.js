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
      resourceType: 'Lead',
      description: details,
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
    console.log('🎯 === GET LEADS REQUEST ===');
    console.log('🎯 User:', req.user?.email, 'Role:', req.user?.role);
    console.log('🎯 Query params:', req.query);
    
    const { search, status, source, priority, assignedTo, page = 1, limit = 20 } = req.query;
    
    // Build query with security filters
    let query = {};
    
    // Role-based access control
    if (req.user.role === 'lead_manager') {
      // Lead managers can only see their assigned leads
      query.assignedTo = req.user._id;
      console.log('🎯 Lead manager filter applied:', req.user._id);
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
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (source) query.source = source;
    if (priority) query.priority = priority;
    if (assignedTo && req.user.role === 'admin') query.assignedTo = assignedTo;
    
    console.log('🎯 Final query:', query);
    
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('interestedServices', 'name')
      .populate('convertedToClient', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Lead.countDocuments(query);
    
    console.log('🎯 Found leads:', leads.length, 'Total:', count);
    
    res.json({
      success: true,
      count: leads.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: leads
    });
  } catch (error) {
    console.error('❌ Get leads error:', error);
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
      .populate('convertedToClient', 'name email company');
    
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
        (!lead.assignedTo || lead.assignedTo._id.toString() !== req.user._id.toString())) {
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
      req.user._id,
      'view',
      `Viewed lead: ${lead.firstName} ${lead.lastName} (${lead.email})`,
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
// @access  Private (Admin only) - Lead managers cannot create leads
exports.createLead = async (req, res) => {
  try {
    // Only admins can create leads directly
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only administrators can create leads. Leads are created from website forms or by admin assignment.'
        }
      });
    }
    
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
    
    const { firstName, lastName, email, phone, university, country, source, notes, priority, estimatedValue, assignedTo } = req.body;
    
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
    
    // Verify assigned manager if provided
    if (assignedTo) {
      const manager = await User.findById(assignedTo);
      if (!manager || manager.role !== 'lead_manager') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MANAGER',
            message: 'Invalid manager ID or user is not a lead manager'
          }
        });
      }
    }
    
    const leadData = {
      firstName,
      lastName,
      email,
      phone,
      university,
      country,
      source: source || 'admin_created',
      notes,
      priority: priority || 'medium',
      estimatedValue: estimatedValue || 0,
      status: 'new',
      assignedTo: assignedTo || null,
      created_by: req.user._id
    };
    
    const lead = await Lead.create(leadData);
    
    // Populate the created lead
    await lead.populate('assignedTo', 'first_name last_name email');
    
    // Log activity
    await logActivity(
      req.user._id,
      'CREATE_LEAD',
      `Admin created new lead: ${lead.firstName} ${lead.lastName} (${lead.email})${assignedTo ? ` and assigned to manager` : ''}`,
      req.ip
    );
    
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
        (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your assigned leads'
        }
      });
    }
    
    // Define allowed fields based on role
    let allowedFields = ['firstName', 'lastName', 'phone', 'university', 'country', 'status', 'priority', 'notes', 'estimatedValue', 'lastContact'];
    
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
    if (updateData.estimatedValue !== undefined) {
      if (updateData.estimatedValue < 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_VALUE',
            message: 'Estimated value must be greater than or equal to 0'
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
      req.user._id,
      'UPDATE_LEAD',
      `Updated lead: ${lead.firstName} ${lead.lastName}. Fields: ${Object.keys(updateData).join(', ')}`,
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
        (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())) {
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
      name: `${lead.firstName} ${lead.lastName}`,
      email: lead.email,
      phone: lead.phone,
      company: lead.university || 'Unknown',
      country: lead.country || 'Unknown',
      status: 'active',
      assignedManager: assignedManager || null,
      created_by: req.user._id,
      converted_from_lead: lead._id
    };
    
    const client = await Client.create(clientData);
    
    // Update lead status
    lead.status = 'converted';
    lead.convertedToClient = client._id;
    lead.converted_at = new Date();
    lead.converted_by = req.user._id;
    await lead.save();
    
    // Populate client data
    await client.populate('assignedManager', 'first_name last_name email');
    
    // Log activity
    await logActivity(
      req.user._id,
      'CONVERT_LEAD',
      `Converted lead ${lead.firstName} ${lead.lastName} to client. Assigned to: ${client.assignedManager ? client.assignedManager.email : 'Unassigned'}`,
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
    lead.deleted_by = req.user._id;
    await lead.save();
    
    // Log activity
    await logActivity(
      req.user._id,
      'DELETE_LEAD',
      `Deleted lead: ${lead.firstName} ${lead.lastName} (${lead.email})`,
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
    console.log('📊 === GET LEAD STATS REQUEST ===');
    console.log('📊 User:', req.user?.email, 'Role:', req.user?.role);
    
    let query = {};
    
    // Filter by assigned leads for lead managers
    if (req.user.role === 'lead_manager') {
      query.assignedTo = req.user._id;
      console.log('📊 Lead manager filter applied:', req.user._id);
    }
    
    const total = await Lead.countDocuments(query);
    console.log('📊 Total leads:', total);
    
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
    
    const byPriority = await Lead.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate conversion rate
    const conversionStats = await Lead.aggregate([
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
      }
    ]);
    
    const conversionRate = conversionStats.length > 0 
      ? Math.round((conversionStats[0].converted / conversionStats[0].total) * 100) 
      : 0;
    
    // Get recent leads
    const recentLeads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('interestedServices', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get this week's new leads
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const newThisWeek = await Lead.countDocuments({
      ...query,
      createdAt: { $gte: weekStart }
    });
    
    // Get qualified leads count
    const qualifiedCount = await Lead.countDocuments({
      ...query,
      status: 'qualified'
    });
    
    console.log('📊 Stats calculated successfully');
    
    res.json({
      success: true,
      data: {
        total,
        newThisWeek,
        conversionRate,
        qualifiedCount,
        byStatus,
        bySource,
        byPriority,
        recentLeads
      }
    });
  } catch (error) {
    console.error('❌ Get lead stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_LEAD_STATS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Create lead from form submission (internal system use)
// @route   POST /api/leads/from-form
// @access  Private (Admin only) or Internal system
exports.createLeadFromForm = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, university, country, source, notes, priority, estimatedValue, formType, formId } = req.body;
    
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
      firstName,
      lastName,
      email,
      phone,
      university,
      country,
      source: source || 'website_form',
      notes: notes || `Created from ${formType} form`,
      priority: priority || 'medium',
      estimatedValue: estimatedValue || 0,
      status: 'new',
      created_by: req.user ? req.user._id : null,
      form_source: {
        type: formType,
        id: formId
      }
    };
    
    // Auto-assign to available lead manager with least workload
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
    
    const lead = await Lead.create(leadData);
    
    // Populate the created lead
    await lead.populate('assignedTo', 'first_name last_name email');
    
    // Log activity
    if (req.user) {
      await logActivity(
        req.user._id,
        'CREATE_LEAD_FROM_FORM',
        `Created lead from ${formType}: ${lead.firstName} ${lead.lastName} (${lead.email})`,
        req.ip
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Lead created from form successfully',
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_LEAD_FROM_FORM_FAILED',
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
      req.user._id,
      'ASSIGN_LEAD',
      `Assigned lead ${lead.firstName} ${lead.lastName} to manager ${manager.email}`,
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

// @desc    Bulk assign leads to manager
// @route   POST /api/leads/bulk/assign
// @access  Private (Admin only)
exports.bulkAssignLeads = async (req, res) => {
  try {
    console.log('🎯 === BULK ASSIGN LEADS REQUEST ===');
    console.log('🎯 User:', req.user?.email, 'Role:', req.user?.role);
    console.log('🎯 Request body:', req.body);
    
    const { lead_ids, lead_manager_id, notes } = req.body;
    
    // Validation
    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_LEAD_IDS',
          message: 'Lead IDs array is required and cannot be empty'
        }
      });
    }
    
    if (!lead_manager_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_MANAGER_ID',
          message: 'Lead Manager ID is required'
        }
      });
    }
    
    // Verify manager exists and has correct role
    const manager = await User.findById(lead_manager_id);
    if (!manager || manager.role !== 'lead_manager') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MANAGER',
          message: 'Invalid manager ID or user is not a lead manager'
        }
      });
    }
    
    console.log('🎯 Manager found:', manager.email, 'Role:', manager.role);
    
    // Process each lead assignment
    const results = [];
    const errors = [];
    
    for (const leadId of lead_ids) {
      try {
        const lead = await Lead.findByIdAndUpdate(
          leadId,
          { 
            assignedTo: lead_manager_id,
            status: 'assigned',
            updated_at: new Date(),
            assignmentNotes: notes || ''
          },
          { new: true }
        ).populate('assignedTo', 'first_name last_name email');
        
        if (lead) {
          results.push({
            leadId: leadId,
            success: true,
            lead: lead
          });
          
          // Log activity
          await logActivity(
            req.user._id,
            'BULK_ASSIGN_LEAD',
            `Bulk assigned lead ${lead.firstName} ${lead.lastName} to lead manager ${manager.email}`,
            req.ip
          );
        } else {
          errors.push({
            leadId: leadId,
            error: 'Lead not found'
          });
        }
      } catch (error) {
        console.error('🎯 Error assigning lead:', leadId, error);
        errors.push({
          leadId: leadId,
          error: error.message
        });
      }
    }
    
    console.log('🎯 Assignment results:', {
      successful: results.length,
      failed: errors.length,
      total: lead_ids.length
    });
    
    // Return results
    const response = {
      success: true,
      message: `Successfully assigned ${results.length} of ${lead_ids.length} leads`,
      data: {
        successful: results,
        failed: errors,
        manager: {
          id: manager._id,
          name: `${manager.first_name} ${manager.last_name}`,
          email: manager.email
        },
        notes: notes || ''
      }
    };
    
    // If some assignments failed, include warning
    if (errors.length > 0) {
      response.warning = `${errors.length} lead(s) could not be assigned`;
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('🎯 Bulk assignment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BULK_ASSIGN_FAILED',
        message: error.message
      }
    });
  }
};