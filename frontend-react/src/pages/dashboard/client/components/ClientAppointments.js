import { useState, useEffect } from 'react';

const ClientAppointments = ({ apiCall }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentStats, setAppointmentStats] = useState({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      // Get client email from localStorage or current user context
      const clientEmail = localStorage.getItem('clientEmail') || localStorage.getItem('userEmail');
      
      if (!clientEmail) {
        console.error('Client email not found');
        setAppointments([]);
        return;
      }

      const response = await apiCall(`/appointments/client/${encodeURIComponent(clientEmail)}`);
      
      if (response.success && response.data) {
        let clientAppointments = [];
        
        // Handle different response structures
        if (Array.isArray(response.data)) {
          clientAppointments = response.data;
        } else if (response.data.appointments && Array.isArray(response.data.appointments)) {
          clientAppointments = response.data.appointments;
        }
        
        setAppointments(clientAppointments);
        updateAppointmentStats(clientAppointments);
      } else {
        setAppointments([]);
        resetAppointmentStats();
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
      resetAppointmentStats();
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStats = (appointmentsData) => {
    const stats = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };

    appointmentsData.forEach(appointment => {
      if (stats.hasOwnProperty(appointment.status)) {
        stats[appointment.status]++;
      }
    });

    setAppointmentStats(stats);
  };

  const resetAppointmentStats = () => {
    setAppointmentStats({
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    });
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleJoinMeeting = (meetingLink) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    }
  };

  const handleRescheduleRequest = (appointmentId) => {
    // In a real implementation, this would open a reschedule modal
    alert('Reschedule request functionality would be implemented here. Please contact support for now.');
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800',
      'rescheduled': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return 'Not scheduled';
    
    const date = new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return timeString ? `${date} at ${timeString}` : date;
  };

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Appointment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <i className="fas fa-clock text-2xl text-yellow-600"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {appointmentStats.pending}
            </div>
            <div className="text-gray-600 text-sm">Pending</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <i className="fas fa-check-circle text-2xl text-green-600"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {appointmentStats.confirmed}
            </div>
            <div className="text-gray-600 text-sm">Confirmed</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <i className="fas fa-calendar-check text-2xl text-blue-600"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {appointmentStats.completed}
            </div>
            <div className="text-gray-600 text-sm">Completed</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <i className="fas fa-calendar-times text-2xl text-red-600"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-red-600 mb-1">
              {appointmentStats.cancelled}
            </div>
            <div className="text-gray-600 text-sm">Cancelled</div>
          </div>
        </div>

        {/* Appointments Table */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <i className="fas fa-calendar-check text-4xl text-gray-400 mb-4"></i>
            <h5 className="text-lg font-semibold text-gray-700 mb-2">No Appointments Found</h5>
            <p className="text-gray-600 mb-4">You don't have any appointments scheduled yet. Book a consultation to get started!</p>
            <button 
              onClick={() => window.open('/CRM/schedule', '_blank')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-calendar-plus mr-2"></i>Book Appointment
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  <i className="fas fa-calendar-check mr-2"></i>My Appointments
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={loadAppointments}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    <i className="fas fa-sync-alt mr-1"></i>Refresh
                  </button>
                  <button 
                    onClick={() => window.open('/CRM/schedule', '_blank')}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    <i className="fas fa-plus mr-1"></i>Book New
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visa Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map(appointment => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatDateTime(appointment.scheduled_date, appointment.scheduled_time)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Timezone: {appointment.timezone || 'Not specified'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {appointment.visa_category_display || appointment.visa_category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                          {capitalizeFirst(appointment.consultation_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {capitalizeFirst(appointment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">
                          {appointment.assigned_to ? 
                            `${appointment.assigned_to.first_name} ${appointment.assigned_to.last_name}` : 
                            'Not assigned'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">{appointment.duration_minutes || 60} min</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleViewAppointment(appointment)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {appointment.meeting_link && (
                            <button 
                              onClick={() => handleJoinMeeting(appointment.meeting_link)}
                              className="text-green-600 hover:text-green-900 ml-2"
                              title="Join Meeting"
                            >
                              <i className="fas fa-video"></i>
                            </button>
                          )}
                          {appointment.status === 'pending' && (
                            <button 
                              onClick={() => handleRescheduleRequest(appointment._id)}
                              className="text-yellow-600 hover:text-yellow-900 ml-2"
                              title="Request Reschedule"
                            >
                              <i className="fas fa-calendar-alt"></i>
                            </button>
                          )}
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

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal 
          appointment={selectedAppointment}
          onClose={() => setShowDetailsModal(false)}
          onJoinMeeting={handleJoinMeeting}
        />
      )}
    </>
  );
};

// Appointment Details Modal Component
const AppointmentDetailsModal = ({ appointment, onClose, onJoinMeeting }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800',
      'rescheduled': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              <i className="fas fa-calendar-check mr-2"></i>Appointment Details
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h6 className="font-semibold mb-3">Appointment Information</h6>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {capitalizeFirst(appointment.status)}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Visa Category:</span>
                  <span className="ml-2">{appointment.visa_category_display || appointment.visa_category}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Consultation Type:</span>
                  <span className="ml-2">{capitalizeFirst(appointment.consultation_type)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Duration:</span>
                  <span className="ml-2">{appointment.duration_minutes || 60} minutes</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Timezone:</span>
                  <span className="ml-2">{appointment.timezone}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Priority:</span>
                  <span className="ml-2">{capitalizeFirst(appointment.priority || 'normal')}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h6 className="font-semibold mb-3">Schedule Details</h6>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Scheduled Date:</span>
                  <span className="ml-2">{formatDate(appointment.scheduled_date)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Scheduled Time:</span>
                  <span className="ml-2">{appointment.scheduled_time || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Requested Date:</span>
                  <span className="ml-2">{appointment.preferred_date || 'Flexible'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Requested Time:</span>
                  <span className="ml-2">{appointment.preferred_time || 'Flexible'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Assigned To:</span>
                  <span className="ml-2">
                    {appointment.assigned_to ? 
                      `${appointment.assigned_to.first_name} ${appointment.assigned_to.last_name}` : 
                      'Not assigned'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Submitted:</span>
                  <span className="ml-2">{formatDate(appointment.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {appointment.details && (
            <div className="mb-6">
              <h6 className="font-semibold mb-2">Additional Details</h6>
              <div className="bg-gray-50 p-3 rounded">
                {appointment.details}
              </div>
            </div>
          )}
          
          {appointment.consultation_notes && (
            <div className="mb-6">
              <h6 className="font-semibold mb-2">Consultation Notes</h6>
              <div className="bg-gray-50 p-3 rounded">
                {appointment.consultation_notes}
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            {appointment.meeting_link && (
              <button 
                onClick={() => onJoinMeeting(appointment.meeting_link)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                <i className="fas fa-video mr-2"></i>Join Meeting
              </button>
            )}
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors ml-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientAppointments;