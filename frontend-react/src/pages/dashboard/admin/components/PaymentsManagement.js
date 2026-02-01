import { useState, useEffect } from 'react';
import { paymentsAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalType, setModalType] = useState(''); // 'view', 'approve', 'reject'
  const [approvalData, setApprovalData] = useState({
    verification_status: '',
    admin_notes: ''
  });

  useEffect(() => {
    loadPaymentsData();
  }, []);

  const loadPaymentsData = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getAll();
      if (response.success) {
        setPayments(response.data || []);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAction = async (paymentId, action, notes = '') => {
    try {
      setLoading(true);
      const response = await paymentsAPI.verify(paymentId, {
        verification_status: action,
        admin_notes: notes
      });
      if (response.success) {
        await loadPaymentsData();
        setShowPaymentModal(false);
        setSelectedPayment(null);
        setApprovalData({ verification_status: '', admin_notes: '' });
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (paymentId) => {
    try {
      setLoading(true);
      // API call to generate invoice
      const response = await paymentsAPI.generateInvoice(paymentId);
      if (response.success) {
        // Download or open invoice
        window.open(response.invoiceUrl, '_blank');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  const viewPaymentDetails = (payment, type = 'view') => {
    setSelectedPayment(payment);
    setModalType(type);
    if (type === 'approve') {
      setApprovalData({ verification_status: 'verified', admin_notes: '' });
    } else if (type === 'reject') {
      setApprovalData({ verification_status: 'rejected', admin_notes: '' });
    }
    setShowPaymentModal(true);
  };

  const getStatusBadgeStyle = (status) => {
    const statusStyles = {
      'pending': { background: '#f59e0b', color: 'white' },
      'completed': { background: '#10b981', color: 'white' },
      'failed': { background: '#ef4444', color: 'white' },
      'cancelled': { background: '#6b7280', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
  };

  const getVerificationBadgeStyle = (status) => {
    const statusStyles = {
      'pending': { background: '#f59e0b', color: 'white' },
      'verified': { background: '#10b981', color: 'white' },
      'rejected': { background: '#ef4444', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
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
    totalAmount: payments.filter(p => p.status === 'completed' && p.verification_status === 'verified').reduce((sum, p) => sum + (p.amount || 0), 0)
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
        {number}
      </h4>
      <small style={{ color: designSystem.colors.gray[500] }}>
        {label}
      </small>
    </div>
  );

  return (
    <div style={componentStyles.managementCard}>
      {/* Header with Refresh Button */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-credit-card fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Payments Management</h4>
            <p style={componentStyles.headerSubtitle}>View and verify client payments, generate invoices</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={loadPaymentsData}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Payment Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-credit-card"
          number={paymentStats.total}
          label="Total Payments"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
        <StatCard
          icon="fas fa-clock"
          number={paymentStats.pending}
          label="Pending Verification"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={paymentStats.verified}
          label="Verified Payments"
          borderColor="#10b981"
          iconColor="#10b981"
        />
        <StatCard
          icon="fas fa-times-circle"
          number={paymentStats.rejected}
          label="Rejected Payments"
          borderColor="#ef4444"
          iconColor="#ef4444"
        />
        <StatCard
          icon="fas fa-dollar-sign"
          number={formatCurrency(paymentStats.totalAmount)}
          label="Verified Revenue"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div style={componentStyles.loading}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
          <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading payments...</p>
        </div>
      )}

      {/* Payments Table */}
      {!loading && (
        <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={componentStyles.tableHeader}>
              <tr>
                <th style={componentStyles.tableHeaderCell}>Payment ID</th>
                <th style={componentStyles.tableHeaderCell}>Client</th>
                <th style={componentStyles.tableHeaderCell}>Service</th>
                <th style={componentStyles.tableHeaderCell}>Amount</th>
                <th style={componentStyles.tableHeaderCell}>Method</th>
                <th style={componentStyles.tableHeaderCell}>Status</th>
                <th style={componentStyles.tableHeaderCell}>Verification</th>
                <th style={componentStyles.tableHeaderCell}>Date</th>
                <th style={componentStyles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="9" style={componentStyles.emptyState}>
                    <i className="fas fa-credit-card fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
                    <p style={{ color: designSystem.colors.gray[500] }}>No payments found in the system</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const statusStyle = getStatusBadgeStyle(payment.status);
                  const verificationStyle = getVerificationBadgeStyle(payment.verification_status);
                  
                  return (
                    <tr 
                      key={payment._id}
                      style={componentStyles.tableRow}
                      {...hoverEffects.tableRow}
                    >
                      <td style={componentStyles.tableCell}>
                        <span 
                          style={{
                            ...componentStyles.badge,
                            background: designSystem.colors.primary,
                            color: 'white',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            fontWeight: '600',
                            padding: '6px 12px'
                          }}
                        >
                          {payment.payment_id || `#${payment._id.slice(-8).toUpperCase()}`}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div>
                          <div style={{ 
                            fontWeight: designSystem.typography.fontWeight.medium,
                            marginBottom: '2px'
                          }}>
                            {payment.client?.name || 
                             (payment.client?.firstName && payment.client?.lastName ? 
                              `${payment.client.firstName} ${payment.client.lastName}` : 
                              'Unknown Client')}
                          </div>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            {payment.client?.email || 'No email'}
                          </small>
                        </div>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <span style={{
                          background: '#8b5cf6',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {payment.service_name || 'Unknown Service'}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div style={{ 
                          fontWeight: designSystem.typography.fontWeight.bold,
                          fontSize: '16px',
                          color: designSystem.colors.success
                        }}>
                          {formatCurrency(payment.amount)}
                        </div>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <span style={{
                          background: designSystem.colors.gray[200],
                          color: designSystem.colors.gray[700],
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {payment.payment_method || 'N/A'}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <span style={{
                          ...componentStyles.badge,
                          background: statusStyle.background,
                          color: statusStyle.color,
                          textTransform: 'uppercase',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {payment.status || 'Pending'}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <span style={{
                          ...componentStyles.badge,
                          background: verificationStyle.background,
                          color: verificationStyle.color,
                          textTransform: 'uppercase',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {payment.verification_status || 'Pending'}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div>
                          <div style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            {new Date(payment.createdAt).toLocaleTimeString()}
                          </small>
                        </div>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => viewPaymentDetails(payment, 'view')}
                            title="View Payment Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {payment.verification_status === 'pending' && (
                            <>
                              <button 
                                className="btn btn-outline-success btn-sm"
                                onClick={() => viewPaymentDetails(payment, 'approve')}
                                title="Approve Payment"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => viewPaymentDetails(payment, 'reject')}
                                title="Reject Payment"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          )}
                          {payment.verification_status === 'verified' && (
                            <button 
                              className="btn btn-outline-info btn-sm"
                              onClick={() => generateInvoice(payment._id)}
                              title="Generate Invoice"
                            >
                              <i className="fas fa-file-invoice"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* No Payments Message */}
      {!loading && payments.length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-credit-card fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>No payments found in the system</h6>
          <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.lg }}>Client payments will appear here once submitted</p>
        </div>
      )}

      {/* Payment Details/Action Modal */}
      {showPaymentModal && selectedPayment && (
        <div 
          className="modal fade show" 
          style={{ 
            display: 'block', 
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1050
          }}
          onClick={() => setShowPaymentModal(false)}
        >
          <div 
            className="modal-dialog modal-lg"
            style={{ 
              position: 'relative',
              width: 'auto',
              margin: '1.75rem auto',
              maxWidth: '900px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="fas fa-credit-card me-2"></i>
                  {modalType === 'view' ? 'Payment Details' : 
                   modalType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowPaymentModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: designSystem.spacing.md }}>
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.gray[500],
                      marginBottom: designSystem.spacing.xs
                    }}>Payment ID</label>
                    <div style={{ 
                      fontWeight: designSystem.typography.fontWeight.semibold,
                      fontFamily: 'monospace',
                      fontSize: designSystem.typography.fontSize.lg,
                      color: designSystem.colors.primary
                    }}>
                      {selectedPayment.payment_id || `#${selectedPayment._id.slice(-8).toUpperCase()}`}
                    </div>
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.gray[500],
                      marginBottom: designSystem.spacing.xs
                    }}>Amount</label>
                    <div style={{ 
                      fontWeight: designSystem.typography.fontWeight.bold,
                      fontSize: designSystem.typography.fontSize.xl,
                      color: designSystem.colors.success
                    }}>
                      {formatCurrency(selectedPayment.amount)}
                    </div>
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.gray[500],
                      marginBottom: designSystem.spacing.xs
                    }}>Client Information</label>
                    <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                      <div>{selectedPayment.client?.name || 
                       (selectedPayment.client?.firstName && selectedPayment.client?.lastName ? 
                        `${selectedPayment.client.firstName} ${selectedPayment.client.lastName}` : 
                        'Unknown Client')}</div>
                      <small style={{ color: designSystem.colors.gray[500], fontWeight: 'normal' }}>
                        {selectedPayment.client?.email || 'No email'}
                      </small>
                    </div>
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.gray[500],
                      marginBottom: designSystem.spacing.xs
                    }}>Service & Method</label>
                    <div style={{ display: 'flex', gap: designSystem.spacing.sm, alignItems: 'center' }}>
                      <span style={{
                        background: '#8b5cf6',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {selectedPayment.service_name || 'Unknown Service'}
                      </span>
                      <span style={{
                        background: designSystem.colors.gray[200],
                        color: designSystem.colors.gray[700],
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {selectedPayment.payment_method || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.gray[500],
                      marginBottom: designSystem.spacing.xs
                    }}>Status</label>
                    <div style={{ display: 'flex', gap: designSystem.spacing.sm, alignItems: 'center' }}>
                      <span style={{
                        background: getStatusBadgeStyle(selectedPayment.status).background,
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        fontWeight: '600'
                      }}>
                        {selectedPayment.status || 'Pending'}
                      </span>
                      <span style={{
                        background: getVerificationBadgeStyle(selectedPayment.verification_status).background,
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        fontWeight: '600'
                      }}>
                        {selectedPayment.verification_status || 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.gray[500],
                      marginBottom: designSystem.spacing.xs
                    }}>Transaction Details</label>
                    <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                      <div>ID: {selectedPayment.transaction_id || 'N/A'}</div>
                      <small style={{ color: designSystem.colors.gray[500], fontWeight: 'normal' }}>
                        {new Date(selectedPayment.createdAt).toLocaleString()}
                      </small>
                    </div>
                  </div>
                  
                  {/* Payment Screenshot */}
                  {selectedPayment.receipt_screenshot && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ 
                        display: 'block',
                        fontSize: designSystem.typography.fontSize.sm,
                        color: designSystem.colors.gray[500],
                        marginBottom: designSystem.spacing.xs
                      }}>Payment Receipt Screenshot</label>
                      <div style={{ 
                        textAlign: 'center',
                        border: `2px solid ${designSystem.colors.gray[200]}`,
                        borderRadius: '8px',
                        padding: designSystem.spacing.md,
                        background: designSystem.colors.gray[50]
                      }}>
                        <img 
                          src={`/uploads/payment-receipts/${selectedPayment.receipt_screenshot}`}
                          alt="Payment Receipt"
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '400px',
                            borderRadius: '8px',
                            boxShadow: designSystem.shadows.card
                          }}
                          onClick={() => window.open(`/uploads/payment-receipts/${selectedPayment.receipt_screenshot}`, '_blank')}
                        />
                        <p style={{ 
                          marginTop: designSystem.spacing.sm, 
                          color: designSystem.colors.gray[500],
                          fontSize: designSystem.typography.fontSize.sm
                        }}>
                          Click image to view full size
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Admin Notes Section for Approval/Rejection */}
                  {(modalType === 'approve' || modalType === 'reject') && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ 
                        display: 'block',
                        fontSize: designSystem.typography.fontSize.sm,
                        color: designSystem.colors.gray[500],
                        marginBottom: designSystem.spacing.xs
                      }}>Admin Notes</label>
                      <textarea
                        style={{
                          ...componentStyles.formInput,
                          width: '100%',
                          minHeight: '100px',
                          resize: 'vertical'
                        }}
                        value={approvalData.admin_notes}
                        onChange={(e) => setApprovalData({ ...approvalData, admin_notes: e.target.value })}
                        placeholder={`Add notes for ${modalType === 'approve' ? 'approving' : 'rejecting'} this payment...`}
                      />
                    </div>
                  )}

                  {/* Previous Admin Notes */}
                  {selectedPayment.admin_notes && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ 
                        display: 'block',
                        fontSize: designSystem.typography.fontSize.sm,
                        color: designSystem.colors.gray[500],
                        marginBottom: designSystem.spacing.xs
                      }}>Previous Admin Notes</label>
                      <div style={{ 
                        background: designSystem.colors.gray[50],
                        padding: designSystem.spacing.md,
                        borderRadius: '8px',
                        border: `1px solid ${designSystem.colors.gray[200]}`,
                        fontStyle: 'italic'
                      }}>
                        {selectedPayment.admin_notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowPaymentModal(false)}
                >
                  {modalType === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalType === 'approve' && (
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => handlePaymentAction(selectedPayment._id, 'verified', approvalData.admin_notes)}
                    disabled={loading}
                  >
                    {loading ? 'Approving...' : 'Approve Payment'}
                  </button>
                )}
                {modalType === 'reject' && (
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handlePaymentAction(selectedPayment._id, 'rejected', approvalData.admin_notes)}
                    disabled={loading}
                  >
                    {loading ? 'Rejecting...' : 'Reject Payment'}
                  </button>
                )}
                {modalType === 'view' && selectedPayment.verification_status === 'verified' && (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => generateInvoice(selectedPayment._id)}
                    disabled={loading}
                  >
                    <i className="fas fa-file-invoice me-2"></i>
                    Generate Invoice
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsManagement;