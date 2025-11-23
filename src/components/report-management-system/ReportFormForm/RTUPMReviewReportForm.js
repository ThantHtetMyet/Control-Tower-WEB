import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  Videocam as VideocamIcon,
  RemoveCircle as RemoveCircleIcon,
  AccessTime
} from '@mui/icons-material';
import { format } from 'date-fns';
import RMSTheme from '../../theme-resource/RMSTheme';

// Styling constants
const sectionContainer = {
  marginBottom: 4,
  padding: 3,
  border: '1px solid #e0e0e0',
  borderRadius: 2,
  backgroundColor: '#fafafa'
};

const sectionHeader = {
  color: '#1976d2',
  fontWeight: 'bold',
  marginBottom: 2,
  paddingBottom: 1,
  borderBottom: '2px solid #1976d2'
};

const fieldContainer = {
  marginBottom: 2,
  padding: 2,
  backgroundColor: 'white',
  borderRadius: 1,
  border: '1px solid #e0e0e0'
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  } catch (error) {
    return 'Invalid date';
  }
};

// Updated getStatusChip function with proper color coding
const getStatusChip = (status) => {
  if (!status || status === '') {
    return (
      <Chip
        label="Not specified"
        color="default"
        variant="outlined"
        size="small"
      />
    );
  }
  
  const statusStr = status.toString();
  
  if (statusStr === 'Acceptable') {
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label={statusStr}
        color="success"
        variant="filled"
        size="small"
      />
    );
  } else if (statusStr === 'DONE') {
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label={statusStr}
        color="success"
        variant="filled"
        size="small"
        sx={{ backgroundColor: '#4caf50', color: 'white' }}
      />
    );
  } else if (statusStr === 'NonAcceptable') {
    return (
      <Chip
        icon={<CancelIcon />}
        label={statusStr}
        color="error"
        variant="filled"
        size="small"
      />
    );
  } else if (statusStr === 'PASS') {
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label={statusStr}
        color="success"
        variant="filled"
        size="small"
      />
    );
  } else if (statusStr === 'FAIL') {
    return (
      <Chip
        icon={<CancelIcon />}
        label={statusStr}
        color="error"
        variant="filled"
        size="small"
      />
    );
  } else if (statusStr === 'PENDING') {
    return (
      <Chip
        icon={<AccessTime />}
        label={statusStr}
        color="info"
        variant="filled"
        size="small"
      />
    );
  } else if (statusStr === 'NA') {
    return (
      <Chip
        icon={<RemoveCircleIcon />}
        label={statusStr}
        color="warning"
        variant="filled"
        size="small"
      />
    );
  } else {
    return (
      <Chip
        label={statusStr}
        color="default"
        variant="outlined"
        size="small"
      />
    );
  }
};

// Image preview component
const ImagePreviewSection = ({ images, title, icon: IconComponent = BuildIcon }) => {
  if (!images || images.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <IconComponent sx={{ fontSize: 48, color: '#bdc3c7', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          No {title.toLowerCase()} uploaded
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ marginTop: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
        {title} ({images.length})
      </Typography>
      <Grid container spacing={2}>
        {images.map((image, index) => {
          const imageUrl = image instanceof File ? URL.createObjectURL(image) : 
                          (typeof image === 'string' ? image : image.url || image.preview);
          
          return (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card sx={{ position: 'relative' }}>
                <img
                  src={imageUrl}
                  alt={`${title} ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  {index + 1}
                </Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

const RTUPMReviewReportForm = ({ 
  formData, 
  reportFormTypes, 
  formStatusOptions = [],
  onNext, 
  onBack, 
  loading, 
  error,
  rtuPMData = {} 
}) => {
  const reportType = reportFormTypes?.find(type => type.id === formData.reportFormTypeID);
  const formStatusDisplay = (() => {
    const match = (formStatusOptions || []).find((s) => (s.id || s.ID) === formData.formstatusID);
    if (match) return match.name || match.Name;
    return formData.formStatusName || formData.formstatusName || formData.formstatusID || 'Not specified';
  })();

  const handleSubmit = () => {
    onNext();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ marginBottom: 3, color: '#1976d2', fontWeight: 'bold' }}>
        {formData.reportTitle ? `${formData.reportTitle} - Review` : 'RTU Preventive Maintenance Report - Review'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginBottom: 3 }}>
          {error}
        </Alert>
      )}

      {/* Basic Information Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          Basic Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Job Number</Typography>
              <Typography variant="body1">{formData.jobNo || 'Not assigned'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>System Description</Typography>
              <Typography variant="body1">{formData.systemDescription || 'Not specified'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Station Name</Typography>
              <Typography variant="body1">{formData.stationName || 'Not specified'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Project No</Typography>
              <Typography variant="body1">{formData.projectNo || 'Not specified'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Customer</Typography>
              <Typography variant="body1">{formData.customer || 'Not specified'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Report Form Type</Typography>
              <Typography variant="body1">{reportType?.name || 'Not specified'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>PM Report Form Type</Typography>
              <Typography variant="body1">{formData.pmReportFormTypeName || 'Not specified'}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Date of Service Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          📅 Date of Service
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Service Date & Time</Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', color: '#1976d2', fontWeight: 'medium' }}>
                {formatDate(formData.dateOfService)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Main RTU Cabinet Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          <BuildIcon sx={{ marginRight: 1, verticalAlign: 'middle' }} />
          Main RTU Cabinet
        </Typography>
        
        <ImagePreviewSection 
          images={rtuPMData.pmMainRtuCabinetImages || []} 
          title="Main RTU Cabinet Images" 
          icon={BuildIcon}
        />
        
        {rtuPMData.mainRTUCabinetData && rtuPMData.mainRTUCabinetData.length > 0 ? (
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table size="small">
                <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
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
                    <TableCell sx={{ fontWeight: 'bold' }}>UPS Taking Over Test</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>UPS Battery</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {rtuPMData.mainRTUCabinetData.map((row, index) => (
                    <TableRow key={index}>
                    <TableCell>{getStatusChip(row.RTUCabinet)}</TableCell>
                    <TableCell>{getStatusChip(row.EquipmentRack)}</TableCell>
                    <TableCell>{getStatusChip(row.Monitor)}</TableCell>
                    <TableCell>{getStatusChip(row.MouseKeyboard)}</TableCell>
                    <TableCell>{getStatusChip(row.CPU6000Card)}</TableCell>
                    <TableCell>{getStatusChip(row.InputCard)}</TableCell>
                    <TableCell>{getStatusChip(row.MegapopNTU)}</TableCell>
                    <TableCell>{getStatusChip(row.NetworkRouter)}</TableCell>
                    <TableCell>{getStatusChip(row.NetworkSwitch)}</TableCell>
                    <TableCell>{getStatusChip(row.DigitalVideoRecorder)}</TableCell>
                    <TableCell>{getStatusChip(row.RTUDoorContact)}</TableCell>
                    <TableCell>{getStatusChip(row.PowerSupplyUnit)}</TableCell>
                    <TableCell>{getStatusChip(row.UPSTakingOverTest)}</TableCell>
                    <TableCell>{getStatusChip(row.UPSBattery)}</TableCell>
                    <TableCell>{row.Remarks || '-'}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No Main RTU Cabinet data available
          </Typography>
        )}
      </Paper>

      {/* PM Chamber Magnetic Contact Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          PM Chamber Magnetic Contact
        </Typography>
        
        <ImagePreviewSection 
          images={rtuPMData.pmChamberMagneticContactImages || []} 
          title="PM Chamber Magnetic Contact Images" 
          icon={SettingsIcon}
        />
        
        {rtuPMData.pmChamberMagneticContactData && rtuPMData.pmChamberMagneticContactData.length > 0 ? (
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Chamber Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Chamber OG Box</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Chamber Contact 1</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Chamber Contact 2</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Chamber Contact 3</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rtuPMData.pmChamberMagneticContactData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.ChamberNumber || '-'}</TableCell>
                    <TableCell>{getStatusChip(row.ChamberOGBox)}</TableCell>
                    <TableCell>{getStatusChip(row.ChamberContact1)}</TableCell>
                    <TableCell>{getStatusChip(row.ChamberContact2)}</TableCell>
                    <TableCell>{getStatusChip(row.ChamberContact3)}</TableCell>
                    <TableCell>{row.Remarks || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No PM Chamber Magnetic Contact data available
          </Typography>
        )}
      </Paper>

      {/* PM RTU Cabinet Cooling Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          PM RTU Cabinet Cooling
        </Typography>
        
        <ImagePreviewSection 
          images={rtuPMData.pmRTUCabinetCoolingImages || []} 
          title="PM RTU Cabinet Cooling Images" 
          icon={SettingsIcon}
        />
        
        {rtuPMData.pmRTUCabinetCoolingData && rtuPMData.pmRTUCabinetCoolingData.length > 0 ? (
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fan Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Functional Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rtuPMData.pmRTUCabinetCoolingData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.FanNumber || '-'}</TableCell>
                    <TableCell>{getStatusChip(row.FunctionalStatus)}</TableCell>
                    <TableCell>{row.Remarks || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No PM RTU Cabinet Cooling data available
          </Typography>
        )}
      </Paper>

      {/* PM DVR Equipment Section */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          PM DVR Equipment
        </Typography>
        
        <ImagePreviewSection 
          images={rtuPMData.pmDVREquipmentImages || []} 
          title="PM DVR Equipment Images" 
          icon={VideocamIcon}
        />
        
        {rtuPMData.pmDVREquipmentData && rtuPMData.pmDVREquipmentData.length > 0 ? (
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>DVR Comm</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>DVR RAID Comm</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Time Sync NTP Server</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Recording 24x7</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rtuPMData.pmDVREquipmentData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{getStatusChip(row.DVRComm)}</TableCell>
                    <TableCell>{getStatusChip(row.DVRRAIDComm)}</TableCell>
                    <TableCell>{getStatusChip(row.TimeSyncNTPServer)}</TableCell>
                    <TableCell>{getStatusChip(row.Recording24x7)}</TableCell>
                    <TableCell>{row.Remarks || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No PM DVR Equipment data available
          </Typography>
        )}
      </Paper>

      {/* Service Details Section - Moved to Bottom */}
      <Paper sx={sectionContainer}>
        <Typography variant="h5" sx={sectionHeader}>
          Service Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Form Status</Typography>
              <Typography variant="body1">{formStatusDisplay}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Cleaning of Cabinet</Typography>
              <Typography variant="body1">{getStatusChip(formData.cleaningStatus)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Remarks</Typography>
              <Typography variant="body1">{formData.remarks || 'No remarks'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Approved By</Typography>
              <Typography variant="body1">{formData.approvedBy || 'Not specified'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={fieldContainer}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Attended By</Typography>
              <Typography variant="body1">{formData.attendedBy || 'Not specified'}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Action Buttons - Updated to match RTUPMReportForm styling */}
      <Paper sx={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)'
        },
        background: '#ffffff',
        marginBottom: 0
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={onBack}
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
            ← Back
          </Button>
          
          <Button
            variant="contained"
            onClick={handleSubmit}
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
            Submit Report →
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RTUPMReviewReportForm;
