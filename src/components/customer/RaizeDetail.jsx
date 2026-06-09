import React, { useState, useEffect, useRef } from 'react';
import LandingNavbar from '../common/LandingNavbar';
import InquiryModal from '../common/InquiryModal';
import CarVariety from '../common/CarVariety';
import { db } from '../../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useInitialCarVariety } from '../../hooks/useInitialCarVariety';
import LoadingSpinner from '../common/LoadingSpinner';
import SEOHead from '../common/SEOHead';
import EnhancedVarietyButton from '../common/EnhancedVarietyButton';
import { motion, AnimatePresence } from 'framer-motion';

const CAR_NAME = 'Raize';
const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaize%2FaizeHero.jpg?alt=media&token=b813e05a-b7fa-4dec-a21e-194164e55e9d';

const colorVariants = [
  { name: 'Turqoise MM', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaize%2FAizeTurqoiseMM.avif?alt=media&token=898a94e0-1fd5-4fee-88f2-d337e3a9f5ad' },
  { name: 'White', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaize%2FAizeWhite.avif?alt=media&token=d8069414-0b67-41db-9303-10d5cc126728' },
  { name: 'Yellow', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaize%2FAizeYellow.avif?alt=media&token=47bb496c-2d62-4c46-a025-d087b3b09c10' },
  { name: 'Red', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaize%2FaizeRed.avif?alt=media&token=488972f1-ab65-41da-a0e7-1a14d61b7ce5' }
];

const exteriorImages = [
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaize%2FAizeEx1.webp?alt=media&token=29d3a944-ac0b-4a56-99e4-d51b3e471183', title: 'Tampilan Depan Sporty', description: 'Grill depan trapezoidal dan lampu LED tajam memberikan kesan agresif dan modern.' },
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaize%2FAizeEx2.webp?alt=media&token=b8c0eac4-c31e-49d8-9bc8-374754dfe5b4', title: 'Velg Alloy 17-inch', description: 'Desain velg two-tone yang dinamis menambah karakter kuat pada Raize.' },
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaize%2FAizeex3.webp?alt=media&token=cadeb3d0-8e11-4de9-9940-1e7ad6fbe7cc', title: 'Desain Belakang Modern', description: 'Lampu belakang LED dengan desain futuristik yang mudah dikenali.' }
];

const interiorImages = [
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaize%2FAizeIn1.webp?alt=media&token=28d01ac3-d702-402c-8cef-a7f1e5289e53', title: 'Cockpit Modern', description: 'Dashboard canggih dengan layar sentuh 9-inch dan panel instrumen digital.' },
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaize%2FAizeIn2.webp?alt=media&token=e7b4977b-2e94-400b-85d3-8f535faed9af', title: 'Kabin Lega & Fleksibel', description: 'Ruang kabin yang luas dengan kursi yang dapat diatur untuk berbagai kebutuhan.' },
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaize%2FAizeIn3.jpg?alt=media&token=142db25b-61de-4a9f-9aac-c17ed3f5cf23', title: 'Bagasi Luas', description: 'Kapasitas bagasi yang besar dan praktis untuk membawa semua barang bawaan Anda.' }
];

export default function RaizeDetail() {
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = HERO_IMAGE;
    img.onload = () => setHeroImageLoaded(true);

    const fetchProductsAndPrice = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);

      const carProduct = productsData.find(p => p.name === CAR_NAME);
      if (carProduct && carProduct.price) {
        const priceString = String(carProduct.price).replace(/[^0-9]/g, '');
        const priceNumber = parseInt(priceString, 10);
        if (!isNaN(priceNumber) && priceNumber > 0) {
            const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(priceNumber);
            setPrice(formattedPrice);
        }
      }
    };

    fetchProductsAndPrice();

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        carModel="raize"
        title="Toyota Raize 2025 - Auto2000 Way Halim Bandar Lampung | SUV Kompak"
        description="Toyota Raize 2025 SUV kompak dengan desain stylish di Auto2000 Way Halim Bandar Lampung. Urban SUV dengan fitur canggih dan efisiensi tinggi."
        keywords="toyota raize, raize 2025, raize bandar lampung, suv kompak, urban suv, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/raize"
      />
      {!heroImageLoaded && <LoadingSpinner />}
      <div style={{ visibility: heroImageLoaded ? 'visible' : 'hidden' }}>
        <LandingNavbar 
          isScrolled={isScrolled} 
          products={products} 
          onInquiryClick={() => setIsModalOpen(true)}
          onSwipeHandlersReady={setSwipeHandlers}
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />
        <InquiryModal open={isModalOpen} onClose={() => setIsModalOpen(false)} models={products.map(p => p.name)} />

        <section className="relative w-full h-auto">
          <img src={HERO_IMAGE} alt="Toyota Raize" className="w-full h-auto" />
        </section>

        <section className="py-12 px-4 md:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-normal text-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>TOYOTA RAIZE 2025</h1>
            <p className="text-base md:text-lg text-gray-500 mt-4">
              Toyota Raize 2025 adalah adalah SUV kompak yang stylish dan cocok untuk penggunaan perkotaan. Hubungi sales Auto2000 untuk informasi lengkap dan promo menarik.
            </p>
          </div>
        </section>

        <section className="w-full py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-normal text-center mb-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>PILIHAN WARNA & TIPE VARIAN</h2>
            <div className="flex flex-col md:flex-row items-start justify-center gap-8">
              <div className="w-full md:w-1/3">
                <div className="space-y-2 max-w-sm mx-auto">
                  {colorVariants.map((color) => (
                    <button 
                      key={color.name} 
                      onClick={() => setSelectedColor(color)}
                      className={`w-full text-left p-2 rounded-lg border-2 flex items-center transition-all duration-200 ${selectedColor.name === color.name ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-400'}`}>
                      <div className="w-16 h-10 rounded-md overflow-hidden mr-4">
                        <img src={color.img} alt={color.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-semibold text-gray-800">{color.name}</span>
                      {selectedColor.name === color.name && (
                        <svg className="w-6 h-6 text-blue-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center w-full md:w-2/3 mt-10 md:mt-0">
                <AnimatePresence mode='wait'>
                  <motion.img
                    key={selectedColor.name}
                    src={selectedColor.img}
                    alt={selectedColor.name}
                    className="select-none pointer-events-none w-full max-w-2xl object-contain drop-shadow-lg"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
                <div className="mt-8 w-full max-w-2xl text-center flex flex-col items-center">
                  <EnhancedVarietyButton 
                                selectedCarType={selectedCarType}
                                onClick={() => setIsVarietyModalOpen(true)}
                            />
                  <p className="text-4xl font-bold text-red-600 mt-4">
                      {selectedCarType && selectedCarType.price
                  ? (() => {
                      let priceValue = selectedCarType.price;
                      if (typeof priceValue === 'string') priceValue = parseInt(priceValue.replace(/[^0-9]/g, ''), 10);
                      if (isNaN(priceValue) || priceValue === 0) return 'Harga tidak tersedia';
                      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(priceValue);
                    })()
                  : (price ? `Mulai dari ${price}` : 'Harga tidak tersedia')}
                  </p>
                  <button
                      onClick={handleInquiryClick}
                      className="mt-6 bg-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md">
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
            documentId={'Raize'}
            onSelectType={handleSelectCarType}
        />

        <section className="w-full py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-normal text-center mb-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>Eksterior</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {exteriorImages.map((img, index) => (
                <div key={index} className="text-center">
                  <img src={img.src} alt={img.title} className="w-full h-auto rounded-lg shadow-md mb-4" />
                  <h3 className="text-xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{img.title}</h3>
                  <p className="text-gray-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>{img.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-normal text-center mb-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>Interior</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {interiorImages.map((img, index) => (
                <div key={index} className="text-center">
                  <img src={img.src} alt={img.title} className="w-full h-auto rounded-lg shadow-md mb-4" />
                  <h3 className="text-xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{img.title}</h3>
                  <p className="text-gray-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>{img.description}</p>
                </div>
              ))}
            </div>
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
