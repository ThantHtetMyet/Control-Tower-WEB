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
  Divider,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  SystemUpdate as SystemUpdateIcon,
  Undo as UndoIcon
} from '@mui/icons-material';

// Import the software patch image
import ServerHealthImage from '../../../resources/ServerPMReportForm/ServerHealth.png';

const SoftwarePatch_Edit = ({ data, onDataChange, onStatusChange }) => {
  const [softwarePatchData, setSoftwarePatchData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const isInitialized = useRef(false);

  // Initialize data from props when meaningful data is available
  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) return;
    
    // Check if we have meaningful data to initialize with
    const hasData = data && (
      (Array.isArray(data) && data.length > 0) ||
      (data.pmServerSoftwarePatchSummaries && data.pmServerSoftwarePatchSummaries.length > 0) ||
      (data.softwarePatchData && data.softwarePatchData.length > 0) ||
      (data.remarks && data.remarks.trim() !== '')
    );
    
    if (hasData) {
      // Handle API response format (from ServerPMReportForm_Edit)
      if (data.pmServerSoftwarePatchSummaries && Array.isArray(data.pmServerSoftwarePatchSummaries)) {
        const softwarePatchRecord = data.pmServerSoftwarePatchSummaries[0];
        
        // Initialize software patch data from details array
        if (softwarePatchRecord && softwarePatchRecord.details && softwarePatchRecord.details.length > 0) {
          const mappedData = softwarePatchRecord.details.map(detail => ({
            id: detail.id || null,
            serialNo: detail.serialNo || '',
            machineName: detail.serverName || '',
            previousPatch: detail.previousPatch || '',
            currentPatch: detail.currentPatch || '',
            remarks: detail.remarks || '',
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
          
          setSoftwarePatchData(sortedData);
          console.log('SoftwarePatch_Edit - Mapped and sorted data from API:', sortedData);
        }
        
        // Set remarks from the software patch record
        if (softwarePatchRecord.remarks) {
          setRemarks(softwarePatchRecord.remarks);
        }
      }
      // Handle direct softwarePatchData format
      else if (data.softwarePatchData && data.softwarePatchData.length > 0) {
        const mappedData = data.softwarePatchData.map((item, index) => ({
          id: item.id || null,
          serialNo: item.serialNo || (index + 1).toString(),
          machineName: item.machineName || '',
          previousPatch: item.previousPatch || '',
          currentPatch: item.currentPatch || '',
          remarks: item.remarks || '',
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
        
        setSoftwarePatchData(sortedData);
      }
      
      // Handle direct remarks from data object
      if (data.remarks) {
        setRemarks(data.remarks);
      }
    }
    
    // Always mark as initialized after first render, even if no data
    // This ensures onDataChange will be called when user fills in data
    isInitialized.current = true;
  }, [data]);

  // Update parent component when data changes (but not on initial load)
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      onDataChange({
        softwarePatchData,
        remarks
      });
    }
  }, [softwarePatchData, remarks, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const activePatchData = softwarePatchData.filter(patch => !patch.isDeleted);
    const hasPatchData = activePatchData.some(patch => 
      patch.machineName.trim() !== '' && patch.previousPatch.trim() !== '' && patch.currentPatch.trim() !== ''
    );
    const hasRemarks = remarks.trim() !== '';
    
    const isCompleted = hasPatchData && hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('SoftwarePatch_Edit', isCompleted);
    }
  }, [softwarePatchData, remarks, onStatusChange]);

  // Utility functions for toast messages
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Software patch handlers
  const handleSoftwarePatchChange = (index, field, value) => {
    const updatedData = [...softwarePatchData];
    const currentItem = updatedData[index];
    
    // Mark as modified if it's an existing item (has ID) and value changed
    const isModified = currentItem.id && currentItem[field] !== value;
    
    updatedData[index] = { 
      ...currentItem, 
      [field]: value,
      isModified: isModified || currentItem.isModified
    };
    setSoftwarePatchData(updatedData);
  };

  const addSoftwarePatchRow = () => {
    // Calculate the next serial number based on existing non-deleted rows
    const activeRows = softwarePatchData.filter(row => !row.isDeleted);
    const maxSerialNo = activeRows.length > 0 
      ? Math.max(...activeRows.map(row => parseInt(row.serialNo) || 0))
      : 0;
    const nextSerialNo = (maxSerialNo + 1).toString();
    
    const newRow = { 
      id: Date.now(),
      serialNo: nextSerialNo,
      machineName: '',
      previousPatch: '',
      currentPatch: '',
      isNew: true,
      isModified: false,
      isDeleted: false
    };
    setSoftwarePatchData([...softwarePatchData, newRow]);
    setSnackbar({ open: true, message: 'Software patch item added successfully!', severity: 'success' });
  };

  const removeSoftwarePatchRow = (index) => {
    const updatedData = [...softwarePatchData];
    updatedData[index] = { ...updatedData[index], isDeleted: true };
    setSoftwarePatchData(updatedData);
    setSnackbar({ open: true, message: 'Software patch item marked for deletion. Click undo to restore.', severity: 'warning' });
  };

  const restoreSoftwarePatchRow = (index) => {
    const updatedData = [...softwarePatchData];
    updatedData[index] = { ...updatedData[index], isDeleted: false };
    setSoftwarePatchData(updatedData);
    setSnackbar({ open: true, message: 'Software patch item restored successfully!', severity: 'success' });
  };

  // Styling constants
  const sectionContainerStyle = {
    padding: 3,
    marginBottom: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const sectionHeaderStyle = {
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#1976d2',
    display: 'flex',
    alignItems: 'center',
    gap: 1
  };

  return (
    <Paper sx={sectionContainerStyle}>
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <SystemUpdateIcon /> Software Patch Summary
      </Typography>
      
      {/* Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Review software patches applied during the maintenance period.
        </Typography>
        
        <Box sx={{ 
          padding: 2, 
          backgroundColor: '#fff3e0', 
          borderRadius: 1, 
          border: '1px solid #ff9800',
          marginBottom: 2
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#e65100', marginBottom: 1 }}>
            📋 Important Notes:
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            • Document all software patches applied to each machine
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            • Include both previous and current patch versions
          </Typography>
          <Typography variant="body2">
            • Ensure all critical systems are updated appropriately
          </Typography>
        </Box>
      </Box>

      {/* Add Item Button */}
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addSoftwarePatchRow}
        sx={{ marginBottom: 2 }}
      >
        Add Item
      </Button>

      {/* Software Patch Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">S/N</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Machine Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Previous Patch</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Current Patch</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {softwarePatchData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No software patch data available.
                </TableCell>
              </TableRow>
            ) : (
              softwarePatchData.map((row, index) => (
              <TableRow 
                key={row.id || index}
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
                    {row.serialNo}
                  </Typography>
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.machineName || ''}
                    onChange={(e) => handleSoftwarePatchChange(index, 'machineName', e.target.value)}
                    placeholder="Enter machine name"
                    variant="outlined"
                    disabled={row.isDeleted}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.previousPatch || ''}
                    onChange={(e) => handleSoftwarePatchChange(index, 'previousPatch', e.target.value)}
                    placeholder="e.g., KB12345"
                    variant="outlined"
                    disabled={row.isDeleted}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.currentPatch || ''}
                    onChange={(e) => handleSoftwarePatchChange(index, 'currentPatch', e.target.value)}
                    placeholder="e.g., KB23456"
                    variant="outlined"
                    disabled={row.isDeleted}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#fafafa',
                        '& fieldset': {
                          borderColor: '#ddd'
                        }
                      }
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  {!row.isDeleted ? (
                    <IconButton
                      onClick={() => removeSoftwarePatchRow(index)}
                      title="Delete software patch"
                      sx={{
                        color: '#d32f2f',
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
                      onClick={() => restoreSoftwarePatchRow(index)}
                      title="Restore software patch"
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
          placeholder="Enter any additional remarks or observations about software patches..."
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

export default SoftwarePatch_Edit;