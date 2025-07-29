import React from 'react';
import { Paper, Typography, Grid, Box, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Fighter } from '../../types/firestore';
import { useBasicInfo } from '../../hooks/stats/useBasicInfo';
import { useGrapplingInfo } from '../../hooks/stats/useGrapplingInfo';

interface GrapplingInfoProps {
  fighter: Fighter;
  weightClassAvgData?: any;
}

const GrapplingInfo: React.FC<GrapplingInfoProps> = ({ fighter, weightClassAvgData }): JSX.Element => {
  // Use the hook to get takedown rating calculation
  const { calculateTakedownRating } = useBasicInfo(fighter, weightClassAvgData);
  
  // State for managing collapsed sections
  const [collapsedSections, setCollapsedSections] = React.useState({
    overallGrappling: false,
    grapplingRating: false,
    groundGame: false,
    submissions: false,
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };



  // Calculate takedown rating
  const takedownRating = calculateTakedownRating();
  
  // Use the grappling hook to get calculated data
  const { topTakedowns } = useGrapplingInfo(fighter);

  // Calculate ground control percentage
  const groundControlPercentage = React.useMemo(() => {
    const onTopGround = fighter.ground_stats?.OnTopGround || 0;
    const onBottomGround = fighter.ground_stats?.OnBottomGround || 0;
    const totalGroundTime = onTopGround + onBottomGround;
    
    if (totalGroundTime === 0) return 0;
    return (onTopGround / totalGroundTime) * 100;
  }, [fighter.ground_stats?.OnTopGround, fighter.ground_stats?.OnBottomGround]);

  // Calculate ground striking accuracy
  const groundStrikingAccuracy = React.useMemo(() => {
    const groundStrikesMade = fighter.ground_stats?.TotalGroundStrikesMade || 0;
    const groundStrikesThrown = fighter.ground_stats?.TotalGroundStrikesThrown || 0;
    
    if (groundStrikesThrown === 0) return 0;
    return (groundStrikesMade / groundStrikesThrown) * 100;
  }, [fighter.ground_stats?.TotalGroundStrikesMade, fighter.ground_stats?.TotalGroundStrikesThrown]);

  // Calculate weight class ground striking accuracy
  const weightClassGroundStrikingAccuracy = React.useMemo(() => {
    if (!weightClassAvgData) return 0;
    
    const weightClassGroundStrikesMade = weightClassAvgData.TotalGroundStrikesMade || 0;
    const weightClassGroundStrikesThrown = weightClassAvgData.TotalGroundStrikesThrown || 0;
    
    if (weightClassGroundStrikesThrown === 0) return 0;
    return (weightClassGroundStrikesMade / weightClassGroundStrikesThrown) * 100;
  }, [weightClassAvgData]);

  // Calculate ground strikes landed per round
  const groundStrikesPerRound = React.useMemo(() => {
    const groundStrikesMade = fighter.ground_stats?.TotalGroundStrikesMade || 0;
    const roundsTracked = fighter.RoundsTracked || 1;
    
    return groundStrikesMade / roundsTracked;
  }, [fighter.ground_stats?.TotalGroundStrikesMade, fighter.RoundsTracked]);

  // Custom tooltip component for the radar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Helper function to format the value display based on metric type
      const formatValueDisplay = () => {
        if (data.subject === 'Ground Control') {
          return {
            fighterValue: `${data.rawValue.toFixed(0)}%`,
            weightClassValue: `${data.rawWeightClassValue.toFixed(0)}%`,
            unit: '%'
          };
        } else if (data.subject === 'Ground Accuracy') {
          return {
            fighterValue: `${data.rawValue.toFixed(0)}%`,
            weightClassValue: `${data.rawWeightClassValue.toFixed(0)}%`,
            unit: '%'
          };
        } else {
          return {
            fighterValue: `${data.rawValue.toFixed(1)}`,
            weightClassValue: `${data.rawWeightClassValue.toFixed(1)}`,
            unit: '/round'
          };
        }
      };
      
      const valueDisplay = formatValueDisplay();
      
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
            {fighter.fighterName}: {valueDisplay.fighterValue}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
            Weight Class Avg: {valueDisplay.weightClassValue}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem', mt: 1, fontStyle: 'italic' }}>
            {data.description}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Calculate weight class ground strikes per round
  const weightClassGroundStrikesPerRound = React.useMemo(() => {
    if (!weightClassAvgData) return 0;
    
    const weightClassGroundStrikesMade = weightClassAvgData.TotalGroundStrikesMade || 0;
    const weightClassRounds = weightClassAvgData.rounds || 1;
    
    return weightClassGroundStrikesMade / weightClassRounds;
  }, [weightClassAvgData]);

  // Calculate submission attempt rate per round
  const submissionAttemptRatePerRound = React.useMemo(() => {
    const subAttempts = fighter.submission_stats?.SubAttempts || 0;
    const roundsTracked = fighter.RoundsTracked || 1;
    
    return subAttempts / roundsTracked;
  }, [fighter.submission_stats?.SubAttempts, fighter.RoundsTracked]);

  // Calculate weight class submission attempt rate per round
  const weightClassSubmissionAttemptRatePerRound = React.useMemo(() => {
    if (!weightClassAvgData) return 0;
    
    const weightClassSubAttempts = weightClassAvgData.SubAttempts || 0;
    const weightClassRounds = weightClassAvgData.rounds || 1;
    
    return weightClassSubAttempts / weightClassRounds;
  }, [weightClassAvgData]);

  // Calculate overall submission success rate
  const overallSubmissionSuccessRate = React.useMemo(() => {
    const fighterSubWin = fighter.fight_outcome_stats?.FighterSUBWin || 0;
    const subAttempts = fighter.submission_stats?.SubAttempts || 0;
    
    if (subAttempts === 0) return 0;
    return (fighterSubWin / subAttempts) * 100;
  }, [fighter.fight_outcome_stats?.FighterSUBWin, fighter.submission_stats?.SubAttempts]);

  // Calculate weight class submission success rate
  const weightClassSubmissionSuccessRate = React.useMemo(() => {
    if (!weightClassAvgData) return 0;
    
    const weightClassSubWin = weightClassAvgData.subwin || 0;
    const weightClassSubAttempts = weightClassAvgData.SubAttempts || 0;
    
    if (weightClassSubAttempts === 0) return 0;
    return (weightClassSubWin / weightClassSubAttempts) * 100;
  }, [weightClassAvgData]);

  // Prepare overall grappling radar chart data
  const prepareOverallGrapplingRadarData = () => {
    // Helper function to normalize values to 1-99 scale
    const normalizeValue = (fighterValue: number, weightClassValue: number) => {
      if (weightClassValue === 0) {
        // If no weight class data, use simple normalization
        const maxValue = Math.max(fighterValue, 1);
        return Math.min(99, Math.max(1, (fighterValue / maxValue) * 99));
      }
      
      // Calculate percentage relative to weight class average
      const percentage = (fighterValue / weightClassValue) * 100;
      
      // Convert to 1-99 scale
      // 50% = 25 rating (below average)
      // 100% = 50 rating (average)
      // 150% = 75 rating (above average)
      // 200%+ = 99 rating (exceptional)
      let rating = 50 + (percentage - 100) * 0.5;
      
      // Cap between 1 and 99
      return Math.min(99, Math.max(1, rating));
    };

    // Calculate takedown rating (using existing calculation)
    const takedownRatingValue = takedownRating;
    const weightClassTakedownRating = 50; // Baseline for weight class average

    // Calculate submission rating based on attempt rate and success rate
    const submissionAttemptRate = submissionAttemptRatePerRound;
    const weightClassSubmissionAttemptRate = weightClassSubmissionAttemptRatePerRound;
    const submissionSuccessRate = overallSubmissionSuccessRate;
    const weightClassSubmissionSuccessRateValue = weightClassSubmissionSuccessRate;
    
    // Combine attempt rate and success rate for overall submission rating
    const submissionRating = normalizeValue(
      (submissionAttemptRate * 10) + (submissionSuccessRate * 0.5), // Weight attempt rate more heavily
      (weightClassSubmissionAttemptRate * 10) + (weightClassSubmissionSuccessRateValue * 0.5)
    );

    // Calculate ground game rating based on ground control and striking
    const groundControlRating = normalizeValue(groundControlPercentage, 50); // 50% as baseline
    const groundStrikingRating = normalizeValue(groundStrikingAccuracy, weightClassGroundStrikingAccuracy);
    const groundVolumeRating = normalizeValue(groundStrikesPerRound, weightClassGroundStrikesPerRound);
    
    // Combine ground metrics for overall ground rating
    const groundRating = (groundControlRating + groundStrikingRating + groundVolumeRating) / 3;

    return [
      {
        subject: 'Takedowns',
        value: takedownRatingValue,
        weightClassValue: weightClassTakedownRating,
        description: 'Overall takedown effectiveness based on success rate and volume compared to weight class',
        rawValue: takedownRatingValue,
        rawWeightClassValue: weightClassTakedownRating
      },
      {
        subject: 'Submissions',
        value: submissionRating,
        weightClassValue: 50, // Weight class average at 50 (100% of average)
        description: 'Submission effectiveness based on attempt rate and success rate compared to weight class',
        rawValue: submissionRating,
        rawWeightClassValue: 50
      },
      {
        subject: 'Ground Game',
        value: groundRating,
        weightClassValue: 50, // Weight class average at 50 (100% of average)
        description: 'Ground control, striking accuracy, and volume compared to weight class average',
        rawValue: groundRating,
        rawWeightClassValue: 50
      }
    ];
  };

  // Prepare radar chart data for ground game analysis
  const prepareGroundGameRadarData = () => {
    // Helper function to normalize values to 1-99 scale
    const normalizeValue = (fighterValue: number, weightClassValue: number) => {
      if (weightClassValue === 0) {
        // If no weight class data, use simple normalization
        const maxValue = Math.max(fighterValue, 1);
        return Math.min(99, Math.max(1, (fighterValue / maxValue) * 99));
      }
      
      // Calculate percentage relative to weight class average
      const percentage = (fighterValue / weightClassValue) * 100;
      
      // Convert to 1-99 scale
      // 50% = 25 rating (below average)
      // 100% = 50 rating (average)
      // 150% = 75 rating (above average)
      // 200%+ = 99 rating (exceptional)
      let rating = 50 + (percentage - 100) * 0.5;
      
      // Cap between 1 and 99
      return Math.min(99, Math.max(1, rating));
    };

    return [
      {
        subject: 'Ground Control',
        value: groundControlPercentage,
        weightClassValue: 50, // Fixed at 50% as baseline
        description: 'Percentage of time spent in top position during ground exchanges',
        rawValue: groundControlPercentage,
        rawWeightClassValue: 50
      },
      {
        subject: 'Ground Accuracy',
        value: normalizeValue(groundStrikingAccuracy, weightClassGroundStrikingAccuracy),
        weightClassValue: 50, // Weight class average at 50 (100% of average)
        description: 'Accuracy of strikes thrown while on the ground compared to weight class average',
        rawValue: groundStrikingAccuracy,
        rawWeightClassValue: weightClassGroundStrikingAccuracy
      },
      {
        subject: 'Ground Volume',
        value: normalizeValue(groundStrikesPerRound, weightClassGroundStrikesPerRound),
        weightClassValue: 50, // Weight class average at 50 (100% of average)
        description: 'Average number of ground strikes landed per round compared to weight class average',
        rawValue: groundStrikesPerRound,
        rawWeightClassValue: weightClassGroundStrikesPerRound
      }
    ];
  };

  // Enhanced Rating Card Stylesheet (matching BasicInfo)
  const ratingCardStyles = {
    // Collapsible section styles
    collapsibleSection: {
      mb: 4,
      borderRadius: '12px',
      bgcolor: 'rgba(10, 14, 23, 0.4)',
      border: '1px solid rgba(0, 240, 255, 0.15)',
      position: 'relative' as const,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: 'rgba(10, 14, 23, 0.6)',
        border: '1px solid rgba(0, 240, 255, 0.3)',
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

    sectionHeader: {
      p: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: 'rgba(0, 240, 255, 0.05)',
      }
    },

    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
    },

    expandIcon: {
      color: '#00F0FF',
      transition: 'transform 0.3s ease',
      '&.expanded': {
        transform: 'rotate(180deg)',
      }
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

    // Description
    description: {
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: '0.9rem',
      mb: 2,
      fontStyle: 'italic',
    },
  };

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
            alt="Grappling Analysis Icon"
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
            Grappling Analysis
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
          Comprehensive grappling analysis based on takedown success rate, volume, and effectiveness compared to weight class averages
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Overall Grappling Radar Chart */}
        <Grid item xs={12}>
          <Box sx={ratingCardStyles.collapsibleSection}>
            {/* Collapsible Header */}
            <Box 
              sx={ratingCardStyles.sectionHeader}
              onClick={() => toggleSection('overallGrappling')}
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
                  Overall Grappling Analysis
                </Typography>
              </Box>
              <IconButton
                sx={ratingCardStyles.expandIcon}
                className={collapsedSections.overallGrappling ? '' : 'expanded'}
              >
                {collapsedSections.overallGrappling ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={!collapsedSections.overallGrappling}>
              <Box sx={{ p: 4 }}>
                <Typography sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  mb: 4,
                  textAlign: 'center',
                }}>
                  Comprehensive grappling analysis comparing takedowns, submissions, and ground game effectiveness against weight class averages
                </Typography>
                
                {/* Radar Chart */}
                <Box sx={{ width: '100%', height: 400, position: 'relative' }}>
                  <ResponsiveContainer>
                    <RadarChart data={prepareOverallGrapplingRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
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
                      {/* Weight Class Average Radar */}
                      <Radar
                        name="Weight Class Average"
                        dataKey="weightClassValue"
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
                      <Typography sx={{ color: '#fff', fontSize: '0.8rem' }}>{fighter.fighterName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#FF3864', borderRadius: '50%', opacity: 0.8 }} />
                      <Typography sx={{ color: '#fff', fontSize: '0.8rem' }}>Weight Class Avg</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Collapse>
          </Box>
        </Grid>

        {/* Grappling Rating Section */}
        <Grid item xs={12}>
          <Box sx={ratingCardStyles.collapsibleSection}>
            {/* Collapsible Header */}
            <Box 
              sx={ratingCardStyles.sectionHeader}
              onClick={() => toggleSection('grapplingRating')}
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
                  Takedown Rating
                </Typography>
              </Box>
              <IconButton
                sx={ratingCardStyles.expandIcon}
                className={collapsedSections.grapplingRating ? '' : 'expanded'}
              >
                {collapsedSections.grapplingRating ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={!collapsedSections.grapplingRating}>
              <Box sx={{ p: 4 }}>
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
                          background: 'conic-gradient(from 0deg, #00F0FF 0deg, #00F0FF ' + (takedownRating * 3.6) + 'deg, rgba(0, 240, 255, 0.1) ' + (takedownRating * 3.6) + 'deg, rgba(0, 240, 255, 0.1) 360deg)',
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
                            {takedownRating.toFixed(0)}
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
                      }} />
                    </Box>
                  </Grid>

                  {/* Rating Description and Top Takedowns */}
                  <Grid item xs={12} md={8}>
                    <Typography sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      mb: 3,
                    }}>
                      Comprehensive grappling rating based on takedown success rate and volume compared to weight class averages. Shows your most effective takedown techniques.
                    </Typography>
                    
                    {/* Top 3 Takedown Attempts */}
                    {topTakedowns.length > 0 ? (
                      <Box sx={{
                        p: 2,
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(0, 102, 255, 0.04) 100%)',
                        border: '1px solid rgba(0, 240, 255, 0.15)',
                        backdropFilter: 'blur(5px)',
                        mb: 3,
                      }}>
                        <Typography sx={{ 
                          color: '#FFFFFF', 
                          fontWeight: 600, 
                          mb: 1.5,
                          fontSize: '0.9rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          Top 3 Takedown Attempts
                        </Typography>
                        <Grid container spacing={1}>
                          {topTakedowns.map((takedown, index) => (
                            <Grid item xs={12} key={takedown.name}>
                              <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1,
                                borderRadius: '4px',
                                background: 'rgba(0, 240, 255, 0.05)',
                                border: '1px solid rgba(0, 240, 255, 0.1)',
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                                    boxShadow: '0 0 8px rgba(255, 215, 0, 0.5)',
                                  }} />
                                  <Typography sx={{
                                    color: '#FFFFFF',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                  }}>
                                    {takedown.name}
                                  </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography sx={{
                                    color: '#00F0FF',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                  }}>
                                    {takedown.attemptsPerRound.toFixed(1)}/round
                                  </Typography>
                                  <Typography sx={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                  }}>
                                    {takedown.attemptsPerMinute.toFixed(2)}/min • {takedown.successRate.toFixed(0)}% success
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    ) : (
                      <Box sx={{
                        p: 2,
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(5px)',
                        mb: 3,
                      }}>
                        <Typography sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.9rem',
                          fontStyle: 'italic',
                          textAlign: 'center',
                        }}>
                          No takedown data available
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Box>
        </Grid>

        {/* Submissions Section */}
        <Grid item xs={12}>
          <Box sx={ratingCardStyles.collapsibleSection}>
            {/* Collapsible Header */}
            <Box 
              sx={ratingCardStyles.sectionHeader}
              onClick={() => toggleSection('submissions')}
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
                  Submission Analysis
                </Typography>
              </Box>
              <IconButton
                sx={ratingCardStyles.expandIcon}
                className={collapsedSections.submissions ? '' : 'expanded'}
              >
                {collapsedSections.submissions ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={!collapsedSections.submissions}>
              <Box sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
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
                          '& .submission-icon': {
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
                          background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
                          opacity: 0.5,
                        }
                      }}
                    >
                      {/* Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                        <Box 
                          className="submission-icon"
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
                              boxShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                            }
                          }}/>
                        </Box>
                        <Typography sx={{
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '1rem',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.05em',
                        }}>
                          Submission Attempt Rate
                        </Typography>
                      </Box>
                      
                      {/* Description */}
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.85rem',
                        mb: 2,
                        fontStyle: 'italic',
                      }}>
                        Average number of submission attempts per round compared to weight class
                      </Typography>
                      
                      {/* Value */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{
                          color: '#00F0FF',
                          fontSize: '2rem',
                          fontWeight: 700,
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          letterSpacing: '0.1em',
                          textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                        }}>
                          {submissionAttemptRatePerRound.toFixed(2)}
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        }}>
                          per round
                        </Typography>
                        {weightClassAvgData && (
                          <Typography sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          }}>
                            vs {weightClassSubmissionAttemptRatePerRound.toFixed(2)} avg
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
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
                          '& .submission-icon': {
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
                          background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
                          opacity: 0.5,
                        }
                      }}
                    >
                      {/* Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                        <Box 
                          className="submission-icon"
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
                        <Typography sx={{
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '1rem',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.05em',
                        }}>
                          Submission Success Rate
                        </Typography>
                      </Box>
                      
                      {/* Description */}
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.85rem',
                        mb: 2,
                        fontStyle: 'italic',
                      }}>
                        Percentage of submission attempts that result in a win compared to weight class
                      </Typography>
                      
                      {/* Value */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{
                          color: '#00F0FF',
                          fontSize: '2rem',
                          fontWeight: 700,
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          letterSpacing: '0.1em',
                          textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                        }}>
                          {overallSubmissionSuccessRate.toFixed(0)}%
                        </Typography>
                        {weightClassAvgData && (
                          <Typography sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          }}>
                            vs {weightClassSubmissionSuccessRate.toFixed(0)}% avg
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Box>
        </Grid>

        {/* Ground Game Metrics */}
        <Grid item xs={12}>
          <Box sx={ratingCardStyles.collapsibleSection}>
            {/* Collapsible Header */}
            <Box 
              sx={ratingCardStyles.sectionHeader}
              onClick={() => toggleSection('groundGame')}
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
                  Ground Game Analysis
                </Typography>
              </Box>
              <IconButton
                sx={ratingCardStyles.expandIcon}
                className={collapsedSections.groundGame ? '' : 'expanded'}
              >
                {collapsedSections.groundGame ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={!collapsedSections.groundGame}>
              <Box sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={4}>
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
                          '& .ground-icon': {
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
                          background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
                          opacity: 0.5,
                        }
                      }}
                    >
                      {/* Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                        <Box 
                          className="ground-icon"
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
                              boxShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                            }
                          }}/>
                        </Box>
                        <Typography sx={{
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '1rem',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.05em',
                        }}>
                          Ground Control
                        </Typography>
                      </Box>
                      
                      {/* Description */}
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.85rem',
                        mb: 2,
                        fontStyle: 'italic',
                      }}>
                        Percentage of time spent in top position during ground exchanges
                      </Typography>
                      
                      {/* Value */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{
                          color: '#00F0FF',
                          fontSize: '2rem',
                          fontWeight: 700,
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          letterSpacing: '0.1em',
                          textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                        }}>
                          {groundControlPercentage.toFixed(0)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
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
                          '& .ground-icon': {
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
                          background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
                          opacity: 0.5,
                        }
                      }}
                    >
                      {/* Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                        <Box 
                          className="ground-icon"
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
                        <Typography sx={{
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '1rem',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.05em',
                        }}>
                          Ground Striking Accuracy
                        </Typography>
                      </Box>
                      
                      {/* Description */}
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.85rem',
                        mb: 2,
                        fontStyle: 'italic',
                      }}>
                        Accuracy of strikes thrown while on the ground compared to weight class average
                      </Typography>
                      
                      {/* Value */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{
                          color: '#00F0FF',
                          fontSize: '2rem',
                          fontWeight: 700,
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          letterSpacing: '0.1em',
                          textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                        }}>
                          {groundStrikingAccuracy.toFixed(0)}%
                        </Typography>
                        {weightClassAvgData && (
                          <Typography sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          }}>
                            vs {weightClassGroundStrikingAccuracy.toFixed(0)}% avg
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
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
                          '& .ground-icon': {
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
                          background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
                          opacity: 0.5,
                        }
                      }}
                    >
                      {/* Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                        <Box 
                          className="ground-icon"
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
                        <Typography sx={{
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '1rem',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.05em',
                        }}>
                          Ground Strikes/Round
                        </Typography>
                      </Box>
                      
                      {/* Description */}
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.85rem',
                        mb: 2,
                        fontStyle: 'italic',
                      }}>
                        Average number of ground strikes landed per round compared to weight class
                      </Typography>
                      
                      {/* Value */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{
                          color: '#00F0FF',
                          fontSize: '2rem',
                          fontWeight: 700,
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          letterSpacing: '0.1em',
                          textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                        }}>
                          {groundStrikesPerRound.toFixed(1)}
                        </Typography>
                        {weightClassAvgData && (
                          <Typography sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          }}>
                            vs {weightClassGroundStrikesPerRound.toFixed(1)} avg
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {/* Radar Chart */}
                <Box sx={{ mt: 6 }}>
                  <Typography 
                    sx={{ 
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      mb: 3,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: 'center',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '60px',
                        height: '2px',
                        background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
                      }
                    }}
                  >
                    Ground Game Radar Analysis
                  </Typography>
                  
                  <Box sx={{ width: '100%', height: 400, position: 'relative' }}>
                    <ResponsiveContainer>
                      <RadarChart data={prepareGroundGameRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
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
                        {/* Weight Class Average Radar */}
                        <Radar
                          name="Weight Class Average"
                          dataKey="weightClassValue"
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
                        <Typography sx={{ color: '#fff', fontSize: '0.8rem' }}>{fighter.fighterName}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: '#FF3864', borderRadius: '50%', opacity: 0.8 }} />
                        <Typography sx={{ color: '#fff', fontSize: '0.8rem' }}>Weight Class Avg</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Collapse>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default GrapplingInfo; 