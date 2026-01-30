import { useState, useEffect } from 'react';

const ClientOverview = ({ clientData, apiCall }) => {
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
    pendingPayments: 0,
    upcomingAppointments: 0,
    openQueries: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      // Load stats
      const statsResponse = await apiCall('/client/stats');
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Load recent activity
      const activityResponse = await apiCall('/client/activity?limit=5');
      if (activityResponse.success) {
        setRecentActivity(activityResponse.data);
      }
    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="client-overview">
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <i className="fas fa-project-diagram fa-2x mb-2"></i>
              <h3 className="mb-1">{stats.activeProjects}</h3>
              <p className="mb-0">Active Projects</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <i className="fas fa-check-circle fa-2x mb-2"></i>
              <h3 className="mb-1">{stats.completedProjects}</h3>
              <p className="mb-0">Completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <i className="fas fa-calendar-alt fa-2x mb-2"></i>
              <h3 className="mb-1">{stats.upcomingAppointments}</h3>
              <p className="mb-0">Appointments</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <i className="fas fa-question-circle fa-2x mb-2"></i>
              <h3 className="mb-1">{stats.openQueries}</h3>
              <p className="mb-0">Open Queries</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Welcome Section */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-star text-warning me-2"></i>
                Welcome to Your Immigration Journey
              </h5>
              <p className="text-muted mb-4">
                Thank you for choosing our services for your immigration needs. 
                This dashboard helps you track your progress and stay connected with our team.
              </p>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="border rounded p-3">
                    <h6 className="text-primary">
                      <i className="fas fa-chart-line me-2"></i>
                      Profile Assessment
                    </h6>
                    <p className="small text-muted mb-2">
                      Get a comprehensive evaluation of your immigration options.
                    </p>
                    <button className="btn btn-primary btn-sm">
                      Start Assessment
                    </button>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="border rounded p-3">
                    <h6 className="text-success">
                      <i className="fas fa-calendar me-2"></i>
                      Schedule Consultation
                    </h6>
                    <p className="small text-muted mb-2">
                      Book a consultation with our immigration experts.
                    </p>
                    <button className="btn btn-success btn-sm">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-history me-2"></i>
                Recent Activity
              </h6>
            </div>
            <div className="card-body">
              {recentActivity.length > 0 ? (
                <div className="timeline">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="timeline-item mb-3">
                      <div className="d-flex">
                        <div className="timeline-marker bg-primary rounded-circle me-3" 
                             style={{ width: '8px', height: '8px', marginTop: '6px' }}></div>
                        <div className="flex-grow-1">
                          <p className="mb-1 small">{activity.description}</p>
                          <small className="text-muted">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3">
                  <i className="fas fa-clock text-muted fa-2x mb-2"></i>
                  <p className="text-muted mb-0">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-bolt me-2"></i>
                Quick Actions
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <button className="btn btn-outline-primary w-100">
                    <i className="fas fa-upload me-2"></i>
                    Upload Document
                  </button>
                </div>
                <div className="col-md-3 mb-2">
                  <button className="btn btn-outline-success w-100">
                    <i className="fas fa-calendar-plus me-2"></i>
                    Book Appointment
                  </button>
                </div>
                <div className="col-md-3 mb-2">
                  <button className="btn btn-outline-info w-100">
                    <i className="fas fa-question me-2"></i>
                    Ask Question
                  </button>
                </div>
                <div className="col-md-3 mb-2">
                  <button className="btn btn-outline-warning w-100">
                    <i className="fas fa-credit-card me-2"></i>
                    Make Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOverview;