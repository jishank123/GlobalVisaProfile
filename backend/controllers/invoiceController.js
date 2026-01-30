const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Service = require('../models/Service');
const ActivityLog = require('../models/ActivityLog');

// Helper function to log activities
const logActivity = async (userId, action, resourceType, description, ipAddress, resourceId = null) => {
  try {
    if (!action || !resourceType || !description) {
      console.warn('ActivityLog: Missing required fields', { action, resourceType, description });
      return;
    }

    await ActivityLog.create({
      user: userId,
      action,
      resourceType,
      resourceId,
      description,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// @desc    Get all invoices with role-based filtering
// @route   GET /api/invoices
// @access  Private (Admin, Lead Manager, CRM Manager, Client)
exports.getInvoices = async (req, res) => {
  try {
    const { search, status, client, page = 1, limit = 20 } = req.query;
    
    // Build query with security filters
    let query = {};
    
    // Role-based access control
    if (req.user.role === 'crm_manager') {
      // CRM managers can only see invoices for their assigned clients
      const assignedClients = await Client.find({ crm_manager: req.user.user_id }).select('_id');
      const clientIds = assignedClients.map(client => client._id);
      query.client = { $in: clientIds };
    } else if (req.user.role === 'lead_manager') {
      // Lead managers can see invoices they created
      query.created_by = req.user.user_id;
    } else if (req.user.role === 'client') {
      // Clients can only see their own invoices
      const clientRecord = await Client.findOne({ email: req.user.email });
      if (clientRecord) {
        query.client = clientRecord._id;
      } else {
        return res.json({
          success: true,
          count: 0,
          total: 0,
          page: parseInt(page),
          totalPages: 0,
          data: []
        });
      }
    }
    
    // Apply filters
    if (search) {
      query.$or = [
        { invoice_number: { $regex: search, $options: 'i' } },
        { service_name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (client && req.user.role !== 'client') query.client = client;
    
    const invoices = await Invoice.find(query)
      .populate('client', 'name email company')
      .populate('project', 'project_id service_name status')
      .populate('service', 'name category')
      .populate('created_by', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Invoice.countDocuments(query);
    
    res.json({
      success: true,
      count: invoices.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_INVOICES_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private (Admin, Lead Manager, CRM Manager, Client)
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'name email phone company')
      .populate('project', 'project_id service_name status')
      .populate('service', 'name category description')
      .populate('created_by', 'first_name last_name email');
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVOICE_NOT_FOUND',
          message: 'Invoice not found'
        }
      });
    }
    
    // Security check - role-based access control
    if (req.user.role === 'client') {
      const clientRecord = await Client.findOne({ email: req.user.email });
      if (!clientRecord || invoice.client._id.toString() !== clientRecord._id.toString()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only view your own invoices'
          }
        });
      }
    } else if (req.user.role === 'crm_manager') {
      const assignedClients = await Client.find({ crm_manager: req.user.user_id }).select('_id');
      const clientIds = assignedClients.map(client => client._id.toString());
      if (!clientIds.includes(invoice.client._id.toString())) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only view invoices for your assigned clients'
          }
        });
      }
    } else if (req.user.role === 'lead_manager') {
      if (invoice.created_by._id.toString() !== req.user.user_id.toString()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only view invoices you created'
          }
        });
      }
    }
    
    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_INVOICE_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private (Admin, Lead Manager)
exports.createInvoice = async (req, res) => {
  try {
    // Only admins and lead managers can create invoices
    if (req.user.role !== 'admin' && req.user.role !== 'lead_manager') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only administrators and lead managers can create invoices'
        }
      });
    }
    
    const { 
      client_id, 
      project_id, 
      service_id, 
      service_name, 
      amount, 
      tax_amount, 
      due_date, 
      description, 
      line_items, 
      notes, 
      payment_instructions 
    } = req.body;
    
    // Validate required fields
    if (!client_id || !service_name || !amount || !due_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Client, service name, amount, and due date are required'
        }
      });
    }
    
    // Verify client exists
    const client = await Client.findById(client_id);
    if (!client) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CLIENT',
          message: 'Client not found'
        }
      });
    }
    
    // Verify project if provided
    if (project_id) {
      const project = await Project.findById(project_id);
      if (!project) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PROJECT',
            message: 'Project not found'
          }
        });
      }
    }
    
    // Calculate due date (30 days from now if not provided)
    const invoiceDueDate = due_date ? new Date(due_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Create line items if not provided
    let invoiceLineItems = line_items;
    if (!invoiceLineItems || invoiceLineItems.length === 0) {
      invoiceLineItems = [{
        description: service_name,
        quantity: 1,
        unit_price: amount,
        total: amount
      }];
    }
    
    const invoiceData = {
      client: client_id,
      project: project_id,
      service: service_id,
      service_name,
      amount,
      tax_amount: tax_amount || 0,
      total_amount: amount + (tax_amount || 0),
      due_date: invoiceDueDate,
      description,
      line_items: invoiceLineItems,
      notes,
      payment_instructions,
      created_by: req.user.user_id
    };
    
    const invoice = await Invoice.create(invoiceData);
    
    // Populate the created invoice
    await invoice.populate('client', 'name email company');
    await invoice.populate('project', 'project_id service_name');
    await invoice.populate('created_by', 'first_name last_name email');
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'create',
      'Invoice',
      `Created invoice ${invoice.invoice_number} for client ${client.name}`,
      req.ip,
      invoice._id
    );
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_INVOICE_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Update invoice status
// @route   PATCH /api/invoices/:id/status
// @access  Private (Admin, Lead Manager)
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status, payment_reference } = req.body;
    
    // Validate status
    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status. Must be: draft, sent, paid, overdue, or cancelled'
        }
      });
    }
    
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVOICE_NOT_FOUND',
          message: 'Invoice not found'
        }
      });
    }
    
    // Update invoice status
    invoice.status = status;
    
    if (status === 'sent' && !invoice.sent_at) {
      invoice.sent_at = new Date();
    }
    
    if (status === 'paid') {
      invoice.paid_at = new Date();
      if (payment_reference) {
        invoice.payment_reference = payment_reference;
      }
    }
    
    await invoice.save();
    
    // Populate the updated invoice
    await invoice.populate('client', 'name email');
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'status_change',
      'Invoice',
      `Updated invoice ${invoice.invoice_number} status to ${status}`,
      req.ip,
      invoice._id
    );
    
    res.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_INVOICE_STATUS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get invoice statistics
// @route   GET /api/invoices/stats/summary
// @access  Private (Admin, Lead Manager, CRM Manager)
exports.getInvoiceStats = async (req, res) => {
  try {
    let query = {};
    
    // Filter by role
    if (req.user.role === 'crm_manager') {
      const assignedClients = await Client.find({ crm_manager: req.user.user_id }).select('_id');
      const clientIds = assignedClients.map(client => client._id);
      query.client = { $in: clientIds };
    } else if (req.user.role === 'lead_manager') {
      query.created_by = req.user.user_id;
    }
    
    const total = await Invoice.countDocuments(query);
    
    const byStatus = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total_amount' }
        }
      }
    ]);
    
    // Calculate overdue invoices
    const overdueQuery = {
      ...query,
      status: { $in: ['sent'] },
      due_date: { $lt: new Date() }
    };
    
    const overdueCount = await Invoice.countDocuments(overdueQuery);
    
    // Calculate total revenue
    const revenueStats = await Invoice.aggregate([
      { 
        $match: { 
          ...query, 
          status: 'paid' 
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
    const paidInvoices = revenueStats.length > 0 ? revenueStats[0].count : 0;
    
    // Get recent invoices
    const recentInvoices = await Invoice.find(query)
      .populate('client', 'name email')
      .populate('project', 'project_id service_name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        total,
        overdueCount,
        totalRevenue,
        paidInvoices,
        byStatus,
        recentInvoices
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_INVOICE_STATS_FAILED',
        message: error.message
      }
    });
  }
};

module.exports = {
  getInvoices: exports.getInvoices,
  getInvoice: exports.getInvoice,
  createInvoice: exports.createInvoice,
  updateInvoiceStatus: exports.updateInvoiceStatus,
  getInvoiceStats: exports.getInvoiceStats
};