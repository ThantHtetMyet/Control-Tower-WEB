import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Backup as BackupIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const DatabaseBackup_Details = ({ data, disabled = false }) => {
  const [databaseBackups, setDatabaseBackups] = useState([]);
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);

  // Helper function for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', { hour12: false });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    const fetchYesNoStatusOptions = async () => {
      try {
        const options = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(options);
      } catch (error) {
        console.error('Error fetching yes/no status options:', error);
      }
    };

    fetchYesNoStatusOptions();
  }, []);

  useEffect(() => {
    console.log('DatabaseBackup_Details - Received data:', data);
    
    if (data && data.pmServerDatabaseBackups) {
      console.log('Setting database backups:', data.pmServerDatabaseBackups);
      setDatabaseBackups(data.pmServerDatabaseBackups);
    } else if (Array.isArray(data)) {
      console.log('Setting database backups from array:', data);
      setDatabaseBackups(data);
    }
  }, [data]);

  const getYesNoStatusLabel = (statusId) => {
    const status = yesNoStatusOptions.find(option => option.id === statusId);
    return status ? status.name : 'Unknown';
  };

  const getStatusColor = (statusId) => {
    const label = getYesNoStatusLabel(statusId);
    switch (label.toLowerCase()) {
      case 'yes':
      case 'ok':
      case 'good':
        return 'success';
      case 'no':
      case 'error':
      case 'bad':
        return 'error';
      default:
        return 'default';
    }
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

  const fieldStyle = {
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000',
      color: '#000000'
    },
    '& .MuiInputLabel-root.Mui-disabled': {
      color: '#666666'
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={sectionContainerStyle}>
        <Typography variant="h5" sx={sectionHeaderStyle}>
          <BackupIcon /> Database Backup Check
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

        {/* Database Backup Tables */}
        {databaseBackups.length > 0 && (
          <Box sx={{ marginBottom: 3 }}>
            {databaseBackups.map((backup, backupIndex) => (
              <Box key={backupIndex} sx={{ marginBottom: 3 }}>
                {/* MSSQL Database Backup Table */}
                {backup.mssqlDatabaseBackupDetails && backup.mssqlDatabaseBackupDetails.length > 0 ? (
                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
                      🗄️ MSSQL Database Backup Check
                    </Typography>
                    <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Monthly DB Backup are Created</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {backup.mssqlDatabaseBackupDetails.map((detail, detailIndex) => (
                            <TableRow key={detailIndex}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {detailIndex + 1}
                                </Typography>
                              </TableCell>
                              <TableCell>{detail.serverName || 'N/A'}</TableCell>
                              <TableCell>
                                <Chip
                                  label={getYesNoStatusLabel(detail.yesNoStatusID)}
                                  color={getStatusColor(detail.yesNoStatusID)}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
                      🗄️ MSSQL Database Backup Check
                    </Typography>
                    <Box sx={{ textAlign: 'center', padding: 3, color: '#666', marginBottom: 2 }}>
                      <Typography variant="body2">
                        No MSSQL database backup data available.
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* SCADA Database Backup Table */}
                {backup.scadaDataBackupDetails && backup.scadaDataBackupDetails.length > 0 ? (
                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
                      📊 SCADA Database Backup Check
                    </Typography>
                    <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>SCADA DB Backup are Created</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {backup.scadaDataBackupDetails.map((detail, detailIndex) => (
                            <TableRow key={detailIndex}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {detailIndex + 1}
                                </Typography>
                              </TableCell>
                              <TableCell>{detail.serverName || 'N/A'}</TableCell>
                              <TableCell>
                                <Chip
                                  label={getYesNoStatusLabel(detail.yesNoStatusID)}
                                  color={getStatusColor(detail.yesNoStatusID)}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
                      📊 SCADA Database Backup Check
                    </Typography>
                    <Box sx={{ textAlign: 'center', padding: 3, color: '#666', marginBottom: 2 }}>
                      <Typography variant="body2">
                        No SCADA database backup data available.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Remarks Section */}
        {databaseBackups.length > 0 && databaseBackups[0].remarks && (
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
              value={databaseBackups[0].remarks}
              disabled
              sx={{
                ...fieldStyle,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                }
              }}
            />
          </Box>
        )}

        {/* Latest Backup File Name Section */}
        {databaseBackups.length > 0 && databaseBackups[0].latestBackupFileName && (
          <Box sx={{ marginTop: 3 }}>
            <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
              📁 Latest Backup File Name
            </Typography>
            
            <TextField
              fullWidth
              variant="outlined"
              label="Latest Backup File Name"
              value={databaseBackups[0].latestBackupFileName}
              disabled
              sx={{
                ...fieldStyle,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                }
              }}
            />
          </Box>
        )}

        {/* No Data Message */}
        {databaseBackups.length === 0 && (
          <Box sx={{ textAlign: 'center', padding: 3, color: '#666' }}>
            <Typography variant="body2">
              No database backup data available
            </Typography>
          </Box>
        )}
      </Paper>
    </LocalizationProvider>
  );
};

export default DatabaseBackup_Details;