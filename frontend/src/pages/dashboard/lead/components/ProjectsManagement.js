import { useState } from 'react';

const ProjectsManagement = ({ projects = [], clients = [], onRefresh, apiCall }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [taskData, setTaskData] = useState({ title: '', status: 'pending', targetDate: '', notes: '' });
  const [statusData, setStatusData] = useState({ status: '', progress: 0, notes: '' });
  const [handoverData, setHandoverData] = useState({ newCrmManager: '', reason: 'workload', notes: '' });
  const [crmManagers, setCrmManagers] = useState([]);
  const [submittingTask, setSubmittingTask] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [submittingHandover, setSubmittingHandover] = useState(false);

  const formatStatus = (status) => {
    const statusMap = {
      'active': 'Active',
      'pending': 'Pending',
      'completed': 'Completed',
      'in_progress': 'In Progress',
      'on_hold': 'On Hold',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'active': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-purple-100 text-purple-800',
      'on_hold': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const findClientById = (clientId) => {
    if (!clientId) return { name: 'Unknown Client', _id: clientId };
    
    const client = clients.find(c => c._id === clientId);
    return client || { name: 'Unknown Client', _id: clientId };
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleAddTask = (project) => {
    setSelectedProject(project);
    setTaskData({ title: '', status: 'pending', targetDate: '', notes: '' });
    setShowAddTaskModal(true);
  };

  const handleUpdateStatus = (project) => {
    setSelectedProject(project);
    setStatusData({ 
      status: project.status || 'active', 
      progress: project.progress || 0, 
      notes: '' 
    });
    setShowUpdateStatusModal(true);
  };

  const handleHandover = async (project) => {
    setSelectedProject(project);
    setHandoverData({ newCrmManager: '', reason: 'workload', notes: '' });
    
    // Load CRM managers
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users?role=crm_manager', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setCrmManagers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading CRM managers:', error);
    }
    
    setShowHandoverModal(true);
  };

  const submitTask = async () => {
    if (!taskData.title.trim()) {
      alert('Please enter a task title.');
      return;
    }

    setSubmittingTask(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${selectedProject._id}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: taskData.title,
          status: taskData.status,
          target_date: taskData.targetDate,
          notes: taskData.notes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Task "${taskData.title}" added successfully to project!`);
        setShowAddTaskModal(false);
        onRefresh();
      } else {
        throw new Error(data.message || 'Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task: ' + error.message);
    } finally {
      setSubmittingTask(false);
    }
  };

  const submitStatusUpdate = async () => {
    setSubmittingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${selectedProject._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: statusData.status,
          progress: statusData.progress,
          notes: statusData.notes ? [{ text: statusData.notes, created_at: new Date() }] : undefined
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Project status updated successfully!');
        setShowUpdateStatusModal(false);
        onRefresh();
      } else {
        throw new Error(data.message || 'Failed to update project status');
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Failed to update project status: ' + error.message);
    } finally {
      setSubmittingStatus(false);
    }
  };

  const submitHandover = async () => {
    if (!handoverData.newCrmManager) {
      alert('Please select a new CRM manager.');
      return;
    }
    
    if (!handoverData.notes.trim()) {
      alert('Please provide handover notes.');
      return;
    }

    setSubmittingHandover(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${selectedProject._id}/handover`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          new_crm_manager: handoverData.newCrmManager,
          handover_reason: handoverData.reason,
          handover_notes: handoverData.notes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Project handed over successfully!');
        setShowHandoverModal(false);
        onRefresh();
      } else {
        throw new Error(data.message || 'Failed to handover project');
      }
    } catch (error) {
      console.error('Error handing over project:', error);
      alert('Failed to handover project: ' + error.message);
    } finally {
      setSubmittingHandover(false);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <i className="fas fa-briefcase text-xl text-gray-600"></i>
            <h2 className="text-xl font-bold text-gray-800">Active Projects</h2>
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
          <i className="fas fa-briefcase text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-500 mb-2">No Active Projects</h3>
          <p className="text-gray-400">You don't have any active projects assigned yet.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <i className="fas fa-briefcase text-xl text-gray-600"></i>
            <h2 className="text-xl font-bold text-gray-800">Active Projects</h2>
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
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Project ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Progress</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const client = findClientById(project.client);
                return (
                  <tr key={project._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        #{project.project_id || project._id?.slice(-6)}
                      </span>
                    </td>
                    <td className="py-4 px-4">{client.name}</td>
                    <td className="py-4 px-4">{project.service_name || project.title || 'Unknown Service'}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{project.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {formatStatus(project.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewProject(project)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors text-sm"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => handleAddTask(project)}
                          className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors text-sm"
                          title="Add Task"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(project)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition-colors text-sm"
                          title="Update Status"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleHandover(project)}
                          className="px-3 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-colors text-sm"
                          title="Handover"
                        >
                          <i className="fas fa-exchange-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Details Modal */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  Project Details - #{selectedProject.project_id || selectedProject._id?.slice(-6)}
                </h2>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-gray-500"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="mb-3"><strong>Client:</strong> {findClientById(selectedProject.client).name}</p>
                  <p className="mb-3"><strong>Service:</strong> {selectedProject.service_name || selectedProject.title}</p>
                  <p className="mb-3">
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
                      {formatStatus(selectedProject.status)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="mb-3"><strong>Progress:</strong> {selectedProject.progress || 0}%</p>
                  <p className="mb-3">
                    <strong>Priority:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      selectedProject.priority === 'high' ? 'bg-red-100 text-red-800' :
                      selectedProject.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedProject.priority || 'medium'}
                    </span>
                  </p>
                  <p className="mb-3"><strong>Amount:</strong> {selectedProject.amount?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-gray-200 rounded-full h-6">
                  <div 
                    className="bg-blue-500 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium transition-all duration-300"
                    style={{ width: `${selectedProject.progress || 0}%` }}
                  >
                    {selectedProject.progress || 0}%
                  </div>
                </div>
              </div>

              {selectedProject.description && (
                <div className="mb-6">
                  <strong>Description:</strong>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    {selectedProject.description}
                  </div>
                </div>
              )}

              {selectedProject.milestones && selectedProject.milestones.length > 0 && (
                <div className="mb-6">
                  <strong>Milestones:</strong>
                  <div className="mt-2 space-y-2">
                    {selectedProject.milestones.map((milestone, index) => (
                      <div key={index} className="border border-gray-200 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{milestone.title}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                            {formatStatus(milestone.status)}
                          </span>
                        </div>
                        {milestone.notes && (
                          <p className="text-sm text-gray-600 mt-1">{milestone.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowProjectModal(false);
                  handleAddTask(selectedProject);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Add Task
              </button>
              <button
                onClick={() => {
                  setShowProjectModal(false);
                  handleUpdateStatus(selectedProject);
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Update Status
              </button>
              <button
                onClick={() => {
                  setShowProjectModal(false);
                  handleHandover(selectedProject);
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Handover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Add Task to Project #{selectedProject.project_id}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title:</label>
                <input
                  type="text"
                  value={taskData.title}
                  onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status:</label>
                <select
                  value={taskData.status}
                  onChange={(e) => setTaskData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Date:</label>
                <input
                  type="date"
                  value={taskData.targetDate}
                  onChange={(e) => setTaskData(prev => ({ ...prev, targetDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes:</label>
                <textarea
                  value={taskData.notes}
                  onChange={(e) => setTaskData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add task notes..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowAddTaskModal(false)}
                disabled={submittingTask}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={submitTask}
                disabled={submittingTask}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingTask ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Adding Task...
                  </>
                ) : (
                  'Add Task'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateStatusModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Update Project Status</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status:</label>
                <select
                  value={statusData.status}
                  onChange={(e) => setStatusData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Progress (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={statusData.progress}
                  onChange={(e) => setStatusData(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes:</label>
                <textarea
                  value={statusData.notes}
                  onChange={(e) => setStatusData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add status update notes..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowUpdateStatusModal(false)}
                disabled={submittingStatus}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={submitStatusUpdate}
                disabled={submittingStatus}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingStatus ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handover Modal */}
      {showHandoverModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Handover Project</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New CRM Manager:</label>
                <select
                  value={handoverData.newCrmManager}
                  onChange={(e) => setHandoverData(prev => ({ ...prev, newCrmManager: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select CRM Manager...</option>
                  {crmManagers.map(crm => (
                    <option key={crm._id} value={crm._id}>
                      {crm.first_name} {crm.last_name} ({crm.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason:</label>
                <select
                  value={handoverData.reason}
                  onChange={(e) => setHandoverData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="workload">Workload Management</option>
                  <option value="expertise">Expertise Match</option>
                  <option value="availability">Availability</option>
                  <option value="client_request">Client Request</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Handover Notes:</label>
                <textarea
                  value={handoverData.notes}
                  onChange={(e) => setHandoverData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide detailed handover notes for the new CRM manager..."
                  required
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowHandoverModal(false)}
                disabled={submittingHandover}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={submitHandover}
                disabled={submittingHandover}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingHandover ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Handing Over...
                  </>
                ) : (
                  'Handover Project'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectsManagement;