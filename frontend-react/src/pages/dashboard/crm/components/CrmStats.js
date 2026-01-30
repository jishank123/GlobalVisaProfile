const CrmStats = ({ stats, recentActivity }) => {
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const getActivityIcon = (action) => {
    const icons = {
      'create': 'fas fa-plus',
      'update': 'fas fa-edit',
      'delete': 'fas fa-trash',
      'view': 'fas fa-eye',
      'respond': 'fas fa-reply'
    };
    return icons[action] || 'fas fa-circle';
  };

  const getActivityColor = (action) => {
    const colors = {
      'create': '#28a745',
      'update': '#ffc107',
      'delete': '#dc3545',
      'view': '#17a2b8',
      'respond': '#6f42c1'
    };
    return colors[action] || '#6c757d';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Assigned Clients */}
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <i className="fas fa-users text-2xl text-blue-600"></i>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {stats?.totalClients || 0}
          </div>
          <div className="text-gray-600 text-sm mb-2">Assigned Clients</div>
          <div className="text-sm text-green-600">
            <i className="fas fa-arrow-up mr-1"></i>
            {stats?.clientsChange || 'Loading...'}
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <i className="fas fa-briefcase text-2xl text-yellow-600"></i>
            </div>
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-1">
            {stats?.activeProjects || 0}
          </div>
          <div className="text-gray-600 text-sm mb-2">Active Projects</div>
          <div className="text-sm text-green-600">
            <i className="fas fa-arrow-up mr-1"></i>
            {stats?.projectsChange || 'Loading...'}
          </div>
        </div>

        {/* Pending Queries */}
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <i className="fas fa-question-circle text-2xl text-red-600"></i>
            </div>
          </div>
          <div className="text-3xl font-bold text-red-600 mb-1">
            {stats?.pendingQueries || 0}
          </div>
          <div className="text-gray-600 text-sm mb-2">Pending Queries</div>
          <div className="text-sm text-red-600">
            <i className="fas fa-arrow-down mr-1"></i>
            {stats?.queriesChange || 'Loading...'}
          </div>
        </div>

        {/* Average Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <i className="fas fa-percentage text-2xl text-green-600"></i>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            {stats?.avgProgress || 0}%
          </div>
          <div className="text-gray-600 text-sm mb-2">Avg Progress</div>
          <div className="text-sm text-green-600">
            <i className="fas fa-arrow-up mr-1"></i>
            {stats?.progressChange || 'Loading...'}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            <i className="fas fa-clock mr-2"></i>Recent Activity
          </h3>
        </div>
        
        <div className="space-y-4">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.slice(0, 5).map((activity, index) => {
              const timeAgo = getTimeAgo(activity.createdAt);
              const icon = getActivityIcon(activity.action);
              const color = getActivityColor(activity.action);
              
              return (
                <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-shrink-0">
                    <div 
                      className="rounded-full flex items-center justify-center w-8 h-8"
                      style={{ backgroundColor: `${color}20`, color: color }}
                    >
                      <i className={`${icon} text-sm`}></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.resourceType} • {timeAgo}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <i className="fas fa-clock text-4xl text-gray-400 mb-3"></i>
              <h6 className="text-gray-700 font-medium mb-2">No Recent Activity</h6>
              <p className="text-gray-500 text-sm">Your recent activities will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrmStats;