import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects, getStatusBadgeStyle } from '../../../../styles/designSystem';

const ClientAppointments = ({ clientData, apiCall, onRefresh }) => {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalType, setModalType] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    name: '',
    email: '',
    phone: '',
    visa_category: 'other',
    timezone: 'EST',
    preferred_date: '',
    preferred_time: '',
    consultation_type: 'video',
    details: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    loadAppointments();
    // Pre-fill form with client data if available
    if (clientData) {
      setAppointmentData(prev => ({
        ...prev,
        name: clientData.name || '',
        email: clientData.email || '',
        phone: clientData.phone || ''
      }));
    }
  }, [clientData]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      // Load appointments for this client (both self-created and created by staff)
      const response = await apiCall('/appointments');
      if (response.success) {
        const clientAppointments = response.data || [];
        setAppointments(clientAppointments);
        
        // Calculate stats
        const stats = {
          total: clientAppointments.length,
          pending: clientAppointments.filter(a => a.status === 'pending').length,
          confirmed: clientAppointments.filter(a => a.status === 'confirmed').length,
          completed: clientAppointments.filter(a => a.status === 'completed').length,
          cancelled: clientAppointments.filter(a => a.status === 'cancelled').length
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    if (activeTab === 'all') return appointments;
    return appointments.filter(appointment => appointment.status === activeTab);
  };

  const getAppointmentStatusStyle = (status) => {
    const statusStyles = {
      'pending': { background: '#f59e0b', color: 'white' },
      'confirmed': { background: '#10b981', color: 'white' },
      'completed': { background: '#3b82f6', color: 'white' },
      'cancelled': { background: '#ef4444', color: 'white' },
      'rescheduled': { background: '#8b5cf6', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
  };

  const getPriorityStyle = (priority) => {
    const priorityStyles = {
      'high': { background: '#ef4444', color: 'white' },
      'medium': { background: '#f59e0b', color: 'white' },
      'low': { background: '#10b981', color: 'white' }
    };
    return priorityStyles[priority] || { background: '#6b7280', color: 'white' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      date.setHours(parseInt(hours), parseInt(minutes));
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConsultationTypeIcon = (type) => {
    const icons = {
      'video': 'fas fa-video',
      'phone': 'fas fa-phone',
      'in_person': 'fas fa-user-friends'
    };
    return icons[type] || 'fas fa-calendar';
  };

  const getSourceBadge = (source) => {
    const sourceStyles = {
      'client': { background: '#3b82f6', color: 'white', text: 'Self Booked' },
      'staff': { background: '#8b5cf6', color: 'white', text: 'Staff Booked' },
      'admin': { background: '#ef4444', color: 'white', text: 'Admin Booked' }
    };
    return sourceStyles[source] || { background: '#6b7280', color: 'white', text: 'Unknown' };
  };

  const handleScheduleAppointment = async () => {
    try {
      const response = await apiCall('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          ...appointmentData,
          source: 'client'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.success) {
        alert('Appointment request submitted successfully! You will receive a confirmation email shortly.');
        setShowScheduleModal(false);
        setAppointmentData({
          name: clientData?.name || '',
          email: clientData?.email || '',
          phone: clientData?.phone || '',
          visa_category: 'other',
          timezone: 'EST',
          preferred_date: '',
          preferred_time: '',
          consultation_type: 'video',
          details: ''
        });
        loadAppointments();
      } else {
        throw new Error(response.message || 'Failed to schedule appointment');
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert(`Failed to schedule appointment: ${error.message}`);
    }
  };

  // Overview Stats Cards Component
  const StatsCard = ({ icon, number, label, color, bgColor, onClick }) => (
    <div 
      style={{
        ...componentStyles.managementCard,
        margin: 0,
        padding: designSystem.spacing.lg,
        background: bgColor,
        border: `2px solid ${color}`,
        textAlign: 'center',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
      {...(onClick ? hoverEffects.card : {})}
    >
      <i className={`${icon} fa-2x`} style={{ color: color, marginBottom: designSystem.spacing.sm }}></i>
      <h3 style={{ 
        color: color, 
        fontWeight: designSystem.typography.fontWeight.bold,
        marginBottom: '4px',
        fontSize: designSystem.typography.fontSize.xl
      }}>
        {number}
      </h3>
      <small style={{ color: designSystem.colors.gray[600], fontWeight: designSystem.typography.fontWeight.medium }}>
        {label}
      </small>
    </div>
  );

  const AppointmentCard = ({ appointment }) => {
    const sourceBadge = getSourceBadge(appointment.source);
    const isUpcoming = appointment.scheduled_date && new Date(appointment.scheduled_date) > new Date();

    return (
      <div
        style={{
          ...componentStyles.managementCard,
          margin: 0,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          border: isUpcoming && appointment.status === 'confirmed' 
            ? `2px solid ${designSystem.colors.success}` 
            : `1px solid ${designSystem.colors.gray[200]}`
        }}
        {...hoverEffects.card}
        onClick={() => {
          setSelectedAppointment(appointment);
          setModalType('view');
          setShowModal(true);
        }}
      >
        {/* Appointment Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: designSystem.spacing.md
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: designSystem.spacing.sm,
              flexWrap: 'wrap',
              gap: designSystem.spacing.xs
            }}>
              <span style={{
                ...componentStyles.badge,
                background: designSystem.colors.primary,
                color: 'white',
                fontFamily: 'monospace',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                #{appointment._id.slice(-6).toUpperCase()}
              </span>
              <span style={{
                ...componentStyles.badge,
                ...getAppointmentStatusStyle(appointment.status),
                textTransform: 'uppercase',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {appointment.status}
              </span>
              <span style={{
                ...componentStyles.badge,
                ...getPriorityStyle(appointment.priority),
                textTransform: 'uppercase',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {appointment.priority} Priority
              </span>
              <span style={{
                ...componentStyles.badge,
                background: sourceBadge.background,
                color: sourceBadge.color,
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {sourceBadge.text}
              </span>
            </div>
            
            <h6 style={{
              color: designSystem.colors.dark,
              fontWeight: designSystem.typography.fontWeight.semibold,
              marginBottom: designSystem.spacing.sm
            }}>
              {appointment.visa_category?.replace('_', ' ').toUpperCase()} Consultation
            </h6>
          </div>
          
          <div style={{
            textAlign: 'right',
            marginLeft: designSystem.spacing.md
          }}>
            <div style={{
              fontSize: designSystem.typography.fontSize.sm,
              color: designSystem.colors.gray[600],
              marginBottom: '4px'
            }}>
              <i className={getConsultationTypeIcon(appointment.consultation_type)} style={{ marginRight: '4px' }}></i>
              {appointment.consultation_type?.replace('_', ' ').toUpperCase()}
            </div>
            <div style={{
              fontSize: designSystem.typography.fontSize.sm,
              color: designSystem.colors.gray[600]
            }}>
              {appointment.duration_minutes || 60} minutes
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: designSystem.spacing.sm,
          marginBottom: designSystem.spacing.md,
          fontSize: designSystem.typography.fontSize.sm,
          color: designSystem.colors.gray[600]
        }}>
          <div>
            <i className="fas fa-calendar-alt me-2"></i>
            Preferred: {formatDate(appointment.preferred_date)}
          </div>
          <div>
            <i className="fas fa-clock me-2"></i>
            Time: {appointment.preferred_time || 'Not specified'}
          </div>
          {appointment.scheduled_date && (
            <>
              <div style={{ color: designSystem.colors.success.split('(')[0] }}>
                <i className="fas fa-calendar-check me-2"></i>
                Scheduled: {formatDate(appointment.scheduled_date)}
              </div>
              <div style={{ color: designSystem.colors.success.split('(')[0] }}>
                <i className="fas fa-clock me-2"></i>
                At: {appointment.scheduled_time || 'TBD'}
              </div>
            </>
          )}
          <div>
            <i className="fas fa-globe me-2"></i>
            Timezone: {appointment.timezone}
          </div>
          <div>
            <i className="fas fa-envelope me-2"></i>
            {appointment.email}
          </div>
        </div>

        {/* Meeting Link */}
        {appointment.meeting_link && appointment.status === 'confirmed' && (
          <div style={{
            padding: designSystem.spacing.sm,
            background: designSystem.colors.success + '20',
            borderRadius: designSystem.borderRadius.button,
            marginBottom: designSystem.spacing.md
          }}>
            <div style={{
              fontSize: designSystem.typography.fontSize.sm,
              color: designSystem.colors.success.split('(')[0],
              fontWeight: designSystem.typography.fontWeight.medium
            }}>
              <i className="fas fa-link me-2"></i>
              Meeting link available
            </div>
          </div>
        )}

        {/* Details */}
        {appointment.details && (
          <p style={{
            fontSize: designSystem.typography.fontSize.sm,
            color: designSystem.colors.gray[600],
            margin: 0,
            fontStyle: 'italic',
            lineHeight: '1.4'
          }}>
            {appointment.details.length > 100 
              ? `${appointment.details.substring(0, 100)}...` 
              : appointment.details
            }
          </p>
        )}

        {/* Consultation Notes */}
        {appointment.consultation_notes && (
          <div style={{
            marginTop: designSystem.spacing.sm,
            padding: designSystem.spacing.sm,
            background: designSystem.colors.light,
            borderRadius: designSystem.borderRadius.button,
            fontSize: designSystem.typography.fontSize.sm,
            color: designSystem.colors.gray[600]
          }}>
            <strong>Notes:</strong> {appointment.consultation_notes}
          </div>
        )}
      </div>
    );
  };

  const AppointmentDetailModal = () => (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-calendar-alt me-2"></i>
              Appointment Details - #{selectedAppointment?._id.slice(-6).toUpperCase()}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowModal(false)}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {selectedAppointment && (
              <>
                {/* Appointment Overview */}
                <div style={{ marginBottom: designSystem.spacing.lg }}>
                  <h6 style={{ marginBottom: designSystem.spacing.md }}>Appointment Overview</h6>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: designSystem.spacing.md,
                    padding: designSystem.spacing.md,
                    background: designSystem.colors.light,
                    borderRadius: designSystem.borderRadius.button
                  }}>
                    <div>
                      <strong>Name:</strong><br />
                      {selectedAppointment.name}
                    </div>
                    <div>
                      <strong>Email:</strong><br />
                      {selectedAppointment.email}
                    </div>
                    <div>
                      <strong>Phone:</strong><br />
                      {selectedAppointment.phone || 'Not provided'}
                    </div>
                    <div>
                      <strong>Status:</strong><br />
                      <span style={{
                        ...componentStyles.badge,
                        ...getAppointmentStatusStyle(selectedAppointment.status)
                      }}>
                        {selectedAppointment.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <strong>Priority:</strong><br />
                      <span style={{
                        ...componentStyles.badge,
                        ...getPriorityStyle(selectedAppointment.priority)
                      }}>
                        {selectedAppointment.priority.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <strong>Visa Category:</strong><br />
                      {selectedAppointment.visa_category?.replace('_', ' ').toUpperCase()}
                    </div>
                    <div>
                      <strong>Consultation Type:</strong><br />
                      <i className={getConsultationTypeIcon(selectedAppointment.consultation_type)} style={{ marginRight: '8px' }}></i>
                      {selectedAppointment.consultation_type?.replace('_', ' ').toUpperCase()}
                    </div>
                    <div>
                      <strong>Duration:</strong><br />
                      {selectedAppointment.duration_minutes || 60} minutes
                    </div>
                    <div>
                      <strong>Timezone:</strong><br />
                      {selectedAppointment.timezone}
                    </div>
                    <div>
                      <strong>Source:</strong><br />
                      <span style={{
                        ...componentStyles.badge,
                        ...getSourceBadge(selectedAppointment.source)
                      }}>
                        {getSourceBadge(selectedAppointment.source).text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scheduling Information */}
                <div style={{ marginBottom: designSystem.spacing.lg }}>
                  <h6 style={{ marginBottom: designSystem.spacing.md }}>Scheduling Information</h6>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: designSystem.spacing.md,
                    padding: designSystem.spacing.md,
                    background: designSystem.colors.light,
                    borderRadius: designSystem.borderRadius.button
                  }}>
                    <div>
                      <strong>Preferred Date:</strong><br />
                      {formatDate(selectedAppointment.preferred_date)}
                    </div>
                    <div>
                      <strong>Preferred Time:</strong><br />
                      {selectedAppointment.preferred_time || 'Not specified'}
                    </div>
                    {selectedAppointment.scheduled_date && (
                      <>
                        <div>
                          <strong>Scheduled Date:</strong><br />
                          <span style={{ color: designSystem.colors.success.split('(')[0] }}>
                            {formatDate(selectedAppointment.scheduled_date)}
                          </span>
                        </div>
                        <div>
                          <strong>Scheduled Time:</strong><br />
                          <span style={{ color: designSystem.colors.success.split('(')[0] }}>
                            {selectedAppointment.scheduled_time || 'TBD'}
                          </span>
                        </div>
                      </>
                    )}
                    <div>
                      <strong>Submission Date:</strong><br />
                      {formatDate(selectedAppointment.submission_date)}
                    </div>
                    <div>
                      <strong>Follow-up Required:</strong><br />
                      {selectedAppointment.follow_up_required ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>

                {/* Meeting Link */}
                {selectedAppointment.meeting_link && (
                  <div style={{ marginBottom: designSystem.spacing.lg }}>
                    <h6 style={{ marginBottom: designSystem.spacing.md }}>Meeting Information</h6>
                    <div style={{
                      padding: designSystem.spacing.md,
                      background: designSystem.colors.success + '20',
                      borderRadius: designSystem.borderRadius.button,
                      border: `1px solid ${designSystem.colors.success}`
                    }}>
                      <div style={{
                        fontSize: designSystem.typography.fontSize.sm,
                        color: designSystem.colors.success.split('(')[0],
                        fontWeight: designSystem.typography.fontWeight.medium,
                        marginBottom: designSystem.spacing.sm
                      }}>
                        <i className="fas fa-video me-2"></i>
                        Meeting Link Available
                      </div>
                      <a 
                        href={selectedAppointment.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: designSystem.colors.primary,
                          textDecoration: 'none',
                          fontSize: designSystem.typography.fontSize.sm,
                          wordBreak: 'break-all'
                        }}
                      >
                        {selectedAppointment.meeting_link}
                      </a>
                    </div>
                  </div>
                )}

                {/* Details */}
                {selectedAppointment.details && (
                  <div style={{ marginBottom: designSystem.spacing.lg }}>
                    <h6 style={{ marginBottom: designSystem.spacing.md }}>Details</h6>
                    <p style={{
                      padding: designSystem.spacing.md,
                      background: designSystem.colors.light,
                      borderRadius: designSystem.borderRadius.button,
                      margin: 0,
                      lineHeight: '1.6'
                    }}>
                      {selectedAppointment.details}
                    </p>
                  </div>
                )}

                {/* Consultation Notes */}
                {selectedAppointment.consultation_notes && (
                  <div style={{ marginBottom: designSystem.spacing.lg }}>
                    <h6 style={{ marginBottom: designSystem.spacing.md }}>Consultation Notes</h6>
                    <p style={{
                      padding: designSystem.spacing.md,
                      background: designSystem.colors.light,
                      borderRadius: designSystem.borderRadius.button,
                      margin: 0,
                      lineHeight: '1.6'
                    }}>
                      {selectedAppointment.consultation_notes}
                    </p>
                  </div>
                )}

                {/* Communications */}
                <div style={{ marginBottom: designSystem.spacing.lg }}>
                  <h6 style={{ marginBottom: designSystem.spacing.md }}>
                    Communications ({selectedAppointment.communications?.length || 0})
                  </h6>
                  {selectedAppointment.communications && selectedAppointment.communications.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.sm }}>
                      {selectedAppointment.communications.map((comm, index) => (
                        <div key={index} style={{
                          padding: designSystem.spacing.md,
                          background: designSystem.colors.light,
                          borderRadius: designSystem.borderRadius.button,
                          border: `1px solid ${designSystem.colors.gray[200]}`
                        }}>
                          <div style={{
                            fontSize: designSystem.typography.fontSize.sm,
                            color: designSystem.colors.gray[500],
                            marginBottom: designSystem.spacing.xs
                          }}>
                            {formatDate(comm.date)} - {comm.type?.toUpperCase()}
                          </div>
                          <p style={{
                            margin: 0,
                            lineHeight: '1.6'
                          }}>
                            {comm.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: designSystem.spacing.lg,
                      background: designSystem.colors.light,
                      borderRadius: designSystem.borderRadius.button,
                      textAlign: 'center',
                      color: designSystem.colors.gray[500]
                    }}>
                      <i className="fas fa-comments fa-2x mb-3"></i>
                      <p>No communications recorded</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            {selectedAppointment?.meeting_link && selectedAppointment?.status === 'confirmed' && (
              <a 
                href={selectedAppointment.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success me-2"
              >
                <i className="fas fa-video me-2"></i>
                Join Meeting
              </a>
            )}
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ScheduleModal = () => (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-calendar-plus me-2"></i>
              Schedule New Appointment
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowScheduleModal(false)}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: designSystem.spacing.md }}>
              <div>
                <label style={{ display: 'block', marginBottom: designSystem.spacing.xs, fontWeight: designSystem.typography.fontWeight.medium }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={appointmentData.name}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: designSystem.spacing.sm,
                    border: `1px solid ${designSystem.colors.gray[300]}`,
                    borderRadius: designSystem.borderRadius.button,
                    fontSize: designSystem.typography.fontSize.sm
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: designSystem.spacing.xs, fontWeight: designSystem.typography.fontWeight.medium }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={appointmentData.email}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: designSystem.spacing.sm,
                    border: `1px solid ${designSystem.colors.gray[300]}`,
                    borderRadius: designSystem.borderRadius.button,
                    fontSize: designSystem.typography.fontSize.sm
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: designSystem.spacing.xs, fontWeight: designSystem.typography.fontWeight.medium }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={appointmentData.phone}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, phone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: designSystem.spacing.sm,
                    border: `1px solid ${designSystem.colors.gray[300]}`,
                    borderRadius: designSystem.borderRadius.button,
                    fontSize: designSystem.typography.fontSize.sm
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: designSystem.spacing.xs, fontWeight: designSystem.typography.fontWeight.medium }}>
                  Visa Category *
                </label>
                <select
                  value={appointmentData.visa_category}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, visa_category: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: designSystem.spacing.sm,
                    border: `1px solid ${designSystem.colors.gray[300]}`,
                    borderRadius: designSystem.borderRadius.button,
                    fontSize: designSystem.typography.fontSize.sm
                  }}
                  required
                >
                  <option value="eb1a">EB-1A</option>
                  <option value="eb2_niw">EB-2 NIW</option>
                  <option value="o1">O-1</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: designSystem.spacing.xs, fontWeight: designSystem.typography.fontWeight.medium }}>
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={appointmentData.preferred_date}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, preferred_date: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: designSystem.spacing.sm,
                    border: `1px solid ${designSystem.colors.gray[300]}`,
                    borderRadius: designSystem.borderRadius.button,
                    fontSize: designSystem.typography.fontSize.sm
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: designSystem.spacing.xs, fontWeight: designSystem.typography.fontWeight.medium }}>
                  Preferred Time *
                </label>
                <input
                  type="time"
                  value={appointmentData.preferred_time}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, preferred_time: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: designSystem.spacing.sm,
                    border: `1px solid ${designSystem.colors.gray[300]}`,
                    borderRadius: designSystem.borderRadius.button,
                    fontSize: designSystem.typography.fontSize.sm
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: designSystem.spacing.xs, fontWeight: designSystem.typography.fontWeight.medium }}>
                  Timezone *
                </label>
                <select
                  value={appointmentData.timezone}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, timezone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: designSystem.spacing.sm,
                    border: `1px solid ${designSystem.colors.gray[300]}`,
                    borderRadius: designSystem.borderRadius.button,
                    fontSize: designSystem.typography.fontSize.sm
                  }}
                  required
                >
                  <option value="EST">EST (Eastern)</option>
                  <option value="CST">CST (Central)</option>
                  <option value="MST">MST (Mountain)</option>
                  <option value="PST">PST (Pacific)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: designSystem.spacing.xs, fontWeight: designSystem.typography.fontWeight.medium }}>
                  Consultation Type *
                </label>
                <select
                  value={appointmentData.consultation_type}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, consultation_type: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: designSystem.spacing.sm,
                    border: `1px solid ${designSystem.colors.gray[300]}`,
                    borderRadius: designSystem.borderRadius.button,
                    fontSize: designSystem.typography.fontSize.sm
                  }}
                  required
                >
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="in_person">In Person</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginTop: designSystem.spacing.md }}>
              <label style={{ display: 'block', marginBottom: designSystem.spacing.xs, fontWeight: designSystem.typography.fontWeight.medium }}>
                Additional Details
              </label>
              <textarea
                value={appointmentData.details}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, details: e.target.value }))}
                rows={4}
                style={{
                  width: '100%',
                  padding: designSystem.spacing.sm,
                  border: `1px solid ${designSystem.colors.gray[300]}`,
                  borderRadius: designSystem.borderRadius.button,
                  fontSize: designSystem.typography.fontSize.sm,
                  resize: 'vertical'
                }}
                placeholder="Please provide any additional details about your consultation needs..."
              />
            </div>
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowScheduleModal(false)}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleScheduleAppointment}
              disabled={!appointmentData.name || !appointmentData.email || !appointmentData.preferred_date || !appointmentData.preferred_time}
            >
              <i className="fas fa-calendar-plus me-2"></i>
              Schedule Appointment
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
          Loading appointments...
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
            <i className="fas fa-calendar-alt fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>My Appointments</h4>
            <p style={componentStyles.headerSubtitle}>Manage your consultation appointments</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.primary
          }}
          onClick={() => {
            loadAppointments();
            onRefresh?.();
          }}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Overview Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: designSystem.spacing.lg,
        marginBottom: designSystem.spacing.xl
      }}>
        <StatsCard
          icon="fas fa-calendar-alt"
          number={stats.total}
          label="Total Appointments"
          color="#3b82f6"
          bgColor="#eff6ff"
          onClick={() => setActiveTab('all')}
        />
        <StatsCard
          icon="fas fa-clock"
          number={stats.pending}
          label="Pending Appointments"
          color="#f59e0b"
          bgColor="#fffbeb"
          onClick={() => setActiveTab('pending')}
        />
        <StatsCard
          icon="fas fa-check-circle"
          number={stats.confirmed}
          label="Confirmed Appointments"
          color="#10b981"
          bgColor="#ecfdf5"
          onClick={() => setActiveTab('confirmed')}
        />
        <StatsCard
          icon="fas fa-calendar-check"
          number={stats.completed}
          label="Completed Appointments"
          color="#8b5cf6"
          bgColor="#faf5ff"
          onClick={() => setActiveTab('completed')}
        />
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: designSystem.spacing.lg }}>
        <div style={{ display: 'flex', gap: designSystem.spacing.xs, flexWrap: 'wrap' }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'all' ? designSystem.colors.primary : designSystem.colors.gray[100],
              color: activeTab === 'all' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('all')}
            {...hoverEffects.button}
          >
            All Appointments ({stats.total})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'pending' ? designSystem.colors.warning : designSystem.colors.gray[100],
              color: activeTab === 'pending' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('pending')}
            {...hoverEffects.button}
          >
            Pending ({stats.pending})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'confirmed' ? designSystem.colors.success : designSystem.colors.gray[100],
              color: activeTab === 'confirmed' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('confirmed')}
            {...hoverEffects.button}
          >
            Confirmed ({stats.confirmed})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'completed' ? designSystem.colors.info : designSystem.colors.gray[100],
              color: activeTab === 'completed' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('completed')}
            {...hoverEffects.button}
          >
            Completed ({stats.completed})
          </button>
          {stats.cancelled > 0 && (
            <button 
              style={{
                ...componentStyles.primaryButton,
                background: activeTab === 'cancelled' ? designSystem.colors.danger : designSystem.colors.gray[100],
                color: activeTab === 'cancelled' ? 'white' : designSystem.colors.gray[600]
              }}
              onClick={() => setActiveTab('cancelled')}
              {...hoverEffects.button}
            >
              Cancelled ({stats.cancelled})
            </button>
          )}
        </div>
      </div>

      {/* Appointments Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
        gap: designSystem.spacing.lg
      }}>
        {getFilteredAppointments().map(appointment => (
          <AppointmentCard
            key={appointment._id}
            appointment={appointment}
          />
        ))}
      </div>

      {getFilteredAppointments().length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-calendar-alt fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
          <p style={{ color: designSystem.colors.gray[500] }}>
            {activeTab === 'all' ? 'No appointments found' : `No ${activeTab} appointments found`}
          </p>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {showModal && <AppointmentDetailModal />}

      {/* Schedule Appointment Modal */}
      {showScheduleModal && <ScheduleModal />}
    </div>
  );
};

export default ClientAppointments;