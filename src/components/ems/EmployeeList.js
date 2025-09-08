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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
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

  const openDeleteDialog = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/Employee/${employeeToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }
      
      setSuccessMessage('Employee deleted successfully!');
      fetchEmployees();
      closeDeleteDialog();
    } catch (err) {
      setError('Error deleting employee: ' + err.message);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#4CAF50';
    if (rating >= 3) return '#FF9800';
    return '#F44336';
  };

  const getGenderColor = (gender) => {
    return gender.toLowerCase() === 'male' ? '#009fe3' : '#e5007e';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <EmployeeNavBar />
        <Box sx={{ p: 3 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading employees...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <EmployeeNavBar />
      
      <Box sx={{ p: 3 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          borderBottom: '2px solid #34C759',
          pb: 2
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#34C759' }}>
            Employee Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/employee-management/employees/new')}
            sx={{
              background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%) !important',
              color: 'white !important',
              '&:hover': {
                background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%) !important'
              },
              px: 3,
              boxShadow: '0 2px 4px rgba(52, 199, 89, 0.3)',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(52, 199, 89, 0.4)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Add Employee
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} sx={{
          boxShadow: 'none',
          borderRadius: 2,
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(52, 199, 89, 0.2)'
          },
          transition: 'box-shadow 0.3s ease-in-out'
        }}>
          <Table>
            <TableHead sx={{ 
              background: 'linear-gradient(135deg, #E8F5E8 0%, #F0F8F0 100%)',
              '& th': {
                borderBottom: '2px solid #34C759'
              }
            }}>
              <TableRow>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  color: '#2E7D32',
                  fontSize: '1rem'
                }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Staff ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Occupation</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow 
                  key={employee.id}
                  onDoubleClick={() => navigate(`/employee-management/employees/details/${employee.id}`)}
                  sx={{
                    '&:hover': {
                      bgcolor: '#F8FDF8',
                      transform: 'scale(1.002)',
                      transition: 'transform 0.2s ease-in-out',
                      cursor: 'pointer'
                    },
                    '& td': {
                      fontSize: '0.95rem',
                      padding: '14px'
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      
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
                    <Tooltip title="View Details">
                      <IconButton
                        onClick={() => navigate(`/employee-management/employees/details/${employee.id}`)}
                        sx={{ color: '#34C759' }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Employee">
                      <IconButton
                        onClick={() => navigate(`/employee-management/employees/edit/${employee.id}`)}
                        sx={{ color: '#34C759' }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Employee">
                      <IconButton
                        onClick={() => openDeleteDialog(employee)}
                        sx={{ 
                          color: '#d32f2f',
                          '&:hover': {
                            color: '#b71c1c',
                            backgroundColor: 'rgba(211, 47, 47, 0.04)'
                          }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

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
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage('')}
        >
          <Alert onClose={() => setSuccessMessage('')} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>

      {/* Custom Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300
        }}>
          <Paper sx={{ p: 3, maxWidth: 400, mx: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#34C759', fontWeight: 'bold' }}>
              Delete Employee
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Are you sure you want to delete employee "{employeeToDelete?.firstName} {employeeToDelete?.lastName}"? This action cannot be undone.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                onClick={closeDeleteDialog} 
                variant="outlined"
                sx={{
                  borderColor: '#34C759',
                  color: '#34C759',
                  '&:hover': {
                    borderColor: '#28A745',
                    color: '#28A745',
                    backgroundColor: 'rgba(52, 199, 89, 0.04)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDelete} 
                variant="contained" 
                sx={{
                  background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(52, 199, 89, 0.3)'
                  }
                }}
              >
                Delete
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default EmployeeList;