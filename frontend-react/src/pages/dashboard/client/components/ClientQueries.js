import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects, getStatusBadgeStyle } from '../../../../styles/designSystem';

const ClientQueries = ({ clientData, apiCall, onRefresh }) => {
  const [queries, setQueries] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [queryData, setQueryData] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    description: '',
    attachments: []
  });
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/queries?client=' + clientData?.email);
      if (response.success) {
        setQueries(response.data || []);
      }
    } catch (error) {
      console.error('Error loading queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredQueries = () => {
    if (activeTab === 'all') return queries;
    return queries.filter(query => {
      switch (activeTab) {
        case 'open':
          return query.status === 'open' || query.status === 'pending';
        case 'in_progress':
          return query.status === 'in_progress';
        case 'resolved':
          return query.status === 'resolved' || query.status === 'closed';
        default:
          return true;
      }
    });
  };

  const getQueryCounts = () => {
    return {
      total: queries.length,
      open: queries.filter(q => q.status === 'open' || q.status === 'pending').length,
      in_progress: queries.filter(q => q.status === 'in_progress').length,
      resolved: queries.filter(q => q.status === 'resolved' || q.status === 'closed').length
    };
  };

  const getQueryStatusStyle = (status) => {
    const statusStyles = {
      'open': { background: '#f59e0b', color: 'white' },
      'pending': { background: '#f59e0b', color: 'white' },
      'in_progress': { background: '#3b82f6', color: 'white' },
      'resolved': { background: '#10b981', color: 'white' },
      'closed': { background: '#10b981', color: 'white' },
      'cancelled': { background: '#6b7280', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
  };

  const getPriorityStyle = (priority) => {
    const priorityStyles = {
      'low': { color: '#10b981' },
      'medium': { color: '#f59e0b' },
      'high': { color: '#ef4444' },
      'urgent': { color: '#dc2626' }
    };
    return priorityStyles[priority] || { color: '#6b7280' };
  };

  const handleCreateQuery = async () => {
    try {
      const formData = new FormData();
      formData.append('subject', queryData.subject);
      formData.append('category', queryData.category);
      formData.append('priority', queryData.priority);
      formData.append('description', queryData.description);
      formData.append('client', clientData._id);
      formData.append('status', 'open');

      // Add attachments if any
      queryData.attachments.forEach((file, index) => {
        formData.append('attachments', file);
      });

      const response = await apiCall('/queries', {
        method: 'POST',
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it with boundary for FormData
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('client_token')}`
        }
      });

      if (response.success) {
        alert('Query submitted successfully! Our team will respond shortly.');
        setShowCreateModal(false);
        setQueryData({
          subject: '',
          category: 'general',
          priority: 'medium',
          description: '',
          attachments: []
        });
        loadQueries();
      } else {
        throw new Error(response.message || 'Failed to create query');
      }
    } catch (error) {
      console.error('Error creating query:', error);
      alert(`Failed to create query: ${error.message}`);
    }
  };

  const handleAddReply = async () => {
    if (!replyText.trim()) return;

    try {
      const response = await apiCall(`/queries/${selectedQuery._id}/reply`, {
        method: 'POST',
        body: JSON.stringify({
          message: replyText,
          sender: clientData._id,
          sender_type: 'client'
        })
      });

      if (response.success) {
        setReplyText('');
        // Reload the query details
        const updatedQuery = await apiCall(`/queries/${selectedQuery._id}`);
        if (updatedQuery.success) {
          setSelectedQuery(updatedQuery.data);
        }
        loadQueries();
      } else {
        throw new Error(response.message || 'Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      alert(`Failed to add reply: ${error.message}`);
    }
  };

  const QueryCard = ({ query }) => (
    <div
      style={{
        ...componentStyles.managementCard,
        margin: 0,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        borderLeft: `4px solid ${getQueryStatusStyle(query.status).background}`
      }}
      {...hoverEffects.card}
      onClick={() => {
        setSelectedQuery(query);
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
              #{query._id.slice(-8).toUpperCase()}
            </span>
            <span style={{
              ...componentStyles.badge,
              ...getQueryStatusStyle(query.status),
              textTransform: 'uppercase',
              fontSize: '11px',
              fontWeight: '600',
              marginRight: designSystem.spacing.sm
            }}>
              {query.status.replace('_', ' ')}
            </span>
            <span style={{
              fontSize: designSystem.typography.fontSize.sm,
              fontWeight: designSystem.typography.fontWeight.medium,
              ...getPriorityStyle(query.priority)
            }}>
              <i className="fas fa-flag me-1"></i>
              {query.priority?.toUpperCase() || 'MEDIUM'}
            </span>
          </div>
          
          <h5 style={{
            color: designSystem.colors.dark,
            fontWeight: designSystem.typography.fontWeight.semibold,
            marginBottom: designSystem.spacing.sm
          }}>
            {query.subject}
          </h5>
          
          <div style={{
            fontSize: designSystem.typography.fontSize.sm,
            color: designSystem.colors.gray[600],
            marginBottom: designSystem.spacing.sm
          }}>
            Category: {query.category?.replace('_', ' ').toUpperCase() || 'GENERAL'}
          </div>
          
          <p style={{
            color: designSystem.colors.gray[600],
            fontSize: designSystem.typography.fontSize.sm,
            marginBottom: designSystem.spacing.md,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {query.description}
          </p>
        </div>
        
        <div style={{
          textAlign: 'right',
          marginLeft: designSystem.spacing.md
        }}>
          <div style={{
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.gray[500],
            marginBottom: '4px'
          }}>
            Created
          </div>
          <div style={{
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.medium,
            color: designSystem.colors.dark
          }}>
            {new Date(query.createdAt || query.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Reply Count */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: designSystem.spacing.md
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: designSystem.typography.fontSize.sm,
          color: designSystem.colors.gray[600]
        }}>
          <i className="fas fa-comments me-2"></i>
          {query.replies?.length || 0} replies
        </div>
        
        {query.assigned_to && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: designSystem.typography.fontSize.sm,
            color: designSystem.colors.gray[600]
          }}>
            <i className="fas fa-user me-2"></i>
            {query.assigned_to.first_name} {query.assigned_to.last_name}
          </div>
        )}
      </div>

      {/* Last Activity */}
      {query.updated_at && query.updated_at !== query.createdAt && (
        <div style={{
          fontSize: designSystem.typography.fontSize.xs,
          color: designSystem.colors.gray[500],
          fontStyle: 'italic',
          marginBottom: designSystem.spacing.md
        }}>
          Last updated: {new Date(query.updated_at).toLocaleDateString()}
        </div>
      )}

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
            setSelectedQuery(query);
            setShowModal(true);
          }}
          {...hoverEffects.button}
        >
          <i className="fas fa-eye me-2"></i>View Details
        </button>
        {(query.status === 'open' || query.status === 'in_progress') && (
          <button
            style={{
              ...componentStyles.secondaryButton,
              fontSize: designSystem.typography.fontSize.sm
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedQuery(query);
              setShowModal(true);
            }}
            {...hoverEffects.button}
          >
            <i className="fas fa-reply me-2"></i>Reply
          </button>
        )}
      </div>
    </div>
  );

  const QueryModal = () => (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-question-circle me-2"></i>
              Query Details - #{selectedQuery?._id.slice(-8).toUpperCase()}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowModal(false)}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {selectedQuery && (
              <div>
                {/* Query Information */}
                <div className="row mb-4">
                  <div className="col-md-8">
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Query Information
                    </h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Subject:</strong> {selectedQuery.subject}</p>
                        <p><strong>Category:</strong> {selectedQuery.category?.replace('_', ' ').toUpperCase()}</p>
                        <p><strong>Priority:</strong> 
                          <span style={{
                            ...getPriorityStyle(selectedQuery.priority),
                            marginLeft: '8px',
                            fontWeight: 'bold'
                          }}>
                            {selectedQuery.priority?.toUpperCase()}
                          </span>
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Status:</strong> 
                          <span style={{
                            ...componentStyles.badge,
                            ...getQueryStatusStyle(selectedQuery.status),
                            marginLeft: '8px'
                          }}>
                            {selectedQuery.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </p>
                        <p><strong>Created:</strong> {new Date(selectedQuery.createdAt).toLocaleString()}</p>
                        <p><strong>Last Updated:</strong> {new Date(selectedQuery.updated_at || selectedQuery.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    {selectedQuery.assigned_to && (
                      <div>
                        <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                          Assigned To
                        </h6>
                        <div style={{
                          background: designSystem.colors.light,
                          padding: designSystem.spacing.md,
                          borderRadius: designSystem.borderRadius.button
                        }}>
                          <div style={{ marginBottom: designSystem.spacing.sm }}>
                            <strong>{selectedQuery.assigned_to.first_name} {selectedQuery.assigned_to.last_name}</strong>
                          </div>
                          <div style={{ 
                            fontSize: designSystem.typography.fontSize.sm,
                            color: designSystem.colors.gray[600]
                          }}>
                            {selectedQuery.assigned_to.role?.replace('_', ' ').toUpperCase()}
                          </div>
                          {selectedQuery.assigned_to.email && (
                            <div style={{ 
                              fontSize: designSystem.typography.fontSize.sm,
                              color: designSystem.colors.gray[500]
                            }}>
                              {selectedQuery.assigned_to.email}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Original Query */}
                <div className="mb-4">
                  <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                    Original Query
                  </h6>
                  <div style={{
                    background: designSystem.colors.light,
                    padding: designSystem.spacing.lg,
                    borderRadius: designSystem.borderRadius.button,
                    border: `1px solid ${designSystem.colors.gray[200]}`
                  }}>
                    <div style={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6'
                    }}>
                      {selectedQuery.description}
                    </div>
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="mb-4">
                  <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                    Conversation ({selectedQuery.replies?.length || 0} replies)
                  </h6>
                  
                  {selectedQuery.replies && selectedQuery.replies.length > 0 ? (
                    <div style={{
                      maxHeight: '400px',
                      overflowY: 'auto',
                      border: `1px solid ${designSystem.colors.gray[200]}`,
                      borderRadius: designSystem.borderRadius.button
                    }}>
                      {selectedQuery.replies.map((reply, index) => (
                        <div key={index} style={{
                          padding: designSystem.spacing.lg,
                          borderBottom: index < selectedQuery.replies.length - 1 ? `1px solid ${designSystem.colors.gray[100]}` : 'none',
                          background: reply.sender_type === 'client' ? designSystem.colors.light : 'white'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: designSystem.spacing.sm
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: reply.sender_type === 'client' ? designSystem.colors.primary : designSystem.colors.success,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: designSystem.typography.fontWeight.bold,
                                marginRight: designSystem.spacing.sm
                              }}>
                                {reply.sender_type === 'client' ? 'C' : 'S'}
                              </div>
                              <div>
                                <div style={{
                                  fontWeight: designSystem.typography.fontWeight.medium,
                                  color: designSystem.colors.dark
                                }}>
                                  {reply.sender_type === 'client' ? 'You' : 'Support Team'}
                                </div>
                                <div style={{
                                  fontSize: designSystem.typography.fontSize.xs,
                                  color: designSystem.colors.gray[500]
                                }}>
                                  {new Date(reply.created_at).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.6',
                            marginLeft: '44px'
                          }}>
                            {reply.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: designSystem.spacing.xl,
                      color: designSystem.colors.gray[500],
                      background: designSystem.colors.light,
                      borderRadius: designSystem.borderRadius.button
                    }}>
                      <i className="fas fa-comments fa-2x mb-3"></i>
                      <p>No replies yet. Our team will respond soon!</p>
                    </div>
                  )}
                </div>

                {/* Add Reply Section */}
                {(selectedQuery.status === 'open' || selectedQuery.status === 'in_progress') && (
                  <div>
                    <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                      Add Reply
                    </h6>
                    <div style={{
                      border: `1px solid ${designSystem.colors.gray[200]}`,
                      borderRadius: designSystem.borderRadius.button,
                      overflow: 'hidden'
                    }}>
                      <textarea
                        style={{
                          width: '100%',
                          minHeight: '120px',
                          padding: designSystem.spacing.md,
                          border: 'none',
                          resize: 'vertical',
                          fontSize: designSystem.typography.fontSize.base,
                          fontFamily: designSystem.typography.fontFamily
                        }}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                      />
                      <div style={{
                        padding: designSystem.spacing.md,
                        background: designSystem.colors.light,
                        borderTop: `1px solid ${designSystem.colors.gray[200]}`,
                        display: 'flex',
                        justifyContent: 'flex-end'
                      }}>
                        <button
                          style={{
                            ...componentStyles.primaryButton,
                            background: designSystem.colors.success
                          }}
                          onClick={handleAddReply}
                          disabled={!replyText.trim()}
                          {...hoverEffects.button}
                        >
                          <i className="fas fa-paper-plane me-2"></i>
                          Send Reply
                        </button>
                      </div>
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
          </div>
        </div>
      </div>
    </div>
  );

  const CreateQueryModal = () => (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-plus me-2"></i>
              Create New Query
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowCreateModal(false)}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            <div className="row">
              <div className="col-12 mb-3">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  className="form-control"
                  value={queryData.subject}
                  onChange={(e) => setQueryData({...queryData, subject: e.target.value})}
                  placeholder="Brief description of your question or issue"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={queryData.category}
                  onChange={(e) => setQueryData({...queryData, category: e.target.value})}
                >
                  <option value="general">General Question</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="project">Project Related</option>
                  <option value="appointment">Appointment</option>
                  <option value="document">Document Related</option>
                  <option value="visa_process">Visa Process</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Priority</label>
                <select
                  className="form-control"
                  value={queryData.priority}
                  onChange={(e) => setQueryData({...queryData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-control"
                  rows="6"
                  value={queryData.description}
                  onChange={(e) => setQueryData({...queryData, description: e.target.value})}
                  placeholder="Please provide detailed information about your question or issue..."
                  required
                ></textarea>
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Attachments (Optional)</label>
                <input
                  type="file"
                  className="form-control"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  onChange={(e) => setQueryData({...queryData, attachments: Array.from(e.target.files)})}
                />
                <small className="text-muted">
                  You can attach documents, images, or other relevant files (max 10MB per file)
                </small>
              </div>
            </div>

            <div style={{
              background: designSystem.colors.light,
              padding: designSystem.spacing.md,
              borderRadius: designSystem.borderRadius.button,
              marginTop: designSystem.spacing.md
            }}>
              <p style={{ 
                margin: 0,
                fontSize: designSystem.typography.fontSize.sm,
                color: designSystem.colors.gray[600]
              }}>
                <i className="fas fa-info-circle me-2"></i>
                Our support team typically responds within 24 hours. For urgent matters, please call our office directly.
              </p>
            </div>
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleCreateQuery}
              disabled={!queryData.subject || !queryData.description}
            >
              <i className="fas fa-paper-plane me-2"></i>
              Submit Query
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
          Loading your queries...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Actions */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-question-circle fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Support & Queries</h4>
            <p style={componentStyles.headerSubtitle}>Get help and track your support requests</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.success
            }}
            onClick={() => setShowCreateModal(true)}
            {...hoverEffects.button}
          >
            <i className="fas fa-plus me-2"></i>New Query
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.info
            }}
            onClick={() => {
              loadQueries();
              onRefresh?.();
            }}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>
      </div>

      {/* Query Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-question-circle"
          number={getQueryCounts().total}
          label="Total Queries"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
        <StatCard
          icon="fas fa-clock"
          number={getQueryCounts().open}
          label="Open Queries"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-cog"
          number={getQueryCounts().in_progress}
          label="In Progress"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={getQueryCounts().resolved}
          label="Resolved"
          borderColor="#10b981"
          iconColor="#10b981"
        />
      </div>

      {/* Query Tabs */}
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
            All Queries ({getQueryCounts().total})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'open' ? '#f59e0b' : designSystem.colors.gray[100],
              color: activeTab === 'open' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('open')}
            {...hoverEffects.button}
          >
            Open ({getQueryCounts().open})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'in_progress' ? '#3b82f6' : designSystem.colors.gray[100],
              color: activeTab === 'in_progress' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('in_progress')}
            {...hoverEffects.button}
          >
            In Progress ({getQueryCounts().in_progress})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'resolved' ? '#10b981' : designSystem.colors.gray[100],
              color: activeTab === 'resolved' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('resolved')}
            {...hoverEffects.button}
          >
            Resolved ({getQueryCounts().resolved})
          </button>
        </div>
      </div>

      {/* Queries Grid */}
      {getFilteredQueries().length === 0 ? (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-question-circle fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>
            No {activeTab === 'all' ? '' : activeTab} queries found
          </h6>
          <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.lg }}>
            {activeTab === 'all' 
              ? 'You haven\'t submitted any queries yet. Need help? Create your first query!'
              : `You don't have any ${activeTab.replace('_', ' ')} queries at the moment.`}
          </p>
          {activeTab === 'all' && (
            <button
              style={componentStyles.primaryButton}
              onClick={() => setShowCreateModal(true)}
              {...hoverEffects.button}
            >
              <i className="fas fa-plus me-2"></i>Create Your First Query
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: designSystem.spacing.lg
        }}>
          {getFilteredQueries().map(query => (
            <QueryCard key={query._id} query={query} />
          ))}
        </div>
      )}

      {/* Query Details Modal */}
      {showModal && <QueryModal />}

      {/* Create Query Modal */}
      {showCreateModal && <CreateQueryModal />}
    </div>
  );
};

export default ClientQueries;