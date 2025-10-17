import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

// Import the result status service
import resultStatusService from '../../../api-services/resultStatusService';

const TimeSync_Review = ({ data }) => {
  const [timeSyncData, setTimeSyncData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize data from props
  useEffect(() => {
    if (data) {
      if (data.timeSyncData && data.timeSyncData.length > 0) {
        setTimeSyncData(data.timeSyncData);
      }
      
      if (data.remarks) {
        setRemarks(data.remarks);
      }
    }
  }, [data]);

  // Fetch ResultStatus options for display
  useEffect(() => {
    const fetchResultStatuses = async () => {
      try {
        setLoading(true);
        const response = await resultStatusService.getResultStatuses();
        setResultStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching result status options:', error);
        setResultStatusOptions([
          { id: 'pass', name: 'Pass' },
          { id: 'fail', name: 'Fail' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchResultStatuses();
  }, []);

  // Get result status name by id
  const getResultStatusName = (id) => {
    const status = resultStatusOptions.find(option => option.id === id);
    return status ? status.name : id;
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

  return (
    <Paper sx={sectionContainerStyle}>
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <ScheduleIcon /> SCADA & Historical Time Sync Check
      </Typography>
      
      {/* Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Verify time synchronization between SCADA system and historical database servers.
        </Typography>
        
        <Box sx={{ 
          padding: 2, 
          backgroundColor: '#e8f5e8', 
          borderRadius: 1, 
          border: '1px solid #4caf50',
          marginBottom: 2
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32', marginBottom: 1 }}>
            🕐 Time Sync Check Points:
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            • Compare system time between SCADA and Historical servers
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            • Check NTP service status and configuration
          </Typography>
          <Typography variant="body2">
            • Verify time difference is within acceptable range (±5 seconds)
          </Typography>
        </Box>
      </Box>

      {/* Time Sync Check Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Server Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Current Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>NTP Source</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Time Difference</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSyncData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No time sync data available.
                </TableCell>
              </TableRow>
            ) : (
              timeSyncData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.serverName}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.currentTime}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.ntpSource}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.timeDifference}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={loading ? 'Loading...' : getResultStatusName(row.result)}
                      disabled
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
          placeholder="No remarks provided"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f5f5f5',
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default TimeSync_Review;