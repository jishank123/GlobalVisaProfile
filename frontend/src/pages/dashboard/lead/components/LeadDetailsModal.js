import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';
import { servicesAPI, usersAPI, clientsAPI, projectsAPI } from '../../../../services/api';

const LeadDetailsModal = ({ show, onHide, lead, type, onContact, onQualify, onScheduleMeeting, onCreateProject }) => {
  const [notes, setNotes] = useState('');
  const [services, setServices] = useState([]);
  const [crmManagers, setCrmManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState({
    service_id: '',
    service_name: '',
    description: '',
    priority: 'medium',
    estimated_duration: '',
    budget: '',
    assigned_to: '',
    start_date: '',
    due_date: ''
  });

  // Load services and CRM managers when modal opens
  useEffect(() => {
    if (show && type === 'create_project') {
      loadServicesAndManagers();
      
      // Set default dates
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);
      
      setProjectData(prev => ({
        ...prev,
        start_date: today.toISOString().split('T')[0],
        due_date: nextMonth.toISOString().split('T')[0]
      }));
    }
    
    // Reset project data when modal closes
    if (!show) {
      setProjectData({
        service_id: '',
        service_name: '',
        description: '',
        priority: 'medium',
        estimated_duration: '',
        budget: '',
        assigned_to: '',
        start_date: '',
        due_date: ''
      });
    }
  }, [show, type]);

  if (!show || !lead) return null;

  const loadServicesAndManagers = async () => {
    try {
      setLoading(true);
      
      // Load services and CRM managers in parallel
      const [servicesResponse, managersResponse] = await Promise.all([
        servicesAPI.getAll(),
        usersAPI.getAll({ role: 'crm_manager' })
      ]);

      if (servicesResponse.success) {
        const servicesData = servicesResponse.data || [];
        
        // For creating projects from leads, always show all available services
        // This allows lead managers to create projects for any service
        setServices(servicesData);
        console.log('Loaded all available services:', servicesData.length);
      }

      if (managersResponse.success) {
        const managersData = managersResponse.data || [];
        // The API should already filter by role, but let's ensure we only have CRM managers
        // Filter out any non-CRM manager users that might have been returned
        const crmManagersOnly = managersData.filter(user => 
          user.role === 'crm_manager' && user.status !== 'deleted'
        );
        setCrmManagers(crmManagersOnly);
        
        console.log('Loaded CRM managers:', crmManagersOnly.length);
        console.log('CRM managers data:', crmManagersOnly);
      }
    } catch (error) {
      console.error('Error loading services and managers:', error);
      // Set empty arrays on error to prevent undefined errors
      setServices([]);
      setCrmManagers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (serviceId) => {
    const selectedService = services.find(s => s._id === serviceId);
    
    let budgetValue = '';
    if (selectedService && selectedService.pricing) {
      if (selectedService.pricing.type === 'fixed') {
        budgetValue = selectedService.pricing.minPrice;
      } else if (selectedService.pricing.type === 'range') {
        budgetValue = `${selectedService.pricing.minPrice} - ${selectedService.pricing.maxPrice}`;
      } else {
        budgetValue = selectedService.pricing.minPrice;
      }
    }
    
    const newProjectData = {
      ...projectData,
      service_id: serviceId,
      service_name: selectedService ? selectedService.name : '',
      budget: budgetValue
    };
    
    setProjectData(newProjectData);
  };

  const getSourceDisplayName = (source) => {
    const sourceMap = {
      'profile_assessment': 'Assessment',
      'contact_form': 'Contact Us',
      'appointment': 'Appointment',
      'website': 'Registration',
      'referral': 'Referral',
      'social_media': 'Social Media',
      'advertisement': 'Advertisement',
      'event': 'Event',
      'cold_call': 'Cold Call',
      'email_campaign': 'Email Campaign',
      'other': 'Other'
    };
    return sourceMap[source] || source || 'Unknown';
  };

  const handleContactLead = () => {
    onContact(lead._id);
    onHide();
  };

  const handleQualifyLead = (qualified) => {
    onQualify(lead._id, qualified);
    onHide();
  };

  const handleScheduleMeeting = () => {
    onScheduleMeeting(lead);
    onHide();
  };

  const handleCreateProject = () => {
    if (!projectData.service_id || !projectData.description || !projectData.assigned_to || !projectData.start_date || !projectData.due_date) {
      alert('Please fill in all required fields: Service, Description, CRM Manager, Start Date, and Due Date');
      return;
    }
    
    // Validate that due date is after start date
    if (new Date(projectData.due_date) <= new Date(projectData.start_date)) {
      alert('Due date must be after start date');
      return;
    }
    
    onCreateProject(lead._id, projectData);
    onHide();
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': '#3b82f6',
      'contacted': '#f59e0b',
      'qualified': '#10b981',
      'converted': '#8b5cf6',
      'lost': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444'
    };
    return colors[priority] || '#f59e0b';
  };

  return (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-user-tie me-2"></i>
              Lead Details - {lead.firstName} {lead.lastName}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onHide}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {/* Lead Information */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                  <h6 className="text-primary mb-3">
                    <i className="fas fa-info-circle me-2"></i>Basic Information
                  </h6>
                  <div className="mb-2">
                    <strong>Lead ID:</strong>
                    <span className="ms-2 badge" style={{
                      background: designSystem.colors.primary,
                      color: 'white',
                      fontFamily: 'monospace'
                    }}>
                      #{lead._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Name:</strong> {lead.firstName} {lead.lastName}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {lead.email}
                  </div>
                  <div className="mb-2">
                    <strong>Phone:</strong> {lead.phone || 'Not provided'}
                  </div>
                  <div className="mb-2">
                    <strong>Country:</strong> {lead.country || 'Not specified'}
                  </div>
                  <div className="mb-2">
                    <strong>University:</strong> {lead.university || 'Not specified'}
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                  <h6 className="text-primary mb-3">
                    <i className="fas fa-chart-line me-2"></i>Lead Status
                  </h6>
                  <div className="mb-2">
                    <strong>Status:</strong>
                    <span className="ms-2 badge" style={{
                      background: getStatusColor(lead.status),
                      color: 'white',
                      textTransform: 'uppercase'
                    }}>
                      {lead.status}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Priority:</strong>
                    <span className="ms-2" style={{
                      color: getPriorityColor(lead.priority),
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      ● {lead.priority || 'Medium'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Source:</strong> {getSourceDisplayName(lead.source)}
                  </div>
                  <div className="mb-2">
                    <strong>Created:</strong> {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mb-2">
                    <strong>Last Contact:</strong> {lead.lastContact ? new Date(lead.lastContact).toLocaleDateString() : 'Never'}
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Notes */}
            {lead.notes && (
              <div className="mb-4">
                <h6 className="text-primary mb-3">
                  <i className="fas fa-sticky-note me-2"></i>Notes
                </h6>
                <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                  <p className="mb-0">{lead.notes}</p>
                </div>
              </div>
            )}

            {/* Service Interest */}
            {lead.serviceInterest && (
              <div className="mb-4">
                <h6 className="text-primary mb-3">
                  <i className="fas fa-star me-2"></i>Service Interest
                </h6>
                <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                  <p className="mb-0">{lead.serviceInterest}</p>
                </div>
              </div>
            )}

            {/* Create Project Form (for qualified leads) */}
            {type === 'create_project' && lead.status === 'qualified' && (
              <div className="mb-4">
                <h6 className="text-primary mb-3">
                  <i className="fas fa-project-diagram me-2"></i>Create Project
                </h6>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Service *</label>
                    {loading ? (
                      <div className="form-control d-flex align-items-center">
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Loading services...
                      </div>
                    ) : services.length === 0 ? (
                      <div>
                        <select className="form-control" style={componentStyles.formInput} disabled>
                          <option>No services available</option>
                        </select>
                        <small className="text-danger mt-1 d-block">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          No services found. Please contact your administrator to add services.
                        </small>
                      </div>
                    ) : (
                      <select
                        className="form-control"
                        style={componentStyles.formInput}
                        value={projectData.service_id}
                        onChange={(e) => handleServiceChange(e.target.value)}
                        required
                      >
                        <option value="">Select a service</option>
                        {services.map(service => {
                          let priceDisplay = 'N/A';
                          if (service.pricing) {
                            if (service.pricing.type === 'fixed') {
                              priceDisplay = `$${service.pricing.minPrice}`;
                            } else if (service.pricing.type === 'range') {
                              priceDisplay = `$${service.pricing.minPrice} - $${service.pricing.maxPrice}`;
                            } else {
                              priceDisplay = `$${service.pricing.minPrice}`;
                            }
                          }
                          
                          return (
                            <option key={service._id} value={service._id}>
                              {service.name} - {priceDisplay}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Assign to CRM Manager *</label>
                    {loading ? (
                      <div className="form-control d-flex align-items-center">
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Loading managers...
                      </div>
                    ) : (
                      <select
                        className="form-control"
                        style={componentStyles.formInput}
                        value={projectData.assigned_to}
                        onChange={(e) => setProjectData({...projectData, assigned_to: e.target.value})}
                        required
                      >
                        <option value="">Select CRM Manager</option>
                        {crmManagers.map(manager => (
                          <option key={manager._id} value={manager._id}>
                            {manager.first_name} {manager.last_name} ({manager.email})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Start Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      style={componentStyles.formInput}
                      value={projectData.start_date}
                      onChange={(e) => setProjectData({...projectData, start_date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Due Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      style={componentStyles.formInput}
                      value={projectData.due_date}
                      onChange={(e) => setProjectData({...projectData, due_date: e.target.value})}
                      min={projectData.start_date || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-control"
                      style={componentStyles.formInput}
                      value={projectData.priority}
                      onChange={(e) => setProjectData({...projectData, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Estimated Duration</label>
                    <input
                      type="text"
                      className="form-control"
                      style={componentStyles.formInput}
                      value={projectData.estimated_duration}
                      onChange={(e) => setProjectData({...projectData, estimated_duration: e.target.value})}
                      placeholder="e.g., 2-3 weeks"
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Budget</label>
                    <input
                      type="text"
                      className="form-control"
                      style={componentStyles.formInput}
                      value={projectData.budget}
                      onChange={(e) => setProjectData({...projectData, budget: e.target.value})}
                      placeholder="Budget will be auto-filled from service price"
                    />
                    {projectData.service_id && projectData.budget && (
                      <small className="text-success">
                        <i className="fas fa-check-circle me-1"></i>
                        Budget auto-filled from selected service: ${projectData.budget}
                      </small>
                    )}
                    {projectData.service_id && !projectData.budget && (
                      <small className="text-warning">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        No pricing information available for this service
                      </small>
                    )}
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      style={componentStyles.formInput}
                      rows="3"
                      value={projectData.description}
                      onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                      placeholder="Enter project description"
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            <div className="d-flex gap-2 w-100 justify-content-between">
              <div className="d-flex gap-2">
                {lead.status === 'new' && (
                  <button 
                    className="btn btn-info"
                    onClick={handleContactLead}
                    {...hoverEffects.button}
                  >
                    <i className="fas fa-phone me-2"></i>Contact Lead
                  </button>
                )}
                
                {(lead.status === 'new' || lead.status === 'contacted') && (
                  <button 
                    className="btn btn-warning"
                    onClick={handleScheduleMeeting}
                    {...hoverEffects.button}
                  >
                    <i className="fas fa-calendar me-2"></i>Schedule Meeting
                  </button>
                )}
                
                {lead.status === 'contacted' && (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={() => handleQualifyLead(true)}
                      {...hoverEffects.button}
                    >
                      <i className="fas fa-check me-2"></i>Qualify
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleQualifyLead(false)}
                      {...hoverEffects.button}
                    >
                      <i className="fas fa-times me-2"></i>Disqualify
                    </button>
                  </>
                )}
                
                {type === 'create_project' && lead.status === 'qualified' && (
                  <button 
                    className="btn btn-primary"
                    onClick={handleCreateProject}
                    disabled={!projectData.service_id || !projectData.description || !projectData.assigned_to || !projectData.start_date || !projectData.due_date || loading}
                    {...hoverEffects.button}
                  >
                    <i className="fas fa-plus me-2"></i>Create Project
                  </button>
                )}
              </div>
              
              <button 
                className="btn btn-secondary"
                onClick={onHide}
                {...hoverEffects.button}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;