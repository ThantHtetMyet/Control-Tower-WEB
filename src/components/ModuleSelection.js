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

  // Smart icon mapping based on application name keywords
  const getIconForApplication = (applicationName) => {
    const name = applicationName.toLowerCase();
    
    // Define keyword-based icon mapping with glass effect and colored center
    if (name.includes('user') || name.includes('staff') || name.includes('hr')) {
      return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <People sx={{ fontSize: 48, color: 'rgb(255, 255, 255)' }} />
        
        </Box>
      );
    }
    if (name.includes('service') || name.includes('report') || name.includes('ticket')) {
      return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Assignment sx={{ fontSize: 48, color: 'rgb(255, 255, 255)' }} />
          
        </Box>
      );
    }
    // Add news portal system icon mapping
    if (name.includes('news') || name.includes('portal') || name.includes('article') || name.includes('media')) {
      return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Article sx={{ fontSize: 48, color: 'rgb(255, 255, 255)' }} />
          
        </Box>
      );
    }
    // Add room booking system icon mapping
    if (name.includes('room') || name.includes('booking') || name.includes('reservation')) {
      return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MeetingRoom sx={{ fontSize: 48, color: 'rgb(255, 255, 255)' }} />
        </Box>
      );
    }
    if (name.includes('configuration') || name.includes('config') || name.includes('setting')) {
      return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.1)' }} />
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
          <EventNote sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.1)' }} />
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
          <Dashboard sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.1)' }} />
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
          <Assessment sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.1)' }} />
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
          <Security sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.1)' }} />
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
          <Business sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.1)' }} />
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
        <Apps sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.1)' }} />
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
  }, [user?.id]);

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
      background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.9) 0%, rgba(31, 41, 55, 0.95) 50%, rgba(17, 24, 39, 0.9) 100%)',
      py: 4,
      position: 'relative'
    }}>
      {/* Logout Button - Top Right */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        right: 20, 
        zIndex: 10 
      }}>
        <Tooltip title="Logout" placement="left">
          <IconButton
            onClick={handleLogout}
            sx={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.25)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <Logout />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Date/Time Display - Top Left */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        zIndex: 10 
      }}>
        <Paper
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            px: 3,
            py: 1.5
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'white',
              fontWeight: 500,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap'
            }}
          >
            {formatDateTime(currentDateTime)}
          </Typography>
        </Paper>
      </Box>

      {/* Search Box - Top Center */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10 
      }}>
        <TextField
          placeholder="Search applications..."
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          sx={{
            width: 350,
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 3,
              color: 'white',
              fontSize: '0.9rem',
              height: '40px',
              '& fieldset': {
                border: 'none'
              },
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.4)'
              },
              '&.Mui-focused': {
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
              }
            },
            '& .MuiInputBase-input': {
              color: 'white',
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
                opacity: 1
              }
            },
            '& .MuiInputAdornment-root': {
              color: 'rgba(255, 255, 255, 0.8)'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.2rem' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  onClick={clearSearch}
                  size="small"
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      color: 'white',
                      background: 'rgba(255, 255, 255, 0.1)'
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

      {/* Main Content - Centered */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        pt: 1, // Add top padding to account for search box
        pb: 1
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Glass Container for Applications */}
          <Paper
            elevation={0}
            sx={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 6,
              p: 6,
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Error Alert */}
            {error && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 4,
                  background: 'rgba(255, 193, 7, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  color: 'white',
                  '& .MuiAlert-icon': {
                    color: '#ffc107'
                  }
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
                    color: 'white',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
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
                        color: 'rgba(255, 255, 255, 0.8)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        mb: 2
                      }}
                    >
                      No applications found
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.6)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
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
                        color: 'rgba(255, 255, 255, 0.8)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        mb: 2
                      }}
                    >
                      No Applications Available
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.6)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
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
                                  ? 'rgba(255, 255, 255, 0.15)'
                                  : 'rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(25px)',
                                WebkitBackdropFilter: 'blur(25px)',
                                border: hoveredModule === module.id 
                                  ? '2px solid rgba(255, 255, 255, 0.3)'
                                  : '1px solid rgba(255, 255, 255, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: hoveredModule === module.id 
                                  ? '0 16px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.4)'
                                  : '0 8px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.25)',
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
                                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)',
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
              color: 'rgba(255, 255, 255, 0.7)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              © 2024 Willowglen Systems. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ModuleSelection;


