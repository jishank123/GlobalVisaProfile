import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects, getStatusBadgeStyle } from '../../../../styles/designSystem';
import { getApiEndpoint } from '../../../../utils/apiConfig';

// Map assessment service_interest slugs to Service model category values (exact match)
const SERVICE_INTEREST_TO_CATEGORY = {
  'eb1a-eligibility': 'EB-1A Eligibility',
  'profile-building': 'Profile Building',
  'eb2-niw': 'EB-2 NIW',
  'o1-visa': 'O-1 Visa',
  'career-coaching': 'Career Coaching',
  'other': 'Other',
};

// Display labels for the badge
const SERVICE_INTEREST_LABELS = {
  'eb1a-eligibility': 'EB-1A Eligibility',
  'profile-building': 'Profile Building',
  'eb2-niw': 'EB-2 NIW',
  'o1-visa': 'O-1 Visa',
  'career-coaching': 'Career Coaching',
  'other': 'Other',
};

const ClientServices = ({ clientData, apiCall, onRefresh }) => {
  const [services, setServices] = useState([]);
  const [purchasedServices, setPurchasedServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'other', 'purchased'
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState('single');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [stats, setStats] = useState({
    totalServices: 0,
    purchasedServices: 0,
    totalSpent: 0,
    activeProjects: 0
  });
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadServices();
    loadPurchasedServices();
    loadStats();
    loadAssessment();
  }, []);

  const loadAssessment = async () => {
    try {
      const response = await apiCall('/profile-assessments/client');
      console.log('🔍 Assessment response:', response);
      if (response.success && response.data) {
        // data is an array — take the most recent one
        const latest = Array.isArray(response.data) ? response.data[0] : response.data;
        console.log('🔍 Assessment latest:', latest);
        console.log('🔍 service_interest:', latest?.service_interest);
        setAssessment(latest || null);
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
    }
  };

  // Derived: service_interest slug and label
  const serviceInterestSlug = assessment?.service_interest || '';
  const serviceInterestLabel = SERVICE_INTEREST_LABELS[serviceInterestSlug] || serviceInterestSlug;
  // Map slug to exact Service category value
  const matchedCategory = SERVICE_INTEREST_TO_CATEGORY[serviceInterestSlug] || '';

  // Split services into matching vs other based on assessment service_interest
  const matchingServices = services.filter(s =>
    matchedCategory
      ? (s.category || '').trim() === matchedCategory
      : true
  );
  const otherServices = services.filter(s =>
    (s.category || '').trim() === 'Other'
  );

  const loadServices = async () => {
    setLoading(true);
    try {
      console.log('🔍 CLIENT: Loading services from /services/public...');
      const response = await apiCall('/services/public');
      console.log('🔍 CLIENT: API Response success:', response.success);
      console.log('🔍 CLIENT: Response data length:', response.data?.length);
      
      if (response.success) {
        console.log('🔍 CLIENT: Setting services:', response.data?.length || 0);
        setServices(response.data || []);
      } else {
        console.error('🔍 CLIENT: API call failed:', response);
        setServices([]);
      }
    } catch (error) {
      console.error('🔍 CLIENT: Error loading services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPurchasedServices = async () => {
    try {
      if (!clientData?._id) {
        console.warn('No client data available for loading purchased services');
        setPurchasedServices([]);
        return;
      }
      
      const response = await apiCall('/projects?client=' + clientData._id);
      if (response.success) {
        setPurchasedServices(response.data || []);
      } else {
        setPurchasedServices([]);
      }
    } catch (error) {
      console.error('Error loading purchased services:', error);
      setPurchasedServices([]);
    }
  };

  const loadStats = async () => {
    try {
      const promises = [
        apiCall('/services/public')
      ];
      
      // Only add client-specific calls if clientData exists
      if (clientData?._id) {
        promises.push(
          apiCall('/projects?client=' + clientData._id),
          apiCall('/payments?client=' + clientData._id)
        );
      }

      const [servicesRes, projectsRes, paymentsRes] = await Promise.all(promises);

      const totalServices = servicesRes.success ? servicesRes.data.length : 0;
      const purchasedServices = projectsRes?.success ? projectsRes.data.length : 0;
      const activeProjects = projectsRes?.success ? projectsRes.data.filter(p => p.status === 'active' || p.status === 'in_progress').length : 0;
      const totalSpent = paymentsRes?.success ? paymentsRes.data.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;

      setStats({
        totalServices,
        purchasedServices,
        totalSpent,
        activeProjects
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default stats on error
      setStats({
        totalServices: 0,
        purchasedServices: 0,
        totalSpent: 0,
        activeProjects: 0
      });
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
      // Validate required fields
      if (!paymentReceipt) {
        alert('Please upload a payment receipt before completing the purchase.');
        return;
      }

      if (!paymentMethod) {
        alert('Please select a payment method.');
        return;
      }

      if (selectedServices.length === 0) {
        alert('Please select at least one service to purchase.');
        return;
      }

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
        const response = await fetch(getApiEndpoint('/projects/purchase'), {
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

  const ServiceCard = ({ service, onPurchase }) => (
    <div
      style={{
        ...componentStyles.managementCard,
        margin: 0,
        border: `1px solid ${designSystem.colors.gray[200]}`,
        transition: 'all 0.3s ease'
      }}
      {...hoverEffects.card}
    >
      <div style={{ position: 'relative' }}>
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
            : `$${service.pricing.minPrice?.toLocaleString()}`
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
          ${(project.amount || project.budget || 0).toLocaleString()}
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

  const PurchaseModal = () => {
    // Check if all required fields are filled
    const isFormValid = selectedServices.length > 0 && paymentMethod && paymentReceipt;
    
    return (
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
                    : `$${service.pricing.minPrice?.toLocaleString()}`
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
              <h6 style={{ marginBottom: designSystem.spacing.sm }}>
                Upload Payment Receipt/Screenshot <span style={{ color: designSystem.colors.danger }}>*</span>
              </h6>
              
              {/* Hidden file input */}
              <input 
                type="file" 
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="payment-receipt-upload"
              />
              
              {/* Custom file upload button */}
              <label 
                htmlFor="payment-receipt-upload"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: designSystem.spacing.sm,
                  width: '100%',
                  padding: designSystem.spacing.md,
                  border: `2px dashed ${paymentReceipt ? designSystem.colors.success : designSystem.colors.gray[300]}`,
                  borderRadius: designSystem.borderRadius.button,
                  background: paymentReceipt ? `${designSystem.colors.success}10` : designSystem.colors.gray[50],
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.dark,
                  fontWeight: designSystem.typography.fontWeight.medium
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = designSystem.colors.primary;
                  e.currentTarget.style.background = `${designSystem.colors.primary}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = paymentReceipt ? designSystem.colors.success : designSystem.colors.gray[300];
                  e.currentTarget.style.background = paymentReceipt ? `${designSystem.colors.success}10` : designSystem.colors.gray[50];
                }}
              >
                <i className={`fas ${paymentReceipt ? 'fa-check-circle' : 'fa-cloud-upload-alt'} fa-lg`} 
                   style={{ color: paymentReceipt ? designSystem.colors.success : designSystem.colors.primary }}></i>
                <span>
                  {paymentReceipt ? paymentReceipt.name : 'Click to choose file or drag and drop'}
                </span>
              </label>
              
              {!paymentReceipt && (
                <div style={{
                  marginTop: designSystem.spacing.sm,
                  padding: designSystem.spacing.sm,
                  background: designSystem.colors.warning.replace('rgb', 'rgba').replace(')', ', 0.1)'),
                  borderRadius: designSystem.borderRadius.button,
                  fontSize: designSystem.typography.fontSize.sm,
                  border: `1px solid ${designSystem.colors.warning}`
                }}>
                  <i className="fas fa-exclamation-triangle me-2" style={{ color: designSystem.colors.warning }}></i>
                  Please upload payment receipt to complete purchase
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
                Payment receipt is required for verification.
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
              disabled={!isFormValid}
              style={{
                opacity: isFormValid ? 1 : 0.5,
                cursor: isFormValid ? 'pointer' : 'not-allowed'
              }}
            >
              <i className="fas fa-credit-card me-2"></i>
              Complete Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
        <div style={{ display: 'flex', gap: designSystem.spacing.sm, alignItems: 'center' }}>
          {/* Selected Service Badge */}
          {serviceInterestLabel && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(102,126,234,0.4)'
            }}>
              <i className="fas fa-star" style={{ fontSize: '11px' }}></i>
              {serviceInterestLabel}
            </div>
          )}
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.primary,
              opacity: loading ? 0.7 : 1
            }}
            onClick={async () => {
              try {
                setLoading(true);
                await Promise.all([
                  loadServices(),
                  loadPurchasedServices(),
                  loadStats(),
                  loadAssessment()
                ]);
              } catch (error) {
                console.error('❌ Refresh failed:', error);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            {...hoverEffects.button}
          >
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} me-2`}></i>
            {loading ? 'Refreshing...' : 'Refresh'}
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

      {/* Tab Navigation with Search */}
      <div style={{ marginBottom: designSystem.spacing.lg }}>
        <div style={{ 
          display: 'flex', 
          gap: designSystem.spacing.md,
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}>
          {/* Tab Buttons */}
          <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
            <button 
              style={{
                ...componentStyles.primaryButton,
                background: activeTab === 'browse' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : designSystem.colors.gray[100],
                color: activeTab === 'browse' ? 'white' : designSystem.colors.gray[600]
              }}
              onClick={() => setActiveTab('browse')}
              {...hoverEffects.button}
            >
              <i className="fas fa-star me-2"></i>
              Browse Services ({matchingServices.length})
            </button>
            <button 
              style={{
                ...componentStyles.primaryButton,
                background: activeTab === 'other' ? designSystem.colors.primary : designSystem.colors.gray[100],
                color: activeTab === 'other' ? 'white' : designSystem.colors.gray[600]
              }}
              onClick={() => setActiveTab('other')}
              {...hoverEffects.button}
            >
              <i className="fas fa-th-large me-2"></i>
              Other Services ({otherServices.length})
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

          {/* Search Bar - show on browse and other tabs */}
          {(activeTab === 'browse' || activeTab === 'other') && (
            <div style={{ position: 'relative', flex: '1', maxWidth: '400px', minWidth: '250px' }}>
              <input
                type="text"
                placeholder="Search by name, category, or price..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  ...componentStyles.formInput,
                  paddingLeft: '40px',
                  paddingRight: searchTerm ? '40px' : '12px',
                  width: '100%',
                  margin: 0
                }}
              />
              <i className="fas fa-search" style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: designSystem.colors.gray[400],
                pointerEvents: 'none'
              }}></i>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: designSystem.colors.gray[400],
                    padding: '4px 8px',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = designSystem.colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = designSystem.colors.gray[400]}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'browse' && (
        <>
          {serviceInterestLabel && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: designSystem.spacing.md,
              padding: '8px 14px',
              background: 'linear-gradient(135deg, #f0f0ff 0%, #f5f0ff 100%)',
              borderRadius: '8px',
              border: '1px solid #c4b5fd',
              fontSize: '13px',
              color: '#5b21b6'
            }}>
              <i className="fas fa-filter"></i>
              Showing services matching your selected interest: <strong>{serviceInterestLabel}</strong>
            </div>
          )}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: designSystem.spacing.lg
          }}>
            {matchingServices
              .filter(service => {
                if (!searchTerm) return true;
                const search = searchTerm.toLowerCase();
                return (service.name?.toLowerCase() || '').includes(search) ||
                       (service.description?.toLowerCase() || '').includes(search) ||
                       (service.category?.toLowerCase() || '').includes(search) ||
                       (service.pricing?.minPrice?.toString() || '').includes(search);
              })
              .map(service => (
                <ServiceCard key={service._id} service={service} onPurchase={handlePurchase} />
              ))}
          </div>
          {matchingServices.filter(service => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (service.name?.toLowerCase() || '').includes(search) ||
                   (service.description?.toLowerCase() || '').includes(search) ||
                   (service.category?.toLowerCase() || '').includes(search) ||
                   (service.pricing?.minPrice?.toString() || '').includes(search);
          }).length === 0 && (
            <div style={componentStyles.emptyState}>
              <i className="fas fa-search fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
              <p style={{ color: designSystem.colors.gray[500] }}>
                {searchTerm ? `No services found matching "${searchTerm}"` : 'No services match your selected interest'}
              </p>
              {searchTerm && (
                <button style={{ ...componentStyles.primaryButton, background: designSystem.colors.primary, marginTop: designSystem.spacing.md }}
                  onClick={() => setSearchTerm('')} {...hoverEffects.button}>
                  Clear Search
                </button>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'other' && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: designSystem.spacing.lg
          }}>
            {otherServices
              .filter(service => {
                if (!searchTerm) return true;
                const search = searchTerm.toLowerCase();
                return (service.name?.toLowerCase() || '').includes(search) ||
                       (service.description?.toLowerCase() || '').includes(search) ||
                       (service.category?.toLowerCase() || '').includes(search) ||
                       (service.pricing?.minPrice?.toString() || '').includes(search);
              })
              .map(service => (
                <ServiceCard key={service._id} service={service} onPurchase={handlePurchase} />
              ))}
          </div>
          {otherServices.filter(service => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (service.name?.toLowerCase() || '').includes(search) ||
                   (service.description?.toLowerCase() || '').includes(search) ||
                   (service.category?.toLowerCase() || '').includes(search) ||
                   (service.pricing?.minPrice?.toString() || '').includes(search);
          }).length === 0 && (
            <div style={componentStyles.emptyState}>
              <i className="fas fa-th-large fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
              <p style={{ color: designSystem.colors.gray[500] }}>
                {searchTerm ? `No services found matching "${searchTerm}"` : 'No other services available'}
              </p>
              {searchTerm && (
                <button style={{ ...componentStyles.primaryButton, background: designSystem.colors.primary, marginTop: designSystem.spacing.md }}
                  onClick={() => setSearchTerm('')} {...hoverEffects.button}>
                  Clear Search
                </button>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'purchased' && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: designSystem.spacing.lg
          }}>
            {purchasedServices.map(project => (
              <PurchasedServiceCard key={project._id} project={project} />
            ))}
          </div>
          {purchasedServices.length === 0 && (
            <div style={componentStyles.emptyState}>
              <i className="fas fa-shopping-bag fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
              <p style={{ color: designSystem.colors.gray[500] }}>No purchased services yet</p>
              <button style={{ ...componentStyles.primaryButton, background: designSystem.colors.primary, marginTop: designSystem.spacing.md }}
                onClick={() => setActiveTab('browse')} {...hoverEffects.button}>
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
