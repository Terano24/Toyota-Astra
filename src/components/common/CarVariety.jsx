import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const formatPrice = (price) => {
  if (typeof price === 'number') {
    price = String(price);
  }
  if (typeof price !== 'string') {
    return 'N/A';
  }
  const numberString = price.replace(/[^\d]/g, '');
  return `Rp. ${new Intl.NumberFormat('id-ID').format(Number(numberString))}`;
};





export default function CarVariety({ isOpen, onClose, modelName, documentId, onSelectType }) {
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('Otomatis');
  const [selectedType, setSelectedType] = useState(null);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && (modelName || documentId)) {
      const fetchCarTypes = async () => {
        setLoading(true);
        setError('');
        setCarData(null);
        try {
          let data = null;
          if (documentId) {
            const docRef = doc(db, 'car_types', documentId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              data = docSnap.data();
            }
          } else if (modelName) {
            const q = query(collection(db, 'car_types'), where('modelName', '==', modelName));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              data = querySnapshot.docs[0].data();
            }
          }

          if (data) {
            setCarData(data);
          } else {
            setError('Tipe mobil tidak ditemukan.');
          }
        } catch (err) {
          setError('Gagal memuat data tipe mobil.');
          console.error(err);
        }
        setLoading(false);
      };
      fetchCarTypes();
    }
  }, [isOpen, modelName, documentId]);

  // Update selected type when transmission or data changes
  useEffect(() => {
    if (carData && carData.types && carData.types.length > 0) {
      // Try to find a type with the selected transmission
      let defaultType = carData.types.find(t => t.transmission === selectedTransmission);
      
      // If no type found for selected transmission, get the first available type
      if (!defaultType) {
        defaultType = carData.types[0];
      }
      
      setSelectedType(defaultType);
      
      // Note: Removed automatic onSelectType call to prevent modal from closing immediately
      // The initial car type loading is now handled by useInitialCarVariety hook in parent components
    }
  }, [carData, selectedTransmission]);

  const handleSelect = () => {
    if (selectedType) {
      onSelectType(selectedType);
      onClose();
    }
  };

  if (!isOpen) return null;

    const filteredTypes = carData?.types.filter(t => {
    if (selectedTransmission === 'Otomatis') {
      // Show 'Otomatis' and types with no specified transmission (falsy values like '', null, undefined)
      return t.transmission === 'Otomatis' || !t.transmission;
    }
    // For 'Manual', only show 'Manual'
    return t.transmission === selectedTransmission;
  }) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col relative animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">PILIH TIPE</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-3xl font-bold">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {loading && <div className="text-center">Memuat...</div>}
          {error && <div className="text-center text-red-500">{error}</div>}
          {carData && (
            <>
              {/* Transmission Filter */}
              <div>
                <h3 className="font-semibold text-gray-600 mb-2">Pilih Transmisi</h3>
                <div className="flex border border-gray-300 rounded-md p-1 w-min">
                  <button 
                    onClick={() => setSelectedTransmission('Otomatis')}
                    className={`px-6 py-2 text-sm font-semibold rounded ${selectedTransmission === 'Otomatis' ? 'bg-gray-800 text-white' : 'text-gray-600'}`}>
                    OTOMATIS
                  </button>
                  <button 
                    onClick={() => setSelectedTransmission('Manual')}
                    className={`px-6 py-2 text-sm font-semibold rounded ${selectedTransmission === 'Manual' ? 'bg-gray-800 text-white' : 'text-gray-600'}`}>
                    MANUAL
                  </button>
                </div>
              </div>

              {/* Types List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {filteredTypes.length > 0 ? filteredTypes.map((type, index) => (
                  <div key={index} onClick={() => setSelectedType(type)} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="carType" 
                      checked={selectedType?.name === type.name}
                      onChange={() => setSelectedType(type)}
                      className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <div className="ml-4">
                      <p className="font-semibold text-gray-800">{type.name}</p>
                                            <p className="text-red-600 font-bold">{formatPrice(type.price)}</p>
                    </div>
                  </div>
                )) : (
                  <p className='text-gray-500'>Tidak ada tipe dengan transmisi ini.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col items-center">
           <div className="text-center text-sm text-gray-600 mb-4">
            <p>Bingung memilih tipe yang sesuai?</p>
            <button type="button" className="font-bold text-red-600 hover:underline bg-transparent border-none p-0 cursor-pointer">HUBUNGI ACCOUNT EXECUTIVE KAMI</button>
          </div>
          <button 
            onClick={handleSelect}
            disabled={!selectedType}
            className="w-full max-w-xs py-3 px-4 rounded-md font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all">
            PILIH
          </button>
        </div>
      </div>
    </div>
  );
}
