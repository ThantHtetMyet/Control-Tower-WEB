import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import NewsNavBar from './NewsNavBar';
import { CategoryProvider } from '../contexts/CategoryContext';

const NewsPortalLayout = () => {
  return (
    <CategoryProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NewsNavBar />
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </CategoryProvider>
  );
};

export default NewsPortalLayout;