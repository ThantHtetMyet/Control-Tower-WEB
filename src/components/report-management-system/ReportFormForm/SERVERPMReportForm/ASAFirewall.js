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
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

// Import the API services
import asaFirewallStatusService from '../../../api-services/asaFirewallStatusService';
import resultStatusService from '../../../api-services/resultStatusService';

const ASAFirewall = ({ data, onDataChange, onStatusChange }) => {
  const [asaFirewallData, setAsaFirewallData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [asaFirewallStatusOptions, setAsaFirewallStatusOptions] = useState([]);
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data from props only once
  useEffect(() => {
    if (data && !isInitialized.current) {
      if (data.asaFirewallData && data.asaFirewallData.length > 0) {
        setAsaFirewallData(data.asaFirewallData);
      } else {
        // Initialize with default data
        setAsaFirewallData([
          { 
            serialNumber: 1,
            commandInput: 'show cpu usage',
            expectedResultId: '',
            doneId: ''
          },
          { 
            serialNumber: 2,
            commandInput: 'show environment',
            expectedResultId: '',
            doneId: ''
          }
        ]);
      }
      
      if (data.remarks) {
        setRemarks(data.remarks);
      }
      
      isInitialized.current = true;
    }
  }, [data]);

  // Fetch ASA Firewall Status options
  useEffect(() => {
    const fetchAsaFirewallStatusOptions = async () => {
      try {
        setLoading(true);
        const response = await asaFirewallStatusService.getAll();
        setAsaFirewallStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching ASA Firewall Status options:', error);
        setAsaFirewallStatusOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAsaFirewallStatusOptions();
  }, []);

  // Fetch Result Status options
  useEffect(() => {
    const fetchResultStatusOptions = async () => {
      try {
        setLoading(true);
        const response = await resultStatusService.getResultStatuses();
        setResultStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching Result Status options:', error);
        setResultStatusOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResultStatusOptions();
  }, []);

  // Calculate status based on data completeness
  useEffect(() => {
    const calculateStatus = () => {
      if (asaFirewallData.length === 0) return 'pending';
      
      const allFieldsFilled = asaFirewallData.every(item => 
        item.commandInput && 
        item.expectedResultId && 
        item.doneId
      );
      
      if (allFieldsFilled && remarks.trim()) {
        return 'completed';
      } else if (asaFirewallData.some(item => item.commandInput || item.expectedResultId || item.doneId) || remarks.trim()) {
        return 'in-progress';
      } else {
        return 'pending';
      }
    };

    const status = calculateStatus();
    if (onStatusChange) {
      onStatusChange('asaFirewall', status);
    }
  }, [asaFirewallData, remarks, onStatusChange]);

  // Handle data changes and propagate to parent
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      onDataChange({
        asaFirewallData,
        remarks
      });
    }
  }, [asaFirewallData, remarks, onDataChange]);

  // Add new row
  // const handleAddRow = () => {
  //   const newRow = {
  //     serialNumber: asaFirewallData.length + 1,
  //     commandInput: '',
  //     expectedResultId: '',
  //     doneId: ''
  //   };
  //   setAsaFirewallData([...asaFirewallData, newRow]);
  // };

  // Remove row
  const handleRemoveRow = (index) => {
    const updatedData = asaFirewallData.filter((_, i) => i !== index);
    // Update serial numbers
    const reNumberedData = updatedData.map((item, i) => ({
      ...item,
      serialNumber: i + 1
    }));
    setAsaFirewallData(reNumberedData);
  };

  // Handle input changes
  const handleInputChange = (index, field, value) => {
    const updatedData = [...asaFirewallData];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value
    };
    setAsaFirewallData(updatedData);
  };

  // Handle remarks change
  const handleRemarksChange = (event) => {
    setRemarks(event.target.value);
  };

  return (
    <Box sx={{ padding: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: 3,
        padding: 2,
        backgroundColor: '#f5f5f5',
        borderRadius: 1
      }}>
        <SecurityIcon sx={{ marginRight: 1, color: '#1976d2' }} />
        <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          ASA Firewall Maintenance
        </Typography>
      </Box>

      {/* Description */}
      <Box sx={{ marginBottom: 3, padding: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          To check for ASA firewall health and backup of running configuration
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          <strong>Procedure:</strong>
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: 2, marginBottom: 1 }}>
          1. Connect to ASDM application from SCADA server
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: 2, marginBottom: 2 }}>
          2. Access to ASA firewall CLI and input commands below
        </Typography>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>S/N</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Command Input</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Expected Result</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Done</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {asaFirewallData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.serialNumber}</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.commandInput}
                    onChange={(e) => handleInputChange(index, 'commandInput', e.target.value)}
                    placeholder="Enter command"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={row.expectedResultId}
                    onChange={(e) => handleInputChange(index, 'expectedResultId', e.target.value)}
                    disabled={loading}
                  >
                    {asaFirewallStatusOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={row.doneId}
                    onChange={(e) => handleInputChange(index, 'doneId', e.target.value)}
                    disabled={loading}
                  >
                    {resultStatusOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleRemoveRow(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Additional Steps */}
      <Box sx={{ marginBottom: 3, padding: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          3. Check for firewall overview to ensure everything is running fine
        </Typography>
        <Typography variant="body2">
          4. Backup the configuration to D drive of SCADA svr1
        </Typography>
      </Box>

      <Divider sx={{ marginY: 3 }} />

      {/* Remarks Section */}
      <Box sx={{ 
        padding: 3, 
        backgroundColor: '#ffffff', 
        borderRadius: 2, 
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#1976d2', 
            fontWeight: 'bold', 
            marginBottom: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          📝 Remarks
        </Typography>
        <TextField
          label="Additional Notes"
          fullWidth
          multiline
          rows={4}
          value={remarks}
          onChange={handleRemarksChange}
          placeholder="Enter any additional remarks or observations..."
          sx={{ 
            backgroundColor: '#ffffff',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: '#1976d2',
              },
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default ASAFirewall;