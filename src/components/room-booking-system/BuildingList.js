import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Typography, Box, Chip, Tooltip, LinearProgress,
  Alert, Snackbar
} from '@mui/material';
import { Edit, Delete, Add, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchBuildings, deleteBuilding } from '../api-services/buildingService';

const BuildingList = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, buildingId: null, buildingName: '' });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchBuildingsData();
  }, []);

  const fetchBuildingsData = async () => {
    try {
      setLoading(true);
      const data = await fetchBuildings();
      setBuildings(data);
    } catch (error) {
      // console.error('Error fetching buildings:', error);
      showNotification('Error fetching buildings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleDeleteClick = (building) => {
    setDeleteModal({
      open: true,
      buildingId: building.id,
      buildingName: building.name
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteBuilding(deleteModal.buildingId);
      setDeleteModal({ open: false, buildingId: null, buildingName: '' });
      showNotification('Building deleted successfully');
      fetchBuildingsData();
    } catch (error) {
      // console.error('Error deleting building:', error);
      showNotification('Error deleting building', 'error');
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Box sx={{ p: 3 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading buildings...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          borderBottom: '2px solid #3f51b5',
          pb: 2
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
            Building Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/room-booking-system/buildings/new')}
            sx={{
              background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%) !important',
              color: 'white !important',
              px: 3,
              boxShadow: '0 2px 4px rgba(63, 81, 181, 0.3)',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(63, 81, 181, 0.4)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Add Building
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{
          boxShadow: 'none',
          borderRadius: 2,
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(63, 81, 181, 0.2)'
          },
          transition: 'box-shadow 0.3s ease-in-out'
        }}>
          <Table>
            <TableHead sx={{ 
              background: 'linear-gradient(135deg, #E8EAF6 0%, #F0F2FA 100%)',
              '& th': {
                borderBottom: '2px solid #3f51b5'
              }
            }}>
              <TableRow>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  color: '#303f9f',
                  fontSize: '1rem'
                }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#303f9f' }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#303f9f' }}>Address</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#303f9f' }}>Created Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#303f9f' }}>Updated Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#303f9f' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {buildings.length > 0 ? (
                buildings.map((building) => (
                  <TableRow 
                    key={building.id}
                    onDoubleClick={() => navigate(`/room-booking-system/buildings/details/${building.id}`)}
                    sx={{
                      '&:hover': {
                        bgcolor: '#F8F9FF',
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
                    <TableCell>{building.name}</TableCell>
                    <TableCell>{building.code || '-'}</TableCell>
                    <TableCell>{building.address || '-'}</TableCell>
                    <TableCell>{new Date(building.createdDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(building.updatedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          onClick={() => navigate(`/room-booking-system/buildings/details/${building.id}`)}
                          sx={{ color: '#3f51b5' }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Building">
                        <IconButton
                          onClick={() => navigate(`/room-booking-system/buildings/edit/${building.id}`)}
                          sx={{ color: '#3f51b5' }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Building">
                        <IconButton
                          onClick={() => handleDeleteClick(building)}
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Typography variant="h6" color="text.secondary">
                        No buildings found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Start by adding your first building
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/room-booking-system/buildings/new')}
                        sx={{
                          background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #303f9f 0%, #1a237e 100%)'
                          }
                        }}
                      >
                        Add First Building
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>

      {/* Custom Delete Confirmation Dialog */}
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
            <Typography variant="h6" gutterBottom sx={{ color: '#3f51b5', fontWeight: 'bold' }}>
              Delete Building
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Are you sure you want to delete building "{deleteModal.buildingName}"? This action cannot be undone.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => setDeleteModal({ open: false, buildingId: null, buildingName: '' })} 
                variant="outlined"
                sx={{
                  borderColor: '#3f51b5',
                  color: '#3f51b5',
                  '&:hover': {
                    borderColor: '#303f9f',
                    color: '#303f9f',
                    backgroundColor: 'rgba(63, 81, 181, 0.04)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteConfirm} 
                variant="contained" 
                sx={{
                  background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #303f9f 0%, #1a237e 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(63, 81, 181, 0.3)'
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

export default BuildingList;