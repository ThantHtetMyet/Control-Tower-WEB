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
  Add as AddIcon,
  Delete as DeleteIcon,
  SwapHoriz as SwapIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';

// Import the YesNoStatus service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const AutoFailOver = ({ data, onDataChange, onStatusChange }) => {
  const [autoFailOverData, setAutoFailOverData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data from props only once
  useEffect(() => {
    if (data && !isInitialized.current) {
      if (data.autoFailOverData && data.autoFailOverData.length > 0) {
        setAutoFailOverData(data.autoFailOverData);
      } else {
        // Initialize with proper server data for each scenario
        setAutoFailOverData(failoverScenarios.map((scenario, index) => ({ 
          serialNumber: index + 1,
          failoverType: scenario.type,
          toServer: index === 0 ? 'SCA-SR2' : 'SCA-SR1',  // First scenario: SCA-SR1 to SCA-SR2, Second: SCA-SR2 to SCA-SR1
          fromServer: index === 0 ? 'SCA-SR1' : 'SCA-SR2', // First scenario: from SCA-SR1, Second: from SCA-SR2
          expectedResult: scenario.expectedResult,
          result: '' 
        })));
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
        setYesNoStatusOptions([]);
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
        autoFailOverData,
        remarks
      });
    }
  }, [autoFailOverData, remarks, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const hasResults = autoFailOverData.some(item => 
      item.result && item.result !== ''
    );
    const hasRemarks = remarks && remarks.trim() !== '';
    
    const isCompleted = hasResults && hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('AutoFailOver', isCompleted);
    }
  }, [autoFailOverData, remarks, onStatusChange]);

  // AutoFailOver handlers
  const handleAutoFailOverChange = (index, field, value) => {
    const updatedData = [...autoFailOverData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setAutoFailOverData(updatedData);
  };

  const addAutoFailOverRow = () => {
    const newRow = { 
      serialNumber: autoFailOverData.length + 1,
      result: ''
    };
    setAutoFailOverData([...autoFailOverData, newRow]);
  };

  const removeAutoFailOverRow = (index) => {
    const updatedData = autoFailOverData.filter((_, i) => i !== index);
    // Update serial numbers after removal
    const reNumberedData = updatedData.map((item, i) => ({
      ...item,
      serialNumber: i + 1
    }));
    setAutoFailOverData(reNumberedData);
  };

  // Predefined failover scenarios for display
  const failoverScenarios = [
    {
      type: 'Failover from SCA-SR1 to SCA-SR2',
      procedure: [
        'Perform a system shutdown on SCA-SR1',
        'Check the System Server status page.'
      ],
      expectedResult: 'SCA-SR2 will become master. RTUs continue reporting data to SCADA'
    },
    {
      type: 'Failover from SCA-SR2 to SCA-SR1',
      procedure: [
        'Start SCA-SR1 and wait for 5 minutes for SCA-SR1 to boot up.',
        'Perform a system shutdown on SCA-SR2',
        'Check the System Server status page.'
      ],
      expectedResult: 'SCA-SR1 will become master. RTUs continue reporting data to SCADA'
    }
  ];

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
        <SwapIcon /> Auto Failover of SCADA Server
      </Typography>
      
      {/* AutoFailOver Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2, fontWeight: 'bold', color: '#333' }}>
          Auto failover of SCADA server testing procedures:
        </Typography>
        
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666', textAlign: 'center' }}>
          <strong>Note:</strong> Make sure both SCADA servers are online after completing the test.
        </Typography>
      </Box>

      {/* Failover Test Sections */}
      {failoverScenarios.map((scenario, index) => {
        // Ensure we have data for this scenario
        if (!autoFailOverData[index]) {
          const newRow = { 
            serialNumber: index + 1,
            failoverType: scenario.type,
            toServer: index === 0 ? 'SCA-SR2' : 'SCA-SR1',  // First scenario: SCA-SR1 to SCA-SR2, Second: SCA-SR2 to SCA-SR1
            fromServer: index === 0 ? 'SCA-SR1' : 'SCA-SR2', // First scenario: from SCA-SR1, Second: from SCA-SR2
            expectedResult: scenario.expectedResult,
            result: ''
          };
          setAutoFailOverData(prev => {
            const updated = [...prev];
            updated[index] = newRow;
            return updated;
          });
        }
        
        return (
          <Box key={index} sx={{ marginBottom: 3, padding: 2, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px solid #e9ecef' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1, color: '#1976d2' }}>
              <ComputerIcon sx={{ fontSize: 20, marginRight: 1, verticalAlign: 'middle' }} />
              {scenario.type}
            </Typography>
            
            <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: 1, color: '#555' }}>
              Procedure:
            </Typography>
            <Box component="ol" sx={{ paddingLeft: 2, marginBottom: 2 }}>
              {scenario.procedure.map((step, stepIndex) => (
                <Typography component="li" key={stepIndex} variant="body2" sx={{ marginBottom: 0.5, color: '#666' }}>
                  {step}
                </Typography>
              ))}
            </Box>
            
            {/* Expected Result and Result in horizontal layout */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: 1, color: '#555' }}>
                  Expected Result:
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={scenario.expectedResult}
                  multiline
                  rows={2}
                  size="small"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                    }
                  }}
                />
              </Box>
              
              <Box sx={{ width: 200 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: 1, color: '#555' }}>
                  Result
                </Typography>
                <TextField
                  fullWidth
                  select
                  variant="outlined"
                  value={autoFailOverData[index]?.result || ''}
                  onChange={(e) => handleAutoFailOverChange(index, 'result', e.target.value)}
                  size="small"
                  disabled={loading}
                  sx={{
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
                      '-'
                    )}
                  </MenuItem>
                  {yesNoStatusOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
          </Box>
        );
      })}

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

export default AutoFailOver;