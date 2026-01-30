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
      
      // Mock data for demonstration
      setProjects([
        {
          _id: '507f1f77bcf86cd799439031',
          title: 'EB-1A Petition - Dr. Sarah Chen',
          client: {
            name: 'Dr. Sarah Chen',
            email: 'sarah.chen@university.edu'
          },
          service: 'EB-1A Petition Preparation',
          status: 'in_progress',
          priority: 'high',
          assignedTo: 'Immigration Attorney 1',
          startDate: '2024-01-15T00:00:00Z',
          dueDate: '2024-04-15T00:00:00Z',
          progress: 65,
          budget: 12000,
          spent: 7800
        },
        {
          _id: '507f1f77bcf86cd799439032',
          title: 'EB-2 NIW Application - John Martinez',
          client: {
            name: 'John Martinez',
            email: 'j.martinez@techcorp.com'
          },
          service: 'EB-2 NIW Application',
          status: 'pending',
          priority: 'medium',
          assignedTo: 'Immigration Attorney 2',
          startDate: '2024-01-20T00:00:00Z',
          dueDate: '2024-06-20T00:00:00Z',
          progress: 25,
          budget: 9000,
          spent: 2250
        },
        {
          _id: '507f1f77bcf86cd799439033',
          title: 'O-1 Visa Consultation - Maria Rodriguez',
          client: {
            name: 'Maria Rodriguez',
            email: 'maria.r@artist.com'
          },
          service: 'O-1 Visa Consultation',
          status: 'completed',
          priority: 'low',
          assignedTo: 'Immigration Attorney 1',
          startDate: '2024-01-10T00:00:00Z',
          dueDate: '2024-01-17T00:00:00Z',
          progress: 100,
          budget: 500,
          spent: 500
        },
        {
          _id: '507f1f77bcf86cd799439034',
          title: 'Profile Assessment - David Kim',
          client: {
            name: 'David Kim',
            email: 'david.kim@startup.io'
          },
          service: 'Profile Assessment',
          status: 'on_hold',
          priority: 'medium',
          assignedTo: 'Immigration Attorney 2',
          startDate: '2024-01-25T00:00:00Z',
          dueDate: '2024-02-01T00:00:00Z',
          progress: 10,
          budget: 200,
          spent: 20
        },
        {
          _id: '507f1f77bcf86cd799439035',
          title: 'EB-1A Documentation Review - Emily Wilson',
          client: {
            name: 'Emily Wilson',
            email: 'emily.w@research.org'
          },
          service: 'EB-1A Petition Preparation',
          status: 'in_progress',
          priority: 'high',
          assignedTo: 'Immigration Attorney 1',
          startDate: '2024-01-12T00:00:00Z',
          dueDate: '2024-05-12T00:00:00Z',
          progress: 80,
          budget: 14000,
          spent: 11200
        }
      ]);

      setStats({
        totalProjects: 5,
        activeProjects: 2,
        pendingProjects: 1,
        completedProjects: 1
      });

    } catch (error) {
      console.error('Error loading projects data:', error);
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
                      <strong>{project.title}</strong>
                      <br />
                      <small className="text-muted">ID: {project._id.slice(-6).toUpperCase()}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>{project.client.name}</strong>
                      <br />
                      <small className="text-muted">{project.client.email}</small>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-secondary">{project.service}</span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={getPriorityClass(project.priority)}>
                      <strong>{project.priority.toUpperCase()}</strong>
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-info">{project.assignedTo}</span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="progress me-2" style={{ width: '60px', height: '8px' }}>
                        <div 
                          className={`progress-bar ${getProgressBarClass(project.progress)}`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <small>{project.progress}%</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>${project.spent.toLocaleString()}</strong>
                      <br />
                      <small className="text-muted">of ${project.budget.toLocaleString()}</small>
                    </div>
                  </td>
                  <td>{new Date(project.dueDate).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary" title="View Details">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="btn btn-outline-warning" title="Edit Project">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-outline-info" title="Add Note">
                        <i className="fas fa-sticky-note"></i>
                      </button>
                      <button className="btn btn-outline-success" title="Update Progress">
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
   