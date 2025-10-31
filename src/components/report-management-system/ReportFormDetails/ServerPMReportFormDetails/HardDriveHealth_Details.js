import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Storage as StorageIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

// Import the hard drive health image
import HardDriveHealthImage from '../../../resources/ServerPMReportForm/HardDriveHealth.png';

const HardDriveHealth_Details = ({ data = {}, disabled = true }) => {
  const [hardDriveHealthData, setHardDriveHealthData] = useState([]);
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
    if (Array.isArray(data) && data.length > 0) {
      // Extract the first item which contains the hard drive health data
      const hardDriveHealthItem = data[0];
      
      if (hardDriveHealthItem && hardDriveHealthItem.details) {
        // Map the details to the expected format (note: lowercase 'details' from API)
        const mappedData = hardDriveHealthItem.details.map(detail => ({
          id: detail.id,
          serverName: detail.serverName,
          hardDriveName: detail.hardDriveName || detail.serverName, // Fallback to serverName if hardDriveName not available
          resultStatusID: detail.resultStatusID,
          resultStatusName: detail.resultStatusName,
          remarks: detail.remarks,
          createdDate: detail.createdDate,
          updatedDate: detail.updatedDate
        }));
        setHardDriveHealthData(mappedData);
      }
      
      // Set remarks from the parent hard drive health item
      if (hardDriveHealthItem && hardDriveHealthItem.remarks) {
        setRemarks(hardDriveHealthItem.remarks);
      }
    }
  }, [data]);

  // Helper function to get status chip
  const getStatusChip = (status) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    let color = 'default';
    
    if (statusLower.includes('pass') || statusLower.includes('ok') || statusLower.includes('good') || statusLower.includes('healthy')) {
      color = 'success';
    } else if (statusLower.includes('fail') || statusLower.includes('error') || statusLower.includes('bad') || statusLower.includes('critical')) {
      color = 'error';
    } else if (statusLower.includes('warning') || statusLower.includes('caution')) {
      color = 'warning';
    }
    
    return (
      <Chip 
        label={status} 
        color={color} 
        size="small"
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  // Styling
  const sectionContainerStyle = {
    padding: 3,
    marginBottom: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const sectionHeaderStyle = {
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1
  };

  return (
    <Paper sx={sectionContainerStyle}>
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <StorageIcon /> Hard Drive Health Check
      </Typography>
      
      {/* Hard Drive Health Check Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Check Hard Drive Health Status LED, LED in solid/blinking green, which indicates healthy.
        </Typography>
        
        {/* Hard Drive Health Image */}
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
            src={HardDriveHealthImage} 
            alt="Hard Drive Health Check Diagram" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              maxHeight: '400px'
            }} 
          />
        </Box>
        
        <Typography variant="body1" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
          Check if the LED is in solid/blinking green
        </Typography>
      </Box>

      {/* Hard Drive Health Data Table */}
      {hardDriveHealthData && hardDriveHealthData.length > 0 && (
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
                {hardDriveHealthData.map((drive, index) => (
                  <TableRow key={drive.id || index}>
                    <TableCell>{drive.serverName || 'N/A'}</TableCell>
                    <TableCell>
                      {getStatusChip(drive.resultStatusName) || 
                       drive.resultStatusName || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Show message if no data */}
                {hardDriveHealthData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ 
                      textAlign: 'center', 
                      fontStyle: 'italic',
                      color: 'text.secondary'
                    }}>
                      No hard drive health records available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Additional Information */}
      <Box sx={{ marginTop: 3, marginBottom: 3 }}>
        <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#666' }}>
          If LED is in flashing amber, the hard drive is in predictive failure or already failed, replace the hard drive.
        </Typography>
      </Box>

      {/* Remarks Section */}
      {remarks && (
        <Box sx={{ marginTop: 3 }}>
          <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
            📝 Remarks
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Remarks"
            value={remarks}
            disabled={disabled}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#000000',
                color: '#000000'
              },
              '& .MuiInputLabel-root.Mui-disabled': {
                color: '#666666'
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f5f5f5',
              }
            }}
          />
        </Box>
      )}

      {/* No Data Message */}
      {(!hardDriveHealthData || hardDriveHealthData.length === 0) && !remarks && (
        <Box sx={{ 
          textAlign: 'center', 
          padding: 4,
          backgroundColor: '#f9f9f9',
          borderRadius: 2,
          border: '1px dashed #ccc'
        }}>
          <Typography variant="body1" color="text.secondary">
            No hard drive health data available
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default HardDriveHealth_Details;