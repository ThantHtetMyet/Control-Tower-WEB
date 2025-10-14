import api from './api';

const serverDiskStatusService = {
  // Get all Server Disk Status options
  getServerDiskStatuses: async () => {
    try {
      const response = await api.get('/ServerDiskStatus');
      return response.data;
    } catch (error) {
      console.error('Error fetching server disk status options:', error);
      throw error;
    }
  },

  // Get Server Disk Status by ID
  getServerDiskStatus: async (id) => {
    try {
      const response = await api.get(`/ServerDiskStatus/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching server disk status:', error);
      throw error;
    }
  },

  // Create new Server Disk Status
  createServerDiskStatus: async (serverDiskStatusData) => {
    try {
      const response = await api.post('/ServerDiskStatus', serverDiskStatusData);
      return response.data;
    } catch (error) {
      console.error('Error creating server disk status:', error);
      throw error;
    }
  },

  // Update Server Disk Status
  updateServerDiskStatus: async (id, serverDiskStatusData) => {
    try {
      const response = await api.put(`/ServerDiskStatus/${id}`, serverDiskStatusData);
      return response.data;
    } catch (error) {
      console.error('Error updating server disk status:', error);
      throw error;
    }
  },

  // Delete Server Disk Status
  deleteServerDiskStatus: async (id) => {
    try {
      const response = await api.delete(`/ServerDiskStatus/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting server disk status:', error);
      throw error;
    }
  }
};

export default serverDiskStatusService;