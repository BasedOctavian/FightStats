import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Fighter, COLLECTIONS } from '../types/firestore';

// Interface for the fighter totals data
export interface FighterTotal {
  fighterCode: string;
  fighterName: string;
  totalPunchesLanded: number;
  totalPunchesThrown: number;
  totalKicksLanded: number;
  totalKicksThrown: number;
  totalStrikesLanded: number;
  totalStrikesThrown: number;
  strikeAccuracyPercentage: number;
  punchAccuracyPercentage: number;
  kickAccuracyPercentage: number;
  minutesTracked: number;
  strikesLandedPerMinute: number;
  punchesLandedPerMinute: number;
  kicksLandedPerMinute: number;
  // Additional fields for enhanced filtering
  fightsTracked?: number;
  roundsTracked?: number;
  wins?: number;
  losses?: number;
  winPercentage?: number;
  titleFightWins?: number;
  titleFightLosses?: number;
  totalJabsThrown?: number;
  totalHooksThrown?: number;
  totalStraightsThrown?: number;
  totalUppercutsThrown?: number;
  totalBodyKicksThrown?: number;
  totalLegKicksThrown?: number;
  totalHighKicksThrown?: number;
  totalElbowsThrown?: number;
  // Enhanced fields for new visualizations
  clinchStrikesLanded?: number;
  clinchStrikesThrown?: number;
  groundStrikesLanded?: number;
  groundStrikesThrown?: number;
  takedownAttempts?: number;
  takedownSuccess?: number;
  submissionAttempts?: number;
  submissionWins?: number;
  centerOctagon?: number;
  pushedBackToCage?: number;
  pushingAgainstCage?: number;
  clinchStrikesPerMinute?: number;
  groundStrikesPerMinute?: number;
  takedownSuccessRate?: number;
  submissionSuccessRate?: number;
}

// Hook to fetch all fighters and calculate their total strike accuracy
export const useStrikeEfficiency = () => {
  const [fighterTotals, setFighterTotals] = useState<FighterTotal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFighterTotals = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching fighter totals from collection:', COLLECTIONS.FIGHTERS);
        const fightersQuery = collection(db, COLLECTIONS.FIGHTERS);
        const querySnapshot = await getDocs(fightersQuery);

        console.log('Query snapshot size:', querySnapshot.size);

        const totalsData: FighterTotal[] = [];

        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          
          // Extract fighter basic info
          const fighterCode = data.fighterCode || doc.id;
          const fighterName = data.fighterName || data.name || 'Unknown Fighter';
          
          // Check if fighter has sufficient minutes tracked (minimum 20 minutes)
          const minutesTracked = data.MinutesTracked || 0;
          if (minutesTracked < 20) {
            return; // Skip this fighter if they don't have enough tracked minutes
          }
          
          // Extract total stats from the total_stats object
          const totalStats = data.total_stats || {};
          const totalPunchesLanded = totalStats.TotalPunchesLanded || 0;
          const totalPunchesThrown = totalStats.TotalPunchesThrown || 0;
          const totalKicksLanded = totalStats.TotalKicksLanded || 0;
          const totalKicksThrown = totalStats.TotalKicksThrown || 0;
          
          // Calculate combined totals
          const totalStrikesLanded = totalPunchesLanded + totalKicksLanded;
          const totalStrikesThrown = totalPunchesThrown + totalKicksThrown;
          
          // Calculate strike accuracy percentage
          // Using combined punches and kicks thrown as denominator and landed as numerator
          let strikeAccuracyPercentage = 0;
          if (totalStrikesThrown > 0) {
            strikeAccuracyPercentage = (totalStrikesLanded / totalStrikesThrown) * 100;
          }
          
          // Calculate punch accuracy percentage
          let punchAccuracyPercentage = 0;
          if (totalPunchesThrown > 0) {
            punchAccuracyPercentage = (totalPunchesLanded / totalPunchesThrown) * 100;
          }
          
          // Calculate kick accuracy percentage
          let kickAccuracyPercentage = 0;
          if (totalKicksThrown > 0) {
            kickAccuracyPercentage = (totalKicksLanded / totalKicksThrown) * 100;
          }
          
          // Round to 2 decimal places for cleaner display
          strikeAccuracyPercentage = Math.round(strikeAccuracyPercentage * 100) / 100;
          punchAccuracyPercentage = Math.round(punchAccuracyPercentage * 100) / 100;
          kickAccuracyPercentage = Math.round(kickAccuracyPercentage * 100) / 100;

          totalsData.push({
            fighterCode,
            fighterName,
            totalPunchesLanded,
            totalPunchesThrown,
            totalKicksLanded,
            totalKicksThrown,
            totalStrikesLanded,
            totalStrikesThrown,
            strikeAccuracyPercentage,
            punchAccuracyPercentage,
            kickAccuracyPercentage,
            minutesTracked,
            strikesLandedPerMinute: totalStrikesLanded / minutesTracked,
            punchesLandedPerMinute: totalPunchesLanded / minutesTracked,
            kicksLandedPerMinute: totalKicksLanded / minutesTracked
          });
        });

        // Sort by strike accuracy percentage (highest first)
        totalsData.sort((a, b) => b.strikeAccuracyPercentage - a.strikeAccuracyPercentage);

        setFighterTotals(totalsData);
      } catch (err) {
        console.error('Error fetching fighter totals:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fighter totals');
        setFighterTotals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFighterTotals();
  }, []);

  return { fighterTotals, loading, error };
};

// Hook to fetch fighter totals with optional filtering
export const useStrikeEfficiencyWithFilter = (options?: {
  minStrikesThrown?: number;
  minStrikesLanded?: number;
  sortBy?: 'accuracy' | 'strikesLanded' | 'strikesThrown' | 'name';
  sortOrder?: 'asc' | 'desc';
}) => {
  const [fighterTotals, setFighterTotals] = useState<FighterTotal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFighterTotals = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching filtered fighter totals from collection:', COLLECTIONS.FIGHTERS);
        const fightersQuery = collection(db, COLLECTIONS.FIGHTERS);
        const querySnapshot = await getDocs(fightersQuery);

        console.log('Query snapshot size:', querySnapshot.size);

        const totalsData: FighterTotal[] = [];

        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          
          // Extract fighter basic info
          const fighterCode = data.fighterCode || doc.id;
          const fighterName = data.fighterName || data.name || 'Unknown Fighter';
          
          // Check if fighter has sufficient minutes tracked (minimum 20 minutes)
          const minutesTracked = data.MinutesTracked || 0;
          if (minutesTracked < 20) {
            return; // Skip this fighter if they don't have enough tracked minutes
          }
          
          // Extract total stats from the total_stats object
          const totalStats = data.total_stats || {};
          const totalPunchesLanded = totalStats.TotalPunchesLanded || 0;
          const totalPunchesThrown = totalStats.TotalPunchesThrown || 0;
          const totalKicksLanded = totalStats.TotalKicksLanded || 0;
          const totalKicksThrown = totalStats.TotalKicksThrown || 0;
          
          // Calculate combined totals
          const totalStrikesLanded = totalPunchesLanded + totalKicksLanded;
          const totalStrikesThrown = totalPunchesThrown + totalKicksThrown;
          
          // Apply minimum filters if specified
          if (options?.minStrikesThrown && totalStrikesThrown < options.minStrikesThrown) {
            return; // Skip this fighter
          }
          
          if (options?.minStrikesLanded && totalStrikesLanded < options.minStrikesLanded) {
            return; // Skip this fighter
          }
          
          // Calculate strike accuracy percentage
          let strikeAccuracyPercentage = 0;
          if (totalStrikesThrown > 0) {
            strikeAccuracyPercentage = (totalStrikesLanded / totalStrikesThrown) * 100;
          }
          
          // Calculate punch accuracy percentage
          let punchAccuracyPercentage = 0;
          if (totalPunchesThrown > 0) {
            punchAccuracyPercentage = (totalPunchesLanded / totalPunchesThrown) * 100;
          }
          
          // Calculate kick accuracy percentage
          let kickAccuracyPercentage = 0;
          if (totalKicksThrown > 0) {
            kickAccuracyPercentage = (totalKicksLanded / totalKicksThrown) * 100;
          }
          
          // Round to 2 decimal places for cleaner display
          strikeAccuracyPercentage = Math.round(strikeAccuracyPercentage * 100) / 100;
          punchAccuracyPercentage = Math.round(punchAccuracyPercentage * 100) / 100;
          kickAccuracyPercentage = Math.round(kickAccuracyPercentage * 100) / 100;

          totalsData.push({
            fighterCode,
            fighterName,
            totalPunchesLanded,
            totalPunchesThrown,
            totalKicksLanded,
            totalKicksThrown,
            totalStrikesLanded,
            totalStrikesThrown,
            strikeAccuracyPercentage,
            punchAccuracyPercentage,
            kickAccuracyPercentage,
            minutesTracked,
            strikesLandedPerMinute: totalStrikesLanded / minutesTracked,
            punchesLandedPerMinute: totalPunchesLanded / minutesTracked,
            kicksLandedPerMinute: totalKicksLanded / minutesTracked
          });
        });

        // Sort based on options
        const sortBy = options?.sortBy || 'accuracy';
        const sortOrder = options?.sortOrder || 'desc';
        
        totalsData.sort((a, b) => {
          let comparison = 0;
          
          switch (sortBy) {
            case 'accuracy':
              comparison = a.strikeAccuracyPercentage - b.strikeAccuracyPercentage;
              break;
            case 'strikesLanded':
              comparison = a.totalStrikesLanded - b.totalStrikesLanded;
              break;
                         case 'strikesThrown':
               comparison = a.totalStrikesThrown - b.totalStrikesThrown;
               break;
            case 'name':
              comparison = a.fighterName.localeCompare(b.fighterName);
              break;
            default:
              comparison = a.strikeAccuracyPercentage - b.strikeAccuracyPercentage;
          }
          
          return sortOrder === 'desc' ? -comparison : comparison;
        });

        setFighterTotals(totalsData);
      } catch (err) {
        console.error('Error fetching filtered fighter totals:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fighter totals');
        setFighterTotals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFighterTotals();
  }, [options?.minStrikesThrown, options?.minStrikesLanded, options?.sortBy, options?.sortOrder]);

  return { fighterTotals, loading, error };
};

// Hook to fetch fighter punch efficiency data
export const usePunchEfficiency = () => {
  const [fighterTotals, setFighterTotals] = useState<FighterTotal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFighterTotals = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching fighter punch efficiency from collection:', COLLECTIONS.FIGHTERS);
        const fightersQuery = collection(db, COLLECTIONS.FIGHTERS);
        const querySnapshot = await getDocs(fightersQuery);

        console.log('Query snapshot size:', querySnapshot.size);

        const totalsData: FighterTotal[] = [];

        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          
          // Extract fighter basic info
          const fighterCode = data.fighterCode || doc.id;
          const fighterName = data.fighterName || data.name || 'Unknown Fighter';
          
          // Check if fighter has sufficient minutes tracked (minimum 20 minutes)
          const minutesTracked = data.MinutesTracked || 0;
          if (minutesTracked < 20) {
            return; // Skip this fighter if they don't have enough tracked minutes
          }
          
          // Extract total stats from the total_stats object
          const totalStats = data.total_stats || {};
          const totalPunchesLanded = totalStats.TotalPunchesLanded || 0;
          const totalPunchesThrown = totalStats.TotalPunchesThrown || 0;
          const totalKicksLanded = totalStats.TotalKicksLanded || 0;
          const totalKicksThrown = totalStats.TotalKicksThrown || 0;
          
          // Calculate combined totals
          const totalStrikesLanded = totalPunchesLanded + totalKicksLanded;
          const totalStrikesThrown = totalPunchesThrown + totalKicksThrown;
          
          // Calculate strike accuracy percentage
          let strikeAccuracyPercentage = 0;
          if (totalStrikesThrown > 0) {
            strikeAccuracyPercentage = (totalStrikesLanded / totalStrikesThrown) * 100;
          }
          
          // Calculate punch accuracy percentage
          let punchAccuracyPercentage = 0;
          if (totalPunchesThrown > 0) {
            punchAccuracyPercentage = (totalPunchesLanded / totalPunchesThrown) * 100;
          }
          
          // Calculate kick accuracy percentage
          let kickAccuracyPercentage = 0;
          if (totalKicksThrown > 0) {
            kickAccuracyPercentage = (totalKicksLanded / totalKicksThrown) * 100;
          }
          
          // Round to 2 decimal places for cleaner display
          strikeAccuracyPercentage = Math.round(strikeAccuracyPercentage * 100) / 100;
          punchAccuracyPercentage = Math.round(punchAccuracyPercentage * 100) / 100;
          kickAccuracyPercentage = Math.round(kickAccuracyPercentage * 100) / 100;

          totalsData.push({
            fighterCode,
            fighterName,
            totalPunchesLanded,
            totalPunchesThrown,
            totalKicksLanded,
            totalKicksThrown,
            totalStrikesLanded,
            totalStrikesThrown,
            strikeAccuracyPercentage,
            punchAccuracyPercentage,
            kickAccuracyPercentage,
            minutesTracked,
            strikesLandedPerMinute: totalStrikesLanded / minutesTracked,
            punchesLandedPerMinute: totalPunchesLanded / minutesTracked,
            kicksLandedPerMinute: totalKicksLanded / minutesTracked
          });
        });

        // Sort by punch accuracy percentage (highest first)
        totalsData.sort((a, b) => b.punchAccuracyPercentage - a.punchAccuracyPercentage);

        setFighterTotals(totalsData);
      } catch (err) {
        console.error('Error fetching fighter punch efficiency:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fighter punch efficiency');
        setFighterTotals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFighterTotals();
  }, []);

  return { fighterTotals, loading, error };
};

// Hook to fetch fighter kick efficiency data
export const useKickEfficiency = () => {
  const [fighterTotals, setFighterTotals] = useState<FighterTotal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFighterTotals = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching fighter kick efficiency from collection:', COLLECTIONS.FIGHTERS);
        const fightersQuery = collection(db, COLLECTIONS.FIGHTERS);
        const querySnapshot = await getDocs(fightersQuery);

        console.log('Query snapshot size:', querySnapshot.size);

        const totalsData: FighterTotal[] = [];

        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          
          // Extract fighter basic info
          const fighterCode = data.fighterCode || doc.id;
          const fighterName = data.fighterName || data.name || 'Unknown Fighter';
          
          // Check if fighter has sufficient minutes tracked (minimum 20 minutes)
          const minutesTracked = data.MinutesTracked || 0;
          if (minutesTracked < 20) {
            return; // Skip this fighter if they don't have enough tracked minutes
          }
          
          // Extract total stats from the total_stats object
          const totalStats = data.total_stats || {};
          const totalPunchesLanded = totalStats.TotalPunchesLanded || 0;
          const totalPunchesThrown = totalStats.TotalPunchesThrown || 0;
          const totalKicksLanded = totalStats.TotalKicksLanded || 0;
          const totalKicksThrown = totalStats.TotalKicksThrown || 0;
          
          // Calculate combined totals
          const totalStrikesLanded = totalPunchesLanded + totalKicksLanded;
          const totalStrikesThrown = totalPunchesThrown + totalKicksThrown;
          
          // Calculate strike accuracy percentage
          let strikeAccuracyPercentage = 0;
          if (totalStrikesThrown > 0) {
            strikeAccuracyPercentage = (totalStrikesLanded / totalStrikesThrown) * 100;
          }
          
          // Calculate punch accuracy percentage
          let punchAccuracyPercentage = 0;
          if (totalPunchesThrown > 0) {
            punchAccuracyPercentage = (totalPunchesLanded / totalPunchesThrown) * 100;
          }
          
          // Calculate kick accuracy percentage
          let kickAccuracyPercentage = 0;
          if (totalKicksThrown > 0) {
            kickAccuracyPercentage = (totalKicksLanded / totalKicksThrown) * 100;
          }
          
          // Round to 2 decimal places for cleaner display
          strikeAccuracyPercentage = Math.round(strikeAccuracyPercentage * 100) / 100;
          punchAccuracyPercentage = Math.round(punchAccuracyPercentage * 100) / 100;
          kickAccuracyPercentage = Math.round(kickAccuracyPercentage * 100) / 100;

          totalsData.push({
            fighterCode,
            fighterName,
            totalPunchesLanded,
            totalPunchesThrown,
            totalKicksLanded,
            totalKicksThrown,
            totalStrikesLanded,
            totalStrikesThrown,
            strikeAccuracyPercentage,
            punchAccuracyPercentage,
            kickAccuracyPercentage,
            minutesTracked,
            strikesLandedPerMinute: totalStrikesLanded / minutesTracked,
            punchesLandedPerMinute: totalPunchesLanded / minutesTracked,
            kicksLandedPerMinute: totalKicksLanded / minutesTracked
          });
        });

        // Sort by kick accuracy percentage (highest first)
        totalsData.sort((a, b) => b.kickAccuracyPercentage - a.kickAccuracyPercentage);

        setFighterTotals(totalsData);
      } catch (err) {
        console.error('Error fetching fighter kick efficiency:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fighter kick efficiency');
        setFighterTotals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFighterTotals();
  }, []);

  return { fighterTotals, loading, error };
}; 

// Enhanced interface for comprehensive filtering
export interface FilterOptions {
  // Experience filters
  minMinutesTracked?: number;
  minFightsTracked?: number;
  minRoundsTracked?: number;
  
  // Strike volume filters
  minStrikesThrown?: number;
  minStrikesLanded?: number;
  minPunchesThrown?: number;
  minPunchesLanded?: number;
  minKicksThrown?: number;
  minKicksLanded?: number;
  
  // Fight outcome filters
  minWins?: number;
  maxLosses?: number;
  minWinPercentage?: number;
  hasTitleFightWins?: boolean;
  hasTitleFightLosses?: boolean;
  
  // Striking style filters
  minJabsThrown?: number;
  minHooksThrown?: number;
  minStraightsThrown?: number;
  minUppercutsThrown?: number;
  minBodyKicksThrown?: number;
  minLegKicksThrown?: number;
  minHighKicksThrown?: number;
  minElbowsThrown?: number;
  
  // Accuracy filters
  minStrikeAccuracy?: number;
  maxStrikeAccuracy?: number;
  minPunchAccuracy?: number;
  maxPunchAccuracy?: number;
  minKickAccuracy?: number;
  maxKickAccuracy?: number;
  
  // Sort options
  sortBy?: 'accuracy' | 'strikesLanded' | 'strikesThrown' | 'name' | 'minutesTracked' | 'wins' | 'winPercentage';
  sortOrder?: 'asc' | 'desc';
  
  // Limit results
  limit?: number;
}

// Enhanced hook with comprehensive filtering
export const useFighterTotalsWithFilters = (options?: FilterOptions) => {
  const [fighterTotals, setFighterTotals] = useState<FighterTotal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFighterTotals = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching filtered fighter totals with options:', options);
        const fightersQuery = collection(db, COLLECTIONS.FIGHTERS);
        const querySnapshot = await getDocs(fightersQuery);

        console.log('Query snapshot size:', querySnapshot.size);

        const totalsData: FighterTotal[] = [];

        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          
          // Extract fighter basic info
          const fighterCode = data.fighterCode || doc.id;
          const fighterName = data.fighterName || data.name || 'Unknown Fighter';
          
          // Extract experience stats
          const minutesTracked = data.MinutesTracked || 0;
          const fightsTracked = data.FightsTracked || 0;
          const roundsTracked = data.RoundsTracked || 0;
          
          // Apply experience filters
          if (options?.minMinutesTracked && minutesTracked < options.minMinutesTracked) {
            return;
          }
          if (options?.minFightsTracked && fightsTracked < options.minFightsTracked) {
            return;
          }
          if (options?.minRoundsTracked && roundsTracked < options.minRoundsTracked) {
            return;
          }
          
          // Extract total stats from the total_stats object
          const totalStats = data.total_stats || {};
          const totalPunchesLanded = totalStats.TotalPunchesLanded || 0;
          const totalPunchesThrown = totalStats.TotalPunchesThrown || 0;
          const totalKicksLanded = totalStats.TotalKicksLanded || 0;
          const totalKicksThrown = totalStats.TotalKicksThrown || 0;
          const totalJabsThrown = totalStats.TotalJabsThrown || 0;
          const totalHooksThrown = totalStats.TotalHooksThrown || 0;
          const totalStraightsThrown = totalStats.TotalStraightsThrown || 0;
          const totalUppercutsThrown = totalStats.TotalUppercutsThrown || 0;
          const totalBodyKicksThrown = totalStats.TotalBodyKicksThrown || 0;
          const totalLegKicksThrown = totalStats.TotalLegKicksThrown || 0;
          const totalHighKicksThrown = totalStats.TotalHighKicksThrown || 0;
          const totalElbowsThrown = totalStats.TotalElbowsThrown || 0;
          
          // Calculate combined totals
          const totalStrikesLanded = totalPunchesLanded + totalKicksLanded;
          const totalStrikesThrown = totalPunchesThrown + totalKicksThrown;
          
          // Apply strike volume filters
          if (options?.minStrikesThrown && totalStrikesThrown < options.minStrikesThrown) {
            return;
          }
          if (options?.minStrikesLanded && totalStrikesLanded < options.minStrikesLanded) {
            return;
          }
          if (options?.minPunchesThrown && totalPunchesThrown < options.minPunchesThrown) {
            return;
          }
          if (options?.minPunchesLanded && totalPunchesLanded < options.minPunchesLanded) {
            return;
          }
          if (options?.minKicksThrown && totalKicksThrown < options.minKicksThrown) {
            return;
          }
          if (options?.minKicksLanded && totalKicksLanded < options.minKicksLanded) {
            return;
          }
          
          // Apply striking style filters
          if (options?.minJabsThrown && totalJabsThrown < options.minJabsThrown) {
            return;
          }
          if (options?.minHooksThrown && totalHooksThrown < options.minHooksThrown) {
            return;
          }
          if (options?.minStraightsThrown && totalStraightsThrown < options.minStraightsThrown) {
            return;
          }
          if (options?.minUppercutsThrown && totalUppercutsThrown < options.minUppercutsThrown) {
            return;
          }
          if (options?.minBodyKicksThrown && totalBodyKicksThrown < options.minBodyKicksThrown) {
            return;
          }
          if (options?.minLegKicksThrown && totalLegKicksThrown < options.minLegKicksThrown) {
            return;
          }
          if (options?.minHighKicksThrown && totalHighKicksThrown < options.minHighKicksThrown) {
            return;
          }
          if (options?.minElbowsThrown && totalElbowsThrown < options.minElbowsThrown) {
            return;
          }
          
          // Extract fight outcome stats
          const fightOutcomeStats = data.fight_outcome_stats || {};
          const wins = fightOutcomeStats.FighterWins || 0;
          const losses = fightOutcomeStats.FighterLoss || 0;
          const titleFightWins = fightOutcomeStats.WinsInTitleFights || 0;
          const titleFightLosses = fightOutcomeStats.LossesInTitleFights || 0;
          const totalFights = wins + losses;
          const winPercentage = totalFights > 0 ? (wins / totalFights) * 100 : 0;
          
          // Apply fight outcome filters
          if (options?.minWins && wins < options.minWins) {
            return;
          }
          if (options?.maxLosses && losses > options.maxLosses) {
            return;
          }
          if (options?.minWinPercentage && winPercentage < options.minWinPercentage) {
            return;
          }
          if (options?.hasTitleFightWins && titleFightWins === 0) {
            return;
          }
          if (options?.hasTitleFightLosses && titleFightLosses === 0) {
            return;
          }
          
          // Calculate accuracy percentages
          let strikeAccuracyPercentage = 0;
          if (totalStrikesThrown > 0) {
            strikeAccuracyPercentage = (totalStrikesLanded / totalStrikesThrown) * 100;
          }
          
          let punchAccuracyPercentage = 0;
          if (totalPunchesThrown > 0) {
            punchAccuracyPercentage = (totalPunchesLanded / totalPunchesThrown) * 100;
          }
          
          let kickAccuracyPercentage = 0;
          if (totalKicksThrown > 0) {
            kickAccuracyPercentage = (totalKicksLanded / totalKicksThrown) * 100;
          }
          
          // Round to 2 decimal places for cleaner display
          strikeAccuracyPercentage = Math.round(strikeAccuracyPercentage * 100) / 100;
          punchAccuracyPercentage = Math.round(punchAccuracyPercentage * 100) / 100;
          kickAccuracyPercentage = Math.round(kickAccuracyPercentage * 100) / 100;
          
          // Apply accuracy filters
          if (options?.minStrikeAccuracy && strikeAccuracyPercentage < options.minStrikeAccuracy) {
            return;
          }
          if (options?.maxStrikeAccuracy && strikeAccuracyPercentage > options.maxStrikeAccuracy) {
            return;
          }
          if (options?.minPunchAccuracy && punchAccuracyPercentage < options.minPunchAccuracy) {
            return;
          }
          if (options?.maxPunchAccuracy && punchAccuracyPercentage > options.maxPunchAccuracy) {
            return;
          }
          if (options?.minKickAccuracy && kickAccuracyPercentage < options.minKickAccuracy) {
            return;
          }
          if (options?.maxKickAccuracy && kickAccuracyPercentage > options.maxKickAccuracy) {
            return;
          }

          // Extract enhanced data for new visualizations
          const clinchStats = data.clinch_stats || {};
          const groundStats = data.ground_stats || {};
          const takedownStats = data.takedown_stats || {};
          const submissionStats = data.submission_stats || {};
          
          // Clinch and ground strikes
          const clinchStrikesLanded = clinchStats.TotalClinchStrikesMade || 0;
          const clinchStrikesThrown = clinchStats.TotalClinchStrikesThrown || 0;
          const groundStrikesLanded = groundStats.TotalGroundStrikesMade || 0;
          const groundStrikesThrown = groundStats.TotalGroundStrikesThrown || 0;
          
          // Takedown stats
          const takedownAttempts = (takedownStats.BodyLockTakedownAttempts || 0) + 
                                  (takedownStats.DoubleLegTakedownAttempts || 0) + 
                                  (takedownStats.SingleLegTakedownAttempts || 0) +
                                  (takedownStats.TripTakedownAttempts || 0);
          const takedownSuccess = (takedownStats.BodyLockTakedownSuccess || 0) + 
                                 (takedownStats.DoubleLegTakedownSuccess || 0) + 
                                 (takedownStats.SingleLegTakedownSuccess || 0) +
                                 (takedownStats.TripTakedownSuccess || 0);
          
          // Submission stats
          const submissionAttempts = submissionStats.SubAttempts || 0;
          const submissionWins = (submissionStats.SUBRNCWin || 0) + 
                                (submissionStats.SubGuillotineWin || 0) + 
                                (submissionStats.SubKimuraWin || 0) +
                                (submissionStats.SubTriangleWin || 0) +
                                (submissionStats.SubArmTriangleWin || 0);
          
          // Cage position stats
          const centerOctagon = data.CenterOctagon || 0;
          const pushedBackToCage = data.PushedBackToCage || 0;
          const pushingAgainstCage = data.PushingAgainstCage || 0;
          
          // Calculate per-minute rates and success rates
          const clinchStrikesPerMinute = minutesTracked > 0 ? clinchStrikesLanded / minutesTracked : 0;
          const groundStrikesPerMinute = minutesTracked > 0 ? groundStrikesLanded / minutesTracked : 0;
          const takedownSuccessRate = takedownAttempts > 0 ? (takedownSuccess / takedownAttempts) * 100 : 0;
          const submissionSuccessRate = submissionAttempts > 0 ? (submissionWins / submissionAttempts) * 100 : 0;

          totalsData.push({
            fighterCode,
            fighterName,
            totalPunchesLanded,
            totalPunchesThrown,
            totalKicksLanded,
            totalKicksThrown,
            totalStrikesLanded,
            totalStrikesThrown,
            strikeAccuracyPercentage,
            punchAccuracyPercentage,
            kickAccuracyPercentage,
            minutesTracked,
            strikesLandedPerMinute: minutesTracked > 0 ? totalStrikesLanded / minutesTracked : 0,
            punchesLandedPerMinute: minutesTracked > 0 ? totalPunchesLanded / minutesTracked : 0,
            kicksLandedPerMinute: minutesTracked > 0 ? totalKicksLanded / minutesTracked : 0,
            // Additional fields for enhanced data
            fightsTracked,
            roundsTracked,
            wins,
            losses,
            winPercentage: Math.round(winPercentage * 100) / 100,
            titleFightWins,
            titleFightLosses,
            totalJabsThrown,
            totalHooksThrown,
            totalStraightsThrown,
            totalUppercutsThrown,
            totalBodyKicksThrown,
            totalLegKicksThrown,
            totalHighKicksThrown,
            totalElbowsThrown,
            // Enhanced fields for new visualizations
            clinchStrikesLanded,
            clinchStrikesThrown,
            groundStrikesLanded,
            groundStrikesThrown,
            takedownAttempts,
            takedownSuccess,
            submissionAttempts,
            submissionWins,
            centerOctagon,
            pushedBackToCage,
            pushingAgainstCage,
            clinchStrikesPerMinute,
            groundStrikesPerMinute,
            takedownSuccessRate,
            submissionSuccessRate
          });
        });

        // Sort based on options
        const sortBy = options?.sortBy || 'accuracy';
        const sortOrder = options?.sortOrder || 'desc';
        
        totalsData.sort((a, b) => {
          let comparison = 0;
          
          switch (sortBy) {
            case 'accuracy':
              comparison = a.strikeAccuracyPercentage - b.strikeAccuracyPercentage;
              break;
            case 'strikesLanded':
              comparison = a.totalStrikesLanded - b.totalStrikesLanded;
              break;
            case 'strikesThrown':
              comparison = a.totalStrikesThrown - b.totalStrikesThrown;
              break;
            case 'name':
              comparison = a.fighterName.localeCompare(b.fighterName);
              break;
            case 'minutesTracked':
              comparison = a.minutesTracked - b.minutesTracked;
              break;
            case 'wins':
              comparison = (a.wins || 0) - (b.wins || 0);
              break;
            case 'winPercentage':
              comparison = (a.winPercentage || 0) - (b.winPercentage || 0);
              break;
            default:
              comparison = a.strikeAccuracyPercentage - b.strikeAccuracyPercentage;
          }
          
          return sortOrder === 'desc' ? -comparison : comparison;
        });

        // Apply limit if specified
        const limitedData = options?.limit ? totalsData.slice(0, options.limit) : totalsData;

        console.log('Filtered results:', {
          totalProcessed: querySnapshot.size,
          filteredCount: totalsData.length,
          finalCount: limitedData.length,
          options
        });

        setFighterTotals(limitedData);
      } catch (err) {
        console.error('Error fetching filtered fighter totals:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fighter totals');
        setFighterTotals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFighterTotals();
  }, [options]);

  return { fighterTotals, loading, error };
}; 