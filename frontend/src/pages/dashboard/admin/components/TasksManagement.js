import { useState, useEffect } from 'react';
import { projectsAPI, usersAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects, getStatusBadgeStyle } from '../../../../styles/designSystem';

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

  const getPriorityStyle = (priority) => {
    const priorityColors = {
      'low': designSystem.colors.success,
      'medium': designSystem.colors.warning,
      'high': designSystem.colors.danger,
      'urgent': designSystem.colors.danger
    };
    return { color: priorityColors[priority] || designSystem.colors.gray[500] };
  };

  const StatCard = ({ icon, number, label, borderColor, iconColor }) => (
    <div 
      style={{
        ...componentStyles.contactsStatCard,
        borderColor: borderColor,
        cursor: 'pointer'
      }}
      {...hoverEffects.card}
    >
      <i className={`${icon} fa-2x mb-2`} style={{ color: iconColor }}></i>
      <h4 style={{ 
        color: iconColor,
        fontWeight: designSystem.typography.fontWeight.bold,
        marginBottom: '4px'
      }}>
        {number}
      </h4>
      <small style={{ color: designSystem.colors.gray[500] }}>
        {label}
      </small>
    </div>
  );

  return (
    <div style={componentStyles.managementCard}>
      {/* Unified Header */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-tasks fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Tasks Management</h4>
            <p style={componentStyles.headerSubtitle}>Manage project tasks and assignments</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.primary
          }}
          onClick={() => setShowAddModal(true)}
          {...hoverEffects.button}
        >
          <i className="fas fa-plus me-2"></i>
          Add New Task
        </button>
      </div>

      {/* Tasks Stats */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-clock"
          number={tasks.filter(t => t.status === 'pending').length}
          label="Pending Tasks"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-spinner"
          number={tasks.filter(t => t.status === 'in_progress').length}
          label="In Progress"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
        <StatCard
          icon="fas fa-check"
          number={tasks.filter(t => t.status === 'completed').length}
          label="Completed"
          borderColor="#10b981"
          iconColor="#10b981"
        />
        <StatCard
          icon="fas fa-pause"
          number={tasks.filter(t => t.status === 'on_hold').length}
          label="On Hold"
          borderColor="#6b7280"
          iconColor="#6b7280"
        />
      </div>

      {/* Tasks Table */}
      <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
        <div style={{
          background: designSystem.colors.primary,
          color: 'white',
          padding: designSystem.spacing.md,
          fontWeight: designSystem.typography.fontWeight.semibold
        }}>
          All Tasks ({tasks.length})
        </div>
        <div style={{ background: 'white', padding: designSystem.spacing.lg }}>
          {loading ? (
            <div style={componentStyles.loading}>
              <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary.split(' ')[0].split('(')[1] }}></i>
              <p style={{ marginTop: designSystem.spacing.md }}>Loading tasks...</p>
            </div>
          ) : (
            <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={componentStyles.tableHeader}>
                  <tr>
                    <th style={componentStyles.tableHeaderCell}>Task Title</th>
                    <th style={componentStyles.tableHeaderCell}>Project</th>
                    <th style={componentStyles.tableHeaderCell}>Client</th>
                    <th style={componentStyles.tableHeaderCell}>Assigned To</th>
                    <th style={componentStyles.tableHeaderCell}>Priority</th>
                    <th style={componentStyles.tableHeaderCell}>Status</th>
                    <th style={componentStyles.tableHeaderCell}>Due Date</th>
                    <th style={componentStyles.tableHeaderCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ ...componentStyles.tableCell, textAlign: 'center', padding: designSystem.spacing.xl }}>
                        <div style={componentStyles.emptyState}>
                          <i className="fas fa-tasks fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
                          <p style={{ color: designSystem.colors.gray[500] }}>No tasks found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task, index) => {
                      const statusStyle = getStatusBadgeStyle(task.status);
                      const priorityStyle = getPriorityStyle(task.priority);
                      
                      return (
                        <tr 
                          key={`${task.project_id}-${index}`}
                          style={componentStyles.tableRow}
                          {...hoverEffects.tableRow}
                        >
                          <td style={componentStyles.tableCell}>
                            <strong>{task.title}</strong>
                            {task.description && (
                              <div>
                                <small style={{ color: designSystem.colors.gray[500] }}>
                                  {task.description.substring(0, 50)}...
                                </small>
                              </div>
                            )}
                          </td>
                          <td style={componentStyles.tableCell}>{task.project_name}</td>
                          <td style={componentStyles.tableCell}>{task.client_name}</td>
                          <td style={componentStyles.tableCell}>
                            {task.assigned_to ? (
                              <span style={{
                                ...componentStyles.badge,
                                background: designSystem.colors.info,
                                color: 'white'
                              }}>
                                {crmManagers.find(crm => crm._id === task.assigned_to)?.first_name || 'Unknown'}
                              </span>
                            ) : (
                              <span style={{
                                ...componentStyles.badge,
                                background: designSystem.colors.gray[400],
                                color: 'white'
                              }}>Unassigned</span>
                            )}
                          </td>
                          <td style={componentStyles.tableCell}>
                            <span style={{
                              ...priorityStyle,
                              fontWeight: designSystem.typography.fontWeight.bold
                            }}>
                              {task.priority.toUpperCase()}
                            </span>
                          </td>
                          <td style={componentStyles.tableCell}>
                            <span style={{
                              ...componentStyles.badge,
                              background: statusStyle.background,
                              color: statusStyle.color
                            }}>
                              {task.status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td style={componentStyles.tableCell}>
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                          </td>
                          <td style={componentStyles.tableCell}>
                            <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                              <button
                                style={{
                                  ...componentStyles.secondaryButton,
                                  padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
                                  fontSize: designSystem.typography.fontSize.sm,
                                  background: designSystem.colors.primary,
                                  color: 'white'
                                }}
                                onClick={() => {
                                  setSelectedTask({ ...task, taskIndex: index });
                                  setShowAssignModal(true);
                                }}
                                title="Assign Task"
                              >
                                <i className="fas fa-user-plus"></i>
                              </button>
                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                <button
                                  style={{
                                    ...componentStyles.secondaryButton,
                                    padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
                                    fontSize: designSystem.typography.fontSize.sm,
                                    background: designSystem.colors.warning,
                                    color: 'white'
                                  }}
                                  title="Update Status"
                                  onClick={() => {
                                    const newStatus = prompt(`Update status for: ${task.title}\n\nCurrent: ${task.status}\n\nOptions: pending, in_progress, completed, on_hold\n\nEnter new status:`);
                                    if (newStatus && ['pending', 'in_progress', 'completed', 'on_hold'].includes(newStatus)) {
                                      handleUpdateTaskStatus(task._id, task.project_id, newStatus);
                                    }
                                  }}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div style={componentStyles.modal}>
          <div style={{ 
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '600px',
            zIndex: 1050
          }}>
            <div style={componentStyles.modalContent}>
              <div style={componentStyles.modalHeader}>
                <h5 style={{ margin: 0, fontWeight: designSystem.typography.fontWeight.semibold }}>
                  <i className="fas fa-plus me-3"></i>Add New Task
                </h5>
                <button 
                  type="button" 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowAddModal(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleAddTask}>
                <div style={componentStyles.modalBody}>
                  <div style={{ marginBottom: designSystem.spacing.md }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: designSystem.spacing.xs,
                      color: designSystem.colors.gray[600],
                      fontSize: designSystem.typography.fontSize.sm,
                      fontWeight: designSystem.typography.fontWeight.medium
                    }}>
                      Task Title <span style={{ color: designSystem.colors.danger.split(' ')[0].split('(')[1] }}>*</span>
                    </label>
                    <input
                      type="text"
                      style={componentStyles.formInput}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: designSystem.spacing.md }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: designSystem.spacing.xs,
                      color: designSystem.colors.gray[600],
                      fontSize: designSystem.typography.fontSize.sm,
                      fontWeight: designSystem.typography.fontWeight.medium
                    }}>
                      Description
                    </label>
                    <textarea
                      style={{
                        ...componentStyles.formInput,
                        minHeight: '80px',
                        resize: 'vertical'
                      }}
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div style={{ marginBottom: designSystem.spacing.md }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: designSystem.spacing.xs,
                      color: designSystem.colors.gray[600],
                      fontSize: designSystem.typography.fontSize.sm,
                      fontWeight: designSystem.typography.fontWeight.medium
                    }}>
                      Project <span style={{ color: designSystem.colors.danger.split(' ')[0].split('(')[1] }}>*</span>
                    </label>
                    <select
                      style={componentStyles.formInput}
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
                  <div style={{ marginBottom: designSystem.spacing.md }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: designSystem.spacing.xs,
                      color: designSystem.colors.gray[600],
                      fontSize: designSystem.typography.fontSize.sm,
                      fontWeight: designSystem.typography.fontWeight.medium
                    }}>
                      Assign To
                    </label>
                    <select
                      style={componentStyles.formInput}
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: designSystem.spacing.md }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: designSystem.spacing.xs,
                        color: designSystem.colors.gray[600],
                        fontSize: designSystem.typography.fontSize.sm,
                        fontWeight: designSystem.typography.fontWeight.medium
                      }}>
                        Priority
                      </label>
                      <select
                        style={componentStyles.formInput}
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: designSystem.spacing.xs,
                        color: designSystem.colors.gray[600],
                        fontSize: designSystem.typography.fontSize.sm,
                        fontWeight: designSystem.typography.fontWeight.medium
                      }}>
                        Due Date
                      </label>
                      <input
                        type="date"
                        style={componentStyles.formInput}
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div style={componentStyles.modalFooter}>
                  <button
                    type="button"
                    style={componentStyles.secondaryButton}
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    style={{
                      ...componentStyles.primaryButton,
                      background: designSystem.colors.primary,
                      marginLeft: designSystem.spacing.md
                    }}
                    disabled={loading}
                    {...hoverEffects.button}
                  >
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
        <div style={componentStyles.modal}>
          <div style={{ 
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '500px',
            zIndex: 1050
          }}>
            <div style={componentStyles.modalContent}>
              <div style={componentStyles.modalHeader}>
                <h5 style={{ margin: 0, fontWeight: designSystem.typography.fontWeight.semibold }}>
                  <i className="fas fa-user-plus me-3"></i>Assign Task: {selectedTask.title}
                </h5>
                <button 
                  type="button" 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedTask(null);
                  }}
                >
                  ×
                </button>
              </div>
              <div style={componentStyles.modalBody}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: designSystem.spacing.xs,
                    color: designSystem.colors.gray[600],
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium
                  }}>
                    Assign to CRM Manager
                  </label>
                  <select
                    style={componentStyles.formInput}
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
              <div style={componentStyles.modalFooter}>
                <button
                  type="button"
                  style={componentStyles.secondaryButton}
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedTask(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={{
                    ...componentStyles.primaryButton,
                    background: designSystem.colors.primary,
                    marginLeft: designSystem.spacing.md
                  }}
                  onClick={() => handleAssignTask(selectedTask._id, selectedTask.project_id, selectedTask.assigned_to)}
                  disabled={loading || !selectedTask.assigned_to}
                  {...hoverEffects.button}
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