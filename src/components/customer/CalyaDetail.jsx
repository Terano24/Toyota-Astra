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

const CAR_NAME = 'Calya';
const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCalya%2FCalya.jpg?alt=media&token=fa63cb4d-5979-420d-9541-6bde69bc0b5c';

const colorVariants = [
  { name: 'Black', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCalya%2FCalya-Black.png?alt=media&token=a11e4cdf-9309-4494-8e25-97cc2f617d73' },
  { name: 'Red', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCalya%2FCalyaRed.png?alt=media&token=bbdb3d69-4d19-4f71-a9d9-bc7f4e3b5192' },
  { name: 'White', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCalya%2FCalyaWhite.png?alt=media&token=46a94193-4f0f-4772-912d-7c0bd9a30c85' },
  { name: 'Silver Metallic', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCalya%2FCalyaSilverMetallic.png?alt=media&token=b8817674-9e3d-4aee-af8c-e2eeb117f64c' },
];

const exteriorImages = [
  { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCalya%2FCalyaEx1.jpg?alt=media&token=2b3fa435-0f00-4ebc-bfc6-6d83eac56f3c', title: 'New Front Mid Grille Design', description: 'Tampilan grille yang lebih sporty dan modern.' },
  { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCalya%2FCalyaEx2.jpg?alt=media&token=5f251545-001b-449f-9723-7ea603765b12', title: 'Retractable Outer Mirror', description: 'Kaca spion yang dapat dilipat secara elektrik.' },
  { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCalya%2FCalya%20Ex3.jpg?alt=media&token=d7b018da-0f88-461c-8295-2747cab8a322', title: 'Dynamic Shark Fin Antenna', description: 'Antena sirip hiu yang menambah kesan dinamis.' },
];

const interiorImages = [
  { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCalya%2FCalyaIn1.jpg?alt=media&token=3fc33cf0-a548-44b4-ae53-159dc0be85a4', title: 'Spacious 7-Seater Cabin', description: 'Kabin lega untuk kenyamanan seluruh keluarga.' },
  { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCalya%2FCalyaIn2.jpg?alt=media&token=755ed67b-9268-46b2-b961-331de6505265', title: 'Advanced Entertainment System', description: 'Sistem hiburan dengan konektivitas modern.' },
  { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCalya%2FCalyaIn3.jpg?alt=media&token=b904873e-198f-4b0e-80c5-6e5d02fb9a44', title: 'Under Seat Compartment', description: 'Ruang penyimpanan praktis di bawah kursi.' },
];

export default function CalyaDetail() {
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
        carModel="calya"
        title="Toyota Calya 2025 - Auto2000 Way Halim Bandar Lampung | MPV Keluarga"
        description="Toyota Calya 2025 MPV keluarga terjangkau di Auto2000 Way Halim Bandar Lampung. Mobil keluarga dengan ruang luas dan harga ekonomis."
        keywords="toyota calya, calya 2025, calya bandar lampung, mpv keluarga, mobil keluarga murah, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/calya"
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
          <img src={HERO_IMAGE} alt={`${CAR_NAME} Hero`} className="w-full h-auto" />
        </section>

        <section className="py-12 px-4 md:px-8 lg:px-16">
          <h1 className="text-3xl md:text-4xl font-normal text-center text-black uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>TOYOTA CALYA</h1>
          <p className="text-base md:text-lg text-gray-500 text-center mt-4 max-w-4xl mx-auto">
            Toyota Calya adalah MPV keluarga yang dirancang untuk memberikan kenyamanan dan efisiensi. Dengan ruang kabin yang luas dan fitur-fitur modern, Calya siap menemani setiap perjalanan Anda.
          </p>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-normal text-center text-black mb-10 uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>Pilihan Warna & Tipe Varian</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              
              <div className="w-full md:col-span-1 flex flex-col items-center md:items-start">
                <ul className="w-full max-w-sm">
                  {colorVariants.map((color) => (
                    <li key={color.name} onClick={() => setSelectedColor(color)} className={`flex items-center gap-4 p-3 mb-2 rounded-lg cursor-pointer transition-all duration-300 ${selectedColor.name === color.name ? 'border-2 border-blue-500 bg-gray-50' : 'bg-gray-200 hover:bg-gray-300'}`}>
                      <img src={color.img} alt={color.name} className="w-16 h-12 object-cover rounded-md" />
                      <span className={`font-semibold text-base ${selectedColor.name === color.name ? 'text-blue-800' : 'text-gray-800'}`}>{color.name}</span>
                      {selectedColor.name === color.name && (
                        <svg className="w-6 h-6 text-blue-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full md:col-span-2 flex-grow flex flex-col items-center relative">
                <motion.img key={selectedColor.img} src={selectedColor.img} alt={selectedColor.name} className="w-full max-w-2xl h-auto z-10" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} />
                <div className="mt-8 w-full max-w-2xl mx-auto9491">
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
                    className="mt-6 bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md">
                    Dapatkan Penawaran
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <CarVariety isOpen={isVarietyModalOpen} onClose={() => setIsVarietyModalOpen(false)} documentId={CAR_NAME} onSelectType={handleSelectCarType} />

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
