import { useState, useEffect } from 'react';
import { contactAPI, profileAssessmentsAPI, appointmentsAPI } from '../../../../services/api';

const ContactsManagement = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const [contacts, setContacts] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
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
      
      // Mock data for demonstration
      setContacts([
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@email.com',
          visa_type: 'eb1a',
          status: 'new',
          priority: 'medium',
          submitted_at: '2026-01-20T10:30:00Z'
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          visa_type: 'eb2-niw',
          status: 'in_progress',
          priority: 'high',
          submitted_at: '2026-01-19T14:20:00Z'
        }
      ]);

      setAssessments([
        {
          id: 1,
          name: 'Michael Chen',
          email: 'mchen@email.com',
          score: 85,
          strength: 'Excellent Profile Strength',
          field: 'Technology',
          experience: '8 years',
          submitted_at: '2026-01-18T09:15:00Z'
        },
        {
          id: 2,
          name: 'Emily Rodriguez',
          email: 'emily.r@email.com',
          score: 72,
          strength: 'Good Profile Strength',
          field: 'Healthcare',
          experience: '6 years',
          submitted_at: '2026-01-17T16:45:00Z'
        }
      ]);

      setAppointments([
        {
          id: 1,
          name: 'David Kim',
          email: 'david.kim@email.com',
          visa_category: 'o1',
          status: 'pending',
          timezone: 'EST',
          preferred_datetime: '2026-01-25T14:00:00Z',
          submitted_at: '2026-01-16T11:30:00Z'
        }
      ]);

      setStats({
        contactForms: 2,
        assessments: 2,
        appointments: 1
      });

    } catch (error) {
      console.error('Error loading contacts data:', error);
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

  const managementCardStyle = {
    background: 'white',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  return (
    <div className="management-card" style={managementCardStyle}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          <i className="fas fa-clipboard-list me-2"></i>
          Contacts Management
        </h5>
        <div className="btn-group" role="group">
          <button className="btn btn-outline-primary btn-sm" onClick={loadContactsData}>
            <i className="fas fa-sync-alt me-1"></i>Refresh
          </button>
        </div>
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
              <button className="btn btn-success btn-sm">
                <i className="fas fa-user-plus me-1"></i>Convert to Leads
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover">
                <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                  <tr>
                    <th><input type="checkbox" /></th>
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
                      <tr key={contact.id}>
                        <td><input type="checkbox" /></td>
                        <td><strong>{contact.name}</strong></td>
                        <td>{contact.email}</td>
                        <td>
                          <span className="badge bg-info">
                            {contact.visa_type.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(contact.status)}`}>
                            {contact.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={getPriorityClass(contact.priority)}>
                            {contact.priority.toUpperCase()}
                          </span>
                        </td>
                        <td>{new Date(contact.submitted_at).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="btn btn-outline-success">
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
              <button className="btn btn-success btn-sm">
                <i className="fas fa-user-plus me-1"></i>Convert to Leads
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
                          <button className="btn btn-outline-primary">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="btn btn-outline-success">
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
                <button className="btn btn-success btn-sm">
                  <i className="fas fa-user-plus me-1"></i>Convert to Leads
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
                          <button className="btn btn-outline-primary">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="btn btn-outline-success">
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
    </div>
  );
};

export default ContactsManagement;