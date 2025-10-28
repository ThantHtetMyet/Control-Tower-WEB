import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Import the yes/no status service
import yesNoStatusService from '../../../api-services/yesNoStatusService';
import WillowlynxHistoricalReportImage from '../../../resources/ServerPMReportForm/WillowlynxHistoricalReport.png';

const WillowlynxHistoricalReport_Edit = ({ data, onDataChange, onStatusChange }) => {
  const [dateChecked, setDateChecked] = useState(null);
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data when meaningful data is available
  useEffect(() => {
    // Check if we have meaningful data to initialize with
    const hasData = data && (
      (data.pmServerWillowlynxHistoricalReports && data.pmServerWillowlynxHistoricalReports.length > 0) ||
      data.dateChecked || 
      (data.result && data.result.trim() !== '') || 
      (data.remarks && data.remarks.trim() !== '')
    );
    
    if (hasData && !isInitialized.current) {
      // Handle new API structure with pmServerWillowlynxHistoricalReports
      if (data.pmServerWillowlynxHistoricalReports && data.pmServerWillowlynxHistoricalReports.length > 0) {
        const historicalReportData = data.pmServerWillowlynxHistoricalReports[0];
        
        if (historicalReportData.dateChecked) setDateChecked(new Date(historicalReportData.dateChecked));
        if (historicalReportData.yesNoStatusID) setResult(historicalReportData.yesNoStatusID);
        if (historicalReportData.remarks) setRemarks(historicalReportData.remarks);
      }
      // Handle legacy data structure
      else {
        if (data.dateChecked) setDateChecked(new Date(data.dateChecked));
        if (data.result) setResult(data.result);
        if (data.remarks) setRemarks(data.remarks);
      }
      
      isInitialized.current = true;
    } else if (!hasData && isInitialized.current) {
      // Reset initialization flag when no meaningful data is present
      isInitialized.current = false;
    }
  }, [data]);

  // Fetch YesNoStatus options on component mount
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
        pmServerWillowlynxHistoricalReports: [{
          dateChecked: dateChecked ? dateChecked.toISOString() : null,
          yesNoStatusID: result,
          remarks: remarks
        }],
        // Legacy format for backward compatibility
        dateChecked: dateChecked ? dateChecked.toISOString() : null,
        result: result,
        remarks: remarks
      };
      
      onDataChange(dataToSend);
    }
  }, [dateChecked, result, remarks, onDataChange]);

  // Check completion status
  useEffect(() => {
    const isCompleted = dateChecked && result && remarks.trim() !== '';
    if (onStatusChange) onStatusChange('WillowlynxHistoricalReport', isCompleted);
  }, [dateChecked, result, remarks, onStatusChange]);

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

  return (
    <Paper sx={sectionContainerStyle}>
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <AssessmentIcon /> Willowlynx Historical Report Check
      </Typography>
      
      {/* Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          To check the historical report is working properly by checking the historical report in Willowlynx.
        </Typography>
      </Box>

      {/* Image Section */}
        <Box sx={{ marginBottom: 3, textAlign: 'center' }}>
          <img 
            src={WillowlynxHistoricalReportImage} 
            alt="Willowlynx Historical Report" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }} 
          />
        </Box>

      {/* Result Selection */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
          ✅ Check Result
        </Typography>
        
        <TextField
          fullWidth
          select
          variant="outlined"
          label="Historical Report Status"
          value={result}
          onChange={(e) => setResult(e.target.value)}
          disabled={loading}
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
            }
          }}
        >
          <MenuItem value="">
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                Loading...
              </Box>
            ) : (
              'Select Status'
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
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default WillowlynxHistoricalReport_Edit;