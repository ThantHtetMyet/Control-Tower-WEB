import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Typography, Box, Chip, Tooltip, LinearProgress,
  Alert, Snackbar
} from '@mui/material';
import { Edit, Delete, Add, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EmployeeNavBar from './EmployeeNavBar';

const API_BASE_URL = 'https://localhost:7145/api';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, departmentId: null, departmentName: '' });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Department`);
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      } else {
        showNotification('Error fetching departments', 'error');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      showNotification('Error fetching departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleDeleteClick = (department) => {
    setDeleteModal({
      open: true,
      departmentId: department.id,
      departmentName: department.name
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Department/${deleteModal.departmentId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setDeleteModal({ open: false, departmentId: null, departmentName: '' });
        showNotification(`Department "${deleteModal.departmentName}" has been deleted successfully`, 'success');
        fetchDepartments();
      } else {
        const errorText = await response.text();
        showNotification(errorText || 'Error deleting department', 'error');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      showNotification('Error deleting department. Please try again.', 'error');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, departmentId: null, departmentName: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#4caf50'; // Green
    if (rating >= 3) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

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
            Departments
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/employee-management/departments/new')}
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
            New Department
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{
          boxShadow: 'none',
          borderRadius: 2,
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(52, 199, 89, 0.2)'
          },
          transition: 'box-shadow 0.3s ease-in-out'
        }}>
          {loading && <LinearProgress sx={{ bgcolor: '#E8F5E8' }} />}
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F0F9F0' }}>
                <TableCell sx={{ 
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  color: '#2E7D32',
                  padding: '16px'
                }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Created Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((department) => (
                <TableRow 
                  key={department.id}
                  onDoubleClick={() => navigate(`/employee-management/departments/details/${department.id}`)}
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
                  <TableCell sx={{ fontWeight: 'medium' }}>{department.name}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      maxWidth: 200, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {department.description || 'No description'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>{formatDate(department.createdDate)}</TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton 
                        onClick={() => navigate(`/employee-management/departments/details/${department.id}`)}
                        sx={{ color: '#34C759' }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Department">
                      <IconButton 
                        onClick={() => navigate(`/employee-management/departments/edit/${department.id}`)}
                        sx={{ color: '#34C759' }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Department">
                      <IconButton 
                        onClick={() => handleDeleteClick(department)}
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

        {/* Delete Confirmation Dialog */}
        {deleteModal.open && (
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
                Delete Department
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Are you sure you want to delete department "{deleteModal.departmentName}"? This action cannot be undone.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  onClick={handleDeleteCancel} 
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
                  onClick={handleDeleteConfirm} 
                  variant="contained" 
                  sx={{
                    bgcolor: '#d32f2f',
                    '&:hover': {
                      bgcolor: '#b71c1c'
                    }
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setNotification({ ...notification, open: false })} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default DepartmentList;