import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Typography, Box, Chip, Tooltip, LinearProgress,
  Alert, Snackbar
} from '@mui/material';
import { Edit, Delete, Add, Visibility, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchRoomBookings, deleteRoomBooking } from '../api-services/roombookingService';
import moment from 'moment';
import { useAuth } from '../contexts/AuthContext';


const RoomBookingList = () => {
  
  const { user, hasHRAccess } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, bookingId: null, bookingTitle: '' });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookingsData();
  }, []);

  const fetchBookingsData = async () => {
    try {
      setLoading(true);
      const data = await fetchRoomBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showNotification('Error fetching bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleDeleteClick = (booking) => {
    setDeleteModal({
      open: true,
      bookingId: booking.id,
      bookingTitle: booking.title
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteRoomBooking(deleteModal.bookingId);
      setDeleteModal({ open: false, bookingId: null, bookingTitle: '' });
      showNotification('Booking deleted successfully');
      fetchBookingsData();
    } catch (error) {
      console.error('Error deleting booking:', error);
      showNotification('Error deleting booking', 'error');
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const getStatusChipColor = (statusName) => {
    switch (statusName?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'primary';
    }
  };

  const formatDateTime = (dateTime) => {
    return moment(dateTime).format('DD/MM/YYYY HH:mm');
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Box sx={{ p: 3 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading bookings...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          borderBottom: '2px solid #3f51b5',
          pb: 2
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
            Room Booking Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>            
            <Tooltip title="Refresh Bookings">
              <IconButton
                onClick={fetchBookingsData}
                sx={{
                  backgroundColor: '#3f51b5',
                  color: 'white',
                  width: 48,
                  height: 48,
                  border: '2px solid #3f51b5',
                  boxShadow: '0 2px 8px rgba(63, 81, 181, 0.3)',
                  '&:hover': {
                    backgroundColor: '#303f9f',
                    borderColor: '#303f9f',
                    boxShadow: '0 4px 12px rgba(63, 81, 181, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  '&:active': {
                    transform: 'translateY(0px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <Refresh sx={{ fontSize: 24 }} />
              </IconButton>
            </Tooltip>
            {!hasHRAccess() && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/room-booking-system/bookings/new')}
                sx={{
                  background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%) !important',
                  color: 'white !important',
                  px: 3,
                  py: 1
                }}
              >
                New Booking
              </Button>
            )}
          </Box>
        </Box>

        {bookings.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No bookings found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Click the "New Booking" button to create a booking
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#3f51b5' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Room</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Start Time</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>End Time</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Requested By</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow 
                    key={booking.id} 
                    hover
                    onDoubleClick={() => navigate(`/room-booking-system/bookings/details/${booking.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{booking.title}</TableCell>
                    <TableCell>{booking.roomName}</TableCell>
                    <TableCell>{formatDateTime(moment.parseZone(booking.startTime).local())}</TableCell>
                    <TableCell>{formatDateTime(moment.parseZone(booking.endTime).local())}</TableCell>
                    <TableCell>
                      <Chip 
                        label={booking.statusName} 
                        color={getStatusChipColor(booking.statusName)} 
                        size="small" 
                        sx={{ fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell>{booking.requestedByName}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton 
                          onClick={() => navigate(`/room-booking-system/bookings/details/${booking.id}`)} 
                          size="small" 
                          sx={{ color: '#3f51b5' }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      {/* Show Edit and Delete buttons only for non-HR users */}
                      {!hasHRAccess() && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton 
                              onClick={() => navigate(`/room-booking-system/bookings/edit/${booking.id}`)} 
                              size="small" 
                              sx={{ color: '#f9a825' }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              onClick={() => handleDeleteClick(booking)} 
                              size="small" 
                              sx={{ color: '#f44336' }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Confirmation Modal would be implemented here */}
        
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default RoomBookingList;