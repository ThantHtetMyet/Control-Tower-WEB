import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';

// Import the yes/no status service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const AutoFailOver_Review = ({ data }) => {
  const [autoFailOverData, setAutoFailOverData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);

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

  // Initialize data from props
  useEffect(() => {
    if (data) {
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
    }
  }, [data]);

  // Fetch YesNo Status options on component mount
  useEffect(() => {
    const fetchYesNoStatuses = async () => {
      try {
        const response = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching yes/no status options:', error);
      }
    };

    fetchYesNoStatuses();
  }, []);

  // Get status name by ID
  const getStatusName = (id, options) => {
    const status = options.find(option => option.ID === id || option.id === id);
    return status ? (status.Name || status.name) : id;
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
                  disabled
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
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
                  variant="outlined"
                  value={getStatusName(autoFailOverData[index]?.result, yesNoStatusOptions) || ''}
                  size="small"
                  disabled
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                    }
                  }}
                />
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