import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Card,
  CardContent,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  PhotoCamera,
  Build,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import RMSTheme from '../../theme-resource/RMSTheme';
import warehouseService from '../../api-services/warehouseService';

// Multiple Images Upload Field Component
const MultipleImageUploadField = ({ field, label, images, previews, onUpload, onRemove, icon: IconComponent = ImageIcon }) => {
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <IconComponent sx={{ mr: 1, color: '#3498DB' }} />
          {label}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload multiple images to document the maintenance process. Supported formats: JPG, PNG, GIF (Max 10MB each)
        </Typography>
        
        {/* Upload Button */}
        <Box sx={{ mb: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id={`${field}-upload`}
            type="file"
            multiple
            onChange={onUpload}
          />
          <label htmlFor={`${field}-upload`}>
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{
                borderColor: '#3498DB',
                color: '#3498DB',
                '&:hover': {
                  borderColor: '#2C3E50',
                  backgroundColor: '#f8f9fa'
                }
              }}
            >
              {images.length > 0 ? `Add More Images (${images.length} selected)` : 'Upload Images'}
            </Button>
          </label>
          <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
            Recommended: 800x600px or higher
          </Typography>
        </Box>
  
        {/* Images Preview Grid */}
        {previews.length > 0 ? (
          <Grid container spacing={2}>
            {previews.map((preview, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                  <img
                    src={preview}
                    alt={`${label} ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0'
                    }}
                  />
                  <IconButton
                    onClick={() => onRemove(index)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(244, 67, 54, 0.8)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 1)'
                      },
                      width: 32,
                      height: 32
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}
                  >
                    {images[index]?.name || `Image ${index + 1}`}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4, 
            border: '2px dashed #e0e0e0', 
            borderRadius: '8px',
            backgroundColor: '#fafafa'
          }}>
            <ImageIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No images uploaded yet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click "Upload Images" to add photos
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const CMReportForm = ({ formData, reportFormTypes, onInputChange, onNext, onBack, onImageDataUpdate }) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [warehouseData, setWarehouseData] = useState({
    furtherActions: [],
    formStatuses: []
  });
  const [loading, setLoading] = useState(true);

  // Multiple images state for each section
  const [beforeIssueImages, setBeforeIssueImages] = useState([]);
  const [beforeIssuePreviews, setBeforeIssuePreviews] = useState([]);
  const [afterActionImages, setAfterActionImages] = useState([]);
  const [afterActionPreviews, setAfterActionPreviews] = useState([]);

  // Helper function to format date without timezone conversion
  const formatDateForInput = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper function to get service type name
  const getServiceTypeName = () => {
    if (!reportFormTypes || !formData.reportFormTypeID) return '';
    const selectedType = reportFormTypes.find(type => type.id === formData.reportFormTypeID);
    return selectedType?.name || formData.reportFormTypeID;
  };

  // Fetch warehouse data on component mount
  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        setLoading(true);
        const data = await warehouseService.getAllWarehouseData();
        setWarehouseData(data);
      } catch (error) {
        console.error('Failed to fetch warehouse data:', error);
        setWarehouseData({
          furtherActions: [],
          formStatuses: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouseData();
  }, []);

  // Multiple image upload handlers
  const handleBeforeIssueUpload = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    
    const validFiles = [];
    const newPreviews = [];
    
    files.forEach(file => {
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });
    
    if (validFiles.length > 0) {
      setBeforeIssueImages(prev => [...prev, ...validFiles]);
      setBeforeIssuePreviews(prev => [...prev, ...newPreviews]);
      
      // Update form data
      const allImages = [...beforeIssueImages, ...validFiles];
      onInputChange('beforeIssueImages', allImages);
    }
    
    // Clear input
    event.target.value = '';
  };

  const handleRemoveBeforeIssue = (index) => {
    // Clean up preview URL
    if (beforeIssuePreviews[index]) {
      URL.revokeObjectURL(beforeIssuePreviews[index]);
    }
    
    const newImages = beforeIssueImages.filter((_, i) => i !== index);
    const newPreviews = beforeIssuePreviews.filter((_, i) => i !== index);
    
    setBeforeIssueImages(newImages);
    setBeforeIssuePreviews(newPreviews);
    onInputChange('beforeIssueImages', newImages);
  };

  const handleAfterActionUpload = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    
    const validFiles = [];
    const newPreviews = [];
    
    files.forEach(file => {
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });
    
    if (validFiles.length > 0) {
      setAfterActionImages(prev => [...prev, ...validFiles]);
      setAfterActionPreviews(prev => [...prev, ...newPreviews]);
      
      // Update form data
      const allImages = [...afterActionImages, ...validFiles];
      onInputChange('afterActionImages', allImages);
    }
    
    // Clear input
    event.target.value = '';
  };

  const handleRemoveAfterAction = (index) => {
    // Clean up preview URL
    if (afterActionPreviews[index]) {
      URL.revokeObjectURL(afterActionPreviews[index]);
    }
    
    const newImages = afterActionImages.filter((_, i) => i !== index);
    const newPreviews = afterActionPreviews.filter((_, i) => i !== index);
    
    setAfterActionImages(newImages);
    setAfterActionPreviews(newPreviews);
    onInputChange('afterActionImages', newImages);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      beforeIssuePreviews.forEach(preview => URL.revokeObjectURL(preview));
      afterActionPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [beforeIssuePreviews, afterActionPreviews]);

  // Update the handleNext function to pass image data
  const handleNext = () => {
    // Validate required fields
    const errors = {};
    
    if (!formData.failureDetectedDate) {
      errors.failureDetectedDate = 'Failure detected date is required';
    }
    if (!formData.responseDate) {
      errors.responseDate = 'Response date is required';
    }
    if (!formData.arrivalDate) {
      errors.arrivalDate = 'Arrival date is required';
    }
    if (!formData.completionDate) {
      errors.completionDate = 'Completion date is required';
    }

    setFieldErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      // Pass image data to parent before proceeding
      if (onImageDataUpdate) {
        onImageDataUpdate(beforeIssueImages, afterActionImages);
      }
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

  // Styling objects
  const sectionContainerStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)'
    }
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

  const dateTimePickerStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#fafafa',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: '#d0d0d0',
        borderWidth: '1px'
      },
      '&:hover fieldset': {
        borderColor: '#2C3E50',
        borderWidth: '2px'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#3498DB',
        borderWidth: '2px',
        boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.1)'
      },
    },
    '& .MuiInputLabel-root': {
      color: '#2C3E50',
      fontWeight: 500
    },
  };

  const errorDateTimePickerStyle = {
    ...dateTimePickerStyle,
    '& .MuiOutlinedInput-root': {
      ...dateTimePickerStyle['& .MuiOutlinedInput-root'],
      backgroundColor: '#fdf2f2',
      '& fieldset': {
        borderColor: '#E74C3C',
        borderWidth: '2px'
      },
      '&:hover fieldset': {
        borderColor: '#E74C3C',
        borderWidth: '2px'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#E74C3C',
        borderWidth: '2px',
        boxShadow: '0 0 0 3px rgba(231, 76, 60, 0.1)'
      },
    },
    '& .MuiFormHelperText-root': {
      color: '#E74C3C',
      fontWeight: 500
    },
  };

  const fieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#fafafa',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: '#d0d0d0',
        borderWidth: '1px'
      },
      '&:hover fieldset': {
        borderColor: '#2C3E50',
        borderWidth: '2px'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#3498DB',
        borderWidth: '2px',
        boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.1)'
      },
    },
    '& .MuiInputLabel-root': {
      color: '#2C3E50',
      fontWeight: 500
    },
    '& .MuiOutlinedInput-input': {
      color: '#2C3E50',
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        padding: 3
      }}>
        <Paper sx={{
          maxWidth: '1200px',
          margin: '0 auto',
          borderRadius: '16px',
          padding: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }}>
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
            Corrective Maintenance Information
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
              
              <Grid item xs={12} sx={{ display: 'none' }}>
                <TextField
                  fullWidth
                  label="Type of Services"
                  value={getServiceTypeName()}
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
          
          {/* Date & Time Information Section */}
          <Paper sx={sectionContainerStyle}>
            <Typography variant="h5" sx={sectionHeaderStyle}>
              📅 Date & Time Information
            </Typography>
            
            <Grid container spacing={3} sx={{ marginTop: 1 }}>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Failure Detected"
                  value={formData.failureDetectedDate ? new Date(formData.failureDetectedDate) : null}
                  onChange={(newValue) => {
                    const formattedDate = formatDateForInput(newValue);
                    handleInputChange('failureDetectedDate', formattedDate);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!fieldErrors.failureDetectedDate}
                      helperText={fieldErrors.failureDetectedDate}
                      sx={fieldErrors.failureDetectedDate ? errorDateTimePickerStyle : dateTimePickerStyle}
                    />
                  )}
                  componentsProps={{
                    actionBar: {
                      actions: ['accept', 'cancel'],
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Response"
                  value={formData.responseDate ? new Date(formData.responseDate) : null}
                  onChange={(newValue) => {
                    const formattedDate = formatDateForInput(newValue);
                    handleInputChange('responseDate', formattedDate);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!fieldErrors.responseDate}
                      helperText={fieldErrors.responseDate}
                      sx={fieldErrors.responseDate ? errorDateTimePickerStyle : dateTimePickerStyle}
                    />
                  )}
                  componentsProps={{
                    actionBar: {
                      actions: ['accept', 'cancel'],
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Arrival"
                  value={formData.arrivalDate ? new Date(formData.arrivalDate) : null}
                  onChange={(newValue) => {
                    const formattedDate = formatDateForInput(newValue);
                    handleInputChange('arrivalDate', formattedDate);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!fieldErrors.arrivalDate}
                      helperText={fieldErrors.arrivalDate}
                      sx={fieldErrors.arrivalDate ? errorDateTimePickerStyle : dateTimePickerStyle}
                    />
                  )}
                  componentsProps={{
                    actionBar: {
                      actions: ['accept', 'cancel'],
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Completion"
                  value={formData.completionDate ? new Date(formData.completionDate) : null}
                  onChange={(newValue) => {
                    const formattedDate = formatDateForInput(newValue);
                    handleInputChange('completionDate', formattedDate);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!fieldErrors.completionDate}
                      helperText={fieldErrors.completionDate}
                      sx={fieldErrors.completionDate ? errorDateTimePickerStyle : dateTimePickerStyle}
                    />
                  )}
                  componentsProps={{
                    actionBar: {
                      actions: ['accept', 'cancel'],
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
          
          {/* Issue Details Section */}
          <Paper sx={sectionContainerStyle}>
            <Typography variant="h5" sx={sectionHeaderStyle}>
              📝 Issue Details
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
              {/* Before Issue Images - Multiple Upload */}
              <MultipleImageUploadField 
                field="beforeIssueImages"
                label="Before Issue Images"
                images={beforeIssueImages}
                previews={beforeIssuePreviews}
                onUpload={handleBeforeIssueUpload}
                onRemove={handleRemoveBeforeIssue}
                icon={PhotoCamera}
              />
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Issue Reported Description"
                value={formData.issueReportedDescription || ''}
                onChange={(e) => handleInputChange('issueReportedDescription', e.target.value)}
                placeholder="Describe the issue as reported by the user or system..."
                sx={fieldStyle}
              />
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Issue Found Description"
                value={formData.issueFoundDescription || ''}
                onChange={(e) => handleInputChange('issueFoundDescription', e.target.value)}
                placeholder="Describe the actual issue found during investigation and diagnosis..."
                sx={fieldStyle}
              />
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Action Taken Description"
                value={formData.actionTakenDescription || ''}
                onChange={(e) => handleInputChange('actionTakenDescription', e.target.value)}
                placeholder="Describe the corrective actions taken to resolve the issue..."
                sx={fieldStyle}
              />
              
              {/* After Action Images - Multiple Upload */}
              <MultipleImageUploadField 
                field="afterActionImages"
                label="After Action Images"
                images={afterActionImages}
                previews={afterActionPreviews}
                onUpload={handleAfterActionUpload}
                onRemove={handleRemoveAfterAction}
                icon={Build}
              />
            </Box>
          </Paper>
          
          {/* Approval Information Section */}
          <Paper sx={{
            ...sectionContainerStyle,
            background: '#ffffff'
          }}>
            <Typography variant="h5" sx={sectionHeaderStyle}>
              ✅ Approval Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
              <TextField
                fullWidth
                label="Attended By"
                value={formData.attendedBy || ''}
                onChange={(e) => handleInputChange('attendedBy', e.target.value)}
                placeholder="Enter the name of the person who attended to this issue..."
                sx={fieldStyle}
              />
              
              <TextField
                fullWidth
                label="Approved By"
                value={formData.approvedBy || ''}
                onChange={(e) => handleInputChange('approvedBy', e.target.value)}
                placeholder="Enter the name of the person who approved this report..."
                sx={fieldStyle}
              />
            </Box>
          </Paper>
          
          {/* Reference Information Section */}
          <Paper sx={{
            ...sectionContainerStyle,
            background: '#ffffff'
          }}>
            <Typography variant="h5" sx={sectionHeaderStyle}>
              🔗 Reference Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
              <FormControl fullWidth sx={fieldStyle}>
                <InputLabel id="further-action-taken-label">Further Action Taken</InputLabel>
                <Select
                  labelId="further-action-taken-label"
                  value={formData.furtherActionTakenID || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedOption = warehouseData.furtherActions.find(option => option.id === selectedId);
                    handleInputChange('furtherActionTakenID', selectedId);
                    handleInputChange('furtherActionTakenName', selectedOption ? (selectedOption.name || selectedOption.description || `Action ${selectedOption.id}`) : '');
                  }}
                  label="Further Action Taken"
                  disabled={loading}
                >
                  <MenuItem value="">
                    <em>Select Further Action Taken</em>
                  </MenuItem>
                  {warehouseData.furtherActions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name || option.description || `Action ${option.id}`}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {loading ? 'Loading options...' : 'Select from FurtherActionTakenWarehouse'}
                </FormHelperText>
              </FormControl>
              
              <FormControl fullWidth sx={fieldStyle}>
                <InputLabel id="form-status-label">Form Status</InputLabel>
                <Select
                  labelId="form-status-label"
                  value={formData.formstatusID || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedOption = warehouseData.formStatuses.find(option => option.id === selectedId);
                    handleInputChange('formstatusID', selectedId);
                    handleInputChange('formStatusName', selectedOption ? (selectedOption.status || selectedOption.name || `Status ${selectedOption.id}`) : '');
                  }}
                  label="Form Status"
                  disabled={loading}
                >
                  <MenuItem value="">
                    <em>Select Form Status</em>
                  </MenuItem>
                  {warehouseData.formStatuses.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.status || option.name || `Status ${option.id}`}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {loading ? 'Loading options...' : 'Select from FormStatusWarehouse'}
                </FormHelperText>
              </FormControl>
            </Box>
          </Paper>
          
          {/* Remark Section */}
          <Paper sx={{
            ...sectionContainerStyle,
            background: '#ffffff'
          }}>
            <Typography variant="h5" sx={sectionHeaderStyle}>
              📝 Remark
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Additional Remarks"
                value={formData.Remark || ''}
                onChange={(e) => handleInputChange('Remark', e.target.value)}
                placeholder="Enter any additional remarks or comments..."
                sx={fieldStyle}
              />
            </Box>
          </Paper>

          {/* Navigation Buttons Section */}
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
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default CMReportForm;