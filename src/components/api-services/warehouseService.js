import api from './api';

const warehouseService = {
  // Get Further Action Taken options
  getFurtherActionTaken: async () => {
    try {
      const response = await api.get('/FurtherActionTakenWarehouse');
      return response.data;
    } catch (error) {
      console.error('Error fetching further action taken options:', error);
      throw error;
    }
  },

  // Get Form Status options
  getFormStatus: async () => {
    try {
      const response = await api.get('/FormStatusWarehouse');
      return response.data;
    } catch (error) {
      console.error('Error fetching form status options:', error);
      throw error;
    }
  },

  // Get all warehouse data in one call (for better performance)
  getAllWarehouseData: async () => {
    try {
      const [furtherActionRes, formStatusRes] = await Promise.all([
        api.get('/FurtherActionTakenWarehouse'),
        api.get('/FormStatusWarehouse')
      ]);
      
      return {
        furtherActions: Array.isArray(furtherActionRes.data) ? furtherActionRes.data : [],
        formStatuses: Array.isArray(formStatusRes.data) ? formStatusRes.data : []
      };
    } catch (error) {
      console.error('Error fetching warehouse data:', error);
      throw error;
    }
  }
};

export default warehouseService;