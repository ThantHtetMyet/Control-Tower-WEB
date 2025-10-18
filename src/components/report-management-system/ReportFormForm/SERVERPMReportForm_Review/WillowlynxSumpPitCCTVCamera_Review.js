import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
} from '@mui/icons-material';
import WillowlynxSumpPitCCTVCameraImage from '../../../resources/ServerPMReportForm/WillowlynxSumpPitCCTVCamera.png';

// Import the yes/no status service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const WillowlynxSumpPitCCTVCamera_Review = ({ data = {} }) => {
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);

  // Initialize data from props
  useEffect(() => {
    console.log('WillowlynxSumpPitCCTVCamera_Review - Received data:', data);
    
    if (data) {
      setResult(data.result || '');
      setRemarks(data.remarks || '');
    }
    
    console.log('Final sump pit CCTV camera data:', { result: data?.result, remarks: data?.remarks });
  }, [data]);

  // Fetch Yes/No status options
  useEffect(() => {
    const fetchYesNoStatusOptions = async () => {
      try {
        const options = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(options);
      } catch (error) {
        console.error('Error fetching yes/no status options:', error);
      }
    };

    fetchYesNoStatusOptions();
  }, []);

  // Helper function to get status name from ID
  const getStatusName = (statusId, statusOptions) => {
    const status = statusOptions.find(option => option.id === statusId);
    return status ? status.name : statusId;
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
    <Paper sx={sectionContainerStyle}>
      {/* Header */}
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <VideocamIcon /> Willowlynx Sump Pit CCTV Camera Check
      </Typography>

      <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
        Click the CCTV icon on an HMI, which will load the CCTV Module. Check if the
        CCTV camera is working properly and the video feed is clear.
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
        <Typography>CCTV camera is working properly and video feed is clear. </Typography>
        <TextField
          size="small"
          value={getStatusName(result, yesNoStatusOptions) || ''}
          variant="outlined"
          disabled
          sx={inlineField}
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
  );
};

export default WillowlynxSumpPitCCTVCamera_Review;