import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import SearchBar from '../components/SearchBar';
import { Fighter } from '../types/firestore';

const HomePage: React.FC = () => {
  const [selectedFighter, setSelectedFighter] = useState<Fighter | null>(null);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleFighterSelect = (fighter: Fighter) => {
    setSelectedFighter(fighter);
    // Navigate to fighter detail page
    navigate(`/fighter/${fighter.id}`);
  };

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
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h1" 
              sx={{ 
                color: 'primary.contrastText', 
                mb: 1,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              FightStats
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 400
              }}
            >
              Comprehensive MMA fighter statistics and analysis
            </Typography>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Search Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                color: 'text.primary', 
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Find Your Fighter
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
                fontSize: '1.1rem'
              }}
            >
              Search through our comprehensive database of MMA fighters to view detailed statistics, fight history, and performance metrics.
            </Typography>
          </Box>
          
          <SearchBar onFighterSelect={handleFighterSelect} />
          
          {selectedFighter && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Card sx={{ display: 'inline-block', px: 3, py: 2 }}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Selected fighter:
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 600
                    }}
                  >
                    {selectedFighter.fighterName || selectedFighter.name}
                  </Typography>
                  {selectedFighter.weightClass && (
                    <Chip 
                      label={selectedFighter.weightClass}
                      size="small"
                      sx={{ 
                        mt: 1,
                        bgcolor: 'secondary.main',
                        color: 'secondary.contrastText'
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>

        {/* Features Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ py: 4 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'secondary.main', 
                    width: 56, 
                    height: 56, 
                    mx: 'auto', 
                    mb: 2 
                  }}
                >
                  <BarChartIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: 'text.primary',
                    mb: 2,
                    fontWeight: 600
                  }}
                >
                  Detailed Statistics
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Comprehensive fight statistics including striking accuracy, takedown success rates, and performance metrics.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ py: 4 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'secondary.main', 
                    width: 56, 
                    height: 56, 
                    mx: 'auto', 
                    mb: 2 
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: 'text.primary',
                    mb: 2,
                    fontWeight: 600
                  }}
                >
                  Performance Analysis
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Advanced analytics and performance grades to help you understand fighter strengths and weaknesses.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ py: 4 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'secondary.main', 
                    width: 56, 
                    height: 56, 
                    mx: 'auto', 
                    mb: 2 
                  }}
                >
                  <UpdateIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: 'text.primary',
                    mb: 2,
                    fontWeight: 600
                  }}
                >
                  Real-time Updates
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Stay up to date with the latest fight results and fighter performance data as it happens.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Stats Preview */}
        <Card sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                color: 'text.primary',
                mb: 2,
                fontWeight: 600
              }}
            >
              Database Overview
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Our comprehensive database contains detailed information on fighters across all major MMA organizations.
            </Typography>
          </Box>
          
          <Grid container spacing={4} sx={{ textAlign: 'center' }}>
            <Grid item xs={6} md={3}>
              <Typography 
                variant="h2" 
                sx={{ 
                  color: 'secondary.main',
                  mb: 1,
                  fontWeight: 700
                }}
              >
                1000+
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Active Fighters
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography 
                variant="h2" 
                sx={{ 
                  color: 'secondary.main',
                  mb: 1,
                  fontWeight: 700
                }}
              >
                5000+
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Fights Tracked
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography 
                variant="h2" 
                sx={{ 
                  color: 'secondary.main',
                  mb: 1,
                  fontWeight: 700
                }}
              >
                50+
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Weight Classes
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography 
                variant="h2" 
                sx={{ 
                  color: 'secondary.main',
                  mb: 1,
                  fontWeight: 700
                }}
              >
                24/7
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Data Updates
              </Typography>
            </Grid>
          </Grid>
        </Card>
      </Container>

      {/* Footer */}
      <Paper 
        elevation={0} 
        sx={{ 
          bgcolor: 'primary.main', 
          borderTop: `1px solid ${theme.palette.divider}`,
          mt: 8
        }}
      >
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              &copy; 2024 FightStats. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Paper>
    </Box>
  );
};

export default HomePage; 