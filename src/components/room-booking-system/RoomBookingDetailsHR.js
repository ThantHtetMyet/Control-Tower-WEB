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
  IconButton
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Room,
  Schedule,
  Description,
  Person,
  Business,
  CalendarToday,
  AccessTime
} from '@mui/icons-material';
import { fetchRoomBookingById, approveRoomBooking, rejectRoomBooking } from '../api-services/roombookingService';
import moment from 'moment';

const RoomBookingDetailsHR = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
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
      // console.error('Error loading booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await approveRoomBooking(id, {
        ID: id,
        RowVersion: booking.rowVersion
      });
      setSnackbar({
        open: true,
        message: 'Booking approved successfully!',
        severity: 'success'
      });
      setApproveDialogOpen(false);
      
      // Navigate back to booking list after success
      setTimeout(() => {
        navigate('/room-booking-system/bookings');
      }, 1500);
    } catch (err) {
      let errorMessage = 'Failed to approve booking';
      if (err.response?.status === 409) {
        errorMessage = 'This booking has been modified by another user. Please refresh and try again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to approve this booking.';
      }
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      // console.error('Error approving booking:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a reason for rejection',
        severity: 'warning'
      });
      return;
    }

    try {
      setActionLoading(true);
      await rejectRoomBooking(id, {
        ID: id,  // Add this required field
        RejectionReason: rejectionReason,
        RowVersion: booking.rowVersion
      });
      setSnackbar({
        open: true,
        message: 'Booking rejected successfully!',
        severity: 'success'
      });
      setRejectDialogOpen(false);
      setRejectionReason('');
      await loadBookingDetails();
      
      // Navigate back to booking list after success
      setTimeout(() => {
        navigate('/room-booking-system/buildings');
      }, 1500);
    } catch (err) {
      let errorMessage = 'Failed to reject booking';
      if (err.response?.status === 409) {
        errorMessage = 'This booking has been modified by another user. Please refresh and try again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to reject this booking.';
      }
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      // console.error('Error rejecting booking:', err);
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography color="error" variant="h6">{error}</Typography>
        </Box>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6">Booking not found</Typography>
        </Box>
      </Container>
    );
  }

  const isPending = booking.statusName?.toLowerCase() === 'pending';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/room-booking-system/bookings')}
          sx={{ mb: 2 }}
        >
          Back to Bookings
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          HR Review - Booking Details
        </Typography>
      </Box>

      {/* Title and Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                {booking.title || 'No Title'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Booking ID: {booking.id}
              </Typography>
            </Box>
            <Chip
              label={booking.statusName || 'Unknown'}
              color={getStatusColor(booking.statusName)}
              size="large"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Room Details Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Room sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Room Details</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Room Name</Typography>
              <Typography variant="body1" fontWeight="medium">
                {booking.roomName || 'Not specified'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Building</Typography>
              <Typography variant="body1" fontWeight="medium">
                Not specified
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Schedule Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Schedule sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Schedule</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" mb={1}>
                <CalendarToday sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Date</Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {formatDate(booking.startTime)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" mb={1}>
                <AccessTime sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Start Time</Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {formatTime(moment.parseZone(booking.startTime).local())}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" mb={1}>
                <AccessTime sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">End Time</Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {formatTime(moment.parseZone(booking.endTime).local())}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Description Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Description sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Description</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1">
            {booking.description || 'No description provided'}
          </Typography>
        </CardContent>
      </Card>

      {/* Requester Information Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Person sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Requested By</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Name</Typography>
              <Typography variant="body1" fontWeight="medium">
                {booking.requestedByName || 'Not specified'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Request Date</Typography>
              <Typography variant="body1" fontWeight="medium">
                {formatDateTime(booking.createdDate)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* HR Action Details Card */}
      {(booking.approvedByName || booking.rejectionReason || booking.cancelledByName) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Business sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">HR Action Details</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {booking.approvedByName && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Approved By</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {booking.approvedByName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Approved Date</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDateTime(booking.approvedDate)}
                    </Typography>
                  </Grid>
                </>
              )}
              {booking.rejectionReason && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Rejection Reason</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {booking.rejectionReason}
                  </Typography>
                </Grid>
              )}
              {booking.cancelledByName && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Cancelled By</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {booking.cancelledByName}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {isPending && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              HR Actions
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<CheckCircle />}
                onClick={() => setApproveDialogOpen(true)}
                disabled={actionLoading}
                sx={{ minWidth: 150 }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<Cancel />}
                onClick={() => setRejectDialogOpen(true)}
                disabled={actionLoading}
                sx={{ minWidth: 150 }}
              >
                Reject
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
        <DialogTitle>Approve Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to approve this booking request?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Booking</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Please provide a reason for rejecting this booking request:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRejectDialogOpen(false);
            setRejectionReason('');
          }}>Cancel</Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={actionLoading || !rejectionReason.trim()}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Reject'}
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
  );
};

export default RoomBookingDetailsHR;