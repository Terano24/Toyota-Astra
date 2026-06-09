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
const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCorollaGR%2FCrlHero.jpg?alt=media&token=0ec80562-31c3-4254-92e7-a3dcd4035367';

const colorVariants = [
  { name: 'Emotional Red', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCorollaGR%2FCrlEmotionalRed.png?alt=media&token=c112eb82-46a5-435e-88d9-adab1f9398e2' },
  { name: 'Precious Metal', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCorollaGR%2FCrlPreciousMetal.png?alt=media&token=2894ecd5-26e9-4774-bbeb-c4e6ffe01647' },
  { name: 'Super White', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCorollaGR%2FCrBlack.png?alt=media&token=a2932410-e54a-4573-b54f-11a703c63e3d' },
];

const exteriorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCorollaGR%2FCrLeX11.jpg?alt=media&token=bdcf036f-af40-49f9-beac-e3a734117871', title: 'Tampilan Depan Agresif', description: 'Grill depan yang besar dan lampu LED tajam.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCorollaGR%2FCrLeX2.jpg?alt=media&token=7dbe206d-bf1a-49e9-bf98-b8257a3e3993', title: 'Siluet Aerodinamis', description: 'Desain bodi yang dioptimalkan untuk performa.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCorollaGR%2FCrlEx3.jpg?alt=media&token=9937a57a-b11f-469e-8577-a3e8e8a0088a', title: 'Spoiler Belakang Sporty', description: 'Meningkatkan downforce dan stabilitas.' },
];

const interiorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCorollaGR%2FCRlIn1.jpg?alt=media&token=6958e7f3-46c3-442e-8301-2f0f845573af', title: 'Kabin Berfokus Pengemudi', description: 'Kontrol ergonomis untuk pengalaman berkendara imersif.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCorollaGR%2FCRlin2.jpg?alt=media&token=429ea015-f999-4196-89b6-c3620a51a73f', title: 'Kursi Semi-Bucket', description: 'Memberikan topangan maksimal saat menikung.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCorollaGR%2FCrlin3.jpg?alt=media&token=01335163-d69c-4a3f-a74d-aa02b1738dc4', title: 'Meter Kombinasi Digital', description: 'Tampilan informasi lengkap dan mudah dibaca.' },
];

const CAR_NAME = 'GR Corolla';
const PAGE_TITLE = 'TOYOTA GR COROLLA';
const PAGE_DESCRIPTION = 'Rasakan adrenalin di setiap tikungan dengan GR Corolla, sebuah mahakarya rekayasa yang lahir dari DNA motorsport Toyota GAZOO Racing.';

// --- END OF ASSETS ---

export default function GRCorollaDetail() {
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
      if (carProduct && carProduct.price && !isNaN(Number(carProduct.price))) {
        const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(carProduct.price));
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

  const carModels = products.map(p => p.name);

  return (
    <div className="bg-white font-montserrat overflow-x-hidden swipe-container" {...(swipeHandlers || {})}>
      <SEOHead 
        carModel="gr-corolla"
        title="Toyota GR Corolla 2025 - Auto2000 Way Halim Bandar Lampung | Hot Hatch"
        description="Toyota GR Corolla 2025 hot hatch dengan performa balap di Auto2000 Way Halim Bandar Lampung. Hatchback sporty dengan teknologi racing."
        keywords="toyota gr corolla, gr corolla 2025, hot hatch, hatchback sporty, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/gr-corolla"
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
            documentId={CAR_NAME}
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
