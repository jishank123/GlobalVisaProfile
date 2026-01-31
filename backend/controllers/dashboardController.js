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
    const totalClients = await ClientAccount.countDocuments({ status: { $ne: 'deleted' } });
    console.log('👥 Total Clients:', totalClients);
    
    // Get active projects (from Project collection)
    const activeProjects = await Project.countDocuments({ 
      status: { $in: ['active', 'in_progress', 'pending'] } 
    });
    console.log('📋 Active Projects:', activeProjects);
    
    // Get total team members (admin, lead_manager, crm_manager - excluding clients and deleted users)
    const teamMembers = await User.countDocuments({ 
      role: { $in: ['admin', 'lead_manager', 'crm_manager'] },
      status: { $ne: 'deleted' }
    });
    console.log('👨‍💼 Team Members (admin, lead_manager, crm_manager):', teamMembers);
    
    // Calculate real monthly revenue from payments
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const monthlyPayments = await Payment.aggregate([
      {
        $match: {
          $or: [
            { paymentDate: { $gte: startOfMonth, $lte: endOfMonth } },
            { createdAt: { $gte: startOfMonth, $lte: endOfMonth } }
          ],
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
    
    // Get additional statistics
    const totalLeads = await ContactForm.countDocuments();
    const appointmentRequests = await AppointmentRequest.countDocuments();
    const totalProjects = await Project.countDocuments();
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    
    // Get recent activity counts
    const recentClients = await ClientAccount.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    
    const recentAssessments = await ProfileAssessment.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    
    const stats = {
      totalClients,
      activeProjects,
      monthlyRevenue,
      teamMembers,
      totalLeads,
      appointmentRequests,
      totalProjects,
      completedProjects,
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
    
    const activities = [];
    
    // Get recent client registrations
    const recentClients = await ClientAccount.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('full_name email createdAt');
    
    recentClients.forEach(client => {
      activities.push({
        id: `client_${client._id}`,
        type: 'user_registration',
        icon: 'fas fa-user-plus',
        color: '#3b82f6',
        message: `New client registered: ${client.full_name || client.email}`,
        timestamp: client.createdAt
      });
    });
    
    // Get recent profile assessments
    const recentAssessments = await ProfileAssessment.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('client_name client_email overall_score createdAt');
    
    recentAssessments.forEach(assessment => {
      activities.push({
        id: `assessment_${assessment._id}`,
        type: 'profile_assessment',
        icon: 'fas fa-chart-line',
        color: '#14b8a6',
        message: `Profile assessment completed for ${assessment.client_name}`,
        timestamp: assessment.createdAt
      });
    });
    
    // Get recent contact forms
    const recentContacts = await ContactForm.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name email visa_type createdAt');
    
    recentContacts.forEach(contact => {
      activities.push({
        id: `contact_${contact._id}`,
        type: 'contact_form',
        icon: 'fas fa-envelope',
        color: '#8b5cf6',
        message: `New contact form submission from ${contact.name}`,
        timestamp: contact.createdAt
      });
    });
    
    // Get recent payments
    const recentPayments = await Payment.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('client', 'name email')
      .select('amount client createdAt');
    
    recentPayments.forEach(payment => {
      activities.push({
        id: `payment_${payment._id}`,
        type: 'payment_received',
        icon: 'fas fa-dollar-sign',
        color: '#f59e0b',
        message: `Payment received: $${payment.amount.toLocaleString()} from ${payment.client?.name || 'Client'}`,
        timestamp: payment.createdAt
      });
    });
    
    // Get recent projects
    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('client', 'name email')
      .select('service_name client status createdAt');
    
    recentProjects.forEach(project => {
      const isCompleted = project.status === 'completed';
      activities.push({
        id: `project_${project._id}`,
        type: isCompleted ? 'project_completion' : 'project_created',
        icon: isCompleted ? 'fas fa-check' : 'fas fa-project-diagram',
        color: isCompleted ? '#10b981' : '#06b6d4',
        message: isCompleted 
          ? `Project completed: ${project.service_name} for ${project.client?.name || 'Client'}`
          : `New project created: ${project.service_name} for ${project.client?.name || 'Client'}`,
        timestamp: project.createdAt
      });
    });
    
    // Get recent appointments
    const recentAppointments = await AppointmentRequest.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .select('name email status createdAt');
    
    recentAppointments.forEach(appointment => {
      activities.push({
        id: `appointment_${appointment._id}`,
        type: 'appointment_scheduled',
        icon: 'fas fa-calendar-check',
        color: '#84cc16',
        message: `Appointment ${appointment.status === 'scheduled' ? 'scheduled' : 'requested'} with ${appointment.name}`,
        timestamp: appointment.createdAt
      });
    });
    
    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Return top 10 activities
    const topActivities = activities.slice(0, 10);
    
    console.log(`📊 Found ${topActivities.length} recent activities`);
    
    res.json({
      success: true,
      data: topActivities
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

/**
 * Get Client Dashboard Data
 * @route GET /api/dashboard/client
 * @access Private (Client only)
 */
exports.getClientDashboard = async (req, res) => {
  try {
    console.log('👤 === CLIENT DASHBOARD REQUEST ===');
    console.log('👤 Client:', req.user?.email, 'Role:', req.user?.role);
    
    const clientEmail = req.user.email;
    
    // Find or create client record
    const Client = require('../models/Client');
    let clientRecord = await Client.findOne({ email: clientEmail });
    
    if (!clientRecord) {
      // Create client record from user account
      const user = await User.findById(req.user.user_id);
      clientRecord = await Client.create({
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        phone: user.phone,
        university: user.company || 'Unknown',
        status: 'active',
        user_id: user._id
      });
      console.log('✅ Created new client record for:', clientEmail);
    }
    
    // Get client's projects
    const projects = await Project.find({ client: clientRecord._id })
      .populate('service', 'name category')
      .populate('assigned_to', 'first_name last_name email')
      .sort({ createdAt: -1 });
    
    // Get client's payments
    const payments = await Payment.find({ client: clientRecord._id })
      .populate('project', 'project_id service_name')
      .sort({ paymentDate: -1 })
      .limit(10);
    
    // Get client's queries
    const Query = require('../models/Query');
    const queries = await Query.find({ client: clientRecord._id })
      .populate('assigned_to', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get client's appointments
    const appointments = await AppointmentRequest.find({ email: clientEmail })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Calculate statistics
    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalPayments: payments.length,
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      completedPayments: payments.filter(p => p.status === 'completed').length,
      totalQueries: queries.length,
      openQueries: queries.filter(q => q.status === 'open').length,
      resolvedQueries: queries.filter(q => q.status === 'resolved').length,
      totalAppointments: appointments.length,
      pendingAppointments: appointments.filter(a => a.status === 'pending').length
    };
    
    // Calculate total amount paid and pending
    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalPending = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const dashboardData = {
      client: clientRecord,
      stats,
      projects: projects.slice(0, 5), // Recent 5 projects
      payments: payments.slice(0, 5), // Recent 5 payments
      queries: queries.slice(0, 5), // Recent 5 queries
      appointments: appointments.slice(0, 5), // Recent 5 appointments
      financials: {
        totalPaid,
        totalPending,
        currency: 'USD'
      }
    };
    
    console.log('👤 Client dashboard data prepared for:', clientEmail);
    console.log('👤 Stats:', stats);
    
    res.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('❌ Client dashboard error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CLIENT_DASHBOARD_FAILED',
        message: error.message
      }
    });
  }
};