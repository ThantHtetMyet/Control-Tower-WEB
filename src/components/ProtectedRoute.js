// ... existing code ...

const ProtectedRoute = ({ children, requireNewsPortalAdmin = false }) => {
  const { user, hasNewsPortalAdminAccess } = useAuth();
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // Check for News Portal admin access if required
  if (requireNewsPortalAdmin && !hasNewsPortalAdminAccess()) {
    return <Navigate to="/news-portal-system" replace />;
  }
  
  return children;
};

// ... existing code ...