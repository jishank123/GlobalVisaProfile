const LeadFilters = ({ filters, onFiltersChange, onApplyFilters }) => {
  const handleInputChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <div className="bg-white p-5 rounded-lg mb-6 shadow-sm">
      <div className="row align-items-end">
        <div className="col-md-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Name, email, or phone..."
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onApplyFilters()}
          />
        </div>
        
        <div className="col-md-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="new">New Leads</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="assigned">New Leads</option>
            <option value="converted_to_project">Converted to Project</option>
            <option value="negotiation">In Negotiation</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        
        <div className="col-md-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Source</label>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.source || ''}
            onChange={(e) => handleInputChange('source', e.target.value)}
          >
            <option value="">All Sources</option>
            <option value="profile_assessment">Assessment</option>
            <option value="contact_form">Contact Us</option>
            <option value="appointment">Appointment</option>
            <option value="website">Registration</option>
            <option value="referral">Referral</option>
            <option value="social_media">Social Media</option>
            <option value="advertisement">Advertisement</option>
            <option value="event">Event</option>
            <option value="cold_call">Cold Call</option>
            <option value="email_campaign">Email Campaign</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="col-md-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.priority || ''}
            onChange={(e) => handleInputChange('priority', e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        
        <div className="col-md-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Project Assignment</label>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.projectAssignment || ''}
            onChange={(e) => handleInputChange('projectAssignment', e.target.value)}
          >
            <option value="">All Leads</option>
            <option value="not_converted">Not Converted to Project</option>
            <option value="converted_to_project">Converted to Project</option>
          </select>
        </div>
        
        <div className="col-md-1">
          <button 
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={onApplyFilters}
          >
            <i className="fas fa-filter mr-2"></i>Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadFilters;