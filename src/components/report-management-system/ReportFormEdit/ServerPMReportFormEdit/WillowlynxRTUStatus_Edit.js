import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Router as RouterIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import yesNoStatusService from '../../../api-services/yesNoStatusService';
import WillowlynxRTUStatusImage from '../../../resources/ServerPMReportForm/WillowlynxRTUStatus.png';

const WillowlynxRTUStatus_Edit = ({ data, onDataChange, onStatusChange }) => {
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
      (data.pmServerWillowlynxRTUStatuses && data.pmServerWillowlynxRTUStatuses.length > 0) ||
      data.dateChecked || 
      (data.result && data.result.trim() !== '') || 
      (data.remarks && data.remarks.trim() !== '')
    );
    
    if (hasData && !isInitialized.current) {
      // Handle new API structure with pmServerWillowlynxRTUStatuses
      if (data.pmServerWillowlynxRTUStatuses && data.pmServerWillowlynxRTUStatuses.length > 0) {
        const rtuStatusData = data.pmServerWillowlynxRTUStatuses[0];
        
        if (rtuStatusData.dateChecked) setDateChecked(new Date(rtuStatusData.dateChecked));
        if (rtuStatusData.yesNoStatusID) setResult(rtuStatusData.yesNoStatusID);
        if (rtuStatusData.remarks) setRemarks(rtuStatusData.remarks);
      }
      // Handle legacy data structure
      else {
        if (data.dateChecked) setDateChecked(new Date(data.dateChecked));
        if (data.result) setResult(data.result);
        if (data.remarks) setRemarks(data.remarks);
      }
      
      isInitialized.current = true;
    } else if (!hasData && isInitialized.current) {
      // Reset initialization flag when no meaningful data is present
      isInitialized.current = false;
    }
  }, [data]);

  // Fetch Yes/No options
  useEffect(() => {
    const fetchYesNoStatuses = async () => {
      try {
        setLoading(true);
        const response = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching yes/no status options:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchYesNoStatuses();
  }, []);

  // Notify parent of data change
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      const dataToSend = {
        pmServerWillowlynxRTUStatuses: [{
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
    if (onStatusChange) onStatusChange('WillowlynxRTUStatus', isCompleted);
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
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 2,
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
          <RouterIcon /> Willowlynx RTU Status Check
        </Typography>

        {/* Instructions */}
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Instructions:
        </Typography>
        <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
          Check the RTU Device Status page. RTU status and PLC status shall be green.
        </Typography>

        {/* Screenshot */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <img
            src={WillowlynxRTUStatusImage}
            alt="Willowlynx RTU Status Screenshot"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </Box>

        {/* Result */}
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Result:
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, ml: 2, mb: 2 }}>
          <Typography>RTU status and PLC status are green.</Typography>
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

export default WillowlynxRTUStatus_Edit;