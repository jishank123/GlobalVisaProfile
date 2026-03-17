import { useState, useEffect } from 'react';
import { projectsAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';
import { getApiEndpoint } from '../../../../utils/apiConfig';

const TasksManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    console.log('🔄 TasksManagement component mounted');
    loadTasks();
    loadProjects();
    loadEmployees();
  }, []);

  useEffect(() => {
    console.log('👥 Employees state updated:', employees.length, 'employees');
    console.log('👥 Employee data:', employees);
  }, [employees]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      // Get all tasks from assigned projects
      const response = await projectsAPI.getMyTasks();
      
      if (response.success) {
        setTasks(response.data || []);
      } else {
        throw new Error(response.error?.message || 'Failed to load tasks');
      }

    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectsAPI.getMyPMProjects();
      if (response.success) {
        setProjects(response.data || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const loadEmployees = async () => {
    try {
      console.log('🔄 Loading employees for task assignment...');
      console.log('🔄 Current user token:', localStorage.getItem('token') ? 'Token exists' : 'No token');
      
      const url = getApiEndpoint('/users?role=employee');
      console.log('🔄 Fetching from URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('📊 Response data:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('✅ Employees loaded:', data.data?.length || 0);
        if (data.data && data.data.length > 0) {
          console.log('✅ First employee:', data.data[0]);
        }
        setEmployees(data.data || []);
      } else {
        console.error('❌ Failed to load employees:', data.error);
        console.error('❌ Error code:', data.error?.code);
        console.error('❌ Error message:', data.error?.message);
        setEmployees([]);
      }
    } catch (error) {
      console.error('❌ Exception loading employees:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      setEmployees([]);
    }
  };

  // Filter tasks by status
  const getFilteredTasks = (status) => {
    if (status === 'all') return tasks;
    return tasks.filter(task => {
      switch (status) {
        case 'pending':
          return task.status === 'pending';
        case 'in_progress':
          return task.status === 'in_progress';
        case 'completed':
          return task.status === 'completed';
        case 'overdue':
          return task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
        default:
          return true;
      }
    });
  };

  // Get task counts for stats
  const getTaskCounts = () => {
    const overdueTasks = tasks.filter(task => 
      task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
    );
    
    return {
      total: tasks.length,
      pending: tasks.filter(task => task.status === 'pending').length,
      inProgress: tasks.filter(task => task.status === 'in_progress').length,
      completed: tasks.filter(task => task.status === 'completed').length,
      overdue: overdueTasks.length
    };
  };

  const getStatusBadgeStyle = (status) => {
    const statusStyles = {
      'pending': { background: '#f59e0b', color: 'white' },
      'in_progress': { background: '#3b82f6', color: 'white' },
      'completed': { background: '#10b981', color: 'white' },
      'cancelled': { background: '#6b7280', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
  };

  const getPriorityStyle = (priority) => {
    const priorityColors = {
      'low': '#10b981',
      'medium': '#f59e0b', 
      'high': '#ef4444'
    };
    return { color: priorityColors[priority] || '#6b7280' };
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalData(null);
    setModalType('');
  };

  const createNewTask = () => {
    setModalData(null);
    setModalType('create');
    setShowModal(true);
  };

  const editTask = (task) => {
    setModalData(task);
    setModalType('edit');
    setShowModal(true);
  };

  const viewTaskDetails = (task) => {
    setModalData(task);
    setModalType('view');
    setShowModal(true);
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await projectsAPI.createTask(taskData);
      if (response.success) {
        loadTasks(); // Refresh the list
        handleModalClose();
        alert('Task created successfully!');
      } else {
        throw new Error(response.error?.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task: ' + (error.message || 'Unknown error'));
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const response = await projectsAPI.updateTask(taskId, taskData);
      if (response.success) {
        loadTasks(); // Refresh the list
        handleModalClose();
        alert('Task updated successfully!');
      } else {
        throw new Error(response.error?.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task: ' + (error.message || 'Unknown error'));
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await projectsAPI.updateTaskStatus(taskId, newStatus);
      if (response.success) {
        loadTasks(); // Refresh the list
        alert(`Task status updated to ${newStatus.replace('_', ' ')} successfully!`);
      } else {
        throw new Error(response.error?.message || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status: ' + (error.message || 'Unknown error'));
    }
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

  const renderTaskTable = (taskType) => {
    const filteredTasks = getFilteredTasks(taskType);
    
    // Sort tasks by creation date (newest first)
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA; // Descending order (newest first)
    });
    
    if (sortedTasks.length === 0) {
      return (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-tasks fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
          <p style={{ color: designSystem.colors.gray[500] }}>
            No {taskType === 'all' ? '' : taskType} tasks found
          </p>
        </div>
      );
    }

    return (
      <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={componentStyles.tableHeader}>
            <tr>
              <th style={componentStyles.tableHeaderCell}>Task</th>
              <th style={componentStyles.tableHeaderCell}>Project</th>
              <th style={componentStyles.tableHeaderCell}>Status</th>
              <th style={componentStyles.tableHeaderCell}>Priority</th>
              <th style={componentStyles.tableHeaderCell}>Due Date</th>
              <th style={componentStyles.tableHeaderCell}>Progress</th>
              <th style={componentStyles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map(task => {
              const statusStyle = getStatusBadgeStyle(task.status);
              const priorityStyle = getPriorityStyle(task.priority || 'medium');
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
              
              return (
                <tr 
                  key={task._id}
                  style={{
                    ...componentStyles.tableRow,
                    backgroundColor: isOverdue ? '#fef2f2' : 'transparent'
                  }}
                  {...hoverEffects.tableRow}
                >
                  <td style={componentStyles.tableCell}>
                    <div>
                      <div style={{ 
                        fontWeight: designSystem.typography.fontWeight.medium,
                        marginBottom: '2px'
                      }}>
                        {task.title || task.name || 'Untitled Task'}
                      </div>
                      <small style={{ color: designSystem.colors.gray[500] }}>
                        {task.description ? task.description.substring(0, 50) + '...' : 'No description'}
                      </small>
                    </div>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <div>
                      <div style={{ 
                        fontWeight: designSystem.typography.fontWeight.medium,
                        marginBottom: '2px'
                      }}>
                        {task.project?.project_id || `#${task.project?._id?.slice(-8).toUpperCase()}` || 'Unknown Project'}
                      </div>
                      <small style={{ color: designSystem.colors.gray[500] }}>
                        {task.project?.service_name || 'Unknown Service'}
                      </small>
                    </div>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <span style={{
                      ...componentStyles.badge,
                      background: statusStyle.background,
                      color: statusStyle.color,
                      textTransform: 'uppercase',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <span style={{
                      ...priorityStyle,
                      fontWeight: designSystem.typography.fontWeight.bold,
                      textTransform: 'uppercase',
                      fontSize: '12px'
                    }}>
                      {(task.priority || 'medium')}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    {task.due_date ? (
                      <div>
                        <div style={{ 
                          fontSize: '13px', 
                          fontWeight: '500',
                          color: isOverdue ? '#ef4444' : 'inherit'
                        }}>
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                        <small style={{ 
                          color: isOverdue ? '#ef4444' : designSystem.colors.gray[500],
                          fontWeight: isOverdue ? '600' : 'normal'
                        }}>
                          {isOverdue ? 'Overdue' : 'Upcoming'}
                        </small>
                      </div>
                    ) : (
                      <span style={{ color: designSystem.colors.gray[500], fontStyle: 'italic' }}>
                        No due date
                      </span>
                    )}
                  </td>
                  <td style={componentStyles.tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                      <div style={{ 
                        width: '60px', 
                        height: '8px',
                        background: designSystem.colors.gray[200],
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div 
                          style={{
                            width: `${task.progress || 0}%`,
                            height: '100%',
                            background: task.status === 'completed' ? '#10b981' : '#3b82f6',
                            transition: 'width 0.3s ease'
                          }}
                        ></div>
                      </div>
                      <small style={{ 
                        fontSize: designSystem.typography.fontSize.xs,
                        fontWeight: '600'
                      }}>
                        {task.progress || 0}%
                      </small>
                    </div>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => viewTaskDetails(task)}
                        title="View Task Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="btn btn-outline-success btn-sm"
                        onClick={() => editTask(task)}
                        title="Edit Task"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      {task.status !== 'completed' && (
                        <button 
                          className="btn btn-outline-info btn-sm"
                          onClick={() => handleUpdateTaskStatus(task._id, 'completed')}
                          title="Mark as Completed"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      )}
                      {task.status !== 'in_progress' && task.status !== 'completed' && (
                        <button 
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => handleUpdateTaskStatus(task._id, 'in_progress')}
                          title="Mark as In Progress"
                        >
                          <i className="fas fa-play"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={componentStyles.managementCard}>
      {/* Header with Create and Refresh Buttons */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-tasks fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Project Tasks</h4>
            <p style={componentStyles.headerSubtitle}>Create and manage tasks within your assigned projects</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: '#10b981'
            }}
            onClick={createNewTask}
            {...hoverEffects.button}
          >
            <i className="fas fa-plus me-2"></i>Create Task
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.success
            }}
            onClick={loadTasks}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>
      </div>

      {/* Overview Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-tasks"
          number={getTaskCounts().total}
          label="Total Tasks"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
        <StatCard
          icon="fas fa-clock"
          number={getTaskCounts().pending}
          label="Pending Tasks"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-play-circle"
          number={getTaskCounts().inProgress}
          label="In Progress"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={getTaskCounts().completed}
          label="Completed"
          borderColor="#10b981"
          iconColor="#10b981"
        />
        <StatCard
          icon="fas fa-exclamation-triangle"
          number={getTaskCounts().overdue}
          label="Overdue"
          borderColor="#ef4444"
          iconColor="#ef4444"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div style={componentStyles.loading}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
          <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading tasks...</p>
        </div>
      )}

      {/* Task Type Tabs */}
      {!loading && (
        <>
          <div style={{ marginBottom: designSystem.spacing.lg }}>
            <div style={{ display: 'flex', gap: designSystem.spacing.xs, flexWrap: 'wrap' }}>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: activeTab === 'all' ? designSystem.colors.primary : designSystem.colors.gray[100],
                  color: activeTab === 'all' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'all' ? designSystem.shadows.button : 'none'
                }}
                onClick={() => setActiveTab('all')}
                {...hoverEffects.button}
              >
                All Tasks ({getTaskCounts().total})
              </button>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: activeTab === 'pending' ? '#f59e0b' : designSystem.colors.gray[100],
                  color: activeTab === 'pending' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'pending' ? designSystem.shadows.button : 'none'
                }}
                onClick={() => setActiveTab('pending')}
                {...hoverEffects.button}
              >
                Pending ({getTaskCounts().pending})
              </button>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: activeTab === 'in_progress' ? '#3b82f6' : designSystem.colors.gray[100],
                  color: activeTab === 'in_progress' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'in_progress' ? designSystem.shadows.button : 'none'
                }}
                onClick={() => setActiveTab('in_progress')}
                {...hoverEffects.button}
              >
                In Progress ({getTaskCounts().inProgress})
              </button>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: activeTab === 'completed' ? '#10b981' : designSystem.colors.gray[100],
                  color: activeTab === 'completed' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'completed' ? designSystem.shadows.button : 'none'
                }}
                onClick={() => setActiveTab('completed')}
                {...hoverEffects.button}
              >
                Completed ({getTaskCounts().completed})
              </button>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: activeTab === 'overdue' ? '#ef4444' : designSystem.colors.gray[100],
                  color: activeTab === 'overdue' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'overdue' ? designSystem.shadows.button : 'none'
                }}
                onClick={() => setActiveTab('overdue')}
                {...hoverEffects.button}
              >
                Overdue ({getTaskCounts().overdue})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {renderTaskTable(activeTab)}
          </div>
        </>
      )}

      {/* No Tasks Message */}
      {!loading && tasks.length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-tasks fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>No tasks found</h6>
          <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.lg }}>Create your first task to get started</p>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: '#10b981'
            }}
            onClick={createNewTask}
            {...hoverEffects.button}
          >
            <i className="fas fa-plus me-2"></i>Create First Task
          </button>
        </div>
      )}

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          show={showModal}
          onHide={handleModalClose}
          type={modalType}
          data={modalData}
          projects={projects}
          employees={employees}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          loadTasks={loadTasks}
        />
      )}
    </div>
  );
};

// Task Modal Component
const TaskModal = ({ show, onHide, type, data, projects, employees, onCreateTask, onUpdateTask, loadTasks }) => {
  const [formData, setFormData] = useState({
    title: data?.title || '',
    description: data?.description || '',
    project_id: data?.project_id || data?.project?._id || '',
    assigned_to: data?.assigned_to?._id || data?.assigned_to || '',
    status: data?.status || 'pending',
    priority: data?.priority || 'medium',
    start_date: data?.start_date ? new Date(data.start_date).toISOString().split('T')[0] : '',
    due_date: data?.due_date ? new Date(data.due_date).toISOString().split('T')[0] : '',
    progress: data?.progress || 0
  });
  
  const [fileData, setFileData] = useState({
    files: [{ file: null, description: '' }]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!show) return null;

  const handleFileChange = (index, e) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = [...fileData.files];
      newFiles[index].file = e.target.files[0];
      setFileData({
        ...fileData,
        files: newFiles
      });
    }
  };

  const handleFileDescriptionChange = (index, value) => {
    const newFiles = [...fileData.files];
    newFiles[index].description = value;
    setFileData({
      ...fileData,
      files: newFiles
    });
  };

  const addMoreFile = () => {
    setFileData({
      ...fileData,
      files: [...fileData.files, { file: null, description: '' }]
    });
  };

  const removeFile = (index) => {
    const newFiles = fileData.files.filter((_, i) => i !== index);
    setFileData({
      ...fileData,
      files: newFiles.length > 0 ? newFiles : [{ file: null, description: '' }]
    });
  };

  const uploadTaskFiles = async (taskId) => {
    const hasFiles = fileData.files.some(item => item.file !== null);
    if (!hasFiles) {
      return { success: true, message: 'No files to upload' };
    }

    try {
      let successCount = 0;
      let errorCount = 0;
      
      // Upload each file separately with its own description
      for (const fileItem of fileData.files) {
        if (!fileItem.file) continue; // Skip empty file slots
        
        try {
          const formDataToSend = new FormData();
          formDataToSend.append('files', fileItem.file);
          formDataToSend.append('description', fileItem.description || '');

          const { getApiEndpoint } = await import('../../../../utils/apiConfig');
          const endpoint = getApiEndpoint(`/tasks/${taskId}/upload`);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formDataToSend
          });

          const result = await response.json();
          
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to upload ${fileItem.file.name}:`, result.error);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error uploading ${fileItem.file.name}:`, error);
        }
      }
      
      // Return result summary
      if (successCount > 0 && errorCount === 0) {
        return { success: true, message: `${successCount} file(s) uploaded successfully` };
      } else if (successCount > 0 && errorCount > 0) {
        return { success: true, message: `${successCount} file(s) uploaded, ${errorCount} failed` };
      } else {
        return { success: false, error: 'All file uploads failed' };
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      return { success: false, error: error.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    if (!formData.title.trim()) {
      alert('Please enter a task title.');
      return;
    }
    
    if (!formData.project_id) {
      alert('Please select a project.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (type === 'create') {
        // Create task first
        const response = await projectsAPI.createTask(formData);
        
        if (response.success && response.data?._id) {
          // Upload files if any
          const uploadResult = await uploadTaskFiles(response.data._id);
          
          // Refresh the task list
          loadTasks();
          onHide();
          
          if (uploadResult.success) {
            alert('Task created successfully' + (uploadResult.message !== 'No files to upload' ? ' with files!' : '!'));
          } else {
            alert('Task created but file upload failed: ' + uploadResult.error);
          }
        }
      } else if (type === 'edit') {
        await onUpdateTask(data._id, formData);
        
        // Upload files if any for edit mode
        const uploadResult = await uploadTaskFiles(data._id);
        if (uploadResult.success && uploadResult.message !== 'No files to upload') {
          alert('Task updated and files uploaded successfully!');
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Auto-update progress when status changes
      if (field === 'status') {
        if (value === 'completed') {
          newData.progress = 100;
        } else if (value === 'in_progress' && prev.progress === 0) {
          newData.progress = 25;
        }
      }
      
      return newData;
    });
  };

  return (
    <div 
      className="modal fade show" 
      style={{ 
        display: 'block', 
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1050
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onHide();
        }
      }}
    >
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-tasks me-2"></i>
              {type === 'create' ? 'Create New Task' : type === 'edit' ? 'Edit Task' : 'Task Details'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {type === 'view' ? (
              <div>
                <div className="row">
                  <div className="col-md-6">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Task Information
                    </h6>
                    <p><strong>Title:</strong> {data.title || 'N/A'}</p>
                    <p><strong>Description:</strong> {data.description || 'No description'}</p>
                    <p><strong>Project:</strong> {data.project?.project_id || 'Unknown Project'}</p>
                    <p><strong>Status:</strong> {data.status || 'N/A'}</p>
                    {data.assigned_to && (
                      <p><strong>Assigned To:</strong> {data.assigned_to.first_name} {data.assigned_to.last_name}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Progress & Timeline
                    </h6>
                    <p><strong>Priority:</strong> {data.priority || 'Medium'}</p>
                    <p><strong>Progress:</strong> {data.progress || 0}%</p>
                    {data.start_date && (
                      <p><strong>Start Date:</strong> {new Date(data.start_date).toLocaleDateString()}</p>
                    )}
                    {data.due_date && (
                      <p><strong>Due Date:</strong> {new Date(data.due_date).toLocaleDateString()}</p>
                    )}
                    <p><strong>Created:</strong> {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                {/* Files Section */}
                {data.files && data.files.length > 0 && (
                  <div className="mt-4">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      <i className="fas fa-paperclip me-2"></i>Uploaded Files ({data.files.length})
                    </h6>
                    <div className="row">
                      {/* Project Manager Files (Left Column - Green) */}
                      <div className="col-md-6">
                        <h6 style={{ fontSize: '14px', color: '#2e7d32', marginBottom: designSystem.spacing.sm }}>
                          <i className="fas fa-user-tie me-2"></i>
                          My Uploaded Files
                        </h6>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {data.files
                            .filter(file => file.uploaded_by_role === 'project_manager')
                            .map((file, index) => (
                              <div 
                                key={index}
                                style={{
                                  padding: designSystem.spacing.sm,
                                  marginBottom: designSystem.spacing.xs,
                                  background: '#e8f5e9',
                                  borderRadius: designSystem.borderRadius.button,
                                  border: '1px solid #a5d6a7',
                                  borderLeft: '4px solid #388e3c'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                      <i className={`fas ${
                                        file.mimetype?.includes('image') ? 'fa-image' :
                                        file.mimetype?.includes('pdf') ? 'fa-file-pdf' :
                                        file.mimetype?.includes('word') ? 'fa-file-word' :
                                        file.mimetype?.includes('excel') ? 'fa-file-excel' :
                                        'fa-file'
                                      }`} style={{ color: '#388e3c', fontSize: '12px' }}></i>
                                      <strong style={{ color: '#2e7d32', fontSize: '13px' }}>{file.originalName || file.filename}</strong>
                                    </div>
                                    {file.description && (
                                      <div style={{ fontSize: '12px', color: designSystem.colors.gray[600], marginTop: '2px' }}>
                                        {file.description}
                                      </div>
                                    )}
                                    <div style={{ fontSize: '11px', color: designSystem.colors.gray[500], marginTop: '2px' }}>
                                      {new Date(file.uploaded_at).toLocaleDateString()}
                                      {file.size && ` • ${(file.size / 1024).toFixed(2)} KB`}
                                    </div>
                                  </div>
                                  <button 
                                    onClick={async () => {
                                      try {
                                        const fileUrl = `${process.env.REACT_APP_API_URL?.replace('/api', '')}/${file.path}`;
                                        const fileName = file.originalName || file.filename || 'download';
                                        
                                        const response = await fetch(fileUrl);
                                        const blob = await response.blob();
                                        
                                        const blobUrl = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = blobUrl;
                                        link.download = fileName;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        
                                        window.URL.revokeObjectURL(blobUrl);
                                      } catch (error) {
                                        console.error('Download error:', error);
                                        alert('Failed to download file');
                                      }
                                    }}
                                    className="btn btn-outline-success btn-sm"
                                    style={{ padding: '2px 6px', fontSize: '11px' }}
                                    title="Download File"
                                  >
                                    <i className="fas fa-download"></i>
                                  </button>
                                </div>
                              </div>
                            ))}
                          {data.files.filter(file => file.uploaded_by_role === 'project_manager').length === 0 && (
                            <small className="text-muted">No files uploaded yet</small>
                          )}
                        </div>
                      </div>

                      {/* Employee Files (Right Column - Blue) */}
                      <div className="col-md-6">
                        <h6 style={{ fontSize: '14px', color: '#1565c0', marginBottom: designSystem.spacing.sm }}>
                          <i className="fas fa-user me-2"></i>
                          Employee Files
                        </h6>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {data.files
                            .filter(file => file.uploaded_by_role === 'employee')
                            .map((file, index) => (
                              <div 
                                key={index}
                                style={{
                                  padding: designSystem.spacing.sm,
                                  marginBottom: designSystem.spacing.xs,
                                  background: '#e3f2fd',
                                  borderRadius: designSystem.borderRadius.button,
                                  border: '1px solid #90caf9',
                                  borderLeft: '4px solid #1976d2'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                      <i className={`fas ${
                                        file.mimetype?.includes('image') ? 'fa-image' :
                                        file.mimetype?.includes('pdf') ? 'fa-file-pdf' :
                                        file.mimetype?.includes('word') ? 'fa-file-word' :
                                        file.mimetype?.includes('excel') ? 'fa-file-excel' :
                                        'fa-file'
                                      }`} style={{ color: '#1976d2', fontSize: '12px' }}></i>
                                      <strong style={{ color: '#1565c0', fontSize: '13px' }}>{file.originalName || file.filename}</strong>
                                    </div>
                                    {file.description && (
                                      <div style={{ fontSize: '12px', color: designSystem.colors.gray[600], marginTop: '2px' }}>
                                        {file.description}
                                      </div>
                                    )}
                                    <div style={{ fontSize: '11px', color: designSystem.colors.gray[500], marginTop: '2px' }}>
                                      {file.uploaded_by?.first_name} {file.uploaded_by?.last_name} • {new Date(file.uploaded_at).toLocaleDateString()}
                                      {file.size && ` • ${(file.size / 1024).toFixed(2)} KB`}
                                    </div>
                                  </div>
                                  <button 
                                    onClick={async () => {
                                      try {
                                        const fileUrl = `${process.env.REACT_APP_API_URL?.replace('/api', '')}/${file.path}`;
                                        const fileName = file.originalName || file.filename || 'download';
                                        
                                        const response = await fetch(fileUrl);
                                        const blob = await response.blob();
                                        
                                        const blobUrl = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = blobUrl;
                                        link.download = fileName;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        
                                        window.URL.revokeObjectURL(blobUrl);
                                      } catch (error) {
                                        console.error('Download error:', error);
                                        alert('Failed to download file');
                                      }
                                    }}
                                    className="btn btn-outline-primary btn-sm"
                                    style={{ padding: '2px 6px', fontSize: '11px' }}
                                    title="Download File"
                                  >
                                    <i className="fas fa-download"></i>
                                  </button>
                                </div>
                              </div>
                            ))}
                          {data.files.filter(file => file.uploaded_by_role === 'employee').length === 0 && (
                            <small className="text-muted">No files uploaded yet</small>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Files Message */}
                {(!data.files || data.files.length === 0) && (
                  <div className="mt-4">
                    <div style={{
                      padding: designSystem.spacing.lg,
                      background: designSystem.colors.gray[100],
                      borderRadius: designSystem.borderRadius.button,
                      textAlign: 'center',
                      color: designSystem.colors.gray[500]
                    }}>
                      <i className="fas fa-paperclip fa-2x mb-2" style={{ color: designSystem.colors.gray[400] }}></i>
                      <p className="mb-0">No files uploaded yet</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Row 1: Title and Priority */}
                <div className="row">
                  <div className="col-md-8">
                    <div className="mb-3">
                      <label className="form-label"><strong>Task Title *</strong></label>
                      <input 
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter task title"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label"><strong>Priority *</strong></label>
                      <select 
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        required
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Row 2: Project and Employee */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label"><strong>Project *</strong></label>
                      <select 
                        className="form-select"
                        value={formData.project_id}
                        onChange={(e) => handleInputChange('project_id', e.target.value)}
                        required
                      >
                        <option value="">Select a project</option>
                        {projects.map(project => (
                          <option key={project._id} value={project._id}>
                            {project.project_id || `#${project._id.slice(-8).toUpperCase()}`} - {project.service_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label"><strong>Assign to Employee *</strong></label>
                      <select 
                        className="form-select"
                        value={formData.assigned_to}
                        onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                        required
                        style={{
                          borderColor: !formData.assigned_to ? '#ef4444' : undefined
                        }}
                      >
                        <option value="">Select an employee</option>
                        {employees && employees.length > 0 ? (
                          employees.map(employee => (
                            <option key={employee._id} value={employee._id}>
                              {employee.first_name && employee.last_name ? 
                                `${employee.first_name} ${employee.last_name}` : 
                                employee.email} - {employee.email}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No employees available</option>
                        )}
                      </select>
                      {!formData.assigned_to && (
                        <small className="text-danger d-block mt-1">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          Please select an employee. Tasks must be assigned to team members.
                        </small>
                      )}
                      {employees && employees.length === 0 && (
                        <small className="text-danger d-block mt-1">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          No employees found. Please contact admin to create employee accounts.
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 3: Start Date and Due Date */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label"><strong>Start Date</strong></label>
                      <input 
                        type="date"
                        className="form-control"
                        value={formData.start_date}
                        onChange={(e) => handleInputChange('start_date', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label"><strong>Due Date</strong></label>
                      <input 
                        type="date"
                        className="form-control"
                        value={formData.due_date}
                        onChange={(e) => handleInputChange('due_date', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 4: Status and Progress */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label"><strong>Status *</strong></label>
                      <select 
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label"><strong>Progress: {formData.progress}%</strong></label>
                      <input 
                        type="range"
                        className="form-range"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={(e) => handleInputChange('progress', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Row 5: Description (full width) */}
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label"><strong>Description</strong></label>
                      <textarea 
                        className="form-control"
                        rows="4"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter task description..."
                      />
                    </div>
                  </div>
                </div>

                {/* Row 6: File Upload Section (Optional) */}
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        <strong>
                          <i className="fas fa-paperclip me-2"></i>
                          Attach Files (Optional)
                        </strong>
                      </label>
                      <small className="text-muted d-block mb-2">
                        You can attach relevant files to this task. This is optional.
                      </small>
                      
                      {fileData.files.map((fileItem, index) => (
                        <div key={index} style={{
                          border: `1px solid ${designSystem.colors.gray[300]}`,
                          borderRadius: designSystem.borderRadius.button,
                          padding: designSystem.spacing.sm,
                          marginBottom: designSystem.spacing.sm,
                          background: 'white'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: designSystem.spacing.xs }}>
                            <h6 style={{ margin: 0, color: designSystem.colors.dark, fontSize: '13px' }}>
                              <i className="fas fa-file me-2"></i>
                              File {index + 1}
                            </h6>
                            {fileData.files.length > 1 && (
                              <button 
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeFile(index)}
                                style={{ padding: '2px 8px', fontSize: '11px' }}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            )}
                          </div>
                          
                          <div className="mb-2">
                            <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>
                              Select File
                            </label>
                            <input 
                              type="file"
                              className="form-control form-control-sm"
                              onChange={(e) => handleFileChange(index, e)}
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                            />
                            {index === 0 && (
                              <small className="text-muted" style={{ fontSize: '11px' }}>
                                <i className="fas fa-info-circle me-1"></i>
                                PDF, Word, Excel, Images (Max 5MB per file)
                              </small>
                            )}
                            {fileItem.file && (
                              <small className="text-success d-block mt-1" style={{ fontSize: '11px' }}>
                                <i className="fas fa-check-circle me-1"></i>
                                {fileItem.file.name} ({(fileItem.file.size / 1024).toFixed(2)} KB)
                              </small>
                            )}
                          </div>
                          
                          <div className="mb-0">
                            <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>
                              Description/Notes
                            </label>
                            <textarea 
                              className="form-control form-control-sm"
                              rows="2"
                              value={fileItem.description}
                              onChange={(e) => handleFileDescriptionChange(index, e.target.value)}
                              placeholder="Add notes about this file..."
                              style={{ fontSize: '12px' }}
                            />
                          </div>
                        </div>
                      ))}
                      
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={addMoreFile}
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                      >
                        <i className="fas fa-plus me-1"></i>
                        Add More Files
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
           
           
            {type !== 'view' && (
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    {type === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  type === 'create' ? 'Create Task' : 'Update Task'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksManagement;