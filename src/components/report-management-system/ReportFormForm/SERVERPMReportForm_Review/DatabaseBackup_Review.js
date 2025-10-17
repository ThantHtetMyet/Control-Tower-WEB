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
  Backup as BackupIcon,
} from '@mui/icons-material';

// Import the yes/no status service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const DatabaseBackup_Review = ({ data }) => {
  const [mssqlBackupData, setMssqlBackupData] = useState([]);
  const [scadaBackupData, setScadaBackupData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [latestBackupFileName, setLatestBackupFileName] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize data from props
  useEffect(() => {
    if (data) {
      if (data.mssqlBackupData && data.mssqlBackupData.length > 0) {
        setMssqlBackupData(data.mssqlBackupData);
      }
      
      if (data.scadaBackupData && data.scadaBackupData.length > 0) {
        setScadaBackupData(data.scadaBackupData);
      }
      
      if (data.remarks) {
        setRemarks(data.remarks);
      }
      
      if (data.latestBackupFileName) {
        setLatestBackupFileName(data.latestBackupFileName);
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
        <BackupIcon /> Database Backup Check
      </Typography>
      
      {/* Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Verify database backup processes and ensure backup files are created successfully.
        </Typography>
      </Box>

      {/* Latest Backup File Name */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
          📁 Latest Backup File Name
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          label="Latest Backup File Name"
          value={latestBackupFileName}
          disabled
          placeholder="No backup file name provided"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f5f5f5',
            }
          }}
        />
      </Box>

      {/* MSSQL Database Backup Check */}
      <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
        🗄️ MSSQL Database Backup Check
      </Typography>
      
      <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mssqlBackupData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No MSSQL backup data available.
                </TableCell>
              </TableRow>
            ) : (
              mssqlBackupData.map((row, index) => (
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

      {/* SCADA Database Backup Check */}
      <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
        📊 SCADA Database Backup Check
      </Typography>
      
      <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scadaBackupData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No SCADA backup data available.
                </TableCell>
              </TableRow>
            ) : (
              scadaBackupData.map((row, index) => (
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

export default DatabaseBackup_Review;