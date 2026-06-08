import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { FiMenu, FiX, FiChevronDown, FiFilter } from 'react-icons/fi';
import { FaTiktok, FaInstagram } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { db } from '../../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

const categories = ['ALL', 'HATCHBACK', 'HYBRID', 'KOMERSIAL', 'MPV', 'SEDAN', 'SPORTS', 'SUV'];
const sortOptions = [
  { key: 'default', label: 'Default' },
  { key: 'price-asc', label: 'Harga Terendah' },
  { key: 'price-desc', label: 'Harga Tertinggi' },
  { key: 'name-asc', label: 'Nama A-Z' },
  { key: 'name-desc', label: 'Nama Z-A' },
];

export default function LandingNavbar({ products: initialProducts = [], onInquiryClick, isScrolled, onFilterClick, externalFilters = null }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);

  useEffect(() => {
    const fetchProducts = async () => {
      if (products.length === 0) {
        try {
          const querySnapshot = await getDocs(collection(db, 'products'));
          const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProducts(productsData);
        } catch (error) {
          console.error("Error fetching products: ", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProducts();
  }, [products.length]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vehiclesOpen, setVehiclesOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const minPossiblePrice = useMemo(() => Math.min(...products.map(p => p.price), 0), [products]);
  const maxPossiblePrice = useMemo(() => Math.max(...products.map(p => p.price), 0), [products]);

  const [priceRange, setPriceRange] = useState([minPossiblePrice, maxPossiblePrice]);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);

  useEffect(() => {
    if (products.length > 0) {
      setPriceRange([minPossiblePrice, maxPossiblePrice]);
    }
  }, [products, minPossiblePrice, maxPossiblePrice]);

  useEffect(() => {
    if (externalFilters) {
      setSelectedCategory(externalFilters.category || 'ALL');
      setPriceRange(externalFilters.priceRange || [minPossiblePrice, maxPossiblePrice]);
      setSortOrder(externalFilters.sortOrder || 'default');
      setSearchQuery(externalFilters.searchQuery || '');
    }
  }, [externalFilters, minPossiblePrice, maxPossiblePrice]);

  const areAdvancedFiltersActive = useMemo(() => {
    return isPriceFilterActive || sortOrder !== 'default' || searchQuery !== '';
  }, [isPriceFilterActive, sortOrder, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSortOrder('default');
    setSearchQuery('');
    setPriceRange([minPossiblePrice, maxPossiblePrice]);
    setIsPriceFilterActive(false);
  };

  const getCarUrl = (carName) => {
    const carMap = {
      // Based on actual product names from Firestore
      'Innova Zenix': '/zenix',
      'Innova Zenix Hybrid': '/zenix', 
      'Innova Reborn': '/innovareborn',
      'Avanza': '/avanza',
      'Veloz': '/veloz',
      'Calya': '/calya',
      'Agya': '/agya',
      'Agya GR': '/agya-gr',
      'Rush': '/rush',
      'Fortuner 4x2': '/fortuner-4x2',
      'Fortuner 4x4': '/fortuner-4x4',
      'Alphard': '/alphard',
      'Vellfire': '/velfire',
      'Land Cruiser': '/land-cruiser',
      'Corolla Altis': '/corolla-altis',
      'Camry': '/camry',
      'Camry Hybrid': '/camry-hybrid',
      'Supra': '/supra',
      'GR 86': '/gr86',
      'Raize': '/raize',
      'Raize GR Sport': '/raize-gr-sport',
      'Yaris': '/yaris',
      'Yaris Cross': '/yaris-cross',
      'Yaris Cross Hybrid': '/yaris-cross-hybrid',
      'Corolla Cross': '/corolla-cross',
      'BZ4X': '/bz4x',
      'bZ4X': '/bz4x',
      'Vios': '/vios',
      'Hilux 4x4': '/hilux-4x4',
      'Hilux 4x2': '/hilux-4x2',
      'Dyna': '/dyna',
      'Hiace': '/hiace',
      'Voxy': '/voxy',
      'Hilux Rangga': '/hilux-rangga',
      'GR Corolla': '/gr-corolla',
      'Innova Zenix CVT': '/InnovaCVT'
    };
    const normalizedName = carName.trim();
    return carMap[normalizedName] || `/${normalizedName.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const filteredProducts = useMemo(() => {
    let tempProducts = [...products];
    
    // Filter by category using the database type field
    if (selectedCategory !== 'ALL') {
      tempProducts = tempProducts.filter(p => p.type === selectedCategory);
    }
    
    if (searchQuery) {
      tempProducts = tempProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (isPriceFilterActive) {
      tempProducts = tempProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    }
    switch (sortOrder) {
      case 'price-asc':
        tempProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        tempProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        tempProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        tempProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return tempProducts;
  }, [products, selectedCategory, sortOrder, priceRange, searchQuery, isPriceFilterActive]);

  const groupedProducts = useMemo(() => {
    // Always group products by their type field from database to maintain segmentation
    const grouped = filteredProducts.reduce((acc, product) => {
      const category = product.type || 'UNDEFINED';
      
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
    
    // If a specific category is selected (not ALL), only return that category
    if (selectedCategory !== 'ALL') {
      const result = {};
      if (grouped[selectedCategory] && grouped[selectedCategory].length > 0) {
        result[selectedCategory] = grouped[selectedCategory];
      }
      return result;
    }
    
    // For 'ALL' category, return categories in the order defined in categories array
    // Only include categories that have cars (non-empty)
    const orderedResult = {};
    categories.slice(1).forEach(category => { // Skip 'ALL' category
      if (grouped[category] && grouped[category].length > 0) {
        orderedResult[category] = grouped[category];
      }
    });
    
    return orderedResult;
  }, [filteredProducts, selectedCategory]);

  const formatPrice = (value) => {
    // Handle empty/null values
    if (!value) return 'Harga tidak tersedia';
    
    // Handle string values
    if (typeof value === 'string') {
      // Check for "Spot Order" (case insensitive)
      if (value.toLowerCase().includes('spot order')) {
        return 'Spot Order';
      }
      
      // If it's already a formatted string (contains "Rp"), return as is
      if (value.includes('Rp')) {
        return value;
      }
      
      // Try to parse as number
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(numericValue);
      }
    }
    
    // If it's a number, format it properly
    if (typeof value === 'number') {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    }
    
    return 'Harga tidak tersedia';
  };

  const renderVehicleList = (isMobile) => {
    const productsToDisplay = groupedProducts;
    const isFlatList = Array.isArray(productsToDisplay);
    const gridCols = isMobile ? 'grid-cols-2' : 'grid-cols-3';

    if (filteredProducts.length === 0) {
      return <p className="text-center text-gray-500 col-span-full">No vehicles match your search.</p>;
    }

    const carItem = (car) => {
      const url = getCarUrl(car.name);
      return (
        <div key={car.id} className="text-left group cursor-pointer" onClick={() => navigate(url)}>
          <div className="relative overflow-hidden bg-gray-100">
            <img src={car.imageUrl} alt={car.name} className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out" />
          </div>
          <h3 className="mt-4 text-xl md:text-2xl font-bold text-black">{car.name}</h3>
          <p className="mt-2 text-lg md:text-xl text-red-600 font-bold">{formatPrice(car.price)}</p>
        </div>
      );
    };

    if (isFlatList) {
      return (
        <div className={`grid ${gridCols} gap-x-8 gap-y-10`}>
          {productsToDisplay.map(carItem)}
        </div>
      );
    }

    return (
      <>
        {Object.keys(productsToDisplay).map(type => (
          <div key={type} className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-wide">{`${type.toUpperCase()} (${productsToDisplay[type].length})`}</h2>
            <div className="bg-gray-100 p-6">
              {/* Always use grid layout to maintain consistent car image sizes */}
              <div className={`grid ${gridCols} gap-x-6 gap-y-8`}>
                {productsToDisplay[type].map(carItem)}
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };

  const navLinks = useMemo(() => [{ name: 'Home', href: '/' }, { name: 'Tentang Kami', href: '#about-us' }], []);

  const isNavbarOpaque = isScrolled || vehiclesOpen || mobileMenuOpen;
  const textColor = isNavbarOpaque ? 'text-gray-900' : 'text-white';
  const hamburgerColor = isNavbarOpaque ? 'text-gray-900' : 'text-white';

  if (loading) {
    return (
      <div className="w-full text-center py-12">
        <p className="text-gray-500">Loading vehicles...</p>
      </div>
    );
  }

  return (
    <nav className={`fixed w-full z-[60] transition-all duration-300 ${isNavbarOpaque ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-auto py-4">
          <div className="flex-shrink-0">
            <Link to="/" onClick={() => { setMobileMenuOpen(false); setVehiclesOpen(false); }}>
              <img className="h-12 md:h-16 w-auto" src="https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AssetsNew%2FAuto2000Colored.png?alt=media&token=bf6c7a9a-4bbd-44f2-b22a-1d698d857019" alt="Auto2000" />
            </Link>
          </div>
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => {
              if (link.name === 'Tentang Kami') {
                return location.pathname === '/' ? (
                  <ScrollLink key={link.name} to="about-us" spy={true} smooth={true} offset={-80} duration={500} className={`text-base font-semibold ${textColor} hover:text-red-600 transition-colors cursor-pointer`}>
                    {link.name}
                  </ScrollLink>
                ) : (
                  <Link key={link.name} to="/#about-us" className={`text-base font-semibold ${textColor} hover:text-red-600 transition-colors`}>
                    {link.name}
                  </Link>
                );
              }
              return (
                <Link key={link.name} to={link.href} className={`text-base font-semibold ${textColor} hover:text-red-600 transition-colors`}>
                  {link.name}
                </Link>
              );
            })}
            <div className="relative">
              <button onClick={() => setVehiclesOpen(!vehiclesOpen)} className={`flex items-center text-base font-semibold ${textColor} hover:text-red-600 transition-colors`}>
                Mobil <FiChevronDown className={`ml-1 transition-transform ${vehiclesOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
             <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-4">
                                <a href="https://www.tiktok.com/@auto2000.wayhalim?_t=ZS-8yD85l5RUqg&_r=1" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-600 hover:text-red-600 transition-colors">
                  <FaTiktok size={22} />
                </a>
                                <a href="https://www.instagram.com/auto2000_wayhalim?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-600 hover:text-red-600 transition-colors">
                  <FaInstagram size={22} />
                </a>
              </div>
              <button onClick={onInquiryClick} className="px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-300 shadow-md hover:shadow-lg">
                Dapatkan Penawaran
              </button>
            </div>
          </div>
          <div className="lg:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className={`text-2xl ${hamburgerColor} hover:text-red-600 transition-colors duration-300 z-[70] relative`}
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {vehiclesOpen && !mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            className="hidden lg:flex fixed left-0 top-16 w-full h-[calc(100vh-4rem)] bg-white z-[50] border-t shadow-lg"
          >
            <aside className="w-80 border-r flex flex-col">
              <div className="p-6 border-b">
                <input 
                  type="text" 
                  placeholder="Search vehicle..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" 
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Kategori</h3>
                    <nav className="space-y-1">
                      {categories.map(cat => (
                        <button 
                          key={cat} 
                          onClick={() => { 
                            setSelectedCategory(cat); 
                            setSortOrder('default'); 
                            setIsPriceFilterActive(false); 
                            setPriceRange([minPossiblePrice, maxPossiblePrice]); 
                          }} 
                          className={`block text-left w-full p-3 rounded text-base font-medium transition-colors ${
                            selectedCategory === cat && !areAdvancedFiltersActive 
                              ? 'bg-red-600 text-white' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </nav>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Urutkan</h3>
                    <select 
                      value={sortOrder} 
                      onChange={(e) => setSortOrder(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {sortOptions.map(option => (
                        <option key={option.key} value={option.key}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Harga</h3>
                      <button 
                        onClick={() => setIsPriceFilterActive(!isPriceFilterActive)} 
                        className={`text-sm px-3 py-1 rounded transition-colors ${
                          isPriceFilterActive ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {isPriceFilterActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </div>
                    {isPriceFilterActive && (
                      <div className="space-y-3">
                        <Slider 
                          range 
                          min={minPossiblePrice} 
                          max={maxPossiblePrice} 
                          value={priceRange} 
                          onChange={setPriceRange} 
                          className="mb-4"
                          trackStyle={[{ backgroundColor: '#dc2626' }]}
                          handleStyle={[{ borderColor: '#dc2626' }, { borderColor: '#dc2626' }]}
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{formatPrice(priceRange[0])}</span>
                          <span>{formatPrice(priceRange[1])}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {areAdvancedFiltersActive && (
                    <button 
                      onClick={handleResetFilters} 
                      className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              </div>
            </aside>
            
            <main className="flex-1 overflow-y-auto p-6">
              {renderVehicleList(false)}
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: '100%' }} 
            transition={{ 
              type: "tween", 
              ease: "easeInOut", 
              duration: 0.3 
            }}
            className="fixed inset-0 bg-white z-[80] lg:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b bg-white z-[90]">
                <img className="h-10 w-auto" src="https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AssetsNew%2FAuto2000Colored.png?alt=media&token=bf6c7a9a-4bbd-44f2-b22a-1d698d857019" alt="Auto2000" />
                <button 
                  onClick={() => { 
                    setMobileMenuOpen(false); 
                    setVehiclesOpen(false); 
                  }} 
                  className="text-2xl text-gray-900 hover:text-red-600 transition-colors"
                >
                  <FiX />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-white z-[85]">
                <div className="p-4 space-y-4">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.name} 
                      to={link.href} 
                      onClick={() => { setMobileMenuOpen(false); setVehiclesOpen(false); }} 
                      className="block text-lg font-semibold text-gray-900 hover:text-red-600 transition-colors py-2"
                    >
                      {link.name}
                    </Link>
                  ))}
                  
                  <button 
                    onClick={() => setVehiclesOpen(!vehiclesOpen)} 
                    className="flex items-center justify-between w-full text-lg font-semibold text-gray-900 hover:text-red-600 transition-colors py-2"
                  >
                    Mobil 
                    <FiChevronDown className={`transition-transform ${vehiclesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {vehiclesOpen && (
                    <div className="ml-4 space-y-4 bg-gray-50 p-4 rounded-lg">
                      {/* Search Input */}
                      <input 
                        type="text" 
                        placeholder="Cari mobil..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4" 
                      />
                      
                      {/* Mobile Category Filter - Horizontal Scroll */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 overflow-x-auto">
                          <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
                            {categories.map(cat => (
                              <button 
                                key={cat} 
                                onClick={() => { 
                                  setSelectedCategory(cat); 
                                  setSortOrder('default'); 
                                  setIsPriceFilterActive(false); 
                                  setPriceRange([minPossiblePrice, maxPossiblePrice]); 
                                }} 
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                  selectedCategory === cat && !areAdvancedFiltersActive 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Filter Button */}
                        <button 
                          onClick={() => setShowMobileFilters(!showMobileFilters)}
                          className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                            showMobileFilters || areAdvancedFiltersActive
                              ? 'bg-red-600 text-white' 
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <FiFilter size={18} />
                        </button>
                      </div>
                      
                      {/* Mobile Advanced Filters */}
                      {showMobileFilters && (
                        <div className="bg-white p-4 rounded-lg border space-y-4 mb-4">
                          {/* Sort Options */}
                          <div>
                            <h4 className="font-semibold mb-2 text-sm">Urutkan</h4>
                            <select 
                              value={sortOrder} 
                              onChange={(e) => setSortOrder(e.target.value)} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                            >
                              {sortOptions.map(option => (
                                <option key={option.key} value={option.key}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                      
                      {renderVehicleList(true)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t bg-white z-[85]">
                <div className="flex items-center justify-center gap-6 mb-4">
                  <a href="https://www.tiktok.com/@auto2000.wayhalim?_t=ZS-8yD85l5RUqg&_r=1" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-600 hover:text-red-600 transition-colors">
                    <FaTiktok size={24} />
                  </a>
                  <a href="https://www.instagram.com/auto2000_wayhalim?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-600 hover:text-red-600 transition-colors">
                    <FaInstagram size={24} />
                  </a>
                </div>
                <button 
                  onClick={() => { onInquiryClick(); setMobileMenuOpen(false); }} 
                  className="w-full px-4 py-3 text-base font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-300 relative z-[85]"
                >
                  Dapatkan Penawaran
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
