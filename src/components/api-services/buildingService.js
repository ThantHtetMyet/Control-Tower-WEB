import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

export const fetchBuildings = async () => {
  const response = await fetch(`${API_BASE_URL}/Building`);
  if (!response.ok) {
    throw new Error('Failed to fetch buildings');
  }
  return await response.json();
};

export const fetchBuildingById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/Building/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch building');
  }
  return await response.json();
};

export const createBuilding = async (buildingData) => {
  console.log('createBuilding called with:', JSON.stringify(buildingData));
  const response = await fetch(`${API_BASE_URL}/Building`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildingData),
  });
  
  // Log the response status
  console.log('createBuilding response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Server error response:', errorText);
    throw new Error('Failed to create building');
  }
  return await response.json();
};

export const updateBuilding = async (id, buildingData) => {
  const response = await fetch(`${API_BASE_URL}/Building/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildingData),
  });
  if (!response.ok) {
    throw new Error('Failed to update building');
  }
  return true;
};

export const deleteBuilding = async (id) => {
  const response = await fetch(`${API_BASE_URL}/Building/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete building');
  }
  return true;
};