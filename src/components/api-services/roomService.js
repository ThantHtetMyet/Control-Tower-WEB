import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

export const fetchRooms = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/Room`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }
  return await response.json();
};

export const fetchRoomById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/Room/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch room');
  }
  return await response.json();
};

export const createRoom = async (roomData) => {
  // console.log('createRoom called with:', JSON.stringify(roomData));
  const response = await fetch(`${API_BASE_URL}/Room`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(roomData),
  });
  
  // Log the response status
  // console.log('createRoom response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    // console.error('Server error response:', errorText);
    throw new Error('Failed to create room');
  }
  return await response.json();
};

export const updateRoom = async (id, roomData) => {
  const response = await fetch(`${API_BASE_URL}/Room/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(roomData),
  });
  if (!response.ok) {
    throw new Error('Failed to update room');
  }
  return true;
};

export const deleteRoom = async (id) => {
  const response = await fetch(`${API_BASE_URL}/Room/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete room');
  }
  return true;
};