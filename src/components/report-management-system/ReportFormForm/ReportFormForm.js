import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RMSTheme from '../../theme-resource/RMSTheme';
import FirstContainer from './FirstContainer';
import CMReportForm from './CMReportForm';
import RTUPMReportForm from './RTUPMReportForm'; // Updated import
import ServerPMReportForm from './Server_PMReportForm/ServerPMReportForm'; // Add Server PM import
import { getReportFormTypes, createReportForm, submitCMReportForm, submitRTUPMReportForm, submitServerPMReportForm, getNextJobNumber, uploadFinalReportAttachment, createReportFormImage, getReportFormImageTypes, generateCMFinalReportPdf, generateRTUPMFinalReportPdf, getFinalReportsByReportForm, downloadFinalReportAttachment } from '../../api-services/reportFormService';
import warehouseService from '../../api-services/warehouseService';
import CMReviewReportForm from './CMReviewReportForm';
import RTUPMReviewReportForm from './RTUPMReviewReportForm';
import ServerPMReviewReportForm from './Server_PMReportForm_Review/ServerPMReviewReportForm'; // Add Server PM import

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
  const [formStatusOptions, setFormStatusOptions] = useState([]);
  const [imageTypes, setImageTypes] = useState([]);

  // Add toast notification state
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Add notification state for CM reports
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Add CM material used data state management
  const [materialUsedData, setMaterialUsedData] = useState([]);
  const [materialUsedOldSerialImages, setMaterialUsedOldSerialImages] = useState([]);
  const [materialUsedNewSerialImages, setMaterialUsedNewSerialImages] = useState([]);

  // Add RTU PM data state management
  const [rtuPMData, setRtuPMData] = useState({
    pmMainRtuCabinetImages: [],
    pmChamberMagneticContactImages: [],
    pmRTUCabinetCoolingImages: [],
    pmDVREquipmentImages: [],
    mainRTUCabinetData: [],
    pmChamberMagneticContactData: [],
    pmRTUCabinetCoolingData: [],
    pmDVREquipmentData: []
  });

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
    formstatusID: '',
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

    const fetchFormStatuses = async () => {
      try {
        const statuses = await warehouseService.getFormStatus();
        setFormStatusOptions(statuses || []);
      } catch (error) {
        console.error('Error fetching form status options:', error);
      }
    };

    const fetchImageTypes = async () => {
      try {
        const types = await getReportFormImageTypes();
        setImageTypes(types || []);
      } catch (error) {
        console.error('Error fetching image types:', error);
      }
    };

    // Updated fetchNextJobNumber function using the service
    const fetchNextJobNumber = async () => {
      try {
        const data = await getNextJobNumber();
        setFormData(prev => ({ ...prev, jobNo: data.jobNumber }));
      } catch (error) {
        // console.error('Error fetching job number:', error);
        if (error.response?.status === 401) {
          // console.error('User not authenticated');
        } else if (error.response?.status === 404) {
          // console.error('API endpoint not found - check if backend server is running');
        }
      }
    };

    fetchReportFormTypes();
    fetchFormStatuses();
    fetchImageTypes();
    fetchNextJobNumber();
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };


  // Updated RTU PM detection logic
  const isRTUPreventativeMaintenance = formData.pmReportFormTypeName === 'RTU' ||
    (formData.reportFormTypeID && reportFormTypes.some(type =>
      type.id === formData.reportFormTypeID &&
      type.name?.toLowerCase().includes('preventative') &&
      type.name?.toLowerCase().includes('rtu')
    ));

  // Alternative: Check if we have any RTU PM data regardless of arrays being populated
  const hasRTUPMData = rtuPMData && (
    Array.isArray(rtuPMData.mainRTUCabinetData) ||
    Array.isArray(rtuPMData.pmChamberMagneticContactData) ||
    Array.isArray(rtuPMData.pmRTUCabinetCoolingData) ||
    Array.isArray(rtuPMData.pmDVREquipmentData)
  );

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to download the final report after saving
  const downloadSavedFinalReport = async (reportFormId, jobNo) => {
    try {
      // Wait a bit for the final report to be created in the database
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Fetch the final reports for this report form
      const finalReports = await getFinalReportsByReportForm(reportFormId);
      
      if (finalReports && finalReports.length > 0) {
        // Get the most recent final report (first one)
        const latestReport = finalReports[0];
        
        // Download the final report
        const response = await downloadFinalReportAttachment(latestReport.id);
        const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileName = latestReport.attachmentName || `FinalReport_${jobNo || 'report'}.pdf`;
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        
        console.log('Final report downloaded successfully:', fileName);
      } else {
        console.log('No final reports found for download');
      }
    } catch (downloadError) {
      console.error('Error downloading final report:', downloadError);
      // Don't show error to user - the report was still saved successfully
    }
  };

  const handleSubmit = async (uploadData = null) => {
    // Prevent double submission immediately
    if (loading) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Extract upload data (handle both old finalReportFile param and new uploadData object)
      let finalReportFile = null;
      let attendedBySignature = null;
      let approvedBySignature = null;
      
      if (uploadData && typeof uploadData === 'object' && uploadData.constructor === Object) {
        // uploadData is an object with properties
        finalReportFile = uploadData.finalReportFile || null;
        attendedBySignature = uploadData.attendedBySignature || null;
        approvedBySignature = uploadData.approvedBySignature || null;
      } else if (uploadData instanceof File) {
        // uploadData is a direct File (backward compatibility)
        finalReportFile = uploadData;
      }

      // Get signature image type IDs dynamically from API
      const attendedByImageType = imageTypes.find(type => type.imageTypeName === 'AttendedBySignature');
      const approvedByImageType = imageTypes.find(type => type.imageTypeName === 'ApprovedBySignature');
      
      if ((attendedBySignature || approvedBySignature) && (!attendedByImageType || !approvedByImageType)) {
        console.error('Signature image types not found:', { attendedByImageType, approvedByImageType });
        setError('Failed to find signature image types. Please refresh and try again.');
        setLoading(false);
        return false;
      }

      // Check if this is a CM report form
      const isCorrectiveMaintenance = reportFormTypes.find(type => type.id === formData.reportFormTypeID)?.name?.toLowerCase().includes('corrective');

      // Check if this is a PM report form (generic check first)
      // Remove the hardcoded ID check (=== 1) since IDs are UUIDs
      const isPreventativeMaintenance =
        reportFormTypes.find(type => type.id === formData.reportFormTypeID)?.name?.toLowerCase().includes('preventative');

      // More specific check for RTU PM reports
      const isRTUPreventativeMaintenance = isPreventativeMaintenance && (
        formData.pmReportFormTypeName?.toLowerCase() === 'rtu' ||
        // Fallback: check if we're in RTU PM context by checking if rtuPMData has content
        (rtuPMData.mainRTUCabinetData && rtuPMData.mainRTUCabinetData.length > 0)
      );

      // More specific check for Server PM reports
      const isServerPreventativeMaintenance = isPreventativeMaintenance && (
        formData.pmReportFormTypeName?.toLowerCase() === 'server' ||
        // Fallback: check if we're in Server PM context by checking if serverPMData has content
        (formData.serverHealthData || formData.hardDriveHealthData || formData.diskUsageData)
      );

      let result;

      if (isCorrectiveMaintenance) {
        // Add user ID to formData before submission
        const formDataWithUser = {
          ...formData,
          userId: user.id
        };
        result = await submitCMReportForm(
          formDataWithUser,
          beforeIssueImages,
          afterActionImages,
          materialUsedData,
          materialUsedOldSerialImages,
          materialUsedNewSerialImages
        );
        // console.log('CM Report Form submitted successfully:', result);

        // After saving, upload final report or signatures if provided
        const newReportFormId = result?.reportForm?.id || result?.reportForm?.ID;
        if (!newReportFormId) {
          setError('Report saved, but failed to retrieve the ReportForm ID.');
          return false;
        }

        // Check if signatures were uploaded (declare outside try block for later use)
        const signaturesUploaded = !!(attendedBySignature && approvedBySignature);

        try {
          // Upload final report PDF if provided
          if (finalReportFile) {
            await uploadFinalReportAttachment(newReportFormId, finalReportFile);
          }

          // Upload signatures if provided and generate final report PDF
          
          if (attendedBySignature && attendedByImageType) {
            await createReportFormImage(newReportFormId, attendedBySignature, attendedByImageType.id, 'Signatures');
          }

          if (approvedBySignature && approvedByImageType) {
            await createReportFormImage(newReportFormId, approvedBySignature, approvedByImageType.id, 'Signatures');
          }

          // If signatures were uploaded (instead of PDF), trigger final report PDF generation
          if (signaturesUploaded && !finalReportFile) {
            try {
              console.log(`Generating final report PDF for ReportForm ID: ${newReportFormId}`);
              await generateCMFinalReportPdf(newReportFormId);
              console.log('Final report PDF generated successfully');
            } catch (pdfError) {
              console.error('Error generating final report PDF:', pdfError);
              // Don't fail the whole submission - PDF can be generated later
              setNotification({
                open: true,
                message: 'Report created successfully, but final report PDF generation is in progress.',
                severity: 'warning'
              });
            }
          }

          // Download the final report after it's saved (for both upload and signature options)
          if (finalReportFile || signaturesUploaded) {
            // Use longer delay for signature-based PDFs since they need to be generated
            const downloadDelay = signaturesUploaded && !finalReportFile ? 3000 : 1000;
            setTimeout(() => {
              downloadSavedFinalReport(newReportFormId, formData.jobNo);
            }, downloadDelay);
          }
        } catch (uploadError) {
          setError(uploadError?.response?.data?.message || 'Failed to upload attachments.');
          return false;
        }

        // Show success toast for CM reports
        setNotification({
          open: true,
          message: signaturesUploaded && !finalReportFile 
            ? 'CM Report created successfully! Final report PDF is being generated and will download shortly...' 
            : 'CM Report Form created successfully! Downloading final report...',
          severity: 'success'
        });

        // Navigate after a short delay to show the toast
        setTimeout(() => {
          navigate('/report-management-system/report-forms');
        }, 4000);

        // Return the result object so ReportForm ID can be extracted
        return result;
      } else if (isServerPreventativeMaintenance) {
        // console.log("Server Preventative Maintenance is working");
        // Handle Server PM report submission
        result = await submitServerPMReportForm(formData, user);
        // After saving, upload final report or signatures if provided
        const newReportFormId = result?.reportForm?.id || result?.reportForm?.ID;
        if (!newReportFormId) {
          setError('Report saved, but failed to retrieve the ReportForm ID.');
          return false;
        }

        try {
          // Upload final report PDF if provided
          if (finalReportFile) {
            await uploadFinalReportAttachment(newReportFormId, finalReportFile);
          }

          // Upload signatures if provided
          if (attendedBySignature && attendedByImageType) {
            await createReportFormImage(newReportFormId, attendedBySignature, attendedByImageType.id, 'Signatures');
          }

          if (approvedBySignature && approvedByImageType) {
            await createReportFormImage(newReportFormId, approvedBySignature, approvedByImageType.id, 'Signatures');
          }

          // Download the final report after it's saved (for upload option)
          if (finalReportFile) {
            setTimeout(() => {
              downloadSavedFinalReport(newReportFormId, formData.jobNo);
            }, 1000);
          }
        } catch (uploadError) {
          setError(uploadError?.response?.data?.message || 'Failed to upload attachments.');
          return false;
        }

        // Show success toast for Server PM reports
        setShowSuccessToast(true);

        // Navigate after a short delay to show the toast
        setTimeout(() => {
          navigate('/report-management-system/report-forms');
        }, finalReportFile ? 4000 : 2000);

        // Return the result object so ReportForm ID can be extracted
        return result;
      } else if (isRTUPreventativeMaintenance) {
        // Handle RTU PM report submission
        result = await submitRTUPMReportForm(formData, rtuPMData, user);

        // After saving, upload final report or signatures if provided
        const newReportFormId = result?.reportForm?.id || result?.reportForm?.ID;
        if (!newReportFormId) {
          setError('Report saved, but failed to retrieve the ReportForm ID.');
          return false;
        }

        // Check if signatures were uploaded (declare outside try block for later use)
        const signaturesUploaded = !!(attendedBySignature && approvedBySignature);

        try {
          // Upload final report PDF if provided
          if (finalReportFile) {
            await uploadFinalReportAttachment(newReportFormId, finalReportFile);
          }

          // Upload signatures if provided
          if (attendedBySignature && attendedByImageType) {
            await createReportFormImage(newReportFormId, attendedBySignature, attendedByImageType.id, 'Signatures');
          }

          if (approvedBySignature && approvedByImageType) {
            await createReportFormImage(newReportFormId, approvedBySignature, approvedByImageType.id, 'Signatures');
          }

          // If signatures were uploaded (instead of PDF), trigger final report PDF generation
          if (signaturesUploaded && !finalReportFile) {
            try {
              console.log(`Generating RTU PM final report PDF for ReportForm ID: ${newReportFormId}`);
              await generateRTUPMFinalReportPdf(newReportFormId);
              console.log('RTU PM final report PDF generated successfully');
            } catch (pdfError) {
              console.error('Error generating RTU PM final report PDF:', pdfError);
              // Don't fail the entire submission if PDF generation fails
            }
          }

          // Download the final report after it's saved (for both upload and signature options)
          if (finalReportFile || signaturesUploaded) {
            setTimeout(() => {
              downloadSavedFinalReport(newReportFormId, formData.jobNo);
            }, finalReportFile ? 1000 : 2000); // Wait longer for signature-generated PDFs
          }
        } catch (uploadError) {
          setError(uploadError?.response?.data?.message || 'Failed to upload attachments.');
          return false;
        }

        // Show success toast for RTU PM reports
        setShowSuccessToast(true);

        // Navigate after a short delay to show the toast (longer if downloading final report)
        setTimeout(() => {
          navigate('/report-management-system/report-forms');
        }, (finalReportFile || signaturesUploaded) ? 4000 : 2000);

        // Return the result object so ReportForm ID can be extracted
        return result;
      } else if (isPreventativeMaintenance) {
        // console.log("Other PM type (not RTU) - not implemented yet");
        throw new Error('This PM report type is not yet implemented');
      } else {
        // console.log("OTHERS Report Form is working");
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

      return true;

    } catch (error) {
      // console.error('Error creating report form:', error);
      setError('Failed to create report form: ' + (error.message || 'Unknown error'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Add function to handle image data from CMReportForm
  const handleImageDataUpdate = (beforeImages, afterImages) => {
    setBeforeIssueImages(beforeImages);
    setAfterActionImages(afterImages);
  };

  // Add function to handle material used data from CMReportForm
  const handleMaterialUsedDataUpdate = (materialData, oldSerialImages, newSerialImages) => {
    setMaterialUsedData(materialData);
    setMaterialUsedOldSerialImages(oldSerialImages);
    setMaterialUsedNewSerialImages(newSerialImages);
  };

  // Add Server PM data state management
  const [serverPMData, setServerPMData] = useState({
    serverHealthData: [{ serverName: '', result: '' }],
    serverHealthImages: [],
    serverHealthPreviews: [],
    remarks: ''
  });

  // Add function to handle Server PM data update
  const handleServerPMDataUpdate = (data) => {
    setServerPMData(data);
  };

  // Handle close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const getStepContent = (step) => {
    const isCorrectiveMaintenance = formData.reportFormTypeID === 2 ||
      reportFormTypes.find(type => type.id === formData.reportFormTypeID)?.name?.toLowerCase().includes('corrective');

    const isRTUPreventativeMaintenance = formData.pmReportFormTypeName &&
      formData.pmReportFormTypeName.toLowerCase() === 'rtu';

    const isServerPreventativeMaintenance = formData.pmReportFormTypeName &&
      formData.pmReportFormTypeName.toLowerCase().includes('server');

    const isLVPreventativeMaintenance = formData.pmReportFormTypeName &&
      formData.pmReportFormTypeName.toLowerCase() === 'lv pm';

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
              onMaterialUsedDataUpdate={handleMaterialUsedDataUpdate}
              initialMaterialUsedData={materialUsedData}
              initialMaterialUsedOldSerialImages={materialUsedOldSerialImages}
              initialMaterialUsedNewSerialImages={materialUsedNewSerialImages}
            />
          );
        }
        if (isRTUPreventativeMaintenance) {
          return (
            <RTUPMReportForm
              formData={formData}
              formStatusOptions={formStatusOptions}
              reportFormTypes={reportFormTypes}
              onInputChange={handleInputChange}
              onNext={handleNext}
              onBack={handleBack}
              onRTUPMDataUpdate={handleRTUPMDataUpdate}
              initialRTUPMData={rtuPMData}
            />
          );
        }
        if (isServerPreventativeMaintenance) {
          return (
            <ServerPMReportForm
              formData={formData}
              formStatusOptions={formStatusOptions}
              reportFormTypes={reportFormTypes}
              onInputChange={handleInputChange}
              onNext={handleNext}
              onBack={handleBack}
              onServerPMDataUpdate={handleServerPMDataUpdate}
              initialServerPMData={serverPMData}
            />
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
              materialUsedData={materialUsedData}
              materialUsedOldSerialImages={materialUsedOldSerialImages}
              materialUsedNewSerialImages={materialUsedNewSerialImages}
              user={user}
            />
          );
        }
        if (isRTUPreventativeMaintenance) {
          return (
            <RTUPMReviewReportForm
              formData={formData}
              reportFormTypes={reportFormTypes}
              formStatusOptions={formStatusOptions}
              onNext={handleSubmit}
              onBack={handleBack}
              loading={loading}
              error={error}
              rtuPMData={rtuPMData}
            />
          );
        }
        if (isServerPreventativeMaintenance) {
          return (
            <ServerPMReviewReportForm
              formData={formData}
              reportFormTypes={reportFormTypes}
              formStatusOptions={formStatusOptions}
              onNext={handleSubmit}
              onBack={handleBack}
              loading={loading}
              error={error}
              serverPMData={formData}
            />
          );
        }
        if (isPreventativeMaintenance) {
          // Other PM types - keep existing placeholder
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

  // Add function to handle RTU PM data update
  const handleRTUPMDataUpdate = (data) => {
    setRtuPMData(data);
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

      {/* Success Toast Notification */}
      <Snackbar
        open={showSuccessToast}
        autoHideDuration={6000}
        onClose={() => setShowSuccessToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowSuccessToast(false)}
          severity="success"
          sx={{
            width: '100%',
            backgroundColor: '#4caf50',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            '& .MuiAlert-action': {
              color: 'white'
            }
          }}
        >
          RTU Report Form created successfully!
        </Alert>
      </Snackbar>

      {/* CM Report Success Toast Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{
            width: '100%',
            backgroundColor: notification.severity === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            '& .MuiAlert-action': {
              color: 'white'
            }
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportFormForm;