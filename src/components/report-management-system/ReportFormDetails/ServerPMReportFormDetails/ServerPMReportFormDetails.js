import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import { 
  Computer as ComputerIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Assignment as AssignmentIcon,
  NetworkCheck as NetworkCheckIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Videocam as VideocamIcon,
  Schedule as ScheduleIcon,
  Update as UpdateIcon,
  SwapHoriz as SwapHorizIcon,
  Security as SecurityIcon,
  SystemUpdate as SystemUpdateIcon,
  ArrowBackIosNew as ArrowBackIosNewIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
} from '@mui/icons-material';
import RMSTheme from '../../../theme-resource/RMSTheme';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate, useParams } from 'react-router-dom';

// Component imports
import ServerHealth_Details from './ServerHealth_Details';
import HardDriveHealth_Details from './HardDriveHealth_Details';
import DiskUsage_Details from './DiskUsage_Details';
import CPUAndRamUsage_Details from './CPUAndRamUsage_Details';
import NetworkHealth_Details from './NetworkHealth_Details';
import WillowlynxProcessStatus_Details from './WillowlynxProcessStatus_Details';
import WillowlynxNetworkStatus_Details from './WillowlynxNetworkStatus_Details';
import WillowlynxRTUStatus_Details from './WillowlynxRTUStatus_Details';
import WillowlynxHistorialTrend_Details from './WillowlynxHistorialTrend_Details';
import WillowlynxHistoricalReport_Details from './WillowlynxHistoricalReport_Details';
import WillowlynxSumpPitCCTVCamera_Details from './WillowlynxSumpPitCCTVCamera_Details';
import MonthlyDatabaseCreation_Details from './MonthlyDatabaseCreation_Details';
import DatabaseBackup_Details from './DatabaseBackup_Details';
import TimeSync_Details from './TimeSync_Details';
import HotFixes_Details from './HotFixes_Details';
import AutoFailOver_Details from './AutoFailOver_Details';
import ASAFirewall_Details from './ASAFirewall_Details';
import SoftwarePatch_Details from './SoftwarePatch_Details';
import ServerPMReportFormSignOff_Details from './ServerPMReportFormSignOff_Details';

// Import the report form service
import { getServerPMReportFormWithDetails, generateServerPMReportPdf, getFinalReportsByReportForm, downloadFinalReportAttachment } from '../../../api-services/reportFormService';

const ServerPMReportFormDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // State management
  const [formData, setFormData] = useState(null);
  const [serverPMData, setServerPMData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState('signOff');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [finalReports, setFinalReports] = useState([]);
  const [finalReportsLoading, setFinalReportsLoading] = useState(false);
  
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Step configuration - matching ServerPMReportForm exactly
  const steps = [
    'signOff',
    'serverHealth',
    'hardDriveHealth', 
    'diskUsage',
    'cpuAndRamUsage',
    'networkHealth',
    'willowlynxProcessStatus',
    'willowlynxNetworkStatus',
    'willowlynxRTUStatus',
    'willowlynxHistorialTrend',
    'willowlynxHistoricalReport',
    'willowlynxSumpPitCCTVCamera',
    'monthlyDatabaseCreation',
    'databaseBackup',
    'timeSync',
    'hotFixes',
    'autoFailOver',
    'asaFirewall',
    'softwarePatch'
  ];

  const stepTitles = {
    serverHealth: 'Server Health Check',
    networkHealth: 'Network Health Check',
    hardDriveHealth: 'Hard Drive Health Check',
    diskUsage: 'Disk Usage Check',
    cpuAndRamUsage: 'CPU and RAM Usage Check',
    willowlynxProcessStatus: 'Willowlynx Process Status Check',
    willowlynxNetworkStatus: 'Willowlynx Network Status Check',
    willowlynxRTUStatus: 'Willowlynx RTU Status Check',
    willowlynxHistorialTrend: 'Willowlynx Historical Trend Check',
    willowlynxHistoricalReport: 'Willowlynx Historical Report Check',
    willowlynxSumpPitCCTVCamera: 'Willowlynx Sump Pit CCTV Camera Check',
    monthlyDatabaseCreation: 'Monthly Database Creation Check',
    databaseBackup: 'Database Backup Check',
    timeSync: 'SCADA & Historical Time Sync Check',
    hotFixes: 'Hotfixes / Service Packs',
    autoFailOver: 'Auto failover of SCADA server',
    asaFirewall: 'ASA Firewall Maintenance',
    softwarePatch: 'Software Patch Summary',
    signOff: 'Sign Off'
  };

  // Fetch report form data
  useEffect(() => {
    const fetchReportFormData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await getServerPMReportFormWithDetails(id);
        
        const serverData = response.pmReportFormServer || {};
        const signOffPayload = serverData.signOffData || {};
        // Merge reportForm and pmReportFormServer data for form display
        const mergedFormData = {
          ...serverData,
          reportFormTypeID: response.reportForm?.reportFormTypeID,
          reportFormTypeName: response.reportForm?.reportFormTypeName,
          systemNameWarehouseID: response.reportForm?.systemNameWarehouseID,
          stationNameWarehouseID: response.reportForm?.stationNameWarehouseID,
          jobNo: response.reportForm?.jobNo || serverData.jobNo,
          systemDescription: response.reportForm?.systemDescription || serverData.systemDescription,
          stationName: response.reportForm?.stationName || serverData.stationName,
          formstatusID: serverData.formstatusID || null,
          formStatusName: serverData.formStatusName || '',
          signOffData: {
            attendedBy: signOffPayload.attendedBy ?? serverData.attendedBy ?? '',
            witnessedBy: signOffPayload.witnessedBy ?? serverData.witnessedBy ?? '',
            startDate: signOffPayload.startDate ?? serverData.startDate ?? null,
            completionDate: signOffPayload.completionDate ?? serverData.completionDate ?? null,
            remarks: signOffPayload.remarks ?? serverData.remarks ?? ''
          }
        };
        
        setFormData(mergedFormData);
        
        // Simple data mapping for UI display only
        const serverPMData = {
          serverHealthData: response.pmServerHealths || [],
          hardDriveHealthData: response.pmServerHardDriveHealths || [],
          diskUsageData: response.pmServerDiskUsageHealths || [],
          cpuAndRamUsageData: response.pmServerCPUAndMemoryUsages || [],
          networkHealthData: response.pmServerNetworkHealths || [],
          willowlynxProcessStatusData: response.pmServerWillowlynxProcessStatuses || [],
          willowlynxNetworkStatusData: response.pmServerWillowlynxNetworkStatuses || [],
          willowlynxRTUStatusData: response.pmServerWillowlynxRTUStatuses || [],
          willowlynxHistorialTrendData: response.pmServerWillowlynxHistoricalTrends || [],
          willowlynxHistoricalReportData: response.pmServerWillowlynxHistoricalReports || [],
          willowlynxSumpPitCCTVCameraData: response.pmServerWillowlynxCCTVCameras || [],
          monthlyDatabaseCreationData: response.pmServerMonthlyDatabaseCreations || [],
          databaseBackupData: response.pmServerDatabaseBackups || [],
          timeSyncData: response.pmServerTimeSyncs || [],
          hotFixesData: response.pmServerHotFixes || [],
          autoFailOverData: response.pmServerFailOvers || [],
          asaFirewallData: response.pmServerASAFirewalls || [],
          softwarePatchData: response.pmServerSoftwarePatchSummaries || []
        };
        
        setServerPMData(serverPMData);
      } catch (err) {
        console.error('Error fetching report form details:', err);
        setError('Error fetching report form details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportFormData();
  }, [id]);


  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Navigation functions - matching ServerPMReportForm exactly
  const handleStepNavigation = (targetStep) => {
    if (targetStep !== currentStep && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(targetStep);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleNext = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      handleStepNavigation(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      // Navigate to previous step
      handleStepNavigation(steps[currentIndex - 1]);
    } else {
      // If we're on the first step, go back to the report forms list
      navigate('/report-management-system/report-forms');
    }
  };

  // PDF Generation function - call API and download PDF
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

      const response = await generateServerPMReportPdf(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      const disposition = response.headers['content-disposition'];
      let fileName = `ServerPMReport_${formData.jobNo || id}.pdf`;
      if (disposition) {
        const match = disposition.match(/filename="([^"]+)"/i);
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
      console.error('Error generating PDF:', error);
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

  // Component rendering - matching ServerPMReportForm exactly
  const renderCurrentStep = () => {
    const componentMap = {
      serverHealth: ServerHealth_Details,
      networkHealth: NetworkHealth_Details,
      hardDriveHealth: HardDriveHealth_Details,
      diskUsage: DiskUsage_Details,
      cpuAndRamUsage: CPUAndRamUsage_Details,
      willowlynxProcessStatus: WillowlynxProcessStatus_Details,
      willowlynxNetworkStatus: WillowlynxNetworkStatus_Details,
      willowlynxRTUStatus: WillowlynxRTUStatus_Details,
      willowlynxHistorialTrend: WillowlynxHistorialTrend_Details,
      willowlynxHistoricalReport: WillowlynxHistoricalReport_Details,
      willowlynxSumpPitCCTVCamera: WillowlynxSumpPitCCTVCamera_Details,
      monthlyDatabaseCreation: MonthlyDatabaseCreation_Details,
      databaseBackup: DatabaseBackup_Details,
      timeSync: TimeSync_Details,
      hotFixes: HotFixes_Details,
      autoFailOver: AutoFailOver_Details,
      asaFirewall: ASAFirewall_Details,
      softwarePatch: SoftwarePatch_Details,
      signOff: ServerPMReportFormSignOff_Details
    };

    const Component = componentMap[currentStep];
    if (!Component) {
      return (
        <Box sx={{ padding: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No data available for this step
          </Typography>
        </Box>
      );
    }

    const dataKey =
      currentStep === 'serverHealth' ? 'serverHealthData' :
      currentStep === 'networkHealth' ? 'networkHealthData' :
      currentStep === 'hardDriveHealth' ? 'hardDriveHealthData' :
      currentStep === 'diskUsage' ? 'diskUsageData' :
      currentStep === 'cpuAndRamUsage' ? 'cpuAndRamUsageData' :
      currentStep === 'willowlynxProcessStatus' ? 'willowlynxProcessStatusData' :
      currentStep === 'willowlynxNetworkStatus' ? 'willowlynxNetworkStatusData' :
      currentStep === 'willowlynxRTUStatus' ? 'willowlynxRTUStatusData' :
      currentStep === 'willowlynxHistorialTrend' ? 'willowlynxHistorialTrendData' :
      currentStep === 'willowlynxHistoricalReport' ? 'willowlynxHistoricalReportData' :
      currentStep === 'willowlynxSumpPitCCTVCamera' ? 'willowlynxSumpPitCCTVCameraData' :
      currentStep === 'monthlyDatabaseCreation' ? 'monthlyDatabaseCreationData' :
      currentStep === 'databaseBackup' ? 'databaseBackupData' :
      currentStep === 'timeSync' ? 'timeSyncData' :
      currentStep === 'hotFixes' ? 'hotFixesData' :
      currentStep === 'autoFailOver' ? 'autoFailOverData' :
      currentStep === 'asaFirewall' ? 'asaFirewallData' :
      currentStep === 'softwarePatch' ? 'softwarePatchData' :
      currentStep === 'signOff' ? 'signOffData' : 'serverHealthData';

    return (
      <Component
        data={currentStep === 'signOff' ? formData.signOffData : (serverPMData[dataKey] || [])}
      />
    );
  };

  const isFormStatusClosed = (formData?.formStatusName || formData?.formStatus || '').trim().toLowerCase() === 'close';

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

  const renderProgressDots = () => {
    return (
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        alignItems: 'center',
        overflow: 'hidden',
        maxWidth: '100%',
        paddingY: 1,
      }}>
        {steps.map((step, index) => {
          const isActive = currentStep === step;
          
           return (
            <Tooltip 
              key={step}
              title={`${index + 1}. ${stepTitles[step] || step}`}
              placement="top"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#2C3E50',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }
                }
              }}
            >
              <Box
                onClick={() => handleStepNavigation(step)}
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#1976d2' : '#e0e0e0',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  flexShrink: 0,
                  '&:hover': {
                    transform: 'scale(1.2)',
                    backgroundColor: isActive ? '#1565c0' : '#bdbdbd'
                  }
                }}
              />
            </Tooltip>
          );
        })}
      </Box>
    );
  };
  // Styling - matching ServerPMReportForm exactly
  const fieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f5f5f5',
      '& fieldset': {
        borderColor: '#d0d0d0'
      }
    }
  };

  const stepContainerStyle = {
    marginBottom: 3,
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // No data state
  if (!formData) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="warning">Report form not found</Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
            {formData.reportTitle ? `${formData.reportTitle}` : 'Server PM Report - Details'}
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
                fontSize: '14px',
                display: 'inline',
                marginLeft: '4px'
              }}
            >
              {formData.jobNo || 'N/A'}
            </Typography>
          </Box>
        </Box>

        {/* Header Action Buttons - Following CMReportFormDetails pattern */}
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
                  onClick={() => navigate('/report-management-system/report-forms')}
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
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {!isFormStatusClosed && (
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/report-management-system/server-pm-edit/${id}`)}
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
                  )}
                  
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
                      },
                      '&:disabled': {
                        opacity: 0.6
                      }
                    }}
                  >
                    {isGeneratingPDF ? 'Generating PDF...' : 'Print Report'}
                  </Button>
                </Box>
              </Box>
            </Paper>

          {/* Main Content */}
          <Box>
            {/* Basic Information Summary */}
            <Paper sx={{
              padding: 3,
              marginBottom: 3,
              backgroundColor: '#ffffff',
              borderRadius: 2,
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              background: '#f8f9fa',
              border: '2px solid #e9ecef'
            }}>
              <Typography variant="h5" sx={{
                color: '#1976d2',
                fontWeight: 'bold',
                marginBottom: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AssignmentIcon fontSize="inherit" />
                Basic Information Summary
              </Typography>
              
              <Grid container spacing={3} sx={{ marginTop: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Job No"
                    value={formData.jobNo || ''}
                    disabled
                    sx={fieldStyle}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="System Description"
                    value={formData.systemDescription || ''}
                    disabled
                    sx={fieldStyle}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Station Name"
                    value={formData.stationName || ''}
                    disabled
                    sx={fieldStyle}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Customer"
                    value={formData.customer || ''}
                    disabled
                    sx={fieldStyle}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Project No"
                    value={formData.projectNo || ''}
                    disabled
                    sx={fieldStyle}
                  />
                </Grid>
              </Grid>
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

            {/* Form Status */}
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
                Form Status
              </Typography>
              <TextField
                fullWidth
                label="Form Status"
                value={formData.formStatusName || formData.formStatus || 'Not specified'}
                disabled
                sx={fieldStyle}
              />
            </Paper>

            {/* Current Step Content */}
            <Box sx={stepContainerStyle}>
              {renderCurrentStep()}
            </Box>

            {/* Navigation Footer */}
            <Paper sx={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              marginTop: '24px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              position: 'sticky',
              bottom: 0,
              zIndex: 1000
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleBack}
                  disabled={isTransitioning}
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
                    },
                    '&:disabled': {
                      opacity: 0.6
                    }
                  }}
                >
                   Back
                </Button>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ color: '#2C3E50', fontWeight: 600 }}>
                    {stepTitles[currentStep]}
                  </Typography>
                  {renderProgressDots()}
                </Box>
                
                                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={isTransitioning || currentStep === 'softwarePatch'}
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
                    },
                    '&:disabled': {
                      opacity: 0.6
                    }
                  }}
                >
                  {currentStep === 'softwarePatch' ? 'End' : 'Next '}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
    </LocalizationProvider>
  );
};

export default ServerPMReportFormDetails;
