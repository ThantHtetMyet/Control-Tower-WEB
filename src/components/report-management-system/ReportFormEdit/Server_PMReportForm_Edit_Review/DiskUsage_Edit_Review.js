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
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Storage as StorageIcon,
  ExpandMore as ExpandMoreIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';
import serverDiskStatusService from '../../../api-services/serverDiskStatusService';
import resultStatusService from '../../../api-services/resultStatusService';

const DiskUsage_Edit_Review = ({ data, disabled = true, formData }) => {
  const [servers, setServers] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [serverDiskStatusOptions, setServerDiskStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data from props - allow re-initialization when data changes
  useEffect(() => {
    console.log('DiskUsage_Edit_Review - useEffect triggered, isInitialized:', isInitialized.current);
    console.log('DiskUsage_Edit_Review - Initializing with data:', data);
    console.log('DiskUsage_Edit_Review - formData:', formData);
    
    // Process data whenever it changes (not just once)
    // This ensures that when navigating from Edit to Review, the data is processed correctly
      
      // PRIORITY 1: Handle servers array from Edit component (preserves duplicate server names as separate entries)
      // This should be checked FIRST to preserve the hierarchical structure from Edit component
      if (data && data.servers && Array.isArray(data.servers) && data.servers.length > 0) {
        console.log('DiskUsage_Edit_Review - Using data.servers array, count:', data.servers.length);
        console.log('DiskUsage_Edit_Review - Original servers data:', JSON.stringify(data.servers, null, 2));
        
        const mappedServers = data.servers.map((server, index) => {
          // CRITICAL: Generate unique tempId for each server entry using INDEX to ensure separate rendering
          // Even if two servers have the same name and same id, they must have different tempIds
          // Use index in the tempId to guarantee uniqueness
          const uniqueTempId = server.tempId || 
            (server.id ? `existing-${server.id}-idx${index}` : `temp-${Date.now()}-idx${index}-${Math.random().toString(36).substr(2, 9)}`);
          
          const mappedServer = {
            id: server.id || null,
            tempId: uniqueTempId, // Always ensure unique tempId with index
            serverName: server.serverName || '',
            serverEntryIndex: server.serverEntryIndex !== null && server.serverEntryIndex !== undefined 
              ? server.serverEntryIndex 
              : index, // Preserve ServerEntryIndex or use array index as fallback
            disks: server.disks ? server.disks.map(disk => ({
              id: disk.id || null,
              disk: disk.disk || '',
              status: disk.status || '',
              capacity: disk.capacity || '',
              freeSpace: disk.freeSpace || '',
              usage: disk.usage || '',
              check: disk.check || '',
              remarks: disk.remarks || '',
              isDeleted: disk.isDeleted || false
            })) : [],
            isDeleted: server.isDeleted || false
          };
          
          console.log(`DiskUsage_Edit_Review - Mapped server ${index}:`, {
            originalId: server.id,
            originalTempId: server.tempId,
            newTempId: uniqueTempId,
            serverName: server.serverName,
            disksCount: mappedServer.disks.length
          });
          
          return mappedServer;
        });
        
        console.log('DiskUsage_Edit_Review - Final mapped servers:', JSON.stringify(mappedServers, null, 2));
        setServers(mappedServers);
        
        if (data.remarks) {
          setRemarks(data.remarks);
        }
        isInitialized.current = true;
        return; // Exit early to prevent further processing
      }
      // PRIORITY 2: Handle formData.diskUsageData.servers (alternative path)
      if (formData && formData.diskUsageData && formData.diskUsageData.servers && Array.isArray(formData.diskUsageData.servers) && formData.diskUsageData.servers.length > 0) {
        console.log('DiskUsage_Edit_Review - Using formData.diskUsageData.servers array, count:', formData.diskUsageData.servers.length);
        console.log('DiskUsage_Edit_Review - Original formData servers:', JSON.stringify(formData.diskUsageData.servers, null, 2));
        
        const mappedServers = formData.diskUsageData.servers.map((server, index) => {
          // CRITICAL: Generate unique tempId for each server entry using INDEX to ensure separate rendering
          // Even if two servers have the same name and same id, they must have different tempIds
          // Use index in the tempId to guarantee uniqueness
          const uniqueTempId = server.tempId || 
            (server.id ? `existing-${server.id}-idx${index}` : `temp-${Date.now()}-idx${index}-${Math.random().toString(36).substr(2, 9)}`);
          
          const mappedServer = {
            id: server.id || null,
            tempId: uniqueTempId, // Always ensure unique tempId with index
            serverName: server.serverName || '',
            serverEntryIndex: server.serverEntryIndex !== null && server.serverEntryIndex !== undefined 
              ? server.serverEntryIndex 
              : index, // Preserve ServerEntryIndex or use array index as fallback
            disks: server.disks ? server.disks.map(disk => ({
              id: disk.id || null,
              disk: disk.disk || '',
              status: disk.status || '',
              capacity: disk.capacity || '',
              freeSpace: disk.freeSpace || '',
              usage: disk.usage || '',
              check: disk.check || '',
              remarks: disk.remarks || '',
              isDeleted: disk.isDeleted || false
            })) : [],
            isDeleted: server.isDeleted || false
          };
          
          console.log(`DiskUsage_Edit_Review - Mapped server ${index} from formData:`, {
            originalId: server.id,
            originalTempId: server.tempId,
            newTempId: uniqueTempId,
            serverName: server.serverName,
            disksCount: mappedServer.disks.length
          });
          
          return mappedServer;
        });
        
        console.log('DiskUsage_Edit_Review - Final mapped servers from formData:', JSON.stringify(mappedServers, null, 2));
        setServers(mappedServers);
        if (formData.diskUsageData.remarks) {
          setRemarks(formData.diskUsageData.remarks);
        }
        // Get options from formData if available
        if (formData.diskUsageData.resultStatusOptions) {
          setResultStatusOptions(formData.diskUsageData.resultStatusOptions);
        }
        if (formData.diskUsageData.serverDiskStatusOptions) {
          setServerDiskStatusOptions(formData.diskUsageData.serverDiskStatusOptions);
        }
        isInitialized.current = true;
        return; // Exit early to prevent further processing
      }
      // PRIORITY 3: Handle API response format (pmServerDiskUsageHealths) - only if servers array not available
      // NOTE: This path will merge duplicate server names, so it should only be used when servers array is not available
      // IMPORTANT: Check that servers array doesn't exist before using this path
      else if (data && data.pmServerDiskUsageHealths && data.pmServerDiskUsageHealths.length > 0 && 
               (!data.servers || !Array.isArray(data.servers) || data.servers.length === 0)) {
        console.log('DiskUsage_Edit_Review - Using pmServerDiskUsageHealths (API format) - WARNING: May merge duplicate server names');
        const apiData = data.pmServerDiskUsageHealths[0];
        
        // Group details by unique server key (serverName + serverId) to preserve duplicate server names as separate entries
        // This allows multiple servers with the same name to be displayed as separate accordion sections
        const serverMap = new Map();
        
        if (apiData.details && apiData.details.length > 0) {
          apiData.details.forEach((detail, detailIndex) => {
            const serverName = detail.serverName;
            if (!serverName) return;
            
            // Use ServerEntryIndex from database to distinguish duplicate server names
            const serverEntryIndex = detail.serverEntryIndex !== null && detail.serverEntryIndex !== undefined
              ? detail.serverEntryIndex
              : (detail.ServerEntryIndex !== null && detail.ServerEntryIndex !== undefined ? detail.ServerEntryIndex : detailIndex);
            
            // Use ServerEntryIndex + serverName as unique key to preserve duplicate server names as separate entries
            const serverKey = `${serverName}-entry-${serverEntryIndex}`;
            
            if (!serverMap.has(serverKey)) {
              serverMap.set(serverKey, {
                id: detail.pmServerDiskUsageHealthID || detail.PMServerDiskUsageHealthID || null,
                tempId: `existing-${detail.pmServerDiskUsageHealthID || detailIndex}-entry-${serverEntryIndex}`,
                serverName: serverName,
                serverEntryIndex: serverEntryIndex, // Preserve ServerEntryIndex from database
                disks: [],
                isDeleted: false
              });
            }
            
            // Add disk to the server
            const diskEntry = {
              id: detail.id || detail.ID,
              disk: detail.diskName || detail.DiskName || '',
              status: detail.serverDiskStatusID || detail.ServerDiskStatusID || '',
              capacity: detail.capacity || detail.Capacity || '',
              freeSpace: detail.freeSpace || detail.FreeSpace || '',
              usage: detail.usage || detail.Usage || '', // Handle both lowercase and capitalized
              check: detail.resultStatusID || detail.ResultStatusID || '',
              remarks: detail.remarks || detail.Remarks || '',
              isDeleted: detail.isDeleted || detail.IsDeleted || false
            };
            serverMap.get(serverKey).disks.push(diskEntry);
          });
        }
        
        const mappedServers = Array.from(serverMap.values());
        console.log('DiskUsage_Edit_Review - Mapped servers from API:', mappedServers);
        setServers(mappedServers);
        
        // Set remarks from API data
        if (apiData.remarks) {
          setRemarks(apiData.remarks);
        }
        isInitialized.current = true;
        return; // Exit early to prevent further processing
      }
      
      // No data found - initialize empty
      console.log('DiskUsage_Edit_Review - No data found, initializing empty');
      setServers([]);
      setRemarks('');
      isInitialized.current = true;
  }, [data, formData]);

  // Fetch Server Disk Status options - needed for Review mode
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

    // Only fetch if we don't already have options from formData
    if (serverDiskStatusOptions.length === 0) {
      fetchServerDiskStatusOptions();
    }
  }, [serverDiskStatusOptions.length]);

  // Fetch Result Status options - needed for Review mode
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

    // Only fetch if we don't already have options from formData
    if (resultStatusOptions.length === 0) {
      fetchResultStatusOptions();
    }
  }, [resultStatusOptions.length]);

  // Get status name by ID - works with both result status and server disk status
  const getStatusName = (id, options) => {
    if (!id || !options || options.length === 0) return id || '';
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

  // Styling constants matching DiskUsage_Edit
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
        <StorageIcon /> Server Disk Usage Check - Review
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

      {/* Disk Usage Data - Server Accordions */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
          <CircularProgress />
        </Box>
      ) : !servers || servers.length === 0 ? (
        <Box sx={{ 
          padding: 4, 
          backgroundColor: '#f5f5f5', 
          borderRadius: 1,
          marginBottom: 2
        }}>
          <Typography variant="body1" color="textSecondary">
            No disk usage data recorded during maintenance.
          </Typography>
        </Box>
      ) : (() => {
        // Count how many servers have the same name (for display purposes)
        const activeServers = servers.filter(server => !server.isDeleted);
        const serverNameCounts = {};
        activeServers.forEach(server => {
          const name = server.serverName || 'Unknown Server';
          serverNameCounts[name] = (serverNameCounts[name] || 0) + 1;
        });
        
        let serverNameIndex = {};
        
        console.log('DiskUsage_Edit_Review - Rendering servers:', activeServers);
        
        return activeServers.map((server, serverIndex) => {
          const serverName = server.serverName || `Server ${serverIndex + 1}`;
          const isDuplicate = serverNameCounts[serverName] > 1;
          
          // CRITICAL: Ensure truly unique key - MUST use tempId which includes index
          // This ensures React treats each server entry as a separate component
          // Even if two servers have the same name and id, they have different tempIds
          const uniqueKey = server.tempId || 
            (server.id ? `server-id-${server.id}-idx${serverIndex}` : `server-index-${serverIndex}-${serverName}`);
          
          console.log(`DiskUsage_Edit_Review - Rendering server ${serverIndex}:`, {
            serverName,
            id: server.id,
            tempId: server.tempId,
            uniqueKey,
            disksCount: server.disks?.length || 0,
            isDuplicate,
            disks: server.disks
          });
          
          // Track index for duplicate server names
          if (isDuplicate) {
            serverNameIndex[serverName] = (serverNameIndex[serverName] || 0) + 1;
          }
          
          return (
          <Accordion 
            key={uniqueKey} 
            sx={{
              marginBottom: 2,
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:before': {
                display: 'none',
              },
            }}
            defaultExpanded={false}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: '#f8f9fa',
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 1
                },
                pointerEvents: 'auto !important'
              }}
            >
              <ComputerIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {serverName}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2} sx={{ marginBottom: 2 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Server Name"
                    value={server.serverName}
                    disabled
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: '#000000',
                      },
                    }}
                  />
                </Grid>
              </Grid>

              {/* Disks Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Disk</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Capacity (GB)</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Free Space (GB)</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Usage %</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Check (Usage &lt; 50%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {server.disks && server.disks.length > 0 ? (
                      server.disks
                        .filter(disk => !disk.isDeleted)
                        .map((disk, diskIndex) => (
                          <TableRow key={diskIndex}>
                            <TableCell>
                              <TextField
                                fullWidth
                                value={disk.disk || ''}
                                disabled
                                size="small"
                                sx={{
                                  '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: '#000000',
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                value={getStatusName(disk.status, serverDiskStatusOptions)}
                                disabled
                                size="small"
                                sx={{
                                  '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: '#000000',
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                value={disk.capacity || ''}
                                disabled
                                size="small"
                                sx={{
                                  '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: '#000000',
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                value={disk.freeSpace || ''}
                                disabled
                                size="small"
                                sx={{
                                  '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: '#000000',
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                value={disk.usage || ''}
                                disabled
                                size="small"
                                sx={{
                                  '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: '#000000',
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                value={getStatusName(disk.check, resultStatusOptions)}
                                disabled
                                size="small"
                                sx={{
                                  '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: '#000000',
                                  },
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="textSecondary">
                            No disk data available for this server
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
          );
        });
      })()}

      {/* General Remarks */}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Paper>
  );
};

export default DiskUsage_Edit_Review;