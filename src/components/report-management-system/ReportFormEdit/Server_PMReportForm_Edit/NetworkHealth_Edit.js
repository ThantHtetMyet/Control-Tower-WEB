import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { NetworkCheck as NetworkCheckIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const NetworkHealth_Edit = ({ data, onDataChange, onStatusChange }) => {
  const [dateChecked, setDateChecked] = useState(null);
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data when meaningful data is available
  useEffect(() => {
    // Check if we have meaningful data to initialize with
    const hasData = data && (
      (data.pmServerNetworkHealths && data.pmServerNetworkHealths.length > 0) || 
      data.dateChecked || 
      (data.result && data.result.trim() !== '') || 
      (data.remarks && data.remarks.trim() !== '')
    );
    
    // Only initialize once
    if (isInitialized.current) return;
    
    if (hasData) {
      // Handle new API structure with pmServerNetworkHealths
      if (data.pmServerNetworkHealths && data.pmServerNetworkHealths.length > 0) {
        const networkHealthData = data.pmServerNetworkHealths[0]; // Take the first entry
        
        if (networkHealthData.dateChecked) {
          const parsedDate = new Date(networkHealthData.dateChecked);
          setDateChecked(parsedDate);
          
        }
        if (networkHealthData.yesNoStatusID) {
          setResult(networkHealthData.yesNoStatusID);
          
        }
        if (networkHealthData.remarks) {
          setRemarks(networkHealthData.remarks);
          
        }
      } else {
        // Handle legacy data structure
        
        if (data.dateChecked) setDateChecked(new Date(data.dateChecked));
        if (data.result) setResult(data.result);
        if (data.remarks) setRemarks(data.remarks);
      }
    }
    
    // Always mark as initialized after first render, even if no data
    // This ensures onDataChange will be called when user fills in data
    isInitialized.current = true;
  }, [data]);

  // Fetch Yes/No options
  useEffect(() => {
    const fetchYesNoStatuses = async () => {
      try {
        setLoading(true);
        const response = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(response || []);
      } catch (error) {
        // console.error('Error fetching yes/no status options:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchYesNoStatuses();
  }, []);

  // Notify parent of data change (but not on initial load)
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      const dataToSend = {
        pmServerNetworkHealths: [{
          dateChecked: dateChecked ? dateChecked.toISOString() : null,
          yesNoStatusID: result,
          remarks: remarks
        }],
        // Legacy format for backward compatibility
        dateChecked: dateChecked ? dateChecked.toISOString() : null,
        result: result,
        remarks: remarks
      };
      onDataChange(dataToSend);
    }
  }, [dateChecked, result, remarks, onDataChange]);

  // Check completion status
  useEffect(() => {
    const isCompleted = dateChecked && result && remarks.trim() !== '';
    if (onStatusChange) onStatusChange('NetworkHealth', isCompleted);
  }, [dateChecked, result, remarks, onStatusChange]);

  // Styles
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
    '& .MuiOutlinedInput-root': { backgroundColor: 'white' },
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
              onChange={(newValue) => setDateChecked(newValue)}
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
            select
            size="small"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            variant="outlined"
            disabled={loading}
            sx={inlineField}
          >
            <MenuItem value="">
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  Loading...
                </Box>
              ) : (
                'Select Result'
              )}
            </MenuItem>
            {yesNoStatusOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
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
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter any additional remarks or observations..."
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              }
            }}
          />
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default NetworkHealth_Edit;