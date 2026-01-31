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
        <table className="table table-hover">
          <thead>
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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-trash-alt text-danger me-2"></i>
          Deleted Records
        </h2>
        <div className="d-flex gap-2">
          <span className="badge bg-danger fs-6">
            Total Deleted: {getTotalDeletedCount()}
          </span>
          <button 
            className="btn btn-outline-warning"
            onClick={loadDeletedRecords}
            disabled={loading}
          >
            <i className="fas fa-sync me-2"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h4 className="text-danger">{getRecordCount('clients')}</h4>
              <p className="mb-0">Deleted Clients</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h4 className="text-danger">{getRecordCount('leads')}</h4>
              <p className="mb-0">Deleted Leads</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h4 className="text-danger">{getRecordCount('projects')}</h4>
              <p className="mb-0">Deleted Projects</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h4 className="text-danger">{getRecordCount('users')}</h4>
              <p className="mb-0">Deleted Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            {Object.keys(deletedRecords).map((type) => (
              <li className="nav-item" key={type}>
                <button
                  className={`nav-link ${activeTab === type ? 'active' : ''}`}
                  onClick={() => setActiveTab(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} 
                  <span className="badge bg-danger ms-2">{getRecordCount(type)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-body">
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Restore Record</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowRestoreModal(false);
                    setSelectedRecord(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to restore this {selectedRecord.type.slice(0, -1)} record?</p>
                <div className="card bg-light">
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
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRestoreModal(false);
                    setSelectedRecord(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleRestore(selectedRecord.type, selectedRecord._id)}
                  disabled={loading}
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