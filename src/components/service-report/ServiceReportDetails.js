import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, TextField,
  CircularProgress, Alert, Dialog, DialogContent, DialogActions,
  Collapse, IconButton, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { 
  ArrowBack, Edit, Print, ExpandLess, ExpandMore, 
  Close, Info, Schedule, Build, Assignment, Inventory 
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api-services/api';
import moment from 'moment';
import letterheadImage from '../resources/willowglen_letterhead.png';
import { useTheme } from '@mui/material/styles';

const ServiceReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    dateTime: true,
    serviceType: true,
    comments: true,
    actionTaken: true,
    furtherAction: true,
    formStatus: true,
    materialsUsed: true // Add this line
  });

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/ServiceReport/${id}`);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report details:', error);
      if (error.response?.status === 404) {
        setError('Report not found. This report may have been deleted or the ID is invalid.');
      } else {
        setError('Failed to load report details. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return dateString ? moment(dateString).format('DD/MM/YYYY HH:mm') : 'N/A';
  };

  const formatJobNumber = (jobNumber) => {
    return jobNumber || 'N/A';
  };

  // Helper function to format job number with red styling for numbers after 'M'
  const formatJobNumberWithStyling = (jobNo) => {
    if (!jobNo || jobNo === 'N/A') return 'N/A';
    
    // Check if job number starts with 'M'
    if (jobNo.startsWith('M')) {
      const prefix = 'M ';
      const numbers = jobNo.substring(1); // Get everything after 'M'
      return `${prefix}<span class="job-number-value">${numbers}</span>`;
    }
    
    return jobNo; // Return as is if it doesn't start with 'M'
  };

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePrint = () => {
    setPrintPreviewOpen(true);
  };

  const handlePrintConfirm = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatePrintHTML());
    printWindow.document.close();
    printWindow.print();
    setPrintPreviewOpen(false);
  };

  const generatePrintHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Service Report - ${report.jobNumber}</title>
        <style>
          @page {
            margin: 0.5in;
            size: A4;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            font-size: 12px;
          }
          .letterhead {
            border-bottom: 2px solid #800080;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .report-title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            color: #0078d4;
            margin: 15px 0;
          }
          .job-number {
            text-align: right;
            font-size: 12px;
            margin-bottom: 15px;
          }
          .job-number-value {
            font-size: 16px;
            color: red;
            font-weight: bold;
          }
          .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #0078d4;
            margin-bottom: 8px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
          }
          .field-row {
            display: flex;
            margin-bottom: 6px;
            align-items: center;
          }
          .field-label {
            font-weight: bold;
            width: 120px;
            margin-right: 5px;
          }
          .field-value {
            flex: 1;
            padding: 3px 6px;
            border-bottom: 1px solid #ddd;
            min-height: 18px;
          }
          .date-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .date-table th, .date-table td {
            border: 1px solid #000000;
            padding: 8px;
            text-align: center;
            font-size: 12px;
          }
          .date-table th {
            font-weight: bold;
          }
          .date-table td {
            background-color: #ffffff;
          }
          .materials-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            text-align: center;
          }
          .materials-table th, .materials-table td {
            border: 1px solid #000000;
            padding: 6px;
            text-align: left;
            font-size: 11px;
          }
          .materials-table th {
            background-color: #ffffff;
            font-weight: bold;
            text-align: center;
          }
          .remark-row {
            display: flex;
            margin-top: 4px;
            margin-bottom: 8px;
          }
          .remark-label {
            font-weight: bold;
            width: 70px;
            margin-right: 10px;
          }
          .remark-value {
            flex: 1;
            padding: 3px 6px;
            border-bottom: 1px solid #ddd;
            min-height: 18px;
          }
          .three-column-layout {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
          }
          .column {
            width: 100%;
          }
          .two-column-layout {
            display: grid;
            grid-template-columns: 120px 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          .two-column-layout-with-remark {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 10px;
          }
          .label-value-pair {
            display: flex;
            align-items: center;
          }
          .label-value-pair .field-label {
            min-width: 120px;
          }
          .remark-container {
            display: flex;
            align-items: center;
          }
          .signature-section {
            margin-top: 30px;
          }
          .signature-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .signature-item {
            display: flex;
            align-items: flex-start;
          }
          .signature-label {
            font-weight: bold;
            width: 100px;
            padding-top: 5px;
          }
          .signature-box {
            display: flex;
            flex-direction: column;
            width: 250px;
          }
          .signature-line {
            border-bottom: 1px solid #000;
            margin-bottom: 5px;
            min-height: 20px;
          }
          .signature-caption {
            font-size: 10px;
            text-align: center;
            color: #666;
          }
          .date-time-container {
            display: flex;
            align-items: flex-start;
          }
          .date-time-label {
            font-weight: bold;
            width: 80px;
            padding-top: 5px;
          }
          .date-time-box {
            display: flex;
            flex-direction: column;
            width: 250px;
          }
          .date-time-line {
            border-bottom: 1px solid #000;
            min-height: 20px;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <!-- Company Letterhead -->
        <div class="letterhead">
          <img src="${letterheadImage}" alt="Willowglen Letterhead" />
        </div>

        <!-- Report Title -->
        <div class="report-title">Service Report Details</div>
        
        <!-- Basic Information -->
        <div class="section">
          <div class="section-title">Basic Information</div>
          <div class="job-number" style="margin-top: -30px;">
            <strong>Job No: ${formatJobNumberWithStyling(report.jobNumber || 'N/A')}</strong>
          </div>
          
          <div class="three-column-layout">
            <div class="column">
              <div class="field-row">
                <span class="field-label">Customer:</span>
                <span class="field-value">${report.customer || ''}</span>
              </div>
              
              <div class="field-row">
                <span class="field-label">System:</span>
                <span class="field-value">${report.systemName || ''}</span>
              </div>
            </div>
            
            <div class="column">
              <div class="field-row">
                <span class="field-label">Contact No:</span>
                <span class="field-value">${report.contactNo || ''}</span>
              </div>
              
              <div class="field-row">
                <span class="field-label">Location:</span>
                <span class="field-value">${report.locationName || ''}</span>
              </div>
            </div>
            
            <div class="column">
              <div class="field-row">
                <span class="field-label">Project No:</span>
                <span class="field-value">${report.projectNumberName || ''}</span>
              </div>
              
              <div class="field-row">
                <span class="field-label">Follow-up Action:</span>
                <span class="field-value">${report.followupActionNo || ''}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Date/Time Section -->
        <div class="section">
          <div class="section-title">Date / Time Information</div>
          <table class="date-table">
            <thead>
              <tr>
                <th>Date/Time of Failure Detected <br/>Problem Reported</th>
                <th>Date/Time of Response</th>
                <th>Date/Time of Arrival</th>
                <th>Date/Time of Completion</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${formatDate(report.failureDetectedDate)}</td>
                <td>${formatDate(report.responseDate)}</td>
                <td>${formatDate(report.arrivalDate)}</td>
                <td>${formatDate(report.completionDate)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Type of Service -->
        <div class="section">
          <div class="section-title">Type of Service</div>
          <div class="two-column-layout">
            <div class="field-label">Service Type:</div>
            <div class="field-value">${report.serviceType?.[0]?.name || 'N/A'}</div>
          </div>
          <div class="two-column-layout">
            <div class="field-label">Remark:</div>
            <div class="field-value">${report.serviceTypeRemark || ''}</div>
          </div>
        </div>

        <!-- Comments -->
        <div class="section">
          <div class="section-title">Comments / Description of Problem</div>
          <div class="two-column-layout-with-remark">
            <div class="label-value-pair">
              <div class="field-label">Issue Reported:</div>
              <div class="field-value">${report.issueReported?.[0]?.description || 'N/A'}</div>
            </div>
            <div class="remark-container">
              <div class="remark-label">Remark:</div>
              <div class="remark-value">${report.issueReportedRemark || ''}</div>
            </div>
          </div>
          
          <div class="two-column-layout-with-remark">
            <div class="label-value-pair">
              <div class="field-label">Issue Found:</div>
              <div class="field-value">${report.issueFound?.[0]?.description || 'N/A'}</div>
            </div>
            <div class="remark-container">
              <div class="remark-label">Remark:</div>
              <div class="remark-value">${report.issueFoundRemark || ''}</div>
            </div>
          </div>
        </div>

        <!-- Action Taken -->
        <div class="section">
          <div class="section-title">Action Taken</div>
          <div class="two-column-layout-with-remark">
            <div class="label-value-pair">
              <div class="field-label">Action Taken:</div>
              <div class="field-value">${report.actionTaken?.[0]?.description || 'N/A'}</div>
            </div>
            <div class="remark-container">
              <div class="remark-label">Remark:</div>
              <div class="remark-value">${report.actionTakenRemark || ''}</div>
            </div>
          </div>
        </div>

        <!-- Materials Used -->
        <div class="section">
          <div class="section-title">Materials Used</div>
          ${report.materialsUsed && report.materialsUsed.length > 0 ? `
            <table class="materials-table">
              <thead>
                <tr>
                  <th style="width: 15%">Quantity</th>
                  <th style="width: 55%">Description</th>
                  <th style="width: 30%">Serial No</th>
                </tr>
              </thead>
              <tbody>
                ${report.materialsUsed.map(material => `
                  <tr>
                    <td>${material.quantity}</td>
                    <td>${material.description || 'N/A'}</td>
                    <td>${material.serialNo || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <div style="padding: 10px; text-align: center; color: #666;">No materials used for this service report.</div>
          `}
        </div>

        <!-- Further Action -->
        <div class="section">
          <div class="section-title">Further Action</div>
          <div class="two-column-layout-with-remark">
            <div class="label-value-pair">
              <div class="field-label">Further Action:</div>
              <div class="field-value">${report.furtherActionTaken?.[0]?.description || 'N/A'}</div>
            </div>
            <div class="remark-container">
              <div class="remark-label">Remark:</div>
              <div class="remark-value">${report.furtherActionTakenRemark || ''}</div>
            </div>
          </div>
        </div>

        <!-- Form Status -->
        <div class="section">
          <div class="section-title">Form Status</div>
          <div class="two-column-layout-with-remark">
            <div class="label-value-pair">
              <div class="field-label">Status:</div>
              <div class="field-value">${report.formStatus?.[0]?.name || 'N/A'}</div>
            </div>
            <div class="remark-container">
              <div class="remark-label">Remark:</div>
              <div class="remark-value">${report.formStatusRemark || ''}</div>
            </div>
          </div>
        </div>
        
        <!-- Signature Section -->
        <div class="section signature-section">
          <div class="signature-row">
            <div class="signature-item">
              <div class="signature-label">Attended by:</div>
              <div class="signature-box">
                <div class="signature-line">${report.attendedBy || ''}</div>
                <div class="signature-caption">(Name and Signature)</div>
              </div>
            </div>
            <div class="date-time-container">
              <div class="date-time-label">Date/Time:</div>
              <div class="date-time-box">
                <div class="date-time-line"></div>
              </div>
            </div>
          </div>
          
          <div class="signature-row">
            <div class="signature-item">
              <div class="signature-label">Accepted by:</div>
              <div class="signature-box">
                <div class="signature-line">${report.acceptedBy || ''}</div>
                <div class="signature-caption">(Name and Signature)</div>
              </div>
            </div>
            <div class="date-time-container">
              <div class="date-time-label">Date/Time:</div>
              <div class="date-time-box">
                <div class="date-time-line"></div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress sx={{ color: '#800080' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/service-report-system')}
          sx={{ mt: 2, color: '#800080' }}
        >
          Back to Reports
        </Button>
      </Box>
    );
  }

  if (!report) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Report not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/service-report-system')}
          sx={{ mt: 2, color: '#800080' }}
        >
          Back to Reports
        </Button>
      </Box>
    );
  }

  // Compact styling constants
  const labelWidth = 140;
  const fieldWidth = 260;
  const remarkWidth = 180;
  const containerWidth = 1200;
  const sectionPadding = 1;

  const commonStyles = {
    fontSize: '14px',
    color: '#2c3e50'
  };

  const readOnlyFieldStyles = {
    backgroundColor: '#f8fafc',
    '& .MuiOutlinedInput-input': {
      height: '28px !important',
      padding: '4px 8px',
      ...commonStyles
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#cbd5e1'
    }
  };

  // Updated section header styles using theme
  const sectionHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 1,
    p: 1.5,
    backgroundColor: theme.palette.grey[50],
    borderRadius: '6px',
    border: `1px solid ${theme.palette.divider}`,
    minHeight: '40px'
  };

  const fieldGroupStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 1,
    p: 1,
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
    minHeight: '36px',
    '&:hover': {
      backgroundColor: '#f8fafc',
      borderColor: '#cbd5e1'
    }
  };

  return (
    <Box sx={{ 
      p: 2, 
      maxWidth: containerWidth,
      mx: 'auto',
      backgroundColor: '#f8fafc'
    }}>
      <Paper elevation={3} sx={{ 
        p: 3, 
        backgroundColor: '#fff',
        width: '100%',
        boxShadow: '0 4px 16px rgba(128, 0, 128, 0.1)',
        '&:hover': {
          boxShadow: '0 6px 24px rgba(128, 0, 128, 0.15)'
        },
        transition: 'box-shadow 0.3s ease-in-out'
      }}>
        {/* Header */}
        <Box sx={{ 
          position: 'relative',
          mb: 3
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: 1
          }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/service-report-system')}
              sx={{ color: '#800080' }}
            >
              Back to Reports
            </Button>
          </Box>
          
          <Typography 
            variant="h5" 
            align="center"
            sx={{ 
              fontSize: '22px', 
              fontWeight: 500,
              color: '#1976d2',
            }}
          >
            Service Report Details
          </Typography>
          
          <Box sx={{ 
            position: 'absolute',
            right: 0,
            top: 0,
            display: 'flex', 
            gap: 1.5
          }}>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={handlePrint}
              size="small"
              sx={{
                borderColor: '#800080',
                color: '#800080',
                '&:hover': {
                  borderColor: '#4B0082',
                  bgcolor: '#FCF6FF'
                }
              }}
            >
              Print
            </Button>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => navigate(`/service-report/edit/${report.id}`)}
              size="small"
              sx={{
                bgcolor: '#800080',
                '&:hover': {
                  bgcolor: '#4B0082'
                }
              }}
            >
              Edit Report
            </Button>
          </Box>
          
          <Box sx={{ 
            position: 'absolute',
            right: 0,
            top: 45,
            display: 'flex', 
            alignItems: 'center' 
          }}>
            <Typography sx={{ mr: 1.5, fontWeight: 600, fontSize: '14px' }}>Job No:</Typography>
            <TextField
              value={report.jobNumber || 'N/A'}
              size="small"
              InputProps={{
                readOnly: true,
                sx: {
                  bgcolor: '#f8fafc',
                  height: '32px',
                  '& .MuiInputBase-input': {
                    color: '#64748b',
                    fontWeight: 600,
                    textAlign: 'center',
                    fontSize: '13px'
                  }
                }
              }}
              sx={{ width: '120px' }}
            />
          </Box>
        </Box>

        {/* Basic Information Section */}
        <Box sx={{ mb: 2 }}>
          <Box sx={sectionHeaderStyles}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info sx={{ color: theme.palette.primary.main, fontSize: '18px' }} />
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: theme.palette.primary.main }}>
                Basic Information
              </Typography>
            </Box>
            <IconButton 
              onClick={() => handleSectionToggle('basicInfo')}
              sx={{ color: theme.palette.primary.main, p: 0.5 }}
              size="small"
            >
              {expandedSections.basicInfo ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          </Box>
          
          <Collapse in={expandedSections.basicInfo}>
            <Box sx={{ p: sectionPadding, backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              {/* Row 1 */}
              <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
                <Box sx={fieldGroupStyles}>
                  <Typography sx={{ width: labelWidth, fontWeight: 600, fontSize: '13px' }}>Customer:</Typography>
                  <TextField
                    value={report.customer || ''}
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={{ ...readOnlyFieldStyles, width: fieldWidth }}
                  />
                </Box>
                <Box sx={fieldGroupStyles}>
                  <Typography sx={{ width: labelWidth, fontWeight: 600, fontSize: '13px' }}>Contact No:</Typography>
                  <TextField
                    value={report.contactNo || ''}
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={{ ...readOnlyFieldStyles, width: fieldWidth }}
                  />
                </Box>
              </Box>
              
              {/* Row 2 */}
              <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
                <Box sx={fieldGroupStyles}>
                  <Typography sx={{ width: labelWidth, fontWeight: 600, fontSize: '13px' }}>Project No:</Typography>
                  <TextField
                    value={report.projectNumberName || ''}
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={{ ...readOnlyFieldStyles, width: fieldWidth }}
                  />
                </Box>
                <Box sx={fieldGroupStyles}>
                  <Typography sx={{ width: labelWidth, fontWeight: 600, fontSize: '13px' }}>System:</Typography>
                  <TextField
                    value={report.systemName || ''}
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={{ ...readOnlyFieldStyles, width: fieldWidth }}
                  />
                </Box>
              </Box>
              
              {/* Row 3 */}
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={fieldGroupStyles}>
                  <Typography sx={{ width: labelWidth, fontWeight: 600, fontSize: '13px' }}>Location:</Typography>
                  <TextField
                    value={report.locationName || ''}
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={{ ...readOnlyFieldStyles, width: fieldWidth }}
                  />
                </Box>
                <Box sx={fieldGroupStyles}>
                  <Typography sx={{ width: labelWidth, fontWeight: 600, fontSize: '13px' }}>Follow-up Action<br />(Job No):</Typography>
                  <TextField
                    value={report.followupActionNo || ''}
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={{ ...readOnlyFieldStyles, width: fieldWidth }}
                  />
                </Box>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Date/Time Section */}
        <Box sx={{ mb: 2 }}>
          <Box sx={sectionHeaderStyles}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule sx={{ color: theme.palette.primary.main, fontSize: '18px' }} />
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: theme.palette.primary.main }}>
                Date / Time Information
              </Typography>
            </Box>
            <IconButton 
              onClick={() => handleSectionToggle('dateTime')}
              sx={{ color: theme.palette.primary.main, p: 0.5 }}
              size="small"
            >
              {expandedSections.dateTime ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          </Box>
          
          <Collapse in={expandedSections.dateTime}>
            <Box sx={{ 
              p: sectionPadding,
              backgroundColor: '#fafafa',
              borderRadius: '6px',
              border: '1px solid #e2e8f0'
            }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box sx={fieldGroupStyles}>
                  <Typography sx={{ width: '160px', fontWeight: 600, fontSize: '13px' }}>Failure Detected:</Typography>
                  <TextField
                    value={formatDate(report.failureDetectedDate)}
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={{ ...readOnlyFieldStyles, width: '180px' }}
                  />
                </Box>
                <Box sx={fieldGroupStyles}>
                  <Typography sx={{ width: '160px', fontWeight: 600, fontSize: '13px' }}>Response Time:</Typography>
                  <TextField
                    value={formatDate(report.responseDate)}
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={{ ...readOnlyFieldStyles, width: '180px' }}
                  />
                </Box>
                <Box sx={fieldGroupStyles}>
                  <Typography sx={{ width: '160px', fontWeight: 600, fontSize: '13px' }}>Arrival Time:</Typography>
                  <TextField
                    value={formatDate(report.arrivalDate)}
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={{ ...readOnlyFieldStyles, width: '180px' }}
                  />
                </Box>
                <Box sx={fieldGroupStyles}>
                  <Typography sx={{ width: '160px', fontWeight: 600, fontSize: '13px' }}>Completion Time:</Typography>
                  <TextField
                    value={formatDate(report.completionDate)}
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={{ ...readOnlyFieldStyles, width: '180px' }}
                  />
                </Box>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Service Type Section */}
        <Box sx={{ mb: 2 }}>
          <Box sx={sectionHeaderStyles}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Build sx={{ color: theme.palette.primary.main, fontSize: '18px' }} />
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: theme.palette.primary.main }}>
                Type of Service
              </Typography>
            </Box>
            <IconButton 
              onClick={() => handleSectionToggle('serviceType')}
              sx={{ color: theme.palette.primary.main, p: 0.5 }}
              size="small"
            >
              {expandedSections.serviceType ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          </Box>
          
          <Collapse in={expandedSections.serviceType}>
            <Box sx={{ p: sectionPadding, backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <Box sx={fieldGroupStyles}>
                <Typography sx={{ width: labelWidth, fontWeight: 600, fontSize: '13px' }}>Service Type:</Typography>
                <TextField
                  value={report.serviceType?.[0]?.name || 'N/A'}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ ...readOnlyFieldStyles, width: '350px' }}
                />
                <Typography sx={{ width: '80px', fontWeight: 600, fontSize: '13px', ml: 1.5 }}>Remark:</Typography>
                <TextField
                  value={report.serviceTypeRemark || ''}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ ...readOnlyFieldStyles, width: remarkWidth }}
                />
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Comments Section */}
        <Box sx={{ mb: 2 }}>
          <Box sx={sectionHeaderStyles}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment sx={{ color: theme.palette.primary.main, fontSize: '18px' }} />
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: theme.palette.primary.main }}>
                Comments / Description of Problem
              </Typography>
            </Box>
            <IconButton 
              onClick={() => handleSectionToggle('comments')}
              sx={{ color: theme.palette.primary.main, p: 0.5 }}
              size="small"
            >
              {expandedSections.comments ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          </Box>
          
          <Collapse in={expandedSections.comments}>
            <Box sx={{ p: sectionPadding, backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <Box sx={fieldGroupStyles}>
                <Typography sx={{ width: labelWidth, fontWeight: 600, fontSize: '13px' }}>Issue Reported:</Typography>
                <TextField
                  value={report.issueReported?.[0]?.description || 'N/A'}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ ...readOnlyFieldStyles, width: '350px' }}
                />
                <Typography sx={{ width: '80px', fontWeight: 600, fontSize: '13px', ml: 1.5 }}>Remark:</Typography>
                <TextField
                  value={report.issueReportedRemark || ''}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ ...readOnlyFieldStyles, width: remarkWidth }}
                />
              </Box>
              
              <Box sx={fieldGroupStyles}>
                <Typography sx={{ width: labelWidth, fontWeight: 600, fontSize: '13px' }}>Issue Found:</Typography>
                <TextField
                  value={report.issueFound?.[0]?.description || 'N/A'}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ ...readOnlyFieldStyles, width: '350px' }}
                />
                <Typography sx={{ width: '80px', fontWeight: 600, fontSize: '13px', ml: 1.5 }}>Remark:</Typography>
                <TextField
                  value={report.issueFoundRemark || ''}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ ...readOnlyFieldStyles, width: remarkWidth }}
                />
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Action Taken Section */}
        <Box sx={{ mb: 2 }}>
          <Box sx={sectionHeaderStyles}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Build sx={{ color: theme.palette.primary.main, fontSize: '18px' }} />
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: theme.palette.primary.main }}>
                Action Taken
              </Typography>
            </Box>
            <IconButton 
              onClick={() => handleSectionToggle('actionTaken')}
              sx={{ color: theme.palette.primary.main, p: 0.5 }}
              size="small"
            >
              {expandedSections.actionTaken ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          </Box>
          
          <Collapse in={expandedSections.actionTaken}>
            <Box sx={{ p: sectionPadding, backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <Box sx={fieldGroupStyles}>
                <Typography sx={{ width: labelWidth, fontWeight: 600, fontSize: '13px' }}>Action Taken:</Typography>
                <TextField
                  value={report.actionTaken?.[0]?.description || 'N/A'}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ ...readOnlyFieldStyles, width: '350px' }}
                />
                <Typography sx={{ width: '80px', fontWeight: 600, fontSize: '13px', ml: 1.5 }}>Remark:</Typography>
                <TextField
                  value={report.actionTakenRemark || ''}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ ...readOnlyFieldStyles, width: remarkWidth }}
                />
              </Box>
            </Box>
          </Collapse>
        </Box>
        
        {/* Materials Used Section */}
        <Box sx={{ mb: 2 }}>
          <Box sx={sectionHeaderStyles}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory sx={{ color: theme.palette.primary.main, fontSize: '18px' }} />
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: theme.palette.primary.main }}>
                Materials Used
              </Typography>
            </Box>
            <IconButton 
              onClick={() => handleSectionToggle('materialsUsed')}
              sx={{ color: theme.palette.primary.main, p: 0.5 }}
              size="small"
            >
              {expandedSections.materialsUsed ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          </Box>
          
          <Collapse in={expandedSections.materialsUsed}>
            <Box sx={{ p: sectionPadding, backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              {report.materialsUsed && report.materialsUsed.length > 0 ? (
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                  <Table size="small" aria-label="materials used table">
                    <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '13px', width: '15%' }}>Quantity</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '13px', width: '55%' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '13px', width: '30%' }}>Serial No</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.materialsUsed.map((material, index) => (
                        <TableRow key={material.id || index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                          <TableCell sx={{ fontSize: '13px' }}>{material.quantity}</TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>{material.description || 'N/A'}</TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>{material.serialNo || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  No materials used for this service report.
                </Box>
              )}
            </Box>
          </Collapse>
        </Box>

        {/* Further Action Section */}
        <Box sx={{ mb: 2 }}>
          <Box sx={sectionHeaderStyles}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment sx={{ color: theme.palette.primary.main, fontSize: '18px' }} />
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: theme.palette.primary.main }}>
                Further Action
              </Typography>
            </Box>
            <IconButton 
              onClick={() => handleSectionToggle('furtherAction')}
              sx={{ color: theme.palette.primary.main, p: 0.5 }}
              size="small"
            >
              {expandedSections.furtherAction ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          </Box>
          
          <Collapse in={expandedSections.furtherAction}>
            <Box sx={{ p: sectionPadding, backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <Box sx={fieldGroupStyles}>
                <Typography sx={{ width: labelWidth, fontWeight: 600, fontSize: '13px' }}>Further Action:</Typography>
                <TextField
                  value={report.furtherActionTaken?.[0]?.description || 'N/A'}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ ...readOnlyFieldStyles, width: '350px' }}
                />
                <Typography sx={{ width: '80px', fontWeight: 600, fontSize: '13px', ml: 1.5 }}>Remark:</Typography>
                <TextField
                  value={report.furtherActionTakenRemark || ''}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ ...readOnlyFieldStyles, width: remarkWidth }}
                />
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Form Status Section */}
        <Box sx={{ mb: 2 }}>
          <Box sx={sectionHeaderStyles}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment sx={{ color: theme.palette.primary.main, fontSize: '18px' }} />
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: theme.palette.primary.main }}>
                Form Status
              </Typography>
            </Box>
            <IconButton 
              onClick={() => handleSectionToggle('formStatus')}
              sx={{ color: theme.palette.primary.main, p: 0.5 }}
              size="small"
            >
              {expandedSections.formStatus ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          </Box>
          
          <Collapse in={expandedSections.formStatus}>
            <Box sx={{ p: sectionPadding, backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <Box sx={fieldGroupStyles}>
                <Typography sx={{ width: labelWidth, fontWeight: 600, fontSize: '13px' }}>Status:</Typography>
                <TextField
                  value={report.formStatus?.[0]?.name || 'N/A'}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ ...readOnlyFieldStyles, width: '350px' }}
                />
                <Typography sx={{ width: '80px', fontWeight: 600, fontSize: '13px', ml: 1.5 }}>Remark:</Typography>
                <TextField
                  value={report.formStatusRemark || ''}
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ ...readOnlyFieldStyles, width: remarkWidth }}
                />
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Print Preview Dialog */}
        <Dialog
          open={printPreviewOpen}
          onClose={() => setPrintPreviewOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            <div dangerouslySetInnerHTML={{ __html: generatePrintHTML() }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPrintPreviewOpen(false)}>Cancel</Button>
            <Button onClick={handlePrintConfirm} variant="contained">
              Print
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default ServiceReportDetails;
