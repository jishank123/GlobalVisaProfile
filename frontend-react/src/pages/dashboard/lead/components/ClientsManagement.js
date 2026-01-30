import { useState } from 'react';

const ClientsManagement = ({ clients, onRefresh }) => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageData, setMessageData] = useState({ subject: '', content: '' });

  const formatStatus = (status) => {
    const statusMap = {
      'active': 'Active',
      'pending': 'Pending',
      'completed': 'Completed',
      'lead_assigned': 'Lead Assigned',
      'on_hold': 'On Hold'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'active': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-blue-100 text-blue-800',
      'lead_assigned': 'bg-purple-100 text-purple-800',
      'on_hold': 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const handleMessageClient = (client) => {
    setSelectedClient(client);
    setShowMessageModal(true);
    setMessageData({ subject: '', content: '' });
  };

  const handleSendMessage = async () => {
    if (!messageData.subject.trim() || !messageData.content.trim()) {
      alert('Please enter both subject and message content.');
      return;
    }

    try {
      // In a real implementation, this would send the message via API
      alert(`Message sent successfully!\n\nSubject: ${messageData.subject}\nMessage: ${messageData.content.substring(0, 50)}...`);
      setShowMessageModal(false);
      setMessageData({ subject: '', content: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <i className="fas fa-users text-xl text-gray-600"></i>
            <h2 className="text-xl font-bold text-gray-800">My Assigned Clients</h2>
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
          <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-500 mb-2">No Clients Assigned</h3>
          <p className="text-gray-400">You don't have any clients assigned yet. Contact your admin to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <i className="fas fa-users text-xl text-gray-600"></i>
            <h2 className="text-xl font-bold text-gray-800">My Assigned Clients</h2>
          </div>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-800 mb-1">{client.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{client.email}</p>
                  {client.phone && (
                    <p className="text-sm text-gray-600 mb-2">{client.phone}</p>
                  )}
                  {client.university && (
                    <p className="text-sm text-gray-600 mb-3">{client.university}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                  {formatStatus(client.status)}
                </span>
                {client.isLead && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Lead
                  </span>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewClient(client)}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <i className="fas fa-eye mr-1"></i>
                  View
                </button>
                <button
                  onClick={() => handleMessageClient(client)}
                  className="flex-1 px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  <i className="fas fa-envelope mr-1"></i>
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Details Modal */}
      {showClientModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Client Details</h2>
                <button
                  onClick={() => setShowClientModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-gray-500"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-3"><strong>Name:</strong> {selectedClient.name}</p>
                  <p className="mb-3"><strong>Email:</strong> {selectedClient.email}</p>
                  <p className="mb-3"><strong>Phone:</strong> {selectedClient.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="mb-3"><strong>University:</strong> {selectedClient.university || 'Not specified'}</p>
                  <p className="mb-3">
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedClient.status)}`}>
                      {formatStatus(selectedClient.status)}
                    </span>
                  </p>
                  <p className="mb-3"><strong>Type:</strong> {selectedClient.isLead ? 'Lead' : 'Client'}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowClientModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Send Message to {selectedClient.name}</h2>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-gray-500"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
                <input
                  type="text"
                  value={messageData.subject}
                  onChange={(e) => setMessageData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter message subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
                <textarea
                  value={messageData.content}
                  onChange={(e) => setMessageData(prev => ({ ...prev, content: e.target.value }))}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your message here..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientsManagement;