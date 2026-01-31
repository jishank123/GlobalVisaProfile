import { useState, useEffect } from 'react';
import { paymentsAPI, clientsAPI } from '../../../../services/api';

const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    verification_status: '',
    period: '',
    client: ''
  });
  const [approvalData, setApprovalData] = useState({
    verification_status: '',
    admin_notes: ''
  });

  useEffect(() => {
    loadPaymentsData();
    loadClients();
  }, [filters]);

  const loadPaymentsData = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getAll(filters);
      if (response.success) {
        setPayments(response.data || []);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      if (response.success) {
        setClients(response.data || []);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleApprovePayment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await paymentsAPI.verify(selectedPayment._id, approvalData);
      if (response.success) {
        await loadPaymentsData();
        setShowApprovalModal(false);
        setSelectedPayment(null);
        setApprovalData({ verification_status: '', admin_notes: '' });
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'pending': 'bg-warning',
      'completed': 'bg-success',
      'failed': 'bg-danger',
      'cancelled': 'bg-secondary'
    };
    return statusClasses[status] || 'bg-secondary';
  };

  const getVerificationBadgeClass = (status) => {
    const statusClasses = {
      'pending': 'bg-warning',
      'verified': 'bg-success',
      'rejected': 'bg-danger'
    };
    return statusClasses[status] || 'bg-secondary';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const paymentStats = {
    total: payments.length,
    pending: payments.filter(p => p.verification_status === 'pending').length,
    verified: payments.filter(p => p.verification_status === 'verified').length,
    rejected: payments.filter(p => p.verification_status === 'rejected').length,
    totalAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0)
  };

  const getFilteredPaymentsByPeriod = () => {
    if (!filters.period) return payments;
    
    const now = new Date();
    const startDate = new Date();
    
    switch (filters.period) {
      case 'daily':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return payments;
    }
    
    return payments.filter(payment => 
      new Date(payment.createdAt) >= startDate
    );
  };

  const filteredPayments = getFilteredPaymentsByPeriod();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-credit-card text-primary me-2"></i>
          Payments & Invoices Management
        </h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary">
            <i className="fas fa-download me-2"></i>
            Export Report
          </button>
          <button className="btn btn-success">
            <i className="fas fa-plus me-2"></i>
            Create Invoice
          </button>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="row mb-4">
        <div className="col-md-2">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{paymentStats.total}</h4>
                  <p className="mb-0">Total Payments</p>
                </div>
                <i className="fas fa-credit-card fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{paymentStats.pending}</h4>
                  <p className="mb-0">Pending Approval</p>
                </div>
                <i className="fas fa-clock fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{paymentStats.verified}</h4>
                  <p className="mb-0">Verified</p>
                </div>
                <i className="fas fa-check fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{paymentStats.rejected}</h4>
                  <p className="mb-0">Rejected</p>
                </div>
                <i className="fas fa-times fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{formatCurrency(paymentStats.totalAmount)}</h4>
                  <p className="mb-0">Total Revenue</p>
                </div>
                <i className="fas fa-dollar-sign fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-2">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Verification</label>
              <select
                className="form-select"
                value={filters.verification_status}
                onChange={(e) => setFilters({ ...filters, verification_status: e.target.value })}
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Period</label>
              <select
                className="form-select"
                value={filters.period}
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              >
                <option value="">All Time</option>
                <option value="daily">Last 24 Hours</option>
                <option value="weekly">Last Week</option>
                <option value="monthly">Last Month</option>
                <option value="yearly">Last Year</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Client</label>
              <select
                className="form-select"
                value={filters.client}
                onChange={(e) => setFilters({ ...filters, client: e.target.value })}
              >
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({ status: '', verification_status: '', period: '', client: '' })}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">All Payments ({filteredPayments.length})</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Verification</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        <i className="fas fa-credit-card fa-3x text-muted mb-3"></i>
                        <p className="text-muted">No payments found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr key={payment._id}>
                        <td>
                          <code>{payment._id?.substring(0, 8)}...</code>
                        </td>
                        <td>
                          <div>
                            <strong>{payment.client?.name}</strong>
                            <small className="d-block text-muted">{payment.client?.email}</small>
                          </div>
                        </td>
                        <td>{payment.service_name}</td>
                        <td>
                          <strong>{formatCurrency(payment.amount)}</strong>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {payment.payment_method?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getVerificationBadgeClass(payment.verification_status)}`}>
                            {payment.verification_status}
                          </span>
                        </td>
                        <td>
                          {new Date(payment.createdAt).toLocaleDateString()}
                          <small className="d-block text-muted">
                            {new Date(payment.createdAt).toLocaleTimeString()}
                          </small>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            {payment.verification_status === 'pending' && (
                              <button
                                className="btn btn-outline-success"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setApprovalData({ verification_status: 'verified', admin_notes: '' });
                                  setShowApprovalModal(true);
                                }}
                                title="Approve Payment"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                            )}
                            {payment.verification_status === 'pending' && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setApprovalData({ verification_status: 'rejected', admin_notes: '' });
                                  setShowApprovalModal(true);
                                }}
                                title="Reject Payment"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            )}
                            {payment.receipt_screenshot && (
                              <button
                                className="btn btn-outline-info"
                                onClick={() => window.open(`/uploads/payment-receipts/${payment.receipt_screenshot}`, '_blank')}
                                title="View Receipt"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                            )}
                            <button
                              className="btn btn-outline-primary"
                              title="View Details"
                            >
                              <i className="fas fa-info-circle"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Payment Approval Modal */}
      {showApprovalModal && selectedPayment && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {approvalData.verification_status === 'verified' ? 'Approve' : 'Reject'} Payment
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedPayment(null);
                  }}
                ></button>
              </div>
              <form onSubmit={handleApprovePayment}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Payment Details</label>
                    <div className="card bg-light">
                      <div className="card-body">
                        <p><strong>Client:</strong> {selectedPayment.client?.name}</p>
                        <p><strong>Service:</strong> {selectedPayment.service_name}</p>
                        <p><strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}</p>
                        <p><strong>Method:</strong> {selectedPayment.payment_method}</p>
                        <p><strong>Transaction ID:</strong> {selectedPayment.transaction_id}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedPayment.receipt_screenshot && (
                    <div className="mb-3">
                      <label className="form-label">Payment Receipt</label>
                      <div className="text-center">
                        <img 
                          src={`/uploads/payment-receipts/${selectedPayment.receipt_screenshot}`}
                          alt="Payment Receipt"
                          className="img-fluid"
                          style={{ maxHeight: '300px' }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Admin Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={approvalData.admin_notes}
                      onChange={(e) => setApprovalData({ ...approvalData, admin_notes: e.target.value })}
                      placeholder="Add any notes about this payment verification..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowApprovalModal(false);
                      setSelectedPayment(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={`btn ${approvalData.verification_status === 'verified' ? 'btn-success' : 'btn-danger'}`}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (approvalData.verification_status === 'verified' ? 'Approve Payment' : 'Reject Payment')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsManagement;