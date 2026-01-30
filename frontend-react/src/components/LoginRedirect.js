import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated() && user) {
      // Redirect to appropriate dashboard based on user role
      const userRole = user.role;
      switch (userRole) {
        case 'admin':
          navigate('/dashboard/admin', { replace: true });
          break;
        case 'lead_manager':
          navigate('/dashboard/lead-manager', { replace: true });
          break;
        case 'crm_manager':
          navigate('/dashboard/crm-manager', { replace: true });
          break;
        case 'client':
          navigate('/dashboard/client', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
          break;
      }
    }
  }, [user, isAuthenticated, navigate]);

  return null; // This component doesn't render anything
};

export default LoginRedirect;