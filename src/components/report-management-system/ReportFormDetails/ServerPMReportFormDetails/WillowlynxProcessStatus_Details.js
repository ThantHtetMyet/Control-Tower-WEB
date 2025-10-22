import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Chip,
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import yesNoStatusService from '../../../api-services/yesNoStatusService';

// Import the Willowlynx Process Status image
import WillowlynxProcessStatusImage from '../../../resources/ServerPMReportForm/WillowlynxProcessStatus.png';

const WillowlynxProcessStatus_Details = ({ data, disabled = false }) => {
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);

  // Initialize data from props
  useEffect(() => {
    // Handle the API response structure from PMReportFormServerController
    if (Array.isArray(data) && data.length > 0) {
      // Extract the first item which contains the process status data
      const processStatusItem = data[0];
      
      if (processStatusItem) {
        // Set result from yesNoStatusName
        if (processStatusItem.yesNoStatusName) {
          setResult(processStatusItem.yesNoStatusName);
        }
        
        // Set remarks
        if (processStatusItem.remarks) {
          setRemarks(processStatusItem.remarks);
        }
      }
    }
  }, [data]);

  // Fetch Yes/No Status options on component mount
  useEffect(() => {
    const fetchYesNoStatuses = async () => {
      try {
        const response = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(response || []);
      } catch (error) {
        // console.error('Error fetching yes/no status options:', error);
      }
    };

    fetchYesNoStatuses();
  }, []);

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
        {result && (
          <Chip
            label={result}
            color={getStatusColor(result)}
            variant="filled"
            size="small"
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
          disabled={true}
          sx={fieldStyle}
        />
      </Box>

      {/* No Data Message */}
      {(!data || data.length === 0) && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4, 
          color: '#666',
          fontStyle: 'italic' 
        }}>
          <Typography variant="body1">
            No Willowlynx Process Status data available
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default WillowlynxProcessStatus_Details;