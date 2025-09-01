import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Typography, Box, Tooltip, LinearProgress,
  Alert, Snackbar, Avatar
} from '@mui/material';
import { Edit, Delete, Add, Visibility, Business } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EmployeeNavBar from './EmployeeNavBar';

import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, companyId: null, companyName: '' });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Company`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        showNotification('Error fetching companies', 'error');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      showNotification('Error fetching companies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleDeleteClick = (company) => {
    setDeleteModal({
      open: true,
      companyId: company.id,
      companyName: company.name
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Company/${deleteModal.companyId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setDeleteModal({ open: false, companyId: null, companyName: '' });
        showNotification(`Company "${deleteModal.companyName}" has been deleted successfully`, 'success');
        fetchCompanies();
      } else {
        const errorText = await response.text();
        showNotification(errorText || 'Error deleting company', 'error');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      showNotification('Error deleting company. Please try again.', 'error');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, companyId: null, companyName: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <EmployeeNavBar />
        <Box sx={{ p: 3 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading companies...</Typography>
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
            Companies
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/employee-management/companies/new')}
            sx={{
              background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%) !important',
              color: 'white !important',
              '&:hover': {
                background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%) !important'
              },
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(52, 199, 89, 0.3)'
            }}
          >
            Add Company
          </Button>
        </Box>

        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
               <TableHead sx={{ 
                  background: 'linear-gradient(135deg, #E8F5E8 0%, #F0F8F0 100%)',
                  '& th': {
                    borderBottom: '2px solid #34C759'
                  }
                }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Updated Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map((company) => (
                  <TableRow 
                    key={company.id} 
                    hover
                    onDoubleClick={() => navigate(`/employee-management/companies/details/${company.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#34C759', width: 40, height: 40 }}>
                          {getInitials(company.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {company.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {company.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(company.createdDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {company.updatedDate ? formatDate(company.updatedDate) : 'Not updated'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/employee-management/companies/details/${company.id}`)}
                            sx={{ 
                              color: '#34C759',
                              '&:hover': {
                                color: '#28A745',
                                backgroundColor: 'rgba(52, 199, 89, 0.04)'
                              }
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/employee-management/companies/edit/${company.id}`)}
                            sx={{ 
                              color: '#FF9800',
                              '&:hover': {
                                color: '#F57C00',
                                backgroundColor: 'rgba(255, 152, 0, 0.04)'
                              }
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Company">
                          <IconButton 
                            onClick={() => handleDeleteClick(company)}
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
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {companies.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Business sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No companies found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start by adding your first company
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/employee-management/companies/new')}
              sx={{
                background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)'
                }
              }}
            >
              Add First Company
            </Button>
          </Box>
        )}

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
                Delete Company
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Are you sure you want to delete company "{deleteModal.companyName}"? This action cannot be undone.
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

export default CompanyList;