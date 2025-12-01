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
  Snackbar,
  TextField
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
  Inventory as InventoryIcon,
  ArrowBackIosNew as ArrowBackIosNewIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import RMSTheme from '../../theme-resource/RMSTheme';
import { getCMReportForm, generateCMReportPdf, getFinalReportsByReportForm, downloadFinalReportAttachment } from '../../api-services/reportFormService';
import { API_BASE_URL } from '../../../config/apiConfig';
import warehouseService from '../../api-services/warehouseService';

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
  const [formStatusOptions, setFormStatusOptions] = useState([]);
  const [formStatusId, setFormStatusId] = useState('');
  const [formStatusName, setFormStatusName] = useState('');
  const [finalReports, setFinalReports] = useState([]);
  const [finalReportsLoading, setFinalReportsLoading] = useState(false);

  const formStatusDisplay =
    formStatusName ||
    formData?.formStatusName ||
    formData?.formstatusID ||
    formData?.formStatus ||
    'Not specified';
  const normalizedFormStatus = (formStatusDisplay || '').trim().toLowerCase();
  const isFormStatusClosed = normalizedFormStatus === 'close';

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
        setFormStatusId(
          structuredData.formstatusID ||
          structuredData.formStatus ||
          response.formStatus ||
          ''
        );
        setFormStatusName(structuredData.formStatusName || '');

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

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const statuses = await warehouseService.getFormStatus();
        setFormStatusOptions(statuses || []);
      } catch (err) {
        console.error('Failed to fetch form statuses:', err);
      }
    };

    loadStatuses();
  }, []);

  useEffect(() => {
    if (!formStatusId) return;
    const match = (formStatusOptions || []).find((status) => (status.id || status.ID) === formStatusId);
    if (match) {
      setFormStatusName(match.name || match.Name || formStatusId);
    }
  }, [formStatusId, formStatusOptions]);

  useEffect(() => {
    if (!id || !isFormStatusClosed) {
      setFinalReports([]);
      return;
    }

    const fetchFinalReports = async () => {
      try {
        setFinalReportsLoading(true);
        const response = await getFinalReportsByReportForm(id);
        setFinalReports(response || []);
      } catch (err) {
        console.error('Error fetching final reports:', err);
        setNotification({
          open: true,
          message: err.response?.data?.message || err.message || 'Failed to load final reports.',
          severity: 'error'
        });
      } finally {
        setFinalReportsLoading(false);
      }
    };

    fetchFinalReports();
  }, [id, isFormStatusClosed]);

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

  const handleDownloadFinalReport = async (report) => {
    if (!report?.id) {
      return;
    }

    try {
      const response = await downloadFinalReportAttachment(report.id);
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = report.attachmentName || `FinalReport_${formData?.jobNo || 'report'}.pdf`;
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading final report:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to download final report.',
        severity: 'error'
      });
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

          {!isFormStatusClosed && (
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
          )}
        </Box>
      </Paper>

      {/* Basic Information Summary Section */}
      <Paper sx={{
        ...sectionContainer,
        background: '#f8f9fa',
        border: '2px solid #e9ecef'
      }}>
        <Typography variant="h5" sx={sectionHeader}>
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
            value={formData.systemNameWarehouseName || ''}
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
            value={formData.stationNameWarehouseName || ''}
            disabled
            sx={fieldStyle}
          />
        </Box>
      </Paper>

      {isFormStatusClosed && (
        <Paper sx={{
          padding: 3,
          marginBottom: 3,
          backgroundColor: '#ffffff',
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h5" sx={{
            color: '#1976d2',
            fontWeight: 'bold',
            marginBottom: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            Final Report
          </Typography>

          {finalReportsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : finalReports.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No final report has been uploaded for this record.
            </Typography>
          ) : (
            finalReports.map((report) => (
              <Box
                key={report.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 2,
                  backgroundColor: '#f9f9f9'
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {report.attachmentName || 'Final Report'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded on {report.uploadedDate ? new Date(report.uploadedDate).toLocaleString() : 'N/A'}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => handleDownloadFinalReport(report)}
                  sx={{
                    background: RMSTheme.components.button.primary.background,
                    color: RMSTheme.components.button.primary.text,
                    padding: '8px 20px',
                    borderRadius: RMSTheme.borderRadius.small,
                    border: `1px solid ${RMSTheme.components.button.primary.border}`,
                    '&:hover': {
                      background: RMSTheme.components.button.primary.hover
                    }
                  }}
                >
                  Download
                </Button>
              </Box>
            ))
          )}
        </Paper>
      )}

      {/* Form Status Section */}
      <Paper sx={{
        ...sectionContainer,
        background: '#f8f9fa',
        border: '2px solid #e9ecef'
      }}>
        <Typography variant="h5" sx={sectionHeader}>
          ✅ Form Status
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 1 }}>
          <TextField
            fullWidth
            label="Form Status"
            value={formStatusDisplay || ''}
            disabled
            sx={fieldStyle}
          />
        </Box>
      </Paper>

      {/* Date & Time Information Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
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
            <TextField
              fullWidth
              label="Issue Reported Description"
              value={formData.issueReportedDescription || ''}
              disabled
              sx={fieldStyle}
            />
          </Box>

          <Box sx={fieldContainer}>
            <TextField
              fullWidth
              label="Issue Found Description"
              value={formData.issueFoundDescription || ''}
              disabled
              sx={fieldStyle}
            />
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
            <TextField
              fullWidth
              label="Action Taken Description"
              value={formData.actionTakenDescription || ''}
              disabled
              sx={fieldStyle}
            />
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

      {/* Remark Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          📝 Remark
        </Typography>

        <Box sx={{ marginTop: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Additional Remarks"
            value={formData.remark || ''}
            disabled
            sx={fieldStyle}
          />
        </Box>
      </Paper>

      {/* Approval Information Section */}
      <Paper sx={{
        ...sectionContainer,
        background: '#f8f9fa',
        border: '2px solid #e9ecef'
      }}>
        <Typography variant="h5" sx={sectionHeader}>
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
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
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
