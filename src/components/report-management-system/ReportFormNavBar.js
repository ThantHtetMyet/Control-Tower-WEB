import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { AccountCircle } from '@mui/icons-material';
import RMSDarkTheme from '../theme-resource/RMSTheme';

const ReportFormNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/signin');
  };

  const getButtonStyle = (path) => ({
    ml: 2,
    backgroundColor: location.pathname === path ? RMSDarkTheme.components.navbar.activeIndicator : 'transparent',
    color: RMSDarkTheme.components.navbar.text,
    transition: 'all 0.3s ease-in-out',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: RMSDarkTheme.components.navbar.activeIndicator,
      transform: location.pathname === path ? 'scaleX(1)' : 'scaleX(0)',
      transformOrigin: 'left',
      transition: 'transform 0.3s ease-in-out',
      zIndex: -1
    },
    '&:hover': {
      backgroundColor: location.pathname === path
        ? 'rgba(255, 255, 255, 0.25)'
        : RMSDarkTheme.components.navbar.hoverBackground,
      '&::before': {
        transform: 'scaleX(1)'
      }
    }
  });

  return (
    <AppBar position="static" sx={{
      background: RMSDarkTheme.components.navbar.background,
      boxShadow: RMSDarkTheme.shadows.medium,
      position: 'relative',
      overflow: 'hidden',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '50%',
        height: '100%',
        background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
        transform: 'skewX(-25deg)',
        animation: 'shine 6s infinite',
        pointerEvents: 'none',
      },
      '@keyframes shine': {
        '0%': {
          left: '-100%',
          opacity: 0
        },
        '20%': {
          opacity: 1
        },
        '50%': {
          opacity: 1
        },
        '100%': {
          left: '200%',
          opacity: 0
        }
      }
    }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{
            display: 'flex',
            mr: 2,
            '@keyframes jump': {
              '0%': { transform: 'translateY(0)' },
              '6.66%': { transform: 'translateY(-8px)' }, // Peak at 1s (Gentle rise)
              '13.33%': { transform: 'translateY(0)' },   // End at 2s (Gentle fall)
              '100%': { transform: 'translateY(0)' }
            }
          }}>
            {['Report', '.', 'Management', '.', 'System'].map((word, index) => (
              <Typography
                key={index}
                variant="h6"
                component="span"
                sx={{
                  color: RMSDarkTheme.components.navbar.text,
                  display: 'inline-block',
                  animation: 'jump 25s ease-in-out infinite', // (2s jump + 3s wait) * 3 words = 15s
                  animationDelay: `${index * 5}s`, // Stagger by (2s + 3s) = 5s
                  '&:hover': {
                    animationDuration: '2s', // Gentle jump on hover too
                    animationDelay: '0s'
                  }
                }}
              >
                {word}
              </Typography>
            ))}
          </Box>
          <Button
            onClick={() => navigate('/modules')}
            sx={getButtonStyle('/modules')}
          >
            Home
          </Button>
          <Button
            onClick={() => navigate('/report-management-system')}
            sx={getButtonStyle('/report-management-system')}
          >
            Dashboard
          </Button>
          <Button
            onClick={() => navigate('/report-management-system/report-forms')}
            sx={getButtonStyle('/report-management-system/report-forms')}
          >
            Report Forms
          </Button>
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2, color: RMSDarkTheme.components.navbar.text }}>
              {user.firstName} {user.lastName}
            </Typography>
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: RMSDarkTheme.components.navbar.hoverBackground
                }
              }}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default ReportFormNavBar;