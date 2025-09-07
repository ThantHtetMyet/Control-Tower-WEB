import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { Save, Cancel, Error as ErrorIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchRoomBookingById, updateRoomBooking } from '../api-services/roombookingService';
import { fetchRooms } from '../api-services/roomService';
import moment from 'moment';

const RoomBookingEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  // State management
  const [rooms, setRooms] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    roomId: '',
    roomName: '',
    startTime: moment(),
    endTime: moment().add(1, 'hour'),
    recurrenceRule: '',
    updatedBy: '',
    rowVersion: '',
    statusId: '',
  });

  const [errors, setErrors] = useState({});

  // Helper functions
  const openToast = useCallback((message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  }, []);

  const closeToast = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  const deriveRoomId = useCallback((bookingData, roomsList) => {
    // Prefer ID from API (support both `roomID` and `roomId`)
    const directId = bookingData?.roomID?.toString?.() || bookingData?.roomId?.toString?.() || '';
    
    if (directId) return directId;

    // Fallback: try to match by name if provided
    if (roomsList?.length && bookingData?.roomName) {
      const match = roomsList.find(r => r.name === bookingData.roomName);
      if (match) return String(match.id);
    }

    return '';
  }, []);

  // Add error modal state
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: '',
    message: '',
    type: ''
  });

  const validateForm = useCallback(() => {
    const validationErrors = {};
    
    if (!formData.title?.trim()) {
      validationErrors.title = 'Title is required';
    }
    
    if (!formData.roomId) {
      validationErrors.roomId = 'Room is required';
    }
    
    if (!formData.startTime || !moment(formData.startTime).isValid()) {
      validationErrors.startTime = 'Valid start time is required';
    }
    
    if (!formData.endTime || !moment(formData.endTime).isValid()) {
      validationErrors.endTime = 'Valid end time is required';
    }

    // Check for same start and end time
    if (
      formData.startTime &&
      formData.endTime &&
      moment(formData.startTime).isSame(moment(formData.endTime))
    ) {
      return { type: 'SAME_TIME' };
    }

    // Check if end time is before start time
    if (
      formData.startTime &&
      formData.endTime &&
      moment(formData.endTime).isBefore(moment(formData.startTime))
    ) {
      return { type: 'END_BEFORE_START' };
    }

    // Check if booking duration exceeds 24 hours
    if (
      formData.startTime &&
      formData.endTime &&
      moment(formData.endTime).diff(moment(formData.startTime), 'hours') > 24
    ) {
      return { type: 'DURATION_EXCEEDED' };
    }

    // Check if booking is too short (less than 15 minutes)
    if (
      formData.startTime &&
      formData.endTime &&
      moment(formData.endTime).diff(moment(formData.startTime), 'minutes') < 15
    ) {
      return { type: 'DURATION_TOO_SHORT' };
    }

    return validationErrors;
  }, [formData]);

  // Function to show specific error modal
  const showErrorModal = (errorType) => {
    const errorConfig = {
      SAME_TIME: {
        title: 'Invalid Time Selection',
        message: 'Start time and end time cannot be the same. Please select different times for your booking.',
        type: 'SAME_TIME'
      },
      END_BEFORE_START: {
        title: 'Invalid Time Range',
        message: 'End time must be after the start time. Please adjust your booking times.',
        type: 'END_BEFORE_START'
      },
      DURATION_EXCEEDED: {
        title: 'Booking Duration Too Long',
        message: 'Booking duration cannot exceed 24 hours. Please select a shorter time period for your booking.',
        type: 'DURATION_EXCEEDED'
      },
      DURATION_TOO_SHORT: {
        title: 'Booking Duration Too Short',
        message: 'Booking duration must be at least 15 minutes. Please extend your booking time.',
        type: 'DURATION_TOO_SHORT'
      }
    };

    const config = errorConfig[errorType];
    if (config) {
      setErrorModal({
        open: true,
        ...config
      });
    }
  };

  // Load initial data
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setFetchLoading(true);
      setError('');

      try {
        const [roomsData, bookingData] = await Promise.all([
          fetchRooms(),
          fetchRoomBookingById(id),
        ]);

        if (!mounted) return;

        setRooms(roomsData || []);

        const resolvedRoomId = deriveRoomId(bookingData, roomsData);
        
        setFormData({
          id: bookingData.id || '',
          title: bookingData.title || '',
          description: bookingData.description || '',
          roomId: resolvedRoomId,
          roomName: bookingData.roomName || '',
          startTime: bookingData.startTime ? moment.parseZone(bookingData.startTime).local() : moment(),
          endTime: bookingData.endTime ? moment.parseZone(bookingData.endTime).local() : moment().add(1, 'hour'),
          recurrenceRule: bookingData.recurrenceRule || '',
          updatedBy: user?.id || bookingData.updatedBy || '',
          rowVersion: bookingData.rowVersion || '',
          statusId: bookingData.statusID || bookingData.statusId || '',
        });
      } catch (err) {
        console.error('Error loading data:', err);
        if (mounted) {
          const errorMessage = err?.message || 'Failed to load booking or rooms. Please try again later.';
          setError(errorMessage);
          openToast('Failed to load booking or rooms. Please check your connection.', 'error');
        }
      } finally {
        if (mounted) {
          setFetchLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [id, user?.id, deriveRoomId, openToast]);

  // Event handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleDateChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationResult = validateForm();
    
    // Check if it's a specific error type
    if (validationResult.type) {
      showErrorModal(validationResult.type);
      return;
    }
    
    // Check for regular validation errors
    if (Object.keys(validationResult).length > 0) {
      setErrors(validationResult);
      openToast('Please fix the validation errors before submitting.', 'error');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare data for API - convert moment objects to ISO strings
      const apiData = {
        ...formData,
        startTime: formData.startTime ? formData.startTime.toISOString() : null,
        endTime: formData.endTime ? formData.endTime.toISOString() : null,
        updatedBy: user?.id || formData.updatedBy || '',
        RowVersion: formData.rowVersion, // Use RowVersion (capital R) to match backend DTO
      };

      console.log('Submitting booking data:', apiData);

      await updateRoomBooking(id, apiData);

      openToast('Booking updated successfully!', 'success');
      
      // Navigate back to booking list after a short delay
      setTimeout(() => {
        navigate('/room-booking-system/bookings');
      }, 1500);
    } catch (err) {
      console.error('Error updating booking:', err);

      if (err?.type === 'CONCURRENCY_CONFLICT') {
        openToast(
          err.message || 'Your copy was stale; refreshed with latest data.',
          'warning'
        );

        // Update form with latest data if available
        if (err.latestData) {
          const latest = err.latestData;
          setFormData(prev => ({
            ...prev,
            ...latest,
            roomId: deriveRoomId(latest, rooms) || prev.roomId,
            startTime: latest.startTime ? moment.parseZone(latest.startTime).local() : prev.startTime,
            endTime: latest.endTime ? moment.parseZone(latest.endTime).local() : prev.endTime,
            updatedBy: user?.id || prev.updatedBy,
          }));
        }
      } else if (err?.type === 'BOOKING_IN_PROCESS') {
        openToast(
          err.message || 'Booking is being processed by HR.',
          'error'
        );
        setTimeout(() => {
          navigate(`/room-booking-system/bookings/${id}`);
        }, 1500);
      } else if (err?.type === 'FORBIDDEN') {
        openToast(
          err.message || 'You do not have permission to edit this booking.',
          'error'
        );
        setTimeout(() => {
          navigate('/room-booking-system/bookings');
        }, 1500);
      } else {
        const errorMessage = err?.message || 'Failed to update booking. Please try again.';
        setError(errorMessage);
        openToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = useCallback(() => {
    navigate('/room-booking-system/bookings');
  }, [navigate]);

  // Loading state
  if (fetchLoading) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
          }}
        >
          <CircularProgress sx={{ mb: 2, color: '#3f51b5' }} />
          <Typography variant="h6" color="textSecondary">
            Loading booking data...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Main render
  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            mb: 4,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              borderBottom: '2px solid #3f51b5',
              pb: 2,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              Edit Booking
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Typography
              variant="h6"
              sx={{ color: '#3f51b5', fontWeight: 'bold', mb: 2, mt: 3 }}
            >
              Booking Information
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Title Field */}
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                variant="outlined"
                error={!!errors.title}
                helperText={errors.title}
                placeholder="Enter booking title"
              />

              {/* Room Selection */}
              <TextField
                fullWidth
                label="Room"
                name="roomId"
                select
                value={formData.roomId || ''}
                onChange={handleChange}
                required
                variant="outlined"
                error={!!errors.roomId}
                helperText={errors.roomId || 'Select a room for the booking'}
              >
                {rooms.map((room) => (
                  <MenuItem key={room.id} value={String(room.id)}>
                    {room.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Date Time Pickers */}
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DateTimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(val) => handleDateChange('startTime', val)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!errors.startTime || params.error}
                      helperText={errors.startTime || params.helperText}
                    />
                  )}
                  minDateTime={moment()}
                />

                <DateTimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={(val) => handleDateChange('endTime', val)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!errors.endTime || params.error}
                      helperText={errors.endTime || params.helperText}
                    />
                  )}
                  minDateTime={formData.startTime || moment()}
                />
              </LocalizationProvider>

              {/* Description Field */}
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                variant="outlined"
                placeholder="Enter booking description (optional)"
              />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={loading}
                sx={{
                  borderColor: '#6c757d',
                  color: '#6c757d',
                  '&:hover': {
                    borderColor: '#5a6268',
                    color: '#5a6268',
                    backgroundColor: 'rgba(108, 117, 125, 0.04)',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? null : <Save />}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #303f9f 0%, #1a237e 100%)',
                  },
                  '&:disabled': {
                    background: '#ccc',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Save Changes'
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={notification.severity} sx={{ width: '100%' }} onClose={closeToast}>
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Error Modal */}
      {errorModal.open && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300
        }}>
          <Paper sx={{ p: 3, maxWidth: 500, mx: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ErrorIcon sx={{ color: '#f44336', mr: 1, fontSize: 28 }} />
              <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                {errorModal.title}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
              {errorModal.message}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => setErrorModal({ open: false, title: '', message: '', type: '' })}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #303f9f 0%, #1a237e 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(63, 81, 181, 0.3)'
                  }
                }}
              >
                OK
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default RoomBookingEdit;