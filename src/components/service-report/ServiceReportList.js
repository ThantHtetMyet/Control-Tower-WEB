import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Typography, Box, Chip, Tooltip, LinearProgress,
  Alert, Snackbar
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../api-services/api';
import ConfirmationModal from '../common/ConfirmationModal';

const ServiceReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, reportId: null, jobNumber: '' });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ServiceReport');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showNotification('Error fetching reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleDeleteClick = (report) => {
    setDeleteModal({
      open: true,
      reportId: report.id,
      jobNumber: report.jobNumber
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      // You might want to get the current user ID from auth context
      const currentUserId = 'your-user-id-here'; // Replace with actual user ID from auth
      
      await api.delete(`/ServiceReport/${deleteModal.reportId}?updatedBy=${currentUserId}`);
      
      setDeleteModal({ open: false, reportId: null, jobNumber: '' });
      showNotification(`Service Report ${deleteModal.jobNumber} has been deleted successfully`, 'success');
      fetchReports(); // Refresh the list
    } catch (error) {
      console.error('Error deleting report:', error);
      showNotification('Error deleting report. Please try again.', 'error');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, reportId: null, jobNumber: '' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        borderBottom: '2px solid #800080',
        pb: 2
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#800080' }}>
          Service Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/service-report/new')}
          sx={{
            bgcolor: '#800080',
            '&:hover': {
              bgcolor: '#4B0082'
            },
            px: 3
          }}
        >
          New Report
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{
        boxShadow: 'none',
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(128, 0, 128, 0.2)'
        },
        transition: 'box-shadow 0.3s ease-in-out'
      }}>
        {loading && <LinearProgress sx={{ bgcolor: '#E6E6FA' }} />}
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F3E5F5' }}>
              <TableCell sx={{ 
                fontWeight: 'bold',
                fontSize: '1rem',
                color: '#4B0082',
                padding: '16px'
              }}>Job No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Project No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>System</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow 
                key={report.id}
                onDoubleClick={() => navigate(`/service-report/details/${report.id}`)}
                sx={{
                  '&:hover': {
                    bgcolor: '#FCF6FF',
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
                <TableCell>{report.jobNumber}</TableCell>
                <TableCell>{report.customer}</TableCell>
                <TableCell>{report.projectNumberName}</TableCell>
                <TableCell>{report.systemName}</TableCell>
                <TableCell>{report.locationName}</TableCell>
                <TableCell>
                  <Chip
                    label={report.formStatus?.[0]?.name || 'N/A'}
                    size="small"
                    sx={{
                      bgcolor: '#E6E6FA',
                      color: '#4B0082'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit Report">
                    <IconButton 
                      onClick={() => navigate(`/service-report/edit/${report.id}`)}
                      sx={{ color: '#800080' }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Report">
                    <IconButton 
                      onClick={() => handleDeleteClick(report)}
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModal.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Service Report"
        message={`Are you sure you want to delete Service Report "${deleteModal.jobNumber}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
  );
};

export default ServiceReportList;