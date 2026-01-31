import { useState, useEffect } from 'react';
import { projectsAPI } from '../../../../services/api';

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

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'pending': 'bg-warning',
      'in_progress': 'bg-primary',
      'on_hold': 'bg-secondary',
      'completed': 'bg-success',
      'cancelled': 'bg-danger'
    };
    return statusClasses[status] || 'bg-secondary';
  };

  const getPriorityClass = (priority) => {
    const priorityClasses = {
      'low': 'text-success',
      'medium': 'text-warning',
      'high': 'text-danger'
    };
    return priorityClasses[priority] || 'text-secondary';
  };

  const getProgressBarClass = (progress) => {
    if (progress >= 80) return 'bg-success';
    if (progress >= 50) return 'bg-info';
    if (progress >= 25) return 'bg-warning';
    return 'bg-danger';
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
Budget: $${(project.budget || 0).toLocaleString()}
Spent: $${(project.spent || 0).toLocaleString()}
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

  const managementCardStyle = {
    background: 'white',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  return (
    <div className="management-card" style={managementCardStyle}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          <i className="fas fa-project-diagram me-2"></i>
          Projects Management
        </h5>
        <div className="btn-group" role="group">
          <button className="btn btn-outline-primary btn-sm" onClick={loadProjectsData}>
            <i className="fas fa-sync-alt me-1"></i>Refresh
          </button>
          <button className="btn btn-success btn-sm">
            <i className="fas fa-plus me-1"></i>New Project
          </button>
        </div>
      </div>

      {/* Project Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-info">
            <div className="card-body text-center">
              <i className="fas fa-project-diagram fa-2x text-info mb-2"></i>
              <h4 className="text-info">{stats.totalProjects}</h4>
              <small className="text-muted">Total Projects</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-primary">
            <div className="card-body text-center">
              <i className="fas fa-play-circle fa-2x text-primary mb-2"></i>
              <h4 className="text-primary">{stats.activeProjects}</h4>
              <small className="text-muted">Active</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-warning">
            <div className="card-body text-center">
              <i className="fas fa-clock fa-2x text-warning mb-2"></i>
              <h4 className="text-warning">{stats.pendingProjects}</h4>
              <small className="text-muted">Pending</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-success">
            <div className="card-body text-center">
              <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
              <h4 className="text-success">{stats.completedProjects}</h4>
              <small className="text-muted">Completed</small>
            </div>
          </div>
        </div>
      </div>

      {/* Project Filters and Actions */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="form-select form-select-sm">
            <option value="">All Attorneys</option>
            <option value="attorney_1">Immigration Attorney 1</option>
            <option value="attorney_2">Immigration Attorney 2</option>
          </select>
          <select className="form-select form-select-sm">
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="btn-group" role="group">
          {selectedProjects.length > 0 && (
            <>
              <button className="btn btn-warning btn-sm">
                <i className="fas fa-user-cog me-1"></i>
                Reassign ({selectedProjects.length})
              </button>
              <button className="btn btn-info btn-sm">
                <i className="fas fa-edit me-1"></i>
                Update Status
              </button>
            </>
          )}
        </div>
      </div>

      {/* Projects Table */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={selectedProjects.length === projects.length && projects.length > 0}
                />
              </th>
              <th>Project</th>
              <th>Client</th>
              <th>Service</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th>Progress</th>
              <th>Budget</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" className="text-center">
                  <div className="spinner-border spinner-border-sm me-2"></div>
                  Loading projects...
                </td>
              </tr>
            ) : (
              projects.map(project => (
                <tr key={project._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedProjects.includes(project._id)}
                      onChange={() => handleProjectSelection(project._id)}
                    />
                  </td>
                  <td>
                    <div>
                      <strong>{project.title || project.project_name || 'Untitled Project'}</strong>
                      <br />
                      <small className="text-muted">ID: {project._id.slice(-6).toUpperCase()}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>{project.client?.name || project.client?.firstName + ' ' + project.client?.lastName || 'Unknown Client'}</strong>
                      <br />
                      <small className="text-muted">{project.client?.email || 'No email'}</small>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-secondary">{project.service?.name || project.service_name || 'Unknown Service'}</span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={getPriorityClass(project.priority || 'medium')}>
                      <strong>{(project.priority || 'medium').toUpperCase()}</strong>
                    </span>
                  </td>
                  <td>
                    {project.assigned_to ? (
                      <span className="badge bg-info">{project.assigned_to.first_name} {project.assigned_to.last_name}</span>
                    ) : (
                      <span className="text-muted">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="progress me-2" style={{ width: '60px', height: '8px' }}>
                        <div 
                          className={`progress-bar ${getProgressBarClass(project.progress || 0)}`}
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                      <small>{project.progress || 0}%</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>${(project.spent || 0).toLocaleString()}</strong>
                      <br />
                      <small className="text-muted">of ${(project.budget || 0).toLocaleString()}</small>
                    </div>
                  </td>
                  <td>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-outline-primary" 
                        onClick={() => viewProjectDetails(project)}
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="btn btn-outline-warning" 
                        onClick={() => editProject(project)}
                        title="Edit Project"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn btn-outline-info" 
                        onClick={() => addProjectNote(project)}
                        title="Add Note"
                      >
                        <i className="fas fa-sticky-note"></i>
                      </button>
                      <button 
                        className="btn btn-outline-success" 
                        onClick={() => updateProjectProgress(project)}
                        title="Update Progress"
                      >
                        <i className="fas fa-tasks"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions */}
      {selectedProjects.length > 0 && (
        <div className="mt-3 p-3 bg-light rounded">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              <strong>{selectedProjects.length}</strong> project(s) selected
            </span>
            <div className="btn-group" role="group">
              <button className="btn btn-primary btn-sm">
                <i className="fas fa-user-cog me-1"></i>
                Reassign Projects
              </button>
              <button className="btn btn-warning btn-sm">
                <i className="fas fa-edit me-1"></i>
                Update Status
              </button>
              <button className="btn btn-info btn-sm">
                <i className="fas fa-sticky-note me-1"></i>
                Add Bulk Note
              </button>
              <button className="btn btn-success btn-sm">
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
   