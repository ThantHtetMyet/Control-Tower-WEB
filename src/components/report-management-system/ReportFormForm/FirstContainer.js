import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  Autocomplete
} from '@mui/material';
import RMSTheme from '../../theme-resource/RMSTheme';
import warehouseService from '../../api-services/warehouseService';
import { getPMReportFormTypes } from '../../api-services/reportFormService';

const FirstContainer = ({ formData, reportFormTypes, onInputChange, onNext }) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [systemNames, setSystemNames] = useState([]);
  const [stationNames, setStationNames] = useState([]);
  const [pmReportFormTypes, setPMReportFormTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPMTypeDropdown, setShowPMTypeDropdown] = useState(false);

  // Fetch system names on component mount
  useEffect(() => {
    const fetchSystemNames = async () => {
      try {
        setLoading(true);
        const response = await warehouseService.getSystemNameWarehouses();
        setSystemNames(response.data || []);
      } catch (error) {
        console.error('Error fetching system names:', error);
        setSystemNames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemNames();
  }, []);

  // Fetch station names when system description changes
  useEffect(() => {
    const fetchStationNames = async () => {
      if (formData.systemNameWarehouseID) {
        try {
          setLoading(true);
          const response = await warehouseService.getStationNameWarehouses(formData.systemNameWarehouseID);
          setStationNames(Array.isArray(response) ? response : []);
        } catch (error) {
          console.error('Error fetching station names:', error);
          setStationNames([]);
        } finally {
          setLoading(false);
        }
      } else {
        setStationNames([]);
        // Clear station name when system changes
        if (formData.stationNameWarehouseID) {
          onInputChange('stationNameWarehouseID', '');
          onInputChange('stationName', '');
        }
      }
    };

    fetchStationNames();
  }, [formData.systemNameWarehouseID]);

  // Fetch PM Report Form Types when component mounts
  useEffect(() => {
    const fetchPMReportFormTypes = async () => {
      try {
        const response = await getPMReportFormTypes();
        setPMReportFormTypes(response || []);
      } catch (error) {
        console.error('Error fetching PM report form types:', error);
        setPMReportFormTypes([]);
      }
    };

    fetchPMReportFormTypes();
  }, []);

  // Check if Preventative Maintenance is selected
  useEffect(() => {
    if (formData.reportFormTypeID && reportFormTypes) {
      const selectedType = reportFormTypes.find(type => type.id === formData.reportFormTypeID);
      const isPreventativeMaintenance = selectedType?.name?.toLowerCase().includes('preventative') || 
                                       selectedType?.name?.toLowerCase().includes('preventive');
      setShowPMTypeDropdown(isPreventativeMaintenance);
      
      // Clear PM report form type if not preventative maintenance
      if (!isPreventativeMaintenance && formData.pmReportFormTypeID) {
        onInputChange('pmReportFormTypeID', '');
      }
    } else {
      setShowPMTypeDropdown(false);
    }
  }, [formData.reportFormTypeID, reportFormTypes]);

  
        // Add this new handler after handleStationChange
        const handlePMReportFormTypeChange = (pmTypeId) => {
        const selectedPMType = pmReportFormTypes.find(pmType => pmType.id === pmTypeId);
        handleInputChange('pmReportFormTypeID', pmTypeId);  // Stores the ID
        handleInputChange('pmReportFormTypeName', selectedPMType ? selectedPMType.name : '');  // Stores the name for routing
        };

        
  const handleNext = () => {
    // Validate required fields and set specific field errors
    const errors = {};
    
    if (!formData.systemDescription) {
      errors.systemDescription = 'System Description is required';
    }
    if (!formData.stationName) {
      errors.stationName = 'Station Name is required';
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
    // Validate PM Report Form Type if Preventative Maintenance is selected
    if (showPMTypeDropdown && !formData.pmReportFormTypeID) {
      errors.pmReportFormTypeID = 'PM Report Form Type is required';
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

  const handleSystemChange = (systemId) => {
    const selectedSystem = systemNames.find(system => system.id === systemId);
    handleInputChange('systemNameWarehouseID', systemId);  // Stores the ID
    handleInputChange('systemDescription', selectedSystem ? selectedSystem.name : '');  // Stores the name for display
  };

  const handleStationChange = (stationId) => {
    const selectedStation = stationNames.find(station => station.id === stationId);
    handleInputChange('stationNameWarehouseID', stationId);  // Stores the ID
    handleInputChange('stationName', selectedStation ? selectedStation.name : '');  // Stores the name for display
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
        
        
        {/* System Description - moved to top */}
        <TextField
          fullWidth
          select
          label="System Description"
          value={formData.systemNameWarehouseID || ''}
          onChange={(e) => handleSystemChange(e.target.value)}
          required
          variant="outlined"
          error={!!fieldErrors.systemDescription}
          helperText={fieldErrors.systemDescription}
          disabled={loading}
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
            '& .MuiSelect-select': {
              color: '#2C3E50',
            },
            '& .MuiFormHelperText-root': {
              color: '#E74C3C',
            },
          }}
        >
          {systemNames.map((system) => (
            <MenuItem 
              key={system.id} 
              value={system.id}
              sx={{
                color: '#2C3E50',
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              {system.name}
            </MenuItem>
          ))}
        </TextField>
        
        {/* Station Name - compact searchable dropdown */}
        <Autocomplete
          fullWidth
          options={stationNames}
          getOptionLabel={(option) => option.name || ''}
          value={stationNames.find(station => station.id === formData.stationNameWarehouseID) || null}
          onChange={(event, newValue) => {
            // This ensures the ID is sent to the API
            handleStationChange(newValue ? newValue.id : '');
          }}
          disabled={loading || !formData.systemNameWarehouseID}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Station Name"
              required
              variant="outlined"
              error={!!fieldErrors.stationName}
              helperText={fieldErrors.stationName}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  minHeight: '40px', // Compact height
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
                '& .MuiAutocomplete-input': {
                  color: '#2C3E50',
                  fontSize: '14px', // Compact font size
                },
                '& .MuiFormHelperText-root': {
                  color: '#E74C3C',
                },
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box
              component="li"
              {...props}
              sx={{
                color: '#2C3E50',
                backgroundColor: 'white',
                fontSize: '14px', // Compact font size
                padding: '8px 12px', // Compact padding
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                },
                '&[aria-selected="true"]': {
                  backgroundColor: '#e3f2fd'
                }
              }}
            >
              {option.name}
            </Box>
          )}
          ListboxProps={{
            sx: {
              maxHeight: '200px', // Limit dropdown height
              '& .MuiAutocomplete-option': {
                minHeight: '36px', // Compact option height
              }
            }
          }}
          size="small" // Makes the component more compact
          noOptionsText="No stations available"
          loadingText="Loading stations..."
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

        {/* Conditional PM Report Form Type Dropdown */}
        {showPMTypeDropdown && (
          <TextField
            fullWidth
            select
            label="PM Report Form Type"
            value={formData.pmReportFormTypeID || ''}
            onChange={(e) => handlePMReportFormTypeChange(e.target.value)}  // Updated to use new handler
            required
            variant="outlined"
            error={!!fieldErrors.pmReportFormTypeID}
            helperText={fieldErrors.pmReportFormTypeID}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                '& fieldset': {
                  borderColor: fieldErrors.pmReportFormTypeID ? '#E74C3C' : '#d0d0d0',
                },
                '&:hover fieldset': {
                  borderColor: fieldErrors.pmReportFormTypeID ? '#E74C3C' : '#2C3E50',
                },
                '&.Mui-focused fieldset': {
                  borderColor: fieldErrors.pmReportFormTypeID ? '#E74C3C' : '#2C3E50',
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
            {pmReportFormTypes.map((pmType) => (
              <MenuItem 
                key={pmType.id} 
                value={pmType.id}
                sx={{
                  color: '#2C3E50',
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                {pmType.name}
              </MenuItem>
            ))}
          </TextField>
        )}
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