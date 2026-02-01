import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects, getStatusBadgeStyle } from '../../../../styles/designSystem';

const ClientAppointments = ({ clientData, apiCall, onRefresh }) => {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    preferred_date: '',
    preferred_time: '',
    consultation_type: 'video',
    visa_category: 'other',
    details: '',
    timezone: 'EST'
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/appointments/client/' + clientData?.email);
      if (response.success) {
        setAppointments(response.data || []);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    const now = new Date();
    if (activeTab === 'all') return appointments;
    return appointments.filter(appointment => {
      switch (activeTab) {
        case 'upcoming':
          return new Date(appointment.scheduled_date) > now && appointment.status !== 'completed' && appointment.status !== 'cancelled';
        case 'completed':
          return appointment.status === 'completed';
        case 'cancelled':
          return appointment.status === 'cancelled';
        default:
          return true;
      }
    });
  };

  const getAppointmentCounts = () => {
    const now = new Date();
    return {
      total: appointments.length,
      upcoming: appointments.filter(a => new Date(a.scheduled_date) > now && a.status !== 'completed' && a.status !== 'cancelled').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length
    };
  };

  const getAppointmentStatusStyle = (status) => {
    const statusStyles = {
      'scheduled': { background: '#3b82f6', color: 'white' },
      'confirmed': { background: '#10b981', color: 'white' },
      'completed': { background: '#10b981', color: 'white' },
      'cancelled': { background: '#ef4444', color: 'white' },
      'rescheduled': { background: '#f59e0b', color: 'white' },
      'pending': { background: '#f59e0b', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
  };

  const handleScheduleAppointment = async () => {
    try {
      const response = await apiCall('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          name: `${clientData.first_name} ${clientData.last_name}`,
          email: clientData.email,
          phone: clientData.phone || '',
          visa_category: appointmentData.visa_category,
          timezone: appointmentData.timezone,
          preferred_date: appointmentData.preferred_date,
          preferred_time: appointmentData.preferred_time,
          consultation_type: appointmentData.consultation_type,
          details: appointmentData.details,
          status: 'scheduled',
          priority: 'medium',
          created_by: clientData._id
        })
      });

      if (response.success) {
        alert('Appointment scheduled successfully! You will receive a confirmation email shortly.');
        setShowScheduleModal(false);
        setAppointmentData({
          preferred_date: '',
          preferred_time: '',
          consultation_type: 'video',
          visa_category: 'other',
          details: '',
          timezone: 'EST'
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

  const AppointmentCard = ({ appointment }) => {
    const appointmentDate = new Date(appointment.scheduled_date);
    const isUpcoming = appointmentDate > new Date() && appointment.status !== 'completed' && appointment.status !== 'cancelled';
    
    return (
      <div
        style={{
          ...componentStyles.managementCard,
          margin: 0,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          borderLeft: `4px solid ${isUpcoming ? '#3b82f6' : '#6b7280'}`
        }}
        {...hoverEffects.card}
        onClick={() => {
          setSelectedAppointment(appointment);
          setShowModal(true);
        }}
      >
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
              marginBottom: designSystem.spacing.sm
            }}>
              <span style={{
                ...componentStyles.badge,
                ...getAppointmentStatusStyle(appointment.status),
                textTransform: 'uppercase',
                fontSize: '11px',
                fontWeight: '600',
                marginRight: designSystem.spacing.sm
              }}>
                {appointment.status}
              </span>
              <span style={{
                ...componentStyles.badge,
                background: designSystem.colors.primary,
                color: 'white',
                fontSize: '11px'
              }}>
                {appointment.consultation_type?.toUpperCase() || 'VIDEO'}
              </span>
            </div>
            
            <h5 style={{
              color: designSystem.colors.dark,
              fontWeight: designSystem.typography.fontWeight.semibold,
              marginBottom: designSystem.spacing.sm
            }}>
              {appointment.visa_category === 'other' ? 'General Consultation' : appointment.visa_category} Consultation
            </h5>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: designSystem.colors.gray[600],
              fontSize: designSystem.typography.fontSize.sm,
              marginBottom: designSystem.spacing.sm
            }}>
              <i className="fas fa-calendar me-2"></i>
              {appointmentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: designSystem.colors.gray[600],
              fontSize: designSystem.typography.fontSize.sm,
              marginBottom: designSystem.spacing.md
            }}>
              <i className="fas fa-clock me-2"></i>
              {appointmentDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })} ({appointment.timezone || 'EST'})
            </div>
          </div>
          
          <div style={{
            textAlign: 'right',
            marginLeft: designSystem.spacing.md
          }}>
            <div style={{
              fontSize: designSystem.typography.fontSize.sm,
              fontWeight: designSystem.typography.fontWeight.medium,
              color: isUpcoming ? '#3b82f6' : designSystem.colors.gray[500],
              marginBottom: '4px'
            }}>
              {isUpcoming ? 'Upcoming' : 'Past'}
            </div>
            <div style={{
              fontSize: designSystem.typography.fontSize.xs,
              color: designSystem.colors.gray[500]
            }}>
              {appointment.priority?.toUpperCase() || 'MEDIUM'} Priority
            </div>
          </div>
        </div>

        {appointment.details && (
          <div style={{
            background: designSystem.colors.light,
            padding: designSystem.spacing.sm,
            borderRadius: designSystem.borderRadius.small,
            marginBottom: designSystem.spacing.md
          }}>
            <div style={{
              fontSize: designSystem.typography.fontSize.xs,
              color: designSystem.colors.gray[500],
              marginBottom: '2px'
            }}>
              Details
            </div>
            <div style={{
              fontSize: designSystem.typography.fontSize.sm,
              color: designSystem.colors.dark
            }}>
              {appointment.details}
            </div>
          </div>
        )}

        {/* Assigned Staff */}
        {appointment.assigned_to && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: designSystem.spacing.md
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: designSystem.colors.primary,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: designSystem.typography.fontWeight.bold,
              marginRight: designSystem.spacing.sm
            }}>
              {appointment.assigned_to.first_name?.charAt(0)}{appointment.assigned_to.last_name?.charAt(0)}
            </div>
            <div>
              <div style={{
                fontSize: designSystem.typography.fontSize.sm,
                fontWeight: designSystem.typography.fontWeight.medium,
                color: designSystem.colors.dark
              }}>
                {appointment.assigned_to.first_name} {appointment.assigned_to.last_name}
              </div>
              <div style={{
                fontSize: designSystem.typography.fontSize.xs,
                color: designSystem.colors.gray[500]
              }}>
                {appointment.assigned_to.role?.replace('_', ' ').toUpperCase() || 'CONSULTANT'}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: designSystem.spacing.sm,
          paddingTop: designSystem.spacing.md,
          borderTop: `1px solid ${designSystem.colors.gray[200]}`
        }}>
          <button
            style={{
              ...componentStyles.primaryButton,
              flex: 1,
              background: designSystem.colors.primary,
              fontSize: designSystem.typography.fontSize.sm
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAppointment(appointment);
              setShowModal(true);
            }}
            {...hoverEffects.button}
          >
            <i className="fas fa-eye me-2"></i>View Details
          </button>
          {isUpcoming && (
            <button
              style={{
                ...componentStyles.secondaryButton,
                fontSize: designSystem.typography.fontSize.sm
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Reschedule functionality
              }}
              {...hoverEffects.button}
            >
              <i className="fas fa-calendar-alt me-2"></i>Reschedule
            </button>
          )}
        </div>
      </div>
    );
  };

  const AppointmentModal = () => (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-calendar-alt me-2"></i>
              Appointment Details
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowModal(false)}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {selectedAppointment && (
              <div>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Appointment Information
                    </h6>
                    <p><strong>Type:</strong> {selectedAppointment.visa_category === 'other' ? 'General Consultation' : selectedAppointment.visa_category}</p>
                    <p><strong>Status:</strong> 
                      <span style={{
                        ...componentStyles.badge,
                        ...getAppointmentStatusStyle(selectedAppointment.status),
                        marginLeft: '8px'
                      }}>
                        {selectedAppointment.status.toUpperCase()}
                      </span>
                    </p>
                    <p><strong>Consultation Type:</strong> {selectedAppointment.consultation_type?.toUpperCase() || 'VIDEO'}</p>
                    <p><strong>Priority:</strong> {selectedAppointment.priority?.toUpperCase() || 'MEDIUM'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Schedule
                    </h6>
                    <p><strong>Date:</strong> {new Date(selectedAppointment.scheduled_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                    <p><strong>Time:</strong> {new Date(selectedAppointment.scheduled_date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                    <p><strong>Timezone:</strong> {selectedAppointment.timezone || 'EST'}</p>
                    <p><strong>Duration:</strong> 60 minutes (estimated)</p>
                  </div>
                </div>

                {selectedAppointment.assigned_to && (
                  <div className="mb-4">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Assigned Consultant
                    </h6>
                    <div style={{
                      background: designSystem.colors.light,
                      padding: designSystem.spacing.md,
                      borderRadius: designSystem.borderRadius.button,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: designSystem.colors.primary,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: designSystem.typography.fontWeight.bold,
                        marginRight: designSystem.spacing.md
                      }}>
                        {selectedAppointment.assigned_to.first_name?.charAt(0)}{selectedAppointment.assigned_to.last_name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                          {selectedAppointment.assigned_to.first_name} {selectedAppointment.assigned_to.last_name}
                        </div>
                        <div style={{ 
                          fontSize: designSystem.typography.fontSize.sm,
                          color: designSystem.colors.gray[600]
                        }}>
                          {selectedAppointment.assigned_to.role?.replace('_', ' ').toUpperCase() || 'CONSULTANT'}
                        </div>
                        {selectedAppointment.assigned_to.email && (
                          <div style={{ 
                            fontSize: designSystem.typography.fontSize.sm,
                            color: designSystem.colors.gray[500]
                          }}>
                            {selectedAppointment.assigned_to.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedAppointment.details && (
                  <div className="mb-4">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Details & Notes
                    </h6>
                    <div style={{
                      background: designSystem.colors.light,
                      padding: designSystem.spacing.md,
                      borderRadius: designSystem.borderRadius.button
                    }}>
                      {selectedAppointment.details}
                    </div>
                  </div>
                )}

                {selectedAppointment.meeting_link && (
                  <div className="mb-4">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Meeting Link
                    </h6>
                    <div style={{
                      background: designSystem.colors.light,
                      padding: designSystem.spacing.md,
                      borderRadius: designSystem.borderRadius.button
                    }}>
                      <a 
                        href={selectedAppointment.meeting_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: designSystem.colors.primary.split('(')[0] }}
                      >
                        <i className="fas fa-video me-2"></i>
                        Join Meeting
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
            {selectedAppointment && new Date(selectedAppointment.scheduled_date) > new Date() && selectedAppointment.status !== 'completed' && selectedAppointment.status !== 'cancelled' && (
              <button 
                type="button" 
                className="btn btn-warning"
                onClick={() => {
                  // Reschedule functionality
                }}
              >
                <i className="fas fa-calendar-alt me-2"></i>Reschedule
              </button>
            )}
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
              <i className="fas fa-plus me-2"></i>
              Schedule New Appointment
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowScheduleModal(false)}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Preferred Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={appointmentData.preferred_date}
                  onChange={(e) => setAppointmentData({...appointmentData, preferred_date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Preferred Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={appointmentData.preferred_time}
                  onChange={(e) => setAppointmentData({...appointmentData, preferred_time: e.target.value})}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Consultation Type</label>
                <select
                  className="form-control"
                  value={appointmentData.consultation_type}
                  onChange={(e) => setAppointmentData({...appointmentData, consultation_type: e.target.value})}
                >
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Visa Category</label>
                <select
                  className="form-control"
                  value={appointmentData.visa_category}
                  onChange={(e) => setAppointmentData({...appointmentData, visa_category: e.target.value})}
                >
                  <option value="other">General Consultation</option>
                  <option value="eb1a">EB-1A</option>
                  <option value="eb2-niw">EB-2 NIW</option>
                  <option value="o1">O-1 Visa</option>
                  <option value="h1b">H-1B</option>
                  <option value="l1">L-1</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Timezone</label>
                <select
                  className="form-control"
                  value={appointmentData.timezone}
                  onChange={(e) => setAppointmentData({...appointmentData, timezone: e.target.value})}
                >
                  <option value="EST">Eastern Time (EST)</option>
                  <option value="CST">Central Time (CST)</option>
                  <option value="MST">Mountain Time (MST)</option>
                  <option value="PST">Pacific Time (PST)</option>
                </select>
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Details & Questions</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={appointmentData.details}
                  onChange={(e) => setAppointmentData({...appointmentData, details: e.target.value})}
                  placeholder="Please describe what you'd like to discuss during the consultation..."
                ></textarea>
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
                Your appointment request will be reviewed and confirmed by our team. You'll receive an email with meeting details once approved.
              </p>
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
              disabled={!appointmentData.preferred_date || !appointmentData.preferred_time}
            >
              <i className="fas fa-calendar-plus me-2"></i>
              Schedule Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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

  if (loading) {
    return (
      <div style={componentStyles.loading}>
        <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
        <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>
          Loading your appointments...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Actions */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-calendar-alt fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>My Appointments</h4>
            <p style={componentStyles.headerSubtitle}>Schedule and manage your consultation appointments</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.success
            }}
            onClick={() => setShowScheduleModal(true)}
            {...hoverEffects.button}
          >
            <i className="fas fa-plus me-2"></i>Schedule Appointment
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.info
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
      </div>

      {/* Appointment Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-calendar-alt"
          number={getAppointmentCounts().total}
          label="Total Appointments"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
        <StatCard
          icon="fas fa-clock"
          number={getAppointmentCounts().upcoming}
          label="Upcoming"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={getAppointmentCounts().completed}
          label="Completed"
          borderColor="#10b981"
          iconColor="#10b981"
        />
        <StatCard
          icon="fas fa-times-circle"
          number={getAppointmentCounts().cancelled}
          label="Cancelled"
          borderColor="#ef4444"
          iconColor="#ef4444"
        />
      </div>

      {/* Appointment Tabs */}
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
            All Appointments ({getAppointmentCounts().total})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'upcoming' ? '#3b82f6' : designSystem.colors.gray[100],
              color: activeTab === 'upcoming' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('upcoming')}
            {...hoverEffects.button}
          >
            Upcoming ({getAppointmentCounts().upcoming})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'completed' ? '#10b981' : designSystem.colors.gray[100],
              color: activeTab === 'completed' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('completed')}
            {...hoverEffects.button}
          >
            Completed ({getAppointmentCounts().completed})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'cancelled' ? '#ef4444' : designSystem.colors.gray[100],
              color: activeTab === 'cancelled' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('cancelled')}
            {...hoverEffects.button}
          >
            Cancelled ({getAppointmentCounts().cancelled})
          </button>
        </div>
      </div>

      {/* Appointments Grid */}
      {getFilteredAppointments().length === 0 ? (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-calendar-alt fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>
            No {activeTab === 'all' ? '' : activeTab} appointments found
          </h6>
          <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.lg }}>
            {activeTab === 'all' 
              ? 'You haven\'t scheduled any appointments yet. Book your first consultation!'
              : `You don't have any ${activeTab} appointments at the moment.`}
          </p>
          {activeTab === 'all' && (
            <button
              style={componentStyles.primaryButton}
              onClick={() => setShowScheduleModal(true)}
              {...hoverEffects.button}
            >
              <i className="fas fa-calendar-plus me-2"></i>Schedule Your First Appointment
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: designSystem.spacing.lg
        }}>
          {getFilteredAppointments().map(appointment => (
            <AppointmentCard key={appointment._id} appointment={appointment} />
          ))}
        </div>
      )}

      {/* Appointment Details Modal */}
      {showModal && <AppointmentModal />}

      {/* Schedule Appointment Modal */}
      {showScheduleModal && <ScheduleModal />}
    </div>
  );
};

export default ClientAppointments;