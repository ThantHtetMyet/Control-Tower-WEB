import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Typography, Box, Chip, Tooltip, LinearProgress,
  Alert, Snackbar, Avatar
} from '@mui/material';
import { Edit, Delete, Add, Visibility, Work } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EmployeeNavBar from './EmployeeNavBar';
import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const OccupationList = () => {
  const [occupations, setOccupations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, occupationId: null, occupationName: '' });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOccupations();
  }, []);

  const fetchOccupations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Occupation`);
      if (response.ok) {
        const data = await response.json();
        setOccupations(data);
      } else {
        showNotification('Error fetching occupations', 'error');
      }
    } catch (error) {
      console.error('Error fetching occupations:', error);
      showNotification('Error fetching occupations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleDeleteClick = (occupation) => {
    setDeleteModal({
      open: true,
      occupationId: occupation.id,
      occupationName: occupation.occupationName
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Occupation/${deleteModal.occupationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setDeleteModal({ open: false, occupationId: null, occupationName: '' });
        showNotification(`Occupation "${deleteModal.occupationName}" has been deleted successfully`, 'success');
        fetchOccupations();
      } else {
        const errorText = await response.text();
        showNotification(errorText || 'Error deleting occupation', 'error');
      }
    } catch (error) {
      console.error('Error deleting occupation:', error);
      showNotification('Error deleting occupation. Please try again.', 'error');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, occupationId: null, occupationName: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'N/A';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
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
            Occupations
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/employee-management/occupations/new')}
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
            New Occupation
          </Button>
        </Box>

        {occupations.length === 0 && !loading ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Work sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No occupations found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start by adding your first occupation to the system
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/employee-management/occupations/new')}
              sx={{
                background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)'
                }
              }}
            >
              Add First Occupation
            </Button>
          </Paper>
        ) : (
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
                    fontSize: '1rem',
                    color: '#2E7D32',
                    padding: '16px'
                  }}>Occupation</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Level</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Created Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {occupations.map((occupation) => (
                  <TableRow 
                    key={occupation.id}
                    onDoubleClick={() => navigate(`/employee-management/occupations/details/${occupation.id}`)}
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
                      {occupation.occupationLevelName ? (
                        <Chip 
                          label={occupation.occupationLevelName}
                          size="small"
                          sx={{
                            bgcolor: '#e3f2fd',
                            color: '#1976d2',
                            fontWeight: 'bold'
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No level assigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ 
                        maxWidth: 200, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {occupation.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(occupation.createdDate)}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton 
                          onClick={() => navigate(`/employee-management/occupations/details/${occupation.id}`)}
                          sx={{ color: '#34C759' }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Occupation">
                        <IconButton 
                          onClick={() => navigate(`/employee-management/occupations/edit/${occupation.id}`)}
                          sx={{ color: '#34C759' }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Occupation">
                        <IconButton 
                          onClick={() => handleDeleteClick(occupation)}
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
                Delete Occupation
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Are you sure you want to delete occupation "{deleteModal.occupationName}"? This action cannot be undone.
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

export default OccupationList;