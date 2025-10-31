import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
} from '@mui/material';
import {
  NetworkCheck as NetworkCheckIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const NetworkHealth_Edit_Review = ({ data, disabled = true, formData }) => {
  const [dateChecked, setDateChecked] = useState(null);
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const isInitialized = useRef(false);

  // Initialize data from props
  useEffect(() => {
    if (!isInitialized.current) {
     // console.log('NetworkHealth_Edit_Review - Received data:', data);
      // console.log('NetworkHealth_Edit_Review - Received formData:', formData);
      
      // Handle data from NetworkHealth_Edit format
      if (data) {
        // Check for pmServerNetworkHealths array first
        if (data.pmServerNetworkHealths && data.pmServerNetworkHealths.length > 0) {
          const networkHealthData = data.pmServerNetworkHealths[0];
          if (networkHealthData.dateChecked) {
            setDateChecked(new Date(networkHealthData.dateChecked));
          }
          if (networkHealthData.yesNoStatusID) {
            setResult(networkHealthData.yesNoStatusID);
          }
          if (networkHealthData.remarks) {
            setRemarks(networkHealthData.remarks);
          }
        } 
        // Handle legacy format
        else {
          if (data.dateChecked) {
            setDateChecked(new Date(data.dateChecked));
          }
          if (data.result) {
            setResult(data.result);
          }
          if (data.remarks) {
            setRemarks(data.remarks);
          }
        }
      }
      
     // console.log('Final network health data:', { dateChecked, result, remarks });
      isInitialized.current = true;
    }
  }, [data, formData]);

  // Fetch YesNoStatus options on component mount
  useEffect(() => {
    const fetchYesNoStatuses = async () => {
      try {
        const response = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching yes/no status options:', error);
      }
    };

    fetchYesNoStatuses();
  }, []);

  // Get status name by ID (following NetworkHealth_Review.js pattern)
  const getStatusName = (id, options) => {
    const status = options.find(option => option.ID === id || option.id === id);
    return status ? (status.Name || status.name) : id;
  };

  // Styling (following NetworkHealth_Review.js pattern)
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
              disabled
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
          <TextField
            size="small"
            value={getStatusName(result, yesNoStatusOptions) || ''}
            variant="outlined"
            disabled
            sx={inlineField}
          />
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
            disabled
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
      </Paper>
    </LocalizationProvider>
  );
};

export default NetworkHealth_Edit_Review;