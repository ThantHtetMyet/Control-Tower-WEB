import { API_URL } from '../../config/apiConfig';

export const fetchRoomBookingStatuses = async () => {
  const response = await fetch(`${API_URL}/RoomBookingStatus`);
  if (!response.ok) {
    throw new Error('Failed to fetch room booking statuses');
  }
  return await response.json();
};

export const fetchRoomBookingStatusById = async (id) => {
  const response = await fetch(`${API_URL}/RoomBookingStatus/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch room booking status');
  }
  return await response.json();
};