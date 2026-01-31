import { useState, useEffect } from 'react';
import { servicesAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';
import ServiceModal from './ServiceModal';

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    pricing_type: 'fixed',
    min_price: '',
    max_price: '',
    duration: '',
    is_active: true,
    features: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadServicesManagement();
  }, []);

  const loadServicesManagement = async () => {
    try {
      setLoading(true);
      
      const response = await servicesAPI.getAll();
      
      if (response.success) {
        setServices(response.data || []);
      } else {
        throw new Error(response.error?.message || 'Failed to load services');
      }

    } catch (error) {
      console.error('Error loading services management:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter services by status
  const getFilteredServices = (status) => {
    return services.filter(service => {
      if (status === 'active') {
        return service.is_active !== false;
      } else {
        return service.is_active === false;
      }
    });
  };

  // Get service counts for stats
  const getServiceCounts = () => {
    return {
      total: services.length,
      active: services.filter(service => service.is_active !== false).length,
      inactive: services.filter(service => service.is_active === false).length,
      categories: [...new Set(services.map(service => service.category))].length
    };
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Service name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.pricing_type) errors.pricing_type = 'Pricing type is required';
    if (!formData.min_price || formData.min_price <= 0) errors.min_price = 'Valid minimum price is required';
    if (!formData.max_price || formData.max_price <= 0) errors.max_price = 'Valid maximum price is required';
    if (parseFloat(formData.min_price) > parseFloat(formData.max_price)) {
      errors.max_price = 'Maximum price must be greater than minimum price';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      pricing_type: 'fixed',
      min_price: '',
      max_price: '',
      duration: '',
      is_active: true,
      features: ''
    });
    setFormErrors({});
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalData(null);
    setModalType('');
  };

  const handleAddModalClose = () => {
    setShowAddModal(false);
    resetForm();
  };

  const viewServiceDetails = (service) => {
    setModalData(service);
    setModalType('view');
    setShowModal(true);
  };

  const editService = (service) => {
    setModalData(service);
    setModalType('edit');
    setFormData({
      name: service.name || '',
      category: service.category || '',
      description: service.description || '',
      pricing_type: service.pricing_type || service.pricing?.type || 'fixed',
      min_price: service.min_price || service.pricing?.minPrice || '',
      max_price: service.max_price || service.pricing?.maxPrice || '',
      duration: service.duration || '',
      is_active: service.is_active !== false,
      features: Array.isArray(service.features) ? service.features.join('\n') : (service.features || '')
    });
    setShowAddModal(true);
  };

  const deleteService = (service) => {
    setModalData(service);
    setModalType('delete');
    setShowModal(true);
  };

  const handleAddService = async () => {
    if (!validateForm()) return;

    try {
      const serviceData = {
        ...formData,
        min_price: parseFloat(formData.min_price),
        max_price: parseFloat(formData.max_price),
        features: formData.features.split('\n').filter(f => f.trim())
      };

      const response = await servicesAPI.create(serviceData);
      
      if (response.success) {
        alert('✅ Service created successfully!');
        handleAddModalClose();
        loadServicesManagement();
      } else {
        throw new Error(response.error?.message || 'Failed to create service');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      alert(`❌ Error creating service: ${error.message}`);
    }
  };

  const handleEditService = async () => {
    if (!validateForm()) return;

    try {
      const serviceData = {
        ...formData,
        min_price: parseFloat(formData.min_price),
        max_price: parseFloat(formData.max_price),
        features: formData.features.split('\n').filter(f => f.trim())
      };

      const response = await servicesAPI.update(modalData._id, serviceData);
      
      if (response.success) {
        alert('✅ Service updated successfully!');
        handleAddModalClose();
        loadServicesManagement();
      } else {
        throw new Error(response.error?.message || 'Failed to update service');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      alert(`❌ Error updating service: ${error.message}`);
    }
  };

  const handleDeleteService = async () => {
    try {
      const response = await servicesAPI.delete(modalData._id);
      
      if (response.success) {
        alert('✅ Service deleted successfully!');
        handleModalClose();
        loadServicesManagement();
      } else {
        throw new Error(response.error?.message || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert(`❌ Error deleting service: ${error.message}`);
    }
  };

  const formatPrice = (minPrice, maxPrice, pricingType) => {
    const min = minPrice || 0;
    const max = maxPrice || 0;
    
    if (pricingType === 'fixed') {
      return `$${min.toLocaleString()}`;
    } else {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
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

  const renderServiceTable = (serviceType) => {
    const filteredServices = getFilteredServices(serviceType);
    
    if (filteredServices.length === 0) {
      return (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-briefcase fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
          <p style={{ color: designSystem.colors.gray[500] }}>
            No {serviceType} services found
          </p>
        </div>
      );
    }

    return (
      <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={componentStyles.tableHeader}>
            <tr>
              <th style={componentStyles.tableHeaderCell}>Service ID</th>
              <th style={componentStyles.tableHeaderCell}>Service Name</th>
              <th style={componentStyles.tableHeaderCell}>Category</th>
              <th style={componentStyles.tableHeaderCell}>Price Range</th>
              <th style={componentStyles.tableHeaderCell}>Duration</th>
              <th style={componentStyles.tableHeaderCell}>Status</th>
              <th style={componentStyles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map(service => {
              const minPrice = service.min_price || service.pricing?.minPrice || 0;
              const maxPrice = service.max_price || service.pricing?.maxPrice || 0;
              const pricingType = service.pricing_type || service.pricing?.type || 'fixed';
              
              return (
                <tr 
                  key={service._id}
                  style={componentStyles.tableRow}
                  {...hoverEffects.tableRow}
                >
                  <td style={componentStyles.tableCell}>
                    <span 
                      style={{
                        ...componentStyles.badge,
                        background: designSystem.colors.gray[100],
                        color: designSystem.colors.gray[600],
                        fontFamily: 'monospace'
                      }}
                    >
                      {service._id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <div>
                      <div style={{ 
                        color: designSystem.colors.dark, 
                        fontSize: designSystem.typography.fontSize.base,
                        fontWeight: designSystem.typography.fontWeight.medium,
                        marginBottom: '2px'
                      }}>
                        {service.name}
                      </div>
                      <small style={{ color: designSystem.colors.gray[500] }}>
                        {(service.description || '').substring(0, 50)}...
                      </small>
                    </div>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <span style={{
                      background: '#3b82f6',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                    }}>
                      {service.category || 'Other'}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <strong>{formatPrice(minPrice, maxPrice, pricingType)}</strong>
                  </td>
                  <td style={componentStyles.tableCell}>{service.duration || 'Not specified'}</td>
                  <td style={componentStyles.tableCell}>
                    <span style={{
                      ...componentStyles.badge,
                      background: service.is_active !== false ? '#28a745' : '#ffc107',
                      color: service.is_active !== false ? 'white' : '#000'
                    }}>
                      {service.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => viewServiceDetails(service)}
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="btn btn-outline-warning btn-sm"
                        onClick={() => editService(service)}
                        title="Edit Service"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => deleteService(service)}
                        title="Delete Service"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
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
      {/* Header with Refresh Button */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-briefcase fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Services Management</h4>
            <p style={componentStyles.headerSubtitle}>Manage service catalog and pricing</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={loadServicesManagement}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Overview Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-briefcase"
          number={getServiceCounts().total}
          label="Total Services"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={getServiceCounts().active}
          label="Active Services"
          borderColor="#10b981"
          iconColor="#10b981"
        />
        <StatCard
          icon="fas fa-pause-circle"
          number={getServiceCounts().inactive}
          label="Inactive Services"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-tags"
          number={getServiceCounts().categories}
          label="Categories"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div style={componentStyles.loading}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
          <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading services...</p>
        </div>
      )}

      {/* Service Type Tabs with Add Button */}
      {!loading && (
        <>
          <div style={{ marginBottom: designSystem.spacing.lg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                <button 
                  style={{
                    ...componentStyles.primaryButton,
                    background: activeTab === 'active' ? designSystem.colors.success : designSystem.colors.gray[100],
                    color: activeTab === 'active' ? 'white' : designSystem.colors.gray[600],
                    boxShadow: activeTab === 'active' ? designSystem.shadows.button : 'none'
                  }}
                  onClick={() => setActiveTab('active')}
                  {...hoverEffects.button}
                >
                  Active Services ({getServiceCounts().active})
                </button>
                <button 
                  style={{
                    ...componentStyles.primaryButton,
                    background: activeTab === 'inactive' ? designSystem.colors.warning : designSystem.colors.gray[100],
                    color: activeTab === 'inactive' ? 'white' : designSystem.colors.gray[600],
                    boxShadow: activeTab === 'inactive' ? designSystem.shadows.button : 'none'
                  }}
                  onClick={() => setActiveTab('inactive')}
                  {...hoverEffects.button}
                >
                  Inactive Services ({getServiceCounts().inactive})
                </button>
              </div>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: designSystem.colors.primary,
                  fontSize: designSystem.typography.fontSize.base,
                  padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`
                }}
                onClick={() => {
                  setModalType('add');
                  resetForm();
                  setShowAddModal(true);
                }}
                {...hoverEffects.button}
              >
                <i className="fas fa-plus me-2"></i>Add Service
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {renderServiceTable(activeTab)}
          </div>
        </>
      )}

      {/* No Services Message */}
      {!loading && services.length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-briefcase fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>No services found in the system</h6>
          <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.lg }}>Get started by adding your first service to the catalog</p>
        </div>
      )}

      {/* View/Delete Modal */}
      <ServiceModal
        show={showModal}
        onHide={handleModalClose}
        type={modalType}
        data={modalData}
        formData={formData}
        formErrors={formErrors}
        onInputChange={handleInputChange}
        onAddService={handleAddService}
        onEditService={handleEditService}
        onDeleteService={handleDeleteService}
        formatPrice={formatPrice}
      />

      {/* Add/Edit Modal */}
      <ServiceModal
        show={showAddModal}
        onHide={handleAddModalClose}
        type={modalType}
        data={modalData}
        formData={formData}
        formErrors={formErrors}
        onInputChange={handleInputChange}
        onAddService={handleAddService}
        onEditService={handleEditService}
        onDeleteService={handleDeleteService}
        formatPrice={formatPrice}
      />
    </div>
  );
};

export default ServicesManagement;