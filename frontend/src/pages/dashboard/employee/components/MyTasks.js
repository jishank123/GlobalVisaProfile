import { useState, useEffect } from 'react';
import { projectsAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';
import { getApiEndpoint, getStaticFileUrl } from '../../../../utils/apiConfig';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadMyTasks();
  }, []);

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading employee tasks...');
      
      // Get tasks assigned to current employee
      const response = await projectsAPI.getMyTasks();
      console.log('📊 Tasks response:', response);
      
      if (response.success) {
        setTasks(response.data || []);
        console.log('✅ Tasks loaded:', response.data?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

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
        default:
          return true;
      }
    });
  };

  const getTaskCounts = () => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length
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

  const viewTaskDetails = (task) => {
    setSelectedTask(task);
    setModalType('view');
    setShowModal(true);
  };

  const updateTaskProgress = (task) => {
    setSelectedTask(task);
    setModalType('update');
    setShowModal(true);
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
    
    if (filteredTasks.length === 0) {
      return (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-tasks fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
          <p style={{ color: designSystem.colors.gray[500] }}>
            No {taskType === 'all' ? '' : taskType} tasks assigned to you
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
              <th style={componentStyles.tableHeaderCell}>Progress</th>
              <th style={componentStyles.tableHeaderCell}>Due Date</th>
              <th style={componentStyles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => {
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
                        {task.title || 'Untitled Task'}
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
                        {task.project?.project_id || 'Unknown'}
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
                      {task.priority || 'medium'}
                    </span>
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
                    {task.due_date ? (
                      <div>
                        <div style={{ 
                          fontSize: '13px', 
                          fontWeight: '500',
                          color: isOverdue ? '#ef4444' : 'inherit'
                        }}>
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                        {isOverdue && (
                          <small style={{ color: '#ef4444', fontWeight: '600' }}>
                            Overdue
                          </small>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: designSystem.colors.gray[500], fontStyle: 'italic' }}>
                        No due date
                      </span>
                    )}
                  </td>
                  <td style={componentStyles.tableCell}>
                    <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => viewTaskDetails(task)}
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="btn btn-outline-success btn-sm"
                        onClick={() => updateTaskProgress(task)}
                        title="Update Progress"
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
    );
  };

  return (
    <div style={componentStyles.managementCard}>
      {/* Header */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-tasks fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>My Tasks</h4>
            <p style={componentStyles.headerSubtitle}>View and update your assigned tasks</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={loadMyTasks}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Overview Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-tasks"
          number={getTaskCounts().total}
          label="Total Tasks"
          borderColor="#10b981"
          iconColor="#10b981"
        />
        <StatCard
          icon="fas fa-clock"
          number={getTaskCounts().pending}
          label="Pending"
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
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>No tasks assigned yet</h6>
          <p style={{ color: designSystem.colors.gray[500] }}>Tasks assigned to you will appear here</p>
        </div>
      )}

      {/* Task Modal */}
      {showModal && selectedTask && (
        <TaskModal
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setSelectedTask(null);
            setModalType('');
          }}
          type={modalType}
          task={selectedTask}
          onUpdate={loadMyTasks}
        />
      )}
    </div>
  );
};

// Task Modal Component
const TaskModal = ({ show, onHide, type, task, onUpdate }) => {
  const [progress, setProgress] = useState(task.progress || 0);
  const [status, setStatus] = useState(task.status || 'pending');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileDescription, setFileDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (!show) return null;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpdateProgress = async () => {
    try {
      setUpdating(true);
      
      // Auto-set status based on progress
      let newStatus = status;
      if (progress === 100) {
        newStatus = 'completed';
      } else if (progress > 0 && progress < 100 && status === 'pending') {
        newStatus = 'in_progress';
      }
      
      const response = await projectsAPI.updateTask(task._id, {
        progress: progress,
        status: newStatus
      });
      
      if (response.success) {
        alert('Task progress updated successfully!');
        onUpdate();
        onHide();
      } else {
        throw new Error(response.error?.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('description', fileDescription);
      formData.append('taskId', task._id);
      
      const response = await fetch(getApiEndpoint(`/tasks/${task._id}/upload`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Files uploaded successfully!');
        setSelectedFiles([]);
        setFileDescription('');
        onUpdate();
      } else {
        throw new Error(data.error?.message || 'Failed to upload files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-tasks me-2"></i>
              {type === 'view' ? 'Task Details' : 'Update Task Progress'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {/* Task Information */}
            <div className="mb-4">
              <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                Task Information
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Title:</strong> {task.title}</p>
                  <p><strong>Description:</strong> {task.description || 'No description'}</p>
                  <p><strong>Project:</strong> {task.project?.project_id}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Priority:</strong> <span style={{ color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981', fontWeight: 'bold' }}>{task.priority}</span></p>
                  <p><strong>Due Date:</strong> {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}</p>
                  <p><strong>Current Status:</strong> {task.status.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Update Progress Section */}
            {type === 'update' && (
              <div className="mb-4">
                <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                  Update Progress
                </h6>
                <div className="mb-3">
                  <label className="form-label"><strong>Progress: {progress}%</strong></label>
                  <input 
                    type="range"
                    className="form-range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => {
                      const newProgress = parseInt(e.target.value);
                      setProgress(newProgress);
                      // Auto-update status
                      if (newProgress === 100) {
                        setStatus('completed');
                      } else if (newProgress > 0 && status === 'pending') {
                        setStatus('in_progress');
                      }
                    }}
                  />
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">0%</small>
                    <small className="text-muted">50%</small>
                    <small className="text-muted">100%</small>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label"><strong>Status</strong></label>
                  <select 
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <button 
                  className="btn btn-primary w-100"
                  onClick={handleUpdateProgress}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Update Progress
                    </>
                  )}
                </button>
              </div>
            )}

            {/* File Upload Section */}
            {type === 'update' && (
              <div className="mb-4">
                <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                  <i className="fas fa-paperclip me-2"></i>Upload Files
                </h6>
                <div className="mb-3">
                  <label className="form-label"><strong>Select Files</strong></label>
                  <input 
                    type="file"
                    className="form-control"
                    multiple
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                  />
                  <small className="text-muted">Accepted: PDF, Word, Excel, Images (Max 5MB per file)</small>
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="mb-3">
                    <strong>Selected Files:</strong>
                    <ul className="list-unstyled mt-2">
                      {selectedFiles.map((file, index) => (
                        <li key={index} style={{ padding: '4px 0' }}>
                          <i className="fas fa-file me-2"></i>
                          {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mb-3">
                  <label className="form-label"><strong>File Description (Optional)</strong></label>
                  <textarea 
                    className="form-control"
                    rows="2"
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                    placeholder="Add a description for these files..."
                  />
                </div>

                <button 
                  className="btn btn-success w-100"
                  onClick={handleFileUpload}
                  disabled={uploading || selectedFiles.length === 0}
                >
                  {uploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload me-2"></i>
                      Upload Files ({selectedFiles.length})
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Existing Files */}
            {task.files && task.files.length > 0 && (
              <div>
                <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                  <i className="fas fa-paperclip me-2"></i>Uploaded Files ({task.files.length})
                </h6>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {task.files.map((file, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: designSystem.spacing.sm,
                        marginBottom: designSystem.spacing.xs,
                        background: designSystem.colors.gray[100],
                        borderRadius: designSystem.borderRadius.button,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong>{file.originalName || file.filename}</strong>
                        <div style={{ fontSize: '12px', color: designSystem.colors.gray[500] }}>
                          Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
                        </div>
                      </div>
                      <a 
                        href={getStaticFileUrl(`/${file.path}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="fas fa-download"></i>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
         
        </div>
      </div>
    </div>
  );
};

export default MyTasks;
