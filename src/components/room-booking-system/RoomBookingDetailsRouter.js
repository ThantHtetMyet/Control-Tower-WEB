import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import RoomBookingDetailsHR from './RoomBookingDetailsHR';
import RoomBookingDetailsUser from './RoomBookingDetailsUser';

const RoomBookingDetailsRouter = () => {
  const { hasHRAccess } = useAuth();

  // Route to appropriate component based on user role
  return hasHRAccess() ? <RoomBookingDetailsHR /> : <RoomBookingDetailsUser />;
};

export default RoomBookingDetailsRouter;