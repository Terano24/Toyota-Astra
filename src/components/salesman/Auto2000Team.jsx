import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';

const COLORS = {
  primary: '#dc2626',
  primaryHover: '#b91c1c',
  secondary: '#f3f4f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  white: '#ffffff',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray800: '#1f2937',
  gray900: '#111827'
};

const Auto2000Team = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSalesman, setSelectedSalesman] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch salesmen data
  useEffect(() => {
    const unsubscribeSalesmen = onSnapshot(collection(db, 'salesmen'), (snapshot) => {
      const salesmenData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Show all salesmen (removed isActive filter)
        salesmenData.push({ id: doc.id, ...data });
      });
      // Sort by creation date or name
      salesmenData.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return (a.firstName || '').localeCompare(b.firstName || '');
      });
      setSalesmen(salesmenData);
      setLoading(false);
    });

    return () => {
      unsubscribeSalesmen();
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak diketahui';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Tidak diketahui';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }}></div>
      </div>
    );
  }

  const showSalesmanDetail = (salesman) => {
    setSelectedSalesman(salesman);
    setShowDetailModal(true);
  };

  const formatWhatsAppNumber = (phoneNumber) => {
    if (!phoneNumber) return null;
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    // If starts with 0, replace with 62 (Indonesia country code)
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    // If doesn't start with 62, add it
    if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  };

  return (
    <div className="p-4 md:p-6" style={{ backgroundColor: COLORS.gray100, minHeight: '100vh' }}>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4">
          {/* Header Text */}
          <div className="text-left">
            <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2" style={{ color: COLORS.gray900 }}>
              Tim Sales Auto2000
            </h1>
            <p className="text-sm md:text-lg" style={{ color: COLORS.gray600 }}>
              Kenali tim sales profesional kami
            </p>
          </div>
          
          {/* Team Stats */}
          <div className="flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 border" style={{ borderColor: COLORS.gray200 }}>
              <div className="flex items-center">
                <div className="p-3 rounded-full" style={{ backgroundColor: COLORS.primary }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold" style={{ color: COLORS.gray900 }}>{salesmen.length}</p>
                  <p className="text-sm" style={{ color: COLORS.gray600 }}>Total Tim Sales</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-4">
        {salesmen.map((salesman) => (
          <div 
            key={salesman.id} 
            className="bg-white rounded-lg shadow-sm relative overflow-hidden transform transition-all duration-300 hover:shadow-md hover:scale-[1.01] min-h-[100px]"
          >
            {/* Red border on top only */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: COLORS.primary }}
            ></div>
            
            <div className="p-6">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-4">
                  {salesman.photoURL ? (
                    <img 
                      src={salesman.photoURL} 
                      alt={`${salesman.firstName} ${salesman.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: COLORS.gray500 }}
                    >
                      {salesman.firstName?.[0]}{salesman.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: COLORS.gray900 }}>
                      {salesman.firstName} {salesman.lastName}
                    </h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Aktif
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => showSalesmanDetail(salesman)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95"
                  style={{ 
                    backgroundColor: COLORS.primary,
                    color: COLORS.white
                  }}
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View: Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salesmen.map((salesman) => (
          <div 
            key={salesman.id} 
            className="bg-white rounded-lg shadow-sm relative overflow-hidden transform transition-all duration-300 hover:shadow-md hover:scale-[1.01] min-h-[120px]"
          >
            {/* Red border on top only */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: COLORS.primary }}
            ></div>
            
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {salesman.photoURL ? (
                    <img 
                      src={salesman.photoURL} 
                      alt={`${salesman.firstName} ${salesman.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: COLORS.gray500 }}
                    >
                      {salesman.firstName?.[0]}{salesman.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold" style={{ color: COLORS.gray900 }}>
                      {salesman.firstName} {salesman.lastName}
                    </h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Aktif
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => showSalesmanDetail(salesman)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95"
                  style={{ 
                    backgroundColor: COLORS.primary,
                    color: COLORS.white
                  }}
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {salesmen.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.gray200 }}>
            <svg className="w-12 h-12" style={{ color: COLORS.gray500 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: COLORS.gray900 }}>
            Belum Ada Tim Sales
          </h3>
          <p style={{ color: COLORS.gray600 }}>
            Saat ini belum ada sales yang aktif di sistem.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSalesman && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: COLORS.gray900 }}>
                  Detail Sales
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  {selectedSalesman.photoURL ? (
                    <img 
                      src={selectedSalesman.photoURL} 
                      alt={`${selectedSalesman.firstName} ${selectedSalesman.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-xl"
                      style={{ backgroundColor: COLORS.gray500 }}
                    >
                      {selectedSalesman.firstName?.[0]}{selectedSalesman.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: COLORS.gray900 }}>
                      {selectedSalesman.firstName} {selectedSalesman.lastName}
                    </h3>
                    <p style={{ color: COLORS.gray600 }}>
                      {selectedSalesman.email}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: COLORS.gray900 }}>
                    Informasi Kontak
                  </h4>
                  <p><strong>Telepon:</strong> {selectedSalesman.contactNumber}</p>
                  <p><strong>Alamat:</strong> {selectedSalesman.address}</p>
                  <p><strong>Bergabung:</strong> {formatDate(selectedSalesman.createdAt)}</p>
                </div>

                {/* Status */}
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: COLORS.gray900 }}>
                    Status
                  </h4>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Tim Sales
                  </span>
                </div>

                {/* WhatsApp Button */}
                {selectedSalesman.contactNumber && (
                  <div className="pt-4">
                    <a
                      href={`https://wa.me/${formatWhatsAppNumber(selectedSalesman.contactNumber)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-md"
                      style={{ backgroundColor: '#25D366', color: 'white' }}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      Chat di WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auto2000Team;
