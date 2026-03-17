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
    if (status === 'overdue') {
      const now = new Date();
      return tasks.filter(task => {
        if (task.status === 'completed') return false;
        if (!task.due_date) return false;
        return new Date(task.due_date) < now;
      });
    }
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
    const now = new Date();
    const overdue = tasks.filter(t => {
      if (t.status === 'completed') return false;
      if (!t.due_date) return false;
      return new Date(t.due_date) < now;
    }).length;

    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: overdue
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
                <i className="fas fa-exclamation-triangle me-2"></i>
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
  const [fileData, setFileData] = useState({
    files: [{ file: null, description: '' }]
  });
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Auto-set progress to 100% when status is completed
  useEffect(() => {
    if (status === 'completed' && progress !== 100) {
      setProgress(100);
    }
  }, [status]);

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
    const hasFiles = fileData.files.some(item => item.file !== null);
    if (!hasFiles) {
      alert('Please select at least one file to upload');
      return;
    }

    try {
      setUploading(true);
      let successCount = 0;
      let errorCount = 0;
      
      // Upload each file separately with its own description
      for (const fileItem of fileData.files) {
        if (!fileItem.file) continue; // Skip empty file slots
        
        try {
          const formData = new FormData();
          formData.append('files', fileItem.file);
          formData.append('description', fileItem.description || '');
          
          const response = await fetch(getApiEndpoint(`/tasks/${task._id}/upload`), {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          });
          
          const data = await response.json();
          
          if (data.success) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to upload ${fileItem.file.name}:`, data.error);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error uploading ${fileItem.file.name}:`, error);
        }
      }
      
      // Show result message and update progress if files uploaded successfully
      if (successCount > 0 && errorCount === 0) {
        alert(`Successfully uploaded ${successCount} file(s)!`);
        setFileData({ files: [{ file: null, description: '' }] });
        
        // Automatically update task progress after successful file upload
        await handleUpdateProgress();
      } else if (successCount > 0 && errorCount > 0) {
        alert(`Uploaded ${successCount} file(s) successfully, but ${errorCount} file(s) failed.`);
        setFileData({ files: [{ file: null, description: '' }] });
        
        // Still update progress even if some files failed
        await handleUpdateProgress();
      } else {
        alert('Failed to upload files. Please try again.');
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
              <h6 style={{ color: '#3b82f6', marginBottom: designSystem.spacing.md, fontWeight: '600' }}>
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
                <h6 style={{ color: '#3b82f6', marginBottom: designSystem.spacing.md, fontWeight: '600' }}>
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
                <h6 style={{ color: '#3b82f6', marginBottom: designSystem.spacing.md, fontWeight: '600' }}>
                  <i className="fas fa-paperclip me-2"></i>Upload Files
                </h6>
                
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #93c5fd',
                  borderRadius: designSystem.borderRadius.button,
                  padding: designSystem.spacing.sm,
                  marginBottom: designSystem.spacing.md,
                  fontSize: '13px',
                  color: '#1e40af'
                }}>
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Note:</strong> Uploading files will automatically save your progress update as well.
                </div>
                
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
                
                <div className="mb-3">
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

                <button 
                  className="btn btn-success w-100"
                  onClick={handleFileUpload}
                  disabled={uploading || !fileData.files.some(f => f.file !== null)}
                >
                  {uploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Uploading & Updating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload me-2"></i>
                      Upload {fileData.files.filter(f => f.file !== null).length} File(s) & Update Progress
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Existing Files - Only show in view mode */}
            {type === 'view' && task.files && task.files.length > 0 && (
              <div>
                <h6 style={{ color: '#3b82f6', marginBottom: designSystem.spacing.md, fontWeight: '600' }}>
                  <i className="fas fa-paperclip me-2"></i>Uploaded Files ({task.files.length})
                </h6>
                <div className="row">
                  {/* Employee Files (Left Column - Blue) */}
                  <div className="col-md-6">
                    <h6 style={{ fontSize: '14px', color: '#1565c0', marginBottom: designSystem.spacing.sm }}>
                      <i className="fas fa-user me-2"></i>
                      My Uploaded Files
                    </h6>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {task.files
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
                                <strong style={{ color: '#1565c0', fontSize: '13px' }}>{file.originalName || file.filename}</strong>
                                {file.description && (
                                  <div style={{ fontSize: '12px', color: designSystem.colors.gray[600], marginTop: '2px' }}>
                                    {file.description}
                                  </div>
                                )}
                                <div style={{ fontSize: '11px', color: designSystem.colors.gray[500], marginTop: '2px' }}>
                                  Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
                                </div>
                              </div>
                              <button
                                className="btn btn-outline-primary btn-sm"
                                style={{ padding: '2px 6px', fontSize: '11px' }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  const fileUrl = getStaticFileUrl(`/${file.path}`);
                                  fetch(fileUrl)
                                    .then(response => response.blob())
                                    .then(blob => {
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.style.display = 'none';
                                      a.href = url;
                                      a.download = file.originalName || file.filename;
                                      document.body.appendChild(a);
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                      document.body.removeChild(a);
                                    })
                                    .catch(err => {
                                      console.error('Download error:', err);
                                      alert('Failed to download file. Opening in new tab instead.');
                                      window.open(fileUrl, '_blank');
                                    });
                                }}
                                title="Download file"
                              >
                                <i className="fas fa-download"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      {task.files.filter(file => file.uploaded_by_role === 'employee').length === 0 && (
                        <small className="text-muted">No files uploaded yet</small>
                      )}
                    </div>
                  </div>

                  {/* Project Manager Files (Right Column - Green) */}
                  <div className="col-md-6">
                    <h6 style={{ fontSize: '14px', color: '#2e7d32', marginBottom: designSystem.spacing.sm }}>
                      <i className="fas fa-user-tie me-2"></i>
                      Project Manager Files
                    </h6>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {task.files
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
                                <strong style={{ color: '#2e7d32', fontSize: '13px' }}>{file.originalName || file.filename}</strong>
                                {file.description && (
                                  <div style={{ fontSize: '12px', color: designSystem.colors.gray[600], marginTop: '2px' }}>
                                    {file.description}
                                  </div>
                                )}
                                <div style={{ fontSize: '11px', color: designSystem.colors.gray[500], marginTop: '2px' }}>
                                  Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
                                </div>
                              </div>
                              <button
                                className="btn btn-outline-success btn-sm"
                                style={{ padding: '2px 6px', fontSize: '11px' }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  const fileUrl = getStaticFileUrl(`/${file.path}`);
                                  fetch(fileUrl)
                                    .then(response => response.blob())
                                    .then(blob => {
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.style.display = 'none';
                                      a.href = url;
                                      a.download = file.originalName || file.filename;
                                      document.body.appendChild(a);
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                      document.body.removeChild(a);
                                    })
                                    .catch(err => {
                                      console.error('Download error:', err);
                                      alert('Failed to download file. Opening in new tab instead.');
                                      window.open(fileUrl, '_blank');
                                    });
                                }}
                                title="Download file"
                              >
                                <i className="fas fa-download"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      {task.files.filter(file => file.uploaded_by_role === 'project_manager').length === 0 && (
                        <small className="text-muted">No files uploaded yet</small>
                      )}
                    </div>
                  </div>
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
