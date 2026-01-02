import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Chip,
  Modal,
  IconButton,
} from '@mui/material';
import { Settings as SettingsIcon, Close as CloseIcon } from '@mui/icons-material';
import yesNoStatusService from '../../../api-services/yesNoStatusService';
import { API_BASE_URL } from '../../../../config/apiConfig';

const WillowlynxProcessStatus_Details = ({ data, disabled = false, images = [], reportFormId = null }) => {
  const [result, setResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [yesNoStatusOptions, setYesNoStatusOptions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Initialize data from props
  useEffect(() => {
    // Handle the API response structure from PMReportFormServerController
    if (Array.isArray(data) && data.length > 0) {
      // Extract the first item which contains the process status data
      const processStatusItem = data[0];
      
      if (processStatusItem) {
        // Set result from yesNoStatusName
        if (processStatusItem.yesNoStatusName) {
          setResult(processStatusItem.yesNoStatusName);
        }
        
        // Set remarks
        if (processStatusItem.remarks) {
          setRemarks(processStatusItem.remarks);
        }
      }
    }
  }, [data]);

  // Fetch Yes/No Status options on component mount
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

  // Get status color for chip
  const getStatusColor = (statusName) => {
    if (!statusName) return 'default';
    
    switch (statusName.toLowerCase()) {
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

  const fieldStyle = {
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000',
      color: '#000000'
    },
    '& .MuiInputLabel-root.Mui-disabled': {
      color: '#666666'
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f5f5f5'
    }
  };

  return (
    <Paper sx={sectionContainerStyle}>
      {/* Header */}
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <SettingsIcon /> Willowlynx Process Status Check
      </Typography>

      {/* Process Status Section */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
        Process Status
      </Typography>

      {/* Instructions */}
      <Typography variant="body1" sx={{ mb: 2 }}>
        Login into Willowlynx and navigate to "Server Status" page, as below:
      </Typography>

      {/* Screenshot */}
      {images && images.length > 0 && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          {images.map((image, index) => {
            const imageUrl = image.imageUrl || (image.imageName && reportFormId ? `${API_BASE_URL}/api/ReportFormImage/image/${reportFormId}/${image.imageName}` : null);
            return (
              <Box
                key={image.id || image.ID || index}
                sx={{
                  display: 'inline-block',
                  mb: index < images.length - 1 ? 2 : 0,
                  borderRadius: '4px',
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

      {/* Result Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Result:
        </Typography>
        <Typography variant="body1">
          All Process is online, either ACTIVE or STANDBY.
        </Typography>
        {result && (
          <Chip
            label={result}
            color={getStatusColor(result)}
            variant="filled"
            size="small"
          />
        )}
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
          disabled={true}
          sx={fieldStyle}
        />
      </Box>

      {/* No Data Message */}
      {(!data || data.length === 0) && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4, 
          color: '#666',
          fontStyle: 'italic' 
        }}>
          <Typography variant="body1">
            No Willowlynx Process Status data available
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default WillowlynxProcessStatus_Details;