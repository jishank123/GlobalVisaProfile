const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Payment = require('../models/Payment');
const Query = require('../models/Query');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private (Admin, Managers)
router.get('/dashboard', protect, authorize('admin', 'lead_manager', 'crm_manager'), async (req, res) => {
  try {
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'crm_manager') {
      query.assignedManager = req.user._id;
    }
    
    // Users stats (Admin only)
    let userStats = null;
    if (req.user.role === 'admin') {
      const totalUsers = await User.countDocuments();
      const usersByRole = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);
      
      userStats = {
        total: totalUsers,
        byRole: usersByRole
      };
    }
    
    // Leads stats
    const totalLeads = await Lead.countDocuments(req.user.role === 'lead_manager' ? { assignedTo: req.user._id } : {});
    const leadsByStatus = await Lead.aggregate([
      ...(req.user.role === 'lead_manager' ? [{ $match: { assignedTo: req.user._id } }] : []),
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get new leads this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const newLeadsThisWeek = await Lead.countDocuments({
      ...(req.user.role === 'lead_manager' ? { assignedTo: req.user._id } : {}),
      createdAt: { $gte: weekStart }
    });
    
    // Clients stats
    const clientQuery = req.user.role === 'crm_manager' ? { assignedManager: req.user._id } : {};
    const totalClients = await Client.countDocuments(clientQuery);
    const clientsByStatus = await Client.aggregate([
      { $match: clientQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Projects stats
    const projectQuery = req.user.role === 'crm_manager' ? { assignedTeam: req.user._id } : {};
    const totalProjects = await Project.countDocuments(projectQuery);
    const projectsByStatus = await Project.aggregate([
      { $match: projectQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const activeProjects = await Project.countDocuments({
      ...projectQuery,
      status: { $in: ['planning', 'in_progress'] }
    });
    
    // Payments stats
    const paymentQuery = {};
    if (req.user.role === 'crm_manager') {
      const clientIds = await Client.find({ assignedManager: req.user._id }).distinct('_id');
      paymentQuery.client = { $in: clientIds };
    }
    
    const paymentStats = await Payment.aggregate([
      { $match: paymentQuery },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Monthly revenue
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          ...paymentQuery,
          status: 'completed',
          paymentDate: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Queries stats
    const queryQuery = req.user.role === 'crm_manager' ? { assignedTo: req.user._id } : {};
    const totalQueries = await Query.countDocuments(queryQuery);
    const pendingQueries = await Query.countDocuments({
      ...queryQuery,
      status: { $in: ['open', 'in_progress'] }
    });
    
    // Calculate conversion rate (leads to clients)
    const conversionRate = totalLeads > 0 ? ((totalClients / totalLeads) * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: {
        users: userStats,
        leads: {
          total: totalLeads,
          newThisWeek: newLeadsThisWeek,
          byStatus: leadsByStatus,
          conversionRate: parseFloat(conversionRate)
        },
        clients: {
          total: totalClients,
          byStatus: clientsByStatus
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          byStatus: projectsByStatus
        },
        payments: {
          byStatus: paymentStats,
          monthlyRevenue: monthlyRevenue[0]?.total || 0
        },
        queries: {
          total: totalQueries,
          pending: pendingQueries
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/revenue
// @desc    Get revenue analytics
// @access  Private (Admin, CRM Manager)
router.get('/revenue', protect, authorize('admin', 'crm_manager'), async (req, res) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
    let paymentQuery = { status: 'completed' };
    
    // Filter by manager's clients
    if (req.user.role === 'crm_manager') {
      const clientIds = await Client.find({ assignedManager: req.user._id }).distinct('_id');
      paymentQuery.client = { $in: clientIds };
    }
    
    // Revenue by month
    const revenueByMonth = await Payment.aggregate([
      {
        $match: {
          ...paymentQuery,
          paymentDate: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${parseInt(year) + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Total revenue
    const totalRevenue = await Payment.aggregate([
      { $match: paymentQuery },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        byMonth: revenueByMonth,
        total: totalRevenue[0]?.total || 0,
        year: parseInt(year)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/performance
// @desc    Get team performance analytics
// @access  Private (Admin only)
router.get('/performance', protect, authorize('admin'), async (req, res) => {
  try {
    // Get CRM managers performance
    const managers = await User.find({ role: 'crm_manager' }).select('name email');
    
    const managerPerformance = await Promise.all(
      managers.map(async (manager) => {
        const clientCount = await Client.countDocuments({ assignedManager: manager._id });
        const projectCount = await Project.countDocuments({ assignedTeam: manager._id });
        
        const clientIds = await Client.find({ assignedManager: manager._id }).distinct('_id');
        const revenue = await Payment.aggregate([
          {
            $match: {
              client: { $in: clientIds },
              status: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);
        
        const queryCount = await Query.countDocuments({ assignedTo: manager._id });
        const resolvedQueries = await Query.countDocuments({
          assignedTo: manager._id,
          status: { $in: ['resolved', 'closed'] }
        });
        
        return {
          manager: {
            id: manager._id,
            name: manager.name,
            email: manager.email
          },
          clients: clientCount,
          projects: projectCount,
          revenue: revenue[0]?.total || 0,
          queries: {
            total: queryCount,
            resolved: resolvedQueries,
            resolutionRate: queryCount > 0 ? ((resolvedQueries / queryCount) * 100).toFixed(2) : 0
          }
        };
      })
    );
    
    res.json({
      success: true,
      data: managerPerformance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get trends over time
// @access  Private (Admin, Managers)
router.get('/trends', protect, authorize('admin', 'lead_manager', 'crm_manager'), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Leads trend
    const leadsTrend = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Clients trend
    const clientsTrend = await Client.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Projects trend
    const projectsTrend = await Project.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        period: `${days} days`,
        leads: leadsTrend,
        clients: clientsTrend,
        projects: projectsTrend
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
