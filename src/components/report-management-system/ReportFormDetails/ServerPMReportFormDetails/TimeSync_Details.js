import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import resultStatusService from '../../../api-services/resultStatusService';

const TimeSync_Details = ({ data, disabled = false }) => {
  const [timeSyncData, setTimeSyncData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);

  useEffect(() => {
    const fetchResultStatusOptions = async () => {
      try {
        const options = await resultStatusService.getResultStatuses();
        setResultStatusOptions(options || []);
      } catch (error) {
        console.error('Error fetching result status options:', error);
      }
    };

    fetchResultStatusOptions();
  }, []);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      // Handle case where data is the pmServerTimeSyncs array directly
      const transformedData = [];
      data.forEach(record => {
        if (record.details && record.details.length > 0) {
          record.details.forEach(detail => {
            transformedData.push({
              machineName: detail.serverName || '',
              timeSyncResult: detail.resultStatusID || '',
              resultStatusName: detail.resultStatusName || '',
              serialNo: detail.serialNo
            });
          });
        }
      });
      setTimeSyncData(transformedData);
      
      // Get remarks from the first record
      if (data[0] && data[0].remarks) {
        setRemarks(data[0].remarks);
      }
    } else if (data && data.timeSyncData && data.timeSyncData.length > 0) {
      setTimeSyncData(data.timeSyncData);
      if (data.remarks) {
        setRemarks(data.remarks);
      }
    }
  }, [data]);

  const getResultStatusName = (statusId) => {
    if (!statusId) return 'N/A';
    const status = resultStatusOptions.find(option => option.id === statusId);
    return status ? status.name : statusId;
  };

  const getStatusColor = (statusName) => {
    if (!statusName) return 'default';
    
    const statusLower = statusName.toString().toLowerCase();
    
    if (statusLower.includes('pass') || statusLower.includes('ok') || statusLower.includes('good') || statusLower.includes('success')) {
      return 'success';
    } else if (statusLower.includes('fail') || statusLower.includes('error') || statusLower.includes('bad') || statusLower.includes('critical')) {
      return 'error';
    } else if (statusLower.includes('warning') || statusLower.includes('caution') || statusLower.includes('pending')) {
      return 'warning';
    }
    
    return 'default';
  };

  const fieldStyle = {
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000',
      color: '#000000'
    },
    '& .MuiInputLabel-root.Mui-disabled': {
      color: '#666666'
    }
  };

  // Styling to match TimeSync.js
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
        <ScheduleIcon /> SCADA & Historical Time Sync
      </Typography>
      
      {/* Time Sync Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          To check the time sync for SCADA server, Historical server, and HMIs by using command line w32tm /query /status. To be within 5 minutes tolerance
        </Typography>
      </Box>

      {/* Time Sync Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Machine Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Time Sync Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSyncData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No time sync data available
                </TableCell>
              </TableRow>
            ) : (
              timeSyncData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {row.serialNo || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {row.machineName || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {row.timeSyncResult ? (
                      <Chip 
                        label={row.resultStatusName || getResultStatusName(row.timeSyncResult)} 
                        color={getStatusColor(row.resultStatusName || getResultStatusName(row.timeSyncResult))} 
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Remarks Section */}
      {remarks && (
        <Box sx={{ marginTop: 3 }}>
          <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
            📝 Remarks
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            label="Remarks"
            value={remarks}
            disabled={disabled}
            sx={fieldStyle}
          />
        </Box>
      )}
    </Paper>
  );
};

export default TimeSync_Details;