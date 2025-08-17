import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Typography, Box, Chip, Tooltip, LinearProgress,
  Alert, Snackbar, Avatar
} from '@mui/material';
import { Edit, Delete, Add, Visibility, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EmployeeNavBar from './EmployeeNavBar';

import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Employee`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError('Error fetching employees: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, employeeName) => {
    if (window.confirm(`Are you sure you want to delete employee "${employeeName}"?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/Employee/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete employee');
        }
        
        setSuccessMessage('Employee deleted successfully!');
        fetchEmployees();
      } catch (err) {
        setError('Error deleting employee: ' + err.message);
      }
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#4CAF50';
    if (rating >= 3) return '#FF9800';
    return '#F44336';
  };

  const getGenderColor = (gender) => {
    return gender.toLowerCase() === 'male' ? '#2196F3' : '#E91E63';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <Box>
        <EmployeeNavBar />
        <Box sx={{ p: 3 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading employees...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <EmployeeNavBar />
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#34C759' }}>
            Employee Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/employee-management/employees/new')}
            sx={{
              background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)'
              }
            }}
          >
            Add Employee
          </Button>
        </Box>

        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Staff ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Occupation</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow 
                    key={employee.id} 
                    hover
                    onDoubleClick={() => navigate(`/employee-management/employees/details/${employee.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#34C759', width: 40, height: 40 }}>
                          {getInitials(employee.firstName, employee.lastName)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {employee.firstName} {employee.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {employee.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{employee.staffCardID}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {employee.staffIDCardID}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{employee.departmentName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{employee.occupationName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{employee.mobileNo}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.gender}
                        size="small"
                        sx={{
                          backgroundColor: getGenderColor(employee.gender),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(employee.startWorkingDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/employee-management/employees/details/${employee.id}`)}
                            sx={{ color: '#34C759' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/employee-management/employees/edit/${employee.id}`)}
                            sx={{ color: '#FF9800' }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                            sx={{ color: '#F44336' }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {employees.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Person sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No employees found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start by adding your first employee
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/employee-management/employees/new')}
              sx={{
                background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)'
                }
              }}
            >
              Add First Employee
            </Button>
          </Box>
        )}

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage('')}
        >
          <Alert onClose={() => setSuccessMessage('')} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default EmployeeList;