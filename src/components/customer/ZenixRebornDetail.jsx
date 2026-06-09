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


const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FReborn%2FKijang.jpg?alt=media&token=f7c34b26-db86-4d42-bc36-29d0d27a86b8';
const CAR_NAME = 'Kijang Innova';
const PAGE_TITLE = 'TOYOTA INNOVA REBORN 2025';
const PAGE_DESCRIPTION = 'Toyota Kijang Innova Reborn, generasi kedua dari Toyota Kijang Innova yang diluncurkan pada tahun 2015. Hubungi sales Auto2000 untuk informasi lengkap dan promo menarik.';

const colorVariants = [
  { name: 'Super White', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FReborn%2FKijangSuperWhite.png?alt=media&token=545f0dbc-1694-45ff-925e-0df57f1f68ad' },
  { name: 'Silver Metallic', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FReborn%2FKijangSilverMetallic.png?alt=media&token=b437852e-a08b-4750-8344-723da9649ea3' },
  { name: 'Attitude Black', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FReborn%2FKijangAttitudeBlack.png?alt=media&token=578c0526-1f48-42f5-8dab-098d790ccff4' },
  { name: 'Dark Gray Mica Metallic', image: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FReborn%2FKijangDarkGray.png?alt=media&token=f37003cf-d7ff-48fc-9424-47755d75aaee' },
];

const exteriorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FReborn%2FKijangEx.jpg?alt=media&token=8196ce43-322f-4ef3-a03e-dd8d148f2f14', title: 'New Grille Design', description: 'Tampilan grille trapezoid dengan aksen dark chrome yang gagah.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FReborn%2FKijangEx2.jpg?alt=media&token=e76e06ea-6905-41c7-9eb0-623ed8d47fa8', title: 'New Rear Bumper', description: 'Desain bumper belakang yang lebih kokoh dan terintegrasi.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FReborn%2FKijangex3.jpg?alt=media&token=7c0fd30b-ce2d-45f5-b56d-c0c3cc9ca912', title: 'Two Toned 16” Alloy Wheel', description: 'Velg alloy 16 inci dengan desain dua warna yang sporty.' },
];

const interiorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FReborn%2FKijangIn1.jpg?alt=media&token=5bdfb000-8a8f-4d3c-9410-29d662379d7f', title: 'Captain Seat (V Type)', description: 'Kenyamanan premium dengan captain seat untuk penumpang baris kedua.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FReborn%2FKijangIn2.jpg?alt=media&token=42be58d0-e34f-4fc7-af54-0e7b018d30cc', title: 'Illuminated Entry System', description: 'Ambient light yang memberikan kesan mewah saat masuk ke dalam kabin.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FReborn%2FKijangIn3.jpg?alt=media&token=65eef5d7-e1df-4242-aab2-ad7da5468431', title: '9” Head Unit with Smartphone Connectivity', description: 'Sistem hiburan canggih dengan layar sentuh 9 inci.' },
];

export default function ZenixRebornDetail() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [products, setProducts] = useState([]);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVarietyModalOpen, setIsVarietyModalOpen] = useState(false);
  const [selectedCarType, setSelectedCarType] = useState(null);
  const [selectedColor, setSelectedColor] = useState(colorVariants[0]);
  const [swipeHandlers, setSwipeHandlers] = useState(null);
  const [price, setPrice] = useState(null);
  const inquiryRef = useRef(null);

  const handleSelectCarType = (type) => {
    const priceNumber = parseInt(String(type.price).replace(/[^0-9]/g, ''), 10);
    setSelectedCarType({ ...type, price: priceNumber });
    setIsVarietyModalOpen(false);
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

  const openVarietyModal = () => setIsVarietyModalOpen(true);
  const closeVarietyModal = () => setIsVarietyModalOpen(false);

  const handleInquiryClick = () => {
    if (inquiryRef.current) {
      inquiryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }; 

  const carModels = products.map(p => p.name);

  return (
    <div className="bg-white font-montserrat overflow-x-hidden swipe-container" {...(swipeHandlers || {})}>
      <SEOHead 
        carModel="innova-zenix"
        title="Toyota Innova Zenix 2025 - Auto2000 Way Halim Bandar Lampung | Promo Terbaru"
        description="Toyota Innova Zenix 2025 terbaru di Auto2000 Way Halim Bandar Lampung. MPV premium dengan teknologi hybrid, interior mewah, dan performa terdepan. Promo menarik dan kredit mudah tersedia."
        keywords="toyota innova zenix, innova zenix 2025, innova zenix bandar lampung, innova zenix lampung, mpv toyota, hybrid toyota, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/innovareborn"
      />
      {!heroImageLoaded && <LoadingSpinner />} 
      <div className={`transition-opacity duration-500 ${heroImageLoaded ? 'opacity-100' : 'opacity-0'}`}>
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
            <h2 className="text-3xl uppercase md:text-4xl font-normal text-center text-black mb-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>PILIHAN WARNA & TIPE VARIAN</h2>
            <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start justify-center">
              <div className="w-full md:w-1/3 flex flex-col items-center md:items-start">
                <ul className="w-full max-w-sm">
                  {colorVariants.map((color) => (
                    <li key={color.name} onClick={() => setSelectedColor(color)} className={`flex items-center gap-2 p-2 mb-2 rounded-full cursor-pointer transition-all duration-300 text-sm font-medium ${selectedColor.name === color.name ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'}`} style={{ minHeight: '44px', minWidth: '120px' }}>
                      <img src={color.image} alt={color.name} className="w-12 h-8 object-cover rounded-full border" />
                      <span className={`ml-2 ${selectedColor.name === color.name ? 'text-blue-800' : 'text-gray-800'}`}>{color.name}</span>
                      {selectedColor.name === color.name && (
                        <svg className="w-5 h-5 text-blue-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full md:w-2/3 flex-grow flex flex-col items-center">
                <motion.img key={selectedColor.image} src={selectedColor.image} alt={selectedColor.name} className="w-full max-w-2xl h-auto rounded-lg" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} />
                <div className="mt-8 w-full max-w-2xl text-center flex flex-col items-center">
                  <EnhancedVarietyButton 
                    selectedCarType={selectedCarType}
                    onClick={openVarietyModal}
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
                    className="mt-6 bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md"
                  >
                    Dapatkan Penawaran
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 px-4">
          <h2 className="text-3xl font-bold text-center text-black mb-10">Eksterior</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {exteriorImages.map(img => (
              <div key={img.id} className="text-center flex flex-col">
                <img src={img.src} alt={img.title} className="w-full h-auto object-cover rounded-lg shadow-md" />
                <h3 className="text-xl font-semibold mt-4">{img.title}</h3>
                <p className="text-gray-500 mt-2 flex-grow">{img.description}</p>
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

        <CarVariety
          isOpen={isVarietyModalOpen}
          onClose={closeVarietyModal}
          documentId={CAR_NAME}
          onSelectType={handleSelectCarType}
        />

        <div ref={inquiryRef}>
          <InquiryModal asModal={false} models={carModels} carInterestPrefill={selectedCarType ? `${CAR_NAME} - ${selectedCarType.name}` : CAR_NAME} />
        </div>
      </div>
    </div>
  );
}
