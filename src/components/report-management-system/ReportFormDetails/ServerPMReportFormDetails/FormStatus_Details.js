import React from 'react';
import { Paper, Typography, TextField, Box } from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';

const FormStatus_Details = ({ data }) => {
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
                <AssignmentIcon fontSize="inherit" />
                Form Status
            </Typography>
            <TextField
                fullWidth
                label="Form Status"
                value={data?.formStatusName || data?.formStatus || 'Not specified'}
                disabled
                sx={fieldStyle}
            />
        </Paper>
    );
};

export default FormStatus_Details;
