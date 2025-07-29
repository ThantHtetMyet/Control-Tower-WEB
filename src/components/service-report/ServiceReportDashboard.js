import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

// Define animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const Dashboard = () => {
  return (
    <Box
      sx={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        animation: `${fadeIn} 1s ease-out`
      }}
    >
      <Typography
        variant="h2"
        sx={{
          color: '#ffffff',
          fontWeight: 'bold',
          textAlign: 'center',
          animation: `${pulse} 2s infinite ease-in-out`,
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          '&::after': {
            content: '""',
            display: 'block',
            width: '60px',
            height: '4px',
            margin: '20px auto',
            background: '#ffffff',
            borderRadius: '2px',
          }
        }}
      >
        Under Development
      </Typography>
    </Box>
  );
};

export default Dashboard;