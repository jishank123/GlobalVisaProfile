const User = require('../models/User');
const Client = require('../models/Client');
const Lead = require('../models/Lead');
const Project = require('../models/Project');
const Payment = require('../models/Payment');
const Query = require('../models/Query');
const ActivityLog = require('../models/ActivityLog');

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

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private (All authenticated users)
exports.getDashboardAnalytics = async (req, res) => {
  try {
    let analytics = {};
    
    // Role-based analytics
    if (req.user.role === 'admin') {
      analytics = await getAdminAnalytics();
    } else if (req.user.role === 'lead_manager') {
      analytics = await getLeadManagerAnalytics(req.user.user_id);
    } else if (req.user.role === 'crm_manager') {
      analytics = await getCRMManagerAnalytics(req.user.user_id);
    } else if (req.user.role === 'client') {
      analytics = await getClientAnalytics(req.user.user_id);
    }
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'view',
      'System',
      `Viewed dashboard analytics. Role: ${req.user.role}`,
      req.ip
    );
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ANALYTICS_FAILED',
        message: error.message
      }
    });
  }
};

// Admin Analytics
const getAdminAnalytics = async () => {
  const [
    totalUsers,
    totalClients,
    totalLeads,
    totalProjects,
    totalRevenue,
    usersByRole,
    clientsByStatus,
    leadsByStatus,
    projectsByStatus,
    revenueByMonth,
    recentActivities
  ] = await Promise.all([
    User.countDocuments({ status: { $ne: 'deleted' } }),
    Client.countDocuments({ status: { $ne: 'deleted' } }),
    Lead.countDocuments({ status: { $ne: 'deleted' } }),
    Project.countDocuments({ status: { $ne: 'cancelled' } }),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    
    // Users by role
    User.aggregate([
      { $match: { status: { $ne: 'deleted' } } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    
    // Clients by status
    Client.aggregate([
      { $match: { status: { $ne: 'deleted' } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    
    // Leads by status
    Lead.aggregate([
      { $match: { status: { $ne: 'deleted' } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    
    // Projects by status
    Project.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    
    // Revenue by month (last 6 months)
    Payment.aggregate([
      {
        $match: {
          status: 'completed',
          created_at: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$created_at' },
            month: { $month: '$created_at' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    
    // Recent activities
    ActivityLog.find()
      .populate('user', 'first_name last_name email role')
      .sort({ timestamp: -1 })
      .limit(10)
  ]);
  
  return {
    overview: {
      totalUsers,
      totalClients,
      totalLeads,
      totalProjects,
      totalRevenue: totalRevenue[0]?.total || 0
    },
    distributions: {
      usersByRole,
      clientsByStatus,
      leadsByStatus,
      projectsByStatus
    },
    trends: {
      revenueByMonth
    },
    recentActivities
  };
};

// Lead Manager Analytics
const getLeadManagerAnalytics = async (userId) => {
  const [
    myLeads,
    myConversions,
    leadsByStatus,
    conversionRate,
    recentLeads,
    monthlyLeads
  ] = await Promise.all([
    Lead.countDocuments({ assignedTo: userId, status: { $ne: 'deleted' } }),
    Lead.countDocuments({ assignedTo: userId, status: 'converted' }),
    
    // My leads by status
    Lead.aggregate([
      { $match: { assignedTo: userId, status: { $ne: 'deleted' } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    
    // Conversion rate calculation
    Lead.aggregate([
      { $match: { assignedTo: userId, status: { $ne: 'deleted' } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          converted: {
            $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] }
          }
        }
      }
    ]),
    
    // Recent leads
    Lead.find({ assignedTo: userId, status: { $ne: 'deleted' } })
      .sort({ created_at: -1 })
      .limit(5),
    
    // Monthly lead acquisition (last 6 months)
    Lead.aggregate([
      {
        $match: {
          assignedTo: userId,
          status: { $ne: 'deleted' },
          created_at: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$created_at' },
            month: { $month: '$created_at' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ]);
  
  const conversionRatePercent = conversionRate[0] ? 
    (conversionRate[0].converted / conversionRate[0].total * 100) : 0;
  
  return {
    overview: {
      myLeads,
      myConversions,
      conversionRate: Math.round(conversionRatePercent * 100) / 100
    },
    distributions: {
      leadsByStatus
    },
    trends: {
      monthlyLeads
    },
    recentLeads
  };
};

// CRM Manager Analytics
const getCRMManagerAnalytics = async (userId) => {
  const [
    myClients,
    myProjects,
    activeProjects,
    completedProjects,
    totalRevenue,
    clientsByStatus,
    projectsByStatus,
    recentProjects,
    monthlyRevenue
  ] = await Promise.all([
    Client.countDocuments({ assignedManager: userId, status: { $ne: 'deleted' } }),
    
    // Count projects for assigned clients
    Project.countDocuments({
      client: { 
        $in: await Client.find({ assignedManager: userId }).distinct('_id') 
      },
      status: { $ne: 'cancelled' }
    }),
    
    // Active projects
    Project.countDocuments({
      client: { 
        $in: await Client.find({ assignedManager: userId }).distinct('_id') 
      },
      status: 'in_progress'
    }),
    
    // Completed projects
    Project.countDocuments({
      client: { 
        $in: await Client.find({ assignedManager: userId }).distinct('_id') 
      },
      status: 'completed'
    }),
    
    // Total revenue from assigned clients
    Payment.aggregate([
      {
        $lookup: {
          from: 'clients',
          localField: 'client',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      {
        $match: {
          'clientInfo.assignedManager': userId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]),
    
    // My clients by status
    Client.aggregate([
      { $match: { assignedManager: userId, status: { $ne: 'deleted' } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    
    // My projects by status
    Project.aggregate([
      {
        $lookup: {
          from: 'clients',
          localField: 'client',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      {
        $match: {
          'clientInfo.assignedManager': userId,
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Recent projects
    Project.find({
      client: { 
        $in: await Client.find({ assignedManager: userId }).distinct('_id') 
      },
      status: { $ne: 'cancelled' }
    })
      .populate('client', 'name email')
      .populate('service', 'name category')
      .sort({ created_at: -1 })
      .limit(5),
    
    // Monthly revenue (last 6 months)
    Payment.aggregate([
      {
        $lookup: {
          from: 'clients',
          localField: 'client',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      {
        $match: {
          'clientInfo.assignedManager': userId,
          status: 'completed',
          created_at: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$created_at' },
            month: { $month: '$created_at' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ]);
  
  return {
    overview: {
      myClients,
      myProjects,
      activeProjects,
      completedProjects,
      totalRevenue: totalRevenue[0]?.total || 0
    },
    distributions: {
      clientsByStatus,
      projectsByStatus
    },
    trends: {
      monthlyRevenue
    },
    recentProjects
  };
};

// Client Analytics
const getClientAnalytics = async (userId) => {
  // Find client record
  const clientRecord = await Client.findOne({ user: userId });
  
  if (!clientRecord) {
    return {
      overview: {
        message: 'No client profile found'
      }
    };
  }
  
  const [
    myProjects,
    completedProjects,
    totalPaid,
    totalDue,
    myQueries,
    resolvedQueries,
    projectsByStatus,
    recentProjects,
    recentPayments
  ] = await Promise.all([
    Project.countDocuments({ client: clientRecord._id, status: { $ne: 'cancelled' } }),
    Project.countDocuments({ client: clientRecord._id, status: 'completed' }),
    
    // Total paid
    Payment.aggregate([
      { $match: { client: clientRecord._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    
    // Total due
    Payment.aggregate([
      { $match: { client: clientRecord._id, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    
    Query.countDocuments({ client: clientRecord._id }),
    Query.countDocuments({ client: clientRecord._id, status: 'resolved' }),
    
    // My projects by status
    Project.aggregate([
      { $match: { client: clientRecord._id, status: { $ne: 'cancelled' } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    
    // Recent projects
    Project.find({ client: clientRecord._id, status: { $ne: 'cancelled' } })
      .populate('service', 'name category price')
      .sort({ created_at: -1 })
      .limit(5),
    
    // Recent payments
    Payment.find({ client: clientRecord._id })
      .sort({ created_at: -1 })
      .limit(5)
  ]);
  
  return {
    overview: {
      myProjects,
      completedProjects,
      totalPaid: totalPaid[0]?.total || 0,
      totalDue: totalDue[0]?.total || 0,
      myQueries,
      resolvedQueries
    },
    distributions: {
      projectsByStatus
    },
    recentProjects,
    recentPayments
  };
};

// @desc    Get revenue analytics
// @route   GET /api/analytics/revenue
// @access  Private (Admin, CRM Manager)
exports.getRevenueAnalytics = async (req, res) => {
  try {
    if (!['admin', 'crm_manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }
    
    let matchQuery = { status: 'completed' };
    
    // Filter by assigned clients for CRM managers
    if (req.user.role === 'crm_manager') {
      const assignedClients = await Client.find({ assignedManager: req.user.user_id }).distinct('_id');
      matchQuery.client = { $in: assignedClients };
    }
    
    const [
      totalRevenue,
      monthlyRevenue,
      revenueByService,
      topClients
    ] = await Promise.all([
      // Total revenue
      Payment.aggregate([
        { $match: matchQuery },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Monthly revenue (last 12 months)
      Payment.aggregate([
        {
          $match: {
            ...matchQuery,
            created_at: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$created_at' },
              month: { $month: '$created_at' }
            },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      
      // Revenue by service
      Payment.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: 'projects',
            localField: 'project',
            foreignField: '_id',
            as: 'projectInfo'
          }
        },
        {
          $lookup: {
            from: 'services',
            localField: 'projectInfo.service',
            foreignField: '_id',
            as: 'serviceInfo'
          }
        },
        {
          $group: {
            _id: '$serviceInfo.name',
            revenue: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } }
      ]),
      
      // Top clients by revenue
      Payment.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: 'clients',
            localField: 'client',
            foreignField: '_id',
            as: 'clientInfo'
          }
        },
        {
          $group: {
            _id: '$client',
            revenue: { $sum: '$amount' },
            clientName: { $first: '$clientInfo.name' },
            clientEmail: { $first: '$clientInfo.email' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ])
    ]);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'view',
      'System',
      `Viewed revenue analytics. Role: ${req.user.role}`,
      req.ip
    );
    
    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue,
        revenueByService,
        topClients
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_REVENUE_ANALYTICS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get performance analytics
// @route   GET /api/analytics/performance
// @access  Private (Admin, Managers)
exports.getPerformanceAnalytics = async (req, res) => {
  try {
    if (!['admin', 'lead_manager', 'crm_manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }
    
    let analytics = {};
    
    if (req.user.role === 'admin') {
      // Admin sees all performance metrics
      analytics = await getAdminPerformanceAnalytics();
    } else if (req.user.role === 'lead_manager') {
      // Lead manager sees their lead conversion performance
      analytics = await getLeadManagerPerformanceAnalytics(req.user.user_id);
    } else if (req.user.role === 'crm_manager') {
      // CRM manager sees their client management performance
      analytics = await getCRMManagerPerformanceAnalytics(req.user.user_id);
    }
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'view',
      'System',
      `Viewed performance analytics. Role: ${req.user.role}`,
      req.ip
    );
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PERFORMANCE_ANALYTICS_FAILED',
        message: error.message
      }
    });
  }
};

// Helper functions for performance analytics
const getAdminPerformanceAnalytics = async () => {
  // Implementation for admin performance analytics
  return {
    message: 'Admin performance analytics - to be implemented'
  };
};

const getLeadManagerPerformanceAnalytics = async (userId) => {
  // Implementation for lead manager performance analytics
  return {
    message: 'Lead manager performance analytics - to be implemented'
  };
};

const getCRMManagerPerformanceAnalytics = async (userId) => {
  // Implementation for CRM manager performance analytics
  return {
    message: 'CRM manager performance analytics - to be implemented'
  };
};