import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import InquiryModal from "../common/InquiryModal";

const CAR_TYPES = [
  { key: 'ALL', label: 'All' },
  { key: 'SUV', label: 'SUV' },
  { key: 'HATCHBACK', label: 'HATCHBACK' },
  { key: 'MPV', label: 'MPV' },
  { key: 'SEDAN', label: 'SEDAN' },
];

export default function Product() {
  const [products, setProducts] = useState([]);
  const [selectedType, setSelectedType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const querySnapshot = await getDocs(collection(db, 'products'));
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [carInterestPrefill, setCarInterestPrefill] = useState("");

  const filteredProducts = selectedType === 'ALL'
    ? products
    : products.filter(product => product.type === selectedType);

  const handleInquiryClick = (product) => {
    setCarInterestPrefill(product.name);
    setInquiryOpen(true);
  };

  return (
    <div className="min-h-screen bg-white p-0 relative">
      <InquiryModal
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        carInterestPrefill={carInterestPrefill}
      />
      {/* Car Type Filters */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex space-x-8 px-8 pt-6">
          {CAR_TYPES.map(type => (
            <button
              key={type.key}
              className={`pb-3 text-base font-semibold text-gray-800 border-b-2 ${selectedType === type.key ? 'border-red-500 text-red-600' : 'border-transparent hover:border-red-500 hover:text-red-600'} focus:outline-none`}
              onClick={() => setSelectedType(type.key)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
      {/* Product List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-10 text-gray-700">Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-700">No products found.</div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-start">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md w-64 flex-shrink-0 border border-gray-100 hover:shadow-lg transition flex flex-col h-full"
              >
                <div className="p-4 flex-1 flex flex-col items-center">
                  <div className="w-full h-32 flex items-center justify-center mb-3 overflow-hidden">
                    <img
                      src={product.imageUrl || ""}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="font-bold text-base text-gray-800 mb-2 text-center">{product.name}</div>
                </div>
                <div className="bg-gray-50 px-4 py-3 rounded-b-lg text-center flex flex-col gap-2">
                  <span className="text-red-600 font-bold text-lg">{product.price}</span>
                  <button
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    onClick={() => handleInquiryClick(product)}
                  >
                    Inquiry
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
