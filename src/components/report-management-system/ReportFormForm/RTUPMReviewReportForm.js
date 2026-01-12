
import React, { useState, useRef } from 'react';
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
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  TextField,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  Videocam as VideocamIcon,
  RemoveCircle as RemoveCircleIcon,
  AccessTime,
  ArrowBackIosNew as ArrowBackIosNewIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  UploadFile as UploadFileIcon,
  Brush as BrushIcon,
  Clear as ClearIcon,
  PhotoCamera,
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import RMSTheme from '../../theme-resource/RMSTheme';
import DownloadConfirmationModal from '../../common/DownloadConfirmationModal';
import { generateRTUPMReportPdf } from '../../api-services/reportFormService';

// Styling constants
const sectionContainer = {
  marginBottom: 4,
  padding: 3,
  border: '1px solid #e0e0e0',
  borderRadius: 2,
  backgroundColor: '#fafafa'
};

const sectionHeader = {
  color: '#1976d2',
  fontWeight: 'bold',
  marginBottom: 2,
  paddingBottom: 1,
  borderBottom: '2px solid #1976d2'
};

const fieldContainer = {
  marginBottom: 2,
  padding: 2,
  backgroundColor: 'white',
  borderRadius: 1,
  border: '1px solid #e0e0e0'
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return '';
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

// Image preview component
const ImagePreviewSection = ({ images, title, icon: IconComponent = BuildIcon }) => {
  if (!images || images.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <IconComponent sx={{ fontSize: 48, color: '#bdc3c7', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          No {title.toLowerCase()} uploaded
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ marginTop: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
        {title} ({images.length})
      </Typography>
      <Grid container spacing={2}>
        {images.map((image, index) => {
          const imageUrl = image instanceof File ? URL.createObjectURL(image) :
            (typeof image === 'string' ? image : image.url || image.preview);

          return (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card sx={{ position: 'relative' }}>
                <img
                  src={imageUrl}
                  alt={`${title} ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
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
    </Box>
  );
};

const RTUPMReviewReportForm = ({
  formData,
  reportFormTypes,
  formStatusOptions = [],
  onNext,
  onBack,
  loading,
  error,
  rtuPMData = {}
}) => {
  const reportType = reportFormTypes?.find(type => type.id === formData.reportFormTypeID);
  const formStatusDisplay = (() => {
    const match = (formStatusOptions || []).find((s) => (s.id || s.ID) === formData.formstatusID);
    if (match) return match.name || match.Name;
    return formData.formStatusName || formData.formstatusName || formData.formstatusID || 'Not specified';
  })();

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

  // Toast notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success' or 'error'
  });
  
  // Canvas refs for signature drawing
  const attendedByCanvasRef = useRef(null);
  const approvedByCanvasRef = useRef(null);
  const [isDrawingAttended, setIsDrawingAttended] = useState(false);
  const [isDrawingApproved, setIsDrawingApproved] = useState(false);
  const [signatureClearKey, setSignatureClearKey] = useState(0); // Track signature clearing to force re-render

  const resolvedStatusName = (() => {
    const match = (formStatusOptions || []).find((s) => (s.id || s.ID) === formData.formstatusID);
    const fromMatch = match?.name || match?.Name || '';
    const fallback = formData.formStatusName || formData.formstatusName || '';
    return (fromMatch || fallback || '').trim().toLowerCase();
  })();

  const isStatusClose = () => resolvedStatusName === 'close';

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
    // Force re-render to update tab disabled state
    setSignatureClearKey(prev => prev + 1);
  };

  // Helper function to check if signatures have been started
  const hasSignaturesStarted = () => {
    // Check if any signature file has been uploaded
    if (attendedBySignature || approvedBySignature) {
      return true;
    }
    
    // Check if any canvas has drawing
    if (attendedByCanvasRef.current) {
      const canvas = attendedByCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasDrawing = imageData.data.some(channel => channel !== 0);
      if (hasDrawing) return true;
    }
    
    if (approvedByCanvasRef.current) {
      const canvas = approvedByCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasDrawing = imageData.data.some(channel => channel !== 0);
      if (hasDrawing) return true;
    }
    
    return false;
  };

  // Handler to clear final report file
  const handleClearFinalReportFile = () => {
    setFinalReportFile(null);
    setFinalReportUploadError('');
    // Reset file input
    const fileInput = document.querySelector('input[type="file"][accept="application/pdf"]');
    if (fileInput) {
      fileInput.value = '';
    }
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
      // Pass upload data as object
      const uploadData = {
        finalReportFile: activeTab === 0 ? finalReportFile : null,
        attendedBySignature: activeTab === 1 ? attendedBySignatureToUpload : null,
        approvedBySignature: activeTab === 1 ? approvedBySignatureToUpload : null
      };
      
      const success = await onNext(uploadData);
      if (success === false) {
        setFinalReportUploadError('Failed to submit report. Please try again.');
        return;
      }
      setFinalReportDialogOpen(false);
      setFinalReportFile(null);
      setAttendedBySignature(null);
      setApprovedBySignature(null);
      setAttendedBySignaturePreview('');
      setApprovedBySignaturePreview('');
      setAttendedByMode('draw');
      setApprovedByMode('draw');
      
      // Clear canvases
      clearCanvas(attendedByCanvasRef);
      clearCanvas(approvedByCanvasRef);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to submit report.';
      setFinalReportUploadError(message);
    } finally {
      setFinalReportUploading(false);
    }
  };

  const handleSubmit = () => {
    if (isStatusClose()) {
      setFinalReportUploadError('');
      setFinalReportDialogOpen(true);
    } else {
      // Show download confirmation modal instead of directly submitting
      setDownloadConfirmModalOpen(true);
    }
  };

  // Handle when user clicks "Cancel" in download modal - just close and stay on review page
  const handleModalCancel = () => {
    setDownloadConfirmModalOpen(false);
  };

  // Handle when user clicks "Create Report Only" - submit without downloading
  const handleCreateOnly = async () => {
    try {
      setIsDownloading(true);
      setDownloadConfirmModalOpen(false);
      await onNext();
    } catch (error) {
      console.error('Error during report creation:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle when user clicks "Download Report" - submit and download
  const handleDownloadConfirm = async () => {
    try {
      setIsDownloading(true);
      setDownloadConfirmModalOpen(false);

      // First, submit the report to create the RTU PM report
      const submitResult = await onNext();

      console.log('=== Report submission completed ===');
      console.log('Submit result:', submitResult);
      console.log('Submit result type:', typeof submitResult);
      console.log('Submit result structure:', JSON.stringify(submitResult, null, 2));

      // Check if submission failed
      if (submitResult === false) {
        console.error('Submission failed - submitResult is false');
        setIsDownloading(false);
        return;
      }

      // Extract ReportForm ID from the submit result (following CMReportFormDetails approach)
      const reportFormId = submitResult?.reportForm?.id || submitResult?.reportForm?.ID;
      
      console.log('Extracted reportFormId:', reportFormId);
      console.log('reportForm object:', submitResult?.reportForm);

      // Wait a moment to ensure the report is fully created in the backend
      if (reportFormId) {
        console.log('Waiting 2 seconds before downloading...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await handleDownloadReport(reportFormId);
      } else {
        console.error('No ReportForm ID available for download');
        console.error('submitResult:', submitResult);
        // Fallback to jobNo if reportFormId is not available
        const jobNo = formData?.jobNo;
        if (jobNo) {
          console.log('Falling back to jobNo:', jobNo);
          await handleDownloadReport(jobNo);
        }
      }
    } catch (error) {
      console.error('Error during submit and download:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Download report function using direct HTTP API
  const handleDownloadReport = async (reportFormId) => {
    try {
      console.log(`Generating RTU PM report PDF for ReportForm ID: ${reportFormId}`);

      // Use the same direct HTTP API approach as CMReportFormDetails Print Report feature
      const response = await generateRTUPMReportPdf(reportFormId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      // Extract filename from response headers or use default
      const disposition = response.headers['content-disposition'];
      let fileName = `RTUPMReport_${formData?.jobNo || reportFormId}.pdf`;
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
      
      // Show success notification
      setNotification({
        open: true,
        message: 'RTU PM Report PDF downloaded successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating RTU PM report PDF:', error);
      const errorMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : error.message) ||
        'Failed to generate PDF report.';
      console.error('Error details:', errorMessage);
      // Show error notification
      setNotification({
        open: true,
        message: `Failed to download report: ${errorMessage}`,
        severity: 'error'
      });
    }
  };

  // Close toast notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const fieldStyle = {
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
  };
  return (
    <>
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
          {/* Header Section */}
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
              {formData.reportTitle ? `${formData.reportTitle}` : ''}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                opacity: 0.95,
                fontSize: '16px',
                fontWeight: 400
              }}
            >
              Review the maintenance information below
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

          {/* Content Section */}
          <Box sx={{ padding: 3 }}>
            {error && (
              <Alert severity="error" sx={{ marginBottom: 3 }}>
                {error}
              </Alert>
            )}

        {/* Basic Information Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
            📋 Basic Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Job Number"
              value={formData.jobNo || ''}
              disabled
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="System Description"
              value={formData.systemDescription || ''}
              disabled
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="Station Name"
              value={formData.stationName || ''}
              disabled
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="Project No"
              value={formData.projectNo || ''}
              disabled
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="Customer"
              value={formData.customer || ''}
              disabled
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="Report Form Type"
              value={reportType?.name || ''}
              disabled
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="PM Report Form Type"
              value={formData.pmReportFormTypeName || ''}
              disabled
              sx={fieldStyle}
            />
          </Box>
        </Paper>

        {/* Date of Service Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
            📅 Date of Service
          </Typography>
          <TextField
            fullWidth
            label="Service Date & Time"
            value={formatDate(formData.dateOfService)}
            disabled
            sx={fieldStyle}
          />
        </Paper>

        {/* Main RTU Cabinet Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
            <BuildIcon sx={{ marginRight: 1, verticalAlign: 'middle' }} />
            Main RTU Cabinet
          </Typography>

          <ImagePreviewSection
            images={rtuPMData.pmMainRtuCabinetImages || []}
            title="Main RTU Cabinet Images"
            icon={BuildIcon}
          />

          {rtuPMData.mainRTUCabinetData && rtuPMData.mainRTUCabinetData.length > 0 ? (
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
                    <TableCell sx={{ fontWeight: 'bold' }}>UPS Taking Over Test</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>UPS Battery</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rtuPMData.mainRTUCabinetData.map((row, index) => (
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
                      <TableCell>{getStatusChip(row.UPSTakingOverTest)}</TableCell>
                      <TableCell>{getStatusChip(row.UPSBattery)}</TableCell>
                      <TableCell>{row.Remarks || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No Main RTU Cabinet data available
            </Typography>
          )}
        </Paper>

        {/* PM Chamber Magnetic Contact Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
          <SettingsIcon sx={{ marginRight: 1, verticalAlign: 'middle' }} />
            PM Chamber Magnetic Contact
          </Typography>

          <ImagePreviewSection
            images={rtuPMData.pmChamberMagneticContactImages || []}
            title="PM Chamber Magnetic Contact Images"
            icon={SettingsIcon}
          />

          {rtuPMData.pmChamberMagneticContactData && rtuPMData.pmChamberMagneticContactData.length > 0 ? (
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
                  {rtuPMData.pmChamberMagneticContactData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.ChamberNumber || '-'}</TableCell>
                      <TableCell>{getStatusChip(row.ChamberOGBox)}</TableCell>
                      <TableCell>{getStatusChip(row.ChamberContact1)}</TableCell>
                      <TableCell>{getStatusChip(row.ChamberContact2)}</TableCell>
                      <TableCell>{getStatusChip(row.ChamberContact3)}</TableCell>
                      <TableCell>{row.Remarks || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No PM Chamber Magnetic Contact data available
            </Typography>
          )}
        </Paper>

        {/* PM RTU Cabinet Cooling Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
          <SettingsIcon sx={{ marginRight: 1, verticalAlign: 'middle' }} />
            PM RTU Cabinet Cooling
          </Typography>

          <ImagePreviewSection
            images={rtuPMData.pmRTUCabinetCoolingImages || []}
            title="PM RTU Cabinet Cooling Images"
            icon={SettingsIcon}
          />

          {rtuPMData.pmRTUCabinetCoolingData && rtuPMData.pmRTUCabinetCoolingData.length > 0 ? (
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
                  {rtuPMData.pmRTUCabinetCoolingData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.FanNumber || '-'}</TableCell>
                      <TableCell>{getStatusChip(row.FunctionalStatus)}</TableCell>
                      <TableCell>{row.Remarks || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No PM RTU Cabinet Cooling data available
            </Typography>
          )}
        </Paper>

        {/* PM DVR Equipment Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
          <VideocamIcon sx={{ marginRight: 1, verticalAlign: 'middle' }} />
            PM DVR Equipment
          </Typography>

          <ImagePreviewSection
            images={rtuPMData.pmDVREquipmentImages || []}
            title="PM DVR Equipment Images"
            icon={VideocamIcon}
          />

          {rtuPMData.pmDVREquipmentData && rtuPMData.pmDVREquipmentData.length > 0 ? (
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
                  {rtuPMData.pmDVREquipmentData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{getStatusChip(row.DVRComm)}</TableCell>
                      <TableCell>{getStatusChip(row.DVRRAIDComm)}</TableCell>
                      <TableCell>{getStatusChip(row.TimeSyncNTPServer)}</TableCell>
                      <TableCell>{getStatusChip(row.Recording24x7)}</TableCell>
                      <TableCell>{row.Remarks || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No PM DVR Equipment data available
            </Typography>
          )}
        </Paper>

        {/* Cleaning of Cabinet / Equipment Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
            🧹 Cleaning of Cabinet / Equipment
          </Typography>
          <TextField
            fullWidth
            label="Cleaning Status"
            value={formData.cleaningStatus || ''}
            disabled
            sx={fieldStyle}
          />
        </Paper>

        {/* Remarks Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
            📝 Remarks
          </Typography>
          <TextField
            fullWidth
            label="Remarks"
            value={formData.remarks || ''}
            disabled
            multiline
            rows={3}
            sx={fieldStyle}
          />
        </Paper>

        {/* Approval Information Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
            📝 Approval Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Attended By"
              value={formData.attendedBy || ''}
              disabled
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="Approved By"
              value={formData.approvedBy || ''}
              disabled
              sx={fieldStyle}
            />
          </Box>
        </Paper>

          
        {/* Form Status Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
            ✅ Form Status
          </Typography>
          <TextField
            fullWidth
            label="Form Status"
            value={formStatusDisplay || 'Not specified'}
            disabled
            sx={fieldStyle}
          />
        </Paper>


        {/* Action Buttons - Updated to match RTUPMReportForm styling */}
        <Paper sx={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)'
          },
          background: '#ffffff',
          marginBottom: 0
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={onBack}
              startIcon={<ArrowBackIosNewIcon fontSize="small" />}
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

            <Button
              variant="contained"
              onClick={handleSubmit}
              endIcon={<ArrowForwardIosIcon fontSize="small" />}
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
              Submit Report
            </Button>
          </Box>
        </Paper>

            {/* End of Content */}
          </Box>
        </Paper>
      </Box>

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
        <Box sx={{ position: 'relative' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => {
              // Prevent switching if target tab is disabled and show warning
              if (newValue === 0 && hasSignaturesStarted()) {
                setNotification({
                  open: true,
                  message: 'This option is unavailable because you have already started providing signatures. Please use only one method to close the report: either upload a PDF report or provide signatures.',
                  severity: 'warning'
                });
                return;
              }
              if (newValue === 1 && finalReportFile) {
                setNotification({
                  open: true,
                  message: 'This option is unavailable because you have already uploaded a PDF report. Please use only one method to close the report: either upload a PDF report or provide signatures.',
                  severity: 'warning'
                });
                return;
              }
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
                },
                '&.Mui-disabled': {
                  opacity: 0.4,
                  cursor: 'not-allowed'
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
              disabled={hasSignaturesStarted()}
            />
            <Tab 
              icon={<BrushIcon sx={{ fontSize: 20 }} />} 
              iconPosition="start"
              label="Provide Signatures"
              disabled={!!finalReportFile}
            />
          </Tabs>
          
          {/* Tooltip overlay for disabled "Upload PDF Report" tab */}
          {hasSignaturesStarted() && (
            <Tooltip
              title="This option is unavailable because you have already started providing signatures. Please use only one method to close the report: either upload a PDF report or provide signatures."
              placement="top"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    color: '#f8fafc',
                    fontSize: '13px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    maxWidth: '320px'
                  }
                },
                arrow: {
                  sx: {
                    color: 'rgba(15, 23, 42, 0.95)'
                  }
                }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  transform: 'translateX(calc(-50% - 150px))',
                  width: '200px',
                  height: '48px',
                  zIndex: 1,
                  cursor: 'not-allowed'
                }}
              />
            </Tooltip>
          )}
          
          {/* Tooltip overlay for disabled "Provide Signatures" tab */}
          {finalReportFile && (
            <Tooltip
              title="This option is unavailable because you have already uploaded a PDF report. Please use only one method to close the report: either upload a PDF report or provide signatures."
              placement="top"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    color: '#f8fafc',
                    fontSize: '13px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    maxWidth: '320px'
                  }
                },
                arrow: {
                  sx: {
                    color: 'rgba(15, 23, 42, 0.95)'
                  }
                }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  transform: 'translateX(calc(-50% + 150px))',
                  width: '200px',
                  height: '48px',
                  zIndex: 1,
                  cursor: 'not-allowed'
                }}
              />
            </Tooltip>
          )}
        </Box>

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
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    mt: 1
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#4ade80',
                      textAlign: 'center'
                    }}
                  >
                    ✓ File selected: {finalReportFile.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleClearFinalReportFile}
                    sx={{
                      color: 'rgba(226,232,240,0.8)',
                      '&:hover': {
                        color: '#ef4444',
                        backgroundColor: 'rgba(239,68,68,0.1)'
                      }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
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

      {/* Download Confirmation Modal */}
      <DownloadConfirmationModal
        open={downloadConfirmModalOpen}
        onCancel={handleModalCancel}
        onCreateOnly={handleCreateOnly}
        onDownload={handleDownloadConfirm}
        loading={isDownloading}
      />

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
            backgroundColor: notification.severity === 'success' ? '#4caf50' : 
                            notification.severity === 'warning' ? '#ff9800' : '#f44336',
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
    </>
  );
};

export default RTUPMReviewReportForm;
