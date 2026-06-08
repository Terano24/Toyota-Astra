import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { FiMenu, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

const DashboardLayout = ({ children, navLinks = [], logoText, pageTitle }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [salesmanProfile, setSalesmanProfile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { doSignOut, currentUser, userRole } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isProfilePage = location.pathname === '/encrypted-dashboard/profile';
  const isEncryptedDashboard = location.pathname.startsWith('/encrypted-dashboard');

  // Fetch salesman profile data for profile picture
  useEffect(() => {
    const fetchSalesmanProfile = async () => {
      if (currentUser && userRole !== 'admin' && isEncryptedDashboard) {
        try {
          const q = query(collection(db, 'salesmen'), where('email', '==', currentUser.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const salesmanData = querySnapshot.docs[0].data();
            setSalesmanProfile(salesmanData);
          }
        } catch (error) {
          console.error('Error fetching salesman profile:', error);
        }
      }
    };

    fetchSalesmanProfile();
  }, [currentUser, userRole, isEncryptedDashboard]);

  // Swipe handlers for mobile navigation
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      // Open sidebar when swiping right (left to right)
      if (!isSidebarOpen) {
        setSidebarOpen(true);
      }
    },
    onSwipedLeft: () => {
      // Close sidebar when swiping left (right to left)
      if (isSidebarOpen) {
        setSidebarOpen(false);
      }
    },
    trackMouse: false, // Only track touch events, not mouse
    trackTouch: true,
    delta: 50, // Minimum distance for swipe
    preventScrollOnSwipe: false,
    rotationAngle: 0,
  });

  const SidebarHeader = () => (
    <div className="p-4 border-b border-gray-200">
      <div className="flex justify-between items-start">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AssetsNew%2FAuto2000Colored.png?alt=media&token=5372765e-6c16-419f-aa1d-e98adaa3dcdd"
          alt="Auto2000 Logo"
          className="h-16 w-auto"
        />
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-600"
        >
          <FiX size={24} />
        </button>
      </div>
      <h1 className="text-xl font-bold text-gray-800 mt-2">{logoText || 'Panel'}</h1>
    </div>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-gray-800">
      <SidebarHeader />
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={() =>
              `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                isActive(link.to)
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'hover:bg-gray-100'
              }`
            }
            onClick={() => isSidebarOpen && setSidebarOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={async () => {
            await doSignOut();
            navigate('/login');
          }}
          className="w-full flex items-center justify-center p-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    closed: {
      x: '-100%',
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };

  return (
    <div className="flex h-screen bg-gray-50" {...swipeHandlers}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden relative z-30 flex-shrink-0 flex h-16 bg-white shadow-md items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 focus:outline-none"
          >
            <FiMenu size={24} />
          </button>
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
          {/* Profile Picture Icon - Mobile Only for Salesmen */}
          {userRole !== 'admin' && isEncryptedDashboard && salesmanProfile ? (
            <div 
              className="flex-shrink-0 cursor-pointer"
              onClick={() => navigate('/encrypted-dashboard/profile')}
            >
              {salesmanProfile.photoURL ? (
                <img 
                  src={salesmanProfile.photoURL} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-red-500 hover:border-red-600 transition-colors"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm border-2 border-red-500 hover:border-red-600 transition-colors"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  {salesmanProfile.firstName?.[0]}{salesmanProfile.lastName?.[0]}
                </div>
              )}
            </div>
          ) : (
            <div className="w-10"></div> /* Spacer to balance the header */
          )}
        </header>

        {/* Mobile Sidebar with Animation */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                variants={overlayVariants}
                initial="closed"
                animate="open"
                exit="closed"
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                variants={sidebarVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="fixed top-0 left-0 h-full w-full max-w-xs z-50 lg:hidden shadow-xl"
              >
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className={`flex-1 overflow-y-auto ${isProfilePage ? 'bg-[#201c1c]' : ''}`}>
          <div className={isProfilePage ? '' : 'p-4 md:p-6'}>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
