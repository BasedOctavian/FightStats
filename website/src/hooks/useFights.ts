import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  DocumentData,
  QueryDocumentSnapshot,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Fight, COLLECTIONS } from '../types/firestore';

// Hook to fetch a single fight by fightCode
export const useFight = (fightCode: string | null) => {
  const [fight, setFight] = useState<Fight | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFight = async () => {
      if (!fightCode) {
        setFight(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fightDoc = doc(db, COLLECTIONS.FIGHTS, fightCode);
        const fightSnapshot = await getDoc(fightDoc);

        if (fightSnapshot.exists()) {
          const fightData = fightSnapshot.data();
          setFight({
            ...fightData,
            id: fightSnapshot.id,
          } as Fight);
        } else {
          setFight(null);
          setError('Fight not found');
        }
      } catch (err) {
        console.error('Error fetching fight:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fight');
        setFight(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFight();
  }, [fightCode]);

  return { fight, loading, error };
};

// Hook to fetch all fights with optional filters
export const useAllFights = (options?: {
  weightClass?: string;
  isTitleFight?: 'Yes' | 'No';
  gender?: 'Male' | 'Female';
  methodOfFinish?: 'KO' | 'TKO' | 'SUB' | 'DEC' | 'DQ' | 'NC';
}) => {
  const [fights, setFights] = useState<Fight[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFights = async () => {
      setLoading(true);
      setError(null);

      try {
        let fightsQuery = collection(db, COLLECTIONS.FIGHTS);
        const constraints = [];

        // Apply filters
        if (options?.weightClass) {
          constraints.push(where('weightClass', '==', options.weightClass));
        }
        if (options?.isTitleFight) {
          constraints.push(where('isTitleFight', '==', options.isTitleFight));
        }
        if (options?.gender) {
          constraints.push(where('gender', '==', options.gender));
        }
        if (options?.methodOfFinish) {
          constraints.push(where('methodOfFinish', '==', options.methodOfFinish));
        }

        // Default sort by eventCode descending to get newest fights first
        constraints.push(orderBy('eventCode', 'desc'));

        // Execute query
        const querySnapshot = await getDocs(
          constraints.length > 0 ? query(fightsQuery, ...constraints) : fightsQuery
        );

        const fightsData: Fight[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          fightsData.push({
            ...data,
            id: doc.id,
          } as Fight);
        });

        setFights(fightsData);
      } catch (err) {
        console.error('Error fetching fights:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fights');
        setFights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFights();
  }, [
    options?.weightClass,
    options?.isTitleFight,
    options?.gender,
    options?.methodOfFinish
  ]);

  return { fights, loading, error };
};

// Hook to fetch all fights for a specific fighter
export const useFighterFights = (fighterCode: string | null) => {
  const [fights, setFights] = useState<Fight[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFighterFights = async () => {
      if (!fighterCode) {
        setFights([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Query fights where the fighter is either fighterA or fighterB
        const fighterAQuery = query(
          collection(db, COLLECTIONS.FIGHTS),
          where('fighterA', '==', fighterCode),
          orderBy('eventCode', 'desc')
        );

        const fighterBQuery = query(
          collection(db, COLLECTIONS.FIGHTS),
          where('fighterB', '==', fighterCode),
          orderBy('eventCode', 'desc')
        );

        // Execute both queries in parallel
        const [fighterASnapshot, fighterBSnapshot] = await Promise.all([
          getDocs(fighterAQuery),
          getDocs(fighterBQuery)
        ]);

        const fightsData: Fight[] = [];

        // Process fights where the fighter is fighterA
        fighterASnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          fightsData.push({
            ...data,
            id: doc.id,
          } as Fight);
        });

        // Process fights where the fighter is fighterB
        fighterBSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          fightsData.push({
            ...data,
            id: doc.id,
          } as Fight);
        });

        // Sort all fights by eventCode descending (newest first)
        fightsData.sort((a, b) => b.eventCode.localeCompare(a.eventCode));

        setFights(fightsData);
      } catch (err) {
        console.error('Error fetching fighter fights:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fighter fights');
        setFights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFighterFights();
  }, [fighterCode]);

  return { fights, loading, error };
};

// Hook to fetch all fights for a specific event
export const useEventFights = (eventCode: string | null) => {
  const [fights, setFights] = useState<Fight[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventFights = async () => {
      if (!eventCode) {
        setFights([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Query fights where eventCode matches
        const fightsQuery = query(
          collection(db, COLLECTIONS.FIGHTS),
          where('eventCode', '==', eventCode)
        );

        const querySnapshot = await getDocs(fightsQuery);
        const fightsData: Fight[] = [];

        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          fightsData.push({
            ...data,
            id: doc.id,
          } as Fight);
        });

        // Sort fights: title fights first, then by fightCode
        fightsData.sort((a, b) => {
          // First sort by title fight status
          if (a.isTitleFight === 'Yes' && b.isTitleFight !== 'Yes') return -1;
          if (a.isTitleFight !== 'Yes' && b.isTitleFight === 'Yes') return 1;
          
          // Then sort by fightCode to maintain card order within each group
          return a.fightCode.localeCompare(b.fightCode);
        });

        setFights(fightsData);
      } catch (err) {
        console.error('Error fetching event fights:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch event fights');
        setFights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEventFights();
  }, [eventCode]);

  return { fights, loading, error };
}; 

// Hook to fetch a single fight by fightCode field
export const useFightByFightCode = (fightCode: string | null) => {
  const [fight, setFight] = useState<Fight | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFight = async () => {
      if (!fightCode) {
        setFight(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Query fights where fightCode matches
        const fightsQuery = query(
          collection(db, COLLECTIONS.FIGHTS),
          where('fightCode', '==', fightCode),
          limit(1)
        );

        const querySnapshot = await getDocs(fightsQuery);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const fightData = doc.data();
          setFight({
            ...fightData,
            id: doc.id,
          } as Fight);
        } else {
          setFight(null);
          setError('Fight not found');
        }
      } catch (err) {
        console.error('Error fetching fight:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fight');
        setFight(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFight();
  }, [fightCode]);

  return { fight, loading, error };
}; 

// Hook to fetch fight statistics by fightCode
export const useFightStats = (fightCode: string | null) => {
  const [fightStats, setFightStats] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFightStats = async () => {
      if (!fightCode) {
        setFightStats(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Query fightData collection where fightCode matches
        const fightStatsQuery = query(
          collection(db, 'fightData'),
          where('fightCode', '==', fightCode),
          limit(1)
        );

        const querySnapshot = await getDocs(fightStatsQuery);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const statsData = doc.data();
          setFightStats({
            ...statsData,
            id: doc.id,
          });
        } else {
          setFightStats(null);
          setError('Fight statistics not found');
        }
      } catch (err) {
        console.error('Error fetching fight statistics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fight statistics');
        setFightStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFightStats();
  }, [fightCode]);

  return { fightStats, loading, error };
}; 