import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const FilterModal = ({ isOpen, onClose, onApplyFilters, initialFilters, salesmanNames = {}, userRole = null, onSalesmanDashboard = false }) => {
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters, isOpen]);

  if (!isOpen) return null;

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const renderButton = (type, value, text) => (
    <button 
      onClick={() => handleFilterChange(type, value)}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${filters[type] === value ? 'bg-red-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
    >
      {text}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Filter Prospek</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 text-gray-600">Status</h4>
            <div className="flex flex-wrap gap-2">
              {renderButton('status', 'all', 'Semua')}
              {renderButton('status', 'sudah-follow-up', 'Sudah Follow-Up')}
              {renderButton('status', 'belum-follow-up', 'Belum Follow-Up')}
            </div>
          </div>

          {/* Salesmen Filter - Only for Admin on Admin Dashboard */}
          {userRole === 'admin' && !onSalesmanDashboard && (
            <div>
              <h4 className="font-semibold mb-3 text-gray-600">Filter Sales</h4>
              <div className="max-h-32 overflow-y-auto">
                <div className="flex flex-wrap gap-2 mb-2">
                  {renderButton('salesman', 'all', 'Semua Sales')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(salesmanNames).map(([salesmanId, salesmanName]) => (
                    <button
                      key={salesmanId}
                      onClick={() => handleFilterChange('salesman', salesmanId)}
                      className={`px-3 py-2 rounded-full text-xs font-semibold transition-colors duration-200 ${
                        filters.salesman === salesmanId 
                          ? 'bg-red-600 text-white shadow-md' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {salesmanName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-3 text-gray-600">Urutkan Berdasarkan</h4>
            <div className="flex flex-wrap gap-2">
              {renderButton('timeline', 'terbaru', 'Terbaru')}
              {renderButton('timeline', 'terlama', 'Terlama')}
                            {renderButton('timeline', 'hot', 'Hot')}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button onClick={handleApply} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105">
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
