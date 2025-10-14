import api from './api';

const yesNoStatusService = {
  // Get all Yes/No Status options
  getYesNoStatuses: async () => {
    try {
      const response = await api.get('/YesNoStatus');
      return response.data;
    } catch (error) {
      console.error('Error fetching yes/no status options:', error);
      throw error;
    }
  },

  // Get Yes/No Status by ID
  getYesNoStatus: async (id) => {
    try {
      const response = await api.get(`/YesNoStatus/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching yes/no status:', error);
      throw error;
    }
  },

  // Create new Yes/No Status
  createYesNoStatus: async (yesNoStatusData) => {
    try {
      const response = await api.post('/YesNoStatus', yesNoStatusData);
      return response.data;
    } catch (error) {
      console.error('Error creating yes/no status:', error);
      throw error;
    }
  },

  // Update Yes/No Status
  updateYesNoStatus: async (id, yesNoStatusData) => {
    try {
      const response = await api.put(`/YesNoStatus/${id}`, yesNoStatusData);
      return response.data;
    } catch (error) {
      console.error('Error updating yes/no status:', error);
      throw error;
    }
  }
};

export default yesNoStatusService;