import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Videocam as VideocamIcon } from '@mui/icons-material';
import yesNoStatusService from '../../../api-services/yesNoStatusService';
import WillowlynxSumpPitCCTVCameraImage from '../../../resources/ServerPMReportForm/WillowlynxSumpPitCCTVCamera.png';

const WillowlynxSumpPitCCTVCamera = ({ data, onDataChange, onStatusChange }) => {
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data once
  useEffect(() => {
    if (data && !isInitialized.current) {
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
      onDataChange({ result, remarks });
    }
  }, [result, remarks, onDataChange]);

  // Check completion status
  useEffect(() => {
    const isCompleted = result && remarks.trim() !== '';
    if (onStatusChange) onStatusChange('WillowlynxSumpPitCCTVCamera', isCompleted);
  }, [result, remarks, onStatusChange]);

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

  const inlineField = {
    minWidth: 200,
    '& .MuiOutlinedInput-root': { backgroundColor: 'white' },
  };

  return (
    <Paper sx={sectionContainerStyle}>
      {/* Header */}
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <VideocamIcon /> Willowlynx Sump Pit CCTV Camera Check
      </Typography>

      <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
        Click the CCTV buttons from PLUMB-SAN page, make sure the player window for
        each camera can be played.
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
          placeholder="Enter any observations about CCTV camera functionality, video quality, or playback issues..."
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default WillowlynxSumpPitCCTVCamera;