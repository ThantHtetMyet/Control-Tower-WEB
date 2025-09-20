import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Typography, Box, Chip, Tooltip, LinearProgress,
  Alert, Snackbar, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Edit, Delete, Add, Visibility, Description } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getReportForms, getReportFormTypes, deleteReportForm, getRTUPMReportForm } from '../api-services/reportFormService';
import moment from 'moment';
import RMSTheme from '../theme-resource/RMSTheme';

const ReportFormList = () => {
  const [reportForms, setReportForms] = useState([]);
  const [reportFormTypes, setReportFormTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReportForms();
    fetchReportFormTypes();
  }, [selectedTypeId]);

  const fetchReportForms = async () => {
    try {
      setLoading(true);
      const data = await getReportForms(1, 50, '', selectedTypeId || null);
      setReportForms(data.data || data); // Change from data.items to data.data
    } catch (err) {
      setError('Error fetching report forms: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportFormTypes = async () => {
    try {
      const data = await getReportFormTypes();
      setReportFormTypes(data);
    } catch (err) {
      console.error('Error fetching report form types:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report form?')) {
      try {
        await deleteReportForm(id);
        setSuccessMessage('Report form deleted successfully');
        fetchReportForms();
      } catch (err) {
        setError('Error deleting report form: ' + err.message);
      }
    }
  };

  const getStatusChip = (status) => {
    const statusColors = {
      'Draft': { backgroundColor: RMSTheme.status.info, color: RMSTheme.text.onPrimary },
      'Submitted': { backgroundColor: RMSTheme.primary.main, color: RMSTheme.text.onPrimary },
      'Under Review': { backgroundColor: RMSTheme.status.warning, color: RMSTheme.text.onPrimary },
      'Approved': { backgroundColor: RMSTheme.status.success, color: RMSTheme.text.onPrimary },
      'Rejected': { backgroundColor: RMSTheme.status.error, color: RMSTheme.text.onPrimary }
    };
    return (
      <Chip 
        label={status} 
        sx={statusColors[status] || { backgroundColor: RMSTheme.background.default }}
        size="small" 
      />
    );
  };

  const getUploadStatusChip = (status) => {
    const statusColors = {
      'Pending': { backgroundColor: RMSTheme.background.default, color: RMSTheme.text.secondary },
      'Uploading': { backgroundColor: RMSTheme.status.info, color: RMSTheme.text.onPrimary },
      'Completed': { backgroundColor: RMSTheme.status.success, color: RMSTheme.text.onPrimary },
      'Failed': { backgroundColor: RMSTheme.status.error, color: RMSTheme.text.onPrimary }
    };
    return (
      <Chip 
        label={status} 
        sx={statusColors[status] || { backgroundColor: RMSTheme.background.default }}
        size="small" 
      />
    );
  };

  if (loading) return <LinearProgress sx={{ color: RMSTheme.primary.main }} />;

  return (
    <Box sx={{ p: 3, backgroundColor: RMSTheme.background.default, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ color: RMSTheme.text.primary, fontWeight: 'bold' }}
        >
          Report Forms
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/report-management-system/report-forms/new')}
          sx={{
            background: RMSTheme.gradients.primary,
            color: '#FFFFFF',
            boxShadow: RMSTheme.shadows.medium,
            '&:hover': {
              background: RMSTheme.gradients.accent,
              boxShadow: RMSTheme.shadows.large
            }
          }}
        >
          Add Report Form
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ 
          minWidth: 200,
          '& .MuiOutlinedInput-root': {
            backgroundColor: RMSTheme.background.paper,
            '&:hover fieldset': {
              borderColor: RMSTheme.primary.main
            },
            '&.Mui-focused fieldset': {
              borderColor: RMSTheme.primary.main
            }
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: RMSTheme.primary.main
          }
        }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={selectedTypeId}
            label="Filter by Type"
            onChange={(e) => setSelectedTypeId(e.target.value)}
          >
            <MenuItem value="">All Types</MenuItem>
            {reportFormTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          backgroundColor: RMSTheme.background.paper,
          boxShadow: RMSTheme.shadows.medium,
          borderRadius: RMSTheme.borderRadius.medium,
          overflowX: 'auto'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: RMSTheme.background.hover }}>
              <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary, minWidth: 150 }}>Report Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary, minWidth: 150 }}>Specific Report Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary, minWidth: 120 }}>Job No</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary, minWidth: 200 }}>System Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary, minWidth: 200 }}>Station Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary, minWidth: 120 }}>Form Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary, minWidth: 150 }}>Created Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary, minWidth: 150 }}>Created By</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary, minWidth: 150 }}>Updated By</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: RMSTheme.text.primary, minWidth: 120 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportForms.map((form) => (
              <TableRow 
                key={form.id}
                onDoubleClick={() => {
                  // Check if it's an RTU PM report
                  if (form.specificReportTypeName === 'RTU') {
                    navigate(`/report-management-system/report-forms/rtu-pm-details/${form.id}`);
                  } else {
                    navigate(`/report-management-system/report-forms/details/${form.id}`);
                  }
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: RMSTheme.background.hover,
                    cursor: 'pointer'
                  }
                }}
              >
                <TableCell sx={{ color: RMSTheme.text.primary }}>
                  {form.reportFormTypeName || 'N/A'}
                </TableCell>
                <TableCell sx={{ color: RMSTheme.text.primary }}>
                  {form.specificReportTypeName || 'N/A'}
                </TableCell>
                <TableCell sx={{ color: RMSTheme.text.primary }}>
                  {form.jobNo || 'N/A'}
                </TableCell>
                <TableCell sx={{ color: RMSTheme.text.primary }}>
                  <Tooltip title={form.systemNameWarehouseName || 'N/A'}>
                    <span>
                      {form.systemNameWarehouseName ? 
                        (form.systemNameWarehouseName.length > 30 ? 
                          form.systemNameWarehouseName.substring(0, 30) + '...' : 
                          form.systemNameWarehouseName
                        ) : 'N/A'
                      }
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ color: RMSTheme.text.primary }}>
                  <Tooltip title={form.stationNameWarehouseName || 'N/A'}>
                    <span>
                      {form.stationNameWarehouseName ? 
                        (form.stationNameWarehouseName.length > 30 ? 
                          form.stationNameWarehouseName.substring(0, 30) + '...' : 
                          form.stationNameWarehouseName
                        ) : 'N/A'
                      }
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell>{getStatusChip(form.formStatus || 'N/A')}</TableCell>
                <TableCell sx={{ color: RMSTheme.text.secondary }}>
                  {form.createdDate ? moment(form.createdDate).format('YYYY-MM-DD HH:mm') : 'N/A'}
                </TableCell>
                <TableCell sx={{ color: RMSTheme.text.secondary }}>
                  {form.createdByUserName || 'N/A'}
                </TableCell>
                <TableCell sx={{ color: RMSTheme.text.secondary }}>
                  {form.updatedByUserName || 'N/A'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/report-management-system/report-forms/details/${form.id}`)}
                        sx={{
                          color: RMSTheme.status.info,
                          '&:hover': {
                            backgroundColor: RMSTheme.background.hover,
                            color: RMSTheme.primary.main
                          }
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/report-management-system/report-forms/${form.id}/edit`)}
                        sx={{
                          color: RMSTheme.status.warning,
                          '&:hover': {
                            backgroundColor: RMSTheme.background.hover,
                            color: RMSTheme.primary.main
                          }
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(form.id)}
                        sx={{
                          color: RMSTheme.status.error,
                          '&:hover': {
                            backgroundColor: RMSTheme.background.hover,
                            color: RMSTheme.status.error
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

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportFormList;