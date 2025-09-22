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
  MenuItem,
  Rating
} from '@mui/material';
import { Save, Cancel, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmployeeNavBar from './EmployeeNavBar';
import { createSubDepartment } from '../api-services/subDepartmentService';
import { getDepartments } from '../api-services/employeeService';

const SubDepartmentForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    departmentID: '',
    name: '',
    description: '',
    remark: '',
    rating: 3,
    createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error('Error loading departments:', error);
        showNotification('Error loading departments', 'error');
      }
    };
    loadDepartments();
  }, []);

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
      rating: newValue
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.departmentID.trim()) {
      newErrors.departmentID = 'Department is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Sub-department name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Sub-department name must be less than 100 characters';
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
      const submitData = {
        ...formData,
        rating: parseInt(formData.rating)
      };
      await createSubDepartment(submitData);
      showNotification('Sub-department created successfully!', 'success');
      setTimeout(() => {
        navigate('/employee-management-system/sub-departments');
      }, 1500);
    } catch (error) {
      console.error('Error creating sub-department:', error);
      showNotification('Error creating sub-department. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/employee-management-system/sub-departments');
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
              onClick={() => navigate('/employee-management-system/sub-departments')}
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
              Create New Sub-Department
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
                  select
                  fullWidth
                  label="Parent Department"
                  value={formData.departmentID}
                  onChange={handleChange('departmentID')}
                  error={!!errors.departmentID}
                  helperText={errors.departmentID}
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
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </TextField>
                
                <TextField
                  fullWidth
                  label="Sub-Department Name"
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
                    {loading ? 'Creating...' : 'Create Sub-Department'}
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

export default SubDepartmentForm;