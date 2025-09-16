import api from './api';
import { API_BASE_URL } from '../../config/apiConfig';

// Report Form API calls
export const getReportForms = async (page = 1, pageSize = 10, search = '', reportFormTypeId = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  
  if (search) params.append('search', search);
  if (reportFormTypeId) params.append('reportFormTypeId', reportFormTypeId);
  
  const response = await api.get(`/reportform?${params}`);
  return response.data;
};

export const getReportForm = async (id) => {
  const response = await api.get(`/reportform/${id}`);
  return response.data;
};

export const createReportForm = async (reportFormData) => {
  // Ensure all required fields are present
  const completeData = {
    ReportFormTypeID: reportFormData.ReportFormTypeID,
    JobNo: reportFormData.JobNo,
    SystemNameWarehouseID: reportFormData.SystemNameWarehouseID,
    StationNameWarehouseID: reportFormData.StationNameWarehouseID,
    UploadStatus: reportFormData.UploadStatus || 'Pending',
    UploadHostname: reportFormData.UploadHostname || '',
    UploadIPAddress: reportFormData.UploadIPAddress || '',
    FormStatus: reportFormData.FormStatus || 'Draft'
  };
  
  const response = await api.post('/reportform', completeData);
  return response.data;
};

export const updateReportForm = async (id, reportFormData) => {
  const response = await api.put(`/reportform/${id}`, reportFormData);
  return response.data;
};

export const deleteReportForm = async (id) => {
  const response = await api.delete(`/reportform/${id}`);
  return response.data;
};


// Get next job number for report form
export const getNextJobNumber = async () => {
  const response = await api.get('/reportform/NextJobNumber');
  return response.data;
};

// Report Form Type API calls
export const getReportFormTypes = async () => {
  const response = await api.get('/reportformtype');
  return response.data;
};

export const getReportFormType = async (id) => {
  const response = await api.get(`/reportformtype/${id}`);
  return response.data;
};

export const createReportFormType = async (reportFormTypeData) => {
  const response = await api.post('/reportformtype', reportFormTypeData);
  return response.data;
};

export const updateReportFormType = async (id, reportFormTypeData) => {
  const response = await api.put(`/reportformtype/${id}`, reportFormTypeData);
  return response.data;
};

export const deleteReportFormType = async (id) => {
  const response = await api.delete(`/reportformtype/${id}`);
  return response.data;
};

// Get report forms by type
export const getReportFormsByType = async (reportFormTypeId) => {
  const response = await api.get(`/reportform/by-type/${reportFormTypeId}`);
  return response.data;
};

// CMReportForm API calls
export const createCMReportForm = async (cmReportFormData) => {
  const response = await api.post('/cmreportform', cmReportFormData);
  return response.data;
};

export const getCMReportForm = async (id) => {
  const response = await api.get(`/cmreportform/${id}`);
  return response.data;
};

export const updateCMReportForm = async (id, cmReportFormData) => {
  const response = await api.put(`/cmreportform/${id}`, cmReportFormData);
  return response.data;
};

// ReportFormImages API calls
// Updated createReportFormImage function
export const createReportFormImage = async (reportFormId, imageFile, reportFormImageTypeId) => {
    const formData = new FormData();
    
    // ⚠️ IMPORTANT: Use exact property names expected by backend DTO
    formData.append('ReportFormId', reportFormId);           // Must match: ReportFormId
    formData.append('ImageFile', imageFile);                 // Must match: ImageFile  
    formData.append('ReportFormImageTypeId', reportFormImageTypeId); // Must match: ReportFormImageTypeId
    
    const response = await api.post('/reportformimage/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getReportFormImages = async (reportFormId) => {
  const response = await api.get(`/reportformimage/reportform/${reportFormId}`);
  return response.data;
};

export const deleteReportFormImage = async (id) => {
  const response = await api.delete(`/reportformimage/${id}`);
  return response.data;
};

// ReportFormImageType API calls
export const getReportFormImageTypes = async () => {
  const response = await api.get('/reportformimagetype');
  return response.data;
};

export const getReportFormImageType = async (id) => {
  const response = await api.get(`/reportformimagetype/${id}`);
  return response.data;
};


// Complete submission flow for CM Report Form
export const submitCMReportForm = async (formData, beforeIssueImages, afterActionImages) => {
  try {
    // Step 0: Get ReportFormImageTypes to get correct GUID IDs
    const imageTypes = await getReportFormImageTypes();
    const beforeImageType = imageTypes.find(type => type.imageTypeName === 'Before');
    const afterImageType = imageTypes.find(type => type.imageTypeName === 'After');
    
    if (!beforeImageType || !afterImageType) {
      throw new Error('Required image types not found');
    }

    // Step 1: Create ReportForm entry with ALL required fields
    const reportFormData = {
      ReportFormTypeID: formData.reportFormTypeID,
      JobNo: formData.jobNo,  // ✅ Add JobNo
      SystemNameWarehouseID: formData.systemNameWarehouseID,  // ✅ Add SystemName FK
      StationNameWarehouseID: formData.stationNameWarehouseID,  // ✅ Add StationName FK
      UploadStatus: formData.uploadStatus,
      UploadHostname: formData.uploadHostname,
      UploadIPAddress: formData.uploadIPAddress,
      FormStatus: formData.formStatus
    };
    const reportForm = await createReportForm(reportFormData);
    
    // Step 2: Create CMReportForm entry (removed SystemName/StationName as they're now in ReportForm)
    const cmReportFormData = {
      reportFormID: reportForm.id,
      furtherActionTakenID: formData.furtherActionTakenID,
      formstatusID: formData.formstatusID,
      // ❌ Removed: stationName (now in ReportForm as FK)
      customer: formData.customer,
      projectNo: formData.projectNo,
      // ❌ Removed: systemDescription (now handled via FK relationship)
      issueReportedDescription: formData.issueReportedDescription,
      issueFoundDescription: formData.issueFoundDescription,
      actionTakenDescription: formData.actionTakenDescription,
      failureDetectedDate: formData.failureDetectedDate,
      responseDate: formData.responseDate,
      arrivalDate: formData.arrivalDate,
      completionDate: formData.completionDate,
      attendedBy: formData.attendedBy,
      approvedBy: formData.approvedBy,
      remark: formData.Remark,
      createdBy: formData.userId
    };
    const cmReportForm = await createCMReportForm(cmReportFormData);
    
    // Step 3: Upload before issue images with correct parameters
    const beforeImagePromises = beforeIssueImages.map(async (imageFile) => {
      return createReportFormImage(
        reportForm.id,                    // reportFormId
        imageFile,                       // imageFile
        beforeImageType.id               // reportFormImageTypeId (GUID)
      );
    });
    
    // Step 4: Upload after action images with correct parameters
    const afterImagePromises = afterActionImages.map(async (imageFile) => {
      return createReportFormImage(
        reportForm.id,                    // reportFormId
        imageFile,                       // imageFile  
        afterImageType.id                // reportFormImageTypeId (GUID)
      );
    });
    
    // Wait for all image uploads to complete
    await Promise.all([...beforeImagePromises, ...afterImagePromises]);
    
    return {
      success: true,
      reportForm,
      cmReportForm,
      jobNo: reportForm.jobNo,  // ✅ Return JobNo for frontend update
      message: 'CM Report Form submitted successfully'
    };
  } catch (error) {
    console.error('Error submitting CM Report Form:', error);
    throw error;
  }
};

// PM Report Form Types API calls
export const getPMReportFormTypes = async () => {
  const response = await api.get('/pmreportformtype');
  return response.data;
};

export const getPMReportFormType = async (id) => {
  const response = await api.get(`/pmreportformtype/${id}`);
  return response.data;
};
