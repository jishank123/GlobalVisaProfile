import { useState } from 'react';

const AppointmentsManagement = ({ appointments, clients, onRefresh }) => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

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
      'scheduled': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
      'no_show': 'bg-red-100 text-red-800',
      'rescheduled': 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not specified';
    
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateTimeString) => {
    if (!dateTimeString) return false;
    return new Date(dateTimeString) > new Date();
  };

  const isPast = (dateTimeString) => {
    if (!dateTimeString) return false;
    return new Date(dateTimeString) < new Date();
  };

  const findClientByEmail = (email) => {
    if (!email) return { name: 'Unknown Client', email: email };
    
    const client = clients.find(c => c.email === email);
    return client || { name: 'Unknown Client', email: email };
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
      'interview': 'fas fa-user-tie'
    };
    return icons[type] || 'fas fa-calendar';
  };

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <i className="fas fa-calendar-alt text-xl text-gray-600"></i>
            <h2 className="text-xl font-bold text-gray-800">Appointments & Meetings</h2>
          </div>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Refresh
          </button>
        </div>
        
        <div className="text-center py-12">
          <i className="fas fa-calendar-alt text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-500 mb-2">No Appointments Scheduled</h3>
          <p className="text-gray-400">Schedule regular check-ins with your clients.</p>
        </div>
      </div>
    );
  }

  // Sort appointments by date (upcoming first, then past)
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(a.datetime);
    const dateB = new Date(b.datetime);
    const now = new Date();
    
    // If both are upcoming or both are past, sort by date
    if ((dateA > now && dateB > now) || (dateA < now && dateB < now)) {
      return dateA - dateB;
    }
    
    // Upcoming appointments come first
    if (dateA > now && dateB < now) return -1;
    if (dateA < now && dateB > now) return 1;
    
    return dateA - dateB;
  });

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <i className="fas fa-calendar-alt text-xl text-gray-600"></i>
            <h2 className="text-xl font-bold text-gray-800">Appointments & Meetings</h2>
          </div>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAppointments.map((appointment) => {
                const client = findClientByEmail(appointment.clientEmail || appointment.email);
                const upcoming = isUpcoming(appointment.datetime);
                const past = isPast(appointment.datetime);
                
                return (
                  <tr 
                    key={appointment._id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      upcoming ? 'bg-blue-50' : past ? 'bg-gray-50' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className={`${upcoming ? 'text-blue-700 font-medium' : past ? 'text-gray-500' : ''}`}>
                        {formatDateTime(appointment.datetime)}
                        {upcoming && (
                          <div className="text-xs text-blue-600 mt-1">Upcoming</div>
                        )}
                        {past && (
                          <div className="text-xs text-gray-500 mt-1">Past</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-800">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <i className={`${getAppointmentTypeIcon(appointment.type)} text-gray-500`}></i>
                        <span className="capitalize">{appointment.type || 'Meeting'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {formatStatus(appointment.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleViewAppointment(appointment)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors text-sm"
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Appointment Details</h2>
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-gray-500"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="mb-3">
                    <strong>Client:</strong> {findClientByEmail(selectedAppointment.clientEmail || selectedAppointment.email).name}
                  </p>
                  <p className="mb-3">
                    <strong>Email:</strong> {selectedAppointment.clientEmail || selectedAppointment.email}
                  </p>
                  <p className="mb-3">
                    <strong>Type:</strong> 
                    <span className="ml-2 capitalize flex items-center">
                      <i className={`${getAppointmentTypeIcon(selectedAppointment.type)} mr-2`}></i>
                      {selectedAppointment.type || 'Meeting'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="mb-3">
                    <strong>Date & Time:</strong> {formatDateTime(selectedAppointment.datetime)}
                  </p>
                  <p className="mb-3">
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                      {formatStatus(selectedAppointment.status)}
                    </span>
                  </p>
                  <p className="mb-3">
                    <strong>Duration:</strong> {selectedAppointment.duration || '60'} minutes
                  </p>
                </div>
              </div>

              {selectedAppointment.purpose && (
                <div className="mb-6">
                  <strong>Purpose:</strong>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    {selectedAppointment.purpose}
                  </div>
                </div>
              )}

              {selectedAppointment.notes && (
                <div className="mb-6">
                  <strong>Notes:</strong>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    {selectedAppointment.notes}
                  </div>
                </div>
              )}

              {selectedAppointment.meeting_link && (
                <div className="mb-6">
                  <strong>Meeting Link:</strong>
                  <div className="mt-2">
                    <a 
                      href={selectedAppointment.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {selectedAppointment.meeting_link}
                    </a>
                  </div>
                </div>
              )}

              {selectedAppointment.location && (
                <div className="mb-6">
                  <strong>Location:</strong>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    {selectedAppointment.location}
                  </div>
                </div>
              )}

              {isUpcoming(selectedAppointment.datetime) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-clock text-blue-600 mr-2"></i>
                    <span className="text-blue-800 font-medium">
                      This appointment is upcoming
                    </span>
                  </div>
                </div>
              )}

              {isPast(selectedAppointment.datetime) && selectedAppointment.status !== 'completed' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                    <span className="text-yellow-800 font-medium">
                      This appointment has passed and may need status update
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentsManagement;