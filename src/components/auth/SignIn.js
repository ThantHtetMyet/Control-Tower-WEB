import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { styled, keyframes } from '@mui/system';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as loginAPI } from '../api-services/authService';
import CustomModal from '../common/CustomModal';
import backgroundImage from '../resources/willowglen_login_background_image.jpg';
import OrbitAnimation from './SignIn_Theme/OrbitAnimation';
import AppleClock from './SignIn_Theme/AppleClock';


// Loading animation keyframes
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;



// Loading overlay for form area only
const FormLoadingOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(55, 65, 81, 0.15)', // More transparent purple tint
  backdropFilter: 'blur(20px) saturate(180%)', // Enhanced blur effect
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  borderRadius: '20px', // Match Paper border radius
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: 'inset 0 0 50px rgba(55, 65, 81, 0.1)'
});

const LoadingSpinner = styled(Box)({
  position: 'relative',
  width: '60px',
  height: '60px',
  marginBottom: '16px',
  '& .outer-ring': {
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: '3px solid rgba(255, 255, 255, 0.2)', // More transparent
    borderTop: '3px solid rgba(255, 255, 255, 0.8)', // Brighter top
    borderRadius: '50%',
    animation: `${spinAnimation} 1s linear infinite`,
    filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))'
  },
  '& .inner-ring': {
    position: 'absolute',
    top: '8px',
    left: '8px',
    width: 'calc(100% - 16px)',
    height: 'calc(100% - 16px)',
    border: '2px solid rgba(55, 65, 81, 0.3)',
    borderBottom: '2px solid rgba(55, 65, 81, 0.8)',
    borderRadius: '50%',
    animation: `${spinAnimation} 0.8s linear infinite reverse`,
    filter: 'drop-shadow(0 0 8px rgba(55, 65, 81, 0.4))'
  },
  '& .center-dot': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '8px',
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
    boxShadow: '0 0 15px rgba(255, 255, 255, 0.6)'
  }
});

const LoadingText = styled(Typography)({
  color: 'rgba(255, 255, 255, 0.9)', // White text instead of purple
  fontSize: '16px',
  fontWeight: 500,
  textAlign: 'center',
  animation: `${pulseAnimation} 2s ease-in-out infinite`,
  marginBottom: '8px',
  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
});

const LoadingDots = styled(Box)({
  display: 'flex',
  gap: '6px',
  '& .dot': {
    width: '6px',
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
    animation: `${pulseAnimation} 1s ease-in-out infinite`,
    boxShadow: '0 0 8px rgba(255, 255, 255, 0.4)',
    '&:nth-of-type(1)': { animationDelay: '0s' },
    '&:nth-of-type(2)': { animationDelay: '0.2s' },
    '&:nth-of-type(3)': { animationDelay: '0.4s' }
  }
});

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
    ? '0 4px 20px rgba(0, 122, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
    : '0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: isActive 
      ? '0 6px 25px rgba(0, 122, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
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

const FormLoadingAnimation = () => (
  <FormLoadingOverlay>
    <LoadingSpinner>
      <div className="outer-ring" />
      <div className="inner-ring" />
      <div className="center-dot" />
    </LoadingSpinner>
    <LoadingText>
      Signing you in...
    </LoadingText>
    <LoadingDots>
      <div className="dot" />
      <div className="dot" />
      <div className="dot" />
    </LoadingDots>
  </FormLoadingOverlay>
);

function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAppleClock, setIsAppleClock] = useState(true); // New state for toggle - default to clock
  const [isInputFocused, setIsInputFocused] = useState(false); // Track if any input is focused
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Timer ref for the 10-second inactivity delay
  const inactivityTimerRef = useRef(null);

  // Handle any mouse movement - show sign-in form and reset timer
  const handleMouseMovement = () => {
    // Clear any existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    
    // Show sign-in form immediately on any mouse movement
    setIsHovered(true);
    
    // Set a new 10-second timer for inactivity
    inactivityTimerRef.current = setTimeout(() => {
      setIsHovered(false);
      inactivityTimerRef.current = null;
    }, 3000); // 10 seconds of inactivity
  };

  // Handle input focus and blur
  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  // Toggle between orbit animation and Apple clock
  const handleToggle = () => {
    setIsAppleClock(!isAppleClock);
  };

  // Set up global mouse movement listener
  useEffect(() => {
    // Add event listener for mouse movement on the entire document
    document.addEventListener('mousemove', handleMouseMovement);
    
    // Initialize with first timer (show orbit animation initially)
    inactivityTimerRef.current = setTimeout(() => {
      setIsHovered(false);
      inactivityTimerRef.current = null;
    }, 3000);

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMovement);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await loginAPI(formData);
      console.log('Login response:', response.data);
      login(response.data);
      const from = location.state?.from?.pathname || '/modules';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Invalid email or password');
      setOpenErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: { xs: 1, sm: 2, md: 3 },
        boxSizing: 'border-box',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(55, 65, 81, 0.2) 100%)',
          zIndex: 1
        }
      }}
    >
      <Container 
        component="main" 
        maxWidth={false}
        sx={{ 
          position: 'relative', 
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          maxWidth: '100vw',
          padding: 0,
        }}
      >
        <Paper 
          elevation={24}
          sx={{ 
            width: '100%',
            maxWidth: { xs: '300px', md: '500px', lg: '550px' },
            height: { xs: 'auto', md: '600px' },
            marginLeft: 'auto',
            marginRight: 0,
            overflow: 'hidden',
            backgroundColor: 'rgba(55, 65, 81, 0.15)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            boxShadow: {
              xs: '0 8px 32px rgba(0, 0, 0, 0.3)',
              sm: '0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(55, 65, 81, 0.2)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            '&:hover': {
              backgroundColor: 'rgba(55, 65, 81, 0.25)',
              transform: 'translateY(-2px)',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.5), 0 10px 40px rgba(55, 65, 81, 0.3)'
            }
          }}
        >
          {/* Left Container - Solar System Animation (Default View) */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: isHovered ? 0 : 1,
              visibility: isHovered ? 'hidden' : 'visible',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 1,
              display: { xs: 'none', md: 'block' },
            }}
          >
              {/* Left content - Orbit Animation or Apple Clock */}
              <Box
                sx={{
                  height: '100%',
                  background: 'transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '20px',
                }}
              >
                {!isLoading && !isInputFocused && (isAppleClock ? <AppleClock /> : <OrbitAnimation />)}
              </Box>
            </Box>

          {/* Mobile View - Always show sign-in form */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 2,
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column'
            }}
          >
            {/* Mobile - Login Container */}
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                flex: '1 0 0',
                minWidth: 0,
                width: '100%'
              }}
            >
              {/* Form Section with Enhanced Styling */}
              <Box sx={{ 
                padding: { xs: 3, sm: 4 }, 
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.02)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
              <Typography
                component="h2"
                variant="h4"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.95)',
                  marginBottom: 4, 
                  textAlign: 'center',
                  fontWeight: 300,
                  fontSize: { xs: '1.8rem', sm: '2rem' },
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                Sign In
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                 <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email-mobile"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange('email')}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  disabled={isLoading}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: formData.email ? 'rgba(55, 65, 81, 0.25)' : 'rgba(55, 65, 81, 0.08)',
                      backdropFilter: 'blur(15px) saturate(150%)',
                      borderRadius: '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: formData.email ? '1px solid rgba(55, 65, 81, 0.4)' : '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: formData.email ? '0 4px 20px rgba(55, 65, 81, 0.3)' : 'none',
                      '& fieldset': {
                        borderColor: formData.email ? 'rgba(55, 65, 81, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                        borderWidth: '1px'
                      },
                      '&:hover': {
                        backgroundColor: formData.email ? 'rgba(55, 65, 81, 0.35)' : 'rgba(55, 65, 81, 0.15)',
                        transform: 'translateY(-1px)',
                        boxShadow: formData.email ? '0 6px 25px rgba(55, 65, 81, 0.4)' : '0 4px 15px rgba(55, 65, 81, 0.2)'
                      },
                      '&:hover fieldset': {
                        borderColor: formData.email ? 'rgba(55, 65, 81, 0.7)' : 'rgba(255, 255, 255, 0.4)'
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(55, 65, 81, 0.4)',
                        boxShadow: '0 8px 30px rgba(55, 65, 81, 0.5), 0 0 0 3px rgba(55, 65, 81, 0.2)'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(55, 65, 81, 0.8)',
                        borderWidth: '2px'
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'rgba(255, 255, 255, 0.95)',
                      fontWeight: 500,
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.4)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: formData.email ? 'rgba(55, 65, 81, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                      fontWeight: formData.email ? 500 : 400,
                      transition: 'all 0.3s ease'
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'rgba(255, 255, 255, 0.95)'
                    },
                  }}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password-mobile"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    disabled={isLoading}
                    sx={{
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: formData.password ? 'rgba(55, 65, 81, 0.25)' : 'rgba(55, 65, 81, 0.08)',
                        backdropFilter: 'blur(15px) saturate(150%)',
                        borderRadius: '12px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: formData.password ? '1px solid rgba(55, 65, 81, 0.4)' : '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: formData.password ? '0 4px 20px rgba(55, 65, 81, 0.3)' : 'none',
                        '& fieldset': {
                          borderColor: formData.password ? 'rgba(55, 65, 81, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                          borderWidth: '1px'
                        },
                        '&:hover': {
                          backgroundColor: formData.password ? 'rgba(55, 65, 81, 0.35)' : 'rgba(55, 65, 81, 0.15)',
                          transform: 'translateY(-1px)',
                          boxShadow: formData.password ? '0 6px 25px rgba(55, 65, 81, 0.4)' : '0 4px 15px rgba(55, 65, 81, 0.2)'
                        },
                        '&:hover fieldset': {
                          borderColor: formData.password ? 'rgba(55, 65, 81, 0.7)' : 'rgba(255, 255, 255, 0.4)'
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(55, 65, 81, 0.4)',
                          boxShadow: '0 8px 30px rgba(55, 65, 81, 0.5), 0 0 0 3px rgba(55, 65, 81, 0.2)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'rgba(55, 65, 81, 0.8)',
                          borderWidth: '2px'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: formData.password ? 'rgba(55, 65, 81, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                        fontWeight: formData.password ? 500 : 400,
                        transition: 'all 0.3s ease'
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: 'rgba(255, 255, 255, 0.95)'
                      },
                      '& .MuiOutlinedInput-input': {
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontWeight: 500
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={isLoading}
                            sx={{ 
                              color: formData.password ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.7)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: 'rgba(55, 65, 81, 1)',
                                backgroundColor: 'rgba(55, 65, 81, 0.1)'
                              }
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    mt: 2,
                    mb: 3,
                    py: 1.8,
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: isLoading 
                    ? 'linear-gradient(135deg, rgba(200, 200, 200, 0.3) 0%, rgba(150, 150, 150, 0.3) 100%)' 
                    : 'linear-gradient(135deg, rgba(55, 65, 81, 0.9) 0%, rgba(31, 41, 55, 0.95) 50%, rgba(17, 24, 39, 0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: isLoading 
                      ? 'none'
                      : '0 8px 25px rgba(55, 65, 81, 0.4), 0 4px 12px rgba(55, 65, 81, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    '&:hover': {
                    background: isLoading 
                      ? 'linear-gradient(135deg, rgba(200, 200, 200, 0.3) 0%, rgba(150, 150, 150, 0.3) 100%)'
                      : 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(55, 65, 81, 0.9) 50%, rgba(31, 41, 55, 0.95) 100%)',
                    transform: isLoading ? 'none' : 'translateY(-2px)',
                      boxShadow: isLoading 
                        ? 'none'
                        : '0 12px 35px rgba(55, 65, 81, 0.35), 0 6px 15px rgba(55, 65, 81, 0.15)'
                    },
                    '&:active': {
                      transform: isLoading ? 'none' : 'translateY(0px)'
                    }
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={22} sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                      <span>Signing In...</span>
                    </Box>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Box>
              
                {/* Enhanced Loading Overlay */}
                {isLoading && <FormLoadingAnimation />}
              </Box>
            </Box>
          </Box>

          {/* Right Container - Sign In Form (Hover View) */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: isHovered ? 1 : 0,
              visibility: isHovered ? 'visible' : 'hidden',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 2,
              display: { xs: 'flex', md: 'flex' },
              flexDirection: 'column'
            }}
          >
            {/* Mobile and Desktop - Login Container */}
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                flex: '1 0 0',
                minWidth: 0,
                width: '100%'
              }}
            >
              {/* Form Section with Enhanced Styling */}
              <Box sx={{ 
                padding: { xs: 3, sm: 4, md: 5 }, 
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.02)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
              <Typography
                component="h2"
                variant="h4"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.95)',
                  marginBottom: 4, 
                  textAlign: 'center',
                  fontWeight: 300,
                  fontSize: { xs: '1.8rem', sm: '2rem' },
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                Sign In
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                 <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange('email')}
                  disabled={isLoading}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: formData.email ? 'rgba(55, 65, 81, 0.25)' : 'rgba(55, 65, 81, 0.08)', // Dark theme colors
                      backdropFilter: 'blur(15px) saturate(150%)',
                      borderRadius: '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: formData.email ? '1px solid rgba(55, 65, 81, 0.4)' : '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: formData.email ? '0 4px 20px rgba(55, 65, 81, 0.3)' : 'none',
                      '& fieldset': {
                        borderColor: formData.email ? 'rgba(55, 65, 81, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                        borderWidth: '1px'
                      },
                      '&:hover': {
                        backgroundColor: formData.email ? 'rgba(55, 65, 81, 0.35)' : 'rgba(55, 65, 81, 0.15)',
                        transform: 'translateY(-1px)',
                        boxShadow: formData.email ? '0 6px 25px rgba(55, 65, 81, 0.4)' : '0 4px 15px rgba(55, 65, 81, 0.2)'
                      },
                      '&:hover fieldset': {
                        borderColor: formData.email ? 'rgba(55, 65, 81, 0.7)' : 'rgba(255, 255, 255, 0.4)'
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(55, 65, 81, 0.4)',
                        boxShadow: '0 8px 30px rgba(55, 65, 81, 0.5), 0 0 0 3px rgba(55, 65, 81, 0.2)'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(55, 65, 81, 0.8)',
                        borderWidth: '2px'
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'rgba(255, 255, 255, 0.95)',
                      fontWeight: 500,
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.4)'
                      },
                      // Autofill transparent fix
                      '&:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                        WebkitTextFillColor: 'rgba(255, 255, 255, 0.95) !important',
                        transition: 'background-color 5000s ease-in-out 0s !important',
                        backgroundColor: 'transparent !important',
                        borderRadius: '12px !important'
                      },
                      '&:-webkit-autofill:hover': {
                        WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                        backgroundColor: 'transparent !important'
                      },
                      '&:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                        backgroundColor: 'transparent !important'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: formData.email ? 'rgba(55, 65, 81, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                      fontWeight: formData.email ? 500 : 400,
                      transition: 'all 0.3s ease'
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'rgba(255, 255, 255, 0.95)' // Changed from 'rgba(55, 65, 81, 1)' to white
                    },
                  }}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    disabled={isLoading}
                    sx={{
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: formData.password ? 'rgba(55, 65, 81, 0.25)' : 'rgba(55, 65, 81, 0.08)', // Dark theme colors
                        backdropFilter: 'blur(15px) saturate(150%)',
                        borderRadius: '12px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: formData.password ? '1px solid rgba(55, 65, 81, 0.4)' : '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: formData.password ? '0 4px 20px rgba(55, 65, 81, 0.3)' : 'none',
                        '& fieldset': {
                          borderColor: formData.password ? 'rgba(55, 65, 81, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                          borderWidth: '1px'
                        },
                        '&:hover': {
                          backgroundColor: formData.password ? 'rgba(55, 65, 81, 0.35)' : 'rgba(55, 65, 81, 0.15)',
                          transform: 'translateY(-1px)',
                          boxShadow: formData.password ? '0 6px 25px rgba(55, 65, 81, 0.4)' : '0 4px 15px rgba(55, 65, 81, 0.2)'
                        },
                        '&:hover fieldset': {
                          borderColor: formData.password ? 'rgba(55, 65, 81, 0.7)' : 'rgba(255, 255, 255, 0.4)'
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(55, 65, 81, 0.4)',
                          boxShadow: '0 8px 30px rgba(55, 65, 81, 0.5), 0 0 0 3px rgba(55, 65, 81, 0.2)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'rgba(55, 65, 81, 0.8)',
                          borderWidth: '2px'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: formData.password ? 'rgba(55, 65, 81, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                        fontWeight: formData.password ? 500 : 400,
                        transition: 'all 0.3s ease'
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: 'rgba(255, 255, 255, 0.95)'
                      },
                      '& .MuiOutlinedInput-input': {
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontWeight: 500
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={isLoading}
                            sx={{ 
                              color: formData.password ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.7)', // Updated icon color
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: 'rgba(55, 65, 81, 1)',
                                backgroundColor: 'rgba(55, 65, 81, 0.1)'
                              }
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    mt: 2,
                    mb: 3,
                    py: 1.8,
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: isLoading 
                    ? 'linear-gradient(135deg, rgba(200, 200, 200, 0.3) 0%, rgba(150, 150, 150, 0.3) 100%)' 
                    : 'linear-gradient(135deg, rgba(55, 65, 81, 0.9) 0%, rgba(31, 41, 55, 0.95) 50%, rgba(17, 24, 39, 0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: isLoading 
                      ? 'none'
                      : '0 8px 25px rgba(55, 65, 81, 0.4), 0 4px 12px rgba(55, 65, 81, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    '&:hover': {
                    background: isLoading 
                      ? 'linear-gradient(135deg, rgba(200, 200, 200, 0.3) 0%, rgba(150, 150, 150, 0.3) 100%)'
                      : 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(55, 65, 81, 0.9) 50%, rgba(31, 41, 55, 0.95) 100%)',
                    transform: isLoading ? 'none' : 'translateY(-2px)',
                      boxShadow: isLoading 
                        ? 'none'
                        : '0 12px 35px rgba(55, 65, 81, 0.35), 0 6px 15px rgba(55, 65, 81, 0.15)'
                    },
                    '&:active': {
                      transform: isLoading ? 'none' : 'translateY(0px)'
                    }
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={22} sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                      <span>Signing In...</span>
                    </Box>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Box>
              
                {/* Enhanced Loading Overlay */}
                {isLoading && <FormLoadingAnimation />}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
      
      {/* Toggle UI for switching between Orbit Animation and Apple Clock */}
      <ToggleContainer onClick={handleToggle}>
        <ToggleLabel>
          {isAppleClock ? 'Clock' : 'Orbit'}
        </ToggleLabel>
        <ToggleSwitch isActive={isAppleClock}>
          <ToggleKnob isActive={isAppleClock} />
        </ToggleSwitch>
      </ToggleContainer>
      
      <CustomModal
        open={openErrorModal}
        onClose={() => setOpenErrorModal(false)}
        title="Login Failed"
        message={errorMessage}
      />
    </Box>
  );
};

export default SignIn;