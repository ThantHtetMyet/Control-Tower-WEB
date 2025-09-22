import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Snackbar,
  Container,
  Card,
  Stack
} from '@mui/material';
import { Save, Cancel, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmployeeNavBar from './EmployeeNavBar';

import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const CompanyForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    remark: '',
    createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
  });

  const [errors, setErrors] = useState({});

  // Update formData when user changes
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({
        ...prev,
        createdBy: user.id
      }));
    }
  }, [user]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/Company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create company');
      }

      showNotification('Company created successfully!');
      setTimeout(() => {
        navigate('/employee-management-system/companies');
      }, 2000);
    } catch (err) {
      showNotification('Error creating company: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/employee-management-system/companies');
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
              onClick={() => navigate('/employee-management-system/companies')}
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
              Create New Company
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
                {/* Company Name */}
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: '#34C759',
                        borderWidth: 2
                      },
                    },
                    '& .MuiInputLabel-root': {
                      '&.Mui-focused': {
                        color: '#34C759',
                      },
                    },
                  }}
                />
                
                {/* Description */}
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={handleChange('description')}
                  error={!!errors.description}
                  helperText={errors.description}
                  multiline
                  rows={4}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: '#34C759',
                        borderWidth: 2
                      },
                    },
                    '& .MuiInputLabel-root': {
                      '&.Mui-focused': {
                        color: '#34C759',
                      },
                    },
                  }}
                />
                
                {/* Remark */}
                <TextField
                  fullWidth
                  label="Remark"
                  value={formData.remark}
                  onChange={handleChange('remark')}
                  error={!!errors.remark}
                  helperText={errors.remark}
                  multiline
                  rows={3}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: '#34C759',
                        borderWidth: 2
                      },
                    },
                    '& .MuiInputLabel-root': {
                      '&.Mui-focused': {
                        color: '#34C759',
                      },
                    },
                  }}
                />

                {/* Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  justifyContent: 'flex-end', 
                  mt: 4,
                  pt: 3,
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    startIcon={<Cancel />}
                    sx={{
                      borderColor: '#64748b',
                      color: '#64748b',
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        borderColor: '#475569',
                        color: '#475569',
                        bgcolor: '#f8fafc'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={<Save />}
                    sx={{
                      background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 4px 12px rgba(52, 199, 89, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #28A745 0%, #22C55E 100%)',
                        boxShadow: '0 6px 16px rgba(52, 199, 89, 0.5)',
                        transform: 'translateY(-1px)'
                      },
                      '&:disabled': {
                        background: '#e2e8f0',
                        color: '#94a3b8',
                        boxShadow: 'none'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Company'}
                  </Button>
                </Box>
              </Stack>
            </form>
          </Box>
        </Card>

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
      </Container>
    </Box>
  );
};

export default CompanyForm;