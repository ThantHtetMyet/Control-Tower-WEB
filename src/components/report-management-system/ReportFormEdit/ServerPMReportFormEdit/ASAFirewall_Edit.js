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

const ASAFirewall_Edit = ({ data, onDataChange, onStatusChange }) => {
  const [asaFirewallData, setAsaFirewallData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [asaFirewallStatusOptions, setAsaFirewallStatusOptions] = useState([]);
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data from props when meaningful data is available
  useEffect(() => {
    // Check if we have meaningful data to initialize with
    const hasData = data && ((data.details && data.details.length > 0) ||
                            (data.asaFirewallData && data.asaFirewallData.length > 0) ||
                            (data.remarks && data.remarks.trim() !== ''));
    
    if (hasData && !isInitialized.current) {
      if (data.details && data.details.length > 0) {
        // Map from legacy format
        const mappedData = data.details.map(item => ({
          serialNumber: item.serialNumber,
          commandInput: item.commandInput,
          expectedResultId: item.asaFirewallStatusID || '',
          doneId: item.resultStatusID || ''
        }));
        setAsaFirewallData(mappedData);
      } else if (data.asaFirewallData && data.asaFirewallData.length > 0) {
        setAsaFirewallData(data.asaFirewallData);
      } else {
        // Initialize with default data and auto-select expected results
        setAsaFirewallData([
          { 
            serialNumber: 1,
            commandInput: 'show cpu usage',
            expectedResultId: 'cpu-usage-ok', // Auto-select appropriate result
            doneId: ''
          },
          { 
            serialNumber: 2,
            commandInput: 'show environment',
            expectedResultId: 'hardware-health-ok', // Auto-select appropriate result
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

  // Auto-assign expected results after options are loaded
  useEffect(() => {
    if (asaFirewallStatusOptions.length > 0 && asaFirewallData.length > 0) {
      console.log('Available ASA Firewall Status Options:', asaFirewallStatusOptions);
      
      const updatedData = asaFirewallData.map(item => {
        if (item.commandInput === 'show cpu usage') {
          // Find "CPU Usage <80%" option
          const cpuOption = asaFirewallStatusOptions.find(option => 
            option.name && option.name.includes('CPU Usage <80%')
          );
          console.log('CPU Option found:', cpuOption);
          return { ...item, expectedResultId: cpuOption ? cpuOption.id : '' };
        } else if (item.commandInput === 'show environment') {
          // Find "Overall hardware health" option
          const envOption = asaFirewallStatusOptions.find(option => 
            option.name && option.name.includes('Overall hardware health')
          );
          console.log('Environment Option found:', envOption);
          return { ...item, expectedResultId: envOption ? envOption.id : '' };
        }
        return item;
      });

      // Only update if there are actual changes
      if (JSON.stringify(updatedData) !== JSON.stringify(asaFirewallData)) {
        console.log('Updating ASA Firewall Data:', updatedData);
        setAsaFirewallData(updatedData);
      }
    }
  }, [asaFirewallStatusOptions, asaFirewallData]);

  // Update parent component when data changes (but not on initial load)
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      // Validate and clean data before sending to parent
      const validatedData = asaFirewallData.map(item => ({
        ...item,
        // Only send expectedResultId if it exists in the options
        expectedResultId: asaFirewallStatusOptions.some(option => option.id === item.expectedResultId) 
          ? item.expectedResultId 
          : '',
        // Only send doneId if it exists in the options  
        doneId: resultStatusOptions.some(option => option.id === item.doneId)
          ? item.doneId
          : ''
      }));

      console.log('Sending validated data to parent:', validatedData);
      
      onDataChange({
        asaFirewallData: validatedData,
        remarks
      });
    }
  }, [asaFirewallData, remarks, onDataChange, asaFirewallStatusOptions, resultStatusOptions]);

  // Calculate completion status
  useEffect(() => {
    const hasData = asaFirewallData.some(item => 
      item.expectedResultId || item.doneId
    );
    const hasRemarks = remarks && remarks.trim() !== '';
    
    const isCompleted = hasData && hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('ASAFirewall_Edit', isCompleted);
    }
  }, [asaFirewallData, remarks, onStatusChange]);

  // Event handlers
  const handleInputChange = (index, field, value) => {
    const updatedData = [...asaFirewallData];
    
    // Validate the value before setting
    if (field === 'expectedResultId') {
      // Only allow valid expectedResultId values
      const isValidOption = value === '' || asaFirewallStatusOptions.some(option => option.id === value);
      if (!isValidOption) {
        console.warn('Invalid expectedResultId:', value);
        return;
      }
    }
    
    if (field === 'doneId') {
      // Only allow valid doneId values
      const isValidOption = value === '' || resultStatusOptions.some(option => option.id === value);
      if (!isValidOption) {
        console.warn('Invalid doneId:', value);
        return;
      }
    }
    
    updatedData[index] = {
      ...updatedData[index],
      [field]: value
    };

    // Auto-set expected result based on command input
    if (field === 'commandInput') {
      const expectedResultMapping = {
        'show cpu usage': 'CPU Usage <80%',
        'show environment': 'Overall hardware health'
      };
      
      const expectedResultName = expectedResultMapping[value.toLowerCase()];
      if (expectedResultName) {
        const expectedResultOption = asaFirewallStatusOptions.find(
          option => option.name === expectedResultName
        );
        if (expectedResultOption) {
          updatedData[index].expectedResultId = expectedResultOption.id;
        }
      }
    }

    setAsaFirewallData(updatedData);
  };

  const handleRemarksChange = (e) => {
    setRemarks(e.target.value);
  };

  const handleAddRow = () => {
    const newRow = {
      serialNumber: asaFirewallData.length + 1,
      commandInput: '',
      expectedResultId: '',
      doneId: ''
    };
    setAsaFirewallData([...asaFirewallData, newRow]);
  };

  const handleRemoveRow = (index) => {
    const updatedData = asaFirewallData.filter((_, i) => i !== index);
    // Update serial numbers after removal
    const reNumberedData = updatedData.map((item, i) => ({
      ...item,
      serialNumber: i + 1
    }));
    setAsaFirewallData(reNumberedData);
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
        <SecurityIcon /> ASA Firewall Maintenance
      </Typography>
      
      {/* Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2, fontWeight: 'bold', color: '#333' }}>
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
                  >
                    <MenuItem value="">
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={16} />
                          Loading...
                        </Box>
                      ) : (
                        '-'
                      )}
                    </MenuItem>
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
                    <MenuItem value="">
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={16} />
                          Loading...
                        </Box>
                      ) : (
                        '-'
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

export default ASAFirewall_Edit;