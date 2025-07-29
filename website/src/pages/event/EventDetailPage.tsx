import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  useTheme,
  Tabs,
  Tab,
  Fade,
  Grid,
  Card,
  CardContent,
  CardActions,
  Link,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  SportsKabaddi as FightsIcon,
  CalendarToday as CalendarIcon,
  Group as FansIcon,
  AttachMoney as PPVIcon,
  Info as InfoIcon,
  EmojiEvents as TitleIcon,
  Timer as TimerIcon,
  Assessment as StatsIcon,
} from '@mui/icons-material';
import { useEventById } from '../../hooks/useEvents';
import { useEventFights } from '../../hooks/useFights';
import { useFightersByIds } from '../../hooks/useFighters';

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
        id={`event-tabpanel-${index}`}
        aria-labelledby={`event-tab-${index}`}
        {...other}
        style={{ display: value === index ? 'block' : 'none' }}
      >
        {value === index && children}
      </div>
    </Fade>
  );
};

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { event, loading: eventLoading, error: eventError } = useEventById(id || null);
  const { fights, loading: fightsLoading, error: fightsError } = useEventFights(event?.eventCode || null);

  // Get unique fighter codes from all fights
  const fighterCodes = useMemo(() => {
    if (!fights) return [];
    const codes = new Set<string>();
    fights.forEach(fight => {
      codes.add(fight.fighterA);
      codes.add(fight.fighterB);
    });
    return Array.from(codes);
  }, [fights]);

  // Fetch all fighter data
  const { 
    fighters: fightersData, 
    loading: fightersLoading, 
    error: fightersError 
  } = useFightersByIds(fighterCodes);

  // Create maps for quick lookup
  const fighterMaps = useMemo(() => {
    const nameMap = new Map<string, string>();
    const idMap = new Map<string, string>();
    fightersData.forEach(fighter => {
      if (fighter.fighterCode) {
        nameMap.set(fighter.fighterCode, fighter.fighterName || fighter.name || 'Unknown Fighter');
        if (fighter.id) {
          idMap.set(fighter.fighterCode, fighter.id);
        }
      }
    });
    return { nameMap, idMap };
  }, [fightersData]);

  const [tabValue, setTabValue] = useState(0);

  // Reset tab when event ID changes
  useEffect(() => {
    setTabValue(0);
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'KO':
      case 'TKO':
        return '#FF4444';
      case 'SUB':
        return '#44FF44';
      case 'DEC':
        return '#4444FF';
      default:
        return '#FFFFFF';
    }
  };

  const encodeFightCode = (fightCode: string): string => {
    return btoa(fightCode);
  };

  if (eventLoading || fightsLoading || fightersLoading) {
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

  if (eventError || fightsError || fightersError || !event) {
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
              Event Not Found
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 4 
            }}>
              {eventError || fightsError || 'The requested event could not be found.'}
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

  const renderFighterName = (fighterCode: string) => {
    const fighterId = fighterMaps.idMap.get(fighterCode);
    const fighterName = fighterMaps.nameMap.get(fighterCode) || fighterCode;

    return fighterId ? (
      <Link
        component={RouterLink}
        to={`/fighter/${fighterId}`}
        sx={{
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#00F0FF',
            textDecoration: 'none',
            textShadow: '0 0 8px rgba(0, 240, 255, 0.5)',
          }
        }}
      >
        {fighterName}
      </Link>
    ) : (
      <Typography sx={{ color: '#fff', fontWeight: 600 }}>
        {fighterName}
      </Typography>
    );
  };

  const FightCard = ({ fight }: { fight: any }) => (
    <Card sx={{ 
      bgcolor: 'rgba(0, 240, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0, 240, 255, 0.1)',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: 'rgba(0, 240, 255, 0.1)',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 20px rgba(0, 240, 255, 0.2)',
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {fight.isTitleFight === 'Yes' && (
              <TitleIcon sx={{ color: '#00F0FF' }} />
            )}
            <Typography variant="subtitle2" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              {fight.weightClass}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(0, 240, 255, 0.1)',
            px: 2,
            py: 0.5,
            borderRadius: '4px',
          }}>
            <TimerIcon sx={{ color: '#00F0FF', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: '#00F0FF' }}>
              {`R${fight.actualRounds} ${fight.finalRoundTime}`}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            flex: 1,
            textAlign: 'right',
          }}>
            {renderFighterName(fight.fighterA)}
          </Box>
          
          <Box sx={{ 
            mx: 2,
            px: 2,
            py: 0.5,
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '4px',
            border: '1px solid rgba(0, 240, 255, 0.1)',
          }}>
            <Typography sx={{ 
              color: getMethodColor(fight.methodOfFinish),
              fontWeight: 'bold',
            }}>
              {fight.methodOfFinish}
            </Typography>
          </Box>

          <Box sx={{ 
            flex: 1,
            textAlign: 'left',
          }}>
            {renderFighterName(fight.fighterB)}
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ 
        justifyContent: 'center',
        borderTop: '1px solid rgba(0, 240, 255, 0.1)',
        py: 1,
      }}>
        <Button
          component={RouterLink}
          to={`/fight/${encodeFightCode(fight.fightCode)}`}
          startIcon={<StatsIcon />}
          sx={{
            color: '#00F0FF',
            borderColor: '#00F0FF',
            '&:hover': {
              bgcolor: 'rgba(0, 240, 255, 0.1)',
              borderColor: '#00F0FF',
            },
            textTransform: 'none',
            fontSize: '0.9rem',
          }}
          variant="outlined"
          size="small"
        >
          View Fight Stats
        </Button>
      </CardActions>
    </Card>
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
                }}
              >
                {event.eventName || 'Unknown Event'}
              </Typography>
            </Box>
          </Box>
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
              icon={<FightsIcon />} 
              iconPosition="start" 
              label="Tracked Fights" 
              sx={{ gap: 1 }}
            />
            <Tab 
              icon={<InfoIcon />} 
              iconPosition="start" 
              label="Details" 
              sx={{ gap: 1 }}
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {fightsError ? (
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Error loading fights: {fightsError}
            </Typography>
          ) : fights.length === 0 ? (
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              No fights found for this event.
            </Typography>
          ) : (
            <Box>
              {/* Title Fights Section */}
              {fights.some(fight => fight.isTitleFight === 'Yes') && (
                <>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 3,
                    mt: 1,
                    '&::after': {
                      content: '""',
                      flex: 1,
                      height: '1px',
                      background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.5), transparent)',
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TitleIcon sx={{ color: '#00F0FF' }} />
                      <Typography variant="h6" sx={{ 
                        color: '#00F0FF',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: 600,
                      }}>
                        Title Fights
                      </Typography>
                    </Box>
                  </Box>
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    {fights
                      .filter(fight => fight.isTitleFight === 'Yes')
                      .map((fight) => (
                        <Grid item xs={12} key={fight.fightCode}>
                          <FightCard fight={fight} />
                        </Grid>
                    ))}
                  </Grid>
                </>
              )}

              {/* Non-Title Fights Section */}
              {fights.some(fight => fight.isTitleFight !== 'Yes') && (
                <>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 3,
                    '&::after': {
                      content: '""',
                      flex: 1,
                      height: '1px',
                      background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.5), transparent)',
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FightsIcon sx={{ color: '#00F0FF' }} />
                      <Typography variant="h6" sx={{ 
                        color: '#00F0FF',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: 600,
                      }}>
                        Main Card
                      </Typography>
                    </Box>
                  </Box>
                  <Grid container spacing={2}>
                    {fights
                      .filter(fight => fight.isTitleFight !== 'Yes')
                      .map((fight) => (
                        <Grid item xs={12} key={fight.fightCode}>
                          <FightCard fight={fight} />
                        </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </Box>
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ 
            bgcolor: 'rgba(0, 240, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(0, 240, 255, 0.1)',
            p: 4,
            backdropFilter: 'blur(10px)',
          }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                  bgcolor: 'rgba(0, 240, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                }}>
                  <CalendarIcon sx={{ fontSize: 40, color: '#00F0FF', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>Date</Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                  bgcolor: 'rgba(0, 240, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                }}>
                  <FansIcon sx={{ fontSize: 40, color: '#00F0FF', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>Fans</Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {event.fans || 'No'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                  bgcolor: 'rgba(0, 240, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                }}>
                  <PPVIcon sx={{ fontSize: 40, color: '#00F0FF', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>PPV</Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {event.ppv || 'No'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default EventDetailPage; 