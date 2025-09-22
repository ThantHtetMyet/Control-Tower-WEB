import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Alert,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { Edit, Delete, Add, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import applicationService from '../api-services/applicationService';
import EmployeeNavBar from './EmployeeNavBar';

function ApplicationList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getApplications();
      setApplications(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (application) => {
    setApplicationToDelete(application);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setApplicationToDelete(null);
  };

  const handleDelete = async () => {
    if (!applicationToDelete) return;

    try {
      await applicationService.deleteApplication(applicationToDelete.id);
      setApplications(applications.filter(app => app.id !== applicationToDelete.id));
      closeDeleteDialog();
    } catch (err) {
      setError('Failed to delete application');
      console.error('Error deleting application:', err);
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

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <EmployeeNavBar />
        <Box sx={{ p: 3 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading applications...</Typography>
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
            Applications
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/employee-management-system/applications/new')}
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
            New Application
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
                }}>Application Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Remark</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Created Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Created By</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2E7D32' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((application) => (
                <TableRow 
                  key={application.id}
                  onDoubleClick={() => navigate(`/employee-management-system/applications/details/${application.id}`)}
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
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      {application.applicationName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      maxWidth: 200, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'text.secondary'
                    }}>
                      {application.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      maxWidth: 150, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'text.secondary'
                    }}>
                      {application.remark || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(application.createdDate)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {application.createdByUserName || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton 
                        onClick={() => navigate(`/employee-management-system/applications/details/${application.id}`)}
                        sx={{ color: '#34C759' }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Application">
                      <IconButton 
                        onClick={() => navigate(`/employee-management-system/applications/edit/${application.id}`)}
                        sx={{ color: '#34C759' }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Application">
                      <IconButton 
                        onClick={() => openDeleteDialog(application)}
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
      </Box>

      {/* Delete Confirmation Dialog - Replace MUI Dialog with custom modal */}
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
              Delete Application
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Are you sure you want to delete application "{applicationToDelete?.applicationName}"? This action cannot be undone.
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
}

export default ApplicationList;