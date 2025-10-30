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
  Backup as BackupIcon
} from '@mui/icons-material';

// Import the yes/no status service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const DatabaseBackup_Edit_Review = ({ data, disabled = true, formData }) => {
  const [mssqlBackupData, setMssqlBackupData] = useState([]);
  const [scadaBackupData, setScadaBackupData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [latestBackupFileName, setLatestBackupFileName] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Helper function to get status name by ID
  const getStatusName = (statusId) => {
    if (!statusId || !yesNoStatusOptions.length) return '';
    const status = yesNoStatusOptions.find(option => option.id === statusId || option.ID === statusId);
    return status ? (status.name || status.Name) : '';
  };

  // Initialize data from props only once
  useEffect(() => {
    
    // Check for alternative property names that might contain the database backup data
    if (formData) {
      
      Object.keys(formData).forEach(key => {
        if (key.toLowerCase().includes('database') || key.toLowerCase().includes('backup') || 
            key.toLowerCase().includes('mssql') || key.toLowerCase().includes('scada')) {
        }
      });
    }
    
    if (!isInitialized.current) {
      // Prioritize formData over data (preferred for Review)
      if (formData) {
        
        // Check if data is in nested databaseBackupData object
        const dbBackupData = formData.databaseBackupData || formData;
        
        setMssqlBackupData(dbBackupData.mssqlBackupData || []);
        setScadaBackupData(dbBackupData.scadaBackupData || []);
        setRemarks(dbBackupData.remarks || '');
        setLatestBackupFileName(dbBackupData.latestBackupFileName || '');
      }
      // Handle API response format (pmServerDatabaseBackups)
      else if (data && data.pmServerDatabaseBackups && data.pmServerDatabaseBackups.length > 0) {
        const backupData = data.pmServerDatabaseBackups[0];
        
        // Process MSSQL backup data
        if (backupData.mssqlDatabaseBackupDetails && backupData.mssqlDatabaseBackupDetails.length > 0) {
          const mssqlData = backupData.mssqlDatabaseBackupDetails.map((item, index) => {
           
            return {
              id: item.id || null,
              serialNo: item.serialNo || (index + 1),
              item: item.serverName || '',
              monthlyDBBackupCreated: item.yesNoStatusID || '',
              isDeleted: item.isDeleted || false,
              isNew: item.isNew || false,
              isModified: item.isModified || false
            };
          }).sort((a, b) => a.serialNo - b.serialNo);
          
          setMssqlBackupData(mssqlData);
        }
        
        // Process SCADA backup data
        if (backupData.scadaDataBackupDetails && backupData.scadaDataBackupDetails.length > 0) {
          const scadaData = backupData.scadaDataBackupDetails.map((item, index) => ({
            id: item.id || null,
            serialNo: item.serialNo || (index + 1),
            item: item.serverName || item.item || '',
            monthlyDBBackupCreated: item.yesNoStatusID || '',
            isDeleted: item.isDeleted || false,
            isNew: item.isNew || false,
            isModified: item.isModified || false
          })).sort((a, b) => a.serialNo - b.serialNo);
          
          setScadaBackupData(scadaData);
        }
        
        // Set remarks and latest backup file name
        setRemarks(backupData.remarks || '');
        setLatestBackupFileName(backupData.latestBackupFileName || '');
      }
      // Handle legacy/direct data format
      else if (data && (data.mssqlDatabaseBackupDetails || data.scadaDataBackupDetails)) {
        // Process MSSQL backup data
        if (data.mssqlDatabaseBackupDetails && data.mssqlDatabaseBackupDetails.length > 0) {
          const mssqlData = data.mssqlDatabaseBackupDetails.map((item, index) => ({
            id: item.id || null,
            serialNo: item.serialNo || (index + 1),
            item: item.serverName || item.item || '',
            monthlyDBBackupCreated: item.yesNoStatusID || '',
            isDeleted: item.isDeleted || false,
            isNew: item.isNew || false,
            isModified: item.isModified || false
          })).sort((a, b) => a.serialNo - b.serialNo);
          
          setMssqlBackupData(mssqlData);
        }
        
        // Process SCADA backup data
        if (data.scadaDataBackupDetails && data.scadaDataBackupDetails.length > 0) {
          const scadaData = data.scadaDataBackupDetails.map((item, index) => ({
            id: item.id || null,
            serialNo: item.serialNo || (index + 1),
            item: item.serverName || '',
            monthlyDBBackupCreated: item.yesNoStatusID || '',
            isDeleted: item.isDeleted || false,
            isNew: item.isNew || false,
            isModified: item.isModified || false
          })).sort((a, b) => a.serialNo - b.serialNo);
          
          setScadaBackupData(scadaData);
        }
        
        // Set remarks and latest backup file name
        setRemarks(data.remarks || '');
        setLatestBackupFileName(data.latestBackupFileName || '');
      }
      
      isInitialized.current = true;
    }
  }, [data, formData]);

  // Fetch Yes/No Status options for display
  useEffect(() => {
    const fetchYesNoStatusOptions = async () => {
      try {
        setLoading(true);
        const response = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching Yes/No Status options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchYesNoStatusOptions();
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
            {(() => {
              const filteredData = mssqlBackupData.filter(row => !row.isDeleted);
              
              return filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                    No data available for this section.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row, index) => (
                <TableRow key={row.id || index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.item || ''}
                      disabled={disabled}
                      size="small"
                      InputProps={{
                        readOnly: true,
                      }}
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
                      value={getStatusName(row.monthlyDBBackupCreated)}
                      disabled={disabled}
                      size="small"
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000000',
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
              );
            })()}
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
            {(() => {
              const filteredData = scadaBackupData.filter(row => !row.isDeleted);
              
              return filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                    No data available for this section.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row, index) => (
                <TableRow key={row.id || index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.item || ''}
                      disabled={disabled}
                      size="small"
                      InputProps={{
                        readOnly: true,
                      }}
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
                      value={getStatusName(row.monthlyDBBackupCreated)}
                      disabled={disabled}
                      size="small"
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000000',
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
              );
            })()}
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
          InputProps={{
            readOnly: true,
          }}
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
          disabled={disabled}
          InputProps={{
            readOnly: true,
          }}
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

export default DatabaseBackup_Edit_Review;