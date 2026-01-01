import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

// Import the hard drive health image
import HardDriveHealthImage from '../../../resources/ServerPMReportForm/HardDriveHealth.png';
import resultStatusService from '../../../api-services/resultStatusService';
// Import the warehouse service
import warehouseService from '../../../api-services/warehouseService';

const HardDriveHealth = ({ data, stationNameWarehouseID, onDataChange, onStatusChange }) => {
  const [hardDriveHealthData, setHardDriveHealthData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [serverHostNameOptions, setServerHostNameOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingServerHostNames, setLoadingServerHostNames] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data from props only once
  useEffect(() => {
    if (data && !isInitialized.current) {
      if (data.hardDriveHealthData && data.hardDriveHealthData.length > 0) {
        setHardDriveHealthData(data.hardDriveHealthData);
      }
      if (data.remarks) {
        setRemarks(data.remarks);
      }
      isInitialized.current = true;
    }
  }, [data]);

  // Fetch ResultStatus options
  useEffect(() => {
    const fetchResultStatusOptions = async () => {
      try {
        const options = await resultStatusService.getResultStatuses();
        setResultStatusOptions(options);
      } catch (error) {
        console.error('Error fetching ResultStatus options:', error);
        // Fallback to default options
        setResultStatusOptions([
          { id: '1', name: 'Pass' },
          { id: '2', name: 'Fail' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchResultStatusOptions();
  }, []);

  // Fetch Server Host Name options when stationNameWarehouseID is available
  useEffect(() => {
    const fetchServerHostNames = async () => {
      if (!stationNameWarehouseID) {
        setServerHostNameOptions([]);
        return;
      }

      try {
        setLoadingServerHostNames(true);
        const response = await warehouseService.getServerHostNameWarehouses(stationNameWarehouseID);
        setServerHostNameOptions(response || []);
      } catch (error) {
        console.error('Error fetching server host name options:', error);
        setServerHostNameOptions([]);
      } finally {
        setLoadingServerHostNames(false);
      }
    };

    fetchServerHostNames();
  }, [stationNameWarehouseID]);

  // Update parent component when data changes (but not on initial load)
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      onDataChange({
        hardDriveHealthData,
        remarks
      });
    }
  }, [hardDriveHealthData, remarks, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const hasServerData = hardDriveHealthData.some(server => 
      server.serverName.trim() !== '' && server.result !== ''
    );
    const hasRemarks = remarks.trim() !== '';
    
    const isCompleted = hasServerData && hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('HardDriveHealth', isCompleted);
    }
  }, [hardDriveHealthData, remarks, onStatusChange]);

  // Hard Drive Health Check handlers
  const handleHardDriveHealthChange = (index, field, value) => {
    const updatedData = [...hardDriveHealthData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setHardDriveHealthData(updatedData);
  };

  const addHardDriveHealthRow = () => {
    setHardDriveHealthData([...hardDriveHealthData, { serverName: '', result: '' }]);
  };

  const removeHardDriveHealthRow = (index) => {
    const updatedData = hardDriveHealthData.filter((_, i) => i !== index);
    setHardDriveHealthData(updatedData);
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
        <StorageIcon /> Hard Drive Health Check
      </Typography>
      
      {/* Hard Drive Health Check Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Check Hard Drive Health Status LED, LED in solid/blinking green, which indicates healthy.
        </Typography>
        
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
          Check if the LED is in solid/blinking green
        </Typography>
      </Box>

      {/* Add Server Button */}
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addHardDriveHealthRow}
        sx={{ marginBottom: 2 }}
      >
        Add Server
      </Button>

      {/* Hard Drive Health Check Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Server Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Result</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hardDriveHealthData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No servers added yet. Click "Add Server" to get started.
                </TableCell>
              </TableRow>
            ) : (
              hardDriveHealthData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      select
                      variant="outlined"
                      value={row.serverName || ''}
                      onChange={(e) => handleHardDriveHealthChange(index, 'serverName', e.target.value)}
                      placeholder="Select server name"
                      size="small"
                      disabled={loadingServerHostNames || !stationNameWarehouseID}
                      sx={{
                        minWidth: 200,
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                        }
                      }}
                    >
                      <MenuItem value="">
                        {loadingServerHostNames ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={16} />
                            Loading...
                          </Box>
                        ) : !stationNameWarehouseID ? (
                          'Please select Station Name first'
                        ) : (
                          'Select Server Name'
                        )}
                      </MenuItem>
                      {serverHostNameOptions.map((option) => (
                        <MenuItem key={option.id} value={option.name}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      select
                      variant="outlined"
                      value={row.result}
                      onChange={(e) => handleHardDriveHealthChange(index, 'result', e.target.value)}
                      size="small"
                      disabled={loading}
                      sx={{
                        minWidth: 120,
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
                          'Select Result'
                        )}
                      </MenuItem>
                      {resultStatusOptions.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => removeHardDriveHealthRow(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Additional Information */}
      <Box sx={{ marginTop: 3, marginBottom: 3 }}>
        <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#666' }}>
          If LED is in flashing amber, the hard drive is in predictive failure or already failed, replace the hard drive.
        </Typography>
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
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default HardDriveHealth;