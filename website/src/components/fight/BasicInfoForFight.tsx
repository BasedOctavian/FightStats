import React from 'react';
import { Paper, Typography, Box, Grid, Tooltip, LinearProgress, Chip } from '@mui/material';
import { Fighter } from '../../types/firestore';
import { 
  TrendingUp, 
  TrendingDown,
  FitnessCenter as StrikeIcon,
  SportsMma as ImpactIcon,
  SportsKabaddi as GrapplingIcon,
  Speed as SpeedIcon,
  Assessment,
  Assessment as AssessmentIcon,
  AutoAwesome,
  SportsMartialArts,
  ElectricBolt,
} from '@mui/icons-material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface BasicInfoForFightProps {
  fighter: Fighter;
  fightStats?: {
    totalStrikes?: { thrown: number; landed: number; };
    groundStrikes?: { thrown: number; landed: number; };
    clinchStrikes?: { thrown: number; landed: number; };
    takedowns?: { attempted: number; successful: number; };
    submissions?: { attempted: number; successful: number; };
  };
  fightData?: any; // We'll properly type this later
  isAFighter: boolean;
}

interface StatSectionProps {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface InsightMetric {
  label: string;
  value: number;
  type: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

interface RadarDataPoint {
  subject: string;
  fight: number;
  career: number;
  fullMark: number;
  description: string;
}

const BasicInfoForFight: React.FC<BasicInfoForFightProps> = ({ fighter, fightStats, fightData, isAFighter }) => {
  if (!fightData) return null;

  const calculateStatsPerMinute = (value: number) => {
    let totalMinutes = 0;
    const rounds = fightData.Rounds;
    
    // Calculate total fight time in minutes
    for (let i = 1; i < rounds; i++) {
      totalMinutes += 5; // Full rounds are 5 minutes
    }
    
    // Add final round time
    if (fightData.Time) {
      const [minutes, seconds] = fightData.Time.split(':').map(Number);
      totalMinutes += minutes + seconds / 60;
    }

    return totalMinutes > 0 ? (value / totalMinutes).toFixed(2) : '0.00';
  };

  const calculateCareerStatsPerMinute = (value: number) => {
    const minutesTracked = fighter.MinutesTracked || 1; // Fallback to 1 to avoid division by zero
    return (value / minutesTracked).toFixed(2);
  };

  const renderStatBar = (landed: number, thrown: number) => {
    const percentage = thrown > 0 ? (landed / thrown) * 100 : 0;
    return (
      <Box sx={{ width: '100%', mt: 1 }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: 'rgba(0, 240, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              bgcolor: '#00F0FF',
              borderRadius: 3,
            },
          }}
        />
      </Box>
    );
  };

  const renderFightStatPerMinute = (
    label: string, 
    landed: number, 
    thrown: number,
    careerLanded: number,
    careerThrown: number
  ) => {
    const fightRate = parseFloat(calculateStatsPerMinute(landed));
    const careerRate = parseFloat(calculateCareerStatsPerMinute(careerLanded));
    const performanceDiff = fightRate - careerRate;
    const accuracy = ((landed / (thrown || 1)) * 100).toFixed(1);

    return (
      <Tooltip 
        title={`Career Average: ${careerRate.toFixed(2)}/min`}
        placement="top"
        arrow
      >
        <Box 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            bgcolor: 'rgba(0, 240, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(0, 240, 255, 0.08)',
            mb: 2,
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(8px)',
            '&:hover': {
              bgcolor: 'rgba(0, 240, 255, 0.05)',
              border: '1px solid rgba(0, 240, 255, 0.15)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0, 240, 255, 0.1)',
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.9rem',
                fontWeight: 500,
                letterSpacing: '0.02em',
                display: 'flex', 
                alignItems: 'center', 
                gap: 1 
              }}
            >
              {label}
              {performanceDiff > 0.1 && (
                <TrendingUp sx={{ color: '#4CAF50', fontSize: 18 }} />
              )}
              {performanceDiff < -0.1 && (
                <TrendingDown sx={{ color: '#f44336', fontSize: 18 }} />
              )}
            </Typography>
            <Typography 
              sx={{ 
                color: '#00F0FF',
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              {fightRate}/min
            </Typography>
          </Box>
          
          {renderStatBar(landed, thrown)}
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            mt: 1
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              Accuracy
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {accuracy}% ({landed}/{thrown})
            </Typography>
          </Box>
        </Box>
      </Tooltip>
    );
  };

  const renderCareerStatPerMinute = (label: string, landed: number, thrown: number) => {
    const rate = calculateCareerStatsPerMinute(landed);
    const accuracy = ((landed / (thrown || 1)) * 100).toFixed(1);

    return (
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          bgcolor: 'rgba(0, 240, 255, 0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(0, 240, 255, 0.08)',
          mb: 2,
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(8px)',
          '&:hover': {
            bgcolor: 'rgba(0, 240, 255, 0.05)',
            border: '1px solid rgba(0, 240, 255, 0.15)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 240, 255, 0.1)',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.9rem',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            {label}
          </Typography>
          <Typography 
            sx={{ 
              color: '#00F0FF',
              fontWeight: 600,
              fontSize: '1.1rem',
            }}
          >
            {rate}/min
          </Typography>
        </Box>

        {renderStatBar(landed, thrown)}

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mt: 1
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            Accuracy
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {accuracy}% ({landed}/{thrown})
          </Typography>
        </Box>
      </Box>
    );
  };

  const calculatePerformanceInsights = () => {
    const strikerPrefix = isAFighter ? 'a' : 'b';
    const fightMinutes = calculateFightMinutes();
    const total_stats = fighter.total_stats || {};

    // Calculate total strikes landed for strike rate
    const fightStrikes = {
      headKicks: fightData[`${strikerPrefix}headkick`] || 0,
      bodyKicks: fightData[`${strikerPrefix}bodykick`] || 0,
      legKicks: fightData[`${strikerPrefix}legkick`] || 0,
      hooks: fightData[`${strikerPrefix}hooks`] || 0,
      jabs: fightData[`${strikerPrefix}jabs`] || 0,
      powerStrikes: (
        (fightData[`${strikerPrefix}overhands`] || 0) + 
        (fightData[`${strikerPrefix}straights`] || 0) + 
        (fightData[`${strikerPrefix}cross`] || 0)
      ),
      elbows: fightData[`${strikerPrefix}elbows`] || 0,
      spinAttacks: fightData[`${strikerPrefix}spinbackfist`] || 0
    };

    const careerStrikes = {
      headKicks: total_stats.TotalHighKicksMade || 0,
      bodyKicks: total_stats.TotalBodyKicksMade || 0,
      legKicks: total_stats.TotalLegKicksMade || 0,
      hooks: total_stats.TotalHooksMade || 0,
      jabs: total_stats.TotalJabsMade || 0,
      powerStrikes: (
        (total_stats.TotalOverhandsMade || 0) + 
        (total_stats.TotalStraightsMade || 0) + 
        (total_stats.TotalCrossMake || 0)
      ),
      elbows: total_stats.TotalElbowsMade || 0,
      spinAttacks: total_stats.TotalSpinBackFistsMade || 0
    };

    // Calculate total strikes
    const fightTotal = Object.values(fightStrikes).reduce((a, b) => a + b, 0);
    const careerTotal = Object.values(careerStrikes).reduce((a, b) => a + b, 0);

    // Calculate strike rate
    const fightStrikeRate = fightMinutes > 0 ? fightTotal / fightMinutes : 0;
    const careerStrikeRate = fighter.MinutesTracked ? careerTotal / fighter.MinutesTracked : 0;
    const strikeRateDiff = fightStrikeRate - careerStrikeRate;

    // Calculate strike pattern similarity (cosine similarity)
    const fightRates = Object.values(fightStrikes).map(v => v / fightMinutes);
    const careerRates = Object.values(careerStrikes).map(v => v / (fighter.MinutesTracked || 1));
    const dotProduct = fightRates.reduce((sum, rate, i) => sum + rate * careerRates[i], 0);
    const fightMagnitude = Math.sqrt(fightRates.reduce((sum, rate) => sum + rate * rate, 0));
    const careerMagnitude = Math.sqrt(careerRates.reduce((sum, rate) => sum + rate * rate, 0));
    const similarity = (fightMagnitude && careerMagnitude) 
      ? (dotProduct / (fightMagnitude * careerMagnitude)) * 100 
      : 0;

    // Calculate strike variety (number of different strikes used significantly)
    const significantThreshold = 0.1; // 10% of total strikes
    const fightVariety = Object.values(fightStrikes)
      .filter(strikes => (strikes / fightTotal) > significantThreshold).length;
    const careerVariety = Object.values(careerStrikes)
      .filter(strikes => (strikes / careerTotal) > significantThreshold).length;
    const varietyDiff = fightVariety - careerVariety;

    // Calculate target distribution (head/body/leg ratio)
    const fightHeadStrikes = fightStrikes.headKicks + fightStrikes.hooks + fightStrikes.jabs + fightStrikes.powerStrikes;
    const fightBodyStrikes = fightStrikes.bodyKicks + fightStrikes.elbows;
    const fightLegStrikes = fightStrikes.legKicks;
    const fightHeadRatio = fightTotal > 0 ? (fightHeadStrikes / fightTotal) * 100 : 0;
    
    const careerHeadStrikes = careerStrikes.headKicks + careerStrikes.hooks + careerStrikes.jabs + careerStrikes.powerStrikes;
    const careerBodyStrikes = careerStrikes.bodyKicks + careerStrikes.elbows;
    const careerLegStrikes = careerStrikes.legKicks;
    const careerHeadRatio = careerTotal > 0 ? (careerHeadStrikes / careerTotal) * 100 : 0;
    
    const headHuntingDiff = fightHeadRatio - careerHeadRatio;

    // Calculate power strike ratio
    const fightPowerRatio = fightTotal > 0 ? 
      ((fightStrikes.powerStrikes + fightStrikes.headKicks + fightStrikes.elbows) / fightTotal) * 100 : 0;
    const careerPowerRatio = careerTotal > 0 ? 
      ((careerStrikes.powerStrikes + careerStrikes.headKicks + careerStrikes.elbows) / careerTotal) * 100 : 0;
    const powerRatioDiff = fightPowerRatio - careerPowerRatio;

    return [
      {
        label: 'Strike Rate',
        value: fightStrikeRate,
        type: strikeRateDiff > 0.1 ? 'positive' : strikeRateDiff < -0.1 ? 'negative' : 'neutral',
        icon: <SpeedIcon />,
        delta: strikeRateDiff,
        format: (v: number) => v.toFixed(1),
        suffix: '/min',
        avgLabel: `Career Avg: ${careerStrikeRate.toFixed(1)}/min`
      },
      {
        label: 'Pattern Similarity',
        value: similarity,
        type: similarity > 75 ? 'positive' : similarity < 50 ? 'negative' : 'neutral',
        icon: <Assessment />,
        delta: 0,
        format: (v: number) => v.toFixed(1),
        suffix: '%',
        avgLabel: 'Compared to career tendencies'
      },
      {
        label: 'Strike Variety',
        value: fightVariety,
        type: varietyDiff > 0 ? 'positive' : varietyDiff < 0 ? 'negative' : 'neutral',
        icon: <AutoAwesome />,
        delta: varietyDiff,
        format: (v: number) => v.toFixed(0),
        suffix: ' types',
        avgLabel: `Career Avg: ${careerVariety} significant strike types`
      },
      {
        label: 'Head Hunting',
        value: fightHeadRatio,
        type: headHuntingDiff > 5 ? 'positive' : headHuntingDiff < -5 ? 'negative' : 'neutral',
        icon: <SportsMartialArts />,
        delta: headHuntingDiff,
        format: (v: number) => v.toFixed(1),
        suffix: '%',
        avgLabel: `Career Avg: ${careerHeadRatio.toFixed(1)}% head strikes`
      },
      {
        label: 'Power Strike Ratio',
        value: fightPowerRatio,
        type: powerRatioDiff > 5 ? 'positive' : powerRatioDiff < -5 ? 'negative' : 'neutral',
        icon: <ElectricBolt />,
        delta: powerRatioDiff,
        format: (v: number) => v.toFixed(1),
        suffix: '%',
        avgLabel: `Career Avg: ${careerPowerRatio.toFixed(1)}% power strikes`
      }
    ];
  };

  const prepareRadarData = (): RadarDataPoint[] => {
    const prefix = isAFighter ? 'a' : 'b';
    const total_stats = fighter.total_stats || {};
    const fightMinutes = calculateFightMinutes();
    const careerMinutes = fighter.MinutesTracked || 1;

    // Helper function to calculate strikes per minute
    const calculateStrikesPerMinute = (strikes: number, minutes: number) => 
      minutes > 0 ? strikes / minutes : 0;

    const metrics = [
      {
        subject: 'Head Kicks',
        fight: calculateStrikesPerMinute(fightData[`${prefix}headkick`] || 0, fightMinutes),
        career: calculateStrikesPerMinute(total_stats.TotalHighKicksMade || 0, careerMinutes),
        description: 'Strikes per minute'
      },
      {
        subject: 'Body Kicks',
        fight: calculateStrikesPerMinute(fightData[`${prefix}bodykick`] || 0, fightMinutes),
        career: calculateStrikesPerMinute(total_stats.TotalBodyKicksMade || 0, careerMinutes),
        description: 'Strikes per minute'
      },
      {
        subject: 'Hooks',
        fight: calculateStrikesPerMinute(fightData[`${prefix}hooks`] || 0, fightMinutes),
        career: calculateStrikesPerMinute(total_stats.TotalHooksMade || 0, careerMinutes),
        description: 'Strikes per minute'
      },
      {
        subject: 'Jabs',
        fight: calculateStrikesPerMinute(fightData[`${prefix}jabs`] || 0, fightMinutes),
        career: calculateStrikesPerMinute(total_stats.TotalJabsMade || 0, careerMinutes),
        description: 'Strikes per minute'
      },
      {
        subject: 'Leg Kicks',
        fight: calculateStrikesPerMinute(fightData[`${prefix}legkick`] || 0, fightMinutes),
        career: calculateStrikesPerMinute(total_stats.TotalLegKicksMade || 0, careerMinutes),
        description: 'Strikes per minute'
      },
      {
        subject: 'Power Strikes',
        fight: calculateStrikesPerMinute(
          (fightData[`${prefix}overhands`] || 0) + 
          (fightData[`${prefix}straights`] || 0) + 
          (fightData[`${prefix}cross`] || 0),
          fightMinutes
        ),
        career: calculateStrikesPerMinute(
          (total_stats.TotalOverhandsMade || 0) + 
          (total_stats.TotalStraightsMade || 0) + 
          (total_stats.TotalCrossMake || 0),
          careerMinutes
        ),
        description: 'Strikes per minute'
      },
      {
        subject: 'Elbows',
        fight: calculateStrikesPerMinute(fightData[`${prefix}elbows`] || 0, fightMinutes),
        career: calculateStrikesPerMinute(total_stats.TotalElbowsMade || 0, careerMinutes),
        description: 'Strikes per minute'
      },
      {
        subject: 'Spin Attacks',
        fight: calculateStrikesPerMinute(fightData[`${prefix}spinbackfist`] || 0, fightMinutes),
        career: calculateStrikesPerMinute(total_stats.TotalSpinBackFistsMade || 0, careerMinutes),
        description: 'Strikes per minute'
      }
    ];

    // Find the maximum strikes per minute across all metrics
    const maxStrikesPerMinute = Math.max(
      ...metrics.flatMap(metric => [metric.fight, metric.career])
    );

    // Set the chart maximum to either 1.5 or the highest value, whichever is greater
    const chartMax = Math.max(1.5, Math.ceil(maxStrikesPerMinute * 2) / 2);

    // Log the detailed metrics
    console.group('Strike Distribution - Strikes Per Minute');
    console.log('Fight Duration:', fightMinutes.toFixed(2), 'minutes');
    console.log('Career Minutes:', careerMinutes);
    console.log('Maximum Strikes Per Minute:', maxStrikesPerMinute.toFixed(2));
    console.log('Chart Maximum:', chartMax);
    metrics.forEach(metric => {
      console.group(metric.subject);
      console.log('Fight:', {
        raw_strikes: metric.fight * fightMinutes,
        minutes: fightMinutes,
        per_minute: metric.fight.toFixed(2)
      });
      console.log('Career:', {
        raw_strikes: metric.career * careerMinutes,
        minutes: careerMinutes,
        per_minute: metric.career.toFixed(2)
      });
      console.groupEnd();
    });
    console.groupEnd();

    return metrics.map(metric => ({
      ...metric,
      fullMark: chartMax
    }));
  };

  const calculateFightMinutes = () => {
    let totalMinutes = 0;
    const rounds = fightData.Rounds;
    
    // Calculate total fight time in minutes
    for (let i = 1; i < rounds; i++) {
      totalMinutes += 5; // Full rounds are 5 minutes
    }
    
    // Add final round time
    if (fightData.Time) {
      const [minutes, seconds] = fightData.Time.split(':').map(Number);
      totalMinutes += minutes + seconds / 60;
    }

    return totalMinutes;
  };

  // Custom tooltip component for the radar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            bgcolor: 'rgba(10, 14, 23, 0.95)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            p: 2,
            borderRadius: '6px',
            backdropFilter: 'blur(10px)',
            maxWidth: 250,
            boxShadow: '0 4px 12px rgba(0, 240, 255, 0.1)',
          }}
        >
          <Typography sx={{ color: '#00F0FF', fontWeight: 600, mb: 1 }}>
            {data.subject}
          </Typography>
          <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
            Fight: {(data.fight / 10).toFixed(2)}/min
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', mb: 1 }}>
            Career: {(data.career / 10).toFixed(2)}/min
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem' }}>
            {data.description}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const renderPerformanceInsights = () => {
    const insights = calculatePerformanceInsights();

    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3,
          mb: 4,
          bgcolor: 'rgba(10, 14, 23, 0.8)',
          borderRadius: '16px',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          height: 500,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, rgba(0, 240, 255, 0), rgba(0, 240, 255, 0.5), rgba(0, 240, 255, 0))',
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          mb: 3,
          pb: 2,
          borderBottom: '1px solid rgba(0, 240, 255, 0.15)'
        }}>
          <AssessmentIcon sx={{ color: '#00F0FF', fontSize: 24 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#fff',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            Performance Insights
          </Typography>
        </Box>

        <Box sx={{ height: 'calc(100% - 70px)', overflowY: 'auto', pr: 1 }}>
          <Grid container spacing={2}>
            {/* Main metrics - larger size */}
            {insights.slice(0, 2).map((metric, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '160px',
                  position: 'relative',
                  bgcolor: 'rgba(10, 14, 23, 0.4)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 240, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  '&:hover': {
                    bgcolor: 'rgba(10, 14, 23, 0.6)',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    transform: 'translateY(-2px)',
                    '& .glow-effect': {
                      opacity: 0.1,
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.3), transparent)',
                  }
                }}>
                  <Box className="glow-effect" sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.2), transparent 70%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease-in-out',
                    pointerEvents: 'none',
                  }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                      }}
                    >
                      {metric.icon}
                      {metric.label}
                    </Typography>
                  </Box>

                  <Box sx={{ position: 'relative' }}>
                    <Typography 
                      variant="h3"
                      sx={{ 
                        fontWeight: 700,
                        color: metric.type === 'positive' ? '#4CAF50' : 
                               metric.type === 'negative' ? '#f44336' : '#fff',
                        mb: 1,
                        fontFamily: 'monospace',
                        textShadow: `0 0 20px ${
                          metric.type === 'positive' ? 'rgba(76, 175, 80, 0.4)' :
                          metric.type === 'negative' ? 'rgba(244, 67, 54, 0.4)' :
                          'rgba(255, 255, 255, 0.4)'
                        }`,
                      }}
                    >
                      {metric.format(metric.value)}{metric.suffix}
                    </Typography>

                    {metric.delta !== 0 && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 1,
                        mb: 1
                      }}>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            color: metric.type === 'positive' ? '#4CAF50' : 
                                  metric.type === 'negative' ? '#f44336' : '#fff',
                            fontWeight: 500,
                            fontFamily: 'monospace',
                          }}
                        >
                          {metric.delta >= 0 ? '+' : ''}{metric.delta.toFixed(1)}{metric.suffix}
                        </Typography>
                        <Typography 
                          variant="body2"
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.5)'
                          }}
                        >
                          vs average
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography 
                    variant="body2"
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontFamily: 'monospace',
                      mt: 1
                    }}
                  >
                    {metric.avgLabel}
                  </Typography>
                </Box>
              </Grid>
            ))}

            {/* Secondary metrics - smaller size */}
            {insights.slice(2).map((metric, index) => (
              <Grid item xs={12} sm={6} md={4} key={index + 2}>
                <Box sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '140px',
                  position: 'relative',
                  bgcolor: 'rgba(10, 14, 23, 0.4)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 240, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  '&:hover': {
                    bgcolor: 'rgba(10, 14, 23, 0.6)',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    transform: 'translateY(-2px)',
                    '& .glow-effect': {
                      opacity: 0.1,
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.3), transparent)',
                  }
                }}>
                  <Box className="glow-effect" sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.2), transparent 70%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease-in-out',
                    pointerEvents: 'none',
                  }} />
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                      }}
                    >
                      {metric.icon}
                      {metric.label}
                    </Typography>
                  </Box>

                  <Box sx={{ position: 'relative' }}>
                    <Typography 
                      variant="h4"
                      sx={{ 
                        fontWeight: 700,
                        color: metric.type === 'positive' ? '#4CAF50' : 
                               metric.type === 'negative' ? '#f44336' : '#fff',
                        mb: 1,
                        fontFamily: 'monospace',
                        textShadow: `0 0 20px ${
                          metric.type === 'positive' ? 'rgba(76, 175, 80, 0.4)' :
                          metric.type === 'negative' ? 'rgba(244, 67, 54, 0.4)' :
                          'rgba(255, 255, 255, 0.4)'
                        }`,
                      }}
                    >
                      {metric.format(metric.value)}{metric.suffix}
                    </Typography>

                    {metric.delta !== 0 && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 1,
                        mb: 1
                      }}>
                        <Typography 
                          variant="body2"
                          sx={{ 
                            color: metric.type === 'positive' ? '#4CAF50' : 
                                  metric.type === 'negative' ? '#f44336' : '#fff',
                            fontWeight: 500,
                            fontFamily: 'monospace',
                          }}
                        >
                          {metric.delta >= 0 ? '+' : ''}{metric.delta.toFixed(1)}{metric.suffix}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography 
                    variant="caption"
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem'
                    }}
                  >
                    {metric.avgLabel}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    );
  };

  const renderPerformanceComparison = () => {
    const data = prepareRadarData();
    const chartMax = data[0].fullMark;

    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3,
          mb: 4,
          bgcolor: 'rgba(10, 14, 23, 0.8)',
          borderRadius: '16px',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          height: 500, // Reduced from 600
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, rgba(0, 240, 255, 0), rgba(0, 240, 255, 0.5), rgba(0, 240, 255, 0))',
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          mb: 3,
          pb: 2,
          borderBottom: '1px solid rgba(0, 240, 255, 0.15)'
        }}>
          <AssessmentIcon sx={{ color: '#00F0FF', fontSize: 24 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#fff',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            Strike Distribution
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.5)',
              ml: 'auto',
              fontFamily: 'monospace',
            }}
          >
            Max: {chartMax}/min
          </Typography>
        </Box>

        <Box sx={{ width: '100%', height: 380, position: 'relative' }}>
          <ResponsiveContainer>
            <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
              <PolarGrid 
                stroke="rgba(0, 240, 255, 0.1)"
                gridType="circle"
              />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ 
                  fill: '#fff',
                  fontSize: 10,
                  fontWeight: 500,
                }}
                stroke="rgba(0, 240, 255, 0.2)"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, chartMax]}
                tick={{ 
                  fill: 'rgba(255, 255, 255, 0.5)',
                  fontSize: 9
                }}
                stroke="rgba(0, 240, 255, 0.1)"
              />
              <Radar
                name="Career Distribution"
                dataKey="career"
                stroke="rgba(255, 255, 255, 0.3)"
                fill="rgba(255, 255, 255, 0.1)"
                fillOpacity={0.3}
              />
              <Radar
                name="Fight Distribution"
                dataKey="fight"
                stroke="#00F0FF"
                fill="#00F0FF"
                fillOpacity={0.3}
              />
              <RechartsTooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>

          <Box 
            sx={{ 
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 3,
              bgcolor: 'rgba(10, 14, 23, 0.9)',
              p: 1.5,
              borderRadius: '6px',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              backdropFilter: 'blur(5px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 10, 
                height: 10, 
                bgcolor: '#00F0FF',
                borderRadius: '50%',
                boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
              }} />
              <Typography sx={{ 
                color: '#fff', 
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Fight
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, bgcolor: 'rgba(255, 255, 255, 0.3)', borderRadius: '50%' }} />
              <Typography sx={{ 
                color: '#fff', 
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Career
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  };

  const prefix = isAFighter ? 'a' : 'b';

  const renderStatsContainer = (title: string, isCareer: boolean = false) => {
    const total_stats = fighter.total_stats || {};
    const takedown_stats = fighter.takedown_stats || {};

    // Calculate total career takedowns
    const totalSuccessfulTakedowns = (
      (takedown_stats.BodyLockTakedownSuccess || 0) +
      (takedown_stats.DoubleLegTakedownSuccess || 0) +
      (takedown_stats.SingleLegTakedownSuccess || 0) +
      (takedown_stats.SuccessfulAnklePickTD || 0) +
      (takedown_stats.SuccessfulImanariTD || 0) +
      (takedown_stats.SuccessfulThrowTD || 0) +
      (takedown_stats.TripTakedownSuccess || 0)
    );

    const totalTakedownAttempts = (
      (takedown_stats.BodyLockTakedownAttempts || 0) +
      (takedown_stats.DoubleLegTakedownAttempts || 0) +
      (takedown_stats.SingleLegTakedownAttempts || 0) +
      (takedown_stats.AttemptedAnklePickTD || 0) +
      (takedown_stats.AttemptedImanariTD || 0) +
      (takedown_stats.AttemptedThrowTD || 0) +
      (takedown_stats.TripTakedownAttempts || 0)
    );

    // Helper function to get fight stats
    const getFightStats = (type: string) => ({
      landed: fightData[`${prefix}${type}`] || 0,
      thrown: fightData[`${prefix}${type}attempt`] || fightData[`${prefix}${type}`] || 0
    });

    const renderStatSection = (props: StatSectionProps) => (
      <Box sx={{ mb: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            mb: 3,
            pb: 2,
            borderBottom: '1px solid rgba(0, 240, 255, 0.15)'
          }}
        >
          {props.icon}
          <Typography 
            sx={{ 
              color: '#00F0FF',
              fontWeight: 600,
              fontSize: '1.1rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {props.title}
          </Typography>
        </Box>
        {props.content}
      </Box>
    );

    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3,
          bgcolor: 'rgba(10, 14, 23, 0.8)',
          borderRadius: '16px',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, rgba(0, 240, 255, 0), rgba(0, 240, 255, 0.5), rgba(0, 240, 255, 0))',
          }
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 4, 
            color: '#fff', 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            textAlign: 'center',
            textShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
            borderBottom: '2px solid rgba(0, 240, 255, 0.2)',
            pb: 2
          }}
        >
          {title}
        </Typography>

        {/* Strike Distribution */}
        {renderStatSection({
          title: 'Strike Distribution',
          icon: <StrikeIcon sx={{ color: 'rgba(0, 240, 255, 0.7)', fontSize: 24 }} />,
          content: isCareer ? (
            <>
              {renderCareerStatPerMinute('Body Kicks', total_stats.TotalBodyKicksMade || 0, total_stats.TotalBodyKicksThrown || 0)}
              {renderCareerStatPerMinute('Head Kicks', total_stats.TotalHighKicksMade || 0, total_stats.TotalHighKicksThrown || 0)}
              {renderCareerStatPerMinute('Hooks', total_stats.TotalHooksMade || 0, total_stats.TotalHooksThrown || 0)}
              {renderCareerStatPerMinute('Jabs', total_stats.TotalJabsMade || 0, total_stats.TotalJabsThrown || 0)}
              {renderCareerStatPerMinute('Leg Kicks', total_stats.TotalLegKicksMade || 0, total_stats.TotalLegKicksThrown || 0)}
              {renderCareerStatPerMinute('Overhands', total_stats.TotalOverhandsMade || 0, total_stats.TotalOverhandsThrown || 0)}
              {renderCareerStatPerMinute('Straights', total_stats.TotalStraightsMade || 0, total_stats.TotalStraightsThrown || 0)}
              {renderCareerStatPerMinute('Uppercuts', total_stats.TotalUppercutsMade || 0, total_stats.TotalUppercutsThrown || 0)}
              {renderCareerStatPerMinute('Cross', total_stats.TotalCrossMake || 0, total_stats.TotalCrossAttempts || 0)}
              {renderCareerStatPerMinute('Elbows', total_stats.TotalElbowsMade || 0, total_stats.TotalElbowsThrown || 0)}
              {renderCareerStatPerMinute('Spin Back Fists', total_stats.TotalSpinBackFistsMade || 0, total_stats.TotalSpinBackFistsThrown || 0)}
            </>
          ) : (
            <>
              {renderFightStatPerMinute(
                'Body Kicks',
                getFightStats('bodykick').landed,
                getFightStats('bodykick').thrown,
                total_stats.TotalBodyKicksMade || 0,
                total_stats.TotalBodyKicksThrown || 0
              )}
              {renderFightStatPerMinute(
                'Head Kicks',
                getFightStats('headkick').landed,
                getFightStats('headkick').thrown,
                total_stats.TotalHighKicksMade || 0,
                total_stats.TotalHighKicksThrown || 0
              )}
              {renderFightStatPerMinute(
                'Hooks',
                getFightStats('hooks').landed,
                getFightStats('hooks').thrown,
                total_stats.TotalHooksMade || 0,
                total_stats.TotalHooksThrown || 0
              )}
              {renderFightStatPerMinute(
                'Jabs',
                getFightStats('jabs').landed,
                getFightStats('jabs').thrown,
                total_stats.TotalJabsMade || 0,
                total_stats.TotalJabsThrown || 0
              )}
              {renderFightStatPerMinute(
                'Leg Kicks',
                getFightStats('legkick').landed,
                getFightStats('legkick').thrown,
                total_stats.TotalLegKicksMade || 0,
                total_stats.TotalLegKicksThrown || 0
              )}
              {renderFightStatPerMinute(
                'Overhands',
                getFightStats('overhands').landed,
                getFightStats('overhands').thrown,
                total_stats.TotalOverhandsMade || 0,
                total_stats.TotalOverhandsThrown || 0
              )}
              {renderFightStatPerMinute(
                'Straights',
                getFightStats('straights').landed,
                getFightStats('straights').thrown,
                total_stats.TotalStraightsMade || 0,
                total_stats.TotalStraightsThrown || 0
              )}
              {renderFightStatPerMinute(
                'Uppercuts',
                getFightStats('uppercuts').landed,
                getFightStats('uppercuts').thrown,
                total_stats.TotalUppercutsMade || 0,
                total_stats.TotalUppercutsThrown || 0
              )}
              {renderFightStatPerMinute(
                'Cross',
                getFightStats('cross').landed,
                getFightStats('cross').thrown,
                total_stats.TotalCrossMake || 0,
                total_stats.TotalCrossAttempts || 0
              )}
              {renderFightStatPerMinute(
                'Elbows',
                getFightStats('elbows').landed,
                getFightStats('elbows').thrown,
                total_stats.TotalElbowsMade || 0,
                total_stats.TotalElbowsThrown || 0
              )}
              {renderFightStatPerMinute(
                'Spin Back Fists',
                getFightStats('spinbackfist').landed,
                getFightStats('spinbackfist').thrown,
                total_stats.TotalSpinBackFistsMade || 0,
                total_stats.TotalSpinBackFistsThrown || 0
              )}
            </>
          )
        })}

        {/* Impact Stats */}
        {renderStatSection({
          title: 'Impact Stats',
          icon: <ImpactIcon sx={{ color: 'rgba(0, 240, 255, 0.7)', fontSize: 24 }} />,
          content: isCareer ? (
            <>
              {renderCareerStatPerMinute(
                'Knockdowns',
                fighter.NumberOfKnockDowns || 0,
                fighter.NumberOfKnockDowns || 0
              )}
              {renderCareerStatPerMinute(
                'Stuns',
                fighter.NumberOfStuns || 0,
                fighter.NumberOfStuns || 0
              )}
            </>
          ) : (
            <>
              {renderFightStatPerMinute(
                'Knockdowns',
                fightData[`${prefix}numofknockdowns`] || 0,
                fightData[`${prefix}numofknockdowns`] || 0,
                fighter.NumberOfKnockDowns || 0,
                fighter.NumberOfKnockDowns || 0
              )}
              {renderFightStatPerMinute(
                'Stuns',
                fightData[`${prefix}numofstuns`] || 0,
                fightData[`${prefix}numofstuns`] || 0,
                fighter.NumberOfStuns || 0,
                fighter.NumberOfStuns || 0
              )}
            </>
          )
        })}

        {/* Grappling */}
        {renderStatSection({
          title: 'Grappling',
          icon: <GrapplingIcon sx={{ color: 'rgba(0, 240, 255, 0.7)', fontSize: 24 }} />,
          content: isCareer ? (
            <>
              {renderCareerStatPerMinute(
                'Submission Attempts',
                fighter.submission_stats?.SubAttempts || 0,
                fighter.submission_stats?.SubAttempts || 0
              )}
              {renderCareerStatPerMinute(
                'Takedown Success',
                totalSuccessfulTakedowns,
                totalTakedownAttempts
              )}
            </>
          ) : (
            <>
              {renderFightStatPerMinute(
                'Submission Attempts',
                fightData[`${prefix}subattempt`] || 0,
                fightData[`${prefix}subattempt`] || 0,
                fighter.submission_stats?.SubAttempts || 0,
                fighter.submission_stats?.SubAttempts || 0
              )}
              {renderFightStatPerMinute(
                'Takedown Success',
                fightData[`${prefix}tdmake`] || 0,
                fightData[`${prefix}tdattempt`] || 0,
                totalSuccessfulTakedowns,
                totalTakedownAttempts
              )}
            </>
          )
        })}
      </Paper>
    );
  };

  return (
    <>
      {renderPerformanceComparison()}
      {renderPerformanceInsights()}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          {renderStatsContainer('Fight Performance')}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderStatsContainer('Career Average', true)}
        </Grid>
      </Grid>
    </>
  );
};

export default BasicInfoForFight; 