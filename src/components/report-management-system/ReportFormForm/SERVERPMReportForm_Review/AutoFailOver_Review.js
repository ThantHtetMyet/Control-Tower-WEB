import React, { useState, useEffect } from 'react';
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
  Divider
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';

// Import the YesNoStatus service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const AutoFailOver_Review = ({ data }) => {
  const [autoFailOverData, setAutoFailOverData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Failover scenarios
  const failoverScenarios = [
    {
      type: 'Primary to Secondary',
      expectedResult: 'SCADA system should automatically switch to secondary server within 30 seconds'
    },
    {
      type: 'Secondary to Primary',
      expectedResult: 'SCADA system should automatically switch back to primary server when available'
    }
  ];

  // Initialize data from props
  useEffect(() => {
    if (data) {
      if (data.autoFailOverData && data.autoFailOverData.length > 0) {
        setAutoFailOverData(data.autoFailOverData);
      } else {
        // Initialize with default scenario data for display
        setAutoFailOverData(failoverScenarios.map((scenario, index) => ({ 
          serialNumber: index + 1,
          failoverType: scenario.type,
          toServer: index === 0 ? 'SCA-SR2' : 'SCA-SR1',
          fromServer: index === 0 ? 'SCA-SR1' : 'SCA-SR2',
          expectedResult: scenario.expectedResult,
          result: '' 
        })));
      }
      
      if (data.remarks) {
        setRemarks(data.remarks);
      }
    }
  }, [data]);

  // Fetch YesNoStatus options for display
  useEffect(() => {
    const fetchYesNoStatuses = async () => {
      try {
        setLoading(true);
        const response = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching yes/no status options:', error);
        setYesNoStatusOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchYesNoStatuses();
  }, []);

  // Get yes/no status name by id
  const getYesNoStatusName = (id) => {
    const status = yesNoStatusOptions.find(option => option.id === id);
    return status ? status.name : id;
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
        <SwapIcon /> Auto failover of SCADA server
      </Typography>
      
      {/* Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Test the automatic failover functionality between primary and secondary SCADA servers.
        </Typography>
        
        <Box sx={{ 
          padding: 2, 
          backgroundColor: '#e3f2fd', 
          borderRadius: 1, 
          border: '1px solid #2196f3',
          marginBottom: 2
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2', marginBottom: 1 }}>
            📋 Test Procedure:
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            1. Simulate primary server failure by disconnecting network or stopping services
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            2. Monitor automatic failover to secondary server
          </Typography>
          <Typography variant="body2">
            3. Restore primary server and verify automatic failback
          </Typography>
        </Box>
      </Box>

      {/* Auto Failover Test Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Failover Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>From Server</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>To Server</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Expected Result</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {autoFailOverData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No auto failover test data available.
                </TableCell>
              </TableRow>
            ) : (
              autoFailOverData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.serialNumber}
                      disabled
                      size="small"
                      sx={{ width: '60px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.failoverType}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ComputerIcon color="primary" />
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={row.fromServer}
                        disabled
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ComputerIcon color="secondary" />
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={row.toServer}
                        disabled
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      variant="outlined"
                      value={row.expectedResult}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={loading ? 'Loading...' : getYesNoStatusName(row.result)}
                      disabled
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ marginY: 3 }} />

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
          disabled
          placeholder="No remarks provided"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f5f5f5',
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default AutoFailOver_Review;