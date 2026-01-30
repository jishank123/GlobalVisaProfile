const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const Client = require('../models/Client');
const { auth } = require('../middleware/auth');

// @route   GET /api/activity/recent
// @desc    Get recent activity for current user (CRM Manager gets filtered by assigned clients)
// @access  Private
router.get('/recent', auth(['admin', 'crm_manager', 'lead_manager']), async (req, res) => {
  try {
    console.log('🕒 === GET RECENT ACTIVITY REQUEST ===');
    console.log('🕒 User:', req.user?.email, 'Role:', req.user?.role);
    
    const { limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by user for CRM managers
    if (req.user.role === 'crm_manager') {
      query.user = req.user.user_id;
    }
    
    const activities = await ActivityLog.find(query)
      .populate('user', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    console.log('🕒 Found recent activities:', activities.length);
    
    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('❌ Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_RECENT_ACTIVITY_FAILED',
        message: error.message
      }
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