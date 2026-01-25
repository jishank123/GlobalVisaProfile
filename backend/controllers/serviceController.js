const Service = require('../models/Service');
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

// @desc    Get all services with filtering
// @route   GET /api/services
// @access  Private (Admin only)
exports.getServices = async (req, res) => {
  console.log('\n📋 === GET SERVICES REQUEST ===');
  console.log('📋 Admin requesting services list');
  
  try {
    const { search, category, status, page = 1, limit = 20 } = req.query;
    
    // Build query
    let query = {};
    
    // Apply filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    
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
      'VIEW_SERVICES',
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
      'VIEW_SERVICE',
      `Viewed service: ${service.name}`,
      req.ip
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
      'CREATE_SERVICE',
      `Created new service: ${service.name}`,
      req.ip
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
      'UPDATE_SERVICE',
      `Updated service: ${service.name}. Fields: ${Object.keys(updateData).join(', ')}`,
      req.ip
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
    
    // Soft delete - set as inactive instead of actual deletion
    service.isActive = false;
    await service.save();
    
    console.log('✅ Service soft deleted (set to inactive)');
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'DELETE_SERVICE',
      `Deleted service: ${service.name}`,
      req.ip
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
      'TOGGLE_SERVICE_STATUS',
      `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} service: ${service.name}`,
      req.ip
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

// @desc    Get service statistics
// @route   GET /api/services/stats
// @access  Private (Admin only)
exports.getServiceStats = async (req, res) => {
  try {
    console.log('📋 Getting service statistics...');
    
    const totalServices = await Service.countDocuments();
    const activeServices = await Service.countDocuments({ isActive: true });
    const inactiveServices = await Service.countDocuments({ isActive: false });
    
    const servicesByCategory = await Service.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const popularServices = await Service.find({ isActive: true })
      .sort({ popularity: -1 })
      .limit(5)
      .select('name popularity pricing');
    
    const stats = {
      totalServices,
      activeServices,
      inactiveServices,
      servicesByCategory,
      popularServices
    };
    
    console.log('📋 Service statistics:', stats);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'VIEW_SERVICE_STATS',
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