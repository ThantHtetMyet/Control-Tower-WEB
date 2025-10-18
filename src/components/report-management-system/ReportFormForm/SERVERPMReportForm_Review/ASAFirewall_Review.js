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
  MenuItem,
  Divider
} from '@mui/material';
import {
  Security as SecurityIcon
} from '@mui/icons-material';

// Import the API services
import asaFirewallStatusService from '../../../api-services/asaFirewallStatusService';
import resultStatusService from '../../../api-services/resultStatusService';

const ASAFirewall_Review = ({ data, disabled = true }) => {
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
        // Initialize with default data for display
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

  // Fetch ASA Firewall Status options for display
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

  // Fetch Result Status options for display
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

  // Get status name by ID
  const getStatusName = (id, options) => {
    const status = options.find(option => option.ID === id || option.id === id);
    return status ? (status.Name || status.name) : id;
  };

  const disabledFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f9f9f9',
      '& fieldset': {
        borderColor: '#e0e0e0'
      }
    },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#666 !important',
      color: '#666 !important'
    }
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
              <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Command Input</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Expected Result</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Done</TableCell>
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
                    disabled={disabled}
                    placeholder="Enter command"
                    sx={disabledFieldStyle}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={getStatusName(row.expectedResultId, asaFirewallStatusOptions) || ''}
                    disabled={disabled || loading}
                    sx={disabledFieldStyle}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={getStatusName(row.doneId, resultStatusOptions) || ''}
                    disabled={disabled || loading}
                    sx={disabledFieldStyle}
                  />
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
          disabled={disabled}
          placeholder="Enter any additional remarks or observations..."
          sx={disabledFieldStyle}
        />
      </Box>
    </Box>
  );
};

export default ASAFirewall_Review;