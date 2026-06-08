import React from 'react';
import CarCard from './CarCard';

/**
 * CarCardCarousel - horizontally scrollable row of CarCard components, Toyota-style.
 * Props:
 *   - cars: array of car objects (see CarCard props)
 *   - onInquiry: function (receives car object)
 */
export default function CarCardCarousel({ cars = [], onInquiry }) {
  const getCarLink = (carName) => {
    const name = carName.toLowerCase();
    const overrides = {
      'innova zenix hybrid': '/zenix',
      'innova zenix': '/zenix',
      'innova zenix cvt': '/InnovaCVT',
      'gr 86': '/gr86',
      'landcruiser': '/land-cruiser',
      'agya gr sport': '/agya-gr',
      'vellfire': '/velfire',
      'innova reborn': '/innovareborn',
    };

    if (overrides[name]) {
      return overrides[name];
    }
    return `/${name.replace(/\s+/g, '-')}`;
  };

  return (
    <div className="relative">
      {/* Carousel Row with visible scrollbar, no arrows */}
      <div
        className="flex space-x-8 items-stretch overflow-x-auto pb-4 pr-4 transition-transform duration-300 scrollbar-black"
        style={{ scrollbarWidth: 'auto', msOverflowStyle: 'auto', scrollBehavior: 'smooth' }}
      >
        {cars.map((car, idx) => (
          <CarCard
            key={car.id || idx}
            {...car}
            seeMoreLink={getCarLink(car.name)}
            onInquiry={() => onInquiry(car)}
            desc={car.desc}
            showContentSeparator={idx !== 0}
          />
        ))}
      </div>
    </div>
  );
}
