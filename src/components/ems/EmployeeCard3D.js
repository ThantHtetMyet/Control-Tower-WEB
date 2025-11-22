import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar
} from '@mui/material';
import staffCardBackground from '../resources/staff_card_background.png';
import { API_URL } from '../../config/apiConfig';

const EmployeeCard3D = ({ open, onClose, employee, triggerElement }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('closed'); // 'closed', 'opening', 'open', 'closing'
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleCardClick = () => {
    if (animationPhase === 'open' && !isAnimating) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleMouseMove = (e) => {
    if (animationPhase === 'open') {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      setMousePosition({
        x: mouseX * 0.01, // Even more subtle parallax
        y: mouseY * 0.01
      });
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isAnimating) {
      handleClose();
    }
  };

  const handleClose = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimationPhase('closing');
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
    
    setTimeout(() => {
      setAnimationPhase('closed');
      setIsAnimating(false);
      setIsFlipped(false);
      onClose();
    }, 1200); // Longer, gentler closing
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && !isAnimating) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [open, isAnimating]);

  // Ultra-gentle opening animation
  useEffect(() => {
    if (open && animationPhase === 'closed') {
      setIsAnimating(true);
      setAnimationPhase('opening');
      
      // Gentle multi-stage opening
      setTimeout(() => {
        setAnimationPhase('open');
      }, 200); // Slower initial phase
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 1400); // Much longer for gentleness
    }
  }, [open]);

  // Get trigger element position for ultra-gentle genie effect
  const getTriggerPosition = () => {
    if (triggerElement && triggerElement.current) {
      const rect = triggerElement.current.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height
      };
    }
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      width: 100,
      height: 40
    };
  };

  const triggerPos = getTriggerPosition();

  // Ultra-gentle genie effect with soft transitions
  const getGenieAnimation = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    if (animationPhase === 'opening') {
      return {
        transform: `
          translate(${triggerPos.x - centerX}px, ${triggerPos.y - centerY}px) 
          scale(${triggerPos.width / 320}, ${triggerPos.height / 500})
          rotateX(2deg) rotateY(1deg)
        `,
        opacity: 0.1,
        filter: 'blur(8px) brightness(0.9)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      };
    } else if (animationPhase === 'closing') {
      return {
        transform: `
          translate(${triggerPos.x - centerX}px, ${triggerPos.y - centerY}px) 
          scale(${triggerPos.width / 320}, ${triggerPos.height / 500})
          rotateX(-1deg) rotateY(-0.5deg)
        `,
        opacity: 0,
        filter: 'blur(12px) brightness(0.8)',
        boxShadow: '0 1px 5px rgba(0,0,0,0.05)'
      };
    }
    
    // Gentle hover effects
    const hoverScale = isHovering ? 1.01 : 1; // Much more subtle
    const mouseTransform = `translate(${mousePosition.x}px, ${mousePosition.y}px)`;
    
    return {
      transform: `${mouseTransform} scale(${hoverScale}) rotateX(0deg) rotateY(0deg)`,
      opacity: 1,
      filter: 'blur(0px) brightness(1)',
      boxShadow: isHovering 
        ? '0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)' 
        : '0 20px 50px rgba(0,0,0,0.3)'
    };
  };

  if (!open && animationPhase === 'closed') return null;

  return (
    <Box
      onClick={handleOverlayClick}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: (() => {
          switch(animationPhase) {
            case 'opening': return 'rgba(0, 0, 0, 0.05)';
            case 'open': return 'rgba(0, 0, 0, 0.75)';
            case 'closing': return 'rgba(0, 0, 0, 0.1)';
            default: return 'rgba(0, 0, 0, 0.2)';
          }
        })(),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '20px',
        boxSizing: 'border-box',
        transition: 'background-color 1.2s cubic-bezier(0.23, 1, 0.32, 1)', // Ultra-gentle easing
        backdropFilter: animationPhase === 'open' ? 'blur(6px)' : 'blur(1px)'
      }}
    >
      <Box
        onClick={handleCardClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setMousePosition({ x: 0, y: 0 });
        }}
        sx={{
          width: 320,
          height: 500,
          perspective: '1200px',
          cursor: animationPhase === 'open' ? 'pointer' : 'default',
          position: 'relative',
          transition: 'all 1.4s cubic-bezier(0.23, 1, 0.32, 1)', // Ultra-gentle spring easing
          transformStyle: 'preserve-3d',
          ...getGenieAnimation()
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 1.6s cubic-bezier(0.23, 1, 0.32, 1)', // Even gentler flip
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
              borderRadius: '24px', // Softer corners
              backgroundImage: `url(${staffCardBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.1)',
              transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: isHovering 
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)'
                  : 'transparent',
                transition: 'background 1s ease',
                borderRadius: '24px',
                pointerEvents: 'none'
              }
            }}
          >
            {/* WILLOWGLEN - Top Center with ultra-gentle animation */}
            <Typography
              variant="h6"
              sx={{
                position: 'absolute',
                top: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#D32F2F',
                fontWeight: 'bold',
                fontSize: '22px',
                letterSpacing: '2px',
                fontFamily: 'Arial, sans-serif',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                transition: 'all 1s cubic-bezier(0.23, 1, 0.32, 1)',
                opacity: animationPhase === 'open' ? 1 : 0,
                transform: `translateX(-50%) translateY(${animationPhase === 'open' ? '0px' : '-20px'})`,
                animation: animationPhase === 'open' ? 'gentleFadeInUp 1.2s cubic-bezier(0.23, 1, 0.32, 1) 0.3s both' : 'none',
                '@keyframes gentleFadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateX(-50%) translateY(30px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateX(-50%) translateY(0px)'
                  }
                }
              }}
            >
              WILLOWGLEN
            </Typography>

            {/* Employee Photo - Center Top with gentle scaling */}
            <Box
              sx={{
                position: 'absolute',
                top: '90px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '130px',
                height: '150px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
                opacity: animationPhase === 'open' ? 1 : 0,
                animation: animationPhase === 'open' ? 'gentlePhotoAppear 1.4s cubic-bezier(0.23, 1, 0.32, 1) 0.6s both' : 'none',
                '@keyframes gentlePhotoAppear': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateX(-50%) scale(0.9)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateX(-50%) scale(1)'
                  }
                }
              }}
            >
              {employee?.profileImageUrl ? (
                <img
                  src={employee.profileImageUrl}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  style={{
                    width: '120px',
                    height: '140px',
                    objectFit: 'cover',
                    borderRadius: '16px',
                    border: '2px solid rgba(51, 51, 51, 0.6)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                    transition: 'all 0.8s ease',
                    filter: isHovering ? 'brightness(1.05) contrast(1.02)' : 'brightness(1) contrast(1)'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 120,
                    height: 140,
                    borderRadius: '16px',
                    border: '2px solid rgba(51, 51, 51, 0.6)',
                    fontSize: '2.2rem',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                    backgroundColor: '#34C759',
                    transition: 'all 0.8s ease',
                    transform: isHovering ? 'scale(1.01)' : 'scale(1)'
                  }}
                >
                  {employee?.firstName?.[0]}{employee?.lastName?.[0]}
                </Avatar>
              )}
            </Box>

            {/* Employee Name - Center with gentle slide */}
            <Typography
              variant="h6"
              sx={{
                position: 'absolute',
                top: '260px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '20px',
                textAlign: 'center',
                width: '280px',
                fontFamily: 'Arial, sans-serif',
                textShadow: '2px 2px 4px rgba(255,255,255,0.8)',
                transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
                opacity: animationPhase === 'open' ? 1 : 0,
                animation: animationPhase === 'open' ? 'gentleSlideInUp 1.2s cubic-bezier(0.23, 1, 0.32, 1) 0.9s both' : 'none',
                '@keyframes gentleSlideInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateX(-50%) translateY(40px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateX(-50%) translateY(0px)'
                  }
                }
              }}
            >
              {employee?.firstName?.toUpperCase()} {employee?.lastName?.toUpperCase()}
            </Typography>

            {/* Staff Card ID - Center with gentle bounce */}
            <Typography
              variant="h5"
              sx={{
                position: 'absolute',
                top: '335px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '32px',
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif',
                textShadow: isHovering 
                  ? '2px 2px 6px rgba(255,255,255,0.8), 0 0 15px rgba(255,255,255,0.3)'
                  : '2px 2px 4px rgba(255,255,255,0.8)',
                transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
                opacity: animationPhase === 'open' ? 1 : 0,
                animation: animationPhase === 'open' ? 'gentleBounceIn 1.4s cubic-bezier(0.23, 1, 0.32, 1) 1.2s both' : 'none',
                '@keyframes gentleBounceIn': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateX(-50%) scale(0.8)'
                  },
                  '60%': {
                    transform: 'translateX(-50%) scale(1.02)'
                  },
                  '80%': {
                    transform: 'translateX(-50%) scale(0.98)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateX(-50%) scale(1)'
                  }
                }
              }}
            >
              {employee?.staffCardID || employee?.id}
            </Typography>

            {/* Return Information - Bottom with gentle fade */}
            <Box
              sx={{
                position: 'absolute',
                bottom: '15px',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                width: '260px',
                transition: 'all 1.2s ease',
                opacity: animationPhase === 'open' ? 1 : 0,
                animation: animationPhase === 'open' ? 'gentleFadeInBottom 1.2s ease 1.5s both' : 'none',
                '@keyframes gentleFadeInBottom': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateX(-50%) translateY(30px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateX(-50%) translateY(0px)'
                  }
                }
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#000',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  mb: 0.3,
                  fontFamily: 'Arial, sans-serif',
                  textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
                }}
              >
                If found, please return to:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#000',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  mb: 0.2,
                  fontFamily: 'Arial, sans-serif',
                  textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
                }}
              >
                Willowglen Services Pte Ltd
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#000',
                  fontSize: '9px',
                  mb: 0.1,
                  fontFamily: 'Arial, sans-serif',
                  textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
                }}
              >
                103 Defu Lane 10, #05-01,
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#000',
                  fontSize: '9px',
                  mb: 0.1,
                  fontFamily: 'Arial, sans-serif',
                  textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
                }}
              >
                Singapore 539223
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#000',
                  fontSize: '9px',
                  fontFamily: 'Arial, sans-serif',
                  textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
                }}
              >
                Tel: (65) 6280 0437
              </Typography>
            </Box>
          </Box>

          {/* Back Side with gentle animations */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: '24px',
              backgroundImage: `url(${staffCardBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.1)',
              padding: '20px',
              transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: isHovering 
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)'
                  : 'transparent',
                transition: 'background 1s ease',
                borderRadius: '24px',
                pointerEvents: 'none'
              }
            }}
          >
            {/* RFID Card Number - Top Right Position with gentle styling */}
            <Box
              sx={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                zIndex: 10,
                opacity: isFlipped ? 1 : 0,
                transition: 'opacity 1s ease 0.4s'
              }}
            >
              {/* Digital RFID Number Display with soft glow */}
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
                        lineHeight: 1,
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
    </Box>
  );
};

export default EmployeeCard3D;