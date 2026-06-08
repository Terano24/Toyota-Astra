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

// --- STEP 1: PASTE ASSETS HERE ---
const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FYarisCross%2FYacroHero.jpg?alt=media&token=908244dd-2e07-40fb-a07a-1c1e35d7d718';

const colorVariants = [
  { name: 'Black', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FYarisCross%2FYacroBlack.png?alt=media&token=c3d40ab8-d82f-471e-834b-61f62ac2f454' },
  { name: 'Silver Metallic', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FYarisCross%2Fyacro%20silver%20metallic.png?alt=media&token=ca05b66b-01aa-4750-a9e6-09e7f1671dd7' },
  { name: 'Spicy Scarlet', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FYarisCross%2Fyacro%20spicy%20scarlet.png?alt=media&token=09c5fcd0-7215-4c4f-819a-537535687b76' },
  { name: 'White Pearl', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FYarisCross%2Fyacro%20whitepearl.png?alt=media&token=196af2b1-cdcf-4eea-828a-fc51b2311916' },
];

const exteriorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FYarisCross%2FYacroex1.jpg?alt=media&token=4c7f2739-fd5c-4418-971b-b3d2dc008184', title: 'Desain Crossover Tangguh', description: 'Yaris Cross memadukan gaya urban dengan ketangguhan SUV sejati.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FYarisCross%2FYacroex2.jpg?alt=media&token=8a38e62a-2dc1-4f58-b704-1c64d4f306a8', title: 'Grille Depan Sporty', description: 'Tampilan depan yang gagah dengan grille besar dan desain lampu yang tajam.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FYarisCross%2FYacroex3.jpg?alt=media&token=798d239b-ce0b-43b5-819c-c244aaf5ed80', title: 'Siluet Bodi Atletis', description: 'Garis bodi yang dinamis menciptakan siluet yang kuat dan modern.' },
];

const interiorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FYarisCross%2FYacroin1.jpg?alt=media&token=232ef5db-6890-4a88-b3ec-6d605a3f2ee5', title: 'Kabin Luas dan Fleksibel', description: 'Interior yang dirancang untuk kenyamanan dan kepraktisan dalam setiap perjalanan.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FYarisCross%2FYacroin2.jpg?alt=media&token=39db58c1-d2e2-4186-97bf-eedc3b489b06', title: 'Dashboard Modern', description: 'Dashboard dengan desain ergonomis dan dilengkapi fitur-fitur canggih.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FYarisCross%2FYacroin3.jpg?alt=media&token=4670f6a6-2728-488b-8f9d-2146c87cc4a2', title: 'Bagasi Serbaguna', description: 'Ruang bagasi yang luas dan dapat disesuaikan untuk berbagai kebutuhan.' },
];

const CAR_NAME = 'Yaris Cross';
const PAGE_TITLE = 'TOYOTA YARIS CROSS 2025';
const PAGE_DESCRIPTION = 'Toyota Yaris Cross 2025 adalah adalah SUV crossover yang menggabungkan desain Yaris dengan kepraktisan SUV. Hubungi sales Auto2000 untuk informasi lengkap dan promo menarik.';

// --- END OF ASSETS ---

export default function YarisCrossDetail() {
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
    async function fetchProductsAndPrice() {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);

      const car = productsData.find(p => p.name === CAR_NAME);
      if (car && car.price) {
        const priceNumber = parseInt(car.price.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(priceNumber)) {
          const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(priceNumber);
          setPrice(formattedPrice);
        }
      }
    }
    fetchProductsAndPrice();
  }, []);

  

  // Load initial car variety to prevent RpNaN display

  useInitialCarVariety(CAR_NAME, setSelectedCarType);

  

  const handleInquiryClick = () => {
    if (inquiryFormRef.current) {
      inquiryFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const carModels = products.map(p => p.name);

  return (
    <div className="bg-white font-montserrat overflow-x-hidden swipe-container" {...(swipeHandlers || {})}>
      <SEOHead 
        carModel="yaris-cross"
        title="Toyota Yaris Cross 2025 - Auto2000 Way Halim Bandar Lampung | Urban SUV"
        description="Toyota Yaris Cross 2025 urban SUV dengan desain stylish di Auto2000 Way Halim Bandar Lampung. Crossover compact dengan fitur modern dan efisiensi tinggi."
        keywords="toyota yaris cross, yaris cross 2025, urban suv, crossover compact, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/yaris-cross"
      />
      {!heroImageLoaded && <LoadingSpinner />} 
      <div style={{ visibility: heroImageLoaded ? 'visible' : 'hidden' }}>
        <LandingNavbar 
          isScrolled={isScrolled} 
          products={products} 
          onInquiryClick={() => setIsModalOpen(true)}
          onSwipeHandlersReady={setSwipeHandlers}
        />
        <InquiryModal open={isModalOpen} onClose={() => setIsModalOpen(false)} models={carModels} />

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
                        <div className="text-center mt-6 flex flex-col items-center">
                            <EnhancedVarietyButton 
                                selectedCarType={selectedCarType}
                                onClick={() => setIsVarietyModalOpen(true)}
                            />
                            <p className="text-4xl font-bold text-red-600 mt-4">
                                {selectedCarType && selectedCarType.price
                                ? (() => {
                                    let priceValue = selectedCarType.price;
                                    if (typeof priceValue === 'string') priceValue = parseInt(priceValue.replace(/[^0-9]/g, ''), 10);
                                    if (isNaN(priceValue)) return 'Harga tidak tersedia';
                                    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(priceValue);
                                    })()
                                : (price ? `Mulai dari ${price}` : 'Harga tidak tersedia')}
                            </p>
                            <button
                                onClick={handleInquiryClick}
                                className="mt-6 bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md">
                                Dapatkan Penawaran
                            </button>
                        </div>
                        <CarVariety 
                        isOpen={isVarietyModalOpen}
                        onClose={() => setIsVarietyModalOpen(false)}
                        documentId={CAR_NAME}
                        onSelectType={type => setSelectedCarType(type)}
                        />
                    </div>
                </div>
            </div>
        </section>

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
            models={carModels}
            carInterestPrefill={selectedCarType ? `${CAR_NAME} - ${selectedCarType.name}` : CAR_NAME}
          />
        </div>
      </div>
    </div>
  );
}
