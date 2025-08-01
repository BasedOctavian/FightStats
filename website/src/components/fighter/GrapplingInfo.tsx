import React from 'react';
import { Paper, Typography, Grid, Box, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip as RechartsTooltip, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis } from 'recharts';
import { Fighter } from '../../types/firestore';
import { useBasicInfo } from '../../hooks/stats/useBasicInfo';
import { useGrapplingInfo } from '../../hooks/stats/useGrapplingInfo';
import { colors } from '../../theme/colors';

interface GrapplingInfoProps {
  fighter: Fighter;
  weightClassAvgData?: any;
}

const GrapplingInfo: React.FC<GrapplingInfoProps> = ({ fighter, weightClassAvgData }): JSX.Element => {
  // State for managing collapsed sections
  const [collapsedSections, setCollapsedSections] = React.useState({
    overallGrappling: false, // Keep this expanded by default
    grapplingRating: true,   // Collapse by default
    groundGame: true,        // Collapse by default
    submissions: true,       // Collapse by default
    clinch: true,           // Collapse by default
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };




  
  // Use the grappling hook to get calculated data
  const { topTakedowns, topTakedownVulnerabilities } = useGrapplingInfo(fighter);

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

  // Calculate clinch control percentage
  const clinchControlPercentage = React.useMemo(() => {
    const inClinch = fighter.clinch_stats?.InClinch || 0;
    const beingClinched = fighter.clinch_stats?.BeingClinched || 0;
    const totalClinchTime = inClinch + beingClinched;
    
    if (totalClinchTime === 0) return 0;
    return (inClinch / totalClinchTime) * 100;
  }, [fighter.clinch_stats?.InClinch, fighter.clinch_stats?.BeingClinched]);

  // Calculate clinch striking accuracy
  const clinchStrikingAccuracy = React.useMemo(() => {
    const clinchStrikesMade = fighter.clinch_stats?.TotalClinchStrikesMade || 0;
    const clinchStrikesThrown = fighter.clinch_stats?.TotalClinchStrikesThrown || 0;
    
    if (clinchStrikesThrown === 0) return 0;
    return (clinchStrikesMade / clinchStrikesThrown) * 100;
  }, [fighter.clinch_stats?.TotalClinchStrikesMade, fighter.clinch_stats?.TotalClinchStrikesThrown]);

  // Calculate weight class clinch striking accuracy
  const weightClassClinchStrikingAccuracy = React.useMemo(() => {
    if (!weightClassAvgData) return 0;
    
    const weightClassClinchStrikesMade = weightClassAvgData.TotalClinchStrikesMade || 0;
    const weightClassClinchStrikesThrown = weightClassAvgData.TotalClinchStrikesThrown || 0;
    
    if (weightClassClinchStrikesThrown === 0) return 0;
    return (weightClassClinchStrikesMade / weightClassClinchStrikesThrown) * 100;
  }, [weightClassAvgData]);

  // Calculate clinch strikes landed per round
  const clinchStrikesPerRound = React.useMemo(() => {
    const clinchStrikesMade = fighter.clinch_stats?.TotalClinchStrikesMade || 0;
    const roundsTracked = fighter.RoundsTracked || 1;
    
    return clinchStrikesMade / roundsTracked;
  }, [fighter.clinch_stats?.TotalClinchStrikesMade, fighter.RoundsTracked]);

  // Calculate weight class clinch strikes per round
  const weightClassClinchStrikesPerRound = React.useMemo(() => {
    if (!weightClassAvgData) return 0;
    
    const weightClassClinchStrikesMade = weightClassAvgData.TotalClinchStrikesMade || 0;
    const weightClassRounds = weightClassAvgData.rounds || 1;
    
    return weightClassClinchStrikesMade / weightClassRounds;
  }, [weightClassAvgData]);

  // Calculate clinch rating based on control, accuracy, and volume
  const clinchRating = React.useMemo(() => {
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

    // Calculate individual component ratings
    const clinchControlRating = normalizeValue(clinchControlPercentage, 50); // 50% as baseline
    const clinchAccuracyRating = normalizeValue(clinchStrikingAccuracy, weightClassClinchStrikingAccuracy);
    const clinchVolumeRating = normalizeValue(clinchStrikesPerRound, weightClassClinchStrikesPerRound);
    
    // Combine all three metrics for overall clinch rating
    // Weight control more heavily as it's fundamental to clinch effectiveness
    const overallClinchRating = (clinchControlRating * 0.4) + (clinchAccuracyRating * 0.3) + (clinchVolumeRating * 0.3);
    
    return overallClinchRating;
  }, [clinchControlPercentage, clinchStrikingAccuracy, clinchStrikesPerRound, weightClassClinchStrikingAccuracy, weightClassClinchStrikesPerRound]);

  // Calculate takedown rating based on success rate and volume
  const takedownRating = React.useMemo(() => {
    const takedownStats = fighter.takedown_stats;
    if (!takedownStats || !weightClassAvgData) return 50; // Default to average if no data

    // Calculate fighter's total takedown attempts and successes
    const fighterAttempts = (
      (takedownStats.BodyLockTakedownAttempts || 0) +
      (takedownStats.DoubleLegTakedownAttempts || 0) +
      (takedownStats.SingleLegTakedownAttempts || 0) +
      (takedownStats.TripTakedownAttempts || 0) +
      (takedownStats.AttemptedAnklePickTD || 0) +
      (takedownStats.AttemptedThrowTD || 0) +
      (takedownStats.AttemptedImanariTD || 0)
    );

    const fighterSuccesses = (
      (takedownStats.BodyLockTakedownSuccess || 0) +
      (takedownStats.DoubleLegTakedownSuccess || 0) +
      (takedownStats.SingleLegTakedownSuccess || 0) +
      (takedownStats.TripTakedownSuccess || 0) +
      (takedownStats.SuccessfulAnklePickTD || 0) +
      (takedownStats.SuccessfulThrowTD || 0) +
      (takedownStats.SuccessfulImanariTD || 0)
    );

    // Calculate weight class takedown attempts 
    const weightClassAttempts = (
      (weightClassAvgData.BodyLockTakedownAttempts || 0) +
      (weightClassAvgData.DoubleLegTakedownAttempts || 0) +
      (weightClassAvgData.SingleLegTakedownAttempts || 0) +
      (weightClassAvgData.TripTakedownAttempts || 0) +
      (weightClassAvgData.AttemptedThrowTD || 0)
    );

    // Use UFC average success rate as baseline (38%)
    const ufcAverageSuccessRate = 0.38;

    // Prevent division by zero
    if (fighterAttempts === 0 && weightClassAttempts === 0) return 50;
    
    // Calculate fighter success rate
    const fighterSuccessRate = fighterAttempts > 0 ? fighterSuccesses / fighterAttempts : 0;

    // Calculate attempts per fight to factor in takedown frequency
    const fighterFights = fighter.FightsTracked || 1;
    const weightClassFights = weightClassAvgData.fights || 1;
    
    const fighterAttemptsPerFight = fighterAttempts / fighterFights;
    const weightClassAttemptsPerFight = weightClassAttempts / weightClassFights;

    // Prevent division by zero for frequency ratio
    if (weightClassAttemptsPerFight === 0) {
      // If no weight class data, base rating purely on fighter's success rate vs UFC average
      const simpleRatio = fighterSuccessRate / ufcAverageSuccessRate;
      const rating = 50 + (50 * Math.tanh((simpleRatio - 1) * 2));
      return Math.min(100, Math.max(1, Math.round(rating)));
    }

    // Calculate ratios compared to baselines
    const successRateRatio = fighterSuccessRate / ufcAverageSuccessRate;
    const frequencyRatio = fighterAttemptsPerFight / weightClassAttemptsPerFight;

    // Combine success rate (70%) and frequency (30%) with weights
    const combinedRatio = (successRateRatio * 0.7) + (frequencyRatio * 0.3);

    // Convert to 1-100 scale with 50 as average
    // Using tanh to create a smooth curve
    const rating = 50 + (50 * Math.tanh((combinedRatio - 1) * 2));

    // Ensure rating stays within 1-100 bounds
    return Math.min(100, Math.max(1, Math.round(rating)));
  }, [fighter, weightClassAvgData]);

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
            bgcolor: colors.backgroundTertiary,
            border: `1px solid ${colors.borderTertiary}`,
            p: 2,
            borderRadius: '6px',
            backdropFilter: 'blur(10px)',
            maxWidth: 280,
            boxShadow: `0 4px 12px ${colors.shadowPrimary}`,
          }}
        >
          <Typography sx={{ color: colors.primary, fontWeight: 600, mb: 1 }}>
            {data.subject}
          </Typography>
          <Typography sx={{ color: colors.textPrimary, fontSize: '0.9rem', mb: 1 }}>
            {fighter.fighterName}: {valueDisplay.fighterValue}
          </Typography>
          <Typography sx={{ color: colors.textTertiary, fontSize: '0.85rem' }}>
            Weight Class Avg: {valueDisplay.weightClassValue}
          </Typography>
          <Typography sx={{ color: colors.textMuted, fontSize: '0.8rem', mt: 1, fontStyle: 'italic' }}>
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

  // Calculate ground game rating based on control, accuracy, and volume
  const groundGameRating = React.useMemo(() => {
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

    // Calculate individual component ratings
    const groundControlRating = normalizeValue(groundControlPercentage, 50); // 50% as baseline
    const groundStrikingRating = normalizeValue(groundStrikingAccuracy, weightClassGroundStrikingAccuracy);
    const groundVolumeRating = normalizeValue(groundStrikesPerRound, weightClassGroundStrikesPerRound);
    
    // Combine all three metrics for overall ground game rating
    // Weight control more heavily as it's fundamental to ground effectiveness
    const overallGroundGameRating = (groundControlRating * 0.4) + (groundStrikingRating * 0.3) + (groundVolumeRating * 0.3);
    
    return overallGroundGameRating;
  }, [groundControlPercentage, groundStrikingAccuracy, groundStrikesPerRound, weightClassGroundStrikingAccuracy, weightClassGroundStrikesPerRound]);

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

  // Calculate submission rating based on attempt rate and success rate
  const submissionRating = React.useMemo(() => {
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

    // Calculate individual component ratings
    const attemptRateRating = normalizeValue(submissionAttemptRatePerRound, weightClassSubmissionAttemptRatePerRound);
    const successRateRating = normalizeValue(overallSubmissionSuccessRate, weightClassSubmissionSuccessRate);
    
    // Combine attempt rate and success rate for overall submission rating
    // Weight attempt rate more heavily as it shows activity and aggression
    const overallSubmissionRating = (attemptRateRating * 0.6) + (successRateRating * 0.4);
    
    return overallSubmissionRating;
  }, [submissionAttemptRatePerRound, weightClassSubmissionAttemptRatePerRound, overallSubmissionSuccessRate, weightClassSubmissionSuccessRate]);

  // Calculate overall grappling grade combining all four ratings
  const overallGrapplingGrade = React.useMemo(() => {
    // Combine all four grappling ratings with adjusted weighting
    // Takedowns and ground game are the main components, clinch and submissions weighted less
    // Each rating is already normalized to 1-99 scale
    const combinedRating = (takedownRating * 0.35) + (submissionRating * 0.15) + (clinchRating * 0.2) + (groundGameRating * 0.3);
    
    return combinedRating;
  }, [takedownRating, submissionRating, clinchRating, groundGameRating]);

  // Prepare overall grappling radar chart data
  const prepareOverallGrapplingRadarData = () => {
    // Calculate takedown rating (using existing calculation)
    const takedownRatingValue = takedownRating;
    const weightClassTakedownRating = 50; // Baseline for weight class average

    // Use the calculated submission rating
    const submissionRatingValue = submissionRating;
    const weightClassSubmissionRating = 50; // Baseline for weight class average

    // Use the calculated ground game rating
    const groundGameRatingValue = groundGameRating;
    const weightClassGroundGameRating = 50; // Baseline for weight class average

    // Calculate clinch rating (using the calculated clinchRating)
    const clinchRatingValue = clinchRating;
    const weightClassClinchRating = 50; // Baseline for weight class average

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
        value: submissionRatingValue,
        weightClassValue: weightClassSubmissionRating,
        description: 'Submission effectiveness based on attempt rate and success rate compared to weight class',
        rawValue: submissionRatingValue,
        rawWeightClassValue: weightClassSubmissionRating
      },
      {
        subject: 'Ground Game',
        value: groundGameRatingValue,
        weightClassValue: weightClassGroundGameRating,
        description: 'Ground control, striking accuracy, and volume compared to weight class average',
        rawValue: groundGameRatingValue,
        rawWeightClassValue: weightClassGroundGameRating
      },
      {
        subject: 'Clinch',
        value: clinchRatingValue,
        weightClassValue: weightClassClinchRating,
        description: 'Clinch control, striking accuracy, and volume compared to weight class average',
        rawValue: clinchRatingValue,
        rawWeightClassValue: weightClassClinchRating
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

  // Prepare radar chart data for clinch analysis
  const prepareClinchRadarData = () => {
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
        subject: 'Clinch Control',
        value: clinchControlPercentage,
        weightClassValue: 50, // Fixed at 50% as baseline
        description: 'Percentage of time spent controlling the clinch position versus being controlled',
        rawValue: clinchControlPercentage,
        rawWeightClassValue: 50
      },
      {
        subject: 'Clinch Accuracy',
        value: normalizeValue(clinchStrikingAccuracy, weightClassClinchStrikingAccuracy),
        weightClassValue: 50, // Weight class average at 50 (100% of average)
        description: 'Accuracy of strikes thrown while in clinch position compared to weight class average',
        rawValue: clinchStrikingAccuracy,
        rawWeightClassValue: weightClassClinchStrikingAccuracy
      },
      {
        subject: 'Clinch Volume',
        value: normalizeValue(clinchStrikesPerRound, weightClassClinchStrikesPerRound),
        weightClassValue: 50, // Weight class average at 50 (100% of average)
        description: 'Average number of clinch strikes landed per round compared to weight class average',
        rawValue: clinchStrikesPerRound,
        rawWeightClassValue: weightClassClinchStrikesPerRound
      }
    ];
  };

  // Enhanced Rating Card Stylesheet (matching BasicInfo)
  const ratingCardStyles = {
    // Collapsible section styles
    collapsibleSection: {
      mb: 4,
      borderRadius: '12px',
      bgcolor: colors.backgroundSecondary,
      border: `1px solid ${colors.borderSecondary}`,
      position: 'relative' as const,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: colors.background,
        border: `1px solid ${colors.borderPrimary}`,
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryDark})`,
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
        bgcolor: colors.overlayPrimary,
      }
    },

    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
    },

    expandIcon: {
      color: colors.primary,
      transition: 'transform 0.3s ease',
      '&.expanded': {
        transform: 'rotate(180deg)',
      }
    },

    // Main card container
    card: {
      p: 3,
      borderRadius: '12px',
      bgcolor: colors.backgroundSecondary,
      border: `1px solid ${colors.borderSecondary}`,
      height: '100%',
      position: 'relative' as const,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: colors.background,
        transform: 'translateY(-2px)',
        border: `1px solid ${colors.borderPrimary}`,
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
        background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryDark})`,
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
      background: `linear-gradient(135deg, ${colors.background}, ${colors.backgroundSecondary})`,
      border: `1px solid ${colors.borderSecondary}`,
      transition: 'transform 0.3s ease',
    },

    // Title styling
    title: {
      color: colors.textPrimary,
      fontWeight: 600,
      fontSize: '1.1rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },

    // Overall rating specific styles
    overallCard: {
      background: `linear-gradient(145deg, ${colors.backgroundSecondary} 0%, ${colors.background} 100%)`,
      border: `2px solid ${colors.borderPrimary}`,
      boxShadow: `0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px ${colors.borderSecondary}, 0 0 60px ${colors.shadowPrimary}`,
      '&:hover': {
        border: `2px solid ${colors.borderTertiary}`,
        boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px ${colors.borderPrimary}, 0 0 80px ${colors.shadowSecondary}`,
      }
    },

    overallValue: {
      fontSize: { xs: '3.5rem', sm: '4rem' },
      fontWeight: 900,
      background: `linear-gradient(135deg, ${colors.textPrimary} 0%, ${colors.primary} 30%, ${colors.primaryLight} 70%, ${colors.primaryDark} 100%)`,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: `0 0 40px ${colors.textPrimary}99`,
      fontFamily: '"Orbitron", "Roboto", sans-serif',
      letterSpacing: '0.15em',
      mb: 1,
    },

    overallLabel: {
      color: colors.textPrimary,
      fontSize: '1rem',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.2em',
      textAlign: 'center' as const,
      textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
    },

    // Description
    description: {
      color: colors.textMuted,
      fontSize: '0.9rem',
      mb: 2,
      fontStyle: 'italic',
    },
  };

  // Prepare bubble chart data for takedown analysis
  const prepareTakedownBubbleData = React.useMemo(() => {
    // Get takedown data from the fighter
    const takedownStats = fighter.takedown_stats || {};
    
    // Define takedown categories with their data
    const takedownCategories = [
      {
        name: 'Single Leg',
        attempts: takedownStats.SingleLegTakedownAttempts || 0,
        success: takedownStats.SingleLegTakedownSuccess || 0,
      },
      {
        name: 'Double Leg',
        attempts: takedownStats.DoubleLegTakedownAttempts || 0,
        success: takedownStats.DoubleLegTakedownSuccess || 0,
      },
      {
        name: 'Body Lock',
        attempts: takedownStats.BodyLockTakedownAttempts || 0,
        success: takedownStats.BodyLockTakedownSuccess || 0,
      },
      {
        name: 'Trip',
        attempts: takedownStats.TripTakedownAttempts || 0,
        success: takedownStats.TripTakedownSuccess || 0,
      },
      {
        name: 'Ankle Pick',
        attempts: takedownStats.AttemptedAnklePickTD || 0,
        success: takedownStats.SuccessfulAnklePickTD || 0,
      },
      {
        name: 'Imanari',
        attempts: takedownStats.AttemptedImanariTD || 0,
        success: takedownStats.SuccessfulImanariTD || 0,
      },
      {
        name: 'Throw',
        attempts: takedownStats.AttemptedThrowTD || 0,
        success: takedownStats.SuccessfulThrowTD || 0,
      }
    ];

    // Calculate total takedown attempts across all categories
    const totalTakedownAttempts = takedownCategories.reduce((sum, category) => {
      return sum + category.attempts;
    }, 0);

    // Transform data for bubble chart
    return takedownCategories
      .filter(category => category.attempts > 0)
      .map(category => {
        const successRate = category.attempts > 0 ? (category.success / category.attempts) * 100 : 0;
        const usagePercent = totalTakedownAttempts > 0 ? (category.attempts / totalTakedownAttempts) * 100 : 0;
        
        return {
          takedownType: category.name,
          successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
          usagePercent: Math.round(usagePercent * 10) / 10, // Round to 1 decimal
          attempts: category.attempts,
          success: category.success
        };
      })
      .sort((a, b) => b.usagePercent - a.usagePercent); // Sort by usage percentage descending
  }, [fighter]);

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
        border: `1px solid ${colors.borderSecondary}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '3px',
          background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryDark})`,
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
              color: colors.textPrimary,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textShadow: `0 0 20px ${colors.primary}4D`,
            }}
          >
            Grappling Analysis
          </Typography>
        </Box>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: colors.textTertiary,
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
              background: `linear-gradient(180deg, ${colors.primary}, transparent)`,
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
                      background: colors.primary,
                      boxShadow: `0 0 12px ${colors.primary}80`,
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
                      border: `2px solid ${colors.primary}`,
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
                  color: colors.textSecondary,
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  mb: 4,
                  textAlign: 'center',
                }}>
                  Comprehensive grappling analysis comparing takedowns, submissions, and ground game effectiveness against weight class averages
                </Typography>
                
                {/* Overall Grappling Grade Display */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 4,
                  p: 3,
                  borderRadius: '12px',
                  background: `linear-gradient(145deg, ${colors.backgroundSecondary} 0%, ${colors.background} 100%)`,
                  border: `2px solid ${colors.borderPrimary}`,
                  boxShadow: `0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px ${colors.borderSecondary}, 0 0 60px ${colors.shadowPrimary}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryDark})`,
                    opacity: 0.5,
                  }
                }}>
                  <Typography sx={{
                    color: colors.textPrimary,
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    mb: 2,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
                  }}>
                    Overall Grappling Grade
                  </Typography>
                  
                  {/* Rating Circle */}
                  <Box sx={{ 
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${colors.backgroundSecondary} 0%, ${colors.background} 100%)`,
                    border: `2px solid ${colors.borderSecondary}`,
                    boxShadow: `inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px ${colors.shadowPrimary}`,
                    mb: 2,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: `conic-gradient(from 0deg, ${colors.primary} 0deg, ${colors.primary} ` + (overallGrapplingGrade * 3.6) + `deg, ${colors.primary}1A ` + (overallGrapplingGrade * 3.6) + `deg, ${colors.primary}1A 360deg)`,
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
                      background: colors.backgroundTertiary,
                      border: `1px solid ${colors.borderSecondary}`,
                      zIndex: 2,
                    }
                  }}>
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
                          color: colors.primary,
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          letterSpacing: '0.1em',
                          lineHeight: 1,
                          textShadow: `0 0 15px ${colors.primary}80`,
                        }}
                      >
                        {overallGrapplingGrade.toFixed(0)}
                      </Typography>
                      <Typography
                        sx={{
                          color: colors.textTertiary,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.15em',
                          marginTop: '-2px',
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        }}
                      >
                        Grade
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography sx={{
                    color: colors.textTertiary,
                    fontSize: '1rem',
                    fontWeight: 500,
                    fontFamily: '"Orbitron", "Roboto Mono", monospace',
                  }}>
                    vs 50 avg
                  </Typography>
                  
                  <Typography sx={{
                    color: colors.textMuted,
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    mt: 1,
                    maxWidth: '500px',
                    mx: 'auto',
                  }}>
                    Combined rating emphasizing takedowns (35%) and ground game (30%) as main components, with clinch (20%) and submissions (15%) weighted less compared to weight class average
                  </Typography>
                </Box>
                
                {/* Radar Chart */}
                <Box sx={{ width: '100%', height: 400, position: 'relative' }}>
                  <ResponsiveContainer>
                    <RadarChart data={prepareOverallGrapplingRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid 
                        stroke={`${colors.primary}1A`}
                        gridType="circle"
                      />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ 
                          fill: colors.textPrimary,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        stroke={`${colors.primary}33`}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]}
                        tick={{ 
                          fill: colors.textMuted,
                          fontSize: 10 
                        }}
                        stroke={`${colors.primary}1A`}
                      />
                      {/* Weight Class Average Radar */}
                      <Radar
                        name="Weight Class Average"
                        dataKey="weightClassValue"
                        stroke={colors.error}
                        fill={colors.error}
                        fillOpacity={0.15}
                      />
                      {/* Fighter Stats Radar */}
                      <Radar
                        name="Fighter Stats"
                        dataKey="value"
                        stroke={colors.primary}
                        fill={colors.primary}
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
                      bgcolor: colors.backgroundTertiary,
                      p: 1,
                      borderRadius: '6px',
                      border: `1px solid ${colors.borderSecondary}`,
                      backdropFilter: 'blur(5px)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        bgcolor: colors.primary,
                        borderRadius: '50%',
                        boxShadow: `0 0 10px ${colors.primary}80`,
                      }} />
                      <Typography sx={{ color: colors.textPrimary, fontSize: '0.8rem' }}>{fighter.fighterName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: colors.error, borderRadius: '50%', opacity: 0.8 }} />
                      <Typography sx={{ color: colors.textPrimary, fontSize: '0.8rem' }}>Weight Class Avg</Typography>
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
                      background: colors.primary,
                      boxShadow: `0 0 12px ${colors.primary}80`,
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
                      border: `2px solid ${colors.primary}`,
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
                        background: `linear-gradient(135deg, ${colors.backgroundSecondary} 0%, ${colors.background} 100%)`,
                        border: `2px solid ${colors.borderSecondary}`,
                        boxShadow: `inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px ${colors.shadowPrimary}`,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          background: `conic-gradient(from 0deg, ${colors.primary} 0deg, ${colors.primary} ` + (takedownRating * 3.6) + `deg, ${colors.primary}1A ` + (takedownRating * 3.6) + `deg, ${colors.primary}1A 360deg)`,
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
                          background: colors.backgroundTertiary,
                          border: `1px solid ${colors.borderSecondary}`,
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
                              color: colors.primary,
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: `0 0 15px ${colors.primary}80`,
                            }}
                          >
                            {takedownRating.toFixed(0)}
                          </Typography>
                          <Typography
                            sx={{
                              color: colors.textTertiary,
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
                        background: `radial-gradient(circle, ${colors.primary}1A 0%, transparent 70%)`,
                        zIndex: 0,
                      }} />
                    </Box>
                  </Grid>

                  {/* Rating Description and Top Takedowns */}
                  <Grid item xs={12} md={8}>
                    <Typography sx={{
                      color: colors.textSecondary,
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      mb: 3,
                    }}>
                      Comprehensive grappling rating based on takedown success rate and volume compared to weight class averages. Shows your most effective takedown techniques and areas of vulnerability.
                    </Typography>
                    
                    {/* Top 3 Takedown Attempts */}
                    {topTakedowns.length > 0 ? (
                      <Box sx={{
                        p: 2,
                        borderRadius: '8px',
                        background: `linear-gradient(135deg, ${colors.primary}14 0%, ${colors.primaryDark}0A 100%)`,
                        border: `1px solid ${colors.borderSecondary}`,
                        backdropFilter: 'blur(5px)',
                        mb: 3,
                      }}>
                        <Typography sx={{ 
                          color: colors.textPrimary, 
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

                    {/* Top 3 Takedown Vulnerabilities */}
                    {topTakedownVulnerabilities.length > 0 ? (
                      <Box sx={{
                        p: 2,
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.08) 0%, rgba(255, 64, 64, 0.04) 100%)',
                        border: '1px solid rgba(255, 107, 107, 0.15)',
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
                          Top 3 Takedown Vulnerabilities
                        </Typography>
                        <Grid container spacing={1}>
                          {topTakedownVulnerabilities.map((vulnerability, index) => (
                            <Grid item xs={12} key={vulnerability.name}>
                              <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1,
                                borderRadius: '4px',
                                background: 'rgba(255, 107, 107, 0.05)',
                                border: '1px solid rgba(255, 107, 107, 0.1)',
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: index === 0 ? '#FF4444' : index === 1 ? '#FF6666' : '#FF8888',
                                    boxShadow: '0 0 8px rgba(255, 68, 68, 0.5)',
                                  }} />
                                  <Typography sx={{
                                    color: '#FFFFFF',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                  }}>
                                    {vulnerability.name}
                                  </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography sx={{
                                    color: '#FF6B6B',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                  }}>
                                    {vulnerability.timesPerRound.toFixed(2)}/round
                                  </Typography>
                                  <Typography sx={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                  }}>
                                    {vulnerability.timesPerMinute.toFixed(3)}/min • {vulnerability.timesTakenDown} total
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
                          No takedown vulnerability data available
                        </Typography>
                      </Box>
                    )}

                    {/* Takedown Bubble Chart */}
                    <Box sx={{ mt: 4 }}>
                      <Typography sx={{
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
                      }}>
                        Takedown Selection Bubble Analysis
                      </Typography>
                      
                      <Box sx={{
                        p: 3,
                        borderRadius: '12px',
                        bgcolor: 'rgba(10, 14, 23, 0.4)',
                        border: '1px solid rgba(0, 240, 255, 0.15)',
                        height: '500px',
                        position: 'relative',
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
                      }}>
                        {prepareTakedownBubbleData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart
                              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                              data={prepareTakedownBubbleData}
                            >
                              <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke="rgba(0, 240, 255, 0.1)"
                              />
                              <XAxis 
                                type="category" 
                                dataKey="takedownType" 
                                name="Takedown Type"
                                tick={{ fill: '#FFFFFF', fontSize: 12 }}
                                axisLine={{ stroke: 'rgba(0, 240, 255, 0.3)' }}
                                tickLine={{ stroke: 'rgba(0, 240, 255, 0.3)' }}
                              />
                              <YAxis 
                                type="number" 
                                dataKey="successRate" 
                                name="Success Rate"
                                domain={[0, 100]}
                                tick={{ fill: '#FFFFFF', fontSize: 12 }}
                                axisLine={{ stroke: 'rgba(0, 240, 255, 0.3)' }}
                                tickLine={{ stroke: 'rgba(0, 240, 255, 0.3)' }}
                                label={{ 
                                  value: 'Success Rate (%)', 
                                  angle: -90, 
                                  position: 'insideLeft',
                                  style: { textAnchor: 'middle', fill: '#FFFFFF', fontSize: 12 }
                                }}
                              />
                              <ZAxis 
                                type="number" 
                                dataKey="usagePercent" 
                                range={[80, 600]}
                                name="Usage Percentage"
                              />
                              <RechartsTooltip
                                content={({ active, payload }) => {
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
                                          maxWidth: 280,
                                          boxShadow: '0 4px 12px rgba(0, 240, 255, 0.1)',
                                        }}
                                      >
                                        <Typography sx={{ color: '#00F0FF', fontWeight: 600, mb: 1 }}>
                                          {data.takedownType}
                                        </Typography>
                                        <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                                          Success Rate: {data.successRate}%
                                        </Typography>
                                        <Typography sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                                          Usage: {data.usagePercent}%
                                        </Typography>
                                      </Box>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Scatter 
                                dataKey="usagePercent" 
                                fill="rgba(0, 240, 255, 0.8)"
                                stroke="rgba(0, 240, 255, 1)"
                                strokeWidth={2}
                              />
                            </ScatterChart>
                          </ResponsiveContainer>
                        ) : (
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            textAlign: 'center',
                          }}>
                            <Typography sx={{
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '0.9rem',
                              fontStyle: 'italic',
                            }}>
                              No takedown data available
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
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
                
                {/* Submission Rating Display */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 4,
                  p: 3,
                  borderRadius: '12px',
                  background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
                  border: '2px solid rgba(0, 150, 255, 0.3)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 150, 255, 0.15), 0 0 60px rgba(0, 150, 255, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
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
                    color: '#FFFFFF',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    mb: 2,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
                  }}>
                    Submission Rating
                  </Typography>
                  
                  {/* Rating Circle */}
                  <Box sx={{ 
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                    border: '2px solid rgba(0, 240, 255, 0.2)',
                    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 240, 255, 0.1)',
                    mb: 2,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: 'conic-gradient(from 0deg, #00F0FF 0deg, #00F0FF ' + (submissionRating * 3.6) + 'deg, rgba(0, 240, 255, 0.1) ' + (submissionRating * 3.6) + 'deg, rgba(0, 240, 255, 0.1) 360deg)',
                      zIndex: 1,
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'rgba(10, 14, 23, 0.95)',
                      border: '1px solid rgba(0, 240, 255, 0.15)',
                      zIndex: 2,
                    }
                  }}>
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
                          fontSize: '1.8rem',
                          fontWeight: 800,
                          color: '#00F0FF',
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          letterSpacing: '0.1em',
                          lineHeight: 1,
                          textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                        }}
                      >
                        {submissionRating.toFixed(0)}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.65rem',
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
                  
                  <Typography sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    fontFamily: '"Orbitron", "Roboto Mono", monospace',
                  }}>
                    vs 50 avg
                  </Typography>
                  
                  <Typography sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.85rem',
                    fontStyle: 'italic',
                    mt: 1,
                    maxWidth: '400px',
                    mx: 'auto',
                  }}>
                    Based on submission attempt rate and success rate compared to weight class average
                  </Typography>
                </Box>
                
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

        {/* Clinch Analysis */}
        <Grid item xs={12}>
          <Box sx={ratingCardStyles.collapsibleSection}>
            {/* Collapsible Header */}
            <Box 
              sx={ratingCardStyles.sectionHeader}
              onClick={() => toggleSection('clinch')}
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
                  Clinch Analysis
                </Typography>
              </Box>
              <IconButton
                sx={ratingCardStyles.expandIcon}
                className={collapsedSections.clinch ? '' : 'expanded'}
              >
                {collapsedSections.clinch ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={!collapsedSections.clinch}>
              <Box sx={{ p: 4 }}>
                
                {/* Clinch Rating Display */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 4,
                  p: 3,
                  borderRadius: '12px',
                  background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
                  border: '2px solid rgba(0, 150, 255, 0.3)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 150, 255, 0.15), 0 0 60px rgba(0, 150, 255, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
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
                    color: '#FFFFFF',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    mb: 2,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
                  }}>
                    Clinch Rating
                  </Typography>
                  
                  {/* Rating Circle */}
                  <Box sx={{ 
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                    border: '2px solid rgba(0, 240, 255, 0.2)',
                    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 240, 255, 0.1)',
                    mb: 2,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: 'conic-gradient(from 0deg, #00F0FF 0deg, #00F0FF ' + (clinchRating * 3.6) + 'deg, rgba(0, 240, 255, 0.1) ' + (clinchRating * 3.6) + 'deg, rgba(0, 240, 255, 0.1) 360deg)',
                      zIndex: 1,
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'rgba(10, 14, 23, 0.95)',
                      border: '1px solid rgba(0, 240, 255, 0.15)',
                      zIndex: 2,
                    }
                  }}>
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
                          fontSize: '1.8rem',
                          fontWeight: 800,
                          color: '#00F0FF',
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          letterSpacing: '0.1em',
                          lineHeight: 1,
                          textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                        }}
                      >
                        {clinchRating.toFixed(0)}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.65rem',
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
                  
                  <Typography sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    fontFamily: '"Orbitron", "Roboto Mono", monospace',
                  }}>
                    vs 50 avg
                  </Typography>
                  
                  <Typography sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.85rem',
                    fontStyle: 'italic',
                    mt: 1,
                    maxWidth: '400px',
                    mx: 'auto',
                  }}>
                    Based on clinch control, striking accuracy, and volume compared to weight class average
                  </Typography>
                </Box>
                
                <Grid container spacing={4} justifyContent="center">
                  <Grid item xs={12} sm={6} md={4}>
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
                          '& .clinch-icon': {
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
                          className="clinch-icon"
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
                          Clinch Control
                        </Typography>
                      </Box>
                      
                      {/* Description */}
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.85rem',
                        mb: 2,
                        fontStyle: 'italic',
                      }}>
                        Percentage of time spent controlling the clinch position versus being controlled
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
                          {clinchControlPercentage.toFixed(0)}%
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        }}>
                          control rate
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
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
                          '& .clinch-icon': {
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
                          className="clinch-icon"
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
                          Clinch Striking Accuracy
                        </Typography>
                      </Box>
                      
                      {/* Description */}
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.85rem',
                        mb: 2,
                        fontStyle: 'italic',
                      }}>
                        Accuracy of strikes thrown while in clinch position compared to weight class average
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
                          {clinchStrikingAccuracy.toFixed(0)}%
                        </Typography>
                        {weightClassAvgData && (
                          <Typography sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          }}>
                            vs {weightClassClinchStrikingAccuracy.toFixed(0)}% avg
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
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
                          '& .clinch-icon': {
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
                          className="clinch-icon"
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
                          Clinch Strikes/Round
                        </Typography>
                      </Box>
                      
                      {/* Description */}
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.85rem',
                        mb: 2,
                        fontStyle: 'italic',
                      }}>
                        Average number of clinch strikes landed per round compared to weight class
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
                          {clinchStrikesPerRound.toFixed(1)}
                        </Typography>
                        {weightClassAvgData && (
                          <Typography sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          }}>
                            vs {weightClassClinchStrikesPerRound.toFixed(1)} avg
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
                    Clinch Radar Analysis
                  </Typography>
                  
                  <Box sx={{ width: '100%', height: 400, position: 'relative' }}>
                    <ResponsiveContainer>
                      <RadarChart data={prepareClinchRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
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
                          stroke="#8B5CF6"
                          fill="#8B5CF6"
                          fillOpacity={0.3}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                    
                    {/* Legend */}
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 10,
                        right: 10,
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
                          bgcolor: '#8B5CF6',
                          borderRadius: '50%',
                          boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
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
                
                {/* Ground Game Rating Display */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 4,
                  p: 3,
                  borderRadius: '12px',
                  background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
                  border: '2px solid rgba(0, 150, 255, 0.3)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 150, 255, 0.15), 0 0 60px rgba(0, 150, 255, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
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
                    color: '#FFFFFF',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    mb: 2,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
                  }}>
                    Ground Game Rating
                  </Typography>
                  
                  {/* Rating Circle */}
                  <Box sx={{ 
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                    border: '2px solid rgba(0, 240, 255, 0.2)',
                    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 240, 255, 0.1)',
                    mb: 2,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: 'conic-gradient(from 0deg, #00F0FF 0deg, #00F0FF ' + (groundGameRating * 3.6) + 'deg, rgba(0, 240, 255, 0.1) ' + (groundGameRating * 3.6) + 'deg, rgba(0, 240, 255, 0.1) 360deg)',
                      zIndex: 1,
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'rgba(10, 14, 23, 0.95)',
                      border: '1px solid rgba(0, 240, 255, 0.15)',
                      zIndex: 2,
                    }
                  }}>
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
                          fontSize: '1.8rem',
                          fontWeight: 800,
                          color: '#00F0FF',
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          letterSpacing: '0.1em',
                          lineHeight: 1,
                          textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                        }}
                      >
                        {groundGameRating.toFixed(0)}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.65rem',
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
                  
                  <Typography sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    fontFamily: '"Orbitron", "Roboto Mono", monospace',
                  }}>
                    vs 50 avg
                  </Typography>
                  
                  <Typography sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.85rem',
                    fontStyle: 'italic',
                    mt: 1,
                    maxWidth: '400px',
                    mx: 'auto',
                  }}>
                    Based on ground control, striking accuracy, and volume compared to weight class average
                  </Typography>
                </Box>
                
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
                          stroke="#8B5CF6"
                          fill="#8B5CF6"
                          fillOpacity={0.3}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                    
                    {/* Legend */}
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 10,
                        right: 10,
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
                          bgcolor: '#8B5CF6',
                          borderRadius: '50%',
                          boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
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