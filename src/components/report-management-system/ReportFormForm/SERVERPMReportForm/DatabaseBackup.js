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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Backup as BackupIcon,
} from '@mui/icons-material';

// Import the yes/no status service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const DatabaseBackup = ({ data, onDataChange, onStatusChange }) => {
  const [mssqlBackupData, setMssqlBackupData] = useState([]);
  const [scadaBackupData, setScadaBackupData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [latestBackupFileName, setLatestBackupFileName] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data from props only once
  useEffect(() => {
    if (data && !isInitialized.current) {
      if (data.mssqlBackupData && data.mssqlBackupData.length > 0) {
        setMssqlBackupData(data.mssqlBackupData);
      }
      if (data.scadaBackupData && data.scadaBackupData.length > 0) {
        setScadaBackupData(data.scadaBackupData);
      }
      if (data.remarks) {
        setRemarks(data.remarks);
      }
      if (data.latestBackupFileName) {
        setLatestBackupFileName(data.latestBackupFileName);
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
        mssqlBackupData,
        scadaBackupData,
        remarks,
        latestBackupFileName
      });
    }
  }, [mssqlBackupData, scadaBackupData, remarks, latestBackupFileName, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const hasMssqlBackupData = mssqlBackupData.some(item => 
      item.item.trim() !== '' && item.monthlyDBBackupCreated !== ''
    );
    const hasScadaBackupData = scadaBackupData.some(item => 
      item.item.trim() !== '' && item.monthlyDBBackupCreated !== ''
    );
    const hasRemarks = remarks.trim() !== '';
    const hasLatestBackupFileName = latestBackupFileName.trim() !== '';
    
    const isCompleted = hasMssqlBackupData && hasScadaBackupData && hasRemarks && hasLatestBackupFileName;
    
    if (onStatusChange) {
      onStatusChange('DatabaseBackup', isCompleted);
    }
  }, [mssqlBackupData, scadaBackupData, remarks, latestBackupFileName, onStatusChange]);

  // MSSQL Backup handlers
  const handleMssqlBackupChange = (index, field, value) => {
    const updatedData = [...mssqlBackupData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setMssqlBackupData(updatedData);
  };

  const addMssqlBackupRow = () => {
    setMssqlBackupData([...mssqlBackupData, { item: '', monthlyDBBackupCreated: '' }]);
  };

  const removeMssqlBackupRow = (index) => {
    const updatedData = mssqlBackupData.filter((_, i) => i !== index);
    setMssqlBackupData(updatedData);
  };

  // SCADA Backup handlers
  const handleScadaBackupChange = (index, field, value) => {
    const updatedData = [...scadaBackupData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setScadaBackupData(updatedData);
  };

  const addScadaBackupRow = () => {
    setScadaBackupData([...scadaBackupData, { item: '', monthlyDBBackupCreated: '' }]);
  };

  const removeScadaBackupRow = (index) => {
    const updatedData = scadaBackupData.filter((_, i) => i !== index);
    setScadaBackupData(updatedData);
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
        <BackupIcon /> Historical Database
      </Typography>
      
      {/* Database Backup Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
          Database Backup
        </Typography>
        
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Check D:\MSSQLSERVER-BACKUP\Monthly make sure the database is backup in this directory.
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
            </TableRow>
          </TableHead>
          <TableBody>
            {mssqlBackupData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No items added yet. Click "Add Item" to get started.
                </TableCell>
              </TableRow>
            ) : (
              mssqlBackupData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {index + 1}
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
                          'Select Status'
                        )}
                      </MenuItem>
                      {yesNoStatusOptions.map((option) => (
                        <MenuItem key={option.id} value={option.name}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </TextField>
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
          Check D:\SCADA make sure the database is backup in this directory.
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
            </TableRow>
          </TableHead>
          <TableBody>
            {scadaBackupData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No items added yet. Click "Add Item" to get started.
                </TableCell>
              </TableRow>
            ) : (
              scadaBackupData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {index + 1}
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
                          'Select Status'
                        )}
                      </MenuItem>
                      {yesNoStatusOptions.map((option) => (
                        <MenuItem key={option.id} value={option.name}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </TextField>
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
          onChange={(e) => setLatestBackupFileName(e.target.value)}
          placeholder="Enter the latest backup file name..."
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

export default DatabaseBackup;