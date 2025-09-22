import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  LinearProgress,
  Avatar
} from '@mui/material';
import { Add, Visibility, Edit, Delete, Work } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EmployeeNavBar from './EmployeeNavBar';

import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const OccupationLevelList = () => {
  const navigate = useNavigate();
  const [occupationLevels, setOccupationLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [deleteModal, setDeleteModal] = useState({ open: false, occupationLevel: null });

  useEffect(() => {
    fetchOccupationLevels();
  }, []);

  const fetchOccupationLevels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/OccupationLevel`);
      if (response.ok) {
        const data = await response.json();
        setOccupationLevels(data);
      } else {
        showNotification('Error fetching occupation levels', 'error');
      }
    } catch (error) {
      console.error('Error fetching occupation levels:', error);
      showNotification('Error fetching occupation levels', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ open: false, message: '', severity: 'success' });
  };

  const handleDeleteClick = (occupationLevel) => {
    setDeleteModal({ open: true, occupationLevel });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, occupationLevel: null });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/OccupationLevel/${deleteModal.occupationLevel.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification('Occupation level deleted successfully!', 'success');
        fetchOccupationLevels();
      } else {
        const errorText = await response.text();
        showNotification(errorText || 'Error deleting occupation level', 'error');
      }
    } catch (error) {
      console.error('Error deleting occupation level:', error);
      showNotification('Error deleting occupation level', 'error');
    } finally {
      setDeleteModal({ open: false, occupationLevel: null });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (levelName) => {
    if (!levelName) return 'OL';
    return levelName.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Box>
        <EmployeeNavBar />
        <Box sx={{ p: 3 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading occupation levels...</Typography>
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
          borderBottom: '2px solid #34C759',
          pb: 2
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#34C759' }}>
            Occupation Levels
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/employee-management-system/occupation-levels/new')}
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
            New Occupation Level
          </Button>
        </Box>

        {occupationLevels.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Work sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No occupation levels found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Get started by adding your first occupation level
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/employee-management-system/occupation-levels/new')}
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
              Add First Occupation Level
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Level Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {occupationLevels.map((occupationLevel) => (
                    <TableRow 
                      key={occupationLevel.id} 
                      hover
                      onDoubleClick={() => navigate(`/employee-management-system/occupation-levels/details/${occupationLevel.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {occupationLevel.levelName}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {occupationLevel.description || 'No description'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {occupationLevel.rank}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(occupationLevel.createdDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/employee-management-system/occupation-levels/details/${occupationLevel.id}`);
                              }}
                              sx={{
                                color: '#34C759',
                                '&:hover': {
                                  bgcolor: 'rgba(52, 199, 89, 0.1)',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/employee-management-system/occupation-levels/edit/${occupationLevel.id}`);
                              }}
                              sx={{
                                color: '#FF9800',
                                '&:hover': {
                                  bgcolor: 'rgba(255, 152, 0, 0.1)',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(occupationLevel);
                              }}
                              sx={{
                                color: '#f44336',
                                '&:hover': {
                                  bgcolor: 'rgba(244, 67, 54, 0.1)',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <Delete fontSize="small" />
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
                Delete Occupation Level
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Are you sure you want to delete occupation level "{deleteModal.occupationLevel?.levelName}"? This action cannot be undone.
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
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OccupationLevelList;