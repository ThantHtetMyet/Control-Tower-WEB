import React, { useState } from 'react';
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

const OccupationLevelForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    levelName: '',
    description: '',
    rank: '',
    createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      [field]: value
    });
    
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.levelName.trim()) {
      newErrors.levelName = 'Level name is required';
    } else if (formData.levelName.length > 100) {
      newErrors.levelName = 'Level name must be less than 100 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    if (!formData.rank || formData.rank < 1) {
      newErrors.rank = 'Rank must be a positive number';
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
      const submitData = {
        levelName: formData.levelName,
        description: formData.description,
        rank: parseInt(formData.rank),
        createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
      };

      const response = await fetch(`${API_BASE_URL}/OccupationLevel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        showNotification('Occupation level created successfully!', 'success');
        setTimeout(() => {
          navigate('/employee-management-system/occupation-levels');
        }, 1500);
      } else {
        const errorText = await response.text();
        showNotification(errorText || 'Error creating occupation level', 'error');
      }
    } catch (error) {
      console.error('Error creating occupation level:', error);
      showNotification('Error creating occupation level. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/employee-management-system/occupation-levels');
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
              onClick={() => navigate('/employee-management-system/occupation-levels')}
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
              Create New Occupation Level
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
                  label="Level Name"
                  value={formData.levelName}
                  onChange={handleChange('levelName')}
                  error={!!errors.levelName}
                  helperText={errors.levelName || "Enter the name of the occupation level"}
                  required
                  variant="outlined"
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
                  value={formData.description}
                  onChange={handleChange('description')}
                  error={!!errors.description}
                  helperText={errors.description || "Describe the occupation level"}
                  multiline
                  rows={4}
                  variant="outlined"
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
                  label="Rank"
                  type="number"
                  value={formData.rank}
                  onChange={handleChange('rank')}
                  error={!!errors.rank}
                  helperText={errors.rank || "Enter the rank/priority of this level (higher number = higher rank)"}
                  required
                  variant="outlined"
                  inputProps={{ min: 1 }}
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
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    startIcon={<Cancel />}
                    sx={{
                      borderColor: '#666',
                      color: '#666',
                      '&:hover': {
                        borderColor: '#333',
                        color: '#333'
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
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(52, 199, 89, 0.3)'
                      },
                      '&:disabled': {
                        background: '#ccc',
                        color: '#666'
                      }
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Occupation Level'}
                  </Button>
                </Box>
              </Stack>
            </form>
          </Box>
        </Card>

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

        {/* Background decoration */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.02) 0%, rgba(40, 167, 69, 0.02) 100%)',
            zIndex: -1,
            pointerEvents: 'none'
          }}
        />
      </Container>
    </Box>
  );
};

export default OccupationLevelForm;