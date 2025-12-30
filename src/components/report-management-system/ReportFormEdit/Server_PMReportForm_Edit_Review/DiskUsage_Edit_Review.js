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

  // Initialize data from props only once - matching DiskUsage_Edit pattern
  useEffect(() => {
    if (!isInitialized.current) {
      // Handle API response format (pmServerDiskUsageHealths)
      if (data && data.pmServerDiskUsageHealths && data.pmServerDiskUsageHealths.length > 0) {
        const apiData = data.pmServerDiskUsageHealths[0];
        
        // Group details by serverName to create server structure
        const serverMap = new Map();
        
        if (apiData.details && apiData.details.length > 0) {
          apiData.details.forEach((detail) => {
            const serverName = detail.serverName;
            
            if (!serverMap.has(serverName)) {
              serverMap.set(serverName, {
                id: detail.pmServerDiskUsageHealthID,
                serverName: serverName,
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
            serverMap.get(serverName).disks.push(diskEntry);
          });
        }
        
        const mappedServers = Array.from(serverMap.values());
        setServers(mappedServers);
        
        // Set remarks from API data
        if (apiData.remarks) {
          setRemarks(apiData.remarks);
        }
      }
      // Handle formData from Edit component (preferred for Review)
      else if (formData && formData.servers && formData.servers.length > 0) {
        setServers(formData.servers);
        if (formData.remarks) {
          setRemarks(formData.remarks);
        }
        // Get options from formData if available
        if (formData.resultStatusOptions) {
          setResultStatusOptions(formData.resultStatusOptions);
        }
        if (formData.serverDiskStatusOptions) {
          setServerDiskStatusOptions(formData.serverDiskStatusOptions);
        }
      }
      // Handle legacy/direct data format (servers array)
      else if (data && data.servers && data.servers.length > 0) {
        const mappedServers = data.servers.map(server => ({
          id: server.id || null,
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
            isDeleted: disk.isDeleted || false
          })) : [],
          isDeleted: server.isDeleted || false
        }));
        setServers(mappedServers);
        
        if (data.remarks) {
          setRemarks(data.remarks);
        }
      }
      
      isInitialized.current = true;
    }
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
      ) : (
        servers
          .filter(server => !server.isDeleted)
          .map((server, serverIndex) => (
          <Accordion 
            key={server.id || serverIndex} 
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
                {server.serverName || `Server ${serverIndex + 1}`}
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
        ))
      )}

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