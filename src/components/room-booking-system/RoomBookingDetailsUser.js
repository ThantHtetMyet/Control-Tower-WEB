import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Cancel as CancelIcon,
  Room,
  Schedule,
  Description,
  Person,
  Business,
  CalendarToday,
  AccessTime,
  Update
} from '@mui/icons-material';
import { fetchRoomBookingById, cancelRoomBooking } from '../api-services/roombookingService';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const RoomBookingDetailsUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBookingDetails();
  }, [id]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchRoomBookingById(id);
      setBooking(response);
    } catch (err) {
      setError('Failed to load booking details');
      console.error('Error loading booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancellationReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a reason for cancellation',
        severity: 'warning'
      });
      return;
    }

    try {
      setActionLoading(true);
      await cancelRoomBooking(id, {
        ID: id, // Added required ID field
        CancellationReason: cancellationReason,
        RowVersion: booking.rowVersion
      });
      setSnackbar({
        open: true,
        message: 'Booking cancelled successfully!',
        severity: 'success'
      });
      setCancelDialogOpen(false);
      setCancellationReason('');
      await loadBookingDetails();
      // Redirect to the bookings list after a short delay
      setTimeout(() => navigate('/room-booking-system/bookings'), 2000);
    } catch (err) {
      let errorMessage = 'Failed to cancel booking';
      if (err.response?.status === 409) {
        errorMessage = 'This booking has been modified by another user. Please refresh and try again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to cancel this booking.';
      }
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      console.error('Error cancelling booking:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const canEdit = () => {
    return booking?.statusName?.toLowerCase() === 'pending' && booking?.requestedBy === user?.id;
  };

  const canCancel = () => {
    const status = booking?.statusName?.toLowerCase();
    return status === 'pending' && booking?.requestedBy === user?.id;
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={60} />
              <Typography variant="h6" color="text.secondary">Loading booking details...</Typography>
            </Stack>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <Stack spacing={2} alignItems="center">
              <Typography color="error" variant="h6">{error}</Typography>
              <Button onClick={() => navigate('/room-bookings')}>Back to Bookings</Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!booking) {
    return (
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <Typography variant="h6">Booking not found</Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header with back and action buttons */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          borderBottom: '2px solid #3f51b5',
          pb: 2
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/room-booking-system/bookings')}
              sx={{ color: '#3f51b5' }}
            >
              Back to Bookings
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              My Booking Details
            </Typography>
          </Stack>
          
          {/* User Action Buttons */}
          <Stack direction="row" spacing={2}>
            {canEdit() && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => navigate(`/room-booking-system/bookings/edit/${booking.id}`)}
                sx={{
                  background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #303f9f 0%, #1a237e 100%)'
                  }
                }}
              >
                Edit Booking
              </Button>
            )}
            {canCancel() && (
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => setCancelDialogOpen(true)}
                disabled={actionLoading}
                sx={{
                  borderColor: '#f44336',
                  color: '#f44336',
                  '&:hover': {
                    borderColor: '#d32f2f',
                    backgroundColor: 'rgba(244, 67, 54, 0.04)'
                  }
                }}
              >
                Cancel Booking
              </Button>
            )}
          </Stack>
        </Box>

        {/* Title and Status Card */}
        <Card sx={{
          mb: 4,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{
              p: 3,
              background: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5', mb: 1 }}>
                {booking.title || 'No Title'}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle1" color="text.secondary">
                  Booking ID: {booking.id}
                </Typography>
                <Chip
                  label={booking.statusName || 'Unknown'}
                  color={getStatusColor(booking.statusName)}
                  size="large"
                  sx={{ fontWeight: 'bold' }}
                />
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Room Details Card */}
        <Card sx={{
          mb: 4,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Room sx={{ mr: 2, color: '#3f51b5' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Room Details</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Room sx={{ mr: 2, color: '#3f51b5' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Room Name
                    </Typography>
                    <Typography variant="body1">
                      {booking.roomName || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Business sx={{ mr: 2, color: '#3f51b5' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Building
                    </Typography>
                    <Typography variant="body1">
                      Not specified
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Schedule Card */}
        <Card sx={{
          mb: 4,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Schedule sx={{ mr: 2, color: '#3f51b5' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Schedule</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <CalendarToday sx={{ mr: 2, color: '#3f51b5' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(moment.parseZone(booking.startTime).local())}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <AccessTime sx={{ mr: 2, color: '#3f51b5' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Start Time
                    </Typography>
                    <Typography variant="body1">
                      {formatTime(moment.parseZone(booking.startTime).local())}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <AccessTime sx={{ mr: 2, color: '#3f51b5' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      End Time
                    </Typography>
                    <Typography variant="body1">
                      {formatTime(moment.parseZone(booking.endTime).local())}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Description Card */}
        <Card sx={{
          mb: 4,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Description sx={{ mr: 2, color: '#3f51b5' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Description</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1">
              {booking.description || 'No description provided'}
            </Typography>
          </CardContent>
        </Card>

        {/* Booking Information Card */}
        <Card sx={{
          mb: 4,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Person sx={{ mr: 2, color: '#3f51b5' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Booking Information</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Person sx={{ mr: 2, color: '#3f51b5' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Requested By
                    </Typography>
                    <Typography variant="body1">
                      {booking.requestedByName || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <CalendarToday sx={{ mr: 2, color: '#3f51b5' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDateTime(booking.createdDate)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Update sx={{ mr: 2, color: '#3f51b5' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {formatDateTime(booking.updatedDate)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* HR Action Details Card - Only show if there are HR actions */}
        {(booking.approvedByName || booking.rejectionReason || booking.cancelledByName) && (
          <Card sx={{
            mb: 4,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Business sx={{ mr: 2, color: '#3f51b5' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Action Details</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                {booking.approvedByName && (
                  <>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Person sx={{ mr: 2, color: '#3f51b5' }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Approved By
                          </Typography>
                          <Typography variant="body1">
                            {booking.approvedByName}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <CalendarToday sx={{ mr: 2, color: '#3f51b5' }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Approved Date
                          </Typography>
                          <Typography variant="body1">
                            {formatDateTime(booking.approvedDate)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </>
                )}
                {booking.rejectionReason && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Description sx={{ mr: 2, color: '#3f51b5' }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Rejection Reason
                        </Typography>
                        <Typography variant="body1">
                          {booking.rejectionReason}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {booking.cancelledByName && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Person sx={{ mr: 2, color: '#3f51b5' }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Cancelled By
                        </Typography>
                        <Typography variant="body1">
                          {booking.cancelledByName}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Cancel Dialog */}
        <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Are you sure you want to cancel this booking? Please provide a reason:
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Cancellation Reason"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setCancelDialogOpen(false);
              setCancellationReason('');
            }}>Cancel</Button>
            <Button
              onClick={handleCancel}
              variant="contained"
              color="error"
              disabled={actionLoading || !cancellationReason.trim()}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Cancel Booking'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default RoomBookingDetailsUser;