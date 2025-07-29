import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload,
  Download,
  Visibility,
  CheckCircle,
  Error,
  Warning
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import api from '../api-services/api';

const ServiceReportImport = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);

  // Template structure for Excel file
  const templateColumns = [
    'ServiceType',
    'FormStatus',
    'IssueReported',
    'IssueFound',
    'ActionTaken',
    'FurtherAction',
    'ReportDate',
    'CreatedBy'
  ];

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        setData(jsonData);
        setLoading(false);
      } catch (error) {
        console.error('Error reading file:', error);
        setLoading(false);
        alert('Error reading file. Please ensure it\'s a valid Excel file.');
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const validateData = (rowData) => {
    const errors = [];
    const warnings = [];

    // Required fields validation
    if (!rowData.ServiceType) errors.push('ServiceType is required');
    if (!rowData.FormStatus) errors.push('FormStatus is required');
    if (!rowData.ReportDate) errors.push('ReportDate is required');
    if (!rowData.CreatedBy) errors.push('CreatedBy is required');

    // Date validation
    if (rowData.ReportDate && isNaN(new Date(rowData.ReportDate))) {
      errors.push('Invalid ReportDate format');
    }

    return { errors, warnings };
  };

  const handleImport = async () => {
    if (data.length === 0) {
      alert('No data to import');
      return;
    }

    setImporting(true);
    const importResults = {
      successful: 0,
      failed: 0,
      errors: []
    };

    try {
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const validation = validateData(row);
        
        if (validation.errors.length > 0) {
          importResults.failed++;
          importResults.errors.push({
            row: i + 1,
            errors: validation.errors
          });
          continue;
        }

        try {
          // Transform data to match API format
          const serviceReportData = {
            serviceTypes: [{ id: row.ServiceType }],
            formStatus: { id: row.FormStatus },
            issueReported: row.IssueReported ? [{ id: row.IssueReported }] : [],
            issueFound: row.IssueFound ? [{ id: row.IssueFound }] : [],
            actionTaken: row.ActionTaken ? [{ id: row.ActionTaken }] : [],
            furtherAction: row.FurtherAction ? [{ id: row.FurtherAction }] : [],
            reportDate: new Date(row.ReportDate).toISOString(),
            createdBy: row.CreatedBy
          };

          await api.post('/ServiceReport', serviceReportData);
          importResults.successful++;
        } catch (apiError) {
          importResults.failed++;
          importResults.errors.push({
            row: i + 1,
            errors: [`API Error: ${apiError.response?.data?.message || apiError.message}`]
          });
        }
      }
    } catch (error) {
      console.error('Import error:', error);
    }

    setResults(importResults);
    setImporting(false);
  };

  const downloadTemplate = () => {
    const templateData = [templateColumns.reduce((obj, col) => {
      obj[col] = '';
      return obj;
    }, {})];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ServiceReports');
    XLSX.writeFile(workbook, 'ServiceReport_Template.xlsx');
  };

  const resetImport = () => {
    setFile(null);
    setData([]);
    setResults(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Import Service Reports
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadTemplate}
          >
            Download Template
          </Button>
          
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUpload />}
            disabled={loading || importing}
          >
            Upload Excel File
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </Button>

          {data.length > 0 && (
            <>
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => setPreviewOpen(true)}
              >
                Preview Data ({data.length} rows)
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleImport}
                disabled={importing}
              >
                {importing ? 'Importing...' : 'Import Data'}
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                onClick={resetImport}
              >
                Reset
              </Button>
            </>
          )}
        </Box>

        {loading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Reading file...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {importing && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Importing data...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {file && (
          <Alert severity="info" sx={{ mb: 2 }}>
            File selected: {file.name} ({data.length} rows detected)
          </Alert>
        )}

        {results && (
          <Alert 
            severity={results.failed === 0 ? "success" : "warning"} 
            sx={{ mb: 2 }}
          >
            Import completed: {results.successful} successful, {results.failed} failed
            {results.errors.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  Errors:
                </Typography>
                {results.errors.slice(0, 5).map((error, index) => (
                  <Typography key={index} variant="body2">
                    Row {error.row}: {error.errors.join(', ')}
                  </Typography>
                ))}
                {results.errors.length > 5 && (
                  <Typography variant="body2">
                    ... and {results.errors.length - 5} more errors
                  </Typography>
                )}
              </Box>
            )}
          </Alert>
        )}
      </Paper>

      {/* Data Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Data Preview</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {templateColumns.map((column) => (
                    <TableCell key={column}>{column}</TableCell>
                  ))}
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(0, 100).map((row, index) => {
                  const validation = validateData(row);
                  const hasErrors = validation.errors.length > 0;
                  
                  return (
                    <TableRow key={index}>
                      {templateColumns.map((column) => (
                        <TableCell key={column}>
                          {row[column] || '-'}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Chip
                          icon={hasErrors ? <Error /> : <CheckCircle />}
                          label={hasErrors ? 'Error' : 'Valid'}
                          color={hasErrors ? 'error' : 'success'}
                          size="small"
                        />
                        {hasErrors && (
                          <Tooltip title={validation.errors.join(', ')}>
                            <IconButton size="small">
                              <Warning fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {data.length > 100 && (
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Showing first 100 rows of {data.length} total rows
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServiceReportImport;