import React from 'react';
import { Outlet } from 'react-router-dom';
import LandingNavbar from './LandingNavbar'; // Assuming this is the correct path
import Footer from './Footer';

const MainLayout = () => {
  // You might need to pass props to LandingNavbar, like isScrolled, etc.
  // For simplicity, this example doesn't include that logic, but it can be added.
  // Let's check if we need to fetch products for the navbar
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
