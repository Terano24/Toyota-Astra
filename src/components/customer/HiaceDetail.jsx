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
import { useInitialCarVariety } from '../../hooks/useInitialCarVariety';

const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FHiace%2FYaceHero.jpg?alt=media&token=d450f58c-972b-435c-bbd6-b2893be4af9b';

const colorVariants = [
  { name: 'Silver Metallic', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FHiace%2FYaceSilverMetallic.png?alt=media&token=6e18f10d-e177-4bf0-a0c9-aef115450311' },
  { name: 'White', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FHiace%2FYaceWhite.png?alt=media&token=a3507534-2a0b-4b27-bd68-66c0be032661' },
];

const exteriorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FHiace%2FYaceEk1.jpg?alt=media&token=28316ca1-1744-4a48-b75d-1b8b507499f9', alt: 'Hiace Exterior 1' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FHiace%2FYaceEK2.jpg?alt=media&token=4489ac96-88c3-4556-bc4f-8173c2a1ec3d', alt: 'Hiace Exterior 2' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FHiace%2FYaceEK3.jpg?alt=media&token=d79e4af9-3b8e-4fd9-b262-cc495bc60093', alt: 'Hiace Exterior 3' },
];

const interiorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FHiace%2FYaceiN1.jpg?alt=media&token=4603ffdf-4528-45d0-8558-43b6fd337ef1', alt: 'Hiace Interior 1' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FHiace%2FYacein2.jpg?alt=media&token=149661aa-a43e-4716-87cd-229a0993c1f1', alt: 'Hiace Interior 2' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FHiace%2FYaceiN1.jpg?alt=media&token=4603ffdf-4528-45d0-8558-43b6fd337ef1', alt: 'Hiace Interior 3' },
];

export default function HiaceDetail() {
  const [isScrolled, setIsScrolled] = useState(false);

  const [products, setProducts] = useState([]);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [price, setPrice] = useState(null);
  const [selectedColor, setSelectedColor] = useState(colorVariants[0]);
  const [isVarietyModalOpen, setIsVarietyModalOpen] = useState(false);
  const [selectedCarType, setSelectedCarType] = useState(null);
  const [swipeHandlers, setSwipeHandlers] = useState(null);
  const inquiryFormRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load initial car variety to prevent empty display
  useInitialCarVariety('Hiace', setSelectedCarType);

  const handleSelectCarType = (type) => {
    setSelectedCarType(type);
    setPrice(new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(type.price.replace(/[^0-9]/g, '')));
    setIsVarietyModalOpen(false);
  };

  const handleInquiryClick = () => {
    if (selectedCarType) {
      inquiryFormRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      setIsVarietyModalOpen(true);
    }
  };

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

      const car = productsData.find(p => p.name === 'Hiace');
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

  return (
    <div className="bg-white font-montserrat overflow-x-hidden swipe-container" {...(swipeHandlers || {})}>
      <SEOHead 
        carModel="hiace"
        title="Toyota Hiace 2025 - Auto2000 Way Halim Bandar Lampung | Van Komersial"
        description="Toyota Hiace 2025 van komersial serbaguna di Auto2000 Way Halim Bandar Lampung. Kendaraan niaga dengan kapasitas besar dan keandalan tinggi."
        keywords="toyota hiace, hiace 2025, van komersial, kendaraan niaga, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/hiace"
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
        <CarVariety
          isOpen={isVarietyModalOpen}
          onClose={() => setIsVarietyModalOpen(false)}
          documentId={'Hiace'}
          onSelectType={handleSelectCarType}
        />

        <section className="relative w-full h-auto">
          <img src={HERO_IMAGE} alt="Toyota Hiace" className="w-full h-auto object-cover" />
        </section>

        <section className="py-12 px-4 md:px-8 lg:px-16">
          <h1 className="text-3xl md:text-4xl font-normal text-center text-black uppercase">TOYOTA HIACE 2025</h1>
          <p className="text-base md:text-lg text-gray-500 text-center mt-6 flex flex-col items-center max-w-4xl mx-auto">
            Toyota Hiace 2025 adalah Van komersial serbaguna yang cocok untuk transportasi penumpang atau barang. Hubungi sales Auto2000 untuk informasi lengkap dan promo menarik.
          </p>
          {price && (
            <p className="text-2xl font-semibold text-center text-black mt-4">Harga mulai dari {price}</p>
          )}
        </section>

        <section id="color-variant-section" className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-center text-black mb-2">PILIHAN WARNA & TIPE VARIAN</h2>
            <p className="text-center text-gray-500 mb-8">Tersedia dalam {colorVariants.length} pilihan warna</p>
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="w-full md:w-1/3">
                <div className="space-y-2">
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
                <div className="mt-8 w-full max-w-2xl mx-auto9439">
                  <EnhancedVarietyButton 
                                selectedCarType={selectedCarType}
                                onClick={() => setIsVarietyModalOpen(true)}
                            />
                  <p className="text-4xl font-bold text-red-600 mt-4">
                      {price || 'Harga tidak tersedia'}
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

        <section className="py-12 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-center text-black mb-8">Eksterior</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {exteriorImages.map((image) => (
                <div key={image.id} className="rounded-lg overflow-hidden shadow-lg">
                  <img src={image.src} alt={image.alt} className="w-full h-auto object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-center text-black mb-8">Interior</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {interiorImages.map((image) => (
                <div key={image.id} className="rounded-lg overflow-hidden shadow-lg">
                  <img src={image.src} alt={image.alt} className="w-full h-auto object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div ref={inquiryFormRef} className="pt-10">
          <InquiryModal models={products.map(p => p.name)} asModal={false} carInterestPrefill={selectedCarType ? `Hiace - ${selectedCarType.name}` : 'Hiace'} />
        </div>
      </div>
    </div>
  );
}
