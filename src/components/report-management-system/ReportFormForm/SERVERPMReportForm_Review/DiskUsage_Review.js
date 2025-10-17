import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
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

// Import the ServerDiskStatus service
import serverDiskStatusService from '../../../api-services/serverDiskStatusService';
// Import the ResultStatus service
import resultStatusService from '../../../api-services/resultStatusService';

const DiskUsage_Review = ({ data = {} }) => {
  const [servers, setServers] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [serverDiskStatusOptions, setServerDiskStatusOptions] = useState([]);
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize data from props
  useEffect(() => {
    if (data) {
      // Handle different possible data structures
      let serversData = [];
      let remarksData = '';
      
      // Check if data has servers directly
      if (data.servers && Array.isArray(data.servers)) {
        serversData = data.servers;
      }
      // Check if data has diskUsageServers (alternative naming)
      else if (data.diskUsageServers && Array.isArray(data.diskUsageServers)) {
        serversData = data.diskUsageServers;
      }
      // Check if data itself is an array of servers
      else if (Array.isArray(data)) {
        serversData = data;
      }
      // Check for other possible server data structures
      else if (data.serverData && Array.isArray(data.serverData)) {
        serversData = data.serverData;
      }
      // Check if data has individual server properties
      else {
        // Look for any property that might contain server data
        const possibleServerKeys = Object.keys(data).filter(key => 
          Array.isArray(data[key]) && data[key].length > 0 && 
          data[key][0] && (data[key][0].serverName || data[key][0].name)
        );
        
        if (possibleServerKeys.length > 0) {
          serversData = data[possibleServerKeys[0]];
        }
      }
      
      // Handle remarks
      if (data.remarks) {
        remarksData = data.remarks;
      } else if (data.diskUsageRemarks) {
        remarksData = data.diskUsageRemarks;
      } else if (data.comment) {
        remarksData = data.comment;
      }
      setServers(serversData);
      setRemarks(remarksData);
    }
  }, [data]);

  // Fetch ServerDiskStatus and ResultStatus options on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        
        // Fetch ServerDiskStatus options
        const serverDiskStatusResponse = await serverDiskStatusService.getServerDiskStatuses();
        setServerDiskStatusOptions(serverDiskStatusResponse || []);
        
        // Fetch ResultStatus options
        const resultStatusResponse = await resultStatusService.getResultStatuses();
        setResultStatusOptions(resultStatusResponse || []);
        
      } catch (error) {
        console.error('Error fetching options:', error);
        // Set fallback options if API calls fail
        setServerDiskStatusOptions([
          { ID: 'healthy', Name: 'Healthy' },
          { ID: 'unhealthy', Name: 'Unhealthy' }
        ]);
        setResultStatusOptions([
          { ID: 'pass', Name: 'Pass' },
          { ID: 'fail', Name: 'Fail' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  // Get status name by ID
  const getStatusName = (id, options) => {
    const status = options.find(option => option.ID === id || option.id === id);
    return status ? (status.Name || status.name) : id;
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

  const serverAccordionStyle = {
    marginBottom: 2,
    border: '1px solid #e0e0e0',
    borderRadius: 1,
    '&:before': {
      display: 'none',
    },
  };

  return (
    <Paper sx={sectionContainerStyle}>
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <StorageIcon /> Disk Usage Check
      </Typography>
      
      {/* Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Check disk usage for all servers and ensure adequate free space is available.
        </Typography>
        
        <Typography variant="body2" sx={{ 
          padding: 2, 
          backgroundColor: '#e3f2fd', 
          borderRadius: 1,
          border: '1px solid #bbdefb',
          marginBottom: 2
        }}>
          <strong>Note:</strong> Monitor disk usage regularly to prevent system issues. 
          Recommended to maintain at least 15-20% free space on system drives.
        </Typography>
      </Box>

      {/* Servers Display */}
      {servers.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
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
        servers.map((server, serverIndex) => (
          <Accordion 
            key={server.id || serverIndex} 
            sx={serverAccordionStyle}
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
                      <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Free Space</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Usage %</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Check</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {server.disks && server.disks.length > 0 ? (
                      server.disks.map((disk, diskIndex) => (
                        <TableRow key={diskIndex}>
                          <TableCell>
                            <TextField
                              fullWidth
                              value={disk.disk}
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
                              value={disk.capacity}
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
                              value={disk.freeSpace}
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
                              value={disk.usage}
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
                        <TableCell colSpan={6} sx={{ textAlign: 'center', padding: 2, color: '#666' }}>
                          No disk data recorded for this server.
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
          sx={{
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: '#000000',
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default DiskUsage_Review;