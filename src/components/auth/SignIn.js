import { useState } from 'react';
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


const bubbleAnimation = keyframes`
  0% {
    transform: translateY(200px) scale(0.8) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  50% {
    transform: translateY(0px) scale(1) rotate(180deg);
    opacity: 0.9;
  }
  90% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(-200px) scale(0.6) rotate(360deg);
    opacity: 0;
  }
`;

const Shape = styled('div')(({ type, size, left, delay }) => ({
  position: 'absolute',
  width: size,
  height: type === 'square' ? size : type === 'circle' ? size : size * 0.8,
  left: `${left}%`,
  bottom: '-50px',
  backgroundColor: type === 'cross' ? 'transparent' : 'rgba(255, 255, 255, 0.4)',
  borderRadius: type === 'circle' ? '50%' : type === 'square' ? '4px' : '0',
  animation: `${bubbleAnimation} ${8 + Math.random() * 4}s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  boxShadow: type !== 'cross' ? '0 2px 8px rgba(255, 255, 255, 0.2)' : 'none',
  transformOrigin: 'center center',
  '&::before': type === 'cross' ? {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    top: '50%',
    left: '0',
    transform: 'rotate(45deg)',
    boxShadow: '0 1px 4px rgba(255, 255, 255, 0.2)'
  } : {},
  '&::after': type === 'cross' ? {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    top: '50%',
    left: '0',
    transform: 'rotate(-45deg)',
    boxShadow: '0 1px 4px rgba(255, 255, 255, 0.2)'
  } : {}
}));

const AnimatedShapes = () => {
  const shapes = [
    // First wave
    { type: 'circle', size: 15, left: 10, delay: 0 },
    { type: 'square', size: 12, left: 25, delay: 0.8 },
    { type: 'cross', size: 18, left: 40, delay: 1.6 },
    { type: 'circle', size: 20, left: 60, delay: 2.4 },
    { type: 'square', size: 15, left: 75, delay: 3.2 },
    { type: 'cross', size: 14, left: 90, delay: 4.0 },
    
    // Second wave (overlapping)
    { type: 'circle', size: 16, left: 15, delay: 4.8 },
    { type: 'square', size: 13, left: 35, delay: 5.6 },
    { type: 'cross', size: 17, left: 55, delay: 6.4 },
    { type: 'circle', size: 18, left: 80, delay: 7.2 },
    { type: 'square', size: 14, left: 5, delay: 8.0 },
    { type: 'cross', size: 16, left: 70, delay: 8.8 },
    
    // Third wave (continuous overlap)
    { type: 'circle', size: 17, left: 20, delay: 9.6 },
    { type: 'square', size: 15, left: 45, delay: 10.4 },
    { type: 'cross', size: 19, left: 65, delay: 11.2 },
    { type: 'circle', size: 14, left: 85, delay: 12.0 },
    { type: 'square', size: 16, left: 12, delay: 12.8 },
    { type: 'cross', size: 15, left: 30, delay: 13.6 },
    
    // Fourth wave (seamless continuation)
    { type: 'circle', size: 19, left: 50, delay: 14.4 },
    { type: 'square', size: 13, left: 72, delay: 15.2 },
    { type: 'cross', size: 18, left: 8, delay: 16.0 },
    { type: 'circle', size: 16, left: 38, delay: 16.8 },
    { type: 'square', size: 17, left: 58, delay: 17.6 },
    { type: 'cross', size: 14, left: 82, delay: 18.4 }
  ];

  return (
    <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
      {shapes.map((shape, index) => (
        <Shape key={index} {...shape} />
      ))}
    </Box>
  );
};

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
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  borderRadius: '0 0 4px 4px',
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
    border: '3px solid rgba(128, 0, 128, 0.2)',
    borderTop: '3px solid #800080',
    borderRadius: '50%',
    animation: `${spinAnimation} 1s linear infinite`,
  },
  '& .inner-ring': {
    position: 'absolute',
    top: '8px',
    left: '8px',
    width: 'calc(100% - 16px)',
    height: 'calc(100% - 16px)',
    border: '2px solid rgba(75, 0, 130, 0.3)',
    borderBottom: '2px solid #4B0082',
    borderRadius: '50%',
    animation: `${spinAnimation} 0.8s linear infinite reverse`,
  },
  '& .center-dot': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '8px',
    height: '8px',
    backgroundColor: '#800080',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
  }
});

const LoadingText = styled(Typography)({
  color: '#800080',
  fontSize: '16px',
  fontWeight: 500,
  textAlign: 'center',
  animation: `${pulseAnimation} 2s ease-in-out infinite`,
  marginBottom: '8px',
});

const LoadingDots = styled(Box)({
  display: 'flex',
  gap: '6px',
  '& .dot': {
    width: '6px',
    height: '6px',
    backgroundColor: '#800080',
    borderRadius: '50%',
    animation: `${pulseAnimation} 1s ease-in-out infinite`,
    '&:nth-of-type(1)': { animationDelay: '0s' },
    '&:nth-of-type(2)': { animationDelay: '0.2s' },
    '&:nth-of-type(3)': { animationDelay: '0.4s' },
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
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={6} sx={{ width: '100%', overflow: 'hidden' }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #800080 0%, #4B0082 100%)',
              padding: '32px',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              margin: 0
            }}
          >
            <AnimatedShapes />
            <Typography
              component="h1"
              variant="h5"
              sx={{
                color: '#fff',
                textAlign: 'left',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                position: 'relative',
                zIndex: 1,
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              Willowglen Services Pte Ltd
            </Typography>
          </Box>

          <Box sx={{ padding: 4, position: 'relative' }}>
            <Typography
              component="h2"
              variant="h5"
              sx={{ color: '#800080', marginBottom: 4, textAlign: 'center' }}
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
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isLoading}
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
                  mt: 3,
                  mb: 2,
                  background: isLoading 
                    ? 'linear-gradient(135deg, #cccccc 0%, #999999 100%)' 
                    : 'linear-gradient(135deg, #800080 0%, #4B0082 100%)',
                  '&:hover': {
                    background: isLoading 
                      ? 'linear-gradient(135deg, #cccccc 0%, #999999 100%)'
                      : 'linear-gradient(135deg, #4B0082 0%, #800080 100%)',
                  },
                  py: 1.5,
                  boxShadow: '0 4px 12px rgba(75, 0, 130, 0.2)',
                  transition: 'all 0.3s ease-in-out',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                    <span>Signing In...</span>
                  </Box>
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>
            
            {/* Form Loading Overlay - only covers the form area */}
            {isLoading && <FormLoadingAnimation />}
          </Box>
        </Paper>
      </Box>
      <CustomModal
        open={openErrorModal}
        onClose={() => setOpenErrorModal(false)}
        title="Login Failed"
        message={errorMessage}
      />
    </Container>
  );
};

export default SignIn;