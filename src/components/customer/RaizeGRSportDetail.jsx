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

const CAR_NAME = 'Raize GR Sport';
const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaizeGR%2FAzHero.jpg?alt=media&token=71cd7ca0-1d63-4b67-a952-c9e776ae28db';

const colorVariants = [
  { name: 'Silver Metallic', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaizeGR%2FAzBlackSilverMetallic.png?alt=media&token=f6f1f54a-8009-4ffa-b490-2fa005a88d00' },
  { name: 'Black & White', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaizeGR%2FAzBlackWhite.png?alt=media&token=43d9d0c6-b4cd-4bf4-bed4-8841d2f62a20' },
  { name: 'Black', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaizeGR%2FAzBlack.png?alt=media&token=82b92a92-5c85-41cc-9c14-2ea873323336' },
  { name: 'Black & Yellow', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaizeGR%2FAzBlackYellow.png?alt=media&token=aafe2cce-30a0-4589-92fa-121b2a562dda' }
];

const exteriorImages = [
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaizeGR%2FAzEx1.jpg?alt=media&token=cfcfca68-e0e9-447b-8e09-67d725619bf4', title: 'GR Sport Front Bumper', description: 'Bumper depan dengan desain eksklusif GR Sport yang lebih agresif dan aerodinamis.' },
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaizeGR%2FAzEx2.jpg?alt=media&token=33610444-493f-47a3-ac62-a5f59ecb3166', title: 'GR Sport Side Skirt', description: 'Side skirt sporty yang mempertegas tampilan samping dan meningkatkan stabilitas.' },
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaizeGR%2FAzEx3.jpg?alt=media&token=93c56360-7037-4652-a554-53f5eee1ff7d', title: 'GR Sport Rear Bumper', description: 'Desain bumper belakang yang kokoh dengan sentuhan sporty khas Gazoo Racing.' }
];

const interiorImages = [
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaizeGR%2FAzIn1.jpg?alt=media&token=9141cb83-3532-405c-86fc-b6a55d71ca24', title: 'GR Sport Steering Wheel', description: 'Setir berbalut kulit dengan logo GR Sport memberikan grip yang mantap dan nuansa balap.' },
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaizeGR%2FAzIn2.jpg?alt=media&token=807f7e96-2737-4be8-afca-f857327761bf', title: 'Sporty Combination Meter', description: 'Panel instrumen dengan desain sporty dan informasi lengkap untuk pengalaman berkendara yang lebih baik.' },
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FRaizeGR%2FAzIn3.jpg?alt=media&token=cfed7b9d-6041-479c-875d-3ad6b3f18f85', title: 'GR Sport Seat', description: 'Jok dengan desain semi-bucket dan aksen merah yang memberikan kenyamanan dan menunjang posisi berkendara.' }
];

export default function RaizeGRSportDetail() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [products, setProducts] = useState([]);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVarietyModalOpen, setIsVarietyModalOpen] = useState(false);
  const [selectedCarType, setSelectedCarType] = useState(null);
  const [price, setPrice] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colorVariants[0]);
  const [swipeHandlers, setSwipeHandlers] = useState(null);
  const inquiryFormRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = HERO_IMAGE;
    img.onload = () => setHeroImageLoaded(true);

    const fetchProductsAndPrice = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);

      const carProduct = productsData.find(p => p.name === CAR_NAME);
      if (carProduct) {
        const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(carProduct.price);
        setPrice(formattedPrice);
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
        carModel="raize-gr-sport"
        title="Toyota Raize GR Sport 2025 - Auto2000 Way Halim Bandar Lampung | SUV Sporty"
        description="Toyota Raize GR Sport 2025 SUV sporty dengan performa tinggi di Auto2000 Way Halim Bandar Lampung. Crossover compact dengan desain GR yang agresif."
        keywords="toyota raize gr sport, raize gr sport 2025, suv sporty, crossover, gr sport, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/raize-gr-sport"
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
          <img src={HERO_IMAGE} alt="Toyota Raize GR Sport" className="w-full h-auto" />
        </section>

        <section className="py-12 px-4 md:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-normal text-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>TOYOTA RAIZE GR SPORT 2025</h1>
            <p className="text-base md:text-lg text-gray-500 mt-4">
              Toyota Raize GR Sport 2025 adalah adalah Varian sporty dari Raize dengan tampilan dan performa yang ditingkatkan. Hubungi sales Auto2000 untuk informasi lengkap dan promo menarik.
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
                      {selectedCarType
                          ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedCarType.price)
                          : (price ? `Mulai dari ${price}` : 'Harga tidak tersedia')
                      }
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
            documentId={'Raize GR Sport'}
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
