import React, { useState, useEffect, useCallback } from 'react';
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
  AlertTitle,
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
  TextField,
  Container,
  CircularProgress
} from '@mui/material';
import { 
  FiDownload, 
  FiUploadCloud, 
  FiEye, 
  FiCheckCircle, 
  FiXCircle,
  FiAlertTriangle
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import api from '../api-services/api';
import mqtt from 'mqtt';
import { useNavigate } from 'react-router-dom';

const ServiceReportImport = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedImportFormType, setSelectedImportFormType] = useState('');
  const [importFormTypes, setImportFormTypes] = useState([]);
  const [loadingFormTypes, setLoadingFormTypes] = useState(true);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [mqttClient, setMqttClient] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [processingError, setProcessingError] = useState('');
  const [statusTimestamp, setStatusTimestamp] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Load import form types on component mount
  useEffect(() => {
    const loadImportFormTypes = async () => {
      try {
        setLoadingFormTypes(true);
        const response = await api.get('/ImportFormTypes');
        console.log('Import form types response:', response.data);
        
        if (response.data && Array.isArray(response.data.data)) {
          setImportFormTypes(response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          setImportFormTypes(response.data);
        } else {
          console.warn('Unexpected response format for import form types:', response.data);
          setImportFormTypes([]);
        }
      } catch (error) {
        console.error('Error loading import form types:', error);
        setImportFormTypes([]);
      } finally {
        setLoadingFormTypes(false);
      }
    };

    loadImportFormTypes();
  }, []);

  // Cleanup MQTT connection on unmount
  useEffect(() => {
    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, [mqttClient]);

  // MQTT message handler
  const handleMqttMessage = useCallback((topic, message) => {
    console.log('MQTT Message received:', { topic, message });
    
    if (topic === 'servicereportsystem/status') {
      try {
        const statusData = JSON.parse(message.toString());
        console.log('Status data:', statusData);
        
        // Log the fileId comparison for debugging (but don't use it for processing)
        if (statusData.fileId && uploadedFileId) {
          const normalizeId = (id) => String(id).replace(/[""']/g, '').trim();
          const mqttFileId = normalizeId(statusData.fileId);
          const uploadedId = normalizeId(uploadedFileId);
          
          console.log('FileId comparison (for debugging only):', {
            mqttFileId,
            uploadedId,
            match: mqttFileId === uploadedId,
            originalMqttFileId: statusData.fileId,
            originalUploadedFileId: uploadedFileId
          });
        }
        
        // Process ANY success/failure message (no fileId check)
        if (statusData.status === 'success') {
          console.log('Processing completed successfully!');
          setProcessingStatus('Processing completed successfully!');
          setProcessingError('');
          
          // Hide loading overlay and show success dialog immediately
          setProcessing(false);
          setShowSuccessDialog(true);
        } else if (statusData.status === 'failed') {
          console.log('Processing failed!');
          setProcessingStatus('Processing failed');
          setProcessingError(statusData.error || 'Unknown error occurred');
          
          // Hide loading overlay after showing error
          setTimeout(() => {
            setProcessing(false);
            setProcessingStatus('');
            setProcessingError('');
          }, 5000);
        }
      } catch (error) {
        console.error('Error parsing MQTT status message:', error);
      }
    }
  }, [uploadedFileId]);

  const connectToMqtt = () => {
    try {
      console.log('Connecting to MQTT...');
      // Change from mqtt:// to ws:// for WebSocket connection
      const client = mqtt.connect('ws://192.3.71.120:9001');
      
      client.on('connect', () => {
        console.log('Connected to MQTT broker');
        const topic = 'servicereportsystem/status';
        console.log('Subscribing to topic:', topic);
        client.subscribe(topic);
      });
      
      client.on('message', handleMqttMessage);
      
      client.on('error', (error) => {
        console.error('MQTT connection error:', error);
      });
      
      setMqttClient(client);
    } catch (error) {
      console.error('Error connecting to MQTT:', error);
    }
  };

  const handleConfirmUpload = async () => {
    if (!file || !selectedImportFormType) {
      alert('Please select a file and import form type.');
      return;
    }

    try {
      setLoading(true);
      setProcessing(true);
      setProcessingStatus('Uploading file and starting processing...');
      setProcessingError('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('importFormTypeId', selectedImportFormType);
      
      console.log('Making API call to ImportFileRecords/ProcessImportData...');
      const uploadResponse = await api.post('/ImportFileRecords/ProcessImportData', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', uploadResponse.data);
      
      // Replace line 189:
      if (uploadResponse.data && uploadResponse.data.fileId) {
        const fileId = uploadResponse.data.fileId;
        setUploadedFileId(fileId);
        setProcessingStatus('File uploaded successfully. Processing in progress...');
        
        // Connect to MQTT to listen for status updates
        connectToMqtt();
        
        // Close dialogs
        setConfirmOpen(false);
        setPreviewOpen(false);
      } else {
        throw new Error(uploadResponse.data?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('File upload error:', error);
      setProcessing(false);
      setProcessingStatus('');
      setProcessingError('');
      alert(`File upload failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (!selectedImportFormType) {
      alert('Please select an import form type first.');
      return;
    }

    setFile(selectedFile);
    setLoading(true);
    setProcessingStatus(null);
    setStatusTimestamp(null);
    setResults(null);
    setData([]);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        setData(jsonData);
        setLoading(false);
        setConfirmOpen(true);
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        setLoading(false);
        alert('Error reading file. Please try again.');
      };
      
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error('File processing error:', error);
      alert('Error processing file. Please try again.');
      setLoading(false);
    }
  };

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
          'LocationName',
          'ProjectNo',
          'SystemName',
          'Status',
          'FurtherAction'
        ];
      default:
        return ['Name'];
    }
  };

  const validateData = (rowData, importFormTypeName) => {
    const errors = [];
    const columns = getTemplateColumns(importFormTypeName);
    
    columns.forEach(column => {
      if (!rowData[column] || rowData[column].toString().trim() === '') {
        errors.push(`${column} is required`);
      }
    });
    
    return errors;
  };

  const downloadTemplate = () => {
    if (!selectedImportFormType) {
      alert('Please select an import form type first.');
      return;
    }
    
    const selectedFormType = importFormTypes.find(type => type.id === selectedImportFormType);
    const importFormTypeName = selectedFormType?.name || 'Template';
    const columns = getTemplateColumns(importFormTypeName);
    
    const worksheet = XLSX.utils.aoa_to_sheet([columns]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, `${importFormTypeName}_Template.xlsx`);
  };

  const resetImport = () => {
    setFile(null);
    setData([]);
    setResults(null);
    setUploadedFileId(null);
    setProcessingStatus(null);
    setStatusTimestamp(null);
    if (mqttClient) {
      mqttClient.end();
      setMqttClient(null);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessDialog(false);
    resetImport();
    navigate('/service-report-system');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Processing Overlay */}
      {processing && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            flexDirection: 'column'
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 4,
              textAlign: 'center',
              minWidth: 400,
              maxWidth: 600,
              backgroundColor: 'white'
            }}
          >
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Processing Import File
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {processingStatus || 'Please wait while we process your file...'}
            </Typography>
            {processingError && (
              <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
                <AlertTitle>Processing Error</AlertTitle>
                {processingError}
              </Alert>
            )}
          </Paper>
        </Box>
      )}

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={handleSuccessOk}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FiCheckCircle color="success" />
            Import Successful
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Your file has been processed successfully! All data has been imported into the system.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSuccessOk}
            autoFocus
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Import Service Reports
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
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
                {importFormTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
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

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            {/*
            <Button
              variant="outlined"
              startIcon={<FiDownload />}
              onClick={downloadTemplate}
              disabled={!selectedImportFormType}
            >
              Download Template
            </Button>
            */}
            <Button
              variant="contained"
              component="label"
              startIcon={<FiUploadCloud />}
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

            
          </Box>

          {selectedImportFormType && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Selected import type: {importFormTypes.find(type => type.id === selectedImportFormType)?.name || 'Unknown'}
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
                Processing uploaded file...
              </Typography>
              <LinearProgress />
            </Box>
          )}

          {processingStatus && !processing && (
            <Alert
              severity={
                String(processingStatus).toLowerCase() === 'success' ? 'success'
                : String(processingStatus).toLowerCase() === 'failed' ? 'error'
                : String(processingStatus).toLowerCase() === 'completed' ? 'success'
                : 'info'
              }
              sx={{ mb: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1">
                  Processing Status: {processingStatus}
                </Typography>
                {statusTimestamp && (
                  <Typography variant="caption" color="text.secondary">
                    {new Date(statusTimestamp).toLocaleTimeString()}
                  </Typography>
                )}
              </Box>
            </Alert>
          )}
        </Paper>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Upload</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Are you sure you want to upload this file?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              File: <strong>{file?.name}</strong>
            </Typography>
            {selectedImportFormType && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Import Type: <strong>{importFormTypes.find(type => type.id === selectedImportFormType)?.name}</strong>
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              The system will upload the file, process it, and report status via MQTT.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmUpload}
              disabled={loading || importing}
            >
              Upload
            </Button>
          </DialogActions>
        </Dialog>

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
                      if (data.length > 0) {
                        return Object.keys(data[0]).map((key) => (
                          <TableCell key={key}>{key}</TableCell>
                        ));
                      }
                      return null;
                    })()}
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.slice(0, 100).map((row, index) => {
                    const selectedFormType = importFormTypes.find(type => type.id === selectedImportFormType);
                    const importFormTypeName = selectedFormType?.name || 'Location';
                    const errors = validateData(row, importFormTypeName);
                    
                    return (
                      <TableRow key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {value !== null && value !== undefined ? String(value) : ''}
                          </TableCell>
                        ))}
                        <TableCell>
                          {errors.length === 0 ? (
                            <Chip icon={<FiCheckCircle />} label="Valid" color="success" size="small" />
                          ) : (
                            <Tooltip title={errors.join(', ')}>
                              <Chip icon={<FiXCircle />} label="Invalid" color="error" size="small" />
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
    </Container>
  );
};

export default ServiceReportImport;