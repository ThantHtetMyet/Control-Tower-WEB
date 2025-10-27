import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Paper
} from '@mui/material';
import { Router as RouterIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import yesNoStatusService from '../../../api-services/yesNoStatusService';
import WillowlynxRTUStatusImage from '../../../resources/ServerPMReportForm/WillowlynxRTUStatus.png';

const WillowlynxRTUStatus_Details = ({ data, disabled = false }) => {
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);

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
    if (data) {
      // Handle the API response structure: data.pmServerWillowlynxRTUStatuses is an array
      let rtuStatusItem = null;
      
      if (data.pmServerWillowlynxRTUStatuses && Array.isArray(data.pmServerWillowlynxRTUStatuses)) {
        rtuStatusItem = data.pmServerWillowlynxRTUStatuses[0];
      } else if (Array.isArray(data)) {
        rtuStatusItem = data[0];
      } else {
        rtuStatusItem = data;
      }
      
      if (rtuStatusItem) {
        // Use YesNoStatusName directly from API since it already contains "Yes" or "No"
        setResult(rtuStatusItem.YesNoStatusName || rtuStatusItem.yesNoStatusName || rtuStatusItem.yesNoStatusID || rtuStatusItem.result || '');
        setRemarks(rtuStatusItem.Remarks || rtuStatusItem.remarks || '');
      }
    }
  }, [data]);

  const getYesNoStatusLabel = (statusId) => {
    const status = yesNoStatusOptions.find(option => option.id === statusId);
    return status ? status.name : 'Unknown';
  };

  // Get status color for chip
  const getStatusColor = (statusName) => {
    if (!statusName) return 'default';
    
    switch (statusName.toLowerCase()) {
      case 'yes':
      case 'ok':
      case 'good':
        return 'success';
      case 'no':
      case 'error':
      case 'bad':
        return 'error';
      default:
        return 'default';
    }
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
          {result ? (
            <Chip
              label={result}
              color={getStatusColor(result)}
              variant="filled"
              size="small"
            />
          ) : (
            <TextField
              size="small"
              value=""
              variant="outlined"
              disabled
              sx={inlineField}
              placeholder="No result"
            />
          )}
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

export default WillowlynxRTUStatus_Details;