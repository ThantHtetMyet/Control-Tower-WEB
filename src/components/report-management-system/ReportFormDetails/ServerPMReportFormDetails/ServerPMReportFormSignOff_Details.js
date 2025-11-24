import React from 'react';
import {
  Grid,
  TextField,
  Box,
  Typography,
  Paper,
} from '@mui/material';

const ServerPMReportFormSignOff_Details = ({ data }) => {
  const fieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f5f5f5',
      '& fieldset': {
        borderColor: '#d0d0d0'
      }
    },
    '& .MuiInputBase-input.Mui-disabled': {
      color: '#333',
      WebkitTextFillColor: '#333'
    }
  };

  return (
    <>
      {/* Personnel Information Section */}
      <Paper sx={{
        padding: 3,
        marginBottom: 3,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h5" sx={{
          color: '#1976d2',
          fontWeight: 'bold',
          marginBottom: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          👥 Personnel Information
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          label="Attended By"
          value={data?.attendedBy || ''}
          disabled
          placeholder="Enter maintenance personnel name"
          sx={{
            marginBottom: 2,
            marginTop: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f5f5f5',
              '& fieldset': {
                borderColor: '#d0d0d0'
              }
            },
            '& .MuiInputBase-input.Mui-disabled': {
              color: '#333',
              WebkitTextFillColor: '#333'
            }
          }}
        />

        <TextField
          fullWidth
          variant="outlined"
          label="Witnessed By"
          value={data?.witnessedBy || ''}
          disabled
          placeholder="Enter witness name"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f5f5f5',
              '& fieldset': {
                borderColor: '#d0d0d0'
              }
            },
            '& .MuiInputBase-input.Mui-disabled': {
              color: '#333',
              WebkitTextFillColor: '#333'
            }
          }}
        />
      </Paper>

      {/* Schedule Information Section */}
      <Paper sx={{
        padding: 3,
        marginBottom: 3,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h5" sx={{
          color: '#1976d2',
          fontWeight: 'bold',
          marginBottom: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          📅 Schedule Information
        </Typography>

        <Grid container spacing={3} sx={{ marginTop: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Start Date"
              value={data?.startDate ? new Date(data.startDate).toLocaleDateString() : ''}
              disabled
              sx={fieldStyle}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Completion Date"
              value={data?.completionDate ? new Date(data.completionDate).toLocaleDateString() : ''}
              disabled
              sx={fieldStyle}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Remarks Section */}
      <Box sx={{
        padding: 3,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: 3
      }}>
        <Typography
          variant="h6"
          sx={{
            color: '#1976d2',
            fontWeight: 'bold',
            marginBottom: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          📝 Remarks for SignOff
        </Typography>
        <TextField
          label="Additional Notes"
          fullWidth
          multiline
          rows={4}
          value={data?.remarks || ''}
          disabled
          placeholder="Enter any additional remarks or observations..."
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f5f5f5',
              '& fieldset': {
                borderColor: '#d0d0d0'
              }
            },
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
              color: 'rgba(0, 0, 0, 0.6)'
            }
          }}
        />
      </Box>
    </>
  );
};

export default ServerPMReportFormSignOff_Details;