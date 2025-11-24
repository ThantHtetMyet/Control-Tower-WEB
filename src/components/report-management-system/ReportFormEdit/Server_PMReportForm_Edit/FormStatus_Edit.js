import React from 'react';
import { Paper, Typography, TextField, MenuItem } from '@mui/material';
import { AssignmentTurnedIn as AssignmentTurnedInIcon } from '@mui/icons-material';

const FormStatus_Edit = ({ value = '', options = [], onChange }) => {
   const themeColor = '#1976d2'; // System blue color

  return (
    <Paper
      sx={{
        padding: 3,
        marginBottom: 3,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: themeColor,
          fontWeight: 'bold',
          marginBottom: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
          <AssignmentTurnedInIcon
            fontSize="small"
            sx={{ color: themeColor }}
          />
          Form-Status
      </Typography>
      <TextField
        fullWidth
        select
        label="Form-Status"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#f5f5f5',
            '& fieldset': {
              borderColor: '#d0d0d0'
            }
          }
        }}
      >
        <MenuItem value="">
          <em>Select Form Status</em>
        </MenuItem>
        {(options || []).map((status) => (
          <MenuItem key={status.id || status.ID} value={status.id || status.ID}>
            {status.name || status.Name}
          </MenuItem>
        ))}
      </TextField>
    </Paper>
  );
};

export default FormStatus_Edit;
