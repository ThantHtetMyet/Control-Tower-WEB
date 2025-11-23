import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Tooltip,
  MenuItem,
} from '@mui/material';
import { 
  Computer as ComputerIcon,
  ArrowBackIosNew as ArrowBackIosNewIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  HelpOutline as HelpOutlineIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import RMSTheme from '../../../theme-resource/RMSTheme';
import { getPMReportFormTypes } from '../../../api-services/reportFormService';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Component imports
import ServerPMReportFormSignOff from './ServerPMReportFormSignOff';
import ServerHealth from './ServerHealth';
import HardDriveHealth from './HardDriveHealth';
import DiskUsage from './DiskUsage';
import CPUAndRamUsage from './CPUAndRamUsage';
import NetworkHealth from './NetworkHealth';
import WillowlynxProcessStatus from './WillowlynxProcessStatus';
import WillowlynxNetworkStatus from './WillowlynxNetworkStatus';
import WillowlynxRTUStatus from './WillowlynxRTUStatus';
import WillowlynxHistorialTrend from './WillowlynxHistorialTrend';
import WillowlynxHistoricalReport from './WillowlynxHistoricalReport';
import WillowlynxSumpPitCCTVCamera from './WillowlynxSumpPitCCTVCamera';
import MonthlyDatabaseCreation from './MonthlyDatabaseCreation';
import DatabaseBackup from './DatabaseBackup';
import TimeSync from './TimeSync';
import HotFixes from './HotFixes';
import AutoFailOver from './AutoFailOver';
import ASAFirewall from './ASAFirewall';
import SoftwarePatch from './SoftwarePatch';

const ServerPMReportForm = ({ formData, formStatusOptions = [], onInputChange, onNext, onBack }) => {
  // State management
  const [pmReportFormTypes, setPMReportFormTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('signOff');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Step configuration
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
    signOff: 'Sign Off Information',
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

  // Initialize component
  useEffect(() => {
    const fetchPMReportFormTypes = async () => {
      try {
        const types = await getPMReportFormTypes();
        setPMReportFormTypes(types);
      } catch (error) {
        // console.error('Error fetching PM Report Form Types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPMReportFormTypes();
  }, []);

  // Data change handlers
  const createDataChangeHandler = (dataKey) => (data) => {
    onInputChange(dataKey, data);
  };

  const dataChangeHandlers = {
    signOff: createDataChangeHandler('signOffData'),
    serverHealth: createDataChangeHandler('serverHealthData'),
    networkHealth: createDataChangeHandler('networkHealthData'),
    hardDriveHealth: createDataChangeHandler('hardDriveHealthData'),
    diskUsage: createDataChangeHandler('diskUsageData'),
    cpuAndRamUsage: createDataChangeHandler('cpuAndRamUsageData'),
    willowlynxProcessStatus: createDataChangeHandler('willowlynxProcessStatusData'),
    willowlynxNetworkStatus: createDataChangeHandler('willowlynxNetworkStatusData'),
    willowlynxRTUStatus: createDataChangeHandler('willowlynxRTUStatusData'),
    willowlynxHistorialTrend: createDataChangeHandler('willowlynxHistorialTrendData'),
    willowlynxHistoricalReport: createDataChangeHandler('willowlynxHistoricalReportData'),
    willowlynxSumpPitCCTVCamera: createDataChangeHandler('willowlynxSumpPitCCTVCameraData'),
    monthlyDatabaseCreation: createDataChangeHandler('monthlyDatabaseCreationData'),
    databaseBackup: createDataChangeHandler('databaseBackupData'),
    timeSync: createDataChangeHandler('timeSyncData'),
    hotFixes: createDataChangeHandler('hotFixesData'),
    autoFailOver: createDataChangeHandler('autoFailOverData'),
    asaFirewall: createDataChangeHandler('asaFirewallData'),
    softwarePatch: createDataChangeHandler('softwarePatchData')
  };

  // Navigation functions
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
    } else {
      onNext();
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      handleStepNavigation(steps[currentIndex - 1]);
    } else {
      onBack();
    }
  };

  // Component rendering
  const renderCurrentStep = () => {
    const componentMap = {
      signOff: ServerPMReportFormSignOff,
      serverHealth: ServerHealth,
      networkHealth: NetworkHealth,
      hardDriveHealth: HardDriveHealth,
      diskUsage: DiskUsage,
      cpuAndRamUsage: CPUAndRamUsage,
      willowlynxProcessStatus: WillowlynxProcessStatus,
      willowlynxNetworkStatus: WillowlynxNetworkStatus,
      willowlynxRTUStatus: WillowlynxRTUStatus,
      willowlynxHistorialTrend: WillowlynxHistorialTrend,
      willowlynxHistoricalReport: WillowlynxHistoricalReport,
      willowlynxSumpPitCCTVCamera: WillowlynxSumpPitCCTVCamera,
      monthlyDatabaseCreation: MonthlyDatabaseCreation,
      databaseBackup: DatabaseBackup,
      timeSync: TimeSync,
      hotFixes: HotFixes,
      autoFailOver: AutoFailOver,
      asaFirewall: ASAFirewall,
      softwarePatch: SoftwarePatch
    };

    const Component = componentMap[currentStep];
    if (!Component) return null;

    const dataKey = currentStep === 'signOff' ? 'signOffData' :
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
                   currentStep === 'softwarePatch' ? 'softwarePatchData' : 'serverHealthData';

    if (currentStep === 'signOff') {
      return (
        <Component
          data={formData[dataKey] || {}}
          formStatusOptions={formStatusOptions}
          formstatusID={formData.formstatusID || ''}
          onFormStatusChange={(val) => onInputChange('formstatusID', val)}
          onDataChange={dataChangeHandlers[currentStep]}
        />
      );
    }

    return (
      <Component
        data={formData[dataKey] || {}}
        onDataChange={dataChangeHandlers[currentStep]}
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

  // Styling
  const sectionContainerStyle = {
    padding: 3,
    marginBottom: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const sectionHeaderStyle = {
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1
  };

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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: 3
      }}>
        <Paper sx={{
          maxWidth: '1200px',
          margin: '0 auto',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }}>
          {/* Header */}
          <Box sx={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 50%, #1A252F 100%)',
            color: 'white',
            padding: 4,
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1 }}>
              {formData.reportTitle || 'Server Preventive Maintenance Report'}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Complete the form below with accurate maintenance information
            </Typography>
          </Box>

          <Box sx={{ padding: 4 }}>
            {/* Basic Information Summary */}
            <Paper sx={{
              ...sectionContainerStyle,
              background: '#f8f9fa',
              border: '2px solid #e9ecef'
            }}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
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
                    sx={{
                      ...fieldStyle,
                      '& .MuiOutlinedInput-root': {
                        ...fieldStyle['& .MuiOutlinedInput-root'],
                        backgroundColor: '#f5f5f5',
                        '& fieldset': {
                          borderColor: '#d0d0d0'
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="System Description"
                    value={formData.systemDescription || ''}
                    disabled
                    sx={{
                      ...fieldStyle,
                      '& .MuiOutlinedInput-root': {
                        ...fieldStyle['& .MuiOutlinedInput-root'],
                        backgroundColor: '#f5f5f5',
                        '& fieldset': {
                          borderColor: '#d0d0d0'
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Station Name"
                    value={formData.stationName || ''}
                    disabled
                    sx={{
                      ...fieldStyle,
                      '& .MuiOutlinedInput-root': {
                        ...fieldStyle['& .MuiOutlinedInput-root'],
                        backgroundColor: '#f5f5f5',
                        '& fieldset': {
                          borderColor: '#d0d0d0'
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Customer"
                    value={formData.customer || ''}
                    disabled
                    sx={{
                      ...fieldStyle,
                      '& .MuiOutlinedInput-root': {
                        ...fieldStyle['& .MuiOutlinedInput-root'],
                        backgroundColor: '#f5f5f5',
                        '& fieldset': {
                          borderColor: '#d0d0d0'
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Project No"
                    value={formData.projectNo || ''}
                    disabled
                    sx={{
                      ...fieldStyle,
                      '& .MuiOutlinedInput-root': {
                        ...fieldStyle['& .MuiOutlinedInput-root'],
                        backgroundColor: '#f5f5f5',
                        '& fieldset': {
                          borderColor: '#d0d0d0'
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Form Status (moved outside Sign Off) */}
            <Paper sx={{
              ...sectionContainerStyle,
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              marginTop: 3
            }}>
            <Typography variant="h5" sx={{ 
              color: '#1976d2',
              fontWeight: 'bold',
              marginBottom: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <HelpOutlineIcon fontSize="small" color="primary" />
              Form Status
            </Typography>
              <TextField
                fullWidth
                select
                label="Form Status"
                value={formData.formstatusID || ''}
                onChange={(e) => onInputChange('formstatusID', e.target.value)}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) =>
                    selected ? (formStatusOptions.find((s) => (s.id || s.ID) === selected)?.name || formStatusOptions.find((s) => (s.id || s.ID) === selected)?.Name || selected) : <em>Select Form Status</em>
                }}
                InputLabelProps={{ shrink: true }}
                sx={fieldStyle}
              >
                <MenuItem value="">
                  <em>Select Form Status</em>
                </MenuItem>
                {(formStatusOptions || []).map((status) => (
                  <MenuItem key={status.id || status.ID} value={status.id || status.ID}>
                    {status.name || status.Name}
                  </MenuItem>
                ))}
              </TextField>
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
                  disabled={isTransitioning}
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
                  {currentStep === 'softwarePatch' ? 'Complete' : 'Next'}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default ServerPMReportForm;
