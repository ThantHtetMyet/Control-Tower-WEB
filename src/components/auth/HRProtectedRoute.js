import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HRProtectedRoute = ({ children }) => {
  const { user, hasHRAccess } = useAuth();
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  if (!hasHRAccess()) {
    return <Navigate to="/room-booking-system/bookings" replace />;
  }
  
  return children;
};

export default HRProtectedRoute;