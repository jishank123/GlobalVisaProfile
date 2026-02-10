const CrmStats = ({ stats, recentActivity }) => {
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
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

  const statCards = [
    {
      title: 'Assigned Clients',
      value: stats.totalClients,
      icon: 'fas fa-users',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      change: stats.totalClients > 0 ? `${stats.totalClients} active` : 'No clients yet'
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: 'fas fa-briefcase',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      change: stats.activeProjects > 0 ? `${stats.activeProjects} in progress` : 'No active projects'
    },
    {
      title: 'Pending Queries',
      value: stats.pendingQueries,
      icon: 'fas fa-question-circle',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      change: stats.pendingQueries > 0 ? 'Needs attention' : 'All resolved'
    },
    {
      title: 'Avg Progress',
      value: `${stats.avgProgress}%`,
      icon: 'fas fa-percentage',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      change: stats.avgProgress > 0 ? 'On track' : 'Getting started'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <i className={`${card.icon} text-xl ${card.textColor}`}></i>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
              <p className="text-gray-600 text-sm font-medium">{card.title}</p>
              <p className={`text-xs ${card.textColor} font-medium`}>
                <i className="fas fa-arrow-up mr-1"></i>
                {card.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <i className="fas fa-clock text-xl text-gray-600"></i>
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
          </div>
        </div>

        <div className="space-y-4">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => {
              const timeAgo = getTimeAgo(activity.createdAt);
              const icon = getActivityIcon(activity.action);
              const color = getActivityColor(activity.action);
              
              return (
                <div key={index} className="flex items-start space-x-4 p-4 border-b border-gray-100 last:border-b-0">
                  <div 
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${color}20`, color: color }}
                  >
                    <i className={`${icon} text-sm`}></i>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800 mb-1">{activity.description}</p>
                        <p className="text-sm text-gray-500">{activity.resourceType} • {timeAgo}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <i className="fas fa-clock text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Recent Activity</h3>
              <p className="text-gray-400">Your recent activities will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrmStats;