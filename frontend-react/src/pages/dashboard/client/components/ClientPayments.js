import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects, getStatusBadgeStyle } from '../../../../styles/designSystem';

const ClientPayments = ({ clientData, apiCall, onRefresh }) => {
  const [purchasedServices, setPurchasedServices] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
    totalAmount: 0,
    paidAmount: 0
  });

  useEffect(() => {
    loadPurchasedServices();
  }, []);

  const loadPurchasedServices = async () => {
    setLoading(true);
    try {
      // Load projects (purchased services) for this client
      const response = await apiCall('/projects?client=' + clientData?._id);
      if (response.success) {
        const services = response.data || [];
        setPurchasedServices(services);
        
        // Calculate stats
        const stats = {
          total: services.length,
          pending: services.filter(s => s.status === 'pending').length,
          confirmed: services.filter(s => s.status === 'active' || s.status === 'in_progress' || s.status === 'completed').length,
          rejected: services.filter(s => s.status === 'cancelled').length,
          totalAmount: services.reduce((sum, s) => sum + (s.amount || 0), 0),
          paidAmount: services.filter(s => s.status !== 'pending' && s.status !== 'cancelled').reduce((sum, s) => sum + (s.amount || 0), 0)
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error loading purchased services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredServices = () => {
    if (activeTab === 'all') return purchasedServices;
    return purchasedServices.filter(service => {
      switch (activeTab) {
        case 'pending':
          return service.status === 'pending';
        case 'confirmed':
          return service.status === 'active' || service.status === 'in_progress' || service.status === 'completed';
        case 'rejected':
          return service.status === 'cancelled';
        default:
          return true;
      }
    });
  };

  const getPaymentStatusStyle = (status) => {
    const statusStyles = {
      'pending': { background: '#f59e0b', color: 'white' },
      'active': { background: '#10b981', color: 'white' },
      'in_progress': { background: '#3b82f6', color: 'white' },
      'completed': { background: '#10b981', color: 'white' },
      'cancelled': { background: '#ef4444', color: 'white' },
      'on_hold': { background: '#6b7280', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
  };

  const getStatusDisplayText = (status) => {
    const statusText = {
      'pending': 'Payment Pending',
      'active': 'Payment Confirmed',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Payment Rejected',
      'on_hold': 'On Hold'
    };
    return statusText[status] || status;
  };

  // Overview Stats Cards Component
  const StatsCard = ({ icon, number, label, color, bgColor }) => (
    <div style={{
      ...componentStyles.managementCard,
      margin: 0,
      padding: designSystem.spacing.lg,
      background: bgColor,
      border: `2px solid ${color}`,
      textAlign: 'center',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <i className={`${icon} fa-2x`} style={{ color: color, marginBottom: designSystem.spacing.sm }}></i>
      <h3 style={{ 
        color: color, 
        fontWeight: designSystem.typography.fontWeight.bold,
        marginBottom: '4px',
        fontSize: designSystem.typography.fontSize.xl
      }}>
        {typeof number === 'number' && number > 999 ? `$${(number/1000).toFixed(1)}k` : number}
      </h3>
      <small style={{ color: designSystem.colors.gray[600], fontWeight: designSystem.typography.fontWeight.medium }}>
        {label}
      </small>
    </div>
  );

  const ServicePaymentCard = ({ service }) => (
    <div
      style={{
        ...componentStyles.managementCard,
        margin: 0,
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      {...hoverEffects.card}
      onClick={() => {
        setSelectedService(service);
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
              #{service._id.slice(-8).toUpperCase()}
            </span>
            <span style={{
              ...componentStyles.badge,
              ...getPaymentStatusStyle(service.status),
              textTransform: 'uppercase',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {getStatusDisplayText(service.status)}
            </span>
          </div>
          
          <h6 style={{
            color: designSystem.colors.dark,
            fontWeight: designSystem.typography.fontWeight.semibold,
            marginBottom: designSystem.spacing.sm
          }}>
            {service.service_name || 'Service Purchase'}
          </h6>
          
          <div style={{
            fontSize: designSystem.typography.fontSize.sm,
            color: designSystem.colors.gray[600],
            marginBottom: designSystem.spacing.sm
          }}>
            Payment Method: {service.payment_method?.replace('_', ' ').toUpperCase() || 'Not Specified'}
          </div>
          
          {service.payment_receipt && (
            <div style={{
              fontSize: designSystem.typography.fontSize.sm,
              color: designSystem.colors.gray[600],
              marginBottom: designSystem.spacing.sm
            }}>
              <i className="fas fa-receipt me-2"></i>
              Receipt Uploaded
            </div>
          )}

          <div style={{
            fontSize: designSystem.typography.fontSize.sm,
            color: designSystem.colors.gray[600]
          }}>
            Purchased: {new Date(service.purchase_date || service.createdAt).toLocaleDateString()}
          </div>
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
            ${service.amount?.toLocaleString() || '0'}
          </div>
          {service.status === 'pending' && (
            <div style={{
              fontSize: designSystem.typography.fontSize.xs,
              color: designSystem.colors.warning.split('(')[0],
              fontWeight: designSystem.typography.fontWeight.medium
            }}>
              Awaiting Confirmation
            </div>
          )}
        </div>
      </div>

      {service.description && (
        <p style={{
          fontSize: designSystem.typography.fontSize.sm,
          color: designSystem.colors.gray[600],
          margin: 0,
          fontStyle: 'italic'
        }}>
          {service.description}
        </p>
      )}
    </div>
  );

  const ServiceDetailModal = () => (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-receipt me-2"></i>
              Service Payment Details
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowModal(false)}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {selectedService && (
              <>
                <div style={{ marginBottom: designSystem.spacing.lg }}>
                  <h6 style={{ marginBottom: designSystem.spacing.md }}>Service Information</h6>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: designSystem.spacing.md,
                    padding: designSystem.spacing.md,
                    background: designSystem.colors.light,
                    borderRadius: designSystem.borderRadius.button
                  }}>
                    <div>
                      <strong>Service:</strong><br />
                      {selectedService.service_name}
                    </div>
                    <div>
                      <strong>Amount:</strong><br />
                      ${selectedService.amount?.toLocaleString()}
                    </div>
                    <div>
                      <strong>Payment Method:</strong><br />
                      {selectedService.payment_method?.replace('_', ' ').toUpperCase()}
                    </div>
                    <div>
                      <strong>Status:</strong><br />
                      <span style={{
                        ...componentStyles.badge,
                        ...getPaymentStatusStyle(selectedService.status)
                      }}>
                        {getStatusDisplayText(selectedService.status)}
                      </span>
                    </div>
                    <div>
                      <strong>Purchase Date:</strong><br />
                      {new Date(selectedService.purchase_date || selectedService.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Receipt:</strong><br />
                      {selectedService.payment_receipt ? (
                        <span style={{ color: designSystem.colors.success.split('(')[0] }}>
                          <i className="fas fa-check me-2"></i>Uploaded
                        </span>
                      ) : (
                        <span style={{ color: designSystem.colors.gray[500] }}>
                          <i className="fas fa-times me-2"></i>Not uploaded
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedService.description && (
                  <div style={{ marginBottom: designSystem.spacing.lg }}>
                    <h6 style={{ marginBottom: designSystem.spacing.md }}>Description</h6>
                    <p style={{
                      padding: designSystem.spacing.md,
                      background: designSystem.colors.light,
                      borderRadius: designSystem.borderRadius.button,
                      margin: 0
                    }}>
                      {selectedService.description}
                    </p>
                  </div>
                )}

                <div style={{
                  background: designSystem.colors.light,
                  padding: designSystem.spacing.md,
                  borderRadius: designSystem.borderRadius.button
                }}>
                  <p style={{ 
                    margin: 0,
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[600]
                  }}>
                    <i className="fas fa-info-circle me-2"></i>
                    {selectedService.status === 'pending' 
                      ? 'Your payment is being reviewed by our team. You will be notified once it is confirmed.'
                      : selectedService.status === 'active' || selectedService.status === 'in_progress'
                      ? 'Your payment has been confirmed and the service is being processed.'
                      : selectedService.status === 'completed'
                      ? 'Service completed successfully.'
                      : 'Please contact support for more information about this service.'
                    }
                  </p>
                </div>
              </>
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

  if (loading) {
    return (
      <div style={componentStyles.loading}>
        <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
        <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>
          Loading payment status...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Refresh Button */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-credit-card fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Payment Status</h4>
            <p style={componentStyles.headerSubtitle}>Track your service purchases and payment confirmations</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.primary
          }}
          onClick={() => {
            loadPurchasedServices();
            onRefresh?.();
          }}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Overview Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: designSystem.spacing.lg,
        marginBottom: designSystem.spacing.xl
      }}>
        <StatsCard
          icon="fas fa-shopping-bag"
          number={stats.total}
          label="Total Purchases"
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatsCard
          icon="fas fa-clock"
          number={stats.pending}
          label="Pending Confirmation"
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <StatsCard
          icon="fas fa-check-circle"
          number={stats.confirmed}
          label="Confirmed Payments"
          color="#10b981"
          bgColor="#ecfdf5"
        />
        <StatsCard
          icon="fas fa-dollar-sign"
          number={`$${stats.totalAmount.toLocaleString()}`}
          label="Total Amount"
          color="#8b5cf6"
          bgColor="#faf5ff"
        />
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: designSystem.spacing.lg }}>
        <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'all' ? designSystem.colors.primary : designSystem.colors.gray[100],
              color: activeTab === 'all' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('all')}
            {...hoverEffects.button}
          >
            All Purchases ({stats.total})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'pending' ? designSystem.colors.warning : designSystem.colors.gray[100],
              color: activeTab === 'pending' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('pending')}
            {...hoverEffects.button}
          >
            Pending ({stats.pending})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'confirmed' ? designSystem.colors.success : designSystem.colors.gray[100],
              color: activeTab === 'confirmed' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('confirmed')}
            {...hoverEffects.button}
          >
            Confirmed ({stats.confirmed})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'rejected' ? designSystem.colors.danger : designSystem.colors.gray[100],
              color: activeTab === 'rejected' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('rejected')}
            {...hoverEffects.button}
          >
            Rejected ({stats.rejected})
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: designSystem.spacing.lg
      }}>
        {getFilteredServices().map(service => (
          <ServicePaymentCard
            key={service._id}
            service={service}
          />
        ))}
      </div>

      {getFilteredServices().length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-credit-card fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
          <p style={{ color: designSystem.colors.gray[500] }}>
            {activeTab === 'all' ? 'No service purchases yet' : `No ${activeTab} payments found`}
          </p>
          {activeTab === 'all' && (
            <p style={{ color: designSystem.colors.gray[500], fontSize: designSystem.typography.fontSize.sm }}>
              Purchase services from the Services section to see them here
            </p>
          )}
        </div>
      )}

      {/* Service Detail Modal */}
      {showModal && <ServiceDetailModal />}
    </div>
  );
};

export default ClientPayments;