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
  Storage as StorageIcon,
} from '@mui/icons-material';

// Import the yes/no status service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const MonthlyDatabaseCreation = ({ data, onDataChange, onStatusChange }) => {
  const [monthlyDatabaseData, setMonthlyDatabaseData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data from props only once
  useEffect(() => {
    if (data && !isInitialized.current) {
      if (data.monthlyDatabaseData && data.monthlyDatabaseData.length > 0) {
        setMonthlyDatabaseData(data.monthlyDatabaseData);
      }
      if (data.remarks) {
        setRemarks(data.remarks);
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
        monthlyDatabaseData,
        remarks
      });
    }
  }, [monthlyDatabaseData, remarks, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const hasMonthlyDatabaseData = monthlyDatabaseData.some(item => 
      item.item.trim() !== '' && item.monthlyDBCreated !== ''
    );
    const hasRemarks = remarks.trim() !== '';
    
    const isCompleted = hasMonthlyDatabaseData && hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('MonthlyDatabaseCreation', isCompleted);
    }
  }, [monthlyDatabaseData, remarks, onStatusChange]);

  // Monthly Database Creation handlers
  const handleMonthlyDatabaseChange = (index, field, value) => {
    const updatedData = [...monthlyDatabaseData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setMonthlyDatabaseData(updatedData);
  };

  const addMonthlyDatabaseRow = () => {
    setMonthlyDatabaseData([...monthlyDatabaseData, { item: '', monthlyDBCreated: '' }]);
  };

  const removeMonthlyDatabaseRow = (index) => {
    const updatedData = monthlyDatabaseData.filter((_, i) => i !== index);
    setMonthlyDatabaseData(updatedData);
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
                      onChange={(e) => handleMonthlyDatabaseChange(index, 'item', e.target.value)}
                      placeholder="Enter item description"
                      size="small"
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
                  <TableCell>
                    <IconButton
                      onClick={() => removeMonthlyDatabaseRow(index)}
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

export default MonthlyDatabaseCreation;