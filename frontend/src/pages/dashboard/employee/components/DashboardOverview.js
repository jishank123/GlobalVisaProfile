import { useState, useEffect } from 'react';
import { projectsAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    myTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0
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
      console.log('🔄 Loading employee dashboard stats...');
      
      // Fetch tasks assigned to this employee
      const response = await projectsAPI.getMyTasks();
      console.log('📊 Tasks response:', response);
      
      if (response.success && response.data) {
        const tasks = response.data;
        
        // Calculate stats from tasks
        const myTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
        
        console.log('📊 Calculated stats:', { myTasks, completedTasks, pendingTasks, inProgressTasks });
        
        setStats({
          myTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks
        });
      } else {
        console.log('⚠️ No tasks data received');
        setStats({
          myTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          inProgressTasks: 0
        });
      }
    } catch (error) {
      console.error('❌ Error loading dashboard stats:', error);
      setStats({
        myTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      setActivityLoading(true);
      
      // Fetch recent tasks for activity feed
      const response = await projectsAPI.getMyTasks();
      
      if (response.success && response.data) {
        // Convert recent tasks to activity items
        const activities = response.data
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 10)
          .map(task => ({
            id: task._id,
            message: `Task "${task.title}" - ${task.status.replace('_', ' ')}`,
            timestamp: task.updatedAt,
            icon: task.status === 'completed' ? 'fas fa-check-circle' : 
                  task.status === 'in_progress' ? 'fas fa-play-circle' : 'fas fa-clock',
            color: task.status === 'completed' ? '#10b981' : 
                   task.status === 'in_progress' ? '#3b82f6' : '#f59e0b'
          }));
        
        setRecentActivity(activities);
      } else {
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
          icon="fas fa-tasks" 
          number={stats.myTasks} 
          label="My Tasks" 
          borderColor="#20c997"
          iconColor="#20c997"
        />

        <StatCard 
          icon="fas fa-check-circle" 
          number={stats.completedTasks} 
          label="Completed Tasks" 
          borderColor="#10b981"
          iconColor="#10b981"
        />

        <StatCard 
          icon="fas fa-play-circle" 
          number={stats.inProgressTasks} 
          label="In Progress" 
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />

        <StatCard 
          icon="fas fa-hourglass-half" 
          number={stats.pendingTasks} 
          label="Pending Tasks" 
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
      </div>

      {/* Recent Activity */}
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
            <i className="fas fa-clock me-2" style={{ color: '#20c997' }}></i>
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
            <i className="fas fa-spinner fa-spin fa-2x" style={{ color: '#20c997' }}></i>
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
                    background: activity.color || '#20c997',
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
                      onMouseEnter={(e) => e.target.style.color = '#20c997'}
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

        {recentActivity.length > 0 && (
          <div style={{
            marginTop: designSystem.spacing.md,
            padding: designSystem.spacing.md,
            background: designSystem.colors.gray[50],
            borderRadius: designSystem.borderRadius.button,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <span style={{ 
              color: designSystem.colors.gray[600],
              fontSize: designSystem.typography.fontSize.sm
            }}>
              Showing {recentActivity.length} recent activities
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
