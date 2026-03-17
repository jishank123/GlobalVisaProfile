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
    
    console.log('\n👥 === GET USERS REQUEST ===');
    console.log('👥 Requesting user role:', req.user.role);
    console.log('👥 Requested role filter:', role);
    console.log('👥 Requested status filter:', status);
    console.log('👥 Query params:', req.query);
    console.log('👥 Full URL:', req.originalUrl);
    
    // Special logging for CRM manager requests
    if (role === 'crm_manager') {
      console.log('🔍 ========== CRM MANAGER REQUEST DETECTED ==========');
      console.log('🔍 This is a request for CRM managers');
    }
    
    // Build query with security filters
    let query = {};
    
    // Handle status filter - if status is explicitly provided, use it; otherwise exclude deleted
    // Note: Status field is encrypted, so we need to handle this differently
    // We'll fetch all users and filter by status after decryption
    const requestedStatus = status;
    
    console.log('👥 Requested status for filtering:', requestedStatus);
    
    // Don't add status to MongoDB query since it's encrypted
    // We'll filter after fetching and decrypting
    
    // For encrypted role queries, we need to handle this differently
    let roleFilteredUsers = [];
    let shouldFilterByRole = false;
    let targetRoles = [];
    
    // Role-based access control
    if (req.user.role === 'lead_manager') {
      // Lead managers can see clients, other lead managers, and CRM managers (for assignment)
      targetRoles = ['client', 'lead_manager', 'crm_manager'];
      shouldFilterByRole = true;
      console.log('👥 Lead manager access - target roles:', targetRoles);
    } else if (req.user.role === 'crm_manager') {
      // CRM managers can see other CRM managers (for handover) and project managers (for assignment)
      console.log('👥 CRM manager requesting role:', role);
      if (role === 'crm_manager' || role === 'project_manager') {
        targetRoles = role === 'crm_manager' ? ['crm_manager'] : ['project_manager'];
        shouldFilterByRole = true;
        console.log('👥 CRM manager access granted - target roles:', targetRoles);
      } else {
        console.log('❌ CRM manager access denied - invalid role requested:', role);
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'CRM managers can only access CRM managers and project managers'
          }
        });
      }
    } else if (req.user.role === 'project_manager') {
      // Project managers can see employees (for task assignment)
      console.log('👥 Project manager requesting role:', role);
      if (role === 'employee') {
        targetRoles = ['employee'];
        shouldFilterByRole = true;
        console.log('👥 Project manager access granted - target roles:', targetRoles);
      } else {
        console.log('❌ Project manager access denied - invalid role requested:', role);
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Project managers can only access employees'
          }
        });
      }
    }
    
    // If a specific role is requested, add it to target roles
    if (role && !shouldFilterByRole) {
      targetRoles = [role];
      shouldFilterByRole = true;
      console.log('👥 Admin/other role access - target roles:', targetRoles);
    } else if (role && shouldFilterByRole && !targetRoles.includes(role)) {
      targetRoles = [role];
      console.log('👥 Overriding target roles with requested role:', targetRoles);
    }
    
    let users;
    let count;
    
    if (shouldFilterByRole) {
      // Get all users matching the base query (without role filter)
      const allUsers = await User.find(query).select('-password');
      console.log('👥 Total users found (before role filter):', allUsers.length);
      
      // Filter by role using decryption
      const encryption = require('../middleware/encryptionMiddleware');
      roleFilteredUsers = allUsers.filter(user => {
        try {
          const decryptedRole = encryption.decrypt(user.role);
          const matches = targetRoles.includes(decryptedRole);
          if (matches) {
            console.log('✅ User matched:', user.email, 'Role:', decryptedRole);
          }
          return matches;
        } catch (error) {
          // If decryption fails, check if it's already plain text
          const matches = targetRoles.includes(user.role);
          if (matches) {
            console.log('✅ User matched (plain):', user.email, 'Role:', user.role);
          }
          return matches;
        }
      });
      
      console.log('👥 Users after role filter:', roleFilteredUsers.length);
      
      // Filter by status after decryption
      if (requestedStatus) {
        console.log('👥 Filtering by requested status:', requestedStatus);
        roleFilteredUsers = roleFilteredUsers.filter(user => {
          try {
            const decryptedStatus = encryption.decrypt(user.status);
            console.log(`  - User ${user.email}: status="${decryptedStatus}" (encrypted: ${user.status.substring(0, 20)}...)`);
            const matches = decryptedStatus === requestedStatus;
            if (matches) {
              console.log(`    ✅ MATCHED! User has status="${decryptedStatus}"`);
            }
            return matches;
          } catch (error) {
            console.log(`  - User ${user.email}: status="${user.status}" (plain text)`);
            return user.status === requestedStatus;
          }
        });
        console.log('👥 Users after status filter:', roleFilteredUsers.length);
      } else {
        // Exclude deleted users when no specific status is requested
        console.log('👥 No status requested, excluding deleted users');
        roleFilteredUsers = roleFilteredUsers.filter(user => {
          try {
            const decryptedStatus = encryption.decrypt(user.status);
            return decryptedStatus !== 'deleted';
          } catch (error) {
            return user.status !== 'deleted';
          }
        });
        console.log('👥 Users after excluding deleted:', roleFilteredUsers.length);
      }
      
      // Apply search filter if provided
      if (search) {
        roleFilteredUsers = roleFilteredUsers.filter(user => {
          try {
            const decryptedUser = encryption.decryptDocument(user.toObject());
            const searchLower = search.toLowerCase();
            return (
              (decryptedUser.first_name && decryptedUser.first_name.toLowerCase().includes(searchLower)) ||
              (decryptedUser.last_name && decryptedUser.last_name.toLowerCase().includes(searchLower)) ||
              (decryptedUser.email && decryptedUser.email.toLowerCase().includes(searchLower))
            );
          } catch (error) {
            // Fallback to plain text search if decryption fails
            const searchLower = search.toLowerCase();
            return (
              (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
              (user.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
              (user.email && user.email.toLowerCase().includes(searchLower))
            );
          }
        });
      }

      // Apply email filter if provided (exact match)
      if (req.query.email) {
        const searchEmail = req.query.email.toLowerCase().trim();
        console.log('👥 Filtering by email:', searchEmail);
        roleFilteredUsers = roleFilteredUsers.filter(user => {
          try {
            const decryptedEmail = encryption.decrypt(user.email);
            const matches = decryptedEmail.toLowerCase() === searchEmail;
            if (matches) {
              console.log('✅ Email matched:', decryptedEmail);
            }
            return matches;
          } catch (error) {
            // Fallback to plain text comparison if decryption fails
            const matches = user.email.toLowerCase() === searchEmail;
            if (matches) {
              console.log('✅ Email matched (plain):', user.email);
            }
            return matches;
          }
        });
        console.log('👥 Users after email filter:', roleFilteredUsers.length);
      }
      
      // Apply pagination
      count = roleFilteredUsers.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      users = roleFilteredUsers.slice(startIndex, endIndex);
      
      console.log('👥 Final users count after pagination:', users.length);
      
    } else {
      // No role filtering needed, fetch all users and filter by status after decryption
      const encryption = require('../middleware/encryptionMiddleware');
      
      if (search) {
        query.$or = [
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Fetch all users without status filter (since status is encrypted)
      const allUsers = await User.find(query)
        .select('-password')
        .sort({ created_at: -1 });
      
      console.log('👥 Total users found (before status filter):', allUsers.length);
      
      // Filter by status after decryption
      let statusFilteredUsers = allUsers;
      if (requestedStatus) {
        console.log('👥 Filtering by requested status:', requestedStatus);
        statusFilteredUsers = allUsers.filter(user => {
          try {
            const decryptedStatus = encryption.decrypt(user.status);
            console.log(`  - User ${user.email}: status="${decryptedStatus}" (encrypted: ${user.status.substring(0, 20)}...)`);
            const matches = decryptedStatus === requestedStatus;
            if (matches) {
              console.log(`    ✅ MATCHED! User has status="${decryptedStatus}"`);
            }
            return matches;
          } catch (error) {
            console.log(`  - User ${user.email}: status="${user.status}" (plain text)`);
            return user.status === requestedStatus;
          }
        });
        console.log('👥 Users after status filter:', statusFilteredUsers.length);
      } else {
        // Exclude deleted users when no specific status is requested
        console.log('👥 No status requested, excluding deleted users');
        statusFilteredUsers = allUsers.filter(user => {
          try {
            const decryptedStatus = encryption.decrypt(user.status);
            return decryptedStatus !== 'deleted';
          } catch (error) {
            return user.status !== 'deleted';
          }
        });
        console.log('👥 Users after excluding deleted:', statusFilteredUsers.length);
      }
      
      // Apply pagination
      count = statusFilteredUsers.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      users = statusFilteredUsers.slice(startIndex, endIndex);
      
      console.log('👥 Final users count after pagination:', users.length);
    }
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'view',
      'User',
      `Viewed users list with filters: ${JSON.stringify(req.query)}`,
      req.ip
    );
    
    // Convert users to display format (decrypted)
    const displayUsers = users.map(user => {
      if (typeof user.toDisplayJSON === 'function') {
        return user.toDisplayJSON();
      } else {
        // Fallback for plain objects
        const encryption = require('../middleware/encryptionMiddleware');
        try {
          return encryption.decryptDocument(user);
        } catch (error) {
          return user;
        }
      }
    });
    
    console.log('👥 Returning users:', displayUsers.length);
    console.log('👥 Sample user data:', displayUsers[0] ? {
      email: displayUsers[0].email,
      first_name: displayUsers[0].first_name,
      last_name: displayUsers[0].last_name,
      role: displayUsers[0].role
    } : 'No users');
    
    res.json({
      success: true,
      count: displayUsers.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: displayUsers
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
    
    const encryption = require('../middleware/encryptionMiddleware');
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
    
    // Prevent deleting other admins (decrypt role first)
    let decryptedRole;
    try {
      decryptedRole = encryption.decrypt(user.role);
    } catch (error) {
      decryptedRole = user.role; // Fallback to plain text
    }
    
    if (decryptedRole === 'admin') {
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
    
    // Encrypt the status value before saving
    const encryptedStatus = encryption.encrypt('deleted');
    
    // Use findByIdAndUpdate to avoid validation issues with encrypted fields
    await User.findByIdAndUpdate(
      req.params.id,
      {
        status: encryptedStatus,
        deleted_at: new Date(),
        deleted_by: req.user.user_id
      },
      { runValidators: false } // Skip validation since fields are encrypted
    );
    
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

// @desc    Restore deleted user
// @route   PATCH /api/users/:id/restore
// @access  Private (Admin only)
exports.restoreUser = async (req, res) => {
  try {
    console.log('\n🔄 === RESTORE USER REQUEST ===');
    console.log('User ID to restore:', req.params.id);
    console.log('Requesting user:', req.user.email, 'Role:', req.user.role);
    
    const encryption = require('../middleware/encryptionMiddleware');
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
    
    console.log('👤 Found user to restore:', user.email, 'Status:', user.status);
    
    // Check if user is actually deleted (decrypt status first)
    let decryptedStatus;
    try {
      decryptedStatus = encryption.decrypt(user.status);
    } catch (error) {
      decryptedStatus = user.status; // Fallback to plain text
    }
    
    if (decryptedStatus !== 'deleted') {
      console.log('❌ User is not deleted, cannot restore. Status:', decryptedStatus);
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_NOT_DELETED',
          message: 'User is not deleted and cannot be restored'
        }
      });
    }
    
    // Restore user
    console.log('🔄 Restoring user...');
    
    // Encrypt the status value before saving
    const encryptedStatus = encryption.encrypt('active');
    
    // Use findByIdAndUpdate to avoid validation issues with encrypted fields
    const restoredUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: encryptedStatus,
        $unset: { deleted_at: 1, deleted_by: 1 }
      },
      { runValidators: false, new: true } // Skip validation, return updated doc
    );
    
    console.log('✅ User restored successfully');
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'restore',
      'User',
      `Restored user: ${user.email}`,
      req.ip,
      user._id
    );
    
    res.json({
      success: true,
      message: 'User restored successfully',
      data: restoredUser
    });
  } catch (error) {
    console.error('💥 Restore user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESTORE_USER_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Permanently delete user
// @route   DELETE /api/users/:id/permanent
// @access  Private (Admin only)
exports.permanentDeleteUser = async (req, res) => {
  try {
    console.log('\n🗑️ === PERMANENT DELETE USER REQUEST ===');
    console.log('User ID to permanently delete:', req.params.id);
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
    
    console.log('👤 Found user to permanently delete:', user.email, 'Status:', user.status);
    
    // Prevent self-deletion
    if (req.params.id === req.user.user_id.toString()) {
      console.log('❌ Self-deletion attempt blocked');
      return res.status(400).json({
        success: false,
        error: {
          code: 'SELF_DELETE_FORBIDDEN',
          message: 'You cannot permanently delete your own account'
        }
      });
    }
    
    // Prevent deleting other admins (decrypt role first)
    const encryption = require('../middleware/encryptionMiddleware');
    let decryptedRole;
    try {
      decryptedRole = encryption.decrypt(user.role);
    } catch (error) {
      decryptedRole = user.role; // Fallback to plain text
    }
    
    if (decryptedRole === 'admin') {
      console.log('❌ Admin deletion attempt blocked');
      return res.status(403).json({
        success: false,
        error: {
          code: 'ADMIN_DELETE_FORBIDDEN',
          message: 'Cannot permanently delete admin accounts'
        }
      });
    }
    
    // Check if user is soft deleted first (decrypt status)
    let decryptedStatus;
    try {
      decryptedStatus = encryption.decrypt(user.status);
    } catch (error) {
      decryptedStatus = user.status; // Fallback to plain text
    }
    
    if (decryptedStatus !== 'deleted') {
      console.log('❌ User is not soft deleted, cannot permanently delete. Status:', decryptedStatus);
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_NOT_SOFT_DELETED',
          message: 'User must be soft deleted before permanent deletion'
        }
      });
    }
    
    // Log activity before deletion
    await logActivity(
      req.user.user_id,
      'permanent_delete',
      'User',
      `Permanently deleted user: ${user.email}`,
      req.ip,
      user._id
    );
    
    // Delete associated client record if exists
    console.log('🔍 Checking for associated client record...');
    const Client = require('../models/Client');
    const associatedClient = await Client.findOne({ email: user.email });
    
    if (associatedClient) {
      console.log('👥 Found associated client record:', associatedClient._id);
      await Client.findByIdAndDelete(associatedClient._id);
      console.log('✅ Associated client record deleted');
      
      // Log client deletion
      await logActivity(
        req.user.user_id,
        'permanent_delete',
        'Client',
        `Permanently deleted client record associated with user: ${user.email}`,
        req.ip,
        associatedClient._id
      );
    } else {
      console.log('ℹ️ No associated client record found');
    }
    
    // Permanently delete user
    console.log('🔄 Performing permanent user deletion...');
    await User.findByIdAndDelete(req.params.id);
    console.log('✅ User permanently deleted successfully');
    
    res.json({
      success: true,
      message: 'User and associated records permanently deleted successfully'
    });
  } catch (error) {
    console.error('💥 Permanent delete user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PERMANENT_DELETE_USER_FAILED',
        message: error.message
      }
    });
  }
};