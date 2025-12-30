import React, { useState, useRef } from 'react';
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
  Tooltip,
  Fade,
  ToggleButton,
  ToggleButtonGroup,
  Tabs,
  Tab,
  Snackbar
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
  ArrowForwardIos as ArrowForwardIosIcon,
  PhotoCamera,
  Brush as BrushIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import RMSTheme from '../../../theme-resource/RMSTheme';
import DownloadConfirmationModal from '../../../common/DownloadConfirmationModal';
import { generateServerPMReportPdf } from '../../../api-services/reportFormService';

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
  const [downloadConfirmModalOpen, setDownloadConfirmModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = PDF, 1 = Signatures
  
  // Signature states
  const [attendedBySignature, setAttendedBySignature] = useState(null);
  const [approvedBySignature, setApprovedBySignature] = useState(null);
  const [attendedBySignaturePreview, setAttendedBySignaturePreview] = useState('');
  const [approvedBySignaturePreview, setApprovedBySignaturePreview] = useState('');
  
  // Signature mode states ('draw' or 'upload')
  const [attendedByMode, setAttendedByMode] = useState('draw');
  const [approvedByMode, setApprovedByMode] = useState('draw');
  
  // Canvas refs for signature drawing
  const attendedByCanvasRef = useRef(null);
  const approvedByCanvasRef = useRef(null);
  const [isDrawingAttended, setIsDrawingAttended] = useState(false);
  const [isDrawingApproved, setIsDrawingApproved] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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

  const handleAttendedBySignatureChange = (event) => {
    setFinalReportUploadError('');
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    if (file) {
      setAttendedBySignature(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttendedBySignaturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApprovedBySignatureChange = (event) => {
    setFinalReportUploadError('');
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    if (file) {
      setApprovedBySignature(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setApprovedBySignaturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas drawing handlers
  const startDrawing = (canvasRef, setIsDrawing) => (e) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (canvasRef, isDrawing) => (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = (setIsDrawing) => () => {
    setIsDrawing(false);
  };

  const clearCanvas = (canvasRef) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const canvasToBlob = (canvas) => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  };

  const handleCloseFinalReportDialog = () => {
    if (finalReportUploading) return;
    setFinalReportDialogOpen(false);
    setFinalReportFile(null);
    setFinalReportUploadError('');
    setAttendedBySignature(null);
    setApprovedBySignature(null);
    setAttendedBySignaturePreview('');
    setApprovedBySignaturePreview('');
    setAttendedByMode('draw');
    setApprovedByMode('draw');
    setActiveTab(0); // Reset to PDF tab
    
    // Clear canvases
    clearCanvas(attendedByCanvasRef);
    clearCanvas(approvedByCanvasRef);
  };

  const handleUploadFinalReport = async () => {
    // Check for drawn signatures and convert to blob
    let attendedBySignatureToUpload = attendedBySignature;
    let approvedBySignatureToUpload = approvedBySignature;
    
    // If mode is 'draw', get signature from canvas
    if (attendedByMode === 'draw' && attendedByCanvasRef.current) {
      const canvas = attendedByCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasDrawing = imageData.data.some(channel => channel !== 0);
      
      if (hasDrawing) {
        const blob = await canvasToBlob(canvas);
        attendedBySignatureToUpload = new File([blob], 'attended-by-signature.png', { type: 'image/png' });
      }
    }
    
    if (approvedByMode === 'draw' && approvedByCanvasRef.current) {
      const canvas = approvedByCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasDrawing = imageData.data.some(channel => channel !== 0);
      
      if (hasDrawing) {
        const blob = await canvasToBlob(canvas);
        approvedBySignatureToUpload = new File([blob], 'approved-by-signature.png', { type: 'image/png' });
      }
    }
    
    // Validate based on active tab
    if (activeTab === 0) {
      // PDF tab - validate final report file
      if (!finalReportFile) {
        setFinalReportUploadError('Please upload a Final Report PDF.');
        return;
      }
    } else {
      // Signatures tab - validate both signatures
      const hasBothSignatures = !!attendedBySignatureToUpload && !!approvedBySignatureToUpload;
      
      if (!hasBothSignatures) {
        if (!attendedBySignatureToUpload && !approvedBySignatureToUpload) {
          setFinalReportUploadError('Please provide both signatures (Attended By and Approved By).');
          return;
        }
        if (attendedBySignatureToUpload && !approvedBySignatureToUpload) {
          setFinalReportUploadError('Please also provide Approved By signature.');
          return;
        }
        if (!attendedBySignatureToUpload && approvedBySignatureToUpload) {
          setFinalReportUploadError('Please also provide Attended By signature.');
          return;
        }
      }
    }

    setFinalReportUploading(true);
    setFinalReportUploadError('');
    try {
      // Pass final report and signatures to the parent component
      const uploadData = {
        finalReportFile: finalReportFile,
        attendedBySignature: attendedBySignatureToUpload,
        approvedBySignature: approvedBySignatureToUpload
      };
      
      const success = await onNext(uploadData);
      if (success === false) {
        setFinalReportUploadError('Failed to submit report. Please try again.');
        return;
      }
      setFinalReportDialogOpen(false);
      setFinalReportFile(null);
      setAttendedBySignature(null);
      setApprovedBySignature(null);
      setAttendedBySignaturePreview('');
      setApprovedBySignaturePreview('');
      setAttendedByMode('draw');
      setApprovedByMode('draw');
      
      // Clear canvases
      clearCanvas(attendedByCanvasRef);
      clearCanvas(approvedByCanvasRef);
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
      // Show download confirmation modal instead of directly submitting
      setDownloadConfirmModalOpen(true);
    }
  };

  // Handle when user clicks "Cancel" in download modal - just close and stay on review page
  const handleModalCancel = () => {
    setDownloadConfirmModalOpen(false);
  };

  // Handle when user clicks "Create Report Only" - submit without downloading
  const handleCreateOnly = async () => {
    try {
      setIsDownloading(true);
      setDownloadConfirmModalOpen(false);
      await onNext();
    } catch (error) {
      console.error('Error during report creation:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle when user clicks "Download Report" - submit and download
  const handleDownloadConfirm = async () => {
    try {
      setIsDownloading(true);
      setDownloadConfirmModalOpen(false);

      console.log('=== Starting Server PM report submission ===');
      
      // Submit the report to create it
      const submitResult = await onNext();

      console.log('=== Report submission completed ===');
      console.log('Submit result:', submitResult);

      // Check if submission failed
      if (submitResult === false) {
        console.error('Submission failed - submitResult is false');
        setIsDownloading(false);
        return;
      }

      // Extract ReportForm ID from the submit result
      const reportFormId = submitResult?.reportForm?.id || submitResult?.reportForm?.ID;
      
      console.log('Extracted reportFormId:', reportFormId);

      // Wait a moment to ensure the report is fully created in the backend
      if (reportFormId) {
        console.log('Waiting 2 seconds before downloading...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await handleDownloadReport(reportFormId);
      } else {
        console.error('No ReportForm ID available for download');
        console.error('submitResult:', submitResult);
      }
    } catch (error) {
      console.error('Error during submit and download:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Download report function using direct HTTP API
  const handleDownloadReport = async (reportFormId) => {
    try {
      console.log(`Generating Server PM report PDF for ReportForm ID: ${reportFormId}`);

      const response = await generateServerPMReportPdf(reportFormId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      // Extract filename from response headers or use default
      const disposition = response.headers['content-disposition'];
      let fileName = `ServerPMReport_${formData?.jobNo || reportFormId}.pdf`;
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/i);
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

      console.log('Server PM Report PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating Server PM report PDF:', error);
      const errorMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : error.message) ||
        'Failed to generate PDF report.';
      console.error('Error details:', errorMessage);
      alert(`Failed to download report: ${errorMessage}`);
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
              Review all completed maintenance information
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

                <Tooltip
                  title={formData?.stationName || 'Not specified'}
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
                    value={formData?.stationName || ''}
                    disabled
                    sx={{ ...fieldStyle, '& .MuiOutlinedInput-root': { cursor: 'help' } }}
                  />
                </Tooltip>
              </Box>
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
                      onDataChange={() => { }} // No-op function for review mode
                      disabled={true}
                    />
                  </Box>
                </Paper>
              ));
            })()}

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
            pb: 0
          }}
        >
          Close Report
        </DialogTitle>
        
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            setFinalReportUploadError(''); // Clear errors when switching tabs
          }}
          centered
          sx={{
            borderBottom: '1px solid rgba(226,232,240,0.2)',
            '& .MuiTab-root': {
              color: 'rgba(226,232,240,0.6)',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '14px',
              minHeight: '48px',
              '&.Mui-selected': {
                color: '#4ade80',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#4ade80',
              height: '3px'
            }
          }}
        >
          <Tab 
            icon={<UploadFileIcon sx={{ fontSize: 20 }} />} 
            iconPosition="start"
            label="Upload PDF Report" 
          />
          <Tab 
            icon={<BrushIcon sx={{ fontSize: 20 }} />} 
            iconPosition="start"
            label="Provide Signatures" 
          />
        </Tabs>

        <DialogContent
          sx={{
            py: 3,
            px: 4
          }}
        >
          {/* Tab Panel 0: Final Report PDF Upload */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'rgba(241,245,249,0.85)' }}>
                Upload the completed Final Report PDF to close this report.
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  width: '100%',
                  py: 2,
                  borderColor: finalReportFile ? '#4ade80' : 'rgba(226,232,240,0.5)',
                  color: finalReportFile ? '#4ade80' : '#e2e8f0',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#cbd5f5',
                    backgroundColor: 'rgba(148,163,184,0.15)'
                  }
                }}
              >
                {finalReportFile ? finalReportFile.name : 'Select PDF File'}
                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={handleFinalReportFileChange}
                />
              </Button>
              {finalReportFile && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 1, 
                    textAlign: 'center', 
                    color: '#4ade80' 
                  }}
                >
                  ✓ File selected: {finalReportFile.name}
                </Typography>
              )}
            </Box>
          )}

          {/* Tab Panel 1: Signature Uploads or Drawing */}
          {activeTab === 1 && (
            <Box>
            {/* Attended By Signature */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(241,245,249,0.85)', fontWeight: 600 }}>
                  Attended By Signature
                  {formData?.signOffData?.attendedBy && (
                    <Typography component="span" sx={{ ml: 1, color: '#4ade80', fontSize: '13px' }}>
                      ({formData.signOffData.attendedBy})
                    </Typography>
                  )}
                </Typography>
                <ToggleButtonGroup
                  value={attendedByMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setAttendedByMode(newMode)}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      color: 'rgba(226,232,240,0.7)',
                      borderColor: 'rgba(226,232,240,0.3)',
                      py: 0.5,
                      px: 1.5,
                      fontSize: '12px',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(74,222,128,0.2)',
                        color: '#4ade80',
                        borderColor: '#4ade80',
                        '&:hover': {
                          backgroundColor: 'rgba(74,222,128,0.3)',
                        }
                      }
                    }
                  }}
                >
                  <ToggleButton value="draw">
                    <BrushIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Draw
                  </ToggleButton>
                  <ToggleButton value="upload">
                    <PhotoCamera sx={{ fontSize: 16, mr: 0.5 }} />
                    Upload
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {attendedByMode === 'draw' ? (
                <Box>
                  <Box sx={{ 
                    border: '2px solid rgba(226,232,240,0.3)', 
                    borderRadius: 2, 
                    backgroundColor: 'white',
                    cursor: 'crosshair'
                  }}>
                    <canvas
                      ref={attendedByCanvasRef}
                      width={400}
                      height={150}
                      onMouseDown={startDrawing(attendedByCanvasRef, setIsDrawingAttended)}
                      onMouseMove={draw(attendedByCanvasRef, isDrawingAttended)}
                      onMouseUp={stopDrawing(setIsDrawingAttended)}
                      onMouseLeave={stopDrawing(setIsDrawingAttended)}
                      style={{ display: 'block', width: '100%', height: '150px' }}
                    />
                  </Box>
                  <Button
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={() => clearCanvas(attendedByCanvasRef)}
                    sx={{ 
                      mt: 1, 
                      color: 'rgba(226,232,240,0.7)',
                      textTransform: 'none',
                      fontSize: '12px'
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      width: '100%',
                      py: 1.5,
                      borderColor: attendedBySignature ? '#4ade80' : 'rgba(226,232,240,0.5)',
                      color: attendedBySignature ? '#4ade80' : '#e2e8f0',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#cbd5f5',
                        backgroundColor: 'rgba(148,163,184,0.15)'
                      }
                    }}
                  >
                    {attendedBySignature ? attendedBySignature.name : 'Select Signature Image'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAttendedBySignatureChange}
                    />
                  </Button>
                  {attendedBySignaturePreview && (
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <img 
                        src={attendedBySignaturePreview} 
                        alt="Attended By Signature" 
                        style={{ maxWidth: '200px', maxHeight: '100px', border: '1px solid rgba(226,232,240,0.3)', borderRadius: '4px' }}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Approved By Signature */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(241,245,249,0.85)', fontWeight: 600 }}>
                  Approved By Signature
                  {formData?.signOffData?.witnessedBy && (
                    <Typography component="span" sx={{ ml: 1, color: '#4ade80', fontSize: '13px' }}>
                      ({formData.signOffData.witnessedBy})
                    </Typography>
                  )}
                </Typography>
                <ToggleButtonGroup
                  value={approvedByMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setApprovedByMode(newMode)}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      color: 'rgba(226,232,240,0.7)',
                      borderColor: 'rgba(226,232,240,0.3)',
                      py: 0.5,
                      px: 1.5,
                      fontSize: '12px',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(74,222,128,0.2)',
                        color: '#4ade80',
                        borderColor: '#4ade80',
                        '&:hover': {
                          backgroundColor: 'rgba(74,222,128,0.3)',
                        }
                      }
                    }
                  }}
                >
                  <ToggleButton value="draw">
                    <BrushIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Draw
                  </ToggleButton>
                  <ToggleButton value="upload">
                    <PhotoCamera sx={{ fontSize: 16, mr: 0.5 }} />
                    Upload
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {approvedByMode === 'draw' ? (
                <Box>
                  <Box sx={{ 
                    border: '2px solid rgba(226,232,240,0.3)', 
                    borderRadius: 2, 
                    backgroundColor: 'white',
                    cursor: 'crosshair'
                  }}>
                    <canvas
                      ref={approvedByCanvasRef}
                      width={400}
                      height={150}
                      onMouseDown={startDrawing(approvedByCanvasRef, setIsDrawingApproved)}
                      onMouseMove={draw(approvedByCanvasRef, isDrawingApproved)}
                      onMouseUp={stopDrawing(setIsDrawingApproved)}
                      onMouseLeave={stopDrawing(setIsDrawingApproved)}
                      style={{ display: 'block', width: '100%', height: '150px' }}
                    />
                  </Box>
                  <Button
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={() => clearCanvas(approvedByCanvasRef)}
                    sx={{ 
                      mt: 1, 
                      color: 'rgba(226,232,240,0.7)',
                      textTransform: 'none',
                      fontSize: '12px'
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      width: '100%',
                      py: 1.5,
                      borderColor: approvedBySignature ? '#4ade80' : 'rgba(226,232,240,0.5)',
                      color: approvedBySignature ? '#4ade80' : '#e2e8f0',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#cbd5f5',
                        backgroundColor: 'rgba(148,163,184,0.15)'
                      }
                    }}
                  >
                    {approvedBySignature ? approvedBySignature.name : 'Select Signature Image'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleApprovedBySignatureChange}
                    />
                  </Button>
                  {approvedBySignaturePreview && (
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <img 
                        src={approvedBySignaturePreview} 
                        alt="Approved By Signature" 
                        style={{ maxWidth: '200px', maxHeight: '100px', border: '1px solid rgba(226,232,240,0.3)', borderRadius: '4px' }}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
          )}

          {/* Error Message */}
          {finalReportUploadError && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {finalReportUploadError}
            </Alert>
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
            {finalReportUploading ? 'Submitting...' : (activeTab === 0 ? 'Upload & Close Report' : 'Submit Signatures & Close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Download Confirmation Modal */}
      <DownloadConfirmationModal
        open={downloadConfirmModalOpen}
        onCancel={handleModalCancel}
        onCreateOnly={handleCreateOnly}
        onDownload={handleDownloadConfirm}
        loading={isDownloading}
      />

      {/* Toast Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{
            width: '100%',
            backgroundColor: notification.severity === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            '& .MuiAlert-action': {
              color: 'white'
            }
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ServerPMReviewReportForm;
