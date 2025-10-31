import React, { useState, useEffect, useRef } from 'react';
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
  TextField
} from '@mui/material';
import {
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// Import the result status service
import resultStatusService from '../../../api-services/resultStatusService';

const TimeSync_Edit_Review = ({ data, disabled = true, formData }) => {
  const [timeSyncData, setTimeSyncData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Get status name by ID
  const getStatusName = (id) => {
    const status = resultStatusOptions.find(option => option.ID === id || option.id === id);
    return status ? (status.Name || status.name) : id;
  };

  // Initialize data from props only once
  useEffect(() => {
    if (!isInitialized.current) {
      //console.log('=== TIMESYNC_EDIT_REVIEW DEBUG ===');
      //console.log('Received data:', data);
      //console.log('Received formData:', formData);
      
      // Prioritize formData over data
      if (formData && formData.timeSyncData && formData.timeSyncData.length > 0) {
        //console.log('Using formData.timeSyncData:', formData.timeSyncData);
        setTimeSyncData(formData.timeSyncData);
      } else if (data && data.pmServerTimeSyncs && data.pmServerTimeSyncs.length > 0) {
        //console.log('Using data.pmServerTimeSyncs:', data.pmServerTimeSyncs);
        // Handle API response format
        const timeSyncRecord = data.pmServerTimeSyncs[0];
        if (timeSyncRecord && timeSyncRecord.details && timeSyncRecord.details.length > 0) {
          const mappedData = timeSyncRecord.details.map(detail => ({
            id: detail.id,
            serialNo: detail.serialNo,
            item: detail.serverName,
            timeSyncResult: detail.resultStatusID,
            isDeleted: detail.isDeleted || false,
            isNew: detail.isNew || false,
            isModified: detail.isModified || false,
          }));
          
          // Sort by serialNo (convert to number for proper sorting)
          const sortedData = mappedData.sort((a, b) => {
            const serialA = parseInt(a.serialNo) || 0;
            const serialB = parseInt(b.serialNo) || 0;
            return serialA - serialB;
          });
          
          setTimeSyncData(sortedData);
        }
      } else if (data && data.timeSyncData && data.timeSyncData.length > 0) {
        //console.log('Using data.timeSyncData:', data.timeSyncData);
        setTimeSyncData(data.timeSyncData);
      }
      
      // Get remarks from TimeSync-specific sources ONLY
      //console.log('=== REMARKS DEBUG ===');
      if (formData && formData.timeSyncData && formData.timeSyncData.remarks) {
        //console.log('Setting remarks from formData.timeSyncData.remarks:', formData.timeSyncData.remarks);
        setRemarks(formData.timeSyncData.remarks);
      } else if (data && data.pmServerTimeSyncs && data.pmServerTimeSyncs[0]?.remarks) {
        //console.log('Setting remarks from data.pmServerTimeSyncs[0].remarks:', data.pmServerTimeSyncs[0].remarks);
        setRemarks(data.pmServerTimeSyncs[0].remarks);
      } else if (data && data.remarks) {
        //console.log('Setting remarks from data.remarks:', data.remarks);
        setRemarks(data.remarks);
      } else {
        //console.log('No TimeSync-specific remarks found');
        setRemarks('');
      }
      
      isInitialized.current = true;
    }
  }, [data, formData]);

  // Fetch Result Status options for display
  useEffect(() => {
    const fetchResultStatusOptions = async () => {
      try {
        setLoading(true);
        const response = await resultStatusService.getResultStatuses();
        setResultStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching result status options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResultStatusOptions();
  }, []);

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
                  No data available for this section.
                </TableCell>
              </TableRow>
            ) : (
              timeSyncData
                .filter(row => !row.isDeleted)
                .map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {row.serialNo || index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.item || row.machineName || ''}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000000',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={getStatusName(row.timeSyncResult) || ''}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000000',
                        },
                      }}
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
  );
};

export default TimeSync_Edit_Review;