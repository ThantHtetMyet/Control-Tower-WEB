import React, { useState, useEffect } from 'react';
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
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField
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
  
  // New states for import form type
  const [importFormTypes, setImportFormTypes] = useState([]);
  const [selectedImportFormType, setSelectedImportFormType] = useState('');
  const [loadingFormTypes, setLoadingFormTypes] = useState(true);

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

  // Load import form types on component mount
  useEffect(() => {
    loadImportFormTypes();
  }, []);

  const loadImportFormTypes = async () => {
    try {
      setLoadingFormTypes(true);
      const response = await api.get('/ImportFormTypes');
      setImportFormTypes(response.data);
    } catch (error) {
      console.error('Error loading import form types:', error);
      alert('Error loading import form types. Please try again.');
    } finally {
      setLoadingFormTypes(false);
    }
  };

  const [uploadedFileId, setUploadedFileId] = useState(null);

  // Modified file upload to use FileUpload API
  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
  
    console.log('=== FILE UPLOAD DEBUG START ===');
    console.log('Selected file:', selectedFile);
    console.log('File name:', selectedFile.name);
    console.log('File size:', selectedFile.size);
    console.log('File type:', selectedFile.type);
    console.log('Selected import form type:', selectedImportFormType);
  
    if (!selectedImportFormType) {
      console.log('ERROR: No import form type selected');
      alert('Please select an import form type first.');
      return;
    }
  
    setFile(selectedFile);
    setLoading(true);
  
    try {
      // Step 1: Upload file via FileUpload API
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('importFormTypeId', selectedImportFormType);
      
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      console.log('Making API call to ImportFileRecords/ProcessImportData...');
      // In handleFileUpload function, replace the API call with:
      const uploadResponse = await api.post('/ImportFileRecords/ProcessImportData', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', uploadResponse);
      console.log('Upload response data:', uploadResponse.data);
      console.log('File ID from response:', uploadResponse.data.fileId);
  
      setUploadedFileId(uploadResponse.data.fileId);
  
      // Step 2: Read and parse the Excel file for preview
      console.log('Starting Excel file parsing...');
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('FileReader onload triggered');
        const data = new Uint8Array(e.target.result);
        console.log('File data length:', data.length);
        
        const workbook = XLSX.read(data, { type: 'array' });
        console.log('Workbook:', workbook);
        console.log('Sheet names:', workbook.SheetNames);
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('Parsed JSON data:', jsonData);
        console.log('Number of rows:', jsonData.length);
        
        setData(jsonData);
        setLoading(false);
        console.log('=== FILE UPLOAD DEBUG END (SUCCESS) ===');
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        setLoading(false);
      };
      
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.log('=== FILE UPLOAD DEBUG END (ERROR) ===');
      console.error('File upload error details:');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      console.error('Error config:', error.config);
      
      alert(`File upload failed: ${error.response?.data?.message || error.message}. Check console for details.`);
      setLoading(false);
    }
  };

  // Modified import function
  const handleImport = async () => {
    if (data.length === 0) {
      alert('No data to import');
      return;
    }

    if (!uploadedFileId) {
      alert('Please upload a file first.');
      return;
    }

    setImporting(true);
    const importResults = {
      successful: 0,
      failed: 0,
      errors: []
    };

    try {
      // Get the selected import form type details
      const selectedFormType = importFormTypes.find(type => type.id === selectedImportFormType);
      const importFormTypeName = selectedFormType?.name || 'Location';
      
      // Process data based on import type
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        try {
          let apiEndpoint;
          let requestData;
          
          // Route to appropriate API based on import type
          switch (importFormTypeName) {
            case 'Location':
              apiEndpoint = '/LocationWarehouse';
              requestData = {
                name: row.Name,
                isDeleted: false,
                createdDate: new Date().toISOString(),
                updatedDate: new Date().toISOString()
              };
              break;
            case 'IssueReported':
              apiEndpoint = '/IssueReportWarehouse';
              requestData = {
                name: row.Name,
                isDeleted: false,
                createdDate: new Date().toISOString(),
                updatedDate: new Date().toISOString()
              };
              break;
            // Add other cases as needed
            default:
              throw new Error(`Unsupported import type: ${importFormTypeName}`);
          }

          await api.post(apiEndpoint, requestData);
          importResults.successful++;
        } catch (error) {
          importResults.failed++;
          importResults.errors.push({
            row: i + 1,
            errors: [error.response?.data?.message || 'Import failed']
          });
        }
      }

      // Step 3: Update ImportFileRecord status via ImportFileRecords API
      const importStatus = importResults.failed === 0 ? 'Completed' : 'Partial';
      await api.put(`/ImportFileRecords/${uploadedFileId}`, {
        importFormTypeID: selectedImportFormType,
        name: file.name,
        importedStatus: importStatus,
        updatedBy: 'current-user-id' // You'll need to get this from auth context
      });

    } catch (error) {
      console.error('Import error:', error);
      
      // Update file record as failed
      if (uploadedFileId) {
        try {
          await api.put(`/ImportFileRecords/${uploadedFileId}`, {
            importFormTypeID: selectedImportFormType,
            name: file.name,
            importedStatus: 'Failed',
            updatedBy: 'current-user-id'
          });
        } catch (updateError) {
          console.error('Failed to update file record:', updateError);
        }
      }
      
      alert('Import failed. Please try again.');
    } finally {
      setImporting(false);
      setResults(importResults);
    }
  };

  // Replace the hardcoded templateColumns with a dynamic function
  const getTemplateColumns = (importFormTypeName) => {
    switch (importFormTypeName) {
      case 'Location':
        return ['Name'];
      case 'IssueReported':
        return ['Name'];
      case 'ServiceReportForm':
        return [
          'ServiceType',
          'FormStatus',
          'IssueReported', 
          'IssueFound',
          'ActionTaken',
          'FurtherAction',
          'ReportDate',
          'CreatedBy'
        ];
      default:
        return ['Name']; // Default fallback
    }
  };
  
  // Update the validateData function to be dynamic
  const validateData = (rowData, importFormTypeName) => {
    const errors = [];
    const warnings = [];
  
    switch (importFormTypeName) {
      case 'Location':
      case 'IssueReported':
        if (!rowData.Name) errors.push('Name is required');
        break;
      case 'ServiceReportForm':
        if (!rowData.ServiceType) errors.push('ServiceType is required');
        if (!rowData.FormStatus) errors.push('FormStatus is required');
        if (!rowData.ReportDate) errors.push('ReportDate is required');
        if (!rowData.CreatedBy) errors.push('CreatedBy is required');
        
        if (rowData.ReportDate && isNaN(new Date(rowData.ReportDate))) {
          errors.push('Invalid ReportDate format');
        }
        break;
    }
  
    return { errors, warnings };
  };


  const downloadTemplate = () => {
    if (!selectedImportFormType) {
      alert('Please select an import form type first.');
      return;
    }
    
    const selectedFormType = importFormTypes.find(type => type.id === selectedImportFormType);
    const importFormTypeName = selectedFormType?.name || 'Location';
    const columns = getTemplateColumns(importFormTypeName);
    
    const templateData = [columns.reduce((obj, col) => {
      obj[col] = '';
      return obj;
    }, {})];
  
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, importFormTypeName);
    XLSX.writeFile(workbook, `${importFormTypeName}_Template.xlsx`);
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
        {/* Import Form Type Selection */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              select
              label="Import Form Type"
              value={selectedImportFormType}
              onChange={(e) => setSelectedImportFormType(e.target.value)}
              required
              disabled={loadingFormTypes}
              sx={{
                minWidth: '300px'
              }}
            >
              <MenuItem value="" disabled>
                <em style={{ color: '#9e9e9e' }}>Select a form type</em>
              </MenuItem>
              {importFormTypes.map((formType) => (
                <MenuItem key={formType.id} value={formType.id}>
                  {formType.name}
                </MenuItem>
              ))}
            </TextField>
            {loadingFormTypes && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Loading form types...
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* File Upload Section */}
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
            disabled={loading || importing || !selectedImportFormType}
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

        {/* Show selected import form type */}
        {selectedImportFormType && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Selected Import Form Type: {importFormTypes.find(ft => ft.id === selectedImportFormType)?.name}
          </Alert>
        )}

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
                  {(() => {
                    const selectedFormType = importFormTypes.find(type => type.id === selectedImportFormType);
                    const importFormTypeName = selectedFormType?.name || 'Location';
                    const columns = getTemplateColumns(importFormTypeName);
                    
                    return columns.map((column) => (
                      <TableCell key={column}>{column}</TableCell>
                    ));
                  })()}
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(0, 100).map((row, index) => {
                  const selectedFormType = importFormTypes.find(type => type.id === selectedImportFormType);
                  const importFormTypeName = selectedFormType?.name || 'Location';
                  const columns = getTemplateColumns(importFormTypeName);
                  const validation = validateData(row, importFormTypeName);
                  const hasErrors = validation.errors.length > 0;
                  
                  return (
                    <TableRow key={index}>
                      {columns.map((column) => (
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
