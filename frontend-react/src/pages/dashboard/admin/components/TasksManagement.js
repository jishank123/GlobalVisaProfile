import { useState, useEffect } from 'react';
import { projectsAPI, usersAPI } from '../../../../services/api';

const TasksManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [crmManagers, setCrmManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    assigned_to: '',
    priority: 'medium',
    due_date: '',
    status: 'pending'
  });

  useEffect(() => {
    loadTasksData();
  }, []);

  const loadTasksData = async () => {
    try {
      setLoading(true);
      
      // Load projects with tasks (milestones)
      const projectsResponse = await projectsAPI.getAll();
      if (projectsResponse.success) {
        setProjects(projectsResponse.data || []);
        
        // Extract tasks from project milestones
        const allTasks = [];
        projectsResponse.data?.forEach(project => {
          if (project.milestones && project.milestones.length > 0) {
            project.milestones.forEach(milestone => {
              allTasks.push({
                ...milestone,
                project_id: project._id,
                project_name: project.service_name,
                client_name: project.client?.name,
                _id: milestone._id || `${project._id}-${milestone.title}` // Ensure unique ID
              });
            });
          }
        });
        setTasks(allTasks);
      }

      // Load CRM managers
      const usersResponse = await usersAPI.getAll({ role: 'crm_manager' });
      if (usersResponse.success) {
        setCrmManagers(usersResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading tasks data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const milestoneData = {
        title: formData.title,
        description: formData.description,
        assigned_to: formData.assigned_to,
        priority: formData.priority,
        due_date: formData.due_date || null,
        status: formData.status
      };

      // Add milestone to project
      const response = await projectsAPI.addMilestone(formData.project_id, milestoneData);

      if (response.success) {
        await loadTasksData();
        setShowAddModal(false);
        setFormData({
          title: '',
          description: '',
          project_id: '',
          assigned_to: '',
          priority: 'medium',
          due_date: '',
          status: 'pending'
        });
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, projectId, newStatus) => {
    try {
      setLoading(true);
      
      // Update milestone status using the project milestone endpoint
      const response = await projectsAPI.updateMilestone(projectId, taskId, { status: newStatus });
      
      if (response.success) {
        await loadTasksData();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (taskId, projectId, assignedTo) => {
    try {
      setLoading(true);
      
      // Update milestone assignment
      const response = await projectsAPI.updateMilestone(projectId, taskId, { assigned_to: assignedTo });
      
      if (response.success) {
        await loadTasksData();
        setShowAssignModal(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'pending': 'bg-warning',
      'in_progress': 'bg-info',
      'completed': 'bg-success',
      'on_hold': 'bg-secondary'
    };
    return statusClasses[status] || 'bg-secondary';
  };

  const getPriorityBadgeClass = (priority) => {
    const priorityClasses = {
      'low': 'bg-success',
      'medium': 'bg-warning',
      'high': 'bg-danger',
      'urgent': 'bg-danger'
    };
    return priorityClasses[priority] || 'bg-secondary';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-tasks text-primary me-2"></i>
          Tasks Management
        </h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Add New Task
        </button>
      </div>

      {/* Tasks Stats */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{tasks.filter(t => t.status === 'pending').length}</h4>
                  <p className="mb-0">Pending Tasks</p>
                </div>
                <i className="fas fa-clock fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{tasks.filter(t => t.status === 'in_progress').length}</h4>
                  <p className="mb-0">In Progress</p>
                </div>
                <i className="fas fa-spinner fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{tasks.filter(t => t.status === 'completed').length}</h4>
                  <p className="mb-0">Completed</p>
                </div>
                <i className="fas fa-check fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-secondary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{tasks.filter(t => t.status === 'on_hold').length}</h4>
                  <p className="mb-0">On Hold</p>
                </div>
                <i className="fas fa-pause fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">All Tasks</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Task Title</th>
                    <th>Project</th>
                    <th>Client</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <i className="fas fa-tasks fa-3x text-muted mb-3"></i>
                        <p className="text-muted">No tasks found</p>
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task, index) => (
                      <tr key={`${task.project_id}-${index}`}>
                        <td>
                          <strong>{task.title}</strong>
                          {task.description && (
                            <small className="d-block text-muted">
                              {task.description.substring(0, 50)}...
                            </small>
                          )}
                        </td>
                        <td>{task.project_name}</td>
                        <td>{task.client_name}</td>
                        <td>
                          {task.assigned_to ? (
                            <span className="badge bg-info">
                              {crmManagers.find(crm => crm._id === task.assigned_to)?.first_name || 'Unknown'}
                            </span>
                          ) : (
                            <span className="badge bg-secondary">Unassigned</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                            {task.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => {
                                setSelectedTask({ ...task, taskIndex: index });
                                setShowAssignModal(true);
                              }}
                              title="Assign Task"
                            >
                              <i className="fas fa-user-plus"></i>
                            </button>
                            <div className="dropdown">
                              <button
                                className="btn btn-outline-secondary dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                title="Update Status"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleUpdateTaskStatus(task._id, task.project_id, 'pending')}
                                  >
                                    Pending
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleUpdateTaskStatus(task._id, task.project_id, 'in_progress')}
                                  >
                                    In Progress
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleUpdateTaskStatus(task._id, task.project_id, 'completed')}
                                  >
                                    Completed
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleUpdateTaskStatus(task._id, task.project_id, 'on_hold')}
                                  >
                                    On Hold
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Task</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddTask}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Task Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Project *</label>
                    <select
                      className="form-select"
                      value={formData.project_id}
                      onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                      required
                    >
                      <option value="">Select Project</option>
                      {projects.map(project => (
                        <option key={project._id} value={project._id}>
                          {project.service_name} - {project.client?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Assign To</label>
                    <select
                      className="form-select"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    >
                      <option value="">Select CRM Manager</option>
                      {crmManagers.map(crm => (
                        <option key={crm._id} value={crm._id}>
                          {crm.first_name} {crm.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Due Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignModal && selectedTask && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Task: {selectedTask.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedTask(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Assign to CRM Manager</label>
                  <select
                    className="form-select"
                    value={selectedTask.assigned_to || ''}
                    onChange={(e) => setSelectedTask({ ...selectedTask, assigned_to: e.target.value })}
                  >
                    <option value="">Select CRM Manager</option>
                    {crmManagers.map(crm => (
                      <option key={crm._id} value={crm._id}>
                        {crm.first_name} {crm.last_name} ({crm.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedTask(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleAssignTask(selectedTask._id, selectedTask.project_id, selectedTask.assigned_to)}
                  disabled={loading || !selectedTask.assigned_to}
                >
                  {loading ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksManagement;