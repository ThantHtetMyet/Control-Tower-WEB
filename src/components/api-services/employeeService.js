import api from './api';

// Employee API calls
export const getEmployees = async () => {
  const response = await api.get('/employee');
  return response.data;
};

export const getEmployee = async (id) => {
  const response = await api.get(`/employee/${id}`);
  return response.data;
};

export const createEmployee = async (employeeData) => {
  const response = await api.post('/employee', employeeData);
  return response.data;
};

export const updateEmployee = async (id, employeeData) => {
  const response = await api.put(`/employee/${id}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employee/${id}`);
  return response.data;
};

// Department API calls
export const getDepartments = async () => {
  const response = await api.get('/department');
  return response.data;
};

export const getDepartment = async (id) => {
  const response = await api.get(`/department/${id}`);
  return response.data;
};

// Occupation API calls
export const getOccupations = async () => {
  const response = await api.get('/occupation');
  return response.data;
};

export const getOccupation = async (id) => {
  const response = await api.get(`/occupation/${id}`);
  return response.data;
};

// Dashboard statistics
export const getDashboardStats = async () => {
  try {
    const [employees, departments, occupations] = await Promise.all([
      getEmployees(),
      getDepartments(),
      getOccupations()
    ]);
    
    return {
      totalEmployees: employees.length,
      totalDepartments: departments.length,
      totalOccupations: occupations.length,
      activeEmployees: employees.filter(emp => !emp.lastWorkingDate).length,
      recentEmployees: employees
        .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
        .slice(0, 5)
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Application Access API calls
export const updateEmployeeApplicationAccess = async (employeeId, accessId, accessData) => {
  const response = await api.put(`/employee/${employeeId}/application-access/${accessId}`, accessData);
  return response.data;
};

export const softDeleteEmployeeApplicationAccess = async (employeeId, accessId, deleteData) => {
  const response = await api.patch(`/employee/${employeeId}/application-access/${accessId}`, deleteData);
  return response.data;
};

export const createEmployeeApplicationAccess = async (employeeId, accessData) => {
  const response = await api.post(`/employee/${employeeId}/application-access`, accessData);
  return response.data;
};