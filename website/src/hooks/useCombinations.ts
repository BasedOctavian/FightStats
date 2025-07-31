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
import { COLLECTIONS } from '../types/firestore';

// Function to convert field name to readable format
const convertToReadable = (fieldName: string): string => {
  // Remove ABS__ prefix if present
  let cleanName = fieldName.replace('ABS__', '');
  
  // Split by underscores
  const parts = cleanName.split('_');
  
  // Mapping for individual strikes
  const strikeMapping: { [key: string]: string } = {
    'LeftBodyKick': 'Left Body Kick',
    'RightBodyKick': 'Right Body Kick',
    'LeftHighKick': 'Left High Kick',
    'RightHighKick': 'Right High Kick',
    'LeftHookHi': 'Left Hook To The Head',
    'RightHookHi': 'Right Hook To The Head',
    'LeftHookLo': 'Left Hook To The Body',
    'RightHookLo': 'Right Hook To The Body',
    'LeftStraightHi': 'Left Straight To The Head',
    'RightStraightHi': 'Right Straight To The Head',
    'LeftStraightLo': 'Left Straight To The Body',
    'RightStraightLo': 'Right Straight To The Body',
    'LeftUppercutHi': 'Left Uppercut To The Head',
    'RightUppercutHi': 'Right Uppercut To The Head',
    'LeftUppercutLo': 'Left Uppercut To The Body',
    'RightUppercutLo': 'Right Uppercut To The Body',
    'LeftOverhand': 'Left Overhand',
    'RightOverhand': 'Right Overhand',
    'LeftSpinBackFist': 'Left Spinning Backfist To The Head',
    'RightSpinBackFist': 'Right Spinning Backfist To The Head',
    'LeftElbow': 'Left Elbow',
    'RightElbow': 'Right Elbow',
    'LeftKnee': 'Left Knee',
    'RightKnee': 'Right Knee',
    'LeftHeadKick': 'Left Head Kick',
    'RightHeadKick': 'Right Head Kick',
    'LeftLegKick': 'Left Leg Kick',
    'RightLegKick': 'Right Leg Kick',
    // Jabs
    'LeftJabHi': 'Left Jab To The Head',
    'RightJabHi': 'Right Jab To The Head',
    'LeftJabLo': 'Left Jab To The Body',
    'RightJabLo': 'Right Jab To The Body',
    // Crosses
    'LeftCross': 'Left Cross',
    'RightCross': 'Right Cross',
    // Additional strikes from field descriptions
    'LeftJab': 'Left Jab',
    'RightJab': 'Right Jab',
    'LeftStraight': 'Left Straight',
    'RightStraight': 'Right Straight',
    'LeftHook': 'Left Hook',
    'RightHook': 'Right Hook',
    'LeftUppercut': 'Left Uppercut',
    'RightUppercut': 'Right Uppercut'
  };
  
  // Convert each part to readable format and filter out empty strings
  const readableParts = parts
    .map(part => {
      return strikeMapping[part] || part; // Use mapping or keep original if not found
    })
    .filter(part => part && part.trim() !== ''); // Remove empty or whitespace-only parts
  
  // Process repeated strikes
  const processedParts: string[] = [];
  let currentStrike = '';
  let count = 0;
  
  for (let i = 0; i < readableParts.length; i++) {
    if (readableParts[i] === currentStrike) {
      count++;
    } else {
      // Add the previous repeated strikes
      if (count > 1) {
        processedParts.push(`${count === 2 ? 'Double' : count === 3 ? 'Triple' : `${count}x`} ${currentStrike}`);
      } else if (count === 1) {
        processedParts.push(currentStrike);
      }
      
      // Start new strike
      currentStrike = readableParts[i];
      count = 1;
    }
  }
  
  // Handle the last group of repeated strikes
  if (count > 1) {
    processedParts.push(`${count === 2 ? 'Double' : count === 3 ? 'Triple' : `${count}x`} ${currentStrike}`);
  } else if (count === 1) {
    processedParts.push(currentStrike);
  }
  
  // Join with " to " for combinations
  return processedParts.join(' to ');
};

// Hook to fetch combinations subcollection from a fighter document
export const useCombinations = (fighterId: string | null) => {
  const [absorbed, setAbsorbed] = useState<DocumentData | null>(null);
  const [thrown, setThrown] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCombinations = async () => {
      if (!fighterId) {
        setAbsorbed(null);
        setThrown(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get the combinations subcollection
        const combinationsCollection = collection(db, COLLECTIONS.FIGHTERS, fighterId, 'combinations');
        
        // Get all documents in the combinations subcollection
        const querySnapshot = await getDocs(combinationsCollection);
        
        let firstComboDoc: DocumentData | null = null;

        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          const docWithId = {
            ...data,
            id: doc.id,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
          };

          // Filter out null fields
          const filteredDoc = Object.fromEntries(
            Object.entries(docWithId).filter(([_, value]) => value !== null && value !== undefined)
          );

          // Get the first document (index 0)
          if (firstComboDoc === null) {
            firstComboDoc = filteredDoc;
          }
        });

        // Separate absorbed and thrown combinations
        const absorbedFields: DocumentData = {};
        const thrownFields: DocumentData = {};

        if (firstComboDoc) {
          Object.entries(firstComboDoc).forEach(([key, value]) => {
            // Only include fields with value greater than 1
            if (typeof value === 'number' && value > 1) {
              if (key.startsWith('ABS')) {
                // Only include ABS fields with more than 2 underscores
                const underscoreCount = (key.match(/_/g) || []).length;
                if (underscoreCount > 2) {
                  const readableKey = convertToReadable(key);
                  absorbedFields[readableKey] = value;
                }
              } else {
                // Only include fields with at least 2 underscores for thrown combinations
                const underscoreCount = (key.match(/_/g) || []).length;
                if (underscoreCount >= 2) {
                  const readableKey = convertToReadable(key);
                  thrownFields[readableKey] = value;
                }
              }
            }
          });
        }

        setAbsorbed(absorbedFields);
        setThrown(thrownFields);

        console.log('Absorbed combinations:', absorbedFields);
        console.log('Thrown combinations:', thrownFields);

      } catch (err) {
        console.error('Error fetching combinations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch combinations');
        setAbsorbed(null);
        setThrown(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCombinations();
  }, [fighterId]);

  return { absorbed, thrown, loading, error };
}; 