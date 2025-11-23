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
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ServerPMReportFormSignOff = ({ data, onDataChange, onStatusChange, formStatusOptions = [], formstatusID = '', onFormStatusChange }) => {
  const [attendedBy, setAttendedBy] = useState('');
  const [witnessedBy, setWitnessedBy] = useState('');
  const [startDateTime, setStartDateTime] = useState(null);
  const [completionDateTime, setCompletionDateTime] = useState(null);
  const [remark, setRemark] = useState('');
  const hasMountedRef = useRef(false);
  const onDataChangeRef = useRef(onDataChange);

  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // Initialize data from props
  useEffect(() => {
    if (!data) return;
    if (data.attendedBy !== undefined) {
      setAttendedBy(data.attendedBy || '');
    }
    if (data.witnessedBy !== undefined) {
      setWitnessedBy(data.witnessedBy || '');
    }
    if (data.startDateTime !== undefined || data.startDate !== undefined) {
      setStartDateTime(data.startDateTime || data.startDate || null);
    }
    if (data.completionDateTime !== undefined || data.completionDate !== undefined) {
      setCompletionDateTime(data.completionDateTime || data.completionDate || null);
    }
    if (data.remark !== undefined || data.remarks !== undefined) {
      setRemark(data.remark || data.remarks || '');
    }
  }, [data]);

  // Update parent component when data changes (skip first mount)
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (onDataChangeRef.current) {
      onDataChangeRef.current({
        attendedBy,
        witnessedBy,
        startDateTime,
        completionDateTime,
        remark
      });
    }
  }, [attendedBy, witnessedBy, startDateTime, completionDateTime, remark]);

  // Calculate completion status
  useEffect(() => {
    const isCompleted = attendedBy.trim() !== '' && 
                       witnessedBy.trim() !== '' && 
                       startDateTime !== null && 
                       completionDateTime !== null && 
                       remark.trim() !== '';
    
    if (onStatusChange) {
      onStatusChange('ServerPMReportFormSignOff', isCompleted);
    }
  }, [attendedBy, witnessedBy, startDateTime, completionDateTime, remark, onStatusChange]);

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
          <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon fontSize="small" />
            Personnel Information
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
          <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon fontSize="small" />
            Maintenance Timeline
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DateTimePicker
                label="Start Date/Time *"
                value={startDateTime}
                onChange={(newValue) => setStartDateTime(newValue)}
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
                value={completionDateTime}
                onChange={(newValue) => setCompletionDateTime(newValue)}
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
          <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatBubbleOutlineIcon fontSize="small" />
            Remarks
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Remarks"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
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

export default ServerPMReportFormSignOff;
