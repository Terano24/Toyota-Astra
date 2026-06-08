import React from 'react';

export default function EnhancedVarietyButton({ selectedCarType, onClick, className = "" }) {
  return (
    <button 
      onClick={onClick} 
      className={`group bg-white text-red-600 font-semibold py-3 px-8 rounded-lg border-2 border-red-600 hover:bg-red-600 hover:text-white active:bg-red-700 active:border-red-700 transition-all duration-300 shadow-md hover:shadow-lg inline-flex items-center justify-center gap-4 mx-auto ${className}`}
    >
      <span>{selectedCarType ? selectedCarType.name : 'Pilih Tipe'}</span>
      <svg 
        className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
