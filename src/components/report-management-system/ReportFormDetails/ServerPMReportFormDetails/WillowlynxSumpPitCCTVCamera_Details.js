import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Paper,
  Modal,
  IconButton,
} from '@mui/material';
import { Videocam as VideocamIcon, Close as CloseIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import yesNoStatusService from '../../../api-services/yesNoStatusService';
import { API_BASE_URL } from '../../../../config/apiConfig';

const WillowlynxSumpPitCCTVCamera_Details = ({ data, disabled = false, images = [], reportFormId = null }) => {
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchYesNoStatusOptions = async () => {
      try {
        const options = await yesNoStatusService.getYesNoStatuses();
        setYesNoStatusOptions(options || []);
      } catch (error) {
        console.error('Error fetching yes/no status options:', error);
      }
    };

    fetchYesNoStatusOptions();
  }, []);

  useEffect(() => {
    if (data) {
      // Handle API response structure
      let cctvCameraItem = null;
      
      if (data.pmServerWillowlynxCCTVCameras && Array.isArray(data.pmServerWillowlynxCCTVCameras)) {
        cctvCameraItem = data.pmServerWillowlynxCCTVCameras[0];
      } else if (Array.isArray(data)) {
        cctvCameraItem = data[0];
      } else {
        cctvCameraItem = data;
      }

      if (cctvCameraItem) {
        setResult(
          cctvCameraItem.YesNoStatusID || 
          cctvCameraItem.yesNoStatusID || 
          cctvCameraItem.result || 
          cctvCameraItem.remarks || 
          ''
        );
        setRemarks(cctvCameraItem.Remarks || cctvCameraItem.remarks || '');
      }
    }
  }, [data]);

  const getYesNoStatusLabel = (statusId) => {
    const status = yesNoStatusOptions.find(option => option.id === statusId);
    return status ? status.name : 'Unknown';
  };

  const getStatusColor = (statusId) => {
    const label = getYesNoStatusLabel(statusId);
    switch (label.toLowerCase()) {
      case 'yes':
      case 'ok':
      case 'good':
        return 'success';
      case 'no':
      case 'error':
      case 'bad':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle image double click to show in modal
  const handleImageDoubleClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && modalOpen) {
        handleCloseModal();
      }
    };

    if (modalOpen) {
      window.addEventListener('keydown', handleEscKey);
      return () => {
        window.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [modalOpen]);

  // Styling constants
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={sectionContainerStyle}>
        {/* Header */}
        <Typography variant="h5" sx={sectionHeaderStyle}>
          <VideocamIcon /> Willowlynx Sump Pit CCTV Camera Check
        </Typography>

        {/* Instructions */}
        <Typography variant="body1" sx={{ ml: 2, mb: 2 }}>
          Click the CCTV buttons from PLUMB-SAN page, make sure the player window for each camera can be played.
        </Typography>

        {/* Screenshot */}
        {images && images.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            {images.map((image, index) => {
              const imageUrl = image.imageUrl || (image.imageName && reportFormId ? `${API_BASE_URL}/api/ReportFormImage/image/${reportFormId}/${image.imageName}` : null);
              return (
                <Box
                  key={image.id || image.ID || index}
                  sx={{
                    display: 'inline-block',
                    mb: index < images.length - 1 ? 2 : 0,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: '3px solid transparent',
                    '&:hover': {
                      border: '3px solid #1976d2',
                      boxShadow: '0 0 20px rgba(25, 118, 210, 0.5), 0 4px 16px rgba(0,0,0,0.2)',
                      transform: 'scale(1.05)',
                    },
                    '&:hover img': {
                      filter: 'brightness(1.1)',
                    }
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={`Uploaded Screenshot ${index + 1}`}
                    onDoubleClick={() => handleImageDoubleClick(imageUrl)}
                    style={{
                      width: '600px',
                      height: '400px',
                      objectFit: 'contain',
                      backgroundColor: '#f5f5f5',
                      display: 'block',
                      transition: 'filter 0.3s ease',
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}

        {/* Image Modal */}
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              outline: 'none',
            }}
            onClick={handleCloseModal}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                top: -40,
                right: -40,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'black',
                zIndex: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full size view"
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}
              />
            )}
          </Box>
        </Modal>

        {/* Result */}
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Result:
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, ml: 2, mb: 2 }}>
          <Typography>All CCTV cameras can be played without issues. </Typography>
          <Chip
            label={getYesNoStatusLabel(result)}
            color={getStatusColor(result)}
            size="small"
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
    </LocalizationProvider>
  );
};

export default WillowlynxSumpPitCCTVCamera_Details;