import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField, Button, Box, Typography, Paper, Grid,
  Alert, Snackbar, CircularProgress, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { createRoom, updateRoom } from '../api-services/roomService';
import { fetchBuildings } from '../api-services/buildingService';
import { useAuth } from '../contexts/AuthContext';

const RoomForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(isEdit);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [buildings, setBuildings] = useState([]);
  // In the initial state, remove the floor property
  const [formData, setFormData] = useState({
    buildingID: '',
    name: '',
    code: '',
    // floor: '', - Remove this line
    capacity: 0,
    description: ''
  });

  useEffect(() => {
    fetchBuildingsData();
    // Log user object to check its structure
    console.log('User object:', user);
  }, []);

  const fetchBuildingsData = async () => {
    try {
      const data = await fetchBuildings();
      setBuildings(data);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      showNotification('Error fetching buildings', 'error');
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
      if (!user || !user.id) {
        console.error('User or user ID is missing:', user);
        showNotification('Error: User information is missing. Please log in again.', 'error');
        setLoading(false);
        return;
      }
      
      const roomData = {
        ...formData,
        createdBy: user.id
      };
      
      // Log what's being sent to the API
      console.log('Sending room data:', JSON.stringify(roomData));
      
      await createRoom(roomData);
      showNotification('Room created successfully');
      // Navigate to room list after successful creation
      navigate('/room-booking-system/rooms');
    } catch (error) {
      console.error('Error saving room:', error);
      showNotification(`Error creating room`, 'error');
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
          Add New Room
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" sx={{ color: '#3f51b5', fontWeight: 'bold', mb: 1, mt: 3 }}>
                  Room Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth required>
                    <InputLabel id="building-select-label">Building</InputLabel>
                    <Select
                      labelId="building-select-label"
                      id="building-select"
                      name="buildingID"
                      value={formData.buildingID}
                      label="Building"
                      onChange={handleChange}
                      required
                    >
                      {buildings.map((building) => (
                        <MenuItem key={building.id} value={building.id}>
                          {building.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    name="name"
                    label="Room Name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                    inputProps={{ maxLength: 100 }}
                  />
                  
                  <TextField
                    name="code"
                    label="Room Code"
                    value={formData.code}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    inputProps={{ maxLength: 50 }}
                  />
                  
                  <TextField
                    name="capacity"
                    label="Capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                    inputProps={{ min: 0 }}
                  />
                  
                  <TextField
                    name="description"
                    label="Description"
                    value={formData.description}
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
                    {loading ? <CircularProgress size={24} /> : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/room-booking-system/rooms')}
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

export default RoomForm;