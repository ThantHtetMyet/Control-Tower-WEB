import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { AccountCircle } from '@mui/icons-material';

const EmployeeNavBar = () => {
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

  return (
    <AppBar position="static" sx={{
      background: 'linear-gradient(270deg, #34C759 0%, #28A745 100%)', // Green gradient for Employee Management
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            Employee Management System
          </Typography>
          <Button 
            onClick={() => navigate('/modules')}
            sx={getButtonStyle('/modules')}
          >
            Home
          </Button>
          <Button 
            onClick={() => navigate('/employee-management-system')}
            sx={getButtonStyle('/employee-management-system')}
          >
            Dashboard
          </Button>
          <Button 
            onClick={() => navigate('/employee-management-system/companies')}
            sx={getButtonStyle('/employee-management-system/companies')}
          >
            Companies
          </Button>
          <Button 
            onClick={() => navigate('/employee-management-system/departments')}
            sx={getButtonStyle('/employee-management-system/departments')}
          >
            Departments
          </Button>
          <Button 
            onClick={() => navigate('/employee-management-system/sub-departments')}
            sx={getButtonStyle('/employee-management-system/sub-departments')}
          >
            Sub Departments
          </Button>
          <Button 
            onClick={() => navigate('/employee-management-system/occupations')}
            sx={getButtonStyle('/employee-management-system/occupations')}
          >
            Occupations
          </Button>
          <Button 
            onClick={() => navigate('/employee-management-system/occupation-levels')}
            sx={getButtonStyle('/employee-management-system/occupation-levels')}
          >
            Occupation Levels
          </Button>
          <Button 
            onClick={() => navigate('/employee-management-system/applications')}
            sx={getButtonStyle('/employee-management-system/applications')}
          >
            Applications
          </Button>
          <Button 
            onClick={() => navigate('/employee-management-system/employees')}
            sx={getButtonStyle('/employee-management-system/employees')}
          >
            Employees
          </Button>
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

export default EmployeeNavBar;