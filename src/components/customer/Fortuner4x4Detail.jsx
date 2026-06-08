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

const CAR_NAME = 'Fortuner 4x4';
const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FFortuner%204x4%2F4by4Hero.jpg?alt=media&token=e12a40f7-8866-4540-adad-02f65be0c1a3';

const colorVariants = [
    { name: 'Attitude Black', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FFortuner%204x4%2F4by4AttitudeBlack.png?alt=media&token=0eb7522d-8c13-4cd6-8ace-aa698fccfdc9' },
    { name: 'Black-White', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FFortuner%204x4%2F4by4Black-White.png?alt=media&token=5087cbdd-94e6-4906-b598-604a021db2d6' },
];

const exteriorImages = [
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FFortuner%204x4%2F4by4Ek1.jpg?alt=media&token=b22239ea-ba74-4964-9cf6-05fcc74bad4a', title: 'Desain Eksterior Gagah', description: 'Tampilan depan yang agresif dengan grille dan lampu LED yang tajam.' },
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FFortuner%204x4%2F4by4ek2.jpg?alt=media&token=e82648d3-fe0f-462a-bd65-7103dcc82cf7', title: 'Profil Samping Tangguh', description: 'Garis bodi yang kokoh memberikan kesan tangguh dan siap berpetualang.' },
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FFortuner%204x4%2F4by4ek3.jpg?alt=media&token=b9b18d77-fa88-4ee8-98aa-10ab9188a203', title: 'Tampilan Belakang Modern', description: 'Desain lampu belakang yang tegas dan modern.' },
];

const interiorImages = [
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FFortuner%204x4%2F4by4in1.jpg?alt=media&token=7cbcbfe2-09f1-4d3a-810b-9115b5280ccb', title: 'Kabin Premium & Luas', description: 'Interior mewah dengan material premium dan ruang yang lapang untuk semua penumpang.' },
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FFortuner%204x4%2F4by4in2.jpg?alt=media&token=264a4f09-93a7-4fda-bb5a-5605d5cafbd2', title: 'Dashboard Intuitif', description: 'Dashboard modern dengan panel instrumen yang informatif dan mudah digunakan.' },
    { src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FFortuner%204x4%2F4by4in3.jpg?alt=media&token=4bb13d7c-772a-4018-b41a-c4006c5f1ca7', title: 'Kenyamanan Maksimal', description: 'Kursi yang ergonomis memastikan kenyamanan di setiap perjalanan.' },
];

export default function Fortuner4x4Detail() {
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
      if (carProduct) {
        const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(carProduct.price);
        setPrice(formattedPrice);
      }
    };

    fetchProductsAndPrice();
  }, []);

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
        carModel="fortuner-4x4"
        title="Toyota Fortuner 4x4 2025 - Auto2000 Way Halim Bandar Lampung | SUV 4WD Premium"
        description="Toyota Fortuner 4x4 2025 SUV premium dengan sistem 4WD di Auto2000 Way Halim Bandar Lampung. Kendaraan tangguh untuk petualangan off-road."
        keywords="toyota fortuner 4x4, fortuner 4x4 2025, suv 4wd, off road, suv premium, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/fortuner-4x4"
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
            <h1 className="text-3xl md:text-4xl font-normal text-center text-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>TOYOTA FORTUNER 4X4</h1>
            <p className="text-base md:text-lg text-gray-500 text-center mt-4 max-w-4xl mx-auto">
            Toyota Fortuner 4x4 adalah SUV tangguh yang dirancang untuk menaklukkan segala medan. Dengan sistem penggerak empat roda yang andal, Fortuner 4x4 memberikan performa superior di jalanan off-road maupun perkotaan. Desain eksteriornya yang gagah dan interior premiumnya menawarkan kenyamanan maksimal bagi pengemudi dan penumpang, menjadikannya pilihan ideal untuk petualangan tanpa batas.
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
                                    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedCarType.price)
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

        <CarVariety isOpen={isVarietyModalOpen} onClose={() => setIsVarietyModalOpen(false)} documentId="Fortuner 4x4" onSelectType={handleSelectCarType} />

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
