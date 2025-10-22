import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Paper
} from '@mui/material';
import { NetworkCheck as NetworkCheckIcon } from '@mui/icons-material';
import yesNoStatusService from '../../../api-services/yesNoStatusService';
import WillowlynxNetworkStatusImage from '../../../resources/ServerPMReportForm/WillowlynxNetworkStatus.png';

const WillowlynxNetworkStatus_Details = ({ data, disabled = false }) => {
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
      // Handle the API response structure: data.pmServerWillowlynxNetworkStatuses is an array
      let networkStatusItem = null;
      
      if (data.pmServerWillowlynxNetworkStatuses && Array.isArray(data.pmServerWillowlynxNetworkStatuses)) {
        networkStatusItem = data.pmServerWillowlynxNetworkStatuses[0];
      } else if (Array.isArray(data)) {
        networkStatusItem = data[0];
      } else {
        networkStatusItem = data;
      }
      
      if (networkStatusItem) {
        // Use yesNoStatusName directly from API since it already contains "Yes" or "No"
        setResult(networkStatusItem.yesNoStatusName || networkStatusItem.yesNoStatusID || networkStatusItem.result || '');
        setRemarks(networkStatusItem.remarks || networkStatusItem.Remarks || '');
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

  const fieldStyle = {
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000',
      color: '#000000'
    },
    '& .MuiInputLabel-root.Mui-disabled': {
      color: '#666666'
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f5f5f5'
    }
  };

  const inlineField = {
    minWidth: 200,
    '& .MuiOutlinedInput-root': { backgroundColor: '#f5f5f5' },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000',
    },
  };

  return (
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
        {result ? (
          <Chip
            label={getYesNoStatusLabel(result)}
            color={getStatusColor(getYesNoStatusLabel(result))}
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
          disabled={disabled}
          sx={fieldStyle}
        />
      </Box>
    </Paper>
  );
};

export default WillowlynxNetworkStatus_Details;