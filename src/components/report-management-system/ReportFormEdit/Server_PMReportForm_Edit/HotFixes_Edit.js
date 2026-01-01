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
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  Undo as UndoIcon
} from '@mui/icons-material';

// Import the result status service
import resultStatusService from '../../../api-services/resultStatusService';
// Import the warehouse service
import warehouseService from '../../../api-services/warehouseService';

const HotFixes_Edit = ({ data, onDataChange, onStatusChange, stationNameWarehouseID }) => {
  const [hotFixesData, setHotFixesData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverHostNameOptions, setServerHostNameOptions] = useState([]);
  const [loadingServerHostNames, setLoadingServerHostNames] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const isInitialized = useRef(false);

  // Initialize data from props when meaningful data is available
  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) return;
    
    // Check if we have meaningful data to initialize with
    const hasData = data && (
      (Array.isArray(data) && data.length > 0) ||
      (data.pmServerHotFixes && data.pmServerHotFixes.length > 0) ||
      (data.hotFixesData && data.hotFixesData.length > 0) ||
      (data.remarks && data.remarks.trim() !== '')
    );
    
    if (hasData) {
      // Handle API response format (from ServerPMReportForm_Edit)
      if (data.pmServerHotFixes && Array.isArray(data.pmServerHotFixes)) {
        const hotFixesRecord = data.pmServerHotFixes[0];
        
        // Initialize hotfixes data from details array
        if (hotFixesRecord && hotFixesRecord.details && hotFixesRecord.details.length > 0) {
          const mappedData = hotFixesRecord.details.map(detail => ({
            id: detail.id || null,
            machineName: detail.serverName || '',
            hotFixName: detail.hotFixName || '',
            done: detail.resultStatusID || '',
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
          
          setHotFixesData(sortedData);
          console.log('HotFixes_Edit - Mapped and sorted data from API:', sortedData);
        }
        
        // Set remarks from the hotfixes record
        if (hotFixesRecord.remarks) {
          setRemarks(hotFixesRecord.remarks);
        }
      }
      // Handle direct hotFixesData format
      else if (data.hotFixesData && data.hotFixesData.length > 0) {
        const mappedData = data.hotFixesData.map((item, index) => ({
          id: item.id || null,
          machineName: item.machineName || '',
          hotFixName: item.latestHotfixesApplied || item.hotFixName || '',
          done: item.done || '',
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
        
        setHotFixesData(sortedData);
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

  // Fetch Server Host Name options when stationNameWarehouseID changes
  useEffect(() => {
    const fetchServerHostNames = async () => {
      if (!stationNameWarehouseID) {
        setServerHostNameOptions([]);
        return;
      }

      try {
        setLoadingServerHostNames(true);
        const response = await warehouseService.getServerHostNameWarehouses(stationNameWarehouseID);
        const options = Array.isArray(response) ? response : (response?.data || []);
        setServerHostNameOptions(options);
      } catch (error) {
        console.error('Error fetching server host name options:', error);
        setServerHostNameOptions([]);
      } finally {
        setLoadingServerHostNames(false);
      }
    };

    fetchServerHostNames();
  }, [stationNameWarehouseID]); // Only fetch when stationNameWarehouseID changes, not when data changes

  // Merge existing machine names into options when data changes (without re-fetching)
  useEffect(() => {
    if (hotFixesData.length > 0) {
      const existingMachineNames = hotFixesData
        .filter(row => row.machineName && row.machineName.trim() !== '' && !row.isDeleted)
        .map(row => row.machineName.trim());
      
      if (existingMachineNames.length > 0) {
        // Use functional setState to avoid dependency on serverHostNameOptions
        setServerHostNameOptions(prevOptions => {
          const optionsMap = new Map(prevOptions.map(opt => [
            String(opt.name || opt.Name || '').trim(),
            opt
          ]));
          
          // Add existing machine names that aren't already in options
          let hasChanges = false;
          existingMachineNames.forEach(machineName => {
            if (!optionsMap.has(machineName)) {
              optionsMap.set(machineName, { id: `existing-${machineName}`, name: machineName });
              hasChanges = true;
            }
          });
          
          // Only return new array if there are changes to avoid unnecessary re-renders
          return hasChanges ? Array.from(optionsMap.values()) : prevOptions;
        });
      }
    }
  }, [hotFixesData]); // Only merge existing names when data changes

  // Update parent component when data changes (but not on initial load)
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      onDataChange({
        hotFixesData,
        remarks
      });
    }
  }, [hotFixesData, remarks, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const activeHotFixesData = hotFixesData.filter(item => !item.isDeleted);
    const hasHotFixesData = activeHotFixesData.some(item => 
      item.machineName && item.machineName.trim() !== '' && 
      item.hotFixName && item.hotFixName.trim() !== '' && 
      item.done !== ''
    );
    const hasRemarks = remarks && remarks.trim() !== '';
    
    const isCompleted = hasHotFixesData && hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('HotFixes_Edit', isCompleted);
    }
  }, [hotFixesData, remarks, onStatusChange]);

  // Utility functions
  const saveToUndoStack = (action, data) => {
    setUndoStack(prev => [...prev, { action, data, timestamp: Date.now() }]);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // HotFixes handlers
  const handleHotFixesChange = (index, field, value) => {
    const updatedData = [...hotFixesData];
    const currentItem = updatedData[index];
    
    // Mark as modified if it's an existing item (has ID) and value changed
    const isModified = currentItem.id && currentItem[field] !== value;
    
    updatedData[index] = { 
      ...currentItem, 
      [field]: value,
      isModified: isModified || currentItem.isModified
    };
    setHotFixesData(updatedData);
  };

  const addHotFixesRow = () => {
    const newRow = {
      id: null, // null indicates new row
      serialNo: (hotFixesData.length + 1).toString(),
      machineName: '',
      hotFixName: '',
      done: '',
      isNew: true, // flag to track new rows
      isModified: false,
      isDeleted: false
    };
    
    setHotFixesData([...hotFixesData, newRow]);
    showSnackbar('New hotfix item added');
  };

  const removeHotFixesRow = (index) => {
    const updatedData = [...hotFixesData];
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
      showSnackbar('Hotfix item deleted. Click undo to restore.', 'warning');
    } else {
      // If it's a new item (no ID), remove it completely
      updatedData.splice(index, 1);
      showSnackbar('New hotfix item removed');
    }
    
    setHotFixesData(updatedData);
  };

  const restoreHotFixesRow = (index) => {
    const updatedData = [...hotFixesData];
    const item = updatedData[index];
    
    updatedData[index] = { ...item, isDeleted: false };
    setHotFixesData(updatedData);
    showSnackbar('Hotfix item restored');
  };

  const handleRemarksChange = (e) => {
    setRemarks(e.target.value);
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
        <BuildIcon /> Hotfixes / Service Packs
      </Typography>
      
      {/* HotFixes Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          To review & apply the latest hotfixes, the service pack on all servers were applicable.
        </Typography>
      </Box>

      {/* Add Item Button */}
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addHotFixesRow}
        sx={{ marginBottom: 2 }}
      >
        Add Item
      </Button>

      {/* HotFixes Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Machine Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Latest Hotfixes Applied (e.g., KB4022719)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Done</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hotFixesData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No items added yet. Click "Add Item" to get started.
                </TableCell>
              </TableRow>
            ) : (
              hotFixesData.map((row, index) => (
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
                      {(() => {
                        // Compute complete options list including current value for this row
                        const currentValue = String(row.machineName || '').trim();
                        const optionsWithCurrent = [...serverHostNameOptions];
                        
                        // Always include current value in options if it exists and is not already there
                        if (currentValue && currentValue !== '' && !optionsWithCurrent.some(opt => {
                          const optName = String(opt.name || opt.Name || '').trim();
                          return optName === currentValue;
                        })) {
                          optionsWithCurrent.push({ 
                            id: `current-${currentValue}`, 
                            name: currentValue 
                          });
                        }
                        
                        // Since we always add currentValue to optionsWithCurrent if it exists,
                        // the value should always be valid if currentValue is not empty
                        const selectValue = currentValue && currentValue !== '' ? currentValue : '';
                        
                        return (
                          <FormControl fullWidth size="small">
                            <InputLabel id={`hotfixes-machine-name-label-${index}`} shrink>
                              Machine Name
                            </InputLabel>
                            <Select
                              labelId={`hotfixes-machine-name-label-${index}`}
                              value={selectValue}
                              onChange={(e) => handleHotFixesChange(index, 'machineName', String(e.target.value || '').trim())}
                              label="Machine Name"
                              disabled={row.isDeleted || loadingServerHostNames}
                              sx={{
                                '& .MuiSelect-select': {
                                  display: 'flex',
                                  alignItems: 'center',
                                }
                              }}
                            >
                              {loadingServerHostNames ? (
                                <MenuItem disabled value="">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CircularProgress size={16} />
                                    Loading server names...
                                  </Box>
                                </MenuItem>
                              ) : optionsWithCurrent.length === 0 ? (
                                !stationNameWarehouseID ? (
                                  <MenuItem disabled value="">
                                    <Typography sx={{ color: '#999', fontStyle: 'italic' }}>
                                      Please select Station Name first
                                    </Typography>
                                  </MenuItem>
                                ) : (
                                  <MenuItem disabled value="">
                                    <Typography sx={{ color: '#999', fontStyle: 'italic' }}>
                                      No server names available
                                    </Typography>
                                  </MenuItem>
                                )
                              ) : (
                                [
                                  <MenuItem key="empty-placeholder" value="">
                                    <Typography sx={{ color: '#999', fontStyle: 'italic' }}>
                                      Select Machine Name
                                    </Typography>
                                  </MenuItem>,
                                  ...optionsWithCurrent.map((option) => {
                                    const optionName = String(option.name || option.Name || '').trim();
                                    const optionId = String(option.id || option.ID || optionName);
                                    return (
                                      <MenuItem key={optionId} value={optionName}>
                                        {optionName}
                                      </MenuItem>
                                    );
                                  })
                                ]
                              )}
                            </Select>
                          </FormControl>
                        );
                      })()}
                    </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.hotFixName}
                      onChange={(e) => handleHotFixesChange(index, 'hotFixName', e.target.value)}
                      placeholder="e.g., KB4022719"
                      size="small"
                      disabled={row.isDeleted}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      select
                      variant="outlined"
                      value={row.done}
                      onChange={(e) => handleHotFixesChange(index, 'done', e.target.value)}
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
                        onClick={() => removeHotFixesRow(index)}
                        color="error"
                        title="Delete hotfix"
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
                        onClick={() => restoreHotFixesRow(index)}
                        title="Restore hotfix"
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
          onChange={handleRemarksChange}
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
        autoHideDuration={4000}
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

export default HotFixes_Edit;