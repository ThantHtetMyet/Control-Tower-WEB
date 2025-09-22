import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Container,
  Card,
  Stack,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Save, Cancel, ArrowBack, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmployeeNavBar from './EmployeeNavBar';
import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const OccupationForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [occupationLevels, setOccupationLevels] = useState([]);
  const [formData, setFormData] = useState({
    occupationName: '',
    description: '',
    remark: '',
    rating: 0,
    occupationLevelId: '',
    createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchOccupationLevels();
  }, []);

  const fetchOccupationLevels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/OccupationLevel`);
      if (response.ok) {
        const data = await response.json();
        setOccupationLevels(data);
      } else {
        showNotification('Failed to fetch occupation levels', 'error');
      }
    } catch (error) {
      console.error('Error fetching occupation levels:', error);
      showNotification('Error fetching occupation levels', 'error');
    }
  };

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

  const handleRatingChange = (event, newValue) => {
    setFormData({
      ...formData,
      rating: newValue || 0
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.occupationName.trim()) {
      newErrors.occupationName = 'Occupation name is required';
    } else if (formData.occupationName.length > 100) {
      newErrors.occupationName = 'Occupation name must be less than 100 characters';
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
      const response = await fetch(`${API_BASE_URL}/Occupation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        showNotification('Occupation created successfully!', 'success');
        setTimeout(() => {
          navigate('/employee-management-system/occupations');
        }, 1500);
      } else {
        const errorText = await response.text();
        showNotification(errorText || 'Error creating occupation', 'error');
      }
    } catch (error) {
      console.error('Error creating occupation:', error);
      showNotification('Error creating occupation. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/employee-management-system/occupations');
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
              onClick={() => navigate('/employee-management-system/occupations')}
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
              Create New Occupation
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
                  label="Occupation Name"
                  value={formData.occupationName}
                  onChange={handleChange('occupationName')}
                  error={!!errors.occupationName}
                  helperText={errors.occupationName}
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

                {/* Occupation Level */}
                <FormControl fullWidth>
                  <InputLabel sx={{
                    '&.Mui-focused': {
                      color: '#34C759',
                    },
                  }}>Occupation Level</InputLabel>
                  <Select
                    value={formData.occupationLevelId}
                    onChange={handleChange('occupationLevelId')}
                    label="Occupation Level"
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#34C759',
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Select a level (optional)</em>
                    </MenuItem>
                    {occupationLevels.map((level) => (
                      <MenuItem key={level.id} value={level.id}>
                        {level.levelName} (Rank: {level.rank})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
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
                  value={formData.remark}
                  onChange={handleChange('remark')}
                  error={!!errors.remark}
                  helperText={errors.remark}
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
                    {loading ? 'Creating...' : 'Create Occupation'}
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
      </Container>
    </Box>
  );
};

export default OccupationForm;