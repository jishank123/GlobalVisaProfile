const ClientAccount = require('../models/ClientAccount');
const User = require('../models/User');
const ProfileAssessment = require('../models/ProfileAssessment');
const ContactForm = require('../models/ContactForm');
const AppointmentRequest = require('../models/AppointmentRequest');
const Payment = require('../models/Payment');
const Project = require('../models/Project');
const Service = require('../models/Service');

/**
 * Get Admin Dashboard Statistics
 * @route GET /api/dashboard/stats
 * @access Private (Admin only)
 */
exports.getDashboardStats = async (req, res) => {
  console.log('\n📊 === DASHBOARD STATS REQUEST ===');
  console.log('📊 Admin requesting dashboard statistics');
  
  try {
    console.log('📊 Fetching statistics from database...');
    
    // Get total clients (from ClientAccount collection)
    const totalClients = await ClientAccount.countDocuments();
    console.log('👥 Total Clients:', totalClients);
    
    // Get total team members (from User collection, excluding admin)
    const teamMembers = await User.countDocuments({ role: { $ne: 'admin' } });
    console.log('👨‍💼 Team Members:', teamMembers);
    
    // Get total profile assessments (active projects proxy)
    const activeProjects = await ProfileAssessment.countDocuments();
    console.log('📋 Profile Assessments (Active Projects):', activeProjects);
    
    // Get total contact forms (leads)
    const totalLeads = await ContactForm.countDocuments();
    console.log('📞 Total Contact Forms (Leads):', totalLeads);
    
    // Get total appointment requests
    const appointmentRequests = await AppointmentRequest.countDocuments();
    console.log('📅 Appointment Requests:', appointmentRequests);
    
    // Calculate real monthly revenue from payments
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const monthlyPayments = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);
    
    const monthlyRevenue = monthlyPayments.length > 0 ? monthlyPayments[0].totalRevenue : 0;
    console.log('💰 Real Monthly Revenue:', monthlyRevenue);
    
    // Get recent activity counts
    const recentClients = await ClientAccount.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    
    const recentAssessments = await ProfileAssessment.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    
    const stats = {
      totalClients,
      teamMembers,
      activeProjects,
      monthlyRevenue,
      totalLeads,
      appointmentRequests,
      recentActivity: {
        newClients: recentClients,
        newAssessments: recentAssessments
      }
    };
    
    console.log('📊 Final statistics:', stats);
    
    res.json({
      success: true,
      data: stats
    });
    
    console.log('✅ Dashboard statistics sent successfully');
    
  } catch (error) {
    console.error('💥 Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DASHBOARD_STATS_ERROR',
        message: 'Failed to fetch dashboard statistics'
      }
    });
  }
  
  console.log('📊 === DASHBOARD STATS REQUEST COMPLETED ===\n');
};

/**
 * Get Financial Overview Data
 * @route GET /api/dashboard/financial
 * @access Private (Admin only)
 */
exports.getFinancialOverview = async (req, res) => {
  console.log('\n💰 === FINANCIAL OVERVIEW REQUEST ===');
  console.log('💰 Admin requesting financial overview');
  
  try {
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Get revenue breakdown by service category
    const revenueByService = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'completed'
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectData'
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: 'projectData.service',
          foreignField: '_id',
          as: 'serviceData'
        }
      },
      {
        $group: {
          _id: '$serviceData.category',
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);
    
    // Get payment status breakdown
    const paymentStatus = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate overdue payments (past due date)
    const overduePayments = await Payment.aggregate([
      {
        $match: {
          status: 'pending',
          dueDate: { $lt: new Date() }
        }
      },
      {
        $group: {
          _id: null,
          totalOverdue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get total revenue for the month
    const totalMonthlyRevenue = revenueByService.reduce((sum, item) => sum + item.totalRevenue, 0);
    
    // Calculate payment status percentages
    const totalPayments = paymentStatus.reduce((sum, item) => sum + item.totalAmount, 0);
    const paymentStatusWithPercentages = paymentStatus.map(status => ({
      ...status,
      percentage: totalPayments > 0 ? Math.round((status.totalAmount / totalPayments) * 100) : 0
    }));
    
    // Format revenue breakdown for frontend
    const formattedRevenueBreakdown = revenueByService.map(item => ({
      category: item._id && item._id.length > 0 ? item._id[0] : 'Other',
      revenue: item.totalRevenue,
      count: item.count
    }));
    
    const financialData = {
      monthlyRevenue: totalMonthlyRevenue,
      revenueBreakdown: formattedRevenueBreakdown,
      paymentStatus: paymentStatusWithPercentages,
      overdueAmount: overduePayments.length > 0 ? overduePayments[0].totalOverdue : 0,
      overdueCount: overduePayments.length > 0 ? overduePayments[0].count : 0,
      totalPayments: totalPayments,
      month: currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
    };
    
    console.log('💰 Financial overview data:', financialData);
    
    res.json({
      success: true,
      data: financialData
    });
    
  } catch (error) {
    console.error('💥 Financial overview error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FINANCIAL_OVERVIEW_FAILED',
        message: error.message
      }
    });
  }
  
  console.log('💰 === FINANCIAL OVERVIEW REQUEST COMPLETED ===\n');
};

/**
 * Get Recent Activity for Dashboard
 * @route GET /api/dashboard/activity
 * @access Private (Admin only)
 */
exports.getRecentActivity = async (req, res) => {
  try {
    console.log('📊 Fetching recent activity...');
    
    // Get recent client registrations
    const recentClients = await ClientAccount.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('full_name email createdAt');
    
    // Get recent profile assessments
    const recentAssessments = await ProfileAssessment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('client_name client_email overall_score createdAt');
    
    // Get recent contact forms
    const recentContacts = await ContactForm.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email visa_type createdAt');
    
    const activity = {
      recentClients,
      recentAssessments,
      recentContacts
    };
    
    res.json({
      success: true,
      data: activity
    });
    
  } catch (error) {
    console.error('💥 Recent activity error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_ERROR',
        message: 'Failed to fetch recent activity'
      }
    });
  }
};