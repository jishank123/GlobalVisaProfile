import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardRedirect = () => {
  const { user, isAuthenticated, loading, hasAssessment } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role;

  // Gate: clients must complete assessment before accessing dashboard
  if (userRole === 'client' && !hasAssessment) {
    return <Navigate to="/profile-assessment?required=true" replace />;
  }

  switch (userRole) {
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    case 'lead_manager':
      return <Navigate to="/dashboard/lead-manager" replace />;
    case 'crm_manager':
      return <Navigate to="/dashboard/crm-manager" replace />;
    case 'project_manager':
      return <Navigate to="/dashboard/project-manager" replace />;
    case 'employee':
      return <Navigate to="/dashboard/employee" replace />;
    case 'client':
      return <Navigate to="/dashboard/client" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default DashboardRedirect;
