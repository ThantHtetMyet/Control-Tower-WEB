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
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
} from '@mui/icons-material';

// Import the result status service
import resultStatusService from '../../../api-services/resultStatusService';

const HotFixes = ({ data, onDataChange, onStatusChange }) => {
  const [hotFixesData, setHotFixesData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data from props only once
  useEffect(() => {
    if (data && !isInitialized.current) {
      if (data.hotFixesData && data.hotFixesData.length > 0) {
        setHotFixesData(data.hotFixesData);
      }
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
        console.error('Error fetching result status options:', error);
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
        hotFixesData,
        remarks
      });
    }
  }, [hotFixesData, remarks, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const hasHotFixesData = hotFixesData.some(item => 
      item.machineName && item.machineName.trim() !== '' && 
      item.latestHotfixesApplied && item.latestHotfixesApplied.trim() !== '' && 
      item.done !== ''
    );
    const hasRemarks = remarks && remarks.trim() !== '';
    
    const isCompleted = hasHotFixesData && hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('HotFixes', isCompleted);
    }
  }, [hotFixesData, remarks]);

  // HotFixes handlers
  const handleHotFixesChange = (index, field, value) => {
    const updatedData = [...hotFixesData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setHotFixesData(updatedData);
  };

  const addHotFixesRow = () => {
    setHotFixesData([...hotFixesData, { 
      serialNumber: hotFixesData.length + 1,
      machineName: '', 
      latestHotfixesApplied: '', 
      done: '' 
    }]);
  };

  const removeHotFixesRow = (index) => {
    const updatedData = hotFixesData.filter((_, i) => i !== index);
    // Update serial numbers
    const reindexedData = updatedData.map((item, i) => ({
      ...item,
      serialNumber: i + 1
    }));
    setHotFixesData(reindexedData);
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
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                      {row.serialNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.machineName}
                      onChange={(e) => handleHotFixesChange(index, 'machineName', e.target.value)}
                      placeholder="Enter machine name"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.latestHotfixesApplied}
                      onChange={(e) => handleHotFixesChange(index, 'latestHotfixesApplied', e.target.value)}
                      placeholder="e.g., KB4022719"
                      size="small"
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
                      {resultStatusOptions.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => removeHotFixesRow(index)}
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
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default HotFixes;