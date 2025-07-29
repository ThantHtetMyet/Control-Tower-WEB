import api from './api';

const employeeApplicationAccessService = {
  // Get all employee application accesses
  getEmployeeApplicationAccesses: async () => {
    try {
      const response = await api.get('/EmployeeApplicationAccess');
      return response.data;
    } catch (error) {
      console.error('Error fetching employee application accesses:', error);
      throw error;
    }
  },

  // Get employee application accesses by employee ID
  getEmployeeApplicationAccessesByEmployee: async (employeeId) => {
    try {
      const response = await api.get(`/EmployeeApplicationAccess/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee application accesses:', error);
      throw error;
    }
  },

  // Create new employee application access
  createEmployeeApplicationAccess: async (accessData) => {
    try {
      const response = await api.post('/EmployeeApplicationAccess', accessData);
      return response.data;
    } catch (error) {
      console.error('Error creating employee application access:', error);
      throw error;
    }
  },

  // Create multiple employee application accesses
  createMultipleEmployeeApplicationAccesses: async (accessDataArray) => {
    try {
      const promises = accessDataArray.map(accessData => 
        api.post('/EmployeeApplicationAccess', accessData)
      );
      const responses = await Promise.all(promises);
      return responses.map(response => response.data);
    } catch (error) {
      console.error('Error creating multiple employee application accesses:', error);
      throw error;
    }
  },

  // Update employee application access
  updateEmployeeApplicationAccess: async (id, accessData) => {
    try {
      const response = await api.put(`/EmployeeApplicationAccess/${id}`, accessData);
      return response.data;
    } catch (error) {
      console.error('Error updating employee application access:', error);
      throw error;
    }
  },

  // Delete employee application access
  deleteEmployeeApplicationAccess: async (id) => {
    try {
      const response = await api.delete(`/EmployeeApplicationAccess/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting employee application access:', error);
      throw error;
    }
  },

  // Revoke employee application access
  revokeEmployeeApplicationAccess: async (id, revokedBy = null) => {
    try {
      const response = await api.put(`/EmployeeApplicationAccess/${id}/revoke`, revokedBy);
      return response.data;
    } catch (error) {
      console.error('Error revoking employee application access:', error);
      throw error;
    }
  }
};

export default employeeApplicationAccessService;