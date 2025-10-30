import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
} from '@mui/material';
import {
  Settings as SettingsIcon,
} from '@mui/icons-material';

// Import the Willowlynx Process Status image
import WillowlynxProcessStatusImage from '../../../resources/ServerPMReportForm/WillowlynxProcessStatus.png';

// Import the yes/no status service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const WillowlynxProcessStatus_Edit_Review = ({ data = {}, formData = {} }) => {
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);

  // Initialize data from props
  useEffect(() => {
    // Priority: formData (from Edit mode) > data (from API)
    let resultValue = '';
    let remarksValue = '';

    // Check formData first (from Edit → Review flow)
    if (formData.willowlynxProcessStatusData) {
      const processData = formData.willowlynxProcessStatusData;
      if (processData.pmServerWillowlynxProcessStatuses && processData.pmServerWillowlynxProcessStatuses.length > 0) {
        const processStatusData = processData.pmServerWillowlynxProcessStatuses[0];
        resultValue = processStatusData.yesNoStatusID || processData.result || '';
        remarksValue = processStatusData.remarks || processData.remarks || '';
      } else {
        resultValue = processData.result || '';
        remarksValue = processData.remarks || '';
      }
    }
    // Fallback to data (direct Review mode)
    else if (data) {
      if (data.pmServerWillowlynxProcessStatuses && data.pmServerWillowlynxProcessStatuses.length > 0) {
        const processStatusData = data.pmServerWillowlynxProcessStatuses[0];
        resultValue = processStatusData.yesNoStatusID || '';
        remarksValue = processStatusData.remarks || '';
      } else {
        resultValue = data.result || '';
        remarksValue = data.remarks || '';
      }
    }

    setResult(resultValue);
    setRemarks(remarksValue);
  }, [data, formData]);

  // Fetch YesNo Status options on component mount
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

  // Get status name by ID
  const getStatusName = (id, options) => {
    const status = options.find(option => option.ID === id || option.id === id);
    return status ? (status.Name || status.name) : id;
  };

  // Styles matching the Review component
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
        <SettingsIcon /> Willowlynx Process Status Check
      </Typography>

      {/* Instructions */}
      <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
        Check the system overview page, see if all processes are online.
      </Typography>

      {/* Screenshot */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <img
          src={WillowlynxProcessStatusImage}
          alt="Willowlynx Process Status"
          style={{
            maxWidth: '100%',
            height: 'auto',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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

export default WillowlynxProcessStatus_Edit_Review;