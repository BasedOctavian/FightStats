import React from 'react';
import { Fighter } from '../../types/firestore';

interface OutcomeCount {
  type: string;
  count: number;
}

interface StrikeStats {
  name: string;
  made: number;
  thrown: number;
  accuracy: number;
  frequencyWeight: number;
  successScore: number;
}

interface StrikesPerMinute {
  landed: number;
  thrown: number;
}

interface TotalStrikesPerMinute {
  ground: StrikesPerMinute;
  clinch: StrikesPerMinute;
  stand: StrikesPerMinute;
}

interface PerformanceMetric {
  name: string;
  value: number;
  delta: number;
  description: string;
}

interface UFCAverages {
  strikingAccuracy: number;
  takedownSuccess: number;
  takedownDefense: number;
  submissionSuccess: number;
  koTkoRate: number;
  positionalDominance: number;
  finishPercentage: number;
  bodyKickAccuracy: number;
  headKickAccuracy: number;
  legKickAccuracy: number;
  jabAccuracy: number;
  hookAccuracy: number;
  elbowAccuracy: number;
  uppercutAccuracy: number;
  bodyKickDefense: number;
  headKickDefense: number;
  legKickDefense: number;
  jabDefense: number;
  hookDefense: number;
  straightDefense: number;
  uppercutDefense: number;
}

interface StrikeMetric {
  name: string;
  thrown: number;
  landed: number;
  avgAccuracy: number;
  description: string;
}

interface DefensiveMetric {
  name: string;
  absorbed: number;
  avgRate: number;
  description: string;
}

interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark: number;
  description: string;
  ufc_average: number;
}

interface StanceMatchupStats {
  LossesVsOrthodox?: number;
  LossesVsSouthpaw?: number;
  LossesVsSwitch?: number;
  OrthodoxLosses?: number;
  OrthodoxWins?: number;
  SouthpawLosses?: number;
  SouthpawWins?: number;
  SwitchLosses?: number;
  SwitchWins?: number;
  WinsVsOrthodox?: number;
  WinsVsSouthpaw?: number;
  WinsVsSwitch?: number;
}

interface FighterStats {
  FighterKOWins?: number;
  FighterTKOWins?: number;
  FighterSUBWin?: number;
  FighterUDWins?: number;
  FighterSplitDecWin?: number;
  FighterMajDecWin?: number;
  FighterWins?: number;
  FighterKOLoss?: number;
  FighterTKOLoss?: number;
  FighterSUBLoss?: number;
  FighterUDLoss?: number;
  FighterSplitDecLoss?: number;
  FighterMajDecLoss?: number;
  FighterLoss?: number;
}

// Calculate weight class averages from data
const calculateWeightClassAverages = (weightClassData: any): UFCAverages => {
  if (!weightClassData) {
    return {
      strikingAccuracy: 0,
      takedownSuccess: 0,
      takedownDefense: 0,
      submissionSuccess: 0,
      koTkoRate: 0,
      positionalDominance: 0,
      finishPercentage: 0,
      bodyKickAccuracy: 0,
      headKickAccuracy: 0,
      legKickAccuracy: 0,
      jabAccuracy: 0,
      hookAccuracy: 0,
      elbowAccuracy: 0,
      uppercutAccuracy: 0,
      bodyKickDefense: 0,
      headKickDefense: 0,
      legKickDefense: 0,
      jabDefense: 0,
      hookDefense: 0,
      straightDefense: 0,
      uppercutDefense: 0
    };
  }

  const minutes = weightClassData.minutes || 1; // Avoid division by zero

  // Calculate submission success rate
  const subAttempts = weightClassData.SubAttempts || 1;
  const subWins = weightClassData.subwin || 0;
  const submissionSuccess = (subWins / subAttempts) * 100;

  // Calculate KO/TKO rate
  const totalWins = (weightClassData.kowins || 0) + 
                   (weightClassData.tkowins || 0) + 
                   (weightClassData.subwin || 0) + 
                   (weightClassData.decwin || 0);
  const koTkoRate = totalWins > 0 ? 
    ((weightClassData.kowins || 0) + (weightClassData.tkowins || 0)) / totalWins * 100 : 0;

  // Calculate takedown success rate
  const tdAttempts = (
    (weightClassData.SingleLegTakedownAttempts || 0) +
    (weightClassData.DoubleLegTakedownAttempts || 0) +
    (weightClassData.BodyLockTakedownAttempts || 0) +
    (weightClassData.TripTakedownAttempts || 0)
  );

  const tdSuccess = (
    (weightClassData.SingleLegTakedownSuccess || 0) +
    (weightClassData.DoubleLegTakedownSuccess || 0) +
    (weightClassData.BodyLockTakedownSuccess || 0) +
    (weightClassData.TripTakedownSuccess || 0)
  );

  const takedownSuccess = tdAttempts > 0 ? (tdSuccess / tdAttempts) * 100 : 0;

  // Calculate takedown defense
  const tdDefenseAttempts = (
    (weightClassData.SingleLegDefends || 0) +
    (weightClassData.DoubleLegDefends || 0) +
    (weightClassData.BodyLockDefends || 0) +
    (weightClassData.TripDefends || 0)
  );

  const tdDefenseTotal = (
    (weightClassData.TimesSingleLegged || 0) +
    (weightClassData.TimesDoubleLegged || 0) +
    (weightClassData.TimesBodyLocked || 0) +
    (weightClassData.TimesTripped || 0)
  );

  const takedownDefense = tdDefenseTotal > 0 ? (tdDefenseAttempts / tdDefenseTotal) * 100 : 0;

  // Calculate positional dominance
  const totalPositions = (
    (weightClassData.CenterOctagon || 0) +
    (weightClassData.PushedBackToCage || 0) +
    (weightClassData.PushingAgainstCage || 0) +
    (weightClassData.BeingClinched || 0) +
    (weightClassData.InClinch || 0) +
    (weightClassData.OnBottomGround || 0) +
    (weightClassData.OnTopGround || 0)
  );

  const dominantPositions = (
    (weightClassData.PushingAgainstCage || 0) +
    (weightClassData.InClinch || 0) +
    (weightClassData.OnTopGround || 0)
  );

  const positionalDominance = totalPositions > 0 ? (dominantPositions / totalPositions) * 100 : 0;

  // Calculate strike-specific accuracies
  const bodyKicks = {
    thrown: weightClassData.TotalBodyKicksThrown || 1,
    made: weightClassData.TotalBodyKicksMade || 0
  };
  const headKicks = {
    thrown: weightClassData.TotalHighKicksThrown || 1,
    made: weightClassData.TotalHighKicksMade || 0
  };
  const legKicks = {
    thrown: weightClassData.TotalLegKicksThrown || 1,
    made: weightClassData.TotalLegKicksMade || 0
  };
  const jabs = {
    thrown: weightClassData.TotalJabsThrown || 1,
    made: weightClassData.TotalJabsMade || 0
  };
  const hooks = {
    thrown: weightClassData.TotalHooksThrown || 1,
    made: weightClassData.TotalHooksMade || 0
  };
  const elbows = {
    thrown: weightClassData.TotalElbowsThrown || 1,
    made: weightClassData.TotalElbowsMade || 0
  };
  const uppercuts = {
    thrown: weightClassData.TotalUppercutsThrown || 1,
    made: weightClassData.TotalUppercutsMade || 0
  };

  // Calculate defensive rates (per minute)
  const bodyKickDefense = (weightClassData.BodyKicksAbsorbed || 0) / minutes;
  const headKickDefense = (weightClassData.HeadKicksAbsorbed || 0) / minutes;
  const legKickDefense = (weightClassData.LegKicksAbsorbed || 0) / minutes;
  const jabDefense = (weightClassData.JabsAbsorbed || 0) / minutes;
  const hookDefense = (weightClassData.HooksAbsorbed || 0) / minutes;
  const straightDefense = (weightClassData.StraightsAbsorbed || 0) / minutes;
  const uppercutDefense = (weightClassData.UppercutsAbsorbed || 0) / minutes;

  // Calculate finish percentage
  const classWins = (weightClassData.kowins || 0) + 
                   (weightClassData.tkowins || 0) + 
                   (weightClassData.subwin || 0) + 
                   (weightClassData.decwin || 0);
  const classFinishes = (weightClassData.kowins || 0) + 
                       (weightClassData.tkowins || 0) + 
                       (weightClassData.subwin || 0);
  const finishPercentage = classWins > 0 ? (classFinishes / classWins) * 100 : 0;

  // Calculate total missed strikes for weight class
  const weightClassMissedStrikes = (
    (weightClassData.TotalBodyKicksThrown || 0) - (weightClassData.TotalBodyKicksMade || 0) +
    (weightClassData.TotalElbowsThrown || 0) - (weightClassData.TotalElbowsMade || 0) +
    (weightClassData.TotalHighKicksThrown || 0) - (weightClassData.TotalHighKicksMade || 0) +
    (weightClassData.TotalHooksThrown || 0) - (weightClassData.TotalHooksMade || 0) +
    (weightClassData.TotalJabsThrown || 0) - (weightClassData.TotalJabsMade || 0) +
    (weightClassData.TotalLegKicksThrown || 0) - (weightClassData.TotalLegKicksMade || 0) +
    (weightClassData.TotalOverhandsThrown || 0) - (weightClassData.TotalOverhandsMade || 0) +
    (weightClassData.TotalSpinBackFistsThrown || 0) - (weightClassData.TotalSpinBackFistsMade || 0) +
    (weightClassData.TotalStraightsThrown || 0) - (weightClassData.TotalStraightsMade || 0) +
    (weightClassData.TotalUppercutsThrown || 0) - (weightClassData.TotalUppercutsMade || 0)
  );

  const weightClassLandedStrikes = weightClassData.TotalStrikesLanded || 0;
  const weightClassTotalAttempts = weightClassLandedStrikes + weightClassMissedStrikes;
  const weightClassStrikingAccuracy = weightClassTotalAttempts > 0 ? (weightClassLandedStrikes / weightClassTotalAttempts) * 100 : 0;

  return {
    strikingAccuracy: weightClassStrikingAccuracy,
    takedownSuccess,
    takedownDefense,
    submissionSuccess,
    koTkoRate,
    positionalDominance,
    finishPercentage,
    bodyKickAccuracy: (bodyKicks.made / bodyKicks.thrown) * 100,
    headKickAccuracy: (headKicks.made / headKicks.thrown) * 100,
    legKickAccuracy: (legKicks.made / legKicks.thrown) * 100,
    jabAccuracy: (jabs.made / jabs.thrown) * 100,
    hookAccuracy: (hooks.made / hooks.thrown) * 100,
    elbowAccuracy: (elbows.made / elbows.thrown) * 100,
    uppercutAccuracy: (uppercuts.made / uppercuts.thrown) * 100,
    bodyKickDefense,
    headKickDefense,
    legKickDefense,
    jabDefense,
    hookDefense,
    straightDefense,
    uppercutDefense
  };
};

// Helper functions
const calculateWinRateVsStance = (wins?: number, losses?: number) => {
  if (!wins && !losses) return 0;
  const totalFights = (wins || 0) + (losses || 0);
  return totalFights === 0 ? 0 : ((wins || 0) / totalFights) * 100;
};

const getTotalFightsVsStance = (wins?: number, losses?: number) => {
  return (wins || 0) + (losses || 0);
};

export const useBasicInfo = (fighter: Fighter, weightClassAvgData?: any) => {
  // Calculate weight class averages
  const UFC_AVERAGES = React.useMemo(() => calculateWeightClassAverages(weightClassAvgData), [weightClassAvgData]);

  // Check if positional data exists
  const hasPositionalData = React.useMemo(() => {
    const positions = [
      fighter.PushingAgainstCage,
      fighter.PushedBackToCage,
      fighter.CenterOctagon,
      fighter.clinch_stats?.InClinch,
      fighter.clinch_stats?.BeingClinched,
      fighter.ground_stats?.OnTopGround,
      fighter.ground_stats?.OnBottomGround
    ];
    
    return positions.some(value => value && value > 0);
  }, [fighter]);

  // Calculate Performance Metrics
  const performanceMetrics = React.useMemo(() => {
    const metrics: PerformanceMetric[] = [];
    const minutesTracked = fighter.MinutesTracked || 0;
    const weightClassMinutes = weightClassAvgData?.minutes || 0;
    
    // Only calculate metrics if we have enough fight time
    if (minutesTracked < 5) {
      return metrics;
    }
    
    // 1. Striking Accuracy
    const totalStandingStrikes = (
      (fighter.total_stats?.TotalBodyKicksThrown || 0) +
      (fighter.total_stats?.TotalElbowsThrown || 0) +
      (fighter.total_stats?.TotalHighKicksThrown || 0) +
      (fighter.total_stats?.TotalHooksThrown || 0) +
      (fighter.total_stats?.TotalJabsThrown || 0) +
      (fighter.total_stats?.TotalLegKicksThrown || 0) +
      (fighter.total_stats?.TotalStraightsThrown || 0) +
      (fighter.total_stats?.TotalUppercutsThrown || 0)
    );
    
    const totalStrikes = totalStandingStrikes + 
      (fighter.ground_stats?.TotalGroundStrikesThrown || 0) + 
      (fighter.clinch_stats?.TotalClinchStrikesThrown || 0);
    
    // Only include striking accuracy if there's a meaningful sample size
    if (totalStrikes >= 20) {
      const strikingAccuracy = (fighter.total_stats?.TotalStrikesLanded || 0) / totalStrikes * 100;
      metrics.push({
        name: 'Striking Accuracy',
        value: strikingAccuracy,
        delta: strikingAccuracy - UFC_AVERAGES.strikingAccuracy,
        description: 'Percentage of total strikes landed across all positions'
      });
    }

    // 2. Submission Success
    const subAttempts = fighter.submission_stats?.SubAttempts || 0;
    // Only include submission success if there's a meaningful sample size
    if (subAttempts >= 3) {
      const subSuccess = ((fighter.fight_outcome_stats?.FighterSUBWin || 0) / subAttempts) * 100;
      metrics.push({
        name: 'Submission Success',
        value: subSuccess,
        delta: subSuccess - UFC_AVERAGES.submissionSuccess,
        description: 'Percentage of submission attempts resulting in wins'
      });
    }

    // 3. KO/TKO Rate
    const wins = fighter.fight_outcome_stats?.FighterWins || 0;
    // Only include KO rate if fighter has enough wins
    if (wins >= 2) {
      const koRate = (((fighter.fight_outcome_stats?.FighterKOWins || 0) + 
        (fighter.fight_outcome_stats?.FighterTKOWins || 0)) / wins) * 100;
      metrics.push({
        name: 'KO/TKO Rate',
        value: koRate,
        delta: koRate - UFC_AVERAGES.koTkoRate,
        description: 'Percentage of wins by knockout or technical knockout'
      });
    }

    // Add strike-specific offensive metrics if we have enough fight time
    if (minutesTracked >= 10 && weightClassMinutes > 0) {
      // Helper function to calculate strike metrics
      const calculateStrikeMetric = (
        name: string,
        thrown: number,
        landed: number,
        avgAccuracy: number,
        description: string
      ) => {
        if (thrown >= 10) {
          const accuracy = (landed / thrown) * 100;
          metrics.push({
            name,
            value: accuracy,
            delta: accuracy - avgAccuracy,
            description
          });
        }
      };

      // Calculate metrics for each strike type
      const strikeTypes = [
        {
          name: 'Body Kick Accuracy',
          thrown: fighter.total_stats?.TotalBodyKicksThrown || 0,
          landed: fighter.total_stats?.TotalBodyKicksMade || 0,
          avgAccuracy: UFC_AVERAGES.bodyKickAccuracy,
          description: 'Success rate with body kicks'
        },
        {
          name: 'Head Kick Accuracy',
          thrown: fighter.total_stats?.TotalHighKicksThrown || 0,
          landed: fighter.total_stats?.TotalHighKicksMade || 0,
          avgAccuracy: UFC_AVERAGES.headKickAccuracy,
          description: 'Success rate with head kicks'
        },
        {
          name: 'Leg Kick Accuracy',
          thrown: fighter.total_stats?.TotalLegKicksThrown || 0,
          landed: fighter.total_stats?.TotalLegKicksMade || 0,
          avgAccuracy: UFC_AVERAGES.legKickAccuracy,
          description: 'Success rate with leg kicks'
        },
        {
          name: 'Jab Accuracy',
          thrown: fighter.total_stats?.TotalJabsThrown || 0,
          landed: fighter.total_stats?.TotalJabsMade || 0,
          avgAccuracy: UFC_AVERAGES.jabAccuracy,
          description: 'Success rate with jabs'
        },
        {
          name: 'Hook Accuracy',
          thrown: fighter.total_stats?.TotalHooksThrown || 0,
          landed: fighter.total_stats?.TotalHooksMade || 0,
          avgAccuracy: UFC_AVERAGES.hookAccuracy,
          description: 'Success rate with hooks'
        },
        {
          name: 'Elbow Strike Accuracy',
          thrown: fighter.total_stats?.TotalElbowsThrown || 0,
          landed: fighter.total_stats?.TotalElbowsMade || 0,
          avgAccuracy: UFC_AVERAGES.elbowAccuracy,
          description: 'Success rate with elbow strikes'
        },
        {
          name: 'Uppercut Accuracy',
          thrown: fighter.total_stats?.TotalUppercutsThrown || 0,
          landed: fighter.total_stats?.TotalUppercutsMade || 0,
          avgAccuracy: UFC_AVERAGES.uppercutAccuracy,
          description: 'Success rate with uppercuts'
        }
      ];

      // Add metrics for each strike type
      strikeTypes.forEach(strike => {
        calculateStrikeMetric(
          strike.name,
          strike.thrown,
          strike.landed,
          strike.avgAccuracy,
          strike.description
        );
      });

      // Add defensive metrics if we have enough fight time
      if (minutesTracked >= 15) {
        const calculateDefensiveMetric = (
          name: string,
          absorbed: number,
          avgRate: number,
          description: string
        ) => {
          const absorbedPerMinute = absorbed / minutesTracked;
          const delta = (avgRate - absorbedPerMinute) / avgRate * 100;
          
          metrics.push({
            name,
            value: 100 - (absorbedPerMinute / avgRate * 100),
            delta,
            description
          });
        };

        // Calculate defensive metrics
        const defensiveMetrics = [
          {
            name: 'Body Kick Defense',
            absorbed: fighter.striking_stats?.BodyKicksAbsorbed || 0,
            avgRate: UFC_AVERAGES.bodyKickDefense,
            description: 'Ability to avoid body kicks'
          },
          {
            name: 'Head Kick Defense',
            absorbed: fighter.striking_stats?.HeadKicksAbsorbed || 0,
            avgRate: UFC_AVERAGES.headKickDefense,
            description: 'Ability to avoid head kicks'
          },
          {
            name: 'Leg Kick Defense',
            absorbed: fighter.striking_stats?.LegKicksAbsorbed || 0,
            avgRate: UFC_AVERAGES.legKickDefense,
            description: 'Ability to avoid leg kicks'
          },
          {
            name: 'Jab Defense',
            absorbed: fighter.striking_stats?.JabsAbsorbed || 0,
            avgRate: UFC_AVERAGES.jabDefense,
            description: 'Ability to avoid jabs'
          },
          {
            name: 'Hook Defense',
            absorbed: fighter.striking_stats?.HooksAbsorbed || 0,
            avgRate: UFC_AVERAGES.hookDefense,
            description: 'Ability to avoid hooks'
          },
          {
            name: 'Straight Defense',
            absorbed: fighter.striking_stats?.StraightsAbsorbed || 0,
            avgRate: UFC_AVERAGES.straightDefense,
            description: 'Ability to avoid straight punches'
          },
          {
            name: 'Uppercut Defense',
            absorbed: fighter.striking_stats?.UppercutsAbsorbed || 0,
            avgRate: UFC_AVERAGES.uppercutDefense,
            description: 'Ability to avoid uppercuts'
          }
        ];

        // Add metrics for each defensive stat
        defensiveMetrics.forEach(defense => {
          calculateDefensiveMetric(
            defense.name,
            defense.absorbed,
            defense.avgRate,
            defense.description
          );
        });
      }
    }

    return metrics;
  }, [fighter, weightClassAvgData, UFC_AVERAGES]);

  // Calculate weight class striking stats
  const weightClassStrikingStats = React.useMemo(() => {
    if (!weightClassAvgData) return null;

    const weightClassMissedStrikes = (
      (weightClassAvgData.TotalBodyKicksThrown || 0) - (weightClassAvgData.TotalBodyKicksMade || 0) +
      (weightClassAvgData.TotalElbowsThrown || 0) - (weightClassAvgData.TotalElbowsMade || 0) +
      (weightClassAvgData.TotalHighKicksThrown || 0) - (weightClassAvgData.TotalHighKicksMade || 0) +
      (weightClassAvgData.TotalHooksThrown || 0) - (weightClassAvgData.TotalHooksMade || 0) +
      (weightClassAvgData.TotalJabsThrown || 0) - (weightClassAvgData.TotalJabsMade || 0) +
      (weightClassAvgData.TotalLegKicksThrown || 0) - (weightClassAvgData.TotalLegKicksMade || 0) +
      (weightClassAvgData.TotalOverhandsThrown || 0) - (weightClassAvgData.TotalOverhandsMade || 0) +
      (weightClassAvgData.TotalSpinBackFistsThrown || 0) - (weightClassAvgData.TotalSpinBackFistsMade || 0) +
      (weightClassAvgData.TotalStraightsThrown || 0) - (weightClassAvgData.TotalStraightsMade || 0) +
      (weightClassAvgData.TotalUppercutsThrown || 0) - (weightClassAvgData.TotalUppercutsMade || 0)
    );

    const weightClassLandedStrikes = weightClassAvgData.TotalStrikesLanded || 0;
    const weightClassTotalAttempts = weightClassLandedStrikes + weightClassMissedStrikes;

    return {
      accuracy: weightClassTotalAttempts > 0 ? (weightClassLandedStrikes / weightClassTotalAttempts) * 100 : 0,
      totalStrikes: weightClassTotalAttempts,
      landed: weightClassLandedStrikes,
    };
  }, [weightClassAvgData]);

  // Calculate weight class stats
  const weightClassStats = React.useMemo(() => {
    if (!weightClassAvgData) return {
      finishPercentage: 0,
      koTkoWinPercentage: 0,
      submissionWinPercentage: 0,
      decisionWinPercentage: 0,
      koTkoLossPercentage: 0,
      submissionLossPercentage: 0,
      decisionLossPercentage: 0,
      orthodoxWinRate: 0,
      southpawWinRate: 0,
      switchWinRate: 0,
      averageFightDuration: 0,
      averageRoundsPerFight: 0
    };

    const totalWins = (weightClassAvgData.kowins || 0) +
                     (weightClassAvgData.tkowins || 0) +
                     (weightClassAvgData.subwin || 0) +
                     (weightClassAvgData.decwin || 0);

    const totalLosses = (weightClassAvgData.koloss || 0) +
                       (weightClassAvgData.tkoloss || 0) +
                       (weightClassAvgData.subloss || 0) +
                       (weightClassAvgData.decloss || 0);

    return {
      finishPercentage: totalWins === 0 ? 0 : 
        ((weightClassAvgData.kowins || 0) + (weightClassAvgData.tkowins || 0) + (weightClassAvgData.subwin || 0)) / totalWins * 100,
      koTkoWinPercentage: totalWins === 0 ? 0 :
        ((weightClassAvgData.kowins || 0) + (weightClassAvgData.tkowins || 0)) / totalWins * 100,
      submissionWinPercentage: totalWins === 0 ? 0 :
        (weightClassAvgData.subwin || 0) / totalWins * 100,
      decisionWinPercentage: totalWins === 0 ? 0 :
        (weightClassAvgData.decwin || 0) / totalWins * 100,
      koTkoLossPercentage: totalLosses === 0 ? 0 :
        ((weightClassAvgData.koloss || 0) + (weightClassAvgData.tkoloss || 0)) / totalLosses * 100,
      submissionLossPercentage: totalLosses === 0 ? 0 :
        (weightClassAvgData.subloss || 0) / totalLosses * 100,
      decisionLossPercentage: totalLosses === 0 ? 0 :
        (weightClassAvgData.decloss || 0) / totalLosses * 100,
      orthodoxWinRate: calculateWinRateVsStance(
        weightClassAvgData.WinsVsOrthodox,
        weightClassAvgData.LossesVsOrthodox
      ),
      southpawWinRate: calculateWinRateVsStance(
        weightClassAvgData.WinsVsSouthpaw,
        weightClassAvgData.LossesVsSouthpaw
      ),
      switchWinRate: calculateWinRateVsStance(
        weightClassAvgData.WinsVsSwitch,
        weightClassAvgData.LossesVsSwitch
      ),
      averageFightDuration: weightClassAvgData.fights && weightClassAvgData.fights > 0 
        ? (weightClassAvgData.minutes || 0) / weightClassAvgData.fights 
        : 0,
      averageRoundsPerFight: weightClassAvgData.fights && weightClassAvgData.fights > 0
        ? (weightClassAvgData.rounds || 0) / weightClassAvgData.fights
        : 0
    };
  }, [weightClassAvgData]);

  // Calculation functions
  const calculateAggressivenessRating = React.useCallback((): number | "Insufficient data" => {
    // Require minimum fights for reliability
    if (!fighter.FightsTracked || fighter.FightsTracked < 5) {
      return "Insufficient data";
    }

    const EPSILON = 0.001; // Small value to avoid division by zero

    // 1. Calculate Strike Ratio
    const calculateStrikeRatio = (): number => {
      const fighterMinutes = fighter.MinutesTracked || EPSILON;
      const classMinutes = weightClassAvgData?.minutes || EPSILON;

      // Fighter strike rate
      const fighterStrikeRate = (
        (fighter.total_stats?.TotalPunchesThrown || 0) +
        (fighter.total_stats?.TotalKicksThrown || 0) +
        (fighter.total_stats?.TotalElbowsThrown || 0) +
        (fighter.total_stats?.TotalSpinBackFistsThrown || 0) +
        (fighter.clinch_stats?.TotalClinchStrikesThrown || 0) +
        (fighter.ground_stats?.TotalGroundStrikesThrown || 0)
      ) / fighterMinutes;

      // Class strike rate
      const classStrikeRate = weightClassAvgData ? (
        (weightClassAvgData.TotalPunchesThrown || 0) +
        (weightClassAvgData.TotalKicksThrown || 0) +
        (weightClassAvgData.TotalElbowsThrown || 0) +
        (weightClassAvgData.TotalSpinBackFistsThrown || 0) +
        (weightClassAvgData.TotalClinchStrikesThrown || 0) +
        (weightClassAvgData.TotalGroundStrikesThrown || 0)
      ) / classMinutes : 0;

      return classStrikeRate > 0 ? fighterStrikeRate / classStrikeRate : 1.0;
    };

    // 2. Calculate Takedown Ratio
    const calculateTakedownRatio = (): number => {
      const fighterFights = fighter.FightsTracked || EPSILON;
      const classFights = weightClassAvgData?.fights || EPSILON;

      // Fighter takedown rate
      const fighterTakedownRate = (
        (fighter.takedown_stats?.BodyLockTakedownAttempts || 0) +
        (fighter.takedown_stats?.DoubleLegTakedownAttempts || 0) +
        (fighter.takedown_stats?.SingleLegTakedownAttempts || 0) +
        (fighter.takedown_stats?.TripTakedownAttempts || 0) +
        (fighter.takedown_stats?.AttemptedAnklePickTD || 0) +
        (fighter.takedown_stats?.AttemptedThrowTD || 0) +
        (fighter.takedown_stats?.AttemptedImanariTD || 0)
      ) / fighterFights;

      // Class takedown rate
      const classTakedownRate = weightClassAvgData ? (
        (weightClassAvgData.BodyLockTakedownAttempts || 0) +
        (weightClassAvgData.DoubleLegTakedownAttempts || 0) +
        (weightClassAvgData.SingleLegTakedownAttempts || 0) +
        (weightClassAvgData.TripTakedownAttempts || 0) +
        (weightClassAvgData.AttemptedThrowTD || 0)
      ) / classFights : 0;

      return classTakedownRate > 0 ? fighterTakedownRate / classTakedownRate : 1.0;
    };

    // 3. Calculate Submission Ratio
    const calculateSubmissionRatio = (): number => {
      const fighterRounds = fighter.RoundsTracked || EPSILON;
      const classRounds = weightClassAvgData?.rounds || EPSILON;

      // Fighter submission rate
      const fighterSubRate = (fighter.submission_stats?.SubAttempts || 0) / fighterRounds;

      // Class submission rate
      const classSubRate = weightClassAvgData ? 
        (weightClassAvgData.SubAttempts || weightClassAvgData.subattempt || 0) / classRounds : 0;

      return classSubRate > 0 ? fighterSubRate / classSubRate : 1.0;
    };

    // 4. Calculate Positional Ratio
    const calculatePositionalRatio = (): number => {
      const totalPositions = (
        (fighter.CenterOctagon || 0) +
        (fighter.PushedBackToCage || 0) +
        (fighter.PushingAgainstCage || 0) +
        (fighter.clinch_stats?.BeingClinched || 0) +
        (fighter.clinch_stats?.InClinch || 0) +
        (fighter.ground_stats?.OnBottomGround || 0) +
        (fighter.ground_stats?.OnTopGround || 0)
      );

      if (totalPositions === 0) return 1.0;

      const dominantPositions = (
        (fighter.PushingAgainstCage || 0) +
        (fighter.clinch_stats?.InClinch || 0) +
        (fighter.ground_stats?.OnTopGround || 0)
      );

      const fighterPosRate = (dominantPositions / totalPositions) * 100;
      // Using 50% as baseline for class average
      return fighterPosRate / 50;
    };

    // Calculate composite ratio
    const strikeRatio = calculateStrikeRatio();
    const takedownRatio = calculateTakedownRatio();
    const subRatio = calculateSubmissionRatio();
    const posRatio = calculatePositionalRatio();

    const compositeRatio = (strikeRatio + takedownRatio + subRatio + posRatio) / 4;

    // Calculate final score using tanh
    const score = Math.round(50 + 49 * Math.tanh(compositeRatio - 1));

    // Ensure score is between 1 and 99
    return Math.min(99, Math.max(1, score));
  }, [fighter, weightClassAvgData]);

  // Calculate Offense Origin Percentages
  const calculateOffenseOrigin = React.useCallback(() => {
    const totalOffense = fighter.total_stats?.TotalStrikesLanded || 0;
    if (totalOffense === 0) return { ground: 0, clinch: 0, stand: 0 };

    const groundStrikes = fighter.ground_stats?.TotalGroundStrikesMade || 0;
    const clinchStrikes = fighter.clinch_stats?.TotalClinchStrikesMade || 0;

    const groundPercent = Math.round((groundStrikes / totalOffense) * 100);
    const clinchPercent = Math.round((clinchStrikes / totalOffense) * 100);
    const standPercent = 100 - groundPercent - clinchPercent;

    return {
      ground: groundPercent,
      clinch: clinchPercent,
      stand: Math.max(0, standPercent) // Ensure it doesn't go negative due to rounding
    };
  }, [fighter]);

  // Calculate Most Common Fight Outcome
  const calculateMostCommonOutcome = React.useCallback(() => {
    const outcomes = fighter.fight_outcome_stats;
    if (!outcomes) return 'No Data';

    const outcomeMap: OutcomeCount[] = [
      { type: 'KO Win', count: outcomes.FighterKOWins || 0 },
      { type: 'TKO Win', count: outcomes.FighterTKOWins || 0 },
      { type: 'Submission Win', count: outcomes.FighterSUBWin || 0 },
      { type: 'Unanimous Decision Win', count: outcomes.FighterUDWins || 0 },
      { type: 'Split Decision Win', count: outcomes.FighterSplitDecWin || 0 },
      { type: 'Majority Decision Win', count: outcomes.FighterMajDecWin || 0 },
      { type: 'KO Loss', count: outcomes.FighterKOLoss || 0 },
      { type: 'TKO Loss', count: outcomes.FighterTKOLoss || 0 },
      { type: 'Submission Loss', count: outcomes.FighterSUBLoss || 0 },
      { type: 'Unanimous Decision Loss', count: outcomes.FighterUDLoss || 0 },
      { type: 'Split Decision Loss', count: outcomes.FighterSplitDecLoss || 0 },
      { type: 'Majority Decision Loss', count: outcomes.FighterMajDecLoss || 0 },
      { type: 'Draw', count: outcomes.FighterDraw || 0 },
      { type: 'No Contest', count: outcomes.FighterNC || 0 }
    ];

    // Sort by count in descending order
    outcomeMap.sort((a, b) => b.count - a.count);
    
    // Return the most common outcome(s)
    const highestCount = outcomeMap[0].count;
    const mostCommon = outcomeMap.filter(o => o.count === highestCount && o.count > 0);
    
    if (mostCommon.length === 0) return 'No Data';
    if (mostCommon.length === 1) return mostCommon[0].type;
    return mostCommon.map(o => o.type).join(' / ');
  }, [fighter.fight_outcome_stats]);

  // Calculate Most Common Gameplan
  const calculateMostCommonGameplan = React.useCallback(() => {
    const gameplans = fighter.gameplan_stats;
    if (!gameplans) return 'No Data';

    const grappling = gameplans.GrapplingGameplans || 0;
    const striking = gameplans.StrikingGameplans || 0;

    if (grappling === 0 && striking === 0) return 'No Data';
    if (grappling === striking) return 'Mixed (Striking/Grappling)';
    return grappling > striking ? 'Grappling' : 'Striking';
  }, [fighter.gameplan_stats]);

  // Calculate Most Successful Strike
  const calculateMostSuccessfulStrike = React.useCallback(() => {
    const stats = fighter.total_stats;
    if (!stats) return { name: 'No Data', accuracy: 0, successScore: 0 };

    const strikes: StrikeStats[] = [
      {
        name: 'Body Kick',
        made: stats.TotalBodyKicksMade || 0,
        thrown: stats.TotalBodyKicksThrown || 0,
        accuracy: 0,
        frequencyWeight: 0,
        successScore: 0
      },
      {
        name: 'Cross',
        made: stats.TotalCrossMake || 0,
        thrown: stats.TotalCrossAttempts || 0,
        accuracy: 0,
        frequencyWeight: 0,
        successScore: 0
      },
      {
        name: 'Elbow',
        made: stats.TotalElbowsMade || 0,
        thrown: stats.TotalElbowsThrown || 0,
        accuracy: 0,
        frequencyWeight: 0,
        successScore: 0
      },
      {
        name: 'High Kick',
        made: stats.TotalHighKicksMade || 0,
        thrown: stats.TotalHighKicksThrown || 0,
        accuracy: 0,
        frequencyWeight: 0,
        successScore: 0
      },
      {
        name: 'Hook',
        made: stats.TotalHooksMade || 0,
        thrown: stats.TotalHooksThrown || 0,
        accuracy: 0,
        frequencyWeight: 0,
        successScore: 0
      },
      {
        name: 'Jab',
        made: stats.TotalJabsMade || 0,
        thrown: stats.TotalJabsThrown || 0,
        accuracy: 0,
        frequencyWeight: 0,
        successScore: 0
      },
      {
        name: 'Leg Kick',
        made: stats.TotalLegKicksMade || 0,
        thrown: stats.TotalLegKicksThrown || 0,
        accuracy: 0,
        frequencyWeight: 0,
        successScore: 0
      },
      {
        name: 'Overhand',
        made: stats.TotalOverhandsMade || 0,
        thrown: stats.TotalOverhandsThrown || 0,
        accuracy: 0,
        frequencyWeight: 0,
        successScore: 0
      },
      {
        name: 'Spin Back Fist',
        made: stats.TotalSpinBackFistsMade || 0,
        thrown: stats.TotalSpinBackFistsThrown || 0,
        accuracy: 0,
        frequencyWeight: 0,
        successScore: 0
      },
      {
        name: 'Straight',
        made: stats.TotalStraightsMade || 0,
        thrown: stats.TotalStraightsThrown || 0,
        accuracy: 0,
        frequencyWeight: 0,
        successScore: 0
      },
      {
        name: 'Uppercut',
        made: stats.TotalUppercutsMade || 0,
        thrown: stats.TotalUppercutsThrown || 0,
        accuracy: 0,
        frequencyWeight: 0,
        successScore: 0
      }
    ];

    // Calculate total thrown strikes
    const totalThrown = strikes.reduce((sum, strike) => sum + strike.thrown, 0);
    if (totalThrown === 0) return { name: 'No Data', accuracy: 0, successScore: 0 };

    // Calculate accuracy and success score for each strike
    strikes.forEach(strike => {
      strike.accuracy = strike.thrown > 0 ? strike.made / strike.thrown : 0;
      strike.frequencyWeight = strike.thrown / totalThrown;
      strike.successScore = (strike.accuracy * strike.frequencyWeight) * 100;
    });

    // Find the most successful strike
    const mostSuccessful = strikes.reduce((prev, current) => 
      current.successScore > prev.successScore ? current : prev
    );

    return {
      name: mostSuccessful.name,
      accuracy: Math.round(mostSuccessful.accuracy * 100),
      successScore: Math.round(mostSuccessful.successScore)
    };
  }, [fighter.total_stats]);

  // Calculate Most Vulnerable Strike
  const calculateMostVulnerableStrike = React.useCallback(() => {
    const stats = fighter.striking_stats;
    if (!stats) return 'No Data';

    const strikes = [
      { name: 'Body Kick', count: stats.BodyKicksAbsorbed || 0 },
      { name: 'Cross', count: stats.CrossesAbsorbed || 0 },
      { name: 'Head Kick', count: stats.HeadKicksAbsorbed || 0 },
      { name: 'Hook', count: stats.HooksAbsorbed || 0 },
      { name: 'Jab', count: stats.JabsAbsorbed || 0 },
      { name: 'Leg Kick', count: stats.LegKicksAbsorbed || 0 },
      { name: 'Overhand', count: stats.OverhandsAbsorbed || 0 },
      { name: 'Straight', count: stats.StraightsAbsorbed || 0 },
      { name: 'Uppercut', count: stats.UppercutsAbsorbed || 0 }
    ];

    const maxAbsorbed = Math.max(...strikes.map(s => s.count));
    if (maxAbsorbed === 0) return 'No Data';

    const mostVulnerable = strikes.filter(s => s.count === maxAbsorbed);
    return mostVulnerable.map(s => s.name).join(' / ');
  }, [fighter.striking_stats]);

  // Calculate Total Strikes Per Minute
  const calculateStrikesPerMinute = React.useCallback((): TotalStrikesPerMinute => {
    const minutesTracked = fighter.MinutesTracked || 0;
    if (minutesTracked === 0) {
      return {
        ground: { landed: 0, thrown: 0 },
        clinch: { landed: 0, thrown: 0 },
        stand: { landed: 0, thrown: 0 }
      };
    }

    const groundStats = fighter.ground_stats || {};
    const clinchStats = fighter.clinch_stats || {};
    const totalStats = fighter.total_stats || {};

    // Calculate ground strikes per minute
    const groundLanded = (groundStats.TotalGroundStrikesMade || 0) / minutesTracked;
    const groundThrown = (groundStats.TotalGroundStrikesThrown || 0) / minutesTracked;

    // Calculate clinch strikes per minute
    const clinchLanded = (clinchStats.TotalClinchStrikesMade || 0) / minutesTracked;
    const clinchThrown = (clinchStats.TotalClinchStrikesThrown || 0) / minutesTracked;

    // Calculate standing strikes per minute
    // Standing strikes = Total strikes - Clinch strikes - Ground strikes
    const totalLanded = totalStats.TotalStrikesLanded || 0;
    const totalGroundLanded = groundStats.TotalGroundStrikesMade || 0;
    const totalClinchLanded = clinchStats.TotalClinchStrikesMade || 0;
    const standingLanded = Math.max(0, totalLanded - totalGroundLanded - totalClinchLanded) / minutesTracked;

    // For standing thrown, we need to calculate all standing strike attempts
    // This includes all the individual strike types from total_stats
    const standingThrown = (
      (totalStats.TotalBodyKicksThrown || 0) +
      (totalStats.TotalElbowsThrown || 0) +
      (totalStats.TotalHighKicksThrown || 0) +
      (totalStats.TotalHooksThrown || 0) +
      (totalStats.TotalJabsThrown || 0) +
      (totalStats.TotalLegKicksThrown || 0) +
      (totalStats.TotalOverhandsThrown || 0) +
      (totalStats.TotalSpinBackFistsThrown || 0) +
      (totalStats.TotalStraightsThrown || 0) +
      (totalStats.TotalUppercutsThrown || 0) +
      (totalStats.TotalCrossAttempts || 0)
    ) / minutesTracked;

    return {
      ground: { landed: groundLanded, thrown: groundThrown },
      clinch: { landed: clinchLanded, thrown: clinchThrown },
      stand: { landed: standingLanded, thrown: standingThrown }
    };
  }, [fighter]);

  // Calculate weight class strikes per minute for comparison
  const calculateWeightClassStrikesPerMinute = React.useCallback((): TotalStrikesPerMinute => {
    if (!weightClassAvgData) {
      return {
        ground: { landed: 0, thrown: 0 },
        clinch: { landed: 0, thrown: 0 },
        stand: { landed: 0, thrown: 0 }
      };
    }

    const weightClassMinutes = weightClassAvgData.minutes || 1;

    // Calculate weight class ground strikes per minute
    const wcGroundLanded = (weightClassAvgData.TotalGroundStrikesMade || 0) / weightClassMinutes;
    const wcGroundThrown = (weightClassAvgData.TotalGroundStrikesThrown || 0) / weightClassMinutes;

    // Calculate weight class clinch strikes per minute
    const wcClinchLanded = (weightClassAvgData.TotalClinchStrikesMade || 0) / weightClassMinutes;
    const wcClinchThrown = (weightClassAvgData.TotalClinchStrikesThrown || 0) / weightClassMinutes;

    // Calculate weight class standing strikes per minute
    const wcTotalLanded = weightClassAvgData.TotalStrikesLanded || 0;
    const wcStandingLanded = Math.max(0, wcTotalLanded - (weightClassAvgData.TotalGroundStrikesMade || 0) - (weightClassAvgData.TotalClinchStrikesMade || 0)) / weightClassMinutes;

    // Calculate standing thrown for weight class
    const wcStandingThrown = (
      (weightClassAvgData.TotalBodyKicksThrown || 0) +
      (weightClassAvgData.TotalElbowsThrown || 0) +
      (weightClassAvgData.TotalHighKicksThrown || 0) +
      (weightClassAvgData.TotalHooksThrown || 0) +
      (weightClassAvgData.TotalJabsThrown || 0) +
      (weightClassAvgData.TotalLegKicksThrown || 0) +
      (weightClassAvgData.TotalOverhandsThrown || 0) +
      (weightClassAvgData.TotalSpinBackFistsThrown || 0) +
      (weightClassAvgData.TotalStraightsThrown || 0) +
      (weightClassAvgData.TotalUppercutsThrown || 0)
    ) / weightClassMinutes;

    return {
      ground: { landed: wcGroundLanded, thrown: wcGroundThrown },
      clinch: { landed: wcClinchLanded, thrown: wcClinchThrown },
      stand: { landed: wcStandingLanded, thrown: wcStandingThrown }
    };
  }, [weightClassAvgData]);

  // Calculate striking accuracy properly
  const calculateStrikingAccuracy = React.useCallback((): number => {
    const stats = fighter.total_stats;
    if (!stats) return 0;

    const totalMissed = (
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

    const totalLanded = stats.TotalStrikesLanded || 0;
    const totalAttempts = totalLanded + totalMissed;

    return totalAttempts > 0 ? (totalLanded / totalAttempts) * 100 : 0;
  }, [fighter.total_stats]);

  // Calculate win rate properly
  const calculateWinRate = React.useCallback((): number => {
    const stats = fighter.fight_outcome_stats;
    if (!stats) return 0;

    // Calculate total wins
    const totalWins = (
      (stats.FighterKOWins || 0) +
      (stats.FighterTKOWins || 0) +
      (stats.FighterSUBWin || 0) +
      (stats.FighterUDWins || 0) +
      (stats.FighterSplitDecWin || 0) +
      (stats.FighterMajDecWin || 0)
    );

    // Calculate total losses
    const totalLosses = (
      (stats.FighterKOLoss || 0) +
      (stats.FighterTKOLoss || 0) +
      (stats.FighterSUBLoss || 0) +
      (stats.FighterUDLoss || 0) +
      (stats.FighterSplitDecLoss || 0) +
      (stats.FighterMajDecLoss || 0)
    );

    // Get draws
    const draws = stats.FighterDraw || 0;

    // Calculate total fights (excluding no contests as they don't count towards record)
    const totalFights = totalWins + totalLosses + draws;

    // Return win percentage, avoiding division by zero
    return totalFights > 0 ? (totalWins / totalFights) * 100 : 0;
  }, [fighter.fight_outcome_stats]);

  const calculateFinishPercentage = React.useCallback(() => {
    if (!fighter.fight_outcome_stats?.FighterWins || fighter.fight_outcome_stats.FighterWins === 0) return 0;
    const finishes = (fighter.fight_outcome_stats.FighterKOWins || 0) +
                    (fighter.fight_outcome_stats.FighterTKOWins || 0) +
                    (fighter.fight_outcome_stats.FighterSUBWin || 0);
    return (finishes / fighter.fight_outcome_stats.FighterWins) * 100;
  }, [fighter.fight_outcome_stats]);

  const calculateKOTKOWinPercentage = React.useCallback(() => {
    if (!fighter.fight_outcome_stats?.FighterWins || fighter.fight_outcome_stats.FighterWins === 0) return 0;
    const koTkoWins = (fighter.fight_outcome_stats.FighterKOWins || 0) +
                     (fighter.fight_outcome_stats.FighterTKOWins || 0);
    return (koTkoWins / fighter.fight_outcome_stats.FighterWins) * 100;
  }, [fighter.fight_outcome_stats]);

  const calculateSubmissionWinPercentage = React.useCallback(() => {
    if (!fighter.fight_outcome_stats?.FighterWins || fighter.fight_outcome_stats.FighterWins === 0) return 0;
    return ((fighter.fight_outcome_stats.FighterSUBWin || 0) / fighter.fight_outcome_stats.FighterWins) * 100;
  }, [fighter.fight_outcome_stats]);

  const calculateDecisionWinPercentage = React.useCallback(() => {
    if (!fighter.fight_outcome_stats?.FighterWins || fighter.fight_outcome_stats.FighterWins === 0) return 0;
    const decisionWins = (fighter.fight_outcome_stats.FighterUDWins || 0) +
                        (fighter.fight_outcome_stats.FighterSplitDecWin || 0) +
                        (fighter.fight_outcome_stats.FighterMajDecWin || 0);
    return (decisionWins / fighter.fight_outcome_stats.FighterWins) * 100;
  }, [fighter.fight_outcome_stats]);

  const calculateKOTKOLossPercentage = React.useCallback(() => {
    if (!fighter.fight_outcome_stats?.FighterLoss || fighter.fight_outcome_stats.FighterLoss === 0) return 0;
    const koTkoLosses = (fighter.fight_outcome_stats.FighterKOLoss || 0) +
                       (fighter.fight_outcome_stats.FighterTKOLoss || 0);
    return (koTkoLosses / fighter.fight_outcome_stats.FighterLoss) * 100;
  }, [fighter.fight_outcome_stats]);

  const calculateSubmissionLossPercentage = React.useCallback(() => {
    if (!fighter.fight_outcome_stats?.FighterLoss || fighter.fight_outcome_stats.FighterLoss === 0) return 0;
    return ((fighter.fight_outcome_stats.FighterSUBLoss || 0) / fighter.fight_outcome_stats.FighterLoss) * 100;
  }, [fighter.fight_outcome_stats]);

  const calculateDecisionLossPercentage = React.useCallback(() => {
    if (!fighter.fight_outcome_stats?.FighterLoss || fighter.fight_outcome_stats.FighterLoss === 0) return 0;
    const decisionLosses = (fighter.fight_outcome_stats.FighterUDLoss || 0) +
                          (fighter.fight_outcome_stats.FighterSplitDecLoss || 0) +
                          (fighter.fight_outcome_stats.FighterMajDecLoss || 0);
    return (decisionLosses / fighter.fight_outcome_stats.FighterLoss) * 100;
  }, [fighter.fight_outcome_stats]);

  // Stance-specific win rates
  const calculateOrthodoxWinRate = React.useCallback(() => {
    return calculateWinRateVsStance(
      fighter.stance_matchup_stats?.WinsVsOrthodox,
      fighter.stance_matchup_stats?.LossesVsOrthodox
    );
  }, [fighter.stance_matchup_stats]);

  const calculateSouthpawWinRate = React.useCallback(() => {
    return calculateWinRateVsStance(
      fighter.stance_matchup_stats?.WinsVsSouthpaw,
      fighter.stance_matchup_stats?.LossesVsSouthpaw
    );
  }, [fighter.stance_matchup_stats]);

  const calculateSwitchWinRate = React.useCallback(() => {
    return calculateWinRateVsStance(
      fighter.stance_matchup_stats?.WinsVsSwitch,
      fighter.stance_matchup_stats?.LossesVsSwitch
    );
  }, [fighter.stance_matchup_stats]);

  // Calculate comprehensive striking rating (1-100)
  const calculateStrikingRating = React.useCallback((): number => {
    const fighterAccuracy = calculateStrikingAccuracy();
    const weightClassAccuracy = UFC_AVERAGES.strikingAccuracy;
    
    // Get strikes per minute data
    const fighterSPM = calculateStrikesPerMinute();
    const weightClassSPM = calculateWeightClassStrikesPerMinute();
    
    // Calculate total fighter strikes per minute
    const fighterTotalSPM = fighterSPM.stand.landed + fighterSPM.clinch.landed + fighterSPM.ground.landed;
    
    // Calculate total weight class strikes per minute
    const weightClassTotalSPM = weightClassSPM.stand.landed + weightClassSPM.clinch.landed + weightClassSPM.ground.landed;
    
    // Prevent division by zero
    if (weightClassAccuracy === 0 || weightClassTotalSPM === 0) {
      return Math.min(100, Math.max(1, fighterAccuracy));
    }
    
    // Calculate accuracy ratio (how much better/worse than weight class)
    const accuracyRatio = fighterAccuracy / weightClassAccuracy;
    
    // Calculate volume ratio (how much more/less active than weight class)
    const volumeRatio = fighterTotalSPM / weightClassTotalSPM;
    
    // Combine accuracy and volume with weights (70% accuracy, 30% volume)
    const combinedRatio = (accuracyRatio * 0.7) + (volumeRatio * 0.3);
    
    // Convert to 1-100 scale with 50 as average
    // Using tanh to create a smooth curve that approaches but doesn't exceed 1-100
    const rating = 50 + (50 * Math.tanh((combinedRatio - 1) * 2));
    
    // Ensure rating stays within 1-100 bounds
    return Math.min(100, Math.max(1, Math.round(rating)));
  }, [calculateStrikingAccuracy, calculateStrikesPerMinute, calculateWeightClassStrikesPerMinute, UFC_AVERAGES.strikingAccuracy]);

  // Calculate comprehensive takedown rating (1-100)
  const calculateTakedownRating = React.useCallback((): number => {
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
  }, [fighter, weightClassAvgData, UFC_AVERAGES.takedownSuccess]);

  // Calculate comprehensive finish rating (1-100)
  const calculateFinishRating = React.useCallback((): number => {
    const fighterFinishPercentage = calculateFinishPercentage();
    const weightClassFinishPercentage = weightClassStats.finishPercentage;
    
    // Prevent division by zero
    if (weightClassFinishPercentage === 0) {
      // If no weight class data, base rating on fighter's finish percentage
      return Math.min(100, Math.max(1, Math.round(fighterFinishPercentage)));
    }
    
    // Calculate finish ratio compared to weight class
    const finishRatio = fighterFinishPercentage / weightClassFinishPercentage;
    
    // Convert to 1-100 scale with 50 as average
    // Using tanh to create a smooth curve
    const rating = 50 + (50 * Math.tanh((finishRatio - 1) * 2));
    
    // Ensure rating stays within 1-100 bounds
    return Math.min(100, Math.max(1, Math.round(rating)));
  }, [calculateFinishPercentage, weightClassStats.finishPercentage]);

  // Calculate comprehensive defense rating (1-100)
  const calculateDefenseRating = React.useCallback((): number => {
    const strikingStats = fighter.striking_stats;
    if (!strikingStats || !weightClassAvgData) return 50; // Default to average if no data

    // Calculate fighter's total strikes absorbed
    const fighterAbsorbed = (
      (strikingStats.BodyKicksAbsorbed || 0) +
      (strikingStats.CrossesAbsorbed || 0) +
      (strikingStats.HeadKicksAbsorbed || 0) +
      (strikingStats.HooksAbsorbed || 0) +
      (strikingStats.JabsAbsorbed || 0) +
      (strikingStats.LegKicksAbsorbed || 0) +
      (strikingStats.OverhandsAbsorbed || 0) +
      (strikingStats.StraightsAbsorbed || 0) +
      (strikingStats.UppercutsAbsorbed || 0)
    );

    // Calculate weight class strikes absorbed
    const weightClassAbsorbed = (
      (weightClassAvgData.BodyKicksAbsorbed || 0) +
      (weightClassAvgData.CrossesAbsorbed || 0) +
      (weightClassAvgData.HeadKicksAbsorbed || 0) +
      (weightClassAvgData.HooksAbsorbed || 0) +
      (weightClassAvgData.JabsAbsorbed || 0) +
      (weightClassAvgData.LegKicksAbsorbed || 0) +
      (weightClassAvgData.OverhandsAbsorbed || 0) +
      (weightClassAvgData.StraightsAbsorbed || 0) +
      (weightClassAvgData.UppercutsAbsorbed || 0)
    );

    // Calculate strikes absorbed per minute for both fighter and weight class
    const fighterMinutes = fighter.MinutesTracked || 1;
    const weightClassMinutes = weightClassAvgData.minutes || 1;
    
    const fighterAbsorbedPerMinute = fighterAbsorbed / fighterMinutes;
    const weightClassAbsorbedPerMinute = weightClassAbsorbed / weightClassMinutes;

    // Prevent division by zero
    if (weightClassAbsorbedPerMinute === 0) {
      // If no weight class data, base rating on fighter's absorbed rate
      // Lower absorbed rate = better defense = higher rating
      const baseRating = Math.max(1, 100 - (fighterAbsorbedPerMinute * 10)); // Rough scaling
      return Math.round(baseRating);
    }

    // Calculate defense ratio (lower absorbed = better defense)
    // Invert the ratio so that absorbing fewer strikes than average = higher rating
    const defenseRatio = weightClassAbsorbedPerMinute / (fighterAbsorbedPerMinute || 0.01);

    // Convert to 1-100 scale with 50 as average
    // Using tanh to create a smooth curve
    const rating = 50 + (50 * Math.tanh((defenseRatio - 1) * 1.5));

    // Ensure rating stays within 1-100 bounds
    return Math.min(100, Math.max(1, Math.round(rating)));
  }, [fighter, weightClassAvgData]);

  // Calculate positional dominance rating (1-100)
  const calculatePositionalRating = React.useCallback((): number => {
    // Get positional data from fighter
    const centerOctagon = fighter.CenterOctagon || 0;
    const pushedBackToCage = fighter.PushedBackToCage || 0;
    const pushingAgainstCage = fighter.PushingAgainstCage || 0;
    const beingClinched = fighter.clinch_stats?.BeingClinched || 0;
    const inClinch = fighter.clinch_stats?.InClinch || 0;
    const onBottomGround = fighter.ground_stats?.OnBottomGround || 0;
    const onTopGround = fighter.ground_stats?.OnTopGround || 0;

    // Calculate total positional events
    const totalPositionalEvents = centerOctagon + pushedBackToCage + pushingAgainstCage + 
                                 beingClinched + inClinch + onBottomGround + onTopGround;

    // Prevent division by zero
    if (totalPositionalEvents === 0) return 50; // Neutral if no positional data

    // Define dominant vs submissive positions
    const dominantPositions = centerOctagon + pushingAgainstCage + inClinch + onTopGround;
    const submissivePositions = pushedBackToCage + beingClinched + onBottomGround;

    // Calculate dominance ratio (dominant / total)
    const dominanceRatio = dominantPositions / totalPositionalEvents;

    // Convert to 1-100 scale with harsher scaling around 50
    // Using a sigmoid-like function to make it more sensitive around the middle
    let rating;
    if (dominanceRatio <= 0.5) {
      // Below 50% dominant: scale from 1 to 50
      rating = 1 + (49 * (dominanceRatio / 0.5));
    } else {
      // Above 50% dominant: scale from 50 to 100
      rating = 50 + (50 * ((dominanceRatio - 0.5) / 0.5));
    }

    // Ensure rating stays within 1-100 bounds
    return Math.min(100, Math.max(1, Math.round(rating)));
  }, [fighter]);

  // Calculate overall fighter rating with weighted metrics and sophisticated archetype analysis
  const calculateOverallRating = React.useCallback((): { rating: number; archetype: string; strengths: string[]; weaknesses: string[] } => {
    const strikingRating = calculateStrikingRating();
    const aggressionRating = calculateAggressivenessRating();
    const takedownRating = calculateTakedownRating();
    const defenseRating = calculateDefenseRating();
    const finishRating = calculateFinishRating();
    const positionRating = calculatePositionalRating();

    // Analyze fighter data fields for archetype determination
    const analyzeFighterData = () => {
      const totalFights = fighter.FightsTracked || 0;
      const totalRounds = fighter.RoundsTracked || 0;
      const totalWins = fighter.fight_outcome_stats?.FighterWins || 0;
      const totalLosses = fighter.fight_outcome_stats?.FighterLoss || 0;
      const winRate = totalFights > 0 ? (totalWins / totalFights) * 100 : 0;
      
      // Striking analysis
      const totalStrikesLanded = fighter.total_stats?.TotalStrikesLanded || 0;
      const totalStrikesThrown = fighter.total_stats?.TotalStrikesThrown || 0;
      const strikingAccuracy = totalStrikesThrown > 0 ? (totalStrikesLanded / totalStrikesThrown) * 100 : 0;
      
      // Grappling analysis
      const takedownsLanded = fighter.takedown_stats?.TakedownsLanded || 0;
      const takedownsAttempted = fighter.takedown_stats?.TakedownsAttempted || 0;
      const takedownAccuracy = takedownsAttempted > 0 ? (takedownsLanded / takedownsAttempted) * 100 : 0;
      
      // Finish analysis
      const koWins = fighter.fight_outcome_stats?.FighterKOWins || 0;
      const tkoWins = fighter.fight_outcome_stats?.FighterTKOWins || 0;
      const subWins = fighter.fight_outcome_stats?.FighterSUBWin || 0;
      const decisionWins = (fighter.fight_outcome_stats?.FighterUDWins || 0) + 
                          (fighter.fight_outcome_stats?.FighterSplitDecWin || 0) + 
                          (fighter.fight_outcome_stats?.FighterMajDecWin || 0);
      
      const totalFinishes = koWins + tkoWins + subWins;
      const finishRate = totalWins > 0 ? (totalFinishes / totalWins) * 100 : 0;
      
      // Positional analysis
      const centerOctagon = fighter.CenterOctagon || 0;
      const pushedBackToCage = fighter.PushedBackToCage || 0;
      const onTopGround = fighter.ground_stats?.OnTopGround || 0;
      const onBottomGround = fighter.ground_stats?.OnBottomGround || 0;
      
      const dominantPositions = centerOctagon + onTopGround;
      const defensivePositions = pushedBackToCage + onBottomGround;
      const totalPositions = dominantPositions + defensivePositions;
      const dominanceRatio = totalPositions > 0 ? dominantPositions / totalPositions : 0.5;
      
      // Aggression analysis
      const strikesPerMinute = fighter.total_stats?.StrikesPerMinute || 0;
      const weightClassStrikesPerMinute = weightClassAvgData?.total_stats?.StrikesPerMinute || 0;
      const aggressionRatio = weightClassStrikesPerMinute > 0 ? strikesPerMinute / weightClassStrikesPerMinute : 1;
      
      return {
        totalFights,
        totalRounds,
        winRate,
        strikingAccuracy,
        takedownAccuracy,
        finishRate,
        dominanceRatio,
        aggressionRatio,
        koWins,
        tkoWins,
        subWins,
        decisionWins,
        totalFinishes,
        totalStrikesLanded,
        takedownsLanded
      };
    };

    const fighterData = analyzeFighterData();

    // Determine fighter style and adjust weights accordingly
    const determineFighterStyle = () => {
      const { 
        strikingAccuracy, takedownAccuracy, finishRate, 
        koWins, tkoWins, subWins, totalFinishes, totalStrikesLanded, takedownsLanded 
      } = fighterData;

      // Use the actual ratings to determine style more accurately
      const strikingRating = calculateStrikingRating();
      const takedownRating = calculateTakedownRating();
      const positionRating = calculatePositionalRating();
      const finishRating = calculateFinishRating();
      
      // Calculate style indicators with rating-based logic
      const strikingDominance = strikingRating >= 65;
      const grapplingDominance = takedownRating >= 70 || positionRating >= 75;
      const finishingDominance = finishRating >= 60;
      
      // Determine primary style with priority for clear specialists
      if (takedownRating >= 80 && positionRating >= 80) {
        return "grappler"; // Clear grappling specialist
      } else if (strikingRating >= 80 && takedownRating <= 50) {
        return "striker"; // Clear striking specialist
      } else if (finishRating >= 75 && (koWins + tkoWins) > subWins) {
        return "knockout_artist"; // Clear KO specialist
      } else if (finishRating >= 75 && subWins > (koWins + tkoWins)) {
        return "submission_specialist"; // Clear submission specialist
      } else if (grapplingDominance && !strikingDominance) {
        return "grappler";
      } else if (strikingDominance && !grapplingDominance) {
        return "striker";
      } else if (finishingDominance && (koWins + tkoWins) > subWins) {
        return "knockout_artist";
      } else if (finishingDominance && subWins > (koWins + tkoWins)) {
        return "submission_specialist";
      } else if (strikingDominance && grapplingDominance) {
        return "mixed";
      } else {
        return "balanced";
      }
    };

    const fighterStyle = determineFighterStyle();

    // Dynamic weight calculation based on fighter style with specialist bonuses
    const getDynamicWeights = (style: string) => {
      switch (style) {
        case "striker":
          return {
            striking: 0.40,    // Much higher for strikers
            defense: 0.25,     // Still important
            takedowns: 0.05,   // Much lower for strikers
            aggression: 0.15,  // Important for strikers
            finishes: 0.10,    // Important for strikers
            position: 0.05     // Less important for strikers
          };
        case "grappler":
          return {
            striking: 0.10,    // Lower for grapplers
            defense: 0.20,     // Still important
            takedowns: 0.35,   // Much higher for grapplers
            aggression: 0.05,  // Less important for grapplers
            finishes: 0.15,    // Important for grapplers
            position: 0.15     // Important for grapplers
          };
        case "knockout_artist":
          return {
            striking: 0.35,    // High for KO artists
            defense: 0.10,     // Can be lower for KO artists
            takedowns: 0.05,   // Lower for KO artists
            aggression: 0.25,  // Very important for KO artists
            finishes: 0.20,    // Very important for KO artists
            position: 0.05     // Less important for KO artists
          };
        case "submission_specialist":
          return {
            striking: 0.05,    // Lower for submission specialists
            defense: 0.20,     // Still important
            takedowns: 0.30,   // High for submission specialists
            aggression: 0.05,  // Less important
            finishes: 0.30,    // Very important for submission specialists
            position: 0.10     // Important for submission specialists
          };
        case "mixed":
          return {
            striking: 0.25,    // Balanced
            defense: 0.20,     // Balanced
            takedowns: 0.20,   // Balanced
            aggression: 0.15,  // Balanced
            finishes: 0.12,    // Balanced
            position: 0.08     // Balanced
          };
        default: // balanced
          return {
            striking: 0.25,    // Default balanced weights
            defense: 0.20,
            takedowns: 0.18,
            aggression: 0.15,
            finishes: 0.12,
            position: 0.10
          };
      }
    };

    const weights = getDynamicWeights(fighterStyle);

    const weightedRating = (
      strikingRating * weights.striking +
      defenseRating * weights.defense +
      takedownRating * weights.takedowns +
      (typeof aggressionRating === 'number' ? aggressionRating : 50) * weights.aggression +
      finishRating * weights.finishes +
      positionRating * weights.position
    );

    // Add specialist bonuses for fighters who excel in their chosen style
    const calculateSpecialistBonus = () => {
      let bonus = 0;
      
      switch (fighterStyle) {
        case "striker":
          if (strikingRating >= 75) bonus += 8;
          if (strikingRating >= 80) bonus += 5;
          if (defenseRating >= 70) bonus += 3;
          break;
        case "grappler":
          if (takedownRating >= 75) bonus += 8;
          if (positionRating >= 75) bonus += 8;
          if (takedownRating >= 80 && positionRating >= 80) bonus += 5;
          if (defenseRating >= 70) bonus += 3;
          break;
        case "knockout_artist":
          if (finishRating >= 75) bonus += 8;
          if (strikingRating >= 70) bonus += 5;
          if (typeof aggressionRating === 'number' && aggressionRating >= 70) bonus += 3;
          break;
        case "submission_specialist":
          if (finishRating >= 75) bonus += 8;
          if (takedownRating >= 70) bonus += 5;
          if (positionRating >= 70) bonus += 3;
          break;
        case "mixed":
          if (strikingRating >= 70 && takedownRating >= 70) bonus += 8;
          if (defenseRating >= 70) bonus += 5;
          break;
      }
      
      return bonus;
    };

    const specialistBonus = calculateSpecialistBonus();
    const overallRating = Math.min(99, Math.round(weightedRating + specialistBonus));

    // Determine archetype based on data patterns and fighter style
    const determineArchetype = () => {
      const { 
        winRate, strikingAccuracy, takedownAccuracy, finishRate, 
        dominanceRatio, aggressionRatio, koWins, tkoWins, subWins, 
        decisionWins, totalFinishes, totalStrikesLanded, takedownsLanded 
      } = fighterData;

      // Elite fighters (85+ overall)
      if (overallRating >= 85) {
        if (fighterStyle === "striker") return "Elite Striker";
        if (fighterStyle === "grappler") return "Elite Grappler";
        if (fighterStyle === "knockout_artist") return "Elite Knockout Artist";
        if (fighterStyle === "submission_specialist") return "Elite Submission Specialist";
        return "Elite Mixed Martial Artist";
      }

      // High-level fighters (75-84 overall)
      if (overallRating >= 75) {
        if (fighterStyle === "striker") return "Striking Specialist";
        if (fighterStyle === "grappler") return "Grappling Specialist";
        if (fighterStyle === "knockout_artist") return "Knockout Artist";
        if (fighterStyle === "submission_specialist") return "Submission Specialist";
        if (winRate >= 75 && decisionWins > totalFinishes) return "Decision Machine";
        return "Well-Rounded Fighter";
      }

      // Mid-level fighters (60-74 overall)
      if (overallRating >= 60) {
        if (fighterStyle === "striker") return "Striker";
        if (fighterStyle === "grappler") return "Grappler";
        if (fighterStyle === "knockout_artist") return "Power Puncher";
        if (fighterStyle === "submission_specialist") return "Submission Artist";
        if (aggressionRatio >= 1.2) return "Aggressive Fighter";
        if (dominanceRatio >= 0.6) return "Positional Fighter";
        return "Balanced Fighter";
      }

      // Lower-level fighters (below 60)
      if (fighterStyle === "striker") return "One-Dimensional Striker";
      if (fighterStyle === "grappler") return "One-Dimensional Grappler";
      if (fighterStyle === "knockout_artist") return "Power Puncher";
      if (fighterStyle === "submission_specialist") return "Submission Artist";
      if (aggressionRatio >= 1.1) return "Aggressive but Limited";
      if (dominanceRatio <= 0.3) return "Defensive Fighter";
      return "Technical Fighter";
    };

    // Determine top 2 strengths based on data analysis
    const determineStrengths = () => {
      const strengths: { name: string; score: number }[] = [];
      const { 
        winRate, strikingAccuracy, takedownAccuracy, finishRate, 
        dominanceRatio, aggressionRatio, koWins, tkoWins, subWins,
        totalStrikesLanded, takedownsLanded, totalFights
      } = fighterData;

      // Striking strength
      if (strikingAccuracy >= 55 || totalStrikesLanded > 100) {
        strengths.push({ 
          name: strikingAccuracy >= 60 ? "Technical Striking" : "Striking Volume", 
          score: strikingAccuracy 
        });
      }

      // Grappling strength
      if (takedownAccuracy >= 40 || takedownsLanded > 10) {
        strengths.push({ 
          name: takedownAccuracy >= 50 ? "Technical Grappling" : "Grappling Control", 
          score: takedownAccuracy 
        });
      }

      // Finishing strength
      if (finishRate >= 50 || (koWins + tkoWins) > 3) {
        strengths.push({ 
          name: (koWins + tkoWins) > subWins ? "Knockout Power" : "Submission Game", 
          score: finishRate 
        });
      }

      // Aggression strength
      if (aggressionRatio >= 1.1) {
        strengths.push({ 
          name: "Fighting Aggression", 
          score: aggressionRatio * 50 
        });
      }

      // Positional strength
      if (dominanceRatio >= 0.6) {
        strengths.push({ 
          name: "Positional Control", 
          score: dominanceRatio * 100 
        });
      }

      // Win rate strength
      if (winRate >= 70 && totalFights >= 5) {
        strengths.push({ 
          name: "Fight IQ", 
          score: winRate 
        });
      }

      // Sort by score and return top 2
      strengths.sort((a, b) => b.score - a.score);
      return strengths.slice(0, 2).map(s => s.name);
    };

    // Determine primary weakness based on data analysis
    const determineWeaknesses = () => {
      const { 
        winRate, strikingAccuracy, takedownAccuracy, finishRate, 
        dominanceRatio, aggressionRatio, totalFights, totalStrikesLanded, takedownsLanded
      } = fighterData;

      // Check for major weaknesses
      if (strikingAccuracy < 40 && totalStrikesLanded < 50) {
        return ["Striking Fundamentals"];
      }

      if (takedownAccuracy < 30 && takedownsLanded < 5) {
        return ["Grappling Defense"];
      }

      if (finishRate < 30 && totalFights >= 5) {
        return ["Finishing Ability"];
      }

      if (aggressionRatio < 0.8) {
        return ["Fighting Aggression"];
      }

      if (dominanceRatio < 0.4) {
        return ["Positional Control"];
      }

      if (winRate < 50 && totalFights >= 5) {
        return ["Fight Strategy"];
      }

      // Default weaknesses based on lowest ratings
      const ratingWeaknesses = [
        { name: "Striking", rating: strikingRating },
        { name: "Defense", rating: defenseRating },
        { name: "Takedowns", rating: takedownRating },
        { name: "Aggression", rating: typeof aggressionRating === 'number' ? aggressionRating : 50 },
        { name: "Finishes", rating: finishRating },
        { name: "Position", rating: positionRating }
      ];

      ratingWeaknesses.sort((a, b) => a.rating - b.rating);
      return [ratingWeaknesses[0].name];
    };

    return {
      rating: overallRating,
      archetype: determineArchetype(),
      strengths: determineStrengths(),
      weaknesses: determineWeaknesses()
    };
  }, [fighter, weightClassAvgData, calculateStrikingRating, calculateAggressivenessRating, calculateTakedownRating, calculateDefenseRating, calculateFinishRating, calculatePositionalRating]);

  // Enhanced radar data preparation
  const prepareRadarData = React.useMemo(() => {
    const aggressivenessRating = calculateAggressivenessRating();
    const hasAggressivenessData = typeof aggressivenessRating === 'number';
    
    return [
      {
        subject: 'Striking',
        value: calculateStrikingRating(),
        ufc_average: 50, // Average is always 50 in our rating system
        fullMark: 100,
        description: 'Comprehensive striking rating based on accuracy and volume vs weight class'
      },
      {
        subject: 'Aggression',
        value: hasAggressivenessData ? aggressivenessRating : 0,
        ufc_average: 50, // Average is always 50 in our rating system
        fullMark: 100,
        description: hasAggressivenessData ? 'Fighting aggressiveness compared to weight class peers' : 'Insufficient data for aggressiveness rating'
      },
      {
        subject: 'Finishes',
        value: calculateFinishRating(),
        ufc_average: 50, // Average is always 50 in our rating system
        fullMark: 100,
        description: 'Finish rate effectiveness compared to weight class average'
      },
      {
        subject: 'Takedowns',
        value: calculateTakedownRating(),
        ufc_average: 50, // Average is always 50 in our rating system
        fullMark: 100,
        description: 'Takedown effectiveness based on success rate and frequency vs weight class'
      },
      {
        subject: 'Defense',
        value: calculateDefenseRating(),
        ufc_average: 50, // Average is always 50 in our rating system
        fullMark: 100,
        description: 'Striking defense rating based on strikes absorbed vs weight class average'
      },
      {
        subject: 'Position',
        value: calculatePositionalRating(),
        ufc_average: 50, // Average is always 50 in our rating system
        fullMark: 100,
        description: 'Positional dominance: 50=balanced, higher=more dominant positions, lower=more defensive'
      }
    ];
  }, [calculateFinishRating, calculateStrikingRating, calculateAggressivenessRating, calculateTakedownRating, calculateDefenseRating, calculatePositionalRating]);

  return {
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
  };
}; 