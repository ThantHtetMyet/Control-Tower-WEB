import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Modal,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  Videocam as VideocamIcon,
  RemoveCircle as RemoveCircleIcon,
  AccessTime,
  ArrowBack,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import RMSTheme from '../../theme-resource/RMSTheme';
import { 
  getRTUPMReportForm, 
  updateReportForm,
  updatePMReportFormRTU,
  updatePMMainRtuCabinet,
  updatePMChamberMagneticContact,
  updatePMRTUCabinetCooling,
  updatePMDVREquipment,
  deletePMMainRtuCabinet,
  deletePMChamberMagneticContact,
  deletePMRTUCabinetCooling,
  deletePMDVREquipment,
  createReportFormImage,
  deleteReportFormImage,
  getReportFormImageTypes
} from '../../api-services/reportFormService';
import { API_BASE_URL } from '../../../config/apiConfig';

const fieldContainer = {
  marginBottom: 2,
  padding: 2,
  backgroundColor: 'white',
  borderRadius: 1,
  border: '1px solid #e0e0e0'
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  } catch (error) {
    return 'Invalid date';
  }
};

// Updated getStatusChip function with proper color coding
const getStatusChip = (status) => {
  if (!status || status === '') {
    return (
      <Chip
        label="Not specified"
        color="default"
        variant="outlined"
        size="small"
      />
    );
  }
  
  const statusStr = status.toString();
  
  if (statusStr === 'Acceptable') {
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label={statusStr}
        color="success"
        variant="filled"
        size="small"
      />
    );
  } else if (statusStr === 'DONE') {
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label={statusStr}
        color="success"
        variant="filled"
        size="small"
        sx={{ backgroundColor: '#4caf50', color: 'white' }}
      />
    );
  } else if (statusStr === 'NonAcceptable') {
    return (
      <Chip
        icon={<CancelIcon />}
        label={statusStr}
        color="error"
        variant="filled"
        size="small"
      />
    );
  } else if (statusStr === 'PASS') {
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label={statusStr}
        color="success"
        variant="filled"
        size="small"
      />
    );
  } else if (statusStr === 'FAIL') {
    return (
      <Chip
        icon={<CancelIcon />}
        label={statusStr}
        color="error"
        variant="filled"
        size="small"
      />
    );
  } else if (statusStr === 'PENDING') {
    return (
      <Chip
        icon={<AccessTime />}
        label={statusStr}
        color="info"
        variant="filled"
        size="small"
      />
    );
  } else if (statusStr === 'NA') {
    return (
      <Chip
        icon={<RemoveCircleIcon />}
        label={statusStr}
        color="warning"
        variant="filled"
        size="small"
      />
    );
  } else {
    return (
      <Chip
        label={statusStr}
        color="default"
        variant="outlined"
        size="small"
      />
    );
  }
};


// Image preview section component with animations
const ImagePreviewSection = ({ images, title, icon: IconComponent = BuildIcon }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleImageDoubleClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };
  
  if (!images || images.length === 0) {
    console.log(`No images found for ${title}`);
    return (
      <Card sx={{ marginTop: 2, backgroundColor: '#f5f5f5' }}>
        <CardContent sx={{ textAlign: 'center', padding: 3 }}>
          <IconComponent sx={{ fontSize: 48, color: '#ccc', marginBottom: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No {title.toLowerCase()} available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ marginTop: 2 }}>
      <Typography variant="h6" sx={{ marginBottom: 2, display: 'flex', alignItems: 'center' }}>
        <IconComponent sx={{ marginRight: 1 }} />
        {title} ({images.length})
      </Typography>
      <Grid container spacing={2}>
        {images.map((image, index) => {
          
          // Safely determine the image source
          let imageSrc = '';
          let imageAlt = `Image ${index + 1}`;
          let imageName = `Image ${index + 1}`;

          // Handle different image data structures
          if (image.imageUrl) {
            // For existing images with URL from database
            // Check if imageUrl already contains the full URL or just the path
            if (image.imageUrl.startsWith('http')) {
              // Full URL already provided
              imageSrc = image.imageUrl;
            } else {
              // Relative path, prepend API_BASE_URL
              imageSrc = `${API_BASE_URL}${image.imageUrl}`;
            }
            imageAlt = image.imageName || `Image ${index + 1}`;
            imageName = image.imageName || `Image ${index + 1}`;
          } else if (image.file) {
            // For new uploaded files - handle both File objects and file data
            if (image.file instanceof File) {
              // Direct File object
              imageSrc = URL.createObjectURL(image.file);
              imageAlt = image.file.name || `Image ${index + 1}`;
              imageName = image.file.name || `Image ${index + 1}`;
              console.log(`Using File object: ${imageName}`);
            } else if (typeof image.file === 'object' && image.file.name) {
              // File data object with name property
              try {
                imageSrc = URL.createObjectURL(image.file);
                imageAlt = image.file.name || `Image ${index + 1}`;
                imageName = image.file.name || `Image ${index + 1}`;
                console.log(`Using file object with name: ${imageName}`);
              } catch (error) {
                console.warn('Could not create object URL for image:', error);
                return null;
              }
            } else {
              // Skip if file structure is not recognized
              console.warn('Unrecognized file structure:', image);
              return null;
            }
          } else if (image.url) {
            // Handle direct URL property
            imageSrc = image.url;
            imageAlt = image.name || `Image ${index + 1}`;
            imageName = image.name || `Image ${index + 1}`;
            console.log(`Using direct URL: ${imageSrc}`);
          } else if (image.id && image.isNew === false) {
            // Handle case where image might be from database but structured differently
            console.log('Attempting to handle database image with different structure:', image);
            // Try to construct URL from id or other properties
            if (image.imageName) {
              imageSrc = `${API_BASE_URL}/uploads/${image.imageName}`;
              imageAlt = image.imageName;
              imageName = image.imageName;
              console.log(`Constructed URL from imageName: ${imageSrc}`);
            }
          } else {
            // Skip invalid image entries
            console.warn('Invalid image entry - no recognizable image source:', image);
            return null;
          }

          // Final check if we have a valid image source
          if (!imageSrc) {
            console.warn('No valid image source found for:', image);
            return null;
          }

          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.15)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                    zIndex: 1
                  }
                }}
                onDoubleClick={() => handleImageDoubleClick(imageSrc)}
              >
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    // Handle image load errors
                    console.error('Failed to load image:', imageSrc, 'Original image data:', image);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => {
                   }}
                />
                <Typography 
                  variant="caption" 
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  {index + 1}
                </Typography>
              </Card>
            </Grid>
          );
        }).filter(Boolean)}
      </Grid>

      {/* Image Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            outline: 'none'
          }}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: 'black',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Enlarged view"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

const RTUPMReviewReportFormEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [rtuPMData, setRtuPMData] = useState(null);
  const [saveProgress, setSaveProgress] = useState('');
  
  // Toast notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success' or 'error'
  });
  
  // Add state to track original images for comparison
  const [originalImages, setOriginalImages] = useState({
    pmMainRtuCabinetImages: [],
    pmChamberMagneticContactImages: [],
    pmRTUCabinetCoolingImages: [],
    pmDVREquipmentImages: []
  });

  // Load report data
  useEffect(() => {
    const fetchReportData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        
        // Always fetch original data from database for comparison
        const originalResponse = await getRTUPMReportForm(id);
        setOriginalImages({
          pmMainRtuCabinetImages: originalResponse.pmMainRtuCabinetImages || [],
          pmChamberMagneticContactImages: originalResponse.pmChamberMagneticContactImages || [],
          pmRTUCabinetCoolingImages: originalResponse.pmrtuCabinetCoolingImages || [],
          pmDVREquipmentImages: originalResponse.pmdvrEquipmentImages || []
        });
        
        // Check if form data was passed from edit form
        if (location.state && location.state.formData) {
          // Use the passed form data instead of fetching from database
          setRtuPMData(location.state.formData);
        } else {
          // Fallback to fetching from database if no form data passed
          setRtuPMData(originalResponse);
        }
      } catch (error) {
        console.error('Error fetching RTU PM report data:', error);
        setError('Failed to load report data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [id, location.state]);

  const handleBack = () => {
    navigate(`/report-management-system/rtu-pm-edit/${id}`);
  };

  // Helper function to process image changes
  const processImageChanges = async (reportFormId) => {
    try {
      // First, get the correct image type IDs from the database
      const imageTypes = await getReportFormImageTypes();
      
      const imageTypeMapping = [
        { 
          key: 'pmMainRtuCabinetImages', 
          typeName: 'PMMainRtuCabinet',
          sectionName: 'PMMainRtuCabinets'
        },
        { 
          key: 'pmChamberMagneticContactImages', 
          typeName: 'PMChamberMagneticContact',
          sectionName: 'PMChamberMagneticContacts'
        },
        { 
          key: 'pmRTUCabinetCoolingImages', 
          typeName: 'PMRTUCabinetCooling',
          sectionName: 'PMRTUCabinetCoolings'
        },
        { 
          key: 'pmDVREquipmentImages', 
          typeName: 'PMDVREquipment',
          sectionName: 'PMDVREquipments'
        }
      ];

      for (const imageMapping of imageTypeMapping) {
        const currentImages = rtuPMData[imageMapping.key] || [];
        const originalImagesForType = originalImages[imageMapping.key] || [];

        // Find the correct image type ID
        const imageType = imageTypes.find(type => type.imageTypeName === imageMapping.typeName);
        if (!imageType) {
          console.error(`Image type not found: ${imageMapping.typeName}`);
          continue;
        }

        // Find deleted images (in original but not in current)
        const deletedImages = originalImagesForType.filter(
          originalImg => !currentImages.some(currentImg => currentImg.id === originalImg.id)
        );

        // Find new images (have file property, indicating they're new uploads)
        const newImages = currentImages.filter(img => img.file);

        // Delete removed images
        for (const deletedImage of deletedImages) {
          if (deletedImage.id) {
            console.log(`Deleting image: ${deletedImage.imageName}`);
            await deleteReportFormImage(deletedImage.id);
          }
        }

        // Upload new images using the correct API function signature
        for (const newImage of newImages) {
          if (newImage.file) {
            console.log(`Uploading new image for type ${imageMapping.typeName}`);
            
            // Use the correct createReportFormImage function signature
            await createReportFormImage(
              reportFormId,           // reportFormId
              newImage.file,          // imageFile
              imageType.id,           // reportFormImageTypeId (GUID)
              imageMapping.sectionName // sectionName for folder organization
            );
          }
        }
      }
    } catch (error) {
      console.error('Error processing image changes:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSaveProgress('Starting save process...');
      
      // Get the Report Form ID from URL parameter (this is the main report form ID)
      const reportFormId = id;
      
      // Get PM Report Form RTU ID - try multiple sources
      let pmReportFormRTUID = null;
      
      if (rtuPMData.pmReportFormRTU?.id) {
        pmReportFormRTUID = rtuPMData.pmReportFormRTU.id;
      } else if (rtuPMData.pmReportFormRTUID) {
        pmReportFormRTUID = rtuPMData.pmReportFormRTUID;
      } else if (location.state?.formData?.pmReportFormRTUID) {
        pmReportFormRTUID = location.state.formData.pmReportFormRTUID;
      } else {
        // If we still don't have it, we need to fetch the data from the API
        console.log('PM Report Form RTU ID not found in form data, fetching from API...');
        const apiResponse = await getRTUPMReportForm(id);
        pmReportFormRTUID = apiResponse.pmReportFormRTU?.id || apiResponse.pmReportFormRTUID;
      }
      
      if (!reportFormId) {
        throw new Error('Report Form ID not found in URL parameters');
      }
      
      if (!pmReportFormRTUID) {
        throw new Error('PM Report Form RTU ID not found. Please ensure the report has been properly created.');
      }

      console.log('Starting sequential API updates for Report Form ID:', reportFormId);
      console.log('PM Report Form RTU ID:', pmReportFormRTUID);

      // Step 1: Update ReportForm table first
      setSaveProgress('Updating Report Form basic data...');
      const reportFormData = {
        ReportFormTypeID: rtuPMData.reportFormTypeID,
        JobNo: rtuPMData.jobNo,
        SystemNameWarehouseID: rtuPMData.systemNameWarehouseID,
        StationNameWarehouseID: rtuPMData.stationNameWarehouseID,
        UploadStatus: rtuPMData.uploadStatus || 'Pending',
        UploadHostname: rtuPMData.uploadHostname || '',
        UploadIPAddress: rtuPMData.uploadIPAddress || '',
        FormStatus: rtuPMData.formStatus || 'Draft'
      };
      
      console.log('Step 1: Updating Report Form with data:', reportFormData);
      const reportFormResponse = await updateReportForm(reportFormId, reportFormData);
      console.log('Step 1 completed:', reportFormResponse);

      // Step 2: Update PM Report Form RTU basic data
      setSaveProgress('Updating RTU PM basic data...');
      const pmReportFormRTUData = {
        projectNo: rtuPMData.pmReportFormRTU?.projectNo || rtuPMData.projectNo,
        customer: rtuPMData.pmReportFormRTU?.customer || rtuPMData.customer,
        dateOfService: rtuPMData.pmReportFormRTU?.dateOfService || rtuPMData.dateOfService,
        cleaningOfCabinet: rtuPMData.pmReportFormRTU?.cleaningOfCabinet || rtuPMData.cleaningOfCabinet || rtuPMData.cleaningStatus,
        remarks: rtuPMData.pmReportFormRTU?.remarks || rtuPMData.remarks,
        attendedBy: rtuPMData.pmReportFormRTU?.attendedBy || rtuPMData.attendedBy,
        approvedBy: rtuPMData.pmReportFormRTU?.approvedBy || rtuPMData.approvedBy,
        pmReportFormTypeID: rtuPMData.pmReportFormRTU?.pmReportFormTypeID || rtuPMData.pmReportFormTypeID
      };
      
      console.log('Step 2: Updating PM Report Form RTU with data:', pmReportFormRTUData);
      const pmReportFormRTUResponse = await updatePMReportFormRTU(pmReportFormRTUID, pmReportFormRTUData);
      console.log('Step 2 completed:', pmReportFormRTUResponse);

      // Step 3: Handle deletions first
    setSaveProgress('Processing deletions...');
    
    // Delete PM Main RTU Cabinet records marked for deletion
    if (rtuPMData.pmMainRtuCabinet && rtuPMData.pmMainRtuCabinet.length > 0) {
      const recordsToDelete = rtuPMData.pmMainRtuCabinet.filter(record => record.isDeleted && record.ID);
      if (recordsToDelete.length > 0) {
        console.log('Deleting PM Main RTU Cabinet records:', recordsToDelete);
        await Promise.all(recordsToDelete.map(record => deletePMMainRtuCabinet(record.ID)));
      }
    }

    // Delete PM Chamber Magnetic Contact records marked for deletion
    if (rtuPMData.pmChamberMagneticContact && rtuPMData.pmChamberMagneticContact.length > 0) {
      const recordsToDelete = rtuPMData.pmChamberMagneticContact.filter(record => record.isDeleted && record.ID);
      if (recordsToDelete.length > 0) {
        console.log('Deleting PM Chamber Magnetic Contact records:', recordsToDelete);
        await Promise.all(recordsToDelete.map(record => deletePMChamberMagneticContact(record.ID)));
      }
    }

    // Delete PM RTU Cabinet Cooling records marked for deletion
    if (rtuPMData.pmRTUCabinetCooling && rtuPMData.pmRTUCabinetCooling.length > 0) {
      const recordsToDelete = rtuPMData.pmRTUCabinetCooling.filter(record => record.isDeleted && record.ID);
      if (recordsToDelete.length > 0) {
        console.log('Deleting PM RTU Cabinet Cooling records:', recordsToDelete);
        await Promise.all(recordsToDelete.map(record => deletePMRTUCabinetCooling(record.ID)));
      }
    }

    // Delete PM DVR Equipment records marked for deletion
    if (rtuPMData.pmDVREquipment && rtuPMData.pmDVREquipment.length > 0) {
      const recordsToDelete = rtuPMData.pmDVREquipment.filter(record => record.isDeleted && record.ID);
      if (recordsToDelete.length > 0) {
        console.log('Deleting PM DVR Equipment records:', recordsToDelete);
        await Promise.all(recordsToDelete.map(record => deletePMDVREquipment(record.ID)));
      }
    }

    // Step 4: Update PM Main RTU Cabinet data (exclude deleted records)
    if (rtuPMData.pmMainRtuCabinet && rtuPMData.pmMainRtuCabinet.length > 0) {
      setSaveProgress('Updating Main RTU Cabinet data...');
      const activeRecords = rtuPMData.pmMainRtuCabinet.filter(record => !record.isDeleted);
      if (activeRecords.length > 0) {
        console.log('Step 4: Updating PM Main RTU Cabinet with data:', activeRecords);
        const pmMainRtuCabinetResponse = await updatePMMainRtuCabinet(pmReportFormRTUID, activeRecords);
        console.log('Step 4 completed:', pmMainRtuCabinetResponse);
      }
    }

    // Step 5: Update PM Chamber Magnetic Contact data (exclude deleted records)
    if (rtuPMData.pmChamberMagneticContact && rtuPMData.pmChamberMagneticContact.length > 0) {
      setSaveProgress('Updating Chamber Magnetic Contact data...');
      const activeRecords = rtuPMData.pmChamberMagneticContact.filter(record => !record.isDeleted);
      if (activeRecords.length > 0) {
        console.log('Step 5: Updating PM Chamber Magnetic Contact with data:', activeRecords);
        const pmChamberResponse = await updatePMChamberMagneticContact(pmReportFormRTUID, activeRecords);
        console.log('Step 5 completed:', pmChamberResponse);
      }
    }

    // Step 6: Update PM RTU Cabinet Cooling data (exclude deleted records)
    if (rtuPMData.pmRTUCabinetCooling && rtuPMData.pmRTUCabinetCooling.length > 0) {
      setSaveProgress('Updating RTU Cabinet Cooling data...');
      const activeRecords = rtuPMData.pmRTUCabinetCooling.filter(record => !record.isDeleted);
      if (activeRecords.length > 0) {
        console.log('Step 6: Updating PM RTU Cabinet Cooling with data:', activeRecords);
        const pmCoolingResponse = await updatePMRTUCabinetCooling(pmReportFormRTUID, activeRecords);
        console.log('Step 6 completed:', pmCoolingResponse);
      }
    }

    // Step 7: Update PM DVR Equipment data (exclude deleted records)
    if (rtuPMData.pmDVREquipment && rtuPMData.pmDVREquipment.length > 0) {
      setSaveProgress('Updating DVR Equipment data...');
      const activeRecords = rtuPMData.pmDVREquipment.filter(record => !record.isDeleted);
      if (activeRecords.length > 0) {
        console.log('Step 7: Updating PM DVR Equipment with data:', activeRecords);
        const pmDVRResponse = await updatePMDVREquipment(pmReportFormRTUID, activeRecords);
        console.log('Step 7 completed:', pmDVRResponse);
      }
    }

      // Add image processing before the final navigation
      setSaveProgress('Processing image changes...');
      await processImageChanges(reportFormId);

      setSaveProgress('Save completed successfully!');
      
      // Show success toast
      setNotification({
        open: true,
        message: 'RTU PM Report saved successfully!',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate(`/report-management-system`);
      }, 1000);
      
    } catch (error) {
      console.error('Error saving RTU PM report:', error);
      
      // Extract error message from response if available
      let errorMessage = 'Failed to save report. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(`${errorMessage} (Failed at: ${saveProgress})`);
      
      // Show error toast
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSaving(false);
      setSaveProgress('');
    }
  };

  // Close toast notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Handle cancel action
  const handleCancel = () => {
    navigate(`/report-management-system`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          Back to Report List
        </Button>
      </Box>
    );
  }

  if (!rtuPMData) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="warning">
          No report data found.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ marginTop: 2 }}
        >
          Back to Report List
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
          <Typography sx={{ marginLeft: 2 }}>Loading RTU PM Report data...</Typography>
        </Box>
      )}

      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ marginBottom: 3 }}>
          {error}
        </Alert>
      )}

      {/* Save progress indicator */}
      {saving && (
        <Alert severity="info" sx={{ marginBottom: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ marginRight: 2 }} />
            {saveProgress}
          </Box>
        </Alert>
      )}

      {!loading && !error && rtuPMData && (
        <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            RTU PM Report Review - Edit
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
              {rtuPMData.jobNo || 'Not assigned'}
            </Typography>
          </Box>
        </Box>
      </Paper>


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
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" color="text.secondary">System Description</Typography>
              <Typography variant="body1">{rtuPMData.systemNameWarehouseName || 'Not specified'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" color="text.secondary">Station Name</Typography>
              <Typography variant="body1">{rtuPMData.stationNameWarehouseName || 'Not specified'}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" color="text.secondary">Project No</Typography>
              <Typography variant="body1">{rtuPMData.pmReportFormRTU?.projectNo || 'Not specified'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
              <Typography variant="body1">{rtuPMData.pmReportFormRTU?.customer || 'Not specified'}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Date of Service Section */}
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Typography 
          variant="h5" 
          sx={{
            color: '#2C3E50',
            fontWeight: 'bold',
            marginBottom: 3,
            paddingBottom: 1,
            borderBottom: '2px solid #3498DB'
          }}
        >
          Date of Service
        </Typography>
        
        <Box sx={fieldContainer}>
          <Typography variant="subtitle2" color="text.secondary">Date of Service</Typography>
          <Typography variant="body1">{formatDate(rtuPMData.pmReportFormRTU?.dateOfService)}</Typography>
        </Box>
      </Paper>

      {/* Main RTU Cabinet Section */}
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold', marginBottom: 2 }}>
          <BuildIcon sx={{ marginRight: 1, verticalAlign: 'middle' }} />
          Main RTU Cabinet
        </Typography>
        
        {rtuPMData.pmMainRtuCabinet && rtuPMData.pmMainRtuCabinet.length > 0 ? (
          <>
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>RTU Cabinet</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Equipment Rack</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Monitor</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mouse & Keyboard</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>CPU 6000 Card</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Input Card</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Megapop NTU</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Network Router</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Network Switch</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Digital Video Recorder</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>RTU Door Contact</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Power Supply Unit</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>UPS Battery</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rtuPMData.pmMainRtuCabinet
                    .filter(row => !row.isDeleted)
                    .map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{getStatusChip(row.RTUCabinet)}</TableCell>
                      <TableCell>{getStatusChip(row.EquipmentRack)}</TableCell>
                      <TableCell>{getStatusChip(row.Monitor)}</TableCell>
                      <TableCell>{getStatusChip(row.MouseKeyboard)}</TableCell>
                      <TableCell>{getStatusChip(row.CPU6000Card)}</TableCell>
                      <TableCell>{getStatusChip(row.InputCard)}</TableCell>
                      <TableCell>{getStatusChip(row.MegapopNTU)}</TableCell>
                      <TableCell>{getStatusChip(row.NetworkRouter)}</TableCell>
                      <TableCell>{getStatusChip(row.NetworkSwitch)}</TableCell>
                      <TableCell>{getStatusChip(row.DigitalVideoRecorder)}</TableCell>
                      <TableCell>{getStatusChip(row.RTUDoorContact)}</TableCell>
                      <TableCell>{getStatusChip(row.PowerSupplyUnit)}</TableCell>
                      <TableCell>{getStatusChip(row.UPSBattery)}</TableCell>
                      <TableCell>{row.Remarks || 'No remarks'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {rtuPMData.pmMainRtuCabinetImages && (
              <ImagePreviewSection 
                images={rtuPMData.pmMainRtuCabinetImages}
                title="Main RTU Cabinet Images"
                icon={BuildIcon}
              />
            )}
          </>
        ) : (
          <Alert severity="info" sx={{ marginTop: 2 }}>
            No Main RTU Cabinet data available.
          </Alert>
        )}
      </Paper>

      {/* PM Chamber Magnetic Contact Section */}
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold', marginBottom: 2 }}>
          <SettingsIcon sx={{ marginRight: 1, verticalAlign: 'middle' }} />
          PM Chamber Magnetic Contact
        </Typography>
        
        {rtuPMData.pmChamberMagneticContact && rtuPMData.pmChamberMagneticContact.length > 0 ? (
          <>
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Chamber Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Chamber OG Box</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Chamber Contact 1</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Chamber Contact 2</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Chamber Contact 3</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rtuPMData.pmChamberMagneticContact
                    .filter(row => !row.isDeleted)
                    .map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.ChamberNumber || 'Not specified'}</TableCell>
                      <TableCell>{getStatusChip(row.ChamberOGBox)}</TableCell>
                      <TableCell>{getStatusChip(row.ChamberContact1)}</TableCell>
                      <TableCell>{getStatusChip(row.ChamberContact2)}</TableCell>
                      <TableCell>{getStatusChip(row.ChamberContact3)}</TableCell>
                      <TableCell>{row.Remarks || 'No remarks'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {rtuPMData.pmChamberMagneticContactImages && (
              <ImagePreviewSection 
                images={rtuPMData.pmChamberMagneticContactImages}
                title="PM Chamber Magnetic Contact Images"
                icon={SettingsIcon}
              />
            )}
          </>
        ) : (
          <Alert severity="info" sx={{ marginTop: 2 }}>
            No PM Chamber Magnetic Contact data available.
          </Alert>
        )}
      </Paper>

      {/* PM RTU Cabinet Cooling Section */}
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold', marginBottom: 2 }}>
          <SettingsIcon sx={{ marginRight: 1, verticalAlign: 'middle' }} />
          PM RTU Cabinet Cooling
        </Typography>
        
        {rtuPMData.pmRTUCabinetCooling && rtuPMData.pmRTUCabinetCooling.length > 0 ? (
          <>
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fan Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Functional Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rtuPMData.pmRTUCabinetCooling
                    .filter(row => !row.isDeleted)
                    .map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.FanNumber || 'Not specified'}</TableCell>
                      <TableCell>{getStatusChip(row.FunctionalStatus)}</TableCell>
                      <TableCell>{row.Remarks || 'No remarks'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {rtuPMData.pmRTUCabinetCoolingImages && (
              <ImagePreviewSection 
                images={rtuPMData.pmRTUCabinetCoolingImages}
                title="PM RTU Cabinet Cooling Images"
                icon={SettingsIcon}
              />
            )}
          </>
        ) : (
          <Alert severity="info" sx={{ marginTop: 2 }}>
            No PM RTU Cabinet Cooling data available.
          </Alert>
        )}
      </Paper>

      {/* PM DVR Equipment Section */}
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold', marginBottom: 2 }}>
          <VideocamIcon sx={{ marginRight: 1, verticalAlign: 'middle' }} />
          PM DVR Equipment
        </Typography>
        
        {rtuPMData.pmDVREquipment && rtuPMData.pmDVREquipment.length > 0 ? (
          <>
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>DVR Comm</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>DVR RAID Comm</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Time Sync NTP Server</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Recording 24x7</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rtuPMData.pmDVREquipment
                    .filter(row => !row.isDeleted)
                    .map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{getStatusChip(row.DVRComm)}</TableCell>
                      <TableCell>{getStatusChip(row.DVRRAIDComm)}</TableCell>
                      <TableCell>{getStatusChip(row.TimeSyncNTPServer)}</TableCell>
                      <TableCell>{getStatusChip(row.Recording24x7)}</TableCell>
                      <TableCell>{row.Remarks || 'No remarks'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {rtuPMData.pmDVREquipmentImages && (
              <ImagePreviewSection 
                images={rtuPMData.pmDVREquipmentImages}
                title="PM DVR Equipment Images"
                icon={VideocamIcon}
              />
            )}
          </>
        ) : (
          <Alert severity="info" sx={{ marginTop: 2 }}>
            No PM DVR Equipment data available.
          </Alert>
        )}
      </Paper>

      
      {/* Cleaning of Cabinet / Equipment Section */}
      <Paper sx={{ 
        padding: 3, 
        marginBottom: 3,
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            marginBottom: 2,
            color: '#ff6b35',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          🧹 Cleaning of Cabinet / Equipment
        </Typography>
        <Box sx={fieldContainer}>
          <Typography variant="subtitle2" color="text.secondary">Select Cleaning Status</Typography>
          <Typography variant="body1">
            {rtuPMData.pmReportFormRTU?.cleaningOfCabinet === 'DONE' ? '✅ DONE' : 
             rtuPMData.pmReportFormRTU?.cleaningOfCabinet === 'PENDING' ? '⏳ PENDING' : 
             'Not specified'}
          </Typography>
        </Box>
      </Paper>

      {/* Remarks Section */}
      <Paper sx={{ 
        padding: 3, 
        marginBottom: 3,
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            marginBottom: 2,
            color: '#ff6b35',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          📝 Remarks
        </Typography>
        <Box sx={fieldContainer}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {rtuPMData.pmReportFormRTU?.remarks || 'No remarks'}
          </Typography>
        </Box>
      </Paper>

      {/* Approval Information Section */}
      <Paper sx={{ 
        padding: 3, 
        marginBottom: 3,
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            marginBottom: 2,
            color: '#28a745',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          ✅ Approval Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" color="text.secondary">Attended By</Typography>
              <Typography variant="body1">{rtuPMData.pmReportFormRTU?.attendedBy || 'Not specified'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" color="text.secondary">Approved By</Typography>
              <Typography variant="body1">{rtuPMData.pmReportFormRTU?.approvedBy || 'Not specified'}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

          {/* Navigation Buttons Section */}
          <Paper sx={{
            padding: 3,
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            position: 'sticky',
            bottom: 0,
            zIndex: 1000
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
              
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saving}
                sx={{
                  color: '#6c757d',
                  borderColor: '#6c757d',
                  padding: '12px 32px',
                  borderRadius: RMSTheme.borderRadius?.small || '8px',
                  '&:hover': {
                    background: '#f8f9fa',
                    borderColor: '#5a6268',
                    color: '#5a6268'
                  },
                  '&:disabled': {
                    background: '#e9ecef',
                    color: '#6c757d',
                    borderColor: '#dee2e6'
                  }
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  background: RMSTheme.components.button.primary.background,
                  color: RMSTheme.components.button.primary.text,
                  padding: '12px 32px',
                  borderRadius: RMSTheme.borderRadius?.small || '8px',
                  border: `1px solid ${RMSTheme.components.button.primary.border}`,
                  boxShadow: RMSTheme.components.button.primary.shadow,
                  '&:hover': {
                    background: RMSTheme.components.button.primary?.hover || '#218838'
                  },
                  '&:disabled': {
                    background: '#6c757d',
                    color: 'white'
                  }
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Toast Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ 
            width: '100%',
            backgroundColor: notification.severity === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            '& .MuiAlert-action': {
              color: 'white'
            }
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default RTUPMReviewReportFormEdit;