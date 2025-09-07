import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
  Container
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { Save, Cancel } from '@mui/icons-material';
import { fetchRoomBookingById, createRoomBooking } from '../api-services/roombookingService';
import { fetchRooms } from '../api-services/roomService';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import { fetchRoomBookingStatuses } from '../api-services/roombookingStatusService';

const RoomBookingForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasHRAccess } = useAuth();
  const [loading, setLoading] = useState(isEdit);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    roomId: '',
    startTime: moment().local(),
    endTime: moment().add(1, 'hour').local(),
    recurrenceRule: '',
    statusId: '' // Default status ID will be set in handleSubmit if not provided
  });
  const [errors, setErrors] = useState({});

  // Redirect HR users away from the booking form
  useEffect(() => {
    // Check if user is from HR department
    if (hasHRAccess()) {
      setNotification({
        open: true,
        message: 'HR accounts cannot create room bookings. You can only approve or reject booking requests.',
        severity: 'warning'
      });
      // Redirect to the bookings list after a short delay
      setTimeout(() => navigate('/room-booking-system/bookings'), 2000);
    }
  }, [hasHRAccess, navigate]);


  // Add this state variable with other state variables
  const [statuses, setStatuses] = useState([]);
  const [pendingStatusId, setPendingStatusId] = useState('');
  
  // Add this function to fetch statuses
  const fetchStatusesData = async () => {
    try {
      const statusesData = await fetchRoomBookingStatuses();
      setStatuses(statusesData);
      
      // Find the 'Pending' status ID
      const pendingStatus = statusesData.find(status => status.name === 'Pending');
      if (pendingStatus) {
        setPendingStatusId(pendingStatus.id);
      } else {
        console.error('Pending status not found');
      }
    } catch (error) {
      console.error('Error fetching statuses:', error);
      setNotification({
        open: true,
        message: 'Failed to load statuses. Please try again later.',
        severity: 'error'
      });
    }
  };
  
  // Add this to the useEffect that loads data
  useEffect(() => {
    if (!isEdit) {
      fetchRoomsData();
      fetchStatusesData(); // Add this line
    } else if (id) {
      fetchRoomsData();
      fetchStatusesData(); // Add this line
      fetchBookingData();
    }
  }, [id, isEdit]);
  
  // Update the handleSubmit function to use the pendingStatusId
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent HR users from submitting the form
    if (hasHRAccess()) {
      setNotification({
        open: true,
        message: 'HR accounts cannot create room bookings.',
        severity: 'error'
      });
      return;
    }
    
    // Validate form
    const validationErrors = {};
    if (!formData.title) validationErrors.title = 'Title is required';
    if (!formData.roomId) validationErrors.roomId = 'Room is required';
    if (!formData.startTime) validationErrors.startTime = 'Start time is required';
    if (!formData.endTime) validationErrors.endTime = 'End time is required';
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    try {
      const bookingToCreate = {
        ...formData,
        // Convert moment objects to UTC ISO strings before sending to API
        startTime: formData.startTime ? moment.parseZone(formData.startTime).local() : null,
        endTime: formData.endTime ? moment.parseZone(formData.endTime).local() : null,
        createdBy: user?.id || '',
        requestedBy: user?.id || '',
        statusId: pendingStatusId || formData.statusId
      };
      
      await createRoomBooking(bookingToCreate);
      setNotification({
        open: true,
        message: 'Booking created successfully!',
        severity: 'success'
      });
      setTimeout(() => navigate('/room-booking-system/bookings'), 1500);
    } catch (error) {
      console.error('Error creating booking:', error);
      setNotification({
        open: true,
        message: 'Failed to create booking. Please try again.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const fetchRoomsData = async () => {
    try {
      const roomsData = await fetchRooms();
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setNotification({
        open: true,
        message: 'Failed to load rooms. Please try again later.',
        severity: 'error'
      });
    }
  };

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      const bookingData = await fetchRoomBookingById(id);
      if (bookingData) {
        setFormData({
          ...bookingData,
          startTime: moment.parseZone(bookingData.startTime).local(),
          endTime: moment.parseZone(bookingData.endTime).local()
        });
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      setNotification({
        open: true,
        message: 'Failed to load booking details. Please try again later.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsData();
    if (isEdit && id) {
      fetchBookingData();
    }
  }, [isEdit, id]);

  // If user is from HR, show a message and don't render the form
  if (hasHRAccess()) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold', 
          color: '#3f51b5', 
          textAlign: 'center',
          width: '100%'
        }}>
          Access Restricted
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: 'auto' }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            HR accounts cannot create room bookings. You can only approve or reject booking requests.
          </Alert>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/room-booking-system/bookings')}
              sx={{
                background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #303f9f 0%, #1a237e 100%)'
                }
              }}
            >
              Back to Bookings
            </Button>
          </Box>
        </Paper>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <Alert severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold', 
          color: '#3f51b5', 
          textAlign: 'center',
          width: '100%'
        }}>
          Add New Booking
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
                  Booking Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Title"
                    fullWidth
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    error={!!errors.title}
                    helperText={errors.title}
                    inputProps={{ maxLength: 150 }}
                  />
                  
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    inputProps={{ maxLength: 500 }}
                  />
                  
                  <TextField
                    select
                    label="Room"
                    fullWidth
                    required
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    error={!!errors.roomId}
                    helperText={errors.roomId}
                  >
                    {rooms.map((room) => (
                      <MenuItem key={room.id} value={room.id}>
                        {room.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DateTimePicker
                      label="Start Time"
                      value={moment(formData.startTime).local()}
                      onChange={(newValue) => setFormData({ ...formData, startTime: newValue })}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          required 
                          error={!!errors.startTime}
                          helperText={errors.startTime}
                        />
                      )}
                    />
                    
                    <DateTimePicker
                      label="End Time"
                      value={moment(formData.endTime).local()}
                      onChange={(newValue) => setFormData({ ...formData, endTime: newValue })}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          required 
                          error={!!errors.endTime}
                          helperText={errors.endTime}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  
                  <TextField
                    label="Recurrence Rule (Optional)"
                    fullWidth
                    value={formData.recurrenceRule || ''}
                    onChange={(e) => setFormData({ ...formData, recurrenceRule: e.target.value })}
                    placeholder="e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR"
                    inputProps={{ maxLength: 200 }}
                    helperText="Format: FREQ=DAILY/WEEKLY/MONTHLY;COUNT=10;BYDAY=MO,TU,WE,TH,FR"
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
                    onClick={() => navigate('/room-booking-system/bookings')}
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
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <Alert severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default RoomBookingForm;