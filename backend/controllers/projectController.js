const Project = require('../models/Project');
const Client = require('../models/Client');
const Service = require('../models/Service');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { validationResult } = require('express-validator');

// Helper function to log activities
const logActivity = async (userId, action, resourceType, description, ipAddress, resourceId = null) => {
  try {
    // Ensure required fields are provided
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

// @desc    Get all projects with role-based filtering
// @route   GET /api/projects
// @access  Private (Admin, Managers, Clients)
exports.getProjects = async (req, res) => {
  try {
    const { search, status, service, client, page = 1, limit = 20 } = req.query;
    
    // Build query with security filters
    let query = {};
    
    // Role-based access control
    if (req.user.role === 'crm_manager') {
      // CRM managers can only see projects for their assigned clients
      const assignedClients = await Client.find({ crm_manager: req.user._id }).select('_id');
      const clientIds = assignedClients.map(client => client._id);
      query.client = { $in: clientIds };
    } else if (req.user.role === 'lead_manager') {
      // Lead managers can only see projects they created
      query.created_by = req.user._id;
    } else if (req.user.role === 'client') {
      // Clients can only see their own projects
      // Find client record by email since there's no direct user link
      const clientRecord = await Client.findOne({ email: req.user.email });
      if (clientRecord) {
        query.client = clientRecord._id;
        console.log('🔍 Client query:', { clientId: clientRecord._id, email: req.user.email });
      } else {
        console.log('❌ No client record found for email:', req.user.email);
        // No client record found, return empty result
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
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (service) query.service = service;
    if (client && req.user.role !== 'client') query.client = client;
    
    const projects = await Project.find(query)
      .populate('client', 'name email company')
      .populate('service', 'name category price')
      .populate('assigned_to', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    console.log('🔍 Query executed:', query);
    console.log('📊 Projects found:', projects.length);
    
    const count = await Project.countDocuments(query);
    console.log('📊 Total count:', count);
    
    // Log activity
    await logActivity(
      req.user._id,
      'view',
      'Project',
      `Viewed projects list. Role: ${req.user.role}, Filters: ${JSON.stringify(req.query)}`,
      req.ip
    );
    
    res.json({
      success: true,
      count: projects.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROJECTS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email company phone')
      .populate('service', 'name category price duration')
      .populate('assigned_to', 'first_name last_name email phone')
      .populate('created_by', 'first_name last_name email');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        }
      });
    }
    
    // Security check - role-based access control
    if (req.user.role === 'client') {
      // Find client record by email since there's no direct user link
      const clientRecord = await Client.findOne({ email: req.user.email });
      if (!clientRecord || project.client._id.toString() !== clientRecord._id.toString()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only view your own projects'
          }
        });
      }
    } else if (req.user.role === 'crm_manager') {
      const clientRecord = await Client.findById(project.client._id);
      if (!clientRecord || !clientRecord.crm_manager || 
          clientRecord.crm_manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only view projects for your assigned clients'
          }
        });
      }
    }
    
    // Log activity
    await logActivity(
      req.user._id,
      'view',
      'Project',
      `Viewed project: ${project.title} (ID: ${project._id})`,
      req.ip,
      project._id
    );
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROJECT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin, Lead Manager, CRM Manager)
exports.createProject = async (req, res) => {
  try {
    const { 
      client, 
      service, 
      service_name, 
      description, 
      priority, 
      amount, 
      start_date, 
      due_date, 
      assigned_to,
      status,
      created_by
    } = req.body;
    
    // Basic validation
    if (!client) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CLIENT',
          message: 'Client ID is required'
        }
      });
    }
    
    if (!service) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_SERVICE',
          message: 'Service ID is required'
        }
      });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Valid amount is required'
        }
      });
    }
    
    if (!start_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_START_DATE',
          message: 'Start date is required'
        }
      });
    }
    
    if (!due_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DUE_DATE',
          message: 'Due date is required'
        }
      });
    }
    
    // Verify client exists
    const clientRecord = await Client.findById(client);
    if (!clientRecord) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client not found'
        }
      });
    }
    
    // Verify service exists
    const serviceRecord = await Service.findById(service);
    if (!serviceRecord) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service not found'
        }
      });
    }
    
    // Security check for CRM managers
    if (req.user.role === 'crm_manager') {
      if (!clientRecord.crm_manager || 
          clientRecord.crm_manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only create projects for your assigned clients'
          }
        });
      }
    }
    
    const projectData = {
      client,
      service,
      service_name: service_name || serviceRecord.name,
      description: description || 'Project created from lead',
      priority: priority || 'medium',
      amount: Number(amount),
      start_date: new Date(start_date),
      due_date: new Date(due_date),
      assigned_to: assigned_to || clientRecord.crm_manager || req.user._id,
      created_by: created_by || req.user._id, // Ensure created_by is always set
      status: status || 'pending' // Use valid enum value
    };
    
    console.log('🔍 Project data with created_by:', {
      ...projectData,
      created_by_user: req.user.email,
      created_by_id: req.user._id
    });
    
    const project = await Project.create(projectData);
    
    // Populate the created project
    await project.populate([
      { path: 'client', select: 'name email company' },
      { path: 'service', select: 'name category price' },
      { path: 'assigned_to', select: 'first_name last_name email' }
    ]);
    
    // Log activity
    await logActivity(
      req.user._id,
      'create',
      'Project',
      `Created new project: ${project.service_name || project.description} for client: ${clientRecord.name}`,
      req.ip,
      project._id
    );
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_PROJECT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Purchase services (for clients)
// @route   POST /api/projects/purchase
// @access  Private (Client)
exports.purchaseServices = async (req, res) => {
  console.log('\n🛒 === SERVICE PURCHASE REQUEST ===');
  
  try {
    let purchaseData;
    
    // Handle both JSON and FormData
    if (req.body.purchaseData) {
      // FormData with file upload
      purchaseData = JSON.parse(req.body.purchaseData);
    } else {
      // Regular JSON
      purchaseData = req.body;
    }
    
    const { services, client, total_amount, payment_method } = purchaseData;
    
    console.log('🛒 Purchase data:', { services, client, total_amount, payment_method });
    console.log('🛒 User info:', { email: req.user.email, role: req.user.role });
    console.log('🛒 File uploaded:', req.file ? req.file.filename : 'No file');
    
    // Validation
    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_SERVICES',
          message: 'At least one service must be selected'
        }
      });
    }
    
    // Find client record - either by provided ID or by user email
    let clientRecord;
    if (client) {
      clientRecord = await Client.findById(client);
    } else {
      // If no client ID provided, find by user email
      clientRecord = await Client.findOne({ email: req.user.email });
    }
    
    if (!clientRecord) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client record not found. Please contact support.'
        }
      });
    }
    
    console.log('🛒 Found client record:', { id: clientRecord._id, name: clientRecord.name, email: clientRecord.email });
    
    // Security check - clients can only purchase for themselves
    if (req.user.role === 'client' && clientRecord.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only purchase services for yourself'
        }
      });
    }
    
    // Verify all services exist
    const serviceRecords = await Service.find({ _id: { $in: services }, isActive: true, isDeleted: false });
    if (serviceRecords.length !== services.length) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SERVICES',
          message: 'One or more services are invalid or unavailable'
        }
      });
    }
    
    // Create projects for each service
    const createdProjects = [];
    const currentDate = new Date();
    const dueDate = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    
    for (const serviceId of services) {
      const serviceRecord = serviceRecords.find(s => s._id.toString() === serviceId);
      
      const projectData = {
        client: clientRecord._id, // Use the found client record ID
        service: serviceId,
        service_name: serviceRecord.name,
        description: `Service purchased: ${serviceRecord.name}`,
        priority: 'medium',
        amount: serviceRecord.pricing?.minPrice || 0,
        budget: serviceRecord.pricing?.minPrice || 0,
        start_date: currentDate,
        due_date: dueDate,
        deadline: dueDate,
        assigned_to: clientRecord.crm_manager || req.user._id, // Ensure assigned_to is always set
        created_by: req.user._id,
        status: 'pending',
        payment_method: payment_method || 'card',
        payment_receipt: req.file ? req.file.filename : null,
        purchase_date: currentDate
      };
      
      const project = await Project.create(projectData);
      
      // Populate the created project
      await project.populate([
        { path: 'client', select: 'name email company' },
        { path: 'service', select: 'name category pricing' },
        { path: 'assigned_to', select: 'first_name last_name email' }
      ]);
      
      createdProjects.push(project);
      
      // Log activity
      await logActivity(
        req.user._id,
        'purchase',
        'Project',
        `Purchased service: ${serviceRecord.name} for $${serviceRecord.pricing?.minPrice || 0}`,
        req.ip,
        project._id
      );
    }
    
    console.log('✅ Created projects:', createdProjects.length);
    
    res.status(201).json({
      success: true,
      message: `Successfully purchased ${createdProjects.length} service(s)`,
      data: createdProjects
    });
    
  } catch (error) {
    console.error('💥 Service purchase error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PURCHASE_FAILED',
        message: error.message
      }
    });
  }
  
  console.log('🛒 === SERVICE PURCHASE REQUEST COMPLETED ===\n');
};

// @desc    Update project
// @route   PATCH /api/projects/:id
// @access  Private (Admin, Lead Manager, Assigned Manager)
exports.updateProject = async (req, res) => {
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
    
    const project = await Project.findById(req.params.id).populate('client');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        }
      });
    }
    
    // Security check - role-based access control
    if (req.user.role === 'crm_manager') {
      const clientRecord = await Client.findById(project.client._id);
      console.log('🔒 Update Security check - CRM Manager:', req.user.email);
      console.log('🔒 Project client ID:', project.client._id);
      console.log('🔒 Project assigned_to:', project.assigned_to);
      console.log('🔒 Client record found:', !!clientRecord);
      console.log('🔒 Client record CRM manager:', clientRecord?.crm_manager);
      console.log('🔒 Current user ID:', req.user._id);
      
      // Check if CRM manager has access via client assignment OR direct project assignment
      const hasClientAccess = clientRecord && clientRecord.crm_manager && 
                              clientRecord.crm_manager.toString() === req.user._id.toString();
      const hasProjectAccess = project.assigned_to && 
                               project.assigned_to.toString() === req.user._id.toString();
      
      console.log('🔒 Has client access:', hasClientAccess);
      console.log('🔒 Has project access:', hasProjectAccess);
      
      if (!hasClientAccess && !hasProjectAccess) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only update projects for your assigned clients'
          }
        });
      }
    }
    
    // Define allowed fields based on role
    let allowedFields = ['title', 'description', 'status', 'progress', 'priority', 'deadline', 'notes'];
    
    if (req.user.role === 'admin') {
      // Admins can update payment verification fields
      allowedFields.push('verification_status', 'admin_notes', 'verified_at', 'verified_by');
    }
    
    if (req.user.role === 'crm_manager') {
      // CRM managers can update progress, status, and payment verification fields
      allowedFields = ['status', 'progress', 'notes', 'verification_status', 'admin_notes', 'verified_at', 'verified_by'];
    }
    
    // Update only allowed fields
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    // Validate progress percentage
    if (updateData.progress !== undefined) {
      if (updateData.progress < 0 || updateData.progress > 100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PROGRESS',
            message: 'Progress must be between 0 and 100'
          }
        });
      }
    }
    
    // Auto-update status based on progress
    if (updateData.progress !== undefined) {
      if (updateData.progress === 0) {
        updateData.status = 'planning';
      } else if (updateData.progress === 100) {
        updateData.status = 'completed';
        updateData.completed_at = new Date();
      } else {
        updateData.status = 'in_progress';
      }
    }
    
    Object.assign(project, updateData);
    project.updated_at = new Date();
    await project.save();
    
    // Populate updated project
    await project.populate([
      { path: 'client', select: 'name email company' },
      { path: 'service', select: 'name category price' },
      { path: 'assigned_to', select: 'first_name last_name email' }
    ]);
    
    // Log activity
    await logActivity(
      req.user._id,
      'update',
      'Project',
      `Updated project: ${project.title}. Fields: ${Object.keys(updateData).join(', ')}`,
      req.ip,
      project._id
    );
    
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_PROJECT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Generate invoice for project
// @route   POST /api/projects/:id/invoice
// @access  Private (Admin, Lead Manager)
exports.generateProjectInvoice = async (req, res) => {
  try {
    console.log('\n📄 === GENERATE PROJECT INVOICE REQUEST ===');
    console.log('📄 Project ID:', req.params.id);
    console.log('📄 User:', req.user?.email, 'Role:', req.user?.role);
    
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email company')
      .populate('service', 'name category pricing');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        }
      });
    }
    
    // Security check for CRM managers
    if (req.user.role === 'crm_manager') {
      const clientRecord = await Client.findById(project.client._id);
      console.log('📄 Invoice Security check - CRM Manager:', req.user.email);
      console.log('📄 Project client ID:', project.client._id);
      console.log('📄 Project assigned_to:', project.assigned_to);
      console.log('📄 Client record found:', !!clientRecord);
      console.log('📄 Client record CRM manager:', clientRecord?.crm_manager);
      console.log('📄 Current user ID:', req.user._id);
      
      // Check if CRM manager has access via client assignment OR direct project assignment
      const hasClientAccess = clientRecord && clientRecord.crm_manager && 
                              clientRecord.crm_manager.toString() === req.user._id.toString();
      const hasProjectAccess = project.assigned_to && 
                               project.assigned_to.toString() === req.user._id.toString();
      
      console.log('📄 Has client access:', hasClientAccess);
      console.log('📄 Has project access:', hasProjectAccess);
      
      if (!hasClientAccess && !hasProjectAccess) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only generate invoices for your assigned clients'
          }
        });
      }
    }
    
    // Check if project is in a valid state for invoicing
    if (project.status !== 'active' && project.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROJECT_STATUS',
          message: 'Can only generate invoices for active or completed projects'
        }
      });
    }
    
    // Check if invoice already exists for this project
    const Invoice = require('../models/Invoice');
    const existingInvoice = await Invoice.findOne({ project: project._id });
    
    if (existingInvoice) {
      console.log('📄 Existing invoice found:', existingInvoice.invoice_number);
      return res.json({
        success: true,
        message: 'Invoice already exists for this project',
        data: existingInvoice,
        invoiceUrl: `/api/invoices/${existingInvoice._id}`
      });
    }
    
    // Calculate due date (30 days from now)
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Create invoice data
    const invoiceData = {
      client: project.client._id,
      project: project._id,
      service: project.service,
      service_name: project.service_name,
      amount: project.amount || 0,
      tax_amount: 0, // You can calculate tax if needed
      total_amount: project.amount || 0,
      due_date: dueDate,
      description: `Invoice for ${project.service_name} service`,
      line_items: [{
        description: project.service_name,
        quantity: 1,
        unit_price: project.amount || 0,
        total: project.amount || 0
      }],
      notes: project.admin_notes || '',
      payment_instructions: 'Please pay within 30 days of invoice date.',
      created_by: req.user._id,
      status: 'sent'
    };
    
    // Generate invoice number manually as fallback
    if (!invoiceData.invoice_number) {
      try {
        const count = await Invoice.countDocuments();
        const year = new Date().getFullYear();
        invoiceData.invoice_number = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;
      } catch (error) {
        console.log('📄 Using timestamp-based invoice number');
        invoiceData.invoice_number = `INV-${Date.now()}`;
      }
    }
    
    console.log('📄 Creating invoice with data:', {
      client: project.client.name,
      service: project.service_name,
      amount: project.amount,
      invoiceData: invoiceData
    });
    
    const invoice = await Invoice.create(invoiceData);
    console.log('📄 Invoice created with number:', invoice.invoice_number);
    
    // Populate the created invoice
    await invoice.populate('client', 'name email company');
    await invoice.populate('project', 'project_id service_name');
    await invoice.populate('created_by', 'first_name last_name email');
    
    // Log activity
    await logActivity(
      req.user._id,
      'create',
      'Invoice',
      `Generated invoice ${invoice.invoice_number} for project ${project.service_name}`,
      req.ip,
      invoice._id
    );
    
    console.log('📄 Invoice created successfully:', invoice.invoice_number);
    
    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      data: invoice,
      invoiceUrl: `/api/invoices/${invoice._id}`
    });
    
  } catch (error) {
    console.error('❌ Generate invoice error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATE_INVOICE_FAILED',
        message: error.message
      }
    });
  }
  
  console.log('📄 === GENERATE PROJECT INVOICE REQUEST COMPLETED ===\n');
};

// @desc    Delete project (soft delete)
// @route   DELETE /api/projects/:id
// @access  Private (Admin, Lead Manager)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        }
      });
    }
    
    // Soft delete - change status instead of actual deletion
    project.status = 'cancelled';
    project.cancelled_at = new Date();
    project.cancelled_by = req.user._id;
    await project.save();
    
    // Log activity
    await logActivity(
      req.user._id,
      'delete',
      'Project',
      `Cancelled project: ${project.title}`,
      req.ip,
      project._id
    );
    
    res.json({
      success: true,
      message: 'Project cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_PROJECT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/stats/summary
// @access  Private (Admin, Managers)
exports.getProjectStats = async (req, res) => {
  try {
    let query = { status: { $ne: 'cancelled' } };
    
    // Filter by assigned clients for CRM managers
    if (req.user.role === 'crm_manager') {
      const assignedClients = await Client.find({ crm_manager: req.user._id }).select('_id');
      const clientIds = assignedClients.map(client => client._id);
      query.client = { $in: clientIds };
    }
    
    const total = await Project.countDocuments(query);
    
    const byStatus = await Project.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const byPriority = await Project.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const avgProgress = await Project.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);
    
    const recentProjects = await Project.find(query)
      .populate('client', 'name email')
      .populate('service', 'name category')
      .sort({ created_at: -1 })
      .limit(5);
    
    // Log activity
    await logActivity(
      req.user._id,
      'view',
      'System',
      `Viewed project statistics. Role: ${req.user.role}`,
      req.ip
    );
    
    res.json({
      success: true,
      data: {
        total,
        byStatus,
        byPriority,
        averageProgress: avgProgress[0]?.averageProgress || 0,
        recentProjects
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROJECT_STATS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get projects assigned to current CRM manager
// @route   GET /api/projects/my-projects
// @access  Private (CRM Manager only)
exports.getMyProjects = async (req, res) => {
  try {
    console.log('📊 === GET MY PROJECTS REQUEST ===');
    console.log('📊 User object:', JSON.stringify(req.user, null, 2));
    console.log('📊 User email:', req.user?.email);
    console.log('📊 User role:', req.user?.role);
    console.log('📊 User ID from req.user._id:', req.user?._id);
    console.log('📊 User ID from req.user._id:', req.user?._id);
    console.log('📊 User ID from req.user.id:', req.user?.id);
    console.log('📊 Sample project assigned_to for comparison: "697ec40613b779c47c5cd4cd"');
    
    if (req.user.role !== 'crm_manager') {
      console.log('❌ Access denied - not a CRM manager. Role:', req.user.role);
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only CRM managers can access this endpoint'
        }
      });
    }
    
    const { status, page = 1, limit = 20 } = req.query;
    const crmManagerId = req.user._id || req.user.id;
    
    console.log('📊 Final CRM Manager ID used for query:', crmManagerId);
    console.log('📊 CRM Manager ID type:', typeof crmManagerId);
    console.log('📊 CRM Manager ID toString():', crmManagerId.toString());
    
    // Build query for projects directly assigned to this CRM manager
    // Use both ObjectId and string comparison to handle different data types
    let query = {
      $or: [
        { assigned_to: crmManagerId },
        { assigned_to: crmManagerId.toString() }
      ],
      status: { $ne: 'deleted' } // Exclude deleted projects
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    console.log('📊 MongoDB Query:', JSON.stringify(query, null, 2));
    
    // First, let's check if there are ANY projects with this assigned_to value
    const allProjectsWithThisAssignedTo = await Project.find({ 
      $or: [
        { assigned_to: crmManagerId },
        { assigned_to: crmManagerId.toString() }
      ]
    }).lean();
    console.log('📊 ALL projects with assigned_to matching CRM ID:', allProjectsWithThisAssignedTo.length);
    
    // Let's also check what assigned_to values exist in the database
    const distinctAssignedTo = await Project.distinct('assigned_to');
    console.log('📊 All distinct assigned_to values in database:', distinctAssignedTo);
    console.log('📊 Checking if CRM ID matches any assigned_to values:');
    distinctAssignedTo.forEach(assignedId => {
      const matches = assignedId.toString() === crmManagerId.toString();
      console.log(`📊   ${assignedId} (${typeof assignedId}) === ${crmManagerId} (${typeof crmManagerId}) ? ${matches}`);
    });
    
    // Check specifically for the sample project
    const sampleProject = await Project.findOne({ project_id: "PRJ-0003" }).lean();
    if (sampleProject) {
      console.log('📊 Sample project PRJ-0003 found:');
      console.log('📊   assigned_to:', sampleProject.assigned_to);
      console.log('📊   assigned_to type:', typeof sampleProject.assigned_to);
      console.log('📊   assigned_to toString():', sampleProject.assigned_to.toString());
      console.log('📊   Does it match CRM ID?', sampleProject.assigned_to.toString() === crmManagerId.toString());
    } else {
      console.log('📊 Sample project PRJ-0003 not found in database');
    }
    
    const projects = await Project.find(query)
      .populate('client', 'name firstName lastName email company')
      .populate('service', 'name category price')
      .populate('assigned_to', 'first_name last_name email')
      .populate('created_by', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Project.countDocuments(query);
    
    console.log('📊 Found assigned projects:', projects.length, 'Total:', count);
    
    // Log each project for debugging
    projects.forEach((project, index) => {
      console.log(`📊 Project ${index + 1}:`, {
        id: project._id,
        project_id: project.project_id,
        assigned_to: project.assigned_to?._id || project.assigned_to,
        assigned_to_type: typeof project.assigned_to,
        client: project.client?.name || `${project.client?.firstName} ${project.client?.lastName}`,
        service: project.service?.name || project.service_name,
        status: project.status
      });
    });
    
    res.json({
      success: true,
      count: projects.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: projects
    });
  } catch (error) {
    console.error('❌ Get CRM projects error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CRM_PROJECTS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Add milestone/task to project
// @route   POST /api/projects/:id/milestones
// @access  Private (CRM Manager, Admin)
exports.addProjectMilestone = async (req, res) => {
  try {
    console.log('📝 === ADD PROJECT MILESTONE REQUEST ===');
    console.log('📝 User:', req.user?.email, 'Role:', req.user?.role);
    console.log('📝 Request body:', req.body);
    
    const { title, status = 'pending', target_date, notes } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TITLE',
          message: 'Milestone title is required'
        }
      });
    }
    
    const project = await Project.findById(req.params.id).populate('client');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        }
      });
    }
    
    // Security check - only assigned CRM or admin can add milestones
    if (req.user.role === 'crm_manager') {
      const clientRecord = await Client.findById(project.client._id);
      if (!clientRecord || !clientRecord.crm_manager || 
          clientRecord.crm_manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only add milestones to projects assigned to you'
          }
        });
      }
    }
    
    // Add milestone
    const milestone = {
      title,
      status,
      target_date: target_date ? new Date(target_date) : undefined,
      notes
    };
    
    project.milestones = project.milestones || [];
    project.milestones.push(milestone);
    project.updated_at = new Date();
    
    await project.save();
    
    // Log activity
    await logActivity(
      req.user._id,
      'create',
      'Project',
      `Added milestone "${title}" to project ${project.project_id}`,
      req.ip,
      project._id
    );
    
    console.log('📝 Milestone added successfully:', {
      projectId: project.project_id,
      milestoneTitle: title,
      addedBy: req.user.email
    });
    
    res.json({
      success: true,
      message: 'Milestone added successfully',
      data: project
    });
  } catch (error) {
    console.error('📝 Add milestone error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ADD_MILESTONE_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Add note to project
// @route   POST /api/projects/:id/notes
// @access  Private (CRM Manager, Admin)
exports.addProjectNote = async (req, res) => {
  try {
    console.log('📝 === ADD PROJECT NOTE REQUEST ===');
    console.log('📝 User:', req.user?.email, 'Role:', req.user?.role);
    console.log('📝 Request body:', req.body);
    
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TEXT',
          message: 'Note text is required'
        }
      });
    }
    
    const project = await Project.findById(req.params.id).populate('client');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        }
      });
    }
    
    // Security check - only assigned CRM or admin can add notes
    if (req.user.role === 'crm_manager') {
      const clientRecord = await Client.findById(project.client._id);
      if (!clientRecord || !clientRecord.crm_manager || 
          clientRecord.crm_manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only add notes to projects assigned to you'
          }
        });
      }
    }
    
    // Add note
    const note = {
      text: text.trim(),
      created_by: req.user._id,
      created_at: new Date()
    };
    
    project.notes = project.notes || [];
    project.notes.push(note);
    project.updated_at = new Date();
    
    await project.save();
    
    // Log activity
    await logActivity(
      req.user._id,
      'create',
      'Project',
      `Added note to project ${project.project_id}`,
      req.ip,
      project._id
    );
    
    console.log('📝 Note added successfully:', {
      projectId: project.project_id,
      noteLength: text.length,
      addedBy: req.user.email
    });
    
    res.json({
      success: true,
      message: 'Note added successfully',
      data: project
    });
  } catch (error) {
    console.error('📝 Add note error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ADD_NOTE_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Handover project to another CRM manager
// @route   PATCH /api/projects/:id/handover
// @access  Private (CRM Manager, Admin)
exports.handoverProject = async (req, res) => {
  try {
    console.log('🔄 === PROJECT HANDOVER REQUEST ===');
    console.log('🔄 User:', req.user?.email, 'Role:', req.user?.role);
    console.log('🔄 Request body:', req.body);
    
    const { new_crm_manager, handover_reason, handover_notes } = req.body;
    
    // Validation
    if (!new_crm_manager) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CRM_MANAGER',
          message: 'New CRM manager ID is required'
        }
      });
    }
    
    if (!handover_notes || handover_notes.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_HANDOVER_NOTES',
          message: 'Handover notes are required'
        }
      });
    }
    
    // Verify new CRM manager exists and has correct role
    const newCrmManager = await User.findById(new_crm_manager);
    if (!newCrmManager || newCrmManager.role !== 'crm_manager') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CRM_MANAGER',
          message: 'Invalid CRM manager ID or user is not a CRM manager'
        }
      });
    }
    
    const project = await Project.findById(req.params.id).populate('client');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        }
      });
    }
    
    // Security check - only current assigned CRM or admin can handover
    if (req.user.role === 'crm_manager') {
      const clientRecord = await Client.findById(project.client._id);
      console.log('🔒 Handover security check - CRM Manager:', req.user.email);
      console.log('🔒 Client record CRM manager:', clientRecord?.crm_manager);
      console.log('🔒 Current user ID:', req.user._id);
      console.log('🔒 Comparison result:', clientRecord?.crm_manager?.toString() === req.user._id.toString());
      
      if (!clientRecord || !clientRecord.crm_manager || 
          clientRecord.crm_manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only handover projects assigned to you'
          }
        });
      }
    }
    
    const oldCrmManager = project.assigned_to;
    
    // Update project assignment
    project.assigned_to = new_crm_manager;
    project.handover_history = project.handover_history || [];
    project.handover_history.push({
      from_crm: oldCrmManager,
      to_crm: new_crm_manager,
      reason: handover_reason || 'Not specified',
      notes: handover_notes,
      handover_date: new Date(),
      handover_by: req.user._id
    });
    project.updated_at = new Date();
    
    await project.save();
    
    // Also update client assignment
    await Client.findByIdAndUpdate(
      project.client._id,
      { 
        crm_manager: new_crm_manager,
        updated_at: new Date()
      }
    );
    
    // Populate the updated project
    await project.populate([
      { path: 'client', select: 'name email company' },
      { path: 'service', select: 'name category price' },
      { path: 'assigned_to', select: 'first_name last_name email' }
    ]);
    
    // Log activity
    await logActivity(
      req.user._id,
      'update',
      'Project',
      `Handed over project ${project.project_id} from ${req.user.email} to ${newCrmManager.email}. Reason: ${handover_reason}`,
      req.ip,
      project._id
    );
    
    console.log('🔄 Project handover successful:', {
      projectId: project.project_id,
      from: req.user.email,
      to: newCrmManager.email,
      reason: handover_reason
    });
    
    res.json({
      success: true,
      message: 'Project handed over successfully',
      data: {
        project: project,
        handover_details: {
          from_crm: req.user.email,
          to_crm: newCrmManager.email,
          reason: handover_reason,
          notes: handover_notes,
          handover_date: new Date()
        }
      }
    });
  } catch (error) {
    console.error('🔄 Project handover error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HANDOVER_PROJECT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Bulk assign projects to CRM manager (Lead Manager only)
// @route   POST /api/projects/bulk/assign-to-crm
// @access  Private (Lead Manager, Admin)
exports.bulkAssignProjectsToCrm = async (req, res) => {
  try {
    console.log('🎯 === BULK ASSIGN PROJECTS TO CRM REQUEST ===');
    console.log('🎯 User:', req.user?.email, 'Role:', req.user?.role);
    console.log('🎯 Request body:', req.body);
    
    const { project_ids, crm_manager_id, notes } = req.body;
    
    // Validation
    if (!project_ids || !Array.isArray(project_ids) || project_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PROJECT_IDS',
          message: 'Project IDs array is required and cannot be empty'
        }
      });
    }
    
    if (!crm_manager_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_MANAGER_ID',
          message: 'CRM Manager ID is required'
        }
      });
    }
    
    // Verify manager exists and has correct role
    const manager = await User.findById(crm_manager_id);
    if (!manager || manager.role !== 'crm_manager') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MANAGER',
          message: 'Invalid manager ID or user is not a CRM manager'
        }
      });
    }
    
    console.log('🎯 CRM Manager found:', manager.email, 'Role:', manager.role);
    
    // Process each project assignment
    const results = [];
    const errors = [];
    
    for (const projectId of project_ids) {
      try {
        // First check if project exists
        const existingProject = await Project.findById(projectId).populate('client');
        if (!existingProject) {
          errors.push({
            projectId: projectId,
            error: 'Project not found'
          });
          continue;
        }
        
        // Check if project is created from lead and in planning/pending status
        if (!['planning', 'pending'].includes(existingProject.status)) {
          errors.push({
            projectId: projectId,
            error: 'Only projects in planning or pending status can be assigned to CRM managers'
          });
          continue;
        }
        
        // Update project with CRM manager assignment
        const project = await Project.findByIdAndUpdate(
          projectId,
          { 
            assigned_to: crm_manager_id,
            status: 'active', // Change status to active when assigned to CRM
            updated_at: new Date(),
            assignment_notes: notes || '',
            assigned_to_crm_at: new Date(),
            assigned_to_crm_by: req.user._id
          },
          { new: true }
        ).populate('client', 'name email')
        .populate('service', 'name category')
        .populate('assigned_to', 'first_name last_name email');
        
        // Also update the client to be assigned to this CRM manager
        if (existingProject.client) {
          await Client.findByIdAndUpdate(
            existingProject.client._id,
            { 
              crm_manager: crm_manager_id,
              updated_at: new Date()
            }
          );
        }
        
        if (project) {
          results.push({
            projectId: projectId,
            success: true,
            project: project
          });
          
          // Log activity
          await logActivity(
            req.user._id,
            'update',
            'Project',
            `Assigned project ${project.project_id} to CRM manager ${manager.email}`,
            req.ip,
            project._id
          );
        } else {
          errors.push({
            projectId: projectId,
            error: 'Failed to update project'
          });
        }
      } catch (error) {
        console.error('🎯 Error assigning project:', projectId, error);
        errors.push({
          projectId: projectId,
          error: error.message
        });
      }
    }
    
    console.log('🎯 Assignment results:', {
      successful: results.length,
      failed: errors.length,
      total: project_ids.length
    });
    
    // Return results
    const response = {
      success: true,
      message: `Successfully assigned ${results.length} of ${project_ids.length} projects to CRM manager`,
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
      response.warning = `${errors.length} project(s) could not be assigned`;
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('🎯 Bulk project assignment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BULK_PROJECT_ASSIGN_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get projects created by current lead manager
// @route   GET /api/projects/my-created-projects
// @access  Private (Lead Manager only)
exports.getMyCreatedProjects = async (req, res) => {
  try {
    console.log('📊 === GET MY CREATED PROJECTS REQUEST ===');
    console.log('📊 User:', req.user?.email, 'Role:', req.user?.role);
    
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
    
    // Build query for projects created by this lead manager
    let query = {
      created_by: req.user._id
    };
    
    if (status) query.status = status;
    
    const projects = await Project.find(query)
      .populate('client', 'name email company')
      .populate('service', 'name category price')
      .populate('assigned_to', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Project.countDocuments(query);
    
    console.log('📊 Found lead manager created projects:', projects.length, 'Total:', count);
    
    res.json({
      success: true,
      count: projects.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: projects
    });
  } catch (error) {
    console.error('❌ Get lead manager created projects error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_LEAD_MANAGER_PROJECTS_FAILED',
        message: error.message
      }
    });
  }
};

module.exports = exports;