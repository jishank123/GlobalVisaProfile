import { useState, useEffect } from 'react';
import { contactAPI, profileAssessmentsAPI, appointmentsAPI } from '../../../../services/api';

const ContactsManagement = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const [contacts, setContacts] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [convertFormData, setConvertFormData] = useState({
    priority: 'medium',
    assignedTo: '',
    notes: ''
  });
  const [stats, setStats] = useState({
    contactForms: 0,
    assessments: 0,
    appointments: 0
  });

  useEffect(() => {
    loadContactsData();
  }, []);

  const loadContactsData = async () => {
    try {
      setLoading(true);
      
      // Load contact forms
      const contactsResponse = await contactAPI.getAll();
      if (contactsResponse.success) {
        setContacts(contactsResponse.data?.contact_forms || contactsResponse.data || []);
      }

      // Load profile assessments
      const assessmentsResponse = await profileAssessmentsAPI.getAll();
      if (assessmentsResponse.success) {
        setAssessments(assessmentsResponse.data || []);
      }

      // Load appointments
      const appointmentsResponse = await appointmentsAPI.getAll();
      if (appointmentsResponse.success) {
        setAppointments(appointmentsResponse.data || []);
      }

      // Update statistics
      setStats({
        contactForms: contactsResponse.data?.contact_forms?.length || contactsResponse.data?.length || 0,
        assessments: assessmentsResponse.data?.length || 0,
        appointments: appointmentsResponse.data?.length || 0
      });

    } catch (error) {
      console.error('Error loading contacts data:', error);
      // Set empty state on error
      setContacts([]);
      setAssessments([]);
      setAppointments([]);
      setStats({ contactForms: 0, assessments: 0, appointments: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'new': 'bg-primary',
      'in_progress': 'bg-warning',
      'resolved': 'bg-success',
      'pending': 'bg-info',
      'scheduled': 'bg-success',
      'completed': 'bg-secondary',
      'cancelled': 'bg-danger'
    };
    return statusClasses[status] || 'bg-secondary';
  };

  const getPriorityClass = (priority) => {
    const priorityClasses = {
      'low': 'text-success',
      'medium': 'text-warning',
      'high': 'text-danger'
    };
    return priorityClasses[priority] || 'text-secondary';
  };

  const viewContactDetails = (contact) => {
    alert(`Contact Details:
    
Name: ${contact.name}
Email: ${contact.email}
Phone: ${contact.phone || 'Not provided'}
Visa Type: ${contact.visa_type || 'Not specified'}
Priority: ${contact.priority || 'Medium'}
Status: ${contact.status || 'New'}
Message: ${contact.message || 'No message'}
Submitted: ${new Date(contact.createdAt || contact.submitted_at).toLocaleDateString()}`);
  };

  const convertSingleContact = (contactId) => {
    setSelectedContacts([contactId]);
    setShowConvertModal(true);
  };

  const viewAssessmentDetails = (assessment) => {
    alert(`Profile Assessment Details:
    
Name: ${assessment.client_name}
Email: ${assessment.client_email}
Overall Score: ${assessment.overall_score || 'Not calculated'}
Education Score: ${assessment.education_score || 'N/A'}
Experience Score: ${assessment.experience_score || 'N/A'}
Publications Score: ${assessment.publications_score || 'N/A'}
Awards Score: ${assessment.awards_score || 'N/A'}
Status: ${assessment.status || 'Pending'}
Submitted: ${new Date(assessment.submitted_at).toLocaleDateString()}`);
  };

  const viewAppointmentDetails = (appointment) => {
    alert(`Appointment Details:
    
Name: ${appointment.name}
Email: ${appointment.email}
Phone: ${appointment.phone || 'Not provided'}
Service: ${appointment.service || 'General consultation'}
Preferred Date: ${appointment.preferred_date ? new Date(appointment.preferred_date).toLocaleDateString() : 'Not specified'}
Preferred Time: ${appointment.preferred_time || 'Not specified'}
Status: ${appointment.status || 'Pending'}
Message: ${appointment.message || 'No message'}
Submitted: ${new Date(appointment.submitted_at).toLocaleDateString()}`);
  };

  const handleConvertToLead = async () => {
    if (selectedContacts.length === 0) {
      alert('Please select at least one contact to convert to lead.');
      return;
    }

    try {
      const response = await contactAPI.convertToLeads({
        contactIds: selectedContacts,
        priority: convertFormData.priority,
        assignedTo: convertFormData.assignedTo || null,
        notes: convertFormData.notes
      });

      if (response.success) {
        alert(`Successfully converted ${response.data.conversion_count} contact(s) to lead(s) with ${convertFormData.priority} priority.`);
        
        if (response.data.errors && response.data.errors.length > 0) {
          console.warn('Some conversions had errors:', response.data.errors);
        }
        
        setShowConvertModal(false);
        setSelectedContacts([]);
        setConvertFormData({ priority: 'medium', assignedTo: '', notes: '' });
        loadContactsData();
      } else {
        throw new Error(response.error?.message || 'Conversion failed');
      }
    } catch (error) {
      console.error('Error converting to leads:', error);
      alert(`Error converting contacts to leads: ${error.message}`);
    }
  };

  const handleContactSelection = (contactId, isSelected) => {
    if (isSelected) {
      setSelectedContacts(prev => [...prev, contactId]);
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const currentTabContacts = activeTab === 'contact' ? contacts : 
                                activeTab === 'assessment' ? assessments : appointments;
      setSelectedContacts(currentTabContacts.map(item => item.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const managementCardStyle = {
    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.03)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    marginBottom: '24px'
  };

  const primaryGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const successGradient = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
  const warningGradient = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';

  return (
    <div className="management-card" style={managementCardStyle}>
      {/* Enhanced Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <div 
            className="icon-wrapper me-3"
            style={{
              background: primaryGradient,
              borderRadius: '12px',
              padding: '12px',
              color: 'white'
            }}
          >
            <i className="fas fa-clipboard-list fa-lg"></i>
          </div>
          <div>
            <h4 className="mb-1" style={{ color: '#1e293b', fontWeight: '600' }}>
              Contacts Management
            </h4>
            <p className="text-muted mb-0">Manage contact forms, assessments, and appointments</p>
          </div>
        </div>
        <button 
          className="btn btn-lg px-4 py-2"
          onClick={loadContactsData}
          style={{
            background: successGradient,
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '500',
            boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card border-primary">
            <div className="card-body text-center">
              <i className="fas fa-user-check fa-2x text-primary mb-2"></i>
              <h4 className="text-primary">{stats.contactForms}</h4>
              <small className="text-muted">Contact Us</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-success">
            <div className="card-body text-center">
              <i className="fas fa-chart-line fa-2x text-success mb-2"></i>
              <h4 className="text-success">{stats.assessments}</h4>
              <small className="text-muted">Profile Assessments</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-warning">
            <div className="card-body text-center">
              <i className="fas fa-calendar-check fa-2x text-warning mb-2"></i>
              <h4 className="text-warning">{stats.appointments}</h4>
              <small className="text-muted">Appointment Requests</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <i className="fas fa-envelope me-1"></i>Contact Us
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'assessment' ? 'active' : ''}`}
            onClick={() => setActiveTab('assessment')}
          >
            <i className="fas fa-chart-line me-1"></i>Profile Assessments
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'appointment' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointment')}
          >
            <i className="fas fa-calendar-check me-1"></i>Appointments
          </button>
        </li>
      </ul>

      <div className="tab-content mt-3">
        {/* Contact Us Tab */}
        {activeTab === 'contact' && (
          <div className="tab-pane fade show active">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex gap-2">
                <select className="form-select form-select-sm">
                  <option value="">All Status</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select className="form-select form-select-sm">
                  <option value="">All Visa Types</option>
                  <option value="eb1a">EB-1A</option>
                  <option value="eb2-niw">EB-2 NIW</option>
                  <option value="o1">O-1 Visa</option>
                </select>
              </div>
              <button className="btn btn-success btn-sm" onClick={() => setShowConvertModal(true)}>
                <i className="fas fa-user-plus me-1"></i>Convert to Leads ({selectedContacts.length})
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover">
                <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                  <tr>
                    <th>
                      <input 
                        type="checkbox" 
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={selectedContacts.length === contacts.length && contacts.length > 0}
                      />
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Visa Type</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <div className="spinner-border spinner-border-sm me-2"></div>
                        Loading contact submissions...
                      </td>
                    </tr>
                  ) : (
                    contacts.map(contact => (
                      <tr key={contact._id || contact.id}>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedContacts.includes(contact._id || contact.id)}
                            onChange={(e) => handleContactSelection(contact._id || contact.id, e.target.checked)}
                          />
                        </td>
                        <td><strong>{contact.name}</strong></td>
                        <td>{contact.email}</td>
                        <td>
                          <span className="badge bg-info">
                            {(contact.visa_type || 'other').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(contact.status)}`}>
                            {(contact.status || 'new').replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={getPriorityClass(contact.priority || 'medium')}>
                            {(contact.priority || 'medium').toUpperCase()}
                          </span>
                        </td>
                        <td>{new Date(contact.createdAt || contact.submitted_at).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => viewContactDetails(contact)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="btn btn-outline-success"
                              onClick={() => convertSingleContact(contact._id)}
                              title="Convert to Lead"
                            >
                              <i className="fas fa-user-plus"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Profile Assessments Tab */}
        {activeTab === 'assessment' && (
          <div className="tab-pane fade show active">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex gap-2">
                <select className="form-select form-select-sm">
                  <option value="">All Strengths</option>
                  <option value="Excellent Profile Strength">Excellent</option>
                  <option value="Good Profile Strength">Good</option>
                  <option value="Moderate Profile Strength">Moderate</option>
                  <option value="Needs Development">Needs Development</option>
                </select>
                <input type="number" className="form-control form-control-sm" placeholder="Min Score" />
              </div>
              <button className="btn btn-success btn-sm" onClick={() => setShowConvertModal(true)}>
                <i className="fas fa-user-plus me-1"></i>Convert to Leads ({selectedContacts.length})
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover">
                <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                  <tr>
                    <th><input type="checkbox" /></th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Strength</th>
                    <th>Field</th>
                    <th>Experience</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map(assessment => (
                    <tr key={assessment.id}>
                      <td><input type="checkbox" /></td>
                      <td><strong>{assessment.name}</strong></td>
                      <td>{assessment.email}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="me-2">{assessment.score}</span>
                          <div className="progress" style={{ width: '60px', height: '6px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: `${assessment.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-success">
                          {assessment.strength}
                        </span>
                      </td>
                      <td>{assessment.field}</td>
                      <td>{assessment.experience}</td>
                      <td>{new Date(assessment.submitted_at).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => viewAssessmentDetails(assessment)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="btn btn-outline-success"
                            onClick={() => convertSingleContact(assessment._id)}
                            title="Convert to Lead"
                          >
                            <i className="fas fa-user-plus"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointment' && (
          <div className="tab-pane fade show active">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex gap-2">
                <select className="form-select form-select-sm">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select className="form-select form-select-sm">
                  <option value="">All Visa Types</option>
                  <option value="eb1a">EB-1A</option>
                  <option value="eb2-niw">EB-2 NIW</option>
                  <option value="o1">O-1 Visa</option>
                </select>
              </div>
              <div className="btn-group" role="group">
                <button className="btn btn-primary btn-sm">
                  <i className="fas fa-calendar-plus me-1"></i>Schedule Selected
                </button>
                <button className="btn btn-success btn-sm" onClick={() => setShowConvertModal(true)}>
                  <i className="fas fa-user-plus me-1"></i>Convert to Leads ({selectedContacts.length})
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover">
                <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                  <tr>
                    <th><input type="checkbox" /></th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Visa Category</th>
                    <th>Status</th>
                    <th>Timezone</th>
                    <th>Preferred Time</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appointment => (
                    <tr key={appointment.id}>
                      <td><input type="checkbox" /></td>
                      <td><strong>{appointment.name}</strong></td>
                      <td>{appointment.email}</td>
                      <td>
                        <span className="badge bg-info">
                          {appointment.visa_category.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                          {appointment.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{appointment.timezone}</td>
                      <td>{new Date(appointment.preferred_datetime).toLocaleString()}</td>
                      <td>{new Date(appointment.submitted_at).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => viewAppointmentDetails(appointment)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="btn btn-outline-success"
                            onClick={() => convertSingleContact(appointment._id)}
                            title="Schedule Appointment"
                          >
                            <i className="fas fa-calendar-plus"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Convert to Lead Modal */}
      {showConvertModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="fas fa-user-plus me-2"></i>Convert to Leads
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowConvertModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <h6 className="text-muted">Selected Contacts ({selectedContacts.length})</h6>
                  <p className="small text-muted">
                    Converting {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} to lead{selectedContacts.length !== 1 ? 's' : ''} 
                    for follow-up by Lead Managers.
                  </p>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Lead Priority <span className="text-danger">*</span>
                      </label>
                      <select 
                        className="form-select" 
                        value={convertFormData.priority}
                        onChange={(e) => setConvertFormData(prev => ({ ...prev, priority: e.target.value }))}
                        required
                      >
                        <option value="low">Low Priority - Standard follow-up</option>
                        <option value="medium">Medium Priority - Regular follow-up</option>
                        <option value="high">High Priority - Urgent follow-up</option>
                      </select>
                      <div className="form-text">
                        <small>
                          <strong>Low:</strong> Standard 48-72 hour response time<br/>
                          <strong>Medium:</strong> 24-48 hour response time<br/>
                          <strong>High:</strong> Same day response required
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Assign to Lead Manager</label>
                      <select 
                        className="form-select" 
                        value={convertFormData.assignedTo}
                        onChange={(e) => setConvertFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                      >
                        <option value="">Auto-assign (least busy)</option>
                        <option value="john_smith">John Smith - Lead Manager</option>
                        <option value="sarah_johnson">Sarah Johnson - Lead Manager</option>
                        <option value="david_wilson">David Wilson - Lead Manager</option>
                      </select>
                      <div className="form-text">
                        <small>Leave blank for automatic assignment to the least busy Lead Manager</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Conversion Notes</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={convertFormData.notes}
                    onChange={(e) => setConvertFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes about these leads for the Lead Manager..."
                  ></textarea>
                </div>

                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>What happens next:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Contacts will be converted to leads with the specified priority</li>
                    <li>Lead Manager will be notified of new lead assignments</li>
                    <li>Original contact forms will be marked as "resolved"</li>
                    <li>Lead tracking and follow-up process will begin</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowConvertModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={handleConvertToLead}
                  disabled={selectedContacts.length === 0}
                >
                  <i className="fas fa-user-plus me-1"></i>
                  Convert {selectedContacts.length} Contact{selectedContacts.length !== 1 ? 's' : ''} to Lead{selectedContacts.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsManagement;