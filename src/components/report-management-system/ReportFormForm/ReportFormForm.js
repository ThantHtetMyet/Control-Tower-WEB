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
import { useAuth } from '../../contexts/AuthContext'; // Add this import
import RMSTheme from '../../theme-resource/RMSTheme';
import FirstContainer from './FirstContainer';
import CMReportForm from './CMReportForm';
import PMReportForm from './PMReportForm';
import { getReportFormTypes, createReportForm, submitCMReportForm } from '../../api-services/reportFormService';
// Add import at the top
import CMReviewReportForm from './CMReviewReportForm';

const steps = [
  'Basic Information',
  'Technical Details',
  'Review & Submit'
];

const ReportFormForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Add this line
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1 - Basic Information
    stationName: '',
    systemDescription: '',
    projectNo: '',
    customer: '',
    reportFormTypeID: '',
    
    // CM-specific fields
    failureDetectedDate: '',
    responseDate: '',
    arrivalDate: '',
    completionDate: '',
    
    // Step 2 - Technical Details
    technicalSpecs: '',
    equipmentDetails: '',
    installationDate: '',
    
    
    // Step 4 - Review
    reviewComments: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportFormTypes, setReportFormTypes] = useState([]);
  
  // Add state for storing images from CMReportForm
  const [beforeIssueImages, setBeforeIssueImages] = useState([]);
  const [afterActionImages, setAfterActionImages] = useState([]);

  useEffect(() => {
    fetchReportFormTypes();
  }, []);

  const fetchReportFormTypes = async () => {
    try {
      const response = await getReportFormTypes();
      setReportFormTypes(response);
    } catch (error) {
      console.error('Error fetching report form types:', error);
      setError('Failed to load report form types');
    }
  };

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
    
    try {
      // Check if this is a CM report form
      const isCorrectiveMaintenance = formData.reportFormTypeID === 2 || 
        reportFormTypes.find(type => type.id === formData.reportFormTypeID)?.name?.toLowerCase().includes('corrective');
      
      if (isCorrectiveMaintenance) {
        // Add user ID to formData before submission
        const formDataWithUser = {
          ...formData,
          userId: user.id // Use uppercase ID to match backend expectation
        };
        const result = await submitCMReportForm(formDataWithUser, beforeIssueImages, afterActionImages);
        console.log('CM Report Form submitted successfully:', result);
      } else {
        // Use the generic submission for other types
        await createReportForm(formData);
      }
      
      // Handle success
      navigate('/report-management-system/report-forms');
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
    const isPreventativeMaintenance = formData.reportFormTypeID === 1 || 
      reportFormTypes.find(type => type.id === formData.reportFormTypeID)?.name?.toLowerCase().includes('preventive');

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
              onImageDataUpdate={handleImageDataUpdate} // Pass the image handler
            />
          );
        }
        if (isPreventativeMaintenance) {
          return (
            <PMReportForm
              formData={formData}
              reportFormTypes={reportFormTypes}
              onInputChange={handleInputChange}
              onNext={handleNext}
              onBack={handleBack}
            />
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
              onNext={handleSubmit}  // This will now properly submit the form
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
              Review not available for this form type.
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
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            color: '#2C3E50',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 3
          }}
        >
          Create New Report Form
        </Typography>

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

        <Box sx={{ minHeight: '400px' }}>
          {getStepContent(activeStep)}
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportFormForm;