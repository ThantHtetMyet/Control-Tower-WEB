import { useState, memo } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
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


// Enhanced bubble animation with smoother transitions
// Linear bubble animation with consistent speed
const bubbleAnimation = keyframes`
  0% {
    transform: translateY(120px) scale(0.6) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-140px) scale(0.6) rotate(360deg);
    opacity: 0;
  }
`;

// Enhanced floating animation for variety
const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-15px) rotate(5deg);
  }
  50% {
    transform: translateY(-25px) rotate(0deg);
  }
  75% {
    transform: translateY(-10px) rotate(-5deg);
  }
`;

// Glow pulse animation
const glowPulse = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.6));
  }
`;

const Shape = styled('div')(({ type, size, left, delay, variant }) => ({
  position: 'absolute',
  width: size,
  height: type === 'square' ? size : type === 'circle' ? size : size * 0.8,
  left: `${left}%`,
  bottom: '-40px',
  backgroundColor: type === 'cross' ? 'transparent' : 
    variant === 'glow' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.25)',
  borderRadius: type === 'circle' ? '50%' : type === 'square' ? '6px' : '0',
  animation: variant === 'float' ? 
    `${floatAnimation} 3s ease-in-out infinite, ${glowPulse} 2s ease-in-out infinite` :
    `${bubbleAnimation} ${3.5 + Math.random() * 2}s linear infinite`, // Changed to linear timing
  animationDelay: `${delay}s`,
  animationFillMode: 'both',
  boxShadow: type !== 'cross' ? 
    variant === 'glow' ? '0 4px 20px rgba(255, 255, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)' :
    '0 2px 12px rgba(255, 255, 255, 0.3)' : 'none',
  transformOrigin: 'center center',
  pointerEvents: 'none',
  willChange: 'transform, opacity, filter',
  backfaceVisibility: 'hidden',
  perspective: 1000,
  border: variant === 'glow' ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
  '&::before': type === 'cross' ? {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '3px',
    backgroundColor: variant === 'glow' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.35)',
    top: '50%',
    left: '0',
    transform: 'rotate(45deg)',
    borderRadius: '2px',
    boxShadow: variant === 'glow' ? '0 0 10px rgba(255, 255, 255, 0.4)' : '0 1px 6px rgba(255, 255, 255, 0.2)'
  } : {},
  '&::after': type === 'cross' ? {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '3px',
    backgroundColor: variant === 'glow' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.35)',
    top: '50%',
    left: '0',
    transform: 'rotate(-45deg)',
    borderRadius: '2px',
    boxShadow: variant === 'glow' ? '0 0 10px rgba(255, 255, 255, 0.4)' : '0 1px 6px rgba(255, 255, 255, 0.2)'
  } : {}
}));

const AnimatedShapes = memo(() => {
  const shapes = [
    // Main bubble animation shapes
    { type: 'circle', size: 18, left: 8, delay: 0, variant: 'glow' },
    { type: 'square', size: 15, left: 22, delay: 0.8, variant: 'normal' },
    { type: 'cross', size: 20, left: 38, delay: 1.6, variant: 'glow' },
    { type: 'circle', size: 22, left: 55, delay: 2.4, variant: 'normal' },
    { type: 'square', size: 16, left: 72, delay: 3.2, variant: 'glow' },
    { type: 'cross', size: 18, left: 88, delay: 4.0, variant: 'normal' },
    
    // Floating shapes for variety
    { type: 'circle', size: 12, left: 15, delay: 0.5, variant: 'float' },
    { type: 'square', size: 10, left: 45, delay: 1.2, variant: 'float' },
    { type: 'cross', size: 14, left: 75, delay: 2.8, variant: 'float' },
    
    // Second wave with different timing
    { type: 'circle', size: 20, left: 12, delay: 5.0, variant: 'normal' },
    { type: 'square', size: 17, left: 32, delay: 5.8, variant: 'glow' },
    { type: 'cross', size: 19, left: 58, delay: 6.6, variant: 'normal' },
    { type: 'circle', size: 16, left: 82, delay: 7.4, variant: 'glow' },
    
    // Continuous flow
    { type: 'square', size: 13, left: 5, delay: 8.2, variant: 'normal' },
    { type: 'cross', size: 21, left: 65, delay: 9.0, variant: 'glow' }
  ];

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        isolation: 'isolate',
        // Add subtle background animation
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)',
          animation: `${floatAnimation} 8s ease-in-out infinite`,
          animationDelay: '2s'
        }
      }}
    >
      {shapes.map((shape, index) => (
        <Shape
          key={`shape-${index}`}
          type={shape.type}
          size={shape.size}
          left={shape.left}
          delay={shape.delay}
          variant={shape.variant}
        />
      ))}
    </Box>
  );
});

AnimatedShapes.displayName = 'AnimatedShapes';

// Add loading animation keyframes
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

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

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
        height: '100vh', // Changed from minHeight to height
        width: '100vw', // Ensure full width
        overflow: 'hidden', // Prevent scrolling
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
        padding: { xs: 1, sm: 2, md: 3 }, // Reduced padding
        boxSizing: 'border-box', // Include padding in height calculation
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
          justifyContent: 'flex-end',
          alignItems: 'center',
          height: '100%', // Changed from minHeight to height
          maxWidth: '1400px',
          padding: 0,
          margin: 0 // Remove default margin
        }}
      >
        <Box sx={{ 
          width: { xs: '100%', sm: '420px', md: '450px' },
          marginRight: { xs: 0, sm: 2, md: 4, lg: 6 }, // Reduced margin
          marginLeft: { xs: 0, sm: 'auto' },
          maxHeight: '90vh', // Limit maximum height
          overflow: 'auto' // Allow internal scrolling if needed
        }}>
          <Paper 
            elevation={24}
            sx={{ 
              width: '100%', 
              overflow: 'hidden',
              backgroundColor: 'rgba(55, 65, 81, 0.15)', // Changed from white to dark theme
              backdropFilter: 'blur(20px) saturate(180%)', // Enhanced glass effect
              border: '1px solid rgba(255, 255, 255, 0.1)', // Keep the subtle white border
              borderRadius: '20px', // More rounded corners
              boxShadow: {
                xs: '0 8px 32px rgba(0, 0, 0, 0.3)',
                sm: '0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(55, 65, 81, 0.2)' // Updated shadow color
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'rgba(55, 65, 81, 0.25)', // Darker on hover to match theme
                transform: 'translateY(-2px)',
                boxShadow: '0 25px 70px rgba(0, 0, 0, 0.5), 0 10px 40px rgba(55, 65, 81, 0.3)' // Updated shadow
              }
            }}
          >
            {/* Header Section with Enhanced Gradient */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.9) 0%, rgba(31, 41, 55, 0.95) 50%, rgba(17, 24, 39, 0.9) 100%)',
                padding: { xs: '24px', sm: '32px' },
                position: 'relative',
                overflow: 'hidden',
                minHeight: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                isolation: 'isolate', // Create new stacking context
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
                  zIndex: 1
                }
              }}
            >
              <AnimatedShapes />
              <Typography
                component="h1"
                variant="h5"
                sx={{
                  color: '#fff',
                  textAlign: 'center',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  zIndex: 3, // Higher than shapes and background
                  fontWeight: 600,
                  fontSize: { xs: '1.3rem', sm: '1.5rem' },
                  letterSpacing: '0.5px'
                }}
              >
                Willowglen Services Pte Ltd
              </Typography>
            </Box>

            {/* Form Section with Enhanced Styling */}
            <Box sx={{ 
              padding: { xs: 3, sm: 4, md: 5 }, 
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.02)'
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
          </Paper>
        </Box>
      </Container>
      
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