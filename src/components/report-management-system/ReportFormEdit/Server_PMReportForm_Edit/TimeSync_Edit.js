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
  Button,
  IconButton,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';

// Import the result status service
import resultStatusService from '../../../api-services/resultStatusService';

const TimeSync_Edit = ({ data, onDataChange, onStatusChange }) => {
  const [timeSyncData, setTimeSyncData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const isInitialized = useRef(false);

  // Initialize data from props when meaningful data is available
  useEffect(() => {
    // Check if we have meaningful data to initialize with
    const hasData = data && (
      (Array.isArray(data) && data.length > 0) ||
      (data.pmServerTimeSyncs && data.pmServerTimeSyncs.length > 0) ||
      (data.timeSyncData && data.timeSyncData.length > 0) ||
      (data.remarks && data.remarks.trim() !== '')
    );
    
    if (hasData && !isInitialized.current) {
      // Handle API response format (from ServerPMReportForm_Edit)
      if (data.pmServerTimeSyncs && Array.isArray(data.pmServerTimeSyncs)) {
        const timeSyncRecord = data.pmServerTimeSyncs[0];
        
        // Initialize time sync data from details array
        if (timeSyncRecord && timeSyncRecord.details && timeSyncRecord.details.length > 0) {
          const mappedData = timeSyncRecord.details.map(detail => ({
            id: detail.id || null,
            machineName: detail.serverName || '',
            timeSyncResult: detail.resultStatusID || '',
            serialNo: detail.serialNo || '',
            isNew: !detail.id,
            isModified: false,
            isDeleted: false
          }));
          
          // Sort by serialNo (convert to number for proper sorting)
          const sortedData = mappedData.sort((a, b) => {
            const serialA = parseInt(a.serialNo) || 0;
            const serialB = parseInt(b.serialNo) || 0;
            return serialA - serialB;
          });
          
          setTimeSyncData(sortedData);
          console.log('TimeSync_Edit - Mapped and sorted data from API:', sortedData);
        }
        
        // Set remarks from the time sync record
        if (timeSyncRecord.remarks) {
          setRemarks(timeSyncRecord.remarks);
        }
      }
      // Handle direct timeSyncData format
      else if (data.timeSyncData && data.timeSyncData.length > 0) {
        const mappedData = data.timeSyncData.map((item, index) => ({
          id: item.id || null,
          machineName: item.machineName || '',
          timeSyncResult: item.timeSyncResult || '',
          serialNo: item.serialNo || (index + 1).toString(),
          isNew: !item.id,
          isModified: item.isModified || false,
          isDeleted: item.isDeleted || false
        }));
        
        // Sort by serialNo (convert to number for proper sorting)
        const sortedData = mappedData.sort((a, b) => {
          const serialA = parseInt(a.serialNo) || 0;
          const serialB = parseInt(b.serialNo) || 0;
          return serialA - serialB;
        });
        
        setTimeSyncData(sortedData);
      }
      
      // Handle direct remarks from data object
      if (data.remarks) {
        setRemarks(data.remarks);
      }
      
      isInitialized.current = true;
    }
  }, [data]);

  // Fetch ResultStatus options on component mount
  useEffect(() => {
    const fetchResultStatuses = async () => {
      try {
        setLoading(true);
        const response = await resultStatusService.getResultStatuses();
        setResultStatusOptions(response || []);
      } catch (error) {
        // console.error('Error fetching result status options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResultStatuses();
  }, []);

  // Update parent component when data changes (but not on initial load)
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      onDataChange({
        timeSyncData,
        remarks
      });
    }
  }, [timeSyncData, remarks, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const activeTimeSyncData = timeSyncData.filter(item => !item.isDeleted);
    const hasTimeSyncData = activeTimeSyncData.some(item => 
      item.machineName && item.machineName.trim() !== '' && item.timeSyncResult !== ''
    );
    const hasRemarks = remarks && remarks.trim() !== '';
    
    const isCompleted = hasTimeSyncData && hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('TimeSync_Edit', isCompleted);
    }
  }, [timeSyncData, remarks, onStatusChange]);

  // Utility functions for undo functionality
  const saveToUndoStack = (action, data) => {
    setUndoStack(prev => [...prev, { action, data, timestamp: Date.now() }]);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Time Sync handlers
  const handleTimeSyncChange = (index, field, value) => {
    const updatedData = [...timeSyncData];
    const currentItem = updatedData[index];
    
    // Mark as modified if it's an existing item (has ID) and value changed
    const isModified = currentItem.id && currentItem[field] !== value;
    
    updatedData[index] = { 
      ...currentItem, 
      [field]: value,
      isModified: isModified || currentItem.isModified
    };
    setTimeSyncData(updatedData);
  };

  const addTimeSyncRow = () => {
    const newRow = { 
      id: null, // null indicates new row
      machineName: '', 
      timeSyncResult: '',
      serialNo: (timeSyncData.length + 1).toString(),
      isNew: true, // flag to track new rows
      isModified: false,
      isDeleted: false
    };
    setTimeSyncData([...timeSyncData, newRow]);
    showSnackbar('New time sync item added');
  };

  const removeTimeSyncRow = (index) => {
    const updatedData = [...timeSyncData];
    const itemToRemove = updatedData[index];
    
    // Save current state for undo
    saveToUndoStack('delete', { index, item: { ...itemToRemove } });
    
    // If item has an ID (existing record), mark as deleted instead of removing
    if (itemToRemove.id) {
      updatedData[index] = {
        ...itemToRemove,
        isDeleted: true,
        isModified: true
      };
      showSnackbar('Time sync item deleted. Click undo to restore.', 'warning');
    } else {
      // If it's a new item (no ID), remove it completely
      updatedData.splice(index, 1);
      showSnackbar('New time sync item removed');
    }
    
    setTimeSyncData(updatedData);
  };

  const restoreTimeSyncRow = (index) => {
    const updatedData = [...timeSyncData];
    const itemToRestore = updatedData[index];
    
    // Only restore if item is currently deleted
    if (itemToRestore.isDeleted) {
      updatedData[index] = {
        ...itemToRestore,
        isDeleted: false,
        isModified: true // Keep as modified since we're changing the delete status
      };
      setTimeSyncData(updatedData);
      showSnackbar('Time sync item restored');
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
        <ScheduleIcon /> SCADA & Historical Time Sync
      </Typography>
      
      {/* Time Sync Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          To check the time sync for SCADA server, Historical server, and HMIs by using command line w32tm /query /status. To be within 5 minutes tolerance
        </Typography>
      </Box>

      {/* Add Item Button */}
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addTimeSyncRow}
        sx={{ marginBottom: 2 }}
      >
        Add Machine
      </Button>

      {/* Time Sync Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Machine Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Time Sync Result</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSyncData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No machines added yet. Click "Add Machine" to get started.
                </TableCell>
              </TableRow>
            ) : (
              timeSyncData.map((row, index) => (
                <TableRow 
                  key={row.id || `timeSync-${index}`}
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
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {row.serialNo || index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.machineName}
                      onChange={(e) => handleTimeSyncChange(index, 'machineName', e.target.value)}
                      placeholder="Enter machine name"
                      size="small"
                      disabled={row.isDeleted}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      select
                      variant="outlined"
                      value={row.timeSyncResult}
                      onChange={(e) => handleTimeSyncChange(index, 'timeSyncResult', e.target.value)}
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
                          'Select Status'
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
                        onClick={() => removeTimeSyncRow(index)}
                        color="error"
                        title="Delete machine"
                        sx={{
                          backgroundColor: '#ffebee',
                          border: '2px solid #f44336',
                          borderRadius: '8px',
                          padding: '12px',
                          minWidth: '48px',
                          minHeight: '48px',
                          boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)',
                          transition: 'all 0.3s ease',
                          animation: 'pulse 2s infinite',
                          '&:hover': {
                            backgroundColor: '#ffcdd2',
                            transform: 'scale(1.1)',
                            boxShadow: '0 6px 12px rgba(244, 67, 54, 0.4)'
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
                          color: '#f44336'
                        }} />
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={() => restoreTimeSyncRow(index)}
                        title="Restore machine"
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
                          zIndex: 2, // Above the strikethrough line
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
            },
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

export default TimeSync_Edit;