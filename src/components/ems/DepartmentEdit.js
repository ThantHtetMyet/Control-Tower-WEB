import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Rating,
  Alert,
  Snackbar,
  CircularProgress,
  Container,
  Card,
  Stack
} from '@mui/material';
import { Save, Cancel, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Add this import
import EmployeeNavBar from './EmployeeNavBar';

import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const DepartmentEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth(); // Add this line to get user from auth context
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    remark: '',
    rating: 3,
    updatedBy: user?.id || '00000000-0000-0000-0000-000000000000' // Use user.id from session
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDepartment();
  }, [id]);

  // Update formData when user changes
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({
        ...prev,
        updatedBy: user.id
      }));
    }
  }, [user]);

  const fetchDepartment = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`${API_BASE_URL}/Department/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          id: data.id,
          name: data.name || '',
          description: data.description || '',
          remark: data.remark || '',
          rating: data.rating || 3,
          updatedBy: user?.id || '00000000-0000-0000-0000-000000000000' // Use actual user ID
        });
      } else {
        showNotification('Error fetching department details', 'error');
        navigate('/employee-management-system/departments');
      }
    } catch (error) {
      console.error('Error fetching department:', error);
      showNotification('Error fetching department details', 'error');
      navigate('/employee-management-system/departments');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = field === 'rating' ? event.target.value : event.target.value;
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Department name must be less than 100 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    if (formData.remark && formData.remark.length > 200) {
      newErrors.remark = 'Remark must be less than 200 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/Department/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        showNotification('Department updated successfully!', 'success');
        setTimeout(() => {
          navigate('/employee-management-system/departments');
        }, 1500);
      } else {
        const errorText = await response.text();
        showNotification(errorText || 'Error updating department', 'error');
      }
    } catch (error) {
      console.error('Error updating department:', error);
      showNotification('Error updating department. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/employee-management-system/departments');
  };

  if (initialLoading) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <EmployeeNavBar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress sx={{ color: '#34C759' }} />
          </Box>
        </Container>
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
              onClick={() => navigate('/employee-management-system/departments')}
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
              Edit Department
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
                {/* Department Name */}
                <TextField
                  fullWidth
                  label="Department Name"
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
                    {loading ? 'Updating...' : 'Update Department'}
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

export default DepartmentEdit;