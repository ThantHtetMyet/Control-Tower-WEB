import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, TextField,
  CircularProgress, Alert, Dialog, DialogContent, DialogActions,
  Collapse, IconButton, Divider
} from '@mui/material';
import { 
  ArrowBack, Edit, Print, ExpandLess, ExpandMore, 
  Close, Info, Schedule, Build, Assignment 
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
    formStatus: true
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
          }
          .letterhead {
            border-bottom: 3px solid #800080;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-logo {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #FF6B35;
            margin-right: 20px;
          }
          .company-details {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
          }
          .report-title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #1976d2;
            margin: 20px 0;
          }
          .job-number {
            text-align: right;
            font-size: 14px;
            margin-bottom: 20px;
          }
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .field-row {
            display: flex;
            margin-bottom: 8px;
            align-items: center;
          }
          .field-label {
            font-weight: bold;
            width: 150px;
            margin-right: 10px;
          }
          .field-value {
            flex: 1;
            padding: 4px 8px;
          }
          .date-section {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          .date-field {
            text-align: center;
          }
          .date-label {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 5px;
          }
          .date-value {
            padding: 8px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
            font-size: 12px;
          }
          .comments-section {
            margin-top: 20px;
          }
          .comment-item {
            margin-bottom: 15px;
          }
          .remark-field {
            margin-left: 10px;
            width: 200px;
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

        <!-- Report Content -->
        <div class="report-title">Service Report Details</div>
        
        <div class="job-number">
          <strong>Job No: ${report.jobNumber || 'N/A'}</strong>
        </div>

        <!-- Basic Information -->
        <div class="section">
          <div class="section-title">Basic Information</div>
          <div class="field-row">
            <span class="field-label">Customer:</span>
            <span class="field-value">${report.customer || ''}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Project No:</span>
            <span class="field-value">${report.projectNumberName || ''}</span>
          </div>
          <div class="field-row">
            <span class="field-label">System:</span>
            <span class="field-value">${report.systemName || ''}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Location:</span>
            <span class="field-value">${report.locationName || ''}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Follow-up Action:</span>
            <span class="field-value">${report.followupActionNo || ''}</span>
          </div>
        </div>

        <!-- Date/Time Section -->
        <div class="section">
          <div class="section-title">Date / Time Information</div>
          <div class="date-section">
            <div class="date-field">
              <div class="date-label">Failure Detected</div>
              <div class="date-value">${formatDate(report.failureDetectedDate)}</div>
            </div>
            <div class="date-field">
              <div class="date-label">Response</div>
              <div class="date-value">${formatDate(report.responseDate)}</div>
            </div>
            <div class="date-field">
              <div class="date-label">Arrival</div>
              <div class="date-value">${formatDate(report.arrivalDate)}</div>
            </div>
            <div class="date-field">
              <div class="date-label">Completion</div>
              <div class="date-value">${formatDate(report.completionDate)}</div>
            </div>
          </div>
        </div>

        <!-- Type of Service -->
        <div class="section">
          <div class="section-title">Type of Service</div>
          <div class="field-row">
            <span class="field-label">Service Type:</span>
            <span class="field-value">${report.serviceType?.[0]?.name || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Remark:</span>
            <span class="field-value">${report.serviceTypeRemark || ''}</span>
          </div>
        </div>

        <!-- Comments -->
        <div class="section">
          <div class="section-title">Comments / Description of Problem</div>
          <div class="field-row">
            <span class="field-label">Issue Reported:</span>
            <span class="field-value">${report.issueReported?.[0]?.description || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Remark:</span>
            <span class="field-value">${report.issueReportedRemark || ''}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Issue Found:</span>
            <span class="field-value">${report.issueFound?.[0]?.description || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Remark:</span>
            <span class="field-value">${report.issueFoundRemark || ''}</span>
          </div>
        </div>

        <!-- Action Taken -->
        <div class="section">
          <div class="section-title">Action Taken</div>
          <div class="field-row">
            <span class="field-label">Action Taken:</span>
            <span class="field-value">${report.actionTaken?.[0]?.description || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Remark:</span>
            <span class="field-value">${report.actionTakenRemark || ''}</span>
          </div>
        </div>

        <!-- Further Action -->
        <div class="section">
          <div class="section-title">Further Action</div>
          <div class="field-row">
            <span class="field-label">Further Action:</span>
            <span class="field-value">${report.furtherActionTaken?.[0]?.description || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Remark:</span>
            <span class="field-value">${report.furtherActionTakenRemark || ''}</span>
          </div>
        </div>

        <!-- Form Status -->
        <div class="section">
          <div class="section-title">Form Status</div>
          <div class="field-row">
            <span class="field-label">Status:</span>
            <span class="field-value">${report.formStatus?.[0]?.name || 'N/A'}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Remark:</span>
            <span class="field-value">${report.formStatusRemark || ''}</span>
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
          onClick={() => navigate('/service-reports')}
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
          onClick={() => navigate('/service-reports')}
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
              onClick={() => navigate('/service-reports')}
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