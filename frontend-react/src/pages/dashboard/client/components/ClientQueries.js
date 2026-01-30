import { useState, useEffect } from 'react';

const ClientQueries = ({ apiCall }) => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showResponsesModal, setShowResponsesModal] = useState(false);

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    setLoading(true);
    try {
      // Get client ID from current client data or localStorage
      let clientId = localStorage.getItem('clientId');
      
      if (!clientId) {
        // Try to get from profile endpoint
        const profileResponse = await apiCall('/client-accounts/profile');
        if (profileResponse.success && profileResponse.data.client_profile) {
          clientId = profileResponse.data.client_profile._id;
        }
      }

      if (!clientId) {
        console.error('Client ID not found');
        setQueries([]);
        return;
      }

      const response = await apiCall(`/queries/client/${clientId}`);
      
      if (response.success && response.data) {
        setQueries(response.data);
      } else {
        setQueries([]);
      }
    } catch (error) {
      console.error('Error loading queries:', error);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResponses = (query) => {
    setSelectedQuery(query);
    setShowResponsesModal(true);
  };

  const handleNewQuery = () => {
    setShowContactModal(true);
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

  const getPriorityColor = (priority) => {
    const colors = {
      'urgent': 'bg-red-500',
      'high': 'bg-orange-500',
      'medium': 'bg-blue-500',
      'low': 'bg-green-500'
    };
    return colors[priority] || colors.medium;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
  };

  const formatCategoryName = (category) => {
    const categoryMap = {
      'service_inquiry': 'Service Inquiry',
      'payment_issue': 'Payment Issue',
      'document_request': 'Document Request',
      'status_update': 'Status Update',
      'technical_support': 'Technical Support',
      'General': 'General',
      'Technical': 'Technical',
      'Billing': 'Billing',
      'Project': 'Project',
      'Complaint': 'Complaint',
      'Other': 'Other'
    };
    return categoryMap[category] || capitalizeFirst(category);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading queries...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Queries Table */}
        {queries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <i className="fas fa-question-circle text-4xl text-gray-400 mb-4"></i>
            <h5 className="text-lg font-semibold text-gray-700 mb-2">No Queries Found</h5>
            <p className="text-gray-600 mb-4">You haven't submitted any queries yet. Contact our CRM team for assistance!</p>
            <button 
              onClick={handleNewQuery}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>Submit Query
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  <i className="fas fa-question-circle mr-2"></i>My Queries
                </h3>
                <button 
                  onClick={handleNewQuery}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-plus mr-1"></i>New Query
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responses</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queries.map(query => (
                    <tr key={query._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">{formatDate(query.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{query.subject}</div>
                          <div className="text-sm text-gray-500">
                            {query.description.substring(0, 50)}
                            {query.description.length > 50 ? '...' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                          {formatCategoryName(query.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(query.priority)}`}>
                          {capitalizeFirst(query.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                          {capitalizeFirst(query.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">
                          {query.assignedTo ? 
                            `${query.assignedTo.first_name} ${query.assignedTo.last_name}` : 
                            'Not assigned'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mr-2">
                            {query.responses ? query.responses.length : 0}
                          </span>
                          {query.responses && query.responses.length > 0 ? (
                            <button 
                              onClick={() => handleViewResponses(query)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Responses"
                            >
                              <i className="fas fa-comment-dots"></i>
                            </button>
                          ) : (
                            <i className="fas fa-comment-slash text-gray-400" title="No responses yet"></i>
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

      {/* Contact Support Modal */}
      {showContactModal && (
        <ContactSupportModal 
          apiCall={apiCall}
          onClose={() => setShowContactModal(false)}
          onSuccess={() => {
            setShowContactModal(false);
            loadQueries(); // Refresh queries after submission
          }}
        />
      )}

      {/* Query Responses Modal */}
      {showResponsesModal && selectedQuery && (
        <QueryResponsesModal 
          query={selectedQuery}
          onClose={() => setShowResponsesModal(false)}
        />
      )}
    </>
  );
};

// Contact Support Modal Component
const ContactSupportModal = ({ apiCall, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    priority: 'medium',
    category: '',
    subject: '',
    description: '',
    attachment: null
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.subject || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const submitData = {
        priority: formData.priority,
        category: formData.category,
        subject: formData.subject,
        description: formData.description
      };

      const response = await apiCall('/queries', {
        method: 'POST',
        body: JSON.stringify(submitData)
      });
      
      if (response.success) {
        alert('Query submitted successfully! Our team will respond soon.');
        onSuccess();
      } else {
        throw new Error(response.message || 'Failed to submit query');
      }
      
    } catch (error) {
      console.error('Error submitting query:', error);
      alert(`Failed to submit query: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              <i className="fas fa-headset mr-2"></i>Contact CRM Support
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                  <select 
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="low">🟢 Low - General inquiry</option>
                    <option value="medium">🟡 Medium - Service question</option>
                    <option value="high">🟠 High - Urgent matter</option>
                    <option value="urgent">🔴 Urgent - Critical issue</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="service_inquiry">Service Inquiry</option>
                    <option value="payment_issue">Payment Issue</option>
                    <option value="document_request">Document Request</option>
                    <option value="status_update">Status Update</option>
                    <option value="technical_support">Technical Support</option>
                    <option value="Complaint">Complaint</option>
                    <option value="General">General</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Brief description of your inquiry"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="5"
                    placeholder="Please provide detailed information about your inquiry or issue..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <small className="text-gray-500">Be as specific as possible to help us assist you better.</small>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (Optional)</label>
                  <input 
                    type="file"
                    name="attachment"
                    onChange={(e) => setFormData(prev => ({ ...prev, attachment: e.target.files[0] }))}
                    accept="image/*,application/pdf,.doc,.docx"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <small className="text-gray-500">Upload relevant documents, screenshots, or files (Max 10MB)</small>
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
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-1"></i>Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-1"></i>Send to CRM Team
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h6 className="font-semibold mb-3">
                <i className="fas fa-clock text-blue-500 mr-2"></i>Response Times
              </h6>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">Urgent</span>
                  <span>Within 1 hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">High</span>
                  <span>Within 4 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Medium</span>
                  <span>Within 24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Low</span>
                  <span>Within 48 hours</span>
                </div>
              </div>
              <hr className="my-4" />
              <div className="text-center text-sm text-gray-600">
                <i className="fas fa-user-tie text-blue-500 mr-1"></i>
                Handled by CRM Managers
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Query Responses Modal Component
const QueryResponsesModal = ({ query, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              <i className="fas fa-comment-dots mr-2"></i>Query Responses
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {/* Query Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">{query.subject}</h4>
            <p className="text-gray-700 mb-2">{query.description}</p>
            <div className="text-sm text-gray-500">
              Submitted: {formatDate(query.createdAt)} • 
              Category: {query.category} • 
              Priority: {query.priority}
            </div>
          </div>
          
          {/* Responses */}
          <div className="space-y-4">
            {query.responses && query.responses.length > 0 ? (
              query.responses.map((response, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900">
                      {response.responder?.first_name} {response.responder?.last_name} 
                      <span className="text-sm text-gray-500 ml-2">(CRM Team)</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(response.createdAt)}
                    </div>
                  </div>
                  <div className="text-gray-700">{response.message}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-comment-slash text-3xl mb-2"></i>
                <p>No responses yet. Our team will respond soon.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-6">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientQueries;