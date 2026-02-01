import { useState, useEffect } from 'react';
import { paymentsAPI, servicesAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    loadPayments();
    loadServices();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // Get payments for projects assigned to current CRM manager
      const response = await paymentsAPI.getMyPayments();
      
      if (response.success) {
        setPayments(response.data || []);
      } else {
        throw new Error(response.error?.message || 'Failed to load payments');
      }

    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      if (response.success) {
        setServices(response.data || []);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    }
  };

  // Filter payments by status
  const getFilteredPayments = (status) => {
    if (status === 'all') return payments;
    return payments.filter(payment => {
      switch (status) {
        case 'pending':
          return payment.status === 'pending' || payment.status === 'pending_verification';
        case 'completed':
          return payment.status === 'completed';
        case 'failed':
          return payment.status === 'failed';
        case 'refunded':
          return payment.status === 'refunded';
        case 'waiting_approval':
          return payment.status === 'pending_verification';
        default:
          return true;
      }
    });
  };

  // Get payment counts for stats
  const getPaymentCounts = () => {
    return {
      total: payments.length,
      pending: payments.filter(payment => payment.status === 'pending' || payment.status === 'pending_verification').length,
      completed: payments.filter(payment => payment.status === 'completed').length,
      failed: payments.filter(payment => payment.status === 'failed').length,
      waitingApproval: payments.filter(payment => payment.status === 'pending_verification').length,
      totalAmount: payments.filter(payment => payment.status === 'completed').reduce((sum, payment) => sum + (payment.amount || 0), 0)
    };
  };

  const getStatusBadgeStyle = (status) => {
    const statusStyles = {
      'pending': { background: '#f59e0b', color: 'white' },
      'pending_verification': { background: '#8b5cf6', color: 'white' },
      'completed': { background: '#10b981', color: 'white' },
      'failed': { background: '#ef4444', color: 'white' },
      'refunded': { background: '#6b7280', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
  };

  const getPaymentMethodStyle = (method) => {
    const methodColors = {
      'credit_card': '#3b82f6',
      'bank_transfer': '#10b981',
      'paypal': '#f59e0b',
      'stripe': '#8b5cf6',
      'cash': '#ef4444',
      'check': '#6b7280',
      'upi': '#06b6d4',
      'online': '#3b82f6'
    };
    return { background: methodColors[method] || '#6b7280', color: 'white' };
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalData(null);
    setModalType('');
  };

  const viewPaymentDetails = (payment) => {
    setModalData(payment);
    setModalType('view');
    setShowModal(true);
  };

  const proceedToPay = (service) => {
    setModalData(service);
    setModalType('pay');
    setShowModal(true);
  };

  const viewServices = () => {
    setModalData(null);
    setModalType('services');
    setShowModal(true);
  };

  const handleSubmitPayment = async (paymentData) => {
    try {
      const response = await paymentsAPI.create(paymentData);
      if (response.success) {
        loadPayments(); // Refresh the list
        handleModalClose();
        alert('Payment submitted successfully! Please wait for admin approval.');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Failed to submit payment. Please try again.');
    }
  };

  const StatCard = ({ icon, number, label, borderColor, iconColor, onClick }) => (
    <div 
      style={{
        ...componentStyles.contactsStatCard,
        borderColor: borderColor,
        cursor: 'pointer'
      }}
      {...hoverEffects.card}
      onClick={onClick}
    >
      <i className={`${icon} fa-2x mb-2`} style={{ color: iconColor }}></i>
      <h4 style={{ 
        color: iconColor,
        fontWeight: designSystem.typography.fontWeight.bold,
        marginBottom: '4px'
      }}>
        {typeof number === 'number' && number > 1000 ? `$${number.toLocaleString()}` : number}
      </h4>
      <small style={{ color: designSystem.colors.gray[500] }}>
        {label}
      </small>
    </div>
  );

  const renderPaymentTable = (paymentType) => {
    const filteredPayments = getFilteredPayments(paymentType);
    
    if (filteredPayments.length === 0) {
      return (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-credit-card fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
          <p style={{ color: designSystem.colors.gray[500] }}>
            No {paymentType === 'all' ? '' : paymentType} payments found
          </p>
        </div>
      );
    }

    return (
      <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={componentStyles.tableHeader}>
            <tr>
              <th style={componentStyles.tableHeaderCell}>Transaction ID</th>
              <th style={componentStyles.tableHeaderCell}>Project/Service</th>
              <th style={componentStyles.tableHeaderCell}>Amount</th>
              <th style={componentStyles.tableHeaderCell}>Method</th>
              <th style={componentStyles.tableHeaderCell}>Status</th>
              <th style={componentStyles.tableHeaderCell}>Date</th>
              <th style={componentStyles.tableHeaderCell}>Admin Approval</th>
              <th style={componentStyles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map(payment => {
              const statusStyle = getStatusBadgeStyle(payment.status);
              const methodStyle = getPaymentMethodStyle(payment.paymentMethod || 'other');
              
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
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '4px 8px'
                      }}
                    >
                      {payment.transactionId || `#${payment._id.slice(-8).toUpperCase()}`}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <div>
                      <div style={{ 
                        fontWeight: designSystem.typography.fontWeight.medium,
                        marginBottom: '2px'
                      }}>
                        {payment.project?.project_id || payment.service?.name || 'Unknown'}
                      </div>
                      <small style={{ color: designSystem.colors.gray[500] }}>
                        {payment.project ? 'Project Payment' : 'Service Payment'}
                      </small>
                    </div>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <div style={{ 
                      fontWeight: designSystem.typography.fontWeight.bold,
                      fontSize: '16px',
                      color: '#10b981'
                    }}>
                      ${payment.amount?.toLocaleString() || '0'}
                    </div>
                    <small style={{ color: designSystem.colors.gray[500] }}>
                      {payment.currency || 'USD'}
                    </small>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <span style={{
                      ...componentStyles.badge,
                      background: methodStyle.background,
                      color: methodStyle.color,
                      textTransform: 'capitalize',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {payment.paymentMethod?.replace('_', ' ') || 'Unknown'}
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
                      {payment.status?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>
                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 
                         new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                      <small style={{ color: designSystem.colors.gray[500] }}>
                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleTimeString() : 
                         new Date(payment.createdAt).toLocaleTimeString()}
                      </small>
                    </div>
                  </td>
                  <td style={componentStyles.tableCell}>
                    {payment.status === 'pending_verification' ? (
                      <div>
                        <span style={{
                          ...componentStyles.badge,
                          background: '#f59e0b',
                          color: 'white',
                          fontSize: '10px'
                        }}>
                          WAITING
                        </span>
                        <div style={{ marginTop: '4px' }}>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            Admin Review
                          </small>
                        </div>
                      </div>
                    ) : payment.status === 'completed' ? (
                      <div>
                        <span style={{
                          ...componentStyles.badge,
                          background: '#10b981',
                          color: 'white',
                          fontSize: '10px'
                        }}>
                          APPROVED
                        </span>
                        <div style={{ marginTop: '4px' }}>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            {payment.verified_by ? 'By Admin' : 'Verified'}
                          </small>
                        </div>
                      </div>
                    ) : payment.status === 'failed' ? (
                      <div>
                        <span style={{
                          ...componentStyles.badge,
                          background: '#ef4444',
                          color: 'white',
                          fontSize: '10px'
                        }}>
                          REJECTED
                        </span>
                        <div style={{ marginTop: '4px' }}>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            By Admin
                          </small>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: designSystem.colors.gray[500], fontStyle: 'italic' }}>
                        N/A
                      </span>
                    )}
                  </td>
                  <td style={componentStyles.tableCell}>
                    <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => viewPaymentDetails(payment)}
                        title="View Payment Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {payment.receipt_screenshot && (
                        <button 
                          className="btn btn-outline-info btn-sm"
                          onClick={() => window.open(payment.receipt_screenshot, '_blank')}
                          title="View Receipt"
                        >
                          <i className="fas fa-receipt"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={componentStyles.managementCard}>
      {/* Header with View Services and Refresh Buttons */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-credit-card fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Payment Status</h4>
            <p style={componentStyles.headerSubtitle}>View payment status for assigned projects and services</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: '#10b981'
            }}
            onClick={viewServices}
            {...hoverEffects.button}
          >
            <i className="fas fa-shopping-cart me-2"></i>View Services
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.success
            }}
            onClick={loadPayments}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>
      </div>

      {/* Overview Statistics */}
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
          label="Pending Payments"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={getPaymentCounts().completed}
          label="Completed"
          borderColor="#10b981"
          iconColor="#10b981"
        />
        <StatCard
          icon="fas fa-hourglass-half"
          number={getPaymentCounts().waitingApproval}
          label="Waiting Approval"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
        <StatCard
          icon="fas fa-dollar-sign"
          number={getPaymentCounts().totalAmount}
          label="Total Received"
          borderColor="#06b6d4"
          iconColor="#06b6d4"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div style={componentStyles.loading}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
          <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading payments...</p>
        </div>
      )}

      {/* Payment Type Tabs */}
      {!loading && (
        <>
          <div style={{ marginBottom: designSystem.spacing.lg }}>
            <div style={{ display: 'flex', gap: designSystem.spacing.xs, flexWrap: 'wrap' }}>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: activeTab === 'all' ? designSystem.colors.primary : designSystem.colors.gray[100],
                  color: activeTab === 'all' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'all' ? designSystem.shadows.button : 'none'
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
                  color: activeTab === 'pending' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'pending' ? designSystem.shadows.button : 'none'
                }}
                onClick={() => setActiveTab('pending')}
                {...hoverEffects.button}
              >
                Pending ({getPaymentCounts().pending})
              </button>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: activeTab === 'completed' ? '#10b981' : designSystem.colors.gray[100],
                  color: activeTab === 'completed' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'completed' ? designSystem.shadows.button : 'none'
                }}
                onClick={() => setActiveTab('completed')}
                {...hoverEffects.button}
              >
                Completed ({getPaymentCounts().completed})
              </button>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: activeTab === 'waiting_approval' ? '#8b5cf6' : designSystem.colors.gray[100],
                  color: activeTab === 'waiting_approval' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'waiting_approval' ? designSystem.shadows.button : 'none'
                }}
                onClick={() => setActiveTab('waiting_approval')}
                {...hoverEffects.button}
              >
                Waiting Approval ({getPaymentCounts().waitingApproval})
              </button>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: activeTab === 'failed' ? '#ef4444' : designSystem.colors.gray[100],
                  color: activeTab === 'failed' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'failed' ? designSystem.shadows.button : 'none'
                }}
                onClick={() => setActiveTab('failed')}
                {...hoverEffects.button}
              >
                Failed/Rejected
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {renderPaymentTable(activeTab)}
          </div>
        </>
      )}

      {/* No Payments Message */}
      {!loading && payments.length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-credit-card fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>No payments found</h6>
          <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.lg }}>Payment records for your projects will appear here</p>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: '#10b981'
            }}
            onClick={viewServices}
            {...hoverEffects.button}
          >
            <i className="fas fa-shopping-cart me-2"></i>View Available Services
          </button>
        </div>
      )}

      {/* Payment Modal */}
      {showModal && (
        <PaymentModal
          show={showModal}
          onHide={handleModalClose}
          type={modalType}
          data={modalData}
          services={services}
          onSubmitPayment={handleSubmitPayment}
          onProceedToPay={proceedToPay}
        />
      )}
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ show, onHide, type, data, services, onSubmitPayment, onProceedToPay }) => {
  const [formData, setFormData] = useState({
    service_id: data?._id || '',
    amount: data?.minPrice || '',
    paymentMethod: 'bank_transfer',
    transactionId: '',
    receipt_screenshot: null,
    notes: ''
  });

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (type === 'pay') {
      if (!formData.amount || !formData.paymentMethod) {
        alert('Please fill in all required fields.');
        return;
      }
      
      if (formData.paymentMethod === 'cash' && !formData.receipt_screenshot) {
        alert('Please upload a receipt screenshot for cash payments.');
        return;
      }

      const paymentData = {
        ...formData,
        service_id: data._id,
        status: formData.paymentMethod === 'cash' ? 'pending_verification' : 'pending'
      };

      onSubmitPayment(paymentData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload this to a server
      // For now, we'll just store the file reference
      setFormData(prev => ({
        ...prev,
        receipt_screenshot: file
      }));
    }
  };

  return (
    <div className="modal" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className={`fas ${type === 'services' ? 'fa-shopping-cart' : type === 'pay' ? 'fa-credit-card' : 'fa-eye'} me-2`}></i>
              {type === 'services' ? 'Available Services' : type === 'pay' ? 'Proceed to Payment' : 'Payment Details'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {type === 'services' ? (
              <div>
                <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                  Services Created by Admin
                </h6>
                {services.length === 0 ? (
                  <div style={componentStyles.emptyState}>
                    <i className="fas fa-shopping-cart fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
                    <p style={{ color: designSystem.colors.gray[500] }}>No services available</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {services.map(service => (
                      <div 
                        key={service._id}
                        style={{
                          border: `1px solid ${designSystem.colors.gray[200]}`,
                          borderRadius: designSystem.borderRadius.button,
                          padding: designSystem.spacing.md,
                          marginBottom: designSystem.spacing.md,
                          background: 'white'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <h6 style={{ color: designSystem.colors.dark, marginBottom: '8px' }}>
                              {service.name}
                            </h6>
                            <p style={{ 
                              color: designSystem.colors.gray[600], 
                              fontSize: '14px',
                              marginBottom: '12px'
                            }}>
                              {service.description}
                            </p>
                            <div style={{ display: 'flex', gap: designSystem.spacing.md, alignItems: 'center' }}>
                              <span style={{
                                background: '#8b5cf6',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                {service.category}
                              </span>
                              <span style={{ 
                                fontWeight: '600',
                                color: '#10b981',
                                fontSize: '16px'
                              }}>
                                ${service.minPrice} - ${service.maxPrice}
                              </span>
                            </div>
                          </div>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => onProceedToPay(service)}
                            style={{ marginLeft: designSystem.spacing.md }}
                          >
                            <i className="fas fa-credit-card me-1"></i>
                            Pay Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : type === 'pay' ? (
              <div>
                <div className="mb-4">
                  <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                    Service Details
                  </h6>
                  <div style={{
                    background: designSystem.colors.gray[50],
                    padding: designSystem.spacing.md,
                    borderRadius: designSystem.borderRadius.button,
                    border: `1px solid ${designSystem.colors.gray[200]}`
                  }}>
                    <h6>{data.name}</h6>
                    <p style={{ color: designSystem.colors.gray[600], marginBottom: '8px' }}>
                      {data.description}
                    </p>
                    <div style={{ display: 'flex', gap: designSystem.spacing.md, alignItems: 'center' }}>
                      <span style={{
                        background: '#8b5cf6',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {data.category}
                      </span>
                      <span style={{ 
                        fontWeight: '600',
                        color: '#10b981',
                        fontSize: '16px'
                      }}>
                        Price Range: ${data.minPrice} - ${data.maxPrice}
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label"><strong>Payment Amount *</strong></label>
                        <input 
                          type="number"
                          className="form-control"
                          value={formData.amount}
                          onChange={(e) => handleInputChange('amount', e.target.value)}
                          placeholder="Enter payment amount"
                          min={data.minPrice}
                          max={data.maxPrice}
                          required
                        />
                        <small className="form-text text-muted">
                          Amount should be between ${data.minPrice} - ${data.maxPrice}
                        </small>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label"><strong>Payment Method *</strong></label>
                        <select 
                          className="form-select"
                          value={formData.paymentMethod}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                          required
                        >
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="credit_card">Credit Card</option>
                          <option value="paypal">PayPal</option>
                          <option value="stripe">Stripe</option>
                          <option value="cash">Cash</option>
                          <option value="check">Check</option>
                          <option value="upi">UPI</option>
                          <option value="online">Online Payment</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label"><strong>Transaction ID</strong></label>
                        <input 
                          type="text"
                          className="form-control"
                          value={formData.transactionId}
                          onChange={(e) => handleInputChange('transactionId', e.target.value)}
                          placeholder="Enter transaction ID (if available)"
                        />
                      </div>
                      
                      {formData.paymentMethod === 'cash' && (
                        <div className="mb-3">
                          <label className="form-label"><strong>Receipt Screenshot *</strong></label>
                          <input 
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={handleFileUpload}
                            required
                          />
                          <small className="form-text text-muted">
                            Upload a screenshot of your payment receipt for verification
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label"><strong>Notes</strong></label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Enter any additional notes..."
                    />
                  </div>

                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Note:</strong> Your payment will be submitted for admin approval. 
                    {formData.paymentMethod === 'cash' && ' Cash payments require receipt verification.'}
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <div className="row">
                  <div className="col-md-6">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Payment Information
                    </h6>
                    <p><strong>Transaction ID:</strong> {data.transactionId || `#${data._id.slice(-8).toUpperCase()}`}</p>
                    <p><strong>Amount:</strong> ${data.amount?.toLocaleString() || '0'} {data.currency || 'USD'}</p>
                    <p><strong>Method:</strong> {data.paymentMethod?.replace('_', ' ') || 'Unknown'}</p>
                    <p><strong>Status:</strong> {data.status?.replace('_', ' ') || 'Unknown'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Project/Service Details
                    </h6>
                    <p><strong>Type:</strong> {data.project ? 'Project Payment' : 'Service Payment'}</p>
                    <p><strong>Name:</strong> {data.project?.project_id || data.service?.name || 'Unknown'}</p>
                    <p><strong>Date:</strong> {data.paymentDate ? new Date(data.paymentDate).toLocaleString() : new Date(data.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                {data.notes && (
                  <div className="mb-3">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Notes
                    </h6>
                    <div style={{
                      background: designSystem.colors.gray[50],
                      padding: designSystem.spacing.md,
                      borderRadius: designSystem.borderRadius.button,
                      border: `1px solid ${designSystem.colors.gray[200]}`
                    }}>
                      {data.notes}
                    </div>
                  </div>
                )}

                {data.admin_notes && (
                  <div className="mb-3">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Admin Notes
                    </h6>
                    <div style={{
                      background: '#fef3c7',
                      padding: designSystem.spacing.md,
                      borderRadius: designSystem.borderRadius.button,
                      border: '1px solid #fbbf24'
                    }}>
                      {data.admin_notes}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Close
            </button>
            {type === 'pay' && (
              <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                <i className="fas fa-credit-card me-2"></i>
                Submit Payment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsManagement;