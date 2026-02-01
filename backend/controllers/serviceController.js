const Service = require('../models/Service');
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

// @desc    Get all services with filtering
// @route   GET /api/services
// @access  Private (Admin, Lead Manager, CRM Manager)
exports.getServices = async (req, res) => {
  console.log('\n📋 === GET SERVICES REQUEST ===');
  console.log('📋 User role:', req.user?.role);
  console.log('📋 User requesting services list');
  
  try {
    const { search, category, status, page = 1, limit = 20 } = req.query;
    
    // Build query - by default only show active, non-deleted services
    let query = { isActive: true, isDeleted: false };
    
    // For non-admin users, only show active, non-deleted services
    if (req.user.role !== 'admin') {
      query = { isActive: true, isDeleted: false };
    } else {
      // Admin can see all services based on status filter
      if (status === 'active') query = { isActive: true, isDeleted: false };
      if (status === 'inactive') query = { isActive: false, isDeleted: false };
      if (status === 'deleted') query = { isDeleted: true };
      if (status === 'all') query = {}; // Show all services including deleted
    }
    
    // Apply filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    
    console.log('📋 Query filters:', query);
    
    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Service.countDocuments(query);
    
    console.log('📋 Found services:', services.length);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'view',
      'Service',
      `Viewed services list with filters: ${JSON.stringify(req.query)}`,
      req.ip
    );
    
    res.json({
      success: true,
      count: services.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: services
    });
    
    console.log('✅ Services list sent successfully');
    
  } catch (error) {
    console.error('💥 Get services error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_SERVICES_FAILED',
        message: error.message
      }
    });
  }
  
  console.log('📋 === GET SERVICES REQUEST COMPLETED ===\n');
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Private (Admin only)
exports.getService = async (req, res) => {
  try {
    console.log('📋 Getting service:', req.params.id);
    
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service not found'
        }
      });
    }
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'view',
      'Service',
      `Viewed service: ${service.name}`,
      req.ip,
      service._id
    );
    
    res.json({
      success: true,
      data: service
    });
    
  } catch (error) {
    console.error('💥 Get service error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_SERVICE_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Admin only)
exports.createService = async (req, res) => {
  console.log('\n📋 === CREATE SERVICE REQUEST ===');
  console.log('📋 Admin creating new service');
  
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }
    
    const { name, description, category, pricing, duration, features } = req.body;
    
    console.log('📋 Service data:', { name, category, pricing });
    
    // Check if service already exists
    const existingService = await Service.findOne({ name });
    if (existingService) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SERVICE_EXISTS',
          message: 'Service with this name already exists'
        }
      });
    }
    
    // Create service
    const service = await Service.create({
      name,
      description,
      category,
      pricing,
      duration,
      features: features || []
    });
    
    console.log('✅ Service created:', service._id);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'create',
      'Service',
      `Created new service: ${service.name}`,
      req.ip,
      service._id
    );
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
    
  } catch (error) {
    console.error('💥 Create service error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_SERVICE_FAILED',
        message: error.message
      }
    });
  }
  
  console.log('📋 === CREATE SERVICE REQUEST COMPLETED ===\n');
};

// @desc    Update service
// @route   PATCH /api/services/:id
// @access  Private (Admin only)
exports.updateService = async (req, res) => {
  console.log('\n📋 === UPDATE SERVICE REQUEST ===');
  console.log('📋 Admin updating service:', req.params.id);
  
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
    
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service not found'
        }
      });
    }
    
    // Update allowed fields
    const allowedFields = ['name', 'description', 'category', 'pricing', 'duration', 'features', 'isActive'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    console.log('📋 Update data:', updateData);
    
    Object.assign(service, updateData);
    await service.save();
    
    console.log('✅ Service updated successfully');
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'update',
      'Service',
      `Updated service: ${service.name}. Fields: ${Object.keys(updateData).join(', ')}`,
      req.ip,
      service._id
    );
    
    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
    
  } catch (error) {
    console.error('💥 Update service error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_SERVICE_FAILED',
        message: error.message
      }
    });
  }
  
  console.log('📋 === UPDATE SERVICE REQUEST COMPLETED ===\n');
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Admin only)
exports.deleteService = async (req, res) => {
  console.log('\n📋 === DELETE SERVICE REQUEST ===');
  console.log('📋 Admin deleting service:', req.params.id);
  
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service not found'
        }
      });
    }
    
    // Soft delete - mark as deleted instead of actual deletion
    service.isDeleted = true;
    service.deletedAt = new Date();
    await service.save();
    
    console.log('✅ Service marked as deleted');
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'delete',
      'Service',
      `Deleted service: ${service.name}`,
      req.ip,
      service._id
    );
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
    
  } catch (error) {
    console.error('💥 Delete service error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_SERVICE_FAILED',
        message: error.message
      }
    });
  }
  
  console.log('📋 === DELETE SERVICE REQUEST COMPLETED ===\n');
};

// @desc    Toggle service status (activate/deactivate)
// @route   PATCH /api/services/:id/toggle-status
// @access  Private (Admin only)
exports.toggleServiceStatus = async (req, res) => {
  console.log('\n📋 === TOGGLE SERVICE STATUS REQUEST ===');
  console.log('📋 Admin toggling service status:', req.params.id);
  
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service not found'
        }
      });
    }
    
    // Toggle status
    service.isActive = !service.isActive;
    await service.save();
    
    const newStatus = service.isActive ? 'activated' : 'deactivated';
    console.log(`✅ Service ${newStatus} successfully`);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'status_change',
      'Service',
      `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} service: ${service.name}`,
      req.ip,
      service._id
    );
    
    res.json({
      success: true,
      message: `Service ${newStatus} successfully`,
      data: service
    });
    
  } catch (error) {
    console.error('💥 Toggle service status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TOGGLE_STATUS_FAILED',
        message: error.message
      }
    });
  }
  
  console.log('📋 === TOGGLE SERVICE STATUS REQUEST COMPLETED ===\n');
};

// @desc    Restore deleted service
// @route   PATCH /api/services/:id/restore
// @access  Private (Admin only)
exports.restoreService = async (req, res) => {
  console.log('\n📋 === RESTORE SERVICE REQUEST ===');
  console.log('📋 Admin restoring service:', req.params.id);
  
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service not found'
        }
      });
    }
    
    if (!service.isDeleted) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SERVICE_NOT_DELETED',
          message: 'Service is not deleted'
        }
      });
    }
    
    // Restore service
    service.isDeleted = false;
    service.deletedAt = null;
    service.isActive = true; // Restore as active
    await service.save();
    
    console.log('✅ Service restored successfully');
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'restore',
      'Service',
      `Restored service: ${service.name}`,
      req.ip,
      service._id
    );
    
    res.json({
      success: true,
      message: 'Service restored successfully',
      data: service
    });
    
  } catch (error) {
    console.error('💥 Restore service error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESTORE_SERVICE_FAILED',
        message: error.message
      }
    });
  }
  
  console.log('📋 === RESTORE SERVICE REQUEST COMPLETED ===\n');
};

// @desc    Permanently delete service (hard delete)
// @route   DELETE /api/services/:id/permanent
// @access  Private (Admin only)
exports.permanentDeleteService = async (req, res) => {
  console.log('\n📋 === PERMANENT DELETE SERVICE REQUEST ===');
  console.log('📋 Admin permanently deleting service:', req.params.id);
  
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service not found'
        }
      });
    }
    
    // Check if service is already soft deleted
    if (!service.isDeleted) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SERVICE_NOT_DELETED',
          message: 'Service must be soft deleted before permanent deletion'
        }
      });
    }
    
    const serviceName = service.name;
    
    // Permanently delete the service from database
    await Service.findByIdAndDelete(req.params.id);
    
    console.log('✅ Service permanently deleted from database');
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'permanent_delete',
      'Service',
      `Permanently deleted service: ${serviceName}`,
      req.ip,
      req.params.id
    );
    
    res.json({
      success: true,
      message: 'Service permanently deleted successfully'
    });
    
  } catch (error) {
    console.error('💥 Permanent delete service error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PERMANENT_DELETE_SERVICE_FAILED',
        message: error.message
      }
    });
  }
  
  console.log('📋 === PERMANENT DELETE SERVICE REQUEST COMPLETED ===\n');
};

// @desc    Get service statistics
// @route   GET /api/services/stats
// @access  Private (Admin only)
exports.getServiceStats = async (req, res) => {
  try {
    console.log('📋 Getting service statistics...');
    
    const totalServices = await Service.countDocuments({ isDeleted: false });
    const activeServices = await Service.countDocuments({ isActive: true, isDeleted: false });
    const inactiveServices = await Service.countDocuments({ isActive: false, isDeleted: false });
    const deletedServices = await Service.countDocuments({ isDeleted: true });
    
    const servicesByCategory = await Service.aggregate([
      {
        $match: { isDeleted: false }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const popularServices = await Service.find({ isActive: true, isDeleted: false })
      .sort({ popularity: -1 })
      .limit(5)
      .select('name popularity pricing');
    
    const stats = {
      totalServices,
      activeServices,
      inactiveServices,
      deletedServices,
      servicesByCategory,
      popularServices
    };
    
    console.log('📋 Service statistics:', stats);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'view',
      'System',
      'Viewed service statistics',
      req.ip
    );
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('💥 Get service stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_STATS_FAILED',
        message: error.message
      }
    });
  }
};