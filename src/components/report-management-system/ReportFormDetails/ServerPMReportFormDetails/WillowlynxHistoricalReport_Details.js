import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Paper
} from '@mui/material';
import { Assessment as AssessmentIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import yesNoStatusService from '../../../api-services/yesNoStatusService';
import WillowlynxHistoricalReportImage from '../../../resources/ServerPMReportForm/WillowlynxHistoricalReport.png';

const WillowlynxHistoricalReport_Details = ({ data, disabled = false }) => {
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
      let historicalReportItem = null;
      
      if (data.pmServerWillowlynxHistoricalReports && Array.isArray(data.pmServerWillowlynxHistoricalReports)) {
        historicalReportItem = data.pmServerWillowlynxHistoricalReports[0];
      } else if (Array.isArray(data)) {
        historicalReportItem = data[0];
      } else {
        historicalReportItem = data;
      }

      if (historicalReportItem) {
        setResult(
          historicalReportItem.YesNoStatusID || 
          historicalReportItem.yesNoStatusID || 
          historicalReportItem.result || 
          historicalReportItem.remarks || 
          ''
        );
        setRemarks(historicalReportItem.Remarks || historicalReportItem.remarks || '');
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
          <AssessmentIcon /> Willowlynx Historical Report Check
        </Typography>

        {/* Instructions */}
        <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
          Click the CTHistReport icon on an HMI, which will load the Historical Report Module. Try to load Analog History Report and Digital History Report and Alarm History Report.
        </Typography>

        {/* Screenshot */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <img 
            src={WillowlynxHistoricalReportImage} 
            alt="Willowlynx Historical Report" 
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
          <Typography>All reports can be displayed without issues. </Typography>
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

export default WillowlynxHistoricalReport_Details;