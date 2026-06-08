import React from 'react';
import { motion } from 'framer-motion';

const AboutUs = () => {
  // Animation variants for mobile-optimized smooth animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const slideFromLeft = {
    hidden: { 
      opacity: 0, 
      x: -60,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const slideFromRight = {
    hidden: { 
      opacity: 0, 
      x: 60,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const fadeInUp = {
    hidden: { 
      opacity: 0, 
      y: 30,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  return (
    <section id="about-us" className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3, margin: "-100px" }}
        >
          {/* Left Side: Text Content */}
          <motion.div 
            className="text-center md:text-left"
            variants={slideFromLeft}
          >
            <motion.h2 
              className="text-base font-semibold tracking-wider text-red-600 uppercase"
              variants={fadeInUp}
            >
              Tentang Kami
            </motion.h2>
            <motion.h3 
              className="mt-2 text-3xl sm:text-5xl font-extrabold tracking-tight"
              variants={fadeInUp}
            >
              <span className="text-gray-900">Auto</span><span className="text-red-600">2000</span> <span className="text-gray-900">Way Halim</span>
            </motion.h3>
            <motion.p 
              className="mt-6 text-base sm:text-lg text-gray-600 leading-relaxed text-justify"
              variants={fadeInUp}
            >
              Selamat datang di dealer dan bengkel Resmi Auto2000 Way Halim. Tersedia beragam kebutuhan serta promo maupun fasilitas pembayaran secara kredit dan tunai. Pilih berbagai tipe maupun varian mobil baru Toyota dengan daftar harga dan spesifikasi yang tersedia di Auto2000.
            </motion.p>
          </motion.div>
          
          {/* Right Side: Image */}
          <motion.div 
            className="mt-12 md:mt-0"
            variants={slideFromRight}
          >
            <motion.div 
              className="h-80 md:h-96 rounded-lg shadow-xl overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <motion.img
                className="w-full h-full object-cover"
                src="https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/WebAssets%2FScreenshot%202025-06-28%20215845.png?alt=media&token=b1c1e6f4-3e84-4e67-baad-e186819fa28b"
                alt="Auto2000 Way Halim Dealership"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;
