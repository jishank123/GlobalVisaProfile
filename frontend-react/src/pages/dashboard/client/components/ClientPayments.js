import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects, getStatusBadgeStyle } from '../../../../styles/designSystem';

const ClientPayments = ({ clientData, apiCall, onRefresh }) => {
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'bank_transfer',
    reference: '',
    notes: '',
    receipt: null
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/payments?client=' + clientData?.email);
      if (response.success) {
        setPayments(response.data || []);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPayments = () => {
    if (activeTab === 'all') return payments;
    return payments.filter(payment => {
      switch (activeTab) {
        case 'pending':
          return payment.status === 'pending';
        case 'approved':
          return payment.status === 'approved' || payment.status === 'verified' || payment.status === 'completed';
        case 'rejected':
          return payment.status === 'rejected' || payment.status === 'failed';
        default:
          return true;
      }
    });
  };

  const getPaymentCounts = () => {
    return {
      total: payments.length,
      pending: payments.filter(p => p.status === 'pending').length,
      approved: payments.filter(p => p.status === 'approved' || p.status === 'verified' || p.status === 'completed').length,
      rejected: payments.filter(p => p.status === 'rejected' || p.status === 'failed').length,
      totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      paidAmount: payments.filter(p => p.status === 'approved' || p.status === 'verified' || p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0)
    };
  };

  const getPaymentStatusStyle = (status) => {
    const statusStyles = {
      'pending': { background: '#f59e0b', color: 'white' },
      'approved': { background: '#10b981', color: 'white' },
      'verified': { background: '#10b981', color: 'white' },
      'completed': { background: '#10b981', color: 'white' },
      'rejected': { background: '#ef4444', color: 'white' },
      'failed': { background: '#ef4444', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
  };

  const handleMakePayment = async () => {
    try {
      const formData = new FormData();
      formData.append('amount', paymentData.amount);
      formData.append('method', paymentData.method);
      formData.append('reference', paymentData.reference);
      formData.append('notes', paymentData.notes);
      formData.append('client', clientData._id);
      if (paymentData.receipt) {
        formData.append('receipt', paymentData.receipt);
      }

      const response = await apiCall('/payments', {
        method: 'POST',
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it with boundary for FormData
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('client_token')}`
        }
      });

      if (response.success) {
        alert('Payment submitted successfully! It will be reviewed by our team.');
        setShowPaymentModal(false);
        setPaymentData({
          amount: '',
          method: 'bank_transfer',
          reference: '',
          notes: '',
          receipt: null
        });
        loadPayments();
      } else {
        throw new Error(response.message || 'Payment submission failed');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert(`Payment submission failed: ${error.message}`);
    }
  };

  const PaymentCard = ({ payment }) => (
    <div
      style={{
        ...componentStyles.managementCard,
        margin: 0,
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      {...hoverEffects.card}
      onClick={() => {
        setSelectedPayment(payment);
        setShowModal(true);
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: designSystem.spacing.md
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: designSystem.spacing.sm
          }}>
            <span style={{
              ...componentStyles.badge,
              background: designSystem.colors.primary,
              color: 'white',
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: '600',
              marginRight: designSystem.spacing.sm
            }}>
              #{payment._id.slice(-8).toUpperCase()}
            </span>
            <span style={{
              ...componentStyles.badge,
              ...getPaymentStatusStyle(payment.status),
              textTransform: 'uppercase',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {payment.status}
            </span>
          </div>
          
          <div style={{
            fontSize: designSystem.typography.fontSize.sm,
            color: designSystem.colors.gray[600],
            marginBottom: designSystem.spacing.sm
          }}>
            Payment Method: {payment.method?.replace('_', ' ').toUpperCase() || 'Not Specified'}
          </div>
          
          {payment.reference && (
            <div style={{
              fontSize: designSystem.typography.fontSize.sm,
              color: designSystem.colors.gray[600],
              marginBottom: designSystem.spacing.sm
            }}>
              Reference: {payment.reference}
            </div>
          )}
        </div>
        
        <div style={{
          textAlign: 'right',
          marginLeft: designSystem.spacing.md
        }}>
          <div style={{
            fontSize: designSystem.typography.fontSize.xl,
            fontWeight: designSystem.typography.fontWeight.bold,
            color: designSystem.colors.success.split('(')[0],
            marginBottom: '4px'
          }}>
            ${payment.amount?.toLocaleString() || '0'}
          </div>
          <div style={{
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.gray[500]
          }}>
            {new Date(payment.createdAt || payment.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {payment.project && (
        <div style={{
          background: designSystem.colors.light,
          padding: designSystem.spacing.sm,
          borderRadius: designSystem.borderRadius.small,
          marginBottom: designSystem.spacing.md
        }}>
          <div style={{
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.gray[500],
            marginBottom: '2px'
          }}>
            Related Project
          </div>
          <div style={{
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.medium,
            color: designSystem.colors.dark
          }}>
            {payment.project.service?.name || payment.project.service_name || 'Immigration Service'}
          </div>
        </div>
      )}

      {payment.notes && (
        <div style={{
          fontSize: designSystem.typography.fontSize.sm,
          color: designSystem.colors.gray[600],
          fontStyle: 'italic',
          marginBottom: designSystem.spacing.md
        }}>
          "{payment.notes}"
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: designSystem.spacing.sm,
        paddingTop: designSystem.spacing.md,
        borderTop: `1px solid ${designSystem.colors.gray[200]}`
      }}>
        <button
          style={{
            ...componentStyles.primaryButton,
            flex: 1,
            background: designSystem.colors.primary,
            fontSize: designSystem.typography.fontSize.sm
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPayment(payment);
            setShowModal(true);
          }}
          {...hoverEffects.button}
        >
          <i className="fas fa-eye me-2"></i>View Details
        </button>
        {payment.receipt_url && (
          <button
            style={{
              ...componentStyles.secondaryButton,
              fontSize: designSystem.typography.fontSize.sm
            }}
            onClick={(e) => {
              e.stopPropagation();
              window.open(payment.receipt_url, '_blank');
            }}
            {...hoverEffects.button}
          >
            <i className="fas fa-download me-2"></i>Receipt
          </button>
        )}
      </div>
    </div>
  );

  const PaymentModal = () => (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-credit-card me-2"></i>
              Payment Details - #{selectedPayment?._id.slice(-8).toUpperCase()}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowModal(false)}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {selectedPayment && (
              <div>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Payment Information
                    </h6>
                    <p><strong>Amount:</strong> ${selectedPayment.amount?.toLocaleString()}</p>
                    <p><strong>Status:</strong> 
                      <span style={{
                        ...componentStyles.badge,
                        ...getPaymentStatusStyle(selectedPayment.status),
                        marginLeft: '8px'
                      }}>
                        {selectedPayment.status.toUpperCase()}
                      </span>
                    </p>
                    <p><strong>Method:</strong> {selectedPayment.method?.replace('_', ' ').toUpperCase()}</p>
                    <p><strong>Reference:</strong> {selectedPayment.reference || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Timeline
                    </h6>
                    <p><strong>Submitted:</strong> {new Date(selectedPayment.createdAt || selectedPayment.created_at).toLocaleString()}</p>
                    {selectedPayment.verified_at && (
                      <p><strong>Verified:</strong> {new Date(selectedPayment.verified_at).toLocaleString()}</p>
                    )}
                    {selectedPayment.updated_at && (
                      <p><strong>Last Updated:</strong> {new Date(selectedPayment.updated_at).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {selectedPayment.project && (
                  <div className="mb-4">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Related Project
                    </h6>
                    <div style={{
                      background: designSystem.colors.light,
                      padding: designSystem.spacing.md,
                      borderRadius: designSystem.borderRadius.button
                    }}>
                      <p><strong>Service:</strong> {selectedPayment.project.service?.name || selectedPayment.project.service_name}</p>
                      <p><strong>Project ID:</strong> {selectedPayment.project.project_id || `#${selectedPayment.project._id.slice(-8).toUpperCase()}`}</p>
                      <p><strong>Status:</strong> {selectedPayment.project.status}</p>
                    </div>
                  </div>
                )}

                {selectedPayment.notes && (
                  <div className="mb-4">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Notes
                    </h6>
                    <div style={{
                      background: designSystem.colors.light,
                      padding: designSystem.spacing.md,
                      borderRadius: designSystem.borderRadius.button,
                      fontStyle: 'italic'
                    }}>
                      {selectedPayment.notes}
                    </div>
                  </div>
                )}

                {selectedPayment.receipt_url && (
                  <div className="mb-4">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Receipt
                    </h6>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => window.open(selectedPayment.receipt_url, '_blank')}
                    >
                      <i className="fas fa-download me-2"></i>Download Receipt
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const MakePaymentModal = () => (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-plus me-2"></i>
              Make Payment
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowPaymentModal(false)}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Amount ($)</label>
                <input
                  type="number"
                  className="form-control"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-control"
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Reference Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})}
                  placeholder="Transaction ID, Check number, etc."
                />
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Payment Receipt/Proof</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*,.pdf"
                  onChange={(e) => setPaymentData({...paymentData, receipt: e.target.files[0]})}
                />
                <small className="text-muted">Upload a screenshot or receipt of your payment</small>
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                  placeholder="Any additional information about this payment"
                ></textarea>
              </div>
            </div>

            <div style={{
              background: designSystem.colors.light,
              padding: designSystem.spacing.md,
              borderRadius: designSystem.borderRadius.button,
              marginTop: designSystem.spacing.md
            }}>
              <p style={{ 
                margin: 0,
                fontSize: designSystem.typography.fontSize.sm,
                color: designSystem.colors.gray[600]
              }}>
                <i className="fas fa-info-circle me-2"></i>
                Your payment will be reviewed by our team and you'll receive confirmation once verified.
              </p>
            </div>
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-success" 
              onClick={handleMakePayment}
              disabled={!paymentData.amount}
            >
              <i className="fas fa-paper-plane me-2"></i>
              Submit Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
        {number}
      </h4>
      <small style={{ color: designSystem.colors.gray[500] }}>
        {label}
      </small>
    </div>
  );

  if (loading) {
    return (
      <div style={componentStyles.loading}>
        <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
        <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>
          Loading payment history...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Actions */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-credit-card fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Payments & Billing</h4>
            <p style={componentStyles.headerSubtitle}>Track your payments and make new payments</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.success
            }}
            onClick={() => setShowPaymentModal(true)}
            {...hoverEffects.button}
          >
            <i className="fas fa-plus me-2"></i>Make Payment
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.info
            }}
            onClick={() => {
              loadPayments();
              onRefresh?.();
            }}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>
      </div>

      {/* Payment Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-credit-card"
          number={getPaymentCounts().total}
          label="Total Payments"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
        <StatCard
          icon="fas fa-clock"
          number={getPaymentCounts().pending}
          label="Pending Review"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={getPaymentCounts().approved}
          label="Approved Payments"
          borderColor="#10b981"
          iconColor="#10b981"
        />
        <StatCard
          icon="fas fa-dollar-sign"
          number={`$${getPaymentCounts().paidAmount.toLocaleString()}`}
          label="Total Paid"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
      </div>

      {/* Payment Tabs */}
      <div style={{ marginBottom: designSystem.spacing.lg }}>
        <div style={{ display: 'flex', gap: designSystem.spacing.xs, flexWrap: 'wrap' }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'all' ? designSystem.colors.primary : designSystem.colors.gray[100],
              color: activeTab === 'all' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('all')}
            {...hoverEffects.button}
          >
            All Payments ({getPaymentCounts().total})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'pending' ? '#f59e0b' : designSystem.colors.gray[100],
              color: activeTab === 'pending' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('pending')}
            {...hoverEffects.button}
          >
            Pending ({getPaymentCounts().pending})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'approved' ? '#10b981' : designSystem.colors.gray[100],
              color: activeTab === 'approved' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('approved')}
            {...hoverEffects.button}
          >
            Approved ({getPaymentCounts().approved})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'rejected' ? '#ef4444' : designSystem.colors.gray[100],
              color: activeTab === 'rejected' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('rejected')}
            {...hoverEffects.button}
          >
            Rejected ({getPaymentCounts().rejected})
          </button>
        </div>
      </div>

      {/* Payments Grid */}
      {getFilteredPayments().length === 0 ? (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-credit-card fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>
            No {activeTab === 'all' ? '' : activeTab} payments found
          </h6>
          <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.lg }}>
            {activeTab === 'all' 
              ? 'You haven\'t made any payments yet.'
              : `You don't have any ${activeTab} payments at the moment.`}
          </p>
          {activeTab === 'all' && (
            <button
              style={componentStyles.primaryButton}
              onClick={() => setShowPaymentModal(true)}
              {...hoverEffects.button}
            >
              <i className="fas fa-plus me-2"></i>Make Your First Payment
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: designSystem.spacing.lg
        }}>
          {getFilteredPayments().map(payment => (
            <PaymentCard key={payment._id} payment={payment} />
          ))}
        </div>
      )}

      {/* Payment Details Modal */}
      {showModal && <PaymentModal />}

      {/* Make Payment Modal */}
      {showPaymentModal && <MakePaymentModal />}
    </div>
  );
};

export default ClientPayments;