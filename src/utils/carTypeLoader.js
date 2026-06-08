import React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Loads the initial car type for a given document ID
 * @param {string} documentId - The Firestore document ID for the car types
 * @param {function} setSelectedCarType - State setter function for selected car type
 * @returns {Promise<void>}
 */
export const loadInitialCarType = async (documentId, setSelectedCarType) => {
  try {
    const docRef = doc(db, 'car_types', documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.types && data.types.length > 0) {
        // Get the first available type as initial selection
        const initialType = data.types[0];
        const priceNumber = parseInt(String(initialType.price).replace(/[^0-9]/g, ''), 10);
        setSelectedCarType({ ...initialType, price: priceNumber });
        console.log(`Initial car type loaded for ${documentId}:`, initialType.name);
      }
    } else {
      console.warn(`No car types found for document ID: ${documentId}`);
    }
  } catch (error) {
    console.error(`Error loading initial car type for ${documentId}:`, error);
  }
};

/**
 * Hook to automatically load initial car type on component mount
 * @param {string} documentId - The Firestore document ID for the car types
 * @param {function} setSelectedCarType - State setter function for selected car type
 */
export const useInitialCarType = (documentId, setSelectedCarType) => {
  React.useEffect(() => {
    if (documentId && setSelectedCarType) {
      loadInitialCarType(documentId, setSelectedCarType);
    }
  }, [documentId, setSelectedCarType]);
};
