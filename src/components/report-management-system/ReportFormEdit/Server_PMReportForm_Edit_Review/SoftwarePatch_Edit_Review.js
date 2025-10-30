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
  SystemUpdate as SystemUpdateIcon
} from '@mui/icons-material';

const SoftwarePatch_Edit_Review = ({ data, disabled = true, formData }) => {
  const [softwarePatchData, setSoftwarePatchData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const isInitialized = useRef(false);

  // Initialize data from props only once
  useEffect(() => {
    if (!isInitialized.current) {
      console.log('SoftwarePatch_Edit_Review - Initializing data:', { formData, data });
      
      // Prioritize formData.softwarePatchData (from SoftwarePatch_Edit)
      if (formData && formData.softwarePatchData && formData.softwarePatchData.length > 0) {
        console.log('SoftwarePatch_Edit_Review - Using formData.softwarePatchData:', formData.softwarePatchData);
        setSoftwarePatchData(formData.softwarePatchData);
      } else if (data && data.pmServerSoftwarePatchSummaries && data.pmServerSoftwarePatchSummaries.length > 0) {
        console.log('SoftwarePatch_Edit_Review - Using data.pmServerSoftwarePatchSummaries:', data.pmServerSoftwarePatchSummaries);
        // Handle new API structure with pmServerSoftwarePatchSummaries
        const summary = data.pmServerSoftwarePatchSummaries[0];
        if (summary && summary.details && Array.isArray(summary.details)) {
          const transformedData = summary.details.map((item, index) => ({
            id: item.id || item.ID,
            serialNo: item.serialNo || item.SerialNo || (index + 1),
            machineName: item.serverName || item.ServerName || '',
            previousPatch: item.previousPatch || item.PreviousPatch || '',
            currentPatch: item.currentPatch || item.CurrentPatch || '',
            isDeleted: item.isDeleted || false,
            isNew: item.isNew || false,
            isModified: item.isModified || false
          })).sort((a, b) => a.serialNo - b.serialNo);
          
          setSoftwarePatchData(transformedData);
        }
      } else if (data && data.softwarePatchData && data.softwarePatchData.length > 0) {
        console.log('SoftwarePatch_Edit_Review - Using data.softwarePatchData:', data.softwarePatchData);
        // Handle legacy softwarePatchData structure
        const transformedData = data.softwarePatchData.map((item, index) => ({
          id: item.id,
          serialNo: item.serialNo || (index + 1),
          machineName: item.machineName || '',
          previousPatch: item.previousPatch || '',
          currentPatch: item.currentPatch || '',
          isDeleted: item.isDeleted || false,
          isNew: item.isNew || false,
          isModified: item.isModified || false
        })).sort((a, b) => a.serialNo - b.serialNo);
        
        setSoftwarePatchData(transformedData);
      }
      
      // Get SoftwarePatch-specific remarks (NOT SignOff remarks)
      if (formData && formData.softwarePatchData && formData.softwarePatchData.remarks) {
        console.log('SoftwarePatch_Edit_Review - Using SoftwarePatch-specific remarks from formData:', formData.softwarePatchData.remarks);
        setRemarks(formData.softwarePatchData.remarks);
      } else if (formData && formData.remarks) {
        console.log('SoftwarePatch_Edit_Review - Using formData.remarks:', formData.remarks);
        setRemarks(formData.remarks);
      } else if (data && data.pmServerSoftwarePatchSummaries && data.pmServerSoftwarePatchSummaries[0]?.remarks) {
        console.log('SoftwarePatch_Edit_Review - Using API remarks:', data.pmServerSoftwarePatchSummaries[0].remarks);
        setRemarks(data.pmServerSoftwarePatchSummaries[0].remarks);
      } else if (data && data.remarks) {
        console.log('SoftwarePatch_Edit_Review - Using data.remarks as fallback:', data.remarks);
        setRemarks(data.remarks);
      }
      
      isInitialized.current = true;
    }
  }, [data, formData]);

  // Styling constants (matching SoftwarePatch_Edit)
  const sectionContainerStyle = {
    padding: 3,
    marginBottom: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const sectionHeaderStyle = {
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#1976d2',
    display: 'flex',
    alignItems: 'center',
    gap: 1
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
              softwarePatchData
                .filter(row => !row.isDeleted)
                .map((row, index) => (
                <TableRow key={row.id || index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {row.serialNo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.machineName || ''}
                      disabled={disabled}
                      placeholder="Enter machine name"
                      variant="outlined"
                      sx={disabledFieldStyle}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.previousPatch || ''}
                      disabled={disabled}
                      placeholder="e.g., KB12345"
                      variant="outlined"
                      sx={disabledFieldStyle}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.currentPatch || ''}
                      disabled={disabled}
                      placeholder="e.g., KB23456"
                      variant="outlined"
                      sx={{
                        ...disabledFieldStyle,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#fafafa',
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
          disabled={disabled}
          placeholder="Enter any additional remarks or observations about software patches..."
          sx={disabledFieldStyle}
        />
      </Box>
    </Paper>
  );
};

export default SoftwarePatch_Edit_Review;