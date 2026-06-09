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

const CAR_NAME = 'Land Cruiser';
const HERO_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FLandCruiser%2FCruiser.jpg?alt=media&token=5c1457e2-dfc5-40e2-a9cb-5a9985e5dbf5';

const colorVariants = [
  { name: 'Precious White', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FLandCruiser%2FCruiserPreciousWhite.png?alt=media&token=944092cb-1240-4abe-948d-d2cc8d920c7a' },
  { name: 'Attitude Black', img: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FLandCruiser%2FCruiserBlack.png?alt=media&token=083357df-18d9-4a81-83c1-67633494e627' },
];

const exteriorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FLandCruiser%2FCRUISEREX1.jpg?alt=media&token=2e45ebf0-7ed0-4ae5-8ce9-243e1926a15c', title: 'Desain Eksterior Mewah', description: 'Tampilan yang gagah dan mewah, menegaskan statusnya sebagai SUV premium.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FLandCruiser%2FCruiserEx2.jpg?alt=media&token=b5e403fa-9281-448a-bc8c-b53973875838', title: 'Velg Alloy Premium', description: 'Velg alloy dengan desain eksklusif yang menambah kesan tangguh dan elegan.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FLandCruiser%2FCruiserEx3.jpg?alt=media&token=04e879d3-b5be-474e-b590-0374e8c30763', title: 'Lampu Depan LED', description: 'Lampu depan LED canggih yang memberikan penerangan superior dan tampilan modern.' },
];

const interiorImages = [
    { id: 1, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FLandCruiser%2FCruiserin1.jpg?alt=media&token=daa3a1f1-32b4-48d8-8dc8-4a42e70efc37', title: 'Kabin Super Mewah', description: 'Interior yang dirancang dengan material terbaik untuk kenyamanan tak tertandingi.' },
    { id: 2, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FLandCruiser%2FCruiserin2.jpg?alt=media&token=9454d337-ccf0-44f2-9a26-f4b007eb5951', title: 'Dashboard Modern', description: 'Dashboard dengan teknologi terdepan dan desain yang intuitif.' },
    { id: 3, src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FLandCruiser%2FCruiserin3.jpg?alt=media&token=d304c44b-848c-4ac9-bce5-901070b7eb16', title: 'Kenyamanan Kelas Atas', description: 'Kursi penumpang yang luas dan nyaman, memastikan setiap perjalanan adalah pengalaman premium.' },
];

export default function LandCruiserDetail() {
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
        carModel="land-cruiser"
        title="Toyota Land Cruiser 2025 - Auto2000 Way Halim Bandar Lampung | SUV Premium"
        description="Toyota Land Cruiser 2025 SUV premium off-road di Auto2000 Way Halim Bandar Lampung. Kendaraan mewah dengan kemampuan all-terrain terbaik."
        keywords="toyota land cruiser, land cruiser 2025, suv premium, off road, luxury suv, auto2000 way halim, dealer toyota lampung"
        url="https://auto2000wayhalim.com/land-cruiser"
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
          <h1 className="text-3xl md:text-4xl font-normal text-center text-black uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>TOYOTA LAND CRUISER</h1>
          <p className="text-base md:text-lg text-gray-500 text-center mt-4 max-w-4xl mx-auto">
            Toyota Land Cruiser adalah SUV legendaris yang memadukan kemewahan, ketangguhan, dan teknologi canggih. Siap menemani setiap petualangan Anda dengan performa tak tertandingi di segala medan.
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

        <CarVariety isOpen={isVarietyModalOpen} onClose={() => setIsVarietyModalOpen(false)} documentId="Landcruiser" onSelectType={handleSelectCarType} />

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
