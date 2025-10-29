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

const DatabaseBackup_Review = ({ data = {} }) => {
  const [mssqlBackupData, setMssqlBackupData] = useState([]);
  const [scadaBackupData, setScadaBackupData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [latestBackupFileName, setLatestBackupFileName] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);

  // Initialize data from props
  useEffect(() => {
    console.log('DatabaseBackup_Review - Received data:', data);
    
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
    
    console.log('Final database backup data:', { 
      mssqlBackupData: data.mssqlBackupData, 
      scadaBackupData: data.scadaBackupData, 
      remarks: data.remarks, 
      latestBackupFileName: data.latestBackupFileName 
    });
  }, [data]);

  // Fetch YesNoStatus options on component mount
  useEffect(() => {
    const fetchYesNoStatuses = async () => {
      try {
        const response = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching yes/no status options:', error);
      }
    };

    fetchYesNoStatuses();
  }, []);

  // Get status name by ID
  const getStatusName = (id, options) => {
    const status = options.find(option => option.ID === id || option.id === id);
    return status ? (status.Name || status.name) : id;
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
      
      <Typography variant="body1" sx={{ marginBottom: 3 }}>
        Verify database backup processes and ensure backup files are created successfully.
      </Typography>

      {/* Database Backup Instructions */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
          Database Backup
        </Typography>
        
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Check <b> D:\MSSQLSERVER-BACKUP\Monthly </b> make sure the database is backup in this directory.
        </Typography>
      </Box>

      {/* MSSQL Database Backup Table */}
      <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
        🗄️ MSSQL Database Backup Check
      </Typography>
      
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Monthly DB Backup are Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mssqlBackupData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No data available for this section.
                </TableCell>
              </TableRow>
            ) : (
              mssqlBackupData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.item || ''}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000000',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={getStatusName(row.monthlyDBBackupCreated, yesNoStatusOptions) || ''}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000000',
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* SCADA Section */}
      <Box sx={{ marginTop: 4, marginBottom: 3 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Check <b> D:\SCADA </b> make sure the database is backup in this directory.
        </Typography>
      </Box>

      {/* SCADA Database Backup Table */}
      <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
        📊 SCADA Database Backup Check
      </Typography>
      
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>SCADA DB Backup are Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scadaBackupData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No data available for this section.
                </TableCell>
              </TableRow>
            ) : (
              scadaBackupData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.item || ''}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000000',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={getStatusName(row.monthlyDBBackupCreated, yesNoStatusOptions) || ''}
                      disabled
                      size="small"
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000000',
                        },
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
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f5f5f5',
            },
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: '#000000',
            },
          }}
        />
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
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f5f5f5',
            },
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: '#000000',
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default DatabaseBackup_Review;