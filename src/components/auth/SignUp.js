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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { signup as signupAPI } from '../api-services/authService';
import CustomModal from '../common/CustomModal';

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNo: '',
    gender: '',
    loginPassword: '',
    confirmPassword: ''
  });

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.loginPassword !== formData.confirmPassword) {
      return;
    }
    try {
      const signupData = {
        ...formData,
        isDeleted: false,
        lastLogin: new Date().toISOString()
      };
      await signupAPI(signupData);
      setOpenSuccessModal(true);
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '800px',
            boxShadow: '0 8px 32px rgba(128, 0, 128, 0.15)',
            '&:hover': {
              boxShadow: '0 12px 48px rgba(128, 0, 128, 0.2)'
            },
            transition: 'box-shadow 0.3s ease-in-out'
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #800080 0%, #4B0082 100%)',
              padding: '16px 48px',
              borderRadius: '8px',
              marginBottom: 2,
              boxShadow: '0 4px 12px rgba(75, 0, 130, 0.2)'
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              sx={{
                color: '#fff',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              Service Report System
            </Typography>
          </Box>
          <Typography
            component="h2"
            variant="h5"
            sx={{ color: '#800080', marginBottom: 4 }}
          >
            Sign Up
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', gap: 4, position: 'relative', mb: 4 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  autoFocus
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  sx={{ mb: 3 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  sx={{ mb: 3 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  sx={{ mb: 3 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="mobileNo"
                  label="Mobile Number"
                  name="mobileNo"
                  autoComplete="tel"
                  value={formData.mobileNo}
                  onChange={handleChange('mobileNo')}
                  sx={{ mb: 3 }}
                />
              </Box>
              <Box
                sx={{
                  width: '2px',
                  alignSelf: 'stretch',
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'relative',
                  height: '400px',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '2px',
                    background: '#800080',
                    animation: 'lineAnimation 2s ease-in-out infinite',
                  },
                  '@keyframes lineAnimation': {
                    '0%': {
                      height: '100px',
                    },
                    '50%': {
                      height: '250px',
                    },
                    '100%': {
                      height: '100px',
                    },
                  },
                }}
              />
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth margin="normal" sx={{ mb: 3 }} required>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    value={formData.gender}
                    label="Gender"
                    onChange={handleChange('gender')}
                  >
                    <MenuItem value="M">Male</MenuItem>
                    <MenuItem value="F">Female</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="loginPassword"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="loginPassword"
                  autoComplete="new-password"
                  value={formData.loginPassword}
                  onChange={handleChange('loginPassword')}
                  sx={{ mb: 3 }}
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
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 2,
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
                  SIGN UP
                </Button>
                <Box sx={{ textAlign: 'center' }}>
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
                    onClick={() => navigate('/signin')}
                  >
                    Already have an account? Sign In
                  </Link>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
      <CustomModal
        open={openSuccessModal}
        onClose={() => {
          setOpenSuccessModal(false);
          navigate('/signin');
        }}
        title="Registration Successful!"
        message="Your account has been successfully created. Please sign in to continue."
      />
    </Container>
  );
};

export default SignUp;