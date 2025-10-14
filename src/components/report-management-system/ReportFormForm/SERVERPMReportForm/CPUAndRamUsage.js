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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Memory as MemoryIcon,
} from '@mui/icons-material';

// Import the CPU and RAM usage image
import CPUAndRamUsageImage from '../../../resources/ServerPMReportForm/CPUAndRamUsage.png';
// Import the result status service
import resultStatusService from '../../../api-services/resultStatusService';

const CPUAndRamUsage = ({ data, onDataChange, onStatusChange }) => {
  const [memoryUsageData, setMemoryUsageData] = useState([]);
  const [cpuUsageData, setCpuUsageData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data from props only once
  useEffect(() => {
    if (data && !isInitialized.current) {
      if (data.memoryUsageData && data.memoryUsageData.length > 0) {
        setMemoryUsageData(data.memoryUsageData);
      }
      if (data.cpuUsageData && data.cpuUsageData.length > 0) {
        setCpuUsageData(data.cpuUsageData);
      }
      if (data.remarks) {
        setRemarks(data.remarks);
      }
      isInitialized.current = true;
    }
  }, [data]);

  // Fetch ResultStatus options on component mount
  useEffect(() => {
    const fetchResultStatuses = async () => {
      try {
        setLoading(true);
        const response = await resultStatusService.getResultStatuses();
        setResultStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching result status options:', error);
        // Set fallback options if API call fails
        setResultStatusOptions([
          { id: 'pass', name: 'Pass' },
          { id: 'fail', name: 'Fail' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchResultStatuses();
  }, []);

  // Update parent component when data changes (but not on initial load)
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      onDataChange({
        memoryUsageData,
        cpuUsageData,
        remarks
      });
    }
  }, [memoryUsageData, cpuUsageData, remarks, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const hasMemoryData = memoryUsageData.some(memory => 
      memory.machineName.trim() !== '' && memory.memorySize.trim() !== '' && 
      memory.memoryInUse.trim() !== '' && memory.memoryInUsed !== '' && memory.memoryUsageCheck !== ''
    );
    const hasCpuData = cpuUsageData.some(cpu => 
      cpu.machineName.trim() !== '' && cpu.cpuUsage.trim() !== '' && cpu.cpuUsageCheck !== ''
    );
    const hasRemarks = remarks.trim() !== '';
    
    const isCompleted = hasMemoryData && hasCpuData && hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('CPUAndRamUsage', isCompleted);
    }
  }, [memoryUsageData, cpuUsageData, remarks, onStatusChange]);

  // Memory Usage Check handlers
  const handleMemoryUsageChange = (index, field, value) => {
    const updatedData = [...memoryUsageData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setMemoryUsageData(updatedData);
  };

  const addMemoryUsageRow = () => {
    setMemoryUsageData([...memoryUsageData, { 
      machineName: '', 
      memorySize: '', 
      memoryInUse: '', 
      memoryInUsed: '', 
      memoryUsageCheck: '' 
    }]);
  };

  const removeMemoryUsageRow = (index) => {
    const updatedData = memoryUsageData.filter((_, i) => i !== index);
    setMemoryUsageData(updatedData);
  };

  // CPU Usage Check handlers
  const handleCpuUsageChange = (index, field, value) => {
    const updatedData = [...cpuUsageData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setCpuUsageData(updatedData);
  };

  const addCpuUsageRow = () => {
    setCpuUsageData([...cpuUsageData, { 
      machineName: '', 
      cpuUsage: '', 
      cpuUsageCheck: '' 
    }]);
  };

  const removeCpuUsageRow = (index) => {
    const updatedData = cpuUsageData.filter((_, i) => i !== index);
    setCpuUsageData(updatedData);
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
        <MemoryIcon /> Server CPU and RAM Usage Check
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

      {/* Memory Usage Check Table */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
          Memory Usage Check:
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addMemoryUsageRow}
          sx={{ marginBottom: 2 }}
        >
          Add Server
        </Button>
        
        <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Machine Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Memory Size</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Memory In Use (%)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Memory In Used &lt; 90%? *Historical server &lt; 90%?</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {memoryUsageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                    No memory usage data added yet. Click "Add Server" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                memoryUsageData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={row.machineName}
                        onChange={(e) => handleMemoryUsageChange(index, 'machineName', e.target.value)}
                        placeholder="Enter machine name"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={row.memorySize}
                        onChange={(e) => handleMemoryUsageChange(index, 'memorySize', e.target.value)}
                        placeholder="Enter memory size"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={row.memoryInUse}
                        onChange={(e) => handleMemoryUsageChange(index, 'memoryInUse', e.target.value)}
                        placeholder="Enter memory in use %"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        select
                        variant="outlined"
                        value={row.memoryInUsed}
                        onChange={(e) => handleMemoryUsageChange(index, 'memoryInUsed', e.target.value)}
                        size="small"
                        disabled={loading}
                        sx={{
                          minWidth: 120,
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
                        {resultStatusOptions.map((option) => (
                          <MenuItem key={option.id} value={option.name}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => removeMemoryUsageRow(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* CPU Usage Check Table */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
          CPU Usage Check:
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addCpuUsageRow}
          sx={{ marginBottom: 2 }}
        >
          Add Server
        </Button>
        
        <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Machine Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>CPU Usage (%)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>CPU Usage &lt; 50%?</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cpuUsageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                    No CPU usage data added yet. Click "Add Server" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                cpuUsageData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={row.machineName}
                        onChange={(e) => handleCpuUsageChange(index, 'machineName', e.target.value)}
                        placeholder="Enter machine name"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={row.cpuUsage}
                        onChange={(e) => handleCpuUsageChange(index, 'cpuUsage', e.target.value)}
                        placeholder="Enter CPU usage %"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        select
                        variant="outlined"
                        value={row.cpuUsageCheck}
                        onChange={(e) => handleCpuUsageChange(index, 'cpuUsageCheck', e.target.value)}
                        size="small"
                        disabled={loading}
                        sx={{
                          minWidth: 120,
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
                        {resultStatusOptions.map((option) => (
                          <MenuItem key={option.id} value={option.name}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => removeCpuUsageRow(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
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

export default CPUAndRamUsage;