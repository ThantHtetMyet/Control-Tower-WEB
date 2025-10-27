import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Paper
} from '@mui/material';
import { Videocam as VideocamIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import yesNoStatusService from '../../../api-services/yesNoStatusService';
import WillowlynxSumpPitCCTVCameraImage from '../../../resources/ServerPMReportForm/WillowlynxSumpPitCCTVCamera.png';

const WillowlynxSumpPitCCTVCamera_Details = ({ data, disabled = false }) => {
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);

  useEffect(() => {
    const fetchYesNoStatusOptions = async () => {
      try {
        const options = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(options || []);
      } catch (error) {
        console.error('Error fetching yes/no status options:', error);
      }
    };

    fetchYesNoStatusOptions();
  }, []);

  useEffect(() => {
    if (data) {
      // Handle API response structure
      let cctvCameraItem = null;
      
      if (data.pmServerWillowlynxCCTVCameras && Array.isArray(data.pmServerWillowlynxCCTVCameras)) {
        cctvCameraItem = data.pmServerWillowlynxCCTVCameras[0];
      } else if (Array.isArray(data)) {
        cctvCameraItem = data[0];
      } else {
        cctvCameraItem = data;
      }

      if (cctvCameraItem) {
        setResult(
          cctvCameraItem.YesNoStatusID || 
          cctvCameraItem.yesNoStatusID || 
          cctvCameraItem.result || 
          cctvCameraItem.remarks || 
          ''
        );
        setRemarks(cctvCameraItem.Remarks || cctvCameraItem.remarks || '');
      }
    }
  }, [data]);

  const getYesNoStatusLabel = (statusId) => {
    const status = yesNoStatusOptions.find(option => option.id === statusId);
    return status ? status.name : 'Unknown';
  };

  const getStatusColor = (statusId) => {
    const label = getYesNoStatusLabel(statusId);
    switch (label.toLowerCase()) {
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

  // Styling constants
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
    '& .MuiOutlinedInput-root': { backgroundColor: 'white' },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={sectionContainerStyle}>
        {/* Header */}
        <Typography variant="h5" sx={sectionHeaderStyle}>
          <VideocamIcon /> Willowlynx Sump Pit CCTV Camera Check
        </Typography>

        {/* Instructions */}
        <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
          Click the CCTV buttons from PLUMB-SAN page, make sure the player window for each camera can be played.
        </Typography>

        {/* Screenshot */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <img 
            src={WillowlynxSumpPitCCTVCameraImage} 
            alt="Willowlynx Sump Pit CCTV Camera" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }} 
          />
        </Box>

        {/* Result */}
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Result:
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, ml: 2, mb: 2 }}>
          <Typography>All CCTV cameras can be played without issues. </Typography>
          <Chip
            label={getYesNoStatusLabel(result)}
            color={getStatusColor(result)}
            size="small"
          />
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

export default WillowlynxSumpPitCCTVCamera_Details;