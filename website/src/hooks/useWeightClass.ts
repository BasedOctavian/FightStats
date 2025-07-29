import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs,
  query,
  where,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { WeightClass, COLLECTIONS } from '../types/firestore';

// Hook to fetch a specific weight class by name
export const useWeightClass = (weightClassName: string | null) => {
  const [weightClass, setWeightClass] = useState<WeightClass | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useWeightClass hook called with weightClassName:', weightClassName);
    
    const fetchWeightClass = async () => {
      if (!weightClassName) {
        console.log('No weight class name provided, returning null');
        setWeightClass(null);
        setLoading(false);
        setError(null);
        return;
      }

      console.log('Starting to fetch weight class for:', weightClassName);
      setLoading(true);
      setError(null);

      try {
        console.log('Creating query for weight class:', weightClassName);
        // First get all documents to see what's available
        const allDocsQuery = collection(db, COLLECTIONS.WEIGHT_CLASSES);
        const allDocs = await getDocs(allDocsQuery);
        console.log('All available weight classes:', 
          allDocs.docs.map(doc => ({
            id: doc.id,
            name: doc.data().weightclassname,
            weight: doc.data().weight
          }))
        );

        // Query for the specific weight class by name
        const weightClassQuery = query(
          collection(db, COLLECTIONS.WEIGHT_CLASSES),
          where('weightclassname', '==', weightClassName)
        );

        console.log('Executing weight class query...');
        const querySnapshot = await getDocs(weightClassQuery);
        console.log('Query completed. Found documents:', querySnapshot.size);

        if (!querySnapshot.empty) {
          const weightClassDoc = querySnapshot.docs[0];
          const weightClassData = weightClassDoc.data();
          
          console.log('Found weight class document. Details:');
          console.group('Weight Class Document');
          console.log('ID:', weightClassDoc.id);
          console.log('Name:', weightClassData.weightclassname);
          console.log('Weight:', weightClassData.weight);
          console.log('Full document data:', weightClassData);
          console.groupEnd();
          
          setWeightClass({
            ...weightClassData,
            id: weightClassDoc.id,
          } as WeightClass);
          console.log('Weight class data set to state');
        } else {
          console.warn('No weight class found for:', weightClassName);
          setWeightClass(null);
          setError('Weight class not found');
        }
      } catch (err) {
        console.error('Error fetching weight class:', err);
        console.error('Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          error: err
        });
        setError(err instanceof Error ? err.message : 'Failed to fetch weight class');
        setWeightClass(null);
      } finally {
        console.log('Fetch operation completed. Loading state set to false');
        setLoading(false);
      }
    };

    fetchWeightClass();
  }, [weightClassName]);

  // Log state changes
  useEffect(() => {
    console.log('Weight class hook state updated:', {
      weightClassName,
      hasWeightClass: weightClass !== null,
      loading,
      error
    });
  }, [weightClassName, weightClass, loading, error]);

  return { weightClass, loading, error };
}; 