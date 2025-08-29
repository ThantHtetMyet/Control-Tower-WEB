import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../contexts/CategoryContext'; // Add this import
import { Article, Category, AccountCircle } from '@mui/icons-material';

const NewsNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasNewsPortalAdminAccess } = useAuth();
  const { refreshCategories } = useCategories(); // Add this line
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
    backgroundColor: location.pathname === path ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
    color: 'inherit',
    transition: 'all 0.3s ease-in-out',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      transform: location.pathname === path ? 'scaleX(1)' : 'scaleX(0)',
      transformOrigin: 'left',
      transition: 'transform 0.3s ease-in-out',
      zIndex: -1
    },
    '&:hover': {
      backgroundColor: location.pathname === path 
        ? 'rgba(255, 255, 255, 0.25)' 
        : 'rgba(255, 255, 255, 0.1)',
      '&::before': {
        transform: 'scaleX(1)'
      }
    }
  });

  // Check if user has admin access to News Portal
  const isAdmin = hasNewsPortalAdminAccess();

  return (
    <AppBar position="static" sx={{
      background: 'linear-gradient(270deg, #DC143C 0%, #B22222 100%)', // Red gradient for News Portal
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      mb: 3
    }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            News Portal System
          </Typography>
          <Button 
            onClick={() => navigate('/modules')}
            sx={getButtonStyle('/modules')}
          >
            Home
          </Button>
          
          {/* Only show admin navigation items for users with Admin access */}
          {isAdmin && (
            <>
              <Button 
                startIcon={<Article />}
                onClick={() => navigate('/news-portal-system/news')}
                sx={getButtonStyle('/news-portal-system/news')}
              >
                News
              </Button>
              <Button 
                startIcon={<Category />}
                onClick={() => {
                  refreshCategories(); // 👈 force API call
                  navigate('/news-portal-system/categories');
                }}
                sx={getButtonStyle('/news-portal-system/categories')}
              >
                Categories
              </Button>
              
            </>
          )}
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2, color: '#fff' }}>
              {user.firstName} {user.lastName}
            </Typography>
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
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

export default NewsNavBar;