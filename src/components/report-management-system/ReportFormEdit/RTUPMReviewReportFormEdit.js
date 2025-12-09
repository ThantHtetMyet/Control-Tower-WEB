import React, { useState, useEffect, useRef } from 'react';
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
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  TextField,
  Tooltip,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup
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
  Close as CloseIcon,
  UploadFile as UploadFileIcon,
  Brush as BrushIcon,
  Clear as ClearIcon,
  PhotoCamera
} from '@mui/icons-material';
import { format } from 'date-fns';
import RMSTheme from '../../theme-resource/RMSTheme';
import DownloadConfirmationModal from '../../common/DownloadConfirmationModal';
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
  getReportFormImageTypes,
  generateRTUPMReportPdf,
  generateRTUPMFinalReportPdf,
  uploadFinalReportAttachment,
  getFinalReportsByReportForm,
  downloadFinalReportAttachment
} from '../../api-services/reportFormService';
import warehouseService from '../../api-services/warehouseService';
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
    //console.log(`No images found for ${title}`);
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
              //console.log(`Using File object: ${imageName}`);
            } else if (typeof image.file === 'object' && image.file.name) {
              // File data object with name property
              try {
                imageSrc = URL.createObjectURL(image.file);
                imageAlt = image.file.name || `Image ${index + 1}`;
                imageName = image.file.name || `Image ${index + 1}`;
                //console.log(`Using file object with name: ${imageName}`);
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
            //console.log(`Using direct URL: ${imageSrc}`);
          } else if (image.id && image.isNew === false) {
            // Handle case where image might be from database but structured differently
            //console.log('Attempting to handle database image with different structure:', image);
            // Try to construct URL from id or other properties
            if (image.imageName) {
              imageSrc = `${API_BASE_URL}/uploads/${image.imageName}`;
              imageAlt = image.imageName;
              imageName = image.imageName;
              //console.log(`Constructed URL from imageName: ${imageSrc}`);
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
  const [finalReportDialogOpen, setFinalReportDialogOpen] = useState(false);
  const [finalReportFile, setFinalReportFile] = useState(null);
  const [finalReportUploadError, setFinalReportUploadError] = useState('');
  const [finalReportUploading, setFinalReportUploading] = useState(false);
  const [downloadConfirmModalOpen, setDownloadConfirmModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = PDF, 1 = Signatures
  
  // Signature states
  const [attendedBySignature, setAttendedBySignature] = useState(null);
  const [approvedBySignature, setApprovedBySignature] = useState(null);
  const [attendedBySignaturePreview, setAttendedBySignaturePreview] = useState('');
  const [approvedBySignaturePreview, setApprovedBySignaturePreview] = useState('');
  
  // Signature mode states ('draw' or 'upload')
  const [attendedByMode, setAttendedByMode] = useState('draw');
  const [approvedByMode, setApprovedByMode] = useState('draw');
  
  // Canvas refs for signature drawing
  const attendedByCanvasRef = useRef(null);
  const approvedByCanvasRef = useRef(null);
  const [isDrawingAttended, setIsDrawingAttended] = useState(false);
  const [isDrawingApproved, setIsDrawingApproved] = useState(false);

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

  // Load report data from location state (passed from RTUPMReportFormEdit)
  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      // Get data from location state passed from parent component
      if (location.state && location.state.formData) {
        const formData = location.state.formData;

        // Set original images for comparison
        setOriginalImages({
          pmMainRtuCabinetImages: formData.pmMainRtuCabinetImages || [],
          pmChamberMagneticContactImages: formData.pmChamberMagneticContactImages || [],
          pmRTUCabinetCoolingImages: formData.pmRTUCabinetCoolingImages || [],
          pmDVREquipmentImages: formData.pmDVREquipmentImages || []
        });

        setRtuPMData(formData);
      } else {
        setError('No report data provided. Please access this page from the report edit form.');
      }
    } catch (error) {
      console.error('Error loading RTU PM report data:', error);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [location.state]);

  const handleBack = () => {
    navigate(`/report-management-system/rtu-pm-edit/${id}`);
  };

  const resolvedStatusName = (rtuPMData?.formStatusName ||
    rtuPMData?.pmReportFormRTU?.formStatusName ||
    '').toString().trim().toLowerCase();
  const isStatusClose = resolvedStatusName === 'close';

  const handleFinalReportFileChange = (event) => {
    setFinalReportUploadError('');
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    setFinalReportFile(file);
  };

  const handleAttendedBySignatureChange = (event) => {
    setFinalReportUploadError('');
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    if (file) {
      setAttendedBySignature(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttendedBySignaturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApprovedBySignatureChange = (event) => {
    setFinalReportUploadError('');
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    if (file) {
      setApprovedBySignature(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setApprovedBySignaturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas drawing handlers
  const startDrawing = (canvasRef, setIsDrawing) => (e) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (canvasRef, isDrawing) => (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = (setIsDrawing) => () => {
    setIsDrawing(false);
  };

  const clearCanvas = (canvasRef) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const canvasToBlob = (canvas) => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  };

  const handleCloseFinalReportDialog = () => {
    if (finalReportUploading) return;
    setFinalReportDialogOpen(false);
    setFinalReportFile(null);
    setFinalReportUploadError('');
    setAttendedBySignature(null);
    setApprovedBySignature(null);
    setAttendedBySignaturePreview('');
    setApprovedBySignaturePreview('');
    setAttendedByMode('draw');
    setApprovedByMode('draw');
    setActiveTab(0); // Reset to PDF tab
    
    // Clear canvases
    clearCanvas(attendedByCanvasRef);
    clearCanvas(approvedByCanvasRef);
  };

  const handleUploadFinalReport = async () => {
    // Check for drawn signatures and convert to blob
    let attendedBySignatureToUpload = attendedBySignature;
    let approvedBySignatureToUpload = approvedBySignature;
    
    // If mode is 'draw', get signature from canvas
    if (attendedByMode === 'draw' && attendedByCanvasRef.current) {
      const canvas = attendedByCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasDrawing = imageData.data.some(channel => channel !== 0);
      
      if (hasDrawing) {
        const blob = await canvasToBlob(canvas);
        attendedBySignatureToUpload = new File([blob], 'attended-by-signature.png', { type: 'image/png' });
      }
    }
    
    if (approvedByMode === 'draw' && approvedByCanvasRef.current) {
      const canvas = approvedByCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasDrawing = imageData.data.some(channel => channel !== 0);
      
      if (hasDrawing) {
        const blob = await canvasToBlob(canvas);
        approvedBySignatureToUpload = new File([blob], 'approved-by-signature.png', { type: 'image/png' });
      }
    }

    // Validate based on active tab
    if (activeTab === 0) {
      // PDF tab - validate final report file
      if (!finalReportFile) {
        setFinalReportUploadError('Please select a PDF file to upload.');
        return;
      }
    } else {
      // Signatures tab - validate both signatures
      const hasBothSignatures = !!attendedBySignatureToUpload && !!approvedBySignatureToUpload;
      
      if (!hasBothSignatures) {
        if (!attendedBySignatureToUpload && !approvedBySignatureToUpload) {
          setFinalReportUploadError('Please provide both Attended By and Approved By signatures.');
        } else if (attendedBySignatureToUpload && !approvedBySignatureToUpload) {
          setFinalReportUploadError('Please provide Approved By signature.');
        } else if (!attendedBySignatureToUpload && approvedBySignatureToUpload) {
          setFinalReportUploadError('Please provide Attended By signature.');
        }
        return;
      }
    }

    setFinalReportUploading(true);
    setFinalReportUploadError('');

    try {
      // First save the report data
      await handleSave({ skipNavigation: true, suppressSuccessToast: true });
      
      const reportFormId = id;
      if (!reportFormId) {
        throw new Error('Report Form ID not found in URL parameters');
      }

      // Handle PDF upload or signature-based generation
      if (activeTab === 0 && finalReportFile) {
        // Upload final report PDF
        await uploadFinalReportAttachment(reportFormId, finalReportFile);
      } else if (activeTab === 1 && attendedBySignatureToUpload && approvedBySignatureToUpload) {
        // Upload signatures
        const imageTypes = await getReportFormImageTypes();
        const attendedByImageType = imageTypes.find(type => type.imageTypeName === 'AttendedBySignature');
        const approvedByImageType = imageTypes.find(type => type.imageTypeName === 'ApprovedBySignature');
        
        if (attendedByImageType) {
          await createReportFormImage(reportFormId, attendedBySignatureToUpload, attendedByImageType.id, 'Signatures');
        }
        
        if (approvedByImageType) {
          await createReportFormImage(reportFormId, approvedBySignatureToUpload, approvedByImageType.id, 'Signatures');
        }
        
        // Generate final report PDF from signatures
        try {
          console.log(`Generating RTU PM final report PDF for ReportForm ID: ${reportFormId}`);
          await generateRTUPMFinalReportPdf(reportFormId);
          console.log('RTU PM final report PDF generated successfully');
        } catch (pdfError) {
          console.error('Error generating RTU PM final report PDF:', pdfError);
        }
      }

      // Reset dialog state
      setFinalReportDialogOpen(false);
      setFinalReportFile(null);
      setAttendedBySignature(null);
      setApprovedBySignature(null);
      setAttendedBySignaturePreview('');
      setApprovedBySignaturePreview('');
      setAttendedByMode('draw');
      setApprovedByMode('draw');
      clearCanvas(attendedByCanvasRef);
      clearCanvas(approvedByCanvasRef);

      setNotification({
        open: true,
        message: activeTab === 0 
          ? 'RTU PM Report and Final Report saved successfully!' 
          : 'RTU PM Report saved! Final report PDF is being generated...',
        severity: 'success'
      });

      // Auto-download the final report after a delay
      setTimeout(async () => {
        try {
          await downloadSavedFinalReport(reportFormId, rtuPMData?.reportForm?.jobNo || rtuPMData?.jobNo);
        } catch (downloadError) {
          console.error('Error downloading final report:', downloadError);
        }
        navigate('/report-management-system');
      }, activeTab === 1 ? 4000 : 2000);
      
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to submit report.';
      setFinalReportUploadError(message);
    } finally {
      setFinalReportUploading(false);
    }
  };

  // Helper function to download the final report after saving
  const downloadSavedFinalReport = async (reportFormId, jobNo) => {
    try {
      // Wait a bit for the final report to be created in the database
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Fetch the final reports for this report form
      const finalReports = await getFinalReportsByReportForm(reportFormId);
      
      if (finalReports && finalReports.length > 0) {
        // Get the most recent final report (first one)
        const latestReport = finalReports[0];
        
        // Download the final report
        const response = await downloadFinalReportAttachment(latestReport.id);
        const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileName = latestReport.attachmentName || `FinalReport_${jobNo || 'report'}.pdf`;
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        
        console.log('Final report downloaded successfully:', fileName);
      } else {
        console.log('No final reports found for download');
      }
    } catch (downloadError) {
      console.error('Error downloading final report:', downloadError);
    }
  };

  const handleSubmit = () => {
    if (isStatusClose) {
      setFinalReportUploadError('');
      setFinalReportDialogOpen(true);
      return;
    }
    // Show download confirmation modal instead of directly saving
    setDownloadConfirmModalOpen(true);
  };

  // Handle when user clicks "Cancel" in download modal - just close and stay on review page
  const handleModalCancel = () => {
    setDownloadConfirmModalOpen(false);
  };

  // Handle when user clicks "Update Report Only" - save without downloading
  const handleUpdateOnly = async () => {
    try {
      setIsDownloading(true);
      setDownloadConfirmModalOpen(false);
      await handleSave();
    } catch (error) {
      console.error('Error during report update:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle when user clicks "Download Report" - save and download
  const handleDownloadConfirm = async () => {
    try {
      setIsDownloading(true);
      setDownloadConfirmModalOpen(false);

      console.log('=== Starting RTU PM report save and download ===');
      
      // Save the report first (we'll modify handleSave to accept options)
      await handleSave({ skipNavigation: true, suppressSuccessToast: true });
      
      // Wait a moment to ensure backend has processed the save
      console.log('Waiting 2 seconds before downloading...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Download the report
      await handleDownloadReport(id);
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Report saved and downloaded successfully!',
        severity: 'success'
      });
      
      // Navigate after download
      setTimeout(() => {
        navigate('/report-management-system');
      }, 1500);
      
    } catch (error) {
      console.error('Error during save and download:', error);
      setNotification({
        open: true,
        message: 'Report saved but download failed. You can download it from the report details page.',
        severity: 'warning'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Download report function using direct HTTP API
  const handleDownloadReport = async (reportFormId) => {
    try {
      console.log(`Generating RTU PM report PDF for ReportForm ID: ${reportFormId}`);

      const response = await generateRTUPMReportPdf(reportFormId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      // Extract filename from response headers or use default
      const disposition = response.headers['content-disposition'];
      let fileName = `RTUPMReport_${rtuPMData?.jobNo || reportFormId}.pdf`;
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/i);
        if (match && match[1]) {
          fileName = match[1];
        }
      }

      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      console.log('RTU PM Report PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating RTU PM report PDF:', error);
      const errorMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : error.message) ||
        'Failed to generate PDF report.';
      console.error('Error details:', errorMessage);
      throw error; // Re-throw to be caught by handleDownloadConfirm
    }
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
            //console.log(`Deleting image: ${deletedImage.imageName}`);
            await deleteReportFormImage(deletedImage.id);
          }
        }

        // Upload new images using the correct API function signature
        for (const newImage of newImages) {
          if (newImage.file) {
            //console.log(`Uploading new image for type ${imageMapping.typeName}`);

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

  const handleSave = async ({ skipNavigation = false, suppressSuccessToast = false } = {}) => {
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
        //console.log('PM Report Form RTU ID not found in form data, fetching from API...');
        const apiResponse = await getRTUPMReportForm(id);
        pmReportFormRTUID = apiResponse.pmReportFormRTU?.id || apiResponse.pmReportFormRTUID;
      }

      if (!reportFormId) {
        throw new Error('Report Form ID not found in URL parameters');
      }

      if (!pmReportFormRTUID) {
        throw new Error('PM Report Form RTU ID not found. Please ensure the report has been properly created.');
      }

      //console.log('Starting sequential API updates for Report Form ID:', reportFormId);
      //console.log('PM Report Form RTU ID:', pmReportFormRTUID);

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

      //console.log('Step 1: Updating Report Form with data:', reportFormData);
      const reportFormResponse = await updateReportForm(reportFormId, reportFormData);
      //console.log('Step 1 completed:', reportFormResponse);

      // Step 2: Update PM Report Form RTU basic data
      setSaveProgress('Updating RTU PM basic data...');

      // Helper function to convert empty string to null for date fields
      const formatDateForAPI = (dateValue) => {
        if (!dateValue || dateValue === '') return null;
        return dateValue;
      };

      const pmReportFormRTUData = {
        formstatusID: rtuPMData.formstatusID || rtuPMData.pmReportFormRTU?.formstatusID,
        projectNo: rtuPMData.pmReportFormRTU?.projectNo || rtuPMData.projectNo,
        customer: rtuPMData.pmReportFormRTU?.customer || rtuPMData.customer,
        dateOfService: formatDateForAPI(rtuPMData.pmReportFormRTU?.dateOfService || rtuPMData.dateOfService),
        cleaningOfCabinet: rtuPMData.pmReportFormRTU?.cleaningOfCabinet || rtuPMData.cleaningOfCabinet || rtuPMData.cleaningStatus,
        remarks: rtuPMData.pmReportFormRTU?.remarks || rtuPMData.remarks,
        attendedBy: rtuPMData.pmReportFormRTU?.attendedBy || rtuPMData.attendedBy,
        approvedBy: rtuPMData.pmReportFormRTU?.approvedBy || rtuPMData.approvedBy,
        pmReportFormTypeID: rtuPMData.pmReportFormRTU?.pmReportFormTypeID || rtuPMData.pmReportFormTypeID
      };

      //console.log('Step 2: Updating PM Report Form RTU with data:', pmReportFormRTUData);
      const pmReportFormRTUResponse = await updatePMReportFormRTU(pmReportFormRTUID, pmReportFormRTUData);
      //console.log('Step 2 completed:', pmReportFormRTUResponse);

      // Step 3: Handle deletions first
      setSaveProgress('Processing deletions...');

      // Delete PM Main RTU Cabinet records marked for deletion
      if (rtuPMData.pmMainRtuCabinet && rtuPMData.pmMainRtuCabinet.length > 0) {
        const recordsToDelete = rtuPMData.pmMainRtuCabinet.filter(record => record.isDeleted && record.ID);
        if (recordsToDelete.length > 0) {
          //console.log('Deleting PM Main RTU Cabinet records:', recordsToDelete);
          await Promise.all(recordsToDelete.map(record => deletePMMainRtuCabinet(record.ID)));
        }
      }

      // Delete PM Chamber Magnetic Contact records marked for deletion
      if (rtuPMData.pmChamberMagneticContact && rtuPMData.pmChamberMagneticContact.length > 0) {
        const recordsToDelete = rtuPMData.pmChamberMagneticContact.filter(record => record.isDeleted && record.ID);
        if (recordsToDelete.length > 0) {
          //console.log('Deleting PM Chamber Magnetic Contact records:', recordsToDelete);
          await Promise.all(recordsToDelete.map(record => deletePMChamberMagneticContact(record.ID)));
        }
      }

      // Delete PM RTU Cabinet Cooling records marked for deletion
      if (rtuPMData.pmRTUCabinetCooling && rtuPMData.pmRTUCabinetCooling.length > 0) {
        const recordsToDelete = rtuPMData.pmRTUCabinetCooling.filter(record => record.isDeleted && record.ID);
        if (recordsToDelete.length > 0) {
          //console.log('Deleting PM RTU Cabinet Cooling records:', recordsToDelete);
          await Promise.all(recordsToDelete.map(record => deletePMRTUCabinetCooling(record.ID)));
        }
      }

      // Delete PM DVR Equipment records marked for deletion
      if (rtuPMData.pmDVREquipment && rtuPMData.pmDVREquipment.length > 0) {
        const recordsToDelete = rtuPMData.pmDVREquipment.filter(record => record.isDeleted && record.ID);
        if (recordsToDelete.length > 0) {
          //console.log('Deleting PM DVR Equipment records:', recordsToDelete);
          await Promise.all(recordsToDelete.map(record => deletePMDVREquipment(record.ID)));
        }
      }

      // Step 4: Update PM Main RTU Cabinet data (exclude deleted records)
      if (rtuPMData.pmMainRtuCabinet && rtuPMData.pmMainRtuCabinet.length > 0) {
        setSaveProgress('Updating Main RTU Cabinet data...');
        const activeRecords = rtuPMData.pmMainRtuCabinet.filter(record => !record.isDeleted);
        if (activeRecords.length > 0) {
          //console.log('Step 4: Updating PM Main RTU Cabinet with data:', activeRecords);
          const pmMainRtuCabinetResponse = await updatePMMainRtuCabinet(pmReportFormRTUID, activeRecords);
          //console.log('Step 4 completed:', pmMainRtuCabinetResponse);
        }
      }

      // Step 5: Update PM Chamber Magnetic Contact data (exclude deleted records)
      if (rtuPMData.pmChamberMagneticContact && rtuPMData.pmChamberMagneticContact.length > 0) {
        setSaveProgress('Updating Chamber Magnetic Contact data...');
        const activeRecords = rtuPMData.pmChamberMagneticContact.filter(record => !record.isDeleted);
        if (activeRecords.length > 0) {
          //console.log('Step 5: Updating PM Chamber Magnetic Contact with data:', activeRecords);
          const pmChamberResponse = await updatePMChamberMagneticContact(pmReportFormRTUID, activeRecords);
          //console.log('Step 5 completed:', pmChamberResponse);
        }
      }

      // Step 6: Update PM RTU Cabinet Cooling data (exclude deleted records)
      if (rtuPMData.pmRTUCabinetCooling && rtuPMData.pmRTUCabinetCooling.length > 0) {
        setSaveProgress('Updating RTU Cabinet Cooling data...');
        const activeRecords = rtuPMData.pmRTUCabinetCooling.filter(record => !record.isDeleted);
        if (activeRecords.length > 0) {
          //console.log('Step 6: Updating PM RTU Cabinet Cooling with data:', activeRecords);
          const pmCoolingResponse = await updatePMRTUCabinetCooling(pmReportFormRTUID, activeRecords);
          //console.log('Step 6 completed:', pmCoolingResponse);
        }
      }

      // Step 7: Update PM DVR Equipment data (exclude deleted records)
      if (rtuPMData.pmDVREquipment && rtuPMData.pmDVREquipment.length > 0) {
        setSaveProgress('Updating DVR Equipment data...');
        const activeRecords = rtuPMData.pmDVREquipment.filter(record => !record.isDeleted);
        if (activeRecords.length > 0) {
          //console.log('Step 7: Updating PM DVR Equipment with data:', activeRecords);
          const pmDVRResponse = await updatePMDVREquipment(pmReportFormRTUID, activeRecords);
          //console.log('Step 7 completed:', pmDVRResponse);
        }
      }

      // Add image processing before the final navigation
      setSaveProgress('Processing image changes...');
      await processImageChanges(reportFormId);

      setSaveProgress('Save completed successfully!');

      // Show success toast (unless suppressed)
      if (!suppressSuccessToast) {
        setNotification({
          open: true,
          message: 'RTU PM Report Form updated successfully!',
          severity: 'success'
        });
      }

      // Navigate (unless skipped)
      if (!skipNavigation) {
        setTimeout(() => {
          navigate(`/report-management-system`);
        }, 1000);
      }

    } catch (error) {
      console.error('Error updating RTU PM report form:', error);
      setNotification({
        open: true,
        message: `Failed to update RTU PM Report Form: ${error.message || 'Unknown error'}`,
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
          {/* Header Section with Gradient */}
          <Paper sx={{
            padding: 4,
            marginBottom: 3,
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 50%, #1A252F 100%)',
            color: 'white',
            textAlign: 'center',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                marginBottom: 1,
                letterSpacing: '0.5px'
              }}
            >
              {rtuPMData.pmReportFormRTU?.reportTitle || 'Preventative Maintenance (RTU)'}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                opacity: 0.95,
                fontSize: '16px',
                fontWeight: 400
              }}
            >
              Review and submit the maintenance report below
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
                  {rtuPMData.jobNo || 'Not assigned'}
                </Typography>
              </Typography>
            </Box>
          </Paper>


          {/* Success/Error Messages */}
          {notification.severity === 'success' && notification.open && (
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
            <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold', marginBottom: 2 }}>
              📋 Basic Information
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Job Number"
                value={rtuPMData.jobNo || 'Not assigned'}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                    '& fieldset': {
                      borderColor: '#d0d0d0'
                    }
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    color: '#333',
                    WebkitTextFillColor: '#333'
                  }
                }}
              />

              <TextField
                fullWidth
                label="System Description"
                value={rtuPMData.systemNameWarehouseName || 'Not specified'}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                    '& fieldset': {
                      borderColor: '#d0d0d0'
                    }
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    color: '#333',
                    WebkitTextFillColor: '#333'
                  }
                }}
              />

              <TextField
                fullWidth
                label="Station Name"
                value={rtuPMData.stationNameWarehouseName || 'Not specified'}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                    '& fieldset': {
                      borderColor: '#d0d0d0'
                    }
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    color: '#333',
                    WebkitTextFillColor: '#333'
                  }
                }}
              />

              <TextField
                fullWidth
                label="Project No"
                value={rtuPMData.pmReportFormRTU?.projectNo || 'Not specified'}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                    '& fieldset': {
                      borderColor: '#d0d0d0'
                    }
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    color: '#333',
                    WebkitTextFillColor: '#333'
                  }
                }}
              />

              <TextField
                fullWidth
                label="Customer"
                value={rtuPMData.pmReportFormRTU?.customer || 'Not specified'}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                    '& fieldset': {
                      borderColor: '#d0d0d0'
                    }
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    color: '#333',
                    WebkitTextFillColor: '#333'
                  }
                }}
              />

              <TextField
                fullWidth
                label="Report Form Type"
                value="Preventative Maintenance"
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                    '& fieldset': {
                      borderColor: '#d0d0d0'
                    }
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    color: '#333',
                    WebkitTextFillColor: '#333'
                  }
                }}
              />

              <TextField
                fullWidth
                label="PM Report Form Type"
                value={rtuPMData.pmReportFormRTU?.pmReportFormTypeName || 'RTU'}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                    '& fieldset': {
                      borderColor: '#d0d0d0'
                    }
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    color: '#333',
                    WebkitTextFillColor: '#333'
                  }
                }}
              />
            </Box>
          </Paper>

          {/* Form Status Section */}
          <Paper sx={{ padding: 3, marginBottom: 3 }}>
            <Typography
              variant="h5"
              sx={{
                color: '#1976d2',
                fontWeight: 'bold',
                marginBottom: 2
              }}
            >
              ✓ Form Status
            </Typography>

            <TextField
              fullWidth
              label="Form Status"
              value={rtuPMData.pmReportFormRTU?.formStatusName ||
                rtuPMData.formStatusName ||
                rtuPMData.pmReportFormRTU?.statusName ||
                rtuPMData.statusName ||
                'Not specified'}
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  '& fieldset': {
                    borderColor: '#d0d0d0'
                  }
                },
                '& .MuiInputBase-input.Mui-disabled': {
                  color: '#333',
                  WebkitTextFillColor: '#333'
                }
              }}
            />
          </Paper>

          {/* Date of Service Section */}
          <Paper sx={{ padding: 3, marginBottom: 3 }}>
            <Typography
              variant="h5"
              sx={{
                color: '#1976d2',
                fontWeight: 'bold',
                marginBottom: 2
              }}
            >
              📅 Date of Service
            </Typography>

            <TextField
              fullWidth
              label="Service Date & Time"
              value={formatDate(rtuPMData.pmReportFormRTU?.dateOfService)}
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  '& fieldset': {
                    borderColor: '#d0d0d0'
                  }
                },
                '& .MuiInputBase-input.Mui-disabled': {
                  color: '#333',
                  WebkitTextFillColor: '#333'
                }
              }}
            />
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
            marginBottom: 3
          }}>
            <Typography
              variant="h5"
              sx={{
                marginBottom: 2,
                color: '#1976d2',
                fontWeight: 'bold'
              }}
            >
              🧹 Cleaning of Cabinet / Equipment
            </Typography>
            <TextField
              fullWidth
              label="Cleaning Status"
              value={rtuPMData.pmReportFormRTU?.cleaningOfCabinet || 'Not specified'}
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  '& fieldset': {
                    borderColor: '#d0d0d0'
                  }
                },
                '& .MuiInputBase-input.Mui-disabled': {
                  color: '#333',
                  WebkitTextFillColor: '#333'
                }
              }}
            />
          </Paper>

          {/* Remarks Section */}
          <Paper sx={{
            padding: 3,
            marginBottom: 3
          }}>
            <Typography
              variant="h5"
              sx={{
                marginBottom: 2,
                color: '#1976d2',
                fontWeight: 'bold'
              }}
            >
              📝 Remarks
            </Typography>
            <TextField
              fullWidth
              label="Remarks"
              multiline
              rows={3}
              value={rtuPMData.pmReportFormRTU?.remarks || ''}
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  '& fieldset': {
                    borderColor: '#d0d0d0'
                  }
                },
                '& .MuiInputBase-input.Mui-disabled': {
                  color: '#333',
                  WebkitTextFillColor: '#333'
                }
              }}
            />
          </Paper>

          {/* Approval Information Section */}
          <Paper sx={{
            padding: 3,
            marginBottom: 3
          }}>
            <Typography
              variant="h5"
              sx={{
                marginBottom: 2,
                color: '#1976d2',
                fontWeight: 'bold'
              }}
            >
              ✅ Approval Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Attended By"
                value={rtuPMData.pmReportFormRTU?.attendedBy || ''}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                    '& fieldset': {
                      borderColor: '#d0d0d0'
                    }
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    color: '#333',
                    WebkitTextFillColor: '#333'
                  }
                }}
              />

              <TextField
                fullWidth
                label="Approved By"
                value={rtuPMData.pmReportFormRTU?.approvedBy || ''}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                    '& fieldset': {
                      borderColor: '#d0d0d0'
                    }
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    color: '#333',
                    WebkitTextFillColor: '#333'
                  }
                }}
              />
            </Box>
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
                onClick={handleSubmit}
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
      {/* Final Report Upload Dialog with Tabs */}
      <Dialog
        open={finalReportDialogOpen}
        onClose={handleCloseFinalReportDialog}
        fullWidth
        maxWidth="xs"
        TransitionComponent={Fade}
        transitionDuration={{ enter: 400, exit: 250 }}
        PaperProps={{
          sx: {
            minWidth: 320,
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'linear-gradient(180deg, rgba(28,35,57,0.95) 0%, rgba(9,14,28,0.95) 80%)',
            boxShadow: '0 25px 70px rgba(8,15,31,0.55)',
            overflow: 'hidden'
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)'
          }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            color: '#f8fafc',
            pb: 0
          }}
        >
          Close Report
        </DialogTitle>
        
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            setFinalReportUploadError(''); // Clear errors when switching tabs
          }}
          centered
          sx={{
            borderBottom: '1px solid rgba(226,232,240,0.2)',
            '& .MuiTab-root': {
              color: 'rgba(226,232,240,0.6)',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '14px',
              minHeight: '48px',
              '&.Mui-selected': {
                color: '#4ade80',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#4ade80',
              height: '3px'
            }
          }}
        >
          <Tab 
            icon={<UploadFileIcon sx={{ fontSize: 20 }} />} 
            iconPosition="start"
            label="Upload PDF Report" 
          />
          <Tab 
            icon={<BrushIcon sx={{ fontSize: 20 }} />} 
            iconPosition="start"
            label="Provide Signatures" 
          />
        </Tabs>

        <DialogContent
          sx={{
            py: 3,
            px: 4
          }}
        >
          {/* Tab Panel 0: Final Report PDF Upload */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'rgba(241,245,249,0.85)' }}>
                Upload the completed Final Report PDF to close this report.
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  width: '100%',
                  py: 2,
                  borderColor: finalReportFile ? '#4ade80' : 'rgba(226,232,240,0.5)',
                  color: finalReportFile ? '#4ade80' : '#e2e8f0',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#cbd5f5',
                    backgroundColor: 'rgba(148,163,184,0.15)'
                  }
                }}
              >
                {finalReportFile ? finalReportFile.name : 'Select PDF File'}
                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={handleFinalReportFileChange}
                />
              </Button>
              {finalReportFile && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 1, 
                    textAlign: 'center', 
                    color: '#4ade80' 
                  }}
                >
                  ✓ File selected: {finalReportFile.name}
                </Typography>
              )}
            </Box>
          )}

          {/* Tab Panel 1: Signature Uploads or Drawing */}
          {activeTab === 1 && (
            <Box>
            {/* Attended By Signature */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(241,245,249,0.85)', fontWeight: 600 }}>
                  Attended By Signature
                  {rtuPMData?.pmReportFormRTU?.attendedBy && (
                    <Typography component="span" sx={{ ml: 1, color: '#4ade80', fontSize: '13px' }}>
                      ({rtuPMData.pmReportFormRTU.attendedBy})
                    </Typography>
                  )}
                </Typography>
                <ToggleButtonGroup
                  value={attendedByMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setAttendedByMode(newMode)}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      color: 'rgba(226,232,240,0.7)',
                      borderColor: 'rgba(226,232,240,0.3)',
                      py: 0.5,
                      px: 1.5,
                      fontSize: '12px',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(74,222,128,0.2)',
                        color: '#4ade80',
                        borderColor: '#4ade80',
                        '&:hover': {
                          backgroundColor: 'rgba(74,222,128,0.3)',
                        }
                      }
                    }
                  }}
                >
                  <ToggleButton value="draw">
                    <BrushIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Draw
                  </ToggleButton>
                  <ToggleButton value="upload">
                    <PhotoCamera sx={{ fontSize: 16, mr: 0.5 }} />
                    Upload
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {attendedByMode === 'draw' ? (
                <Box>
                  <Box sx={{ 
                    border: '2px solid rgba(226,232,240,0.3)', 
                    borderRadius: 2, 
                    backgroundColor: 'white',
                    cursor: 'crosshair'
                  }}>
                    <canvas
                      ref={attendedByCanvasRef}
                      width={400}
                      height={150}
                      onMouseDown={startDrawing(attendedByCanvasRef, setIsDrawingAttended)}
                      onMouseMove={draw(attendedByCanvasRef, isDrawingAttended)}
                      onMouseUp={stopDrawing(setIsDrawingAttended)}
                      onMouseLeave={stopDrawing(setIsDrawingAttended)}
                      style={{ display: 'block', width: '100%', height: '150px' }}
                    />
                  </Box>
                  <Button
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={() => clearCanvas(attendedByCanvasRef)}
                    sx={{ 
                      mt: 1, 
                      color: 'rgba(226,232,240,0.7)',
                      textTransform: 'none',
                      fontSize: '12px'
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      width: '100%',
                      py: 1.5,
                      borderColor: attendedBySignature ? '#4ade80' : 'rgba(226,232,240,0.5)',
                      color: attendedBySignature ? '#4ade80' : '#e2e8f0',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#cbd5f5',
                        backgroundColor: 'rgba(148,163,184,0.15)'
                      }
                    }}
                  >
                    {attendedBySignature ? attendedBySignature.name : 'Select Signature Image'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAttendedBySignatureChange}
                    />
                  </Button>
                  {attendedBySignaturePreview && (
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <img 
                        src={attendedBySignaturePreview} 
                        alt="Attended By Signature" 
                        style={{ maxWidth: '200px', maxHeight: '100px', border: '1px solid rgba(226,232,240,0.3)', borderRadius: '4px' }}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Approved By Signature */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(241,245,249,0.85)', fontWeight: 600 }}>
                  Approved By Signature
                  {rtuPMData?.pmReportFormRTU?.approvedBy && (
                    <Typography component="span" sx={{ ml: 1, color: '#4ade80', fontSize: '13px' }}>
                      ({rtuPMData.pmReportFormRTU.approvedBy})
                    </Typography>
                  )}
                </Typography>
                <ToggleButtonGroup
                  value={approvedByMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setApprovedByMode(newMode)}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      color: 'rgba(226,232,240,0.7)',
                      borderColor: 'rgba(226,232,240,0.3)',
                      py: 0.5,
                      px: 1.5,
                      fontSize: '12px',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(74,222,128,0.2)',
                        color: '#4ade80',
                        borderColor: '#4ade80',
                        '&:hover': {
                          backgroundColor: 'rgba(74,222,128,0.3)',
                        }
                      }
                    }
                  }}
                >
                  <ToggleButton value="draw">
                    <BrushIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Draw
                  </ToggleButton>
                  <ToggleButton value="upload">
                    <PhotoCamera sx={{ fontSize: 16, mr: 0.5 }} />
                    Upload
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {approvedByMode === 'draw' ? (
                <Box>
                  <Box sx={{ 
                    border: '2px solid rgba(226,232,240,0.3)', 
                    borderRadius: 2, 
                    backgroundColor: 'white',
                    cursor: 'crosshair'
                  }}>
                    <canvas
                      ref={approvedByCanvasRef}
                      width={400}
                      height={150}
                      onMouseDown={startDrawing(approvedByCanvasRef, setIsDrawingApproved)}
                      onMouseMove={draw(approvedByCanvasRef, isDrawingApproved)}
                      onMouseUp={stopDrawing(setIsDrawingApproved)}
                      onMouseLeave={stopDrawing(setIsDrawingApproved)}
                      style={{ display: 'block', width: '100%', height: '150px' }}
                    />
                  </Box>
                  <Button
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={() => clearCanvas(approvedByCanvasRef)}
                    sx={{ 
                      mt: 1, 
                      color: 'rgba(226,232,240,0.7)',
                      textTransform: 'none',
                      fontSize: '12px'
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      width: '100%',
                      py: 1.5,
                      borderColor: approvedBySignature ? '#4ade80' : 'rgba(226,232,240,0.5)',
                      color: approvedBySignature ? '#4ade80' : '#e2e8f0',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#cbd5f5',
                        backgroundColor: 'rgba(148,163,184,0.15)'
                      }
                    }}
                  >
                    {approvedBySignature ? approvedBySignature.name : 'Select Signature Image'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleApprovedBySignatureChange}
                    />
                  </Button>
                  {approvedBySignaturePreview && (
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <img 
                        src={approvedBySignaturePreview} 
                        alt="Approved By Signature" 
                        style={{ maxWidth: '200px', maxHeight: '100px', border: '1px solid rgba(226,232,240,0.3)', borderRadius: '4px' }}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
          )}

          {/* Error Message */}
          {finalReportUploadError && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {finalReportUploadError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: 4,
            pb: 3
          }}
        >
          <Button
            onClick={handleCloseFinalReportDialog}
            disabled={finalReportUploading}
            sx={{
              background: RMSTheme.components.button.secondary?.background || '#6c757d',
              color: RMSTheme.components.button.secondary?.text || 'white',
              padding: '10px 28px',
              borderRadius: RMSTheme.borderRadius?.small || '8px',
              textTransform: 'none',
              mr: 2,
              '&:hover': { background: RMSTheme.components.button.secondary?.hover || '#5a6268' },
              '&:disabled': { opacity: 0.6 }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadFinalReport}
            disabled={finalReportUploading}
            sx={{
              background: RMSTheme.components.button.primary?.background || '#28a745',
              color: RMSTheme.components.button.primary?.text || 'white',
              padding: '10px 28px',
              borderRadius: RMSTheme.borderRadius?.small || '8px',
              textTransform: 'none',
              '&:hover': { background: RMSTheme.components.button.primary?.hover || '#218838' },
              '&:disabled': { opacity: 0.6 }
            }}
          >
            {finalReportUploading ? 'Submitting...' : (activeTab === 0 ? 'Upload & Close Report' : 'Submit Signatures & Close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Download Confirmation Modal */}
      <DownloadConfirmationModal
        open={downloadConfirmModalOpen}
        onCancel={handleModalCancel}
        onCreateOnly={handleUpdateOnly}
        onDownload={handleDownloadConfirm}
        loading={isDownloading}
        createOnlyLabel="Update Report Only"
      />
    </Box>

  );
};

export default RTUPMReviewReportFormEdit;
