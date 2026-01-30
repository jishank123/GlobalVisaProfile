import { useState, useEffect } from 'react';

const ClientPayments = ({ clientData, apiCall }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPaid: 0,
    pendingAmount: 0,
    nextPaymentDue: null
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    loadPayments();
    loadPaymentStats();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/client/payments');
      if (response.success) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentStats = async () => {
    try {
      const response = await apiCall('/client/payment-stats');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading payment stats:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'completed': 'bg-success',
      'pending': 'bg-warning',
      'failed': 'bg-danger',
      'refunded': 'bg-info'
    };
    return statusMap[status] || 'bg-secondary';
  };

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleMakePayment = () => {
    // This would typically redirect to a payment processor
    alert('Payment functionality would be integrated with a payment processor like Stripe or PayPal');
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
    <div className="client-payments">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className="fas fa-credit-card me-2"></i>
          Payments & Billing
        </h4>
        <button className="btn btn-primary" onClick={handleMakePayment}>
          <i className="fas fa-plus me-2"></i>
          Make Payment
        </button>
      </div>

      {/* Payment Stats */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <i className="fas fa-dollar-sign fa-2x mb-2"></i>
              <h3 className="mb-1">${stats.totalPaid}</h3>
              <p className="mb-0">Total Paid</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <i className="fas fa-clock fa-2x mb-2"></i>
              <h3 className="mb-1">${stats.pendingAmount}</h3>
              <p className="mb-0">Pending</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <i className="fas fa-calendar-alt fa-2x mb-2"></i>
              <h3 className="mb-1">
                {stats.nextPaymentDue ? new Date(stats.nextPaymentDue).toLocaleDateString() : 'N/A'}
              </h3>
              <p className="mb-0">Next Due</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="card">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="fas fa-history me-2"></i>
            Payment History
          </h6>
        </div>
        <div className="card-body">
          {payments.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Method</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                      <td>
                        <div>
                          <div className="fw-bold">{payment.description}</div>
                          {payment.project_title && (
                            <small className="text-muted">Project: {payment.project_title}</small>
                          )}
                        </div>
                      </td>
                      <td className="fw-bold">${payment.amount}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(payment.status)}`}>
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <i className={`fab fa-cc-${payment.payment_method?.toLowerCase() || 'generic'} me-1`}></i>
                        {payment.payment_method || 'N/A'}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => handleViewReceipt(payment)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {payment.receipt_url && (
                            <a 
                              href={payment.receipt_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-outline-secondary"
                            >
                              <i className="fas fa-download"></i>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-receipt text-muted fa-3x mb-3"></i>
              <h5 className="text-muted">No Payments Yet</h5>
              <p className="text-muted mb-4">
                Your payment history will appear here once you make your first payment.
              </p>
              <button className="btn btn-primary" onClick={handleMakePayment}>
                <i className="fas fa-credit-card me-2"></i>
                Make Your First Payment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="card mt-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="fas fa-credit-card me-2"></i>
            Payment Methods
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="border rounded p-3 mb-3">
                <h6 className="text-primary">
                  <i className="fas fa-university me-2"></i>
                  Bank Transfer
                </h6>
                <p className="small text-muted mb-2">
                  Secure bank-to-bank transfer with low fees.
                </p>
                <button className="btn btn-outline-primary btn-sm">
                  Set Up
                </button>
              </div>
            </div>
            <div className="col-md-6">
              <div className="border rounded p-3 mb-3">
                <h6 className="text-success">
                  <i className="fab fa-cc-stripe me-2"></i>
                  Credit/Debit Card
                </h6>
                <p className="small text-muted mb-2">
                  Pay instantly with your credit or debit card.
                </p>
                <button className="btn btn-outline-success btn-sm">
                  Add Card
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Payment Details</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowPaymentModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-6">
                    <strong>Payment ID:</strong>
                  </div>
                  <div className="col-6">
                    #{selectedPayment.id}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <strong>Date:</strong>
                  </div>
                  <div className="col-6">
                    {new Date(selectedPayment.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <strong>Amount:</strong>
                  </div>
                  <div className="col-6">
                    <span className="fw-bold">${selectedPayment.amount}</span>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <strong>Status:</strong>
                  </div>
                  <div className="col-6">
                    <span className={`badge ${getStatusBadge(selectedPayment.status)}`}>
                      {selectedPayment.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <strong>Method:</strong>
                  </div>
                  <div className="col-6">
                    {selectedPayment.payment_method || 'N/A'}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12">
                    <strong>Description:</strong>
                    <p className="mt-1">{selectedPayment.description}</p>
                  </div>
                </div>
                {selectedPayment.notes && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <strong>Notes:</strong>
                      <p className="mt-1">{selectedPayment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Close
                </button>
                {selectedPayment.receipt_url && (
                  <a 
                    href={selectedPayment.receipt_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <i className="fas fa-download me-2"></i>
                    Download Receipt
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPayments;