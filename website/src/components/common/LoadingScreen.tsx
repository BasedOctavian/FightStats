import React from 'react';
import { Box, Container, Typography, Fade } from '@mui/material';

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = React.memo(({ message = "Loading...", showProgress = false }) => {
  return (
    <Fade in={true} timeout={800}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#0A0E17',
          background: 'linear-gradient(135deg, #0A0E17 0%, #1A1F2E 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '400px',
            background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 240, 255, 0) 100%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '20%',
            right: '-10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.05) 0%, transparent 70%)',
            animation: 'pulse 6s ease-in-out infinite',
            pointerEvents: 'none',
          }
        }}
      >
        <Container 
          maxWidth="sm" 
          sx={{ 
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              animation: 'slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both',
            }}
          >
            {/* Main Loading Container */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                position: 'relative',
              }}
            >
              {/* Logo */}
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 4,
                  animation: 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both',
                }}
              >
                <img
                  src="/icon.png"
                  alt="FightStats Logo"
                  style={{
                    height: '80px',
                    width: 'auto',
                    filter: 'drop-shadow(0 0 20px rgba(0, 240, 255, 0.3))',
                    transition: 'all 0.3s ease',
                    animation: 'logoGlow 3s ease-in-out infinite alternate',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
                    transform: 'translate(-50%, -50%)',
                    animation: 'pulse 4s ease-in-out infinite',
                    zIndex: -1,
                  }}
                />
              </Box>

              {/* Loading Message */}
              <Typography
                variant="h5"
                sx={{
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  mb: 4,
                  animation: 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both',
                  textShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                }}
              >
                {message}
              </Typography>

              {/* Advanced Loading Animation */}
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '80px',
                  height: '80px',
                  mx: 'auto',
                  mb: showProgress ? 4 : 0,
                  animation: 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both',
                }}
              >
                {/* Outer ring */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: '2px solid rgba(0, 240, 255, 0.1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-2px',
                      left: '-2px',
                      right: '-2px',
                      bottom: '-2px',
                      borderRadius: '50%',
                      background: 'conic-gradient(from 0deg, transparent, rgba(0, 240, 255, 0.05), transparent)',
                      animation: 'spin 3s linear infinite',
                      zIndex: -1,
                    }
                  }}
                />
                
                {/* Primary spinning ring */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: '2px solid transparent',
                    borderTop: '2px solid #00F0FF',
                    borderRight: '2px solid rgba(0, 240, 255, 0.3)',
                    animation: 'spin 1.5s linear infinite',
                    filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.3))',
                  }}
                />

                {/* Secondary spinning ring */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: '2px solid transparent',
                    borderBottom: '2px solid rgba(0, 240, 255, 0.6)',
                    borderLeft: '2px solid rgba(0, 240, 255, 0.2)',
                    animation: 'spin 2s linear infinite reverse',
                    filter: 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.2))',
                  }}
                />

                {/* Inner pulse */}
                <Box
                  sx={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    bgcolor: '#00F0FF',
                    animation: 'pulse 2s ease-in-out infinite',
                    filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.4))',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '-6px',
                      left: '-6px',
                      right: '-6px',
                      bottom: '-6px',
                      borderRadius: '50%',
                      border: '1px solid rgba(0, 240, 255, 0.2)',
                      animation: 'pulse 2s ease-in-out infinite 0.5s',
                    }
                  }}
                />
              </Box>

              {/* Progress Bar */}
              {showProgress && (
                <Box
                  sx={{
                    width: '240px',
                    height: '6px',
                    bgcolor: 'rgba(0, 240, 255, 0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both',
                    position: 'relative',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.3), transparent)',
                      animation: 'shimmer 2s ease-in-out infinite',
                      zIndex: 1,
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #00F0FF, #00D4FF)',
                      borderRadius: '3px',
                      animation: 'progressFill 2s ease-out forwards',
                      transformOrigin: 'left',
                      boxShadow: '0 0 12px rgba(0, 240, 255, 0.4)',
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Subtle background elements */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(0, 240, 255, 0.02) 0%, transparent 70%)',
                transform: 'translate(-50%, -50%)',
                animation: 'pulse 8s ease-in-out infinite',
                pointerEvents: 'none',
                zIndex: -1,
              }}
            />
          </Box>
        </Container>
      </Box>
    </Fade>
  );
});

export default LoadingScreen; 