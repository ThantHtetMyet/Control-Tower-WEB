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

  // Get System Name Warehouse options
  getSystemNameWarehouses: async (page = 1, pageSize = 100, search = '') => {
    try {
      const response = await api.get(`/SystemNameWarehouse?page=${page}&pageSize=${pageSize}&search=${search}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching system name warehouses:', error);
      throw error;
    }
  },

  // Get Station Name Warehouse options by System ID
  getStationNameWarehouses: async (systemNameWarehouseID, page = 1, pageSize = 100, search = '') => {
    try {
      const response = await api.get(`/StationNameWarehouse/BySystemName/${systemNameWarehouseID}?page=${page}&pageSize=${pageSize}&search=${search}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching station name warehouses:', error);
      throw error;
    }
  },

  // Get all warehouse data in one call (for better performance)
  getAllWarehouseData: async () => {
    try {
      const [furtherActionRes, formStatusRes, systemNameRes] = await Promise.all([
        api.get('/FurtherActionTakenWarehouse'),
        api.get('/FormStatusWarehouse'),
        api.get('/SystemNameWarehouse?pageSize=100')
      ]);
      
      return {
        furtherActions: Array.isArray(furtherActionRes.data) ? furtherActionRes.data : [],
        formStatuses: Array.isArray(formStatusRes.data) ? formStatusRes.data : [],
        systemNames: Array.isArray(systemNameRes.data?.data) ? systemNameRes.data.data : []
      };
    } catch (error) {
      console.error('Error fetching warehouse data:', error);
      throw error;
    }
  }
};

export default warehouseService;