import axios from 'axios';
import { API_URL } from '../../config/apiConfig';

export const login = async (credentials) => {
  return await axios.post(`${API_URL}/auth/signin`, credentials);
};

export const signup = async (userData) => {
  // Transform the data to match the backend DTO
  const signupData = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    mobileNo: userData.mobileNo,
    gender: userData.gender,
    password: userData.loginPassword,      // Changed from loginPassword to password
    confirmPassword: userData.confirmPassword  // Add this field back
  };
  return await axios.post(`${API_URL}/auth/signup`, signupData);
};

export const forgotPassword = async (email) => {
  return await axios.post(`${API_URL}/auth/forgot-password`, { email });
};