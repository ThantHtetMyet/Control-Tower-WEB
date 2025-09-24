import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera,
  Build,
  Settings
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import RMSTheme from '../../theme-resource/RMSTheme';
import { getCMReportForm, updateCMReportForm, getCMMaterialUsed, deleteCMMaterialUsed } from '../../api-services/reportFormService';
import warehouseService from '../../api-services/warehouseService';
import { API_BASE_URL } from '../../../config/apiConfig';

// MultipleImageUploadField Component
const MultipleImageUploadField = ({ 
  images, 
  onImagesChange, 
  label, 
  maxImages = 10,
  accept = "image/*"
}) => {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    // Create preview URLs for existing images
    const newPreviews = images.map(image => {
      if (image.file) {
        return {
          id: image.id || Date.now() + Math.random(),
          url: URL.createObjectURL(image.file),
          isNew: true,
          file: image.file
        };
      } else if (image.imageUrl) {
        return {
          id: image.id,
          url: image.imageUrl,
          isNew: false,
          imageName: image.imageName
        };
      }
      return null;
    }).filter(Boolean);

    setPreviews(newPreviews);

    // Cleanup function to revoke blob URLs
    return () => {
      newPreviews.forEach(preview => {
        if (preview.isNew && preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [images]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const remainingSlots = maxImages - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newImages = filesToAdd.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      isNew: true
    }));

    onImagesChange([...images, ...newImages]);
    event.target.value = '';
  };

  const handleRemoveImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  return (
    <Box sx={{ marginTop: 2 }}>
      <Typography variant="subtitle1" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
        {label}
      </Typography>
      
      {/* Upload Button */}
      {images.length < maxImages && (
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{ marginBottom: 2 }}
        >
          Upload Images 
          <input
            type="file"
            hidden
            multiple
            accept={accept}
            onChange={handleFileSelect}
          />
        </Button>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <Grid container spacing={2}>
          {previews.map((preview) => (
            <Grid item xs={6} sm={4} md={3} key={preview.id}>
              <Box sx={{ position: 'relative' }}>
                <img
                  src={preview.url}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveImage(preview.id)}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <Box
          sx={{
            border: '2px dashed #ddd',
            borderRadius: 2,
            padding: 3,
            textAlign: 'center',
            color: '#666'
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, marginBottom: 1, opacity: 0.5 }} />
          <Typography variant="body2">
            No images uploaded yet. Click "Upload Images" to add photos.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const CMReportFormEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Add CM Report Form ID state
  const [cmReportFormId, setCmReportFormId] = useState(null);

  // Add state to track original images for comparison
  const [originalImages, setOriginalImages] = useState({
    beforeIssueImages: [],
    afterActionImages: [],
    materialUsedOldSerialImages: [],
    materialUsedNewSerialImages: []
  });

  // Dropdown data states - Following RTU PM pattern
  const [systemNames, setSystemNames] = useState([]);
  const [stationNames, setStationNames] = useState([]);
  const [warehouseData, setWarehouseData] = useState({
    furtherActions: [],
    formStatuses: [],
    stationNames: []
  });

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form data state - Following RTU PM pattern
  const [formData, setFormData] = useState({
    customer: '',
    projectNo: '',
    jobNo: '',
    reportFormTypeName: '',
    stationName: '',
    stationNameWarehouseID: '',
    stationNameWarehouseName: '',
    systemDescription: '',
    systemNameWarehouseID: '',
    systemNameWarehouseName: '',
    issueReportedDescription: '',
    issueFoundDescription: '',
    actionTakenDescription: '',
    failureDetectedDate: null,
    responseDate: null,
    arrivalDate: null,
    completionDate: null,
    attendedBy: '',
    approvedBy: '',
    remark: '',
    furtherActionTakenID: '',
    formstatusID: ''
  });

  // Image states
  const [beforeIssueImages, setBeforeIssueImages] = useState([]);
  const [afterActionImages, setAfterActionImages] = useState([]);
  const [materialUsedOldSerialImages, setMaterialUsedOldSerialImages] = useState([]);
  const [materialUsedNewSerialImages, setMaterialUsedNewSerialImages] = useState([]);

  // Material used data state
  const [materialUsedData, setMaterialUsedData] = useState([]);
  const [showMaterialUsedClearConfirm, setShowMaterialUsedClearConfirm] = useState(false);

  // Helper function to format date for input
  const formatDateForInput = (date) => {
    if (!date) return '';
    
    let dateObj;
    
    if (date._isAMomentObject) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      console.error('Invalid date object:', date);
      return '';
    }
    
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date object:', date);
      return '';
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Load dropdown data - Following RTU PM pattern
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [systemsResponse, warehouseResponse] = await Promise.all([
          warehouseService.getSystemNameWarehouses(),
          warehouseService.getAllWarehouseData()
        ]);

        setSystemNames(systemsResponse?.data || []);
        setWarehouseData(warehouseResponse);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  // Load station names when system changes - Following RTU PM pattern
  useEffect(() => {
    const fetchStationNames = async () => {
      if (formData.systemNameWarehouseID) {
        try {
          const response = await warehouseService.getStationNameWarehouses(formData.systemNameWarehouseID);
          setStationNames(response || []);
        } catch (error) {
          console.error('Error fetching station names:', error);
          setStationNames([]);
        }
      } else {
        setStationNames([]);
      }
    };

    fetchStationNames();
  }, [formData.systemNameWarehouseID]);

  // Load CM report form data
  useEffect(() => {
    const fetchCMReportForm = async () => {
      try {
        setLoading(true);
        const response = await getCMReportForm(id);
        
        if (response && response.cmReportForm) {
          const cmData = response.cmReportForm;
          

          
          // Set basic form data - Set system ID first to trigger station loading
          setFormData(prev => ({
            ...prev,
            customer: cmData.customer || '',
            projectNo: cmData.projectNo || '',
            jobNo: response.jobNo || '',
            reportFormTypeName: response.reportFormTypeName || '',
            reportFormTypeID: response.reportFormTypeID || '',
            systemDescription: response.systemNameWarehouseName || cmData.systemDescription || '',
            systemNameWarehouseID: response.systemNameWarehouseID || '',
            systemNameWarehouseName: response.systemNameWarehouseName || '',
            stationName: response.stationNameWarehouseName || cmData.stationName || '',
            stationNameWarehouseID: response.stationNameWarehouseID || '',
            stationNameWarehouseName: response.stationNameWarehouseName || '',
            issueReportedDescription: cmData.issueReportedDescription || '',
            issueFoundDescription: cmData.issueFoundDescription || '',
            actionTakenDescription: cmData.actionTakenDescription || '',
            failureDetectedDate: cmData.failureDetectedDate ? new Date(cmData.failureDetectedDate) : null,
            responseDate: cmData.responseDate ? new Date(cmData.responseDate) : null,
            arrivalDate: cmData.arrivalDate ? new Date(cmData.arrivalDate) : null,
            completionDate: cmData.completionDate ? new Date(cmData.completionDate) : null,
            attendedBy: cmData.attendedBy || '',
            approvedBy: cmData.approvedBy || '',
            remark: cmData.remark || '',
            furtherActionTakenID: cmData.furtherActionTakenID || '',
            formstatusID: cmData.formstatusID || ''
          }));



          // Load images with correct URL construction - Following RTU PM pattern
          if (response.beforeIssueImages) {
            const beforeImages = response.beforeIssueImages.map(img => ({
              id: img.id,
              imageUrl: img.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${img.imageName}` : null,
              imageName: img.imageName
            }));
            setBeforeIssueImages(beforeImages);
            setOriginalImages(prev => ({ ...prev, beforeIssueImages: [...beforeImages] }));
          }

          if (response.afterActionImages) {
            const afterImages = response.afterActionImages.map(img => ({
              id: img.id,
              imageUrl: img.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${img.imageName}` : null,
              imageName: img.imageName
            }));
            setAfterActionImages(afterImages);
            setOriginalImages(prev => ({ ...prev, afterActionImages: [...afterImages] }));
          }

          if (response.materialUsedOldSerialImages) {
            const oldSerialImages = response.materialUsedOldSerialImages.map(img => ({
              id: img.id,
              imageUrl: img.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${img.imageName}` : null,
              imageName: img.imageName
            }));
            setMaterialUsedOldSerialImages(oldSerialImages);
            setOriginalImages(prev => ({ ...prev, materialUsedOldSerialImages: [...oldSerialImages] }));
          }

          if (response.materialUsedNewSerialImages) {
            const newSerialImages = response.materialUsedNewSerialImages.map(img => ({
              id: img.id,
              imageUrl: img.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${img.imageName}` : null,
              imageName: img.imageName
            }));
            setMaterialUsedNewSerialImages(newSerialImages);
            setOriginalImages(prev => ({ ...prev, materialUsedNewSerialImages: [...newSerialImages] }));
          }

          // Load material used data from API
          if (cmData.id) {
            setCmReportFormId(cmData.id);
            const materialUsedResponse = await getCMMaterialUsed(cmData.id);
            console.log('Material Used Response:', materialUsedResponse);
            
            if (materialUsedResponse && materialUsedResponse.length > 0) {
              const formattedMaterialUsed = materialUsedResponse.map(item => ({
                id: item.id,
                itemDescription: item.itemDescription,
                newSerialNo: item.newSerialNo,
                oldSerialNo: item.oldSerialNo,
                remark: item.remark,
                isDeleted: false // Initialize as not deleted for editing
              }));
              setMaterialUsedData(formattedMaterialUsed);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching CM report form:', error);
        setError('Failed to load CM report form data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCMReportForm();
    }
  }, [id]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle system change - Following RTU PM pattern
  const handleSystemChange = (systemId) => {
    setFormData(prev => ({
      ...prev,
      systemNameWarehouseID: systemId,
      stationNameWarehouseID: '', // Reset station when system changes
      stationName: '',
      stationNameWarehouseName: ''
    }));
  };

  // Handle station change - Following RTU PM pattern
  const handleStationChange = (stationId) => {
    const selectedStation = stationNames.find(station => station.id === stationId);
    setFormData(prev => ({
      ...prev,
      stationNameWarehouseID: stationId,
      stationName: selectedStation ? selectedStation.name : '',
      stationNameWarehouseName: selectedStation ? selectedStation.name : ''
    }));
  };

    // Handle material used data changes
  const handleAddMaterialUsedRow = () => {
    setMaterialUsedData(prev => [...prev, {
      id: null, // Set to null for new records, backend will generate GUID
      itemDescription: '', // Match field name used in review component
      
      serialNo: '', // Required by backend DTO
      oldSerialNo: '', // Keep for UI compatibility
      newSerialNo: '', // Keep for UI compatibility
      remark: '',
      isDeleted: false // Add isDeleted flag
    }]);
  };

  const handleMaterialUsedChange = (index, field, value) => {
    setMaterialUsedData(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveMaterialUsedRow = (index) => {
    // Instead of removing, mark as deleted (soft delete)
    setMaterialUsedData(prev => prev.map((item, i) => 
      i === index ? { ...item, isDeleted: true } : item
    ));
  };

  const handleRestoreMaterialUsedRow = (index) => {
    setMaterialUsedData(prev => prev.map((item, i) => 
      i === index ? { ...item, isDeleted: false } : item
    ));
  };

  const handleClearMaterialUsed = () => {
    setMaterialUsedData([]);
    setShowMaterialUsedClearConfirm(false);
  };

  // Handle submit (navigate to review)
  const handleSubmit = () => {
    // Prepare the complete form data to pass to review - Following RTU PM pattern
    const reviewData = {
      // Add CM Report Form ID
      cmReportFormId: cmReportFormId,
      
      // Basic form data
      customer: formData.customer,
      projectNo: formData.projectNo,
      jobNo: formData.jobNo,
      reportFormTypeName: formData.reportFormTypeName,
      reportFormTypeID: formData.reportFormTypeID,
      stationName: formData.stationName,
      stationNameWarehouseID: formData.stationNameWarehouseID,
      stationNameWarehouseName: formData.stationNameWarehouseName,
      systemDescription: formData.systemDescription,
      systemNameWarehouseID: formData.systemNameWarehouseID,
      systemNameWarehouseName: formData.systemNameWarehouseName,
      issueReportedDescription: formData.issueReportedDescription,
      issueFoundDescription: formData.issueFoundDescription,
      actionTakenDescription: formData.actionTakenDescription,
      failureDetectedDate: formData.failureDetectedDate,
      responseDate: formData.responseDate,
      arrivalDate: formData.arrivalDate,
      completionDate: formData.completionDate,
      attendedBy: formData.attendedBy,
      approvedBy: formData.approvedBy,
      remark: formData.remark,
      furtherActionTakenID: formData.furtherActionTakenID,
      formstatusID: formData.formstatusID,
      
      // Image data with change tracking
      beforeIssueImages: beforeIssueImages,
      afterActionImages: afterActionImages,
      materialUsedOldSerialImages: materialUsedOldSerialImages,
      materialUsedNewSerialImages: materialUsedNewSerialImages,
      
      // Add original images for deletion tracking
      originalImages: {
        beforeIssueImages: originalImages.beforeIssueImages,
        afterActionImages: originalImages.afterActionImages,
        materialUsedOldSerialImages: originalImages.materialUsedOldSerialImages,
        materialUsedNewSerialImages: originalImages.materialUsedNewSerialImages
      },
      
      // Material used data
      materialUsedData: materialUsedData,
      
      // Add metadata to help track changes
      _imageChangeMetadata: {
        hasImageChanges: true,
        changedSections: {
          beforeIssueImages: beforeIssueImages.some(img => img.file),
          afterActionImages: afterActionImages.some(img => img.file),
          materialUsedOldSerialImages: materialUsedOldSerialImages.some(img => img.file),
          materialUsedNewSerialImages: materialUsedNewSerialImages.some(img => img.file)
        }
      }
    };
    
    // Navigate to review page with form data - Following RTU PM pattern
    navigate(`/report-management-system/cm-report-review-edit/${id}`, {
      state: { formData: reviewData }
    });
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/report-management-system/report-forms/cm-details/${id}`);
  };

  // Handle close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ padding: 3, maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header with JobNo in top right corner */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#2C3E50', 
                fontWeight: 'bold' 
              }}
            >
              Edit CM Report
            </Typography>
            
            {/* JobNo display in top right corner */}
            <Box sx={{
              backgroundColor: '#f5f5f5',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#2C3E50',
                  fontWeight: 'normal',
                  fontSize: '14px',
                  display: 'inline'
                }}
              >
                Job No: 
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#FF0000',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  display: 'inline',
                  marginLeft: '4px'
                }}
              >
                {formData.jobNo || 'Not assigned'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ marginBottom: 2 }}>
            Report updated successfully! Redirecting...
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        {/* Basic Information Section */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography 
            variant="h5" 
            sx={{
              color: '#2C3E50',
              fontWeight: 'bold',
              marginBottom: 3
            }}
          >
            Basic Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* System Description */}
            <TextField
              fullWidth
              select
              label="System Description"
              value={formData.systemNameWarehouseID || ''}
              onChange={(e) => {
                const selectedSystem = systemNames.find(system => system.id === e.target.value);
                handleInputChange('systemNameWarehouseID', e.target.value);
                handleInputChange('systemNameWarehouseName', selectedSystem?.name || '');
                handleInputChange('systemDescription', selectedSystem?.name || '');
              }}
              required
              variant="outlined"
              sx={{
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
                '& .MuiSelect-select': {
                  color: '#2C3E50',
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
            
            {/* Station Name */}
            <Autocomplete
              fullWidth
              options={stationNames}
              getOptionLabel={(option) => option.name || ''}
              value={stationNames.find(station => station.id === formData.stationNameWarehouseID) || null}
              onChange={(event, newValue) => {
                const stationId = newValue ? newValue.id : '';
                handleInputChange('stationNameWarehouseID', stationId);
                handleInputChange('stationNameWarehouseName', newValue?.name || '');
                handleInputChange('stationName', newValue?.name || '');
              }}
              disabled={!formData.systemNameWarehouseID}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Station Name"
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      minHeight: '40px',
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
                    '& .MuiAutocomplete-input': {
                      color: '#2C3E50',
                      fontSize: '14px',
                    },
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  key={option.id}
                  sx={{
                    color: '#2C3E50',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    padding: '8px 12px',
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
                  maxHeight: '200px',
                  '& .MuiAutocomplete-option': {
                    minHeight: '36px',
                  }
                }
              }}
              size="small"
              noOptionsText="No stations available"
              loadingText="Loading stations..."
            />
            
            {/* Project No */}
            <TextField
              fullWidth
              label="Project No"
              value={formData.projectNo || ''}
              onChange={(e) => handleInputChange('projectNo', e.target.value)}
              required
              variant="outlined"
              sx={{
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
              }}
            />
            
            {/* Customer */}
            <TextField
              fullWidth
              label="Customer"
              value={formData.customer || ''}
              onChange={(e) => handleInputChange('customer', e.target.value)}
              required
              variant="outlined"
              sx={{
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
              }}
            />
            
            {/* Type of Services - Read Only */}
            <TextField
              fullWidth
              label="Type of Services"
              value={formData.reportFormTypeName || ''}
              required
              variant="outlined"
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  '& fieldset': {
                    borderColor: '#d0d0d0',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#666666',
                },
                '& .MuiOutlinedInput-input': {
                  color: '#666666',
                },
              }}
            />
          </Box>
        </Paper>

        {/* Date & Time Information */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography 
            variant="h5" 
            sx={{
              color: '#2C3E50',
              fontWeight: 'bold',
              marginBottom: 3
            }}
          >
            Date & Time Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Failure Detected Date"
                value={formData.failureDetectedDate}
                onChange={(newValue) => handleInputChange('failureDetectedDate', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    sx={{
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Response Date"
                value={formData.responseDate}
                onChange={(newValue) => handleInputChange('responseDate', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    sx={{
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Arrival Date"
                value={formData.arrivalDate}
                onChange={(newValue) => handleInputChange('arrivalDate', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    sx={{
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Completion Date"
                value={formData.completionDate}
                onChange={(newValue) => handleInputChange('completionDate', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    sx={{
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Issue Details */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography 
            variant="h5" 
            sx={{
              color: '#2C3E50',
              fontWeight: 'bold',
              marginBottom: 3
            }}
          >
            Issue Details
          </Typography>
          
          {/* Issue Reported Description */}
          <Paper sx={{ padding: 2, marginBottom: 3, border: '1px solid #e0e0e0' }}>
            <Typography 
              variant="h6" 
              sx={{
                color: '#2C3E50',
                fontWeight: 'bold',
                marginBottom: 2,
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Issue Reported Description
            </Typography>
            
            <TextField
              fullWidth
              value={formData.issueReportedDescription || ''}
              onChange={(e) => handleInputChange('issueReportedDescription', e.target.value)}
              multiline
              rows={4}
              variant="outlined"
              sx={{
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
            
            {/* Before Issue Images */}
            <Box sx={{ marginTop: 2 }}>
              <MultipleImageUploadField
                images={beforeIssueImages}
                onImagesChange={setBeforeIssueImages}
                label="Before Issue Images"
                maxImages={10}
              />
            </Box>
          </Paper>
          
          {/* Issue Found Description */}
          <Paper sx={{ padding: 2, marginBottom: 3, border: '1px solid #e0e0e0' }}>
            <Typography 
              variant="h6" 
              sx={{
                color: '#2C3E50',
                fontWeight: 'bold',
                marginBottom: 2,
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Issue Found Description
            </Typography>
            
            <TextField
              fullWidth
              value={formData.issueFoundDescription || ''}
              onChange={(e) => handleInputChange('issueFoundDescription', e.target.value)}
              multiline
              rows={4}
              variant="outlined"
              sx={{
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </Paper>
          
          {/* Action Taken Description */}
          <Paper sx={{ padding: 2, marginBottom: 3, border: '1px solid #e0e0e0' }}>
            <Typography 
              variant="h6" 
              sx={{
                color: '#2C3E50',
                fontWeight: 'bold',
                marginBottom: 2,
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Action Taken Description
            </Typography>
            
            <TextField
              fullWidth
              value={formData.actionTakenDescription || ''}
              onChange={(e) => handleInputChange('actionTakenDescription', e.target.value)}
              multiline
              rows={4}
              variant="outlined"
              sx={{
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
            
            {/* After Action Images */}
            <Box sx={{ marginTop: 2 }}>
              <MultipleImageUploadField
                images={afterActionImages}
                onImagesChange={setAfterActionImages}
                label="After Action Images"
                maxImages={10}
              />
            </Box>
          </Paper>
        </Paper>

        {/* Material Used Information */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography 
            variant="h5" 
            sx={{
              color: '#2C3E50',
              fontWeight: 'bold',
              marginBottom: 3
            }}
          >
            Material Used Information
          </Typography>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddMaterialUsedRow}
              variant="contained"
              sx={{
                background: RMSTheme.components.button.primary.background,
                color: RMSTheme.components.button.primary.text,
                padding: '8px 16px',
                borderRadius: RMSTheme.borderRadius.small,
                border: `1px solid ${RMSTheme.components.button.primary.border}`,
                boxShadow: RMSTheme.components.button.primary.shadow,
                '&:hover': {
                  background: RMSTheme.components.button.primary.hover
                }
              }}
            >
              Add Row
            </Button>
            
            <Button
              startIcon={<DeleteIcon />}
              onClick={() => setShowMaterialUsedClearConfirm(true)}
              variant="outlined"
              sx={{
                color: RMSTheme.components.button.secondary.text,
                borderColor: RMSTheme.components.button.secondary.border,
                padding: '8px 16px',
                borderRadius: RMSTheme.borderRadius.small,
                '&:hover': {
                  backgroundColor: RMSTheme.components.button.secondary.hover,
                  borderColor: RMSTheme.components.button.secondary.border
                }
              }}
            >
              Clear All
            </Button>
          </Box>

          {/* Material Used Table */}
          <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Material Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Old Serial No</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>New Serial No</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materialUsedData.length > 0 ? (
                  materialUsedData.map((row, index) => (
                    <TableRow 
                      key={row.id || index}
                      sx={{
                        backgroundColor: row.isDeleted ? '#ffebee' : 'inherit',
                        opacity: row.isDeleted ? 0.6 : 1,
                        textDecoration: row.isDeleted ? 'line-through' : 'none'
                      }}
                    >
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={row.itemDescription || ''}
                          onChange={(e) => handleMaterialUsedChange(index, 'itemDescription', e.target.value)}
                          variant="outlined"
                          disabled={row.isDeleted}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={row.oldSerialNo || ''}
                          onChange={(e) => handleMaterialUsedChange(index, 'oldSerialNo', e.target.value)}
                          variant="outlined"
                          disabled={row.isDeleted}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={row.newSerialNo || ''}
                          onChange={(e) => handleMaterialUsedChange(index, 'newSerialNo', e.target.value)}
                          variant="outlined"
                          disabled={row.isDeleted}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={row.remark || ''}
                          onChange={(e) => handleMaterialUsedChange(index, 'remark', e.target.value)}
                          variant="outlined"
                          disabled={row.isDeleted}
                        />
                      </TableCell>
                      <TableCell>
                        {row.isDeleted ? (
                          <IconButton
                            onClick={() => handleRestoreMaterialUsedRow(index)}
                            color="success"
                            size="small"
                            title="Restore row"
                          >
                            <RestoreIcon />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={() => handleRemoveMaterialUsedRow(index)}
                            color="error"
                            size="small"
                            title="Delete row"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No material used data. Click "Add Row" to add materials.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Material Used Images */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MultipleImageUploadField
                images={materialUsedOldSerialImages}
                onImagesChange={setMaterialUsedOldSerialImages}
                label="Old Serial No Images"
                maxImages={10}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <MultipleImageUploadField
                images={materialUsedNewSerialImages}
                onImagesChange={setMaterialUsedNewSerialImages}
                label="New Serial No Images"
                maxImages={10}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Approval Information */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography 
            variant="h5" 
            sx={{
              color: '#2C3E50',
              fontWeight: 'bold',
              marginBottom: 3
            }}
          >
            Approval Information
          </Typography>
          
              <TextField
                fullWidth
                label="Attended By"
                value={formData.attendedBy || ''}
                onChange={(e) => handleInputChange('attendedBy', e.target.value)}
                variant="outlined"
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            <Box sx={{ marginTop: 2 }}>
              <TextField
                fullWidth
                label="Approved By"
                multiline
                value={formData.approvedBy || ''}
                onChange={(e) => handleInputChange('approvedBy', e.target.value)}
                variant="outlined"
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
          </Box>
        </Paper>

        {/* Reference Information */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography 
            variant="h5" 
            sx={{
              color: '#2C3E50',
              fontWeight: 'bold',
              marginBottom: 3
            }}
          >
            Reference Information
          </Typography>
          
              <FormControl fullWidth>
                <InputLabel>Further Action Taken</InputLabel>
                <Select
                  value={formData.furtherActionTakenID || ''}
                  onChange={(e) => handleInputChange('furtherActionTakenID', e.target.value)}
                  label="Further Action Taken"
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: '8px'
                  }}
                >
                  {warehouseData.furtherActions?.map((action) => (
                    <MenuItem key={action.id} value={action.id}>
                      {action.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            
            <Box sx={{ marginTop: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Form Status</InputLabel>
                <Select
                  value={formData.formstatusID || ''}
                  onChange={(e) => handleInputChange('formstatusID', e.target.value)}
                  label="Form Status"
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: '8px'
                  }}
                >
                  {warehouseData.formStatuses?.map((status) => (
                    <MenuItem key={status.id} value={status.id}>
                      {status.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
        </Paper>

        {/* Remark */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography 
            variant="h5" 
            sx={{
              color: '#2C3E50',
              fontWeight: 'bold',
              marginBottom: 3
            }}
          >
            Remark
          </Typography>
          
          <TextField
            fullWidth
            label="Remark"
            value={formData.remark || ''}
            onChange={(e) => handleInputChange('remark', e.target.value)}
            multiline
            rows={4}
            variant="outlined"
            sx={{
              backgroundColor: 'white',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          />
        </Paper>

        {/* Action Buttons Footer */}
        <Paper sx={{ 
          padding: 3,
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          position: 'sticky',
          bottom: 0,
          zIndex: 1000
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Back Button */}
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/report-management')}
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
               Back
            </Button>

            {/* Right side buttons */}
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saving}
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
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Review →'}
            </Button>
          </Box>
        </Paper>

        {/* Clear Material Used Confirmation Dialog */}
        <Dialog
          open={showMaterialUsedClearConfirm}
          onClose={() => setShowMaterialUsedClearConfirm(false)}
        >
          <DialogTitle>Clear All Material Used Data</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to clear all material used data? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowMaterialUsedClearConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleClearMaterialUsed} color="error" autoFocus>
              Clear All
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default CMReportFormEdit;