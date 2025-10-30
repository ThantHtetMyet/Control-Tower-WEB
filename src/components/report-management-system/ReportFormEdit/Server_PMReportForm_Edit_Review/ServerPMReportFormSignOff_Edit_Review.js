import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const ServerPMReportFormSignOff_Edit_Review = ({ data, disabled = true, formData }) => {
  const [signOffData, setSignOffData] = useState({
    attendedBy: '',
    witnessedBy: '',
    startDate: '',
    completionDate: '',
    approvedBy: '',
    remarks: ''
  });
  const isInitialized = useRef(false);

  // Initialize data from props only once
  useEffect(() => {
    if (!isInitialized.current) {
      // Initialize data from props - Following reference pattern
  const initialData = {
    attendedBy: data?.attendedBy || '',
    witnessedBy: data?.witnessedBy || '',
    startDate: data?.startDate || '',
    completionDate: data?.completionDate || '',
    approvedBy: data?.approvedBy || '',
    remarks: data?.remark || ''
  };
      
      setSignOffData(initialData);
      isInitialized.current = true;
    }
  }, [data, formData]);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

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

  // Styling constants matching ServerPMReportFormSignOff_Edit
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
            value={signOffData.attendedBy}
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
            value={signOffData.witnessedBy}
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
            value={formatDateTime(signOffData.startDate)}
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
            value={formatDateTime(signOffData.completionDate)}
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
            value={signOffData.remarks}
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

export default ServerPMReportFormSignOff_Edit_Review;