import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid
} from '@mui/material';
import {
  DoneAll as DoneAllIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ServerPMReportFormSignOff = ({ data, onDataChange, onStatusChange }) => {
  const [attendedBy, setAttendedBy] = useState('');
  const [witnessedBy, setWitnessedBy] = useState('');
  const [startDateTime, setStartDateTime] = useState(null);
  const [completionDateTime, setCompletionDateTime] = useState(null);
  const [remark, setRemark] = useState('');
  const hasMountedRef = useRef(false);
  const onDataChangeRef = useRef(onDataChange);
  const lastDataRef = useRef(null);

  const parseDateValue = (value) => {
    if (!value) return null;
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const areDatesEqual = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.getTime() === b.getTime();
  };

  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  useEffect(() => {
    if (!data || lastDataRef.current === data) return;

    const nextAttended = data.attendedBy ?? '';
    const nextWitnessed = data.witnessedBy ?? '';
    const nextStart = parseDateValue(data.startDateTime ?? data.startDate ?? null);
    const nextCompletion = parseDateValue(data.completionDateTime ?? data.completionDate ?? null);
    const nextRemark = data.remark ?? data.remarks ?? '';

    if (nextAttended !== attendedBy) {
      setAttendedBy(nextAttended);
    }
    if (nextWitnessed !== witnessedBy) {
      setWitnessedBy(nextWitnessed);
    }
    if (!areDatesEqual(nextStart, startDateTime)) {
      setStartDateTime(nextStart);
    }
    if (!areDatesEqual(nextCompletion, completionDateTime)) {
      setCompletionDateTime(nextCompletion);
    }
    if (nextRemark !== remark) {
      setRemark(nextRemark);
    }

    lastDataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (onDataChangeRef.current) {
      const nextPayload = {
        attendedBy,
        witnessedBy,
        startDateTime,
        completionDateTime,
        remark
      };
      onDataChangeRef.current(nextPayload);
      lastDataRef.current = nextPayload;
    }
  }, [attendedBy, witnessedBy, startDateTime, completionDateTime, remark]);

  useEffect(() => {
    const isCompleted =
      attendedBy.trim() !== '' &&
      witnessedBy.trim() !== '' &&
      startDateTime !== null &&
      completionDateTime !== null &&
      remark.trim() !== '';

    if (onStatusChange) {
      onStatusChange('ServerPMReportFormSignOff', isCompleted);
    }
  }, [attendedBy, witnessedBy, startDateTime, completionDateTime, remark, onStatusChange]);

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
          <DoneAllIcon /> Sign-Off Information
        </Typography>

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
            sx={{ marginBottom: 2, '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
          />

          <TextField
            fullWidth
            variant="outlined"
            label="Approved By"
            value={witnessedBy}
            onChange={(e) => setWitnessedBy(e.target.value)}
            placeholder="Enter approver name"
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
          />
        </Box>

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
                  <TextField {...params} fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }} />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <DateTimePicker
                label="Completion Date/Time *"
                value={completionDateTime}
                onChange={(newValue) => setCompletionDateTime(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }} />
                )}
              />
            </Grid>
          </Grid>
        </Box>

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
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
          />
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default ServerPMReportFormSignOff;
