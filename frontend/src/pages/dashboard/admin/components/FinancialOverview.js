import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../../../services/api';

const FinancialOverview = () => {
  const [financialData, setFinancialData] = useState({
    revenue: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    },
    expenses: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0
    },
    profit: {
      total: 0,
      thisMonth: 0,
      margin: 0
    },
    payments: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      const response = await dashboardAPI.getFinancialOverview();
      
      if (response.success) {
        // Map the backend response to the expected frontend structure
        const backendData = response.data;
        
        setFinancialData({
          revenue: {
            total: backendData.totalPayments || 0,
            thisMonth: backendData.monthlyRevenue || 0,
            lastMonth: 0, // Could be calculated from backend
            growth: 0 // Could be calculated from backend
          },
          expenses: {
            total: 0, // Not implemented in backend yet
            thisMonth: 0,
            lastMonth: 0
          },
          profit: {
            total: backendData.monthlyRevenue || 0,
            thisMonth: backendData.monthlyRevenue || 0,
            margin: 0 // Could be calculated
          },
          payments: [] // Recent payments would need separate endpoint
        });
      } else {
        throw new Error(response.error?.message || 'Failed to load financial data');
      }
      
    } catch (error) {
      console.error('Error loading financial data:', error);
      // Set empty state on error
      setFinancialData({
        revenue: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
        expenses: { total: 0, thisMonth: 0, lastMonth: 0 },
        profit: { total: 0, thisMonth: 0, margin: 0 },
        payments: []
      });
    } finally {
      setLoading(false);
    }
  };

  const viewPaymentReceipt = (payment) => {
    alert(`Payment Receipt:
    
Client: ${payment.client}
Service: ${payment.service}
Amount: $${payment.amount.toLocaleString()}
Status: ${payment.status.toUpperCase()}
Payment Method: ${payment.method}
Date: ${new Date(payment.date).toLocaleDateString()}
Payment ID: ${payment.id || payment._id}`);
  };

  const sendInvoice = async (payment) => {
    if (window.confirm(`Send invoice to client?\n\nClient: ${payment.client}\nAmount: $${payment.amount.toLocaleString()}`)) {
      try {
        // This would call the payments API to send invoice
        const response = await fetch(`/api/payments/${payment.id || payment._id}/send-invoice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          alert('Invoice sent successfully!');
        } else {
          throw new Error('Failed to send invoice');
        }
      } catch (error) {
        console.error('Error sending invoice:', error);
        alert(`Error sending invoice: ${error.message}`);
      }
    }
  };

  const markAsPaid = async (payment) => {
    if (window.confirm(`Mark payment as paid?\n\nClient: ${payment.client}\nAmount: $${payment.amount.toLocaleString()}`)) {
      try {
        // This would call the payments API to mark as paid
        const response = await fetch(`/api/payments/${payment.id || payment._id}/mark-paid`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          alert('Payment marked as paid successfully!');
          loadFinancialData();
        } else {
          throw new Error('Failed to mark payment as paid');
        }
      } catch (error) {
        console.error('Error marking payment as paid:', error);
        alert(`Error updating payment: ${error.message}`);
      }
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusClasses = {
      'paid': 'bg-success',
      'pending': 'bg-warning',
      'overdue': 'bg-danger',
      'cancelled': 'bg-secondary'
    };
    return statusClasses[status] || 'bg-secondary';
  };

  const managementCardStyle = {
    background: 'white',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  return (
    <div className="management-card" style={managementCardStyle}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5>
          <i className="fas fa-chart-line me-2"></i>
          Financial Overview
        </h5>
        <div className="btn-group" role="group">
          <button className="btn btn-outline-primary btn-sm" onClick={loadFinancialData}>
            <i className="fas fa-sync-alt me-1"></i>Refresh
          </button>
          <button className="btn btn-success btn-sm">
            <i className="fas fa-file-export me-1"></i>Export Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm me-2"></div>
          Loading financial data...
        </div>
      ) : (
        <>
          {/* Financial Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card border-success">
                <div className="card-body text-center">
                  <i className="fas fa-dollar-sign fa-2x text-success mb-2"></i>
                  <h4 className="text-success">${financialData.revenue.total.toLocaleString()}</h4>
                  <small className="text-muted">Total Revenue</small>
                  <div className="mt-2">
                    <span className="badge bg-success">
                      +{financialData.revenue.growth}% this month
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-info">
                <div className="card-body text-center">
                  <i className="fas fa-calendar-alt fa-2x text-info mb-2"></i>
                  <h4 className="text-info">${financialData.revenue.thisMonth.toLocaleString()}</h4>
                  <small className="text-muted">This Month</small>
                  <div className="mt-2">
                    <small className="text-muted">
                      Last: ${financialData.revenue.lastMonth.toLocaleString()}
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-warning">
                <div className="card-body text-center">
                  <i className="fas fa-credit-card fa-2x text-warning mb-2"></i>
                  <h4 className="text-warning">${financialData.expenses.total.toLocaleString()}</h4>
                  <small className="text-muted">Total Expenses</small>
                  <div className="mt-2">
                    <small className="text-muted">
                      This month: ${financialData.expenses.thisMonth.toLocaleString()}
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-primary">
                <div className="card-body text-center">
                  <i className="fas fa-chart-pie fa-2x text-primary mb-2"></i>
                  <h4 className="text-primary">${financialData.profit.total.toLocaleString()}</h4>
                  <small className="text-muted">Net Profit</small>
                  <div className="mt-2">
                    <span className="badge bg-primary">
                      {financialData.profit.margin}% margin
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="mb-4">
            <h6 className="mb-3">
              <i className="fas fa-receipt me-2"></i>
              Recent Payments
            </h6>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                  <tr>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment Method</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {financialData.payments.length > 0 ? (
                    financialData.payments.map(payment => (
                      <tr key={payment.id || payment._id}>
                        <td><strong>{payment.client}</strong></td>
                        <td>{payment.service}</td>
                        <td><strong>${payment.amount.toLocaleString()}</strong></td>
                        <td>
                          <span className={`badge ${getPaymentStatusBadge(payment.status)}`}>
                            {payment.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">{payment.method}</span>
                        </td>
                        <td>{new Date(payment.date).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary" 
                              onClick={() => viewPaymentReceipt(payment)}
                              title="View Receipt"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="btn btn-outline-info" 
                              onClick={() => sendInvoice(payment)}
                              title="Send Invoice"
                            >
                              <i className="fas fa-file-invoice"></i>
                            </button>
                            {payment.status === 'pending' && (
                              <button 
                                className="btn btn-outline-success" 
                                onClick={() => markAsPaid(payment)}
                                title="Mark as Paid"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        <i className="fas fa-receipt fa-2x mb-2"></i>
                        <p>No recent payments found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Charts Placeholder */}
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="fas fa-chart-bar me-2"></i>
                    Monthly Revenue Trend
                  </h6>
                </div>
                <div className="card-body text-center py-5">
                  <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                  <p className="text-muted">Chart visualization would go here</p>
                  <small className="text-muted">Integration with Chart.js or similar library needed</small>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="fas fa-chart-pie me-2"></i>
                    Revenue by Service
                  </h6>
                </div>
                <div className="card-body text-center py-5">
                  <i className="fas fa-chart-pie fa-3x text-muted mb-3"></i>
                  <p className="text-muted">Pie chart visualization would go here</p>
                  <small className="text-muted">Shows revenue breakdown by service type</small>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialOverview;