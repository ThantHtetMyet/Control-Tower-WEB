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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material';
import {
  Computer as ComputerIcon,
} from '@mui/icons-material';

// Import the server health image
import ServerHealthImage from '../../../resources/ServerPMReportForm/ServerHealth.png';
// Import the result status service
import resultStatusService from '../../../api-services/resultStatusService';

const ServerHealth_Review = ({ data, disabled = true, formData }) => {
  const [serverHealthData, setServerHealthData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data from props only once
  useEffect(() => {
    if (!isInitialized.current) {
      // Handle case where data is the serverHealthData array directly
      if (Array.isArray(data) && data.length > 0) {
        setServerHealthData(data);
      } else if (data && data.serverHealthData && data.serverHealthData.length > 0) {
        setServerHealthData(data.serverHealthData);
      }
      
      // Get remarks from formData or data
      if (formData && formData.serverHealthRemarks) {
        setRemarks(formData.serverHealthRemarks);
      } else if (data && data.remarks) {
        setRemarks(data.remarks);
      }
      
      isInitialized.current = true;
    }
  }, [data, formData]);

  // Fetch ResultStatus options on component mount
  useEffect(() => {
    const fetchResultStatuses = async () => {
      try {
        setLoading(true);
        const response = await resultStatusService.getResultStatuses();
        setResultStatusOptions(response || []);
      } catch (error) {
        // console.error('Error fetching result status options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResultStatuses();
  }, []);

  // Get status name by ID
  const getStatusName = (id, options) => {
    const status = options.find(option => option.ID === id || option.id === id);
    return status ? (status.Name || status.name) : id;
  };

  const disabledFieldStyle = {
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
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" sx={{ 
        color: '#1976d2', 
        fontWeight: 'bold', 
        marginBottom: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <ComputerIcon /> Server Health Check
      </Typography>
      
      {/* Server Health Check Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Check Server Front Panel LED Number 2, as shown below. Check LED 2 in solid green, which indicates the server is healthy.
        </Typography>
        
        {/* Server Health Image */}
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
            alt="Server Health Check" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }} 
          />
        </Box>
      </Box>

      {/* Server Health Table */}
      <TableContainer component={Paper} elevation={1} sx={{ marginBottom: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', width: '50%' }}>Server Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '50%' }}>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {serverHealthData && serverHealthData.length > 0 ? (
              serverHealthData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.serverName || ''}
                      disabled={disabled}
                      placeholder="Enter server name"
                      sx={disabledFieldStyle}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      label="Result"
                      value={getStatusName(row.result, resultStatusOptions) || ''}
                      disabled={disabled}
                      placeholder="No result selected"
                      sx={disabledFieldStyle}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} sx={{ textAlign: 'center', color: '#999', py: 3 }}>
                  No server health data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
          sx={disabledFieldStyle}
        />
      </Box>
    </Box>
  );
};

export default ServerHealth_Review;