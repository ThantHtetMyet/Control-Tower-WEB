import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Paper
} from '@mui/material';
import RMSTheme from '../../theme-resource/RMSTheme';
import { getPMReportFormTypes } from '../../api-services/reportFormService';

const PMReportForm = ({ formData, reportFormTypes, onInputChange, onNext, onBack }) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [pmReportFormTypes, setPMReportFormTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch PM Report Form Types on component mount
  useEffect(() => {
    const fetchPMReportFormTypes = async () => {
      try {
        setLoading(true);
        const data = await getPMReportFormTypes();
        setPMReportFormTypes(data || []);
      } catch (error) {
        console.error('Failed to fetch PM report form types:', error);
        setPMReportFormTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPMReportFormTypes();
  }, []);

  // Get selected PM Report Form Type name for display - following CMReportForm pattern
  const getSelectedPMReportFormTypeName = () => {
    if (!pmReportFormTypes || !formData.pmReportFormTypeID) {
      return formData.pmReportFormTypeName || 'Not selected';
    }
    const selectedType = pmReportFormTypes.find(type => type.id === formData.pmReportFormTypeID);
    return selectedType?.name || formData.pmReportFormTypeName || 'Not selected';
  };

  const handleNext = () => {
    const errors = {};
    
    // Add validation as needed
    if (!formData.scheduledDate) {
      errors.scheduledDate = 'Scheduled Date is required';
    }
    
    setFieldErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      onNext();
    }
  };

  const handleInputChange = (field, value) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    onInputChange(field, value);
  };

  // Common field styling - matching CMReportForm
  const fieldStyle = {
    marginBottom: 2,
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'white',
      '& fieldset': {
        borderColor: '#d0d0d0',
      },
      '&:hover fieldset': {
        borderColor: '#2C3E50',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2C3E50',
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
  };

  // Section container styling - matching CMReportForm
  const sectionContainerStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  };

  const sectionHeaderStyle = {
    marginBottom: 3,
    color: '#2C3E50',
    fontWeight: 700,
    fontSize: '18px',
    borderBottom: '2px solid #3498DB',
    paddingBottom: '8px',
    display: 'flex',
    alignItems: 'center'
  };

  return (
    <Box sx={{
      background: 'white',
      borderRadius: RMSTheme.borderRadius.medium,
      padding: 4,
      boxShadow: RMSTheme.shadows.card
    }}>
      {/* Main Header - NEW */}
      <Typography 
        variant="h4" 
        sx={{ 
          marginBottom: 4,
          color: '#2C3E50',
          fontWeight: 700,
          textAlign: 'center',
          background: 'linear-gradient(45deg, #2C3E50, #3498DB)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Preventive Maintenance Information
      </Typography>
      
      {/* Basic Information Summary Section */}
      <Paper sx={{
        ...sectionContainerStyle,
        background: '#f8f9fa',
        border: '2px solid #e9ecef'
      }}>
        <Typography variant="h5" sx={sectionHeaderStyle}>
          📋 Basic Information Summary
        </Typography>
        
        <Grid container spacing={3} sx={{ marginTop: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Job No"
              value={formData.jobNo || ''}
              disabled
              sx={{
                ...fieldStyle,
                '& .MuiOutlinedInput-root': {
                  ...fieldStyle['& .MuiOutlinedInput-root'],
                  backgroundColor: '#f5f5f5',
                  '& fieldset': {
                    borderColor: '#d0d0d0'
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="System Description"
              value={formData.systemDescription || ''}
              disabled
              sx={{
                ...fieldStyle,
                '& .MuiOutlinedInput-root': {
                  ...fieldStyle['& .MuiOutlinedInput-root'],
                  backgroundColor: '#f5f5f5',
                  '& fieldset': {
                    borderColor: '#d0d0d0'
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Station Name"
              value={formData.stationName || ''}
              disabled
              sx={{
                ...fieldStyle,
                '& .MuiOutlinedInput-root': {
                  ...fieldStyle['& .MuiOutlinedInput-root'],
                  backgroundColor: '#f5f5f5',
                  '& fieldset': {
                    borderColor: '#d0d0d0'
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Customer"
              value={formData.customer || ''}
              disabled
              sx={{
                ...fieldStyle,
                '& .MuiOutlinedInput-root': {
                  ...fieldStyle['& .MuiOutlinedInput-root'],
                  backgroundColor: '#f5f5f5',
                  '& fieldset': {
                    borderColor: '#d0d0d0'
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Project No"
              value={formData.projectNo || ''}
              disabled
              sx={{
                ...fieldStyle,
                '& .MuiOutlinedInput-root': {
                  ...fieldStyle['& .MuiOutlinedInput-root'],
                  backgroundColor: '#f5f5f5',
                  '& fieldset': {
                    borderColor: '#d0d0d0'
                  }
                }
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* PM Type Information Section - existing */}
      <Paper sx={sectionContainerStyle}>
        <Typography variant="h5" sx={sectionHeaderStyle}>
          🔧 PM Type Information
        </Typography>
        
        {/* Display selected PM Report Form Type - following CMReportForm pattern */}
        <Box sx={{ 
          marginTop: 2, 
          padding: 2, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 1,
          border: '1px solid #e9ecef'
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1 }}>
            Selected PM Type:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#2C3E50' }}>
            {loading ? 'Loading...' : getSelectedPMReportFormTypeName()}
          </Typography>
        </Box>
      </Paper>
      
      {/* Preventive Maintenance Information Section */}
      <Paper sx={sectionContainerStyle}>
        <Typography variant="h5" sx={sectionHeaderStyle}>
          📅 Preventive Maintenance Information
        </Typography>
        
        <Grid container spacing={3} sx={{ marginTop: 1 }}>
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
                ...fieldStyle,
                '& .MuiOutlinedInput-root': {
                  ...fieldStyle['& .MuiOutlinedInput-root'],
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
                ...fieldStyle,
                '& .MuiOutlinedInput-root': {
                  ...fieldStyle['& .MuiOutlinedInput-root'],
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
                ...fieldStyle,
                '& .MuiOutlinedInput-root': {
                  ...fieldStyle['& .MuiOutlinedInput-root'],
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
                ...fieldStyle,
                '& .MuiOutlinedInput-root': {
                  ...fieldStyle['& .MuiOutlinedInput-root'],
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
              }}
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Navigation Buttons Section - UPDATED */}
      <Paper sx={{
        ...sectionContainerStyle,
        background: '#ffffff',
        marginBottom: 0
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={onBack}
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
            ← Back
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
            Next: Review →
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PMReportForm;