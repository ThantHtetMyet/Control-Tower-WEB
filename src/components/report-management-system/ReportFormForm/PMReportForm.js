import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography
} from '@mui/material';
import RMSTheme from '../../theme-resource/RMSTheme';

const PMReportForm = ({ formData, onInputChange, onNext, onBack }) => {
  const [fieldErrors, setFieldErrors] = useState({});

  const handleNext = () => {
    // Validate required fields and set specific field errors
    const errors = {};
    
    if (!formData.scheduledDate) {
      errors.scheduledDate = 'Scheduled Date is required';
    }
    if (!formData.startDate) {
      errors.startDate = 'Start Date is required';
    }
    if (!formData.completionDate) {
      errors.completionDate = 'Completion Date is required';
    }
    if (!formData.nextScheduledDate) {
      errors.nextScheduledDate = 'Next Scheduled Date is required';
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
      background: 'white',
      borderRadius: RMSTheme.borderRadius.medium,
      padding: 4,
      boxShadow: RMSTheme.shadows.card
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          marginBottom: 3,
          color: '#2C3E50',
          fontWeight: 600
        }}
      >
        Preventive Maintenance Information
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Scheduled Date"
            type="datetime-local"
            value={formData.scheduledDate || ''}
            onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
            error={!!fieldErrors.scheduledDate}
            helperText={fieldErrors.scheduledDate}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                '& fieldset': {
                  borderColor: fieldErrors.scheduledDate ? '#E74C3C' : '#d0d0d0',
                },
                '&:hover fieldset': {
                  borderColor: fieldErrors.scheduledDate ? '#E74C3C' : '#2C3E50',
                },
                '&.Mui-focused fieldset': {
                  borderColor: fieldErrors.scheduledDate ? '#E74C3C' : '#2C3E50',
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
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Start Date"
            type="datetime-local"
            value={formData.startDate || ''}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            error={!!fieldErrors.startDate}
            helperText={fieldErrors.startDate}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                '& fieldset': {
                  borderColor: fieldErrors.startDate ? '#E74C3C' : '#d0d0d0',
                },
                '&:hover fieldset': {
                  borderColor: fieldErrors.startDate ? '#E74C3C' : '#2C3E50',
                },
                '&.Mui-focused fieldset': {
                  borderColor: fieldErrors.startDate ? '#E74C3C' : '#2C3E50',
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
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Completion Date"
            type="datetime-local"
            value={formData.completionDate || ''}
            onChange={(e) => handleInputChange('completionDate', e.target.value)}
            error={!!fieldErrors.completionDate}
            helperText={fieldErrors.completionDate}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                '& fieldset': {
                  borderColor: fieldErrors.completionDate ? '#E74C3C' : '#d0d0d0',
                },
                '&:hover fieldset': {
                  borderColor: fieldErrors.completionDate ? '#E74C3C' : '#2C3E50',
                },
                '&.Mui-focused fieldset': {
                  borderColor: fieldErrors.completionDate ? '#E74C3C' : '#2C3E50',
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
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Next Scheduled Date"
            type="datetime-local"
            value={formData.nextScheduledDate || ''}
            onChange={(e) => handleInputChange('nextScheduledDate', e.target.value)}
            error={!!fieldErrors.nextScheduledDate}
            helperText={fieldErrors.nextScheduledDate}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                '& fieldset': {
                  borderColor: fieldErrors.nextScheduledDate ? '#E74C3C' : '#d0d0d0',
                },
                '&:hover fieldset': {
                  borderColor: fieldErrors.nextScheduledDate ? '#E74C3C' : '#2C3E50',
                },
                '&.Mui-focused fieldset': {
                  borderColor: fieldErrors.nextScheduledDate ? '#E74C3C' : '#2C3E50',
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
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{
            borderColor: '#2C3E50',
            color: '#2C3E50',
            padding: '12px 32px',
            borderRadius: RMSTheme.borderRadius.small,
            '&:hover': {
              borderColor: '#34495E',
              backgroundColor: '#f8f9fa'
            }
          }}
        >
          Back
        </Button>
        
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
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default PMReportForm;