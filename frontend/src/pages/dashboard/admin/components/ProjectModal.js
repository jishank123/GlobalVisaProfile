import React from 'react';
import { designSystem, componentStyles } from '../../../../styles/designSystem';

const ProjectModal = ({ 
  show, 
  onHide, 
  type, 
  data, 
  onUpdateStatus, 
  onUpdateProgress,
  crmManagers = [],
  onAssignCrmManager
}) => {
  const [selectedCrmManager, setSelectedCrmManager] = React.useState('');
  const [assignLoading, setAssignLoading] = React.useState(false);

  if (!show) return null;

  const handleAssignCrmManager = async () => {
    if (!selectedCrmManager) {
      alert('Please select a CRM manager');
      return;
    }

    setAssignLoading(true);
    try {
      await onAssignCrmManager(data._id, selectedCrmManager);
      setSelectedCrmManager('');
    } catch (error) {
      console.error('Error assigning CRM manager:', error);
    } finally {
      setAssignLoading(false);
    }
  };

  const getModalConfig = () => {
    switch (type) {
      case 'view':
        return {
          title: 'Project Details',
          icon: 'fas fa-project-diagram',
          color: designSystem.colors.primary,
          content: (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: designSystem.spacing.md }}>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Project ID</label>
                <div style={{ 
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  fontFamily: 'monospace',
                  fontSize: designSystem.typography.fontSize.lg,
                  color: designSystem.colors.primary
                }}>
                  {data?.project_id || `#${data?._id?.slice(-8).toUpperCase()}`}
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Project Name</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                  {data?.title || data?.project_name || data?.service_name || 'Untitled Project'}
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Client Information</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                  <div>{data?.client?.name || 
                   (data?.client?.firstName && data?.client?.lastName ? 
                    `${data.client.firstName} ${data.client.lastName}` : 
                    'Unknown Client')}</div>
                  <small style={{ color: designSystem.colors.gray[500], fontWeight: 'normal' }}>
                    {data?.client?.email || 'No email'}
                  </small>
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Created By</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                  {data?.created_by ? (
                    <div>
                      <div>{data.created_by.first_name} {data.created_by.last_name}</div>
                      <small style={{ color: designSystem.colors.gray[500], fontWeight: 'normal' }}>
                        {data.created_by.role === 'lead_manager' ? 'Lead Manager' : 'Client Purchase'}
                      </small>
                    </div>
                  ) : (
                    <span style={{ color: designSystem.colors.gray[500], fontStyle: 'italic' }}>
                      Client Purchase
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>CRM Manager</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                  {data?.assigned_to && data?.assigned_to.role !== 'client' ? (
                    <div>
                      <div>{data.assigned_to.first_name} {data.assigned_to.last_name}</div>
                      <small style={{ color: designSystem.colors.gray[500], fontWeight: 'normal' }}>
                        {data.assigned_to.email || 'No email'}
                      </small>
                    </div>
                  ) : (
                    <span style={{ color: designSystem.colors.gray[500], fontStyle: 'italic' }}>
                      Unassigned
                    </span>
                  )}
                </div>
              </div>
              
              {/* Assign CRM Manager Section - Show if unassigned OR assigned to a client (not a CRM manager) */}
              {(!data?.assigned_to || (data?.assigned_to && data?.assigned_to.role === 'client')) && crmManagers.length > 0 && (
                <div style={{ 
                  gridColumn: '1 / -1',
                  background: '#f0fdf4',
                  padding: designSystem.spacing.md,
                  borderRadius: designSystem.borderRadius.card,
                  border: '2px solid #10b981'
                }}>
                  <label style={{ 
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[700],
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    marginBottom: designSystem.spacing.sm
                  }}>
                    <i className="fas fa-user-plus me-2" style={{ color: '#10b981' }}></i>
                    Assign CRM Manager
                  </label>
                  <div style={{ display: 'flex', gap: designSystem.spacing.sm, alignItems: 'center' }}>
                    <select
                      value={selectedCrmManager}
                      onChange={(e) => setSelectedCrmManager(e.target.value)}
                      disabled={assignLoading}
                      style={{
                        flex: 1,
                        padding: designSystem.spacing.sm,
                        borderRadius: designSystem.borderRadius.button,
                        border: `1px solid ${designSystem.colors.gray[300]}`,
                        fontSize: designSystem.typography.fontSize.base
                      }}
                    >
                      <option value="">-- Select CRM Manager --</option>
                      {crmManagers.map(manager => (
                        <option key={manager._id} value={manager._id}>
                          {manager.first_name} {manager.last_name} ({manager.email})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignCrmManager}
                      disabled={assignLoading || !selectedCrmManager}
                      style={{
                        padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
                        background: selectedCrmManager ? '#10b981' : designSystem.colors.gray[300],
                        color: 'white',
                        border: 'none',
                        borderRadius: designSystem.borderRadius.button,
                        cursor: selectedCrmManager ? 'pointer' : 'not-allowed',
                        fontWeight: designSystem.typography.fontWeight.semibold,
                        fontSize: designSystem.typography.fontSize.sm,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {assignLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check me-2"></i>
                          Assign
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Service</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                  <span style={{
                    background: '#8b5cf6',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {data?.service?.name || data?.service_name || 'Unknown Service'}
                  </span>
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Status</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                  <span style={{
                    background: getStatusColor(data?.status),
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    {data?.status?.replace('_', ' ') || 'Unknown'}
                  </span>
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Priority</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                  <span style={{
                    color: getPriorityColor(data?.priority),
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    fontSize: '14px'
                  }}>
                    ● {data?.priority || 'Medium'}
                  </span>
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Progress</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm }}>
                  <div style={{ 
                    width: '120px', 
                    height: '10px',
                    background: designSystem.colors.gray[200],
                    borderRadius: '5px',
                    overflow: 'hidden'
                  }}>
                    <div 
                      style={{
                        width: `${data?.progress || 0}%`,
                        height: '100%',
                        background: getProgressColor(data?.progress || 0),
                        transition: 'width 0.3s ease'
                      }}
                    ></div>
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '16px' }}>{data?.progress || 0}%</span>
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Start Date</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                  {data?.start_date ? (
                    <div>
                      <div>{new Date(data.start_date).toLocaleDateString()}</div>
                      <small style={{ color: designSystem.colors.gray[500], fontWeight: 'normal' }}>
                        {new Date(data.start_date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </small>
                    </div>
                  ) : (
                    <span style={{ color: designSystem.colors.gray[500], fontStyle: 'italic' }}>
                      No start date set
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>End Date</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                  {data?.due_date ? (
                    <div>
                      <div>{new Date(data.due_date).toLocaleDateString()}</div>
                      <small style={{ 
                        color: new Date(data.due_date) < new Date() ? '#ef4444' : '#10b981',
                        fontWeight: '600'
                      }}>
                        {new Date(data.due_date) < new Date() ? '⚠️ Overdue' : '✓ On Track'}
                      </small>
                    </div>
                  ) : (
                    <span style={{ color: designSystem.colors.gray[500], fontStyle: 'italic' }}>
                      No end date set
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Project Amount</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                  {data?.amount ? (
                    <div>
                      <div style={{ fontSize: '16px', color: designSystem.colors.success }}>
                        ${data.amount.toLocaleString()}
                      </div>
                      <small style={{ color: designSystem.colors.gray[500], fontWeight: 'normal' }}>
                        Paid: ${(data.paid_amount || 0).toLocaleString()} 
                        ({data.amount ? Math.round((data.paid_amount || 0) / data.amount * 100) : 0}%)
                      </small>
                    </div>
                  ) : (
                    <span style={{ color: designSystem.colors.gray[500], fontStyle: 'italic' }}>
                      No amount specified
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Project Code</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                  <span style={{
                    background: designSystem.colors.primary,
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'monospace'
                  }}>
                    {data?.project_id || `#${data?._id?.slice(-8).toUpperCase()}`}
                  </span>
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Project Description</label>
                <div style={{ 
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  background: designSystem.colors.gray[50],
                  padding: designSystem.spacing.md,
                  borderRadius: '8px',
                  minHeight: '80px',
                  border: `1px solid ${designSystem.colors.gray[200]}`
                }}>
                  {data?.description || 'No description available for this project'}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: designSystem.spacing.md,
                  marginTop: designSystem.spacing.md,
                  padding: designSystem.spacing.md,
                  background: designSystem.colors.gray[50],
                  borderRadius: '8px',
                  border: `1px solid ${designSystem.colors.gray[200]}`
                }}>
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.gray[500],
                      marginBottom: '4px'
                    }}>Created Date</label>
                    <div style={{ fontWeight: designSystem.typography.fontWeight.semibold, fontSize: '14px' }}>
                      {data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.gray[500],
                      marginBottom: '4px'
                    }}>Last Updated</label>
                    <div style={{ fontWeight: designSystem.typography.fontWeight.semibold, fontSize: '14px' }}>
                      {data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.gray[500],
                      marginBottom: '4px'
                    }}>Database ID</label>
                    <div style={{ 
                      fontWeight: designSystem.typography.fontWeight.semibold, 
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: designSystem.colors.gray[600]
                    }}>
                      {data?._id}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        };
      case 'tasks':
        return {
          title: 'Project Tasks & Milestones',
          icon: 'fas fa-tasks',
          color: designSystem.colors.info,
          content: (
            <div>
              <div style={{ marginBottom: designSystem.spacing.md }}>
                <h6 style={{ color: designSystem.colors.primary, marginBottom: designSystem.spacing.sm }}>
                  <i className="fas fa-project-diagram me-2"></i>
                  {data?.title || data?.project_name || data?.project_id || 'Project Tasks'}
                </h6>
                <p style={{ fontSize: designSystem.typography.fontSize.sm, color: designSystem.colors.gray[500] }}>
                  Milestones and tasks for this project
                </p>
              </div>

              {/* Project Milestones */}
              <div style={{ marginBottom: designSystem.spacing.lg }}>
                <h6 style={{ 
                  color: designSystem.colors.dark, 
                  marginBottom: designSystem.spacing.md,
                  borderBottom: `2px solid ${designSystem.colors.primary}`,
                  paddingBottom: designSystem.spacing.xs
                }}>
                  <i className="fas fa-flag me-2"></i>Project Milestones
                </h6>
                
                {data?.milestones && data.milestones.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.sm }}>
                    {data.milestones.map((milestone, index) => {
                      const getStatusColor = (status) => {
                        switch (status) {
                          case 'completed': return '#10b981';
                          case 'in_progress': return '#3b82f6';
                          case 'pending': return '#f59e0b';
                          default: return '#6b7280';
                        }
                      };

                      const getStatusIcon = (status) => {
                        switch (status) {
                          case 'completed': return 'fas fa-check-circle';
                          case 'in_progress': return 'fas fa-play-circle';
                          case 'pending': return 'fas fa-clock';
                          default: return 'fas fa-circle';
                        }
                      };

                      return (
                        <div key={index} style={{
                          padding: designSystem.spacing.md,
                          background: designSystem.colors.gray[50],
                          borderRadius: designSystem.borderRadius.button,
                          border: `1px solid ${designSystem.colors.gray[200]}`,
                          borderLeft: `4px solid ${getStatusColor(milestone.status)}`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: designSystem.spacing.xs }}>
                            <div style={{ flex: 1 }}>
                              <h6 style={{ margin: 0, color: designSystem.colors.dark, marginBottom: '4px' }}>
                                <i className={`${getStatusIcon(milestone.status)} me-2`} style={{ color: getStatusColor(milestone.status) }}></i>
                                {milestone.title}
                              </h6>
                              {milestone.notes && (
                                <small style={{ color: designSystem.colors.gray[600], display: 'block', marginBottom: '8px' }}>
                                  {milestone.notes}
                                </small>
                              )}
                              <div style={{ display: 'flex', gap: designSystem.spacing.md, fontSize: designSystem.typography.fontSize.xs }}>
                                {milestone.target_date && (
                                  <span style={{ color: designSystem.colors.gray[500] }}>
                                    <i className="fas fa-calendar me-1"></i>
                                    Target: {new Date(milestone.target_date).toLocaleDateString()}
                                  </span>
                                )}
                                {milestone.completion_date && (
                                  <span style={{ color: designSystem.colors.success }}>
                                    <i className="fas fa-check me-1"></i>
                                    Completed: {new Date(milestone.completion_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span style={{
                              background: getStatusColor(milestone.status),
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {milestone.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{
                    padding: designSystem.spacing.lg,
                    textAlign: 'center',
                    background: designSystem.colors.gray[50],
                    borderRadius: designSystem.borderRadius.button,
                    border: `1px dashed ${designSystem.colors.gray[300]}`
                  }}>
                    <i className="fas fa-flag fa-2x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.sm }}></i>
                    <p style={{ color: designSystem.colors.gray[500], margin: 0 }}>
                      No milestones have been added to this project yet
                    </p>
                  </div>
                )}
              </div>

              {/* Project Notes */}
              {data?.notes && data.notes.length > 0 && (
                <div>
                  <h6 style={{ 
                    color: designSystem.colors.dark, 
                    marginBottom: designSystem.spacing.md,
                    borderBottom: `2px solid ${designSystem.colors.info}`,
                    paddingBottom: designSystem.spacing.xs
                  }}>
                    <i className="fas fa-sticky-note me-2"></i>Project Notes
                  </h6>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.sm }}>
                    {data.notes.map((note, index) => (
                      <div key={index} style={{
                        padding: designSystem.spacing.md,
                        background: '#fff7ed',
                        borderRadius: designSystem.borderRadius.button,
                        border: `1px solid #fed7aa`,
                        borderLeft: `4px solid #f97316`
                      }}>
                        <div style={{ marginBottom: designSystem.spacing.xs }}>
                          <p style={{ margin: 0, color: designSystem.colors.dark }}>
                            {note.text}
                          </p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            <i className="fas fa-user me-1"></i>
                            {note.created_by?.first_name} {note.created_by?.last_name}
                          </small>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            <i className="fas fa-clock me-1"></i>
                            {new Date(note.created_at).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Progress Summary */}
              <div style={{ 
                marginTop: designSystem.spacing.lg,
                padding: designSystem.spacing.md,
                background: '#f0f9ff',
                borderRadius: designSystem.borderRadius.button,
                border: '1px solid #0ea5e9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm, marginBottom: designSystem.spacing.sm }}>
                  <i className="fas fa-chart-line" style={{ color: '#0ea5e9' }}></i>
                  <span style={{ color: '#0ea5e9', fontWeight: '600' }}>
                    Project Progress Summary
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: designSystem.spacing.md }}>
                  <div>
                    <small style={{ color: designSystem.colors.gray[600] }}>Overall Progress</small>
                    <div style={{ fontWeight: '700', fontSize: '18px', color: '#0ea5e9' }}>
                      {data?.progress || 0}%
                    </div>
                  </div>
                  {data?.milestones && data.milestones.length > 0 && (
                    <>
                      <div>
                        <small style={{ color: designSystem.colors.gray[600] }}>Completed Milestones</small>
                        <div style={{ fontWeight: '700', fontSize: '18px', color: '#10b981' }}>
                          {data.milestones.filter(m => m.status === 'completed').length} / {data.milestones.length}
                        </div>
                      </div>
                      <div>
                        <small style={{ color: designSystem.colors.gray[600] }}>In Progress</small>
                        <div style={{ fontWeight: '700', fontSize: '18px', color: '#3b82f6' }}>
                          {data.milestones.filter(m => m.status === 'in_progress').length}
                        </div>
                      </div>
                      <div>
                        <small style={{ color: designSystem.colors.gray[600] }}>Pending</small>
                        <div style={{ fontWeight: '700', fontSize: '18px', color: '#f59e0b' }}>
                          {data.milestones.filter(m => m.status === 'pending').length}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        };
      default:
        return { title: '', icon: '', color: '', content: null };
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

  const config = getModalConfig();

  return (
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
      onClick={onHide}
    >
      <div 
        className="modal-dialog modal-lg"
        style={{ 
          position: 'relative',
          width: 'auto',
          margin: '1.75rem auto',
          maxWidth: '800px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
            <h5 className="modal-title">
              <i className={`${config.icon} me-2`}></i>
              {config.title}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onHide}
            ></button>
          </div>
          <div className="modal-body">
            {config.content}
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={onHide}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProjectModal);