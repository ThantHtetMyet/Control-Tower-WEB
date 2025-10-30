import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/icons-material';
import RMSTheme from '../../../theme-resource/RMSTheme';
import { getPMReportFormTypes, getServerPMReportFormWithDetails } from '../../../api-services/reportFormService';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Component imports - Edit versions
import ServerPMReportFormSignOff_Edit from './ServerPMReportFormSignOff_Edit';
import ServerHealth_Edit from './ServerHealth_Edit';
import HardDriveHealth_Edit from './HardDriveHealth_Edit';
import DiskUsage_Edit from './DiskUsage_Edit';
import CPUAndRamUsage_Edit from './CPUAndRamUsage_Edit';
import NetworkHealth_Edit from './NetworkHealth_Edit';
import WillowlynxProcessStatus_Edit from './WillowlynxProcessStatus_Edit';
import WillowlynxNetworkStatus_Edit from './WillowlynxNetworkStatus_Edit';
import WillowlynxRTUStatus_Edit from './WillowlynxRTUStatus_Edit';
import WillowlynxHistorialTrend_Edit from './WillowlynxHistoricalTrend_Edit';
import WillowlynxHistoricalReport_Edit from './WillowlynxHistoricalReport_Edit';
import WillowlynxSumpPitCCTVCamera_Edit from './WillowlynxSumpPitCCTVCamera_Edit';
import MonthlyDatabaseCreation_Edit from './MonthlyDatabaseCreation_Edit';
import DatabaseBackup_Edit from './DatabaseBackup_Edit';
import TimeSync_Edit from './TimeSync_Edit';
import HotFixes_Edit from './HotFixes_Edit';
import AutoFailOver_Edit from './AutoFailOver_Edit';
import ASAFirewall_Edit from './ASAFirewall_Edit';
import SoftwarePatch_Edit from './SoftwarePatch_Edit';

const ServerPMReportForm_Edit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [pmReportFormTypes, setPMReportFormTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState('signOff');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    reportTitle: '',
    systemDescription: '',
    systemNameWarehouseID: '',
    stationName: '',
    stationNameWarehouseID: '',
    jobNo: '',
    projectNo: '',
    customer: '',
    reportFormTypeID: '',
    pmReportFormTypeID: '',
    pmReportFormTypeName: '',
    dateOfService: '',
    remarks: '',
    approvedBy: '',
    attendedBy: ''
  });

  // Add signOffData to serverPMData state
  const [serverPMData, setServerPMData] = useState({
    signOffData: {},
    serverHealthData: [],
    hardDriveHealthData: [],
    diskUsageData: [],
    cpuAndRamUsageData: [],
    networkHealthData: [],
    willowlynxProcessStatusData: [],
    willowlynxNetworkStatusData: [],
    willowlynxRTUStatusData: [],
    willowlynxHistorialTrendData: [],
    willowlynxHistoricalReportData: [],
    willowlynxSumpPitCCTVCameraData: [],
    monthlyDatabaseCreationData: [],
    databaseBackupData: [],
    timeSyncData: [],
    hotFixesData: [],
    autoFailOverData: [],
    asaFirewallData: [],
    softwarePatchData: []
  });

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
        console.error('Error fetching PM Report Form Types:', error);
        setError('Failed to load PM Report Form Types');
      }
    };

    fetchPMReportFormTypes();
  }, []);

  // Load existing report data
  useEffect(() => {
    const fetchReportData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await getServerPMReportFormWithDetails(id);
        
        // Set basic form data
        setFormData({
          reportTitle: response.pmReportFormServer.reportTitle || 'Edit Server Preventive Maintenance Report',
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
          remarks: response.pmReportFormServer?.remarks || '',
          approvedBy: response.pmReportFormServer?.approvedBy || '',
          attendedBy: response.pmReportFormServer?.attendedBy || ''
        });

        // Map the backend data to the expected frontend structure - matching Details component
        const mappedServerPMData = {
          signOffData: {
            attendedBy: response.pmReportFormServer?.attendedBy || '',
            witnessedBy: response.pmReportFormServer?.witnessedBy || '',
            startDate: response.pmReportFormServer?.startDate ? new Date(response.pmReportFormServer.startDate) : null,
            completionDate: response.pmReportFormServer?.completionDate ? new Date(response.pmReportFormServer.completionDate) : null,
            remark: response.pmReportFormServer?.remarks || ''
          },
          // Map API response arrays to the format expected by Edit components
          serverHealthData: {
            serverHealthData: (() => {
              // First try to get data from pmReportFormServer.serverHealthData
              if (response.pmReportFormServer?.serverHealthData?.details) {
                // Check if pmReportFormServer data has IDs (it usually doesn't in the DTO)
                // So we need to match with pmServerHealths to get the actual IDs
                const serverHealthDetails = response.pmReportFormServer.serverHealthData.details;
                const pmServerHealthsDetails = (response.pmServerHealths || []).flatMap(item => item.details || []);
                
                return serverHealthDetails.map(item => {
                  // Try to find matching detail in pmServerHealths to get the ID
                  const matchingDetail = pmServerHealthsDetails.find(detail => 
                    detail.serverName === item.serverName && 
                    detail.resultStatusID === item.resultStatusID
                  );
                  
                  return {
                    id: matchingDetail?.id || null, // Use ID from pmServerHealths if found
                    serverName: item.serverName || '',
                    result: item.resultStatusID || '',
                    remarks: item.remarks || '',
                    isNew: !matchingDetail?.id, // Mark as new if no ID found
                    isModified: false // Track modifications
                  };
                });
              }
              // Fallback to pmServerHealths array (this has the IDs)
              return (response.pmServerHealths || []).flatMap(item => 
                (item.details || []).map(detail => ({
                  id: detail.id || null, // This should have the actual ID
                  serverName: detail.serverName || '',
                  result: detail.resultStatusID || '',
                  remarks: detail.remarks || '',
                  isNew: !detail.id, // Mark as new if no ID
                  isModified: false // Track modifications
                }))
              );
            })(),
            remarks: (() => {
              // Get remarks from pmReportFormServer.serverHealthData first
              if (response.pmReportFormServer?.serverHealthData?.remarks) {
                return response.pmReportFormServer.serverHealthData.remarks;
              }
              // Fallback to pmServerHealths array
              return response.pmServerHealths?.[0]?.remarks || '';
            })()
          },
          hardDriveHealthData: {
            hardDriveHealthData: (response.pmServerHardDriveHealths || []).flatMap(item => 
              (item.details || []).map(detail => ({
                id: detail.id || null, // Preserve ID for existing records
                serverName: detail.serverName || '',
                result: detail.resultStatusID || '',
                isNew: !detail.id, // Mark as new if no ID
                isModified: false // Track modifications
              }))
            ),
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
            // Legacy format for backward compatibility
            dateChecked: response.pmServerNetworkHealths?.[0]?.dateChecked || '',
            result: response.pmServerNetworkHealths?.[0]?.yesNoStatusID || '',
            remarks: response.pmServerNetworkHealths?.[0]?.remarks || ''
          },
          willowlynxProcessStatusData: {
            pmServerWillowlynxProcessStatuses: response.pmServerWillowlynxProcessStatuses || [],
            // Legacy format for backward compatibility
            result: response.pmServerWillowlynxProcessStatuses?.[0]?.yesNoStatusID || '',
            remarks: response.pmServerWillowlynxProcessStatuses?.[0]?.remarks || ''
          },
          willowlynxNetworkStatusData: {
            pmServerWillowlynxNetworkStatuses: response.pmServerWillowlynxNetworkStatuses || [],
            // Legacy format for backward compatibility
            dateChecked: response.pmServerWillowlynxNetworkStatuses?.[0]?.dateChecked || '',
            result: response.pmServerWillowlynxNetworkStatuses?.[0]?.yesNoStatusID || '',
            remarks: response.pmServerWillowlynxNetworkStatuses?.[0]?.remarks || ''
          },
          willowlynxRTUStatusData: {
            pmServerWillowlynxRTUStatuses: response.pmServerWillowlynxRTUStatuses || [],
            // Legacy format for backward compatibility
            dateChecked: response.pmServerWillowlynxRTUStatuses?.[0]?.dateChecked || '',
            result: response.pmServerWillowlynxRTUStatuses?.[0]?.yesNoStatusID || '',
            remarks: response.pmServerWillowlynxRTUStatuses?.[0]?.remarks || ''
          },
          willowlynxHistorialTrendData: {
            pmServerWillowlynxHistoricalTrends: response.pmServerWillowlynxHistoricalTrends || [],
            // Legacy format for backward compatibility
            dateChecked: response.pmServerWillowlynxHistoricalTrends?.[0]?.dateChecked || '',
            result: response.pmServerWillowlynxHistoricalTrends?.[0]?.yesNoStatusID || '',
            remarks: response.pmServerWillowlynxHistoricalTrends?.[0]?.remarks || ''
          },
          willowlynxHistoricalReportData: {
            pmServerWillowlynxHistoricalReports: response.pmServerWillowlynxHistoricalReports || [],
            // Legacy format for backward compatibility
            dateChecked: response.pmServerWillowlynxHistoricalReports?.[0]?.dateChecked || '',
            result: response.pmServerWillowlynxHistoricalReports?.[0]?.yesNoStatusID || '',
            remarks: response.pmServerWillowlynxHistoricalReports?.[0]?.remarks || ''
          },
          willowlynxSumpPitCCTVCameraData: {
            pmServerWillowlynxCCTVCameras: response.pmServerWillowlynxCCTVCameras || [],
            // Legacy format for backward compatibility
            dateChecked: response.pmServerWillowlynxCCTVCameras?.[0]?.dateChecked || '',
            result: response.pmServerWillowlynxCCTVCameras?.[0]?.yesNoStatusID || '',
            remarks: response.pmServerWillowlynxCCTVCameras?.[0]?.remarks || ''
          },
          monthlyDatabaseCreationData: {
            pmServerMonthlyDatabaseCreations: response.pmServerMonthlyDatabaseCreations || [],
            // Legacy format for backward compatibility
            monthlyDatabaseData: (response.pmServerMonthlyDatabaseCreations || []).flatMap(item => 
              (item.details || []).map(detail => ({
                id: detail.id || null,
                item: detail.serverName || '',
                monthlyDBCreated: detail.yesNoStatusID || '',
                isNew: !detail.id,
                isModified: false
              }))
            ),
            remarks: response.pmServerMonthlyDatabaseCreations?.[0]?.remarks || ''
          },
          databaseBackupData: {
            pmServerDatabaseBackups: response.pmServerDatabaseBackups || []
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
            pmServerFailOvers: response.pmServerFailOvers || []
          },
          asaFirewallData: {
            pmServerASAFirewalls: response.pmServerASAFirewalls || [],
            remarks: response.pmServerASAFirewalls?.[0]?.remarks || ''
          },
          softwarePatchData: {
            pmServerSoftwarePatchSummaries: response.pmServerSoftwarePatchSummaries || [],
            remarks: response.pmServerSoftwarePatchSummaries?.[0]?.remarks || ''
          }
        };

        //console.log('Mapped Server PM Data for Edit:', mappedServerPMData);
        setServerPMData(mappedServerPMData);

      } catch (error) {
        console.error('Error fetching report data:', error);
        setError('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [id]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Data change handlers - update the serverPMData state to persist changes
  const createDataChangeHandler = (dataKey) => (data) => {
    setServerPMData(prevData => ({
      ...prevData,
      [dataKey]: data
    }));
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
      // Prepare the complete form data to pass to review - Following CM and RTU PM pattern
      const reviewData = {
        // Basic form data
        reportTitle: formData.reportTitle,
        systemDescription: formData.systemDescription,
        systemNameWarehouseID: formData.systemNameWarehouseID,
        stationName: formData.stationName,
        stationNameWarehouseID: formData.stationNameWarehouseID,
        jobNo: formData.jobNo,
        projectNo: formData.projectNo,
        customer: formData.customer,
        reportFormTypeID: formData.reportFormTypeID,
        pmReportFormTypeID: formData.pmReportFormTypeID,
        pmReportFormTypeName: formData.pmReportFormTypeName,
        dateOfService: formData.dateOfService,
        remarks: formData.remarks,
        approvedBy: formData.approvedBy,
        attendedBy: formData.attendedBy,
        
        // All Server PM sub-component data
        signOffData: serverPMData.signOffData,
        serverHealthData: serverPMData.serverHealthData,
        hardDriveHealthData: serverPMData.hardDriveHealthData,
        diskUsageData: serverPMData.diskUsageData,
        cpuAndRamUsageData: serverPMData.cpuAndRamUsageData,
        networkHealthData: serverPMData.networkHealthData,
        willowlynxProcessStatusData: serverPMData.willowlynxProcessStatusData,
        willowlynxNetworkStatusData: serverPMData.willowlynxNetworkStatusData,
        willowlynxRTUStatusData: serverPMData.willowlynxRTUStatusData,
        willowlynxHistorialTrendData: serverPMData.willowlynxHistorialTrendData,
        willowlynxHistoricalReportData: serverPMData.willowlynxHistoricalReportData,
        willowlynxSumpPitCCTVCameraData: serverPMData.willowlynxSumpPitCCTVCameraData,
        monthlyDatabaseCreationData: serverPMData.monthlyDatabaseCreationData,
        databaseBackupData: serverPMData.databaseBackupData,
        timeSyncData: serverPMData.timeSyncData,
        hotFixesData: serverPMData.hotFixesData,
        autoFailOverData: serverPMData.autoFailOverData,
        asaFirewallData: serverPMData.asaFirewallData,
        softwarePatchData: serverPMData.softwarePatchData
      };
      
      // Navigate to review page with form data - Following CM and RTU PM pattern
      navigate(`/report-management-system/server-pm-report-review-edit/${id}`, {
        state: { formData: reviewData }
      });
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      handleStepNavigation(steps[currentIndex - 1]);
    } else {
      // Navigate back to report list
      navigate('/report-management-system/report-forms');
    }
  };



  // Component rendering
  const renderCurrentStep = () => {
    const componentMap = {
      signOff: ServerPMReportFormSignOff_Edit,
      serverHealth: ServerHealth_Edit,
      networkHealth: NetworkHealth_Edit,
      hardDriveHealth: HardDriveHealth_Edit,
      diskUsage: DiskUsage_Edit,
      cpuAndRamUsage: CPUAndRamUsage_Edit,
      willowlynxProcessStatus: WillowlynxProcessStatus_Edit,
      willowlynxNetworkStatus: WillowlynxNetworkStatus_Edit,
      willowlynxRTUStatus: WillowlynxRTUStatus_Edit,
      willowlynxHistorialTrend: WillowlynxHistorialTrend_Edit,
      willowlynxHistoricalReport: WillowlynxHistoricalReport_Edit,
      willowlynxSumpPitCCTVCamera: WillowlynxSumpPitCCTVCamera_Edit,
      monthlyDatabaseCreation: MonthlyDatabaseCreation_Edit,
      databaseBackup: DatabaseBackup_Edit,
      timeSync: TimeSync_Edit,
      hotFixes: HotFixes_Edit,
      autoFailOver: AutoFailOver_Edit,
      asaFirewall: ASAFirewall_Edit,
      softwarePatch: SoftwarePatch_Edit
    };

    const Component = componentMap[currentStep];
    if (!Component) return null;

    // Following reference pattern - use consistent dataKey mapping
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

    return (
      <Component
        data={serverPMData[dataKey] || {}}
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
              {formData.reportTitle || 'Edit Server Preventive Maintenance Report'}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Edit the form below with accurate maintenance information
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
                
                <Box sx={{ display: 'flex', gap: 2 }}>
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
                    {currentStep === 'softwarePatch' ? 'Complete →' : 'Next →'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default ServerPMReportForm_Edit;