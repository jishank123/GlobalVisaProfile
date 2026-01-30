import { useState, useEffect, useCallback } from 'react';

const ProjectsManagement = ({ apiCall, onViewProject, onUpdateProject }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiCall('/projects/my-projects');
      if (response.success) {
        setProjects(response.data || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleViewProject = (project) => {
    setSelectedProject(project);
    if (onViewProject) {
      onViewProject(project);
    }
  };

  const handleUpdateStatus = (project) => {
    setSelectedProject(project);
    setShowUpdateModal(true);
  };

  const handleAddTask = (project) => {
    setSelectedProject(project);
    setShowTaskModal(true);
  };

  const submitStatusUpdate = async (projectId, updateData) => {
    try {
      const response = await apiCall(`/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });

      if (response.success) {
        setShowUpdateModal(false);
        loadProjects();
        alert('Project status updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project: ' + error.message);
    }
  };

  const submitTask = async (projectId, taskData) => {
    try {
      const response = await apiCall(`/projects/${projectId}/milestones`, {
        method: 'POST',
        body: JSON.stringify(taskData)
      });

      if (response.success) {
        setShowTaskModal(false);
        loadProjects();
        alert('Task added successfully!');
      } else {
        throw new Error(response.message || 'Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-gray-100 text-gray-800',
      'on_hold': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading active projects...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <i className="fas fa-briefcase text-4xl text-gray-400 mb-4"></i>
        <h5 className="text-lg font-semibold text-gray-700 mb-2">No Active Projects</h5>
        <p className="text-gray-600">You don't have any active projects assigned yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              <i className="fas fa-briefcase mr-2"></i>Active Projects
            </h3>
            <button 
              onClick={loadProjects}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map(project => {
                const client = typeof project.client === 'object' ? project.client : { name: 'Unknown Client' };
                const progress = project.progress || 0;
                
                return (
                  <tr key={project._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        #{project.project_id || project._id?.slice(-6) || 'PRJ-001'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">{client.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">{project.service_name || project.title || 'Unknown Service'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 mt-1">{progress}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status || 'active')}`}>
                        {project.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewProject(project)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          onClick={() => handleAddTask(project)}
                          className="text-green-600 hover:text-green-900"
                          title="Add Task"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(project)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Update Status"
                        >
                          <i className="fas fa-edit"></i>
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

      {/* Update Status Modal */}
      {showUpdateModal && selectedProject && (
        <UpdateStatusModal 
          project={selectedProject}
          onClose={() => setShowUpdateModal(false)}
          onSubmit={submitStatusUpdate}
        />
      )}

      {/* Add Task Modal */}
      {showTaskModal && selectedProject && (
        <AddTaskModal 
          project={selectedProject}
          onClose={() => setShowTaskModal(false)}
          onSubmit={submitTask}
        />
      )}
    </>
  );
};

// Update Status Modal Component
const UpdateStatusModal = ({ project, onClose, onSubmit }) => {
  const [status, setStatus] = useState(project.status || 'active');
  const [progress, setProgress] = useState(project.progress || 0);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(project._id, {
      status,
      progress: parseInt(progress),
      notes: notes ? [{ text: notes, created_at: new Date() }] : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Update Project Status</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Progress (%)</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                placeholder="Add status update notes..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Add Task Modal Component
const AddTaskModal = ({ project, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('pending');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a task title.');
      return;
    }
    
    onSubmit(project._id, {
      title: title.trim(),
      status,
      target_date: targetDate,
      notes: notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add Task to Project #{project.project_id}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
              <input 
                type="date" 
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                placeholder="Add task notes..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                Add Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectsManagement;