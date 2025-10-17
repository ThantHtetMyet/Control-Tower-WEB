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
  Update as UpdateIcon,
} from '@mui/icons-material';

// Import the yes/no status service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const HotFixes_Review = ({ data }) => {
  const [hotFixesData, setHotFixesData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize data from props
  useEffect(() => {
    if (data) {
      if (data.hotFixesData && data.hotFixesData.length > 0) {
        setHotFixesData(data.hotFixesData);
      }
      
      if (data.remarks) {
        setRemarks(data.remarks);
      }
    }
  }, [data]);

  // Fetch YesNoStatus options for display
  useEffect(() => {
    const fetchYesNoStatuses = async () => {
      try {
        setLoading(true);
        const response = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching yes/no status options:', error);
        setYesNoStatusOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchYesNoStatuses();
  }, []);

  // Get yes/no status name by id
  const getYesNoStatusName = (id) => {
    const status = yesNoStatusOptions.find(option => option.id === id);
    return status ? status.name : id;
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

  return (
    <Paper sx={sectionContainerStyle}>
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <UpdateIcon /> Hotfixes / Service Packs
      </Typography>
      
      {/* Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Check for available hotfixes and service packs, and verify installation status.
        </Typography>
        
        <Box sx={{ 
          padding: 2, 
          backgroundColor: '#fff3e0', 
          borderRadius: 1, 
          border: '1px solid #ff9800',
          marginBottom: 2
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f57c00', marginBottom: 1 }}>
            ⚠️ Important Notes:
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            • Check Windows Update for available hotfixes
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            • Verify service pack installation status
          </Typography>
          <Typography variant="body2">
            • Document any pending updates or installation issues
          </Typography>
        </Box>
      </Box>

      {/* Hotfixes / Service Packs Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Result</TableCell>
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
              hotFixesData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.item}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      variant="outlined"
                      value={row.description}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.status}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={loading ? 'Loading...' : getYesNoStatusName(row.result)}
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

export default HotFixes_Review;