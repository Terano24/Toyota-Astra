import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingNavbar from '../common/LandingNavbar';
import CarCardCarousel from '../common/CarCardCarousel';
import { db } from '../../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import InquiryModal from '../common/InquiryModal';
import AboutUs from '../common/AboutUs';
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import FilterModal from '../common/FilterModal';
import LoadingSpinner from '../common/LoadingSpinner';
import ChatWidget from '../common/ChatWidget';

const CAR_TYPES = [
  { key: 'ALL', label: 'All' },
  { key: 'SUV', label: 'SUV' },
  { key: 'HATCHBACK', label: 'Hatchback' },
  { key: 'MPV', label: 'MPV' },
  { key: 'SEDAN', label: 'Sedan' },
  { key: 'HYBRID', label: 'Hybrid' },
  { key: 'KOMERSIAL', label: 'Komersial' },
  { key: 'SPORTS', label: 'Sports' },
];

const carouselImages = [
  {
    src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Rush%2FHero-Rush.jpg?alt=media&token=8c94d16e-9179-4150-b76c-1ad9d2178a36',
    alt: 'Toyota Rush',
    title: 'Toyota Rush',
    subtitle: 'SUV Tangguh untuk Petualangan Keluarga',
    link: '/rush',
  },
  {
    src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FReborn%2FKijang.jpg?alt=media&token=f7c34b26-db86-4d42-bc36-29d0d27a86b8',
    alt: 'Toyota Innova Reborn',
    title: 'Toyota Innova Reborn',
    subtitle: 'MPV Premium untuk Keluarga Modern',
    link: '/innovareborn',
  },
  {
    src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FCalya%2FCalya.jpg?alt=media&token=fa63cb4d-5979-420d-9541-6bde69bc0b5c',
    alt: 'Toyota Calya',
    title: 'Toyota Calya',
    subtitle: 'MPV Keluarga yang Ekonomis dan Nyaman',
    link: '/calya',
  },
  {
    src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/Fortuner4x2%2F4by2Hero.jpg?alt=media&token=5dec5992-ef2f-43e1-a5de-b489f365eeb7',
    alt: 'Toyota Fortuner 4x2',
    title: 'Toyota Fortuner 4x2',
    subtitle: 'SUV Premium dengan Performa Handal',
    link: '/fortuner-4x2',
  },
  {
    src: 'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/SinglePage%2FAvanza%2FAvaHero.jpg?alt=media&token=6640df6c-d88e-4c04-969e-010892843a2d',
    alt: 'Toyota Avanza',
    title: 'Toyota Avanza',
    subtitle: 'MPV Terpercaya untuk Keluarga Indonesia',
    link: '/avanza',
  }
];

const LandingPage = () => {
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    sortOrder: 'default',
    priceRange: null, 
  });

  const parsePrice = (priceString) => {
    if (!priceString || typeof priceString !== 'string') return 0;
    return parseInt(priceString.replace(/[^0-9]/g, ''), 10);
  };

  const location = useLocation();
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedType, setSelectedType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Chat widget state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatCustomerData, setChatCustomerData] = useState(null);
  const CHAT_ENABLED = true; // Enabled with real Twilio credentials

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Use a timeout to ensure the page has rendered completely
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);
  
  // Preload critical assets
  useEffect(() => {
    const criticalImages = [
      // Hero carousel images
      ...carouselImages.map(img => img.src),
      // Key section images
      'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2FAboutUs.png?alt=media&token=e3c997ff-351e-497b-9f61-27eb05833305',
      'https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2FWayHalim%20(1).png?alt=media&token=e3c997ff-351e-497b-9f61-27eb05833305'
    ];

    const preloadImage = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continue even if image fails to load
        img.src = src;
      });
    };

    const preloadAllImages = async () => {
      try {
        await Promise.all(criticalImages.map(src => preloadImage(src)));
        setAssetsLoaded(true);
      } catch (error) {
        console.log('Some images failed to preload, continuing anyway');
        setAssetsLoaded(true);
      }
    };

    preloadAllImages();
  }, []);

  // Fetch products from Firestore
  useEffect(() => {
    async function fetchProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          if (data.name === 'Kijang Innova') {
            return { id: doc.id, ...data, name: 'Innova Reborn' };
          }
          return { id: doc.id, ...data };
        });
        setProducts(productsData);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error fetching products:', error);
        setDataLoaded(true); // Continue even if data fails to load
      }
    }
    fetchProducts();
  }, []);

  // Update loading state when both assets and data are ready
  useEffect(() => {
    if (assetsLoaded && dataLoaded) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [assetsLoaded, dataLoaded]);



  const { minPossiblePrice, maxPossiblePrice } = React.useMemo(() => {
    if (products.length === 0) return { minPossiblePrice: 0, maxPossiblePrice: 3000000000 };
    const prices = products.map(p => parsePrice(p.price)).filter(p => p > 0 && !isNaN(p));
    if (prices.length === 0) return { minPossiblePrice: 0, maxPossiblePrice: 3000000000 };
    return { minPossiblePrice: Math.min(...prices), maxPossiblePrice: Math.max(...prices) };
  }, [products]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setFilterModalOpen(false);
    setSelectedType('ALL'); // Reset category when advanced filters are applied
  };

  const handleResetFilters = () => {
    setFilters({
      sortOrder: 'default',
      priceRange: [minPossiblePrice, maxPossiblePrice],
    });
    setFilterModalOpen(false);
  };

  const filteredProducts = React.useMemo(() => {
    let tempProducts = [...products];

    // Category filter (only if no advanced filters are active)
    if (selectedType !== 'ALL' && filters.sortOrder === 'default' && !filters.priceRange) {
        tempProducts = tempProducts.filter(p => p.type === selectedType);
    } else {
        // Price filter
        if (filters.priceRange) {
            tempProducts = tempProducts.filter(p => {
                const price = parsePrice(p.price);
                return price >= filters.priceRange[0] && price <= filters.priceRange[1];
            });
        }

        // Sorting
        switch (filters.sortOrder) {
            case 'price-asc':
                tempProducts.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
                break;
            case 'price-desc':
                tempProducts.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
                break;
            case 'az':
                tempProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'za':
                tempProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                // Custom default sort order
                const customOrder = ['Rush', 'Innova Zenix Hybrid', 'Innova Reborn', 'Avanza'];
                tempProducts.sort((a, b) => {
                  const indexA = customOrder.indexOf(a.name);
                  const indexB = customOrder.indexOf(b.name);

                  if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB; // Both are in custom order, sort by it
                  }
                  if (indexA !== -1) {
                    return -1; // A is in custom order, B is not. A comes first.
                  }
                  if (indexB !== -1) {
                    return 1; // B is in custom order, A is not. B comes first.
                  }
                  return a.name.localeCompare(b.name); // Neither are in custom order, sort alphabetically.
                });
                break;
        }
    }

    return tempProducts;
  }, [products, selectedType, filters]);

  const [selectedCarForInquiry, setSelectedCarForInquiry] = useState('');

  const handleCardClick = (product) => {
    setSelectedCarForInquiry(product.name);
    setInquiryModalOpen(true);
  };

  // Auto-advance carousel - 7 second interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Handle scroll for navbar and window resize
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      console.log('Scroll event triggered:', { 
        scrollY: window.scrollY, 
        scrolled, 
        documentHeight: docHeight,
        bodyScrollHeight: document.body.scrollHeight,
        documentScrollHeight: document.documentElement.scrollHeight,
        windowHeight: window.innerHeight,
        isScrollable: docHeight > window.innerHeight
      });
      setIsScrolled(scrolled);
    };
    
    const handleResize = () => {
      // Mobile menu state is now managed internally by LandingNavbar
      // No need to handle resize here
    };
    
    // Wait for content to render before setting up scroll handlers
    const setupScrollHandlers = () => {
      // Add scroll listener
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
      
      // Also add to document for better compatibility
      document.addEventListener('scroll', handleScroll, { passive: true });
      
      // Initial check
      handleScroll();
      
      console.log('Scroll listeners attached:', {
        windowScrollY: window.scrollY,
        documentHeight: document.documentElement.scrollHeight,
        windowHeight: window.innerHeight,
        isScrollable: document.documentElement.scrollHeight > window.innerHeight
      });
    };
    
    // Wait for content to render
    const timer = setTimeout(() => {
      setupScrollHandlers();
    }, 1000); // Wait 1 second for content to fully render
    
    // Also set up handlers immediately in case content is already ready
    if (document.readyState === 'complete') {
      setupScrollHandlers();
    }
    
    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle manual carousel navigation
  const goToSlide = (index) => {
    setCurrentImageIndex(index);
  };

  // Show loading spinner while assets and data are loading
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      <LandingNavbar
        isScrolled={isScrolled}
        products={products}
        onInquiryClick={() => setInquiryModalOpen(true)}
        onFilterClick={() => {
          setFilterModalOpen(true);
        }}
        externalFilters={filters}
      />

      {/* Hero Carousel - Shorter Height on Mobile */}
      <div className="relative h-[55vh] md:h-screen w-full overflow-hidden" style={{ paddingTop: '64px' }}> {/* Shorter on mobile, full on desktop */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={carouselImages[currentImageIndex].src}
              alt={carouselImages[currentImageIndex].alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-end items-end text-right px-6 pt-6 pb-16 sm:p-16 bg-gradient-to-t from-black/60 to-transparent">
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
                <div className="w-full max-w-lg">
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-3xl sm:text-5xl font-bold text-white drop-shadow-md"
                    style={{ fontFamily: 'sans-serif' }}
                  >
                    {carouselImages[currentImageIndex].title}
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="mt-2 text-sm sm:text-lg text-white drop-shadow-md"
                  >
                    {carouselImages[currentImageIndex].subtitle}
                  </motion.p>
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                  >
                    <Link to={carouselImages[currentImageIndex].link} className="mt-4 inline-block bg-white text-gray-900 font-bold py-1 px-3 text-xs rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:bg-red-600 hover:text-white">
                      Pelajari Lebih Lanjut
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mobile Carousel Arrows */}
        <div className="md:hidden absolute top-1/2 left-2 right-2 flex justify-between transform -translate-y-1/2">
          <button 
            onClick={() => setCurrentImageIndex(prev => (prev === 0 ? carouselImages.length - 1 : prev - 1))}
            className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 focus:outline-none"
            aria-label="Previous slide"
          >
            <FaChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={() => setCurrentImageIndex(prev => (prev === carouselImages.length - 1 ? 0 : prev + 1))}
            className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 focus:outline-none"
            aria-label="Next slide"
          >
            <FaChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentImageIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>


      {/* Vehicle Showcase Section - MOBILE FRIENDLY */}
      <section id="vehicles" className="py-8 md:py-16 bg-gray-50 pt-0 mt-8 md:mt-0">
        {/* Centered title and car type tabs */}
        <div className="max-w-4xl mx-auto w-full px-2 sm:px-4">
          <div className="mb-4 mt-0">
            <h2 className="text-2xl sm:text-5xl font-bold text-gray-900 text-center w-full">Jelajahi Mobil <span className="text-red-600">Toyota Kami</span></h2>
            <p className="text-sm sm:text-lg text-gray-600 font-medium text-center mt-2">Tersedia 7 tipe unik untuk dipilih</p>
          </div>
          {/* Car type tabs: horizontal scroll on mobile only */}
          <div className="flex justify-between items-center mb-4 px-2 sm:px-[5vw]">
            <div className="flex overflow-x-auto scrollbar-hide space-x-2">
              {CAR_TYPES.map((type) => (
                <button
                  key={type.key}
                  onClick={() => {
                    setSelectedType(type.key);
                    setFilters({ sortOrder: 'default', priceRange: null });
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedType === type.key && filters.sortOrder === 'default' && !filters.priceRange
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                  {type.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        <div className="w-full px-2 sm:px-[5vw] mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <CarCardCarousel 
                key={`${filters.sortOrder}-${selectedType}-${filters.priceRange ? filters.priceRange.join('-') : 'default'}`}
                cars={filteredProducts}
                onInquiry={handleCardClick}
              />
            )}
          </div>
      </section>

      <AboutUs />

      {/* Location & Contact Section - Mobile-first Card Layout */}
      <motion.section 
        id="contact-section" 
        className="w-full bg-gray-50 py-12 px-4 sm:px-8"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div 
          className="w-full max-w-6xl md:max-w-7xl mx-auto flex flex-col md:flex-row gap-8 md:gap-0 md:overflow-hidden md:h-[450px] md:rounded-xl md:shadow-lg"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2
              }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >

          {/* Left: Map Card */}
          <motion.div 
            className="relative flex-1 group h-72 md:h-auto rounded-xl shadow-lg overflow-hidden md:rounded-none md:shadow-none"
            variants={{
              hidden: { opacity: 0, x: -60, scale: 0.95 },
              visible: { 
                opacity: 1, 
                x: 0, 
                scale: 1,
                transition: { duration: 0.8, ease: "easeOut" }
              }
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.iframe
              src="https://www.google.com/maps?q=-5.385213,105.286545&z=17&output=embed"
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out md:group-hover:scale-105"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title="Auto2000 Location Map"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent md:bg-black/30 md:group-hover:bg-black/50 transition-colors duration-300 flex flex-col items-center justify-end md:justify-center text-center p-6"
              initial={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              animate={{ backgroundColor: "rgba(0,0,0,0.4)" }}
              whileHover={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              transition={{ duration: 0.3 }}
            >
              <motion.h2 
                className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              >
                Lokasi Kami
              </motion.h2>
              <motion.a 
                href="https://www.google.com/maps/place/Toyota+Auto2000+Way+Halim/@-5.3852075,105.2839893,1032m/data=!3m1!1e3!4m6!3m5!1s0x2e40db3fd457715d:0xf631c75f2ef140ed!8m2!3d-5.3852128!4d105.2865447!16s%2Fg%2F11c2pkb1y3?entry=tts&g_ep=EgoyMDI1MDYxNy4wIPu8ASoASAFQAw%3D%3D&skid=4b176af8-0093-450a-afe9-c97e82c5fa1b" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-3 flex items-center px-5 py-2 border border-white text-sm text-white rounded-md hover:bg-white hover:text-black transition-colors transform hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaMapMarkerAlt className="mr-2" /> Lihat di Peta
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Right: Contact Card */}
          <motion.div 
            className="relative flex-1 group h-72 md:h-auto rounded-xl shadow-lg overflow-hidden md:rounded-none md:shadow-none"
            variants={{
              hidden: { opacity: 0, x: 60, scale: 0.95 },
              visible: { 
                opacity: 1, 
                x: 0, 
                scale: 1,
                transition: { duration: 0.8, ease: "easeOut" }
              }
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.img
              src="https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2FWayHalim%20(1).png?alt=media&token=e3c997ff-351e-497b-9f61-27eb05833305"
              alt="WayHalim Showroom"
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out md:group-hover:scale-105"
              loading="lazy"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent md:bg-black/30 md:group-hover:bg-black/50 transition-colors duration-300 flex flex-col items-center justify-end md:justify-center text-center p-6"
              initial={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              animate={{ backgroundColor: "rgba(0,0,0,0.4)" }}
              whileHover={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              transition={{ duration: 0.3 }}
            >
              <motion.h2 
                className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              >
                Contact WayHalim
              </motion.h2>
              <motion.div 
                className="mt-3 text-white text-sm space-y-1 md:opacity-0 md:transform md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500 ease-in-out"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
              >
                <motion.a 
                  href="https://wa.me/+6281374418818" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center text-white hover:text-red-400 transition-colors duration-300 transform hover:scale-105"
                  whileHover={{ scale: 1.05, color: "#f87171" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaWhatsapp className="mr-2" /> +62 813-7441-8818
                </motion.a>
                <motion.a 
                  href="https://www.instagram.com/auto2000_wayhalim/?hl=en" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                  whileHover={{ scale: 1.05, opacity: 0.8 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaInstagram className="mr-2" /> @auto2000_wayhalim
                </motion.a>
                <motion.a 
                  href="https://www.tiktok.com/@auto2000.wayhalim?_t=ZS-8yD85l5RUqg&_r=1" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                  whileHover={{ scale: 1.05, opacity: 0.8 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTiktok className="mr-2" /> @auto2000_wayhalim
                </motion.a>
              </motion.div>
            </motion.div>
          </motion.div>

        </motion.div>
      </motion.section>

      {/* Inquiry Modal */}
      <InquiryModal
        open={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        models={filteredProducts.map(p => p.name)}
        initialModel={selectedCarForInquiry}
        asModal={true}
      />

      <FilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        products={products}
        initialFilters={{
            sortOrder: filters.sortOrder,
            priceRange: filters.priceRange // Don't provide fallback here, let FilterModal handle it
        }}
      />
      
      {/* Chat Widget - Conditionally rendered */}
      {CHAT_ENABLED && (
        <ChatWidget
          isOpen={chatOpen}
          onToggle={() => setChatOpen(!chatOpen)}
          customerData={chatCustomerData}
        />
      )}
    </div>
  );
};

export default LandingPage;
