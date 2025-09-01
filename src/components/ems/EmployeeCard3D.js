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
              {/* WILLOWGLEN - Top Center */}
              <Typography
                variant="h6"
                sx={{
                  position: 'absolute',
                  top: '25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: '#D32F2F',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  letterSpacing: '2px',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                WILLOWGLEN
              </Typography>

              {/* Employee Photo - Center Top */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '80px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '120px',
                  height: '140px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {employee.profileImageUrl ? (
                  <img
                    src={employee.profileImageUrl}
                    alt={`${employee.firstName} ${employee.lastName}`}
                    style={{
                      width: '110px',
                      height: '130px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #333'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 110,
                      height: 130,
                      borderRadius: '8px',
                      border: '2px solid #333',
                      fontSize: '2rem'
                    }}
                  >
                    {employee.firstName?.[0]}{employee.lastName?.[0]}
                  </Avatar>
                )}
              </Box>

              {/* Employee Name - Center */}
              <Typography
                variant="h6"
                sx={{
                  position: 'absolute',
                  top: '240px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  textAlign: 'center',
                  width: '240px',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {employee.firstName?.toUpperCase()} {employee.lastName?.toUpperCase()}
              </Typography>

              {/* Staff Card ID - Center */}
              <Typography
                variant="h5"
                sx={{
                  position: 'absolute',
                  top: '280px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '28px',
                  textAlign: 'center',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {employee.staffCardID || employee.id}
              </Typography>

              {/* Return Information - Bottom */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '5px', // Changed from '60px' to '15px' to move closer to bottom
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
                    fontSize: '9px', // Reduced from '11px' to '9px' for better fit
                    fontWeight: 'bold',
                    mb: 0.3, // Reduced margin
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  If found, please return to:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#000',
                    fontSize: '9px', // Reduced from '11px' to '9px'
                    fontWeight: 'bold',
                    mb: 0.2, // Reduced margin
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  Willowglen Services Pte Ltd
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#000',
                    fontSize: '8px', // Reduced from '10px' to '8px'
                    mb: 0.1, // Reduced margin
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  103 Defu Lane 10, #05-01,
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#000',
                    fontSize: '8px', // Reduced from '10px' to '8px'
                    mb: 0.1, // Reduced margin
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  Singapore 539223
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#000',
                    fontSize: '8px', // Reduced from '10px' to '8px'
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
                position: 'relative', // Changed to relative for absolute positioning of RFID
                padding: '20px'
              }}
            >
              {/* RFID Card Number - Top Right Position */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  zIndex: 10
                }}
              >
                {/* Digital RFID Number Display */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1px',
                    padding: '8px 6px',
                    borderRadius: '6px',
                  }}
                >
                  
                  {/* Vertical RFID Digits - Rotated 90 degrees for east side reading */}
                  {(employee.staffRFIDCardID || '0000000000').split('').reverse().map((digit, index) => (
                    <Typography
                      key={index}
                      sx={{
                        color: '#000000',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        fontFamily: '"Courier New", "Lucida Console", monospace',
                        lineHeight: 0.9,
                        textAlign: 'center',
                        minWidth: '12px',
                        textShadow: '0 0 3px #000000',
                        letterSpacing: '0px',
                        transform: 'rotate(270deg)',
                        display: 'inline-block'
                      }}
                    >
                      {digit}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeCard3D;