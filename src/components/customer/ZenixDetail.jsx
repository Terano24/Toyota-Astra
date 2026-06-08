import React, { useState, useEffect, useMemo, useRef } from 'react';
import LandingNavbar from '../common/LandingNavbar';
import InquiryModal from '../common/InquiryModal';
import CarVariety from '../common/CarVariety';
import EnhancedVarietyButton from '../common/EnhancedVarietyButton';
import { db } from '../../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useInitialCarVariety } from '../../hooks/useInitialCarVariety';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingSpinner from '../common/LoadingSpinner';

const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2FHevZenix.jpg?alt=media&token=ba0de320-2413-437f-87df-125e410f1ba7';

export default function ZenixDetail() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [products, setProducts] = useState([]);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVarietyModalOpen, setIsVarietyModalOpen] = useState(false);
  const [selectedCarType, setSelectedCarType] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [swipeHandlers, setSwipeHandlers] = useState(null);
  const [price, setPrice] = useState(null);
  const inquiryFormRef = useRef(null);

  const colors = useMemo(() => [
    { name: 'Platinum White', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2F1-Platinum-White-Pearl_0%20Zenix.png?alt=media&token=923657b3-dd06-465d-b525-5f8b563eee50' },
    { name: 'Silver Metal', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2F2-Silver-Metallic_0%20Zenix.png?alt=media&token=56a2601c-6f0b-4406-90b2-df7e853ae15b' },
    { name: 'Gray Metal', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2F2-Silver-Metallic_0%20Zenix.png?alt=media&token=56a2601c-6f0b-4406-90b2-df7e853ae15b' },
    { name: 'Attitude Black', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2F4-Attitude-Black_0%20zenix.png?alt=media&token=15f131cf-662a-40a7-9ac0-a19acdf74972' }
  ], []);

  const exteriorImages = [
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2FExterior-Zenix%201.jpg?alt=media&token=8dd7cc8c-37df-4349-9e4f-ddd1fb5bb471', alt: 'New Remarkable Front Grille', description: 'Desain grille depan yang gagah dan modern.' },
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2FExterior-Zenix%202.jpg?alt=media&token=f462cc4f-bf45-48a0-a9b6-0ec79a8f9898', alt: 'Seamless Electric Power Back Door', description: 'Buka tutup pintu bagasi secara otomatis.' },
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2FExterior-Zenix%203.jpg?alt=media&token=857c610e-bd72-4c54-8f01-edf89fa6dd41', alt: 'Stunning 18" Alloy Wheel', description: 'Velg alloy dengan desain sporty dan elegan.' }
  ];

  const interiorImages = [
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2FInteriror%20Zenix%201.jpg?alt=media&token=5c688e41-1951-4293-baa8-698baebf3170', alt: 'Captain Seat with Ottoman', description: 'Kenyamanan maksimal untuk penumpang baris kedua.' },
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2FInterior%20Zenix%202.jpg?alt=media&token=fd173fcd-702a-41f2-b877-69a35f12710e', alt: '10" Head Unit with Smartphone Connectivity', description: 'Sistem hiburan canggih dan terintegrasi.' },
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2FInterior%20Zenix%203.jpg?alt=media&token=679c98cf-7229-4f9a-ab9b-c579d3996e0a', alt: 'Illuminating Instrument Panel', description: 'Panel instrumen yang informatif dan mudah dibaca.' }
  ];

  useEffect(() => {
    async function fetchProductsAndPrice() {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);

      const car = productsData.find(p => p.name === 'Zenix');
      if (car && car.price) {
        const priceNumber = parseInt(String(car.price).replace(/[^0-9]/g, ''), 10);
        if (!isNaN(priceNumber)) {
          const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(priceNumber);
          setPrice(formattedPrice);
        }
      }
    }
    fetchProductsAndPrice();
  }, []);

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
    if (colors.length > 0) {
      setSelectedColor(colors[0]);
    }
  }, [colors]);

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

  // Load initial car variety to prevent "harga tidak ditemukan" display
  useInitialCarVariety('EpDDAZsQo7eUn11OA7wf', setSelectedCarType);

  return (
    <div className="bg-white font-montserrat overflow-x-hidden swipe-container" {...(swipeHandlers || {})}>
      {!heroImageLoaded && <LoadingSpinner />}
      <div style={{ visibility: heroImageLoaded ? 'visible' : 'hidden' }} className="min-h-screen bg-white">
        <LandingNavbar 
          isScrolled={isScrolled} 
          products={products} 
          onInquiryClick={() => setIsModalOpen(true)}
          onSwipeHandlersReady={setSwipeHandlers}
        />
        <InquiryModal 
          open={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          models={products.map(p => p.name)}
        />

        <section className="relative w-full">
          <img src={HERO_IMAGE} alt="Toyota Innova Hybrid 2025 Hero" className="w-full h-auto" />
        </section>

        <section className="py-12 md:py-20 bg-white">
          <div className="mt-8 w-full max-w-2xl text-center flex flex-col items-center px-4">
            <h2 className="text-2xl md:text-3xl font-normal mb-4 tracking-tight" style={{fontFamily:'Montserrat, sans-serif'}}>TOYOTA INNOVA HYBRID 2025</h2>
            <p className="text-gray-500 text-base md:text-lg max-w-3xl mx-auto">
              Toyota Innova Zenix Hybrid 2025 adalah adalah MPV hybrid pertama dari Toyota dengan performa dan efisiensi optimal. Terdapat 3 pilihan varian yang tersedia untuk Toyota Innova Zenix Hybrid. Hubungi sales Auto2000 untuk informasi lengkap dan promo menarik.
            </p>
          </div>
        </section>

        <section className="relative w-full bg-gray-50 flex flex-col items-center justify-center py-12 md:py-24 overflow-x-hidden">
          <div className="w-full flex flex-col items-center justify-center mb-8">
            <span className="block text-lg md:text-xl font-medium text-gray-700 mb-1 text-center" style={{fontFamily:'Montserrat, sans-serif'}}>PILIHAN WARNA & TIPE VARIAN</span>
          </div>
          <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-stretch justify-center relative px-4 md:px-8">
            {/* Color Selector (Left) */}
            <div className="relative z-10 flex flex-col items-center md:items-start w-full md:w-1/4 mb-8 md:mb-0">
              <span className="text-xs text-gray-500 mb-2 ml-1">PILIH WARNA</span>
              <div className="grid grid-cols-2 gap-3 md:flex md:flex-col md:gap-4 w-full">
                {selectedColor && colors.map((color, index) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(colors[index])}
                    className={`group border rounded-lg flex flex-row items-center px-3 py-3 w-full md:min-w-[170px] md:max-w-[250px] transition-all duration-150 bg-gray-50 shadow-sm relative ${selectedColor.name === color.name ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-400'}`}
                    style={{outline:'none'}}
                  >
                    <div className="flex flex-row items-center justify-start w-full">
                      <img src={color.img} alt={color.name} className="w-16 h-10 md:w-20 md:h-12 object-contain mr-2" />
                      <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-blue-700 text-left whitespace-nowrap">{color.name}</span>
                    </div>
                    {selectedColor.name === color.name && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M3 6.5l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Big Number (Center) */}
            <div className="hidden md:flex flex-col items-center justify-center w-1/4 relative z-0 mt-[-16px] pointer-events-none">
              <span className="text-[7rem] lg:text-[12rem] font-bold text-gray-200 select-none leading-none" style={{opacity:0.5}}>{colors.length}</span>
            </div>

            {/* Car Image + Titles (Right) */}
            <div className="w-full md:w-2/4 flex flex-col items-center justify-center relative">
              {selectedColor && (
                <AnimatePresence mode='wait'>
                  <motion.img
                    key={selectedColor.name}
                    src={selectedColor.img}
                    alt={selectedColor.name}
                    className="select-none pointer-events-none w-full max-w-lg lg:max-w-xl xl:max-w-2xl object-contain drop-shadow-2xl"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
              )}
              <div className="text-center mt-6 flex flex-col items-center">
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
                  className="mt-6 bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md">
                  Dapatkan Penawaran
                </button>
              </div>
            </div>
          </div>
          <CarVariety 
            isOpen={isVarietyModalOpen}
            onClose={() => setIsVarietyModalOpen(false)}
            documentId="EpDDAZsQo7eUn11OA7wf"
            onSelectType={handleSelectCarType}
          />
        </section>

        <section className="py-12 md:py-20 bg-white">
          <h2 className="text-2xl md:text-3xl font-normal text-center mb-10 tracking-tight" style={{fontFamily:'Montserrat, sans-serif'}}>DESAIN EKSTERIOR</h2>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
            {exteriorImages.map((image, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-full aspect-[16/9] bg-gray-100 flex items-center justify-center overflow-hidden rounded-lg shadow-lg mb-6">
                  <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{fontFamily:'Montserrat, sans-serif'}}>{image.alt}</h3>
                <p className="text-gray-500 px-4">{image.description}</p>
              </div>
            ))}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-normal text-center mb-10 mt-20 tracking-tight" style={{fontFamily:'Montserrat, sans-serif'}}>DESAIN INTERIOR</h2>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
            {interiorImages.map((image, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-full aspect-[16/9] bg-gray-100 flex items-center justify-center overflow-hidden rounded-lg shadow-lg mb-6">
                  <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{fontFamily:'Montserrat, sans-serif'}}>{image.alt}</h3>
                <p className="text-gray-500 px-4">{image.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div ref={inquiryFormRef}>
          <InquiryModal
            asModal={false}
            models={products.map(p => p.name)}
            carInterestPrefill={selectedCarType ? `Zenix - ${selectedCarType.name}` : 'Zenix'}
          />
        </div>
      </div>
    </div>
  );
}
