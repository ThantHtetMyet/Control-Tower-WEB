import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import staffCardBackground from '../resources/staff_card_background.png';
import { API_URL } from '../../config/apiConfig';

const API_BASE_URL = API_URL;

const EmployeeCard3D = ({ open, onClose, employee }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  if (!employee) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible'
        }
      }}
    >
      <DialogTitle sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.5)',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center' }}>
        <Box
          onClick={handleCardClick}
          sx={{
            width: 280,
            height: 440,
            perspective: '1000px',
            cursor: 'pointer'
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'relative',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front Side */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                borderRadius: '12px',
                backgroundImage: `url(${staffCardBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                overflow: 'hidden'
              }}
            >
              {/* WILLOWGLEN - Top Left */}
              <Typography
                variant="h6"
                sx={{
                  position: 'absolute',
                  top: '45px',
                  left: '20px',
                  color: '#D32F2F',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  letterSpacing: '1px',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                WILLOWGLEN
              </Typography>

              {/* Employee Photo - Center Top */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '90px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100px',
                  height: '120px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Avatar
                  src={employee.photo_url}
                  sx={{
                    width: 90,
                    height: 110,
                    borderRadius: '8px',
                    border: '2px solid #333'
                  }}
                >
                  {employee.first_name?.[0]}{employee.last_name?.[0]}
                </Avatar>
              </Box>

              {/* Employee Name - Center */}
              <Typography
                variant="h6"
                sx={{
                  position: 'absolute',
                  top: '230px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  textAlign: 'center',
                  width: '200px',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {employee.first_name?.toUpperCase()} {employee.last_name?.toUpperCase()}
              </Typography>

              {/* Employee ID - Center */}
              <Typography
                variant="h5"
                sx={{
                  position: 'absolute',
                  top: '270px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '24px',
                  textAlign: 'center',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {employee.employee_id}
              </Typography>

              {/* Return Information - Bottom */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '60px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  textAlign: 'center',
                  width: '220px'
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: '#000',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    mb: 0.5,
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  If found, please return to:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#000',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    mb: 0.3,
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  Willowglen Services Pte Ltd
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#000',
                    fontSize: '10px',
                    mb: 0.2,
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  103 Defu Lane 10, #05-01,
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#000',
                    fontSize: '10px',
                    mb: 0.2,
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  Singapore 539223
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#000',
                    fontSize: '10px',
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  Tel: (65) 6280 0437
                </Typography>
              </Box>
            </Box>

            {/* Back Side */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                borderRadius: '12px',
                backgroundImage: `url(${staffCardBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px'
              }}
            >
              {/* Back Side Content */}
              <Box
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '12px',
                  padding: '20px',
                  width: '100%',
                  maxWidth: '240px',
                  textAlign: 'center'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: '#333',
                    fontWeight: 'bold',
                    mb: 2,
                    fontSize: '14px'
                  }}
                >
                  Contact Information
                </Typography>

                {/* Email */}
                <Typography
                  variant="body2"
                  sx={{
                    color: '#666',
                    fontSize: '11px',
                    mb: 1,
                    wordBreak: 'break-word'
                  }}
                >
                  <strong>Email:</strong><br />
                  {employee.email}
                </Typography>

                {/* Phone */}
                {employee.phone_number && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666',
                      fontSize: '11px',
                      mb: 1
                    }}
                  >
                    <strong>Phone:</strong><br />
                    {employee.phone_number}
                  </Typography>
                )}

                {/* Position */}
                <Typography
                  variant="body2"
                  sx={{
                    color: '#666',
                    fontSize: '11px',
                    mb: 1
                  }}
                >
                  <strong>Position:</strong><br />
                  {employee.position}
                </Typography>

                {/* Department */}
                <Typography
                  variant="body2"
                  sx={{
                    color: '#666',
                    fontSize: '11px',
                    mb: 1
                  }}
                >
                  <strong>Department:</strong><br />
                  {employee.department}
                </Typography>

                {/* Emergency Contact */}
                {employee.emergency_contact_name && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#333',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        mb: 1
                      }}
                    >
                      Emergency Contact
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666',
                        fontSize: '10px',
                        mb: 0.5
                      }}
                    >
                      <strong>Name:</strong> {employee.emergency_contact_name}
                    </Typography>
                    {employee.emergency_contact_number && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#666',
                          fontSize: '10px',
                          mb: 0.5
                        }}
                      >
                        <strong>Phone:</strong> {employee.emergency_contact_number}
                      </Typography>
                    )}
                    {employee.emergency_relationship && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#666',
                          fontSize: '10px'
                        }}
                      >
                        <strong>Relationship:</strong> {employee.emergency_relationship}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeCard3D;