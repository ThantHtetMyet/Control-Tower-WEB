import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  Card,
  Modal,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Comment as CommentIcon,
  Close as CloseIcon,
  UploadFile as UploadFileIcon,
  Brush as BrushIcon,
  Clear as ClearIcon,
  PhotoCamera
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import moment from 'moment';
import RMSTheme from '../../theme-resource/RMSTheme';
import DownloadConfirmationModal from '../../common/DownloadConfirmationModal';
import {
  getCMReportForm,
  updateCMReportForm,
  getCMMaterialUsed,
  updateCMMaterialUsed,
  deleteCMMaterialUsed,
  updateReportForm,
  createCMMaterialUsed,
  createReportFormImage,
  deleteReportFormImage,
  getReportFormImageTypes,
  uploadFinalReportAttachment,
  generateCMReportPdf,
  generateCMFinalReportPdf,
  getFinalReportsByReportForm,
  downloadFinalReportAttachment
} from '../../api-services/reportFormService';
import warehouseService from '../../api-services/warehouseService';
import { API_BASE_URL } from '../../../config/apiConfig';

// ImagePreviewSection Component with animations - Updated to handle mixed image data
const ImagePreviewSection = ({ title, images }) => {
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
    return (
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6" sx={{ marginBottom: 2, color: '#2C3E50', fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No images available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ marginBottom: 3 }}>
      <Typography variant="h6" sx={{ marginBottom: 2, color: '#2C3E50', fontWeight: 600 }}>
        {title} ({images.length})
      </Typography>
      <Grid container spacing={2}>
        {images.map((image, index) => {
          // Safely determine the image source - Following RTU PM pattern
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
            } else if (typeof image.file === 'object' && image.file.name) {
              // File data object with name property
              try {
                imageSrc = URL.createObjectURL(image.file);
                imageAlt = image.file.name || `Image ${index + 1}`;
                imageName = image.file.name || `Image ${index + 1}`;
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
          } else if (image.id && image.imageName) {
            // Handle case where image might be from database but structured differently
            imageSrc = `${API_BASE_URL}/api/ReportFormImage/image/${image.id}/${image.imageName}`;
            imageAlt = image.imageName;
            imageName = image.imageName;
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
            <Grid item xs={6} sm={4} md={3} key={image.id || index}>
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
                    console.error('Failed to load image:', imageSrc);
                    e.target.style.display = 'none';
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
        })}
      </Grid>

      {/* Modal for enlarged image view */}
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
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 2
          }}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
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
                maxHeight: '80vh',
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

const CMReviewReportFormEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // Add this line to get current user
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Add state for save progress
  const [saveProgress, setSaveProgress] = useState('');

  // Add state to track original images for comparison
  const [originalImages, setOriginalImages] = useState({
    beforeIssueImages: [],
    afterActionImages: [],
    materialUsedOldSerialImages: [],
    materialUsedNewSerialImages: []
  });

  // Add state for CM Report Form ID
  const [cmReportFormId, setCmReportFormId] = useState(null);

  // Dropdown data states
  const [warehouseData, setWarehouseData] = useState({
    furtherActions: [],
    formStatuses: []
  });

  // Form data state
  const [formData, setFormData] = useState({
    customer: '',
    projectNo: '',
    jobNo: '',
    reportTitle: '',
    reportFormTypeName: '',
    reportFormTypeID: '',
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
    furtherActionTakenName: '',
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

  const [finalReportDialogOpen, setFinalReportDialogOpen] = useState(false);
  const [finalReportFile, setFinalReportFile] = useState(null);
  const [downloadConfirmModalOpen, setDownloadConfirmModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [finalReportUploading, setFinalReportUploading] = useState(false);
  const [finalReportUploadError, setFinalReportUploadError] = useState('');
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

  const formatDisplayDate = (date) => {
    if (!date) return '';
    return moment(date).format('DD/MM/YYYY HH:mm');
  };

  const formStatusOptions = warehouseData.formStatuses || [];
  const selectedFormStatus = formStatusOptions.find(
    (status) => (status.id || status.ID) === (formData.formstatusID || formData.formStatusID)
  );
  const formStatusDisplayName =
    formData.formStatusName ||
    selectedFormStatus?.name ||
    selectedFormStatus?.Name ||
    '';
  const isStatusClose = (formStatusDisplayName || '').trim().toLowerCase() === 'close';

  // Load warehouse data
  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        const data = await warehouseService.getAllWarehouseData();
        setWarehouseData(data);
      } catch (error) {
        console.error('Error fetching warehouse data:', error);
      }
    };

    fetchWarehouseData();
  }, []);



  // Load CM report form data - Following RTU PM pattern
  useEffect(() => {
    const fetchCMReportForm = async () => {
      try {
        setLoading(true);
        
        // Check if form data was passed from edit page - Following RTU PM pattern
        if (location.state && location.state.formData) {
          const passedData = location.state.formData;
          
          setFormData({
            customer: passedData.customer || '',
            projectNo: passedData.projectNo || '',
            jobNo: passedData.jobNo || '',
            reportTitle: passedData.reportTitle || '',
            reportFormTypeName: passedData.reportFormTypeName || '',
            reportFormTypeID: passedData.reportFormTypeID || '', // Add this line
            stationName: passedData.stationName || '',
            stationNameWarehouseID: passedData.stationNameWarehouseID || '',
            stationNameWarehouseName: passedData.stationNameWarehouseName || '',
            systemDescription: passedData.systemDescription || '',
            systemNameWarehouseID: passedData.systemNameWarehouseID || '',
            systemNameWarehouseName: passedData.systemNameWarehouseName || '',
            issueReportedDescription: passedData.issueReportedDescription || '',
            issueFoundDescription: passedData.issueFoundDescription || '',
            actionTakenDescription: passedData.actionTakenDescription || '',
            failureDetectedDate: passedData.failureDetectedDate,
            responseDate: passedData.responseDate,
            arrivalDate: passedData.arrivalDate,
            completionDate: passedData.completionDate,
            attendedBy: passedData.attendedBy || '',
            approvedBy: passedData.approvedBy || '',
            remark: passedData.remark || '',
            furtherActionTakenID: passedData.furtherActionTakenID || '',
            furtherActionTakenName: passedData.furtherActionTakenName || '',
            formstatusID: passedData.formstatusID || '',
            formStatusName: passedData.formStatusName || passedData.formstatusName || ''
          });

          // Set image data from passed data
          console.log('=== Image Data Debug ===');
          console.log('passedData.afterActionImages:', passedData.afterActionImages);
          console.log('Images with file property:', passedData.afterActionImages?.filter(img => img.file)?.length || 0);
          console.log('passedData.originalImages?.afterActionImages:', passedData.originalImages?.afterActionImages);
          
          if (passedData.beforeIssueImages) {
            console.log('Before Issue Images - with file:', passedData.beforeIssueImages.filter(img => img.file).length);
            setBeforeIssueImages(passedData.beforeIssueImages);
            // Use passed original images if available, otherwise use current as original
            const originalBeforeImages = passedData.originalImages?.beforeIssueImages || passedData.beforeIssueImages;
            setOriginalImages(prev => ({ ...prev, beforeIssueImages: [...originalBeforeImages] }));
          }
          if (passedData.afterActionImages) {
            console.log('After Action Images - total:', passedData.afterActionImages.length);
            console.log('After Action Images - with file:', passedData.afterActionImages.filter(img => img.file).length);
            setAfterActionImages(passedData.afterActionImages);
            const originalAfterImages = passedData.originalImages?.afterActionImages || passedData.afterActionImages;
            setOriginalImages(prev => ({ ...prev, afterActionImages: [...originalAfterImages] }));
          }
          if (passedData.materialUsedOldSerialImages) {
            setMaterialUsedOldSerialImages(passedData.materialUsedOldSerialImages);
            const originalOldSerialImages = passedData.originalImages?.materialUsedOldSerialImages || passedData.materialUsedOldSerialImages;
            setOriginalImages(prev => ({ ...prev, materialUsedOldSerialImages: [...originalOldSerialImages] }));
          }
          if (passedData.materialUsedNewSerialImages) {
            setMaterialUsedNewSerialImages(passedData.materialUsedNewSerialImages);
            const originalNewSerialImages = passedData.originalImages?.materialUsedNewSerialImages || passedData.materialUsedNewSerialImages;
            setOriginalImages(prev => ({ ...prev, materialUsedNewSerialImages: [...originalNewSerialImages] }));
          }
          if (passedData.materialUsedData) {
            setMaterialUsedData(passedData.materialUsedData);
          }
          if (passedData.cmReportFormId) {
            setCmReportFormId(passedData.cmReportFormId);
          }
          
          setLoading(false);
          return;
        }
        
        // Fallback: Fetch from API if no data was passed
        const response = await getCMReportForm(id);
        
        if (response && response.cmReportForm) {
          const cmData = response.cmReportForm;
          
          setFormData({
            customer: cmData.customer || '',
            projectNo: cmData.projectNo || '',
            jobNo: cmData.jobNo || '',
            reportTitle: cmData.reportTitle || response.reportTitle || '',
            reportFormTypeName: cmData.reportFormTypeName || '',
            reportFormTypeID: response.reportFormTypeID || cmData.reportFormTypeID || '',
            stationName: cmData.stationName || '',
            stationNameWarehouseID: cmData.stationNameWarehouseID || '',
            stationNameWarehouseName: cmData.stationNameWarehouseName || '',
            systemDescription: cmData.systemDescription || '',
            systemNameWarehouseID: cmData.systemNameWarehouseID || '',
            systemNameWarehouseName: cmData.systemNameWarehouseName || '',
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
            furtherActionTakenName: cmData.furtherActionTakenName || '',
            formstatusID: cmData.formstatusID || '',
            formStatusName: cmData.formStatusName || cmData.formstatusName || response.formStatus || ''
          });

          // Load images from API response
          if (response.beforeIssueImages) {
            const beforeImages = response.beforeIssueImages.map(img => ({
              id: img.id,
              imageUrl: `${API_BASE_URL}${img.imagePath}`,
              imageName: img.imageName
            }));
            setBeforeIssueImages(beforeImages);
            setOriginalImages(prev => ({ ...prev, beforeIssueImages: [...beforeImages] }));
          }

          if (response.afterActionImages) {
            const afterImages = response.afterActionImages.map(img => ({
              id: img.id,
              imageUrl: `${API_BASE_URL}${img.imagePath}`,
              imageName: img.imageName
            }));
            setAfterActionImages(afterImages);
            setOriginalImages(prev => ({ ...prev, afterActionImages: [...afterImages] }));
          }

          if (response.materialUsedOldSerialImages) {
            const oldSerialImages = response.materialUsedOldSerialImages.map(img => ({
              id: img.id,
              imageUrl: `${API_BASE_URL}${img.imagePath}`,
              imageName: img.imageName
            }));
            setMaterialUsedOldSerialImages(oldSerialImages);
            setOriginalImages(prev => ({ ...prev, materialUsedOldSerialImages: [...oldSerialImages] }));
          }

          if (response.materialUsedNewSerialImages) {
            const newSerialImages = response.materialUsedNewSerialImages.map(img => ({
              id: img.id,
              imageUrl: `${API_BASE_URL}${img.imagePath}`,
              imageName: img.imageName
            }));
            setMaterialUsedNewSerialImages(newSerialImages);
            setOriginalImages(prev => ({ ...prev, materialUsedNewSerialImages: [...newSerialImages] }));
          }

          // Load material used data from API
          if (cmData.id) {
            setCmReportFormId(cmData.id);
            const materialUsedResponse = await getCMMaterialUsed(cmData.id);
            if (materialUsedResponse && materialUsedResponse.length > 0) {
              setMaterialUsedData(materialUsedResponse);
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
  }, [id, location.state]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
        setFinalReportUploadError('Please upload a Final Report PDF.');
        return;
      }
    } else {
      // Signatures tab - validate both signatures
      const hasBothSignatures = !!attendedBySignatureToUpload && !!approvedBySignatureToUpload;
      
      if (!hasBothSignatures) {
        if (!attendedBySignatureToUpload && !approvedBySignatureToUpload) {
          setFinalReportUploadError('Please provide both signatures (Attended By and Approved By).');
          return;
        }
        if (attendedBySignatureToUpload && !approvedBySignatureToUpload) {
          setFinalReportUploadError('Please also provide Approved By signature.');
          return;
        }
        if (!attendedBySignatureToUpload && approvedBySignatureToUpload) {
          setFinalReportUploadError('Please also provide Attended By signature.');
          return;
        }
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
          console.log(`Generating final report PDF for ReportForm ID: ${reportFormId}`);
          await generateCMFinalReportPdf(reportFormId);
          console.log('Final report PDF generated successfully');
        } catch (pdfError) {
          console.error('Error generating final report PDF:', pdfError);
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
          ? 'CM Report and Final Report saved successfully!' 
          : 'CM Report saved! Final report PDF is being generated...',
        severity: 'success'
      });

      // Auto-download the final report after a delay
      setTimeout(async () => {
        try {
          await downloadSavedFinalReport(reportFormId, formData.jobNo);
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

  // Handle when user clicks "Create Report Only" - save without downloading
  const handleCreateOnly = async () => {
    try {
      setIsDownloading(true);
      setDownloadConfirmModalOpen(false);
      await handleSave();
    } catch (error) {
      console.error('Error during report creation:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle when user clicks "Download Report" - save and download
  const handleDownloadConfirm = async () => {
    try {
      setIsDownloading(true);
      setDownloadConfirmModalOpen(false);

      console.log('=== Starting save and download process ===');
      
      // Save the report first (skip navigation and success toast)
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

  // Download report function using the same approach as CMReportFormDetails
  const handleDownloadReport = async (reportFormId) => {
    try {
      console.log(`Generating CM report PDF for ReportForm ID: ${reportFormId}`);

      const response = await generateCMReportPdf(reportFormId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      // Extract filename from response headers or use default
      const disposition = response.headers['content-disposition'];
      let fileName = `CMReport_${formData?.jobNo || reportFormId}.pdf`;
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

      console.log('CM Report PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating CM report PDF:', error);
      const errorMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : error.message) ||
        'Failed to generate PDF report.';
      console.error('Error details:', errorMessage);
      throw error; // Re-throw to be caught by handleDownloadConfirm
    }
  };

  // Process image changes - Following RTU PM pattern
  const processImageChanges = async (reportFormId) => {
    try {
      // Get image types
      const imageTypes = await getReportFormImageTypes();
      
      // Define image mappings for CM Report Form
      // NOTE: sectionName MUST match what backend expects in StoredDirectory query
      const imageMappings = [
        {
          current: beforeIssueImages,
          original: originalImages.beforeIssueImages,
          typeName: 'CMBeforeIssueImage',
          sectionName: 'CMBeforeIssueImage'
        },
        {
          current: afterActionImages,
          original: originalImages.afterActionImages,
          typeName: 'CMAfterIssueImage',
          sectionName: 'CMAfterIssueImage'  // Changed from 'CMAfterAction' to match backend query
        },
        {
          current: materialUsedOldSerialImages,
          original: originalImages.materialUsedOldSerialImages,
          typeName: 'CMMaterialUsedOldSerialNo',
          sectionName: 'CMMaterialUsedOldSerialNo'
        },
        {
          current: materialUsedNewSerialImages,
          original: originalImages.materialUsedNewSerialImages,
          typeName: 'CMMaterialUsedNewSerialNo',
          sectionName: 'CMMaterialUsedNewSerialNo'
        }
      ];

      // Process each image section
      for (const imageMapping of imageMappings) {
        const imageType = imageTypes.find(type => type.imageTypeName === imageMapping.typeName);
        if (!imageType) {
          console.warn(`Image type ${imageMapping.typeName} not found`);
          continue;
        }

        const currentImages = imageMapping.current || [];
        const originalImagesForSection = imageMapping.original || [];

        console.log(`Processing ${imageMapping.typeName}:`, {
          currentCount: currentImages.length,
          originalCount: originalImagesForSection.length,
          newImagesCount: currentImages.filter(img => img.file).length
        });

        // Find deleted images (in original but not in current)
        const deletedImages = originalImagesForSection.filter(originalImg => 
          !currentImages.some(currentImg => currentImg.id === originalImg.id)
        );

        // Find new images (have file property)
        const newImages = currentImages.filter(img => img.file);
        
        console.log(`New images to upload for ${imageMapping.typeName}:`, newImages.length);

        // Delete removed images
        for (const deletedImage of deletedImages) {
          if (deletedImage.id) {
            console.log(`Deleting image: ${deletedImage.imageName}`);
            await deleteReportFormImage(deletedImage.id);
          }
        }

        // Upload new images
        for (const newImage of newImages) {
          if (newImage.file) {
            console.log(`Uploading new image for type ${imageMapping.typeName}:`, newImage.file.name);
            
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

  // Handle save - Following RTU PM pattern
  const handleSave = async ({ skipNavigation = false, suppressSuccessToast = false } = {}) => {
    try {
      setSaving(true);
      setError(null);
      setSaveProgress('Starting save process...');
      
      // Get the Report Form ID from URL parameter
      const reportFormId = id;
      
      if (!reportFormId) {
        throw new Error('Report Form ID not found in URL parameters');
      }

      if (!cmReportFormId) {
        throw new Error('CM Report Form ID not found. Please ensure the report has been properly created.');
      }

      // Helper function to convert empty strings to null for GUID fields
      const toNullableGuid = (value) => (value && value.trim() !== '') ? value : null;
      
      // Step 1: Update ReportForm table first
      setSaveProgress('Updating Report Form basic data...');
      const reportFormData = {
        ReportFormTypeID: toNullableGuid(formData.reportFormTypeID),
        JobNo: formData.jobNo || '',
        SystemNameWarehouseID: toNullableGuid(formData.systemNameWarehouseID),
        StationNameWarehouseID: toNullableGuid(formData.stationNameWarehouseID),
        UploadStatus: formData.uploadStatus || 'Pending',
        UploadHostname: formData.uploadHostname || '',
        UploadIPAddress: formData.uploadIPAddress || '',
        FormStatus: formData.formStatus || 'Draft'
      };
      
      const reportFormResponse = await updateReportForm(reportFormId, reportFormData);
      
      // Step 2: Update CMReportForm data
      setSaveProgress('Updating CM Report Form data...');
      
      // Helper function to convert date to ISO string or null
      const toISOStringOrNull = (date) => {
        if (!date) return null;
        if (date instanceof Date) return date.toISOString();
        if (typeof date === 'string') return new Date(date).toISOString();
        return null;
      };
      
      const cmReportFormData = {
        furtherActionTakenID: toNullableGuid(formData.furtherActionTakenID),
        formstatusID: toNullableGuid(formData.formstatusID),
        customer: formData.customer || '',
        projectNo: formData.projectNo || '',
        issueReportedDescription: formData.issueReportedDescription || '',
        issueFoundDescription: formData.issueFoundDescription || '',
        actionTakenDescription: formData.actionTakenDescription || '',
        failureDetectedDate: toISOStringOrNull(formData.failureDetectedDate),
        responseDate: toISOStringOrNull(formData.responseDate),
        arrivalDate: toISOStringOrNull(formData.arrivalDate),
        completionDate: toISOStringOrNull(formData.completionDate),
        attendedBy: formData.attendedBy || '',
        approvedBy: formData.approvedBy || '',
        remark: formData.remark || ''
      };
      
      const cmReportFormResponse = await updateCMReportForm(cmReportFormId, cmReportFormData);
      
      // Step 3: Handle Material Used deletions first
      if (materialUsedData && materialUsedData.length > 0) {
        setSaveProgress('Processing Material Used deletions...');
        
        // Delete material used records marked for deletion
        const recordsToDelete = materialUsedData.filter(record => record.isDeleted && record.id);
        if (recordsToDelete.length > 0) {
          await Promise.all(recordsToDelete.map(record => deleteCMMaterialUsed(record.id)));
        }

        // Step 4: Update Material Used data (exclude deleted records)
        setSaveProgress('Updating Material Used data...');
        const activeRecords = materialUsedData.filter(record => !record.isDeleted);
        
        // For each active material used item, create or update
        for (const materialItem of activeRecords) {
          if (materialItem.id) {
            // Update existing material used item
            const materialUsedItemData = {
              cmReportFormID: cmReportFormId,
              itemDescription: materialItem.itemDescription,
              newSerialNo: materialItem.newSerialNo,
              oldSerialNo: materialItem.oldSerialNo,
              remark: materialItem.remark,
              updatedBy: user?.id // Use current user's ID
            };
            await updateCMMaterialUsed(materialItem.id, materialUsedItemData);
          } else {
            // Create new material used item
            const materialUsedItemData = {
              cmReportFormID: cmReportFormId,
              itemDescription: materialItem.itemDescription,
              newSerialNo: materialItem.newSerialNo,
              oldSerialNo: materialItem.oldSerialNo,
              remark: materialItem.remark,
              createdBy: user?.id // Use current user's ID
            };
           await createCMMaterialUsed(materialUsedItemData);
          }
        }
        }

      // Step 5: Process image changes
      setSaveProgress('Processing image changes...');
      await processImageChanges(reportFormId);

      setSaveProgress('Save completed successfully!');
      
      if (!suppressSuccessToast) {
        setNotification({
          open: true,
          message: 'CM Report Form updated successfully!',
          severity: 'success'
        });
      }

      if (!skipNavigation) {
        setTimeout(() => {
          navigate('/report-management-system');
        }, 2000);
      }

    } catch (error) {
      console.error('Error updating CM report form:', error);
      setNotification({
        open: true,
        message: `Failed to update CM Report Form: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
      setSaveProgress('');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/report-management-system');
  };

  // Handle close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
                    Review Changes
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
            
            {/* Basic Information Summary Section */}
            <Paper sx={{
              ...sectionContainerStyle,
              background: '#f8f9fa',
              border: '2px solid #e9ecef'
            }}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                📋 Basic Information
              </Typography>
              
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Station Name"
                    value={formData.stationName || ''}
                    disabled
                    sx={fieldStyle}
                  />
                
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
                  </Box>
            </Paper>           
            
            {/* Date & Time Information */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                📅 Date & Time Information
              </Typography>
              
              <Grid container spacing={3} sx={{ marginTop: 1 }}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Failure Detected Date"
                    value={formData.failureDetectedDate ? formatDisplayDate(formData.failureDetectedDate) : 'N/A'}
                    disabled
                    sx={fieldStyle}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Response Date"
                    value={formData.responseDate ? formatDisplayDate(formData.responseDate) : 'N/A'}
                    disabled
                    sx={fieldStyle}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Arrival Date"
                    value={formData.arrivalDate ? formatDisplayDate(formData.arrivalDate) : 'N/A'}
                    disabled
                    sx={fieldStyle}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Completion Date"
                    value={formData.completionDate ? formatDisplayDate(formData.completionDate) : 'N/A'}
                    disabled
                    sx={fieldStyle}
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
                📝 Issue Details
              </Typography> 
              
              {/* Issue Reported Description */} 
              <Paper sx={{ padding: 2, marginBottom: 3, border: '1px solid #e0e0e0' }}> 
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Issue Reported Description"
                  value={formData.issueReportedDescription || 'N/A'}
                  disabled
                  sx={fieldStyle}
                />

                {/* Before Issue Images */} 
                <Box sx={{ marginTop: 2 }}> 
                  <ImagePreviewSection
                    title="Before Issue Images"
                    images={beforeIssueImages}
                  />
                </Box> 
              </Paper> 
              
              {/* Issue Found Description */} 
              <Paper sx={{ padding: 2, marginBottom: 3, border: '1px solid #e0e0e0' }}> 
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Issue Found Description"
                  value={formData.issueFoundDescription || 'N/A'}
                  disabled
                  sx={fieldStyle}
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
                  🔧 Action Taken 
                </Typography> 
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Action Taken Description"
                  value={formData.actionTakenDescription || 'N/A'}
                  disabled
                  sx={fieldStyle}
                />
                {/* After Action Images */} 
                <Box sx={{ marginTop: 2 }}> 
                  <ImagePreviewSection
                    title="After Action Images"
                    images={afterActionImages}
                  />
                </Box> 
              </Paper> 
            </Paper>

            {/* Material Used Information */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                🔩 Material Used Information
              </Typography>
              
              <TableContainer component={Paper} sx={{ marginBottom: 3, marginTop: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Item Description</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>New Serial No</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Old Serial No</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Remark</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {materialUsedData.length > 0 ? (
                      materialUsedData
                        .filter(row => !row.isDeleted) // Only show non-deleted rows in read-only mode
                        .map((row, index) => (
                        <TableRow key={row.id || index}>
                          <TableCell>{row.itemDescription || 'N/A'}</TableCell>
                          <TableCell>{row.newSerialNo || 'N/A'}</TableCell>
                          <TableCell>{row.oldSerialNo || 'N/A'}</TableCell>
                          <TableCell>{row.remark || 'N/A'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No material used data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <ImagePreviewSection
                    title="Old Serial No Images"
                    images={materialUsedOldSerialImages}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <ImagePreviewSection
                    title="New Serial No Images"
                    images={materialUsedNewSerialImages}
                  />
                </Grid>
              </Grid>
            </Paper>
                    
            
            {/* Remark */}
            <Paper sx={{ padding: 3, marginBottom: 3 }}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                📝 Remark
              </Typography>
              
              <TextField 
                fullWidth 
                label="Remark" 
                value={formData.remark || ''} 
                onChange={(e) => handleInputChange('remark', e.target.value)} 
                multiline 
                rows={4} 
                variant="outlined" 
                disabled
                sx={fieldStyle}
              /> 
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
                ✅ Approval Information 
              </Typography> 
              
              <TextField 
                fullWidth 
                disabled
                label="Attended By" 
                value={formData.attendedBy || ''} 
                onChange={(e) => handleInputChange('attendedBy', e.target.value)} 
                variant="outlined" 
                sx={fieldStyle} 
              /> 
              <Box sx={{ marginTop: 2 }}> 
                <TextField 
                  fullWidth 
                  disabled
                  label="Approved By" 
                  multiline 
                  value={formData.approvedBy || ''} 
                  onChange={(e) => handleInputChange('approvedBy', e.target.value)} 
                  variant="outlined" 
                  sx={fieldStyle}
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
                🔗 Further Action Taken
              </Typography> 
              
              <FormControl fullWidth sx={fieldStyle}> 
                <InputLabel>Further Action Taken</InputLabel> 
                <Select 
                  value={formData.furtherActionTakenID || ''} 
                  onChange={(e) => handleInputChange('furtherActionTakenID', e.target.value)} 
                  label="Further Action Taken" 
                  disabled
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
            
            </Paper>

            {/* Form Status */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                ✅ Form Status
              </Typography>
              <Box sx={{ marginTop: 2 }}>
                <TextField
                  fullWidth
                  label="Form Status"
                  value={formStatusDisplayName || 'N/A'}
                  InputProps={{ readOnly: true }}
                  sx={fieldStyle}
                />
              </Box>
            </Paper>
          

        {/* Navigation Buttons Section - Moved outside main container */}
        <Paper sx={{ 
          padding: 3, 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #e9ecef', 
          position: 'sticky', 
          bottom: 0, 
          zIndex: 1000,
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center', 
            gap: 2
          }}> 
            
            {/* Cancel Button */}
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

            {/* Save Changes Button */}
            <Button 
              variant="contained" 
              endIcon={<CheckCircleIcon />} 
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
              {saving ? 'Saving...' : (isStatusClose ? 'Submit & Upload' : 'Submit Report')} 
            </Button> 
          </Box> 
        </Paper>

          </Box>
        </Paper>

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
                    {formData.attendedBy && (
                      <Typography component="span" sx={{ ml: 1, color: '#4ade80', fontSize: '13px' }}>
                        ({formData.attendedBy})
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
                    {formData.approvedBy && (
                      <Typography component="span" sx={{ ml: 1, color: '#4ade80', fontSize: '13px' }}>
                        ({formData.approvedBy})
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
              backgroundColor: notification.severity === 'success' ? '#d4edda' : '#f8d7da',
              color: notification.severity === 'success' ? '#155724' : '#721c24',
              '& .MuiAlert-icon': {
                color: notification.severity === 'success' ? '#28a745' : '#dc3545'
              }
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        {/* Download Confirmation Modal */}
        <DownloadConfirmationModal
          open={downloadConfirmModalOpen}
          onCancel={handleModalCancel}
          onCreateOnly={handleCreateOnly}
          onDownload={handleDownloadConfirm}
          loading={isDownloading}
          createOnlyLabel="Update Report Only"
        />
      </Box>
    </LocalizationProvider>
  );
};

export default CMReviewReportFormEdit;
