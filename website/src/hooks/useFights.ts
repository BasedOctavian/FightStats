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
  Timestamp,
  limit
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
            createdAt: fightData.createdAt instanceof Timestamp ? fightData.createdAt.toDate() : fightData.createdAt,
            updatedAt: fightData.updatedAt instanceof Timestamp ? fightData.updatedAt.toDate() : fightData.updatedAt,
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

// Hook to fetch all fights
export const useAllFights = (options?: {
  eventCode?: string;
  fighterA?: string;
  fighterB?: string;
  weightClass?: string;
  methodOfFinish?: string;
  sortBy?: 'date' | 'eventCode' | 'weightClass';
  sortOrder?: 'asc' | 'desc';
}) => {
  const [fights, setFights] = useState<Fight[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFights = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching fights from collection:', COLLECTIONS.FIGHTS);
        let fightsQuery = collection(db, COLLECTIONS.FIGHTS);

        // Build query with filters
        const constraints = [];

        // Filter by event code if specified
        if (options?.eventCode) {
          constraints.push(where('eventCode', '==', options.eventCode));
        }

        // Filter by fighter A if specified
        if (options?.fighterA) {
          constraints.push(where('fighterA', '==', options.fighterA));
        }

        // Filter by fighter B if specified
        if (options?.fighterB) {
          constraints.push(where('fighterB', '==', options.fighterB));
        }

        // Filter by weight class if specified
        if (options?.weightClass) {
          constraints.push(where('weightClass', '==', options.weightClass));
        }

        // Filter by method of finish if specified
        if (options?.methodOfFinish) {
          constraints.push(where('methodOfFinish', '==', options.methodOfFinish));
        }

        // Add sorting
        if (options?.sortBy) {
          constraints.push(orderBy(options.sortBy, options.sortOrder || 'asc'));
        }

        console.log('Query constraints:', constraints);

        // Execute query
        const querySnapshot = await getDocs(
          constraints.length > 0 ? query(fightsQuery, ...constraints) : fightsQuery
        );

        console.log('Query snapshot size:', querySnapshot.size);

        const fightsData: Fight[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          fightsData.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
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
  }, [options?.eventCode, options?.fighterA, options?.fighterB, options?.weightClass, options?.methodOfFinish, options?.sortBy, options?.sortOrder]);

  return { fights, loading, error };
};

// Hook to fetch fights by multiple fight codes
export const useFightsByIds = (fightCodes: string[]) => {
  const [fights, setFights] = useState<Fight[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFights = async () => {
      if (!fightCodes.length) {
        setFights([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Create a query to get all fights where fightCode is in the provided array
        const fightsQuery = query(
          collection(db, COLLECTIONS.FIGHTS),
          where('fightCode', 'in', fightCodes)
        );

        const querySnapshot = await getDocs(fightsQuery);
        const fightsData: Fight[] = [];

        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const fightData = doc.data();
          fightsData.push({
            ...fightData,
            id: doc.id,
            createdAt: fightData.createdAt instanceof Timestamp ? fightData.createdAt.toDate() : fightData.createdAt,
            updatedAt: fightData.updatedAt instanceof Timestamp ? fightData.updatedAt.toDate() : fightData.updatedAt,
          } as Fight);
        });

        setFights(fightsData);
      } catch (err) {
        console.error('Error fetching fights by codes:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fights');
        setFights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFights();
  }, [fightCodes.join(',')]); // Use join to create a stable dependency

  return { fights, loading, error };
};

// Hook to fetch fights for a specific fighter
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
        // Create a query to get all fights where the fighter is either fighterA or fighterB
        const fightsQuery = query(
          collection(db, COLLECTIONS.FIGHTS),
          where('fighterA', '==', fighterCode)
        );

        const fightsQuery2 = query(
          collection(db, COLLECTIONS.FIGHTS),
          where('fighterB', '==', fighterCode)
        );

        const [snapshot1, snapshot2] = await Promise.all([
          getDocs(fightsQuery),
          getDocs(fightsQuery2)
        ]);

        const fightsData: Fight[] = [];

        // Process first query results
        snapshot1.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const fightData = doc.data();
          fightsData.push({
            ...fightData,
            id: doc.id,
            createdAt: fightData.createdAt instanceof Timestamp ? fightData.createdAt.toDate() : fightData.createdAt,
            updatedAt: fightData.updatedAt instanceof Timestamp ? fightData.updatedAt.toDate() : fightData.updatedAt,
          } as Fight);
        });

        // Process second query results
        snapshot2.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const fightData = doc.data();
          fightsData.push({
            ...fightData,
            id: doc.id,
            createdAt: fightData.createdAt instanceof Timestamp ? fightData.createdAt.toDate() : fightData.createdAt,
            updatedAt: fightData.updatedAt instanceof Timestamp ? fightData.updatedAt.toDate() : fightData.updatedAt,
          } as Fight);
        });

        // Remove duplicates and sort by date if available
        const uniqueFights = fightsData.filter((fight, index, self) => 
          index === self.findIndex(f => f.id === fight.id)
        );

        setFights(uniqueFights);
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