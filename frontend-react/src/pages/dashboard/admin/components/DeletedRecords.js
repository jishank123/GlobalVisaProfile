import { useState, useEffect } from 'react';
import { 
  clientsAPI, 
  leadsAPI, 
  projectsAPI, 
  usersAPI, 
  servicesAPI,
  paymentsAPI,
  queriesAPI 
} from '../../../../services/api';
import { componentStyles } from '../../../../styles/designSystem';

const DeletedRecords = () => {
  const [deletedRecords, setDeletedRecords] = useState({
    clients: [],
    leads: [],
    projects: [],
    users: [],
    services: [],
    payments: [],
    queries: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('clients');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadDeletedRecords();
  }, []);

  const loadDeletedRecords = async () => {
    try {
      setLoading(true);
      
      // Load deleted records from each API
      // Note: This assumes the APIs support a 'deleted=true' filter
      // You may need to modify the backend to support this functionality
      
      const [clients, leads, projects, users, services, payments, queries] = await Promise.allSettled([
        clientsAPI.getAll({ deleted: true }),
        leadsAPI.getAll({ deleted: true }),
        projectsAPI.getAll({ deleted: true }),
        usersAPI.getAll({ deleted: true }),
        servicesAPI.getAll({ deleted: true }),
        paymentsAPI.getAll({ deleted: true }),
        queriesAPI.getAll({ deleted: true })
      ]);

      setDeletedRecords({
        clients: clients.status === 'fulfilled' && clients.value.success ? clients.value.data : [],
        leads: leads.status === 'fulfilled' && leads.value.success ? leads.value.data : [],
        projects: projects.status === 'fulfilled' && projects.value.success ? projects.value.data : [],
        users: users.status === 'fulfilled' && users.value.success ? users.value.data : [],
        services: services.status === 'fulfilled' && services.value.success ? services.value.data : [],
        payments: payments.status === 'fulfilled' && payments.value.success ? payments.value.data : [],
        queries: queries.status === 'fulfilled' && queries.value.success ? queries.value.data : []
      });
    } catch (error) {
      console.error('Error loading deleted records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (recordType, recordId) => {
    try {
      setLoading(true);
      
      let response;
      switch (recordType) {
        case 'clients':
          response = await clientsAPI.update(recordId, { deleted: false });
          break;
        case 'leads':
          response = await leadsAPI.update(recordId, { deleted: false });
          break;
        case 'projects':
          response = await projectsAPI.update(recordId, { deleted: false });
          break;
        case 'users':
          response = await usersAPI.update(recordId, { deleted: false });
          break;
        case 'services':
          response = await servicesAPI.update(recordId, { deleted: false });
          break;
        case 'payments':
          response = await paymentsAPI.update(recordId, { deleted: false });
          break;
        case 'queries':
          response = await queriesAPI.update(recordId, { deleted: false });
          break;
        default:
          throw new Error('Invalid record type');
      }

      if (response.success) {
        await loadDeletedRecords();
        setShowRestoreModal(false);
        setSelectedRecord(null);
        alert('Record restored successfully');
      }
    } catch (error) {
      console.error('Error restoring record:', error);
      alert('Failed to restore record');
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = async (recordType, recordId) => {
    if (!window.confirm('Are you sure you want to permanently delete this record? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      
      let response;
      switch (recordType) {
        case 'clients':
          response = await clientsAPI.delete(recordId);
          break;
        case 'leads':
          response = await leadsAPI.delete(recordId);
          break;
        case 'projects':
          response = await projectsAPI.delete(recordId);
          break;
        case 'users':
          response = await usersAPI.delete(recordId);
          break;
        case 'services':
          response = await servicesAPI.delete(recordId);
          break;
        case 'payments':
          response = await paymentsAPI.delete(recordId);
          break;
        case 'queries':
          response = await queriesAPI.delete(recordId);
          break;
        default:
          throw new Error('Invalid record type');
      }

      if (response.success) {
        await loadDeletedRecords();
        alert('Record permanently deleted');
      }
    } catch (error) {
      console.error('Error permanently deleting record:', error);
      alert('Failed to permanently delete record');
    } finally {
      setLoading(false);
    }
  };

  const getRecordCount = (type) => {
    return deletedRecords[type]?.length || 0;
  };

  const getTotalDeletedCount = () => {
    return Object.values(deletedRecords).reduce((total, records) => total + (records?.length || 0), 0);
  };

  const renderRecordsTable = (records, type) => {
    if (!records || records.length === 0) {
      return (
        <div className="text-center py-4">
          <i className="fas fa-trash-alt fa-3x text-muted mb-3"></i>
          <p className="text-muted">No deleted {type} found</p>
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <table className="table table-hover" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
            <tr>
              {type === 'clients' && (
                <>
                  <th>Name</th>
                  <th>Email</th>
                  <th>University</th>
                  <th>Deleted Date</th>
                </>
              )}
              {type === 'leads' && (
                <>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Deleted Date</th>
                </>
              )}
              {type === 'projects' && (
                <>
                  <th>Service Name</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Deleted Date</th>
                </>
              )}
              {type === 'users' && (
                <>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Deleted Date</th>
                </>
              )}
              {type === 'services' && (
                <>
                  <th>Service Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Deleted Date</th>
                </>
              )}
              {type === 'payments' && (
                <>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Deleted Date</th>
                </>
              )}
              {type === 'queries' && (
                <>
                  <th>Subject</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Deleted Date</th>
                </>
              )}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record._id}>
                {type === 'clients' && (
                  <>
                    <td>{record.name}</td>
                    <td>{record.email}</td>
                    <td>{record.university}</td>
                    <td>{record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : 'N/A'}</td>
                  </>
                )}
                {type === 'leads' && (
                  <>
                    <td>{record.name}</td>
                    <td>{record.email}</td>
                    <td>
                      <span className="badge bg-secondary">{record.status}</span>
                    </td>
                    <td>{record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : 'N/A'}</td>
                  </>
                )}
                {type === 'projects' && (
                  <>
                    <td>{record.service_name}</td>
                    <td>{record.client?.name}</td>
                    <td>
                      <span className="badge bg-secondary">{record.status}</span>
                    </td>
                    <td>{record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : 'N/A'}</td>
                  </>
                )}
                {type === 'users' && (
                  <>
                    <td>{record.first_name} {record.last_name}</td>
                    <td>{record.email}</td>
                    <td>
                      <span className="badge bg-info">{record.role}</span>
                    </td>
                    <td>{record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : 'N/A'}</td>
                  </>
                )}
                {type === 'services' && (
                  <>
                    <td>{record.name}</td>
                    <td>{record.category}</td>
                    <td>${record.price}</td>
                    <td>{record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : 'N/A'}</td>
                  </>
                )}
                {type === 'payments' && (
                  <>
                    <td>{record.client?.name}</td>
                    <td>${record.amount}</td>
                    <td>
                      <span className="badge bg-secondary">{record.status}</span>
                    </td>
                    <td>{record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : 'N/A'}</td>
                  </>
                )}
                {type === 'queries' && (
                  <>
                    <td>{record.subject}</td>
                    <td>{record.client?.name}</td>
                    <td>
                      <span className="badge bg-secondary">{record.status}</span>
                    </td>
                    <td>{record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : 'N/A'}</td>
                  </>
                )}
                <td>
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-outline-success"
                      onClick={() => {
                        setSelectedRecord({ ...record, type });
                        setShowRestoreModal(true);
                      }}
                      title="Restore Record"
                    >
                      <i className="fas fa-undo"></i>
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handlePermanentDelete(type, record._id)}
                      title="Permanently Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="management-card" style={componentStyles.managementCard}>
      {/* Enhanced Header */}
      <div style={componentStyles.header}>
        <div className="d-flex align-items-center">
          <div 
            className="icon-wrapper me-3"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '12px',
              padding: '12px',
              color: 'white'
            }}
          >
            <i className="fas fa-trash-alt fa-lg"></i>
          </div>
          <div>
            <h4 className="mb-1" style={{ color: '#1e293b', fontWeight: '600' }}>
              Deleted Records
            </h4>
            <p className="text-muted mb-0">Manage and restore deleted records</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-danger fs-6">
            Total Deleted: {getTotalDeletedCount()}
          </span>
          <button 
            className="btn btn-lg px-4 py-2"
            onClick={loadDeletedRecords}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: '500',
              boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="fas fa-sync me-2"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards - ContactsManagement Style */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-danger" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-users fa-2x text-danger mb-2"></i>
              <h4 className="text-danger">{getRecordCount('clients')}</h4>
              <small className="text-muted">Deleted Clients</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-warning" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-user-tie fa-2x text-warning mb-2"></i>
              <h4 className="text-warning">{getRecordCount('leads')}</h4>
              <small className="text-muted">Deleted Leads</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-primary" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-project-diagram fa-2x text-primary mb-2"></i>
              <h4 className="text-primary">{getRecordCount('projects')}</h4>
              <small className="text-muted">Deleted Projects</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-secondary" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-user-cog fa-2x text-secondary mb-2"></i>
              <h4 className="text-secondary">{getRecordCount('users')}</h4>
              <small className="text-muted">Deleted Users</small>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card border-success" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-cogs fa-2x text-success mb-2"></i>
              <h4 className="text-success">{getRecordCount('services')}</h4>
              <small className="text-muted">Deleted Services</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-info" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-credit-card fa-2x text-info mb-2"></i>
              <h4 className="text-info">{getRecordCount('payments')}</h4>
              <small className="text-muted">Deleted Payments</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-dark" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-question-circle fa-2x text-dark mb-2"></i>
              <h4 className="text-dark">{getRecordCount('queries')}</h4>
              <small className="text-muted">Deleted Queries</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', border: 'none' }}>
          <ul className="nav nav-tabs card-header-tabs" style={{ border: 'none' }}>
            {Object.keys(deletedRecords).map((type) => (
              <li className="nav-item" key={type}>
                <button
                  className={`nav-link ${activeTab === type ? 'active' : ''}`}
                  onClick={() => setActiveTab(type)}
                  style={{
                    border: 'none',
                    color: activeTab === type ? '#1e3a8a' : 'rgba(255,255,255,0.8)',
                    backgroundColor: activeTab === type ? 'white' : 'transparent',
                    borderRadius: '8px 8px 0 0',
                    fontWeight: '500'
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} 
                  <span className="badge bg-danger ms-2">{getRecordCount(type)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-body" style={{ padding: '32px' }}>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            renderRecordsTable(deletedRecords[activeTab], activeTab)
          )}
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && selectedRecord && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog">
            <div className="modal-content" style={{ border: 'none', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)' }}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white', border: 'none', padding: '24px 32px 16px' }}>
                <h5 className="modal-title">
                  <i className="fas fa-undo me-2"></i>Restore Record
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowRestoreModal(false);
                    setSelectedRecord(null);
                  }}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '32px' }}>
                <p>Are you sure you want to restore this {selectedRecord.type.slice(0, -1)} record?</p>
                <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <div className="card-body">
                    {selectedRecord.type === 'clients' && (
                      <>
                        <p><strong>Name:</strong> {selectedRecord.name}</p>
                        <p><strong>Email:</strong> {selectedRecord.email}</p>
                      </>
                    )}
                    {selectedRecord.type === 'leads' && (
                      <>
                        <p><strong>Name:</strong> {selectedRecord.name}</p>
                        <p><strong>Email:</strong> {selectedRecord.email}</p>
                      </>
                    )}
                    {selectedRecord.type === 'projects' && (
                      <>
                        <p><strong>Service:</strong> {selectedRecord.service_name}</p>
                        <p><strong>Client:</strong> {selectedRecord.client?.name}</p>
                      </>
                    )}
                    {selectedRecord.type === 'users' && (
                      <>
                        <p><strong>Name:</strong> {selectedRecord.first_name} {selectedRecord.last_name}</p>
                        <p><strong>Email:</strong> {selectedRecord.email}</p>
                      </>
                    )}
                    {selectedRecord.type === 'services' && (
                      <>
                        <p><strong>Service:</strong> {selectedRecord.name}</p>
                        <p><strong>Category:</strong> {selectedRecord.category}</p>
                      </>
                    )}
                    {selectedRecord.type === 'payments' && (
                      <>
                        <p><strong>Client:</strong> {selectedRecord.client?.name}</p>
                        <p><strong>Amount:</strong> ${selectedRecord.amount}</p>
                      </>
                    )}
                    {selectedRecord.type === 'queries' && (
                      <>
                        <p><strong>Subject:</strong> {selectedRecord.subject}</p>
                        <p><strong>Client:</strong> {selectedRecord.client?.name}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '16px 32px 32px', background: '#f8fafc', border: 'none' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRestoreModal(false);
                    setSelectedRecord(null);
                  }}
                  style={{ borderRadius: '12px', fontWeight: '500' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleRestore(selectedRecord.type, selectedRecord._id)}
                  disabled={loading}
                  style={{ 
                    borderRadius: '12px', 
                    fontWeight: '500',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {loading ? 'Restoring...' : 'Restore Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletedRecords;