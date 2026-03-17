const User = require('../models/User');
const Client = require('../models/Client');
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
  console.log('⏰ Start time:', new Date().toISOString());
  
  try {
    console.log('📊 Fetching statistics from database...');
    
    // Get total clients (from Client collection)
    console.log('🔍 Step 1: Counting clients...');
    const startClients = Date.now();
    const totalClients = await Client.countDocuments({ status: { $ne: 'deleted' } });
    console.log(`✅ Step 1 completed in ${Date.now() - startClients}ms`);
    console.log('👥 Total Clients:', totalClients);
    
    // Get active projects (from Project collection)
    console.log('🔍 Step 2: Counting active projects...');
    const startProjects = Date.now();
    
    // Since status is encrypted, we need to fetch all projects and filter after decryption
    const allProjects = await Project.find({}).lean();
    console.log('📊 All projects fetched:', allProjects.length);
    console.log('📊 All project statuses in DB:', allProjects.map(p => p.status));
    
    // Filter for active projects (active, pending, on_hold)
    const activeProjectsList = allProjects.filter(p => 
      ['active', 'pending', 'on_hold'].includes(p.status)
    );
    const activeProjects = activeProjectsList.length;
    
    console.log('📊 Active projects count (active/pending/on_hold):', activeProjects);
    
    // Also count by individual status for debugging
    const activeCount = allProjects.filter(p => p.status === 'active').length;
    const pendingCount = allProjects.filter(p => p.status === 'pending').length;
    const onHoldCount = allProjects.filter(p => p.status === 'on_hold').length;
    console.log('📊 Breakdown: active=' + activeCount + ', pending=' + pendingCount + ', on_hold=' + onHoldCount);
    console.log(`✅ Step 2 completed in ${Date.now() - startProjects}ms`);
    console.log('📋 Active Projects:', activeProjects);
    
    // Get total team members (admin, lead_manager, crm_manager - excluding clients and deleted users)
    console.log('🔍 Step 3: Counting team members...');
    const startTeam = Date.now();
    const teamMembers = await User.countDocuments({ 
      role: { $in: ['admin', 'lead_manager', 'crm_manager'] },
      status: { $ne: 'deleted' }
    });
    console.log(`✅ Step 3 completed in ${Date.now() - startTeam}ms`);
    console.log('👨‍💼 Team Members (admin, lead_manager, crm_manager):', teamMembers);
    
    // Calculate real monthly revenue from payments
    console.log('🔍 Step 4: Calculating monthly revenue...');
    const startRevenue = Date.now();
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    console.log('📅 Date range:', startOfMonth, 'to', endOfMonth);
    
    // First, get all payments to see what we have (status is encrypted, so we need to fetch all and filter)
    const allPayments = await Payment.find({}).lean();
    console.log('💰 Total payments in DB:', allPayments.length);
    console.log('💰 All payment details:', allPayments.map(p => ({ 
      status: p.status, 
      amount: p.amount,
      paymentDate: p.paymentDate,
      createdAt: p.createdAt
    })));
    
    // Filter for completed payments in the current month
    const monthlyPayments = allPayments.filter(p => {
      const paymentDate = p.paymentDate || p.createdAt;
      const isInDateRange = paymentDate >= startOfMonth && paymentDate <= endOfMonth;
      const isCompleted = p.status === 'completed';
      
      console.log('💰 Checking payment:', {
        status: p.status,
        isCompleted,
        paymentDate,
        isInDateRange,
        amount: p.amount
      });
      
      return isCompleted && isInDateRange;
    });
    
    console.log('💰 Monthly completed payments found:', monthlyPayments.length);
    console.log('💰 Monthly payments details:', monthlyPayments.map(p => ({ 
      amount: p.amount, 
      status: p.status,
      date: p.paymentDate || p.createdAt 
    })));
    
    // Calculate total revenue
    let monthlyRevenue = 0;
    for (const payment of monthlyPayments) {
      const amount = typeof payment.amount === 'number' ? payment.amount : parseFloat(payment.amount) || 0;
      monthlyRevenue += amount;
    }
    
    console.log(`✅ Step 4 completed in ${Date.now() - startRevenue}ms`);
    console.log('💰 Real Monthly Revenue:', monthlyRevenue);
    
    // Get additional statistics in parallel for better performance
    console.log('🔍 Step 5: Fetching additional statistics in parallel...');
    const startAdditional = Date.now();
    
    // For encrypted fields, we already have allProjects, so reuse it
    const totalProjects = allProjects.length;
    const completedProjects = allProjects.filter(p => p.status === 'completed').length;
    
    const [totalLeads, appointmentRequests, recentClients, recentAssessments] = await Promise.all([
      ContactForm.countDocuments(),
      AppointmentRequest.countDocuments(),
      Client.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }),
      ProfileAssessment.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      })
    ]);
    console.log(`✅ Step 5 completed in ${Date.now() - startAdditional}ms`);
    
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
    console.log('⏰ Total execution time:', Date.now() - Date.parse(new Date().toISOString().split('.')[0]), 'ms');
    
    res.json({
      success: true,
      data: stats
    });
    
    console.log('✅ Dashboard statistics sent successfully');
    console.log('📊 === DASHBOARD STATS REQUEST COMPLETED ===\n');
    
  } catch (error) {
    console.error('💥 ========== DASHBOARD STATS ERROR ==========');
    console.error('💥 Error Type:', error.name);
    console.error('💥 Error Message:', error.message);
    console.error('💥 Error Stack:', error.stack);
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
    console.log('📊 === FETCHING RECENT ACTIVITY ===');
    
    const activities = [];
    
    // Get recent client registrations
    console.log('📊 Fetching recent clients...');
    const recentClients = await Client.find()
      .sort({ createdAt: -1 })
      .limit(3);
    
    console.log(`📊 Found ${recentClients.length} recent clients`);
    recentClients.forEach(client => {
      const displayData = client.toDisplayJSON();
      console.log(`📊 Client: ${displayData.name || displayData.email} (${client._id}) - ${client.createdAt}`);
      activities.push({
        id: `client_${client._id}`,
        type: 'user_registration',
        icon: 'fas fa-user-plus',
        color: '#3b82f6',
        message: `New client registered: ${displayData.name || displayData.email}`,
        timestamp: client.createdAt
      });
    });
    
    // Get recent profile assessments
    console.log('📊 Fetching recent profile assessments...');
    const recentAssessments = await ProfileAssessment.find()
      .sort({ createdAt: -1 })
      .limit(3);
    
    console.log(`📊 Found ${recentAssessments.length} recent assessments`);
    recentAssessments.forEach(assessment => {
      const displayData = assessment.toDisplayJSON();
      console.log(`📊 Assessment: ${displayData.client_name} (${assessment._id}) - ${assessment.createdAt}`);
      activities.push({
        id: `assessment_${assessment._id}`,
        type: 'profile_assessment',
        icon: 'fas fa-chart-line',
        color: '#14b8a6',
        message: `Profile assessment completed for ${displayData.client_name}`,
        timestamp: assessment.createdAt
      });
    });
    
    // Get recent contact forms
    const recentContacts = await ContactForm.find()
      .sort({ createdAt: -1 })
      .limit(3);
    
    recentContacts.forEach(contact => {
      const displayData = contact.toDisplayJSON();
      activities.push({
        id: `contact_${contact._id}`,
        type: 'contact_form',
        icon: 'fas fa-envelope',
        color: '#8b5cf6',
        message: `New contact form submission from ${displayData.name}`,
        timestamp: contact.createdAt
      });
    });
    
    // Get recent payments
    const recentPayments = await Payment.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('client');
    
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
      .populate('client');
    
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
      .limit(2);
    
    recentAppointments.forEach(appointment => {
      const displayData = appointment.toDisplayJSON();
      activities.push({
        id: `appointment_${appointment._id}`,
        type: 'appointment_scheduled',
        icon: 'fas fa-calendar-check',
        color: '#84cc16',
        message: `Appointment ${appointment.status === 'scheduled' ? 'scheduled' : 'requested'} with ${displayData.name}`,
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
/**
 * Get CRM Manager Dashboard Statistics
 * @route GET /api/dashboard/crm-stats
 * @access Private (CRM Manager only)
 */
exports.getCrmStats = async (req, res) => {
  console.log('\n📊 === CRM DASHBOARD STATS REQUEST ===');
  console.log('📊 CRM Manager requesting dashboard statistics');
  
  try {
    const crmManagerId = req.user.user_id || req.user.id;
    console.log('📊 CRM Manager ID:', crmManagerId);
    console.log('📊 CRM Manager ID type:', typeof crmManagerId);
    console.log('📊 CRM Manager ID toString():', crmManagerId.toString());
    
    // Get projects assigned to this CRM manager using improved query
    const assignedProjects = await Project.countDocuments({ 
      $or: [
        { assigned_to: crmManagerId },
        { assigned_to: crmManagerId.toString() }
      ],
      status: { $ne: 'deleted' }
    });
    console.log('📋 Assigned Projects:', assignedProjects);
    
    // Get pending queries assigned to this CRM manager
    const Query = require('../models/Query');
    const pendingQueries = await Query.countDocuments({
      $or: [
        { assignedTo: crmManagerId },
        { assignedTo: crmManagerId.toString() }
      ],
      status: { $in: ['open', 'in_progress'] }
    });
    console.log('❓ Pending Queries:', pendingQueries);
    
    // Get upcoming meetings
    const AppointmentRequest = require('../models/AppointmentRequest');
    const upcomingMeetings = await AppointmentRequest.countDocuments({
      $or: [
        { assigned_to: crmManagerId },
        { assigned_to: crmManagerId.toString() }
      ],
      status: 'confirmed',
      scheduled_date: { $gte: new Date() }
    });
    console.log('📅 Upcoming Meetings:', upcomingMeetings);
    
    // Get pending payments for assigned projects
    const projects = await Project.find({ 
      $or: [
        { assigned_to: crmManagerId },
        { assigned_to: crmManagerId.toString() }
      ],
      status: { $ne: 'deleted' }
    }).lean();
    
    const pendingPayments = await Payment.countDocuments({
      project: { $in: projects.map(p => p._id) },
      status: { $in: ['pending', 'pending_verification'] }
    });
    console.log('💳 Pending Payments:', pendingPayments);
    
    // Get completed projects - fetch all and filter to ensure accuracy
    const allAssignedProjects = await Project.find({
      $or: [
        { assigned_to: crmManagerId },
        { assigned_to: crmManagerId.toString() }
      ],
      status: { $ne: 'deleted' }
    }).lean();
    
    console.log('📊 Total assigned projects found:', allAssignedProjects.length);
    console.log('📊 Project statuses:', allAssignedProjects.map(p => ({ id: p.project_id, status: p.status })));
    
    const completedProjects = allAssignedProjects.filter(p => p.status === 'completed').length;
    console.log('✅ Completed Projects:', completedProjects);
    
    const stats = {
      assignedProjects,
      pendingQueries,
      upcomingMeetings,
      pendingPayments,
      completedProjects
    };
    
    console.log('📊 CRM Manager statistics:', stats);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ Error in getCrmStats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CRM_STATS_ERROR',
        message: 'Failed to fetch CRM dashboard statistics'
      }
    });
  }
};

/**
 * Get CRM Manager Recent Activity
 * @route GET /api/dashboard/crm-activity
 * @access Private (CRM Manager only)
 */
exports.getCrmActivity = async (req, res) => {
  console.log('\n📊 === CRM ACTIVITY REQUEST ===');
  console.log('📊 CRM Manager requesting recent activity');
  
  try {
    const crmManagerId = req.user.user_id || req.user.id;
    console.log('📊 CRM Manager ID:', crmManagerId);
    
    const activities = [];
    
    // Get recent project updates
    const recentProjects = await Project.find({
      $or: [
        { assigned_to: crmManagerId },
        { assigned_to: crmManagerId.toString() }
      ],
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }).populate('client', 'name firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();
    
    recentProjects.forEach(project => {
      const clientName = project.client?.name || 
        `${project.client?.firstName || ''} ${project.client?.lastName || ''}`.trim() || 
        'Unknown Client';
      
      activities.push({
        id: `project-${project._id}`,
        message: `Project ${project.project_id} for ${clientName} was updated`,
        timestamp: project.updatedAt,
        icon: 'fas fa-project-diagram',
        color: '#3b82f6'
      });
    });
    
    // Get recent queries
    const Query = require('../models/Query');
    const recentQueries = await Query.find({
      $or: [
        { assignedTo: crmManagerId },
        { assignedTo: crmManagerId.toString() }
      ],
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).populate('client', 'name firstName lastName')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    recentQueries.forEach(query => {
      const clientName = query.client?.name || 
        `${query.client?.firstName || ''} ${query.client?.lastName || ''}`.trim() || 
        'Unknown Client';
      
      activities.push({
        id: `query-${query._id}`,
        message: `New query "${query.subject}" from ${clientName}`,
        timestamp: query.createdAt,
        icon: 'fas fa-question-circle',
        color: '#f59e0b'
      });
    });
    
    // Get recent appointments
    const recentAppointments = await AppointmentRequest.find({
      $or: [
        { assigned_to: crmManagerId },
        { assigned_to: crmManagerId.toString() }
      ],
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    recentAppointments.forEach(appointment => {
      activities.push({
        id: `appointment-${appointment._id}`,
        message: `New appointment scheduled with ${appointment.name}`,
        timestamp: appointment.createdAt,
        icon: 'fas fa-calendar-alt',
        color: '#8b5cf6'
      });
    });
    
    // Get recent payments
    const projectIds = await Project.find({ 
      $or: [
        { assigned_to: crmManagerId },
        { assigned_to: crmManagerId.toString() }
      ]
    }).distinct('_id');
    const recentPayments = await Payment.find({
      project: { $in: projectIds },
      status: 'completed', // Only show completed payments as "received"
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).populate('project', 'project_id')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    recentPayments.forEach(payment => {
      activities.push({
        id: `payment-${payment._id}`,
        message: `Payment of $${payment.amount} received for project ${payment.project?.project_id}`,
        timestamp: payment.createdAt,
        icon: 'fas fa-credit-card',
        color: '#10b981'
      });
    });
    
    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Limit to 10 most recent activities
    const limitedActivities = activities.slice(0, 10);
    
    console.log('📊 Recent activities found:', limitedActivities.length);
    
    res.json({
      success: true,
      data: limitedActivities
    });
    
  } catch (error) {
    console.error('❌ Error in getCrmActivity:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CRM_ACTIVITY_ERROR',
        message: 'Failed to fetch CRM recent activity'
      }
    });
  }
};