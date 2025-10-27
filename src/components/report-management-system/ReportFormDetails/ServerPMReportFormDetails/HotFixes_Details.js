import React, { useState, useEffect } from 'react';
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
  Chip
} from '@mui/material';
import {
  Build as BuildIcon,
} from '@mui/icons-material';
import resultStatusService from '../../../api-services/resultStatusService';

const HotFixes_Details = ({ data, disabled = false }) => {
  const [hotFixesData, setHotFixesData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);

  // Fetch ResultStatus options on component mount
  useEffect(() => {
    const fetchResultStatuses = async () => {
      try {
        const response = await resultStatusService.getResultStatuses();
        setResultStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching result status options:', error);
      }
    };

    fetchResultStatuses();
  }, []);

  // Transform API data when it changes
  useEffect(() => {
    
    if (!data) {
      
      setHotFixesData([]);
      setRemarks('');
      return;
    }

    try {
      // Handle different possible data structures
      let hotFixesArray = null;
      let remarksValue = '';

      // Check if data is the hotfixes array directly
      if (Array.isArray(data)) {
        hotFixesArray = data;
      }
      // Check for nested pmServerHotFixes property
      else if (data.pmServerHotFixes && Array.isArray(data.pmServerHotFixes)) {
        hotFixesArray = data.pmServerHotFixes;
      }
      // Check for other possible property names
      else if (data.PMServerHotFixes && Array.isArray(data.PMServerHotFixes)) {
        hotFixesArray = data.PMServerHotFixes;
      }
      else if (data.hotFixes && Array.isArray(data.hotFixes)) {
        hotFixesArray = data.hotFixes;
      }

      console.log('HotFixes_Details - Extracted hotFixesArray:', hotFixesArray);

      if (hotFixesArray && hotFixesArray.length > 0) {
        const hotFixesRecord = hotFixesArray[0];
        console.log('HotFixes_Details - Processing record:', hotFixesRecord);

        // Extract details array
        const details = hotFixesRecord.details || hotFixesRecord.Details || [];
        console.log('HotFixes_Details - Details array:', details);

        // Extract remarks
        remarksValue = hotFixesRecord.remarks || hotFixesRecord.Remarks || '';
        console.log('HotFixes_Details - Remarks:', remarksValue);

        // Transform details data
        const transformedData = details.map((detail, index) => {
          const transformed = {
            id: detail.id || detail.ID || `hotfix-${index}`,
            serialNo: detail.serialNo || detail.SerialNo || (index + 1).toString(),
            machineName: detail.serverName || detail.ServerName || 'N/A',
            latestHotfixesApplied: detail.hotFixName || detail.HotFixName || detail.latestHotFixsApplied || detail.LatestHotFixsApplied || 'N/A',
            done: detail.resultStatusID || detail.ResultStatusID,
            resultStatusName: detail.resultStatusName || detail.ResultStatusName || 'Unknown'
          };
          console.log(`HotFixes_Details - Transformed detail ${index}:`, transformed);
          return transformed;
        });

        console.log('HotFixes_Details - Final transformed data:', transformedData);
        setHotFixesData(transformedData);
        setRemarks(remarksValue);
      } else {
        console.log('HotFixes_Details - No hotfixes array found or empty');
        setHotFixesData([]);
        setRemarks('');
      }
    } catch (error) {
      console.error('HotFixes_Details - Error processing data:', error);
      setHotFixesData([]);
      setRemarks('');
    }
  }, [data]);

  // Get result status name by ID
  const getResultStatusName = (statusId) => {
    if (!statusId) return 'N/A';
    const status = resultStatusOptions.find(option => option.id === statusId);
    return status ? status.name : statusId;
  };

  // Get status color for chip
  const getStatusColor = (statusName) => {
    if (!statusName) return 'default';
    
    const statusLower = statusName.toString().toLowerCase();
    
    if (statusLower.includes('pass') || statusLower.includes('ok') || statusLower.includes('good') || statusLower.includes('success')) {
      return 'success';
    } else if (statusLower.includes('fail') || statusLower.includes('error') || statusLower.includes('bad') || statusLower.includes('critical')) {
      return 'error';
    } else if (statusLower.includes('warning') || statusLower.includes('caution') || statusLower.includes('pending')) {
      return 'warning';
    }
    
    return 'default';
  };

  // Field styling for disabled inputs
  const fieldStyle = {
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000',
      color: '#000000'
    },
    '& .MuiInputLabel-root.Mui-disabled': {
      color: '#666666'
    }
  };

  // Styling to match HotFixes.js
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
        <BuildIcon /> Hotfixes / Service Packs
      </Typography>
      
      {/* HotFixes Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          To review & apply the latest hotfixes, the service pack on all servers were applicable.
        </Typography>
      </Box>

      {/* HotFixes Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Machine Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Latest Hotfixes Applied (e.g., KB4022719)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Done</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hotFixesData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No hotfixes data available
                </TableCell>
              </TableRow>
            ) : (
              hotFixesData.map((row, index) => (
                <TableRow key={row.id || index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {row.serialNo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {row.machineName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {row.latestHotfixesApplied}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {row.done ? (
                      <Chip 
                        label={row.resultStatusName || getResultStatusName(row.done)} 
                        color={getStatusColor(row.resultStatusName || getResultStatusName(row.done))} 
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
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
          rows={3}
          variant="outlined"
          label="Remarks"
          value={remarks}
          disabled={disabled}
          sx={fieldStyle}
        />
      </Box>
    </Paper>
  );
};

export default HotFixes_Details;