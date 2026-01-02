import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Paper,
  CircularProgress,
  Button,
  IconButton,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import yesNoStatusService from '../../../api-services/yesNoStatusService';
import { getReportFormImageTypes } from '../../../api-services/reportFormService';
import { API_BASE_URL } from '../../../../config/apiConfig';

const WillowlynxSumpPitCCTVCamera_Edit = ({ data, onDataChange, onStatusChange, images = [] }) => {
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageTypeId, setImageTypeId] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [existingImageId, setExistingImageId] = useState(null); // Preserve ID even after clearing existingImage
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data when meaningful data is available
  useEffect(() => {
    // Check if we have meaningful data to initialize with
    const hasData = data && (
      (data.pmServerWillowlynxCCTVCameras && data.pmServerWillowlynxCCTVCameras.length > 0) ||
      (data.result && data.result.trim() !== '') || 
      (data.remarks && data.remarks.trim() !== '')
    );
    
    // Only initialize once
    if (isInitialized.current) return;
    
    if (hasData) {
      // Handle new API structure with pmServerWillowlynxCCTVCameras
      if (data.pmServerWillowlynxCCTVCameras && data.pmServerWillowlynxCCTVCameras.length > 0) {
        const cctvCameraData = data.pmServerWillowlynxCCTVCameras[0];
        
        if (cctvCameraData.yesNoStatusID) setResult(cctvCameraData.yesNoStatusID);
        if (cctvCameraData.remarks) setRemarks(cctvCameraData.remarks);
      }
      // Handle legacy data structure
      else {
        if (data.result) setResult(data.result);
        if (data.remarks) setRemarks(data.remarks);
      }
    }
    
    // Initialize existing image from props (only first image, limit to one)
    // Only initialize if we haven't already set an image and it's not deleted
    if (images && images.length > 0 && !existingImage && !isImageDeleted && !uploadedImage) {
      const firstImage = images[0];
      setExistingImage(firstImage);
      setExistingImageId(firstImage.id || firstImage.ID || null); // Preserve the ID
      const reportFormId = data?.reportFormId || data?.reportFormID;
      const imageUrl = firstImage.imageUrl || 
        (firstImage.imageName && reportFormId ? 
          `${API_BASE_URL}/api/ReportFormImage/image/${reportFormId}/${firstImage.imageName}` : 
          null);
      if (imageUrl) {
        setImagePreview(imageUrl);
      }
    }
    
    // Always mark as initialized after first render, even if no data
    // This ensures onDataChange will be called when user fills in data
    isInitialized.current = true;
  }, [data, images]);

  // Fetch YesNoStatus options and Image Types
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch Yes/No status options
        const statusResponse = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(statusResponse || []);
        
        // Fetch Image Types and find the specific type
        const imageTypes = await getReportFormImageTypes();
        const cctvCameraImageType = imageTypes?.find(
          type => type.imageTypeName === 'WillowlynxSumpPitCCTVCamera'
        );
        if (cctvCameraImageType) {
          setImageTypeId(cctvCameraImageType.id || cctvCameraImageType.ID);
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
      // If there's an existing image, mark it for deletion
      if (existingImage && !isImageDeleted) {
        setIsImageDeleted(true);
      }
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
    if (existingImage && !uploadedImage) {
      // Remove existing image - mark for deletion
      // IMPORTANT: Preserve existingImageId before clearing existingImage
      setIsImageDeleted(true);
      setExistingImage(null);
      setImagePreview(null);
      // Keep existingImageId so we can delete it later
    } else {
      // Remove newly uploaded image
      setUploadedImage(null);
      setImagePreview(null);
      // If there was an existing image that was marked for deletion, restore it
      if (isImageDeleted && images && images.length > 0) {
        setIsImageDeleted(false);
        const firstImage = images[0];
        setExistingImage(firstImage);
        setExistingImageId(firstImage.id || firstImage.ID || null);
        const reportFormId = data?.reportFormId || data?.reportFormID;
        const imageUrl = firstImage.imageUrl || 
          (firstImage.imageName && reportFormId ? 
            `${API_BASE_URL}/api/ReportFormImage/image/${reportFormId}/${firstImage.imageName}` : 
            null);
        if (imageUrl) {
          setImagePreview(imageUrl);
        }
      }
    }
  };

  // Notify parent of data change
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      const dataToSend = {
        pmServerWillowlynxCCTVCameras: [{
          yesNoStatusID: result,
          remarks: remarks
        }],
        // Legacy format for backward compatibility
        result: result,
        remarks: remarks,
        image: uploadedImage,
        imageTypeId: imageTypeId,
        existingImageId: existingImageId || existingImage?.id || existingImage?.ID || null, // Use preserved ID first
        existingImageUrl: existingImage?.imageUrl || null,
        isImageDeleted: isImageDeleted
      };
      
      onDataChange(dataToSend);
    }
  }, [result, remarks, uploadedImage, imageTypeId, existingImage, existingImageId, isImageDeleted, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const isCompleted = result !== '' && remarks && remarks.trim() !== '';
    
    if (onStatusChange) {
      onStatusChange('WillowlynxSumpPitCCTVCamera', isCompleted);
    }
  }, [result, remarks]); // Remove onStatusChange from dependency array

  // Styling
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
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <VideocamIcon /> Willowlynx Sump Pit CCTV Camera Check
      </Typography>
      
      <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
        Click the CCTV buttons from PLUMB-SAN page, make sure the player window for
        each camera can be played.
      </Typography>

      {/* Image Upload Section - Only one image allowed */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        {imagePreview ? (
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={imagePreview}
              alt="Screenshot"
              style={{
                width: '600px',
                height: '400px',
                objectFit: 'contain',
                border: '1px solid #ddd',
                borderRadius: '8px',
                display: 'block',
                backgroundColor: '#f5f5f5',
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
            borderRadius: '8px', 
            p: 3, 
            textAlign: 'center',
            backgroundColor: '#f9f9f9'
          }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="willowlynx-sump-pit-cctv-image-upload-edit"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="willowlynx-sump-pit-cctv-image-upload-edit">
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
              Upload a screenshot of the CCTV camera player window (One image only)
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

export default WillowlynxSumpPitCCTVCamera_Edit;