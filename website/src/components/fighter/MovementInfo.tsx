import React from 'react';
import { Paper, Typography, Grid, Box, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Fighter } from '../../types/firestore';

interface MovementInfoProps {
  fighter: Fighter;
  weightClassAvgData?: any;
}

const MovementInfo: React.FC<MovementInfoProps> = ({ fighter, weightClassAvgData }): JSX.Element => {
  // State for managing collapsed sections
  const [collapsedSections, setCollapsedSections] = React.useState({
    overallMovement: false,
    cagePosition: false,
    clinchPosition: false,
    groundPosition: false,
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate Center Octagon Control Percentage
  const centerOctagonControlPercentage = React.useMemo(() => {
    const centerOctagon = fighter.CenterOctagon || 0;
    const pushedBackToCage = fighter.PushedBackToCage || 0;
    const pushingAgainstCage = fighter.PushingAgainstCage || 0;
    const totalCageTime = centerOctagon + pushedBackToCage + pushingAgainstCage;
    
    if (totalCageTime === 0) return 0;
    return (centerOctagon / totalCageTime) * 100;
  }, [fighter.CenterOctagon, fighter.PushedBackToCage, fighter.PushingAgainstCage]);



  // Calculate Cage Pushing Percentage
  const cagePushingPercentage = React.useMemo(() => {
    const centerOctagon = fighter.CenterOctagon || 0;
    const pushedBackToCage = fighter.PushedBackToCage || 0;
    const pushingAgainstCage = fighter.PushingAgainstCage || 0;
    const totalCageTime = centerOctagon + pushedBackToCage + pushingAgainstCage;
    
    if (totalCageTime === 0) return 0;
    return (pushingAgainstCage / totalCageTime) * 100;
  }, [fighter.CenterOctagon, fighter.PushedBackToCage, fighter.PushingAgainstCage]);



  // Calculate Pushed Back Percentage
  const pushedBackPercentage = React.useMemo(() => {
    const centerOctagon = fighter.CenterOctagon || 0;
    const pushedBackToCage = fighter.PushedBackToCage || 0;
    const pushingAgainstCage = fighter.PushingAgainstCage || 0;
    const totalCageTime = centerOctagon + pushedBackToCage + pushingAgainstCage;
    
    if (totalCageTime === 0) return 0;
    return (pushedBackToCage / totalCageTime) * 100;
  }, [fighter.CenterOctagon, fighter.PushedBackToCage, fighter.PushingAgainstCage]);



  // Calculate clinch control percentage
  const clinchControlPercentage = React.useMemo(() => {
    const inClinch = fighter.clinch_stats?.InClinch || 0;
    const beingClinched = fighter.clinch_stats?.BeingClinched || 0;
    const totalClinchTime = inClinch + beingClinched;
    
    if (totalClinchTime === 0) return 0;
    return (inClinch / totalClinchTime) * 100;
  }, [fighter.clinch_stats?.InClinch, fighter.clinch_stats?.BeingClinched]);



  // Calculate ground control percentage
  const groundControlPercentage = React.useMemo(() => {
    const onTopGround = fighter.ground_stats?.OnTopGround || 0;
    const onBottomGround = fighter.ground_stats?.OnBottomGround || 0;
    const totalGroundTime = onTopGround + onBottomGround;
    
    if (totalGroundTime === 0) return 0;
    return (onTopGround / totalGroundTime) * 100;
  }, [fighter.ground_stats?.OnTopGround, fighter.ground_stats?.OnBottomGround]);

  // Calculate weight class ground control percentage
  const weightClassGroundControlPercentage = React.useMemo(() => {
    if (!weightClassAvgData) return 0;
    
    const weightClassOnTopGround = weightClassAvgData.OnTopGround || 0;
    const weightClassOnBottomGround = weightClassAvgData.OnBottomGround || 0;
    const weightClassTotalGroundTime = weightClassOnTopGround + weightClassOnBottomGround;
    
    if (weightClassTotalGroundTime === 0) return 0;
    return (weightClassOnTopGround / weightClassTotalGroundTime) * 100;
  }, [weightClassAvgData]);

  // Calculate ground volume (strikes per minute on ground)
  const groundVolume = React.useMemo(() => {
    const totalGroundStrikesThrown = fighter.ground_stats?.TotalGroundStrikesThrown || 0;
    const minutesTracked = fighter.MinutesTracked || 1; // Avoid division by zero
    
    return totalGroundStrikesThrown / minutesTracked;
  }, [fighter.ground_stats?.TotalGroundStrikesThrown, fighter.MinutesTracked]);

  // Calculate weight class ground volume
  const weightClassGroundVolume = React.useMemo(() => {
    if (!weightClassAvgData) return 0;
    
    const weightClassTotalGroundStrikesThrown = weightClassAvgData.TotalGroundStrikesThrown || 0;
    const weightClassMinutesTracked = weightClassAvgData.minutes || 1; // Avoid division by zero
    
    return weightClassTotalGroundStrikesThrown / weightClassMinutesTracked;
  }, [weightClassAvgData]);

  // Calculate ground efficiency (accuracy percentage)
  const groundEfficiency = React.useMemo(() => {
    const totalGroundStrikesMade = fighter.ground_stats?.TotalGroundStrikesMade || 0;
    const totalGroundStrikesThrown = fighter.ground_stats?.TotalGroundStrikesThrown || 0;
    
    if (totalGroundStrikesThrown === 0) return 0;
    return (totalGroundStrikesMade / totalGroundStrikesThrown) * 100;
  }, [fighter.ground_stats?.TotalGroundStrikesMade, fighter.ground_stats?.TotalGroundStrikesThrown]);

  // Calculate weight class ground efficiency
  const weightClassGroundEfficiency = React.useMemo(() => {
    if (!weightClassAvgData) return 0;
    
    const weightClassTotalGroundStrikesMade = weightClassAvgData.TotalGroundStrikesMade || 0;
    const weightClassTotalGroundStrikesThrown = weightClassAvgData.TotalGroundStrikesThrown || 0;
    
    if (weightClassTotalGroundStrikesThrown === 0) return 0;
    return (weightClassTotalGroundStrikesMade / weightClassTotalGroundStrikesThrown) * 100;
  }, [weightClassAvgData]);

  // Calculate submission volume (submission attempts per minute)
  const submissionVolume = React.useMemo(() => {
    const subAttempts = fighter.submission_stats?.SubAttempts || 0;
    const minutesTracked = fighter.MinutesTracked || 1; // Avoid division by zero
    
    return subAttempts / minutesTracked;
  }, [fighter.submission_stats?.SubAttempts, fighter.MinutesTracked]);

  // Calculate weight class submission volume
  const weightClassSubmissionVolume = React.useMemo(() => {
    if (!weightClassAvgData) return 0;
    
    const weightClassSubAttempts = weightClassAvgData.subattempt || 0;
    const weightClassMinutesTracked = weightClassAvgData.minutes || 1; // Avoid division by zero
    
    return weightClassSubAttempts / weightClassMinutesTracked;
  }, [weightClassAvgData]);

  // Calculate clinch volume (strikes per minute in clinch)
  const clinchVolume = React.useMemo(() => {
    const totalClinchStrikesThrown = fighter.clinch_stats?.TotalClinchStrikesThrown || 0;
    const minutesTracked = fighter.MinutesTracked || 1; // Avoid division by zero
    
    return totalClinchStrikesThrown / minutesTracked;
  }, [fighter.clinch_stats?.TotalClinchStrikesThrown, fighter.MinutesTracked]);

  // Calculate weight class clinch volume
  const weightClassClinchVolume = React.useMemo(() => {
    if (!weightClassAvgData) return 0;
    
    const weightClassTotalClinchStrikesThrown = weightClassAvgData.TotalClinchStrikesThrown || 0;
    const weightClassMinutesTracked = weightClassAvgData.minutes || 1; // Avoid division by zero
    
    return weightClassTotalClinchStrikesThrown / weightClassMinutesTracked;
  }, [weightClassAvgData]);

  // Calculate clinch efficiency (accuracy percentage)
  const clinchEfficiency = React.useMemo(() => {
    const totalClinchStrikesMade = fighter.clinch_stats?.TotalClinchStrikesMade || 0;
    const totalClinchStrikesThrown = fighter.clinch_stats?.TotalClinchStrikesThrown || 0;
    
    if (totalClinchStrikesThrown === 0) return 0;
    return (totalClinchStrikesMade / totalClinchStrikesThrown) * 100;
  }, [fighter.clinch_stats?.TotalClinchStrikesMade, fighter.clinch_stats?.TotalClinchStrikesThrown]);

  // Calculate weight class clinch efficiency
  const weightClassClinchEfficiency = React.useMemo(() => {
    if (!weightClassAvgData) return 0;
    
    const weightClassTotalClinchStrikesMade = weightClassAvgData.TotalClinchStrikesMade || 0;
    const weightClassTotalClinchStrikesThrown = weightClassAvgData.TotalClinchStrikesThrown || 0;
    
    if (weightClassTotalClinchStrikesThrown === 0) return 0;
    return (weightClassTotalClinchStrikesMade / weightClassTotalClinchStrikesThrown) * 100;
  }, [weightClassAvgData]);



  // Calculate cage position rating from 1-99
  const cagePositionRating = React.useMemo(() => {
    // UFC average values: 50% center, 33% walking opponent down, 17% being walked back
    const UFC_CENTER_AVG = 50;
    const UFC_PUSHING_AVG = 33;
    const UFC_PUSHED_BACK_AVG = 17;
    
    // Helper function to calculate rating based on UFC averages and position value
    const calculateRating = (fighterValue: number, ufcAverage: number, isPositive: boolean) => {
      // Handle zero values
      if (fighterValue === 0) {
        return isPositive ? 1 : 99; // Zero is bad for positive metrics, good for negative metrics
      }
      
      // Calculate percentage relative to UFC average
      const percentage = (fighterValue / ufcAverage) * 100;
      
      if (isPositive) {
        // For positive metrics (center control, moving forward)
        // 0% = 1 rating, 100% of UFC avg = 50 rating, 200%+ = 99 rating
        let rating = 1 + (percentage * 0.49); // Scale 0-200% to 1-99
        return Math.min(99, Math.max(1, rating));
      } else {
        // For negative metrics (walking backwards)
        // 0% = 99 rating (excellent), 100% of UFC avg = 50 rating, 200%+ = 1 rating
        let rating = 99 - (percentage * 0.49); // Scale 0-200% to 99-1
        return Math.min(99, Math.max(1, rating));
      }
    };

    // Calculate individual component ratings
    const centerRating = calculateRating(centerOctagonControlPercentage, UFC_CENTER_AVG, true); // Center is slightly positive
    const pushingRating = calculateRating(cagePushingPercentage, UFC_PUSHING_AVG, true); // Moving forward is good
    const pushedBackRating = calculateRating(pushedBackPercentage, UFC_PUSHED_BACK_AVG, false); // Walking backwards is bad
    
    // Combine ratings with weights
    // Moving forward is most important (45%), avoiding being pushed back is very important (35%), center control is good (20%)
    const overallRating = (pushingRating * 0.45) + (pushedBackRating * 0.35) + (centerRating * 0.20);
    
    return overallRating;
  }, [cagePushingPercentage, centerOctagonControlPercentage, pushedBackPercentage]);

  // Calculate clinch volume rating (1-99)
  const clinchVolumeRating = React.useMemo(() => {
    if (weightClassClinchVolume === 0) {
      const maxValue = Math.max(clinchVolume, 1);
      return Math.min(99, Math.max(1, (clinchVolume / maxValue) * 99));
    }
    
    const percentage = (clinchVolume / weightClassClinchVolume) * 100;
    let rating = 50 + (percentage - 100) * 0.5;
    return Math.min(99, Math.max(1, rating));
  }, [clinchVolume, weightClassClinchVolume]);

  // Calculate ground volume rating (1-99)
  const groundVolumeRating = React.useMemo(() => {
    if (weightClassGroundVolume === 0) {
      const maxValue = Math.max(groundVolume, 1);
      return Math.min(99, Math.max(1, (groundVolume / maxValue) * 99));
    }
    
    const percentage = (groundVolume / weightClassGroundVolume) * 100;
    let rating = 50 + (percentage - 100) * 0.5;
    return Math.min(99, Math.max(1, rating));
  }, [groundVolume, weightClassGroundVolume]);

  // Calculate submission volume rating (1-99)
  const submissionVolumeRating = React.useMemo(() => {
    if (weightClassSubmissionVolume === 0) {
      const maxValue = Math.max(submissionVolume, 1);
      return Math.min(99, Math.max(1, (submissionVolume / maxValue) * 99));
    }
    
    const percentage = (submissionVolume / weightClassSubmissionVolume) * 100;
    let rating = 50 + (percentage - 100) * 0.5;
    return Math.min(99, Math.max(1, rating));
  }, [submissionVolume, weightClassSubmissionVolume]);

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

  // Calculate Center Control rating (1-99)
  const centerControlRating = React.useMemo(() => {
    // UFC average values: 50% center
    const UFC_CENTER_AVG = 50;
    
    // Helper function to calculate rating based on UFC average
    const calculateRating = (fighterValue: number, ufcAverage: number) => {
      if (fighterValue === 0) return 1;
      
      const percentage = (fighterValue / ufcAverage) * 100;
      let rating = 1 + (percentage * 0.49); // Scale 0-200% to 1-99
      return Math.min(99, Math.max(1, rating));
    };

    return calculateRating(centerOctagonControlPercentage, UFC_CENTER_AVG);
  }, [centerOctagonControlPercentage]);

  // Calculate Moving Forward rating (1-99)
  const movingForwardRating = React.useMemo(() => {
    // UFC average values: 33% pushing
    const UFC_PUSHING_AVG = 33;
    
    const calculateRating = (fighterValue: number, ufcAverage: number) => {
      if (fighterValue === 0) return 1;
      
      const percentage = (fighterValue / ufcAverage) * 100;
      let rating = 1 + (percentage * 0.49); // Scale 0-200% to 1-99
      return Math.min(99, Math.max(1, rating));
    };

    return calculateRating(cagePushingPercentage, UFC_PUSHING_AVG);
  }, [cagePushingPercentage]);

  // Calculate Walking Backwards rating (1-99) - inverted logic
  const walkingBackwardsRating = React.useMemo(() => {
    // UFC average values: 17% being pushed back
    const UFC_PUSHED_BACK_AVG = 17;
    
    const calculateRating = (fighterValue: number, ufcAverage: number) => {
      if (fighterValue === 0) return 99; // No time being pushed back is excellent
      
      const percentage = (fighterValue / ufcAverage) * 100;
      let rating = 99 - (percentage * 0.49); // Scale 0-200% to 99-1 (inverted)
      return Math.min(99, Math.max(1, rating));
    };

    return calculateRating(pushedBackPercentage, UFC_PUSHED_BACK_AVG);
  }, [pushedBackPercentage]);

  // Calculate Clinch Control rating (1-99) - combo of clinch control and defensive clinch
  const clinchControlRating = React.useMemo(() => {
    // 50% control = 50 rating (average), 75% control = 75 rating (good), 25% control = 25 rating (poor)
    const controlRating = Math.min(99, Math.max(1, clinchControlPercentage * 1.98));
    
    // Defensive rating (lower defensive percentage is better, so invert the logic)
    const defensivePercentage = 100 - clinchControlPercentage;
    const defensiveRating = Math.min(99, Math.max(1, 99 - (defensivePercentage * 1.98)));
    
    // Combine control and defensive ratings (60% control, 40% defensive)
    return (controlRating * 0.60) + (defensiveRating * 0.40);
  }, [clinchControlPercentage]);

  // Calculate Clinch Offense rating (1-99) - combo of accuracy and volume
  const clinchOffenseRating = React.useMemo(() => {
    // Volume rating is already calculated as 1-99 based on weight class average
    const volumeRating = clinchVolumeRating;
    
    // Efficiency rating compared to weight class average
    const efficiencyRating = normalizeValue(clinchEfficiency, weightClassClinchEfficiency);
    
    // Combine volume and efficiency (50% each)
    return (volumeRating * 0.50) + (efficiencyRating * 0.50);
  }, [clinchVolumeRating, clinchEfficiency, weightClassClinchEfficiency]);

  // Calculate Ground Control rating (1-99) - combo of top and bottom position
  const groundControlRating = React.useMemo(() => {
    // Ground control rating (higher is better)
    const controlRating = Math.min(99, Math.max(1, groundControlPercentage * 1.98));
    
    // Bottom position rating (lower bottom percentage is better, so invert the logic)
    const bottomPercentage = 100 - groundControlPercentage;
    const bottomRating = Math.min(99, Math.max(1, 99 - (bottomPercentage * 1.98)));
    
    // Combine control and bottom ratings (60% control, 40% bottom)
    return (controlRating * 0.60) + (bottomRating * 0.40);
  }, [groundControlPercentage]);

  // Calculate Ground Offense rating (1-99) - combo of accuracy, volume, and submissions
  const groundOffenseRating = React.useMemo(() => {
    // Volume rating is already calculated as 1-99 based on weight class average
    const volumeRating = groundVolumeRating;
    
    // Efficiency rating compared to weight class average
    const efficiencyRating = normalizeValue(groundEfficiency, weightClassGroundEfficiency);
    
    // Submission rating compared to weight class average
    const submissionRating = normalizeValue(submissionVolume, weightClassSubmissionVolume);
    
    // Combine volume, efficiency, and submissions (40% volume, 40% efficiency, 20% submissions)
    return (volumeRating * 0.40) + (efficiencyRating * 0.40) + (submissionRating * 0.20);
  }, [groundVolumeRating, groundEfficiency, weightClassGroundEfficiency, submissionVolume, weightClassSubmissionVolume]);

  // Calculate Submissions rating (1-99) based on weight class
  const submissionsRating = React.useMemo(() => {
    if (weightClassSubmissionVolume === 0) {
      const maxValue = Math.max(submissionVolume, 1);
      return Math.min(99, Math.max(1, (submissionVolume / maxValue) * 99));
    }
    
    const percentage = (submissionVolume / weightClassSubmissionVolume) * 100;
    let rating = 50 + (percentage - 100) * 0.5;
    return Math.min(99, Math.max(1, rating));
  }, [submissionVolume, weightClassSubmissionVolume]);

  // Calculate overall movement grade combining all ratings
  const overallMovementGrade = React.useMemo(() => {
    // Calculate cage positioning effectiveness (40% of total)
    const cagePositioningRating = (
      centerControlRating * 0.33 +
      movingForwardRating * 0.33 +
      walkingBackwardsRating * 0.34
    );
    
    // Calculate clinch effectiveness (35% of total)
    const clinchEffectivenessRating = (
      clinchControlRating * 0.60 +
      clinchOffenseRating * 0.40
    );
    
    // Calculate ground effectiveness (35% of total)
    const groundEffectivenessRating = (
      groundControlRating * 0.60 +
      groundOffenseRating * 0.40
    );
    
    // Combine all three areas with the new distribution
    const combinedRating = (
      cagePositioningRating * 0.40 +
      clinchEffectivenessRating * 0.35 +
      groundEffectivenessRating * 0.35
    );
    
    return combinedRating;
  }, [centerControlRating, movingForwardRating, walkingBackwardsRating, clinchControlRating, clinchOffenseRating, groundControlRating, groundOffenseRating]);

  // Custom tooltip component for the radar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Check if this is a rating-based metric (1-99 scale)
      const isRatingMetric = data.subject === 'Clinch Offense' || data.subject === 'Ground Offense';
      
      // Format the display value based on the subject
      const formatDisplayValue = () => {
        if (isRatingMetric) {
          // For rating metrics, show 1-99 ratings without percentage
          return `${data.value.toFixed(0)}`;
        } else {
          // For percentage metrics, show percentages
        return `${data.value.toFixed(1)}%`;
        }
      };
      
      const formatAverageValue = () => {
        if (isRatingMetric) {
          // For rating metrics, show 1-99 ratings without percentage
          return `${data.weightClassValue.toFixed(0)}`;
        } else {
          // For percentage metrics, show percentages
        return `${data.weightClassValue.toFixed(1)}%`;
        }
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
            {fighter.fighterName}: {formatDisplayValue()}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
            {isRatingMetric ? 'Average Rating' : 'UFC Average'}: {formatAverageValue()}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem', mt: 1, fontStyle: 'italic' }}>
            {data.description}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Prepare overall movement radar chart data
  const prepareOverallMovementRadarData = () => {
    // UFC average values for cage position metrics
    const UFC_CENTER_AVG = 50;
    const UFC_PUSHING_AVG = 33;
    const UFC_PUSHED_BACK_AVG = 17;

    return [
      {
        subject: 'Center Control',
        value: centerOctagonControlPercentage,
        weightClassValue: UFC_CENTER_AVG,
        description: 'Center octagon control effectiveness compared to UFC average',
        rawValue: centerOctagonControlPercentage,
        rawWeightClassValue: UFC_CENTER_AVG
      },
      {
        subject: 'Moving Forward',
        value: cagePushingPercentage,
        weightClassValue: UFC_PUSHING_AVG,
        description: 'Forward pressure and cage pushing effectiveness compared to UFC average',
        rawValue: cagePushingPercentage,
        rawWeightClassValue: UFC_PUSHING_AVG
      },
      {
        subject: 'Walking Backwards',
        value: pushedBackPercentage,
        weightClassValue: UFC_PUSHED_BACK_AVG,
        description: 'Defensive positioning - avoiding being pushed back (higher is better)',
        rawValue: pushedBackPercentage,
        rawWeightClassValue: UFC_PUSHED_BACK_AVG
      },
      {
        subject: 'Clinch Control',
        value: clinchControlPercentage,
        weightClassValue: 50,
        description: 'Clinch control effectiveness based on control time and defensive positioning',
        rawValue: clinchControlPercentage,
        rawWeightClassValue: 50
      },
      {
        subject: 'Clinch Offense',
        value: clinchOffenseRating,
        weightClassValue: 50,
        description: 'Clinch striking effectiveness based on volume and accuracy',
        rawValue: clinchOffenseRating,
        rawWeightClassValue: 50
      },
      {
        subject: 'Ground Control',
        value: groundControlPercentage,
        weightClassValue: 50,
        description: 'Ground position control based on top/bottom time distribution',
        rawValue: groundControlPercentage,
        rawWeightClassValue: 50
      },
      {
        subject: 'Ground Offense',
        value: groundOffenseRating,
        weightClassValue: 50,
        description: 'Ground striking effectiveness based on volume, accuracy, and submissions',
        rawValue: groundOffenseRating,
        rawWeightClassValue: 50
      }
    ];
  };

  // Prepare cage position radar chart data
  const prepareCagePositionRadarData = () => {
    // UFC average values: 50% center, 33% walking opponent down, 17% being walked back
    const UFC_CENTER_AVG = 50;
    const UFC_PUSHING_AVG = 33;
    const UFC_PUSHED_BACK_AVG = 17;

    return [
      {
        subject: 'Center Control',
        value: centerOctagonControlPercentage,
        weightClassValue: UFC_CENTER_AVG,
        description: 'Percentage of time spent in center octagon position',
        rawValue: centerOctagonControlPercentage,
        rawWeightClassValue: UFC_CENTER_AVG
      },
      {
        subject: 'Moving Forward',
        value: cagePushingPercentage,
        weightClassValue: UFC_PUSHING_AVG,
        description: 'Percentage of time spent pushing opponent against cage',
        rawValue: cagePushingPercentage,
        rawWeightClassValue: UFC_PUSHING_AVG
      },
      {
        subject: 'Walking Backwards',
        value: pushedBackPercentage,
        weightClassValue: UFC_PUSHED_BACK_AVG,
        description: 'Percentage of time spent being pushed back to cage',
        rawValue: pushedBackPercentage,
        rawWeightClassValue: UFC_PUSHED_BACK_AVG
      }
    ];
  };

  // Prepare clinch position radar chart data
  const prepareClinchPositionRadarData = () => {
    return [
      {
        subject: 'Clinch Control',
        value: clinchControlPercentage,
        weightClassValue: 50,
        description: 'Percentage of time controlling the clinch position',
        rawValue: clinchControlPercentage,
        rawWeightClassValue: 50
      },
      {
        subject: 'Defensive Clinch',
        value: 100 - clinchControlPercentage,
        weightClassValue: 50,
        description: 'Percentage of time being controlled in clinch',
        rawValue: 100 - clinchControlPercentage,
        rawWeightClassValue: 50
      },
      {
        subject: 'Clinch Volume',
        value: clinchVolumeRating,
        weightClassValue: 50,
        description: 'Strikes thrown per minute in clinch compared to weight class average',
        rawValue: clinchVolume,
        rawWeightClassValue: weightClassClinchVolume
      },
      {
        subject: 'Clinch Accuracy',
        value: clinchEfficiency,
        weightClassValue: weightClassClinchEfficiency,
        description: 'Accuracy percentage of clinch strikes',
        rawValue: clinchEfficiency,
        rawWeightClassValue: weightClassClinchEfficiency
      }
    ];
  };

  // Prepare ground position radar chart data
  const prepareGroundPositionRadarData = () => {
    // Calculate combined ground activity rating (70% ground volume + 30% submission volume)
    const groundActivityRating = (groundVolumeRating * 0.70) + (submissionVolumeRating * 0.30);

    return [
      {
        subject: 'Ground Control',
        value: groundControlPercentage,
        weightClassValue: 50,
        description: 'Percentage of time controlling the ground position',
        rawValue: groundControlPercentage,
        rawWeightClassValue: 50
      },
      {
        subject: 'Bottom Position',
        value: 100 - groundControlPercentage,
        weightClassValue: 50,
        description: 'Percentage of time being controlled on ground',
        rawValue: 100 - groundControlPercentage,
        rawWeightClassValue: 50
      },
      {
        subject: 'Ground Activity',
        value: groundActivityRating,
        weightClassValue: 50,
        description: 'Combined ground activity (70% strikes + 30% submissions) compared to weight class average',
        rawValue: groundActivityRating,
        rawWeightClassValue: 50
      },
      {
        subject: 'Ground Accuracy',
        value: groundEfficiency,
        weightClassValue: weightClassGroundEfficiency,
        description: 'Accuracy percentage of ground strikes',
        rawValue: groundEfficiency,
        rawWeightClassValue: weightClassGroundEfficiency
      }
    ];
  };

  // Styles object
  const ratingCardStyles = {
    // Collapsible section styles
    collapsibleSection: {
      bgcolor: 'rgba(10, 14, 23, 0.4)',
      borderRadius: '12px',
      border: '1px solid rgba(0, 240, 255, 0.15)',
      overflow: 'hidden',
      mb: 3,
      transition: 'all 0.3s ease',
      '&:hover': {
        border: '1px solid rgba(0, 240, 255, 0.3)',
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

  // Calculate clinch position rating from 1-99 (for individual section display)
  const clinchPositionRating = React.useMemo(() => {
    // Calculate clinch control rating (higher is better)
    // 50% control = 50 rating (average), 75% control = 75 rating (good), 25% control = 25 rating (poor)
    const clinchControlRating = Math.min(99, Math.max(1, clinchControlPercentage * 1.98)); // Scale 0-50% to 1-99
    
    // Calculate defensive rating (lower defensive percentage is better, so invert the logic)
    // 50% defensive = 50 rating (average), 25% defensive = 75 rating (good), 75% defensive = 25 rating (poor)
    const defensivePercentage = 100 - clinchControlPercentage;
    const defensiveRating = Math.min(99, Math.max(1, 99 - (defensivePercentage * 1.98))); // Invert so lower defensive = higher rating
    
    // Volume rating is already calculated as 1-99 based on weight class average
    const volumeRating = clinchVolumeRating;
    
    // Efficiency rating compared to weight class average
    const efficiencyRating = normalizeValue(clinchEfficiency, weightClassClinchEfficiency);
    
    // Combine ratings with weights
    // Clinch control is most important (40%), defensive positioning is very important (30%), volume and efficiency are less important (20% and 10%)
    const overallRating = (clinchControlRating * 0.40) + (defensiveRating * 0.30) + (volumeRating * 0.20) + (efficiencyRating * 0.10);
    
    return overallRating;
  }, [clinchControlPercentage, clinchVolumeRating, clinchEfficiency, weightClassClinchEfficiency]);

  // Calculate ground position rating from 1-99 (for individual section display)
  const groundPositionRating = React.useMemo(() => {
    // Calculate ground control rating (higher is better)
    // 50% control = 50 rating (average), 75% control = 75 rating (good), 25% control = 25 rating (poor)
    const groundControlRating = Math.min(99, Math.max(1, groundControlPercentage * 1.98)); // Scale 0-50% to 1-99
    
    // Calculate bottom position rating (lower bottom percentage is better, so invert the logic)
    // 50% bottom = 50 rating (average), 25% bottom = 75 rating (good), 75% bottom = 25 rating (poor)
    const bottomPercentage = 100 - groundControlPercentage;
    const bottomRating = Math.min(99, Math.max(1, 99 - (bottomPercentage * 1.98))); // Invert so lower bottom = higher rating
    
    // Combined ground activity rating (70% ground volume + 30% submission volume)
    const groundActivityRating = (groundVolumeRating * 0.70) + (submissionVolumeRating * 0.30);
    
    // Efficiency rating compared to weight class average
    const efficiencyRating = normalizeValue(groundEfficiency, weightClassGroundEfficiency);
    
    // Combine ratings with weights
    // Ground control is most important (40%), bottom positioning is very important (30%), ground activity and efficiency are less important (20% and 10%)
    const overallRating = (groundControlRating * 0.40) + (bottomRating * 0.30) + (groundActivityRating * 0.20) + (efficiencyRating * 0.10);
    
    return overallRating;
  }, [groundControlPercentage, groundVolumeRating, submissionVolumeRating, groundEfficiency, weightClassGroundEfficiency]);

  // Determine movement archetype based on fighter data
  const getMovementArchetype = () => {
    // Calculate dominant areas
    const cageScore = (centerControlRating + movingForwardRating + walkingBackwardsRating) / 3;
    const clinchScore = (clinchControlRating + clinchOffenseRating) / 2;
    const groundScore = (groundControlRating + groundOffenseRating) / 2;
    
    // Determine primary and secondary strengths
    const areas = [
      { name: 'cage', score: cageScore },
      { name: 'clinch', score: clinchScore },
      { name: 'ground', score: groundScore }
    ].sort((a, b) => b.score - a.score);
    
    const primary = areas[0];
    const secondary = areas[1];
    const tertiary = areas[2];
    
    // Determine if fighter is good (≥65) or struggling (<65)
    const isGoodFighter = overallMovementGrade >= 65;
    
    if (isGoodFighter) {
      // POSITIVE ARCHETYPES (10 total)
      
      // Cage-dominant positive archetypes
      if (primary.name === 'cage') {
        if (centerOctagonControlPercentage > 70) {
          return 'Octagon Master';
        } else if (cagePushingPercentage > 50) {
          return 'Pressure King';
        } else if (pushedBackPercentage < 15) {
          return 'Immovable Force';
        } else {
          return 'Cage Commander';
        }
      }
      
      // Clinch-dominant positive archetypes
      if (primary.name === 'clinch') {
        if (clinchControlPercentage > 75) {
          return 'Clinch Dominator';
        } else if (clinchOffenseRating > 75) {
          return 'Clinch Striker';
        } else {
          return 'Clinch Specialist';
        }
      }
      
      // Ground-dominant positive archetypes
      if (primary.name === 'ground') {
        if (groundControlPercentage > 75) {
          return 'Ground Controller';
        } else if (groundOffenseRating > 75) {
          return 'Ground Striker';
        } else if (submissionVolume > weightClassSubmissionVolume * 1.5) {
          return 'Submission Master';
        } else {
          return 'Ground Specialist';
        }
      }
      
      // Balanced positive archetypes
      if (Math.abs(primary.score - secondary.score) < 15) {
        if (primary.name === 'cage' && secondary.name === 'clinch') {
          return 'Cage-Clinch Hybrid';
        } else if (primary.name === 'cage' && secondary.name === 'ground') {
          return 'Cage-Ground Hybrid';
        } else if (primary.name === 'clinch' && secondary.name === 'ground') {
          return 'Grappling Master';
        } else {
          return 'Well-Rounded Warrior';
        }
      }
      
      // Specialized positive archetypes
      if (movingForwardRating > 85 && cagePushingPercentage > 60) {
        return 'Aggressive Pressure';
      } else if (walkingBackwardsRating > 85 && pushedBackPercentage < 10) {
        return 'Elusive Counter';
      } else if (clinchOffenseRating > 85 && groundOffenseRating > 85) {
        return 'Close-Range Striker';
      } else if (groundControlPercentage > 85 && submissionVolume > weightClassSubmissionVolume * 2) {
        return 'Submission Artist';
      } else if (centerOctagonControlPercentage > 85 && clinchControlPercentage > 85) {
        return 'Position Master';
      }
      
      // Default positive archetypes
      if (primary.score > 80) {
        return `${primary.name.charAt(0).toUpperCase() + primary.name.slice(1)} Expert`;
      } else if (primary.score > 70) {
        return `${primary.name.charAt(0).toUpperCase() + primary.name.slice(1)} Specialist`;
      } else {
        return 'Solid Fighter';
      }
      
    } else {
      // NEGATIVE ARCHETYPES (10 total)
      
      // Cage-dominant negative archetypes
      if (primary.name === 'cage') {
        if (centerOctagonControlPercentage < 30) {
          return 'Cage Avoidant';
        } else if (cagePushingPercentage < 20) {
          return 'Passive Fighter';
        } else if (pushedBackPercentage > 60) {
          return 'Backpedaler';
        } else {
          return 'Cage Ineffective';
        }
      }
      
      // Clinch-dominant negative archetypes
      if (primary.name === 'clinch') {
        if (clinchControlPercentage < 30) {
          return 'Clinch Weak';
        } else if (clinchOffenseRating < 30) {
          return 'Clinch Ineffective';
        } else {
          return 'Clinch Struggler';
        }
      }
      
      // Ground-dominant negative archetypes
      if (primary.name === 'ground') {
        if (groundControlPercentage < 30) {
          return 'Ground Weak';
        } else if (groundOffenseRating < 30) {
          return 'Ground Ineffective';
        } else if (submissionVolume < weightClassSubmissionVolume * 0.5) {
          return 'Submission Averse';
        } else {
          return 'Ground Struggler';
        }
      }
      
      // Balanced negative archetypes
      if (Math.abs(primary.score - secondary.score) < 15) {
        if (primary.name === 'cage' && secondary.name === 'clinch') {
          return 'Cage-Clinch Weak';
        } else if (primary.name === 'cage' && secondary.name === 'ground') {
          return 'Cage-Ground Weak';
        } else if (primary.name === 'clinch' && secondary.name === 'ground') {
          return 'Grappling Weak';
        } else {
          return 'Generally Weak';
        }
      }
      
      // Specialized negative archetypes
      if (movingForwardRating < 20 && cagePushingPercentage < 10) {
        return 'Extremely Passive';
      } else if (walkingBackwardsRating < 20 && pushedBackPercentage > 80) {
        return 'Constantly Backpedaling';
      } else if (clinchOffenseRating < 20 && groundOffenseRating < 20) {
        return 'Close-Range Weak';
      } else if (groundControlPercentage < 20 && submissionVolume < weightClassSubmissionVolume * 0.3) {
        return 'Ground Averse';
      } else if (centerOctagonControlPercentage < 20 && clinchControlPercentage < 20) {
        return 'Position Weak';
      }
      
      // Default negative archetypes
      if (primary.score < 30) {
        return `${primary.name.charAt(0).toUpperCase() + primary.name.slice(1)} Weak`;
      } else if (primary.score < 45) {
        return `${primary.name.charAt(0).toUpperCase() + primary.name.slice(1)} Struggler`;
      } else {
        return 'Movement Deficient';
      }
    }
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
            alt="Movement Analysis Icon"
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
            Movement Analysis
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
              transform: 'translateY(-50%)',
              width: '4px',
              height: '50%',
              background: 'linear-gradient(180deg, #00F0FF, transparent)',
              borderRadius: '2px',
            }
          }}
        >
          Comprehensive movement analysis based on cage positioning, clinch control, and ground position effectiveness compared to weight class averages
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Overall Movement Radar Chart */}
        <Grid item xs={12}>
          <Box sx={ratingCardStyles.collapsibleSection}>
            {/* Collapsible Header */}
            <Box 
              sx={ratingCardStyles.sectionHeader}
              onClick={() => toggleSection('overallMovement')}
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
                  Overall Movement Analysis
                </Typography>
              </Box>
              <IconButton
                sx={ratingCardStyles.expandIcon}
                className={collapsedSections.overallMovement ? '' : 'expanded'}
              >
                {collapsedSections.overallMovement ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={!collapsedSections.overallMovement}>
              <Box sx={{ p: 4 }}>
                <Typography sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  mb: 4,
                  textAlign: 'center',
                }}>
                  Comprehensive movement analysis comparing cage positioning, clinch control, and ground position effectiveness against weight class averages
                </Typography>
                
                {/* Overall Movement Grade Display */}
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
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    mb: 2,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
                  }}>
                    Overall Movement Grade
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
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'conic-gradient(from 0deg, #00F0FF 0deg, #00F0FF ' + (overallMovementGrade * 3.6) + 'deg, rgba(0, 240, 255, 0.1) ' + (overallMovementGrade * 3.6) + 'deg, rgba(0, 240, 255, 0.1) 360deg)',
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
                        {overallMovementGrade.toFixed(0)}
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
                        Grade
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    maxWidth: '400px',
                    mx: 'auto',
                  }}>
                    Based on cage positioning (40%), clinch control (35%), and ground position (35%) effectiveness
                  </Typography>
                </Box>

                {/* Radar Chart */}
                <Box sx={{ width: '100%', height: 400, position: 'relative' }}>
                  <ResponsiveContainer>
                    <RadarChart data={prepareOverallMovementRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
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
                        domain={[0, 99]}
                        tick={{ 
                          fill: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 10 
                        }}
                        stroke="rgba(0, 240, 255, 0.1)"
                      />
                      {/* UFC Average Radar */}
                      <Radar
                        name="UFC Average"
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
                        bgcolor: '#8B5CF6',
                        borderRadius: '50%',
                        boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
                      }} />
                      <Typography sx={{ color: '#fff', fontSize: '0.8rem' }}>{fighter.fighterName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#FF3864', borderRadius: '50%', opacity: 0.8 }} />
                      <Typography sx={{ color: '#fff', fontSize: '0.8rem' }}>UFC Average</Typography>
                    </Box>
                  </Box>
                </Box>
                
                {/* Movement Archetype */}
                <Box sx={{ 
                  mt: 3,
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(0, 240, 255, 0.05)',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                }}>
                  <Typography sx={{
                    color: '#00F0FF',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    mb: 1,
                    fontFamily: '"Orbitron", "Roboto Mono", monospace',
                  }}>
                    Movement Archetype
                  </Typography>
                  <Typography sx={{
                    color: '#fff',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    textShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
                    fontFamily: '"Orbitron", "Roboto Mono", monospace',
                  }}>
                    {getMovementArchetype()}
                  </Typography>
                </Box>
              </Box>
            </Collapse>
          </Box>
                </Grid>

        {/* Cage Position Analysis */}
        <Grid item xs={12}>
          <Box sx={ratingCardStyles.collapsibleSection}>
            {/* Collapsible Header */}
            <Box 
              sx={ratingCardStyles.sectionHeader}
              onClick={() => toggleSection('cagePosition')}
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
                      background: '#00D4AA',
                      boxShadow: '0 0 12px rgba(0, 212, 170, 0.5)',
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
                      border: '2px solid #00D4AA',
                      opacity: 0.3,
                    }
                  }}/>
                </Box>
                <Typography sx={{
                  ...ratingCardStyles.title,
                  fontSize: '1.3rem',
                }}>
                  Cage Position Analysis
                </Typography>
              </Box>
              <IconButton
                sx={ratingCardStyles.expandIcon}
                className={collapsedSections.cagePosition ? '' : 'expanded'}
              >
                {collapsedSections.cagePosition ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={!collapsedSections.cagePosition}>
              <Box sx={{ p: 4 }}>
                <Typography sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  mb: 4,
                  textAlign: 'center',
                }}>
                  Detailed analysis of cage positioning effectiveness including center control, pushing ability, and defensive positioning
                </Typography>

                {/* Cage Position Grade Display */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 4,
                  p: 3,
                  borderRadius: '12px',
                  background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
                  border: '2px solid rgba(0, 212, 170, 0.3)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 212, 170, 0.15), 0 0 60px rgba(0, 212, 170, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, #00D4AA, #00F0FF)',
                    opacity: 0.5,
                  }
                }}>
                  <Typography sx={{
                    color: '#FFFFFF',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    mb: 2,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
                  }}>
                    Cage Position Grade
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
                    background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                    border: '2px solid rgba(0, 212, 170, 0.2)',
                    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 212, 170, 0.1)',
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
                      background: 'conic-gradient(from 0deg, #00D4AA 0deg, #00D4AA ' + (cagePositionRating * 3.6) + 'deg, rgba(0, 212, 170, 0.1) ' + (cagePositionRating * 3.6) + 'deg, rgba(0, 212, 170, 0.1) 360deg)',
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
                      border: '1px solid rgba(0, 212, 170, 0.15)',
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
                          color: '#00D4AA',
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          letterSpacing: '0.1em',
                          lineHeight: 1,
                          textShadow: '0 0 15px rgba(0, 212, 170, 0.5)',
                        }}
                      >
                        {cagePositionRating.toFixed(0)}
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
                        Grade
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    maxWidth: '400px',
                    mx: 'auto',
                  }}>
                    Based on cage pushing (40%), center control (35%), and defensive positioning (25%)
                  </Typography>
                </Box>

                {/* Detailed Stats Grid */}
                <Grid container spacing={4} sx={{ mt: 2 }}>
                  {/* Center Octagon Control */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
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
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #00F0FF 0deg, #00F0FF ' + (centerOctagonControlPercentage * 3.6) + 'deg, rgba(0, 240, 255, 0.1) ' + (centerOctagonControlPercentage * 3.6) + 'deg, rgba(0, 240, 255, 0.1) 360deg)',
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
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              color: '#00F0FF',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                            }}
                          >
                            {centerOctagonControlPercentage.toFixed(1)}%
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
                            Center
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        mt: 1,
                      }}>
                        vs 50.0% UFC avg
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Cage Pushing */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
                      <Box sx={{ 
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                        border: '2px solid rgba(0, 212, 170, 0.2)',
                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 212, 170, 0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #00D4AA 0deg, #00D4AA ' + (cagePushingPercentage * 3.6) + 'deg, rgba(0, 212, 170, 0.1) ' + (cagePushingPercentage * 3.6) + 'deg, rgba(0, 212, 170, 0.1) 360deg)',
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
                          border: '1px solid rgba(0, 212, 170, 0.15)',
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
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              color: '#00D4AA',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: '0 0 15px rgba(0, 212, 170, 0.5)',
                            }}
                          >
                            {cagePushingPercentage.toFixed(1)}%
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
                            Pushing
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        mt: 1,
                      }}>
                        vs 33.0% UFC avg
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Pushed Back */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
                      <Box sx={{ 
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                        border: '2px solid rgba(255, 56, 100, 0.2)',
                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 56, 100, 0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #FF3864 0deg, #FF3864 ' + (pushedBackPercentage * 3.6) + 'deg, rgba(255, 56, 100, 0.1) ' + (pushedBackPercentage * 3.6) + 'deg, rgba(255, 56, 100, 0.1) 360deg)',
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
                          border: '1px solid rgba(255, 56, 100, 0.15)',
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
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              color: '#FF3864',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: '0 0 15px rgba(255, 56, 100, 0.5)',
                            }}
                          >
                            {pushedBackPercentage.toFixed(1)}%
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
                            Pushed Back
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        mt: 1,
                      }}>
                        vs 17.0% UFC avg
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Radar Chart */}
                <Box sx={{ width: '100%', height: 400, position: 'relative' }}>
                  <ResponsiveContainer>
                    <RadarChart data={prepareCagePositionRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid 
                        stroke="rgba(0, 212, 170, 0.1)"
                        gridType="circle"
                      />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ 
                          fill: '#fff',
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        stroke="rgba(0, 212, 170, 0.2)"
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]}
                        tick={{ 
                          fill: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 10 
                        }}
                        stroke="rgba(0, 212, 170, 0.1)"
                      />
                      {/* UFC Average Radar */}
                      <Radar
                        name="UFC Average"
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
                      bottom: 10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 3,
                      bgcolor: 'rgba(10, 14, 23, 0.9)',
                      p: 1,
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 212, 170, 0.2)',
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
                      <Typography sx={{ color: '#fff', fontSize: '0.8rem' }}>UFC Average</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Collapse>
          </Box>
        </Grid>

        {/* Clinch Position Analysis */}
        <Grid item xs={12}>
          <Box sx={ratingCardStyles.collapsibleSection}>
            {/* Collapsible Header */}
            <Box 
              sx={ratingCardStyles.sectionHeader}
              onClick={() => toggleSection('clinchPosition')}
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
                      background: '#FF6B35',
                      boxShadow: '0 0 12px rgba(255, 107, 53, 0.5)',
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
                      border: '2px solid #FF6B35',
                      opacity: 0.3,
                    }
                  }}/>
                </Box>
                <Typography sx={{
                  ...ratingCardStyles.title,
                  fontSize: '1.3rem',
                }}>
                  Clinch Position Analysis
                </Typography>
              </Box>
              <IconButton
                sx={ratingCardStyles.expandIcon}
                className={collapsedSections.clinchPosition ? '' : 'expanded'}
              >
                {collapsedSections.clinchPosition ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={!collapsedSections.clinchPosition}>
              <Box sx={{ p: 4 }}>
                <Typography sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  mb: 4,
                  textAlign: 'center',
                }}>
                  Analysis of clinch control effectiveness and defensive clinch positioning
                </Typography>

                {/* Clinch Position Grade Display */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 4,
                  p: 3,
                  borderRadius: '12px',
                  background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
                  border: '2px solid rgba(255, 107, 53, 0.3)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 107, 53, 0.15), 0 0 60px rgba(255, 107, 53, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, #FF6B35, #FF8C42)',
                    opacity: 0.5,
                  }
                }}>
                  <Typography sx={{
                    color: '#FFFFFF',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    mb: 2,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
                  }}>
                    Clinch Position Grade
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
                    background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                    border: '2px solid rgba(255, 107, 53, 0.2)',
                    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 107, 53, 0.1)',
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
                      background: 'conic-gradient(from 0deg, #FF6B35 0deg, #FF6B35 ' + (clinchPositionRating * 3.6) + 'deg, rgba(255, 107, 53, 0.1) ' + (clinchPositionRating * 3.6) + 'deg, rgba(255, 107, 53, 0.1) 360deg)',
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
                      border: '1px solid rgba(255, 107, 53, 0.15)',
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
                          color: '#FF6B35',
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          letterSpacing: '0.1em',
                          lineHeight: 1,
                          textShadow: '0 0 15px rgba(255, 107, 53, 0.5)',
                        }}
                      >
                        {clinchPositionRating.toFixed(0)}
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
                        Grade
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    maxWidth: '400px',
                    mx: 'auto',
                  }}>
                    Based on clinch control effectiveness compared to weight class average
                  </Typography>
                </Box>

                {/* Detailed Stats Grid */}
                <Grid container spacing={4} sx={{ mt: 2 }}>
                  {/* Clinch Control */}
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
                      <Box sx={{ 
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                        border: '2px solid rgba(255, 107, 53, 0.2)',
                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 107, 53, 0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #FF6B35 0deg, #FF6B35 ' + (clinchControlPercentage * 3.6) + 'deg, rgba(255, 107, 53, 0.1) ' + (clinchControlPercentage * 3.6) + 'deg, rgba(255, 107, 53, 0.1) 360deg)',
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
                          border: '1px solid rgba(255, 107, 53, 0.15)',
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
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              color: '#FF6B35',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: '0 0 15px rgba(255, 107, 53, 0.5)',
                            }}
                          >
                            {clinchControlPercentage.toFixed(1)}%
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
                            Control
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        mt: 1,
                      }}>
                        vs 50.0% avg
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Being Clinched */}
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
                      <Box sx={{ 
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                        border: '2px solid rgba(255, 56, 100, 0.2)',
                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 56, 100, 0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #FF3864 0deg, #FF3864 ' + ((100 - clinchControlPercentage) * 3.6) + 'deg, rgba(255, 56, 100, 0.1) ' + ((100 - clinchControlPercentage) * 3.6) + 'deg, rgba(255, 56, 100, 0.1) 360deg)',
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
                          border: '1px solid rgba(255, 56, 100, 0.15)',
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
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              color: '#FF3864',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: '0 0 15px rgba(255, 56, 100, 0.5)',
                            }}
                          >
                            {(100 - clinchControlPercentage).toFixed(1)}%
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
                            Defensive
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        mt: 1,
                      }}>
                        vs 50.0% avg
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Clinch Volume */}
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
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
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #00F0FF 0deg, #00F0FF ' + (Math.min(clinchVolume * 10, 100) * 3.6) + 'deg, rgba(0, 240, 255, 0.1) ' + (Math.min(clinchVolume * 10, 100) * 3.6) + 'deg, rgba(0, 240, 255, 0.1) 360deg)',
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
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              color: '#00F0FF',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                            }}
                          >
                            {clinchVolume.toFixed(1)}
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
                            Per Min
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        mt: 1,
                      }}>
                        vs {weightClassClinchVolume.toFixed(1)} avg
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Clinch Efficiency */}
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
                      <Box sx={{ 
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                        border: '2px solid rgba(0, 212, 170, 0.2)',
                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 212, 170, 0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #00D4AA 0deg, #00D4AA ' + (clinchEfficiency * 3.6) + 'deg, rgba(0, 212, 170, 0.1) ' + (clinchEfficiency * 3.6) + 'deg, rgba(0, 212, 170, 0.1) 360deg)',
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
                          border: '1px solid rgba(0, 212, 170, 0.15)',
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
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              color: '#00D4AA',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: '0 0 15px rgba(0, 212, 170, 0.5)',
                            }}
                          >
                            {clinchEfficiency.toFixed(1)}%
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
                            Accuracy
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        mt: 1,
                      }}>
                        vs {weightClassClinchEfficiency.toFixed(1)}% avg
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Radar Chart */}
                <Box sx={{ width: '100%', height: 400, position: 'relative' }}>
                  <ResponsiveContainer>
                    <RadarChart data={prepareClinchPositionRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid 
                        stroke="rgba(255, 107, 53, 0.1)"
                        gridType="circle"
                      />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ 
                          fill: '#fff',
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        stroke="rgba(255, 107, 53, 0.2)"
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]}
                        tick={{ 
                          fill: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 10 
                        }}
                        stroke="rgba(255, 107, 53, 0.1)"
                      />
                      {/* UFC Average Radar */}
                      <Radar
                        name="UFC Average"
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
                      bottom: 10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 3,
                      bgcolor: 'rgba(10, 14, 23, 0.9)',
                      p: 1,
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 107, 53, 0.2)',
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
                      <Typography sx={{ color: '#fff', fontSize: '0.8rem' }}>UFC Average</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Collapse>
          </Box>
        </Grid>

        {/* Ground Position Analysis */}
        <Grid item xs={12}>
          <Box sx={ratingCardStyles.collapsibleSection}>
            {/* Collapsible Header */}
            <Box 
              sx={ratingCardStyles.sectionHeader}
              onClick={() => toggleSection('groundPosition')}
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
                      background: '#8B5CF6',
                      boxShadow: '0 0 12px rgba(139, 92, 246, 0.5)',
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
                      border: '2px solid #8B5CF6',
                      opacity: 0.3,
                    }
                  }}/>
                </Box>
                <Typography sx={{
                  ...ratingCardStyles.title,
                  fontSize: '1.3rem',
                }}>
                  Ground Position Analysis
                </Typography>
              </Box>
              <IconButton
                sx={ratingCardStyles.expandIcon}
                className={collapsedSections.groundPosition ? '' : 'expanded'}
              >
                {collapsedSections.groundPosition ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={!collapsedSections.groundPosition}>
              <Box sx={{ p: 4 }}>
                <Typography sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  mb: 4,
                  textAlign: 'center',
                }}>
                  Analysis of ground position control effectiveness, defensive ground positioning, and ground striking efficiency
                </Typography>

                {/* Ground Position Grade Display */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 4,
                  p: 3,
                  borderRadius: '12px',
                  background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.98) 0%, rgba(30, 40, 60, 0.95) 100%)',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.15), 0 0 60px rgba(139, 92, 246, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, #8B5CF6, #A855F7)',
                    opacity: 0.5,
                  }
                }}>
                  <Typography sx={{
                    color: '#FFFFFF',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    mb: 2,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
                  }}>
                    Ground Position Grade
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
                    background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                    border: '2px solid rgba(139, 92, 246, 0.2)',
                    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(139, 92, 246, 0.1)',
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
                      background: 'conic-gradient(from 0deg, #8B5CF6 0deg, #8B5CF6 ' + (groundPositionRating * 3.6) + 'deg, rgba(139, 92, 246, 0.1) ' + (groundPositionRating * 3.6) + 'deg, rgba(139, 92, 246, 0.1) 360deg)',
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
                      border: '1px solid rgba(139, 92, 246, 0.15)',
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
                          color: '#8B5CF6',
                          fontFamily: '"Orbitron", "Roboto Mono", monospace',
                          letterSpacing: '0.1em',
                          lineHeight: 1,
                          textShadow: '0 0 15px rgba(139, 92, 246, 0.5)',
                        }}
                      >
                        {groundPositionRating.toFixed(0)}
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
                        Grade
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    maxWidth: '400px',
                    mx: 'auto',
                  }}>
                    Based on ground control (40%), bottom positioning (30%), volume (20%), and accuracy (10%) effectiveness
                  </Typography>
                </Box>

                {/* Detailed Stats Grid */}
                <Grid container spacing={4} sx={{ mt: 2 }}>
                  {/* Ground Control */}
                  <Grid item xs={12} md={2.4}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
                      <Box sx={{ 
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                        border: '2px solid rgba(139, 92, 246, 0.2)',
                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(139, 92, 246, 0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #8B5CF6 0deg, #8B5CF6 ' + (groundControlPercentage * 3.6) + 'deg, rgba(139, 92, 246, 0.1) ' + (groundControlPercentage * 3.6) + 'deg, rgba(139, 92, 246, 0.1) 360deg)',
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
                          border: '1px solid rgba(139, 92, 246, 0.15)',
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
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              color: '#8B5CF6',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: '0 0 15px rgba(139, 92, 246, 0.5)',
                            }}
                          >
                            {groundControlPercentage.toFixed(1)}%
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
                            Top Position
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        mt: 1,
                      }}>
                        vs {weightClassGroundControlPercentage.toFixed(1)}% avg
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Bottom Position */}
                  <Grid item xs={12} md={2.4}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
                      <Box sx={{ 
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                        border: '2px solid rgba(255, 56, 100, 0.2)',
                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 56, 100, 0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #FF3864 0deg, #FF3864 ' + ((100 - groundControlPercentage) * 3.6) + 'deg, rgba(255, 56, 100, 0.1) ' + ((100 - groundControlPercentage) * 3.6) + 'deg, rgba(255, 56, 100, 0.1) 360deg)',
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
                          border: '1px solid rgba(255, 56, 100, 0.15)',
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
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              color: '#FF3864',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: '0 0 15px rgba(255, 56, 100, 0.5)',
                            }}
                          >
                            {(100 - groundControlPercentage).toFixed(1)}%
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
                            Bottom Position
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        mt: 1,
                      }}>
                        vs 50.0% avg
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Ground Volume */}
                  <Grid item xs={12} md={2.4}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
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
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #00F0FF 0deg, #00F0FF ' + (Math.min(groundVolume * 10, 100) * 3.6) + 'deg, rgba(0, 240, 255, 0.1) ' + (Math.min(groundVolume * 10, 100) * 3.6) + 'deg, rgba(0, 240, 255, 0.1) 360deg)',
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
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              color: '#00F0FF',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                            }}
                          >
                            {groundVolume.toFixed(1)}
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
                            Per Min
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        mt: 1,
                      }}>
                        vs {weightClassGroundVolume.toFixed(1)} avg
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Ground Accuracy */}
                  <Grid item xs={12} md={2.4}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
                      <Box sx={{ 
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                        border: '2px solid rgba(0, 212, 170, 0.2)',
                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 212, 170, 0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #00D4AA 0deg, #00D4AA ' + (groundEfficiency * 3.6) + 'deg, rgba(0, 212, 170, 0.1) ' + (groundEfficiency * 3.6) + 'deg, rgba(0, 212, 170, 0.1) 360deg)',
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
                          border: '1px solid rgba(0, 212, 170, 0.15)',
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
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              color: '#00D4AA',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: '0 0 15px rgba(0, 212, 170, 0.5)',
                            }}
                          >
                            {groundEfficiency.toFixed(1)}%
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
                            Accuracy
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        mt: 1,
                      }}>
                        vs {weightClassGroundEfficiency.toFixed(1)}% avg
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Submission Volume */}
                  <Grid item xs={12} md={2.4}>
                    <Box sx={{ textAlign: 'center', position: 'relative' }}>
                      <Box sx={{ 
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8) 0%, rgba(20, 30, 50, 0.6) 100%)',
                        border: '2px solid rgba(255, 165, 0, 0.2)',
                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 165, 0, 0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #FFA500 0deg, #FFA500 ' + (Math.min(submissionVolume * 20, 100) * 3.6) + 'deg, rgba(255, 165, 0, 0.1) ' + (Math.min(submissionVolume * 20, 100) * 3.6) + 'deg, rgba(255, 165, 0, 0.1) 360deg)',
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
                          border: '1px solid rgba(255, 165, 0, 0.15)',
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
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              color: '#FFA500',
                              fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              letterSpacing: '0.1em',
                              lineHeight: 1,
                              textShadow: '0 0 15px rgba(255, 165, 0, 0.5)',
                            }}
                          >
                            {submissionVolume.toFixed(2)}
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
                            Sub Attempts
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        fontFamily: '"Orbitron", "Roboto Mono", monospace',
                        mt: 1,
                      }}>
                        vs {weightClassSubmissionVolume.toFixed(2)} avg
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Radar Chart */}
                <Box sx={{ width: '100%', height: 400, position: 'relative' }}>
                  <ResponsiveContainer>
                    <RadarChart data={prepareGroundPositionRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid 
                        stroke="rgba(139, 92, 246, 0.1)"
                        gridType="circle"
                      />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ 
                          fill: '#fff',
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                        stroke="rgba(139, 92, 246, 0.2)"
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]}
                        tick={{ 
                          fill: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 10 
                        }}
                        stroke="rgba(139, 92, 246, 0.1)"
                      />
                      {/* UFC Average Radar */}
                      <Radar
                        name="UFC Average"
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
                      bottom: 10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 3,
                      bgcolor: 'rgba(10, 14, 23, 0.9)',
                      p: 1,
                      borderRadius: '6px',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
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
                      <Typography sx={{ color: '#fff', fontSize: '0.8rem' }}>UFC Average</Typography>
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

export default MovementInfo; 