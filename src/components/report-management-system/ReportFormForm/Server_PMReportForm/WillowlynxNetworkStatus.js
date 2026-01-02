import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
  Button,
  IconButton,
} from '@mui/material';
import { NetworkCheck as NetworkCheckIcon, CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import yesNoStatusService from '../../../api-services/yesNoStatusService';
import { getReportFormImageTypes } from '../../../api-services/reportFormService';

const WillowlynxNetworkStatus = ({ data, onDataChange, onStatusChange }) => {
  const [dateChecked, setDateChecked] = useState(null);
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageTypeId, setImageTypeId] = useState(null);
  const isInitialized = useRef(false);

  // Initialize data once
  useEffect(() => {
    if (data && !isInitialized.current) {
      if (data.dateChecked) setDateChecked(new Date(data.dateChecked));
      if (data.result) setResult(data.result);
      if (data.remarks) setRemarks(data.remarks);
      if (data.image) {
        setUploadedImage(data.image);
        if (data.image instanceof File) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result);
          };
          reader.readAsDataURL(data.image);
        } else if (data.image.imageUrl) {
          setImagePreview(data.image.imageUrl);
        }
      }
      isInitialized.current = true;
    }
  }, [data]);

  // Fetch Yes/No options and Image Types
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const yesNoResponse = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(yesNoResponse || []);
        
        const imageTypes = await getReportFormImageTypes();
        const networkStatusImageType = imageTypes.find(type => type.imageTypeName === 'WillowlynxNetworkStatus');
        if (networkStatusImageType) {
          setImageTypeId(networkStatusImageType.id || networkStatusImageType.ID);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    }
  };

  // Handle image removal
  const handleImageRemove = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  // Notify parent of data change
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      onDataChange({ 
        dateChecked, 
        result, 
        remarks,
        image: uploadedImage,
        imageTypeId: imageTypeId
      });
    }
  }, [dateChecked, result, remarks, uploadedImage, imageTypeId, onDataChange]);

  // Check completion status
  useEffect(() => {
    const isCompleted = dateChecked && result && remarks.trim() !== '';
    if (onStatusChange) onStatusChange('WillowlynxNetworkStatus', isCompleted);
  }, [dateChecked, result, remarks, onStatusChange]);

  // Styles
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

  const labelBox = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 2,
  };

  const inlineField = {
    minWidth: 200,
    '& .MuiOutlinedInput-root': { backgroundColor: 'white' },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={sectionContainerStyle}>
        {/* Header */}
        <Typography variant="h5" sx={sectionHeaderStyle}>
          <NetworkCheckIcon /> Willowlynx Network Status Check
        </Typography>

        {/* Instructions */}
        
        <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
          Check the system overview page, see if all servers, switches, RTUs are green.
        </Typography>

        {/* Image Upload Section */}
        <Box sx={{ mb: 3 }}>
          {imagePreview ? (
            <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <img
                src={imagePreview}
                alt="Uploaded Screenshot"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
              <IconButton
                onClick={handleImageRemove}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  }
                }}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ 
              border: '2px dashed #ccc', 
              borderRadius: '4px', 
              p: 3, 
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="willowlynx-network-status-image-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="willowlynx-network-status-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 1 }}
                >
                  Upload Screenshot
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Upload a screenshot of the system overview page
              </Typography>
            </Box>
          )}
        </Box>

        {/* Result */}
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Result:
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, ml: 2, mb: 2 }}>
          <Typography>All servers, switches, and RTU are green.</Typography>
          <TextField
            select
            size="small"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            variant="outlined"
            disabled={loading}
            sx={inlineField}
          >
            <MenuItem value="">
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  Loading...
                </Box>
              ) : (
                'Select Result'
              )}
            </MenuItem>
            {yesNoStatusOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Remarks Section */}
        <Box sx={{ marginTop: 3 }}>
          <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
            📝 Remarks
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter any additional remarks or observations..."
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              }
            }}
          />
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default WillowlynxNetworkStatus;
