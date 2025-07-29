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
  CircularProgress
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import EmployeeNavBar from './EmployeeNavBar';

const API_BASE_URL = 'https://localhost:7145/api';

const DepartmentEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    remark: '',
    rating: 3,
    updatedBy: '00000000-0000-0000-0000-000000000000' // You might want to get this from auth context
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDepartment();
  }, [id]);

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
          updatedBy: '00000000-0000-0000-0000-000000000000'
        });
      } else {
        showNotification('Error fetching department details', 'error');
        navigate('/employee-management/departments');
      }
    } catch (error) {
      console.error('Error fetching department:', error);
      showNotification('Error fetching department details', 'error');
      navigate('/employee-management/departments');
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
          navigate('/employee-management/departments');
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
    navigate('/employee-management/departments');
  };

  if (initialLoading) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <EmployeeNavBar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress sx={{ color: '#34C759' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <EmployeeNavBar />
      
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold', 
          color: '#34C759', 
          mb: 3,
          borderBottom: '2px solid #34C759',
          pb: 2
        }}>
          Edit Department
        </Typography>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
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
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography component="legend" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Rating
                  </Typography>
                  <Rating
                    value={formData.rating}
                    onChange={(event, newValue) => {
                      setFormData({ ...formData, rating: newValue || 1 });
                    }}
                    size="large"
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: '#34C759',
                      },
                      '& .MuiRating-iconHover': {
                        color: '#28A745',
                      },
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
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
              </Grid>
              
              <Grid item xs={12}>
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
              </Grid>
              
              <Grid item xs={12}>
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
                      bgcolor: '#34C759',
                      '&:hover': {
                        bgcolor: '#28A745'
                      },
                      '&:disabled': {
                        bgcolor: '#ccc'
                      }
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Department'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

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
      </Box>
    </Box>
  );
};

export default DepartmentEdit;