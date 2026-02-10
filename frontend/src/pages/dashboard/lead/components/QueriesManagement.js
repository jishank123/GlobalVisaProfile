import { useState } from 'react';

const QueriesManagement = ({ queries, clients, onRefresh }) => {
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseData, setResponseData] = useState({ message: '', isInternal: false });

  const formatStatus = (status) => {
    const statusMap = {
      'new': 'New',
      'pending': 'Pending',
      'responded': 'Responded',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'new': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'responded': 'bg-blue-100 text-blue-800',
      'resolved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const findClientById = (clientId) => {
    if (!clientId) return { name: 'Unknown Client', _id: clientId };
    
    const client = clients.find(c => c._id === clientId);
    return client || { name: 'Unknown Client', _id: clientId };
  };

  const handleViewQuery = (query) => {
    setSelectedQuery(query);
    setShowQueryModal(true);
  };

  const handleRespondToQuery = (query) => {
    setSelectedQuery(query);
    setResponseData({ message: '', isInternal: false });
    setShowResponseModal(true);
  };

  const submitQueryResponse = async () => {
    if (!responseData.message.trim()) {
      alert('Please enter a response message.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/queries/${selectedQuery._id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: responseData.message,
          isInternal: responseData.isInternal
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowResponseModal(false);
        onRefresh();
        alert('Response sent successfully!');
      } else {
        throw new Error(data.message || 'Failed to send response');
      }
    } catch (error) {
      console.error('Error sending response:', error);
      alert('Failed to send response: ' + error.message);
    }
  };

  if (queries.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <i className="fas fa-question-circle text-xl text-gray-600"></i>
            <h2 className="text-xl font-bold text-gray-800">Client Queries</h2>
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
          <i className="fas fa-question-circle text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-500 mb-2">No Pending Queries</h3>
          <p className="text-gray-400">All client queries have been resolved. Great work!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <i className="fas fa-question-circle text-xl text-gray-600"></i>
            <h2 className="text-xl font-bold text-gray-800">Client Queries</h2>
          </div>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {queries.map((query) => {
            const client = typeof query.client === 'object' && query.client.name 
              ? query.client 
              : findClientById(query.client);
            
            return (
              <div key={query._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{query.subject || 'General Query'}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(query.status || 'pending')}`}>
                        {formatStatus(query.status || 'pending')}
                      </span>
                      {query.priority === 'urgent' && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Client:</strong> {client.name}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Category:</strong> {query.category || 'General'} • 
                      <strong className="ml-2">Created:</strong> {getTimeAgo(query.created_at || query.createdAt)}
                    </p>
                    <div className="text-gray-700">
                      <p className="line-clamp-2">{query.message || query.description || 'No message content'}</p>
                    </div>
                  </div>
                </div>

                {query.responses && query.responses.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Latest Response:</p>
                    <div className="text-sm text-gray-600">
                      <p className="mb-1">{query.responses[query.responses.length - 1].message}</p>
                      <p className="text-xs text-gray-500">
                        By {query.responses[query.responses.length - 1].user?.first_name || 'Unknown'} - 
                        {getTimeAgo(query.responses[query.responses.length - 1].timestamp)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewQuery(query)}
                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    <i className="fas fa-eye mr-1"></i>
                    View Details
                  </button>
                  <button
                    onClick={() => handleRespondToQuery(query)}
                    className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm"
                  >
                    <i className="fas fa-reply mr-1"></i>
                    Respond
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Query Details Modal */}
      {showQueryModal && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Query Details</h2>
                <button
                  onClick={() => setShowQueryModal(false)}
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
                    <strong>Client:</strong> {
                      typeof selectedQuery.client === 'object' && selectedQuery.client.name 
                        ? selectedQuery.client.name 
                        : findClientById(selectedQuery.client).name
                    }
                  </p>
                  <p className="mb-3"><strong>Subject:</strong> {selectedQuery.subject || 'General Query'}</p>
                  <p className="mb-3">
                    <strong>Priority:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      selectedQuery.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedQuery.priority || 'normal'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="mb-3">
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedQuery.status || 'pending')}`}>
                      {formatStatus(selectedQuery.status || 'pending')}
                    </span>
                  </p>
                  <p className="mb-3"><strong>Created:</strong> {getTimeAgo(selectedQuery.created_at || selectedQuery.createdAt)}</p>
                  <p className="mb-3"><strong>Category:</strong> {selectedQuery.category || 'General'}</p>
                </div>
              </div>

              <div className="mb-6">
                <strong>Message:</strong>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  {selectedQuery.message || selectedQuery.description || 'No message content'}
                </div>
              </div>

              {selectedQuery.responses && selectedQuery.responses.length > 0 && (
                <div className="mb-6">
                  <strong>Responses:</strong>
                  <div className="mt-2 space-y-3">
                    {selectedQuery.responses.map((response, index) => (
                      <div key={index} className="border border-gray-200 p-3 rounded-lg bg-gray-50">
                        <div className="text-sm text-gray-500 mb-2">
                          {response.user?.first_name || 'Unknown'} - {getTimeAgo(response.timestamp)}
                        </div>
                        <p className="text-gray-800">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowQueryModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowQueryModal(false);
                  handleRespondToQuery(selectedQuery);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Respond
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Respond to Query</h2>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-gray-500"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="mb-2">
                  <strong>Client:</strong> {
                    typeof selectedQuery.client === 'object' && selectedQuery.client.name 
                      ? selectedQuery.client.name 
                      : findClientById(selectedQuery.client).name
                  }
                </p>
                <p className="mb-4"><strong>Subject:</strong> {selectedQuery.subject || 'General Query'}</p>
              </div>

              <div>
                <strong>Original Query:</strong>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  {selectedQuery.message || selectedQuery.description || 'No message content'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><strong>Your Response:</strong></label>
                <textarea
                  value={responseData.message}
                  onChange={(e) => setResponseData(prev => ({ ...prev, message: e.target.value }))}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your response here..."
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={responseData.isInternal}
                    onChange={(e) => setResponseData(prev => ({ ...prev, isInternal: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Internal note (not visible to client)</span>
                </label>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowResponseModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitQueryResponse}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QueriesManagement;