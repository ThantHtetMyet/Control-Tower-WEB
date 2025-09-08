import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

export const fetchSubDepartments = async (page = 1, pageSize = 10, search = '', departmentId = null) => {
  try {
    let url = `${API_BASE_URL}/SubDepartment?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (departmentId) url += `&departmentId=${departmentId}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch sub-departments');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching sub-departments:', error);
    throw error;
  }
};

export const fetchSubDepartmentById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/SubDepartment/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sub-department');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching sub-department:', error);
    throw error;
  }
};

export const createSubDepartment = async (subDepartmentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/SubDepartment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subDepartmentData),
    });
    if (!response.ok) {
      throw new Error('Failed to create sub-department');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating sub-department:', error);
    throw error;
  }
};

export const updateSubDepartment = async (id, subDepartmentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/SubDepartment/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...subDepartmentData, id }),
    });
    if (!response.ok) {
      throw new Error('Failed to update sub-department');
    }
    return response;
  } catch (error) {
    console.error('Error updating sub-department:', error);
    throw error;
  }
};

export const deleteSubDepartment = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/SubDepartment/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete sub-department');
    }
    return response;
  } catch (error) {
    console.error('Error deleting sub-department:', error);
    throw error;
  }
};