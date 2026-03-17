const Project = require('../models/Project');
const User = require('../models/User');

/**
 * Get tasks for current CRM manager's or Project manager's projects
 * @route GET /api/tasks/my-tasks
 * @access Private (CRM Manager, Project Manager)
 */
exports.getMyTasks = async (req, res) => {
  console.log('\n📋 === GET MY TASKS REQUEST ===');
  console.log('📋 User role:', req.user.role);
  console.log('📋 User requesting their tasks');
  
  try {
    const userId = req.user._id || req.user.user_id || req.user.id;
    const userRole = req.user.role;
    console.log('📋 User ID:', userId);
    console.log('📋 User Role:', userRole);
    
    let projectFilter = {};
    
    // Filter projects based on role
    if (userRole === 'crm_manager') {
      projectFilter.assigned_to = userId;
    } else if (userRole === 'project_manager') {
      projectFilter.project_manager = userId;
    } else if (userRole === 'employee') {
      // For employees, we need to find projects with tasks assigned to them
      // We'll filter tasks after fetching all projects
      projectFilter = { status: { $ne: 'deleted' } };
    } else {
      console.log('❌ Invalid role for this endpoint:', userRole);
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only CRM managers, project managers, and employees can access this endpoint'
        }
      });
    }
    
    projectFilter.status = { $ne: 'deleted' };
    
    // Get projects assigned to this user
    const projects = await Project.find(projectFilter)
      .populate('client', 'name firstName lastName email')
      .populate('service', 'name')
      .lean();
    
    console.log('📋 Found projects:', projects.length);
    
    // Get all unique assigned_to IDs from milestones
    const assignedToIds = new Set();
    projects.forEach(project => {
      if (project.milestones && project.milestones.length > 0) {
        project.milestones.forEach(milestone => {
          if (milestone.assigned_to) {
            assignedToIds.add(milestone.assigned_to.toString());
          }
        });
      }
    });
    
    console.log('📋 Unique assigned_to IDs:', Array.from(assignedToIds));
    
    // Fetch all assigned users at once
    const assignedUsers = await User.find({
      _id: { $in: Array.from(assignedToIds) }
    }).select('first_name last_name email').lean();
    
    console.log('📋 Fetched assigned users:', assignedUsers.length);
    
    // Create a map for quick lookup
    const userMap = new Map();
    assignedUsers.forEach(user => {
      userMap.set(user._id.toString(), user);
    });
    
    // Extract tasks from project milestones
    const tasks = [];
    
    // Get all unique uploaded_by IDs from files
    const fileUploaderIds = new Set();
    projects.forEach(project => {
      if (project.milestones && project.milestones.length > 0) {
        project.milestones.forEach(milestone => {
          if (milestone.files && milestone.files.length > 0) {
            milestone.files.forEach(file => {
              if (file.uploaded_by) {
                fileUploaderIds.add(file.uploaded_by.toString());
              }
            });
          }
        });
      }
    });
    
    // Fetch all file uploaders at once
    const fileUploaders = await User.find({
      _id: { $in: Array.from(fileUploaderIds) }
    }).select('first_name last_name email role').lean();
    
    // Create a map for quick lookup
    const fileUploaderMap = new Map();
    fileUploaders.forEach(user => {
      fileUploaderMap.set(user._id.toString(), user);
    });
    
    projects.forEach(project => {
      if (project.milestones && project.milestones.length > 0) {
        project.milestones.forEach(milestone => {
          const assignedUser = milestone.assigned_to ? userMap.get(milestone.assigned_to.toString()) : null;
          
          // For employees, only include tasks assigned to them
          if (userRole === 'employee' && (!milestone.assigned_to || milestone.assigned_to.toString() !== userId.toString())) {
            return; // Skip this task
          }
          
          // Populate file uploader information and add role
          const populatedFiles = (milestone.files || []).map(file => {
            const uploader = file.uploaded_by ? fileUploaderMap.get(file.uploaded_by.toString()) : null;
            return {
              ...file,
              uploaded_by: uploader,
              uploaded_by_role: uploader?.role || 'unknown'
            };
          });
          
          tasks.push({
            _id: milestone._id,
            title: milestone.title,
            description: milestone.description,
            status: milestone.status,
            priority: milestone.priority || 'medium',
            due_date: milestone.target_date,
            start_date: milestone.start_date,
            progress: milestone.progress || 0,
            project_id: milestone.project_id || project._id,
            assigned_to: assignedUser,
            files: populatedFiles,
            project: {
              _id: project._id,
              project_id: project.project_id,
              service_name: project.service_name || project.service?.name,
              client: project.client
            },
            createdAt: milestone.created_at || project.createdAt,
            updatedAt: milestone.updated_at || project.updatedAt
          });
        });
      }
    });
    
    console.log('📋 Total tasks found:', tasks.length);
    console.log('📋 Tasks with assigned_to:', tasks.filter(t => t.assigned_to).length);
    console.log('📋 Tasks with files:', tasks.filter(t => t.files && t.files.length > 0).length);
    if (tasks.length > 0 && tasks[0].files && tasks[0].files.length > 0) {
      console.log('📋 Sample file with role:', tasks[0].files[0]);
    }
    
    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });
    
  } catch (error) {
    console.error('❌ Error in getMyTasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASKS_FETCH_ERROR',
        message: 'Failed to fetch tasks'
      }
    });
  }
};

/**
 * Get all tasks with filters
 * @route GET /api/tasks
 * @access Private (Admin, Lead Manager, CRM Manager, Project Manager, Client)
 */
exports.getTasks = async (req, res) => {
  console.log('\n📋 === GET ALL TASKS REQUEST ===');
  console.log('🔍 User Role:', req.user?.role);
  console.log('🔍 User ID:', req.user?._id || req.user?.user_id || req.user?.id);
  console.log('🔍 User Email:', req.user?.email);
  console.log('🔍 Query Params:', req.query);
  
  try {
    const { status, priority, project_id, assigned_to, client } = req.query;
    const userRole = req.user.role;
    const userId = req.user._id || req.user.user_id || req.user.id;
    const userEmail = req.user.email;
    
    let projectFilter = {};
    
    // Role-based filtering
    if (userRole === 'crm_manager') {
      projectFilter.assigned_to = userId;
    } else if (userRole === 'project_manager') {
      projectFilter.project_manager = userId;
    } else if (userRole === 'lead_manager') {
      projectFilter.created_by = userId;
    } else if (userRole === 'client') {
      // For clients, we need to find their client record first
      const Client = require('../models/Client');
      const clientEmail = client || userEmail;
      
      // Find the client record by user_id or email
      const clientRecord = await Client.findOne({
        $or: [
          { user_id: userId },
          { email: clientEmail }
        ]
      });
      
      console.log('🔍 Client Record Found:', clientRecord ? 'Yes' : 'No');
      if (clientRecord) {
        console.log('🔍 Client ID:', clientRecord._id);
        projectFilter.client = clientRecord._id;
      } else {
        console.log('❌ No client record found for user_id:', userId, 'or email:', clientEmail);
        // If no client record found, return empty results
        return res.json({
          success: true,
          data: [],
          count: 0,
          message: 'No client record found for this user'
        });
      }
    }
    
    // Additional filters
    if (project_id) {
      projectFilter._id = project_id;
    }
    
    const projects = await Project.find(projectFilter)
      .populate('client', 'name firstName lastName email')
      .populate('service', 'name')
      .populate('assigned_to', 'first_name last_name')
      .lean();
    
    // Extract and filter tasks
    let tasks = [];
    
    projects.forEach(project => {
      if (project.milestones && project.milestones.length > 0) {
        project.milestones.forEach(milestone => {
          const task = {
            _id: milestone._id,
            title: milestone.title,
            description: milestone.description,
            status: milestone.status,
            priority: milestone.priority || 'medium',
            due_date: milestone.target_date,
            progress: milestone.progress || 0,
            project: {
              _id: project._id,
              project_id: project.project_id,
              service_name: project.service_name || project.service?.name,
              client: project.client,
              assigned_to: project.assigned_to
            },
            createdAt: milestone.created_at || project.createdAt,
            updatedAt: milestone.updated_at || project.updatedAt
          };
          
          // Apply filters
          if (status && task.status !== status) return;
          if (priority && task.priority !== priority) return;
          if (assigned_to && project.assigned_to?._id?.toString() !== assigned_to) return;
          
          tasks.push(task);
        });
      }
    });
    
    console.log('📋 Total filtered tasks:', tasks.length);
    
    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });
    
  } catch (error) {
    console.error('❌ Error in getTasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASKS_FETCH_ERROR',
        message: 'Failed to fetch tasks'
      }
    });
  }
};

/**
 * Get single task
 * @route GET /api/tasks/:id
 * @access Private (Admin, Lead Manager, CRM Manager)
 */
exports.getTask = async (req, res) => {
  console.log('\n📋 === GET SINGLE TASK REQUEST ===');
  
  try {
    const taskId = req.params.id;
    console.log('📋 Task ID:', taskId);
    
    // Find project containing this milestone/task
    const project = await Project.findOne({
      'milestones._id': taskId
    }).populate('client', 'name firstName lastName email')
      .populate('service', 'name')
      .populate('assigned_to', 'first_name last_name');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        }
      });
    }
    
    const milestone = project.milestones.id(taskId);
    
    const task = {
      _id: milestone._id,
      title: milestone.title,
      description: milestone.description,
      status: milestone.status,
      priority: milestone.priority || 'medium',
      due_date: milestone.target_date,
      progress: milestone.progress || 0,
      project: {
        _id: project._id,
        project_id: project.project_id,
        service_name: project.service_name || project.service?.name,
        client: project.client,
        assigned_to: project.assigned_to
      },
      createdAt: milestone.created_at || project.createdAt,
      updatedAt: milestone.updated_at || project.updatedAt
    };
    
    res.json({
      success: true,
      data: task
    });
    
  } catch (error) {
    console.error('❌ Error in getTask:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_FETCH_ERROR',
        message: 'Failed to fetch task'
      }
    });
  }
};

/**
 * Create new task
 * @route POST /api/tasks
 * @access Private (CRM Manager, Project Manager, Admin)
 */
exports.createTask = async (req, res) => {
  console.log('\n📋 === CREATE TASK REQUEST ===');
  
  try {
    const { project_id, title, description, status, priority, due_date, start_date, progress, assigned_to } = req.body;
    const userId = req.user._id || req.user.user_id || req.user.id;
    const userRole = req.user.role;
    
    console.log('📋 Creating task for project:', project_id);
    console.log('📋 User role:', userRole);
    console.log('📋 User ID:', userId);
    
    if (!project_id || !title) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Project ID and title are required'
        }
      });
    }
    
    const project = await Project.findById(project_id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        }
      });
    }
    
    // Check if user has permission to add tasks to this project
    if (userRole === 'crm_manager' && project.assigned_to?.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You can only add tasks to your assigned projects'
        }
      });
    }
    
    if (userRole === 'project_manager' && project.project_manager?.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You can only add tasks to projects assigned to you'
        }
      });
    }
    
    const newMilestone = {
      title: title.trim(),
      description: description?.trim() || '',
      status: status || 'pending',
      priority: priority || 'medium',
      target_date: due_date ? new Date(due_date) : null,
      start_date: start_date ? new Date(start_date) : null,
      progress: progress || 0,
      assigned_to: assigned_to || null,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    project.milestones.push(newMilestone);
    await project.save();
    
    const createdMilestone = project.milestones[project.milestones.length - 1];
    
    console.log('📋 Task created successfully:', createdMilestone._id);
    
    // Log activity
    const ActivityLog = require('../models/ActivityLog');
    try {
      if (!project._id) {
        console.error('❌ Project ID is missing! Cannot log activity');
      } else {
        console.log('📋 About to log activity with:');
        console.log('  - user:', userId);
        console.log('  - action: create');
        console.log('  - resourceType: Task');
        console.log('  - resourceId:', project._id);
        console.log('  - description:', `Created task "${title}" in project ${project.project_id}`);
        
        const activityLog = await ActivityLog.create({
          user: userId,
          action: 'create',
          resourceType: 'Task',
          resourceId: project._id,
          description: `Created task "${title}" in project ${project.project_id}`,
          ipAddress: req.ip
        });
        console.log('✅ Activity logged successfully:', activityLog._id);
        console.log('✅ Activity details:', {
          id: activityLog._id,
          user: activityLog.user,
          resourceId: activityLog.resourceId,
          resourceType: activityLog.resourceType
        });
      }
    } catch (activityError) {
      console.error('❌ Failed to log activity:', activityError.message);
      console.error('❌ Error details:', activityError);
    }
    
    res.status(201).json({
      success: true,
      data: {
        _id: createdMilestone._id,
        title: createdMilestone.title,
        description: createdMilestone.description,
        status: createdMilestone.status,
        priority: createdMilestone.priority,
        due_date: createdMilestone.target_date,
        start_date: createdMilestone.start_date,
        progress: createdMilestone.progress,
        assigned_to: createdMilestone.assigned_to,
        project_id: project._id,
        createdAt: createdMilestone.created_at
      },
      message: 'Task created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error in createTask:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_CREATE_ERROR',
        message: 'Failed to create task'
      }
    });
  }
};

/**
 * Update task
 * @route PATCH /api/tasks/:id
 * @access Private (Employee, CRM Manager, Project Manager, Admin)
 */
exports.updateTask = async (req, res) => {
  console.log('\n📋 === UPDATE TASK REQUEST ===');
  
  try {
    const taskId = req.params.id;
    const { title, description, status, priority, due_date, start_date, progress, assigned_to } = req.body;
    const userId = req.user._id || req.user.user_id || req.user.id;
    const userRole = req.user.role;
    
    console.log('📋 Updating task:', taskId);
    console.log('📋 User role:', userRole);
    
    const project = await Project.findOne({
      'milestones._id': taskId
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        }
      });
    }
    
    const milestone = project.milestones.id(taskId);
    
    // Check permissions
    if (userRole === 'crm_manager' && project.assigned_to?.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You can only update tasks in your assigned projects'
        }
      });
    }
    
    if (userRole === 'project_manager' && project.project_manager?.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You can only update tasks in projects assigned to you'
        }
      });
    }
    
    // Check if employee is assigned to this task
    if (userRole === 'employee') {
      if (!milestone.assigned_to || milestone.assigned_to.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You can only update tasks assigned to you'
          }
        });
      }
      // Employees can only update progress and status, not other fields
      if (title !== undefined || description !== undefined || priority !== undefined || 
          due_date !== undefined || start_date !== undefined || assigned_to !== undefined) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Employees can only update task progress and status'
          }
        });
      }
    }
    
    // Update fields
    if (title !== undefined) milestone.title = title.trim();
    if (description !== undefined) milestone.description = description.trim();
    if (status !== undefined) {
      milestone.status = status;
      // Auto-update progress based on status
      if (status === 'completed') {
        milestone.progress = 100;
      } else if (status === 'in_progress' && milestone.progress === 0) {
        milestone.progress = 25;
      }
    }
    if (priority !== undefined) milestone.priority = priority;
    if (due_date !== undefined) milestone.target_date = due_date ? new Date(due_date) : null;
    if (start_date !== undefined) milestone.start_date = start_date ? new Date(start_date) : null;
    if (progress !== undefined) milestone.progress = Math.max(0, Math.min(100, progress));
    if (assigned_to !== undefined) milestone.assigned_to = assigned_to || null;
    
    milestone.updated_at = new Date();
    
    await project.save();
    
    console.log('📋 Task updated successfully');
    
    // Log activity for status changes
    if (status !== undefined) {
      const ActivityLog = require('../models/ActivityLog');
      try {
        const activityLog = await ActivityLog.create({
          user: userId,
          action: 'update',
          resourceType: 'Task',
          resourceId: project._id,
          description: `Updated task "${milestone.title}" status to ${status}`,
          ipAddress: req.ip
        });
        console.log('✅ Activity logged:', activityLog._id);
      } catch (activityError) {
        console.error('❌ Failed to log activity:', activityError.message);
      }
    }
    
    res.json({
      success: true,
      data: {
        _id: milestone._id,
        title: milestone.title,
        description: milestone.description,
        status: milestone.status,
        priority: milestone.priority,
        due_date: milestone.target_date,
        start_date: milestone.start_date,
        progress: milestone.progress,
        assigned_to: milestone.assigned_to,
        updatedAt: milestone.updated_at
      },
      message: 'Task updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error in updateTask:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_UPDATE_ERROR',
        message: 'Failed to update task'
      }
    });
  }
};

/**
 * Update task status
 * @route PATCH /api/tasks/:id/status
 * @access Private (CRM Manager, Project Manager, Admin)
 */
exports.updateTaskStatus = async (req, res) => {
  console.log('\n📋 === UPDATE TASK STATUS REQUEST ===');
  
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    const userId = req.user._id || req.user.user_id || req.user.id;
    const userRole = req.user.role;
    
    console.log('📋 Updating task status:', taskId, 'to:', status);
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_STATUS',
          message: 'Status is required'
        }
      });
    }
    
    const project = await Project.findOne({
      'milestones._id': taskId
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        }
      });
    }
    
    // Check permissions
    if (userRole === 'crm_manager' && project.assigned_to?.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You can only update tasks in your assigned projects'
        }
      });
    }
    
    if (userRole === 'project_manager' && project.project_manager?.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You can only update tasks in projects assigned to you'
        }
      });
    }
    
    const milestone = project.milestones.id(taskId);
    milestone.status = status;
    milestone.updated_at = new Date();
    
    // Auto-update progress based on status
    if (status === 'completed') {
      milestone.progress = 100;
    } else if (status === 'in_progress' && milestone.progress === 0) {
      milestone.progress = 25;
    }
    
    await project.save();
    
    console.log('📋 Task status updated successfully');
    
    // Log activity
    const ActivityLog = require('../models/ActivityLog');
    try {
      const activityLog = await ActivityLog.create({
        user: userId,
        action: 'update',
        resourceType: 'Task',
        resourceId: project._id,
        description: `Updated task "${milestone.title}" status to ${status}`,
        ipAddress: req.ip
      });
      console.log('✅ Activity logged:', activityLog._id);
    } catch (activityError) {
      console.error('❌ Failed to log activity:', activityError.message);
    }
    
    res.json({
      success: true,
      data: {
        _id: milestone._id,
        status: milestone.status,
        progress: milestone.progress,
        updatedAt: milestone.updated_at
      },
      message: 'Task status updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error in updateTaskStatus:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_STATUS_UPDATE_ERROR',
        message: 'Failed to update task status'
      }
    });
  }
};

/**
 * Delete task
 * @route DELETE /api/tasks/:id
 * @access Private (Admin only)
 */
exports.deleteTask = async (req, res) => {
  console.log('\n📋 === DELETE TASK REQUEST ===');
  
  try {
    const taskId = req.params.id;
    
    console.log('📋 Deleting task:', taskId);
    
    const project = await Project.findOne({
      'milestones._id': taskId
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        }
      });
    }
    
    project.milestones.id(taskId).remove();
    await project.save();
    
    console.log('📋 Task deleted successfully');
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error in deleteTask:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_DELETE_ERROR',
        message: 'Failed to delete task'
      }
    });
  }
};

/**
 * Get task statistics
 * @route GET /api/tasks/stats
 * @access Private (Admin, Lead Manager, CRM Manager)
 */
exports.getTaskStats = async (req, res) => {
  console.log('\n📋 === GET TASK STATS REQUEST ===');
  
  try {
    const userRole = req.user.role;
    const userId = req.user._id || req.user.user_id || req.user.id;
    
    let projectFilter = {};
    
    // Role-based filtering
    if (userRole === 'crm_manager') {
      projectFilter.assigned_to = userId;
    } else if (userRole === 'lead_manager') {
      projectFilter.created_by = userId;
    }
    
    const projects = await Project.find(projectFilter).lean();
    
    let totalTasks = 0;
    let pendingTasks = 0;
    let inProgressTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    
    const now = new Date();
    
    projects.forEach(project => {
      if (project.milestones && project.milestones.length > 0) {
        project.milestones.forEach(milestone => {
          totalTasks++;
          
          switch (milestone.status) {
            case 'pending':
              pendingTasks++;
              break;
            case 'in_progress':
              inProgressTasks++;
              break;
            case 'completed':
              completedTasks++;
              break;
          }
          
          // Check if overdue
          if (milestone.target_date && new Date(milestone.target_date) < now && milestone.status !== 'completed') {
            overdueTasks++;
          }
        });
      }
    });
    
    const stats = {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
    
    console.log('📋 Task stats calculated:', stats);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ Error in getTaskStats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_STATS_ERROR',
        message: 'Failed to fetch task statistics'
      }
    });
  }
};


/**
 * Upload files to task
 * @route POST /api/tasks/:id/upload
 * @access Private (Employee, Project Manager, CRM Manager, Admin)
 */
exports.uploadTaskFiles = async (req, res) => {
  console.log('\n📋 === UPLOAD TASK FILES REQUEST ===');
  
  try {
    const taskId = req.params.id;
    const userId = req.user._id || req.user.user_id || req.user.id;
    const description = req.body.description || '';
    
    console.log('📋 Task ID:', taskId);
    console.log('📋 User ID:', userId);
    console.log('📋 Files:', req.files?.length || 0);
    console.log('📋 Description:', description);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILES',
          message: 'No files provided'
        }
      });
    }
    
    // Find project containing this task
    const project = await Project.findOne({
      'milestones._id': taskId
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        }
      });
    }
    
    const milestone = project.milestones.id(taskId);
    
    // Add files to milestone - each file gets the same description from this request
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploaded_by: userId,
      uploaded_at: new Date(),
      description: description // Single description for this upload request
    }));
    
    if (!milestone.files) {
      milestone.files = [];
    }
    
    milestone.files.push(...uploadedFiles);
    milestone.updated_at = new Date();
    
    await project.save();
    
    console.log('📋 Files uploaded successfully:', uploadedFiles.length);
    
    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        filesUploaded: uploadedFiles.length,
        files: uploadedFiles
      }
    });
    
  } catch (error) {
    console.error('❌ Error uploading files:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FILE_UPLOAD_ERROR',
        message: 'Failed to upload files'
      }
    });
  }
};
