import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const ServerPMReportFormSignOff_Review = ({ data, disabled = true, formData }) => {
  const [attendedBy, setAttendedBy] = useState('');
  const [witnessedBy, setWitnessedBy] = useState('');
  const [startDateTime, setStartDateTime] = useState(null);
  const [completionDateTime, setCompletionDateTime] = useState(null);
  const [remark, setRemark] = useState('');
  const isInitialized = useRef(false);

  // Initialize data from props only once
  useEffect(() => {
    if (!isInitialized.current) {
      // Handle case where data is passed directly or nested
      const signOffData = data || {};
      
      if (signOffData.attendedBy) {
        setAttendedBy(signOffData.attendedBy);
      }
      if (signOffData.witnessedBy) {
        setWitnessedBy(signOffData.witnessedBy);
      }
      if (signOffData.startDateTime) {
        setStartDateTime(signOffData.startDateTime);
      }
      if (signOffData.completionDateTime) {
        setCompletionDateTime(signOffData.completionDateTime);
      }
      if (signOffData.remark) {
        setRemark(signOffData.remark);
      }
      
      isInitialized.current = true;
    }
  }, [data, formData]);

  const disabledFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f9f9f9',
      '& fieldset': {
        borderColor: '#e0e0e0'
      }
    },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#666 !important',
      color: '#666 !important'
    }
  };

  // Styling constants matching other review components
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

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    try {
      return format(new Date(dateTime), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return dateTime.toString();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={sectionContainerStyle}>
        <Typography variant="h5" sx={sectionHeaderStyle}>
          <AssignmentIcon /> Sign Off Information
        </Typography>

        {/* Approval Information Container */}
        <Box sx={{ marginBottom: 3, padding: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
            ✅ Approval Information
          </Typography>
          
          <TextField
            fullWidth
            variant="outlined"
            label="Attended By"
            value={attendedBy}
            disabled={disabled}
            placeholder="Enter maintenance personnel name"
            sx={{
              marginBottom: 2,
              ...disabledFieldStyle
            }}
          />
          
          <TextField
            fullWidth
            variant="outlined"
            label="Approved By"
            value={witnessedBy}
            disabled={disabled}
            placeholder="Enter approver name"
            sx={{
              ...disabledFieldStyle
            }}
          />
        </Box>

        {/* Maintenance Timeline Container */}
        <Box sx={{ marginBottom: 3, padding: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
            ⏰ Maintenance Timeline
          </Typography>
          
          <TextField
            fullWidth
            variant="outlined"
            label="Start Date/Time"
            value={formatDateTime(startDateTime)}
            disabled={disabled}
            sx={{
              marginBottom: 2,
              ...disabledFieldStyle
            }}
          />
          
          <TextField
            fullWidth
            variant="outlined"
            label="Completion Date/Time"
            value={formatDateTime(completionDateTime)}
            disabled={disabled}
            sx={{
              ...disabledFieldStyle
            }}
          />
        </Box>

        {/* Remarks Container */}
        <Box sx={{ padding: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
            📝 Remarks
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Additional Remarks"
            value={remark}
            disabled={disabled}
            placeholder="Enter any additional remarks or observations..."
            sx={{
              ...disabledFieldStyle
            }}
          />
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default ServerPMReportFormSignOff_Review;