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
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Memory as MemoryIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';

// Import the CPU and RAM usage image
import CPUAndRamUsageImage from '../../../resources/ServerPMReportForm/CPUAndRamUsage.png';
// Import the result status service
import resultStatusService from '../../../api-services/resultStatusService';

const CPUAndRamUsage_Edit = ({ data, onDataChange, onStatusChange }) => {
  const [memoryUsageData, setMemoryUsageData] = useState([]);
  const [cpuUsageData, setCpuUsageData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const isInitialized = useRef(false);

  // Initialize data from props when meaningful data is available
  useEffect(() => {
    // Check if we have meaningful data to initialize with - following DiskUsage_Edit pattern
    const hasData = data && (
      (data.memoryUsageData !== undefined) || // Accept even empty array
      (data.cpuUsageData !== undefined) || // Accept even empty array
      (data.pmServerCPUAndMemoryUsages && data.pmServerCPUAndMemoryUsages.length > 0) ||
      (data.remarks !== undefined) // Accept even empty remarks
    );
    
    if (hasData && !isInitialized.current) {
      
      // Handle API response format (pmServerCPUAndMemoryUsages)
      if (data.pmServerCPUAndMemoryUsages && data.pmServerCPUAndMemoryUsages.length > 0) {
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
            isNew: false,
            isModified: false,
            isDeleted: false
          }));
          // Sort by serialNo in ascending order
          mappedMemoryData.sort((a, b) => {
            const serialA = parseInt(a.serialNo) || 0;
            const serialB = parseInt(b.serialNo) || 0;
            return serialA - serialB;
          });
          console.log('CPUAndRamUsage_Edit - Mapped memory data from API:', mappedMemoryData); // Debug log
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
            isNew: false,
            isModified: false,
            isDeleted: false
          }));
          // Sort by serialNo in ascending order
          mappedCpuData.sort((a, b) => {
            const serialA = parseInt(a.serialNo) || 0;
            const serialB = parseInt(b.serialNo) || 0;
            return serialA - serialB;
          });
          console.log('CPUAndRamUsage_Edit - Mapped CPU data from API:', mappedCpuData); // Debug log
          setCpuUsageData(mappedCpuData);
        }
        
        // Set remarks from API data
        if (apiData.remarks) {
          setRemarks(apiData.remarks);
        }
      }
      // Handle legacy/direct data format
      else {
        if (data.memoryUsageData && data.memoryUsageData.length > 0) {
          const mappedMemoryData = data.memoryUsageData.map((memory, index) => ({
            id: memory.id || null,
            serialNo: memory.serialNo || (index + 1).toString(),
            machineName: memory.machineName || '',
            memorySize: memory.memorySize || '',
            memoryInUse: memory.memoryInUse || '',
            memoryUsageCheck: memory.memoryUsageCheck || '',
            isNew: !memory.id,
            isModified: memory.isModified || false,
            isDeleted: memory.isDeleted || false
          }));
          // Sort by serialNo in ascending order
          mappedMemoryData.sort((a, b) => {
            const serialA = parseInt(a.serialNo) || 0;
            const serialB = parseInt(b.serialNo) || 0;
            return serialA - serialB;
          });
          console.log('CPUAndRamUsage_Edit - Mapped memory data from legacy:', mappedMemoryData); // Debug log
          setMemoryUsageData(mappedMemoryData);
        }
        
        if (data.cpuUsageData && data.cpuUsageData.length > 0) {
          const mappedCpuData = data.cpuUsageData.map((cpu, index) => ({
            id: cpu.id || null,
            serialNo: cpu.serialNo || (index + 1).toString(),
            machineName: cpu.machineName || '',
            cpuUsage: cpu.cpuUsage || '',
            cpuUsageCheck: cpu.cpuUsageCheck || '',
            isNew: !cpu.id,
            isModified: cpu.isModified || false,
            isDeleted: cpu.isDeleted || false
          }));
          // Sort by serialNo in ascending order
          mappedCpuData.sort((a, b) => {
            const serialA = parseInt(a.serialNo) || 0;
            const serialB = parseInt(b.serialNo) || 0;
            return serialA - serialB;
          });
          console.log('CPUAndRamUsage_Edit - Mapped CPU data from legacy:', mappedCpuData); // Debug log
          setCpuUsageData(mappedCpuData);
        }
        
        if (data.remarks) {
          setRemarks(data.remarks);
        }
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

  // Memory Usage Check handlers - following DiskUsage_Edit pattern
  const handleMemoryUsageChange = (index, field, value) => {
    const updatedData = [...memoryUsageData];
    const currentItem = updatedData[index];
    
    // Mark as modified if it's an existing item (has ID)
    if (currentItem.id) {
      updatedData[index] = { 
        ...currentItem, 
        [field]: value,
        isModified: true 
      };
    } else {
      // For new items, just update the field
      updatedData[index] = { ...currentItem, [field]: value };
    }
    
    setMemoryUsageData(updatedData);
  };

  // Utility functions for toast messages
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const addMemoryUsageRow = () => {
    const newRow = { 
      id: null,
      serialNo: (memoryUsageData.length + 1).toString(),
      machineName: '', 
      memorySize: '', 
      memoryInUse: '', 
      memoryUsageCheck: '',
      isNew: true,
      isModified: false,
      isDeleted: false
    };
    setMemoryUsageData([...memoryUsageData, newRow]);
    showSnackbar('New memory usage row added');
  };

  const removeMemoryUsageRow = (index) => {
    const updatedData = [...memoryUsageData];
    const itemToRemove = updatedData[index];
    
    // If item has an ID (existing item), mark as deleted instead of removing
    if (itemToRemove.id) {
      updatedData[index] = {
        ...itemToRemove,
        isDeleted: true,
        isModified: true
      };
      setMemoryUsageData(updatedData);
      showSnackbar('Memory usage row deleted. Click undo to restore.', 'warning');
    } else {
      // If it's a new item (no ID), remove it completely
      const filteredData = memoryUsageData.filter((_, i) => i !== index);
      setMemoryUsageData(filteredData);
      showSnackbar('New memory usage row removed');
    }
  };

  const restoreMemoryUsageRow = (index) => {
    const updatedData = [...memoryUsageData];
    const itemToRestore = updatedData[index];
    
    // Only restore if the item is currently deleted
    if (itemToRestore.isDeleted) {
      updatedData[index] = {
        ...itemToRestore,
        isDeleted: false,
        isModified: true
      };
      setMemoryUsageData(updatedData);
      showSnackbar('Memory usage row restored');
    }
  };

  // CPU Usage Check handlers - following DiskUsage_Edit pattern
  const handleCpuUsageChange = (index, field, value) => {
    const updatedData = [...cpuUsageData];
    const currentItem = updatedData[index];
    
    // Mark as modified if it's an existing item (has ID)
    if (currentItem.id) {
      updatedData[index] = { 
        ...currentItem, 
        [field]: value,
        isModified: true 
      };
    } else {
      // For new items, just update the field
      updatedData[index] = { ...currentItem, [field]: value };
    }
    
    setCpuUsageData(updatedData);
  };

  const addCpuUsageRow = () => {
    const newRow = { 
      id: null,
      serialNo: (cpuUsageData.length + 1).toString(),
      machineName: '', 
      cpuUsage: '', 
      cpuUsageCheck: '',
      isNew: true,
      isModified: false,
      isDeleted: false
    };
    setCpuUsageData([...cpuUsageData, newRow]);
    showSnackbar('New CPU usage row added');
  };

  const removeCpuUsageRow = (index) => {
    const updatedData = [...cpuUsageData];
    const itemToRemove = updatedData[index];
    
    // If item has an ID (existing item), mark as deleted instead of removing
    if (itemToRemove.id) {
      updatedData[index] = {
        ...itemToRemove,
        isDeleted: true,
        isModified: true
      };
      setCpuUsageData(updatedData);
      showSnackbar('CPU usage row deleted. Click undo to restore.', 'warning');
    } else {
      // If it's a new item (no ID), remove it completely
      const filteredData = cpuUsageData.filter((_, i) => i !== index);
      setCpuUsageData(filteredData);
      showSnackbar('New CPU usage row removed');
    }
  };

  const restoreCpuUsageRow = (index) => {
    const updatedData = [...cpuUsageData];
    const itemToRestore = updatedData[index];
    
    // Only restore if item is currently deleted
    if (itemToRestore.isDeleted) {
      updatedData[index] = {
        ...itemToRestore,
        isDeleted: false,
        isModified: true // Keep as modified since we're changing the delete status
      };
      setCpuUsageData(updatedData);
      showSnackbar('CPU usage row restored');
    }
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
                <TableCell sx={{ fontWeight: 'bold', width: '80px', minWidth: '80px' }}>S/N</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '250px', minWidth: '200px' }}>Machine Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Memory Size</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Memory In Use (%)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '180px', maxWidth: '200px' }}>Memory In Use &lt; 90%?<br />*Historical server &lt; 90%?</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Actions</TableCell>
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
                  <TableRow 
                    key={row.id || `memory-${index}`}
                    sx={{
                      position: 'relative',
                      opacity: row.isDeleted ? 0.6 : 1,
                      backgroundColor: row.isDeleted ? '#ffebee' : 'transparent',
                      '&::after': row.isDeleted ? {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                        height: '2px',
                        backgroundColor: '#d32f2f',
                        zIndex: 1,
                        pointerEvents: 'none'
                      } : {}
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {row.serialNo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={row.machineName}
                        onChange={(e) => handleMemoryUsageChange(memoryUsageData.indexOf(row), 'machineName', e.target.value)}
                        placeholder="Enter machine name"
                        size="small"
                        disabled={row.isDeleted}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={row.memorySize}
                        onChange={(e) => handleMemoryUsageChange(memoryUsageData.indexOf(row), 'memorySize', e.target.value)}
                        placeholder="Enter memory size"
                        size="small"
                        disabled={row.isDeleted}
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
                        value={row.memoryUsageCheck}
                        onChange={(e) => handleMemoryUsageChange(index, 'memoryUsageCheck', e.target.value)}
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
                          <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      {!row.isDeleted ? (
                        <IconButton
                          onClick={() => removeMemoryUsageRow(memoryUsageData.indexOf(row))}
                          color="error"
                          disabled={row.isDeleted}
                          sx={{
                            backgroundColor: row.isDeleted ? 'transparent' : '#ffebee',
                            border: row.isDeleted ? 'none' : '2px solid #f44336',
                            borderRadius: '8px',
                            padding: '12px',
                            minWidth: '48px',
                            minHeight: '48px',
                            boxShadow: row.isDeleted ? 'none' : '0 4px 8px rgba(244, 67, 54, 0.3)',
                            transition: 'all 0.3s ease',
                            animation: row.isDeleted ? 'none' : 'pulse 2s infinite',
                            '&:hover': {
                              backgroundColor: row.isDeleted ? 'transparent' : '#ffcdd2',
                              transform: row.isDeleted ? 'none' : 'scale(1.1)',
                              boxShadow: row.isDeleted ? 'none' : '0 6px 12px rgba(244, 67, 54, 0.4)'
                            },
                            '@keyframes pulse': {
                              '0%': { boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)' },
                              '50%': { boxShadow: '0 6px 16px rgba(244, 67, 54, 0.5)' },
                              '100%': { boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)' }
                            }
                          }}
                        >
                          <DeleteIcon sx={{ 
                            fontSize: '24px',
                            color: row.isDeleted ? '#ccc' : '#f44336'
                          }} />
                        </IconButton>
                      ) : (
                        <IconButton
                          onClick={() => restoreMemoryUsageRow(memoryUsageData.indexOf(row))}
                          sx={{
                            backgroundColor: '#e8f5e8',
                            border: '2px solid #4caf50',
                            borderRadius: '8px',
                            padding: '12px',
                            minWidth: '48px',
                            minHeight: '48px',
                            boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
                            transition: 'all 0.3s ease',
                            animation: 'pulse 2s infinite',
                            zIndex: 2,
                            '&:hover': {
                              backgroundColor: '#c8e6c9',
                              transform: 'scale(1.1)',
                              boxShadow: '0 6px 12px rgba(76, 175, 80, 0.4)'
                            },
                            '@keyframes pulse': {
                              '0%': { boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)' },
                              '50%': { boxShadow: '0 6px 16px rgba(76, 175, 80, 0.5)' },
                              '100%': { boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)' }
                            }
                          }}
                        >
                          <UndoIcon sx={{ 
                            fontSize: '24px',
                            color: '#4caf50'
                          }} />
                        </IconButton>
                      )}
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
                  <TableRow 
                    key={row.id || `cpu-${index}`}
                    sx={{
                      position: 'relative',
                      opacity: row.isDeleted ? 0.6 : 1,
                      backgroundColor: row.isDeleted ? '#ffebee' : 'transparent',
                      '&::after': row.isDeleted ? {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                        height: '2px',
                        backgroundColor: '#d32f2f',
                        zIndex: 1,
                        pointerEvents: 'none'
                      } : {}
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {row.serialNo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={row.machineName}
                        onChange={(e) => handleCpuUsageChange(cpuUsageData.indexOf(row), 'machineName', e.target.value)}
                        placeholder="Enter machine name"
                        size="small"
                        disabled={row.isDeleted}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={row.cpuUsage}
                        onChange={(e) => handleCpuUsageChange(cpuUsageData.indexOf(row), 'cpuUsage', e.target.value)}
                        placeholder="Enter CPU usage %"
                        size="small"
                        disabled={row.isDeleted}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        select
                        variant="outlined"
                        value={row.cpuUsageCheck}
                        onChange={(e) => handleCpuUsageChange(cpuUsageData.indexOf(row), 'cpuUsageCheck', e.target.value)}
                        size="small"
                        disabled={loading || row.isDeleted}
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
                          <MenuItem key={option.id} value={option.id}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      {!row.isDeleted ? (
                        <IconButton
                          onClick={() => removeCpuUsageRow(cpuUsageData.indexOf(row))}
                          color="error"
                          disabled={row.isDeleted}
                          sx={{
                            backgroundColor: row.isDeleted ? 'transparent' : '#ffebee',
                            border: row.isDeleted ? 'none' : '2px solid #f44336',
                            borderRadius: '8px',
                            padding: '12px',
                            minWidth: '48px',
                            minHeight: '48px',
                            boxShadow: row.isDeleted ? 'none' : '0 4px 8px rgba(244, 67, 54, 0.3)',
                            transition: 'all 0.3s ease',
                            animation: row.isDeleted ? 'none' : 'pulse 2s infinite',
                            '&:hover': {
                              backgroundColor: row.isDeleted ? 'transparent' : '#ffcdd2',
                              transform: row.isDeleted ? 'none' : 'scale(1.1)',
                              boxShadow: row.isDeleted ? 'none' : '0 6px 12px rgba(244, 67, 54, 0.4)'
                            },
                            '@keyframes pulse': {
                              '0%': { boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)' },
                              '50%': { boxShadow: '0 6px 16px rgba(244, 67, 54, 0.5)' },
                              '100%': { boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)' }
                            }
                          }}
                        >
                          <DeleteIcon sx={{ 
                            fontSize: '24px',
                            color: row.isDeleted ? '#ccc' : '#f44336'
                          }} />
                        </IconButton>
                      ) : (
                        <IconButton
                          onClick={() => restoreCpuUsageRow(cpuUsageData.indexOf(row))}
                          color="success"
                          sx={{
                            backgroundColor: '#e8f5e8',
                            border: '2px solid #4caf50',
                            borderRadius: '8px',
                            padding: '12px',
                            minWidth: '48px',
                            minHeight: '48px',
                            boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
                            transition: 'all 0.3s ease',
                            animation: 'undoPulse 2s infinite',
                            position: 'relative',
                            zIndex: 2,
                            '&:hover': {
                              backgroundColor: '#c8e6c9',
                              transform: 'scale(1.1)',
                              boxShadow: '0 6px 12px rgba(76, 175, 80, 0.4)'
                            },
                            '@keyframes undoPulse': {
                              '0%': { boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)' },
                              '50%': { boxShadow: '0 6px 16px rgba(76, 175, 80, 0.5)' },
                              '100%': { boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)' }
                            }
                          }}
                        >
                          <UndoIcon sx={{ 
                            fontSize: '24px',
                            color: '#4caf50'
                          }} />
                        </IconButton>
                      )}
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CPUAndRamUsage_Edit;