import React from 'react';
import { Paper, Typography, Grid, Box, CircularProgress, Tooltip } from '@mui/material';
import { Fighter } from '../../types/firestore';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useBasicInfo } from '../../hooks/stats/useBasicInfo';

interface BasicInfoProps {
  fighter: Fighter;
  weightClassAvgData?: any; // Renamed from weightClassData
}

const BasicInfo: React.FC<BasicInfoProps> = ({ fighter, weightClassAvgData }): JSX.Element => {
  // Use the hook to get all calculated data
  const {
    hasPositionalData,
    weightClassStats,
    prepareRadarData,
    calculateAggressivenessRating,
    calculateStrikesPerMinute,
    calculateWeightClassStrikesPerMinute,
    calculateStrikingRating,
    calculateTakedownRating,
    calculateDefenseRating,
    calculateFinishRating,
    calculatePositionalRating,
    calculateOverallRating,
    calculateKOTKOWinPercentage,
    calculateSubmissionWinPercentage,
    calculateDecisionWinPercentage,
    calculateKOTKOLossPercentage,
    calculateSubmissionLossPercentage,
    calculateDecisionLossPercentage,
    calculateOrthodoxWinRate,
    calculateSouthpawWinRate,
    calculateSwitchWinRate,
    getTotalFightsVsStance
  } = useBasicInfo(fighter, weightClassAvgData);

  // Get calculated values
  const aggressivenessRating = calculateAggressivenessRating();
  const strikesPerMinute = calculateStrikesPerMinute();
  const weightClassStrikesPerMinute = calculateWeightClassStrikesPerMinute();
  const overallRating = calculateOverallRating();

  // Enhanced Rating Card Stylesheet (matching Strike Distribution Analysis)
  const ratingCardStyles = {
    // CSS keyframes for gradient animation
    '@keyframes gradientShift': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
    // Main card container
    card: {
      p: 3,
      borderRadius: '12px',
      bgcolor: 'rgba(10, 14, 23, 0.4)',
      border: '1px solid rgba(0, 240, 255, 0.15)',
      height: '100%',
      position: 'relative' as const,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: 'rgba(10, 14, 23, 0.6)',
        transform: 'translateY(-2px)',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        '& .rating-icon': {
          transform: 'scale(1.1)',
        },
        '& .rating-progress': {
          transform: 'scale(1.05)',
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
    },

    // Header section
    header: {
      display: 'flex',
      alignItems: 'center',
      mb: 2,
      gap: 1.5,
    },

    // Icon container
    icon: {
      width: 40,
      height: 40,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.9), rgba(10, 14, 23, 0.7))',
      border: '1px solid rgba(0, 240, 255, 0.2)',
      transition: 'transform 0.3s ease',
    },

    // Title styling
    title: {
      color: '#fff',
      fontWeight: 600,
      fontSize: '1.1rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },

    // Metrics container
    metrics: {
      mb: 3,
    },

    // Rating value styling
    ratingValue: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#00F0FF',
      textShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
      fontFamily: 'monospace',
    },

    // Rating unit styling
    ratingUnit: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontFamily: 'monospace',
    },

    // Weight class comparison
    weightClassComparison: {
      mb: 2,
      p: 2,
      bgcolor: 'rgba(10, 14, 23, 0.6)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 56, 100, 0.1)',
    },

    // Weight class label
    weightClassLabel: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '0.85rem',
      mb: 0.5,
      fontWeight: 500,
    },

    // Weight class value
    weightClassValue: {
      color: '#FF3864',
      fontSize: '0.9rem',
      fontFamily: 'monospace',
    },

    // Description
    description: {
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: '0.9rem',
      mb: 2,
      fontStyle: 'italic',
    },

    // Progress bar container
    progressContainer: {
      position: 'relative' as const,
    },

    // Progress bar label
    progressLabel: {
      color: 'rgba(255, 255, 255, 0.9)',
      mb: 1,
      fontSize: '0.9rem',
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'monospace',
    },

    // Progress bar
    progressBar: {
      height: 8,
      borderRadius: 4,
      bgcolor: 'rgba(10, 14, 23, 0.6)',
      border: '1px solid rgba(0, 240, 255, 0.1)',
      overflow: 'hidden',
      transition: 'transform 0.3s ease',
      position: 'relative' as const,
    },

    // Progress bar fill
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
      borderRadius: 4,
      transition: 'width 0.3s ease',
      position: 'relative' as const,
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: '4px',
        height: '100%',
        background: '#fff',
        opacity: 0.5,
        filter: 'blur(2px)',
      }
    },

    // Overall rating specific styles
    overallCard: {
      background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
      border: '2px solid rgba(0, 150, 255, 0.3)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 150, 255, 0.15), 0 0 60px rgba(0, 150, 255, 0.1)',
      '&:hover': {
        border: '2px solid rgba(0, 150, 255, 0.5)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 150, 255, 0.25), 0 0 80px rgba(0, 150, 255, 0.15)',
      }
    },

    overallValue: {
      fontSize: { xs: '3.5rem', sm: '4rem' },
      fontWeight: 900,
      background: 'linear-gradient(135deg, #FFFFFF 0%, #00F0FF 30%, #0096FF 70%, #0066FF 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 40px rgba(255, 255, 255, 0.6)',
      fontFamily: '"Orbitron", "Roboto", sans-serif',
      letterSpacing: '0.15em',
      mb: 1,
    },

    overallLabel: {
      color: '#FFFFFF',
      fontSize: '1rem',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.2em',
      textAlign: 'center' as const,
      textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
    },

    // Circular progress styling
    circularProgress: {
      color: '#00F0FF',
      filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.5))',
      '& .MuiCircularProgress-circle': {
        strokeLinecap: 'round',
        filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.3))',
      },
    },

    // Archetype styling
    archetype: {
      color: '#FFFFFF',
      fontWeight: 800,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.15em',
      textShadow: '0 0 20px rgba(255, 255, 255, 0.4)',
      fontSize: '1.5rem',
      mb: 2,
    },

    // Strengths container
    strengthsContainer: {
      p: 2,
      borderRadius: '12px',
      background: 'linear-gradient(135deg, rgba(0, 150, 255, 0.1) 0%, rgba(0, 100, 200, 0.05) 100%)',
      border: '1px solid rgba(0, 150, 255, 0.2)',
      backdropFilter: 'blur(10px)',
    },

    // Strength tag styling
    strengthTag: {
      px: 2,
      py: 0.5,
      borderRadius: '20px',
      background: 'linear-gradient(135deg, rgba(0, 150, 255, 0.2) 0%, rgba(0, 100, 200, 0.1) 100%)',
      border: '1px solid rgba(0, 150, 255, 0.3)',
      backdropFilter: 'blur(5px)',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'linear-gradient(135deg, rgba(0, 150, 255, 0.3) 0%, rgba(0, 100, 200, 0.2) 100%)',
        transform: 'scale(1.05)',
      }
    },

    strengthText: {
      color: '#FFFFFF',
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
    }
  };


  // Add CSS keyframes for gradient animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Custom tooltip component for the radar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Get detailed positional breakdown for Position metric
      const getPositionalBreakdown = () => {
        if (data.subject === 'Position') {
          const centerOctagon = fighter.CenterOctagon || 0;
          const pushedBackToCage = fighter.PushedBackToCage || 0;
          const pushingAgainstCage = fighter.PushingAgainstCage || 0;
          const beingClinched = fighter.clinch_stats?.BeingClinched || 0;
          const inClinch = fighter.clinch_stats?.InClinch || 0;
          const onBottomGround = fighter.ground_stats?.OnBottomGround || 0;
          const onTopGround = fighter.ground_stats?.OnTopGround || 0;
          
          const totalEvents = centerOctagon + pushedBackToCage + pushingAgainstCage + 
                             beingClinched + inClinch + onBottomGround + onTopGround;
          
          if (totalEvents > 0) {
            const dominantEvents = centerOctagon + pushingAgainstCage + inClinch + onTopGround;
            const submissiveEvents = pushedBackToCage + beingClinched + onBottomGround;
            
            return (
              <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem', mb: 0.5 }}>
                  <strong>Dominant:</strong> {((dominantEvents/totalEvents)*100).toFixed(0)}%
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem' }}>
                  <strong>Defensive:</strong> {((submissiveEvents/totalEvents)*100).toFixed(0)}%
                </Typography>
              </Box>
            );
          }
        }
        return null;
      };
      
      return (
        <Box
          sx={{
            bgcolor: 'rgba(10, 14, 23, 0.95)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            p: 2,
            borderRadius: '6px',
            backdropFilter: 'blur(10px)',
            maxWidth: 280,
            boxShadow: '0 4px 12px rgba(0, 240, 255, 0.1)',
          }}
        >
          <Typography sx={{ color: '#00F0FF', fontWeight: 600, mb: 1 }}>
            {data.subject}
          </Typography>
          <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
            Fighter: {(data.subject === 'Striking' || data.subject === 'Aggression' || data.subject === 'Takedowns' || data.subject === 'Defense' || data.subject === 'Finishes' || data.subject === 'Position') ? data.value.toFixed(0) : data.value.toFixed(1) + '%'}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', mb: 1 }}>
            {(data.subject === 'Striking' || data.subject === 'Aggression' || data.subject === 'Takedowns' || data.subject === 'Defense' || data.subject === 'Finishes' || data.subject === 'Position') ? 'Weight Class Avg: 50' : `UFC Avg: ${data.ufc_average}%`}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem' }}>
            {data.description}
          </Typography>
          {getPositionalBreakdown()}
        </Box>
      );
    }
    return null;
  };

  // Common styles
  const sectionHeaderStyle = {
    mb: 3,
    color: '#fff',
    fontWeight: 600,
    fontSize: '1.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    position: 'relative',
    display: 'inline-block',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -8,
      left: 0,
      width: '60%',
      height: '2px',
      background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.7), transparent)',
    }
  };

  // Enhanced radar chart section
  const renderPerformanceAnalysis = () => {
    const radarData = prepareRadarData;
    const hasEnoughData = fighter.FightsTracked && fighter.FightsTracked >= 2;

    return (
      <Box sx={{
        ...ratingCardStyles.card,
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.95) 0%, rgba(10, 14, 23, 0.8) 100%)',
      }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={sectionHeaderStyle}>
            Performance Analysis
          </Typography>
          <Typography 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.9rem',
              mt: 1,
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
            {hasEnoughData 
              ? 'Comprehensive breakdown of fighter performance metrics compared to UFC averages'
              : 'Limited data available - Analysis may not be fully representative'}
          </Typography>
        </Box>
        
        {hasEnoughData && radarData.length > 0 ? (
          <Box sx={{ flex: 1, width: '100%', position: 'relative' }}>
            <ResponsiveContainer>
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid 
                  stroke="rgba(0, 240, 255, 0.1)"
                  gridType="circle"
                />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ 
                    fill: '#fff',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                  stroke="rgba(0, 240, 255, 0.2)"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tick={{ 
                    fill: 'rgba(255, 255, 255, 0.5)',
                    fontSize: 10 
                  }}
                  stroke="rgba(0, 240, 255, 0.1)"
                />
                {/* UFC Average Radar */}
                <Radar
                  name="UFC Average"
                  dataKey="ufc_average"
                  stroke="#FF3864"
                  fill="#FF3864"
                  fillOpacity={0.15}
                />
                {/* Fighter Stats Radar */}
                <Radar
                  name="Fighter Stats"
                  dataKey="value"
                  stroke="#00F0FF"
                  fill="#00F0FF"
                  fillOpacity={0.3}
                />
                <RechartsTooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <Box 
              sx={{ 
                position: 'absolute',
                bottom: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 3,
                bgcolor: 'rgba(10, 14, 23, 0.9)',
                p: 1,
                borderRadius: '6px',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                backdropFilter: 'blur(5px)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  bgcolor: '#00F0FF',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                }} />
                <Typography sx={{ color: '#fff', fontSize: '0.8rem' }}>Fighter</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#FF3864', borderRadius: '50%', opacity: 0.8 }} />
                <Typography sx={{ color: '#fff', fontSize: '0.8rem' }}>UFC Average</Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box 
            sx={{ 
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2,
              bgcolor: 'rgba(10, 14, 23, 0.4)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 240, 255, 0.1)',
              p: 4,
            }}
          >
            <Typography 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                maxWidth: 400,
              }}
            >
              Not enough fight data available for comprehensive analysis.
              Minimum 2 fights required for reliable performance metrics.
            </Typography>
            <Typography 
              sx={{ 
                color: '#00F0FF',
                fontSize: '0.9rem',
                fontWeight: 500,
                textShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
              }}
            >
              Current fights tracked: {fighter.FightsTracked || 0}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // Add the new outcome stats section
  const renderOutcomeStats = () => (
    <Grid item xs={12}>
      <Box sx={ratingCardStyles.card}>
        <Typography variant="h6" sx={sectionHeaderStyle}>
          Fight Outcome Analysis
        </Typography>
        <Typography 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            mb: 4,
            fontSize: '0.9rem',
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
          Detailed breakdown of fight outcomes and performance against different stances
        </Typography>
        <Grid container spacing={4}>
          {[
            { 
              label: 'KO/TKO Wins',
              icon: <Box sx={{
                width: '24px',
                height: '24px',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#00F0FF',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid #00F0FF',
                  opacity: 0.5,
                }
              }}/>,
              value: calculateKOTKOWinPercentage(),
              avgValue: weightClassStats.koTkoWinPercentage,
              color: '#00F0FF',
              description: 'Percentage of wins by KO/TKO',
              gradient: 'linear-gradient(90deg, #00F0FF, #0066FF)'
            },
            { 
              label: 'Decision Wins',
              icon: <Box sx={{
                width: '24px',
                height: '24px',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '16px',
                  height: '16px',
                  border: '2px solid #00F0FF',
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                }
              }}/>,
              value: calculateDecisionWinPercentage(),
              avgValue: weightClassStats.decisionWinPercentage,
              color: '#00F0FF',
              description: 'Percentage of wins by decision',
              gradient: 'linear-gradient(90deg, #00F0FF, #0066FF)'
            },
            { 
              label: 'KO/TKO Losses',
              icon: <Box sx={{
                width: '24px',
                height: '24px',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '16px',
                  height: '2px',
                  background: '#FF3864',
                  boxShadow: '0 0 10px rgba(255, 56, 100, 0.5)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '2px',
                  height: '16px',
                  background: '#FF3864',
                  boxShadow: '0 0 10px rgba(255, 56, 100, 0.5)',
                }
              }}/>,
              value: calculateKOTKOLossPercentage(),
              avgValue: weightClassStats.koTkoLossPercentage,
              color: '#FF3864',
              description: 'Percentage of losses by KO/TKO',
              gradient: 'linear-gradient(90deg, #FF3864, #CC1F41)'
            },
            { 
              label: 'Submission Losses',
              icon: <Box sx={{
                width: '24px',
                height: '24px',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '16px',
                  height: '16px',
                  border: '2px solid #FF3864',
                  borderRadius: '4px',
                  boxShadow: '0 0 10px rgba(255, 56, 100, 0.3)',
                }
              }}/>,
              value: calculateSubmissionLossPercentage(),
              avgValue: weightClassStats.submissionLossPercentage,
              color: '#FF3864',
              description: 'Percentage of losses by submission',
              gradient: 'linear-gradient(90deg, #FF3864, #CC1F41)'
            },
            { 
              label: 'Decision Losses',
              icon: <Box sx={{
                width: '24px',
                height: '24px',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '16px',
                  height: '16px',
                  border: '2px solid #FF3864',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px rgba(255, 56, 100, 0.3)',
                }
              }}/>,
              value: calculateDecisionLossPercentage(),
              avgValue: weightClassStats.decisionLossPercentage,
              color: '#FF3864',
              description: 'Percentage of losses by decision',
              gradient: 'linear-gradient(90deg, #FF3864, #CC1F41)'
            },
            { 
              label: 'vs Orthodox',
              icon: <Box sx={{
                width: '24px',
                height: '24px',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#00F0FF',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid #00F0FF',
                  opacity: 0.5,
                }
              }}/>,
              value: calculateOrthodoxWinRate(),
              avgValue: weightClassStats.orthodoxWinRate,
              fights: getTotalFightsVsStance(
                fighter.stance_matchup_stats?.WinsVsOrthodox,
                fighter.stance_matchup_stats?.LossesVsOrthodox
              ),
              color: '#00F0FF',
              description: 'Win rate against orthodox fighters',
              gradient: 'linear-gradient(90deg, #00F0FF, #0066FF)',
              isStance: true
            }
          ].map((outcome) => (
            <Grid item xs={12} md={4} key={outcome.label}>
              <Box 
                sx={{ 
                  p: 3,
                  borderRadius: '12px',
                  bgcolor: 'rgba(10, 14, 23, 0.4)',
                  border: '1px solid rgba(0, 240, 255, 0.15)',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(10, 14, 23, 0.6)',
                    transform: 'translateY(-2px)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    '& .outcome-icon': {
                      transform: 'scale(1.1)',
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: outcome.gradient,
                    opacity: 0.5,
                  }
                }}
              >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                  <Box 
                    className="outcome-icon"
                    sx={{ 
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.9), rgba(10, 14, 23, 0.7))',
                      border: '1px solid rgba(0, 240, 255, 0.2)',
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    {outcome.icon}
                  </Box>
                  <Typography 
                    sx={{ 
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {outcome.label}
                  </Typography>
                </Box>

                {/* Metrics */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                    <Typography 
                      sx={{ 
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: outcome.color,
                        textShadow: `0 0 20px ${outcome.color}40`,
                        fontFamily: 'monospace',
                      }}
                    >
                      {outcome.value.toFixed(1)}
                    </Typography>
                    <Typography sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontFamily: 'monospace',
                    }}>
                      %
                    </Typography>
                  </Box>
                  
                  {/* Weight Class Comparison */}
                  {weightClassAvgData && (
                    <Box sx={{ 
                      mb: 2, 
                      p: 2, 
                      bgcolor: 'rgba(10, 14, 23, 0.6)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 56, 100, 0.1)',
                    }}>
                      <Typography sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.85rem',
                        mb: 0.5,
                        fontWeight: 500,
                      }}>
                        Weight Class Average:
                      </Typography>
                      <Typography sx={{ 
                        color: '#FF3864',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace',
                      }}>
                        {outcome.avgValue.toFixed(1)}%
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.9rem',
                      mb: 2,
                      fontStyle: 'italic',
                    }}
                  >
                    {outcome.description}
                  </Typography>
                </Box>

                {/* Progress Bar */}
                <Box sx={{ position: 'relative' }}>
                  <Typography 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      mb: 1,
                      fontSize: '0.9rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'monospace',
                    }}
                  >
                    <span>Fighter Rate</span>
                    <span style={{ color: outcome.color }}>
                      {outcome.value.toFixed(1)}%
                    </span>
                  </Typography>
                  <Box 
                    sx={{ 
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(10, 14, 23, 0.6)',
                      border: '1px solid rgba(0, 240, 255, 0.1)',
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease',
                      position: 'relative',
                      mb: weightClassAvgData ? 2 : 0,
                    }}
                  >
                    <Box 
                      sx={{
                        width: `${outcome.value}%`,
                        height: '100%',
                        background: outcome.gradient,
                        borderRadius: 4,
                        transition: 'width 0.3s ease',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '4px',
                          height: '100%',
                          background: '#fff',
                          opacity: 0.5,
                          filter: 'blur(2px)',
                        }
                      }}
                    />
                  </Box>
                  
                  {/* Weight Class Progress Bar */}
                  {weightClassAvgData && (
                    <>
                      <Typography 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.7)',
                          mb: 1,
                          fontSize: '0.85rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontFamily: 'monospace',
                        }}
                      >
                        <span>Class Average</span>
                        <span style={{ color: '#FF3864' }}>
                          {outcome.avgValue.toFixed(1)}%
                        </span>
                      </Typography>
                      <Box 
                        sx={{ 
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(10, 14, 23, 0.6)',
                          border: '1px solid rgba(255, 56, 100, 0.1)',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        <Box 
                          sx={{
                            width: `${outcome.avgValue}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #FF3864, #CC1F41)',
                            borderRadius: 3,
                            transition: 'width 0.3s ease',
                            opacity: 0.8,
                          }}
                        />
                      </Box>
                    </>
                  )}

                  {/* Stance-specific info */}
                  {outcome.isStance && outcome.fights && (
                    <Typography sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)', 
                      fontSize: '0.8rem', 
                      mt: 1,
                      fontStyle: 'italic'
                    }}>
                      {outcome.fights >= 2 
                        ? `Based on ${outcome.fights} fights`
                        : `Not enough data${outcome.fights > 0 ? ` (${outcome.fights} fight${outcome.fights === 1 ? '' : 's'})` : ''}`
                      }
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Grid>
  );

  return (
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
      {/* Header Section */}
      <Box sx={{ mb: 6, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            component="img"
            src="/icon.png"
            alt="Fighter Analytics Icon"
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
            Fighter Analytics
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
          Comprehensive analysis based on {fighter.FightsTracked || 0} fights and {fighter.RoundsTracked || 0} rounds of data
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Overall Rating Section */}
        <Grid item xs={12}>
          <Box sx={{
            ...ratingCardStyles.card,
            mb: 4,
            p: 4,
            background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.95) 0%, rgba(10, 14, 23, 0.8) 100%)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            '&:hover': {
              bgcolor: 'rgba(10, 14, 23, 0.7)',
              transform: 'translateY(-2px)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
            }
          }}>
            {/* Header */}
            <Box sx={ratingCardStyles.header}>
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
                    background: '#00F0FF',
                    borderRadius: '50%',
                    boxShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '28px',
                    height: '28px',
                    border: '2px solid #00F0FF',
                    borderRadius: '50%',
                    opacity: 0.3,
                  }
                }}/>
              </Box>
              <Typography sx={{
                ...ratingCardStyles.title,
                fontSize: '1.3rem',
              }}>
                Overall Rating
              </Typography>
            </Box>

            <Grid container spacing={4} alignItems="center">
              {/* Main Rating Display */}
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', position: 'relative' }}>
                  {/* Modern Minimalistic Rating Display */}
                  <Box sx={{ 
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                    border: '2px solid rgba(0, 240, 255, 0.2)',
                    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 240, 255, 0.1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'conic-gradient(from 0deg, #00F0FF 0deg, #00F0FF ' + (overallRating.rating * 3.6) + 'deg, rgba(0, 240, 255, 0.1) ' + (overallRating.rating * 3.6) + 'deg, rgba(0, 240, 255, 0.1) 360deg)',
                      zIndex: 1,
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: 'rgba(10, 14, 23, 0.95)',
                      border: '1px solid rgba(0, 240, 255, 0.15)',
                      zIndex: 2,
                    }
                  }}>
                    {/* Rating Text */}
                    <Box sx={{
                      position: 'relative',
                      zIndex: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Typography
                        sx={{
                          fontSize: '2.2rem',
                          fontWeight: 800,
                          color: '#00F0FF',
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          letterSpacing: '0.1em',
                          lineHeight: 1,
                          textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                        }}
                      >
                        {overallRating.rating}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.15em',
                          marginTop: '-2px',
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        }}
                      >
                        Rating
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Subtle glow effect */}
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
                    zIndex: 0,
                    filter: 'blur(8px)',
                  }} />
                </Box>
              </Grid>

              {/* Metrics and Analysis */}
              <Grid item xs={12} md={8}>
                {/* Archetype */}
                <Typography 
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    textShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
                    fontSize: '1.2rem',
                    mb: 2,
                  }}
                >
                  {overallRating.archetype}
                </Typography>
                
                {/* Description */}
                <Typography sx={{
                  ...ratingCardStyles.description,
                  mb: 3,
                }}>
                  Comprehensive fighter rating based on all performance metrics compared to weight class averages
                </Typography>
                
                {/* Strengths */}
                <Box sx={{
                  p: 2,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(0, 150, 255, 0.08) 0%, rgba(0, 100, 200, 0.04) 100%)',
                  border: '1px solid rgba(0, 150, 255, 0.15)',
                  backdropFilter: 'blur(5px)',
                }}>
                  <Typography sx={{ 
                    color: '#FFFFFF', 
                    fontWeight: 600, 
                    mb: 1.5,
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Key Strengths
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {overallRating.strengths.map((strength, index) => (
                      <Box
                        key={index}
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, rgba(0, 150, 255, 0.15) 0%, rgba(0, 100, 200, 0.08) 100%)',
                          border: '1px solid rgba(0, 150, 255, 0.25)',
                          backdropFilter: 'blur(3px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(0, 150, 255, 0.25) 0%, rgba(0, 100, 200, 0.15) 100%)',
                            transform: 'scale(1.02)',
                          }
                        }}
                      >
                        <Typography sx={{
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          letterSpacing: '0.03em',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                        }}>
                          {strength}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Key Metrics Section with Circular Progress */}
        <Grid item xs={12}>
          <Grid container spacing={3} justifyContent="center">
            {/* Striking Rating */}
            <Grid item xs={12} sm={6} md={4}>
              <Tooltip 
                title="Comprehensive striking rating based on accuracy and volume compared to weight class averages"
                placement="top"
                arrow
              >
                <Box sx={ratingCardStyles.card}>
                  {/* Header */}
                  <Box sx={ratingCardStyles.header}>
                    <Box 
                      className="rating-icon"
                      sx={ratingCardStyles.icon}
                    >
                      <Box sx={{
                        width: '24px',
                        height: '24px',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#00F0FF',
                          boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: '2px solid #00F0FF',
                          opacity: 0.5,
                        }
                      }}/>
                    </Box>
                    <Typography sx={ratingCardStyles.title}>
                      Striking
                    </Typography>
                  </Box>

                  {/* Metrics */}
                  <Box sx={ratingCardStyles.metrics}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                      <Typography sx={ratingCardStyles.ratingValue}>
                        {calculateStrikingRating()}
                      </Typography>
                      <Typography sx={ratingCardStyles.ratingUnit}>
                        / 100 rating
                      </Typography>
                    </Box>
                    
                    {/* Weight Class Comparison */}
                    {weightClassAvgData && (
                      <Box sx={ratingCardStyles.weightClassComparison}>
                        <Typography sx={ratingCardStyles.weightClassLabel}>
                          Weight Class Average:
                        </Typography>
                        <Typography sx={ratingCardStyles.weightClassValue}>
                          50 rating
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography sx={ratingCardStyles.description}>
                      Comprehensive striking rating based on accuracy and volume compared to weight class averages
                    </Typography>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={ratingCardStyles.progressContainer}>
                    <Typography sx={ratingCardStyles.progressLabel}>
                      <span>Fighter Rating</span>
                      <span style={{ color: '#00F0FF' }}>
                        {calculateStrikingRating()}%
                      </span>
                    </Typography>
                    <Box 
                      className="rating-progress"
                      sx={ratingCardStyles.progressBar}
                    >
                      <Box 
                        sx={{
                          ...ratingCardStyles.progressFill,
                          width: `${calculateStrikingRating()}%`,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Tooltip>
            </Grid>

            {/* Aggression Rating */}
            {hasPositionalData && (
              <Grid item xs={12} sm={6} md={4}>
                <Tooltip 
                  title="Fighting aggressiveness and activity level compared to weight class peers"
                  placement="top"
                  arrow
                >
                  <Box sx={ratingCardStyles.card}>
                    {/* Header */}
                    <Box sx={ratingCardStyles.header}>
                      <Box 
                        className="rating-icon"
                        sx={ratingCardStyles.icon}
                      >
                        <Box sx={{
                          width: '24px',
                          height: '24px',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '16px',
                            height: '16px',
                            border: '2px solid #00F0FF',
                            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                          }
                        }}/>
                      </Box>
                      <Typography sx={ratingCardStyles.title}>
                        Aggression
                      </Typography>
                    </Box>

                    {/* Metrics */}
                    <Box sx={ratingCardStyles.metrics}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                        <Typography sx={ratingCardStyles.ratingValue}>
                          {typeof aggressivenessRating === 'number' ? aggressivenessRating : 'N/A'}
                        </Typography>
                        <Typography sx={ratingCardStyles.ratingUnit}>
                          / 100 rating
                        </Typography>
                      </Box>
                      
                      {/* Weight Class Comparison */}
                      {weightClassAvgData && (
                        <Box sx={ratingCardStyles.weightClassComparison}>
                          <Typography sx={ratingCardStyles.weightClassLabel}>
                            Weight Class Average:
                          </Typography>
                          <Typography sx={ratingCardStyles.weightClassValue}>
                            50 rating
                          </Typography>
                        </Box>
                      )}
                      
                      <Typography sx={ratingCardStyles.description}>
                        Fighting aggressiveness and activity level compared to weight class peers
                      </Typography>
                    </Box>

                    {/* Progress Bar */}
                    {typeof aggressivenessRating === 'number' && (
                      <Box sx={ratingCardStyles.progressContainer}>
                        <Typography sx={ratingCardStyles.progressLabel}>
                          <span>Fighter Rating</span>
                          <span style={{ color: '#00F0FF' }}>
                            {aggressivenessRating}%
                          </span>
                        </Typography>
                        <Box 
                          className="rating-progress"
                          sx={ratingCardStyles.progressBar}
                        >
                          <Box 
                            sx={{
                              ...ratingCardStyles.progressFill,
                              width: `${aggressivenessRating}%`,
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Tooltip>
              </Grid>
            )}

            {/* Takedowns Rating */}
            <Grid item xs={12} sm={6} md={4}>
              <Tooltip 
                title="Takedown effectiveness based on success rate and frequency compared to weight class"
                placement="top"
                arrow
              >
                <Box sx={ratingCardStyles.card}>
                  {/* Header */}
                  <Box sx={ratingCardStyles.header}>
                    <Box 
                      className="rating-icon"
                      sx={ratingCardStyles.icon}
                    >
                      <Box sx={{
                        width: '24px',
                        height: '24px',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '16px',
                          height: '2px',
                          background: '#00F0FF',
                          boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '2px',
                          height: '16px',
                          background: '#00F0FF',
                          boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                        }
                      }}/>
                    </Box>
                    <Typography sx={ratingCardStyles.title}>
                      Takedowns
                    </Typography>
                  </Box>

                  {/* Metrics */}
                  <Box sx={ratingCardStyles.metrics}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                      <Typography sx={ratingCardStyles.ratingValue}>
                        {calculateTakedownRating()}
                      </Typography>
                      <Typography sx={ratingCardStyles.ratingUnit}>
                        / 100 rating
                      </Typography>
                    </Box>
                    
                    {/* Weight Class Comparison */}
                    {weightClassAvgData && (
                      <Box sx={ratingCardStyles.weightClassComparison}>
                        <Typography sx={ratingCardStyles.weightClassLabel}>
                          Weight Class Average:
                        </Typography>
                        <Typography sx={ratingCardStyles.weightClassValue}>
                          50 rating
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography sx={ratingCardStyles.description}>
                      Takedown effectiveness based on success rate and frequency compared to weight class
                    </Typography>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={ratingCardStyles.progressContainer}>
                    <Typography sx={ratingCardStyles.progressLabel}>
                      <span>Fighter Rating</span>
                      <span style={{ color: '#00F0FF' }}>
                        {calculateTakedownRating()}%
                      </span>
                    </Typography>
                    <Box 
                      className="rating-progress"
                      sx={ratingCardStyles.progressBar}
                    >
                      <Box 
                        sx={{
                          ...ratingCardStyles.progressFill,
                          width: `${calculateTakedownRating()}%`,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Tooltip>
            </Grid>

            {/* Defense Rating */}
            <Grid item xs={12} sm={6} md={4}>
              <Tooltip 
                title="Defensive effectiveness based on strikes absorbed compared to weight class averages"
                placement="top"
                arrow
              >
                <Box sx={ratingCardStyles.card}>
                  {/* Header */}
                  <Box sx={ratingCardStyles.header}>
                    <Box 
                      className="rating-icon"
                      sx={ratingCardStyles.icon}
                    >
                      <Box sx={{
                        width: '24px',
                        height: '24px',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '16px',
                          height: '16px',
                          border: '2px solid #00F0FF',
                          borderRadius: '50%',
                          boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
                        }
                      }}/>
                    </Box>
                    <Typography sx={ratingCardStyles.title}>
                      Defense
                    </Typography>
                  </Box>

                  {/* Metrics */}
                  <Box sx={ratingCardStyles.metrics}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                      <Typography sx={ratingCardStyles.ratingValue}>
                        {calculateDefenseRating()}
                      </Typography>
                      <Typography sx={ratingCardStyles.ratingUnit}>
                        / 100 rating
                      </Typography>
                    </Box>
                    
                    {/* Weight Class Comparison */}
                    {weightClassAvgData && (
                      <Box sx={ratingCardStyles.weightClassComparison}>
                        <Typography sx={ratingCardStyles.weightClassLabel}>
                          Weight Class Average:
                        </Typography>
                        <Typography sx={ratingCardStyles.weightClassValue}>
                          50 rating
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography sx={ratingCardStyles.description}>
                      Defensive effectiveness based on strikes absorbed compared to weight class averages
                    </Typography>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={ratingCardStyles.progressContainer}>
                    <Typography sx={ratingCardStyles.progressLabel}>
                      <span>Fighter Rating</span>
                      <span style={{ color: '#00F0FF' }}>
                        {calculateDefenseRating()}%
                      </span>
                    </Typography>
                    <Box 
                      className="rating-progress"
                      sx={ratingCardStyles.progressBar}
                    >
                      <Box 
                        sx={{
                          ...ratingCardStyles.progressFill,
                          width: `${calculateDefenseRating()}%`,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Tooltip>
            </Grid>

            {/* Finishes Rating */}
            <Grid item xs={12} sm={6} md={4}>
              <Tooltip 
                title="Finishing ability based on KO/TKO and submission rates compared to weight class"
                placement="top"
                arrow
              >
                <Box sx={ratingCardStyles.card}>
                  {/* Header */}
                  <Box sx={ratingCardStyles.header}>
                    <Box 
                      className="rating-icon"
                      sx={ratingCardStyles.icon}
                    >
                      <Box sx={{
                        width: '24px',
                        height: '24px',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '12px',
                          height: '12px',
                          background: '#00F0FF',
                          borderRadius: '50%',
                          boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '20px',
                          height: '20px',
                          border: '2px solid #00F0FF',
                          borderRadius: '50%',
                          opacity: 0.3,
                        }
                      }}/>
                    </Box>
                    <Typography sx={ratingCardStyles.title}>
                      Finishes
                    </Typography>
                  </Box>

                  {/* Metrics */}
                  <Box sx={ratingCardStyles.metrics}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                      <Typography sx={ratingCardStyles.ratingValue}>
                        {calculateFinishRating()}
                      </Typography>
                      <Typography sx={ratingCardStyles.ratingUnit}>
                        / 100 rating
                      </Typography>
                    </Box>
                    
                    {/* Weight Class Comparison */}
                    {weightClassAvgData && (
                      <Box sx={ratingCardStyles.weightClassComparison}>
                        <Typography sx={ratingCardStyles.weightClassLabel}>
                          Weight Class Average:
                        </Typography>
                        <Typography sx={ratingCardStyles.weightClassValue}>
                          50 rating
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography sx={ratingCardStyles.description}>
                      Finishing ability based on KO/TKO and submission rates compared to weight class
                    </Typography>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={ratingCardStyles.progressContainer}>
                    <Typography sx={ratingCardStyles.progressLabel}>
                      <span>Fighter Rating</span>
                      <span style={{ color: '#00F0FF' }}>
                        {calculateFinishRating()}%
                      </span>
                    </Typography>
                    <Box 
                      className="rating-progress"
                      sx={ratingCardStyles.progressBar}
                    >
                      <Box 
                        sx={{
                          ...ratingCardStyles.progressFill,
                          width: `${calculateFinishRating()}%`,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Tooltip>
            </Grid>

            {/* Position Rating */}
            <Grid item xs={12} sm={6} md={4}>
              <Tooltip 
                title="Positional dominance based on time spent in advantageous vs defensive positions"
                placement="top"
                arrow
              >
                <Box sx={ratingCardStyles.card}>
                  {/* Header */}
                  <Box sx={ratingCardStyles.header}>
                    <Box 
                      className="rating-icon"
                      sx={ratingCardStyles.icon}
                    >
                      <Box sx={{
                        width: '24px',
                        height: '24px',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '16px',
                          height: '16px',
                          border: '2px solid #00F0FF',
                          borderRadius: '4px',
                          boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
                        }
                      }}/>
                    </Box>
                    <Typography sx={ratingCardStyles.title}>
                      Position
                    </Typography>
                  </Box>

                  {/* Metrics */}
                  <Box sx={ratingCardStyles.metrics}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                      <Typography sx={ratingCardStyles.ratingValue}>
                        {calculatePositionalRating()}
                      </Typography>
                      <Typography sx={ratingCardStyles.ratingUnit}>
                        / 100 rating
                      </Typography>
                    </Box>
                    
                    {/* Weight Class Comparison */}
                    {weightClassAvgData && (
                      <Box sx={ratingCardStyles.weightClassComparison}>
                        <Typography sx={ratingCardStyles.weightClassLabel}>
                          Balanced Average:
                        </Typography>
                        <Typography sx={ratingCardStyles.weightClassValue}>
                          50 rating
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography sx={ratingCardStyles.description}>
                      Positional dominance based on time spent in advantageous vs defensive positions
                    </Typography>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={ratingCardStyles.progressContainer}>
                    <Typography sx={ratingCardStyles.progressLabel}>
                      <span>Fighter Rating</span>
                      <span style={{ color: '#00F0FF' }}>
                        {calculatePositionalRating()}%
                      </span>
                    </Typography>
                    <Box 
                      className="rating-progress"
                      sx={ratingCardStyles.progressBar}
                    >
                      <Box 
                        sx={{
                          ...ratingCardStyles.progressFill,
                          width: `${calculatePositionalRating()}%`,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>

        {/* Fighter Performance Radar Chart - Only show if positional data exists */}
        {hasPositionalData && (
          <Grid item xs={12}>
            {renderPerformanceAnalysis()}
          </Grid>
        )}

        {/* Striking Distribution */}
        <Grid item xs={12}>
          <Box sx={ratingCardStyles.card}>
            <Typography variant="h6" sx={sectionHeaderStyle}>
              Strike Distribution Analysis
            </Typography>
            <Typography 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 4,
                fontSize: '0.9rem',
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
              Breakdown of strikes per minute across different fighting positions
            </Typography>
            <Grid container spacing={4}>
              {[
                { 
                  label: 'Standing',
                  icon: <Box sx={{
                    width: '24px',
                    height: '24px',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#00F0FF',
                      boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid #00F0FF',
                      opacity: 0.5,
                    }
                  }}/>,
                  value: strikesPerMinute.stand.landed,
                  total: strikesPerMinute.stand.thrown,
                  weightClassValue: weightClassStrikesPerMinute.stand.landed,
                  weightClassTotal: weightClassStrikesPerMinute.stand.thrown,
                  color: '#00F0FF',
                  description: 'Strikes thrown while standing',
                  gradient: 'linear-gradient(90deg, #00F0FF, #0066FF)'
                },
                { 
                  label: 'Clinch',
                  icon: <Box sx={{
                    width: '24px',
                    height: '24px',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '16px',
                      height: '16px',
                      border: '2px solid #00F0FF',
                      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    }
                  }}/>,
                  value: strikesPerMinute.clinch.landed,
                  total: strikesPerMinute.clinch.thrown,
                  weightClassValue: weightClassStrikesPerMinute.clinch.landed,
                  weightClassTotal: weightClassStrikesPerMinute.clinch.thrown,
                  color: '#00F0FF',
                  description: 'Strikes thrown in clinch position',
                  gradient: 'linear-gradient(90deg, #00F0FF, #0066FF)'
                },
                { 
                  label: 'Ground',
                  icon: <Box sx={{
                    width: '24px',
                    height: '24px',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '16px',
                      height: '2px',
                      background: '#00F0FF',
                      boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '2px',
                      height: '16px',
                      background: '#00F0FF',
                      boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                    }
                  }}/>,
                  value: strikesPerMinute.ground.landed,
                  total: strikesPerMinute.ground.thrown,
                  weightClassValue: weightClassStrikesPerMinute.ground.landed,
                  weightClassTotal: weightClassStrikesPerMinute.ground.thrown,
                  color: '#00F0FF',
                  description: 'Strikes thrown on the ground',
                  gradient: 'linear-gradient(90deg, #00F0FF, #0066FF)'
                }
              ].map((strike) => (
                <Grid item xs={12} md={4} key={strike.label}>
                  <Box 
                    sx={{ 
                      p: 3,
                      borderRadius: '12px',
                      bgcolor: 'rgba(10, 14, 23, 0.4)',
                      border: '1px solid rgba(0, 240, 255, 0.15)',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(10, 14, 23, 0.6)',
                        transform: 'translateY(-2px)',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        '& .accuracy-indicator': {
                          transform: 'scale(1.05)',
                        },
                        '& .strike-icon': {
                          transform: 'scale(1.1)',
                        }
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: strike.gradient,
                        opacity: 0.5,
                      }
                    }}
                  >
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                      <Box 
                        className="strike-icon"
                        sx={{ 
                          width: 40,
                          height: 40,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.9), rgba(10, 14, 23, 0.7))',
                          border: '1px solid rgba(0, 240, 255, 0.2)',
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        {strike.icon}
                      </Box>
                      <Typography 
                        sx={{ 
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {strike.label}
                      </Typography>
                    </Box>

                    {/* Metrics */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                        <Typography 
                          sx={{ 
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: strike.color,
                            textShadow: `0 0 20px ${strike.color}40`,
                            fontFamily: 'monospace',
                          }}
                        >
                          {strike.value.toFixed(1)}
                        </Typography>
                        <Typography sx={{ 
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontFamily: 'monospace',
                        }}>
                          / {strike.total.toFixed(1)} per min
                        </Typography>
                      </Box>
                      
                      {/* Weight Class Comparison */}
                      {weightClassAvgData && (
                        <Box sx={{ 
                          mb: 2, 
                          p: 2, 
                          bgcolor: 'rgba(10, 14, 23, 0.6)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 56, 100, 0.1)',
                        }}>
                          <Typography sx={{ 
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '0.85rem',
                            mb: 0.5,
                            fontWeight: 500,
                          }}>
                            Weight Class Average:
                          </Typography>
                          <Typography sx={{ 
                            color: '#FF3864',
                            fontSize: '0.9rem',
                            fontFamily: 'monospace',
                          }}>
                            {strike.weightClassValue.toFixed(1)} per min
                          </Typography>
                        </Box>
                      )}
                      
                      <Typography 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.9rem',
                          mb: 2,
                          fontStyle: 'italic',
                        }}
                      >
                        {strike.description}
                      </Typography>
                    </Box>

                    {/* Accuracy Bar */}
                    <Box sx={{ position: 'relative' }}>
                      <Typography 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          mb: 1,
                          fontSize: '0.9rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontFamily: 'monospace',
                        }}
                      >
                        <span>Fighter Accuracy</span>
                        <span style={{ color: strike.color }}>
                          {strike.total > 0 ? Math.round((strike.value / strike.total) * 100) : 0}%
                        </span>
                      </Typography>
                      <Box 
                        className="accuracy-indicator"
                        sx={{ 
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(10, 14, 23, 0.6)',
                          border: '1px solid rgba(0, 240, 255, 0.1)',
                          overflow: 'hidden',
                          transition: 'transform 0.3s ease',
                          position: 'relative',
                          mb: weightClassAvgData ? 2 : 0,
                        }}
                      >
                        <Box 
                          sx={{
                            width: `${strike.total > 0 ? (strike.value / strike.total) * 100 : 0}%`,
                            height: '100%',
                            background: strike.gradient,
                            borderRadius: 4,
                            transition: 'width 0.3s ease',
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              width: '4px',
                              height: '100%',
                              background: '#fff',
                              opacity: 0.5,
                              filter: 'blur(2px)',
                            }
                          }}
                        />
                      </Box>
                      
                      {/* Weight Class Accuracy Bar */}
                      {weightClassAvgData && (
                        <>
                          <Typography 
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.7)',
                              mb: 1,
                              fontSize: '0.85rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontFamily: 'monospace',
                            }}
                          >
                            <span>Class Average</span>
                            <span style={{ color: '#FF3864' }}>
                              {strike.weightClassTotal > 0 ? Math.round((strike.weightClassValue / strike.weightClassTotal) * 100) : 0}%
                            </span>
                          </Typography>
                          <Box 
                            sx={{ 
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'rgba(10, 14, 23, 0.6)',
                              border: '1px solid rgba(255, 56, 100, 0.1)',
                              overflow: 'hidden',
                              position: 'relative',
                            }}
                          >
                            <Box 
                              sx={{
                                width: `${strike.weightClassTotal > 0 ? (strike.weightClassValue / strike.weightClassTotal) * 100 : 0}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #FF3864, #CC1F41)',
                                borderRadius: 3,
                                transition: 'width 0.3s ease',
                                opacity: 0.8,
                              }}
                            />
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        {/* Add the new outcome stats section */}
        {renderOutcomeStats()}
      </Grid>
    </Paper>
  );
};

export default BasicInfo; 