import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import { 
  Computer as ComputerIcon,
  Assignment as AssignmentIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkCheckIcon,
  Settings as SettingsIcon,
  SwapHoriz as SwapHorizIcon,
  Security as SecurityIcon,
  SystemUpdate as SystemUpdateIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Videocam as VideocamIcon,
  Schedule as ScheduleIcon,
  Update as UpdateIcon,
  AccessTime
} from '@mui/icons-material';
import RMSTheme from '../../../theme-resource/RMSTheme';
import { getPMReportFormTypes, getServerPMReportFormWithDetails } from '../../../api-services/reportFormService';
import { updateServerPMReportForm } from '../../../api-services/reportFormService_Update';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Component imports - Edit Review versions (read-only)
import ServerPMReportFormSignOff_Edit_Review from './ServerPMReportFormSignOff_Edit_Review';
import ServerHealth_Edit_Review from './ServerHealth_Edit_Review';
import HardDriveHealth_Edit_Review from './HardDriveHealth_Edit_Review';
import DiskUsage_Edit_Review from './DiskUsage_Edit_Review';
import CPUAndRamUsage_Edit_Review from './CPUAndRamUsage_Edit_Review';
import NetworkHealth_Edit_Review from './NetworkHealth_Edit_Review';
import WillowlynxProcessStatus_Edit_Review from './WillowlynxProcessStatus_Edit_Review';
import WillowlynxNetworkStatus_Edit_Review from './WillowlynxNetworkStatus_Edit_Review';
import WillowlynxRTUStatus_Edit_Review from './WillowlynxRTUStatus_Edit_Review';
import WillowlynxHistoricalTrend_Edit_Review from './WillowlynxHistoricalTrend_Edit_Review';
import WillowlynxHistoricalReport_Edit_Review from './WillowlynxHistoricalReport_Edit_Review';
import WillowlynxSumpPitCCTVCamera_Edit_Review from './WillowlynxSumpPitCCTVCamera_Edit_Review';
import MonthlyDatabaseCreation_Edit_Review from './MonthlyDatabaseCreation_Edit_Review';
import DatabaseBackup_Edit_Review from './DatabaseBackup_Edit_Review';
import TimeSync_Edit_Review from './TimeSync_Edit_Review';
import HotFixes_Edit_Review from './HotFixes_Edit_Review';
import AutoFailOver_Edit_Review from './AutoFailOver_Edit_Review';
import ASAFirewall_Edit_Review from './ASAFirewall_Edit_Review';
import SoftwarePatch_Edit_Review from './SoftwarePatch_Edit_Review';

const ServerPMReportForm_Edit_Review = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({});
  const [pmReportFormTypes, setPMReportFormTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const isDataLoaded = useRef(false);

  // Component configuration matching ServerPMReviewReportForm
  const components = [
    { key: 'signOff', title: 'Sign Off Information', icon: AssignmentIcon, Component: ServerPMReportFormSignOff_Edit_Review, dataKey: 'signOffData' },
    { key: 'serverHealth', title: 'Server Health Check', icon: ComputerIcon, Component: ServerHealth_Edit_Review, dataKey: 'serverHealthData' },
    { key: 'hardDriveHealth', title: 'Hard Drive Health Check', icon: StorageIcon, Component: HardDriveHealth_Edit_Review, dataKey: 'hardDriveHealthData' },
    { key: 'diskUsage', title: 'Disk Usage Check', icon: StorageIcon, Component: DiskUsage_Edit_Review, dataKey: 'diskUsageData' },
    { key: 'cpuAndRamUsage', title: 'CPU and RAM Usage Check', icon: MemoryIcon, Component: CPUAndRamUsage_Edit_Review, dataKey: 'cpuAndRamUsageData' },
    { key: 'networkHealth', title: 'Network Health Check', icon: NetworkCheckIcon, Component: NetworkHealth_Edit_Review, dataKey: 'networkHealthData' },
    { key: 'willowlynxProcessStatus', title: 'Willowlynx Process Status Check', icon: SettingsIcon, Component: WillowlynxProcessStatus_Edit_Review, dataKey: 'willowlynxProcessStatusData' },
    { key: 'willowlynxNetworkStatus', title: 'Willowlynx Network Status Check', icon: NetworkCheckIcon, Component: WillowlynxNetworkStatus_Edit_Review, dataKey: 'willowlynxNetworkStatusData' },
    { key: 'willowlynxRTUStatus', title: 'Willowlynx RTU Status Check', icon: SettingsIcon, Component: WillowlynxRTUStatus_Edit_Review, dataKey: 'willowlynxRTUStatusData' },
    { key: 'willowlynxHistorialTrend', title: 'Willowlynx Historical Trend Check', icon: SettingsIcon, Component: WillowlynxHistoricalTrend_Edit_Review, dataKey: 'willowlynxHistorialTrendData' },
    { key: 'willowlynxHistoricalReport', title: 'Willowlynx Historical Report Check', icon: SettingsIcon, Component: WillowlynxHistoricalReport_Edit_Review, dataKey: 'willowlynxHistoricalReportData' },
    { key: 'willowlynxSumpPitCCTVCamera', title: 'Willowlynx Sump Pit CCTV Camera Check', icon: SettingsIcon, Component: WillowlynxSumpPitCCTVCamera_Edit_Review, dataKey: 'willowlynxSumpPitCCTVCameraData' },
    { key: 'monthlyDatabaseCreation', title: 'Monthly Database Creation Check', icon: StorageIcon, Component: MonthlyDatabaseCreation_Edit_Review, dataKey: 'monthlyDatabaseCreationData' },
    { key: 'databaseBackup', title: 'Database Backup Check', icon: StorageIcon, Component: DatabaseBackup_Edit_Review, dataKey: 'databaseBackupData' },
    { key: 'timeSync', title: 'SCADA & Historical Time Sync Check', icon: SettingsIcon, Component: TimeSync_Edit_Review, dataKey: 'timeSyncData' },
    { key: 'hotFixes', title: 'Hotfixes / Service Packs', icon: SystemUpdateIcon, Component: HotFixes_Edit_Review, dataKey: 'hotFixesData' },
    { key: 'autoFailOver', title: 'Auto failover of SCADA server', icon: SwapHorizIcon, Component: AutoFailOver_Edit_Review, dataKey: 'autoFailOverData' },
    { key: 'asaFirewall', title: 'ASA Firewall Maintenance', icon: SecurityIcon, Component: ASAFirewall_Edit_Review, dataKey: 'asaFirewallData' },
    { key: 'softwarePatch', title: 'Software Patch Summary', icon: SystemUpdateIcon, Component: SoftwarePatch_Edit_Review, dataKey: 'softwarePatchData' }
  ];

  // Styling constants matching ServerPMReviewReportForm
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
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    paddingBottom: 1,
    borderBottom: '2px solid #1976d2'
  };

  const fieldContainer = {
    marginBottom: 2,
    padding: 2,
    backgroundColor: 'white',
    borderRadius: 1,
    border: '1px solid #e0e0e0'
  };

  const fieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f9f9f9',
      '& fieldset': {
        borderColor: '#e0e0e0'
      }
    },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#666 !important',
      color: '#666 !important'
    }
  };

  const sectionContainerStyle = {
    padding: 3,
    marginBottom: 3,
    backgroundColor: 'white',
    borderRadius: 1,
    border: '1px solid #e0e0e0'
  };

  const sectionHeaderStyle = {
    fontWeight: 'bold',
    color: RMSTheme.primary.main,
    marginBottom: 2,
    display: 'flex',
    alignItems: 'center'
  };

  // Initialize component
  useEffect(() => {
    const fetchPMReportFormTypes = async () => {
      try {
        const types = await getPMReportFormTypes();
        setPMReportFormTypes(types);
      } catch (error) {
        console.error('Error fetching PM Report Form Types:', error);
        setError('Failed to load PM Report Form Types');
      }
    };

    fetchPMReportFormTypes();
  }, []);

  // Load existing report data
  useEffect(() => {
    const fetchReportData = async () => {
      if (!id || isDataLoaded.current) return;

      try {
        setLoading(true);
        
        // Check if form data was passed from edit page - Following reference pattern
        if (location.state && location.state.formData) {
          const passedData = location.state.formData;
          
          // Use the passed form data directly - Following ServerPMReviewReportForm pattern
          setFormData(passedData);
          isDataLoaded.current = true;
          setLoading(false);
          return;
        }

        // Fallback: fetch from database if no passed data
        const response = await getServerPMReportFormWithDetails(id);
        
        // Set basic form data
        setFormData({
          reportTitle: response.pmReportFormServer.reportTitle || 'Server Preventive Maintenance Report - Review',
          systemDescription: response.systemNameWarehouseName || response.pmReportFormServer?.systemDescription || '',
          systemNameWarehouseID: response.systemNameWarehouseID || '',
          stationName: response.stationNameWarehouseName || response.pmReportFormServer?.stationName || '',
          stationNameWarehouseID: response.stationNameWarehouseID || '',
          jobNo: response.reportForm.jobNo || '',
          projectNo: response.pmReportFormServer?.projectNo || '',
          customer: response.pmReportFormServer?.customer || '',
          reportFormTypeID: response.reportFormTypeID || '',
          pmReportFormTypeID: response.pmReportFormServer?.pmReportFormTypeID || '',
          pmReportFormTypeName: response.pmReportFormServer?.pmReportFormTypeName || '',
          dateOfService: response.pmReportFormServer?.dateOfService ? 
            new Date(response.pmReportFormServer.dateOfService).toISOString().slice(0, 16) : '',
          
          // Map server PM data directly to formData - Following reference pattern
          signOffData: {
            attendedBy: response.pmReportFormServer?.signOffData?.attendedBy || '',
            witnessedBy: response.pmReportFormServer?.signOffData?.witnessedBy || '',
            startDate: response.pmReportFormServer?.signOffData?.startDate ? 
              new Date(response.pmReportFormServer.signOffData.startDate).toISOString().slice(0, 16) : '',
            completionDate: response.pmReportFormServer?.signOffData?.completionDate ? 
              new Date(response.pmReportFormServer.signOffData.completionDate).toISOString().slice(0, 16) : '',
            approvedBy: response.pmReportFormServer?.signOffData?.approvedBy || '',
            remarks: response.pmReportFormServer?.signOffData?.remarks || ''
          },
          serverHealthData: {
            pmServerHealths: response.pmServerHealths || [],
            remarks: response.pmServerHealths?.[0]?.remarks || ''
          },
          hardDriveHealthData: {
            pmServerHardDriveHealths: response.pmServerHardDriveHealths || [],
            remarks: response.pmServerHardDriveHealths?.[0]?.remarks || ''
          },
          diskUsageData: {
            pmServerDiskUsages: response.pmServerDiskUsages || [],
            remarks: response.pmServerDiskUsages?.[0]?.remarks || ''
          },
          cpuAndRamUsageData: {
            pmServerCPUAndRAMUsages: response.pmServerCPUAndRAMUsages || [],
            remarks: response.pmServerCPUAndRAMUsages?.[0]?.remarks || ''
          },
          networkHealthData: {
            pmServerNetworkHealths: response.pmServerNetworkHealths || [],
            remarks: response.pmServerNetworkHealths?.[0]?.remarks || ''
          },
          willowlynxProcessStatusData: {
            pmServerWillowlynxProcessStatuses: response.pmServerWillowlynxProcessStatuses || [],
            remarks: response.pmServerWillowlynxProcessStatuses?.[0]?.remarks || ''
          },
          willowlynxNetworkStatusData: {
            pmServerWillowlynxNetworkStatuses: response.pmServerWillowlynxNetworkStatuses || [],
            remarks: response.pmServerWillowlynxNetworkStatuses?.[0]?.remarks || ''
          },
          willowlynxRTUStatusData: {
            pmServerWillowlynxRTUStatuses: response.pmServerWillowlynxRTUStatuses || [],
            remarks: response.pmServerWillowlynxRTUStatuses?.[0]?.remarks || ''
          },
          willowlynxHistorialTrendData: {
            pmServerWillowlynxHistoricalTrends: response.pmServerWillowlynxHistoricalTrends || [],
            remarks: response.pmServerWillowlynxHistoricalTrends?.[0]?.remarks || ''
          },
          willowlynxHistoricalReportData: {
            pmServerWillowlynxHistoricalReports: response.pmServerWillowlynxHistoricalReports || [],
            remarks: response.pmServerWillowlynxHistoricalReports?.[0]?.remarks || ''
          },
          willowlynxSumpPitCCTVCameraData: {
            pmServerWillowlynxCCTVCameras: response.pmServerWillowlynxCCTVCameras || [],
            remarks: response.pmServerWillowlynxCCTVCameras?.[0]?.remarks || ''
          },
          monthlyDatabaseCreationData: {
            pmServerMonthlyDatabaseCreations: response.pmServerMonthlyDatabaseCreations || [],
            remarks: response.pmServerMonthlyDatabaseCreations?.[0]?.remarks || ''
          },
          databaseBackupData: {
            pmServerDatabaseBackups: response.pmServerDatabaseBackups || [],
            remarks: response.pmServerDatabaseBackups?.[0]?.remarks || ''
          },
          timeSyncData: {
            pmServerTimeSyncs: response.pmServerTimeSyncs || [],
            remarks: response.pmServerTimeSyncs?.[0]?.remarks || ''
          },
          hotFixesData: {
            pmServerHotFixes: response.pmServerHotFixes || [],
            remarks: response.pmServerHotFixes?.[0]?.remarks || ''
          },
          autoFailOverData: {
            pmServerFailOvers: response.pmServerFailOvers || [],
            remarks: response.pmServerFailOvers?.[0]?.remarks || ''
          },
          asaFirewallData: {
            pmServerASAFirewalls: response.pmServerASAFirewalls || [],
            remarks: response.pmServerASAFirewalls?.[0]?.remarks || ''
          },
          softwarePatchData: (() => {
            // Extract software patch details with proper structure for both component and API
            if (response.pmServerSoftwarePatchSummaries && response.pmServerSoftwarePatchSummaries.length > 0) {
              const softwarePatchRecord = response.pmServerSoftwarePatchSummaries[0];
              if (softwarePatchRecord.details && softwarePatchRecord.details.length > 0) {
                return softwarePatchRecord.details.map(detail => ({
                  id: detail.id || null,
                  serialNo: detail.serialNo || '',
                  machineName: detail.serverName || '',
                  previousPatch: detail.previousPatch || '',
                  currentPatch: detail.currentPatch || '',
                  isDeleted: detail.isDeleted || false,
                  isNew: detail.isNew || false,
                  isModified: detail.isModified || false
                }));
              }
            }
            return [];
          })(),
          softwarePatchRemarks: response.pmServerSoftwarePatchSummaries?.[0]?.remarks || ''
        });
        isDataLoaded.current = true;
      } catch (err) {
        console.error('Error fetching report form details:', err);
        setError('Error fetching report form details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [id]); // Remove location.state from dependencies

  const handleComplete = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Get user info from localStorage or context
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Update the report with all the form data
      const result = await updateServerPMReportForm(id, formData, user);
      
      // Show beautiful success toast
      setNotification({
        open: true,
        message: '🎉 Server PM report updated successfully! Redirecting to report list...',
        severity: 'success'
      });
      
      // Navigate after a short delay to show the toast
      setTimeout(() => {
        navigate('/report-management-system');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating report:', error);
      setError('Failed to update report: ' + (error.response?.data?.message || error.message));
      
      // Show error toast
      setNotification({
        open: true,
        message: '❌ Failed to update report. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Paper sx={{ padding: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>Loading report data...</Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Paper sx={{ padding: 4, borderRadius: 2 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Box>
    );
  }

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
              {formData?.reportTitle || 'Server Preventive Maintenance Report - Review'}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Review the maintenance information (Read-Only Mode)
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
                📋 Basic Information Summary
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
              </Grid>
            </Paper>

            {/* All Components Display - Following ServerPMReviewReportForm pattern */}
            {(() => {
              // Helper function to check if component has data - Following reference pattern
              const hasData = (data, dataKey) => {
                if (!data || typeof data !== 'object') return false;
                
                // Special handling for DatabaseBackup data structure
                if (dataKey === 'databaseBackupData') {
                  const hasMssqlData = Array.isArray(data.mssqlBackupData) && data.mssqlBackupData.length > 0 &&
                    data.mssqlBackupData.some(item => 
                      (item.item && item.item.trim() !== '') || 
                      (item.monthlyDBBackupCreated && item.monthlyDBBackupCreated !== '')
                    );
                  const hasScadaData = Array.isArray(data.scadaBackupData) && data.scadaBackupData.length > 0 &&
                    data.scadaBackupData.some(item => 
                      (item.item && item.item.trim() !== '') || 
                      (item.monthlyDBBackupCreated && item.monthlyDBBackupCreated !== '')
                    );
                  const hasRemarks = data.remarks && data.remarks.trim() !== '';
                  const hasLatestBackupFileName = data.latestBackupFileName && data.latestBackupFileName.trim() !== '';
                  
                  return hasMssqlData || hasScadaData || hasRemarks || hasLatestBackupFileName;
                }
                
                // Check for non-empty values
                const hasNonEmptyValues = Object.values(data).some(value => {
                  if (Array.isArray(value)) {
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
                  const dataArray = data[dataKey] || data.data || [];
                  
                  let hasDetails = Array.isArray(dataArray) && dataArray.length > 0 && 
                                  dataArray.some(item => item && Object.keys(item).length > 0);
                  
                  return hasRemarks || hasDetails;
                }

                return hasNonEmptyValues;
              };

              // Filter components that have data
              const componentsWithData = components.filter(({ dataKey }) => {
                const hasDataResult = hasData(formData[dataKey], dataKey);
                //console.log(`ServerPMReportForm_Edit_Review - Component ${dataKey} hasData:`, hasDataResult, 'Data:', formData[dataKey]);
                return hasDataResult;
              });

              if (componentsWithData.length === 0) {
                return (
                  <Paper elevation={2} sx={{ p: 4, mb: 3, borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      📝 No Maintenance Data Available
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      No maintenance activities were completed during this session.
                    </Typography>
                  </Paper>
                );
              }

              return componentsWithData.map(({ key, title, icon: Icon, Component, dataKey }) => {
                
                return (
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
                      formData={formData}
                      onDataChange={() => {}} // No-op function for review mode
                      disabled={true}
                    />
                  </Box>
                </Paper>
              )});
            })()}

            {/* Error Display */}
            {error && (
              <Paper sx={{ ...sectionContainerStyle, marginBottom: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              </Paper>
            )}

            {/* Submit Button */}
            <Paper sx={{ ...sectionContainerStyle, marginTop: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleComplete}
                  disabled={loading || submitting}
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
                  {submitting ? 'Updating Report...' : 'Complete Review'}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Paper>

        {/* Beautiful Toast Notification */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ 
              width: '100%',
              fontSize: '1rem',
              fontWeight: 500,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              borderRadius: '12px',
              backgroundColor: notification.severity === 'success' ? '#d4edda' : '#f8d7da',
              color: notification.severity === 'success' ? '#155724' : '#721c24',
              '& .MuiAlert-icon': {
                color: notification.severity === 'success' ? '#28a745' : '#dc3545'
              }
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default ServerPMReportForm_Edit_Review;