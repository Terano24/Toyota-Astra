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
const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FInnovaZenix%20Non%20Hybrid%2FNova.jpg?alt=media&token=0edbf3b1-5090-4e20-8223-b49dfd010244';

const colorVariants = [
    { name: 'Attitude Black', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FInnovaZenix%20Non%20Hybrid%2FNovaAttittudeBlack.png?alt=media&token=62e2aa10-c7b9-4fa3-81b8-d25a99a20c3a' },
    { name: 'Gray Metallic', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FInnovaZenix%20Non%20Hybrid%2FNovaGrayMetallic.png?alt=media&token=3ad01e8e-22ba-444e-8948-994acae32c97' },
    { name: 'Platinum White', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FInnovaZenix%20Non%20Hybrid%2FNovaPlatWhite.png?alt=media&token=14d1b61a-dc6b-44d8-a9d4-4161a950d927' },
    { name: 'Silver Metallic', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FInnovaZenix%20Non%20Hybrid%2FNovaSilverMetallic.png?alt=media&token=2765faea-d952-49e2-bbc2-3df6615403d1' },
];

const exteriorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FInnovaZenix%20Non%20Hybrid%2FNovaEk.jpg?alt=media&token=c116dbc1-0841-4a19-a3d4-1ff26dec2b4f', title: 'Desain Eksterior Premium', description: 'Tampilan luar yang elegan dengan garis-garis tegas dan modern yang mencerminkan kemewahan MPV terbaru.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FInnovaZenix%20Non%20Hybrid%2FNovaEk2.jpg?alt=media&token=57905692-8166-4e80-9baa-f641538a125f', title: 'Profil Samping Dinamis', description: 'Siluet yang aerodinamis dengan proporsi yang sempurna memberikan kesan sporty dan elegan.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FInnovaZenix%20Non%20Hybrid%2FNovaEk3.jpg?alt=media&token=cdf09a1f-eb44-41fa-8f1b-fb45b925c90f', title: 'Detail Belakang Mewah', description: 'Bagian belakang dengan lampu LED yang stylish dan bumper yang terintegrasi sempurna.' },
];

const interiorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FInnovaZenix%20Non%20Hybrid%2FNovaIn1.jpg?alt=media&token=958f7d93-1452-4ccc-b75a-3c886f493e61', title: 'Kabin Premium', description: 'Interior mewah dengan material berkualitas tinggi dan desain yang ergonomis untuk kenyamanan maksimal.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FInnovaZenix%20Non%20Hybrid%2FNovaIn2.jpg?alt=media&token=8fab03bb-084d-4534-9a41-a0fe5ff1ba95', title: 'Teknologi Canggih', description: 'Dashboard modern dengan layar infotainment besar dan kontrol yang mudah dijangkau.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FInnovaZenix%20Non%20Hybrid%2FNovaIn3.jpg?alt=media&token=e93fb483-b849-4c7e-aa07-e9277bb3e367', title: 'Ruang Luas', description: 'Konfigurasi tempat duduk yang fleksibel dengan ruang yang luas untuk seluruh keluarga.' },
];

const CAR_NAME = 'Innova Zenix CVT';
const PAGE_TITLE = 'TOYOTA INNOVA ZENIX 2025';
const PAGE_DESCRIPTION = 'Toyota Kijang Innova Zenix 2025 adalah adalah MPV canggih dengan teknologi terbaru dan kabin akomodatif. Hubungi sales Auto2000 untuk informasi lengkap dan promo menarik.';

export default function InnovaCVTDetail() {
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

  // Use the hook to automatically load initial car variety
  useInitialCarVariety(CAR_NAME, setSelectedCarType, setPrice);

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
  }, []);

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

  const carModels = products.map(p => p.name);

  return (
    <div className="bg-white font-montserrat overflow-x-hidden swipe-container" {...(swipeHandlers || {})}>
      <SEOHead 
        title={`${PAGE_TITLE} - Auto2000 Way Halim`}
        description={PAGE_DESCRIPTION}
        keywords="toyota innova zenix, innova zenix cvt, mpv toyota, auto2000 way halim, dealer toyota bandar lampung"
        canonicalUrl="/InnovaCVT"
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

        {/* Hero Section */}
        <section className="relative w-full">
          <img src={HERO_IMAGE} alt={PAGE_TITLE} className="w-full h-auto" />
        </section>

        {/* Description Section */}
        <section className="py-12 px-4 md:px-8 lg:px-16">
          <h1 className="text-3xl md:text-4xl font-normal text-center text-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {PAGE_TITLE}
          </h1>
          <p className="text-base md:text-lg text-gray-500 text-center mt-4 max-w-4xl mx-auto">
            {PAGE_DESCRIPTION}
          </p>
        </section>

        {/* Color & Variant Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-normal text-center text-black mb-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              PILIHAN WARNA & TIPE VARIAN
            </h2>
            <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start justify-center">
              {/* Color Selection */}
              <div className="w-full md:w-1/3 flex flex-col items-center md:items-start">
                <ul className="w-full max-w-sm">
                  {colorVariants.map((color) => (
                    <li 
                      key={color.name} 
                      onClick={() => setSelectedColor(color)} 
                      className={`flex items-center gap-4 p-3 mb-2 rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedColor.name === color.name 
                          ? 'bg-blue-100 border-2 border-blue-500' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <img src={color.image} alt={color.name} className="w-16 h-12 object-cover rounded-md" />
                      <span className={`font-semibold text-base ${
                        selectedColor.name === color.name ? 'text-blue-800' : 'text-gray-800'
                      }`}>
                        {color.name}
                      </span>
                      {selectedColor.name === color.name && (
                        <svg className="w-6 h-6 text-blue-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Car Image and Variety Selection */}
              <div className="w-full md:w-2/3 flex-grow flex flex-col items-center">
                <motion.img 
                  key={selectedColor.image} 
                  src={selectedColor.image} 
                  alt={selectedColor.name} 
                  className="w-full max-w-2xl h-auto" 
                  initial={{ opacity: 0, x: -50 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ duration: 0.5 }} 
                />
                
                {/* Interactive Elements */}
                <div className="mt-8 w-full max-w-2xl text-center flex flex-col items-center">
                  {/* Car Variety Button */}
                  <EnhancedVarietyButton
                    selectedCarType={selectedCarType}
                    onClick={() => setIsVarietyModalOpen(true)}
                  />

                  {/* Price Display */}
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

                  {/* Inquiry Button */}
                  <button
                    onClick={handleInquiryClick}
                    className="mt-6 bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md"
                  >
                    Dapatkan Penawaran
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Car Variety Modal */}
        <CarVariety
          isOpen={isVarietyModalOpen}
          onClose={() => setIsVarietyModalOpen(false)}
          documentId="innovazenixcvt"
          onSelectType={handleSelectCarType}
        />

        {/* Exterior Section */}
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

        {/* Interior Section */}
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

        {/* Inquiry Form */}
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
