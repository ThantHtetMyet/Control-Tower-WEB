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
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Backup as BackupIcon,
  Undo as UndoIcon
} from '@mui/icons-material';

// Import the yes/no status service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const DatabaseBackup_Edit = ({ data, onDataChange, onStatusChange }) => {
  // State management - matching DatabaseBackup.js exactly
  const [mssqlBackupData, setMssqlBackupData] = useState([]);
  const [scadaBackupData, setScadaBackupData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [latestBackupFileName, setLatestBackupFileName] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Edit-specific features
  const [undoStack, setUndoStack] = useState([]);
  const [canUndo, setCanUndo] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const isInitialized = useRef(false);

  // Initialize data from props - handle both API array format and legacy format, following MonthlyDatabaseCreation_Edit pattern
  useEffect(() => {
    if (data && !isInitialized.current) {
      console.log('DatabaseBackup_Edit - Initializing with data:', data); // Debug log
      
      // Check if we already have processed data from previous user input (legacy format)
      if (data.mssqlBackupData && Array.isArray(data.mssqlBackupData)) {
        console.log('DatabaseBackup_Edit - Using existing mssqlBackupData:', data.mssqlBackupData);
        setMssqlBackupData(data.mssqlBackupData);
      }
      
      if (data.scadaBackupData && Array.isArray(data.scadaBackupData)) {
        console.log('DatabaseBackup_Edit - Using existing scadaBackupData:', data.scadaBackupData);
        setScadaBackupData(data.scadaBackupData);
      }
      
      if (data.remarks !== undefined) {
        console.log('DatabaseBackup_Edit - Using existing remarks:', data.remarks);
        setRemarks(data.remarks);
      }
      
      if (data.latestBackupFileName !== undefined) {
        console.log('DatabaseBackup_Edit - Using existing latestBackupFileName:', data.latestBackupFileName);
        setLatestBackupFileName(data.latestBackupFileName);
      }
      
      // Only process API data if we don't have existing processed data
      if (data.pmServerDatabaseBackups && Array.isArray(data.pmServerDatabaseBackups) && 
          (!data.mssqlBackupData || data.mssqlBackupData.length === 0) &&
          (!data.scadaBackupData || data.scadaBackupData.length === 0)) {
        
        console.log('DatabaseBackup_Edit - Processing API data:', data.pmServerDatabaseBackups);
        
        let mssqlData = [];
        let scadaData = [];
        let remarksFromAPI = '';
        let latestBackupFileNameFromAPI = '';

        // Process API response format
        const backupData = data.pmServerDatabaseBackups[0];
        
        // Initialize MSSQL data from mssqlDatabaseBackupDetails
        if (backupData && backupData.mssqlDatabaseBackupDetails && backupData.mssqlDatabaseBackupDetails.length > 0) {
          mssqlData = backupData.mssqlDatabaseBackupDetails.map(item => ({
            id: item.id || null,
            serialNo: item.serialNo || '',
            item: item.serverName || '',
            monthlyDBBackupCreated: item.yesNoStatusID || '',
            isNew: false,
            isModified: false,
            isDeleted: false
          }));
          // Sort by serialNo
          mssqlData.sort((a, b) => {
            const serialA = parseInt(a.serialNo) || 0;
            const serialB = parseInt(b.serialNo) || 0;
            return serialA - serialB;
          });
          console.log('DatabaseBackup_Edit - Mapped MSSQL data from API:', mssqlData);
        }
        
        // Initialize SCADA data from scadaDataBackupDetails
        if (backupData && backupData.scadaDataBackupDetails && backupData.scadaDataBackupDetails.length > 0) {
          scadaData = backupData.scadaDataBackupDetails.map(item => ({
            id: item.id || null,
            serialNo: item.serialNo || '',
            item: item.serverName || '',
            monthlyDBBackupCreated: item.yesNoStatusID || '',
            isNew: false,
            isModified: false,
            isDeleted: false
          }));
          // Sort by serialNo
          scadaData.sort((a, b) => {
            const serialA = parseInt(a.serialNo) || 0;
            const serialB = parseInt(b.serialNo) || 0;
            return serialA - serialB;
          });
          console.log('DatabaseBackup_Edit - Mapped SCADA data from API:', scadaData);
        }
        
        // Initialize remarks and latest backup file name from backupData
        if (backupData) {
          remarksFromAPI = backupData.remarks || '';
          latestBackupFileNameFromAPI = backupData.latestBackupFileName || '';
        }

        setMssqlBackupData(mssqlData);
        setScadaBackupData(scadaData);
        setRemarks(remarksFromAPI);
        setLatestBackupFileName(latestBackupFileNameFromAPI);
      }
      
      isInitialized.current = true;
    }
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
        showSnackbar('Failed to load status options', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchYesNoStatuses();
  }, []);

  // Update parent component when data changes (but not on initial load) - following MonthlyDatabaseCreation_Edit pattern
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      onDataChange({
        mssqlBackupData,
        scadaBackupData,
        remarks,
        latestBackupFileName
      });
    }
  }, [mssqlBackupData, scadaBackupData, remarks, latestBackupFileName, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const hasMssqlData = mssqlBackupData.some(item => 
      item.item.trim() !== '' && item.monthlyDBBackupCreated !== ''
    );
    const hasScadaData = scadaBackupData.some(item => 
      item.item.trim() !== '' && item.monthlyDBBackupCreated !== ''
    );
    const hasRemarks = remarks.trim() !== '';
    const hasLatestBackupFileName = latestBackupFileName.trim() !== '';
    
    const isCompleted = hasMssqlData && hasScadaData && hasRemarks && hasLatestBackupFileName;
    
    if (onStatusChange) {
      onStatusChange('DatabaseBackup', isCompleted);
    }
  }, [mssqlBackupData, scadaBackupData, remarks, latestBackupFileName, onStatusChange]);

  // Utility functions for edit features
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const saveToUndoStack = () => {
    const currentState = {
      mssqlBackupData: [...mssqlBackupData],
      scadaBackupData: [...scadaBackupData],
      remarks,
      latestBackupFileName,
      timestamp: Date.now()
    };
    
    setUndoStack(prev => [...prev.slice(-9), currentState]); // Keep last 10 states
    setCanUndo(true);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setMssqlBackupData(previousState.mssqlBackupData);
      setScadaBackupData(previousState.scadaBackupData);
      setRemarks(previousState.remarks);
      setLatestBackupFileName(previousState.latestBackupFileName);
      
      setUndoStack(prev => prev.slice(0, -1));
      setCanUndo(undoStack.length > 1);
      showSnackbar('Changes undone successfully', 'info');
    }
  };

  // MSSQL Backup handlers - following CPUAndRamUsage_Edit pattern
  const handleMssqlBackupChange = (index, field, value) => {
    const updatedData = [...mssqlBackupData];
    const currentItem = updatedData[index];
    
    // Mark as modified if it's an existing item (has ID)
    if (currentItem.id) {
      updatedData[index] = { 
        ...currentItem, 
        [field]: value,
        isModified: true 
      };
    } else {
      // For new items, just update the field
      updatedData[index] = { ...currentItem, [field]: value };
    }
    
    setMssqlBackupData(updatedData);
  };

  const addMssqlBackupRow = () => {
    const newRow = { 
      id: null,
      serialNo: (mssqlBackupData.length + 1).toString(),
      item: '', 
      monthlyDBBackupCreated: '',
      isNew: true,
      isModified: false,
      isDeleted: false
    };
    setMssqlBackupData([...mssqlBackupData, newRow]);
    showSnackbar('MSSQL backup row added successfully', 'success');
  };

  const removeMssqlBackupRow = (index) => {
    const updatedData = [...mssqlBackupData];
    const itemToRemove = updatedData[index];
    
    // If item has an ID (existing item), mark as deleted instead of removing
    if (itemToRemove.id) {
      updatedData[index] = {
        ...itemToRemove,
        isDeleted: true,
        isModified: true
      };
      setMssqlBackupData(updatedData);
      showSnackbar('MSSQL backup row deleted. Click undo to restore.', 'warning');
    } else {
      // If it's a new item (no ID), remove it completely
      const filteredData = mssqlBackupData.filter((_, i) => i !== index);
      setMssqlBackupData(filteredData);
      showSnackbar('New MSSQL backup row removed');
    }
  };

  const restoreMssqlBackupRow = (index) => {
    const updatedData = [...mssqlBackupData];
    const itemToRestore = updatedData[index];
    
    // Only restore if the item is currently deleted
    if (itemToRestore.isDeleted) {
      updatedData[index] = {
        ...itemToRestore,
        isDeleted: false,
        isModified: true
      };
      setMssqlBackupData(updatedData);
      showSnackbar('MSSQL backup row restored successfully', 'success');
    }
  };

  // SCADA Backup handlers - following CPUAndRamUsage_Edit pattern
  const handleScadaBackupChange = (index, field, value) => {
    const updatedData = [...scadaBackupData];
    const currentItem = updatedData[index];
    
    // Mark as modified if it's an existing item (has ID)
    if (currentItem.id) {
      updatedData[index] = { 
        ...currentItem, 
        [field]: value,
        isModified: true 
      };
    } else {
      // For new items, just update the field
      updatedData[index] = { ...currentItem, [field]: value };
    }
    
    setScadaBackupData(updatedData);
  };

  const addScadaBackupRow = () => {
    const newRow = { 
      id: null,
      serialNo: (scadaBackupData.length + 1).toString(),
      item: '', 
      monthlyDBBackupCreated: '',
      isNew: true,
      isModified: false,
      isDeleted: false
    };
    setScadaBackupData([...scadaBackupData, newRow]);
    showSnackbar('SCADA backup row added successfully', 'success');
  };

  const removeScadaBackupRow = (index) => {
    const updatedData = [...scadaBackupData];
    const itemToRemove = updatedData[index];
    
    // If item has an ID (existing item), mark as deleted instead of removing
    if (itemToRemove.id) {
      updatedData[index] = {
        ...itemToRemove,
        isDeleted: true,
        isModified: true
      };
      setScadaBackupData(updatedData);
      showSnackbar('SCADA backup row deleted. Click undo to restore.', 'warning');
    } else {
      // If it's a new item (no ID), remove it completely
      const filteredData = scadaBackupData.filter((_, i) => i !== index);
      setScadaBackupData(filteredData);
      showSnackbar('New SCADA backup row removed');
    }
  };

  const restoreScadaBackupRow = (index) => {
    const updatedData = [...scadaBackupData];
    const itemToRestore = updatedData[index];
    
    // Only restore if item is currently deleted
    if (itemToRestore.isDeleted) {
      updatedData[index] = {
        ...itemToRestore,
        isDeleted: false,
        isModified: true // Keep as modified since we're changing the delete status
      };
      setScadaBackupData(updatedData);
      showSnackbar('SCADA backup row restored successfully', 'success');
    }
  };

  // Handle remarks and latest backup file name changes with undo support
  const handleRemarksChange = (value) => {
    saveToUndoStack();
    setRemarks(value);
  };

  const handleLatestBackupFileNameChange = (value) => {
    saveToUndoStack();
    setLatestBackupFileName(value);
  };

  // Styling - matching DatabaseBackup.js exactly
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
    <>
      <Paper sx={sectionContainerStyle}>
        {/* Header with Undo button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={sectionHeaderStyle}>
            <BackupIcon /> Historical Database
          </Typography>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<UndoIcon />}
            onClick={handleUndo}
            disabled={!canUndo}
            sx={{ minWidth: 'auto' }}
          >
            Undo
          </Button>
        </Box>
        
        {/* Database Backup Instructions */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
            Database Backup
          </Typography>
          
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            Check <b> D:\MSSQLSERVER-BACKUP\Monthly </b> make sure the database is backup in this directory.
          </Typography>
        </Box>

        {/* Add Item Button */}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addMssqlBackupRow}
          sx={{ marginBottom: 2 }}
        >
          Add Item
        </Button>

        {/* MSSQL Database Backup Table */}
        <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Monthly DB Backup are Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mssqlBackupData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                    No items added yet. Click "Add Item" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                mssqlBackupData.map((row, index) => (
                  <TableRow 
                    key={row.id || `mssql-${index}`}
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
                        onChange={(e) => handleMssqlBackupChange(index, 'item', e.target.value)}
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
                        value={row.monthlyDBBackupCreated}
                        onChange={(e) => handleMssqlBackupChange(index, 'monthlyDBBackupCreated', e.target.value)}
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
                          onClick={() => removeMssqlBackupRow(index)}
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
                          onClick={() => restoreMssqlBackupRow(index)}
                          sx={{
                            backgroundColor: '#e8f5e8',
                            border: '2px solid #4caf50',
                            borderRadius: '8px',
                            padding: '12px',
                            minWidth: '48px',
                            minHeight: '48px',
                            boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
                            transition: 'all 0.3s ease',
                            animation: 'pulse 2s infinite',
                            zIndex: 2,
                            '&:hover': {
                              backgroundColor: '#c8e6c9',
                              transform: 'scale(1.1)',
                              boxShadow: '0 6px 12px rgba(76, 175, 80, 0.4)'
                            },
                            '@keyframes pulse': {
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

        {/* SCADA Section */}
        <Box sx={{ marginTop: 4, marginBottom: 3 }}>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            Check <b> D:\SCADA </b> make sure the database is backup in this directory.
          </Typography>
        </Box>

        {/* Add SCADA Item Button */}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addScadaBackupRow}
          sx={{ marginBottom: 2 }}
        >
          Add Item
        </Button>

        {/* SCADA Database Backup Table */}
        <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>SCADA DB Backup are Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scadaBackupData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                    No items added yet. Click "Add Item" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                scadaBackupData.map((row, index) => (
                  <TableRow 
                    key={row.id || `scada-${index}`}
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
                        onChange={(e) => handleScadaBackupChange(index, 'item', e.target.value)}
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
                        value={row.monthlyDBBackupCreated}
                        onChange={(e) => handleScadaBackupChange(index, 'monthlyDBBackupCreated', e.target.value)}
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
                          onClick={() => removeScadaBackupRow(index)}
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
                          onClick={() => restoreScadaBackupRow(index)}
                          sx={{
                            backgroundColor: '#e8f5e8',
                            border: '2px solid #4caf50',
                            borderRadius: '8px',
                            padding: '12px',
                            minWidth: '48px',
                            minHeight: '48px',
                            boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
                            transition: 'all 0.3s ease',
                            animation: 'pulse 2s infinite',
                            zIndex: 2,
                            '&:hover': {
                              backgroundColor: '#c8e6c9',
                              transform: 'scale(1.1)',
                              boxShadow: '0 6px 12px rgba(76, 175, 80, 0.4)'
                            },
                            '@keyframes pulse': {
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
            onChange={(e) => handleRemarksChange(e.target.value)}
            placeholder="Enter any additional remarks or observations..."
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              }
            }}
          />
        </Box>

        {/* Latest Backup File Name Section */}
        <Box sx={{ marginTop: 3 }}>
          <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
            📁 Latest Backup File Name
          </Typography>
          
          <TextField
            fullWidth
            variant="outlined"
            label="Latest Backup File Name"
            value={latestBackupFileName}
            onChange={(e) => handleLatestBackupFileNameChange(e.target.value)}
            placeholder="Enter the latest backup file name..."
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              }
            }}
          />
        </Box>
      </Paper>

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
    </>
  );
};

export default DatabaseBackup_Edit;