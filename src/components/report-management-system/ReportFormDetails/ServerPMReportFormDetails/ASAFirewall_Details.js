import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';

const ASAFirewall_Details = ({ data, disabled = false }) => {
  const [asaFirewallData, setAsaFirewallData] = useState([]);
  const [remarks, setRemarks] = useState('');

  // Debug logging
  useEffect(() => {
    console.log('ASAFirewall_Details - Raw data received:', data);
  }, [data]);

  // Data transformation effect
  useEffect(() => {
    if (data) {
      console.log('ASAFirewall_Details - Processing data:', data);
      
      let processedData = [];
      let processedRemarks = '';

      // Handle different data structures
      if (data.pmServerASAFirewalls && Array.isArray(data.pmServerASAFirewalls)) {
        processedData = data.pmServerASAFirewalls;
        processedRemarks = data.pmServerASAFirewalls[0]?.remarks || '';
      } else if (data.PMServerASAFirewalls && Array.isArray(data.PMServerASAFirewalls)) {
        processedData = data.PMServerASAFirewalls;
        processedRemarks = data.PMServerASAFirewalls[0]?.remarks || '';
      } else if (data.asaFirewalls && Array.isArray(data.asaFirewalls)) {
        processedData = data.asaFirewalls;
        processedRemarks = data.asaFirewalls[0]?.remarks || '';
      } else if (data.ASAFirewalls && Array.isArray(data.ASAFirewalls)) {
        processedData = data.ASAFirewalls;
        processedRemarks = data.ASAFirewalls[0]?.remarks || '';
      } else if (Array.isArray(data)) {
        processedData = data;
        processedRemarks = data[0]?.remarks || '';
      } else if (data.details && Array.isArray(data.details)) {
        processedData = data.details;
        processedRemarks = data.remarks || data.details[0]?.remarks || '';
      }

      // Extract remarks from various possible locations
      if (!processedRemarks) {
        processedRemarks = data.remarks || data.Remarks || '';
      }

      console.log('ASAFirewall_Details - Processed data:', processedData);
      console.log('ASAFirewall_Details - Processed remarks:', processedRemarks);

      setAsaFirewallData(processedData);
      setRemarks(processedRemarks);
    }
  }, [data]);

  const getResultStatusColor = (statusName) => {
    if (!statusName) return 'default';
    
    const name = statusName.toLowerCase();
    if (name.includes('pass') || name.includes('ok') || name.includes('good') || name.includes('success')) {
      return 'success';
    } else if (name.includes('fail') || name.includes('error') || name.includes('bad') || name.includes('critical')) {
      return 'error';
    } else if (name.includes('warning') || name.includes('caution')) {
      return 'warning';
    }
    return 'default';
  };

  const fieldStyle = {
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000',
      color: '#000000'
    },
    '& .MuiInputLabel-root.Mui-disabled': {
      color: '#666666'
    }
  };

  // Styling constants matching ASAFirewall.js
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

      {/* Data Display */}
      {asaFirewallData && asaFirewallData.length > 0 ? (
        <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>S/N</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Command Input</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Expected Result</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Result Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asaFirewallData.map((item, index) => (
                <TableRow key={item.id || index}>
                  <TableCell>{item.serialNumber || index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.commandInput || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.asaFirewallStatusName || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.resultStatusName || 'Unknown'}
                      color={getResultStatusColor(item.resultStatusName)}
                      variant="filled"
                      size="small"
                      sx={{
                        fontWeight: 'bold',
                        minWidth: '80px',
                        '& .MuiChip-label': {
                          padding: '0 12px'
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ 
          padding: 3, 
          textAlign: 'center', 
          backgroundColor: '#f5f5f5', 
          borderRadius: 1,
          marginBottom: 3
        }}>
          <Typography variant="body1" color="textSecondary">
            No ASA Firewall data available
          </Typography>
        </Box>
      )}

      {/* Additional Steps */}
      <Box sx={{ marginBottom: 3, padding: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          3. Check for firewall overview to ensure everything is running fine
        </Typography>
        <Typography variant="body2">
          4. Backup the configuration to D drive of SCADA svr1
        </Typography>
      </Box>

      {/* Remarks Section - Matching ASAFirewall.js style */}
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
          disabled={disabled}
          placeholder="Enter any additional remarks or observations..."
          sx={{
            ...fieldStyle,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default ASAFirewall_Details;