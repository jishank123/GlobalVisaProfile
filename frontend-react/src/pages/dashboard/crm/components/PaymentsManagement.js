import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const PaymentsManagement = () => {
  const [projects, setProjects] = useState([]); // For service purchases
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalType, setModalType] = useState(''); // 'view', 'approve', 'reject'
  const [approvalData, setApprovalData] = useState({
    verification_status: '',
    admin_notes: ''
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'verified', 'rejected'
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    totalAmount: 0,
    pendingAmount: 0
  });

  useEffect(() => {
    loadPaymentsData();
  }, []);

  const loadPaymentsData = async () => {
    try {
      setLoading(true);
      // Load projects (service purchases) for CRM manager's assigned clients
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://backend.immigrationprofile.com/api'}/projects/my-projects`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        // Filter projects that have payment information
        const projectsWithPayments = result.data.filter(project => 
          project.payment_method || project.payment_receipt || project.amount
        );
        setProjects(projectsWithPayments);
        calculateStats(projectsWithPayments);
      }
    } catch (error) {
      console.error('Error loading CRM payments:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (projectsData) => {
    const stats = {
      total: projectsData.length,
      pending: projectsData.filter(p => p.status === 'pending').length,
      verified: projectsData.filter(p => p.status === 'active' || p.status === 'in_progress' || p.status === 'completed').length,
      rejected: projectsData.filter(p => p.status === 'cancelled').length,
      totalAmount: projectsData.reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingAmount: projectsData.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0)
    };
    setStats(stats);
  };

  const handlePaymentAction = async (projectId, action, notes = '') => {
    try {
      setLoading(true);
      
      // Update project status based on action
      const newStatus = action === 'verified' ? 'active' : 'cancelled';
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://backend.immigrationprofile.com/api'}/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: notes,
          verification_status: action,
          verified_at: new Date().toISOString(),
          verified_by: 'CRM Manager'
        })
      });

      const result = await response.json();
      if (result.success) {
        await loadPaymentsData();
        setShowPaymentModal(false);
        setSelectedPayment(null);
        setApprovalData({ verification_status: '', admin_notes: '' });
        alert(`Payment ${action === 'verified' ? 'approved' : 'rejected'} successfully!`);
      } else {
        throw new Error(result.message || result.error?.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (projectId) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://backend.immigrationprofile.com/api'}/projects/${projectId}/invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        alert(`Invoice ${result.data.invoice_number} generated successfully!`);
        
        // Create a form to submit with token for invoice viewing
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `${process.env.REACT_APP_API_URL || 'https://backend.immigrationprofile.com/api'}/invoices/${result.data._id}/download`;
        form.target = '_blank';
        
        // Add token as hidden field
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'token';
        tokenInput.value = localStorage.getItem('token');
        form.appendChild(tokenInput);
        
        // Submit form to download invoice
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
      } else {
        throw new Error(result.error?.message || result.message || 'Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const viewPaymentDetails = (project, type = 'view') => {
    setSelectedPayment(project);
    setModalType(type);
    if (type === 'approve') {
      setApprovalData({ verification_status: 'verified', admin_notes: '' });
    } else if (type === 'reject') {
      setApprovalData({ verification_status: 'rejected', admin_notes: '' });
    }
    setShowPaymentModal(true);
  };

  const getFilteredProjects = () => {
    let filtered = projects;
    
    // Filter by tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(p => p.status === 'pending');
    } else if (activeTab === 'verified') {
      filtered = filtered.filter(p => p.status === 'active' || p.status === 'in_progress' || p.status === 'completed');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(p => p.status === 'cancelled');
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getStatusBadgeStyle = (status) => {
    const statusStyles = {
      'pending': { background: '#f59e0b', color: 'white' },
      'active': { background: '#10b981', color: 'white' },
      'in_progress': { background: '#3b82f6', color: 'white' },
      'completed': { background: '#10b981', color: 'white' },
      'cancelled': { background: '#ef4444', color: 'white' },
      'on_hold': { background: '#6b7280', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
  };

  const getStatusDisplayText = (status) => {
    const statusText = {
      'pending': 'Payment Pending',
      'active': 'Payment Confirmed',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Payment Rejected',
      'on_hold': 'On Hold'
    };
    return statusText[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
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
        {typeof number === 'string' ? number : number.toLocaleString()}
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
            <i className="fas fa-credit-card fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Client Payments Management</h4>
            <p style={componentStyles.headerSubtitle}>Review and verify client service payments for your assigned clients</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.success
            }}
            onClick={loadPaymentsData}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>
      </div>

      {/* Payment Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-shopping-bag"
          number={stats.total}
          label="Total Service Purchases"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
        <StatCard
          icon="fas fa-clock"
          number={stats.pending}
          label="Pending Verification"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={stats.verified}
          label="Verified Payments"
          borderColor="#10b981"
          iconColor="#10b981"
        />
        <StatCard
          icon="fas fa-times-circle"
          number={stats.rejected}
          label="Rejected Payments"
          borderColor="#ef4444"
          iconColor="#ef4444"
        />
        <StatCard
          icon="fas fa-dollar-sign"
          number={formatCurrency(stats.totalAmount)}
          label="Total Revenue"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
      </div>

      {/* Search and Filter Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: designSystem.spacing.lg,
        gap: designSystem.spacing.md,
        flexWrap: 'wrap'
      }}>
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <input
            type="text"
            placeholder="Search by client name, email, service, or payment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...componentStyles.formInput,
              width: '100%',
              padding: designSystem.spacing.md,
              fontSize: designSystem.typography.fontSize.sm
            }}
          />
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'all' ? designSystem.colors.primary : designSystem.colors.gray[100],
              color: activeTab === 'all' ? 'white' : designSystem.colors.gray[600],
              fontSize: designSystem.typography.fontSize.sm
            }}
            onClick={() => setActiveTab('all')}
            {...hoverEffects.button}
          >
            All ({stats.total})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'pending' ? designSystem.colors.warning : designSystem.colors.gray[100],
              color: activeTab === 'pending' ? 'white' : designSystem.colors.gray[600],
              fontSize: designSystem.typography.fontSize.sm
            }}
            onClick={() => setActiveTab('pending')}
            {...hoverEffects.button}
          >
            Pending ({stats.pending})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'verified' ? designSystem.colors.success : designSystem.colors.gray[100],
              color: activeTab === 'verified' ? 'white' : designSystem.colors.gray[600],
              fontSize: designSystem.typography.fontSize.sm
            }}
            onClick={() => setActiveTab('verified')}
            {...hoverEffects.button}
          >
            Verified ({stats.verified})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'rejected' ? designSystem.colors.danger : designSystem.colors.gray[100],
              color: activeTab === 'rejected' ? 'white' : designSystem.colors.gray[600],
              fontSize: designSystem.typography.fontSize.sm
            }}
            onClick={() => setActiveTab('rejected')}
            {...hoverEffects.button}
          >
            Rejected ({stats.rejected})
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={componentStyles.loading}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
          <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading payments...</p>
        </div>
      )}

      {/* Payments Table */}
      {!loading && (
        <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={componentStyles.tableHeader}>
              <tr>
                <th style={componentStyles.tableHeaderCell}>Payment ID</th>
                <th style={componentStyles.tableHeaderCell}>Client</th>
                <th style={componentStyles.tableHeaderCell}>Service</th>
                <th style={componentStyles.tableHeaderCell}>Amount</th>
                <th style={componentStyles.tableHeaderCell}>Method</th>
                <th style={componentStyles.tableHeaderCell}>Receipt</th>
                <th style={componentStyles.tableHeaderCell}>Status</th>
                <th style={componentStyles.tableHeaderCell}>Date</th>
                <th style={componentStyles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredProjects().length === 0 ? (
                <tr>
                  <td colSpan="9" style={componentStyles.emptyState}>
                    <i className="fas fa-credit-card fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
                    <p style={{ color: designSystem.colors.gray[500] }}>
                      {searchTerm ? 'No payments found matching your search' : 
                       activeTab === 'all' ? 'No service payments found for your assigned clients' : 
                       `No ${activeTab} payments found`}
                    </p>
                  </td>
                </tr>
              ) : (
                getFilteredProjects().map((project) => {
                  const statusStyle = getStatusBadgeStyle(project.status);
                  
                  return (
                    <tr 
                      key={project._id}
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
                          #{project._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div>
                          <div style={{ 
                            fontWeight: designSystem.typography.fontWeight.medium,
                            marginBottom: '2px'
                          }}>
                            {project.client?.name || 'Unknown Client'}
                          </div>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            {project.client?.email || 'No email'}
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
                          {project.service_name || 'Unknown Service'}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div style={{ 
                          fontWeight: designSystem.typography.fontWeight.bold,
                          fontSize: '16px',
                          color: designSystem.colors.success
                        }}>
                          {formatCurrency(project.amount)}
                        </div>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <span style={{
                          background: designSystem.colors.gray[200],
                          color: designSystem.colors.gray[700],
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {project.payment_method || 'N/A'}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        {project.payment_receipt ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                            <i className="fas fa-image" style={{ color: designSystem.colors.success }}></i>
                            <span style={{
                              background: designSystem.colors.success,
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              UPLOADED
                            </span>
                          </div>
                        ) : (
                          <span style={{
                            background: designSystem.colors.gray[300],
                            color: designSystem.colors.gray[600],
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            NO RECEIPT
                          </span>
                        )}
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
                          {getStatusDisplayText(project.status)}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div>
                          <div style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                            {new Date(project.purchase_date || project.createdAt).toLocaleDateString()}
                          </div>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            {new Date(project.purchase_date || project.createdAt).toLocaleTimeString()}
                          </small>
                        </div>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div style={{ display: 'flex', gap: designSystem.spacing.xs, flexWrap: 'wrap' }}>
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => viewPaymentDetails(project, 'view')}
                            title="View Payment Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {project.status === 'pending' && (
                            <>
                              <button 
                                className="btn btn-outline-success btn-sm"
                                onClick={() => viewPaymentDetails(project, 'approve')}
                                title="Approve Payment"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => viewPaymentDetails(project, 'reject')}
                                title="Reject Payment"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          )}
                          {(project.status === 'active' || project.status === 'completed') && (
                            <button 
                              className="btn btn-outline-info btn-sm"
                              onClick={() => generateInvoice(project._id)}
                              title="Generate Invoice"
                              disabled={loading}
                            >
                              {loading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-file-invoice"></i>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Details/Action Modal */}
      {showPaymentModal && selectedPayment && (
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
          onClick={() => setShowPaymentModal(false)}
        >
          <div 
            className="modal-dialog modal-xl"
            style={{ 
              position: 'relative',
              width: 'auto',
              margin: '1.75rem auto',
              maxWidth: '1200px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="fas fa-credit-card me-2"></i>
                  {modalType === 'view' ? 'Service Payment Details' : 
                   modalType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowPaymentModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: designSystem.spacing.lg }}>
                  {/* Left Column - Payment Details */}
                  <div>
                    <h6 style={{ marginBottom: designSystem.spacing.md, color: designSystem.colors.primary }}>
                      <i className="fas fa-info-circle me-2"></i>Payment Information
                    </h6>
                    <div style={{ display: 'grid', gap: designSystem.spacing.md }}>
                      <div>
                        <label style={{ 
                          display: 'block',
                          fontSize: designSystem.typography.fontSize.sm,
                          color: designSystem.colors.gray[500],
                          marginBottom: designSystem.spacing.xs
                        }}>Payment ID</label>
                        <div style={{ 
                          fontWeight: designSystem.typography.fontWeight.semibold,
                          fontFamily: 'monospace',
                          fontSize: designSystem.typography.fontSize.lg,
                          color: designSystem.colors.primary
                        }}>
                          #{selectedPayment._id.slice(-8).toUpperCase()}
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ 
                          display: 'block',
                          fontSize: designSystem.typography.fontSize.sm,
                          color: designSystem.colors.gray[500],
                          marginBottom: designSystem.spacing.xs
                        }}>Amount</label>
                        <div style={{ 
                          fontWeight: designSystem.typography.fontWeight.bold,
                          fontSize: designSystem.typography.fontSize.xl,
                          color: designSystem.colors.success
                        }}>
                          {formatCurrency(selectedPayment.amount)}
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
                          <div>{selectedPayment.client?.name || 'Unknown Client'}</div>
                          <small style={{ color: designSystem.colors.gray[500], fontWeight: 'normal' }}>
                            {selectedPayment.client?.email || 'No email'}
                          </small>
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ 
                          display: 'block',
                          fontSize: designSystem.typography.fontSize.sm,
                          color: designSystem.colors.gray[500],
                          marginBottom: designSystem.spacing.xs
                        }}>Service & Method</label>
                        <div style={{ display: 'flex', gap: designSystem.spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{
                            background: '#8b5cf6',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            {selectedPayment.service_name || 'Unknown Service'}
                          </span>
                          <span style={{
                            background: designSystem.colors.gray[200],
                            color: designSystem.colors.gray[700],
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            {selectedPayment.payment_method || 'N/A'}
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
                        <span style={{
                          background: getStatusBadgeStyle(selectedPayment.status).background,
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          fontWeight: '600'
                        }}>
                          {getStatusDisplayText(selectedPayment.status)}
                        </span>
                      </div>
                      
                      <div>
                        <label style={{ 
                          display: 'block',
                          fontSize: designSystem.typography.fontSize.sm,
                          color: designSystem.colors.gray[500],
                          marginBottom: designSystem.spacing.xs
                        }}>Purchase Date</label>
                        <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                          <div>{new Date(selectedPayment.purchase_date || selectedPayment.createdAt).toLocaleDateString()}</div>
                          <small style={{ color: designSystem.colors.gray[500], fontWeight: 'normal' }}>
                            {new Date(selectedPayment.purchase_date || selectedPayment.createdAt).toLocaleTimeString()}
                          </small>
                        </div>
                      </div>

                      {/* Service Description */}
                      {selectedPayment.description && (
                        <div>
                          <label style={{ 
                            display: 'block',
                            fontSize: designSystem.typography.fontSize.sm,
                            color: designSystem.colors.gray[500],
                            marginBottom: designSystem.spacing.xs
                          }}>Service Description</label>
                          <div style={{ 
                            background: designSystem.colors.gray[50],
                            padding: designSystem.spacing.md,
                            borderRadius: '8px',
                            border: `1px solid ${designSystem.colors.gray[200]}`,
                            fontStyle: 'italic'
                          }}>
                            {selectedPayment.description}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Payment Receipt Screenshot */}
                  <div>
                    <h6 style={{ marginBottom: designSystem.spacing.md, color: designSystem.colors.primary }}>
                      <i className="fas fa-receipt me-2"></i>Payment Receipt
                    </h6>
                    
                    {selectedPayment.payment_receipt ? (
                      <div style={{ 
                        textAlign: 'center',
                        border: `2px solid ${designSystem.colors.gray[200]}`,
                        borderRadius: '8px',
                        padding: designSystem.spacing.md,
                        background: designSystem.colors.gray[50]
                      }}>
                        <img 
                          src={`${process.env.REACT_APP_API_URL || 'https://backend.immigrationprofile.com'}/uploads/payment-receipts/${selectedPayment.payment_receipt}`}
                          alt="Payment Receipt"
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '500px',
                            borderRadius: '8px',
                            boxShadow: designSystem.shadows.card,
                            cursor: 'pointer'
                          }}
                          onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'https://backend.immigrationprofile.com'}/uploads/payment-receipts/${selectedPayment.payment_receipt}`, '_blank')}
                        />
                        <p style={{ 
                          marginTop: designSystem.spacing.sm, 
                          color: designSystem.colors.gray[500],
                          fontSize: designSystem.typography.fontSize.sm
                        }}>
                          <i className="fas fa-expand-arrows-alt me-2"></i>
                          Click image to view full size
                        </p>
                        <div style={{
                          marginTop: designSystem.spacing.md,
                          padding: designSystem.spacing.sm,
                          background: designSystem.colors.success + '20',
                          borderRadius: '6px',
                          border: `1px solid ${designSystem.colors.success}`,
                          color: designSystem.colors.success
                        }}>
                          <i className="fas fa-check-circle me-2"></i>
                          Receipt uploaded by client
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: designSystem.spacing.xl,
                        border: `2px dashed ${designSystem.colors.gray[300]}`,
                        borderRadius: '8px',
                        background: designSystem.colors.gray[50]
                      }}>
                        <i className="fas fa-image fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
                        <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.sm }}>
                          No payment receipt uploaded
                        </p>
                        <small style={{ color: designSystem.colors.gray[400] }}>
                          Client did not provide payment screenshot
                        </small>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Notes Section for Approval/Rejection */}
                {(modalType === 'approve' || modalType === 'reject') && (
                  <div style={{ marginTop: designSystem.spacing.lg }}>
                    <h6 style={{ marginBottom: designSystem.spacing.md, color: designSystem.colors.primary }}>
                      <i className="fas fa-sticky-note me-2"></i>CRM Manager Notes
                    </h6>
                    <textarea
                      style={{
                        ...componentStyles.formInput,
                        width: '100%',
                        minHeight: '100px',
                        resize: 'vertical'
                      }}
                      value={approvalData.admin_notes}
                      onChange={(e) => setApprovalData({ ...approvalData, admin_notes: e.target.value })}
                      placeholder={`Add notes for ${modalType === 'approve' ? 'approving' : 'rejecting'} this payment...`}
                    />
                  </div>
                )}

                {/* Previous Admin Notes */}
                {selectedPayment.admin_notes && (
                  <div style={{ marginTop: designSystem.spacing.lg }}>
                    <h6 style={{ marginBottom: designSystem.spacing.md, color: designSystem.colors.primary }}>
                      <i className="fas fa-history me-2"></i>Previous Notes
                    </h6>
                    <div style={{ 
                      background: designSystem.colors.gray[50],
                      padding: designSystem.spacing.md,
                      borderRadius: '8px',
                      border: `1px solid ${designSystem.colors.gray[200]}`,
                      fontStyle: 'italic'
                    }}>
                      {selectedPayment.admin_notes}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                
                {modalType === 'approve' && (
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => handlePaymentAction(selectedPayment._id, 'verified', approvalData.admin_notes)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Approving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Approve Payment
                      </>
                    )}
                  </button>
                )}
                {modalType === 'reject' && (
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handlePaymentAction(selectedPayment._id, 'rejected', approvalData.admin_notes)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-times me-2"></i>
                        Reject Payment
                      </>
                    )}
                  </button>
                )}
                {modalType === 'view' && (selectedPayment.status === 'active' || selectedPayment.status === 'completed') && (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => generateInvoice(selectedPayment._id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Generating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-file-invoice me-2"></i>
                        Generate Invoice
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsManagement;