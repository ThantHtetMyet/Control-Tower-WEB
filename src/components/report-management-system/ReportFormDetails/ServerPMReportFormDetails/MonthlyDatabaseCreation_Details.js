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
  Chip,
  TextField
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import StorageIcon from '@mui/icons-material/Storage';
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const MonthlyDatabaseCreation_Details = ({ data, disabled = false }) => {
  const [monthlyDatabaseCreations, setMonthlyDatabaseCreations] = useState([]);
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
    if (data && data.pmServerMonthlyDatabaseCreations) {
      setMonthlyDatabaseCreations(data.pmServerMonthlyDatabaseCreations);
    } else if (Array.isArray(data)) {
      setMonthlyDatabaseCreations(data);
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
          <StorageIcon /> Historical Database
        </Typography>
        
        {/* Monthly Database Creation Instructions */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
            Monthly Database Creation
          </Typography>
          
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            Willowlynx's historical DB uses monthly database. Check the MSSQL database and make sure the monthly databases are created for the next 6 months.
          </Typography>
        </Box>

        {/* Monthly Database Creation Table */}
        {monthlyDatabaseCreations.length > 0 && (
          <Box sx={{ marginBottom: 3 }}>
            {monthlyDatabaseCreations.map((record, recordIndex) => (
              <Box key={recordIndex} sx={{ marginBottom: 3 }}>
                {/* Details Table */}
                {record.details && record.details.length > 0 ? (
                  <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Server Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Monthly DB are Created</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {record.details.map((detail, detailIndex) => (
                          <TableRow key={detailIndex}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {detail.serialNo || (detailIndex + 1)}
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
                ) : (
                  <Box sx={{ textAlign: 'center', padding: 3, color: '#666', marginBottom: 2 }}>
                    <Typography variant="body2">
                      No detail records available for this monthly database creation check
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Remarks Section */}
        {monthlyDatabaseCreations.length > 0 && monthlyDatabaseCreations[0].remarks && (
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
              value={monthlyDatabaseCreations[0].remarks}
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
        {monthlyDatabaseCreations.length === 0 && (
          <Box sx={{ textAlign: 'center', padding: 3, color: '#666' }}>
            <Typography variant="body2">
              No monthly database creation data available
            </Typography>
          </Box>
        )}
      </Paper>
    </LocalizationProvider>
  );
};

export default MonthlyDatabaseCreation_Details;