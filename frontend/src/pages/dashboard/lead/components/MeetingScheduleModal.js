import { useState } from 'react';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const MeetingScheduleModal = ({ show, onHide, lead, onSchedule }) => {
  const [meetingData, setMeetingData] = useState({
    title: `Meeting with ${lead?.firstName} ${lead?.lastName}`,
    date: '',
    time: '',
    duration: '60',
    type: 'video_call',
    agenda: '',
    notes: '',
    meetingLink: ''
  });

  if (!show || !lead) return null;

  const handleScheduleMeeting = () => {
    if (meetingData.date && meetingData.time) {
      const meetingDateTime = new Date(`${meetingData.date}T${meetingData.time}`);
      const meetingInfo = {
        ...meetingData,
        leadId: lead._id,
        scheduledFor: meetingDateTime.toISOString(),
        status: 'scheduled'
      };
      onSchedule(meetingInfo);
      onHide();
    }
  };



  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-calendar-plus me-2"></i>
              Schedule Meeting with {lead.firstName} {lead.lastName}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onHide}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {/* Lead Information */}
            <div className="mb-4">
              <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                <h6 className="text-primary mb-3">
                  <i className="fas fa-user me-2"></i>Lead Information
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-2">
                      <strong>Name:</strong> {lead.firstName} {lead.lastName}
                    </div>
                    <div className="mb-2">
                      <strong>Email:</strong> {lead.email}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <strong>Phone:</strong> {lead.phone || 'Not provided'}
                    </div>
                    <div className="mb-2">
                      <strong>Country:</strong> {lead.country || 'Not specified'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Details Form */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Meeting Title</label>
                <input
                  type="text"
                  className="form-control"
                  style={componentStyles.formInput}
                  value={meetingData.title}
                  onChange={(e) => setMeetingData({...meetingData, title: e.target.value})}
                  placeholder="Enter meeting title"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Meeting Type</label>
                <select
                  className="form-control"
                  style={componentStyles.formInput}
                  value={meetingData.type}
                  onChange={(e) => setMeetingData({...meetingData, type: e.target.value})}
                >
                  <option value="video_call">Video Call</option>
                  <option value="phone_call">Phone Call</option>
                  <option value="in_person">In Person</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  style={componentStyles.formInput}
                  value={meetingData.date}
                  onChange={(e) => setMeetingData({...meetingData, date: e.target.value})}
                  min={getTomorrowDate()}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Time</label>
                <input
                  type="time"
                  className="form-control"
                  style={componentStyles.formInput}
                  value={meetingData.time}
                  onChange={(e) => setMeetingData({...meetingData, time: e.target.value})}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Duration (minutes)</label>
                <select
                  className="form-control"
                  style={componentStyles.formInput}
                  value={meetingData.duration}
                  onChange={(e) => setMeetingData({...meetingData, duration: e.target.value})}
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Meeting Link</label>
                <input
                  type="url"
                  className="form-control"
                  style={componentStyles.formInput}
                  value={meetingData.meetingLink}
                  onChange={(e) => setMeetingData({...meetingData, meetingLink: e.target.value})}
                  placeholder="Enter meeting link (e.g., https://meet.google.com/xxx-xxxx-xxx)"
                />
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Meeting Agenda</label>
                <textarea
                  className="form-control"
                  style={componentStyles.formInput}
                  rows="3"
                  value={meetingData.agenda}
                  onChange={(e) => setMeetingData({...meetingData, agenda: e.target.value})}
                  placeholder="Enter meeting agenda and topics to discuss"
                ></textarea>
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Additional Notes</label>
                <textarea
                  className="form-control"
                  style={componentStyles.formInput}
                  rows="2"
                  value={meetingData.notes}
                  onChange={(e) => setMeetingData({...meetingData, notes: e.target.value})}
                  placeholder="Any additional notes or preparation required"
                ></textarea>
              </div>
            </div>

            {/* Meeting Preview */}
            {meetingData.date && meetingData.time && (
              <div className="mt-4">
                <div className="card border-0" style={{ background: '#e0f2fe', padding: designSystem.spacing.md }}>
                  <h6 className="text-info mb-3">
                    <i className="fas fa-eye me-2"></i>Meeting Preview
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-2">
                        <strong>Date & Time:</strong> {new Date(`${meetingData.date}T${meetingData.time}`).toLocaleString()}
                      </div>
                      <div className="mb-2">
                        <strong>Duration:</strong> {meetingData.duration} minutes
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <strong>Type:</strong> {meetingData.type.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="mb-2">
                        <strong>Attendees:</strong> You, {lead.firstName} {lead.lastName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            <div className="d-flex gap-2 w-100 justify-content-end">
              <button 
                className="btn btn-success"
                onClick={handleScheduleMeeting}
                disabled={!meetingData.date || !meetingData.time}
                {...hoverEffects.button}
              >
                <i className="fas fa-calendar-check me-2"></i>Schedule Meeting
              </button>
              
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingScheduleModal;