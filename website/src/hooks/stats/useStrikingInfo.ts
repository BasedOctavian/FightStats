import React from 'react';
import { Fighter } from '../../types/firestore';

interface TopStrike {
  name: string;
  landed: number;
  thrown: number;
  accuracy: number;
  percentage: number;
  landedPerRound: number;
  landedPerMinute: number;
  description: string;
}

interface StrikingInfoData {
  topStrikes: TopStrike[];
  totalStrikesLanded: number;
  totalStrikesThrown: number;
  overallAccuracy: number;
  accuracyMetrics: {
    overallStrikingAccuracy: number;
    punchAccuracy: number;
    kickAccuracy: number;
    elbowAccuracy: number;
  };
  weightClassAccuracyMetrics: {
    overallStrikingAccuracy: number;
    punchAccuracy: number;
    kickAccuracy: number;
    elbowAccuracy: number;
  };
  powerMetrics: {
    powerPunchAccuracy: number;
    koTkoWinRatePerFight: number;
    powerStrikesLandedPerMinute: number;
  };
  weightClassPowerMetrics: {
    powerPunchAccuracy: number;
    koTkoWinRatePerFight: number;
    powerStrikesLandedPerMinute: number;
  };
  defenseMetrics: {
    strikesAbsorbedPerMinute: number;
    knockdownAbsorptionRatePerFight: number;
    stunAbsorptionRatePerFight: number;
  };
  weightClassDefenseMetrics: {
    strikesAbsorbedPerMinute: number;
    knockdownAbsorptionRatePerFight: number;
    stunAbsorptionRatePerFight: number;
  };
}

export const useStrikingInfo = (fighter: Fighter, weightClassAvgData?: any, excludeGroundStrikes: boolean = false): StrikingInfoData => {
  const calculateTopStrikes = React.useCallback((): TopStrike[] => {
    const stats = fighter.total_stats;
    if (!stats) return [];

    // Define all available strike types with their corresponding fields
    const strikeTypes = [
      {
        name: 'Jab',
        landed: stats.TotalJabsMade || 0,
        thrown: stats.TotalJabsThrown || 0,
        description: 'Quick, straight punches used to set up combinations and control distance'
      },
      {
        name: 'Straight',
        landed: stats.TotalStraightsMade || 0,
        thrown: stats.TotalStraightsThrown || 0,
        description: 'Powerful straight punches thrown with full extension'
      },
      {
        name: 'Hook',
        landed: stats.TotalHooksMade || 0,
        thrown: stats.TotalHooksThrown || 0,
        description: 'Curved punches thrown with a bent arm, targeting head or body'
      },
      {
        name: 'Uppercut',
        landed: stats.TotalUppercutsMade || 0,
        thrown: stats.TotalUppercutsThrown || 0,
        description: 'Vertical punches thrown upward, often targeting the chin'
      },
      {
        name: 'Leg Kick',
        landed: stats.TotalLegKicksMade || 0,
        thrown: stats.TotalLegKicksThrown || 0,
        description: 'Low kicks targeting the opponent\'s legs to reduce mobility'
      },
      {
        name: 'Body Kick',
        landed: stats.TotalBodyKicksMade || 0,
        thrown: stats.TotalBodyKicksThrown || 0,
        description: 'Mid-level kicks targeting the torso and ribs'
      },
      {
        name: 'Head Kick',
        landed: stats.TotalHighKicksMade || 0,
        thrown: stats.TotalHighKicksThrown || 0,
        description: 'High kicks targeting the head, often used for knockouts'
      },
      {
        name: 'Elbow',
        landed: stats.TotalElbowsMade || 0,
        thrown: stats.TotalElbowsThrown || 0,
        description: 'Close-range strikes using the elbow, highly effective in clinch'
      },
      {
        name: 'Overhand',
        landed: stats.TotalOverhandsMade || 0,
        thrown: stats.TotalOverhandsThrown || 0,
        description: 'Arcing punches thrown over the opponent\'s guard'
      },
      {
        name: 'Spin Back Fist',
        landed: stats.TotalSpinBackFistsMade || 0,
        thrown: stats.TotalSpinBackFistsThrown || 0,
        description: 'Spinning strikes using the back of the fist, often surprising'
      }
    ];

    // Calculate accuracy and percentage for each strike type
    const strikesWithStats = strikeTypes.map(strike => {
      const accuracy = strike.thrown > 0 ? (strike.landed / strike.thrown) * 100 : 0;
      const totalStrikesLanded = stats.TotalStrikesLanded || 0;
      const percentage = totalStrikesLanded > 0 ? (strike.landed / totalStrikesLanded) * 100 : 0;
      
      // Calculate per round and per minute rates
      const roundsTracked = fighter.RoundsTracked || 0;
      const minutesTracked = fighter.MinutesTracked || 0;
      
      const landedPerRound = roundsTracked > 0 ? strike.landed / roundsTracked : 0;
      const landedPerMinute = minutesTracked > 0 ? strike.landed / minutesTracked : 0;

      return {
        ...strike,
        accuracy: Math.round(accuracy * 10) / 10, // Round to 1 decimal place
        percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
        landedPerRound: Math.round(landedPerRound * 10) / 10, // Round to 1 decimal place
        landedPerMinute: Math.round(landedPerMinute * 100) / 100 // Round to 2 decimal places
      };
    });

    // Filter out strikes with no attempts and sort by landed strikes (descending)
    const validStrikes = strikesWithStats
      .filter(strike => strike.thrown > 0)
      .sort((a, b) => b.landed - a.landed);

    // Return top 3 strikes
    return validStrikes.slice(0, 3);
  }, [fighter.total_stats]);

  const calculateOverallStats = React.useCallback(() => {
    const stats = fighter.total_stats;
    if (!stats) {
      return {
        totalStrikesLanded: 0,
        totalStrikesThrown: 0,
        overallAccuracy: 0,
        accuracyMetrics: {
          overallStrikingAccuracy: 0,
          punchAccuracy: 0,
          kickAccuracy: 0,
          elbowAccuracy: 0
        }
      };
    }

    const totalStrikesLanded = stats.TotalStrikesLanded || 0;
    const totalStrikesThrown = stats.TotalStrikesThrown || 0;
    const overallAccuracy = totalStrikesThrown > 0 ? (totalStrikesLanded / totalStrikesThrown) * 100 : 0;

    // Calculate detailed accuracy metrics
    const groundStrikesLanded = excludeGroundStrikes ? (fighter.ground_stats?.TotalGroundStrikesMade || 0) : 0;
    const groundStrikesMissed = excludeGroundStrikes ? (fighter.ground_stats?.TotalGroundStrikesMissed || 0) : 0;
    
    const totalMissedStrikes = (
      (stats.TotalBodyKicksMissed || 0) +
      (stats.TotalElbowsMissed || 0) +
      (stats.TotalHighKicksMissed || 0) +
      (stats.TotalHooksMissed || 0) +
      (stats.TotalJabsMissed || 0) +
      (stats.TotalLegKicksMissed || 0) +
      (stats.TotalOverhandsMissed || 0) +
      (stats.TotalSpinBackFistsMissed || 0) +
      (stats.TotalStraightsMissed || 0) +
      (stats.TotalUppercutsMissed || 0)
    );

    const adjustedTotalStrikesLanded = totalStrikesLanded - groundStrikesLanded;
    const adjustedTotalMissedStrikes = totalMissedStrikes - groundStrikesMissed;

    const overallStrikingAccuracy = (adjustedTotalStrikesLanded + adjustedTotalMissedStrikes) > 0 
      ? (adjustedTotalStrikesLanded / (adjustedTotalStrikesLanded + adjustedTotalMissedStrikes)) * 100 
      : 0;

    const punchAccuracy = (stats.TotalPunchesThrown || 0) > 0 
      ? ((stats.TotalPunchesLanded || 0) / (stats.TotalPunchesThrown || 0)) * 100 
      : 0;

    const kickAccuracy = (stats.TotalKicksThrown || 0) > 0 
      ? ((stats.TotalKicksLanded || 0) / (stats.TotalKicksThrown || 0)) * 100 
      : 0;

    const elbowAccuracy = (stats.TotalElbowsThrown || 0) > 0 
      ? ((stats.TotalElbowsMade || 0) / (stats.TotalElbowsThrown || 0)) * 100 
      : 0;

    return {
      totalStrikesLanded,
      totalStrikesThrown,
      overallAccuracy: Math.round(overallAccuracy * 10) / 10,
      accuracyMetrics: {
        overallStrikingAccuracy: Math.round(overallStrikingAccuracy * 10) / 10,
        punchAccuracy: Math.round(punchAccuracy * 10) / 10,
        kickAccuracy: Math.round(kickAccuracy * 10) / 10,
        elbowAccuracy: Math.round(elbowAccuracy * 10) / 10
      }
    };
  }, [fighter.total_stats, fighter.ground_stats, excludeGroundStrikes]);

  const calculateWeightClassAccuracyMetrics = React.useCallback(() => {
    if (!weightClassAvgData) {
      return {
        overallStrikingAccuracy: 0,
        punchAccuracy: 0,
        kickAccuracy: 0,
        elbowAccuracy: 0
      };
    }

    const totalStrikesLanded = weightClassAvgData.TotalStrikesLanded || 0;
    const groundStrikesLanded = excludeGroundStrikes ? (weightClassAvgData.TotalGroundStrikesMade || 0) : 0;
    const groundStrikesMissed = excludeGroundStrikes ? (weightClassAvgData.TotalGroundStrikesMissed || 0) : 0;
    
    // Calculate missed strikes for weight class
    const totalMissedStrikes = (
      ((weightClassAvgData.TotalBodyKicksThrown || 0) - (weightClassAvgData.TotalBodyKicksMade || 0)) +
      ((weightClassAvgData.TotalElbowsThrown || 0) - (weightClassAvgData.TotalElbowsMade || 0)) +
      ((weightClassAvgData.TotalHighKicksThrown || 0) - (weightClassAvgData.TotalHighKicksMade || 0)) +
      ((weightClassAvgData.TotalHooksThrown || 0) - (weightClassAvgData.TotalHooksMade || 0)) +
      ((weightClassAvgData.TotalJabsThrown || 0) - (weightClassAvgData.TotalJabsMade || 0)) +
      ((weightClassAvgData.TotalLegKicksThrown || 0) - (weightClassAvgData.TotalLegKicksMade || 0)) +
      ((weightClassAvgData.TotalOverhandsThrown || 0) - (weightClassAvgData.TotalOverhandsMade || 0)) +
      ((weightClassAvgData.TotalSpinBackFistsThrown || 0) - (weightClassAvgData.TotalSpinBackFistsMade || 0)) +
      ((weightClassAvgData.TotalStraightsThrown || 0) - (weightClassAvgData.TotalStraightsMade || 0)) +
      ((weightClassAvgData.TotalUppercutsThrown || 0) - (weightClassAvgData.TotalUppercutsMade || 0))
    );

    const adjustedTotalStrikesLanded = totalStrikesLanded - groundStrikesLanded;
    const adjustedTotalMissedStrikes = totalMissedStrikes - groundStrikesMissed;

    const overallStrikingAccuracy = (adjustedTotalStrikesLanded + adjustedTotalMissedStrikes) > 0 
      ? (adjustedTotalStrikesLanded / (adjustedTotalStrikesLanded + adjustedTotalMissedStrikes)) * 100 
      : 0;

    const punchAccuracy = (weightClassAvgData.TotalPunchesThrown || 0) > 0 
      ? ((weightClassAvgData.TotalPunchesLanded || 0) / (weightClassAvgData.TotalPunchesThrown || 0)) * 100 
      : 0;

    const kickAccuracy = (weightClassAvgData.TotalKicksThrown || 0) > 0 
      ? ((weightClassAvgData.TotalKicksLanded || 0) / (weightClassAvgData.TotalKicksThrown || 0)) * 100 
      : 0;

    const elbowAccuracy = (weightClassAvgData.TotalElbowsThrown || 0) > 0 
      ? ((weightClassAvgData.TotalElbowsMade || 0) / (weightClassAvgData.TotalElbowsThrown || 0)) * 100 
      : 0;

    return {
      overallStrikingAccuracy: Math.round(overallStrikingAccuracy * 10) / 10,
      punchAccuracy: Math.round(punchAccuracy * 10) / 10,
      kickAccuracy: Math.round(kickAccuracy * 10) / 10,
      elbowAccuracy: Math.round(elbowAccuracy * 10) / 10
    };
  }, [weightClassAvgData, excludeGroundStrikes]);

  const calculatePowerMetrics = React.useCallback(() => {
    const stats = fighter.total_stats;
    const knockoutStats = fighter.knockout_stats;
    const fightOutcomeStats = fighter.fight_outcome_stats;
    
    if (!stats) {
      return {
        powerPunchAccuracy: 0,
        koTkoWinRatePerFight: 0,
        powerStrikesLandedPerMinute: 0
      };
    }

    // Power Punch Accuracy
    const powerPunchesLanded = (
      (stats.TotalHooksMade || 0) +
      (stats.TotalUppercutsMade || 0) +
      (stats.TotalOverhandsMade || 0)
    );
    
    const powerPunchesThrown = (
      (stats.TotalHooksThrown || 0) +
      (stats.TotalUppercutsThrown || 0) +
      (stats.TotalOverhandsThrown || 0)
    );
    
    const powerPunchAccuracy = powerPunchesThrown > 0 
      ? (powerPunchesLanded / powerPunchesThrown) * 100 
      : 0;

    // KO/TKO Win Rate Per Fight
    const totalKOWins = (fightOutcomeStats?.FighterKOWins || 0) + (fightOutcomeStats?.FighterTKOWins || 0);
    const fightsTracked = fighter.FightsTracked || 0;
    const koTkoWinRatePerFight = fightsTracked > 0 
      ? totalKOWins / fightsTracked 
      : 0;

    // Power Strikes Landed Per Minute
    const powerStrikesLanded = (
      (stats.TotalHooksMade || 0) +
      (stats.TotalUppercutsMade || 0) +
      (stats.TotalOverhandsMade || 0) +
      (stats.TotalHighKicksMade || 0)
    );
    const powerStrikesLandedPerMinute = (fighter.MinutesTracked || 0) > 0 ? powerStrikesLanded / (fighter.MinutesTracked || 1) : 0;

    return {
      powerPunchAccuracy: Math.round(powerPunchAccuracy * 10) / 10,
      koTkoWinRatePerFight: Math.round(koTkoWinRatePerFight * 100) / 100,
      powerStrikesLandedPerMinute: Math.round(powerStrikesLandedPerMinute * 100) / 100
    };
  }, [fighter.total_stats, fighter.fight_outcome_stats, fighter.FightsTracked]);

  const calculateWeightClassPowerMetrics = React.useCallback(() => {
    if (!weightClassAvgData) {
      return {
        powerPunchAccuracy: 0,
        koTkoWinRatePerFight: 0,
        powerStrikesLandedPerMinute: 0
      };
    }

    // Power Punch Accuracy
    const powerPunchesLanded = (
      (weightClassAvgData.TotalHooksMade || 0) +
      (weightClassAvgData.TotalUppercutsMade || 0) +
      (weightClassAvgData.TotalOverhandsMade || 0)
    );
    
    const powerPunchesThrown = (
      (weightClassAvgData.TotalHooksThrown || 0) +
      (weightClassAvgData.TotalUppercutsThrown || 0) +
      (weightClassAvgData.TotalOverhandsThrown || 0)
    );
    
    const powerPunchAccuracy = powerPunchesThrown > 0 
      ? (powerPunchesLanded / powerPunchesThrown) * 100 
      : 0;

    // KO/TKO Win Rate Per Fight
    const totalKOWins = (weightClassAvgData.kowins || 0) + (weightClassAvgData.tkowins || 0);
    const totalFights = weightClassAvgData.fights || 0;
    const koTkoWinRatePerFight = totalFights > 0 
      ? totalKOWins / totalFights 
      : 0;

    // Power Strikes Landed Per Minute
    const powerStrikesLanded = (
      (weightClassAvgData.TotalHooksMade || 0) +
      (weightClassAvgData.TotalUppercutsMade || 0) +
      (weightClassAvgData.TotalOverhandsMade || 0) +
      (weightClassAvgData.TotalHighKicksMade || 0)
    );
    const powerStrikesLandedPerMinute = (weightClassAvgData.minutes || 0) > 0 ? powerStrikesLanded / (weightClassAvgData.minutes || 1) : 0;

    return {
      powerPunchAccuracy: Math.round(powerPunchAccuracy * 10) / 10,
      koTkoWinRatePerFight: Math.round(koTkoWinRatePerFight * 100) / 100,
      powerStrikesLandedPerMinute: Math.round(powerStrikesLandedPerMinute * 100) / 100
    };
  }, [weightClassAvgData]);

  const calculateDefenseMetrics = React.useCallback(() => {
    const stats = fighter.striking_stats;
    const defensiveStats = fighter.defensive_stats;
    if (!stats) {
      return {
        strikesAbsorbedPerMinute: 0,
        knockdownAbsorptionRatePerFight: 0,
        stunAbsorptionRatePerFight: 0
      };
    }

    const strikesAbsorbed = (
      (stats.BodyKicksAbsorbed || 0) +
      (stats.HeadKicksAbsorbed || 0) +
      (stats.HooksAbsorbed || 0) +
      (stats.JabsAbsorbed || 0) +
      (stats.LegKicksAbsorbed || 0) +
      (stats.OverhandsAbsorbed || 0) +
      (stats.StraightsAbsorbed || 0) +
      (stats.UppercutsAbsorbed || 0)
    );

    const strikesAbsorbedPerMinute = (fighter.MinutesTracked || 0) > 0 ? strikesAbsorbed / (fighter.MinutesTracked || 1) : 0;

    // Knockdown Absorption Rate Per Fight
    const knockdownAbsorptionRatePerFight = (fighter.FightsTracked || 0) > 0 ? (defensiveStats?.TimesKnockedDown || 0) / (fighter.FightsTracked || 1) : 0;

    // Stun Absorption Rate Per Fight
    const stunAbsorptionRatePerFight = (fighter.FightsTracked || 0) > 0 ? (defensiveStats?.TimesStunned || 0) / (fighter.FightsTracked || 1) : 0;

    return {
      strikesAbsorbedPerMinute: Math.round(strikesAbsorbedPerMinute * 100) / 100,
      knockdownAbsorptionRatePerFight: Math.round(knockdownAbsorptionRatePerFight * 100) / 100,
      stunAbsorptionRatePerFight: Math.round(stunAbsorptionRatePerFight * 100) / 100
    };
  }, [fighter.striking_stats, fighter.defensive_stats, fighter.MinutesTracked, fighter.FightsTracked]);

  const calculateWeightClassDefenseMetrics = React.useCallback(() => {
    if (!weightClassAvgData) {
      return {
        strikesAbsorbedPerMinute: 0,
        knockdownAbsorptionRatePerFight: 0,
        stunAbsorptionRatePerFight: 0
      };
    }

    const strikesAbsorbed = (
      (weightClassAvgData.BodyKicksAbsorbed || 0) +
      (weightClassAvgData.HeadKicksAbsorbed || 0) +
      (weightClassAvgData.HooksAbsorbed || 0) +
      (weightClassAvgData.JabsAbsorbed || 0) +
      (weightClassAvgData.LegKicksAbsorbed || 0) +
      (weightClassAvgData.OverhandsAbsorbed || 0) +
      (weightClassAvgData.StraightsAbsorbed || 0) +
      (weightClassAvgData.UppercutsAbsorbed || 0)
    );

    const strikesAbsorbedPerMinute = (weightClassAvgData.minutes || 0) > 0 ? strikesAbsorbed / (weightClassAvgData.minutes || 1) : 0;

    // Knockdown Absorption Rate Per Fight
    const knockdownAbsorptionRatePerFight = (weightClassAvgData.fights || 0) > 0 ? (weightClassAvgData.timesknockeddown || 0) / (weightClassAvgData.fights || 1) : 0;

    // Stun Absorption Rate Per Fight
    const stunAbsorptionRatePerFight = (weightClassAvgData.fights || 0) > 0 ? (weightClassAvgData.timesstunned || 0) / (weightClassAvgData.fights || 1) : 0;

    return {
      strikesAbsorbedPerMinute: Math.round(strikesAbsorbedPerMinute * 100) / 100,
      knockdownAbsorptionRatePerFight: Math.round(knockdownAbsorptionRatePerFight * 100) / 100,
      stunAbsorptionRatePerFight: Math.round(stunAbsorptionRatePerFight * 100) / 100
    };
  }, [weightClassAvgData]);

  const topStrikes = React.useMemo(() => calculateTopStrikes(), [calculateTopStrikes]);
  const overallStats = React.useMemo(() => calculateOverallStats(), [calculateOverallStats]);
  const weightClassAccuracyMetrics = React.useMemo(() => calculateWeightClassAccuracyMetrics(), [calculateWeightClassAccuracyMetrics]);
  const powerMetrics = React.useMemo(() => calculatePowerMetrics(), [calculatePowerMetrics]);
  const weightClassPowerMetrics = React.useMemo(() => calculateWeightClassPowerMetrics(), [calculateWeightClassPowerMetrics]);
  const defenseMetrics = React.useMemo(() => calculateDefenseMetrics(), [calculateDefenseMetrics]);
  const weightClassDefenseMetrics = React.useMemo(() => calculateWeightClassDefenseMetrics(), [calculateWeightClassDefenseMetrics]);

  return {
    topStrikes,
    ...overallStats,
    weightClassAccuracyMetrics,
    powerMetrics,
    weightClassPowerMetrics,
    defenseMetrics,
    weightClassDefenseMetrics
  };
}; 