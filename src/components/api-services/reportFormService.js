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

// Add this function to get CM Report Form by ReportForm ID
export const getCMReportFormByReportFormId = async (reportFormId) => {
  const response = await api.get(`/cmreportform/ByReportForm/${reportFormId}`);
  return response.data;
};

export const updateCMReportForm = async (id, cmReportFormData) => {
  const response = await api.put(`/cmreportform/${id}`, cmReportFormData);
  return response.data;
};

// ReportFormImages API calls
// Updated createReportFormImage function with section support
export const createReportFormImage = async (reportFormId, imageFile, reportFormImageTypeId, sectionName = null) => {
    const formData = new FormData();
    
    // ⚠️ IMPORTANT: Use exact property names expected by backend DTO
    formData.append('ReportFormId', reportFormId);           // Must match: ReportFormId
    formData.append('ImageFile', imageFile);                 // Must match: ImageFile  
    formData.append('ReportFormImageTypeId', reportFormImageTypeId); // Must match: ReportFormImageTypeId
    
    // Add section name if provided for folder organization
    if (sectionName) {
        formData.append('SectionName', sectionName);         // Must match: SectionName
    }
    
    const response = await api.post('/reportformimage/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getReportFormImages = async (reportFormId) => {
  const response = await api.get(`/reportformimage/ByReportForm/${reportFormId}`);
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
export const submitCMReportForm = async (formData, beforeIssueImages, afterActionImages, materialUsedData = [], materialUsedOldSerialImages = [], materialUsedNewSerialImages = []) => {
  try {
    // Step 0: Get ReportFormImageTypes to get correct GUID IDs
    const imageTypes = await getReportFormImageTypes();
    const beforeImageType = imageTypes.find(type => type.imageTypeName === 'CMBeforeIssueImage');
    const afterImageType = imageTypes.find(type => type.imageTypeName === 'CMAfterIssueImage');
    const materialUsedOldSerialImageType = imageTypes.find(type => type.imageTypeName === 'CMMaterialUsedOldSerialNo');
    const materialUsedNewSerialImageType = imageTypes.find(type => type.imageTypeName === 'CMMaterialUsedNewSerialNo');
    
    if (!beforeImageType || !afterImageType) {
      throw new Error('Required image types not found');
    }

    // Step 1: Create ReportForm entry with ALL required fields
    const reportFormData = {
      ReportFormTypeID: formData.reportFormTypeID,
      JobNo: formData.jobNo,
      SystemNameWarehouseID: formData.systemNameWarehouseID,
      StationNameWarehouseID: formData.stationNameWarehouseID,
      UploadStatus: formData.uploadStatus,
      UploadHostname: formData.uploadHostname,
      UploadIPAddress: formData.uploadIPAddress,
      FormStatus: formData.formStatus
    };
    const reportForm = await createReportForm(reportFormData);
    
    // Step 2: Create CMReportForm entry
    const cmReportFormData = {
      reportFormID: reportForm.id,
      furtherActionTakenID: formData.furtherActionTakenID,
      formstatusID: formData.formstatusID,
      customer: formData.customer,
      projectNo: formData.projectNo,
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
    const cmReportFormResponse = await createCMReportForm(cmReportFormData);
    
    // Fix: Extract the actual CMReportForm data from the response
    // The backend returns CreatedAtAction which wraps the data
    const cmReportForm = cmReportFormResponse.value || cmReportFormResponse;
    
    // Validate that we have the CMReportForm ID
    if (!cmReportForm || !cmReportForm.id) {
      console.error('CMReportForm creation failed - no ID returned:', cmReportFormResponse);
      throw new Error('Failed to create CMReportForm - no ID returned from server');
    }
    
    // Step 3: Create CMMaterialUsed entries if material used data exists
    if (materialUsedData && materialUsedData.length > 0) {
      const materialUsedPromises = materialUsedData.map(async (materialItem) => {
        const materialUsedData = {
          cmReportFormID: cmReportForm.id,
          itemDescription: materialItem.ItemDescription,
          newSerialNo: materialItem.NewSerialNo,
          oldSerialNo: materialItem.OldSerialNo,
          remark: materialItem.Remark,
          createdBy: formData.userId
        };
        return createCMMaterialUsed(materialUsedData);
      });
      
      await Promise.all(materialUsedPromises);
    }
    
    // Step 4: Upload before issue images - using specific folder name
    const beforeImagePromises = beforeIssueImages.map(async (imageFile) => {
      return createReportFormImage(
        reportForm.id,                    // reportFormId
        imageFile,                       // imageFile
        beforeImageType.id,              // reportFormImageTypeId (GUID)
        'BeforeIssue'                    // Use "BeforeIssue" as folder name
      );
    });
    
    // Step 5: Upload after action images - using specific folder name
    const afterImagePromises = afterActionImages.map(async (imageFile) => {
      return createReportFormImage(
        reportForm.id,                    // reportFormId
        imageFile,                       // imageFile
        afterImageType.id,               // reportFormImageTypeId (GUID)
        'AfterAction'                    // Use "AfterAction" as folder name
      );
    });
    
    // Step 6: Upload material used old serial images - using specific folder name
    const materialUsedOldSerialPromises = materialUsedOldSerialImages.map(async (imageFile) => {
      return createReportFormImage(
        reportForm.id,                           // reportFormId
        imageFile,                              // imageFile
        materialUsedOldSerialImageType.id,      // reportFormImageTypeId (GUID)
        'OldSerialNo'                           // Use "OldSerialNo" as folder name
      );
    });
    
    // Step 7: Upload material used new serial images - using specific folder name
    const materialUsedNewSerialPromises = materialUsedNewSerialImages.map(async (imageFile) => {
      return createReportFormImage(
        reportForm.id,                           // reportFormId
        imageFile,                              // imageFile
        materialUsedNewSerialImageType.id,      // reportFormImageTypeId (GUID)
        'NewSerialNo'                           // Use "NewSerialNo" as folder name
      );
    });
    
    // Wait for all image uploads to complete
    await Promise.all([
      ...beforeImagePromises, 
      ...afterImagePromises,
      ...materialUsedOldSerialPromises,
      ...materialUsedNewSerialPromises
    ]);
    
    return {
      success: true,
      reportForm,
      cmReportForm,
      jobNo: reportForm.jobNo,
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

// RTU PM Report specific functions
export const createRTUPMReportForm = async (rtuPMReportFormData) => {
  const response = await api.post('/pmreportformrtu', rtuPMReportFormData);
  return response.data;
};

export const createRTUPMMainRtuCabinet = async (pmMainRtuCabinetData) => {
  const response = await api.post('/pmmainrtucabinet', pmMainRtuCabinetData);
  return response.data;
};

export const createRTUPMChamberMagneticContact = async (pmChamberData) => {
  const response = await api.post('/pmchambermagneticcontact', pmChamberData);
  return response.data;
};

export const createRTUPMRTUCabinetCooling = async (pmCoolingData) => {
  const response = await api.post('/pmrtucabinetcooling', pmCoolingData);
  return response.data;
};

export const createRTUPMDVREquipment = async (pmDVRData) => {
  const response = await api.post('/pmdvrequipment', pmDVRData);
  return response.data;
};

export const submitRTUPMReportForm = async (formData, rtuPMData, user) => {
  try {
    // Add comprehensive debug logging
    console.log('=== RTU PM SUBMISSION DEBUG ===');
    console.log('Form Data:', formData);
    console.log('RTU PM Data received:', rtuPMData);
    console.log('Main RTU Cabinet Data length:', rtuPMData.mainRTUCabinetData?.length);
    console.log('Main RTU Cabinet Data:', rtuPMData.mainRTUCabinetData);
    console.log('Chamber Data length:', rtuPMData.pmChamberMagneticContactData?.length);
    console.log('Chamber Data:', rtuPMData.pmChamberMagneticContactData);
    console.log('Cooling Data length:', rtuPMData.pmRTUCabinetCoolingData?.length);
    console.log('Cooling Data:', rtuPMData.pmRTUCabinetCoolingData);
    console.log('DVR Data length:', rtuPMData.pmDVREquipmentData?.length);
    console.log('DVR Data:', rtuPMData.pmDVREquipmentData);
    console.log('User:', user);

    // Validate that this is indeed an RTU PM report
    const isRTUPreventativeMaintenance = formData.pmReportFormTypeName && 
      formData.pmReportFormTypeName.toLowerCase() === 'rtu';
    
    if (!isRTUPreventativeMaintenance) {
      throw new Error('This function is only for RTU PM reports');
    }

    // Step 0: Get ReportFormImageTypes for RTU PM images
    const imageTypes = await getReportFormImageTypes();
    const pmMainRtuImageType = imageTypes.find(type => type.imageTypeName === 'PMMainRtuCabinet');
    const pmChamberImageType = imageTypes.find(type => type.imageTypeName === 'PMChamberMagneticContact');
    const pmCoolingImageType = imageTypes.find(type => type.imageTypeName === 'PMRTUCabinetCooling');
    const pmDVRImageType = imageTypes.find(type => type.imageTypeName === 'PMDVREquipment');

    // Step 1: Create ReportForm entry
    const reportFormData = {
      ReportFormTypeID: formData.reportFormTypeID,
      JobNo: formData.jobNo,
      SystemNameWarehouseID: formData.systemNameWarehouseID,
      StationNameWarehouseID: formData.stationNameWarehouseID,
      UploadStatus: formData.uploadStatus,
      UploadHostname: formData.uploadHostname,
      UploadIPAddress: formData.uploadIPAddress,
      FormStatus: formData.formStatus
    };
    console.log('Creating ReportForm with data:', reportFormData);
    const reportForm = await createReportForm(reportFormData);
    console.log('ReportForm created:', reportForm);

    // Step 2: Create PMReportFormRTU entry (RTU-specific)
    const rtuPMReportFormData = {
      reportFormID: reportForm.id,
      pmReportFormTypeID: formData.pmReportFormTypeID,
      reportTitle: formData.reportTitle || '',
      projectNo: formData.projectNo,
      customer: formData.customer,
      dateOfService: formData.dateOfService,
      timeOfService: formData.timeOfService,
      cleaningOfCabinet: formData.cleaningStatus,
      remarks: formData.remarks,
      attendedBy: formData.attendedBy,
      approvedBy: formData.approvedBy,
      createdBy: user.id
    };
    console.log('Creating RTU PM ReportForm with data:', rtuPMReportFormData);
    const rtuPMReportForm = await createRTUPMReportForm(rtuPMReportFormData);
    console.log('RTU PM ReportForm created:', rtuPMReportForm);
    console.log('RTU PM ReportForm ID to use for foreign key:', rtuPMReportForm.id); // Changed from .ID to .id

    // Validate that we have the required arrays and they're not empty
    if (!rtuPMData.mainRTUCabinetData || !Array.isArray(rtuPMData.mainRTUCabinetData)) {
      console.warn('mainRTUCabinetData is not an array or is missing');
      rtuPMData.mainRTUCabinetData = [];
    }
    if (!rtuPMData.pmChamberMagneticContactData || !Array.isArray(rtuPMData.pmChamberMagneticContactData)) {
      console.warn('pmChamberMagneticContactData is not an array or is missing');
      rtuPMData.pmChamberMagneticContactData = [];
    }
    if (!rtuPMData.pmRTUCabinetCoolingData || !Array.isArray(rtuPMData.pmRTUCabinetCoolingData)) {
      console.warn('pmRTUCabinetCoolingData is not an array or is missing');
      rtuPMData.pmRTUCabinetCoolingData = [];
    }
    if (!rtuPMData.pmDVREquipmentData || !Array.isArray(rtuPMData.pmDVREquipmentData)) {
      console.warn('pmDVREquipmentData is not an array or is missing');
      rtuPMData.pmDVREquipmentData = [];
    }

    // Step 3: Create RTU PM Main RTU Cabinet entries
    console.log(`Processing ${rtuPMData.mainRTUCabinetData.length} Main RTU Cabinet entries`);
    const pmMainRtuPromises = rtuPMData.mainRTUCabinetData.map(async (cabinetData, index) => {
      const pmMainRtuData = {
        PMReportFormRTUID: rtuPMReportForm.id, // Changed from .ID to .id
        RTUCabinet: cabinetData.RTUCabinet,
        EquipmentRack: cabinetData.EquipmentRack,
        Monitor: cabinetData.Monitor,
        MouseKeyboard: cabinetData.MouseKeyboard,
        CPU6000Card: cabinetData.CPU6000Card,
        InputCard: cabinetData.InputCard,
        MegapopNTU: cabinetData.MegapopNTU,
        NetworkRouter: cabinetData.NetworkRouter,
        NetworkSwitch: cabinetData.NetworkSwitch,
        DigitalVideoRecorder: cabinetData.DigitalVideoRecorder,
        RTUDoorContact: cabinetData.RTUDoorContact,
        PowerSupplyUnit: cabinetData.PowerSupplyUnit,
        UPSTakingOverTest: cabinetData.UPSTakingOverTest,
        UPSBattery: cabinetData.UPSBattery,
        Remarks: cabinetData.Remarks
      };
      console.log(`Creating Main RTU Cabinet entry ${index + 1}:`, pmMainRtuData);
      return createRTUPMMainRtuCabinet(pmMainRtuData);
    });

    // Step 4: Create RTU PM Chamber Magnetic Contact entries
    console.log(`Processing ${rtuPMData.pmChamberMagneticContactData.length} Chamber entries`);
    const pmChamberPromises = rtuPMData.pmChamberMagneticContactData.map(async (chamberData, index) => {
      const pmChamberContactData = {
        PMReportFormRTUID: rtuPMReportForm.id, // Changed from .ID to .id
        ChamberNumber: chamberData.ChamberNumber,
        ChamberOGBox: chamberData.ChamberOGBox,
        ChamberContact1: chamberData.ChamberContact1,
        ChamberContact2: chamberData.ChamberContact2,
        ChamberContact3: chamberData.ChamberContact3,
        Remarks: chamberData.Remarks
      };
      console.log(`Creating Chamber entry ${index + 1}:`, pmChamberContactData);
      return createRTUPMChamberMagneticContact(pmChamberContactData);
    });

    // Step 5: Create RTU PM RTU Cabinet Cooling entries
    console.log(`Processing ${rtuPMData.pmRTUCabinetCoolingData.length} Cooling entries`);
    const pmCoolingPromises = rtuPMData.pmRTUCabinetCoolingData.map(async (coolingData, index) => {
      const pmCoolingContactData = {
        PMReportFormRTUID: rtuPMReportForm.id, // Changed from .ID to .id
        FanNumber: coolingData.FanNumber,
        FunctionalStatus: coolingData.FunctionalStatus,
        Remarks: coolingData.Remarks
      };
      console.log(`Creating Cooling entry ${index + 1}:`, pmCoolingContactData);
      return createRTUPMRTUCabinetCooling(pmCoolingContactData);
    });

    // Step 6: Create RTU PM DVR Equipment entries
    console.log(`Processing ${rtuPMData.pmDVREquipmentData.length} DVR entries`);
    const pmDVRPromises = rtuPMData.pmDVREquipmentData.map(async (dvrData, index) => {
      const pmDVRContactData = {
        PMReportFormRTUID: rtuPMReportForm.id, // Changed from .ID to .id
        DVRComm: dvrData.DVRComm,
        DVRRAIDComm: dvrData.DVRRAIDComm,
        TimeSyncNTPServer: dvrData.TimeSyncNTPServer,
        Recording24x7: dvrData.Recording24x7,
        Remarks: dvrData.Remarks
      };
      console.log(`Creating DVR entry ${index + 1}:`, pmDVRContactData);
      return createRTUPMDVREquipment(pmDVRContactData);
    });

    // Wait for all RTU PM data entries to be created
    console.log('Waiting for all PM entries to be created...');
    await Promise.all([...pmMainRtuPromises, ...pmChamberPromises, ...pmCoolingPromises, ...pmDVRPromises]);
    console.log('All PM entries created successfully');

    // Step 7: Upload images for each RTU PM section with section-specific folders
    const imageUploadPromises = [];

    // RTU PM Main RTU Cabinet images - stored in "PMMainRtuCabinets" folder
    if (pmMainRtuImageType && rtuPMData.pmMainRtuCabinetImages) {
      const pmMainRtuImagePromises = rtuPMData.pmMainRtuCabinetImages.map(async (imageFile) => {
        return createReportFormImage(reportForm.id, imageFile, pmMainRtuImageType.id, 'PMMainRtuCabinets');
      });
      imageUploadPromises.push(...pmMainRtuImagePromises);
    }

    // RTU PM Chamber Magnetic Contact images - stored in "PMChamberMagneticContacts" folder
    if (pmChamberImageType && rtuPMData.pmChamberMagneticContactImages) {
      const pmChamberImagePromises = rtuPMData.pmChamberMagneticContactImages.map(async (imageFile) => {
        return createReportFormImage(reportForm.id, imageFile, pmChamberImageType.id, 'PMChamberMagneticContacts');
      });
      imageUploadPromises.push(...pmChamberImagePromises);
    }

    // RTU PM RTU Cabinet Cooling images - stored in "PMRTUCabinetCoolings" folder
    if (pmCoolingImageType && rtuPMData.pmRTUCabinetCoolingImages) {
      const pmCoolingImagePromises = rtuPMData.pmRTUCabinetCoolingImages.map(async (imageFile) => {
        return createReportFormImage(reportForm.id, imageFile, pmCoolingImageType.id, 'PMRTUCabinetCoolings');
      });
      imageUploadPromises.push(...pmCoolingImagePromises);
    }

    // RTU PM DVR Equipment images - stored in "PMDVREquipments" folder
    if (pmDVRImageType && rtuPMData.pmDVREquipmentImages) {
      const pmDVRImagePromises = rtuPMData.pmDVREquipmentImages.map(async (imageFile) => {
        return createReportFormImage(reportForm.id, imageFile, pmDVRImageType.id, 'PMDVREquipments');
      });
      imageUploadPromises.push(...pmDVRImagePromises);
    }

    // Wait for all image uploads to complete
    await Promise.all(imageUploadPromises);

    return {
      success: true,
      reportForm,
      rtuPMReportForm,
      jobNo: reportForm.jobNo,
      message: 'RTU PM Report Form submitted successfully'
    };
  } catch (error) {
    console.error('Error submitting RTU PM Report Form:', error);
    throw error;
  }
};

// Get RTU PM Report Form with all related data
export const getRTUPMReportForm = async (id) => {
  const response = await api.get(`/reportform/RTUPMReportForm/${id}`);
  return response.data;
};

// Future: Add Server PM Report functions
// export const submitServerPMReportForm = async (formData, serverPMData, user) => {
//   // Implementation for Server PM reports
// };

// Add this function before the submitCMReportForm function
export const createCMMaterialUsed = async (materialUsedData) => {
  const response = await api.post('/CMMaterialUsed', materialUsedData);
  return response.data;
};

// Add this function to get CM Material Used by CM Report Form ID
export const getCMMaterialUsed = async (cmReportFormId) => {
  const response = await api.get(`/CMMaterialUsed/bycmreportform/${cmReportFormId}`);
  return response.data;
};
