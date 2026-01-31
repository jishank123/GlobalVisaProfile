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

// @desc    Get all users with role-based filtering
// @route   GET /api/users
// @access  Private (Admin, Lead Manager)
exports.getUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    
    // Build query with security filters
    let query = {};
    
    // Always exclude deleted users from the main list
    query.status = { $ne: 'deleted' };
    
    // Role-based access control
    if (req.user.role === 'lead_manager') {
      // Lead managers can see clients, other lead managers, and CRM managers (for assignment)
      query.role = { $in: ['client', 'lead_manager', 'crm_manager'] };
    } else if (req.user.role === 'crm_manager') {
      // CRM managers can only see other CRM managers (for handover purposes)
      if (role === 'crm_manager') {
        query.role = 'crm_manager';
      } else {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'CRM managers can only access other CRM managers for handover purposes'
          }
        });
      }
    }
    
    // Apply filters
    if (search) {
      query.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) query.role = role;
    if (status) query.status = status;
    
    const users = await User.find(query)
      .select('-password') // Never return passwords
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await User.countDocuments(query);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'view',
      'User',
      `Viewed users list with filters: ${JSON.stringify(req.query)}`,
      req.ip
    );
    
    res.json({
      success: true,
      count: users.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_USERS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Admin, Lead Manager, Own Profile)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    // Security check - users can only view their own profile unless admin/lead_manager
    if (req.user.role === 'client' && req.params.id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only view your own profile'
        }
      });
    }
    
    if (req.user.role === 'crm_manager' && req.params.id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only view your own profile'
        }
      });
    }
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'view',
      'User',
      `Viewed user profile: ${user.email}`,
      req.ip,
      user._id
    );
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_USER_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
exports.createUser = async (req, res) => {
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
    
    const { first_name, last_name, email, password, role, phone, company, country } = req.body;
    
    // Prevent creating admin users
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ADMIN_CREATION_FORBIDDEN',
          message: 'Cannot create admin users through this endpoint'
        }
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }
    
    // Create user
    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
      role: role || 'client',
      phone,
      company,
      country,
      created_by: req.user.user_id
    });
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'create',
      'User',
      `Created new user: ${user.email} with role: ${user.role}`,
      req.ip,
      user._id
    );
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user.toAuthJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_USER_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Update user
// @route   PATCH /api/users/:id
// @access  Private (Admin, Own Profile)
exports.updateUser = async (req, res) => {
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
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    // Security check - users can only update their own profile unless admin
    if (req.user.role !== 'admin' && req.params.id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your own profile'
        }
      });
    }
    
    // Prevent role escalation
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only admins can change user roles'
        }
      });
    }
    
    // Prevent creating admin users
    if (req.body.role === 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ADMIN_ROLE_ASSIGNMENT_FORBIDDEN',
          message: 'Cannot assign admin role to users'
        }
      });
    }
    
    // Prevent admin from changing their own role
    if (req.body.role && req.params.id === req.user.user_id && req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ADMIN_ROLE_CHANGE_FORBIDDEN',
          message: 'Admin cannot change their own role'
        }
      });
    }
    
    // Prevent changing another admin's role
    if (req.body.role && user.role === 'admin' && req.params.id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ADMIN_ROLE_CHANGE_FORBIDDEN',
          message: 'Cannot change another admin\'s role'
        }
      });
    }
    
    // Update allowed fields only
    const allowedFields = ['first_name', 'last_name', 'phone', 'company', 'country'];
    if (req.user.role === 'admin') {
      allowedFields.push('role', 'status');
    }
    
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    Object.assign(user, updateData);
    await user.save();
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'update',
      'User',
      `Updated user: ${user.email}. Fields: ${Object.keys(updateData).join(', ')}`,
      req.ip,
      user._id
    );
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_USER_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    console.log('\n🗑️ === DELETE USER REQUEST ===');
    console.log('User ID to delete:', req.params.id);
    console.log('Requesting user:', req.user.email, 'Role:', req.user.role);
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      console.log('❌ User not found:', req.params.id);
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    console.log('👤 Found user to delete:', user.email, 'Role:', user.role);
    
    // Prevent self-deletion
    if (req.params.id === req.user.user_id.toString()) {
      console.log('❌ Self-deletion attempt blocked');
      return res.status(400).json({
        success: false,
        error: {
          code: 'SELF_DELETE_FORBIDDEN',
          message: 'You cannot delete your own account'
        }
      });
    }
    
    // Prevent deleting other admins
    if (user.role === 'admin') {
      console.log('❌ Admin deletion attempt blocked');
      return res.status(403).json({
        success: false,
        error: {
          code: 'ADMIN_DELETE_FORBIDDEN',
          message: 'Cannot delete admin accounts'
        }
      });
    }
    
    // Soft delete - change status instead of actual deletion
    console.log('🔄 Performing soft delete...');
    user.status = 'deleted';
    user.deleted_at = new Date();
    user.deleted_by = req.user.user_id;
    
    await user.save();
    console.log('✅ User soft deleted successfully');
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'delete',
      'User',
      `Deleted user: ${user.email}`,
      req.ip,
      user._id
    );
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('💥 Delete user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_USER_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin, Lead Manager)
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ status: { $ne: 'deleted' } });
    
    const usersByRole = await User.aggregate([
      { $match: { status: { $ne: 'deleted' } } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const usersByStatus = await User.aggregate([
      { $match: { status: { $ne: 'deleted' } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const recentUsers = await User.find({ status: { $ne: 'deleted' } })
      .select('-password')
      .sort({ created_at: -1 })
      .limit(5);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'view',
      'System',
      'Viewed user statistics',
      req.ip
    );
    
    res.json({
      success: true,
      data: {
        totalUsers,
        usersByRole,
        usersByStatus,
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_STATS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Assign manager to user
// @route   PATCH /api/users/:id/assign-manager
// @access  Private (Admin, Lead Manager)
exports.assignManager = async (req, res) => {
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
    if (!manager || manager.role !== 'crm_manager') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MANAGER',
          message: 'Invalid manager ID or user is not a CRM manager'
        }
      });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    user.assigned_manager = managerId;
    await user.save();
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'update',
      'User',
      `Assigned manager ${manager.email} to user ${user.email}`,
      req.ip,
      user._id
    );
    
    res.json({
      success: true,
      message: 'Manager assigned successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'ASSIGN_MANAGER_FAILED',
        message: error.message
      }
    });
  }
};