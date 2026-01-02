import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
} from '@mui/material';
import {
  NetworkCheck as NetworkCheckIcon,
} from '@mui/icons-material';

// Import the yes/no status service
import yesNoStatusService from '../../../api-services/yesNoStatusService';

const WillowlynxNetworkStatus_Edit_Review = ({ data = {}, formData = {} }) => {
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
    if (formData.willowlynxNetworkStatusData) {
      const networkData = formData.willowlynxNetworkStatusData;
      if (networkData.pmServerWillowlynxNetworkStatuses && networkData.pmServerWillowlynxNetworkStatuses.length > 0) {
        const networkStatusData = networkData.pmServerWillowlynxNetworkStatuses[0];
        resultValue = networkStatusData.yesNoStatusID || networkData.result || '';
        remarksValue = networkStatusData.remarks || networkData.remarks || '';
      } else {
        resultValue = networkData.result || '';
        remarksValue = networkData.remarks || '';
      }
    }
    // Fallback to data (direct Review mode)
    else if (data) {
      if (data.pmServerWillowlynxNetworkStatuses && data.pmServerWillowlynxNetworkStatuses.length > 0) {
        const networkStatusData = data.pmServerWillowlynxNetworkStatuses[0];
        resultValue = networkStatusData.yesNoStatusID || '';
        remarksValue = networkStatusData.remarks || '';
      } else {
        resultValue = data.result || '';
        remarksValue = data.remarks || '';
      }
    }

    setResult(resultValue);
    setRemarks(remarksValue);

    // Handle image display - check formData first (from Edit mode)
    let imageToShow = null;
    if (formData.willowlynxNetworkStatusData) {
      const networkData = formData.willowlynxNetworkStatusData;
      // Check for newly uploaded image (File object)
      if (networkData.image && networkData.image instanceof File) {
        imageToShow = networkData.image;
      }
      // Check for existing image URL (if not deleted)
      else if (networkData.existingImageUrl && !networkData.isImageDeleted) {
        imageToShow = networkData.existingImageUrl;
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

  // Get status name by ID
  const getStatusName = (id, options) => {
    const status = options.find(option => option.ID === id || option.id === id);
    return status ? (status.Name || status.name) : id;
  };

  // Styles matching the Review component
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
    '& .MuiOutlinedInput-root': { backgroundColor: '#f5f5f5' },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000',
    },
  };

  return (
    <Paper sx={sectionContainerStyle}>
      {/* Header */}
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <NetworkCheckIcon /> Willowlynx Network Status Check
      </Typography>

      {/* Instructions */}
      <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
        Check the system overview page, see if all servers, switches, RTUs are green.
      </Typography>

      {/* Screenshot - Show uploaded image if available, otherwise show nothing */}
      {imagePreview && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <img
            src={imagePreview}
            alt="Network Status Screenshot"
            style={{
              width: '600px',
              height: '400px',
              objectFit: 'contain',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              backgroundColor: '#f5f5f5'
            }}
          />
        </Box>
      )}

      {/* Result Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Result:
        </Typography>
        <Typography variant="body1">
          All servers, switches, RTUs are green.
        </Typography>
        <TextField
          size="small"
          value={getStatusName(result, yesNoStatusOptions) || ''}
          variant="outlined"
          disabled
          sx={inlineField}
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

export default WillowlynxNetworkStatus_Edit_Review;