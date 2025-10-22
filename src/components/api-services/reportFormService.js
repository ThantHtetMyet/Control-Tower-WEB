import api from './api';
import { API_BASE_URL } from '../../config/apiConfig';

// Report Form API calls
export const getReportForms = async (page = 1, pageSize = 10, search = '', reportFormTypeId = null, sortField = null, sortDirection = 'asc') => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  
  if (search) params.append('search', search);
  if (reportFormTypeId) params.append('reportFormTypeId', reportFormTypeId);
  if (sortField) params.append('sortField', sortField);
  if (sortDirection) params.append('sortDirection', sortDirection);
  
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

// Get CM Report Form with all related data
export const getCMReportForm = async (id) => {
  const response = await api.get(`/reportform/CMReportForm/${id}`);
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
      cmReportFormTypeID: formData.cmReportFormTypeID,
      furtherActionTakenID: formData.furtherActionTakenID,
      formstatusID: formData.formstatusID,
      customer: formData.customer,
      reportTitle: formData.reportTitle,
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
        'CMBeforeIssueImage'             // Use "CMBeforeIssueImage" as folder name
      );
    });
    
    // Step 5: Upload after action images - using specific folder name
    const afterImagePromises = afterActionImages.map(async (imageFile) => {
      return createReportFormImage(
        reportForm.id,                    // reportFormId
        imageFile,                       // imageFile
        afterImageType.id,               // reportFormImageTypeId (GUID)
        'CMAfterIssueImage'              // Use "CMAfterIssueImage" as folder name
      );
    });
    
    // Step 6: Upload material used old serial images - using specific folder name
    const materialUsedOldSerialPromises = materialUsedOldSerialImages.map(async (imageFile) => {
      return createReportFormImage(
        reportForm.id,                           // reportFormId
        imageFile,                              // imageFile
        materialUsedOldSerialImageType.id,      // reportFormImageTypeId (GUID)
        'CMMaterialUsedOldSerialNo'             // Use "CMMaterialUsedOldSerialNo" as folder name
      );
    });
    
    // Step 7: Upload material used new serial images - using specific folder name
    const materialUsedNewSerialPromises = materialUsedNewSerialImages.map(async (imageFile) => {
      return createReportFormImage(
        reportForm.id,                           // reportFormId
        imageFile,                              // imageFile
        materialUsedNewSerialImageType.id,      // reportFormImageTypeId (GUID)
        'CMMaterialUsedNewSerialNo'             // Use "CMMaterialUsedNewSerialNo" as folder name
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

// CM Report Form Types API calls
export const getCMReportFormTypes = async () => {
  const response = await api.get('/cmreportformtype');
  return response.data;
};

export const getCMReportFormType = async (id) => {
  const response = await api.get(`/cmreportformtype/${id}`);
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
    //console.log('Creating ReportForm with data:', reportFormData);
    const reportForm = await createReportForm(reportFormData);
    //console.log('ReportForm created:', reportForm);

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

// Update RTU PM Report Form
export const updateRTUPMReportForm = async (id, updateData) => {
  const response = await api.put(`/reportform/RTUPMReportForm/${id}`, updateData);
  return response.data;
};

// Individual PM Controller Update Functions
export const updatePMReportFormRTU = async (id, pmReportFormRTUData) => {
  const response = await api.put(`/pmreportformrtu/${id}`, pmReportFormRTUData);
  return response.data;
};

export const updatePMMainRtuCabinet = async (pmReportFormRTUID, pmMainRtuCabinetData) => {
  console.log("PMReportFormRTUID", pmReportFormRTUID);
  
  const updatePromises = pmMainRtuCabinetData.map(async (record) => {
    console.log("RecordID : ", record.ID);
    
    const recordData = {
      PMReportFormRTUID: pmReportFormRTUID,
      RTUCabinet: record.RTUCabinet || record.rtuCabinet,
      EquipmentRack: record.EquipmentRack || record.equipmentRack,
      Monitor: record.Monitor || record.monitor,
      MouseKeyboard: record.MouseKeyboard || record.mouseKeyboard,
      CPU6000Card: record.CPU6000Card || record.cpU6000Card,
      InputCard: record.InputCard || record.inputCard,
      MegapopNTU: record.MegapopNTU || record.megapopNTU,
      NetworkRouter: record.NetworkRouter || record.networkRouter,
      NetworkSwitch: record.NetworkSwitch || record.networkSwitch,
      DigitalVideoRecorder: record.DigitalVideoRecorder || record.digitalVideoRecorder,
      RTUDoorContact: record.RTUDoorContact || record.rtuDoorContact,
      PowerSupplyUnit: record.PowerSupplyUnit || record.powerSupplyUnit,
      UPSTakingOverTest: record.UPSTakingOverTest || record.upsTakingOverTest,
      UPSBattery: record.UPSBattery || record.upsBattery,
      Remarks: record.Remarks || record.remarks
    };
    
    if (record.ID && record.ID !== null) {
      // Update existing record using its ID - FIXED: Use correct endpoint
      console.log('Updating existing PMMainRtuCabinet record with ID:', record.ID);
      const response = await api.put(`/pmmainrtucabinet/${record.ID}`, recordData);
      return response.data;
    } else {
      // Create new record
      console.log('Creating new PMMainRtuCabinet record:', recordData);
      const response = await api.post('/pmmainrtucabinet', recordData);
      return response.data;
    }
  });

  const results = await Promise.all(updatePromises);
  return results;
};

export const updatePMChamberMagneticContact = async (pmReportFormRTUID, pmChamberData) => {
  const updatePromises = pmChamberData.map(async (record) => {
    const recordData = {
      PMReportFormRTUID: pmReportFormRTUID,
      ChamberNumber: record.ChamberNumber || record.chamberNumber,
      ChamberOGBox: record.ChamberOGBox || record.chamberOGBox,
      ChamberContact1: record.ChamberContact1 || record.chamberContact1,
      ChamberContact2: record.ChamberContact2 || record.chamberContact2,
      ChamberContact3: record.ChamberContact3 || record.chamberContact3,
      Remarks: record.Remarks || record.remarks
    };

    if (record.ID && record.ID !== null) {
      // Update existing record using its ID
      console.log('Updating existing PMChamberMagneticContact record with ID:', record.ID);
      const response = await api.put(`/pmchambermagneticcontact/${record.ID}`, recordData);
      return response.data;
    } else {
      // Create new record
      console.log('Creating new PMChamberMagneticContact record:', recordData);
      const response = await api.post('/pmchambermagneticcontact', recordData);
      return response.data;
    }
  });

  const results = await Promise.all(updatePromises);
  return results;
};

export const updatePMRTUCabinetCooling = async (pmReportFormRTUID, pmCoolingData) => {
  const updatePromises = pmCoolingData.map(async (record) => {
    const recordData = {
      PMReportFormRTUID: pmReportFormRTUID,
      FanNumber: record.FanNumber || record.fanNumber,
      FunctionalStatus: record.FunctionalStatus || record.functionalStatus,
      Remarks: record.Remarks || record.remarks
    };

    if (record.ID && record.ID !== null) {
      // Update existing record using its ID
      console.log('Updating existing PMRTUCabinetCooling record with ID:', record.ID);
      const response = await api.put(`/pmrtucabinetcooling/${record.ID}`, recordData);
      return response.data;
    } else {
      // Create new record
      console.log('Creating new PMRTUCabinetCooling record:', recordData);
      const response = await api.post('/pmrtucabinetcooling', recordData);
      return response.data;
    }
  });

  const results = await Promise.all(updatePromises);
  return results;
};

export const updatePMDVREquipment = async (pmReportFormRTUID, pmDVRData) => {
  const updatePromises = pmDVRData.map(async (record) => {
    const recordData = {
      PMReportFormRTUID: pmReportFormRTUID,
      DVRComm: record.DVRComm || record.dvrComm,
      DVRRAIDComm: record.DVRRAIDComm || record.dvrraidComm,
      TimeSyncNTPServer: record.TimeSyncNTPServer || record.timeSyncNTPServer,
      Recording24x7: record.Recording24x7 || record.recording24x7,
      Remarks: record.Remarks || record.remarks
    };

    if (record.ID && record.ID !== null) {
      // Update existing record using its ID
      console.log('Updating existing PMDVREquipment record with ID:', record.ID);
      const response = await api.put(`/pmdvrequipment/${record.ID}`, recordData);
      return response.data;
    } else {
      // Create new record
      console.log('Creating new PMDVREquipment record:', recordData);
      const response = await api.post('/pmdvrequipment', recordData);
      return response.data;
    }
  });

  const results = await Promise.all(updatePromises);
  return results;
};

// Get individual PM data functions
export const getPMReportFormRTU = async (id) => {
  const response = await api.get(`/pmreportformrtu/${id}`);
  return response.data;
};

export const getPMMainRtuCabinet = async (pmReportFormRTUID) => {
  const response = await api.get(`/pmmainrtucabinet/bypmreportform/${pmReportFormRTUID}`);
  return response.data;
};

export const getPMChamberMagneticContact = async (pmReportFormRTUID) => {
  const response = await api.get(`/pmchambermagneticcontact/bypmreportform/${pmReportFormRTUID}`);
  return response.data;
};

export const getPMRTUCabinetCooling = async (pmReportFormRTUID) => {
  const response = await api.get(`/pmrtucabinetcooling/bypmreportform/${pmReportFormRTUID}`);
  return response.data;
};

export const getPMDVREquipment = async (pmReportFormRTUID) => {
  const response = await api.get(`/pmdvrequipment/bypmreportform/${pmReportFormRTUID}`);
  return response.data;
};

// Future: Add Server PM Report functions
export const submitServerPMReportForm = async (formData, user) => {
  try {
    console.log('=== SUBMITTING SERVER PM REPORT FORM ===');
    console.log('Form Data Structure:', JSON.stringify(formData, null, 2));

    // Step 1: Create ReportForm entry first
    const reportFormData = {
      ReportFormTypeID: formData.reportFormTypeID,
      JobNo: formData.jobNo,
      SystemNameWarehouseID: formData.systemNameWarehouseID,
      StationNameWarehouseID: formData.stationNameWarehouseID,
      UploadStatus: formData.uploadStatus || 'Pending',
      UploadHostname: formData.uploadHostname || '',
      UploadIPAddress: formData.uploadIPAddress || '',
      FormStatus: formData.formStatus || 'Draft'
    };
    
    //console.log('Creating ReportForm with data:', reportFormData);
    const reportForm = await createReportForm(reportFormData);
    //console.log('ReportForm created:', reportForm);

    // Helper function to transform component data
    const transformComponentData = (componentData, componentName) => {
      if (!componentData) return null;
      
      //console.log(`Transforming ${componentName}:`, JSON.stringify(componentData, null, 2));
      
      // Helper function to transform field names in details
      const transformDetailFields = (details) => {
        if (!Array.isArray(details)) return details;
        
        return details.map(detail => {
          const transformedDetail = { ...detail };
          
          // Transform "result" field to "ResultStatusID" for API compatibility
          if (transformedDetail.result !== undefined) {
            transformedDetail.ResultStatusID = transformedDetail.result;
            delete transformedDetail.result;
          }
          
          // Transform "done" field to "ResultStatusID" for API compatibility (used by HotFixes)
          if (transformedDetail.done !== undefined) {
            transformedDetail.ResultStatusID = transformedDetail.done;
            delete transformedDetail.done;
          }
          
          // Transform ASA Firewall specific fields for API compatibility
          if (transformedDetail.expectedResultId !== undefined) {
            transformedDetail.ASAFirewallStatusID = transformedDetail.expectedResultId;
            delete transformedDetail.expectedResultId;
          }
          
          if (transformedDetail.doneId !== undefined) {
            transformedDetail.ResultStatusID = transformedDetail.doneId;
            delete transformedDetail.doneId;
          }
          
          return transformedDetail;
        });
      };
      
      // Special handling for ASA Firewall data
      const isASAFirewallDefaultData = (data) => {
        if (!data || !data.details || !Array.isArray(data.details) || data.details.length === 0) return false;
        
        // Check if all items are default ASA Firewall commands with no user completion
        return data.details.every(item => {
          const isDefaultCommand = (item.commandInput === 'show cpu usage' || item.commandInput === 'show environment');
          const hasNoUserCompletion = (!item.doneId || item.doneId === '');
          return isDefaultCommand && hasNoUserCompletion;
        });
      };

      // Special handling for Auto Failover data
      const isAutoFailOverDefaultData = (dataArray) => {
        if (!Array.isArray(dataArray) || dataArray.length === 0) return false;
        
        // Check if all items are default Auto Failover scenarios with no user input
        return dataArray.every(item => {
          const hasDefaultServers = (item.toServer === 'SCA-SR2' || item.toServer === 'SCA-SR1') && 
                                   (item.fromServer === 'SCA-SR1' || item.fromServer === 'SCA-SR2');
          const hasDefaultFailoverType = item.failoverType && item.failoverType.trim() !== '';
          const hasDefaultExpectedResult = item.expectedResult && item.expectedResult.trim() !== '';
          const hasNoUserInput = (!item.result || item.result === '');
          
          return hasDefaultServers && hasDefaultFailoverType && hasDefaultExpectedResult && hasNoUserInput;
        });
      };
      
      // Handle direct array structure
      if (Array.isArray(componentData)) {
        // Only return data if array has meaningful content
        if (componentData.length === 0 || componentData.every(item => !item || Object.keys(item).length === 0)) {
          return null;
        }
        
        // Special check for ASA Firewall default data
        if (componentName === 'asaFirewallData' && isASAFirewallDefaultData({ details: componentData })) {
          return null;
        }
        
        // Special check for Auto Failover default data
        if (componentName === 'autoFailOverData' && isAutoFailOverDefaultData(componentData)) {
          return null;
        }
        
        return {
          remarks: '',
          details: transformDetailFields(componentData)
        };
      }
      
      // Handle nested structure with remarks
      if (componentData.remarks !== undefined) {
        const dataArray = componentData[componentName] || componentData.asaFirewallData || componentData.autoFailOverData || componentData.data || [];
        
        // Check if there's meaningful data
        const hasRemarks = componentData.remarks && componentData.remarks.trim() !== '';
        let hasDetails = Array.isArray(dataArray) && dataArray.length > 0 && 
                        dataArray.some(item => item && Object.keys(item).length > 0);
        
        // Special handling for diskUsageData - check for servers with actual disk data
        if (componentName === 'diskUsageData') {
          const servers = componentData.servers || [];
          hasDetails = Array.isArray(servers) && servers.length > 0 && 
                      servers.some(server => 
                        server && 
                        server.serverName && 
                        server.serverName.trim() !== '' &&
                        Array.isArray(server.disks) && 
                        server.disks.length > 0 &&
                        server.disks.some(disk => 
                          disk && (
                            (disk.disk && disk.disk.trim() !== '') ||
                            (disk.status && disk.status.trim() !== '') ||
                            (disk.capacity && disk.capacity.trim() !== '') ||
                            (disk.freeSpace && disk.freeSpace.trim() !== '') ||
                            (disk.usage && disk.usage.trim() !== '') ||
                            (disk.check && disk.check.trim() !== '')
                          )
                        )
                      );
        }
        
        // Helper function to convert YesNo status name to ID
        const convertYesNoStatusToId = (statusValue, yesNoStatusOptions) => {
          if (!statusValue || statusValue.trim() === '') return null;
          
          // If it's already a GUID, return as is
          const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (guidRegex.test(statusValue)) {
            return statusValue;
          }
          
          // Find the option by name (case insensitive)
          const option = yesNoStatusOptions?.find(opt => 
            opt.name?.toLowerCase() === statusValue.toLowerCase() ||
            opt.Name?.toLowerCase() === statusValue.toLowerCase()
          );
          
          return option ? (option.id || option.ID) : statusValue;
        };

        // Special handling for monthlyDatabaseCreationData
        if (componentName === 'monthlyDatabaseCreationData') {
          const monthlyDatabaseData = componentData.monthlyDatabaseData || [];
          const yesNoStatusOptions = componentData.yesNoStatusOptions || [];
          const hasRemarks = componentData.remarks && componentData.remarks.trim() !== '';
          const hasDetails = Array.isArray(monthlyDatabaseData) && monthlyDatabaseData.length > 0 && 
                            monthlyDatabaseData.some(item => 
                              item && (
                                (item.item && item.item.trim() !== '') ||
                                (item.monthlyDBCreated && item.monthlyDBCreated.trim() !== '')
                              )
                            );
          
          if (!hasRemarks && !hasDetails) {
            console.log('transformComponentData - monthlyDatabaseCreationData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            remarks: componentData.remarks || '',
            details: monthlyDatabaseData.map((item, index) => ({
              SerialNo: (index + 1).toString(),
              ServerName: item.item || '',
              YesNoStatusID: convertYesNoStatusToId(item.monthlyDBCreated, yesNoStatusOptions),
              Remarks: ''
            }))
          };
          
          console.log('transformComponentData - monthlyDatabaseCreationData output:', transformedData);
          return transformedData;
        }

        // Special handling for databaseBackupData
        if (componentName === 'databaseBackupData') {
          const mssqlBackupData = componentData.mssqlBackupData || [];
          const scadaBackupData = componentData.scadaBackupData || [];
          const yesNoStatusOptions = componentData.yesNoStatusOptions || [];
          const hasRemarks = componentData.remarks && componentData.remarks.trim() !== '';
          const hasLatestBackupFileName = componentData.latestBackupFileName && componentData.latestBackupFileName.trim() !== '';
          
          const hasMssqlData = Array.isArray(mssqlBackupData) && mssqlBackupData.length > 0 && 
                              mssqlBackupData.some(item => 
                                item && (
                                  (item.item && item.item.trim() !== '') ||
                                  (item.monthlyDBBackupCreated && item.monthlyDBBackupCreated.trim() !== '')
                                )
                              );
          
          const hasScadaData = Array.isArray(scadaBackupData) && scadaBackupData.length > 0 && 
                              scadaBackupData.some(item => 
                                item && (
                                  (item.item && item.item.trim() !== '') ||
                                  (item.monthlyDBBackupCreated && item.monthlyDBBackupCreated.trim() !== '')
                                )
                              );
          
          if (!hasRemarks && !hasLatestBackupFileName && !hasMssqlData && !hasScadaData) {
            console.log('transformComponentData - databaseBackupData has no data, returning null');
            return null;
          }
          
          // Transform MSSQL backup data
          const mssqlDetails = mssqlBackupData.map((item, index) => ({
            SerialNo: (index + 1).toString(),
            ServerName: item.item || '',
            YesNoStatusID: convertYesNoStatusToId(item.monthlyDBBackupCreated, yesNoStatusOptions),
            Remarks: ''
          }));
          
          // Transform SCADA backup data
          const scadaDetails = scadaBackupData.map((item, index) => ({
            SerialNo: (index + 1).toString(),
            ServerName: item.item || '',
            YesNoStatusID: convertYesNoStatusToId(item.monthlyDBBackupCreated, yesNoStatusOptions),
            Remarks: ''
          }));
          
          const transformedData = {
            remarks: componentData.remarks || '',
            latestBackupFileName: componentData.latestBackupFileName || '',
            mssqlDetails: mssqlDetails,
            scadaDetails: scadaDetails
          };
          
          console.log('transformComponentData - databaseBackupData output:', transformedData);
          return transformedData;
        }

        // Special handling for networkHealthData - simple structure without details
        if (componentName === 'networkHealthData') {
          
          const hasData = (componentData.dateChecked && componentData.dateChecked !== null) ||
                         (componentData.result && componentData.result.trim() !== '') ||
                         (componentData.remarks && componentData.remarks.trim() !== '');
          
          if (!hasData) {
            console.log('transformComponentData - networkHealthData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            YesNoStatusID: componentData.result || null,
            DateChecked: componentData.dateChecked || null,
            Remarks: componentData.remarks || ''
          };
          
          console.log('transformComponentData - networkHealthData output:', transformedData);
          return transformedData;
        }
        // Special handling for Willowlynx Process Status - simple structure without details
        if (componentName === 'willowlynxProcessStatusData') {
          //console.log('willowlynxProcessStatusData Component', componentData);
          //console.log('willowlynxProcessStatusData Component type:', typeof componentData);
          //console.log('willowlynxProcessStatusData Component keys:', Object.keys(componentData || {}));
          
          const hasData = (componentData.result && componentData.result.trim() !== '') ||
                         (componentData.remarks && componentData.remarks.trim() !== '');
          /*
          console.log('willowlynxProcessStatusData hasData check:', {
            result: componentData.result,
            remarks: componentData.remarks,
            hasData: hasData
          });
          */
          if (!hasData) {
            console.log('transformComponentData - willowlynxProcessStatusData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            YesNoStatusID: componentData.result || null,
            Remarks: componentData.remarks || ''
          };
          
          console.log('transformComponentData - willowlynxProcessStatusData output:', transformedData);
          return transformedData;
        }

        // Special handling for Willowlynx Network Status - simple structure without details
        if (componentName === 'willowlynxNetworkStatusData') {
          
          const hasData = (componentData.result && componentData.result.trim() !== '') ||
                         (componentData.remarks && componentData.remarks.trim() !== '');
          
          if (!hasData) {
            console.log('transformComponentData - willowlynxNetworkStatusData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            YesNoStatusID: componentData.result || null,
            Remarks: componentData.remarks || ''
          };
          
          console.log('transformComponentData - willowlynxNetworkStatusData output:', transformedData);
          return transformedData;
        }

        // Special handling for Willowlynx RTU Status - simple structure without details
        if (componentName === 'willowlynxRTUStatusData') {
          
          const hasData = (componentData.result && componentData.result.trim() !== '') ||
                         (componentData.remarks && componentData.remarks.trim() !== '');
          
          if (!hasData) {
            console.log('transformComponentData - willowlynxRTUStatusData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            YesNoStatusID: componentData.result || null,
            Remarks: componentData.remarks || ''
          };
          
          console.log('transformComponentData - willowlynxRTUStatusData output:', transformedData);
          return transformedData;
        }

        // Special handling for Willowlynx Historical Trend - simple structure without details
        if (componentName === 'willowlynxHistoricalTrendData') {
          
          const hasData = (componentData.result && componentData.result.trim() !== '') ||
                         (componentData.remarks && componentData.remarks.trim() !== '');
          
          if (!hasData) {
            console.log('transformComponentData - willowlynxHistoricalTrendData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            YesNoStatusID: componentData.result || null,
            Remarks: componentData.remarks || ''
          };
          
          console.log('transformComponentData - willowlynxHistoricalTrendData output:', transformedData);
          return transformedData;
        }

        // Special handling for Willowlynx Historical Report - simple structure without details
        if (componentName === 'willowlynxHistoricalReportData') {
          
          const hasData = (componentData.result && componentData.result.trim() !== '') ||
                         (componentData.remarks && componentData.remarks.trim() !== '');
          
          if (!hasData) {
            console.log('transformComponentData - willowlynxHistoricalReportData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            YesNoStatusID: componentData.result || null,
            Remarks: componentData.remarks || ''
          };
          
          console.log('transformComponentData - willowlynxHistoricalReportData output:', transformedData);
          return transformedData;
        }

        // Special handling for Willowlynx CCTV Camera - simple structure without details
        if (componentName === 'willowlynxCCTVCameraData') {
          
          const hasData = (componentData.result && componentData.result.trim() !== '') ||
                         (componentData.remarks && componentData.remarks.trim() !== '');
          
          if (!hasData) {
            console.log('transformComponentData - willowlynxCCTVCameraData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            YesNoStatusID: componentData.result || null,
            Remarks: componentData.remarks || ''
          };
          
          console.log('transformComponentData - willowlynxCCTVCameraData output:', transformedData);
          return transformedData;
        }

        // Special handling for hotFixesData - map frontend field names to backend DTO field names
        if (componentName === 'hotFixesData') {
          const hasRemarks = componentData.remarks && componentData.remarks.trim() !== '';
          const hasDetails = Array.isArray(dataArray) && dataArray.length > 0 && 
                            dataArray.some(item => item && Object.keys(item).length > 0);
          
          if (!hasRemarks && !hasDetails) {
            console.log('transformComponentData - hotFixesData has no data, returning null');
            return null;
          }
          
          // Transform field names to match backend DTO
          const transformedDetails = dataArray.map((item, index) => ({
            SerialNo: String(item.serialNumber || (index + 1)), // Ensure string conversion
            ServerName: item.machineName || '',
            LatestHotFixsApplied: item.latestHotfixesApplied || '',
            ResultStatusID: item.done || null, // 'done' field contains the ResultStatus GUID
            Remarks: item.remarks || ''
          }));
          
          const transformedData = {
            remarks: componentData.remarks || '',
            details: transformedDetails
          };
          
          console.log('transformComponentData - hotFixesData output:', transformedData);
          return transformedData;
        }

        // Special handling for timeSyncData
        if (componentName === 'timeSyncData') {
          console.log('=== TIMESYNC TRANSFORMATION DEBUG ===');
          console.log('Raw componentData:', JSON.stringify(componentData, null, 2));
          
          const timeSyncDataArray = componentData.timeSyncData || [];
          console.log('timeSyncDataArray:', JSON.stringify(timeSyncDataArray, null, 2));
          
          const hasRemarks = componentData.remarks && componentData.remarks.trim() !== '';
          const hasDetails = Array.isArray(timeSyncDataArray) && timeSyncDataArray.length > 0 && 
                            timeSyncDataArray.some(item => 
                              item && (
                                (item.machineName && item.machineName.trim() !== '') ||
                                (item.timeSyncResult && item.timeSyncResult.trim() !== '')
                              )
                            );
          
          console.log('hasRemarks:', hasRemarks, 'hasDetails:', hasDetails);
          
          if (!hasRemarks && !hasDetails) {
            console.log('transformComponentData - timeSyncData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            remarks: componentData.remarks || '',
            details: timeSyncDataArray.map((item, index) => {
              console.log(`Processing item ${index}:`, JSON.stringify(item, null, 2));
              const transformedItem = {
                SerialNo: (index + 1).toString(),
                ServerName: item.machineName || '',
                ResultStatusID: item.timeSyncResult || null,
                Remarks: ''
              };
              console.log(`Transformed item ${index}:`, JSON.stringify(transformedItem, null, 2));
              return transformedItem;
            })
          };
          
          console.log('=== FINAL TIMESYNC TRANSFORMATION OUTPUT ===');
          console.log('transformComponentData - timeSyncData output:', JSON.stringify(transformedData, null, 2));
          return transformedData;
        }

        // Special handling for cpuAndRamUsageData - check for memory and CPU data
        if (componentName === 'cpuAndRamUsageData') {
          const memoryData = componentData.memoryUsageData || [];
          const cpuData = componentData.cpuUsageData || [];
          
          const hasMemoryData = Array.isArray(memoryData) && memoryData.length > 0 && 
                               memoryData.some(memory => 
                                 memory && (
                                   (memory.machineName && memory.machineName.trim() !== '') ||
                                   (memory.memorySize && memory.memorySize.trim() !== '') ||
                                   (memory.memoryInUse && memory.memoryInUse.trim() !== '') ||
                                   (memory.memoryInUsed && memory.memoryInUsed.trim() !== '') ||
                                   (memory.memoryUsageCheck && memory.memoryUsageCheck.trim() !== '')
                                 )
                               );
          
          const hasCpuData = Array.isArray(cpuData) && cpuData.length > 0 && 
                            cpuData.some(cpu => 
                              cpu && (
                                (cpu.machineName && cpu.machineName.trim() !== '') ||
                                (cpu.cpuUsage && cpu.cpuUsage.trim() !== '') ||
                                (cpu.cpuUsageCheck && cpu.cpuUsageCheck.trim() !== '')
                              )
                            );
          
          hasDetails = hasMemoryData || hasCpuData;
        }
        
        // Special check for ASA Firewall default data
        if (componentName === 'asaFirewallData' && isASAFirewallDefaultData({ details: dataArray })) {
          hasDetails = false;
        }
        
        // Special check for Auto Failover default data
        if (componentName === 'autoFailOverData' && isAutoFailOverDefaultData(dataArray)) {
          hasDetails = false;
        }
        
        // Only return data if there's meaningful content
        if (!hasRemarks && !hasDetails) {
          return null;
        }
        
        // Transform the data based on component type
        let detailsToTransform = dataArray;
        
        // Special handling for diskUsageData - transform servers to flat details array
        if (componentName === 'diskUsageData' && componentData.servers) {
          detailsToTransform = [];
          componentData.servers.forEach(server => {
            if (server.disks && Array.isArray(server.disks)) {
              server.disks.forEach(disk => {
                // Map status name to ID - find the serverDiskStatusOption with matching name
                let serverDiskStatusID = disk.status;
                if (typeof disk.status === 'string' && componentData.serverDiskStatusOptions) {
                  const statusOption = componentData.serverDiskStatusOptions.find(option => option.name === disk.status);
                  if (statusOption) {
                    serverDiskStatusID = statusOption.id;
                  }
                }
                
                detailsToTransform.push({
                  serverName: server.serverName,
                  diskName: disk.disk,
                  capacity: disk.capacity,
                  freeSpace: disk.freeSpace,
                  usage: disk.usage,
                  serverDiskStatusID: serverDiskStatusID,
                  resultStatusID: disk.check,
                  remarks: ''
                });
              });
            }
          });
        }
        
        // Special handling for cpuAndRamUsageData - transform memory and CPU data to separate arrays
        if (componentName === 'cpuAndRamUsageData') {
          const cpuUsageDetails = [];
          const memoryUsageDetails = [];
          
          // Add memory usage data
          if (componentData.memoryUsageData && Array.isArray(componentData.memoryUsageData)) {
            componentData.memoryUsageData.forEach((memory, index) => {
              if (memory && (
                (memory.machineName && memory.machineName.trim() !== '') ||
                (memory.memorySize && memory.memorySize.trim() !== '') ||
                (memory.memoryInUse && memory.memoryInUse.trim() !== '') ||
                (memory.memoryUsageCheck && memory.memoryUsageCheck.trim() !== '')
              )) {
                // Only add if we have a valid GUID for resultStatusID
                const resultStatusID = memory.memoryUsageCheck && memory.memoryUsageCheck.trim() !== '' ? memory.memoryUsageCheck : null;
                if (resultStatusID) {
                  memoryUsageDetails.push({
                    serialNo: (index + 1).toString(),
                    serverName: memory.machineName || '',
                    memorySize: memory.memorySize || '',
                    memoryInUse: memory.memoryInUse || '',
                    resultStatusID: resultStatusID,
                    remarks: ''
                  });
                }
              }
            });
          }
          
          // Add CPU usage data
          if (componentData.cpuUsageData && Array.isArray(componentData.cpuUsageData)) {
            componentData.cpuUsageData.forEach((cpu, index) => {
              if (cpu && (
                (cpu.machineName && cpu.machineName.trim() !== '') ||
                (cpu.cpuUsage && cpu.cpuUsage.trim() !== '') ||
                (cpu.cpuUsageCheck && cpu.cpuUsageCheck.trim() !== '')
              )) {
                // Only add if we have a valid GUID for resultStatusID
                const resultStatusID = cpu.cpuUsageCheck && cpu.cpuUsageCheck.trim() !== '' ? cpu.cpuUsageCheck : null;
                if (resultStatusID) {
                  cpuUsageDetails.push({
                    serialNo: (index + 1).toString(),
                    serverName: cpu.machineName || '',
                    cpuUsage: cpu.cpuUsage || '',
                    resultStatusID: resultStatusID,
                    remarks: ''
                  });
                }
              }
            });
          }
          
          return {
            remarks: componentData.remarks || '',
            cpuUsageDetails: cpuUsageDetails,
            memoryUsageDetails: memoryUsageDetails
          };
        }
        
        // Special handling for autoFailOverData - map frontend field names to backend DTO field names
        if (componentName === 'autoFailOverData') {
          const hasRemarks = componentData.remarks && componentData.remarks.trim() !== '';
          const hasDetails = Array.isArray(dataArray) && dataArray.length > 0 && 
                            dataArray.some(item => item && Object.keys(item).length > 0);
          
          if (!hasRemarks && !hasDetails) {
            console.log('transformComponentData - autoFailOverData has no data, returning null');
            return null;
          }
          
          // Transform field names to match backend DTO
          const transformedDetails = dataArray.map((item, index) => ({
            YesNoStatusID: item.result || null, // 'result' field contains the YesNoStatus GUID
            ToServer: item.toServer || '',
            FromServer: item.fromServer || '',
            Remarks: item.remarks || ''
          }));
          
          const transformedData = {
            remarks: componentData.remarks || '',
            details: transformedDetails
          };
          
          console.log('transformComponentData - autoFailOverData output:', transformedData);
          return transformedData;
        }

        // Special handling for softwarePatchData - map frontend field names to backend DTO field names
        if (componentName === 'softwarePatchData') {
          const hasRemarks = componentData.remarks && componentData.remarks.trim() !== '';
          const hasDetails = Array.isArray(dataArray) && dataArray.length > 0 && 
                            dataArray.some(item => item && (
                              (item.serialNumber && String(item.serialNumber).trim() !== '') ||
                              (item.machineName && item.machineName.trim() !== '') ||
                              (item.previousPatch && item.previousPatch.trim() !== '') ||
                              (item.currentPatch && item.currentPatch.trim() !== '')
                            ));
          
          if (!hasRemarks && !hasDetails) {
            console.log('transformComponentData - softwarePatchData has no data, returning null');
            return null;
          }
          
          // Transform field names to match backend DTO
          const transformedDetails = dataArray.map((item, index) => ({
            SerialNo: String(item.serialNumber || (index + 1)),
            ServerName: item.machineName || '',
            PreviousPatch: item.previousPatch || '',
            CurrentPatch: item.currentPatch || '',
            Remarks: item.remarks || ''
          }));
          
          const transformedData = {
            remarks: componentData.remarks || '',
            details: transformedDetails
          };
          
          console.log('transformComponentData - softwarePatchData output:', transformedData);
          return transformedData;
        }

        // Fallback for other components - but NOT for Willowlynx components
        if (componentName.startsWith('willowlynx')) {
          // This should not happen if all Willowlynx components are handled above
          console.warn(`Unhandled Willowlynx component: ${componentName}`, componentData);
          return null;
        }

        return {
          remarks: componentData.remarks || '',
          details: transformDetailFields(Array.isArray(detailsToTransform) ? detailsToTransform : [])
        };
      }
      
      return null;
    };

    // Step 2: Create the complete PM Report Form Server data with all components
    const pmReportData = {
      reportFormID: reportForm.id, // Use the ID from the created ReportForm
      pmReportFormTypeID: formData.pmReportFormTypeID,
      projectNo: formData.projectNo,
      customer: formData.customer,
      reportTitle: formData.reportTitle,
      attendedBy: formData.attendedBy,
      witnessedBy: formData.witnessedBy,
      startDate: formData.startDate,
      completionDate: formData.completionDate,
      remarks: formData.remarks,
      createdBy: user.id,

      // Transform all component data
      serverHealthData: transformComponentData(formData.serverHealthData, 'serverHealthData'),
      diskUsageData: transformComponentData(formData.diskUsageData, 'diskUsageData'),
      cpuAndRamUsageData: transformComponentData(formData.cpuAndRamUsageData, 'cpuAndRamUsageData'),
      networkHealthData: transformComponentData(formData.networkHealthData, 'networkHealthData'),
      hardDriveHealthData: transformComponentData(formData.hardDriveHealthData, 'hardDriveHealthData'),
      willowlynxProcessStatusData: (() => {
        //console.log('DEBUG: formData.willowlynxProcessStatusData before transform:', formData.willowlynxProcessStatusData);
        const result = transformComponentData(formData.willowlynxProcessStatusData, 'willowlynxProcessStatusData');
        //console.log('DEBUG: willowlynxProcessStatusData after transform:', result);
        return result;
      })(),
      willowlynxNetworkStatusData: transformComponentData(formData.willowlynxNetworkStatusData, 'willowlynxNetworkStatusData'),
      willowlynxRTUStatusData: transformComponentData(formData.willowlynxRTUStatusData, 'willowlynxRTUStatusData'),
      willowlynxHistorialTrendData: transformComponentData(formData.willowlynxHistorialTrendData, 'willowlynxHistoricalTrendData'),
      willowlynxHistoricalReportData: transformComponentData(formData.willowlynxHistoricalReportData, 'willowlynxHistoricalReportData'),
      willowlynxSumpPitCCTVCameraData: transformComponentData(formData.willowlynxSumpPitCCTVCameraData, 'willowlynxCCTVCameraData'),
      monthlyDatabaseCreationData: transformComponentData(formData.monthlyDatabaseCreationData, 'monthlyDatabaseCreationData'),
      databaseBackupData: transformComponentData(formData.databaseBackupData, 'databaseBackupData'),
      timeSyncData: transformComponentData(formData.timeSyncData, 'timeSyncData'),
      hotFixesData: transformComponentData(formData.hotFixesData, 'hotFixesData'),
      autoFailOverData: transformComponentData(formData.autoFailOverData, 'autoFailOverData'),
      asaFirewallData: transformComponentData(formData.asaFirewallData, 'asaFirewallData'),
      softwarePatchData: transformComponentData(formData.softwarePatchData, 'softwarePatchData')
    };

    console.log('=== SENDING COMPLETE PM REPORT DATA ===');
    console.log('PM Report Data:', JSON.stringify(pmReportData, null, 2));

    // Step 3: Make single API call to create the complete PM report with all components
    const createDto = pmReportData;
    const response = await api.post('/pmreportformserver', createDto);

    console.log('=== PM REPORT SUBMITTED SUCCESSFULLY ===');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    return { 
      success: true, 
      message: 'Server PM report submitted successfully',
      data: response.data,
      reportForm: reportForm // Return the created ReportForm for reference
    };
  } catch (error) {
    console.error('Error in submitServerPMReportForm:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

// Server PM Report specific API functions
export const createServerPMReportForm = async (serverPMReportFormData) => {
  const response = await api.post('/pmreportformserver', serverPMReportFormData);
  return response.data;
};

export const createServerHealth = async (serverHealthData) => {
  const response = await api.post('/pmserverhealth', serverHealthData);
  return response.data;
};

export const createHardDriveHealth = async (hardDriveHealthData) => {
  const response = await api.post('/pmharddrive', hardDriveHealthData);
  return response.data;
};

export const createDiskUsage = async (diskUsageData) => {
  const response = await api.post('/pmdiskusage', diskUsageData);
  return response.data;
};

export const createCPUAndRamUsage = async (cpuRamData) => {
  const response = await api.post('/pmcpuandramusage', cpuRamData);
  return response.data;
};

export const createNetworkHealth = async (networkHealthData) => {
  const response = await api.post('/pmnetworkhealth', networkHealthData);
  return response.data;
};

export const createWillowlynxProcessStatus = async (processStatusData) => {
  const response = await api.post('/pmserverwillowlynxprocessstatus', processStatusData);
  return response.data;
};

export const createWillowlynxNetworkStatus = async (networkStatusData) => {
  const response = await api.post('/pmserverwillowlynxnetworkstatus', networkStatusData);
  return response.data;
};

export const createWillowlynxRTUStatus = async (rtuStatusData) => {
  const response = await api.post('/pmserverwillowlynxrtustatus', rtuStatusData);
  return response.data;
};

export const createWillowlynxHistoricalTrend = async (historicalTrendData) => {
  const response = await api.post('/pmserverwillowlynxhistoricaltrend', historicalTrendData);
  return response.data;
};

export const createWillowlynxHistoricalReport = async (historicalReportData) => {
  const response = await api.post('/pmserverwillowlynxhistoricalreport', historicalReportData);
  return response.data;
};

export const createWillowlynxSumpPitCCTVCamera = async (cctvCameraData) => {
  const response = await api.post('/pmserverwillowlynxcctvCamera', cctvCameraData);
  return response.data;
};

export const createMonthlyDatabaseCreation = async (databaseCreationData) => {
  const response = await api.post('/pmservermonthlydatabasecreation', databaseCreationData);
  return response.data;
};

export const createDatabaseBackup = async (databaseBackupData) => {
  const response = await api.post('/pmserverdatabasebackup', databaseBackupData);
  return response.data;
};

export const createTimeSync = async (timeSyncData) => {
  const response = await api.post('/pmservertimesync', timeSyncData);
  return response.data;
};

export const createHotFixes = async (hotFixesData) => {
  const response = await api.post('/pmserverhotfixes', hotFixesData);
  return response.data;
};

export const createAutoFailOver = async (autoFailOverData) => {
  const response = await api.post('/pmserverautofailover', autoFailOverData);
  return response.data;
};

export const createASAFirewall = async (asaFirewallData) => {
  const response = await api.post('/pmserverasafirewall', asaFirewallData);
  return response.data;
};

export const createSoftwarePatch = async (softwarePatchData) => {
  const response = await api.post('/pmserversoftwarepatch', softwarePatchData);
  return response.data;
};

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

export const deletePMMainRtuCabinet = async (id) => {
  try {
    const response = await api.delete(`/PMMainRtuCabinet/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting PM Main RTU Cabinet:', error);
    throw error;
  }
};

export const deletePMChamberMagneticContact = async (id) => {
  try {
    const response = await api.delete(`/PMChamberMagneticContact/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting PM Chamber Magnetic Contact:', error);
    throw error;
  }
};

export const deletePMRTUCabinetCooling = async (id) => {
  try {
    const response = await api.delete(`/PMRTUCabinetCooling/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting PM RTU Cabinet Cooling:', error);
    throw error;
  }
};

export const deletePMDVREquipment = async (id) => {
  try {
    const response = await api.delete(`/PMDVREquipment/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting PM DVR Equipment:', error);
    throw error;
  }
};
// Add this function after getCMMaterialUsed
export const updateCMMaterialUsed = async (id, materialUsedData) => {
  const response = await api.put(`/CMMaterialUsed/${id}`, materialUsedData);
  return response.data;
};

// Add this function to delete material used items
export const deleteCMMaterialUsed = async (id) => {
  const response = await api.delete(`/CMMaterialUsed/${id}`);
  return response.data;
};

// Get Server PM Report Form with all related data
export const getServerPMReportFormWithDetails = async (id) => {
  const response = await api.get(`/PMReportFormServer/${id}`);
  return response.data;
};