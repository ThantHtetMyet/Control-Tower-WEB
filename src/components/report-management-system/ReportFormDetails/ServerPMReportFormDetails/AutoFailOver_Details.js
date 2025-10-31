import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Paper
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const AutoFailOver_Details = ({ data, disabled = false }) => {
  const [autoFailOverData, setAutoFailOverData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);

  // Fetch YesNoStatus options on component mount
  useEffect(() => {
    const fetchYesNoStatusOptions = async () => {
      try {
        const response = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching yes/no status options:', error);
      }
    };

    fetchYesNoStatusOptions();
  }, []);

  // Transform API data when it changes
  useEffect(() => {
    
    if (!data) {
      setAutoFailOverData([]);
      setRemarks('');
      return;
    }

    try {
      // Handle different possible data structures
      let failOverArray = null;
      let remarksValue = '';

      // Check if data is the failover array directly
      if (Array.isArray(data)) {
        failOverArray = data;
      }
      // Check for nested pmServerFailOvers property
      else if (data.pmServerFailOvers && Array.isArray(data.pmServerFailOvers)) {
        failOverArray = data.pmServerFailOvers;
      }
      // Check for other possible property names
      else if (data.autoFailOverData && Array.isArray(data.autoFailOverData)) {
        failOverArray = data.autoFailOverData;
      }

      if (failOverArray && failOverArray.length > 0) {
        const failOverRecord = failOverArray[0];

        // Extract details array
        const details = failOverRecord.details || failOverRecord.Details || [];

        // Extract remarks
        remarksValue = failOverRecord.remarks || failOverRecord.Remarks || '';

        // Transform details data
        const transformedData = details.map((detail, index) => {
          // Determine failover type based on fromServer and toServer
          let failoverType = 'N/A';
          if (detail.fromServer === 'SCA-SR1' && detail.toServer === 'SCA-SR2') {
            failoverType = 'Failover from SCA-SR1 to SCA-SR2';
          } else if (detail.fromServer === 'SCA-SR2' && detail.toServer === 'SCA-SR1') {
            failoverType = 'Failover from SCA-SR2 to SCA-SR1';
          }

          const transformed = {
            id: detail.id || detail.ID || `failover-${index}`,
            serialNumber: detail.serialNo || detail.SerialNo || (index + 1),
            failoverType: failoverType,
            fromServer: detail.fromServer || detail.FromServer,
            toServer: detail.toServer || detail.ToServer,
            expectedResult: detail.expectedResult || detail.ExpectedResult || failoverScenarios[index]?.expectedResult || 'N/A',
            result: detail.result || detail.Result || detail.yesNoStatusID || detail.YesNoStatusID,
            resultStatusName: detail.yesNoStatusName || detail.YesNoStatusName || detail.resultStatusName || detail.ResultStatusName
          };
          return transformed;
        });

        setAutoFailOverData(transformedData);
        setRemarks(remarksValue);
      } else {
        setAutoFailOverData([]);
        setRemarks('');
      }
    } catch (error) {
      setAutoFailOverData([]);
      setRemarks('');
    }
  }, [data]);

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

  // Get yes/no status name by ID
  const getYesNoStatusName = (statusId) => {
    if (!statusId) return 'N/A';
    const status = yesNoStatusOptions.find(option => option.id === statusId);
    return status ? status.name : statusId;
  };

  // Get status color for chip with filled background
  const getStatusColor = (statusName) => {
    if (!statusName) return 'default';
    
    const statusLower = statusName.toString().toLowerCase();
    
    if (statusLower.includes('yes') || statusLower.includes('ok') || statusLower.includes('good') || statusLower.includes('success')) {
      return 'success';
    } else if (statusLower.includes('no') || statusLower.includes('fail') || statusLower.includes('error') || statusLower.includes('bad')) {
      return 'error';
    } else if (statusLower.includes('warning') || statusLower.includes('caution') || statusLower.includes('pending')) {
      return 'warning';
    }
    
    return 'default';
  };

  // Field styling for disabled inputs
  const fieldStyle = {
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000',
      color: '#000000'
    },
    '& .MuiInputLabel-root.Mui-disabled': {
      color: '#666666'
    }
  };

  // Styling to match AutoFailOver.js
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
      {autoFailOverData.length === 0 ? (
        <Box sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
          <Typography variant="body2">
            No auto failover data available
          </Typography>
        </Box>
      ) : (
        autoFailOverData.map((failoverItem, index) => {
          const scenario = failoverScenarios[index] || {
            type: failoverItem.failoverType,
            procedure: ['Check failover functionality'],
            expectedResult: failoverItem.expectedResult
          };
          
          return (
            <Box key={failoverItem.id || index} sx={{ marginBottom: 3, padding: 2, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px solid #e9ecef' }}>
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
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      minHeight: 56, 
                      padding: 1, 
                      backgroundColor: '#ffffff',
                      borderRadius: 1
                    }}>
                      {failoverItem.result ? (
                        <Chip 
                          label={failoverItem.resultStatusName || getYesNoStatusName(failoverItem.result)} 
                          color={getStatusColor(failoverItem.resultStatusName || getYesNoStatusName(failoverItem.result))} 
                          size="medium"
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            height: 32,
                            borderRadius: 2,
                            '& .MuiChip-label': {
                              paddingX: 2,
                              color: 'white'
                            },
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </Box>
                  </Box>
              </Box>
            </Box>
          );
        })
      )}

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
          disabled={disabled}
          sx={fieldStyle}
        />
      </Box>
    </Paper>
  );
};

export default AutoFailOver_Details;