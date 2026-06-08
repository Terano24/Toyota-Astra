import React, { useState, useEffect, useRef } from 'react';
import LandingNavbar from '../common/LandingNavbar';
import InquiryModal from '../common/InquiryModal';
import CarVariety from '../common/CarVariety';
import { db } from '../../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useInitialCarVariety } from '../../hooks/useInitialCarVariety';
import LoadingSpinner from '../common/LoadingSpinner';
import SEOHead from '../common/SEOHead';
import EnhancedVarietyButton from '../common/EnhancedVarietyButton';
import { motion, AnimatePresence } from 'framer-motion';

const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FSupra%2FSprHero.jpg?alt=media&token=2f76e3b9-b605-4675-b07c-724b39fa038e';

const colorVariants = [
  { name: 'Cupper Gray', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FSupra%2FSPRCupperGray.png?alt=media&token=82856dce-6be9-4ba0-a1ce-89a6cbc632fc' },
  { name: 'Mineral White', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FSupra%2FSPRMineralWhite.png?alt=media&token=e93982af-dc34-4cd0-9717-e9c8cae9b8a0' },
  { name: 'Black Metallic', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FSupra%2FSprBlackMetallic.png?alt=media&token=ff78582b-08e3-4e85-8f27-a0e8d501d832' },
  { name: 'Prominence Red', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FSupra%2FSprProminenceRed.png?alt=media&token=5dd87b33-a311-4e94-941b-fd9416bcfc62' },
];

const exteriorImages = [
  { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FSupra%2FSPREdx1.jpg?alt=media&token=9134011c-e020-4f66-bd66-473f343a96f3' },
  { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FSupra%2FSPREx2.jpg?alt=media&token=c65e7911-2e22-400f-8e0c-1bf7939b6802' },
  { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FSupra%2FSprEx3.webp?alt=media&token=5cfb69bf-f039-43fe-ae8e-c329fd7dbecf' },
];

const interiorImages = [
  { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FSupra%2FSPRin1.jpg?alt=media&token=ea6a69e5-e77e-403e-b62a-d313871634a9' },
  { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FSupra%2FSPRin2.jpg?alt=media&token=0099aa97-319d-44f0-9f51-ca8c9bd263cd' },
  { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FSupra%2FSPRin3.jpg?alt=media&token=7755aeb0-e75a-48c6-b1a1-85778a9252ca' },
];

const CAR_NAME = 'Supra';

export default function SupraDetail() {
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [products, setProducts] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVarietyModalOpen, setIsVarietyModalOpen] = useState(false);
  const [selectedCarType, setSelectedCarType] = useState(null);
  const [price, setPrice] = useState(null);
  const [selectedColor, setSelectedColor] = useState(colorVariants[0]);
  const [swipeHandlers, setSwipeHandlers] = useState(null);
  const inquiryFormRef = useRef(null);

  useEffect(() => {
    const images = [
      HERO_IMAGE,
      ...colorVariants.map(c => c.img),
      ...exteriorImages.map(i => i.src),
      ...interiorImages.map(i => i.src)
    ];
    let loadedImages = 0;
    images.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedImages++;
        if (loadedImages === images.length) {
          setIsLoading(false);
        }
      };
    });
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

      const carProduct = productsData.find(p => p.name === CAR_NAME);
      if (carProduct && carProduct.price) {
        const priceNumber = parseInt(String(carProduct.price).replace(/[^0-9]/g, ''), 10);
        if (!isNaN(priceNumber)) {
          const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(priceNumber);
          setPrice(formattedPrice);
        }
      }
    }
    fetchProductsAndPrice();
  }, []);

  // Load initial car variety to prevent "harga tidak ditemukan" display
  useInitialCarVariety(CAR_NAME, setSelectedCarType);

  useEffect(() => {
    if (selectedCarType && selectedCarType.price) {
        const priceNumber = parseInt(String(selectedCarType.price).replace(/[^0-9]/g, ''), 10);
        if (!isNaN(priceNumber)) {
            const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(priceNumber);
            setPrice(formattedPrice);
        } else {
            setPrice('Harga tidak tersedia');
        }
    } else {
        setPrice(null);
    }
  }, [selectedCarType]);

  const handleInquiryClick = () => {
    inquiryFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const carModels = products.map(p => p.name);

  return (
    <div className="bg-white font-montserrat overflow-x-hidden swipe-container" {...(swipeHandlers || {})}>
      <SEOHead 
        carModel="supra"
        title="Toyota Supra 2025 - Auto2000 Way Halim Bandar Lampung | Sports Car Legendaris"
        description="Toyota Supra 2025 sports car legendaris dengan performa tinggi di Auto2000 Way Halim Bandar Lampung. Mobil sport ikonik dengan teknologi canggih."
        keywords="toyota supra, supra 2025, sports car, mobil sport legendaris, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/supra"
      />
      {isLoading && <LoadingSpinner />}
      <div style={{ visibility: isLoading ? 'hidden' : 'visible' }} className="min-h-screen bg-white font-montserrat">
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

        <section className="relative w-full h-screen">
          <img
            src={HERO_IMAGE}
            alt="Toyota Supra Hero"
            className="w-full h-full object-cover"
          />
        </section>
        
        <section className="w-full bg-white py-16 flex flex-col items-center text-center px-4">
          <h2 className="text-3xl md:text-4xl font-normal uppercase" style={{fontFamily:'Montserrat, sans-serif'}}>TOYOTA SUPRA 2025</h2>
          <p className="text-base md:text-lg text-gray-500 max-w-3xl mt-4">
            Toyota GR Supra 2025 adalah adalah Mobil sport dengan performa tinggi dan desain ikonik. Hubungi sales Auto2000 untuk informasi lengkap dan promo menarik.
          </p>
        </section>

        <section id="color-variant-section" className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 flex flex-col items-center">
            <h2 className="text-3xl font-normal w-full max-w-2xl text-center flex flex-col items-center mb-2">PILIHAN WARNA & TIPE VARIAN</h2>
            <p className="text-center text-gray-500 mb-10">Tersedia dalam {colorVariants.length} pilihan warna</p>
            
            <div className="flex flex-col md:flex-row gap-12 items-start justify-center w-full">
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
              <div className="w-full md:w-2/3 flex flex-col items-center">
                <div className="relative w-full max-w-4xl">
                  <AnimatePresence mode='wait'>
                    <motion.img
                      key={selectedColor.name}
                      src={selectedColor.img}
                      alt={selectedColor.name}
                      className="select-none pointer-events-none w-full object-contain drop-shadow-lg"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>
                </div>
                <div className="mt-8 text-center flex flex-col items-center">
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

        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 flex flex-col items-center">
            <h3 className="text-3xl font-normal w-full max-w-2xl text-center flex flex-col items-center mb-8">Eksterior</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {exteriorImages.map((image) => (
                <div key={image.id} className="overflow-hidden rounded-lg shadow-lg">
                  <img src={image.src} alt={`Exterior ${image.id}`} className="w-full h-full object-cover"/>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 flex flex-col items-center">
            <h3 className="text-3xl font-normal w-full max-w-2xl text-center flex flex-col items-center mb-8">Interior</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {interiorImages.map((image) => (
                <div key={image.id} className="overflow-hidden rounded-lg shadow-lg">
                  <img src={image.src} alt={`Interior ${image.id}`} className="w-full h-full object-cover"/>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <div ref={inquiryFormRef}>
          <InquiryModal
            asModal={false}
            models={carModels}
            carInterestPrefill="Supra"
          />
        </div>

        <CarVariety 
          isOpen={isVarietyModalOpen}
          onClose={() => setIsVarietyModalOpen(false)}
          documentId="Supra"
          onSelectType={type => setSelectedCarType(type)}
        />
      </div>
    </div>
  );
}
