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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
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
import { useWeightClass } from '../../hooks/useWeightClass';
import { useFightDifficultyScores } from '../../hooks/useFightDifficultyScores';
import { useFighterCombinedDifficultyScore } from '../../hooks/useDifficultyScore';
import DifficultyScore from '../DifficultyScore';
import { Fighter, Event } from '../../types/firestore';

// Table styles matching BasicInfo principles
const tableStyles = {
  container: {
    bgcolor: 'rgba(10, 14, 23, 0.4)',
    borderRadius: '12px',
    border: '1px solid rgba(0, 240, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    overflow: 'hidden',
    '& .MuiTable-root': {
      bgcolor: 'transparent',
    },
    '& .MuiTableCell-root': {
      borderColor: 'rgba(0, 240, 255, 0.1)',
      color: 'rgba(255, 255, 255, 0.9)',
      fontFamily: 'monospace',
      fontSize: '0.85rem',
      padding: '12px 16px',
    },
    '& .MuiTableHead-root .MuiTableCell-root': {
      bgcolor: 'rgba(0, 240, 255, 0.08)',
      color: '#00F0FF',
      fontWeight: 600,
      fontSize: '0.8rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      borderBottom: '2px solid rgba(0, 240, 255, 0.2)',
    },
    '& .MuiTableBody-root .MuiTableRow-root': {
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: 'rgba(0, 240, 255, 0.05)',
      },
      '&:nth-of-type(even)': {
        bgcolor: 'rgba(0, 240, 255, 0.02)',
      },
    },
  },
  header: {
    color: '#fff',
    fontWeight: 600,
    fontSize: '1.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    position: 'relative',
    display: 'inline-block',
    mb: 2,
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -8,
      left: 0,
      width: '60%',
      height: '2px',
      background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.7), transparent)',
    }
  },
  description: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.9rem',
    maxWidth: '600px',
    mb: 3,
  },
  resumeSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    p: 2.5,
    bgcolor: 'rgba(10, 14, 23, 0.4)',
    borderRadius: '12px',
    border: '1px solid rgba(0, 240, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 240, 255, 0.1)',
    mb: 3,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
      opacity: 0.6,
    },
  },
  chip: {
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: 'monospace',
    height: '24px',
    borderRadius: '4px',
  },
  link: {
    color: '#00F0FF',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    '&:hover': {
      color: '#fff',
      textShadow: '0 0 8px rgba(0, 240, 255, 0.4)',
    }
  },
  button: {
    color: '#00F0FF',
    borderColor: '#00F0FF',
    border: '1px solid rgba(0, 240, 255, 0.3)',
    bgcolor: 'rgba(0, 240, 255, 0.08)',
    backdropFilter: 'blur(8px)',
    borderRadius: '4px',
    px: 1.5,
    py: 0.5,
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: 'monospace',
    transition: 'all 0.3s ease',
    minWidth: 'auto',
    '&:hover': {
      bgcolor: 'rgba(0, 240, 255, 0.12)',
      borderColor: '#00F0FF',
      transform: 'translateY(-1px)',
    },
  },
  scoreContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    bgcolor: 'rgba(0, 240, 255, 0.08)',
    px: 1.5,
    py: 0.5,
    borderRadius: '4px',
    border: '1px solid rgba(0, 240, 255, 0.2)',
    minWidth: '60px',
    justifyContent: 'center',
  },
  loadingRow: {
    '& .MuiTableCell-root': {
      padding: '16px',
    }
  }
};

interface FightHistoryProps {
  fighter: Fighter;
  weightClassAvgData?: any;
}

const LoadingRow: React.FC = () => (
  <TableRow sx={tableStyles.loadingRow}>
    <TableCell>
      <Box sx={{ width: '60%', height: 16, bgcolor: 'rgba(0, 240, 255, 0.1)', borderRadius: 1 }} />
    </TableCell>
    <TableCell>
      <Box sx={{ width: '80%', height: 16, bgcolor: 'rgba(0, 240, 255, 0.1)', borderRadius: 1 }} />
    </TableCell>
    <TableCell>
      <Box sx={{ width: '60%', height: 16, bgcolor: 'rgba(0, 240, 255, 0.1)', borderRadius: 1 }} />
    </TableCell>
    <TableCell>
      <Box sx={{ width: '40%', height: 16, bgcolor: 'rgba(0, 240, 255, 0.1)', borderRadius: 1 }} />
    </TableCell>
    <TableCell>
      <Box sx={{ width: '50%', height: 16, bgcolor: 'rgba(0, 240, 255, 0.1)', borderRadius: 1 }} />
    </TableCell>
    <TableCell>
      <Box sx={{ width: '30%', height: 16, bgcolor: 'rgba(0, 240, 255, 0.1)', borderRadius: 1 }} />
    </TableCell>
    <TableCell>
      <Box sx={{ width: '40%', height: 16, bgcolor: 'rgba(0, 240, 255, 0.1)', borderRadius: 1 }} />
    </TableCell>
    <TableCell>
      <Box sx={{ width: '30%', height: 16, bgcolor: 'rgba(0, 240, 255, 0.1)', borderRadius: 1 }} />
    </TableCell>
  </TableRow>
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

  // Calculate difficulty scores for all fights using the new hook
  const fightsWithScores = useFightDifficultyScores({
    fights,
    opponents,
    fighterCode: fighter.fighterCode,
    weightClassData
  });

  // Calculate combined difficulty score for the fighter
  const combinedDifficulty = useFighterCombinedDifficultyScore({
    fights,
    opponents,
    fighterCode: fighter.fighterCode,
    weightClassData
  });

  // Sort fights by date (most recent first), with title fights prioritized within same date
  const sortedFights = useMemo(() => {
    if (!fightsWithScores.length) return [];
    
    return [...fightsWithScores].sort((a, b) => {
      const dateA = eventDataMap.get(a.eventCode)?.Date || '';
      const dateB = eventDataMap.get(b.eventCode)?.Date || '';
      
      // First sort by date (most recent first)
      if (dateA && dateB) {
        const dateComparison = new Date(dateB).getTime() - new Date(dateA).getTime();
        if (dateComparison !== 0) {
          return dateComparison;
        }
      }
      
      // If same date, prioritize title fights
      const aIsTitle = a.isTitleFight === 'Yes';
      const bIsTitle = b.isTitleFight === 'Yes';
      
      if (aIsTitle && !bIsTitle) return -1;
      if (!aIsTitle && bIsTitle) return 1;
      
      // If both are title fights or both are regular fights, sort by difficulty score
      return b.difficultyScore - a.difficultyScore;
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
        <Typography variant="h5" sx={tableStyles.header}>
          Fight History
        </Typography>
        <Typography variant="body2" sx={tableStyles.description}>
          {isLoading ? (
            <Box sx={{ width: 200 }}>
              <Typography component="div" sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', height: 20, borderRadius: 1 }} />
            </Box>
          ) : (
            `Comprehensive fight record with ${fights.length} fights featuring detailed opponent analysis and difficulty scoring`
          )}
        </Typography>

                 {/* Overall Difficulty Score Section */}
         {!isLoading && fights.length > 0 && (
           <Box sx={tableStyles.resumeSection}>
             {/* Resume Rating Header */}
             <Box sx={{
               display: 'flex',
               alignItems: 'center',
               gap: 1.5,
             }}>
               <RatingIcon sx={{ 
                 color: '#00F0FF', 
                 fontSize: 20,
                 filter: 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.4))',
               }} />
               <Typography sx={{ 
                 color: 'rgba(255, 255, 255, 0.95)',
                 fontSize: '0.9rem',
                 fontWeight: 600,
                 letterSpacing: '0.05em',
                 textTransform: 'uppercase',
                 fontFamily: 'monospace',
               }}>
                 Resume Rating
               </Typography>
             </Box>
             
             {/* Average Score Display */}
             <Box sx={{ 
               display: 'flex', 
               alignItems: 'center', 
               gap: 1.5,
               bgcolor: 'rgba(0, 240, 255, 0.08)',
               px: 2,
               py: 1,
               borderRadius: '6px',
               border: '1px solid rgba(0, 240, 255, 0.2)',
               transition: 'all 0.3s ease',
               backdropFilter: 'blur(8px)',
               position: 'relative',
               overflow: 'hidden',
               '&:hover': {
                 bgcolor: 'rgba(0, 240, 255, 0.12)',
                 border: '1px solid rgba(0, 240, 255, 0.3)',
               }
             }}>
               <RatingIcon sx={{ 
                 color: '#00F0FF', 
                 fontSize: 18,
                 filter: 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.4))',
               }} />
               <Typography sx={{ 
                 color: '#00F0FF',
                 fontSize: '1.2rem',
                 fontWeight: 700,
                 fontFamily: 'monospace',
                 letterSpacing: '0.05em',
               }}>
                 {combinedDifficulty.averageScore.toFixed(1)}
               </Typography>
             </Box>

             {/* Performance Breakdown */}
             <Box sx={{ 
               display: 'flex',
               gap: 2,
               flex: 1,
               justifyContent: 'flex-end',
             }}>
               {/* Average Win Performance */}
               <Box sx={{ 
                 display: 'flex',
                 alignItems: 'center',
                 gap: 1,
                 bgcolor: 'rgba(0, 255, 0, 0.08)',
                 px: 2,
                 py: 1,
                 borderRadius: '6px',
                 border: '1px solid rgba(0, 255, 0, 0.2)',
                 transition: 'all 0.3s ease',
                 backdropFilter: 'blur(8px)',
                 position: 'relative',
                 overflow: 'hidden',
                 '&:hover': {
                   bgcolor: 'rgba(0, 255, 0, 0.12)',
                   border: '1px solid rgba(0, 255, 0, 0.3)',
                 },
                 '&::before': {
                   content: '""',
                   position: 'absolute',
                   top: 0,
                   left: 0,
                   right: 0,
                   height: '1px',
                   background: 'linear-gradient(90deg, #00FF00, #00CC00)',
                   opacity: 0.6,
                 }
               }}>
                 <Typography sx={{ 
                   color: 'rgba(255, 255, 255, 0.9)',
                   fontSize: '0.7rem',
                   fontWeight: 600,
                   letterSpacing: '0.05em',
                   textTransform: 'uppercase',
                   fontFamily: 'monospace',
                 }}>
                   Win
                 </Typography>
                 {combinedDifficulty.breakdown.wins.count > 0 ? (
                   <Typography sx={{ 
                     color: '#00FF00',
                     fontSize: '0.9rem',
                     fontWeight: 700,
                     fontFamily: 'monospace',
                   }}>
                     {combinedDifficulty.breakdown.wins.averageScore.toFixed(1)}
                   </Typography>
                 ) : (
                   <Typography sx={{ 
                     color: 'rgba(255, 255, 255, 0.5)',
                     fontSize: '0.7rem',
                     fontWeight: 600,
                     fontFamily: 'monospace',
                     fontStyle: 'italic',
                   }}>
                     N/A
                   </Typography>
                 )}
               </Box>

               {/* Average Loss Performance */}
               <Box sx={{ 
                 display: 'flex',
                 alignItems: 'center',
                 gap: 1,
                 bgcolor: 'rgba(255, 0, 0, 0.08)',
                 px: 2,
                 py: 1,
                 borderRadius: '6px',
                 border: '1px solid rgba(255, 0, 0, 0.2)',
                 transition: 'all 0.3s ease',
                 backdropFilter: 'blur(8px)',
                 position: 'relative',
                 overflow: 'hidden',
                 '&:hover': {
                   bgcolor: 'rgba(255, 0, 0, 0.12)',
                   border: '1px solid rgba(255, 0, 0, 0.3)',
                 },
                 '&::before': {
                   content: '""',
                   position: 'absolute',
                   top: 0,
                   left: 0,
                   right: 0,
                   height: '1px',
                   background: 'linear-gradient(90deg, #FF0000, #CC0000)',
                   opacity: 0.6,
                 }
               }}>
                 <Typography sx={{ 
                   color: 'rgba(255, 255, 255, 0.9)',
                   fontSize: '0.7rem',
                   fontWeight: 600,
                   letterSpacing: '0.05em',
                   textTransform: 'uppercase',
                   fontFamily: 'monospace',
                 }}>
                   Loss
                 </Typography>
                 {combinedDifficulty.breakdown.losses.count > 0 ? (
                   <Typography sx={{ 
                     color: '#FF0000',
                     fontSize: '0.9rem',
                     fontWeight: 700,
                     fontFamily: 'monospace',
                   }}>
                     {combinedDifficulty.breakdown.losses.averageScore.toFixed(1)}
                   </Typography>
                 ) : (
                   <Typography sx={{ 
                     color: 'rgba(255, 255, 255, 0.5)',
                     fontSize: '0.7rem',
                     fontWeight: 600,
                     fontFamily: 'monospace',
                     fontStyle: 'italic',
                   }}>
                     N/A
                   </Typography>
                 )}
               </Box>
             </Box>
           </Box>
         )}

        {error ? (
          <Box sx={{ 
            p: 3, 
            bgcolor: 'rgba(255, 0, 0, 0.1)', 
            borderRadius: '8px',
            border: '1px solid rgba(255, 0, 0, 0.2)',
            backdropFilter: 'blur(8px)',
          }}>
            <Typography sx={{ 
              color: '#FF0000',
              fontFamily: 'monospace',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}>
              Error: {error}
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={tableStyles.container}>
            <Table>
                             <TableHead>
                 <TableRow>
                   <TableCell>Date</TableCell>
                   <TableCell>Event</TableCell>
                   <TableCell>Opponent</TableCell>
                   <TableCell>Result</TableCell>
                   <TableCell>Method</TableCell>
                   <TableCell>Round</TableCell>
                   <TableCell>Performance</TableCell>
                   <TableCell>Actions</TableCell>
                 </TableRow>
               </TableHead>
              <TableBody>
                {isLoading ? (
                  // Show loading rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <LoadingRow key={index} />
                  ))
                                 ) : fights.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                       <Typography sx={{ 
                         color: 'rgba(255, 255, 255, 0.7)',
                         fontSize: '0.9rem',
                       }}>
                         No fights found for this fighter.
                       </Typography>
                     </TableCell>
                   </TableRow>
                ) : (
                  sortedFights.map((fight) => {
                    const isWinner = fight.fighterA === fighter.fighterCode;
                    const opponentCode = isWinner ? fight.fighterB : fight.fighterA;
                    const opponentName = fighterMaps.nameMap.get(opponentCode) || 'Unknown Fighter';
                    const opponentId = fighterMaps.idMap.get(opponentCode);
                    const eventData = eventDataMap.get(fight.eventCode);

                                         return (
                       <TableRow key={fight.fightCode}>
                         {/* Date */}
                         <TableCell>
                           <Typography sx={{ 
                             color: 'rgba(255, 255, 255, 0.9)',
                             fontSize: '0.8rem',
                             fontWeight: 500,
                             fontFamily: 'monospace',
                           }}>
                             {eventData?.Date ? (
                               new Date(eventData.Date).toLocaleDateString(undefined, {
                                 year: 'numeric',
                                 month: 'short',
                                 day: 'numeric'
                               })
                             ) : (
                               <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                                 N/A
                               </span>
                             )}
                           </Typography>
                         </TableCell>

                         {/* Event */}
                         <TableCell>
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                             <Link
                               component={RouterLink}
                               to={`/event/${eventData?.id}`}
                               sx={tableStyles.link}
                             >
                               {eventData?.EventName || fight.eventCode}
                             </Link>
                             {fight.isTitleFight === 'Yes' && (
                               <TitleIcon sx={{ 
                                 color: '#FFD700', 
                                 fontSize: 16,
                                 filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.4))',
                               }} />
                             )}
                           </Box>
                         </TableCell>

                        {/* Opponent */}
                        <TableCell>
                          {opponentId ? (
                            <Link
                              component={RouterLink}
                              to={`/fighter/${opponentId}`}
                              sx={tableStyles.link}
                            >
                              {opponentName}
                            </Link>
                          ) : (
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                              {opponentName}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Result */}
                        <TableCell>
                          <Chip
                            icon={isWinner ? <WinIcon /> : <LossIcon />}
                            label={isWinner ? 'Win' : 'Loss'}
                            size="small"
                            sx={{ 
                              ...tableStyles.chip,
                              bgcolor: isWinner ? 'rgba(0, 255, 0, 0.08)' : 'rgba(255, 0, 0, 0.08)',
                              color: isWinner ? '#00ff00' : '#ff0000',
                              border: `1px solid ${isWinner ? 'rgba(0, 255, 0, 0.25)' : 'rgba(255, 0, 0, 0.25)'}`,
                              '& .MuiChip-icon': {
                                color: 'inherit'
                              }
                            }}
                          />
                        </TableCell>

                        {/* Method */}
                        <TableCell>
                          <Typography sx={{ 
                            color: getMethodColor(fight.methodOfFinish),
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            fontFamily: 'monospace',
                          }}>
                            {fight.methodOfFinish}
                          </Typography>
                        </TableCell>

                        {/* Round */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TimerIcon sx={{ color: '#00F0FF', fontSize: 14 }} />
                            <Typography sx={{ 
                              color: '#00F0FF',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              fontFamily: 'monospace',
                            }}>
                              {`R${fight.actualRounds} ${fight.finalRoundTime}`}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Performance Score */}
                        <TableCell>
                          {(() => {
                            const opponent = opponents.find(o => o.fighterCode === opponentCode);
                            if (!opponent) return (
                              <Box sx={tableStyles.scoreContainer}>
                                <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem' }}>
                                  N/A
                                </Typography>
                              </Box>
                            );
                            return (
                              <Box sx={tableStyles.scoreContainer}>
                                <DifficultyScore 
                                  opponent={opponent}
                                  weightClassData={weightClassData}
                                  methodOfFinish={fight.methodOfFinish}
                                  actualRounds={fight.actualRounds}
                                  isWinner={isWinner}
                                />
                              </Box>
                            );
                          })()}
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <Button
                            component={RouterLink}
                            to={`/fight/${encodeFightCode(fight.fightCode)}`}
                            startIcon={<StatsIcon sx={{ fontSize: 14 }} />}
                            sx={tableStyles.button}
                            variant="outlined"
                            size="small"
                          >
                            Stats
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Fade>
  );
};

export default FightHistory; 