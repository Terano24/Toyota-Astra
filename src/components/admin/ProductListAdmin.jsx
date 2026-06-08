import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import ProductEditForm from './ProductEditForm';
import ProductAddForm from './ProductAddForm';
import { FiSearch, FiPlus, FiEdit3, FiTrash2 } from 'react-icons/fi';

const COLORS = {
  primary: '#DC2626', // Red-600
  primary_light: '#FEE2E2', // Red-100
  secondary: '#4B5563', // Gray-600
  background: '#F9FAFB', // Gray-50
  card_bg: '#FFFFFF',
  border: '#E5E7EB', // Gray-200
};

export default function ProductListAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const allTypes = products.reduce((acc, p) => {
      if (p.type) {
        acc.add(p.type);
      }
      return acc;
    }, new Set());
    const sortedTypes = Array.from(allTypes).sort();
    return ['ALL', ...sortedTypes];
  }, [products]);

  const filteredAndGroupedProducts = useMemo(() => {
    const filteredByCategory =
      selectedCategory === 'ALL'
        ? products
        : products.filter(p => p.type === selectedCategory);

    const filtered = filteredByCategory.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.reduce((acc, product) => {
      const type = product.type || 'Uncategorized';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(product);
      return acc;
    }, {});
  }, [products, searchQuery, selectedCategory]);

  // Remove product handler
  const handleRemove = async (productId) => {
    if (window.confirm('Yakin ingin menghapus produk ini?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        setProducts(products => products.filter(p => p.id !== productId));
      } catch (err) {
        alert('Gagal menghapus produk. Silakan coba lagi.');
        console.error(err);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.primary }}></div>
    </div>
  );

  return (
    <div className="min-h-screen w-full p-4 md:p-6" style={{ backgroundColor: COLORS.background }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>Kelola Produk</h1>
          <button
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg shadow-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors"
            style={{ backgroundColor: COLORS.primary }}
            onClick={() => setShowAddForm(true)}
          >
            <FiPlus size={18} />
            <span>Tambah Produk</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari mobil..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2"
            style={{
              borderColor: COLORS.border,
              backgroundColor: COLORS.card_bg,
              color: COLORS.secondary,
              '--tw-ring-color': COLORS.primary,
            }}
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-row overflow-x-auto gap-2 pb-4 mb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
              style={{
                backgroundColor: selectedCategory === cat ? COLORS.primary : COLORS.card_bg,
                borderColor: selectedCategory === cat ? COLORS.primary : COLORS.border,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {showAddForm && (
          <div className="mb-8">
            <ProductAddForm
              onClose={() => setShowAddForm(false)}
              onProductAdded={() => {
                setShowAddForm(false);
                fetchProducts();
              }}
            />
          </div>
        )}

        {editingProduct && (
          <ProductEditForm
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onProductUpdated={() => {
              setEditingProduct(null);
              fetchProducts();
            }}
          />
        )}

        {Object.keys(filteredAndGroupedProducts).length === 0 && !loading ? (
          <div className="text-center py-12 px-4 bg-white rounded-lg shadow-sm">
            <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Tidak Ada Hasil</h3>
            <p className="mt-1 text-sm text-gray-500">Tidak ada produk yang cocok dengan pencarian Anda.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredAndGroupedProducts).map(([type, productsOfType]) => (
              <div key={type}>
                <h2 className="text-xl font-bold tracking-wide mb-4" style={{ color: COLORS.secondary }}>
                  {type.toUpperCase()} <span className="font-normal text-gray-400">({productsOfType.length})</span>
                </h2>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border" style={{ borderColor: COLORS.border }}>
                  <ul className="divide-y" style={{ borderColor: COLORS.border }}>
                    {productsOfType.map((product, index) => (
                      <li
                        key={product.id}
                        className="p-4 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4"
                        style={{ backgroundColor: index % 2 === 0 ? COLORS.card_bg : COLORS.background }}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <img 
                            src={product.imageUrl || 'https://via.placeholder.com/150'}
                            alt={product.name}
                            className="w-24 h-16 object-contain rounded-md bg-gray-100"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                          />
                          <div className="flex-1">
                            <p className="font-bold text-lg" style={{ color: '#111827' }}>{product.name}</p>
                            <p className="font-semibold text-md" style={{ color: COLORS.primary }}>{product.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                            title="Edit"
                          >
                            <FiEdit3 size={18} style={{ color: COLORS.secondary }} />
                          </button>
                          <button
                            onClick={() => handleRemove(product.id)}
                            className="p-2 rounded-full hover:bg-red-100 transition-colors"
                            title="Remove"
                          >
                            <FiTrash2 size={18} style={{ color: COLORS.primary }} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
