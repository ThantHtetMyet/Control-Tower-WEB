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
  Storage as StorageIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';

// Import the yes/no status service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const MonthlyDatabaseCreation_Edit = ({ data, onDataChange, onStatusChange }) => {
  const [monthlyDatabaseData, setMonthlyDatabaseData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const isInitialized = useRef(false);

  // Utility functions for snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  // Initialize data from props - handle both API array format and legacy format
  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) return;
    
    if (data) {
      // Handle API array format (pmServerMonthlyDatabaseCreations)
      if (data.pmServerMonthlyDatabaseCreations && Array.isArray(data.pmServerMonthlyDatabaseCreations)) {
        const mappedData = data.pmServerMonthlyDatabaseCreations.flatMap(item => 
          (item.details || []).map(detail => ({
            id: detail.id || null,
            serialNo: detail.serialNo || '',
            item: detail.serverName || '',
            monthlyDBCreated: detail.yesNoStatusID || '',
            isNew: !detail.id,
            isModified: false
          }))
        );
        // Sort by serialNo in ascending order
        mappedData.sort((a, b) => {
          const serialA = parseInt(a.serialNo) || 0;
          const serialB = parseInt(b.serialNo) || 0;
          return serialA - serialB;
        });
        setMonthlyDatabaseData(mappedData);
        setRemarks(data.pmServerMonthlyDatabaseCreations[0]?.remarks || '');
      }
      // Handle legacy format for backward compatibility
      else if (Array.isArray(data)) {
        const mappedData = data.map((item, index) => ({
          id: null,
          serialNo: item.serialNo || (index + 1).toString(),
          item: '',
          monthlyDBCreated: item.result || '',
          isNew: true,
          isModified: false
        }));
        // Sort by serialNo in ascending order
        mappedData.sort((a, b) => {
          const serialA = parseInt(a.serialNo) || 0;
          const serialB = parseInt(b.serialNo) || 0;
          return serialA - serialB;
        });
        setMonthlyDatabaseData(mappedData);
        setRemarks(data[0]?.remarks || '');
      }
      // Handle direct object format
      else if (data.monthlyDatabaseData) {
        const monthlyData = data.monthlyDatabaseData || [];
        // Ensure serialNo is present and sort
        const processedData = monthlyData.map((item, index) => ({
          ...item,
          serialNo: item.serialNo || (index + 1).toString()
        }));
        // Sort by serialNo in ascending order
        processedData.sort((a, b) => {
          const serialA = parseInt(a.serialNo) || 0;
          const serialB = parseInt(b.serialNo) || 0;
          return serialA - serialB;
        });
        setMonthlyDatabaseData(processedData);
        setRemarks(data.remarks || '');
      }
    }
    
    // Always mark as initialized after first render, even if no data
    // This ensures onDataChange will be called when user fills in data
    isInitialized.current = true;
  }, [data]);

  // Fetch YesNoStatus options on component mount
  useEffect(() => {
    const fetchYesNoStatuses = async () => {
      try {
        setLoading(true);
        const response = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching yes/no status options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchYesNoStatuses();
  }, []);

  // Update parent component when data changes (but not on initial load)
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      onDataChange({
        monthlyDatabaseData,
        remarks,
        yesNoStatusOptions
      });
    }
  }, [monthlyDatabaseData, remarks, yesNoStatusOptions]);

  // Calculate completion status
  useEffect(() => {
    const hasData = Array.isArray(monthlyDatabaseData) && monthlyDatabaseData.length > 0 && 
                   monthlyDatabaseData.some(item => 
                     item && (
                       (item.item && item.item.trim() !== '') ||
                       (item.monthlyDBCreated && item.monthlyDBCreated.trim() !== '')
                     )
                   );
    const hasRemarks = remarks && remarks.trim() !== '';
    const isCompleted = hasData || hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('MonthlyDatabaseCreation_Edit', isCompleted);
    }
  }, [monthlyDatabaseData, remarks]);

  // Monthly Database Creation handlers
  const handleMonthlyDatabaseChange = (index, field, value) => {
    const updatedData = [...monthlyDatabaseData];
    const currentItem = updatedData[index];
    
    // Mark as modified if it's an existing item (has ID) and value changed
    const isModified = currentItem.id && currentItem[field] !== value;
    
    updatedData[index] = { 
      ...currentItem, 
      [field]: value,
      isModified: isModified || currentItem.isModified
    };
    setMonthlyDatabaseData(updatedData);
  };

  const addMonthlyDatabaseRow = () => {
    setMonthlyDatabaseData([...monthlyDatabaseData, { 
      id: null, // null indicates new row
      serialNo: (monthlyDatabaseData.length + 1).toString(),
      item: '', 
      monthlyDBCreated: '',
      isNew: true // flag to track new rows
    }]);
    showSnackbar('Database row added successfully', 'success');
  };

  const removeMonthlyDatabaseRow = (index) => {
    const updatedData = [...monthlyDatabaseData];
    const itemToRemove = updatedData[index];
    
    // If item has an ID (existing record), mark as deleted instead of removing
    if (itemToRemove.id) {
      updatedData[index] = {
        ...itemToRemove,
        isDeleted: true,
        isModified: true
      };
      showSnackbar('Database row deleted. Click undo to restore.', 'warning');
    } else {
      // If it's a new item (no ID), remove it completely
      updatedData.splice(index, 1);
      showSnackbar('New database row removed');
    }
    
    setMonthlyDatabaseData(updatedData);
  };

  const restoreMonthlyDatabaseRow = (index) => {
    const updatedData = [...monthlyDatabaseData];
    const itemToRestore = updatedData[index];
    
    // Only restore if item is currently deleted
    if (itemToRestore.isDeleted) {
      updatedData[index] = {
        ...itemToRestore,
        isDeleted: false,
        isModified: true // Keep as modified since we're changing the delete status
      };
      setMonthlyDatabaseData(updatedData);
      showSnackbar('Database row restored successfully', 'success');
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
        <StorageIcon /> Historical Database
      </Typography>
      
      {/* Monthly Database Creation Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
          Monthly Database Creation
        </Typography>
        
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Willowlynx's historical DB uses monthly database. Check the MSSQL database and make sure the monthly databases are created for the next 6 months.
        </Typography>
      </Box>

      {/* Add Item Button */}
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addMonthlyDatabaseRow}
        sx={{ marginBottom: 2 }}
      >
        Add Item
      </Button>

      {/* Monthly Database Creation Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Monthly DB are Created</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {monthlyDatabaseData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No items added yet. Click "Add Item" to get started.
                </TableCell>
              </TableRow>
            ) : (
              monthlyDatabaseData.map((row, index) => (
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
                      variant="outlined"
                      value={row.item}
                      onChange={(e) => handleMonthlyDatabaseChange(index, 'item', e.target.value)}
                      placeholder="Enter item description"
                      size="small"
                      disabled={row.isDeleted}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      select
                      variant="outlined"
                      value={row.monthlyDBCreated}
                      onChange={(e) => handleMonthlyDatabaseChange(index, 'monthlyDBCreated', e.target.value)}
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
                      {yesNoStatusOptions.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    {!row.isDeleted ? (
                      <IconButton
                        onClick={() => removeMonthlyDatabaseRow(index)}
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
                        onClick={() => restoreMonthlyDatabaseRow(index)}
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
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default MonthlyDatabaseCreation_Edit;