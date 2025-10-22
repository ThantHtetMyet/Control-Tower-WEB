import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Chip
} from '@mui/material';
import {
  Computer as ComputerIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

// Import the server health image
import ServerHealthImage from '../../../resources/ServerPMReportForm/ServerHealth.png';

const ServerHealth_Details = ({ data, disabled = true, formData }) => {
  const [serverHealthData, setServerHealthData] = useState([]);
  const [remarks, setRemarks] = useState('');

  // Helper function for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Initialize data from props
  useEffect(() => {
    // Handle the API response structure from PMReportFormServerController
    // data is the pmServerHealths array directly
    if (Array.isArray(data) && data.length > 0) {
      // Extract the first item which contains the server health data
      const serverHealthItem = data[0];
      
      if (serverHealthItem && serverHealthItem.details) {
        // Map the details to the expected format
        const mappedData = serverHealthItem.details.map(detail => ({
          id: detail.id,
          serverName: detail.serverName,
          resultStatusID: detail.resultStatusID,
          resultStatusName: detail.resultStatusName,
          remarks: detail.remarks,
          createdDate: detail.createdDate,
          updatedDate: detail.updatedDate
        }));
        setServerHealthData(mappedData);
      }
      
      // Set remarks from the parent server health item
      if (serverHealthItem && serverHealthItem.remarks) {
        setRemarks(serverHealthItem.remarks);
      }
    }
  }, [data]);

  // Helper function to get status chip
  const getStatusChip = (status) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    let color = 'default';
    
    if (statusLower.includes('pass') || statusLower.includes('ok') || statusLower.includes('good')) {
      color = 'success';
    } else if (statusLower.includes('fail') || statusLower.includes('error') || statusLower.includes('bad')) {
      color = 'error';
    } else if (statusLower.includes('warning') || statusLower.includes('caution')) {
      color = 'warning';
    }
    
    return (
      <Chip 
        label={status} 
        color={color} 
        size="small"
        variant="outlined"
      />
    );
  };

  return (
    <Box sx={{ 
      padding: 3, 
      backgroundColor: '#ffffff', 
      borderRadius: 2, 
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: 3
    }}>
      
      {/* Section Title */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: 3,
        paddingBottom: 2,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <ComputerIcon sx={{ 
          color: '#1976d2', 
          marginRight: 1,
          fontSize: '1.5rem'
        }} />
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#1976d2', 
            fontWeight: 'bold'
          }}
        >
          Server Health Check
        </Typography>
      </Box>
      
      {/* Server Health Check Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Check Server Front Panel LED Number 2, as shown below. Check LED 2 in solid green, which indicates the server is healthy.
        </Typography>
        
        {/* Reference Image */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: 2,
          padding: 2,
          backgroundColor: '#f8f9fa',
          borderRadius: 1,
          border: '1px solid #e9ecef'
        }}>
          <img 
            src={ServerHealthImage} 
            alt="Server Health Check Reference" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              maxHeight: '400px',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }} 
          />
        </Box>
      </Box>

      {/* Server Health Data Table */}
      {serverHealthData && serverHealthData.length > 0 && (
        <Box sx={{ marginBottom: 3 }}>
          <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Server Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Result Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {serverHealthData.map((server, index) => (
                  <TableRow key={server.id || index}>
                    <TableCell>{server.serverName || 'N/A'}</TableCell>
                    <TableCell>
                      {getStatusChip(server.resultStatusName) || 
                       server.resultStatusName || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Show message if no data */}
                {serverHealthData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ 
                      textAlign: 'center', 
                      fontStyle: 'italic',
                      color: 'text.secondary'
                    }}>
                      No server health records available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Remarks Section */}
      <Box sx={{ 
        padding: 3, 
        backgroundColor: '#ffffff', 
        borderRadius: 2, 
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#1976d2', 
            fontWeight: 'bold', 
            marginBottom: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          📝 Remarks
        </Typography>
        <TextField
          label="Additional Notes"
          fullWidth
          multiline
          rows={4}
          value={remarks}
          disabled={disabled}
          placeholder="Enter any additional remarks or observations..."
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f5f5f5',
              '& fieldset': {
                borderColor: '#d0d0d0'
              }
            },
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
              color: 'rgba(0, 0, 0, 0.6)'
            }
          }}
        />
      </Box>

      {/* No Data Message */}
      {(!serverHealthData || serverHealthData.length === 0) && !remarks && (
        <Box sx={{ 
          textAlign: 'center', 
          padding: 4,
          backgroundColor: '#f9f9f9',
          borderRadius: 2,
          border: '1px dashed #ccc'
        }}>
          <Typography variant="body1" color="text.secondary">
            No server health data available
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ServerHealth_Details;