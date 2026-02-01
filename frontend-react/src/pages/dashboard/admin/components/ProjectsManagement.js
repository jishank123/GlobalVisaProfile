import { useState, useEffect } from 'react';
import { projectsAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';
import ProjectModal from './ProjectModal';

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    loadProjectsManagement();
  }, []);

  const loadProjectsManagement = async () => {
    try {
      setLoading(true);
      
      const response = await projectsAPI.getAll();
      
      if (response.success) {
        setProjects(response.data || []);
      } else {
        throw new Error(response.error?.message || 'Failed to load projects');
      }

    } catch (error) {
      console.error('Error loading projects management:', error);
      setProjects([]);
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

  const viewProjectTasks = (project) => {
    setModalData(project);
    setModalType('tasks');
    setShowModal(true);
  };

  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    // Admin view-only - no editing allowed
    console.log('Admin view-only mode - editing disabled');
  };

  const handleUpdateProgress = async (projectId, progress) => {
    // Admin view-only - no editing allowed
    console.log('Admin view-only mode - editing disabled');
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
            No {projectType === 'all' ? '' : projectType} projects found
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
              <th style={componentStyles.tableHeaderCell}>Lead Manager</th>
              <th style={componentStyles.tableHeaderCell}>CRM Manager</th>
              <th style={componentStyles.tableHeaderCell}>Service</th>
              <th style={componentStyles.tableHeaderCell}>Status</th>
              <th style={componentStyles.tableHeaderCell}>Priority</th>
              <th style={componentStyles.tableHeaderCell}>Progress</th>
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
                    {project.lead_manager ? (
                      <div>
                        <div style={{ 
                          fontWeight: designSystem.typography.fontWeight.medium,
                          marginBottom: '2px'
                        }}>
                          {project.lead_manager.first_name} {project.lead_manager.last_name}
                        </div>
                        <small style={{ color: designSystem.colors.gray[500] }}>
                          Lead Manager
                        </small>
                      </div>
                    ) : (
                      <span style={{ 
                        color: designSystem.colors.gray[500],
                        fontStyle: 'italic'
                      }}>
                        No Lead Manager
                      </span>
                    )}
                  </td>
                  <td style={componentStyles.tableCell}>
                    {project.assigned_to ? (
                      <div>
                        <div style={{ 
                          fontWeight: designSystem.typography.fontWeight.medium,
                          marginBottom: '2px'
                        }}>
                          {project.assigned_to.first_name} {project.assigned_to.last_name}
                        </div>
                        <small style={{ color: designSystem.colors.gray[500] }}>
                          CRM Manager
                        </small>
                      </div>
                    ) : (
                      <span style={{ 
                        color: designSystem.colors.gray[500],
                        fontStyle: 'italic'
                      }}>
                        Unassigned
                      </span>
                    )}
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
                        onClick={() => viewProjectTasks(project)}
                        title="View Project Tasks"
                      >
                        <i className="fas fa-tasks"></i>
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
            <h4 style={componentStyles.headerTitle}>Projects Management</h4>
            <p style={componentStyles.headerSubtitle}>View all projects with associated managers and clients</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={loadProjectsManagement}
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
          label="Total Projects"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
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
          <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading projects...</p>
        </div>
      )}

      {/* Project Type Tabs */}
      {!loading && (
        <>
          <div style={{ marginBottom: designSystem.spacing.lg }}>
            <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
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
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>No projects found in the system</h6>
          <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.lg }}>Projects will appear here once they are created</p>
        </div>
      )}

      {/* Project Details Modal */}
      {showModal && (
        <ProjectModal
          show={showModal}
          onHide={handleModalClose}
          type={modalType}
          data={modalData}
          onUpdateStatus={handleUpdateProjectStatus}
          onUpdateProgress={handleUpdateProgress}
        />
      )}
    </div>
  );
};

export default ProjectsManagement;