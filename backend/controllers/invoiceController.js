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
      if (invoice.created_by._id.toString() !== req.user._id.toString()) {
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

// @desc    View invoice as HTML
// @route   GET /api/invoices/:id/view
// @access  Private (Admin, Lead Manager, CRM Manager, Client)
exports.viewInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'name email company phone address')
      .populate('project', 'project_id service_name')
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
    
    // Role-based access control
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
      const clientRecord = await Client.findById(invoice.client._id);
      
      // Get the full project details to check assigned_to field
      const Project = require('../models/Project');
      const projectRecord = invoice.project ? await Project.findById(invoice.project._id) : null;
      
      console.log('👁️ View Security check - CRM Manager:', req.user.email);
      console.log('👁️ Invoice client ID:', invoice.client._id);
      console.log('👁️ Invoice project ID:', invoice.project?._id);
      console.log('👁️ Client record found:', !!clientRecord);
      console.log('👁️ Project record found:', !!projectRecord);
      console.log('👁️ Client record CRM manager:', clientRecord?.crm_manager);
      console.log('👁️ Project assigned_to:', projectRecord?.assigned_to);
      console.log('👁️ Current user ID:', req.user._id);
      console.log('👁️ Current user ID type:', typeof req.user._id);
      
      // Ensure we have a valid user ID
      const currentUserId = req.user._id || req.user.user_id || req.user.id;
      if (!currentUserId) {
        console.log('👁️ ERROR: No valid user ID found in req.user');
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Invalid user authentication'
          }
        });
      }
      
      // Check if CRM manager has access via client assignment OR direct project assignment
      const hasClientAccess = clientRecord && clientRecord.crm_manager && 
                              clientRecord.crm_manager.toString() === currentUserId.toString();
      const hasProjectAccess = projectRecord && projectRecord.assigned_to && 
                               projectRecord.assigned_to.toString() === currentUserId.toString();
      
      console.log('👁️ Has client access:', hasClientAccess);
      console.log('👁️ Has project access:', hasProjectAccess);
      
      if (!hasClientAccess && !hasProjectAccess) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only view invoices for your assigned clients'
          }
        });
      }
    }
    
    // Generate HTML invoice
    const invoiceHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                line-height: 1.6;
                color: #333;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .company-info {
                text-align: left;
            }
            .company-info h1 {
                color: #3b82f6;
                margin: 0;
                font-size: 28px;
            }
            .invoice-info {
                text-align: right;
            }
            .invoice-number {
                font-size: 24px;
                font-weight: bold;
                color: #3b82f6;
                margin: 0;
            }
            .client-info {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            .client-info h3 {
                margin-top: 0;
                color: #1e40af;
            }
            .invoice-details {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            .invoice-details div {
                flex: 1;
            }
            .line-items {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            .line-items th,
            .line-items td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
            }
            .line-items th {
                background: #3b82f6;
                color: white;
                font-weight: bold;
            }
            .line-items tr:nth-child(even) {
                background: #f8fafc;
            }
            .totals {
                text-align: right;
                margin-bottom: 30px;
            }
            .totals table {
                margin-left: auto;
                border-collapse: collapse;
            }
            .totals td {
                padding: 8px 12px;
                border-bottom: 1px solid #e5e7eb;
            }
            .total-amount {
                font-size: 18px;
                font-weight: bold;
                color: #059669;
                border-top: 2px solid #3b82f6;
            }
            .footer {
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            .status-sent { background: #dbeafe; color: #1e40af; }
            .status-paid { background: #d1fae5; color: #065f46; }
            .status-overdue { background: #fee2e2; color: #991b1b; }
            .status-draft { background: #f3f4f6; color: #374151; }
            @media print {
                body { margin: 0; padding: 15px; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-info">
                <h1>ImmigrationPro</h1>
                <p>Professional Immigration Services<br>
                Email: info@immigrationpro.com<br>
                Phone: +1 (555) 123-4567</p>
            </div>
            <div class="invoice-info">
                <h2 class="invoice-number">Invoice ${invoice.invoice_number}</h2>
                <p>Date: ${new Date(invoice.createdAt).toLocaleDateString()}<br>
                Due Date: ${new Date(invoice.due_date).toLocaleDateString()}</p>
                <span class="status-badge status-${invoice.status}">${invoice.status}</span>
            </div>
        </div>

        <div class="client-info">
            <h3>Bill To:</h3>
            <p><strong>${invoice.client.name}</strong><br>
            ${invoice.client.company ? invoice.client.company + '<br>' : ''}
            Email: ${invoice.client.email}<br>
            ${invoice.client.phone ? 'Phone: ' + invoice.client.phone + '<br>' : ''}
            ${invoice.client.address || ''}</p>
        </div>

        <div class="invoice-details">
            <div>
                <h4>Service Details:</h4>
                <p><strong>${invoice.service_name}</strong><br>
                ${invoice.project ? 'Project: ' + invoice.project.project_id : ''}</p>
            </div>
            <div>
                <h4>Payment Instructions:</h4>
                <p>${invoice.payment_instructions || 'Please pay within 30 days of invoice date.'}</p>
            </div>
        </div>

        <table class="line-items">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.line_items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unit_price.toLocaleString()}</td>
                    <td>$${item.total.toLocaleString()}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <table>
                <tr>
                    <td>Subtotal:</td>
                    <td>$${invoice.amount.toLocaleString()}</td>
                </tr>
                ${invoice.tax_amount > 0 ? `
                <tr>
                    <td>Tax:</td>
                    <td>$${invoice.tax_amount.toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr class="total-amount">
                    <td><strong>Total Amount:</strong></td>
                    <td><strong>$${invoice.total_amount.toLocaleString()}</strong></td>
                </tr>
            </table>
        </div>

        ${invoice.notes ? `
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4>Notes:</h4>
            <p>${invoice.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>Thank you for your business!<br>
            For questions about this invoice, please contact us at info@immigrationpro.com</p>
        </div>

        <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print Invoice</button>
            <button onclick="window.close()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Close</button>
        </div>
    </body>
    </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(invoiceHTML);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'VIEW_INVOICE_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Download invoice as HTML
// @route   POST /api/invoices/:id/download
// @access  Private (Admin, Lead Manager, CRM Manager, Client)
exports.downloadInvoice = async (req, res) => {
  try {
    // Manual token verification since we're using POST
    const token = req.body.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Access denied. No authentication token provided.'
        }
      });
    }

    // Verify token
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token.'
        }
      });
    }

    // Set user info for authorization checks
    req.user = {
      _id: decoded.user_id || decoded._id || decoded.id,
      user_id: decoded.user_id || decoded._id || decoded.id,
      id: decoded.user_id || decoded._id || decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'name email company phone address')
      .populate('project', 'project_id service_name')
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
    
    // Role-based access control
    if (req.user.role === 'client') {
      const clientRecord = await Client.findOne({ email: req.user.email });
      if (!clientRecord || invoice.client._id.toString() !== clientRecord._id.toString()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only download your own invoices'
          }
        });
      }
    } else if (req.user.role === 'crm_manager') {
      const clientRecord = await Client.findById(invoice.client._id);
      
      // Get the full project details to check assigned_to field
      const Project = require('../models/Project');
      const projectRecord = invoice.project ? await Project.findById(invoice.project._id) : null;
      
      console.log('📄 Download Security check - CRM Manager:', req.user.email);
      console.log('📄 Invoice client ID:', invoice.client._id);
      console.log('📄 Invoice project ID:', invoice.project?._id);
      console.log('📄 Client record found:', !!clientRecord);
      console.log('📄 Project record found:', !!projectRecord);
      console.log('📄 Client record CRM manager:', clientRecord?.crm_manager);
      console.log('📄 Project assigned_to:', projectRecord?.assigned_to);
      console.log('📄 Current user ID:', req.user._id);
      console.log('📄 Current user ID type:', typeof req.user._id);
      
      // Ensure we have a valid user ID
      const currentUserId = req.user._id || req.user.user_id || req.user.id;
      if (!currentUserId) {
        console.log('📄 ERROR: No valid user ID found in req.user');
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Invalid user authentication'
          }
        });
      }
      
      // Check if CRM manager has access via client assignment OR direct project assignment
      const hasClientAccess = clientRecord && clientRecord.crm_manager && 
                              clientRecord.crm_manager.toString() === currentUserId.toString();
      const hasProjectAccess = projectRecord && projectRecord.assigned_to && 
                               projectRecord.assigned_to.toString() === currentUserId.toString();
      
      console.log('📄 Has client access:', hasClientAccess);
      console.log('📄 Has project access:', hasProjectAccess);
      
      if (!hasClientAccess && !hasProjectAccess) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only download invoices for your assigned clients'
          }
        });
      }
    }
    
    // Generate HTML invoice with auto-download functionality
    const invoiceHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                line-height: 1.6;
                color: #333;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .company-info {
                text-align: left;
            }
            .company-info h1 {
                color: #3b82f6;
                margin: 0;
                font-size: 28px;
            }
            .invoice-info {
                text-align: right;
            }
            .invoice-number {
                font-size: 24px;
                font-weight: bold;
                color: #3b82f6;
                margin: 0;
            }
            .client-info {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            .client-info h3 {
                margin-top: 0;
                color: #1e40af;
            }
            .invoice-details {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            .invoice-details div {
                flex: 1;
            }
            .line-items {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            .line-items th,
            .line-items td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
            }
            .line-items th {
                background: #3b82f6;
                color: white;
                font-weight: bold;
            }
            .line-items tr:nth-child(even) {
                background: #f8fafc;
            }
            .totals {
                text-align: right;
                margin-bottom: 30px;
            }
            .totals table {
                margin-left: auto;
                border-collapse: collapse;
            }
            .totals td {
                padding: 8px 12px;
                border-bottom: 1px solid #e5e7eb;
            }
            .total-amount {
                font-size: 18px;
                font-weight: bold;
                color: #059669;
                border-top: 2px solid #3b82f6;
            }
            .footer {
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            .status-sent { background: #dbeafe; color: #1e40af; }
            .status-paid { background: #d1fae5; color: #065f46; }
            .status-overdue { background: #fee2e2; color: #991b1b; }
            .status-draft { background: #f3f4f6; color: #374151; }
            @media print {
                body { margin: 0; padding: 15px; }
            }
        </style>
        <script>
            // Auto-trigger print dialog and close after printing
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                    // Close the window after print dialog
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                }, 500);
            };
        </script>
    </head>
    <body>
        <div class="header">
            <div class="company-info">
                <h1>ImmigrationPro</h1>
                <p>Professional Immigration Services<br>
                Email: info@immigrationpro.com<br>
                Phone: +1 (555) 123-4567</p>
            </div>
            <div class="invoice-info">
                <h2 class="invoice-number">Invoice ${invoice.invoice_number}</h2>
                <p>Date: ${new Date(invoice.createdAt).toLocaleDateString()}<br>
                Due Date: ${new Date(invoice.due_date).toLocaleDateString()}</p>
                <span class="status-badge status-${invoice.status}">${invoice.status}</span>
            </div>
        </div>

        <div class="client-info">
            <h3>Bill To:</h3>
            <p><strong>${invoice.client.name}</strong><br>
            ${invoice.client.company ? invoice.client.company + '<br>' : ''}
            Email: ${invoice.client.email}<br>
            ${invoice.client.phone ? 'Phone: ' + invoice.client.phone + '<br>' : ''}
            ${invoice.client.address || ''}</p>
        </div>

        <div class="invoice-details">
            <div>
                <h4>Service Details:</h4>
                <p><strong>${invoice.service_name}</strong><br>
                ${invoice.project ? 'Project: ' + invoice.project.project_id : ''}</p>
            </div>
            <div>
                <h4>Payment Instructions:</h4>
                <p>${invoice.payment_instructions || 'Please pay within 30 days of invoice date.'}</p>
            </div>
        </div>

        <table class="line-items">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.line_items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unit_price.toLocaleString()}</td>
                    <td>$${item.total.toLocaleString()}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <table>
                <tr>
                    <td>Subtotal:</td>
                    <td>$${invoice.amount.toLocaleString()}</td>
                </tr>
                ${invoice.tax_amount > 0 ? `
                <tr>
                    <td>Tax:</td>
                    <td>$${invoice.tax_amount.toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr class="total-amount">
                    <td><strong>Total Amount:</strong></td>
                    <td><strong>$${invoice.total_amount.toLocaleString()}</strong></td>
                </tr>
            </table>
        </div>

        ${invoice.notes ? `
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4>Notes:</h4>
            <p>${invoice.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>Thank you for your business!<br>
            For questions about this invoice, please contact us at info@immigrationpro.com</p>
        </div>
    </body>
    </html>
    `;
    
    // Set headers for download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="Invoice-${invoice.invoice_number}.html"`);
    res.send(invoiceHTML);
    
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DOWNLOAD_INVOICE_FAILED',
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
  viewInvoice: exports.viewInvoice,
  downloadInvoice: exports.downloadInvoice,
  updateInvoiceStatus: exports.updateInvoiceStatus,
  getInvoiceStats: exports.getInvoiceStats
};