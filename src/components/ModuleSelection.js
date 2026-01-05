import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  ButtonBase,
  Tooltip,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import { styled, keyframes } from '@mui/system';
import {
  Assignment,
  Settings,
  People,
  Logout,
  EventNote,
  Apps,
  Business,
  Dashboard,
  Assessment,
  Security,
  Search,
  Clear,
  Article, // Add this import for news icon
  MeetingRoom // Add this import for room booking icon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// Change this line
import { useAuth } from './contexts/AuthContext';
import applicationService from './api-services/applicationService';
import employeeApplicationAccessService from './api-services/employeeApplicationAccessService';

// Liquid Glass Toggle Styles
const ToggleContainer = styled(Box)({
  position: 'fixed',
  bottom: '30px',
  left: '30px',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px) saturate(180%)',
  borderRadius: '50px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
  }
});

const ToggleSwitch = styled(Box)(({ isActive }) => ({
  position: 'relative',
  width: '60px',
  height: '30px',
  background: isActive 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
  borderRadius: '15px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backdropFilter: 'blur(10px)',
  boxShadow: isActive 
    ? '0 4px 20px rgba(52, 199, 89, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
    : '0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: isActive 
      ? '0 6px 25px rgba(52, 199, 89, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
      : '0 6px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
  }
}));

const ToggleKnob = styled(Box)(({ isActive }) => ({
  position: 'absolute',
  top: '3px',
  left: isActive ? '33px' : '3px',
  width: '24px',
  height: '24px',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
  borderRadius: '50%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
}));

const ToggleLabel = styled(Typography)({
  fontSize: '0.9rem',
  fontWeight: '500',
  color: 'rgba(255, 255, 255, 0.9)',
  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  userSelect: 'none',
});

const ModuleSelection = () => {
  const navigate = useNavigate();
  const { user, logout, hasHRAccess } = useAuth();
  const [hoveredModule, setHoveredModule] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [accessibleModules, setAccessibleModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredModules, setFilteredModules] = useState([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true); // New state for theme toggle

  // Smart icon mapping based on application name keywords
  const getIconForApplication = (applicationName) => {
    const name = applicationName.toLowerCase();
    const iconColor = isDarkTheme ? 'rgb(255, 255, 255)' : 'rgba(0, 0, 0, 0.7)';
    
    // Define keyword-based icon mapping with glass effect and colored center
    if (name.includes('user') || name.includes('staff') || name.includes('hr')) {
      return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <People sx={{ fontSize: 48, color: iconColor }} />
        
        </Box>
      );
    }
    if (name.includes('service') || name.includes('report') || name.includes('ticket')) {
      return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Assignment sx={{ fontSize: 48, color: iconColor }} />
          
        </Box>
      );
    }
    // Add news portal system icon mapping
    if (name.includes('news') || name.includes('portal') || name.includes('article') || name.includes('media')) {
      return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Article sx={{ fontSize: 48, color: iconColor }} />
          
        </Box>
      );
    }
    // Add room booking system icon mapping
    if (name.includes('room') || name.includes('booking') || name.includes('reservation')) {
      return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MeetingRoom sx={{ fontSize: 48, color: iconColor }} />
        </Box>
      );
    }
    if (name.includes('configuration') || name.includes('config') || name.includes('setting')) {
      return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings sx={{ fontSize: 48, color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }} />
          <Settings sx={{ 
            fontSize: 20, 
            color: '#FF9500', 
            position: 'absolute',
            filter: 'drop-shadow(0 2px 8px rgba(255, 149, 0, 0.4))'
          }} />
        </Box>
      );
    }
    if (name.includes('leave') || name.includes('vacation') || name.includes('time off')) {
      return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EventNote sx={{ fontSize: 48, color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }} />
          <EventNote sx={{ 
            fontSize: 20, 
            color: '#FF3B30', 
            position: 'absolute',
            filter: 'drop-shadow(0 2px 8px rgba(255, 59, 48, 0.4))'
          }} />
        </Box>
      );
    }
    if (name.includes('dashboard') || name.includes('overview')) {
      return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Dashboard sx={{ fontSize: 48, color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }} />
          <Dashboard sx={{ 
            fontSize: 20, 
            color: '#5856D6', 
            position: 'absolute',
            filter: 'drop-shadow(0 2px 8px rgba(88, 86, 214, 0.4))'
          }} />
        </Box>
      );
    }
    if (name.includes('assessment') || name.includes('evaluation') || name.includes('performance')) {
      return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Assessment sx={{ fontSize: 48, color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }} />
          <Assessment sx={{ 
            fontSize: 20, 
            color: '#FF2D92', 
            position: 'absolute',
            filter: 'drop-shadow(0 2px 8px rgba(55, 65, 81, 0.4))'
          }} />
        </Box>
      );
    }
    if (name.includes('security') || name.includes('access') || name.includes('permission')) {
      return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Security sx={{ fontSize: 48, color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }} />
          <Security sx={{ 
            fontSize: 20, 
            color: '#00C7BE', 
            position: 'absolute',
            filter: 'drop-shadow(0 2px 8px rgba(0, 199, 190, 0.4))'
          }} />
        </Box>
      );
    }
    if (name.includes('business') || name.includes('company') || name.includes('organization')) {
      return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Business sx={{ fontSize: 48, color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }} />
          <Business sx={{ 
            fontSize: 20, 
            color: '#FFD60A', 
            position: 'absolute',
            filter: 'drop-shadow(0 2px 8px rgba(255, 214, 10, 0.4))'
          }} />
        </Box>
      );
    }
    
    // Default fallback icon
    return (
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Apps sx={{ fontSize: 48, color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }} />
        <Apps sx={{ 
          fontSize: 20, 
          color: '#8E8E93', 
          position: 'absolute',
          filter: 'drop-shadow(0 2px 8px rgba(142, 142, 147, 0.4))'
        }} />
      </Box>
    );
  };

  // Smart color mapping based on application type
  const getColorForApplication = (applicationName, index) => {
    const name = applicationName.toLowerCase();
    
    // Define semantic color mapping
    if (name.includes('user') || name.includes('staff') || name.includes('hr')) {
      return '#34C759'; // Green for people-related
    }
    if (name.includes('service') || name.includes('report') || name.includes('ticket')) {
      return '#007AFF'; // Blue for service/reports
    }
    if (name.includes('configuration') || name.includes('config') || name.includes('setting')) {
      return '#FF9500'; // Orange for configuration
    }
    if (name.includes('leave') || name.includes('vacation') || name.includes('time off')) {
      return '#FF3B30'; // Red for leave management
    }
    if (name.includes('dashboard') || name.includes('overview')) {
      return '#5856D6'; // Purple for dashboards
    }
    if (name.includes('assessment') || name.includes('evaluation') || name.includes('performance')) {
      return '#FF2D92'; // Pink for assessments
    }
    if (name.includes('security') || name.includes('access') || name.includes('permission')) {
      return '#00C7BE'; // Teal for security
    }
    if (name.includes('room') || name.includes('booking') || name.includes('reservation')) {
      return '#3f51b5'; // Purple-blue for room booking
    }
    // Fallback to cycling colors for unknown types
    const fallbackColors = ['#FFD60A', '#8E8E93', '#AF52DE', '#32D74B'];
    return fallbackColors[index % fallbackColors.length];
  };

  // Dynamic module configuration
  const getModuleConfig = (applicationName, index) => {
    // Generate route based on application name
    const generateRoute = (name) => {
      return '/' + name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    };

    // Generate ID based on application name
    const generateId = (name) => {
      return name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    };

    return {
      id: generateId(applicationName),
      icon: getIconForApplication(applicationName),
      backgroundColor: getColorForApplication(applicationName, index),
      route: generateRoute(applicationName)
    };
  };

  // Update date/time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch applications and user access
  useEffect(() => {
    const fetchAccessibleApplications = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Step 1: Fetch all available applications from the API
        const allApplications = await applicationService.getApplications();
        
        // Step 2: Fetch user's application accesses
        const userApplicationAccesses = await employeeApplicationAccessService.getEmployeeApplicationAccessesByEmployee(user.id);
        
        // Step 3: Filter applications based on user access
        const accessibleApplicationIds = userApplicationAccesses
          .filter(access => !access.isRevoked) // Only include non-revoked access
          .map(access => access.applicationID);
        
        // Step 4: Get applications that user has access to
        const userAccessibleApplications = allApplications.filter(app => 
          accessibleApplicationIds.includes(app.id)
        );
        
        // Step 5: Create modules with smart icon/color mapping and API endpoints
        const mappedModules = userAccessibleApplications
          .map((app, index) => {
            const config = getModuleConfig(app.applicationName, index);
            return {
              ...config,
              title: app.applicationName,
              description: app.description,
              applicationId: app.id,
              apiEndpoint: app.apiEndpoint, // Add API endpoint
              onClick: () => handleModuleClick(app)
            };
          });
        
        setAccessibleModules(mappedModules);
      } catch (err) {
        console.error('Error fetching accessible applications:', err);
        setError('Failed to load accessible applications. Please try again.');
        setAccessibleModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessibleApplications();
  }, [user?.id, isDarkTheme]); // Add isDarkTheme as dependency

  const handleModuleClick = (module) => {
    
    // Navigate to internal routes and pass the API endpoint as state
    if (module.apiEndpoint) {
      navigate(`/${module.id}`, {
        state: {
          apiEndpoint: module.apiEndpoint,
          applicationName: module.title,
          applicationId: module.applicationId
        }
      });
    } else {
    if (module.id === 'report-management-system') {
      navigate('/report-management-system');
    } else if (module.id === 'user-management-system') {
      navigate('/employee-management-system');
    } else if (module.id === 'news-portal-system') {
      navigate('/news-portal-system');
    } else if (module.id === 'room-booking-system') {
      // Route HR users to buildings page and non-HR users to bookings page
      if (hasHRAccess()) {
        navigate('/room-booking-system/calendar');
      } else {
        navigate('/room-booking-system/calendar');
      }
    } else {
      alert(`${module.title} is coming soon!`);
    }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  // Add these missing functions
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Toggle between dark and light theme
  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Filter modules based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredModules(accessibleModules);
    } else {
      const filtered = accessibleModules.filter(module =>
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredModules(filtered);
    }
  }, [searchQuery, accessibleModules]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: isDarkTheme 
        ? 'linear-gradient(135deg, rgba(55, 65, 81, 0.9) 0%, rgba(31, 41, 55, 0.95) 50%, rgba(17, 24, 39, 0.9) 100%)'
        : 'linear-gradient(135deg, rgba(240, 245, 250, 1) 0%, rgba(220, 235, 245, 1) 50%, rgba(200, 220, 240, 1) 100%)',
      py: 4,
      position: 'relative',
      transition: 'background 0.5s ease'
    }}>
      {/* Responsive Header Container */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        left: 20,
        right: 20,
        zIndex: 10,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2
      }}>
        {/* Date/Time Display */}
        <Box sx={{ 
          order: { xs: 2, sm: 1 },
          flex: { xs: 'none', sm: '1' },
          display: 'flex',
          justifyContent: { xs: 'stretch', sm: 'flex-start' }
        }}>
          <Paper
            elevation={0}
            sx={{
              background: isDarkTheme 
                ? 'rgba(255, 255, 255, 0.15)'
                : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.5)'}`,
              borderRadius: 3,
              px: 3,
              py: 1.5,
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: '200px' },
              transition: 'all 0.3s ease'
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: isDarkTheme ? 'white' : 'rgba(0, 0, 0, 0.8)',
                fontWeight: 500,
                textShadow: isDarkTheme ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                whiteSpace: 'nowrap'
              }}
            >
              {formatDateTime(currentDateTime)}
            </Typography>
          </Paper>
        </Box>

        {/* Search Box - Center */}
        <Box sx={{ 
          order: { xs: 3, sm: 2 },
          flex: { xs: 'none', sm: '1' },
          display: 'flex',
          justifyContent: 'center',
          mx: { xs: 0, sm: 2 }
        }}>
          <TextField
            placeholder="Search applications..."
            value={searchQuery}
            onChange={handleSearchChange}
            variant="outlined"
            sx={{
              width: { xs: '100%', sm: '100%' },
              maxWidth: { xs: '100%', sm: '400px' },
              '& .MuiOutlinedInput-root': {
                background: isDarkTheme 
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: 3,
                color: isDarkTheme ? 'white' : 'rgba(0, 0, 0, 0.8)',
                fontSize: '0.9rem',
                height: '40px',
                transition: 'all 0.3s ease',
                '& fieldset': {
                  border: 'none'
                },
                '&:hover': {
                  background: isDarkTheme 
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(255, 255, 255, 0.85)',
                  border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)'}`
                },
                '&.Mui-focused': {
                  background: isDarkTheme 
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(255, 255, 255, 0.9)',
                  border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'}`,
                  boxShadow: isDarkTheme 
                    ? '0 0 20px rgba(255, 255, 255, 0.2)'
                    : '0 0 20px rgba(0, 0, 0, 0.1)'
                }
              },
              '& .MuiInputBase-input': {
                color: isDarkTheme ? 'white' : 'rgba(0, 0, 0, 0.8)',
                '&::placeholder': {
                  color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)',
                  opacity: 1
                }
              },
              '& .MuiInputAdornment-root': {
                color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ 
                    color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)', 
                    fontSize: '1.2rem' 
                  }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={clearSearch}
                    size="small"
                    sx={{ 
                      color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
                      '&:hover': {
                        color: isDarkTheme ? 'white' : 'rgba(0, 0, 0, 0.8)',
                        background: isDarkTheme 
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.05)'
                      }
                    }}
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Logout Button */}
        <Box sx={{ 
          order: { xs: 1, sm: 3 },
          flex: { xs: 'none', sm: '1' },
          display: 'flex',
          justifyContent: { xs: 'flex-end', sm: 'flex-end' }
        }}>
          <Tooltip title="Logout" placement="left">
            <IconButton
              onClick={handleLogout}
              sx={{
                background: isDarkTheme 
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.5)'}`,
                color: isDarkTheme ? 'white' : 'rgba(0, 0, 0, 0.7)',
                width: '40px',
                height: '40px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: isDarkTheme 
                    ? 'rgba(255, 255, 255, 0.25)'
                    : 'rgba(255, 255, 255, 0.85)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Logout />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Content - Centered with responsive padding */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        pt: { xs: 20, sm: 12 }, // Increased top padding for mobile to account for stacked header
        pb: 1,
        px: { xs: 2, sm: 4 }
      }}>

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Glass Container for Applications */}
          <Paper
            elevation={0}
            sx={{
              background: isDarkTheme 
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.5)'}`,
              borderRadius: 6,
              p: 6,
              boxShadow: isDarkTheme 
                ? '0 12px 40px rgba(0, 0, 0, 0.15)'
                : '0 12px 40px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Error Alert */}
            {error && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 4,
                  background: isDarkTheme 
                    ? 'rgba(255, 193, 7, 0.1)'
                    : 'rgba(255, 193, 7, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${isDarkTheme ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 193, 7, 0.5)'}`,
                  color: isDarkTheme ? 'white' : 'rgba(0, 0, 0, 0.8)',
                  '& .MuiAlert-icon': {
                    color: '#ffc107'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {error}
              </Alert>
            )}

            {/* Loading State */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress 
                  sx={{ 
                    color: isDarkTheme ? 'white' : 'rgba(0, 0, 0, 0.6)',
                    filter: isDarkTheme 
                      ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                      : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    transition: 'all 0.3s ease'
                  }} 
                />
              </Box>
            ) : (
              <>
                {/* No Results Message */}
                {filteredModules.length === 0 && searchQuery ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: isDarkTheme 
                          ? 'rgba(255, 255, 255, 0.8)'
                          : 'rgba(0, 0, 0, 0.7)',
                        textShadow: isDarkTheme 
                          ? '0 1px 2px rgba(0,0,0,0.3)'
                          : 'none',
                        mb: 2,
                        transition: 'color 0.3s ease'
                      }}
                    >
                      No applications found
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: isDarkTheme 
                          ? 'rgba(255, 255, 255, 0.6)'
                          : 'rgba(0, 0, 0, 0.5)',
                        textShadow: isDarkTheme 
                          ? '0 1px 2px rgba(0,0,0,0.3)'
                          : 'none',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      Try searching with different keywords
                    </Typography>
                  </Box>
                ) : filteredModules.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: isDarkTheme 
                          ? 'rgba(255, 255, 255, 0.8)'
                          : 'rgba(0, 0, 0, 0.7)',
                        textShadow: isDarkTheme 
                          ? '0 1px 2px rgba(0,0,0,0.3)'
                          : 'none',
                        mb: 2,
                        transition: 'color 0.3s ease'
                      }}
                    >
                      No Applications Available
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: isDarkTheme 
                          ? 'rgba(255, 255, 255, 0.6)'
                          : 'rgba(0, 0, 0, 0.5)',
                        textShadow: isDarkTheme 
                          ? '0 1px 2px rgba(0,0,0,0.3)'
                          : 'none',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      Please contact your administrator to request access to applications.
                    </Typography>
                  </Box>
                ) : (
                  /* Module Grid */
                  <Grid container spacing={6} justifyContent="center">
                    {filteredModules.map((module) => (
                      <Grid item key={module.id}>
                        <Tooltip 
                          title={`${module.title}`} 
                          placement="bottom"
                          arrow
                          sx={{
                            '& .MuiTooltip-tooltip': {
                              backgroundColor: 'rgba(0, 0, 0, 0.85)',
                              backdropFilter: 'blur(10px)',
                              fontSize: '0.9rem',
                              borderRadius: 2,
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              maxWidth: 300
                            },
                            '& .MuiTooltip-arrow': {
                              color: 'rgba(0, 0, 0, 0.85)'
                            }
                          }}
                        >
                          <ButtonBase
                            onClick={() => handleModuleClick(module)}
                            onMouseEnter={() => setHoveredModule(module.id)}
                            onMouseLeave={() => setHoveredModule(null)}
                            sx={{
                              borderRadius: 4,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                transform: 'translateY(-4px) scale(1.05)'
                              }
                            }}
                          >
                            {/* Colored Icon Container */}
                            <Box
                              sx={{
                                width: 100,
                                height: 100,
                                borderRadius: 4,
                                background: hoveredModule === module.id 
                                  ? (isDarkTheme 
                                      ? 'rgba(255, 255, 255, 0.15)'
                                      : 'rgba(255, 255, 255, 0.8)')
                                  : (isDarkTheme 
                                      ? 'rgba(255, 255, 255, 0.08)'
                                      : 'rgba(255, 255, 255, 0.5)'),
                                backdropFilter: 'blur(25px)',
                                WebkitBackdropFilter: 'blur(25px)',
                                border: hoveredModule === module.id 
                                  ? (isDarkTheme 
                                      ? '2px solid rgba(255, 255, 255, 0.3)'
                                      : '2px solid rgba(0, 0, 0, 0.1)')
                                  : (isDarkTheme 
                                      ? '1px solid rgba(255, 255, 255, 0.15)'
                                      : '1px solid rgba(0, 0, 0, 0.05)'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: hoveredModule === module.id 
                                  ? (isDarkTheme 
                                      ? '0 16px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.4)'
                                      : '0 16px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)')
                                  : (isDarkTheme 
                                      ? '0 8px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.25)'
                                      : '0 8px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)'),
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  borderRadius: 4,
                                  background: isDarkTheme 
                                    ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)'
                                    : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.2) 100%)',
                                  opacity: hoveredModule === module.id ? 1 : 0.8,
                                  transition: 'opacity 0.3s ease'
                                },
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  width: '60%',
                                  height: '60%',
                                  transform: 'translate(-50%, -50%)',
                                  borderRadius: '50%',
                                  background: hoveredModule === module.id 
                                    ? `radial-gradient(circle, ${module.backgroundColor}20 0%, transparent 70%)`
                                    : `radial-gradient(circle, ${module.backgroundColor}10 0%, transparent 70%)`,
                                  transition: 'all 0.3s ease'
                                }
                              }}
                            >
                              <Box sx={{
                                zIndex: 2,
                                position: 'relative',
                                transform: hoveredModule === module.id ? 'scale(1.1)' : 'scale(1)',
                                transition: 'transform 0.3s ease'
                              }}>
                                {module.icon}
                              </Box>
                            </Box>
                          </ButtonBase>
                        </Tooltip>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </Paper>

          {/* Footer */}
          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ 
              color: isDarkTheme 
                ? 'rgba(255, 255, 255, 0.7)'
                : 'rgba(0, 0, 0, 0.5)',
              textShadow: isDarkTheme 
                ? '0 1px 2px rgba(0,0,0,0.3)'
                : 'none',
              transition: 'color 0.3s ease'
            }}>
              © 2024 Willowglen Systems. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Theme Toggle UI */}
      <Tooltip
        title="Switch between dark and light theme"
        placement="right"
        arrow
      >
        <ToggleContainer onClick={handleThemeToggle}>
          <ToggleLabel>
            {isDarkTheme ? 'Dark' : 'Light'}
          </ToggleLabel>
          <ToggleSwitch isActive={isDarkTheme}>
            <ToggleKnob isActive={isDarkTheme} />
          </ToggleSwitch>
        </ToggleContainer>
      </Tooltip>
    </Box>
  );
};

export default ModuleSelection;


