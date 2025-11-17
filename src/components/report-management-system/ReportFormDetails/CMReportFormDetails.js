import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  PhotoCamera as PhotoCameraIcon,
  RemoveCircle as RemoveCircleIcon,
  AccessTime,
  Close as CloseIcon,
  Print as PrintIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import RMSTheme from '../../theme-resource/RMSTheme';
import { getCMReportForm, generateCMReportPdf } from '../../api-services/reportFormService';
import { API_BASE_URL } from '../../../config/apiConfig';

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
  padding: 1,
  backgroundColor: '#ffffff',
  borderRadius: 1,
  border: '1px solid #e0e0e0'
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  } catch (error) {
    return 'Invalid Date';
  }
};

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
  
  if (statusStr === 'Acceptable' || statusStr === 'DONE' || statusStr === 'Completed') {
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label={statusStr}
        color="success"
        variant="filled"
        size="small"
      />
    );
  } else if (statusStr === 'Not Acceptable' || statusStr === 'Failed') {
    return (
      <Chip
        icon={<CancelIcon />}
        label={statusStr}
        color="error"
        variant="filled"
        size="small"
      />
    );
  } else {
    return (
      <Chip
        label={statusStr}
        color="primary"
        variant="outlined"
        size="small"
      />
    );
  }
};

// Image Preview Section Component
const ImagePreviewSection = ({ images, title, icon: IconComponent = BuildIcon, reportFormId }) => {
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
          // Handle different image data structures - following News system pattern
          let imageUrl;
          
          if (image instanceof File) {
            // For File objects (during upload)
            imageUrl = URL.createObjectURL(image);
          } else if (typeof image === 'string') {
            // For direct URL strings
            imageUrl = image;
          } else if (image.imageUrl) {
            // For pre-constructed URLs (following News system pattern)
            imageUrl = image.imageUrl;
          } else if (image.imageName && reportFormId) {
            // Fallback: construct URL using imageName (camelCase)
            imageUrl = `${API_BASE_URL}/api/ReportFormImage/image/${reportFormId}/${image.imageName}`;
          } else if (image.ImageName && reportFormId) {
            // Fallback: construct URL using ImageName (PascalCase)
            imageUrl = `${API_BASE_URL}/api/ReportFormImage/image/${reportFormId}/${image.ImageName}`;
          } else if (image.url) {
            // For objects with url property
            imageUrl = image.url;
          } else if (image.preview) {
            // For objects with preview property
            imageUrl = image.preview;
          } else {
            // Fallback - skip this image
            console.warn('Unable to determine image URL for:', image);
            return null;
          }
          
          return (
            <Grid item xs={6} sm={4} md={3} key={index}>
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
                onDoubleClick={() => handleImageDoubleClick(imageUrl)}
              >
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
                    console.error('Failed to load image:', imageUrl);
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

const CMReportFormDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        setLoading(true);
        
        // Use the new CM specific API from ReportFormController
        const response = await getCMReportForm(id);
        
        // Structure the data from the new API response
        const structuredData = {
          // Basic Report Form information
          id: response.id,
          reportFormTypeID: response.reportFormTypeID,
          reportFormTypeName: response.reportFormTypeName,
          jobNo: response.jobNo,
          systemNameWarehouseID: response.systemNameWarehouseID,
          systemNameWarehouseName: response.systemNameWarehouseName,
          stationNameWarehouseID: response.stationNameWarehouseID,
          stationNameWarehouseName: response.stationNameWarehouseName,
          uploadStatus: response.uploadStatus,
          uploadHostname: response.uploadHostname,
          uploadIPAddress: response.uploadIPAddress,
          formStatus: response.formStatus,
          createdDate: response.createdDate,
          updatedDate: response.updatedDate,
          createdBy: response.createdBy,
          createdByUserName: response.createdByUserName,
          updatedBy: response.updatedBy,
          updatedByUserName: response.updatedByUserName,

          // CM Report Form specific data
          reportFormID: response.cmReportForm.reportFormID,
          cmReportFormTypeID: response.cmReportForm.cmReportFormTypeID,
          furtherActionTakenID: response.cmReportForm.furtherActionTakenID,
          furtherActionTakenName: response.cmReportForm.furtherActionTakenName,
          formstatusID: response.cmReportForm.formstatusID,
          formStatusName: response.cmReportForm.formStatusName,
          customer: response.cmReportForm.customer,
          reportTitle: response.cmReportForm.reportTitle,
          projectNo: response.cmReportForm.projectNo,
          issueReportedDescription: response.cmReportForm.issueReportedDescription,
          issueFoundDescription: response.cmReportForm.issueFoundDescription,
          actionTakenDescription: response.cmReportForm.actionTakenDescription,
          failureDetectedDate: response.cmReportForm.failureDetectedDate,
          responseDate: response.cmReportForm.responseDate,
          arrivalDate: response.cmReportForm.arrivalDate,
          completionDate: response.cmReportForm.completionDate,
          attendedBy: response.cmReportForm.attendedBy,
          approvedBy: response.cmReportForm.approvedBy,
          remark: response.cmReportForm.remark,

          // Material Used data
          materialUsed: response.materialUsed || [],

          // Images with constructed URLs
          beforeIssueImages: (response.beforeIssueImages || []).map(image => ({
            ...image,
            imageUrl: image.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${image.imageName}` : null
          })),
          afterActionImages: (response.afterActionImages || []).map(image => ({
            ...image,
            imageUrl: image.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${image.imageName}` : null
          })),
          materialUsedOldSerialImages: (response.materialUsedOldSerialImages || []).map(image => ({
            ...image,
            imageUrl: image.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${image.imageName}` : null
          })),
          materialUsedNewSerialImages: (response.materialUsedNewSerialImages || []).map(image => ({
            ...image,
            imageUrl: image.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${image.imageName}` : null
          }))
        };

        setFormData(structuredData);
        
      } catch (err) {
        setError('Failed to load CM report details');
        console.error('Error fetching CM report details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReportDetails();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/report-management-system/report-forms');
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handlePrintReport = async () => {
    if (!id) {
      setNotification({
        open: true,
        message: 'Invalid report identifier.',
        severity: 'error'
      });
      return;
    }

    try {
      setIsGeneratingPDF(true);
      setNotification({
        open: true,
        message: 'Generating PDF report. Please wait...',
        severity: 'info'
      });

      const response = await generateCMReportPdf(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      const disposition = response.headers['content-disposition'];
      let fileName = `CMReport_${formData?.jobNo || id}.pdf`;
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

      setNotification({
        open: true,
        message: 'PDF generated successfully.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating CM PDF:', error);
      const errorMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : error.message) ||
        'Failed to generate PDF.';

      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
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
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={handleBack}>
          Back to Report List
        </Button>
      </Box>
    );
  }

  if (!formData) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Report not found
        </Alert>
        <Button onClick={handleBack}>
          Back to Report List
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      {/* Header with JobNo in top right corner */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 3
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#1976d2', 
            fontWeight: 'bold' 
          }}
        >
          {formData.reportTitle ? `${formData.reportTitle}` : 'Corrective Maintenance Report - Details'}
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

      {error && (
        <Alert severity="error" sx={{ marginBottom: 3 }}>
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
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
        }
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={handleBack}
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
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate(`/report-management-system/cm-edit/${id}`)}
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
              Edit Report
            </Button>
            
            <Button
              variant="contained"
              onClick={handlePrintReport}
              startIcon={<PrintIcon />}
              disabled={isGeneratingPDF}
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
              {isGeneratingPDF ? 'Generating PDF...' : 'Print Report'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Basic Information Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          📋 Basic Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Customer</Typography>
              <Typography variant="body1">{formData.customer || 'Not specified'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Project No</Typography>
              <Typography variant="body1">{formData.projectNo || 'Not specified'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Station Name</Typography>
              <Typography variant="body1">{formData.stationNameWarehouseName || 'Not specified'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>System Description</Typography>
              <Typography variant="body1">{formData.systemNameWarehouseName || 'Not specified'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Report Form Type</Typography>
              <Typography variant="body1">{formData.reportFormTypeName || 'Corrective Maintenance'}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Timeline Information Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          ⏰ Timeline Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Failure Detected Date</Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', color: '#1976d2', fontWeight: 'medium' }}>
                {formatDate(formData.failureDetectedDate)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Response Date</Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', color: '#1976d2', fontWeight: 'medium' }}>
                {formatDate(formData.responseDate)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Arrival Date</Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', color: '#1976d2', fontWeight: 'medium' }}>
                {formatDate(formData.arrivalDate)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Completion Date</Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', color: '#1976d2', fontWeight: 'medium' }}>
                {formatDate(formData.completionDate)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Issue Details Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          📝 Issue Details
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
          <ImagePreviewSection 
            images={formData.beforeIssueImages || []} 
            title="Before Issue Images" 
            icon={PhotoCameraIcon}
            reportFormId={id}
          />
          
          <Box sx={fieldContainer}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Issue Reported Description</Typography>
            <Typography variant="body1">
              {formData.issueReportedDescription || 'Not specified'}
            </Typography>
          </Box>
          
          <Box sx={fieldContainer}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Issue Found Description</Typography>
            <Typography variant="body1">
              {formData.issueFoundDescription || 'Not specified'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Action Taken Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          🔧 Action Taken
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
          <Box sx={fieldContainer}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Action Taken Description</Typography>
            <Typography variant="body1">
              {formData.actionTakenDescription || 'Not specified'}
            </Typography>
          </Box>
          
          <ImagePreviewSection 
            images={formData.afterActionImages || []} 
            title="After Action Images" 
            icon={BuildIcon}
            reportFormId={id}
          />
        </Box>
      </Paper>

      {/* Material Used Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          <InventoryIcon sx={{ marginRight: 1, verticalAlign: 'middle' }} />
          Material Used Information
        </Typography>
        
        <Box sx={{ marginTop: 2 }}>
          {/* Material Used Table */}
          {formData.materialUsed && formData.materialUsed.length > 0 ? (
            <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Material Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Old Serial No</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>New Serial No</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.materialUsed.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.materialDescription || 'Not specified'}</TableCell>
                      <TableCell>{row.oldSerialNo || 'Not specified'}</TableCell>
                      <TableCell>{row.newSerialNo || 'Not specified'}</TableCell>
                      <TableCell>{row.remarks || 'Not specified'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ ...fieldContainer, textAlign: 'center', py: 3 }}>
              <InventoryIcon sx={{ fontSize: 48, color: '#bdc3c7', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No material used data recorded
              </Typography>
            </Box>
          )}

          {/* Material Used Images */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ImagePreviewSection 
                images={formData.materialUsedOldSerialImages || []} 
                title="Old Serial No Images" 
                icon={RemoveCircleIcon}
                reportFormId={id}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ImagePreviewSection 
                images={formData.materialUsedNewSerialImages || []} 
                title="New Serial No Images" 
                icon={CheckCircleIcon}
                reportFormId={id}
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Approval Information Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          ✅ Approval Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Attended By</Typography>
              <Typography variant="body1">{formData.attendedBy || 'Not specified'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Approved By</Typography>
              <Typography variant="body1">{formData.approvedBy || 'Not specified'}</Typography>
            </Box>
          </Grid>
          {formData.remark && (
            <Grid item xs={12}>
              <Box sx={fieldContainer}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Remarks</Typography>
                <Typography variant="body1">{formData.remark}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Status Information Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          📊 Status Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Further Action Taken</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <SettingsIcon sx={{ mr: 1, color: '#1976d2' }} />
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {formData.furtherActionTakenName || 'Not specified'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>Form Status</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getStatusChip(formData.formStatusName)}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
  );
};

export default CMReportFormDetails;
