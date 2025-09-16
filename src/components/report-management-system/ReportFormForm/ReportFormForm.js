import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RMSTheme from '../../theme-resource/RMSTheme';
import FirstContainer from './FirstContainer';
import CMReportForm from './CMReportForm';
import RTUPMReportForm from './RTUPMReportForm'; // Updated import
import { getReportFormTypes, createReportForm, submitCMReportForm, getNextJobNumber } from '../../api-services/reportFormService';
import CMReviewReportForm from './CMReviewReportForm';

const steps = [
  'Basic Information',
  'Technical Details',
  'Review & Submit'
];

const ReportFormForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [reportFormTypes, setReportFormTypes] = useState([]);
  const [beforeIssueImages, setBeforeIssueImages] = useState([]);
  const [afterActionImages, setAfterActionImages] = useState([]);
  const [formData, setFormData] = useState({
    reportFormTypeID: '',
    systemNameWarehouseID: '',
    stationNameWarehouseID: '',
    systemDescription: '',
    stationName: '',
    projectNo: '',
    customer: '',
    jobNo: '', // Add jobNo to formData
    uploadStatus: 'Pending',
    uploadHostname: '',
    uploadIPAddress: '',
    formStatus: 'Draft'
  });

  useEffect(() => {
    const fetchReportFormTypes = async () => {
      try {
        const response = await getReportFormTypes();
        setReportFormTypes(response || []);
      } catch (error) {
        console.error('Error fetching report form types:', error);
        setError('Failed to load report form types');
      }
    };

    // Updated fetchNextJobNumber function using the service
    const fetchNextJobNumber = async () => {
      try {
        const data = await getNextJobNumber();
        setFormData(prev => ({ ...prev, jobNo: data.jobNumber }));
      } catch (error) {
        console.error('Error fetching job number:', error);
        if (error.response?.status === 401) {
          console.error('User not authenticated');
        } else if (error.response?.status === 404) {
          console.error('API endpoint not found - check if backend server is running');
        }
      }
    };

    fetchReportFormTypes();
    fetchNextJobNumber();
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Prevent double submission immediately
    if (loading) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Check if this is a CM report form
      const isCorrectiveMaintenance = formData.reportFormTypeID === 2 || 
        reportFormTypes.find(type => type.id === formData.reportFormTypeID)?.name?.toLowerCase().includes('corrective');
      
      let result;
      
      if (isCorrectiveMaintenance) {
        // Add user ID to formData before submission
        const formDataWithUser = {
          ...formData,
          userId: user.id
        };
        result = await submitCMReportForm(formDataWithUser, beforeIssueImages, afterActionImages);
        console.log('CM Report Form submitted successfully:', result);
      } else {
        // Use the generic submission for other types with complete data
        const completeFormData = {
          ReportFormTypeID: formData.reportFormTypeID,
          JobNo: formData.jobNo,
          SystemNameWarehouseID: formData.systemNameWarehouseID,
          StationNameWarehouseID: formData.stationNameWarehouseID,
          UploadStatus: formData.uploadStatus,
          UploadHostname: formData.uploadHostname,
          UploadIPAddress: formData.uploadIPAddress,
          FormStatus: formData.formStatus
        };
        result = await createReportForm(completeFormData);
        console.log('Report Form created successfully:', result);
      }
      
      // Update formData with the returned JobNo
      if (result && result.jobNo) {
        setFormData(prev => ({ ...prev, jobNo: result.jobNo }));
        setSuccessMessage(`Report form created successfully! Job No: ${result.jobNo}`);
        
        // Show success message for 3 seconds before navigating
        setTimeout(() => {
          navigate('/report-management-system/report-forms');
        }, 3000);
      } else {
        // If no JobNo returned, still navigate but show generic success
        setSuccessMessage('Report form created successfully!');
        setTimeout(() => {
          navigate('/report-management-system/report-forms');
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error creating report form:', error);
      setError('Failed to create report form: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Add function to handle image data from CMReportForm
  const handleImageDataUpdate = (beforeImages, afterImages) => {
    setBeforeIssueImages(beforeImages);
    setAfterActionImages(afterImages);
  };

  const getStepContent = (step) => {
    const isCorrectiveMaintenance = formData.reportFormTypeID === 2 || 
      reportFormTypes.find(type => type.id === formData.reportFormTypeID)?.name?.toLowerCase().includes('corrective');
    
    // Updated PM routing logic based on pmReportFormTypeName directly
    const isRTUPreventativeMaintenance = formData.pmReportFormTypeName && 
      formData.pmReportFormTypeName.toLowerCase() === 'rtu';
    
    const isServerPreventativeMaintenance = formData.pmReportFormTypeName && 
      formData.pmReportFormTypeName.toLowerCase() === 'server';
    
    const isLVPreventativeMaintenance = formData.pmReportFormTypeName && 
      formData.pmReportFormTypeName.toLowerCase() === 'lv pm';

    // Add combined preventive maintenance check
    const isPreventativeMaintenance = isRTUPreventativeMaintenance || isServerPreventativeMaintenance || isLVPreventativeMaintenance;

    switch (step) {
      case 0:
        return (
          <FirstContainer
            formData={formData}
            reportFormTypes={reportFormTypes}
            onInputChange={handleInputChange}
            onNext={handleNext}
          />
        );
      case 1:
        if (isCorrectiveMaintenance) {
          return (
            <CMReportForm
              formData={formData}
              reportFormTypes={reportFormTypes}
              onInputChange={handleInputChange}
              onNext={handleNext}
              onBack={handleBack}
              onImageDataUpdate={handleImageDataUpdate}
              initialBeforeIssueImages={beforeIssueImages}
              initialAfterActionImages={afterActionImages}
            />
          );
        }
        if (isRTUPreventativeMaintenance) {
          return (
            <RTUPMReportForm
              formData={formData}
              reportFormTypes={reportFormTypes}
              onInputChange={handleInputChange}
              onNext={handleNext}
              onBack={handleBack}
            />
          );
        }
        if (isServerPreventativeMaintenance) {
          return (
            <Box sx={{ padding: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Server PM Report Form - Coming Soon
              </Typography>
              <Button
                variant="outlined"
                onClick={handleBack}
                sx={{ marginTop: 2 }}
              >
                Back
              </Button>
            </Box>
          );
        }
        if (isLVPreventativeMaintenance) {
          return (
            <Box sx={{ padding: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                LV PM Report Form - Coming Soon
              </Typography>
              <Button
                variant="outlined"
                onClick={handleBack}
                sx={{ marginTop: 2 }}
              >
                Back
              </Button>
            </Box>
          );
        }
        return (
          <Box sx={{ padding: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Form type not supported yet. Please select Corrective Maintenance or Preventive Maintenance.
            </Typography>
            <Button
              variant="outlined"
              onClick={handleBack}
              sx={{ marginTop: 2 }}
            >
              Back
            </Button>
          </Box>
        );
      case 2:
        // Review & Submit step
        if (isCorrectiveMaintenance) {
          return (
            <CMReviewReportForm
              formData={formData}
              reportFormTypes={reportFormTypes}
              onNext={handleSubmit}
              onBack={handleBack}
              loading={loading}
              error={error}
            />
          );
        }
        if (isPreventativeMaintenance) {
          // Add PM review component when available
          return (
            <Box sx={{ padding: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                PM Review component not implemented yet.
              </Typography>
              <Button variant="outlined" onClick={handleBack} sx={{ marginTop: 2 }}>
                Back
              </Button>
            </Box>
          );
        }
        return (
          <Box sx={{ padding: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Review step not available for this form type.
            </Typography>
            <Button variant="outlined" onClick={handleBack} sx={{ marginTop: 2 }}>
              Back
            </Button>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ 
      padding: 3,
      background: 'white',
      minHeight: '100vh'
    }}>
      <Paper 
        elevation={0}
        sx={{ 
          padding: 4,
          background: 'white',
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        {/* Header with JobNo in top right corner */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 3
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#2C3E50',
              fontWeight: 'bold'
            }}
          >
            Create New Report Form
          </Typography>
          
          {/* JobNo display in top right corner */}
          <Box sx={{
            backgroundColor: '#f5f5f5',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#2C3E50',
                fontWeight: 'normal',
                fontSize: '14px',
                display: 'inline'
              }}
            >
              Job No: 
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#FF0000',
                fontWeight: 'bold',
                fontSize: '24px',
                display: 'inline',
                marginLeft: '8px'
              }}
            >
              {formData.jobNo || 'Loading...'}
            </Typography>
          </Box>
        </Box>

        <Stepper activeStep={activeStep} sx={{ 
          marginBottom: 4,
          '& .MuiStepLabel-root .Mui-completed': {
            color: '#27AE60'
          },
          '& .MuiStepLabel-root .Mui-active': {
            color: '#2C3E50'
          },
          '& .MuiStepLabel-label': {
            color: '#666666'
          },
          '& .MuiStepLabel-label.Mui-active': {
            color: '#2C3E50'
          },
          '& .MuiStepLabel-label.Mui-completed': {
            color: '#2C3E50'
          }
        }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ 
            marginBottom: 2,
            backgroundColor: '#ffebee',
            color: '#c62828'
          }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ 
            marginBottom: 2,
            backgroundColor: '#e8f5e8',
            color: '#2e7d32',
            fontWeight: 'bold'
          }}>
            {successMessage}
          </Alert>
        )}

        <Box sx={{ minHeight: '400px' }}>
          {getStepContent(activeStep)}
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportFormForm;