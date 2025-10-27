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
  TextField
} from '@mui/material';
import { SystemUpdate as SystemUpdateIcon } from '@mui/icons-material';

const SoftwarePatch_Details = ({ data, disabled = false }) => {
  const [softwarePatchData, setSoftwarePatchData] = useState([]);
  const [remarks, setRemarks] = useState('');

  // Debug logging
  useEffect(() => {
    console.log('SoftwarePatch_Details - Raw data received:', data);
  }, [data]);

  // Data transformation effect
  useEffect(() => {
    if (data) {
      let processedData = [];
      let processedRemarks = '';

      try {
        // Handle different data structures - prioritize the exact API structure
        if (data.pmServerSoftwarePatchSummaries && Array.isArray(data.pmServerSoftwarePatchSummaries) && data.pmServerSoftwarePatchSummaries.length > 0) {
          console.log('SoftwarePatch_Details - Found pmServerSoftwarePatchSummaries');
          const summary = data.pmServerSoftwarePatchSummaries[0];
          console.log('SoftwarePatch_Details - Summary object:', summary);
          
          if (summary && summary.details && Array.isArray(summary.details)) {
            processedData = summary.details;
            console.log('SoftwarePatch_Details - Extracted details:', processedData);
          }
          processedRemarks = summary?.remarks || '';
        } 
        // Handle direct array of summaries
        else if (Array.isArray(data) && data.length > 0 && data[0].details) {
          console.log('SoftwarePatch_Details - Found direct array with details');
          const summary = data[0];
          if (summary.details && Array.isArray(summary.details)) {
            processedData = summary.details;
          }
          processedRemarks = summary?.remarks || '';
        }
        // Handle case where data itself contains the details
        else if (data.details && Array.isArray(data.details)) {
          console.log('SoftwarePatch_Details - Found direct details array');
          processedData = data.details;
          processedRemarks = data.remarks || '';
        }
        // Handle case where data is directly the array of items
        else if (Array.isArray(data)) {
          console.log('SoftwarePatch_Details - Data is direct array');
          processedData = data;
          processedRemarks = data[0]?.remarks || '';
        }
        // Fallback: try other possible structures
        else {
          console.log('SoftwarePatch_Details - Trying fallback structures');
          const possibleKeys = ['PMServerSoftwarePatchSummaries', 'softwarePatchSummaries', 'SoftwarePatchSummaries'];
          
          for (const key of possibleKeys) {
            if (data[key] && Array.isArray(data[key]) && data[key].length > 0) {
              const summary = data[key][0];
              if (summary && summary.details && Array.isArray(summary.details)) {
                processedData = summary.details;
                processedRemarks = summary?.remarks || '';
                break;
              }
            }
          }
        }

        // Extract remarks from various possible locations if not found
        if (!processedRemarks) {
          processedRemarks = data.remarks || data.Remarks || '';
        }

        console.log('SoftwarePatch_Details - Final processed data:', processedData);
        console.log('SoftwarePatch_Details - Final processed remarks:', processedRemarks);
        console.log('SoftwarePatch_Details - Data length:', processedData.length);

        // Validate the processed data
        if (processedData.length > 0) {
          console.log('SoftwarePatch_Details - Sample item:', processedData[0]);
          console.log('SoftwarePatch_Details - Sample item keys:', Object.keys(processedData[0]));
        }

        setSoftwarePatchData(processedData);
        setRemarks(processedRemarks);
      } catch (error) {
        console.error('SoftwarePatch_Details - Error processing data:', error);
        setSoftwarePatchData([]);
        setRemarks('');
      }
    } else {
      console.log('SoftwarePatch_Details - No data provided');
      setSoftwarePatchData([]);
      setRemarks('');
    }
  }, [data]);

  const fieldStyle = {
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000',
      color: '#000000'
    },
    '& .MuiInputLabel-root.Mui-disabled': {
      color: '#666666'
    }
  };

  // Styling constants matching SoftwarePatch.js
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

  const tableHeaderStyle = {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    color: '#333',
    border: '1px solid #ddd'
  };

  const tableCellStyle = {
    border: '1px solid #ddd',
    padding: '8px'
  };

  return (
    <Paper sx={sectionContainerStyle}>
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <SystemUpdateIcon /> Software Patch Summary
      </Typography>

      {/* Data Display */}
      {softwarePatchData && softwarePatchData.length > 0 ? (
        <TableContainer component={Paper} sx={{ marginBottom: 2, border: '1px solid #ddd' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeaderStyle} align="center">S/N</TableCell>
                <TableCell sx={tableHeaderStyle} align="center">Server Name</TableCell>
                <TableCell sx={tableHeaderStyle} align="center">Previous Patch</TableCell>
                <TableCell sx={tableHeaderStyle} align="center">Current Patch</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {softwarePatchData.map((item, index) => (
                <TableRow key={item.id || index}>
                  <TableCell sx={tableCellStyle} align="center">
                    {item.serialNo || index + 1}
                  </TableCell>
                  <TableCell sx={tableCellStyle} align="center">
                    <Typography variant="body2">
                      {item.serverName || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={tableCellStyle} align="center">
                    <Typography variant="body2">
                      {item.previousPatch || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={tableCellStyle} align="center">
                    <Typography variant="body2">
                      {item.currentPatch || 'N/A'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ 
          padding: 3, 
          textAlign: 'center', 
          backgroundColor: '#f5f5f5', 
          borderRadius: 1,
          marginBottom: 2
        }}>
          <Typography variant="body1" color="textSecondary">
            No software patch data available
          </Typography>
        </Box>
      )}

      {/* Remarks Section - Matching SoftwarePatch.js style */}
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
          disabled={disabled}
          placeholder="Enter any additional remarks or observations..."
          sx={{
            ...fieldStyle,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default SoftwarePatch_Details;