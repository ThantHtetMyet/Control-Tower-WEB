import api from './api';

export const getOccupationLevels = async () => {
  const response = await api.get('/occupationlevel');
  return response.data;
};

export const getOccupations = async () => {
  const response = await api.get('/occupation');
  return response.data;
};