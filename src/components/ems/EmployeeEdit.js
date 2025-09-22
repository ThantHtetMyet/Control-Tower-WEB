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
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Save, Cancel, Delete, Close, PhotoCamera } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import EmployeeNavBar from './EmployeeNavBar';
import applicationService from '../api-services/applicationService';
import accessLevelService from '../api-services/accessLevelService';
import employeeApplicationAccessService from '../api-services/employeeApplicationAccessService';
import { 
  updateEmployeeApplicationAccess, 
  softDeleteEmployeeApplicationAccess, 
  createEmployeeApplicationAccess 
} from '../api-services/employeeService';
import { API_URL } from '../../config/apiConfig';
import { fetchSubDepartments } from '../api-services/subDepartmentService';

const API_BASE_URL = API_URL;


const EmployeeEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [subDepartments, setSubDepartments] = useState([]);
  const [occupations, setOccupations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [accessLevels, setAccessLevels] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [applicationAccessLevels, setApplicationAccessLevels] = useState({});
  const [existingApplicationAccess, setExistingApplicationAccess] = useState([]);
  
  // Add these image-related state variables
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  
  const [formData, setFormData] = useState({
    id: '',
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
    remark: '',
    startWorkingDate: moment(),
    lastWorkingDate: null,
    workPermit: '',
    nationality: '',
    religion: '',
    dateOfBirth: moment(),
    workPassCardNumber: '',
    workPassCardIssuedDate: null,
    workPassCardExpiredDate: null,
    emergencyContactName: '',
    emergencyContactNumber: '',
    emergencyRelationship: '',
    updatedBy: user?.id || '00000000-0000-0000-0000-000000000000'
  });

  useEffect(() => {
    fetchEmployee();
    fetchCompanies();
    fetchSubDepartmentsData(); // Changed from fetchSubDepartments
    fetchOccupations();
    fetchApplications();
    fetchAccessLevels();
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
      companyID: data.companyID,
      subDepartmentID: data.subDepartmentID, // Changed from departmentID
      occupationID: data.occupationID,
        staffCardID: data.staffCardID,
        staffRFIDCardID: data.staffRFIDCardID,
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
        workPassCardNumber: data.workPassCardNumber || '',
        workPassCardIssuedDate: data.workPassCardIssuedDate ? moment(data.workPassCardIssuedDate) : null,
        workPassCardExpiredDate: data.workPassCardExpiredDate ? moment(data.workPassCardExpiredDate) : null,
        emergencyContactName: data.emergencyContactName || '',
        emergencyContactNumber: data.emergencyContactNumber || '',
        emergencyRelationship: data.emergencyRelationship || '',
        updatedBy: user?.id || '00000000-0000-0000-0000-000000000000'
      });
      
      // Handle existing profile image - use profileImageUrl directly like NewsForm.js
      if (data.profileImageUrl) {
        setExistingImageUrl(data.profileImageUrl);
      }
      
      // Fetch existing application access
      await fetchEmployeeApplicationAccess(data.id);
    } catch (err) {
      setError('Error fetching employee: ' + err.message);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchEmployeeApplicationAccess = async (employeeId) => {
    try {
      const existingAccess = await employeeApplicationAccessService.getEmployeeApplicationAccessesByEmployee(employeeId);
      
      setExistingApplicationAccess(existingAccess);
      
      const appIds = existingAccess.map(access => access.applicationID);
      const accessLevels = {};
      existingAccess.forEach(access => {
        accessLevels[access.applicationID] = access.accessLevelID;
      });
      
      setSelectedApplications(appIds);
      setApplicationAccessLevels(accessLevels);
    } catch (err) {
      console.error('Error fetching employee application access:', err);
    }
  };

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

  const handleAccessLevelChange = (appId, accessLevelId) => {
    setApplicationAccessLevels(prev => ({
      ...prev,
      [appId]: accessLevelId
    }));
  };

  const removeApplication = (appId) => {
    setSelectedApplications(prev => prev.filter(id => id !== appId));
    setApplicationAccessLevels(prev => {
      const newLevels = { ...prev };
      delete newLevels[appId];
      return newLevels;
    });
  };

  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  
  // Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        // Map camelCase to PascalCase for backend
        ID: formData.id,
        CompanyID: formData.companyID,
        SubDepartmentID: formData.subDepartmentID, // Changed from DepartmentID
        OccupationID: formData.occupationID,
        StaffCardID: formData.staffCardID,
        StaffRFIDCardID: formData.staffRFIDCardID,
        FirstName: formData.firstName,
        LastName: formData.lastName,
        Email: formData.email,
        MobileNo: formData.mobileNo,
        Gender: formData.gender,
        Remark: formData.remark,
        StartWorkingDate: formData.startWorkingDate.toISOString(),
        LastWorkingDate: formData.lastWorkingDate ? formData.lastWorkingDate.toISOString() : null,
        DateOfBirth: formData.dateOfBirth.toISOString(),
        WorkPassCardIssuedDate: formData.workPassCardIssuedDate ? formData.workPassCardIssuedDate.toISOString() : null,
        WorkPassCardExpiredDate: formData.workPassCardExpiredDate ? formData.workPassCardExpiredDate.toISOString() : null,
        WorkPermit: formData.workPermit,
        Nationality: formData.nationality,
        Religion: formData.religion,
        WorkPassCardNumber: formData.workPassCardNumber,
        EmergencyContactName: formData.emergencyContactName,
        EmergencyContactNumber: formData.emergencyContactNumber,
        EmergencyRelationship: formData.emergencyRelationship,
        UpdatedBy: user?.id || '00000000-0000-0000-0000-000000000000'
      };

      console.log('Submit Data being sent:', submitData);
  
      // 1. Update employee data (without image)
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
  
      // 2. Update application access
      await updateApplicationAccess();
      
      // 3. Upload profile image if new image selected
      if (profileImage && user?.id) {
        await uploadProfileImage(id, profileImage, user.id);
        // Clear the selected image - no need to refresh data since we're navigating away
        setProfileImage(null);
        setImagePreview(null);
      }
  
      setSuccessMessage('Employee updated successfully!');
      setTimeout(() => {
        navigate('/employee-management-system/employees');
      }, 2000);
    } catch (err) {
      setError('Error updating employee: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Add function to handle modal close and navigation
  // Remove these lines (around lines 305-309):
  // const handleSuccessModalClose = () => {
  //   setShowSuccessModal(false);
  //   navigate('/employee-management-system/employees');
  // };
  
  // Remove the entire Dialog component (lines 903-946):
  // {/* Success Modal */}
  // <Dialog
  //   open={showSuccessModal}
  //   onClose={handleSuccessModalClose}
  //   ...
  // </Dialog>

  const updateApplicationAccess = async () => {
    try {
      // Create maps for easier comparison using the existing state
      const existingAccessMap = new Map();
      existingApplicationAccess.forEach(access => {
        existingAccessMap.set(access.applicationID, {
          id: access.id,
          accessLevelID: access.accessLevelID
        });
      });
  
      const currentAccessMap = new Map();
      selectedApplications.forEach(appId => {
        const accessLevelId = applicationAccessLevels[appId];
        if (accessLevelId) {
          currentAccessMap.set(appId, accessLevelId);
        }
      });
  
      // Identify operations needed
      const toSoftDelete = [];
      const toUpdate = [];
      const toCreate = [];
  
      // Check what needs to be soft deleted or updated
      for (const [appId, accessInfo] of existingAccessMap) {
        if (!currentAccessMap.has(appId)) {
          // Application removed - mark for soft deletion
          toSoftDelete.push({ appId, accessInfo });
        } else {
          // Application exists - check if access level changed
          const currentAccessLevelId = currentAccessMap.get(appId);
          if (accessInfo.accessLevelID !== currentAccessLevelId) {
            toUpdate.push({ appId, accessInfo, newAccessLevelId: currentAccessLevelId });
          }
        }
      }
  
      // Check what needs to be created
      for (const [appId, accessLevelId] of currentAccessMap) {
        if (!existingAccessMap.has(appId)) {
          toCreate.push({ appId, accessLevelId });
        }
      }
  
      // Execute soft deletions first
      for (const { accessInfo } of toSoftDelete) {
        await softDeleteEmployeeApplicationAccess(id, accessInfo.id, {
          isDeleted: true,
          updatedBy: user?.id
        });
      }
  
      // Execute updates
      for (const { accessInfo, newAccessLevelId } of toUpdate) {
        await updateEmployeeApplicationAccess(id, accessInfo.id, {
          accessLevelID: newAccessLevelId,
          updatedBy: user?.id
        });
      }
  
      // Execute creations
      for (const { appId, accessLevelId } of toCreate) {
        await createEmployeeApplicationAccess(id, {
          userID: id,
          applicationID: appId,
          accessLevelID: accessLevelId,
          grantedBy: user?.id,
          createdBy: user?.id
        });
      }
      
    } catch (error) {
      console.error('Error updating application access:', error);
      setErrorMessage('Failed to update application access. Please try again.');
      setShowErrorSnackbar(true);
    }
  };
  
  // Add image handling functions
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    setExistingImageUrl(null); // Also clear existing image
    // Reset file input
    const fileInput = document.getElementById('profile-image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const uploadProfileImage = async (employeeId, imageFile, uploadedBy) => {
    try {
      const formData = new FormData();
      formData.append('ProfileImage', imageFile);
      formData.append('UploadedBy', uploadedBy);
      
      const response = await fetch(`${API_BASE_URL}/Employee/${employeeId}/profile-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload profile image');
      }
      
      // Change from response.json() to response.text() since backend returns plain text
      return await response.text();
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
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

  if (fetchLoading) {
    return (
      <Box>
        <EmployeeNavBar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
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
        
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: 'auto' }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Profile Image Upload Section */}
              <Typography variant="h6" sx={{ color: '#34C759', fontWeight: 'bold', mb: 1 }}>
                Profile Image
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                {imagePreview || existingImageUrl ? (
                  <Box sx={{ position: 'relative' }}>
                    <img 
                      src={imagePreview || existingImageUrl} 
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
                      {imagePreview || existingImageUrl ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </label>
                  {(imagePreview || existingImageUrl) && (
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
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    maxLength: 15,
                    onInput: (e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }
                  }}
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
                  autoComplete="off"
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
                  placeholder="Enter emergency contact's full name"
                />
                <TextField
                  fullWidth
                  label="Emergency Contact Number"
                  name="emergencyContactNumber"
                  value={formData.emergencyContactNumber}
                  onChange={handleInputChange}
                  variant="outlined"
                  type="tel"
                  placeholder="Enter emergency contact's phone number"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    maxLength: 15,
                    onInput: (e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Emergency Relationship"
                  name="emergencyRelationship"
                  value={formData.emergencyRelationship}
                  onChange={handleInputChange}
                  variant="outlined"
                  placeholder="e.g., Spouse, Parent, Sibling, Friend"
                />
              </Box>

              {/* Additional Information */}
              <Typography variant="h6" sx={{ color: '#34C759', fontWeight: 'bold', mb: 1, mt: 3 }}>
                Additional Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  {loading ? 'Updating...' : 'Update Employee'}
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
          open={showErrorSnackbar}
          autoHideDuration={6000}
          onClose={() => setShowErrorSnackbar(false)}
        >
          <Alert onClose={() => setShowErrorSnackbar(false)} severity="error">
            {errorMessage}
          </Alert>
        </Snackbar>

        {/* Add this success message Snackbar */}
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

export default EmployeeEdit;