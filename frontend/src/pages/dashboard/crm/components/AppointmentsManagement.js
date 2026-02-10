import { useState, useEffect } from 'react';
import { appointmentsAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const AppointmentsManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  useEffect(() => {
    loadMyAppointments();
  }, []);

  const loadMyAppointments = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading CRM manager appointments...');
      
      // Get appointments created by current CRM manager
      const response = await appointmentsAPI.getMyAppointments();
      
      console.log('📅 Appointments API Response:', response);
      
      if (response && response.success) {
        console.log('✅ Appointments loaded successfully:', response.data?.length || 0);
        setAppointments(response.data || []);
      } else {
        console.error('❌ Failed to load appointments:', response?.error);
        setAppointments([]);
      }
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      'scheduled': 'Scheduled',
      'confirmed': 'Confirmed',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'no_show': 'No Show',
      'rescheduled': 'Rescheduled'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'scheduled': '#3b82f6',
      'confirmed': '#10b981',
      'completed': '#6b7280',
      'cancelled': '#ef4444',
      'no_show': '#ef4444',
      'rescheduled': '#f59e0b'
    };
    return colorMap[status] || '#6b7280';
  };

  const formatDateTime = (appointment) => {
    // Safety check
    if (!appointment) return 'Not specified';
    
    // Try multiple field combinations to get the date/time
    const dateTime = appointment.datetime || 
                    appointment.scheduledFor || 
                    appointment.scheduled_date || 
                    appointment.preferred_date;
    
    const time = appointment.scheduled_time || 
                appointment.preferred_time;
    
    if (!dateTime && !time) return 'Not specified';
    
    // If we have both date and time separately
    if (dateTime && time && !appointment.datetime && !appointment.scheduledFor) {
      try {
        const date = new Date(dateTime);
        const [hours, minutes] = time.split(':');
        date.setHours(parseInt(hours), parseInt(minutes));
        
        if (isNaN(date.getTime())) return 'Invalid date';
        
        return date.toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error('Error parsing date/time:', error);
        return `${new Date(dateTime).toLocaleDateString()} at ${time}`;
      }
    }
    
    // If we have a combined datetime
    if (dateTime) {
      try {
        const date = new Date(dateTime);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        return date.toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error('Error parsing datetime:', error);
        return 'Invalid date';
      }
    }
    
    return 'Not specified';
  };

  const isUpcoming = (appointment) => {
    if (!appointment) return false;
    
    const dateTime = appointment.datetime || 
                    appointment.scheduledFor || 
                    appointment.scheduled_date || 
                    appointment.preferred_date;
    
    if (!dateTime) return false;
    
    try {
      const date = new Date(dateTime);
      return !isNaN(date.getTime()) && date > new Date();
    } catch (error) {
      console.error('Error checking if appointment is upcoming:', error);
      return false;
    }
  };

  const isPast = (appointment) => {
    if (!appointment) return false;
    
    const dateTime = appointment.datetime || 
                    appointment.scheduledFor || 
                    appointment.scheduled_date || 
                    appointment.preferred_date;
    
    if (!dateTime) return false;
    
    try {
      const date = new Date(dateTime);
      return !isNaN(date.getTime()) && date < new Date();
    } catch (error) {
      console.error('Error checking if appointment is past:', error);
      return false;
    }
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const getAppointmentTypeIcon = (type) => {
    const icons = {
      'consultation': 'fas fa-comments',
      'follow_up': 'fas fa-phone',
      'document_review': 'fas fa-file-alt',
      'meeting': 'fas fa-handshake',
      'interview': 'fas fa-user-tie',
      'video_call': 'fas fa-video',
      'phone_call': 'fas fa-phone',
      'in_person': 'fas fa-handshake'
    };
    return icons[type] || 'fas fa-calendar';
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
        {loading ? '...' : number}
      </h4>
      <small style={{ color: designSystem.colors.gray[500] }}>
        {label}
      </small>
    </div>
  );

  // Calculate stats
  const getAppointmentStats = () => {
    return {
      total: appointments.length,
      upcoming: appointments.filter(apt => isUpcoming(apt)).length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
      scheduled: appointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed').length
    };
  };

  const stats = getAppointmentStats();

  return (
    <div style={componentStyles.managementCard}>
      {/* Header */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-calendar-alt fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>My Appointments & Meetings</h4>
            <p style={componentStyles.headerSubtitle}>Meetings scheduled by you with clients</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={loadMyAppointments}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Overview Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-calendar-alt"
          number={stats.total}
          label="Total Meetings"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
        <StatCard
          icon="fas fa-clock"
          number={stats.upcoming}
          label="Upcoming"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
        <StatCard
          icon="fas fa-calendar-check"
          number={stats.scheduled}
          label="Scheduled"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={stats.completed}
          label="Completed"
          borderColor="#10b981"
          iconColor="#10b981"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div style={componentStyles.loading}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
          <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading appointments...</p>
        </div>
      )}

      {/* Appointments Table */}
      {!loading && (
        <>
          {appointments.length === 0 ? (
            <div style={componentStyles.emptyState}>
              <i className="fas fa-calendar-alt fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
              <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>No appointments scheduled</h6>
              <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.lg }}>Schedule meetings with your clients from the projects section</p>
            </div>
          ) : (
            <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={componentStyles.tableHeader}>
                  <tr>
                    <th style={componentStyles.tableHeaderCell}>Date & Time</th>
                    <th style={componentStyles.tableHeaderCell}>Client</th>
                    <th style={componentStyles.tableHeaderCell}>Type</th>
                    <th style={componentStyles.tableHeaderCell}>Status</th>
                    <th style={componentStyles.tableHeaderCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => {
                    const upcoming = isUpcoming(appointment);
                    const past = isPast(appointment);
                    
                    return (
                      <tr 
                        key={appointment._id}
                        style={{
                          ...componentStyles.tableRow,
                          backgroundColor: upcoming ? '#eff6ff' : past ? '#f9fafb' : 'white'
                        }}
                        {...hoverEffects.tableRow}
                      >
                        <td style={componentStyles.tableCell}>
                          <div style={{ 
                            color: upcoming ? '#1d4ed8' : past ? '#6b7280' : '#374151',
                            fontWeight: upcoming ? '600' : '400'
                          }}>
                            {formatDateTime(appointment)}
                            {upcoming && (
                              <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>Upcoming</div>
                            )}
                            {past && (
                              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Past</div>
                            )}
                          </div>
                        </td>
                        <td style={componentStyles.tableCell}>
                          <div>
                            <div style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                              {appointment.clientName || appointment.name || 'Unknown Client'}
                            </div>
                            <div style={{ fontSize: '13px', color: designSystem.colors.gray[500] }}>
                              {appointment.clientEmail || appointment.email || 'No email'}
                            </div>
                          </div>
                        </td>
                        <td style={componentStyles.tableCell}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className={`${getAppointmentTypeIcon(appointment.type || appointment.consultation_type)} text-gray-500`}></i>
                            <span style={{ textTransform: 'capitalize' }}>
                              {appointment.type?.replace('_', ' ') || appointment.consultation_type || 'Meeting'}
                            </span>
                          </div>
                        </td>
                        <td style={componentStyles.tableCell}>
                          <span style={{
                            ...componentStyles.badge,
                            background: getStatusColor(appointment.status),
                            color: 'white',
                            textTransform: 'uppercase',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {formatStatus(appointment.status)}
                          </span>
                        </td>
                        <td style={componentStyles.tableCell}>
                          <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleViewAppointment(appointment)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {appointment.meeting_link && (
                              <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() => window.open(appointment.meeting_link, '_blank')}
                                title="Join Meeting"
                              >
                                <i className="fas fa-video"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Appointment Details Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div className="modal" style={componentStyles.modal}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={componentStyles.modalContent}>
              <div className="modal-header" style={componentStyles.modalHeader}>
                <h5 className="modal-title">
                  <i className="fas fa-calendar-alt me-2"></i>
                  Appointment Details
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAppointmentModal(false)}></button>
              </div>
              
              <div className="modal-body" style={componentStyles.modalBody}>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Client:</strong> {selectedAppointment?.clientName || selectedAppointment?.name || 'Unknown Client'}</p>
                    <p><strong>Email:</strong> {selectedAppointment?.clientEmail || selectedAppointment?.email || 'N/A'}</p>
                    <p><strong>Type:</strong> 
                      <span style={{ marginLeft: '8px', textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center' }}>
                        <i className={`${getAppointmentTypeIcon(selectedAppointment?.type)} me-2`}></i>
                        {selectedAppointment?.type?.replace('_', ' ') || 'Meeting'}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Date & Time:</strong> {formatDateTime(selectedAppointment)}</p>
                    <p><strong>Status:</strong> 
                      <span style={{
                        marginLeft: '8px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: getStatusColor(selectedAppointment?.status),
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {formatStatus(selectedAppointment?.status)}
                      </span>
                    </p>
                    <p><strong>Duration:</strong> {selectedAppointment?.duration || '60'} minutes</p>
                  </div>
                </div>

                {selectedAppointment?.title && (
                  <div className="mb-3">
                    <strong>Title:</strong>
                    <div style={{ marginTop: '8px', padding: '12px', background: designSystem.colors.gray[100], borderRadius: '8px' }}>
                      {selectedAppointment.title}
                    </div>
                  </div>
                )}

                {selectedAppointment?.agenda && (
                  <div className="mb-3">
                    <strong>Agenda:</strong>
                    <div style={{ marginTop: '8px', padding: '12px', background: designSystem.colors.gray[100], borderRadius: '8px' }}>
                      {selectedAppointment.agenda}
                    </div>
                  </div>
                )}

                {selectedAppointment?.notes && (
                  <div className="mb-3">
                    <strong>Notes:</strong>
                    <div style={{ marginTop: '8px', padding: '12px', background: designSystem.colors.gray[100], borderRadius: '8px' }}>
                      {selectedAppointment.notes}
                    </div>
                  </div>
                )}

                {selectedAppointment?.meeting_link && (
                  <div className="mb-3">
                    <strong>Meeting Link:</strong>
                    <div style={{ marginTop: '8px' }}>
                      <a 
                        href={selectedAppointment.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="fas fa-external-link-alt me-2"></i>
                        Join Meeting
                      </a>
                    </div>
                  </div>
                )}

                {selectedAppointment && isUpcoming(selectedAppointment) && (
                  <div style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <i className="fas fa-clock" style={{ color: '#3b82f6', marginRight: '8px' }}></i>
                      <span style={{ color: '#1e40af', fontWeight: '500' }}>
                        This appointment is upcoming
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer" style={componentStyles.modalFooter}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAppointmentModal(false)}
                >
                  Close
                </button>
                {selectedAppointment?.meeting_link && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => window.open(selectedAppointment.meeting_link, '_blank')}
                  >
                    <i className="fas fa-video me-2"></i>Join Meeting
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsManagement;