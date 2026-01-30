const Query = require('../models/Query');
const Client = require('../models/Client');
const User = require('../models/User');

// @route   GET /api/queries
// @desc    Get queries with filters
// @access  Private (Admin, CRM Manager)
exports.getQueries = async (req, res) => {
  try {
    const { status, priority, category, client, page = 1, limit = 20 } = req.query;
    
    // Build query
    let query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (client) query.client = client;
    
    // Role-based access control
    if (req.user.role === 'crm_manager') {
      // CRM managers can only see queries from their assigned clients
      const assignedClients = await Client.find({ crm_manager: req.user.user_id }).select('_id');
      const clientIds = assignedClients.map(client => client._id);
      query.client = { $in: clientIds };
      console.log('🔍 CRM Manager query filter:', { clientIds: clientIds.length });
    }
    
    const queries = await Query.find(query)
      .populate('client', 'name email university')
      .populate('assignedTo', 'first_name last_name email')
      .populate('responses.user', 'first_name last_name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Query.countDocuments(query);
    
    console.log('🔍 Queries query executed:', query);
    console.log('❓ Queries found:', queries.length);
    
    res.json({
      success: true,
      count: queries.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: queries
    });
  } catch (error) {
    console.error('❌ Error fetching queries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @route   GET /api/queries/:id
// @desc    Get single query
// @access  Private (Admin, CRM Manager)
exports.getQuery = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id)
      .populate('client', 'name email university phone')
      .populate('assignedTo', 'first_name last_name email')
      .populate('responses.user', 'first_name last_name email role');
    
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }
    
    // Check access permission for CRM managers
    if (req.user.role === 'crm_manager') {
      const client = await Client.findById(query.client._id);
      if (!client || !client.crm_manager || client.crm_manager.toString() !== req.user.user_id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }
    
    res.json({
      success: true,
      data: query
    });
  } catch (error) {
    console.error('❌ Error fetching query:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @route   POST /api/queries
// @desc    Create new query
// @access  Private (Admin, CRM Manager, Client)
exports.createQuery = async (req, res) => {
  try {
    let { client, subject, description, category, priority } = req.body;
    
    // Validate required fields
    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Subject and description are required'
      });
    }
    
    // If the user is a client, find their client record and use it
    if (req.user.role === 'client') {
      const clientRecord = await Client.findOne({ email: req.user.email });
      if (!clientRecord) {
        return res.status(404).json({
          success: false,
          message: 'Client record not found'
        });
      }
      client = clientRecord._id;
    } else {
      // For admin/crm_manager, client ID must be provided
      if (!client) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }
    }
    
    // Find the client and assign to their CRM manager
    const clientRecord = await Client.findById(client);
    if (!clientRecord) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    const queryData = {
      client,
      subject,
      description,
      category: category || 'General',
      priority: priority || 'medium',
      assignedTo: clientRecord.crm_manager || null
    };
    
    const query = await Query.create(queryData);
    
    // Populate the created query
    await query.populate('client', 'name email university');
    await query.populate('assignedTo', 'first_name last_name email');
    
    console.log('❓ Query created:', {
      id: query._id,
      client: clientRecord.name,
      subject: query.subject,
      assignedTo: query.assignedTo?.email,
      createdBy: req.user.email
    });
    
    res.status(201).json({
      success: true,
      message: 'Query created successfully',
      data: query
    });
  } catch (error) {
    console.error('❌ Error creating query:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create query',
      error: error.message
    });
  }
};

// @route   POST /api/queries/:id/respond
// @desc    Add response to query
// @access  Private (Admin, CRM Manager)
exports.respondToQuery = async (req, res) => {
  try {
    const { message, isInternal = false } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }
    
    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }
    
    // Check access permission for CRM managers
    if (req.user.role === 'crm_manager') {
      const client = await Client.findById(query.client);
      if (!client || !client.crm_manager || client.crm_manager.toString() !== req.user.user_id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }
    
    // Add response
    query.responses.push({
      user: req.user.user_id,
      message,
      isInternal,
      timestamp: new Date()
    });
    
    // Update status if it was open
    if (query.status === 'open') {
      query.status = 'in_progress';
    }
    
    await query.save();
    
    // Populate the updated query
    await query.populate('client', 'name email university');
    await query.populate('assignedTo', 'first_name last_name email');
    await query.populate('responses.user', 'first_name last_name email role');
    
    console.log('💬 Response added to query:', {
      queryId: query._id,
      respondedBy: req.user.email,
      message: message.substring(0, 50) + '...'
    });
    
    res.json({
      success: true,
      message: 'Response added successfully',
      data: query
    });
  } catch (error) {
    console.error('❌ Error adding response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: error.message
    });
  }
};

// @route   PATCH /api/queries/:id/status
// @desc    Update query status
// @access  Private (Admin, CRM Manager)
exports.updateQueryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['open', 'in_progress', 'waiting', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }
    
    // Check access permission for CRM managers
    if (req.user.role === 'crm_manager') {
      const client = await Client.findById(query.client);
      if (!client || !client.crm_manager || client.crm_manager.toString() !== req.user.user_id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }
    
    query.status = status;
    
    // Set timestamps
    if (status === 'resolved') {
      query.resolvedAt = new Date();
    } else if (status === 'closed') {
      query.closedAt = new Date();
    }
    
    await query.save();
    
    console.log('📝 Query status updated:', {
      queryId: query._id,
      newStatus: status,
      updatedBy: req.user.email
    });
    
    res.json({
      success: true,
      message: 'Query status updated successfully',
      data: query
    });
  } catch (error) {
    console.error('❌ Error updating query status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update query status',
      error: error.message
    });
  }
};

// @route   GET /api/queries/stats/summary
// @desc    Get query statistics
// @access  Private (Admin, CRM Manager)
exports.getQueryStats = async (req, res) => {
  try {
    let matchQuery = {};
    
    // Filter by assigned clients for CRM managers
    if (req.user.role === 'crm_manager') {
      const assignedClients = await Client.find({ crm_manager: req.user.user_id }).select('_id');
      const clientIds = assignedClients.map(client => client._id);
      matchQuery.client = { $in: clientIds };
    }
    
    const stats = await Query.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const priorityStats = await Query.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        byStatus: stats,
        byPriority: priorityStats
      }
    });
  } catch (error) {
    console.error('❌ Error fetching query stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get queries assigned to current CRM manager
// @route   GET /api/queries/my-queries
// @access  Private (CRM Manager only)
exports.getMyQueries = async (req, res) => {
  try {
    console.log('❓ === GET MY QUERIES REQUEST ===');
    console.log('❓ User:', req.user?.email, 'Role:', req.user?.role);
    
    if (req.user.role !== 'crm_manager') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only CRM managers can access this endpoint'
        }
      });
    }
    
    const { status, priority, page = 1, limit = 20 } = req.query;
    
    // Get assigned clients
    const assignedClients = await Client.find({ 
      crm_manager: req.user.user_id 
    }).select('_id');
    
    const clientIds = assignedClients.map(client => client._id);
    
    if (clientIds.length === 0) {
      return res.json({
        success: true,
        count: 0,
        total: 0,
        page: parseInt(page),
        totalPages: 0,
        data: []
      });
    }
    
    // Build query for assigned clients' queries
    let query = {
      client: { $in: clientIds }
    };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    const queries = await Query.find(query)
      .populate('client', 'name email university')
      .populate('assignedTo', 'first_name last_name email')
      .populate('responses.user', 'first_name last_name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Query.countDocuments(query);
    
    console.log('❓ Found CRM queries:', queries.length, 'Total:', count);
    
    res.json({
      success: true,
      count: queries.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: queries
    });
  } catch (error) {
    console.error('❌ Get CRM queries error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CRM_QUERIES_FAILED',
        message: error.message
      }
    });
  }
};

module.exports = exports;