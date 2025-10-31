import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ServerPMReportFormSignOff_Edit = ({ data, onDataChange, onStatusChange }) => {
  const [attendedBy, setAttendedBy] = useState('');
  const [witnessedBy, setWitnessedBy] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [completionDate, setCompletionDate] = useState(null);
  const [remarks, setRemarks] = useState('');
  const isInitialized = useRef(false);

  // Initialize data from props when meaningful data is available
  useEffect(() => {
    // Check if we have meaningful data to initialize with
    const hasData = data && (data.attendedBy || data.witnessedBy || data.startDate || data.completionDate || data.remarks);
    
    if (hasData && !isInitialized.current) {
      if (data.attendedBy) {
        setAttendedBy(data.attendedBy);
      }
      if (data.witnessedBy) {
        setWitnessedBy(data.witnessedBy);
      }
      if (data.startDate) {
        setStartDate(data.startDate);
      }
      if (data.completionDate) {
        setCompletionDate(data.completionDate);
      }
      if (data.remarks) {
        setRemarks(data.remarks);
      }
      isInitialized.current = true;
    }
  }, [data]);

  // Update parent component when data changes (but not on initial load)
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      onDataChange({
        attendedBy,
        witnessedBy,
        startDate,
        completionDate,
        remarks
      });
    }
  }, [attendedBy, witnessedBy, startDate, completionDate, remarks, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const isCompleted = attendedBy.trim() !== '' && 
                       witnessedBy.trim() !== '' && 
                       startDate !== null && 
                       completionDate !== null && 
                       remarks.trim() !== '';
    
    if (onStatusChange) {
      onStatusChange('ServerPMReportFormSignOff_Edit', isCompleted);
    }
  }, [attendedBy, witnessedBy, startDate, completionDate, remarks, onStatusChange]);

  // Styling constants matching ServerHealth component
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={sectionContainerStyle}>
        <Typography variant="h5" sx={sectionHeaderStyle}>
          <AssignmentIcon /> Sign Off Information
        </Typography>

        {/* Personnel Information Container */}
        <Box sx={{ marginBottom: 3, padding: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
            👥 Personnel Information
          </Typography>
          
          <TextField
            fullWidth
            variant="outlined"
            label="Attended By"
            value={attendedBy}
            onChange={(e) => setAttendedBy(e.target.value)}
            placeholder="Enter maintenance personnel name"
            sx={{
              marginBottom: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              }
            }}
          />
          
          <TextField
            fullWidth
            variant="outlined"
            label="Approved By"
            value={witnessedBy}
            onChange={(e) => setWitnessedBy(e.target.value)}
            placeholder="Enter approver name"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              }
            }}
          />
        </Box>

        {/* Maintenance Timeline Container */}
        <Box sx={{ marginBottom: 3, padding: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
            ⏰ Maintenance Timeline
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DateTimePicker
                label="Start Date/Time *"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <DateTimePicker
                label="Completion Date/Time *"
                value={completionDate}
                onChange={(newValue) => setCompletionDate(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                      }
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
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
    </LocalizationProvider>
  );
};

export default ServerPMReportFormSignOff_Edit;