import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
  MenuItem,
  Grid,
  CircularProgress
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import EmployeeNavBar from './EmployeeNavBar';

import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const EmployeeEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [departments, setDepartments] = useState([]);
  const [occupations, setOccupations] = useState([]);
  
  const [formData, setFormData] = useState({
    id: '',
    departmentID: '',
    occupationID: '',
    staffCardID: '',
    staffIDCardID: '',
    firstName: '',
    lastName: '',
    email: '',
    mobileNo: '',
    gender: '',
    remark: '',
    startWorkingDate: moment(),
    lastWorkingDate: null,
    workPermit: '',
    nationality: '',
    religion: '',
    dateOfBirth: moment(),
    updatedBy: user?.id || '00000000-0000-0000-0000-000000000000'
  });

  useEffect(() => {
    fetchEmployee();
    fetchDepartments();
    fetchOccupations();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${API_BASE_URL}/Employee/${id}`);
      if (!response.ok) {
        throw new Error('Employee not found');
      }
      const data = await response.json();
      setFormData({
        id: data.id,
        departmentID: data.departmentID,
        occupationID: data.occupationID,
        staffCardID: data.staffCardID,
        staffIDCardID: data.staffIDCardID,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobileNo: data.mobileNo,
        gender: data.gender,
        remark: data.remark || '',
        startWorkingDate: moment(data.startWorkingDate),
        lastWorkingDate: data.lastWorkingDate ? moment(data.lastWorkingDate) : null,
        workPermit: data.workPermit || '',
        nationality: data.nationality || '',
        religion: data.religion || '',
        dateOfBirth: moment(data.dateOfBirth),
        updatedBy: user?.id || '00000000-0000-0000-0000-000000000000'
      });
    } catch (err) {
      setError('Error fetching employee: ' + err.message);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Department`);
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchOccupations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Occupation`);
      if (response.ok) {
        const data = await response.json();
        setOccupations(data);
      }
    } catch (err) {
      console.error('Error fetching occupations:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, value) => {
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
      const submitData = {
        ...formData,
        startWorkingDate: formData.startWorkingDate.toISOString(),
        lastWorkingDate: formData.lastWorkingDate ? formData.lastWorkingDate.toISOString() : null,
        dateOfBirth: formData.dateOfBirth.toISOString(),
        updatedBy: user?.id || '00000000-0000-0000-0000-000000000000'
      };

      const response = await fetch(`${API_BASE_URL}/Employee/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update employee');
      }

      setSuccessMessage('Employee updated successfully!');
      setTimeout(() => {
        navigate('/employee-management/employees');
      }, 2000);
    } catch (err) {
      setError('Error updating employee: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

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
          Edit Employee
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Personal Information */}
              <Typography variant="h6" sx={{ color: '#34C759', fontWeight: 'bold', mb: 1 }}>
                Personal Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  >
                    {genderOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Date of Birth"
                    value={formData.dateOfBirth}
                    onChange={(value) => handleDateChange('dateOfBirth', value)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                    maxDate={moment().subtract(16, 'years')}
                  />
                </Grid>
              </Grid>

              {/* Work Information */}
              <Typography variant="h6" sx={{ color: '#34C759', fontWeight: 'bold', mb: 1, mt: 3 }}>
                Work Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Department"
                    name="departmentID"
                    value={formData.departmentID}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Occupation"
                    name="occupationID"
                    value={formData.occupationID}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  >
                    {occupations.map((occ) => (
                      <MenuItem key={occ.id} value={occ.id}>
                        {occ.occupationName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Staff Card ID"
                    name="staffCardID"
                    value={formData.staffCardID}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Staff ID Card ID"
                    name="staffIDCardID"
                    value={formData.staffIDCardID}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Working Date"
                    value={formData.startWorkingDate}
                    onChange={(value) => handleDateChange('startWorkingDate', value)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Last Working Date (Optional)"
                    value={formData.lastWorkingDate}
                    onChange={(value) => handleDateChange('lastWorkingDate', value)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>

              {/* Additional Information */}
              <Typography variant="h6" sx={{ color: '#34C759', fontWeight: 'bold', mb: 1, mt: 3 }}>
                Additional Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Work Permit"
                    name="workPermit"
                    value={formData.workPermit}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Religion"
                    name="religion"
                    value={formData.religion}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Remark"
                    name="remark"
                    value={formData.remark}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate('/employee-management/employees')}
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
                  {loading ? 'Updating...' : 'Update Employee'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Success/Error Messages */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default EmployeeEdit;