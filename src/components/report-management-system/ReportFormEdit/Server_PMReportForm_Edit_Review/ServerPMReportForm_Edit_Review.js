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
  Fade,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup
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
  UploadFile as UploadFileIcon,
  Brush as BrushIcon,
  Clear as ClearIcon,
  PhotoCamera
} from '@mui/icons-material';
import RMSTheme from '../../../theme-resource/RMSTheme';
import DownloadConfirmationModal from '../../../common/DownloadConfirmationModal';
import { getPMReportFormTypes, getServerPMReportFormWithDetails, uploadFinalReportAttachment, generateServerPMReportPdf, generateServerPMFinalReportPdf, getFinalReportsByReportForm, downloadFinalReportAttachment, createReportFormImage, getReportFormImageTypes } from '../../../api-services/reportFormService';
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
  const [downloadConfirmModalOpen, setDownloadConfirmModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = PDF, 1 = Signatures
  const [attendedBySignature, setAttendedBySignature] = useState(null);
  const [approvedBySignature, setApprovedBySignature] = useState(null);
  const [attendedBySignaturePreview, setAttendedBySignaturePreview] = useState('');
  const [approvedBySignaturePreview, setApprovedBySignaturePreview] = useState('');
  // Signature modes: 'draw' or 'upload'
  const [attendedByMode, setAttendedByMode] = useState('draw');
  const [approvedByMode, setApprovedByMode] = useState('draw');
  // Canvas refs for signature drawing
  const attendedByCanvasRef = useRef(null);
  const approvedByCanvasRef = useRef(null);
  const [isDrawingAttended, setIsDrawingAttended] = useState(false);
  const [isDrawingApproved, setIsDrawingApproved] = useState(false);
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

          // Transform data from Edit format to Review format
          const transformedData = {
            ...passedData,
            // Transform serverHealthData from Edit format to Review format
            serverHealthData: passedData.serverHealthData ? (() => {
              // Check if it's already in Review format
              if (passedData.serverHealthData.pmServerHealths) {
                return passedData.serverHealthData;
              }
              // Handle Edit format: { serverHealthData: [...], remarks }
              const dataArray = passedData.serverHealthData.serverHealthData;
              if (Array.isArray(dataArray) && dataArray.length > 0) {
                // Include deleted items with IDs (so backend can mark them as deleted)
                // Only exclude new items (no ID) that are deleted (can't delete what doesn't exist)
                const details = dataArray
                  .filter(item => item && (!item.isDeleted || item.id))
                  .map(item => ({
                    id: item.id || null,
                    serverName: item.serverName || '',
                    resultStatusID: item.result || '',
                    remarks: item.remarks || '',
                    isDeleted: item.isDeleted || false // Preserve isDeleted flag
                  }));
                
                if (details.length > 0 || (passedData.serverHealthData.remarks && passedData.serverHealthData.remarks.trim() !== '')) {
                  return {
                    pmServerHealths: [{
                      details: details,
                      remarks: passedData.serverHealthData.remarks || ''
                    }],
                    remarks: passedData.serverHealthData.remarks || ''
                  };
                }
              }
              // Return empty structure if no data
              return { pmServerHealths: [], remarks: passedData.serverHealthData.remarks || '' };
            })() : { pmServerHealths: [], remarks: '' },
            
            // Transform hardDriveHealthData from Edit format to Review format
            hardDriveHealthData: passedData.hardDriveHealthData ? (() => {
              // Check if it's already in Review format
              if (passedData.hardDriveHealthData.pmServerHardDriveHealths) {
                return passedData.hardDriveHealthData;
              }
              // Handle Edit format: { hardDriveHealthData: [...], remarks }
              const dataArray = passedData.hardDriveHealthData.hardDriveHealthData;
              if (Array.isArray(dataArray) && dataArray.length > 0) {
                // Include deleted items with IDs (so backend can mark them as deleted)
                // Only exclude new items (no ID) that are deleted (can't delete what doesn't exist)
                const details = dataArray
                  .filter(item => item && (!item.isDeleted || item.id))
                  .map(item => ({
                    id: item.id || null,
                    serverName: item.serverName || '',
                    resultStatusID: item.result || '',
                    remarks: item.remarks || '',
                    isDeleted: item.isDeleted || false // Preserve isDeleted flag
                  }));
                
                if (details.length > 0 || (passedData.hardDriveHealthData.remarks && passedData.hardDriveHealthData.remarks.trim() !== '')) {
                  return {
                    pmServerHardDriveHealths: [{
                      details: details,
                      remarks: passedData.hardDriveHealthData.remarks || ''
                    }],
                    remarks: passedData.hardDriveHealthData.remarks || ''
                  };
                }
              }
              // Return empty structure if no data
              return { pmServerHardDriveHealths: [], remarks: passedData.hardDriveHealthData.remarks || '' };
            })() : { pmServerHardDriveHealths: [], remarks: '' },
            
            // Transform cpuAndRamUsageData from Edit format to Review format
            cpuAndRamUsageData: passedData.cpuAndRamUsageData ? (() => {
              // Priority 1: Check if it has Edit format data (memoryUsageData, cpuUsageData) - this is what user filled in
              if ((passedData.cpuAndRamUsageData.memoryUsageData && Array.isArray(passedData.cpuAndRamUsageData.memoryUsageData)) ||
                  (passedData.cpuAndRamUsageData.cpuUsageData && Array.isArray(passedData.cpuAndRamUsageData.cpuUsageData))) {
                // Transform from Edit format (memoryUsageData, cpuUsageData, remarks)
                // Include deleted items with IDs (so backend can mark them as deleted)
                // Only exclude new items (no ID) that are deleted (can't delete what doesn't exist)
                const memoryDetails = (passedData.cpuAndRamUsageData.memoryUsageData || [])
                  .filter(item => item && (!item.isDeleted || item.id))
                  .map((item, index) => ({
                    id: item.id || null,
                    serialNo: item.serialNo || (index + 1).toString(),
                    serverName: item.machineName || '',
                    memorySize: item.memorySize || '',
                    memoryUsagePercentage: item.memoryInUse || item.memoryInUsed || '',
                    resultStatusID: item.memoryUsageCheck || '',
                    remarks: item.remarks || '',
                    isDeleted: item.isDeleted || false // Preserve isDeleted flag
                  }));
                
                const cpuDetails = (passedData.cpuAndRamUsageData.cpuUsageData || [])
                  .filter(item => item && (!item.isDeleted || item.id))
                  .map((item, index) => ({
                    id: item.id || null,
                    serialNo: item.serialNo || (index + 1).toString(),
                    serverName: item.machineName || '',
                    cpuUsagePercentage: item.cpuUsage || '',
                    resultStatusID: item.cpuUsageCheck || '',
                    remarks: item.remarks || '',
                    isDeleted: item.isDeleted || false // Preserve isDeleted flag
                  }));
                
                // Always create array structure, even if empty, to maintain format consistency
                return {
                  pmServerCPUAndMemoryUsages: [{
                    memoryUsageDetails: memoryDetails,
                    cpuUsageDetails: cpuDetails,
                    remarks: passedData.cpuAndRamUsageData.remarks || ''
                  }],
                  // Keep Edit format for compatibility
                  memoryUsageData: passedData.cpuAndRamUsageData.memoryUsageData || [],
                  cpuUsageData: passedData.cpuAndRamUsageData.cpuUsageData || [],
                  remarks: passedData.cpuAndRamUsageData.remarks || ''
                };
              }
              // Priority 2: Check if it's already in Review format (pmServerCPUAndMemoryUsages)
              if (passedData.cpuAndRamUsageData.pmServerCPUAndMemoryUsages) {
                return passedData.cpuAndRamUsageData;
              }
              // Fallback: return empty structure
              return { pmServerCPUAndMemoryUsages: [] };
            })() : { pmServerCPUAndMemoryUsages: [] },
            
            // Transform timeSyncData from Edit format to Review format
            timeSyncData: passedData.timeSyncData ? (() => {
              // Check if it's already in Review format (pmServerTimeSyncs)
              if (passedData.timeSyncData.pmServerTimeSyncs) {
                return passedData.timeSyncData;
              }
              // Transform from Edit format (timeSyncData array, remarks)
              // Include deleted items with IDs (so backend can mark them as deleted)
              const details = (passedData.timeSyncData.timeSyncData || [])
                .filter(item => item && (!item.isDeleted || item.id))
                .map((item, index) => ({
                  id: item.id || null,
                  serialNo: item.serialNo || (index + 1).toString(),
                  serverName: item.machineName || '',
                  resultStatusID: item.timeSyncResult || '',
                  remarks: item.remarks || '',
                  isDeleted: item.isDeleted || false // Preserve isDeleted flag
                }));
              
              if (details.length > 0 || (passedData.timeSyncData.remarks && passedData.timeSyncData.remarks.trim() !== '')) {
                return {
                  pmServerTimeSyncs: [{
                    details: details,
                    remarks: passedData.timeSyncData.remarks || ''
                  }],
                  remarks: passedData.timeSyncData.remarks || ''
                };
              }
              return { pmServerTimeSyncs: [], remarks: '' };
            })() : { pmServerTimeSyncs: [], remarks: '' },
            
            // Transform hotFixesData from Edit format to Review format
            hotFixesData: passedData.hotFixesData ? (() => {
              // Check if it's already in Review format (pmServerHotFixes)
              if (passedData.hotFixesData.pmServerHotFixes) {
                return passedData.hotFixesData;
              }
              // Transform from Edit format (hotFixesData array, remarks)
              // Include deleted items with IDs (so backend can mark them as deleted)
              const details = (passedData.hotFixesData.hotFixesData || [])
                .filter(item => item && (!item.isDeleted || item.id))
                .map((item, index) => ({
                  id: item.id || null,
                  serialNo: item.serialNo || (index + 1).toString(),
                  serverName: item.machineName || '',
                  hotFixName: item.hotFixName || '',
                  resultStatusID: item.done || '',
                  remarks: item.remarks || '',
                  isDeleted: item.isDeleted || false // Preserve isDeleted flag
                }));
              
              if (details.length > 0 || (passedData.hotFixesData.remarks && passedData.hotFixesData.remarks.trim() !== '')) {
                return {
                  pmServerHotFixes: [{
                    details: details,
                    remarks: passedData.hotFixesData.remarks || ''
                  }],
                  remarks: passedData.hotFixesData.remarks || ''
                };
              }
              return { pmServerHotFixes: [], remarks: '' };
            })() : { pmServerHotFixes: [], remarks: '' },
            
            // Transform monthlyDatabaseCreationData from Edit format to Review format
            monthlyDatabaseCreationData: passedData.monthlyDatabaseCreationData ? (() => {
              // Check if it's already in Review format (pmServerMonthlyDatabaseCreations)
              if (passedData.monthlyDatabaseCreationData.pmServerMonthlyDatabaseCreations) {
                return passedData.monthlyDatabaseCreationData;
              }
              // Transform from Edit format (monthlyDatabaseData array, remarks)
              // Include deleted items with IDs (so backend can mark them as deleted)
              const details = (passedData.monthlyDatabaseCreationData.monthlyDatabaseData || [])
                .filter(item => item && (!item.isDeleted || item.id))
                .map((item, index) => ({
                  id: item.id || null,
                  serialNo: item.serialNo || (index + 1).toString(),
                  serverName: item.item || '',
                  yesNoStatusID: item.monthlyDBCreated || '',
                  remarks: item.remarks || '',
                  isDeleted: item.isDeleted || false // Preserve isDeleted flag
                }));
              
              if (details.length > 0 || (passedData.monthlyDatabaseCreationData.remarks && passedData.monthlyDatabaseCreationData.remarks.trim() !== '')) {
                return {
                  pmServerMonthlyDatabaseCreations: [{
                    details: details,
                    remarks: passedData.monthlyDatabaseCreationData.remarks || ''
                  }],
                  remarks: passedData.monthlyDatabaseCreationData.remarks || ''
                };
              }
              return { pmServerMonthlyDatabaseCreations: [], remarks: '' };
            })() : { pmServerMonthlyDatabaseCreations: [], remarks: '' },
            
            // Transform autoFailOverData from Edit format to Review format
            autoFailOverData: passedData.autoFailOverData ? (() => {
              // Check if it's already in Review format (pmServerFailOvers)
              if (passedData.autoFailOverData.pmServerFailOvers) {
                return passedData.autoFailOverData;
              }
              // Transform from Edit format (autoFailOverData array, remarks)
              // Include deleted items with IDs (so backend can mark them as deleted)
              const details = (passedData.autoFailOverData.autoFailOverData || [])
                .filter(item => item && (!item.isDeleted || item.id))
                .map((item, index) => ({
                  id: item.id || null,
                  serialNo: item.serialNumber || (index + 1).toString(),
                  yesNoStatusID: item.result || '',
                  remarks: item.remarks || '',
                  isDeleted: item.isDeleted || false // Preserve isDeleted flag
                }));
              
              if (details.length > 0 || (passedData.autoFailOverData.remarks && passedData.autoFailOverData.remarks.trim() !== '')) {
                return {
                  pmServerFailOvers: [{
                    details: details,
                    remarks: passedData.autoFailOverData.remarks || ''
                  }],
                  autoFailOverData: passedData.autoFailOverData.autoFailOverData || [], // Keep for Review component compatibility
                  remarks: passedData.autoFailOverData.remarks || ''
                };
              }
              return { pmServerFailOvers: [], autoFailOverData: [], remarks: '' };
            })() : { pmServerFailOvers: [], autoFailOverData: [], remarks: '' },
            
            // Transform asaFirewallData from Edit format to Review format
            asaFirewallData: passedData.asaFirewallData ? (() => {
              // Check if it's already in Review format (pmServerASAFirewalls)
              if (passedData.asaFirewallData.pmServerASAFirewalls) {
                return passedData.asaFirewallData;
              }
              // Transform from Edit format (asaFirewallData array, remarks)
              // Include deleted items with IDs (so backend can mark them as deleted)
              // Create flat array structure (not nested with details)
              const transformedItems = (passedData.asaFirewallData.asaFirewallData || [])
                .filter(item => item && (!item.isDeleted || item.id))
                .map((item, index) => ({
                  id: item.id || null,
                  serialNumber: item.serialNumber || (index + 1),
                  commandInput: item.commandInput || '',
                  asaFirewallStatusID: item.asaFirewallStatusID || '',
                  asaFirewallStatusName: item.asaFirewallStatusName || '',
                  resultStatusID: item.resultStatusID || '',
                  resultStatusName: item.resultStatusName || '',
                  remarks: item.remarks || '',
                  isNew: item.isNew || !item.id,
                  isModified: item.isModified || false,
                  isDeleted: item.isDeleted || false // Preserve isDeleted flag
                }));
              
              if (transformedItems.length > 0 || (passedData.asaFirewallData.remarks && passedData.asaFirewallData.remarks.trim() !== '')) {
                return {
                  pmServerASAFirewalls: transformedItems, // Flat array structure
                  asaFirewallData: passedData.asaFirewallData.asaFirewallData || [], // Keep for Review component compatibility
                  remarks: passedData.asaFirewallData.remarks || ''
                };
              }
              return { pmServerASAFirewalls: [], asaFirewallData: [], remarks: '' };
            })() : { pmServerASAFirewalls: [], asaFirewallData: [], remarks: '' },
            
            // Transform softwarePatchData from Edit format to Review format
            softwarePatchData: passedData.softwarePatchData ? (() => {
              // Check if it's already in Review format (array)
              if (Array.isArray(passedData.softwarePatchData)) {
                return passedData.softwarePatchData;
              }
              // Transform from Edit format (softwarePatchData object with array and remarks)
              // Include deleted items with IDs (so backend can mark them as deleted)
              if (passedData.softwarePatchData.softwarePatchData && Array.isArray(passedData.softwarePatchData.softwarePatchData)) {
                return passedData.softwarePatchData.softwarePatchData
                  .filter(item => item && (!item.isDeleted || item.id))
                  .map(item => ({
                    id: item.id || null,
                    serialNo: item.serialNo || '',
                    machineName: item.machineName || '',
                    previousPatch: item.previousPatch || '',
                    currentPatch: item.currentPatch || '',
                    isDeleted: item.isDeleted || false, // Preserve isDeleted flag
                    isNew: item.isNew || false,
                    isModified: item.isModified || false
                  }));
              }
              return [];
            })() : [],
            
            softwarePatchRemarks: passedData.softwarePatchData?.remarks || passedData.softwarePatchRemarks || '',
            
            // Transform diskUsageData from Edit format to Review format
            diskUsageData: passedData.diskUsageData ? (() => {
              // Check if it's already in Review format (pmServerDiskUsageHealths)
              if (passedData.diskUsageData.pmServerDiskUsageHealths) {
                return passedData.diskUsageData;
              }
              // Transform from Edit format (servers array, remarks)
              if (passedData.diskUsageData.servers && Array.isArray(passedData.diskUsageData.servers)) {
                // Include deleted servers/disks with IDs (so backend can mark them as deleted)
                // Only exclude new items (no ID) that are deleted (can't delete what doesn't exist)
                const servers = passedData.diskUsageData.servers.filter(server => !server.isDeleted || server.id);
                const allDetails = [];
                
                servers.forEach(server => {
                  if (server.disks && Array.isArray(server.disks)) {
                    const disksToProcess = server.disks.filter(disk => !disk.isDeleted || disk.id);
                    disksToProcess.forEach(disk => {
                      allDetails.push({
                        id: disk.id || null,
                        serverName: server.serverName || '',
                        diskName: disk.disk || '',
                        capacity: disk.capacity || '',
                        freeSpace: disk.freeSpace || '',
                        usage: disk.usage || '', // Include usage field
                        serverDiskStatusID: disk.status || '',
                        resultStatusID: disk.check || '',
                        remarks: disk.remarks || '',
                        isDeleted: disk.isDeleted || false // Preserve isDeleted flag
                      });
                    });
                  }
                });
                
                if (allDetails.length > 0 || (passedData.diskUsageData.remarks && passedData.diskUsageData.remarks.trim() !== '')) {
                  return {
                    pmServerDiskUsageHealths: [{
                      details: allDetails,
                      remarks: passedData.diskUsageData.remarks || ''
                    }],
                    servers: passedData.diskUsageData.servers || [], // Keep for Review component compatibility
                    remarks: passedData.diskUsageData.remarks || ''
                  };
                }
              }
              return { pmServerDiskUsageHealths: [], servers: [], remarks: '' };
            })() : { pmServerDiskUsageHealths: [], servers: [], remarks: '' },
            
            // Transform databaseBackupData from Edit format to Review format
            databaseBackupData: passedData.databaseBackupData ? (() => {
              // Check if it's already in Review format (pmServerDatabaseBackups)
              if (passedData.databaseBackupData.pmServerDatabaseBackups) {
                return passedData.databaseBackupData;
              }
              // Transform from Edit format (mssqlBackupData, scadaBackupData, remarks, latestBackupFileName)
              // Include deleted items with IDs (so backend can mark them as deleted)
              const mssqlDetails = (passedData.databaseBackupData.mssqlBackupData || [])
                .filter(item => item && (!item.isDeleted || item.id))
                .map((item, index) => ({
                  id: item.id || null,
                  serialNo: item.serialNo || (index + 1).toString(),
                  serverName: item.item || '',
                  yesNoStatusID: item.monthlyDBBackupCreated || '',
                  remarks: item.remarks || '',
                  isDeleted: item.isDeleted || false // Preserve isDeleted flag
                }));
              
              const scadaDetails = (passedData.databaseBackupData.scadaBackupData || [])
                .filter(item => item && (!item.isDeleted || item.id))
                .map((item, index) => ({
                  id: item.id || null,
                  serialNo: item.serialNo || (index + 1).toString(),
                  serverName: item.item || '',
                  yesNoStatusID: item.monthlyDBBackupCreated || '',
                  remarks: item.remarks || '',
                  isDeleted: item.isDeleted || false // Preserve isDeleted flag
                }));
              
              if (mssqlDetails.length > 0 || scadaDetails.length > 0 || 
                  (passedData.databaseBackupData.remarks && passedData.databaseBackupData.remarks.trim() !== '') ||
                  (passedData.databaseBackupData.latestBackupFileName && passedData.databaseBackupData.latestBackupFileName.trim() !== '')) {
                return {
                  pmServerDatabaseBackups: [{
                    mssqlDetails: mssqlDetails,
                    scadaDetails: scadaDetails,
                    remarks: passedData.databaseBackupData.remarks || '',
                    latestBackupFileName: passedData.databaseBackupData.latestBackupFileName || ''
                  }],
                  mssqlBackupData: passedData.databaseBackupData.mssqlBackupData || [], // Keep for Review component compatibility
                  scadaBackupData: passedData.databaseBackupData.scadaBackupData || [], // Keep for Review component compatibility
                  remarks: passedData.databaseBackupData.remarks || '',
                  latestBackupFileName: passedData.databaseBackupData.latestBackupFileName || ''
                };
              }
              return { pmServerDatabaseBackups: [], mssqlBackupData: [], scadaBackupData: [], remarks: '', latestBackupFileName: '' };
            })() : { pmServerDatabaseBackups: [], mssqlBackupData: [], scadaBackupData: [], remarks: '', latestBackupFileName: '' },
            
            // networkHealthData, willowlynx components are already in correct format, but ensure they're preserved
            networkHealthData: passedData.networkHealthData || { pmServerNetworkHealths: [], remarks: '' },
            willowlynxProcessStatusData: passedData.willowlynxProcessStatusData || { pmServerWillowlynxProcessStatuses: [], remarks: '' },
            willowlynxNetworkStatusData: passedData.willowlynxNetworkStatusData || { pmServerWillowlynxNetworkStatuses: [], remarks: '' },
            willowlynxRTUStatusData: passedData.willowlynxRTUStatusData || { pmServerWillowlynxRTUStatuses: [], remarks: '' },
            willowlynxHistorialTrendData: passedData.willowlynxHistorialTrendData || { pmServerWillowlynxHistoricalTrends: [], remarks: '' },
            willowlynxHistoricalReportData: passedData.willowlynxHistoricalReportData || { pmServerWillowlynxHistoricalReports: [], remarks: '' },
            willowlynxSumpPitCCTVCameraData: passedData.willowlynxSumpPitCCTVCameraData || { pmServerWillowlynxCCTVCameras: [], remarks: '' }
          };

          // Debug: Log transformed data to help troubleshoot
          console.log('=== ServerPMReportForm_Edit_Review - Data Transformation ===');
          console.log('Original passedData:', passedData);
          console.log('Transformed data:', transformedData);
          
          // Use the transformed form data
          setFormData(transformedData);
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
            pmServerDiskUsageHealths: response.pmServerDiskUsageHealths || []
          },
          cpuAndRamUsageData: {
            pmServerCPUAndMemoryUsages: response.pmServerCPUAndMemoryUsages || []
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


  // Convert Review format back to Edit format for API update
  const convertReviewToEditFormat = (reviewData) => {
    if (!reviewData) return reviewData;
    
    const converted = { ...reviewData };
    
    // Convert serverHealthData from Review format to Edit format
    if (converted.serverHealthData && converted.serverHealthData.pmServerHealths) {
      const pmServerHealths = converted.serverHealthData.pmServerHealths;
      if (Array.isArray(pmServerHealths) && pmServerHealths.length > 0) {
        const firstItem = pmServerHealths[0];
        converted.serverHealthData = {
          serverHealthData: (firstItem.details || []).map(detail => ({
            id: detail.id || detail.ID || null,
            serverName: detail.serverName || detail.ServerName || '',
            result: detail.resultStatusID || detail.resultStatusID || detail.result || '',
            remarks: detail.remarks || detail.Remarks || '',
            isNew: !(detail.id || detail.ID),
            isModified: detail.isModified || detail.IsModified || false,
            isDeleted: detail.isDeleted || detail.IsDeleted || false
          })),
          remarks: firstItem.remarks || converted.serverHealthData.remarks || ''
        };
      } else {
        converted.serverHealthData = { serverHealthData: [], remarks: converted.serverHealthData.remarks || '' };
      }
    }
    
    // Convert hardDriveHealthData from Review format to Edit format
    if (converted.hardDriveHealthData && converted.hardDriveHealthData.pmServerHardDriveHealths) {
      const pmServerHardDriveHealths = converted.hardDriveHealthData.pmServerHardDriveHealths;
      if (Array.isArray(pmServerHardDriveHealths) && pmServerHardDriveHealths.length > 0) {
        const firstItem = pmServerHardDriveHealths[0];
        converted.hardDriveHealthData = {
          hardDriveHealthData: (firstItem.details || []).map(detail => ({
            id: detail.id || detail.ID || null,
            serverName: detail.serverName || detail.ServerName || '',
            result: detail.resultStatusID || detail.resultStatusID || detail.result || '',
            remarks: detail.remarks || detail.Remarks || '',
            isNew: !(detail.id || detail.ID),
            isModified: detail.isModified || detail.IsModified || false,
            isDeleted: detail.isDeleted || detail.IsDeleted || false
          })),
          remarks: firstItem.remarks || converted.hardDriveHealthData.remarks || ''
        };
      } else {
        converted.hardDriveHealthData = { hardDriveHealthData: [], remarks: converted.hardDriveHealthData.remarks || '' };
      }
    }
    
    // Convert cpuAndRamUsageData from Review format to Edit format
    if (converted.cpuAndRamUsageData && converted.cpuAndRamUsageData.pmServerCPUAndMemoryUsages) {
      const pmServerCPUAndMemoryUsages = converted.cpuAndRamUsageData.pmServerCPUAndMemoryUsages;
      if (Array.isArray(pmServerCPUAndMemoryUsages) && pmServerCPUAndMemoryUsages.length > 0) {
        const firstItem = pmServerCPUAndMemoryUsages[0];
        converted.cpuAndRamUsageData = {
          memoryUsageData: (firstItem.memoryUsageDetails || []).map(detail => ({
            id: detail.ID || detail.id || null,
            serialNo: detail.SerialNo || detail.serialNo || '',
            machineName: detail.ServerName || detail.serverName || '',
            memorySize: detail.MemorySize || detail.memorySize || '',
            memoryInUse: detail.MemoryInUse || detail.memoryInUse || detail.memoryUsagePercentage || '',
            memoryUsageCheck: detail.ResultStatusID || detail.resultStatusID || detail.result || '',
            remarks: detail.Remarks || detail.remarks || '',
            isNew: !(detail.ID || detail.id),
            isDeleted: detail.IsDeleted || detail.isDeleted || false
          })),
          cpuUsageData: (firstItem.cpuUsageDetails || []).map(detail => ({
            id: detail.ID || detail.id || null,
            serialNo: detail.SerialNo || detail.serialNo || '',
            machineName: detail.ServerName || detail.serverName || '',
            cpuUsage: detail.CpuUsage || detail.cpuUsage || detail.cpuUsagePercentage || '',
            cpuUsageCheck: detail.ResultStatusID || detail.resultStatusID || detail.result || '',
            remarks: detail.Remarks || detail.remarks || '',
            isNew: !(detail.ID || detail.id),
            isDeleted: detail.IsDeleted || detail.isDeleted || false
          })),
          remarks: firstItem.remarks || converted.cpuAndRamUsageData.remarks || ''
        };
      } else {
        converted.cpuAndRamUsageData = { memoryUsageData: [], cpuUsageData: [], remarks: converted.cpuAndRamUsageData?.remarks || '' };
      }
    }
    
    // Convert diskUsageData from Review format to Edit format
    // But if data already has servers structure (from Edit component), preserve it with flags
    if (converted.diskUsageData) {
      // If data already has servers structure (from Edit component), use it directly
      // This preserves isNew and isModified flags
      if (converted.diskUsageData.servers && Array.isArray(converted.diskUsageData.servers)) {
        // Data is already in Edit format, just ensure it has the right structure
        converted.diskUsageData = {
          servers: converted.diskUsageData.servers,
          remarks: converted.diskUsageData.remarks || '',
          resultStatusOptions: converted.diskUsageData.resultStatusOptions,
          serverDiskStatusOptions: converted.diskUsageData.serverDiskStatusOptions
        };
      } else if (converted.diskUsageData.pmServerDiskUsageHealths) {
        // Convert from Review format (pmServerDiskUsageHealths) to Edit format (servers)
        const pmServerDiskUsageHealths = converted.diskUsageData.pmServerDiskUsageHealths;
        if (Array.isArray(pmServerDiskUsageHealths) && pmServerDiskUsageHealths.length > 0) {
          const firstItem = pmServerDiskUsageHealths[0];
          // Group details by serverName
          const serverMap = new Map();
          (firstItem.pmServerDiskUsageHealthDetails || firstItem.details || []).forEach(detail => {
            const serverName = detail.ServerName || detail.serverName || '';
            if (!serverName) return;
            
            if (!serverMap.has(serverName)) {
              const serverId = detail.PMServerDiskUsageHealthID || detail.pmServerDiskUsageHealthID || null;
              serverMap.set(serverName, {
                id: serverId,
                serverName: serverName,
                disks: [],
                isNew: !serverId,
                isModified: false,
                isDeleted: false
              });
            }
            
            const diskId = detail.ID || detail.id || null;
            serverMap.get(serverName).disks.push({
              id: diskId,
              disk: detail.DiskName || detail.diskName || '',
              status: detail.ServerDiskStatusID || detail.serverDiskStatusID || '',
              capacity: detail.Capacity || detail.capacity || '',
              freeSpace: detail.FreeSpace || detail.freeSpace || '',
              usage: detail.Usage || detail.usage || '', // Handle both lowercase and capitalized
              check: detail.ResultStatusID || detail.resultStatusID || detail.result || '',
              remarks: detail.Remarks || detail.remarks || '',
              isNew: !diskId, // Set based on ID presence
              isModified: false, // Will be set by Edit component when user modifies
              isDeleted: detail.IsDeleted || detail.isDeleted || false
            });
          });
          converted.diskUsageData = {
            servers: Array.from(serverMap.values()),
            remarks: firstItem.remarks || converted.diskUsageData.remarks || '',
            resultStatusOptions: converted.diskUsageData.resultStatusOptions,
            serverDiskStatusOptions: converted.diskUsageData.serverDiskStatusOptions
          };
        } else {
          converted.diskUsageData = { 
            servers: [], 
            remarks: converted.diskUsageData?.remarks || '',
            resultStatusOptions: converted.diskUsageData?.resultStatusOptions,
            serverDiskStatusOptions: converted.diskUsageData?.serverDiskStatusOptions
          };
        }
      }
    }
    
    // Convert timeSyncData from Review format to Edit format
    if (converted.timeSyncData && converted.timeSyncData.pmServerTimeSyncs) {
      const pmServerTimeSyncs = converted.timeSyncData.pmServerTimeSyncs;
      if (Array.isArray(pmServerTimeSyncs) && pmServerTimeSyncs.length > 0) {
        const firstItem = pmServerTimeSyncs[0];
        converted.timeSyncData = {
          timeSyncData: (firstItem.details || []).map(detail => ({
            id: detail.id || detail.ID || null,
            serialNo: detail.serialNo || detail.SerialNo || '',
            machineName: detail.serverName || detail.ServerName || '',
            timeSyncResult: detail.resultStatusID || detail.ResultStatusID || detail.result || '',
            remarks: detail.remarks || detail.Remarks || '',
            isNew: !(detail.id || detail.ID),
            isModified: detail.isModified || detail.IsModified || false,
            isDeleted: detail.isDeleted || detail.IsDeleted || false
          })),
          remarks: firstItem.remarks || converted.timeSyncData.remarks || ''
        };
      } else {
        converted.timeSyncData = { timeSyncData: [], remarks: converted.timeSyncData?.remarks || '' };
      }
    }
    
    // Convert hotFixesData from Review format to Edit format
    if (converted.hotFixesData && converted.hotFixesData.pmServerHotFixes) {
      const pmServerHotFixes = converted.hotFixesData.pmServerHotFixes;
      if (Array.isArray(pmServerHotFixes) && pmServerHotFixes.length > 0) {
        const firstItem = pmServerHotFixes[0];
        converted.hotFixesData = {
          hotFixesData: (firstItem.details || []).map(detail => ({
            id: detail.id || detail.ID || null,
            serialNo: detail.serialNo || detail.SerialNo || '',
            machineName: detail.serverName || detail.ServerName || '',
            hotFixName: detail.hotFixName || detail.LatestHotFixsApplied || '',
            done: detail.resultStatusID || detail.ResultStatusID || detail.result || '',
            remarks: detail.remarks || detail.Remarks || '',
            isNew: !(detail.id || detail.ID),
            isModified: detail.isModified || detail.IsModified || false,
            isDeleted: detail.isDeleted || detail.IsDeleted || false
          })),
          remarks: firstItem.remarks || converted.hotFixesData.remarks || ''
        };
      } else {
        converted.hotFixesData = { hotFixesData: [], remarks: converted.hotFixesData?.remarks || '' };
      }
    }
    
    // Convert monthlyDatabaseCreationData from Review format to Edit format
    if (converted.monthlyDatabaseCreationData && converted.monthlyDatabaseCreationData.pmServerMonthlyDatabaseCreations) {
      const pmServerMonthlyDatabaseCreations = converted.monthlyDatabaseCreationData.pmServerMonthlyDatabaseCreations;
      if (Array.isArray(pmServerMonthlyDatabaseCreations) && pmServerMonthlyDatabaseCreations.length > 0) {
        const firstItem = pmServerMonthlyDatabaseCreations[0];
        converted.monthlyDatabaseCreationData = {
          monthlyDatabaseData: (firstItem.details || []).map(detail => ({
            id: detail.id || detail.ID || null,
            serialNo: detail.serialNo || detail.SerialNo || '',
            item: detail.serverName || detail.ServerName || '',
            monthlyDBCreated: detail.yesNoStatusID || detail.YesNoStatusID || detail.result || '',
            remarks: detail.remarks || detail.Remarks || '',
            isNew: !(detail.id || detail.ID),
            isModified: detail.isModified || detail.IsModified || false,
            isDeleted: detail.isDeleted || detail.IsDeleted || false
          })),
          remarks: firstItem.remarks || converted.monthlyDatabaseCreationData.remarks || ''
        };
      } else {
        converted.monthlyDatabaseCreationData = { monthlyDatabaseData: [], remarks: converted.monthlyDatabaseCreationData?.remarks || '' };
      }
    }
    
    // Convert autoFailOverData from Review format to Edit format
    if (converted.autoFailOverData && converted.autoFailOverData.pmServerFailOvers) {
      const pmServerFailOvers = converted.autoFailOverData.pmServerFailOvers;
      if (Array.isArray(pmServerFailOvers) && pmServerFailOvers.length > 0) {
        const firstItem = pmServerFailOvers[0];
        converted.autoFailOverData = {
          autoFailOverData: (firstItem.details || []).map(detail => ({
            id: detail.id || detail.ID || null,
            serialNumber: detail.serialNo || detail.SerialNo || '',
            toServer: detail.toServer || detail.ToServer || '',
            fromServer: detail.fromServer || detail.FromServer || '',
            result: detail.yesNoStatusID || detail.YesNoStatusID || detail.result || '',
            remarks: detail.remarks || detail.Remarks || '',
            isNew: !(detail.id || detail.ID),
            isModified: detail.isModified || detail.IsModified || false,
            isDeleted: detail.isDeleted || detail.IsDeleted || false
          })),
          remarks: firstItem.remarks || converted.autoFailOverData.remarks || ''
        };
      } else {
        converted.autoFailOverData = { autoFailOverData: [], remarks: converted.autoFailOverData?.remarks || '' };
      }
    }
    
    // Convert asaFirewallData from Review format to Edit format
    if (converted.asaFirewallData) {
      // Check if data is already in Edit format (has asaFirewallData array)
      if (converted.asaFirewallData.asaFirewallData && Array.isArray(converted.asaFirewallData.asaFirewallData)) {
        // Already in Edit format, just ensure structure is correct
        converted.asaFirewallData = {
          asaFirewallData: converted.asaFirewallData.asaFirewallData,
          remarks: converted.asaFirewallData.remarks || ''
        };
      } else if (converted.asaFirewallData.pmServerASAFirewalls) {
        const pmServerASAFirewalls = converted.asaFirewallData.pmServerASAFirewalls;
        if (Array.isArray(pmServerASAFirewalls) && pmServerASAFirewalls.length > 0) {
          const firstItem = pmServerASAFirewalls[0];
          
          // Check if it's a nested structure with details array
          if (firstItem.details && Array.isArray(firstItem.details)) {
            // Nested structure: pmServerASAFirewalls[0].details
            converted.asaFirewallData = {
              asaFirewallData: (firstItem.details || []).map(detail => ({
                id: detail.id || detail.ID || null,
                serialNumber: detail.serialNo || detail.SerialNo || '',
                commandInput: detail.commandInput || detail.CommandInput || '',
                asaFirewallStatusID: detail.asaFirewallStatusID || detail.ASAFirewallStatusID || '',
                resultStatusID: detail.resultStatusID || detail.ResultStatusID || detail.result || '',
                remarks: detail.remarks || detail.Remarks || '',
                isNew: !(detail.id || detail.ID),
                isModified: detail.isModified || detail.IsModified || false,
                isDeleted: detail.isDeleted || detail.IsDeleted || false
              })),
              remarks: firstItem.remarks || converted.asaFirewallData.remarks || ''
            };
          } else {
            // Flat array structure: pmServerASAFirewalls is the array of items directly
            converted.asaFirewallData = {
              asaFirewallData: pmServerASAFirewalls
                .filter(item => item && (!item.isDeleted || item.id || item.ID)) // Filter out deleted items without IDs
                .map(item => ({
                  id: item.id || item.ID || null,
                  serialNumber: item.serialNumber || item.SerialNumber || '',
                  commandInput: item.commandInput || item.CommandInput || '',
                  asaFirewallStatusID: item.asaFirewallStatusID || item.ASAFirewallStatusID || '',
                  resultStatusID: item.resultStatusID || item.ResultStatusID || item.result || '',
                  remarks: item.remarks || item.Remarks || '',
                  isNew: !(item.id || item.ID),
                  isModified: item.isModified || item.IsModified || false,
                  isDeleted: item.isDeleted || item.IsDeleted || false
                })),
              remarks: converted.asaFirewallData.remarks || ''
            };
          }
        } else {
          converted.asaFirewallData = { asaFirewallData: [], remarks: converted.asaFirewallData?.remarks || '' };
        }
      } else {
        // No data structure found, initialize empty
        converted.asaFirewallData = { asaFirewallData: [], remarks: converted.asaFirewallData?.remarks || '' };
      }
    }
    
    // Convert databaseBackupData from Review format to Edit format
    if (converted.databaseBackupData && converted.databaseBackupData.pmServerDatabaseBackups) {
      const pmServerDatabaseBackups = converted.databaseBackupData.pmServerDatabaseBackups;
      if (Array.isArray(pmServerDatabaseBackups) && pmServerDatabaseBackups.length > 0) {
        const firstItem = pmServerDatabaseBackups[0];
        converted.databaseBackupData = {
          mssqlBackupData: (firstItem.mssqlDetails || firstItem.mssqlDatabaseBackupDetails || []).map(detail => ({
            id: detail.id || detail.ID || null,
            serialNo: detail.serialNo || detail.SerialNo || '',
            item: detail.serverName || detail.ServerName || '',
            monthlyDBBackupCreated: detail.yesNoStatusID || detail.YesNoStatusID || detail.result || '',
            remarks: detail.remarks || detail.Remarks || '',
            isNew: !(detail.id || detail.ID),
            isModified: detail.isModified || detail.IsModified || false,
            isDeleted: detail.isDeleted || detail.IsDeleted || false
          })),
          scadaBackupData: (firstItem.scadaDetails || firstItem.scadaDataBackupDetails || []).map(detail => ({
            id: detail.id || detail.ID || null,
            serialNo: detail.serialNo || detail.SerialNo || '',
            item: detail.serverName || detail.ServerName || '',
            monthlyDBBackupCreated: detail.yesNoStatusID || detail.YesNoStatusID || detail.result || '',
            remarks: detail.remarks || detail.Remarks || '',
            isNew: !(detail.id || detail.ID),
            isModified: detail.isModified || detail.IsModified || false,
            isDeleted: detail.isDeleted || detail.IsDeleted || false
          })),
          remarks: firstItem.remarks || converted.databaseBackupData.remarks || '',
          latestBackupFileName: firstItem.latestBackupFileName || converted.databaseBackupData.latestBackupFileName || ''
        };
      } else {
        converted.databaseBackupData = { mssqlBackupData: [], scadaBackupData: [], remarks: converted.databaseBackupData?.remarks || '', latestBackupFileName: converted.databaseBackupData?.latestBackupFileName || '' };
      }
    }
    
    // Convert softwarePatchData - handle both array format and nested object format
    // Helper function to validate if a string is a valid GUID format
    const isValidGuid = (value) => {
      if (!value || typeof value !== 'string') return false;
      const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const guidPatternNoDashes = /^[0-9a-f]{32}$/i;
      const trimmed = value.trim();
      return guidPattern.test(trimmed) || guidPatternNoDashes.test(trimmed);
    };
    
    if (converted.softwarePatchData) {
      // Check if data is already in Edit format (has softwarePatchData array inside)
      if (converted.softwarePatchData.softwarePatchData && Array.isArray(converted.softwarePatchData.softwarePatchData)) {
        // Already in Edit format, just ensure IDs are properly set
        converted.softwarePatchData = {
          softwarePatchData: converted.softwarePatchData.softwarePatchData.map(item => {
            // Ensure ID is either a valid GUID string or null (not empty string)
            let itemId = null;
            const idValue = item.id || item.ID;
            // Only use ID if it's a valid GUID
            if (idValue && String(idValue).trim() !== '') {
              const idStr = String(idValue).trim();
              if (isValidGuid(idStr)) {
                itemId = idStr;
              }
              // If not a valid GUID, itemId remains null (treat as new item)
            }
            
            // Determine if item is new based on ID presence and validity
            const isItemNew = !itemId;
            
            return {
              id: itemId, // null for new items, valid GUID string for existing items
              serialNo: item.serialNo || item.SerialNo || '',
              machineName: item.machineName || item.ServerName || '',
              previousPatch: item.previousPatch || item.PreviousPatch || '',
              currentPatch: item.currentPatch || item.CurrentPatch || '',
              remarks: item.remarks || item.Remarks || '',
              isNew: isItemNew, // Explicitly set based on ID presence and validity
              isModified: item.isModified || item.IsModified || false,
              isDeleted: item.isDeleted || item.IsDeleted || false
            };
          }),
          remarks: converted.softwarePatchData.remarks || converted.softwarePatchRemarks || ''
        };
      } else if (Array.isArray(converted.softwarePatchData)) {
        // Review format: array directly
        converted.softwarePatchData = {
          softwarePatchData: converted.softwarePatchData.map(item => {
            // Ensure ID is either a valid GUID string or null (not empty string)
            let itemId = null;
            const idValue = item.id || item.ID;
            // Only use ID if it's a valid GUID
            if (idValue && String(idValue).trim() !== '') {
              const idStr = String(idValue).trim();
              if (isValidGuid(idStr)) {
                itemId = idStr;
              }
              // If not a valid GUID, itemId remains null (treat as new item)
            }
            
            // Determine if item is new based on ID presence and validity
            const isItemNew = !itemId;
            
            return {
              id: itemId, // null for new items, valid GUID string for existing items
              serialNo: item.serialNo || item.SerialNo || '',
              machineName: item.machineName || item.ServerName || '',
              previousPatch: item.previousPatch || item.PreviousPatch || '',
              currentPatch: item.currentPatch || item.CurrentPatch || '',
              remarks: item.remarks || item.Remarks || '',
              isNew: isItemNew, // Explicitly set based on ID presence and validity
              isModified: item.isModified || item.IsModified || false,
              isDeleted: item.isDeleted || item.IsDeleted || false
            };
          }),
          remarks: converted.softwarePatchRemarks || ''
        };
      } else {
        // No data or unknown format, initialize empty
        converted.softwarePatchData = {
          softwarePatchData: [],
          remarks: converted.softwarePatchRemarks || ''
        };
      }
    }
    
    // Convert networkHealthData and willowlynx components - they're simple structures
    if (converted.networkHealthData && converted.networkHealthData.pmServerNetworkHealths && Array.isArray(converted.networkHealthData.pmServerNetworkHealths) && converted.networkHealthData.pmServerNetworkHealths.length > 0) {
      const firstItem = converted.networkHealthData.pmServerNetworkHealths[0];
      converted.networkHealthData = {
        dateChecked: firstItem.dateChecked,
        result: firstItem.yesNoStatusID || firstItem.result,
        remarks: firstItem.remarks || converted.networkHealthData.remarks || ''
      };
    }
    
    if (converted.willowlynxProcessStatusData && converted.willowlynxProcessStatusData.pmServerWillowlynxProcessStatuses && Array.isArray(converted.willowlynxProcessStatusData.pmServerWillowlynxProcessStatuses) && converted.willowlynxProcessStatusData.pmServerWillowlynxProcessStatuses.length > 0) {
      const firstItem = converted.willowlynxProcessStatusData.pmServerWillowlynxProcessStatuses[0];
      converted.willowlynxProcessStatusData = {
        result: firstItem.yesNoStatusID || firstItem.result,
        remarks: firstItem.remarks || converted.willowlynxProcessStatusData.remarks || ''
      };
    }
    
    if (converted.willowlynxNetworkStatusData && converted.willowlynxNetworkStatusData.pmServerWillowlynxNetworkStatuses && Array.isArray(converted.willowlynxNetworkStatusData.pmServerWillowlynxNetworkStatuses) && converted.willowlynxNetworkStatusData.pmServerWillowlynxNetworkStatuses.length > 0) {
      const firstItem = converted.willowlynxNetworkStatusData.pmServerWillowlynxNetworkStatuses[0];
      converted.willowlynxNetworkStatusData = {
        dateChecked: firstItem.dateChecked,
        result: firstItem.yesNoStatusID || firstItem.result,
        remarks: firstItem.remarks || converted.willowlynxNetworkStatusData.remarks || ''
      };
    }
    
    if (converted.willowlynxRTUStatusData && converted.willowlynxRTUStatusData.pmServerWillowlynxRTUStatuses && Array.isArray(converted.willowlynxRTUStatusData.pmServerWillowlynxRTUStatuses) && converted.willowlynxRTUStatusData.pmServerWillowlynxRTUStatuses.length > 0) {
      const firstItem = converted.willowlynxRTUStatusData.pmServerWillowlynxRTUStatuses[0];
      converted.willowlynxRTUStatusData = {
        dateChecked: firstItem.dateChecked,
        result: firstItem.yesNoStatusID || firstItem.result,
        remarks: firstItem.remarks || converted.willowlynxRTUStatusData.remarks || ''
      };
    }
    
    if (converted.willowlynxHistorialTrendData && converted.willowlynxHistorialTrendData.pmServerWillowlynxHistoricalTrends && Array.isArray(converted.willowlynxHistorialTrendData.pmServerWillowlynxHistoricalTrends) && converted.willowlynxHistorialTrendData.pmServerWillowlynxHistoricalTrends.length > 0) {
      const firstItem = converted.willowlynxHistorialTrendData.pmServerWillowlynxHistoricalTrends[0];
      converted.willowlynxHistorialTrendData = {
        dateChecked: firstItem.dateChecked,
        result: firstItem.yesNoStatusID || firstItem.result,
        remarks: firstItem.remarks || converted.willowlynxHistorialTrendData.remarks || ''
      };
    }
    
    if (converted.willowlynxHistoricalReportData && converted.willowlynxHistoricalReportData.pmServerWillowlynxHistoricalReports && Array.isArray(converted.willowlynxHistoricalReportData.pmServerWillowlynxHistoricalReports) && converted.willowlynxHistoricalReportData.pmServerWillowlynxHistoricalReports.length > 0) {
      const firstItem = converted.willowlynxHistoricalReportData.pmServerWillowlynxHistoricalReports[0];
      converted.willowlynxHistoricalReportData = {
        result: firstItem.yesNoStatusID || firstItem.result,
        remarks: firstItem.remarks || converted.willowlynxHistoricalReportData.remarks || ''
      };
    }
    
    if (converted.willowlynxSumpPitCCTVCameraData && converted.willowlynxSumpPitCCTVCameraData.pmServerWillowlynxCCTVCameras && Array.isArray(converted.willowlynxSumpPitCCTVCameraData.pmServerWillowlynxCCTVCameras) && converted.willowlynxSumpPitCCTVCameraData.pmServerWillowlynxCCTVCameras.length > 0) {
      const firstItem = converted.willowlynxSumpPitCCTVCameraData.pmServerWillowlynxCCTVCameras[0];
      converted.willowlynxSumpPitCCTVCameraData = {
        result: firstItem.yesNoStatusID || firstItem.result,
        remarks: firstItem.remarks || converted.willowlynxSumpPitCCTVCameraData.remarks || ''
      };
    }
    
    return converted;
  };

  const performUpdate = async (finalReportFileParam = null, { skipNavigation = false, suppressSuccessToast = false, formDataOverride = null } = {}) => {
    try {
      setSubmitting(true);
      setError(null);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      let dataToUpdate = formDataOverride || formData;
      
      // Convert Review format to Edit format if needed
      dataToUpdate = convertReviewToEditFormat(dataToUpdate);
      
      console.log('=== Sending data to updateServerPMReportForm ===');
      console.log('Converted data structure:', JSON.stringify(dataToUpdate, null, 2));
      
      const result = await updateServerPMReportForm(id, dataToUpdate, user);

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

      // Show success notification (unless suppressed)
      if (!suppressSuccessToast) {
        setNotification({
          open: true,
          message: 'Server PM report updated successfully! Redirecting to report list...',
          severity: 'success'
        });
      }

      // Navigate (unless skipped)
      if (!skipNavigation) {
        setTimeout(() => {
          navigate('/report-management-system');
        }, 2000);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating report:', error);
      const message = error.response?.data?.message || error.message || 'Failed to update report.';
      setError('Failed to update report: ' + message);
      setNotification({
        open: true,
        message: 'Failed to update report. Please try again.',
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
    // Show download confirmation modal instead of directly updating
    setDownloadConfirmModalOpen(true);
  };

  // Handle when user clicks "Cancel" in download modal - just close and stay on review page
  const handleModalCancel = () => {
    setDownloadConfirmModalOpen(false);
  };

  // Handle when user clicks "Update Report Only" - update without downloading
  const handleUpdateOnly = async () => {
    try {
      setIsDownloading(true);
      setDownloadConfirmModalOpen(false);
      await performUpdate();
    } catch (error) {
      console.error('Error during report update:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle when user clicks "Download Report" - update and download
  const handleDownloadConfirm = async () => {
    try {
      setIsDownloading(true);
      setDownloadConfirmModalOpen(false);

      console.log('=== Starting Server PM report update and download ===');
      
      // Update the report first - pass null for finalReportFileParam, then options object
      const updateResult = await performUpdate(null, { skipNavigation: true, suppressSuccessToast: true });
      
      if (!updateResult.success) {
        console.error('Update failed');
        setIsDownloading(false);
        return;
      }
      
      // Wait a moment to ensure backend has processed the update
      console.log('Waiting 2 seconds before downloading...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Download the report
      await handleDownloadReport(id);
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Report updated and downloaded successfully!',
        severity: 'success'
      });
      
      // Navigate after download
      setTimeout(() => {
        navigate('/report-management-system');
      }, 1500);
      
    } catch (error) {
      console.error('Error during update and download:', error);
      setNotification({
        open: true,
        message: 'Report updated but download failed. You can download it from the report details page.',
        severity: 'warning'
      });
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
      throw error; // Re-throw to be caught by handleDownloadConfirm
    }
  };

  const handleFinalReportFileChange = (event) => {
    setFinalReportUploadError('');
    const file = event.target.files?.[0] || null;
    setFinalReportFile(file);
  };

  // Signature handling functions
  const handleAttendedBySignatureChange = (event) => {
    const file = event.target.files?.[0] || null;
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
    const file = event.target.files?.[0] || null;
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

  // Helper function to download the final report after saving
  const downloadSavedFinalReport = async (reportFormId, jobNo) => {
    try {
      // Wait a bit for the final report to be created in the database
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Fetch the final reports for this report form
      const finalReports = await getFinalReportsByReportForm(reportFormId);
      
      if (finalReports && finalReports.length > 0) {
        // Get the most recent final report (first one)
        const latestReport = finalReports[0];
        
        // Download the final report
        const response = await downloadFinalReportAttachment(latestReport.id);
        const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileName = latestReport.attachmentName || `FinalReport_${jobNo || 'report'}.pdf`;
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        
        console.log('Final report downloaded successfully:', fileName);
      } else {
        console.log('No final reports found for download');
      }
    } catch (downloadError) {
      console.error('Error downloading final report:', downloadError);
    }
  };

  const handleCloseFinalReportDialog = () => {
    if (!finalReportUploading) {
      setFinalReportDialogOpen(false);
      setFinalReportFile(null);
      setFinalReportUploadError('');
      // Reset signature states
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
    }
  };

  const handleUploadFinalReport = async () => {
    try {
      setFinalReportUploading(true);
      setFinalReportUploadError('');
      
      const reportFormId = id;
      if (!reportFormId) {
        setFinalReportUploadError('Report Form ID is missing. Unable to proceed.');
        setFinalReportUploading(false);
        return;
      }

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
          setFinalReportUploadError('Please select a file to upload.');
          setFinalReportUploading(false);
          return;
        }
      } else {
        // Signatures tab - validate both signatures
        const hasBothSignatures = !!attendedBySignatureToUpload && !!approvedBySignatureToUpload;
        
        if (!hasBothSignatures) {
          if (!attendedBySignatureToUpload && !approvedBySignatureToUpload) {
            setFinalReportUploadError('Please provide both signatures.');
          } else if (attendedBySignatureToUpload && !approvedBySignatureToUpload) {
            setFinalReportUploadError('Please provide the Approved By signature.');
          } else if (!attendedBySignatureToUpload && approvedBySignatureToUpload) {
            setFinalReportUploadError('Please provide the Attended By signature.');
          }
          setFinalReportUploading(false);
          return;
        }
      }

      // Update formData to set formStatus to "Close" before processing
      const updatedFormData = {
        ...formData,
        formStatus: 'Close',
        formStatusName: 'Close'
      };
      setFormData(updatedFormData);

      // Process based on active tab
      if (activeTab === 0 && finalReportFile) {
        // Upload PDF file with updated formData (status = Close)
        const result = await performUpdate(finalReportFile, { formDataOverride: updatedFormData });
        if (!result.success) {
          setFinalReportUploadError(result.message || 'Failed to submit report. Please try again.');
          setFinalReportUploading(false);
          return;
        }
      } else if (activeTab === 1 && attendedBySignatureToUpload && approvedBySignatureToUpload) {
        // Upload signatures and generate PDF
        const imageTypes = await getReportFormImageTypes();
        const attendedByImageType = imageTypes.find(type => type.imageTypeName === 'AttendedBySignature');
        const approvedByImageType = imageTypes.find(type => type.imageTypeName === 'ApprovedBySignature');

        if (attendedByImageType && approvedByImageType) {
          // Upload signatures as images
          await createReportFormImage(reportFormId, attendedBySignatureToUpload, attendedByImageType.id, 'Signatures');
          await createReportFormImage(reportFormId, approvedBySignatureToUpload, approvedByImageType.id, 'Signatures');
        }

        // Generate final report PDF with signatures
        await generateServerPMFinalReportPdf(reportFormId);

        // Update the report form status to Close with updated formData
        await performUpdate(null, { skipNavigation: true, suppressSuccessToast: true, formDataOverride: updatedFormData });
      }

      // Reset states
      setAttendedBySignature(null);
      setApprovedBySignature(null);
      setAttendedBySignaturePreview('');
      setApprovedBySignaturePreview('');
      setFinalReportFile(null);
      setFinalReportUploadError('');
      clearCanvas(attendedByCanvasRef);
      clearCanvas(approvedByCanvasRef);

      // Show success notification
      setNotification({
        open: true,
        message: activeTab === 0 
          ? 'Final report uploaded successfully! Report closed.' 
          : 'Signatures submitted and final report generated successfully! Report closed.',
        severity: 'success'
      });

      // Download the final report if signatures were used
      if (activeTab === 1) {
        setTimeout(async () => {
          try {
            await downloadSavedFinalReport(reportFormId, formData?.jobNo || formData?.reportForm?.jobNo);
          } catch (downloadError) {
            console.error('Error downloading final report:', downloadError);
          }
          navigate('/report-management-system');
        }, 4000);
      } else {
        // Navigate after a short delay for PDF upload
        setTimeout(() => {
          navigate('/report-management-system');
        }, 2000);
      }
      
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to submit report.';
      setFinalReportUploadError(message);
    } finally {
      setFinalReportUploading(false);
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

            {/* All Components Display - Following ServerPMReviewReportForm pattern */}
            {(() => {
              // Helper function to check if component has data - Following reference pattern
              const hasData = (data, dataKey) => {
                if (!data || typeof data !== 'object') return false;

                // Special handling for CPU and RAM Usage data structure
                if (dataKey === 'cpuAndRamUsageData') {
                  // Priority 1: Check for Edit format (memoryUsageData, cpuUsageData) - user filled data
                  if (data.memoryUsageData !== undefined || data.cpuUsageData !== undefined) {
                    const hasMemoryData = Array.isArray(data.memoryUsageData) && data.memoryUsageData.length > 0 && 
                      data.memoryUsageData.some(item => item && !item.isDeleted && (
                        (item.machineName && item.machineName.trim() !== '') ||
                        (item.memorySize && item.memorySize.trim() !== '') ||
                        (item.memoryInUse && item.memoryInUse.trim() !== '') ||
                        (item.memoryUsageCheck && item.memoryUsageCheck !== '')
                      ));
                    const hasCpuData = Array.isArray(data.cpuUsageData) && data.cpuUsageData.length > 0 &&
                      data.cpuUsageData.some(item => item && !item.isDeleted && (
                        (item.machineName && item.machineName.trim() !== '') ||
                        (item.cpuUsage && item.cpuUsage.trim() !== '') ||
                        (item.cpuUsageCheck && item.cpuUsageCheck !== '')
                      ));
                    const hasRemarks = data.remarks && data.remarks.trim() !== '';
                    return hasMemoryData || hasCpuData || hasRemarks;
                  }
                  // Priority 2: Check for Review format (pmServerCPUAndMemoryUsages)
                  if (data.pmServerCPUAndMemoryUsages && Array.isArray(data.pmServerCPUAndMemoryUsages) && data.pmServerCPUAndMemoryUsages.length > 0) {
                    const apiData = data.pmServerCPUAndMemoryUsages[0];
                    const hasMemoryData = apiData.memoryUsageDetails && Array.isArray(apiData.memoryUsageDetails) && apiData.memoryUsageDetails.length > 0;
                    const hasCpuData = apiData.cpuUsageDetails && Array.isArray(apiData.cpuUsageDetails) && apiData.cpuUsageDetails.length > 0;
                    const hasRemarks = apiData.remarks && apiData.remarks.trim() !== '';
                    return hasMemoryData || hasCpuData || hasRemarks;
                  }
                  return false;
                }

                // Special handling for DiskUsage data structure
                if (dataKey === 'diskUsageData') {
                  if (data.pmServerDiskUsageHealths && Array.isArray(data.pmServerDiskUsageHealths) && data.pmServerDiskUsageHealths.length > 0) {
                    const apiData = data.pmServerDiskUsageHealths[0];
                    const hasDetails = (apiData.details && Array.isArray(apiData.details) && apiData.details.length > 0) ||
                                      (apiData.pmServerDiskUsageHealthDetails && Array.isArray(apiData.pmServerDiskUsageHealthDetails) && apiData.pmServerDiskUsageHealthDetails.length > 0);
                    const hasRemarks = apiData.remarks && apiData.remarks.trim() !== '';
                    return hasDetails || hasRemarks;
                  }
                  // Fallback: check for servers array (hierarchical structure from Edit format)
                  if (data.servers && Array.isArray(data.servers) && data.servers.length > 0) {
                    return data.servers.some(server => 
                      !server.isDeleted &&
                      server.serverName && 
                      server.disks && 
                      Array.isArray(server.disks) && 
                      server.disks.some(disk => !disk.isDeleted && (disk.disk || disk.status || disk.check))
                    );
                  }
                  const hasRemarks = data.remarks && data.remarks.trim() !== '';
                  return hasRemarks;
                }

                // Special handling for timeSyncData
                if (dataKey === 'timeSyncData') {
                  if (data.pmServerTimeSyncs && Array.isArray(data.pmServerTimeSyncs) && data.pmServerTimeSyncs.length > 0) {
                    const apiData = data.pmServerTimeSyncs[0];
                    const hasDetails = apiData.details && Array.isArray(apiData.details) && apiData.details.length > 0;
                    const hasRemarks = apiData.remarks && apiData.remarks.trim() !== '';
                    return hasDetails || hasRemarks;
                  }
                  // Fallback: check for timeSyncData array (Edit format)
                  if (data.timeSyncData && Array.isArray(data.timeSyncData) && data.timeSyncData.length > 0) {
                    return data.timeSyncData.some(item => !item.isDeleted && (
                      (item.machineName && item.machineName.trim() !== '') ||
                      (item.timeSyncResult && item.timeSyncResult !== '')
                    ));
                  }
                  const hasRemarks = data.remarks && data.remarks.trim() !== '';
                  return hasRemarks;
                }

                // Special handling for hotFixesData
                if (dataKey === 'hotFixesData') {
                  if (data.pmServerHotFixes && Array.isArray(data.pmServerHotFixes) && data.pmServerHotFixes.length > 0) {
                    const apiData = data.pmServerHotFixes[0];
                    const hasDetails = apiData.details && Array.isArray(apiData.details) && apiData.details.length > 0;
                    const hasRemarks = apiData.remarks && apiData.remarks.trim() !== '';
                    return hasDetails || hasRemarks;
                  }
                  // Fallback: check for hotFixesData array (Edit format)
                  if (data.hotFixesData && Array.isArray(data.hotFixesData) && data.hotFixesData.length > 0) {
                    return data.hotFixesData.some(item => !item.isDeleted && (
                      (item.machineName && item.machineName.trim() !== '') ||
                      (item.hotFixName && item.hotFixName.trim() !== '') ||
                      (item.done && item.done !== '')
                    ));
                  }
                  const hasRemarks = data.remarks && data.remarks.trim() !== '';
                  return hasRemarks;
                }

                // Special handling for monthlyDatabaseCreationData
                if (dataKey === 'monthlyDatabaseCreationData') {
                  if (data.pmServerMonthlyDatabaseCreations && Array.isArray(data.pmServerMonthlyDatabaseCreations) && data.pmServerMonthlyDatabaseCreations.length > 0) {
                    const apiData = data.pmServerMonthlyDatabaseCreations[0];
                    const hasDetails = apiData.details && Array.isArray(apiData.details) && apiData.details.length > 0;
                    const hasRemarks = apiData.remarks && apiData.remarks.trim() !== '';
                    return hasDetails || hasRemarks;
                  }
                  // Fallback: check for monthlyDatabaseData array (Edit format)
                  if (data.monthlyDatabaseData && Array.isArray(data.monthlyDatabaseData) && data.monthlyDatabaseData.length > 0) {
                    return data.monthlyDatabaseData.some(item => !item.isDeleted && (
                      (item.item && item.item.trim() !== '') ||
                      (item.monthlyDBCreated && item.monthlyDBCreated !== '')
                    ));
                  }
                  const hasRemarks = data.remarks && data.remarks.trim() !== '';
                  return hasRemarks;
                }

                // Special handling for DatabaseBackup data structure
                if (dataKey === 'databaseBackupData') {
                  if (data.pmServerDatabaseBackups && Array.isArray(data.pmServerDatabaseBackups) && data.pmServerDatabaseBackups.length > 0) {
                    const apiData = data.pmServerDatabaseBackups[0];
                    const hasMssqlDetails = apiData.mssqlDetails && Array.isArray(apiData.mssqlDetails) && apiData.mssqlDetails.length > 0;
                    const hasScadaDetails = apiData.scadaDetails && Array.isArray(apiData.scadaDetails) && apiData.scadaDetails.length > 0;
                    const hasRemarks = apiData.remarks && apiData.remarks.trim() !== '';
                    const hasLatestBackupFileName = apiData.latestBackupFileName && apiData.latestBackupFileName.trim() !== '';
                    return hasMssqlDetails || hasScadaDetails || hasRemarks || hasLatestBackupFileName;
                  }
                  // Fallback: check for Edit format
                  const hasMssqlData = Array.isArray(data.mssqlBackupData) && data.mssqlBackupData.length > 0 &&
                    data.mssqlBackupData.some(item => !item.isDeleted && (
                      (item.item && item.item.trim() !== '') ||
                      (item.monthlyDBBackupCreated && item.monthlyDBBackupCreated !== '')
                    ));
                  const hasScadaData = Array.isArray(data.scadaBackupData) && data.scadaBackupData.length > 0 &&
                    data.scadaBackupData.some(item => !item.isDeleted && (
                      (item.item && item.item.trim() !== '') ||
                      (item.monthlyDBBackupCreated && item.monthlyDBBackupCreated !== '')
                    ));
                  const hasRemarks = data.remarks && data.remarks.trim() !== '';
                  const hasLatestBackupFileName = data.latestBackupFileName && data.latestBackupFileName.trim() !== '';

                  return hasMssqlData || hasScadaData || hasRemarks || hasLatestBackupFileName;
                }

                // Special handling for serverHealthData - check pmServerHealths array
                if (dataKey === 'serverHealthData') {
                  if (data.pmServerHealths && Array.isArray(data.pmServerHealths) && data.pmServerHealths.length > 0) {
                    const apiData = data.pmServerHealths[0];
                    const hasDetails = apiData.details && Array.isArray(apiData.details) && apiData.details.length > 0;
                    const hasRemarks = apiData.remarks && apiData.remarks.trim() !== '';
                    return hasDetails || hasRemarks;
                  }
                  // Fallback: check for serverHealthData array (Edit format)
                  if (data.serverHealthData && Array.isArray(data.serverHealthData) && data.serverHealthData.length > 0) {
                    return data.serverHealthData.some(item => !item.isDeleted && (
                      (item.serverName && item.serverName.trim() !== '') ||
                      (item.result && item.result !== '') ||
                      (item.remarks && item.remarks.trim() !== '')
                    ));
                  }
                  const hasRemarks = data.remarks && data.remarks.trim() !== '';
                  return hasRemarks;
                }

                // Special handling for hardDriveHealthData - check pmServerHardDriveHealths array
                if (dataKey === 'hardDriveHealthData') {
                  if (data.pmServerHardDriveHealths && Array.isArray(data.pmServerHardDriveHealths) && data.pmServerHardDriveHealths.length > 0) {
                    const apiData = data.pmServerHardDriveHealths[0];
                    const hasDetails = apiData.details && Array.isArray(apiData.details) && apiData.details.length > 0;
                    const hasRemarks = apiData.remarks && apiData.remarks.trim() !== '';
                    return hasDetails || hasRemarks;
                  }
                  // Fallback: check for hardDriveHealthData array (Edit format)
                  if (data.hardDriveHealthData && Array.isArray(data.hardDriveHealthData) && data.hardDriveHealthData.length > 0) {
                    return data.hardDriveHealthData.some(item => !item.isDeleted && (
                      (item.serverName && item.serverName.trim() !== '') ||
                      (item.result && item.result !== '') ||
                      (item.remarks && item.remarks.trim() !== '')
                    ));
                  }
                  const hasRemarks = data.remarks && data.remarks.trim() !== '';
                  return hasRemarks;
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

                // Special handling for autoFailOverData
                if (dataKey === 'autoFailOverData') {
                  if (data.pmServerFailOvers && Array.isArray(data.pmServerFailOvers) && data.pmServerFailOvers.length > 0) {
                    const apiData = data.pmServerFailOvers[0];
                    const hasDetails = apiData.details && Array.isArray(apiData.details) && apiData.details.length > 0;
                    const hasRemarks = apiData.remarks && apiData.remarks.trim() !== '';
                    return hasDetails || hasRemarks;
                  }
                  // Fallback: check for autoFailOverData array (Edit format)
                  if (data.autoFailOverData && Array.isArray(data.autoFailOverData) && data.autoFailOverData.length > 0) {
                    return data.autoFailOverData.some(item => !item.isDeleted && (
                      (item.failoverType && item.failoverType.trim() !== '') ||
                      (item.result && item.result !== '')
                    ));
                  }
                  const hasRemarks = data.remarks && data.remarks.trim() !== '';
                  return hasRemarks;
                }

                // Special handling for asaFirewallData
                if (dataKey === 'asaFirewallData') {
                  if (data.pmServerASAFirewalls && Array.isArray(data.pmServerASAFirewalls) && data.pmServerASAFirewalls.length > 0) {
                    const apiData = data.pmServerASAFirewalls[0];
                    const hasDetails = apiData.details && Array.isArray(apiData.details) && apiData.details.length > 0;
                    const hasRemarks = apiData.remarks && apiData.remarks.trim() !== '';
                    return hasDetails || hasRemarks;
                  }
                  // Fallback: check for asaFirewallData array (Edit format)
                  if (data.asaFirewallData && Array.isArray(data.asaFirewallData) && data.asaFirewallData.length > 0) {
                    return data.asaFirewallData.some(item => !item.isDeleted && (
                      (item.commandInput && item.commandInput.trim() !== '') ||
                      (item.resultStatusID && item.resultStatusID !== '')
                    ));
                  }
                  const hasRemarks = data.remarks && data.remarks.trim() !== '';
                  return hasRemarks;
                }

                // Special handling for softwarePatchData
                if (dataKey === 'softwarePatchData') {
                  // Check if it's an array (transformed format)
                  if (Array.isArray(data) && data.length > 0) {
                    return data.some(item => !item.isDeleted && (
                      (item.machineName && item.machineName.trim() !== '') ||
                      (item.previousPatch && item.previousPatch.trim() !== '') ||
                      (item.currentPatch && item.currentPatch.trim() !== '')
                    ));
                  }
                  // Check for nested structure (Edit format)
                  if (data.softwarePatchData && Array.isArray(data.softwarePatchData) && data.softwarePatchData.length > 0) {
                    return data.softwarePatchData.some(item => !item.isDeleted && (
                      (item.machineName && item.machineName.trim() !== '') ||
                      (item.previousPatch && item.previousPatch.trim() !== '') ||
                      (item.currentPatch && item.currentPatch.trim() !== '')
                    ));
                  }
                  const hasRemarks = data.remarks && data.remarks.trim() !== '';
                  return hasRemarks;
                }

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

            {/* Form Status Section - Moved to last position */}
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
        onCreateOnly={handleUpdateOnly}
        onDownload={handleDownloadConfirm}
        loading={isDownloading}
        createOnlyLabel="Update Report Only"
      />
    </LocalizationProvider>
  );
};

export default ServerPMReportForm_Edit_Review;
