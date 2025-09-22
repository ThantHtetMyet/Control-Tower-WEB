import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  Autocomplete,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  Videocam as VideocamIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import RMSTheme from '../../theme-resource/RMSTheme';
import { getRTUPMReportForm, updateRTUPMReportForm, getReportFormTypes } from '../../api-services/reportFormService';
import warehouseService from '../../api-services/warehouseService';
import { getPMReportFormTypes } from '../../api-services/reportFormService';
import { API_BASE_URL } from '../../../config/apiConfig';

// MultipleImageUploadField Component
const MultipleImageUploadField = ({ 
  images, 
  onImagesChange, 
  label, 
  maxImages = 10,
  accept = "image/*"
}) => {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    // Create preview URLs for existing images
    const newPreviews = images.map(image => {
      if (image.file) {
        return {
          id: image.id || Date.now() + Math.random(),
          url: URL.createObjectURL(image.file),
          isNew: true,
          file: image.file
        };
      } else if (image.imageUrl) {
        return {
          id: image.id,
          url: image.imageUrl,
          isNew: false,
          imageName: image.imageName
        };
      }
      return null;
    }).filter(Boolean);

    setPreviews(newPreviews);

    // Cleanup function to revoke blob URLs
    return () => {
      newPreviews.forEach(preview => {
        if (preview.isNew && preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [images]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const remainingSlots = maxImages - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newImages = filesToAdd.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      isNew: true
    }));

    onImagesChange([...images, ...newImages]);
    event.target.value = '';
  };

  const handleRemoveImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  return (
    <Box sx={{ marginTop: 2 }}>
      <Typography variant="subtitle1" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
        {label}
      </Typography>
      
      {/* Upload Button */}
      {images.length < maxImages && (
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{ marginBottom: 2 }}
        >
          Upload Images 
          <input
            type="file"
            hidden
            multiple
            accept={accept}
            onChange={handleFileSelect}
          />
        </Button>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <Grid container spacing={2}>
          {previews.map((preview) => (
            <Grid item xs={6} sm={4} md={3} key={preview.id}>
              <Box sx={{ position: 'relative' }}>
                <img
                  src={preview.url}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveImage(preview.id)}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <Box
          sx={{
            border: '2px dashed #ddd',
            borderRadius: 2,
            padding: 3,
            textAlign: 'center',
            color: '#666'
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, marginBottom: 1, opacity: 0.5 }} />
          <Typography variant="body2">
            No images uploaded yet. Click "Upload Images" to add photos.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const RTUPMReportFormEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Dropdown data states
  const [systemNames, setSystemNames] = useState([]);
  const [stationNames, setStationNames] = useState([]);
  const [reportFormTypes, setReportFormTypes] = useState([]);
  const [pmReportFormTypes, setPmReportFormTypes] = useState([]);
  const [showPMTypeDropdown, setShowPMTypeDropdown] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Form data state
  const [formData, setFormData] = useState({
    systemDescription: '',
    systemNameWarehouseID: '',
    stationName: '',
    stationNameWarehouseID: '',
    jobNo: '',
    projectNo: '',
    customer: '',
    reportFormTypeID: '',
    pmReportFormTypeID: '',
    pmReportFormTypeName: '',
    dateOfService: '',
    cleaningOfCabinet: '',
    cleaningStatus: '',
    remarks: '',
    approvedBy: '',
    attendedBy: ''
  });

  // Image states
  const [pmMainRtuCabinetImages, setPmMainRtuCabinetImages] = useState([]);
  const [pmChamberMagneticContactImages, setPmChamberMagneticContactImages] = useState([]);
  const [pmRTUCabinetCoolingImages, setPmRTUCabinetCoolingImages] = useState([]);
  const [pmDVREquipmentImages, setPmDVREquipmentImages] = useState([]);

  // Table data states
  const [mainRTUCabinetData, setMainRTUCabinetData] = useState([{
    rtuCabinet: '',
    equipmentRack: '',
    monitor: '',
    mouseKeyboard: '',
    cpU6000Card: '',
    inputCard: '',
    megapopNTU: '',
    networkRouter: '',
    networkSwitch: '',
    digitalVideoRecorder: '',
    rtuDoorContact: '',
    powerSupplyUnit: '',
    upsBattery: '',
    remarks: ''
  }]);

  const [pmChamberMagneticContactData, setPmChamberMagneticContactData] = useState([{
    chamberNumber: '1',
    chamberOGBox: '',
    chamberContact1: '',
    chamberContact2: '',
    chamberContact3: '',
    remarks: ''
  }]);

  const [pmRTUCabinetCoolingData, setPmRTUCabinetCoolingData] = useState([{
    fanNumber: '1',
    functionalStatus: '',
    remarks: ''
  }]);

  const [pmDVREquipmentData, setPmDVREquipmentData] = useState([{
    dvrComm: '',
    dvrraidComm: '',
    timeSyncNTPServer: '',
    recording24x7: '',
    remarks: ''
  }]);

  // Dropdown options (matching RTUPMReportForm)
  const statusOptions = ['', 'NA', 'Acceptable', 'NonAcceptable']; // For Main RTU Cabinet
  const functionalStatusOptions = ['', 'FAIL', 'PASS', 'NA']; // For PM Chamber Magnetic Contact
  const dvrStatusOptions = ['', 'NA', 'PASS', 'FAIL']; // For PM DVR Equipment
  const coolingStatusOptions = ['', 'FAIL', 'PASS', 'NA']; // For PM RTU Cabinet Cooling

  // Selection state variables for Apply Selected Row feature
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [selectedChamberRowIndex, setSelectedChamberRowIndex] = useState(null);
  const [selectedCoolingRowIndex, setSelectedCoolingRowIndex] = useState(null);
  const [selectedDVRRowIndex, setSelectedDVRRowIndex] = useState(null);

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
  // Load dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [systemsResponse, reportTypesResponse, pmTypesResponse] = await Promise.all([
          warehouseService.getSystemNameWarehouses(),
          getReportFormTypes(),
          getPMReportFormTypes()
        ]);

        setSystemNames(systemsResponse?.data || []);
        setReportFormTypes(reportTypesResponse || []);
        setPmReportFormTypes(pmTypesResponse || []);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  // Load station names when system changes
  useEffect(() => {
    const fetchStationNames = async () => {
      if (formData.systemNameWarehouseID) {
        try {
          const response = await warehouseService.getStationNameWarehouses(formData.systemNameWarehouseID);
          // The warehouseService already returns response.data, so we don't need to access .data again
          setStationNames(response || []);
        } catch (error) {
          console.error('Error fetching station names:', error);
          setStationNames([]);
        }
      } else {
        setStationNames([]);
      }
    };

    fetchStationNames();
  }, [formData.systemNameWarehouseID]);

  // Show/hide PM type dropdown based on report form type
  useEffect(() => {
    const selectedReportType = reportFormTypes.find(type => type.id === formData.reportFormTypeID);
    if (selectedReportType && selectedReportType.name === 'Preventative Maintenance') {
      setShowPMTypeDropdown(true);
    } else {
      setShowPMTypeDropdown(false);
    }
  }, [formData.reportFormTypeID, reportFormTypes]);

  // Load existing report data
  useEffect(() => {
    const fetchReportData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await getRTUPMReportForm(id);
        
        // Set basic form data - Set system ID first to trigger station loading
        setFormData(prev => ({
          ...prev,
          systemDescription: response.systemNameWarehouseName || '',
          systemNameWarehouseID: response.systemNameWarehouseID || '',
          projectNo: response.pmReportFormRTU?.projectNo || '',
          jobNo: response.jobNo || '',
          customer: response.pmReportFormRTU?.customer || '',
          reportFormTypeID: response.reportFormTypeID || '',
          pmReportFormTypeID: response.pmReportFormRTU.pmReportFormTypeID || '',
          pmReportFormTypeName: response.pmReportFormRTU?.pmReportFormTypeName || '',
          dateOfService: response.pmReportFormRTU?.dateOfService ? 
            new Date(response.pmReportFormRTU.dateOfService).toISOString().slice(0, 16) : '',
          cleaningOfCabinet: response.pmReportFormRTU?.cleaningOfCabinet || '',
          remarks: response.pmReportFormRTU?.remarks || '',
          approvedBy: response.pmReportFormRTU?.approvedBy || '',
          attendedBy: response.pmReportFormRTU?.attendedBy || ''
        }));

        // Set station data after a brief delay to ensure station names are loaded
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            stationName: response.stationNameWarehouseName || '',
            stationNameWarehouseID: response.stationNameWarehouseID || ''
          }));
        }, 100);

        // Set table data with IDs preserved
        setMainRTUCabinetData(response.pmMainRtuCabinet?.map(item => ({
          id: item.id || item.ID, // Preserve ID
          rtuCabinet: item.rtuCabinet || item.RTUCabinet || '',
          equipmentRack: item.equipmentRack || item.EquipmentRack || '',
          monitor: item.monitor || item.Monitor || '',
          mouseKeyboard: item.mouseKeyboard || item.MouseKeyboard || '',
          cpU6000Card: item.cpU6000Card || item.CPU6000Card || '',
          inputCard: item.inputCard || item.InputCard || '',
          megapopNTU: item.megapopNTU || item.MegapopNTU || '',
          networkRouter: item.networkRouter || item.NetworkRouter || '',
          networkSwitch: item.networkSwitch || item.NetworkSwitch || '',
          digitalVideoRecorder: item.digitalVideoRecorder || item.DigitalVideoRecorder || '',
          rtuDoorContact: item.rtuDoorContact || item.RTUDoorContact || '',
          powerSupplyUnit: item.powerSupplyUnit || item.PowerSupplyUnit || '',
          upsBattery: item.upsBattery || item.UPSBattery || '',
          remarks: item.remarks || item.Remarks || ''
        })) || [{
          rtuCabinet: '',
          equipmentRack: '',
          monitor: '',
          mouseKeyboard: '',
          cpU6000Card: '',
          inputCard: '',
          megapopNTU: '',
          networkRouter: '',
          networkSwitch: '',
          digitalVideoRecorder: '',
          rtuDoorContact: '',
          powerSupplyUnit: '',
          upsBattery: '',
          remarks: ''
        }]);

        setPmChamberMagneticContactData(response.pmChamberMagneticContact?.map(item => ({
          id: item.id || item.ID, // Preserve ID
          chamberNumber: item.chamberNumber || item.ChamberNumber || '1',
          chamberOGBox: item.chamberOGBox || item.ChamberOGBox || '',
          chamberContact1: item.chamberContact1 || item.ChamberContact1 || '',
          chamberContact2: item.chamberContact2 || item.ChamberContact2 || '',
          chamberContact3: item.chamberContact3 || item.ChamberContact3 || '',
          remarks: item.remarks || item.Remarks || ''
        })) || [{
          chamberNumber: '1',
          chamberOGBox: '',
          chamberContact1: '',
          chamberContact2: '',
          chamberContact3: '',
          remarks: ''
        }]);

        setPmRTUCabinetCoolingData(response.pmrtuCabinetCooling?.map(item => ({
          id: item.id || item.ID, // Preserve ID
          fanNumber: item.fanNumber || item.FanNumber || '1',
          functionalStatus: item.functionalStatus || item.FunctionalStatus || '',
          remarks: item.remarks || item.Remarks || ''
        })) || [{
          fanNumber: '1',
          functionalStatus: '',
          remarks: ''
        }]);

        setPmDVREquipmentData(response.pmdvrEquipment?.map(item => ({
          id: item.id || item.ID, // Preserve ID
          dvrComm: item.dvrComm || item.DVRComm || '',
          dvrraidComm: item.dvrraidComm || item.DVRRAIDComm || '',
          timeSyncNTPServer: item.timeSyncNTPServer || item.TimeSyncNTPServer || '',
          recording24x7: item.recording24x7 || item.Recording24x7 || '',
          remarks: item.remarks || item.Remarks || ''
        })) || [{
          dvrComm: '',
          dvrraidComm: '',
          timeSyncNTPServer: '',
          recording24x7: '',
          remarks: ''
        }]);

        // Set image data with constructed URLs
        setPmMainRtuCabinetImages((response.pmMainRtuCabinetImages || []).map(image => ({
          ...image,
          imageUrl: image.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${image.imageName}` : null
        })));

        setPmChamberMagneticContactImages((response.pmChamberMagneticContactImages || []).map(image => ({
          ...image,
          imageUrl: image.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${image.imageName}` : null
        })));

        setPmRTUCabinetCoolingImages((response.pmrtuCabinetCoolingImages || []).map(image => ({
          ...image,
          imageUrl: image.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${image.imageName}` : null
        })));

        setPmDVREquipmentImages((response.pmdvrEquipmentImages || []).map(image => ({
          ...image,
          imageUrl: image.imageName ? `${API_BASE_URL}/api/ReportFormImage/image/${id}/${image.imageName}` : null
        })));

      } catch (error) {
        setError('Failed to load report data');
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [id]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      [pmMainRtuCabinetImages, pmChamberMagneticContactImages, pmRTUCabinetCoolingImages, pmDVREquipmentImages]
        .flat()
        .forEach(image => {
          if (image.file && image.url && image.url.startsWith('blob:')) {
            URL.revokeObjectURL(image.url);
          }
        });
    };
  }, []);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSystemChange = (systemId) => {
    setFormData(prev => ({
      ...prev,
      systemNameWarehouseID: systemId,
      stationNameWarehouseID: '', // Reset station when system changes
      stationName: ''
    }));
  };

  const handleStationChange = (stationId) => {
    const selectedStation = stationNames.find(station => station.id === stationId);
    setFormData(prev => ({
      ...prev,
      stationNameWarehouseID: stationId,
      stationName: selectedStation ? selectedStation.name : ''
    }));
  };

  // Table row handlers
  const handleAddRow = (tableType) => {
    switch (tableType) {
      case 'mainRTU':
        setMainRTUCabinetData(prev => [...prev, {
          id: null, // Explicitly set to null for new records
          rtuCabinet: '',
          equipmentRack: '',
          monitor: '',
          mouseKeyboard: '',
          cpU6000Card: '',
          inputCard: '',
          megapopNTU: '',
          networkRouter: '',
          networkSwitch: '',
          digitalVideoRecorder: '',
          rtuDoorContact: '',
          powerSupplyUnit: '',
          upsBattery: '',
          remarks: ''
        }]);
        break;
      case 'chamber':
        setPmChamberMagneticContactData(prev => {
          // Get all existing chamber numbers (including deleted rows to avoid conflicts)
          const existingChamberNumbers = prev.map(row => parseInt(row.chamberNumber) || 0);
          
          // Find the next available chamber number
          let nextChamberNumber = 1;
          while (existingChamberNumbers.includes(nextChamberNumber)) {
            nextChamberNumber++;
          }
          
          return [...prev, {
            id: null, // Explicitly set to null for new records
            chamberNumber: nextChamberNumber.toString(),
            chamberOGBox: '',
            chamberContact1: '',
            chamberContact2: '',
            chamberContact3: '',
            remarks: ''
          }];
        });
        break;
      case 'cooling':
        setPmRTUCabinetCoolingData(prev => {
          // Get all existing fan numbers (including deleted rows to avoid conflicts)
          const existingFanNumbers = prev.map(row => parseInt(row.fanNumber) || 0);
          
          // Find the next available fan number
          let nextFanNumber = 1;
          while (existingFanNumbers.includes(nextFanNumber)) {
            nextFanNumber++;
          }
          
          return [...prev, {
            id: null, // Explicitly set to null for new records
            fanNumber: nextFanNumber.toString(),
            functionalStatus: '',
            remarks: ''
          }];
        });
        break;
      case 'dvr':
        setPmDVREquipmentData(prev => [...prev, {
          id: null, // Explicitly set to null for new records
          dvrComm: '',
          dvrraidComm: '',
          timeSyncNTPServer: '',
          recording24x7: '',
          remarks: ''
        }]);
        break;
    }
  };

  const handleRemoveRow = (tableType, index) => {
    switch (tableType) {
      case 'mainRTU':
        setMainRTUCabinetData(prev => prev.map((row, i) => 
          i === index ? { ...row, isDeleted: true } : row
        ));
        break;
      case 'chamber':
        setPmChamberMagneticContactData(prev => prev.map((row, i) => 
          i === index ? { ...row, isDeleted: true } : row
        ));
        break;
      case 'cooling':
        setPmRTUCabinetCoolingData(prev => prev.map((row, i) => 
          i === index ? { ...row, isDeleted: true } : row
        ));
        break;
      case 'dvr':
        setPmDVREquipmentData(prev => prev.map((row, i) => 
          i === index ? { ...row, isDeleted: true } : row
        ));
        break;
    }
  };

  const handleRestoreRow = (tableType, index) => {
    switch (tableType) {
      case 'mainRTU':
        setMainRTUCabinetData(prev => prev.map((row, i) => 
          i === index ? { ...row, isDeleted: false } : row
        ));
        break;
      case 'chamber':
        setPmChamberMagneticContactData(prev => prev.map((row, i) => 
          i === index ? { ...row, isDeleted: false } : row
        ));
        break;
      case 'cooling':
        setPmRTUCabinetCoolingData(prev => prev.map((row, i) => 
          i === index ? { ...row, isDeleted: false } : row
        ));
        break;
      case 'dvr':
        setPmDVREquipmentData(prev => prev.map((row, i) => 
          i === index ? { ...row, isDeleted: false } : row
        ));
        break;
    }
  };

  const handleTableCellChange = (tableType, rowIndex, field, value) => {
    switch (tableType) {
      case 'mainRTU':
        setMainRTUCabinetData(prev => prev.map((row, index) => 
          index === rowIndex ? { ...row, [field]: value } : row
        ));
        break;
      case 'chamber':
        setPmChamberMagneticContactData(prev => prev.map((row, index) => 
          index === rowIndex ? { ...row, [field]: value } : row
        ));
        break;
      case 'cooling':
        setPmRTUCabinetCoolingData(prev => prev.map((row, index) => 
          index === rowIndex ? { ...row, [field]: value } : row
        ));
        break;
      case 'dvr':
        setPmDVREquipmentData(prev => prev.map((row, index) => 
          index === rowIndex ? { ...row, [field]: value } : row
        ));
        break;
    }
  };

  // Handler for row selection
  const handleRowSelection = (index) => {
    setSelectedRowIndex(selectedRowIndex === index ? null : index);
  };

  const handleChamberRowSelection = (index) => {
    setSelectedChamberRowIndex(selectedChamberRowIndex === index ? null : index);
  };

  const handleCoolingRowSelection = (index) => {
    setSelectedCoolingRowIndex(selectedCoolingRowIndex === index ? null : index);
  };

  const handleDVRRowSelection = (index) => {
    setSelectedDVRRowIndex(selectedDVRRowIndex === index ? null : index);
  };

  // Handler to apply selected row values to all rows (excluding ID)
  const handleApplySelectedRow = () => {
    if (selectedRowIndex !== null && mainRTUCabinetData[selectedRowIndex]) {
      const selectedRow = mainRTUCabinetData[selectedRowIndex];
      const { id, ...rowDataWithoutId } = selectedRow; // Exclude ID
      const newData = mainRTUCabinetData.map((row) => ({ 
        ...row, 
        ...rowDataWithoutId,
        id: row.id // Preserve original ID
      }));
      setMainRTUCabinetData(newData);
    }
  };

  const handleApplySelectedChamberRow = () => {
    if (selectedChamberRowIndex !== null && pmChamberMagneticContactData[selectedChamberRowIndex]) {
      const selectedRow = pmChamberMagneticContactData[selectedChamberRowIndex];
      const { id, ...rowDataWithoutId } = selectedRow; // Exclude ID
      const newData = pmChamberMagneticContactData.map((row) => ({
        ...row,
        ...rowDataWithoutId,
        id: row.id, // Preserve original ID
        chamberNumber: row.chamberNumber // Preserve original ChamberNumber
      }));
      setPmChamberMagneticContactData(newData);
    }
  };

  const handleApplySelectedCoolingRow = () => {
    if (selectedCoolingRowIndex !== null && pmRTUCabinetCoolingData[selectedCoolingRowIndex]) {
      const selectedRow = pmRTUCabinetCoolingData[selectedCoolingRowIndex];
      const { id, ...rowDataWithoutId } = selectedRow; // Exclude ID
      const newData = pmRTUCabinetCoolingData.map((row) => ({
        ...row,
        ...rowDataWithoutId,
        id: row.id, // Preserve original ID
        fanNumber: row.fanNumber // Preserve original FanNumber
      }));
      setPmRTUCabinetCoolingData(newData);
    }
  };

  const handleApplySelectedDVRRow = () => {
    if (selectedDVRRowIndex !== null && pmDVREquipmentData[selectedDVRRowIndex]) {
      const selectedRow = pmDVREquipmentData[selectedDVRRowIndex];
      const { id, ...rowDataWithoutId } = selectedRow; // Exclude ID
      const newData = pmDVREquipmentData.map((row) => ({
        ...row,
        ...rowDataWithoutId,
        id: row.id // Preserve original ID
      }));
      setPmDVREquipmentData(newData);
    }
  };

  // Form submission - Navigate to review with form data
  const handleSubmit = () => {
    // Prepare the complete form data to pass to review
    const reviewData = {
      // Basic form data
      systemDescription: formData.systemDescription,
      systemNameWarehouseName: formData.systemDescription,
      systemNameWarehouseID: formData.systemNameWarehouseID,
      stationName: formData.stationName,
      stationNameWarehouseName: formData.stationName,
      stationNameWarehouseID: formData.stationNameWarehouseID,
      jobNo: formData.jobNo,
      projectNo: formData.projectNo,
      customer: formData.customer,
      reportFormTypeID: formData.reportFormTypeID,
      pmReportFormTypeID: formData.pmReportFormTypeID,
      pmReportFormTypeName: formData.pmReportFormTypeName,
      dateOfService: formData.dateOfService,
      cleaningOfCabinet: formData.cleaningOfCabinet,
      cleaningStatus: formData.cleaningStatus,
      remarks: formData.remarks,
      approvedBy: formData.approvedBy,
      attendedBy: formData.attendedBy,
      
      // PM Report Form RTU data
      pmReportFormRTU: {
        projectNo: formData.projectNo,
        customer: formData.customer,
        dateOfService: formData.dateOfService,
        cleaningOfCabinet: formData.cleaningOfCabinet,
        cleaningStatus: formData.cleaningStatus,
        remarks: formData.remarks,
        approvedBy: formData.approvedBy,
        attendedBy: formData.attendedBy,
        pmReportFormTypeID: formData.pmReportFormTypeID
      },
      
      // Table data
      pmMainRtuCabinet: mainRTUCabinetData.map(row => ({
        ID: row.id,
        RTUCabinet: row.rtuCabinet,
        EquipmentRack: row.equipmentRack,
        Monitor: row.monitor,
        MouseKeyboard: row.mouseKeyboard,
        CPU6000Card: row.cpU6000Card,
        InputCard: row.inputCard,
        MegapopNTU: row.megapopNTU,
        NetworkRouter: row.networkRouter,
        NetworkSwitch: row.networkSwitch,
        DigitalVideoRecorder: row.digitalVideoRecorder,
        RTUDoorContact: row.rtuDoorContact,
        PowerSupplyUnit: row.powerSupplyUnit,
        UPSBattery: row.upsBattery,
        Remarks: row.remarks,
        isDeleted: row.isDeleted || false
      })),
      
      pmChamberMagneticContact: pmChamberMagneticContactData.map(row => ({
        ID: row.id,
        ChamberNumber: row.chamberNumber,
        ChamberOGBox: row.chamberOGBox,
        ChamberContact1: row.chamberContact1,
        ChamberContact2: row.chamberContact2,
        ChamberContact3: row.chamberContact3,
        Remarks: row.remarks,
        isDeleted: row.isDeleted || false
      })),
      
      pmRTUCabinetCooling: pmRTUCabinetCoolingData.map(row => ({
        ID: row.id,
        FanNumber: row.fanNumber,
        FunctionalStatus: row.functionalStatus,
        Remarks: row.remarks,
        isDeleted: row.isDeleted || false
      })),
      
      pmDVREquipment: pmDVREquipmentData.map(row => ({
        ID: row.id,
        DVRComm: row.dvrComm,
        DVRRAIDComm: row.dvrraidComm,
        TimeSyncNTPServer: row.timeSyncNTPServer,
        Recording24x7: row.recording24x7,
        Remarks: row.remarks,
        isDeleted: row.isDeleted || false
      })),
      
      // Image data with change tracking
      pmMainRtuCabinetImages: pmMainRtuCabinetImages,
      pmChamberMagneticContactImages: pmChamberMagneticContactImages,
      pmRTUCabinetCoolingImages: pmRTUCabinetCoolingImages,
      pmDVREquipmentImages: pmDVREquipmentImages,
      
      // Add metadata to help track changes
      _imageChangeMetadata: {
        hasImageChanges: true,
        changedSections: {
          pmMainRtuCabinetImages: pmMainRtuCabinetImages.some(img => img.file),
          pmChamberMagneticContactImages: pmChamberMagneticContactImages.some(img => img.file),
          pmRTUCabinetCoolingImages: pmRTUCabinetCoolingImages.some(img => img.file),
          pmDVREquipmentImages: pmDVREquipmentImages.some(img => img.file)
        }
      }
    };
    
    // Navigate to review page with form data
    navigate(`/report-management-system/rtu-pm-report-review-edit/${id}`, {
      state: { formData: reviewData }
    });
  };

  const handleCancel = () => {
    navigate(`/report-management-system/rtu-pm-report-details/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ padding: 3, maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header with JobNo in top right corner */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#2C3E50', 
                fontWeight: 'bold' 
              }}
            >
              Edit RTU PM Report
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
                variant="body1" 
                sx={{ 
                  color: '#FF0000',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  display: 'inline',
                  marginLeft: '4px'
                }}
              >
                {formData.jobNo || 'Not assigned'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ marginBottom: 2 }}>
            Report updated successfully! Redirecting...
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        {/* Basic Information Section */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography 
            variant="h5" 
            sx={{
              color: '#2C3E50',
              fontWeight: 'bold',
              marginBottom: 3
            }}
          >
            Basic Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* System Description */}
            <TextField
              fullWidth
              select
              label="System Description"
              value={formData.systemNameWarehouseID || ''}
              onChange={(e) => handleSystemChange(e.target.value)}
              required
              variant="outlined"
              error={!!fieldErrors.systemDescription}
              helperText={fieldErrors.systemDescription}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '& fieldset': {
                    borderColor: fieldErrors.systemDescription ? '#E74C3C' : '#d0d0d0',
                  },
                  '&:hover fieldset': {
                    borderColor: fieldErrors.systemDescription ? '#E74C3C' : '#2C3E50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: fieldErrors.systemDescription ? '#E74C3C' : '#2C3E50',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#666666',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#2C3E50',
                },
                '& .MuiSelect-select': {
                  color: '#2C3E50',
                },
                '& .MuiFormHelperText-root': {
                  color: '#E74C3C',
                },
              }}
            >
              {systemNames.map((system) => (
                <MenuItem 
                  key={system.id} 
                  value={system.id}
                  sx={{
                    color: '#2C3E50',
                    backgroundColor: 'white',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  {system.name}
                </MenuItem>
              ))}
            </TextField>
            
            {/* Station Name */}
            <Autocomplete
              fullWidth
              options={stationNames}
              getOptionLabel={(option) => option.name || ''}
              value={stationNames.find(station => station.id === formData.stationNameWarehouseID) || null}
              onChange={(event, newValue) => {
                handleStationChange(newValue ? newValue.id : '');
              }}
              disabled={!formData.systemNameWarehouseID}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Station Name"
                  required
                  variant="outlined"
                  error={!!fieldErrors.stationName}
                  helperText={fieldErrors.stationName}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      minHeight: '40px',
                      '& fieldset': {
                        borderColor: fieldErrors.stationName ? '#E74C3C' : '#d0d0d0',
                      },
                      '&:hover fieldset': {
                        borderColor: fieldErrors.stationName ? '#E74C3C' : '#2C3E50',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: fieldErrors.stationName ? '#E74C3C' : '#2C3E50',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666666',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#2C3E50',
                    },
                    '& .MuiAutocomplete-input': {
                      color: '#2C3E50',
                      fontSize: '14px',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#E74C3C',
                    },
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  key={option.id}
                  sx={{
                    color: '#2C3E50',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    padding: '8px 12px',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    },
                    '&[aria-selected="true"]': {
                      backgroundColor: '#e3f2fd'
                    }
                  }}
                >
                  {option.name}
                </Box>
              )}
              ListboxProps={{
                sx: {
                  maxHeight: '200px',
                  '& .MuiAutocomplete-option': {
                    minHeight: '36px',
                  }
                }
              }}
              size="small"
              noOptionsText="No stations available"
              loadingText="Loading stations..."
            />
            
            {/* Project No */}
            <TextField
              fullWidth
              label="Project No"
              value={formData.projectNo}
              onChange={(e) => handleInputChange('projectNo', e.target.value)}
              required
              variant="outlined"
              error={!!fieldErrors.projectNo}
              helperText={fieldErrors.projectNo}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '& fieldset': {
                    borderColor: fieldErrors.projectNo ? '#E74C3C' : '#d0d0d0',
                  },
                  '&:hover fieldset': {
                    borderColor: fieldErrors.projectNo ? '#E74C3C' : '#2C3E50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: fieldErrors.projectNo ? '#E74C3C' : '#2C3E50',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#666666',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#2C3E50',
                },
                '& .MuiOutlinedInput-input': {
                  color: '#2C3E50',
                },
                '& .MuiFormHelperText-root': {
                  color: '#E74C3C',
                },
              }}
            />
            
            {/* Customer */}
            <TextField
              fullWidth
              label="Customer"
              value={formData.customer}
              onChange={(e) => handleInputChange('customer', e.target.value)}
              required
              variant="outlined"
              error={!!fieldErrors.customer}
              helperText={fieldErrors.customer}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '& fieldset': {
                    borderColor: fieldErrors.customer ? '#E74C3C' : '#d0d0d0',
                  },
                  '&:hover fieldset': {
                    borderColor: fieldErrors.customer ? '#E74C3C' : '#2C3E50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: fieldErrors.customer ? '#E74C3C' : '#2C3E50',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#666666',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#2C3E50',
                },
                '& .MuiOutlinedInput-input': {
                  color: '#2C3E50',
                },
                '& .MuiFormHelperText-root': {
                  color: '#E74C3C',
                },
              }}
            />
            
            {/* Type of Services - Read Only */}
            <TextField
              fullWidth
              select
              label="Type of Services"
              value={formData.reportFormTypeID || ''}
              required
              variant="outlined"
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  '& fieldset': {
                    borderColor: '#d0d0d0',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#666666',
                },
                '& .MuiSelect-select': {
                  color: '#666666',
                },
              }}
            >
              {reportFormTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Conditional PM Report Form Type Dropdown */}
            {showPMTypeDropdown && (
              <TextField
                fullWidth
                select
                disabled
                label="PM Report Form Type"
                value={formData.pmReportFormTypeID || ''}
                onChange={(e) => handleInputChange('pmReportFormTypeID', e.target.value)}
                required
                variant="outlined"
                error={!!fieldErrors.pmReportFormType}
                helperText={fieldErrors.pmReportFormType}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    minHeight: '40px',
                    '& fieldset': {
                      borderColor: fieldErrors.pmReportFormType ? '#E74C3C' : '#d0d0d0',
                    },
                    '&:hover fieldset': {
                      borderColor: fieldErrors.pmReportFormType ? '#E74C3C' : '#2C3E50',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: fieldErrors.pmReportFormType ? '#E74C3C' : '#2C3E50',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#666666',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#2C3E50',
                  },
                  '& .MuiSelect-select': {
                    color: '#2C3E50',
                    fontSize: '14px',
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#E74C3C',
                  },
                }}
              >
                {pmReportFormTypes.map((pmType) => (
                  <MenuItem 
                    key={pmType.id} 
                    value={pmType.id}
                    sx={{
                      color: '#2C3E50',
                      backgroundColor: 'white',
                      fontSize: '14px',
                      '&:hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    {pmType.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

          </Box>
        </Paper>
        
        {/* Date of Service Section */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography 
            variant="h5" 
            sx={{
              color: '#2C3E50',
              fontWeight: 'bold',
              marginBottom: 3,
              paddingBottom: 1,
              borderBottom: '2px solid #3498DB'
            }}
          >
            📅 Date of Service
          </Typography>
          
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
                required
                error={!!fieldErrors.dateOfService}
                helperText={fieldErrors.dateOfService}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: fieldErrors.dateOfService ? '#E74C3C' : '#d0d0d0',
                    },
                    '&:hover fieldset': {
                      borderColor: fieldErrors.dateOfService ? '#E74C3C' : '#3498DB',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: fieldErrors.dateOfService ? '#E74C3C' : '#3498DB',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#666666',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#3498DB',
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#2C3E50',
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#E74C3C',
                  },
                }}
              />
            )}
          />
        </Paper>

        {/* Main RTU Cabinet Section */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold', marginBottom: 2 }}>
            <BuildIcon sx={{ marginRight: 1, verticalAlign: 'middle' }} />
            Main RTU Cabinet
          </Typography>
          
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleAddRow('mainRTU')}
            variant="contained"
            sx={{
              background: RMSTheme.components.button.primary.background,
              color: RMSTheme.components.button.primary.text,
              padding: '8px 24px',
              borderRadius: RMSTheme.borderRadius.small,
              border: `1px solid ${RMSTheme.components.button.primary.border}`,
              boxShadow: RMSTheme.components.button.primary.shadow,
              marginBottom: 2,
              marginRight: 2,
              '&:hover': {
                background: RMSTheme.components.button.primary.hover
              }
            }}
          >
            Add Row
          </Button>

          <Button
            onClick={handleApplySelectedRow}
            disabled={selectedRowIndex === null || mainRTUCabinetData.length === 0}
            variant="contained"
            sx={{
              background: '#2ECC71',
              color: '#FFFFFF',
              marginBottom: 2,
              '&:hover': {
                background: '#27AE60'
              },
              '&:disabled': {
                background: '#cccccc',
                color: '#666666'
              }
            }}
          >
            Apply Selected Row to All
          </Button>

          <MultipleImageUploadField
            images={pmMainRtuCabinetImages}
            onImagesChange={setPmMainRtuCabinetImages}
            label="Main RTU Cabinet Images"
          />

          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Select</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>RTU Cabinet</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Equipment Rack</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Monitor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mouse & Keyboard</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>CPU 6000 Card</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Input Card</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Megapop NTU</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Network Router</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Network Switch</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Digital Video Recorder</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>RTU Door Contact</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Power Supply Unit</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>UPS Battery</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mainRTUCabinetData.map((row, index) => (
                  <TableRow 
                    key={index}
                    sx={{
                      backgroundColor: row.isDeleted ? '#ffebee' : (selectedRowIndex === index ? '#e3f2fd' : 'inherit'),
                      opacity: row.isDeleted ? 0.6 : 1,
                      textDecoration: row.isDeleted ? 'line-through' : 'none'
                    }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedRowIndex === index}
                        onChange={() => handleRowSelection(index)}
                        disabled={row.isDeleted}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.rtuCabinet || ''}
                        onChange={(e) => handleTableCellChange('mainRTU', index, 'rtuCabinet', e.target.value)}
                        size="small"
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.equipmentRack || ''}
                        onChange={(e) => handleTableCellChange('mainRTU', index, 'equipmentRack', e.target.value)}
                        size="small"
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.monitor || ''}
                        onChange={(e) => handleTableCellChange('mainRTU', index, 'monitor', e.target.value)}
                        size="small"
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.mouseKeyboard || ''}
                        onChange={(e) => handleTableCellChange('mainRTU', index, 'mouseKeyboard', e.target.value)}
                        size="small"
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.cpU6000Card || ''}
                        onChange={(e) => handleTableCellChange('mainRTU', index, 'cpU6000Card', e.target.value)}
                        size="small"
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.inputCard || ''}
                        onChange={(e) => handleTableCellChange('mainRTU', index, 'inputCard', e.target.value)}
                        size="small"
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.megapopNTU || ''}
                        onChange={(e) => handleTableCellChange('mainRTU', index, 'megapopNTU', e.target.value)}
                        size="small"
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.networkRouter || ''}
                        onChange={(e) => handleTableCellChange('mainRTU', index, 'networkRouter', e.target.value)}
                        size="small"
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.networkSwitch || ''}
                        onChange={(e) => handleTableCellChange('mainRTU', index, 'networkSwitch', e.target.value)}
                        size="small"
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.digitalVideoRecorder || ''}
                        onChange={(e) => handleTableCellChange('mainRTU', index, 'digitalVideoRecorder', e.target.value)}
                        size="small"
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.rtuDoorContact || ''}
                        onChange={(e) => handleTableCellChange('mainRTU', index, 'rtuDoorContact', e.target.value)}
                        size="small"
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.powerSupplyUnit || ''}
                        onChange={(e) => handleTableCellChange('mainRTU', index, 'powerSupplyUnit', e.target.value)}
                        size="small"
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.upsBattery || ''}
                        onChange={(e) => handleTableCellChange('mainRTU', index, 'upsBattery', e.target.value)}
                        size="small"
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={row.remarks || ''}
                        onChange={(e) => handleTableCellChange('mainRTU', index, 'remarks', e.target.value)}
                        size="small"
                        multiline
                        rows={2}
                      />
                    </TableCell>
                    <TableCell>
                      {row.isDeleted ? (
                        <IconButton
                          onClick={() => handleRestoreRow('mainRTU', index)}
                          color="success"
                          size="small"
                          title="Restore row"
                        >
                          <RestoreIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          onClick={() => handleRemoveRow('mainRTU', index)}
                          color="error"
                          size="small"
                          title="Mark for deletion"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* PM Chamber Magnetic Contact Section */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold', marginBottom: 2 }}>
            <SettingsIcon sx={{ marginRight: 1, verticalAlign: 'middle' }} />
            PM Chamber Magnetic Contact
          </Typography>
          
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleAddRow('chamber')}
            variant="contained"
            sx={{
              background: RMSTheme.components.button.primary.background,
              color: RMSTheme.components.button.primary.text,
              padding: '8px 24px',
              borderRadius: RMSTheme.borderRadius.small,
              border: `1px solid ${RMSTheme.components.button.primary.border}`,
              boxShadow: RMSTheme.components.button.primary.shadow,
              marginBottom: 2,
              marginRight: 2,
              '&:hover': {
                background: RMSTheme.components.button.primary.hover
              }
            }}
          >
            Add Row
          </Button>

          <Button
            onClick={handleApplySelectedChamberRow}
            disabled={selectedChamberRowIndex === null || pmChamberMagneticContactData.length === 0}
            variant="contained"
            sx={{
              background: '#2ECC71',
              color: '#FFFFFF',
              marginBottom: 2,
              '&:hover': {
                background: '#27AE60'
              },
              '&:disabled': {
                background: '#cccccc',
                color: '#666666'
              }
            }}
          >
            Apply Selected Row to All
          </Button>

          <MultipleImageUploadField
            images={pmChamberMagneticContactImages}
            onImagesChange={setPmChamberMagneticContactImages}
            label="PM Chamber Magnetic Contact Images"
          />

          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Select</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Chamber Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Chamber OG Box</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Chamber Contact 1</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Chamber Contact 2</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Chamber Contact 3</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pmChamberMagneticContactData.map((row, index) => (
                  <TableRow 
                    key={index}
                    sx={{
                      backgroundColor: row.isDeleted ? '#ffebee' : (selectedChamberRowIndex === index ? '#e3f2fd' : 'inherit'),
                      opacity: row.isDeleted ? 0.6 : 1,
                      textDecoration: row.isDeleted ? 'line-through' : 'none'
                    }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedChamberRowIndex === index}
                        onChange={() => handleChamberRowSelection(index)}
                        disabled={row.isDeleted}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={row.chamberNumber}
                        onChange={(e) => handleTableCellChange('chamber', index, 'chamberNumber', e.target.value)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.chamberOGBox || ''}
                        onChange={(e) => handleTableCellChange('chamber', index, 'chamberOGBox', e.target.value)}
                        size="small"
                      >
                        {functionalStatusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.chamberContact1 || ''}
                        onChange={(e) => handleTableCellChange('chamber', index, 'chamberContact1', e.target.value)}
                        size="small"
                      >
                        {functionalStatusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.chamberContact2 || ''}
                        onChange={(e) => handleTableCellChange('chamber', index, 'chamberContact2', e.target.value)}
                        size="small"
                      >
                        {functionalStatusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.chamberContact3 || ''}
                        onChange={(e) => handleTableCellChange('chamber', index, 'chamberContact3', e.target.value)}
                        size="small"
                      >
                        {functionalStatusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={row.remarks}
                        onChange={(e) => handleTableCellChange('chamber', index, 'remarks', e.target.value)}
                        size="small"
                        multiline
                        rows={2}
                      />
                    </TableCell>
                    <TableCell>
                      {row.isDeleted ? (
                        <IconButton
                          onClick={() => handleRestoreRow('chamber', index)}
                          color="success"
                          size="small"
                          title="Restore row"
                        >
                          <RestoreIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          onClick={() => handleRemoveRow('chamber', index)}
                          color="error"
                          size="small"
                          title="Mark for deletion"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* PM RTU Cabinet Cooling Section */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold', marginBottom: 2 }}>
            <SettingsIcon sx={{ marginRight: 1, verticalAlign: 'middle' }} />
            PM RTU Cabinet Cooling
          </Typography>
          
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleAddRow('cooling')}
            variant="contained"
            sx={{
              background: RMSTheme.components.button.primary.background,
              color: RMSTheme.components.button.primary.text,
              padding: '8px 24px',
              borderRadius: RMSTheme.borderRadius.small,
              border: `1px solid ${RMSTheme.components.button.primary.border}`,
              boxShadow: RMSTheme.components.button.primary.shadow,
              marginBottom: 2,
              marginRight: 2,
              '&:hover': {
                background: RMSTheme.components.button.primary.hover
              }
            }}
          >
            Add Row
          </Button>

          <Button
            onClick={handleApplySelectedCoolingRow}
            disabled={selectedCoolingRowIndex === null || pmRTUCabinetCoolingData.length === 0}
            variant="contained"
            sx={{
              background: '#2ECC71',
              color: '#FFFFFF',
              marginBottom: 2,
              '&:hover': {
                background: '#27AE60'
              },
              '&:disabled': {
                background: '#cccccc',
                color: '#666666'
              }
            }}
          >
            Apply Selected Row to All
          </Button>

          <MultipleImageUploadField
            images={pmRTUCabinetCoolingImages}
            onImagesChange={setPmRTUCabinetCoolingImages}
            label="PM RTU Cabinet Cooling Images"
          />

          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Select</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fan Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Functional Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pmRTUCabinetCoolingData.map((row, index) => (
                  <TableRow 
                    key={index}
                    sx={{
                      backgroundColor: row.isDeleted ? '#ffebee' : (selectedCoolingRowIndex === index ? '#e3f2fd' : 'inherit'),
                      opacity: row.isDeleted ? 0.6 : 1,
                      textDecoration: row.isDeleted ? 'line-through' : 'none'
                    }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedCoolingRowIndex === index}
                        onChange={() => handleCoolingRowSelection(index)}
                        disabled={row.isDeleted}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={row.fanNumber}
                        onChange={(e) => handleTableCellChange('cooling', index, 'fanNumber', e.target.value)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.functionalStatus || ''}
                        onChange={(e) => handleTableCellChange('cooling', index, 'functionalStatus', e.target.value)}
                        size="small"
                      >
                        {coolingStatusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={row.remarks}
                        onChange={(e) => handleTableCellChange('cooling', index, 'remarks', e.target.value)}
                        size="small"
                        multiline
                        rows={2}
                      />
                    </TableCell>
                    <TableCell>
                      {row.isDeleted ? (
                        <IconButton
                          onClick={() => handleRestoreRow('cooling', index)}
                          color="success"
                          size="small"
                          title="Restore row"
                        >
                          <RestoreIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          onClick={() => handleRemoveRow('cooling', index)}
                          color="error"
                          size="small"
                          title="Mark for deletion"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* PM DVR Equipment Section */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold', marginBottom: 2 }}>
            <VideocamIcon sx={{ marginRight: 1, verticalAlign: 'middle' }} />
            PM DVR Equipment
          </Typography>
          
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleAddRow('dvr')}
            variant="contained"
            sx={{
              background: RMSTheme.components.button.primary.background,
              color: RMSTheme.components.button.primary.text,
              padding: '8px 24px',
              borderRadius: RMSTheme.borderRadius.small,
              border: `1px solid ${RMSTheme.components.button.primary.border}`,
              boxShadow: RMSTheme.components.button.primary.shadow,
              marginBottom: 2,
              marginRight: 2,
              '&:hover': {
                background: RMSTheme.components.button.primary.hover
              }
            }}
          >
            Add Row
          </Button>

          <Button
            onClick={handleApplySelectedDVRRow}
            disabled={selectedDVRRowIndex === null || pmDVREquipmentData.length === 0}
            variant="contained"
            sx={{
              background: '#2ECC71',
              color: '#FFFFFF',
              marginBottom: 2,
              '&:hover': {
                background: '#27AE60'
              },
              '&:disabled': {
                background: '#cccccc',
                color: '#666666'
              }
            }}
          >
            Apply Selected Row to All
          </Button>

          <MultipleImageUploadField
            images={pmDVREquipmentImages}
            onImagesChange={setPmDVREquipmentImages}
            label="PM DVR Equipment Images"
          />

          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Select</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>DVR Comm</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>DVR RAID Comm</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Time Sync NTP Server</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Recording 24x7</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pmDVREquipmentData.map((row, index) => (
                  <TableRow 
                    key={index}
                    sx={{
                      backgroundColor: row.isDeleted ? '#ffebee' : (selectedDVRRowIndex === index ? '#e3f2fd' : 'inherit'),
                      opacity: row.isDeleted ? 0.6 : 1,
                      textDecoration: row.isDeleted ? 'line-through' : 'none'
                    }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedDVRRowIndex === index}
                        onChange={() => handleDVRRowSelection(index)}
                        disabled={row.isDeleted}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.dvrComm || ''}
                        onChange={(e) => handleTableCellChange('dvr', index, 'dvrComm', e.target.value)}
                        size="small"
                      >
                        {dvrStatusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.dvrraidComm || ''}
                        onChange={(e) => handleTableCellChange('dvr', index, 'dvrraidComm', e.target.value)}
                        size="small"
                      >
                        {dvrStatusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.timeSyncNTPServer || ''}
                        onChange={(e) => handleTableCellChange('dvr', index, 'timeSyncNTPServer', e.target.value)}
                        size="small"
                      >
                        {dvrStatusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={row.recording24x7 || ''}
                        onChange={(e) => handleTableCellChange('dvr', index, 'recording24x7', e.target.value)}
                        size="small"
                      >
                        {dvrStatusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={row.remarks}
                        onChange={(e) => handleTableCellChange('dvr', index, 'remarks', e.target.value)}
                        size="small"
                        multiline
                        rows={2}
                      />
                    </TableCell>
                    <TableCell>
                      {row.isDeleted ? (
                        <IconButton
                          onClick={() => handleRestoreRow('dvr', index)}
                          color="success"
                          size="small"
                          title="Restore row"
                        >
                          <RestoreIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          onClick={() => handleRemoveRow('dvr', index)}
                          color="error"
                          size="small"
                          title="Mark for deletion"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Footer Sections */}
        {/* Cleaning of Cabinet / Equipment Section */}
        <Paper sx={{ 
          padding: 3, 
          margin: '16px 0',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              marginBottom: 2,
              color: '#ff6b35',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            🧹 Cleaning of Cabinet / Equipment
          </Typography>
          <TextField
            select
            fullWidth
            label="Select Cleaning Status"
            value={formData.cleaningOfCabinet || ''}
            onChange={(e) => setFormData({ ...formData, cleaningOfCabinet: e.target.value })}
            sx={{
              backgroundColor: 'white',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          >
            <MenuItem value="DONE">✅ DONE</MenuItem>
            <MenuItem value="PENDING">⏳ PENDING</MenuItem>
          </TextField>
        </Paper>

        {/* Remarks Section */}
        <Paper sx={{ 
          padding: 3, 
          margin: '16px 0',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              marginBottom: 2,
              color: '#ff6b35',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            📝 Remarks
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Remarks"
            value={formData.remarks || ''}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            sx={{
              backgroundColor: 'white',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          />
        </Paper>

        {/* Approval Information Section */}
        <Paper sx={{ 
          padding: 3, 
          margin: '16px 0',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              marginBottom: 2,
              color: '#28a745',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            ✅ Approval Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Attended By"
                placeholder="Attended By"
                value={formData.attendedBy || ''}
                onChange={(e) => setFormData({ ...formData, attendedBy: e.target.value })}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Approved By"
                placeholder="Approved By"
                value={formData.approvedBy || ''}
                onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Action Buttons Footer */}
        <Paper sx={{ 
          padding: 3,
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          position: 'sticky',
          bottom: 0,
          zIndex: 1000
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Back Button */}
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/report-management')}
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

            {/* Right side buttons */}
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saving}
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
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Review →'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default RTUPMReportFormEdit;