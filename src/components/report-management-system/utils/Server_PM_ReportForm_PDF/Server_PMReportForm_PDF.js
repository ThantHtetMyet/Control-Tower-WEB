import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getServerPMReportFormWithDetails } from '../../../api-services/reportFormService';
import resultStatusService from '../../../api-services/resultStatusService';
import yesNoStatusService from '../../../api-services/yesNoStatusService';

/**
 * Generates a comprehensive Server PM Report PDF with proper formatting, images, and instructions
 * @param {string} reportId - The ID of the report to generate PDF for
 * @returns {Promise<void>}
 */
export const generateServerPMReportPDF = async (reportId) => {
  try {
    // Fetch report data
    const serverPMData = await fetchServerPMData(reportId);
    if (!serverPMData) {
      throw new Error('Failed to fetch report data');
    }

    // Build status lookup maps
    const { resultStatusMap, yesNoStatusMap } = await buildStatusLookups();

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    let yPosition = margin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredHeight) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to draw header
    const drawHeader = () => {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Server PM Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Job No: ${serverPMData.jobNo || 'N/A'}`, margin, yPosition);
      pdf.text(`Date: ${formatDate(new Date())}`, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 15;
    };

    // Helper function to draw section header
    const drawSectionHeader = (title) => {
      checkPageBreak(15);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin, yPosition);
      yPosition += 10;
    };

    // Helper function to draw label-value line
    const drawLabelValueLine = (label, value, indent = 0) => {
      checkPageBreak(8);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${label}: ${value || 'N/A'}`, margin + indent, yPosition);
      yPosition += 6;
    };

    // Helper function to draw instructions box
    const drawInstructionsBox = (instructions) => {
      if (!instructions) return;
      
      const boxHeight = 30;
      checkPageBreak(boxHeight + 10);
      
      // Draw box
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, yPosition - 5, contentWidth, boxHeight, 'F');
      pdf.setDrawColor(224, 224, 224);
      pdf.rect(margin, yPosition - 5, contentWidth, boxHeight);
      
      // Add instructions text
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Instructions:', margin + 5, yPosition + 5);
      
      pdf.setFont('helvetica', 'normal');
      const instructionLines = pdf.splitTextToSize(instructions, contentWidth - 20);
      pdf.text(instructionLines, margin + 5, yPosition + 15);
      
      yPosition += boxHeight + 10;
    };

    // Helper function to draw remarks box
    const drawRemarksBox = (remarks) => {
      if (!remarks) return;
      
      const remarksLines = pdf.splitTextToSize(remarks, contentWidth - 20);
      const boxHeight = Math.max(25, remarksLines.length * 6 + 15);
      checkPageBreak(boxHeight + 10);
      
      // Draw box
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, yPosition - 5, contentWidth, boxHeight, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(margin, yPosition - 5, contentWidth, boxHeight);
      
      // Add remarks text
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Remarks:', margin + 5, yPosition + 5);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(remarksLines, margin + 5, yPosition + 15);
      
      yPosition += boxHeight + 10;
    };

    // Helper function to draw table
    const drawTable = (headers, rows, maxRowsPerPage = 15) => {
      if (!rows || rows.length === 0) {
        drawLabelValueLine('No data available', '', 5);
        return;
      }

      const colWidth = contentWidth / headers.length;
      const rowHeight = 8;
      const headerHeight = 10;

      // Draw table header
      checkPageBreak(headerHeight + 5);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      
      // Header background
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, yPosition - 2, contentWidth, headerHeight, 'F');
      
      // Header border
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(margin, yPosition - 2, contentWidth, headerHeight);
      
      // Header text
      headers.forEach((header, i) => {
        const xPos = margin + (i * colWidth) + 2;
        pdf.text(header, xPos, yPosition + 5);
        
        // Vertical lines
        if (i > 0) {
          pdf.line(margin + (i * colWidth), yPosition - 2, margin + (i * colWidth), yPosition + headerHeight - 2);
        }
      });
      
      yPosition += headerHeight + 2;

      // Draw table rows
      const itemsToShow = rows.slice(0, maxRowsPerPage);
      pdf.setFont('helvetica', 'normal');
      
      itemsToShow.forEach((row, rowIndex) => {
        checkPageBreak(rowHeight + 2);
        
        // Row background (alternating)
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(margin, yPosition - 1, contentWidth, rowHeight, 'F');
        }
        
        // Row border
        pdf.setDrawColor(230, 230, 230);
        pdf.rect(margin, yPosition - 1, contentWidth, rowHeight);
        
        // Row data
        Object.values(row).forEach((value, i) => {
          if (i < headers.length) {
            const xPos = margin + (i * colWidth) + 2;
            let displayValue = String(value || 'N/A');
            
            // Truncate long text
            if (displayValue.length > 15) {
              displayValue = displayValue.substring(0, 12) + '...';
            }
            
            pdf.text(displayValue, xPos, yPosition + 5);
            
            // Vertical lines
            if (i > 0) {
              pdf.line(margin + (i * colWidth), yPosition - 1, margin + (i * colWidth), yPosition + rowHeight - 1);
            }
          }
        });
        
        yPosition += rowHeight;
      });

      if (rows.length > maxRowsPerPage) {
        yPosition += 5;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`... and ${rows.length - maxRowsPerPage} more items (truncated for PDF)`, margin, yPosition);
        yPosition += 8;
      }
      
      yPosition += 10;
    };

    // Helper function to draw signature line matching the screenshot format
    const drawSignatureLine = (mainLabel, subLabel) => {
      checkPageBreak(25);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Draw main label (e.g., "ATTENDED BY")
      pdf.text(mainLabel, margin, yPosition);
      yPosition += 12;
      
      // Draw sub label (e.g., "(WILLOWGLEN)") with colon and signature line
      const colonX = margin + 100; // Position for the colon
      const lineStartX = colonX + 10; // Start of signature line
      const lineEndX = pageWidth - margin; // End of signature line
      
      pdf.text(subLabel, margin, yPosition);
      pdf.text(':', colonX, yPosition);
      
      // Draw signature line
      pdf.line(lineStartX, yPosition + 2, lineEndX, yPosition + 2);
      
      // Add "(NAME & SIGNATURE)" text above the line
      pdf.setFontSize(8);
      pdf.text('(NAME & SIGNATURE)', lineStartX + 200, yPosition - 3);
      pdf.setFontSize(10);
      
      yPosition += 25;
    };

    // Start generating PDF - Sign Off Page First
    drawHeader();
    
    const signOffData = serverPMData.signOffData || {};
    
    // Add some spacing from header
    yPosition += 30;
    
    // Calculate total space needed for the sign-off page
    const signatureLineHeight = 35;
    const dateFieldHeight = 25;
    const spacingBetweenSections = 25;
    const spacingBeforeDates = 30;
    const remarksHeight = signOffData.remarks ? Math.max(40, pdf.splitTextToSize(signOffData.remarks, contentWidth - 20).length * 6 + 25) : 0;
    
    const totalRequiredHeight = (signatureLineHeight * 2) + spacingBetweenSections + spacingBeforeDates + (dateFieldHeight * 2) + 15 + remarksHeight + 30;
    
    // Check if we need to adjust starting position to fit everything on one page
    if (yPosition + totalRequiredHeight > pageHeight - margin) {
      // Start lower or add page if needed
      if (totalRequiredHeight > pageHeight - margin - 80) {
        // Content too large, but still try to fit as much as possible
        yPosition = 80; // Start higher on page
      }
    }
    
    // Draw signature lines with proper spacing to match screenshot
    drawSignatureLine('ATTENDED BY', '(WILLOWGLEN)');
    yPosition += spacingBetweenSections; // Spacing between signature sections
    drawSignatureLine('WITNESSED BY', '(CUSTOMER)');
    
    yPosition += spacingBeforeDates; // Spacing before date fields
    
    // Draw date fields with proper alignment
    const drawDateField = (label) => {
      // Don't check page break here to keep everything together
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const colonX = margin + 140; // Position for the colon
      const lineStartX = colonX + 15; // Start of date line
      const lineEndX = pageWidth - margin - 20; // End of date line
      
      pdf.text(label, margin, yPosition);
      pdf.text(':', colonX, yPosition);
      
      // Draw date line with better styling
      pdf.setLineWidth(0.5);
      pdf.line(lineStartX, yPosition + 2, lineEndX, yPosition + 2);
      pdf.setLineWidth(0.2); // Reset line width
      
      yPosition += dateFieldHeight;
    };
    
    drawDateField('START DATE/TIME');
    yPosition += 15; // Spacing between date fields
    drawDateField('COMPLETION DATE/TIME');
    
    if (signOffData.remarks) {
      yPosition += 25; // Reduced spacing before remarks to keep on same page
      drawRemarksBox(signOffData.remarks);
    }

    // Basic Information Page (Second Page)
    pdf.addPage();
    yPosition = margin;
    drawHeader();
    drawSectionHeader('Basic Information');
    drawLabelValueLine('System Description', serverPMData.systemDescription);
    drawLabelValueLine('Station Name', serverPMData.stationName);
    drawLabelValueLine('Customer', serverPMData.customer);
    drawLabelValueLine('Project No', serverPMData.projectNo);
    yPosition += 10;

    // Define sections with their instructions and image indicators
    const sections = [
      {
        title: 'Server Health Check',
        instructions: 'Check server health status using system monitoring tools. Verify all critical services are running properly.',
        hasImage: true
      },
      {
        title: 'Hard Drive Health Check', 
        instructions: 'Monitor hard drive health using SMART data and disk management tools. Check for any failing drives.',
        hasImage: true
      },
      {
        title: 'Disk Usage Check',
        instructions: 'From Control Panel→Administration Tools→Computer Management. Click on Storage→Disk Management. Check the Status for all hard disks. Remove old windows event logs to meet target disk usage limit. Note: HDSRS servers with SQL Server Database can use up to 90% disk space, which is normal.',
        hasImage: false
      },
      {
        title: 'CPU and RAM Usage Check',
        instructions: 'Monitor CPU and memory usage. Note: SQL Server Database on HDSRS Servers uses memory as needed for best performance. Overall server memory usage can be up to 90%.',
        hasImage: true
      },
      {
        title: 'Network Health Check',
        instructions: 'Test network connectivity and verify all network interfaces are functioning properly.',
        hasImage: false
      },
      {
        title: 'Willowlynx Process Status Check',
        instructions: 'Check Willowlynx process status through the system interface. Verify all processes are running correctly.',
        hasImage: true
      },
      {
        title: 'Willowlynx Network Status Check',
        instructions: 'Verify Willowlynx network connectivity and communication status.',
        hasImage: true
      },
      {
        title: 'Willowlynx RTU Status Check',
        instructions: 'Check RTU communication status and verify data transmission.',
        hasImage: true
      },
      {
        title: 'Willowlynx Historical Trend Check',
        instructions: 'Verify historical trend data collection and storage.',
        hasImage: false
      },
      {
        title: 'Willowlynx Historical Report Check',
        instructions: 'Check historical report generation and data integrity.',
        hasImage: true
      },
      {
        title: 'Willowlynx Sump Pit CCTV Camera Check',
        instructions: 'Verify CCTV camera functionality and video feed quality.',
        hasImage: true
      },
      {
        title: 'Monthly Database Creation Check',
        instructions: 'Verify monthly database creation process and data archival.',
        hasImage: false
      },
      {
        title: 'Database Backup Check',
        instructions: 'Verify database backup processes for both MS SQL and SCADA data.',
        hasImage: false
      },
      {
        title: 'SCADA & Historical Time Sync Check',
        instructions: 'Check time synchronization between SCADA and historical servers.',
        hasImage: false
      },
      {
        title: 'Hotfixes / Service Packs',
        instructions: 'Review and apply necessary hotfixes and service packs.',
        hasImage: false
      },
      {
        title: 'Auto failover of SCADA server',
        instructions: 'Test automatic failover functionality. Note: Make sure both SCADA servers are online after completing the test.',
        hasImage: false
      },
      {
        title: 'ASA Firewall Maintenance',
        instructions: 'Perform ASA firewall maintenance and configuration checks.',
        hasImage: false
      },
      {
        title: 'Software Patch Summary',
        instructions: 'Review and document all software patches applied.',
        hasImage: false
      }
    ];

    // Process each section - one section per page
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      // Add new page for each section
      pdf.addPage();
      yPosition = margin;
      drawHeader();
      
      const sectionData = resolveSectionData(serverPMData, section.title);
      const sectionRemarks = resolveSectionRemarks(sectionData, section.title);
      
      drawSectionHeader(section.title);
      
      // Add instructions box
      if (section.instructions) {
        drawInstructionsBox(section.instructions);
      }
      
      // Add image placeholder if component has image
      if (section.hasImage) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text('[Reference Image - See UI Component]', margin, yPosition);
        yPosition += 15;
      }
      
      const { headers, rows } = buildTableDataForSection(sectionData, section.title, resultStatusMap, yesNoStatusMap);
      
      if (headers && headers.length > 0) {
        drawTable(headers, rows);
      } else {
        drawLabelValueLine('No data available', '', 5);
      }
      
      if (sectionRemarks) {
        yPosition += 10;
        drawRemarksBox(sectionRemarks);
      }
    }

    // Save PDF
    pdf.save(`Server_PM_Report_${serverPMData.jobNo || 'Unknown'}_${formatDate(new Date(), 'YYYYMMDD')}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Fetches Server PM report data based on the API structure from ServerPMReportFormDetails
 */
const fetchServerPMData = async (reportId) => {
  try {
    const response = await getServerPMReportFormWithDetails(reportId);
    
    return {
      // Basic info - matching ServerPMReportFormDetails data mapping
      jobNo: response.reportForm?.jobNo || response.pmReportFormServer?.jobNo,
      systemDescription: response.reportForm?.systemDescription || response.pmReportFormServer?.systemDescription,
      stationName: response.reportForm?.stationName || response.pmReportFormServer?.stationName,
      customer: response.pmReportFormServer?.customer,
      projectNo: response.pmReportFormServer?.projectNo,
      scheduleDate: response.pmReportFormServer?.scheduleDate,
      
      // Section data - exact mapping from ServerPMReportFormDetails component
      pmServerHealths: response.pmServerHealths || [],
      pmServerHardDriveHealths: response.pmServerHardDriveHealths || [],
      pmServerDiskUsageHealths: response.pmServerDiskUsageHealths || [],
      pmServerCPUAndMemoryUsages: response.pmServerCPUAndMemoryUsages || [],
      pmServerNetworkHealths: response.pmServerNetworkHealths || [],
      pmServerWillowlynxProcessStatuses: response.pmServerWillowlynxProcessStatuses || [],
      pmServerWillowlynxNetworkStatuses: response.pmServerWillowlynxNetworkStatuses || [],
      pmServerWillowlynxRTUStatuses: response.pmServerWillowlynxRTUStatuses || [],
      pmServerWillowlynxHistoricalTrends: response.pmServerWillowlynxHistoricalTrends || [],
      pmServerWillowlynxHistoricalReports: response.pmServerWillowlynxHistoricalReports || [],
      pmServerWillowlynxCCTVCameras: response.pmServerWillowlynxCCTVCameras || [],
      pmServerMonthlyDatabaseCreations: response.pmServerMonthlyDatabaseCreations || [],
      pmServerDatabaseBackups: response.pmServerDatabaseBackups || [],
      pmServerTimeSyncs: response.pmServerTimeSyncs || [],
      pmServerHotFixes: response.pmServerHotFixes || [],
      pmServerFailOvers: response.pmServerFailOvers || [],
      pmServerASAFirewalls: response.pmServerASAFirewalls || [],
      pmServerSoftwarePatchSummaries: response.pmServerSoftwarePatchSummaries || [],
      
      // Sign off data - matching ServerPMReportFormDetails structure
      signOffData: response.pmReportFormServer?.signOffData || {}
    };
  } catch (error) {
    console.error('Error fetching server PM data:', error);
    return null;
  }
};

/**
 * Builds status lookup maps with support for different API response structures
 */
const buildStatusLookups = async () => {
  const resultStatusMap = await safeFetchResultStatuses();
  const yesNoStatusMap = await safeFetchYesNoStatuses();
  return { resultStatusMap, yesNoStatusMap };
};

const safeFetchResultStatuses = async () => {
  try {
    const statuses = await resultStatusService.getResultStatuses();
    const map = {};
    if (Array.isArray(statuses)) {
      statuses.forEach(status => {
        if (status && (status.id || status.resultStatusId)) {
          const id = status.id || status.resultStatusId;
          const name = status.name || status.resultStatusName || status.statusName;
          map[id] = name;
        }
      });
    }
    return map;
  } catch (error) {
    console.error('Error fetching result statuses:', error);
    return {};
  }
};

const safeFetchYesNoStatuses = async () => {
  try {
    const statuses = await yesNoStatusService.getYesNoStatuses();
    const map = {};
    if (Array.isArray(statuses)) {
      statuses.forEach(status => {
        if (status && (status.id || status.yesNoStatusId)) {
          const id = status.id || status.yesNoStatusId;
          const name = status.name || status.yesNoStatusName || status.statusName;
          map[id] = name;
        }
      });
    }
    return map;
  } catch (error) {
    console.error('Error fetching yes/no statuses:', error);
    return {};
  }
};

/**
 * Formats date with support for different formats
 */
const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (format === 'YYYYMMDD') {
      return d.getFullYear() + 
             String(d.getMonth() + 1).padStart(2, '0') + 
             String(d.getDate()).padStart(2, '0');
    }
    return d.toLocaleDateString('en-GB');
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Resolves section data based on section title - matching ServerPMReportFormDetails data mapping
 */
const resolveSectionData = (serverPMData, sectionTitle) => {
  const sectionMap = {
    'Server Health Check': serverPMData.pmServerHealths,
    'Hard Drive Health Check': serverPMData.pmServerHardDriveHealths,
    'Disk Usage Check': serverPMData.pmServerDiskUsageHealths,
    'CPU and RAM Usage Check': serverPMData.pmServerCPUAndMemoryUsages,
    'Network Health Check': serverPMData.pmServerNetworkHealths,
    'Willowlynx Process Status Check': serverPMData.pmServerWillowlynxProcessStatuses,
    'Willowlynx Network Status Check': serverPMData.pmServerWillowlynxNetworkStatuses,
    'Willowlynx RTU Status Check': serverPMData.pmServerWillowlynxRTUStatuses,
    'Willowlynx Historical Trend Check': serverPMData.pmServerWillowlynxHistoricalTrends,
    'Willowlynx Historical Report Check': serverPMData.pmServerWillowlynxHistoricalReports,
    'Willowlynx Sump Pit CCTV Camera Check': serverPMData.pmServerWillowlynxCCTVCameras,
    'Monthly Database Creation Check': serverPMData.pmServerMonthlyDatabaseCreations,
    'Database Backup Check': serverPMData.pmServerDatabaseBackups,
    'SCADA & Historical Time Sync Check': serverPMData.pmServerTimeSyncs,
    'Hotfixes / Service Packs': serverPMData.pmServerHotFixes,
    'Auto failover of SCADA server': serverPMData.pmServerFailOvers,
    'ASA Firewall Maintenance': serverPMData.pmServerASAFirewalls,
    'Software Patch Summary': serverPMData.pmServerSoftwarePatchSummaries
  };
  
  return sectionMap[sectionTitle] || [];
};

/**
 * Resolves section remarks from the first item in section data
 */
const resolveSectionRemarks = (sectionData, sectionTitle) => {
  if (!sectionData || !Array.isArray(sectionData) || sectionData.length === 0) {
    return '';
  }
  
  const firstItem = sectionData[0];
  return firstItem?.remarks || firstItem?.Remarks || '';
};

/**
 * Builds table data (headers and rows) for a specific section based on actual component structures
 */
const buildTableDataForSection = (sectionData, sectionTitle, resultStatusMap, yesNoStatusMap) => {
  if (!sectionData || !Array.isArray(sectionData) || sectionData.length === 0) {
    return { headers: [], rows: [] };
  }

  // Helper function to get status display text
  const getStatusText = (statusId, statusName, statusMap) => {
    const mappedStatus = statusMap[statusId] || statusName;
    if (!mappedStatus) return 'N/A';
    
    // Add status indicator symbols (remove extra quotes)
    const statusLower = mappedStatus.toLowerCase();
    if (statusLower.includes('pass') || statusLower.includes('ok') || statusLower.includes('good')) {
      return `✓ ${mappedStatus}`;
    } else if (statusLower.includes('fail') || statusLower.includes('error') || statusLower.includes('bad')) {
      return `✗ ${mappedStatus}`;
    } else if (statusLower.includes('warning') || statusLower.includes('caution')) {
      return `⚠ ${mappedStatus}`;
    }
    return mappedStatus;
  };

  switch (sectionTitle) {
    case 'Server Health Check':
      // Based on ServerHealth_Details table structure
      const headers1 = ['Server Name', 'Result Status'];
      const rows1 = sectionData.flatMap(item => 
        (item.details || []).map(detail => ({
          'Server Name': detail.serverName || 'N/A',
          'Result Status': getStatusText(detail.resultStatusID, detail.resultStatusName, resultStatusMap)
        }))
      );
      return { headers: headers1, rows: rows1 };

    case 'Hard Drive Health Check':
      // Based on HardDriveHealth_Details table structure
      const headers2 = ['Server Name', 'Hard Drive', 'Status'];
      const rows2 = sectionData.flatMap(item => 
        (item.details || []).map(detail => ({
          'Server Name': detail.serverName || 'N/A',
          'Hard Drive': detail.hardDriveName || detail.serverName || 'N/A',
          'Status': getStatusText(detail.resultStatusID, detail.resultStatusName, resultStatusMap)
        }))
      );
      return { headers: headers2, rows: rows2 };

    case 'Disk Usage Check':
      // Based on DiskUsage_Details table structure
      const headers3 = ['Server', 'Disk', 'Capacity', 'Free Space', 'Usage', 'Status'];
      const rows3 = sectionData.flatMap(item => 
        (item.details || []).map(detail => ({
          'Server': detail.serverName || 'N/A',
          'Disk': detail.diskName || 'N/A',
          'Capacity': detail.capacity || 'N/A',
          'Free Space': detail.freeSpace || 'N/A',
          'Usage': detail.usage || 'N/A',
          'Status': getStatusText(detail.resultStatusID, detail.serverDiskStatusName || detail.resultStatusName, resultStatusMap)
        }))
      );
      return { headers: headers3, rows: rows3 };

    case 'CPU and RAM Usage Check':
      // Based on CPUAndRamUsage_Details table structure
      const headers4 = ['Type', 'Server', 'Usage Details', 'Status'];
      const rows4 = [];
      
      sectionData.forEach(item => {
        // Memory usage details
        if (item.memoryUsageDetails) {
          item.memoryUsageDetails.forEach(detail => {
            rows4.push({
              'Type': 'Memory',
              'Server': detail.serverName || 'N/A',
              'Usage Details': `${detail.memorySize || 'N/A'} (${detail.memoryInUsePercentage || 'N/A'}% used)`,
              'Status': getStatusText(detail.yesNoStatusID, detail.yesNoStatusName, yesNoStatusMap)
            });
          });
        }
        
        // CPU usage details
        if (item.cpuUsageDetails) {
          item.cpuUsageDetails.forEach(detail => {
            rows4.push({
              'Type': 'CPU',
              'Server': detail.serverName || 'N/A',
              'Usage Details': `${detail.cpuUsagePercentage || 'N/A'}% usage`,
              'Status': getStatusText(detail.yesNoStatusID, detail.yesNoStatusName, yesNoStatusMap)
            });
          });
        }
      });
      return { headers: headers4, rows: rows4 };

    case 'Network Health Check':
      // Based on NetworkHealth_Details table structure
      const headers5 = ['Date Checked', 'Result'];
      const rows5 = sectionData.map(item => ({
        'Date Checked': formatDate(item.dateChecked),
        'Result': getStatusText(item.yesNoStatusID, item.yesNoStatusName, yesNoStatusMap)
      }));
      return { headers: headers5, rows: rows5 };

    case 'Database Backup Check':
      // Based on DatabaseBackup_Details table structure
      const headers6 = ['Type', 'Database', 'Status', 'Latest Backup'];
      const rows6 = [];
      
      sectionData.forEach(item => {
        // MS SQL Database Backup Details
        if (item.mssqlDatabaseBackupDetails) {
          item.mssqlDatabaseBackupDetails.forEach(detail => {
            rows6.push({
              'Type': 'MS SQL',
              'Database': detail.databaseName || 'N/A',
              'Status': getStatusText(detail.yesNoStatusID, detail.yesNoStatusName, yesNoStatusMap),
              'Latest Backup': detail.latestBackupFileName || 'N/A'
            });
          });
        }
        
        // SCADA Data Backup Details
        if (item.scadaDataBackupDetails) {
          item.scadaDataBackupDetails.forEach(detail => {
            rows6.push({
              'Type': 'SCADA',
              'Database': detail.databaseName || 'N/A',
              'Status': getStatusText(detail.yesNoStatusID, detail.yesNoStatusName, yesNoStatusMap),
              'Latest Backup': detail.latestBackupFileName || 'N/A'
            });
          });
        }
      });
      return { headers: headers6, rows: rows6 };

    case 'SCADA & Historical Time Sync Check':
      // Based on TimeSync_Details table structure
      const headers7 = ['Machine Name', 'Time Sync Result'];
      const rows7 = sectionData.map(item => ({
        'Machine Name': item.machineName || 'N/A',
        'Time Sync Result': getStatusText(item.resultStatusID, item.resultStatusName, resultStatusMap)
      }));
      return { headers: headers7, rows: rows7 };

    case 'Hotfixes / Service Packs':
      // Based on HotFixes_Details table structure
      const headers8 = ['Machine', 'Latest Hotfixes', 'Status'];
      const rows8 = sectionData.flatMap(item => 
        (item.details || []).map(detail => ({
          'Machine': detail.machineName || 'N/A',
          'Latest Hotfixes': detail.latestHotfixesApplied || detail.latestHotFixesApplied || 'N/A',
          'Status': getStatusText(detail.resultStatusID, detail.done || detail.resultStatusName, resultStatusMap)
        }))
      );
      return { headers: headers8, rows: rows8 };

    case 'Auto failover of SCADA server':
      // Based on AutoFailOver_Details table structure
      const headers9 = ['From Server', 'To Server', 'Expected Result', 'Result'];
      const rows9 = sectionData.flatMap(item => 
        (item.details || []).map(detail => ({
          'From Server': detail.fromServer || 'N/A',
          'To Server': detail.toServer || 'N/A',
          'Expected Result': detail.expectedResult || 'N/A',
          'Result': getStatusText(detail.yesNoStatusID, detail.yesNoStatusName, yesNoStatusMap)
        }))
      );
      return { headers: headers9, rows: rows9 };

    case 'ASA Firewall Maintenance':
      // Based on ASAFirewall_Details table structure
      const headers10 = ['Command', 'ASA Firewall Status', 'Result Status'];
      const rows10 = sectionData.map(item => ({
        'Command': item.commandInput || 'N/A',
        'ASA Firewall Status': item.asaFirewallStatusName || 'N/A',
        'Result Status': getStatusText(item.resultStatusID, item.resultStatusName, resultStatusMap)
      }));
      return { headers: headers10, rows: rows10 };

    case 'Software Patch Summary':
      // Based on SoftwarePatch_Details table structure
      const headers11 = ['Patch Name', 'Description', 'Installation Date'];
      const rows11 = sectionData.flatMap(item => 
        (item.details || []).map(detail => ({
          'Patch Name': detail.patchName || detail.hotFixName || 'N/A',
          'Description': detail.description || 'N/A',
          'Installation Date': formatDate(detail.installationDate) || 'N/A'
        }))
      );
      return { headers: headers11, rows: rows11 };

    case 'Monthly Database Creation Check':
      // Based on MonthlyDatabaseCreation_Details table structure
      const headers12 = ['Database Name', 'Creation Date', 'Status'];
      const rows12 = sectionData.map(item => ({
        'Database Name': item.databaseName || 'N/A',
        'Creation Date': formatDate(item.creationDate),
        'Status': getStatusText(item.yesNoStatusID, item.yesNoStatusName, yesNoStatusMap)
      }));
      return { headers: headers12, rows: rows12 };

    case 'SCADA & Historical Time Sync Check':
      // Based on TimeSync_Details table structure
      const headers13 = ['Machine Name', 'Time Sync Result'];
      const rows13 = sectionData.map(item => ({
        'Machine Name': item.machineName || 'N/A',
        'Time Sync Result': getStatusText(item.resultStatusID, item.resultStatusName, resultStatusMap)
      }));
      return { headers: headers13, rows: rows13 };

    // Willowlynx components - Based on their simple yes/no status structure
    case 'Willowlynx Process Status Check':
    case 'Willowlynx Network Status Check':
    case 'Willowlynx RTU Status Check':
    case 'Willowlynx Historical Trend Check':
    case 'Willowlynx Historical Report Check':
    case 'Willowlynx Sump Pit CCTV Camera Check':
      const headersWillowlynx = ['Check Result', 'Date Checked'];
      const rowsWillowlynx = sectionData.map(item => ({
        'Check Result': getStatusText(item.yesNoStatusID, item.yesNoStatusName, yesNoStatusMap),
        'Date Checked': formatDate(item.dateChecked || item.createdDate) || 'N/A'
      }));
      return { headers: headersWillowlynx, rows: rowsWillowlynx };

    default:
      return { headers: [], rows: [] };
  }
};

/**
 * Prints a React component to PDF using html2canvas
 */
export const printComponentToPDF = async (componentRef, filename = 'report.pdf') => {
  try {
    if (!componentRef.current) {
      throw new Error('Component reference is not available');
    }

    const canvas = await html2canvas(componentRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    // Handle multi-page content
    const pageHeight = imgHeight * ratio;
    let heightLeft = pageHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, pageHeight);
    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, pageHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};