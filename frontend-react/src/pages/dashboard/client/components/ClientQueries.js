import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';
import StableModal from '../../../../components/StableModal';
import { useAuth } from '../../../../contexts/AuthContext';

const ClientQueries = ({ clientData, apiCall, onRefresh }) => {
  const { user, token } = useAuth();
  const [queries, setQueries] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [queryData, setQueryData] = useState({
    subject: '',
    category: 'General',
    priority: 'medium',
    description: '',
    attachments: []
  });
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    setLoading(true);
    try {
      console.log('🔍 Loading queries for client:', { 
        user: user?.email,
        hasToken: !!token 
      });

      // Use the general queries endpoint which handles client authentication
      const response = await apiCall('/queries');
      
      console.log('📋 Queries response:', response);
      
      if (response.success) {
        setQueries(response.data || []);
        console.log('✅ Loaded queries:', response.data?.length || 0);
      } else {
        console.error('❌ Failed to load queries:', response.message);
        setQueries([]);
      }
    } catch (error) {
      console.error('❌ Error loading queries:', error);
      setQueries([]);
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
    if (!queryData.subject.trim() || !queryData.description.trim()) {
      alert('Please fill in both subject and description fields.');
      return;
    }

    setSubmitting(true);
    try {
      console.log('📤 Creating query:', queryData);

      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('subject', queryData.subject.trim());
      formData.append('category', queryData.category);
      formData.append('priority', queryData.priority);
      formData.append('description', queryData.description.trim());

      // Add attachments if any
      queryData.attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await apiCall('/queries', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it for FormData
        headers: {}
      });

      console.log('📤 Query creation response:', response);

      if (response.success) {
        alert('Query sent successfully! Our team will respond shortly.');
        setShowCreateModal(false);
        setQueryData({
          subject: '',
          category: 'General',
          priority: 'medium',
          description: '',
          attachments: []
        });
        await loadQueries();
        onRefresh?.();
      } else {
        throw new Error(response.message || 'Failed to send query');
      }
    } catch (error) {
      console.error('❌ Error creating query:', error);
      alert(`Failed to send query: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async () => {
    if (!replyText.trim()) {
      alert('Please enter a reply message.');
      return;
    }

    setReplying(true);
    try {
      console.log('💬 Adding reply to query:', selectedQuery._id);

      const response = await apiCall(`/queries/${selectedQuery._id}/reply`, {
        method: 'POST',
        body: JSON.stringify({
          message: replyText.trim()
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('💬 Reply response:', response);

      if (response.success) {
        setReplyText('');
        // Update the selected query with the new reply
        setSelectedQuery(response.data);
        await loadQueries();
        alert('Reply sent successfully!');
      } else {
        throw new Error(response.message || 'Failed to add reply');
      }
    } catch (error) {
      console.error('❌ Error adding reply:', error);
      alert(`Failed to add reply: ${error.message}`);
    } finally {
      setReplying(false);
    }
  };

  const QueryDetailsModal = () => {
    if (!selectedQuery) return null;

    return (
      <StableModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedQuery(null);
          setReplyText('');
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-eye me-2" style={{ color: designSystem.colors.primary }}></i>
            Query Details - #{selectedQuery._id.slice(-8).toUpperCase()}
          </div>
        }
        size="xl"
        footer={
          (selectedQuery.status === 'open' || selectedQuery.status === 'in_progress') && (
            <div style={{ display: 'flex', gap: designSystem.spacing.sm, width: '100%' }}>
              <input
                type="text"
                placeholder="Type your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={replying}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: `1px solid ${designSystem.colors.gray[300]}`,
                  borderRadius: designSystem.borderRadius.md,
                  fontSize: designSystem.typography.fontSize.sm
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddReply();
                  }
                }}
              />
              <button 
                type="button"
                onClick={handleAddReply}
                disabled={!replyText.trim() || replying}
                style={{
                  ...componentStyles.primaryButton,
                  background: (!replyText.trim() || replying) 
                    ? designSystem.colors.gray[400] 
                    : designSystem.colors.primary,
                  cursor: (!replyText.trim() || replying) 
                    ? 'not-allowed' 
                    : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {replying ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-reply"></i>
                    Reply
                  </>
                )}
              </button>
            </div>
          )
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.lg }}>
          {/* Query Header */}
          <div style={{
            padding: designSystem.spacing.lg,
            backgroundColor: designSystem.colors.gray[50],
            borderRadius: designSystem.borderRadius.md,
            border: `1px solid ${designSystem.colors.gray[200]}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: designSystem.spacing.md }}>
              <div>
                <h5 style={{
                  color: designSystem.colors.dark,
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  marginBottom: designSystem.spacing.sm
                }}>
                  {selectedQuery.subject}
                </h5>
                <div style={{ display: 'flex', gap: designSystem.spacing.md, flexWrap: 'wrap' }}>
                  <span style={{
                    ...componentStyles.badge,
                    ...getQueryStatusStyle(selectedQuery.status),
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {selectedQuery.status.replace('_', ' ')}
                  </span>
                  <span style={{
                    ...componentStyles.badge,
                    background: designSystem.colors.gray[200],
                    color: designSystem.colors.gray[700],
                    textTransform: 'uppercase',
                    fontSize: '11px'
                  }}>
                    {selectedQuery.category?.replace('_', ' ') || 'GENERAL'}
                  </span>
                  <span style={{
                    ...componentStyles.badge,
                    ...getPriorityStyle(selectedQuery.priority),
                    backgroundColor: `${getPriorityStyle(selectedQuery.priority).color}20`,
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {selectedQuery.priority?.toUpperCase() || 'MEDIUM'} PRIORITY
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[600]
                }}>
                  Created: {new Date(selectedQuery.createdAt || selectedQuery.created_at).toLocaleDateString()}
                </div>
                {selectedQuery.assignedTo && (
                  <div style={{
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[600],
                    marginTop: '4px'
                  }}>
                    Assigned to: {selectedQuery.assignedTo.first_name} {selectedQuery.assignedTo.last_name}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{
              fontSize: designSystem.typography.fontSize.md,
              color: designSystem.colors.gray[700],
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {selectedQuery.description}
            </div>
          </div>

          {/* Conversation Thread */}
          <div>
            <h6 style={{
              color: designSystem.colors.dark,
              fontWeight: designSystem.typography.fontWeight.semibold,
              marginBottom: designSystem.spacing.md,
              display: 'flex',
              alignItems: 'center'
            }}>
              <i className="fas fa-comments me-2"></i>
              Conversation ({selectedQuery.replies?.length || 0} replies)
            </h6>
            
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: `1px solid ${designSystem.colors.gray[200]}`,
              borderRadius: designSystem.borderRadius.md
            }}>
              {selectedQuery.replies && selectedQuery.replies.length > 0 ? (
                selectedQuery.replies.map((reply, index) => (
                  <div
                    key={index}
                    style={{
                      padding: designSystem.spacing.md,
                      borderBottom: index < selectedQuery.replies.length - 1 ? `1px solid ${designSystem.colors.gray[200]}` : 'none',
                      backgroundColor: reply.sender_type === 'Client' ? designSystem.colors.blue[50] : 'white'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: designSystem.spacing.sm
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: designSystem.spacing.sm
                      }}>
                        <span style={{
                          ...componentStyles.badge,
                          background: reply.sender_type === 'Client' ? designSystem.colors.blue[600] : designSystem.colors.green[600],
                          color: 'white',
                          fontSize: '11px'
                        }}>
                          {reply.sender_type === 'Client' ? 'YOU' : 'SUPPORT TEAM'}
                        </span>
                        {reply.sender && (
                          <span style={{
                            fontSize: designSystem.typography.fontSize.sm,
                            color: designSystem.colors.gray[600]
                          }}>
                            {reply.sender.name || `${reply.sender.first_name || ''} ${reply.sender.last_name || ''}`.trim()}
                          </span>
                        )}
                      </div>
                      <span style={{
                        fontSize: designSystem.typography.fontSize.xs,
                        color: designSystem.colors.gray[500]
                      }}>
                        {new Date(reply.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div style={{
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.gray[700],
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {reply.message}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  padding: designSystem.spacing.xl,
                  textAlign: 'center',
                  color: designSystem.colors.gray[500]
                }}>
                  <i className="fas fa-comment-slash fa-2x mb-3"></i>
                  <p>No replies yet. Our support team will respond soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </StableModal>
    );
  };

  const CreateQueryModal = () => (
    <StableModal
      isOpen={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <i className="fas fa-paper-plane me-2" style={{ color: designSystem.colors.primary }}></i>
          Send Query to Support Team
        </div>
      }
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowCreateModal(false)}
            disabled={submitting}
            style={{
              padding: '8px 16px',
              border: `1px solid ${designSystem.colors.gray[300]}`,
              borderRadius: designSystem.borderRadius.md,
              background: 'white',
              color: designSystem.colors.gray[700],
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleCreateQuery}
            disabled={!queryData.subject.trim() || !queryData.description.trim() || submitting}
            style={{
              ...componentStyles.primaryButton,
              background: (!queryData.subject.trim() || !queryData.description.trim() || submitting) 
                ? designSystem.colors.gray[400] 
                : designSystem.colors.primary,
              cursor: (!queryData.subject.trim() || !queryData.description.trim() || submitting) 
                ? 'not-allowed' 
                : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {submitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Sending...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Send Query
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="row">
        <div className="col-12 mb-3">
          <label className="form-label" style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
            Subject *
          </label>
          <input
            type="text"
            className="form-control"
            style={componentStyles.formInput}
            value={queryData.subject}
            onChange={(e) => setQueryData(prev => ({...prev, subject: e.target.value}))}
            placeholder="Brief description of your question or issue"
            disabled={submitting}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <label className="form-label" style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
            Category
          </label>
          <select
            className="form-control"
            style={componentStyles.formInput}
            value={queryData.category}
            onChange={(e) => setQueryData(prev => ({...prev, category: e.target.value}))}
            disabled={submitting}
          >
            <option value="General">General Question</option>
            <option value="Technical">Technical Support</option>
            <option value="Billing">Billing & Payments</option>
            <option value="Project">Project Related</option>
            <option value="service_inquiry">Service Inquiry</option>
            <option value="payment_issue">Payment Issue</option>
            <option value="document_request">Document Request</option>
            <option value="status_update">Status Update</option>
            <option value="technical_support">Technical Support</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="col-md-6 mb-3">
          <label className="form-label" style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
            Priority
          </label>
          <select
            className="form-control"
            style={componentStyles.formInput}
            value={queryData.priority}
            onChange={(e) => setQueryData(prev => ({...prev, priority: e.target.value}))}
            disabled={submitting}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        
        <div className="col-12 mb-3">
          <label className="form-label" style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
            Description *
          </label>
          <textarea
            className="form-control"
            rows="6"
            style={{
              ...componentStyles.formInput,
              resize: 'vertical',
              minHeight: '120px'
            }}
            value={queryData.description}
            onChange={(e) => setQueryData(prev => ({...prev, description: e.target.value}))}
            placeholder="Please provide detailed information about your question or issue..."
            disabled={submitting}
          />
        </div>
        
        <div className="col-12 mb-3">
          <label className="form-label" style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
            Attachments (Optional)
          </label>
          <input
            type="file"
            className="form-control"
            style={componentStyles.formInput}
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            onChange={(e) => setQueryData(prev => ({...prev, attachments: Array.from(e.target.files)}))}
            disabled={submitting}
          />
          <small className="form-text text-muted">
            You can attach documents, images, or other relevant files (max 10MB per file)
          </small>
          {queryData.attachments.length > 0 && (
            <div style={{ marginTop: designSystem.spacing.sm }}>
              <strong>Selected files:</strong>
              <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                {queryData.attachments.map((file, index) => (
                  <li key={index} style={{ fontSize: designSystem.typography.fontSize.sm }}>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="alert alert-info" style={{ 
        backgroundColor: designSystem.colors.blue[50],
        border: `1px solid ${designSystem.colors.blue[200]}`,
        borderRadius: designSystem.borderRadius.card,
        padding: designSystem.spacing.md
      }}>
        <i className="fas fa-info-circle me-2" style={{ color: designSystem.colors.blue[600] }}></i>
        Your query will be sent to our support team. They typically respond within 24 hours. For urgent matters, please call our office directly.
      </div>
    </StableModal>
  );

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
      {/* Header */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-question-circle fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Support & Queries</h4>
            <p style={componentStyles.headerSubtitle}>Send queries to admin/managers and track responses</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.primary
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

      {/* Query Tabs with Send Query Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: designSystem.spacing.lg 
      }}>
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
        
        {/* Send Query Button - Right End */}
        <button 
          type="button"
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onClick={() => setShowCreateModal(true)}
          {...hoverEffects.button}
        >
          <i className="fas fa-paper-plane"></i>Send Query
        </button>
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
              ? 'You haven\'t sent any queries yet. Need help? Send your first query to our admin/managers!'
              : `You don't have any ${activeTab.replace('_', ' ')} queries at the moment.`}
          </p>
          {activeTab === 'all' && (
            <button
              type="button"
              style={{
                ...componentStyles.primaryButton,
                background: designSystem.colors.primary,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0 auto'
              }}
              onClick={() => setShowCreateModal(true)}
              {...hoverEffects.button}
            >
              <i className="fas fa-paper-plane"></i>Send Your First Query
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

      {/* Modals */}
      <QueryDetailsModal />
      <CreateQueryModal />
    </div>
  );
};

export default ClientQueries;