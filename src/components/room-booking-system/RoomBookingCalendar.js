import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Modal,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Close
} from '@mui/icons-material';
// Add fetchRooms import back
import { fetchRooms } from '../api-services/roomService';
import { fetchCalendarBookings } from '../api-services/roombookingService';

const RoomBookingCalendar = () => {
  // Add rooms state back
  const [rooms, setRooms] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  //const [bookings, setBookings] = useState([]);
  //const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDateBookings, setSelectedDateBookings] = useState([]);
  const [loadingDate, setLoadingDate] = useState(null);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState(''); // Keep as empty string for "All Rooms"
  const [allDateBookings, setAllDateBookings] = useState([]);

  // Add useEffect to load rooms on component mount
  useEffect(() => {
    loadRooms();
  }, []);

  // Add loadRooms function back
  const loadRooms = async () => {
    try {
      const roomData = await fetchRooms();
      setRooms(roomData);
    } catch (error) {
      console.error('Error loading rooms:', error);
      setError('Failed to load rooms');
    }
  };
  
  const handleDateClick = async (date) => {
    setSelectedDate(date);
    setModalOpen(true);
    setSelectedDateBookings([]);
    setSelectedRoomFilter(''); // Reset to "All Rooms" when opening modal
    
    // Load bookings for the selected date
    const dayBookings = await loadDateBookings(date);
    setAllDateBookings(dayBookings); // Store all bookings
    setSelectedDateBookings(dayBookings); // Show all bookings initially
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
    setSelectedDateBookings([]);
    setAllDateBookings([]);
    setSelectedRoomFilter('');
  };

  // New function to handle room filter change
  // Update handleRoomFilterChange to filter bookings by selected room
  const handleRoomFilterChange = (event) => {
    const roomId = event.target.value;
    setSelectedRoomFilter(roomId);
    
    if (roomId === 'all') {
      // Show all bookings when "All Rooms" is selected
      setSelectedDateBookings(allDateBookings);
    } else {
      // Filter bookings by selected room ID - handle both string and number comparisons
      const filteredBookings = allDateBookings.filter(booking => {
        if (!booking.roomID) return false;
        return booking.roomID.toString() === roomId.toString() || booking.roomID === roomId;
      });
      setSelectedDateBookings(filteredBookings);
    }
  };

  // Get unique rooms from the current date's bookings
  // Update getAvailableRooms to use actual room data from API
  const getAvailableRooms = () => {
    if (!rooms || rooms.length === 0) return [];
    
    return rooms
      .filter(room => room && room.id && room.name)
      .map(room => ({ id: room.id, name: room.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getMonthName = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    //const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const hasBookings = (date) => {
   // Since we're not pre-loading bookings, return false
    // You could implement a cache here if needed
    return false;
  };

  
  const loadDateBookings = async (date) => {
    setLoadingDate(date);
    try {
      // Fix: Use local date string instead of UTC
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      // Fetch bookings for the specific date only
      const bookingsData = await fetchCalendarBookings(
        null, // No specific room - get all rooms
        dateStr, // Start date is the selected date
        dateStr  // End date is also the selected date
      );
      
      // The backend already returns the correct structure, no need to remap
      return bookingsData;
    } catch (err) {
      setError('Failed to load bookings for selected date');
      return [];
    } finally {
      setLoadingDate(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'info';
    }
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Room Booking Calendar
        </Typography>
      </Box>

      {/* Calendar Header */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <IconButton onClick={() => navigateMonth(-1)}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            {getMonthName()}
          </Typography>
          <IconButton onClick={() => navigateMonth(1)}>
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Week Days Header */}
        <Grid container spacing={0} sx={{ mb: 1 }}>
          {weekDays.map((day, index) => (
            <Grid item xs={12/7} key={index} sx={{ textAlign: 'center', width: `${100/7}%` }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', py: 1 }}>
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Grid */}
        <Grid container spacing={0}>
          {days.map((day, index) => {
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDate = isToday(day);
            const hasBookingsForDay = hasBookings(day);
            
            return (
              <Grid item xs={12/7} key={index} sx={{ width: `${100/7}%` }}>
                <Box
                  onClick={() => handleDateClick(day)}
                  sx={{
                    aspectRatio: '1/1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    position: 'relative',
                    minHeight: '60px',
                    backgroundColor: isTodayDate ? '#3f51b5' : 'transparent',
                    color: isTodayDate ? 'primary.contrastText' : 
                           isCurrentMonthDay ? 'text.primary' : 'text.disabled',
                    '&:hover': {
                      backgroundColor: isTodayDate ? 'primary.dark' : 'action.hover'
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: isTodayDate ? 600 : 400 }}>
                    {day.getDate()}
                  </Typography>
                  {hasBookingsForDay && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: isTodayDate ? 'primary.contrastText' : 'primary.main',
                        mt: 0.5
                      }}
                    />
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Modal for Date Details */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Card sx={{ maxWidth: 600, width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Bookings for {selectedDate?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
              <IconButton onClick={handleCloseModal}>
                <Close />
              </IconButton>
            </Box>
            
            {/* Room Filter Dropdown */}
            
            {allDateBookings.length > 0 && (
                <Box sx={{ mb: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter by Room</InputLabel>
                  <Select
                    value={selectedRoomFilter}
                    label="Filter by Room"
                    onChange={handleRoomFilterChange}
                  >
                    <MenuItem value="all">
                      All Rooms ({allDateBookings.length} bookings)
                    </MenuItem>
                    {getAvailableRooms().map((room) => {
                      const roomBookingCount = allDateBookings.filter(b => b.roomID === room.id).length;
                      return (
                        <MenuItem key={room.id} value={room.id}>
                          {room.name} ({roomBookingCount} booking{roomBookingCount !== 1 ? 's' : ''})
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
            )}
            
            <Divider sx={{ mb: 2 }} />
            
            {loadingDate && selectedDate && loadingDate.getTime() === selectedDate.getTime() ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : selectedDateBookings.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                {selectedRoomFilter ? 'No bookings for this room on this date' : 'No bookings for this date'}
              </Typography>
            ) : (
              <>
                {selectedRoomFilter && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Showing {selectedDateBookings.length} booking{selectedDateBookings.length !== 1 ? 's' : ''} for {getAvailableRooms().find(r => r.id === selectedRoomFilter)?.name}
                  </Typography>
                )}
                <List>
                  {selectedDateBookings.map((booking, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <Card sx={{ width: '100%', mb: 1 }}>
                        <CardContent sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {booking.roomName}
                            </Typography>
                            <Chip 
                              label={booking.statusName} 
                              color={getStatusColor(booking.statusName)}
                              size="small"
                            />
                          </Box>
                          <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
                            {booking.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </Typography>
                          {booking.description && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {booking.description}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Requested by: {booking.requestedByName}
                          </Typography>
                          {booking.approvedByName && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Approved by: {booking.approvedByName}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </CardContent>
        </Card>
      </Modal>
    </Box>
  );
};

export default RoomBookingCalendar;

