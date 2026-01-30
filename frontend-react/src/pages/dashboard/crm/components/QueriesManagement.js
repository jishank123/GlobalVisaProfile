import { useState, useEffect, useCallback } from 'react';

const QueriesManagement = ({ apiCall, clients }) => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadQueries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiCall('/queries/my-queries');
      if (response.success) {
        setQueries(response.data || []);
      }
    } catch (error) {
      console.error('Error loading queries:', error);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  const handleRespondToQuery = (query) => {
    setSelectedQuery(query);
    setShowResponseModal(true);
  };

  const handleViewQuery = (query) => {
    setSelectedQuery(query);
    setShowDetailsModal(true);
  };

  const submitQueryResponse = async (queryId, responseData) => {
    try {
      const response = await apiCall(`/queries/${queryId}/respond`, {
        method: 'POST',
        body: JSON.stringify(responseData)
      });
      
      if (response.success) {
        setShowResponseModal(false);
        loadQueries();
        alert('Response sent successfully!');
      } else {
        throw new Error(response.message || 'Failed to send response');
      }
    } catch (error) {
      console.error('Error sending response:', error);
      alert('Failed to send response: ' + error.message);
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'urgent': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'normal': 'bg-blue-100 text-blue-800 border-blue-200',
      'low': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[priority] || colors.normal;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading client queries...</p>
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <i className="fas fa-question-circle text-4xl text-gray-400 mb-4"></i>
        <h5 className="text-lg font-semibold text-gray-700 mb-2">No Pending Queries</h5>
        <p className="text-gray-600">All client queries have been resolved. Great work!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              <i className="fas fa-question-circle mr-2"></i>Client Queries
            </h3>
            <button 
              onClick={loadQueries}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-sync-alt mr-1"></i>Refresh
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {queries.map(query => {
            const client = typeof query.client === 'object' && query.client.name 
              ? query.client 
              : clients?.find(c => c._id === query.client) || { name: 'Unknown Client', _id: query.client };
            const timeAgo = getTimeAgo(query.created_at || query.createdAt);
            const priority = query.priority || 'normal';
            const isUrgent = priority === 'urgent';
            
            return (
              <div key={query._id} className={`border rounded-lg p-4 ${isUrgent ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {client.name} - {query.subject || 'General Query'}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                        {priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">
                      {truncateText(query.message || query.description || 'No message content', 150)}
                    </p>
                    <div className="text-sm text-gray-500">
                      Category: {query.category || 'General'} • {timeAgo}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 ml-4">
                    {timeAgo}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleRespondToQuery(query)}
                    className="bg-green-100 text-green-700 px-3 py-2 rounded text-sm hover:bg-green-200 transition-colors"
                  >
                    <i className="fas fa-reply mr-1"></i>Respond
                  </button>
                  <button 
                    onClick={() => handleViewQuery(query)}
                    className="bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors"
                  >
                    <i className="fas fa-eye mr-1"></i>View Full
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Query Response Modal */}
      {showResponseModal && selectedQuery && (
        <QueryResponseModal 
          query={selectedQuery}
          clients={clients}
          onClose={() => setShowResponseModal(false)}
          onSubmit={submitQueryResponse}
        />
      )}

      {/* Query Details Modal */}
      {showDetailsModal && selectedQuery && (
        <QueryDetailsModal 
          query={selectedQuery}
          clients={clients}
          onClose={() => setShowDetailsModal(false)}
          onRespond={() => {
            setShowDetailsModal(false);
            setShowResponseModal(true);
          }}
        />
      )}
    </>
  );
};

// Query Response Modal Component
const QueryResponseModal = ({ query, clients, onClose, onSubmit }) => {
  const [responseMessage, setResponseMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const client = typeof query.client === 'object' && query.client.name 
    ? query.client 
    : clients?.find(c => c._id === query.client) || { name: 'Unknown Client', _id: query.client };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!responseMessage.trim()) {
      alert('Please enter a response message.');
      return;
    }
    
    onSubmit(query._id, {
      message: responseMessage.trim(),
      isInternal: isInternal
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Respond to Query</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="font-medium text-gray-900">{client.name}</div>
            <div className="text-sm text-gray-600">{query.subject || 'General Query'}</div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Original Query:</label>
            <div className="border p-3 bg-gray-50 rounded">
              {query.message || query.description || 'No message content'}
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Response:</label>
              <textarea 
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows="5"
                placeholder="Type your response here..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Internal note (not visible to client)</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Send Response
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Query Details Modal Component
const QueryDetailsModal = ({ query, clients, onClose, onRespond }) => {
  const client = typeof query.client === 'object' && query.client.name 
    ? query.client 
    : clients?.find(c => c._id === query.client) || { name: 'Unknown Client', _id: query.client };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const formatStatus = (status) => {
    const statusMap = {
      'new': 'New',
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-purple-100 text-purple-800',
      'resolved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Query Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm font-medium text-gray-700">Client:</div>
              <div className="text-gray-900">{client.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Subject:</div>
              <div className="text-gray-900">{query.subject || 'General Query'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Priority:</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                query.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {(query.priority || 'normal').toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Status:</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(query.status || 'pending')}`}>
                {formatStatus(query.status || 'pending')}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Created:</div>
              <div className="text-gray-900">{getTimeAgo(query.created_at || query.createdAt)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Category:</div>
              <div className="text-gray-900">{query.category || 'General'}</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Message:</div>
            <div className="border p-3 bg-gray-50 rounded">
              {query.message || query.description || 'No message content'}
            </div>
          </div>
          
          {query.responses && query.responses.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Responses:</div>
              <div className="space-y-2">
                {query.responses.map((response, index) => (
                  <div key={index} className="border p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500 mb-1">
                      {response.user?.first_name || 'Unknown'} - {getTimeAgo(response.timestamp)}
                    </div>
                    <div className="text-gray-900">{response.message}</div>
                  </div>
                ))}
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
            <button 
              onClick={onRespond}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Respond
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueriesManagement;