import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import serverDiskStatusService from '../../../api-services/serverDiskStatusService';
import resultStatusService from '../../../api-services/resultStatusService';

const DiskUsage_Edit = ({ data, onDataChange, onStatusChange }) => {
  const [servers, setServers] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [serverDiskStatusOptions, setServerDiskStatusOptions] = useState([]);
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data from props when meaningful data is available
  useEffect(() => {
    
    // Check if we have meaningful data to initialize with - following HardDriveHealth_Edit pattern
    // Accept data even if servers array is empty, as long as the data object exists
    const hasData = data && (
      (data.servers !== undefined) || // Accept even empty servers array
      (data.pmServerDiskUsageHealths && data.pmServerDiskUsageHealths.length > 0) ||
      (data.remarks !== undefined) // Accept even empty remarks
    );
    if (hasData && !isInitialized.current) {
      
      // Handle API response format (pmServerDiskUsageHealths) - similar to DiskUsage_Review flexible approach
      if (data.pmServerDiskUsageHealths && data.pmServerDiskUsageHealths.length > 0) {
        const apiData = data.pmServerDiskUsageHealths[0]; // Get first item from array
        
        // Group details by serverName to create server structure
        const serverMap = new Map();
        
        if (apiData.details && apiData.details.length > 0) {
          console.log('DiskUsage_Edit - Processing details, count:', apiData.details.length); // Debug log
          apiData.details.forEach((detail, index) => {
            console.log(`DiskUsage_Edit - Processing detail ${index}:`, detail); // Debug log
            const serverName = detail.serverName;
            
            if (!serverMap.has(serverName)) {
              console.log(`DiskUsage_Edit - Creating new server entry for: ${serverName}`); // Debug log
              serverMap.set(serverName, {
                id: detail.pmServerDiskUsageHealthID, // Use the parent ID
                serverName: serverName,
                disks: [],
                isNew: false,
                isModified: false,
                isDeleted: false
              });
            }
            
            // Add disk to the server
            const diskEntry = {
              id: detail.id,
              disk: detail.diskName || '',
              status: detail.serverDiskStatusID || '',
              capacity: detail.capacity || '',
              freeSpace: detail.freeSpace || '',
              usage: detail.usage || '',
              check: detail.resultStatusID || '',
              remarks: detail.remarks || '',
              isNew: false,
              isModified: false,
              isDeleted: false
            };
            console.log(`DiskUsage_Edit - Adding disk to ${serverName}:`, diskEntry); // Debug log
            serverMap.get(serverName).disks.push(diskEntry);
          });
        }
        
        const mappedServers = Array.from(serverMap.values());
        console.log('DiskUsage_Edit - Final mapped servers from API:', mappedServers); // Debug log
        console.log('DiskUsage_Edit - Server count:', mappedServers.length); // Debug log
        setServers(mappedServers);
        
        // Set remarks from API data
        console.log('DiskUsage_Edit - API remarks:', apiData.remarks); // Debug log
        if (apiData.remarks) {
          setRemarks(apiData.remarks);
        }
      }
      // Handle legacy/direct data format (servers array) - following HardDriveHealth_Edit pattern
      else if (data.servers && data.servers.length > 0) {
        console.log('DiskUsage_Edit - Processing legacy/direct data'); // Debug log
        // Map existing data and preserve all tracking flags including isDeleted
        const mappedServers = data.servers.map(server => ({
          id: server.id || null, // preserve existing ID or null for new items - following HardDriveHealth_Edit pattern
          serverName: server.serverName || '',
          disks: server.disks ? server.disks.map(disk => ({
            id: disk.id || null,
            disk: disk.disk || '',
            status: disk.status || '',
            capacity: disk.capacity || '',
            freeSpace: disk.freeSpace || '',
            usage: disk.usage || '',
            check: disk.check || '',
            remarks: disk.remarks || '',
            isNew: !disk.id, // mark as new if no ID exists - following HardDriveHealth_Edit pattern
            isModified: disk.isModified || false, // preserve modification flag
            isDeleted: disk.isDeleted || false // preserve deletion flag
          })) : [],
          isNew: !server.id, // mark as new if no ID exists - following HardDriveHealth_Edit pattern
          isModified: server.isModified || false, // preserve modification flag
          isDeleted: server.isDeleted || false // preserve deletion flag
        }));
        console.log('DiskUsage_Edit - Mapped servers from legacy/direct:', mappedServers); // Debug log
        setServers(mappedServers);
      }
      
      // Handle remarks from any format - following DiskUsage_Review flexible approach
      if (data.remarks) {
        setRemarks(data.remarks);
      } else if (data.diskUsageRemarks) {
        setRemarks(data.diskUsageRemarks);
      } else if (data.comment) {
        setRemarks(data.comment);
      }
      
      isInitialized.current = true;
    } else if (!hasData && !isInitialized.current) {
      // Initialize with empty state if no data provided - following HardDriveHealth_Edit pattern
      console.log('DiskUsage_Edit - No data provided, initializing empty state'); // Debug log
      setServers([]);
      setRemarks('');
      isInitialized.current = true;
    }
  }, [data]);

  // Fetch Server Disk Status options
  useEffect(() => {
    const fetchServerDiskStatusOptions = async () => {
      try {
        setLoading(true);
        const response = await serverDiskStatusService.getServerDiskStatuses();
        setServerDiskStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching Server Disk Status options:', error);
        setServerDiskStatusOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServerDiskStatusOptions();
  }, []);

  // Fetch Result Status options
  useEffect(() => {
    const fetchResultStatusOptions = async () => {
      try {
        setLoading(true);
        const response = await resultStatusService.getResultStatuses();
        setResultStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching Result Status options:', error);
        setResultStatusOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResultStatusOptions();
  }, []);

  // Update parent component when data changes (but not on initial load)
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      onDataChange({
        servers,
        remarks
      });
    }
  }, [servers, remarks, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const activeServers = servers.filter(server => !server.isDeleted);
    const hasServerData = activeServers.some(server => {
      const activeDisks = server.disks.filter(disk => !disk.isDeleted);
      return server.serverName.trim() !== '' && activeDisks.some(disk => 
        disk.disk.trim() !== '' && disk.status !== '' && disk.check !== ''
      );
    });
    const hasRemarks = remarks.trim() !== '';
    
    const isCompleted = hasServerData && hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('DiskUsage_Edit', isCompleted);
    }
  }, [servers, remarks, onStatusChange]);

  // Server management handlers
  const addServer = () => {
    const newServer = {
      id: null, // null indicates new server
      serverName: '',
      disks: [],
      isNew: true // flag to track new servers
    };
    setServers([...servers, newServer]);
  };

  const removeServer = (serverIndex) => {
    const updatedServers = [...servers];
    const server = updatedServers[serverIndex];
    
    if (server.id) {
      // Mark existing server as deleted
      updatedServers[serverIndex] = {
        ...server,
        isDeleted: true,
        isModified: true
      };
    } else {
      // Remove new server completely
      updatedServers.splice(serverIndex, 1);
    }
    
    setServers(updatedServers);
  };

  const updateServerName = (serverIndex, serverName) => {
    const updatedServers = [...servers];
    const server = updatedServers[serverIndex];
    
    // Mark as modified if it's an existing server (has ID) and value changed
    const isModified = server.id && server.serverName !== serverName;
    
    updatedServers[serverIndex] = {
      ...server,
      serverName,
      isModified: isModified || server.isModified
    };
    
    setServers(updatedServers);
  };

  // Disk management handlers
  const addDisk = (serverIndex) => {
    const updatedServers = [...servers];
    const newDisk = {
      id: null, // null indicates new disk
      disk: '',
      status: '',
      capacity: '',
      freeSpace: '',
      usage: '',
      check: '',
      remarks: '', // Add remarks field for new disks
      isNew: true // flag to track new disks
    };
    
    updatedServers[serverIndex] = {
      ...updatedServers[serverIndex],
      disks: [...updatedServers[serverIndex].disks, newDisk]
    };
    
    setServers(updatedServers);
  };

  const removeDisk = (serverIndex, diskIndex) => {
    const updatedServers = [...servers];
    const server = updatedServers[serverIndex];
    const disk = server.disks[diskIndex];
    
    if (disk.id) {
      // Mark existing disk as deleted
      const updatedDisks = [...server.disks];
      updatedDisks[diskIndex] = {
        ...disk,
        isDeleted: true,
        isModified: true
      };
      updatedServers[serverIndex] = {
        ...server,
        disks: updatedDisks
      };
    } else {
      // Remove new disk completely
      const updatedDisks = server.disks.filter((_, index) => index !== diskIndex);
      updatedServers[serverIndex] = {
        ...server,
        disks: updatedDisks
      };
    }
    
    setServers(updatedServers);
  };

  const updateDiskField = (serverIndex, diskIndex, field, value) => {
    const updatedServers = [...servers];
    const server = updatedServers[serverIndex];
    const disk = server.disks[diskIndex];
    
    // Mark as modified if it's an existing disk (has ID) and value changed
    const isModified = disk.id && disk[field] !== value;
    
    const updatedDisks = [...server.disks];
    updatedDisks[diskIndex] = {
      ...disk,
      [field]: value,
      isModified: isModified || disk.isModified
    };
    
    updatedServers[serverIndex] = {
      ...server,
      disks: updatedDisks
    };
    
    setServers(updatedServers);
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

  const instructionBoxStyle = {
    backgroundColor: '#f5f5f5',
    padding: 2,
    borderRadius: 1,
    marginBottom: 3,
    border: '1px solid #e0e0e0'
  };

  const noteBoxStyle = {
    backgroundColor: '#fff3cd',
    padding: 2,
    borderRadius: 1,
    marginBottom: 3,
    border: '1px solid #ffeaa7',
    borderLeft: '4px solid #fdcb6e'
  };

  return (
    <Paper sx={sectionContainerStyle}>
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <StorageIcon /> Server Disk Usage Check
      </Typography>
      
      {/* Instructions */}
      <Box sx={instructionBoxStyle}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          Using Computer Management
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>From Control Panel→Administration Tools→Computer Management.</li>
            <li>click on the Storage→Disk Management. check the Status for all the hard disk</li>
          </ul>
        </Typography>
      </Box>

      {/* Note for HDSRS Servers */}
      <Box sx={noteBoxStyle}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          📌 Note for HDSRS Servers:
        </Typography>
        <Typography variant="body2">
          For HDSRS servers, please also check the disk usage using the HDSRS monitoring interface 
          to ensure historical data storage is within acceptable limits.
        </Typography>
      </Box>

      {/* Add Server Button */}
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addServer}
        sx={{ marginBottom: 2 }}
      >
        Add Server
      </Button>

      {/* Servers */}
      {servers.map((server, serverIndex) => (
        <Accordion 
          key={serverIndex} 
          defaultExpanded 
          sx={{ 
            marginBottom: 2,
            position: 'relative',
            opacity: server.isDeleted ? 0.5 : 1,
            backgroundColor: server.isDeleted ? '#ffcdd2' : 'transparent',
            border: server.isDeleted ? '3px solid #f44336' : 'none',
            borderRadius: server.isDeleted ? '8px' : 'inherit',
            transform: server.isDeleted ? 'scale(0.98)' : 'scale(1)',
            transition: 'all 0.3s ease-in-out',
            '&::before': server.isDeleted ? {
              content: '"❌ DELETED"',
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: '#f44336',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.4)',
            } : {},
            '&::after': server.isDeleted ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                linear-gradient(135deg, transparent 47%, #f44336 47%, #f44336 53%, transparent 53%),
                linear-gradient(45deg, transparent 47%, #f44336 47%, #f44336 53%, transparent 53%)
              `,
              zIndex: 1,
              pointerEvents: 'none',
              opacity: 0.8
            } : {}
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <TextField
                value={server.serverName}
                onChange={(e) => {
                  e.stopPropagation();
                  updateServerName(serverIndex, e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder={`Server ${serverIndex + 1}`}
                variant="outlined"
                size="small"
                disabled={server.isDeleted}
                sx={{ 
                  minWidth: '200px',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                    '&:hover': {
                      backgroundColor: '#e9ecef',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2'
                      }
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                        borderWidth: '2px'
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#dee2e6'
                    }
                  },
                  '& .MuiInputBase-input': {
                    padding: '8px 12px',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }
                }}
              />
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  removeServer(serverIndex);
                }}
                color="error"
                size="medium"
                sx={{
                  backgroundColor: '#ffebee',
                  border: '2px solid #f44336',
                  borderRadius: '8px',
                  padding: '8px',
                  minWidth: '44px',
                  minHeight: '44px',
                  '&:hover': {
                    backgroundColor: '#f44336',
                    color: 'white',
                    transform: 'scale(1.1)',
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <DeleteIcon sx={{ fontSize: '20px' }} />
              </IconButton>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ 
            pointerEvents: server.isDeleted ? 'none' : 'auto',
            opacity: server.isDeleted ? 0.7 : 1 
          }}>
            {/* Add Disk Button */}
            <Box sx={{ marginBottom: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => addDisk(serverIndex)}
                size="small"
                disabled={server.isDeleted}
              >
                Add Disk
              </Button>
            </Box>

            {/* Disks Table */}
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Disk</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Capacity (GB)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Free Space (GB)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Usage %</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Check (Usage &lt; 50%)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {server.disks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', fontStyle: 'italic', color: '#666' }}>
                        No disks added yet. Click "Add Disk" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    server.disks.map((disk, diskIndex) => (
                      <TableRow 
                        key={diskIndex}
                        sx={{
                          position: 'relative',
                          opacity: disk.isDeleted ? 0.6 : 1,
                          backgroundColor: disk.isDeleted ? '#ffebee' : 'transparent',
                          '&::after': disk.isDeleted ? {
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
                          <TextField
                            size="small"
                            value={disk.disk}
                            onChange={(e) => updateDiskField(serverIndex, diskIndex, 'disk', e.target.value)}
                            placeholder="e.g., C:"
                            variant="outlined"
                            disabled={disk.isDeleted || server.isDeleted}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={disk.status}
                            onChange={(e) => updateDiskField(serverIndex, diskIndex, 'status', e.target.value)}
                            variant="outlined"
                            disabled={loading || disk.isDeleted || server.isDeleted}
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="">
                              {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CircularProgress size={16} />
                                  Loading...
                                </Box>
                              ) : (
                                'Select Status'
                              )}
                            </MenuItem>
                            {serverDiskStatusOptions.map((option) => (
                              <MenuItem key={option.id} value={option.id}>
                                {option.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={disk.capacity}
                            onChange={(e) => updateDiskField(serverIndex, diskIndex, 'capacity', e.target.value)}
                            placeholder="e.g., 500GB"
                            variant="outlined"
                            disabled={disk.isDeleted || server.isDeleted}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={disk.freeSpace}
                            onChange={(e) => updateDiskField(serverIndex, diskIndex, 'freeSpace', e.target.value)}
                            placeholder="e.g., 200GB"
                            variant="outlined"
                            disabled={disk.isDeleted || server.isDeleted}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={disk.usage}
                            onChange={(e) => updateDiskField(serverIndex, diskIndex, 'usage', e.target.value)}
                            placeholder="e.g., 60%"
                            variant="outlined"
                            disabled={disk.isDeleted || server.isDeleted}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={disk.check}
                            onChange={(e) => updateDiskField(serverIndex, diskIndex, 'check', e.target.value)}
                            variant="outlined"
                            disabled={loading || disk.isDeleted || server.isDeleted}
                            sx={{ minWidth: 100 }}
                          >
                            <MenuItem value="">
                              {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CircularProgress size={16} />
                                  Loading...
                                </Box>
                              ) : (
                                'Select'
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
                          <IconButton
                            onClick={() => removeDisk(serverIndex, diskIndex)}
                            color="error"
                            size="small"
                            disabled={server.isDeleted || disk.isDeleted}
                            sx={{
                              backgroundColor: (disk.isDeleted || server.isDeleted) ? 'transparent' : '#ffebee',
                              border: (disk.isDeleted || server.isDeleted) ? 'none' : '2px solid #f44336',
                              borderRadius: '8px',
                              padding: '8px',
                              minWidth: '40px',
                              minHeight: '40px',
                              boxShadow: (disk.isDeleted || server.isDeleted) ? 'none' : '0 4px 8px rgba(244, 67, 54, 0.3)',
                              transition: 'all 0.3s ease',
                              animation: (disk.isDeleted || server.isDeleted) ? 'none' : 'pulse 2s infinite',
                              '&:hover': {
                                backgroundColor: (disk.isDeleted || server.isDeleted) ? 'transparent' : '#ffcdd2',
                                transform: (disk.isDeleted || server.isDeleted) ? 'none' : 'scale(1.1)',
                                boxShadow: (disk.isDeleted || server.isDeleted) ? 'none' : '0 6px 12px rgba(244, 67, 54, 0.4)'
                              },
                              '@keyframes pulse': {
                                '0%': { boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)' },
                                '50%': { boxShadow: '0 6px 16px rgba(244, 67, 54, 0.5)' },
                                '100%': { boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)' }
                              }
                            }}
                          >
                            <DeleteIcon sx={{ 
                              fontSize: '20px',
                              color: (disk.isDeleted || server.isDeleted) ? '#ccc' : '#f44336'
                            }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

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

export default DiskUsage_Edit;