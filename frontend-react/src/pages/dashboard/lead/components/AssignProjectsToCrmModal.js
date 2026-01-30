import { useState, useEffect } from 'react';

const AssignProjectsToCrmModal = ({ 
  isOpen, 
  onClose, 
  apiCall, 
  onSuccess 
}) => {
  const [availableProjects, setAvailableProjects] = useState([]);
  const [crmManagers, setCrmManagers] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [formData, setFormData] = useState({
    crmManagerId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadAvailableProjects = async () => {
        setLoading(true);
        try {
          const response = await apiCall('/projects?status=pending&limit=100');
          if (response.success) {
            setAvailableProjects(response.data);
          }
        } catch (error) {
          console.error('Error loading projects:', error);
        } finally {
          setLoading(false);
        }
      };

      const loadCrmManagers = async () => {
        try {
          const response = await apiCall('/users?role=crm_manager');
          if (response.success) {
            setCrmManagers(response.data);
          }
        } catch (error) {
          console.error('Error loading CRM managers:', error);
        }
      };

      loadAvailableProjects();
      loadCrmManagers();
    }
  }, [isOpen, apiCall]);

  const handleProjectSelection = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.crmManagerId) {
      alert('Please select a CRM Manager');
      return;
    }
    
    if (selectedProjects.length === 0) {
      alert('Please select at least one project to assign');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiCall('/projects/bulk/assign-to-crm', {
        method: 'POST',
        body: JSON.stringify({
          project_ids: selectedProjects,
          crm_manager_id: formData.crmManagerId,
          notes: formData.notes
        })
      });

      if (response.success) {
        const successCount = response.data.successful.length;
        const failedCount = response.data.failed.length;
        
        let message = `Successfully assigned ${successCount} project(s) to CRM Manager!`;
        if (failedCount > 0) {
          message += `\n\nNote: ${failedCount} project(s) could not be assigned.`;
        }
        
        alert(message);
        onSuccess();
        handleClose();
      } else {
        throw new Error(response.error?.message || 'Assignment failed');
      }
    } catch (error) {
      console.error('Error assigning projects:', error);
      alert('Error assigning projects to CRM manager: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedProjects([]);
    setFormData({
      crmManagerId: '',
      notes: ''
    });
    onClose();
  };

  const formatPriority = (priority) => {
    return priority?.charAt(0).toUpperCase() + priority?.slice(1) || 'Medium';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <h3 className="text-lg font-semibold">
            <i className="fas fa-user-cog mr-2"></i>
            Assign Projects to CRM Manager
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
              Select projects created from leads to assign to CRM managers for execution and client management.
            </p>
          </div>

          {/* Project Selection */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">
              <i className="fas fa-list mr-2"></i>Select Projects to Assign
            </h4>
            <div className="border rounded-lg p-4 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading available projects...</p>
                </div>
              ) : availableProjects.length === 0 ? (
                <div className="text-center py-4 text-gray-600">
                  <i className="fas fa-info-circle text-2xl mb-2"></i>
                  <p className="font-semibold">No projects available for assignment</p>
                  <p className="text-sm mt-2">To assign projects to CRM managers, you need to:</p>
                  <ol className="text-sm mt-2 text-left max-w-md mx-auto">
                    <li>1. Convert qualified leads to projects first</li>
                    <li>2. Then assign those projects to CRM managers</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableProjects.map(project => {
                    const clientName = project.client ? 
                      (typeof project.client === 'object' ? 
                        `${project.client.firstName} ${project.client.lastName}` : 
                        project.client) : 'Unknown Client';
                    
                    const serviceName = project.service?.name || project.service_name || 'Unknown Service';

                    return (
                      <div key={project._id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          id={`project-${project._id}`}
                          checked={selectedProjects.includes(project._id)}
                          onChange={() => handleProjectSelection(project._id)}
                          className="mr-3"
                        />
                        <label htmlFor={`project-${project._id}`} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold">{project.project_id}</div>
                              <div className="text-sm text-gray-600">{clientName}</div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-semibold ${
                                project.priority === 'high' ? 'text-red-600' :
                                project.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {formatPriority(project.priority)}
                              </div>
                              <div className="text-sm text-gray-500">{serviceName}</div>
                            </div>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">Only projects created from leads can be assigned to CRM managers</p>
          </div>

          {/* CRM Manager Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-user mr-1"></i>Select CRM Manager *
            </label>
            <select
              value={formData.crmManagerId}
              onChange={(e) => setFormData({...formData, crmManagerId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select CRM Manager --</option>
              {crmManagers.map(manager => (
                <option key={manager._id} value={manager._id}>
                  {manager.first_name} {manager.last_name} ({manager.email})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 mt-1">Choose the CRM manager who will handle these projects</p>
          </div>

          {/* Assignment Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-sticky-note mr-1"></i>Assignment Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any special instructions or notes for the CRM manager..."
            />
            <p className="text-sm text-gray-600 mt-1">These notes will be visible to the assigned CRM manager</p>
          </div>

          {/* Selected Projects Summary */}
          {selectedProjects.length > 0 && (
            <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg mb-6">
              <i className="fas fa-check-circle text-green-600 mr-2"></i>
              <strong>Selected Projects:</strong> {selectedProjects.length} project(s) will be assigned
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
              disabled={submitting || selectedProjects.length === 0 || !formData.crmManagerId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Assigning...
                </>
              ) : (
                <>
                  <i className="fas fa-user-cog mr-2"></i>
                  Assign to CRM Manager
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignProjectsToCrmModal;