import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects, getStatusBadgeStyle } from '../../../../styles/designSystem';

const ClientProjects = ({ clientData, apiCall, onRefresh }) => {
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalType, setModalType] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onHold: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    if (clientData?.email) {
      loadProjects();
    }
  }, [clientData]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      if (!clientData?.email) {
        setLoading(false);
        return;
      }
      
      // Test multiple API endpoints to see which one works
      const testEndpoints = [
        '/projects?client=' + clientData.email,
        '/projects?clientEmail=' + clientData.email,
        '/projects/client/' + clientData.email,
        '/projects'
      ];
      
      for (const endpoint of testEndpoints) {
        try {
          const response = await apiCall(endpoint);
          
          if (response.success && response.data) {
            // Filter client projects if needed
            let clientProjects = response.data || [];
            
            // If we used the general /projects endpoint, filter by client email
            if (endpoint === '/projects') {
              clientProjects = clientProjects.filter(project => {
                const matches = project.client?.email === clientData.email || 
                               project.clientEmail === clientData.email ||
                               project.client_email === clientData.email;
                return matches;
              });
            }
            
            setProjects(clientProjects);
            
            // Calculate stats
            const stats = {
              total: clientProjects.length,
              active: clientProjects.filter(p => p.status === 'active').length,
              onHold: clientProjects.filter(p => p.status === 'on_hold').length,
              pending: clientProjects.filter(p => p.status === 'pending').length,
              completed: clientProjects.filter(p => p.status === 'completed').length,
              cancelled: clientProjects.filter(p => p.status === 'cancelled').length
            };
            setStats(stats);
            return; // Exit the loop once we find a working endpoint
          }
        } catch (endpointError) {
          // Continue to next endpoint
        }
      }
      
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProjects = () => {
    if (activeTab === 'all') return projects;
    return projects.filter(project => project.status === activeTab);
  };

  const getProjectStatusStyle = (status) => {
    const statusStyles = {
      'pending': { background: '#f59e0b', color: 'white' },
      'active': { background: '#3b82f6', color: 'white' },
      'completed': { background: '#10b981', color: 'white' },
      'cancelled': { background: '#ef4444', color: 'white' },
      'on_hold': { background: '#6b7280', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
  };

  const getPriorityStyle = (priority) => {
    const priorityStyles = {
      'high': { background: '#ef4444', color: 'white' },
      'medium': { background: '#f59e0b', color: 'white' },
      'low': { background: '#10b981', color: 'white' }
    };
    return priorityStyles[priority] || { background: '#6b7280', color: 'white' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateProgress = (project) => {
    if (project.progress !== undefined) return project.progress;
    if (project.status === 'completed') return 100;
    if (project.status === 'active') return 50;
    return 0;
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'completed' || !dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Overview Stats Cards Component
  const StatsCard = ({ icon, number, label, color, bgColor, onClick }) => (
    <div 
      style={{
        ...componentStyles.managementCard,
        margin: 0,
        padding: designSystem.spacing.lg,
        background: bgColor,
        border: `2px solid ${color}`,
        textAlign: 'center',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
      {...(onClick ? hoverEffects.card : {})}
    >
      <i className={`${icon} fa-2x`} style={{ color: color, marginBottom: designSystem.spacing.sm }}></i>
      <h3 style={{ 
        color: color, 
        fontWeight: designSystem.typography.fontWeight.bold,
        marginBottom: '4px',
        fontSize: designSystem.typography.fontSize.xl
      }}>
        {number}
      </h3>
      <small style={{ color: designSystem.colors.gray[600], fontWeight: designSystem.typography.fontWeight.medium }}>
        {label}
      </small>
    </div>
  );

  const ProjectCard = ({ project }) => {
    const progress = calculateProgress(project);
    const overdue = isOverdue(project.due_date, project.status);

    return (
      <div
        style={{
          ...componentStyles.managementCard,
          margin: 0,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          border: overdue ? `2px solid ${designSystem.colors.danger}` : `1px solid ${designSystem.colors.gray[200]}`
        }}
        {...hoverEffects.card}
        onClick={() => {
          setSelectedProject(project);
          setModalType('view');
          setShowModal(true);
        }}
      >
        {/* Project Header */}
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
                {project.project_id || `#${project._id.slice(-6).toUpperCase()}`}
              </span>
              <span style={{
                ...componentStyles.badge,
                ...getProjectStatusStyle(project.status),
                textTransform: 'uppercase',
                fontSize: '11px',
                fontWeight: '600',
                marginRight: designSystem.spacing.sm
              }}>
                {project.status}
              </span>
              {/* <span style={{
                ...componentStyles.badge,
                ...getPriorityStyle(project.priority),
                textTransform: 'uppercase',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {project.priority} Priority
              </span> */}
            </div>
            
            <h6 style={{
              color: designSystem.colors.dark,
              fontWeight: designSystem.typography.fontWeight.semibold,
              marginBottom: designSystem.spacing.sm
            }}>
              {project.service_name || 'Project'}
            </h6>
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
            {overdue && (
              <div style={{
                fontSize: designSystem.typography.fontSize.xs,
                color: designSystem.colors.danger,
                fontWeight: designSystem.typography.fontWeight.medium
              }}>
                <i className="fas fa-exclamation-triangle me-1"></i>
                Overdue
              </div>
            )}
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
              color: designSystem.colors.gray[600]
            }}>
              Progress
            </span>
            <span style={{
              fontSize: designSystem.typography.fontSize.sm,
              fontWeight: designSystem.typography.fontWeight.medium,
              color: designSystem.colors.dark
            }}>
              {progress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: designSystem.colors.gray[200],
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: progress === 100 ? designSystem.colors.success : designSystem.colors.primary,
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Project Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: designSystem.spacing.sm,
          marginBottom: designSystem.spacing.md,
          fontSize: designSystem.typography.fontSize.sm,
          color: designSystem.colors.gray[600]
        }}>
          <div>
            <i className="fas fa-calendar-alt me-2"></i>
            Start: {formatDate(project.start_date)}
          </div>
          <div>
            <i className="fas fa-calendar-check me-2"></i>
            Due: {formatDate(project.due_date)}
          </div>
          <div>
            <i className="fas fa-tasks me-2"></i>
            Milestones: {project.milestones?.length || 0}
          </div>
          <div>
            <i className="fas fa-file me-2"></i>
            Files: {project.final_files?.filter(f => f.approval_status === 'approved').length || 0}
          </div>
        </div>
      </div>
    );
  };

  const ProjectDetailModal = () => (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-project-diagram me-2"></i>
              Project Details - {selectedProject?.project_id || 'Project'}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowModal(false)}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {selectedProject && (
              <>
                {/* Project Overview */}
                <div style={{ marginBottom: designSystem.spacing.lg }}>
                  <h6 style={{ marginBottom: designSystem.spacing.md, color: '#3b82f6', fontWeight: '600' }}>Project Overview</h6>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: designSystem.spacing.md,
                    padding: designSystem.spacing.md,
                    background: designSystem.colors.light,
                    borderRadius: designSystem.borderRadius.button
                  }}>
                    <div>
                      <strong>Service:</strong> {selectedProject.service_name}
                    </div>
                    <div>
                      <strong>Status:</strong> <span style={{
                        ...componentStyles.badge,
                        ...getProjectStatusStyle(selectedProject.status)
                      }}>
                        {selectedProject.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <strong>Progress:</strong> {calculateProgress(selectedProject)}%
                    </div>
                    <div>
                      <strong>Amount:</strong> ${selectedProject.amount?.toLocaleString()}
                    </div>
                    <div>
                      <strong>Start Date:</strong> {formatDate(selectedProject.start_date)}
                    </div>
                    <div>
                      <strong>Due Date:</strong> {formatDate(selectedProject.due_date)}
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                <div style={{ marginBottom: designSystem.spacing.lg }}>
                  <h6 style={{ marginBottom: designSystem.spacing.md, color: '#3b82f6', fontWeight: '600' }}>
                    Milestones ({selectedProject.milestones?.length || 0})
                  </h6>
                  {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.sm }}>
                      {selectedProject.milestones.map((milestone, index) => (
                        <div key={index} style={{
                          padding: designSystem.spacing.md,
                          background: designSystem.colors.light,
                          borderRadius: designSystem.borderRadius.button,
                          border: `1px solid ${designSystem.colors.gray[200]}`
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: designSystem.spacing.sm
                          }}>
                            <h6 style={{ margin: 0, color: designSystem.colors.dark }}>
                              {milestone.title}
                            </h6>
                            <span style={{
                              ...componentStyles.badge,
                              ...getProjectStatusStyle(milestone.status)
                            }}>
                              {milestone.status.toUpperCase()}
                            </span>
                          </div>
                          {milestone.target_date && (
                            <div style={{
                              fontSize: designSystem.typography.fontSize.sm,
                              color: designSystem.colors.gray[600],
                              marginBottom: designSystem.spacing.xs
                            }}>
                              <i className="fas fa-calendar me-2"></i>
                              Target: {formatDate(milestone.target_date)}
                            </div>
                          )}
                          {milestone.completion_date && (
                            <div style={{
                              fontSize: designSystem.typography.fontSize.sm,
                              color: designSystem.colors.success.split('(')[0],
                              marginBottom: designSystem.spacing.xs
                            }}>
                              <i className="fas fa-check me-2"></i>
                              Completed: {formatDate(milestone.completion_date)}
                            </div>
                          )}
                          {milestone.notes && (
                            <p style={{
                              fontSize: designSystem.typography.fontSize.sm,
                              color: designSystem.colors.gray[600],
                              margin: 0,
                              fontStyle: 'italic'
                            }}>
                              {milestone.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: designSystem.spacing.lg,
                      background: designSystem.colors.light,
                      borderRadius: designSystem.borderRadius.button,
                      textAlign: 'center',
                      color: designSystem.colors.gray[500]
                    }}>
                      <i className="fas fa-tasks fa-2x mb-3"></i>
                      <p>No milestones added yet</p>
                    </div>
                  )}
                </div>

                {/* Final Files (Approved) */}
                <div style={{ marginBottom: designSystem.spacing.lg }}>
                  <h6 style={{ marginBottom: designSystem.spacing.md, color: '#3b82f6', fontWeight: '600' }}>
                    Final Files ({selectedProject.final_files?.filter(f => f.approval_status === 'approved').length || 0})
                  </h6>
                  {selectedProject.final_files && selectedProject.final_files.filter(f => f.approval_status === 'approved').length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.sm }}>
                      {selectedProject.final_files
                        .filter(file => file.approval_status === 'approved')
                        .map((file, index) => (
                        <div key={index} style={{
                          padding: designSystem.spacing.md,
                          background: '#f0fdf4',
                          borderRadius: designSystem.borderRadius.button,
                          border: `1px solid #86efac`,
                          borderLeft: `4px solid #10b981`
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                          }}>
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
                              <div style={{ 
                                display: 'flex', 
                                gap: designSystem.spacing.md, 
                                fontSize: designSystem.typography.fontSize.xs, 
                                flexWrap: 'wrap',
                                color: designSystem.colors.gray[500]
                              }}>
                                <span>
                                  <i className="fas fa-user me-1"></i>
                                  Uploaded by: {file.uploaded_by?.first_name} {file.uploaded_by?.last_name}
                                </span>
                                <span>
                                  <i className="fas fa-calendar me-1"></i>
                                  {formatDate(file.uploaded_at)}
                                </span>
                                <span>
                                  <i className="fas fa-file-alt me-1"></i>
                                  {(file.size / 1024).toFixed(2)} KB
                                </span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', flexDirection: 'column' }}>
                              <button
                                onClick={async () => {
                                  try {
                                    const fileUrl = `${process.env.REACT_APP_API_URL?.replace('/api', '')}/${file.path}`;
                                    const response = await fetch(fileUrl);
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = file.originalName;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                  } catch (error) {
                                    console.error('Error downloading file:', error);
                                    alert('Failed to download file. Please try again.');
                                  }
                                }}
                                style={{
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                                  transition: 'all 0.2s ease',
                                  cursor: 'pointer'
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
                                title="Download file"
                              >
                                <i className="fas fa-download"></i>
                                Download
                              </button>
                              <span style={{
                                background: '#10b981',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                              }}>
                                <i className="fas fa-check-circle me-1"></i>
                                Approved
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: designSystem.spacing.lg,
                      background: designSystem.colors.light,
                      borderRadius: designSystem.borderRadius.button,
                      textAlign: 'center',
                      color: designSystem.colors.gray[500]
                    }}>
                      <i className="fas fa-file-download fa-2x mb-3"></i>
                      <p>No approved files available yet</p>
                    </div>
                  )}
                </div>
              </>
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
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={componentStyles.loading}>
        <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
        <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>
          Loading projects...
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
            <p style={componentStyles.headerSubtitle}>Track your project progress and milestones</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.primary
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

      {/* Overview Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: designSystem.spacing.lg,
        marginBottom: designSystem.spacing.xl
      }}>
        <StatsCard
          icon="fas fa-play-circle"
          number={stats.active}
          label="Active Projects"
          color="#10b981"
          bgColor="#ecfdf5"
        />
        <StatsCard
          icon="fas fa-clock"
          number={stats.pending}
          label="Pending Projects"
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <StatsCard
          icon="fas fa-pause-circle"
          number={stats.onHold}
          label="Hold Projects"
          color="#ef4444"
          bgColor="#fef2f2"
        />
        <StatsCard
          icon="fas fa-check-circle"
          number={stats.completed}
          label="Completed Projects"
          color="#8b5cf6"
          bgColor="#faf5ff"
        />
      </div>

      {/* Tab Navigation */}
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
            All Projects ({stats.total})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'pending' ? designSystem.colors.warning : designSystem.colors.gray[100],
              color: activeTab === 'pending' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('pending')}
            {...hoverEffects.button}
          >
            Pending ({stats.pending})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'active' ? designSystem.colors.success : designSystem.colors.gray[100],
              color: activeTab === 'active' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('active')}
            {...hoverEffects.button}
          >
            Active ({stats.active})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'on_hold' ? '#ef4444' : designSystem.colors.gray[100],
              color: activeTab === 'on_hold' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('on_hold')}
            {...hoverEffects.button}
          >
            On Hold ({stats.onHold})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'completed' ? designSystem.colors.info : designSystem.colors.gray[100],
              color: activeTab === 'completed' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('completed')}
            {...hoverEffects.button}
          >
            Completed ({stats.completed})
          </button>
          {stats.cancelled > 0 && (
            <button 
              style={{
                ...componentStyles.primaryButton,
                background: activeTab === 'cancelled' ? designSystem.colors.danger : designSystem.colors.gray[100],
                color: activeTab === 'cancelled' ? 'white' : designSystem.colors.gray[600]
              }}
              onClick={() => setActiveTab('cancelled')}
              {...hoverEffects.button}
            >
              Cancelled ({stats.cancelled})
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: designSystem.spacing.lg
      }}>
        {getFilteredProjects().map(project => (
          <ProjectCard
            key={project._id}
            project={project}
          />
        ))}
      </div>

      {getFilteredProjects().length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-project-diagram fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
          <p style={{ color: designSystem.colors.gray[500] }}>
            {activeTab === 'all' ? 'No projects found' : `No ${activeTab} projects found`}
          </p>
          {activeTab === 'all' && (
            <p style={{ color: designSystem.colors.gray[500], fontSize: designSystem.typography.fontSize.sm }}>
              Purchase services to create projects
            </p>
          )}
        </div>
      )}

      {/* Project Detail Modal */}
      {showModal && <ProjectDetailModal />}
    </div>
  );
};

export default ClientProjects;