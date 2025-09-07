import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchRoomById, updateRoom } from '../api-services/roomService';
import { fetchBuildings } from '../api-services/buildingService';

const RoomEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [buildings, setBuildings] = useState([]);
  
  // In the initial state, remove the floor property
  const [formData, setFormData] = useState({
    id: '',
    buildingID: '',
    name: '',
    code: '',
    // floor: '', - Remove this line
    capacity: 0,
    description: '',
    updatedBy: user?.id || ''
  });

  useEffect(() => {
    Promise.all([
      fetchRoomData(),
      fetchBuildingsData()
    ]);
  }, [id]);

  const fetchBuildingsData = async () => {
    try {
      const data = await fetchBuildings();
      setBuildings(data);
    } catch (error) {
      setError('Error fetching buildings: ' + error.message);
    }
  };

  const fetchRoomData = async () => {
    try {
      setFetchLoading(true);
      const data = await fetchRoomById(id);
      // In the fetchRoomData function, remove setting the floor property
      setFormData({
        id: data.id,
        buildingID: data.buildingID,
        name: data.name,
        code: data.code || '',
        // floor: data.floor || '', - Remove this line
        capacity: data.capacity,
        description: data.description || '',
        updatedBy: user?.id || ''
      });
    } catch (err) {
      setError('Error fetching room: ' + err.message);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      setError('User information is missing. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      const roomData = {
        ...formData,
        updatedBy: user.id
      };
      
      await updateRoom(id, roomData);
      setSuccessMessage('Room updated successfully!');
      
      // Navigate to rooms list page after successful update
      setTimeout(() => {
        navigate(`/room-booking-system/rooms`);
      }, 1500);
    } catch (err) {
      setError('Error updating room: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <CircularProgress sx={{ mb: 2, color: '#3f51b5' }} />
          <Typography>Loading room data...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
        <Paper elevation={0} sx={{ 
          p: 4, 
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          mb: 4 
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            borderBottom: '2px solid #3f51b5',
            pb: 2
          }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              Edit Room
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Room Information */}
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
                fullWidth
                label="Room Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Room Code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                required
                variant="outlined"
                inputProps={{ min: 0 }}
              />
              
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                variant="outlined"
              />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate(`/room-booking-system/rooms`)}
                sx={{
                  borderColor: '#6c757d',
                  color: '#6c757d',
                  '&:hover': {
                    borderColor: '#5a6268',
                    color: '#5a6268',
                    backgroundColor: 'rgba(108, 117, 125, 0.04)'
                  }
                }}
              >
                Cancel
              </Button>
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
                {loading ? 'Updating...' : 'Update Room'}
              </Button>
            </Box>
          </Box>
        </Paper>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage('')}
        >
          <Alert onClose={() => setSuccessMessage('')} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default RoomEdit;