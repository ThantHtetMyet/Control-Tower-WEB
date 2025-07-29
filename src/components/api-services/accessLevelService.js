const API_BASE_URL = 'https://localhost:7145/api';

const accessLevelService = {
  // Get all access levels
  getAccessLevels: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/AccessLevel`);
      if (!response.ok) {
        throw new Error('Failed to fetch access levels');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching access levels:', error);
      throw error;
    }
  },

  // Get access level by ID
  getAccessLevel: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/AccessLevel/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch access level');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching access level:', error);
      throw error;
    }
  }
};

export default accessLevelService;