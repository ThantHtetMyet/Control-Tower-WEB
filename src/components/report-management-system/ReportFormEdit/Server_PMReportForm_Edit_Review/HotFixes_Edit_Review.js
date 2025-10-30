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
  TextField
} from '@mui/material';
import {
  Update as UpdateIcon
} from '@mui/icons-material';

// Import the result status service
import resultStatusService from '../../../api-services/resultStatusService';

const HotFixes_Edit_Review = ({ data, disabled = true, formData }) => {
  const [hotFixesData, setHotFixesData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Get status name by ID
  const getStatusName = (id) => {
    const status = resultStatusOptions.find(option => option.ID === id || option.id === id);
    return status ? (status.Name || status.name) : id;
  };

  // Initialize data from props only once
  useEffect(() => {
    if (!isInitialized.current) {
      // Prioritize formData over data
      if (formData && formData.hotFixesData && formData.hotFixesData.length > 0) {
        setHotFixesData(formData.hotFixesData);
      } else if (data && data.pmServerHotFixes && data.pmServerHotFixes.length > 0) {
        // Handle API response format
        const hotFixesRecord = data.pmServerHotFixes[0];
        if (hotFixesRecord && hotFixesRecord.details && hotFixesRecord.details.length > 0) {
          const mappedData = hotFixesRecord.details.map(detail => ({
            id: detail.id,
            serialNo: detail.serialNo,
            item: detail.serverName,
            latestHotfixesApplied: detail.hotFixName,
            done: detail.resultStatusID,
            isDeleted: detail.isDeleted || false,
            isNew: detail.isNew || false,
            isModified: detail.isModified || false,
          }));
          
          // Sort by serialNo (convert to number for proper sorting)
          const sortedData = mappedData.sort((a, b) => {
            const serialA = parseInt(a.serialNo) || 0;
            const serialB = parseInt(b.serialNo) || 0;
            return serialA - serialB;
          });
          
          setHotFixesData(sortedData);
        }
      } else if (data && data.hotFixesData && data.hotFixesData.length > 0) {
        setHotFixesData(data.hotFixesData);
      }
      
      // Get remarks from HotFixes-specific sources ONLY
      console.log('=== HOTFIXES REMARKS DEBUG ===');
      if (formData && formData.hotFixesData && formData.hotFixesData.remarks) {
        console.log('Setting remarks from formData.hotFixesData.remarks:', formData.hotFixesData.remarks);
        setRemarks(formData.hotFixesData.remarks);
      } else if (data && data.pmServerHotFixes && data.pmServerHotFixes[0]?.remarks) {
        console.log('Setting remarks from data.pmServerHotFixes[0].remarks:', data.pmServerHotFixes[0].remarks);
        setRemarks(data.pmServerHotFixes[0].remarks);
      } else if (data && data.remarks) {
        console.log('Setting remarks from data.remarks:', data.remarks);
        setRemarks(data.remarks);
      } else {
        console.log('No HotFixes-specific remarks found');
        setRemarks('');
      }
      
      isInitialized.current = true;
    }
  }, [data, formData]);

  // Fetch Result Status options for display
  useEffect(() => {
    const fetchResultStatusOptions = async () => {
      try {
        setLoading(true);
        const response = await resultStatusService.getResultStatuses();
        setResultStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching Result Status options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResultStatusOptions();
  }, []);

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
        <UpdateIcon /> Hotfixes / Service Packs
      </Typography>
      
      {/* HotFixes Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          To review & apply the latest hotfixes, the service pack on all servers were applicable.
        </Typography>
        <Box sx={{ marginLeft: 2 }}>
          <Typography variant="body2">
            • Check for available hotfixes and service packs
          </Typography>
          <Typography variant="body2">
            • Verify service pack installation status
          </Typography>
          <Typography variant="body2">
            • Document any pending updates or installation issues
          </Typography>
        </Box>
      </Box>

      {/* HotFixes Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 2, border: '1px solid #ddd' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', color: '#333', border: '1px solid #ddd' }} align="center">S/N</TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', color: '#333', border: '1px solid #ddd' }} align="center">Machine Name</TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', color: '#333', border: '1px solid #ddd' }} align="center">Latest Hotfixes Applied</TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', color: '#333', border: '1px solid #ddd' }} align="center">Done</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hotFixesData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No hotfixes/service packs data available.
                </TableCell>
              </TableRow>
            ) : (
              hotFixesData
                .filter(row => !row.isDeleted)
                .map((row, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ border: '1px solid #ddd', padding: '8px' }} align="center">
                    {row.serialNo || index + 1}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #ddd', padding: '8px' }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.item || row.machineName || ''}
                      disabled
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f5f5f5',
                          '& fieldset': {
                            borderColor: '#ddd'
                          }
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #ddd', padding: '8px' }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.latestHotfixesApplied || row.hotFixName || ''}
                      disabled
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f5f5f5',
                          '& fieldset': {
                            borderColor: '#ddd'
                          }
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #ddd', padding: '8px' }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={getStatusName(row.done) || ''}
                      disabled
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f5f5f5',
                          '& fieldset': {
                            borderColor: '#ddd'
                          }
                        }
                      }}
                    />
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
          rows={4}
          variant="outlined"
          label="Remarks"
          value={remarks}
          disabled
          placeholder="No remarks provided"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f5f5f5',
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default HotFixes_Edit_Review;