import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { FaTimes } from 'react-icons/fa';

const parsePrice = (priceString) => {
  if (!priceString || typeof priceString !== 'string') return 0;
  return parseInt(priceString.replace(/[^0-9]/g, ''), 10);
};

const formatPrice = (price) => {
    if (price >= 1_000_000_000) {
        return `Rp${(price / 1_000_000_000).toFixed(2)} M`;
    }
    return `Rp${(price / 1_000_000).toFixed(0)} Jt`;
};

const FilterModal = ({ isOpen, onClose, onApply, onReset, products, initialFilters }) => {
  const [minPossiblePrice, maxPossiblePrice] = React.useMemo(() => {
    if (!products || products.length === 0) return [0, 3000000000];
    const prices = products.map(p => parsePrice(p.price)).filter(p => p > 0);
    if (prices.length === 0) return [0, 3000000000];
    return [Math.min(...prices), Math.max(...prices)];
  }, [products]);

  const [sortOrder, setSortOrder] = useState(initialFilters.sortOrder || 'default');
  const [priceRange, setPriceRange] = useState([minPossiblePrice, maxPossiblePrice]);

  useEffect(() => {
    if (isOpen) {
        setSortOrder(initialFilters.sortOrder || 'default');
        // Only use initialFilters.priceRange if it's explicitly set and not null
        if (initialFilters.priceRange && initialFilters.priceRange[0] !== minPossiblePrice && initialFilters.priceRange[1] !== maxPossiblePrice) {
          setPriceRange(initialFilters.priceRange);
        } else {
          setPriceRange([minPossiblePrice, maxPossiblePrice]);
        }
    }
  }, [isOpen, initialFilters, minPossiblePrice, maxPossiblePrice]);

  // Update price range when products change (only if not explicitly set by filters)
  useEffect(() => {
    if (minPossiblePrice !== 0 && maxPossiblePrice !== 3000000000) {
      setPriceRange([minPossiblePrice, maxPossiblePrice]);
    }
  }, [minPossiblePrice, maxPossiblePrice]);

  const handleApply = () => {
    onApply({ sortOrder, priceRange });
  };

  const handleReset = () => {
    setSortOrder('default');
    setPriceRange([minPossiblePrice, maxPossiblePrice]);
    onReset();
  };

  const sortOptions = [
    { value: 'default', label: 'Paling Sesuai' },
    { value: 'price-asc', label: 'Harga Terendah' },
    { value: 'price-desc', label: 'Harga Tertinggi' },
    { value: 'az', label: 'Nama A-Z' },
    { value: 'za', label: 'Nama Z-A' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 bg-white z-[150] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">Filter Pencarian</h2>
            <button onClick={onClose} className="p-2">
              <FaTimes size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-grow p-4 overflow-y-auto space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Urutkan</h3>
              <div className="space-y-2">
                  {sortOptions.map(opt => (
                      <button key={opt.value} onClick={() => setSortOrder(opt.value)} className={`w-full text-left p-3 rounded-lg ${sortOrder === opt.value ? 'bg-red-100 text-red-700 font-semibold' : 'hover:bg-gray-100'}`}>
                          {opt.label}
                      </button>
                  ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-lg mb-3">Kisaran Harga</h3>
              <div className="px-2 pt-4">
                <Slider
                  range
                  min={minPossiblePrice}
                  max={maxPossiblePrice}
                  step={10000000} 
                  value={priceRange}
                  onChange={setPriceRange}
                  trackStyle={[{ backgroundColor: '#DC2626' }]}
                  handleStyle={[{ borderColor: '#DC2626', backgroundColor: 'white', borderWidth: 2 }, { borderColor: '#DC2626', backgroundColor: 'white', borderWidth: 2 }]}
                  railStyle={{ backgroundColor: '#E5E7EB' }}
                />
                <div className="flex justify-between mt-3 text-sm font-medium">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 flex items-center gap-4">
            <button onClick={handleReset} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-center font-semibold">
              Reset
            </button>
            <button onClick={handleApply} className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white text-center font-semibold">
              Terapkan Filter
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterModal;
