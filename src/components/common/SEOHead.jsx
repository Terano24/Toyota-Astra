import React from 'react';

const SEOHead = ({ 
  title = "Auto2000 Way Halim - Dealer Resmi Toyota Bandar Lampung",
  description = "Dealer resmi Toyota Auto2000 Way Halim di Bandar Lampung. Jual mobil Toyota terbaru: Innova Zenix, Rush, Avanza, Agya, Hilux, Camry Hybrid, Yaris Cross. Promo menarik, kredit mudah, service berkualitas.",
  keywords = "auto2000, toyota, dealer toyota, bandar lampung, lampung, innova zenix, toyota rush, avanza, agya, hilux, camry hybrid, yaris cross, mobil toyota, kredit mobil, promo toyota, service toyota, way halim",
  image = "https://firebasestorage.googleapis.com/v0/b/astra-c196c.firebasestorage.app/o/AssetsNew%2FAuto2000Colored.png?alt=media&token=bf6c7a9a-4bbd-44f2-b22a-1d698d857019",
  url = "https://auto2000wayhalim.com",
  carModel = null
}) => {
  // Enhanced title and description for specific car models
  const getCarSpecificContent = (model) => {
    const carData = {
      'innova-zenix': {
        title: `Toyota Innova Zenix 2025 - Auto2000 Way Halim Bandar Lampung | Promo Terbaru`,
        description: `Toyota Innova Zenix 2025 terbaru di Auto2000 Way Halim Bandar Lampung. MPV premium dengan teknologi hybrid, interior mewah, dan performa terdepan. Promo menarik dan kredit mudah tersedia.`,
        keywords: `toyota innova zenix, innova zenix 2025, innova zenix bandar lampung, innova zenix lampung, mpv toyota, hybrid toyota, auto2000 way halim, dealer toyota lampung`
      },
      'rush': {
        title: `Toyota Rush 2025 - Auto2000 Way Halim Bandar Lampung | SUV Tangguh`,
        description: `Toyota Rush 2025 SUV tangguh dan stylish di Auto2000 Way Halim Bandar Lampung. Cocok untuk keluarga dengan fitur keselamatan lengkap dan performa handal. Promo spesial tersedia.`,
        keywords: `toyota rush, rush 2025, rush bandar lampung, rush lampung, suv toyota, mobil keluarga, auto2000 way halim, dealer toyota lampung`
      },
      'avanza': {
        title: `All New Toyota Avanza 2025 - Auto2000 Way Halim Bandar Lampung`,
        description: `All New Toyota Avanza 2025 dengan desain modern dan fitur canggih di Auto2000 Way Halim Bandar Lampung. MPV terpopuler dengan harga terjangkau dan kredit mudah.`,
        keywords: `toyota avanza, all new avanza, avanza 2025, avanza bandar lampung, avanza lampung, mpv toyota, auto2000 way halim, dealer toyota lampung`
      },
      'agya': {
        title: `Toyota Agya 2025 - Auto2000 Way Halim Bandar Lampung | Hatchback Ekonomis`,
        description: `Toyota Agya 2025 hatchback ekonomis dan stylish di Auto2000 Way Halim Bandar Lampung. Mobil perkotaan dengan konsumsi BBM irit dan harga terjangkau. Promo menarik tersedia.`,
        keywords: `toyota agya, agya 2025, agya bandar lampung, agya lampung, hatchback toyota, mobil irit, auto2000 way halim, dealer toyota lampung`
      },
      'hilux': {
        title: `Toyota Hilux 2025 - Auto2000 Way Halim Bandar Lampung | Pickup Tangguh`,
        description: `Toyota Hilux 2025 pickup tangguh untuk kerja dan petualangan di Auto2000 Way Halim Bandar Lampung. Double cabin dengan performa prima dan daya tahan tinggi.`,
        keywords: `toyota hilux, hilux 2025, hilux bandar lampung, hilux lampung, pickup toyota, double cabin, auto2000 way halim, dealer toyota lampung`
      },
      'camry-hybrid': {
        title: `Toyota Camry Hybrid 2025 - Auto2000 Way Halim Bandar Lampung | Sedan Premium`,
        description: `Toyota Camry Hybrid 2025 sedan premium dengan teknologi hybrid terdepan di Auto2000 Way Halim Bandar Lampung. Luxury sedan dengan performa dan efisiensi tinggi.`,
        keywords: `toyota camry hybrid, camry hybrid 2025, camry bandar lampung, sedan toyota, hybrid toyota, luxury sedan, auto2000 way halim, dealer toyota lampung`
      },
      'yaris-cross': {
        title: `Toyota Yaris Cross Hybrid 2025 - Auto2000 Way Halim Bandar Lampung`,
        description: `Toyota Yaris Cross Hybrid 2025 crossover stylish dengan teknologi hybrid di Auto2000 Way Halim Bandar Lampung. Urban SUV dengan desain modern dan fitur canggih.`,
        keywords: `toyota yaris cross, yaris cross hybrid, yaris cross 2025, crossover toyota, urban suv, auto2000 way halim, dealer toyota lampung`
      },
      'alphard': {
        title: `Toyota Alphard 2025 - Auto2000 Way Halim Bandar Lampung | MPV Mewah`,
        description: `Toyota Alphard 2025 MPV mewah dengan kemewahan premium di Auto2000 Way Halim Bandar Lampung. Luxury van dengan interior eksklusif dan teknologi canggih.`,
        keywords: `toyota alphard, alphard 2025, alphard bandar lampung, mpv mewah, luxury van, auto2000 way halim, dealer toyota lampung`
      },
      'bz4x': {
        title: `Toyota bZ4X 2025 - Auto2000 Way Halim Bandar Lampung | SUV Listrik`,
        description: `Toyota bZ4X 2025 SUV listrik masa depan di Auto2000 Way Halim Bandar Lampung. Electric vehicle dengan teknologi terdepan dan ramah lingkungan.`,
        keywords: `toyota bz4x, bz4x 2025, suv listrik, electric vehicle, auto2000 way halim, dealer toyota lampung`
      },
      'calya': {
        title: `Toyota Calya 2025 - Auto2000 Way Halim Bandar Lampung | MPV Keluarga`,
        description: `Toyota Calya 2025 MPV keluarga terjangkau di Auto2000 Way Halim Bandar Lampung. Mobil keluarga dengan ruang luas dan harga ekonomis.`,
        keywords: `toyota calya, calya 2025, calya bandar lampung, mpv keluarga, mobil keluarga murah, auto2000 way halim, dealer toyota lampung`
      },
      'camry': {
        title: `Toyota Camry 2025 - Auto2000 Way Halim Bandar Lampung | Sedan Premium`,
        description: `Toyota Camry 2025 sedan premium dengan desain elegan di Auto2000 Way Halim Bandar Lampung. Luxury sedan dengan performa tinggi dan kenyamanan maksimal.`,
        keywords: `toyota camry, camry 2025, camry bandar lampung, sedan premium, luxury sedan, auto2000 way halim, dealer toyota lampung`
      },
      'corolla-altis': {
        title: `Toyota Corolla Altis 2025 - Auto2000 Way Halim Bandar Lampung | Sedan Sporty`,
        description: `Toyota Corolla Altis 2025 sedan sporty dengan teknologi canggih di Auto2000 Way Halim Bandar Lampung. Sedan dengan performa dinamis dan efisiensi tinggi.`,
        keywords: `toyota corolla altis, corolla altis 2025, corolla bandar lampung, sedan sporty, auto2000 way halim, dealer toyota lampung`
      },
      'corolla-cross': {
        title: `Toyota Corolla Cross 2025 - Auto2000 Way Halim Bandar Lampung | SUV Kompak`,
        description: `Toyota Corolla Cross 2025 SUV kompak dengan desain modern di Auto2000 Way Halim Bandar Lampung. Crossover SUV dengan fitur keselamatan lengkap.`,
        keywords: `toyota corolla cross, corolla cross 2025, suv kompak, crossover suv, auto2000 way halim, dealer toyota lampung`
      },
      'dyna': {
        title: `Toyota Dyna 2025 - Auto2000 Way Halim Bandar Lampung | Truk Komersial`,
        description: `Toyota Dyna 2025 truk komersial handal di Auto2000 Way Halim Bandar Lampung. Kendaraan niaga dengan daya angkut besar dan performa tangguh.`,
        keywords: `toyota dyna, dyna 2025, truk komersial, kendaraan niaga, auto2000 way halim, dealer toyota lampung`
      },
      'fortuner': {
        title: `Toyota Fortuner 2025 - Auto2000 Way Halim Bandar Lampung | SUV Premium`,
        description: `Toyota Fortuner 2025 SUV premium dengan kemampuan off-road di Auto2000 Way Halim Bandar Lampung. SUV tangguh dengan kenyamanan dan teknologi terdepan.`,
        keywords: `toyota fortuner, fortuner 2025, fortuner bandar lampung, suv premium, suv off-road, auto2000 way halim, dealer toyota lampung`
      },
      'gr86': {
        title: `Toyota GR86 2025 - Auto2000 Way Halim Bandar Lampung | Sports Car`,
        description: `Toyota GR86 2025 sports car dengan performa tinggi di Auto2000 Way Halim Bandar Lampung. Mobil sport dengan handling presisi dan pengalaman berkendara yang mendebarkan.`,
        keywords: `toyota gr86, gr86 2025, sports car, mobil sport, auto2000 way halim, dealer toyota lampung`
      },
      'gr-corolla': {
        title: `Toyota GR Corolla 2025 - Auto2000 Way Halim Bandar Lampung | Hot Hatch`,
        description: `Toyota GR Corolla 2025 hot hatch dengan performa balap di Auto2000 Way Halim Bandar Lampung. Hatchback sporty dengan teknologi racing.`,
        keywords: `toyota gr corolla, gr corolla 2025, hot hatch, hatchback sporty, auto2000 way halim, dealer toyota lampung`
      },
      'hiace': {
        title: `Toyota Hiace 2025 - Auto2000 Way Halim Bandar Lampung | Van Komersial`,
        description: `Toyota Hiace 2025 van komersial serbaguna di Auto2000 Way Halim Bandar Lampung. Kendaraan niaga dengan kapasitas besar dan keandalan tinggi.`,
        keywords: `toyota hiace, hiace 2025, van komersial, kendaraan niaga, auto2000 way halim, dealer toyota lampung`
      },
      'land-cruiser': {
        title: `Toyota Land Cruiser 2025 - Auto2000 Way Halim Bandar Lampung | SUV Legendaris`,
        description: `Toyota Land Cruiser 2025 SUV legendaris dengan kemampuan off-road terbaik di Auto2000 Way Halim Bandar Lampung. SUV premium dengan daya tahan ekstrem.`,
        keywords: `toyota land cruiser, land cruiser 2025, suv legendaris, suv off-road, auto2000 way halim, dealer toyota lampung`
      },
      'raize': {
        title: `Toyota Raize 2025 - Auto2000 Way Halim Bandar Lampung | SUV Kompak`,
        description: `Toyota Raize 2025 SUV kompak dengan desain stylish di Auto2000 Way Halim Bandar Lampung. Urban SUV dengan fitur canggih dan efisiensi tinggi.`,
        keywords: `toyota raize, raize 2025, raize bandar lampung, suv kompak, urban suv, auto2000 way halim, dealer toyota lampung`
      },
      'supra': {
        title: `Toyota Supra 2025 - Auto2000 Way Halim Bandar Lampung | Sports Car Legendaris`,
        description: `Toyota Supra 2025 sports car legendaris dengan performa tinggi di Auto2000 Way Halim Bandar Lampung. Mobil sport ikonik dengan teknologi balap.`,
        keywords: `toyota supra, supra 2025, sports car, mobil sport legendaris, auto2000 way halim, dealer toyota lampung`
      },
      'vellfire': {
        title: `Toyota Vellfire 2025 - Auto2000 Way Halim Bandar Lampung | MPV Mewah`,
        description: `Toyota Vellfire 2025 MPV mewah dengan kemewahan premium di Auto2000 Way Halim Bandar Lampung. Luxury van dengan interior eksklusif dan teknologi terdepan.`,
        keywords: `toyota vellfire, vellfire 2025, mpv mewah, luxury van, auto2000 way halim, dealer toyota lampung`
      },
      'veloz': {
        title: `Toyota Veloz 2025 - Auto2000 Way Halim Bandar Lampung | MPV Sporty`,
        description: `Toyota Veloz 2025 MPV sporty dengan desain dinamis di Auto2000 Way Halim Bandar Lampung. Multi Purpose Vehicle dengan performa handal dan gaya modern.`,
        keywords: `toyota veloz, veloz 2025, veloz bandar lampung, mpv sporty, auto2000 way halim, dealer toyota lampung`
      },
      'vios': {
        title: `Toyota Vios 2025 - Auto2000 Way Halim Bandar Lampung | Sedan Kompak`,
        description: `Toyota Vios 2025 sedan kompak dengan efisiensi tinggi di Auto2000 Way Halim Bandar Lampung. Sedan ekonomis dengan fitur lengkap dan harga terjangkau.`,
        keywords: `toyota vios, vios 2025, vios bandar lampung, sedan kompak, sedan ekonomis, auto2000 way halim, dealer toyota lampung`
      },
      'voxy': {
        title: `Toyota Voxy 2025 - Auto2000 Way Halim Bandar Lampung | MPV Keluarga`,
        description: `Toyota Voxy 2025 MPV keluarga dengan ruang luas di Auto2000 Way Halim Bandar Lampung. Multi Purpose Vehicle dengan kenyamanan dan kepraktisan tinggi.`,
        keywords: `toyota voxy, voxy 2025, mpv keluarga, auto2000 way halim, dealer toyota lampung`
      },
      'yaris': {
        title: `Toyota Yaris 2025 - Auto2000 Way Halim Bandar Lampung | Hatchback Premium`,
        description: `Toyota Yaris 2025 hatchback premium dengan teknologi canggih di Auto2000 Way Halim Bandar Lampung. City car dengan performa dinamis dan efisiensi tinggi.`,
        keywords: `toyota yaris, yaris 2025, yaris bandar lampung, hatchback premium, city car, auto2000 way halim, dealer toyota lampung`
      },
      'zenix': {
        title: `Toyota Zenix 2025 - Auto2000 Way Halim Bandar Lampung | MPV Hybrid`,
        description: `Toyota Zenix 2025 MPV hybrid dengan teknologi terdepan di Auto2000 Way Halim Bandar Lampung. Multi Purpose Vehicle dengan efisiensi tinggi dan kenyamanan premium.`,
        keywords: `toyota zenix, zenix 2025, zenix bandar lampung, mpv hybrid, auto2000 way halim, dealer toyota lampung`
      }
    };

    return carData[model] || {};
  };

  const carSpecific = carModel ? getCarSpecificContent(carModel) : {};
  const finalTitle = carSpecific.title || title;
  const finalDescription = carSpecific.description || description;
  const finalKeywords = carSpecific.keywords || keywords;

  // Update document title and meta tags
  React.useEffect(() => {
    document.title = finalTitle;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', finalDescription);
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', finalKeywords);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', finalTitle);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', finalDescription);
    }
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', finalTitle);
    }
    
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', finalDescription);
    }
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', url);
    }
  }, [finalTitle, finalDescription, finalKeywords, url]);

  return null; // This component doesn't render anything visible
};

export default SEOHead;
