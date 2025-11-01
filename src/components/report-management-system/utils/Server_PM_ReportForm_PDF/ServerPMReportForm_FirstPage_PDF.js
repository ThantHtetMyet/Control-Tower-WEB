import React from 'react';
import { 
  Box, 
  Paper, 
  Typography
} from '@mui/material';
import willowglenLetterhead from '../../../resources/willowglen_letterhead.png';

const ServerPMReportForm_FirstPage_PDF = ({ reportData }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 4, 
        mb: 3,
        border: '1px solid #e0e0e0',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '@media print': {
          boxShadow: 'none',
          border: 'none',
          minHeight: '100vh',
          pageBreakAfter: 'always'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        {/* Letterhead Image */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <img 
            src={willowglenLetterhead} 
            alt="Willowglen Letterhead" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              maxHeight: '120px'
            }} 
          />
        </Box>
      </Box>

      {/* Report Title Section */}
      <Box sx={{ 
        mt: 8, 
        mb: 6, 
        display: 'flex', 
        justifyContent: 'center',
        width: '100%'
      }}>
        <Box sx={{ textAlign: 'center', maxWidth: '80%' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              mb: 4,
              color: '#1976d2',
              textAlign: 'center'
            }}
          >
            {reportData?.pmReportFormServer?.reportTitle || ''}
          </Typography>
        </Box>
      </Box>

      {/* System Information Box */}
      <Box sx={{ 
        mt: 6, 
        mb: 6, 
        display: 'flex', 
        justifyContent: 'center',
        width: '100%'
      }}>
        <Box sx={{ 
          border: '2px solid #000',
          borderRadius: '8px',
          p: 4,
          backgroundColor: '#f9f9f9',
          maxWidth: '600px',
          width: '100%'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: '160px' }}>
              System Description:
            </Typography>
            <Typography variant="body1" sx={{ ml: 1 }}>
              {reportData?.pmReportFormServer?.systemDescription || ''}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: '160px' }}>
              Station Name:
            </Typography>
            <Typography variant="body1" sx={{ ml: 1 }}>
              {reportData?.pmReportFormServer?.stationName || ''}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: '160px' }}>
              Customer:
            </Typography>
            <Typography variant="body1" sx={{ ml: 1 }}>
              {reportData?.pmReportFormServer?.customer || ''}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: '160px' }}>
              Project No:
            </Typography>
            <Typography variant="body1" sx={{ ml: 1 }}>
              {reportData?.pmReportFormServer?.projectNo || ''}
            </Typography>
          </Box>
        </Box>
      </Box>



      {/* Footer Section */}
      <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #000' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
              mb: 0.5
            }}
          >
            WILLOWGLEN SERVICES PTE LTD
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: '0.8rem',
              color: '#666'
            }}
          >
            Copyright©2023. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ServerPMReportForm_FirstPage_PDF;