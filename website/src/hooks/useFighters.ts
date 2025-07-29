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
import { Fighter, COLLECTIONS } from '../types/firestore';

// Hook to fetch a fighter by fighterCode field
export const useFighterByCode = (fighterCode: string | null) => {
  const [fighter, setFighter] = useState<Fighter | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFighterByCode = async () => {
      if (!fighterCode) {
        setFighter(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Create a query to find the fighter with matching fighterCode
        const fighterQuery = query(
          collection(db, COLLECTIONS.FIGHTERS),
          where('fighterCode', '==', fighterCode),
          limit(1)
        );

        const querySnapshot = await getDocs(fighterQuery);

        if (!querySnapshot.empty) {
          const fighterDoc = querySnapshot.docs[0];
          const fighterData = fighterDoc.data();
          setFighter({
            ...fighterData,
            id: fighterDoc.id,
            createdAt: fighterData.createdAt instanceof Timestamp ? fighterData.createdAt.toDate() : fighterData.createdAt,
            updatedAt: fighterData.updatedAt instanceof Timestamp ? fighterData.updatedAt.toDate() : fighterData.updatedAt,
          } as Fighter);
        } else {
          setFighter(null);
          setError('Fighter not found');
        }
      } catch (err) {
        console.error('Error fetching fighter by code:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fighter');
        setFighter(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFighterByCode();
  }, [fighterCode]);

  return { fighter, loading, error };
};

// Hook to fetch a single fighter by fighterCode
export const useFighter = (fighterCode: string | null) => {
  const [fighter, setFighter] = useState<Fighter | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFighter = async () => {
      if (!fighterCode) {
        setFighter(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fighterDoc = doc(db, COLLECTIONS.FIGHTERS, fighterCode);
        const fighterSnapshot = await getDoc(fighterDoc);

        if (fighterSnapshot.exists()) {
          const fighterData = fighterSnapshot.data();
          setFighter({
            ...fighterData,
            id: fighterSnapshot.id,
            createdAt: fighterData.createdAt instanceof Timestamp ? fighterData.createdAt.toDate() : fighterData.createdAt,
            updatedAt: fighterData.updatedAt instanceof Timestamp ? fighterData.updatedAt.toDate() : fighterData.updatedAt,
          } as Fighter);
        } else {
          setFighter(null);
          setError('Fighter not found');
        }
      } catch (err) {
        console.error('Error fetching fighter:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fighter');
        setFighter(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFighter();
  }, [fighterCode]);

  return { fighter, loading, error };
};

// Hook to fetch all fighters
export const useAllFighters = (options?: {
  activeOnly?: boolean;
  weightClass?: string;
  sortBy?: 'name' | 'weightClass' | 'record';
  sortOrder?: 'asc' | 'desc';
}) => {
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFighters = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching fighters from collection:', COLLECTIONS.FIGHTERS);
        let fightersQuery = collection(db, COLLECTIONS.FIGHTERS);

        // Build query with filters
        const constraints = [];

        // Filter by active status if specified
        if (options?.activeOnly !== undefined) {
          constraints.push(where('isActive', '==', options.activeOnly));
        }

        // Filter by weight class if specified
        if (options?.weightClass) {
          constraints.push(where('weightClass', '==', options.weightClass));
        }

        // Add sorting
        if (options?.sortBy) {
          const sortField = options.sortBy === 'record' ? 'record.wins' : options.sortBy;
          constraints.push(orderBy(sortField, options.sortOrder || 'asc'));
        }

        console.log('Query constraints:', constraints);

        // Execute query
        const querySnapshot = await getDocs(
          constraints.length > 0 ? query(fightersQuery, ...constraints) : fightersQuery
        );

        console.log('Query snapshot size:', querySnapshot.size);

        const fightersData: Fighter[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          fightersData.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
          } as Fighter);
        });

        setFighters(fightersData);
      } catch (err) {
        console.error('Error fetching fighters:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fighters');
        setFighters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFighters();
  }, [options?.activeOnly, options?.weightClass, options?.sortBy, options?.sortOrder]);

  return { fighters, loading, error };
};

// Hook to fetch fighters by multiple fighter codes
export const useFightersByIds = (fighterCodes: string[]) => {
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFighters = async () => {
      if (!fighterCodes.length) {
        setFighters([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Create a query to get all fighters where fighterCode is in the provided array
        const fightersQuery = query(
          collection(db, COLLECTIONS.FIGHTERS),
          where('fighterCode', 'in', fighterCodes)
        );

        const querySnapshot = await getDocs(fightersQuery);
        const fightersData: Fighter[] = [];

        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const fighterData = doc.data();
          fightersData.push({
            ...fighterData,
            id: doc.id,
            createdAt: fighterData.createdAt instanceof Timestamp ? fighterData.createdAt.toDate() : fighterData.createdAt,
            updatedAt: fighterData.updatedAt instanceof Timestamp ? fighterData.updatedAt.toDate() : fighterData.updatedAt,
          } as Fighter);
        });

        setFighters(fightersData);
      } catch (err) {
        console.error('Error fetching fighters by codes:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fighters');
        setFighters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFighters();
  }, [fighterCodes.join(',')]); // Use join to create a stable dependency

  return { fighters, loading, error };
}; 