import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import yesNoStatusService from '../../../api-services/yesNoStatusService';

// Import the Willowlynx Process Status image
import WillowlynxProcessStatusImage from '../../../resources/ServerPMReportForm/WillowlynxProcessStatus.png';

const WillowlynxProcessStatus_Edit = ({ data, onDataChange, onStatusChange }) => {
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data when meaningful data is available
  useEffect(() => {
    // Check if we have meaningful data to initialize with
    const hasData = data && (
      (data.pmServerWillowlynxProcessStatuses && data.pmServerWillowlynxProcessStatuses.length > 0) ||
      (data.result && data.result.trim() !== '') || 
      (data.remarks && data.remarks.trim() !== '')
    );
    
    if (hasData && !isInitialized.current) {
      // Handle new API structure with pmServerWillowlynxProcessStatuses
      if (data.pmServerWillowlynxProcessStatuses && data.pmServerWillowlynxProcessStatuses.length > 0) {
        const processStatusData = data.pmServerWillowlynxProcessStatuses[0];
        
        if (processStatusData.yesNoStatusID) setResult(processStatusData.yesNoStatusID);
        if (processStatusData.remarks) setRemarks(processStatusData.remarks);
      }
      // Handle legacy data structure
      else {
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
        // console.error('Error fetching yes/no status options:', error);
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
        pmServerWillowlynxProcessStatuses: [{
          yesNoStatusID: result,
          remarks: remarks
        }],
        // Legacy format for backward compatibility
        result: result,
        remarks: remarks
      };
      
      onDataChange(dataToSend);
    }
  }, [result, remarks, onDataChange]);

  // Check completion status
  useEffect(() => {
    const isCompleted = result && remarks.trim() !== '';
    if (onStatusChange) onStatusChange('WillowlynxProcessStatus', isCompleted);
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
        <SettingsIcon /> Willowlynx Process Status Check
      </Typography>

      {/* Process Status Section */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
        Process Status
      </Typography>

      {/* Instructions */}
      <Typography variant="body1" sx={{ mb: 2 }}>
        Login into Willowlynx and navigate to "Server Status" page, as below:
      </Typography>

      {/* Screenshot */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <img
          src={WillowlynxProcessStatusImage}
          alt="Willowlynx Process Status Screenshot"
          style={{
            maxWidth: '100%',
            height: 'auto',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
      </Box>

      {/* Result Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Result:
        </Typography>
        <Typography variant="body1">
          All Process is online, either ACTIVE or STANDBY.
        </Typography>
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
  );
};

export default WillowlynxProcessStatus_Edit;