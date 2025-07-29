import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box
} from '@mui/material';
import { Warning } from '@mui/icons-material';

const ConfirmationModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  severity = "warning" // warning, error, info
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'error':
        return '#d32f2f';
      case 'warning':
        return '#ed6c02';
      case 'info':
        return '#0288d1';
      default:
        return '#800080'; // System primary color
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      PaperProps={{
        sx: {
          minWidth: '400px',
          maxWidth: '500px',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(128, 0, 128, 0.15)'
        }
      }}
    >
      <DialogTitle 
        id="confirmation-dialog-title"
        sx={{
          background: getSeverityColor(),
          color: '#fff',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}
      >
        <Warning sx={{ fontSize: '1.2rem' }} />
        {title}
      </DialogTitle>
      
      <DialogContent sx={{ 
        padding: '32px 24px',
        textAlign: 'left'  // Changed from 'center' to 'left'
      }}>
        <DialogContentText 
          id="confirmation-dialog-description" 
          sx={{ 
            color: '#2c3e50',
            fontSize: '1rem',
            lineHeight: 1.6,
            margin: 0,
            textAlign: 'left'  // Added explicit left alignment
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ 
        justifyContent: 'center',
        padding: '0 24px 24px',
        gap: 2
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: '#94a3b8',
            color: '#64748b',
            minWidth: '100px',
            '&:hover': {
              borderColor: '#64748b',
              backgroundColor: '#f8fafc'
            }
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            backgroundColor: getSeverityColor(),
            minWidth: '100px',
            '&:hover': {
              backgroundColor: severity === 'error' ? '#b71c1c' : 
                             severity === 'warning' ? '#e65100' :
                             severity === 'info' ? '#01579b' : '#4B0082'
            }
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;