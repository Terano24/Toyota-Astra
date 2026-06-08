import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Custom hook to load initial car variety to prevent RpNaN display
 * @param {string} carName - The car name (document ID in car_types collection)
 * @param {function} setSelectedCarType - State setter for selected car type
 */
export const useInitialCarVariety = (carName, setSelectedCarType) => {
  useEffect(() => {
    const loadInitialVariety = async () => {
      try {
        const docRef = doc(db, 'car_types', carName);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const carData = docSnap.data();
          if (carData.types && carData.types.length > 0) {
            // Get a random variety as initial state
            const randomIndex = Math.floor(Math.random() * carData.types.length);
            const initialType = carData.types[randomIndex];
            
            // Format the price properly
            const priceNumber = parseInt(String(initialType.price).replace(/[^0-9]/g, ''), 10);
            setSelectedCarType({ ...initialType, price: priceNumber });
            
            console.log(`✅ Initial variety loaded for ${carName}:`, initialType.name);
          }
        } else {
          console.warn(`⚠️ No car varieties found for ${carName}`);
        }
      } catch (error) {
        console.error(`❌ Error loading initial variety for ${carName}:`, error);
      }
    };
    
    if (carName && setSelectedCarType) {
      loadInitialVariety();
    }
  }, [carName, setSelectedCarType]);
};
