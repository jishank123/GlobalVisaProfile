import { useState, useEffect } from 'react';
import { queriesAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const QueriesManagement = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);

  useEffect(() => {
    loadQueriesData();
  }, []);

  const loadQueriesData = async () => {
    try {
      setLoading(true);
      const response = await queriesAPI.getAll();
      if (response.success) {
        setQueries(response.data || []);
      }
    } catch (error) {
      console.error('Error loading queries:', error);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  const viewQueryDetails = (query) => {
    setSelectedQuery(query);
    setShowViewModal(true);
  };

  const getStatusBadgeStyle = (status) => {
    const statusStyles = {
      'open': { background: '#f59e0b', color: 'white' },
      'in_progress': { background: '#3b82f6', color: 'white' },
      'waiting': { background: '#8b5cf6', color: 'white' },
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

  const queryStats = {
    total: queries.length,
    open: queries.filter(q => q.status === 'open').length,
    in_progress: queries.filter(q => q.status === 'in_progress').length,
    resolved: queries.filter(q => q.status === 'resolved').length,
    closed: queries.filter(q => q.status === 'closed').length
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
      {/* Header with Refresh Button */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-question-circle fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Queries Monitoring</h4>
            <p style={componentStyles.headerSubtitle}>Monitor communication between CRM managers and clients</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={loadQueriesData}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Query Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-question-circle"
          number={queryStats.total}
          label="Total Queries"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
        <StatCard
          icon="fas fa-exclamation-circle"
          number={queryStats.open}
          label="Open Queries"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-spinner"
          number={queryStats.in_progress}
          label="In Progress"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={queryStats.resolved}
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

      {/* Queries Table */}
      {!loading && (
        <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={componentStyles.tableHeader}>
              <tr>
                <th style={componentStyles.tableHeaderCell}>Query ID</th>
                <th style={componentStyles.tableHeaderCell}>Subject</th>
                <th style={componentStyles.tableHeaderCell}>Client</th>
                <th style={componentStyles.tableHeaderCell}>Category</th>
                <th style={componentStyles.tableHeaderCell}>Priority</th>
                <th style={componentStyles.tableHeaderCell}>Status</th>
                <th style={componentStyles.tableHeaderCell}>Created</th>
                <th style={componentStyles.tableHeaderCell}>Responses</th>
                <th style={componentStyles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queries.length === 0 ? (
                <tr>
                  <td colSpan="9" style={componentStyles.emptyState}>
                    <i className="fas fa-question-circle fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
                    <p style={{ color: designSystem.colors.gray[500] }}>No queries found in the system</p>
                  </td>
                </tr>
              ) : (
                queries.map((query) => {
                  const statusStyle = getStatusBadgeStyle(query.status);
                  const priorityStyle = getPriorityStyle(query.priority);
                  
                  return (
                    <tr 
                      key={query._id}
                      style={componentStyles.tableRow}
                      {...hoverEffects.tableRow}
                    >
                      <td style={componentStyles.tableCell}>
                        <span 
                          style={{
                            ...componentStyles.badge,
                            background: designSystem.colors.primary,
                            color: 'white',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            fontWeight: '600',
                            padding: '6px 12px'
                          }}
                        >
                          {query.query_id || `#${query._id.slice(-8).toUpperCase()}`}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div>
                          <div style={{ 
                            fontWeight: designSystem.typography.fontWeight.medium,
                            marginBottom: '2px'
                          }}>
                            {query.subject}
                          </div>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            {query.description?.substring(0, 50)}...
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
                          background: '#8b5cf6',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {query.category || 'General'}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <span style={{
                          ...priorityStyle,
                          fontWeight: designSystem.typography.fontWeight.bold,
                          textTransform: 'uppercase',
                          fontSize: '12px'
                        }}>
                          ● {query.priority || 'Medium'}
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
                          {query.status?.replace('_', ' ') || 'Open'}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div>
                          <div style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                            {new Date(query.createdAt).toLocaleDateString()}
                          </div>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            {new Date(query.createdAt).toLocaleDateString('en-US', { weekday: 'short' })}
                          </small>
                        </div>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                          <span style={{
                            background: '#3b82f6',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {query.responses?.length || 0}
                          </span>
                          {query.responses?.length > 0 && (
                            <small style={{ color: designSystem.colors.gray[500] }}>
                              responses
                            </small>
                          )}
                        </div>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => viewQueryDetails(query)}
                          title="View Query Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* No Queries Message */}
      {!loading && queries.length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-question-circle fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>No queries found in the system</h6>
          <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.lg }}>Client queries and communications will appear here</p>
        </div>
      )}

      {/* Query Details Modal */}
      {showViewModal && selectedQuery && (
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
          onClick={() => setShowViewModal(false)}
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
                  <i className="fas fa-question-circle me-2"></i>
                  Query Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: designSystem.spacing.md }}>
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.gray[500],
                      marginBottom: designSystem.spacing.xs
                    }}>Query ID</label>
                    <div style={{ 
                      fontWeight: designSystem.typography.fontWeight.semibold,
                      fontFamily: 'monospace',
                      fontSize: designSystem.typography.fontSize.lg,
                      color: designSystem.colors.primary
                    }}>
                      {selectedQuery.query_id || `#${selectedQuery._id.slice(-8).toUpperCase()}`}
                    </div>
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.gray[500],
                      marginBottom: designSystem.spacing.xs
                    }}>Subject</label>
                    <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                      {selectedQuery.subject}
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
                      <div>{selectedQuery.client?.name || 
                       (selectedQuery.client?.firstName && selectedQuery.client?.lastName ? 
                        `${selectedQuery.client.firstName} ${selectedQuery.client.lastName}` : 
                        'Unknown Client')}</div>
                      <small style={{ color: designSystem.colors.gray[500], fontWeight: 'normal' }}>
                        {selectedQuery.client?.email || 'No email'}
                      </small>
                    </div>
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.gray[500],
                      marginBottom: designSystem.spacing.xs
                    }}>Category & Priority</label>
                    <div style={{ display: 'flex', gap: designSystem.spacing.sm, alignItems: 'center' }}>
                      <span style={{
                        background: '#8b5cf6',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {selectedQuery.category || 'General'}
                      </span>
                      <span style={{
                        color: getPriorityStyle(selectedQuery.priority).color,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        fontSize: '14px'
                      }}>
                        ● {selectedQuery.priority || 'Medium'}
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
                        background: getStatusBadgeStyle(selectedQuery.status).background,
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        fontWeight: '600'
                      }}>
                        {selectedQuery.status?.replace('_', ' ') || 'Open'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block',
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.gray[500],
                      marginBottom: designSystem.spacing.xs
                    }}>Created Date</label>
                    <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                      <div>{new Date(selectedQuery.createdAt).toLocaleDateString()}</div>
                      <small style={{ color: designSystem.colors.gray[500], fontWeight: 'normal' }}>
                        {new Date(selectedQuery.createdAt).toLocaleDateString('en-US', { weekday: 'long' })}
                      </small>
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ 
                      display: 'block',
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.gray[500],
                      marginBottom: designSystem.spacing.xs
                    }}>Query Description</label>
                    <div style={{ 
                      fontWeight: designSystem.typography.fontWeight.semibold,
                      background: designSystem.colors.gray[50],
                      padding: designSystem.spacing.md,
                      borderRadius: '8px',
                      minHeight: '80px',
                      border: `1px solid ${designSystem.colors.gray[200]}`
                    }}>
                      {selectedQuery.description || 'No description available'}
                    </div>
                  </div>
                  
                  {/* Responses Section */}
                  {selectedQuery.responses && selectedQuery.responses.length > 0 && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ 
                        display: 'block',
                        fontSize: designSystem.typography.fontSize.sm,
                        color: designSystem.colors.gray[500],
                        marginBottom: designSystem.spacing.xs
                      }}>Communication History ({selectedQuery.responses.length} responses)</label>
                      <div style={{ 
                        maxHeight: '300px', 
                        overflowY: 'auto',
                        border: `1px solid ${designSystem.colors.gray[200]}`,
                        borderRadius: '8px'
                      }}>
                        {selectedQuery.responses.map((response, index) => (
                          <div key={index} style={{
                            padding: designSystem.spacing.md,
                            borderBottom: index < selectedQuery.responses.length - 1 ? `1px solid ${designSystem.colors.gray[200]}` : 'none',
                            background: response.isInternal ? '#fff7ed' : 'white'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: designSystem.spacing.xs }}>
                              <div>
                                <span style={{ fontWeight: '600', color: designSystem.colors.dark }}>
                                  {response.user?.first_name} {response.user?.last_name}
                                </span>
                                {response.isInternal && (
                                  <span style={{
                                    background: '#f97316',
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    marginLeft: designSystem.spacing.xs
                                  }}>
                                    INTERNAL
                                  </span>
                                )}
                              </div>
                              <small style={{ color: designSystem.colors.gray[500] }}>
                                {new Date(response.timestamp).toLocaleString()}
                              </small>
                            </div>
                            <p style={{ margin: 0, color: designSystem.colors.dark }}>
                              {response.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueriesManagement;