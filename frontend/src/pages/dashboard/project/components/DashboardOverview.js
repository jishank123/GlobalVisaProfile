import { useState, useEffect } from 'react';
import { projectsAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
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
      console.log('🔄 Loading PM dashboard stats...');
      
      // Fetch projects
      const projectsResponse = await projectsAPI.getMyPMProjects();
      console.log('📊 Projects response:', projectsResponse);
      console.log('📊 Projects data:', projectsResponse.data);
      console.log('📊 Number of projects:', projectsResponse.data?.length || 0);
      
      if (!projectsResponse.success || !projectsResponse.data || projectsResponse.data.length === 0) {
        console.warn('⚠️ No projects assigned to you as Project Manager!');
        console.warn('⚠️ Ask a CRM Manager to assign projects to you first.');
        setStats({
          totalProjects: 0,
          activeTasks: 0,
          completedTasks: 0,
          teamMembers: 0
        });
        setLoading(false);
        return;
      }
      
      // Fetch tasks
      const tasksResponse = await projectsAPI.getMyTasks();
      console.log('📊 Tasks response:', tasksResponse);
      console.log('📊 Tasks data:', tasksResponse.data);
      console.log('📊 Number of tasks:', tasksResponse.data?.length || 0);
      
      if (projectsResponse.success && tasksResponse.success) {
        const projects = projectsResponse.data || [];
        const tasks = tasksResponse.data || [];
        
        console.log('📊 Processing stats...');
        console.log('   - Projects:', projects.length);
        console.log('   - Tasks:', tasks.length);
        
        // Calculate stats
        const activeTasks = tasks.filter(t => t.status === 'in_progress').length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        
        console.log('   - Active tasks:', activeTasks);
        console.log('   - Completed tasks:', completedTasks);
        
        // Get unique employees from tasks
        const employeeIds = new Set();
        tasks.forEach(task => {
          if (task.assigned_to) {
            const empId = task.assigned_to._id || task.assigned_to;
            if (empId) {
              employeeIds.add(empId.toString());
              console.log('   - Found employee:', empId.toString());
            }
          }
        });
        
        console.log('   - Unique employees:', employeeIds.size);
        
        const statsData = {
          totalProjects: projects.length,
          activeTasks: activeTasks,
          completedTasks: completedTasks,
          teamMembers: employeeIds.size
        };
        
        console.log('✅ Stats calculated:', statsData);
        setStats(statsData);
      } else {
        console.error('❌ Failed to load stats');
        setStats({
          totalProjects: 0,
          activeTasks: 0,
          completedTasks: 0,
          teamMembers: 0
        });
      }
    } catch (error) {
      console.error('❌ Error loading dashboard stats:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      setStats({
        totalProjects: 0,
        activeTasks: 0,
        completedTasks: 0,
        teamMembers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      setActivityLoading(true);
      console.log('🔄 Loading recent activity...');
      
      // Fetch recent tasks as activity
      const tasksResponse = await projectsAPI.getMyTasks();
      
      if (tasksResponse.success) {
        const tasks = tasksResponse.data || [];
        
        // Convert tasks to activity items (show last 10)
        const activities = tasks
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
          .slice(0, 10)
          .map(task => ({
            id: task._id,
            message: `Task "${task.title}" ${task.status === 'completed' ? 'completed' : task.status === 'in_progress' ? 'in progress' : 'created'}`,
            timestamp: task.updatedAt || task.createdAt,
            icon: task.status === 'completed' ? 'fas fa-check-circle' : 
                  task.status === 'in_progress' ? 'fas fa-spinner' : 'fas fa-plus-circle',
            color: task.status === 'completed' ? '#10b981' : 
                   task.status === 'in_progress' ? '#3b82f6' : '#f59e0b'
          }));
        
        console.log('✅ Recent activity loaded:', activities.length);
        setRecentActivity(activities);
      } else {
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('❌ Error loading recent activity:', error);
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
          icon="fas fa-project-diagram" 
          number={stats.totalProjects} 
          label="Total Projects" 
          borderColor="#0dcaf0"
          iconColor="#0dcaf0"
        />

        <StatCard 
          icon="fas fa-tasks" 
          number={stats.activeTasks} 
          label="Active Tasks" 
          borderColor="#10b981"
          iconColor="#10b981"
        />

        <StatCard 
          icon="fas fa-check-circle" 
          number={stats.completedTasks} 
          label="Completed Tasks" 
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />

        <StatCard 
          icon="fas fa-users" 
          number={stats.teamMembers} 
          label="Team Members" 
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
            <i className="fas fa-clock me-2" style={{ color: '#0dcaf0' }}></i>
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
            <i className="fas fa-spinner fa-spin fa-2x" style={{ color: '#0dcaf0' }}></i>
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
                    background: activity.color || '#0dcaf0',
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
                      onMouseEnter={(e) => e.target.style.color = '#0dcaf0'}
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
