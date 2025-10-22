import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Paper,
} from '@mui/material';
import {
  NetworkCheck as NetworkCheckIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const NetworkHealth_Details = ({ data = {}, disabled = true }) => {
  const [dateChecked, setDateChecked] = useState(null);
  const [result, setResult] = useState('');
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

  useEffect(() => {
    // Handle the API response structure from PMReportFormServerController
    if (Array.isArray(data) && data.length > 0) {
      // Extract the first item which contains the network health data
      const networkHealthItem = data[0];
      
      if (networkHealthItem) {
        // Set date checked from DateChecked field (now available from API)
        if (networkHealthItem.dateChecked) {
          setDateChecked(new Date(networkHealthItem.dateChecked));
        }
        
        // Set result from yesNoStatusName
        if (networkHealthItem.yesNoStatusName) {
          setResult(networkHealthItem.yesNoStatusName);
        }
        
        // Set remarks
        if (networkHealthItem.remarks) {
          setRemarks(networkHealthItem.remarks);
        }
      }
    }
  }, [data]);

  // Helper function to get status chip
  const getStatusChip = (status) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    let color = 'default';
    
    if (statusLower.includes('yes') || statusLower.includes('pass') || statusLower.includes('ok') || statusLower.includes('good')) {
      color = 'success';
    } else if (statusLower.includes('no') || statusLower.includes('fail') || statusLower.includes('error') || statusLower.includes('bad')) {
      color = 'error';
    } else if (statusLower.includes('warning') || statusLower.includes('caution')) {
      color = 'warning';
    }
    
    return (
      <Chip 
        label={status} 
        color={color} 
        size="small"
        variant="filled"
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

  const labelBox = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    flexWrap: 'wrap',
    gap: 2,
  };

  const inlineField = {
    minWidth: 200,
    '& .MuiOutlinedInput-root': { backgroundColor: '#f5f5f5' },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000',
    },
  };

  const fieldStyle = {
    '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#000000', color: '#000000' },
    '& .MuiInputLabel-root.Mui-disabled': { color: '#666666' }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={sectionContainerStyle}>
        {/* Header */}
        <Typography variant="h5" sx={sectionHeaderStyle}>
          <NetworkCheckIcon /> Network Health Check
        </Typography>

        {/* Title with Date Checked inline */}
        <Box sx={labelBox}>
          <Typography variant="h6">Ring Network Check.</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography>Date Checked:</Typography>
            <DatePicker
              value={dateChecked}
              disabled={disabled}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: inlineField,
                },
              }}
            />
          </Box>
        </Box>

        {/* Procedure */}
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Procedure:
        </Typography>
        <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
          Observe the ring and ring master LED on the network switch
        </Typography>

        {/* Result */}
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Result:
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, ml: 2, mb: 2 }}>
          <Typography>Ring and ring master LED should be green (stable).</Typography>
          <Box sx={{ minWidth: 200 }}>
            {getStatusChip(result) || (
              <TextField
                size="small"
                value={result || ''}
                variant="outlined"
                disabled={disabled}
                sx={inlineField}
                placeholder="No result"
              />
            )}
          </Box>
        </Box>

        {/* Instruction when result = No */}
        <Typography variant="body1" sx={{ ml: 2, mb: 3 }}>
          If the answer is 'No', please use topology viewer (Oring software), check if any
          switch in the ring has connectivity problem.
        </Typography>

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
            disabled={disabled}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f5f5f5',
              },
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#000000',
              },
            }}
          />
        </Box>

        {/* No Data Message */}
        {!dateChecked && !result && !remarks && (
          <Box sx={{ 
            textAlign: 'center', 
            padding: 4,
            backgroundColor: '#f9f9f9',
            borderRadius: 2,
            border: '1px dashed #ccc'
          }}>
            <Typography variant="body1" color="text.secondary">
              No network health data available
            </Typography>
          </Box>
        )}
      </Paper>
    </LocalizationProvider>
  );
};

export default NetworkHealth_Details;