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
  Storage as StorageIcon
} from '@mui/icons-material';

// Import the yes/no status service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const MonthlyDatabaseCreation_Edit_Review = ({ data, disabled = true, formData }) => {
  const [monthlyDatabaseData, setMonthlyDatabaseData] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const isInitialized = useRef(false);

  // Helper function to get status name by ID
  const getStatusName = (statusId) => {
    if (!statusId || !yesNoStatusOptions.length) return '';
    const status = yesNoStatusOptions.find(option => option.id === statusId);
    return status ? status.name : '';
  };

  // Initialize data from props only once
  useEffect(() => {
    if (!isInitialized.current) {
      // Priority: formData > data with pmServerMonthlyDatabaseCreations > data.monthlyDatabaseData
      if (formData && formData.monthlyDatabaseData) {
        setMonthlyDatabaseData(formData.monthlyDatabaseData || []);
        setRemarks(formData.remarks || '');
      } else if (data && data.pmServerMonthlyDatabaseCreations && Array.isArray(data.pmServerMonthlyDatabaseCreations)) {
        // Extract data from API format
        const mappedData = data.pmServerMonthlyDatabaseCreations.flatMap(item => 
          (item.details || []).map(detail => ({
            id: detail.id || null,
            serialNo: detail.serialNo || '',
            item: detail.serverName || '',
            monthlyDBCreated: detail.yesNoStatusID || '',
            isDeleted: detail.isDeleted || false,
            isNew: detail.isNew || false,
            isModified: detail.isModified || false,
          }))
        );
        // Sort by serialNo in ascending order
        mappedData.sort((a, b) => {
          const serialA = parseInt(a.serialNo) || 0;
          const serialB = parseInt(b.serialNo) || 0;
          return serialA - serialB;
        });
        setMonthlyDatabaseData(mappedData);
        setRemarks(data.pmServerMonthlyDatabaseCreations[0]?.remarks || '');
      } else if (data && data.monthlyDatabaseData) {
        // Handle legacy monthlyDatabaseData structure
        const monthlyData = data.monthlyDatabaseData || [];
        // Transform to component format
        const processedData = monthlyData.map((item, index) => ({
          id: item.id || null,
          serialNo: item.serialNo || (index + 1).toString(),
          item: item.item || '',
          monthlyDBCreated: item.monthlyDBCreated || '',
          isDeleted: item.isDeleted || false,
          isNew: item.isNew || false,
          isModified: item.isModified || false,
        }));
        // Sort by serialNo in ascending order
        processedData.sort((a, b) => {
          const serialA = parseInt(a.serialNo) || 0;
          const serialB = parseInt(b.serialNo) || 0;
          return serialA - serialB;
        });
        setMonthlyDatabaseData(processedData);
        setRemarks(data.remarks || '');
      }
      
      isInitialized.current = true;
    }
  }, [data, formData]);

  // Fetch YesNoStatus options for display
  useEffect(() => {
    const fetchYesNoStatusOptions = async () => {
      try {
        setLoading(true);
        const response = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching YesNoStatus options:', error);
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
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              monthlyDatabaseData
                .filter(row => !row.isDeleted)
                .map((row, index) => (
                <TableRow key={row.id || index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {row.serialNo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={row.item || ''}
                      size="small"
                      disabled={disabled}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={getStatusName(row.monthlyDBCreated)}
                      size="small"
                      disabled={disabled}
                      InputProps={{
                        readOnly: true,
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
          disabled={disabled}
          InputProps={{
            readOnly: true,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default MonthlyDatabaseCreation_Edit_Review;