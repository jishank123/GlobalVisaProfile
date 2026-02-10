const LeadStats = ({ stats, onFilterByStatus }) => {
  return (
    <div className="row mb-4" id="stats-section">
      <div className="col-md-3">
        <div 
          className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
          onClick={() => onFilterByStatus('')}
        >
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {stats?.total || '-'}
          </div>
          <div className="text-gray-600 text-sm mb-2">Total Leads</div>
          <small className="text-green-600">
            <i className="fas fa-chart-line mr-1"></i>
            {stats?.totalTrend || 'Updated'}
          </small>
        </div>
      </div>
      
      <div className="col-md-3">
        <div 
          className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
          onClick={() => onFilterByStatus('new')}
        >
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {stats?.newThisWeek || '-'}
          </div>
          <div className="text-gray-600 text-sm mb-2">New Leads (This Week)</div>
          <small className="text-blue-600">
            <i className="fas fa-clock mr-1"></i>Needs attention
          </small>
        </div>
      </div>
      
      <div className="col-md-3">
        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {stats?.conversionRate || '-'}%
          </div>
          <div className="text-gray-600 text-sm mb-2">Conversion Rate</div>
          <small className="text-green-600">
            <i className="fas fa-trophy mr-1"></i>Performance
          </small>
        </div>
      </div>
      
      <div className="col-md-3">
        <div 
          className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
          onClick={() => onFilterByStatus('qualified')}
        >
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {stats?.qualifiedCount || '-'}
          </div>
          <div className="text-gray-600 text-sm mb-2">Qualified Leads</div>
          <small className="text-yellow-600">
            <i className="fas fa-star mr-1"></i>Ready to convert
          </small>
        </div>
      </div>
    </div>
  );
};

export default LeadStats;