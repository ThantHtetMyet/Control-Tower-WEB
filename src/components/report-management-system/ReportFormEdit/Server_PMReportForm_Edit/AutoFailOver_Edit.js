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
  CircularProgress,
  MenuItem,
  Divider
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';

// Import the YesNoStatus service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const AutoFailOver_Edit = ({ data, onDataChange, onStatusChange }) => {
  const [autoFailOverData, setAutoFailOverData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data when meaningful data is available
  useEffect(() => {
    // Check if we have meaningful data to initialize with
    const hasData = data && (
      (data.pmServerFailOvers && data.pmServerFailOvers.length > 0) ||
      (data.autoFailOverData && data.autoFailOverData.length > 0) ||
      data.remarks || 
      (data.result && data.result.trim() !== '')
    );
    
    if (hasData && !isInitialized.current) {
      // Handle new API structure with pmServerFailOvers
      if (data.pmServerFailOvers && data.pmServerFailOvers.length > 0) {
        const failOverRecord = data.pmServerFailOvers[0];
        const details = failOverRecord.details || failOverRecord.Details || [];
        
        // Transform API data to component format
        const transformedData = details.map((detail, index) => {
          // Determine failover type based on fromServer and toServer
          let failoverType = 'N/A';
          if (detail.fromServer === 'SCA-SR1' && detail.toServer === 'SCA-SR2') {
            failoverType = 'Failover from SCA-SR1 to SCA-SR2';
          } else if (detail.fromServer === 'SCA-SR2' && detail.toServer === 'SCA-SR1') {
            failoverType = 'Failover from SCA-SR2 to SCA-SR1';
          }

          return {
            id: detail.id || detail.ID,
            serialNumber: detail.serialNo || detail.SerialNo || (index + 1),
            failoverType: failoverType,
            fromServer: detail.fromServer || detail.FromServer,
            toServer: detail.toServer || detail.ToServer,
            expectedResult: detail.expectedResult || detail.ExpectedResult || failoverScenarios[index]?.expectedResult || 'N/A',
            result: detail.yesNoStatusID || detail.YesNoStatusID || detail.result || detail.Result || '',
            resultStatusName: detail.yesNoStatusName || detail.YesNoStatusName || detail.resultStatusName || detail.ResultStatusName,
            isNew: !detail.id && !detail.ID,
            isModified: false,
            isDeleted: false
          };
        });
        
        setAutoFailOverData(transformedData);
        setRemarks(failOverRecord.remarks || failOverRecord.Remarks || '');
      }
      // Handle legacy autoFailOverData structure
      else if (data.autoFailOverData && data.autoFailOverData.length > 0) {
        const transformedData = data.autoFailOverData.map((item, index) => ({
          ...item,
          isNew: !item.id,
          isModified: false,
          isDeleted: false
        }));
        setAutoFailOverData(transformedData);
        setRemarks(data.remarks || '');
      }
      // Handle direct data structure
      else {
        setRemarks(data.remarks || '');
      }
      
      isInitialized.current = true;
    }
    // Initialize with default scenarios if no data
    else if (!hasData && !isInitialized.current) {
      setAutoFailOverData(failoverScenarios.map((scenario, index) => ({ 
        serialNumber: index + 1,
        failoverType: scenario.type,
        toServer: index === 0 ? 'SCA-SR2' : 'SCA-SR1',
        fromServer: index === 0 ? 'SCA-SR1' : 'SCA-SR2',
        expectedResult: scenario.expectedResult,
        result: '',
        isNew: true,
        isModified: false,
        isDeleted: false
      })));
      setRemarks('');
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
      // Transform data back to API format for saving
      const activeData = autoFailOverData.filter(item => !item.isDeleted);
      
      const dataToSend = {
        autoFailOverData: autoFailOverData.filter(item => !item.isDeleted),
        remarks
      };
      onDataChange(dataToSend);
    }
  }, [autoFailOverData, remarks, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const activeItems = autoFailOverData.filter(item => !item.isDeleted);
    const hasResults = activeItems.some(item => 
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
    updatedData[index] = { 
      ...updatedData[index], 
      [field]: value,
      isModified: updatedData[index].id ? true : updatedData[index].isModified
    };
    setAutoFailOverData(updatedData);
  };

  // Handle result change
  const handleResultChange = (index, value) => {
    const updatedData = [...autoFailOverData];
    updatedData[index].result = value;
    setAutoFailOverData(updatedData);
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

  const restoreAutoFailOverRow = (index) => {
    const updatedData = [...autoFailOverData];
    updatedData[index] = { ...updatedData[index], isDeleted: false };
    setAutoFailOverData(updatedData);
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
      {autoFailOverData.filter(item => !item.isDeleted).length === 0 ? (
        <Box sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
          <Typography variant="body2">
            No auto failover data available
          </Typography>
        </Box>
      ) : (
        autoFailOverData.filter(item => !item.isDeleted).map((failoverItem, index) => {
          const scenario = failoverScenarios[index] || {
            type: failoverItem.failoverType || `Failover Test ${index + 1}`,
            procedure: ['Check failover functionality'],
            expectedResult: failoverItem.expectedResult || 'System should failover successfully'
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
                  <TextField
                    fullWidth
                    select
                    variant="outlined"
                    value={failoverItem.result || ''}
                    onChange={(e) => handleAutoFailOverChange(autoFailOverData.findIndex(item => item === failoverItem), 'result', e.target.value)}
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
                        'Select Result'
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

export default AutoFailOver_Edit;