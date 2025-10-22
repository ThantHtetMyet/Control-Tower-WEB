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
  Chip
} from '@mui/material';
import {
  Storage as StorageIcon,
  ExpandMore as ExpandMoreIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const DiskUsage_Details = ({ data = [] }) => {
  const [diskUsageData, setDiskUsageData] = useState({});
  const [remarks, setRemarks] = useState('');

  // Helper function for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Initialize data from props
  useEffect(() => {
    // Handle the API response structure from PMReportFormServerController
    if (Array.isArray(data) && data.length > 0) {
      // Extract the first item which contains the disk usage health data
      const diskUsageHealthItem = data[0];
      
      if (diskUsageHealthItem && diskUsageHealthItem.details && Array.isArray(diskUsageHealthItem.details)) {
        // Map the details to the expected format (note: lowercase 'details' from API)
        const mappedData = diskUsageHealthItem.details.map(detail => ({
          id: detail.id,
          serverName: detail.serverName,
          diskName: detail.diskName,
          capacity: detail.capacity,
          freeSpace: detail.freeSpace,
          usage: detail.usage,
          serverDiskStatusID: detail.serverDiskStatusID,
          serverDiskStatusName: detail.serverDiskStatusName,
          resultStatusID: detail.resultStatusID,
          resultStatusName: detail.resultStatusName,
          remarks: detail.remarks,
          createdDate: detail.createdDate,
          updatedDate: detail.updatedDate
        }));
        
        // Group disks by server name
        const groupedByServer = mappedData.reduce((acc, disk) => {
          const serverName = disk.serverName || 'Unknown Server';
          if (!acc[serverName]) {
            acc[serverName] = [];
          }
          acc[serverName].push(disk);
          return acc;
        }, {});
        
        setDiskUsageData(groupedByServer);
        
        // Set remarks from the parent disk usage health item
        setRemarks(diskUsageHealthItem.remarks || '');
      }
    }
  }, [data]);

  // Get status chip
  const getStatusChip = (status) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    let color = 'default';
    
    if (statusLower.includes('pass') || statusLower.includes('ok') || statusLower.includes('good')) {
      color = 'success';
    } else if (statusLower.includes('fail') || statusLower.includes('error') || statusLower.includes('bad')) {
      color = 'error';
    } else if (statusLower.includes('warning') || statusLower.includes('caution')) {
      color = 'warning';
    }
    
    return (
      <Chip 
        label={status} 
        color={color} 
        size="small"
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  // Styling
  const fieldStyle = {
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000',
      color: '#000000'
    },
    '& .MuiInputLabel-root.Mui-disabled': {
      color: '#666666'
    }
  };

  return (
    <Paper sx={{ 
      padding: 3, 
      backgroundColor: '#ffffff', 
      borderRadius: 2, 
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: 3
    }}>
      
      {/* Section Title */}
      <Typography variant="h5" sx={{ 
        color: '#1976d2', 
        fontWeight: 'bold',
        marginBottom: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <StorageIcon /> Server Disk Usage Check
      </Typography>
      
      {/* Instructions */}
      <Box sx={{ 
        backgroundColor: '#f5f5f5',
        padding: 2,
        borderRadius: 1,
        marginBottom: 3,
        border: '1px solid #e0e0e0'
      }}>
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
      <Box sx={{
        backgroundColor: '#fff3cd',
        padding: 2,
        borderRadius: 1,
        marginBottom: 3,
        border: '1px solid #ffeaa7',
        borderLeft: '4px solid #fdcb6e'
      }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          * Note: The HDSRS servers with SQL Server Database keep the historical data and daily/weekly/monthly 
          backups. The disk space usage can be up to 90%, which is considered as normal.
        </Typography>
      </Box>
      {/* Disk Usage Data - Accordion by Server */}
      {Object.keys(diskUsageData).length > 0 ? (
        <Box sx={{ marginBottom: 3 }}>
          {Object.entries(diskUsageData).map(([serverName, disks]) => (
            <Accordion key={serverName} sx={{ marginBottom: 1 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: '#f8f9fa',
                  '&:hover': {
                    backgroundColor: '#e9ecef'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ComputerIcon sx={{ color: '#1976d2' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {serverName}
                  </Typography>
                  <Chip 
                    label={`${disks.length} disk${disks.length !== 1 ? 's' : ''}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Disk</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Free Space</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Usage</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Result Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {disks.map((disk, index) => (
                        <TableRow key={disk.id || index}>
                          <TableCell>{disk.diskName || 'N/A'}</TableCell>
                          <TableCell>{disk.serverDiskStatusName || 'N/A'}</TableCell>
                          <TableCell>{disk.capacity || 'N/A'}</TableCell>
                          <TableCell>{disk.freeSpace || 'N/A'}</TableCell>
                          <TableCell>{disk.usage || 'N/A'}</TableCell>
                          <TableCell>
                            {getStatusChip(disk.resultStatusName) || 
                             disk.resultStatusName || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', padding: 3, color: '#666' }}>
          <Typography variant="body2">
            No disk usage records available
          </Typography>
        </Box>
      )}

      {/* Remarks */}
      {remarks && (
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Remarks"
          value={remarks}
          disabled
          sx={fieldStyle}
        />
      )}
    </Paper>
  );
};

export default DiskUsage_Details;