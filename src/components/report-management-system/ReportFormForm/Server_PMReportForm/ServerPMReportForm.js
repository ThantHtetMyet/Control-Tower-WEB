import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  ArrowBackIosNew as ArrowBackIosNewIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import RMSTheme from '../../../theme-resource/RMSTheme';
import { getPMReportFormTypes } from '../../../api-services/reportFormService';
import WarningModal from '../../../common/WarningModal';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Component imports
import ServerPMReportFormSignOff from './ServerPMReportFormSignOff';

import FormStatus from './FormStatus';
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

  // Add state for Form Status warning modal
  const [showFormStatusWarning, setShowFormStatusWarning] = useState(false);

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
    'softwarePatch',
    'formStatus'
  ];

  const stepTitles = {
    formStatus: 'Form Status',
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
    if (targetStep === currentStep || isTransitioning) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(targetStep);
      setIsTransitioning(false);
    }, 300);
  };

  const handleNext = () => {
    // Validate FormStatus on formStatus step (last step)
    if (currentStep === 'formStatus' && !formData.formstatusID) {
      setShowFormStatusWarning(true);
      return;
    }

    const currentStepIndex = steps.indexOf(currentStep);

    if (currentStepIndex < steps.length - 1) {

      const nextStep = steps[currentStepIndex + 1];

      handleStepNavigation(nextStep);

    } else {

      onNext?.();

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
    switch (currentStep) {
      case 'signOff':
        return (
          <ServerPMReportFormSignOff
            data={formData.signOffData || {}}
            onDataChange={dataChangeHandlers.signOff}
          />
        );
      case 'serverHealth':
        return (
          <ServerHealth
            data={formData.serverHealthData || {}}
            onDataChange={dataChangeHandlers.serverHealth}
          />
        );
      case 'networkHealth':
        return (
          <NetworkHealth
            data={formData.networkHealthData || {}}
            onDataChange={dataChangeHandlers.networkHealth}
          />
        );
      case 'hardDriveHealth':
        return (
          <HardDriveHealth
            data={formData.hardDriveHealthData || {}}
            onDataChange={dataChangeHandlers.hardDriveHealth}
          />
        );
      case 'diskUsage':
        return (
          <DiskUsage
            data={formData.diskUsageData || {}}
            onDataChange={dataChangeHandlers.diskUsage}
          />
        );
      case 'cpuAndRamUsage':
        return (
          <CPUAndRamUsage
            data={formData.cpuAndRamUsageData || {}}
            onDataChange={dataChangeHandlers.cpuAndRamUsage}
          />
        );
      case 'willowlynxProcessStatus':
        return (
          <WillowlynxProcessStatus
            data={formData.willowlynxProcessStatusData || {}}
            onDataChange={dataChangeHandlers.willowlynxProcessStatus}
          />
        );
      case 'willowlynxNetworkStatus':
        return (
          <WillowlynxNetworkStatus
            data={formData.willowlynxNetworkStatusData || {}}
            onDataChange={dataChangeHandlers.willowlynxNetworkStatus}
          />
        );
      case 'willowlynxRTUStatus':
        return (
          <WillowlynxRTUStatus
            data={formData.willowlynxRTUStatusData || {}}
            onDataChange={dataChangeHandlers.willowlynxRTUStatus}
          />
        );
      case 'willowlynxHistorialTrend':
        return (
          <WillowlynxHistorialTrend
            data={formData.willowlynxHistorialTrendData || {}}
            onDataChange={dataChangeHandlers.willowlynxHistorialTrend}
          />
        );
      case 'willowlynxHistoricalReport':
        return (
          <WillowlynxHistoricalReport
            data={formData.willowlynxHistoricalReportData || {}}
            onDataChange={dataChangeHandlers.willowlynxHistoricalReport}
          />
        );
      case 'willowlynxSumpPitCCTVCamera':
        return (
          <WillowlynxSumpPitCCTVCamera
            data={formData.willowlynxSumpPitCCTVCameraData || {}}
            onDataChange={dataChangeHandlers.willowlynxSumpPitCCTVCamera}
          />
        );
      case 'monthlyDatabaseCreation':
        return (
          <MonthlyDatabaseCreation
            data={formData.monthlyDatabaseCreationData || {}}
            onDataChange={dataChangeHandlers.monthlyDatabaseCreation}
          />
        );
      case 'databaseBackup':
        return (
          <DatabaseBackup
            data={formData.databaseBackupData || {}}
            onDataChange={dataChangeHandlers.databaseBackup}
          />
        );
      case 'timeSync':
        return (
          <TimeSync
            data={formData.timeSyncData || {}}
            onDataChange={dataChangeHandlers.timeSync}
          />
        );
      case 'hotFixes':
        return (
          <HotFixes
            data={formData.hotFixesData || {}}
            onDataChange={dataChangeHandlers.hotFixes}
          />
        );
      case 'autoFailOver':
        return (
          <AutoFailOver
            data={formData.autoFailOverData || {}}
            onDataChange={dataChangeHandlers.autoFailOver}
          />
        );
      case 'asaFirewall':
        return (
          <ASAFirewall
            data={formData.asaFirewallData || {}}
            onDataChange={dataChangeHandlers.asaFirewall}
          />
        );
      case 'softwarePatch':
        return (
          <SoftwarePatch
            data={formData.softwarePatchData || {}}
            onDataChange={dataChangeHandlers.softwarePatch}
          />
        );
      case 'formStatus':
        return (
          <FormStatus
            value={formData.formstatusID || ''}
            formStatusOptions={formStatusOptions}
            onChange={(value) => onInputChange('formstatusID', value)}
          />
        );
      default:
        return null;
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
    },
    '& .MuiInputBase-input.Mui-disabled': {
      color: '#333',
      WebkitTextFillColor: '#333'
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
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                marginBottom: 1,
                letterSpacing: '0.5px'
              }}
            >
              {formData.reportTitle || 'xxx'}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                opacity: 0.95,
                fontSize: '16px',
                fontWeight: 400
              }}
            >
              Complete the form below with accurate maintenance information
            </Typography>

            {/* Job No Badge */}
            <Box sx={{
              marginTop: 2,
              display: 'inline-block',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '8px 20px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#e0e0e0',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Job No:
                <Typography
                  component="span"
                  sx={{
                    color: '#FFD700',
                    fontWeight: 'bold',
                    marginLeft: '8px',
                    fontSize: '16px'
                  }}
                >
                  {formData.jobNo || 'Not assigned'}
                </Typography>
              </Typography>
            </Box>
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
                  value={formData.systemDescription || ''}
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

                <Tooltip
                  title={formData.stationName || 'Not specified'}
                  placement="top"
                  enterDelay={200}
                  sx={{
                    '& .MuiTooltip-tooltip': {
                      backgroundColor: '#1976d2',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 500,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      maxWidth: '400px',
                      whiteSpace: 'normal',
                    },
                    '& .MuiTooltip-arrow': {
                      color: '#1976d2',
                    }
                  }}
                  arrow
                >
                  <TextField
                    fullWidth
                    label="Station Name"
                    value={formData.stationName || ''}
                    disabled
                    sx={{ ...fieldStyle, '& .MuiOutlinedInput-root': { cursor: 'help' } }}
                  />
                </Tooltip>
              </Box>
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
                  {currentStep === 'formStatus' ? 'Complete' : 'Next'}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Paper>
      </Box>

      {/* Form Status Warning Modal */}
      <WarningModal
        open={showFormStatusWarning}
        onClose={() => setShowFormStatusWarning(false)}
        title="Form Status Required"
        content="Please select a Form Status before proceeding to the next step."
        buttonText="OK"
      />
    </LocalizationProvider>
  );
};

export default ServerPMReportForm;
