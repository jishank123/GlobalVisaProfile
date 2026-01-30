import { useState, useEffect, useCallback } from 'react';

const ConvertToProjectModal = ({ 
  isOpen, 
  onClose, 
  apiCall, 
  onSuccess,
  preSelectedLeadId = null 
}) => {
  const [qualifiedLeads, setQualifiedLeads] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [formData, setFormData] = useState({
    serviceId: '',
    priority: 'medium',
    dueDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadQualifiedLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiCall('/leads?status=qualified&limit=100');
      if (response.success) {
        setQualifiedLeads(response.data);
      }
    } catch (error) {
      console.error('Error loading qualified leads:', error);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const loadServices = useCallback(async () => {
    try {
      const response = await apiCall('/services');
      if (response.success) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  }, [apiCall]);

  useEffect(() => {
    if (isOpen) {
      loadQualifiedLeads();
      loadServices();
      if (preSelectedLeadId) {
        setSelectedLeads([preSelectedLeadId]);
      }
    }
  }, [isOpen, preSelectedLeadId, loadQualifiedLeads, loadServices]);

  const handleLeadSelection = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.serviceId) {
      alert('Please select a service');
      return;
    }
    
    if (selectedLeads.length === 0) {
      alert('Please select at least one lead to convert');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiCall('/leads/bulk/convert-to-project', {
        method: 'POST',
        body: JSON.stringify({
          lead_ids: selectedLeads,
          service_id: formData.serviceId,
          priority: formData.priority,
          due_date: formData.dueDate,
          notes: formData.notes
        })
      });

      if (response.success) {
        const successCount = response.data.successful.length;
        const failedCount = response.data.failed.length;
        
        let message = `Successfully converted ${successCount} lead(s) to projects!`;
        if (failedCount > 0) {
          message += `\n\nNote: ${failedCount} lead(s) could not be converted.`;
        }
        
        alert(message);
        onSuccess();
        handleClose();
      } else {
        throw new Error(response.error?.message || 'Conversion failed');
      }
    } catch (error) {
      console.error('Error converting leads:', error);
      alert('Error converting leads to projects: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedLeads([]);
    setFormData({
      serviceId: '',
      priority: 'medium',
      dueDate: '',
      notes: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <h3 className="text-lg font-semibold">
            <i className="fas fa-project-diagram mr-2"></i>
            Convert Leads to Projects
          </h3>
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-blue-800">
              <i className="fas fa-info-circle mr-2"></i>
              Select qualified leads to convert into projects. Each lead will become a project that can then be assigned to CRM managers.
            </p>
          </div>

          {/* Lead Selection */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">
              <i className="fas fa-list mr-2"></i>Select Leads to Convert
            </h4>
            <div className="border rounded-lg p-4 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading qualified leads...</p>
                </div>
              ) : qualifiedLeads.length === 0 ? (
                <div className="text-center py-4 text-gray-600">
                  <i className="fas fa-info-circle text-2xl mb-2"></i>
                  <p className="font-semibold">No qualified leads available</p>
                  <p className="text-sm mt-2">To convert leads to projects, you need to:</p>
                  <ol className="text-sm mt-2 text-left max-w-md mx-auto">
                    <li>1. Contact your leads (use "Contact" button)</li>
                    <li>2. Mark them as qualified (use "Qualify" button)</li>
                    <li>3. Then convert qualified leads to projects</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-2">
                  {qualifiedLeads.map(lead => (
                    <div key={lead._id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        id={`lead-${lead._id}`}
                        checked={selectedLeads.includes(lead._id)}
                        onChange={() => handleLeadSelection(lead._id)}
                        className="mr-3"
                      />
                      <label htmlFor={`lead-${lead._id}`} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">{lead.firstName} {lead.lastName}</div>
                            <div className="text-sm text-gray-600">{lead.email}</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-semibold ${
                              lead.priority === 'high' ? 'text-red-600' :
                              lead.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {lead.priority?.charAt(0).toUpperCase() + lead.priority?.slice(1)}
                            </div>
                            <div className="text-sm text-gray-500">{lead.university || 'No university'}</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">Only qualified leads can be converted to projects</p>
          </div>

          {/* Service Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-cogs mr-1"></i>Select Service *
            </label>
            <select
              value={formData.serviceId}
              onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select Service --</option>
              {services.map(service => (
                <option key={service._id} value={service._id}>
                  {service.name} - {service.category}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 mt-1">Choose the service that will be provided in the project</p>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Project Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-sticky-note mr-1"></i>Project Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any special instructions or notes for the project..."
            />
          </div>

          {/* Selected Leads Summary */}
          {selectedLeads.length > 0 && (
            <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg mb-6">
              <i className="fas fa-check-circle text-green-600 mr-2"></i>
              <strong>Selected Leads:</strong> {selectedLeads.length} lead(s) will be converted to projects
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || selectedLeads.length === 0 || !formData.serviceId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Converting...
                </>
              ) : (
                <>
                  <i className="fas fa-project-diagram mr-2"></i>
                  Convert to Projects
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertToProjectModal;