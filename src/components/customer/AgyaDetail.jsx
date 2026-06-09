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

// Assets
const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Agya%2FHero-agya.jpg?alt=media&token=1c0745cf-89ab-4ef5-9dde-1a529806b8f2';

const colorVariants = [
    { name: 'Red', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Agya%2FRed-Agya.png?alt=media&token=46eba24d-8204-49bf-9763-2f8e57ea7b3d' },
    { name: 'Gray', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Agya%2FGray-Agya.png?alt=media&token=158134bb-027d-44c1-82ee-eccb6359daef' },
    { name: 'White', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Agya%2FWhite-agya.png?alt=media&token=d28a01bb-0916-4355-97d1-02198fddcb81' },
    { name: 'Silver', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Agya%2FSilver-agya.png?alt=media&token=88ca32c0-016d-4371-8c19-1667aee9a616' },
    { name: 'Yellow', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Agya%2FYellow-Agya.png?alt=media&token=030ffadc-90c4-4a32-a734-fc4a280d6049' },
    { name: 'Black', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Agya%2FBlack-Agya.png?alt=media&token=e858def5-119c-4b97-ac1e-4219ad7dec3e' },
];

const exteriorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Agya%2FEx-Agya1.jpg?alt=media&token=d612968e-da58-452d-9125-2847b8759894', title: 'Tampilan Depan Sporty', description: 'Desain depan yang agresif memberikan Agya tampilan yang modern dan berani.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Agya%2FEx-Agya2.jpg?alt=media&token=26214151-248c-48c0-8380-4927d3c01c71', title: 'Velg Alloy Dinamis', description: 'Velg alloy 15 inci dengan desain dual-tone yang stylish dan sporty.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Agya%2FEx-Agya3.jpg?alt=media&token=5439589a-3677-48f8-800d-52a444857b2e', title: 'Lampu Belakang Modern', description: 'Lampu belakang LED dengan desain yang tajam dan pencahayaan optimal.' },
];

const interiorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Agya%2FIn-Agya1.jpg?alt=media&token=963b6521-4d1a-4f51-872f-524f0c60f252', title: 'Dashboard Modern', description: 'Dashboard dengan desain ergonomis dan panel instrumen yang mudah dijangkau.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Agya%2FIn-Agya2.jpg?alt=media&token=78d91b8f-3d60-47e0-9113-7d52a2656d0d', title: 'Kabin Lega', description: 'Ruang kabin yang luas memberikan kenyamanan ekstra bagi penumpang.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Agya%2FIn-Agya3.jpg?alt=media&token=35552945-3142-4217-a068-12c55b6c3104', title: 'Sistem Hiburan Canggih', description: 'Head unit layar sentuh dengan konektivitas smartphone untuk hiburan tanpa batas.' },
];

const CAR_NAME = 'Agya';
const PAGE_TITLE = 'TOYOTA AGYA 2025';
const PAGE_DESCRIPTION = 'Toyota Agya baru hadir dengan desain yang lebih sporty dan performa yang lebih handal, siap menemani setiap perjalanan Anda dengan gaya.';

export default function AgyaDetail() {
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

  

  const handleSelectCarType = (type) => {
    const priceNumber = parseInt(String(type.price).replace(/[^0-9]/g, ''), 10);
    setSelectedCarType({ ...type, price: priceNumber });
    setIsVarietyModalOpen(false);
  };

  const handleInquiryClick = () => {
    if (inquiryFormRef.current) {
      inquiryFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white font-montserrat overflow-x-hidden swipe-container" {...(swipeHandlers || {})}>
      <SEOHead 
        carModel="agya"
        title="Toyota Agya 2025 - Auto2000 Way Halim Bandar Lampung | Hatchback Ekonomis"
        description="Toyota Agya 2025 hatchback ekonomis dan stylish di Auto2000 Way Halim Bandar Lampung. Mobil perkotaan dengan konsumsi BBM irit dan harga terjangkau. Promo menarik tersedia."
        keywords="toyota agya, agya 2025, agya bandar lampung, agya lampung, hatchback toyota, mobil irit, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/agya"
      />
      {!heroImageLoaded && <LoadingSpinner />}
      <div style={{ visibility: heroImageLoaded ? 'visible' : 'hidden' }}>
        <LandingNavbar 
          isScrolled={isScrolled} 
          products={products} 
          onInquiryClick={() => setIsModalOpen(true)}
          onSwipeHandlersReady={setSwipeHandlers}
        />
        <InquiryModal open={isModalOpen} onClose={() => setIsModalOpen(false)} models={products.map(p => p.name)} />

        <section className="relative w-full">
          <img src={HERO_IMAGE} alt={PAGE_TITLE} className="w-full h-auto" />
        </section>

        <section className="py-12 px-4 md:px-8 lg:px-16">
            <h1 className="text-3xl md:text-4xl font-normal text-center text-black uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>{PAGE_TITLE}</h1>
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
                                className="mt-6 bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md">
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

        <div ref={inquiryFormRef}>
            <InquiryModal
                asModal={false}
                models={products.map(p => p.name)}
                carInterestPrefill={selectedCarType ? `${CAR_NAME} - ${selectedCarType.name}` : CAR_NAME}
            />
        </div>
      </div>
    </div>
  );
}
