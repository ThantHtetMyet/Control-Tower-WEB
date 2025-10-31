import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';

// Import the YesNoStatus service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const AutoFailOver_Edit_Review = ({ data, disabled = true, formData }) => {
  const [autoFailOverData, setAutoFailOverData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Predefined failover scenarios for display (same as AutoFailOver_Review)
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

  // Initialize data from props only once
  useEffect(() => {
    if (!isInitialized.current) {
      //console.log('=== AUTOFAILOVER EDIT REVIEW DEBUG ===');
      //console.log('formData:', formData);
      //console.log('data:', data);
      
      // Get data from formData.autoFailOverData (from AutoFailOver_Edit)
      if (formData && formData.autoFailOverData && formData.autoFailOverData.autoFailOverData) {
        //console.log('Setting autoFailOverData from formData.autoFailOverData.autoFailOverData:', formData.autoFailOverData.autoFailOverData);
        setAutoFailOverData(formData.autoFailOverData.autoFailOverData);
      } else if (data && data.pmServerFailOvers && data.pmServerFailOvers.length > 0) {
        //console.log('Setting autoFailOverData from data.pmServerFailOvers:', data.pmServerFailOvers);
        // Transform API data to match expected format
        const failOverRecord = data.pmServerFailOvers[0];
        const details = failOverRecord.details || failOverRecord.Details || [];
        const transformedData = details.map((detail, index) => ({
          id: detail.id || detail.ID,
          serialNumber: detail.serialNo || detail.SerialNo || (index + 1),
          failoverType: failoverScenarios[index]?.type || `Failover Test ${index + 1}`,
          result: detail.yesNoStatusID || detail.YesNoStatusID || detail.result || detail.Result || '',
          expectedResult: failoverScenarios[index]?.expectedResult || 'System should failover successfully',
          isDeleted: detail.isDeleted || false,
          isNew: detail.isNew || false,
          isModified: detail.isModified || false,
        }));
        setAutoFailOverData(transformedData);
      } else if (data && data.autoFailOverData && data.autoFailOverData.length > 0) {
        //console.log('Setting autoFailOverData from data.autoFailOverData:', data.autoFailOverData);
        setAutoFailOverData(data.autoFailOverData);
      } else {
        // Initialize with default scenarios if no data
        //console.log('Initializing with default failover scenarios');
        setAutoFailOverData(failoverScenarios.map((scenario, index) => ({ 
          serialNumber: index + 1,
          failoverType: scenario.type,
          expectedResult: scenario.expectedResult,
          result: ''
        })));
      }
      
      // Get remarks from AutoFailOver-specific sources
      if (formData && formData.autoFailOverData && formData.autoFailOverData.remarks) {
        //console.log('Setting remarks from formData.autoFailOverData.remarks:', formData.autoFailOverData.remarks);
        setRemarks(formData.autoFailOverData.remarks);
      } else if (data && data.pmServerFailOvers && data.pmServerFailOvers[0]?.remarks) {
        //console.log('Setting remarks from data.pmServerFailOvers[0].remarks:', data.pmServerFailOvers[0].remarks);
        setRemarks(data.pmServerFailOvers[0].remarks);
      } else if (data && data.remarks) {
        //console.log('Setting remarks from data.remarks:', data.remarks);
        setRemarks(data.remarks);
      } else {
        //console.log('No AutoFailOver-specific remarks found');
        setRemarks('');
      }
      
      isInitialized.current = true;
    }
  }, [data, formData]);

  // Fetch Yes/No Status options for display
  useEffect(() => {
    const fetchYesNoStatusOptions = async () => {
      try {
        setLoading(true);
        const response = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching Yes/No Status options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchYesNoStatusOptions();
  }, []);

  // Get status name by ID
  const getStatusName = (id, options) => {
    const status = options.find(option => option.ID === id || option.id === id);
    return status ? (status.Name || status.name) : id;
  };

  // Styling constants (same as AutoFailOver_Review)
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
        // Get the corresponding data for this scenario
        const scenarioData = autoFailOverData[index] || { 
          serialNumber: index + 1,
          failoverType: scenario.type,
          expectedResult: scenario.expectedResult,
          result: ''
        };
        
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
                  value={getStatusName(scenarioData.result, yesNoStatusOptions) || ''}
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

export default AutoFailOver_Edit_Review;