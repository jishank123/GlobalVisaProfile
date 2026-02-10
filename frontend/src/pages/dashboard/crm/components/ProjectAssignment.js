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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

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
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
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
                        title="Assign to Project Manager"
                      >
                        <i className="fas fa-user-plus me-1"></i>
                        {project.project_manager ? 'Reassign' : 'Assign PM'}
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
    </div>
  );
};

export default ProjectAssignment;
