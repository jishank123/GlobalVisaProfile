import { useState } from 'react';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const ProjectDetailsModal = ({ show, onHide, project, type, onAssignToCrm, crmManagers }) => {
  const [selectedCrmManager, setSelectedCrmManager] = useState('');

  if (!show || !project) return null;

  const handleAssignToCrm = () => {
    if (selectedCrmManager) {
      onAssignToCrm(project._id, selectedCrmManager);
      onHide();
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'in_progress': '#3b82f6',
      'on_hold': '#ef4444',
      'completed': '#10b981',
      'cancelled': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444'
    };
    return colors[priority] || '#f59e0b';
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#10b981';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 25) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className={`fas ${type === 'tasks' ? 'fa-tasks' : 'fa-project-diagram'} me-2`}></i>
              {type === 'tasks' ? 'Project Tasks & Milestones' : 'Project Details'} - {project.project_id || `#${project._id.slice(-8).toUpperCase()}`}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onHide}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {/* Project Information */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                  <h6 className="text-primary mb-3">
                    <i className="fas fa-info-circle me-2"></i>Project Information
                  </h6>
                  <div className="mb-2">
                    <strong>Project ID:</strong>
                    <span className="ms-2 badge" style={{
                      background: designSystem.colors.primary,
                      color: 'white',
                      fontFamily: 'monospace'
                    }}>
                      {project.project_id || `#${project._id.slice(-8).toUpperCase()}`}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Service:</strong>
                    <span className="ms-2 badge" style={{
                      background: '#8b5cf6',
                      color: 'white'
                    }}>
                      {project.service_name || 'Unknown Service'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Status:</strong>
                    <span className="ms-2 badge" style={{
                      background: getStatusColor(project.status),
                      color: 'white',
                      textTransform: 'uppercase'
                    }}>
                      {project.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Priority:</strong>
                    <span className="ms-2" style={{
                      color: getPriorityColor(project.priority),
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      ● {project.priority || 'Medium'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mb-2">
                    <strong>Last Updated:</strong> {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                  <h6 className="text-primary mb-3">
                    <i className="fas fa-users me-2"></i>Team & Client
                  </h6>
                  <div className="mb-3">
                    <strong>Client:</strong>
                    <div className="mt-1">
                      <div style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                        {project.client?.name || 
                         (project.client?.firstName && project.client?.lastName ? 
                          `${project.client.firstName} ${project.client.lastName}` : 
                          'Unknown Client')}
                      </div>
                      <small style={{ color: designSystem.colors.gray[500] }}>
                        {project.client?.email || 'No email'}
                      </small>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>Lead Manager:</strong>
                    <div className="mt-1">
                      {project.lead_manager ? (
                        <div>
                          <div style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                            {project.lead_manager.first_name} {project.lead_manager.last_name}
                          </div>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            {project.lead_manager.email}
                          </small>
                        </div>
                      ) : (
                        <span style={{ color: designSystem.colors.gray[500], fontStyle: 'italic' }}>
                          No Lead Manager
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mb-2">
                    <strong>CRM Manager:</strong>
                    <div className="mt-1">
                      {project.assigned_to ? (
                        <div>
                          <div style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                            {project.assigned_to.first_name} {project.assigned_to.last_name}
                          </div>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            {project.assigned_to.email}
                          </small>
                        </div>
                      ) : (
                        <span style={{ color: designSystem.colors.gray[500], fontStyle: 'italic' }}>
                          Unassigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mb-4">
              <h6 className="text-primary mb-3">
                <i className="fas fa-chart-line me-2"></i>Progress
              </h6>
              <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span>Project Progress</span>
                  <span style={{ fontWeight: 'bold' }}>{project.progress || 0}%</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '12px',
                  background: designSystem.colors.gray[200],
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{
                      width: `${project.progress || 0}%`,
                      height: '100%',
                      background: getProgressColor(project.progress || 0),
                      transition: 'width 0.3s ease'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Project Description */}
            {project.description && (
              <div className="mb-4">
                <h6 className="text-primary mb-3">
                  <i className="fas fa-file-text me-2"></i>Description
                </h6>
                <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                  <p className="mb-0">{project.description}</p>
                </div>
              </div>
            )}

            {/* Budget & Timeline */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                  <h6 className="text-primary mb-3">
                    <i className="fas fa-dollar-sign me-2"></i>Budget
                  </h6>
                  <div className="mb-2">
                    <strong>Budget:</strong> {project.budget || 'Not specified'}
                  </div>
                  <div className="mb-2">
                    <strong>Estimated Duration:</strong> {project.estimated_duration || 'Not specified'}
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                  <h6 className="text-primary mb-3">
                    <i className="fas fa-calendar me-2"></i>Timeline
                  </h6>
                  <div className="mb-2">
                    <strong>Start Date:</strong> {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                  </div>
                  <div className="mb-2">
                    <strong>Due Date:</strong> {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
                  </div>
                </div>
              </div>
            </div>

            {/* Project Tasks/Milestones - Show when type is 'tasks' */}
            {type === 'tasks' && (
              <div className="mb-4">
                <h6 className="text-primary mb-3">
                  <i className="fas fa-tasks me-2"></i>Project Tasks & Milestones
                </h6>
                <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                  {project.milestones && project.milestones.length > 0 ? (
                    <div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <span style={{ fontWeight: 'bold' }}>
                            Tasks Progress: {project.milestones.filter(m => m.status === 'completed').length}/{project.milestones.length} completed
                          </span>
                          <span style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {Math.round((project.milestones.filter(m => m.status === 'completed').length / project.milestones.length) * 100)}% Done
                          </span>
                        </div>
                      </div>
                      <div className="list-group">
                        {project.milestones.map((milestone, index) => (
                          <div 
                            key={index}
                            className="list-group-item border-0 mb-2"
                            style={{
                              background: milestone.status === 'completed' ? '#f0f9ff' : '#fff',
                              borderLeft: `4px solid ${milestone.status === 'completed' ? '#10b981' : milestone.status === 'in_progress' ? '#3b82f6' : '#6b7280'}`,
                              borderRadius: '4px'
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center mb-1">
                                  <i className={`fas ${milestone.status === 'completed' ? 'fa-check-circle text-success' : milestone.status === 'in_progress' ? 'fa-clock text-primary' : 'fa-circle text-muted'} me-2`}></i>
                                  <h6 className="mb-0" style={{
                                    textDecoration: milestone.status === 'completed' ? 'line-through' : 'none',
                                    color: milestone.status === 'completed' ? '#6b7280' : '#1f2937'
                                  }}>
                                    {milestone.title}
                                  </h6>
                                </div>
                                {milestone.notes && (
                                  <p className="mb-1 text-muted" style={{ fontSize: '14px' }}>
                                    {milestone.notes}
                                  </p>
                                )}
                                <div className="d-flex gap-3">
                                  {milestone.target_date && (
                                    <small className="text-muted">
                                      <i className="fas fa-calendar me-1"></i>
                                      Target: {new Date(milestone.target_date).toLocaleDateString()}
                                    </small>
                                  )}
                                  {milestone.completion_date && (
                                    <small className="text-success">
                                      <i className="fas fa-check me-1"></i>
                                      Completed: {new Date(milestone.completion_date).toLocaleDateString()}
                                    </small>
                                  )}
                                </div>
                              </div>
                              <span className={`badge ${
                                milestone.status === 'completed' ? 'bg-success' :
                                milestone.status === 'in_progress' ? 'bg-primary' : 'bg-secondary'
                              }`} style={{ textTransform: 'capitalize' }}>
                                {milestone.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-tasks fa-3x text-muted mb-3"></i>
                      <h6 className="text-muted">No tasks/milestones found</h6>
                      <p className="text-muted mb-0">Tasks will be added by the assigned CRM manager</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CRM Assignment Form */}
            {type === 'assign' && !project.assigned_to && crmManagers && (
              <div className="mb-4">
                <h6 className="text-primary mb-3">
                  <i className="fas fa-user-plus me-2"></i>Assign to CRM Manager
                </h6>
                <div className="card border-0" style={{ background: designSystem.colors.light, padding: designSystem.spacing.md }}>
                  <div className="mb-3">
                    <label className="form-label">Select CRM Manager</label>
                    <select
                      className="form-control"
                      style={componentStyles.formInput}
                      value={selectedCrmManager}
                      onChange={(e) => setSelectedCrmManager(e.target.value)}
                    >
                      <option value="">Choose CRM Manager...</option>
                      {crmManagers.map(manager => (
                        <option key={manager._id} value={manager._id}>
                          {manager.first_name} {manager.last_name} - {manager.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            <div className="d-flex gap-2 w-100 justify-content-between">
              <div className="d-flex gap-2">
                {type === 'assign' && !project.assigned_to && (
                  <button 
                    className="btn btn-success"
                    onClick={handleAssignToCrm}
                    disabled={!selectedCrmManager}
                    {...hoverEffects.button}
                  >
                    <i className="fas fa-user-plus me-2"></i>Assign to CRM
                  </button>
                )}
              </div>
              
              <button 
                className="btn btn-secondary"
                onClick={onHide}
                {...hoverEffects.button}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;