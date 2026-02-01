const Project = require('../models/Project');
const User = require('../models/User');

/**
 * Get tasks for current CRM manager's projects
 * @route GET /api/tasks/my-tasks
 * @access Private (CRM Manager only)
 */
exports.getMyTasks = async (req, res) => {
  console.log('\n📋 === GET MY TASKS REQUEST ===');
  console.log('📋 CRM Manager requesting their tasks');
  
  try {
    const crmManagerId = req.user.user_id || req.user.id;
    console.log('📋 CRM Manager ID:', crmManagerId);
    
    // Get projects assigned to this CRM manager
    const projects = await Project.find({ 
      assigned_to: crmManagerId,
      status: { $ne: 'deleted' }
    }).populate('client', 'name firstName lastName email')
      .populate('service', 'name')
      .lean();
    
    console.log('📋 Found projects:', projects.length);
    
    // Extract tasks from project milestones
    const tasks = [];
    
    projects.forEach(project => {
      if (project.milestones && project.milestones.length > 0) {
        project.milestones.forEach(milestone => {
          tasks.push({
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
              client: project.client
            },
            createdAt: milestone.created_at || project.createdAt,
            updatedAt: milestone.updated_at || project.updatedAt
          });
        });
      }
    });
    
    console.log('📋 Total tasks found:', tasks.length);
    
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
 * @access Private (Admin, Lead Manager, CRM Manager)
 */
exports.getTasks = async (req, res) => {
  console.log('\n📋 === GET ALL TASKS REQUEST ===');
  
  try {
    const { status, priority, project_id, assigned_to } = req.query;
    const userRole = req.user.role;
    const userId = req.user.user_id || req.user.id;
    
    let projectFilter = {};
    
    // Role-based filtering
    if (userRole === 'crm_manager') {
      projectFilter.assigned_to = userId;
    } else if (userRole === 'lead_manager') {
      projectFilter.created_by = userId;
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
 * @access Private (CRM Manager, Admin)
 */
exports.createTask = async (req, res) => {
  console.log('\n📋 === CREATE TASK REQUEST ===');
  
  try {
    const { project_id, title, description, status, priority, due_date, progress } = req.body;
    const userId = req.user.user_id || req.user.id;
    
    console.log('📋 Creating task for project:', project_id);
    
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
    if (req.user.role === 'crm_manager' && project.assigned_to?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You can only add tasks to your assigned projects'
        }
      });
    }
    
    const newMilestone = {
      title: title.trim(),
      description: description?.trim() || '',
      status: status || 'pending',
      priority: priority || 'medium',
      target_date: due_date ? new Date(due_date) : null,
      progress: progress || 0,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    project.milestones.push(newMilestone);
    await project.save();
    
    const createdMilestone = project.milestones[project.milestones.length - 1];
    
    console.log('📋 Task created successfully:', createdMilestone._id);
    
    res.status(201).json({
      success: true,
      data: {
        _id: createdMilestone._id,
        title: createdMilestone.title,
        description: createdMilestone.description,
        status: createdMilestone.status,
        priority: createdMilestone.priority,
        due_date: createdMilestone.target_date,
        progress: createdMilestone.progress,
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
 * @access Private (CRM Manager, Admin)
 */
exports.updateTask = async (req, res) => {
  console.log('\n📋 === UPDATE TASK REQUEST ===');
  
  try {
    const taskId = req.params.id;
    const { title, description, status, priority, due_date, progress } = req.body;
    const userId = req.user.user_id || req.user.id;
    
    console.log('📋 Updating task:', taskId);
    
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
    if (req.user.role === 'crm_manager' && project.assigned_to?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You can only update tasks in your assigned projects'
        }
      });
    }
    
    const milestone = project.milestones.id(taskId);
    
    // Update fields
    if (title !== undefined) milestone.title = title.trim();
    if (description !== undefined) milestone.description = description.trim();
    if (status !== undefined) milestone.status = status;
    if (priority !== undefined) milestone.priority = priority;
    if (due_date !== undefined) milestone.target_date = due_date ? new Date(due_date) : null;
    if (progress !== undefined) milestone.progress = Math.max(0, Math.min(100, progress));
    
    milestone.updated_at = new Date();
    
    await project.save();
    
    console.log('📋 Task updated successfully');
    
    res.json({
      success: true,
      data: {
        _id: milestone._id,
        title: milestone.title,
        description: milestone.description,
        status: milestone.status,
        priority: milestone.priority,
        due_date: milestone.target_date,
        progress: milestone.progress,
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
 * @access Private (CRM Manager, Admin)
 */
exports.updateTaskStatus = async (req, res) => {
  console.log('\n📋 === UPDATE TASK STATUS REQUEST ===');
  
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    const userId = req.user.user_id || req.user.id;
    
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
    if (req.user.role === 'crm_manager' && project.assigned_to?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You can only update tasks in your assigned projects'
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
    const userId = req.user.user_id || req.user.id;
    
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