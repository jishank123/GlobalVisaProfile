import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeProjects: 0,
    monthlyRevenue: 0,
    teamMembers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    loadDashboardStats();
    loadRecentActivity();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getData();
      
      if (response.success) {
        setStats({
          totalClients: response.data.totalClients || 0,
          activeProjects: response.data.activeProjects || 0,
          monthlyRevenue: response.data.monthlyRevenue || 0,
          teamMembers: response.data.teamMembers || 0
        });
      } else {
        console.error('Failed to load dashboard stats:', response.error);
        // Keep zeros as fallback for failed API calls
        setStats({
          totalClients: 0,
          activeProjects: 0,
          monthlyRevenue: 0,
          teamMembers: 0
        });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Keep zeros as fallback for network errors
      setStats({
        totalClients: 0,
        activeProjects: 0,
        monthlyRevenue: 0,
        teamMembers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const response = await dashboardAPI.getRecentActivity();
      
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

  const StatCard = ({ icon, number, label, borderColor, iconColor }) => (
    <div 
      style={{
        ...componentStyles.contactsStatCard,
        borderColor: borderColor,
        cursor: 'pointer'
      }}
      {...hoverEffects.card}
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
      {/* Overview Stats */}
      <div style={componentStyles.statsContainer}>
        <StatCard 
          icon="fas fa-users" 
          number={stats.totalClients} 
          label="Total Clients" 
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />

        <StatCard 
          icon="fas fa-project-diagram" 
          number={stats.activeProjects} 
          label="Active Projects" 
          borderColor="#10b981"
          iconColor="#10b981"
        />

        <StatCard 
          icon="fas fa-dollar-sign" 
          number={`$${stats.monthlyRevenue.toLocaleString()}`} 
          label="Monthly Revenue" 
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />

        <StatCard 
          icon="fas fa-user-tie" 
          number={stats.teamMembers} 
          label="Team Members" 
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
      </div>

      {/* Recent Activity - Full Section */}
      <div style={{
        background: 'white',
        borderRadius: designSystem.borderRadius.card,
        boxShadow: designSystem.shadows.card,
        padding: designSystem.spacing.lg,
        marginTop: designSystem.spacing.lg
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
            maxHeight: '600px',
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
                  <div style={{
                    marginLeft: designSystem.spacing.md,
                    flexShrink: 0
                  }}>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        color: designSystem.colors.gray[400],
                        cursor: 'pointer',
                        padding: designSystem.spacing.xs,
                        borderRadius: '4px',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.color = designSystem.colors.primary}
                      onMouseLeave={(e) => e.target.style.color = designSystem.colors.gray[400]}
                      title="View details"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Activity Summary */}
        {recentActivity.length > 0 && (
          <div style={{
            marginTop: designSystem.spacing.md,
            padding: designSystem.spacing.md,
            background: designSystem.colors.gray[50],
            borderRadius: designSystem.borderRadius.button,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ 
              color: designSystem.colors.gray[600],
              fontSize: designSystem.typography.fontSize.sm
            }}>
              Showing {recentActivity.length} recent activities
            </span>
            <button
              style={{
                ...componentStyles.secondaryButton,
                padding: `${designSystem.spacing.xs} ${designSystem.spacing.md}`,
                fontSize: designSystem.typography.fontSize.sm,
                background: designSystem.colors.primary,
                color: 'white'
              }}
              {...hoverEffects.button}
            >
              View All Activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;