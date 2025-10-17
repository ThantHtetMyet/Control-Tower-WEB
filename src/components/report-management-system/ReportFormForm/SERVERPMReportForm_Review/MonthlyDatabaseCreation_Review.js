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
  Storage as StorageIcon,
} from '@mui/icons-material';

const MonthlyDatabaseCreation_Review = ({ data = {} }) => {
  const [monthlyDatabaseData, setMonthlyDatabaseData] = useState([]);
  const [remarks, setRemarks] = useState('');

  // Initialize data from props
  useEffect(() => {
    if (data.monthlyDatabaseData && data.monthlyDatabaseData.length > 0) {
      setMonthlyDatabaseData(data.monthlyDatabaseData);
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
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Monthly DB are Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {monthlyDatabaseData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', padding: 4, color: '#666' }}>
                  No data available for this section.
                </TableCell>
              </TableRow>
            ) : (
              monthlyDatabaseData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.item || ''}
                      size="small"
                      disabled
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f5f5f5',
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.monthlyDBCreated || ''}
                      size="small"
                      disabled
                      sx={{
                        minWidth: 120,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f5f5f5',
                        }
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
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default MonthlyDatabaseCreation_Review;