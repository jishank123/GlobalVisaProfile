import { useState, useEffect, useCallback } from 'react';

const TasksManagement = ({ apiCall, projects, clients }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const loadTasks = useCallback(() => {
    setLoading(true);
    try {
      // Extract tasks from all projects
      const allTasks = [];
      
      if (projects && projects.length > 0) {
        projects.forEach(project => {
          if (project.milestones && project.milestones.length > 0) {
            project.milestones.forEach(milestone => {
              const client = typeof project.client === 'object' && project.client.name 
                ? project.client 
                : clients?.find(c => c._id === project.client) || { name: 'Unknown Client', _id: project.client };
              
              allTasks.push({
                ...milestone,
                project: project,
                client: client
              });
            });
          }
        });
      }
      
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projects, clients]);

  useEffect(() => {
    loadTasks();
  }, [projects, loadTasks]);

  const handleUpdateTaskStatus = (task) => {
    setSelectedTask(task);
    setShowUpdateModal(true);
  };

  const submitTaskStatusUpdate = async (projectId, taskId, updateData) => {
    try {
      // Try to update the specific milestone first
      let response = await apiCall(`/projects/${projectId}/milestones/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });
      
      // If milestone-specific endpoint doesn't exist, fall back to project update
      if (!response.success && response.status === 404) {
        response = await apiCall(`/projects/${projectId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            milestone_update: {
              milestone_id: taskId,
              ...updateData
            }
          })
        });
      }
      
      if (response.success) {
        setShowUpdateModal(false);
        // Refresh tasks by reloading from projects
        loadTasks();
        alert('Task status updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isOverdue = (targetDate, status) => {
    if (!targetDate || status === 'completed') return false;
    return new Date(targetDate) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <i className="fas fa-tasks text-4xl text-gray-400 mb-4"></i>
        <h5 className="text-lg font-semibold text-gray-700 mb-2">No Tasks Found</h5>
        <p className="text-gray-600">Tasks and milestones from your projects will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              <i className="fas fa-tasks mr-2"></i>My Tasks & Milestones
            </h3>
            <button 
              onClick={loadTasks}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map(task => {
                const overdue = isOverdue(task.target_date, task.status);
                
                return (
                  <tr key={`${task.project._id}-${task._id}`} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{task.title}</div>
                        {task.notes && (
                          <div className="text-sm text-gray-500 mt-1">{task.notes}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          #{task.project.project_id || task.project._id?.slice(-6)}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">
                          {task.project.service_name || 'Unknown Service'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">{task.client.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status?.replace('_', ' ') || 'Pending'}
                        </span>
                        {overdue && (
                          <div className="text-xs text-red-600 mt-1">Overdue</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">{formatDate(task.target_date)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleUpdateTaskStatus(task)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Update Status"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => {/* View project details */}}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Project"
                        >
                          <i className="fas fa-eye"></i>
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

      {/* Update Task Status Modal */}
      {showUpdateModal && selectedTask && (
        <UpdateTaskStatusModal 
          task={selectedTask}
          onClose={() => setShowUpdateModal(false)}
          onSubmit={submitTaskStatusUpdate}
        />
      )}
    </>
  );
};

// Update Task Status Modal Component
const UpdateTaskStatusModal = ({ task, onClose, onSubmit }) => {
  const [status, setStatus] = useState(task.status || 'pending');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(task.project._id, task._id, {
      status,
      completion_date: status === 'completed' ? new Date().toISOString() : null,
      notes: notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Update Task Status</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="font-medium text-gray-900">{task.title}</div>
            <div className="text-sm text-gray-600">
              Project: #{task.project.project_id} - {task.project.service_name}
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
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

export default TasksManagement;