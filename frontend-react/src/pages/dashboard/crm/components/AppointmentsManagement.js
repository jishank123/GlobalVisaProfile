import { useState, useEffect } from 'react';

const AppointmentsManagement = ({ apiCall, clients }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [clients]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      if (!clients || clients.length === 0) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      // Get all client emails from assigned clients
      const clientEmails = clients.map(client => client.email).filter(email => email);
      
      if (clientEmails.length === 0) {
        setAppointments([]);
        setLoading(false);
        return;
      }
      
      // Fetch appointments for all assigned clients
      const appointmentPromises = clientEmails.map(async (email) => {
        try {
          const response = await apiCall(`/appointments/client/${encodeURIComponent(email)}`);
          if (response.success && response.data) {
            // Add client email to each appointment for reference
            return Array.isArray(response.data) 
              ? response.data.map(apt => ({ ...apt, clientEmail: email }))
              : response.data.appointments 
                ? response.data.appointments.map(apt => ({ ...apt, clientEmail: email }))
                : [];
          }
          return [];
        } catch (error) {
          console.warn(`Failed to load appointments for ${email}:`, error);
          return [];
        }
      });
      
      const allAppointments = await Promise.all(appointmentPromises);
      const flattenedAppointments = allAppointments.flat();
      
      setAppointments(flattenedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleJoinMeeting = (meetingLink) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    } else {
      alert('No meeting link available for this appointment.');
    }
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

  const formatDateTime = (appointment) => {
    // Handle both scheduled and preferred dates
    const scheduledDate = appointment.scheduled_date ? new Date(appointment.scheduled_date).toLocaleDateString() : null;
    const scheduledTime = appointment.scheduled_time || null;
    const preferredDate = appointment.preferred_date ? new Date(appointment.preferred_date).toLocaleDateString() : 'Flexible';
    const preferredTime = appointment.preferred_time || 'Flexible';
    
    if (scheduledDate) {
      return `${scheduledDate} at ${scheduledTime || 'TBD'}`;
    } else {
      return `Requested: ${preferredDate}`;
    }
  };

  const getClientName = (appointment) => {
    // Find the client name from our assigned clients data
    const client = clients?.find(c => c.email === appointment.clientEmail);
    return client ? client.name : (appointment.name || appointment.clientEmail);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <i className="fas fa-calendar-alt text-4xl text-gray-400 mb-4"></i>
        <h5 className="text-lg font-semibold text-gray-700 mb-2">No Appointments Scheduled</h5>
        <p className="text-gray-600">Schedule regular check-ins with your clients.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              <i className="fas fa-calendar-alt mr-2"></i>Appointments & Meetings
            </h3>
            <button 
              onClick={loadAppointments}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-sync-alt mr-1"></i>Refresh
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map(appointment => {
                const clientName = getClientName(appointment);
                const dateTimeDisplay = formatDateTime(appointment);
                
                return (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{dateTimeDisplay}</div>
                        <div className="text-sm text-gray-500">
                          {appointment.scheduled_time || appointment.preferred_time !== 'Flexible' 
                            ? `Time: ${appointment.scheduled_time || appointment.preferred_time}` 
                            : 'Time: Flexible'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{clientName}</div>
                        <div className="text-sm text-gray-500">{appointment.clientEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {appointment.consultation_type || 'Video'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status || 'pending')}`}>
                        {appointment.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
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
                            className="text-green-600 hover:text-green-900"
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
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal 
          appointment={selectedAppointment}
          clients={clients}
          onClose={() => setShowDetailsModal(false)}
          onJoinMeeting={handleJoinMeeting}
        />
      )}
    </>
  );
};

// Appointment Details Modal Component
const AppointmentDetailsModal = ({ appointment, clients, onClose, onJoinMeeting }) => {
  const getClientName = () => {
    const client = clients?.find(c => c.email === appointment.clientEmail);
    return client ? client.name : (appointment.name || appointment.clientEmail);
  };

  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'rescheduled': 'Rescheduled'
    };
    return statusMap[status] || status;
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Appointment Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm font-medium text-gray-700">Client:</div>
              <div className="text-gray-900">{getClientName()}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Email:</div>
              <div className="text-gray-900">{appointment.email || appointment.clientEmail || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Phone:</div>
              <div className="text-gray-900">{appointment.phone || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Visa Category:</div>
              <div className="text-gray-900">{appointment.visa_category || 'N/A'}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {appointment.scheduled_date ? (
              <>
                <div>
                  <div className="text-sm font-medium text-gray-700">Scheduled Date:</div>
                  <div className="text-gray-900">{new Date(appointment.scheduled_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Scheduled Time:</div>
                  <div className="text-gray-900">{appointment.scheduled_time || 'Not set'}</div>
                </div>
              </>
            ) : null}
            <div>
              <div className="text-sm font-medium text-gray-700">Requested Date:</div>
              <div className="text-gray-900">
                {appointment.preferred_date ? new Date(appointment.preferred_date).toLocaleDateString() : 'Flexible'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Requested Time:</div>
              <div className="text-gray-900">{appointment.preferred_time || 'Flexible'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Type:</div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {appointment.consultation_type || 'Video'}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Status:</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status || 'pending')}`}>
                {formatStatus(appointment.status || 'pending')}
              </span>
            </div>
          </div>
          
          {appointment.details && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Details:</div>
              <div className="border p-3 bg-gray-50 rounded">
                {appointment.details}
              </div>
            </div>
          )}
          
          {appointment.message && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Message:</div>
              <div className="border p-3 bg-gray-50 rounded">
                {appointment.message}
              </div>
            </div>
          )}
          
          {appointment.assigned_to && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700">Assigned To:</div>
              <div className="text-gray-900">
                {appointment.assigned_to.first_name} {appointment.assigned_to.last_name}
              </div>
            </div>
          )}
          
          {appointment.meeting_link && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Meeting Link:</div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <button 
                  onClick={() => onJoinMeeting(appointment.meeting_link)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  <i className="fas fa-video mr-2"></i>Join Meeting
                </button>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            {appointment.meeting_link ? (
              <button 
                onClick={() => onJoinMeeting(appointment.meeting_link)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <i className="fas fa-video mr-2"></i>Join Meeting
              </button>
            ) : (
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled
              >
                Schedule Meeting
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsManagement;