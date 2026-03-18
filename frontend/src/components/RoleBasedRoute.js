import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, hasAnyRole, loading, user, hasAssessment } = useAuth();
  const location = useLocation();

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

  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    const userRole = user?.role;
    switch (userRole) {
      case 'admin':
        return <Navigate to="/dashboard/admin" replace />;
      case 'lead_manager':
        return <Navigate to="/dashboard/lead-manager" replace />;
      case 'crm_manager':
        return <Navigate to="/dashboard/crm-manager" replace />;
      case 'client':
        return <Navigate to="/dashboard/client" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Gate: clients must complete assessment before accessing dashboard
  if (user?.role === 'client' && !hasAssessment) {
    return <Navigate to="/profile-assessment?required=true" replace state={{ from: location }} />;
  }

  return children;
};

export default RoleBasedRoute;
