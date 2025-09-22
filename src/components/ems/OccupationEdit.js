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
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Save, Cancel, Star, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmployeeNavBar from './EmployeeNavBar';
import { API_URL } from '../../config/apiConfig';

const OccupationEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [occupationLevels, setOccupationLevels] = useState([]);
  const [formData, setFormData] = useState({
    occupationName: '',
    description: '',
    remark: '',
    rating: 0,
    occupationLevelId: '',
    updatedBy: user?.id || ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchOccupation();
    fetchOccupationLevels();
  }, [id]);

  const fetchOccupation = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${API_URL}/Occupation/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          occupationName: data.occupationName || '',
          description: data.description || '',
          remark: data.remark || '',
          rating: data.rating || 0,
          occupationLevelId: data.occupationLevelID || '',
          updatedBy: user?.id || ''
        });
      } else {
        showNotification('Failed to fetch occupation details', 'error');
        navigate('/employee-management-system/occupations');
      }
    } catch (error) {
      console.error('Error fetching occupation:', error);
      showNotification('Error fetching occupation details', 'error');
      navigate('/employee-management-system/occupations');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchOccupationLevels = async () => {
    try {
      const response = await fetch(`${API_URL}/OccupationLevel`);
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

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
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
      rating: newValue
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/Occupation/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        showNotification('Occupation updated successfully!', 'success');
        setTimeout(() => {
          navigate('/employee-management-system/occupations');
        }, 1500);
      } else {
        const errorText = await response.text();
        showNotification(errorText || 'Failed to update occupation', 'error');
      }
    } catch (error) {
      console.error('Error updating occupation:', error);
      showNotification('Error updating occupation. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/employee-management-system/occupations');
  };

  if (fetchLoading) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <EmployeeNavBar />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={60} sx={{ color: '#34C759' }} />
              <Typography variant="h6" color="textSecondary">
                Loading occupation details...
              </Typography>
            </Stack>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <EmployeeNavBar />
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{
          background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/employee-management-system/occupations')}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              borderRadius: 2,
              mb: 2
            }}
          >
            Back to Occupations
          </Button>
          
          <Typography variant="h4" fontWeight="bold">
            Edit Occupation
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
            Update occupation information and level assignment
          </Typography>
          
          {/* Background decoration */}
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)'
          }} />
        </Box>

        {/* Form Section */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Occupation Name"
                name="occupationName"
                value={formData.occupationName}
                onChange={handleInputChange}
                error={!!errors.occupationName}
                helperText={errors.occupationName}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#34C759'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#34C759'
                  }
                }}
              />

              <FormControl fullWidth>
                <InputLabel sx={{
                  '&.Mui-focused': {
                    color: '#34C759'
                  }
                }}>Occupation Level</InputLabel>
                <Select
                  name="occupationLevelId"
                  value={formData.occupationLevelId}
                  onChange={handleInputChange}
                  label="Occupation Level"
                  sx={{
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#34C759'
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>Select Occupation Level</em>
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
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={4}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#34C759'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#34C759'
                  }
                }}
              />

              <TextField
                fullWidth
                label="Remark"
                name="remark"
                value={formData.remark}
                onChange={handleInputChange}
                error={!!errors.remark}
                helperText={errors.remark}
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#34C759'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#34C759'
                  }
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<Cancel />}
                  sx={{
                    flex: 1,
                    py: 1.5,
                    borderColor: '#64748b',
                    color: '#64748b',
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
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  sx={{
                    flex: 1,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(52, 199, 89, 0.3)'
                    },
                    '&:disabled': {
                      background: '#94a3b8',
                      color: 'white'
                    }
                  }}
                >
                  {loading ? 'Updating...' : 'Update Occupation'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Card>
      </Container>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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