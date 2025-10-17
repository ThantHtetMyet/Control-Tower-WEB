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
  IconButton,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  Select,
  FormControl,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
  ExpandMore as ExpandMoreIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';

// Import the ServerDiskStatus service
import serverDiskStatusService from '../../../api-services/serverDiskStatusService';
// Import the ResultStatus service
import resultStatusService from '../../../api-services/resultStatusService';

const DiskUsage = ({ data = {}, onDataChange }) => {
  const [servers, setServers] = useState(data.servers || []);
  const [remarks, setRemarks] = useState(data.remarks || '');
  const [serverDiskStatusOptions, setServerDiskStatusOptions] = useState([]);
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Update parent component when data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        servers,
        remarks
      });
    }
  }, [servers, remarks, onDataChange]);

  // Server management handlers
  const addServer = () => {
    const newServer = {
      id: Date.now(),
      serverName: '',
      disks: []
    };
    setServers([...servers, newServer]);
  };

  const removeServer = (serverId) => {
    setServers(servers.filter(server => server.id !== serverId));
  };

  const updateServerName = (serverId, serverName) => {
    setServers(servers.map(server => 
      server.id === serverId ? { ...server, serverName } : server
    ));
  };

  // Disk management handlers
  const addDisk = (serverId) => {
    setServers(servers.map(server => 
      server.id === serverId 
        ? { 
            ...server, 
            disks: [...server.disks, { disk: '', status: '', capacity: '', freeSpace: '', usage: '', check: '' }]
          }
        : server
    ));
  };

  const removeDisk = (serverId, diskIndex) => {
    setServers(servers.map(server => 
      server.id === serverId 
        ? { 
            ...server, 
            disks: server.disks.filter((_, index) => index !== diskIndex)
          }
        : server
    ));
  };

  const updateDiskField = (serverId, diskIndex, field, value) => {
    setServers(servers.map(server => 
      server.id === serverId 
        ? { 
            ...server, 
            disks: server.disks.map((disk, index) => 
              index === diskIndex ? { ...disk, [field]: value } : disk
            )
          }
        : server
    ));
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
            <li>Remove old windows event logs to meet the target disk usage limit.</li>
          </ul>
        </Typography>
      </Box>

      {/* Note */}
      <Box sx={noteBoxStyle}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          * Note: The HDSRS servers with SQL Server Database keep the historical data and daily/weekly/monthly 
          backups. The disk space usage can be up to 90%, which is considered as normal.
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

      {/* Servers List */}
      {servers.map((server, serverIndex) => (
        <Accordion key={server.id} defaultExpanded sx={{ marginBottom: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: '#eeeeee'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <ComputerIcon sx={{ color: '#1976d2' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {server.serverName || `Server ${serverIndex + 1}`}
              </Typography>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  removeServer(server.id);
                }}
                sx={{ 
                  marginLeft: 'auto',
                  color: '#d32f2f',
                  '&:hover': {
                    backgroundColor: '#ffebee'
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} sx={{ marginBottom: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Server Name"
                  value={server.serverName}
                  onChange={(e) => updateServerName(server.id, e.target.value)}
                  placeholder="Enter server name"
                />
              </Grid>
            </Grid>

            {/* Disk Capacity Table */}
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
              - Disk Capacity:
            </Typography>
            
            <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
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
                      <TableCell colSpan={7} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                        No disks added yet. Click "Add Disk" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    server.disks.map((disk, diskIndex) => (
                    <TableRow key={diskIndex}>
                      <TableCell>
                        <TextField
                          size="small"
                          value={disk.disk}
                          onChange={(e) => updateDiskField(server.id, diskIndex, 'disk', e.target.value)}
                          placeholder="C:"
                          sx={{ minWidth: '60px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: '100px' }}>
                          <Select
                            value={disk.status}
                            onChange={(e) => updateDiskField(server.id, diskIndex, 'status', e.target.value)}
                            displayEmpty
                            sx={{ minHeight: '40px' }}
                          >
                            <MenuItem value="">
                              <em>Select Status</em>
                            </MenuItem>
                            {serverDiskStatusOptions.map((option) => (
                              <MenuItem key={option.id} value={option.name}>
                                {option.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={disk.capacity}
                          onChange={(e) => updateDiskField(server.id, diskIndex, 'capacity', e.target.value)}
                          placeholder="500 GB"
                          sx={{ minWidth: '80px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={disk.freeSpace}
                          onChange={(e) => updateDiskField(server.id, diskIndex, 'freeSpace', e.target.value)}
                          placeholder="250"
                          sx={{ minWidth: '80px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={disk.usage}
                          onChange={(e) => updateDiskField(server.id, diskIndex, 'usage', e.target.value)}
                          placeholder="50%"
                          sx={{ minWidth: '60px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: '80px' }}>
                          <Select
                            value={disk.check}
                            onChange={(e) => updateDiskField(server.id, diskIndex, 'check', e.target.value)}
                            displayEmpty
                            sx={{ minHeight: '40px' }}
                          >
                            <MenuItem value="">
                              <em>Select Status</em>
                            </MenuItem>
                            {resultStatusOptions.map((option) => (
                              <MenuItem key={option.id} value={option.name}>
                                {option.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => removeDisk(server.id, diskIndex)}
                          sx={{ color: '#d32f2f' }}
                          disabled={server.disks.length === 0}
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

            {/* Add Disk Button */}
            <Button
              variant="text"
              startIcon={<AddIcon />}
              onClick={() => addDisk(server.id)}
              sx={{
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: '#e3f2fd'
                }
              }}
            >
              Add Disk
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Remarks Section */}
      <Box sx={{ marginTop: 3 }}>
        <Typography variant="h6" sx={{ 
          color: '#ff9800', 
          fontWeight: 'bold', 
          marginBottom: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          📝 Remarks
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Remarks"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f9f9f9'
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default DiskUsage;