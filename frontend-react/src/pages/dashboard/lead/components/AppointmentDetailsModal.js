import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const AppointmentDetailsModal = ({ show, onHide, appointment }) => {
  if (!show || !appointment) return null;

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'completed': '#10b981',
      'cancelled': '#ef4444',
      'rescheduled': '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444',
      'urgent': '#dc2626'
    };
    return colors[priority] || '#f59e0b';
  };

  const getVisaCategoryDisplay = (category) => {
    const categories = {
      'eb1a': 'EB-1A (Extraordinary Ability)',
      'eb2-niw': 'EB-2 NIW (National Interest Waiver)',
      'o1': 'O-1 Visa',
      'multiple': 'Multiple Categories',
      'other': 'Other / Not Sure'
    };
    return categories[category] || category;
  };

  return (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-calendar-alt me-2"></i>
              Appointment Details - {appointment.name}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onHide}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {/* Client Information */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                  <h6 className="text-primary mb-3">
                    <i className="fas fa-user me-2"></i>Client Information
                  </h6>
                  <div className="mb-2">
                    <strong>Name:</strong> {appointment.name}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {appointment.email}
                  </div>
                  <div className="mb-2">
                    <strong>Phone:</strong> {appointment.phone || 'Not provided'}
                  </div>
                  <div className="mb-2">
                    <strong>Timezone:</strong> {appointment.timezone || 'Not specified'}
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                  <h6 className="text-primary mb-3">
                    <i className="fas fa-info-circle me-2"></i>Appointment Status
                  </h6>
                  <div className="mb-2">
                    <strong>Status:</strong>
                    <span className="ms-2 badge" style={{
                      background: getStatusColor(appointment.status),
                      color: 'white',
                      textTransform: 'uppercase'
                    }}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Priority:</strong>
                    <span className="ms-2" style={{
                      color: getPriorityColor(appointment.priority),
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      ● {appointment.priority || 'Medium'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Visa Category:</strong>
                    <span className="ms-2 badge" style={{
                      background: '#8b5cf6',
                      color: 'white'
                    }}>
                      {getVisaCategoryDisplay(appointment.visa_category)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Consultation Type:</strong> {appointment.consultation_type || 'Video'}
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Schedule */}
            <div className="mb-4">
              <h6 className="text-primary mb-3">
                <i className="fas fa-calendar-check me-2"></i>Schedule Details
              </h6>
              <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-2">
                      <strong>Scheduled Date:</strong> {
                        appointment.scheduled_date ? 
                        new Date(appointment.scheduled_date).toLocaleDateString() : 
                        (appointment.preferred_date || 'Not scheduled')
                      }
                    </div>
                    <div className="mb-2">
                      <strong>Scheduled Time:</strong> {appointment.scheduled_time || appointment.preferred_time || 'Not set'}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <strong>Duration:</strong> {appointment.duration_minutes || 30} minutes
                    </div>
                    <div className="mb-2">
                      <strong>Created:</strong> {new Date(appointment.createdAt || appointment.submission_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Link */}
            {appointment.meeting_link && (
              <div className="mb-4">
                <h6 className="text-primary mb-3">
                  <i className="fas fa-video me-2"></i>Meeting Information
                </h6>
                <div className="card border-0" style={{ background: '#e0f2fe', padding: designSystem.spacing.md }}>
                  <div>
                    <strong>Meeting Link:</strong>
                    <div className="mt-1">
                      <a 
                        href={appointment.meeting_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#1e3a8a',
                          textDecoration: 'none',
                          fontWeight: '500'
                        }}
                      >
                        {appointment.meeting_link}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appointment Details */}
            {appointment.details && (
              <div className="mb-4">
                <h6 className="text-primary mb-3">
                  <i className="fas fa-file-text me-2"></i>Details & Notes
                </h6>
                <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                  <p className="mb-0">{appointment.details}</p>
                </div>
              </div>
            )}

            {/* Consultation Notes */}
            {appointment.consultation_notes && (
              <div className="mb-4">
                <h6 className="text-primary mb-3">
                  <i className="fas fa-sticky-note me-2"></i>Consultation Notes
                </h6>
                <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                  <p className="mb-0">{appointment.consultation_notes}</p>
                </div>
              </div>
            )}

            {/* Follow-up Information */}
            {appointment.follow_up_required && (
              <div className="mb-4">
                <h6 className="text-primary mb-3">
                  <i className="fas fa-clock me-2"></i>Follow-up Required
                </h6>
                <div className="card border-0" style={{ background: '#fef3c7', padding: designSystem.spacing.md }}>
                  <div className="d-flex align-items-center">
                    <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                    <div>
                      <strong>Follow-up Date:</strong> {
                        appointment.follow_up_date ? 
                        new Date(appointment.follow_up_date).toLocaleDateString() : 
                        'To be scheduled'
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            <div className="d-flex gap-2 w-100 justify-content-between">
              <div className="d-flex gap-2">
                {appointment.meeting_link && (
                  <button 
                    className="btn btn-success"
                    onClick={() => window.open(appointment.meeting_link, '_blank')}
                    {...hoverEffects.button}
                  >
                    <i className="fas fa-video me-2"></i>Join Meeting
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

export default AppointmentDetailsModal;