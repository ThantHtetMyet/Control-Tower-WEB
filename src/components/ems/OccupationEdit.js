import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Snackbar,
  Rating,
  CircularProgress,
  Container,
  Card,
  Stack
} from '@mui/material';
import { Save, Cancel, Star, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmployeeNavBar from './EmployeeNavBar';

import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const OccupationEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [formData, setFormData] = useState({
    id: '',
    occupationName: '',
    description: '',
    remark: '',
    rating: 3,
    updatedBy: user?.id || '00000000-0000-0000-0000-000000000000'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchOccupation();
  }, [id]);

  const fetchOccupation = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${API_BASE_URL}/Occupation/${id}`);
      if (!response.ok) {
        throw new Error('Occupation not found');
      }
      const data = await response.json();
      setFormData({
        id: data.id,
        occupationName: data.occupationName,
        description: data.description || '',
        remark: data.remark || '',
        rating: data.rating,
        updatedBy: user?.id || '00000000-0000-0000-0000-000000000000'
      });
    } catch (err) {
      showNotification('Error fetching occupation: ' + err.message, 'error');
    } finally {
      setFetchLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRatingChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      rating: newValue || 1
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.occupationName.trim()) {
      newErrors.occupationName = 'Occupation name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        id: formData.id,
        occupationName: formData.occupationName,
        description: formData.description,
        remark: formData.remark,
        rating: formData.rating,
        updatedBy: user?.id || '00000000-0000-0000-0000-000000000000'
      };

      const response = await fetch(`${API_BASE_URL}/Occupation/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update occupation');
      }

      showNotification('Occupation updated successfully!');
      setTimeout(() => {
        navigate('/employee-management/occupations');
      }, 2000);
    } catch (err) {
      showNotification('Error updating occupation: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/employee-management/occupations');
  };

  if (fetchLoading) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <EmployeeNavBar />
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress sx={{ color: '#34C759' }} />
        </Box>
      </Box>
    );
  }

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
              onClick={() => navigate('/employee-management/occupations')}
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
              Edit Occupation
            </Typography>
          </Stack>
        </Box>

        {/* Form Section */}
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Occupation Name"
                  name="occupationName"
                  value={formData.occupationName}
                  onChange={handleInputChange}
                  required
                  error={!!errors.occupationName}
                  helperText={errors.occupationName || "Enter the name of the occupation"}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#34C759',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#34C759',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#34C759',
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
                  rows={3}
                  variant="outlined"
                  helperText="Describe the occupation responsibilities and requirements"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#34C759',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#34C759',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#34C759',
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
                  rows={2}
                  variant="outlined"
                  helperText="Additional notes or comments"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#34C759',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#34C759',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#34C759',
                    },
                  }}
                />

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    sx={{
                      borderColor: '#6c757d',
                      color: '#6c757d',
                      '&:hover': {
                        borderColor: '#5a6268',
                        color: '#5a6268',
                        backgroundColor: 'rgba(108, 117, 125, 0.04)'
                      },
                      px: 3,
                      py: 1.5
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
                      '&:hover': {
                        background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(52, 199, 89, 0.3)'
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, #a8a8a8 0%, #8d8d8d 100%)'
                      },
                      px: 3,
                      py: 1.5
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Occupation'}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Card>

        {/* Background decoration */}
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.02) 0%, rgba(40, 167, 69, 0.02) 100%)',
          zIndex: -1,
          pointerEvents: 'none'
        }} />
      </Container>

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
  );
};

export default OccupationEdit;