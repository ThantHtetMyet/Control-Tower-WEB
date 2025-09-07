import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

export const fetchRoomBookings = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/RoomBooking`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch room bookings');
  }
  return await response.json();
};

export const fetchRoomBookingById = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/RoomBooking/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch room booking');
  }
  return await response.json();
};

export const createRoomBooking = async (bookingData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/RoomBooking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingData),
  });
  
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Server error response:', errorText);
    throw new Error('Failed to create room booking');
  }
  return await response.json();
};

export const updateRoomBooking = async (id, bookingData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/RoomBooking/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingData),
  });
  
  if (response.status === 409) {
    // 409 Conflict - Booking has been modified by someone else
    const conflictData = await response.json();
    throw {
      type: 'CONCURRENCY_CONFLICT',
      message: 'This booking has been modified by someone else. Please refresh and try again.',
      latestData: conflictData
    };
  } else if (response.status === 403) {
    // 403 Forbidden - Booking is being processed by HR
    throw {
      type: 'BOOKING_IN_PROCESS',
      message: 'This booking is currently being processed by HR and cannot be modified.'
    };
  } else if (!response.ok) {
    throw new Error('Failed to update room booking');
  }
  
  // Handle NoContent response (204) - don't try to parse JSON
  if (response.status === 204) {
    return { success: true };
  }
  
  return await response.json();
};

export const deleteRoomBooking = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/RoomBooking/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to delete room booking');
  }
  return true;
};

export const approveRoomBooking = async (id, approvalData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/RoomBooking/${id}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(approvalData),
  });
  if (!response.ok) {
    throw new Error('Failed to approve room booking');
  }
  // Handle NoContent response (204) - don't try to parse JSON
  if (response.status === 204) {
    return { success: true };
  }
  return await response.json();
};

export const rejectRoomBooking = async (id, rejectionData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/RoomBooking/${id}/reject`, {
    method: 'POST',  // Change from PUT to POST to match backend
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(rejectionData),
  });
  if (!response.ok) {
    throw new Error('Failed to reject room booking');
  }
  // Handle NoContent response (204) - don't try to parse JSON
  if (response.status === 204) {
    return { success: true };
  }
  return await response.json();
};

export const cancelRoomBooking = async (id, cancellationData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/RoomBooking/${id}/cancel`, {
    method: 'POST', // Changed from PUT to POST
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(cancellationData),
  });
  if (!response.ok) {
    throw new Error('Failed to cancel room booking');
  }
  // Handle 204 No Content response
  if (response.status === 204) {
    return { success: true };
  }
  return await response.json();
};


export const fetchCalendarBookings = async (roomId = null, startDate = null, endDate = null) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  
  if (roomId) params.append('roomId', roomId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await fetch(`${API_BASE_URL}/RoomBooking/calendar?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch calendar bookings');
  }
  return await response.json();
};