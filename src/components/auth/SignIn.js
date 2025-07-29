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

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
    try {
      const response = await loginAPI(formData);
      console.log('Login response:', response.data);
      login(response.data);
      const from = location.state?.from?.pathname || '/modules'; // Changed from '/dashboard' to '/modules'
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Invalid email or password');
      setOpenErrorModal(true);
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

        <Box sx={{ padding: 4 }}>
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
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
              sx={{
                mt: 3,
                mb: 2,
                background: 'linear-gradient(135deg, #800080 0%, #4B0082 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4B0082 0%, #800080 100%)'
                },
                py: 1.5,
                boxShadow: '0 4px 12px rgba(75, 0, 130, 0.2)',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              Sign In
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Link
                href="#"
                variant="body2"
                sx={{
                  color: '#800080',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </Link>
              <Link
                href="#"
                variant="body2"
                sx={{
                  color: '#800080',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
                onClick={() => navigate('/signup')}
              >
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Box>
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