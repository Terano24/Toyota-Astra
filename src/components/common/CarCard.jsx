  import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CarCard - Toyota-style car card for use in car carousel sections.
 * Props:
 *   - imageUrl: string
 *   - name: string (trim/model)
 *   - price: string | number
 *   - mpg: string (optional)
 *   - features: array of strings (3-5)
 *   - onInquiry: function
 *   - seeMoreLink: string (optional)
 *   - buildLink: string (optional)
 */
export default function CarCard({
  imageUrl,
  name,
  price,
  priceNote,
  mpg,
  mpgNote,
  features = [],
  desc = '',
  seeMoreLink,
  onInquiry,
  showContentSeparator
}) {
  return (
    <div className={`flex flex-col flex-shrink-0 w-[46vw] sm:w-auto sm:min-w-[16rem] sm:max-w-[16rem] px-1 py-2 relative bg-transparent`}>
      {/* Short vertical separator */}

      <div className="flex flex-col items-start">
        <Link to={seeMoreLink || '#'} className="w-full">
          <img
            src={imageUrl || '/placeholder-car.jpg'}
            alt={name}
            className="w-full max-h-32 sm:max-h-48 object-contain mb-2 cursor-pointer transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </Link>
      </div>
      <div className={`car-content flex flex-col flex-1 h-full items-start gap-0 px-4 ${showContentSeparator ? 'border-l border-gray-300' : ''}`}>
        <span className="text-sm sm:text-lg font-bold text-black mb-0.5 uppercase leading-snug">{name}</span>
        <span className="text-xs sm:text-sm font-bold text-red-600 leading-tight">
          {price ? `${price.toLocaleString()}` : 'Price on request'}
          {priceNote && <span className="text-xs font-normal text-gray-500 ml-1 align-super">{priceNote}<sup>*</sup></span>}
        </span>
        {desc && (
          <span className="hidden sm:block text-xs text-gray-600 mt-1 mb-1 min-h-[1.75em]" style={{ whiteSpace: 'pre-line' }}>{desc}</span>
        )}
        {mpg && (
          <span className="text-xs text-gray-700 mb-0.5">{mpg} <span className="text-xs text-gray-400 align-super">{mpgNote || ''}<sup>*</sup></span></span>
        )}
        <ul className="list-disc ml-4 text-[10px] sm:text-xs text-gray-700 mb-1 space-y-0.5">
          {features.slice(0,4).map((f,i) => <li key={i}>{f}</li>)}
        </ul>
      </div>
      <div className="flex flex-row gap-2 mt-2 items-center text-xs text-gray-700">
        <Link to={seeMoreLink || '#'} className="inline-flex items-center gap-1 text-xs text-gray-700 font-normal hover:text-red-700 transition bg-transparent p-0 underline">
          Lihat detail <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
        <span className="mx-1 text-gray-300 text-lg font-light">|</span>
        <button onClick={onInquiry} className="inline-flex items-center gap-1 text-xs text-gray-700 font-normal hover:text-red-700 transition bg-transparent p-0 underline">
          Dapatkan Penawaran <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
