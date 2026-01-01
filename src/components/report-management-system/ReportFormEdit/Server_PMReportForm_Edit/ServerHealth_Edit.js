import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Computer as ComputerIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';

// Import the server health image
import ServerHealthImage from '../../../resources/ServerPMReportForm/ServerHealth.png';
// Import the result status service
import resultStatusService from '../../../api-services/resultStatusService';
// Import the warehouse service
import warehouseService from '../../../api-services/warehouseService';

const ServerHealth_Edit = ({ data, onDataChange, onStatusChange, stationNameWarehouseID }) => {
  const [serverHealthData, setServerHealthData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverHostNameOptions, setServerHostNameOptions] = useState([]);
  const [loadingServerHostNames, setLoadingServerHostNames] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const isInitialized = useRef(false);
  const onDataChangeRef = useRef(onDataChange);
  const lastDataRef = useRef(null);

  // Debug: Log when stationNameWarehouseID prop changes
  useEffect(() => {
    console.log('ServerHealth_Edit - stationNameWarehouseID prop received:', stationNameWarehouseID);
  }, [stationNameWarehouseID]);

  // Keep onDataChange ref updated
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // Initialize data from props when meaningful data is available
  useEffect(() => {
    // Check if data actually changed
    const dataKey = data ? JSON.stringify({ 
      serverHealthData: data.serverHealthData, 
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
    const hasData = data && ((data.serverHealthData && data.serverHealthData.length > 0) || (data.remarks && data.remarks.trim() !== ''));
    
    if (hasData) {
      if (data.serverHealthData && data.serverHealthData.length > 0) {
        // Map existing data and preserve all tracking flags including isDeleted
        const mappedData = data.serverHealthData.map(item => {
          // Handle both lowercase and capitalized field names from API
          const serverName = item.serverName || item.ServerName || '';
          console.log('ServerHealth_Edit - Mapping item:', { 
            original: item, 
            serverName: serverName,
            id: item.id || item.ID || null
          });
          return {
            id: item.id || item.ID || null, // preserve existing ID or null for new items
            serverName: serverName,
            result: item.result || item.ResultStatusID || '',
            remarks: item.remarks || item.Remarks || '',
            isNew: !(item.id || item.ID), // mark as new if no ID exists
            isModified: item.isModified || false, // preserve modification flag
            isDeleted: item.isDeleted || false // preserve deletion flag
          };
        });
        console.log('ServerHealth_Edit - Mapped server health data:', mappedData);
        setServerHealthData(mappedData);
      }
      if (data.remarks) {
        setRemarks(data.remarks);
      }
    } else {
      // Reset if no data
      setServerHealthData([]);
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

  // Fetch Server Host Name options when stationNameWarehouseID changes
  useEffect(() => {
    console.log('ServerHealth_Edit - useEffect triggered, stationNameWarehouseID:', stationNameWarehouseID, 'type:', typeof stationNameWarehouseID);
    
    const fetchServerHostNames = async () => {
      // Get existing server names from current data (always include these)
      const existingServerNames = serverHealthData
        .filter(row => row.serverName && row.serverName.trim() !== '' && !row.isDeleted)
        .map(row => row.serverName);

      // Check if stationNameWarehouseID is valid (not empty string, null, or undefined)
      // Also check if it's a valid GUID format (basic check: has dashes and is 36 chars)
      const hasStationID = stationNameWarehouseID && 
                          typeof stationNameWarehouseID === 'string' &&
                          stationNameWarehouseID.trim() !== '' && 
                          stationNameWarehouseID !== null && 
                          stationNameWarehouseID !== undefined;

      console.log('ServerHealth_Edit - hasStationID check:', hasStationID, 'stationNameWarehouseID:', stationNameWarehouseID, 'trimmed:', stationNameWarehouseID?.trim());

      if (!hasStationID) {
        // Even if no stationNameWarehouseID, include existing server names
        const existingOptions = existingServerNames.map(name => ({ id: `existing-${name}`, name }));
        setServerHostNameOptions(existingOptions);
        console.log('ServerHealth_Edit - No stationNameWarehouseID, using existing names only:', existingOptions);
        return;
      }

      try {
        setLoadingServerHostNames(true);
        const stationID = stationNameWarehouseID.trim();
        console.log('ServerHealth_Edit - Calling API: warehouseService.getServerHostNameWarehouses with stationNameWarehouseID:', stationID);
        console.log('ServerHealth_Edit - API endpoint will be: /ServerHostNameWarehouse/ByStationName/' + stationID);
        
        const response = await warehouseService.getServerHostNameWarehouses(stationID);
        // warehouseService.getServerHostNameWarehouses already returns an array
        const fetchedOptions = Array.isArray(response) ? response : [];
        
        console.log('ServerHealth_Edit - API Response:', response);
        console.log('ServerHealth_Edit - API Response type:', typeof response, 'isArray:', Array.isArray(response));
        console.log('ServerHealth_Edit - Fetched server host names (count):', fetchedOptions.length);
        console.log('ServerHealth_Edit - Fetched options:', fetchedOptions);
        console.log('ServerHealth_Edit - Existing server names:', existingServerNames);
        
        // Create a map of existing options by name to avoid duplicates
        const optionsMap = new Map();
        
        // First, add ALL fetched options from API (these are the available server names)
        // For new rows, these will be shown in dropdown
        fetchedOptions.forEach(option => {
          // Handle both lowercase 'name' and capitalized 'Name' field names
          const optionName = option.name || option.Name;
          if (option && optionName) {
            optionsMap.set(optionName, { id: option.id || option.ID || `api-${optionName}`, name: optionName });
          }
        });
        
        // Then, add existing server names that are not in the fetched options
        // This ensures existing values are always visible even if not in the API response
        // For existing rows, this ensures the current selected name is shown
        existingServerNames.forEach(serverName => {
          if (!optionsMap.has(serverName)) {
            optionsMap.set(serverName, { id: `existing-${serverName}`, name: serverName });
          }
        });
        
        // Convert map back to array
        const finalOptions = Array.from(optionsMap.values());
        console.log('ServerHealth_Edit - Final options (API + existing, count):', finalOptions.length);
        console.log('ServerHealth_Edit - Final options:', finalOptions);
        setServerHostNameOptions(finalOptions);
      } catch (error) {
        console.error('ServerHealth_Edit - Error fetching server host name options:', error);
        console.error('ServerHealth_Edit - Error details:', error.message);
        console.error('ServerHealth_Edit - Error response:', error.response?.data);
        console.error('ServerHealth_Edit - Error stack:', error.stack);
        // Even on error, include existing server names so current values are visible
        const existingOptions = existingServerNames.map(name => ({ id: `existing-${name}`, name }));
        setServerHostNameOptions(existingOptions);
      } finally {
        setLoadingServerHostNames(false);
      }
    };

    fetchServerHostNames();
  }, [stationNameWarehouseID]); // Only fetch when stationNameWarehouseID changes, not when serverHealthData changes

  // Merge existing server names into options when serverHealthData changes (without re-fetching)
  useEffect(() => {
    if (serverHealthData.length > 0) {
      const existingServerNames = serverHealthData
        .filter(row => row.serverName && row.serverName.trim() !== '' && !row.isDeleted)
        .map(row => row.serverName.trim());
      
      if (existingServerNames.length > 0) {
        // Create a map to avoid duplicates - use current serverHostNameOptions
        setServerHostNameOptions(prevOptions => {
          const optionsMap = new Map(prevOptions.map(opt => [
            String(opt.name || opt.Name || '').trim(),
            opt
          ]));
          
          // Add existing server names that aren't already in options
          let hasChanges = false;
          existingServerNames.forEach(serverName => {
            if (!optionsMap.has(serverName)) {
              optionsMap.set(serverName, { id: `existing-${serverName}`, name: serverName });
              hasChanges = true;
            }
          });
          
          // Only return new array if there are changes to avoid unnecessary re-renders
          return hasChanges ? Array.from(optionsMap.values()) : prevOptions;
        });
      }
    }
  }, [serverHealthData]); // Only merge existing names when serverHealthData changes

  // Update parent component when data changes (but not on initial load)
  useEffect(() => {
    if (isInitialized.current && onDataChangeRef.current) {
      console.log('ServerHealth_Edit - Calling onDataChange with:', { serverHealthData, remarks });
      onDataChangeRef.current({
        serverHealthData,
        remarks
      });
    }
  }, [serverHealthData, remarks]); // Removed onDataChange from dependencies to prevent infinite loop

  // Calculate completion status
  useEffect(() => {
    const activeServerData = serverHealthData.filter(server => !server.isDeleted);
    const hasServerData = activeServerData.some(server => 
      server.serverName.trim() !== '' && server.result !== ''
    );
    const hasRemarks = remarks.trim() !== '';
    
    const isCompleted = hasServerData && hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('ServerHealth_Edit', isCompleted);
    }
  }, [serverHealthData, remarks, onStatusChange]);

  // Server Health Check handlers
  const handleServerHealthChange = (index, field, value) => {
    console.log('ServerHealth_Edit - handleServerHealthChange called:', { 
      index, 
      field, 
      value, 
      valueType: typeof value,
      currentValue: serverHealthData[index]?.[field],
      currentItem: serverHealthData[index],
      allData: serverHealthData
    });
    const updatedData = [...serverHealthData];
    const currentItem = updatedData[index];
    
    if (!currentItem) {
      console.error('ServerHealth_Edit - No item at index:', index);
      return;
    }
    
    // Mark as modified if it's an existing item (has ID) and value changed
    const isModified = currentItem.id && currentItem[field] !== value;
    
    updatedData[index] = { 
      ...currentItem, 
      [field]: String(value || ''),
      isModified: isModified || currentItem.isModified
    };
    console.log('ServerHealth_Edit - Updated data:', updatedData[index]);
    console.log('ServerHealth_Edit - Full updated array:', updatedData);
    setServerHealthData(updatedData);
  };

  // Utility functions for toast messages
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const addServerHealthRow = () => {
    setServerHealthData([...serverHealthData, { 
      id: null, // null indicates new row
      serverName: '', 
      result: '',
      isNew: true // flag to track new rows
    }]);
    showSnackbar('New server health row added');
  };

  const removeServerHealthRow = (index) => {
    const updatedData = [...serverHealthData];
    const itemToRemove = updatedData[index];
    
    // If item has an ID (existing record), mark as deleted instead of removing
    if (itemToRemove.id) {
      updatedData[index] = {
        ...itemToRemove,
        isDeleted: true,
        isModified: true
      };
      showSnackbar('Server health row deleted. Click undo to restore.', 'warning');
    } else {
      // If it's a new item (no ID), remove it completely
      updatedData.splice(index, 1);
      showSnackbar('New server health row removed');
    }
    
    setServerHealthData(updatedData);
  };

  const restoreServerHealthRow = (index) => {
    const updatedData = [...serverHealthData];
    const itemToRestore = updatedData[index];
    
    // Only restore if item is currently deleted
    if (itemToRestore.isDeleted) {
      updatedData[index] = {
        ...itemToRestore,
        isDeleted: false,
        isModified: true // Keep as modified since we're changing the delete status
      };
      setServerHealthData(updatedData);
      showSnackbar('Server health row restored');
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
        <ComputerIcon /> Server Health Check
      </Typography>
      
      {/* Server Health Check Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Check Server Front Panel LED Number 2, as shown below. Check LED 2 in solid green, which indicates the server is healthy.
        </Typography>
        
        {/* Server Health Image */}
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
            src={ServerHealthImage} 
            alt="Server Health Check Diagram" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              maxHeight: '400px'
            }} 
          />
        </Box>
        
        <Typography variant="body1" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
          Check if LED 2 is in solid green.
        </Typography>
      </Box>

      {/* Add Server Button */}
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addServerHealthRow}
        sx={{ marginBottom: 2 }}
      >
        Add Server
      </Button>

      {/* Server Health Check Table */}
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
            {serverHealthData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No servers added yet. Click "Add Server" to get started.
                </TableCell>
              </TableRow>
            ) : (
              serverHealthData.map((row, index) => {
                // Compute complete options list including current value for this row
                const currentValue = String(row.serverName || '').trim();
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
                    <FormControl fullWidth size="small">
                      <InputLabel id={`server-health-server-name-label-${index}`} shrink>
                        Server Name
                      </InputLabel>
                      <Select
                        labelId={`server-health-server-name-label-${index}`}
                        value={selectValue}
                        onChange={(e) => {
                          const newValue = String(e.target.value || '').trim();
                          handleServerHealthChange(index, 'serverName', newValue);
                        }}
                        label="Server Name"
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
                                    Select Server Name
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
                  </TableCell>
                  <TableCell>
                    {(() => {
                      // Only use the value if it exists in the options to prevent MUI errors
                      const currentResult = row.result || '';
                      const isValidResult = currentResult && resultStatusOptions.some(opt => 
                        String(opt.id) === String(currentResult)
                      );
                      const selectValue = isValidResult ? currentResult : '';
                      
                      return (
                        <TextField
                          fullWidth
                          select
                          variant="outlined"
                          value={selectValue}
                          onChange={(e) => handleServerHealthChange(index, 'result', e.target.value)}
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
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {!row.isDeleted ? (
                      <IconButton
                        onClick={() => removeServerHealthRow(index)}
                        color="error"
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
                        onClick={() => restoreServerHealthRow(index)}
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
                );
              })
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

export default ServerHealth_Edit;