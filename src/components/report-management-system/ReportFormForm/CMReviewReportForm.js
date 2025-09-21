import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Person,
  Build,
  PhotoCamera,
  Assignment,
  Info,
  ArrowBack,
  ArrowForward,
  Inventory
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import moment from 'moment';
import RMSTheme from '../../theme-resource/RMSTheme';

const CMReviewReportForm = ({ 
  formData, 
  reportFormTypes, 
  onNext, 
  onBack, 
  loading, 
  error,
  materialUsedData = [],
  materialUsedOldSerialImages = [],
  materialUsedNewSerialImages = []
}) => {
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
    marginBottom: 2,
    '& .MuiTypography-root': {
      color: '#2C3E50'
    }
  };

  const labelStyle = {
    fontWeight: 600,
    color: '#34495E',
    fontSize: '14px',
    marginBottom: '4px'
  };

  const valueStyle = {
    color: '#2C3E50',
    fontSize: '14px',
    backgroundColor: '#f8f9fa',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #e9ecef',
    minHeight: '20px'
  };

  const getServiceTypeName = (typeId) => {
    if (!reportFormTypes || !typeId) return 'N/A';
    const type = reportFormTypes.find(t => t.id === typeId);
    return type ? type.name : 'N/A';
  };

  const formatDate = (date) => {
    return date ? moment(date).format('DD/MM/YYYY HH:mm') : 'Not specified';
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
        <Box sx={{ ...fieldStyle, textAlign: 'center', py: 3 }}>
          <IconComponent sx={{ fontSize: 48, color: '#bdc3c7', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No {title.toLowerCase()} uploaded
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={fieldStyle}>
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
          padding: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              marginBottom: 4,
              color: '#2C3E50',
              fontWeight: 700,
              textAlign: 'center',
              background: 'linear-gradient(45deg, #2C3E50, #3498DB)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            📋 Review Corrective Maintenance Report
          </Typography>
          
          {/* Basic Information Summary Section */}
          <Paper sx={{
            ...sectionContainerStyle,
            background: '#f8f9fa',
            border: '2px solid #e9ecef'
          }}>
            <Typography variant="h5" sx={sectionHeaderStyle}>
              📋 Basic Information Summary
            </Typography>
            
            <Grid container spacing={3} sx={{ marginTop: 1 }}>
              <Grid item xs={12} md={6}>
                <Box sx={fieldStyle}>
                  <Typography sx={labelStyle}>Service Type</Typography>
                  <Typography sx={valueStyle}>
                    {getServiceTypeName(formData.reportFormTypeID)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={fieldStyle}>
                  <Typography sx={labelStyle}>Station Name</Typography>
                  <Typography sx={valueStyle}>
                    {formData.stationName || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={fieldStyle}>
                  <Typography sx={labelStyle}>Customer</Typography>
                  <Typography sx={valueStyle}>
                    {formData.customer || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={fieldStyle}>
                  <Typography sx={labelStyle}>Project No</Typography>
                  <Typography sx={valueStyle}>
                    {formData.projectNo || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={fieldStyle}>
                  <Typography sx={labelStyle}>System Description</Typography>
                  <Typography sx={valueStyle}>
                    {formData.systemDescription || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Timeline Information Section */}
          <Paper sx={sectionContainerStyle}>
            <Typography variant="h5" sx={sectionHeaderStyle}>
              ⏰ Timeline Information
            </Typography>
            
            <Grid container spacing={3} sx={{ marginTop: 1 }}>
              <Grid item xs={12} md={6}>
                <Box sx={fieldStyle}>
                  <Typography sx={labelStyle}>Failure Detected Date</Typography>
                  <Typography sx={valueStyle}>
                    {formatDate(formData.failureDetectedDate)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={fieldStyle}>
                  <Typography sx={labelStyle}>Response Date</Typography>
                  <Typography sx={valueStyle}>
                    {formatDate(formData.responseDate)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={fieldStyle}>
                  <Typography sx={labelStyle}>Arrival Date</Typography>
                  <Typography sx={valueStyle}>
                    {formatDate(formData.arrivalDate)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={fieldStyle}>
                  <Typography sx={labelStyle}>Completion Date</Typography>
                  <Typography sx={valueStyle}>
                    {formatDate(formData.completionDate)}
                  </Typography>
                </Box>
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
              
              <Box sx={fieldStyle}>
                <Typography sx={labelStyle}>Issue Reported Description</Typography>
                <Typography sx={valueStyle}>
                  {formData.issueReportedDescription || 'Not specified'}
                </Typography>
              </Box>
              
              <Box sx={fieldStyle}>
                <Typography sx={labelStyle}>Issue Found Description</Typography>
                <Typography sx={valueStyle}>
                  {formData.issueFoundDescription || 'Not specified'}
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          {/* Action Taken Section */}
          <Paper sx={sectionContainerStyle}>
            <Typography variant="h5" sx={sectionHeaderStyle}>
              🔧 Action Taken
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
              <Box sx={fieldStyle}>
                <Typography sx={labelStyle}>Action Taken Description</Typography>
                <Typography sx={valueStyle}>
                  {formData.actionTakenDescription || 'Not specified'}
                </Typography>
              </Box>
              
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
              <Inventory sx={{ mr: 1 }} />
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
                <Box sx={{ ...fieldStyle, textAlign: 'center', py: 3 }}>
                  <Inventory sx={{ fontSize: 48, color: '#bdc3c7', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No material used data recorded
                  </Typography>
                </Box>
              )}

              {/* Material Used Images */}
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
          
          {/* Approval Information Section */}
          <Paper sx={sectionContainerStyle}>
            <Typography variant="h5" sx={sectionHeaderStyle}>
              Approval Information
            </Typography>
            
            <Grid container spacing={3} sx={{ marginTop: 1 }}>
              <Grid item xs={12} md={6}>
                <Box sx={fieldStyle}>
                  <Typography sx={labelStyle}>Attended By</Typography>
                  <Typography sx={valueStyle}>
                    {formData.attendedBy || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={fieldStyle}>
                  <Typography sx={labelStyle}>Approved By</Typography>
                  <Typography sx={valueStyle}>
                    {formData.approvedBy || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Reference Information Section */}
          <Paper sx={sectionContainerStyle}>
            <Typography variant="h5" sx={sectionHeaderStyle}>
              🔗 Reference Information
            </Typography>
            
            <Grid container spacing={3} sx={{ marginTop: 1 }}>
              <Grid item xs={12} md={6}>
                <Box sx={fieldStyle}>
                  <Typography sx={labelStyle}>Further Action Taken</Typography>
                  <Typography sx={valueStyle}>
                    {formData.furtherActionTakenName || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={fieldStyle}>
                  <Typography sx={labelStyle}>Form Status</Typography>
                  <Box sx={{ mt: 1 }}>
                    {getStatusChip(formData.formStatusName)}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Remark Section */}
          <Paper sx={sectionContainerStyle}>
            <Typography variant="h5" sx={sectionHeaderStyle}>
              📝 Remark
            </Typography>
            
            <Box sx={{ marginTop: 2 }}>
              <Box sx={fieldStyle}>
                <Typography sx={labelStyle}>Additional Remarks</Typography>
                <Typography sx={valueStyle}>
                  {formData.Remark || 'No additional remarks'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Show error if submission fails */}
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
                onClick={onNext}
                disabled={loading}  // This should prevent double clicks
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
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default CMReviewReportForm;