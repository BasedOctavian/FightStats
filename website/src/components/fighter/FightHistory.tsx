import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Link,
  Fade,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  EmojiEvents as TitleIcon,
  Check as WinIcon,
  Close as LossIcon,
  Timer as TimerIcon,
  Assessment as StatsIcon,
} from '@mui/icons-material';
import { useFighterFights } from '../../hooks/useFights';
import { useFightersByIds } from '../../hooks/useFighters';
import { useEvents } from '../../hooks/useEvents';
import { Fighter, Event } from '../../types/firestore';

interface FightHistoryProps {
  fighter: Fighter;
}

const LoadingCard: React.FC = () => (
  <Card sx={{ 
    bgcolor: 'rgba(0, 240, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 240, 255, 0.1)',
    borderRadius: '8px',
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ width: '30%' }}>
          <Typography component="div" sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', height: 24, borderRadius: 1 }} />
        </Box>
        <Box sx={{ width: '20%' }}>
          <Typography component="div" sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', height: 24, borderRadius: 1 }} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ width: '40%' }}>
          <Typography component="div" sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', height: 24, borderRadius: 1 }} />
        </Box>
        <Box sx={{ width: '40%' }}>
          <Typography component="div" sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', height: 24, borderRadius: 1 }} />
        </Box>
      </Box>
    </CardContent>
    <CardActions sx={{ justifyContent: 'center', borderTop: '1px solid rgba(0, 240, 255, 0.1)', py: 1 }}>
      <Box sx={{ width: '40%' }}>
        <Typography component="div" sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', height: 36, borderRadius: 1 }} />
      </Box>
    </CardActions>
  </Card>
);

const FightHistory: React.FC<FightHistoryProps> = ({ fighter }) => {
  const { fights, loading: fightsLoading, error: fightsError } = useFighterFights(fighter.fighterCode);

  // Get unique event codes from fights
  const eventCodes = useMemo(() => {
    if (!fights) return [];
    return Array.from(new Set(fights.map(fight => fight.eventCode)));
  }, [fights]);

  // Fetch all events data at once
  const { events: eventDataMap, loading: eventsLoading, error: eventsError } = useEvents(eventCodes);

  // Get unique opponent codes from fights
  const opponentCodes = useMemo(() => {
    if (!fights) return [];
    const opponentSet = new Set(fights.map(fight => 
      fight.fighterA === fighter.fighterCode ? fight.fighterB : fight.fighterA
    ));
    return Array.from(opponentSet);
  }, [fights, fighter.fighterCode]);

  // Fetch all opponent data
  const { fighters: opponents, loading: opponentsLoading, error: opponentsError } = useFightersByIds(opponentCodes);

  // Create maps for quick lookup
  const fighterMaps = useMemo(() => {
    const nameMap = new Map<string, string>();
    const idMap = new Map<string, string>();
    opponents.forEach(opponent => {
      if (opponent.fighterCode) {
        nameMap.set(opponent.fighterCode, opponent.fighterName || opponent.name || 'Unknown Fighter');
        if (opponent.id) {
          idMap.set(opponent.fighterCode, opponent.id);
        }
      }
    });
    return { nameMap, idMap };
  }, [opponents]);

  // Sort fights by date (most recent first)
  const sortedFights = useMemo(() => {
    if (!fights) return [];
    return [...fights].sort((a, b) => {
      const dateA = eventDataMap.get(a.eventCode)?.Date || '';
      const dateB = eventDataMap.get(b.eventCode)?.Date || '';
      return dateB.localeCompare(dateA);
    });
  }, [fights, eventDataMap]);

  const isLoading = fightsLoading || opponentsLoading || eventsLoading;
  const error = fightsError || opponentsError || eventsError;

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

  return (
    <Fade in timeout={400}>
      <Box>
        <Typography variant="h6" sx={{ 
          color: '#00F0FF',
          mb: 3,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          {isLoading ? (
            <Box sx={{ width: 200, mx: 'auto' }}>
              <Typography component="div" sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', height: 32, borderRadius: 1 }} />
            </Box>
          ) : (
            `Fight History (${fights.length} Fights)`
          )}
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ 
            bgcolor: 'rgba(255, 0, 0, 0.1)', 
            color: '#ff4444',
            border: '1px solid rgba(255, 0, 0, 0.3)',
            '& .MuiAlert-icon': {
              color: '#ff4444'
            }
          }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {isLoading ? (
              // Show loading cards
              Array.from({ length: 5 }).map((_, index) => (
                <Grid item xs={12} key={index}>
                  <LoadingCard />
                </Grid>
              ))
            ) : fights.length === 0 ? (
              <Grid item xs={12}>
                <Typography sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  textAlign: 'center',
                  py: 4
                }}>
                  No fights found for this fighter.
                </Typography>
              </Grid>
            ) : (
              sortedFights.map((fight) => {
                const isWinner = fight.fighterA === fighter.fighterCode;
                const opponentCode = isWinner ? fight.fighterB : fight.fighterA;
                const opponentName = fighterMaps.nameMap.get(opponentCode) || 'Unknown Fighter';
                const opponentId = fighterMaps.idMap.get(opponentCode);
                const eventData = eventDataMap.get(fight.eventCode);

                return (
                  <Grid item xs={12} key={fight.fightCode}>
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
                            <Link
                              component={RouterLink}
                              to={`/event/${eventData?.id}`}
                              sx={{
                                color: '#00F0FF',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  textDecoration: 'underline',
                                  textShadow: '0 0 8px rgba(0, 240, 255, 0.5)',
                                }
                              }}
                            >
                              {eventData?.EventName || fight.eventCode}
                            </Link>
                            {fight.isTitleFight === 'Yes' && (
                              <TitleIcon sx={{ color: '#FFD700' }} />
                            )}
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
                            textAlign: isWinner ? 'right' : 'left',
                          }}>
                            {isWinner ? (
                              <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                {fighter.fighterName || fighter.name}
                              </Typography>
                            ) : (
                              opponentId ? (
                                <Link
                                  component={RouterLink}
                                  to={`/fighter/${opponentId}`}
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
                                  {opponentName}
                                </Link>
                              ) : (
                                <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                  {opponentName}
                                </Typography>
                              )
                            )}
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
                            textAlign: isWinner ? 'left' : 'right',
                          }}>
                            {!isWinner ? (
                              <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                {fighter.fighterName || fighter.name}
                              </Typography>
                            ) : (
                              opponentId ? (
                                <Link
                                  component={RouterLink}
                                  to={`/fighter/${opponentId}`}
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
                                  {opponentName}
                                </Link>
                              ) : (
                                <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                                  {opponentName}
                                </Typography>
                              )
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                          <Chip 
                            label={fight.weightClass}
                            size="small"
                            sx={{ 
                              bgcolor: 'rgba(0, 240, 255, 0.1)',
                              color: '#00F0FF',
                              border: '1px solid rgba(0, 240, 255, 0.2)',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: 'rgba(0, 240, 255, 0.15)',
                              }
                            }}
                          />
                          <Chip
                            icon={isWinner ? <WinIcon /> : <LossIcon />}
                            label={isWinner ? 'Win' : 'Loss'}
                            size="small"
                            sx={{ 
                              bgcolor: isWinner ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                              color: isWinner ? '#00ff00' : '#ff0000',
                              border: `1px solid ${isWinner ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)'}`,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: isWinner ? 'rgba(0, 255, 0, 0.15)' : 'rgba(255, 0, 0, 0.15)',
                              },
                              '& .MuiChip-icon': {
                                color: 'inherit'
                              }
                            }}
                          />
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
                  </Grid>
                );
              })
            )}
          </Grid>
        )}
      </Box>
    </Fade>
  );
};

export default FightHistory; 