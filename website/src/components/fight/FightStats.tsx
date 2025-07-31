import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Tooltip,
  Divider,
  Fade,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { useWeightClass } from '../../hooks/useWeightClass';

interface FightStatsProps {
  fightStats: {
    fighterAName: string;
    fighterBName: string;
    weightClass: string;
    methodOfFinish: string;
    // Fighter A stats
    ajabs: number;
    astraights: number;
    ahooks: number;
    auppercuts: number;
    aoverhands: number;
    abodykick: number;
    aheadkick: number;
    alegkick: number;
    anumofknockdowns: number;
    anumofstuns: number;
    astance: string;
    atdattempt: number;
    atdmake: number;
    atdrate: string;
    asubattempt: number;
    AHighImpact: number;
    Around1StrikesLanded: number;
    Around2StrikesLanded: number;
    Around3StrikesLanded: number;
    Around4StrikesLanded: number;
    Around5StrikesLanded: number;
    // Fighter B stats
    bjabs: number;
    bstraights: number;
    bhooks: number;
    buppercuts: number;
    boverhands: number;
    bbodykick: number;
    bheadkick: number;
    blegkick: number;
    bnumofknockdowns: number;
    bnumofstuns: number;
    bstance: string;
    btdattempt: number;
    btdmake: number;
    btdrate: string;
    bsubattempt: number;
    BHighImpact: number;
    Bround1StrikesLanded: number;
    Bround2StrikesLanded: number;
    Bround3StrikesLanded: number;
    Bround4StrikesLanded: number;
    Bround5StrikesLanded: number;
    // Fight info
    Rounds: number;
    Time: string;
  };
  weightClassAvgData?: any; // Add weight class data prop
}

// Enhanced Rating Card Stylesheet (matching BasicInfo)
const ratingCardStyles = {
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
};

// Legacy card style for backward compatibility
const cardStyle = ratingCardStyles.card;

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

// Section header style matching BasicInfo
const sectionHeaderStyle = {
  mb: 3,
  color: '#fff',
  fontWeight: 600,
  fontSize: '1.25rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  position: 'relative' as const,
  display: 'inline-block' as const,
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

const FightStats: React.FC<FightStatsProps> = ({ fightStats, weightClassAvgData }) => {
  // Get weight class data if not provided as prop
  const weightClassName = weightClassAvgData ? null : fightStats.weightClass;
  const { weightClass: fetchedWeightClassData, loading: weightClassLoading } = useWeightClass(weightClassName);
  
  // Use provided weight class data or fetched data
  const weightClassData = weightClassAvgData || fetchedWeightClassData;

  // Calculate total strikes for each fighter using round-by-round totals
  const calculateTotalStrikes = (fighter: 'a' | 'b') => {
    const prefix = fighter.toUpperCase();
    let totalStrikes = 0;
    
    // Sum up strikes from all rounds
    for (let round = 1; round <= fightStats.Rounds; round++) {
      const roundKey = `${prefix}round${round}StrikesLanded` as keyof typeof fightStats;
      const roundStrikes = Number(fightStats[roundKey]) || 0;
      totalStrikes += roundStrikes;
    }
    
    return totalStrikes;
  };

  const fighterATotalStrikes = calculateTotalStrikes('a');
  const fighterBTotalStrikes = calculateTotalStrikes('b');

  // Calculate weight class average strikes per minute
  const calculateWeightClassStrikesPerMinute = () => {
    if (!weightClassData) return 0;
    
    const weightClassMinutes = weightClassData.minutes || 1;
    const weightClassTotalStrikes = weightClassData.TotalStrikesLanded || 0;
    const weightClassClinchStrikes = weightClassData.TotalClinchStrikesMade || 0;
    const weightClassGroundStrikes = weightClassData.TotalGroundStrikesMade || 0;
    
    // Exclude clinch and ground strikes from the calculation
    const weightClassStandingStrikes = weightClassTotalStrikes - weightClassClinchStrikes - weightClassGroundStrikes;
    
    return weightClassStandingStrikes / weightClassMinutes;
  };

  const weightClassStrikesPerMinute = calculateWeightClassStrikesPerMinute();

  // Calculate percentage difference from weight class average
  const calculatePercentageDifference = (fighterStrikesPerMinute: number) => {
    if (!weightClassData || weightClassStrikesPerMinute === 0) return 0;
    return ((fighterStrikesPerMinute - weightClassStrikesPerMinute) / weightClassStrikesPerMinute) * 100;
  };

  // Add context information for each stat type
  const statDescriptions = {
    strikes: "Total number of significant strikes landed",
    highImpact: "Strikes that visibly rocked or hurt the opponent",
    knockdowns: "Times opponent was knocked down to the canvas",
    stuns: "Moments where opponent was visibly stunned but remained standing",
    tdSuccess: "Success rate of takedown attempts",
  };

  // Add tooltips for strike types
  const strikeDescriptions = {
    Jabs: "Quick, straight punches thrown with the lead hand",
    Straights: "Power punches thrown straight with the rear hand",
    Hooks: "Circular punches thrown from the side",
    Uppercuts: "Upward vertical punches",
    Overhands: "Looping punches thrown over the top",
    "Body Kicks": "Kicks targeting the opponent's torso",
    "Head Kicks": "High kicks targeting the opponent's head",
    "Leg Kicks": "Low kicks targeting the opponent's legs",
  };

  // Calculate fight duration in minutes and seconds
  // For a 5-round fight, each round is 5 minutes, so total should be 25 minutes
  // The Time field appears to be just the final round time, not total fight time
  const rounds = fightStats.Rounds;
  const [finalRoundMinutes, finalRoundSeconds] = fightStats.Time.split(':').map(Number);
  
  // Calculate total fight time: (rounds - 1) * 5 minutes + final round time
  const fullRoundsMinutes = (rounds - 1) * 5; // Full 5-minute rounds
  const finalRoundTotalSeconds = (finalRoundMinutes * 60) + finalRoundSeconds;
  const totalSeconds = (fullRoundsMinutes * 60) + finalRoundTotalSeconds;
  const totalMinutes = totalSeconds / 60;
  
  // Console logging for debugging
  console.group('FightStats - Strike Rate Calculation');
  console.log('Fight Duration Calculation:', {
    rounds: rounds,
    timeString: fightStats.Time,
    finalRoundMinutes: finalRoundMinutes,
    finalRoundSeconds: finalRoundSeconds,
    fullRoundsMinutes: fullRoundsMinutes,
    finalRoundTotalSeconds: finalRoundTotalSeconds,
    totalSeconds: totalSeconds,
    totalMinutes: totalMinutes.toFixed(2)
  });
  console.log('Total Strikes:', {
    [fightStats.fighterAName]: fighterATotalStrikes,
    [fightStats.fighterBName]: fighterBTotalStrikes
  });
  console.log('Strikes Per Minute:', {
    [fightStats.fighterAName]: (fighterATotalStrikes / totalMinutes).toFixed(2),
    [fightStats.fighterBName]: (fighterBTotalStrikes / totalMinutes).toFixed(2),
    'Weight Class Average': weightClassStrikesPerMinute.toFixed(2)
  });
  console.log('Weight Class Data:', {
    weightClass: fightStats.weightClass,
    hasWeightClassData: !!weightClassData,
    weightClassMinutes: weightClassData?.minutes,
    weightClassTotalStrikes: weightClassData?.TotalStrikesLanded,
    weightClassClinchStrikes: weightClassData?.TotalClinchStrikesMade,
    weightClassGroundStrikes: weightClassData?.TotalGroundStrikesMade,
    weightClassStandingStrikes: weightClassData ? 
      (weightClassData.TotalStrikesLanded || 0) - (weightClassData.TotalClinchStrikesMade || 0) - (weightClassData.TotalGroundStrikesMade || 0) : 0
  });
  console.groupEnd();
  
  const strikesPerMinute = {
    [fightStats.fighterAName]: (fighterATotalStrikes / totalMinutes).toFixed(1),
    [fightStats.fighterBName]: (fighterBTotalStrikes / totalMinutes).toFixed(1),
  };

  // Prepare data for strike distribution chart
  const prepareStrikeDistributionData = () => {
    return [
      {
        name: 'Jabs',
        [fightStats.fighterAName]: fightStats.ajabs,
        [fightStats.fighterBName]: fightStats.bjabs,
        description: strikeDescriptions.Jabs,
      },
      {
        name: 'Straights',
        [fightStats.fighterAName]: fightStats.astraights,
        [fightStats.fighterBName]: fightStats.bstraights,
        description: strikeDescriptions.Straights,
      },
      {
        name: 'Hooks',
        [fightStats.fighterAName]: fightStats.ahooks,
        [fightStats.fighterBName]: fightStats.bhooks,
        description: strikeDescriptions.Hooks,
      },
      {
        name: 'Uppercuts',
        [fightStats.fighterAName]: fightStats.auppercuts,
        [fightStats.fighterBName]: fightStats.buppercuts,
        description: strikeDescriptions.Uppercuts,
      },
      {
        name: 'Overhands',
        [fightStats.fighterAName]: fightStats.aoverhands,
        [fightStats.fighterBName]: fightStats.boverhands,
        description: strikeDescriptions.Overhands,
      },
      {
        name: 'Body Kicks',
        [fightStats.fighterAName]: fightStats.abodykick,
        [fightStats.fighterBName]: fightStats.bbodykick,
        description: strikeDescriptions["Body Kicks"],
      },
      {
        name: 'Head Kicks',
        [fightStats.fighterAName]: fightStats.aheadkick,
        [fightStats.fighterBName]: fightStats.bheadkick,
        description: strikeDescriptions["Head Kicks"],
      },
      {
        name: 'Leg Kicks',
        [fightStats.fighterAName]: fightStats.alegkick,
        [fightStats.fighterBName]: fightStats.blegkick,
        description: strikeDescriptions["Leg Kicks"],
      },
    ];
  };

  // Prepare data for round-by-round analysis
  const prepareRoundData = () => {
    return Array.from({ length: fightStats.Rounds }, (_, i) => ({
      round: i + 1,
      [fightStats.fighterAName]: fightStats[`Around${i + 1}StrikesLanded` as keyof typeof fightStats] as number,
      [fightStats.fighterBName]: fightStats[`Bround${i + 1}StrikesLanded` as keyof typeof fightStats] as number,
    }));
  };

  // Prepare data for fighter comparison radar chart
  const prepareFighterComparisonData = () => {
    const getStrikeEfficiency = (total: number, landed: number) => 
      total > 0 ? (landed / total) * 100 : 0;

    return [
      {
        attribute: 'Strike Volume',
        [fightStats.fighterAName]: fighterATotalStrikes,
        [fightStats.fighterBName]: fighterBTotalStrikes,
      },
      {
        attribute: 'High Impact',
        [fightStats.fighterAName]: fightStats.AHighImpact,
        [fightStats.fighterBName]: fightStats.BHighImpact,
      },
      {
        attribute: 'Knockdowns',
        [fightStats.fighterAName]: fightStats.anumofknockdowns * 100,
        [fightStats.fighterBName]: fightStats.bnumofknockdowns * 100,
      },
      {
        attribute: 'Stuns',
        [fightStats.fighterAName]: fightStats.anumofstuns * 100,
        [fightStats.fighterBName]: fightStats.bnumofstuns * 100,
      },
      {
        attribute: 'TD Success',
        [fightStats.fighterAName]: getStrikeEfficiency(fightStats.atdattempt, fightStats.atdmake),
        [fightStats.fighterBName]: getStrikeEfficiency(fightStats.btdattempt, fightStats.btdmake),
      },
    ];
  };

  // Custom tooltip component matching BasicInfo style
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
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
            {label}
          </Typography>
          {strikeDescriptions[label as keyof typeof strikeDescriptions] && (
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', mb: 1 }}>
              {strikeDescriptions[label as keyof typeof strikeDescriptions]}
            </Typography>
          )}
          {payload.map((entry: any) => (
            <Typography 
              key={entry.name}
              variant="body2"
              color={entry.color}
            >
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ mt: 6 }}>
        {/* Fight Overview Section */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: '#fff',
              fontSize: { xs: '1.75rem', sm: '2rem' },
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 2,
              textShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
            }}
          >
            Fight Analysis
          </Typography>
          <Typography 
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
            Comprehensive breakdown of striking performance and fight dynamics
          </Typography>
        </Box>

        {/* Fight Context Information */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ ...cardStyle, p: 2 }}>
              <Typography variant="subtitle2" color="rgba(255, 255, 255, 0.7)">
                Weight Class
              </Typography>
              <Typography variant="h6" color="#fff">
                {fightStats.weightClass}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ ...cardStyle, p: 2 }}>
              <Typography variant="subtitle2" color="rgba(255, 255, 255, 0.7)">
                Duration
              </Typography>
              <Typography variant="h6" color="#fff">
                {fightStats.Rounds} Rounds ({fightStats.Time})
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ ...cardStyle, p: 2 }}>
              <Typography variant="subtitle2" color="rgba(255, 255, 255, 0.7)">
                Method of Finish
              </Typography>
              <Typography variant="h6" color="#fff">
                {fightStats.methodOfFinish}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Strike Rate Information */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
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
                  {fightStats.fighterAName}
                </Typography>
              </Box>

              {/* Metrics */}
              <Box sx={ratingCardStyles.metrics}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                  <Typography sx={ratingCardStyles.ratingValue}>
                    {strikesPerMinute[fightStats.fighterAName]}
                  </Typography>
                  <Typography sx={ratingCardStyles.ratingUnit}>
                    strikes/min
                  </Typography>
                </Box>
                
                {/* Weight Class Comparison */}
                {weightClassData && (
                  <Box sx={ratingCardStyles.weightClassComparison}>
                    <Typography sx={ratingCardStyles.weightClassLabel}>
                      vs {fightStats.weightClass} avg:
                    </Typography>
                    <Typography sx={ratingCardStyles.weightClassValue}>
                      {weightClassStrikesPerMinute.toFixed(1)} strikes/min
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: calculatePercentageDifference(Number(strikesPerMinute[fightStats.fighterAName])) > 0 ? '#4CAF50' : '#FF5722',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {calculatePercentageDifference(Number(strikesPerMinute[fightStats.fighterAName])) > 0 ? '↑' : '↓'}
                      {Math.abs(calculatePercentageDifference(Number(strikesPerMinute[fightStats.fighterAName]))).toFixed(0)}% difference
                    </Typography>
                  </Box>
                )}
                
                <Typography sx={ratingCardStyles.description}>
                  Strike rate per minute excluding ground & clinch strikes
                </Typography>
              </Box>

              {/* Progress Bar */}
              <Box sx={ratingCardStyles.progressContainer}>
                <Typography sx={ratingCardStyles.progressLabel}>
                  <span>Fighter Rate</span>
                  <span style={{ color: '#00F0FF' }}>
                    {strikesPerMinute[fightStats.fighterAName]} strikes/min
                  </span>
                </Typography>
                <Box 
                  className="rating-progress"
                  sx={ratingCardStyles.progressBar}
                >
                  <Box 
                    sx={{
                      ...ratingCardStyles.progressFill,
                      width: `${Math.min(100, (Number(strikesPerMinute[fightStats.fighterAName]) / 10) * 100)}%`,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
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
                      background: '#FF3864',
                      boxShadow: '0 0 10px rgba(255, 56, 100, 0.5)',
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
                      border: '2px solid #FF3864',
                      opacity: 0.5,
                    }
                  }}/>
                </Box>
                <Typography sx={ratingCardStyles.title}>
                  {fightStats.fighterBName}
                </Typography>
              </Box>

              {/* Metrics */}
              <Box sx={ratingCardStyles.metrics}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                  <Typography sx={{ ...ratingCardStyles.ratingValue, color: '#FF3864' }}>
                    {strikesPerMinute[fightStats.fighterBName]}
                  </Typography>
                  <Typography sx={ratingCardStyles.ratingUnit}>
                    strikes/min
                  </Typography>
                </Box>
                
                {/* Weight Class Comparison */}
                {weightClassData && (
                  <Box sx={ratingCardStyles.weightClassComparison}>
                    <Typography sx={ratingCardStyles.weightClassLabel}>
                      vs {fightStats.weightClass} avg:
                    </Typography>
                    <Typography sx={ratingCardStyles.weightClassValue}>
                      {weightClassStrikesPerMinute.toFixed(1)} strikes/min
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: calculatePercentageDifference(Number(strikesPerMinute[fightStats.fighterBName])) > 0 ? '#4CAF50' : '#FF5722',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {calculatePercentageDifference(Number(strikesPerMinute[fightStats.fighterBName])) > 0 ? '↑' : '↓'}
                      {Math.abs(calculatePercentageDifference(Number(strikesPerMinute[fightStats.fighterBName]))).toFixed(0)}% difference
                    </Typography>
                  </Box>
                )}
                
                <Typography sx={ratingCardStyles.description}>
                  Strike rate per minute excluding ground & clinch strikes
                </Typography>
              </Box>

              {/* Progress Bar */}
              <Box sx={ratingCardStyles.progressContainer}>
                <Typography sx={ratingCardStyles.progressLabel}>
                  <span>Fighter Rate</span>
                  <span style={{ color: '#FF3864' }}>
                    {strikesPerMinute[fightStats.fighterBName]} strikes/min
                  </span>
                </Typography>
                <Box 
                  className="rating-progress"
                  sx={ratingCardStyles.progressBar}
                >
                  <Box 
                    sx={{
                      ...ratingCardStyles.progressFill,
                      background: 'linear-gradient(90deg, #FF3864, #CC1F41)',
                      width: `${Math.min(100, (Number(strikesPerMinute[fightStats.fighterBName]) / 10) * 100)}%`,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
          {weightClassData && (
            <Grid item xs={12} sm={6} md={4}>
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
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        borderRadius: '4px',
                        boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                      }
                    }}/>
                  </Box>
                  <Typography sx={ratingCardStyles.title}>
                    {fightStats.weightClass} Average
                  </Typography>
                </Box>

                {/* Metrics */}
                <Box sx={ratingCardStyles.metrics}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                    <Typography sx={{ ...ratingCardStyles.ratingValue, color: 'rgba(255, 255, 255, 0.8)' }}>
                      {weightClassStrikesPerMinute.toFixed(1)}
                    </Typography>
                    <Typography sx={ratingCardStyles.ratingUnit}>
                      strikes/min
                    </Typography>
                  </Box>
                  
                  <Box sx={ratingCardStyles.weightClassComparison}>
                    <Typography sx={ratingCardStyles.weightClassLabel}>
                      Based on:
                    </Typography>
                    <Typography sx={ratingCardStyles.weightClassValue}>
                      {weightClassData.fights || 0} fights
                    </Typography>
                  </Box>
                  
                  <Typography sx={ratingCardStyles.description}>
                    Average strike rate excluding ground & clinch strikes
                  </Typography>
                </Box>

                {/* Progress Bar */}
                <Box sx={ratingCardStyles.progressContainer}>
                  <Typography sx={ratingCardStyles.progressLabel}>
                    <span>Class Average</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {weightClassStrikesPerMinute.toFixed(1)} strikes/min
                    </span>
                  </Typography>
                  <Box 
                    className="rating-progress"
                    sx={ratingCardStyles.progressBar}
                  >
                    <Box 
                      sx={{
                        ...ratingCardStyles.progressFill,
                        background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6))',
                        width: `${Math.min(100, (weightClassStrikesPerMinute / 10) * 100)}%`,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          )}
          {weightClassLoading && (
            <Grid item xs={12} md={4}>
              <Paper sx={{ ...cardStyle, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" color="rgba(255, 255, 255, 0.8)">
                    {fightStats.weightClass} Average
                  </Typography>
                  <Typography variant="h5" color="rgba(255, 255, 255, 0.8)">
                    Loading...
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )}
          {!weightClassData && !weightClassLoading && (
            <Grid item xs={12} md={4}>
              <Paper sx={{ ...cardStyle, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" color="rgba(255, 255, 255, 0.6)">
                    Weight Class Comparison
                  </Typography>
                  <Typography variant="h6" color="rgba(255, 255, 255, 0.6)">
                    Not Available
                  </Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
                    No data for {fightStats.weightClass}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>

        <Grid container spacing={4}>
          {/* Strike Distribution Chart */}
          <Grid item xs={12}>
            <Paper sx={cardStyle}>
              <Box className="glow-effect" sx={glowEffect} />
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={sectionHeaderStyle}>
                  Strike Distribution
                </Typography>
                <Tooltip title="Breakdown of different strike types landed by each fighter">
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    ℹ️ Hover over bars for details
                  </Typography>
                </Tooltip>
              </Box>
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
                Detailed breakdown of different strike types and their effectiveness
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={prepareStrikeDistributionData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255, 255, 255, 0.7)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                    />
                    <YAxis 
                      stroke="rgba(255, 255, 255, 0.7)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey={fightStats.fighterAName} 
                      fill="#00F0FF" 
                      opacity={0.8}
                    />
                    <Bar 
                      dataKey={fightStats.fighterBName} 
                      fill="#FF3864" 
                      opacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Fighter Comparison Radar - Enhanced with tooltips */}
          <Grid item xs={12} md={6}>
            <Paper sx={cardStyle}>
              <Box className="glow-effect" sx={glowEffect} />
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={sectionHeaderStyle}>
                  Fighter Comparison
                </Typography>
                <Tooltip title="Overall performance metrics comparison">
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    ℹ️ Hover for metric details
                  </Typography>
                </Tooltip>
              </Box>
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
                Comprehensive comparison of key performance metrics between fighters
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer>
                  <RadarChart data={prepareFighterComparisonData()}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                    <PolarAngleAxis 
                      dataKey="attribute"
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                    />
                    <PolarRadiusAxis stroke="rgba(255, 255, 255, 0.1)" />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const attribute = payload[0].payload.attribute;
                          return (
                            <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.8)', p: 2, borderRadius: 1 }}>
                              <Typography variant="subtitle2" color="#fff">
                                {attribute}
                              </Typography>
                              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 1 }}>
                                {statDescriptions[attribute.toLowerCase().replace(/\s+/g, '') as keyof typeof statDescriptions]}
                              </Typography>
                              {payload.map((entry) => (
                                <Typography 
                                  key={entry.name}
                                  variant="body2"
                                  color={entry.color}
                                >
                                  {entry.name}: {entry.value.toFixed(1)}
                                </Typography>
                              ))}
                            </Box>
                          );
                        }
                        return null;
                      }}
                    />
                    <Radar
                      name={fightStats.fighterAName}
                      dataKey={fightStats.fighterAName}
                      stroke="#00F0FF"
                      fill="#00F0FF"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name={fightStats.fighterBName}
                      dataKey={fightStats.fighterBName}
                      stroke="#FF3864"
                      fill="#FF3864"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Round-by-Round Analysis */}
          <Grid item xs={12} md={6}>
            <Paper sx={cardStyle}>
              <Box className="glow-effect" sx={glowEffect} />
              <Typography variant="h6" sx={sectionHeaderStyle}>
                Round-by-Round Analysis
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
                Strike volume progression throughout the fight rounds
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={prepareRoundData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="round" 
                      stroke="rgba(255, 255, 255, 0.7)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                    />
                    <YAxis 
                      stroke="rgba(255, 255, 255, 0.7)"
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey={fightStats.fighterAName} 
                      fill="#00F0FF" 
                      opacity={0.8}
                    />
                    <Bar 
                      dataKey={fightStats.fighterBName} 
                      fill="#FF3864" 
                      opacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Fighter Stats Cards */}
          <Grid item xs={12} md={6}>
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
                  {fightStats.fighterAName}
                </Typography>
                <Chip 
                  label={fightStats.astance}
                  sx={{ 
                    bgcolor: 'rgba(0, 240, 255, 0.1)',
                    color: '#00F0FF',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    fontSize: '0.75rem',
                    height: '24px',
                  }}
                />
              </Box>

              {/* Metrics */}
              <Box sx={ratingCardStyles.metrics}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography sx={ratingCardStyles.weightClassLabel}>
                      Total Strikes
                    </Typography>
                    <Typography sx={ratingCardStyles.ratingValue}>
                      {fighterATotalStrikes}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={ratingCardStyles.weightClassLabel}>
                      High Impact
                    </Typography>
                    <Typography sx={ratingCardStyles.ratingValue}>
                      {fightStats.AHighImpact}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2 }}>
                  <Typography sx={ratingCardStyles.weightClassLabel}>
                    Takedown Success
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography sx={{ color: '#00F0FF', fontSize: '1.2rem', fontWeight: 600 }}>
                      {fightStats.atdmake}/{fightStats.atdattempt}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
                      ({fightStats.atdrate})
                    </Typography>
                  </Box>
                  
                  {/* Takedown Progress Bar */}
                  <Box sx={ratingCardStyles.progressContainer}>
                    <Box 
                      className="rating-progress"
                      sx={ratingCardStyles.progressBar}
                    >
                      <Box 
                        sx={{
                          ...ratingCardStyles.progressFill,
                          width: `${fightStats.atdattempt > 0 ? (fightStats.atdmake / fightStats.atdattempt) * 100 : 0}%`,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
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
                      background: '#FF3864',
                      boxShadow: '0 0 10px rgba(255, 56, 100, 0.5)',
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
                      border: '2px solid #FF3864',
                      opacity: 0.5,
                    }
                  }}/>
                </Box>
                <Typography sx={ratingCardStyles.title}>
                  {fightStats.fighterBName}
                </Typography>
                <Chip 
                  label={fightStats.bstance}
                  sx={{ 
                    bgcolor: 'rgba(255, 56, 100, 0.1)',
                    color: '#FF3864',
                    border: '1px solid rgba(255, 56, 100, 0.2)',
                    fontSize: '0.75rem',
                    height: '24px',
                  }}
                />
              </Box>

              {/* Metrics */}
              <Box sx={ratingCardStyles.metrics}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography sx={ratingCardStyles.weightClassLabel}>
                      Total Strikes
                    </Typography>
                    <Typography sx={{ ...ratingCardStyles.ratingValue, color: '#FF3864' }}>
                      {fighterBTotalStrikes}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={ratingCardStyles.weightClassLabel}>
                      High Impact
                    </Typography>
                    <Typography sx={{ ...ratingCardStyles.ratingValue, color: '#FF3864' }}>
                      {fightStats.BHighImpact}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2 }}>
                  <Typography sx={ratingCardStyles.weightClassLabel}>
                    Takedown Success
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography sx={{ color: '#FF3864', fontSize: '1.2rem', fontWeight: 600 }}>
                      {fightStats.btdmake}/{fightStats.btdattempt}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
                      ({fightStats.btdrate})
                    </Typography>
                  </Box>
                  
                  {/* Takedown Progress Bar */}
                  <Box sx={ratingCardStyles.progressContainer}>
                    <Box 
                      className="rating-progress"
                      sx={ratingCardStyles.progressBar}
                    >
                      <Box 
                        sx={{
                          ...ratingCardStyles.progressFill,
                          background: 'linear-gradient(90deg, #FF3864, #CC1F41)',
                          width: `${fightStats.btdattempt > 0 ? (fightStats.btdmake / fightStats.btdattempt) * 100 : 0}%`,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default FightStats; 