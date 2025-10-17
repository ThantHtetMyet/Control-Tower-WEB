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
} from '@mui/material';
import {
  Storage as StorageIcon,
} from '@mui/icons-material';

// Import the hard drive health image
import HardDriveHealthImage from '../../../resources/ServerPMReportForm/HardDriveHealth.png';
// Import the result status service
import resultStatusService from '../../../api-services/resultStatusService';

const HardDriveHealth_Review = ({ data = {} }) => {
  const [hardDriveHealthData, setHardDriveHealthData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);

  // Initialize data from props
  useEffect(() => {
    if (data.hardDriveHealthData && data.hardDriveHealthData.length > 0) {
      setHardDriveHealthData(data.hardDriveHealthData);
    }
    if (data.remarks) {
      setRemarks(data.remarks);
    }
  }, [data]);

  // Fetch ResultStatus options on component mount
  useEffect(() => {
    const fetchResultStatuses = async () => {
      try {
        const response = await resultStatusService.getResultStatuses();
        setResultStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching result status options:', error);
      }
    };

    fetchResultStatuses();
  }, []);

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

      {/* Hard Drive Health Check Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Server Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hardDriveHealthData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No data available for this section.
                </TableCell>
              </TableRow>
            ) : (
              hardDriveHealthData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.serverName || ''}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Result"
                      value={(() => {
                        const selectedOption = resultStatusOptions.find(option => 
                          option.id === row.result || option.id === parseInt(row.result)
                        );
                        return selectedOption ? selectedOption.name : (row.result || 'No result');
                      })()}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9f9f9',
                          '& fieldset': {
                            borderColor: '#e0e0e0'
                          }
                        },
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#666 !important',
                          color: '#666 !important'
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Additional Information */}
      <Box sx={{ marginTop: 3, marginBottom: 3 }}>
        <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#666' }}>
          If LED is in flashing amber, the hard drive is in predictive failure or already failed, replace the hard drive.
        </Typography>
      </Box>

      {/* Remarks Section */}
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
          disabled
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f5f5f5',
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default HardDriveHealth_Review;