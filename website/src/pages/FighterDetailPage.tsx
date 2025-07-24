import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useFighter } from '../hooks/useFighters';

const FighterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { fighter, loading, error } = useFighter(id || null);

  // Log the fighter data to console when it's loaded
  React.useEffect(() => {
    if (fighter) {
      console.log('Fighter data:', fighter);
    }
  }, [fighter]);

  const handleBackClick = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress size={60} sx={{ color: 'secondary.main' }} />
      </Box>
    );
  }

  if (error || !fighter) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
              Fighter Not Found
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
              {error || 'The requested fighter could not be found.'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackClick}
              sx={{ bgcolor: 'secondary.main' }}
            >
              Back to Home
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          bgcolor: 'primary.main', 
          borderBottom: `1px solid ${theme.palette.divider}`,
          mb: 4
        }}
      >
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackClick}
              sx={{ 
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Back
            </Button>
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'primary.contrastText',
                fontWeight: 600
              }}
            >
              Fighter Details
            </Typography>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            sx={{ 
              color: 'text.primary',
              mb: 2,
              fontWeight: 700
            }}
          >
            {fighter.fighterName || fighter.name}
          </Typography>
          
          {fighter.weightClass && (
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                mb: 4,
                fontWeight: 400
              }}
            >
              {fighter.weightClass}
            </Typography>
          )}

          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Fighter details loaded successfully. Check the browser console to see the complete fighter data.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default FighterDetailPage; 