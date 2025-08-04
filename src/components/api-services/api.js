import axios from 'axios';

// Default API instance (fallback)
const defaultApi = axios.create({
  baseURL: 'https://localhost:7145/api',
  withCredentials: true, // ✅ Ensure this is present
});

// Function to create API instance with dynamic endpoint
const createApiInstance = (baseURL) => {
  const apiInstance = axios.create({
    baseURL: `${baseURL}api`
  });
  
  // Add token to requests automatically
  apiInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  return apiInstance;
};

// Get API instance based on current application context
const getApiInstance = () => {
  
  return defaultApi;
};

// Add token to default API requests
defaultApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Export both default and dynamic API
export default getApiInstance();
export { createApiInstance, getApiInstance };