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
import WillowlynxNetworkStatusImage from '../../../resources/ServerPMReportForm/WillowlynxNetworkStatus.png';

const WillowlynxNetworkStatus = ({ data, onDataChange, onStatusChange }) => {
  const [dateChecked, setDateChecked] = useState(null);
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data once
  useEffect(() => {
    if (data && !isInitialized.current) {
      if (data.dateChecked) setDateChecked(new Date(data.dateChecked));
      if (data.result) setResult(data.result);
      if (data.remarks) setRemarks(data.remarks);
      isInitialized.current = true;
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
      onDataChange({ dateChecked, result, remarks });
    }
  }, [dateChecked, result, remarks, onDataChange]);

  // Check completion status
  useEffect(() => {
    const isCompleted = dateChecked && result && remarks.trim() !== '';
    if (onStatusChange) onStatusChange('WillowlynxNetworkStatus', isCompleted);
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
          <NetworkCheckIcon /> Willowlynx Network Status Check
        </Typography>

        {/* Instructions */}
        
        <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
          Check the system overview page, see if all servers, switches, RTUs are green.
        </Typography>

        {/* Screenshot */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <img
            src={WillowlynxNetworkStatusImage}
            alt="Willowlynx Network Status Screenshot"
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
          <Typography>All servers, switches, and RTU are green.</Typography>
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
              <MenuItem key={option.id} value={option.name}>
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

export default WillowlynxNetworkStatus;