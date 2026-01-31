import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../../../services/api';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeProjects: 0,
    monthlyRevenue: 0,
    teamMembers: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardStats();
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
        throw new Error(response.error?.message || 'Failed to load dashboard stats');
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Fallback to default values on error
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

  const StatCard = ({ icon, number, label, color = 'primary' }) => (
    <div className="col-md-3">
      <div 
        className="stat-card"
        style={{
          background: 'white',
          borderRadius: '10px',
          padding: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #1e3a8a'
        }}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div 
              className="stat-number"
              style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1e3a8a'
              }}
            >
              {loading ? '...' : number}
            </div>
            <div className="text-muted">{label}</div>
          </div>
          <i className={`${icon} fa-2x text-${color}`}></i>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Overview Stats */}
      <div className="row mb-4">
        <StatCard 
          icon="fas fa-users" 
          number={stats.totalClients} 
          label="Total Clients" 
          color="primary" 
        />
        <StatCard 
          icon="fas fa-project-diagram" 
          number={stats.activeProjects} 
          label="Active Projects" 
          color="success" 
        />
        <StatCard 
          icon="fas fa-dollar-sign" 
          number={`$${(stats.monthlyRevenue / 1000).toFixed(0)}K`} 
          label="Monthly Revenue" 
          color="warning" 
        />
        <StatCard 
          icon="fas fa-user-friends" 
          number={stats.teamMembers} 
          label="Team Members" 
          color="info" 
        />
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div 
            className="management-card"
            style={{
              background: 'white',
              borderRadius: '10px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}
          >
            <h5 className="mb-3">
              <i className="fas fa-bolt text-warning me-2"></i>
              Quick Actions
            </h5>
            <div className="row">
              <div className="col-md-6 mb-2">
                <button className="btn btn-primary w-100">
                  <i className="fas fa-user-plus me-2"></i>
                  Add New User
                </button>
              </div>
              <div className="col-md-6 mb-2">
                <button className="btn btn-success w-100">
                  <i className="fas fa-briefcase me-2"></i>
                  Add Service
                </button>
              </div>
              <div className="col-md-6 mb-2">
                <button className="btn btn-info w-100">
                  <i className="fas fa-project-diagram me-2"></i>
                  New Project
                </button>
              </div>
              <div className="col-md-6 mb-2">
                <button className="btn btn-warning w-100">
                  <i className="fas fa-chart-bar me-2"></i>
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div 
            className="management-card"
            style={{
              background: 'white',
              borderRadius: '10px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}
          >
            <h5 className="mb-3">
              <i className="fas fa-clock text-primary me-2"></i>
              Recent Activity
            </h5>
            <div className="space-y-3">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-blue-100 rounded-circle p-2 me-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-user-plus text-blue-600"></i>
                </div>
                <div>
                  <p className="mb-0 text-sm">New user registered: John Smith</p>
                  <p className="text-muted text-xs mb-0">2 hours ago</p>
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-green-100 rounded-circle p-2 me-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-project-diagram text-green-600"></i>
                </div>
                <div>
                  <p className="mb-0 text-sm">Project completed: EB-1A Application</p>
                  <p className="text-muted text-xs mb-0">4 hours ago</p>
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-purple-100 rounded-circle p-2 me-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-dollar-sign text-purple-600"></i>
                </div>
                <div>
                  <p className="mb-0 text-sm">Payment received: $5,000</p>
                  <p className="text-muted text-xs mb-0">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="row">
        <div className="col-12">
          <div 
            className="management-card"
            style={{
              background: 'white',
              borderRadius: '10px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}
          >
            <h5 className="mb-3">
              <i className="fas fa-server text-success me-2"></i>
              System Status
            </h5>
            <div className="row">
              <div className="col-md-3 text-center">
                <div className="border rounded p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Database</span>
                    <span className="badge bg-success">Online</span>
                  </div>
                </div>
              </div>
              <div className="col-md-3 text-center">
                <div className="border rounded p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>API Server</span>
                    <span className="badge bg-success">Running</span>
                  </div>
                </div>
              </div>
              <div className="col-md-3 text-center">
                <div className="border rounded p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Email Service</span>
                    <span className="badge bg-success">Active</span>
                  </div>
                </div>
              </div>
              <div className="col-md-3 text-center">
                <div className="border rounded p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Backup Status</span>
                    <span className="badge bg-warning">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;