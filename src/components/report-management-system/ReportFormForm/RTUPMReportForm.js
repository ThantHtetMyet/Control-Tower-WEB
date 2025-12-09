import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  IconButton,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  PhotoCamera,
  Build,
  Settings,
  ArrowBackIosNew as ArrowBackIosNewIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Videocam,
  AssignmentTurnedIn as AssignmentTurnedInIcon
} from '@mui/icons-material';
import RMSTheme from '../../theme-resource/RMSTheme';
import { getPMReportFormTypes } from '../../api-services/reportFormService';
import WarningModal from '../../common/WarningModal';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const MultipleImageUploadField = ({ field, label, images, previews, onUpload, onRemove, icon: IconComponent = ImageIcon }) => {
  return (
    <Card sx={{
      border: '2px dashed #e0e0e0',
      backgroundColor: '#fafafa',
      '&:hover': {
        borderColor: '#1976d2',
        backgroundColor: '#f5f5f5'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 2 }}>
          <IconComponent sx={{ color: '#1976d2' }} />
          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
            {label}
          </Typography>
        </Box>

        <input
          accept="image/*"
          style={{ display: 'none' }}
          id={`${field}-upload`}
          multiple
          type="file"
          onChange={onUpload}
        />
        <label htmlFor={`${field}-upload`}>
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
            sx={{
              marginBottom: 2,
              background: '#1976d2',
              '&:hover': {
                background: '#1565c0'
              }
            }}
          >
            Upload Images
          </Button>
        </label>

        {images.length > 0 && (
          <Grid container spacing={2}>
            {previews.map((preview, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}
                  />
                  <IconButton
                    onClick={() => onRemove(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(244, 67, 54, 0.8)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 1)'
                      },
                      width: 28,
                      height: 28
                    }}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {images.length === 0 && (
          <Box sx={{
            textAlign: 'center',
            padding: 3,
            color: '#666',
            border: '1px dashed #ccc',
            borderRadius: 2,
            backgroundColor: '#f9f9f9'
          }}>
            <ImageIcon sx={{ fontSize: 48, color: '#ccc', marginBottom: 1 }} />
            <Typography variant="body2">
              No images uploaded yet. Click "Upload Images" to add photos.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
const themeColor = '#1976d2'; // System blue color

const RTUPMReportForm = ({
  formData,
  reportFormTypes,
  formStatusOptions = [],
  onInputChange,
  onNext,
  onBack,
  onRTUPMDataUpdate,
  initialRTUPMData = {}
}) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [pmReportFormTypes, setPMReportFormTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Image upload state management - Initialize with data from parent
  const [pmMainRtuCabinetImages, setPmMainRtuCabinetImages] = useState(initialRTUPMData.pmMainRtuCabinetImages || []);
  const [pmMainRtuCabinetPreviews, setPmMainRtuCabinetPreviews] = useState([]);

  const [pmChamberMagneticContactImages, setPmChamberMagneticContactImages] = useState(initialRTUPMData.pmChamberMagneticContactImages || []);
  const [pmChamberMagneticContactPreviews, setPmChamberMagneticContactPreviews] = useState([]);

  const [pmRTUCabinetCoolingImages, setPmRTUCabinetCoolingImages] = useState(initialRTUPMData.pmRTUCabinetCoolingImages || []);
  const [pmRTUCabinetCoolingPreviews, setPmRTUCabinetCoolingPreviews] = useState([]);

  const [pmDVREquipmentImages, setPmDVREquipmentImages] = useState(initialRTUPMData.pmDVREquipmentImages || []);
  const [pmDVREquipmentPreviews, setPmDVREquipmentPreviews] = useState([]);


  // MainRTUCabinet state management - Initialize with data from parent or default
  const [mainRTUCabinetData, setMainRTUCabinetData] = useState(initialRTUPMData.mainRTUCabinetData || [{
    RTUCabinet: '',
    EquipmentRack: '',
    Monitor: '',
    MouseKeyboard: '',
    CPU6000Card: '',
    InputCard: '',
    MegapopNTU: '',
    NetworkRouter: '',
    NetworkSwitch: '',
    DigitalVideoRecorder: '',
    RTUDoorContact: '',
    PowerSupplyUnit: '',
    UPSTakingOverTest: '',
    UPSBattery: '',
    Remarks: ''
  }]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // PMChamberMagneticContact state management - Initialize with data from parent or default
  const [pmChamberMagneticContactData, setPMChamberMagneticContactData] = useState(initialRTUPMData.pmChamberMagneticContactData || [{
    ChamberNumber: '1',
    ChamberOGBox: '',
    ChamberContact1: '',
    ChamberContact2: '',
    ChamberContact3: '',
    Remarks: ''
  }]);
  const [selectedChamberRowIndex, setSelectedChamberRowIndex] = useState(null);

  // PMRTUCabinetCooling state management - Initialize with data from parent or default
  const [pmRTUCabinetCoolingData, setPMRTUCabinetCoolingData] = useState(initialRTUPMData.pmRTUCabinetCoolingData || [{
    FanNumber: '1',
    FunctionalStatus: '',
    Remarks: ''
  }]);
  const [selectedCoolingRowIndex, setSelectedCoolingRowIndex] = useState(null);

  // PMDVREquipment state management - Initialize with data from parent or default
  const [pmDVREquipmentData, setPMDVREquipmentData] = useState(initialRTUPMData.pmDVREquipmentData || [{
    DVRComm: '',
    DVRRAIDComm: '',
    TimeSyncNTPServer: '',
    Recording24x7: '',
    Remarks: ''
  }]);
  const [selectedDVRRowIndex, setSelectedDVRRowIndex] = useState(null);

  // Modal state for clear confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Add state for delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Modal state for PM Chamber clear confirmation
  const [showChamberClearConfirm, setShowChamberClearConfirm] = useState(false);

  // Add state for PM Chamber delete confirmation modal
  const [showChamberDeleteConfirm, setShowChamberDeleteConfirm] = useState(false);

  // Modal state for PM RTU Cabinet Cooling clear confirmation
  const [showCoolingClearConfirm, setShowCoolingClearConfirm] = useState(false);

  // Add state for PM RTU Cabinet Cooling delete confirmation modal
  const [showCoolingDeleteConfirm, setShowCoolingDeleteConfirm] = useState(false);

  // Modal state for PM DVR Equipment clear confirmation
  const [showDVRClearConfirm, setShowDVRClearConfirm] = useState(false);

  // Add state for PM DVR Equipment delete confirmation modal
  const [showDVRDeleteConfirm, setShowDVRDeleteConfirm] = useState(false);

  // Add state for Form Status warning modal
  const [showFormStatusWarning, setShowFormStatusWarning] = useState(false);

  // Dropdown options for MainRTUCabinet
  const dropdownOptions = ['', 'NA', 'Acceptable', 'NonAcceptable'];

  // Dropdown options for PMChamberMagneticContact
  const chamberDropdownOptions = ['', 'FAIL', 'PASS', 'NA'];

  // Dropdown options for PMRTUCabinetCooling
  const coolingDropdownOptions = ['', 'FAIL', 'PASS', 'NA'];

  // DVR Equipment dropdown options
  const dvrDropdownOptions = ['', 'NA', 'PASS', 'FAIL'];

  // Image upload handlers for PMMainRtuCabinet
  const handlePmMainRtuCabinetUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Please ensure all files are images under 10MB.');
    }

    setPmMainRtuCabinetImages(prev => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPmMainRtuCabinetPreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePmMainRtuCabinet = (index) => {
    setPmMainRtuCabinetImages(prev => prev.filter((_, i) => i !== index));
    setPmMainRtuCabinetPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Image upload handlers for PMChamberMagneticContact
  const handlePmChamberMagneticContactUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Please ensure all files are images under 10MB.');
    }

    setPmChamberMagneticContactImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPmChamberMagneticContactPreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePmChamberMagneticContact = (index) => {
    setPmChamberMagneticContactImages(prev => prev.filter((_, i) => i !== index));
    setPmChamberMagneticContactPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Image upload handlers for PMRTUCabinetCooling
  const handlePmRTUCabinetCoolingUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Please ensure all files are images under 10MB.');
    }

    setPmRTUCabinetCoolingImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPmRTUCabinetCoolingPreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePmRTUCabinetCooling = (index) => {
    setPmRTUCabinetCoolingImages(prev => prev.filter((_, i) => i !== index));
    setPmRTUCabinetCoolingPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Image upload handlers for PMDVREquipment
  const handlePmDVREquipmentUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Please ensure all files are images under 10MB.');
    }

    setPmDVREquipmentImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPmDVREquipmentPreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePmDVREquipment = (index) => {
    setPmDVREquipmentImages(prev => prev.filter((_, i) => i !== index));
    setPmDVREquipmentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handler to add new MainRTUCabinet row
  const handleAddMainRTUCabinetRow = () => {
    setMainRTUCabinetData([...mainRTUCabinetData, {
      RTUCabinet: '',
      EquipmentRack: '',
      Monitor: '',
      MouseKeyboard: '',
      CPU6000Card: '',
      InputCard: '',
      MegapopNTU: '',
      NetworkRouter: '',
      NetworkSwitch: '',
      DigitalVideoRecorder: '',
      RTUDoorContact: '',
      PowerSupplyUnit: '',
      UPSTakingOverTest: '',
      UPSBattery: '',
      Remarks: ''
    }]);
  };

  // Handler to remove MainRTUCabinet row
  const handleRemoveMainRTUCabinetRow = (index) => {
    const newData = mainRTUCabinetData.filter((_, i) => i !== index);
    setMainRTUCabinetData(newData);
    if (selectedRowIndex === index) {
      setSelectedRowIndex(null);
    } else if (selectedRowIndex > index) {
      setSelectedRowIndex(selectedRowIndex - 1);
    }
  };

  // Handler to update MainRTUCabinet data
  const handleMainRTUCabinetChange = (index, field, value) => {
    const newData = [...mainRTUCabinetData];
    newData[index][field] = value;
    setMainRTUCabinetData(newData);
  };

  // Handler for row selection
  const handleRowSelection = (index) => {
    setSelectedRowIndex(selectedRowIndex === index ? null : index);
  };

  // Handler to apply selected row values to all rows
  const handleApplySelectedRow = () => {
    if (selectedRowIndex !== null && mainRTUCabinetData[selectedRowIndex]) {
      const selectedRow = mainRTUCabinetData[selectedRowIndex];
      const newData = mainRTUCabinetData.map(() => ({ ...selectedRow }));
      setMainRTUCabinetData(newData);
    }
  };

  // Handler to show delete rows confirmation modal
  const handleDeleteAllRowsConfirm = () => {
    setShowDeleteConfirm(true);
  };

  // Handler to execute delete all rows
  const handleDeleteAllRowsExecute = () => {
    setMainRTUCabinetData([]);
    setSelectedRowIndex(null);
    setShowDeleteConfirm(false);
  };

  // Handler to show clear values confirmation modal
  const handleClearAllValuesConfirm = () => {
    setShowClearConfirm(true);
  };

  // Handler to execute clear all values (keep rows structure)
  const handleClearAllValuesExecute = () => {
    const clearedData = mainRTUCabinetData.map(() => ({
      RTUCabinet: '',
      EquipmentRack: '',
      Monitor: '',
      MouseKeyboard: '',
      CPU6000Card: '',
      InputCard: '',
      MegapopNTU: '',
      NetworkRouter: '',
      NetworkSwitch: '',
      DigitalVideoRecorder: '',
      RTUDoorContact: '',
      PowerSupplyUnit: '',
      UPSTakingOverTest: '',
      UPSBattery: '',
      Remarks: ''
    }));
    setMainRTUCabinetData(clearedData);
    setSelectedRowIndex(null);
    setShowClearConfirm(false);
  };

  // Handler to cancel operations
  const handleCancel = () => {
    setShowClearConfirm(false);
    setShowDeleteConfirm(false);
  };

  // PMChamberMagneticContact handlers
  const handleAddPMChamberRow = () => {
    const nextChamberNumber = (pmChamberMagneticContactData.length + 1).toString();
    setPMChamberMagneticContactData([...pmChamberMagneticContactData, {
      ChamberNumber: nextChamberNumber,
      ChamberOGBox: '',
      ChamberContact1: '',
      ChamberContact2: '',
      ChamberContact3: '',
      Remarks: ''
    }]);
  };

  const handleRemovePMChamberRow = (index) => {
    const newData = pmChamberMagneticContactData.filter((_, i) => i !== index);
    setPMChamberMagneticContactData(newData);
    if (selectedChamberRowIndex === index) {
      setSelectedChamberRowIndex(null);
    } else if (selectedChamberRowIndex > index) {
      setSelectedChamberRowIndex(selectedChamberRowIndex - 1);
    }
  };

  const handlePMChamberChange = (index, field, value) => {
    const newData = [...pmChamberMagneticContactData];
    newData[index][field] = value;
    setPMChamberMagneticContactData(newData);
  };

  const handleChamberRowSelection = (index) => {
    setSelectedChamberRowIndex(selectedChamberRowIndex === index ? null : index);
  };

  const handleApplySelectedChamberRow = () => {
    if (selectedChamberRowIndex !== null && pmChamberMagneticContactData[selectedChamberRowIndex]) {
      const selectedRow = pmChamberMagneticContactData[selectedChamberRowIndex];
      const newData = pmChamberMagneticContactData.map((row, index) => ({
        ...selectedRow,
        ChamberNumber: row.ChamberNumber // Preserve original ChamberNumber
      }));
      setPMChamberMagneticContactData(newData);
    }
  };

  // PM Chamber Clear handlers
  const handleClearAllChamberValuesConfirm = () => {
    setShowChamberClearConfirm(true);
  };

  const handleClearAllChamberValuesExecute = () => {
    const clearedData = pmChamberMagneticContactData.map(row => ({
      ChamberNumber: '',
      ChamberOGBox: '',
      ChamberContact1: '',
      ChamberContact2: '',
      ChamberContact3: '',
      Remarks: ''
    }));
    setPMChamberMagneticContactData(clearedData);
    setShowChamberClearConfirm(false);
  };

  // PM Chamber Delete handlers
  const handleDeleteAllChamberRowsConfirm = () => {
    setShowChamberDeleteConfirm(true);
  };

  const handleDeleteAllChamberRowsExecute = () => {
    setPMChamberMagneticContactData([]);
    setSelectedChamberRowIndex(null);
    setShowChamberDeleteConfirm(false);
  };

  const handleChamberCancel = () => {
    setShowChamberClearConfirm(false);
    setShowChamberDeleteConfirm(false);
  };

  // PMRTUCabinetCooling handlers
  const handleAddPMCoolingRow = () => {
    const nextFanNumber = (pmRTUCabinetCoolingData.length + 1).toString();
    setPMRTUCabinetCoolingData([...pmRTUCabinetCoolingData, {
      FanNumber: nextFanNumber,
      FunctionalStatus: '',
      Remarks: ''
    }]);
  };

  const handleRemovePMCoolingRow = (index) => {
    const newData = pmRTUCabinetCoolingData.filter((_, i) => i !== index);
    setPMRTUCabinetCoolingData(newData);
    if (selectedCoolingRowIndex === index) {
      setSelectedCoolingRowIndex(null);
    } else if (selectedCoolingRowIndex > index) {
      setSelectedCoolingRowIndex(selectedCoolingRowIndex - 1);
    }
  };

  const handlePMCoolingChange = (index, field, value) => {
    const newData = [...pmRTUCabinetCoolingData];
    newData[index][field] = value;
    setPMRTUCabinetCoolingData(newData);
  };

  const handleCoolingRowSelection = (index) => {
    setSelectedCoolingRowIndex(selectedCoolingRowIndex === index ? null : index);
  };

  const handleApplySelectedCoolingRow = () => {
    if (selectedCoolingRowIndex !== null && pmRTUCabinetCoolingData[selectedCoolingRowIndex]) {
      const selectedRow = pmRTUCabinetCoolingData[selectedCoolingRowIndex];
      const newData = pmRTUCabinetCoolingData.map((row, index) => ({
        ...selectedRow,
        FanNumber: row.FanNumber // Preserve original FanNumber
      }));
      setPMRTUCabinetCoolingData(newData);
    }
  };

  // PM RTU Cabinet Cooling Clear handlers
  const handleClearAllCoolingValuesConfirm = () => {
    setShowCoolingClearConfirm(true);
  };

  const handleClearAllCoolingValuesExecute = () => {
    const clearedData = pmRTUCabinetCoolingData.map(row => ({
      FanNumber: '',
      FunctionalStatus: '',
      Remarks: ''
    }));
    setPMRTUCabinetCoolingData(clearedData);
    setShowCoolingClearConfirm(false);
  };

  // PM RTU Cabinet Cooling Delete handlers
  const handleDeleteAllCoolingRowsConfirm = () => {
    setShowCoolingDeleteConfirm(true);
  };

  const handleDeleteAllCoolingRowsExecute = () => {
    setPMRTUCabinetCoolingData([]);
    setSelectedCoolingRowIndex(null);
    setShowCoolingDeleteConfirm(false);
  };

  // PM RTU Cabinet Cooling Cancel handlers
  const handleCoolingCancel = () => {
    setShowCoolingClearConfirm(false);
    setShowCoolingDeleteConfirm(false);
  };

  // Handler to add new PM DVR Equipment row
  const handleAddPMDVRRow = () => {
    setPMDVREquipmentData([...pmDVREquipmentData, {
      DVRComm: '',
      DVRRAIDComm: '',
      TimeSyncNTPServer: '',
      Recording24x7: '',
      Remarks: ''
    }]);
  };

  // Handler to remove PM DVR Equipment row
  const handleRemovePMDVRRow = (index) => {
    const newData = pmDVREquipmentData.filter((_, i) => i !== index);
    setPMDVREquipmentData(newData);
    if (selectedDVRRowIndex === index) {
      setSelectedDVRRowIndex(null);
    } else if (selectedDVRRowIndex > index) {
      setSelectedDVRRowIndex(selectedDVRRowIndex - 1);
    }
  };

  // Handler to update PM DVR Equipment data
  const handlePMDVRChange = (index, field, value) => {
    const newData = [...pmDVREquipmentData];
    newData[index][field] = value;
    setPMDVREquipmentData(newData);
  };

  const handleDVRRowSelection = (index) => {
    setSelectedDVRRowIndex(selectedDVRRowIndex === index ? null : index);
  };

  const handleApplySelectedDVRRow = () => {
    if (selectedDVRRowIndex !== null && pmDVREquipmentData[selectedDVRRowIndex]) {
      const selectedRow = pmDVREquipmentData[selectedDVRRowIndex];
      const newData = pmDVREquipmentData.map((row, index) => ({
        ...selectedRow
      }));
      setPMDVREquipmentData(newData);
    }
  };

  // Clear all PM DVR Equipment values
  const handleClearAllDVRValuesConfirm = () => {
    setShowDVRClearConfirm(true);
  };

  const handleClearAllDVRValuesExecute = () => {
    const clearedData = pmDVREquipmentData.map(() => ({
      DVRComm: '',
      DVRRAIDComm: '',
      TimeSyncNTPServer: '',
      Recording24x7: '',
      Remarks: ''
    }));
    setPMDVREquipmentData(clearedData);
    setShowDVRClearConfirm(false);
  };

  // Delete all PM DVR Equipment rows
  const handleDeleteAllDVRRowsConfirm = () => {
    setShowDVRDeleteConfirm(true);
  };

  const handleDeleteAllDVRRowsExecute = () => {
    setPMDVREquipmentData([]);
    setSelectedDVRRowIndex(null);
    setShowDVRDeleteConfirm(false);
  };

  const handleDVRCancel = () => {
    setShowDVRClearConfirm(false);
    setShowDVRDeleteConfirm(false);
  };

  // Load PM report form types
  useEffect(() => {
    const loadPMReportFormTypes = async () => {
      try {
        const types = await getPMReportFormTypes();
        setPMReportFormTypes(types);
      } catch (error) {
        console.error('Error loading PM report form types:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPMReportFormTypes();
  }, []);

  // Regenerate image previews when initialRTUPMData changes (when navigating back)
  useEffect(() => {
    if (initialRTUPMData.pmMainRtuCabinetImages && initialRTUPMData.pmMainRtuCabinetImages.length > 0) {
      const previews = initialRTUPMData.pmMainRtuCabinetImages.map(file => {
        if (file instanceof File) {
          return URL.createObjectURL(file);
        }
        return null;
      }).filter(Boolean);
      setPmMainRtuCabinetPreviews(previews);
    }

    if (initialRTUPMData.pmChamberMagneticContactImages && initialRTUPMData.pmChamberMagneticContactImages.length > 0) {
      const previews = initialRTUPMData.pmChamberMagneticContactImages.map(file => {
        if (file instanceof File) {
          return URL.createObjectURL(file);
        }
        return null;
      }).filter(Boolean);
      setPmChamberMagneticContactPreviews(previews);
    }

    if (initialRTUPMData.pmRTUCabinetCoolingImages && initialRTUPMData.pmRTUCabinetCoolingImages.length > 0) {
      const previews = initialRTUPMData.pmRTUCabinetCoolingImages.map(file => {
        if (file instanceof File) {
          return URL.createObjectURL(file);
        }
        return null;
      }).filter(Boolean);
      setPmRTUCabinetCoolingPreviews(previews);
    }

    if (initialRTUPMData.pmDVREquipmentImages && initialRTUPMData.pmDVREquipmentImages.length > 0) {
      const previews = initialRTUPMData.pmDVREquipmentImages.map(file => {
        if (file instanceof File) {
          return URL.createObjectURL(file);
        }
        return null;
      }).filter(Boolean);
      setPmDVREquipmentPreviews(previews);
    }
  }, [initialRTUPMData]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      pmMainRtuCabinetPreviews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      pmChamberMagneticContactPreviews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      pmRTUCabinetCoolingPreviews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      pmDVREquipmentPreviews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [pmMainRtuCabinetPreviews, pmChamberMagneticContactPreviews, pmRTUCabinetCoolingPreviews, pmDVREquipmentPreviews]);

  // Get selected PM Report Form Type name for display
  const getSelectedPMReportFormTypeName = () => {
    if (!pmReportFormTypes || !formData.pmReportFormTypeID) {
      return formData.pmReportFormTypeName || 'Not selected';
    }
    const selectedType = pmReportFormTypes.find(type => type.id === formData.pmReportFormTypeID);
    return selectedType?.name || formData.pmReportFormTypeName || 'Not selected';
  };

  // Helper function to format date without timezone conversion
  const formatDateForInput = (date) => {
    if (!date) return '';

    let dateObj;

    // Handle Moment.js objects
    if (date._isAMomentObject) {
      dateObj = date.toDate(); // Convert Moment to native Date
    }
    // Handle native Date objects
    else if (date instanceof Date) {
      dateObj = date;
    }
    // Handle string dates
    else if (typeof date === 'string') {
      dateObj = new Date(date);
    }
    else {
      console.error('Invalid date object:', date);
      return '';
    }

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date object:', date);
      return '';
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const currentReportFormId = formData?.reportFormID || formData?.ReportFormID || formData?.reportFormId;

  // Handle input changes
  const handleInputChange = (field, value) => {

    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    onInputChange(field, value);
  };

  // Handle next button
  const handleNext = () => {
    // Validate FormStatus
    if (!formData.formstatusID) {
      setShowFormStatusWarning(true);
      return;
    }

    // Collect all RTU PM data
    const rtuPMDataToPass = {
      pmMainRtuCabinetImages,
      pmChamberMagneticContactImages,
      pmRTUCabinetCoolingImages,
      pmDVREquipmentImages,
      mainRTUCabinetData,
      pmChamberMagneticContactData,
      pmRTUCabinetCoolingData,
      pmDVREquipmentData
    };

    // Pass data to parent before proceeding
    if (onRTUPMDataUpdate) {
      onRTUPMDataUpdate(rtuPMDataToPass);
    }

    onNext();
  };

  // Styling objects
  const sectionContainerStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)'
    }
  };

  const sectionHeaderStyle = {
    marginBottom: 3,
    color: '#2C3E50',
    fontWeight: 700,
    fontSize: '18px',
    borderBottom: '2px solid #3498DB',
    paddingBottom: '8px',
    display: 'flex',
    alignItems: 'center'
  };

  const fieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#fafafa',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: '#d0d0d0',
        borderWidth: '1px'
      },
      '&:hover fieldset': {
        borderColor: '#2C3E50',
        borderWidth: '2px'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#3498DB',
        borderWidth: '2px',
        boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.1)'
      },
    },
    '& .MuiInputLabel-root': {
      color: '#2C3E50',
      fontWeight: 500
    },
    '& .MuiOutlinedInput-input': {
      color: '#2C3E50',
    },
    // ADD THESE TWO LINES:
    '& .MuiInputBase-input.Mui-disabled': {
      color: '#333',
      WebkitTextFillColor: '#333'
    }
  };

  const dateTimePickerStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#fafafa',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: '#d0d0d0',
        borderWidth: '1px'
      },
      '&:hover fieldset': {
        borderColor: '#2C3E50',
        borderWidth: '2px'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#3498DB',
        borderWidth: '2px',
        boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.1)'
      },
    },
    '& .MuiInputLabel-root': {
      color: '#2C3E50',
      fontWeight: 500
    },
  };

  const errorDateTimePickerStyle = {
    ...dateTimePickerStyle,
    '& .MuiOutlinedInput-root': {
      ...dateTimePickerStyle['& .MuiOutlinedInput-root'],
      backgroundColor: '#fdf2f2',
      '& fieldset': {
        borderColor: '#E74C3C',
        borderWidth: '2px'
      },
      '&:hover fieldset': {
        borderColor: '#E74C3C',
        borderWidth: '2px'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#E74C3C',
        borderWidth: '2px',
        boxShadow: '0 0 0 3px rgba(231, 76, 60, 0.1)'
      },
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        padding: 3
      }}>
        <Paper sx={{
          maxWidth: '1200px',
          margin: '0 auto',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 50%, #1A252F 100%)',
            color: 'white',
            padding: 4,
            textAlign: 'center'
          }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                marginBottom: 1,
                letterSpacing: '0.5px'
              }}
            >
              {formData.reportTitle || ''}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                opacity: 0.95,
                fontSize: '16px',
                fontWeight: 400
              }}
            >
              Complete the form below with accurate maintenance information
            </Typography>

            {/* Job No Badge */}
            <Box sx={{
              marginTop: 2,
              display: 'inline-block',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '8px 20px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#e0e0e0',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Job No:
                <Typography
                  component="span"
                  sx={{
                    color: '#FFD700',
                    fontWeight: 'bold',
                    marginLeft: '8px',
                    fontSize: '16px'
                  }}
                >
                  {formData.jobNo || 'Not assigned'}
                </Typography>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ padding: 4 }}>
            {/* Basic Information Summary Section */}
            <Paper sx={{
              ...sectionContainerStyle,
              background: '#f8f9fa',
              border: '2px solid #e9ecef'
            }}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                📋 Basic Information Summary
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Job No - Read Only */}
                <TextField
                  fullWidth
                  label="Job No"
                  value={formData.jobNo || ''}
                  disabled
                  sx={fieldStyle}
                />

                {/* System Description */}
                <TextField
                  fullWidth
                  label="System Description"
                  value={formData.systemDescription || ''}
                  disabled
                  sx={fieldStyle}
                />

                {/* Station Name */}
                <Tooltip
                  title={formData.stationName || 'Not specified'}
                  placement="top"
                  enterDelay={200}
                  sx={{
                    '& .MuiTooltip-tooltip': {
                      backgroundColor: '#1976d2',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 500,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      maxWidth: '400px',
                      whiteSpace: 'normal',
                    },
                    '& .MuiTooltip-arrow': {
                      color: '#1976d2',
                    }
                  }}
                  arrow
                >
                  <TextField
                    fullWidth
                    label="Station Name"
                    value={formData.stationName || ''}
                    disabled
                    sx={fieldStyle}
                  />
                </Tooltip>

                {/* Customer */}
                <TextField
                  fullWidth
                  label="Customer"
                  value={formData.customer || ''}
                  disabled
                  sx={fieldStyle}
                />

                {/* Project No */}
                <TextField
                  fullWidth
                  label="Project No"
                  value={formData.projectNo || ''}
                  disabled
                  sx={fieldStyle}
                />
              </Box>
            </Paper>

            
            {/* Date of Service Section */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                📅 Date of Service
              </Typography>

              <Grid container spacing={3} sx={{ marginTop: 1 }}>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Date of Service"
                    value={formData.dateOfService ? new Date(formData.dateOfService) : null}
                    onChange={(newValue) => {
                      const formattedDate = formatDateForInput(newValue);
                      handleInputChange('dateOfService', formattedDate);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!fieldErrors.dateOfService}
                        helperText={fieldErrors.dateOfService}
                        sx={fieldErrors.dateOfService ? errorDateTimePickerStyle : dateTimePickerStyle}
                      />
                    )}
                    componentsProps={{
                      actionBar: {
                        actions: ['accept', 'cancel'],
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Main RTU Cabinet Section */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                <Build sx={{ marginRight: 1, verticalAlign: 'middle' }} />
                Main RTU Cabinet Information
              </Typography>

              {/* Action Buttons */}
              <Box sx={{
                display: 'flex',
                gap: 2,
                marginTop: 2,
                marginBottom: 2,
                flexWrap: 'wrap'
              }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddMainRTUCabinetRow}
                  variant="contained"
                  sx={{
                    background: RMSTheme.components.button.primary.background,
                    color: RMSTheme.components.button.primary.text,
                    '&:hover': {
                      background: RMSTheme.components.button.primary.hover
                    }
                  }}
                >
                  Add RTU Cabinet Row
                </Button>

                <Button
                  onClick={handleApplySelectedRow}
                  disabled={selectedRowIndex === null || mainRTUCabinetData.length === 0}
                  variant="contained"
                  sx={{
                    background: RMSTheme.components.button.secondary?.background || '#6c757d',
                    color: RMSTheme.components.button.secondary?.text || '#FFFFFF',
                    '&:hover': {
                      background: RMSTheme.components.button.secondary?.hover || '#5a6268'
                    },
                    '&:disabled': {
                      background: '#cccccc',
                      color: '#666666'
                    }
                  }}
                >
                  Apply Selected Row to All
                </Button>

                <Button
                  onClick={handleClearAllValuesConfirm}
                  disabled={mainRTUCabinetData.length === 0}
                  variant="contained"
                  sx={{
                    background: '#f39c12',
                    color: '#FFFFFF',
                    '&:hover': {
                      background: '#e67e22'
                    },
                    '&:disabled': {
                      background: '#cccccc',
                      color: '#666666'
                    }
                  }}
                >
                  Clear Values
                </Button>

                <Button
                  onClick={handleDeleteAllRowsConfirm}
                  disabled={mainRTUCabinetData.length === 0}
                  variant="contained"
                  sx={{
                    background: '#e74c3c',
                    color: '#FFFFFF',
                    '&:hover': {
                      background: '#c0392b'
                    },
                    '&:disabled': {
                      background: '#cccccc',
                      color: '#666666'
                    }
                  }}
                >
                  Delete Rows
                </Button>
              </Box>

              <Box sx={{ marginTop: 2 }}>
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Select</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>RTU Cabinet</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Equipment Rack</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Monitor</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Mouse & Keyboard</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>CPU 6000 Card</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Input Card</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Megapop NTU</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Network Router</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Network Switch</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Digital Video Recorder</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>RTU Door Contact</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Power Supply Unit</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>UPS Taking Over Test</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>UPS Battery</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Remarks</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mainRTUCabinetData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={17} sx={{ textAlign: 'center', padding: '24px', color: '#6c757d' }}>
                            No RTU Cabinet data added yet. Click "Add RTU Cabinet Row" to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        mainRTUCabinetData.map((row, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              backgroundColor: selectedRowIndex === index ? '#e3f2fd' : 'transparent',
                              '&:hover': { backgroundColor: '#f5f5f5' }
                            }}
                          >
                            {/* Selection Checkbox */}
                            <TableCell>
                              <Checkbox
                                checked={selectedRowIndex === index}
                                onChange={() => handleRowSelection(index)}
                                size="small"
                                sx={{ color: '#3498DB' }}
                              />
                            </TableCell>

                            {/* RTU Cabinet */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.RTUCabinet || ''}
                                onChange={(e) => handleMainRTUCabinetChange(index, 'RTUCabinet', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Equipment Rack */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.EquipmentRack || ''}
                                onChange={(e) => handleMainRTUCabinetChange(index, 'EquipmentRack', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Monitor */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.Monitor || ''}
                                onChange={(e) => handleMainRTUCabinetChange(index, 'Monitor', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Mouse & Keyboard */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.MouseKeyboard || ''}
                                onChange={(e) => handleMainRTUCabinetChange(index, 'MouseKeyboard', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* CPU 6000 Card */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.CPU6000Card || ''}
                                onChange={(e) => handleMainRTUCabinetChange(index, 'CPU6000Card', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Input Card */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.InputCard || ''}
                                onChange={(e) => handleMainRTUCabinetChange(index, 'InputCard', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Megapop NTU */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.MegapopNTU || ''}
                                onChange={(e) => handleMainRTUCabinetChange(index, 'MegapopNTU', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Network Router */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.NetworkRouter || ''}
                                onChange={(e) => handleMainRTUCabinetChange(index, 'NetworkRouter', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Network Switch */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.NetworkSwitch || ''}
                                onChange={(e) => handleMainRTUCabinetChange(index, 'NetworkSwitch', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Digital Video Recorder */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.DigitalVideoRecorder || ''}
                                onChange={(e) => handleMainRTUCabinetChange(index, 'DigitalVideoRecorder', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* RTU Door Contact */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.RTUDoorContact || ''}
                                onChange={(e) => handleMainRTUCabinetChange(index, 'RTUDoorContact', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Power Supply Unit */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.PowerSupplyUnit || ''}
                                onChange={(e) => handleMainRTUCabinetChange(index, 'PowerSupplyUnit', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* UPS Taking Over Test */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.UPSTakingOverTest || ''}
                                onChange={(e) => handleMainRTUCabinetChange(index, 'UPSTakingOverTest', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* UPS Battery */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.UPSBattery || ''}
                                onChange={(e) => handleMainRTUCabinetChange(index, 'UPSBattery', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Remarks */}
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.Remarks || ''}
                                onChange={(e) => handleMainRTUCabinetChange(index, 'Remarks', e.target.value)}
                                sx={{ minWidth: '120px' }}
                                multiline
                                rows={1}
                              />
                            </TableCell>

                            {/* Actions */}
                            <TableCell>
                              <IconButton
                                onClick={() => handleRemoveMainRTUCabinetRow(index)}
                                size="small"
                                sx={{ color: '#d32f2f' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* PMMainRtuCabinet Image Upload */}
              <Box sx={{ marginTop: 3 }}>
                <MultipleImageUploadField
                  field="pmMainRtuCabinetImages"
                  label="PM Main RTU Cabinet Images"
                  images={pmMainRtuCabinetImages}
                  previews={pmMainRtuCabinetPreviews}
                  onUpload={handlePmMainRtuCabinetUpload}
                  onRemove={handleRemovePmMainRtuCabinet}
                  icon={Settings}
                />
              </Box>
            </Paper>

            {/* PM Chamber Magnetic Contact Section */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                <Settings sx={{ marginRight: 1, verticalAlign: 'middle' }} />
                PM Chamber Magnetic Contact Information
              </Typography>

              {/* Action Buttons */}
              <Box sx={{
                display: 'flex',
                gap: 2,
                marginTop: 2,
                marginBottom: 2,
                flexWrap: 'wrap'
              }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddPMChamberRow}
                  variant="contained"
                  sx={{
                    background: RMSTheme.components.button.primary.background,
                    color: RMSTheme.components.button.primary.text,
                    '&:hover': {
                      background: RMSTheme.components.button.primary.hover
                    }
                  }}
                >
                  Add Chamber Row
                </Button>

                <Button
                  onClick={handleApplySelectedChamberRow}
                  disabled={selectedChamberRowIndex === null || pmChamberMagneticContactData.length === 0}
                  variant="contained"
                  sx={{
                    background: RMSTheme.components.button.secondary?.background || '#6c757d',
                    color: RMSTheme.components.button.secondary?.text || '#FFFFFF',
                    '&:hover': {
                      background: RMSTheme.components.button.secondary?.hover || '#5a6268'
                    },
                    '&:disabled': {
                      background: '#cccccc',
                      color: '#666666'
                    }
                  }}
                >
                  Apply Selected Row to All
                </Button>

                <Button
                  onClick={handleClearAllChamberValuesConfirm}
                  disabled={pmChamberMagneticContactData.length === 0}
                  variant="contained"
                  sx={{
                    background: '#f39c12',
                    color: '#FFFFFF',
                    '&:hover': {
                      background: '#e67e22'
                    },
                    '&:disabled': {
                      background: '#cccccc',
                      color: '#666666'
                    }
                  }}
                >
                  Clear Values
                </Button>

                <Button
                  onClick={handleDeleteAllChamberRowsConfirm}
                  disabled={pmChamberMagneticContactData.length === 0}
                  variant="contained"
                  sx={{
                    background: '#E74C3C',
                    color: '#FFFFFF',
                    '&:hover': {
                      background: '#C0392B'
                    },
                    '&:disabled': {
                      background: '#cccccc',
                      color: '#666666'
                    }
                  }}
                >
                  Delete Rows
                </Button>
              </Box>

              {/* PM Chamber Table */}
              <Box sx={{ overflowX: 'auto' }}>
                <TableContainer>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Select</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Chamber Number</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Chamber OG Box</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Chamber Contact 1</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Chamber Contact 2</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Chamber Contact 3</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Remarks</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pmChamberMagneticContactData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} sx={{ textAlign: 'center', padding: '24px', color: '#6c757d' }}>
                            No PM Chamber Magnetic Contact data added yet. Click "Add Chamber Row" to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pmChamberMagneticContactData.map((row, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              backgroundColor: selectedChamberRowIndex === index ? '#e3f2fd' : 'transparent',
                              '&:hover': { backgroundColor: '#f5f5f5' }
                            }}
                          >
                            {/* Selection Checkbox */}
                            <TableCell>
                              <Checkbox
                                checked={selectedChamberRowIndex === index}
                                onChange={() => handleChamberRowSelection(index)}
                                size="small"
                                sx={{ color: '#3498DB' }}
                              />
                            </TableCell>

                            {/* Chamber Number */}
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={row.ChamberNumber || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Only allow positive numbers
                                  if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
                                    handlePMChamberChange(index, 'ChamberNumber', value);
                                  }
                                }}
                                inputProps={{
                                  min: 0,
                                  step: 1
                                }}
                                placeholder="Enter chamber number"
                                sx={{ minWidth: '120px' }}
                              />
                            </TableCell>

                            {/* Chamber OG Box */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.ChamberOGBox || ''}
                                onChange={(e) => handlePMChamberChange(index, 'ChamberOGBox', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {chamberDropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Chamber Contact 1 */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.ChamberContact1 || ''}
                                onChange={(e) => handlePMChamberChange(index, 'ChamberContact1', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {chamberDropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Chamber Contact 2 */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.ChamberContact2 || ''}
                                onChange={(e) => handlePMChamberChange(index, 'ChamberContact2', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {chamberDropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Chamber Contact 3 */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.ChamberContact3 || ''}
                                onChange={(e) => handlePMChamberChange(index, 'ChamberContact3', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {chamberDropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Remarks */}
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.Remarks || ''}
                                onChange={(e) => handlePMChamberChange(index, 'Remarks', e.target.value)}
                                sx={{ minWidth: '120px' }}
                                multiline
                                rows={1}
                              />
                            </TableCell>

                            {/* Actions */}
                            <TableCell>
                              <IconButton
                                onClick={() => handleRemovePMChamberRow(index)}
                                size="small"
                                sx={{ color: '#e74c3c' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* PMChamberMagneticContact Image Upload */}
              <Box sx={{ marginTop: 3 }}>
                <MultipleImageUploadField
                  field="pmChamberMagneticContactImages"
                  label="PM Chamber Magnetic Contact Images"
                  images={pmChamberMagneticContactImages}
                  previews={pmChamberMagneticContactPreviews}
                  onUpload={handlePmChamberMagneticContactUpload}
                  onRemove={handleRemovePmChamberMagneticContact}
                  icon={PhotoCamera}
                />
              </Box>
            </Paper>

            {/* PM RTU Cabinet Cooling Section */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                <Settings sx={{ marginRight: 1, verticalAlign: 'middle' }} />
                PM RTU Cabinet Cooling Information
              </Typography>

              {/* Action Buttons */}
              <Box sx={{
                display: 'flex',
                gap: 2,
                marginTop: 2,
                marginBottom: 2,
                flexWrap: 'wrap'
              }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddPMCoolingRow}
                  variant="contained"
                  sx={{
                    background: RMSTheme.components.button.primary.background,
                    color: RMSTheme.components.button.primary.text,
                    '&:hover': {
                      background: RMSTheme.components.button.primary.hover
                    }
                  }}
                >
                  Add Cooling Row
                </Button>

                <Button
                  onClick={handleApplySelectedCoolingRow}
                  disabled={selectedCoolingRowIndex === null || pmRTUCabinetCoolingData.length === 0}
                  variant="contained"
                  sx={{
                    background: RMSTheme.components.button.secondary?.background || '#6c757d',
                    color: RMSTheme.components.button.secondary?.text || '#FFFFFF',
                    '&:hover': {
                      background: RMSTheme.components.button.secondary?.hover || '#5a6268'
                    },
                    '&:disabled': {
                      background: '#cccccc',
                      color: '#666666'
                    }
                  }}
                >
                  Apply Selected Row to All
                </Button>

                <Button
                  onClick={handleClearAllCoolingValuesConfirm}
                  disabled={pmRTUCabinetCoolingData.length === 0}
                  variant="contained"
                  sx={{
                    background: '#f39c12',
                    color: '#FFFFFF',
                    '&:hover': {
                      background: '#e67e22'
                    },
                    '&:disabled': {
                      background: '#cccccc',
                      color: '#666666'
                    }
                  }}
                >
                  Clear Values
                </Button>

                <Button
                  onClick={handleDeleteAllCoolingRowsConfirm}
                  disabled={pmRTUCabinetCoolingData.length === 0}
                  variant="contained"
                  sx={{
                    background: '#E74C3C',
                    color: '#FFFFFF',
                    '&:hover': {
                      background: '#C0392B'
                    },
                    '&:disabled': {
                      background: '#cccccc',
                      color: '#666666'
                    }
                  }}
                >
                  Delete Rows
                </Button>
              </Box>

              {/* PM RTU Cabinet Cooling Table */}
              <Box sx={{ overflowX: 'auto' }}>
                <TableContainer>
                  <Table sx={{ minWidth: 600 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Select</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Fan Number</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Functional Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Remarks</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pmRTUCabinetCoolingData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ textAlign: 'center', padding: '24px', color: '#6c757d' }}>
                            No PM RTU Cabinet Cooling data added yet. Click "Add Cooling Row" to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pmRTUCabinetCoolingData.map((row, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              backgroundColor: selectedCoolingRowIndex === index ? '#e3f2fd' : 'transparent',
                              '&:hover': { backgroundColor: '#f5f5f5' }
                            }}
                          >
                            {/* Selection Checkbox */}
                            <TableCell>
                              <Checkbox
                                checked={selectedCoolingRowIndex === index}
                                onChange={() => handleCoolingRowSelection(index)}
                                size="small"
                                sx={{ color: '#3498DB' }}
                              />
                            </TableCell>

                            {/* Fan Number */}
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={row.FanNumber || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Only allow positive numbers
                                  if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
                                    handlePMCoolingChange(index, 'FanNumber', value);
                                  }
                                }}
                                inputProps={{
                                  min: 0,
                                  step: 1
                                }}
                                placeholder="Enter fan number"
                                sx={{ minWidth: '120px' }}
                              />
                            </TableCell>

                            {/* Functional Status */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.FunctionalStatus || ''}
                                onChange={(e) => handlePMCoolingChange(index, 'FunctionalStatus', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {coolingDropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Remarks */}
                            <TableCell>
                              <TextField
                                size="small"
                                multiline
                                rows={1}
                                value={row.Remarks || ''}
                                onChange={(e) => handlePMCoolingChange(index, 'Remarks', e.target.value)}
                                placeholder="Enter remarks"
                                sx={{ minWidth: '150px' }}
                              />
                            </TableCell>

                            {/* Actions */}
                            <TableCell>
                              <IconButton
                                onClick={() => handleRemovePMCoolingRow(index)}
                                size="small"
                                sx={{ color: '#d32f2f' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* PM RTU Cabinet Cooling Images */}
              <Box sx={{ marginTop: 3 }}>
                <MultipleImageUploadField
                  field="pmRTUCabinetCooling"
                  label="PM RTU Cabinet Cooling Images"
                  images={pmRTUCabinetCoolingImages}
                  previews={pmRTUCabinetCoolingPreviews}
                  onUpload={handlePmRTUCabinetCoolingUpload}
                  onRemove={handleRemovePmRTUCabinetCooling}
                  icon={Settings}
                />
              </Box>
            </Paper>

            {/* PM DVR Equipment Section */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                <Videocam sx={{ marginRight: 1, verticalAlign: 'middle' }} />
                PM DVR Equipment Information
              </Typography>

              {/* Action Buttons */}
              <Box sx={{
                display: 'flex',
                gap: 2,
                marginTop: 2,
                marginBottom: 2,
                flexWrap: 'wrap'
              }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddPMDVRRow}
                  variant="contained"
                  sx={{
                    background: RMSTheme.components.button.primary.background,
                    color: RMSTheme.components.button.primary.text,
                    '&:hover': {
                      background: RMSTheme.components.button.primary.hover
                    }
                  }}
                >
                  Add DVR Equipment Row
                </Button>

                <Button
                  onClick={handleApplySelectedDVRRow}
                  disabled={selectedDVRRowIndex === null || pmDVREquipmentData.length === 0}
                  variant="contained"
                  sx={{
                    background: RMSTheme.components.button.secondary?.background || '#6c757d',
                    color: RMSTheme.components.button.secondary?.text || '#FFFFFF',
                    '&:hover': {
                      background: RMSTheme.components.button.secondary?.hover || '#5a6268'
                    },
                    '&:disabled': {
                      background: '#cccccc',
                      color: '#666666'
                    }
                  }}
                >
                  Apply Selected Row to All
                </Button>

                <Button
                  onClick={handleClearAllDVRValuesConfirm}
                  disabled={pmDVREquipmentData.length === 0}
                  variant="contained"
                  sx={{
                    background: '#f39c12',
                    color: '#FFFFFF',
                    '&:hover': {
                      background: '#e67e22'
                    },
                    '&:disabled': {
                      background: '#cccccc',
                      color: '#666666'
                    }
                  }}
                >
                  Clear Values
                </Button>

                <Button
                  onClick={handleDeleteAllDVRRowsConfirm}
                  disabled={pmDVREquipmentData.length === 0}
                  variant="contained"
                  sx={{
                    background: '#E74C3C',
                    color: '#FFFFFF',
                    '&:hover': {
                      background: '#C0392B'
                    },
                    '&:disabled': {
                      background: '#cccccc',
                      color: '#666666'
                    }
                  }}
                >
                  Delete Rows
                </Button>
              </Box>

              {/* PM DVR Equipment Table */}
              <Box sx={{ overflowX: 'auto' }}>
                <TableContainer>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Select</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>DVR Comm</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>DVR RAID Comm</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Time Sync NTP Server</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Recording 24x7</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Remarks</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', padding: '12px 8px' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pmDVREquipmentData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ textAlign: 'center', padding: '24px', color: '#6c757d' }}>
                            No PM DVR Equipment data added yet. Click "Add DVR Equipment Row" to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pmDVREquipmentData.map((row, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              backgroundColor: selectedDVRRowIndex === index ? '#e3f2fd' : 'transparent',
                              '&:hover': {
                                backgroundColor: selectedDVRRowIndex === index ? '#e3f2fd' : '#f5f5f5'
                              }
                            }}
                          >
                            {/* Select Checkbox */}
                            <TableCell>
                              <Checkbox
                                checked={selectedDVRRowIndex === index}
                                onChange={() => handleDVRRowSelection(index)}
                                sx={{
                                  color: '#3498DB',
                                  '&.Mui-checked': {
                                    color: '#3498DB'
                                  }
                                }}
                              />
                            </TableCell>

                            {/* DVR Comm */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.DVRComm || ''}
                                onChange={(e) => handlePMDVRChange(index, 'DVRComm', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dvrDropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* DVR RAID Comm */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.DVRRAIDComm || ''}
                                onChange={(e) => handlePMDVRChange(index, 'DVRRAIDComm', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dvrDropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Time Sync NTP Server */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.TimeSyncNTPServer || ''}
                                onChange={(e) => handlePMDVRChange(index, 'TimeSyncNTPServer', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dvrDropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Recording 24x7 */}
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                value={row.Recording24x7 || ''}
                                onChange={(e) => handlePMDVRChange(index, 'Recording24x7', e.target.value)}
                                sx={{ minWidth: '100px' }}
                              >
                                {dvrDropdownOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Remarks */}
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.Remarks || ''}
                                onChange={(e) => handlePMDVRChange(index, 'Remarks', e.target.value)}
                                sx={{ minWidth: '120px' }}
                                multiline
                                rows={1}
                              />
                            </TableCell>

                            {/* Actions */}
                            <TableCell>
                              <IconButton
                                onClick={() => handleRemovePMDVRRow(index)}
                                size="small"
                                sx={{ color: '#e74c3c' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* PM DVR Equipment Images */}
              <Box sx={{ marginTop: 3 }}>
                <MultipleImageUploadField
                  field="pmDVREquipment"
                  label="PM DVR Equipment Images"
                  images={pmDVREquipmentImages}
                  previews={pmDVREquipmentPreviews}
                  onUpload={handlePmDVREquipmentUpload}
                  onRemove={handleRemovePmDVREquipment}
                  icon={Videocam}
                />
              </Box>
            </Paper>

            {/* Cleaning of Cabinet / Equipment Section */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                🧹 Cleaning of Cabinet / Equipment
              </Typography>

              <Grid container spacing={3} sx={{ marginTop: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    value={formData.cleaningStatus || ''}
                    onChange={(e) => onInputChange('cleaningStatus', e.target.value)}
                    placeholder="Select Cleaning Status"
                    displayEmpty
                    SelectProps={{
                      native: false,
                      displayEmpty: true,
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                            minWidth: 250,
                            '& .MuiMenuItem-root': {
                              minHeight: '56px',
                              fontSize: '16px',
                              padding: '12px 16px'
                            }
                          }
                        },
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left'
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left'
                        },
                        getContentAnchorEl: null
                      }
                    }}
                    sx={{
                      ...fieldStyle,
                      minWidth: '250px',
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        minHeight: '56px',
                        fontSize: '16px',
                        padding: '16px 14px'
                      }
                    }}
                  >
                    <MenuItem value="" sx={{
                      color: '#999',
                      fontStyle: 'italic',
                      fontSize: '16px',
                      minHeight: '56px'
                    }}>
                      Select Cleaning Status
                    </MenuItem>
                    <MenuItem value="DONE" sx={{
                      color: '#27AE60',
                      fontWeight: 600,
                      fontSize: '16px',
                      minHeight: '56px',
                      '&:hover': { backgroundColor: '#E8F5E8' }
                    }}>
                      ✅ DONE
                    </MenuItem>
                    <MenuItem value="PENDING" sx={{
                      color: '#F39C12',
                      fontWeight: 600,
                      fontSize: '16px',
                      minHeight: '56px',
                      '&:hover': { backgroundColor: '#FEF9E7' }
                    }}>
                      ⏳ PENDING
                    </MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
            {/* Remarks Section */}
            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                📝 Remarks
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
                <TextField
                  fullWidth
                  value={formData.remarks || ''}
                  onChange={(e) => onInputChange('remarks', e.target.value)}
                  sx={{
                    ...fieldStyle,
                    width: '100%',
                    '& .MuiInputBase-root': {
                      width: '100%'
                    },
                    '& .MuiOutlinedInput-root': {
                      width: '100%'
                    }
                  }}
                  multiline
                  rows={4}
                  placeholder="Remarks"
                />
              </Box>
            </Paper>

            {/* Attended By & Approved By Section */}
            <Paper sx={{
              ...sectionContainerStyle,
              background: '#ffffff'
            }}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                📝 Approval Information
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
                <TextField
                  fullWidth
                  label="Attended By"
                  value={formData.attendedBy || ''}
                  onChange={(e) => handleInputChange('attendedBy', e.target.value)}
                  placeholder="Enter the name of the person who attended to this maintenance..."
                  sx={fieldStyle}
                />
                <TextField
                  fullWidth
                  label="Approved By"
                  value={formData.approvedBy || ''}
                  onChange={(e) => handleInputChange('approvedBy', e.target.value)}
                  placeholder="Enter the name of the person who approved this report..."
                  sx={fieldStyle}
                />
              </Box>
            </Paper>

            <Paper sx={sectionContainerStyle}>
              <Typography variant="h5" sx={sectionHeaderStyle}>
                ✅ Form Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
                <TextField
                  fullWidth
                  select
                  label="Form Status"
                  value={formData.formstatusID || ''}
                  onChange={(e) => handleInputChange('formstatusID', e.target.value)}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected) =>
                      selected
                        ? (formStatusOptions.find((s) => (s.id || s.ID) === selected)?.name ||
                          formStatusOptions.find((s) => (s.id || s.ID) === selected)?.Name ||
                          selected)
                        : <em>Select Form Status</em>
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldStyle}
                >
                  <MenuItem value="">
                    <em>Select Form Status</em>
                  </MenuItem>
                  {(formStatusOptions || []).map((status) => (
                    <MenuItem key={status.id || status.ID} value={status.id || status.ID}>
                      {status.name || status.Name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Paper>


            {/* Navigation Buttons Section */}
            <Paper sx={{
              ...sectionContainerStyle,
              background: '#ffffff',
              marginBottom: 0
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  onClick={onBack}
                  startIcon={<ArrowBackIosNewIcon fontSize="small" />}
                  sx={{
                    background: RMSTheme.components.button.primary.background,
                    color: RMSTheme.components.button.primary.text,
                    padding: '12px 32px',
                    borderRadius: RMSTheme.borderRadius.small,
                    border: `1px solid ${RMSTheme.components.button.primary.border}`,
                    boxShadow: RMSTheme.components.button.primary.shadow,
                    '&:hover': {
                      background: RMSTheme.components.button.primary.hover
                    }
                  }}
                >
                  Back
                </Button>

                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIosIcon fontSize="small" />}
                  sx={{
                    background: RMSTheme.components.button.primary.background,
                    color: RMSTheme.components.button.primary.text,
                    padding: '12px 32px',
                    borderRadius: RMSTheme.borderRadius.small,
                    border: `1px solid ${RMSTheme.components.button.primary.border}`,
                    boxShadow: RMSTheme.components.button.primary.shadow,
                    '&:hover': {
                      background: RMSTheme.components.button.primary.hover
                    }
                  }}
                >
                  Next
                </Button>
              </Box>
            </Paper>
          </Box>
        </Paper>
        {/* Clear Values Confirmation Modal */}
        <Dialog
          open={showClearConfirm}
          onClose={handleCancel}
          PaperProps={{
            sx: {
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }
          }}
        >
          <DialogTitle sx={{ color: '#2C3E50', fontWeight: 600 }}>
            Clear All Values
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: '#34495E' }}>
              Are you sure you want to clear all values? This will empty all fields but keep the row structure intact.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: '16px 24px' }}>
            <Button
              onClick={handleClearAllValuesExecute}
              variant="contained"
              sx={{
                background: '#f39c12',
                color: '#FFFFFF',
                '&:hover': {
                  background: '#e67e22'
                }
              }}
            >
              Clear Values
            </Button>
            <Button
              onClick={handleCancel}
              variant="outlined"
              sx={{
                borderColor: '#6c757d',
                color: '#6c757d',
                '&:hover': {
                  backgroundColor: '#f8f9fa',
                  borderColor: '#5a6268'
                }
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Rows Confirmation Modal */}
        <Dialog
          open={showDeleteConfirm}
          onClose={handleCancel}
          PaperProps={{
            sx: {
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }
          }}
        >
          <DialogTitle sx={{ color: '#E74C3C', fontWeight: 600 }}>
            Delete All Rows
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: '#34495E' }}>
              Are you sure you want to delete all rows? This action cannot be undone and will remove all RTU Cabinet data.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: '16px 24px' }}>
            <Button
              onClick={handleDeleteAllRowsExecute}
              variant="contained"
              sx={{
                background: '#E74C3C',
                color: '#FFFFFF',
                '&:hover': {
                  background: '#C0392B'
                }
              }}
            >
              Delete All
            </Button>
            <Button
              onClick={handleCancel}
              variant="outlined"
              sx={{
                borderColor: '#6c757d',
                color: '#6c757d',
                '&:hover': {
                  backgroundColor: '#f8f9fa',
                  borderColor: '#5a6268'
                }
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* PM Chamber Clear Values Confirmation Modal */}
        <Dialog
          open={showChamberClearConfirm}
          onClose={handleChamberCancel}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              padding: '8px'
            }
          }}
        >
          <DialogTitle sx={{ color: '#f39c12', fontWeight: 600 }}>
            Clear PM Chamber Values
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to clear all field values in the PM Chamber Magnetic Contact table? This will keep the rows but reset all dropdown selections and remarks to empty.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: '16px 24px' }}>
            <Button
              onClick={handleChamberCancel}
              sx={{
                color: '#6c757d',
                '&:hover': { backgroundColor: '#f8f9fa' }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearAllChamberValuesExecute}
              sx={{
                background: '#f39c12',
                color: '#FFFFFF',
                '&:hover': {
                  background: '#e67e22'
                }
              }}
              variant="contained"
            >
              Clear Values
            </Button>
          </DialogActions>
        </Dialog>

        {/* PM Chamber Delete Rows Confirmation Modal */}
        <Dialog
          open={showChamberDeleteConfirm}
          onClose={handleChamberCancel}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              padding: '8px'
            }
          }}
        >
          <DialogTitle sx={{ color: '#e74c3c', fontWeight: 600 }}>
            Delete All PM Chamber Rows
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete all rows in the PM Chamber Magnetic Contact table? This action cannot be undone and will remove all data permanently.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: '16px 24px' }}>
            <Button
              onClick={handleChamberCancel}
              sx={{
                color: '#6c757d',
                '&:hover': { backgroundColor: '#f8f9fa' }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAllChamberRowsExecute}
              sx={{
                background: '#e74c3c',
                color: '#FFFFFF',
                '&:hover': {
                  background: '#c0392b'
                }
              }}
              variant="contained"
            >
              Delete All Rows
            </Button>
          </DialogActions>
        </Dialog>

        {/* PM RTU Cabinet Cooling Clear Values Confirmation Modal */}
        <Dialog
          open={showCoolingClearConfirm}
          onClose={handleCoolingCancel}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              padding: '8px'
            }
          }}
        >
          <DialogTitle sx={{ color: '#f39c12', fontWeight: 600 }}>
            Clear PM RTU Cabinet Cooling Values
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to clear all field values in the PM RTU Cabinet Cooling table? This will keep the rows but reset all dropdown selections and remarks to empty.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: '16px 24px' }}>
            <Button
              onClick={handleCoolingCancel}
              sx={{
                color: '#6c757d',
                '&:hover': { backgroundColor: '#f8f9fa' }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearAllCoolingValuesExecute}
              sx={{
                background: '#f39c12',
                color: '#FFFFFF',
                '&:hover': {
                  background: '#e67e22'
                }
              }}
              variant="contained"
            >
              Clear Values
            </Button>
          </DialogActions>
        </Dialog>

        {/* PM RTU Cabinet Cooling Delete Rows Confirmation Modal */}
        <Dialog
          open={showCoolingDeleteConfirm}
          onClose={handleCoolingCancel}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              padding: '8px'
            }
          }}
        >
          <DialogTitle sx={{ color: '#e74c3c', fontWeight: 600 }}>
            Delete All PM RTU Cabinet Cooling Rows
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete all rows in the PM RTU Cabinet Cooling table? This action cannot be undone and will remove all data permanently.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: '16px 24px' }}>
            <Button
              onClick={handleCoolingCancel}
              sx={{
                color: '#6c757d',
                '&:hover': { backgroundColor: '#f8f9fa' }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAllCoolingRowsExecute}
              sx={{
                background: '#e74c3c',
                color: '#FFFFFF',
                '&:hover': {
                  background: '#c0392b'
                }
              }}
              variant="contained"
            >
              Delete All Rows
            </Button>
          </DialogActions>
        </Dialog>

        {/* PM DVR Equipment Clear Values Confirmation Modal */}
        <Dialog
          open={showDVRClearConfirm}
          onClose={handleDVRCancel}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              padding: '8px'
            }
          }}
        >
          <DialogTitle sx={{ color: '#f39c12', fontWeight: 600 }}>
            Clear PM DVR Equipment Values
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to clear all field values in the PM DVR Equipment table? This will keep the rows but reset all dropdown selections and remarks to empty.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: '16px 24px' }}>
            <Button
              onClick={handleDVRCancel}
              sx={{
                color: '#6c757d',
                '&:hover': { backgroundColor: '#f8f9fa' }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearAllDVRValuesExecute}
              sx={{
                background: '#f39c12',
                color: '#FFFFFF',
                '&:hover': {
                  background: '#e67e22'
                }
              }}
              variant="contained"
            >
              Clear Values
            </Button>
          </DialogActions>
        </Dialog>

        {/* PM DVR Equipment Delete Rows Confirmation Modal */}
        <Dialog
          open={showDVRDeleteConfirm}
          onClose={handleDVRCancel}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              padding: '8px'
            }
          }}
        >
          <DialogTitle sx={{ color: '#e74c3c', fontWeight: 600 }}>
            Delete All PM DVR Equipment Rows
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete all rows in the PM DVR Equipment table? This action cannot be undone and will remove all data permanently.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: '16px 24px' }}>
            <Button
              onClick={handleDVRCancel}
              sx={{
                color: '#6c757d',
                '&:hover': { backgroundColor: '#f8f9fa' }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAllDVRRowsExecute}
              sx={{
                background: '#e74c3c',
                color: '#FFFFFF',
                '&:hover': {
                  background: '#c0392b'
                }
              }}
              variant="contained"
            >
              Delete All Rows
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Form Status Warning Modal */}
      <WarningModal
        open={showFormStatusWarning}
        onClose={() => setShowFormStatusWarning(false)}
        title="Form Status Required"
        content="Please select a Form Status before proceeding to the next step."
        buttonText="OK"
      />
    </LocalizationProvider>
  );
};

export default RTUPMReportForm;

