import api from './api';

const applicationService = {
  // Get all applications
  getApplications: async () => {
    try {
      const response = await api.get('/Application');
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  // Get application by ID
  getApplication: async (id) => {
    try {
      const response = await api.get(`/Application/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  },

  // Create new application
  createApplication: async (applicationData) => {
    try {
      const response = await api.post('/Application', applicationData);
      return response.data;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  },

  // Update application
  updateApplication: async (id, applicationData) => {
    try {
      const response = await api.put(`/Application/${id}`, applicationData);
      return response.data;
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  },

  // Delete application
  deleteApplication: async (id) => {
    try {
      const response = await api.delete(`/Application/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  }
};

export default applicationService;