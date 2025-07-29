import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import applicationService from '../api-services/applicationService';
import EmployeeNavBar from '../ems/EmployeeNavBar';

function ApplicationForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    applicationName: '',
    description: '',
    remark: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      fetchApplication();
    }
  }, [id, isEdit]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getApplication(id);
      setFormData({
        applicationName: data.applicationName,
        description: data.description || '',
        remark: data.remark || ''
      });
    } catch (err) {
      setError('Failed to fetch application data');
      console.error('Error fetching application:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const applicationData = {
        ...formData,
        createdBy: user?.id || user?.ID, // Use actual user ID from auth context
        updatedBy: isEdit ? (user?.id || user?.ID) : undefined
      };

      if (isEdit) {
        applicationData.id = id;
        await applicationService.updateApplication(id, applicationData);
      } else {
        await applicationService.createApplication(applicationData);
      }

      setSuccessMessage(`Application ${isEdit ? 'updated' : 'created'} successfully!`);
      setTimeout(() => {
        navigate('/employee-management/applications');
      }, 2000);
    } catch (err) {
      setError(isEdit ? 'Failed to update application' : 'Failed to create application');
      console.error('Error submitting application:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <EmployeeNavBar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#34C759' }}>
          {isEdit ? 'Edit Application' : 'Add New Application'}
        </Typography>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: 'auto' }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Application Name"
                name="applicationName"
                value={formData.applicationName}
                onChange={handleInputChange}
                required
                variant="outlined"
                helperText="Enter the name of the application"
                disabled={loading}
              />
              
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                variant="outlined"
                helperText="Describe the application's purpose and functionality"
                disabled={loading}
              />
              
              <TextField
                fullWidth
                label="Remark"
                name="remark"
                value={formData.remark}
                onChange={handleInputChange}
                multiline
                rows={3}
                variant="outlined"
                helperText="Additional notes or comments"
                disabled={loading}
              />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate('/employee-management/applications')}
                  disabled={loading}
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
                  {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Application' : 'Create Application')}
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
}

export default ApplicationForm;