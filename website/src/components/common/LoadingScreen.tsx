import React from 'react';
import { Box, Typography, CircularProgress, Fade } from '@mui/material';

interface LoadingScreenProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showLogo?: boolean;
  fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  size = 'medium',
  showLogo = true,
  fullScreen = false
}) => {
  const sizeConfig = {
    small: { logo: 24, progress: 40, message: '0.9rem' },
    medium: { logo: 36, progress: 60, message: '1rem' },
    large: { logo: 48, progress: 80, message: '1.1rem' }
  };

  const config = sizeConfig[size];

  const LoadingContent = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: 3,
      position: 'relative',
    }}>
      {/* Logo */}
      {showLogo && (
        <Fade in={true} timeout={800}>
          <Box sx={{ position: 'relative' }}>
            <img 
              src="/icon.png" 
              alt="FightStats Logo" 
              style={{
                height: `${config.logo}px`,
                width: 'auto',
                filter: 'drop-shadow(0 0 12px rgba(0, 240, 255, 0.4))',
              }}
            />
            {/* Glow effect */}
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${config.logo * 2}px`,
              height: `${config.logo * 2}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 70%)',
              filter: 'blur(8px)',
              zIndex: -1,
            }} />
          </Box>
        </Fade>
      )}

      {/* Loading Spinner */}
      <Fade in={true} timeout={1200}>
        <Box sx={{ position: 'relative' }}>
          {/* Outer ring */}
          <CircularProgress 
            size={config.progress} 
            thickness={4}
            sx={{ 
              color: 'rgba(0, 240, 255, 0.2)',
              position: 'absolute',
              top: 0,
              left: 0,
            }} 
          />
          {/* Inner ring */}
          <CircularProgress 
            size={config.progress - 20} 
            thickness={3}
            sx={{ 
              color: '#00F0FF',
              filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.5))',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
                filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.3))',
              },
            }} 
          />
          {/* Center dot */}
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#00F0FF',
            boxShadow: '0 0 12px rgba(0, 240, 255, 0.6)',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
        </Box>
      </Fade>

      {/* Loading Message */}
      <Fade in={true} timeout={1600}>
        <Typography 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: config.message,
            fontWeight: 500,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.5), transparent)',
            }
          }}
        >
          {message}
        </Typography>
      </Fade>

      {/* Animated background elements */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'conic-gradient(from 0deg, transparent, rgba(0, 240, 255, 0.1), transparent)',
        animation: 'rotate 4s linear infinite',
        zIndex: -1,
      }} />
      
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'conic-gradient(from 180deg, transparent, rgba(0, 102, 255, 0.1), transparent)',
        animation: 'rotate 3s linear infinite reverse',
        zIndex: -1,
      }} />
    </Box>
  );

  // Add CSS keyframes for animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { 
          opacity: 1; 
          transform: translate(-50%, -50%) scale(1);
        }
        50% { 
          opacity: 0.7; 
          transform: translate(-50%, -50%) scale(1.2);
        }
      }
      @keyframes rotate {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  if (fullScreen) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#0A0E17',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A0E17 0%, #1A1F2E 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '400px',
          background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 240, 255, 0) 100%)',
          pointerEvents: 'none',
        }
      }}>
        <LoadingContent />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4,
      position: 'relative',
    }}>
      <LoadingContent />
    </Box>
  );
};

export default LoadingScreen; 