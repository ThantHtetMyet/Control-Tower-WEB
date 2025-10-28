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
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import { 
  Computer as ComputerIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
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

// Import API service
import { getServerPMReportFormWithDetails } from '../../../api-services/reportFormService';

const ServerPMReportFormDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // State management
  const [formData, setFormData] = useState(null);
  const [serverPMData, setServerPMData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState('serverHealth');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Step configuration - matching ServerPMReportForm exactly
  const steps = [
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
    softwarePatch: 'Software Patch Summary'
  };

  // Fetch report form data
  useEffect(() => {
    const fetchReportFormData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await getServerPMReportFormWithDetails(id);
        
        // Merge reportForm and pmReportFormServer data for form display
        const mergedFormData = {
          ...response.pmReportFormServer,
          // Add reportForm fields that might be needed
          reportFormTypeID: response.reportForm?.reportFormTypeID,
          reportFormTypeName: response.reportForm?.reportFormTypeName,
          systemNameWarehouseID: response.reportForm?.systemNameWarehouseID,
          stationNameWarehouseID: response.reportForm?.stationNameWarehouseID,
          // Override with reportForm data where applicable
          jobNo: response.reportForm?.jobNo || response.pmReportFormServer?.jobNo,
          systemDescription: response.reportForm?.systemDescription || response.pmReportFormServer?.systemDescription,
          stationName: response.reportForm?.stationName || response.pmReportFormServer?.stationName
        };
        
        setFormData(mergedFormData);
        
        // Map the backend data to the expected frontend structure
        const mappedServerPMData = {
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
        
        setServerPMData(mappedServerPMData);
      } catch (err) {
        console.error('Error fetching report form details:', err);
        setError('Error fetching report form details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportFormData();
  }, [id]);

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
    navigate('/report-management-system/report-forms');
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
      softwarePatch: SoftwarePatch_Details
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

    const dataKey = currentStep === 'serverHealth' ? 'serverHealthData' :
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
                   currentStep === 'softwarePatch' ? 'softwarePatchData' : 'serverHealthData';

    return (
      <Component
        data={serverPMData[dataKey] || []}
      />
    );
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
                📋 Basic Information Summary
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

            {/* Witnessed By and Attended By Section */}
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
                👥 Personnel Information
              </Typography>
              
              <TextField
                fullWidth
                variant="outlined"
                label="Attended By"
                value={formData.attendedBy || ''}
                disabled
                placeholder="Enter maintenance personnel name"
                sx={{
                  marginBottom: 2,
                  marginTop: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                  }
                }}
              />
              
              <TextField
                fullWidth
                variant="outlined"
                label="Witnessed By"
                value={formData.witnessedBy || ''}
                disabled
                placeholder="Enter witness name"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                  }
                }}
              />
            </Paper>

            {/* Schedule Information Section */}
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
                📅 Schedule Information
              </Typography>
              
              <Grid container spacing={3} sx={{ marginTop: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    value={formData.startDate ? new Date(formData.startDate).toLocaleDateString() : ''}
                    disabled
                    sx={fieldStyle}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Completion Date"
                    value={formData.completionDate ? new Date(formData.completionDate).toLocaleDateString() : ''}
                    disabled
                    sx={fieldStyle}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Remarks Section */}
            <Box sx={{ 
              padding: 3, 
              backgroundColor: '#ffffff', 
              borderRadius: 2, 
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: 3
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#1976d2', 
                  fontWeight: 'bold', 
                  marginBottom: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                📝 Remarks
              </Typography>
              <TextField
                label="Additional Notes"
                fullWidth
                multiline
                rows={4}
                value={formData.remarks || ''}
                disabled
                placeholder="Enter any additional remarks or observations..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                    '& fieldset': {
                      borderColor: '#d0d0d0'
                    }
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'rgba(0, 0, 0, 0.6)'
                  }
                }}
              />
            </Box>

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
                  ← Back
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
                  {currentStep === 'softwarePatch' ? 'End' : 'Next →'}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
    </LocalizationProvider>
  );
};

export default ServerPMReportFormDetails;
