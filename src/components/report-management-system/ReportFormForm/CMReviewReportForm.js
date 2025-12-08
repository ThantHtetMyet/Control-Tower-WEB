import React from 'react';
import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  Chip,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  ToggleButton,
  ToggleButtonGroup,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CheckCircle,
  Build,
  PhotoCamera,
  ArrowBack,
  Inventory,
  UploadFile as UploadFileIcon,
  Settings,
  Brush as BrushIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import moment from 'moment';
import RMSTheme from '../../theme-resource/RMSTheme';
import DownloadConfirmationModal from '../../common/DownloadConfirmationModal';
import { generateCMReportPdf } from '../../api-services/reportFormService';

const CMReviewReportForm = ({
  formData,
  reportFormTypes,
  onNext,
  onBack,
  loading,
  error,
  materialUsedData = [],
  materialUsedOldSerialImages = [],
  materialUsedNewSerialImages = [],
  user
}) => {
  const [downloadConfirmModalOpen, setDownloadConfirmModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [finalReportDialogOpen, setFinalReportDialogOpen] = useState(false);
  const [finalReportFile, setFinalReportFile] = useState(null);
  const [finalReportUploadError, setFinalReportUploadError] = useState('');
  const [finalReportUploading, setFinalReportUploading] = useState(false);
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

  const isStatusClose = () => {
    const statusName = (formData.formStatusName || '').trim().toLowerCase();
    return statusName === 'close';
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
      // Pass final report and signatures to the parent component
      const uploadData = {
        finalReportFile: finalReportFile,
        attendedBySignature: attendedBySignatureToUpload,
        approvedBySignature: approvedBySignatureToUpload
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
      // Show download confirmation modal before submitting
      setDownloadConfirmModalOpen(true);
    }
  };

  // Handle when user clicks "Cancel" - just close modal and go back to review
  const handleModalCancel = () => {
    setDownloadConfirmModalOpen(false);
    // Don't submit, just close the modal
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

      // First, submit the report to create the CM report
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

  const handleDownloadReport = async (reportFormId) => {
    try {
      console.log(`Generating CM report PDF for ReportForm ID: ${reportFormId}`);

      // Use the same direct HTTP API approach as CMReportFormDetails Print Report feature
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
      // You might want to show this error to the user
      alert(`Failed to download report: ${errorMessage}`);
    }
  };

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

  const labelStyle = {
    fontWeight: 600,
    color: '#34495E',
    fontSize: '14px',
    marginBottom: '4px'
  };

  const formatDate = (date) => {
    return date ? moment(date).format('DD/MM/YYYY HH:mm') : '';
  };

  const getStatusChip = (status) => {
    const statusColors = {
      'Draft': { backgroundColor: '#6c757d', color: 'white' },
      'Submitted': { backgroundColor: '#007bff', color: 'white' },
      'Under Review': { backgroundColor: '#ffc107', color: 'black' },
      'Approved': { backgroundColor: '#28a745', color: 'white' },
      'Rejected': { backgroundColor: '#dc3545', color: 'white' }
    };
    return (
      <Chip
        label={status || 'Unknown'}
        sx={statusColors[status] || { backgroundColor: '#6c757d', color: 'white' }}
        size="medium"
      />
    );
  };

  const ImagePreviewSection = ({ images, title, icon: IconComponent }) => {
    if (!images || images.length === 0) {
      return (
        <Box sx={{
          textAlign: 'center',
          py: 3,
          border: '1px solid #d0d0d0',
          borderRadius: '8px',
          backgroundColor: '#fafafa',
          mb: 2
        }}>
          <IconComponent sx={{ fontSize: 48, color: '#bdc3c7', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No {title.toLowerCase()} uploaded
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ mb: 2 }}>
        <Typography sx={labelStyle}>{title}</Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {images.map((image, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card sx={{ position: 'relative' }}>
                <img
                  src={image.url || (image instanceof File ? URL.createObjectURL(image) : image)}
                  alt={`${title} ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '8px'
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
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}
                >
                  {image.name || `Image ${index + 1}`}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
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
              {formData.reportTitle || 'Corrective Maintenance Report'} - Review
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                opacity: 0.95,
                fontSize: '16px',
                fontWeight: 400
              }}
            >
              Please review all information before submitting
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
                📋 Basic Information Summary
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 1 }}>
                <TextField
                  fullWidth
                  label="Job No"
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
                  label="Customer"
                  value={formData.customer || ''}
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
                  label="Station Name"
                  value={formData.stationName || ''}
                  disabled
                  sx={fieldStyle}
                />
              </Box>
            </Paper>

            {/* Date & Time Information Section */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                📅 Date & Time Information
              </Typography>

              <Grid container spacing={3} sx={{ marginTop: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Failure Detected"
                    value={formatDate(formData.failureDetectedDate)}
                    disabled
                    sx={fieldStyle}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Response"
                    value={formatDate(formData.responseDate)}
                    disabled
                    sx={fieldStyle}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Arrival"
                    value={formatDate(formData.arrivalDate)}
                    disabled
                    sx={fieldStyle}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Completion"
                    value={formatDate(formData.completionDate)}
                    disabled
                    sx={fieldStyle}
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
                <ImagePreviewSection
                  images={formData.beforeIssueImages}
                  title="Before Issue Images"
                  icon={PhotoCamera}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Issue Reported Description"
                  value={formData.issueReportedDescription || ''}
                  disabled
                  sx={fieldStyle}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Issue Found Description"
                  value={formData.issueFoundDescription || ''}
                  disabled
                  sx={fieldStyle}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Action Taken Description"
                  value={formData.actionTakenDescription || ''}
                  disabled
                  sx={fieldStyle}
                />

                <ImagePreviewSection
                  images={formData.afterActionImages}
                  title="After Action Images"
                  icon={Build}
                />
              </Box>
            </Paper>

            {/* Material Used Section */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                <Settings sx={{ marginRight: 1, verticalAlign: 'middle' }} />
                Material Used Information
              </Typography>

              <Box sx={{ marginTop: 2 }}>
                {materialUsedData && materialUsedData.length > 0 ? (
                  <TableContainer component={Paper} sx={{ marginBottom: 3, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                          <TableCell sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Item Description</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: '#2C3E50' }}>New Serial No</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Old Serial No</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Remark</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {materialUsedData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.ItemDescription || ''}
                                disabled
                                sx={{
                                  ...fieldStyle,
                                  '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' },
                                  '& fieldset': { border: 'none' }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.NewSerialNo || ''}
                                disabled
                                sx={{
                                  ...fieldStyle,
                                  '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' },
                                  '& fieldset': { border: 'none' }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.OldSerialNo || ''}
                                disabled
                                sx={{
                                  ...fieldStyle,
                                  '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' },
                                  '& fieldset': { border: 'none' }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.Remark || ''}
                                disabled
                                sx={{
                                  ...fieldStyle,
                                  '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' },
                                  '& fieldset': { border: 'none' }
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{
                    textAlign: 'center',
                    py: 3,
                    border: '1px solid #d0d0d0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa',
                    mb: 2
                  }}>
                    <Inventory sx={{ fontSize: 48, color: '#bdc3c7', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No material used data recorded
                    </Typography>
                  </Box>
                )}

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <ImagePreviewSection
                      images={materialUsedOldSerialImages}
                      title="Old Serial Number Images"
                      icon={PhotoCamera}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ImagePreviewSection
                      images={materialUsedNewSerialImages}
                      title="New Serial Number Images"
                      icon={PhotoCamera}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            {/* Remark Section */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                📝 Remark
              </Typography>

              <Box sx={{ marginTop: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Additional Remarks"
                  value={formData.Remark || ''}
                  disabled
                  sx={fieldStyle}
                />
              </Box>
            </Paper>

            {/* Approval Information Section */}
            <Paper sx={{
              ...sectionContainerStyle,
              background: '#f8f9fa',
              border: '2px solid #e9ecef'
            }}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                ✅ Approval Information
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
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

            {/* Reference Information Section */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                🔗 Reference Information
              </Typography>

              <Box sx={{ marginTop: 2 }}>
                <TextField
                  fullWidth
                  label="Further Action Taken"
                  value={formData.furtherActionTakenName || ''}
                  disabled
                  sx={fieldStyle}
                />
              </Box>
            </Paper>
{/* Form Status Section */}
<Paper sx={{
              ...sectionContainerStyle,
              background: '#f8f9fa',
              border: '2px solid #e9ecef'
            }}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                ✅ Form Status
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 1 }}>
                <TextField
                  fullWidth
                  label="Form Status"
                  value={formData.formStatusName || ''}
                  disabled
                  sx={fieldStyle}
                />
              </Box>
            </Paper>
            
            {error && (
              <Alert severity="error" sx={{ marginBottom: 2 }}>
                {error}
              </Alert>
            )}

            {/* Navigation Buttons Section */}
            <Paper sx={{
              ...sectionContainerStyle,
              background: '#ffffff',
              marginBottom: 0
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<ArrowBack />}
                  onClick={onBack}
                  disabled={loading}
                  sx={{
                    background: RMSTheme.components.button.secondary?.background || '#6c757d',
                    color: RMSTheme.components.button.secondary?.text || 'white',
                    padding: '12px 32px',
                    borderRadius: RMSTheme.borderRadius?.small || '8px',
                    '&:hover': {
                      background: RMSTheme.components.button.secondary?.hover || '#5a6268'
                    }
                  }}
                >
                  Back
                </Button>

                <Button
                  variant="contained"
                  endIcon={<CheckCircle />}
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    background: RMSTheme.components.button.primary?.background || '#28a745',
                    color: RMSTheme.components.button.primary?.text || 'white',
                    padding: '12px 32px',
                    borderRadius: RMSTheme.borderRadius?.small || '8px',
                    '&:hover': {
                      background: RMSTheme.components.button.primary?.hover || '#218838'
                    }
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </Button>
              </Box>
            </Paper>
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

      {/* Download Confirmation Modal */}
      <DownloadConfirmationModal
        open={downloadConfirmModalOpen}
        onCancel={handleModalCancel}
        onCreateOnly={handleCreateOnly}
        onDownload={handleDownloadConfirm}
        loading={isDownloading}
        createOnlyLabel="Create Report Only"
      />
    </LocalizationProvider>
  );
};

export default CMReviewReportForm;