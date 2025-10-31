import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import resultStatusService from '../../../api-services/resultStatusService';
import yesNoStatusService from '../../../api-services/yesNoStatusService';
import { getServerPMReportFormWithDetails } from '../../../api-services/reportFormService';

import ServerHealthImage from '../../resources/ServerPMReportForm/ServerHealth.png';
import HardDriveHealthImage from '../../resources/ServerPMReportForm/HardDriveHealth.png';
import CPUAndRamUsageImage from '../../resources/ServerPMReportForm/CPUAndRamUsage.png';
import WillowlynxProcessStatusImage from '../../resources/ServerPMReportForm/WillowlynxProcessStatus.png';
import WillowlynxNetworkStatusImage from '../../resources/ServerPMReportForm/WillowlynxNetworkStatus.png';
import WillowlynxRTUStatusImage from '../../resources/ServerPMReportForm/WillowlynxRTUStatus.png';
import WillowlynxHistoricalReportImage from '../../resources/ServerPMReportForm/WillowlynxHistoricalReport.png';
import WillowlynxSumpPitCCTVCameraImage from '../../resources/ServerPMReportForm/WillowlynxSumpPitCCTVCamera.png';

export const generateServerPMReportPDF = async (reportId, stepTitles) => {
  console.log('Starting PDF generation for report ID:', reportId);
  
  // Fetch all required data from APIs
  let formData = {};
  let serverPMData = {};
  let resultStatusOptions = [];
  let yesNoStatusOptions = [];
  
  try {
    // Fetch report data
    console.log('Fetching report data...');
    const response = await getServerPMReportFormWithDetails(reportId);
    console.log("!!!!! Server PM Report Form Data From API !!!!! ");
    console.log(response);
        
    // Merge reportForm and pmReportFormServer data
    formData = {
      ...response.pmReportFormServer,
      // Add reportForm fields that might be needed
      reportFormTypeID: response.reportForm?.reportFormTypeID,
      reportFormTypeName: response.reportForm?.reportFormTypeName,
      systemNameWarehouseID: response.reportForm?.systemNameWarehouseID,
      stationNameWarehouseID: response.reportForm?.stationNameWarehouseID,
      // Override with reportForm data where applicable
      jobNo: response.reportForm?.jobNo || response.pmReportFormServer?.jobNo,
      systemDescription: response.reportForm?.systemDescription || response.pmReportFormServer?.systemDescription,
      stationName: response.reportForm?.stationName || response.pmReportFormServer?.stationName,
      // Structure signoff data properly
      signOffData: {
        attendedBy: response.pmReportFormServer?.signOffData?.attendedBy || '',
        witnessedBy: response.pmReportFormServer?.signOffData?.witnessedBy || '',
        startDate: response.pmReportFormServer?.signOffData?.startDate || null,
        completionDate: response.pmReportFormServer?.signOffData?.completionDate || null,
        remarks: response.pmReportFormServer?.signOffData?.remarks || ''
      }
    };
    
    // Simple data mapping for PDF generation - matching ServerPMReportFormDetails pattern
    serverPMData = {
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
    
    console.log('Report data fetched successfully');
  } catch (error) {
    console.error('Error fetching report data:', error);
    throw new Error('Failed to fetch report data: ' + error.message);
  }
  
  try {
    // Fetch result status options for mapping IDs to names
    console.log('Fetching result status options...');
    const resultStatusResponse = await resultStatusService.getResultStatuses();
    resultStatusOptions = resultStatusResponse || [];
    console.log('Result status options fetched:', resultStatusOptions.length);
  } catch (error) {
    console.warn('Could not fetch result status options for PDF generation:', error);
  }
  
  try {
    // Fetch yes/no status options for mapping IDs to names
    console.log('Fetching yes/no status options...');
    const yesNoStatusResponse = await yesNoStatusService.getYesNoStatuses();
    yesNoStatusOptions = yesNoStatusResponse || [];
    console.log('Yes/No status options fetched:', yesNoStatusOptions.length);
  } catch (error) {
    console.warn('Could not fetch yes/no status options for PDF generation:', error);
  }

  // Helper function to get result status name by ID
  const getResultStatusName = (id) => {
    if (!id) return '';
    const status = resultStatusOptions.find(option => 
      option.id === id || option.ID === id || option.id === String(id) || option.ID === String(id)
    );
    return status ? (status.name || status.Name || id) : id;
  };
  
  // Helper function to get yes/no status name by ID
  const getYesNoStatusName = (id) => {
    if (!id) return '';
    const status = yesNoStatusOptions.find(option => 
      option.id === id || option.ID === id || option.id === String(id) || option.ID === String(id)
    );
    return status ? (status.name || status.Name || id) : id;
  };
  
  // Apply status name mapping to all data
  console.log('Applying status name mapping to data...');
  
  // Map server health data - following ServerHealth_Details component pattern
  if (serverPMData.serverHealthData && serverPMData.serverHealthData.length > 0) {
    serverPMData.serverHealthData = serverPMData.serverHealthData.map(item => ({
      ...item,
      details: item.details?.map(detail => ({
        ...detail,
        resultStatusName: detail.resultStatusName || getResultStatusName(detail.resultStatusID || detail.ResultStatusID)
      })) || []
    }));
  }
  
  // Map hard drive health data
  if (serverPMData.hardDriveHealthData && serverPMData.hardDriveHealthData.length > 0) {
    serverPMData.hardDriveHealthData = serverPMData.hardDriveHealthData.map(item => ({
      ...item,
      details: item.details?.map(detail => ({
        ...detail,
        resultStatusName: detail.resultStatusName || getResultStatusName(detail.resultStatusID || detail.ResultStatusID)
      })) || []
    }));
  }
  
  // Map disk usage health data
  if (serverPMData.diskUsageData && serverPMData.diskUsageData.length > 0) {
    serverPMData.diskUsageData = serverPMData.diskUsageData.map(item => ({
      ...item,
      details: item.details?.map(detail => ({
        ...detail,
        resultStatusName: detail.resultStatusName || getResultStatusName(detail.resultStatusID || detail.ResultStatusID)
      })) || []
    }));
  }
  
  // Map CPU and memory usage data
  if (serverPMData.cpuAndRamUsageData && serverPMData.cpuAndRamUsageData.length > 0) {
    serverPMData.cpuAndRamUsageData = serverPMData.cpuAndRamUsageData.map(item => ({
      ...item,
      details: item.details?.map(detail => ({
        ...detail,
        resultStatusName: detail.resultStatusName || getResultStatusName(detail.resultStatusID || detail.ResultStatusID)
      })) || []
    }));
  }
  
  
  // Map network health data (uses yesNoStatus)
  if (serverPMData.networkHealthData && serverPMData.networkHealthData.length > 0) {
    serverPMData.networkHealthData = serverPMData.networkHealthData.map(item => ({
      ...item,
      details: item.details?.map(detail => ({
        ...detail,
        resultStatusName: detail.resultStatusName || getYesNoStatusName(detail.yesNoStatusID || detail.YesNoStatusID)
      })) || []
    }));
  }
  
  // Map willowlynx process status data (uses yesNoStatus)
  if (serverPMData.willowlynxProcessStatusData && serverPMData.willowlynxProcessStatusData.length > 0) {
    serverPMData.willowlynxProcessStatusData = serverPMData.willowlynxProcessStatusData.map(item => ({
      ...item,
      details: item.details?.map(detail => ({
        ...detail,
        resultStatusName: detail.resultStatusName || getYesNoStatusName(detail.yesNoStatusID || detail.YesNoStatusID)
      })) || []
    }));
  }
  
  // Map willowlynx network status data (uses yesNoStatus)
  if (serverPMData.willowlynxNetworkStatusData && serverPMData.willowlynxNetworkStatusData.length > 0) {
    serverPMData.willowlynxNetworkStatusData = serverPMData.willowlynxNetworkStatusData.map(item => ({
      ...item,
      details: item.details?.map(detail => ({
        ...detail,
        resultStatusName: detail.resultStatusName || getYesNoStatusName(detail.yesNoStatusID || detail.YesNoStatusID)
      })) || []
    }));
  }
  
  // Map willowlynx RTU status data (uses yesNoStatus)
  if (serverPMData.willowlynxRTUStatusData && serverPMData.willowlynxRTUStatusData.length > 0) {
    serverPMData.willowlynxRTUStatusData = serverPMData.willowlynxRTUStatusData.map(item => ({
      ...item,
      details: item.details?.map(detail => ({
        ...detail,
        resultStatusName: detail.resultStatusName || getYesNoStatusName(detail.yesNoStatusID || detail.YesNoStatusID)
      })) || []
    }));
  }
  
  // Map willowlynx historical trend data (uses yesNoStatus)
  if (serverPMData.willowlynxHistorialTrendData && serverPMData.willowlynxHistorialTrendData.length > 0) {
    serverPMData.willowlynxHistorialTrendData = serverPMData.willowlynxHistorialTrendData.map(item => ({
      ...item,
      details: item.details?.map(detail => ({
        ...detail,
        resultStatusName: detail.resultStatusName || getYesNoStatusName(detail.yesNoStatusID || detail.YesNoStatusID)
      })) || []
    }));
  }
  
  // Map willowlynx historical report data (uses yesNoStatus)
  if (serverPMData.willowlynxHistoricalReportData && serverPMData.willowlynxHistoricalReportData.length > 0) {
    serverPMData.willowlynxHistoricalReportData = serverPMData.willowlynxHistoricalReportData.map(item => ({
      ...item,
      details: item.details?.map(detail => ({
        ...detail,
        resultStatusName: detail.resultStatusName || getYesNoStatusName(detail.yesNoStatusID || detail.YesNoStatusID)
      })) || []
    }));
  }
  
  // Map willowlynx CCTV camera data (uses yesNoStatus)
  if (serverPMData.willowlynxSumpPitCCTVCameraData && serverPMData.willowlynxSumpPitCCTVCameraData.length > 0) {
    serverPMData.willowlynxSumpPitCCTVCameraData = serverPMData.willowlynxSumpPitCCTVCameraData.map(item => ({
      ...item,
      details: item.details?.map(detail => ({
        ...detail,
        resultStatusName: detail.resultStatusName || getYesNoStatusName(detail.yesNoStatusID || detail.YesNoStatusID)
      })) || []
    }));
  }
  
  // Map monthly database creation data (uses yesNoStatus) - following MonthlyDatabaseCreation_Details pattern
  if (serverPMData.monthlyDatabaseCreationData && serverPMData.monthlyDatabaseCreationData.length > 0) {
    serverPMData.monthlyDatabaseCreationData = serverPMData.monthlyDatabaseCreationData.map(item => ({
      ...item,
      details: item.details?.map(detail => ({
        ...detail,
        monthlyDBCreatedStatusName: detail.monthlyDBCreatedStatusName || getYesNoStatusName(detail.yesNoStatusID || detail.YesNoStatusID)
      })) || []
    }));
  }
  
  // Map database backup data (uses yesNoStatus)
  if (serverPMData.databaseBackupData) {
    serverPMData.databaseBackupData = serverPMData.databaseBackupData.map(item => ({
      ...item,
      mssqlDatabaseBackupDetails: item.mssqlDatabaseBackupDetails?.map(detail => ({
        ...detail,
        monthlyDBBackupCreatedStatusName: detail.monthlyDBBackupCreatedStatusName || getYesNoStatusName(detail.yesNoStatusID || detail.YesNoStatusID)
      })) || [],
      scadaDataBackupDetails: item.scadaDataBackupDetails?.map(detail => ({
        ...detail,
        monthlyDBBackupCreatedStatusName: detail.monthlyDBBackupCreatedStatusName || getYesNoStatusName(detail.yesNoStatusID || detail.YesNoStatusID)
      })) || []
    }));
  }
  
  // Map auto fail over data (uses yesNoStatus)
  if (serverPMData.autoFailOverData) {
    serverPMData.autoFailOverData = serverPMData.autoFailOverData.map(item => ({
      ...item,
      resultStatusName: item.resultStatusName || getYesNoStatusName(item.yesNoStatusID || item.YesNoStatusID)
    }));
  }
  
  console.log('Status name mapping completed');
  
  // Initialize PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  console.log('PDF Generator Form Data:', formData);
  // Helper function to add header
  const addHeader = (pageNum, totalPages) => {
    // Top border line
    pdf.setLineWidth(0.5);
    pdf.line(margin, 15, pageWidth - margin, 15);
    
    // Document title and info
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Old Tunnel SCADA System Cable Tunnel', margin, 10);
    pdf.text(`${formData?.reportId || 'P1359-OCAT-SCADA-PM-WC'}`, pageWidth - margin, 10, { align: 'right' });
    
    pdf.text('Preventive Maintenance Check List', margin, 20);
    pdf.text('Rev 1.0', pageWidth - margin, 20, { align: 'right' });
    
    pdf.text('Pandan Equipment - Westcoast Scada System', margin, 25);
    pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, 25, { align: 'right' });
    
    // Bottom border line
    pdf.line(margin, 30, pageWidth - margin, 30);
  };
  
  // Helper function to add footer
  const addFooter = () => {
    const footerY = pageHeight - 20;
    pdf.setLineWidth(0.5);
    pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('WILLOWGLEN SERVICES PTE LTD', pageWidth / 2, footerY, { align: 'center' });
    pdf.text('Copyright©2023. All rights reserved.', pageWidth / 2, footerY + 5, { align: 'center' });
  };
  
  // Helper function to add table
  const addTable = (headers, rows, startY) => {
    const tableWidth = contentWidth;
    const colWidth = tableWidth / headers.length;
    const rowHeight = 8;
    let currentY = startY;
    
    // Table headers
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, currentY, tableWidth, rowHeight, 'F');
    pdf.setLineWidth(0.3);
    pdf.rect(margin, currentY, tableWidth, rowHeight);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    headers.forEach((header, index) => {
      const x = margin + (index * colWidth) + 2;
      pdf.text(header, x, currentY + 5);
      if (index > 0) {
        pdf.line(margin + (index * colWidth), currentY, margin + (index * colWidth), currentY + rowHeight);
      }
    });
    
    currentY += rowHeight;
    
    // Table rows
    pdf.setFont('helvetica', 'normal');
    rows.forEach((row, rowIndex) => {
      pdf.rect(margin, currentY, tableWidth, rowHeight);
      row.forEach((cell, colIndex) => {
        const x = margin + (colIndex * colWidth) + 2;
        pdf.text(String(cell || ''), x, currentY + 5);
        if (colIndex > 0) {
          pdf.line(margin + (colIndex * colWidth), currentY, margin + (colIndex * colWidth), currentY + rowHeight);
        }
      });
      currentY += rowHeight;
    });
    
    return currentY;
  };
  
  // Helper function to add image to PDF
  const addImageToPDF = async (imageSrc, x, y, width, height) => {
    try {
      // Convert image to base64 if it's not already
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          pdf.addImage(dataURL, 'PNG', x, y, width, height);
          resolve();
        };
        img.onerror = () => resolve(); // Continue even if image fails to load
        img.src = imageSrc;
      });
    } catch (error) {
      console.warn('Failed to add image:', error);
    }
  };

  // Define all sections with their data structure
  const sections = [
    {
      title: 'Sign Off',
      subsections: [
        {
          title: 'Sign Off',
          content: (data) => [''],
          signOff: true,
          dataKey: 'signOffData'
        }
      ]
    },
    {
      title: 'Equipment Check',
      subsections: [
        {
          title: '1.1 Server Health Check',
          content: (data) => [
            'Check Server Front Panel LED Number 2, as shown below. Check LED 2 in',
            'solid green, which indicates the server is healthy.',
            '',
            'Check if LED 2 is in solid green.'
          ],
          image: ServerHealthImage,
          table: (data) => ({
            headers: ['Server Name', 'Result'],
            rows: data?.serverHealthData?.length > 0 && data.serverHealthData[0]?.details?.length > 0 ? 
              data.serverHealthData[0].details.map(item => [
                item.serverName || '',
                item.resultStatusName || getResultStatusName(item.resultStatusID || item.result) || ''
              ]) : []
          }),
          remarks: (data) => data?.serverHealthData?.length > 0 ? data.serverHealthData[0]?.remarks || '' : '',
          dataKey: 'serverHealthData'
        },
        {
          title: '1.2 Hard Drive Health Check',
          content: (data) => [
            'Check Hard Drive Health Status LED, LED in solid/blinking green, which indicates healthy.',
            '',
            'Check if the LED is in solid/blinking green'
          ],
          image: HardDriveHealthImage,
          table: (data) => ({
            headers: ['Server Name', 'Hard Drive Name', 'Status'],
            rows: data?.hardDriveHealthData?.length > 0 && data.hardDriveHealthData[0]?.details?.length > 0 ? 
              data.hardDriveHealthData[0].details.map(item => [
                item.serverName || 'N/A',
                item.hardDriveName || item.serverName || 'N/A',
                item.resultStatusName || 'N/A'
              ]) : []
          }),
          remarks: (data) => data?.hardDriveHealthData?.length > 0 ? data.hardDriveHealthData[0]?.remarks || '' : '',
          dataKey: 'hardDriveHealthData'
        },
        {
          title: '1.3 Disk Usage Check',
          content: (data) => [
            'Using Computer Management',
            '',
            '• From Control Panel→Administration Tools→Computer Management.',
            '• click on the Storage→Disk Management. check the Status for all the hard disk',
            '• Remove old windows event logs to meet the target disk usage limit.',
            '',
            '* Note:',
            'The HDSRS servers with SQL Server Database keep the historical data and daily/weekly/monthly backups. The disk space usage can be up to 90%, which is considered as normal.'
          ],
          table: (data) => ({
            headers: ['Server Name', 'Drive', 'Total Space', 'Used Space', 'Free Space', 'Usage %'],
            rows: data?.diskUsageData?.length > 0 && data.diskUsageData[0]?.details?.length > 0 ? 
              data.diskUsageData[0].details.map(item => [
                item.serverName || 'N/A',
                item.drive || 'N/A',
                item.totalSpace || 'N/A',
                item.usedSpace || 'N/A',
                item.freeSpace || 'N/A',
                item.usagePercentage || 'N/A'
              ]) : []
          }),
          remarks: (data) => data?.diskUsageData?.length > 0 ? data.diskUsageData[0]?.remarks || '' : '',
          dataKey: 'diskUsageData'
        },
        {
          title: '1.4 CPU and RAM Usage Check',
          content: (data) => [
            'Using Task Manager, and go to Performance Tab',
            '',
            '○ Right click on the task bar and select task manager'
          ],
          image: CPUAndRamUsageImage,
          table: (data) => ({
            headers: ['Server Name', 'CPU Usage %', 'RAM Usage %', 'Status'],
            rows: data?.cpuAndRamUsageData?.length > 0 && data.cpuAndRamUsageData[0]?.details?.length > 0 ? 
              data.cpuAndRamUsageData[0].details.map(item => [
                item.serverName || 'N/A',
                item.cpuUsage || 'N/A',
                item.ramUsage || 'N/A',
                item.resultStatusName || 'N/A'
              ]) : []
          }),
          remarks: (data) => data?.cpuAndRamUsageData?.length > 0 ? data.cpuAndRamUsageData[0]?.remarks || '' : '',
          dataKey: 'cpuAndRamUsageData'
        },
        {
          title: '1.5 Network Health Check',
          content: (data) => [
            'Ring Network Check.',
            '',
            'Procedure:',
            '  Observe the ring and ring master LED on the network switch',
            '',
            'Result:',
            '  Ring and ring master LED should be green (stable).',
            '',
            'If the answer is \'No\', please use topology viewer (Oring software), check if any',
            'switch in the ring has connectivity problem.'
          ],
          table: (data) => ({
            headers: ['Interface', 'Status', 'Speed', 'Duplex', 'IP Address'],
            rows: data?.networkHealthData?.length > 0 && data.networkHealthData[0]?.details?.length > 0 ? 
              data.networkHealthData[0].details.map(item => [
                item.interface || item.serverName || '',
                item.resultStatusName || item.status || '',
                item.speed || '',
                item.duplex || '',
                item.ipAddress || ''
              ]) : []
          }),
          remarks: (data) => data?.networkHealthData?.length > 0 ? data.networkHealthData[0]?.remarks || '' : '',
          dataKey: 'networkHealthData'
        }
      ]
    },
    {
      title: 'Willowlynx System Checks',
      subsections: [
        {
          title: '1.6 Willowlynx Process Status Check',
          content: (data) => [
            'Process Status',
            '',
            'Login into Willowlynx and navigate to "Server Status" page, as below:',
            '',
            'Result:',
            'All Process is online, either ACTIVE or STANDBY.'
          ],
          image: WillowlynxProcessStatusImage,
          table: (data) => ({
            headers: ['Process Name', 'Status', 'PID', 'CPU Usage', 'Memory Usage'],
            rows: data?.willowlynxProcessStatusData?.length > 0 && data.willowlynxProcessStatusData[0]?.details?.length > 0 ? 
              data.willowlynxProcessStatusData[0].details.map(item => [
                item.processName || item.serverName || '',
                item.resultStatusName || item.status || '',
                item.pid || '',
                item.cpuUsage || '',
                item.memoryUsage || ''
              ]) : []
          }),
          remarks: (data) => data?.willowlynxProcessStatusData?.length > 0 ? data.willowlynxProcessStatusData[0]?.remarks || '' : '',
          dataKey: 'willowlynxProcessStatusData'
        },
        {
          title: '1.7 Willowlynx Network Status Check',
          content: (data) => [
            'Check network connectivity for Willowlynx components.',
            'Verify communication between system components.',
            'Monitor network response times and connectivity.'
          ],
          image: WillowlynxNetworkStatusImage,
          table: (data) => ({
            headers: ['Component', 'IP Address', 'Port', 'Status', 'Response Time'],
            rows: data?.willowlynxNetworkStatusData?.length > 0 && data.willowlynxNetworkStatusData[0]?.details?.length > 0 ? 
              data.willowlynxNetworkStatusData[0].details.map(item => [
                item.component || item.serverName || '',
                item.ipAddress || '',
                item.port || '',
                item.resultStatusName || item.status || '',
                item.responseTime || ''
              ]) : []
          }),
          remarks: (data) => data?.willowlynxNetworkStatusData?.length > 0 ? data.willowlynxNetworkStatusData[0]?.remarks || '' : '',
          dataKey: 'willowlynxNetworkStatusData'
        },
        {
          title: '1.8 Willowlynx RTU Status Check',
          content: (data) => [
            'Monitor RTU communication and status.',
            'Check remote terminal unit connectivity.',
            'Verify data collection from field devices.'
          ],
          image: WillowlynxRTUStatusImage,
          table: (data) => ({
            headers: ['RTU ID', 'Location', 'Status', 'Last Communication', 'Signal Strength'],
            rows: data?.willowlynxRTUStatusData?.length > 0 && data.willowlynxRTUStatusData[0]?.details?.length > 0 ? 
              data.willowlynxRTUStatusData[0].details.map(item => [
                item.rtuId || item.serverName || '',
                item.location || '',
                item.resultStatusName || item.status || '',
                item.lastCommunication || '',
                item.signalStrength || ''
              ]) : []
          }),
          remarks: (data) => data?.willowlynxRTUStatusData?.length > 0 ? data.willowlynxRTUStatusData[0]?.remarks || '' : '',
          dataKey: 'willowlynxRTUStatusData'
        },
        {
          title: '1.9 Willowlynx Historical Trend Check',
          content: (data) => [
            'Verify historical data trending functionality.',
            'Check data archival and retrieval systems.',
            'Monitor trend data accuracy and completeness.'
          ],
          table: (data) => ({
            headers: ['Trend Name', 'Data Points', 'Last Update', 'Status', 'Accuracy'],
            rows: data?.willowlynxHistorialTrendData?.length > 0 && data.willowlynxHistorialTrendData[0]?.details?.length > 0 ? 
              data.willowlynxHistorialTrendData[0].details.map(item => [
                item.trendName || item.serverName || '',
                item.dataPoints || '',
                item.lastUpdate || '',
                item.resultStatusName || item.status || '',
                item.accuracy || ''
              ]) : []
          }),
          remarks: (data) => data?.willowlynxHistorialTrendData?.length > 0 ? data.willowlynxHistorialTrendData[0]?.remarks || '' : '',
          dataKey: 'willowlynxHistorialTrendData'
        },
        {
          title: '1.10 Willowlynx Historical Report Check',
          content: (data) => [
            'Verify historical reporting functionality.',
            'Check report generation and data accuracy.',
            'Monitor automated report scheduling.'
          ],
          image: WillowlynxHistoricalReportImage,
          table: (data) => ({
            headers: ['Report Type', 'Last Generated', 'Status', 'Records', 'Format'],
            rows: data?.willowlynxHistoricalReportData?.length > 0 && data.willowlynxHistoricalReportData[0]?.details?.length > 0 ? 
              data.willowlynxHistoricalReportData[0].details.map(item => [
                item.reportType || item.serverName || '',
                item.lastGenerated || '',
                item.resultStatusName || item.status || '',
                item.records || '',
                item.format || ''
              ]) : []
          }),
          remarks: (data) => data?.willowlynxHistoricalReportData?.length > 0 ? data.willowlynxHistoricalReportData[0]?.remarks || '' : '',
          dataKey: 'willowlynxHistoricalReportData'
        },
        {
          title: '1.11 Willowlynx Sump Pit CCTV Camera Check',
          content: (data) => [
            'Verify CCTV camera functionality and connectivity.',
            'Check video feed quality and recording.',
            'Monitor camera positioning and visibility.'
          ],
          image: WillowlynxSumpPitCCTVCameraImage,
          table: (data) => ({
            headers: ['Camera ID', 'Location', 'Status', 'Video Quality', 'Recording'],
            rows: data?.willowlynxSumpPitCCTVCameraData?.length > 0 && data.willowlynxSumpPitCCTVCameraData[0]?.details?.length > 0 ? 
              data.willowlynxSumpPitCCTVCameraData[0].details.map(item => [
                item.cameraId || item.serverName || '',
                item.location || '',
                item.resultStatusName || item.status || '',
                item.videoQuality || '',
                item.recording || ''
              ]) : []
          }),
          remarks: (data) => data?.willowlynxSumpPitCCTVCameraData?.length > 0 ? data.willowlynxSumpPitCCTVCameraData[0]?.remarks || '' : '',
          dataKey: 'willowlynxSumpPitCCTVCameraData'
        }
      ]
    },
    {
      title: 'Database and System Maintenance',
      subsections: [
        {
          title: '1.12 Monthly Database Creation Check',
          content: (data) => [
            'Historical Database',
            '',
            'Monthly Database Creation',
            '',
            'Willowlynx\'s historical DB uses monthly database. Check the MSSQL database and make sure',
            'the monthly databases are created for the next 6 months.'
          ],
          table: (data) => ({
            headers: ['S/N', 'Server Name', 'Monthly DB are Created'],
            rows: data?.monthlyDatabaseCreationData?.length > 0 && data.monthlyDatabaseCreationData[0]?.details?.length > 0 ? 
              data.monthlyDatabaseCreationData[0].details.map((item, index) => [
                item.serialNo || (index + 1),
                item.serverName || '',
                item.monthlyDBCreatedStatusName || getYesNoStatusName(item.yesNoStatusID) || ''
              ]) : []
          }),
          remarks: (data) => data?.monthlyDatabaseCreationData?.length > 0 ? data.monthlyDatabaseCreationData[0]?.remarks || '' : '',
          dataKey: 'monthlyDatabaseCreationData'
        },
        {
          title: '1.13 Database Backup Check',
          content: (data) => [
            'Check D:\\MSSQLSERVER-BACKUP\\Monthly make sure the database is backup in this directory.',
            'Verify database backup procedures.',
            'Check backup integrity and completeness.',
            'Monitor backup scheduling and retention.'
          ],
          table: (data) => ({
            headers: ['Backup Type', 'Last Backup', 'Size', 'Status', 'Location'],
            rows: data?.databaseBackupData?.length > 0 && data.databaseBackupData[0]?.details?.length > 0 ? 
              data.databaseBackupData[0].details.map(item => [
                item.backupType || item.serverName || '',
                item.lastBackup || '',
                item.size || '',
                item.resultStatusName || item.status || '',
                item.location || ''
              ]) : []
          }),
          remarks: (data) => data?.databaseBackupData?.length > 0 ? data.databaseBackupData[0]?.remarks || '' : '',
          dataKey: 'databaseBackupData'
        },
        {
          title: '1.14 SCADA & Historical Time Sync Check',
          content: (data) => [
            'Verify time synchronization between systems.',
            'Check NTP server connectivity and accuracy.',
            'Monitor time drift and synchronization status.'
          ],
          table: (data) => ({
            headers: ['System', 'Time Source', 'Sync Status', 'Drift', 'Last Sync'],
            rows: data?.timeSyncData?.length > 0 && data.timeSyncData[0]?.details?.length > 0 ? 
              data.timeSyncData[0].details.map(item => [
                item.system || item.serverName || '',
                item.timeSource || '',
                item.resultStatusName || item.syncStatus || '',
                item.drift || '',
                item.lastSync || ''
              ]) : []
          }),
          remarks: (data) => data?.timeSyncData?.length > 0 ? data.timeSyncData[0]?.remarks || '' : '',
          dataKey: 'timeSyncData'
        }
      ]
    },
    {
      title: 'System Updates and Maintenance',
      subsections: [
        {
          title: '1.15 Hotfixes / Service Packs',
          content: (data) => [
            'Review and apply necessary system hotfixes.',
            'Check for critical security updates.',
            'Monitor system stability after updates.'
          ],
          table: (data) => ({
            headers: ['Update ID', 'Description', 'Install Date', 'Status', 'Requires Reboot'],
            rows: data?.hotFixesData?.length > 0 && data.hotFixesData[0]?.details?.length > 0 ? 
              data.hotFixesData[0].details.map(item => [
                item.updateId || item.serverName || '',
                item.description || '',
                item.installDate || '',
                item.resultStatusName || item.status || '',
                item.requiresReboot || ''
              ]) : []
          }),
          remarks: (data) => data?.hotFixesData?.length > 0 ? data.hotFixesData[0]?.remarks || '' : '',
          dataKey: 'hotFixesData'
        },
        {
          title: '1.16 Software Patch Summary',
          content: (data) => [
            'Review applied software patches and updates.',
            'Check application version compatibility.',
            'Monitor system performance after patches.'
          ],
          table: (data) => ({
            headers: ['Software', 'Version', 'Patch Level', 'Install Date', 'Status'],
            rows: data?.softwarePatchData?.length > 0 && data.softwarePatchData[0]?.details?.length > 0 ? 
              data.softwarePatchData[0].details.map(item => [
                item.software || item.serverName || '',
                item.version || '',
                item.patchLevel || '',
                item.installDate || '',
                item.resultStatusName || item.status || ''
              ]) : []
          }),
          remarks: (data) => data?.softwarePatchData?.length > 0 ? data.softwarePatchData[0]?.remarks || '' : '',
          dataKey: 'softwarePatchData'
        }
      ]
    },
    {
      title: 'System Reliability Tests',
      subsections: [
        {
          title: '1.17 Auto Failover of SCADA Server',
          content: (data) => [
            'Test automatic failover functionality between SCADA servers.',
            'Verify seamless transition and data continuity.',
            '',
            'Failover from SCA-SR1 to SCA-SR2:',
            'Note: Make sure both SCADA servers are online after completing the test.',
            '',
            'Procedures:',
            '1. Perform a system shutdown on SCA-SR1',
            '2. Check the System Server status page.',
            '',
            'Expected Result:'
          ],
          table: (data) => ({
            headers: ['Test Scenario', 'Expected Result', 'Actual Result', 'Status'],
            rows: data?.autoFailOverData?.length > 0 && data.autoFailOverData[0]?.details?.length > 0 ? 
              data.autoFailOverData[0].details.map(item => [
                item.testScenario || item.serverName || '',
                item.expectedResult || '',
                item.actualResult || '',
                item.resultStatusName || item.status || ''
              ]) : []
          }),
          remarks: (data) => data?.autoFailOverData?.length > 0 ? data.autoFailOverData[0]?.remarks || '' : '',
          dataKey: 'autoFailOverData'
        },
        {
          title: '1.18 ASA Firewall Maintenance',
          content: (data) => [
            'To check for ASA firewall health and backup of running configuration',
            '',
            'Procedure:',
            '1. Connect to ASDM application from SCADA server',
            '2. Access to ASA firewall CLI and input commands below'
          ],
          table: (data) => ({
            headers: ['S/N', 'Command Input', 'Expected Result', 'Result Status'],
            rows: data?.asaFirewallData?.length > 0 && data.asaFirewallData[0]?.details?.length > 0 ? 
              data.asaFirewallData[0].details.map((item, index) => [
                item.serialNumber || (index + 1).toString(),
                item.commandInput || item.checkItem || '',
                item.expectedResult || '',
                item.resultStatusName || item.status || 'N/A'
              ]) : []
          }),
          remarks: (data) => data?.asaFirewallData?.length > 0 ? data.asaFirewallData[0]?.remarks || '' : '',
          dataKey: 'asaFirewallData'
        }
      ]
    }
  ];
  
  let pageNumber = 1;
  const totalPages = sections.reduce((total, section) => total + section.subsections.length, 0) + 2; // +2 for title page and table of contents
  
  // Title page
  addHeader(pageNumber, totalPages);
  
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Server PM Report', pageWidth / 2, 60, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Report ID: ${formData?.reportId || ''}`, pageWidth / 2, 80, { align: 'center' });
  pdf.text(`Customer: ${formData?.customer || ''}`, pageWidth / 2, 95, { align: 'center' });
  pdf.text(`Project No: ${formData?.projectNo || ''}`, pageWidth / 2, 110, { align: 'center' });
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 125, { align: 'center' });
  
  addFooter();
  pageNumber++;
  
  // Table of Contents
  pdf.addPage();
  addHeader(pageNumber, totalPages);
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TABLE OF CONTENTS', pageWidth / 2, 50, { align: 'center' });
  
  let tocY = 70;
  let sectionNumber = 1;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  for (const section of sections) {
    for (const subsection of section.subsections) {
      const pageRef = pageNumber + 1;
      const title = subsection.title;
      
      // Add dots between title and page number
      const titleWidth = pdf.getTextWidth(title);
      const pageNumWidth = pdf.getTextWidth(pageRef.toString());
      const dotsWidth = contentWidth - titleWidth - pageNumWidth - 10;
      const numDots = Math.floor(dotsWidth / pdf.getTextWidth('.'));
      const dots = '.'.repeat(Math.max(0, numDots));
      
      pdf.text(title, margin, tocY);
      pdf.text(dots, margin + titleWidth + 5, tocY);
      pdf.text(pageRef.toString(), pageWidth - margin, tocY, { align: 'right' });
      
      tocY += 8;
      pageNumber++;
    }
  }
  
  addFooter();
  pageNumber = 3; // Reset to start content pages
  
  // Generate content pages
  for (const section of sections) {
    for (const subsection of section.subsections) {
      pdf.addPage();
      addHeader(pageNumber, totalPages);
      
      let currentY = 45;
      
      // Section title
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(subsection.title, margin, currentY);
      currentY += 15;
      
      // Content
      if (subsection.signOff) {
        // Sign off page
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        const signOffData = formData?.signOffData || {};
        const signOffFields = [
          { label: 'ATTENDED BY (WILLOWGLEN)', value: signOffData.attendedBy || '', signature: true },
          { label: 'WITNESSED BY (CUSTOMER)', value: signOffData.witnessedBy || '', signature: true },
          { label: 'START DATE/TIME', value: signOffData.startDate ? new Date(signOffData.startDate).toLocaleDateString() : '' },
          { label: 'COMPLETION DATE/TIME', value: signOffData.completionDate ? new Date(signOffData.completionDate).toLocaleDateString() : '' }
        ];
        
        signOffFields.forEach((field, index) => {
          const fieldY = currentY + (index * 35);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${field.label}:`, margin, fieldY);
          
          if (field.signature) {
            pdf.setFont('helvetica', 'normal');
            pdf.text('(NAME & SIGNATURE)', margin, fieldY + 8);
            pdf.line(margin + 80, fieldY + 15, pageWidth - margin, fieldY + 15);
            if (field.value) {
              pdf.text(field.value, margin + 80, fieldY + 12);
            }
          } else {
            pdf.line(margin + 80, fieldY + 5, pageWidth - margin, fieldY + 5);
            if (field.value) {
              pdf.text(field.value, margin + 80, fieldY + 2);
            }
          }
        });
        
        // Additional Notes section
        currentY += 160;
        pdf.setFont('helvetica', 'bold');
        pdf.text('ADDITIONAL NOTES:', margin, currentY);
        currentY += 10;
        
        const remarksHeight = 40;
        pdf.setLineWidth(0.3);
        pdf.rect(margin, currentY, contentWidth, remarksHeight);
        
        if (signOffData.remarks) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          const remarksLines = pdf.splitTextToSize(signOffData.remarks, contentWidth - 4);
          let remarksY = currentY + 8;
          remarksLines.forEach(line => {
            if (remarksY < currentY + remarksHeight - 5) {
              pdf.text(line, margin + 2, remarksY);
              remarksY += 6;
            }
          });
        }
      } else {
        // Regular content
        const contentLines = subsection.content(serverPMData);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        contentLines.forEach(line => {
          if (line.trim() === '') {
            currentY += 6;
          } else {
            const splitLines = pdf.splitTextToSize(line, contentWidth);
            splitLines.forEach(splitLine => {
              pdf.text(splitLine, margin, currentY);
              currentY += 6;
            });
          }
        });
        
        currentY += 10;
        
        // Add image if available
        if (subsection.image) {
          try {
            const imageWidth = Math.min(contentWidth * 0.8, 120);
            const imageHeight = 80;
            await addImageToPDF(subsection.image, margin + (contentWidth - imageWidth) / 2, currentY, imageWidth, imageHeight);
            currentY += imageHeight + 15;
          } catch (error) {
            console.warn('Failed to add image for section:', subsection.title, error);
            currentY += 10;
          }
        }
        
        // Table
        if (subsection.table) {
          const tableData = subsection.table(serverPMData);
          currentY = addTable(tableData.headers, tableData.rows, currentY);
          currentY += 15;
        }
        
        // Remarks section
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Remarks:', margin, currentY);
        currentY += 10;
        
        // Remarks box
        const remarksHeight = 30;
        pdf.setLineWidth(0.3);
        pdf.rect(margin, currentY, contentWidth, remarksHeight);
        
        // Add remarks content if available
        if (subsection.remarks) {
          const remarksText = subsection.remarks(serverPMData);
          if (remarksText && remarksText.trim()) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const remarksLines = pdf.splitTextToSize(remarksText, contentWidth - 4);
            let remarksY = currentY + 8;
            remarksLines.forEach(line => {
              if (remarksY < currentY + remarksHeight - 5) {
                pdf.text(line, margin + 2, remarksY);
                remarksY += 6;
              }
            });
          }
        }
      }
      
      addFooter();
      pageNumber++;
    }
  }
  
  // Save the PDF
  const fileName = `Server_PM_Report_${formData?.reportId || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

export const printComponentToPDF = async (componentRef, title) => {
  // Keep the existing implementation for single component printing
  if (!componentRef.current) return;
  
  try {
    const canvas = await html2canvas(componentRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    
    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, 25);
    
    // Add the image
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', margin, 35, imgWidth, Math.min(imgHeight, pageHeight - 40));
    
    pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};