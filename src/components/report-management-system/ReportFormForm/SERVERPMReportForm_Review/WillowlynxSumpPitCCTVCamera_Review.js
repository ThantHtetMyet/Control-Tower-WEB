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
} from '@mui/material';
import {
  Videocam as VideocamIcon,
} from '@mui/icons-material';

const WillowlynxSumpPitCCTVCamera_Review = ({ data = {} }) => {
  const [cameraData, setCameraData] = useState([]);
  const [remarks, setRemarks] = useState('');

  // Initialize data from props
  useEffect(() => {
    if (data.cameraData && data.cameraData.length > 0) {
      setCameraData(data.cameraData);
    }
    if (data.remarks) {
      setRemarks(data.remarks);
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
        <VideocamIcon /> Willowlynx Sump Pit CCTV Camera Check
      </Typography>
      
      <Typography variant="body1" sx={{ marginBottom: 3 }}>
        Monitor CCTV camera functionality and video feed quality for sump pit surveillance.
      </Typography>

      {/* CCTV Camera Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Camera Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Camera ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Video Quality</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Check Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cameraData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No data available for this section.
                </TableCell>
              </TableRow>
            ) : (
              cameraData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.cameraLocation || ''}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.cameraId || ''}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.status || ''}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.videoQuality || ''}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.checkResult || ''}
                      disabled
                      size="small"
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

export default WillowlynxSumpPitCCTVCamera_Review;