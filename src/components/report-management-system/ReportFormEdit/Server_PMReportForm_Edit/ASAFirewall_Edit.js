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
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Undo as UndoIcon
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const isInitialized = useRef(false);

  // Initialize data when meaningful data is available
  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) return;
    
    // Check if we have meaningful data to initialize with
    const hasData = data && (
      (data.pmServerASAFirewalls && data.pmServerASAFirewalls.length > 0) ||
      (data.asaFirewallData && data.asaFirewallData.length > 0) ||
      data.remarks || 
      (data.result && data.result.trim() !== '')
    );
    
    if (hasData) {
      
      // Handle new API structure with pmServerASAFirewalls
      if (data.pmServerASAFirewalls && data.pmServerASAFirewalls.length > 0) {
        const transformedData = data.pmServerASAFirewalls.map((item, index) => ({
          id: item.id || item.ID,
          serialNumber: item.serialNumber || item.SerialNumber || (index + 1),
          commandInput: item.commandInput || item.CommandInput || '',
          asaFirewallStatusID: item.asaFirewallStatusID || item.ASAFirewallStatusID || '',
          asaFirewallStatusName: item.asaFirewallStatusName || item.ASAFirewallStatusName || '',
          resultStatusID: item.resultStatusID || item.ResultStatusID || '',
          resultStatusName: item.resultStatusName || item.ResultStatusName || '',
          remarks: item.remarks || item.Remarks || '',
          isNew: !item.id && !item.ID,
          isModified: false,
          isDeleted: false
        }));
        
        setAsaFirewallData(transformedData);
        setRemarks(data.remarks || data.pmServerASAFirewalls[0]?.remarks || '');
      }
      // Handle legacy asaFirewallData structure
      else if (data.asaFirewallData && data.asaFirewallData.length > 0) {
        const transformedData = data.asaFirewallData.map((item, index) => ({
          ...item,
          isNew: !item.id,
          isModified: false,
          isDeleted: false
        }));
        setAsaFirewallData(transformedData);
        setRemarks(data.remarks || '');
      }
      // Handle direct data structure
      else {
        setRemarks(data.remarks || '');
      }
    }
    // Initialize with default data if no data
    else if (!hasData) {
      const defaultData = [
        { 
          serialNumber: 1,
          commandInput: 'show cpu usage',
          asaFirewallStatusID: '',
          asaFirewallStatusName: '',
          resultStatusID: '',
          resultStatusName: '',
          remarks: '',
          isNew: true,
          isModified: false,
          isDeleted: false
        },
        { 
          serialNumber: 2,
          commandInput: 'show environment',
          asaFirewallStatusID: '',
          asaFirewallStatusName: '',
          resultStatusID: '',
          resultStatusName: '',
          remarks: '',
          isNew: true,
          isModified: false,
          isDeleted: false
        }
      ];
      setAsaFirewallData(defaultData);
      setRemarks('');
    }
    
    // Always mark as initialized after first render, even if no data
    // This ensures onDataChange will be called when user fills in data
    isInitialized.current = true;
  }, [data]);

  // Snackbar helper function
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

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
      // Transform data back to API format for saving
      const dataToSend = {
        pmServerASAFirewalls: asaFirewallData.map(item => ({
          id: item.id,
          serialNumber: item.serialNumber,
          commandInput: item.commandInput,
          asaFirewallStatusID: item.asaFirewallStatusID,
          asaFirewallStatusName: item.asaFirewallStatusName,
          resultStatusID: item.resultStatusID,
          resultStatusName: item.resultStatusName,
          remarks: item.remarks || remarks,
          isNew: item.isNew,
          isModified: item.isModified,
          isDeleted: item.isDeleted
        })),
        asaFirewallData: asaFirewallData,
        remarks
      };
      onDataChange(dataToSend);
    }
  }, [asaFirewallData, remarks, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const activeItems = asaFirewallData.filter(item => !item.isDeleted);
    const hasResults = activeItems.some(item => 
      item.asaFirewallStatusID && item.resultStatusID
    );
    const hasRemarks = remarks && remarks.trim() !== '';
    
    const isCompleted = hasResults && hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('ASAFirewall_Edit', isCompleted);
    }
  }, [asaFirewallData, remarks, onStatusChange]);

  // Event handlers
  const handleInputChange = (index, field, value) => {
    const updatedData = [...asaFirewallData];
    const item = updatedData[index];
    
    // Mark existing items as modified when changed
    if (item.id && !item.isNew) {
      item.isModified = true;
    }
    
    // Update the field value
    updatedData[index] = {
      ...item,
      [field]: value
    };

    // Update status name when ID changes
    if (field === 'asaFirewallStatusID') {
      const selectedOption = asaFirewallStatusOptions.find(option => option.id === value);
      updatedData[index].asaFirewallStatusName = selectedOption ? selectedOption.name : '';
    }
    
    if (field === 'resultStatusID') {
      const selectedOption = resultStatusOptions.find(option => option.id === value);
      updatedData[index].resultStatusName = selectedOption ? selectedOption.name : '';
    }

    setAsaFirewallData(updatedData);
  };

  const handleRemarksChange = (e) => {
    setRemarks(e.target.value);
  };

  const addAsaFirewallRow = () => {
    const newRow = {
      serialNumber: asaFirewallData.length + 1,
      commandInput: '',
      asaFirewallStatusID: '',
      asaFirewallStatusName: '',
      resultStatusID: '',
      resultStatusName: '',
      remarks: '',
      isNew: true,
      isModified: false,
      isDeleted: false
    };
    setAsaFirewallData([...asaFirewallData, newRow]);
    showSnackbar('New ASA Firewall item added');
  };

  const removeAsaFirewallRow = (index) => {
    const updatedData = [...asaFirewallData];
    const itemToRemove = updatedData[index];
    
    if (itemToRemove.id) {
      // If it has an ID, mark as deleted
      updatedData[index] = {
        ...itemToRemove,
        isDeleted: true,
        isModified: true
      };
      showSnackbar('ASA Firewall item deleted. Click undo to restore.', 'warning');
    } else {
      // If it's a new item (no ID), remove it completely
      updatedData.splice(index, 1);
      // Re-index serial numbers
      updatedData.forEach((item, idx) => {
        item.serialNumber = idx + 1;
      });
      showSnackbar('New ASA Firewall item removed');
    }
    
    setAsaFirewallData(updatedData);
  };

  const restoreAsaFirewallRow = (index) => {
    const updatedData = [...asaFirewallData];
    const item = updatedData[index];
    
    updatedData[index] = { ...item, isDeleted: false };
    setAsaFirewallData(updatedData);
    showSnackbar('ASA Firewall item restored');
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
      <Box sx={{ marginBottom: 3, padding: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
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
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Command Input</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Expected Result</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Done</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {asaFirewallData.map((row, index) => (
              <TableRow 
                key={index}
                sx={{
                  textDecoration: row.isDeleted ? 'line-through' : 'none',
                  opacity: row.isDeleted ? 0.6 : 1,
                  backgroundColor: row.isDeleted ? '#ffebee' : 'inherit'
                }}
              >
                <TableCell>{row.serialNumber}</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.commandInput}
                    onChange={(e) => handleInputChange(index, 'commandInput', e.target.value)}
                    placeholder="Enter command"
                    disabled={true}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={row.asaFirewallStatusID}
                    onChange={(e) => handleInputChange(index, 'asaFirewallStatusID', e.target.value)}
                    disabled={true}
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
                    value={row.resultStatusID}
                    onChange={(e) => handleInputChange(index, 'resultStatusID', e.target.value)}
                    disabled={loading || row.isDeleted}
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
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {row.isDeleted ? (
                      <IconButton
                        size="small"
                        onClick={() => restoreAsaFirewallRow(index)}
                        color="primary"
                        title="Undo Delete"
                      >
                        <UndoIcon />
                      </IconButton>
                    ) : null}
                  </Box>
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ASAFirewall_Edit;