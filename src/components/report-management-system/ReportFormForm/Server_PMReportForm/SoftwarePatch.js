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
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  SystemUpdate as SystemUpdateIcon
} from '@mui/icons-material';

const SoftwarePatch = ({ data, onDataChange, onStatusChange }) => {
  const [softwarePatchData, setSoftwarePatchData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const isInitialized = useRef(false);

  // Initialize data from props only once
  useEffect(() => {
    if (data && !isInitialized.current) {
      if (data.softwarePatchData && data.softwarePatchData.length > 0) {
        setSoftwarePatchData(data.softwarePatchData);
      } else {
        // Initialize with empty array as default
        setSoftwarePatchData([]);
      }
      
      if (data.remarks) {
        setRemarks(data.remarks);
      }
      
      isInitialized.current = true;
    }
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
    const hasData = softwarePatchData.some(item => 
      item.machineName && item.machineName.trim() !== '' &&
      (item.previousPatch && item.previousPatch.trim() !== '' ||
       item.currentPatch && item.currentPatch.trim() !== '')
    );
    const hasRemarks = remarks && remarks.trim() !== '';
    
    const isCompleted = hasData && hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('SoftwarePatch', isCompleted);
    }
  }, [softwarePatchData, remarks, onStatusChange]);

  // Software patch handlers
  const handleSoftwarePatchChange = (index, field, value) => {
    const updatedData = [...softwarePatchData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setSoftwarePatchData(updatedData);
  };

  const addSoftwarePatchRow = () => {
    const newRow = { 
      serialNumber: softwarePatchData.length + 1,
      machineName: '',
      previousPatch: '',
      currentPatch: ''
    };
    setSoftwarePatchData([...softwarePatchData, newRow]);
  };

  const removeSoftwarePatchRow = (index) => {
    const updatedData = softwarePatchData.filter((_, i) => i !== index);
    // Update serial numbers after removal
    const reNumberedData = updatedData.map((item, i) => ({
      ...item,
      serialNumber: i + 1
    }));
    setSoftwarePatchData(reNumberedData);
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

  const tableHeaderStyle = {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    color: '#333',
    border: '1px solid #ddd'
  };

  const tableCellStyle = {
    border: '1px solid #ddd',
    padding: '8px'
  };

  return (
    <Paper sx={sectionContainerStyle}>
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <SystemUpdateIcon /> Software Patch Summary
      </Typography>
      
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
      <TableContainer component={Paper} sx={{ marginBottom: 2, border: '1px solid #ddd' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={tableHeaderStyle} align="center">S/N</TableCell>
              <TableCell sx={tableHeaderStyle} align="center">Machine Name</TableCell>
              <TableCell sx={tableHeaderStyle} align="center">Previous Patch</TableCell>
              <TableCell sx={tableHeaderStyle} align="center">Current Patch</TableCell>
              <TableCell sx={tableHeaderStyle} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {softwarePatchData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No items added yet. Click "Add Item" to get started.
                </TableCell>
              </TableRow>
            ) : (
              softwarePatchData.map((row, index) => (
              <TableRow key={index}>
                <TableCell sx={tableCellStyle} align="center">
                  {row.serialNumber}
                </TableCell>
                <TableCell sx={tableCellStyle}>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.machineName || ''}
                    onChange={(e) => handleSoftwarePatchChange(index, 'machineName', e.target.value)}
                    placeholder="Enter machine name"
                    variant="outlined"
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
                <TableCell sx={tableCellStyle}>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.previousPatch || ''}
                    onChange={(e) => handleSoftwarePatchChange(index, 'previousPatch', e.target.value)}
                    placeholder="Enter previous patch"
                    variant="outlined"
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
                <TableCell sx={tableCellStyle}>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.currentPatch || ''}
                    onChange={(e) => handleSoftwarePatchChange(index, 'currentPatch', e.target.value)}
                    placeholder="Enter current patch"
                    variant="outlined"
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
                <TableCell sx={tableCellStyle} align="center">
                  <IconButton
                    onClick={() => removeSoftwarePatchRow(index)}
                    disabled={softwarePatchData.length === 0}
                    size="small"
                    sx={{
                      color: '#d32f2f',
                      '&:hover': {
                        backgroundColor: '#ffebee'
                      },
                      '&:disabled': {
                        color: '#ccc'
                      }
                    }}
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

export default SoftwarePatch;