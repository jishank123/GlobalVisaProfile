import { useState, useEffect } from 'react';
import { analyticsAPI, dashboardAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

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

  const StatCard = ({ title, value, icon, borderColor, iconColor, trend, trendValue }) => (
    <div 
      style={{
        ...componentStyles.contactsStatCard,
        borderColor: borderColor,
        cursor: 'pointer'
      }}
      {...hoverEffects.card}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h6 style={{ 
            color: designSystem.colors.gray[500], 
            fontSize: designSystem.typography.fontSize.sm,
            marginBottom: designSystem.spacing.xs
          }}>
            {title}
          </h6>
          <h3 style={{ 
            color: iconColor,
            fontWeight: designSystem.typography.fontWeight.bold,
            marginBottom: '4px'
          }}>
            {value}
          </h3>
          {trend && (
            <small style={{ 
              color: trend === 'up' ? '#10b981' : '#ef4444',
              fontSize: designSystem.typography.fontSize.xs
            }}>
              <i className={`fas fa-arrow-${trend} me-1`}></i> {trendValue}
            </small>
          )}
        </div>
        <div>
          <i className={`${icon} fa-2x`} style={{ color: iconColor }}></i>
        </div>
      </div>
    </div>
  );

  return (
    <div style={componentStyles.managementCard}>
      {/* Unified Header */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-chart-line fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Enhanced Analytics</h4>
            <p style={componentStyles.headerSubtitle}>Comprehensive business intelligence and insights</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
          <select
            style={{
              ...componentStyles.formInput,
              width: 'auto',
              minWidth: '120px'
            }}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button 
            onClick={loadAnalyticsData}
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.primary
            }}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={componentStyles.loading}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary.split(' ')[0].split('(')[1] }}></i>
          <p style={{ marginTop: designSystem.spacing.md }}>Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* Revenue Metrics */}
          <div style={{ marginBottom: designSystem.spacing.lg }}>
            <h4 style={{ 
              marginBottom: designSystem.spacing.md,
              color: designSystem.colors.dark,
              fontWeight: designSystem.typography.fontWeight.semibold
            }}>
              Revenue Analytics
            </h4>
            <div style={componentStyles.statsContainer}>
              <StatCard
                title="Daily Revenue"
                value={formatCurrency(analytics.revenue.daily)}
                icon="fas fa-calendar-day"
                borderColor="#3b82f6"
                iconColor="#3b82f6"
                trend="up"
                trendValue="12.5%"
              />
              <StatCard
                title="Weekly Revenue"
                value={formatCurrency(analytics.revenue.weekly)}
                icon="fas fa-calendar-week"
                borderColor="#10b981"
                iconColor="#10b981"
                trend="up"
                trendValue="8.3%"
              />
              <StatCard
                title="Monthly Revenue"
                value={formatCurrency(analytics.revenue.monthly)}
                icon="fas fa-calendar-alt"
                borderColor="#8b5cf6"
                iconColor="#8b5cf6"
                trend="up"
                trendValue="15.7%"
              />
              <StatCard
                title="Yearly Revenue"
                value={formatCurrency(analytics.revenue.yearly)}
                icon="fas fa-calendar"
                borderColor="#f59e0b"
                iconColor="#f59e0b"
                trend="up"
                trendValue="22.1%"
              />
            </div>
          </div>

          {/* Performance Metrics */}
          <div style={{ marginBottom: designSystem.spacing.lg }}>
            <h4 style={{ 
              marginBottom: designSystem.spacing.md,
              color: designSystem.colors.dark,
              fontWeight: designSystem.typography.fontWeight.semibold
            }}>
              Performance Metrics
            </h4>
            <div style={componentStyles.statsContainer}>
              <StatCard
                title="Conversion Rate"
                value={formatPercentage(analytics.performance.conversionRate)}
                icon="fas fa-chart-pie"
                borderColor="#10b981"
                iconColor="#10b981"
                trend="up"
                trendValue="3.2%"
              />
              <StatCard
                title="Avg Project Duration"
                value={`${analytics.performance.avgProjectDuration || 0} days`}
                icon="fas fa-clock"
                borderColor="#8b5cf6"
                iconColor="#8b5cf6"
                trend="down"
                trendValue="2.1 days"
              />
              <StatCard
                title="Client Satisfaction"
                value={formatPercentage(analytics.performance.clientSatisfaction)}
                icon="fas fa-smile"
                borderColor="#f59e0b"
                iconColor="#f59e0b"
                trend="up"
                trendValue="4.5%"
              />
              <StatCard
                title="Team Efficiency"
                value={formatPercentage(analytics.performance.teamEfficiency)}
                icon="fas fa-users"
                borderColor="#3b82f6"
                iconColor="#3b82f6"
                trend="up"
                trendValue="6.8%"
              />
            </div>
          </div>

          {/* Charts Section */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr', 
            gap: designSystem.spacing.lg, 
            marginBottom: designSystem.spacing.lg 
          }}>
            <div style={{
              background: 'white',
              borderRadius: designSystem.borderRadius.card,
              boxShadow: designSystem.shadows.card,
              overflow: 'hidden'
            }}>
              <div style={{
                background: designSystem.colors.primary,
                color: 'white',
                padding: designSystem.spacing.md,
                fontWeight: designSystem.typography.fontWeight.semibold
              }}>
                Revenue Trend
              </div>
              <div style={{ padding: designSystem.spacing.lg }}>
                <div style={{ 
                  height: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: designSystem.colors.light,
                  borderRadius: designSystem.borderRadius.button
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <i className="fas fa-chart-line fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
                    <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.xs }}>Revenue trend chart will be displayed here</p>
                    <small style={{ color: designSystem.colors.gray[500] }}>Integrate with Chart.js for interactive charts</small>
                  </div>
                </div>
              </div>
            </div>
            <div style={{
              background: 'white',
              borderRadius: designSystem.borderRadius.card,
              boxShadow: designSystem.shadows.card,
              overflow: 'hidden'
            }}>
              <div style={{
                background: designSystem.colors.primary,
                color: 'white',
                padding: designSystem.spacing.md,
                fontWeight: designSystem.typography.fontWeight.semibold
              }}>
                Lead Sources
              </div>
              <div style={{ padding: designSystem.spacing.lg }}>
                <div style={{ marginBottom: designSystem.spacing.md }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: designSystem.spacing.xs }}>
                    <span>Website</span>
                    <span>45%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    background: designSystem.colors.gray[200], 
                    borderRadius: '4px',
                    marginBottom: designSystem.spacing.sm
                  }}>
                    <div style={{ 
                      width: '45%', 
                      height: '100%', 
                      background: '#3b82f6', 
                      borderRadius: '4px' 
                    }}></div>
                  </div>
                </div>
                <div style={{ marginBottom: designSystem.spacing.md }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: designSystem.spacing.xs }}>
                    <span>Referrals</span>
                    <span>30%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    background: designSystem.colors.gray[200], 
                    borderRadius: '4px',
                    marginBottom: designSystem.spacing.sm
                  }}>
                    <div style={{ 
                      width: '30%', 
                      height: '100%', 
                      background: '#10b981', 
                      borderRadius: '4px' 
                    }}></div>
                  </div>
                </div>
                <div style={{ marginBottom: designSystem.spacing.md }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: designSystem.spacing.xs }}>
                    <span>Social Media</span>
                    <span>15%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    background: designSystem.colors.gray[200], 
                    borderRadius: '4px',
                    marginBottom: designSystem.spacing.sm
                  }}>
                    <div style={{ 
                      width: '15%', 
                      height: '100%', 
                      background: '#8b5cf6', 
                      borderRadius: '4px' 
                    }}></div>
                  </div>
                </div>
                <div style={{ marginBottom: designSystem.spacing.md }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: designSystem.spacing.xs }}>
                    <span>Direct</span>
                    <span>10%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    background: designSystem.colors.gray[200], 
                    borderRadius: '4px',
                    marginBottom: designSystem.spacing.sm
                  }}>
                    <div style={{ 
                      width: '10%', 
                      height: '100%', 
                      background: '#f59e0b', 
                      borderRadius: '4px' 
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analytics Tables */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: designSystem.spacing.lg, 
            marginBottom: designSystem.spacing.lg 
          }}>
            <div style={{
              background: 'white',
              borderRadius: designSystem.borderRadius.card,
              boxShadow: designSystem.shadows.card,
              overflow: 'hidden'
            }}>
              <div style={{
                background: designSystem.colors.primary,
                color: 'white',
                padding: designSystem.spacing.md,
                fontWeight: designSystem.typography.fontWeight.semibold
              }}>
                Top Performing Services
              </div>
              <div style={{ padding: designSystem.spacing.lg }}>
                <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={componentStyles.tableHeader}>
                      <tr>
                        <th style={componentStyles.tableHeaderCell}>Service</th>
                        <th style={componentStyles.tableHeaderCell}>Revenue</th>
                        <th style={componentStyles.tableHeaderCell}>Projects</th>
                        <th style={componentStyles.tableHeaderCell}>Avg. Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={componentStyles.tableRow} {...hoverEffects.tableRow}>
                        <td style={componentStyles.tableCell}>EB-1A Petition</td>
                        <td style={componentStyles.tableCell}>{formatCurrency(125000)}</td>
                        <td style={componentStyles.tableCell}>25</td>
                        <td style={componentStyles.tableCell}>{formatCurrency(5000)}</td>
                      </tr>
                      <tr style={componentStyles.tableRow} {...hoverEffects.tableRow}>
                        <td style={componentStyles.tableCell}>EB-2 NIW</td>
                        <td style={componentStyles.tableCell}>{formatCurrency(90000)}</td>
                        <td style={componentStyles.tableCell}>30</td>
                        <td style={componentStyles.tableCell}>{formatCurrency(3000)}</td>
                      </tr>
                      <tr style={componentStyles.tableRow} {...hoverEffects.tableRow}>
                        <td style={componentStyles.tableCell}>O-1 Visa</td>
                        <td style={componentStyles.tableCell}>{formatCurrency(75000)}</td>
                        <td style={componentStyles.tableCell}>50</td>
                        <td style={componentStyles.tableCell}>{formatCurrency(1500)}</td>
                      </tr>
                      <tr style={componentStyles.tableRow} {...hoverEffects.tableRow}>
                        <td style={componentStyles.tableCell}>Profile Building</td>
                        <td style={componentStyles.tableCell}>{formatCurrency(45000)}</td>
                        <td style={componentStyles.tableCell}>90</td>
                        <td style={componentStyles.tableCell}>{formatCurrency(500)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div style={{
              background: 'white',
              borderRadius: designSystem.borderRadius.card,
              boxShadow: designSystem.shadows.card,
              overflow: 'hidden'
            }}>
              <div style={{
                background: designSystem.colors.primary,
                color: 'white',
                padding: designSystem.spacing.md,
                fontWeight: designSystem.typography.fontWeight.semibold
              }}>
                Team Performance
              </div>
              <div style={{ padding: designSystem.spacing.lg }}>
                <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={componentStyles.tableHeader}>
                      <tr>
                        <th style={componentStyles.tableHeaderCell}>Team Member</th>
                        <th style={componentStyles.tableHeaderCell}>Projects</th>
                        <th style={componentStyles.tableHeaderCell}>Completion Rate</th>
                        <th style={componentStyles.tableHeaderCell}>Avg. Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={componentStyles.tableRow} {...hoverEffects.tableRow}>
                        <td style={componentStyles.tableCell}>John Smith</td>
                        <td style={componentStyles.tableCell}>15</td>
                        <td style={componentStyles.tableCell}>95%</td>
                        <td style={componentStyles.tableCell}>4.8/5</td>
                      </tr>
                      <tr style={componentStyles.tableRow} {...hoverEffects.tableRow}>
                        <td style={componentStyles.tableCell}>Sarah Johnson</td>
                        <td style={componentStyles.tableCell}>12</td>
                        <td style={componentStyles.tableCell}>92%</td>
                        <td style={componentStyles.tableCell}>4.7/5</td>
                      </tr>
                      <tr style={componentStyles.tableRow} {...hoverEffects.tableRow}>
                        <td style={componentStyles.tableCell}>Mike Davis</td>
                        <td style={componentStyles.tableCell}>18</td>
                        <td style={componentStyles.tableCell}>88%</td>
                        <td style={componentStyles.tableCell}>4.6/5</td>
                      </tr>
                      <tr style={componentStyles.tableRow} {...hoverEffects.tableRow}>
                        <td style={componentStyles.tableCell}>Lisa Wilson</td>
                        <td style={componentStyles.tableCell}>10</td>
                        <td style={componentStyles.tableCell}>98%</td>
                        <td style={componentStyles.tableCell}>4.9/5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div style={{
            background: 'white',
            borderRadius: designSystem.borderRadius.card,
            boxShadow: designSystem.shadows.card,
            overflow: 'hidden'
          }}>
            <div style={{
              background: designSystem.colors.primary,
              color: 'white',
              padding: designSystem.spacing.md,
              fontWeight: designSystem.typography.fontWeight.semibold
            }}>
              <i className="fas fa-lightbulb me-2" style={{ color: '#fbbf24' }}></i>
              Key Insights & Recommendations
            </div>
            <div style={{ padding: designSystem.spacing.lg }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: designSystem.spacing.md }}>
                <div style={{
                  padding: designSystem.spacing.md,
                  background: '#dcfce7',
                  border: '1px solid #bbf7d0',
                  borderRadius: designSystem.borderRadius.button
                }}>
                  <h6 style={{ color: '#166534', marginBottom: designSystem.spacing.xs }}>
                    <i className="fas fa-arrow-up me-2"></i>Revenue Growth
                  </h6>
                  <p style={{ margin: 0, color: '#166534', fontSize: designSystem.typography.fontSize.sm }}>
                    Monthly revenue increased by 15.7% compared to last month. EB-1A petitions are the top revenue generator.
                  </p>
                </div>
                <div style={{
                  padding: designSystem.spacing.md,
                  background: '#dbeafe',
                  border: '1px solid #bfdbfe',
                  borderRadius: designSystem.borderRadius.button
                }}>
                  <h6 style={{ color: '#1e40af', marginBottom: designSystem.spacing.xs }}>
                    <i className="fas fa-users me-2"></i>Team Efficiency
                  </h6>
                  <p style={{ margin: 0, color: '#1e40af', fontSize: designSystem.typography.fontSize.sm }}>
                    Team efficiency improved by 6.8%. Consider expanding the team to handle increased demand.
                  </p>
                </div>
                <div style={{
                  padding: designSystem.spacing.md,
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: designSystem.borderRadius.button
                }}>
                  <h6 style={{ color: '#92400e', marginBottom: designSystem.spacing.xs }}>
                    <i className="fas fa-clock me-2"></i>Project Duration
                  </h6>
                  <p style={{ margin: 0, color: '#92400e', fontSize: designSystem.typography.fontSize.sm }}>
                    Average project duration decreased by 2.1 days. Focus on maintaining quality while improving speed.
                  </p>
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