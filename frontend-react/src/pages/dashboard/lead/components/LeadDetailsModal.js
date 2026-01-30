const LeadDetailsModal = ({ lead, isOpen, onClose, onContactLead, onQualifyLead, onConvertToProject }) => {
  if (!isOpen || !lead) return null;

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
      'website': 'Website',
      'referral': 'Referral',
      'social_media': 'Social Media',
      'advertisement': 'Advertisement',
      'event': 'Event'
    };
    return sourceMap[source] || source;
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
      'website': 'bg-blue-100 text-blue-800',
      'referral': 'bg-green-100 text-green-800',
      'social_media': 'bg-indigo-100 text-indigo-800',
      'advertisement': 'bg-yellow-100 text-yellow-800',
      'event': 'bg-purple-100 text-purple-800'
    };
    return sourceClasses[source] || 'bg-gray-100 text-gray-800';
  };

  const fullName = `${lead.firstName} ${lead.lastName}`;
  const services = lead.interestedServices?.map(s => s.name).join(', ') || 'Not specified';
  const lastContact = lead.lastContact ? new Date(lead.lastContact).toLocaleDateString() : 'Never';
  const createdDate = new Date(lead.createdAt).toLocaleDateString();
  const nextFollowUp = lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : 'Not scheduled';

  const getActionButtons = () => {
    switch (lead.status) {
      case 'new':
      case 'assigned':
        return (
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              onClick={() => onContactLead(lead._id)}
            >
              <i className="fas fa-phone mr-2"></i>Contact
            </button>
            <button 
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              onClick={() => onQualifyLead(lead._id)}
            >
              <i className="fas fa-star mr-2"></i>Qualify
            </button>
          </div>
        );
      case 'contacted':
        return (
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              onClick={() => onContactLead(lead._id)}
            >
              <i className="fas fa-comment mr-2"></i>Follow-up
            </button>
            <button 
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              onClick={() => onQualifyLead(lead._id)}
            >
              <i className="fas fa-star mr-2"></i>Qualify
            </button>
          </div>
        );
      case 'qualified':
        return (
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            onClick={() => onConvertToProject(lead._id)}
          >
            <i className="fas fa-project-diagram mr-2"></i>Convert to Project
          </button>
        );
      case 'converted_to_project':
        return (
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded cursor-default"
            title="This lead has been converted to a project"
          >
            <i className="fas fa-project-diagram mr-2"></i>Converted to Project
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <h3 className="text-lg font-semibold">
            <i className="fas fa-user mr-2"></i>
            Lead Details - {fullName}
          </h3>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-semibold mb-4">
                <i className="fas fa-info-circle mr-2"></i>Basic Information
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Name:</span>
                  <span>{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Email:</span>
                  <span>{lead.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Phone:</span>
                  <span>{lead.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">University:</span>
                  <span>{lead.university || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Country:</span>
                  <span>{lead.country || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Degree:</span>
                  <span>{lead.degree || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Field of Study:</span>
                  <span>{lead.fieldOfStudy || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Lead Status */}
            <div>
              <h4 className="text-lg font-semibold mb-4">
                <i className="fas fa-chart-line mr-2"></i>Lead Status
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(lead.status)}`}>
                    {formatStatus(lead.status)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Priority:</span>
                  <span className={getPriorityClass(lead.priority)}>
                    {formatPriority(lead.priority)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Source:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getSourceBadgeClass(lead.source)}`}>
                    {formatSource(lead.source)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Estimated Value:</span>
                  <span>${lead.estimatedValue || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Created:</span>
                  <span>{createdDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Last Contact:</span>
                  <span>{lastContact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Next Follow-up:</span>
                  <span>{nextFollowUp}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interested Services */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3">
              <i className="fas fa-cogs mr-2"></i>Interested Services
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              {services}
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">
                <i className="fas fa-sticky-note mr-2"></i>Notes
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                {lead.notes}
              </div>
            </div>
          )}

          {/* Interaction History */}
          {lead.interactions && lead.interactions.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">
                <i className="fas fa-history mr-2"></i>Interaction History
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                {lead.interactions.map((interaction, index) => (
                  <div key={index} className="border-b border-gray-200 pb-2 mb-2 last:border-b-0 last:mb-0">
                    <div className="font-semibold">
                      {interaction.type.toUpperCase()} - {new Date(interaction.date).toLocaleDateString()}
                    </div>
                    {interaction.note && (
                      <div className="text-sm text-gray-600 mt-1">{interaction.note}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 rounded-b-lg flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          {getActionButtons()}
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;