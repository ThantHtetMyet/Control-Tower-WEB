import api from './api';

const resultStatusService = {
  // Get all Result Status options
  getResultStatuses: async () => {
    try {
      const response = await api.get('/ResultStatus');
      return response.data;
    } catch (error) {
      console.error('Error fetching result status options:', error);
      throw error;
    }
  },

  // Get Result Status by ID
  getResultStatus: async (id) => {
    try {
      const response = await api.get(`/ResultStatus/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching result status:', error);
      throw error;
    }
  },

  // Create new Result Status
  createResultStatus: async (resultStatusData) => {
    try {
      const response = await api.post('/ResultStatus', resultStatusData);
      return response.data;
    } catch (error) {
      console.error('Error creating result status:', error);
      throw error;
    }
  },

  // Update Result Status
  updateResultStatus: async (id, resultStatusData) => {
    try {
      const response = await api.put(`/ResultStatus/${id}`, resultStatusData);
      return response.data;
    } catch (error) {
      console.error('Error updating result status:', error);
      throw error;
    }
  }
};

export default resultStatusService;