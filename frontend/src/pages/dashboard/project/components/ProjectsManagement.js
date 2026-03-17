import { useState, useEffect } from 'react';
import { projectsAPI, clientsAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

// Helper function for status badge styling
const getStatusBadgeStyle = (status) => {
  const statusStyles = {
    'pending': { background: '#f59e0b', color: 'white' },
    'active': { background: '#3b82f6', color: 'white' },
    'on_hold': { background: '#ef4444', color: 'white' },
    'completed': { background: '#10b981', color: 'white' },
    'cancelled': { background: '#6b7280', color: 'white' }
  };
  return statusStyles[status] || { background: '#6b7280', color: 'white' };
};

const ProjectsManagement = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedProjectForUpload, setSelectedProjectForUpload] = useState(null);
  const [uploadFormData, setUploadFormData] = useState({
    files: [{ file: null, notes: '' }]
  });
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    loadAssignedProjects();
  }, []);

  const loadAssignedProjects = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading assigned projects for Project Manager...');
      console.log('🔄 Making API call to:', '/api/projects/my-pm-projects');
      
      // Get only projects assigned to current Project Manager
      const response = await projectsAPI.getMyPMProjects();
      
      console.log('📊 Full API Response:', JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log('✅ Projects loaded successfully:', response.data?.length || 0);
        console.log('✅ Projects data:', response.data);
        setProjects(response.data || []);
      } else {
        console.error('❌ API Response indicates failure:', response);
        console.error('❌ Error details:', response?.error);
        setProjects([]);
        // Show user-friendly error
        alert(`Failed to load projects: ${response?.error?.message || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('❌ Exception while loading assigned projects:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      setProjects([]);
      // Show user-friendly error
      alert(`Error loading projects: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects by status
  const getFilteredProjects = (status) => {
    if (status === 'all') return projects;
    return projects.filter(project => {
      switch (status) {
        case 'active':
          return project.status === 'active';
        case 'pending':
          return project.status === 'pending';
        case 'completed':
          return project.status === 'completed';
        case 'on_hold':
          return project.status === 'on_hold';
        default:
          return true;
      }
    });
  };

  // Get project counts for stats
  const getProjectCounts = () => {
    return {
      total: projects.length,
      active: projects.filter(project => project.status === 'active').length,
      pending: projects.filter(project => project.status === 'pending').length,
      completed: projects.filter(project => project.status === 'completed').length,
      onHold: projects.filter(project => project.status === 'on_hold').length
    };
  };

  const getPriorityStyle = (priority) => {
    const priorityColors = {
      'low': '#10b981',
      'medium': '#f59e0b', 
      'high': '#ef4444'
    };
    return { color: priorityColors[priority] || '#6b7280' };
  };

  const getProgressBarClass = (progress) => {
    if (progress >= 80) return '#10b981';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalData(null);
    setModalType('');
  };

  const viewProjectDetails = (project) => {
    setModalData(project);
    setModalType('view');
    setShowModal(true);
  };

  const handleUpdateProjectStatus = async (projectId, newStatus, newProgress) => {
    try {
      console.log('🔄 Updating project:', projectId);
      console.log('🔄 New status (before sending):', newStatus);
      console.log('🔄 New progress:', newProgress);
      
      // Ensure we're not sending in_progress
      const statusToSend = newStatus === 'in_progress' ? 'active' : newStatus;
      console.log('🔄 Status to send:', statusToSend);
      
      // Update both status and progress using the general update endpoint
      const response = await projectsAPI.update(projectId, {
        status: statusToSend,
        progress: newProgress
      });
      
      if (response.success) {
        console.log('✅ Project updated successfully');
        await loadAssignedProjects(); // Refresh the list
        alert('Project status and progress updated successfully!');
      } else {
        throw new Error(response.error?.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('❌ Error updating project:', error);
      alert(`Error updating project: ${error.message}`);
    }
  };

  const openUploadModal = (project) => {
    setSelectedProjectForUpload(project);
    setUploadFormData({
      files: [{ file: null, notes: '' }]
    });
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedProjectForUpload(null);
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

  const handleUploadFinalFile = async (e) => {
    e.preventDefault();
    
    // Check if at least one file is selected
    const hasFiles = uploadFormData.files.some(item => item.file !== null);
    if (!hasFiles) {
      alert('Please select at least one file to upload');
      return;
    }
    
    setUploadLoading(true);
    
    try {
      const { getApiEndpoint } = await import('../../../../utils/apiConfig');
      let successCount = 0;
      let errorCount = 0;
      
      // Upload each file separately
      for (const fileItem of uploadFormData.files) {
        if (!fileItem.file) continue; // Skip empty file slots
        
        try {
          const formData = new FormData();
          formData.append('file', fileItem.file);
          formData.append('notes', fileItem.notes);
          
          const endpoint = getApiEndpoint(`/projects/${selectedProjectForUpload._id}/final-files`);
          
          const response = await fetch(endpoint, {
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
            console.error(`Failed to upload ${fileItem.file.name}:`, data.error?.message);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error uploading ${fileItem.file.name}:`, error);
        }
      }
      
      // Show result message
      if (successCount > 0 && errorCount === 0) {
        alert(`Successfully uploaded ${successCount} file(s)!`);
        closeUploadModal();
        loadAssignedProjects(); // Refresh the list
      } else if (successCount > 0 && errorCount > 0) {
        alert(`Uploaded ${successCount} file(s) successfully, but ${errorCount} file(s) failed.`);
        closeUploadModal();
        loadAssignedProjects(); // Refresh the list
      } else {
        alert('Failed to upload files. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert(`Failed to upload files: ${error.message}`);
    } finally {
      setUploadLoading(false);
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

  const renderProjectTable = (projectType) => {
    const filteredProjects = getFilteredProjects(projectType);
    
    if (filteredProjects.length === 0) {
      return (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-project-diagram fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
          <p style={{ color: designSystem.colors.gray[500] }}>
            No {projectType === 'all' ? '' : projectType} projects assigned to you
          </p>
        </div>
      );
    }

    return (
      <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={componentStyles.tableHeader}>
            <tr>
              <th style={componentStyles.tableHeaderCell}>Project ID</th>
              <th style={componentStyles.tableHeaderCell}>Client</th>
              <th style={componentStyles.tableHeaderCell}>Service</th>
              <th style={componentStyles.tableHeaderCell}>Status</th>
              <th style={componentStyles.tableHeaderCell}>Priority</th>
              <th style={componentStyles.tableHeaderCell}>Progress</th>
              <th style={componentStyles.tableHeaderCell}>Due Date</th>
              <th style={componentStyles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(project => {
              const statusStyle = getStatusBadgeStyle(project.status);
              const priorityStyle = getPriorityStyle(project.priority || 'medium');
              const progressBarColor = getProgressBarClass(project.progress || 0);
              
              return (
                <tr 
                  key={project._id}
                  style={componentStyles.tableRow}
                  {...hoverEffects.tableRow}
                >
                  <td style={componentStyles.tableCell}>
                    <span 
                      style={{
                        ...componentStyles.badge,
                        background: designSystem.colors.primary,
                        color: 'white',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        fontWeight: '600',
                        padding: '6px 12px'
                      }}
                    >
                      {project.project_id || `#${project._id.slice(-8).toUpperCase()}`}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <div style={{ 
                      fontWeight: designSystem.typography.fontWeight.medium
                    }}>
                      {project.client?.name || 
                       (project.client?.firstName && project.client?.lastName ? 
                        `${project.client.firstName} ${project.client.lastName}` : 
                        'Unknown Client')}
                    </div>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <span style={{
                      background: '#8b5cf6',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {project.service?.name || project.service_name || 'Unknown Service'}
                    </span>
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
                    <span style={{
                      ...priorityStyle,
                      fontWeight: designSystem.typography.fontWeight.bold,
                      textTransform: 'uppercase',
                      fontSize: '12px'
                    }}>
                      {(project.priority || 'medium')}
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
                            width: `${project.progress || 0}%`,
                            height: '100%',
                            background: progressBarColor,
                            transition: 'width 0.3s ease'
                          }}
                        ></div>
                      </div>
                      <small style={{ 
                        fontSize: designSystem.typography.fontSize.xs,
                        fontWeight: '600'
                      }}>
                        {project.progress || 0}%
                      </small>
                    </div>
                  </td>
                  <td style={componentStyles.tableCell}>
                    {project.due_date ? (
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500' }}>
                          {new Date(project.due_date).toLocaleDateString()}
                        </div>
                        <small style={{ color: designSystem.colors.gray[500] }}>
                          {new Date(project.due_date) < new Date() ? 'Overdue' : 'Upcoming'}
                        </small>
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
                        onClick={() => viewProjectDetails(project)}
                        title="View Project Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="btn btn-outline-success btn-sm"
                        onClick={() => openUploadModal(project)}
                        title="Upload Final File"
                      >
                        <i className="fas fa-upload"></i>
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
      {/* Header with Refresh Button */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-project-diagram fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Assigned Projects</h4>
            <p style={componentStyles.headerSubtitle}>View and manage projects assigned to you</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={loadAssignedProjects}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Overview Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-play-circle"
          number={getProjectCounts().active}
          label="Active Projects"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
        <StatCard
          icon="fas fa-clock"
          number={getProjectCounts().pending}
          label="Pending Projects"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-pause-circle"
          number={getProjectCounts().onHold}
          label="On Hold"
          borderColor="#ef4444"
          iconColor="#ef4444"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={getProjectCounts().completed}
          label="Completed Projects"
          borderColor="#10b981"
          iconColor="#10b981"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div style={componentStyles.loading}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
          <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading assigned projects...</p>
        </div>
      )}

      {/* Project Type Tabs */}
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
                All Projects ({getProjectCounts().total})
              </button>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: activeTab === 'active' ? '#3b82f6' : designSystem.colors.gray[100],
                  color: activeTab === 'active' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'active' ? designSystem.shadows.button : 'none'
                }}
                onClick={() => setActiveTab('active')}
                {...hoverEffects.button}
              >
                Active ({getProjectCounts().active})
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
                Pending ({getProjectCounts().pending})
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
                Completed ({getProjectCounts().completed})
              </button>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: activeTab === 'on_hold' ? '#ef4444' : designSystem.colors.gray[100],
                  color: activeTab === 'on_hold' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'on_hold' ? designSystem.shadows.button : 'none'
                }}
                onClick={() => setActiveTab('on_hold')}
                {...hoverEffects.button}
              >
                On Hold ({getProjectCounts().onHold})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {renderProjectTable(activeTab)}
          </div>
        </>
      )}

      {/* No Projects Message */}
      {!loading && projects.length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-project-diagram fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>No projects assigned to you</h6>
          <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.lg }}>Projects assigned to you will appear here</p>
        </div>
      )}

      {/* Project Details Modal */}
      {showModal && modalData && (
        <ProjectDetailsModal
          key={`${modalData._id}-${modalData.status}-${modalData.progress}`}
          show={showModal}
          onHide={handleModalClose}
          type={modalType}
          data={modalData}
          onUpdateStatus={handleUpdateProjectStatus}
          user={user}
        />
      )}

      {/* Upload Final File Modal */}
      {showUploadModal && selectedProjectForUpload && (
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
              closeUploadModal();
            }
          }}
        >
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="fas fa-upload me-2"></i>
                  Upload Final Deliverable
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeUploadModal}></button>
              </div>
              
              <div className="modal-body">
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
                        {selectedProjectForUpload.project_id || `#${selectedProjectForUpload._id.slice(-8).toUpperCase()}`}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <small style={{ color: designSystem.colors.gray[600] }}>Service Name:</small>
                      <p style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                        {selectedProjectForUpload.service_name || 'N/A'}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <small style={{ color: designSystem.colors.gray[600] }}>Client Name:</small>
                      <p style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                        {selectedProjectForUpload.client?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUploadFinalFile}>
                  {uploadFormData.files.map((fileItem, index) => (
                    <div key={index} style={{
                      border: `1px solid ${designSystem.colors.gray[300]}`,
                      borderRadius: designSystem.borderRadius.button,
                      padding: designSystem.spacing.md,
                      marginBottom: designSystem.spacing.sm,
                      background: 'white'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: designSystem.spacing.sm }}>
                        <h6 style={{ margin: 0, color: designSystem.colors.dark, fontSize: '14px' }}>
                          <i className="fas fa-file me-2"></i>
                          File {index + 1}
                        </h6>
                        {uploadFormData.files.length > 1 && (
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
                        <label className="form-label" style={{ fontSize: '13px', marginBottom: '4px' }}>
                          <strong>Select File *</strong>
                        </label>
                        <input 
                          type="file"
                          className="form-control form-control-sm"
                          onChange={(e) => handleFileChange(index, e)}
                          required
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.txt,image/*"
                        />
                        {index === 0 && (
                          <small className="text-muted" style={{ fontSize: '11px' }}>
                            <i className="fas fa-info-circle me-1"></i>
                            PDF, Word, Excel, ZIP, Text, Images (Max 10MB)
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
                        <label className="form-label" style={{ fontSize: '13px', marginBottom: '4px' }}>
                          <strong>Notes</strong>
                        </label>
                        <textarea 
                          className="form-control form-control-sm"
                          rows="2"
                          value={fileItem.notes}
                          onChange={(e) => handleNotesChange(index, e.target.value)}
                          placeholder="Add any notes about this file..."
                          style={{ fontSize: '13px' }}
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
                    Add More
                  </button>
                </form>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeUploadModal}
                  disabled={uploadLoading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={handleUploadFinalFile}
                  disabled={uploadLoading || !uploadFormData.files.some(f => f.file !== null)}
                >
                  {uploadLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload me-2"></i>
                      Upload {uploadFormData.files.filter(f => f.file !== null).length} File(s)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Project Details Modal Component
const ProjectDetailsModal = ({ show, onHide, type, data, onUpdateStatus, user }) => {
  const [newStatus, setNewStatus] = useState(data?.status || 'pending');
  const [newProgress, setNewProgress] = useState(data?.progress || 0);

  // Debug: Log the data to see what fields are available
  useEffect(() => {
    console.log('📋 Project Details Modal Data:', {
      pm_assignment_notes: data?.pm_assignment_notes,
      assignment_notes: data?.assignment_notes,
      task_files: data?.task_files,
      task_files_count: data?.task_files?.length || 0
    });
  }, [data]);

  // Auto-set progress to 100% when status is completed
  useEffect(() => {
    if (newStatus === 'completed' && newProgress !== 100) {
      console.log('📊 Auto-setting progress to 100% for completed status');
      setNewProgress(100);
    }
  }, [newStatus]);

  if (!show || !data) return null;

  console.log('📊 Rendering modal with status:', newStatus, 'progress:', newProgress);

  // Auto-update progress when status changes
  const handleStatusChange = (status) => {
    setNewStatus(status);
    
    // Auto-set progress based on status
    if (status === 'completed') {
      setNewProgress(100);
    } else if (status === 'pending') {
      setNewProgress(0);
    } else if (status === 'active' && newProgress === 0) {
      setNewProgress(25); // Set to 25% if starting from 0
    }
  };

  const handleStatusUpdate = () => {
    if (newStatus !== data.status || newProgress !== data.progress) {
      onUpdateStatus(data._id, newStatus, newProgress);
      onHide();
    } else {
      onHide();
    }
  };

  return (
    <div className="modal" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className={`fas ${
                type === 'client' ? 'fa-user' : 
                type === 'schedule' ? 'fa-calendar-plus' : 
                'fa-project-diagram'
              } me-2`}></i>
              {type === 'client' ? 'Client Details' : 
               type === 'schedule' ? 'Schedule Meeting' : 
               'Project Details'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {type === 'client' ? (
              <div>
                <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                  Client Information
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Name:</strong> {data.client?.name || 
                      (data.client?.user_id?.first_name && data.client?.user_id?.last_name ? 
                       `${data.client.user_id.first_name} ${data.client.user_id.last_name}` : 
                       'N/A')}</p>
                    <p><strong>Email:</strong> {data.client?.email || data.client?.user_id?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {data.client?.phone || data.client?.user_id?.phone || 'Not provided'}</p>
                    <p><strong>Company:</strong> {data.client?.user_id?.company || 'Not provided'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>University:</strong> {data.client?.university || data.client?.user_id?.university || 'Not provided'}</p>
                    <p><strong>Country:</strong> {data.client?.user_id?.country || 'Not provided'}</p>
                    <p><strong>Status:</strong> {data.client?.status ? (
                      <span style={{
                        ...componentStyles.badge,
                        background: data.client.status === 'active' ? '#10b981' : 
                                   data.client.status === 'vip' ? '#8b5cf6' : '#6b7280',
                        color: 'white',
                        textTransform: 'uppercase',
                        marginLeft: '8px'
                      }}>{data.client.status}</span>
                    ) : 'Not set'}</p>
                    <p><strong>Satisfaction Rating:</strong> {data.client?.satisfaction_rating ? 
                      `${data.client.satisfaction_rating}/5 ⭐` : 'Not rated'}</p>
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-md-6">
                    <p><strong>Registration Date:</strong> {data.client?.createdAt ? 
                      new Date(data.client.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Last Updated:</strong> {data.client?.updatedAt ? 
                      new Date(data.client.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}</p>
                  </div>
                </div>

                {/* Bio Section */}
                {data.client?.user_id?.bio && (
                  <div className="mt-3">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.sm }}>
                      Bio
                    </h6>
                    <div style={{
                      background: designSystem.colors.gray[100],
                      padding: designSystem.spacing.md,
                      borderRadius: designSystem.borderRadius.button,
                      fontSize: '14px',
                      lineHeight: '1.6'
                    }}>
                      {data.client.user_id.bio}
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                {data.client?.notes && (
                  <div className="mt-3">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.sm }}>
                      CRM Notes
                    </h6>
                    <div style={{
                      background: '#fff3cd',
                      padding: designSystem.spacing.md,
                      borderRadius: designSystem.borderRadius.button,
                      fontSize: '14px',
                      border: '1px solid #ffc107'
                    }}>
                      {data.client.notes}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {data.client?.tags && data.client.tags.length > 0 && (
                  <div className="mt-3">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.sm }}>
                      Tags
                    </h6>
                    <div style={{ display: 'flex', gap: designSystem.spacing.xs, flexWrap: 'wrap' }}>
                      {data.client.tags.map((tag, index) => (
                        <span key={index} style={{
                          ...componentStyles.badge,
                          background: '#8b5cf6',
                          color: 'white'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md, marginTop: designSystem.spacing.lg }}>
                  Project Information
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Project ID:</strong> {data.project_id || `#${data._id.slice(-8).toUpperCase()}`}</p>
                    <p><strong>Service:</strong> {data.service?.name || data.service_name || 'N/A'}</p>
                    <p><strong>Priority:</strong> <span style={{
                      color: data.priority === 'high' ? '#ef4444' : data.priority === 'medium' ? '#f59e0b' : '#10b981',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>● {data.priority || 'Medium'}</span></p>
                    <p><strong>Due Date:</strong> {data.due_date ? new Date(data.due_date).toLocaleDateString() : 'Not set'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Status:</strong> <span style={{
                      ...componentStyles.badge,
                      background: getStatusBadgeStyle(data.status).background,
                      color: getStatusBadgeStyle(data.status).color
                    }}>{data.status.replace('_', ' ').toUpperCase()}</span></p>
                    <p><strong>Progress:</strong> {data.progress || 0}%</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="row">
                  <div className="col-md-6">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Project Information
                    </h6>
                    <p><strong>Project ID:</strong> {data.project_id || `#${data._id.slice(-8).toUpperCase()}`}</p>
                    <p><strong>Service:</strong> {data.service?.name || data.service_name || 'N/A'}</p>
                    <p><strong>Client:</strong> {data.client?.name || `${data.client?.firstName || ''} ${data.client?.lastName || ''}`.trim() || 'N/A'}</p>
                    <p><strong>Priority:</strong> <span style={{
                      color: data.priority === 'high' ? '#ef4444' : data.priority === 'medium' ? '#f59e0b' : '#10b981',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>● {data.priority || 'Medium'}</span></p>
                    {data.start_date && (
                      <p><strong>Start Date:</strong> {new Date(data.start_date).toLocaleDateString()}</p>
                    )}
                    <p><strong>Due Date:</strong> {data.due_date ? new Date(data.due_date).toLocaleDateString() : 'Not set'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Status & Progress
                    </h6>
                    <div className="mb-3">
                      <label className="form-label"><strong>Status:</strong></label>
                      <select 
                        className="form-select"
                        value={newStatus}
                        onChange={(e) => handleStatusChange(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label"><strong>Progress: {newProgress}%</strong></label>
                      <input 
                        type="range"
                        className="form-range"
                        min="0"
                        max="100"
                        value={newProgress}
                        onChange={(e) => setNewProgress(parseInt(e.target.value))}
                      />
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">0%</small>
                        <small className="text-muted">50%</small>
                        <small className="text-muted">100%</small>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Assignment Notes from CRM Manager */}
                {data.pm_assignment_notes && (
                  <div style={{ marginTop: designSystem.spacing.lg }}>
                    <h6 style={{ 
                      color: designSystem.colors.dark, 
                      marginBottom: designSystem.spacing.md,
                      borderBottom: `2px solid #3b82f6`,
                      paddingBottom: designSystem.spacing.xs
                    }}>
                      <i className="fas fa-clipboard-list me-2"></i>Assignment Notes from CRM Manager
                    </h6>
                    <div style={{
                      padding: designSystem.spacing.md,
                      background: '#eff6ff',
                      borderRadius: designSystem.borderRadius.button,
                      border: '1px solid #93c5fd',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: designSystem.colors.dark
                    }}>
                      {data.pm_assignment_notes}
                    </div>
                  </div>
                )}

                {/* Task Files from CRM Manager */}
                {data.task_files && data.task_files.length > 0 && (
                  <div style={{ marginTop: designSystem.spacing.lg }}>
                    <h6 style={{ 
                      color: designSystem.colors.dark, 
                      marginBottom: designSystem.spacing.md,
                      borderBottom: `2px solid #1565c0`,
                      paddingBottom: designSystem.spacing.xs
                    }}>
                      <i className="fas fa-folder-open me-2"></i>Task Files from CRM Manager
                    </h6>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.sm }}>
                      {data.task_files
                        .filter(file => file.uploaded_by_role === 'crm_manager')
                        .map((file, index) => (
                          <div key={index} style={{
                            padding: designSystem.spacing.sm,
                            background: '#e3f2fd',
                            borderRadius: designSystem.borderRadius.button,
                            border: `1px solid #90caf9`,
                            borderLeft: `4px solid #1976d2`
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                  <i className="fas fa-file me-2" style={{ color: '#1976d2', fontSize: '14px' }}></i>
                                  <strong style={{ fontSize: '14px', color: '#1565c0' }}>
                                    {file.originalname}
                                  </strong>
                                </div>
                                {file.note && (
                                  <div style={{ marginBottom: '6px', fontSize: '13px' }}>
                                    <small style={{ color: designSystem.colors.gray[600], fontWeight: '600' }}>Notes: </small>
                                    <small style={{ color: designSystem.colors.gray[600] }}>{file.note}</small>
                                  </div>
                                )}
                                <div style={{ display: 'flex', gap: designSystem.spacing.md, fontSize: '11px' }}>
                                  <span style={{ color: designSystem.colors.gray[500] }}>
                                    <i className="fas fa-calendar me-1"></i>
                                    {new Date(file.uploaded_at).toLocaleDateString()}
                                  </span>
                                  <span style={{ color: designSystem.colors.gray[500] }}>
                                    <i className="fas fa-clock me-1"></i>
                                    {new Date(file.uploaded_at).toLocaleTimeString()}
                                  </span>
                                  {file.size && (
                                    <span style={{ color: designSystem.colors.gray[500] }}>
                                      <i className="fas fa-file-alt me-1"></i>
                                      {(file.size / 1024).toFixed(2)} KB
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <a
                                  href={`${process.env.REACT_APP_API_URL?.replace('/api', '')}/${file.path}`}
                                  download={file.originalname}
                                  style={{
                                    background: '#1976d2',
                                    color: 'white',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer'
                                  }}
                                  title="Download file"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const fileUrl = `${process.env.REACT_APP_API_URL?.replace('/api', '')}/${file.path}`;
                                    fetch(fileUrl)
                                      .then(response => response.blob())
                                      .then(blob => {
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.style.display = 'none';
                                        a.href = url;
                                        a.download = file.originalname;
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
                                >
                                  <i className="fas fa-download"></i>
                                  Download
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    <div style={{
                      marginTop: designSystem.spacing.sm,
                      padding: designSystem.spacing.sm,
                      background: '#e3f2fd',
                      borderRadius: designSystem.borderRadius.button,
                      border: '1px solid #1976d2'
                    }}>
                      <small style={{ color: '#0d47a1', fontSize: '12px' }}>
                        <i className="fas fa-info-circle me-1"></i>
                        <strong>Total Task Files:</strong> {data.task_files.filter(f => f.uploaded_by_role === 'crm_manager').length} file(s) provided by CRM Manager for this project
                      </small>
                    </div>
                  </div>
                )}

                {/* Final Files History */}
                {data.final_files && data.final_files.length > 0 && (
                  <div style={{ marginTop: designSystem.spacing.lg }}>
                    <h6 style={{ 
                      color: designSystem.colors.dark, 
                      marginBottom: designSystem.spacing.md,
                      borderBottom: `2px solid #10b981`,
                      paddingBottom: designSystem.spacing.xs
                    }}>
                      <i className="fas fa-file-download me-2"></i>Final Files Sent to CRM
                    </h6>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.sm }}>
                      {data.final_files.map((file, index) => {
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
                            default: return 'Sent';
                          }
                        };

                        return (
                        <div key={index} style={{
                          padding: designSystem.spacing.sm,
                          background: '#f0fdf4',
                          borderRadius: designSystem.borderRadius.button,
                          border: `1px solid #86efac`,
                          borderLeft: `4px solid ${getStatusColor(file.approval_status || 'pending')}`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                <i className="fas fa-file me-2" style={{ color: '#10b981', fontSize: '14px' }}></i>
                                <strong style={{ fontSize: '14px', color: designSystem.colors.dark }}>
                                  {file.originalName}
                                </strong>
                              </div>
                              {file.notes && (
                                <div style={{ marginBottom: '6px', fontSize: '13px' }}>
                                  <small style={{ color: designSystem.colors.gray[600], fontWeight: '600' }}>Notes: </small>
                                  <small style={{ color: designSystem.colors.gray[600] }}>{file.notes}</small>
                                </div>
                              )}
                              {file.rejection_reason && (
                                <div style={{ marginBottom: '6px', padding: '6px', background: '#fee2e2', borderRadius: '4px' }}>
                                  <small style={{ color: '#991b1b', fontWeight: '600' }}>Rejection Reason: </small>
                                  <small style={{ color: '#991b1b' }}>{file.rejection_reason}</small>
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: designSystem.spacing.md, fontSize: '11px' }}>
                                <span style={{ color: designSystem.colors.gray[500] }}>
                                  <i className="fas fa-calendar me-1"></i>
                                  {new Date(file.uploaded_at).toLocaleDateString()}
                                </span>
                                <span style={{ color: designSystem.colors.gray[500] }}>
                                  <i className="fas fa-clock me-1"></i>
                                  {new Date(file.uploaded_at).toLocaleTimeString()}
                                </span>
                                <span style={{ color: designSystem.colors.gray[500] }}>
                                  <i className="fas fa-file-alt me-1"></i>
                                  {(file.size / 1024).toFixed(2)} KB
                                </span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <a
                                href={`${process.env.REACT_APP_API_URL?.replace('/api', '')}/${file.path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  background: '#0ea5e9',
                                  color: 'white',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
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
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                              }}>
                                {getStatusText(file.approval_status || 'pending')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                    
                    <div style={{
                      marginTop: designSystem.spacing.sm,
                      padding: designSystem.spacing.sm,
                      background: '#e0f2fe',
                      borderRadius: designSystem.borderRadius.button,
                      border: '1px solid #0ea5e9'
                    }}>
                      <small style={{ color: '#0369a1', fontSize: '12px' }}>
                        <i className="fas fa-info-circle me-1"></i>
                        <strong>Total Files Sent:</strong> {data.final_files.length} file(s) uploaded and shared with CRM Manager
                      </small>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            {type === 'view' && (
              <button type="button" className="btn btn-primary" onClick={handleStatusUpdate}>
                <i className="fas fa-save me-2"></i>Update Status & Progress
              </button>
            )}
            {type === 'client' && (
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsManagement;