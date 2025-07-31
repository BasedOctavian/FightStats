import React from 'react';
import { Paper, Typography, Grid, Box, Collapse, IconButton, Switch, FormControlLabel } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { Fighter } from '../../types/firestore';
import { useCombinations } from '../../hooks/useCombinations';

interface ComboInfoProps {
  fighter: Fighter;
  weightClassAvgData?: any;
}

// Shared styles matching MovementInfo
const ratingCardStyles = {
  collapsibleSection: {
    background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
    borderRadius: '12px',
    border: '2px solid rgba(0, 150, 255, 0.3)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 150, 255, 0.15), 0 0 60px rgba(0, 150, 255, 0.1)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
      opacity: 0.5,
    }
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 3,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(0, 240, 255, 0.05)',
    }
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 102, 255, 0.1) 100%)',
    border: '1px solid rgba(0, 240, 255, 0.2)',
    boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    textShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
  },
  expandIcon: {
    color: '#00F0FF',
    transition: 'all 0.3s ease',
    '&.expanded': {
      transform: 'rotate(180deg)',
    }
  }
};

const ComboInfo: React.FC<ComboInfoProps> = ({ fighter, weightClassAvgData }): JSX.Element => {
  // Use the combinations hook
  const { absorbed, thrown, loading, error } = useCombinations(fighter.id || null);
  const [offenseExpanded, setOffenseExpanded] = React.useState(true);
  const [defenseExpanded, setDefenseExpanded] = React.useState(true);
  const [selectedPoint, setSelectedPoint] = React.useState<number | null>(null);
  const [filterMinPunches, setFilterMinPunches] = React.useState(false);

  // Function to count punches in a combination
  const countPunches = (combo: string): number => {
    const punchKeywords = [
      'Jab', 'Straight', 'Hook', 'Uppercut', 'Overhand', 'Cross'
    ];
    return punchKeywords.reduce((count, keyword) => {
      const regex = new RegExp(keyword, 'gi');
      const matches = combo.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  };

  // Calculate percentages for thrown combinations with filtering
  const thrownWithPercentages = React.useMemo(() => {
    if (!thrown) return [];
    
    let filteredThrown = { ...thrown };
    
    // Apply punch count filter if enabled
    if (filterMinPunches) {
      filteredThrown = Object.fromEntries(
        Object.entries(thrown).filter(([combo, count]) => {
          const punchCount = countPunches(combo);
          return punchCount >= 3;
        })
      );
    }
    
    const totalThrown = Object.values(filteredThrown).reduce((sum: number, value: any) => sum + value, 0);
    
    return Object.entries(filteredThrown)
      .map(([combo, count]) => ({
        combo,
        count: count as number,
        percentage: ((count as number) / totalThrown) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending
  }, [thrown, filterMinPunches]);

  // Calculate percentages for absorbed combinations with filtering
  const absorbedWithPercentages = React.useMemo(() => {
    if (!absorbed) return [];
    
    let filteredAbsorbed = { ...absorbed };
    
    // Apply punch count filter if enabled
    if (filterMinPunches) {
      filteredAbsorbed = Object.fromEntries(
        Object.entries(absorbed).filter(([combo, count]) => {
          const punchCount = countPunches(combo);
          return punchCount >= 3;
        })
      );
    }
    
    const totalAbsorbed = Object.values(filteredAbsorbed).reduce((sum: number, value: any) => sum + value, 0);
    
    return Object.entries(filteredAbsorbed)
      .map(([combo, count]) => ({
        combo,
        count: count as number,
        percentage: ((count as number) / totalAbsorbed) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending
  }, [absorbed, filterMinPunches]);

  // Log to console only
  React.useEffect(() => {
    if (error) {
      console.log('ERROR:', error);
    }
    if (absorbed) {
      console.log('ABSORBED COMBINATIONS:', absorbed);
    }
    if (thrown) {
      console.log('THROWN COMBINATIONS:', thrown);
    }
  }, [error, absorbed, thrown]);

  if (loading) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          mb: 3,
          bgcolor: 'transparent',
          borderRadius: '12px',
          border: '1px solid rgba(0, 240, 255, 0.1)',
        }}
      >
        <Typography sx={{ color: '#00F0FF', textAlign: 'center' }}>
          Loading combination analysis...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          mb: 3,
          bgcolor: 'transparent',
          borderRadius: '12px',
          border: '1px solid rgba(255, 0, 0, 0.3)',
        }}
      >
        <Typography sx={{ color: '#FF3864', textAlign: 'center' }}>
          Error loading combinations: {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% {
              left: -100%;
            }
            100% {
              left: 100%;
            }
          }
        `}
      </style>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          mb: 3,
          bgcolor: 'transparent',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(0, 240, 255, 0.1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '3px',
            background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
          }
        }}
      >
                    {/* Collapsible Header */}
       <Box 
         sx={{
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'space-between',
           p: 3,
           cursor: 'pointer',
           transition: 'all 0.3s ease',
           borderRadius: '12px',
           background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
           border: '2px solid rgba(0, 150, 255, 0.3)',
           boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 150, 255, 0.15), 0 0 60px rgba(0, 150, 255, 0.1)',
           mb: 3,
           '&:hover': {
             background: 'rgba(0, 240, 255, 0.05)',
           }
         }}
         onClick={() => setOffenseExpanded(!offenseExpanded)}
       >
         <Box sx={{ display: 'flex', alignItems: 'center' }}>
           <Box
             component="img"
             src="/icon.png"
             alt="Offense Icon"
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
             Offense
           </Typography>
         </Box>
         <IconButton
           sx={{
             color: '#00F0FF',
             transition: 'all 0.3s ease',
             '&.expanded': {
               transform: 'rotate(180deg)',
             }
           }}
           className={offenseExpanded ? 'expanded' : ''}
         >
           {offenseExpanded ? <ExpandMore /> : <ExpandLess />}
         </IconButton>
       </Box>

       {/* Collapsible Content */}
       <Collapse in={offenseExpanded}>
         <Box>
           <Typography 
             variant="subtitle1" 
             sx={{ 
               color: 'rgba(255, 255, 255, 0.7)',
               maxWidth: '600px',
               position: 'relative',
               pl: 2,
               mb: 4,
               '&::before': {
                 content: '""',
                 position: 'absolute',
                 left: 0,
                 top: '50%',
                 transform: 'translateY(-50%)',
                 width: '4px',
                 height: '50%',
                 background: 'linear-gradient(180deg, #00F0FF, transparent)',
                 borderRadius: '2px',
               }
             }}
           >
             Comprehensive analysis of thrown and absorbed combinations showing frequency patterns and effectiveness
           </Typography>

           {/* Filter Section */}
      <Box sx={{ 
        mb: 4, 
        p: 3,
        borderRadius: '12px',
        background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
        border: '2px solid rgba(0, 150, 255, 0.3)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 150, 255, 0.15), 0 0 60px rgba(0, 150, 255, 0.1)',
      }}>
        <Typography sx={{
          color: '#FFFFFF',
          fontSize: '1.1rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 2,
          textAlign: 'center',
        }}>
          Filter Options
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={filterMinPunches}
                onChange={(e) => setFilterMinPunches(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#00F0FF',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 240, 255, 0.08)',
                    },
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#00F0FF',
                  },
                  '& .MuiSwitch-track': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              />
            }
            label={
              <Typography sx={{
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: '"Orbitron", "Roboto Mono", monospace',
              }}>
                Show only combinations with 3+ punches
              </Typography>
            }
            sx={{
              '& .MuiFormControlLabel-label': {
                color: '#FFFFFF',
              }
            }}
          />
        </Box>
        {filterMinPunches && (
          <Typography sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            textAlign: 'center',
            mt: 1,
            fontStyle: 'italic',
          }}>
            Filtering to show only combinations containing 3 or more punches (jabs, straights, hooks, uppercuts, overhands, crosses)
          </Typography>
        )}
      </Box>

      <Grid container spacing={4}>
        {/* Thrown Combinations Section */}
        <Grid item xs={12}>
          <Box sx={ratingCardStyles.collapsibleSection}>
            {/* Collapsible Header */}
            <Box 
              sx={ratingCardStyles.sectionHeader}
              onClick={() => setOffenseExpanded(!offenseExpanded)}
            >
              <Box sx={ratingCardStyles.sectionTitle}>
                <Box 
                  className="rating-icon"
                  sx={{
                    ...ratingCardStyles.icon,
                    width: 45,
                    height: 45,
                  }}
                >
                  <Box sx={{
                    width: '28px',
                    height: '28px',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#00F0FF',
                      boxShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: '2px solid #00F0FF',
                      opacity: 0.3,
                    }
                  }}/>
                </Box>
                <Typography sx={{
                  ...ratingCardStyles.title,
                  fontSize: '1.3rem',
                }}>
                  Thrown Combinations
                  {filterMinPunches && (
                    <Typography component="span" sx={{
                      color: '#00F0FF',
                      fontSize: '0.8rem',
                      ml: 1,
                      fontWeight: 400,
                      fontStyle: 'italic',
                    }}>
                      (3+ punches)
                    </Typography>
                  )}
                </Typography>
              </Box>
              <IconButton
                sx={ratingCardStyles.expandIcon}
                className={offenseExpanded ? '' : 'expanded'}
              >
                {offenseExpanded ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={offenseExpanded}>
              <Box sx={{ p: 4 }}>
                <Typography sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  mb: 4,
                  textAlign: 'center',
                }}>
                  Analysis of combinations thrown by {fighter.fighterName} showing frequency and effectiveness patterns
                  {filterMinPunches && ' (filtered to show only combinations with 3 or more punches)'}
                </Typography>
                
                                 {/* Summary Stats */}
                 <Grid container spacing={3} sx={{ mb: 4 }}>
                   <Grid item xs={12}>
                     <Box sx={{ 
                       textAlign: 'center', 
                       p: 4,
                       borderRadius: '12px',
                       background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
                       border: '2px solid rgba(0, 150, 255, 0.3)',
                       boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 150, 255, 0.15), 0 0 60px rgba(0, 150, 255, 0.1)',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease',
                       '&:hover': {
                         transform: 'translateY(-2px)',
                         boxShadow: '0 16px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 150, 255, 0.2), 0 0 80px rgba(0, 150, 255, 0.15)',
                       }
                     }}>
                       <Typography sx={{
                         color: '#FFFFFF',
                         fontSize: '1.4rem',
                         fontWeight: 700,
                         textTransform: 'uppercase',
                         letterSpacing: '0.1em',
                         mb: 3,
                       }}>
                         Most Used Combination
                       </Typography>
                       <Box sx={{ 
                         display: 'flex', 
                         flexDirection: 'column', 
                         alignItems: 'center',
                         gap: 1
                       }}>
                         {(() => {
                           const mostUsedCombo = thrownWithPercentages[0]?.combo;
                           if (!mostUsedCombo) {
                             return (
                               <Typography sx={{
                                 fontSize: '1.2rem',
                                 fontWeight: 600,
                                 color: 'rgba(255, 255, 255, 0.6)',
                                 fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                 fontStyle: 'italic',
                               }}>
                                 No combinations available
                               </Typography>
                             );
                           }
                           
                           const comboParts = mostUsedCombo.split(' to ');
                           if (comboParts.length > 1) {
                             return comboParts.map((part, partIndex) => (
                               <Typography 
                                 key={partIndex}
                                 sx={{
                                   fontSize: '1.1rem',
                                   fontWeight: 600,
                                   color: '#00F0FF',
                                   fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                   textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                                   lineHeight: 1.3,
                                   textAlign: 'center',
                                 }}
                               >
                                 {partIndex + 1}. {part}
                               </Typography>
                             ));
                           } else {
                             return (
                               <Typography sx={{
                                 fontSize: '1.1rem',
                                 fontWeight: 600,
                                 color: '#00F0FF',
                                 fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                 textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                                 lineHeight: 1.3,
                                 textAlign: 'center',
                               }}>
                                 1. {mostUsedCombo}
                               </Typography>
                             );
                           }
                         })()}
                       </Box>
                                               {thrownWithPercentages[0] && (
                          <Typography sx={{
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontFamily: '"Orbitron", "Roboto Mono", monospace',
                            mt: 2,
                            fontStyle: 'italic',
                          }}>
                            {thrownWithPercentages[0].percentage.toFixed(1)}% of all combinations
                          </Typography>
                        )}
                     </Box>
                   </Grid>
                 </Grid>
                
                {/* Combination List */}
                <Box sx={{ mb: 4 }}>
                  <Typography sx={{
                    color: '#FFFFFF',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 3,
                    textAlign: 'center',
                  }}>
                    Combination Frequency Breakdown
                  </Typography>
                  
                                     {thrownWithPercentages.length === 0 ? (
                     <Box sx={{
                       textAlign: 'center',
                       p: 4,
                       borderRadius: '12px',
                       background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.8) 0%, rgba(30, 40, 60, 0.6) 100%)',
                       border: '1px solid rgba(0, 240, 255, 0.2)',
                     }}>
                       <Typography sx={{
                         color: 'rgba(255, 255, 255, 0.7)',
                         fontSize: '1rem',
                         fontStyle: 'italic',
                       }}>
                         {filterMinPunches 
                           ? 'No combinations found with 3 or more punches'
                           : 'No combinations found'
                         }
                       </Typography>
                     </Box>
                   ) : (
                     <Grid container spacing={2}>
                       {thrownWithPercentages.slice(0, 10).map((item, index) => (
                         <Grid item xs={12} key={index}>
                           <Box 
                             sx={{ 
                               display: 'flex', 
                               justifyContent: 'space-between',
                               alignItems: 'center',
                               p: 2,
                               borderRadius: '8px',
                               background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.8) 0%, rgba(30, 40, 60, 0.6) 100%)',
                               border: '1px solid rgba(0, 240, 255, 0.2)',
                               boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                               transition: 'all 0.3s ease',
                               cursor: 'pointer',
                               position: 'relative',
                               '&:hover': {
                                 border: '1px solid rgba(0, 240, 255, 0.4)',
                                 boxShadow: '0 6px 30px rgba(0, 240, 255, 0.1)',
                                 transform: 'translateY(-1px)',
                               }
                             }}
                             
                           >
                             <Box sx={{ flex: 1, mr: 2 }}>
                                                               <Box>
                                  {(() => {
                                    const comboParts = item.combo.split(' to ');
                                    if (comboParts.length > 1) {
                                      return comboParts.map((part, partIndex) => (
                                        <Typography 
                                          key={partIndex}
                                          sx={{ 
                                            color: '#FFFFFF',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                            mb: partIndex < comboParts.length - 1 ? 0.5 : 0,
                                          }}
                                        >
                                          {partIndex + 1}. {part}
                                        </Typography>
                                      ));
                                    } else {
                                      return (
                                        <Typography sx={{ 
                                          color: '#FFFFFF',
                                          fontSize: '0.9rem',
                                          fontWeight: 500,
                                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                        }}>
                                          1. {item.combo}
                                        </Typography>
                                      );
                                    }
                                  })()}
                                </Box>
                               {filterMinPunches && (
                                 <Typography sx={{
                                   color: '#00F0FF',
                                   fontSize: '0.75rem',
                                   fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                   fontStyle: 'italic',
                                 }}>
                                   {countPunches(item.combo)} punches
                                 </Typography>
                               )}
                             </Box>
                             <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 250 }}>
                               <Box 
                                 sx={{ 
                                   width: `${Math.min(item.percentage * 2, 100)}%`,
                                   height: 24,
                                   background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
                                   borderRadius: '12px',
                                   mr: 2,
                                   boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
                                   minWidth: 20,
                                   position: 'relative',
                                   overflow: 'hidden',
                                   '&::after': {
                                     content: '""',
                                     position: 'absolute',
                                     top: 0,
                                     left: '-100%',
                                     width: '100%',
                                     height: '100%',
                                     background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                                     animation: 'shimmer 2s infinite',
                                   }
                                 }}
                               />
                                                               <Typography sx={{ 
                                  color: '#00F0FF',
                                  fontSize: '0.9rem',
                                  fontWeight: 600,
                                  minWidth: 60,
                                  fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                  textShadow: '0 0 8px rgba(0, 240, 255, 0.3)',
                                }}>
                                  {item.percentage.toFixed(1)}%
                                </Typography>
                             </Box>
                           </Box>
                         </Grid>
                       ))}
                     </Grid>
                   )}
                </Box>
                
                {/* Line Graph */}
                <Box sx={{ 
                  width: '100%', 
                  height: 800, 
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                  borderRadius: '12px',
                  p: 4,
                  background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.8) 0%, rgba(30, 40, 60, 0.6) 100%)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  mb: 4,
                }}>
                  <Typography sx={{
                    color: '#FFFFFF',
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 4,
                    textAlign: 'center',
                  }}>
                    Combination Frequency Trend
                    {filterMinPunches && (
                      <Typography component="span" sx={{
                        color: '#00F0FF',
                        fontSize: '0.8rem',
                        ml: 1,
                        fontWeight: 400,
                        fontStyle: 'italic',
                      }}>
                        (3+ punches)
                      </Typography>
                    )}
                  </Typography>
                  
                  {/* Info Section */}
                  <Box
                    sx={{
                      mt: 3,
                      p: 3,
                      borderRadius: '12px',
                      background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
                      border: '2px solid rgba(0, 150, 255, 0.3)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 150, 255, 0.15), 0 0 60px rgba(0, 150, 255, 0.1)',
                      minHeight: 120,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                    }}
                    id="combo-info-section"
                  >
                    <Typography sx={{
                      color: '#00F0FF',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      mb: 2,
                      fontFamily: '"Orbitron", "Roboto Mono", monospace',
                      textAlign: 'center',
                    }}>
                      Click a data point to select it
                    </Typography>
                    <Box sx={{
                      textAlign: 'center',
                      mb: 1,
                    }} id="info-combo">
                      <Typography sx={{
                        color: '#FFFFFF',
                        fontSize: '1.3rem',
                        fontWeight: 600,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        textAlign: 'center',
                        lineHeight: 1.4,
                      }}>
                        -
                      </Typography>
                    </Box>
                    <Typography sx={{
                      color: '#00F0FF',
                      fontSize: '1.8rem',
                      fontWeight: 800,
                      fontFamily: '"Orbitron", "Roboto Mono", monospace',
                      textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                      textAlign: 'center',
                    }} id="info-percentage">
                      -
                    </Typography>
                    
                  </Box>
                  
                  {/* Chart Container with proper spacing */}
                  <Box sx={{
                    width: '100%',
                    height: 'calc(100% - 200px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                    {thrownWithPercentages.length === 0 ? (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '1rem',
                        fontStyle: 'italic',
                      }}>
                        No data to display
                      </Box>
                    ) : (
                      <svg width="100%" height="100%" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
                        {/* Background gradient */}
                        <defs>
                          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(0, 240, 255, 0.05)" />
                            <stop offset="100%" stopColor="rgba(0, 240, 255, 0.02)" />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge> 
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        
                        {/* Chart area background */}
                        <rect
                          x="100"
                          y="60"
                          width="800"
                          height="320"
                          fill="url(#chartGradient)"
                          rx="6"
                        />
                        
                        {/* Grid lines with better styling */}
                        {[0, 25, 50, 75, 100].map((y, index) => (
                          <g key={index}>
                            <line
                              x1="100"
                              y1={380 - (y * 3.2)}
                              x2="900"
                              y2={380 - (y * 3.2)}
                              stroke={y === 50 ? "rgba(0, 240, 255, 0.2)" : "rgba(0, 240, 255, 0.1)"}
                              strokeWidth={y === 50 ? "2" : "1"}
                              strokeDasharray={y === 50 ? "none" : "5,5"}
                            />
                            <text
                              x="90"
                              y={380 - (y * 3.2) + 4}
                              fontSize="14"
                              fill={y === 50 ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.6)"}
                              textAnchor="end"
                              fontFamily='"Orbitron", "Roboto Mono", monospace'
                              fontWeight={y === 50 ? "600" : "400"}
                            >
                              {y}%
                            </text>
                          </g>
                        ))}
                        
                        {/* Area fill under the line */}
                        <path
                          d={`M 100,380 ${thrownWithPercentages.slice(0, 10).map((item, index) => {
                            const totalItems = Math.min(thrownWithPercentages.length, 10);
                            const spacing = 800 / (totalItems - 1 || 1);
                            const x = 100 + (index * spacing);
                            return `L ${x},${380 - (item.percentage * 3.2)}`;
                          }).join(' ')} L ${100 + (Math.min(thrownWithPercentages.length, 10) - 1) * (800 / (Math.min(thrownWithPercentages.length, 10) - 1 || 1))},380 Z`}
                          fill="url(#chartGradient)"
                          opacity="0.3"
                        />
                        
                        {/* Enhanced line chart with gradient */}
                        <polyline
                          fill="none"
                          stroke="url(#chartGradient)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={thrownWithPercentages.slice(0, 10).map((item, index) => {
                            const totalItems = Math.min(thrownWithPercentages.length, 10);
                            const spacing = 800 / (totalItems - 1 || 1);
                            const x = 100 + (index * spacing);
                            return `${x},${380 - (item.percentage * 3.2)}`;
                          }).join(' ')}
                          filter="url(#glow)"
                        />
                        
                        {/* Interactive data points with hover effects */}
                        {thrownWithPercentages.slice(0, 10).map((item, index) => {
                          const totalItems = Math.min(thrownWithPercentages.length, 10);
                          const spacing = 800 / (totalItems - 1 || 1);
                          const x = 100 + (index * spacing);
                          const y = 380 - (item.percentage * 3.2);
                          const isSelected = selectedPoint === index;
                          
                          return (
                            <g key={index}>
                              {/* Data point */}
                              <circle
                                cx={x}
                                cy={y}
                                r="12"
                                fill={isSelected ? "#FF6B35" : "#00F0FF"}
                                stroke="rgba(10, 14, 23, 0.95)"
                                strokeWidth={isSelected ? "4" : "3"}
                                filter={isSelected ? "drop-shadow(0 0 15px rgba(255, 107, 53, 0.9))" : "drop-shadow(0 0 12px rgba(0, 240, 255, 0.8))"}
                              />
                              {/* Inner glow */}
                              <circle
                                cx={x}
                                cy={y}
                                r="6"
                                fill={isSelected ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.9)"}
                              />
                              {/* Hover area - placed last so it's on top */}
                              <circle
                                cx={x}
                                cy={y}
                                r="40"
                                fill="transparent"
                                cursor="pointer"
                                onMouseEnter={(e) => {
                                  const comboText = document.getElementById('info-combo');
                                  const percentageText = document.getElementById('info-percentage');
                                  
                                  if (comboText && percentageText) {
                                    // Format combo with line breaks
                                    const comboParts = item.combo.split(' to ');
                                    if (comboParts.length > 1) {
                                      comboText.innerHTML = comboParts.map((part, index) => 
                                        `<div style="margin-bottom: 4px;">${index + 1}. ${part}</div>`
                                      ).join('');
                                    } else {
                                      comboText.textContent = item.combo;
                                    }
                                    percentageText.textContent = `${item.percentage.toFixed(1)}%`;
                                  }
                                }}
                                onMouseLeave={() => {
                                  // Only clear info if no point is selected
                                  if (selectedPoint === null) {
                                    const comboText = document.getElementById('info-combo');
                                    const percentageText = document.getElementById('info-percentage');
                                    
                                    if (comboText && percentageText) {
                                      comboText.innerHTML = '<div>-</div>';
                                      percentageText.textContent = '-';
                                    }
                                  }
                                }}
                                onClick={() => {
                                  if (selectedPoint === index) {
                                    // Deselect if clicking the same point
                                    setSelectedPoint(null);
                                    const comboText = document.getElementById('info-combo');
                                    const percentageText = document.getElementById('info-percentage');
                                    
                                    if (comboText && percentageText) {
                                      comboText.innerHTML = '<div>-</div>';
                                      percentageText.textContent = '-';
                                    }
                                  } else {
                                    // Select new point
                                    setSelectedPoint(index);
                                    const comboText = document.getElementById('info-combo');
                                    const percentageText = document.getElementById('info-percentage');
                                    
                                    if (comboText && percentageText) {
                                      // Format combo with line breaks
                                      const comboParts = item.combo.split(' to ');
                                      if (comboParts.length > 1) {
                                        comboText.innerHTML = comboParts.map((part, index) => 
                                          `<div style="margin-bottom: 4px;">${index + 1}. ${part}</div>`
                                        ).join('');
                                      } else {
                                        comboText.textContent = item.combo;
                                      }
                                      percentageText.textContent = `${item.percentage.toFixed(1)}%`;
                                    }
                                  }
                                }}
                              />
                            </g>
                          );
                        })}
                        
                        {/* Enhanced axes */}
                        <line
                          x1="100"
                          y1="60"
                          x2="100"
                          y2="380"
                          stroke="rgba(0, 240, 255, 0.4)"
                          strokeWidth="2"
                        />
                        <line
                          x1="100"
                          y1="380"
                          x2="900"
                          y2="380"
                          stroke="rgba(0, 240, 255, 0.4)"
                          strokeWidth="2"
                        />
                        
                        {/* Axis labels */}
                        <text
                          x="40"
                          y="220"
                          fontSize="16"
                          fill="rgba(255, 255, 255, 0.8)"
                          textAnchor="middle"
                          fontFamily='"Orbitron", "Roboto Mono", monospace'
                          fontWeight="600"
                          transform="rotate(-90 40 220)"
                        >
                          FREQUENCY %
                        </text>
                        <text
                          x="500"
                          y="470"
                          fontSize="16"
                          fill="rgba(255, 255, 255, 0.8)"
                          textAnchor="middle"
                          fontFamily='"Orbitron", "Roboto Mono", monospace'
                          fontWeight="600"
                        >
                          COMBINATIONS
                        </text>
                      </svg>
                    )}
                  </Box>
                  
                  
                </Box>
              </Box>
            </Collapse>
          </Box>
                 </Grid>
       </Grid>
           </Box>
         </Collapse>
       </Paper>

       {/* Defense Section - Separate Paper */}
       <Paper 
         elevation={0} 
         sx={{ 
           p: { xs: 2, sm: 3, md: 4 },
           mb: 3,
           bgcolor: 'transparent',
           borderRadius: '12px',
           position: 'relative',
           overflow: 'hidden',
           border: '1px solid rgba(255, 56, 100, 0.1)',
           '&::before': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: 0,
             width: '100%',
             height: '3px',
             background: 'linear-gradient(90deg, #FF3864, #FF6B35)',
           }
         }}
       >
         {/* Collapsible Header */}
         <Box 
           sx={{
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'space-between',
             p: 3,
             cursor: 'pointer',
             transition: 'all 0.3s ease',
             borderRadius: '12px',
             background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
             border: '2px solid rgba(255, 56, 100, 0.3)',
             boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 56, 100, 0.15), 0 0 60px rgba(255, 56, 100, 0.1)',
             mb: 3,
             '&:hover': {
               background: 'rgba(255, 56, 100, 0.05)',
             }
           }}
           onClick={() => setDefenseExpanded(!defenseExpanded)}
         >
           <Box sx={{ display: 'flex', alignItems: 'center' }}>
             <Box
               component="img"
               src="/icon.png"
               alt="Defense Icon"
               sx={{
                 width: 40,
                 height: 40,
                 mr: 2,
                 filter: 'drop-shadow(0 0 8px rgba(255, 56, 100, 0.3))',
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
                 textShadow: '0 0 20px rgba(255, 56, 100, 0.3)',
               }}
             >
               Defense
             </Typography>
           </Box>
           <IconButton
             sx={{
               color: '#FF3864',
               transition: 'all 0.3s ease',
               '&.expanded': {
                 transform: 'rotate(180deg)',
               }
             }}
             className={defenseExpanded ? 'expanded' : ''}
           >
             {defenseExpanded ? <ExpandMore /> : <ExpandLess />}
           </IconButton>
         </Box>

         {/* Collapsible Content */}
         <Collapse in={defenseExpanded}>
           <Box>
             <Typography 
               variant="subtitle1" 
               sx={{ 
                 color: 'rgba(255, 255, 255, 0.7)',
                 maxWidth: '600px',
                 position: 'relative',
                 pl: 2,
                 mb: 4,
                 '&::before': {
                   content: '""',
                   position: 'absolute',
                   left: 0,
                   top: '50%',
                   transform: 'translateY(-50%)',
                   width: '4px',
                   height: '50%',
                   background: 'linear-gradient(180deg, #FF3864, transparent)',
                   borderRadius: '2px',
                 }
               }}
             >
               Comprehensive analysis of absorbed combinations showing frequency patterns and defensive effectiveness
             </Typography>

             {/* Filter Section */}
             <Box sx={{ 
               mb: 4, 
               p: 3,
               borderRadius: '12px',
               background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
               border: '2px solid rgba(255, 56, 100, 0.3)',
               boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 56, 100, 0.15), 0 0 60px rgba(255, 56, 100, 0.1)',
             }}>
               <Typography sx={{
                 color: '#FFFFFF',
                 fontSize: '1.1rem',
                 fontWeight: 700,
                 textTransform: 'uppercase',
                 letterSpacing: '0.05em',
                 mb: 2,
                 textAlign: 'center',
               }}>
                 Filter Options
               </Typography>
               <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 <FormControlLabel
                   control={
                     <Switch
                       checked={filterMinPunches}
                       onChange={(e) => setFilterMinPunches(e.target.checked)}
                       sx={{
                         '& .MuiSwitch-switchBase.Mui-checked': {
                           color: '#FF3864',
                           '&:hover': {
                             backgroundColor: 'rgba(255, 56, 100, 0.08)',
                           },
                         },
                         '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                           backgroundColor: '#FF3864',
                         },
                         '& .MuiSwitch-track': {
                           backgroundColor: 'rgba(255, 255, 255, 0.3)',
                         },
                       }}
                     />
                   }
                   label={
                     <Typography sx={{
                       color: '#FFFFFF',
                       fontSize: '1rem',
                       fontWeight: 600,
                       fontFamily: '"Orbitron", "Roboto Mono", monospace',
                     }}>
                       Show only combinations with 3+ punches
                     </Typography>
                   }
                   sx={{
                     '& .MuiFormControlLabel-label': {
                       color: '#FFFFFF',
                     }
                   }}
                 />
               </Box>
               {filterMinPunches && (
                 <Typography sx={{
                   color: 'rgba(255, 255, 255, 0.7)',
                   fontSize: '0.9rem',
                   textAlign: 'center',
                   mt: 1,
                   fontStyle: 'italic',
                 }}>
                   Filtering to show only combinations containing 3 or more punches (jabs, straights, hooks, uppercuts, overhands, crosses)
                 </Typography>
               )}
             </Box>

             <Grid container spacing={4}>
               {/* Absorbed Combinations Section */}
               <Grid item xs={12}>
                 <Box sx={ratingCardStyles.collapsibleSection}>
                   {/* Collapsible Header */}
                   <Box 
                     sx={ratingCardStyles.sectionHeader}
                     onClick={() => setDefenseExpanded(!defenseExpanded)}
                   >
                     <Box sx={ratingCardStyles.sectionTitle}>
                       <Box 
                         className="rating-icon"
                         sx={{
                           ...ratingCardStyles.icon,
                           width: 45,
                           height: 45,
                         }}
                       >
                         <Box sx={{
                           width: '28px',
                           height: '28px',
                           position: 'relative',
                           '&::before': {
                             content: '""',
                             position: 'absolute',
                             top: '50%',
                             left: '50%',
                             transform: 'translate(-50%, -50%)',
                             width: '16px',
                             height: '16px',
                             borderRadius: '50%',
                             background: '#FF3864',
                             boxShadow: '0 0 12px rgba(255, 56, 100, 0.5)',
                           },
                           '&::after': {
                             content: '""',
                             position: 'absolute',
                             top: '50%',
                             left: '50%',
                             transform: 'translate(-50%, -50%)',
                             width: '24px',
                             height: '24px',
                             borderRadius: '50%',
                             border: '2px solid #FF3864',
                             opacity: 0.3,
                           }
                         }}/>
                       </Box>
                       <Typography sx={{
                         ...ratingCardStyles.title,
                         fontSize: '1.3rem',
                       }}>
                         Absorbed Combinations
                         {filterMinPunches && (
                           <Typography component="span" sx={{
                             color: '#FF3864',
                             fontSize: '0.8rem',
                             ml: 1,
                             fontWeight: 400,
                             fontStyle: 'italic',
                           }}>
                             (3+ punches)
                           </Typography>
                         )}
                       </Typography>
                     </Box>
                     <IconButton
                       sx={ratingCardStyles.expandIcon}
                       className={defenseExpanded ? '' : 'expanded'}
                     >
                       {defenseExpanded ? <ExpandMore /> : <ExpandLess />}
                     </IconButton>
                   </Box>

                   {/* Collapsible Content */}
                   <Collapse in={defenseExpanded}>
                     <Box sx={{ p: 4 }}>
                       <Typography sx={{
                         color: 'rgba(255, 255, 255, 0.8)',
                         fontSize: '0.95rem',
                         lineHeight: 1.6,
                         mb: 4,
                         textAlign: 'center',
                       }}>
                         Analysis of combinations absorbed by {fighter.fighterName} showing frequency and defensive patterns
                         {filterMinPunches && ' (filtered to show only combinations with 3 or more punches)'}
                       </Typography>
                       
                       {/* Summary Stats */}
                       <Grid container spacing={3} sx={{ mb: 4 }}>
                         <Grid item xs={12}>
                           <Box sx={{ 
                             textAlign: 'center', 
                             p: 4,
                             borderRadius: '12px',
                             background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
                             border: '2px solid rgba(255, 56, 100, 0.3)',
                             boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 56, 100, 0.15), 0 0 60px rgba(255, 56, 100, 0.1)',
                             cursor: 'pointer',
                             transition: 'all 0.3s ease',
                             '&:hover': {
                               transform: 'translateY(-2px)',
                               boxShadow: '0 16px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 56, 100, 0.2), 0 0 80px rgba(255, 56, 100, 0.15)',
                             }
                           }}>
                             <Typography sx={{
                               color: '#FFFFFF',
                               fontSize: '1.4rem',
                               fontWeight: 700,
                               textTransform: 'uppercase',
                               letterSpacing: '0.1em',
                               mb: 3,
                             }}>
                               Most Absorbed Combination
                             </Typography>
                             <Box sx={{ 
                               display: 'flex', 
                               flexDirection: 'column', 
                               alignItems: 'center',
                               gap: 1
                             }}>
                               {(() => {
                                 const mostAbsorbedCombo = absorbedWithPercentages[0]?.combo;
                                 if (!mostAbsorbedCombo) {
                                   return (
                                     <Typography sx={{
                                       fontSize: '1.2rem',
                                       fontWeight: 600,
                                       color: 'rgba(255, 255, 255, 0.6)',
                                       fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                       fontStyle: 'italic',
                                     }}>
                                       No combinations available
                                     </Typography>
                                   );
                                 }
                                 
                                 const comboParts = mostAbsorbedCombo.split(' to ');
                                 if (comboParts.length > 1) {
                                   return comboParts.map((part, partIndex) => (
                                     <Typography 
                                       key={partIndex}
                                       sx={{
                                         fontSize: '1.1rem',
                                         fontWeight: 600,
                                         color: '#FF3864',
                                         fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                         textShadow: '0 0 15px rgba(255, 56, 100, 0.5)',
                                         lineHeight: 1.3,
                                         textAlign: 'center',
                                       }}
                                     >
                                       {partIndex + 1}. {part}
                                     </Typography>
                                   ));
                                 } else {
                                   return (
                                     <Typography sx={{
                                       fontSize: '1.1rem',
                                       fontWeight: 600,
                                       color: '#FF3864',
                                       fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                       textShadow: '0 0 15px rgba(255, 56, 100, 0.5)',
                                       lineHeight: 1.3,
                                       textAlign: 'center',
                                     }}>
                                       1. {mostAbsorbedCombo}
                                     </Typography>
                                   );
                                 }
                               })()}
                             </Box>
                             {absorbedWithPercentages[0] && (
                               <Typography sx={{
                                 fontSize: '0.9rem',
                                 fontWeight: 500,
                                 color: 'rgba(255, 255, 255, 0.7)',
                                 fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                 mt: 2,
                                 fontStyle: 'italic',
                               }}>
                                 {absorbedWithPercentages[0].percentage.toFixed(1)}% of all absorbed combinations
                               </Typography>
                             )}
                           </Box>
                         </Grid>
                       </Grid>
                       
                       {/* Combination List */}
                       <Box sx={{ mb: 4 }}>
                         <Typography sx={{
                           color: '#FFFFFF',
                           fontSize: '1.1rem',
                           fontWeight: 700,
                           textTransform: 'uppercase',
                           letterSpacing: '0.05em',
                           mb: 3,
                           textAlign: 'center',
                         }}>
                           Combination Frequency Breakdown
                         </Typography>
                         
                         {absorbedWithPercentages.length === 0 ? (
                           <Box sx={{
                             textAlign: 'center',
                             p: 4,
                             borderRadius: '12px',
                             background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.8) 0%, rgba(30, 40, 60, 0.6) 100%)',
                             border: '1px solid rgba(255, 56, 100, 0.2)',
                           }}>
                             <Typography sx={{
                               color: 'rgba(255, 255, 255, 0.7)',
                               fontSize: '1rem',
                               fontStyle: 'italic',
                             }}>
                               {filterMinPunches 
                                 ? 'No combinations found with 3 or more punches'
                                 : 'No combinations found'
                               }
                             </Typography>
                           </Box>
                         ) : (
                           <Grid container spacing={2}>
                             {absorbedWithPercentages.slice(0, 10).map((item, index) => (
                               <Grid item xs={12} key={index}>
                                 <Box 
                                   sx={{ 
                                     display: 'flex', 
                                     justifyContent: 'space-between',
                                     alignItems: 'center',
                                     p: 2,
                                     borderRadius: '8px',
                                     background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.8) 0%, rgba(30, 40, 60, 0.6) 100%)',
                                     border: '1px solid rgba(255, 56, 100, 0.2)',
                                     boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                     transition: 'all 0.3s ease',
                                     cursor: 'pointer',
                                     position: 'relative',
                                     '&:hover': {
                                       border: '1px solid rgba(255, 56, 100, 0.4)',
                                       boxShadow: '0 6px 30px rgba(255, 56, 100, 0.1)',
                                       transform: 'translateY(-1px)',
                                     }
                                   }}
                                 >
                                   <Box sx={{ flex: 1, mr: 2 }}>
                                     <Box>
                                       {(() => {
                                         const comboParts = item.combo.split(' to ');
                                         if (comboParts.length > 1) {
                                           return comboParts.map((part, partIndex) => (
                                             <Typography 
                                               key={partIndex}
                                               sx={{ 
                                                 color: '#FFFFFF',
                                                 fontSize: '0.9rem',
                                                 fontWeight: 500,
                                                 fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                                 mb: partIndex < comboParts.length - 1 ? 0.5 : 0,
                                               }}
                                             >
                                               {partIndex + 1}. {part}
                                             </Typography>
                                           ));
                                         } else {
                                           return (
                                             <Typography sx={{ 
                                               color: '#FFFFFF',
                                               fontSize: '0.9rem',
                                               fontWeight: 500,
                                               fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                             }}>
                                               1. {item.combo}
                                             </Typography>
                                           );
                                         }
                                       })()}
                                     </Box>
                                     {filterMinPunches && (
                                       <Typography sx={{
                                         color: '#FF3864',
                                         fontSize: '0.75rem',
                                         fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                         fontStyle: 'italic',
                                       }}>
                                         {countPunches(item.combo)} punches
                                       </Typography>
                                     )}
                                   </Box>
                                   <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 250 }}>
                                     <Box 
                                       sx={{ 
                                         width: `${Math.min(item.percentage * 2, 100)}%`,
                                         height: 24,
                                         background: 'linear-gradient(90deg, #FF3864, #FF6B35)',
                                         borderRadius: '12px',
                                         mr: 2,
                                         boxShadow: '0 0 10px rgba(255, 56, 100, 0.3)',
                                         minWidth: 20,
                                         position: 'relative',
                                         overflow: 'hidden',
                                         '&::after': {
                                           content: '""',
                                           position: 'absolute',
                                           top: 0,
                                           left: '-100%',
                                           width: '100%',
                                           height: '100%',
                                           background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                                           animation: 'shimmer 2s infinite',
                                         }
                                       }}
                                     />
                                     <Typography sx={{ 
                                       color: '#FF3864',
                                       fontSize: '0.9rem',
                                       fontWeight: 600,
                                       minWidth: 60,
                                       fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                       textShadow: '0 0 8px rgba(255, 56, 100, 0.3)',
                                     }}>
                                       {item.percentage.toFixed(1)}%
                                     </Typography>
                                   </Box>
                                 </Box>
                               </Grid>
                             ))}
                           </Grid>
                         )}
                       </Box>
                       
                       {/* Line Graph */}
                       <Box sx={{ 
                         width: '100%', 
                         height: 800, 
                         border: '1px solid rgba(255, 56, 100, 0.2)',
                         borderRadius: '12px',
                         p: 4,
                         background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.8) 0%, rgba(30, 40, 60, 0.6) 100%)',
                         boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                         position: 'relative',
                         mb: 4,
                       }}>
                         <Typography sx={{
                           color: '#FFFFFF',
                           fontSize: '1.3rem',
                           fontWeight: 700,
                           textTransform: 'uppercase',
                           letterSpacing: '0.05em',
                           mb: 4,
                           textAlign: 'center',
                         }}>
                           Combination Frequency Trend
                           {filterMinPunches && (
                             <Typography component="span" sx={{
                               color: '#FF3864',
                               fontSize: '0.8rem',
                               ml: 1,
                               fontWeight: 400,
                               fontStyle: 'italic',
                             }}>
                               (3+ punches)
                             </Typography>
                           )}
                         </Typography>
                         
                         {/* Info Section */}
                         <Box
                           sx={{
                             mt: 3,
                             p: 3,
                             borderRadius: '12px',
                             background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
                             border: '2px solid rgba(255, 56, 100, 0.3)',
                             boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 56, 100, 0.15), 0 0 60px rgba(255, 56, 100, 0.1)',
                             minHeight: 120,
                             display: 'flex',
                             flexDirection: 'column',
                             justifyContent: 'center',
                             alignItems: 'center',
                             transition: 'all 0.3s ease',
                           }}
                           id="defense-combo-info-section"
                         >
                           <Typography sx={{
                             color: '#FF3864',
                             fontSize: '1.1rem',
                             fontWeight: 700,
                             textTransform: 'uppercase',
                             letterSpacing: '0.05em',
                             mb: 2,
                             fontFamily: '"Orbitron", "Roboto Mono", monospace',
                             textAlign: 'center',
                           }}>
                             Click a data point to select it
                           </Typography>
                           <Box sx={{
                             textAlign: 'center',
                             mb: 1,
                           }} id="defense-info-combo">
                             <Typography sx={{
                               color: '#FFFFFF',
                               fontSize: '1.3rem',
                               fontWeight: 600,
                               fontFamily: '"Orbitron", "Roboto Mono", monospace',
                               textAlign: 'center',
                               lineHeight: 1.4,
                             }}>
                               -
                             </Typography>
                           </Box>
                           <Typography sx={{
                             color: '#FF3864',
                             fontSize: '1.8rem',
                             fontWeight: 800,
                             fontFamily: '"Orbitron", "Roboto Mono", monospace',
                             textShadow: '0 0 15px rgba(255, 56, 100, 0.5)',
                             textAlign: 'center',
                           }} id="defense-info-percentage">
                             -
                           </Typography>
                           
                         </Box>
                         
                         {/* Chart Container with proper spacing */}
                         <Box sx={{
                           width: '100%',
                           height: 'calc(100% - 200px)',
                           display: 'flex',
                           flexDirection: 'column',
                           alignItems: 'center',
                           justifyContent: 'center',
                           position: 'relative',
                         }}>
                           {absorbedWithPercentages.length === 0 ? (
                             <Box sx={{
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               height: '100%',
                               color: 'rgba(255, 255, 255, 0.7)',
                               fontSize: '1rem',
                               fontStyle: 'italic',
                             }}>
                               No data to display
                             </Box>
                           ) : (
                             <svg width="100%" height="100%" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
                               {/* Background gradient */}
                               <defs>
                                 <linearGradient id="defenseChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                   <stop offset="0%" stopColor="rgba(255, 56, 100, 0.05)" />
                                   <stop offset="100%" stopColor="rgba(255, 56, 100, 0.02)" />
                                 </linearGradient>
                                 <filter id="defenseGlow">
                                   <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                   <feMerge> 
                                     <feMergeNode in="coloredBlur"/>
                                     <feMergeNode in="SourceGraphic"/>
                                   </feMerge>
                                 </filter>
                               </defs>
                               
                               {/* Chart area background */}
                               <rect
                                 x="100"
                                 y="60"
                                 width="800"
                                 height="320"
                                 fill="url(#defenseChartGradient)"
                                 rx="6"
                               />
                               
                               {/* Grid lines with better styling */}
                               {[0, 25, 50, 75, 100].map((y, index) => (
                                 <g key={index}>
                                   <line
                                     x1="100"
                                     y1={380 - (y * 3.2)}
                                     x2="900"
                                     y2={380 - (y * 3.2)}
                                     stroke={y === 50 ? "rgba(255, 56, 100, 0.2)" : "rgba(255, 56, 100, 0.1)"}
                                     strokeWidth={y === 50 ? "2" : "1"}
                                     strokeDasharray={y === 50 ? "none" : "5,5"}
                                   />
                                   <text
                                     x="90"
                                     y={380 - (y * 3.2) + 4}
                                     fontSize="14"
                                     fill={y === 50 ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.6)"}
                                     textAnchor="end"
                                     fontFamily='"Orbitron", "Roboto Mono", monospace'
                                     fontWeight={y === 50 ? "600" : "400"}
                                   >
                                     {y}%
                                   </text>
                                 </g>
                               ))}
                               
                               {/* Area fill under the line */}
                               <path
                                 d={`M 100,380 ${absorbedWithPercentages.slice(0, 10).map((item, index) => {
                                   const totalItems = Math.min(absorbedWithPercentages.length, 10);
                                   const spacing = 800 / (totalItems - 1 || 1);
                                   const x = 100 + (index * spacing);
                                   return `L ${x},${380 - (item.percentage * 3.2)}`;
                                 }).join(' ')} L ${100 + (Math.min(absorbedWithPercentages.length, 10) - 1) * (800 / (Math.min(absorbedWithPercentages.length, 10) - 1 || 1))},380 Z`}
                                 fill="url(#defenseChartGradient)"
                                 opacity="0.3"
                               />
                               
                               {/* Enhanced line chart with gradient */}
                               <polyline
                                 fill="none"
                                 stroke="url(#defenseChartGradient)"
                                 strokeWidth="4"
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 points={absorbedWithPercentages.slice(0, 10).map((item, index) => {
                                   const totalItems = Math.min(absorbedWithPercentages.length, 10);
                                   const spacing = 800 / (totalItems - 1 || 1);
                                   const x = 100 + (index * spacing);
                                   return `${x},${380 - (item.percentage * 3.2)}`;
                                 }).join(' ')}
                                 filter="url(#defenseGlow)"
                               />
                               
                               {/* Interactive data points with hover effects */}
                               {absorbedWithPercentages.slice(0, 10).map((item, index) => {
                                 const totalItems = Math.min(absorbedWithPercentages.length, 10);
                                 const spacing = 800 / (totalItems - 1 || 1);
                                 const x = 100 + (index * spacing);
                                 const y = 380 - (item.percentage * 3.2);
                                 const isSelected = selectedPoint === index;
                                 
                                 return (
                                   <g key={index}>
                                     {/* Data point */}
                                     <circle
                                       cx={x}
                                       cy={y}
                                       r="12"
                                       fill={isSelected ? "#FF6B35" : "#FF3864"}
                                       stroke="rgba(10, 14, 23, 0.95)"
                                       strokeWidth={isSelected ? "4" : "3"}
                                       filter={isSelected ? "drop-shadow(0 0 15px rgba(255, 107, 53, 0.9))" : "drop-shadow(0 0 12px rgba(255, 56, 100, 0.8))"}
                                     />
                                     {/* Inner glow */}
                                     <circle
                                       cx={x}
                                       cy={y}
                                       r="6"
                                       fill={isSelected ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.9)"}
                                     />
                                     {/* Hover area - placed last so it's on top */}
                                     <circle
                                       cx={x}
                                       cy={y}
                                       r="40"
                                       fill="transparent"
                                       cursor="pointer"
                                       onMouseEnter={(e) => {
                                         const comboText = document.getElementById('defense-info-combo');
                                         const percentageText = document.getElementById('defense-info-percentage');
                                         
                                         if (comboText && percentageText) {
                                           // Format combo with line breaks
                                           const comboParts = item.combo.split(' to ');
                                           if (comboParts.length > 1) {
                                             comboText.innerHTML = comboParts.map((part, index) => 
                                               `<div style="margin-bottom: 4px;">${index + 1}. ${part}</div>`
                                             ).join('');
                                           } else {
                                             comboText.textContent = item.combo;
                                           }
                                           percentageText.textContent = `${item.percentage.toFixed(1)}%`;
                                         }
                                       }}
                                       onMouseLeave={() => {
                                         // Only clear info if no point is selected
                                         if (selectedPoint === null) {
                                           const comboText = document.getElementById('defense-info-combo');
                                           const percentageText = document.getElementById('defense-info-percentage');
                                           
                                           if (comboText && percentageText) {
                                             comboText.innerHTML = '<div>-</div>';
                                             percentageText.textContent = '-';
                                           }
                                         }
                                       }}
                                       onClick={() => {
                                         if (selectedPoint === index) {
                                           // Deselect if clicking the same point
                                           setSelectedPoint(null);
                                           const comboText = document.getElementById('defense-info-combo');
                                           const percentageText = document.getElementById('defense-info-percentage');
                                           
                                           if (comboText && percentageText) {
                                             comboText.innerHTML = '<div>-</div>';
                                             percentageText.textContent = '-';
                                           }
                                         } else {
                                           // Select new point
                                           setSelectedPoint(index);
                                           const comboText = document.getElementById('defense-info-combo');
                                           const percentageText = document.getElementById('defense-info-percentage');
                                           
                                           if (comboText && percentageText) {
                                             // Format combo with line breaks
                                             const comboParts = item.combo.split(' to ');
                                             if (comboParts.length > 1) {
                                               comboText.innerHTML = comboParts.map((part, index) => 
                                                 `<div style="margin-bottom: 4px;">${index + 1}. ${part}</div>`
                                               ).join('');
                                             } else {
                                               comboText.textContent = item.combo;
                                             }
                                             percentageText.textContent = `${item.percentage.toFixed(1)}%`;
                                           }
                                         }
                                       }}
                                     />
                                   </g>
                                 );
                               })}
                               
                               {/* Enhanced axes */}
                               <line
                                 x1="100"
                                 y1="60"
                                 x2="100"
                                 y2="380"
                                 stroke="rgba(255, 56, 100, 0.4)"
                                 strokeWidth="2"
                               />
                               <line
                                 x1="100"
                                 y1="380"
                                 x2="900"
                                 y2="380"
                                 stroke="rgba(255, 56, 100, 0.4)"
                                 strokeWidth="2"
                               />
                               
                               {/* Axis labels */}
                               <text
                                 x="40"
                                 y="220"
                                 fontSize="16"
                                 fill="rgba(255, 255, 255, 0.8)"
                                 textAnchor="middle"
                                 fontFamily='"Orbitron", "Roboto Mono", monospace'
                                 fontWeight="600"
                                 transform="rotate(-90 40 220)"
                               >
                                 FREQUENCY %
                               </text>
                               <text
                                 x="500"
                                 y="470"
                                 fontSize="16"
                                 fill="rgba(255, 255, 255, 0.8)"
                                 textAnchor="middle"
                                 fontFamily='"Orbitron", "Roboto Mono", monospace'
                                 fontWeight="600"
                               >
                                 COMBINATIONS
                               </text>
                             </svg>
                           )}
                         </Box>
                         
                         
                       </Box>
                     </Box>
                   </Collapse>
                 </Box>
               </Grid>
             </Grid>
           </Box>
         </Collapse>
       </Paper>
     </>
   );
 };
 
 export default ComboInfo; 