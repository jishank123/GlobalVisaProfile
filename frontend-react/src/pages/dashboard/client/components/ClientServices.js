import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects, getStatusBadgeStyle } from '../../../../styles/designSystem';

const ClientServices = ({ clientData, apiCall, onRefresh }) => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState('single'); // 'single' or 'multiple'

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/services');
      if (response.success) {
        setServices(response.data || []);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map(service => service.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredServices = () => {
    if (selectedCategory === 'all') return services;
    return services.filter(service => service.category === selectedCategory);
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

  const processPurchase = async () => {
    try {
      const purchaseData = {
        services: selectedServices.map(s => s._id),
        client: clientData._id,
        type: purchaseType,
        total_amount: selectedServices.reduce((sum, s) => sum + s.price, 0)
      };

      const response = await apiCall('/projects', {
        method: 'POST',
        body: JSON.stringify(purchaseData)
      });

      if (response.success) {
        alert('Services purchased successfully! Your projects have been created.');
        setShowPurchaseModal(false);
        setSelectedServices([]);
        onRefresh?.();
      } else {
        throw new Error(response.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert(`Purchase failed: ${error.message}`);
    }
  };

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
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: designSystem.spacing.md
        }}>
          <div style={{
            ...componentStyles.headerIcon,
            background: designSystem.colors.primary,
            marginRight: designSystem.spacing.md
          }}>
            <i className="fas fa-concierge-bell"></i>
          </div>
          <div style={{ flex: 1 }}>
            <h5 style={{
              color: designSystem.colors.dark,
              fontWeight: designSystem.typography.fontWeight.semibold,
              marginBottom: '4px'
            }}>
              {service.name}
            </h5>
            <span style={{
              ...componentStyles.badge,
              background: designSystem.colors.info,
              color: 'white'
            }}>
              {service.category}
            </span>
          </div>
          <div style={{
            fontSize: designSystem.typography.fontSize.xl,
            fontWeight: designSystem.typography.fontWeight.bold,
            color: designSystem.colors.success.split('(')[0]
          }}>
            ${service.price?.toLocaleString()}
          </div>
        </div>

        <p style={{
          color: designSystem.colors.gray[600],
          marginBottom: designSystem.spacing.md,
          fontSize: designSystem.typography.fontSize.sm
        }}>
          {service.description}
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: designSystem.spacing.md
        }}>
          <div style={{
            fontSize: designSystem.typography.fontSize.sm,
            color: designSystem.colors.gray[500]
          }}>
            <i className="fas fa-clock me-2"></i>
            Duration: {service.duration || 'Varies'}
          </div>
          <div style={{
            fontSize: designSystem.typography.fontSize.sm,
            color: designSystem.colors.gray[500]
          }}>
            <i className="fas fa-star me-2"></i>
            {service.rating || 'New'}
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: designSystem.spacing.sm
        }}>
          <button
            style={{
              ...componentStyles.primaryButton,
              flex: 1,
              background: designSystem.colors.primary
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
          <button
            style={{
              ...componentStyles.secondaryButton,
              padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`
            }}
            onClick={(e) => {
              e.stopPropagation();
              // View details functionality
            }}
            {...hoverEffects.button}
          >
            <i className="fas fa-info-circle"></i>
          </button>
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
                  ${service.price?.toLocaleString()}
                </div>
              </div>
            ))}

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
                  ${selectedServices.reduce((sum, s) => sum + s.price, 0).toLocaleString()}
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
              Proceed to Payment
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
            <h4 style={componentStyles.headerTitle}>Service Catalog</h4>
            <p style={componentStyles.headerSubtitle}>Browse and purchase our immigration services</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
          {selectedServices.length > 0 && (
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
              background: designSystem.colors.info
            }}
            onClick={loadServices}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: designSystem.spacing.lg }}>
        <div style={{ display: 'flex', gap: designSystem.spacing.xs, flexWrap: 'wrap' }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: selectedCategory === 'all' ? designSystem.colors.primary : designSystem.colors.gray[100],
              color: selectedCategory === 'all' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setSelectedCategory('all')}
            {...hoverEffects.button}
          >
            All Services ({services.length})
          </button>
          {categories.map(category => (
            <button 
              key={category}
              style={{
                ...componentStyles.primaryButton,
                background: selectedCategory === category ? designSystem.colors.primary : designSystem.colors.gray[100],
                color: selectedCategory === category ? 'white' : designSystem.colors.gray[600]
              }}
              onClick={() => setSelectedCategory(category)}
              {...hoverEffects.button}
            >
              {category} ({services.filter(s => s.category === category).length})
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: designSystem.spacing.lg
      }}>
        {getFilteredServices().map(service => (
          <ServiceCard
            key={service._id}
            service={service}
            isSelected={selectedServices.find(s => s._id === service._id)}
            onSelect={handleServiceSelect}
            onPurchase={handlePurchase}
          />
        ))}
      </div>

      {getFilteredServices().length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-concierge-bell fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
          <p style={{ color: designSystem.colors.gray[500] }}>No services found in this category</p>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && <PurchaseModal />}
    </div>
  );
};

export default ClientServices;