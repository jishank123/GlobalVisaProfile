import { useState, useEffect } from 'react';
import { queriesAPI, clientsAPI } from '../../../../services/api';

const QueriesManagement = () => {
  const [queries, setQueries] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });
  const [formData, setFormData] = useState({
    client: '',
    subject: '',
    description: '',
    category: 'General',
    priority: 'medium'
  });
  const [responseData, setResponseData] = useState({
    message: '',
    isInternal: false
  });

  useEffect(() => {
    loadQueriesData();
    loadClients();
  }, [filters]);

  const loadQueriesData = async () => {
    try {
      setLoading(true);
      const response = await queriesAPI.getAll(filters);
      if (response.success) {
        setQueries(response.data || []);
      }
    } catch (error) {
      console.error('Error loading queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      if (response.success) {
        setClients(response.data || []);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleAddQuery = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await queriesAPI.create(formData);
      if (response.success) {
        await loadQueriesData();
        setShowAddModal(false);
        setFormData({
          client: '',
          subject: '',
          description: '',
          category: 'General',
          priority: 'medium'
        });
      }
    } catch (error) {
      console.error('Error adding query:', error);
      alert('Failed to add query');
    } finally {
      setLoading(false);
    }
  };

  const handleAddResponse = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await queriesAPI.addResponse(
        selectedQuery._id, 
        responseData.message, 
        responseData.isInternal
      );
      if (response.success) {
        await loadQueriesData();
        setShowResponseModal(false);
        setSelectedQuery(null);
        setResponseData({ message: '', isInternal: false });
      }
    } catch (error) {
      console.error('Error adding response:', error);
      alert('Failed to add response');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (queryId, newStatus) => {
    try {
      setLoading(true);
      const response = await queriesAPI.update(queryId, { status: newStatus });
      if (response.success) {
        await loadQueriesData();
      }
    } catch (error) {
      console.error('Error updating query status:', error);
      alert('Failed to update query status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'open': 'bg-warning',
      'in_progress': 'bg-info',
      'waiting': 'bg-secondary',
      'resolved': 'bg-success',
      'closed': 'bg-dark'
    };
    return statusClasses[status] || 'bg-secondary';
  };

  const getPriorityBadgeClass = (priority) => {
    const priorityClasses = {
      'low': 'bg-success',
      'medium': 'bg-warning',
      'high': 'bg-danger',
      'urgent': 'bg-danger'
    };
    return priorityClasses[priority] || 'bg-secondary';
  };

  const queryStats = {
    open: queries.filter(q => q.status === 'open').length,
    in_progress: queries.filter(q => q.status === 'in_progress').length,
    resolved: queries.filter(q => q.status === 'resolved').length,
    closed: queries.filter(q => q.status === 'closed').length
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-question-circle text-primary me-2"></i>
          Queries Management
        </h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Add New Query
        </button>
      </div>

      {/* Query Stats */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{queryStats.open}</h4>
                  <p className="mb-0">Open Queries</p>
                </div>
                <i className="fas fa-exclamation-circle fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{queryStats.in_progress}</h4>
                  <p className="mb-0">In Progress</p>
                </div>
                <i className="fas fa-spinner fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{queryStats.resolved}</h4>
                  <p className="mb-0">Resolved</p>
                </div>
                <i className="fas fa-check fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4>{queryStats.closed}</h4>
                  <p className="mb-0">Closed</p>
                </div>
                <i className="fas fa-archive fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting">Waiting</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="General">General</option>
                <option value="Technical">Technical</option>
                <option value="Billing">Billing</option>
                <option value="Support">Support</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({ status: '', priority: '', category: '' })}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Queries Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">All Queries ({queries.length})</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Client</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Responses</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queries.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <i className="fas fa-question-circle fa-3x text-muted mb-3"></i>
                        <p className="text-muted">No queries found</p>
                      </td>
                    </tr>
                  ) : (
                    queries.map((query) => (
                      <tr key={query._id}>
                        <td>
                          <strong>{query.subject}</strong>
                          <small className="d-block text-muted">
                            {query.description?.substring(0, 50)}...
                          </small>
                        </td>
                        <td>
                          <div>
                            <strong>{query.client?.name}</strong>
                            <small className="d-block text-muted">{query.client?.email}</small>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">{query.category}</span>
                        </td>
                        <td>
                          <span className={`badge ${getPriorityBadgeClass(query.priority)}`}>
                            {query.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(query.status)}`}>
                            {query.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          {new Date(query.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {query.responses?.length || 0}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => {
                                setSelectedQuery(query);
                                setShowResponseModal(true);
                              }}
                              title="Add Response"
                            >
                              <i className="fas fa-reply"></i>
                            </button>
                            <div className="dropdown">
                              <button
                                className="btn btn-outline-secondary dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                title="Update Status"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleUpdateStatus(query._id, 'open')}
                                  >
                                    Open
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleUpdateStatus(query._id, 'in_progress')}
                                  >
                                    In Progress
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleUpdateStatus(query._id, 'waiting')}
                                  >
                                    Waiting
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleUpdateStatus(query._id, 'resolved')}
                                  >
                                    Resolved
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleUpdateStatus(query._id, 'closed')}
                                  >
                                    Closed
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Query Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Query</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddQuery}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Client *</label>
                    <select
                      className="form-select"
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      required
                    >
                      <option value="">Select Client</option>
                      {clients.map(client => (
                        <option key={client._id} value={client._id}>
                          {client.name} ({client.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Subject *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="General">General</option>
                        <option value="Technical">Technical</option>
                        <option value="Billing">Billing</option>
                        <option value="Support">Support</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Query'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedQuery && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Respond to Query: {selectedQuery.subject}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowResponseModal(false);
                    setSelectedQuery(null);
                  }}
                ></button>
              </div>
              <form onSubmit={handleAddResponse}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Query Details</label>
                    <div className="card bg-light">
                      <div className="card-body">
                        <p><strong>Client:</strong> {selectedQuery.client?.name}</p>
                        <p><strong>Subject:</strong> {selectedQuery.subject}</p>
                        <p><strong>Description:</strong> {selectedQuery.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedQuery.responses && selectedQuery.responses.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">Previous Responses</label>
                      <div className="card">
                        <div className="card-body" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {selectedQuery.responses.map((response, index) => (
                            <div key={index} className="mb-2 p-2 border-bottom">
                              <small className="text-muted">
                                {response.user?.first_name} {response.user?.last_name} - {new Date(response.timestamp).toLocaleString()}
                                {response.isInternal && <span className="badge bg-warning ms-2">Internal</span>}
                              </small>
                              <p className="mb-0">{response.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Response Message *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={responseData.message}
                      onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={responseData.isInternal}
                        onChange={(e) => setResponseData({ ...responseData, isInternal: e.target.checked })}
                      />
                      <label className="form-check-label">
                        Internal Note (not visible to client)
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowResponseModal(false);
                      setSelectedQuery(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding Response...' : 'Add Response'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueriesManagement;