import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Container
} from '@mui/material';
import {
  Description,
  CalendarToday,
  Person,
  Computer,
  NetworkCheck,
  CloudUpload,
  ArrowBack,
  Edit
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportForm } from '../api-services/reportFormService';
import moment from 'moment';
import RMSTheme from '../theme-resource/RMSTheme';

const ReportFormDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reportForm, setReportForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportForm();
  }, [id]);

  const fetchReportForm = async () => {
    try {
      setLoading(true);
      const data = await getReportForm(id);
      setReportForm(data);
    } catch (err) {
      setError('Error fetching report form: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusColors = {
      'Draft': { backgroundColor: RMSTheme.status.info, color: RMSTheme.text.onPrimary },
      'Submitted': { backgroundColor: RMSTheme.primary.main, color: RMSTheme.text.onPrimary },
      'Under Review': { backgroundColor: RMSTheme.status.warning, color: RMSTheme.text.onPrimary },
      'Approved': { backgroundColor: RMSTheme.status.success, color: RMSTheme.text.onPrimary },
      'Rejected': { backgroundColor: RMSTheme.status.error, color: RMSTheme.text.onPrimary }
    };
    return (
      <Chip 
        label={status} 
        sx={statusColors[status] || { backgroundColor: RMSTheme.background.default }}
        size="medium" 
      />
    );
  };

  const getUploadStatusChip = (status) => {
    const statusColors = {
      'Pending': { backgroundColor: RMSTheme.background.default, color: RMSTheme.text.secondary },
      'Uploading': { backgroundColor: RMSTheme.status.info, color: RMSTheme.text.onPrimary },
      'Completed': { backgroundColor: RMSTheme.status.success, color: RMSTheme.text.onPrimary },
      'Failed': { backgroundColor: RMSTheme.status.error, color: RMSTheme.text.onPrimary }
    };
    return (
      <Chip 
        label={status} 
        sx={statusColors[status] || { backgroundColor: RMSTheme.background.default }}
        size="medium" 
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        backgroundColor: RMSTheme.background.default
      }}>
        <CircularProgress sx={{ color: RMSTheme.primary.main }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, backgroundColor: RMSTheme.background.default, minHeight: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!reportForm) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, backgroundColor: RMSTheme.background.default, minHeight: '100vh' }}>
        <Alert severity="info">Report form not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ 
      py: 4,
      backgroundColor: RMSTheme.background.default,
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/report-management-system/report-forms')}
            sx={{
              color: RMSTheme.primary.main,
              '&:hover': {
                backgroundColor: RMSTheme.background.hover,
                color: RMSTheme.primary.dark
              }
            }}
          >
            Back to List
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              color: RMSTheme.text.primary,
              fontWeight: 'bold'
            }}
          >
            Report Form Details
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/report-management-system/report-forms/${id}/edit`)}
            sx={{
              background: RMSTheme.gradients.primary,
              color: RMSTheme.text.onPrimary,
              boxShadow: RMSTheme.shadows.medium,
              '&:hover': {
                background: RMSTheme.gradients.accent,
                boxShadow: RMSTheme.shadows.large
              }
            }}
          >
            Edit Form
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Card sx={{
            backgroundColor: RMSTheme.background.paper,
            boxShadow: RMSTheme.shadows.medium,
            borderRadius: RMSTheme.borderRadius.medium
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  color: RMSTheme.primary.main,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3
                }}
              >
                <Description />
                Basic Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: RMSTheme.text.secondary,
                        fontWeight: 'bold',
                        mb: 1
                      }}
                    >
                      Form ID
                    </Typography>
                    <Typography 
                      variant="body1"
                      sx={{ color: RMSTheme.text.primary }}
                    >
                      {reportForm.id}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: RMSTheme.text.secondary,
                        fontWeight: 'bold',
                        mb: 1
                      }}
                    >
                      Report Type
                    </Typography>
                    <Typography 
                      variant="body1"
                      sx={{ color: RMSTheme.text.primary }}
                    >
                      {reportForm.reportFormType?.name || 'Unknown'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: RMSTheme.text.secondary,
                        fontWeight: 'bold',
                        mb: 1
                      }}
                    >
                      Form Status
                    </Typography>
                    {getStatusChip(reportForm.formStatus)}
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: RMSTheme.text.secondary,
                        fontWeight: 'bold',
                        mb: 1
                      }}
                    >
                      Upload Status
                    </Typography>
                    {getUploadStatusChip(reportForm.uploadStatus)}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Technical Information */}
        <Grid item xs={12}>
          <Card sx={{
            backgroundColor: RMSTheme.background.paper,
            boxShadow: RMSTheme.shadows.medium,
            borderRadius: RMSTheme.borderRadius.medium
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  color: RMSTheme.primary.main,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3
                }}
              >
                <Computer />
                Technical Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: RMSTheme.text.secondary,
                        fontWeight: 'bold',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Computer fontSize="small" />
                      Upload Hostname
                    </Typography>
                    <Typography 
                      variant="body1"
                      sx={{ color: RMSTheme.text.primary }}
                    >
                      {reportForm.uploadHostname || 'Not specified'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: RMSTheme.text.secondary,
                        fontWeight: 'bold',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <NetworkCheck fontSize="small" />
                      Upload IP Address
                    </Typography>
                    <Typography 
                      variant="body1"
                      sx={{ color: RMSTheme.text.primary }}
                    >
                      {reportForm.uploadIPAddress || 'Not specified'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Timestamps */}
        <Grid item xs={12}>
          <Card sx={{
            backgroundColor: RMSTheme.background.paper,
            boxShadow: RMSTheme.shadows.medium,
            borderRadius: RMSTheme.borderRadius.medium
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  color: RMSTheme.primary.main,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3
                }}
              >
                <CalendarToday />
                Timestamps
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: RMSTheme.text.secondary,
                        fontWeight: 'bold',
                        mb: 1
                      }}
                    >
                      Created Date
                    </Typography>
                    <Typography 
                      variant="body1"
                      sx={{ color: RMSTheme.text.primary }}
                    >
                      {reportForm.createdDate ? moment(reportForm.createdDate).format('YYYY-MM-DD HH:mm:ss') : 'Not available'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: RMSTheme.text.secondary,
                        fontWeight: 'bold',
                        mb: 1
                      }}
                    >
                      Last Modified
                    </Typography>
                    <Typography 
                      variant="body1"
                      sx={{ color: RMSTheme.text.primary }}
                    >
                      {reportForm.modifiedDate ? moment(reportForm.modifiedDate).format('YYYY-MM-DD HH:mm:ss') : 'Not available'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ReportFormDetails;