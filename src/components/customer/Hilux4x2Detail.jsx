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

const CAR_NAME = 'Hilux 4x2';
const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x2%2F4x2Hilux.jpg?alt=media&token=6edb6eeb-e76b-4744-9bf5-66f352342fca';

const colorVariants = [
  { name: 'Dark Grey', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x2%2F4X2DarkGrey.png?alt=media&token=97435b75-c725-4d4f-97e8-86fb765a1f8f' },
  { name: 'Black', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x2%2F4x2Black.png?alt=media&token=1c0107ce-2c62-4af5-8ae0-0c2579afd9e1' },
  { name: 'Silver Metallic', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x2%2F4x2SilverMetallic.png?alt=media&token=feca2a10-ad46-4fea-8648-72c8bee7c26b' },
  { name: 'Super White', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x2%2F4x2SuperWhite.png?alt=media&token=0e7b7ce1-bfb2-4bb0-93c4-41b1a3bbd663' },
];

const exteriorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x2%2F4x2Ex1.webp?alt=media&token=51f22c36-b6e3-4fac-a43c-2a37f510eba9', title: 'Tampilan Depan Gagah', description: 'Desain modern dan tangguh yang mencerminkan kapabilitasnya di segala medan.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x2%2F4x2Ex2.webp?alt=media&token=bd49bedf-06af-47e9-bb12-2fa28d1af21d', title: 'Profil Samping Aerodinamis', description: 'Garis bodi yang tegas memberikan efisiensi dan stabilitas saat berkendara.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x2%2F4x2Ex3.webp?alt=media&token=f0d47855-d0c8-4d7a-8fa1-8a2bb80ea8b0', title: 'Bak Kargo Luas', description: 'Kapasitas angkut yang besar untuk mendukung segala jenis kebutuhan bisnis Anda.' },
];

const interiorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x2%2F4x2In1.jpg?alt=media&token=4ef7ee35-44c2-49fe-b58d-e9840d24d186', title: 'Kabin Fungsional', description: 'Interior yang dirancang untuk kenyamanan dan kemudahan akses ke semua kontrol.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x2%2F4x2in2.jpg?alt=media&token=f55a5fe2-f4b8-4a32-9e2d-21ce38120364', title: 'Dashboard Modern', description: 'Panel instrumen yang jelas dan mudah dibaca untuk informasi berkendara yang lengkap.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x2%2F4x2in3.jpg?alt=media&token=0c0ab144-a47e-4f0a-93cf-580130c14090', title: 'Kursi Pengemudi Ergonomis', description: 'Posisi duduk yang nyaman untuk mengurangi kelelahan saat perjalanan jauh.' },
];

export default function Hilux4x2Detail() {
  // Standardized state and refs
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

  // Effect for hero image loading
  useEffect(() => {
    const img = new Image();
    img.src = HERO_IMAGE;
    img.onload = () => setHeroImageLoaded(true);
  }, []);

  // Effect for scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Standardized data fetching
  useEffect(() => {
    const fetchProductsAndPrice = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);

      const carProduct = productsData.find(p => p.name === CAR_NAME);
      if (carProduct && carProduct.price) {
        const priceNumber = parseInt(String(carProduct.price).replace(/[^0-9]/g, ''), 10);
        if (!isNaN(priceNumber)) {
          const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(priceNumber);
          setPrice(formattedPrice);
        }
      }
    };

    fetchProductsAndPrice();
  }, []);

  // Load initial car variety to prevent "harga tidak ditemukan" display
  useInitialCarVariety(CAR_NAME, setSelectedCarType);

  // Standardized handler functions
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
        carModel="hilux"
        title="Toyota Hilux 4x2 2025 - Auto2000 Way Halim Bandar Lampung | Pickup Tangguh"
        description="Toyota Hilux 4x2 2025 pickup tangguh untuk kerja dan petualangan di Auto2000 Way Halim Bandar Lampung. Double cabin dengan performa prima dan daya tahan tinggi."
        keywords="toyota hilux 4x2, hilux 2025, hilux bandar lampung, hilux lampung, pickup toyota, double cabin, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/hilux-4x2"
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
            <h1 className="text-3xl md:text-4xl font-normal text-center text-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>TOYOTA HILUX 4X2 2025</h1>
            <p className="text-base md:text-lg text-gray-500 text-center mt-4 max-w-4xl mx-auto">
            Toyota Hilux 4x2 2025 adalah adalah Pickup dengan penggerak dua roda yang siap untuk medan berat. Hubungi sales Auto2000 untuk informasi lengkap dan promo menarik.
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
                                    <img src={color.img} alt={color.name} className="w-16 h-12 object-cover rounded-md" />
                                    <span className={`font-semibold text-base ${selectedColor.name === color.name ? 'text-blue-800' : 'text-gray-800'}`}>{color.name}</span>
                                    {selectedColor.name === color.name && (
                                        <svg className="w-6 h-6 text-blue-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-full md:w-2/3 flex-grow flex flex-col items-center">
                        <motion.img key={selectedColor.img} src={selectedColor.img} alt={selectedColor.name} className="w-full max-w-2xl h-auto" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} />
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
                            <button onClick={handleInquiryClick} className="mt-6 bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md">
                                Dapatkan Penawaran
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <CarVariety isOpen={isVarietyModalOpen} onClose={() => setIsVarietyModalOpen(false)} documentId="Hilux 4x2" onSelectType={handleSelectCarType} />

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

        <section className="py-12 bg-gray-50">
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
            <InquiryModal asModal={false} models={products.map(p => p.name)} carInterestPrefill={selectedCarType ? `${CAR_NAME} - ${selectedCarType.name}` : CAR_NAME} />
        </div>
      </div>
    </div>
  );
}
