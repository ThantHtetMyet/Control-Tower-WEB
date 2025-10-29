import { memo, useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { keyframes } from '@mui/system';

// Animation keyframes
const planetOrbit = keyframes`
  0% {
    transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg);
  }
`;

const sunPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 30px rgba(255, 193, 7, 0.6), 0 0 60px rgba(255, 193, 7, 0.4), 0 0 90px rgba(255, 193, 7, 0.2);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 40px rgba(255, 193, 7, 0.8), 0 0 80px rgba(255, 193, 7, 0.6), 0 0 120px rgba(255, 193, 7, 0.4);
  }
`;

const starTwinkle = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
`;

const asteroidFloat = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
`;

const galaxyRotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const cometTrail = keyframes`
  0% {
    transform: translateX(-100px) translateY(50px);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100vw + 100px)) translateY(-50px);
    opacity: 0;
  }
`;

const OrbitAnimation = memo(() => {
  const [showAnimation, setShowAnimation] = useState(false);

  // Handle mouse movement
  const handleMouseMove = useCallback(() => {
    // Hide animation when mouse moves (show sign-in instead)
    setShowAnimation(false);
  }, []);

  // Set up mouse move listener and timer
  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      // Clear existing timer
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      // Hide animation immediately
      setShowAnimation(false);
      
      // Set new timer for 10 seconds
      inactivityTimer = setTimeout(() => {
        setShowAnimation(true);
      }, 10000);
    };

    // Add event listeners
    const events = ['mousemove', 'mouseenter', 'mouseover', 'touchstart', 'touchmove', 'click', 'keypress'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
      window.addEventListener(event, resetTimer, true);
    });

    // Start initial timer
    resetTimer();
    
    // Cleanup
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
        window.removeEventListener(event, resetTimer, true);
      });
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 1,
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
      }}
    >
      {/* Orbit Paths */}
      {/* Mercury Orbit */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '90px',
          height: '90px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      />
      
      {/* Venus Orbit */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '135px',
          height: '135px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      />
      
      {/* Earth Orbit */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '180px',
          height: '180px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      />
      
      {/* Mars Orbit */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '225px',
          height: '225px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      />
      
      {/* Jupiter Orbit */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '300px',
          height: '300px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      />
      
      {/* Saturn Orbit */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '360px',
          height: '360px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      />
      
      {/* Uranus Orbit */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '420px',
          height: '420px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      />
      
      {/* Neptune Orbit */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '480px',
          height: '480px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      />
      
      {/* Pluto Orbit */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '540px',
          height: '540px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      />

      {/* Solar System Center - Sun */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '40px',
          height: '40px',
          backgroundColor: '#FFC107', // Sun color
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          animation: `${sunPulse} 4s ease-in-out infinite`,
          zIndex: 10,
        }}
      />
      
      {/* Sun Label */}
      <Box
        sx={{
          position: 'absolute',
          top: 'calc(50% - 15px)',
          left: '53%',
          transform: 'translateX(-50%)',
          color: '#FFC107',
          fontSize: '12px',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(255, 193, 7, 0.8)',
          zIndex: 11,
        }}
      >
        SUN
      </Box>

      {/* Planet Orbits */}
      {/* Mercury */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '6px',
          height: '6px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '6px',
            height: '6px',
            backgroundColor: '#FF6B35', // Mercury - bright orange-red color
            borderRadius: '50%',
            '--orbit-radius': '45px',
            animation: `${planetOrbit} 8s linear infinite`,
            boxShadow: '0 0 6px rgba(140, 120, 83, 0.6)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#FF6B35',
            fontSize: '11px',
            fontWeight: 'bold',
            textShadow: '0 0 12px rgba(255, 107, 53, 1), 0 0 24px rgba(255, 107, 53, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)',
            whiteSpace: 'nowrap',
            '--orbit-radius': '45px',
            animation: `${planetOrbit} 8s linear infinite`,
          }}
        >
          MERCURY
        </Box>
      </Box>

      {/* Venus */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '9px',
          height: '9px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '9px',
            height: '9px',
            backgroundColor: '#FFC649', // Venus color
            borderRadius: '50%',
            '--orbit-radius': '67.5px',
            animation: `${planetOrbit} 12s linear infinite`,
            boxShadow: '0 0 12px rgba(255, 198, 73, 0.6)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#FFC649',
            fontSize: '10px',
            fontWeight: 'bold',
            textShadow: '0 0 8px rgba(255, 198, 73, 0.8)',
            whiteSpace: 'nowrap',
            '--orbit-radius': '67.5px',
            animation: `${planetOrbit} 12s linear infinite`,
          }}
        >
          VENUS
        </Box>
      </Box>

      {/* Earth */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '10px',
          height: '10px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            background: 'linear-gradient(45deg, #5090ffff, #4dcff3ff)', // Earth colors
            borderRadius: '50%',
            '--orbit-radius': '90px',
            animation: `${planetOrbit} 16s linear infinite`,
            boxShadow: '0 0 15px rgba(107, 147, 214, 0.6)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#82b0ffff',
            fontSize: '10px',
            fontWeight: 'bold',
            textShadow: '0 0 8px rgba(84, 147, 255, 0.8)',
            whiteSpace: 'nowrap',
            '--orbit-radius': '90px',
            animation: `${planetOrbit} 16s linear infinite`,
          }}
        >
          EARTH
        </Box>
      </Box>

      {/* Mars */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '10px',
          height: '10px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: '#35ff02ff', // Mars color
            borderRadius: '50%',
            '--orbit-radius': '112.5px',
            animation: `${planetOrbit} 20s linear infinite`,
            boxShadow: '0 0 15px rgba(205, 92, 92, 0.6)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#35ff02ff',
            fontSize: '10px',
            fontWeight: 'bold',
            textShadow: '0 0 8px rgba(205, 92, 92, 0.8)',
            whiteSpace: 'nowrap',
            '--orbit-radius': '112.5px',
            animation: `${planetOrbit} 20s linear infinite`,
          }}
        >
          MARS
        </Box>
      </Box>

      {/* Jupiter */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '18px',
          height: '18px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '18px',
            height: '18px',
            background: 'linear-gradient(45deg, #D8CA9D, #FAD5A5)', // Jupiter colors
            borderRadius: '50%',
            '--orbit-radius': '150px',
            animation: `${planetOrbit} 28s linear infinite`,
            boxShadow: '0 0 20px rgba(216, 202, 157, 0.6)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#D8CA9D',
            fontSize: '10px',
            fontWeight: 'bold',
            textShadow: '0 0 8px rgba(216, 202, 157, 0.8)',
            whiteSpace: 'nowrap',
            '--orbit-radius': '150px',
            animation: `${planetOrbit} 28s linear infinite`,
          }}
        >
          JUPITER
        </Box>
      </Box>

      {/* Saturn */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '15px',
          height: '15px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '15px',
            height: '15px',
            backgroundColor: '#FAD5A5', // Saturn color
            borderRadius: '50%',
            '--orbit-radius': '180px',
            animation: `${planetOrbit} 35s linear infinite`,
            boxShadow: '0 0 15px rgba(250, 213, 165, 0.6)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '28px',
              height: '2px',
              backgroundColor: 'rgba(250, 213, 165, 0.4)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
            }
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#FAD5A5',
            fontSize: '10px',
            fontWeight: 'bold',
            textShadow: '0 0 8px rgba(250, 213, 165, 0.8)',
            whiteSpace: 'nowrap',
            '--orbit-radius': '180px',
            animation: `${planetOrbit} 35s linear infinite`,
          }}
        >
          SATURN
        </Box>
      </Box>

      {/* Uranus */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '12px',
          height: '12px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            backgroundColor: '#4FD0E7', // Uranus color
            borderRadius: '50%',
            '--orbit-radius': '210px',
            animation: `${planetOrbit} 42s linear infinite`,
            boxShadow: '0 0 14px rgba(79, 208, 231, 0.6)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#4FD0E7',
            fontSize: '10px',
            fontWeight: 'bold',
            textShadow: '0 0 8px rgba(79, 208, 231, 0.8)',
            whiteSpace: 'nowrap',
            '--orbit-radius': '210px',
            animation: `${planetOrbit} 42s linear infinite`,
          }}
        >
          URANUS
        </Box>
      </Box>

      {/* Neptune */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '11px',
          height: '11px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '11px',
            height: '11px',
            backgroundColor: '#00CED1', // Neptune - bright turquoise color
            borderRadius: '50%',
            '--orbit-radius': '240px',
            animation: `${planetOrbit} 50s linear infinite`,
            boxShadow: '0 0 13px rgba(75, 112, 221, 0.6)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#00CED1',
            fontSize: '11px',
            fontWeight: 'bold',
            textShadow: '0 0 12px rgba(0, 206, 209, 1), 0 0 24px rgba(0, 206, 209, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)',
            whiteSpace: 'nowrap',
            '--orbit-radius': '240px',
            animation: `${planetOrbit} 50s linear infinite`,
          }}
        >
          NEPTUNE
        </Box>
      </Box>

      {/* Pluto (dwarf planet) */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '6px',
          height: '6px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '6px',
            height: '6px',
            backgroundColor: '#DA70D6', // Pluto - bright orchid color
            borderRadius: '50%',
            '--orbit-radius': '270px',
            animation: `${planetOrbit} 60s linear infinite`,
            boxShadow: '0 0 12px rgba(160, 82, 45, 0.6)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#DA70D6',
            fontSize: '11px',
            fontWeight: 'bold',
            textShadow: '0 0 12px rgba(218, 112, 214, 1), 0 0 24px rgba(218, 112, 214, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)',
            whiteSpace: 'nowrap',
            '--orbit-radius': '270px',
            animation: `${planetOrbit} 60s linear infinite`,
          }}
        >
          PLUTO
        </Box>
      </Box>

      {/* Twinkling Stars */}
      {[...Array(20)].map((_, i) => (
        <Box
          key={`star-${i}`}
          sx={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `${starTwinkle} ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
          }}
        />
      ))}

      {/* Floating Asteroids */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={`asteroid-${i}`}
          sx={{
            position: 'absolute',
            width: `${3 + i}px`,
            height: `${3 + i}px`,
            backgroundColor: '#8B7355',
            borderRadius: '30%',
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
            animation: `${asteroidFloat} ${4 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 1.2}s`,
            opacity: 0.7,
          }}
        />
      ))}

      {/* Comet */}
      <Box
        sx={{
          position: 'absolute',
          width: '4px',
          height: '4px',
          backgroundColor: '#E0E0E0',
          borderRadius: '50%',
          top: '20%',
          animation: `${cometTrail} 15s linear infinite`,
          boxShadow: '0 0 15px rgba(224, 224, 224, 0.8), -20px 0 30px rgba(224, 224, 224, 0.4), -40px 0 50px rgba(224, 224, 224, 0.2)',
        }}
      />

      {/* Galaxy Background */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '60px',
          height: '60px',
          background: 'radial-gradient(circle, rgba(138, 43, 226, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: `${galaxyRotate} 30s linear infinite`,
          opacity: 0.6,
        }}
      />
    </Box>
  );
});

OrbitAnimation.displayName = 'OrbitAnimation';

export default OrbitAnimation;