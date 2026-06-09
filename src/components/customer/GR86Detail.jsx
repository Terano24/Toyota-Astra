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

// --- ASSETS --- 
const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FGR86%2FGERHero.jpg?alt=media&token=777a1e4d-0d7f-4421-8fdb-edca3f0d5ed5';

const colorVariants = [
  { name: 'Sapphire Blue', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FGR86%2FGER%20Sapphire.png?alt=media&token=df5a1938-86ab-4885-b2c7-e220a456cb90' },
  { name: 'Crystal White Pearl', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FGR86%2FGERCrystalWhite.png?alt=media&token=05dd6e82-df2f-4218-bc5c-df1cad8c8f7a' },
  { name: 'Ice Silver Metallic', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FGR86%2FGERIceSIlver.png?alt=media&token=de5a2e6c-f10a-46bd-af0b-809b1c5eb932' },
  { name: 'Ignite Red', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FGR86%2FGERigniteRed.png?alt=media&token=19f54d2a-23df-462e-bcb1-2219237fe358' },
];

const exteriorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FGR86%2FGerex1.jpg?alt=media&token=518b42e6-cae2-4447-aca2-8c0d9c6a8995', title: 'Desain Eksterior Sporty', description: 'Tampilan depan yang agresif dan aerodinamis.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FGR86%2FGerEx2.jpg?alt=media&token=8f2c7e36-2fcb-4803-94a7-182cdc71d4b7', title: 'Profil Samping Ramping', description: 'Garis bodi yang tegas menonjolkan karakter sporty.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FGR86%2FGerEx3.jpg?alt=media&token=917df995-0402-4e40-bd65-63706521b844', title: 'Tampilan Belakang Modern', description: 'Lampu belakang LED dan dual exhaust yang stylish.' },
];

const interiorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FGR86%2FGerIn1.jpg?alt=media&token=d50a904c-74f4-475f-ad4f-bd8bea13dc31', title: 'Kokpit Berorientasi Pengemudi', description: 'Semua kontrol mudah dijangkau untuk fokus berkendara.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FGR86%2FGerIn2.jpg?alt=media&token=4a9502f8-26d1-4e99-aaf1-f8a0d756c8bc', title: 'Kursi Sporty dan Nyaman', description: 'Memberikan dukungan maksimal saat bermanuver.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FGR86%2FGerIn3.jpg?alt=media&token=ee712ce8-afe2-4584-a989-f6425e87154c', title: 'Sistem Infotainment Modern', description: 'Layar sentuh dengan konektivitas lengkap.' },
];

const CAR_NAME = 'GR86';
const PAGE_TITLE = 'TOYOTA GR86';
const PAGE_DESCRIPTION = 'Toyota GR 86 2025 adalah adalah mobil sport dengan handling presisi dan pengalaman berkendara menyenangkan. Hubungi sales Auto2000 untuk informasi lengkap dan promo menarik.';

// --- END OF ASSETS ---

export default function GR86Detail() {
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

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const carModels = products.map(p => p.name);

  return (
    <div className="bg-white font-montserrat overflow-x-hidden swipe-container" {...(swipeHandlers || {})}>
      <SEOHead 
        carModel="gr86"
        title="Toyota GR86 2025 - Auto2000 Way Halim Bandar Lampung | Sports Car"
        description="Toyota GR86 2025 sports car dengan performa tinggi di Auto2000 Way Halim Bandar Lampung. Mobil sport dengan handling presisi dan pengalaman berkendara yang mendebarkan."
        keywords="toyota gr86, gr86 2025, sports car, mobil sport, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/gr86"
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

        <CarVariety
            isOpen={isVarietyModalOpen}
            onClose={() => setIsVarietyModalOpen(false)}
            documentId="GR 86"
            onSelectType={handleSelectCarType}
        />

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
            <InquiryModal asModal={false} models={carModels} carInterestPrefill={selectedCarType ? `${CAR_NAME} - ${selectedCarType.name}` : CAR_NAME} />
        </div>
      </div>
    </div>
  );
}
