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
const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AgyaGR%2FAgyaGR-HERO.jpg?alt=media&token=b8b214e3-6309-498f-84b9-334abb03a1d7';

const colorVariants = [
    { name: 'Black', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AgyaGR%2FBlack-AgyaGr.png?alt=media&token=efcb13f1-53dd-4df3-aad1-97ad49b46fd8' },
    { name: 'Black-Red', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AgyaGR%2FBlack-Red-AgyaGr.png?alt=media&token=0ed6bcb2-9317-4136-a086-fcb826d4a8b4' },
    { name: 'Black-White', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AgyaGR%2FBlack-white-AgyaGr.png?alt=media&token=012f175f-96e2-4880-bed5-05410f9fa937' },
    { name: 'White', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AgyaGR%2FWhite-AgyaGR.png?alt=media&token=095aa6fc-2c08-4e8b-b6fb-bab85ad92789' },
    { name: 'Red', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AgyaGR%2FRed-AgyaGr.png?alt=media&token=72584e44-b8f3-45d9-8444-f20c1f954a15' },
];

const exteriorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AgyaGR%2FEx-AgyaGR1.jpg?alt=media&token=726845eb-d970-4aa2-b76c-72732904074d', title: 'Tampilan Depan Agresif', description: 'Desain bumper depan yang sporty dengan grille GR Sport yang khas.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AgyaGR%2FEx-AgyaGR2.jpg?alt=media&token=659b38fa-edc5-4f3c-94d3-080b7b4b2840', title: 'Velg Alloy Sporty', description: 'Velg berdesain dinamis yang memperkuat kesan sporty dan modern.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AgyaGR%2FEx-AgyaGR3.jpg?alt=media&token=38a2e1d7-2f77-4402-863a-7d4036e59489', title: 'Lampu Belakang Stylish', description: 'Lampu belakang dengan desain modern yang memberikan pencahayaan optimal.' },
];

const interiorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AgyaGR%2FIn-AgyaGR1.jpg?alt=media&token=8e27c00e-1111-447b-8b5e-99042b31495a', title: 'Kabin Sporty', description: 'Interior dengan aksen merah yang memberikan nuansa balap dan sporty.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AgyaGR%2FIn-AgyaGR2.jpg?alt=media&token=87532328-3e47-4959-995a-c454e9512f45', title: 'Dashboard Modern', description: 'Dashboard canggih dengan fitur lengkap untuk kenyamanan berkendara.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AgyaGR%2FIn-AgyaGR3.jpg?alt=media&token=09734e56-11e2-4014-9133-149f9c733604', title: 'Jok Semi-Bucket', description: 'Jok dengan desain semi-bucket yang memberikan dukungan optimal saat bermanuver.' },
];

const CAR_NAME = 'Agya GR';
const PAGE_TITLE = 'TOYOTA AGYA GR SPORT 2025';
const PAGE_DESCRIPTION = 'Rasakan sensasi berkendara yang lebih sporty dengan Toyota Agya GR Sport. Desain aerodinamis dan performa yang ditingkatkan untuk pengalaman yang tak terlupakan.';

export default function AgyaGRDetail() {
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
        carModel="agya"
        title="Toyota Agya GR Sport 2025 - Auto2000 Way Halim Bandar Lampung | Hatchback Sporty"
        description="Toyota Agya GR Sport 2025 hatchback sporty dan stylish di Auto2000 Way Halim Bandar Lampung. Desain agresif dengan performa handal dan harga terjangkau. Promo menarik tersedia."
        keywords="toyota agya gr sport, agya gr 2025, agya gr bandar lampung, agya gr lampung, hatchback sporty toyota, mobil sport murah, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/agya-gr"
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
          <img src={HERO_IMAGE} alt={PAGE_TITLE} className="w-full h-auto" />
        </section>

        <section className="py-12 px-4 md:px-8 lg:px-16">
            <h1 className="text-3xl md:text-4xl font-normal text-center flex flex-col items-center text-black uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>{PAGE_TITLE}</h1>
            <p className="text-base md:text-lg text-gray-500 text-center flex flex-col items-center mt-4 max-w-4xl mx-auto">
                {PAGE_DESCRIPTION}
            </p>
        </section>

        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-normal text-center flex flex-col items-center text-black mb-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>PILIHAN WARNA & TIPE VARIAN</h2>
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
                        <div className="mt-8 w-full max-w-2xl mx-auto10119">
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

        <CarVariety
            isOpen={isVarietyModalOpen}
            onClose={() => setIsVarietyModalOpen(false)}
            documentId={CAR_NAME}
            onSelectType={handleSelectCarType}
        />

        <section className="py-12 px-4">
          <h2 className="text-3xl font-bold text-center flex flex-col items-center text-black mb-10">Eksterior</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {exteriorImages.map(img => (
              <div key={img.id} className="text-center flex flex-col items-center">
                <img src={img.src} alt={img.title} className="w-full h-auto object-cover rounded-lg shadow-md" />
                <h3 className="text-xl font-semibold mt-4">{img.title}</h3>
                <p className="text-gray-500 mt-2">{img.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 px-4 bg-gray-50">
          <h2 className="text-3xl font-bold text-center flex flex-col items-center text-black mb-10">Interior</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {interiorImages.map(img => (
              <div key={img.id} className="text-center flex flex-col items-center">
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
