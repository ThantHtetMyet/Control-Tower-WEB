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
  IconButton
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
import { getCMReportFormByReportFormId, getReportFormImages, getCMMaterialUsed } from '../../api-services/reportFormService';
import { API_BASE_URL } from '../../../config/apiConfig';

// Styling constants matching RTUPMReportFormDetails
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
      />
    );
  } else if (statusStr === 'Not Acceptable') {
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

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  if (!images || images.length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 4, 
        backgroundColor: '#f9f9f9', 
        borderRadius: 2,
        border: '2px dashed #ddd'
      }}>
        <IconComponent sx={{ fontSize: 48, color: '#bdc3c7', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          No {title.toLowerCase()} uploaded
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <IconComponent sx={{ mr: 1 }} />
        {title} ({images.length})
      </Typography>
      
      <Grid container spacing={2}>
        {images.map((image, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                }
              }}
              onClick={() => handleImageClick(image)}
            >
              <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                <img
                  src={image.imageUrl || `${API_BASE_URL}/api/ReportFormImage/image/${reportFormId}/${image.imageName}`}
                  alt={image.originalFileName || image.imageName}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    color: '#999'
                  }}
                >
                  <Typography variant="body2">Image not available</Typography>
                </Box>
              </Box>
              <CardContent sx={{ p: 1 }}>
                <Typography variant="caption" sx={{ 
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {image.originalFileName || image.imageName}
                </Typography>
                {image.uploadedDate && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {formatDate(image.uploadedDate)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Image Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 24,
          p: 2
        }}>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <img
              src={selectedImage.imageUrl || `${API_BASE_URL}/api/ReportFormImage/image/${reportFormId}/${selectedImage.imageName}`}
              alt={selectedImage.originalFileName || selectedImage.imageName}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain'
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
  const [cmData, setCmData] = useState({});
  const [materialUsedData, setMaterialUsedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch CM Report Form data by ReportForm ID
        const cmReportForms = await getCMReportFormByReportFormId(id);
        console.log('CM API Response:', cmReportForms);
        
        // The API returns an array, so take the first one
        const cmReportForm = cmReportForms[0];
        if (!cmReportForm) {
          throw new Error('CM Report Form not found');
        }
        
        setFormData(cmReportForm);
        
        // Fetch images using the ReportForm ID
        const images = await getReportFormImages(id);
        console.log('Images Response:', images);
        
        // Process images and organize by section
        const processedImages = images.map(img => ({
          ...img,
          imageUrl: `${API_BASE_URL}/api/ReportFormImage/image/${cmReportForm.reportFormID}/${img.imageName}`,
          originalFileName: img.imageName,
          uploadedDate: img.uploadedDate,
          sectionName: img.storedDirectory ? img.storedDirectory.split('\\').pop() || img.storedDirectory.split('/').pop() : null
        }));
        
        const organizedImages = {
          beforeIssue: processedImages.filter(img => img.sectionName === 'BeforeIssue'),
          afterAction: processedImages.filter(img => img.sectionName === 'AfterAction'),
          oldSerialNo: processedImages.filter(img => img.sectionName === 'OldSerialNo'),
          newSerialNo: processedImages.filter(img => img.sectionName === 'NewSerialNo')
        };
        
        // Fetch material used data
        let materialUsed = [];
        try {
          materialUsed = await getCMMaterialUsed(cmReportForm.id);
          console.log('Material Used Response:', materialUsed);
        } catch (materialError) {
          console.warn('No material used data found:', materialError);
        }
        
        setCmData({
          ...cmReportForm,
          images: organizedImages
        });
        setMaterialUsedData(materialUsed);
        
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
          Corrective Maintenance Report - Details
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
              onClick={() => navigate(`/report-management-system/report-forms/edit/${id}`)}
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
              onClick={() => window.print()}
              startIcon={<PrintIcon />}
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
              Print Report
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
              <Typography variant="body1">{formData.stationName || 'Not specified'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>System Description</Typography>
              <Typography variant="body1">{formData.systemDescription || 'Not specified'}</Typography>
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
            images={cmData.images?.beforeIssue || []} 
            title="Before Issue Images" 
            icon={PhotoCameraIcon}
            reportFormId={formData.reportFormID}
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
            images={cmData.images?.afterAction || []} 
            title="After Action Images" 
            icon={BuildIcon}
            reportFormId={formData.reportFormID}
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
          {materialUsedData && materialUsedData.length > 0 ? (
            <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>New Serial No</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Old Serial No</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Remark</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materialUsedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.itemDescription || 'Not specified'}</TableCell>
                      <TableCell>{row.newSerialNo || 'Not specified'}</TableCell>
                      <TableCell>{row.oldSerialNo || 'Not specified'}</TableCell>
                      <TableCell>{row.remark || 'Not specified'}</TableCell>
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
                images={cmData.images?.oldSerialNo || []} 
                title="Old Serial No Images" 
                icon={RemoveCircleIcon}
                reportFormId={formData.reportFormID}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ImagePreviewSection 
                images={cmData.images?.newSerialNo || []} 
                title="New Serial No Images" 
                icon={CheckCircleIcon}
                reportFormId={formData.reportFormID}
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
    </Box>
  );
};

export default CMReportFormDetails;