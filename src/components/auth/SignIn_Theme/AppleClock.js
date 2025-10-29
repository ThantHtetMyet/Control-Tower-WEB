import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';

const ClockContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  width: '100%',
  height: '100%',
  padding: 0,
  background: `
    radial-gradient(
      ellipse 90% 70% at center center,
      rgba(255, 200, 120, 0.15) 0%,
      rgba(255, 180, 100, 0.12) 25%,
      rgba(255, 160, 80, 0.08) 45%,
      rgba(255, 140, 60, 0.05) 65%,
      transparent 80%
    )
  `,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(
        circle at 25% 15%,
        rgba(255, 220, 140, 0.08) 0%,
        rgba(255, 200, 120, 0.05) 30%,
        transparent 50%
      ),
      radial-gradient(
        circle at 75% 85%,
        rgba(255, 180, 100, 0.06) 0%,
        rgba(255, 160, 80, 0.04) 35%,
        transparent 55%
      ),
      radial-gradient(
        circle at 50% 50%,
        rgba(255, 190, 110, 0.04) 0%,
        transparent 60%
      )
    `,
    pointerEvents: 'none',
    borderRadius: 'inherit',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      linear-gradient(
        45deg,
        rgba(255, 210, 130, 0.03) 0%,
        transparent 30%,
        rgba(255, 170, 90, 0.02) 70%,
        transparent 100%
      )
    `,
    pointerEvents: 'none',
    borderRadius: 'inherit',
  },
});

const DateDisplay = styled(Typography)({
  position: 'absolute',
  top: 'clamp(18px, 3vh, 32px)',
  left: '50%',
  transform: 'translateX(-50%) scaleX(0.85)',
  transformOrigin: 'center',
  fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
  fontWeight: 300,
  letterSpacing: '0.12em',
  color: 'rgba(255, 255, 255, 0.92)',
  textShadow: '0 2px 12px rgba(0, 0, 0, 0.35)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
  textAlign: 'center',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  width: '100%',
});

const TimeContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.1rem', // Fixed small gap instead of responsive
  width: '100%',
  flexWrap: 'nowrap',
});

const DigitGroup = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0rem', // No gap between digits for tightest spacing
});

const TimeDigit = styled(Typography)({
  // Adjusted font size for better starting point on larger screens
  fontSize: 'clamp(8rem, 18vw, 15rem)',
  
  // The iOS clock uses a medium weight, not extra-light (100)
  // 300 (Light) or 400 (Regular/Book) is closer to the original font weight
  fontWeight: 400, 
  
  // The line height is fine for vertical alignment, but doesn't affect the digit shape itself
  lineHeight: '0.9',
  
  // Use San Francisco, or a suitable fallback for non-Apple devices
  fontFamily: 'San Francisco, "SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif',
  
  // Increase opacity for the brighter, more translucent look
  color: 'rgba(255, 255, 255, 1.0)', // Start with full white for the base color
  
  textAlign: 'center',
  fontVariantNumeric: 'tabular-nums',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  
  // Keep the transform for the condensed/tall look, but adjust the values for a closer match
  // The original font is not 'ultra-condensed', the transform achieves that look
  fontStretch: 'normal', 
  transform: 'scaleX(0.7) scaleY(1.15)',
  transformOrigin: 'center',
  
  // The key to the iOS clock: a very strong, light stroke and a subtle glow.
  textShadow: `
    0 0 10px rgba(255, 255, 255, 0.7), /* Increased glow/haze */
    0 0 25px rgba(255, 255, 255, 0.4), /* Brighter white core */
    0 4px 10px rgba(0, 0, 0, 0.3) /* Subtler shadow for depth */
  `,
  
  // **Crucial Change:** Increase the stroke thickness and make it highly transparent (the translucency)
  WebkitTextStroke: '2px rgba(255, 255, 255, 0.25)', 
  
  display: 'block',
  
  // Tighten up the spacing more
  minWidth: '0', 
  margin: '0 -0.05em', 
  
  fontFeatureSettings: '"tnum" 1, "lnum" 1',
  
  // Add a slight blur to the digit for that smooth, glass-like effect
  filter: 'blur(0.2px)',
});

const ColonSeparator = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.8rem', // Fixed smaller gap between colon dots
  transform: 'scaleX(0.8)',
  height: 'clamp(8rem, 18vw, 14rem)',
});

const ColonDot = styled(Box)({
  width: 'clamp(0.8rem, 2.2vw, 1.8rem)',
  height: 'clamp(0.8rem, 2.2vw, 1.8rem)',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.85)', // Changed to white
  boxShadow: `
    0 0 10px rgba(255, 255, 255, 0.4),
    0 3px 10px rgba(0, 0, 0, 0.25)
  `,
});

const AppleClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time to always show two digits
  const formatTwoDigits = (number) => number.toString().padStart(2, '0');
  
  const hours = formatTwoDigits(currentTime.getHours());
  const minutes = formatTwoDigits(currentTime.getMinutes());

  // Split into individual digits
  const hourDigits = hours.split('');
  const minuteDigits = minutes.split('');

  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options).replace(',', '');
  };

  return (
    <ClockContainer>
      <DateDisplay>{formatDate(currentTime)}</DateDisplay>
      
      <TimeContainer>
        {/* Hour digits */}
        <DigitGroup>
          <TimeDigit>{hourDigits[0]}</TimeDigit>
          <TimeDigit>{hourDigits[1]}</TimeDigit>
        </DigitGroup>

        {/* Colon separator */}
        <ColonSeparator>
          <ColonDot />
          <ColonDot />
        </ColonSeparator>

        {/* Minute digits */}
        <DigitGroup>
          <TimeDigit>{minuteDigits[0]}</TimeDigit>
          <TimeDigit>{minuteDigits[1]}</TimeDigit>
        </DigitGroup>
      </TimeContainer>
    </ClockContainer>
  );
};

export default AppleClock;
