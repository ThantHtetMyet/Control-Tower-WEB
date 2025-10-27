import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Paper
} from '@mui/material';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const WillowlynxHistorialTrend_Details = ({ data, disabled = false }) => {
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
      // Handle the API response structure: data.pmServerWillowlynxHistoricalTrends is an array
      let historicalTrendItem = null;
      
      if (data.pmServerWillowlynxHistoricalTrends && Array.isArray(data.pmServerWillowlynxHistoricalTrends)) {
        historicalTrendItem = data.pmServerWillowlynxHistoricalTrends[0];
      } else if (Array.isArray(data)) {
        historicalTrendItem = data[0];
      } else {
        historicalTrendItem = data;
      }
      
      if (historicalTrendItem) {
        // Use YesNoStatusID for result to match the form component pattern
        setResult(historicalTrendItem.YesNoStatusID || historicalTrendItem.yesNoStatusID || historicalTrendItem.result || '');
        setRemarks(historicalTrendItem.Remarks || historicalTrendItem.remarks || '');
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
          <TrendingUpIcon /> Willowlynx Historical Trend Check
        </Typography>

        {/* Instructions */}
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Instructions:
        </Typography>
        <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
          Randomly select some analog measurement points, right click the point and select trend, check if the trend can be successfully displayed without errors.
        </Typography>

        {/* Reference Image */}
        {data?.referenceImagePath && (
          <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
            <img
              src={data.referenceImagePath}
              alt="Willowlynx Historical Trend Reference"
              style={{
                maxWidth: '100%',
                height: 'auto',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </Box>
        )}

        {/* Result */}
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Result:
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, ml: 2, mb: 2 }}>
          <Typography>Trends can be displayed without issues.</Typography>
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

export default WillowlynxHistorialTrend_Details;