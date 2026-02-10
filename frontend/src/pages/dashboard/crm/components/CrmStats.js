import { useState, useEffect } from 'react';
import { projectsAPI, dashboardAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const CrmStats = () => {
  const [stats, setStats] = useState({
    assignedProjects: 0,
    upcomingMeetings: 0,
    pendingPayments: 0,
    completedProjects: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    loadCrmStats();
    loadRecentActivity();
  }, []);

  const loadCrmStats = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading CRM manager stats...');
      
      // Get CRM manager specific stats
      const response = await dashboardAPI.getCrmStats();
      
      console.log('📊 CRM Stats API Response:', response);
      
      if (response.success) {
        console.log('✅ CRM stats loaded successfully:', response.data);
        setStats({
          assignedProjects: response.data.assignedProjects || 0,
          upcomingMeetings: response.data.upcomingMeetings || 0,
          pendingPayments: response.data.pendingPayments || 0,
          completedProjects: response.data.completedProjects || 0
        });
      } else {
        console.error('❌ Failed to load CRM stats:', response.error);
        // Keep zeros as fallback
      }
    } catch (error) {
      console.error('❌ Error loading CRM stats:', error);
      // Keep zeros as fallback
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const response = await dashboardAPI.getCrmActivity();
      
      if (response.success) {
        setRecentActivity(response.data || []);
      } else {
        console.error('Failed to load recent activity:', response.error);
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Error loading recent activity:', error);
      setRecentActivity([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const StatCard = ({ icon, number, label, borderColor, iconColor, onClick }) => (
    <div 
      style={{
        ...componentStyles.contactsStatCard,
        borderColor: borderColor,
        cursor: 'pointer'
      }}
      {...hoverEffects.card}
      onClick={onClick}
    >
      <i className={`${icon} fa-2x mb-2`} style={{ color: iconColor }}></i>
      <h4 style={{ 
        color: iconColor,
        fontWeight: designSystem.typography.fontWeight.bold,
        marginBottom: '4px'
      }}>
        {loading ? '...' : number}
      </h4>
      <small style={{ color: designSystem.colors.gray[500] }}>
        {label}
      </small>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-users-cog fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>CRM Manager Dashboard</h4>
            <p style={componentStyles.headerSubtitle}>Manage your assigned projects, tasks, and client relationships</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={() => {
            loadCrmStats();
            loadRecentActivity();
          }}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div style={componentStyles.statsContainer}>
        <StatCard 
          icon="fas fa-project-diagram" 
          number={stats.assignedProjects} 
          label="Assigned Projects" 
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />

        <StatCard 
          icon="fas fa-calendar-alt" 
          number={stats.upcomingMeetings} 
          label="Upcoming Meetings" 
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />

        <StatCard 
          icon="fas fa-credit-card" 
          number={stats.pendingPayments} 
          label="Pending Payments" 
          borderColor="#ef4444"
          iconColor="#ef4444"
        />

        <StatCard 
          icon="fas fa-check-circle" 
          number={stats.completedProjects} 
          label="Completed Projects" 
          borderColor="#06b6d4"
          iconColor="#06b6d4"
        />
      </div>

      {/* Recent Activity */}
      <div style={{
        background: 'white',
        borderRadius: designSystem.borderRadius.card,
        boxShadow: designSystem.shadows.card,
        padding: designSystem.spacing.lg
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: designSystem.spacing.lg
        }}>
          <h5 style={{ 
            margin: 0,
            color: designSystem.colors.dark,
            fontWeight: designSystem.typography.fontWeight.semibold
          }}>
            <i className="fas fa-clock me-2" style={{ color: '#3b82f6' }}></i>
            Recent Activity
          </h5>
          <button 
            onClick={loadRecentActivity}
            style={{
              ...componentStyles.secondaryButton,
              padding: `${designSystem.spacing.xs} ${designSystem.spacing.md}`,
              fontSize: designSystem.typography.fontSize.sm
            }}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-1"></i>
            Refresh
          </button>
        </div>

        {activityLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: designSystem.spacing.xl
          }}>
            <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
            <span style={{ marginLeft: designSystem.spacing.md }}>Loading recent activity...</span>
          </div>
        ) : (
          <div style={{ 
            border: `1px solid ${designSystem.colors.gray[200]}`,
            borderRadius: designSystem.borderRadius.button,
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {recentActivity.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: designSystem.spacing.xl,
                color: designSystem.colors.gray[500]
              }}>
                <i className="fas fa-clock fa-3x" style={{ marginBottom: designSystem.spacing.md }}></i>
                <p>No recent activity found</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div 
                  key={activity.id || index}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: designSystem.spacing.md,
                    borderBottom: index < recentActivity.length - 1 ? `1px solid ${designSystem.colors.gray[100]}` : 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                  {...hoverEffects.tableRow}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: activity.color || '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: designSystem.spacing.md,
                    flexShrink: 0
                  }}>
                    <i className={activity.icon || 'fas fa-info'} style={{ color: 'white', fontSize: '16px' }}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      margin: 0, 
                      fontWeight: designSystem.typography.fontWeight.medium,
                      color: designSystem.colors.dark,
                      lineHeight: '1.4'
                    }}>
                      {activity.message}
                    </p>
                    <small style={{ 
                      color: designSystem.colors.gray[500],
                      fontSize: designSystem.typography.fontSize.sm
                    }}>
                      {formatTimeAgo(activity.timestamp)}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrmStats;