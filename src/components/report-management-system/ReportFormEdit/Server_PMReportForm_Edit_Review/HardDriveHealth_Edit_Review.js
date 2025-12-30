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
  TextField,
  CircularProgress
} from '@mui/material';
import {
  Storage as StorageIcon,
} from '@mui/icons-material';

// Import the hard drive health image
import HardDriveHealthImage from '../../../resources/ServerPMReportForm/HardDriveHealth.png';
// Import the result status service
import resultStatusService from '../../../api-services/resultStatusService';

const HardDriveHealth_Edit_Review = ({ data, disabled = true, formData }) => {
  const [hardDriveHealthData, setHardDriveHealthData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data from props only once
  useEffect(() => {
    if (!isInitialized.current) {
      let driveData = [];
      let remarksData = '';
      
      if (Array.isArray(data) && data.length > 0) {
        driveData = data;
      } else if (data && data.pmServerHardDriveHealths) {
        // Handle transformed format: pmServerHardDriveHealths is array with [{ details: [...], remarks: '' }]
        if (Array.isArray(data.pmServerHardDriveHealths) && data.pmServerHardDriveHealths.length > 0) {
          const firstItem = data.pmServerHardDriveHealths[0];
          // Check if it has details array (transformed format from Edit)
          if (firstItem.details && Array.isArray(firstItem.details)) {
            driveData = firstItem.details;
            remarksData = firstItem.remarks || '';
          } else {
            // Legacy format: array of drive objects
            driveData = data.pmServerHardDriveHealths;
          }
        }
        // Get remarks from top level if not found in details
        if (!remarksData && data.remarks) {
          remarksData = data.remarks;
        }
      } else if (data && data.hardDriveHealthData && Array.isArray(data.hardDriveHealthData)) {
        driveData = data.hardDriveHealthData;
        remarksData = data.remarks || '';
      }
      
      setHardDriveHealthData(driveData);
      
      if (formData && formData.hardDriveHealthRemarks) {
        setRemarks(formData.hardDriveHealthRemarks);
      } else if (remarksData) {
        setRemarks(remarksData);
      } else if (data && data.remarks) {
        setRemarks(data.remarks);
      }
      
      isInitialized.current = true;
    }
  }, [data, formData]);

  // Fetch ResultStatus options on component mount
  useEffect(() => {
    const fetchResultStatuses = async () => {
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

    fetchResultStatuses();
  }, []);

  // Get status name by ID
  const getStatusName = (id, options) => {
    const status = options.find(option => option.ID === id || option.id === id);
    return status ? (status.Name || status.name) : id;
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

  // Styling to match reference component
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
        <StorageIcon /> Hard Drive Health Check
      </Typography>
      
      {/* Hard Drive Health Check Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Using Computer Management
        </Typography>
        
        <Box sx={{ marginLeft: 2, marginBottom: 2 }}>
          <Typography variant="body2" component="div">
            • From Control Panel→Administration Tools→Computer Management<br/>
            • Click on the Storage→Disk Management. Check the Status for all the hard disk
          </Typography>
        </Box>
        
        {/* Hard Drive Health Image */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: 2,
          padding: 2,
          backgroundColor: '#f8f9fa',
          borderRadius: 1,
          border: '1px solid #e9ecef'
        }}>
          <img 
            src={HardDriveHealthImage} 
            alt="Hard Drive Health Check Diagram" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              maxHeight: '400px'
            }} 
          />
        </Box>
        
        <Typography variant="body1" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
          Check if the LED is in solid/blinking green.
        </Typography>
        
        <Typography variant="body2" sx={{ marginBottom: 2, fontStyle: 'italic', color: '#666' }}>
          If LED is in flashing amber, the hard drive is in predictive failure or already failed, replace the hard drive.
        </Typography>
      </Box>

      {/* Hard Drive Health Check Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Server Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hardDriveHealthData && hardDriveHealthData.length > 0 ? (
              hardDriveHealthData
                .filter(drive => !drive.isDeleted)
                .map((drive, index) => (
                  <TableRow key={drive.id || index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={drive.serverName || drive.driveName || ''}
                        disabled
                        sx={disabledFieldStyle}
                        size="small"
                        placeholder="Enter server name"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={getStatusName(drive.result || drive.resultStatusID, resultStatusOptions)}
                        disabled
                        sx={disabledFieldStyle}
                        size="small"
                        placeholder="Select Result"
                      />
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No servers added yet.
                </TableCell>
              </TableRow>
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
          value={remarks}
          disabled
          sx={disabledFieldStyle}
          placeholder="No remarks provided"
          variant="outlined"
        />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Paper>
  );
};

export default HardDriveHealth_Edit_Review;