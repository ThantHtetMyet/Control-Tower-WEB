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
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Description,
  CalendarToday,
  Person,
  Computer,
  NetworkCheck,
  CloudUpload,
  ArrowBack,
  Edit,
  Business,
  Assignment,
  Settings,
  Info,
  ExpandMore,
  Storage,
  Security
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

  const InfoField = ({ label, value, icon: Icon }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Box sx={{ p: 2, backgroundColor: RMSTheme.background.paper, borderRadius: 1, height: '100%' }}>
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
          {Icon && <Icon fontSize="small" />}
          {label}
        </Typography>
        <Typography 
          variant="body1"
          sx={{ 
            color: RMSTheme.text.primary,
            wordBreak: 'break-word'
          }}
        >
          {value || 'Not specified'}
        </Typography>
      </Box>
    </Grid>
  );

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
      <Container maxWidth="lg" sx={{ mt: 4, backgroundColor: RMSTheme.background.default, minHeight: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!reportForm) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, backgroundColor: RMSTheme.background.default, minHeight: '100vh' }}>
        <Alert severity="info">Report form not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ 
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
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                color: RMSTheme.text.primary,
                fontWeight: 'bold',
                mb: 1
              }}
            >
              Report Form Details
            </Typography>
            <Typography 
              variant="subtitle1"
              sx={{ 
                color: RMSTheme.text.secondary
              }}
            >
              Form ID: {reportForm.id}
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/report-management-system/report-forms/edit/${id}`)}
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

      {/* Status Overview */}
      <Card sx={{
        backgroundColor: RMSTheme.background.paper,
        boxShadow: RMSTheme.shadows.medium,
        borderRadius: RMSTheme.borderRadius.medium,
        mb: 3
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
            <Info />
            Status Overview
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ color: RMSTheme.text.secondary, mb: 1 }}>
                  Form Status
                </Typography>
                {getStatusChip(reportForm.formStatus)}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ color: RMSTheme.text.secondary, mb: 1 }}>
                  Upload Status
                </Typography>
                {getUploadStatusChip(reportForm.uploadStatus)}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ color: RMSTheme.text.secondary, mb: 1 }}>
                  Report Type
                </Typography>
                <Typography variant="body1" sx={{ color: RMSTheme.text.primary, fontWeight: 'medium' }}>
                  {reportForm.reportFormType?.name || reportForm.reportFormTypeName || 'Unknown'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ color: RMSTheme.text.secondary, mb: 1 }}>
                  Created Date
                </Typography>
                <Typography variant="body1" sx={{ color: RMSTheme.text.primary, fontWeight: 'medium' }}>
                  {reportForm.createdDate ? moment(reportForm.createdDate).format('MMM DD, YYYY') : 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Detailed Information Sections */}
      <Grid container spacing={3}>
        {/* Project Information */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: RMSTheme.primary.main,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Business />
                Project Information
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <InfoField 
                  label="Customer" 
                  value={reportForm.customer} 
                  icon={Business}
                />
                <InfoField 
                  label="Project Number" 
                  value={reportForm.projectNo} 
                  icon={Assignment}
                />
                <InfoField 
                  label="System Description" 
                  value={reportForm.systemDescription} 
                  icon={Settings}
                />
                <InfoField 
                  label="Project Manager" 
                  value={reportForm.projectManager} 
                  icon={Person}
                />
                <InfoField 
                  label="Site Location" 
                  value={reportForm.siteLocation} 
                  icon={Business}
                />
                <InfoField 
                  label="Contract Number" 
                  value={reportForm.contractNumber} 
                  icon={Description}
                />
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Technical Information */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: RMSTheme.primary.main,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Computer />
                Technical Information
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <InfoField 
                  label="Upload Hostname" 
                  value={reportForm.uploadHostname} 
                  icon={Computer}
                />
                <InfoField 
                  label="Upload IP Address" 
                  value={reportForm.uploadIPAddress} 
                  icon={NetworkCheck}
                />
                <InfoField 
                  label="Server Environment" 
                  value={reportForm.serverEnvironment} 
                  icon={Storage}
                />
                <InfoField 
                  label="Database Version" 
                  value={reportForm.databaseVersion} 
                  icon={Storage}
                />
                <InfoField 
                  label="Application Version" 
                  value={reportForm.applicationVersion} 
                  icon={Settings}
                />
                <InfoField 
                  label="Security Level" 
                  value={reportForm.securityLevel} 
                  icon={Security}
                />
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Form Details */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: RMSTheme.primary.main,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Description />
                Form Details
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <InfoField 
                  label="Form Title" 
                  value={reportForm.formTitle} 
                  icon={Description}
                />
                <InfoField 
                  label="Form Description" 
                  value={reportForm.formDescription} 
                  icon={Description}
                />
                <InfoField 
                  label="Form Version" 
                  value={reportForm.formVersion} 
                  icon={Info}
                />
                <InfoField 
                  label="Template Used" 
                  value={reportForm.templateName} 
                  icon={Description}
                />
                <InfoField 
                  label="Priority Level" 
                  value={reportForm.priorityLevel} 
                  icon={Info}
                />
                <InfoField 
                  label="Assigned To" 
                  value={reportForm.assignedTo} 
                  icon={Person}
                />
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Timestamps & Audit Trail */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: RMSTheme.primary.main,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <CalendarToday />
                Timestamps & Audit Trail
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <InfoField 
                  label="Created Date" 
                  value={reportForm.createdDate ? moment(reportForm.createdDate).format('YYYY-MM-DD HH:mm:ss') : null} 
                  icon={CalendarToday}
                />
                <InfoField 
                  label="Last Modified" 
                  value={reportForm.modifiedDate ? moment(reportForm.modifiedDate).format('YYYY-MM-DD HH:mm:ss') : null} 
                  icon={CalendarToday}
                />
                <InfoField 
                  label="Submitted Date" 
                  value={reportForm.submittedDate ? moment(reportForm.submittedDate).format('YYYY-MM-DD HH:mm:ss') : null} 
                  icon={CalendarToday}
                />
                <InfoField 
                  label="Approved Date" 
                  value={reportForm.approvedDate ? moment(reportForm.approvedDate).format('YYYY-MM-DD HH:mm:ss') : null} 
                  icon={CalendarToday}
                />
                <InfoField 
                  label="Created By" 
                  value={reportForm.createdBy} 
                  icon={Person}
                />
                <InfoField 
                  label="Modified By" 
                  value={reportForm.modifiedBy} 
                  icon={Person}
                />
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Additional Information */}
        {(reportForm.notes || reportForm.comments || reportForm.attachments) && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: RMSTheme.primary.main,
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Info />
                  Additional Information
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {reportForm.notes && (
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, backgroundColor: RMSTheme.background.paper, borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: RMSTheme.text.secondary, fontWeight: 'bold', mb: 1 }}>
                          Notes
                        </Typography>
                        <Typography variant="body1" sx={{ color: RMSTheme.text.primary, whiteSpace: 'pre-wrap' }}>
                          {reportForm.notes}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {reportForm.comments && (
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, backgroundColor: RMSTheme.background.paper, borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: RMSTheme.text.secondary, fontWeight: 'bold', mb: 1 }}>
                          Comments
                        </Typography>
                        <Typography variant="body1" sx={{ color: RMSTheme.text.primary, whiteSpace: 'pre-wrap' }}>
                          {reportForm.comments}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ReportFormDetails;