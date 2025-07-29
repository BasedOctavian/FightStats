import React from 'react';
import { Fighter } from '../../types/firestore';

interface OverallRatingResult {
  rating: number;
  archetype: string;
  strengths: string[];
  weaknesses: string[];
}

// Helper function to calculate weight class averages
const calculateWeightClassAverages = (weightClassData: any) => {
  if (!weightClassData) {
    return {
      strikingAccuracy: 50,
      takedownSuccess: 38,
      takedownDefense: 62,
      submissionSuccess: 15,
      koTkoRate: 25,
      positionalDominance: 50,
      finishPercentage: 40,
      bodyKickAccuracy: 45,
      headKickAccuracy: 35,
      legKickAccuracy: 55,
      jabAccuracy: 60,
      hookAccuracy: 50,
      elbowAccuracy: 40,
      uppercutAccuracy: 45,
      bodyKickDefense: 55,
      headKickDefense: 65,
      legKickDefense: 45,
      jabDefense: 40,
      hookDefense: 50,
      straightDefense: 45,
      uppercutDefense: 50
    };
  }

  return {
    strikingAccuracy: weightClassData.strikingAccuracy || 50,
    takedownSuccess: weightClassData.takedownSuccess || 38,
    takedownDefense: weightClassData.takedownDefense || 62,
    submissionSuccess: weightClassData.submissionSuccess || 15,
    koTkoRate: weightClassData.koTkoRate || 25,
    positionalDominance: weightClassData.positionalDominance || 50,
    finishPercentage: weightClassData.finishPercentage || 40,
    bodyKickAccuracy: weightClassData.bodyKickAccuracy || 45,
    headKickAccuracy: weightClassData.headKickAccuracy || 35,
    legKickAccuracy: weightClassData.legKickAccuracy || 55,
    jabAccuracy: weightClassData.jabAccuracy || 60,
    hookAccuracy: weightClassData.hookAccuracy || 50,
    elbowAccuracy: weightClassData.elbowAccuracy || 40,
    uppercutAccuracy: weightClassData.uppercutAccuracy || 45,
    bodyKickDefense: weightClassData.bodyKickDefense || 55,
    headKickDefense: weightClassData.headKickDefense || 65,
    legKickDefense: weightClassData.legKickDefense || 45,
    jabDefense: weightClassData.jabDefense || 40,
    hookDefense: weightClassData.hookDefense || 50,
    straightDefense: weightClassData.straightDefense || 45,
    uppercutDefense: weightClassData.uppercutDefense || 50
  };
};

export const useOverallRating = (fighter: Fighter, weightClassAvgData?: any): OverallRatingResult => {
  // Calculate weight class averages
  const UFC_AVERAGES = React.useMemo(() => calculateWeightClassAverages(weightClassAvgData), [weightClassAvgData]);

  // Calculate striking accuracy
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

  // Calculate strikes per minute
  const calculateStrikesPerMinute = React.useCallback(() => {
    const minutesTracked = fighter.MinutesTracked || 1;
    
    const groundLanded = (fighter.ground_stats?.TotalGroundStrikesMade || 0) / minutesTracked;
    const groundThrown = (fighter.ground_stats?.TotalGroundStrikesThrown || 0) / minutesTracked;
    const clinchLanded = (fighter.clinch_stats?.TotalClinchStrikesMade || 0) / minutesTracked;
    const clinchThrown = (fighter.clinch_stats?.TotalClinchStrikesThrown || 0) / minutesTracked;
    
    const standingLanded = (
      (fighter.total_stats?.TotalBodyKicksMade || 0) +
      (fighter.total_stats?.TotalElbowsMade || 0) +
      (fighter.total_stats?.TotalHighKicksMade || 0) +
      (fighter.total_stats?.TotalHooksMade || 0) +
      (fighter.total_stats?.TotalJabsMade || 0) +
      (fighter.total_stats?.TotalLegKicksMade || 0) +
      (fighter.total_stats?.TotalOverhandsMade || 0) +
      (fighter.total_stats?.TotalSpinBackFistsMade || 0) +
      (fighter.total_stats?.TotalStraightsMade || 0) +
      (fighter.total_stats?.TotalUppercutsMade || 0)
    ) / minutesTracked;
    
    const standingThrown = (
      (fighter.total_stats?.TotalBodyKicksThrown || 0) +
      (fighter.total_stats?.TotalElbowsThrown || 0) +
      (fighter.total_stats?.TotalHighKicksThrown || 0) +
      (fighter.total_stats?.TotalHooksThrown || 0) +
      (fighter.total_stats?.TotalJabsThrown || 0) +
      (fighter.total_stats?.TotalLegKicksThrown || 0) +
      (fighter.total_stats?.TotalOverhandsThrown || 0) +
      (fighter.total_stats?.TotalSpinBackFistsThrown || 0) +
      (fighter.total_stats?.TotalStraightsThrown || 0) +
      (fighter.total_stats?.TotalUppercutsThrown || 0)
    ) / minutesTracked;

    return {
      ground: { landed: groundLanded, thrown: groundThrown },
      clinch: { landed: clinchLanded, thrown: clinchThrown },
      stand: { landed: standingLanded, thrown: standingThrown }
    };
  }, [fighter]);

  // Calculate weight class strikes per minute
  const calculateWeightClassStrikesPerMinute = React.useCallback(() => {
    const weightClassMinutes = weightClassAvgData?.minutes || 1;
    
    const wcGroundLanded = (weightClassAvgData?.TotalGroundStrikesMade || 0) / weightClassMinutes;
    const wcGroundThrown = (weightClassAvgData?.TotalGroundStrikesThrown || 0) / weightClassMinutes;
    const wcClinchLanded = (weightClassAvgData?.TotalClinchStrikesMade || 0) / weightClassMinutes;
    const wcClinchThrown = (weightClassAvgData?.TotalClinchStrikesThrown || 0) / weightClassMinutes;
    
    const wcStandingLanded = (
      (weightClassAvgData?.TotalBodyKicksMade || 0) +
      (weightClassAvgData?.TotalElbowsMade || 0) +
      (weightClassAvgData?.TotalHighKicksMade || 0) +
      (weightClassAvgData?.TotalHooksMade || 0) +
      (weightClassAvgData?.TotalJabsMade || 0) +
      (weightClassAvgData?.TotalLegKicksMade || 0) +
      (weightClassAvgData?.TotalOverhandsMade || 0) +
      (weightClassAvgData?.TotalSpinBackFistsMade || 0) +
      (weightClassAvgData?.TotalStraightsMade || 0) +
      (weightClassAvgData?.TotalUppercutsMade || 0)
    ) / weightClassMinutes;
    
    const wcStandingThrown = (
      (weightClassAvgData?.TotalBodyKicksThrown || 0) +
      (weightClassAvgData?.TotalElbowsThrown || 0) +
      (weightClassAvgData?.TotalHighKicksThrown || 0) +
      (weightClassAvgData?.TotalHooksThrown || 0) +
      (weightClassAvgData?.TotalJabsThrown || 0) +
      (weightClassAvgData?.TotalLegKicksThrown || 0) +
      (weightClassAvgData?.TotalOverhandsThrown || 0) +
      (weightClassAvgData?.TotalSpinBackFistsThrown || 0) +
      (weightClassAvgData?.TotalStraightsThrown || 0) +
      (weightClassAvgData?.TotalUppercutsThrown || 0)
    ) / weightClassMinutes;

    return {
      ground: { landed: wcGroundLanded, thrown: wcGroundThrown },
      clinch: { landed: wcClinchLanded, thrown: wcClinchThrown },
      stand: { landed: wcStandingLanded, thrown: wcStandingThrown }
    };
  }, [weightClassAvgData]);

  // Calculate striking rating
  const calculateStrikingRating = React.useCallback((): number => {
    const fighterAccuracy = calculateStrikingAccuracy();
    const weightClassAccuracy = UFC_AVERAGES.strikingAccuracy;
    
    const fighterSPM = calculateStrikesPerMinute();
    const weightClassSPM = calculateWeightClassStrikesPerMinute();
    
    const fighterTotalSPM = fighterSPM.stand.landed + fighterSPM.clinch.landed + fighterSPM.ground.landed;
    const weightClassTotalSPM = weightClassSPM.stand.landed + weightClassSPM.clinch.landed + weightClassSPM.ground.landed;
    
    if (weightClassAccuracy === 0 || weightClassTotalSPM === 0) {
      return Math.min(100, Math.max(1, fighterAccuracy));
    }
    
    const accuracyRatio = fighterAccuracy / weightClassAccuracy;
    const volumeRatio = fighterTotalSPM / weightClassTotalSPM;
    const combinedRatio = (accuracyRatio * 0.7) + (volumeRatio * 0.3);
    const rating = 50 + (50 * Math.tanh((combinedRatio - 1) * 2));
    
    return Math.min(100, Math.max(1, Math.round(rating)));
  }, [calculateStrikingAccuracy, calculateStrikesPerMinute, calculateWeightClassStrikesPerMinute, UFC_AVERAGES.strikingAccuracy]);

  // Calculate aggressiveness rating
  const calculateAggressivenessRating = React.useCallback((): number | "Insufficient data" => {
    if (!fighter.FightsTracked || fighter.FightsTracked < 5) {
      return "Insufficient data";
    }

    const EPSILON = 0.001;
    const fighterMinutes = fighter.MinutesTracked || EPSILON;
    const classMinutes = weightClassAvgData?.minutes || EPSILON;

    const fighterStrikeRate = (
      (fighter.total_stats?.TotalPunchesThrown || 0) +
      (fighter.total_stats?.TotalKicksThrown || 0) +
      (fighter.total_stats?.TotalElbowsThrown || 0) +
      (fighter.total_stats?.TotalSpinBackFistsThrown || 0) +
      (fighter.clinch_stats?.TotalClinchStrikesThrown || 0) +
      (fighter.ground_stats?.TotalGroundStrikesThrown || 0)
    ) / fighterMinutes;

    const classStrikeRate = weightClassAvgData ? (
      (weightClassAvgData.TotalPunchesThrown || 0) +
      (weightClassAvgData.TotalKicksThrown || 0) +
      (weightClassAvgData.TotalElbowsThrown || 0) +
      (weightClassAvgData.TotalSpinBackFistsThrown || 0) +
      (weightClassAvgData.TotalClinchStrikesThrown || 0) +
      (weightClassAvgData.TotalGroundStrikesThrown || 0)
    ) / classMinutes : 0;

    const strikeRatio = classStrikeRate > 0 ? fighterStrikeRate / classStrikeRate : 1.0;
    
    const takedownRatio = (() => {
      const fighterTakedowns = (fighter.takedown_stats?.TakedownsLanded || 0) / fighterMinutes;
      const classTakedowns = weightClassAvgData ? (weightClassAvgData.TakedownsLanded || 0) / classMinutes : 0;
      return classTakedowns > 0 ? fighterTakedowns / classTakedowns : 1.0;
    })();
    
    const subRatio = (() => {
      const fighterSubs = (fighter.submission_stats?.SubmissionsAttempted || 0) / fighterMinutes;
      const classSubs = weightClassAvgData ? (weightClassAvgData.SubmissionsAttempted || 0) / classMinutes : 0;
      return classSubs > 0 ? fighterSubs / classSubs : 1.0;
    })();
    
    const posRatio = (() => {
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
      return fighterPosRate / 50;
    })();

    const compositeRatio = (strikeRatio + takedownRatio + subRatio + posRatio) / 4;
    const score = Math.round(50 + 49 * Math.tanh(compositeRatio - 1));
    return Math.min(99, Math.max(1, score));
  }, [fighter, weightClassAvgData]);

  // Calculate grappling grade
  const calculateGrapplingGrade = React.useCallback((): number => {
    const takedownStats = fighter.takedown_stats;
    const submissionStats = fighter.submission_stats;
    const clinchStats = fighter.clinch_stats;
    const groundStats = fighter.ground_stats;
    
    if (!takedownStats || !weightClassAvgData) return 50;

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

    const weightClassAttempts = (
      (weightClassAvgData.BodyLockTakedownAttempts || 0) +
      (weightClassAvgData.DoubleLegTakedownAttempts || 0) +
      (weightClassAvgData.SingleLegTakedownAttempts || 0) +
      (weightClassAvgData.TripTakedownAttempts || 0) +
      (weightClassAvgData.AttemptedThrowTD || 0)
    );

    const ufcAverageSuccessRate = 0.38;
    const fighterSuccessRate = fighterAttempts > 0 ? fighterSuccesses / fighterAttempts : 0;
    const fighterFights = fighter.FightsTracked || 1;
    const weightClassFights = weightClassAvgData.fights || 1;
    
    const fighterAttemptsPerFight = fighterAttempts / fighterFights;
    const weightClassAttemptsPerFight = weightClassAttempts / weightClassFights;
    
    const normalizeValue = (fighterValue: number, weightClassValue: number) => {
      if (weightClassValue === 0) return 50;
      const ratio = fighterValue / weightClassValue;
      return 50 + (50 * Math.tanh((ratio - 1) * 2));
    };

    const takedownAccuracyRating = normalizeValue(fighterSuccessRate, ufcAverageSuccessRate);
    const takedownVolumeRating = normalizeValue(fighterAttemptsPerFight, weightClassAttemptsPerFight);
    const takedownRating = (takedownAccuracyRating * 0.6) + (takedownVolumeRating * 0.4);
    
    let submissionRating = 50;
    if (submissionStats && weightClassAvgData) {
      const fighterSubAttempts = submissionStats.SubmissionsAttempted || 0;
      const fighterSubSuccesses = submissionStats.SubmissionsSuccessful || 0;
      const weightClassSubAttempts = weightClassAvgData.SubmissionsAttempted || 0;
      const weightClassSubSuccesses = weightClassAvgData.SubmissionsSuccessful || 0;
      
      const fighterSubRate = fighterSubAttempts > 0 ? fighterSubSuccesses / fighterSubAttempts : 0;
      const weightClassSubRate = weightClassSubAttempts > 0 ? weightClassSubSuccesses / weightClassSubAttempts : 0;
      
      const fighterSubsPerFight = fighterSubAttempts / fighterFights;
      const weightClassSubsPerFight = weightClassSubAttempts / weightClassFights;
      
      const subAccuracyRating = normalizeValue(fighterSubRate, weightClassSubRate);
      const subVolumeRating = normalizeValue(fighterSubsPerFight, weightClassSubsPerFight);
      submissionRating = (subAccuracyRating * 0.7) + (subVolumeRating * 0.3);
    }
    
    let clinchRating = 50;
    if (clinchStats && weightClassAvgData) {
      const fighterClinchTime = clinchStats.InClinch || 0;
      const fighterBeingClinched = clinchStats.BeingClinched || 0;
      const weightClassClinchTime = weightClassAvgData.InClinch || 0;
      const weightClassBeingClinched = weightClassAvgData.BeingClinched || 0;
      
      const fighterClinchRatio = (fighterClinchTime + fighterBeingClinched) > 0 ? 
        fighterClinchTime / (fighterClinchTime + fighterBeingClinched) : 0.5;
      const weightClassClinchRatio = (weightClassClinchTime + weightClassBeingClinched) > 0 ? 
        weightClassClinchTime / (weightClassClinchTime + weightClassBeingClinched) : 0.5;
      
      const clinchControlRating = normalizeValue(fighterClinchRatio, weightClassClinchRatio);
      const clinchStrikingAccuracy = clinchStats.TotalClinchStrikesThrown > 0 ? 
        (clinchStats.TotalClinchStrikesMade / clinchStats.TotalClinchStrikesThrown) * 100 : 0;
      const weightClassClinchStrikingAccuracy = weightClassAvgData.clinchStrikingAccuracy || 40;
      
      const clinchStrikingRating = normalizeValue(clinchStrikingAccuracy, weightClassClinchStrikingAccuracy);
      clinchRating = (clinchControlRating * 0.6) + (clinchStrikingRating * 0.4);
    }
    
    let groundGameRating = 50;
    if (groundStats && weightClassAvgData) {
      const groundControlPercentage = groundStats.OnTopGround && groundStats.OnBottomGround ? 
        (groundStats.OnTopGround / (groundStats.OnTopGround + groundStats.OnBottomGround)) * 100 : 50;
      
      const groundStrikingAccuracy = groundStats.TotalGroundStrikesThrown > 0 ? 
        (groundStats.TotalGroundStrikesMade / groundStats.TotalGroundStrikesThrown) * 100 : 0;
      
      const groundStrikesPerRound = groundStats.TotalGroundStrikesThrown / (fighter.RoundsTracked || 1);
      
      const weightClassGroundStrikingAccuracy = weightClassAvgData.groundStrikingAccuracy || 40;
      const weightClassGroundStrikesPerRound = weightClassAvgData.groundStrikesPerRound || 2.0;

      const groundControlRating = normalizeValue(groundControlPercentage, 50);
      const groundStrikingRating = normalizeValue(groundStrikingAccuracy, weightClassGroundStrikingAccuracy);
      const groundVolumeRating = normalizeValue(groundStrikesPerRound, weightClassGroundStrikesPerRound);
      
      groundGameRating = (groundControlRating * 0.4) + (groundStrikingRating * 0.3) + (groundVolumeRating * 0.3);
      groundGameRating = Math.min(100, Math.max(1, Math.round(groundGameRating)));
    }

    const combinedRating = (takedownRating * 0.35) + (submissionRating * 0.15) + (clinchRating * 0.2) + (groundGameRating * 0.3);
    return Math.min(100, Math.max(1, Math.round(combinedRating)));
  }, [fighter, weightClassAvgData]);

  // Calculate defense rating
  const calculateDefenseRating = React.useCallback((): number => {
    const fighterMinutes = fighter.MinutesTracked || 1;
    const weightClassMinutes = weightClassAvgData?.minutes || 1;
    
    const normalizeValue = (fighterValue: number, weightClassValue: number) => {
      if (weightClassValue === 0) return 50;
      const ratio = fighterValue / weightClassValue;
      // For defense, lower is better, so invert the ratio
      return 50 + (50 * Math.tanh((1 - ratio) * 2));
    };

    const headKicksDefenseRating = normalizeValue(
      (fighter.striking_stats?.HeadKicksAbsorbed || 0) / fighterMinutes,
      (weightClassAvgData?.HeadKicksAbsorbed || 0) / weightClassMinutes
    );
    const bodyKicksDefenseRating = normalizeValue(
      (fighter.striking_stats?.BodyKicksAbsorbed || 0) / fighterMinutes,
      (weightClassAvgData?.BodyKicksAbsorbed || 0) / weightClassMinutes
    );
    const hooksDefenseRating = normalizeValue(
      (fighter.striking_stats?.HooksAbsorbed || 0) / fighterMinutes,
      (weightClassAvgData?.HooksAbsorbed || 0) / weightClassMinutes
    );
    const jabsDefenseRating = normalizeValue(
      (fighter.striking_stats?.JabsAbsorbed || 0) / fighterMinutes,
      (weightClassAvgData?.JabsAbsorbed || 0) / weightClassMinutes
    );
    const legKicksDefenseRating = normalizeValue(
      (fighter.striking_stats?.LegKicksAbsorbed || 0) / fighterMinutes,
      (weightClassAvgData?.LegKicksAbsorbed || 0) / weightClassMinutes
    );
    const overhandsDefenseRating = normalizeValue(
      (fighter.striking_stats?.OverhandsAbsorbed || 0) / fighterMinutes,
      (weightClassAvgData?.OverhandsAbsorbed || 0) / weightClassMinutes
    );
    const straightsDefenseRating = normalizeValue(
      (fighter.striking_stats?.StraightsAbsorbed || 0) / fighterMinutes,
      (weightClassAvgData?.StraightsAbsorbed || 0) / weightClassMinutes
    );
    const uppercutsDefenseRating = normalizeValue(
      (fighter.striking_stats?.UppercutsAbsorbed || 0) / fighterMinutes,
      (weightClassAvgData?.UppercutsAbsorbed || 0) / weightClassMinutes
    );
    
    const overallDefenseRating = (
      headKicksDefenseRating * 0.2 +
      hooksDefenseRating * 0.15 +
      overhandsDefenseRating * 0.15 +
      uppercutsDefenseRating * 0.15 +
      bodyKicksDefenseRating * 0.1 +
      straightsDefenseRating * 0.1 +
      legKicksDefenseRating * 0.1 +
      jabsDefenseRating * 0.05
    );
    
    return Math.round(overallDefenseRating);
  }, [fighter, weightClassAvgData]);

  // Calculate finish rating
  const calculateFinishRating = React.useCallback((): number => {
    const calculateFinishPercentage = () => {
      if (!fighter.fight_outcome_stats?.FighterWins || fighter.fight_outcome_stats.FighterWins === 0) return 0;
      const finishes = (fighter.fight_outcome_stats.FighterKOWins || 0) +
                      (fighter.fight_outcome_stats.FighterTKOWins || 0) +
                      (fighter.fight_outcome_stats.FighterSUBWin || 0);
      return (finishes / fighter.fight_outcome_stats.FighterWins) * 100;
    };

    const fighterFinishPercentage = calculateFinishPercentage();
    const weightClassFinishPercentage = weightClassAvgData?.finishPercentage || 40;
    
    if (weightClassFinishPercentage === 0) {
      return Math.min(100, Math.max(1, Math.round(fighterFinishPercentage)));
    }
    
    const finishRatio = fighterFinishPercentage / weightClassFinishPercentage;
    const rating = 50 + (50 * Math.tanh((finishRatio - 1) * 2));
    return Math.min(100, Math.max(1, Math.round(rating)));
  }, [fighter.fight_outcome_stats, weightClassAvgData]);

  // Calculate positional rating
  const calculatePositionalRating = React.useCallback((): number => {
    const centerOctagon = fighter.CenterOctagon || 0;
    const pushedBackToCage = fighter.PushedBackToCage || 0;
    const pushingAgainstCage = fighter.PushingAgainstCage || 0;
    const beingClinched = fighter.clinch_stats?.BeingClinched || 0;
    const inClinch = fighter.clinch_stats?.InClinch || 0;
    const onBottomGround = fighter.ground_stats?.OnBottomGround || 0;
    const onTopGround = fighter.ground_stats?.OnTopGround || 0;

    const totalPositionalEvents = centerOctagon + pushedBackToCage + pushingAgainstCage + 
                                 beingClinched + inClinch + onBottomGround + onTopGround;

    if (totalPositionalEvents === 0) return 50;

    const dominantPositions = centerOctagon + pushingAgainstCage + inClinch + onTopGround;
    const dominanceRatio = dominantPositions / totalPositionalEvents;

    let rating;
    if (dominanceRatio <= 0.5) {
      rating = 1 + (49 * (dominanceRatio / 0.5));
    } else {
      rating = 50 + (50 * ((dominanceRatio - 0.5) / 0.5));
    }

    return Math.min(100, Math.max(1, Math.round(rating)));
  }, [fighter]);

  // Main overall rating calculation
  const calculateOverallRating = React.useCallback((): OverallRatingResult => {
    const strikingRating = calculateStrikingRating();
    const aggressionRating = calculateAggressivenessRating();
    const grapplingGrade = calculateGrapplingGrade();
    const defenseRating = calculateDefenseRating();
    const finishRating = calculateFinishRating();
    const positionRating = calculatePositionalRating();

    // Analyze fighter data for archetype determination
    const analyzeFighterData = () => {
      const totalFights = fighter.FightsTracked || 0;
      const totalWins = fighter.fight_outcome_stats?.FighterWins || 0;
      const totalLosses = fighter.fight_outcome_stats?.FighterLoss || 0;
      const winRate = totalFights > 0 ? (totalWins / totalFights) * 100 : 0;
      
      const totalStrikesLanded = fighter.total_stats?.TotalStrikesLanded || 0;
      const totalStrikesThrown = fighter.total_stats?.TotalStrikesThrown || 0;
      const strikingAccuracy = totalStrikesThrown > 0 ? (totalStrikesLanded / totalStrikesThrown) * 100 : 0;
      
      const takedownsLanded = fighter.takedown_stats?.TakedownsLanded || 0;
      const takedownsAttempted = fighter.takedown_stats?.TakedownsAttempted || 0;
      const takedownAccuracy = takedownsAttempted > 0 ? (takedownsLanded / takedownsAttempted) * 100 : 0;
      
      const koWins = fighter.fight_outcome_stats?.FighterKOWins || 0;
      const tkoWins = fighter.fight_outcome_stats?.FighterTKOWins || 0;
      const subWins = fighter.fight_outcome_stats?.FighterSUBWin || 0;
      const decisionWins = (fighter.fight_outcome_stats?.FighterUDWins || 0) + 
                          (fighter.fight_outcome_stats?.FighterSplitDecWin || 0) + 
                          (fighter.fight_outcome_stats?.FighterMajDecWin || 0);
      
      const totalFinishes = koWins + tkoWins + subWins;
      const finishRate = totalWins > 0 ? (totalFinishes / totalWins) * 100 : 0;
      
      const centerOctagon = fighter.CenterOctagon || 0;
      const pushedBackToCage = fighter.PushedBackToCage || 0;
      const onTopGround = fighter.ground_stats?.OnTopGround || 0;
      const onBottomGround = fighter.ground_stats?.OnBottomGround || 0;
      
      const dominantPositions = centerOctagon + onTopGround;
      const defensivePositions = pushedBackToCage + onBottomGround;
      const totalPositions = dominantPositions + defensivePositions;
      const dominanceRatio = totalPositions > 0 ? dominantPositions / totalPositions : 0.5;
      
      const strikesPerMinute = fighter.total_stats?.StrikesPerMinute || 0;
      const weightClassStrikesPerMinute = weightClassAvgData?.total_stats?.StrikesPerMinute || 0;
      const aggressionRatio = weightClassStrikesPerMinute > 0 ? strikesPerMinute / weightClassStrikesPerMinute : 1;
      
      return {
        totalFights,
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

    // Determine fighter style
    const determineFighterStyle = () => {
      const strikingDominance = strikingRating >= 65;
      const grapplingDominance = grapplingGrade >= 70 || positionRating >= 75;
      const finishingDominance = finishRating >= 60;
      
      if (grapplingGrade >= 80 && positionRating >= 80) {
        return "grappler";
      } else if (strikingRating >= 80 && grapplingGrade <= 50) {
        return "striker";
      } else if (finishRating >= 75 && (fighterData.koWins + fighterData.tkoWins) > fighterData.subWins) {
        return "knockout_artist";
      } else if (finishRating >= 75 && fighterData.subWins > (fighterData.koWins + fighterData.tkoWins)) {
        return "submission_specialist";
      } else if (grapplingDominance && !strikingDominance) {
        return "grappler";
      } else if (strikingDominance && !grapplingDominance) {
        return "striker";
      } else if (finishingDominance && (fighterData.koWins + fighterData.tkoWins) > fighterData.subWins) {
        return "knockout_artist";
      } else if (finishingDominance && fighterData.subWins > (fighterData.koWins + fighterData.tkoWins)) {
        return "submission_specialist";
      } else if (strikingDominance && grapplingDominance) {
        return "mixed";
      } else {
        return "balanced";
      }
    };

    const fighterStyle = determineFighterStyle();

    // Get dynamic weights based on fighter style
    const getDynamicWeights = (style: string) => {
      switch (style) {
        case "striker":
          return { striking: 0.35, defense: 0.25, grappling: 0.10, position: 0.15, aggression: 0.10, finishes: 0.05 };
        case "grappler":
          return { striking: 0.15, defense: 0.25, grappling: 0.35, position: 0.15, aggression: 0.05, finishes: 0.05 };
        case "knockout_artist":
          return { striking: 0.35, defense: 0.20, grappling: 0.10, position: 0.15, aggression: 0.15, finishes: 0.05 };
        case "submission_specialist":
          return { striking: 0.10, defense: 0.25, grappling: 0.35, position: 0.15, aggression: 0.10, finishes: 0.05 };
        case "mixed":
          return { striking: 0.30, defense: 0.25, grappling: 0.25, position: 0.15, aggression: 0.03, finishes: 0.02 };
        default:
          return { striking: 0.30, defense: 0.25, grappling: 0.25, position: 0.15, aggression: 0.03, finishes: 0.02 };
      }
    };

    const weights = getDynamicWeights(fighterStyle);

    const weightedRating = (
      strikingRating * weights.striking +
      defenseRating * weights.defense +
      grapplingGrade * weights.grappling +
      (typeof aggressionRating === 'number' ? aggressionRating : 50) * weights.aggression +
      finishRating * weights.finishes +
      positionRating * weights.position
    );

    // Calculate specialist bonus
    const calculateSpecialistBonus = () => {
      let bonus = 0;
      
      switch (fighterStyle) {
        case "striker":
          if (strikingRating >= 75) bonus += 8;
          if (strikingRating >= 80) bonus += 5;
          if (defenseRating >= 70) bonus += 3;
          break;
        case "grappler":
          if (grapplingGrade >= 75) bonus += 8;
          if (positionRating >= 75) bonus += 8;
          if (grapplingGrade >= 80 && positionRating >= 80) bonus += 5;
          if (defenseRating >= 70) bonus += 3;
          break;
        case "knockout_artist":
          if (finishRating >= 75) bonus += 8;
          if (strikingRating >= 70) bonus += 5;
          if (typeof aggressionRating === 'number' && aggressionRating >= 70) bonus += 3;
          break;
        case "submission_specialist":
          if (finishRating >= 75) bonus += 8;
          if (grapplingGrade >= 70) bonus += 5;
          if (positionRating >= 70) bonus += 3;
          break;
        case "mixed":
          if (strikingRating >= 70 && grapplingGrade >= 70) bonus += 8;
          if (defenseRating >= 70) bonus += 5;
          break;
      }
      
      return bonus;
    };

    const specialistBonus = calculateSpecialistBonus();
    const overallRating = Math.min(99, Math.round(weightedRating + specialistBonus));

    // Determine archetype
    const determineArchetype = () => {
      const { winRate, decisionWins, totalFinishes, aggressionRatio, dominanceRatio } = fighterData;

      if (overallRating >= 85) {
        if (fighterStyle === "striker") return "Elite Striker";
        if (fighterStyle === "grappler") return "Elite Grappler";
        if (fighterStyle === "knockout_artist") return "Elite Knockout Artist";
        if (fighterStyle === "submission_specialist") return "Elite Submission Specialist";
        return "Elite Mixed Martial Artist";
      }

      if (overallRating >= 75) {
        if (fighterStyle === "striker") return "Striking Specialist";
        if (fighterStyle === "grappler") return "Grappling Specialist";
        if (fighterStyle === "knockout_artist") return "Knockout Artist";
        if (fighterStyle === "submission_specialist") return "Submission Specialist";
        if (winRate >= 75 && decisionWins > totalFinishes) return "Decision Machine";
        return "Well-Rounded Fighter";
      }

      if (overallRating >= 60) {
        if (fighterStyle === "striker") return "Striker";
        if (fighterStyle === "grappler") return "Grappler";
        if (fighterStyle === "knockout_artist") return "Power Puncher";
        if (fighterStyle === "submission_specialist") return "Submission Artist";
        if (aggressionRatio >= 1.2) return "Aggressive Fighter";
        if (dominanceRatio >= 0.6) return "Positional Fighter";
        return "Balanced Fighter";
      }

      if (fighterStyle === "striker") return "One-Dimensional Striker";
      if (fighterStyle === "grappler") return "One-Dimensional Grappler";
      if (fighterStyle === "knockout_artist") return "Power Puncher";
      if (fighterStyle === "submission_specialist") return "Submission Artist";
      if (aggressionRatio >= 1.1) return "Aggressive but Limited";
      if (dominanceRatio <= 0.3) return "Defensive Fighter";
      return "Technical Fighter";
    };

    // Determine strengths
    const determineStrengths = () => {
      const strengths: { name: string; score: number }[] = [];
      const { 
        winRate, strikingAccuracy, takedownAccuracy, finishRate, 
        dominanceRatio, aggressionRatio, koWins, tkoWins, subWins,
        totalStrikesLanded, takedownsLanded, totalFights
      } = fighterData;

      if (strikingAccuracy >= 55 || totalStrikesLanded > 100) {
        strengths.push({ 
          name: strikingAccuracy >= 60 ? "Technical Striking" : "Striking Volume", 
          score: strikingAccuracy 
        });
      }

      if (takedownAccuracy >= 40 || takedownsLanded > 10) {
        strengths.push({ 
          name: takedownAccuracy >= 50 ? "Technical Grappling" : "Grappling Control", 
          score: takedownAccuracy 
        });
      }

      if (finishRate >= 50 || (koWins + tkoWins) > 3) {
        strengths.push({ 
          name: (koWins + tkoWins) > subWins ? "Knockout Power" : "Submission Game", 
          score: finishRate 
        });
      }

      if (aggressionRatio >= 1.1) {
        strengths.push({ 
          name: "Fighting Aggression", 
          score: aggressionRatio * 50 
        });
      }

      if (dominanceRatio >= 0.6) {
        strengths.push({ 
          name: "Positional Control", 
          score: dominanceRatio * 100 
        });
      }

      if (winRate >= 70 && totalFights >= 5) {
        strengths.push({ 
          name: "Fight IQ", 
          score: winRate 
        });
      }

      strengths.sort((a, b) => b.score - a.score);
      return strengths.slice(0, 2).map(s => s.name);
    };

    // Determine weaknesses
    const determineWeaknesses = () => {
      const { 
        winRate, strikingAccuracy, takedownAccuracy, finishRate, 
        dominanceRatio, aggressionRatio, totalFights, totalStrikesLanded, takedownsLanded
      } = fighterData;

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

      const ratingWeaknesses = [
        { name: "Striking", rating: strikingRating },
        { name: "Defense", rating: defenseRating },
        { name: "Grappling", rating: grapplingGrade },
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
  }, [fighter, weightClassAvgData, calculateStrikingRating, calculateAggressivenessRating, calculateGrapplingGrade, calculateDefenseRating, calculateFinishRating, calculatePositionalRating]);

  return calculateOverallRating();
}; 