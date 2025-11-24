
import React, { useState } from 'react';
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  TextField,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  Videocam as VideocamIcon,
  RemoveCircle as RemoveCircleIcon,
  AccessTime,
  ArrowBackIosNew as ArrowBackIosNewIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  UploadFile as UploadFileIcon
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
  if (!dateString) return '';
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

  const [finalReportDialogOpen, setFinalReportDialogOpen] = useState(false);
  const [finalReportFile, setFinalReportFile] = useState(null);
  const [finalReportUploadError, setFinalReportUploadError] = useState('');
  const [finalReportUploading, setFinalReportUploading] = useState(false);

  const resolvedStatusName = (() => {
    const match = (formStatusOptions || []).find((s) => (s.id || s.ID) === formData.formstatusID);
    const fromMatch = match?.name || match?.Name || '';
    const fallback = formData.formStatusName || formData.formstatusName || '';
    return (fromMatch || fallback || '').trim().toLowerCase();
  })();

  const isStatusClose = () => resolvedStatusName === 'close';

  const handleFinalReportFileChange = (event) => {
    setFinalReportUploadError('');
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    setFinalReportFile(file);
  };

  const handleCloseFinalReportDialog = () => {
    if (finalReportUploading) return;
    setFinalReportDialogOpen(false);
    setFinalReportFile(null);
    setFinalReportUploadError('');
  };

  const handleUploadFinalReport = async () => {
    if (!finalReportFile) {
      setFinalReportUploadError('Please select a file to upload.');
      return;
    }

    setFinalReportUploading(true);
    setFinalReportUploadError('');
    try {
      const success = await onNext(finalReportFile);
      if (success === false) {
        setFinalReportUploadError('Failed to submit report. Please try again.');
        return;
      }
      setFinalReportDialogOpen(false);
      setFinalReportFile(null);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to submit report.';
      setFinalReportUploadError(message);
    } finally {
      setFinalReportUploading(false);
    }
  };

  const handleSubmit = () => {
    if (isStatusClose()) {
      setFinalReportUploadError('');
      setFinalReportDialogOpen(true);
    } else {
      onNext();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const fieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f5f5f5',
      '& fieldset': {
        borderColor: '#d0d0d0'
      }
    },
    '& .MuiInputBase-input.Mui-disabled': {
      color: '#333',
      WebkitTextFillColor: '#333'
    }
  };
  return (
    <>
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
          {/* Header Section */}
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
              {formData.reportTitle ? `${formData.reportTitle}` : ''}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                opacity: 0.95,
                fontSize: '16px',
                fontWeight: 400
              }}
            >
              Review the maintenance information below
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

          {/* Content Section */}
          <Box sx={{ padding: 3 }}>
            {error && (
              <Alert severity="error" sx={{ marginBottom: 3 }}>
                {error}
              </Alert>
            )}

        {/* Basic Information Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
            📋 Basic Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Job Number"
              value={formData.jobNo || ''}
              disabled
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="System Description"
              value={formData.systemDescription || ''}
              disabled
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="Station Name"
              value={formData.stationName || ''}
              disabled
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="Project No"
              value={formData.projectNo || ''}
              disabled
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="Customer"
              value={formData.customer || ''}
              disabled
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="Report Form Type"
              value={reportType?.name || ''}
              disabled
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="PM Report Form Type"
              value={formData.pmReportFormTypeName || ''}
              disabled
              sx={fieldStyle}
            />
          </Box>
        </Paper>

        {/* Form Status Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
            <AssignmentTurnedInIcon sx={{ marginRight: 1, verticalAlign: 'middle' }} />
            Form Status
          </Typography>
          <TextField
            fullWidth
            label="Form Status"
            value={formStatusDisplay || 'Not specified'}
            disabled
            sx={fieldStyle}
          />
        </Paper>

        {/* Date of Service Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
            📅 Date of Service
          </Typography>
          <TextField
            fullWidth
            label="Service Date & Time"
            value={formatDate(formData.dateOfService)}
            disabled
            sx={fieldStyle}
          />
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

        {/* Cleaning of Cabinet / Equipment Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
            Cleaning of Cabinet / Equipment
          </Typography>
          <TextField
            fullWidth
            label="Cleaning Status"
            value={formData.cleaningStatus || ''}
            disabled
            sx={fieldStyle}
          />
        </Paper>

        {/* Remarks Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
            Remarks
          </Typography>
          <TextField
            fullWidth
            label="Remarks"
            value={formData.remarks || ''}
            disabled
            multiline
            rows={3}
            sx={fieldStyle}
          />
        </Paper>

        {/* Approval Information Section */}
        <Paper sx={sectionContainer}>
          <Typography variant="h5" sx={sectionHeader}>
            Approval Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Attended By"
              value={formData.attendedBy || ''}
              disabled
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="Approved By"
              value={formData.approvedBy || ''}
              disabled
              sx={fieldStyle}
            />
          </Box>
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
              onClick={handleSubmit}
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
              Submit Report
            </Button>
          </Box>
        </Paper>

            {/* End of Content */}
          </Box>
        </Paper>
      </Box>

      <Dialog
        open={finalReportDialogOpen}
        onClose={handleCloseFinalReportDialog}
        fullWidth
        maxWidth="xs"
        TransitionComponent={Fade}
        transitionDuration={{ enter: 400, exit: 250 }}
        PaperProps={{
          sx: {
            minWidth: 320,
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'linear-gradient(180deg, rgba(28,35,57,0.95) 0%, rgba(9,14,28,0.95) 80%)',
            boxShadow: '0 25px 70px rgba(8,15,31,0.55)',
            overflow: 'hidden'
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)'
          }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            color: '#f8fafc',
            pb: 1
          }}
        >
          Upload Final Report
        </DialogTitle>
        <DialogContent
          sx={{
            py: 2,
            px: 4
          }}
        >
          <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: 'rgba(241,245,249,0.85)' }}>
            Please attach the completed final report before submitting.
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              width: '100%',
              py: 1.5,
              borderColor: 'rgba(226,232,240,0.5)',
              color: '#e2e8f0',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#cbd5f5',
                backgroundColor: 'rgba(148,163,184,0.15)'
              }
            }}
          >
            {finalReportFile ? finalReportFile.name : 'Select File'}
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={handleFinalReportFileChange}
            />
          </Button>
          {finalReportUploadError && (
            <Typography color="#fca5a5" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              {finalReportUploadError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: 4,
            pb: 3
          }}
        >
          <Button
            onClick={handleCloseFinalReportDialog}
            disabled={finalReportUploading}
            sx={{
              background: RMSTheme.components.button.primary.background,
              color: RMSTheme.components.button.primary.text,
              padding: '10px 28px',
              borderRadius: RMSTheme.borderRadius.small,
              border: `1px solid ${RMSTheme.components.button.primary.border}`,
              boxShadow: RMSTheme.components.button.primary.shadow,
              textTransform: 'none',
              mr: 2,
              '&:hover': { background: RMSTheme.components.button.primary.hover },
              '&:disabled': { opacity: 0.6 }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadFinalReport}
            disabled={finalReportUploading}
            sx={{
              background: RMSTheme.components.button.primary.background,
              color: RMSTheme.components.button.primary.text,
              padding: '10px 28px',
              borderRadius: RMSTheme.borderRadius.small,
              border: `1px solid ${RMSTheme.components.button.primary.border}`,
              boxShadow: RMSTheme.components.button.primary.shadow,
              textTransform: 'none',
              '&:hover': { background: RMSTheme.components.button.primary.hover },
              '&:disabled': { opacity: 0.6 }
            }}
          >
            {finalReportUploading ? 'Uploading...' : 'Upload & Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RTUPMReviewReportForm;
