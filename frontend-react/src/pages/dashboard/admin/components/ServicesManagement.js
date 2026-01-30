import { useState, useEffect } from 'react';
import { servicesAPI } from '../../../../services/api';

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    pricing_type: '',
    min_price: '',
    max_price: '',
    duration: '',
    is_active: 'true',
    features: ''
  });

  useEffect(() => {
    loadServicesManagement();
  }, []);

  const loadServicesManagement = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      setServices([
        {
          _id: '507f1f77bcf86cd799439021',
          name: 'EB-1A Petition Preparation',
          category: 'Immigration',
          description: 'Complete EB-1A extraordinary ability petition preparation and filing',
          pricing: {
            type: 'range',
            minPrice: 8000,
            maxPrice: 15000
          },
          duration: '3-6 months',
          isActive: true,
          features: ['Document preparation', 'Evidence compilation', 'Legal review', 'Filing assistance']
        },
        {
          _id: '507f1f77bcf86cd799439022',
          name: 'EB-2 NIW Application',
          category: 'Immigration',
          description: 'National Interest Waiver application for EB-2 category',
          pricing: {
            type: 'range',
            minPrice: 6000,
            maxPrice: 12000
          },
          duration: '4-8 months',
          isActive: true,
          features: ['Petition drafting', 'Supporting documentation', 'Case strategy', 'Government filing']
        },
        {
          _id: '507f1f77bcf86cd799439023',
          name: 'O-1 Visa Consultation',
          category: 'Consultation',
          description: 'Expert consultation for O-1 extraordinary ability visa',
          pricing: {
            type: 'fixed',
            minPrice: 500,
            maxPrice: 500
          },
          duration: '1-2 hours',
          isActive: true,
          features: ['Case evaluation', 'Strategy discussion', 'Document review', 'Next steps planning']
        },
        {
          _id: '507f1f77bcf86cd799439024',
          name: 'Profile Assessment',
          category: 'Assessment',
          description: 'Comprehensive profile assessment for immigration eligibility',
          pricing: {
            type: 'fixed',
            minPrice: 200,
            maxPrice: 200
          },
          duration: '1 week',
          isActive: false,
          features: ['Detailed analysis', 'Strength evaluation', 'Recommendation report', 'Follow-up consultation']
        }
      ]);

    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      pricing_type: '',
      min_price: '',
      max_price: '',
      duration: '',
      is_active: 'true',
      features: ''
    });
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['name', 'category', 'description', 'pricing_type', 'min_price', 'max_price'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in the ${field.replace('_', ' ')} field.`);
        return;
      }
    }

    try {
      // In real implementation, call API
      // await servicesAPI.create(formData);
      
      alert('Service created successfully!');
      setShowAddModal(false);
      resetForm();
      loadServicesManagement();
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Error creating service. Please try again.');
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description,
      pricing_type: service.pricing.type,
      min_price: service.pricing.minPrice.toString(),
      max_price: service.pricing.maxPrice.toString(),
      duration: service.duration,
      is_active: service.isActive.toString(),
      features: service.features.join('\n')
    });
    setShowEditModal(true);
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    
    try {
      // In real implementation, call API
      // await servicesAPI.update(editingService._id, formData);
      
      alert('Service updated successfully!');
      setShowEditModal(false);
      setEditingService(null);
      resetForm();
      loadServicesManagement();
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Error updating service. Please try again.');
    }
  };

  const deleteService = async (serviceId, serviceName) => {
    if (!window.confirm(`Are you sure you want to delete service: ${serviceName}?

This action cannot be undone.`)) {
      return;
    }

    try {
      // In real implementation, call API
      // await servicesAPI.delete(serviceId);
      
      alert('Service deleted successfully!');
      loadServicesManagement();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error deleting service. Please try again.');
    }
  };

  const managementCardStyle = {
    background: 'white',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  const ServiceModal = ({ show, onHide, title, onSubmit, isEdit = false }) => {
    if (!show) return null;

    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
              <h5 className="modal-title">
                <i className="fas fa-briefcase me-2"></i>{title}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={onSubmit}>
                <div className="row">
                  <div className="col-md-8">
                    <div className="mb-3">
                      <label className="form-label">Service Name <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Category <span className="text-danger">*</span></label>
                      <select 
                        className="form-select" 
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Immigration">Immigration</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Assessment">Assessment</option>
                        <option value="Documentation">Documentation</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Description <span className="text-danger">*</span></label>
                  <textarea 
                    className="form-control" 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3" 
                    required
                  ></textarea>
                </div>
                
                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Pricing Type <span className="text-danger">*</span></label>
                      <select 
                        className="form-select" 
                        name="pricing_type"
                        value={formData.pricing_type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="fixed">Fixed Price</option>
                        <option value="hourly">Hourly Rate</option>
                        <option value="range">Price Range</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Min Price ($) <span className="text-danger">*</span></label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="min_price"
                        value={formData.min_price}
                        onChange={handleInputChange}
                        min="0" 
                        step="0.01" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Max Price ($) <span className="text-danger">*</span></label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="max_price"
                        value={formData.max_price}
                        onChange={handleInputChange}
                        min="0" 
                        step="0.01" 
                        required 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Duration</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        placeholder="e.g., 2-4 weeks" 
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select 
                        className="form-select" 
                        name="is_active"
                        value={formData.is_active}
                        onChange={handleInputChange}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Features (one per line)</label>
                  <textarea 
                    className="form-control" 
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    rows="4" 
                    placeholder="Enter each feature on a new line"
                  ></textarea>
                  <div className="form-text">Each line will be treated as a separate feature</div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={onSubmit}>
                <i className="fas fa-save me-1"></i>{isEdit ? 'Update' : 'Create'} Service
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="management-card" style={managementCardStyle}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          <i className="fas fa-briefcase me-2"></i>
          Services Management
        </h5>
        <button 
          className="btn btn-primary btn-sm" 
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus me-1"></i>Add New Service
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
          <p className="mt-2 text-muted">Loading services...</p>
        </div>
      )}

      {/* Services Table */}
      {!loading && (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
              <tr>
                <th>Service ID</th>
                <th>Service Name</th>
                <th>Category</th>
                <th>Price Range</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => {
                const priceRange = service.pricing.type === 'fixed' ? 
                  `$${service.pricing.minPrice.toLocaleString()}` :
                  `$${service.pricing.minPrice.toLocaleString()} - $${service.pricing.maxPrice.toLocaleString()}`;
                
                return (
                  <tr key={service._id}>
                    <td><strong>{service._id.slice(-6).toUpperCase()}</strong></td>
                    <td>
                      <div>
                        <strong>{service.name}</strong>
                        <br />
                        <small className="text-muted">{service.description.substring(0, 50)}...</small>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-info">{service.category}</span>
                    </td>
                    <td><strong>{priceRange}</strong></td>
                    <td>{service.duration || 'Not specified'}</td>
                    <td>
                      <span className={`badge ${service.isActive ? 'bg-success' : 'bg-warning'}`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn btn-outline-warning"
                          onClick={() => handleEditService(service)}
                          title="Edit Service"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => deleteService(service._id, service.name)}
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
      )}

      {/* No Services Message */}
      {!loading && services.length === 0 && (
        <div className="text-center py-4">
          <i className="fas fa-briefcase fa-3x text-muted mb-3"></i>
          <p className="text-muted">No services found in the system</p>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus me-1"></i>Add First Service
          </button>
        </div>
      )}

      {/* Add Service Modal */}
      <ServiceModal
        show={showAddModal}
        onHide={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Service"
        onSubmit={handleAddService}
        isEdit={false}
      />

      {/* Edit Service Modal */}
      <ServiceModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setEditingService(null);
          resetForm();
        }}
        title="Edit Service"
        onSubmit={handleUpdateService}
        isEdit={true}
      />
    </div>
  );
};

export default ServicesManagement;