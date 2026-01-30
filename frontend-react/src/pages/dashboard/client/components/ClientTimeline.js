import { useState, useEffect } from 'react';

const ClientTimeline = ({ apiCall, currentClient }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      // Try to load actual activity data
      const response = await apiCall('/activity/client-timeline');
      
      if (response.success && response.data && response.data.length > 0) {
        setTimeline(response.data);
      } else {
        // Generate default timeline based on client data
        generateDefaultTimeline();
      }
    } catch (error) {
      console.error('Error loading timeline:', error);
      // Generate default timeline as fallback
      generateDefaultTimeline();
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultTimeline = () => {
    const defaultTimeline = [];
    
    // Add current access
    defaultTimeline.push({
      id: 'current-access',
      title: 'Profile Access',
      description: 'Accessed client profile dashboard',
      date: new Date().toISOString(),
      type: 'access',
      icon: 'fas fa-user-circle'
    });

    // Add registration date if available
    const createdDate = currentClient?.client_profile?.createdAt || 
                       currentClient?.user?.createdAt || 
                       new Date().toISOString();
    
    defaultTimeline.push({
      id: 'registration',
      title: 'Account Created',
      description: 'Welcome to Immigration Pro! Your immigration journey begins here.',
      date: createdDate,
      type: 'registration',
      icon: 'fas fa-user-plus'
    });

    // Add profile completion if we have profile data
    if (currentClient?.client_profile?.name || currentClient?.user?.full_name) {
      defaultTimeline.push({
        id: 'profile-setup',
        title: 'Profile Setup',
        description: 'Basic profile information completed',
        date: createdDate,
        type: 'profile',
        icon: 'fas fa-id-card'
      });
    }

    // Sort by date (newest first)
    defaultTimeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setTimeline(defaultTimeline);
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimelineItemColor = (type) => {
    const colors = {
      'registration': 'bg-green-500',
      'profile': 'bg-blue-500',
      'project': 'bg-purple-500',
      'payment': 'bg-yellow-500',
      'appointment': 'bg-indigo-500',
      'query': 'bg-red-500',
      'access': 'bg-gray-500',
      'default': 'bg-blue-500'
    };
    return colors[type] || colors.default;
  };

  const getTimelineItemIcon = (type, customIcon) => {
    if (customIcon) return customIcon;
    
    const icons = {
      'registration': 'fas fa-user-plus',
      'profile': 'fas fa-id-card',
      'project': 'fas fa-briefcase',
      'payment': 'fas fa-credit-card',
      'appointment': 'fas fa-calendar-check',
      'query': 'fas fa-question-circle',
      'access': 'fas fa-user-circle',
      'default': 'fas fa-circle'
    };
    return icons[type] || icons.default;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading timeline...</p>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <i className="fas fa-history text-4xl text-gray-400 mb-4"></i>
        <h5 className="text-lg font-semibold text-gray-700 mb-2">No Timeline Data</h5>
        <p className="text-gray-600">Your activity timeline will appear here as you interact with our services.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            <i className="fas fa-history mr-2"></i>Client Journey Timeline
          </h3>
          <button 
            onClick={loadTimeline}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-sync-alt mr-1"></i>Refresh
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={item.id || index} className="relative flex items-start">
                {/* Timeline dot */}
                <div className={`relative z-10 flex items-center justify-center w-16 h-16 ${getTimelineItemColor(item.type)} rounded-full border-4 border-white shadow-lg`}>
                  <i className={`${getTimelineItemIcon(item.type, item.icon)} text-white text-lg`}></i>
                </div>
                
                {/* Timeline content */}
                <div className="flex-1 ml-6 bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDate(item.date)} • {getTimeAgo(item.date)}
                      </div>
                    </div>
                    {item.status && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-4">{item.description}</p>
                  
                  {item.details && (
                    <div className="bg-white p-4 rounded border">
                      <h6 className="font-medium text-gray-900 mb-2">Details:</h6>
                      <p className="text-gray-600 text-sm">{item.details}</p>
                    </div>
                  )}
                  
                  {item.metadata && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {Object.entries(item.metadata).map(([key, value]) => (
                        <span key={key} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {item.actions && item.actions.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      {item.actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={action.onClick}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            action.type === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                            action.type === 'secondary' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' :
                            'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {action.icon && <i className={`${action.icon} mr-1`}></i>}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Timeline footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
            <i className="fas fa-flag-checkered mr-2"></i>
            This is where your journey began
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientTimeline;