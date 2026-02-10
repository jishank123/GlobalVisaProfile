import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const ClientsManagement = ({ apiCall, onViewClient, onMessageClient }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const [clientsResponse, leadsResponse] = await Promise.all([
        apiCall('/clients/my-clients').catch(e => ({ success: false, data: [] })),
        apiCall('/leads/my-leads').catch(e => ({ success: false, data: [] }))
      ]);
      
      const clients = clientsResponse.success ? clientsResponse.data : [];
      const leads = leadsResponse.success ? leadsResponse.data : [];
      
      const leadsAsClients = leads.map(lead => ({
        _id: lead._id,
        name: `${lead.firstName} ${lead.lastName}`,
        email: lead.email,
        phone: lead.phone,
        university: lead.university,
        status: 'lead_assigned',
        isLead: true,
        originalLead: lead
      }));
      
      setClients([...clients, ...leadsAsClients]);
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Statistics calculations
  const getClientStats = () => {
    return {
      total: clients.length,
      leads: clients.filter(client => client.isLead).length,
      activeClients: clients.filter(client => !client.isLead).length,
      newThisWeek: clients.filter(client => {
        const createdDate = new Date(client.createdAt || client.originalLead?.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate > weekAgo;
      }).length
    };
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

  if (loading) {
    return (
      <div style={componentStyles.managementCard}>
        <div style={componentStyles.loading}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
          <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading assigned clients...</p>
        </div>
      </div>
    );
  }

  const clientStats = getClientStats();

  return (
    <div style={componentStyles.managementCard}>
      {/* Header with Refresh Button */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-users fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>My Assigned Clients</h4>
            <p style={componentStyles.headerSubtitle}>Manage your assigned clients and leads</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={loadClients}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Client Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-users"
          number={clientStats.total}
          label="Total Assigned"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
        <StatCard
          icon="fas fa-user-plus"
          number={clientStats.leads}
          label="New Leads"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-user-check"
          number={clientStats.activeClients}
          label="Active Clients"
          borderColor="#10b981"
          iconColor="#10b981"
        />
        <StatCard
          icon="fas fa-calendar-week"
          number={clientStats.newThisWeek}
          label="New This Week"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
      </div>

      {/* No Clients Message */}
      {clients.length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-users fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>No Clients Assigned</h6>
          <p style={{ color: designSystem.colors.gray[500] }}>You don't have any clients assigned yet. Contact your admin to get started.</p>
        </div>
      )}

      {/* Clients Grid */}
      {clients.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: designSystem.spacing.md 
        }}>
          {clients.map(client => (
            <div 
              key={client._id} 
              style={{
                border: `2px solid ${client.isLead ? '#f59e0b' : designSystem.colors.gray[200]}`,
                borderRadius: designSystem.borderRadius.card,
                padding: designSystem.spacing.lg,
                background: client.isLead ? '#fffbeb' : 'white',
                boxShadow: designSystem.shadows.card,
                transition: 'all 0.3s ease'
              }}
              {...hoverEffects.card}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: designSystem.spacing.md }}>
                <h5 style={{ 
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  color: designSystem.colors.dark,
                  marginBottom: '4px'
                }}>
                  {client.name}
                </h5>
                <span style={{
                  ...componentStyles.badge,
                  background: client.isLead ? '#f59e0b' : '#10b981',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {client.isLead ? 'NEW LEAD' : 'CLIENT'}
                </span>
              </div>
              
              <div style={{ marginBottom: designSystem.spacing.md }}>
                <div style={{ 
                  color: designSystem.colors.gray[600],
                  fontSize: designSystem.typography.fontSize.sm,
                  marginBottom: '4px'
                }}>
                  <i className="fas fa-envelope me-2"></i>{client.email}
                </div>
                <div style={{ 
                  color: designSystem.colors.gray[600],
                  fontSize: designSystem.typography.fontSize.sm
                }}>
                  <i className="fas fa-university me-2"></i>{client.university || client.phone || 'No additional info'}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                <button 
                  style={{
                    ...componentStyles.primaryButton,
                    flex: 1,
                    background: '#3b82f6',
                    fontSize: designSystem.typography.fontSize.sm
                  }}
                  onClick={() => onViewClient(client)}
                  {...hoverEffects.button}
                >
                  <i className="fas fa-eye me-1"></i>View
                </button>
                <button 
                  style={{
                    ...componentStyles.primaryButton,
                    flex: 1,
                    background: '#10b981',
                    fontSize: designSystem.typography.fontSize.sm
                  }}
                  onClick={() => onMessageClient(client)}
                  {...hoverEffects.button}
                >
                  <i className="fas fa-envelope me-1"></i>Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientsManagement;