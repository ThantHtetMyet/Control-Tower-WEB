import api from './api';

const asaFirewallStatusService = {
  // Get all ASA Firewall Status options
  getAll: async () => {
    try {
      const response = await api.get('/ASAFirewallStatus');
      return response.data;
    } catch (error) {
      console.error('Error fetching ASA firewall status options:', error);
      throw error;
    }
  },

  // Get ASA Firewall Status by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/ASAFirewallStatus/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ASA firewall status:', error);
      throw error;
    }
  },

  // Create new ASA Firewall Status
  create: async (asaFirewallStatusData) => {
    try {
      const response = await api.post('/ASAFirewallStatus', asaFirewallStatusData);
      return response.data;
    } catch (error) {
      console.error('Error creating ASA firewall status:', error);
      throw error;
    }
  },

  // Update ASA Firewall Status
  update: async (id, asaFirewallStatusData) => {
    try {
      const response = await api.put(`/ASAFirewallStatus/${id}`, asaFirewallStatusData);
      return response.data;
    } catch (error) {
      console.error('Error updating ASA firewall status:', error);
      throw error;
    }
  }
};

export default asaFirewallStatusService;