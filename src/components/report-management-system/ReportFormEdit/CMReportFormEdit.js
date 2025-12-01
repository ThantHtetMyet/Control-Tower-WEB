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
  Autocomplete,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  PhotoCamera,
  Build,
  Settings,
  ArrowBackIosNew as ArrowBackIosNewIcon,
  ArrowForwardIos as ArrowForwardIosIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import RMSTheme from '../../theme-resource/RMSTheme';
import { getCMReportForm, getCMMaterialUsed } from '../../api-services/reportFormService';
import warehouseService from '../../api-services/warehouseService';
import { API_BASE_URL } from '../../../config/apiConfig';
import WarningModal from '../../common/WarningModal';

// MultipleImageUploadField Component
const MultipleImageUploadField = ({
  images,
  onImagesChange,
  label,
  maxImages = 10,
  accept = "image/*",
  icon: IconComponent = CloudUploadIcon
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
      <Typography variant="subtitle1" sx={{ marginBottom: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <IconComponent sx={{ mr: 1, color: '#3498DB' }} />
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
  const [showFormStatusWarning, setShowFormStatusWarning] = useState(false);

  // Add CM Report Form ID state
  const [cmReportFormId, setCmReportFormId] = useState(null);

  // Add state to track original images for comparison
  const [originalImages, setOriginalImages] = useState({
    beforeIssueImages: [],
    afterActionImages: [],
    materialUsedOldSerialImages: [],
    materialUsedNewSerialImages: []
  });

  // Dropdown data states
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

  // Form data state
  const [formData, setFormData] = useState({
    customer: '',
    projectNo: '',
    jobNo: '',
    reportTitle: '',
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
    formstatusID: '',
    formStatusName: ''
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
      return '';
    }
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Load dropdown data
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

  // Load station names when system changes
  useEffect(() => {
    const fetchStationNames = async () => {
      if (formData.systemNameWarehouseID) {
        try {
          const response = await warehouseService.getStationNameWarehouses(formData.systemNameWarehouseID);
          setStationNames(response || []);
        } catch (error) {
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
        const [response, statuses] = await Promise.all([
          getCMReportForm(id),
          warehouseService.getFormStatus()
        ]);

        if (response && response.cmReportForm) {
          const cmData = response.cmReportForm;
          const statusId =
            cmData.formstatusID ||
            response.formStatus ||
            '';
          const matchedStatus = (statuses || []).find(
            (status) => (status.id || status.ID) === statusId
          );
          const normalizedStatusName = (
            matchedStatus?.name ||
            matchedStatus?.Name ||
            cmData.formStatusName ||
            response.formStatus ||
            ''
          ).trim().toLowerCase();

          if (normalizedStatusName === 'close') {
            setError('This CM report is closed and cannot be edited.');
            navigate(`/report-management-system/report-forms/cm-details/${id}`, { replace: true });
            return;
          }

          setFormData(prev => ({
            ...prev,
            customer: cmData.customer || '',
            projectNo: cmData.projectNo || '',
            jobNo: response.jobNo || '',
            reportTitle: cmData.reportTitle || response.reportTitle || '',
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
            formstatusID: statusId,
            formStatusName: matchedStatus?.name || matchedStatus?.Name || cmData.formStatusName || ''
          }));

          // Load images
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

          // Load material used data
          if (cmData.id) {
            setCmReportFormId(cmData.id);
            const materialUsedResponse = await getCMMaterialUsed(cmData.id);

            if (materialUsedResponse && materialUsedResponse.length > 0) {
              const formattedMaterialUsed = materialUsedResponse.map(item => ({
                id: item.id,
                itemDescription: item.itemDescription,
                newSerialNo: item.newSerialNo,
                oldSerialNo: item.oldSerialNo,
                remark: item.remark,
                isDeleted: false
              }));
              setMaterialUsedData(formattedMaterialUsed);
            }
          }
        }
      } catch (error) {
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

  // Handle Form Status change - update both ID and Name
  const handleFormStatusChange = (selectedStatusId) => {
    const selectedStatus = warehouseData.formStatuses.find(
      status => status.id === selectedStatusId
    );
    
    setFormData(prev => ({
      ...prev,
      formstatusID: selectedStatusId,
      formStatusName: selectedStatus?.name || selectedStatus?.status || ''
    }));
  };

  // Handle material used data changes
  const handleAddMaterialUsedRow = () => {
    setMaterialUsedData(prev => [...prev, {
      id: null,
      itemDescription: '',
      serialNo: '',
      oldSerialNo: '',
      newSerialNo: '',
      remark: '',
      isDeleted: false
    }]);
  };

  const handleMaterialUsedChange = (index, field, value) => {
    setMaterialUsedData(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveMaterialUsedRow = (index) => {
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

  // Handle submit
  const handleSubmit = () => {
    // Validate FormStatus
    if (!formData.formstatusID) {
      setShowFormStatusWarning(true);
      return;
    }

    const reviewData = {
      cmReportFormId: cmReportFormId,
      ...formData,
      beforeIssueImages: beforeIssueImages,
      afterActionImages: afterActionImages,
      materialUsedOldSerialImages: materialUsedOldSerialImages,
      materialUsedNewSerialImages: materialUsedNewSerialImages,
      originalImages: originalImages,
      materialUsedData: materialUsedData,
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

    navigate(`/report-management-system/cm-report-review-edit/${id}`, {
      state: { formData: reviewData }
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Styling constants
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
    '& .MuiInputBase-input.Mui-disabled': {
      color: '#333',
      WebkitTextFillColor: '#333'
    }
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

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
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }}>
          {/* Gradient Header */}
          <Box sx={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 50%, #1A252F 100%)',
            color: 'white',
            padding: 4,
            textAlign: 'center'
          }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                marginBottom: 1,
                letterSpacing: '0.5px'
              }}
            >
              {formData.reportTitle || ''}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                opacity: 0.95,
                fontSize: '16px',
                fontWeight: 400
              }}
            >
              Update Maintenance Information
            </Typography>

            {/* Job No Badge */}
            <Box sx={{
              marginTop: 2,
              display: 'inline-block',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '8px 20px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#e0e0e0',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Job No:
                <Typography
                  component="span"
                  sx={{
                    color: '#FFD700',
                    fontWeight: 'bold',
                    marginLeft: '8px',
                    fontSize: '16px'
                  }}
                >
                  {formData.jobNo || 'Not assigned'}
                </Typography>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ padding: 4 }}>
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

            {/* Section 1: Basic Information */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                📋 Basic Information
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Job No - Read Only */}
                <TextField
                  fullWidth
                  label="Job No"
                  value={formData.jobNo || ''}
                  disabled
                  sx={{
                    ...fieldStyle,
                    display: 'none'
                  }}
                />

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
                  sx={fieldStyle}
                >
                  {systemNames.map((system) => (
                    <MenuItem key={system.id} value={system.id}>
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
                      sx={fieldStyle}
                    />
                  )}
                />

                {/* Customer */}
                <TextField
                  fullWidth
                  label="Customer"
                  value={formData.customer || ''}
                  onChange={(e) => handleInputChange('customer', e.target.value)}
                  required
                  variant="outlined"
                  sx={fieldStyle}
                />

                {/* Project No */}
                <TextField
                  fullWidth
                  label="Project No"
                  value={formData.projectNo || ''}
                  onChange={(e) => handleInputChange('projectNo', e.target.value)}
                  required
                  variant="outlined"
                  sx={fieldStyle}
                />


              </Box>
            </Paper>

            {/* Section 2: Form Status */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                ✅ Form Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
                <FormControl fullWidth sx={fieldStyle}>
                  <InputLabel id="form-status-label">Form Status</InputLabel>
                  <Select
                    labelId="form-status-label"
                    value={formData.formstatusID || ''}
                    onChange={(e) => handleFormStatusChange(e.target.value)}
                    label="Form Status"
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
                </FormControl>
              </Box>
            </Paper>

            {/* Section 3: Date & Time Information */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                📅 Date & Time Information
              </Typography>
              <Grid container spacing={3} sx={{ marginTop: 1 }}>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Failure Detected"
                    value={formData.failureDetectedDate}
                    onChange={(newValue) => {
                      const formattedDate = formatDateForInput(newValue);
                      handleInputChange('failureDetectedDate', formattedDate);
                    }}
                    renderInput={(params) => <TextField {...params} fullWidth sx={dateTimePickerStyle} />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Response"
                    value={formData.responseDate}
                    onChange={(newValue) => {
                      const formattedDate = formatDateForInput(newValue);
                      handleInputChange('responseDate', formattedDate);
                    }}
                    renderInput={(params) => <TextField {...params} fullWidth sx={dateTimePickerStyle} />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Arrival"
                    value={formData.arrivalDate}
                    onChange={(newValue) => {
                      const formattedDate = formatDateForInput(newValue);
                      handleInputChange('arrivalDate', formattedDate);
                    }}
                    renderInput={(params) => <TextField {...params} fullWidth sx={dateTimePickerStyle} />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Completion"
                    value={formData.completionDate}
                    onChange={(newValue) => {
                      const formattedDate = formatDateForInput(newValue);
                      handleInputChange('completionDate', formattedDate);
                    }}
                    renderInput={(params) => <TextField {...params} fullWidth sx={dateTimePickerStyle} />}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Section 4: Issue Details */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                📝 Issue Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
                <MultipleImageUploadField
                  field="beforeIssueImages"
                  label="Before Issue Images"
                  images={beforeIssueImages}
                  onImagesChange={setBeforeIssueImages}
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

                <MultipleImageUploadField
                  field="afterActionImages"
                  label="After Action Images"
                  images={afterActionImages}
                  onImagesChange={setAfterActionImages}
                  icon={Build}
                />
              </Box>
            </Paper>

            {/* Section 5: Material Used Information */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                <Settings sx={{ marginRight: 1 }} />
                Material Used Information
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, marginTop: 2, marginBottom: 2 }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddMaterialUsedRow}
                  variant="contained"
                  sx={{
                    background: RMSTheme.components.button.primary.background,
                    color: RMSTheme.components.button.primary.text,
                    '&:hover': { background: RMSTheme.components.button.primary.hover }
                  }}
                >
                  Add Material Used Row
                </Button>
                <Button
                  onClick={() => setShowMaterialUsedClearConfirm(true)}
                  disabled={materialUsedData.length === 0}
                  variant="contained"
                  color="warning"
                >
                  Clear Values
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Item Description</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>New Serial No</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Old Serial No</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Remark</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {materialUsedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', padding: '24px', color: '#6c757d' }}>
                          No material used data added yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      materialUsedData.map((row, index) => (
                        <TableRow key={index} sx={{ backgroundColor: row.isDeleted ? '#ffebee' : 'inherit' }}>
                          <TableCell>
                            <TextField
                              size="small"
                              value={row.itemDescription}
                              onChange={(e) => handleMaterialUsedChange(index, 'itemDescription', e.target.value)}
                              disabled={row.isDeleted}
                              sx={fieldStyle}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={row.newSerialNo}
                              onChange={(e) => handleMaterialUsedChange(index, 'newSerialNo', e.target.value)}
                              disabled={row.isDeleted}
                              sx={fieldStyle}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={row.oldSerialNo}
                              onChange={(e) => handleMaterialUsedChange(index, 'oldSerialNo', e.target.value)}
                              disabled={row.isDeleted}
                              sx={fieldStyle}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={row.remark}
                              onChange={(e) => handleMaterialUsedChange(index, 'remark', e.target.value)}
                              disabled={row.isDeleted}
                              sx={fieldStyle}
                            />
                          </TableCell>
                          <TableCell>
                            {row.isDeleted ? (
                              <IconButton onClick={() => handleRestoreMaterialUsedRow(index)} color="success">
                                <RestoreIcon />
                              </IconButton>
                            ) : (
                              <IconButton onClick={() => handleRemoveMaterialUsedRow(index)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ marginTop: 3 }}>
                <MultipleImageUploadField
                  field="materialUsedOldSerialImages"
                  label="Old Serial No Images"
                  images={materialUsedOldSerialImages}
                  onImagesChange={setMaterialUsedOldSerialImages}
                  icon={Settings}
                />
                <MultipleImageUploadField
                  field="materialUsedNewSerialImages"
                  label="New Serial No Images"
                  images={materialUsedNewSerialImages}
                  onImagesChange={setMaterialUsedNewSerialImages}
                  icon={Settings}
                />
              </Box>
            </Paper>

            {/* Section 6: Remark */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                📝 Remark
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Additional Remarks"
                value={formData.remark || ''}
                onChange={(e) => handleInputChange('remark', e.target.value)}
                placeholder="Enter any additional remarks..."
                sx={fieldStyle}
              />
            </Paper>

            {/* Section 7: Approval Information */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                ✅ Approval Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
                <TextField
                  fullWidth
                  label="Attended By"
                  value={formData.attendedBy || ''}
                  onChange={(e) => handleInputChange('attendedBy', e.target.value)}
                  sx={fieldStyle}
                />
                <TextField
                  fullWidth
                  label="Approved By"
                  value={formData.approvedBy || ''}
                  onChange={(e) => handleInputChange('approvedBy', e.target.value)}
                  sx={fieldStyle}
                />
              </Box>
            </Paper>

            {/* Section 8: Reference Information */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                🔗 Further Action Taken
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
                <FormControl fullWidth sx={fieldStyle}>
                  <InputLabel>Further Action Taken</InputLabel>
                  <Select
                    value={formData.furtherActionTakenID || ''}
                    onChange={(e) => handleInputChange('furtherActionTakenID', e.target.value)}
                    label="Further Action Taken"
                  >
                    <MenuItem value="">
                      <em>Select Further Action Taken</em>
                    </MenuItem>
                    {warehouseData.furtherActions?.map((action) => (
                      <MenuItem key={action.id} value={action.id}>
                        {action.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Paper>

            {/* Footer Action Buttons */}
            <Paper sx={{
              padding: 3,
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              position: 'sticky',
              bottom: 0,
              zIndex: 1000
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<ArrowBackIosNewIcon fontSize="small" />}
                  onClick={() => navigate('/report-management-system/report-forms')}
                  sx={{
                    background: RMSTheme.components.button.primary.background,
                    color: RMSTheme.components.button.primary.text,
                    padding: '12px 32px',
                    borderRadius: RMSTheme.borderRadius.small,
                    border: `1px solid ${RMSTheme.components.button.primary.border}`,
                    boxShadow: RMSTheme.components.button.primary.shadow,
                    '&:hover': { background: RMSTheme.components.button.primary.hover }
                  }}
                >
                  Back
                </Button>

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={saving}
                  endIcon={<ArrowForwardIosIcon fontSize="small" />}
                  sx={{
                    background: RMSTheme.components.button.primary.background,
                    color: RMSTheme.components.button.primary.text,
                    padding: '12px 32px',
                    borderRadius: RMSTheme.borderRadius.small,
                    border: `1px solid ${RMSTheme.components.button.primary.border}`,
                    boxShadow: RMSTheme.components.button.primary.shadow,
                    '&:hover': { background: RMSTheme.components.button.primary.hover }
                  }}
                >
                  {saving ? <CircularProgress size={20} color="inherit" /> : 'Review'}
                </Button>
              </Box>
            </Paper>

            {/* Dialogs */}
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
                <Button onClick={() => setShowMaterialUsedClearConfirm(false)}>Cancel</Button>
                <Button onClick={handleClearMaterialUsed} color="error" autoFocus>Clear All</Button>
              </DialogActions>
            </Dialog>

            <Snackbar
              open={notification.open}
              autoHideDuration={6000}
              onClose={handleCloseNotification}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                {notification.message}
              </Alert>
            </Snackbar>

          </Box>
        </Paper>
      </Box>

      {/* Form Status Warning Modal */}
      <WarningModal
        open={showFormStatusWarning}
        onClose={() => setShowFormStatusWarning(false)}
        title="Form Status Required"
        content="Please select a Form Status before proceeding to the review page."
        buttonText="OK"
      />
    </LocalizationProvider>
  );
};

export default CMReportFormEdit;
