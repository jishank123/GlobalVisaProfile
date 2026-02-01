import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const ClientTimeline = ({ clientData, apiCall, onRefresh }) => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, activeFilter, dateRange]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // Load activities from multiple sources
      const [projectsRes, paymentsRes, appointmentsRes, queriesRes, profileRes] = await Promise.all([
        apiCall('/projects?client=' + clientData?.email),
        apiCall('/payments?client=' + clientData?.email),
        apiCall('/appointments/client/' + clientData?.email),
        apiCall('/queries?client=' + clientData?.email),
        apiCall('/client-accounts/profile')
      ]);

      const allActivities = [];

      // Process projects
      if (projectsRes?.data) {
        projectsRes.data.forEach(project => {
          allActivities.push({
            id: `project-${project._id}`,
            type: 'project',
            title: 'Project Created',
            description: `Started project: ${project.service?.name || project.service_name}`,
            date: project.createdAt || project.created_at,
            icon: 'fas fa-project-diagram',
            color: '#8b5cf6',
            data: project
          });

          if (project.updated_at && project.updated_at !== project.createdAt) {
            allActivities.push({
              id: `project-update-${project._id}`,
              type: 'project',
              title: 'Project Updated',
              description: `Project status changed to: ${project.status}`,
              date: project.updated_at,
              icon: 'fas fa-edit',
              color: '#10b981',
              data: project
            });
          }
        });
      }

      // Process payments
      if (paymentsRes?.data) {
        paymentsRes.data.forEach(payment => {
          allActivities.push({
            id: `payment-${payment._id}`,
            type: 'payment',
            title: 'Payment Processed',
            description: `Payment of $${payment.amount} for ${payment.service_name || 'service'}`,
            date: payment.createdAt || payment.created_at,
            icon: 'fas fa-credit-card',
            color: '#f59e0b',
            data: payment
          });
        });
      }

      // Process appointments
      if (appointmentsRes?.data) {
        appointmentsRes.data.forEach(appointment => {
          allActivities.push({
            id: `appointment-${appointment._id}`,
            type: 'appointment',
            title: 'Appointment Scheduled',
            description: `${appointment.appointment_type} appointment scheduled`,
            date: appointment.createdAt || appointment.created_at,
            icon: 'fas fa-calendar-check',
            color: '#6366f1',
            data: appointment
          });
        });
      }

      // Process queries
      if (queriesRes?.data) {
        queriesRes.data.forEach(query => {
          allActivities.push({
            id: `query-${query._id}`,
            type: 'query',
            title: 'Query Submitted',
            description: query.subject || 'New query submitted',
            date: query.createdAt || query.created_at,
            icon: 'fas fa-question-circle',
            color: '#ef4444',
            data: query
          });
        });
      }

      // Add registration activity
      const createdDate = clientData?.createdAt || clientData?.created_at || new Date().toISOString();
      allActivities.push({
        id: 'registration',
        type: 'registration',
        title: 'Account Created',
        description: 'Welcome to Immigration Pro! Your immigration journey begins here.',
        date: createdDate,
        icon: 'fas fa-user-plus',
        color: '#10b981'
      });

      // Sort activities by date (newest first)
      allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setActivities(allActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];

    // Filter by type
    if (activeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === activeFilter);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        default:
          filterDate = null;
      }
      
      if (filterDate) {
        filtered = filtered.filter(activity => new Date(activity.date) >= filterDate);
      }
    }

    setFilteredActivities(filtered);
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimelineItemColor = (type) => {
    const colors = {
      'registration': 'bg-green-500',
      'profile': 'bg-blue-500',
      'project': 'bg-purple-500',
      'payment': 'bg-yellow-500',
      'appointment': 'bg-indigo-500',
      'query': 'bg-red-500',
      'access': 'bg-gray-500',
      'default': 'bg-blue-500'
    };
    return colors[type] || colors.default;
  };

  const getTimelineItemIcon = (type, customIcon) => {
    if (customIcon) return customIcon;
    
    const icons = {
      'registration': 'fas fa-user-plus',
      'profile': 'fas fa-id-card',
      'project': 'fas fa-briefcase',
      'payment': 'fas fa-credit-card',
      'appointment': 'fas fa-calendar-check',
      'query': 'fas fa-question-circle',
      'access': 'fas fa-user-circle',
      'default': 'fas fa-circle'
    };
    return icons[type] || icons.default;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading timeline...</p>
      </div>
    );
  }

  if (filteredActivities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <i className="fas fa-history text-4xl text-gray-400 mb-4"></i>
        <h5 className="text-lg font-semibold text-gray-700 mb-2">No Timeline Data</h5>
        <p className="text-gray-600">Your activity timeline will appear here as you interact with our services.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            <i className="fas fa-history mr-2"></i>Client Journey Timeline
          </h3>
          <button 
            onClick={loadActivities}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-sync-alt mr-1"></i>Refresh
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded text-sm ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('project')}
              className={`px-3 py-1 rounded text-sm ${activeFilter === 'project' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveFilter('payment')}
              className={`px-3 py-1 rounded text-sm ${activeFilter === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveFilter('appointment')}
              className={`px-3 py-1 rounded text-sm ${activeFilter === 'appointment' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Appointments
            </button>
          </div>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last 3 Months</option>
          </select>
        </div>
      </div>
      
      <div className="p-6">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-8">
            {filteredActivities.map((item, index) => (
              <div key={item.id || index} className="relative flex items-start">
                {/* Timeline dot */}
                <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 border-white shadow-lg`} style={{ backgroundColor: item.color || '#6366f1' }}>
                  <i className={`${item.icon} text-white text-lg`}></i>
                </div>
                
                {/* Timeline content */}
                <div className="flex-1 ml-6 bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDate(item.date)} • {getTimeAgo(item.date)}
                      </div>
                    </div>
                    {item.data?.status && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.data.status === 'completed' ? 'bg-green-100 text-green-800' :
                        item.data.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        item.data.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.data.status.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Timeline footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
            <i className="fas fa-flag-checkered mr-2"></i>
            This is where your journey began
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientTimeline;