import { useState, useEffect } from 'react';
import { analyticsAPI, dashboardAPI } from '../../../../services/api';

const EnhancedAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    revenue: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0
    },
    performance: {
      conversionRate: 0,
      avgProjectDuration: 0,
      clientSatisfaction: 0,
      teamEfficiency: 0
    },
    trends: {
      leadGeneration: [],
      projectCompletion: [],
      revenueGrowth: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load revenue data
      const revenueResponse = await analyticsAPI.getRevenue({ period: selectedPeriod });
      if (revenueResponse.success) {
        setAnalytics(prev => ({
          ...prev,
          revenue: revenueResponse.data
        }));
      }

      // Load performance metrics
      const performanceResponse = await analyticsAPI.getPerformance();
      if (performanceResponse.success) {
        setAnalytics(prev => ({
          ...prev,
          performance: performanceResponse.data
        }));
      }

      // Load trends data
      const trendsResponse = await analyticsAPI.getTrends({ period: selectedPeriod });
      if (trendsResponse.success) {
        setAnalytics(prev => ({
          ...prev,
          trends: trendsResponse.data
        }));
        
        // Prepare chart data
        setChartData({
          labels: trendsResponse.data.revenueGrowth?.map(item => item.period) || [],
          datasets: [
            {
              label: 'Revenue',
              data: trendsResponse.data.revenueGrowth?.map(item => item.amount) || [],
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const MetricCard = ({ title, value, icon, color, trend, trendValue }) => (
    <div className="col-md-3 mb-4">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="card-title text-muted">{title}</h6>
              <h3 className={`text-${color}`}>{value}</h3>
              {trend && (
                <small className={`text-${trend === 'up' ? 'success' : 'danger'}`}>
                  <i className={`fas fa-arrow-${trend}`}></i> {trendValue}
                </small>
              )}
            </div>
            <div className={`text-${color}`}>
              <i className={`${icon} fa-2x`}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-chart-line text-primary me-2"></i>
          Enhanced Analytics
        </h2>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button className="btn btn-outline-primary">
            <i className="fas fa-download me-2"></i>
            Export Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* Revenue Metrics */}
          <div className="row mb-4">
            <div className="col-12">
              <h4 className="mb-3">Revenue Analytics</h4>
            </div>
            <MetricCard
              title="Daily Revenue"
              value={formatCurrency(analytics.revenue.daily)}
              icon="fas fa-calendar-day"
              color="primary"
              trend="up"
              trendValue="12.5%"
            />
            <MetricCard
              title="Weekly Revenue"
              value={formatCurrency(analytics.revenue.weekly)}
              icon="fas fa-calendar-week"
              color="success"
              trend="up"
              trendValue="8.3%"
            />
            <MetricCard
              title="Monthly Revenue"
              value={formatCurrency(analytics.revenue.monthly)}
              icon="fas fa-calendar-alt"
              color="info"
              trend="up"
              trendValue="15.7%"
            />
            <MetricCard
              title="Yearly Revenue"
              value={formatCurrency(analytics.revenue.yearly)}
              icon="fas fa-calendar"
              color="warning"
              trend="up"
              trendValue="22.1%"
            />
          </div>

          {/* Performance Metrics */}
          <div className="row mb-4">
            <div className="col-12">
              <h4 className="mb-3">Performance Metrics</h4>
            </div>
            <MetricCard
              title="Conversion Rate"
              value={formatPercentage(analytics.performance.conversionRate)}
              icon="fas fa-chart-pie"
              color="success"
              trend="up"
              trendValue="3.2%"
            />
            <MetricCard
              title="Avg Project Duration"
              value={`${analytics.performance.avgProjectDuration || 0} days`}
              icon="fas fa-clock"
              color="info"
              trend="down"
              trendValue="2.1 days"
            />
            <MetricCard
              title="Client Satisfaction"
              value={formatPercentage(analytics.performance.clientSatisfaction)}
              icon="fas fa-smile"
              color="warning"
              trend="up"
              trendValue="4.5%"
            />
            <MetricCard
              title="Team Efficiency"
              value={formatPercentage(analytics.performance.teamEfficiency)}
              icon="fas fa-users"
              color="primary"
              trend="up"
              trendValue="6.8%"
            />
          </div>

          {/* Charts Section */}
          <div className="row mb-4">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Revenue Trend</h5>
                </div>
                <div className="card-body">
                  <div className="chart-container" style={{ height: '300px' }}>
                    {/* Placeholder for chart - you can integrate Chart.js or similar */}
                    <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded">
                      <div className="text-center">
                        <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                        <p className="text-muted">Revenue trend chart will be displayed here</p>
                        <small className="text-muted">Integrate with Chart.js for interactive charts</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Lead Sources</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Website</span>
                      <span>45%</span>
                    </div>
                    <div className="progress mb-2">
                      <div className="progress-bar bg-primary" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Referrals</span>
                      <span>30%</span>
                    </div>
                    <div className="progress mb-2">
                      <div className="progress-bar bg-success" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Social Media</span>
                      <span>15%</span>
                    </div>
                    <div className="progress mb-2">
                      <div className="progress-bar bg-info" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Direct</span>
                      <span>10%</span>
                    </div>
                    <div className="progress mb-2">
                      <div className="progress-bar bg-warning" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analytics Tables */}
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Top Performing Services</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Revenue</th>
                          <th>Projects</th>
                          <th>Avg. Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>EB-1A Petition</td>
                          <td>{formatCurrency(125000)}</td>
                          <td>25</td>
                          <td>{formatCurrency(5000)}</td>
                        </tr>
                        <tr>
                          <td>EB-2 NIW</td>
                          <td>{formatCurrency(90000)}</td>
                          <td>30</td>
                          <td>{formatCurrency(3000)}</td>
                        </tr>
                        <tr>
                          <td>O-1 Visa</td>
                          <td>{formatCurrency(75000)}</td>
                          <td>50</td>
                          <td>{formatCurrency(1500)}</td>
                        </tr>
                        <tr>
                          <td>Profile Building</td>
                          <td>{formatCurrency(45000)}</td>
                          <td>90</td>
                          <td>{formatCurrency(500)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Team Performance</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Team Member</th>
                          <th>Projects</th>
                          <th>Completion Rate</th>
                          <th>Avg. Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>John Smith</td>
                          <td>15</td>
                          <td>95%</td>
                          <td>4.8/5</td>
                        </tr>
                        <tr>
                          <td>Sarah Johnson</td>
                          <td>12</td>
                          <td>92%</td>
                          <td>4.7/5</td>
                        </tr>
                        <tr>
                          <td>Mike Davis</td>
                          <td>18</td>
                          <td>88%</td>
                          <td>4.6/5</td>
                        </tr>
                        <tr>
                          <td>Lisa Wilson</td>
                          <td>10</td>
                          <td>98%</td>
                          <td>4.9/5</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="fas fa-lightbulb text-warning me-2"></i>
                    Key Insights & Recommendations
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="alert alert-success">
                        <h6><i className="fas fa-arrow-up me-2"></i>Revenue Growth</h6>
                        <p className="mb-0">Monthly revenue increased by 15.7% compared to last month. EB-1A petitions are the top revenue generator.</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="alert alert-info">
                        <h6><i className="fas fa-users me-2"></i>Team Efficiency</h6>
                        <p className="mb-0">Team efficiency improved by 6.8%. Consider expanding the team to handle increased demand.</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="alert alert-warning">
                        <h6><i className="fas fa-clock me-2"></i>Project Duration</h6>
                        <p className="mb-0">Average project duration decreased by 2.1 days. Focus on maintaining quality while improving speed.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EnhancedAnalytics;