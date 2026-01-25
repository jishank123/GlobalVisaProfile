const ClientAccount = require('../models/ClientAccount');
const User = require('../models/User');
const ProfileAssessment = require('../models/ProfileAssessment');
const ContactForm = require('../models/ContactForm');
const AppointmentRequest = require('../models/AppointmentRequest');

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
    
    // Calculate monthly revenue (placeholder - you can implement based on your payment system)
    const monthlyRevenue = activeProjects * 2500; // Assuming $2500 per project
    console.log('💰 Estimated Monthly Revenue:', monthlyRevenue);
    
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