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
  Videocam as VideocamIcon,
  RemoveCircle as RemoveCircleIcon,
  AccessTime,
  Close as CloseIcon,
  Print as PrintIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  ArrowBackIosNew as ArrowBackIosNewIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import RMSTheme from '../../theme-resource/RMSTheme';
import {
  getRTUPMReportForm,
  generateRTUPMReportPdf,
  getFinalReportsByReportForm,
  downloadFinalReportAttachment
} from '../../api-services/reportFormService';
import { API_BASE_URL } from '../../../config/apiConfig';
import warehouseService from '../../api-services/warehouseService';

// Styling constants matching RTUPMReviewReportForm
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

// Helper functions matching RTUPMReviewReportForm
// Updated formatDate function to show both date and time
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  } catch (error) {
    return 'Invalid Date';
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

const getFieldValue = (item, ...keys) => {
  if (!item) return '';
  for (const key of keys) {
    const value = item[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return '';
};


// Image preview component matching RTUPMReviewReportForm
// Image preview component
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
            imageUrl = `/api/ReportFormImage/image/${reportFormId}/${image.imageName}`;
          } else if (image.ImageName && reportFormId) {
            // Fallback: construct URL using ImageName (PascalCase)
            imageUrl = `/api/ReportFormImage/image/${reportFormId}/${image.ImageName}`;
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

const RTUPMReportFormDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [rtuPMData, setRtuPMData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [formStatusName, setFormStatusName] = useState('');
  const [formStatusId, setFormStatusId] = useState('');
  const [finalReports, setFinalReports] = useState([]);
  const [finalReportsLoading, setFinalReportsLoading] = useState(false);
  const [formStatusOptions, setFormStatusOptions] = useState([]);
  const reportTitle = formData?.pmReportFormRTU?.reportTitle || 'RTU Preventive Maintenance Report';
  const normalizedFormStatus = (formStatusName || '').trim().toLowerCase();
  const isFormStatusClosed = normalizedFormStatus === 'close';
  const formStatusDisplay =
    formStatusName ||
    formData?.pmReportFormRTU?.formstatusName ||
    formData?.pmReportFormRTU?.formstatusID ||
    'Not specified';

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        setLoading(true);
        // Use the new RTU PM specific API
        const response = await getRTUPMReportForm(id);
        setFormData(response);
        const statusId =
          response.formStatus ||
          response.formstatusID ||
          response.pmReportFormRTU?.formstatusID ||
          response.pmReportFormRTU?.formStatusID ||
          response.pmReportFormRTU?.formstatus ||
          '';
        setFormStatusId(statusId);

        // Structure the RTU PM data from the new API response
        // Apply News system pattern: construct image URLs similar to NewsController
        const rtuData = {
          // Fix: Use correct camelCase property names and construct image URLs
          pmMainRtuCabinetImages: (response.pmMainRtuCabinetImages || []).map(image => ({
            ...image,
            imageUrl: image.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${image.imageName}` : null
          })),
          pmMainRtuCabinetData: response.pmMainRtuCabinet || [],

          pmChamberMagneticContactImages: (response.pmChamberMagneticContactImages || []).map(image => ({
            ...image,
            imageUrl: image.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${image.imageName}` : null
          })),
          pmChamberMagneticContactData: response.pmChamberMagneticContact || [],

          pmRTUCabinetCoolingImages: (response.pmrtuCabinetCoolingImages || response.pmRTUCabinetCoolingImages || []).map(image => ({
            ...image,
            imageUrl: image.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${image.imageName}` : null
          })),
          pmRTUCabinetCoolingData: response.pmrtuCabinetCooling || response.pmRTUCabinetCooling || [],

          pmDVREquipmentImages: (response.pmdvrEquipmentImages || response.pmDVREquipmentImages || []).map(image => ({
            ...image,
            imageUrl: image.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${image.imageName}` : null
          })),
          pmDVREquipmentData: response.pmdvrEquipment || response.pmDVREquipment || []
        };
        setRtuPMData(rtuData);
      } catch (err) {
        setError('Failed to load RTU PM report details');
        console.error('Error fetching RTU PM report details:', err);
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
        console.error('Failed to fetch form status options:', err);
      }
    };

    loadStatuses();
  }, []);

  useEffect(() => {
    if (!formStatusId) return;

    const match = (formStatusOptions || []).find((status) => (status.id || status.ID) === formStatusId);
    const resolvedName = match?.name || match?.Name || formStatusId;
    setFormStatusName(resolvedName);
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

      const response = await generateRTUPMReportPdf(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      const disposition = response.headers['content-disposition'];
      let fileName = `RTUPMReport_${formData?.jobNo || id}.pdf`;
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
      console.error('Error generating RTU PDF:', error);
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

  const handleSubmit = () => {
    // For details view, this could be used for actions like approval
    console.log('Report viewed');
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
          {reportTitle}
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
      {/* Action Buttons - Moved to top */}

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



          {isFormStatusClosed ? (

            <Typography variant="body2" color="text.secondary">

            </Typography>

          ) : (

            <Box sx={{ display: 'flex', gap: 2 }}>

              <Button

                variant="contained"

                onClick={() => navigate(`/report-management-system/rtu-pm-edit/${id}`)}

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

      {/* Basic Information Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          Basic Information
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
            value={formData.systemNameWarehouseName || ''}
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

          <TextField
            fullWidth
            label="Project No"
            value={formData.pmReportFormRTU?.projectNo || ''}
            disabled
            sx={fieldStyle}
          />

          <TextField
            fullWidth
            label="Customer"
            value={formData.pmReportFormRTU?.customer || ''}
            disabled
            sx={fieldStyle}
          />

          <TextField
            fullWidth
            label="Report Form Type"
            value={formData.reportFormTypeName || 'Preventative Maintenance'}
            disabled
            sx={fieldStyle}
          />

          <TextField
            fullWidth
            label="PM Report Form Type"
            value={formData.pmReportFormTypeName || 'RTU'}
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

      {/* Date of Service Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          📅 Date of Service
        </Typography>
        <TextField
          fullWidth
          label="Service Date & Time"
          value={formatDate(formData?.pmReportFormRTU?.dateOfService)}
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
          reportFormId={id}
        />

        {rtuPMData.pmMainRtuCabinetData && rtuPMData.pmMainRtuCabinetData.length > 0 ? (
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
                {rtuPMData.pmMainRtuCabinetData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{getStatusChip(getFieldValue(row, 'rtuCabinet', 'RTUCabinet'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'equipmentRack', 'EquipmentRack'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'monitor', 'Monitor'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'mouseKeyboard', 'MouseKeyboard'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'cpU6000Card', 'CPU6000Card'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'inputCard', 'InputCard'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'megapopNTU', 'MegapopNTU'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'networkRouter', 'NetworkRouter'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'networkSwitch', 'NetworkSwitch'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'digitalVideoRecorder', 'DigitalVideoRecorder'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'rtuDoorContact', 'RTUDoorContact'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'powerSupplyUnit', 'PowerSupplyUnit'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'upsBattery', 'UPSBattery'))}</TableCell>
                    <TableCell>{getFieldValue(row, 'remarks', 'Remarks') || '-'}</TableCell>
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
          reportFormId={id}
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
                    <TableCell>{getFieldValue(row, 'chamberNumber', 'ChamberNumber') || '-'}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'chamberOGBox', 'ChamberOGBox'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'chamberContact1', 'ChamberContact1'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'chamberContact2', 'ChamberContact2'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'chamberContact3', 'ChamberContact3'))}</TableCell>
                    <TableCell>{getFieldValue(row, 'remarks', 'Remarks') || '-'}</TableCell>
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
          reportFormId={id}
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
                    <TableCell>{row.fanNumber || row.FanNumber || '-'}</TableCell>
                    <TableCell>{getStatusChip(row.functionalStatus || row.FunctionalStatus)}</TableCell>
                    <TableCell>{row.remarks || row.Remarks || '-'}</TableCell>
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
          reportFormId={id}
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
                    <TableCell>{getStatusChip(getFieldValue(row, 'dvrComm', 'DVRComm'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'dvrraidComm', 'DVRRAIDComm'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'timeSyncNTPServer', 'TimeSyncNTPServer'))}</TableCell>
                    <TableCell>{getStatusChip(getFieldValue(row, 'recording24x7', 'Recording24x7'))}</TableCell>
                    <TableCell>{getFieldValue(row, 'remarks', 'Remarks') || '-'}</TableCell>
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
          value={formData?.pmReportFormRTU?.cleaningOfCabinet || 'Not specified'}
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
          value={formData?.pmReportFormRTU?.remarks || ''}
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
            value={formData?.pmReportFormRTU?.attendedBy || ''}
            disabled
            sx={fieldStyle}
          />
          <TextField
            fullWidth
            label="Approved By"
            value={formData?.pmReportFormRTU?.approvedBy || ''}
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

export default RTUPMReportFormDetails;
