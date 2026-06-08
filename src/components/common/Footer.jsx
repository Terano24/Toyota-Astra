import React from 'react';
import { FaWhatsapp, FaInstagram, FaTiktok, FaMapMarkerAlt } from 'react-icons/fa';


const Footer = () => {
  const socialLinks = [
    { icon: <FaInstagram />, href: 'https://www.instagram.com/auto2000_wayhalim?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==', 'aria-label': 'Instagram', handle: '@auto2000_wayhalim' },
    { icon: <FaTiktok />, href: 'https://www.tiktok.com/@auto2000.wayhalim?_t=ZS-8yD85l5RUqg&_r=1', 'aria-label': 'Tiktok', handle: '@auto2000_wayhalim' },
  ];

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {/* Logo and About */}
          <div className="space-y-4 md:space-y-6">
            <img src="https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AssetsNew%2FAuto2000Colored.png?alt=media&token=bf6c7a9a-4bbd-44f2-b22a-1d698d857019" alt="Auto2000 Logo" className="h-14 md:h-16" />
            <p className="text-gray-400 text-sm md:text-base">
              Auto2000 Way Halim adalah dealer resmi Toyota di Lampung, menyediakan penjualan, servis, dan suku cadang dengan layanan terbaik.
            </p>
          </div>

          {/* Contact and Location */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-semibold tracking-wider uppercase text-red-500">Kontak Kami</h3>
            <div className="text-gray-300 text-sm md:text-base space-y-3 md:space-y-4">
              <a href="https://wa.me/+6281374418818" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-red-400 transition-colors duration-300 transform hover:scale-105">
                <FaWhatsapp className="mr-3 md:mr-4 h-5 md:h-6 w-5 md:w-6 text-gray-400" />
                <span>+62 813-7441-8818</span>
              </a>
              <a href="https://www.google.com/maps/place/Toyota+Auto2000+Way+Halim/@-5.3852075,105.2839893,1032m/data=!3m1!1e3!4m6!3m5!1s0x2e40db3fd457715d:0xf631c75f2ef140ed!8m2!3d-5.3852128!4d105.2865447!16s%2Fg%2F11c2pkb1y3?entry=tts&g_ep=EgoyMDI1MDYxNy4wIPu8ASoASAFQAw%3D%3D&skid=4b176af8-0093-450a-afe9-c97e82c5fa1b" target="_blank" rel="noopener noreferrer" className="flex items-start hover:text-red-400 transition-colors duration-300 transform hover:scale-105">
                <FaMapMarkerAlt className="mr-3 md:mr-4 h-5 md:h-6 w-5 md:w-6 flex-shrink-0 mt-1 text-gray-400" />
                <span>Jl. Soekarno Hatta No.KAV 168, Labuhan Ratu, Kec. Kedaton, Kota Bandar Lampung, Lampung 35142</span>
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-semibold tracking-wider uppercase text-red-500">Ikuti Kami</h3>
            <div className="flex flex-col space-y-3 md:space-y-4">
              {socialLinks.map((social, index) => (
                <a key={index} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social['aria-label']} className="flex items-center text-gray-300 hover:text-red-500 transition-colors duration-300 text-sm md:text-base">
                  {React.cloneElement(social.icon, { className: 'h-6 md:h-7 w-6 md:w-7 mr-3 md:mr-4' })}
                  <span>{social.handle}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-16 border-t border-gray-700 pt-8 md:pt-10 text-center text-xs md:text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Auto2000 Way Halim. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
