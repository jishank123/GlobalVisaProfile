import { useState, useEffect } from 'react';
import { queriesAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const QueriesManagement = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    try {
      setLoading(true);
      // Get queries assigned to current CRM manager
      const response = await queriesAPI.getMyQueries();
      
      if (response.success) {
        setQueries(response.data || []);
      } else {
        throw new Error(response.error?.message || 'Failed to load queries');
      }

    } catch (error) {
      console.error('Error loading queries:', error);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter queries by status
  const getFilteredQueries = (status) => {
    if (status === 'all') return queries;
    return queries.filter(query => {
      switch (status) {
        case 'open':
          return query.status === 'open';
        case 'in_progress':
          return query.status === 'in_progress';
        case 'waiting':
          return query.status === 'waiting';
        case 'resolved':
          return query.status === 'resolved';
        case 'closed':
          return query.status === 'closed';
        default:
          return true;
      }
    });
  };

  // Get query counts for stats
  const getQueryCounts = () => {
    return {
      total: queries.length,
      open: queries.filter(query => query.status === 'open').length,
      inProgress: queries.filter(query => query.status === 'in_progress').length,
      waiting: queries.filter(query => query.status === 'waiting').length,
      resolved: queries.filter(query => query.status === 'resolved').length,
      closed: queries.filter(query => query.status === 'closed').length
    };
  };

  const getStatusBadgeStyle = (status) => {
    const statusStyles = {
      'open': { background: '#ef4444', color: 'white' },
      'in_progress': { background: '#3b82f6', color: 'white' },
      'waiting': { background: '#f59e0b', color: 'white' },
      'resolved': { background: '#10b981', color: 'white' },
      'closed': { background: '#6b7280', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
  };

  const getPriorityStyle = (priority) => {
    const priorityColors = {
      'low': '#10b981',
      'medium': '#f59e0b', 
      'high': '#ef4444',
      'urgent': '#dc2626'
    };
    return { color: priorityColors[priority] || '#6b7280' };
  };

  const getCategoryStyle = (category) => {
    const categoryColors = {
      'general': '#8b5cf6',
      'technical': '#3b82f6',
      'billing': '#f59e0b',
      'project': '#10b981',
      'complaint': '#ef4444'
    };
    return { background: categoryColors[category] || '#6b7280', color: 'white' };
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalData(null);
    setModalType('');
  };

  const viewQueryDetails = (query) => {
    setModalData(query);
    setModalType('view');
    setShowModal(true);
  };

  const respondToQuery = (query) => {
    setModalData(query);
    setModalType('respond');
    setShowModal(true);
  };

  const handleUpdateQueryStatus = async (queryId, newStatus) => {
    try {
      const response = await queriesAPI.updateStatus(queryId, newStatus);
      if (response.success) {
        loadQueries(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating query status:', error);
    }
  };

  const handleRespondToQuery = async (queryId, responseData) => {
    try {
      const response = await queriesAPI.addResponse(queryId, responseData);
      if (response.success) {
        loadQueries(); // Refresh the list
        handleModalClose();
      }
    } catch (error) {
      console.error('Error responding to query:', error);
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

  const renderQueryTable = (queryType) => {
    const filteredQueries = getFilteredQueries(queryType);
    
    if (filteredQueries.length === 0) {
      return (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-question-circle fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
          <p style={{ color: designSystem.colors.gray[500] }}>
            No {queryType === 'all' ? '' : queryType} queries found
          </p>
        </div>
      );
    }

    return (
      <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={componentStyles.tableHeader}>
            <tr>
              <th style={componentStyles.tableHeaderCell}>Query</th>
              <th style={componentStyles.tableHeaderCell}>Client</th>
              <th style={componentStyles.tableHeaderCell}>Category</th>
              <th style={componentStyles.tableHeaderCell}>Status</th>
              <th style={componentStyles.tableHeaderCell}>Priority</th>
              <th style={componentStyles.tableHeaderCell}>Created</th>
              <th style={componentStyles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueries.map(query => {
              const statusStyle = getStatusBadgeStyle(query.status);
              const priorityStyle = getPriorityStyle(query.priority || 'medium');
              const categoryStyle = getCategoryStyle(query.category || 'general');
              
              return (
                <tr 
                  key={query._id}
                  style={componentStyles.tableRow}
                  {...hoverEffects.tableRow}
                >
                  <td style={componentStyles.tableCell}>
                    <div>
                      <div style={{ 
                        fontWeight: designSystem.typography.fontWeight.medium,
                        marginBottom: '2px'
                      }}>
                        {query.subject || 'No Subject'}
                      </div>
                      <small style={{ color: designSystem.colors.gray[500] }}>
                        {query.description ? query.description.substring(0, 60) + '...' : 'No description'}
                      </small>
                    </div>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <div>
                      <div style={{ 
                        fontWeight: designSystem.typography.fontWeight.medium,
                        marginBottom: '2px'
                      }}>
                        {query.client?.name || 
                         (query.client?.firstName && query.client?.lastName ? 
                          `${query.client.firstName} ${query.client.lastName}` : 
                          'Unknown Client')}
                      </div>
                      <small style={{ color: designSystem.colors.gray[500] }}>
                        {query.client?.email || 'No email'}
                      </small>
                    </div>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <span style={{
                      ...componentStyles.badge,
                      background: categoryStyle.background,
                      color: categoryStyle.color,
                      textTransform: 'capitalize',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {query.category || 'General'}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <span style={{
                      ...componentStyles.badge,
                      background: statusStyle.background,
                      color: statusStyle.color,
                      textTransform: 'uppercase',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {query.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <span style={{
                      ...priorityStyle,
                      fontWeight: designSystem.typography.fontWeight.bold,
                      textTransform: 'uppercase',
                      fontSize: '12px'
                    }}>
                      {(query.priority || 'medium')}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>
                        {new Date(query.createdAt).toLocaleDateString()}
                      </div>
                      <small style={{ color: designSystem.colors.gray[500] }}>
                        {new Date(query.createdAt).toLocaleTimeString()}
                      </small>
                    </div>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => viewQueryDetails(query)}
                        title="View Query Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="btn btn-outline-success btn-sm"
                        onClick={() => respondToQuery(query)}
                        title="Respond to Query"
                      >
                        <i className="fas fa-reply"></i>
                      </button>
                      {query.status !== 'closed' && (
                        <button 
                          className="btn btn-outline-info btn-sm"
                          onClick={() => handleUpdateQueryStatus(query._id, 'resolved')}
                          title="Mark as Resolved"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={componentStyles.managementCard}>
      {/* Header with Refresh Button */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-question-circle fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Client Queries</h4>
            <p style={componentStyles.headerSubtitle}>Manage and respond to client queries and support requests</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={loadQueries}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Overview Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-question-circle"
          number={getQueryCounts().total}
          label="Total Queries"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
        <StatCard
          icon="fas fa-exclamation-circle"
          number={getQueryCounts().open}
          label="Open Queries"
          borderColor="#ef4444"
          iconColor="#ef4444"
        />
        <StatCard
          icon="fas fa-play-circle"
          number={getQueryCounts().inProgress}
          label="In Progress"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
        <StatCard
          icon="fas fa-clock"
          number={getQueryCounts().waiting}
          label="Waiting"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={getQueryCounts().resolved}
          label="Resolved"
          borderColor="#10b981"
          iconColor="#10b981"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div style={componentStyles.loading}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
          <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading queries...</p>
        </div>
      )}

      {/* Query Type Tabs */}
      {!loading && (
        <>
          <div style={{ marginBottom: designSystem.spacing.lg }}>
            <div style={{ display: 'flex', gap: designSystem.spacing.xs, flexWrap: 'wrap' }}>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: activeTab === 'all' ? designSystem.colors.primary : designSystem.colors.gray[100],
                  color: activeTab === 'all' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'all' ? designSystem.shadows.button : 'none'
                }}
                onClick={() => setActiveTab('all')}
                {...hoverEffects.button}
              >
                All Queries ({getQueryCounts().total})
              </button>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: activeTab === 'open' ? '#ef4444' : designSystem.colors.gray[100],
                  color: activeTab === 'open' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'open' ? designSystem.shadows.button : 'none'
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
                  color: activeTab === 'in_progress' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'in_progress' ? designSystem.shadows.button : 'none'
                }}
                onClick={() => setActiveTab('in_progress')}
                {...hoverEffects.button}
              >
                In Progress ({getQueryCounts().inProgress})
              </button>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: activeTab === 'waiting' ? '#f59e0b' : designSystem.colors.gray[100],
                  color: activeTab === 'waiting' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'waiting' ? designSystem.shadows.button : 'none'
                }}
                onClick={() => setActiveTab('waiting')}
                {...hoverEffects.button}
              >
                Waiting ({getQueryCounts().waiting})
              </button>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: activeTab === 'resolved' ? '#10b981' : designSystem.colors.gray[100],
                  color: activeTab === 'resolved' ? 'white' : designSystem.colors.gray[600],
                  boxShadow: activeTab === 'resolved' ? designSystem.shadows.button : 'none'
                }}
                onClick={() => setActiveTab('resolved')}
                {...hoverEffects.button}
              >
                Resolved ({getQueryCounts().resolved})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {renderQueryTable(activeTab)}
          </div>
        </>
      )}

      {/* No Queries Message */}
      {!loading && queries.length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-question-circle fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>No queries assigned to you</h6>
          <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.lg }}>Client queries assigned to you will appear here</p>
        </div>
      )}

      {/* Query Modal */}
      {showModal && (
        <QueryModal
          show={showModal}
          onHide={handleModalClose}
          type={modalType}
          data={modalData}
          onRespondToQuery={handleRespondToQuery}
        />
      )}
    </div>
  );
};

// Query Modal Component
const QueryModal = ({ show, onHide, type, data, onRespondToQuery }) => {
  const [responseText, setResponseText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  if (!show || !data) return null;

  const handleSubmitResponse = (e) => {
    e.preventDefault();
    
    if (!responseText.trim()) {
      alert('Please enter a response.');
      return;
    }

    onRespondToQuery(data._id, {
      message: responseText.trim(),
      is_internal: isInternal
    });
  };

  return (
    <div className="modal" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-question-circle me-2"></i>
              {type === 'respond' ? 'Respond to Query' : 'Query Details'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            <div className="row">
              <div className="col-md-6">
                <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                  Query Information
                </h6>
                <p><strong>Subject:</strong> {data.subject || 'No Subject'}</p>
                <p><strong>Category:</strong> {data.category || 'General'}</p>
                <p><strong>Priority:</strong> {data.priority || 'Medium'}</p>
                <p><strong>Status:</strong> {data.status || 'Open'}</p>
              </div>
              <div className="col-md-6">
                <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                  Client Information
                </h6>
                <p><strong>Name:</strong> {data.client?.name || `${data.client?.firstName || ''} ${data.client?.lastName || ''}`.trim() || 'N/A'}</p>
                <p><strong>Email:</strong> {data.client?.email || 'N/A'}</p>
                <p><strong>Created:</strong> {new Date(data.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                Query Description
              </h6>
              <div style={{
                background: designSystem.colors.gray[50],
                padding: designSystem.spacing.md,
                borderRadius: designSystem.borderRadius.button,
                border: `1px solid ${designSystem.colors.gray[200]}`
              }}>
                {data.description || 'No description provided'}
              </div>
            </div>

            {/* Previous Responses */}
            {data.responses && data.responses.length > 0 && (
              <div className="mb-4">
                <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                  Previous Responses
                </h6>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {data.responses.map((response, index) => (
                    <div 
                      key={index}
                      style={{
                        background: response.is_internal ? '#fef3c7' : '#f0f9ff',
                        padding: designSystem.spacing.sm,
                        borderRadius: designSystem.borderRadius.button,
                        marginBottom: designSystem.spacing.sm,
                        border: `1px solid ${response.is_internal ? '#fbbf24' : '#0ea5e9'}`
                      }}
                    >
                      <div style={{ 
                        fontSize: '12px', 
                        color: designSystem.colors.gray[600],
                        marginBottom: '4px'
                      }}>
                        {response.is_internal ? 'Internal Note' : 'Response'} - {new Date(response.created_at).toLocaleString()}
                      </div>
                      <div>{response.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Response Form */}
            {type === 'respond' && (
              <div>
                <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                  Add Response
                </h6>
                <form onSubmit={handleSubmitResponse}>
                  <div className="mb-3">
                    <textarea 
                      className="form-control"
                      rows="4"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Enter your response..."
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input 
                        className="form-check-input"
                        type="checkbox"
                        id="internalNote"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="internalNote">
                        Internal note (not visible to client)
                      </label>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Close
            </button>
            {type === 'respond' && (
              <button type="button" className="btn btn-primary" onClick={handleSubmitResponse}>
                Send Response
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueriesManagement;