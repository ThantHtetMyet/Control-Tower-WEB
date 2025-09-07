import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField, Button, Box, Typography, Paper, Grid,
  Alert, Snackbar, CircularProgress
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { fetchBuildingById, createBuilding, updateBuilding } from '../api-services/buildingService';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

const BuildingForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the current user from AuthContext
  const [loading, setLoading] = useState(isEdit);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: ''
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchBuildingData();
    }
    // Log user object to check its structure
    console.log('User object:', user);
  }, [isEdit, id]);

  const fetchBuildingData = async () => {
    try {
      setLoading(true);
      const data = await fetchBuildingById(id);
      setFormData({
        name: data.name,
        code: data.code || '',
        address: data.address || ''
      });
    } catch (error) {
      console.error('Error fetching building:', error);
      showNotification('Error fetching building details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Check if user exists and has an ID
      if (!user || !user.id) { // Changed from user.ID to user.id
        console.error('User or user ID is missing:', user);
        showNotification('Error: User information is missing. Please log in again.', 'error');
        setLoading(false);
        return;
      }
      
      const buildingData = isEdit ? {
        id: id,
        ...formData,
        updatedBy: user.id // Changed from user.ID to user.id
      } : {
        ...formData,
        createdBy: user.id // Changed from user.ID to user.id
      };
      
      // Log what's being sent to the API
      console.log('Sending building data:', JSON.stringify(buildingData));
      
      if (isEdit) {
        await updateBuilding(id, buildingData);
        showNotification('Building updated successfully');
      } else {
        await createBuilding(buildingData);
        showNotification('Building created successfully');
        // Navigate to building list after successful creation
        navigate('/room-booking-system/buildings');
      }
    } catch (error) {
      console.error('Error saving building:', error);
      showNotification(`Error ${isEdit ? 'updating' : 'creating'} building`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold', 
          color: '#3f51b5', 
          textAlign: 'center',
          width: '100%'
        }}>
          Add New Building
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: 'auto' }}>
          {loading && isEdit ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" sx={{ color: '#3f51b5', fontWeight: 'bold', mb: 1, mt: 3 }}>
                  Building Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    name="name"
                    label="Building Name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                    inputProps={{ maxLength: 100 }}
                  />
                  <TextField
                    name="code"
                    label="Building Code"
                    value={formData.code}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    inputProps={{ maxLength: 20 }}
                  />
                  <TextField
                    name="address"
                    label="Address"
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    inputProps={{ maxLength: 300 }}
                  />
                </Box>

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #303f9f 0%, #1a237e 100%)'
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : (isEdit ? 'Update' : 'Save')}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/room-booking-system')}
                    sx={{
                      borderColor: '#3f51b5',
                      color: '#3f51b5',
                      '&:hover': {
                        borderColor: '#303f9f',
                        backgroundColor: 'rgba(63, 81, 181, 0.04)'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default BuildingForm;