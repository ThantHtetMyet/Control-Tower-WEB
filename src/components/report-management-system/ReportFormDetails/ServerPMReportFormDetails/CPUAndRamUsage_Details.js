import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Memory as MemoryIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import yesNoStatusService from '../../../api-services/yesNoStatusService';

// Import the CPU and RAM usage image
import CPUAndRamUsageImage from '../../../resources/ServerPMReportForm/CPUAndRamUsage.png';

const CPUAndRamUsage_Details = ({ data, disabled = false }) => {
  const [cpuAndMemoryData, setCpuAndMemoryData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);

  // Helper function for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    const fetchYesNoStatusOptions = async () => {
      try {
        const options = await yesNoStatusService.getYesNoStatusOptions();
        setYesNoStatusOptions(options);
      } catch (error) {
        console.error('Error fetching yes/no status options:', error);
      }
    };

    fetchYesNoStatusOptions();
  }, []);

  useEffect(() => {
    console.log('CPUAndRamUsage_Details received data:', data);
    
    // Handle case where data is the array directly
    if (Array.isArray(data) && data.length > 0) {
      console.log('Processing CPU and Memory data:', data);
      setCpuAndMemoryData(data);
      
      // Extract remarks from the first item
      if (data[0] && data[0].remarks) {
        setRemarks(data[0].remarks);
      }
    } else if (data && data.cpuAndMemoryData && data.cpuAndMemoryData.length > 0) {
      setCpuAndMemoryData(data.cpuAndMemoryData);
      
      if (data.remarks) {
        setRemarks(data.remarks);
      }
    }
  }, [data]);

  const getStatusChip = (status) => {
    if (!status) return null;
    
    const statusLower = status.toString().toLowerCase();
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

  const fieldStyle = {
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000',
      color: '#000000'
    },
    '& .MuiInputLabel-root.Mui-disabled': {
      color: '#666666'
    }
  };

  return (
    <Paper sx={{ 
      padding: 3, 
      marginBottom: 3, 
      backgroundColor: '#ffffff', 
      borderRadius: 2, 
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      
      {/* Section Title */}
      <Typography variant="h5" sx={{ 
        color: '#1976d2', 
        fontWeight: 'bold',
        marginBottom: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <MemoryIcon /> Server CPU and RAM Usage Check
      </Typography>
      
      {/* CPU and RAM Usage Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Using Task Manager, and go to Performance Tab
        </Typography>
        
        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          ○ Right click on the task bar and select task manager
        </Typography>
        
        {/* CPU and RAM Usage Image */}
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
            src={CPUAndRamUsageImage} 
            alt="CPU and RAM Usage Check Diagram" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              maxHeight: '500px'
            }} 
          />
        </Box>
        
        <Typography variant="body2" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
          * Note: The SQL Server Database on HDSRS Servers use as much memory as it needs to provide best performance, we limit the memory usage so the overall server memory usage can be up to 90%
        </Typography>
      </Box>

      {/* CPU and Memory Data */}
      {cpuAndMemoryData.length > 0 ? (
        <Box sx={{ marginBottom: 3 }}>
          {cpuAndMemoryData.map((record, recordIndex) => (
            <Box key={recordIndex} sx={{ marginBottom: 3, padding: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
              
                
                {/* Memory Usage Details */}
                {record.memoryUsageDetails && record.memoryUsageDetails.length > 0 && (
                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
                      Memory Usage Check:
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Machine Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Memory Size</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Memory In Use (%)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Memory In Used &lt; 90%? *Historical server &lt; 90%?</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {record.memoryUsageDetails.map((detail, detailIndex) => (
                            <TableRow key={detailIndex}>
                              <TableCell>{detail.serialNo || (detailIndex + 1)}</TableCell>
                              <TableCell>{detail.serverName || 'N/A'}</TableCell>
                              <TableCell>{detail.memorySize || 'N/A'}</TableCell>
                              <TableCell>{detail.memoryUsagePercentage || 'N/A'}%</TableCell>
                              <TableCell>
                                {getStatusChip(detail.resultStatusName) || detail.resultStatusName || 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* CPU Usage Details */}
                {record.cpuUsageDetails && record.cpuUsageDetails.length > 0 && (
                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
                      CPU Usage Check:
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Machine Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>CPU Usage (%)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>CPU Usage &lt; 50%?</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {record.cpuUsageDetails.map((detail, detailIndex) => (
                            <TableRow key={detailIndex}>
                              <TableCell>{detail.serialNo || (detailIndex + 1)}</TableCell>
                              <TableCell>{detail.serverName || 'N/A'}</TableCell>
                              <TableCell>{detail.cpuUsagePercentage || 'N/A'}%</TableCell>
                              <TableCell>
                                {getStatusChip(detail.resultStatusName) || detail.resultStatusName || 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* No Details Message */}
                {(!record.cpuUsageDetails || record.cpuUsageDetails.length === 0) && 
                 (!record.memoryUsageDetails || record.memoryUsageDetails.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    No CPU or memory usage details available for this record
                  </Typography>
                )}
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', padding: 3, color: '#666' }}>
          <Typography variant="body2">
            No CPU and memory usage data available
          </Typography>
        </Box>
      )}

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
    </Paper>
  );
};

export default CPUAndRamUsage_Details;