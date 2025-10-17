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

// Import the yes/no status service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const SoftwarePatch_Review = ({ data }) => {
  const [softwarePatchData, setSoftwarePatchData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);

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
        <SystemUpdateIcon /> Software Patch Summary
      </Typography>
      
      {/* Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Review and document software patches applied during the maintenance period.
        </Typography>
        
        <Box sx={{ 
          padding: 2, 
          backgroundColor: '#f3e5f5', 
          borderRadius: 1, 
          border: '1px solid #9c27b0',
          marginBottom: 2
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#7b1fa2', marginBottom: 1 }}>
            🔧 Patch Summary Items:
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            • Operating system patches and updates
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            • SCADA software patches and upgrades
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            • Database software updates
          </Typography>
          <Typography variant="body2">
            • Security patches and vulnerability fixes
          </Typography>
        </Box>
      </Box>

      {/* Software Patch Summary Table */}
      <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Software/System</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Patch Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Version/KB Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Installation Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {softwarePatchData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No software patch data available.
                </TableCell>
              </TableRow>
            ) : (
              softwarePatchData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.software}
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
                      value={row.patchDescription}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.version}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.installationDate}
                      disabled
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={loading ? 'Loading...' : getYesNoStatusName(row.status)}
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

export default SoftwarePatch_Review;