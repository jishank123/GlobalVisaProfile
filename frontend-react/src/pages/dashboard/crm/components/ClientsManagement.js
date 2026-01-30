import { useState, useEffect } from 'react';

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading assigned clients...</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <i className="fas fa-users text-4xl text-gray-400 mb-4"></i>
        <h5 className="text-lg font-semibold text-gray-700 mb-2">No Clients Assigned</h5>
        <p className="text-gray-600">You don't have any clients assigned yet. Contact your admin to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            <i className="fas fa-users mr-2"></i>My Assigned Clients
          </h3>
          <button 
            onClick={loadClients}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-sync-alt mr-1"></i>Refresh
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => (
            <div key={client._id} className={`border rounded-lg p-4 hover:shadow-md transition-all ${client.isLead ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-900">{client.name}</h4>
                {client.isLead ? (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    New Lead
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Client
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                <div className="mb-1">{client.email}</div>
                <div>{client.university || client.phone || 'No additional info'}</div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => onViewClient(client)}
                  className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  <i className="fas fa-eye mr-1"></i>View
                </button>
                <button 
                  onClick={() => onMessageClient(client)}
                  className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded text-sm hover:bg-green-200 transition-colors"
                >
                  <i className="fas fa-envelope mr-1"></i>Message
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientsManagement;