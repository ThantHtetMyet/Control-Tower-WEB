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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';

// Import the hard drive health image
import HardDriveHealthImage from '../../../resources/ServerPMReportForm/HardDriveHealth.png';
// Import the result status service
import resultStatusService from '../../../api-services/resultStatusService';

const HardDriveHealth_Edit = ({ data, onDataChange, onStatusChange }) => {
  const [hardDriveHealthData, setHardDriveHealthData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const isInitialized = useRef(false);
  const onDataChangeRef = useRef(onDataChange);
  const lastDataRef = useRef(null);

  // Keep onDataChange ref updated
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // Initialize data from props when meaningful data is available
  useEffect(() => {
    // Check if data actually changed
    const dataKey = data ? JSON.stringify({ 
      hardDriveHealthData: data.hardDriveHealthData, 
      remarks: data.remarks 
    }) : 'null';
    
    // Skip if data hasn't changed
    if (dataKey === lastDataRef.current) {
      return;
    }
    
    lastDataRef.current = dataKey;
    
    // Only initialize once
    if (isInitialized.current) return;
    
    // Check if we have meaningful data to initialize with
    const hasData = data && ((data.hardDriveHealthData && data.hardDriveHealthData.length > 0) || (data.remarks && data.remarks.trim() !== ''));
    
    if (hasData) {
      if (data.hardDriveHealthData && data.hardDriveHealthData.length > 0) {
        // Map existing data and preserve all tracking flags including isDeleted
        const mappedData = data.hardDriveHealthData.map(item => ({
          id: item.id || null, // preserve existing ID or null for new items
          serverName: item.serverName || '',
          result: item.result || '',
          remarks: item.remarks || '',
          isNew: !item.id, // mark as new if no ID exists
          isModified: item.isModified || false, // preserve modification flag
          isDeleted: item.isDeleted || false // preserve deletion flag
        }));
        setHardDriveHealthData(mappedData);
      }
      if (data.remarks) {
        setRemarks(data.remarks);
      }
    } else {
      // Reset if no data
      setHardDriveHealthData([]);
      setRemarks('');
    }
    
    // Always mark as initialized after first render, even if no data
    // This ensures onDataChange will be called when user fills in data
    isInitialized.current = true;
  }, [data]);

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

  // Update parent component when data changes (but not on initial load)
  useEffect(() => {
    if (isInitialized.current && onDataChangeRef.current) {
      console.log('HardDriveHealth_Edit - Calling onDataChange with:', { hardDriveHealthData, remarks });
      onDataChangeRef.current({
        hardDriveHealthData,
        remarks
      });
    }
  }, [hardDriveHealthData, remarks]); // Removed onDataChange from dependencies to prevent infinite loop

  // Calculate completion status
  useEffect(() => {
    const activeServerData = hardDriveHealthData.filter(server => !server.isDeleted);
    const hasServerData = activeServerData.some(server => 
      server.serverName.trim() !== '' && server.result !== ''
    );
    const hasRemarks = remarks.trim() !== '';
    
    const isCompleted = hasServerData && hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('HardDriveHealth_Edit', isCompleted);
    }
  }, [hardDriveHealthData, remarks, onStatusChange]);

  // Hard Drive Health Check handlers
  const handleHardDriveHealthChange = (index, field, value) => {
    const updatedData = [...hardDriveHealthData];
    const currentItem = updatedData[index];
    
    // Mark as modified if it's an existing item (has ID) and value changed
    const isModified = currentItem.id && currentItem[field] !== value;
    
    updatedData[index] = { 
      ...currentItem, 
      [field]: value,
      isModified: isModified || currentItem.isModified
    };
    setHardDriveHealthData(updatedData);
  };

  // Utility functions for toast messages
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const addHardDriveHealthRow = () => {
    setHardDriveHealthData([...hardDriveHealthData, { 
      id: null, // null indicates new row
      serverName: '', 
      result: '',
      isNew: true // flag to track new rows
    }]);
    showSnackbar('New hard drive health row added');
  };

  const removeHardDriveHealthRow = (index) => {
    const updatedData = [...hardDriveHealthData];
    const itemToRemove = updatedData[index];
    
    // If item has an ID (existing record), mark as deleted instead of removing
    if (itemToRemove.id) {
      updatedData[index] = {
        ...itemToRemove,
        isDeleted: true,
        isModified: true
      };
      showSnackbar('Hard drive health row deleted. Click undo to restore.', 'warning');
    } else {
      // If it's a new item (no ID), remove it completely
      updatedData.splice(index, 1);
      showSnackbar('New hard drive health row removed');
    }
    
    setHardDriveHealthData(updatedData);
  };

  const restoreHardDriveHealthRow = (index) => {
    const updatedData = [...hardDriveHealthData];
    const itemToRestore = updatedData[index];
    
    // Only restore if item is currently deleted
    if (itemToRestore.isDeleted) {
      updatedData[index] = {
        ...itemToRestore,
        isDeleted: false,
        isModified: true // Keep as modified since we're changing the delete status
      };
      setHardDriveHealthData(updatedData);
      showSnackbar('Hard drive health row restored');
    }
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
                <TableRow 
                  key={index}
                  sx={{
                    position: 'relative',
                    opacity: row.isDeleted ? 0.6 : 1,
                    backgroundColor: row.isDeleted ? '#ffebee' : 'transparent',
                    '&::after': row.isDeleted ? {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: '#d32f2f',
                      zIndex: 1,
                      pointerEvents: 'none'
                    } : {}
                  }}
                >
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.serverName}
                      onChange={(e) => handleHardDriveHealthChange(index, 'serverName', e.target.value)}
                      placeholder="Enter server name"
                      size="small"
                      disabled={row.isDeleted}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      select
                      variant="outlined"
                      value={row.result}
                      onChange={(e) => handleHardDriveHealthChange(index, 'result', e.target.value)}
                      size="small"
                      disabled={loading || row.isDeleted}
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
                    {!row.isDeleted ? (
                      <IconButton
                        onClick={() => removeHardDriveHealthRow(index)}
                        color="error"
                        disabled={row.isDeleted}
                        sx={{
                          backgroundColor: row.isDeleted ? 'transparent' : '#ffebee',
                          border: row.isDeleted ? 'none' : '2px solid #f44336',
                          borderRadius: '8px',
                          padding: '12px',
                          minWidth: '48px',
                          minHeight: '48px',
                          boxShadow: row.isDeleted ? 'none' : '0 4px 8px rgba(244, 67, 54, 0.3)',
                          transition: 'all 0.3s ease',
                          animation: row.isDeleted ? 'none' : 'pulse 2s infinite',
                          '&:hover': {
                            backgroundColor: row.isDeleted ? 'transparent' : '#ffcdd2',
                            transform: row.isDeleted ? 'none' : 'scale(1.1)',
                            boxShadow: row.isDeleted ? 'none' : '0 6px 12px rgba(244, 67, 54, 0.4)'
                          },
                          '@keyframes pulse': {
                            '0%': { boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)' },
                            '50%': { boxShadow: '0 6px 16px rgba(244, 67, 54, 0.5)' },
                            '100%': { boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)' }
                          }
                        }}
                      >
                        <DeleteIcon sx={{ 
                          fontSize: '24px',
                          color: row.isDeleted ? '#ccc' : '#f44336'
                        }} />
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={() => restoreHardDriveHealthRow(index)}
                        color="success"
                        sx={{
                          backgroundColor: '#e8f5e8',
                          border: '2px solid #4caf50',
                          borderRadius: '8px',
                          padding: '12px',
                          minWidth: '48px',
                          minHeight: '48px',
                          boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
                          transition: 'all 0.3s ease',
                          animation: 'undoPulse 2s infinite',
                          position: 'relative',
                          zIndex: 2,
                          '&:hover': {
                            backgroundColor: '#c8e6c9',
                            transform: 'scale(1.1)',
                            boxShadow: '0 6px 12px rgba(76, 175, 80, 0.4)'
                          },
                          '@keyframes undoPulse': {
                            '0%': { boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)' },
                            '50%': { boxShadow: '0 6px 16px rgba(76, 175, 80, 0.5)' },
                            '100%': { boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)' }
                          }
                        }}
                      >
                        <UndoIcon sx={{ 
                          fontSize: '24px',
                          color: '#4caf50'
                        }} />
                      </IconButton>
                    )}
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
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Enter any additional remarks or observations..."
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            }
          }}
        />
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default HardDriveHealth_Edit;