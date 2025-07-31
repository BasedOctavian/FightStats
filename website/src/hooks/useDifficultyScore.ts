import { useMemo } from 'react';
import { useOverallRating } from './stats/useOverallRating';
import { Fighter } from '../types/firestore';

// Method of finish multipliers for WINS - defined outside component for reuse
const winMethodMultipliers = {
  'KO': 1.8,    // Knockout win - most impressive
  'TKO': 1.6,   // Technical knockout win - very impressive
  'SUB': 1.4,   // Submission win - impressive
  'DEC': 1.0,   // Decision win - standard
  'DQ': 0.4,    // Disqualification win - less impressive
  'NC': 0.2     // No contest - least impressive
};

// Method of finish multipliers for LOSSES - defined outside component for reuse
const lossMethodMultipliers = {
  'KO': 0.3,    // Knockout loss - most damaging
  'TKO': 0.4,   // Technical knockout loss - very damaging
  'SUB': 0.5,   // Submission loss - damaging
  'DEC': 1.0,   // Decision loss - standard
  'DQ': 1.2,    // Disqualification loss - less damaging (opponent's fault)
  'NC': 1.5     // No contest - least damaging
};

// Round efficiency multipliers for WINS - defined outside component for reuse
const winRoundMultipliers = {
  1: 2.0,  // First round win - most impressive
  2: 1.7,  // Second round win - very impressive
  3: 1.3,  // Third round win - impressive
  4: 1.0,  // Fourth round win - standard
  5: 0.8   // Fifth round win - less impressive (took longer)
};

// Round efficiency multipliers for LOSSES - defined outside component for reuse
const lossRoundMultipliers = {
  1: 0.2,  // First round loss - most damaging
  2: 0.4,  // Second round loss - very damaging
  3: 0.6,  // Third round loss - damaging
  4: 0.8,  // Fourth round loss - somewhat damaging
  5: 1.0   // Fifth round loss - least damaging (put up a fight)
};

interface UseDifficultyScoreParams {
  opponent: Fighter;
  weightClassData: any;
  methodOfFinish: string;
  actualRounds: number;
  isWinner: boolean; // Add this parameter to determine win/loss multipliers
}

interface DifficultyScoreResult {
  score: number;
  description: string;
  baseRating: number;
  methodMultiplier: number;
  roundMultiplier: number;
  archetype: string;
}

interface UseFighterCombinedDifficultyScoreParams {
  fights: any[];
  opponents: Fighter[];
  fighterCode: string;
  weightClassData: any;
}

interface CombinedDifficultyScoreResult {
  totalScore: number;
  averageScore: number;
  totalFights: number;
  wins: number;
  losses: number;
  winRate: number;
  description: string;
  breakdown: {
    wins: { count: number; averageScore: number };
    losses: { count: number; averageScore: number };
  };
}

export const useDifficultyScore = ({
  opponent,
  weightClassData,
  methodOfFinish,
  actualRounds,
  isWinner
}: UseDifficultyScoreParams): DifficultyScoreResult => {
  const opponentRating = useOverallRating(opponent, weightClassData);
  
  const result = useMemo(() => {
    const baseRating = opponentRating.rating;
    
    // Choose appropriate multipliers based on win/loss
    const methodMultiplier = isWinner 
      ? winMethodMultipliers[methodOfFinish as keyof typeof winMethodMultipliers] || 1.0
      : lossMethodMultipliers[methodOfFinish as keyof typeof lossMethodMultipliers] || 1.0;
    
    const roundMultiplier = isWinner
      ? winRoundMultipliers[actualRounds as keyof typeof winRoundMultipliers] || 1.0
      : lossRoundMultipliers[actualRounds as keyof typeof lossRoundMultipliers] || 1.0;
    
    // Calculate final difficulty score
    const difficultyScore = Math.round(baseRating * methodMultiplier * roundMultiplier);
    
    // Ensure score stays within 1-100 range
    const score = Math.min(100, Math.max(1, difficultyScore));
    
    // Get difficulty description
    const getDifficultyDescription = (score: number) => {
      if (score >= 85) return 'Extreme';
      if (score >= 75) return 'Very High';
      if (score >= 65) return 'High';
      if (score >= 55) return 'Moderate';
      if (score >= 45) return 'Low';
      return 'Very Low';
    };
    
    return {
      score,
      description: getDifficultyDescription(score),
      baseRating,
      methodMultiplier,
      roundMultiplier,
      archetype: opponentRating.archetype
    };
  }, [opponentRating, methodOfFinish, actualRounds, isWinner]);
  
  return result;
};

export const useFighterCombinedDifficultyScore = ({
  fights,
  opponents,
  fighterCode,
  weightClassData
}: UseFighterCombinedDifficultyScoreParams): CombinedDifficultyScoreResult => {
  // Helper function to calculate base rating without using hooks - FULL VERSION
  const calculateBaseRating = (opponent: Fighter, weightClassData: any): number => {
    // Calculate weight class averages
    const UFC_AVERAGES = {
      strikingAccuracy: weightClassData?.strikingAccuracy || 50,
      takedownSuccess: weightClassData?.takedownSuccess || 38,
      takedownDefense: weightClassData?.takedownDefense || 62,
      submissionSuccess: weightClassData?.submissionSuccess || 15,
      koTkoRate: weightClassData?.koTkoRate || 25,
      positionalDominance: weightClassData?.positionalDominance || 50,
      finishPercentage: weightClassData?.finishPercentage || 40,
      bodyKickAccuracy: weightClassData?.bodyKickAccuracy || 45,
      headKickAccuracy: weightClassData?.headKickAccuracy || 35,
      legKickAccuracy: weightClassData?.legKickAccuracy || 55,
      jabAccuracy: weightClassData?.jabAccuracy || 60,
      hookAccuracy: weightClassData?.hookAccuracy || 50,
      elbowAccuracy: weightClassData?.elbowAccuracy || 40,
      uppercutAccuracy: weightClassData?.uppercutAccuracy || 45,
      bodyKickDefense: weightClassData?.bodyKickDefense || 55,
      headKickDefense: weightClassData?.headKickDefense || 65,
      legKickDefense: weightClassData?.legKickDefense || 45,
      jabDefense: weightClassData?.jabDefense || 40,
      hookDefense: weightClassData?.hookDefense || 50,
      straightDefense: weightClassData?.straightDefense || 45,
      uppercutDefense: weightClassData?.uppercutDefense || 50
    };

    // Calculate striking accuracy
    const calculateStrikingAccuracy = (): number => {
      const stats = opponent.total_stats;
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
    };

    // Calculate strikes per minute
    const calculateStrikesPerMinute = () => {
      const minutesTracked = opponent.MinutesTracked || 1;
      
      const groundLanded = (opponent.ground_stats?.TotalGroundStrikesMade || 0) / minutesTracked;
      const groundThrown = (opponent.ground_stats?.TotalGroundStrikesThrown || 0) / minutesTracked;
      const clinchLanded = (opponent.clinch_stats?.TotalClinchStrikesMade || 0) / minutesTracked;
      const clinchThrown = (opponent.clinch_stats?.TotalClinchStrikesThrown || 0) / minutesTracked;
      
      const standingLanded = (
        (opponent.total_stats?.TotalBodyKicksMade || 0) +
        (opponent.total_stats?.TotalElbowsMade || 0) +
        (opponent.total_stats?.TotalHighKicksMade || 0) +
        (opponent.total_stats?.TotalHooksMade || 0) +
        (opponent.total_stats?.TotalJabsMade || 0) +
        (opponent.total_stats?.TotalLegKicksMade || 0) +
        (opponent.total_stats?.TotalOverhandsMade || 0) +
        (opponent.total_stats?.TotalSpinBackFistsMade || 0) +
        (opponent.total_stats?.TotalStraightsMade || 0) +
        (opponent.total_stats?.TotalUppercutsMade || 0)
      ) / minutesTracked;
      
      const standingThrown = (
        (opponent.total_stats?.TotalBodyKicksThrown || 0) +
        (opponent.total_stats?.TotalElbowsThrown || 0) +
        (opponent.total_stats?.TotalHighKicksThrown || 0) +
        (opponent.total_stats?.TotalHooksThrown || 0) +
        (opponent.total_stats?.TotalJabsThrown || 0) +
        (opponent.total_stats?.TotalLegKicksThrown || 0) +
        (opponent.total_stats?.TotalOverhandsThrown || 0) +
        (opponent.total_stats?.TotalSpinBackFistsThrown || 0) +
        (opponent.total_stats?.TotalStraightsThrown || 0) +
        (opponent.total_stats?.TotalUppercutsThrown || 0)
      ) / minutesTracked;

      return {
        ground: { landed: groundLanded, thrown: groundThrown },
        clinch: { landed: clinchLanded, thrown: clinchThrown },
        stand: { landed: standingLanded, thrown: standingThrown }
      };
    };

    // Calculate weight class strikes per minute
    const calculateWeightClassStrikesPerMinute = () => {
      const weightClassMinutes = weightClassData?.minutes || 1;
      
      const wcGroundLanded = (weightClassData?.TotalGroundStrikesMade || 0) / weightClassMinutes;
      const wcGroundThrown = (weightClassData?.TotalGroundStrikesThrown || 0) / weightClassMinutes;
      const wcClinchLanded = (weightClassData?.TotalClinchStrikesMade || 0) / weightClassMinutes;
      const wcClinchThrown = (weightClassData?.TotalClinchStrikesThrown || 0) / weightClassMinutes;
      
      const wcStandingLanded = (
        (weightClassData?.TotalBodyKicksMade || 0) +
        (weightClassData?.TotalElbowsMade || 0) +
        (weightClassData?.TotalHighKicksMade || 0) +
        (weightClassData?.TotalHooksMade || 0) +
        (weightClassData?.TotalJabsMade || 0) +
        (weightClassData?.TotalLegKicksMade || 0) +
        (weightClassData?.TotalOverhandsMade || 0) +
        (weightClassData?.TotalSpinBackFistsMade || 0) +
        (weightClassData?.TotalStraightsMade || 0) +
        (weightClassData?.TotalUppercutsMade || 0)
      ) / weightClassMinutes;
      
      const wcStandingThrown = (
        (weightClassData?.TotalBodyKicksThrown || 0) +
        (weightClassData?.TotalElbowsThrown || 0) +
        (weightClassData?.TotalHighKicksThrown || 0) +
        (weightClassData?.TotalHooksThrown || 0) +
        (weightClassData?.TotalJabsThrown || 0) +
        (weightClassData?.TotalLegKicksThrown || 0) +
        (weightClassData?.TotalOverhandsThrown || 0) +
        (weightClassData?.TotalSpinBackFistsThrown || 0) +
        (weightClassData?.TotalStraightsThrown || 0) +
        (weightClassData?.TotalUppercutsThrown || 0)
      ) / weightClassMinutes;

      return {
        ground: { landed: wcGroundLanded, thrown: wcGroundThrown },
        clinch: { landed: wcClinchLanded, thrown: wcClinchThrown },
        stand: { landed: wcStandingLanded, thrown: wcStandingThrown }
      };
    };

    // Calculate striking rating
    const calculateStrikingRating = (): number => {
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
    };

    // Calculate aggressiveness rating
    const calculateAggressivenessRating = (): number => {
      if (!opponent.FightsTracked || opponent.FightsTracked < 5) {
        return 50; // Default for insufficient data
      }

      const EPSILON = 0.001;
      const fighterMinutes = opponent.MinutesTracked || EPSILON;
      const classMinutes = weightClassData?.minutes || EPSILON;

      const fighterStrikeRate = (
        (opponent.total_stats?.TotalPunchesThrown || 0) +
        (opponent.total_stats?.TotalKicksThrown || 0) +
        (opponent.total_stats?.TotalElbowsThrown || 0) +
        (opponent.total_stats?.TotalSpinBackFistsThrown || 0) +
        (opponent.clinch_stats?.TotalClinchStrikesThrown || 0) +
        (opponent.ground_stats?.TotalGroundStrikesThrown || 0)
      ) / fighterMinutes;

      const classStrikeRate = weightClassData ? (
        (weightClassData.TotalPunchesThrown || 0) +
        (weightClassData.TotalKicksThrown || 0) +
        (weightClassData.TotalElbowsThrown || 0) +
        (weightClassData.TotalSpinBackFistsThrown || 0) +
        (weightClassData.TotalClinchStrikesThrown || 0) +
        (weightClassData.TotalGroundStrikesThrown || 0)
      ) / classMinutes : 0;

      const strikeRatio = classStrikeRate > 0 ? fighterStrikeRate / classStrikeRate : 1.0;
      
      const takedownRatio = (() => {
        const fighterTakedowns = (opponent.takedown_stats?.TakedownsLanded || 0) / fighterMinutes;
        const classTakedowns = weightClassData ? (weightClassData.TakedownsLanded || 0) / classMinutes : 0;
        return classTakedowns > 0 ? fighterTakedowns / classTakedowns : 1.0;
      })();
      
      const subRatio = (() => {
        const fighterSubs = (opponent.submission_stats?.SubmissionsAttempted || 0) / fighterMinutes;
        const classSubs = weightClassData ? (weightClassData.SubmissionsAttempted || 0) / classMinutes : 0;
        return classSubs > 0 ? fighterSubs / classSubs : 1.0;
      })();
      
      const posRatio = (() => {
        const totalPositions = (
          (opponent.CenterOctagon || 0) +
          (opponent.PushedBackToCage || 0) +
          (opponent.PushingAgainstCage || 0) +
          (opponent.clinch_stats?.BeingClinched || 0) +
          (opponent.clinch_stats?.InClinch || 0) +
          (opponent.ground_stats?.OnBottomGround || 0) +
          (opponent.ground_stats?.OnTopGround || 0)
        );

        if (totalPositions === 0) return 1.0;

        const dominantPositions = (
          (opponent.PushingAgainstCage || 0) +
          (opponent.clinch_stats?.InClinch || 0) +
          (opponent.ground_stats?.OnTopGround || 0)
        );

        const fighterPosRate = (dominantPositions / totalPositions) * 100;
        return fighterPosRate / 50;
      })();

      const compositeRatio = (strikeRatio + takedownRatio + subRatio + posRatio) / 4;
      const score = Math.round(50 + 49 * Math.tanh(compositeRatio - 1));
      return Math.min(99, Math.max(1, score));
    };

    // Calculate grappling grade
    const calculateGrapplingGrade = (): number => {
      const takedownStats = opponent.takedown_stats;
      const submissionStats = opponent.submission_stats;
      const clinchStats = opponent.clinch_stats;
      const groundStats = opponent.ground_stats;
      
      if (!takedownStats || !weightClassData) return 50;

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
        (weightClassData.BodyLockTakedownAttempts || 0) +
        (weightClassData.DoubleLegTakedownAttempts || 0) +
        (weightClassData.SingleLegTakedownAttempts || 0) +
        (weightClassData.TripTakedownAttempts || 0) +
        (weightClassData.AttemptedThrowTD || 0)
      );

      const ufcAverageSuccessRate = 0.38;
      const fighterSuccessRate = fighterAttempts > 0 ? fighterSuccesses / fighterAttempts : 0;
      const fighterFights = opponent.FightsTracked || 1;
      const weightClassFights = weightClassData.fights || 1;
      
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
      if (submissionStats && weightClassData) {
        const fighterSubAttempts = submissionStats.SubmissionsAttempted || 0;
        const fighterSubSuccesses = submissionStats.SubmissionsSuccessful || 0;
        const weightClassSubAttempts = weightClassData.SubmissionsAttempted || 0;
        const weightClassSubSuccesses = weightClassData.SubmissionsSuccessful || 0;
        
        const fighterSubRate = fighterSubAttempts > 0 ? fighterSubSuccesses / fighterSubAttempts : 0;
        const weightClassSubRate = weightClassSubAttempts > 0 ? weightClassSubSuccesses / weightClassSubAttempts : 0;
        
        const fighterSubsPerFight = fighterSubAttempts / fighterFights;
        const weightClassSubsPerFight = weightClassSubAttempts / weightClassFights;
        
        const subAccuracyRating = normalizeValue(fighterSubRate, weightClassSubRate);
        const subVolumeRating = normalizeValue(fighterSubsPerFight, weightClassSubsPerFight);
        submissionRating = (subAccuracyRating * 0.7) + (subVolumeRating * 0.3);
      }
      
      let clinchRating = 50;
      if (clinchStats && weightClassData) {
        const fighterClinchTime = clinchStats.InClinch || 0;
        const fighterBeingClinched = clinchStats.BeingClinched || 0;
        const weightClassClinchTime = weightClassData.InClinch || 0;
        const weightClassBeingClinched = weightClassData.BeingClinched || 0;
        
        const fighterClinchRatio = (fighterClinchTime + fighterBeingClinched) > 0 ? 
          fighterClinchTime / (fighterClinchTime + fighterBeingClinched) : 0.5;
        const weightClassClinchRatio = (weightClassClinchTime + weightClassBeingClinched) > 0 ? 
          weightClassClinchTime / (weightClassClinchTime + weightClassBeingClinched) : 0.5;
        
        const clinchControlRating = normalizeValue(fighterClinchRatio, weightClassClinchRatio);
        const clinchStrikingAccuracy = clinchStats.TotalClinchStrikesThrown > 0 ? 
          (clinchStats.TotalClinchStrikesMade / clinchStats.TotalClinchStrikesThrown) * 100 : 0;
        const weightClassClinchStrikingAccuracy = weightClassData.clinchStrikingAccuracy || 40;
        
        const clinchStrikingRating = normalizeValue(clinchStrikingAccuracy, weightClassClinchStrikingAccuracy);
        clinchRating = (clinchControlRating * 0.6) + (clinchStrikingRating * 0.4);
      }
      
      let groundGameRating = 50;
      if (groundStats && weightClassData) {
        const groundControlPercentage = groundStats.OnTopGround && groundStats.OnBottomGround ? 
          (groundStats.OnTopGround / (groundStats.OnTopGround + groundStats.OnBottomGround)) * 100 : 50;
        
        const groundStrikingAccuracy = groundStats.TotalGroundStrikesThrown > 0 ? 
          (groundStats.TotalGroundStrikesMade / groundStats.TotalGroundStrikesThrown) * 100 : 0;
        
        const groundStrikesPerRound = groundStats.TotalGroundStrikesThrown / (opponent.RoundsTracked || 1);
        
        const weightClassGroundStrikingAccuracy = weightClassData.groundStrikingAccuracy || 40;
        const weightClassGroundStrikesPerRound = weightClassData.groundStrikesPerRound || 2.0;

        const groundControlRating = normalizeValue(groundControlPercentage, 50);
        const groundStrikingRating = normalizeValue(groundStrikingAccuracy, weightClassGroundStrikingAccuracy);
        const groundVolumeRating = normalizeValue(groundStrikesPerRound, weightClassGroundStrikesPerRound);
        
        groundGameRating = (groundControlRating * 0.4) + (groundStrikingRating * 0.3) + (groundVolumeRating * 0.3);
        groundGameRating = Math.min(100, Math.max(1, Math.round(groundGameRating)));
      }

      const combinedRating = (takedownRating * 0.35) + (submissionRating * 0.15) + (clinchRating * 0.2) + (groundGameRating * 0.3);
      return Math.min(100, Math.max(1, Math.round(combinedRating)));
    };

    // Calculate defense rating
    const calculateDefenseRating = (): number => {
      const fighterMinutes = opponent.MinutesTracked || 1;
      const weightClassMinutes = weightClassData?.minutes || 1;
      
      const normalizeValue = (fighterValue: number, weightClassValue: number) => {
        if (weightClassValue === 0) return 50;
        const ratio = fighterValue / weightClassValue;
        // For defense, lower is better, so invert the ratio
        return 50 + (50 * Math.tanh((1 - ratio) * 2));
      };

      const headKicksDefenseRating = normalizeValue(
        (opponent.striking_stats?.HeadKicksAbsorbed || 0) / fighterMinutes,
        (weightClassData?.HeadKicksAbsorbed || 0) / weightClassMinutes
      );
      const bodyKicksDefenseRating = normalizeValue(
        (opponent.striking_stats?.BodyKicksAbsorbed || 0) / fighterMinutes,
        (weightClassData?.BodyKicksAbsorbed || 0) / weightClassMinutes
      );
      const hooksDefenseRating = normalizeValue(
        (opponent.striking_stats?.HooksAbsorbed || 0) / fighterMinutes,
        (weightClassData?.HooksAbsorbed || 0) / weightClassMinutes
      );
      const jabsDefenseRating = normalizeValue(
        (opponent.striking_stats?.JabsAbsorbed || 0) / fighterMinutes,
        (weightClassData?.JabsAbsorbed || 0) / weightClassMinutes
      );
      const legKicksDefenseRating = normalizeValue(
        (opponent.striking_stats?.LegKicksAbsorbed || 0) / fighterMinutes,
        (weightClassData?.LegKicksAbsorbed || 0) / weightClassMinutes
      );
      const overhandsDefenseRating = normalizeValue(
        (opponent.striking_stats?.OverhandsAbsorbed || 0) / fighterMinutes,
        (weightClassData?.OverhandsAbsorbed || 0) / weightClassMinutes
      );
      const straightsDefenseRating = normalizeValue(
        (opponent.striking_stats?.StraightsAbsorbed || 0) / fighterMinutes,
        (weightClassData?.StraightsAbsorbed || 0) / weightClassMinutes
      );
      const uppercutsDefenseRating = normalizeValue(
        (opponent.striking_stats?.UppercutsAbsorbed || 0) / fighterMinutes,
        (weightClassData?.UppercutsAbsorbed || 0) / weightClassMinutes
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
    };

    // Calculate finish rating
    const calculateFinishRating = (): number => {
      const calculateFinishPercentage = () => {
        if (!opponent.fight_outcome_stats?.FighterWins || opponent.fight_outcome_stats.FighterWins === 0) return 0;
        const finishes = (opponent.fight_outcome_stats.FighterKOWins || 0) +
                        (opponent.fight_outcome_stats.FighterTKOWins || 0) +
                        (opponent.fight_outcome_stats.FighterSUBWin || 0);
        return (finishes / opponent.fight_outcome_stats.FighterWins) * 100;
      };

      const fighterFinishPercentage = calculateFinishPercentage();
      const weightClassFinishPercentage = weightClassData?.finishPercentage || 40;
      
      if (weightClassFinishPercentage === 0) {
        return Math.min(100, Math.max(1, Math.round(fighterFinishPercentage)));
      }
      
      const finishRatio = fighterFinishPercentage / weightClassFinishPercentage;
      const rating = 50 + (50 * Math.tanh((finishRatio - 1) * 2));
      return Math.min(100, Math.max(1, Math.round(rating)));
    };

    // Calculate positional rating
    const calculatePositionalRating = (): number => {
      const centerOctagon = opponent.CenterOctagon || 0;
      const pushedBackToCage = opponent.PushedBackToCage || 0;
      const pushingAgainstCage = opponent.PushingAgainstCage || 0;
      const beingClinched = opponent.clinch_stats?.BeingClinched || 0;
      const inClinch = opponent.clinch_stats?.InClinch || 0;
      const onBottomGround = opponent.ground_stats?.OnBottomGround || 0;
      const onTopGround = opponent.ground_stats?.OnTopGround || 0;

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
    };

    // Main overall rating calculation
    const strikingRating = calculateStrikingRating();
    const aggressionRating = calculateAggressivenessRating();
    const grapplingGrade = calculateGrapplingGrade();
    const defenseRating = calculateDefenseRating();
    const finishRating = calculateFinishRating();
    const positionRating = calculatePositionalRating();

    // Analyze fighter data for archetype determination
    const analyzeFighterData = () => {
      const totalFights = opponent.FightsTracked || 0;
      const totalWins = opponent.fight_outcome_stats?.FighterWins || 0;
      const totalLosses = opponent.fight_outcome_stats?.FighterLoss || 0;
      const winRate = totalFights > 0 ? (totalWins / totalFights) * 100 : 0;
      
      const totalStrikesLanded = opponent.total_stats?.TotalStrikesLanded || 0;
      const totalStrikesThrown = opponent.total_stats?.TotalStrikesThrown || 0;
      const strikingAccuracy = totalStrikesThrown > 0 ? (totalStrikesLanded / totalStrikesThrown) * 100 : 0;
      
      const takedownsLanded = opponent.takedown_stats?.TakedownsLanded || 0;
      const takedownsAttempted = opponent.takedown_stats?.TakedownsAttempted || 0;
      const takedownAccuracy = takedownsAttempted > 0 ? (takedownsLanded / takedownsAttempted) * 100 : 0;
      
      const koWins = opponent.fight_outcome_stats?.FighterKOWins || 0;
      const tkoWins = opponent.fight_outcome_stats?.FighterTKOWins || 0;
      const subWins = opponent.fight_outcome_stats?.FighterSUBWin || 0;
      const decisionWins = (opponent.fight_outcome_stats?.FighterUDWins || 0) + 
                          (opponent.fight_outcome_stats?.FighterSplitDecWin || 0) + 
                          (opponent.fight_outcome_stats?.FighterMajDecWin || 0);
      
      const totalFinishes = koWins + tkoWins + subWins;
      const finishRate = totalWins > 0 ? (totalFinishes / totalWins) * 100 : 0;
      
      const centerOctagon = opponent.CenterOctagon || 0;
      const pushedBackToCage = opponent.PushedBackToCage || 0;
      const onTopGround = opponent.ground_stats?.OnTopGround || 0;
      const onBottomGround = opponent.ground_stats?.OnBottomGround || 0;
      
      const dominantPositions = centerOctagon + onTopGround;
      const defensivePositions = pushedBackToCage + onBottomGround;
      const totalPositions = dominantPositions + defensivePositions;
      const dominanceRatio = totalPositions > 0 ? dominantPositions / totalPositions : 0.5;
      
      const strikesPerMinute = opponent.total_stats?.StrikesPerMinute || 0;
      const weightClassStrikesPerMinute = weightClassData?.total_stats?.StrikesPerMinute || 0;
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
      aggressionRating * weights.aggression +
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
          if (aggressionRating >= 70) bonus += 3;
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

    return overallRating;
  };

  // Calculate all opponent ratings individually to avoid hooks in loops
  const opponentRatings = useMemo(() => {
    const ratings = new Map<string, number>();
    
    console.log('=== OPPONENT RATINGS CALCULATION ===');
    
    // Calculate ratings for each opponent individually
    opponents.forEach(opponent => {
      if (opponent.fighterCode) {
        // Calculate rating manually without using the hook
        const baseRating = calculateBaseRating(opponent, weightClassData);
        ratings.set(opponent.fighterCode, baseRating);
        
        console.log(`Opponent ${opponent.fighterName || opponent.name}:`, {
          fighterCode: opponent.fighterCode,
          baseRating
        });
      }
    });
    
    console.log('===================================');
    return ratings;
  }, [opponents, weightClassData]);

  return useMemo(() => {
    if (!fights || !opponents || fights.length === 0) {
      return {
        totalScore: 0,
        averageScore: 0,
        totalFights: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        description: 'No fights',
        breakdown: {
          wins: { count: 0, averageScore: 0 },
          losses: { count: 0, averageScore: 0 }
        }
      };
    }

    const opponentMap = new Map(opponents.map(opp => [opp.fighterCode, opp]));
    
    let totalScore = 0;
    let wins = 0;
    let losses = 0;
    let winScores = 0;
    let lossScores = 0;

    fights.forEach(fight => {
      const isWinner = fight.fighterA === fighterCode;
      const opponentCode = isWinner ? fight.fighterB : fight.fighterA;
      const opponent = opponentMap.get(opponentCode);
      
      if (opponent && opponent.fighterCode) {
        // Get the pre-calculated rating
        const baseRating = opponentRatings.get(opponent.fighterCode) || 0;
        
        // Choose appropriate multipliers based on win/loss
        const methodMultiplier = isWinner 
          ? winMethodMultipliers[fight.methodOfFinish as keyof typeof winMethodMultipliers] || 1.0
          : lossMethodMultipliers[fight.methodOfFinish as keyof typeof lossMethodMultipliers] || 1.0;
        
        const roundMultiplier = isWinner
          ? winRoundMultipliers[fight.actualRounds as keyof typeof winRoundMultipliers] || 1.0
          : lossRoundMultipliers[fight.actualRounds as keyof typeof lossRoundMultipliers] || 1.0;
        
        const difficultyScore = Math.round(baseRating * methodMultiplier * roundMultiplier);
        const score = Math.min(100, Math.max(1, difficultyScore));
        
        // Console logging for debugging
        console.log(`Fight ${fight.fightCode}:`, {
          opponent: opponent.fighterName || opponent.name,
          baseRating,
          methodOfFinish: fight.methodOfFinish,
          methodMultiplier,
          actualRounds: fight.actualRounds,
          roundMultiplier,
          difficultyScore,
          finalScore: score,
          result: isWinner ? 'WIN' : 'LOSS'
        });
        
        totalScore += score;
        
        if (isWinner) {
          wins++;
          winScores += score;
        } else {
          losses++;
          lossScores += score;
        }
      }
    });

    const totalFights = wins + losses;
    const averageScore = totalFights > 0 ? Math.round(totalScore / totalFights) : 0;
    const winRate = totalFights > 0 ? Math.round((wins / totalFights) * 100) : 0;
    
    const averageWinScore = wins > 0 ? Math.round(winScores / wins) : 0;
    const averageLossScore = losses > 0 ? Math.round(lossScores / losses) : 0;

    // Console logging for overall calculations
    console.log('=== OVERALL DIFFICULTY CALCULATION ===');
    console.log('Summary:', {
      totalFights,
      wins,
      losses,
      winRate: `${winRate}%`,
      totalScore,
      averageScore,
      averageWinScore,
      averageLossScore
    });
    console.log('=====================================');

    // Get overall difficulty description
    const getDifficultyDescription = (score: number) => {
      if (score >= 85) return 'Extreme';
      if (score >= 75) return 'Very High';
      if (score >= 65) return 'High';
      if (score >= 55) return 'Moderate';
      if (score >= 45) return 'Low';
      return 'Very Low';
    };

    return {
      totalScore,
      averageScore,
      totalFights,
      wins,
      losses,
      winRate,
      description: getDifficultyDescription(averageScore),
      breakdown: {
        wins: { count: wins, averageScore: averageWinScore },
        losses: { count: losses, averageScore: averageLossScore }
      }
    };
  }, [fights, opponents, fighterCode, opponentRatings]);
};

// Export multipliers for use in other components
export { 
  winMethodMultipliers, 
  lossMethodMultipliers, 
  winRoundMultipliers, 
  lossRoundMultipliers 
}; 