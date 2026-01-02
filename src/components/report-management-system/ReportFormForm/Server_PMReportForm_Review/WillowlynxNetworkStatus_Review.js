import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
} from '@mui/material';
import {
  NetworkCheck as NetworkCheckIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const WillowlynxNetworkStatus_Review = ({ data = {} }) => {
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  // Initialize data from props
  useEffect(() => {
    if (data.result) {
      setResult(data.result);
    }
    if (data.remarks) {
      setRemarks(data.remarks);
    }
    
    // Handle image preview from uploaded File object
    if (data.image) {
      if (data.image instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(data.image);
      } else if (data.image.imageUrl) {
        setImagePreview(data.image.imageUrl);
      }
    } else {
      setImagePreview(null);
    }
  }, [data]);

  // Fetch Yes/No status options
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

  // Helper function to get status name from ID
  const getStatusName = (statusId) => {
    if (!statusId || !yesNoStatusOptions.length) return statusId;
    const status = yesNoStatusOptions.find(option => option.id === statusId);
    return status ? status.name : statusId;
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

  const inlineField = {
    minWidth: 200,
    '& .MuiOutlinedInput-root': { backgroundColor: '#f5f5f5' },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000',
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={sectionContainerStyle}>
        {/* Header */}
        <Typography variant="h5" sx={sectionHeaderStyle}>
          <NetworkCheckIcon /> Willowlynx Network Status Check
        </Typography>

        {/* Instructions */}
        <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
          Check the system overview page, see if all servers, switches, RTUs are green.
        </Typography>

        {/* Screenshot */}
        {imagePreview && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <img
              src={imagePreview}
              alt="Uploaded Screenshot"
              style={{
                maxWidth: '100%',
                height: 'auto',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </Box>
        )}

        {/* Result */}
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Result:
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, ml: 2, mb: 2 }}>
          <Typography>All servers, switches, and RTU are green.</Typography>
          <TextField
            size="small"
            value={getStatusName(result) || ''}
            variant="outlined"
            disabled
            sx={inlineField}
          />
        </Box>

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
      </Paper>
    </LocalizationProvider>
  );
};

export default WillowlynxNetworkStatus_Review;