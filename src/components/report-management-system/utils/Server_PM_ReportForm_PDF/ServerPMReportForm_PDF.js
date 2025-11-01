import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getServerPMReportFormWithDetails } from '../../../api-services/reportFormService';
import resultStatusService from '../../../api-services/resultStatusService';
import yesNoStatusService from '../../../api-services/yesNoStatusService';
import HTMLGenerator from './HTMLGenerator';
import ServerPMSignOff_PDF from './ServerPMSignOff_PDF';
import ServerHealth_PDF from './ServerHealth_PDF';
import ServerPMReportForm_FirstPage_PDF from './ServerPMReportForm_FirstPage_PDF';

const ServerPMReportForm_PDF = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const componentRef = useRef();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMaps, setStatusMaps] = useState({ resultStatusMap: {}, yesNoStatusMap: {} });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingHTML, setIsGeneratingHTML] = useState(false);

  // Generate PDF by capturing rendered components
  // Generate PDF using HTML-to-PDF conversion for better quality
  const handleDownloadPDFFromHTML = async () => {
    if (!componentRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Generate filename
      const jobNo = reportData?.pmReportFormServer?.jobNo || '';
      const date = new Date().toISOString().split('T')[0];
      const filename = `Server_PM_Report_${jobNo}_${date}.pdf`;
      
      // Hide buttons before capturing
      const buttons = document.querySelectorAll('.no-print');
      buttons.forEach(button => {
        button.style.display = 'none';
      });

      // Get all page sections within the PDF content
      const pdfContent = componentRef.current;
      const sections = pdfContent.querySelectorAll('.page-break');
      
      if (sections.length === 0) {
        throw new Error('No PDF sections found to capture');
      }
      
      console.log(`Found ${sections.length} sections to capture for PDF`);
      
      // Create PDF with A4 dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      let isFirstPage = true;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        
        // Ensure section is visible and has content
        if (section.offsetHeight === 0) {
          console.warn(`Section ${i} has no height, skipping...`);
          continue;
        }
        
        console.log(`Capturing section ${i + 1} of ${sections.length}...`);
        
        // Temporarily adjust section styles for PDF capture
        const originalStyles = {
          maxWidth: section.style.maxWidth,
          margin: section.style.margin,
          padding: section.style.padding,
          width: section.style.width,
          height: section.style.height,
          boxSizing: section.style.boxSizing,
          pageBreakAfter: section.style.pageBreakAfter
        };
        
        // Apply PDF-optimized styles temporarily
        section.style.maxWidth = 'none';
        section.style.margin = '0';
        section.style.padding = '0'; // Remove all padding
        section.style.width = '210mm'; // A4 width
        section.style.height = 'auto'; // Let content determine height
        section.style.boxSizing = 'border-box';
        section.style.pageBreakAfter = 'auto';
        
        // Force reflow
        void section.offsetHeight;
        
        // Generate HTML content for this section using HTMLGenerator
        const htmlContent = await HTMLGenerator.generateHTMLForPDF({
          element: section,
          reportData,
          title: `Server PM Report - ${jobNo} - Page ${i + 1}`
        });
        
        // Create a temporary iframe to render the HTML
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '210mm';
        iframe.style.height = '297mm';
        iframe.style.border = 'none';
        iframe.style.margin = '0';
        iframe.style.padding = '0';
        document.body.appendChild(iframe);
        
        // Write HTML content to iframe
        iframe.contentDocument.open();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();
        
        // Wait for content to load
        await new Promise(resolve => {
          iframe.onload = resolve;
          setTimeout(resolve, 1500); // Longer timeout for complex content
        });
        
        // Capture the iframe content as canvas
        const canvas = await html2canvas(iframe.contentDocument.body, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794, // A4 width in pixels
          height: 1123, // A4 height in pixels
          scrollX: 0,
          scrollY: 0,
          logging: false
        });
        
        // Clean up iframe
        document.body.removeChild(iframe);
        
        // Restore original styles
        Object.keys(originalStyles).forEach(key => {
          if (originalStyles[key] !== undefined && originalStyles[key] !== '') {
            section.style[key] = originalStyles[key];
          } else {
            section.style.removeProperty(key.replace(/([A-Z])/g, '-$1').toLowerCase());
          }
        });

        const imgData = canvas.toDataURL('image/png');
        
        // Add new page if not first page
        if (!isFirstPage) {
          pdf.addPage();
        }
        
        // Add image to PDF filling the entire page
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        
        isFirstPage = false;
      }
      
      // Save PDF
      pdf.save(filename);
      
      console.log('Multi-page PDF generated successfully:', filename);

    } catch (error) {
      console.error('Error generating PDF from HTML:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      // Show buttons again
      const buttons = document.querySelectorAll('.no-print');
      buttons.forEach(button => {
        button.style.display = '';
      });
      
      setIsGeneratingPDF(false);
    }
  };

  // Generate HTML file by capturing the complete report content
  const handleDownloadHTML = async () => {
    if (!componentRef.current) return;
    
    setIsGeneratingHTML(true);
    
    try {
      // Hide buttons before capturing
      const buttons = document.querySelectorAll('.no-print');
      buttons.forEach(button => {
        button.style.display = 'none';
      });

      // Get the PDF content element
      const element = componentRef.current;
      
      // Generate HTML report using HTMLGenerator
      await HTMLGenerator.generateHTMLReport({
        element,
        reportData,
        title: `Server PM Report - ${reportData?.pmReportFormServer?.jobNo}`
      });

      console.log('HTML generated successfully');

    } catch (error) {
      console.error('Error generating HTML:', error);
      alert('Error generating HTML. Please try again.');
    } finally {
      // Show buttons again
      const buttons = document.querySelectorAll('.no-print');
      buttons.forEach(button => {
        button.style.display = '';
      });
      
      setIsGeneratingHTML(false);
    }
  };

  const handlePrint = () => {
    // This function is kept for compatibility but redirects to PDF download
    handleDownloadPDFFromHTML();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch report data
        const data = await getServerPMReportFormWithDetails(id);
        if (!data) {
          throw new Error('Failed to fetch report data');
        }
        console.log("==== SERVER PM REPORT FORM ====");
        console.log(data);
    
        setReportData(data);

        // Build status lookup maps
        const [resultStatuses, yesNoStatuses] = await Promise.all([
          resultStatusService.getResultStatus().catch(() => []),
          yesNoStatusService.getYesNoStatuses().catch(() => [])
        ]);

        const resultStatusMap = {};
        const yesNoStatusMap = {};

        resultStatuses.forEach(status => {
          resultStatusMap[status.id] = status.name;
        });

        yesNoStatuses.forEach(status => {
          yesNoStatusMap[status.id] = status.name;
        });

        setStatusMaps({ resultStatusMap, yesNoStatusMap });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const formatDate = (date, format = 'DD/MM/YYYY') => {
    if (!date) return '';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '';
      
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      
      return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year);
    } catch (error) {
      return '';
    }
  };

  const resolveSectionData = (serverPMData, sectionTitle) => {
    if (!serverPMData?.serverPMReportFormSections) return [];
    
    const section = serverPMData.serverPMReportFormSections.find(
      section => section.sectionTitle === sectionTitle
    );
    
    return section?.serverPMReportFormSectionDetails || [];
  };

  const buildTableDataForSection = (sectionData, sectionTitle, resultStatusMap, yesNoStatusMap) => {
    if (!sectionData || sectionData.length === 0) {
      return [];
    }

    return sectionData.map(detail => {
      let statusText = '';
      
      if (detail.resultStatusId && resultStatusMap[detail.resultStatusId]) {
        statusText = resultStatusMap[detail.resultStatusId];
      } else if (detail.yesNoStatusId && yesNoStatusMap[detail.yesNoStatusId]) {
        statusText = yesNoStatusMap[detail.yesNoStatusId];
      }

      return {
        item: detail.itemDescription || '',
        status: statusText,
        remarks: detail.remarks || ''
      };
    });
  };

  const sections = [
    'Physical Inspection',
    'System Performance Check',
    'Security Assessment',
    'Backup and Recovery Verification',
    'Documentation Review'
  ];

  return (
    <Box sx={{ 
      maxWidth: '210mm', 
      margin: '0 auto', 
      p: 3, 
      backgroundColor: 'white',
      '@media print': {
        p: 0,
        margin: 0,
        maxWidth: 'none',
        width: '100%'
      },
      // Allow components to expand during PDF capture
      '&.pdf-capturing': {
        maxWidth: 'none',
        margin: 0,
        padding: 0,
        width: '210mm'
      }
    }}>
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading report data...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && reportData && (
        <>
          {/* PDF Content Container - This is what gets captured for PDF */}
          <div className="pdf-content" ref={componentRef}>
            {/* First Page Section - Using imported component */}
            <Box className="server-pm-first-page page-break" sx={{ 
              '@media print': { 
                pageBreakAfter: 'always',
                minHeight: '100vh'
              } 
            }}>
              <ServerPMReportForm_FirstPage_PDF 
                reportData={reportData}
              />
            </Box>

            {/* Sign Off Section - Using imported component */}
            <Box className="server-pm-signoff page-break" sx={{ 
              '@media print': { 
                pageBreakAfter: 'always',
                minHeight: '100vh'
              } 
            }}>
              <ServerPMSignOff_PDF 
                reportData={{
                  ...reportData,
                  // Pass sign-off specific fields
                  attendedBy: reportData?.signOffData?.attendedBy || reportData?.attendedBy || '',
                  witnessedBy: reportData?.signOffData?.witnessedBy || reportData?.witnessedBy || '',
                  startDateTime: reportData?.signOffData?.startDate || reportData?.startDateTime || '',
                  completionDateTime: reportData?.signOffData?.completionDate || reportData?.completionDateTime || '',
                  remarks: reportData?.signOffData?.remarks || reportData?.remarks || '',
                  // Map the pmReportFormServer data correctly
                  pmReportFormServer: reportData?.pmReportFormServer || reportData
                }} 
              />
            </Box>

            {/* Server Health Section - Using imported component */}
            <Box className="server-health-section page-break" sx={{ 
              '@media print': { 
                pageBreakAfter: 'always',
                minHeight: '100vh'
              } 
            }}>
              <ServerHealth_PDF 
                data={reportData?.pmServerHealths || []}
                reportData={reportData}
              />
            </Box>
          </div>

          {/* Download Buttons - Outside PDF content */}
          <Box className="no-print" sx={{ mt: 4, textAlign: 'center', '@media print': { display: 'none' } }}>
            <Button 
              variant="contained" 
              onClick={handleDownloadPDFFromHTML}
              disabled={isGeneratingPDF || isGeneratingHTML}
              sx={{ mr: 2 }}
            >
              {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
            </Button>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={handleDownloadHTML}
              disabled={isGeneratingPDF || isGeneratingHTML}
              sx={{ mr: 2 }}
            >
              {isGeneratingHTML ? 'Generating HTML...' : 'Download HTML'}
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/report-management-system')}
              disabled={isGeneratingPDF || isGeneratingHTML}
            >
              Back
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ServerPMReportForm_PDF;