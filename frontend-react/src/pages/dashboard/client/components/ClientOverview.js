import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const ClientOverview = ({ clientData, apiCall, onRefresh }) => {
  const [stats, setStats] = useState({
    projects: { total: 0, active: 0, completed: 0, pending: 0 },
    payments: { total: 0, paid: 0, pending: 0, amount: 0 },
    appointments: { total: 0, upcoming: 0, completed: 0 },
    queries: { total: 0, open: 0, resolved: 0 }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      // Load all overview data in parallel
      const [projectsRes, paymentsRes, appointmentsRes, queriesRes] = await Promise.all([
        apiCall('/projects?client=' + clientData?.email),
        apiCall('/payments?client=' + clientData?.email),
        apiCall('/appointments/client/' + clientData?.email),
        apiCall('/queries?client=' + clientData?.email)
      ]);

      // Process projects data
      const projects = projectsRes?.data || [];
      const projectStats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'in_progress' || p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        pending: projects.filter(p => p.status === 'pending' || p.status === 'planning').length
      };

      // Process payments data
      const payments = paymentsRes?.data || [];
      const paymentStats = {
        total: payments.length,
        paid: payments.filter(p => p.status === 'completed' || p.status === 'verified').length,
        pending: payments.filter(p => p.status === 'pending').length,
        amount: payments.reduce((sum, p) => sum + (p.amount || 0), 0)
      };

      // Process appointments data
      const appointments = appointmentsRes?.data || [];
      const appointmentStats = {
        total: appointments.length,
        upcoming: appointments.filter(a => new Date(a.scheduled_date) > new Date() && a.status !== 'completed').length,
        completed: appointments.filter(a => a.status === 'completed').length
      };

      // Process queries data
      const queries = queriesRes?.data || [];
      const queryStats = {
        total: queries.length,
        open: queries.filter(q => q.status === 'open' || q.status === 'pending').length,
        resolved: queries.filter(q => q.status === 'resolved' || q.status === 'closed').length
      };

      setStats({
        projects: projectStats,
        payments: paymentStats,
        appointments: appointmentStats,
        queries: queryStats
      });

      // Create recent activity from all data
      const activities = [
        ...projects.slice(0, 3).map(p => ({
          type: 'project',
          title: `Project: ${p.service?.name || p.service_name}`,
          description: `Status: ${p.status}`,
          date: p.updated_at || p.createdAt,
          icon: 'fas fa-project-diagram',
          color: '#667eea'
        })),
        ...payments.slice(0, 2).map(p => ({
          type: 'payment',
          title: `Payment: $${p.amount}`,
          description: `Status: ${p.status}`,
          date: p.updated_at || p.createdAt,
          icon: 'fas fa-credit-card',
          color: designSystem.colors.success
        })),
        ...appointments.slice(0, 2).map(a => ({
          type: 'appointment',
          title: 'Appointment Scheduled',
          description: `${new Date(a.scheduled_date).toLocaleDateString()}`,
          date: a.createdAt,
          icon: 'fas fa-calendar-alt',
          color: designSystem.colors.info
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      setRecentActivity(activities);

    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color, onClick }) => (
    <div 
      style={{
        ...componentStyles.contactsStatCard,
        borderColor: color,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
      {...(onClick ? hoverEffects.card : {})}
      onClick={onClick}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '60px',
        height: '60px',
        background: `${color}20`,
        borderRadius: '50%',
        transform: 'translate(20px, -20px)'
      }} />
      <i className={`${icon} fa-2x`} style={{ 
        color: color,
        marginBottom: designSystem.spacing.sm,
        position: 'relative',
        zIndex: 1
      }}></i>
      <h3 style={{ 
        color: color,
        fontWeight: designSystem.typography.fontWeight.bold,
        marginBottom: '4px',
        fontSize: designSystem.typography.fontSize['2xl']
      }}>
        {value}
      </h3>
      <div style={{ 
        color: designSystem.colors.dark,
        fontWeight: designSystem.typography.fontWeight.medium,
        marginBottom: '4px',
        fontSize: designSystem.typography.fontSize.sm
      }}>
        {title}
      </div>
      {subtitle && (
        <small style={{ color: designSystem.colors.gray[500] }}>
          {subtitle}
        </small>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={componentStyles.loading}>
        <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
        <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>
          Loading dashboard overview...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Refresh Button */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-tachometer-alt fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Dashboard Overview</h4>
            <p style={componentStyles.headerSubtitle}>Welcome back! Here's your account summary</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={() => {
            loadOverviewData();
            onRefresh?.();
          }}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Overview Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-project-diagram"
          title="Active Projects"
          value={stats.projects.active}
          subtitle={`${stats.projects.total} total projects`}
          color="#8b5cf6"
          onClick={() => window.location.hash = '#projects'}
        />
        <StatCard
          icon="fas fa-credit-card"
          title="Total Payments"
          value={`$${stats.payments.amount.toLocaleString()}`}
          subtitle={`${stats.payments.paid} completed`}
          color="#10b981"
          onClick={() => window.location.hash = '#payments'}
        />
        <StatCard
          icon="fas fa-calendar-alt"
          title="Upcoming Appointments"
          value={stats.appointments.upcoming}
          subtitle={`${stats.appointments.total} total`}
          color="#3b82f6"
          onClick={() => window.location.hash = '#appointments'}
        />
        <StatCard
          icon="fas fa-question-circle"
          title="Open Queries"
          value={stats.queries.open}
          subtitle={`${stats.queries.resolved} resolved`}
          color="#f59e0b"
          onClick={() => window.location.hash = '#queries'}
        />
      </div>

      {/* Recent Activity */}
      <div>
        <h5 style={{
          color: designSystem.colors.dark,
          fontWeight: designSystem.typography.fontWeight.semibold,
          marginBottom: designSystem.spacing.md
        }}>
          Recent Activity
        </h5>
        
        {recentActivity.length === 0 ? (
          <div style={componentStyles.emptyState}>
            <i className="fas fa-history fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
            <p style={{ color: designSystem.colors.gray[500] }}>No recent activity</p>
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: designSystem.borderRadius.card,
            border: `1px solid ${designSystem.colors.gray[200]}`,
            overflow: 'hidden'
          }}>
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                style={{
                  padding: designSystem.spacing.lg,
                  borderBottom: index < recentActivity.length - 1 ? `1px solid ${designSystem.colors.gray[100]}` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = designSystem.colors.gray[50]}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: `${activity.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: designSystem.spacing.md
                }}>
                  <i className={activity.icon} style={{ color: activity.color }}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: designSystem.typography.fontWeight.medium,
                    color: designSystem.colors.dark,
                    marginBottom: '2px'
                  }}>
                    {activity.title}
                  </div>
                  <div style={{
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[600]
                  }}>
                    {activity.description}
                  </div>
                </div>
                <div style={{
                  fontSize: designSystem.typography.fontSize.xs,
                  color: designSystem.colors.gray[500]
                }}>
                  {new Date(activity.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOverview;