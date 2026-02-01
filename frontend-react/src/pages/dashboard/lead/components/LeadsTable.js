const LeadsTable = ({ 
  leads, 
  loading, 
  onViewLead, 
  onContactLead, 
  onQualifyLead, 
  onConvertToProject, 
  onViewProjectDetails 
}) => {
  const formatStatus = (status) => {
    const statusMap = {
      'new': 'New Lead',
      'contacted': 'Contacted',
      'qualified': 'Qualified',
      'assigned': 'New Lead',
      'converted_to_project': 'Converted to Project',
      'negotiation': 'In Negotiation',
      'converted': 'Converted',
      'lost': 'Lost'
    };
    return statusMap[status] || 'New Lead';
  };

  const formatPriority = (priority) => {
    return priority?.charAt(0).toUpperCase() + priority?.slice(1) || 'Medium';
  };

  const formatSource = (source) => {
    const sourceMap = {
      'profile_assessment': 'Assessment',
      'contact_form': 'Contact Us',
      'appointment': 'Appointment',
      'website': 'Registration',
      'referral': 'Referral',
      'social_media': 'Social Media',
      'advertisement': 'Advertisement',
      'event': 'Event',
      'cold_call': 'Cold Call',
      'email_campaign': 'Email Campaign',
      'other': 'Other'
    };
    return sourceMap[source] || source || 'Unknown';
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'new': 'bg-yellow-100 text-yellow-800',
      'contacted': 'bg-blue-100 text-blue-800',
      'qualified': 'bg-green-100 text-green-800',
      'assigned': 'bg-yellow-100 text-yellow-800',
      'converted_to_project': 'bg-purple-100 text-purple-800',
      'negotiation': 'bg-indigo-100 text-indigo-800',
      'converted': 'bg-green-100 text-green-800',
      'lost': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityClass = (priority) => {
    const priorityClasses = {
      'high': 'text-red-600 font-semibold',
      'medium': 'text-yellow-600 font-semibold',
      'low': 'text-green-600 font-semibold'
    };
    return priorityClasses[priority] || 'text-gray-600';
  };

  const getSourceBadgeClass = (source) => {
    const sourceClasses = {
      'profile_assessment': 'bg-purple-100 text-purple-800',
      'contact_form': 'bg-blue-100 text-blue-800',
      'appointment': 'bg-green-100 text-green-800',
      'website': 'bg-yellow-100 text-yellow-800',
      'referral': 'bg-red-100 text-red-800',
      'social_media': 'bg-indigo-100 text-indigo-800',
      'advertisement': 'bg-orange-100 text-orange-800',
      'event': 'bg-lime-100 text-lime-800',
      'cold_call': 'bg-violet-100 text-violet-800',
      'email_campaign': 'bg-pink-100 text-pink-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return sourceClasses[source] || 'bg-gray-100 text-gray-800';
  };

  const getActionButtons = (lead) => {
    switch (lead.status) {
      case 'new':
      case 'assigned':
        return (
          <>
            <button 
              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors mr-1"
              onClick={() => onContactLead(lead._id)}
            >
              <i className="fas fa-phone mr-1"></i>Contact
            </button>
            <button 
              className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
              onClick={() => onQualifyLead(lead._id)}
            >
              <i className="fas fa-star mr-1"></i>Qualify
            </button>
          </>
        );
      case 'contacted':
        return (
          <>
            <button 
              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors mr-1"
              onClick={() => onContactLead(lead._id)}
            >
              <i className="fas fa-comment mr-1"></i>Follow-up
            </button>
            <button 
              className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
              onClick={() => onQualifyLead(lead._id)}
            >
              <i className="fas fa-star mr-1"></i>Qualify
            </button>
          </>
        );
      case 'qualified':
        return (
          <button 
            className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
            onClick={() => onConvertToProject(lead._id)}
          >
            <i className="fas fa-project-diagram mr-1"></i>Convert to Project
          </button>
        );
      case 'converted_to_project':
        return (
          <>
            <button 
              className="px-3 py-1 bg-purple-600 text-white rounded text-xs cursor-default"
              title="This lead has been converted to a project"
            >
              <i className="fas fa-project-diagram mr-1"></i>Converted to Project
            </button>
            <button 
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors ml-1"
              onClick={() => onViewProjectDetails(lead._id)}
              title="View project details"
            >
              <i className="fas fa-info-circle mr-1"></i>View Project
            </button>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <i className="fas fa-users text-4xl text-gray-400 mb-4"></i>
        <h5 className="text-lg font-semibold text-gray-700 mb-2">No leads found</h5>
        <p className="text-gray-600 mb-4">Try adjusting your filters or wait for admin to assign new leads.</p>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          <i className="fas fa-sync mr-2"></i>Refresh Data
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">ID</th>
              <th className="px-4 py-3 text-left font-semibold">Lead Name</th>
              <th className="px-4 py-3 text-left font-semibold">Contact Info</th>
              <th className="px-4 py-3 text-left font-semibold">University</th>
              <th className="px-4 py-3 text-left font-semibold">Source</th>
              <th className="px-4 py-3 text-left font-semibold">Service Interest</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Priority</th>
              <th className="px-4 py-3 text-left font-semibold">Last Contact</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead) => {
              const fullName = `${lead.firstName} ${lead.lastName}`;
              const services = lead.interestedServices?.map(s => s.name).join(', ') || 'Not specified';
              const lastContact = lead.lastContact ? new Date(lead.lastContact).toLocaleDateString() : 'Never';
              const createdDate = new Date(lead.createdAt).toLocaleDateString();
              const isConvertedToProject = lead.status === 'converted_to_project' || lead.convertedToProject;
              
              return (
                <tr 
                  key={lead._id} 
                  className={`hover:bg-gray-50 ${isConvertedToProject ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <strong>LD-{lead._id.slice(-4).toUpperCase()}</strong>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <strong className="text-gray-900">{fullName}</strong>
                      <br />
                      <small className="text-gray-500">
                        {lead.degree || ''} {lead.fieldOfStudy || ''}
                      </small>
                      {isConvertedToProject && lead.convertedToProject && (
                        <>
                          <br />
                          <small className="text-blue-600">
                            <i className="fas fa-project-diagram mr-1"></i>
                            Project: {lead.convertedToProject.project_id}
                          </small>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div>{lead.email}</div>
                      <div className="text-gray-500">{lead.phone || 'No phone'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div>{lead.university || 'Not specified'}</div>
                      <div className="text-gray-500">{lead.country || ''}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getSourceBadgeClass(lead.source)}`}>
                      {formatSource(lead.source)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{services}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(lead.status)}`}>
                      {formatStatus(lead.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={getPriorityClass(lead.priority)}>
                      {formatPriority(lead.priority)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div>{lastContact}</div>
                      <div className="text-gray-500">Created: {createdDate}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button 
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                        onClick={() => onViewLead(lead._id)}
                      >
                        <i className="fas fa-eye mr-1"></i>View
                      </button>
                      {getActionButtons(lead)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsTable;