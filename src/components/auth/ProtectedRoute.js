import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireNewsPortalAdmin = false }) => {
  const { user, hasNewsPortalAdminAccess } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check for News Portal admin access if required
  if (requireNewsPortalAdmin && !hasNewsPortalAdminAccess()) {
    return <Navigate to="/news-portal-system" replace />;
  }

  return children;
};

export default ProtectedRoute;