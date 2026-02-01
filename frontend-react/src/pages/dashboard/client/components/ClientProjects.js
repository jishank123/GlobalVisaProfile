import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects, getStatusBadgeStyle } from '../../../../styles/designSystem';

const ClientProjects = ({ clientData, apiCall, onRefresh }) => {
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/projects?client=' + clientData?.email);
      if (response.success) {
        setProjects(response.data || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProjects = () => {
    if (activeTab === 'all') return projects;
    return projects.filter(project => {
      switch (activeTab) {
        case 'pending':
          return project.status === 'pending' || project.status === 'planning';
        case 'active':
          return project.status === 'in_progress' || project.status === 'active';
        case 'completed':
          return project.status === 'completed';
        default:
          return true;
      }
    });
  };

  const getProjectCounts = () => {
    return {
      total: projects.length,
      pending: projects.filter(p => p.status === 'pending' || p.status === 'planning').length,
      active: projects.filter(p => p.status === 'in_progress' || p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length
    };
  };

  const getStatusBadgeStyle = (status) => {
    const statusStyles = {
      'pending': { background: '#f59e0b', color: 'white' },
      'planning': { background: '#f59e0b', color: 'white' },
      'in_progress': { background: '#3b82f6', color: 'white' },
      'active': { background: '#3b82f6', color: 'white' },
      'on_hold': { background: '#ef4444', color: 'white' },
      'completed': { background: '#10b981', color: 'white' },
      'cancelled': { background: '#6b7280', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
  };

  const getProgressBarColor = (progress) => {
    if (progress >= 80) return '#10b981';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const ProjectCard = ({ project }) => (
    <div
      style={{
        ...componentStyles.managementCard,
        margin: 0,
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      {...hoverEffects.card}
      onClick={() => {
        setSelectedProject(project);
        setShowModal(true);
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: designSystem.spacing.md
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: designSystem.spacing.sm
          }}>
            <span style={{
              ...componentStyles.badge,
              background: designSystem.colors.primary,
              color: 'white',
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: '600',
              marginRight: designSystem.spacing.sm
            }}>
              {project.project_id || `#${project._id.slice(-8).toUpperCase()}`}
            </span>
            <span style={{
              ...componentStyles.badge,
              ...getStatusBadgeStyle(project.status),
              textTransform: 'uppercase',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
          
          <h5 style={{
            color: designSystem.colors.dark,
            fontWeight: designSystem.typography.fontWeight.semibold,
            marginBottom: designSystem.spacing.sm
          }}>
            {project.service?.name || project.service_name || 'Immigration Service'}
          </h5>
          
          <p style={{
            color: designSystem.colors.gray[600],
            fontSize: designSystem.typography.fontSize.sm,
            marginBottom: designSystem.spacing.md
          }}>
            {project.description || 'Professional immigration service tailored to your needs'}
          </p>
        </div>
        
        <div style={{
          textAlign: 'right',
          marginLeft: designSystem.spacing.md
        }}>
          <div style={{
            fontSize: designSystem.typography.fontSize.lg,
            fontWeight: designSystem.typography.fontWeight.bold,
            color: designSystem.colors.success.split('(')[0],
            marginBottom: '4px'
          }}>
            ${project.amount?.toLocaleString() || '0'}
          </div>
          <div style={{
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.gray[500]
          }}>
            Total Amount
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: designSystem.spacing.md }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: designSystem.spacing.xs
        }}>
          <span style={{
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.medium,
            color: designSystem.colors.dark
          }}>
            Progress
          </span>
          <span style={{
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.bold,
            color: getProgressBarColor(project.progress || 0)
          }}>
            {project.progress || 0}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: designSystem.colors.gray[200],
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              width: `${project.progress || 0}%`,
              height: '100%',
              background: getProgressBarColor(project.progress || 0),
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Project Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: designSystem.spacing.md,
        marginBottom: designSystem.spacing.md
      }}>
        <div>
          <div style={{
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.gray[500],
            marginBottom: '2px'
          }}>
            CRM Manager
          </div>
          <div style={{
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.medium,
            color: designSystem.colors.dark
          }}>
            {project.assigned_to?.first_name && project.assigned_to?.last_name 
              ? `${project.assigned_to.first_name} ${project.assigned_to.last_name}`
              : 'Not Assigned'}
          </div>
        </div>
        <div>
          <div style={{
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.gray[500],
            marginBottom: '2px'
          }}>
            Due Date
          </div>
          <div style={{
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.medium,
            color: project.due_date && new Date(project.due_date) < new Date() 
              ? designSystem.colors.danger.split('(')[0] 
              : designSystem.colors.dark
          }}>
            {project.due_date 
              ? new Date(project.due_date).toLocaleDateString()
              : 'Not Set'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: designSystem.spacing.sm,
        paddingTop: designSystem.spacing.md,
        borderTop: `1px solid ${designSystem.colors.gray[200]}`
      }}>
        <button
          style={{
            ...componentStyles.primaryButton,
            flex: 1,
            background: designSystem.colors.primary,
            fontSize: designSystem.typography.fontSize.sm
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProject(project);
            setShowModal(true);
          }}
          {...hoverEffects.button}
        >
          <i className="fas fa-eye me-2"></i>View Details
        </button>
        <button
          style={{
            ...componentStyles.secondaryButton,
            fontSize: designSystem.typography.fontSize.sm
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Contact CRM manager functionality
          }}
          {...hoverEffects.button}
        >
          <i className="fas fa-envelope me-2"></i>Contact Manager
        </button>
      </div>
    </div>
  );

  const ProjectModal = () => (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-project-diagram me-2"></i>
              Project Details - {selectedProject?.project_id || `#${selectedProject?._id.slice(-8).toUpperCase()}`}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowModal(false)}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {selectedProject && (
              <div>
                {/* Project Overview */}
                <div className="row mb-4">
                  <div className="col-md-8">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Project Information
                    </h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Service:</strong> {selectedProject.service?.name || selectedProject.service_name}</p>
                        <p><strong>Status:</strong> 
                          <span style={{
                            ...componentStyles.badge,
                            ...getStatusBadgeStyle(selectedProject.status),
                            marginLeft: '8px'
                          }}>
                            {selectedProject.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </p>
                        <p><strong>Progress:</strong> {selectedProject.progress || 0}%</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Amount:</strong> ${selectedProject.amount?.toLocaleString() || '0'}</p>
                        <p><strong>Start Date:</strong> {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : 'Not Set'}</p>
                        <p><strong>Due Date:</strong> {selectedProject.due_date ? new Date(selectedProject.due_date).toLocaleDateString() : 'Not Set'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Assigned Team
                    </h6>
                    <div style={{
                      background: designSystem.colors.light,
                      padding: designSystem.spacing.md,
                      borderRadius: designSystem.borderRadius.button
                    }}>
                      <div style={{ marginBottom: designSystem.spacing.sm }}>
                        <strong>CRM Manager:</strong>
                        <div style={{ color: designSystem.colors.gray[600] }}>
                          {selectedProject.assigned_to?.first_name && selectedProject.assigned_to?.last_name 
                            ? `${selectedProject.assigned_to.first_name} ${selectedProject.assigned_to.last_name}`
                            : 'Not Assigned'}
                        </div>
                        {selectedProject.assigned_to?.email && (
                          <div style={{ 
                            fontSize: designSystem.typography.fontSize.sm,
                            color: designSystem.colors.gray[500]
                          }}>
                            {selectedProject.assigned_to.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Tasks/Milestones */}
                <div className="mb-4">
                  <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                    Project Milestones
                  </h6>
                  {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                    <div>
                      {selectedProject.milestones.map((milestone, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: designSystem.spacing.md,
                          border: `1px solid ${designSystem.colors.gray[200]}`,
                          borderRadius: designSystem.borderRadius.button,
                          marginBottom: designSystem.spacing.sm
                        }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: milestone.status === 'completed' 
                              ? designSystem.colors.success 
                              : designSystem.colors.gray[300],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: designSystem.spacing.md
                          }}>
                            {milestone.status === 'completed' && (
                              <i className="fas fa-check" style={{ fontSize: '10px', color: 'white' }}></i>
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                              {milestone.title}
                            </div>
                            {milestone.target_date && (
                              <div style={{ 
                                fontSize: designSystem.typography.fontSize.sm,
                                color: designSystem.colors.gray[500]
                              }}>
                                Target: {new Date(milestone.target_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <span style={{
                            ...componentStyles.badge,
                            background: milestone.status === 'completed' 
                              ? designSystem.colors.success 
                              : milestone.status === 'in_progress'
                              ? designSystem.colors.primary
                              : designSystem.colors.warning,
                            color: 'white'
                          }}>
                            {milestone.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={componentStyles.emptyState}>
                      <i className="fas fa-tasks fa-2x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.sm }}></i>
                      <p style={{ color: designSystem.colors.gray[500] }}>No milestones defined yet</p>
                    </div>
                  )}
                </div>

                {/* Project Notes */}
                {selectedProject.notes && selectedProject.notes.length > 0 && (
                  <div>
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Project Notes
                    </h6>
                    <div style={{
                      background: designSystem.colors.light,
                      padding: designSystem.spacing.md,
                      borderRadius: designSystem.borderRadius.button,
                      border: `1px solid ${designSystem.colors.gray[200]}`
                    }}>
                      {selectedProject.notes.map((note, index) => (
                        <div key={index} style={{
                          marginBottom: index < selectedProject.notes.length - 1 ? designSystem.spacing.md : 0,
                          paddingBottom: index < selectedProject.notes.length - 1 ? designSystem.spacing.md : 0,
                          borderBottom: index < selectedProject.notes.length - 1 ? `1px solid ${designSystem.colors.gray[200]}` : 'none'
                        }}>
                          <div style={{
                            fontSize: designSystem.typography.fontSize.sm,
                            color: designSystem.colors.gray[600],
                            marginBottom: '4px'
                          }}>
                            {new Date(note.created_at).toLocaleDateString()} - Team Update
                          </div>
                          <div>{note.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => {
                // Contact manager functionality
              }}
            >
              <i className="fas fa-envelope me-2"></i>Contact Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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

  if (loading) {
    return (
      <div style={componentStyles.loading}>
        <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
        <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>
          Loading your projects...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Refresh Button */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-project-diagram fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>My Projects</h4>
            <p style={componentStyles.headerSubtitle}>Track your immigration projects and their progress</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={() => {
            loadProjects();
            onRefresh?.();
          }}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Project Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-project-diagram"
          number={getProjectCounts().total}
          label="Total Projects"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
        <StatCard
          icon="fas fa-clock"
          number={getProjectCounts().pending}
          label="Pending Projects"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-play-circle"
          number={getProjectCounts().active}
          label="Active Projects"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={getProjectCounts().completed}
          label="Completed Projects"
          borderColor="#10b981"
          iconColor="#10b981"
        />
      </div>

      {/* Project Tabs */}
      <div style={{ marginBottom: designSystem.spacing.lg }}>
        <div style={{ display: 'flex', gap: designSystem.spacing.xs, flexWrap: 'wrap' }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'all' ? designSystem.colors.primary : designSystem.colors.gray[100],
              color: activeTab === 'all' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('all')}
            {...hoverEffects.button}
          >
            All Projects ({getProjectCounts().total})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'pending' ? '#f59e0b' : designSystem.colors.gray[100],
              color: activeTab === 'pending' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('pending')}
            {...hoverEffects.button}
          >
            Pending ({getProjectCounts().pending})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'active' ? '#3b82f6' : designSystem.colors.gray[100],
              color: activeTab === 'active' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('active')}
            {...hoverEffects.button}
          >
            Active ({getProjectCounts().active})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'completed' ? '#10b981' : designSystem.colors.gray[100],
              color: activeTab === 'completed' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('completed')}
            {...hoverEffects.button}
          >
            Completed ({getProjectCounts().completed})
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {getFilteredProjects().length === 0 ? (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-project-diagram fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>
            No {activeTab === 'all' ? '' : activeTab} projects found
          </h6>
          <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.lg }}>
            {activeTab === 'all' 
              ? 'You haven\'t started any projects yet. Browse our services to get started!'
              : `You don't have any ${activeTab} projects at the moment.`}
          </p>
          {activeTab === 'all' && (
            <button
              style={componentStyles.primaryButton}
              onClick={() => window.location.hash = '#services'}
              {...hoverEffects.button}
            >
              <i className="fas fa-shopping-cart me-2"></i>Browse Services
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: designSystem.spacing.lg
        }}>
          {getFilteredProjects().map(project => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}

      {/* Project Details Modal */}
      {showModal && <ProjectModal />}
    </div>
  );
};

export default ClientProjects;