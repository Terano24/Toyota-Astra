import React, { useState } from 'react';
import CarCardCarousel from '../common/CarCardCarousel';

const GRADES = [
  {
    id: 'L',
    name: 'L',
    imageUrl: 'https://www.toyota.com/imgix/responsive/images/mlp/colorizer/2023/corollacross/1L7/1.png',
    price: 24135,
    priceNote: 'Base MSRP',
    mpg: '31/33',
    mpgNote: 'Est. MPG*',
    features: [
      'LED projector low- and high-beam headlights with Automatic High Beams (AHB)*',
      'Rear-seat vents',
      'Audio with 8-in. touchscreen and six speakers',
    ],
    seeMoreLink: '#',
    buildLink: '#',
  },
  {
    id: 'LE',
    name: 'LE',
    imageUrl: 'https://www.toyota.com/imgix/responsive/images/mlp/colorizer/2023/corollacross/3R3/1.png',
    price: 26465,
    priceNote: 'Base MSRP',
    mpg: '31/33',
    mpgNote: 'Est. MPG*',
    features: [
      'Qi wireless charging*',
      'Audio with 8-in. touchscreen and six speakers',
      'Blind Spot Monitor (BSM)* with Rear Cross-Traffic Alert (RCTA)*',
    ],
    seeMoreLink: '#',
    buildLink: '#',
  },
  {
    id: 'XLE',
    name: 'XLE',
    imageUrl: 'https://www.toyota.com/imgix/responsive/images/mlp/colorizer/2023/corollacross/1K3/1.png',
    price: 28460,
    priceNote: 'Base MSRP',
    mpg: '31/33',
    mpgNote: 'Est. MPG*',
    features: [
      '18-in. alloy wheels with black-painted machined finish',
      '7-in. digital gauge cluster',
      'SofTex®-trimmed seats',
    ],
    seeMoreLink: '#',
    buildLink: '#',
  },
  {
    id: 'Hybrid S',
    name: 'Hybrid S',
    imageUrl: 'https://www.toyota.com/imgix/responsive/images/mlp/colorizer/2023/corollacross/1L7/1.png',
    price: 28495,
    priceNote: 'Base MSRP',
    mpg: '45/38',
    mpgNote: 'Est. MPG*',
    features: [
      'Sport styling with sport front grille, front/rear bumpers, and smoked front Toyota emblem with all-black badging including AWD badge',
      'Metal-look heated power outside mirrors',
      '4.2-in. Multi-Information Display (MID)',
    ],
    seeMoreLink: '#',
    buildLink: '#',
  },
  {
    id: 'Hybrid SE',
    name: 'Hybrid SE',
    imageUrl: 'https://www.toyota.com/imgix/responsive/images/mlp/colorizer/2023/corollacross/8W7/1.png',
    price: 29815,
    priceNote: 'Base MSRP',
    mpg: '45/38',
    mpgNote: 'Est. MPG*',
    features: [
      'Qi wireless charging*',
      'Audio with 8-in. touchscreen and six speakers',
      'Blind Spot Monitor (BSM)* with Rear Cross-Traffic Alert (RCTA)*',
    ],
    seeMoreLink: '#',
    buildLink: '#',
  },
];

export default function CorollaCrossShowcase() {
  const [tab, setTab] = useState('Gas');
  // For demo, all grades shown. In real, filter by tab.
  return (
    <section className="w-full bg-white py-12 px-2 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-1 tracking-tight" style={{fontFamily:'Montserrat, sans-serif'}}>
          Discover Your Corolla Cross
        </h2>
        <div className="text-lg text-center text-gray-700 mb-6">7 unique grades to choose from</div>
        <div className="flex justify-center items-center gap-2 mb-8">
          <button
            className={`px-4 py-1 rounded-full text-sm font-medium border-b-2 transition-colors ${tab==='Gas' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
            onClick={()=>setTab('Gas')}
          >Gas (2)</button>
          <button
            className={`px-4 py-1 rounded-full text-sm font-medium border-b-2 transition-colors ${tab==='Electricity' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
            onClick={()=>setTab('Electricity')}
          >Electricity (4)</button>
        </div>
        <div className="relative">
          <CarCardCarousel cars={GRADES} divider />
        </div>
      </div>
    </section>
  );
}
