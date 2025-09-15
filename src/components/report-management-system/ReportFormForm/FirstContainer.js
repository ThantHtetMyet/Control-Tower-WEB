import React, { useState } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography
} from '@mui/material';
import RMSTheme from '../../theme-resource/RMSTheme';

const FirstContainer = ({ formData, reportFormTypes, onInputChange, onNext }) => {
  const [fieldErrors, setFieldErrors] = useState({});

  const handleNext = () => {
    // Validate required fields and set specific field errors
    const errors = {};
    
    if (!formData.stationName) {
      errors.stationName = 'Station Name is required';
    }
    if (!formData.systemDescription) {
      errors.systemDescription = 'System Description is required';
    }
    if (!formData.projectNo) {
      errors.projectNo = 'Project No is required';
    }
    if (!formData.customer) {
      errors.customer = 'Customer is required';
    }
    if (!formData.reportFormTypeID) {
      errors.reportFormTypeID = 'Type of Services is required';
    }

    setFieldErrors(errors);
    
    // If no errors, proceed to next step
    if (Object.keys(errors).length === 0) {
      onNext();
    }
  };

  const handleInputChange = (field, value) => {
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    onInputChange(field, value);
  };

  return (
    <Box sx={{
      backgroundColor: 'white',
      padding: 3,
      borderRadius: 2,
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          color: '#2C3E50',
          fontWeight: 'bold',
          marginBottom: 3
        }}
      >
        Basic Information
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Station Name"
          value={formData.stationName}
          onChange={(e) => handleInputChange('stationName', e.target.value)}
          required
          variant="outlined"
          error={!!fieldErrors.stationName}
          helperText={fieldErrors.stationName}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              '& fieldset': {
                borderColor: fieldErrors.stationName ? '#E74C3C' : '#d0d0d0',
              },
              '&:hover fieldset': {
                borderColor: fieldErrors.stationName ? '#E74C3C' : '#2C3E50',
              },
              '&.Mui-focused fieldset': {
                borderColor: fieldErrors.stationName ? '#E74C3C' : '#2C3E50',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#666666',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#2C3E50',
            },
            '& .MuiOutlinedInput-input': {
              color: '#2C3E50',
            },
            '& .MuiFormHelperText-root': {
              color: '#E74C3C',
            },
          }}
        />
        
        <TextField
          fullWidth
          label="System Description"
          value={formData.systemDescription}
          onChange={(e) => handleInputChange('systemDescription', e.target.value)}
          required
          variant="outlined"
          error={!!fieldErrors.systemDescription}
          helperText={fieldErrors.systemDescription}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              '& fieldset': {
                borderColor: fieldErrors.systemDescription ? '#E74C3C' : '#d0d0d0',
              },
              '&:hover fieldset': {
                borderColor: fieldErrors.systemDescription ? '#E74C3C' : '#2C3E50',
              },
              '&.Mui-focused fieldset': {
                borderColor: fieldErrors.systemDescription ? '#E74C3C' : '#2C3E50',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#666666',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#2C3E50',
            },
            '& .MuiOutlinedInput-input': {
              color: '#2C3E50',
            },
            '& .MuiFormHelperText-root': {
              color: '#E74C3C',
            },
          }}
        />
        
        <TextField
          fullWidth
          label="Project No"
          value={formData.projectNo}
          onChange={(e) => handleInputChange('projectNo', e.target.value)}
          required
          variant="outlined"
          error={!!fieldErrors.projectNo}
          helperText={fieldErrors.projectNo}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              '& fieldset': {
                borderColor: fieldErrors.projectNo ? '#E74C3C' : '#d0d0d0',
              },
              '&:hover fieldset': {
                borderColor: fieldErrors.projectNo ? '#E74C3C' : '#2C3E50',
              },
              '&.Mui-focused fieldset': {
                borderColor: fieldErrors.projectNo ? '#E74C3C' : '#2C3E50',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#666666',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#2C3E50',
            },
            '& .MuiOutlinedInput-input': {
              color: '#2C3E50',
            },
            '& .MuiFormHelperText-root': {
              color: '#E74C3C',
            },
          }}
        />
        
        <TextField
          fullWidth
          label="Customer"
          value={formData.customer}
          onChange={(e) => handleInputChange('customer', e.target.value)}
          required
          variant="outlined"
          error={!!fieldErrors.customer}
          helperText={fieldErrors.customer}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              '& fieldset': {
                borderColor: fieldErrors.customer ? '#E74C3C' : '#d0d0d0',
              },
              '&:hover fieldset': {
                borderColor: fieldErrors.customer ? '#E74C3C' : '#2C3E50',
              },
              '&.Mui-focused fieldset': {
                borderColor: fieldErrors.customer ? '#E74C3C' : '#2C3E50',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#666666',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#2C3E50',
            },
            '& .MuiOutlinedInput-input': {
              color: '#2C3E50',
            },
            '& .MuiFormHelperText-root': {
              color: '#E74C3C',
            },
          }}
        />
        
        <TextField
          fullWidth
          select
          label="Type of Services"
          value={formData.reportFormTypeID || ''}
          onChange={(e) => handleInputChange('reportFormTypeID', e.target.value)}
          required
          variant="outlined"
          error={!!fieldErrors.reportFormTypeID}
          helperText={fieldErrors.reportFormTypeID}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              '& fieldset': {
                borderColor: fieldErrors.reportFormTypeID ? '#E74C3C' : '#d0d0d0',
              },
              '&:hover fieldset': {
                borderColor: fieldErrors.reportFormTypeID ? '#E74C3C' : '#2C3E50',
              },
              '&.Mui-focused fieldset': {
                borderColor: fieldErrors.reportFormTypeID ? '#E74C3C' : '#2C3E50',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#666666',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#2C3E50',
            },
            '& .MuiSelect-select': {
              color: '#2C3E50',
            },
            '& .MuiFormHelperText-root': {
              color: '#E74C3C',
            },
          }}
        >
          {(reportFormTypes || []).map((type) => (
            <MenuItem 
              key={type.id} 
              value={type.id}
              sx={{
                color: '#2C3E50',
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              {type.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <Button
          variant="contained"
          onClick={handleNext}
          sx={{
            background: RMSTheme.components.button.primary.background,
            color: RMSTheme.components.button.primary.text,
            padding: '12px 32px',
            borderRadius: RMSTheme.borderRadius.small,
            border: `1px solid ${RMSTheme.components.button.primary.border}`,
            boxShadow: RMSTheme.components.button.primary.shadow,
            '&:hover': {
              background: RMSTheme.components.button.primary.hover
            }
          }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default FirstContainer;