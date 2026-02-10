const QuickActions = ({ 
  onConvertToProject, 
  onAssignProjectsToCrm, 
  onRefreshData, 
  onShowAnalytics, 
  onExportLeads 
}) => {
  return (
    <div className="row mb-4">
      <div className="col-md-2">
        <div 
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
          onClick={onConvertToProject}
        >
          <i className="fas fa-project-diagram text-2xl mb-2 block"></i>
          <div className="text-sm">Convert to Projects</div>
        </div>
      </div>
      
      <div className="col-md-2">
        <div 
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
          onClick={onAssignProjectsToCrm}
        >
          <i className="fas fa-user-cog text-2xl mb-2 block"></i>
          <div className="text-sm">Assign Projects to CRM</div>
        </div>
      </div>
      
      <div className="col-md-2">
        <div 
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
          onClick={onRefreshData}
        >
          <i className="fas fa-sync-alt text-2xl mb-2 block"></i>
          <div className="text-sm">Refresh Data</div>
        </div>
      </div>
      
      <div className="col-md-2">
        <div 
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
          onClick={onShowAnalytics}
        >
          <i className="fas fa-chart-line text-2xl mb-2 block"></i>
          <div className="text-sm">View Analytics</div>
        </div>
      </div>
      
      <div className="col-md-2">
        <div 
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
          onClick={onExportLeads}
        >
          <i className="fas fa-download text-2xl mb-2 block"></i>
          <div className="text-sm">Export Report</div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;