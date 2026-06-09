import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useInitialCarVariety } from '../../hooks/useInitialCarVariety';
import LandingNavbar from '../common/LandingNavbar';
import InquiryModal from '../common/InquiryModal';
import CarVariety from '../common/CarVariety';
import LoadingSpinner from '../common/LoadingSpinner';
import SEOHead from '../common/SEOHead';
import EnhancedVarietyButton from '../common/EnhancedVarietyButton';

const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Ranga%2FRanggaHero.jpg?alt=media&token=d1b7d486-8f29-4a1c-a78f-5b45880248db';

const colorVariants = [
  {
    name: 'Metallic Gray',
    image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Ranga%2FRanggaMetallicGray.png?alt=media&token=2aa6a60e-81e5-4bb1-a692-b8c6f82f3580',
  },
  {
    name: 'White',
    image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Ranga%2FRanggaWhite.png?alt=media&token=139bfb09-f43e-404b-9b6a-9e966087fea5',
  },
];

const exteriorImages = [
  { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Ranga%2FRaggaEx1.jpg?alt=media&token=1e93defa-f24d-43f7-b14c-ecf9276cc998', title: 'Tangguh di Segala Medan', description: 'Desain eksterior yang kokoh dan modern, siap menghadapi tantangan perjalanan bisnis Anda.' },
  { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Ranga%2FRanggaEx2.jpg?alt=media&token=b212b86e-aed6-467b-9751-a30eaad8645e', title: 'Kargo Fleksibel', description: 'Bak kargo luas yang dapat dimodifikasi sesuai kebutuhan, memberikan fleksibilitas maksimal.' },
  { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Ranga%2FRanggaEx3.jpg?alt=media&token=007c50a7-20b3-44f9-998e-8037e2984388', title: 'Grille Depan Gagah', description: 'Tampilan depan yang gagah dengan grille khas Toyota, memberikan kesan kuat dan profesional.' },
];

const interiorImages = [
  { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Ranga%2FRanggaIn1.jpg?alt=media&token=65c08911-2b53-48b3-86f5-0cb4c1a9cdd7', title: 'Kabin Fungsional', description: 'Interior dirancang untuk fungsionalitas dan kenyamanan pengemudi selama bekerja.' },
  { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Ranga%2FRanggaIn2.jpg?alt=media&token=9c2be420-9d9a-42a9-91e0-93c0da1b1697', title: 'Dashboard Modern', description: 'Dashboard dengan desain modern yang dilengkapi fitur-fitur esensial untuk menunjang produktivitas.' },
  { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Ranga%2FRanggaIn3.jpg?alt=media&token=2b653c72-c8a0-49de-ac2f-4848295cc436', title: 'Ruang Penyimpanan Praktis', description: 'Berbagai kompartemen penyimpanan praktis untuk menjaga kabin tetap rapi dan terorganisir.' },
];

const CAR_NAME = 'Hilux Rangga';
const PAGE_TITLE = 'TOYOTA HILUX RANGGA 2025';
const PAGE_DESCRIPTION = 'Solusi niaga serbaguna yang tangguh, efisien, dan dapat diandalkan untuk segala jenis usaha Anda.';

export default function HiluxRanggaDetail() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [products, setProducts] = useState([]);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVarietyModalOpen, setIsVarietyModalOpen] = useState(false);
  const [selectedCarType, setSelectedCarType] = useState(null);
  const [price, setPrice] = useState(null);
  const [selectedColor, setSelectedColor] = useState(colorVariants[0]);
  const [swipeHandlers, setSwipeHandlers] = useState(null);
  const inquiryFormRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = HERO_IMAGE;
    img.onload = () => setHeroImageLoaded(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProductsAndPrice = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);

      const carProduct = productsData.find(p => p.name === CAR_NAME);
      if (carProduct && carProduct.price && !isNaN(Number(carProduct.price))) {
        const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(carProduct.price));
        setPrice(formattedPrice);
      }
    };

    fetchProductsAndPrice();
  }, []);

  

  // Load initial car variety to prevent RpNaN display

  useInitialCarVariety(CAR_NAME, setSelectedCarType);

  // Add one-time script to create Hilux Rangga car varieties in Firestore
  useEffect(() => {
    const addHiluxRanggaVarieties = async () => {
      try {
        const { doc, getDoc, setDoc, updateDoc } = await import('firebase/firestore');
        const documentId = 'Hilux Rangga';
        
        const carTypes = [
          {
            name: 'HILUX RANGGA CAB-CHASSIS MB 2.4 HIGH A/T',
            price: 385000000,
            transmission: 'Automatic'
          },
          {
            name: 'HILUX RANGGA CAB-CHASSIS MB 2.4 HIGH M/T',
            price: 375000000,
            transmission: 'Manual'
          }
        ];

        const docRef = doc(db, 'car_types', documentId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          const existingTypes = existingData.types || [];
          
          // Filter out duplicates
          const newTypes = carTypes.filter(newType => 
            !existingTypes.some(existing => existing.name === newType.name)
          );
          
          if (newTypes.length > 0) {
            await updateDoc(docRef, {
              types: [...existingTypes, ...newTypes],
              updatedAt: new Date()
            });
            console.log(`✅ Added ${newTypes.length} new varieties to ${documentId}`);
          }
        } else {
          await setDoc(docRef, {
            modelName: documentId,
            types: carTypes,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log(`✅ Created new car varieties document for ${documentId}`);
        }
      } catch (error) {
        console.error('❌ Error adding Hilux Rangga varieties:', error);
      }
    };

    addHiluxRanggaVarieties();
  }, []); // Empty dependency array - runs once on mount

  

  const handleSelectCarType = (type) => {
    // Ensure price is a number for calculations/formatting
    const priceNumber = parseInt(String(type.price).replace(/[^0-9]/g, ''), 10);
    setSelectedCarType({ ...type, price: priceNumber });
    setIsVarietyModalOpen(false); // Close modal on selection
  };

  const handleInquiryClick = () => {
    if (inquiryFormRef.current) {
      inquiryFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const carModels = products.map(p => p.name);

  return (
    <div className="bg-white font-montserrat overflow-x-hidden swipe-container" {...(swipeHandlers || {})}>
      <SEOHead 
        carModel="hilux-rangga"
        title="Toyota Hilux Rangga 2025 - Auto2000 Way Halim Bandar Lampung | Pickup Chassis"
        description="Toyota Hilux Rangga 2025 pickup chassis untuk modifikasi di Auto2000 Way Halim Bandar Lampung. Kendaraan komersial fleksibel dengan daya tahan tinggi."
        keywords="toyota hilux rangga, hilux rangga 2025, pickup chassis, kendaraan komersial, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/hilux-rangga"
      />
      {!heroImageLoaded && <LoadingSpinner />}
      <div style={{ visibility: heroImageLoaded ? 'visible' : 'hidden' }}>
        <LandingNavbar 
          isScrolled={isScrolled} 
          products={products} 
          onInquiryClick={() => setIsModalOpen(true)}
          onSwipeHandlersReady={setSwipeHandlers}
        />
        <InquiryModal open={isModalOpen} onClose={() => setIsModalOpen(false)} models={carModels} carInterestPrefill={selectedCarType ? `${CAR_NAME} - ${selectedCarType.name}` : CAR_NAME} />

        <section className="relative w-full">
          <img src={HERO_IMAGE} alt={PAGE_TITLE} className="w-full h-auto" />
        </section>

        <section className="py-12 px-4 md:px-8 lg:px-16">
          <h1 className="text-3xl md:text-4xl font-normal text-center text-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>{PAGE_TITLE}</h1>
          <p className="text-base md:text-lg text-gray-500 text-center mt-4 max-w-4xl mx-auto">
            {PAGE_DESCRIPTION}
          </p>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-normal text-center text-black mb-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>PILIHAN WARNA & TIPE VARIAN</h2>
            <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start justify-center">
              <div className="w-full md:w-1/3 flex flex-col items-center md:items-start">
                <ul className="w-full max-w-sm">
                  {colorVariants.map((color) => (
                    <li key={color.name} onClick={() => setSelectedColor(color)} className={`flex items-center gap-4 p-3 mb-2 rounded-lg cursor-pointer transition-all duration-300 ${selectedColor.name === color.name ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      <img src={color.image} alt={color.name} className="w-16 h-12 object-cover rounded-md" />
                      <span className={`font-semibold text-base ${selectedColor.name === color.name ? 'text-blue-800' : 'text-gray-800'}`}>{color.name}</span>
                      {selectedColor.name === color.name && (
                        <svg className="w-6 h-6 text-blue-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full md:w-2/3 flex-grow flex flex-col items-center">
                <motion.img key={selectedColor.image} src={selectedColor.image} alt={selectedColor.name} className="w-full max-w-2xl h-auto" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} />
                <div className="mt-8 w-full max-w-2xl text-center flex flex-col items-center">
                  <EnhancedVarietyButton 
                                selectedCarType={selectedCarType}
                                onClick={() => setIsVarietyModalOpen(true)}
                            />
                  <p className="text-4xl font-bold text-red-600 mt-4">
                      {selectedCarType
                                    ? (selectedCarType.price && !isNaN(selectedCarType.price) ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedCarType.price) : 'Harga tidak tersedia')
                                    : (price ? `Mulai dari ${price}` : 'Harga tidak tersedia')
                                }
                  </p>
                  <button
                      onClick={handleInquiryClick}
                      className="mt-6 bg-red-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-red-700 transition-all duration-300 shadow-lg">
                      Dapatkan Penawaran
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <CarVariety
          isOpen={isVarietyModalOpen}
          onClose={() => setIsVarietyModalOpen(false)}
          documentId={CAR_NAME}
          onSelectType={handleSelectCarType}
        />

        <section className="py-12 px-4">
          <h2 className="text-3xl font-bold text-center text-black mb-10">Eksterior</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {exteriorImages.map(img => (
              <div key={img.id} className="text-center">
                <img src={img.src} alt={img.title} className="w-full h-auto object-cover rounded-lg shadow-md" />
                <h3 className="text-xl font-semibold mt-4">{img.title}</h3>
                <p className="text-gray-500 mt-2">{img.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 px-4 bg-gray-50">
          <h2 className="text-3xl font-bold text-center text-black mb-10">Interior</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {interiorImages.map(img => (
              <div key={img.id} className="text-center">
                <img src={img.src} alt={img.title} className="w-full h-auto object-cover rounded-lg shadow-md" />
                <h3 className="text-xl font-semibold mt-4">{img.title}</h3>
                <p className="text-gray-500 mt-2">{img.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div id="inquiry-form" ref={inquiryFormRef}>
          <InquiryModal asModal={false} models={carModels} carInterestPrefill={selectedCarType ? `${CAR_NAME} - ${selectedCarType.name}` : CAR_NAME} />
        </div>
      </div>
    </div>
  );
}
