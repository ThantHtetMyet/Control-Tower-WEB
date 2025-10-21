import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Typography, Box, Chip, Tooltip, LinearProgress,
  Alert, Snackbar, MenuItem, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Edit, Delete, Add, Visibility, FilterList } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EmployeeNavBar from './EmployeeNavBar';
import { fetchSubDepartments, deleteSubDepartment } from '../api-services/subDepartmentService';
import { getDepartments } from '../api-services/employeeService';

const SubDepartmentList = () => {
  const [subDepartments, setSubDepartments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, subDepartmentId: null, subDepartmentName: '' });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubDepartmentsData();
    loadDepartments();
  }, []);

  useEffect(() => {
    fetchSubDepartmentsData();
  }, [selectedDepartment, searchTerm]);

  const fetchSubDepartmentsData = async () => {
    try {
      setLoading(true);
      const data = await fetchSubDepartments(1, 100, searchTerm, selectedDepartment || null);
      setSubDepartments(data.items || data);
    } catch (error) {
      // console.error('Error fetching sub-departments:', error);
      showNotification('Error fetching sub-departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      // console.error('Error loading departments:', error);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleDeleteClick = (subDepartment) => {
    setDeleteModal({
      open: true,
      subDepartmentId: subDepartment.id,
      subDepartmentName: subDepartment.name
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSubDepartment(deleteModal.subDepartmentId);
      showNotification('Sub-department deleted successfully', 'success');
      fetchSubDepartmentsData();
    } catch (error) {
      showNotification('Error deleting sub-department', 'error');
    }
    setDeleteModal({ open: false, subDepartmentId: null, subDepartmentName: '' });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
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
            Sub-Departments
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/employee-management-system/sub-departments/new')}
            sx={{
              background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%) !important',
              color: 'white !important',
              '&:hover': {
                background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%) !important',
                boxShadow: '0 4px 8px rgba(52, 199, 89, 0.4)',
                transform: 'translateY(-1px)'
              },
              px: 3,
              boxShadow: '0 2px 4px rgba(52, 199, 89, 0.3)'
            }}
          >
            New Sub-Department
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
            <TableHead sx={{ 
              background: 'linear-gradient(135deg, #E8F5E8 0%, #F0F8F0 100%)',
              '& th': {
                borderBottom: '2px solid #34C759'
              }
            }}>
              <TableRow sx={{ bgcolor: '#F0F9F0' }}>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  color: '#34C759',
                  fontSize: '0.95rem'
                }}>
                  Sub-Department Name
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  color: '#34C759',
                  fontSize: '0.95rem'
                }}>
                  Parent Department
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  color: '#34C759',
                  fontSize: '0.95rem'
                }}>
                  Description
                </TableCell>
                
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  color: '#34C759',
                  fontSize: '0.95rem'
                }}>
                  Created Date
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  color: '#34C759',
                  fontSize: '0.95rem',
                  textAlign: 'center'
                }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subDepartments.map((subDepartment, index) => (
                <TableRow 
                  key={subDepartment.id}
                  onDoubleClick={() => navigate(`/employee-management-system/sub-departments/${subDepartment.id}`)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: '#f0f9ff',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(52, 199, 89, 0.1)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <TableCell sx={{ 
                    fontWeight: 500,
                    color: '#333'
                  }}>
                    {subDepartment.name}
                  </TableCell>
                  <TableCell sx={{ color: '#666' }}>
                    {subDepartment.departmentName}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, color: '#666' }}>
                    {subDepartment.description ? (
                      <Tooltip title={subDepartment.description}>
                        <Typography variant="body2" noWrap>
                          {subDepartment.description}
                        </Typography>
                      </Tooltip>
                    ) : 'N/A'}
                  </TableCell>
                  
                  <TableCell sx={{ color: '#666' }}>
                    {formatDate(subDepartment.createdDate)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          onClick={() => navigate(`/employee-management-system/sub-departments/${subDepartment.id}`)}
                          sx={{ 
                            color: '#34C759',
                            '&:hover': { 
                              bgcolor: '#E8F5E8',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                          size="small"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => navigate(`/employee-management-system/sub-departments/${subDepartment.id}/edit`)}
                          sx={{ 
                            color: '#ff9800',
                            '&:hover': { 
                              bgcolor: '#fff3e0',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                          size="small"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDeleteClick(subDepartment)}
                          sx={{ 
                            color: '#f44336',
                            '&:hover': { 
                              bgcolor: '#ffebee',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {subDepartments.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="#999">
                      No sub-departments found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Delete Confirmation Dialog - Same style as DepartmentList */}
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
                Delete Sub-Department
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Are you sure you want to delete sub-department "{deleteModal.subDepartmentName}"? This action cannot be undone.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  onClick={() => setDeleteModal({ ...deleteModal, open: false })}
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

        {/* Notification */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity} 
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default SubDepartmentList;