import { useState, useEffect } from 'react';
import { projectsAPI, clientsAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

// Helper function for status badge styling
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

const ProjectsManagement = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);

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
          return project.status === 'in_progress';
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
      active: projects.filter(project => project.status === 'in_progress').length,
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

  const viewClientDetails = async (project) => {
    try {
      // Fetch full client details from the clients collection
      if (project.client?._id || project.client?.id || project.client_id) {
        const clientId = project.client?._id || project.client?.id || project.client_id;
        console.log('🔄 Fetching full client details for ID:', clientId);
        
        const response = await clientsAPI.getById(clientId);
        
        if (response.success && response.data) {
          console.log('✅ Full client details fetched:', response.data);
          // Merge the full client data with the project data
          setModalData({
            ...project,
            client: response.data
          });
        } else {
          console.warn('⚠️ Could not fetch full client details, using basic info');
          setModalData(project);
        }
      } else {
        console.warn('⚠️ No client ID found in project');
        setModalData(project);
      }
      
      setModalType('client');
      setShowModal(true);
    } catch (error) {
      console.error('❌ Error fetching client details:', error);
      // Still show the modal with whatever data we have
      setModalData(project);
      setModalType('client');
      setShowModal(true);
    }
  };

  const handleUpdateProjectStatus = async (projectId, newStatus, newProgress) => {
    try {
      // Use the progress update endpoint which has better security logic
      // and automatically updates status based on progress
      if (newProgress !== undefined) {
        const response = await projectsAPI.updateProgress(projectId, newProgress);
        
        if (response.success) {
          loadAssignedProjects(); // Refresh the list
          alert('Project status and progress updated successfully!');
        } else {
          throw new Error(response.error?.message || 'Failed to update project');
        }
      } else {
        // If only status is being updated, we still need to use the general update
        // but we'll set a progress value that matches the status
        let progressValue;
        switch (newStatus) {
          case 'pending':
            progressValue = 0;
            break;
          case 'in_progress':
          case 'active':
            progressValue = 50; // Default to 50% for active projects
            break;
          case 'completed':
            progressValue = 100;
            break;
          default:
            progressValue = 25; // Default progress
        }
        
        const response = await projectsAPI.updateProgress(projectId, progressValue);
        
        if (response.success) {
          loadAssignedProjects(); // Refresh the list
          alert('Project status and progress updated successfully!');
        } else {
          throw new Error(response.error?.message || 'Failed to update project');
        }
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert(`Error updating project: ${error.message}`);
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
                    <div>
                      <div style={{ 
                        fontWeight: designSystem.typography.fontWeight.medium,
                        marginBottom: '2px'
                      }}>
                        {project.client?.name || 
                         (project.client?.firstName && project.client?.lastName ? 
                          `${project.client.firstName} ${project.client.lastName}` : 
                          'Unknown Client')}
                      </div>
                      <small style={{ color: designSystem.colors.gray[500] }}>
                        {project.client?.email || 'No email'}
                      </small>
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
                        className="btn btn-outline-info btn-sm"
                        onClick={() => viewClientDetails(project)}
                        title="View Client Details"
                      >
                        <i className="fas fa-user"></i>
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
          icon="fas fa-project-diagram"
          number={getProjectCounts().total}
          label="Total Assigned"
          borderColor="#0dcaf0"
          iconColor="#0dcaf0"
        />
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
      {showModal && (
        <ProjectDetailsModal
          show={showModal}
          onHide={handleModalClose}
          type={modalType}
          data={modalData}
          onUpdateStatus={handleUpdateProjectStatus}
          user={user}
        />
      )}
    </div>
  );
};

// Project Details Modal Component
const ProjectDetailsModal = ({ show, onHide, type, data, onUpdateStatus, user }) => {
  const [newStatus, setNewStatus] = useState(data?.status || '');
  const [newProgress, setNewProgress] = useState(data?.progress || 0);

  if (!show || !data) return null;

  const handleStatusUpdate = () => {
    if (newStatus !== data.status || newProgress !== data.progress) {
      onUpdateStatus(data._id, newStatus, newProgress);
    }
    onHide();
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
                    <p><strong>Status:</strong> <span style={{
                      ...componentStyles.badge,
                      background: getStatusBadgeStyle(data.status).background,
                      color: getStatusBadgeStyle(data.status).color
                    }}>{data.status.replace('_', ' ').toUpperCase()}</span></p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Amount:</strong> ${data.amount || 0}</p>
                    <p><strong>Paid Amount:</strong> ${data.paid_amount || 0}</p>
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
                    <p><strong>Amount:</strong> ${data.amount || 0}</p>
                    <p><strong>Paid Amount:</strong> ${data.paid_amount || 0}</p>
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
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
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
                    <p><strong>Priority:</strong> {data.priority || 'Medium'}</p>
                    <p><strong>Due Date:</strong> {data.due_date ? new Date(data.due_date).toLocaleDateString() : 'Not set'}</p>
                  </div>
                </div>
                

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