import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AssignmentTurnedIn as AssignmentTurnedInIcon } from '@mui/icons-material';

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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade
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
  AccessTime,
  UploadFile as UploadFileIcon
} from '@mui/icons-material';
import RMSTheme from '../../../theme-resource/RMSTheme';
import { getPMReportFormTypes, getServerPMReportFormWithDetails, uploadFinalReportAttachment } from '../../../api-services/reportFormService';
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
  const themeColor = '#1976d2'; // System blue color

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
  const [finalReportDialogOpen, setFinalReportDialogOpen] = useState(false);
  const [finalReportFile, setFinalReportFile] = useState(null);
  const [finalReportUploading, setFinalReportUploading] = useState(false);
  const [finalReportUploadError, setFinalReportUploadError] = useState('');
  const isDataLoaded = useRef(false);
  const isStatusClosed = (status) => (status || '').trim().toLowerCase() === 'close';
  const redirectIfClosed = (message) => {
    setNotification({
      open: true,
      message: message || 'This report is already closed and cannot be edited.',
      severity: 'warning'
    });
    navigate(`/report-management-system/report-forms/server-pm-details/${id}`, { replace: true });
  };

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
  const resolvedFormStatusValue =
    formData?.formStatusName ||
    formData?.formstatusName ||
    formData?.formStatus ||
    '';
  const isCurrentStatusClose = () => (resolvedFormStatusValue || '').trim().toLowerCase() === 'close';

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

        const currentStatusName = response.pmReportFormServer?.formStatusName || response.pmReportFormServer?.formStatus || '';
        if (isStatusClosed(currentStatusName)) {
          redirectIfClosed('This Server PM report is closed and cannot be edited.');
          setLoading(false);
          return;
        }

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
          reportFormID: response.reportForm?.id || response.pmReportFormServer?.reportFormID || '',
          formstatusID: response.pmReportFormServer?.formstatusID || '',
          formStatusName: currentStatusName || '',
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


  const performUpdate = async (finalReportFileParam = null) => {
    try {
      setSubmitting(true);
      setError(null);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const result = await updateServerPMReportForm(id, formData, user);

      const reportFormId =
        formData?.reportFormID ||
        formData?.reportFormId ||
        result?.data?.reportFormID ||
        result?.data?.reportFormId ||
        null;

      if (finalReportFileParam) {
        if (!reportFormId) {
          throw new Error('Report Form ID is missing. Unable to upload final report.');
        }
        await uploadFinalReportAttachment(reportFormId, finalReportFileParam);
      }

      setNotification({
        open: true,
        message: '🎉 Server PM report updated successfully! Redirecting to report list...',
        severity: 'success'
      });

      setTimeout(() => {
        navigate('/report-management-system');
      }, 2000);

      return { success: true };
    } catch (error) {
      console.error('Error updating report:', error);
      const message = error.response?.data?.message || error.message || 'Failed to update report.';
      setError('Failed to update report: ' + message);
      setNotification({
        open: true,
        message: '??O Failed to update report. Please try again.',
        severity: 'error'
      });
      return { success: false, message };
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (isCurrentStatusClose()) {
      setFinalReportUploadError('');
      setFinalReportDialogOpen(true);
      return;
    }
    await performUpdate();
  };

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
    const result = await performUpdate(finalReportFile);
    if (result.success) {
      setFinalReportDialogOpen(false);
      setFinalReportFile(null);
      setFinalReportUploadError('');
    } else {
      setFinalReportUploadError(result.message || 'Failed to submit report. Please try again.');
    }
    setFinalReportUploading(false);
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
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                marginBottom: 1,
                letterSpacing: '0.5px'
              }}
            >
              {formData?.reportTitle || 'Server Preventive Maintenance Report - Review'}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                opacity: 0.95,
                fontSize: '16px',
                fontWeight: 400
              }}
            >
              Review the maintenance information
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
                  {formData?.jobNo || 'Not assigned'}
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
              <Typography
                variant="h5"
                sx={{
                  color: themeColor,
                  fontWeight: 'bold',
                  marginBottom: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                📋 Basic Information Summary
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 1 }}>
                <TextField
                  fullWidth
                  label="Job No"
                  value={formData?.jobNo || ''}
                  disabled
                  sx={fieldStyle}
                />

                <TextField
                  fullWidth
                  label="System Description"
                  value={formData?.systemDescription || ''}
                  disabled
                  sx={fieldStyle}
                />

                <TextField
                  fullWidth
                  label="Station Name"
                  value={formData?.stationName || ''}
                  disabled
                  sx={fieldStyle}
                />

                <TextField
                  fullWidth
                  label="Customer"
                  value={formData?.customer || ''}
                  disabled
                  sx={fieldStyle}
                />

                <TextField
                  fullWidth
                  label="Project No"
                  value={formData?.projectNo || ''}
                  disabled
                  sx={fieldStyle}
                />
              </Box>
            </Paper>

            <Paper sx={{
              ...sectionContainerStyle,
              background: '#ffffff',
              border: '1px solid #e0e0e0'
            }}>
              <Typography
                variant="h5"
                sx={{
                  color: themeColor,
                  fontWeight: 'bold',
                  marginBottom: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <AssignmentTurnedInIcon
                  fontSize="small"
                  sx={{ color: themeColor }}
                />
                Form-Status
              </Typography>
              <TextField
                fullWidth
                label="Form Status"
                value={resolvedFormStatusValue || 'Not specified'}
                disabled
                sx={fieldStyle}
              />
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
                        onDataChange={() => { }} // No-op function for review mode
                        disabled={true}
                      />
                    </Box>
                  </Paper>
                )
              });
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
    </LocalizationProvider>
  );
};

export default ServerPMReportForm_Edit_Review;
