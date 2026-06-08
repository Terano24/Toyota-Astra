import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';

/**
 * Custom hook to map salesman doc IDs to their firstName field.
 * @param {Array} salesmanIds - Array of salesman Firestore doc IDs
 * @returns {Object} - { [salesmanId]: firstName }
 */
export default function useSalesmanNames(salesmanIds) {
  const [salesmanNames, setSalesmanNames] = useState({});

  useEffect(() => {
    if (!salesmanIds || salesmanIds.length === 0) return;
    let isMounted = true;
    const fetchNames = async () => {
      const newNames = {};
      for (const id of salesmanIds) {
        if (!id) continue;
        try {
          const docRef = doc(db, 'salesmen', id);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            newNames[id] = snap.data().firstName || snap.data().name || 'Salesman';
          } else {
            newNames[id] = 'Salesman';
          }
        } catch {
          newNames[id] = 'Salesman';
        }
      }
      if (isMounted) setSalesmanNames(newNames);
    };
    fetchNames();
    return () => { isMounted = false; };
    // Use a stable stringified version of salesmanIds as dependency for deep equality
  }, [(() => JSON.stringify(salesmanIds))()]);

  return salesmanNames;
}
