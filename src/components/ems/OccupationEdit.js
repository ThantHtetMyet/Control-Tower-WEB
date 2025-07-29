import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Rating,
  CircularProgress
} from '@mui/material';
import { Save, Cancel, Star } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmployeeNavBar from './EmployeeNavBar';

const API_BASE_URL = 'https://localhost:7145/api';

const OccupationEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    id: '',
    occupationName: '',
    description: '',
    remark: '',
    rating: 3,
    updatedBy: user?.id || '00000000-0000-0000-0000-000000000000'
  });

  useEffect(() => {
    fetchOccupation();
  }, [id]);

  const fetchOccupation = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${API_BASE_URL}/Occupation/${id}`);
      if (!response.ok) {
        throw new Error('Occupation not found');
      }
      const data = await response.json();
      setFormData({
        id: data.id,
        occupationName: data.occupationName,
        description: data.description || '',
        remark: data.remark || '',
        rating: data.rating,
        updatedBy: user?.id || '00000000-0000-0000-0000-000000000000'
      });
    } catch (err) {
      setError('Error fetching occupation: ' + err.message);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      rating: newValue || 1
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        id: formData.id,
        occupationName: formData.occupationName,
        description: formData.description,
        remark: formData.remark,
        rating: formData.rating,
        updatedBy: user?.id || '00000000-0000-0000-0000-000000000000'
      };

      const response = await fetch(`${API_BASE_URL}/Occupation/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update occupation');
      }

      setSuccessMessage('Occupation updated successfully!');
      setTimeout(() => {
        navigate('/employee-management/occupations');
      }, 2000);
    } catch (err) {
      setError('Error updating occupation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box>
        <EmployeeNavBar />
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress sx={{ color: '#34C759' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <EmployeeNavBar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#34C759' }}>
          Edit Occupation
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: 'auto' }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Occupation Name"
                name="occupationName"
                value={formData.occupationName}
                onChange={handleInputChange}
                required
                variant="outlined"
                helperText="Enter the name of the occupation"
              />
              
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                variant="outlined"
                helperText="Describe the occupation responsibilities and requirements"
              />
              
              <Box>
                <Typography component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Rating
                </Typography>
                <Rating
                  name="rating"
                  value={formData.rating}
                  onChange={handleRatingChange}
                  size="large"
                  icon={<Star fontSize="inherit" />}
                  emptyIcon={<Star fontSize="inherit" />}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Rate this occupation from 1 to 5 stars
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Remark"
                name="remark"
                value={formData.remark}
                onChange={handleInputChange}
                multiline
                rows={2}
                variant="outlined"
                helperText="Additional notes or comments"
              />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate('/employee-management/occupations')}
                  sx={{
                    borderColor: '#6c757d',
                    color: '#6c757d',
                    '&:hover': {
                      borderColor: '#5a6268',
                      color: '#5a6268',
                      backgroundColor: 'rgba(108, 117, 125, 0.04)'
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #28A745 0%, #1e7e34 100%)'
                    }
                  }}
                >
                  {loading ? 'Updating...' : 'Update Occupation'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage('')}
        >
          <Alert onClose={() => setSuccessMessage('')} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default OccupationEdit;