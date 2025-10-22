import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Grid
} from '@mui/material';
import { Build as BuildIcon } from '@mui/icons-material';
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const HotFixes_Details = ({ data, disabled = false }) => {
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);

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
    if (data) {
      setResult(data.result || data.YesNoStatusID || '');
      setRemarks(data.remarks || data.Remarks || '');
    }
  }, [data]);

  const getYesNoStatusLabel = (statusId) => {
    const status = yesNoStatusOptions.find(option => option.id === statusId);
    return status ? status.name : 'Unknown';
  };

  const getStatusColor = (statusId) => {
    const status = yesNoStatusOptions.find(option => option.id === statusId);
    if (!status) return 'default';
    
    switch (status.name.toLowerCase()) {
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
        <BuildIcon sx={{ 
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
          Hot Fixes Check
        </Typography>
      </Box>
      {/* Instructions */}
      <Typography variant="body1" sx={{ marginBottom: 2, fontStyle: 'italic' }}>
        Check for available hotfixes and service packs that need to be applied to the system.
      </Typography>

      {/* Reference Image */}
      {data?.referenceImagePath && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
          <img
            src={data.referenceImagePath}
            alt="Hotfixes Reference"
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
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Result: Hotfixes and service packs are up to date.
            </Typography>
            {result && (
              <Chip
                label={getYesNoStatusLabel(result)}
                color={getStatusColor(result)}
                size="small"
              />
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Remarks */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={disabled}
            sx={fieldStyle}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HotFixes_Details;