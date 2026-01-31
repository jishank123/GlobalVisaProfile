import { useState, useEffect } from 'react';
import { projectsAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects, getStatusBadgeStyle } from '../../../../styles/designSystem';

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    pendingProjects: 0,
    completedProjects: 0
  });

  useEffect(() => {
    loadProjectsData();
  }, []);

  const loadProjectsData = async () => {
    try {
      setLoading(true);
      
      // Load projects
      const projectsResponse = await projectsAPI.getAll();
      if (projectsResponse.success) {
        setProjects(projectsResponse.data || []);
      }

      // Load project statistics
      const statsResponse = await projectsAPI.getStats();
      if (statsResponse.success) {
        setStats({
          totalProjects: statsResponse.data.total || 0,
          activeProjects: statsResponse.data.byStatus?.find(s => s._id === 'active')?.count || 0,
          pendingProjects: statsResponse.data.byStatus?.find(s => s._id === 'pending')?.count || 0,
          completedProjects: statsResponse.data.byStatus?.find(s => s._id === 'completed')?.count || 0
        });
      }

    } catch (error) {
      console.error('Error loading projects data:', error);
      // Set empty state on error
      setProjects([]);
      setStats({ totalProjects: 0, activeProjects: 0, pendingProjects: 0, completedProjects: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityStyle = (priority) => {
    const priorityColors = {
      'low': designSystem.colors.success,
      'medium': designSystem.colors.warning,
      'high': designSystem.colors.danger
    };
    return { color: priorityColors[priority] || designSystem.colors.gray[500] };
  };

  const getProgressBarClass = (progress) => {
    if (progress >= 80) return designSystem.colors.success;
    if (progress >= 50) return designSystem.colors.info;
    if (progress >= 25) return designSystem.colors.warning;
    return designSystem.colors.danger;
  };

  const handleProjectSelection = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProjects(projects.map(project => project._id));
    } else {
      setSelectedProjects([]);
    }
  };

  const viewProjectDetails = (project) => {
    alert(`Project Details:
    
Title: ${project.title || project.project_name || 'Untitled Project'}
Client: ${project.client?.name || project.client?.firstName + ' ' + project.client?.lastName || 'Unknown Client'}
Service: ${project.service?.name || project.service_name || 'Unknown Service'}
Status: ${project.status.replace('_', ' ').toUpperCase()}
Priority: ${(project.priority || 'medium').toUpperCase()}
Progress: ${project.progress || 0}%
Budget: ${(project.budget || 0).toLocaleString()}
Spent: ${(project.spent || 0).toLocaleString()}
Assigned To: ${project.assigned_to ? `${project.assigned_to.first_name} ${project.assigned_to.last_name}` : 'Unassigned'}
Due Date: ${project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}`);
  };

  const editProject = async (project) => {
    const newStatus = prompt(`Update project status:
    
Current: ${project.status}

Options:
- pending
- in_progress  
- on_hold
- completed
- cancelled

Enter new status:`);
    
    if (newStatus && ['pending', 'in_progress', 'on_hold', 'completed', 'cancelled'].includes(newStatus)) {
      try {
        const response = await projectsAPI.update(project._id, { status: newStatus });
        
        if (response.success) {
          alert('Project status updated successfully!');
          loadProjectsData();
        } else {
          throw new Error(response.error?.message || 'Failed to update project');
        }
      } catch (error) {
        console.error('Error updating project:', error);
        alert(`Error updating project: ${error.message}`);
      }
    } else if (newStatus) {
      alert('Invalid status. Please use: pending, in_progress, on_hold, completed, or cancelled');
    }
  };

  const addProjectNote = async (project) => {
    const note = prompt(`Add note for project: ${project.title || project.project_name}\n\nEnter your note:`);
    if (note) {
      try {
        // For now, we'll update the project with a note field
        // In a full implementation, this might be a separate notes API
        const response = await projectsAPI.update(project._id, { 
          notes: [...(project.notes || []), {
            text: note,
            createdAt: new Date().toISOString(),
            createdBy: 'current_user' // Would be actual user ID
          }]
        });
        
        if (response.success) {
          alert('Note added successfully!');
          loadProjectsData();
        } else {
          throw new Error(response.error?.message || 'Failed to add note');
        }
      } catch (error) {
        console.error('Error adding note:', error);
        alert(`Error adding note: ${error.message}`);
      }
    }
  };

  const updateProjectProgress = async (project) => {
    const newProgress = prompt(`Update progress for: ${project.title || project.project_name}\n\nCurrent progress: ${project.progress || 0}%\n\nEnter new progress (0-100):`);
    const progress = parseInt(newProgress);
    
    if (!isNaN(progress) && progress >= 0 && progress <= 100) {
      try {
        const response = await projectsAPI.updateProgress(project._id, progress);
        
        if (response.success) {
          alert('Project progress updated successfully!');
          loadProjectsData();
        } else {
          throw new Error(response.error?.message || 'Failed to update progress');
        }
      } catch (error) {
        console.error('Error updating progress:', error);
        alert(`Error updating progress: ${error.message}`);
      }
    } else if (newProgress) {
      alert('Please enter a valid number between 0 and 100');
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

  return (
    <div style={componentStyles.managementCard}>
      {/* Unified Header */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-project-diagram fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Projects Management</h4>
            <p style={componentStyles.headerSubtitle}>Track and manage project lifecycle</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.success
            }}
            onClick={loadProjectsData}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.primary
            }}
            {...hoverEffects.button}
          >
            <i className="fas fa-plus me-2"></i>New Project
          </button>
        </div>
      </div>

      {/* Project Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-project-diagram"
          number={stats.totalProjects}
          label="Total Projects"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
        <StatCard
          icon="fas fa-play-circle"
          number={stats.activeProjects}
          label="Active"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
        <StatCard
          icon="fas fa-clock"
          number={stats.pendingProjects}
          label="Pending"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={stats.completedProjects}
          label="Completed"
          borderColor="#10b981"
          iconColor="#10b981"
        />
      </div>

      {/* Project Filters and Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: designSystem.spacing.md,
        padding: designSystem.spacing.md,
        background: designSystem.colors.gray[50],
        borderRadius: designSystem.borderRadius.button
      }}>
        <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
          <select style={{
            ...componentStyles.formInput,
            width: 'auto',
            minWidth: '120px'
          }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select style={{
            ...componentStyles.formInput,
            width: 'auto',
            minWidth: '140px'
          }}>
            <option value="">All Attorneys</option>
            <option value="attorney_1">Immigration Attorney 1</option>
            <option value="attorney_2">Immigration Attorney 2</option>
          </select>
          <select style={{
            ...componentStyles.formInput,
            width: 'auto',
            minWidth: '120px'
          }}>
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          {selectedProjects.length > 0 && (
            <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
              <button style={{
                ...componentStyles.primaryButton,
                background: designSystem.colors.warning,
                fontSize: designSystem.typography.fontSize.sm
              }}>
                <i className="fas fa-user-cog me-1"></i>
                Reassign ({selectedProjects.length})
              </button>
              <button style={{
                ...componentStyles.primaryButton,
                background: designSystem.colors.info,
                fontSize: designSystem.typography.fontSize.sm
              }}>
                <i className="fas fa-edit me-1"></i>
                Update Status
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Projects Table */}
      <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={componentStyles.tableHeader}>
            <tr>
              <th style={componentStyles.tableHeaderCell}>
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={selectedProjects.length === projects.length && projects.length > 0}
                />
              </th>
              <th style={componentStyles.tableHeaderCell}>Project</th>
              <th style={componentStyles.tableHeaderCell}>Client</th>
              <th style={componentStyles.tableHeaderCell}>Service</th>
              <th style={componentStyles.tableHeaderCell}>Status</th>
              <th style={componentStyles.tableHeaderCell}>Priority</th>
              <th style={componentStyles.tableHeaderCell}>Assigned To</th>
              <th style={componentStyles.tableHeaderCell}>Progress</th>
              <th style={componentStyles.tableHeaderCell}>Budget</th>
              <th style={componentStyles.tableHeaderCell}>Due Date</th>
              <th style={componentStyles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" style={{ ...componentStyles.tableCell, textAlign: 'center', padding: designSystem.spacing.xl }}>
                  <div style={componentStyles.loading}>
                    <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary.split(' ')[0].split('(')[1] }}></i>
                    <p style={{ marginTop: designSystem.spacing.md }}>Loading projects...</p>
                  </div>
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ ...componentStyles.tableCell, textAlign: 'center', padding: designSystem.spacing.xl }}>
                  <div style={componentStyles.emptyState}>
                    <i className="fas fa-project-diagram fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
                    <p style={{ color: designSystem.colors.gray[500] }}>No projects found</p>
                  </div>
                </td>
              </tr>
            ) : (
              projects.map(project => {
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
                      <input 
                        type="checkbox" 
                        checked={selectedProjects.includes(project._id)}
                        onChange={() => handleProjectSelection(project._id)}
                      />
                    </td>
                    <td style={componentStyles.tableCell}>
                      <div>
                        <strong>{project.title || project.project_name || 'Untitled Project'}</strong>
                        <br />
                        <small style={{ color: designSystem.colors.gray[500] }}>
                          ID: {project._id.slice(-6).toUpperCase()}
                        </small>
                      </div>
                    </td>
                    <td style={componentStyles.tableCell}>
                      <div>
                        <strong>{project.client?.name || project.client?.firstName + ' ' + project.client?.lastName || 'Unknown Client'}</strong>
                        <br />
                        <small style={{ color: designSystem.colors.gray[500] }}>
                          {project.client?.email || 'No email'}
                        </small>
                      </div>
                    </td>
                    <td style={componentStyles.tableCell}>
                      <span style={{
                        ...componentStyles.badge,
                        background: designSystem.colors.gray[400],
                        color: 'white'
                      }}>
                        {project.service?.name || project.service_name || 'Unknown Service'}
                      </span>
                    </td>
                    <td style={componentStyles.tableCell}>
                      <span style={{
                        ...componentStyles.badge,
                        background: statusStyle.background,
                        color: statusStyle.color
                      }}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={componentStyles.tableCell}>
                      <span style={{
                        ...priorityStyle,
                        fontWeight: designSystem.typography.fontWeight.bold
                      }}>
                        {(project.priority || 'medium').toUpperCase()}
                      </span>
                    </td>
                    <td style={componentStyles.tableCell}>
                      {project.assigned_to ? (
                        <span style={{
                          ...componentStyles.badge,
                          background: designSystem.colors.info,
                          color: 'white'
                        }}>
                          {project.assigned_to.first_name} {project.assigned_to.last_name}
                        </span>
                      ) : (
                        <span style={{ color: designSystem.colors.gray[500] }}>Unassigned</span>
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
                              width: `${project.progress || 0}%`,
                              height: '100%',
                              background: progressBarColor,
                              transition: 'width 0.3s ease'
                            }}
                          ></div>
                        </div>
                        <small style={{ fontSize: designSystem.typography.fontSize.xs }}>
                          {project.progress || 0}%
                        </small>
                      </div>
                    </td>
                    <td style={componentStyles.tableCell}>
                      <div>
                        <strong>${(project.spent || 0).toLocaleString()}</strong>
                        <br />
                        <small style={{ color: designSystem.colors.gray[500] }}>
                          of ${(project.budget || 0).toLocaleString()}
                        </small>
                      </div>
                    </td>
                    <td style={componentStyles.tableCell}>
                      {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}
                    </td>
                    <td style={componentStyles.tableCell}>
                      <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                        <button 
                          style={{
                            ...componentStyles.secondaryButton,
                            padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
                            fontSize: designSystem.typography.fontSize.sm,
                            background: designSystem.colors.primary,
                            color: 'white'
                          }}
                          onClick={() => viewProjectDetails(project)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          style={{
                            ...componentStyles.secondaryButton,
                            padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
                            fontSize: designSystem.typography.fontSize.sm,
                            background: designSystem.colors.warning,
                            color: 'white'
                          }}
                          onClick={() => editProject(project)}
                          title="Edit Project"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          style={{
                            ...componentStyles.secondaryButton,
                            padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
                            fontSize: designSystem.typography.fontSize.sm,
                            background: designSystem.colors.info,
                            color: 'white'
                          }}
                          onClick={() => addProjectNote(project)}
                          title="Add Note"
                        >
                          <i className="fas fa-sticky-note"></i>
                        </button>
                        <button 
                          style={{
                            ...componentStyles.secondaryButton,
                            padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
                            fontSize: designSystem.typography.fontSize.sm,
                            background: designSystem.colors.success,
                            color: 'white'
                          }}
                          onClick={() => updateProjectProgress(project)}
                          title="Update Progress"
                        >
                          <i className="fas fa-tasks"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions */}
      {selectedProjects.length > 0 && (
        <div style={{
          marginTop: designSystem.spacing.md,
          padding: designSystem.spacing.md,
          background: designSystem.colors.light,
          borderRadius: designSystem.borderRadius.button,
          border: `1px solid ${designSystem.colors.gray[200]}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
              <strong>{selectedProjects.length}</strong> project(s) selected
            </span>
            <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
              <button style={{
                ...componentStyles.primaryButton,
                background: designSystem.colors.primary,
                fontSize: designSystem.typography.fontSize.sm
              }}>
                <i className="fas fa-user-cog me-1"></i>
                Reassign Projects
              </button>
              <button style={{
                ...componentStyles.primaryButton,
                background: designSystem.colors.warning,
                fontSize: designSystem.typography.fontSize.sm
              }}>
                <i className="fas fa-edit me-1"></i>
                Update Status
              </button>
              <button style={{
                ...componentStyles.primaryButton,
                background: designSystem.colors.info,
                fontSize: designSystem.typography.fontSize.sm
              }}>
                <i className="fas fa-sticky-note me-1"></i>
                Add Bulk Note
              </button>
              <button style={{
                ...componentStyles.primaryButton,
                background: designSystem.colors.success,
                fontSize: designSystem.typography.fontSize.sm
              }}>
                <i className="fas fa-file-export me-1"></i>
                Export Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManagement;