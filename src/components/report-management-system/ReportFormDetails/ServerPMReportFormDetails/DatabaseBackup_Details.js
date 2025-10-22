import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Storage as StorageIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const DatabaseBackup_Details = ({ data, disabled = false }) => {
  const [databaseBackupData, setDatabaseBackupData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);

  // Helper function for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    const fetchYesNoStatusOptions = async () => {
      try {
        const options = await yesNoStatusService.getYesNoStatusOptions();
        setYesNoStatusOptions(options);
      } catch (error) {
        console.error('Error fetching yes/no status options:', error);
      }
    };

    fetchYesNoStatusOptions();
  }, []);

  useEffect(() => {
    // Handle case where data is the array directly
    if (Array.isArray(data) && data.length > 0) {
      setDatabaseBackupData(data);
    } else if (data && data.databaseBackupData && data.databaseBackupData.length > 0) {
      setDatabaseBackupData(data.databaseBackupData);
    }
    
    if (data && data.remarks) {
      setRemarks(data.remarks || data.Remarks || '');
    }
  }, [data]);

  const getStatusChip = (status) => {
    if (!status) return null;
    
    const statusLower = status.toString().toLowerCase();
    let color = 'default';
    
    if (statusLower.includes('pass') || statusLower.includes('ok') || statusLower.includes('good')) {
      color = 'success';
    } else if (statusLower.includes('fail') || statusLower.includes('error') || statusLower.includes('bad')) {
      color = 'error';
    } else if (statusLower.includes('warning') || statusLower.includes('caution')) {
      color = 'warning';
    }
    
    return (
      <Chip 
        label={status} 
        color={color} 
        size="small"
        variant="outlined"
      />
    );
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
    <Box sx={{ 
      padding: 3, 
      backgroundColor: '#ffffff', 
      borderRadius: 2, 
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: 3
    }}>
      
      {/* Section Title */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: 3,
        paddingBottom: 2,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <StorageIcon sx={{ 
          color: '#1976d2', 
          marginRight: 1,
          fontSize: '1.5rem'
        }} />
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#1976d2', 
            fontWeight: 'bold'
          }}
        >
          Database Backup Check
        </Typography>
      </Box>
      {/* Database Backup Data */}
      {databaseBackupData.length > 0 && (
        <Box sx={{ marginBottom: 3 }}>
          {databaseBackupData.map((record, recordIndex) => (
            <Accordion key={recordIndex} sx={{ marginBottom: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StorageIcon />
                  <Typography variant="h6">
                    Database Backup Check - {formatDate(record.CreatedDate)}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {/* Record Remarks */}
                {record.Remarks && (
                  <Box sx={{ marginBottom: 2, padding: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      <strong>Remarks:</strong> {record.Remarks}
                    </Typography>
                  </Box>
                )}
                
                {/* Details Table */}
                {record.Details && record.Details.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Server Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Result Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {record.Details.map((detail, detailIndex) => (
                          <TableRow key={detailIndex}>
                            <TableCell>{detail.ServerName || 'N/A'}</TableCell>
                            <TableCell>
                              {detail.ResultStatusID ? getStatusChip(detail.ResultStatusID) : 'N/A'}
                            </TableCell>
                            <TableCell>{detail.Remarks || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No detail records available for this database backup check
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Remarks */}
      {remarks && (
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Remarks"
          value={remarks}
          disabled={disabled}
          sx={fieldStyle}
        />
      )}

      {/* No Data Message */}
      {databaseBackupData.length === 0 && !remarks && (
        <Box sx={{ textAlign: 'center', padding: 3, color: '#666' }}>
          <Typography variant="body2">
            No database backup data available
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DatabaseBackup_Details;