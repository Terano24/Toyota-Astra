import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import LandingNavbar from '../common/LandingNavbar';
import InquiryModal from '../common/InquiryModal';
import ChatWidget from '../common/ChatWidget';
import { createChatFromInquiry } from '../../utils/chatAssignment';

const LandingPageWithChat = () => {
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    sortOrder: 'default',
    priceRange: null, 
  });

  const location = useLocation();
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedType, setSelectedType] = useState('ALL');
  
  // Chat widget state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatCustomerData, setChatCustomerData] = useState(null);
  const [triggerChatFromInquiry, setTriggerChatFromInquiry] = useState(false);
  const [inquiryDataForChat, setInquiryDataForChat] = useState(null);

  const parsePrice = (priceString) => {
    if (!priceString || typeof priceString !== 'string') return 0;
    return parseInt(priceString.replace(/[^0-9]/g, ''), 10);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    };
    fetchProducts();
  }, []);

  // Handle successful inquiry submission
  const handleInquirySuccess = async (inquiryData) => {
    try {
      // Create chat assignment for the inquiry
      const chatAssignment = await createChatFromInquiry(inquiryData);
      
      // Set up chat widget with customer data
      setChatCustomerData({
        name: inquiryData.name,
        phone: inquiryData.phone
      });
      
      setInquiryDataForChat(inquiryData);
      setTriggerChatFromInquiry(true);
      
      // Close inquiry modal and open chat
      setInquiryModalOpen(false);
      setChatOpen(true);
      
      console.log('Chat initialized for inquiry:', inquiryData.id);
    } catch (error) {
      console.error('Failed to initialize chat for inquiry:', error);
      // Still close the inquiry modal even if chat fails
      setInquiryModalOpen(false);
    }
  };

  const handleChatToggle = () => {
    setChatOpen(!chatOpen);
    // Reset inquiry trigger when manually opening chat
    if (!chatOpen) {
      setTriggerChatFromInquiry(false);
    }
  };

  // Filter products based on selected type and filters
  const filteredProducts = () => {
    let tempProducts = [...products];
    
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
            case 'name-asc':
                tempProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                tempProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                break;
        }
    }
    
    return tempProducts;
  };

  return (
    <div className="bg-white font-montserrat">
      <LandingNavbar 
        isScrolled={isScrolled} 
        products={products} 
        onInquiryClick={() => setInquiryModalOpen(true)}
        onFilterClick={() => setFilterModalOpen(true)}
        externalFilters={filters}
      />
      
      {/* Enhanced InquiryModal with chat integration */}
      <InquiryModal 
        open={inquiryModalOpen} 
        onClose={() => setInquiryModalOpen(false)} 
        models={products.map(p => p.name)}
        onSubmit={handleInquirySuccess} // Pass the success handler
      />

      {/* Chat Widget */}
      <ChatWidget
        isOpen={chatOpen}
        onToggle={handleChatToggle}
        customerData={chatCustomerData}
        triggerFromInquiry={triggerChatFromInquiry}
        inquiryData={inquiryDataForChat}
      />

      {/* Your existing landing page content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-red-600 to-red-800">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Auto2000 Way Halim</h1>
            <p className="text-xl mb-8">Dealer Resmi Toyota Bandar Lampung</p>
            <div className="space-x-4">
              <button 
                onClick={() => setInquiryModalOpen(true)}
                className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Dapatkan Penawaran
              </button>
              <button 
                onClick={handleChatToggle}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors"
              >
                Chat dengan Sales
              </button>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Pilihan Mobil Toyota</h2>
            
            {/* Type Filter */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-4 bg-gray-100 p-2 rounded-lg">
                {['ALL', 'SUV', 'MPV', 'SEDAN', 'HATCHBACK'].map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      selectedType === type 
                        ? 'bg-red-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts().map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4">{product.desc}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-red-600">{product.price}</span>
                      <button
                        onClick={() => {
                          setChatCustomerData(null); // Let user fill form
                          setTriggerChatFromInquiry(false);
                          setChatOpen(true);
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Chat Sales
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Mengapa Pilih Auto2000 Way Halim?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🚗</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Dealer Resmi</h3>
                <p className="text-gray-600">Dealer resmi Toyota dengan layanan terpercaya</p>
              </div>
              <div className="p-6">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Live Chat Support</h3>
                <p className="text-gray-600">Chat langsung dengan sales untuk konsultasi</p>
              </div>
              <div className="p-6">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🔧</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Service Berkualitas</h3>
                <p className="text-gray-600">Layanan purna jual terbaik di Lampung</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPageWithChat;
