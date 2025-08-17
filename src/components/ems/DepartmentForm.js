import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Add this import
import EmployeeNavBar from './EmployeeNavBar';

import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const DepartmentForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Add this line to get user from auth context
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    remark: '',
    createdBy: user?.id || '00000000-0000-0000-0000-000000000000' // Use user.id from session
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
      const response = await fetch(`${API_BASE_URL}/Department`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        showNotification('Department created successfully!', 'success');
        setTimeout(() => {
          navigate('/employee-management/departments');
        }, 1500);
      } else {
        const errorText = await response.text();
        showNotification(errorText || 'Error creating department', 'error');
      }
    } catch (error) {
      console.error('Error creating department:', error);
      showNotification('Error creating department. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/employee-management/departments');
  };

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
          Create New Department
        </Typography>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                  {loading ? 'Creating...' : 'Create Department'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>

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

export default DepartmentForm;