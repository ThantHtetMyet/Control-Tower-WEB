import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { Save, Cancel, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getReportForm, updateReportForm, getReportFormTypes } from '../api-services/reportFormService';
import RMSTheme from '../theme-resource/RMSTheme';

const ReportFormEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [reportFormTypes, setReportFormTypes] = useState([]);
  
  const [formData, setFormData] = useState({
    reportFormTypeId: '',
    formStatus: '',
    uploadStatus: '',
    uploadHostname: '',
    uploadIPAddress: ''
  });

  const formStatusOptions = [
    'Draft',
    'Submitted',
    'Under Review',
    'Approved',
    'Rejected'
  ];

  const uploadStatusOptions = [
    'Pending',
    'Uploading',
    'Completed',
    'Failed'
  ];

  useEffect(() => {
    fetchReportForm();
    fetchReportFormTypes();
  }, [id]);

  const fetchReportForm = async () => {
    try {
      setFetchLoading(true);
      const data = await getReportForm(id);
      setFormData({
        reportFormTypeId: data.reportFormTypeId || '',
        formStatus: data.formStatus || 'Draft',
        uploadStatus: data.uploadStatus || 'Pending',
        uploadHostname: data.uploadHostname || '',
        uploadIPAddress: data.uploadIPAddress || ''
      });
    } catch (err) {
      setError('Error fetching report form: ' + err.message);
    } finally {
      setFetchLoading(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reportFormTypeId) {
      setError('Please select a report form type');
      return;
    }

    try {
      setLoading(true);
      await updateReportForm(id, formData);
      setSuccessMessage('Report form updated successfully!');
      setTimeout(() => {
        navigate('/report-management-system/report-forms');
      }, 2000);
    } catch (err) {
      setError('Error updating report form: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/report-management-system/report-forms');
  };

  if (fetchLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        backgroundColor: RMSTheme.background.default
      }}>
        <CircularProgress sx={{ color: RMSTheme.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      p: 3,
      backgroundColor: RMSTheme.background.default,
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/report-management-system/report-forms')}
          sx={{
            color: RMSTheme.primary.main,
            mb: 2,
            '&:hover': {
              backgroundColor: RMSTheme.background.hover,
              color: RMSTheme.primary.dark
            }
          }}
        >
          Back to List
        </Button>
        
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            color: RMSTheme.text.primary,
            fontWeight: 'bold'
          }}
        >
          Edit Report Form
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ 
        p: 4,
        backgroundColor: RMSTheme.background.paper,
        boxShadow: RMSTheme.shadows.medium,
        borderRadius: RMSTheme.borderRadius.medium
      }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined" sx={{
                borderColor: RMSTheme.primary.light,
                backgroundColor: RMSTheme.background.paper
              }}>
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      color: RMSTheme.primary.main,
                      fontWeight: 'bold',
                      mb: 3
                    }}
                  >
                    Form Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required sx={{
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
                        <InputLabel>Report Form Type</InputLabel>
                        <Select
                          name="reportFormTypeId"
                          value={formData.reportFormTypeId}
                          label="Report Form Type"
                          onChange={handleInputChange}
                        >
                          {reportFormTypes.map((type) => (
                            <MenuItem key={type.id} value={type.id}>
                              {type.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth sx={{
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
                        <InputLabel>Form Status</InputLabel>
                        <Select
                          name="formStatus"
                          value={formData.formStatus}
                          label="Form Status"
                          onChange={handleInputChange}
                        >
                          {formStatusOptions.map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth sx={{
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
                        <InputLabel>Upload Status</InputLabel>
                        <Select
                          name="uploadStatus"
                          value={formData.uploadStatus}
                          label="Upload Status"
                          onChange={handleInputChange}
                        >
                          {uploadStatusOptions.map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="uploadHostname"
                        label="Upload Hostname"
                        value={formData.uploadHostname}
                        onChange={handleInputChange}
                        sx={{
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
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="uploadIPAddress"
                        label="Upload IP Address"
                        value={formData.uploadIPAddress}
                        onChange={handleInputChange}
                        sx={{
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
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  sx={{
                    borderColor: RMSTheme.primary.main,
                    color: RMSTheme.primary.main,
                    '&:hover': {
                      borderColor: RMSTheme.primary.dark,
                      backgroundColor: RMSTheme.background.hover,
                      color: RMSTheme.primary.dark
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                  sx={{
                    background: RMSTheme.gradients.primary,
                    color: RMSTheme.text.onPrimary,
                    boxShadow: RMSTheme.shadows.medium,
                    '&:hover': {
                      background: RMSTheme.gradients.accent,
                      boxShadow: RMSTheme.shadows.large
                    },
                    '&:disabled': {
                      background: RMSTheme.text.disabled,
                      color: RMSTheme.text.hint
                    }
                  }}
                >
                  {loading ? 'Updating...' : 'Update Report Form'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

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

export default ReportFormEdit;