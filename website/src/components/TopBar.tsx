import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  InputBase,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Home as HomeIcon,
  Group as FightersIcon,
  Event as EventsIcon,
  FitnessCenter as GymsIcon,
  Info as AboutIcon,
  BarChart as VisualizeIcon,
} from '@mui/icons-material';

const TopBar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <AppBar 
      position="sticky" 
      sx={{
        background: 'rgba(10, 14, 23, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 240, 255, 0.1)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
          opacity: 0.6,
        }
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        {/* Left section - Logo and Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Logo */}
          <Button
            onClick={() => navigate('/')}
            sx={{
              p: 0,
              minWidth: 'auto',
              '&:hover': {
                bgcolor: 'transparent',
              },
            }}
          >
            <img 
              src="/icon.png" 
              alt="FightStats Logo" 
              style={{
                height: '36px',
                width: 'auto',
                cursor: 'pointer',
              }}
            />
          </Button>

          {/* Navigation */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 0.5,
          }}>
            <Button
              startIcon={<FightersIcon />}
              onClick={() => navigate('/fighters')}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 700,
                px: 2.5,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#00F0FF',
                  bgcolor: 'rgba(0, 240, 255, 0.15)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 240, 255, 0.2)',
                },
              }}
            >
              Fighters
            </Button>
            <Button
              startIcon={<EventsIcon />}
              onClick={() => navigate('/events')}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 700,
                px: 2.5,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#00F0FF',
                  bgcolor: 'rgba(0, 240, 255, 0.15)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 240, 255, 0.2)',
                },
              }}
            >
              Events
            </Button>
            <Button
              startIcon={<GymsIcon />}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 700,
                px: 2.5,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#00F0FF',
                  bgcolor: 'rgba(0, 240, 255, 0.15)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 240, 255, 0.2)',
                },
              }}
            >
              Gyms
            </Button>
            <Button
              startIcon={<AboutIcon />}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 700,
                px: 2.5,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#00F0FF',
                  bgcolor: 'rgba(0, 240, 255, 0.15)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 240, 255, 0.2)',
                },
              }}
            >
              About
            </Button>
            <Button
              startIcon={<VisualizeIcon />}
              onClick={() => navigate('/visualize')}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 700,
                px: 2.5,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#00F0FF',
                  bgcolor: 'rgba(0, 240, 255, 0.15)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 240, 255, 0.2)',
                },
              }}
            >
              Visualize
            </Button>
          </Box>
        </Box>

        {/* Right section - Search */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'rgba(10, 14, 23, 0.4)',
          borderRadius: '8px',
          px: 2.5,
          py: 1.5,
          border: '1px solid rgba(0, 240, 255, 0.15)',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: 'rgba(10, 14, 23, 0.6)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 240, 255, 0.1)',
          },
        }}>
          <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1.5, fontSize: '1.2rem' }} />
          <InputBase
            placeholder="Search..."
            sx={{
              color: 'white',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '0.02em',
              '& input::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
                opacity: 1,
                fontStyle: 'italic',
              },
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar; 