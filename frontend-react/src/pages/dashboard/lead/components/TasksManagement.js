import { useState } from 'react';

const TasksManagement = ({ tasks, onRefresh }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [statusData, setStatusData] = useState({ status: '', notes: '' });

  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'overdue': 'Overdue'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const isOverdue = (task) => {
    return task.target_date && new Date(task.target_date) < new Date() && task.status !== 'completed';
  };

  const handleUpdateTaskStatus = (task) => {
    setSelectedTask(task);
    setStatusData({ status: task.status, notes: '' });
    setShowTaskModal(true);
  };

  const submitTaskStatusUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Try to update the specific milestone first
      let response = await fetch(`/api/projects/${selectedTask.project._id}/milestones/${selectedTask._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: statusData.status,
          completion_date: statusData.status === 'completed' ? new Date().toISOString() : null,
          notes: statusData.notes
        })
      });

      let data = await response.json();

      // If milestone-specific endpoint doesn't exist, fall back to project update
      if (!data.success && response.status === 404) {
        response = await fetch(`/api/projects/${selectedTask.project._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            milestone_update: {
              milestone_id: selectedTask._id,
              status: statusData.status,
              completion_date: statusData.status === 'completed' ? new Date().toISOString() : null,
              notes: statusData.notes
            }
          })
        });
        data = await response.json();
      }

      if (data.success) {
        setShowTaskModal(false);
        onRefresh();
        alert('Task status updated successfully!');
      } else {
        throw new Error(data.message || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status: ' + error.message);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <i className="fas fa-tasks text-xl text-gray-600"></i>
            <h2 className="text-xl font-bold text-gray-800">My Tasks & Milestones</h2>
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
          <i className="fas fa-tasks text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-500 mb-2">No Tasks Found</h3>
          <p className="text-gray-400">Tasks and milestones from your projects will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <i className="fas fa-tasks text-xl text-gray-600"></i>
            <h2 className="text-xl font-bold text-gray-800">My Tasks & Milestones</h2>
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
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Task</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Project</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Target Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => {
                const targetDate = task.target_date ? new Date(task.target_date).toLocaleDateString() : 'No deadline';
                const taskIsOverdue = isOverdue(task);
                
                return (
                  <tr 
                    key={`${task.project._id}-${task._id}-${index}`} 
                    className={`border-b border-gray-100 hover:bg-gray-50 ${taskIsOverdue ? 'bg-red-50' : ''}`}
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-800">{task.title}</div>
                        {task.notes && (
                          <div className="text-sm text-gray-500 mt-1">{task.notes}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          #{task.project.project_id || task.project._id?.slice(-6)}
                        </span>
                        <div className="text-sm text-gray-600 mt-1">
                          {task.project.service_name || 'Unknown Service'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{task.client?.name || 'Unknown Client'}</td>
                    <td className="py-4 px-4">
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {formatStatus(task.status)}
                        </span>
                        {taskIsOverdue && (
                          <div className="text-xs text-red-600 mt-1 font-medium">Overdue</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={taskIsOverdue ? 'text-red-600 font-medium' : ''}>
                        {targetDate}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateTaskStatus(task)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition-colors text-sm"
                          title="Update Status"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => {
                            // This would typically open the project view
                            alert(`View project #${task.project.project_id || task.project._id?.slice(-6)}`);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors text-sm"
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

      {/* Task Status Update Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Update Task Status</h2>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-gray-500"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><strong>Task:</strong></label>
                <p className="text-gray-800">{selectedTask.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><strong>Project:</strong></label>
                <p className="text-gray-800">
                  #{selectedTask.project.project_id} - {selectedTask.project.service_name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status:</label>
                <select
                  value={statusData.status}
                  onChange={(e) => setStatusData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
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
                onClick={() => setShowTaskModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitTaskStatusUpdate}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TasksManagement;