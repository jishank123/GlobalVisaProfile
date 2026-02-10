import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const ClientTimeline = ({ clientData, apiCall, onRefresh }) => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, activeFilter]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // Load activities from multiple sources with individual error handling
      const apiCalls = [
        apiCall('/projects?client=' + clientData?.email).catch(err => ({ error: err.message, data: [] })),
        apiCall('/payments?client=' + clientData?.email).catch(err => ({ error: err.message, data: [] })),
        apiCall('/appointments/client/' + clientData?.email).catch(err => ({ error: err.message, data: [] })),
        apiCall('/queries?client=' + clientData?.email).catch(err => ({ error: err.message, data: [] })),
        apiCall('/auth/me').catch(err => ({ error: err.message, data: null })) // Use correct profile endpoint
      ];

      const [projectsRes, paymentsRes, appointmentsRes, queriesRes, profileRes] = await Promise.all(apiCalls);

      // Log any errors but continue processing
      if (projectsRes.error) console.warn('Projects API error:', projectsRes.error);
      if (paymentsRes.error) console.warn('Payments API error:', paymentsRes.error);
      if (appointmentsRes.error) console.warn('Appointments API error:', appointmentsRes.error);
      if (queriesRes.error) console.warn('Queries API error:', queriesRes.error);
      if (profileRes.error) console.warn('Profile API error:', profileRes.error);

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
            description: `Payment of ${payment.amount} for ${payment.service_name || 'service'}`,
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

    setFilteredActivities(filtered);
  };

  const getActivityCounts = () => {
    return {
      total: activities.length,
      project: activities.filter(a => a.type === 'project').length,
      payment: activities.filter(a => a.type === 'payment').length,
      appointment: activities.filter(a => a.type === 'appointment').length,
      query: activities.filter(a => a.type === 'query').length
    };
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

  if (loading) {
    return (
      <div style={componentStyles.loading}>
        <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
        <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>
          Loading timeline...
        </p>
      </div>
    );
  }

  if (filteredActivities.length === 0) {
    return (
      <div>
        {/* Header with Refresh Button */}
        <div style={componentStyles.header}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={componentStyles.headerIcon}>
              <i className="fas fa-history fa-lg"></i>
            </div>
            <div>
              <h4 style={componentStyles.headerTitle}>Client Journey Timeline</h4>
              <p style={componentStyles.headerSubtitle}>Track your complete journey and activity history</p>
            </div>
          </div>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.primary
            }}
            onClick={() => {
              loadActivities();
              onRefresh?.();
            }}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>

        {/* Filter Navigation */}
        <div style={{ marginBottom: designSystem.spacing.lg }}>
          <div style={{ display: 'flex', gap: designSystem.spacing.xs, flexWrap: 'wrap' }}>
            <button 
              style={{
                ...componentStyles.primaryButton,
                background: activeFilter === 'all' ? designSystem.colors.primary : designSystem.colors.gray[100],
                color: activeFilter === 'all' ? 'white' : designSystem.colors.gray[600]
              }}
              onClick={() => setActiveFilter('all')}
              {...hoverEffects.button}
            >
              All Activities
            </button>
            <button 
              style={{
                ...componentStyles.primaryButton,
                background: activeFilter === 'project' ? '#8b5cf6' : designSystem.colors.gray[100],
                color: activeFilter === 'project' ? 'white' : designSystem.colors.gray[600]
              }}
              onClick={() => setActiveFilter('project')}
              {...hoverEffects.button}
            >
              Projects
            </button>
            <button 
              style={{
                ...componentStyles.primaryButton,
                background: activeFilter === 'payment' ? '#f59e0b' : designSystem.colors.gray[100],
                color: activeFilter === 'payment' ? 'white' : designSystem.colors.gray[600]
              }}
              onClick={() => setActiveFilter('payment')}
              {...hoverEffects.button}
            >
              Payments
            </button>
            <button 
              style={{
                ...componentStyles.primaryButton,
                background: activeFilter === 'appointment' ? '#6366f1' : designSystem.colors.gray[100],
                color: activeFilter === 'appointment' ? 'white' : designSystem.colors.gray[600]
              }}
              onClick={() => setActiveFilter('appointment')}
              {...hoverEffects.button}
            >
              Appointments
            </button>
            <button 
              style={{
                ...componentStyles.primaryButton,
                background: activeFilter === 'query' ? '#ef4444' : designSystem.colors.gray[100],
                color: activeFilter === 'query' ? 'white' : designSystem.colors.gray[600]
              }}
              onClick={() => setActiveFilter('query')}
              {...hoverEffects.button}
            >
              Queries
            </button>
          </div>
        </div>

        <div style={componentStyles.emptyState}>
          <i className="fas fa-history fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
          <h5 style={{ 
            fontSize: designSystem.typography.fontSize.lg,
            fontWeight: designSystem.typography.fontWeight.semibold,
            color: designSystem.colors.gray[700],
            marginBottom: designSystem.spacing.sm
          }}>
            No Timeline Data
          </h5>
          <p style={{ color: designSystem.colors.gray[600] }}>
            {activeFilter === 'all' 
              ? 'Your activity timeline will appear here as you interact with our services.'
              : `No ${activeFilter} activities found.`
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Refresh Button */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-history fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Client Journey Timeline</h4>
            <p style={componentStyles.headerSubtitle}>Track your complete journey and activity history</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.primary
          }}
          onClick={() => {
            loadActivities();
            onRefresh?.();
          }}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Filter Navigation */}
      <div style={{ marginBottom: designSystem.spacing.lg }}>
        <div style={{ display: 'flex', gap: designSystem.spacing.xs, flexWrap: 'wrap' }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeFilter === 'all' ? designSystem.colors.primary : designSystem.colors.gray[100],
              color: activeFilter === 'all' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveFilter('all')}
            {...hoverEffects.button}
          >
            All Activities
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeFilter === 'project' ? '#8b5cf6' : designSystem.colors.gray[100],
              color: activeFilter === 'project' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveFilter('project')}
            {...hoverEffects.button}
          >
            Projects
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeFilter === 'payment' ? '#f59e0b' : designSystem.colors.gray[100],
              color: activeFilter === 'payment' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveFilter('payment')}
            {...hoverEffects.button}
          >
            Payments
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeFilter === 'appointment' ? '#6366f1' : designSystem.colors.gray[100],
              color: activeFilter === 'appointment' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveFilter('appointment')}
            {...hoverEffects.button}
          >
            Appointments
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeFilter === 'query' ? '#ef4444' : designSystem.colors.gray[100],
              color: activeFilter === 'query' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveFilter('query')}
            {...hoverEffects.button}
          >
            Queries
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div style={{
        ...componentStyles.managementCard,
        margin: 0,
        padding: designSystem.spacing.lg
      }}>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5" style={{ background: designSystem.colors.gray[200] }}></div>
          
          <div className="space-y-8">
            {filteredActivities.map((item, index) => (
              <div key={item.id || index} className="relative flex items-start">
                {/* Timeline dot */}
                <div 
                  className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 shadow-lg" 
                  style={{ 
                    backgroundColor: item.color || '#6366f1',
                    borderColor: 'white'
                  }}
                >
                  <i className={`${item.icon} text-white text-lg`}></i>
                </div>
                
                {/* Timeline content */}
                <div 
                  className="flex-1 ml-6 rounded-lg p-6 border-l-4" 
                  style={{
                    background: designSystem.colors.light,
                    borderLeftColor: item.color || designSystem.colors.primary
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 style={{
                        fontSize: designSystem.typography.fontSize.lg,
                        fontWeight: designSystem.typography.fontWeight.semibold,
                        color: designSystem.colors.dark,
                        marginBottom: designSystem.spacing.xs
                      }}>
                        {item.title}
                      </h4>
                      <div style={{
                        fontSize: designSystem.typography.fontSize.sm,
                        color: designSystem.colors.gray[500],
                        marginTop: designSystem.spacing.xs
                      }}>
                        {formatDate(item.date)} • {getTimeAgo(item.date)}
                      </div>
                    </div>
                    {item.data?.status && (
                      <span style={{
                        ...componentStyles.badge,
                        background: 
                          item.data.status === 'completed' ? designSystem.colors.success :
                          item.data.status === 'pending' ? designSystem.colors.warning :
                          item.data.status === 'in_progress' ? designSystem.colors.primary :
                          designSystem.colors.gray[400],
                        color: 'white',
                        textTransform: 'uppercase',
                        fontSize: designSystem.typography.fontSize.xs,
                        fontWeight: designSystem.typography.fontWeight.medium
                      }}>
                        {item.data.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  
                  <p style={{
                    color: designSystem.colors.gray[700],
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Timeline footer */}
        <div className="mt-8 text-center">
          <div 
            className="inline-flex items-center px-4 py-2 rounded-full" 
            style={{
              background: designSystem.colors.gray[100],
              fontSize: designSystem.typography.fontSize.sm,
              color: designSystem.colors.gray[600]
            }}
          >
            <i className="fas fa-flag-checkered me-2"></i>
            This is where your journey began
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientTimeline;