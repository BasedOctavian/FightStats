import { Fighter } from '../types/firestore';

// Interface for stat options
export interface StatOption {
  key: string;
  label: string;
  category: string;
  description: string;
  isPercentage?: boolean;
  isTime?: boolean;
  isCount?: boolean;
}

// Extract all quantifiable stats from a fighter document
export const getQuantifiableStats = (fighter: Fighter): StatOption[] => {
  const stats: StatOption[] = [];

  // Main document stats
  const mainStats: { [key: string]: { label: string; description: string; category: string } } = {
    FightsTracked: { label: 'Fights Tracked', description: 'Total number of fights tracked', category: 'General' },
    MinutesTracked: { label: 'Minutes Tracked', description: 'Total minutes tracked', category: 'General' },
    RoundsTracked: { label: 'Rounds Tracked', description: 'Total rounds tracked', category: 'General' },
    CenterOctagon: { label: 'Center Octagon', description: 'Times in center neutral position', category: 'Position' },
    PushedBackToCage: { label: 'Pushed Back to Cage', description: 'Times walked down to cage', category: 'Position' },
    PushingAgainstCage: { label: 'Pushing Against Cage', description: 'Times walking opponent down', category: 'Position' },
    AdjustedAge: { label: 'Adjusted Age', description: 'Fighter adjusted age', category: 'General' },
    CardioGrade: { label: 'Cardio Grade', description: 'Cardiovascular fitness grade', category: 'Grades' },
    ChinGrade: { label: 'Chin Grade', description: 'Ability to take damage grade', category: 'Grades' },
    ClutchGrade: { label: 'Clutch Grade', description: 'Performance under pressure grade', category: 'Grades' },
    DamageTaken: { label: 'Damage Taken', description: 'Total damage absorbed', category: 'General' },
    DefensiveGrade: { label: 'Defensive Grade', description: 'Defensive skills grade', category: 'Grades' },
    FighterConsistency: { label: 'Fighter Consistency', description: 'Performance consistency rating', category: 'Grades' },
    FighterGrade: { label: 'Fighter Grade', description: 'Overall fighter grade', category: 'Grades' },
    FighterMomentum: { label: 'Fighter Momentum', description: 'Performance momentum rating', category: 'Grades' },
    FighterOutput: { label: 'Fighter Output', description: 'Activity level rating', category: 'Grades' },
    GrapplingGrade: { label: 'Grappling Grade', description: 'Grappling skills grade', category: 'Grades' },
    HiMagFightsTracked: { label: 'High Magnitude Fights', description: 'High magnitude fights tracked', category: 'General' },
    HiMagLeftHook: { label: 'High Mag Left Hook', description: 'High magnitude left hook strikes', category: 'Striking' },
    HiMagLeftJab: { label: 'High Mag Left Jab', description: 'High magnitude left jab strikes', category: 'Striking' },
    HiMagLeftStraight: { label: 'High Mag Left Straight', description: 'High magnitude left straight strikes', category: 'Striking' },
    HiMagLeftUppercut: { label: 'High Mag Left Uppercut', description: 'High magnitude left uppercut strikes', category: 'Striking' },
    HiMagRightHook: { label: 'High Mag Right Hook', description: 'High magnitude right hook strikes', category: 'Striking' },
    HiMagRightJab: { label: 'High Mag Right Jab', description: 'High magnitude right jab strikes', category: 'Striking' },
    HiMagRightStraight: { label: 'High Mag Right Straight', description: 'High magnitude right straight strikes', category: 'Striking' },
    HiMagRightUppercut: { label: 'High Mag Right Uppercut', description: 'High magnitude right uppercut strikes', category: 'Striking' },
    KickingGrade: { label: 'Kicking Grade', description: 'Kicking skills grade', category: 'Grades' },
    NumberOfKnockDowns: { label: 'Number of Knockdowns', description: 'Total knockdowns scored', category: 'General' },
    NumberOfStuns: { label: 'Number of Stuns', description: 'Total stuns scored', category: 'General' },
    OffensiveGrade: { label: 'Offensive Grade', description: 'Offensive skills grade', category: 'Grades' },
    PunchingGrade: { label: 'Punching Grade', description: 'Punching skills grade', category: 'Grades' },
    StrengthOfSchedule: { label: 'Strength of Schedule', description: 'Opponent difficulty rating', category: 'General' },
    StrikerMatchup: { label: 'Striker Matchup', description: 'Striker matchup rating', category: 'General' },
    StrikingGrade: { label: 'Striking Grade', description: 'Striking skills grade', category: 'Grades' },
    SubmissionDefenseGrade: { label: 'Submission Defense Grade', description: 'Submission defense grade', category: 'Grades' },
    SubmissionGrade: { label: 'Submission Grade', description: 'Submission skills grade', category: 'Grades' },
    TakedownDefenseGrade: { label: 'Takedown Defense Grade', description: 'Takedown defense grade', category: 'Grades' },
    TakedownEfficiency: { label: 'Takedown Efficiency', description: 'Takedown success rate', category: 'General' },
    TimesKnockedDownAA: { label: 'Times Knocked Down AA', description: 'Times knocked down by opponent', category: 'General' },
    Total23FightsTracked: { label: 'Total 2-3 Fights Tracked', description: 'Total 2-3 round fights tracked', category: 'General' },
    TotalComboMinutes: { label: 'Total Combo Minutes', description: 'Total minutes in combinations', category: 'General' },
    TotalPositionPoints: { label: 'Total Position Points', description: 'Total position control points', category: 'General' },
    WrestlerMatchup: { label: 'Wrestler Matchup', description: 'Wrestler matchup rating', category: 'General' },
  };

  // Add main stats
  Object.entries(mainStats).forEach(([key, info]) => {
    if (fighter[key as keyof Fighter] !== undefined && fighter[key as keyof Fighter] !== null) {
      stats.push({
        key,
        label: info.label,
        category: info.category,
        description: info.description,
        isCount: true,
      });
    }
  });

  // Add clinch stats
  if (fighter.clinch_stats) {
    const clinchStats: { [key: string]: { label: string; description: string } } = {
      ClinchStrikeHiMake: { label: 'Clinch Head Strikes Landed', description: 'Head strikes landed in clinch' },
      ClinchStrikeHiMiss: { label: 'Clinch Head Strikes Missed', description: 'Head strikes missed in clinch' },
      ClinchStrikeLoMake: { label: 'Clinch Body Strikes Landed', description: 'Body strikes landed in clinch' },
      ClinchStrikeLoMiss: { label: 'Clinch Body Strikes Missed', description: 'Body strikes missed in clinch' },
      TotalClinchStrikesMade: { label: 'Total Clinch Strikes Landed', description: 'Total strikes landed in clinch' },
      TotalClinchStrikesMissed: { label: 'Total Clinch Strikes Missed', description: 'Total strikes missed in clinch' },
      TotalClinchStrikesThrown: { label: 'Total Clinch Strikes Thrown', description: 'Total strikes thrown in clinch' },
      BeingClinched: { label: 'Times Being Clinched', description: 'Times opponent clinched them' },
      InClinch: { label: 'Times In Clinch Control', description: 'Times they controlled the clinch' },
    };

    Object.entries(clinchStats).forEach(([key, info]) => {
      if (fighter.clinch_stats[key] !== undefined && fighter.clinch_stats[key] !== null) {
        stats.push({
          key: `clinch_stats.${key}`,
          label: info.label,
          category: 'Clinch',
          description: info.description,
          isCount: true,
        });
      }
    });
  }

  // Add defensive stats
  if (fighter.defensive_stats) {
    const defensiveStats: { [key: string]: { label: string; description: string } } = {
      TimesAnklePicked: { label: 'Times Ankle Picked', description: 'Times taken down via ankle pick' },
      TimesBodyLocked: { label: 'Times Body Locked', description: 'Times taken down via body lock' },
      TimesDoubleLegged: { label: 'Times Double Legged', description: 'Times taken down via double leg' },
      TimesImanaried: { label: 'Times Imanaried', description: 'Times taken down via Imanari' },
      TimesKnockedDown: { label: 'Times Knocked Down', description: 'Times knocked down by opponent' },
      TimesSingleLegged: { label: 'Times Single Legged', description: 'Times taken down via single leg' },
      TimesStunned: { label: 'Times Stunned', description: 'Times stunned by opponent' },
      TimesThrown: { label: 'Times Thrown', description: 'Times taken down via throw' },
      TimesTripped: { label: 'Times Tripped', description: 'Times taken down via trip' },
    };

    Object.entries(defensiveStats).forEach(([key, info]) => {
      if (fighter.defensive_stats[key] !== undefined && fighter.defensive_stats[key] !== null) {
        stats.push({
          key: `defensive_stats.${key}`,
          label: info.label,
          category: 'Defensive',
          description: info.description,
          isCount: true,
        });
      }
    });
  }

  // Add fight outcome stats
  if (fighter.fight_outcome_stats) {
    const outcomeStats: { [key: string]: { label: string; description: string } } = {
      FighterDraw: { label: 'Draws', description: 'Number of draws' },
      FighterKOLoss: { label: 'KO Losses', description: 'Knockout losses' },
      FighterKOWins: { label: 'KO Wins', description: 'Knockout wins' },
      FighterLoss: { label: 'Total Losses', description: 'Total number of losses' },
      FighterMajDecLoss: { label: 'Majority Decision Losses', description: 'Majority decision losses' },
      FighterMajDecWin: { label: 'Majority Decision Wins', description: 'Majority decision wins' },
      FighterNC: { label: 'No Contests', description: 'Number of no contests' },
      FighterSUBLoss: { label: 'Submission Losses', description: 'Submission losses' },
      FighterSUBWin: { label: 'Submission Wins', description: 'Submission wins' },
      FighterSplitDecLoss: { label: 'Split Decision Losses', description: 'Split decision losses' },
      FighterSplitDecWin: { label: 'Split Decision Wins', description: 'Split decision wins' },
      FighterTKOLoss: { label: 'TKO Losses', description: 'TKO losses' },
      FighterTKOWins: { label: 'TKO Wins', description: 'TKO wins' },
      FighterUDLoss: { label: 'Unanimous Decision Losses', description: 'Unanimous decision losses' },
      FighterUDWins: { label: 'Unanimous Decision Wins', description: 'Unanimous decision wins' },
      FighterWins: { label: 'Total Wins', description: 'Total number of wins' },
      LossesInThe4thRd: { label: '4th Round Losses', description: 'Losses in the 4th round' },
      LossesInThe5thRd: { label: '5th Round Losses', description: 'Losses in the 5th round' },
      LossesInTitleFights: { label: 'Title Fight Losses', description: 'Losses in title fights' },
      WinsInThe4thRd: { label: '4th Round Wins', description: 'Wins in the 4th round' },
      WinsInThe5thRd: { label: '5th Round Wins', description: 'Wins in the 5th round' },
      WinsInTitleFights: { label: 'Title Fight Wins', description: 'Wins in title fights' },
    };

    Object.entries(outcomeStats).forEach(([key, info]) => {
      if (fighter.fight_outcome_stats[key] !== undefined && fighter.fight_outcome_stats[key] !== null) {
        stats.push({
          key: `fight_outcome_stats.${key}`,
          label: info.label,
          category: 'Fight Outcomes',
          description: info.description,
          isCount: true,
        });
      }
    });
  }

  // Add total stats
  if (fighter.total_stats) {
    const totalStats: { [key: string]: { label: string; description: string } } = {
      TotalBodyKicksMade: { label: 'Total Body Kicks Landed', description: 'Total body kicks landed' },
      TotalBodyKicksMissed: { label: 'Total Body Kicks Missed', description: 'Total body kicks missed' },
      TotalBodyKicksThrown: { label: 'Total Body Kicks Thrown', description: 'Total body kicks thrown' },
      TotalCrossAttempts: { label: 'Total Cross Attempts', description: 'Total cross punch attempts' },
      TotalCrossMake: { label: 'Total Crosses Landed', description: 'Total cross punches landed' },
      TotalCrossMissed: { label: 'Total Crosses Missed', description: 'Total cross punches missed' },
      TotalElbowsMade: { label: 'Total Elbows Landed', description: 'Total elbows landed' },
      TotalElbowsMissed: { label: 'Total Elbows Missed', description: 'Total elbows missed' },
      TotalElbowsThrown: { label: 'Total Elbows Thrown', description: 'Total elbows thrown' },
      TotalHighKicksMade: { label: 'Total High Kicks Landed', description: 'Total high kicks landed' },
      TotalHighKicksMissed: { label: 'Total High Kicks Missed', description: 'Total high kicks missed' },
      TotalHighKicksThrown: { label: 'Total High Kicks Thrown', description: 'Total high kicks thrown' },
      TotalHooksMade: { label: 'Total Hooks Landed', description: 'Total hooks landed' },
      TotalHooksMissed: { label: 'Total Hooks Missed', description: 'Total hooks missed' },
      TotalHooksThrown: { label: 'Total Hooks Thrown', description: 'Total hooks thrown' },
      TotalJabsMade: { label: 'Total Jabs Landed', description: 'Total jabs landed' },
      TotalJabsMissed: { label: 'Total Jabs Missed', description: 'Total jabs missed' },
      TotalJabsThrown: { label: 'Total Jabs Thrown', description: 'Total jabs thrown' },
      TotalKicksLanded: { label: 'Total Kicks Landed', description: 'Total kicks landed' },
      TotalKicksThrown: { label: 'Total Kicks Thrown', description: 'Total kicks thrown' },
      TotalLegKicksMade: { label: 'Total Leg Kicks Landed', description: 'Total leg kicks landed' },
      TotalLegKicksMissed: { label: 'Total Leg Kicks Missed', description: 'Total leg kicks missed' },
      TotalLegKicksThrown: { label: 'Total Leg Kicks Thrown', description: 'Total leg kicks thrown' },
      TotalOverhandsMade: { label: 'Total Overhands Landed', description: 'Total overhand punches landed' },
      TotalOverhandsMissed: { label: 'Total Overhands Missed', description: 'Total overhand punches missed' },
      TotalOverhandsThrown: { label: 'Total Overhands Thrown', description: 'Total overhand punches thrown' },
      TotalPunchesLanded: { label: 'Total Punches Landed', description: 'Total punches landed' },
      TotalPunchesThrown: { label: 'Total Punches Thrown', description: 'Total punches thrown' },
      TotalSpinBackFistsMade: { label: 'Total Spin Back Fists Landed', description: 'Total spin back fists landed' },
      TotalSpinBackFistsMissed: { label: 'Total Spin Back Fists Missed', description: 'Total spin back fists missed' },
      TotalSpinBackFistsThrown: { label: 'Total Spin Back Fists Thrown', description: 'Total spin back fists thrown' },
      TotalStraightsMade: { label: 'Total Straights Landed', description: 'Total straight punches landed' },
      TotalStraightsMissed: { label: 'Total Straights Missed', description: 'Total straight punches missed' },
      TotalStraightsThrown: { label: 'Total Straights Thrown', description: 'Total straight punches thrown' },
      TotalStrikesLanded: { label: 'Total Strikes Landed', description: 'Total strikes landed (all types)' },
      TotalUppercutsMade: { label: 'Total Uppercuts Landed', description: 'Total uppercuts landed' },
      TotalUppercutsMissed: { label: 'Total Uppercuts Missed', description: 'Total uppercuts missed' },
      TotalUppercutsThrown: { label: 'Total Uppercuts Thrown', description: 'Total uppercuts thrown' },
    };

    Object.entries(totalStats).forEach(([key, info]) => {
      if (fighter.total_stats[key] !== undefined && fighter.total_stats[key] !== null) {
        stats.push({
          key: `total_stats.${key}`,
          label: info.label,
          category: 'Total Stats',
          description: info.description,
          isCount: true,
        });
      }
    });
  }

  return stats.sort((a, b) => a.category.localeCompare(b.category) || a.label.localeCompare(b.label));
};

// Get stat value from nested object path
export const getStatValue = (fighter: Fighter, statKey: string): number | null => {
  if (statKey.includes('.')) {
    const [objectKey, propertyKey] = statKey.split('.');
    const obj = fighter[objectKey as keyof Fighter] as any;
    return obj && obj[propertyKey] !== undefined ? obj[propertyKey] : null;
  }
  return fighter[statKey as keyof Fighter] as number | null;
};

// Get stat value with formatting
export const getFormattedStatValue = (fighter: Fighter, statKey: string): string => {
  const value = getStatValue(fighter, statKey);
  if (value === null || value === undefined) return 'N/A';
  
  // Check if it's a percentage (grades are typically 0-100)
  if (statKey.includes('Grade') || statKey.includes('Efficiency')) {
    return `${value.toFixed(1)}%`;
  }
  
  // Check if it's time-related
  if (statKey.includes('Minutes') || statKey.includes('Time')) {
    return `${value.toFixed(1)} min`;
  }
  
  // Default to whole number
  return value.toString();
}; 