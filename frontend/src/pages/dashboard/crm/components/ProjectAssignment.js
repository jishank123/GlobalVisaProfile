import { useState, useEffect } from 'react';
import { projectsAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';
import { getApiEndpoint } from '../../../../utils/apiConfig';

const ProjectAssignment = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectManagers, setProjectManagers] = useState([]);
  const [formData, setFormData] = useState({
    project_manager_id: '',
    assignment_notes: ''
  });
  const [uploadFormData, setUploadFormData] = useState({
    files: [{ file: null, notes: '' }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedFileForAction, setSelectedFileForAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getMyProjects();
      
      if (response.success) {
        setProjects(response.data || []);
      } else {
        throw new Error(response.error?.message || 'Failed to load projects');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
      showAlert('error', 'Failed to load projects: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectManagers = async () => {
    try {
      console.log('🔄 Loading project managers...');
      const endpoint = getApiEndpoint('/users?role=project_manager');
      console.log('🔄 Fetching from:', endpoint);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('📊 Project managers API response:', data);
      
      if (data.success) {
        console.log('✅ Project managers loaded:', data.data?.length || 0);
        console.log('📋 Project managers list:', data.data);
        setProjectManagers(data.data || []);
      } else {
        throw new Error(data.error?.message || 'Failed to load project managers');
      }
    } catch (error) {
      console.error('❌ Error loading project managers:', error);
      showAlert('error', 'Failed to load project managers: ' + error.message);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  const openAssignmentModal = async (project) => {
    setSelectedProject(project);
    setFormData({
      project_manager_id: '',
      assignment_notes: ''
    });
    await loadProjectManagers();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
    setFormData({
      project_manager_id: '',
      assignment_notes: ''
    });
    setUploadFormData({
      files: [{ file: null, notes: '' }]
    });
  };

  const handleFileChange = (index, e) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = [...uploadFormData.files];
      newFiles[index].file = e.target.files[0];
      setUploadFormData({
        ...uploadFormData,
        files: newFiles
      });
    }
  };

  const handleNotesChange = (index, value) => {
    const newFiles = [...uploadFormData.files];
    newFiles[index].notes = value;
    setUploadFormData({
      ...uploadFormData,
      files: newFiles
    });
  };

  const addMoreFile = () => {
    setUploadFormData({
      ...uploadFormData,
      files: [...uploadFormData.files, { file: null, notes: '' }]
    });
  };

  const removeFile = (index) => {
    const newFiles = uploadFormData.files.filter((_, i) => i !== index);
    setUploadFormData({
      ...uploadFormData,
      files: newFiles.length > 0 ? newFiles : [{ file: null, notes: '' }]
    });
  };

  const handleAssignProject = async (e) => {
    e.preventDefault();
    
    if (!formData.project_manager_id) {
      showAlert('error', 'Please select a project manager');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const endpoint = getApiEndpoint(`/projects/${selectedProject._id}/assign-pm`);
      console.log('🔄 Assigning project to PM, endpoint:', endpoint);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('project_manager_id', formData.project_manager_id);
      formDataToSend.append('assignment_notes', formData.assignment_notes);
      
      // Append files with their notes
      uploadFormData.files.forEach((fileObj, index) => {
        if (fileObj.file) {
          formDataToSend.append('task_files', fileObj.file);
          formDataToSend.append(`file_notes_${index}`, fileObj.notes || '');
        }
      });
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (data.success) {
        showAlert('success', 'Project assigned successfully!');
        closeModal();
        loadProjects(); // Refresh the list
      } else {
        throw new Error(data.error?.message || 'Failed to assign project');
      }
    } catch (error) {
      console.error('Error assigning project:', error);
      showAlert('error', 'Failed to assign project: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    const statusStyles = {
      'pending': { background: '#f59e0b', color: 'white' },
      'in_progress': { background: '#3b82f6', color: 'white' },
      'on_hold': { background: '#ef4444', color: 'white' },
      'completed': { background: '#10b981', color: 'white' },
      'cancelled': { background: '#6b7280', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
  };

  const openTasksModal = (project) => {
    setSelectedProjectForTasks(project);
    setShowTasksModal(true);
  };

  const closeTasksModal = () => {
    setShowTasksModal(false);
    setSelectedProjectForTasks(null);
  };

  const handleApproveFile = async (projectId, fileId) => {
    try {
      const { getApiEndpoint } = await import('../../../../utils/apiConfig');
      const endpoint = getApiEndpoint(`/projects/${projectId}/final-files/${fileId}/approve`);
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        showAlert('success', 'File approved successfully!');
        // Reload all projects to get updated data
        await loadProjects();
        // Find and update the selected project in the modal
        const updatedProjects = await projectsAPI.getMyProjects();
        if (updatedProjects.success) {
          const updatedProject = updatedProjects.data.find(p => p._id === projectId);
          if (updatedProject) {
            setSelectedProjectForTasks(updatedProject);
          }
        }
      } else {
        throw new Error(data.error?.message || 'Failed to approve file');
      }
    } catch (error) {
      console.error('Error approving file:', error);
      showAlert('error', `Failed to approve file: ${error.message}`);
    }
  };

  const openRejectModal = (projectId, fileId) => {
    setSelectedFileForAction({ projectId, fileId });
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedFileForAction(null);
    setRejectionReason('');
  };

  const handleRejectFile = async () => {
    if (!rejectionReason.trim()) {
      showAlert('error', 'Please provide a reason for rejection');
      return;
    }

    try {
      const { getApiEndpoint } = await import('../../../../utils/apiConfig');
      const endpoint = getApiEndpoint(`/projects/${selectedFileForAction.projectId}/final-files/${selectedFileForAction.fileId}/reject`);
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejection_reason: rejectionReason })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showAlert('success', 'File rejected successfully!');
        closeRejectModal();
        // Reload all projects to get updated data
        await loadProjects();
        // Find and update the selected project in the modal
        const updatedProjects = await projectsAPI.getMyProjects();
        if (updatedProjects.success) {
          const updatedProject = updatedProjects.data.find(p => p._id === selectedFileForAction.projectId);
          if (updatedProject) {
            setSelectedProjectForTasks(updatedProject);
          }
        }
      } else {
        throw new Error(data.error?.message || 'Failed to reject file');
      }
    } catch (error) {
      console.error('Error rejecting file:', error);
      showAlert('error', `Failed to reject file: ${error.message}`);
    }
  };

  return (
    <div style={componentStyles.managementCard}>
      {/* Header */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-user-tie fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Project Assignment</h4>
            <p style={componentStyles.headerSubtitle}>Assign your projects to available project managers</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={loadProjects}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Alert Messages */}
      {alert.show && (
        <div 
          className={`alert alert-${alert.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}
          role="alert"
          style={{ marginBottom: designSystem.spacing.lg }}
        >
          <i className={`fas fa-${alert.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
          {alert.message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setAlert({ show: false, type: '', message: '' })}
          ></button>
        </div>
      )}

      {/* Search Bar */}
      {!loading && projects.length > 0 && (
        <div style={{ marginBottom: designSystem.spacing.lg }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Project ID, Service Name, Client Name/Email, or PM Name/Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '40px',
                borderRadius: designSystem.borderRadius.button,
                border: `1px solid ${designSystem.colors.gray[300]}`,
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = designSystem.colors.primary;
                e.target.style.boxShadow = `0 0 0 3px ${designSystem.colors.primary}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = designSystem.colors.gray[300];
                e.target.style.boxShadow = 'none';
              }}
            />
            <i 
              className="fas fa-search" 
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: designSystem.colors.gray[400],
                pointerEvents: 'none'
              }}
            ></i>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={componentStyles.loading}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
          <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading projects...</p>
        </div>
      )}

      {/* Projects Table */}
      {!loading && projects.length > 0 && (
        <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={componentStyles.tableHeader}>
              <tr>
                <th style={componentStyles.tableHeaderCell}>Project ID</th>
                <th style={componentStyles.tableHeaderCell}>Service Name</th>
                <th style={componentStyles.tableHeaderCell}>Client</th>
                <th style={componentStyles.tableHeaderCell}>Status</th>
                <th style={componentStyles.tableHeaderCell}>Assigned PM</th>
                <th style={componentStyles.tableHeaderCell}>Assignment</th>
                <th style={componentStyles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => {
                const statusStyle = getStatusBadgeStyle(project.status);
                
                return (
                  <tr 
                    key={project._id}
                    style={componentStyles.tableRow}
                    {...hoverEffects.tableRow}
                  >
                    <td style={componentStyles.tableCell}>
                      <div style={{ 
                        fontWeight: designSystem.typography.fontWeight.medium,
                        color: designSystem.colors.primary
                      }}>
                        {project.project_id || `#${project._id.slice(-8).toUpperCase()}`}
                      </div>
                    </td>
                    <td style={componentStyles.tableCell}>
                      {project.service_name || 'N/A'}
                    </td>
                    <td style={componentStyles.tableCell}>
                      <div>
                        <div style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                          {project.client?.name || 
                           (project.client?.user_id?.first_name && project.client?.user_id?.last_name ? 
                            `${project.client.user_id.first_name} ${project.client.user_id.last_name}` : 
                            'N/A')}
                        </div>
                        <small style={{ color: designSystem.colors.gray[500] }}>
                          {project.client?.email || project.client?.user_id?.email || ''}
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
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={componentStyles.tableCell}>
                      {project.project_manager ? (
                        <div>
                          <div style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                            {project.project_manager.first_name && project.project_manager.last_name ? 
                              `${project.project_manager.first_name} ${project.project_manager.last_name}` : 
                              'N/A'}
                          </div>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            {project.project_manager.email || ''}
                          </small>
                        </div>
                      ) : (
                        <span style={{ 
                          color: designSystem.colors.gray[500], 
                          fontStyle: 'italic' 
                        }}>
                          Not assigned
                        </span>
                      )}
                    </td>
                    <td style={componentStyles.tableCell}>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => openAssignmentModal(project)}
                        title={project.project_manager ? "Reassign to another Project Manager" : "Assign to Project Manager"}
                        style={{
                          padding: '4px 10px',
                          fontSize: '12px'
                        }}
                      >
                        <i className="fas fa-user-plus me-1"></i>
                        {project.project_manager ? 'Reassign' : 'Assign'}
                      </button>
                    </td>
                    <td style={componentStyles.tableCell}>
                      <button 
                        className="btn btn-outline-info btn-sm"
                        onClick={() => openTasksModal(project)}
                        title="View Project Tasks & Milestones"
                      >
                        <i className="fas fa-tasks"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* No Projects Message */}
      {!loading && projects.length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-project-diagram fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>No projects found</h6>
          <p style={{ color: designSystem.colors.gray[500] }}>You don't have any projects assigned yet</p>
        </div>
      )}

      {/* Assignment Modal */}
      {showModal && selectedProject && (
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
              closeModal();
            }
          }}
        >
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={componentStyles.modalContent}>
              <div className="modal-header" style={componentStyles.modalHeader}>
                <h5 className="modal-title">
                  <i className="fas fa-user-tie me-2"></i>
                  Assign Project to Project Manager
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>
              
              <div className="modal-body" style={componentStyles.modalBody}>
                {/* Project Details */}
                <div style={{ 
                  background: designSystem.colors.gray[50], 
                  padding: designSystem.spacing.md,
                  borderRadius: designSystem.borderRadius.button,
                  marginBottom: designSystem.spacing.lg
                }}>
                  <h6 style={{ 
                    color: designSystem.colors.dark, 
                    marginBottom: designSystem.spacing.sm,
                    fontWeight: designSystem.typography.fontWeight.bold
                  }}>
                    Project Details
                  </h6>
                  <div className="row">
                    <div className="col-md-4">
                      <small style={{ color: designSystem.colors.gray[600] }}>Project ID:</small>
                      <p style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                        {selectedProject.project_id || `#${selectedProject._id.slice(-8).toUpperCase()}`}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <small style={{ color: designSystem.colors.gray[600] }}>Service Name:</small>
                      <p style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                        {selectedProject.service_name || 'N/A'}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <small style={{ color: designSystem.colors.gray[600] }}>Client Name:</small>
                      <p style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                        {selectedProject.client?.name || 
                         (selectedProject.client?.user_id?.first_name && selectedProject.client?.user_id?.last_name ? 
                          `${selectedProject.client.user_id.first_name} ${selectedProject.client.user_id.last_name}` : 
                          'N/A')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assignment Form */}
                <form onSubmit={handleAssignProject}>
                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Select Project Manager *</strong>
                    </label>
                    <select 
                      className="form-select"
                      value={formData.project_manager_id}
                      onChange={(e) => setFormData({ ...formData, project_manager_id: e.target.value })}
                      required
                    >
                      <option value="">Choose a project manager...</option>
                      {projectManagers.map(pm => (
                        <option key={pm._id} value={pm._id}>
                          {pm.first_name && pm.last_name ? `${pm.first_name} ${pm.last_name}` : pm.email} - {pm.email}
                        </option>
                      ))}
                    </select>
                    {projectManagers.length === 0 && (
                      <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        No project managers available
                      </small>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Assignment Notes</strong>
                    </label>
                    <textarea 
                      className="form-control"
                      rows="4"
                      value={formData.assignment_notes}
                      onChange={(e) => setFormData({ ...formData, assignment_notes: e.target.value })}
                      placeholder="Add any notes or instructions for the project manager..."
                    />
                  </div>

                  {/* Task Files Upload Section */}
                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Task Files</strong>
                      <small className="text-muted ms-2">(Optional - Attach files for the project manager to work on)</small>
                    </label>
                    
                    {uploadFormData.files.map((fileItem, index) => (
                      <div
                        key={index}
                        style={{
                          background: '#e3f2fd',
                          padding: designSystem.spacing.md,
                          borderRadius: designSystem.borderRadius.button,
                          marginBottom: designSystem.spacing.sm,
                          border: '1px solid #90caf9'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: designSystem.spacing.sm }}>
                          <div style={{ flex: 1 }}>
                            <label className="form-label" style={{ marginBottom: '4px', fontSize: '13px', fontWeight: '600', color: '#1565c0' }}>
                              <i className="fas fa-file me-1"></i>
                              Select File {index + 1}
                            </label>
                            <input
                              type="file"
                              className="form-control form-control-sm"
                              onChange={(e) => handleFileChange(index, e)}
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.txt"
                            />
                            {fileItem.file && (
                              <small className="text-muted d-block mt-1">
                                {fileItem.file.name} ({(fileItem.file.size / 1024).toFixed(2)} KB)
                              </small>
                            )}
                          </div>
                          {uploadFormData.files.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger ms-2"
                              onClick={() => removeFile(index)}
                              style={{ padding: '4px 8px' }}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>
                        <div>
                          <label className="form-label" style={{ marginBottom: '4px', fontSize: '13px', fontWeight: '600', color: '#1565c0' }}>
                            Notes for this file
                          </label>
                          <textarea
                            className="form-control form-control-sm"
                            rows="2"
                            value={fileItem.notes}
                            onChange={(e) => handleNotesChange(index, e.target.value)}
                            placeholder="Add notes or instructions for this file..."
                            style={{ fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={addMoreFile}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Add More Files
                    </button>
                  </div>

                  {/* Display existing task files */}
                  {selectedProject.task_files && selectedProject.task_files.filter(file => file.uploaded_by_role === 'crm_manager').length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">
                        <strong>Previously Uploaded Task Files</strong>
                      </label>
                      <div>
                        {selectedProject.task_files
                          .filter(file => file.uploaded_by_role === 'crm_manager')
                          .map((file, index) => (
                            <div
                              key={index}
                              style={{
                                background: '#e3f2fd',
                                padding: designSystem.spacing.sm,
                                borderRadius: designSystem.borderRadius.button,
                                marginBottom: designSystem.spacing.sm,
                                border: '1px solid #90caf9'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: designSystem.spacing.xs }}>
                                <i className="fas fa-file me-2" style={{ color: '#1976d2' }}></i>
                                <small style={{ fontWeight: 600, color: '#1565c0' }}>{file.originalname}</small>
                              </div>
                              {file.note && (
                                <small style={{ color: designSystem.colors.gray[600], display: 'block', marginTop: designSystem.spacing.xs }}>
                                  <i className="fas fa-sticky-note me-1"></i>
                                  {file.note}
                                </small>
                              )}
                              <small className="text-muted" style={{ display: 'block', marginTop: designSystem.spacing.xs }}>
                                {new Date(file.uploaded_at).toLocaleDateString()}
                              </small>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </form>
              </div>
              
              <div className="modal-footer" style={componentStyles.modalFooter}>
               
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleAssignProject}
                  disabled={isSubmitting || !formData.project_manager_id}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Assign Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks & Milestones Modal */}
      {showTasksModal && selectedProjectForTasks && (
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
              closeTasksModal();
            }
          }}
        >
          <div className="modal-dialog modal-lg" style={{ maxWidth: '900px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="fas fa-tasks me-2"></i>
                  Project Tasks & Milestones
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeTasksModal}></button>
              </div>
              
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ marginBottom: designSystem.spacing.md }}>
                  <h6 style={{ color: designSystem.colors.primary, marginBottom: designSystem.spacing.sm }}>
                    <i className="fas fa-project-diagram me-2"></i>
                    {selectedProjectForTasks.project_id || `#${selectedProjectForTasks._id.slice(-8).toUpperCase()}`}
                  </h6>
                  <p style={{ fontSize: designSystem.typography.fontSize.sm, color: designSystem.colors.gray[500] }}>
                    Milestones and tasks for this project
                  </p>
                </div>

                {/* Project Milestones */}
                <div style={{ marginBottom: designSystem.spacing.lg }}>
                  <h6 style={{ 
                    color: designSystem.colors.dark, 
                    marginBottom: designSystem.spacing.md,
                    borderBottom: `2px solid ${designSystem.colors.primary}`,
                    paddingBottom: designSystem.spacing.xs
                  }}>
                    <i className="fas fa-flag me-2"></i>Project Milestones
                  </h6>
                  
                  {selectedProjectForTasks.milestones && selectedProjectForTasks.milestones.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.sm }}>
                      {selectedProjectForTasks.milestones.map((milestone, index) => {
                        const getMilestoneStatusColor = (status) => {
                          switch (status) {
                            case 'completed': return '#10b981';
                            case 'in_progress': return '#3b82f6';
                            case 'pending': return '#f59e0b';
                            default: return '#6b7280';
                          }
                        };

                        const getMilestoneStatusIcon = (status) => {
                          switch (status) {
                            case 'completed': return 'fas fa-check-circle';
                            case 'in_progress': return 'fas fa-play-circle';
                            case 'pending': return 'fas fa-clock';
                            default: return 'fas fa-circle';
                          }
                        };

                        return (
                          <div key={index} style={{
                            padding: designSystem.spacing.md,
                            background: designSystem.colors.gray[50],
                            borderRadius: designSystem.borderRadius.button,
                            border: `1px solid ${designSystem.colors.gray[200]}`,
                            borderLeft: `4px solid ${getMilestoneStatusColor(milestone.status)}`
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: designSystem.spacing.xs }}>
                              <div style={{ flex: 1 }}>
                                <h6 style={{ margin: 0, color: designSystem.colors.dark, marginBottom: '4px' }}>
                                  <i className={`${getMilestoneStatusIcon(milestone.status)} me-2`} style={{ color: getMilestoneStatusColor(milestone.status) }}></i>
                                  {milestone.title}
                                </h6>
                                {milestone.notes && (
                                  <small style={{ color: designSystem.colors.gray[600], display: 'block', marginBottom: '8px' }}>
                                    {milestone.notes}
                                  </small>
                                )}
                                <div style={{ display: 'flex', gap: designSystem.spacing.md, fontSize: designSystem.typography.fontSize.xs }}>
                                  {milestone.target_date && (
                                    <span style={{ color: designSystem.colors.gray[500] }}>
                                      <i className="fas fa-calendar me-1"></i>
                                      Target: {new Date(milestone.target_date).toLocaleDateString()}
                                    </span>
                                  )}
                                  {milestone.completion_date && (
                                    <span style={{ color: designSystem.colors.success }}>
                                      <i className="fas fa-check me-1"></i>
                                      Completed: {new Date(milestone.completion_date).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span style={{
                                background: getMilestoneStatusColor(milestone.status),
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                              }}>
                                {milestone.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{
                      padding: designSystem.spacing.lg,
                      textAlign: 'center',
                      background: designSystem.colors.gray[50],
                      borderRadius: designSystem.borderRadius.button,
                      border: `1px dashed ${designSystem.colors.gray[300]}`
                    }}>
                      <i className="fas fa-flag fa-2x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.sm }}></i>
                      <p style={{ color: designSystem.colors.gray[500], margin: 0 }}>
                        No milestones have been added to this project yet
                      </p>
                    </div>
                  )}
                </div>

                {/* Project Progress Summary */}
                <div style={{ 
                  marginTop: designSystem.spacing.lg,
                  padding: designSystem.spacing.md,
                  background: '#f0f9ff',
                  borderRadius: designSystem.borderRadius.button,
                  border: '1px solid #0ea5e9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm, marginBottom: designSystem.spacing.sm }}>
                    <i className="fas fa-chart-line" style={{ color: '#0ea5e9' }}></i>
                    <span style={{ color: '#0ea5e9', fontWeight: '600' }}>
                      Project Progress Summary
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: designSystem.spacing.md }}>
                    <div>
                      <small style={{ color: designSystem.colors.gray[600] }}>Overall Progress</small>
                      <div style={{ fontWeight: '700', fontSize: '18px', color: '#0ea5e9' }}>
                        {selectedProjectForTasks.progress || 0}%
                      </div>
                    </div>
                    {selectedProjectForTasks.milestones && selectedProjectForTasks.milestones.length > 0 && (
                      <>
                        <div>
                          <small style={{ color: designSystem.colors.gray[600] }}>Completed Milestones</small>
                          <div style={{ fontWeight: '700', fontSize: '18px', color: '#10b981' }}>
                            {selectedProjectForTasks.milestones.filter(m => m.status === 'completed').length} / {selectedProjectForTasks.milestones.length}
                          </div>
                        </div>
                        <div>
                          <small style={{ color: designSystem.colors.gray[600] }}>In Progress</small>
                          <div style={{ fontWeight: '700', fontSize: '18px', color: '#3b82f6' }}>
                            {selectedProjectForTasks.milestones.filter(m => m.status === 'in_progress').length}
                          </div>
                        </div>
                        <div>
                          <small style={{ color: designSystem.colors.gray[600] }}>Pending</small>
                          <div style={{ fontWeight: '700', fontSize: '18px', color: '#f59e0b' }}>
                            {selectedProjectForTasks.milestones.filter(m => m.status === 'pending').length}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Final Files Section */}
                {selectedProjectForTasks.final_files && selectedProjectForTasks.final_files.length > 0 && (
                  <div style={{ marginTop: designSystem.spacing.lg }}>
                    <h6 style={{ 
                      color: designSystem.colors.dark, 
                      marginBottom: designSystem.spacing.md,
                      borderBottom: `2px solid #10b981`,
                      paddingBottom: designSystem.spacing.xs
                    }}>
                      <i className="fas fa-file-download me-2"></i>Final Deliverables
                    </h6>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.sm }}>
                      {selectedProjectForTasks.final_files.map((file, index) => {
                        const getStatusColor = (status) => {
                          switch (status) {
                            case 'approved': return '#10b981';
                            case 'rejected': return '#ef4444';
                            case 'pending': return '#f59e0b';
                            default: return '#6b7280';
                          }
                        };

                        const getStatusText = (status) => {
                          switch (status) {
                            case 'approved': return 'Approved';
                            case 'rejected': return 'Rejected';
                            case 'pending': return 'Pending';
                            default: return 'Unknown';
                          }
                        };

                        return (
                          <div key={index} style={{
                            padding: designSystem.spacing.md,
                            background: '#f0fdf4',
                            borderRadius: designSystem.borderRadius.button,
                            border: `1px solid #86efac`,
                            borderLeft: `4px solid ${getStatusColor(file.approval_status || 'pending')}`
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: designSystem.spacing.xs }}>
                              <div style={{ flex: 1 }}>
                                <h6 style={{ margin: 0, color: designSystem.colors.dark, marginBottom: '4px' }}>
                                  <i className="fas fa-file me-2" style={{ color: '#10b981' }}></i>
                                  {file.originalName}
                                </h6>
                                {file.notes && (
                                  <div style={{ marginBottom: '8px' }}>
                                    <small style={{ color: designSystem.colors.gray[600], fontWeight: '600' }}>Notes: </small>
                                    <small style={{ color: designSystem.colors.gray[600] }}>{file.notes}</small>
                                  </div>
                                )}
                                {file.rejection_reason && (
                                  <div style={{ marginBottom: '8px', padding: '6px', background: '#fee2e2', borderRadius: '4px' }}>
                                    <small style={{ color: '#991b1b', fontWeight: '600' }}>Rejection Reason: </small>
                                    <small style={{ color: '#991b1b' }}>{file.rejection_reason}</small>
                                  </div>
                                )}
                                <div style={{ display: 'flex', gap: designSystem.spacing.md, fontSize: designSystem.typography.fontSize.xs, flexWrap: 'wrap' }}>
                                  <span style={{ color: designSystem.colors.gray[500] }}>
                                    <i className="fas fa-user me-1"></i>
                                    Uploaded by: {file.uploaded_by?.first_name} {file.uploaded_by?.last_name}
                                  </span>
                                  <span style={{ color: designSystem.colors.gray[500] }}>
                                    <i className="fas fa-calendar me-1"></i>
                                    {new Date(file.uploaded_at).toLocaleDateString()}
                                  </span>
                                  <span style={{ color: designSystem.colors.gray[500] }}>
                                    <i className="fas fa-file-alt me-1"></i>
                                    {(file.size / 1024).toFixed(2)} KB
                                  </span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <a
                                    href={`${process.env.REACT_APP_API_URL?.replace('/api', '')}/${file.path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      background: '#0ea5e9',
                                      color: 'white',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      textTransform: 'uppercase',
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="Preview file"
                                  >
                                    <i className="fas fa-eye"></i>
                                    Preview
                                  </a>
                                  <span style={{
                                    background: getStatusColor(file.approval_status || 'pending'),
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase'
                                  }}>
                                    {getStatusText(file.approval_status || 'pending')}
                                  </span>
                                </div>
                                {(!file.approval_status || file.approval_status === 'pending') && (
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                      onClick={() => handleApproveFile(selectedProjectForTasks._id, file._id)}
                                      style={{
                                        background: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                                        transition: 'all 0.2s ease',
                                        textTransform: 'uppercase'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.background = '#059669';
                                        e.target.style.transform = 'translateY(-1px)';
                                        e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.background = '#10b981';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
                                      }}
                                      title="Approve file"
                                    >
                                      <i className="fas fa-check"></i>
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => openRejectModal(selectedProjectForTasks._id, file._id)}
                                      style={{
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                                        transition: 'all 0.2s ease',
                                        textTransform: 'uppercase'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.background = '#dc2626';
                                        e.target.style.transform = 'translateY(-1px)';
                                        e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.background = '#ef4444';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)';
                                      }}
                                      title="Reject file"
                                    >
                                      <i className="fas fa-times"></i>
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={closeTasksModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div 
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1060
          }}
          onClick={closeRejectModal}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: designSystem.borderRadius.card,
              padding: designSystem.spacing.xl,
              maxWidth: '500px',
              width: '90%',
              boxShadow: designSystem.shadows.modal
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 style={{ marginBottom: designSystem.spacing.lg, color: '#ef4444' }}>
              <i className="fas fa-times-circle me-2"></i>
              Reject File
            </h5>
            
            <div style={{ marginBottom: designSystem.spacing.lg }}>
              <label style={{ 
                display: 'block', 
                marginBottom: designSystem.spacing.sm,
                fontWeight: designSystem.typography.fontWeight.medium
              }}>
                Reason for Rejection *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="4"
                placeholder="Please provide a reason for rejecting this file..."
                style={{
                  width: '100%',
                  padding: designSystem.spacing.sm,
                  borderRadius: designSystem.borderRadius.button,
                  border: `1px solid ${designSystem.colors.gray[300]}`,
                  fontSize: designSystem.typography.fontSize.base,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: designSystem.spacing.sm, justifyContent: 'flex-end' }}>
              <button
                onClick={closeRejectModal}
                style={{
                  ...componentStyles.primaryButton,
                  background: designSystem.colors.gray[200],
                  color: designSystem.colors.gray[700]
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectFile}
                disabled={!rejectionReason.trim()}
                style={{
                  ...componentStyles.primaryButton,
                  background: '#ef4444',
                  opacity: !rejectionReason.trim() ? 0.6 : 1,
                  cursor: !rejectionReason.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                <i className="fas fa-times me-2"></i>
                Reject File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectAssignment;
