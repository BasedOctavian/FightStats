import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Grid,
  Chip,
  Link,
  Fade,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  EmojiEvents as TitleIcon,
  Timer as TimerIcon,
  Sports as FightIcon,
  Assessment as StatsIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import LoadingScreen from '../../components/common/LoadingScreen';
import { useFightByFightCode } from '../../hooks/useFights';
import { useFightersByIds, useFighterByCode } from '../../hooks/useFighters';
import { useEvents } from '../../hooks/useEvents';
import { useFightStats } from '../../hooks/useFights';
import { useWeightClass } from '../../hooks/useWeightClass';
import FightStats from '../../components/fight/FightStats';
import BasicInfoForFight from '../../components/fight/BasicInfoForFight';

// Common styles
const cardStyle = {
  p: 4,
  bgcolor: 'rgba(10, 14, 23, 0.8)',
  borderRadius: '12px',
  border: '1px solid rgba(0, 240, 255, 0.15)',
  height: '100%',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    bgcolor: 'rgba(10, 14, 23, 0.9)',
    border: '1px solid rgba(0, 240, 255, 0.3)',
    '& .glow-effect': {
      opacity: 1,
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, rgba(0, 240, 255, 0), rgba(0, 240, 255, 0.5), rgba(0, 240, 255, 0))',
  }
};

const glowEffect = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.1), transparent 70%)',
  opacity: 0,
  transition: 'opacity 0.3s ease-in-out',
  pointerEvents: 'none',
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <Fade in={value === index} timeout={600} easing="cubic-bezier(0.4, 0, 0.2, 1)">
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`fight-tabpanel-${index}`}
        aria-labelledby={`fight-tab-${index}`}
        {...other}
        style={{ 
          display: value === index ? 'block' : 'none',
          animation: value === index ? 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
        }}
      >
        {value === index && children}
      </div>
    </Fade>
  );
};

const FightDetailPage: React.FC = (): JSX.Element => {
  const { encodedFightCode } = useParams<{ encodedFightCode: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const loadingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const hasInitiallyLoaded = React.useRef(false);
  const minLoadingTimeRef = React.useRef<NodeJS.Timeout | null>(null);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const decodeFightCode = (encoded: string): string => {
    try {
      return atob(encoded);
    } catch (error) {
      console.error('Error decoding fight code:', error);
      return 'Invalid Fight Code';
    }
  };

  const decodedFightCode = encodedFightCode ? decodeFightCode(encodedFightCode) : 'No Fight Code Provided';
  const { fight, loading: fightLoading, error: fightError } = useFightByFightCode(decodedFightCode);
  const { fightStats, loading: statsLoading, error: statsError } = useFightStats(decodedFightCode);
  
  // Add hooks for individual fighters using fighterCode
  const { fighter: fighterA, loading: loadingFighterA } = useFighterByCode(fight?.fighterA || null);
  const { fighter: fighterB, loading: loadingFighterB } = useFighterByCode(fight?.fighterB || null);

  // Effect to print fighter details
  useEffect(() => {
    if (!loadingFighterA && fighterA) {
      console.log('Fighter A Document:', fighterA);
    }
    if (!loadingFighterB && fighterB) {
      console.log('Fighter B Document:', fighterB);
    }
  }, [fighterA, fighterB, loadingFighterA, loadingFighterB]);

  // Memoize the arrays to prevent infinite loops
  const fighterCodes = useMemo(() => 
    fight ? [fight.fighterA, fight.fighterB] : []
  , [fight?.fighterA, fight?.fighterB]);

  const eventCodes = useMemo(() => 
    fight ? [fight.eventCode] : []
  , [fight?.eventCode]);

  // Fetch fighters data
  const { fighters, loading: fightersLoading, error: fightersError } = useFightersByIds(fighterCodes);

  // Fetch event data
  const { events: eventDataMap, loading: eventLoading, error: eventError } = useEvents(eventCodes);

  // Get weight class data for the fight
  const weightClassName = useMemo(() => {
    return fight?.weightClass || null;
  }, [fight?.weightClass]);

  const { weightClass: weightClassData, loading: weightClassLoading, error: weightClassError } = useWeightClass(weightClassName);

  // Reset loading state when fight code changes
  useEffect(() => {
    setTabValue(0);
    setShowLoading(true);
    setMinTimeElapsed(false);
    hasInitiallyLoaded.current = false;
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (minLoadingTimeRef.current) {
      clearTimeout(minLoadingTimeRef.current);
      minLoadingTimeRef.current = null;
    }
  }, [encodedFightCode]);

  const handleBackClick = () => {
    navigate(-1);
  };

  // Debounced loading logic to prevent stuttering
  const isLoading = fightLoading || statsLoading || loadingFighterA || loadingFighterB || fightersLoading || eventLoading || weightClassLoading;
  
  React.useEffect(() => {
    // Set minimum loading time of 1 second
    if (!minLoadingTimeRef.current) {
      minLoadingTimeRef.current = setTimeout(() => {
        setMinTimeElapsed(true);
        minLoadingTimeRef.current = null;
      }, 1000);
    }

    // Hide loading only after minimum time AND data is loaded
    if (!isLoading && showLoading && minTimeElapsed) {
      setShowLoading(false);
      hasInitiallyLoaded.current = true;
    }
    
    return () => {
      if (minLoadingTimeRef.current) {
        clearTimeout(minLoadingTimeRef.current);
        minLoadingTimeRef.current = null;
      }
    };
  }, [isLoading, showLoading, minTimeElapsed]);
  
  if (showLoading) {
    return <LoadingScreen key={`loading-${encodedFightCode}`} message="Loading Fight Data..." showProgress={true} />;
  }

  const error = fightError || statsError || fightersError || eventError || weightClassError;

  if (error || !fight) {
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
              Fight Not Found
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 4 
            }}>
              {error || 'The requested fight could not be found.'}
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
              Back to Previous Page
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  const renderStatItem = (label: string, value: string | number) => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      p: 2,
      bgcolor: 'rgba(0, 240, 255, 0.05)',
      borderRadius: '8px',
      border: '1px solid rgba(0, 240, 255, 0.1)',
    }}>
      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ color: '#00F0FF', fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Box>
  );

  // Get fighter names and event data
  const fighterAData = fighters.find(f => f.fighterCode === fight?.fighterA);
  const fighterBData = fighters.find(f => f.fighterCode === fight?.fighterB);
  const eventData = fight ? eventDataMap.get(fight.eventCode) : undefined;

  const a11yProps = (index: number) => {
    return {
      id: `fight-tab-${index}`,
      'aria-controls': `fight-tabpanel-${index}`,
    };
  };

  // Helper function to render fighter header
  const renderFighterHeader = (fighter: any, isFighterA: boolean) => {
    
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2.5,
        height: '100%',
        minHeight: 160,
      }}>
        {/* Fighter Image */}
        {fighter.Image && (
          <Box
            className="fighter-image"
            sx={{
              width: 140,
              height: 140,
              borderRadius: '16px',
              overflow: 'hidden',
              border: '2px solid rgba(0, 240, 255, 0.3)',
              boxShadow: '0 0 25px rgba(0, 240, 255, 0.15)',
              position: 'relative',
              transition: 'all 0.3s ease',
              flexShrink: 0,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                boxShadow: 'inset 0 0 25px rgba(0, 240, 255, 0.2)',
                pointerEvents: 'none',
              }
            }}
          >
            <img
              src={fighter.Image}
              alt={fighter.fighterName || fighter.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        )}
        
        {/* Fighter Name and Nickname */}
        <Box sx={{ 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          minHeight: 60,
          justifyContent: 'center',
        }}>
          <Typography 
            className="fighter-name"
            variant="h5" 
            sx={{ 
              color: '#fff',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
              transition: 'all 0.3s ease',
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
              lineHeight: 1.2,
              wordBreak: 'break-word',
              hyphens: 'auto',
            }}
          >
            {fighter.fighterName || fighter.name}
          </Typography>
          {fighter.nickname && (
            <Typography
              variant="subtitle1"
              sx={{
                color: 'rgba(0, 240, 255, 0.8)',
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: 1.2,
                wordBreak: 'break-word',
                hyphens: 'auto',
                maxWidth: '100%',
              }}
            >
              "{fighter.nickname}"
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  const renderContent = () => {
    return (
      <Fade in timeout={800}>
        <Box>
          {/* Main Fight Card */}
          <Box sx={{
            ...cardStyle,
            animation: 'slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both',
          }}>
            <Box className="glow-effect" sx={glowEffect} />
            
            {/* Fighter Names Section */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center', 
              gap: 4,
              mb: 4,
              p: 3,
              bgcolor: 'rgba(0, 240, 255, 0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(0, 240, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              animation: 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both',
              minHeight: 200,
            }}>
              {/* Fighter A */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}>
                {fighterAData?.id ? (
                  <Link
                    component={RouterLink}
                    to={`/fighter/${fighterAData.id}`}
                    sx={{
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'center',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        '& .fighter-image': {
                          border: '2px solid rgba(0, 240, 255, 0.5)',
                          boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)',
                        },
                        '& .fighter-name': {
                          color: '#00F0FF',
                          textShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
                        }
                      }
                    }}
                  >
                    {renderFighterHeader(fighterAData, true)}
                  </Link>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: '#fff',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                      }}
                    >
                      {fight.fighterA}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* VS - Centered */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                px: 4,
                py: 2,
                position: 'relative',
                height: '100%',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '-2px',
                  right: '-2px',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.3), transparent)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: '50%',
                  width: '1px',
                  background: 'linear-gradient(180deg, transparent, rgba(0, 240, 255, 0.3), transparent)',
                }
              }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    color: 'rgba(0, 240, 255, 0.9)',
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    userSelect: 'none',
                    textTransform: 'uppercase',
                    textShadow: '0 0 30px rgba(0, 240, 255, 0.6)',
                    zIndex: 1,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    lineHeight: 1,
                    mb: 1,
                  }}
                >
                  VS
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    zIndex: 1,
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {fight.weightClass} • {fight.gender}
                </Typography>
              </Box>

              {/* Fighter B */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}>
                {fighterBData?.id ? (
                  <Link
                    component={RouterLink}
                    to={`/fighter/${fighterBData.id}`}
                    sx={{
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'center',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        '& .fighter-image': {
                          border: '2px solid rgba(0, 240, 255, 0.5)',
                          boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)',
                        },
                        '& .fighter-name': {
                          color: '#00F0FF',
                          textShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
                        }
                      }
                    }}
                  >
                    {renderFighterHeader(fighterBData, false)}
                  </Link>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: '#fff',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                      }}
                    >
                      {fight.fighterB}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Fight Info Section */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              mb: 4,
              position: 'relative',
              animation: 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.2), transparent)',
                zIndex: 0,
              }
            }}>
              {/* Fight Info Chips */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 2,
                flexWrap: 'wrap',
                zIndex: 1,
                animation: 'slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.8s both',
              }}>
                <Chip 
                  label={fight.weightClass}
                  sx={{ 
                    bgcolor: 'rgba(0, 240, 255, 0.08)',
                    color: '#fff',
                    border: '1px solid rgba(0, 240, 255, 0.15)',
                    borderRadius: '6px',
                    height: '32px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(8px)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 240, 255, 0.12)',
                      border: '1px solid rgba(0, 240, 255, 0.25)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 240, 255, 0.15)',
                    }
                  }}
                />
                <Chip 
                  label={fight.gender}
                  sx={{ 
                    bgcolor: 'rgba(0, 240, 255, 0.08)',
                    color: '#fff',
                    border: '1px solid rgba(0, 240, 255, 0.15)',
                    borderRadius: '6px',
                    height: '32px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(8px)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 240, 255, 0.12)',
                      border: '1px solid rgba(0, 240, 255, 0.25)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 240, 255, 0.15)',
                    }
                  }}
                />
                {fight.isTitleFight === 'Yes' && (
                  <Chip 
                    icon={<TitleIcon sx={{ color: '#FFD700 !important' }} />}
                    label="Title Fight"
                    sx={{ 
                      bgcolor: 'rgba(255, 215, 0, 0.08)',
                      color: '#FFD700',
                      border: '1px solid rgba(255, 215, 0, 0.25)',
                      borderRadius: '6px',
                      height: '32px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(8px)',
                      '& .MuiChip-icon': {
                        color: '#FFD700',
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255, 215, 0, 0.12)',
                        border: '1px solid rgba(255, 215, 0, 0.35)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(255, 215, 0, 0.15)',
                      }
                    }}
                  />
                )}
              </Box>

                                                           {/* Fight Stats Grid */}
                <Grid container spacing={2} sx={{ 
                  maxWidth: '1000px', 
                  margin: '0 auto', 
                  zIndex: 1,
                  animation: 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1.0s both',
                }}>
                 {[
                   { 
                     label: 'Method of Finish',
                     value: fight.methodOfFinish,
                     icon: <FightIcon sx={{ fontSize: 24, color: 'rgba(0, 240, 255, 0.7)' }} />
                   },
                   { 
                     label: 'Final Round Time',
                     value: fight.finalRoundTime,
                     icon: <TimerIcon sx={{ fontSize: 24, color: 'rgba(0, 240, 255, 0.7)' }} />
                   },
                   { 
                     label: 'Rounds',
                     value: fight.actualRounds,
                     subValue: fight.scheduledRounds,
                     icon: <StatsIcon sx={{ fontSize: 24, color: 'rgba(0, 240, 255, 0.7)' }} />
                   }
                 ].map((stat, index) => (
                                                                           <Grid item xs={12} sm={6} md={4} key={index}>
                                          <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                        p: 2.5,
                        minHeight: 160,
                        height: '100%',
                        bgcolor: 'rgba(0, 240, 255, 0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(0, 240, 255, 0.08)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(8px)',
                        animation: `slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${1.2 + (index * 0.1)}s both`,
                       '&:hover': {
                         bgcolor: 'rgba(0, 240, 255, 0.05)',
                         border: '1px solid rgba(0, 240, 255, 0.15)',
                         transform: 'translateY(-2px)',
                         boxShadow: '0 8px 24px rgba(0, 240, 255, 0.1)',
                         '& .stat-icon': {
                           transform: 'scale(1.1)',
                           color: 'rgba(0, 240, 255, 0.9)',
                         },
                         '& .stat-value': {
                           color: '#fff',
                           textShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                         }
                       },
                       '&::before': {
                         content: '""',
                         position: 'absolute',
                         top: 0,
                         left: 0,
                         right: 0,
                         height: '2px',
                         background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.2), transparent)',
                       }
                     }}>
                      <Box className="stat-icon" sx={{ 
                        transition: 'all 0.3s ease',
                        mb: 1
                      }}>
                        {stat.icon}
                      </Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          textAlign: 'center',
                        }}
                      >
                        {stat.label}
                      </Typography>
                                             <Typography 
                         className="stat-value"
                         variant="h6" 
                         sx={{ 
                           color: 'rgba(255, 255, 255, 0.9)',
                           fontWeight: 600,
                           letterSpacing: '0.02em',
                           textAlign: 'center',
                           transition: 'all 0.3s ease',
                         }}
                       >
                         {stat.value}
                       </Typography>
                                               {stat.subValue && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.5)',
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                              textAlign: 'center',
                            }}
                          >
                            Scheduled for: <span style={{ color: 'rgba(0, 240, 255, 0.8)', fontWeight: 600 }}>{stat.subValue}</span>
                          </Typography>
                        )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Event Info */}
            <Box 
              sx={{ 
                textAlign: 'center',
                mt: 4,
                p: 3,
                bgcolor: 'rgba(0, 240, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(0, 240, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s ease',
                animation: 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1.6s both',
                '&:hover': {
                  bgcolor: 'rgba(0, 240, 255, 0.05)',
                  border: '1px solid rgba(0, 240, 255, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0, 240, 255, 0.1)',
                }
              }}
            >
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '1rem',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  mb: 1,
                }}
              >
                Event
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: '#fff',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  mb: eventData?.Date ? 2 : 0,
                }}
              >
                {eventData?.id ? (
                  <Link
                    component={RouterLink}
                    to={`/event/${eventData.id}`}
                    sx={{
                      color: '#fff',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#00F0FF',
                        textShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                      }
                    }}
                  >
                    {eventData.EventName || fight.eventCode}
                  </Link>
                ) : (
                  <span>{fight.eventCode}</span>
                )}
              </Typography>
              {eventData?.Date && (
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '0.02em',
                  }}
                >
                  {new Date(eventData.Date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Statistics Section */}
          <Box sx={{ 
            mt: 6,
            animation: 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1.8s both',
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#fff',
                fontWeight: 700,
                mb: 3,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                animation: 'slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 2.0s both',
              }}
            >
              Fight Analysis
            </Typography>

            {/* Tabs Navigation */}
            <Box sx={{ 
              borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
              mb: 4,
              position: 'relative',
              animation: 'slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 2.2s both',
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
                    minHeight: 64,
                    fontSize: '0.9rem',
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
                <Tab 
                  icon={<StatsIcon />} 
                  iconPosition="start" 
                  label="Fight Stats" 
                  {...a11yProps(0)}
                  sx={{ 
                    gap: 1,
                    animation: 'slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 2.4s both',
                  }}
                />
                <Tab 
                  icon={<InfoIcon />} 
                  iconPosition="start" 
                  label={fighterAData?.fighterName || fight.fighterA} 
                  {...a11yProps(1)}
                  sx={{ 
                    gap: 1,
                    animation: 'slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 2.6s both',
                  }}
                />
                <Tab 
                  icon={<InfoIcon />} 
                  iconPosition="start" 
                  label={fighterBData?.fighterName || fight.fighterB} 
                  {...a11yProps(2)}
                  sx={{ 
                    gap: 1,
                    animation: 'slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 2.8s both',
                  }}
                />
              </Tabs>
            </Box>

            {/* Tab Panels */}
            <Box sx={{ animation: 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 3.0s both' }}>
              <TabPanel value={tabValue} index={0}>
              {fightStats && (
                <FightStats 
                  fightStats={{
                    ...fightStats,
                    fighterAName: fighterAData?.fighterName || fighterAData?.name || fight.fighterA,
                    fighterBName: fighterBData?.fighterName || fighterBData?.name || fight.fighterB,
                    weightClass: fight.weightClass,
                    methodOfFinish: fight.methodOfFinish,
                  }}
                  weightClassAvgData={weightClassData}
                />
              )}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {fighterAData && fightStats && (
                <BasicInfoForFight 
                  fighter={fighterAData} 
                  fightStats={{
                    totalStrikes: {
                      thrown: fightStats.fighterA_total_strikes_thrown || 0,
                      landed: fightStats.fighterA_total_strikes_landed || 0
                    },
                    groundStrikes: {
                      thrown: fightStats.fighterA_ground_strikes_thrown || 0,
                      landed: fightStats.fighterA_ground_strikes_landed || 0
                    },
                    clinchStrikes: {
                      thrown: fightStats.fighterA_clinch_strikes_thrown || 0,
                      landed: fightStats.fighterA_clinch_strikes_landed || 0
                    },
                    takedowns: {
                      attempted: fightStats.fighterA_takedowns_attempted || 0,
                      successful: fightStats.fighterA_takedowns_successful || 0
                    },
                    submissions: {
                      attempted: fightStats.fighterA_submissions_attempted || 0,
                      successful: fightStats.fighterA_submissions_successful || 0
                    }
                  }}
                  fightData={fightStats}
                  isAFighter={true}
                />
              )}
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              {fighterBData && fightStats && (
                <BasicInfoForFight 
                  fighter={fighterBData}
                  fightStats={{
                    totalStrikes: {
                      thrown: fightStats.fighterB_total_strikes_thrown || 0,
                      landed: fightStats.fighterB_total_strikes_landed || 0
                    },
                    groundStrikes: {
                      thrown: fightStats.fighterB_ground_strikes_thrown || 0,
                      landed: fightStats.fighterB_ground_strikes_landed || 0
                    },
                    clinchStrikes: {
                      thrown: fightStats.fighterB_clinch_strikes_thrown || 0,
                      landed: fightStats.fighterB_clinch_strikes_landed || 0
                    },
                    takedowns: {
                      attempted: fightStats.fighterB_takedowns_attempted || 0,
                      successful: fightStats.fighterB_takedowns_successful || 0
                    },
                    submissions: {
                      attempted: fightStats.fighterB_submissions_attempted || 0,
                      successful: fightStats.fighterB_submissions_successful || 0
                    }
                  }}
                  fightData={fightStats}
                  isAFighter={false}
                />
              )}
            </TabPanel>
            </Box>
          </Box>
        </Box>
      </Fade>
    );
  };

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
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackClick}
              sx={{ 
                color: '#00F0FF',
                '&:hover': {
                  bgcolor: 'rgba(0, 240, 255, 0.1)'
                }
              }}
            >
              Back
            </Button>
            <Box sx={{ flexGrow: 1 }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: '#fff',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                  mb: 2,
                }}
              >
                Fight Details
              </Typography>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg">
        {renderContent()}
      </Container>
    </Box>
  );
};

export default FightDetailPage; 