const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const Client = require('../models/Client');
const { auth } = require('../middleware/auth');

// @route   GET /api/activity/create-test
// @desc    Create a test activity (for debugging)
// @access  Private
router.get('/create-test', auth(['admin', 'crm_manager', 'lead_manager', 'project_manager']), async (req, res) => {
  try {
    console.log('🧪 === CREATE TEST ACTIVITY ===');
    
    const testActivity = await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      resourceType: 'Task',
      resourceId: null,  // No specific resource
      description: `Test activity created by ${req.user.email}`,
      ipAddress: req.ip
    });
    
    console.log('🧪 Test activity created:', testActivity._id);
    
    res.json({
      success: true,
      message: 'Test activity created',
      data: testActivity
    });
  } catch (error) {
    console.error('❌ Error creating test activity:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/activity/health
// @desc    Health check endpoint
// @access  Public
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Activity API is working',
    timestamp: new Date()
  });
});

// @route   GET /api/activity/recent
// @desc    Get recent activity for current user
// @access  Private
router.get('/recent', auth(['admin', 'crm_manager', 'lead_manager', 'project_manager']), async (req, res) => {
  try {
    console.log('🕒 === GET RECENT ACTIVITY REQUEST ===');
    console.log('🕒 User:', req.user?.email, 'Role:', req.user?.role);
    console.log('🕒 User ID:', req.user?._id);
    
    const { limit = 10 } = req.query;
    
    // Get all activities sorted by date
    const activities = await ActivityLog.find({})
      .populate('user', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    console.log('🕒 Total activities returned:', activities.length);
    
    // Filter on the backend for Task/Project/Milestone
    const filtered = activities.filter(a => 
      ['Task', 'Project', 'Milestone'].includes(a.resourceType)
    );
    
    console.log('🕒 After filtering for Task/Project/Milestone:', filtered.length);
    filtered.forEach((a, idx) => {
      console.log(`  ${idx + 1}. ${a.resourceType} - ${a.action}: ${a.description}`);
    });
    
    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    console.error('❌ Error fetching recent activity:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_RECENT_ACTIVITY_FAILED',
        message: error.message
      }
    });
  }
});

// @route   GET /api/activity/all
// @desc    Get all activities (for debugging)
// @access  Private
router.get('/all', auth(['admin', 'crm_manager', 'lead_manager', 'project_manager']), async (req, res) => {
  try {
    console.log('📋 === GET ALL ACTIVITIES REQUEST ===');
    
    const allActivities = await ActivityLog.find({})
      .populate('user', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    console.log('📋 Total activities in DB:', allActivities.length);
    allActivities.forEach((a, idx) => {
      console.log(`${idx + 1}. ${a.resourceType} - ${a.action}: ${a.description}`);
    });
    
    res.json({
      success: true,
      count: allActivities.length,
      data: allActivities
    });
  } catch (error) {
    console.error('❌ Error fetching all activities:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/activity/debug
// @desc    Debug endpoint to check activities
// @access  Private
router.get('/debug', auth(['admin', 'crm_manager', 'lead_manager', 'project_manager']), async (req, res) => {
  try {
    console.log('🐛 === DEBUG ACTIVITY REQUEST ===');
    console.log('🐛 User:', req.user?.email, 'Role:', req.user?.role, 'ID:', req.user?._id);
    
    // Get all activities
    const allActivities = await ActivityLog.find({})
      .populate('user', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log('🐛 Total activities in DB:', allActivities.length);
    
    // Get PM's projects
    if (req.user.role === 'project_manager') {
      const Project = require('../models/Project');
      const pmProjects = await Project.find({ project_manager: req.user._id }).select('_id project_id');
      console.log('🐛 PM Projects:', pmProjects.map(p => ({ id: p._id.toString(), project_id: p.project_id })));
      
      // Check which activities match
      const matchingActivities = allActivities.filter(a => {
        const resourceIdMatch = pmProjects.some(p => p._id.toString() === a.resourceId?.toString());
        const userMatch = a.user?._id?.toString() === req.user._id.toString();
        return resourceIdMatch || userMatch;
      });
      
      console.log('🐛 Matching activities for PM:', matchingActivities.length);
      matchingActivities.forEach(a => {
        console.log(`  - ${a.resourceType} ${a.action}: ${a.description}`);
      });
    }
    
    res.json({
      success: true,
      debug: {
        totalActivities: allActivities.length,
        activities: allActivities.map(a => ({
          id: a._id,
          user: a.user?.email,
          action: a.action,
          resourceType: a.resourceType,
          resourceId: a.resourceId,
          description: a.description,
          createdAt: a.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error in debug endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/activity/stats
// @desc    Get activity statistics
// @access  Private (Admin, Managers)
router.get('/stats', auth(['admin', 'crm_manager', 'lead_manager']), async (req, res) => {
  try {
    console.log('📊 === GET ACTIVITY STATS REQUEST ===');
    console.log('📊 User:', req.user?.email, 'Role:', req.user?.role);
    
    let query = {};
    
    // Filter by user for CRM managers
    if (req.user.role === 'crm_manager') {
      query.user = req.user.user_id;
    }
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const [todayCount, weekCount, monthCount, byAction] = await Promise.all([
      ActivityLog.countDocuments({ ...query, createdAt: { $gte: startOfDay } }),
      ActivityLog.countDocuments({ ...query, createdAt: { $gte: startOfWeek } }),
      ActivityLog.countDocuments({ ...query, createdAt: { $gte: startOfMonth } }),
      ActivityLog.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        byAction
      }
    });
  } catch (error) {
    console.error('❌ Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ACTIVITY_STATS_FAILED',
        message: error.message
      }
    });
  }
});

module.exports = router;