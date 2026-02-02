import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects, getStatusBadgeStyle } from '../../../../styles/designSystem';

const ClientServices = ({ clientData, apiCall, onRefresh }) => {
  const [services, setServices] = useState([]);
  const [purchasedServices, setPurchasedServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'purchased'
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState('single'); // 'single' or 'multiple'
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [stats, setStats] = useState({
    totalServices: 0,
    purchasedServices: 0,
    totalSpent: 0,
    activeProjects: 0
  });

  useEffect(() => {
    loadServices();
    loadPurchasedServices();
    loadStats();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/services/public');
      if (response.success) {
        setServices(response.data || []);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPurchasedServices = async () => {
    try {
      const response = await apiCall('/projects?client=' + clientData._id);
      if (response.success) {
        setPurchasedServices(response.data || []);
      }
    } catch (error) {
      console.error('Error loading purchased services:', error);
    }
  };

  const loadStats = async () => {
    try {
      const [servicesRes, projectsRes, paymentsRes] = await Promise.all([
        apiCall('/services/public'),
        apiCall('/projects?client=' + clientData._id),
        apiCall('/payments?client=' + clientData._id)
      ]);

      const totalServices = servicesRes.success ? servicesRes.data.length : 0;
      const purchasedServices = projectsRes.success ? projectsRes.data.length : 0;
      const activeProjects = projectsRes.success ? projectsRes.data.filter(p => p.status === 'active' || p.status === 'in_progress').length : 0;
      const totalSpent = paymentsRes.success ? paymentsRes.data.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;

      setStats({
        totalServices,
        purchasedServices,
        totalSpent,
        activeProjects
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedServices(prev => {
      const isSelected = prev.find(s => s._id === service._id);
      if (isSelected) {
        return prev.filter(s => s._id !== service._id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handlePurchase = (service, type = 'single') => {
    if (type === 'single') {
      setSelectedServices([service]);
    }
    setPurchaseType(type);
    setShowPurchaseModal(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentReceipt(file);
    }
  };

  const processPurchase = async () => {
    try {
      console.log('🛒 Client data:', clientData);
      console.log('🛒 Selected services:', selectedServices);
      
      // For now, let's try without file upload to test the basic functionality
      if (paymentReceipt) {
        const formData = new FormData();
        
        const purchaseData = {
          services: selectedServices.map(s => s._id),
          client: clientData?._id, // Optional - backend can find by email if not provided
          type: purchaseType,
          total_amount: selectedServices.reduce((sum, s) => sum + (s.pricing?.minPrice || 0), 0),
          payment_method: paymentMethod
        };

        console.log('🛒 Purchase data being sent:', purchaseData);

        formData.append('purchaseData', JSON.stringify(purchaseData));
        formData.append('paymentReceipt', paymentReceipt);

        // Make a direct fetch call to handle FormData properly
        const token = localStorage.getItem('token') || localStorage.getItem('client_token');
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/projects/purchase`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // Don't set Content-Type for FormData - browser will set it with boundary
          },
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          alert('Services purchased successfully! Your payment is being reviewed by our team. You can track the status in the Payment Status section.');
          setShowPurchaseModal(false);
          setSelectedServices([]);
          setPaymentReceipt(null);
          loadPurchasedServices();
          loadStats();
          onRefresh?.();
        } else {
          throw new Error(result.message || result.error?.message || 'Purchase failed');
        }
      } else {
        // No file upload - use regular JSON
        const purchaseData = {
          services: selectedServices.map(s => s._id),
          client: clientData?._id, // Optional - backend can find by email if not provided
          type: purchaseType,
          total_amount: selectedServices.reduce((sum, s) => sum + (s.pricing?.minPrice || 0), 0),
          payment_method: paymentMethod
        };

        console.log('🛒 Purchase data being sent (no file):', purchaseData);

        const response = await apiCall('/projects/purchase', {
          method: 'POST',
          body: JSON.stringify(purchaseData),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.success) {
          alert('Services purchased successfully! Your payment is being reviewed by our team. You can track the status in the Payment Status section.');
          setShowPurchaseModal(false);
          setSelectedServices([]);
          setPaymentReceipt(null);
          loadPurchasedServices();
          loadStats();
          onRefresh?.();
        } else {
          throw new Error(response.message || response.error?.message || 'Purchase failed');
        }
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert(`Purchase failed: ${error.message}`);
    }
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

  const ServiceCard = ({ service, isSelected, onSelect, onPurchase }) => (
    <div
      style={{
        ...componentStyles.managementCard,
        margin: 0,
        cursor: 'pointer',
        border: isSelected ? `2px solid ${designSystem.colors.primary.split('(')[0]}` : `1px solid ${designSystem.colors.gray[200]}`,
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.3s ease'
      }}
      {...hoverEffects.card}
      onClick={() => onSelect(service)}
    >
      <div style={{ position: 'relative' }}>
        {isSelected && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: designSystem.colors.success,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            zIndex: 1
          }}>
            <i className="fas fa-check"></i>
          </div>
        )}
        
        {/* Service Name */}
        <h5 style={{
          color: designSystem.colors.dark,
          fontWeight: designSystem.typography.fontWeight.bold,
          marginBottom: designSystem.spacing.sm,
          fontSize: designSystem.typography.fontSize.lg
        }}>
          {service.name}
        </h5>

        {/* Category */}
        <div style={{ marginBottom: designSystem.spacing.sm }}>
          <span style={{
            background: designSystem.colors.gray[100],
            color: designSystem.colors.gray[700],
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.medium,
            border: `1px solid ${designSystem.colors.gray[300]}`
          }}>
            {service.category}
          </span>
        </div>

        {/* Price */}
        <div style={{
          fontSize: designSystem.typography.fontSize.xl,
          fontWeight: designSystem.typography.fontWeight.bold,
          color: designSystem.colors.success.split('(')[0],
          marginBottom: designSystem.spacing.md
        }}>
          {service.pricing?.type === 'fixed' 
            ? `$${service.pricing.minPrice?.toLocaleString()}`
            : service.pricing?.type === 'range'
            ? `$${service.pricing.minPrice?.toLocaleString()} - $${service.pricing.maxPrice?.toLocaleString()}`
            : `$${service.pricing.minPrice?.toLocaleString()}/hr`
          }
        </div>

        {/* Description */}
        <p style={{
          color: designSystem.colors.gray[600],
          marginBottom: designSystem.spacing.lg,
          fontSize: designSystem.typography.fontSize.sm,
          lineHeight: '1.5'
        }}>
          {service.description}
        </p>

        {/* Purchase Button */}
        <button
          style={{
            ...componentStyles.primaryButton,
            width: '100%',
            background: designSystem.colors.primary,
            marginTop: 'auto'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onPurchase(service, 'single');
          }}
          {...hoverEffects.button}
        >
          <i className="fas fa-shopping-cart me-2"></i>
          Purchase Now
        </button>
      </div>
    </div>
  );

  const PurchasedServiceCard = ({ project }) => (
    <div style={{
      ...componentStyles.managementCard,
      margin: 0
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: designSystem.spacing.md
      }}>
        <div style={{
          ...componentStyles.headerIcon,
          background: designSystem.colors.success,
          marginRight: designSystem.spacing.md
        }}>
          <i className="fas fa-check-circle"></i>
        </div>
        <div style={{ flex: 1 }}>
          <h5 style={{
            color: designSystem.colors.dark,
            fontWeight: designSystem.typography.fontWeight.semibold,
            marginBottom: '4px'
          }}>
            {project.title || project.service_name || 'Service Project'}
          </h5>
          <span style={{
            ...componentStyles.badge,
            background: getStatusBadgeStyle(project.status).background,
            color: getStatusBadgeStyle(project.status).color
          }}>
            {project.status?.toUpperCase() || 'PENDING'}
          </span>
        </div>
        <div style={{
          fontSize: designSystem.typography.fontSize.lg,
          fontWeight: designSystem.typography.fontWeight.bold,
          color: designSystem.colors.success.split('(')[0]
        }}>
          ${project.budget?.toLocaleString() || '0'}
        </div>
      </div>

      <p style={{
        color: designSystem.colors.gray[600],
        marginBottom: designSystem.spacing.md,
        fontSize: designSystem.typography.fontSize.sm
      }}>
        {project.description || 'No description available'}
      </p>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: designSystem.typography.fontSize.sm,
        color: designSystem.colors.gray[500]
      }}>
        <div>
          <i className="fas fa-calendar me-2"></i>
          Purchased: {new Date(project.createdAt).toLocaleDateString()}
        </div>
        <div>
          <i className="fas fa-clock me-2"></i>
          {project.deadline ? `Due: ${new Date(project.deadline).toLocaleDateString()}` : 'No deadline'}
        </div>
      </div>
    </div>
  );

  const PurchaseModal = () => (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-shopping-cart me-2"></i>
              Purchase Services
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowPurchaseModal(false)}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            <h6 style={{ marginBottom: designSystem.spacing.md }}>Selected Services:</h6>
            
            {selectedServices.map(service => (
              <div key={service._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: designSystem.spacing.md,
                border: `1px solid ${designSystem.colors.gray[200]}`,
                borderRadius: designSystem.borderRadius.button,
                marginBottom: designSystem.spacing.sm
              }}>
                <div>
                  <div style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                    {service.name}
                  </div>
                  <div style={{ 
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[600]
                  }}>
                    {service.category}
                  </div>
                </div>
                <div style={{
                  fontWeight: designSystem.typography.fontWeight.bold,
                  color: designSystem.colors.success.split('(')[0]
                }}>
                  {service.pricing?.type === 'fixed' 
                    ? `$${service.pricing.minPrice?.toLocaleString()}`
                    : service.pricing?.type === 'range'
                    ? `$${service.pricing.minPrice?.toLocaleString()} - $${service.pricing.maxPrice?.toLocaleString()}`
                    : `$${service.pricing.minPrice?.toLocaleString()}/hr`
                  }
                </div>
              </div>
            ))}

            {/* Payment Method Selection */}
            <div style={{ marginTop: designSystem.spacing.lg, marginBottom: designSystem.spacing.md }}>
              <h6 style={{ marginBottom: designSystem.spacing.md }}>Payment Method:</h6>
              <div style={{ display: 'flex', gap: designSystem.spacing.md, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="card" 
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ marginRight: designSystem.spacing.xs }}
                  />
                  <i className="fas fa-credit-card me-2"></i>
                  Credit/Debit Card
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="bank_transfer" 
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ marginRight: designSystem.spacing.xs }}
                  />
                  <i className="fas fa-university me-2"></i>
                  Bank Transfer
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="upi" 
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ marginRight: designSystem.spacing.xs }}
                  />
                  <i className="fas fa-mobile-alt me-2"></i>
                  UPI
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="paypal" 
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ marginRight: designSystem.spacing.xs }}
                  />
                  <i className="fab fa-paypal me-2"></i>
                  PayPal
                </label>
              </div>
            </div>

            {/* Payment Receipt Upload */}
            <div style={{ marginBottom: designSystem.spacing.md }}>
              <h6 style={{ marginBottom: designSystem.spacing.sm }}>Upload Payment Receipt/Screenshot (Optional):</h6>
              <input 
                type="file" 
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                style={{
                  width: '100%',
                  padding: designSystem.spacing.sm,
                  border: `1px solid ${designSystem.colors.gray[300]}`,
                  borderRadius: designSystem.borderRadius.button
                }}
              />
              {paymentReceipt && (
                <div style={{
                  marginTop: designSystem.spacing.sm,
                  padding: designSystem.spacing.sm,
                  background: designSystem.colors.light,
                  borderRadius: designSystem.borderRadius.button,
                  fontSize: designSystem.typography.fontSize.sm
                }}>
                  <i className="fas fa-file me-2"></i>
                  {paymentReceipt.name}
                </div>
              )}
            </div>

            <div style={{
              borderTop: `2px solid ${designSystem.colors.gray[200]}`,
              paddingTop: designSystem.spacing.md,
              marginTop: designSystem.spacing.md
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: designSystem.typography.fontSize.lg,
                fontWeight: designSystem.typography.fontWeight.bold
              }}>
                <span>Total Amount:</span>
                <span style={{ color: designSystem.colors.success.split('(')[0] }}>
                  ${selectedServices.reduce((sum, s) => sum + (s.pricing?.minPrice || 0), 0).toLocaleString()}
                </span>
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
                After purchase, projects will be created for each service and assigned to our team for processing.
                You can upload a payment receipt for verification (optional).
              </p>
            </div>
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowPurchaseModal(false)}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-success" 
              onClick={processPurchase}
            >
              <i className="fas fa-credit-card me-2"></i>
              Complete Purchase
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
          Loading services catalog...
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
            <i className="fas fa-concierge-bell fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Service Center</h4>
            <p style={componentStyles.headerSubtitle}>Browse services and manage your purchases</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
          {selectedServices.length > 0 && activeTab === 'browse' && (
            <button 
              style={{
                ...componentStyles.primaryButton,
                background: designSystem.colors.success
              }}
              onClick={() => handlePurchase(null, 'multiple')}
              {...hoverEffects.button}
            >
              <i className="fas fa-shopping-cart me-2"></i>
              Purchase Selected ({selectedServices.length})
            </button>
          )}
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.primary
            }}
            onClick={() => {
              loadServices();
              loadPurchasedServices();
              loadStats();
            }}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>
      </div>

      {/* Overview Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: designSystem.spacing.lg,
        marginBottom: designSystem.spacing.xl
      }}>
        <StatsCard
          icon="fas fa-concierge-bell"
          number={stats.totalServices}
          label="Available Services"
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatsCard
          icon="fas fa-shopping-bag"
          number={stats.purchasedServices}
          label="Purchased Services"
          color="#10b981"
          bgColor="#ecfdf5"
        />
        <StatsCard
          icon="fas fa-dollar-sign"
          number={`$${stats.totalSpent.toLocaleString()}`}
          label="Total Spent"
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <StatsCard
          icon="fas fa-tasks"
          number={stats.activeProjects}
          label="Active Projects"
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
              background: activeTab === 'browse' ? designSystem.colors.primary : designSystem.colors.gray[100],
              color: activeTab === 'browse' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('browse')}
            {...hoverEffects.button}
          >
            <i className="fas fa-store me-2"></i>
            Browse Services ({services.length})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'purchased' ? designSystem.colors.success : designSystem.colors.gray[100],
              color: activeTab === 'purchased' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('purchased')}
            {...hoverEffects.button}
          >
            <i className="fas fa-shopping-bag me-2"></i>
            My Purchases ({purchasedServices.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'browse' && (
        <>
          {/* Services Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: designSystem.spacing.lg
          }}>
            {services.map(service => (
              <ServiceCard
                key={service._id}
                service={service}
                isSelected={selectedServices.find(s => s._id === service._id)}
                onSelect={handleServiceSelect}
                onPurchase={handlePurchase}
              />
            ))}
          </div>

          {services.length === 0 && (
            <div style={componentStyles.emptyState}>
              <i className="fas fa-concierge-bell fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
              <p style={{ color: designSystem.colors.gray[500] }}>No services available</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'purchased' && (
        <>
          {/* Purchased Services Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: designSystem.spacing.lg
          }}>
            {purchasedServices.map(project => (
              <PurchasedServiceCard
                key={project._id}
                project={project}
              />
            ))}
          </div>

          {purchasedServices.length === 0 && (
            <div style={componentStyles.emptyState}>
              <i className="fas fa-shopping-bag fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
              <p style={{ color: designSystem.colors.gray[500] }}>No purchased services yet</p>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: designSystem.colors.primary,
                  marginTop: designSystem.spacing.md
                }}
                onClick={() => setActiveTab('browse')}
                {...hoverEffects.button}
              >
                Browse Services
              </button>
            </div>
          )}
        </>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && <PurchaseModal />}
    </div>
  );
};

export default ClientServices;