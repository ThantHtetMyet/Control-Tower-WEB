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
} from '@mui/material';
import {
  SystemUpdate as SystemUpdateIcon,
} from '@mui/icons-material';

const SoftwarePatch_Review = ({ data }) => {
  const [softwarePatchData, setSoftwarePatchData] = useState([]);
  const [remarks, setRemarks] = useState('');

  // Initialize data from props
  useEffect(() => {
    if (data) {
      if (data.softwarePatchData && data.softwarePatchData.length > 0) {
        setSoftwarePatchData(data.softwarePatchData);
      }
      
      if (data.remarks) {
        setRemarks(data.remarks);
      }
    }
  }, [data]);

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
        <SystemUpdateIcon /> Software Patch Summary
      </Typography>
      
      {/* Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Review software patches applied during the maintenance period.
        </Typography>
        
        <Box sx={{ 
          padding: 2, 
          backgroundColor: '#fff3e0', 
          borderRadius: 1, 
          border: '1px solid #ff9800',
          marginBottom: 2
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#e65100', marginBottom: 1 }}>
            📋 Important Notes:
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            • Document all software patches applied to each machine
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            • Include both previous and current patch versions
          </Typography>
          <Typography variant="body2">
            • Ensure all critical systems are updated appropriately
          </Typography>
        </Box>
      </Box>

      {/* Software Patch Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">S/N</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Machine Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Previous Patch</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Current Patch</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {softwarePatchData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No software patch data available.
                </TableCell>
              </TableRow>
            ) : (
              softwarePatchData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell align="center">
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.serialNumber || index + 1}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000',
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.machineName || ''}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000',
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.previousPatch || ''}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000',
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.currentPatch || ''}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000',
                          backgroundColor: '#f5f5f5'
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

export default SoftwarePatch_Review;