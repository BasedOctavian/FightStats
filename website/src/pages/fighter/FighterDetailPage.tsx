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
  Skeleton,
} from '@mui/material';
import LoadingScreen from '../../components/common/LoadingScreen';

import {
  ArrowBack as ArrowBackIcon,
  Analytics as AnalyticsIcon,
  History as HistoryIcon,
  SportsMartialArts as StrikingIcon,
  Sports as GrapplingIcon,
  DirectionsRun as MovementIcon,
  Bolt as ComboIcon,
} from '@mui/icons-material';
import { useFighter, useFightersByIds } from '../../hooks/useFighters';
import { useFighterFights } from '../../hooks/useFights';
import BasicInfo from '../../components/fighter/BasicInfo';
import FightHistory from '../../components/fighter/FightHistory';
import StrikingInfo from '../../components/fighter/StrikingInfo';
import GrapplingInfo from '../../components/fighter/GrapplingInfo';
import MovementInfo from '../../components/fighter/MovementInfo';
import ComboInfo from '../../components/fighter/ComboInfo';
import { useWeightClass } from '../../hooks/useWeightClass';
import { colors } from '../../theme/colors';

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
    <Fade in={value === index} timeout={600} easing="cubic-bezier(0.4, 0, 0.2, 1)">
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`fighter-tabpanel-${index}`}
        aria-labelledby={`fighter-tab-${index}`}
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

interface WeightClassData {
  kowins?: number;
  tkowins?: number;
  subwin?: number;
  decwin?: number;
}

// Skeleton components for fighter info
const FighterInfoSkeleton: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: colors.background,
      background: colors.gradientPrimary,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '400px',
        background: colors.gradientSecondary,
        pointerEvents: 'none',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '20%',
        right: '-10%',
        width: '300px',
        height: '300px',
        background: colors.radialPrimary,
        animation: 'pulse 6s ease-in-out infinite',
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
            background: colors.gradientTertiary,
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${colors.borderPrimary}`,
            zIndex: -1,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2 }}>
          {/* Back Button Skeleton */}
          <Skeleton
            variant="rectangular"
            width={150}
            height={40}
            sx={{ 
              mb: 3,
              borderRadius: '8px',
              bgcolor: colors.overlayPrimary,
            }}
          />

          {/* Fighter Info Container Skeleton */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: colors.backgroundTertiary,
              borderRadius: '20px',
              border: `1px solid ${colors.borderPrimary}`,
              p: 4,
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
              {/* Fighter Image Skeleton */}
              <Skeleton
                variant="rectangular"
                width={200}
                height={200}
                sx={{ 
                  borderRadius: '12px',
                  bgcolor: colors.overlayPrimary,
                  flexShrink: 0,
                }}
              />
              
              {/* Fighter Info Skeleton */}
              <Box sx={{ flexGrow: 1 }}>
                {/* Name Skeleton */}
                <Skeleton
                  variant="text"
                  width="60%"
                  height={48}
                  sx={{ 
                    mb: 1,
                    bgcolor: colors.overlayPrimary,
                  }}
                />
                
                {/* Nickname Skeleton */}
                <Skeleton
                  variant="text"
                  width="40%"
                  height={32}
                  sx={{ 
                    mb: 3,
                    bgcolor: colors.overlayPrimary,
                  }}
                />

                {/* Fighter Details Grid Skeleton */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 3,
                  mb: 3,
                  mt: 2,
                  bgcolor: colors.overlayTertiary,
                  p: 3,
                  borderRadius: '16px',
                  border: `1px solid ${colors.borderSecondary}`,
                  backdropFilter: 'blur(10px)',
                }}>
                  {/* Physical Stats Skeleton */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Skeleton
                          variant="text"
                          width={80}
                          height={24}
                          sx={{ bgcolor: colors.overlayPrimary }}
                        />
                        <Skeleton
                          variant="text"
                          width="60%"
                          height={24}
                          sx={{ bgcolor: colors.overlayPrimary }}
                        />
                      </Box>
                    ))}
                  </Box>

                  {/* Personal Info Skeleton */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[1, 2, 3].map((i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Skeleton
                          variant="text"
                          width={80}
                          height={24}
                          sx={{ bgcolor: colors.overlayPrimary }}
                        />
                        <Skeleton
                          variant="text"
                          width="70%"
                          height={24}
                          sx={{ bgcolor: colors.overlayPrimary }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Stats Chips Skeleton */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  alignItems: 'center', 
                  flexWrap: 'wrap',
                  mt: 3,
                }}>
                  <Skeleton
                    variant="rectangular"
                    width={120}
                    height={32}
                    sx={{ 
                      borderRadius: '16px',
                      bgcolor: colors.overlayPrimary,
                    }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={140}
                    height={32}
                    sx={{ 
                      borderRadius: '16px',
                      bgcolor: colors.overlayPrimary,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Paper>

      {/* Tabs Navigation Skeleton */}
      <Container maxWidth="lg">
        <Box sx={{ 
          borderBottom: `1px solid ${colors.borderPrimary}`,
          mb: 4,
          position: 'relative',
        }}>
          <Box sx={{ display: 'flex', gap: 2, overflow: 'hidden' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={120}
                height={48}
                sx={{ 
                  borderRadius: '8px 8px 0 0',
                  bgcolor: colors.overlayPrimary,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Tab Content Skeleton */}
        <Box sx={{ mt: 4 }}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={400}
            sx={{ 
              borderRadius: '12px',
              bgcolor: colors.overlayPrimary,
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

const FighterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { fighter, loading, error } = useFighter(id || null);
  const [tabValue, setTabValue] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const loadingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const hasInitiallyLoaded = React.useRef(false);
  const minLoadingTimeRef = React.useRef<NodeJS.Timeout | null>(null);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

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

  // Get fighter's fights for resume rating calculation
  const { fights, loading: fightsLoading } = useFighterFights(fighter?.fighterCode || null);
  
  // Get unique opponent codes from fights
  const opponentCodes = React.useMemo(() => {
    if (!fights) return [];
    const opponentSet = new Set(fights.map(fight => 
      fighter?.fighterCode && fight.fighterA === fighter.fighterCode ? fight.fighterB : fight.fighterA
    ));
    return Array.from(opponentSet);
  }, [fights, fighter?.fighterCode]);

  // Fetch all opponent data
  const { fighters: opponents, loading: opponentsLoading } = useFightersByIds(opponentCodes);

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

  // Define tabs - Overview, Striking, Grappling, Movement, Combinations, and Fight History
  const tabs = useMemo(() => {
    if (!fighter) return [];
    
    return [
      {
        icon: <AnalyticsIcon />,
        label: "Overview",
        component: <BasicInfo 
          fighter={fighter} 
          weightClassAvgData={weightClassData}
          fights={fights}
          opponents={opponents}
        />
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
        icon: <ComboIcon />,
        label: "Combinations",
        component: <ComboInfo fighter={fighter} weightClassAvgData={weightClassData} />
      },
      {
        icon: <HistoryIcon />,
        label: "Fight History",
        component: <FightHistory fighter={fighter} weightClassAvgData={weightClassData} />
      }
    ];
  }, [fighter, weightClassData]);

  // Reset tab and loading state when fighter ID changes
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
    // Scroll to top when fighter ID changes (new page load)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Scroll to top when switching tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackClick = () => {
    navigate('/');
  };

  // Debounced loading logic to prevent stuttering
  const isLoading = loading || weightClassLoading || fightsLoading || opponentsLoading;
  
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
  
  // Show skeleton loading instead of full loading screen
  if (showLoading) {
    return <FighterInfoSkeleton />;
  }

  if (error || !fighter) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: colors.background,
        background: colors.gradientPrimary,
      }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ 
            textAlign: 'center',
            p: 4,
            bgcolor: colors.overlaySecondary,
            borderRadius: '12px',
            border: `1px solid ${colors.borderSecondary}`,
            backdropFilter: 'blur(10px)',
          }}>
            <Typography variant="h4" sx={{ 
              color: colors.primary,
              mb: 2,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}>
              Fighter Not Found
            </Typography>
            <Typography variant="body1" sx={{ 
              color: colors.textTertiary,
              mb: 4 
            }}>
              {error || 'The requested fighter could not be found.'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackClick}
              sx={{ 
                color: colors.primary,
                borderColor: colors.primary,
                '&:hover': {
                  borderColor: colors.primary,
                  bgcolor: colors.overlayPrimary,
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
      bgcolor: colors.background,
      background: colors.gradientPrimary,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '400px',
        background: colors.gradientSecondary,
        pointerEvents: 'none',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '20%',
        right: '-10%',
        width: '300px',
        height: '300px',
        background: colors.radialPrimary,
        animation: 'pulse 6s ease-in-out infinite',
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
            background: colors.gradientTertiary,
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${colors.borderPrimary}`,
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
              color: colors.primary,
              mb: 3,
              borderRadius: '8px',
              px: 2,
              py: 1,
              '&:hover': {
                bgcolor: colors.overlayPrimary,
                transform: 'translateX(-4px)',
                boxShadow: `0 4px 12px ${colors.shadowSecondary}`,
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
              bgcolor: colors.backgroundTertiary,
              borderRadius: '20px',
              border: `1px solid ${colors.borderPrimary}`,
              p: 4,
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: colors.borderTertiary,
                transform: 'translateY(-4px) scale(1.02)',
                boxShadow: `0 12px 40px ${colors.shadowTertiary}`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: colors.gradientBorder,
                animation: 'shimmer 3s ease-in-out infinite',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '2px',
                height: '100%',
                background: colors.gradientVertical,
              },
              '&:hover::before': {
                background: colors.gradientBorderHover,
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
                    border: `2px solid ${colors.borderTertiary}`,
                    boxShadow: `0 0 20px ${colors.shadowPrimary}`,
                    flexShrink: 0,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      boxShadow: `inset 0 0 20px ${colors.shadowSecondary}`,
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
                    color: colors.textPrimary,
                    fontWeight: 700,
                    mb: 1,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textShadow: `0 0 20px ${colors.shadowSecondary}`,
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
                        color: colors.primaryLight,
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
                  bgcolor: colors.overlayTertiary,
                  p: 3,
                  borderRadius: '16px',
                  border: `1px solid ${colors.borderSecondary}`,
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: colors.overlaySecondary,
                    borderColor: colors.borderPrimary,
                  }
                }}>
                  {/* Physical Stats */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {fighter.height && (
                      <Typography variant="body1" sx={{ 
                        color: colors.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <strong style={{ color: colors.primary, minWidth: '80px' }}>Height:</strong> {fighter.height}
                      </Typography>
                    )}
                    {fighter.reach && (
                      <Typography variant="body1" sx={{ 
                        color: colors.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <strong style={{ color: colors.primary, minWidth: '80px' }}>Reach:</strong> {fighter.reach}
                      </Typography>
                    )}
                    {fighter.weight && (
                      <Typography variant="body1" sx={{ 
                        color: colors.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <strong style={{ color: colors.primary, minWidth: '80px' }}>Weight:</strong> {fighter.weight}
                      </Typography>
                    )}
                    {fighter.weightClass && (
                      <Typography variant="body1" sx={{ 
                        color: colors.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <strong style={{ color: colors.primary, minWidth: '80px' }}>Division:</strong> {fighter.weightClass}
                      </Typography>
                    )}
                  </Box>

                  {/* Personal Info */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {fighter.country && (
                      <Typography variant="body1" sx={{ 
                        color: colors.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <strong style={{ color: colors.primary, minWidth: '80px' }}>Origin:</strong> {fighter.country}
                      </Typography>
                    )}
                    {fighter.team && (
                      <Typography variant="body1" sx={{ 
                        color: colors.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <strong style={{ color: colors.primary, minWidth: '80px' }}>Team:</strong> {fighter.team}
                      </Typography>
                    )}
                    {fighter.stance && (
                      <Typography variant="body1" sx={{ 
                        color: colors.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <strong style={{ color: colors.primary, minWidth: '80px' }}>Stance:</strong> {fighter.stance}
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
                      bgcolor: colors.overlayPrimary, 
                      color: colors.primary,
                      fontWeight: 600,
                      border: `1px solid ${colors.borderTertiary}`,
                      px: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: colors.overlayHover,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${colors.shadowSecondary}`,
                      }
                    }} 
                  />
                  <Chip 
                    label={`${fighter.FightsTracked || 0} fights tracked`} 
                    sx={{ 
                      bgcolor: colors.overlayPrimary, 
                      color: colors.primary,
                      fontWeight: 600,
                      border: `1px solid ${colors.borderTertiary}`,
                      px: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: colors.overlayHover,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${colors.shadowSecondary}`,
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
          borderBottom: `1px solid ${colors.borderPrimary}`,
          mb: 4,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -1,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, ${colors.primary}, transparent)`,
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
                color: colors.textTertiary,
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: colors.primary,
                  bgcolor: colors.overlayPrimary,
                },
              },
              '& .Mui-selected': {
                color: `${colors.primary} !important`,
                textShadow: `0 0 10px ${colors.shadowSecondary}`,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: colors.primary,
                height: 3,
                borderRadius: '3px 3px 0 0',
                boxShadow: `0 0 10px ${colors.shadowSecondary}`,
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