import React, { useState, useEffect, useRef } from 'react';
import LandingNavbar from '../common/LandingNavbar';
import InquiryModal from '../common/InquiryModal';
import CarVariety from '../common/CarVariety';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useInitialCarVariety } from '../../hooks/useInitialCarVariety';
import LoadingSpinner from '../common/LoadingSpinner';
import SEOHead from '../common/SEOHead';
import EnhancedVarietyButton from '../common/EnhancedVarietyButton';

const RUSH_HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Rush%2FHero-Rush.jpg?alt=media&token=8c94d16e-9179-4150-b76c-1ad9d2178a36';

const colors = [
  { name: 'Silver Metallic', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Rush%2Fsilver-rush.png?alt=media&token=d81886e1-2e2d-4b49-8c15-a8ae42e5d574' },
  { name: 'Deep Maroon', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Rush%2Fdeepmaroon-rush.png?alt=media&token=722e49f6-008c-4db1-bfab-1303322c4f2b' },
  { name: 'Bronze M. M.', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Rush%2Fbronze%20rus.png?alt=media&token=e13628aa-323a-48eb-ae59-4bcf22e7ac85' },
  { name: 'White', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Rush%2Fwhite%20rush.png?alt=media&token=8be179b7-ceb9-4120-a5c0-e3416d09cffd' },
  { name: 'Black Mica', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Rush%2Fblackmica-rush.png?alt=media&token=c8de359a-0cd3-40c9-a2cd-a91cb3fd2a94' }
];

const exteriorImages = [
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Rush%2FEksterior-rush1.jpg?alt=media&token=0d134bc6-8dc9-42af-90ed-0969e91dd384', title: 'Desain Eksterior Modern', description: 'Tampilan depan yang gagah dan modern.' },
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Rush%2Feksterior-rush2.jpg?alt=media&token=4d1abc2d-45f3-43e9-bfbf-aa4a61b21a80', title: 'Lampu Belakang LED', description: 'Desain lampu belakang yang stylish dan memberikan visibilitas maksimal.' },
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Rush%2Feksterior-rush3.jpg?alt=media&token=ea15320f-6027-4994-8391-02cc74a05d56', title: 'Velg Alloy Sporty', description: 'Velg alloy dengan desain sporty yang menambah kesan dinamis.' }
];

const interiorImages = [
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Rush%2Finterior-rush1.jpg?alt=media&token=4314b4dd-aa7a-44c3-bb3f-8f1466a25f6d', title: 'Kabin Luas dan Nyaman', description: 'Interior yang dirancang untuk kenyamanan seluruh keluarga.' },
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Rush%2Finterior%20rush2.jpg?alt=media&token=8fa2c8a0-2741-42f4-8af0-046ff5d03779', title: 'Dashboard Modern', description: 'Dashboard dengan desain modern dan fitur yang mudah dijangkau.' },
  { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Rush%2Finterior-rush3.jpg?alt=media&token=b29ba6ce-245d-4965-8a98-439397f535d1', title: 'Ruang Kargo Fleksibel', description: 'Ruang kargo yang luas dan dapat disesuaikan dengan kebutuhan Anda.' }
];

export default function RushDetail() {
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [products, setProducts] = useState([]);
  const [price, setPrice] = useState(null);
  const [isVarietyModalOpen, setIsVarietyModalOpen] = useState(false);
  const [selectedCarType, setSelectedCarType] = useState(null);
  const [swipeHandlers, setSwipeHandlers] = useState(null);
  const inquiryFormRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = RUSH_HERO_IMAGE;
    img.onload = () => setIsLoading(false);
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

      const car = productsData.find(p => p.name === 'Rush');
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
  useInitialCarVariety('Rush', setSelectedCarType);

  const handleInquiryClick = () => {
    if (inquiryFormRef.current) {
      inquiryFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const carModels = products.map(p => p.name);

  return (
    <>
      <SEOHead 
        carModel="rush"
        title="Toyota Rush 2025 - Auto2000 Way Halim Bandar Lampung | SUV Tangguh"
        description="Toyota Rush 2025 SUV tangguh dan stylish di Auto2000 Way Halim Bandar Lampung. Cocok untuk keluarga dengan fitur keselamatan lengkap dan performa handal. Promo spesial tersedia."
        keywords="toyota rush, rush 2025, rush bandar lampung, rush lampung, suv toyota, mobil keluarga, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/rush"
      />
      {isLoading && <LoadingSpinner />}
      <div style={{ visibility: isLoading ? 'hidden' : 'visible' }} className="min-h-screen bg-white" {...(swipeHandlers || {})}>
      <LandingNavbar 
        isScrolled={isScrolled} 
        products={products}
        onInquiryClick={() => setIsModalOpen(true)}
        onSwipeHandlersReady={setSwipeHandlers} 
      />
      <InquiryModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        models={carModels} 
      />

      {/* Hero Section */}
      <section className="relative w-full overflow-x-hidden">
        <div className="relative w-full">
          <img
            src={RUSH_HERO_IMAGE}
            alt="Toyota Rush Hero"
            className="w-full h-auto block max-w-full"
          />
        </div>
      </section>

      {/* Description Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl md:text-3xl font-normal mb-4 tracking-tight" style={{fontFamily:'Montserrat, sans-serif'}}>TOYOTA RUSH 2025</h2>
          <p className="text-gray-500 text-base md:text-lg max-w-3xl mx-auto">
            Toyota Rush 2025 adalah adalah SUV keluarga dengan kapasitas tujuh penumpang dan desain tangguh.Terdapat 4 pilihan varian yang tersedia untuk Toyota Rush. Hubungi sales Auto2000 untuk informasi lengkap dan promo menarik.
          </p>
        </div>
      </section>

      {/* Technical Data / Variants Section */}
      <section className="relative w-full bg-gray-50 flex flex-col items-center justify-center py-12 md:py-24 overflow-x-hidden">
        {/* Section Title (Centered Above All) */}
        <div className="w-full flex flex-col items-center justify-center mb-8">
          <span className="block text-lg md:text-xl font-medium text-gray-700 mb-1 text-center" style={{fontFamily:'Montserrat, sans-serif'}}>PILIHAN WARNA & TIPE VARIAN</span>
        </div>
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-stretch justify-center relative px-4 md:px-8">
          {/* Color Selector (Left) */}
          <div className="relative z-10 flex flex-col items-center md:items-start w-full md:w-1/4 mb-8 md:mb-0">
            <span className="text-xs text-gray-500 mb-2 ml-1">MODEL</span>
            <div className="grid grid-cols-2 gap-3 md:flex md:flex-col md:gap-4 w-full">
              {colors.map((color, idx) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(idx)}
                  className={`group border rounded-lg flex flex-row items-center px-3 py-3 w-full md:min-w-[170px] md:max-w-[250px] transition-all duration-150 bg-gray-50 shadow-sm relative ${selectedColor === idx ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-400'}`}
                  style={{outline:'none'}}
                >
                                    <div className="flex flex-row items-center justify-start w-full">
                    <img src={color.img} alt={color.name} className="w-16 h-10 md:w-20 md:h-12 object-contain mr-2" />
                    <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-blue-700 text-left whitespace-nowrap">{color.name}</span>
                  </div>
                  {selectedColor === idx && (
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
          <div className="relative z-10 flex flex-col items-center justify-center w-full md:w-1/2 mt-10 md:mt-0">
            <div className="relative w-full flex justify-center items-center">
                <AnimatePresence mode='wait'>
                    <motion.img 
                        key={selectedColor} 
                        src={colors[selectedColor].img}
                        alt="Car color variant"
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
              documentId="Rush"
              onSelectType={type => setSelectedCarType(type)}
            />
          </div>
        </div>
      </section>

      {/* Exterior & Interior Design Section */}
      <section className="py-12 md:py-20 bg-white">
        <h2 className="text-2xl md:text-3xl font-normal text-center mb-10 tracking-tight" style={{fontFamily:'Montserrat, sans-serif'}}>DESAIN EKSTERIOR</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
          {exteriorImages.map((image, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-full aspect-[16/9] bg-gray-100 flex items-center justify-center overflow-hidden mb-6">
                <img src={image.src} alt={image.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{fontFamily:'Montserrat, sans-serif'}}>{image.title}</h3>
              <p className="text-gray-500 text-base text-center">{image.description}</p>
            </div>
          ))}
        </div>
        
        <h2 className="text-2xl md:text-3xl font-normal text-center mb-10 mt-20 tracking-tight" style={{fontFamily:'Montserrat, sans-serif'}}>DESAIN INTERIOR</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
          {interiorImages.map((image, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-full aspect-[16/9] bg-gray-100 flex items-center justify-center overflow-hidden mb-6">
                <img src={image.src} alt={image.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{fontFamily:'Montserrat, sans-serif'}}>{image.title}</h3>
              <p className="text-gray-500 text-base text-center">{image.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inquiry Form Section */}
      <div ref={inquiryFormRef}>
        <InquiryModal
          asModal={false}
          models={carModels}
          carInterestPrefill={selectedCarType ? `Rush - ${selectedCarType.name}` : 'Rush'}
        />
      </div>

      {/* Car Variety Button & Price Section (matches /zenix) */}

    </div>
    </>
  );
}
