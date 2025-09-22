import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  Container,
  Card,
  Stack
} from '@mui/material';
import { Save, Cancel, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import applicationService from '../api-services/applicationService';
import EmployeeNavBar from '../ems/EmployeeNavBar';

function ApplicationForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    applicationName: '',
    description: '',
    remark: '',
    createdBy: user?.id || '00000000-0000-0000-0000-000000000000' // Add this line
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      fetchApplication();
    }
  }, [id, isEdit]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getApplication(id);
      setFormData({
        applicationName: data.applicationName,
        description: data.description || '',
        remark: data.remark || ''
      });
    } catch (err) {
      setError('Failed to fetch application data');
      console.error('Error fetching application:', err);
    } finally {
      setLoading(false);
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
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await applicationService.updateApplication(id, formData);
      } else {
        await applicationService.createApplication(formData);
      }
      
      setSuccessMessage(`Application ${isEdit ? 'updated' : 'created'} successfully!`);
      setTimeout(() => {
        navigate('/employee-management-system/applications');
      }, 2000);
    } catch (err) {
      setError(isEdit ? 'Failed to update application' : 'Failed to create application');
      console.error('Error submitting application:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/employee-management-system/applications');
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <EmployeeNavBar />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{
          background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          boxShadow: '0 8px 32px rgba(52, 199, 89, 0.3)'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              onClick={() => navigate('/employee-management-system/applications')}
              sx={{
                color: 'white',
                minWidth: 'auto',
                p: 1,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <ArrowBack />
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
              {isEdit ? 'Edit Application' : 'Create New Application'}
            </Typography>
          </Stack>
        </Box>

        {/* Form Section */}
        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <TextField
                  fullWidth
                  label="Application Name"
                  name="applicationName"
                  value={formData.applicationName}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#34C759',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      '&.Mui-focused': {
                        color: '#34C759',
                      },
                    },
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  variant="outlined"
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#34C759',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      '&.Mui-focused': {
                        color: '#34C759',
                      },
                    },
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Remark"
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  variant="outlined"
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#34C759',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      '&.Mui-focused': {
                        color: '#34C759',
                      },
                    },
                  }}
                />

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={loading}
                    sx={{
                      borderColor: '#6c757d',
                      color: '#6c757d',
                      '&:hover': {
                        borderColor: '#5a6268',
                        backgroundColor: 'rgba(108, 117, 125, 0.04)'
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
                      background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 4px 15px rgba(52, 199, 89, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #28A745 0%, #20963D 100%)',
                        boxShadow: '0 6px 20px rgba(52, 199, 89, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                      '&:disabled': {
                        background: '#cccccc',
                        color: '#666666'
                      }
                    }}
                  >
                    {loading ? 'Saving...' : (isEdit ? 'Update Application' : 'Create Application')}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Box>
        </Card>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setError('')}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ApplicationForm;