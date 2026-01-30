import { useState, useEffect } from 'react';

const ClientServices = ({ clientData, apiCall }) => {
  const [services, setServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [activeTab, setActiveTab] = useState('my-services');

  useEffect(() => {
    loadServices();
    loadAvailableServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/client/services');
      if (response.success) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableServices = async () => {
    try {
      const response = await apiCall('/services/available');
      if (response.success) {
        setAvailableServices(response.data);
      }
    } catch (error) {
      console.error('Error loading available services:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': 'bg-success',
      'pending': 'bg-warning',
      'completed': 'bg-primary',
      'cancelled': 'bg-danger'
    };
    return statusMap[status] || 'bg-secondary';
  };

  const handleViewService = (service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  const handleRequestService = async (serviceId) => {
    try {
      const response = await apiCall('/client/services/request', {
        method: 'POST',
        body: JSON.stringify({ service_id: serviceId })
      });
      
      if (response.success) {
        alert('Service request submitted successfully!');
        loadServices(); // Reload services
      } else {
        alert('Failed to request service: ' + response.message);
      }
    } catch (error) {
      alert('Error requesting service: ' + error.message);
    }
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
    <div className="client-services">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className="fas fa-concierge-bell me-2"></i>
          Services
        </h4>
      </div>

      {/* Service Tabs */}
      <div className="card mb-4">
        <div className="card-header">
          <nav className="nav nav-pills">
            <button 
              className={`nav-link ${activeTab === 'my-services' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-services')}
            >
              <i className="fas fa-list me-2"></i>
              My Services
            </button>
            <button 
              className={`nav-link ${activeTab === 'available' ? 'active' : ''}`}
              onClick={() => setActiveTab('available')}
            >
              <i className="fas fa-shopping-cart me-2"></i>
              Available Services
            </button>
          </nav>
        </div>
      </div>

      {/* My Services Tab */}
      {activeTab === 'my-services' && (
        <div className="row">
          {services.length > 0 ? (
            services.map((service) => (
              <div key={service.id} className="col-lg-6 mb-4">
                <div className="card h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">{service.name}</h6>
                    <span className={`badge ${getStatusBadge(service.status)}`}>
                      {service.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="text-muted mb-3">{service.description}</p>
                    
                    {/* Service Details */}
                    <div className="row mb-3">
                      <div className="col-6">
                        <small className="text-muted">Price</small>
                        <div className="fw-bold text-success">${service.price}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Duration</small>
                        <div className="fw-bold">{service.duration || 'Varies'}</div>
                      </div>
                    </div>

                    {/* Progress (if applicable) */}
                    {service.progress !== undefined && (
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small>Progress</small>
                          <small>{service.progress}%</small>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            style={{ width: `${service.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="mb-3">
                      <small className="text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        Started: {new Date(service.start_date).toLocaleDateString()}
                      </small>
                      {service.end_date && (
                        <div>
                          <small className="text-muted">
                            <i className="fas fa-flag me-1"></i>
                            Completed: {new Date(service.end_date).toLocaleDateString()}
                          </small>
                        </div>
                      )}
                    </div>

                    {/* Assigned Team */}
                    {service.assigned_to && (
                      <div className="mb-3">
                        <small className="text-muted">
                          <i className="fas fa-user me-1"></i>
                          Assigned to: {service.assigned_to}
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="card-footer">
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-primary btn-sm flex-fill"
                        onClick={() => handleViewService(service)}
                      >
                        <i className="fas fa-eye me-1"></i>
                        View Details
                      </button>
                      <button className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-comment me-1"></i>
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="fas fa-concierge-bell text-muted fa-3x mb-3"></i>
                  <h5 className="text-muted">No Services Yet</h5>
                  <p className="text-muted mb-4">
                    You haven't subscribed to any services yet. Browse our available services to get started.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('available')}
                  >
                    <i className="fas fa-shopping-cart me-2"></i>
                    Browse Services
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Available Services Tab */}
      {activeTab === 'available' && (
        <div className="row">
          {availableServices.map((service) => (
            <div key={service.id} className="col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-header">
                  <h6 className="mb-0">{service.name}</h6>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-3">{service.description}</p>
                  
                  {/* Service Features */}
                  {service.features && (
                    <ul className="list-unstyled mb-3">
                      {service.features.split(',').map((feature, index) => (
                        <li key={index} className="mb-1">
                          <i className="fas fa-check text-success me-2"></i>
                          <small>{feature.trim()}</small>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Price */}
                  <div className="text-center mb-3">
                    <div className="display-6 fw-bold text-primary">${service.price}</div>
                    <small className="text-muted">{service.billing_cycle || 'One-time'}</small>
                  </div>

                  {/* Duration */}
                  {service.duration && (
                    <div className="text-center mb-3">
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>
                        Duration: {service.duration}
                      </small>
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <button 
                    className="btn btn-primary w-100"
                    onClick={() => handleRequestService(service.id)}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Request Service
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Details Modal */}
      {showServiceModal && selectedService && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedService.name}</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowServiceModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Service Information</h6>
                    <p><strong>Status:</strong> 
                      <span className={`badge ${getStatusBadge(selectedService.status)} ms-2`}>
                        {selectedService.status.toUpperCase()}
                      </span>
                    </p>
                    <p><strong>Price:</strong> ${selectedService.price}</p>
                    <p><strong>Start Date:</strong> {new Date(selectedService.start_date).toLocaleDateString()}</p>
                    {selectedService.end_date && (
                      <p><strong>End Date:</strong> {new Date(selectedService.end_date).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    {selectedService.progress !== undefined && (
                      <>
                        <h6>Progress</h6>
                        <div className="progress mb-2" style={{ height: '20px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            style={{ width: `${selectedService.progress}%` }}
                          >
                            {selectedService.progress}%
                          </div>
                        </div>
                      </>
                    )}
                    {selectedService.assigned_to && (
                      <p><strong>Assigned to:</strong> {selectedService.assigned_to}</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h6>Description</h6>
                  <p>{selectedService.description}</p>
                </div>

                {selectedService.deliverables && (
                  <div className="mb-4">
                    <h6>Deliverables</h6>
                    <p>{selectedService.deliverables}</p>
                  </div>
                )}

                {selectedService.notes && (
                  <div className="mb-4">
                    <h6>Notes</h6>
                    <p>{selectedService.notes}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowServiceModal(false)}
                >
                  Close
                </button>
                <button type="button" className="btn btn-primary">
                  <i className="fas fa-comment me-2"></i>
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientServices;