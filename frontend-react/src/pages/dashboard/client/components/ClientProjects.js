import { useState, useEffect } from 'react';

const ClientProjects = ({ clientData, apiCall }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/client/projects');
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': 'bg-primary',
      'completed': 'bg-success',
      'on_hold': 'bg-warning',
      'cancelled': 'bg-danger'
    };
    return statusMap[status] || 'bg-secondary';
  };

  const getProgressPercentage = (project) => {
    if (!project.total_tasks || project.total_tasks === 0) return 0;
    return Math.round((project.completed_tasks / project.total_tasks) * 100);
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="client-projects">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className="fas fa-project-diagram me-2"></i>
          My Projects
        </h4>
        <button className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Request New Project
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="row">
          {projects.map((project) => (
            <div key={project.id} className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">{project.title}</h6>
                  <span className={`badge ${getStatusBadge(project.status)}`}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-3">{project.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Progress</small>
                      <small>{getProgressPercentage(project)}%</small>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar bg-primary" 
                        style={{ width: `${getProgressPercentage(project)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="row text-center mb-3">
                    <div className="col-4">
                      <div className="border-end">
                        <div className="fw-bold text-primary">{project.completed_tasks || 0}</div>
                        <small className="text-muted">Completed</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="border-end">
                        <div className="fw-bold text-warning">{project.total_tasks || 0}</div>
                        <small className="text-muted">Total Tasks</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="fw-bold text-success">${project.budget || 0}</div>
                      <small className="text-muted">Budget</small>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mb-3">
                    <small className="text-muted">
                      <i className="fas fa-calendar me-1"></i>
                      Started: {new Date(project.start_date).toLocaleDateString()}
                    </small>
                    {project.end_date && (
                      <div>
                        <small className="text-muted">
                          <i className="fas fa-flag me-1"></i>
                          Due: {new Date(project.end_date).toLocaleDateString()}
                        </small>
                      </div>
                    )}
                  </div>

                  {/* Assigned Team */}
                  {project.assigned_to && (
                    <div className="mb-3">
                      <small className="text-muted">
                        <i className="fas fa-user me-1"></i>
                        Assigned to: {project.assigned_to}
                      </small>
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary btn-sm flex-fill"
                      onClick={() => handleViewDetails(project)}
                    >
                      <i className="fas fa-eye me-1"></i>
                      View Details
                    </button>
                    <button className="btn btn-outline-secondary btn-sm">
                      <i className="fas fa-comment me-1"></i>
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="fas fa-folder-open text-muted fa-3x mb-3"></i>
            <h5 className="text-muted">No Projects Yet</h5>
            <p className="text-muted mb-4">
              Your immigration projects will appear here once they are created by our team.
            </p>
            <button className="btn btn-primary">
              <i className="fas fa-calendar me-2"></i>
              Schedule Consultation
            </button>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {showDetails && selectedProject && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedProject.title}</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowDetails(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Project Information</h6>
                    <p><strong>Status:</strong> 
                      <span className={`badge ${getStatusBadge(selectedProject.status)} ms-2`}>
                        {selectedProject.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </p>
                    <p><strong>Start Date:</strong> {new Date(selectedProject.start_date).toLocaleDateString()}</p>
                    {selectedProject.end_date && (
                      <p><strong>Due Date:</strong> {new Date(selectedProject.end_date).toLocaleDateString()}</p>
                    )}
                    <p><strong>Budget:</strong> ${selectedProject.budget || 0}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Progress</h6>
                    <div className="progress mb-2" style={{ height: '20px' }}>
                      <div 
                        className="progress-bar bg-primary" 
                        style={{ width: `${getProgressPercentage(selectedProject)}%` }}
                      >
                        {getProgressPercentage(selectedProject)}%
                      </div>
                    </div>
                    <p><strong>Tasks:</strong> {selectedProject.completed_tasks || 0} of {selectedProject.total_tasks || 0} completed</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h6>Description</h6>
                  <p>{selectedProject.description}</p>
                </div>

                {selectedProject.notes && (
                  <div className="mb-4">
                    <h6>Notes</h6>
                    <p>{selectedProject.notes}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </button>
                <button type="button" className="btn btn-primary">
                  <i className="fas fa-comment me-2"></i>
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProjects;