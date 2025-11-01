import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid
} from '@mui/material';
import willowglenLetterhead from '../../../resources/willowglen_letterhead.png';

const ServerPMSignOff_PDF = ({ reportData }) => {
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
        '@media print': {
          boxShadow: 'none',
          border: 'none'
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
        
        {/* Job No and Date - Left and Right Aligned */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="body1">
            <strong>Job No:</strong> {reportData?.pmReportFormServer?.jobNo || ''}
          </Typography>
          <Typography variant="body1">
            <strong>Date:</strong> {formatDate(reportData?.pmReportFormServer?.createdDate) || ''}
          </Typography>
        </Box>
      </Box>

      {/* Signature Section */}
      <Box sx={{ 
        mt: 8, 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'center',
        width: '100%'
      }}>
        <Box sx={{ width: '600px', maxWidth: '100%' }}>
          {/* Attended By */}
          <Box sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ minWidth: '200px' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  ATTENDED BY
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666',
                    fontSize: '0.9rem'
                  }}
                >
                  (WILLOWGLEN)
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mx: 2 }}>:</Typography>
              <Box 
                sx={{ 
                  borderBottom: '1px solid #000', 
                  flexGrow: 1, 
                  height: '25px',
                  maxWidth: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  pl: 1
                }} 
              >
                <Typography variant="body2">
                  {reportData?.pmReportFormServer?.signOffData?.attendedBy || ''}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Witnessed By */}
          <Box sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ minWidth: '200px' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  WITNESSED BY
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666',
                    fontSize: '0.9rem'
                  }}
                >
                  (CUSTOMER)
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mx: 2 }}>:</Typography>
              <Box 
                sx={{ 
                  borderBottom: '1px solid #000', 
                  flexGrow: 1, 
                  height: '25px',
                  maxWidth: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  pl: 1
                }} 
              >
                <Typography variant="body2">
                  {reportData?.pmReportFormServer?.signOffData?.witnessedBy || ''}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Start Date/Time */}
          <Box sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                START DATE/TIME
              </Typography>
              <Typography variant="body1" sx={{ mx: 2 }}>:</Typography>
              <Box 
                sx={{ 
                  borderBottom: '1px solid #000', 
                  flexGrow: 1, 
                  height: '25px',
                  maxWidth: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  pl: 1
                }} 
              >
                <Typography variant="body2">
                  {reportData?.pmReportFormServer?.signOffData?.startDate || ''}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Completion Date/Time */}
          <Box sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ minWidth: '200px', fontWeight: 'bold' }}>
                COMPLETION DATE/TIME
              </Typography>
              <Typography variant="body1" sx={{ mx: 2 }}>:</Typography>
              <Box 
                sx={{ 
                  borderBottom: '1px solid #000', 
                  flexGrow: 1, 
                  height: '25px',
                  maxWidth: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  pl: 1
                }} 
              >
                <Typography variant="body2">
                  {reportData?.pmReportFormServer?.signOffData?.completionDate || ''}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Remarks Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Remarks:
        </Typography>
        <Box 
          sx={{ 
            border: '1px solid #ccc',
            minHeight: '80px',
            p: 2,
            backgroundColor: '#f9f9f9'
          }}
        >
          <Typography variant="body2" sx={{ color: reportData?.remarks ? '#000' : '#666' }}>
            {reportData?.pmReportFormServer?.signOffData?.remarks || ''}
          </Typography>
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

export default ServerPMSignOff_PDF;
