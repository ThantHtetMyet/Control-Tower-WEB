import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Paper
} from '@mui/material';
import {
  Videocam as VideocamIcon
} from '@mui/icons-material';

// Import the yes/no status service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const WillowlynxSumpPitCCTVCamera_Edit_Review = ({ data = {}, formData = {} }) => {
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  // Initialize data from props
  useEffect(() => {
    // Priority: formData (from Edit mode) > data (from API)
    let resultValue = '';
    let remarksValue = '';

    // Check formData first (from Edit → Review flow)
    if (formData.willowlynxSumpPitCCTVCameraData) {
      const cctvData = formData.willowlynxSumpPitCCTVCameraData;
      if (cctvData.pmServerWillowlynxCCTVCameras && cctvData.pmServerWillowlynxCCTVCameras.length > 0) {
        const cctvCameraData = cctvData.pmServerWillowlynxCCTVCameras[0];
        resultValue = cctvCameraData.yesNoStatusID || cctvData.result || '';
        remarksValue = cctvCameraData.remarks || cctvData.remarks || '';
      } else {
        resultValue = cctvData.result || '';
        remarksValue = cctvData.remarks || '';
      }
    }
    // Fallback to data (direct Review mode)
    else if (data) {
      if (data.pmServerWillowlynxCCTVCameras && data.pmServerWillowlynxCCTVCameras.length > 0) {
        const cctvCameraData = data.pmServerWillowlynxCCTVCameras[0];
        resultValue = cctvCameraData.yesNoStatusID || '';
        remarksValue = cctvCameraData.remarks || '';
      } else {
        resultValue = data.result || '';
        remarksValue = data.remarks || '';
      }
    }

    setResult(resultValue);
    setRemarks(remarksValue);

    // Handle image display - check formData first (from Edit mode)
    let imageToShow = null;
    if (formData.willowlynxSumpPitCCTVCameraData) {
      const cctvData = formData.willowlynxSumpPitCCTVCameraData;
      // Check for newly uploaded image (File object)
      if (cctvData.image && cctvData.image instanceof File) {
        imageToShow = cctvData.image;
      }
      // Check for existing image URL (if not deleted)
      else if (cctvData.existingImageUrl && !cctvData.isImageDeleted) {
        imageToShow = cctvData.existingImageUrl;
      }
    }
    // Fallback to data (direct Review mode) - check for image URL
    else if (data && data.imageUrl) {
      imageToShow = data.imageUrl;
    }

    // Create preview for File object
    if (imageToShow instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(imageToShow);
    } else if (imageToShow) {
      setImagePreview(imageToShow);
    } else {
      setImagePreview(null);
    }
  }, [data, formData]);

  // Fetch YesNo Status options on component mount
  useEffect(() => {
    const fetchYesNoStatuses = async () => {
      try {
        const response = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(response || []);
      } catch (error) {
        // console.error('Error fetching yes/no status options:', error);
      }
    };

    fetchYesNoStatuses();
  }, []);

  // Helper function to get status name from ID
  const getStatusName = (statusId) => {
    const status = yesNoStatusOptions.find(option => option.id === statusId);
    return status ? status.name : statusId;
  };

  return (
    <Paper sx={{ p: 3, mb: 3, backgroundColor: '#ffffff', borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <VideocamIcon /> Willowlynx Sump Pit CCTV Camera Check
      </Typography>

      <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
        Click the CCTV icon on an HMI, which will load the CCTV Module. Check if the
        CCTV camera is working properly and the video feed is clear.
      </Typography>

      {/* Screenshot - Show uploaded image if available, otherwise show nothing */}
      {imagePreview && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <img
            src={imagePreview}
            alt="CCTV Camera Screenshot"
            style={{
              width: '600px',
              height: '400px',
              objectFit: 'contain',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#f5f5f5'
            }}
          />
        </Box>
      )}

      {/* Result */}
      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
        Result:
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, ml: 2, mb: 2 }}>
        <Typography>CCTV camera is working properly and video feed is clear. </Typography>
        <TextField
          size="small"
          value={getStatusName(result) || ''}
          variant="outlined"
          disabled
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': { backgroundColor: '#f5f5f5' },
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: '#000000',
            },
          }}
        />
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
          disabled
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f5f5f5',
            },
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: '#000000',
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default WillowlynxSumpPitCCTVCamera_Edit_Review;