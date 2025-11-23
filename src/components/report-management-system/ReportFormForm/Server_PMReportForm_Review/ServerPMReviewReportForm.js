import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade
} from '@mui/material';
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
  Assignment as AssignmentIcon,
  UploadFile as UploadFileIcon,
  ArrowBackIosNew as ArrowBackIosNewIcon,
  ArrowForwardIos as ArrowForwardIosIcon
} from '@mui/icons-material';
import RMSTheme from '../../../theme-resource/RMSTheme';

import ServerPMReportFormSignOff_Review from './ServerPMReportFormSignOff_Review';
import ServerHealth_Review from './ServerHealth_Review';
import HardDriveHealth_Review from './HardDriveHealth_Review';
import DiskUsage_Review from './DiskUsage_Review';
import CPUAndRamUsage_Review from './CPUAndRamUsage_Review';
import NetworkHealth_Review from './NetworkHealth_Review';
import WillowlynxProcessStatus_Review from './WillowlynxProcessStatus_Review';
import WillowlynxNetworkStatus_Review from './WillowlynxNetworkStatus_Review';
import WillowlynxRTUStatus_Review from './WillowlynxRTUStatus_Review';
import WillowlynxHistorialTrend_Review from './WillowlynxHistorialTrend_Review';
import WillowlynxHistoricalReport_Review from './WillowlynxHistoricalReport_Review';
import WillowlynxSumpPitCCTVCamera_Review from './WillowlynxSumpPitCCTVCamera_Review';
import MonthlyDatabaseCreation_Review from './MonthlyDatabaseCreation_Review';
import DatabaseBackup_Review from './DatabaseBackup_Review';
import TimeSync_Review from './TimeSync_Review';
import HotFixes_Review from './HotFixes_Review';
import AutoFailOver_Review from './AutoFailOver_Review';
import ASAFirewall_Review from './ASAFirewall_Review';
import SoftwarePatch_Review from './SoftwarePatch_Review';

const ServerPMReviewReportForm = ({ 
  formData, 
  reportFormTypes, 
  formStatusOptions = [],
  onNext, 
  onBack, 
  loading, 
  error,
  serverPMData = {} 
}) => {
  
  // Component configuration matching ServerPMReportForm
  const components = [
    { key: 'signOff', title: 'Sign Off Information', icon: AssignmentIcon, Component: ServerPMReportFormSignOff_Review, dataKey: 'signOffData' },
    { key: 'serverHealth', title: 'Server Health Check', icon: ComputerIcon, Component: ServerHealth_Review, dataKey: 'serverHealthData' },
    { key: 'hardDriveHealth', title: 'Hard Drive Health Check', icon: StorageIcon, Component: HardDriveHealth_Review, dataKey: 'hardDriveHealthData' },
    { key: 'diskUsage', title: 'Disk Usage Check', icon: StorageIcon, Component: DiskUsage_Review, dataKey: 'diskUsageData' },
    { key: 'cpuAndRamUsage', title: 'CPU and RAM Usage Check', icon: MemoryIcon, Component: CPUAndRamUsage_Review, dataKey: 'cpuAndRamUsageData' },
    { key: 'networkHealth', title: 'Network Health Check', icon: NetworkCheckIcon, Component: NetworkHealth_Review, dataKey: 'networkHealthData' },
    { key: 'willowlynxProcessStatus', title: 'Willowlynx Process Status Check', icon: SettingsIcon, Component: WillowlynxProcessStatus_Review, dataKey: 'willowlynxProcessStatusData' },
    { key: 'willowlynxNetworkStatus', title: 'Willowlynx Network Status Check', icon: NetworkCheckIcon, Component: WillowlynxNetworkStatus_Review, dataKey: 'willowlynxNetworkStatusData' },
    { key: 'willowlynxRTUStatus', title: 'Willowlynx RTU Status Check', icon: SettingsIcon, Component: WillowlynxRTUStatus_Review, dataKey: 'willowlynxRTUStatusData' },
    { key: 'willowlynxHistorialTrend', title: 'Willowlynx Historical Trend Check', icon: TrendingUpIcon, Component: WillowlynxHistorialTrend_Review, dataKey: 'willowlynxHistorialTrendData' },
    { key: 'willowlynxHistoricalReport', title: 'Willowlynx Historical Report Check', icon: AssessmentIcon, Component: WillowlynxHistoricalReport_Review, dataKey: 'willowlynxHistoricalReportData' },
    { key: 'willowlynxSumpPitCCTVCamera', title: 'Willowlynx Sump Pit CCTV Camera Check', icon: VideocamIcon, Component: WillowlynxSumpPitCCTVCamera_Review, dataKey: 'willowlynxSumpPitCCTVCameraData' },
    { key: 'monthlyDatabaseCreation', title: 'Monthly Database Creation Check', icon: StorageIcon, Component: MonthlyDatabaseCreation_Review, dataKey: 'monthlyDatabaseCreationData' },
    { key: 'databaseBackup', title: 'Database Backup Check', icon: StorageIcon, Component: DatabaseBackup_Review, dataKey: 'databaseBackupData' },
    { key: 'timeSync', title: 'SCADA & Historical Time Sync Check', icon: ScheduleIcon, Component: TimeSync_Review, dataKey: 'timeSyncData' },
    { key: 'hotFixes', title: 'Hotfixes / Service Packs', icon: UpdateIcon, Component: HotFixes_Review, dataKey: 'hotFixesData' },
    { key: 'autoFailOver', title: 'Auto failover of SCADA server', icon: SwapHorizIcon, Component: AutoFailOver_Review, dataKey: 'autoFailOverData' },
    { key: 'asaFirewall', title: 'ASA Firewall Maintenance', icon: SecurityIcon, Component: ASAFirewall_Review, dataKey: 'asaFirewallData' },
    { key: 'softwarePatch', title: 'Software Patch Summary', icon: SystemUpdateIcon, Component: SoftwarePatch_Review, dataKey: 'softwarePatchData' }
  ];

  // Styling
  const sectionContainerStyle = {
    padding: 3,
    marginBottom: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const fieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f5f5f5',
      '& fieldset': {
        borderColor: '#d0d0d0'
      }
    }
  };

  const [finalReportDialogOpen, setFinalReportDialogOpen] = useState(false);
  const [finalReportFile, setFinalReportFile] = useState(null);
  const [finalReportUploading, setFinalReportUploading] = useState(false);
  const [finalReportUploadError, setFinalReportUploadError] = useState('');

  const selectedFormStatusOption = (formStatusOptions || []).find(
    (status) => (status.id || status.ID) === (formData?.formstatusID || formData?.formStatusID)
  );

  const formStatusDisplayValue =
    selectedFormStatusOption?.name ||
    selectedFormStatusOption?.Name ||
    formData?.formStatusName ||
    formData?.formstatusName ||
    formData?.formStatus ||
    '';

  const resolvedFormStatusValue = formStatusDisplayValue || 'Not specified';

  const isStatusClose = () => (formStatusDisplayValue || '').trim().toLowerCase() === 'close';

  const handleFinalReportFileChange = (event) => {
    setFinalReportUploadError('');
    const file = event.target.files?.[0] || null;
    setFinalReportFile(file);
  };

  const handleCloseFinalReportDialog = () => {
    if (!finalReportUploading) {
      setFinalReportDialogOpen(false);
      setFinalReportFile(null);
      setFinalReportUploadError('');
    }
  };

  const handleUploadFinalReport = async () => {
    if (!finalReportFile) {
      setFinalReportUploadError('Please select a file to upload.');
      return;
    }

    setFinalReportUploading(true);
    setFinalReportUploadError('');
    try {
      const success = await onNext(finalReportFile);
      if (success === false) {
        setFinalReportUploadError('Failed to submit report. Please try again.');
        return;
      }
      setFinalReportDialogOpen(false);
      setFinalReportFile(null);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to submit report.';
      setFinalReportUploadError(message);
    } finally {
      setFinalReportUploading(false);
    }
  };

  const handleSubmitClick = () => {
    if (isStatusClose()) {
      setFinalReportUploadError('');
      setFinalReportDialogOpen(true);
    } else {
      onNext();
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
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <>
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
            {formData?.reportTitle || 'Server Preventive Maintenance Report - Review'}
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Review all completed maintenance information
          </Typography>
        </Box>

        <Box sx={{ padding: 4 }}>
          {/* Basic Information Summary */}
          <Paper sx={{
            ...sectionContainerStyle,
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
              <AssignmentIcon />
              Basic Information Summary
            </Typography>
            
            <Grid container spacing={3} sx={{ marginTop: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Job No"
                  value={formData?.jobNo || ''}
                  disabled
                  sx={fieldStyle}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="System Description"
                  value={formData?.systemDescription || ''}
                  disabled
                  sx={fieldStyle}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Station Name"
                  value={formData?.stationName || ''}
                  disabled
                  sx={fieldStyle}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Customer"
                  value={formData?.customer || ''}
                  disabled
                  sx={fieldStyle}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Project No"
                  value={formData?.projectNo || ''}
                  disabled
                  sx={fieldStyle}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Report Type"
                  value={formData?.pmReportFormTypeName || formData?.reportType || ''}
                  disabled
                  sx={fieldStyle}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date Checked"
                  value={formData?.dateChecked || formData?.checkDate || ''}
                  disabled
                  sx={fieldStyle}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="System Name"
                  value={formData?.systemName || formData?.systemNameWarehouseID || ''}
                  disabled
                  sx={fieldStyle}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Form Status Summary */}
          <Paper sx={{
            ...sectionContainerStyle,
            background: '#ffffff',
            border: '1px solid #e0e0e0'
          }}>
            <Typography variant="h5" sx={{ 
              color: '#1976d2',
              fontWeight: 'bold',
              marginBottom: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <AssignmentIcon />
              Form Status
            </Typography>
            <TextField
              fullWidth
              label="Form Status"
              value={resolvedFormStatusValue}
              disabled
              sx={fieldStyle}
            />
          </Paper>

          {/* Helper function to check if component has data */}
          {(() => {
            // Helper function to check if ASA Firewall data is default
            const isASAFirewallDefaultData = (dataArray) => {
              if (!Array.isArray(dataArray) || dataArray.length === 0) return false;
              
              // Check if all items are default ASA Firewall commands with no user completion
              return dataArray.every(item => {
                const hasDefaultCommand = item.commandInput === 'show cpu usage' || item.commandInput === 'show environment';
                const hasNoUserCompletion = (!item.doneId || item.doneId === '');
                return hasDefaultCommand && hasNoUserCompletion;
              });
            };

            // Helper function to check if Auto Failover data is default
            const isAutoFailOverDefaultData = (dataArray) => {
              if (!Array.isArray(dataArray) || dataArray.length === 0) return false;
              
              // Check if all items are default Auto Failover scenarios with no user input
              return dataArray.every(item => {
                const hasDefaultServers = (item.toServer === 'SCA-SR2' || item.toServer === 'SCA-SR1') && 
                                         (item.fromServer === 'SCA-SR1' || item.fromServer === 'SCA-SR2');
                const hasDefaultFailoverType = item.failoverType && item.failoverType.trim() !== '';
                const hasDefaultExpectedResult = item.expectedResult && item.expectedResult.trim() !== '';
                const hasNoUserInput = (!item.result || item.result === '');
                
                return hasDefaultServers && hasDefaultFailoverType && hasDefaultExpectedResult && hasNoUserInput;
              });
            };

            const hasData = (data, dataKey) => {
              if (!data || typeof data !== 'object') return false;
              
              // Debug logging to understand data structure
              if (dataKey === 'diskUsageData') {
                // console.log('DiskUsage data:', data);
              }
              if (dataKey === 'hardDriveHealthData') {
                // console.log('HardDriveHealth data:', data);
              }
              
              // Special handling for diskUsageData
              if (dataKey === 'diskUsageData') {
                const hasRemarks = data.remarks && data.remarks.trim() !== '';
                const servers = data.servers || [];
                const hasDetails = Array.isArray(servers) && servers.length > 0 && 
                                 servers.some(server => 
                                   server && 
                                   server.serverName && 
                                   server.serverName.trim() !== '' &&
                                   Array.isArray(server.disks) && 
                                   server.disks.length > 0 &&
                                   server.disks.some(disk => 
                                     disk && (
                                       (disk.disk && disk.disk.trim() !== '') ||
                                       (disk.status && disk.status.trim() !== '') ||
                                       (disk.capacity && disk.capacity.trim() !== '') ||
                                       (disk.freeSpace && disk.freeSpace.trim() !== '') ||
                                       (disk.usage && disk.usage.trim() !== '') ||
                                       (disk.check && disk.check.trim() !== '')
                                     )
                                   )
                                 );
                return hasRemarks || hasDetails;
              }
              
              // Check if object has any non-empty values
              const hasNonEmptyValues = Object.values(data).some(value => {
                if (Array.isArray(value)) {
                  // Special handling for ASA Firewall data
                  if (dataKey === 'asaFirewallData' && isASAFirewallDefaultData(value)) {
                    return false;
                  }
                  
                  // Special handling for Auto Failover data
                  if (dataKey === 'autoFailOverData' && isAutoFailOverDefaultData(value)) {
                    return false;
                  }
                  
                  return value.length > 0 && value.some(item => 
                    item && typeof item === 'object' && Object.values(item).some(v => 
                      v !== null && v !== undefined && v !== ''
                    )
                  );
                }
                return value !== null && value !== undefined && value !== '';
              });

              // For nested structure with remarks, check if there are meaningful remarks or details
              if (data.remarks !== undefined) {
                const hasRemarks = data.remarks && data.remarks.trim() !== '';
                const dataArray = data[dataKey] || data.asaFirewallData || data.autoFailOverData || data.data || [];
                
                let hasDetails = Array.isArray(dataArray) && dataArray.length > 0 && 
                                dataArray.some(item => item && Object.keys(item).length > 0);
                
                // Special check for ASA Firewall default data
                if (dataKey === 'asaFirewallData' && isASAFirewallDefaultData(dataArray)) {
                  hasDetails = false;
                }
                
                // Special check for Auto Failover default data
                if (dataKey === 'autoFailOverData' && isAutoFailOverDefaultData(dataArray)) {
                  hasDetails = false;
                }
                
                return hasRemarks || hasDetails;
              }

              return hasNonEmptyValues;
            };

            // Filter components that have data
            const componentsWithData = components.filter(({ dataKey }) => 
              hasData(formData[dataKey], dataKey)
            );

            if (componentsWithData.length === 0) {
              return (
                <Paper elevation={2} sx={{ p: 4, mb: 3, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    No Maintenance Data Available
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    No maintenance activities were completed during this session.
                  </Typography>
                </Paper>
              );
            }

            return componentsWithData.map(({ key, title, icon: Icon, Component, dataKey }) => (
              <Paper key={key} elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ 
                  '& .MuiTextField-root': {
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9f9f9',
                      '& fieldset': {
                        borderColor: '#e0e0e0'
                      }
                    }
                  },
                  '& .MuiFormControl-root': {
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9f9f9',
                      '& fieldset': {
                        borderColor: '#e0e0e0'
                      }
                    }
                  },
                  '& input': {
                    cursor: 'default !important'
                  },
                  '& textarea': {
                    cursor: 'default !important'
                  },
                  '& .MuiSelect-select': {
                    cursor: 'default !important'
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: '#666 !important',
                    color: '#666 !important'
                  },
                  pointerEvents: 'none'
                }}>
                  <Component 
                    data={formData[dataKey] || {}} 
                    onDataChange={() => {}} // No-op function for review mode
                    disabled={true}
                  />
                </Box>
              </Paper>
            ));
          })()}

          {/* Action Buttons */}
          <Box sx={{ mt: 4 }}>
            <Paper sx={{
              padding: 2,
              marginBottom: 0,
              marginTop: 3
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  onClick={onBack}
                  disabled={loading}
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

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Review Report
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  onClick={handleSubmitClick}
                  disabled={loading}
                  endIcon={!loading ? <ArrowForwardIosIcon fontSize="small" /> : null}
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
                  {loading ? <CircularProgress size={24} /> : 'Submit Report'}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Paper>
    </Box>

    <Dialog
      open={finalReportDialogOpen}
      onClose={handleCloseFinalReportDialog}
      fullWidth
      maxWidth="xs"
      TransitionComponent={Fade}
      transitionDuration={{ enter: 400, exit: 250 }}
      PaperProps={{
        sx: {
          minWidth: 320,
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'linear-gradient(180deg, rgba(28,35,57,0.95) 0%, rgba(9,14,28,0.95) 80%)',
          boxShadow: '0 25px 70px rgba(8,15,31,0.55)',
          overflow: 'hidden'
        }
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)'
        }
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          fontWeight: 600,
          color: '#f8fafc',
          pb: 1
        }}
      >
        Upload Final Report
      </DialogTitle>
      <DialogContent
        sx={{
          py: 2,
          px: 4
        }}
      >
        <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: 'rgba(241,245,249,0.85)' }}>
          Please attach the completed final report before submitting.
        </Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFileIcon />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            width: '100%',
            py: 1.5,
            borderColor: 'rgba(226,232,240,0.5)',
            color: '#e2e8f0',
            fontWeight: 600,
            '&:hover': {
              borderColor: '#cbd5f5',
              backgroundColor: 'rgba(148,163,184,0.15)'
            }
          }}
        >
          {finalReportFile ? finalReportFile.name : 'Select File'}
          <input
            type="file"
            hidden
            accept="application/pdf"
            onChange={handleFinalReportFileChange}
          />
        </Button>
        {finalReportUploadError && (
          <Typography color="#fca5a5" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            {finalReportUploadError}
          </Typography>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: 'center',
          px: 4,
          pb: 3
        }}
      >
        <Button
          onClick={handleCloseFinalReportDialog}
          disabled={finalReportUploading}
          sx={{
            background: RMSTheme.components.button.primary.background,
            color: RMSTheme.components.button.primary.text,
            padding: '10px 28px',
            borderRadius: RMSTheme.borderRadius.small,
            border: `1px solid ${RMSTheme.components.button.primary.border}`,
            boxShadow: RMSTheme.components.button.primary.shadow,
            textTransform: 'none',
            mr: 2,
            '&:hover': { background: RMSTheme.components.button.primary.hover },
            '&:disabled': { opacity: 0.6 }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUploadFinalReport}
          disabled={finalReportUploading}
          sx={{
            background: RMSTheme.components.button.primary.background,
            color: RMSTheme.components.button.primary.text,
            padding: '10px 28px',
            borderRadius: RMSTheme.borderRadius.small,
            border: `1px solid ${RMSTheme.components.button.primary.border}`,
            boxShadow: RMSTheme.components.button.primary.shadow,
            textTransform: 'none',
            '&:hover': { background: RMSTheme.components.button.primary.hover },
            '&:disabled': { opacity: 0.6 }
          }}
        >
          {finalReportUploading ? 'Uploading...' : 'Upload & Submit'}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default ServerPMReviewReportForm;
