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
import { Videocam as VideocamIcon, CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import yesNoStatusService from '../../../api-services/yesNoStatusService';
import { getReportFormImageTypes } from '../../../api-services/reportFormService';

const WillowlynxSumpPitCCTVCamera = ({ data, onDataChange, onStatusChange }) => {
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
        const sumpPitImageType = imageTypes.find(type => type.imageTypeName === 'WillowlynxSumpPitCCTVCamera');
        if (sumpPitImageType) {
          setImageTypeId(sumpPitImageType.id || sumpPitImageType.ID);
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
        result, 
        remarks,
        image: uploadedImage,
        imageTypeId: imageTypeId
      });
    }
  }, [result, remarks, uploadedImage, imageTypeId, onDataChange]);

  // Check completion status
  useEffect(() => {
    const isCompleted = result && remarks.trim() !== '';
    if (onStatusChange) onStatusChange('WillowlynxSumpPitCCTVCamera', isCompleted);
  }, [result, remarks, onStatusChange]);

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

  const inlineField = {
    minWidth: 200,
    '& .MuiOutlinedInput-root': { backgroundColor: 'white' },
  };

  return (
    <Paper sx={sectionContainerStyle}>
      {/* Header */}
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <VideocamIcon /> Willowlynx Sump Pit CCTV Camera Check
      </Typography>

      <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
        Click the CCTV buttons from PLUMB-SAN page, make sure the player window for
        each camera can be played.
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
                borderRadius: '8px',
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
              id="willowlynx-sump-pit-cctv-image-upload"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="willowlynx-sump-pit-cctv-image-upload">
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
              Upload a screenshot of the CCTV camera player window
            </Typography>
          </Box>
        )}
      </Box>

      {/* Result */}
      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
        Result:
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, ml: 2, mb: 2 }}>
        <Typography>All CCTV cameras can be played without issues. </Typography>
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
          placeholder="Enter any observations about CCTV camera functionality, video quality, or playback issues..."
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default WillowlynxSumpPitCCTVCamera;
