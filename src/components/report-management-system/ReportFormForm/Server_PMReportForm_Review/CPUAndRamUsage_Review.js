import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Memory as MemoryIcon,
} from '@mui/icons-material';

// Import the CPU and RAM usage image
import CPUAndRamUsageImage from '../../../resources/ServerPMReportForm/CPUAndRamUsage.png';
// Import the result status service
import resultStatusService from '../../../api-services/resultStatusService';

const CPUAndRamUsage_Review = ({ data = {} }) => {
  const [memoryUsageData, setMemoryUsageData] = useState([]);
  const [cpuUsageData, setCpuUsageData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);

  // Initialize data from props
  useEffect(() => {
    console.log('CPUAndRamUsage_Review - Received data:', data);
    
    if (data.memoryUsageData && data.memoryUsageData.length > 0) {
      console.log('Memory usage data:', data.memoryUsageData);
      // Preserve original data structure including IDs
      setMemoryUsageData(data.memoryUsageData);
    }
    if (data.cpuUsageData && data.cpuUsageData.length > 0) {
      console.log('CPU usage data:', data.cpuUsageData);
      // Preserve original data structure including IDs
      setCpuUsageData(data.cpuUsageData);
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
        setResultStatusOptions([]);
      }
    };

    fetchResultStatuses();
  }, []);

  // Get status name by ID
  const getStatusName = (id, options) => {
    const status = options.find(option => option.ID === id || option.id === id);
    return status ? (status.Name || status.name) : id;
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
        <MemoryIcon /> CPU and RAM Usage Check
      </Typography>
      
      <Typography variant="body1" sx={{ marginBottom: 3 }}>
        Monitor CPU and RAM usage to ensure optimal server performance.
      </Typography>

      {/* CPU and RAM Usage Image */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: 3,
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
            maxHeight: '400px'
          }} 
        />
      </Box>

      {/* Memory Usage Table */}
      <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
        💾 Memory Usage Check
      </Typography>
      
      <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
        <Table>
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
            {memoryUsageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No memory usage data available.
                </TableCell>
              </TableRow>
            ) : (
              memoryUsageData.map((row, index) => (
                <TableRow key={row.id || index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={index + 1}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000000',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.machineName || ''}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000000',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.memorySize || ''}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000000',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.memoryInUse || ''}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000000',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={getStatusName(row.memoryInUsed, resultStatusOptions) || ''}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000000',
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CPU Usage Table */}
      <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
        🖥️ CPU Usage Check
      </Typography>
      
      <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Machine Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>CPU Usage (%)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>CPU Usage Check</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cpuUsageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No CPU usage data available.
                </TableCell>
              </TableRow>
            ) : (
              cpuUsageData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.machineName || ''}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.cpuUsage || ''}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={getStatusName(row.cpuUsageCheck, resultStatusOptions) || ''}
                      disabled
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

export default CPUAndRamUsage_Review;