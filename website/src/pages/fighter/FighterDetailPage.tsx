import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  useTheme,
  Chip,
  Tabs,
  Tab,
  Fade,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Analytics as AnalyticsIcon,
  History as HistoryIcon,
  SportsMartialArts as StrikingIcon,
  Sports as GrapplingIcon,
  DirectionsRun as MovementIcon,
} from '@mui/icons-material';
import { useFighter } from '../../hooks/useFighters';
import BasicInfo from '../../components/fighter/BasicInfo';
import FightHistory from '../../components/fighter/FightHistory';
import StrikingInfo from '../../components/fighter/StrikingInfo';
import GrapplingInfo from '../../components/fighter/GrapplingInfo';
import MovementInfo from '../../components/fighter/MovementInfo';
import { useWeightClass } from '../../hooks/useWeightClass';

// Helper function to format record
const formatRecord = (wins: number, losses: number): string => {
  return `${wins}-${losses}`;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <Fade in={value === index} timeout={400}>
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`fighter-tabpanel-${index}`}
        aria-labelledby={`fighter-tab-${index}`}
        {...other}
        style={{ display: value === index ? 'block' : 'none' }}
      >
        {value === index && children}
      </div>
    </Fade>
  );
};

interface WeightClassData {
  kowins?: number;
  tkowins?: number;
  subwin?: number;
  decwin?: number;
}

const FighterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { fighter, loading, error } = useFighter(id || null);
  const [tabValue, setTabValue] = useState(0);

  // Add weight class hook
  const weightClassName = useMemo(() => {
    console.log('Fighter weight class from weight field:', fighter?.weight);
    return fighter?.weight || null;
  }, [fighter?.weight]);

  const { weightClass: weightClassData, loading: weightClassLoading, error: weightClassError } = useWeightClass(weightClassName) as { 
    weightClass: WeightClassData | null;
    loading: boolean;
    error: any;
  };

  // Log weight class data fields
  useEffect(() => {
    if (weightClassData) {
      console.log('Weight Class Document Fields:', Object.keys(weightClassData));
      console.log('Full Weight Class Data:', weightClassData);
    }
    if (weightClassError) {
      console.error('Weight class error:', weightClassError);
    }
  }, [weightClassData, weightClassError]);

  // Define tabs - Overview, Striking, Grappling, Movement, and Fight History
  const tabs = useMemo(() => {
    if (!fighter) return [];
    
    return [
      {
        icon: <AnalyticsIcon />,
        label: "Overview",
        component: <BasicInfo fighter={fighter} weightClassAvgData={weightClassData} />
      },
      {
        icon: <StrikingIcon />,
        label: "Striking",
        component: <StrikingInfo fighter={fighter} weightClassAvgData={weightClassData} />
      },
      {
        icon: <GrapplingIcon />,
        label: "Grappling",
        component: <GrapplingInfo fighter={fighter} weightClassAvgData={weightClassData} />
      },
      {
        icon: <MovementIcon />,
        label: "Movement",
        component: <MovementInfo fighter={fighter} weightClassAvgData={weightClassData} />
      },
      {
        icon: <HistoryIcon />,
        label: "Fight History",
        component: <FightHistory fighter={fighter} weightClassAvgData={weightClassData} />
      }
    ];
  }, [fighter, weightClassData]);

  // Reset tab when fighter ID changes
  useEffect(() => {
    setTabValue(0);
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#0A0E17',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A0E17 0%, #1A1F2E 100%)',
      }}>
        <Box sx={{ position: 'relative' }}>
          <CircularProgress 
            size={80} 
            sx={{ 
              color: '#00F0FF',
              opacity: 0.3,
            }} 
          />
          <CircularProgress 
            size={60} 
            sx={{ 
              color: '#00F0FF',
              position: 'absolute',
              left: '10px',
              top: '10px',
            }} 
          />
        </Box>
      </Box>
    );
  }

  if (error || !fighter) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#0A0E17',
        background: 'linear-gradient(135deg, #0A0E17 0%, #1A1F2E 100%)',
      }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ 
            textAlign: 'center',
            p: 4,
            bgcolor: 'rgba(0, 240, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(0, 240, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <Typography variant="h4" sx={{ 
              color: '#00F0FF',
              mb: 2,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}>
              Fighter Not Found
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 4 
            }}>
              {error || 'The requested fighter could not be found.'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackClick}
              sx={{ 
                color: '#00F0FF',
                borderColor: '#00F0FF',
                '&:hover': {
                  borderColor: '#00F0FF',
                  bgcolor: 'rgba(0, 240, 255, 0.1)',
                }
              }}
            >
              Back to Home
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  const record = formatRecord(
    fighter.fight_outcome_stats?.FighterWins || 0,
    (fighter.fight_outcome_stats?.FighterLoss || 0) + 
    (fighter.fight_outcome_stats?.FighterKOLoss || 0) + 
    (fighter.fight_outcome_stats?.FighterSUBLoss || 0) + 
    (fighter.fight_outcome_stats?.FighterTKOLoss || 0) + 
    (fighter.fight_outcome_stats?.FighterUDLoss || 0) + 
    (fighter.fight_outcome_stats?.FighterSplitDecLoss || 0) + 
    (fighter.fight_outcome_stats?.FighterMajDecLoss || 0)
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#0A0E17',
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
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          bgcolor: 'transparent',
          position: 'relative',
          mb: 4,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 240, 255, 0.05) 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
            zIndex: -1,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2 }}>
          {/* Back Button */}
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
            sx={{ 
              color: '#00F0FF',
              mb: 3,
              borderRadius: '8px',
              px: 2,
              py: 1,
              '&:hover': {
                bgcolor: 'rgba(0, 240, 255, 0.1)',
                transform: 'translateX(-4px)',
              },
              transition: 'all 0.2s ease-in-out',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Back to Fighters
          </Button>

          {/* Fighter Info Container */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: 'rgba(10, 14, 23, 0.8)',
              borderRadius: '16px',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              p: 4,
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #00F0FF 0%, rgba(0, 240, 255, 0.1) 100%)',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '2px',
                height: '100%',
                background: 'linear-gradient(180deg, #00F0FF 0%, rgba(0, 240, 255, 0.1) 100%)',
              }
            }}
          >
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
              {/* Fighter Image */}
              {fighter.Image && (
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid rgba(0, 240, 255, 0.3)',
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)',
                    flexShrink: 0,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      boxShadow: 'inset 0 0 20px rgba(0, 240, 255, 0.2)',
                      pointerEvents: 'none',
                    }
                  }}
                >
                  <img
                    src={fighter.Image}
                    alt={fighter.fighterName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              )}
              
              {/* Fighter Info */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    color: '#fff',
                    fontWeight: 700,
                    mb: 1,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  {fighter.fighterName || fighter.name}
                  {fighter.nickname && (
                    <Typography
                      component="span"
                      variant="h5"
                      sx={{
                        color: 'rgba(0, 240, 255, 0.8)',
                        fontStyle: 'italic',
                        fontWeight: 500,
                      }}
                    >
                      "{fighter.nickname}"
                    </Typography>
                  )}
                </Typography>

                {/* Fighter Details Grid */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 3,
                  mb: 3,
                  mt: 2,
                  bgcolor: 'rgba(0, 240, 255, 0.03)',
                  p: 3,
                  borderRadius: '12px',
                }}>
                  {/* Physical Stats */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {fighter.height && (
                      <Typography variant="body1" sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <strong style={{ color: '#00F0FF', minWidth: '80px' }}>Height:</strong> {fighter.height}
                      </Typography>
                    )}
                    {fighter.reach && (
                      <Typography variant="body1" sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <strong style={{ color: '#00F0FF', minWidth: '80px' }}>Reach:</strong> {fighter.reach}
                      </Typography>
                    )}
                    {fighter.weight && (
                      <Typography variant="body1" sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <strong style={{ color: '#00F0FF', minWidth: '80px' }}>Weight:</strong> {fighter.weight}
                      </Typography>
                    )}
                    {fighter.weightClass && (
                      <Typography variant="body1" sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <strong style={{ color: '#00F0FF', minWidth: '80px' }}>Division:</strong> {fighter.weightClass}
                      </Typography>
                    )}
                  </Box>

                  {/* Personal Info */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {fighter.country && (
                      <Typography variant="body1" sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <strong style={{ color: '#00F0FF', minWidth: '80px' }}>Origin:</strong> {fighter.country}
                      </Typography>
                    )}
                    {fighter.team && (
                      <Typography variant="body1" sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <strong style={{ color: '#00F0FF', minWidth: '80px' }}>Team:</strong> {fighter.team}
                      </Typography>
                    )}
                    {fighter.stance && (
                      <Typography variant="body1" sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <strong style={{ color: '#00F0FF', minWidth: '80px' }}>Stance:</strong> {fighter.stance}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Stats Chips */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  alignItems: 'center', 
                  flexWrap: 'wrap',
                  mt: 3,
                }}>
                  <Chip 
                    label={`Record: ${record}`} 
                    sx={{ 
                      bgcolor: 'rgba(0, 240, 255, 0.1)', 
                      color: '#00F0FF',
                      fontWeight: 600,
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      px: 1,
                      '&:hover': {
                        bgcolor: 'rgba(0, 240, 255, 0.15)',
                      }
                    }} 
                  />
                  <Chip 
                    label={`${fighter.FightsTracked || 0} fights tracked`} 
                    sx={{ 
                      bgcolor: 'rgba(0, 240, 255, 0.1)', 
                      color: '#00F0FF',
                      fontWeight: 600,
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      px: 1,
                      '&:hover': {
                        bgcolor: 'rgba(0, 240, 255, 0.15)',
                      }
                    }} 
                  />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Paper>

      {/* Tabs Navigation */}
      <Container maxWidth="lg">
        <Box sx={{ 
          borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
          mb: 4,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -1,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.5), transparent)',
          }
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.7)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#00F0FF',
                  bgcolor: 'rgba(0, 240, 255, 0.1)',
                },
              },
              '& .Mui-selected': {
                color: '#00F0FF !important',
                textShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#00F0FF',
                height: 3,
                borderRadius: '3px 3px 0 0',
                boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={tab.label}
                icon={tab.icon} 
                iconPosition="start" 
                label={tab.label} 
                sx={{ gap: 1 }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Panels */}
        {tabs.map((tab, index) => (
          <TabPanel key={tab.label} value={tabValue} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Container>
    </Box>
  );
};

export default FighterDetailPage; 