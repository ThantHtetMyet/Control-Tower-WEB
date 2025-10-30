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
  CircularProgress
} from '@mui/material';
import {
  Memory as MemoryIcon,
} from '@mui/icons-material';

// Import the CPU and RAM usage image
import CPUAndRamUsageImage from '../../../resources/ServerPMReportForm/CPUAndRamUsage.png';
// Import the result status service
import resultStatusService from '../../../api-services/resultStatusService';

const CPUAndRamUsage_Edit_Review = ({ data, disabled = true, formData }) => {
  const [memoryUsageData, setMemoryUsageData] = useState([]);
  const [cpuUsageData, setCpuUsageData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data from props only once
  useEffect(() => {
    if (!isInitialized.current) {
      // Handle API response format (pmServerCPUAndMemoryUsages)
      if (data && data.pmServerCPUAndMemoryUsages && data.pmServerCPUAndMemoryUsages.length > 0) {
        const apiData = data.pmServerCPUAndMemoryUsages[0]; // Get first item from array
        
        // Process memory usage data
        if (apiData.memoryUsageDetails && apiData.memoryUsageDetails.length > 0) {
          const mappedMemoryData = apiData.memoryUsageDetails.map(detail => ({
            id: detail.id || null,
            serialNo: detail.serialNo || '',
            machineName: detail.serverName || '',
            memorySize: detail.memorySize || '',
            memoryInUse: detail.memoryUsagePercentage || '',
            memoryUsageCheck: detail.resultStatusID || '',
            isDeleted: detail.isDeleted || false,
            isNew: detail.isNew || false,
            isModified: detail.isModified || false,
          }));
          setMemoryUsageData(mappedMemoryData);
        }
        
        // Process CPU usage data
        if (apiData.cpuUsageDetails && apiData.cpuUsageDetails.length > 0) {
          const mappedCpuData = apiData.cpuUsageDetails.map(detail => ({
            id: detail.id || null,
            serialNo: detail.serialNo || '',
            machineName: detail.serverName || '',
            cpuUsage: detail.cpuUsagePercentage || '',
            cpuUsageCheck: detail.resultStatusID || '',
            isDeleted: detail.isDeleted || false,
            isNew: detail.isNew || false,
            isModified: detail.isModified || false,
          }));
          setCpuUsageData(mappedCpuData);
        }
        
        // Set remarks from API data
        if (apiData.remarks) {
          setRemarks(apiData.remarks);
        }
      }
      // Handle direct data format (memoryUsageData and cpuUsageData arrays)
      else if (data && (data.memoryUsageData || data.cpuUsageData)) {
        if (data.memoryUsageData && Array.isArray(data.memoryUsageData)) {
          setMemoryUsageData(data.memoryUsageData);
        }
        if (data.cpuUsageData && Array.isArray(data.cpuUsageData)) {
          setCpuUsageData(data.cpuUsageData);
        }
      }
      // Handle formData format
      else if (formData && (formData.memoryUsageData || formData.cpuUsageData)) {
        if (formData.memoryUsageData && Array.isArray(formData.memoryUsageData)) {
          setMemoryUsageData(formData.memoryUsageData);
        }
        if (formData.cpuUsageData && Array.isArray(formData.cpuUsageData)) {
          setCpuUsageData(formData.cpuUsageData);
        }
      }
      
      // Set remarks
      if (formData && formData.cpuAndRamUsageRemarks) {
        setRemarks(formData.cpuAndRamUsageRemarks);
      } else if (data && data.remarks) {
        setRemarks(data.remarks);
      }
      
      isInitialized.current = true;
    }
  }, [data, formData]);

  // Fetch ResultStatus options on component mount
  useEffect(() => {
    const fetchResultStatuses = async () => {
      try {
        setLoading(true);
        const response = await resultStatusService.getResultStatuses();
        setResultStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching result status options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResultStatuses();
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

  // Styling constants matching CPUAndRamUsage_Edit
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
        <MemoryIcon /> Server CPU and RAM Usage Check - Review
      </Typography>
      
      {/* CPU and RAM Usage Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Using Task Manager, and go to Performance Tab
        </Typography>
        
        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          ○ Right click on the task bar and select task manager
        </Typography>
        
        {/* CPU and RAM Usage Image */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: 2,
          padding: 2,
          backgroundColor: '#f8f9fa',
          borderRadius: 1,
          border: '1px solid #e9ecef'
        }}>
          <img 
            src={CPUAndRamUsageImage} 
            alt="CPU and RAM Usage Check Diagram" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              maxHeight: '500px'
            }} 
          />
        </Box>
        
        <Typography variant="body2" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
          * Note: The SQL Server Database on HDSRS Servers use as much memory as it needs to provide best performance, we limit the memory usage so the overall server memory usage can be up to 90%
        </Typography>
      </Box>

      {/* CPU and RAM Usage Data Table */}
      {/* Memory Usage Data Table */}
      <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
        💾 Memory Usage Check
      </Typography>
      <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Serial No.</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Machine Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Memory Size (GB)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Memory in Use (%)</TableCell>
             <TableCell sx={{ fontWeight: 'bold' }}>Check (Usage &lt; 80%?)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {memoryUsageData && memoryUsageData.length > 0 ? (
              memoryUsageData
                .filter(usage => !usage.isDeleted)
                .map((usage, index) => (
                  <TableRow key={usage.id || index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={usage.serialNo || ''}
                        disabled
                        sx={disabledFieldStyle}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={usage.machineName || ''}
                        disabled
                        sx={disabledFieldStyle}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={usage.memorySize || ''}
                        disabled
                        sx={disabledFieldStyle}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={usage.memoryInUse || ''}
                        disabled
                        sx={disabledFieldStyle}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={getStatusName(usage.memoryUsageCheck, resultStatusOptions)}
                        disabled
                        sx={disabledFieldStyle}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                  No memory usage data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CPU Usage Data Table */}
      <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
        🖥️ CPU Usage Check
      </Typography>
      <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Serial No.</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Machine Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>CPU Usage (&lt; %)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Check (Usage &lt; 80%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cpuUsageData && cpuUsageData.length > 0 ? (
              cpuUsageData
                .filter(usage => !usage.isDeleted)
                .map((usage, index) => (
                  <TableRow key={usage.id || index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={usage.serialNo || ''}
                        disabled
                        sx={disabledFieldStyle}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={usage.machineName || ''}
                        disabled
                        sx={disabledFieldStyle}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={usage.cpuUsage || ''}
                        disabled
                        sx={disabledFieldStyle}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={getStatusName(usage.cpuUsageCheck, resultStatusOptions)}
                        disabled
                        sx={disabledFieldStyle}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                  No CPU usage data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Remarks Section */}
      <Box sx={{ marginTop: 3 }}>
        <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
          📝 Remarks
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={remarks}
          disabled
          sx={disabledFieldStyle}
          placeholder="No remarks provided"
        />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
};

export default CPUAndRamUsage_Edit_Review;