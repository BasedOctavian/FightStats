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
  Tooltip,
  Container,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  EmojiEvents as TitleIcon,
  Check as WinIcon,
  Close as LossIcon,
  Timer as TimerIcon,
  Assessment as StatsIcon,
  Star as RatingIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useFighterFights } from '../../hooks/useFights';
import { useFightersByIds } from '../../hooks/useFighters';
import { useEvents } from '../../hooks/useEvents';
import { useOverallRating } from '../../hooks/stats/useOverallRating';
import { useWeightClass } from '../../hooks/useWeightClass';
import { Fighter, Event } from '../../types/firestore';

// Enhanced card styles matching GrapplingInfo
const cardStyle = {
  p: 4,
  bgcolor: 'rgba(10, 14, 23, 0.4)',
  borderRadius: '12px',
  border: '1px solid rgba(0, 240, 255, 0.15)',
  height: '100%',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    bgcolor: 'rgba(10, 14, 23, 0.6)',
    border: '1px solid rgba(0, 240, 255, 0.3)',
    transform: 'translateY(-2px)',
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
    height: '1px',
    background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
    opacity: 0.5,
  }
};

const glowEffect = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.08), transparent 70%)',
  opacity: 0,
  transition: 'opacity 0.3s ease-in-out',
  pointerEvents: 'none',
};

interface FightHistoryProps {
  fighter: Fighter;
  weightClassAvgData?: any; // Add this prop to receive weight class data from parent
}

// Method of finish multipliers - defined outside component for reuse
const methodMultipliers = {
  'KO': 1.3,    // Knockout - highest difficulty
  'TKO': 1.2,   // Technical knockout - high difficulty
  'SUB': 1.1,   // Submission - moderate-high difficulty
  'DEC': 1.0,   // Decision - base difficulty
  'DQ': 0.8,    // Disqualification - lower difficulty
  'NC': 0.5     // No contest - lowest difficulty
};

// Round efficiency multipliers - defined outside component for reuse
const roundMultipliers = {
  1: 1.4,  // First round finish - very impressive
  2: 1.2,  // Second round finish - impressive
  3: 1.0,  // Third round finish - standard
  4: 0.9,  // Fourth round finish - less impressive
  5: 0.8   // Fifth round finish - least impressive
};

// Wrapper component that always calls the hook
const DifficultyScoreWrapper: React.FC<{ 
  opponent: Fighter; 
  weightClassData: any;
  methodOfFinish: string;
  actualRounds: number;
}> = ({ opponent, weightClassData, methodOfFinish, actualRounds }) => {
  const opponentRating = useOverallRating(opponent, weightClassData);
  
  // Calculate difficulty score based on opponent rating, finish method, and rounds
  const calculateDifficultyScore = () => {
    const baseRating = opponentRating.rating;
    
    // Method of finish multiplier
    const methodMultiplier = methodMultipliers[methodOfFinish as keyof typeof methodMultipliers] || 1.0;
    
    // Round efficiency multiplier - finishing early is more impressive
    const roundMultiplier = roundMultipliers[actualRounds as keyof typeof roundMultipliers] || 1.0;
    
    // Calculate final difficulty score
    const difficultyScore = Math.round(baseRating * methodMultiplier * roundMultiplier);
    
    // Ensure score stays within 1-100 range
    return Math.min(100, Math.max(1, difficultyScore));
  };
  
  const difficultyScore = calculateDifficultyScore();
  
  // Get difficulty description
  const getDifficultyDescription = (score: number) => {
    if (score >= 85) return 'Extreme';
    if (score >= 75) return 'Very High';
    if (score >= 65) return 'High';
    if (score >= 55) return 'Moderate';
    if (score >= 45) return 'Low';
    return 'Very Low';
  };
  
  const difficultyDescription = getDifficultyDescription(difficultyScore);

  return (
    <Tooltip 
      title={
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {opponent.fighterName || opponent.name}: Difficulty Analysis
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
            Base Rating: {opponentRating.rating} ({opponentRating.archetype})
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
            Finish Method: {methodOfFinish} (×{methodMultipliers[methodOfFinish as keyof typeof methodMultipliers] || 1.0})
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
            Round Efficiency: R{actualRounds} (×{roundMultipliers[actualRounds as keyof typeof roundMultipliers] || 1.0})
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
            Difficulty Score: {difficultyScore} ({difficultyDescription})
          </Typography>
        </Box>
      }
      placement="top"
      arrow
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 0.5,
        bgcolor: 'rgba(0, 240, 255, 0.08)',
        px: 1.5,
        py: 0.5,
        borderRadius: '8px',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(5px)',
        '&:hover': {
          bgcolor: 'rgba(0, 240, 255, 0.12)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0, 240, 255, 0.15)',
        }
      }}>
        <RatingIcon sx={{ 
          color: '#00F0FF', 
          fontSize: 16,
          filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.5))',
        }} />
        <Typography sx={{ 
          color: '#00F0FF',
          fontSize: '0.85rem',
          fontWeight: 700,
          fontFamily: '"Orbitron", "Roboto Mono", monospace',
          letterSpacing: '0.05em',
          textShadow: '0 0 8px rgba(0, 240, 255, 0.3)',
        }}>
          {difficultyScore}
        </Typography>
      </Box>
    </Tooltip>
  );
};

// Separate component to handle difficulty score display
const DifficultyScore: React.FC<{ 
  opponentCode: string; 
  opponents: Fighter[]; 
  weightClassData: any;
  methodOfFinish: string;
  actualRounds: number;
}> = ({ opponentCode, opponents, weightClassData, methodOfFinish, actualRounds }) => {
  const opponent = opponents.find(o => o.fighterCode === opponentCode);
  
  if (!opponent || !weightClassData) {
    return null;
  }

  return <DifficultyScoreWrapper opponent={opponent} weightClassData={weightClassData} methodOfFinish={methodOfFinish} actualRounds={actualRounds} />;
};

const LoadingCard: React.FC = () => (
  <Box sx={cardStyle}>
    <Box className="glow-effect" sx={glowEffect} />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box sx={{ width: '30%' }}>
        <Typography component="div" sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', height: 24, borderRadius: 1 }} />
      </Box>
      <Box sx={{ width: '20%' }}>
        <Typography component="div" sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', height: 24, borderRadius: 1 }} />
      </Box>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box sx={{ width: '40%' }}>
        <Typography component="div" sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', height: 24, borderRadius: 1 }} />
      </Box>
      <Box sx={{ width: '40%' }}>
        <Typography component="div" sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', height: 24, borderRadius: 1 }} />
      </Box>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
      <Box sx={{ width: '15%' }}>
        <Typography component="div" sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', height: 32, borderRadius: 1 }} />
      </Box>
      <Box sx={{ width: '15%' }}>
        <Typography component="div" sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', height: 32, borderRadius: 1 }} />
      </Box>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '40%' }}>
        <Typography component="div" sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', height: 36, borderRadius: 1 }} />
      </Box>
    </Box>
  </Box>
);

const FightHistory: React.FC<FightHistoryProps> = ({ fighter, weightClassAvgData }) => {
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

  // Use weight class data from props if available, otherwise fetch it
  const { weightClass: fetchedWeightClassData, loading: weightClassLoading } = useWeightClass(
    weightClassAvgData ? null : (fighter.weightClass || 'Unknown')
  );
  
  // Use props data if available, otherwise use fetched data
  const weightClassData = weightClassAvgData || fetchedWeightClassData;
  


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

  // Calculate difficulty scores for all fights using the same logic as DifficultyScoreWrapper
  const fightsWithScores = useMemo(() => {
    if (!fights || !opponents.length || !weightClassData) return [];
    
    return fights.map(fight => {
      const opponentCode = fight.fighterA === fighter.fighterCode ? fight.fighterB : fight.fighterA;
      const opponent = opponents.find(o => o.fighterCode === opponentCode);
      
      if (!opponent) {
        return { ...fight, difficultyScore: 0 };
      }
      
      // Calculate base rating using the same logic as useOverallRating
      const totalFights = opponent.FightsTracked || 0;
      const totalWins = opponent.fight_outcome_stats?.FighterWins || 0;
      const winRate = totalFights > 0 ? (totalWins / totalFights) * 100 : 50;
      
      const koWins = opponent.fight_outcome_stats?.FighterKOWins || 0;
      const tkoWins = opponent.fight_outcome_stats?.FighterTKOWins || 0;
      const subWins = opponent.fight_outcome_stats?.FighterSUBWin || 0;
      const totalFinishes = koWins + tkoWins + subWins;
      const finishRate = totalWins > 0 ? (totalFinishes / totalWins) * 100 : 25;
      
      // Calculate base rating similar to useOverallRating (simplified version)
      const baseRating = Math.min(100, Math.max(1, (winRate * 0.7) + (finishRate * 0.3)));
      
      // Apply method and round multipliers (same as DifficultyScoreWrapper)
      const methodMultiplier = methodMultipliers[fight.methodOfFinish as keyof typeof methodMultipliers] || 1.0;
      const roundMultiplier = roundMultipliers[fight.actualRounds as keyof typeof roundMultipliers] || 1.0;
      
      // Calculate difficulty score (same as DifficultyScoreWrapper)
      const difficultyScore = Math.round(baseRating * methodMultiplier * roundMultiplier);
      
      return {
        ...fight,
        difficultyScore: Math.min(100, Math.max(1, difficultyScore))
      };
    });
  }, [fights, opponents, weightClassData, fighter.fighterCode]);

  // Sort fights by title fights first (sorted by performance), then regular fights (sorted by performance)
  const sortedFights = useMemo(() => {
    if (!fightsWithScores.length) return [];
    
    return [...fightsWithScores].sort((a, b) => {
      // Title fights always come first
      const aIsTitle = a.isTitleFight === 'Yes';
      const bIsTitle = b.isTitleFight === 'Yes';
      
      if (aIsTitle && !bIsTitle) return -1;
      if (!aIsTitle && bIsTitle) return 1;
      
      // If both are title fights or both are regular fights, sort by difficulty score
      if (aIsTitle === bIsTitle) {
        // Sort by difficulty score (highest first)
        return b.difficultyScore - a.difficultyScore;
      }
      
      // Fallback to date sorting if performance scores can't be calculated
      const dateA = eventDataMap.get(a.eventCode)?.Date || '';
      const dateB = eventDataMap.get(b.eventCode)?.Date || '';
      return dateB.localeCompare(dateA);
    });
  }, [fightsWithScores, eventDataMap]);

  const isLoading = fightsLoading || opponentsLoading || eventsLoading || weightClassLoading;
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
        {/* Header Section */}
        <Box sx={{ mb: 6, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              component="img"
              src="/icon.png"
              alt="Fight History Icon"
              sx={{
                width: 40,
                height: 40,
                mr: 2,
                filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.3))',
              }}
            />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: '#fff',
                fontSize: { xs: '1.75rem', sm: '2rem' },
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
              }}
            >
              Fight History
            </Typography>
          </Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '600px',
              position: 'relative',
              pl: 2,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '50%',
                width: '4px',
                height: '50%',
                transform: 'translateY(-50%)',
                background: 'linear-gradient(180deg, #00F0FF, transparent)',
                borderRadius: '2px',
              }
            }}
          >
            {isLoading ? (
              <Box sx={{ width: 200 }}>
                <Typography component="div" sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', height: 24, borderRadius: 1 }} />
              </Box>
            ) : (
              `Comprehensive fight record with ${fights.length} fights featuring detailed opponent analysis and difficulty scoring`
            )}
          </Typography>
        </Box>

        {error ? (
          <Box sx={{ 
            p: 4, 
            bgcolor: 'rgba(255, 0, 0, 0.1)', 
            borderRadius: '12px',
            border: '1px solid rgba(255, 0, 0, 0.2)',
            backdropFilter: 'blur(8px)',
          }}>
            <Typography sx={{ 
              color: '#FF0000',
              fontFamily: '"Orbitron", "Roboto Mono", monospace',
              fontWeight: 600,
            }}>
              Error: {error}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {isLoading ? (
              // Show loading cards
              Array.from({ length: 5 }).map((_, index) => (
                <Grid item xs={12} key={index}>
                  <LoadingCard />
                </Grid>
              ))
            ) : fights.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 4, 
                  bgcolor: 'rgba(0, 240, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 240, 255, 0.1)',
                  textAlign: 'center',
                }}>
                  <Typography sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}>
                    No fights found for this fighter.
                  </Typography>
                </Box>
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
                    <Box sx={cardStyle}>
                      <Box className="glow-effect" sx={glowEffect} />
                      
                      {/* Event Info Header */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 4,
                        position: 'relative',
                        zIndex: 1,
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Link
                            component={RouterLink}
                            to={`/event/${eventData?.id}`}
                            sx={{
                              color: '#00F0FF',
                              textDecoration: 'none',
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: '#fff',
                                textShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                              }
                            }}
                          >
                            {eventData?.EventName || fight.eventCode}
                          </Link>
                          {fight.isTitleFight === 'Yes' && (
                            <Chip 
                              icon={<TitleIcon sx={{ color: '#FFD700 !important' }} />}
                              label="Title Fight"
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(255, 215, 0, 0.08)',
                                color: '#FFD700',
                                border: '1px solid rgba(255, 215, 0, 0.25)',
                                borderRadius: '8px',
                                height: '28px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(8px)',
                                fontFamily: '"Orbitron", "Roboto Mono", monospace',
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
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: 1.5,
                          bgcolor: 'rgba(0, 240, 255, 0.08)',
                          px: 2.5,
                          py: 1,
                          borderRadius: '8px',
                          border: '1px solid rgba(0, 240, 255, 0.2)',
                          backdropFilter: 'blur(8px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'rgba(0, 240, 255, 0.12)',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0, 240, 255, 0.15)',
                          }
                        }}>
                          <TimerIcon sx={{ color: '#00F0FF', fontSize: 20 }} />
                          <Typography sx={{ 
                            color: '#00F0FF',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            fontFamily: '"Orbitron", "Roboto Mono", monospace',
                            letterSpacing: '0.05em',
                          }}>
                            {`R${fight.actualRounds} ${fight.finalRoundTime}`}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Fighter Matchup Section */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 4,
                        mb: 4,
                        position: 'relative',
                        zIndex: 1,
                      }}>
                        {/* Fighter A */}
                        <Box sx={{ 
                          flex: 1,
                          textAlign: isWinner ? 'right' : 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isWinner ? 'flex-end' : 'flex-start',
                          gap: 1,
                        }}>
                          {isWinner ? (
                            <Typography sx={{ 
                              color: '#fff', 
                              fontWeight: 700,
                              fontSize: '1.3rem',
                              letterSpacing: '0.02em',
                              textTransform: 'uppercase',
                              textShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                            }}>
                              {fighter.fighterName || fighter.name}
                            </Typography>
                          ) : (
                            <>
                              {opponentId ? (
                                <Link
                                  component={RouterLink}
                                  to={`/fighter/${opponentId}`}
                                  sx={{
                                    color: '#fff',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    fontSize: '1.3rem',
                                    letterSpacing: '0.02em',
                                    textTransform: 'uppercase',
                                    textShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                                    fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      color: '#00F0FF',
                                      textShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
                                    }
                                  }}
                                >
                                  {opponentName}
                                </Link>
                              ) : (
                                <Typography sx={{ 
                                  color: '#fff', 
                                  fontWeight: 700,
                                  fontSize: '1.3rem',
                                  letterSpacing: '0.02em',
                                  textTransform: 'uppercase',
                                  textShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                                }}>
                                  {opponentName}
                                </Typography>
                              )}
                            </>
                          )}
                        </Box>
                        
                        {/* VS Section */}
                        <Box sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 2,
                          px: 3,
                          py: 2,
                          bgcolor: 'rgba(0, 240, 255, 0.08)',
                          borderRadius: '12px',
                          border: '1px solid rgba(0, 240, 255, 0.2)',
                          backdropFilter: 'blur(8px)',
                          position: 'relative',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'rgba(0, 240, 255, 0.12)',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0, 240, 255, 0.15)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
                            opacity: 0.5,
                          }
                        }}>
                          <Typography sx={{ 
                            color: '#00F0FF',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            textShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
                          }}>
                            VS
                          </Typography>
                          <Box sx={{ 
                            px: 3,
                            py: 1,
                            bgcolor: 'rgba(10, 14, 23, 0.8)',
                            borderRadius: '8px',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                            backdropFilter: 'blur(5px)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              border: '1px solid rgba(0, 240, 255, 0.4)',
                              boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
                            }
                          }}>
                            <Typography sx={{ 
                              color: getMethodColor(fight.methodOfFinish),
                              fontWeight: 700,
                              fontSize: '1rem',
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                              textShadow: `0 0 10px ${getMethodColor(fight.methodOfFinish)}40`,
                            }}>
                              {fight.methodOfFinish}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Fighter B */}
                        <Box sx={{ 
                          flex: 1,
                          textAlign: isWinner ? 'left' : 'right',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isWinner ? 'flex-start' : 'flex-end',
                          gap: 1,
                        }}>
                          {!isWinner ? (
                            <Typography sx={{ 
                              color: '#fff', 
                              fontWeight: 700,
                              fontSize: '1.3rem',
                              letterSpacing: '0.02em',
                              textTransform: 'uppercase',
                              textShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                            }}>
                              {fighter.fighterName || fighter.name}
                            </Typography>
                          ) : (
                            <>
                              {opponentId ? (
                                <Link
                                  component={RouterLink}
                                  to={`/fighter/${opponentId}`}
                                  sx={{
                                    color: '#fff',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    fontSize: '1.3rem',
                                    letterSpacing: '0.02em',
                                    textTransform: 'uppercase',
                                    textShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                                    fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      color: '#00F0FF',
                                      textShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
                                    }
                                  }}
                                >
                                  {opponentName}
                                </Link>
                              ) : (
                                <Typography sx={{ 
                                  color: '#fff', 
                                  fontWeight: 700,
                                  fontSize: '1.3rem',
                                  letterSpacing: '0.02em',
                                  textTransform: 'uppercase',
                                  textShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                                }}>
                                  {opponentName}
                                </Typography>
                              )}
                            </>
                          )}
                        </Box>
                      </Box>

                      {/* Fight Info Chips */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: 2,
                        mb: 4,
                        position: 'relative',
                        zIndex: 1,
                      }}>
                        <Chip 
                          label={fight.weightClass}
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(0, 240, 255, 0.08)',
                            color: '#00F0FF',
                            border: '1px solid rgba(0, 240, 255, 0.2)',
                            borderRadius: '8px',
                            height: '32px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(8px)',
                            fontFamily: '"Orbitron", "Roboto Mono", monospace',
                            '&:hover': {
                              bgcolor: 'rgba(0, 240, 255, 0.12)',
                              border: '1px solid rgba(0, 240, 255, 0.3)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(0, 240, 255, 0.15)',
                            }
                          }}
                        />
                        <Chip
                          icon={isWinner ? <WinIcon /> : <LossIcon />}
                          label={isWinner ? 'Win' : 'Loss'}
                          size="small"
                          sx={{ 
                            bgcolor: isWinner ? 'rgba(0, 255, 0, 0.08)' : 'rgba(255, 0, 0, 0.08)',
                            color: isWinner ? '#00ff00' : '#ff0000',
                            border: `1px solid ${isWinner ? 'rgba(0, 255, 0, 0.25)' : 'rgba(255, 0, 0, 0.25)'}`,
                            borderRadius: '8px',
                            height: '32px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(8px)',
                            fontFamily: '"Orbitron", "Roboto Mono", monospace',
                            '&:hover': {
                              bgcolor: isWinner ? 'rgba(0, 255, 0, 0.12)' : 'rgba(255, 0, 0, 0.12)',
                              border: `1px solid ${isWinner ? 'rgba(0, 255, 0, 0.35)' : 'rgba(255, 0, 0, 0.35)'}`,
                              transform: 'translateY(-1px)',
                              boxShadow: `0 4px 12px ${isWinner ? 'rgba(0, 255, 0, 0.15)' : 'rgba(255, 0, 0, 0.15)'}`,
                            },
                            '& .MuiChip-icon': {
                              color: 'inherit'
                            }
                          }}
                        />
                      </Box>

                      {/* Action Button */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 1,
                        mb: 3,
                      }}>
                        <Button
                          component={RouterLink}
                          to={`/fight/${encodeFightCode(fight.fightCode)}`}
                          startIcon={<StatsIcon />}
                          sx={{
                            color: '#00F0FF',
                            borderColor: '#00F0FF',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            bgcolor: 'rgba(0, 240, 255, 0.08)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '8px',
                            px: 3,
                            py: 1.5,
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            fontFamily: '"Orbitron", "Roboto Mono", monospace',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: 'rgba(0, 240, 255, 0.12)',
                              borderColor: '#00F0FF',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 24px rgba(0, 240, 255, 0.2)',
                            },
                          }}
                          variant="outlined"
                          size="medium"
                        >
                          View Fight Stats
                        </Button>
                      </Box>

                      {/* Performance Score Container */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 1,
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                          bgcolor: 'rgba(0, 240, 255, 0.08)',
                          px: 3,
                          py: 2,
                          borderRadius: '8px',
                          border: '1px solid rgba(0, 240, 255, 0.2)',
                          transition: 'all 0.3s ease',
                          backdropFilter: 'blur(8px)',
                          minWidth: '200px',
                          '&:hover': {
                            bgcolor: 'rgba(0, 240, 255, 0.12)',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0, 240, 255, 0.15)',
                          }
                        }}>
                          <Typography sx={{ 
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          }}>
                            Performance Score
                          </Typography>
                          <DifficultyScore 
                            opponentCode={opponentCode} 
                            opponents={opponents}
                            weightClassData={weightClassData}
                            methodOfFinish={fight.methodOfFinish}
                            actualRounds={fight.actualRounds}
                          />
                        </Box>
                      </Box>
                    </Box>
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