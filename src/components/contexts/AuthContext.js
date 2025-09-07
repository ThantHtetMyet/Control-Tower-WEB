import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Utility function to decode JWT token
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [newsPortalAccessLevel, setNewsPortalAccessLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on initial load
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      
      // Extract access level from JWT token
      const tokenPayload = parseJwt(storedToken);
      if (tokenPayload && tokenPayload.NewsPortalAccessLevel) {
        setNewsPortalAccessLevel(tokenPayload.NewsPortalAccessLevel);
      }
    }
    setLoading(false);
  }, []);

  const login = (authData) => {
    // Handle the new API response structure
    const userData = authData.employee || authData.user || authData;
    const authToken = authData.token;
    
    // Store in localStorage (persists across browser sessions)
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
    
    setUser(userData);
    setToken(authToken);
    
    // Extract access level from JWT token
    const tokenPayload = parseJwt(authToken);
    if (tokenPayload && tokenPayload.NewsPortalAccessLevel) {
      setNewsPortalAccessLevel(tokenPayload.NewsPortalAccessLevel);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setNewsPortalAccessLevel(null);
  };

  // Helper function to check if user has admin access to News Portal
  const hasNewsPortalAdminAccess = () => {
    return newsPortalAccessLevel === 'Admin';
  };

  // Helper function to check if user is from HR department
  const hasHRAccess = () => {
    if (!user) return false;
    // Check if user has department information that indicates they're from HR
    const isHR = 
      (user.departmentName && (
        user.departmentName.toLowerCase().includes('hr') ||
        user.departmentName.toLowerCase().includes('human resources')
      )) ||
      (user.department && (
        user.department.toLowerCase().includes('hr') ||
        user.department.toLowerCase().includes('human resources')
      )) ||
      (user.role && user.role.toLowerCase().includes('hr'));
      
    return isHR;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      newsPortalAccessLevel,
      hasNewsPortalAdminAccess,
      hasHRAccess, // Add the new function to the context
      login, 
      logout, 
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);