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
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { Save, Cancel, Delete, PhotoCamera, Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import EmployeeNavBar from './EmployeeNavBar';
import applicationService from '../api-services/applicationService';
import accessLevelService from '../api-services/accessLevelService';
import employeeApplicationAccessService from '../api-services/employeeApplicationAccessService';
import { fetchSubDepartments } from '../api-services/subDepartmentService';

import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [subDepartments, setSubDepartments] = useState([]);
  const [occupations, setOccupations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [accessLevels, setAccessLevels] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [applicationAccessLevels, setApplicationAccessLevels] = useState({});
  
  // Image upload states
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');
  // Update formData initial state to match backend
  const [formData, setFormData] = useState({
      companyID: '',
      subDepartmentID: '',
      occupationID: '',
      staffCardID: '',
      staffRFIDCardID: '',
      firstName: '',
      lastName: '',
      email: '',
      mobileNo: '',
      gender: '',
      loginPassword: '',
      remark: '',
      startWorkingDate: moment(),
      lastWorkingDate: null,
      workPermit: '',
      nationality: '',
      religion: '',
      dateOfBirth: moment().subtract(18, 'years'),
      workPassCardNumber: '',
      workPassCardIssuedDate: null,
      workPassCardExpiredDate: null,
      emergencyContactName: '',
      emergencyRelationship: '',
      emergencyContactNumber: '', // Changed from EmergencyContactNumber
      emergencyRelationship: '',  // Changed from EmergencyRelationship
      createdBy: user?.id || '00000000-0000-0000-0000-000000000000'
  });

  useEffect(() => {
    fetchCompanies();
    fetchSubDepartmentsData();
    fetchOccupations();
    fetchApplications();
    fetchAccessLevels();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Company`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchSubDepartmentsData = async () => {
    try {
      const data = await fetchSubDepartments(1, 1000); // Fetch all subdepartments
      setSubDepartments(data.items || data);
    } catch (err) {
      console.error('Error fetching sub-departments:', err);
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

  const fetchApplications = async () => {
    try {
      const data = await applicationService.getApplications();
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const fetchAccessLevels = async () => {
    try {
      const data = await accessLevelService.getAccessLevels();
      setAccessLevels(data);
    } catch (err) {
      console.error('Error fetching access levels:', err);
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

  const handleApplicationChange = (event) => {
    const value = event.target.value;
    const newSelectedApplications = typeof value === 'string' ? value.split(',') : value;
    setSelectedApplications(newSelectedApplications);
    
    // Initialize access levels for newly selected applications
    const newAccessLevels = { ...applicationAccessLevels };
    newSelectedApplications.forEach(appId => {
      if (!newAccessLevels[appId]) {
        // Set default to 'User' access level ID
        const userAccessLevel = accessLevels.find(level => level.levelName === 'User');
        newAccessLevels[appId] = userAccessLevel?.id || '';
      }
    });
    
    // Remove access levels for unselected applications
    Object.keys(newAccessLevels).forEach(appId => {
      if (!newSelectedApplications.includes(appId)) {
        delete newAccessLevels[appId];
      }
    });
    
    setApplicationAccessLevels(newAccessLevels);
  };

  const handleAccessLevelChange = (applicationId, accessLevelId) => {
    setApplicationAccessLevels(prev => ({
      ...prev,
      [applicationId]: accessLevelId
    }));
  };

  const removeApplication = (applicationId) => {
    setSelectedApplications(prev => prev.filter(id => id !== applicationId));
    setApplicationAccessLevels(prev => {
      const newLevels = { ...prev };
      delete newLevels[applicationId];
      return newLevels;
    });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
  
      try {
          // Prepare application access data
          const applicationAccesses = selectedApplications.length > 0 ?
              selectedApplications.map(applicationId => ({
                  applicationID: applicationId,
                  accessLevelID: applicationAccessLevels[applicationId] || ''
              })) : [];
  
          // Create FormData for employee creation (without image)
          const formDataToSend = new FormData();
          
          // Add all form fields except profileImage
          Object.keys(formData).forEach(key => {
              if (formData[key] !== null && formData[key] !== '') {
                  if (moment.isMoment(formData[key])) {
                      formDataToSend.append(key, formData[key].toISOString());
                  } else {
                      formDataToSend.append(key, formData[key]);
                  }
              }
          });
          
          // Add application accesses as JSON string
          if (applicationAccesses.length > 0) {
              // Instead of JSON string, send individual fields
              applicationAccesses.forEach((access, index) => {
                  formDataToSend.append(`ApplicationAccesses[${index}].ApplicationID`, access.applicationID);
                  formDataToSend.append(`ApplicationAccesses[${index}].AccessLevelID`, access.accessLevelID);
                  formDataToSend.append(`ApplicationAccesses[${index}].GrantedDate`, new Date().toISOString());
                  formDataToSend.append(`ApplicationAccesses[${index}].CreatedBy`, formData.createdBy);
                  formDataToSend.append(`ApplicationAccesses[${index}].GrantedBy`, formData.createdBy);
              });
          }
  
          // First, create the employee (without image)
          const response = await fetch(`${API_BASE_URL}/Employee`, {
              method: 'POST',
              body: formDataToSend,
          });
  
          if (response.ok) {
              const result = await response.json();
              const employeeId = result.id;
              
              // Then upload profile image if selected
              if (profileImage && user?.id) {
                  await uploadProfileImage(employeeId, profileImage, user.id);
              }
              
              setSuccessMessage('Employee created successfully!');
              setTimeout(() => navigate('/employee-management-system/employees'), 2000);
          } else {
              const errorData = await response.text();
              throw new Error(errorData || 'Failed to create employee');
          }
      } catch (err) {
          setError('Error creating employee: ' + err.message);
      } finally {
          setLoading(false);
      }
  };
  
  // Add helper function for profile image upload
  const uploadProfileImage = async (employeeId, imageFile, uploadedBy) => {
      const formData = new FormData();
      formData.append('profileImage', imageFile);
      formData.append('uploadedBy', uploadedBy);
      
      const response = await fetch(`${API_BASE_URL}/Employee/${employeeId}/profile-image`, {
          method: 'POST',
          body: formData,
      });
      
      if (!response.ok) {
          throw new Error('Failed to upload profile image');
      }
      
      return response.text();
  };

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  const workPermitOptions = [
    { value: 'SPass', label: 'SPass' },
    { value: 'EPass', label: 'EPass' },
    { value: 'WPass', label: 'WPass' },
    { value: 'Singaporean', label: 'Singaporean' },
    { value: 'Permanent Resident', label: 'Permanent Resident' }
  ];

  const accessLevelOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'User', label: 'User' },
    { value: 'ReadOnly', label: 'Read Only' }
  ];

  // Image handling functions
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImageError('');
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setImageError('Please select a JPEG, JPG, or PNG image file.');
        return;
      }
      
      // Create image object to check dimensions
      const img = new Image();
      img.onload = function() {
        
        
        setProfileImage(file);
        setImagePreview(URL.createObjectURL(file));
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    setImageError('');
    // Reset file input
    const fileInput = document.getElementById('profile-image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  return (
    <Box>
      <EmployeeNavBar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#34C759' }}>
          Add New Employee
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: 'auto' }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              
              {/* Profile Image */}
              <Typography variant="h6" sx={{ color: '#34C759', fontWeight: 'bold', mb: 1, mt: 3 }}>
                Profile Image
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {imagePreview ? (
                  <Box sx={{ position: 'relative' }}>
                    <img 
                      src={imagePreview} 
                      alt="Profile Preview" 
                      style={{ 
                        width: '150px', 
                        height: '150px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        border: '2px solid #ddd'
                      }} 
                    />
                    <IconButton
                      onClick={removeImage}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: '#f44336',
                        color: 'white',
                        '&:hover': { backgroundColor: '#d32f2f' },
                        width: 24,
                        height: 24
                      }}
                    >
                      <Close sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ) : (
                  <Box 
                    sx={{ 
                      width: '150px', 
                      height: '150px', 
                      border: '2px dashed #ddd', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <PhotoCamera sx={{ fontSize: 40, color: '#999' }} />
                  </Box>
                )}
                
                <Box>
                  <input
                    accept="image/jpeg,image/jpg,image/png"
                    style={{ display: 'none' }}
                    id="profile-image-upload"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="profile-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCamera />}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </label>
                  {imagePreview && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={removeImage}
                      sx={{ mb: 1 }}
                    >
                      Remove
                    </Button>
                  )}
                  <Typography variant="caption" display="block" sx={{ color: '#666', mt: 1 }}>
                    Recommended: 350x220px, Max size: 5MB, Format: JPEG/PNG
                  </Typography>
                  {imageError && (
                    <Alert severity="warning" sx={{ mt: 1, maxWidth: 400 }}>
                      {imageError}
                    </Alert>
                  )}
                </Box>
              </Box>

              {/* Personal Information */}
              <Typography variant="h6" sx={{ color: '#34C759', fontWeight: 'bold', mb: 1 }}>
                Personal Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
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
                <TextField
                  fullWidth
                  label="Mobile Number"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
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
                <DatePicker
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={(value) => handleDateChange('dateOfBirth', value)}
                  maxDate={moment().subtract(16, 'years')}
                  views={['year', 'month', 'day']}
                  openTo="year"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      variant: 'outlined'
                    }
                  }}
                />
                
                
                <TextField
                  fullWidth
                  label="Nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Religion"
                  name="religion"
                  value={formData.religion}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                
              {/* Work Information */}
              <Typography variant="h6" sx={{ color: '#34C759', fontWeight: 'bold', mb: 1, mt: 3 }}>
                Work Pass Card Information
              </Typography>

                <TextField
                  fullWidth
                  select
                  label="Work Permit"
                  name="workPermit"
                  value={formData.workPermit}
                  onChange={handleInputChange}
                  variant="outlined"
                >
                  {workPermitOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label="Work Pass Card Number"
                  name="workPassCardNumber"
                  value={formData.workPassCardNumber}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <DatePicker
                  label="Work Pass Card Issued Date (Optional)"
                  value={formData.workPassCardIssuedDate}
                  onChange={(value) => handleDateChange('workPassCardIssuedDate', value)}
                  views={['year', 'month', 'day']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
                <DatePicker
                  label="Work Pass Card Expired Date (Optional)"
                  value={formData.workPassCardExpiredDate}
                  onChange={(value) => handleDateChange('workPassCardExpiredDate', value)}
                  views={['year', 'month', 'day']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </Box>

              {/* Work Information */}
              <Typography variant="h6" sx={{ color: '#34C759', fontWeight: 'bold', mb: 1, mt: 3 }}>
                Work Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  select
                  label="Company"
                  name="companyID"
                  value={formData.companyID}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  select
                  label="Sub Department"
                  name="subDepartmentID"
                  value={formData.subDepartmentID}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                >
                  {subDepartments.map((subDept) => (
                    <MenuItem key={subDept.id} value={subDept.id}>
                      {subDept.departmentName} ({subDept.name})
                    </MenuItem>
                  ))}
                </TextField>
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
                <TextField
                  fullWidth
                  label="Staff Card ID"
                  name="staffCardID"
                  value={formData.staffCardID}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Staff RFID Card ID"
                  name="staffRFIDCardID"
                  value={formData.staffRFIDCardID}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
                <DatePicker
                  label="Start Working Date"
                  value={formData.startWorkingDate}
                  onChange={(value) => handleDateChange('startWorkingDate', value)}
                  views={['year', 'month', 'day']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      variant: 'outlined'
                    }
                  }}
                />
                <DatePicker
                  label="Last Working Date (Optional)"
                  value={formData.lastWorkingDate}
                  onChange={(value) => handleDateChange('lastWorkingDate', value)}
                  views={['year', 'month', 'day']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </Box>

              {/* Application Access */}
              <Typography variant="h6" sx={{ color: '#34C759', fontWeight: 'bold', mb: 1, mt: 3 }}>
                Application Access
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Select Applications</InputLabel>
                  <Select
                    multiple
                    value={selectedApplications}
                    onChange={handleApplicationChange}
                    input={<OutlinedInput label="Select Applications" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const app = applications.find(app => app.id === value);
                          return (
                            <Chip 
                              key={value} 
                              label={app?.applicationName || value}
                              size="small"
                              sx={{
                                backgroundColor: '#34C759',
                                color: 'white',
                                '& .MuiChip-deleteIcon': {
                                  color: 'white'
                                }
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {applications.map((app) => (
                      <MenuItem key={app.id} value={app.id}>
                        <Checkbox 
                          checked={selectedApplications.indexOf(app.id) > -1}
                          sx={{
                            color: '#34C759',
                            '&.Mui-checked': {
                              color: '#34C759',
                            }
                          }}
                        />
                        <ListItemText primary={app.applicationName} secondary={app.description} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Selected Applications with Access Level Selection */}
                {selectedApplications.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Configure Access Levels
                    </Typography>
                    {selectedApplications.map((appId) => {
                      const app = applications.find(a => a.id === appId);
                      return (
                        <Card key={appId} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  {app?.applicationName}
                                </Typography>
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                  <InputLabel>Access Level</InputLabel>
                                  <Select
                                    value={applicationAccessLevels[appId] || ''}
                                    onChange={(e) => handleAccessLevelChange(appId, e.target.value)}
                                    label="Access Level"
                                  >
                                    {accessLevels.map((level) => (
                                      <MenuItem key={level.id} value={level.id}>
                                        {level.levelName}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Box>
                              <IconButton 
                                onClick={() => removeApplication(appId)}
                                color="error"
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  Select applications and configure individual access levels for each one.
                </Typography>
              </Box>

              {/* Additional Information */}
              <Typography variant="h6" sx={{ color: '#34C759', fontWeight: 'bold', mb: 1, mt: 3 }}>
                Additional Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Login Password"
                  name="loginPassword"
                  type="password"
                  value={formData.loginPassword}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
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
                />
              </Box>
              
              {/* Emergency Contact Information */}
              <Typography variant="h6" sx={{ color: '#34C759', fontWeight: 'bold', mb: 1, mt: 3 }}>
                Emergency Contact Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Relationship"
                  name="emergencyRelationship"
                  value={formData.emergencyRelationship}
                  onChange={handleInputChange}
                  variant="outlined"
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
                <TextField
                  fullWidth
                  label="Emergency Contact Phone"
                  name="emergencyContactNumber"
                  value={formData.emergencyContactNumber}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate('/employee-management-system/employees')}
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
                  {loading ? 'Creating...' : 'Create Employee'}
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

export default EmployeeForm;
