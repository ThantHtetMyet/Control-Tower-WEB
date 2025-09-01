import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Typography, Box, Tooltip, LinearProgress,
  Alert, Snackbar, Avatar, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Edit, Delete, Add, Work, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EmployeeNavBar from './EmployeeNavBar';

import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const OccupationList = () => {
  const [occupations, setOccupations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [deleteModal, setDeleteModal] = useState({ open: false, occupation: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOccupations();
  }, []);

  const fetchOccupations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Occupation`);
      if (!response.ok) {
        throw new Error('Failed to fetch occupations');
      }
      const data = await response.json();
      setOccupations(data);
    } catch (err) {
      showNotification('Error fetching occupations: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleDeleteClick = (occupation) => {
    setDeleteModal({ open: true, occupation });
  };

  const handleDeleteConfirm = async () => {
    const { occupation } = deleteModal;
    try {
      const response = await fetch(`${API_BASE_URL}/Occupation/${occupation.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete occupation');
      }
      
      showNotification('Occupation deleted successfully!', 'success');
      fetchOccupations();
    } catch (err) {
      showNotification('Error deleting occupation: ' + err.message, 'error');
    } finally {
      setDeleteModal({ open: false, occupation: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, occupation: null });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (occupationName) => {
    return occupationName.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Box>
        <EmployeeNavBar />
        <Box sx={{ p: 3 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading occupations...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <EmployeeNavBar />
      <Box sx={{ p: 3 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          borderBottom: '2px solid #34C759',  // Green line bar added here
          pb: 2
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#34C759' }}>
            Occupations
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/employee-management/occupations/new')}
            sx={{
              background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%) !important',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(52, 199, 89, 0.3)'
              }
            }}
          >
            New Occupation
          </Button>
        </Box>

        {occupations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Work sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No occupations found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Get started by adding your first occupation
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/employee-management/occupations/new')}
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
              Add First Occupation
            </Button>
          </Box>
        ) : (
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Occupation</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {occupations.map((occupation) => (
                    <TableRow 
                      key={occupation.id} 
                      hover
                      onDoubleClick={() => navigate(`/employee-management/occupations/details/${occupation.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#34C759', width: 40, height: 40 }}>
                            {getInitials(occupation.occupationName)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {occupation.occupationName}
                            </Typography>
                            {occupation.remark && (
                              <Typography variant="body2" color="text.secondary">
                                {occupation.remark}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {occupation.description || 'No description'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(occupation.createdDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/employee-management/occupations/details/${occupation.id}`)}
                              sx={{
                                color: '#34C759',
                                '&:hover': {
                                  backgroundColor: 'rgba(52, 199, 89, 0.1)',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/employee-management/occupations/edit/${occupation.id}`)}
                              sx={{
                                color: '#ff9800',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(occupation)}
                              sx={{
                                color: '#f44336',
                                '&:hover': {
                                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                  transform: 'scale(1.1)'
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
        )}

        {/* Delete Confirmation Dialog - Replace with custom modal */}
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
                Delete Occupation
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Are you sure you want to delete occupation "{deleteModal.occupation?.occupationName}"? This action cannot be undone.
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

export default OccupationList;