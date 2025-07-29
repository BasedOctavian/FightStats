import React from 'react';
import { Fighter } from '../../types/firestore';

interface TopTakedown {
  name: string;
  attempts: number;
  success: number;
  successRate: number;
  attemptsPerRound: number;
  attemptsPerMinute: number;
  description: string;
}

interface TakedownVulnerability {
  name: string;
  timesTakenDown: number;
  timesPerRound: number;
  timesPerMinute: number;
  description: string;
}

interface GrapplingInfoData {
  topTakedowns: TopTakedown[];
  topTakedownVulnerabilities: TakedownVulnerability[];
  totalTakedownAttempts: number;
  totalTakedownSuccess: number;
  overallTakedownSuccessRate: number;
}

export const useGrapplingInfo = (fighter: Fighter): GrapplingInfoData => {
  const calculateTopTakedowns = React.useCallback((): TopTakedown[] => {
    const stats = fighter.takedown_stats;
    if (!stats) return [];

    // Define all available takedown types with their corresponding fields
    const takedownTypes = [
      {
        name: 'Single Leg',
        attempts: stats.SingleLegTakedownAttempts || 0,
        success: stats.SingleLegTakedownSuccess || 0,
        description: 'Takedown targeting one leg, often used to drive opponent to the ground'
      },
      {
        name: 'Double Leg',
        attempts: stats.DoubleLegTakedownAttempts || 0,
        success: stats.DoubleLegTakedownSuccess || 0,
        description: 'Classic wrestling takedown targeting both legs simultaneously'
      },
      {
        name: 'Body Lock',
        attempts: stats.BodyLockTakedownAttempts || 0,
        success: stats.BodyLockTakedownSuccess || 0,
        description: 'Takedown using a clinch around the opponent\'s body'
      },
      {
        name: 'Trip',
        attempts: stats.TripTakedownAttempts || 0,
        success: stats.TripTakedownSuccess || 0,
        description: 'Takedown using leg sweeps or trips to off-balance opponent'
      },
      {
        name: 'Ankle Pick',
        attempts: stats.AttemptedAnklePickTD || 0,
        success: stats.SuccessfulAnklePickTD || 0,
        description: 'Quick takedown targeting the ankle to bring opponent down'
      },
      {
        name: 'Throw',
        attempts: stats.AttemptedThrowTD || 0,
        success: stats.SuccessfulThrowTD || 0,
        description: 'Judoka-style takedown using throws and sweeps'
      },
      {
        name: 'Imanari Roll',
        attempts: stats.AttemptedImanariTD || 0,
        success: stats.SuccessfulImanariTD || 0,
        description: 'Leg lock entry technique using rolling movements'
      }
    ];

    // Calculate per-round and per-minute stats
    const roundsTracked = fighter.RoundsTracked || 1;
    const minutesTracked = fighter.MinutesTracked || 1;

    // Process each takedown type
    const processedTakedowns = takedownTypes
      .map(takedown => {
        const successRate = takedown.attempts > 0 ? (takedown.success / takedown.attempts) * 100 : 0;
        const attemptsPerRound = takedown.attempts / roundsTracked;
        const attemptsPerMinute = takedown.attempts / minutesTracked;

        return {
          name: takedown.name,
          attempts: takedown.attempts,
          success: takedown.success,
          successRate,
          attemptsPerRound,
          attemptsPerMinute,
          description: takedown.description
        };
      })
      .filter(takedown => takedown.attempts > 0) // Only include takedowns that were attempted
      .sort((a, b) => b.attempts - a.attempts) // Sort by attempts (most attempted first)
      .slice(0, 3); // Get top 3

    return processedTakedowns;
  }, [fighter]);

  const calculateTakedownVulnerabilities = React.useCallback((): TakedownVulnerability[] => {
    const stats = fighter.defensive_stats;
    if (!stats) return [];

    // Define all available takedown vulnerability types with their corresponding fields
    const vulnerabilityTypes = [
      {
        name: 'Single Leg',
        timesTakenDown: stats.TimesSingleLegged || 0,
        description: 'Vulnerable to single leg takedowns, often indicates poor sprawl defense'
      },
      {
        name: 'Double Leg',
        timesTakenDown: stats.TimesDoubleLegged || 0,
        description: 'Vulnerable to double leg takedowns, suggests weak takedown defense'
      },
      {
        name: 'Body Lock',
        timesTakenDown: stats.TimesBodyLocked || 0,
        description: 'Vulnerable to body lock takedowns, indicates poor clinch defense'
      },
      {
        name: 'Ankle Pick',
        timesTakenDown: stats.TimesAnklePicked || 0,
        description: 'Vulnerable to ankle pick takedowns, suggests poor footwork'
      },
      {
        name: 'Throw',
        timesTakenDown: stats.TimesThrown || 0,
        description: 'Vulnerable to judo-style throws, indicates poor balance or grip fighting'
      },
      {
        name: 'Trip',
        timesTakenDown: stats.TimesTripped || 0,
        description: 'Vulnerable to trip takedowns, suggests poor base and balance'
      },
      {
        name: 'Imanari Roll',
        timesTakenDown: stats.TimesImanaried || 0,
        description: 'Vulnerable to leg lock entries, indicates poor leg defense'
      }
    ];

    // Calculate per-round and per-minute stats
    const roundsTracked = fighter.RoundsTracked || 1;
    const minutesTracked = fighter.MinutesTracked || 1;

    // Process each vulnerability type
    const processedVulnerabilities = vulnerabilityTypes
      .map(vulnerability => {
        const timesPerRound = vulnerability.timesTakenDown / roundsTracked;
        const timesPerMinute = vulnerability.timesTakenDown / minutesTracked;

        return {
          name: vulnerability.name,
          timesTakenDown: vulnerability.timesTakenDown,
          timesPerRound,
          timesPerMinute,
          description: vulnerability.description
        };
      })
      .filter(vulnerability => vulnerability.timesTakenDown > 0) // Only include vulnerabilities that occurred
      .sort((a, b) => b.timesTakenDown - a.timesTakenDown) // Sort by times taken down (most vulnerable first)
      .slice(0, 3); // Get top 3

    return processedVulnerabilities;
  }, [fighter]);

  const calculateOverallStats = React.useCallback(() => {
    const stats = fighter.takedown_stats;
    if (!stats) return { totalAttempts: 0, totalSuccess: 0, successRate: 0 };

    const totalAttempts = 
      (stats.SingleLegTakedownAttempts || 0) +
      (stats.DoubleLegTakedownAttempts || 0) +
      (stats.BodyLockTakedownAttempts || 0) +
      (stats.TripTakedownAttempts || 0) +
      (stats.AttemptedAnklePickTD || 0) +
      (stats.AttemptedThrowTD || 0) +
      (stats.AttemptedImanariTD || 0);

    const totalSuccess = 
      (stats.SingleLegTakedownSuccess || 0) +
      (stats.DoubleLegTakedownSuccess || 0) +
      (stats.BodyLockTakedownSuccess || 0) +
      (stats.TripTakedownSuccess || 0) +
      (stats.SuccessfulAnklePickTD || 0) +
      (stats.SuccessfulThrowTD || 0) +
      (stats.SuccessfulImanariTD || 0);

    const successRate = totalAttempts > 0 ? (totalSuccess / totalAttempts) * 100 : 0;

    return { totalAttempts, totalSuccess, successRate };
  }, [fighter]);

  const topTakedowns = calculateTopTakedowns();
  const topTakedownVulnerabilities = calculateTakedownVulnerabilities();
  const { totalAttempts, totalSuccess, successRate } = calculateOverallStats();

  return {
    topTakedowns,
    topTakedownVulnerabilities,
    totalTakedownAttempts: totalAttempts,
    totalTakedownSuccess: totalSuccess,
    overallTakedownSuccessRate: successRate
  };
}; 