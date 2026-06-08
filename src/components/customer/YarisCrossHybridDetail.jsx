import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import LandingNavbar from '../common/LandingNavbar';
import InquiryModal from '../common/InquiryModal';
import CarVariety from '../common/CarVariety';
import LoadingSpinner from '../common/LoadingSpinner';
import SEOHead from '../common/SEOHead';
import EnhancedVarietyButton from '../common/EnhancedVarietyButton';

const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/YrCross%2FYrCross-Hero.jpg?alt=media&token=e6059568-9956-49a5-aeaf-6919bc7befad';

const colors = [
  { name: 'Attitude Black', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/YrCross%2FYrCross-AttitudeBlack.png?alt=media&token=caf99f47-01b7-41df-a189-3c35e6803fe2' },
  { name: 'Dark Red', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/YrCross%2FYrCross-DarkRed.png?alt=media&token=cde9df04-a328-416d-a712-1cbbf09b62da' },
  { name: 'Greenish Metal', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/YrCross%2FYrCross-GreenishMetal.png?alt=media&token=6730c7be-8e8e-4cf7-b4da-eb89b242e175' },
  { name: 'Super White', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/YrCross%2FYrCross-SuperWhite.png?alt=media&token=a3380db5-4f85-4981-8a58-28e72c8045f3' },
];

const exteriorImages = [
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/YrCross%2FYrCross-Ex1.jpg?alt=media&token=1362cb7f-0e50-4813-81d1-f855645f6185', title: 'Desain Eksterior Modern', description: 'Tampilan eksterior yang gagah dan modern, siap menemani setiap petualangan Anda.' },
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/YrCross%2FYrCross-Ex2.jpg?alt=media&token=3558f13a-80a4-48a8-9296-d5e819f0b63d', title: 'Velg Alloy Sporty', description: 'Velg alloy dengan desain sporty yang memberikan kesan dinamis dan tangguh.' },
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/YrCross%2FYrCross-Ex3.jpg?alt=media&token=be6d47fb-79e6-4f63-997e-27dc4c72a8fd', title: 'Lampu Belakang LED', description: 'Lampu belakang LED dengan desain tajam yang memberikan visibilitas maksimal.' },
];

const interiorImages = [
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/YrCross%2FYrCross-In1.jpg?alt=media&token=ceb1951d-f6ea-428f-a3cf-8b2edcb6bf71', title: 'Kabin Luas dan Nyaman', description: 'Interior yang luas dengan material berkualitas tinggi untuk kenyamanan maksimal.' },
];

export default function YarisCrossHybridDetail() {
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVarietyModalOpen, setIsVarietyModalOpen] = useState(false);
  const [selectedCarType, setSelectedCarType] = useState(null);
  const [price, setPrice] = useState(null);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [swipeHandlers, setSwipeHandlers] = useState(null);
  const inquiryFormRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = HERO_IMAGE;
    img.onload = () => setIsLoading(false);
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

      const car = productsData.find(p => p.name === 'Yaris Cross Hybrid');
      if (car && car.price) {
        const priceNumber = parseInt(car.price.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(priceNumber)) {
          const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(priceNumber);
          setPrice(formattedPrice);
        }
      }
    };
    fetchProductsAndPrice();
  }, []);

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
        title="Toyota Yaris Cross Hybrid 2025 - Auto2000 Way Halim Bandar Lampung"
        description="Toyota Yaris Cross Hybrid 2025 crossover stylish dengan teknologi hybrid di Auto2000 Way Halim Bandar Lampung. Urban SUV dengan desain modern dan fitur canggih."
        keywords="toyota yaris cross, yaris cross hybrid, yaris cross 2025, crossover toyota, urban suv, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/yaris-cross-hybrid"
      />
      {isLoading && <LoadingSpinner />}
      <div style={{ visibility: isLoading ? 'hidden' : 'visible' }} className="min-h-screen bg-white font-sans">
        <LandingNavbar 
          isScrolled={isScrolled} 
          products={products} 
          onInquiryClick={() => setIsModalOpen(true)}
          onSwipeHandlersReady={setSwipeHandlers}
        />
        <InquiryModal open={isModalOpen} onClose={() => setIsModalOpen(false)} models={carModels} carInterestPrefill="Yaris Cross Hybrid" />

        <section className="relative w-full">
          <img src={HERO_IMAGE} alt="Yaris Cross Hybrid Hero" className="w-full h-auto" />
        </section>

        <section className="w-full bg-white py-12 md:py-16">
          <div className="container mt-8 w-full max-w-2xl text-center flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-normal uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>TOYOTA YARIS CROSS HYBRID 2025</h1>
            <p className="text-gray-500 mt-4 max-w-3xl mx-auto text-base md:text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Toyota Yaris Cross Hybrid 2025 adalah adalah SUV Hybrid modern dengan kenyamanan berkendara yang maksimal. Hubungi sales Auto2000 untuk informasi lengkap dan promo menarik.
            </p>
          </div>
        </section>

        <section className="w-full py-12 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-normal text-center mb-12" style={{fontFamily:'Montserrat, sans-serif'}}>PILIHAN WARNA & TIPE VARIAN</h2>
            <div className="flex flex-col md:flex-row items-start justify-center gap-4">
              {/* Left Column: Color Selectors */}
              <div className="w-full md:w-1/4">
                <p className="text-sm font-medium text-gray-500 mb-3">MODEL</p>
                <div className="space-y-3">
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(colors[index])}
                      className={`w-full flex items-center text-left p-3 rounded-lg border transition-all duration-200 ${selectedColor.name === color.name ? 'bg-white border-blue-500 shadow-md' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-sm'}`}>
                      <img src={color.img} alt={color.name} className="w-16 h-10 object-cover rounded-md mr-4" />
                      <span className="font-semibold text-gray-800">{color.name}</span>
                      {selectedColor.name === color.name && (
                        <span className="ml-auto text-blue-500">
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Middle Column: Number */}
              <div className="hidden md:flex flex-col items-center justify-center w-1/4 relative z-0 mt-[-16px] pointer-events-none">
                <span className="text-[7rem] lg:text-[12rem] font-bold text-gray-200 select-none leading-none" style={{opacity:0.5}}>{colors.length}</span>
              </div>

              {/* Right Column: Car Image and Price */}
              <div className="relative z-10 flex flex-col items-center justify-center w-full md:w-1/2 mt-10 md:mt-0">
                <div className="relative w-full flex justify-center items-center">
                  <AnimatePresence mode='wait'>
                    <motion.img
                      key={selectedColor.name}
                      src={selectedColor.img}
                      alt={selectedColor.name}
                      className="select-none pointer-events-none w-full max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl object-contain drop-shadow-lg transition-all duration-300"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>
                </div>
                
                {/* CarVariety Selector and Price Display */}
                <div className="text-center mt-6 flex flex-col items-center">
                  <EnhancedVarietyButton 
                                selectedCarType={selectedCarType}
                                onClick={() => setIsVarietyModalOpen(true)}
                            />
                  <p className="text-4xl font-bold text-red-600 mt-4">
                    {selectedCarType && selectedCarType.price
                      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseInt(selectedCarType.price.replace(/[^0-9]/g, ''), 10))
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
                  documentId="Yaris Cross Hybrid"
                  onSelectType={type => setSelectedCarType(type)}
                />
              </div>
            </div>
          </div>
            </section>

            <section className="w-full py-12 md:py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-normal text-center mb-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>Eksterior</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {exteriorImages.map((img, index) => (
                            <div key={index} className="text-center">
                                <img src={img.src} alt={`Eksterior ${index + 1}`} className="w-full h-auto rounded-lg shadow-md mb-4" />
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
                                <img src={img.src} alt={`Interior ${index + 1}`} className="w-full h-auto rounded-lg shadow-md mb-4" />
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
                    models={carModels}
                    carInterestPrefill={selectedCarType ? `Yaris Cross Hybrid - ${selectedCarType.name}` : 'Yaris Cross Hybrid'}
                />
            </div>
      </div>
    </div>
  );
}
