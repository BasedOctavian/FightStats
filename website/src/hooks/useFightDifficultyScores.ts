import { useMemo } from 'react';
import { Fighter, Fight } from '../types/firestore';
import { 
  winMethodMultipliers, 
  lossMethodMultipliers, 
  winRoundMultipliers, 
  lossRoundMultipliers 
} from './useDifficultyScore';

interface UseFightDifficultyScoresParams {
  fights: Fight[];
  opponents: Fighter[];
  fighterCode: string;
  weightClassData: any;
}

interface FightWithScore extends Fight {
  difficultyScore: number;
}

export const useFightDifficultyScores = ({
  fights,
  opponents,
  fighterCode,
  weightClassData
}: UseFightDifficultyScoresParams): FightWithScore[] => {
  return useMemo(() => {
    if (!fights || !opponents.length || !weightClassData) return [];
    
    return fights.map(fight => {
      const isWinner = fight.fighterA === fighterCode;
      const opponentCode = isWinner ? fight.fighterB : fight.fighterA;
      const opponent = opponents.find(o => o.fighterCode === opponentCode);
      
      if (!opponent) {
        return { ...fight, difficultyScore: 0 };
      }
      
      // Calculate base rating using the same logic as useOverallRating
      const totalFights = opponent.FightsTracked || 0;
      const totalWins = opponent.fight_outcome_stats?.FighterWins || 0;
      const winRate = totalFights > 0 ? (totalWins / totalFights) * 100 : 50;
      
      const koWins = opponent.fight_outcome_stats?.FighterKOWins || 0;
      const tkoWins = opponent.fight_outcome_stats?.FighterTKOWins || 0;
      const subWins = opponent.fight_outcome_stats?.FighterSUBWin || 0;
      const totalFinishes = koWins + tkoWins + subWins;
      const finishRate = totalWins > 0 ? (totalFinishes / totalWins) * 100 : 25;
      
      // Calculate base rating similar to useOverallRating (simplified version)
      const baseRating = Math.min(100, Math.max(1, (winRate * 0.7) + (finishRate * 0.3)));
      
      // Apply method and round multipliers based on win/loss
      const methodMultiplier = isWinner 
        ? winMethodMultipliers[fight.methodOfFinish as keyof typeof winMethodMultipliers] || 1.0
        : lossMethodMultipliers[fight.methodOfFinish as keyof typeof lossMethodMultipliers] || 1.0;
      
      const roundMultiplier = isWinner
        ? winRoundMultipliers[fight.actualRounds as keyof typeof winRoundMultipliers] || 1.0
        : lossRoundMultipliers[fight.actualRounds as keyof typeof lossRoundMultipliers] || 1.0;
      
      // Calculate difficulty score
      const difficultyScore = Math.round(baseRating * methodMultiplier * roundMultiplier);
      
      return {
        ...fight,
        difficultyScore: Math.min(100, Math.max(1, difficultyScore))
      };
    });
  }, [fights, opponents, weightClassData, fighterCode]);
}; 