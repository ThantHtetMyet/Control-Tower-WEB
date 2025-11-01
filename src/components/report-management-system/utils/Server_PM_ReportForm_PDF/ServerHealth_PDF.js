import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import ServerHealthImage from '../../../resources/ServerPMReportForm/ServerHealth.png';
import willowglenLetterhead from '../../../resources/willowglen_letterhead.png';

const ServerHealth_PDF = ({ data, reportData }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // Extract server health data from the API response structure
  const serverHealthData = React.useMemo(() => {
    if (Array.isArray(data) && data.length > 0) {
      const serverHealthItem = data[0];
      if (serverHealthItem && serverHealthItem.details) {
        return serverHealthItem.details.map(detail => ({
          serverName: detail.serverName || '',
          resultStatusName: detail.resultStatusName || ''
        }));
      }
    }
    return [];
  }, [data]);

  // Extract remarks from the API response structure
  const remarks = React.useMemo(() => {
    if (Array.isArray(data) && data.length > 0) {
      const serverHealthItem = data[0];
      return serverHealthItem?.remarks || '';
    }
    return '';
  }, [data]);

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
      </Box>

      {/* Equipment Check Section Title */}
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 3,
          fontSize: '18px'
        }}
      >
        1 Equipment Check
      </Typography>

      {/* Server Health Check Section Title */}
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 3,
          fontSize: '16px'
        }}
      >
        1.1 Server Health Check
      </Typography>

      {/* Instructions */}
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 3,
          lineHeight: 1.6,
          fontSize: '12px'
        }}
      >
        Check Server Front Panel LED Number 2, as shown below. Check LED 2 in solid green, which indicates the server is healthy.
      </Typography>

      {/* Server Health Image */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mb: 3,
        p: 2
      }}>
        <img 
          src={ServerHealthImage} 
          alt="Server Health Check Diagram" 
          style={{ 
            maxWidth: '100%', 
            height: 'auto',
            maxHeight: '300px'
          }} 
        />
      </Box>

      {/* Additional instruction */}
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 3,
          fontSize: '12px'
        }}
      >
        Check if LED 2 is in solid green.
      </Typography>

      {/* Server Health Table */}
      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          mb: 3,
          border: '1px solid #000',
          '& .MuiTable-root': {
            borderCollapse: 'collapse'
          }
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  border: '1px solid #000',
                  backgroundColor: '#f5f5f5',
                  fontSize: '12px',
                  py: 1
                }}
              >
                Server Name
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  border: '1px solid #000',
                  backgroundColor: '#f5f5f5',
                  fontSize: '12px',
                  py: 1
                }}
              >
                Result
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {serverHealthData && serverHealthData.length > 0 ? (
              serverHealthData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell 
                    sx={{ 
                      border: '1px solid #000',
                      fontSize: '12px',
                      py: 1
                    }}
                  >
                    {row.serverName}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      border: '1px solid #000',
                      fontSize: '12px',
                      py: 1
                    }}
                  >
                    {row.resultStatusName}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Default rows as shown in the screenshot
              <>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      border: '1px solid #000',
                      fontSize: '12px',
                      py: 1
                    }}
                  >
                    WC-SCA-SR1
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      border: '1px solid #000',
                      fontSize: '12px',
                      py: 1
                    }}
                  >
                    Pass / Fail
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      border: '1px solid #000',
                      fontSize: '12px',
                      py: 1
                    }}
                  >
                    WC-SCA-SR2
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      border: '1px solid #000',
                      fontSize: '12px',
                      py: 1
                    }}
                  >
                    Pass / Fail
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Remarks Section - Updated to match SignOff_PDF style */}
      <Box sx={{ mt: 6 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 2,
            fontSize: '12px'
          }}
        >
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
          <Typography variant="body2" sx={{ color: remarks ? '#000' : '#666', fontSize: '12px' }}>
            {remarks || ''}
          </Typography>
        </Box>
      </Box>

      {/* Footer Section - Same as SignOff_PDF */}
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

export default ServerHealth_PDF;