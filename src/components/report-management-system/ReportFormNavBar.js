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
      boxShadow: RMSDarkTheme.shadows.medium
    }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ color: RMSDarkTheme.components.navbar.text }}>
            Report Management System
          </Typography>
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
          <Button 
            onClick={() => navigate('/report-management-system/report-types')}
            sx={getButtonStyle('/report-management-system/report-types')}
          >
            Report Types
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