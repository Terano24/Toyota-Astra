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

const CAR_NAME = 'Hilux 4x4';
const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x4%2FH44.jpg?alt=media&token=5c94a124-830a-45fd-ad22-6d0ecc37183f';

const colorVariants = [
  { name: 'Attitude Black', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x4%2FH44AttitudeBlack.png?alt=media&token=7fe2ca18-1e7a-40fa-8c1d-ac35d7118305' },
  { name: 'Super White', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x4%2FH44-SuperWhite.png?alt=media&token=17723ea1-a566-489f-a6e4-e138cf043f7d' },
  { name: 'Silver Metallic', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x4%2FH44-Silver%20Metallic.png?alt=media&token=71a41914-a4af-4600-98e7-e89b704efef7' },
  { name: 'Dark Grey', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x4%2FH44-DaryGray.png?alt=media&token=2c332910-e6f9-4d81-ae5a-a97cdf77ffb7' },
];

const exteriorImages = [
  { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x4%2FH44-eX1.jpg?alt=media&token=42dda6f1-8058-4682-855f-b529d094cda8', title: 'Desain Off-Road Modern', description: 'Tampilan gagah yang memadukan kekuatan dan gaya, siap untuk petualangan di segala medan.' },
  { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x4%2FH44-EX2.jpg?alt=media&token=215bc257-6001-41c1-a9c9-19601bb205cb', title: 'Velg Alloy Tangguh', description: 'Velg alloy berdesain sporty yang tidak hanya kuat namun juga menambah kesan premium.' },
  { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x4%2FH44-EX3.jpg?alt=media&token=215bc257-6001-41c1-a9c9-19601bb205cb', title: 'Lampu LED Canggih', description: 'Penerangan maksimal dengan lampu depan LED yang tajam untuk visibilitas superior.' },
];

const interiorImages = [
  { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x4%2FH44-in1.jpg?alt=media&token=07b793a1-8afb-4652-b56b-e59755416e8e', title: 'Kabin Premium & Lapang', description: 'Interior mewah dengan material berkualitas tinggi, memberikan kenyamanan maksimal.' },
  { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x4%2FH44-IN2.jpg?alt=media&token=ed6b1617-b12f-4a55-8766-ea2fb241b2a7', title: 'Sistem Hiburan Terintegrasi', description: 'Layar sentuh canggih dengan konektivitas smartphone untuk hiburan tanpa batas.' },
  { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/4x4%2FH44-IN3.jpg?alt=media&token=1aca75e2-2742-404d-8878-09091387e81e', title: 'Kontrol Pengemudi Intuitif', description: 'Panel instrumen modern dan setir multifungsi untuk kontrol penuh saat berkendara.' },
];

export default function Hilux4x4Detail() {
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
      if (carProduct && carProduct.price && !isNaN(Number(carProduct.price))) {
        const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(carProduct.price));
        setPrice(formattedPrice);
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
        carModel="hilux-4x4"
        title="Toyota Hilux 4x4 2025 - Auto2000 Way Halim Bandar Lampung | Pickup 4WD"
        description="Toyota Hilux 4x4 2025 pickup tangguh dengan sistem 4WD di Auto2000 Way Halim Bandar Lampung. Double cabin off-road dengan performa prima."
        keywords="toyota hilux 4x4, hilux 4x4 2025, pickup 4wd, off road, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/hilux-4x4"
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
          <h1 className="text-3xl md:text-4xl font-normal text-center text-black uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>TOYOTA HILUX 4X4</h1>
          <p className="text-base md:text-lg text-gray-500 text-center mt-4 max-w-4xl mx-auto">
            Toyota Hilux 4x4 adalah pickup tangguh yang dirancang untuk menaklukkan segala medan. Dengan performa mesin yang andal dan desain yang kokoh, Hilux 4x4 siap menjadi partner setia untuk petualangan dan pekerjaan berat Anda.
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

        <CarVariety isOpen={isVarietyModalOpen} onClose={() => setIsVarietyModalOpen(false)} documentId="Hilux 4x4" onSelectType={handleSelectCarType} />

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
