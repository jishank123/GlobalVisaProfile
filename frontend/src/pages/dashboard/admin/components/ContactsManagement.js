import { useState, useEffect } from 'react';
import { contactAPI, profileAssessmentsAPI, appointmentsAPI, usersAPI, leadsAPI } from '../../../../services/api';

const ContactsManagement = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const [contacts, setContacts] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false); // NEW: Separate loading state for conversion
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [convertFormData, setConvertFormData] = useState({
    priority: 'medium',
    notes: ''
  });
  const [stats, setStats] = useState({
    contactForms: 0,
    assessments: 0,
    appointments: 0,
    registrations: 0
  });

  useEffect(() => {
    loadContactsData();
  }, []);

  const loadContactsData = async () => {
    try {
      setLoading(true);
      
      // Load contact forms
      const contactsResponse = await contactAPI.getAll();
      let contactsData = [];
      if (contactsResponse.success) {
        contactsData = contactsResponse.data?.contact_forms || contactsResponse.data || [];
        // Filter out converted contacts
        contactsData = contactsData.filter(contact => 
          !contact.converted_to_lead && contact.status !== 'converted'
        );
        setContacts(Array.isArray(contactsData) ? contactsData : []);
      } else {
        setContacts([]);
      }

      // Load profile assessments
      const assessmentsResponse = await profileAssessmentsAPI.getAll();
      let assessmentsData = [];
      if (assessmentsResponse.success) {
        assessmentsData = assessmentsResponse.data?.assessments || assessmentsResponse.data || [];
        // Filter out converted assessments
        assessmentsData = assessmentsData.filter(assessment => 
          assessment.status !== 'Converted' && !assessment.converted_to_lead_id
        );
        setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);
      } else {
        setAssessments([]);
      }

      // Load appointments
      const appointmentsResponse = await appointmentsAPI.getAll();
      let appointmentsData = [];
      if (appointmentsResponse.success) {
        appointmentsData = appointmentsResponse.data?.appointments || appointmentsResponse.data || [];
        // Filter out converted appointments (check if lead exists with same email and source)
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      } else {
        setAppointments([]);
      }

      // Load existing leads to check for duplicates
      const leadsResponse = await leadsAPI.getAll();
      let existingLeadEmails = new Set();
      if (leadsResponse.success) {
        const leadsData = leadsResponse.data?.leads || leadsResponse.data || [];
        existingLeadEmails = new Set(
          leadsData.map(lead => lead.email?.toLowerCase()).filter(Boolean)
        );
      }

      // Load user registrations (clients who registered directly)
      const registrationsResponse = await usersAPI.getAll({ role: 'client' });
      let registrationsData = [];
      if (registrationsResponse.success) {
        registrationsData = registrationsResponse.data || [];
        
        // Filter out users who have filled any forms (to avoid duplicates)
        const contactEmails = contactsData.map(c => c.email?.toLowerCase()).filter(Boolean);
        const assessmentEmails = assessmentsData.map(a => a.client_email?.toLowerCase()).filter(Boolean);
        const appointmentEmails = appointmentsData.map(a => a.email?.toLowerCase()).filter(Boolean);
        
        const formEmails = new Set([...contactEmails, ...assessmentEmails, ...appointmentEmails]);
        
        registrationsData = registrationsData.filter(user => {
          const userEmail = user.email?.toLowerCase();
          return userEmail && 
                 !formEmails.has(userEmail) && // Not filled any forms
                 !existingLeadEmails.has(userEmail); // Not already a lead
        });
        
        setRegistrations(Array.isArray(registrationsData) ? registrationsData : []);
      } else {
        setRegistrations([]);
      }

      // Update statistics with filtered data
      setStats({
        contactForms: Array.isArray(contactsData) ? contactsData.length : 0,
        assessments: Array.isArray(assessmentsData) ? assessmentsData.length : 0,
        appointments: Array.isArray(appointmentsData) ? appointmentsData.length : 0,
        registrations: Array.isArray(registrationsData) ? registrationsData.length : 0
      });

    } catch (error) {
      console.error('Error loading contacts data:', error);
      // Set empty state on error
      setContacts([]);
      setAssessments([]);
      setAppointments([]);
      setRegistrations([]);
      setStats({ contactForms: 0, assessments: 0, appointments: 0, registrations: 0 });
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
    setSelectedContact({
      type: 'contact',
      data: contact
    });
    setShowDetailsModal(true);
  };

  const convertSingleContact = (contact, contactType = 'contact') => {
    setSelectedContact({
      id: contact._id || contact.id,
      type: contactType,
      data: contact
    });
    setShowConvertModal(true);
  };

  const viewAssessmentDetails = (assessment) => {
    setSelectedContact({
      type: 'assessment',
      data: assessment
    });
    setShowDetailsModal(true);
  };

  const viewAppointmentDetails = (appointment) => {
    setSelectedContact({
      type: 'appointment',
      data: appointment
    });
    setShowDetailsModal(true);
  };

  const viewRegistrationDetails = (registration) => {
    setSelectedContact({
      type: 'registration',
      data: registration
    });
    setShowDetailsModal(true);
  };

  const checkLeadExists = async (email) => {
    try {
      const leadsResponse = await leadsAPI.getAll();
      if (leadsResponse.success) {
        const leadsData = leadsResponse.data?.leads || leadsResponse.data || [];
        return leadsData.some(lead => 
          lead.email?.toLowerCase() === email?.toLowerCase()
        );
      }
      return false;
    } catch (error) {
      console.error('Error checking existing leads:', error);
      return false;
    }
  };

  const handleConvertToLead = async () => {
    if (!selectedContact?.id) {
      alert('Please select a contact to convert to lead.');
      return;
    }

    try {
      setConverting(true); // Start loading

      // Get email based on contact type
      let contactEmail;
      switch (selectedContact.type) {
        case 'contact':
          contactEmail = selectedContact.data?.email;
          break;
        case 'assessment':
          contactEmail = selectedContact.data?.client_email;
          break;
        case 'appointment':
        case 'registration':
          contactEmail = selectedContact.data?.email;
          break;
        default:
          contactEmail = selectedContact.data?.email;
      }

      if (!contactEmail) {
        alert('Cannot convert: Email address not found.');
        return;
      }

      // Check if lead already exists with this email
      const leadExists = await checkLeadExists(contactEmail);
      if (leadExists) {
        alert(`⚠️ Warning: A lead already exists with the email "${contactEmail}". Cannot create duplicate lead.`);
        return;
      }

      let response;
      const conversionData = {
        priority: convertFormData.priority
      };

      // Only add notes if they're not empty
      if (convertFormData.notes && convertFormData.notes.trim()) {
        conversionData.notes = convertFormData.notes.trim();
      }

      // Use appropriate API endpoint based on contact type
      switch (selectedContact.type) {
        case 'contact':
          response = await contactAPI.convertToLead(selectedContact.id, conversionData);
          break;
        
        case 'assessment':
          response = await profileAssessmentsAPI.convertToLead(selectedContact.id, conversionData);
          break;
        
        case 'appointment':
          // For appointments, create a new lead since there's no specific convert endpoint
          const appointmentName = selectedContact.data?.name || 'Unknown';
          const nameParts = appointmentName.split(' ');
          const appointmentPhone = selectedContact.data?.phone;
          const appointmentEmail = selectedContact.data?.email;
          
          if (!appointmentEmail) {
            throw new Error('Email is required for appointment conversion');
          }
          
          response = await leadsAPI.create({
            firstName: nameParts[0] || 'Unknown',
            lastName: nameParts.slice(1).join(' ') || 'Unknown',
            email: appointmentEmail,
            phone: (appointmentPhone && appointmentPhone.length >= 10) ? appointmentPhone : undefined,
            source: 'website',
            priority: convertFormData.priority,
            notes: `Converted from appointment request. ${convertFormData.notes || ''}`.trim(),
            estimatedValue: 0
          });
          break;
        
        case 'registration':
          // For user registrations, create a new lead since there's no specific convert endpoint
          const registrationPhone = selectedContact.data?.phone;
          const registrationEmail = selectedContact.data?.email;
          
          if (!registrationEmail) {
            throw new Error('Email is required for registration conversion');
          }
          
          response = await leadsAPI.create({
            firstName: selectedContact.data?.first_name || 'Unknown',
            lastName: selectedContact.data?.last_name || 'Unknown',
            email: registrationEmail,
            phone: (registrationPhone && registrationPhone.length >= 10) ? registrationPhone : undefined,
            source: 'website',
            priority: convertFormData.priority,
            notes: `Converted from user registration. Company: ${selectedContact.data?.company || 'Not specified'}. ${convertFormData.notes || ''}`.trim(),
            estimatedValue: 0
          });
          break;
        
        default:
          throw new Error('Invalid contact type for conversion');
      }

      if (response.success) {
        alert(`✅ Successfully converted ${selectedContact.type} to lead with ${convertFormData.priority} priority!`);
        
        // Remove the converted record from the UI immediately
        switch (selectedContact.type) {
          case 'contact':
            setContacts(prev => prev.filter(c => (c._id || c.id) !== selectedContact.id));
            setStats(prev => ({ ...prev, contactForms: prev.contactForms - 1 }));
            break;
          case 'assessment':
            setAssessments(prev => prev.filter(a => (a._id || a.id) !== selectedContact.id));
            setStats(prev => ({ ...prev, assessments: prev.assessments - 1 }));
            break;
          case 'appointment':
            setAppointments(prev => prev.filter(a => (a._id || a.id) !== selectedContact.id));
            setStats(prev => ({ ...prev, appointments: prev.appointments - 1 }));
            break;
          case 'registration':
            setRegistrations(prev => prev.filter(r => (r._id || r.id) !== selectedContact.id));
            setStats(prev => ({ ...prev, registrations: prev.registrations - 1 }));
            break;
          default:
            console.warn('Unknown contact type:', selectedContact.type);
            break;
        }
        
        setShowConvertModal(false);
        setSelectedContact(null);
        setConvertFormData({ priority: 'medium', notes: '' });
        
        // Optional: Refresh data to ensure consistency
        // loadContactsData();
      } else {
        throw new Error(response.error?.message || 'Conversion failed');
      }
      
    } catch (error) {
      console.error('❌ Error converting to lead:', error);
      alert(`❌ Error converting contact to lead: ${error.message}`);
    } finally {
      setConverting(false); // Stop loading
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
        <div className="col-md-3">
          <div className="card border-primary">
            <div className="card-body text-center">
              <i className="fas fa-user-check fa-2x text-primary mb-2"></i>
              <h4 className="text-primary">{stats.contactForms}</h4>
              <small className="text-muted">Contact Us</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-success">
            <div className="card-body text-center">
              <i className="fas fa-chart-line fa-2x text-success mb-2"></i>
              <h4 className="text-success">{stats.assessments}</h4>
              <small className="text-muted">Profile Assessments</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-warning">
            <div className="card-body text-center">
              <i className="fas fa-calendar-check fa-2x text-warning mb-2"></i>
              <h4 className="text-warning">{stats.appointments}</h4>
              <small className="text-muted">Appointment Requests</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-info">
            <div className="card-body text-center">
              <i className="fas fa-user-plus fa-2x text-info mb-2"></i>
              <h4 className="text-info">{stats.registrations}</h4>
              <small className="text-muted">Registrations</small>
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
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'registration' ? 'active' : ''}`}
            onClick={() => setActiveTab('registration')}
          >
            <i className="fas fa-user-plus me-1"></i>Pure Registrations
          </button>
        </li>
      </ul>

      <div className="tab-content mt-3">
        {/* Contact Us Tab */}
        {activeTab === 'contact' && (
          <div className="tab-pane fade show active">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                  <tr>
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
                      <td colSpan="7" className="text-center">
                        <div className="spinner-border spinner-border-sm me-2"></div>
                        Loading contact submissions...
                      </td>
                    </tr>
                  ) : (
                    (contacts || []).map(contact => (
                      <tr key={contact._id || contact.id}>
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
                              onClick={() => convertSingleContact(contact, 'contact')}
                              title="Convert to Lead"
                            >
                              <i className="fas fa-calendar-plus"></i>
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
            <div className="table-responsive">
              <table className="table table-hover">
                <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                  <tr>
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
                  {(assessments || []).map(assessment => (
                    <tr key={assessment._id || assessment.id}>
                      <td><strong>{assessment.client_name}</strong></td>
                      <td>{assessment.client_email}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="me-2">{assessment.overall_score || 0}</span>
                          <div className="progress" style={{ width: '60px', height: '6px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: `${assessment.overall_score || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-success">
                          {assessment.profile_strength || 'Not calculated'}
                        </span>
                      </td>
                      <td>{assessment.field_of_expertise}</td>
                      <td>{assessment.years_of_experience}</td>
                      <td>{new Date(assessment.createdAt || assessment.submitted_at).toLocaleDateString()}</td>
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
                            onClick={() => convertSingleContact(assessment, 'assessment')}
                            title="Convert to Lead"
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

        {/* Appointments Tab */}
        {activeTab === 'appointment' && (
          <div className="tab-pane fade show active">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                  <tr>
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
                  {(appointments || []).map(appointment => (
                    <tr key={appointment._id || appointment.id}>
                      <td><strong>{appointment.name}</strong></td>
                      <td>{appointment.email}</td>
                      <td>
                        <span className="badge bg-info">
                          {(appointment.visa_category || 'other').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                          {(appointment.status || 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td>{appointment.timezone}</td>
                      <td>{appointment.preferred_date && appointment.preferred_time ? 
                        `${appointment.preferred_date} ${appointment.preferred_time}` : 
                        'Not specified'}</td>
                      <td>{new Date(appointment.createdAt || appointment.submitted_at).toLocaleDateString()}</td>
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
                            onClick={() => convertSingleContact(appointment, 'appointment')}
                            title="Convert to Lead"
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

        {/* User Registrations Tab */}
        {activeTab === 'registration' && (
          <div className="tab-pane fade show active">
            <div className="alert alert-info mb-3">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Registrations:</strong> Users who registered directly but have NOT filled any public forms (Contact Us, Profile Assessment, or Appointment).
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Email Verified</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <div className="spinner-border spinner-border-sm me-2"></div>
                        Loading user registrations...
                      </td>
                    </tr>
                  ) : (
                    (registrations || []).map(registration => (
                      <tr key={registration._id || registration.id}>
                        <td><strong>{registration.first_name} {registration.last_name}</strong></td>
                        <td>{registration.email}</td>
                        <td>{registration.phone || 'Not provided'}</td>
                        <td>{registration.company || 'Not specified'}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(registration.status || 'active')}`}>
                            {(registration.status || 'active').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${registration.email_verified ? 'bg-success' : 'bg-warning'}`}>
                            {registration.email_verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td>{new Date(registration.createdAt || registration.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => viewRegistrationDetails(registration)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="btn btn-outline-success"
                              onClick={() => convertSingleContact(registration, 'registration')}
                              title="Convert to Lead"
                            >
                              <i className="fas fa-calendar-plus"></i>
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
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedContact && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="fas fa-eye me-2"></i>
                  {selectedContact.type === 'contact' && 'Contact Details'}
                  {selectedContact.type === 'assessment' && 'Profile Assessment Details'}
                  {selectedContact.type === 'appointment' && 'Appointment Details'}
                  {selectedContact.type === 'registration' && 'User Registration Details'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {selectedContact.type === 'contact' && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Name</label>
                        <p className="fw-bold">{selectedContact.data.name}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Email</label>
                        <p className="fw-bold">{selectedContact.data.email}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Phone</label>
                        <p className="fw-bold">{selectedContact.data.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Visa Type</label>
                        <p className="fw-bold">{selectedContact.data.visa_type || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Status</label>
                        <span className={`badge ${getStatusBadgeClass(selectedContact.data.status)}`}>
                          {(selectedContact.data.status || 'new').replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Submitted</label>
                        <p className="fw-bold">{new Date(selectedContact.data.createdAt || selectedContact.data.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label text-muted">Message</label>
                        <p className="fw-bold">{selectedContact.data.message || 'No message provided'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedContact.type === 'assessment' && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Name</label>
                        <p className="fw-bold">{selectedContact.data.client_name}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Email</label>
                        <p className="fw-bold">{selectedContact.data.client_email}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Overall Score</label>
                        <p className="fw-bold">{selectedContact.data.overall_score || 'Not calculated'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Status</label>
                        <span className={`badge ${getStatusBadgeClass(selectedContact.data.status)}`}>
                          {(selectedContact.data.status || 'pending').replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Education Score</label>
                        <p className="fw-bold">{selectedContact.data.education_score || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Experience Score</label>
                        <p className="fw-bold">{selectedContact.data.experience_score || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Publications Score</label>
                        <p className="fw-bold">{selectedContact.data.publications_score || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Awards Score</label>
                        <p className="fw-bold">{selectedContact.data.awards_score || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label text-muted">Submitted</label>
                        <p className="fw-bold">{new Date(selectedContact.data.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedContact.type === 'appointment' && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Name</label>
                        <p className="fw-bold">{selectedContact.data.name}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Email</label>
                        <p className="fw-bold">{selectedContact.data.email}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Phone</label>
                        <p className="fw-bold">{selectedContact.data.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Visa Category</label>
                        <p className="fw-bold">{selectedContact.data.visa_category || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Consultation Type</label>
                        <p className="fw-bold">{selectedContact.data.consultation_type || 'Video'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Preferred Date</label>
                        <p className="fw-bold">{selectedContact.data.preferred_date ? new Date(selectedContact.data.preferred_date).toLocaleDateString() : 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Preferred Time</label>
                        <p className="fw-bold">{selectedContact.data.preferred_time || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Status</label>
                        <span className={`badge ${getStatusBadgeClass(selectedContact.data.status)}`}>
                          {(selectedContact.data.status || 'pending').replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Submitted</label>
                        <p className="fw-bold">{new Date(selectedContact.data.createdAt || selectedContact.data.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label text-muted">Details</label>
                        <p className="fw-bold">{selectedContact.data.details || 'No details provided'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedContact.type === 'registration' && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Name</label>
                        <p className="fw-bold">{selectedContact.data.first_name} {selectedContact.data.last_name}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Email</label>
                        <p className="fw-bold">{selectedContact.data.email}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Phone</label>
                        <p className="fw-bold">{selectedContact.data.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Company</label>
                        <p className="fw-bold">{selectedContact.data.company || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Country</label>
                        <p className="fw-bold">{selectedContact.data.country || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Status</label>
                        <span className={`badge ${getStatusBadgeClass(selectedContact.data.status)}`}>
                          {(selectedContact.data.status || 'active').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Email Verified</label>
                        <span className={`badge ${selectedContact.data.email_verified ? 'bg-success' : 'bg-warning'}`}>
                          {selectedContact.data.email_verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Last Login</label>
                        <p className="fw-bold">{selectedContact.data.last_login ? new Date(selectedContact.data.last_login).toLocaleDateString() : 'Never'}</p>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label text-muted">Registered</label>
                        <p className="fw-bold">{new Date(selectedContact.data.createdAt || selectedContact.data.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={() => {
                    setShowDetailsModal(false);
                    convertSingleContact(selectedContact.data, selectedContact.type);
                  }}
                >
                  <i className="fas fa-calendar-plus me-1"></i>
                  Convert to Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Lead Modal */}
      {showConvertModal && selectedContact && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="fas fa-user-plus me-2"></i>Convert to Lead
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowConvertModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <h6 className="text-muted">Converting Contact to Lead</h6>
                  <p className="small text-muted">
                    This contact will be converted to a lead for follow-up by Lead Managers.
                  </p>
                </div>

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

                <div className="mb-3">
                  <label className="form-label fw-bold">Conversion Notes</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={convertFormData.notes}
                    onChange={(e) => setConvertFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes about this lead for the Lead Manager..."
                  ></textarea>
                </div>

                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>What happens next:</strong>
                  <ul className="mb-0 mt-2">
                    <li>System will check if a lead already exists with this email</li>
                    <li>If no duplicate found, contact will be converted to a lead with the specified priority</li>
                    <li>Lead Manager will be automatically assigned</li>
                    <li>Original contact will be marked as "converted" and removed from this list</li>
                    <li>Lead tracking and follow-up process will begin</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowConvertModal(false)}
                  disabled={converting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={handleConvertToLead}
                  disabled={converting}
                >
                  {converting ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-1"></i>
                      Converting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-calendar-plus me-1"></i>
                      Convert to Lead
                    </>
                  )}
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