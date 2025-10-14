import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { 
  Computer as ComputerIcon,
} from '@mui/icons-material';
import RMSTheme from '../../../theme-resource/RMSTheme';
import { getPMReportFormTypes } from '../../../api-services/reportFormService';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

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

const ServerPMReportForm = ({ formData, onInputChange, onNext, onBack }) => {
  const [pmReportFormTypes, setPMReportFormTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('serverHealth'); // 'serverHealth', 'networkHealth', 'hardDriveHealth', 'diskUsage', 'cpuAndRamUsage'
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const fetchPMReportFormTypes = async () => {
      try {
        const types = await getPMReportFormTypes();
        setPMReportFormTypes(types);
      } catch (error) {
        console.error('Error fetching PM Report Form Types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPMReportFormTypes();
  }, []);

  const handleInputChange = (field, value) => {
    onInputChange(field, value);
  };

  const handleServerHealthDataChange = (serverHealthData) => {
    onInputChange('serverHealthData', serverHealthData);
  };

  const handleNetworkHealthDataChange = (networkHealthData) => {
    onInputChange('networkHealthData', networkHealthData);
  };

  const handleHardDriveHealthDataChange = (hardDriveHealthData) => {
    onInputChange('hardDriveHealthData', hardDriveHealthData);
  };

  const handleDiskUsageDataChange = (diskUsageData) => {
    onInputChange('diskUsageData', diskUsageData);
  };

  const handleCPUAndRamUsageDataChange = (cpuAndRamUsageData) => {
    onInputChange('cpuAndRamUsageData', cpuAndRamUsageData);
  };

  const handleWillowlynxProcessStatusDataChange = (willowlynxProcessStatusData) => {
    onInputChange('willowlynxProcessStatusData', willowlynxProcessStatusData);
  };

  const handleWillowlynxNetworkStatusDataChange = (willowlynxNetworkStatusData) => {
    onInputChange('willowlynxNetworkStatusData', willowlynxNetworkStatusData);
  };

  const handleWillowlynxRTUStatusDataChange = (willowlynxRTUStatusData) => {
    onInputChange('willowlynxRTUStatusData', willowlynxRTUStatusData);
  };

  const handleWillowlynxHistorialTrendDataChange = (willowlynxHistorialTrendData) => {
    onInputChange('willowlynxHistorialTrendData', willowlynxHistorialTrendData);
  };

  const handleWillowlynxHistoricalReportDataChange = (willowlynxHistoricalReportData) => {
    onInputChange('willowlynxHistoricalReportData', willowlynxHistoricalReportData);
  };

  const handleWillowlynxSumpPitCCTVCameraDataChange = (willowlynxSumpPitCCTVCameraData) => {
    onInputChange('willowlynxSumpPitCCTVCameraData', willowlynxSumpPitCCTVCameraData);
  };

  const handleMonthlyDatabaseCreationDataChange = (monthlyDatabaseCreationData) => {
    onInputChange('monthlyDatabaseCreationData', monthlyDatabaseCreationData);
  };

  const handleDatabaseBackupDataChange = (databaseBackupData) => {
    onInputChange('databaseBackupData', databaseBackupData);
  };

  const handleNext = () => {
    if (currentStep === 'serverHealth') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('hardDriveHealth');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'hardDriveHealth') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('diskUsage');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'diskUsage') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('cpuAndRamUsage');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'cpuAndRamUsage') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('networkHealth');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'networkHealth') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('willowlynxProcessStatus');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'willowlynxProcessStatus') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('willowlynxNetworkStatus');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'willowlynxNetworkStatus') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('willowlynxRTUStatus');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'willowlynxRTUStatus') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('willowlynxHistorialTrend');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'willowlynxHistorialTrend') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('willowlynxHistoricalReport');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'willowlynxHistoricalReport') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('willowlynxSumpPitCCTVCamera');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'willowlynxSumpPitCCTVCamera') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('monthlyDatabaseCreation');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'monthlyDatabaseCreation') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('databaseBackup');
        setIsTransitioning(false);
      }, 300);
    } else {
      onNext();
    }
  };

  const handleBack = () => {
    if (currentStep === 'databaseBackup') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('monthlyDatabaseCreation');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'monthlyDatabaseCreation') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('willowlynxSumpPitCCTVCamera');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'willowlynxSumpPitCCTVCamera') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('willowlynxHistoricalReport');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'willowlynxHistoricalReport') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('willowlynxHistorialTrend');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'willowlynxHistorialTrend') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('willowlynxRTUStatus');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'willowlynxRTUStatus') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('willowlynxNetworkStatus');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'willowlynxNetworkStatus') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('willowlynxProcessStatus');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'willowlynxProcessStatus') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('networkHealth');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'networkHealth') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('cpuAndRamUsage');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'cpuAndRamUsage') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('diskUsage');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'diskUsage') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('hardDriveHealth');
        setIsTransitioning(false);
      }, 300);
    } else if (currentStep === 'hardDriveHealth') {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep('serverHealth');
        setIsTransitioning(false);
      }, 300);
    } else {
      onBack();
    }
  };

  // Styling - Updated to match RTUPMReportForm
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

  // Fixed Page flip animation styles
  const pageFlipContainerStyle = {
    position: 'relative',
    perspective: '1000px',
    minHeight: '800px', // Increased height to accommodate more content
    overflow: 'hidden',
    marginBottom: '20px', // Add margin to separate from footer
  };

  const pageStyle = {
    width: '100%',
    backfaceVisibility: 'hidden',
    transition: 'transform 0.6s ease-in-out, opacity 0.3s ease-in-out',
    transformStyle: 'preserve-3d',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    minHeight: '800px', // Match container height
    paddingBottom: '20px', // Add padding to prevent content from touching bottom
  };

  const getPageTransform = (step) => {
    if (!isTransitioning) {
      return step === currentStep ? 'rotateY(0deg)' : 'rotateY(90deg)';
    }
    
    if (step === 'serverHealth') {
      return currentStep === 'serverHealth' ? 'rotateY(0deg)' : 'rotateY(-90deg)';
    } else if (step === 'hardDriveHealth') {
      return currentStep === 'hardDriveHealth' ? 'rotateY(0deg)' : 'rotateY(90deg)';
    } else {
      return currentStep === 'diskUsage' ? 'rotateY(0deg)' : 'rotateY(90deg)';
    }
  };

  const getPageOpacity = (step) => {
    if (!isTransitioning) {
      return step === currentStep ? 1 : 0;
    }
    return 1; // Keep full opacity during transition
  };

  // Simple container style without animation
  const stepContainerStyle = {
    marginBottom: 3,
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'serverHealth':
        return 'Server Health Check';
      case 'networkHealth':
        return 'Network Health Check';
      case 'hardDriveHealth':
        return 'Hard Drive Health Check';
      case 'diskUsage':
        return 'Disk Usage Check';
      case 'cpuAndRamUsage':
        return 'CPU and RAM Usage Check';
      case 'willowlynxProcessStatus':
        return 'Willowlynx Process Status Check';
      case 'willowlynxNetworkStatus':
        return 'Willowlynx Network Status Check';
      case 'willowlynxRTUStatus':
        return 'Willowlynx RTU Status Check';
      case 'willowlynxHistorialTrend':
        return 'Willowlynx Historical Trend Check';
      case 'willowlynxHistoricalReport':
        return 'Willowlynx Historical Report Check';
      case 'willowlynxSumpPitCCTVCamera':
        return 'Willowlynx Sump Pit CCTV Camera Check';
      case 'monthlyDatabaseCreation':
        return 'Monthly Database Creation Check';
      case 'databaseBackup':
        return 'Database Backup Check';
      default:
        return 'Server Health Check';
    }
  };

  // Simple function to render current step content
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'serverHealth':
        return (
          <ServerHealth 
            data={formData.serverHealthData || {}}
            onDataChange={handleServerHealthDataChange}
          />
        );
      case 'networkHealth':
        return (
          <NetworkHealth 
            data={formData.networkHealthData || {}}
            onDataChange={handleNetworkHealthDataChange}
          />
        );
      case 'hardDriveHealth':
        return (
          <HardDriveHealth 
            data={formData.hardDriveHealthData || {}}
            onDataChange={handleHardDriveHealthDataChange}
          />
        );
      case 'diskUsage':
        return (
          <DiskUsage 
            data={formData.diskUsageData || {}}
            onDataChange={handleDiskUsageDataChange}
          />
        );
      case 'cpuAndRamUsage':
        return (
          <CPUAndRamUsage 
            data={formData.cpuAndRamUsageData || {}}
            onDataChange={handleCPUAndRamUsageDataChange}
          />
        );
      case 'willowlynxProcessStatus':
        return (
          <WillowlynxProcessStatus 
            data={formData.willowlynxProcessStatusData || {}}
            onDataChange={handleWillowlynxProcessStatusDataChange}
          />
        );
      case 'willowlynxNetworkStatus':
        return (
          <WillowlynxNetworkStatus 
            data={formData.willowlynxNetworkStatusData || {}}
            onDataChange={handleWillowlynxNetworkStatusDataChange}
          />
        );
      case 'willowlynxRTUStatus':
        return (
          <WillowlynxRTUStatus 
            data={formData.willowlynxRTUStatusData || {}}
            onDataChange={handleWillowlynxRTUStatusDataChange}
          />
        );
      case 'willowlynxHistorialTrend':
        return (
          <WillowlynxHistorialTrend 
            data={formData.willowlynxHistorialTrendData || {}}
            onDataChange={handleWillowlynxHistorialTrendDataChange}
          />
        );
      case 'willowlynxHistoricalReport':
        return (
          <WillowlynxHistoricalReport 
            data={formData.willowlynxHistoricalReportData || {}}
            onDataChange={handleWillowlynxHistoricalReportDataChange}
          />
        );
      case 'willowlynxSumpPitCCTVCamera':
        return (
          <WillowlynxSumpPitCCTVCamera 
            data={formData.willowlynxSumpPitCCTVCameraData || {}}
            onDataChange={handleWillowlynxSumpPitCCTVCameraDataChange}
          />
        );
      case 'monthlyDatabaseCreation':
        return (
          <MonthlyDatabaseCreation
            data={formData.monthlyDatabaseCreationData}
            onDataChange={handleMonthlyDatabaseCreationDataChange}
          />
        );
      case 'databaseBackup':
        return (
          <DatabaseBackup
            data={formData.databaseBackupData}
            onDataChange={handleDatabaseBackupDataChange}
          />
        );
      default:
        return null;
    }
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
          {/* Updated Header to match RTUPMReportForm */}
          <Box sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            {/* Updated Basic Information Summary Section to match RTUPMReportForm */}
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

            {/* Current Step Content */}
            <Box sx={stepContainerStyle}>
              {renderCurrentStep()}
            </Box>

            {/* Navigation Buttons */}
            <Paper sx={{
              ...sectionContainerStyle,
              background: '#ffffff',
              marginBottom: 0,
              marginTop: 3
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
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {getStepTitle()}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: currentStep === 'serverHealth' ? '#1976d2' : '#e0e0e0',
                      transition: 'background-color 0.3s'
                    }} />
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: currentStep === 'hardDriveHealth' ? '#1976d2' : '#e0e0e0',
                      transition: 'background-color 0.3s'
                    }} />
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: currentStep === 'diskUsage' ? '#1976d2' : '#e0e0e0',
                      transition: 'background-color 0.3s'
                    }} />
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: currentStep === 'cpuAndRamUsage' ? '#1976d2' : '#e0e0e0',
                      transition: 'background-color 0.3s'
                    }} />
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: currentStep === 'networkHealth' ? '#1976d2' : '#e0e0e0',
                      transition: 'background-color 0.3s'
                    }} />
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: currentStep === 'willowlynxProcessStatus' ? '#1976d2' : '#e0e0e0',
                      transition: 'background-color 0.3s'
                    }} />
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: currentStep === 'willowlynxNetworkStatus' ? '#1976d2' : '#e0e0e0',
                      transition: 'background-color 0.3s'
                    }} />
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: currentStep === 'willowlynxRTUStatus' ? '#1976d2' : '#e0e0e0',
                      transition: 'background-color 0.3s'
                    }} />
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: currentStep === 'willowlynxHistorialTrend' ? '#1976d2' : '#e0e0e0',
                      transition: 'background-color 0.3s'
                    }} />
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: currentStep === 'willowlynxHistoricalReport' ? '#1976d2' : '#e0e0e0',
                      transition: 'background-color 0.3s'
                    }} />
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: currentStep === 'willowlynxSumpPitCCTVCamera' ? '#1976d2' : '#e0e0e0',
                      transition: 'background-color 0.3s'
                    }} />
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: currentStep === 'monthlyDatabaseCreation' ? '#1976d2' : '#e0e0e0',
                      transition: 'background-color 0.3s'
                    }} />
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: currentStep === 'databaseBackup' ? '#1976d2' : '#e0e0e0',
                      transition: 'background-color 0.3s'
                    }} />
                  </Box>
                </Box>
                
                <Button
                  variant="contained"
                  onClick={handleNext}
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
                  {currentStep === 'databaseBackup' ? 'Complete →' : 'Next →'}
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