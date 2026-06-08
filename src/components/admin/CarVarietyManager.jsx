import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { FiPlus, FiTrash2, FiEdit, FiSave, FiXCircle } from 'react-icons/fi';


const formatNumber = (value) => {
  if (!value) return '';
  const numberString = String(value).replace(/\D/g, '');
  if (numberString === '') return '';
  return new Intl.NumberFormat('id-ID').format(numberString);
};

const COLORS = {
  primary: '#DC2626', // Red-600
  primary_light: '#FEE2E2', // Red-100
  secondary: '#4B5563', // Gray-600
  background: '#F9FAFB', // Gray-50
  card_bg: '#FFFFFF',
  border: '#E5E7EB', // Gray-200
  success: '#10B981', // Green-500
  warning: '#F59E0B', // Amber-500
};

export default function CarVarietyManager() {
  const [carVarieties, setCarVarieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [documentId, setDocumentId] = useState('');
  const [modelName, setModelName] = useState('');
  const [types, setTypes] = useState([{ name: '', price: '', transmission: 'Otomatis' }]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shouldScroll, setShouldScroll] = useState(false);
  const editFormRef = useRef(null);

  // Fetch car varieties from Firestore
  const fetchVarieties = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'car_types'));
      const varietiesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCarVarieties(varietiesData);
    } catch (err) {
      setError('Gagal memuat data varietas mobil.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVarieties();
  }, []);

  useEffect(() => {
    const addAgyaGRData = async () => {
      const agyaGRTypes = [
        { name: 'AGYA 1.2 GR M/T (One Tone) LUX', price: '298.568.000', transmission: 'Manual' },
        { name: 'AGYA 1.2 GR M/T (Two Tone) LUX', price: '301.068.000', transmission: 'Manual' },
        { name: 'AGYA 1.2 GR CVT (One Tone) LUX', price: '319.668.000', transmission: 'Otomatis' },
        { name: 'AGYA STYLIX 1.2 G CVT LUX', price: '253.168.000', transmission: 'Otomatis' },
        { name: 'AGYA 1.2 GR-S M/T (One Tone) LUX', price: '289.268.000', transmission: 'Manual' },
        { name: 'AGYA 1.2 GR-S M/T (Two Tone) LUX', price: '291.768.000', transmission: 'Manual' },
        { name: 'AGYA 1.2 GR-S CVT (One Tone) LUX', price: '306.568.000', transmission: 'Otomatis' },
        { name: 'AGYA 1.2 GR-S CVT (Two Tone) LUX', price: '309.068.000', transmission: 'Otomatis' },
        { name: 'AGYA 1.2 GR CVT (Two Tone) LUX', price: '318.168.000', transmission: 'Otomatis' },
      ];
      const agyaGRDocId = 'Agya GR';

      try {
        const docRef = doc(db, 'car_types', agyaGRDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;

        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const existingTypes = existingData.types || [];
          
          const typesToAdd = agyaGRTypes.filter(
            newType => !existingTypes.some(existing => existing.name === newType.name)
          );

          if (typesToAdd.length > 0) {
            await updateDoc(docRef, {
              types: [...existingData.types, ...typesToAdd],
            });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, {
            modelName: 'Agya GR',
            types: agyaGRTypes,
          });
          docUpdated = true;
        }

        if (docUpdated) {
          console.log('Agya GR data synced successfully to doc ID:', agyaGRDocId);
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Agya GR data:', err);
        setError('Gagal menyinkronkan data Agya GR.');
      }
    };

    addAgyaGRData();
  }, []);

  useEffect(() => {
    const addAlphardData = async () => {
      const alphardTypes = [
        { name: 'NEW ALPHARD 2.5 X CVT', price: '1.425.000.000', transmission: 'Otomatis' },
        { name: 'NEW ALPHARD 2.5 X CVT (Premium Color)', price: '1.428.600.000', transmission: 'Otomatis' },
        { name: 'NEW ALPHARD 2.5 G CVT', price: '1.644.800.000', transmission: 'Otomatis' },
        { name: 'NEW ALPHARD 2.5 G CVT (Premium Color)', price: '1.648.300.000', transmission: 'Otomatis' },
        { name: 'NEW ALPHARD 2.5 HYBRID CVT', price: '1.728.000.000', transmission: 'Otomatis' },
        { name: 'NEW ALPHARD 2.5 HYBRID CVT (Premium Color)', price: '1.731.600.000', transmission: 'Otomatis' },
      ];
      const alphardDocId = 'Alphard';

      try {
        const docRef = doc(db, 'car_types', alphardDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;

        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const existingTypes = existingData.types || [];
          
          const typesToAdd = alphardTypes.filter(
            newType => !existingTypes.some(existing => existing.name === newType.name)
          );

          if (typesToAdd.length > 0) {
            await updateDoc(docRef, {
              types: [...existingData.types, ...typesToAdd],
            });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, {
            modelName: 'Alphard',
            types: alphardTypes,
          });
          docUpdated = true;
        }

        if (docUpdated) {
          console.log('Alphard data synced successfully to doc ID:', alphardDocId);
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Alphard data:', err);
        setError('Gagal menyinkronkan data Alphard.');
      }
    };

    addAlphardData();
  }, []);

  useEffect(() => {
    const addCalyaData = async () => {
      const calyaTypes = [
        { name: 'CALYA 1.2 E MT STD LUX', price: '235.850.000', transmission: 'Manual' },
        { name: 'CALYA 1.2 E MT LUX', price: '239.050.000', transmission: 'Manual' },
        { name: 'CALYA 1.2 G MT LUX', price: '244.850.000', transmission: 'Manual' },
        { name: 'CALYA 1.2 G AT LUX', price: '258.550.000', transmission: 'Otomatis' },
      ];
      const calyaDocId = 'Calya';
      try {
        const docRef = doc(db, 'car_types', calyaDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = calyaTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: 'Calya', types: calyaTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Calya data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Calya data:', err);
      }
    };
    addCalyaData();
  }, []);

  useEffect(() => {
    const addCamryData = async () => {
      const camryTypes = [
        { name: 'CAMRY 2.5 V A/T', price: '813.000.000', transmission: 'Otomatis' },
        { name: 'CAMRY 2.5 V A/T (Premium Color)', price: '816.000.000', transmission: 'Otomatis' },
      ];
      const camryDocId = 'Camry';
      try {
        const docRef = doc(db, 'car_types', camryDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = camryTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: 'Camry', types: camryTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Camry data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Camry data:', err);
      }
    };
    addCamryData();
  }, []);

  useEffect(() => {
    const addCamryHybridData = async () => {
      const camryHybridTypes = [
        { name: 'CAMRY 2.5 L A/T HYBRID', price: '955.800.000', transmission: 'Otomatis' },
        { name: 'CAMRY 2.5 L A/T HYBRID (Premium Color)', price: '958.800.000', transmission: 'Otomatis' },
        { name: 'CAMRY 2.5 L/A/T HYBRID', price: '975.600.000', transmission: 'Otomatis' },
        { name: 'CAMRY 2.5 L/A/T HYBRID (Premium Color)', price: '978.600.000', transmission: 'Otomatis' },
      ];
      const camryHybridDocId = 'Camry Hybrid';
      try {
        const docRef = doc(db, 'car_types', camryHybridDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = camryHybridTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: 'Camry Hybrid', types: camryHybridTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Camry Hybrid data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Camry Hybrid data:', err);
      }
    };
    addCamryHybridData();
  }, []);

  useEffect(() => {
    const addCorollaAltisData = async () => {
      const corollaAltisTypes = [
        { name: 'COROLLA ALTIS 1.8 V A/T', price: '583.700.000', transmission: 'Otomatis' },
        { name: 'COROLLA ALTIS 1.8 V A/T (Premium Color)', price: '586.700.000', transmission: 'Otomatis' },
        { name: 'COROLLA ALTIS 1.8L HYBRID A/T', price: '636.600.000', transmission: 'Otomatis' },
        { name: 'COROLLA ALTIS 1.8L HYBRID A/T (Premium Color)', price: '639.600.000', transmission: 'Otomatis' },
      ];
      const corollaAltisDocId = 'Corolla Altis';
      try {
        const docRef = doc(db, 'car_types', corollaAltisDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = corollaAltisTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: corollaAltisDocId, types: corollaAltisTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Corolla Altis data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Corolla Altis data:', err);
      }
    };
    addCorollaAltisData();
  }, []);

  useEffect(() => {
    const addCorollaCrossData = async () => {
      const corollaCrossTypes = [
        { name: 'COROLLA CROSS 1.8 HYBRID A/T', price: '607.500.000', transmission: 'Otomatis' },
        { name: 'COROLLA CROSS 1.8 HYBRID A/T (Premium Color)', price: '610.500.000', transmission: 'Otomatis' },
        { name: 'COROLLA CROSS 1.8 HYBRID GR-S A/T', price: '646.400.000', transmission: 'Otomatis' },
        { name: 'COROLLA CROSS 1.8 HYBRID GR-S A/T (Dual Tone)', price: '626.500.000', transmission: 'Otomatis' },
        { name: 'COROLLA CROSS 1.8 HYBRID GR-S A/T (Premium Color) (Dual Tone)', price: '628.000.000', transmission: 'Otomatis' },
        { name: 'COROLLA CROSS 1.8 HYBRID GR-S A/T (Premium Color)', price: '651.500.000', transmission: 'Otomatis' },
      ];
      const corollaCrossDocId = 'Corolla Cross';
      try {
        const docRef = doc(db, 'car_types', corollaCrossDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = corollaCrossTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: corollaCrossDocId, types: corollaCrossTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Corolla Cross data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Corolla Cross data:', err);
      }
    };
    addCorollaCrossData();
  }, []);

  useEffect(() => {
    const addDynaData = async () => {
      const dynaTypes = [
        { name: 'DYNA 115 ST 4X2 5M/T', price: '420.200.000', transmission: 'Manual' },
        { name: 'DYNA 136 HT HI-GEAR 4X2 6M/T', price: '504.900.000', transmission: 'Manual' },
        { name: 'DYNA 136 HT HI-GEAR 4X2 6M/T (PTO)', price: '508.900.000', transmission: 'Manual' },
      ];
      const dynaDocId = 'DYNA';
      try {
        const docRef = doc(db, 'car_types', dynaDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = dynaTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: dynaDocId, types: dynaTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('DYNA data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing DYNA data:', err);
      }
    };
    addDynaData();
  }, []);

  useEffect(() => {
    const addFortuner4x2Data = async () => {
      const fortuner4x2Types = [
        { name: 'FORTUNER 2.8 VRZ 4x2 A/T', price: '650.900.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.8 VRZ TSS 4x2 A/T', price: '685.100.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.8 VRZ WITH GR PARTS AERO PACKAGE TSS 4x2 A/T ONE TONE (Non Premium)', price: '675.700.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.8 VRZ WITH GR PARTS AERO PACKAGE TSS 4x2 A/T TWO TONE (Premium Col)', price: '680.800.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.8 VRZ WITH GR PARTS AERO PACKAGE TSS 4x2 A/T ONE TONE (Premium Col)', price: '678.900.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.4 G 4x2 M/T', price: '582.900.000', transmission: 'Manual' },
        { name: 'FORTUNER 2.4 G 4x2 A/T', price: '600.700.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.7 SRZ 4x2 A/T', price: '623.100.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.7 SRZ 4x2 A/T NON RSE', price: '617.500.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.7 SRZ WITH GR PARTS AERO PACKAGE 4x2 A/T ONE TONE (Non Premium Col)', price: '632.600.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.7 SRZ WITH GR PARTS AERO PACKAGE 4x2 A/T ONE TONE (Premium Color)', price: '635.600.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.7 SRZ WITH GR PARTS AERO PACKAGE 4x2 A/T TWO TONE (Premium Color)', price: '637.700.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.7 SRZ GR SPORT 4x2 A/T NON RSE', price: '626.900.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.8 VRZ 4x2 A/T NON RSE', price: '644.600.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.8 VRZ TSS 4x2 A/T NON RSE', price: '659.300.000', transmission: 'Otomatis' },
      ];
      const fortuner4x2DocId = 'Fortuner 4x2';
      try {
        const docRef = doc(db, 'car_types', fortuner4x2DocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = fortuner4x2Types.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: fortuner4x2DocId, types: fortuner4x2Types });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Fortuner 4x2 data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Fortuner 4x2 data:', err);
      }
    };
    addFortuner4x2Data();
  }, []);

  useEffect(() => {
    const addFortuner4x4Data = async () => {
      const fortuner4x4Types = [
        { name: 'FORTUNER 2.8 VRZ 4x4 A/T', price: '752.700.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.8 VRZ 4x4 A/T GR-SPORT TSS TWO TONE (Premium Color)', price: '757.700.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.8 VRZ 4x4 A/T GR-SPORT TSS ONE TONE', price: '762.600.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.8 VRZ 4x4 A/T NON RSE', price: '747.000.000', transmission: 'Otomatis' },
        { name: 'FORTUNER 2.8 VRZ 4x4 A/T GR-SPORT TSS NON RSE', price: '777.000.000', transmission: 'Otomatis' },
      ];
      const fortuner4x4DocId = 'Fortuner 4x4';
      try {
        const docRef = doc(db, 'car_types', fortuner4x4DocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = fortuner4x4Types.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: fortuner4x4DocId, types: fortuner4x4Types });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Fortuner 4x4 data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Fortuner 4x4 data:', err);
      }
    };
    addFortuner4x4Data();
  }, []);

  useEffect(() => {
    const addGR86Data = async () => {
      const gr86Types = [
        { name: 'GR 86 2.4L A/T (Two Tone)', price: '1.038.200.000', transmission: 'Otomatis' },
        { name: 'GR 86 2.4L M/T', price: '1.051.600.000', transmission: 'Manual' },
        { name: 'GR 86 2.4L M/T (One Tone)', price: '1.051.600.000', transmission: 'Manual' },
        { name: 'GR 86 2.4L A/T (One Tone)', price: '1.038.200.000', transmission: 'Otomatis' },
      ];
      const gr86DocId = 'GR 86';
      try {
        const docRef = doc(db, 'car_types', gr86DocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = gr86Types.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: gr86DocId, types: gr86Types });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('GR 86 data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing GR 86 data:', err);
      }
    };
    addGR86Data();
  }, []);

  useEffect(() => {
    const addBz4xData = async () => {
      const bz4xTypes = [
        { name: 'Bz4X A/T (One Tone Color)', price: '1.213.100.000', transmission: 'Otomatis' },
        { name: 'Bz4X A/T (Two Tone Color)', price: '1.221.200.000', transmission: 'Otomatis' },
      ];
      const bz4xDocId = 'Bz4X';
      try {
        const docRef = doc(db, 'car_types', bz4xDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = bz4xTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: bz4xDocId, types: bz4xTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Bz4X data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Bz4X data:', err);
      }
    };
    addBz4xData();
  }, []);

  useEffect(() => {
    const addGRCorollaData = async () => {
      const grCorollaTypes = [
        { name: 'GR COROLLA M/T', price: '1.354.500.000', transmission: 'Manual' },
      ];
      const grCorollaDocId = 'GR Corolla';
      try {
        const docRef = doc(db, 'car_types', grCorollaDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = grCorollaTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: grCorollaDocId, types: grCorollaTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('GR Corolla data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing GR Corolla data:', err);
      }
    };
    addGRCorollaData();
  }, []);

  useEffect(() => {
    const addHilux4x4Data = async () => {
      const hilux4x4Types = [
        { name: 'HILUX DOUBLE CABIN 2.4 E (4x4) DSL M/T', price: '497.500.000', transmission: 'Manual' },
        { name: 'HILUX DOUBLE CABIN 2.4 E-RTS (4X4) DSL M/T', price: '506.000.000', transmission: 'Manual' },
        { name: 'HILUX DOUBLE CABIN 2.4 G (4x4) DSL M/T', price: '531.100.000', transmission: 'Manual' },
        { name: 'HILUX DOUBLE CABIN 2.4 V (4x4) DSL A/T', price: '582.500.000', transmission: 'Otomatis' },
      ];
      const hilux4x4DocId = 'Hilux 4x4';
      try {
        const docRef = doc(db, 'car_types', hilux4x4DocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = hilux4x4Types.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: hilux4x4DocId, types: hilux4x4Types });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Hilux 4x4 data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Hilux 4x4 data:', err);
      }
    };
    addHilux4x4Data();
  }, []);

  useEffect(() => {
    const addHilux4x2Data = async () => {
      const hilux4x2Types = [
        { name: 'HILUX SINGLE CABIN 2.0 M/T', price: '287.000.000', transmission: 'Manual' },
        { name: 'HILUX SINGLE CABIN 2.4 DSL M/T', price: '321.000.000', transmission: 'Manual' },
        { name: 'HILUX SINGLE CABIN 2.4 DSL 4x4 M/T', price: '424.000.000', transmission: 'Manual' },
      ];
      const hilux4x2DocId = 'Hilux 4x2';
      try {
        const docRef = doc(db, 'car_types', hilux4x2DocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = hilux4x2Types.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: hilux4x2DocId, types: hilux4x2Types });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Hilux 4x2 data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Hilux 4x2 data:', err);
      }
    };
    addHilux4x2Data();
  }, []);

  useEffect(() => {
    const addHiaceData = async () => {
      const hiaceTypes = [
        { name: 'HIACE COMMUTER M/T', price: '583.050.000', transmission: 'Manual' },
        { name: 'HIACE PREMIO 2.8 M/T', price: '678.900.000', transmission: 'Manual' },
      ];
      const hiaceDocId = 'Hiace';
      try {
        const docRef = doc(db, 'car_types', hiaceDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = hiaceTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: hiaceDocId, types: hiaceTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Hiace data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Hiace data:', err);
      }
    };
    addHiaceData();
  }, []);

  useEffect(() => {
    const addHiluxRanggaData = async () => {
      const hiluxRanggaTypes = [
        { name: 'HILUX RANGGA CAB-CHASSIS PU 2.0 STD M/T', price: '197.500.000', transmission: 'Manual' },
        { name: 'HILUX RANGGA CAB-CHASSIS MB 2.0 STD M/T', price: '197.500.000', transmission: 'Manual' },
        { name: 'HILUX RANGGA PICK UP 2.0 STD M/T', price: '202.500.000', transmission: 'Manual' },
        { name: 'HILUX RANGGA PICK UP 2.0 STD M/T 3WAY', price: '203.500.000', transmission: 'Manual' },
        { name: 'HILUX RANGGA PICK UP 2.0 HIGH M/T', price: '224.200.000', transmission: 'Manual' },
        { name: 'HILUX RANGGA CAB-CHASSIS PU 2.4 DSL STD M/T', price: '254.000.000', transmission: 'Manual' },
        { name: 'HILUX RANGGA CAB-CHASSIS MB 2.4 M/T', price: '248.100.000', transmission: 'Manual' },
        { name: 'HILUX RANGGA PICK UP 2.4 DSL STD M/T', price: '258.300.000', transmission: 'Manual' },
        { name: 'HILUX RANGGA PICK UP 2.4 DSL STD M/T 3WAY', price: '259.800.000', transmission: 'Manual' },
        { name: 'HILUX RANGGA PICK UP 2.4 DSL HIGH M/T', price: '292.600.000', transmission: 'Manual' },
        { name: 'HILUX RANGGA CAB-CHASSIS PU 2.4 DSL HIGH A/T', price: '308.800.000', transmission: 'Otomatis' },
        { name: 'HILUX RANGGA CAB-CHASSIS MB 2.4 HIGH A/T', price: '308.800.000', transmission: 'Otomatis' },
        { name: 'HILUX RANGGA PICK UP 2.4 DSL HIGH A/T', price: '313.700.000', transmission: 'Otomatis' },
        { name: 'HILUX RANGGA DRY BOX 2.0 STD M/T (Rear Doors)', price: '233.700.000', transmission: 'Manual' },
        { name: 'HILUX RANGGA DRY BOX 2.0 STD M/T (Rear+Side)', price: '233.200.000', transmission: 'Manual' },
        { name: 'HILUX RANGGA CAB-CHASSIS REFRIGERATOR 2.0 STD M/T', price: '318.500.000', transmission: 'Manual' },
        { name: 'HILUX RANGGA DRY BOX 2.4 DSL STD M/T (Rear Doors)', price: '287.200.000', transmission: 'Manual' },
        { name: 'HILUX RANGGA DRY BOX 2.4 DSL STD M/T (Rear+Side)', price: '289.700.000', transmission: 'Manual' },
        { name: 'HILUX RANGGA CAB-CHASSIS REFRIGERATOR 2.4 DSL STD M/T', price: '375.000.000', transmission: 'Manual' },
      ];
      const hiluxRanggaDocId = 'Hilux Rangga';
      try {
        const docRef = doc(db, 'car_types', hiluxRanggaDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = hiluxRanggaTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: hiluxRanggaDocId, types: hiluxRanggaTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Hilux Rangga data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Hilux Rangga data:', err);
      }
    };
    addHiluxRanggaData();
  }, []);

  useEffect(() => {
    const addLandcruiserData = async () => {
      const landcruiserTypes = [
        { name: 'LAND CRUISER 300 VX-R 4x4 A/T', price: '2.612.800.000', transmission: 'Otomatis' },
        { name: 'LAND CRUISER 300 VX-R 4x4 A/T (Premium Color)', price: '2.607.500.000', transmission: 'Otomatis' },
        { name: 'LAND CRUISER 300 GR-S 4x4 A/T', price: '2.694.400.000', transmission: 'Otomatis' },
        { name: 'LAND CRUISER 300 GR-S 4x4 A/T (Premium Color)', price: '2.689.300.000', transmission: 'Otomatis' },
      ];
      const landcruiserDocId = 'Landcruiser';
      try {
        const docRef = doc(db, 'car_types', landcruiserDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = landcruiserTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: landcruiserDocId, types: landcruiserTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Landcruiser data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Landcruiser data:', err);
      }
    };
    addLandcruiserData();
  }, []);

  useEffect(() => {
    const addRaizeGRSportData = async () => {
      const raizeGRSportTypes = [
        { name: 'RAIZE 1.0T GR SPORT CVT ONE TONE', price: '304.900.000', transmission: 'Otomatis' },
        { name: 'RAIZE 1.0T GR SPORT CVT TWO TONE', price: '307.400.000', transmission: 'Otomatis' },
        { name: 'RAIZE 1.0T GR SPORT CVT TSS ONE TONE', price: '326.900.000', transmission: 'Otomatis' },
        { name: 'RAIZE 1.0T GR SPORT CVT TSS TWO TONE', price: '329.400.000', transmission: 'Otomatis' },
      ];
      const raizeGRSportDocId = 'Raize GR Sport';
      try {
        const docRef = doc(db, 'car_types', raizeGRSportDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = raizeGRSportTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: raizeGRSportDocId, types: raizeGRSportTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Raize GR Sport data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Raize GR Sport data:', err);
      }
    };
    addRaizeGRSportData();
  }, []);

  useEffect(() => {
    const addRaizeData = async () => {
      const raizeTypes = [
        { name: 'RAIZE 1.0T G M/T ONE TONE', price: '275.900.000', transmission: 'Manual' },
        { name: 'RAIZE 1.0T G CVT ONE TONE', price: '290.700.000', transmission: 'Otomatis' },
        { name: 'RAIZE 1.0T G CVT TWO TONE', price: '293.400.000', transmission: 'Otomatis' },
        { name: 'RAIZE 1.2 G M/T ONE TONE', price: '256.200.000', transmission: 'Manual' },
        { name: 'RAIZE 1.2 G CVT ONE TONE', price: '271.300.000', transmission: 'Otomatis' },
      ];
      const raizeDocId = 'Raize';
      try {
        const docRef = doc(db, 'car_types', raizeDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = raizeTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: raizeDocId, types: raizeTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Raize data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Raize data:', err);
      }
    };
    addRaizeData();
  }, []);

  useEffect(() => {
    const addVelfireData = async () => {
      const velfireTypes = [
        { name: 'NEW VELLFIRE 2.5 VIP HYBRID CVT MODELISTA', price: '1.931.100.000', transmission: 'Otomatis' },
        { name: 'NEW VELLFIRE 2.5 VIP HYBRID CVT (Premium Color) MODELISTA', price: '1.934.600.000', transmission: 'Otomatis' },
      ];
      const velfireDocId = 'Velfire';
      try {
        const docRef = doc(db, 'car_types', velfireDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = velfireTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: velfireDocId, types: velfireTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Velfire data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Velfire data:', err);
      }
    };
    addVelfireData();
  }, []);

  useEffect(() => {
    const addVelozData = async () => {
      const velozTypes = [
        { name: 'VELOZ 1.5 M/T', price: '317.200.000', transmission: 'Manual' },
        { name: 'VELOZ 1.5 M/T (Premium Color)', price: '318.700.000', transmission: 'Manual' },
        { name: 'VELOZ 1.5 CVT', price: '332.600.000', transmission: 'Otomatis' },
        { name: 'VELOZ 1.5 CVT (Premium Color)', price: '334.100.000', transmission: 'Otomatis' },
        { name: 'VELOZ 1.5 Q CVT', price: '341.400.000', transmission: 'Otomatis' },
        { name: 'VELOZ 1.5 Q CVT (Premium Color)', price: '343.000.000', transmission: 'Otomatis' },
        { name: 'VELOZ 1.5 Q CVT TSS', price: '363.500.000', transmission: 'Otomatis' },
        { name: 'VELOZ 1.5 Q CVT TSS (Premium Color)', price: '365.100.000', transmission: 'Otomatis' },
        { name: 'VELOZ 1.5 Q CVT Fleet Non-Telematic', price: '338.200.000', transmission: 'Otomatis' },
        { name: 'VELOZ 1.5 Q CVT (Premium Color) Fleet Non-Telematic', price: '339.800.000', transmission: 'Otomatis' },
      ];
      const velozDocId = 'Veloz';
      try {
        const docRef = doc(db, 'car_types', velozDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = velozTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: velozDocId, types: velozTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Veloz data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Veloz data:', err);
      }
    };
    addVelozData();
  }, []);

  useEffect(() => {
    const addSupraData = async () => {
      const supraTypes = [
        { name: 'TOYOTA SUPRA 3.0L A/T', price: '2.256.900.000', transmission: 'Otomatis' },
      ];
      const supraDocId = 'Supra';
      try {
        const docRef = doc(db, 'car_types', supraDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = supraTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: supraDocId, types: supraTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Supra data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Supra data:', err);
      }
    };
    addSupraData();
  }, []);

  useEffect(() => {
    const addViosData = async () => {
      const viosTypes = [
        { name: 'All New Vios 1.5 G CVT', price: '383.900.000', transmission: 'Otomatis' },
        { name: 'All New Vios 1.5 G CVT (Premium Color)', price: '385.500.000', transmission: 'Otomatis' },
        { name: 'All New Vios 1.5 G TSS CVT', price: '397.000.000', transmission: 'Otomatis' },
        { name: 'All New Vios 1.5 G TSS CVT (Premium Color)', price: '398.600.000', transmission: 'Otomatis' },
      ];
      const viosDocId = 'Vios';
      try {
        const docRef = doc(db, 'car_types', viosDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = viosTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: viosDocId, types: viosTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Vios data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Vios data:', err);
      }
    };
    addViosData();
  }, []);

  useEffect(() => {
    const addVoxyData = async () => {
      const voxyTypes = [
        { name: 'VOXY 2.0 A/T', price: '632.300.000', transmission: 'Otomatis' },
        { name: 'VOXY 2.0 A/T (Premium Color)', price: '635.400.000', transmission: 'Otomatis' },
      ];
      const voxyDocId = 'Voxy';
      try {
        const docRef = doc(db, 'car_types', voxyDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = voxyTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: voxyDocId, types: voxyTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Voxy data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Voxy data:', err);
      }
    };
    addVoxyData();
  }, []);

  useEffect(() => {
    const addYarisData = async () => {
      const yarisTypes = [
        { name: 'YARIS 1.5 S MT GR SPORT 3 Airbags Monotone', price: '337.000.000', transmission: 'Manual' },
        { name: 'YARIS 1.5 S MT GR SPORT 3 Airbags Bitone', price: '341.100.000', transmission: 'Manual' },
        { name: 'YARIS 1.5 S CVT GR SPORT 3 Airbags Monotone', price: '349.300.000', transmission: 'Otomatis' },
        { name: 'YARIS 1.5 S CVT GR SPORT 3 Airbags Bitone', price: '353.400.000', transmission: 'Otomatis' },
        { name: 'YARIS 1.5 S CVT GR SPORT 7 Airbags Monotone', price: '356.200.000', transmission: 'Otomatis' },
        { name: 'YARIS 1.5 S CVT GR SPORT 7 Airbags Bitone', price: '360.200.000', transmission: 'Otomatis' },
      ];
      const yarisDocId = 'Yaris';
      try {
        const docRef = doc(db, 'car_types', yarisDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = yarisTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: yarisDocId, types: yarisTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Yaris data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Yaris data:', err);
      }
    };
    addYarisData();
  }, []);

  useEffect(() => {
    const addYarisCrossData = async () => {
      const yarisCrossTypes = [
        { name: 'YARIS CROSS 1.5 G M/T', price: '368.100.000', transmission: 'Manual' },
        { name: 'YARIS CROSS 1.5 G CVT', price: '381.400.000', transmission: 'Otomatis' },
        { name: 'YARIS CROSS 1.5 S CVT TSS', price: '425.000.000', transmission: 'Otomatis' },
        { name: 'YARIS CROSS 1.5 S CVT TSS (Premium Color)', price: '427.500.000', transmission: 'Otomatis' },
        { name: 'YARIS CROSS 1.5 S GR CVT TSS', price: '434.400.000', transmission: 'Otomatis' },
        { name: 'YARIS CROSS 1.5 S GR CVT TSS (Premium Color)', price: '437.400.000', transmission: 'Otomatis' },
      ];
      const yarisCrossDocId = 'Yaris Cross';
      try {
        const docRef = doc(db, 'car_types', yarisCrossDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = yarisCrossTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: yarisCrossDocId, types: yarisCrossTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Yaris Cross data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Yaris Cross data:', err);
      }
    };
    addYarisCrossData();
  }, []);

  useEffect(() => {
    const addYarisCrossHybridData = async () => {
      const yarisCrossHybridTypes = [
        { name: 'YARIS CROSS 1.5 S HV CVT TSS', price: '446.100.000', transmission: 'Otomatis' },
        { name: 'YARIS CROSS 1.5 S HV CVT TSS (Premium Color)', price: '448.600.000', transmission: 'Otomatis' },
        { name: 'YARIS CROSS 1.5 S HV CVT TSS 2 TONE', price: '450.200.000', transmission: 'Otomatis' },
        { name: 'YARIS CROSS 1.5 S HV CVT TSS 2 TONE (Premium Color)', price: '451.100.000', transmission: 'Otomatis' },
        { name: 'YARIS CROSS 1.5 S GR HV CVT TSS', price: '456.600.000', transmission: 'Otomatis' },
        { name: 'YARIS CROSS 1.5 S GR HV CVT TSS (Premium Color)', price: '458.100.000', transmission: 'Otomatis' },
        { name: 'YARIS CROSS 1.5 S GR HV CVT TSS 2 TONE', price: '459.700.000', transmission: 'Otomatis' },
        { name: 'YARIS CROSS 1.5 S GR HV CVT TSS 2 TONE (Premium Color)', price: '460.600.000', transmission: 'Otomatis' },
      ];
      const yarisCrossHybridDocId = 'Yaris Cross Hybrid';
      try {
        const docRef = doc(db, 'car_types', yarisCrossHybridDocId);
        const docSnap = await getDoc(docRef);
        let docUpdated = false;
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const typesToAdd = yarisCrossHybridTypes.filter(newType => !existingData.types.some(existing => existing.name === newType.name));
          if (typesToAdd.length > 0) {
            await updateDoc(docRef, { types: [...existingData.types, ...typesToAdd] });
            docUpdated = true;
          }
        } else {
          await setDoc(docRef, { modelName: yarisCrossHybridDocId, types: yarisCrossHybridTypes });
          docUpdated = true;
        }
        if (docUpdated) {
          console.log('Yaris Cross Hybrid data synced successfully.');
          fetchVarieties();
        }
      } catch (err) {
        console.error('Error syncing Yaris Cross Hybrid data:', err);
      }
    };
    addYarisCrossHybridData();
  }, []);



  const handleAddType = () => {
    setTypes([...types, { name: '', price: '', transmission: 'Otomatis' }]);
  };

  const handleRemoveType = (index) => {
    const newTypes = types.filter((_, i) => i !== index);
    setTypes(newTypes);
  };

  const handleTypeChange = (index, field, value) => {
    const newTypes = [...types];
    if (field === 'price') {
      newTypes[index][field] = formatNumber(value);
    } else {
      newTypes[index][field] = value;
    }
    setTypes(newTypes);
  };

  const resetForm = () => {
    setDocumentId('');
    setModelName('');
    setTypes([{ name: '', price: '', transmission: 'Otomatis' }]);
    setIsEditing(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentId || !modelName || types.some(t => !t.name || !t.price)) {
      setError('Harap isi semua kolom yang diperlukan, termasuk ID Dokumen, Nama Model, dan semua detail tipe.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const docRef = doc(db, 'car_types', documentId);
      const formattedTypes = types.map(t => ({ ...t, price: formatNumber(t.price) }));
      await setDoc(docRef, { modelName, types: formattedTypes });
      resetForm();
      fetchVarieties(); // Refresh the list
    } catch (err) {
      setError('Gagal menyimpan data. Pastikan ID Dokumen unik.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (variety) => {
    setIsEditing(true);
    setDocumentId(variety.id);
    setModelName(variety.modelName);
    const formattedTypes = variety.types.map(t => ({ ...t, price: formatNumber(t.price) }));
    setTypes(formattedTypes);
    setShouldScroll(true);
  };


  useEffect(() => {
    if (shouldScroll) {
      editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShouldScroll(false); // Reset the trigger
    }
  }, [shouldScroll]);

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus varietas ini?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'car_types', id));
        fetchVarieties(); // Refresh the list
      } catch (err) {
        setError('Gagal menghapus data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full p-4 md:p-6" style={{ backgroundColor: COLORS.background }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: COLORS.primary }}>Manajemen Varietas Mobil</h1>

        {/* Form for Add/Edit */}
                <form ref={editFormRef} onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border mb-8" style={{ borderColor: COLORS.border }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.secondary }}>{isEditing ? 'Edit Varietas' : 'Tambah Varietas Baru'}</h2>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Dokumen</label>
              <input 
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                className="w-full p-2 border rounded-md shadow-sm"
                placeholder="cth: innova-zenix-hybrid"
                disabled={isEditing}
                style={{ borderColor: COLORS.border, backgroundColor: isEditing ? '#E5E7EB' : 'white' }}
              />
              {isEditing && <p className="text-xs text-gray-500 mt-1">ID tidak dapat diubah.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Model</label>
              <input 
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full p-2 border rounded-md shadow-sm"
                placeholder="Cth: Innova Zenix Hybrid"
                style={{ borderColor: COLORS.border }}
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-3 mt-6" style={{ color: COLORS.secondary }}>Tipe Variasi</h3>
          <div className="space-y-4">
            {types.map((type, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 border rounded-md" style={{ borderColor: COLORS.border, backgroundColor: index % 2 === 0 ? 'white' : COLORS.background }}>
                <div className="md:col-span-5">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nama Tipe</label>
                  <input 
                    type="text"
                    value={type.name}
                    onChange={(e) => handleTypeChange(index, 'name', e.target.value)}
                    className="w-full p-2 border rounded-md shadow-sm text-sm"
                    placeholder="Cth: 2.0 G CVT"
                    style={{ borderColor: COLORS.border }}
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Harga</label>
                  <input 
                    type="text"
                    value={type.price}
                    onChange={(e) => handleTypeChange(index, 'price', e.target.value)}
                    className="w-full p-2 border rounded-md shadow-sm text-sm"
                    placeholder="Cth: 473.400.000"
                    style={{ borderColor: COLORS.border }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Transmisi</label>
                  <select 
                    value={type.transmission}
                    onChange={(e) => handleTypeChange(index, 'transmission', e.target.value)}
                    className="w-full p-2 border rounded-md shadow-sm bg-white text-sm"
                    style={{ borderColor: COLORS.border }}
                  >
                    <option value="Otomatis">Otomatis</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div className="md:col-span-1 flex items-end">
                  <button type="button" onClick={() => handleRemoveType(index)} className="w-full p-2 rounded-md flex items-center justify-center transition-colors hover:bg-red-200" style={{ backgroundColor: COLORS.primary_light, color: COLORS.primary }} title="Hapus Tipe">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddType} className="mt-4 text-sm font-semibold flex items-center gap-2 hover:text-red-700" style={{ color: COLORS.primary }}>
            <FiPlus /> Tambah Tipe
          </button>

          <div className="flex items-center space-x-4 mt-6 pt-4 border-t" style={{ borderColor: COLORS.border }}>
              <button type="submit" className="px-5 py-2 rounded-md shadow-sm font-semibold text-white flex items-center gap-2 transition-colors hover:bg-green-600" style={{ backgroundColor: COLORS.success }} disabled={loading}>
                <FiSave size={16} />
                {loading ? 'Menyimpan...' : (isEditing ? 'Perbarui' : 'Simpan')}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="px-5 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors hover:bg-gray-300" style={{ color: COLORS.secondary, backgroundColor: COLORS.border }}>
                  <FiXCircle size={16} /> Batal
                </button>
              )}
          </div>
        </form>

        {/* List of Existing Varieties */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border" style={{ borderColor: COLORS.border }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: COLORS.secondary }}>Daftar Varietas Tersimpan</h2>
            <input
              type="text"
              placeholder="Cari model mobil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-1/3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              style={{ borderColor: COLORS.border }}
            />
          </div>
          {loading && !carVarieties.length && <p>Memuat...</p>}
          <div className="space-y-4">
            {carVarieties
              .filter(variety => 
                variety.modelName.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(variety => (
              <div key={variety.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-4" style={{ borderColor: COLORS.border, backgroundColor: COLORS.background }}>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate" style={{ color: '#1F2937' }}>{variety.modelName}</p>
                  <p className="text-xs text-gray-500 break-all">ID: {variety.id}</p>
                </div>
                <div className="flex space-x-2 self-end md:self-center">
                  <button onClick={() => handleEdit(variety)} className="p-2 rounded-full transition-colors hover:bg-amber-200" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }} title="Edit">
                    <FiEdit size={16} />
                  </button>
                  <button onClick={() => handleDelete(variety.id)} className="p-2 rounded-full transition-colors hover:bg-red-200" style={{ backgroundColor: COLORS.primary_light, color: COLORS.primary }} title="Hapus">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
