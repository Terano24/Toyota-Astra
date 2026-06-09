import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import LandingNavbar from '../common/LandingNavbar';
import InquiryModal from '../common/InquiryModal';
import CarVariety from '../common/CarVariety';
import LoadingSpinner from '../common/LoadingSpinner';
import SEOHead from '../common/SEOHead';
import EnhancedVarietyButton from '../common/EnhancedVarietyButton';
import { useInitialCarVariety } from '../../hooks/useInitialCarVariety';

const CAR_NAME = 'Fortuner 4x2';
const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Fortuner4x2%2F4by2Hero.jpg?alt=media&token=5dec5992-ef2f-43e1-a5de-b489f365eeb7';

const colorVariants = [
    { name: 'Super White', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Fortuner4x2%2F4by2SuperWhite.png?alt=media&token=d79ffd45-9778-44c0-afae-c1fb317e4d84' },
    { name: 'Silver Metallic', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Fortuner4x2%2F4by2SilverMetallic.png?alt=media&token=341041f4-b487-4ee8-8ee4-7cf8bc3e11d9' },
    { name: 'Platinum White', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Fortuner4x2%2F4by2PlatinunWhite.png?alt=media&token=9929099b-2223-4303-92b5-8805b5bc9119' },
    { name: 'Attitude Black', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Fortuner4x2%2F4by2AttiudeBlack.png?alt=media&token=d3969830-3488-4457-ad71-cc9fdec19272' },
];

const exteriorImages = [
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Fortuner4x2%2F4by2ek1.jpg?alt=media&token=972e71dc-7d46-4a24-9bd4-4987e1fbd8f7', title: 'New Front Bumper Spoiler & Grille with GR Emblem', description: 'Desain baru yang gagah dan sporty, memberikan kebanggaan saat berkendara.' },
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Fortuner4x2%2F4by2ek2.jpg?alt=media&token=64ca1766-521b-4c81-a7c4-84de3c601e5d', title: 'New Black Alloy Wheel', description: 'Velg hitam baru yang tangguh, menegaskan citra sporty.' },
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Fortuner4x2%2F4by2ek3.jpg?alt=media&token=9845c7c2-dd7e-4773-a8ff-90d58387c81d', title: 'New GR Side Sticker', description: 'Stiker samping dengan sentuhan racing, memperkuat kesan dinamis.' },
];

const interiorImages = [
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Fortuner4x2%2F4by2In1.jpg?alt=media&token=0453bd72-5198-4a43-a0ad-a9fd20b0a9d0', title: 'New Sporty Interior Design', description: 'Interior mewah dengan kombinasi warna hitam dan aksen merah yang sporty.' },
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Fortuner4x2%2F4by2In2.jpg?alt=media&token=a741162d-9861-464a-a111-e40854492797', title: 'New Head Unit 9 Inch with GR Opening', description: 'Layar sentuh baru yang canggih dengan tampilan pembuka spesial GR.' },
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Fortuner4x2%2F4by2in3.jpg?alt=media&token=9e63fefa-b700-4ffa-8e17-b86c7482d090', title: 'New GR Engine Start/Stop Button', description: 'Tombol start/stop eksklusif dengan logo GR, menambah kesan premium.' },
];

export default function Fortuner4x2Detail() {
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
      if (carProduct && carProduct.price && !isNaN(Number(carProduct.price))) {
        const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(carProduct.price));
        setPrice(formattedPrice);
      }
    };

    fetchProductsAndPrice();
  }, []);

  // Auto-load initial car type for price display
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
        carModel="fortuner"
        title="Toyota Fortuner 4x2 2025 - Auto2000 Way Halim Bandar Lampung | SUV Premium"
        description="Toyota Fortuner 4x2 2025 SUV premium dengan kemampuan off-road di Auto2000 Way Halim Bandar Lampung. SUV tangguh dengan kenyamanan dan teknologi terdepan."
        keywords="toyota fortuner 4x2, fortuner 2025, fortuner bandar lampung, suv premium, suv off-road, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/fortuner-4x2"
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
            <h1 className="text-3xl md:text-4xl font-normal text-center text-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>TOYOTA FORTUNER 4X2</h1>
            <p className="text-base md:text-lg text-gray-500 text-center mt-4 max-w-4xl mx-auto">
            Toyota Fortuner 4x2 adalah SUV premium yang memadukan ketangguhan dan kemewahan. Dengan penggerak dua roda yang efisien, Fortuner 4x2 ideal untuk penggunaan perkotaan namun tetap andal untuk perjalanan jauh. Desain eksterior yang sporty dan interior yang mewah memberikan pengalaman berkendara yang nyaman dan penuh gaya.
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

        <CarVariety isOpen={isVarietyModalOpen} onClose={() => setIsVarietyModalOpen(false)} documentId="Fortuner 4x2" onSelectType={handleSelectCarType} />

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
            <InquiryModal asModal={false} models={products.map(p => p.name)} carInterestPrefill={selectedCarType ? `${CAR_NAME} - ${selectedCarType.name}` : CAR_NAME} />
        </div>
      </div>
    </div>
  );
}
