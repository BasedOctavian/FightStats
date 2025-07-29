import React from 'react';
import { Paper, Typography, Grid, Box, Switch, FormControlLabel, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Fighter } from '../../types/firestore';
import { useBasicInfo } from '../../hooks/stats/useBasicInfo';
import { useStrikingInfo } from '../../hooks/stats/useStrikingInfo';

interface StrikingInfoProps {
  fighter: Fighter;
  weightClassAvgData?: any;
}

const StrikingInfo: React.FC<StrikingInfoProps> = ({ fighter, weightClassAvgData }): JSX.Element => {
  // Use the hook to get defense rating calculation
  const { calculateDefenseRating } = useBasicInfo(fighter, weightClassAvgData);
  
  // State for excluding ground strikes
  const [excludeGroundStrikes, setExcludeGroundStrikes] = React.useState(false);
  
  // State for managing collapsed sections
  const [collapsedSections, setCollapsedSections] = React.useState({
    strikingRating: false,
    strikesPerMinute: true,
    accuracy: true,
    power: true,
    strikeSelection: true,
    defense: true
  });

  // Toggle section collapse
  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper function to format metric values
  const formatMetricValue = (label: string, value: number, isWeightClass: boolean = false) => {
    if (label === 'Power Strikes Landed Per Minute' || label === 'Strikes Absorbed Per Minute') {
      return isWeightClass ? `${value.toFixed(2)}/min` : value.toFixed(2);
    }
    if (label === 'Knockdown Absorption Rate Per Fight' || label === 'Stun Absorption Rate Per Fight') {
      return isWeightClass ? `${value.toFixed(2)}/fight` : value.toFixed(2);
    }
    return `${value}%`;
  };

  // Helper function to get raw value for progress bars
  const getRawValue = (label: string, value: number) => {
    if (label === 'Power Strikes Landed Per Minute' || label === 'Strikes Absorbed Per Minute' || 
        label === 'Knockdown Absorption Rate Per Fight' || label === 'Stun Absorption Rate Per Fight') {
      return value; // Return the raw value (not percentage)
    }
    return value; // For percentage-based metrics, return as is
  };

  // Custom tooltip component for the radar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Helper function to format the value display based on metric type
      const formatValueDisplay = () => {
        if (data.subject === 'Defense') {
          return {
            fighterValue: `${data.rawValue.toFixed(0)}`,
            weightClassValue: `${data.rawWeightClassValue.toFixed(0)}`,
            unit: ''
          };
        } else {
          return {
            fighterValue: `${data.rawValue.toFixed(2)}/min`,
            weightClassValue: `${data.rawWeightClassValue.toFixed(2)}/min`,
            unit: '/min'
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
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', mb: 1 }}>
            Weight Class Avg: {valueDisplay.weightClassValue}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem' }}>
            {data.description}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Prepare radar chart data for SPM analysis
  const prepareSPMRadarData = () => {
    const totalStrikesSPM = excludeGroundStrikes 
      ? ((fighter.total_stats?.TotalStrikesLanded || 0) - (fighter.ground_stats?.TotalGroundStrikesMade || 0)) / (fighter.MinutesTracked || 1)
      : (fighter.total_stats?.TotalStrikesLanded || 0) / (fighter.MinutesTracked || 1);
    
    const punchesSPM = (fighter.total_stats?.TotalPunchesLanded || 0) / (fighter.MinutesTracked || 1);
    const kicksSPM = (fighter.total_stats?.TotalKicksLanded || 0) / (fighter.MinutesTracked || 1);
    const elbowsSPM = (fighter.total_stats?.TotalElbowsMade || 0) / (fighter.MinutesTracked || 1);

    const weightClassTotalStrikesSPM = weightClassAvgData 
      ? excludeGroundStrikes
        ? ((weightClassAvgData.TotalStrikesLanded || 0) - (weightClassAvgData.TotalGroundStrikesMade || 0)) / (weightClassAvgData.minutes || 1)
        : (weightClassAvgData.TotalStrikesLanded || 0) / (weightClassAvgData.minutes || 1)
      : 0;
    const weightClassPunchesSPM = weightClassAvgData ? (weightClassAvgData.TotalPunchesLanded || 0) / (weightClassAvgData.minutes || 1) : 0;
    const weightClassKicksSPM = weightClassAvgData ? (weightClassAvgData.TotalKicksLanded || 0) / (weightClassAvgData.minutes || 1) : 0;
    const weightClassElbowsSPM = weightClassAvgData ? (weightClassAvgData.TotalElbowsMade || 0) / (weightClassAvgData.minutes || 1) : 0;

    // Helper function to calculate normalized values with weight class average as midpoint
    const normalizeWithWeightClassMidpoint = (fighterValue: number, weightClassValue: number) => {
      if (weightClassValue === 0) {
        // If no weight class data, use simple normalization
        const maxValue = Math.max(fighterValue, 1);
        return (fighterValue / maxValue) * 100;
      }
      
      // Set weight class average as 50 (midpoint)
      // Calculate the scale factor to make weight class value = 50
      const scaleFactor = 50 / weightClassValue;
      
      // Normalize fighter value using the same scale
      const normalizedFighterValue = fighterValue * scaleFactor;
      
      // Cap at 100 to prevent overflow
      return Math.min(normalizedFighterValue, 100);
    };

    return [
      {
        subject: 'Total Strikes',
        value: normalizeWithWeightClassMidpoint(totalStrikesSPM, weightClassTotalStrikesSPM),
        weightClassValue: 50, // Always 50 (midpoint)
        description: excludeGroundStrikes 
          ? 'All strikes landed per minute excluding ground strikes'
          : 'All strikes landed per minute including punches, kicks, elbows, and other techniques',
        rawValue: totalStrikesSPM,
        rawWeightClassValue: weightClassTotalStrikesSPM
      },
      {
        subject: 'Punches',
        value: normalizeWithWeightClassMidpoint(punchesSPM, weightClassPunchesSPM),
        weightClassValue: 50, // Always 50 (midpoint)
        description: 'Punches landed per minute including jabs, hooks, straights, and uppercuts',
        rawValue: punchesSPM,
        rawWeightClassValue: weightClassPunchesSPM
      },
      {
        subject: 'Kicks',
        value: normalizeWithWeightClassMidpoint(kicksSPM, weightClassKicksSPM),
        weightClassValue: 50, // Always 50 (midpoint)
        description: 'Kicks landed per minute including leg kicks, body kicks, and head kicks',
        rawValue: kicksSPM,
        rawWeightClassValue: weightClassKicksSPM
      },
      {
        subject: 'Elbows',
        value: normalizeWithWeightClassMidpoint(elbowsSPM, weightClassElbowsSPM),
        weightClassValue: 50, // Always 50 (midpoint)
        description: 'Elbow strikes landed per minute, often used in close-range combat',
        rawValue: elbowsSPM,
        rawWeightClassValue: weightClassElbowsSPM
      }
    ];
  };

  // Prepare radar chart data for accuracy analysis
  const prepareAccuracyRadarData = () => {
    // Helper function to calculate normalized values with weight class average as midpoint
    const normalizeWithWeightClassMidpoint = (fighterValue: number, weightClassValue: number) => {
      if (weightClassValue === 0) {
        // If no weight class data, use simple normalization
        const maxValue = Math.max(fighterValue, 1);
        return (fighterValue / maxValue) * 100;
      }
      
      // Set weight class average as 50 (midpoint)
      // Calculate the scale factor to make weight class value = 50
      const scaleFactor = 50 / weightClassValue;
      
      // Normalize fighter value using the same scale
      const normalizedFighterValue = fighterValue * scaleFactor;
      
      // Cap at 100 to prevent overflow
      return Math.min(normalizedFighterValue, 100);
    };

    return [
      {
        subject: 'Overall Striking',
        value: normalizeWithWeightClassMidpoint(accuracyMetrics.overallStrikingAccuracy, weightClassAccuracyMetrics.overallStrikingAccuracy),
        weightClassValue: 50, // Always 50 (midpoint)
        description: 'Overall accuracy of all strikes including punches, kicks, and elbows',
        rawValue: accuracyMetrics.overallStrikingAccuracy,
        rawWeightClassValue: weightClassAccuracyMetrics.overallStrikingAccuracy
      },
      {
        subject: 'Punch Accuracy',
        value: normalizeWithWeightClassMidpoint(accuracyMetrics.punchAccuracy, weightClassAccuracyMetrics.punchAccuracy),
        weightClassValue: 50, // Always 50 (midpoint)
        description: 'Accuracy of all punch types including jabs, hooks, straights, and uppercuts',
        rawValue: accuracyMetrics.punchAccuracy,
        rawWeightClassValue: weightClassAccuracyMetrics.punchAccuracy
      },
      {
        subject: 'Kick Accuracy',
        value: normalizeWithWeightClassMidpoint(accuracyMetrics.kickAccuracy, weightClassAccuracyMetrics.kickAccuracy),
        weightClassValue: 50, // Always 50 (midpoint)
        description: 'Accuracy of all kick types including leg kicks, body kicks, and head kicks',
        rawValue: accuracyMetrics.kickAccuracy,
        rawWeightClassValue: weightClassAccuracyMetrics.kickAccuracy
      },
      {
        subject: 'Elbow Accuracy',
        value: normalizeWithWeightClassMidpoint(accuracyMetrics.elbowAccuracy, weightClassAccuracyMetrics.elbowAccuracy),
        weightClassValue: 50, // Always 50 (midpoint)
        description: 'Accuracy of elbow strikes, often used in close-range combat',
        rawValue: accuracyMetrics.elbowAccuracy,
        rawWeightClassValue: weightClassAccuracyMetrics.elbowAccuracy
      }
    ];
  };

  // Prepare radar chart data for power analysis
  const preparePowerRadarData = () => {
    // Helper function to calculate normalized values with weight class average as midpoint
    const normalizeWithWeightClassMidpoint = (fighterValue: number, weightClassValue: number) => {
      if (weightClassValue === 0) {
        // If no weight class data, use simple normalization
        const maxValue = Math.max(fighterValue, 1);
        return (fighterValue / maxValue) * 100;
      }
      
      // Set weight class average as 50 (midpoint)
      // Calculate the scale factor to make weight class value = 50
      const scaleFactor = 50 / weightClassValue;
      
      // Normalize fighter value using the same scale
      const normalizedFighterValue = fighterValue * scaleFactor;
      
      // Cap at 100 to prevent overflow
      return Math.min(normalizedFighterValue, 100);
    };

    return [
      {
        subject: 'Power Punch Accuracy',
        value: normalizeWithWeightClassMidpoint(powerMetrics.powerPunchAccuracy, weightClassPowerMetrics.powerPunchAccuracy),
        weightClassValue: 50, // Always 50 (midpoint)
        description: 'Accuracy of power punches (hooks, uppercuts, overhands), showing effectiveness of high-damage strikes',
        rawValue: powerMetrics.powerPunchAccuracy,
        rawWeightClassValue: weightClassPowerMetrics.powerPunchAccuracy
      },
      {
        subject: 'Power Strikes Per Min',
        value: normalizeWithWeightClassMidpoint(powerMetrics.powerStrikesLandedPerMinute, weightClassPowerMetrics.powerStrikesLandedPerMinute),
        weightClassValue: 50, // Always 50 (midpoint)
        description: 'Heavy-hitting strikes (hooks, uppercuts, overhands, head kicks) landed per minute, key for power punchers',
        rawValue: powerMetrics.powerStrikesLandedPerMinute,
        rawWeightClassValue: weightClassPowerMetrics.powerStrikesLandedPerMinute
      },
      {
        subject: 'KO/TKO Win Rate',
        value: normalizeWithWeightClassMidpoint(powerMetrics.koTkoWinRatePerFight, weightClassPowerMetrics.koTkoWinRatePerFight),
        weightClassValue: 50, // Always 50 (midpoint)
        description: 'Average number of KO/TKO wins per fight, indicating finishing power and knockout ability',
        rawValue: powerMetrics.koTkoWinRatePerFight,
        rawWeightClassValue: weightClassPowerMetrics.koTkoWinRatePerFight
      }
    ];
  };



  // Prepare radar chart data for comprehensive striking overview
  const prepareStrikingOverviewRadarData = () => {
    // Helper function to calculate rating from 1-99 based on weight class average
    const calculateRating = (fighterValue: number, weightClassValue: number) => {
      if (weightClassValue === 0) {
        // If no weight class data, use simple normalization
        const maxValue = Math.max(fighterValue, 1);
        return Math.min(99, Math.max(1, (fighterValue / maxValue) * 99));
      }
      
      // Calculate percentage relative to weight class average
      const percentage = (fighterValue / weightClassValue) * 100;
      
      // Convert to 1-99 scale
      // 50% = 50 rating (average)
      // 100% = 75 rating (good)
      // 150% = 90 rating (excellent)
      // 200%+ = 99 rating (exceptional)
      let rating = 50 + (percentage - 100) * 0.5;
      
      // Cap between 1 and 99
      return Math.min(99, Math.max(1, rating));
    };

    // Get SPM data
    const totalStrikesSPM = excludeGroundStrikes 
      ? ((fighter.total_stats?.TotalStrikesLanded || 0) - (fighter.ground_stats?.TotalGroundStrikesMade || 0)) / (fighter.MinutesTracked || 1)
      : (fighter.total_stats?.TotalStrikesLanded || 0) / (fighter.MinutesTracked || 1);
    
    const weightClassTotalStrikesSPM = weightClassAvgData 
      ? excludeGroundStrikes
        ? ((weightClassAvgData.TotalStrikesLanded || 0) - (weightClassAvgData.TotalGroundStrikesMade || 0)) / (weightClassAvgData.minutes || 1)
        : (weightClassAvgData.TotalStrikesLanded || 0) / (weightClassAvgData.minutes || 1)
      : 0;

    return [
      {
        subject: 'Volume',
        value: calculateRating(totalStrikesSPM, weightClassTotalStrikesSPM),
        weightClassValue: 50, // Always 50 (midpoint)
        description: 'Strikes per minute compared to weight class average',
        rawValue: totalStrikesSPM,
        rawWeightClassValue: weightClassTotalStrikesSPM
      },
      {
        subject: 'Accuracy',
        value: calculateRating(accuracyMetrics.overallStrikingAccuracy, weightClassAccuracyMetrics.overallStrikingAccuracy),
        weightClassValue: 50, // Always 50 (midpoint)
        description: 'Overall striking accuracy compared to weight class average',
        rawValue: accuracyMetrics.overallStrikingAccuracy,
        rawWeightClassValue: weightClassAccuracyMetrics.overallStrikingAccuracy
      },
      {
        subject: 'Power/Finishing',
        value: calculateRating(
          (powerMetrics.powerStrikesLandedPerMinute + powerMetrics.koTkoWinRatePerFight) / 2,
          (weightClassPowerMetrics.powerStrikesLandedPerMinute + weightClassPowerMetrics.koTkoWinRatePerFight) / 2
        ),
        weightClassValue: 50, // Always 50 (midpoint)
        description: 'Combined power striking and finishing ability compared to weight class average',
        rawValue: (powerMetrics.powerStrikesLandedPerMinute + powerMetrics.koTkoWinRatePerFight) / 2,
        rawWeightClassValue: (weightClassPowerMetrics.powerStrikesLandedPerMinute + weightClassPowerMetrics.koTkoWinRatePerFight) / 2
      },
      {
        subject: 'Defense',
        value: calculateDefenseRating(),
        weightClassValue: 50, // Always 50 (midpoint)
        description: 'Defensive rating based on strikes absorbed compared to weight class average',
        rawValue: calculateDefenseRating(),
        rawWeightClassValue: 50
      },
      {
        subject: 'Efficiency',
        value: calculateRating(
          accuracyMetrics.overallStrikingAccuracy * totalStrikesSPM / 100, 
          weightClassAccuracyMetrics.overallStrikingAccuracy * weightClassTotalStrikesSPM / 100
        ),
        weightClassValue: 50, // Always 50 (midpoint)
        description: 'Effective strikes per minute (accuracy × volume) compared to weight class average',
        rawValue: accuracyMetrics.overallStrikingAccuracy * totalStrikesSPM / 100,
        rawWeightClassValue: weightClassAccuracyMetrics.overallStrikingAccuracy * weightClassTotalStrikesSPM / 100
      }
    ];
  };

  // Prepare radar chart data for defense strike types analysis
  const prepareDefenseStrikeTypesRadarData = () => {
    const normalizeWithWeightClassMidpoint = (fighterValue: number, weightClassValue: number) => {
      if (weightClassValue === 0) {
        // If no weight class data, use simple normalization
        const maxValue = Math.max(fighterValue, 1);
        return Math.min(99, Math.max(1, (fighterValue / maxValue) * 99));
      }
      
      // For defense metrics, we want to show the actual absorption rates
      // Higher absorption = higher value on radar (shows vulnerability)
      const percentage = (fighterValue / weightClassValue) * 100;
      
      // Convert to 1-99 scale
      // 50% = 50 rating (below average absorption)
      // 100% = 75 rating (average absorption)
      // 150% = 90 rating (high absorption)
      // 200%+ = 99 rating (very high absorption)
      let rating = 50 + (percentage - 100) * 0.5;
      
      // Cap between 1 and 99
      return Math.min(99, Math.max(1, rating));
    };

    const fighterMinutes = fighter.MinutesTracked || 1;
    const weightClassMinutes = weightClassAvgData?.minutes || 1;

    return [
      {
        subject: 'Body Kicks',
        value: normalizeWithWeightClassMidpoint(
          (fighter.striking_stats?.BodyKicksAbsorbed || 0) / fighterMinutes,
          (weightClassAvgData?.BodyKicksAbsorbed || 0) / weightClassMinutes
        ),
        weightClassValue: 75, // Weight class average at 75 (100% of average)
        description: 'Body kicks absorbed per minute compared to weight class average',
        rawValue: (fighter.striking_stats?.BodyKicksAbsorbed || 0) / fighterMinutes,
        rawWeightClassValue: (weightClassAvgData?.BodyKicksAbsorbed || 0) / weightClassMinutes
      },
      {
        subject: 'Head Kicks',
        value: normalizeWithWeightClassMidpoint(
          (fighter.striking_stats?.HeadKicksAbsorbed || 0) / fighterMinutes,
          (weightClassAvgData?.HeadKicksAbsorbed || 0) / weightClassMinutes
        ),
        weightClassValue: 75,
        description: 'Head kicks absorbed per minute compared to weight class average',
        rawValue: (fighter.striking_stats?.HeadKicksAbsorbed || 0) / fighterMinutes,
        rawWeightClassValue: (weightClassAvgData?.HeadKicksAbsorbed || 0) / weightClassMinutes
      },
      {
        subject: 'Hooks',
        value: normalizeWithWeightClassMidpoint(
          (fighter.striking_stats?.HooksAbsorbed || 0) / fighterMinutes,
          (weightClassAvgData?.HooksAbsorbed || 0) / weightClassMinutes
        ),
        weightClassValue: 75,
        description: 'Hooks absorbed per minute compared to weight class average',
        rawValue: (fighter.striking_stats?.HooksAbsorbed || 0) / fighterMinutes,
        rawWeightClassValue: (weightClassAvgData?.HooksAbsorbed || 0) / weightClassMinutes
      },
      {
        subject: 'Jabs',
        value: normalizeWithWeightClassMidpoint(
          (fighter.striking_stats?.JabsAbsorbed || 0) / fighterMinutes,
          (weightClassAvgData?.JabsAbsorbed || 0) / weightClassMinutes
        ),
        weightClassValue: 75,
        description: 'Jabs absorbed per minute compared to weight class average',
        rawValue: (fighter.striking_stats?.JabsAbsorbed || 0) / fighterMinutes,
        rawWeightClassValue: (weightClassAvgData?.JabsAbsorbed || 0) / weightClassMinutes
      },
      {
        subject: 'Leg Kicks',
        value: normalizeWithWeightClassMidpoint(
          (fighter.striking_stats?.LegKicksAbsorbed || 0) / fighterMinutes,
          (weightClassAvgData?.LegKicksAbsorbed || 0) / weightClassMinutes
        ),
        weightClassValue: 75,
        description: 'Leg kicks absorbed per minute compared to weight class average',
        rawValue: (fighter.striking_stats?.LegKicksAbsorbed || 0) / fighterMinutes,
        rawWeightClassValue: (weightClassAvgData?.LegKicksAbsorbed || 0) / weightClassMinutes
      },
      {
        subject: 'Overhands',
        value: normalizeWithWeightClassMidpoint(
          (fighter.striking_stats?.OverhandsAbsorbed || 0) / fighterMinutes,
          (weightClassAvgData?.OverhandsAbsorbed || 0) / weightClassMinutes
        ),
        weightClassValue: 75,
        description: 'Overhand punches absorbed per minute compared to weight class average',
        rawValue: (fighter.striking_stats?.OverhandsAbsorbed || 0) / fighterMinutes,
        rawWeightClassValue: (weightClassAvgData?.OverhandsAbsorbed || 0) / weightClassMinutes
      },
      {
        subject: 'Straights',
        value: normalizeWithWeightClassMidpoint(
          (fighter.striking_stats?.StraightsAbsorbed || 0) / fighterMinutes,
          (weightClassAvgData?.StraightsAbsorbed || 0) / weightClassMinutes
        ),
        weightClassValue: 75,
        description: 'Straight punches absorbed per minute compared to weight class average',
        rawValue: (fighter.striking_stats?.StraightsAbsorbed || 0) / fighterMinutes,
        rawWeightClassValue: (weightClassAvgData?.StraightsAbsorbed || 0) / weightClassMinutes
      },
      {
        subject: 'Uppercuts',
        value: normalizeWithWeightClassMidpoint(
          (fighter.striking_stats?.UppercutsAbsorbed || 0) / fighterMinutes,
          (weightClassAvgData?.UppercutsAbsorbed || 0) / weightClassMinutes
        ),
        weightClassValue: 75,
        description: 'Uppercuts absorbed per minute compared to weight class average',
        rawValue: (fighter.striking_stats?.UppercutsAbsorbed || 0) / fighterMinutes,
        rawWeightClassValue: (weightClassAvgData?.UppercutsAbsorbed || 0) / weightClassMinutes
      }
    ];
  };

  // Use the hooks to get calculated data
  const { calculateStrikingRating } = useBasicInfo(fighter, weightClassAvgData);
  const { topStrikes, accuracyMetrics, weightClassAccuracyMetrics, powerMetrics, weightClassPowerMetrics, defenseMetrics, weightClassDefenseMetrics } = useStrikingInfo(fighter, weightClassAvgData, excludeGroundStrikes);

  // Get calculated values
  const strikingRating = calculateStrikingRating();

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
            alt="Striking Analysis Icon"
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
            Striking Analysis
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
          Comprehensive striking analysis based on accuracy, volume, and effectiveness compared to weight class averages
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Striking Rating Section */}
        <Grid item xs={12}>
          <Box sx={ratingCardStyles.collapsibleSection}>
            {/* Collapsible Header */}
            <Box 
              sx={ratingCardStyles.sectionHeader}
              onClick={() => toggleSection('strikingRating')}
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
                  Striking Rating
                </Typography>
              </Box>
              <IconButton
                sx={ratingCardStyles.expandIcon}
                className={collapsedSections.strikingRating ? '' : 'expanded'}
              >
                {collapsedSections.strikingRating ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={!collapsedSections.strikingRating}>
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
                      background: 'conic-gradient(from 0deg, #00F0FF 0deg, #00F0FF ' + (strikingRating * 3.6) + 'deg, rgba(0, 240, 255, 0.1) ' + (strikingRating * 3.6) + 'deg, rgba(0, 240, 255, 0.1) 360deg)',
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
                        {strikingRating}
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
                {/* Description */}
                <Typography sx={{
                  ...ratingCardStyles.description,
                  mb: 3,
                }}>
                  Comprehensive striking rating based on accuracy and volume compared to weight class averages. Shows your most effective striking techniques.
                </Typography>
                
                {/* Top 3 Landed Strikes */}
                {topStrikes.length > 0 ? (
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
                      Top 3 Landed Strikes
                    </Typography>
                    <Grid container spacing={1}>
                      {topStrikes.map((strike, index) => (
                        <Grid item xs={12} key={strike.name}>
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
                                {strike.name}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography sx={{
                                color: '#00F0FF',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                fontFamily: '"Orbitron", "Roboto Mono", monospace',
                              }}>
                                {strike.landedPerRound}/round
                              </Typography>
                              <Typography sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                              }}>
                                {strike.landedPerMinute}/min • {strike.accuracy}% acc
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
                      No striking data available
                    </Typography>
                  </Box>
                )}
              </Grid>
                         </Grid>

             {/* Comprehensive Striking Overview Radar */}
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
                 Comprehensive Striking Overview
               </Typography>
               
               <Box sx={{
                 p: 4,
                 borderRadius: '12px',
                 bgcolor: 'rgba(10, 14, 23, 0.4)',
                 border: '1px solid rgba(0, 240, 255, 0.15)',
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
                 <Box sx={{ 
                   height: 400, 
                   width: '100%', 
                   position: 'relative',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center'
                 }}>
                   <ResponsiveContainer>
                     <RadarChart data={prepareStrikingOverviewRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
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
               </Box>
             </Collapse>
           </Box>
         </Grid>

         {/* Strikes Per Minute Section */}
         <Grid item xs={12}>
           <Box sx={ratingCardStyles.collapsibleSection}>
             {/* Collapsible Header */}
             <Box 
               sx={ratingCardStyles.sectionHeader}
               onClick={() => toggleSection('strikesPerMinute')}
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
                       width: '18px',
                       height: '2px',
                       background: '#00F0FF',
                       boxShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                     },
                     '&::after': {
                       content: '""',
                       position: 'absolute',
                       top: '50%',
                       left: '50%',
                       transform: 'translate(-50%, -50%)',
                       width: '2px',
                       height: '18px',
                       background: '#00F0FF',
                       boxShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                     }
                   }}/>
                 </Box>
                 <Typography sx={{
                   ...ratingCardStyles.title,
                   fontSize: '1.3rem',
                 }}>
                   Strikes Per Minute Analysis
                 </Typography>
               </Box>
               <IconButton
                 sx={ratingCardStyles.expandIcon}
                 className={collapsedSections.strikesPerMinute ? '' : 'expanded'}
               >
                 {collapsedSections.strikesPerMinute ? <ExpandMore /> : <ExpandLess />}
               </IconButton>
             </Box>

             {/* Collapsible Content */}
             <Collapse in={!collapsedSections.strikesPerMinute}>
               <Box sx={{ p: 4 }}>

             <Typography 
               sx={{ 
                 color: 'rgba(255, 255, 255, 0.7)',
                 mb: 2,
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
               Breakdown of strike frequency across different techniques per minute of fight time
             </Typography>

             {/* Ground Strikes Toggle for SPM */}
             <Box sx={{
               p: 2,
               borderRadius: '8px',
               background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(0, 102, 255, 0.02) 100%)',
               border: '1px solid rgba(0, 240, 255, 0.1)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               transition: 'all 0.3s ease',
               mb: 4,
               '&:hover': {
                 background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(0, 102, 255, 0.04) 100%)',
                 border: '1px solid rgba(0, 240, 255, 0.2)',
               }
             }}>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                 <Box sx={{
                   width: 32,
                   height: 32,
                   borderRadius: '6px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8), rgba(10, 14, 23, 0.6))',
                   border: '1px solid rgba(0, 240, 255, 0.2)',
                 }}>
                   <Box sx={{
                     width: '16px',
                     height: '16px',
                     position: 'relative',
                     '&::before': {
                       content: '""',
                       position: 'absolute',
                       top: '50%',
                       left: '50%',
                       transform: 'translate(-50%, -50%)',
                       width: '8px',
                       height: '8px',
                       borderRadius: '50%',
                       background: excludeGroundStrikes ? '#00F0FF' : 'rgba(255, 255, 255, 0.5)',
                       boxShadow: excludeGroundStrikes ? '0 0 8px rgba(0, 240, 255, 0.5)' : 'none',
                     },
                     '&::after': {
                       content: '""',
                       position: 'absolute',
                       top: '50%',
                       left: '50%',
                       transform: 'translate(-50%, -50%)',
                       width: '12px',
                       height: '12px',
                       borderRadius: '50%',
                       border: '1px solid rgba(0, 240, 255, 0.3)',
                       opacity: excludeGroundStrikes ? 0.8 : 0.3,
                     }
                   }}/>
                 </Box>
                 <Box>
                   <Typography sx={{
                     color: '#FFFFFF',
                     fontWeight: 600,
                     fontSize: '0.9rem',
                     mb: 0.5,
                   }}>
                     Exclude Ground Strikes
                   </Typography>
                   <Typography sx={{
                     color: 'rgba(255, 255, 255, 0.6)',
                     fontSize: '0.8rem',
                   }}>
                     {excludeGroundStrikes ? 'Ground strikes excluded from SPM calculations' : 'Include all strikes in SPM analysis'}
                   </Typography>
                 </Box>
               </Box>
               <FormControlLabel
                 control={
                   <Switch
                     checked={excludeGroundStrikes}
                     onChange={(e) => setExcludeGroundStrikes(e.target.checked)}
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
                       '& .MuiSwitch-thumb': {
                         backgroundColor: excludeGroundStrikes ? '#00F0FF' : '#FFFFFF',
                         boxShadow: excludeGroundStrikes ? '0 0 10px rgba(0, 240, 255, 0.5)' : 'none',
                       },
                     }}
                   />
                 }
                 label=""
                 sx={{ ml: 0 }}
               />
             </Box>

             <Grid container spacing={4}>
               {[
                 {
                   label: 'Total Strikes',
                   value: excludeGroundStrikes 
                     ? ((fighter.total_stats?.TotalStrikesLanded || 0) - (fighter.ground_stats?.TotalGroundStrikesMade || 0)) / (fighter.MinutesTracked || 1)
                     : (fighter.total_stats?.TotalStrikesLanded || 0) / (fighter.MinutesTracked || 1),
                   weightClassValue: weightClassAvgData 
                     ? excludeGroundStrikes
                       ? ((weightClassAvgData.TotalStrikesLanded || 0) - (weightClassAvgData.TotalGroundStrikesMade || 0)) / (weightClassAvgData.minutes || 1)
                       : (weightClassAvgData.TotalStrikesLanded || 0) / (weightClassAvgData.minutes || 1)
                     : 0,
                   description: excludeGroundStrikes 
                     ? 'All strikes landed per minute excluding ground strikes'
                     : 'All strikes landed per minute including punches, kicks, elbows, and other techniques',
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
                       borderRadius: '50%',
                       boxShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                     }
                   }}/>
                 },
                 {
                   label: 'Punches',
                   value: (fighter.total_stats?.TotalPunchesLanded || 0) / (fighter.MinutesTracked || 1),
                   weightClassValue: weightClassAvgData ? (weightClassAvgData.TotalPunchesLanded || 0) / (weightClassAvgData.minutes || 1) : 0,
                   description: 'Punches landed per minute including jabs, hooks, straights, and uppercuts',
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
                   }}/>
                 },
                 {
                   label: 'Kicks',
                   value: (fighter.total_stats?.TotalKicksLanded || 0) / (fighter.MinutesTracked || 1),
                   weightClassValue: weightClassAvgData ? (weightClassAvgData.TotalKicksLanded || 0) / (weightClassAvgData.minutes || 1) : 0,
                   description: 'Kicks landed per minute including leg kicks, body kicks, and head kicks',
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
                   }}/>
                 },
                 {
                   label: 'Elbows',
                   value: (fighter.total_stats?.TotalElbowsMade || 0) / (fighter.MinutesTracked || 1),
                   weightClassValue: weightClassAvgData ? (weightClassAvgData.TotalElbowsMade || 0) / (weightClassAvgData.minutes || 1) : 0,
                   description: 'Elbow strikes landed per minute, often used in close-range combat',
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
                   }}/>
                 }
               ].map((metric) => (
                 <Grid item xs={12} sm={6} md={3} key={metric.label}>
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
                         '& .spm-icon': {
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
                         className="spm-icon"
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
                         {metric.icon}
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
                         {metric.label}
                       </Typography>
                     </Box>

                     {/* Metrics */}
                     <Box sx={{ mb: 3 }}>
                       <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                         <Typography 
                           sx={{ 
                             fontSize: '2rem',
                             fontWeight: 700,
                             color: '#00F0FF',
                             textShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
                             fontFamily: 'monospace',
                           }}
                         >
                           {metric.value.toFixed(1)}
                         </Typography>
                         <Typography sx={{ 
                           color: 'rgba(255, 255, 255, 0.7)',
                           fontFamily: 'monospace',
                         }}>
                           /min
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
                             {metric.weightClassValue.toFixed(1)} /min
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
                         {metric.description}
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
                         <span style={{ color: '#00F0FF' }}>
                           {metric.value.toFixed(1)}/min
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
                             width: `${Math.min(100, (metric.value / Math.max(metric.weightClassValue, 1)) * 50)}%`,
                             height: '100%',
                             background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
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
                               {metric.weightClassValue.toFixed(1)}/min
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
                                 width: '50%',
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

             {/* Radar Chart Section */}
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
                 Strikes Per Minute Radar Analysis
               </Typography>
               
               <Box sx={{
                 p: 4,
                 borderRadius: '12px',
                 bgcolor: 'rgba(10, 14, 23, 0.4)',
                 border: '1px solid rgba(0, 240, 255, 0.15)',
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
                 <Box sx={{ 
                   height: 400, 
                   width: '100%', 
                   position: 'relative',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center'
                 }}>
                   <ResponsiveContainer>
                     <RadarChart data={prepareSPMRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
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
               </Box>
             </Collapse>
           </Box>
         </Grid>

        {/* Accuracy Metrics Section */}
        <Grid item xs={12}>
          <Box sx={ratingCardStyles.collapsibleSection}>
            {/* Collapsible Header */}
            <Box 
              sx={ratingCardStyles.sectionHeader}
              onClick={() => toggleSection('accuracy')}
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
                      width: '24px',
                      height: '24px',
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
                  Striking Accuracy Analysis
                </Typography>
              </Box>
              <IconButton
                sx={ratingCardStyles.expandIcon}
                className={collapsedSections.accuracy ? '' : 'expanded'}
              >
                {collapsedSections.accuracy ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={!collapsedSections.accuracy}>
              <Box sx={{ p: 4 }}>

            <Box sx={{ mb: 4 }}>
              <Typography 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 2,
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
                Detailed breakdown of striking accuracy across different techniques compared to weight class averages
              </Typography>
              
              {/* Ground Strikes Toggle - Integrated */}
              <Box sx={{
                p: 2,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(0, 102, 255, 0.02) 100%)',
                border: '1px solid rgba(0, 240, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(0, 102, 255, 0.04) 100%)',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(10, 14, 23, 0.8), rgba(10, 14, 23, 0.6))',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                  }}>
                    <Box sx={{
                      width: '16px',
                      height: '16px',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: excludeGroundStrikes ? '#00F0FF' : 'rgba(255, 255, 255, 0.5)',
                        boxShadow: excludeGroundStrikes ? '0 0 8px rgba(0, 240, 255, 0.5)' : 'none',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        opacity: excludeGroundStrikes ? 0.8 : 0.3,
                      }
                    }}/>
                  </Box>
                  <Box>
                    <Typography sx={{
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      mb: 0.5,
                    }}>
                      Exclude Ground Strikes
                    </Typography>
                    <Typography sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.8rem',
                    }}>
                      {excludeGroundStrikes ? 'Ground strikes excluded from calculations' : 'Include all strikes in accuracy analysis'}
                    </Typography>
                  </Box>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={excludeGroundStrikes}
                      onChange={(e) => setExcludeGroundStrikes(e.target.checked)}
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
                        '& .MuiSwitch-thumb': {
                          backgroundColor: excludeGroundStrikes ? '#00F0FF' : '#FFFFFF',
                          boxShadow: excludeGroundStrikes ? '0 0 10px rgba(0, 240, 255, 0.5)' : 'none',
                        },
                      }}
                    />
                  }
                  label=""
                  sx={{ ml: 0 }}
                />
              </Box>
            </Box>

            <Grid container spacing={4}>
              {[
                {
                  label: 'Overall Striking',
                  value: accuracyMetrics.overallStrikingAccuracy,
                  weightClassValue: weightClassAccuracyMetrics.overallStrikingAccuracy,
                  description: 'Overall accuracy of all strikes including punches, kicks, and elbows',
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
                      borderRadius: '50%',
                      boxShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                    }
                  }}/>
                },
                {
                  label: 'Punch Accuracy',
                  value: accuracyMetrics.punchAccuracy,
                  weightClassValue: weightClassAccuracyMetrics.punchAccuracy,
                  description: 'Accuracy of all punch types including jabs, hooks, straights, and uppercuts',
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
                  }}/>
                },
                {
                  label: 'Kick Accuracy',
                  value: accuracyMetrics.kickAccuracy,
                  weightClassValue: weightClassAccuracyMetrics.kickAccuracy,
                  description: 'Accuracy of all kick types including leg kicks, body kicks, and head kicks',
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
                  }}/>
                },
                {
                  label: 'Elbow Accuracy',
                  value: accuracyMetrics.elbowAccuracy,
                  weightClassValue: weightClassAccuracyMetrics.elbowAccuracy,
                  description: 'Accuracy of elbow strikes, often used in close-range combat',
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
                  }}/>
                }
              ].map((metric) => (
                <Grid item xs={12} sm={6} md={3} key={metric.label}>
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
                        '& .accuracy-icon': {
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
                        className="accuracy-icon"
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
                        {metric.icon}
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
                        {metric.label}
                      </Typography>
                    </Box>

                    {/* Metrics */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                        <Typography 
                          sx={{ 
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: '#00F0FF',
                            textShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
                            fontFamily: 'monospace',
                          }}
                        >
                          {metric.label === 'Power Strikes Landed Per Minute' ? `${metric.value.toFixed(2)}/min` : `${metric.value}%`}
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
                            {metric.label === 'Power Strikes Landed Per Minute' ? `${metric.weightClassValue.toFixed(2)}/min` : `${metric.weightClassValue}%`}
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
                        {metric.description}
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
                        <span>Fighter Accuracy</span>
                        <span style={{ color: '#00F0FF' }}>
                          {metric.label === 'Power Strikes Landed Per Minute' ? `${metric.value.toFixed(2)}/min` : `${metric.value}%`}
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
                              width: metric.label === 'Power Strikes Landed Per Minute' 
                                ? `${Math.min(100, (metric.value / Math.max(metric.weightClassValue, 1)) * 50)}%`
                                : `${metric.value}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
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
                              <span>{metric.label === 'Power Strikes Landed Per Minute' ? 'Class Rate' : 'Class Average'}</span>
                              <span style={{ color: '#FF3864' }}>
                                {metric.label === 'Power Strikes Landed Per Minute' ? `${metric.weightClassValue.toFixed(2)}/min` : `${metric.weightClassValue}%`}
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
                              width: metric.label === 'Power Strikes Landed Per Minute' 
                                ? '50%'
                                : `${metric.weightClassValue}%`,
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

             {/* Radar Chart Section */}
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
                 Striking Accuracy Radar Analysis
               </Typography>
               
               <Box sx={{
                 p: 4,
                 borderRadius: '12px',
                 bgcolor: 'rgba(10, 14, 23, 0.4)',
                 border: '1px solid rgba(0, 240, 255, 0.15)',
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
                 <Box sx={{ 
                   height: 400, 
                   width: '100%', 
                   position: 'relative',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center'
                 }}>
                   <ResponsiveContainer>
                     <RadarChart data={prepareAccuracyRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
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
               </Box>
             </Collapse>
           </Box>
         </Grid>

        {/* Power Metrics Section */}
        <Grid item xs={12}>
          <Box sx={ratingCardStyles.collapsibleSection}>
            {/* Collapsible Header */}
            <Box 
              sx={ratingCardStyles.sectionHeader}
              onClick={() => toggleSection('power')}
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
                      width: '24px',
                      height: '24px',
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
                  Power Analysis
                </Typography>
              </Box>
              <IconButton
                sx={ratingCardStyles.expandIcon}
                className={collapsedSections.power ? '' : 'expanded'}
              >
                {collapsedSections.power ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={!collapsedSections.power}>
              <Box sx={{ p: 4 }}>

            <Box sx={{ mb: 4 }}>
              <Typography 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 2,
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
                Analysis of power striking effectiveness and knockout efficiency compared to weight class averages
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {[
                {
                  label: 'Power Punch Accuracy',
                  value: powerMetrics.powerPunchAccuracy,
                  weightClassValue: weightClassPowerMetrics.powerPunchAccuracy,
                  description: 'Accuracy of power punches (hooks, uppercuts, overhands), showing effectiveness of high-damage strikes',
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
                  }}/>
                },
                {
                  label: 'Power Strikes Landed Per Minute',
                  value: powerMetrics.powerStrikesLandedPerMinute,
                  weightClassValue: weightClassPowerMetrics.powerStrikesLandedPerMinute,
                  description: 'Heavy-hitting strikes (hooks, uppercuts, overhands, head kicks) landed per minute, key for power punchers',
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
                      border: '2px solid #FFD700',
                      borderRadius: '50%',
                      boxShadow: '0 0 12px rgba(255, 215, 0, 0.5)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '20px',
                      height: '20px',
                      border: '2px solid #FFD700',
                      borderRadius: '50%',
                      opacity: 0.3,
                    }
                  }}/>
                },
                {
                  label: 'KO/TKO Win Rate Per Fight',
                  value: powerMetrics.koTkoWinRatePerFight,
                  weightClassValue: weightClassPowerMetrics.koTkoWinRatePerFight,
                  description: 'Average number of KO/TKO wins per fight, indicating finishing power and knockout ability',
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
                      boxShadow: '0 0 12px rgba(255, 56, 100, 0.5)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '20px',
                      height: '20px',
                      border: '2px solid #FF3864',
                      borderRadius: '50%',
                      opacity: 0.3,
                    }
                  }}/>
                }
              ].map((metric) => (
                <Grid item xs={12} sm={6} md={4} key={metric.label}>
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
                        '& .power-icon': {
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
                        className="power-icon"
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
                        {metric.icon}
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
                        {metric.label}
                      </Typography>
                    </Box>

                    {/* Metrics */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                        <Typography 
                          sx={{ 
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: '#00F0FF',
                            textShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
                            fontFamily: 'monospace',
                          }}
                        >
                          {metric.label === 'Power Strikes Landed Per Minute' ? `${metric.value.toFixed(2)}/min` : `${metric.value}%`}
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
                            {metric.label === 'Power Strikes Landed Per Minute' ? `${metric.weightClassValue.toFixed(2)}/min` : `${metric.weightClassValue}%`}
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
                        {metric.description}
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
                        <span>{metric.label === 'Power Strikes Landed Per Minute' ? 'Fighter Rate' : 'Fighter Power'}</span>
                        <span style={{ color: '#00F0FF' }}>
                          {metric.label === 'Power Strikes Landed Per Minute' ? `${metric.value.toFixed(2)}/min` : `${metric.value}%`}
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
                            width: metric.label === 'Power Strikes Landed Per Minute' 
                              ? `${Math.min(100, (metric.value / Math.max(metric.weightClassValue, 1)) * 50)}%`
                              : `${metric.value}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
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
                            <span>{metric.label === 'Power Strikes Landed Per Minute' ? 'Class Rate' : 'Class Average'}</span>
                            <span style={{ color: '#FF3864' }}>
                              {metric.label === 'Power Strikes Landed Per Minute' ? `${metric.weightClassValue.toFixed(2)}/min` : `${metric.weightClassValue}%`}
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
                                width: metric.label === 'Power Strikes Landed Per Minute' 
                                  ? '50%'
                                  : `${metric.weightClassValue}%`,
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

            {/* Radar Chart Section */}
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
                Power Analysis Radar
              </Typography>
              
              <Box sx={{
                p: 4,
                borderRadius: '12px',
                bgcolor: 'rgba(10, 14, 23, 0.4)',
                border: '1px solid rgba(0, 240, 255, 0.15)',
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
                <Box sx={{ 
                  height: 400, 
                  width: '100%', 
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ResponsiveContainer>
                    <RadarChart data={preparePowerRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
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
               </Box>
             </Collapse>
           </Box>
         </Grid>

         {/* Strike Selection Section */}
         <Grid item xs={12}>
           <Box sx={ratingCardStyles.collapsibleSection}>
             {/* Collapsible Header */}
             <Box 
               sx={ratingCardStyles.sectionHeader}
               onClick={() => toggleSection('strikeSelection')}
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
                       width: '20px',
                       height: '20px',
                       borderRadius: '50%',
                       border: '2px solid #00F0FF',
                       boxShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                       clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)',
                     },
                     '&::after': {
                       content: '""',
                       position: 'absolute',
                       top: '50%',
                       left: '50%',
                       transform: 'translate(-50%, -50%)',
                       width: '12px',
                       height: '12px',
                       borderRadius: '50%',
                       background: '#00F0FF',
                       opacity: 0.6,
                     }
                   }}/>
                 </Box>
                 <Typography sx={{
                   ...ratingCardStyles.title,
                   fontSize: '1.3rem',
                 }}>
                   Strike Selection Analysis
                 </Typography>
               </Box>
               <IconButton
                 sx={ratingCardStyles.expandIcon}
                 className={collapsedSections.strikeSelection ? '' : 'expanded'}
               >
                 {collapsedSections.strikeSelection ? <ExpandMore /> : <ExpandLess />}
               </IconButton>
             </Box>

             {/* Collapsible Content */}
             <Collapse in={!collapsedSections.strikeSelection}>
               <Box sx={{ p: 4 }}>

             <Box sx={{ mb: 4 }}>
               <Typography 
                 sx={{ 
                   color: 'rgba(255, 255, 255, 0.7)',
                   mb: 2,
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
                 Breakdown of strike selection percentages showing the distribution of different techniques used
               </Typography>
             </Box>

             {/* Strike Selection Charts */}
             <Grid container spacing={4}>
               {/* Left Hand Stats */}
               <Grid item xs={12} md={6}>
                 <Box sx={{
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
                      Left Side Strike Selection
                    </Typography>
                   
                   {/* Left Hand Strike Categories */}
                   {(() => {
                     const leftStats = fighter.left_hand_stats || {};
                     
                     // Calculate totals for each category
                     const categories = {
                       'Body Kicks': (leftStats.LeftBodyKickMake || 0) + (leftStats.LeftBodyKickMiss || 0),
                       'Cross': (leftStats.LeftCrossMake || 0) + (leftStats.LeftCrossMissed || 0),
                       'Elbow': (leftStats.LeftElbowMake || 0) + (leftStats.LeftElbowMiss || 0),
                       'High Kicks': (leftStats.LeftHighKickMake || 0) + (leftStats.LeftHighKickMiss || 0),
                       'Hooks': (leftStats.LeftHookHiMake || 0) + (leftStats.LeftHookHiMiss || 0) + (leftStats.LeftHookLoMake || 0) + (leftStats.LeftHookLoMiss || 0),
                       'Jabs': (leftStats.LeftJabHiMake || 0) + (leftStats.LeftJabHiMiss || 0) + (leftStats.LeftJabLoMake || 0) + (leftStats.LeftJabLoMiss || 0),
                       'Leg Kicks': (leftStats.LeftLegKickMake || 0) + (leftStats.LeftLegKickMiss || 0),
                       'Overhand': (leftStats.LeftOverhandMake || 0) + (leftStats.LeftOverhandMiss || 0),
                       'Spin Back Fist': (leftStats.LeftSpinBackFistMake || 0) + (leftStats.LeftSpinBackFistMiss || 0),
                       'Straights': (leftStats.LeftStraightHiMake || 0) + (leftStats.LeftStraightHiMiss || 0) + (leftStats.LeftStraightLoMake || 0) + (leftStats.LeftStraightLoMiss || 0),
                       'Uppercuts': (leftStats.LeftUppercutHiMake || 0) + (leftStats.LeftUppercutHiMiss || 0) + (leftStats.LeftUppercutLoMake || 0) + (leftStats.LeftUppercutLoMiss || 0)
                     };
                     
                     const totalStrikes = Object.values(categories).reduce((sum, count) => sum + count, 0);
                     
                     if (totalStrikes === 0) {
                       return (
                         <Box sx={{
                           p: 3,
                           borderRadius: '8px',
                           background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                           border: '1px solid rgba(255, 255, 255, 0.1)',
                           backdropFilter: 'blur(5px)',
                           textAlign: 'center',
                         }}>
                           <Typography sx={{
                             color: 'rgba(255, 255, 255, 0.6)',
                             fontSize: '0.9rem',
                             fontStyle: 'italic',
                           }}>
                             No left hand strike data available
                           </Typography>
                         </Box>
                       );
                     }
                     
                     return (
                       <Box sx={{ space: 2 }}>
                         {Object.entries(categories)
                           .filter(([_, count]) => count > 0)
                           .sort(([_, a], [__, b]) => b - a)
                           .map(([category, count], index) => {
                             const percentage = ((count / totalStrikes) * 100).toFixed(1);
                             const landed = category === 'Body Kicks' ? (leftStats.LeftBodyKickMake || 0) :
                                           category === 'Cross' ? (leftStats.LeftCrossMake || 0) :
                                           category === 'Elbow' ? (leftStats.LeftElbowMake || 0) :
                                           category === 'High Kicks' ? (leftStats.LeftHighKickMake || 0) :
                                           category === 'Hooks' ? (leftStats.LeftHookHiMake || 0) + (leftStats.LeftHookLoMake || 0) :
                                           category === 'Jabs' ? (leftStats.LeftJabHiMake || 0) + (leftStats.LeftJabLoMake || 0) :
                                           category === 'Leg Kicks' ? (leftStats.LeftLegKickMake || 0) :
                                           category === 'Overhand' ? (leftStats.LeftOverhandMake || 0) :
                                           category === 'Spin Back Fist' ? (leftStats.LeftSpinBackFistMake || 0) :
                                           category === 'Straights' ? (leftStats.LeftStraightHiMake || 0) + (leftStats.LeftStraightLoMake || 0) :
                                           category === 'Uppercuts' ? (leftStats.LeftUppercutHiMake || 0) + (leftStats.LeftUppercutLoMake || 0) : 0;
                             const accuracy = count > 0 ? ((landed / count) * 100).toFixed(1) : '0.0';
                             
                             return (
                               <Box key={category} sx={{ mb: 2 }}>
                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                   <Typography sx={{
                                     color: '#FFFFFF',
                                     fontSize: '0.9rem',
                                     fontWeight: 600,
                                     textTransform: 'uppercase',
                                     letterSpacing: '0.05em',
                                   }}>
                                     {category}
                                   </Typography>
                                   <Box sx={{ textAlign: 'right' }}>
                                     <Typography sx={{
                                       color: '#00F0FF',
                                       fontSize: '0.9rem',
                                       fontWeight: 700,
                                       fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                     }}>
                                       {percentage}%
                                     </Typography>
                                                                           <Typography sx={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                      }}>
                                        {accuracy}% accuracy
                                      </Typography>
                                   </Box>
                                 </Box>
                                 <Box sx={{
                                   height: 6,
                                   borderRadius: 3,
                                   bgcolor: 'rgba(10, 14, 23, 0.6)',
                                   border: '1px solid rgba(0, 240, 255, 0.1)',
                                   overflow: 'hidden',
                                   position: 'relative',
                                 }}>
                                   <Box sx={{
                                     width: `${percentage}%`,
                                     height: '100%',
                                     background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
                                     borderRadius: 3,
                                     transition: 'width 0.3s ease',
                                     position: 'relative',
                                     '&::after': {
                                       content: '""',
                                       position: 'absolute',
                                       top: 0,
                                       right: 0,
                                       width: '2px',
                                       height: '100%',
                                       background: '#fff',
                                       opacity: 0.5,
                                       filter: 'blur(1px)',
                                     }
                                   }} />
                                 </Box>
                               </Box>
                             );
                           })}
                       </Box>
                     );
                   })()}
                 </Box>
               </Grid>

               {/* Right Hand Stats */}
               <Grid item xs={12} md={6}>
                 <Box sx={{
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
                      Right Side Strike Selection
                    </Typography>
                   
                   {/* Right Hand Strike Categories */}
                   {(() => {
                     const rightStats = fighter.right_hand_stats || {};
                     
                     // Calculate totals for each category
                     const categories = {
                       'Body Kicks': (rightStats.RightBodyKickMake || 0) + (rightStats.RightBodyKickMiss || 0),
                       'Cross': (rightStats.RightCrossMake || 0) + (rightStats.RightCrossMissed || 0),
                       'Elbow': (rightStats.RightElbowMake || 0) + (rightStats.RightElbowMiss || 0),
                       'High Kicks': (rightStats.RightHighKickMake || 0) + (rightStats.RightHighKickMiss || 0),
                       'Hooks': (rightStats.RightHookHiMake || 0) + (rightStats.RightHookHiMiss || 0) + (rightStats.RightHookLoMake || 0) + (rightStats.RightHookLoMiss || 0),
                       'Jabs': (rightStats.RightJabHiMake || 0) + (rightStats.RightJabHiMiss || 0) + (rightStats.RightJabLoMake || 0) + (rightStats.RightJabLoMiss || 0),
                       'Leg Kicks': (rightStats.RightLegKickMake || 0) + (rightStats.RightLegKickMiss || 0),
                       'Overhand': (rightStats.RightOverhandMake || 0) + (rightStats.RightOverhandMiss || 0),
                       'Spin Back Fist': (rightStats.RightSpinBackFistMake || 0) + (rightStats.RightSpinBackFistMiss || 0),
                       'Straights': (rightStats.RightStraightHiMake || 0) + (rightStats.RightStraightHiMiss || 0) + (rightStats.RightStraightLoMake || 0) + (rightStats.RightStraightLoMiss || 0),
                       'Uppercuts': (rightStats.RightUppercutHiMake || 0) + (rightStats.RightUppercutHiMiss || 0) + (rightStats.RightUppercutLoMake || 0) + (rightStats.RightUppercutLoMiss || 0)
                     };
                     
                     const totalStrikes = Object.values(categories).reduce((sum, count) => sum + count, 0);
                     
                     if (totalStrikes === 0) {
                       return (
                         <Box sx={{
                           p: 3,
                           borderRadius: '8px',
                           background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                           border: '1px solid rgba(255, 255, 255, 0.1)',
                           backdropFilter: 'blur(5px)',
                           textAlign: 'center',
                         }}>
                           <Typography sx={{
                             color: 'rgba(255, 255, 255, 0.6)',
                             fontSize: '0.9rem',
                             fontStyle: 'italic',
                           }}>
                             No right hand strike data available
                           </Typography>
                         </Box>
                       );
                     }
                     
                     return (
                       <Box sx={{ space: 2 }}>
                         {Object.entries(categories)
                           .filter(([_, count]) => count > 0)
                           .sort(([_, a], [__, b]) => b - a)
                           .map(([category, count], index) => {
                             const percentage = ((count / totalStrikes) * 100).toFixed(1);
                             const landed = category === 'Body Kicks' ? (rightStats.RightBodyKickMake || 0) :
                                           category === 'Cross' ? (rightStats.RightCrossMake || 0) :
                                           category === 'Elbow' ? (rightStats.RightElbowMake || 0) :
                                           category === 'High Kicks' ? (rightStats.RightHighKickMake || 0) :
                                           category === 'Hooks' ? (rightStats.RightHookHiMake || 0) + (rightStats.RightHookLoMake || 0) :
                                           category === 'Jabs' ? (rightStats.RightJabHiMake || 0) + (rightStats.RightJabLoMake || 0) :
                                           category === 'Leg Kicks' ? (rightStats.RightLegKickMake || 0) :
                                           category === 'Overhand' ? (rightStats.RightOverhandMake || 0) :
                                           category === 'Spin Back Fist' ? (rightStats.RightSpinBackFistMake || 0) :
                                           category === 'Straights' ? (rightStats.RightStraightHiMake || 0) + (rightStats.RightStraightLoMake || 0) :
                                           category === 'Uppercuts' ? (rightStats.RightUppercutHiMake || 0) + (rightStats.RightUppercutLoMake || 0) : 0;
                             const accuracy = count > 0 ? ((landed / count) * 100).toFixed(1) : '0.0';
                             
                             return (
                               <Box key={category} sx={{ mb: 2 }}>
                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                   <Typography sx={{
                                     color: '#FFFFFF',
                                     fontSize: '0.9rem',
                                     fontWeight: 600,
                                     textTransform: 'uppercase',
                                     letterSpacing: '0.05em',
                                   }}>
                                     {category}
                                   </Typography>
                                   <Box sx={{ textAlign: 'right' }}>
                                     <Typography sx={{
                                       color: '#00F0FF',
                                       fontSize: '0.9rem',
                                       fontWeight: 700,
                                       fontFamily: '"Orbitron", "Roboto Mono", monospace',
                                     }}>
                                       {percentage}%
                                     </Typography>
                                                                           <Typography sx={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                      }}>
                                        {accuracy}% accuracy
                                      </Typography>
                                   </Box>
                                 </Box>
                                 <Box sx={{
                                   height: 6,
                                   borderRadius: 3,
                                   bgcolor: 'rgba(10, 14, 23, 0.6)',
                                   border: '1px solid rgba(0, 240, 255, 0.1)',
                                   overflow: 'hidden',
                                   position: 'relative',
                                 }}>
                                   <Box sx={{
                                     width: `${percentage}%`,
                                     height: '100%',
                                     background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
                                     borderRadius: 3,
                                     transition: 'width 0.3s ease',
                                     position: 'relative',
                                     '&::after': {
                                       content: '""',
                                       position: 'absolute',
                                       top: 0,
                                       right: 0,
                                       width: '2px',
                                       height: '100%',
                                       background: '#fff',
                                       opacity: 0.5,
                                       filter: 'blur(1px)',
                                     }
                                   }} />
                                 </Box>
                               </Box>
                             );
                           })}
                       </Box>
                     );
                   })()}
                 </Box>
               </Grid>
             </Grid>

             {/* Combined Strike Selection Summary */}
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
                 Combined Strike Selection Summary
               </Typography>
               
               <Grid container spacing={3}>
                 {(() => {
                   const leftStats = fighter.left_hand_stats || {};
                   const rightStats = fighter.right_hand_stats || {};
                   
                   // Calculate combined totals for each category
                   const combinedCategories = {
                     'Body Kicks': ((leftStats.LeftBodyKickMake || 0) + (leftStats.LeftBodyKickMiss || 0)) + ((rightStats.RightBodyKickMake || 0) + (rightStats.RightBodyKickMiss || 0)),
                     'Cross': ((leftStats.LeftCrossMake || 0) + (leftStats.LeftCrossMissed || 0)) + ((rightStats.RightCrossMake || 0) + (rightStats.RightCrossMissed || 0)),
                     'Elbow': ((leftStats.LeftElbowMake || 0) + (leftStats.LeftElbowMiss || 0)) + ((rightStats.RightElbowMake || 0) + (rightStats.RightElbowMiss || 0)),
                     'High Kicks': ((leftStats.LeftHighKickMake || 0) + (leftStats.LeftHighKickMiss || 0)) + ((rightStats.RightHighKickMake || 0) + (rightStats.RightHighKickMiss || 0)),
                     'Hooks': ((leftStats.LeftHookHiMake || 0) + (leftStats.LeftHookHiMiss || 0) + (leftStats.LeftHookLoMake || 0) + (leftStats.LeftHookLoMiss || 0)) + ((rightStats.RightHookHiMake || 0) + (rightStats.RightHookHiMiss || 0) + (rightStats.RightHookLoMake || 0) + (rightStats.RightHookLoMiss || 0)),
                     'Jabs': ((leftStats.LeftJabHiMake || 0) + (leftStats.LeftJabHiMiss || 0) + (leftStats.LeftJabLoMake || 0) + (leftStats.LeftJabLoMiss || 0)) + ((rightStats.RightJabHiMake || 0) + (rightStats.RightJabHiMiss || 0) + (rightStats.RightJabLoMake || 0) + (rightStats.RightJabLoMiss || 0)),
                     'Leg Kicks': ((leftStats.LeftLegKickMake || 0) + (leftStats.LeftLegKickMiss || 0)) + ((rightStats.RightLegKickMake || 0) + (rightStats.RightLegKickMiss || 0)),
                     'Overhand': ((leftStats.LeftOverhandMake || 0) + (leftStats.LeftOverhandMiss || 0)) + ((rightStats.RightOverhandMake || 0) + (rightStats.RightOverhandMiss || 0)),
                     'Spin Back Fist': ((leftStats.LeftSpinBackFistMake || 0) + (leftStats.LeftSpinBackFistMiss || 0)) + ((rightStats.RightSpinBackFistMake || 0) + (rightStats.RightSpinBackFistMiss || 0)),
                     'Straights': ((leftStats.LeftStraightHiMake || 0) + (leftStats.LeftStraightHiMiss || 0) + (leftStats.LeftStraightLoMake || 0) + (leftStats.LeftStraightLoMiss || 0)) + ((rightStats.RightStraightHiMake || 0) + (rightStats.RightStraightHiMiss || 0) + (rightStats.RightStraightLoMake || 0) + (rightStats.RightStraightLoMiss || 0)),
                     'Uppercuts': ((leftStats.LeftUppercutHiMake || 0) + (leftStats.LeftUppercutHiMiss || 0) + (leftStats.LeftUppercutLoMake || 0) + (leftStats.LeftUppercutLoMiss || 0)) + ((rightStats.RightUppercutHiMake || 0) + (rightStats.RightUppercutHiMiss || 0) + (rightStats.RightUppercutLoMake || 0) + (rightStats.RightUppercutLoMiss || 0))
                   };
                   
                   const totalStrikes = Object.values(combinedCategories).reduce((sum, count) => sum + count, 0);
                   
                   if (totalStrikes === 0) {
                     return (
                       <Grid item xs={12}>
                         <Box sx={{
                           p: 3,
                           borderRadius: '8px',
                           background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                           border: '1px solid rgba(255, 255, 255, 0.1)',
                           backdropFilter: 'blur(5px)',
                           textAlign: 'center',
                         }}>
                           <Typography sx={{
                             color: 'rgba(255, 255, 255, 0.6)',
                             fontSize: '0.9rem',
                             fontStyle: 'italic',
                           }}>
                             No combined strike data available
                           </Typography>
                         </Box>
                       </Grid>
                     );
                   }
                   
                   return Object.entries(combinedCategories)
                     .filter(([_, count]) => count > 0)
                     .sort(([_, a], [__, b]) => b - a)
                     .slice(0, 6) // Show top 6 categories
                     .map(([category, count]) => {
                       const percentage = ((count / totalStrikes) * 100).toFixed(1);
                       
                       return (
                         <Grid item xs={12} sm={6} md={4} key={category}>
                           <Box sx={{
                             p: 2,
                             borderRadius: '8px',
                             bgcolor: 'rgba(10, 14, 23, 0.4)',
                             border: '1px solid rgba(0, 240, 255, 0.15)',
                             height: '100%',
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
                             <Typography sx={{
                               color: '#FFFFFF',
                               fontSize: '0.9rem',
                               fontWeight: 600,
                               textTransform: 'uppercase',
                               letterSpacing: '0.05em',
                               mb: 1,
                             }}>
                               {category}
                             </Typography>
                             <Typography sx={{
                               color: '#00F0FF',
                               fontSize: '1.2rem',
                               fontWeight: 700,
                               fontFamily: '"Orbitron", "Roboto Mono", monospace',
                               mb: 1,
                             }}>
                               {percentage}%
                             </Typography>
                             
                           </Box>
                         </Grid>
                       );
                     });
                 })()}
               </Grid>
             </Box>
               </Box>
             </Collapse>
           </Box>
         </Grid>

         {/* Defense Section */}
         <Grid item xs={12}>
           <Box sx={ratingCardStyles.collapsibleSection}>
             {/* Collapsible Header */}
             <Box 
               sx={ratingCardStyles.sectionHeader}
               onClick={() => toggleSection('defense')}
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
                       height: '20px',
                       border: '2px solid #00F0FF',
                       borderRadius: '8px 8px 4px 4px',
                       boxShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                     },
                     '&::after': {
                       content: '""',
                       position: 'absolute',
                       top: '50%',
                       left: '50%',
                       transform: 'translate(-50%, -50%)',
                       width: '6px',
                       height: '6px',
                       background: '#00F0FF',
                       borderRadius: '50%',
                       opacity: 0.6,
                     }
                   }}/>
                 </Box>
                 <Typography sx={{
                   ...ratingCardStyles.title,
                   fontSize: '1.3rem',
                 }}>
                   Defense Analysis
                 </Typography>
               </Box>
               <IconButton
                 sx={ratingCardStyles.expandIcon}
                 className={collapsedSections.defense ? '' : 'expanded'}
               >
                 {collapsedSections.defense ? <ExpandMore /> : <ExpandLess />}
               </IconButton>
             </Box>

             {/* Collapsible Content */}
             <Collapse in={!collapsedSections.defense}>
               <Box sx={{ p: 4 }}>

             <Box sx={{ mb: 4 }}>
               <Typography 
                 sx={{ 
                   color: 'rgba(255, 255, 255, 0.7)',
                   mb: 2,
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
                 Analysis of defensive effectiveness and strike absorption compared to weight class averages
               </Typography>
             </Box>

                          <Grid container spacing={4}>
               {[
                 {
                   label: 'Strikes Absorbed/Min',
                   value: defenseMetrics.strikesAbsorbedPerMinute,
                   weightClassValue: weightClassDefenseMetrics.strikesAbsorbedPerMinute,
                   description: 'Strikes absorbed per minute vs weight class average. Lower is better.',
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
                       borderRadius: '50%',
                       boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                     },
                     '&::after': {
                       content: '""',
                       position: 'absolute',
                       top: '50%',
                       left: '50%',
                       transform: 'translate(-50%, -50%)',
                       width: '24px',
                       height: '24px',
                       border: '2px solid #00F0FF',
                       borderRadius: '50%',
                       opacity: 0.3,
                     }
                   }}/>
                 },
                 {
                   label: 'Knockdowns/Fight',
                   value: defenseMetrics.knockdownAbsorptionRatePerFight,
                   weightClassValue: weightClassDefenseMetrics.knockdownAbsorptionRatePerFight,
                   description: 'Knockdowns absorbed per fight vs weight class average. Lower shows better chin.',
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
                       background: '#FF3864',
                       borderRadius: '50%',
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
                       border: '2px solid #FF3864',
                       borderRadius: '50%',
                       opacity: 0.3,
                     }
                   }}/>
                 },
                 {
                   label: 'Stuns/Fight',
                   value: defenseMetrics.stunAbsorptionRatePerFight,
                   weightClassValue: weightClassDefenseMetrics.stunAbsorptionRatePerFight,
                   description: 'Stuns absorbed per fight vs weight class average. Lower indicates better recovery.',
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
                       width: '14px',
                       height: '14px',
                       background: '#FFD700',
                       borderRadius: '50%',
                       boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                     },
                     '&::after': {
                       content: '""',
                       position: 'absolute',
                       top: '50%',
                       left: '50%',
                       transform: 'translate(-50%, -50%)',
                       width: '22px',
                       height: '22px',
                       border: '2px solid #FFD700',
                       borderRadius: '50%',
                       opacity: 0.3,
                     }
                   }}/>
                 }
               ].map((metric, index) => (
                 <Grid item xs={12} md={4} key={index}>
                   <Box sx={ratingCardStyles.card}>
                     <Box sx={ratingCardStyles.header}>
                       <Box sx={ratingCardStyles.icon}>
                         {metric.icon}
                       </Box>
                       <Typography sx={ratingCardStyles.title}>
                         {metric.label}
                       </Typography>
                     </Box>
                     
                     <Typography sx={ratingCardStyles.description}>
                       {metric.description}
                     </Typography>
                     
                     {/* Progress Bar */}
                     <Box sx={{ mb: 2 }}>
                       <Box sx={{
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                         mb: 1,
                       }}>
                         <Typography sx={{
                           color: '#00F0FF',
                           fontSize: '1.5rem',
                           fontWeight: 700,
                           fontFamily: '"Orbitron", "Roboto Mono", monospace',
                         }}>
                           {metric.label === 'Strikes Absorbed/Min' ? `${metric.value.toFixed(2)}/min` :
                            metric.label === 'Knockdowns/Fight' ? `${metric.value.toFixed(2)}/fight` :
                            metric.label === 'Stuns/Fight' ? `${metric.value.toFixed(2)}/fight` :
                            `${metric.value.toFixed(2)}`}
                         </Typography>
                         <Typography sx={{
                           color: 'rgba(255, 255, 255, 0.6)',
                           fontSize: '0.9rem',
                         }}>
                           Class Avg: {metric.label === 'Strikes Absorbed/Min' ? `${metric.weightClassValue.toFixed(2)}/min` :
                                      metric.label === 'Knockdowns/Fight' ? `${metric.weightClassValue.toFixed(2)}/fight` :
                                      metric.label === 'Stuns/Fight' ? `${metric.weightClassValue.toFixed(2)}/fight` :
                                      `${metric.weightClassValue.toFixed(2)}`}
                         </Typography>
                       </Box>
                       
                       {/* Progress Bar */}
                       <Box sx={{
                         width: '100%',
                         height: '8px',
                         bgcolor: 'rgba(0, 240, 255, 0.1)',
                         borderRadius: '4px',
                         overflow: 'hidden',
                         position: 'relative',
                       }}>
                         <Box sx={{
                           width: `${Math.min(100, (metric.value / Math.max(metric.weightClassValue, 1)) * 100)}%`,
                           height: '100%',
                           background: 'linear-gradient(90deg, #00F0FF, #0066FF)',
                           borderRadius: '4px',
                           transition: 'width 0.3s ease',
                           boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
                         }} />
                       </Box>
                     </Box>
                   </Box>
                 </Grid>
               ))}
             </Grid>

               {/* Defense Strike Types Radar Chart */}
               <Box sx={{ mt: 6 }}>
                 <Typography sx={{
                   color: '#fff',
                   fontWeight: 600,
                   fontSize: '1.1rem',
                   mb: 3,
                   textAlign: 'center',
                   textTransform: 'uppercase',
                   letterSpacing: '0.05em',
                 }}>
                   Defense Strike Types Analysis
                 </Typography>
                 
                 <Box sx={{
                   p: 3,
                   borderRadius: '12px',
                   background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(0, 102, 255, 0.02) 100%)',
                   border: '1px solid rgba(0, 240, 255, 0.15)',
                   backdropFilter: 'blur(10px)',
                 }}>
                   <Box sx={{ 
                     height: 400, 
                     width: '100%', 
                     position: 'relative',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                   }}>
                     <ResponsiveContainer>
                       <RadarChart data={prepareDefenseStrikeTypesRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
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
              
                 </Box>
               </Collapse>
             </Box>
           </Grid>


       </Grid>
     </Paper>
   );
 };

export default StrikingInfo; 